import type {
  AnimationFrame,
  FrameHistory,
  Tool,
  PaletteDef,
  OnionSkinSettings,
  Layer,
} from "./types";
import { PixelBitmap, pixelGridToBitmap } from "./pixel-bitmap";
import { makeId } from "./drawing";

const DB_NAME = "pixel-art-editor";
const DB_VERSION = 2;
const STORE_NAME = "projects";
const PROJECT_KEY = "current";
const PALETTES_KEY = "custom-palettes";

export interface ProjectState {
  canvasWidth: number;
  canvasHeight: number;
  frames: AnimationFrame[];
  frameHistories: Record<string, FrameHistory>;
  currentFrameIndex: number;
  activeLayerIndex: number;
  color: string;
  tool: Tool;
  zoom: number;
  showGrid: boolean;
  mirror: boolean;
  animateMode: boolean;
  fps: number;
  loop: boolean;
  onionSkin: OnionSkinSettings;
  brushSize: number;
  recentColors: string[];
  activePalette: string;
  savedAt: number;
}

// Serialized form for IndexedDB (PixelBitmap -> JSON)
interface SerializedLayer {
  id: string;
  name: string;
  pixels: { w: number; h: number; d: string };
  visible: boolean;
  opacity: number;
}

interface SerializedState {
  canvasWidth: number;
  canvasHeight: number;
  frames: { id: string; layers: SerializedLayer[] }[];
  frameHistories: Record<string, { undo: SerializedLayer[][]; redo: SerializedLayer[][] }>;
  currentFrameIndex: number;
  activeLayerIndex: number;
  color: string;
  tool: Tool;
  zoom: number;
  showGrid: boolean;
  mirror: boolean;
  animateMode: boolean;
  fps: number;
  loop: boolean;
  onionSkin: OnionSkinSettings;
  brushSize: number;
  recentColors: string[];
  activePalette: string;
  savedAt: number;
  _version: 3;
}

// V1 schema for migration
interface V1ProjectState {
  frames: { id: string; pixels: (string | null)[][] }[];
  frameHistories: Record<string, { undo: (string | null)[][][]; redo: (string | null)[][][] }>;
  currentFrameIndex: number;
  color: string;
  tool: Tool;
  zoom: number;
  showGrid: boolean;
  mirror: boolean;
  animateMode: boolean;
  fps: number;
  loop: boolean;
  onionSkin: boolean;
  savedAt: number;
}

// V2 schema (PixelGrid-based layers, stored as raw arrays)
interface V2Layer {
  id: string;
  name: string;
  pixels: (string | null)[][];
  visible: boolean;
  opacity: number;
}

function serializeLayer(l: Layer): SerializedLayer {
  return {
    id: l.id,
    name: l.name,
    pixels: l.pixels.toJSON(),
    visible: l.visible,
    opacity: l.opacity,
  };
}

function deserializeLayer(s: SerializedLayer): Layer {
  return {
    id: s.id,
    name: s.name,
    pixels: PixelBitmap.fromJSON(s.pixels),
    visible: s.visible,
    opacity: s.opacity,
  };
}

function serializeState(state: ProjectState): SerializedState {
  return {
    ...state,
    frames: state.frames.map((f) => ({
      id: f.id,
      layers: f.layers.map(serializeLayer),
    })),
    frameHistories: Object.fromEntries(
      Object.entries(state.frameHistories).map(([fid, fh]) => [
        fid,
        {
          undo: fh.undo.map((ls) => ls.map(serializeLayer)),
          redo: fh.redo.map((ls) => ls.map(serializeLayer)),
        },
      ])
    ),
    _version: 3,
  };
}

function deserializeState(s: SerializedState): ProjectState {
  return {
    canvasWidth: s.canvasWidth,
    canvasHeight: s.canvasHeight,
    frames: s.frames.map((f) => ({
      id: f.id,
      layers: f.layers.map(deserializeLayer),
    })),
    frameHistories: Object.fromEntries(
      Object.entries(s.frameHistories).map(([fid, fh]) => [
        fid,
        {
          undo: fh.undo.map((ls) => ls.map(deserializeLayer)),
          redo: fh.redo.map((ls) => ls.map(deserializeLayer)),
        },
      ])
    ),
    currentFrameIndex: s.currentFrameIndex,
    activeLayerIndex: s.activeLayerIndex,
    color: s.color,
    tool: s.tool,
    zoom: s.zoom,
    showGrid: s.showGrid,
    mirror: s.mirror,
    animateMode: s.animateMode,
    fps: s.fps,
    loop: s.loop,
    onionSkin: s.onionSkin,
    brushSize: s.brushSize,
    recentColors: s.recentColors,
    activePalette: s.activePalette,
    savedAt: s.savedAt,
  };
}

function migrateV2LayerToV3(v2: V2Layer, w: number, h: number): Layer {
  return {
    id: v2.id,
    name: v2.name,
    pixels: pixelGridToBitmap(v2.pixels, w, h),
    visible: v2.visible,
    opacity: v2.opacity,
  };
}

function migrateV1toV2Layers(pixels: (string | null)[][]): V2Layer[] {
  return [
    { id: makeId(), name: "Layer 1", pixels, visible: true, opacity: 100 },
  ];
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest
): Promise<unknown> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const req = fn(store);
        req.onsuccess = () => {
          resolve(req.result);
          db.close();
        };
        req.onerror = () => {
          reject(req.error);
          db.close();
        };
      })
  );
}

export async function saveProject(state: ProjectState): Promise<void> {
  const serialized = serializeState(state);
  await withStore("readwrite", (store) => store.put(serialized, PROJECT_KEY));
}

export async function loadProject(): Promise<ProjectState | null> {
  const result = await withStore("readonly", (store) =>
    store.get(PROJECT_KEY)
  );
  if (!result) return null;

  const data = result as Record<string, unknown>;

  // V3 format (serialized PixelBitmap)
  if (data._version === 3) {
    return deserializeState(data as unknown as SerializedState);
  }

  const frames = data.frames as Array<Record<string, unknown>>;

  // V1: frames[0].pixels exists but no layers
  if (frames?.[0] && "pixels" in frames[0] && !("layers" in frames[0])) {
    const v1 = data as unknown as V1ProjectState;
    const w = v1.frames[0]?.pixels[0]?.length ?? 64;
    const h = v1.frames[0]?.pixels.length ?? 64;

    const v2Frames = v1.frames.map((f) => ({
      id: f.id,
      layers: migrateV1toV2Layers(f.pixels),
    }));

    // Now migrate V2 layers to V3
    const migrated: ProjectState = {
      canvasWidth: w,
      canvasHeight: h,
      frames: v2Frames.map((f) => ({
        id: f.id,
        layers: f.layers.map((l) => migrateV2LayerToV3(l, w, h)),
      })),
      frameHistories: Object.fromEntries(
        Object.entries(v1.frameHistories).map(([fid, fh]) => [
          fid,
          {
            undo: fh.undo.map((px) =>
              migrateV1toV2Layers(px).map((l) => migrateV2LayerToV3(l, w, h))
            ),
            redo: fh.redo.map((px) =>
              migrateV1toV2Layers(px).map((l) => migrateV2LayerToV3(l, w, h))
            ),
          },
        ])
      ),
      currentFrameIndex: v1.currentFrameIndex,
      activeLayerIndex: 0,
      color: v1.color,
      tool: v1.tool,
      zoom: v1.zoom,
      showGrid: v1.showGrid,
      mirror: v1.mirror,
      animateMode: v1.animateMode,
      fps: v1.fps,
      loop: v1.loop,
      onionSkin: {
        enabled: v1.onionSkin,
        prevCount: 1,
        nextCount: 0,
        prevOpacity: 15,
        nextOpacity: 15,
      },
      brushSize: 1,
      recentColors: [],
      activePalette: "Manas",
      savedAt: v1.savedAt,
    };
    await saveProject(migrated);
    return migrated;
  }

  // V2: has layers with array-based pixels (not serialized PixelBitmap)
  if (frames?.[0] && "layers" in frames[0]) {
    const v2 = data as {
      canvasWidth: number;
      canvasHeight: number;
      frames: { id: string; layers: V2Layer[] }[];
      frameHistories: Record<string, { undo: V2Layer[][]; redo: V2Layer[][] }>;
      currentFrameIndex: number;
      activeLayerIndex: number;
      color: string;
      tool: Tool;
      zoom: number;
      showGrid: boolean;
      mirror: boolean;
      animateMode: boolean;
      fps: number;
      loop: boolean;
      onionSkin: OnionSkinSettings;
      brushSize: number;
      recentColors: string[];
      activePalette: string;
      savedAt: number;
    };

    const w = v2.canvasWidth;
    const h = v2.canvasHeight;

    const migrated: ProjectState = {
      ...v2,
      frames: v2.frames.map((f) => ({
        id: f.id,
        layers: f.layers.map((l) => migrateV2LayerToV3(l, w, h)),
      })),
      frameHistories: Object.fromEntries(
        Object.entries(v2.frameHistories).map(([fid, fh]) => [
          fid,
          {
            undo: fh.undo.map((ls) =>
              ls.map((l) => migrateV2LayerToV3(l, w, h))
            ),
            redo: fh.redo.map((ls) =>
              ls.map((l) => migrateV2LayerToV3(l, w, h))
            ),
          },
        ])
      ),
    };
    await saveProject(migrated);
    return migrated;
  }

  return null;
}

export async function deleteProject(): Promise<void> {
  await withStore("readwrite", (store) => store.delete(PROJECT_KEY));
}

export async function saveCustomPalettes(
  palettes: PaletteDef[]
): Promise<void> {
  await withStore("readwrite", (store) =>
    store.put(palettes, PALETTES_KEY)
  );
}

export async function loadCustomPalettes(): Promise<PaletteDef[]> {
  const result = await withStore("readonly", (store) =>
    store.get(PALETTES_KEY)
  );
  return (result as PaletteDef[]) ?? [];
}
