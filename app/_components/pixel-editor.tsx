"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { DEFAULT_SIZE } from "../_lib/constants";
import { generateManasSprite } from "../_lib/manas-sprite";
import { encodeGif } from "../_lib/gif-encoder";
import { S } from "../_lib/styles";
import { useProjectStorage } from "../_lib/use-project-storage";
import { makeId, flattenLayers } from "../_lib/drawing";
import { PixelBitmap } from "../_lib/pixel-bitmap";
import type {
  Tool,
  ExportData,
  AnimationFrame,
  FrameHistory,
  Layer,
  Selection,
  OnionSkinSettings,
} from "../_lib/types";
import { Sidebar } from "./sidebar";
import { CanvasArea } from "./canvas-area";
import { ExportOverlay } from "./export-overlay";
import { TimelinePanel } from "./timeline-panel";
import { LayersPanel } from "./layers-panel";
import { CanvasSizeDialog } from "./canvas-size-dialog";
import { ShortcutsPanel } from "./shortcuts-panel";
import { Tip } from "./tip";

function cloneLayers(layers: Layer[]): Layer[] {
  return layers.map((l) => ({ ...l, pixels: l.pixels.clone() }));
}

function makeLayer(name: string, w: number, h: number): Layer {
  return {
    id: makeId(),
    name,
    pixels: PixelBitmap.empty(w, h),
    visible: true,
    opacity: 100,
  };
}

export function PixelEditor() {
  // -- Canvas size --
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_SIZE);
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_SIZE);
  const [showSizeDialog, setShowSizeDialog] = useState(false);

  // -- Animation state --
  const [animateMode, setAnimateMode] = useState(false);
  const [frames, setFrames] = useState<AnimationFrame[]>(() => {
    const layerId = makeId();
    return [
      {
        id: makeId(),
        layers: [
          {
            id: layerId,
            name: "Layer 1",
            pixels: generateManasSprite(),
            visible: true,
            opacity: 100,
          },
        ],
      },
    ];
  });
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [fps, setFps] = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [onionSkin, setOnionSkin] = useState<OnionSkinSettings>({
    enabled: false,
    prevCount: 1,
    nextCount: 0,
    prevOpacity: 15,
    nextOpacity: 15,
  });

  // -- Per-frame history (stores full layer stacks) --
  const [frameHistories, setFrameHistories] = useState<
    Record<string, FrameHistory>
  >(() => ({ [frames[0].id]: { undo: [], redo: [] } }));

  // -- Editor state --
  const [color, setColor] = useState("#c4956a");
  const [tool, setTool] = useState<Tool>("pen");
  const [zoom, setZoom] = useState(9);
  const [showGrid, setShowGrid] = useState(true);
  const [mirror, setMirror] = useState(false);
  const [brushSize, setBrushSize] = useState(1);
  const [shapeFilled, setShapeFilled] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [activePalette, setActivePalette] = useState("Manas");
  const [showShortcuts, setShowShortcuts] = useState(false);

  // -- State version counter for change detection in persistence --
  const [stateVersion, setStateVersion] = useState(0);
  const bumpVersion = useCallback(() => setStateVersion((v) => v + 1), []);

  // -- Persistence --
  const stateForStorage = useMemo(
    () => ({
      canvasWidth,
      canvasHeight,
      frames,
      frameHistories,
      currentFrameIndex,
      activeLayerIndex,
      color,
      tool,
      zoom,
      showGrid,
      mirror,
      animateMode,
      fps,
      loop,
      onionSkin,
      brushSize,
      recentColors,
      activePalette,
    }),
    [
      canvasWidth,
      canvasHeight,
      frames,
      frameHistories,
      currentFrameIndex,
      activeLayerIndex,
      color,
      tool,
      zoom,
      showGrid,
      mirror,
      animateMode,
      fps,
      loop,
      onionSkin,
      brushSize,
      recentColors,
      activePalette,
    ]
  );

  const { isSaving, isLoading, loadedState } =
    useProjectStorage(stateForStorage, stateVersion);

  // Restore saved state on mount
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current || isLoading || !loadedState) return;
    restoredRef.current = true;
    setCanvasWidth(loadedState.canvasWidth);
    setCanvasHeight(loadedState.canvasHeight);
    setFrames(loadedState.frames);
    setFrameHistories(loadedState.frameHistories);
    setCurrentFrameIndex(loadedState.currentFrameIndex);
    setActiveLayerIndex(loadedState.activeLayerIndex);
    setColor(loadedState.color);
    setTool(loadedState.tool);
    setZoom(loadedState.zoom);
    setShowGrid(loadedState.showGrid);
    setMirror(loadedState.mirror);
    setAnimateMode(loadedState.animateMode);
    setFps(loadedState.fps);
    setLoop(loadedState.loop);
    setOnionSkin(loadedState.onionSkin);
    setBrushSize(loadedState.brushSize);
    setRecentColors(loadedState.recentColors ?? []);
    setActivePalette(loadedState.activePalette ?? "Manas");
  }, [isLoading, loadedState]);

  // -- Derived state --
  const currentFrame = frames[currentFrameIndex];
  const layers = currentFrame.layers;
  const safeLayerIndex = Math.min(activeLayerIndex, layers.length - 1);
  const activeLayer = layers[safeLayerIndex];
  const history = frameHistories[currentFrame.id] ?? { undo: [], redo: [] };

  // Flattened pixels for display
  const flatPixels = useMemo(
    () => flattenLayers(layers, canvasWidth, canvasHeight),
    [layers, canvasWidth, canvasHeight]
  );

  // -- Track recent colors --
  const trackColor = useCallback(
    (c: string) => {
      setRecentColors((prev) => {
        const filtered = prev.filter((rc) => rc !== c);
        return [c, ...filtered].slice(0, 16);
      });
    },
    []
  );

  const handleColorChange = useCallback(
    (c: string) => {
      setColor(c);
      trackColor(c);
    },
    [trackColor]
  );

  // -- Layer pixel setters (update active layer in current frame) --
  const setActiveLayerPixels = useCallback(
    (newPixels: PixelBitmap) => {
      setFrames((prev) =>
        prev.map((f, i) =>
          i === currentFrameIndex
            ? {
                ...f,
                layers: f.layers.map((l, li) =>
                  li === safeLayerIndex ? { ...l, pixels: newPixels } : l
                ),
              }
            : f
        )
      );
      bumpVersion();
    },
    [currentFrameIndex, safeLayerIndex, bumpVersion]
  );

  const pushHistory = useCallback(() => {
    const fid = currentFrame.id;
    const currentLayers = currentFrame.layers;
    setFrameHistories((prev) => {
      const fh = prev[fid] ?? { undo: [], redo: [] };
      return {
        ...prev,
        [fid]: {
          undo: [...fh.undo.slice(-40), cloneLayers(currentLayers)],
          redo: [],
        },
      };
    });
    bumpVersion();
  }, [currentFrame, bumpVersion]);

  const undo = useCallback(() => {
    const fid = currentFrame.id;
    const fh = frameHistories[fid];
    if (!fh || !fh.undo.length) return;
    const prev = fh.undo[fh.undo.length - 1];
    setFrameHistories((h) => ({
      ...h,
      [fid]: {
        undo: fh.undo.slice(0, -1),
        redo: [...fh.redo, cloneLayers(currentFrame.layers)],
      },
    }));
    setFrames((fs) =>
      fs.map((f, i) =>
        i === currentFrameIndex ? { ...f, layers: prev } : f
      )
    );
    bumpVersion();
  }, [currentFrame, frameHistories, currentFrameIndex, bumpVersion]);

  const redo = useCallback(() => {
    const fid = currentFrame.id;
    const fh = frameHistories[fid];
    if (!fh || !fh.redo.length) return;
    const next = fh.redo[fh.redo.length - 1];
    setFrameHistories((h) => ({
      ...h,
      [fid]: {
        undo: [...fh.undo, cloneLayers(currentFrame.layers)],
        redo: fh.redo.slice(0, -1),
      },
    }));
    setFrames((fs) =>
      fs.map((f, i) =>
        i === currentFrameIndex ? { ...f, layers: next } : f
      )
    );
    bumpVersion();
  }, [currentFrame, frameHistories, currentFrameIndex, bumpVersion]);

  const jumpToStart = useCallback(() => {
    const fid = currentFrame.id;
    const fh = frameHistories[fid];
    if (!fh || !fh.undo.length) return;
    const allFuture = [
      ...fh.undo.slice(1).map(cloneLayers),
      cloneLayers(currentFrame.layers),
      ...fh.redo.map(cloneLayers),
    ];
    setFrames((fs) =>
      fs.map((f, i) =>
        i === currentFrameIndex ? { ...f, layers: cloneLayers(fh.undo[0]) } : f
      )
    );
    setFrameHistories((h) => ({
      ...h,
      [fid]: { undo: [], redo: allFuture },
    }));
    bumpVersion();
  }, [currentFrame, frameHistories, currentFrameIndex, bumpVersion]);

  const jumpToEnd = useCallback(() => {
    const fid = currentFrame.id;
    const fh = frameHistories[fid];
    if (!fh || !fh.redo.length) return;
    const allPast = [
      ...fh.undo.map(cloneLayers),
      cloneLayers(currentFrame.layers),
      ...fh.redo.slice(0, -1).map(cloneLayers),
    ];
    const last = fh.redo[fh.redo.length - 1];
    setFrames((fs) =>
      fs.map((f, i) =>
        i === currentFrameIndex ? { ...f, layers: cloneLayers(last) } : f
      )
    );
    setFrameHistories((h) => ({
      ...h,
      [fid]: { undo: allPast, redo: [] },
    }));
    bumpVersion();
  }, [currentFrame, frameHistories, currentFrameIndex, bumpVersion]);

  const clear = useCallback(() => {
    pushHistory();
    setActiveLayerPixels(PixelBitmap.empty(canvasWidth, canvasHeight));
  }, [pushHistory, setActiveLayerPixels, canvasWidth, canvasHeight]);

  const reset = useCallback(() => {
    if (canvasWidth !== 64 || canvasHeight !== 64) return;
    pushHistory();
    setActiveLayerPixels(generateManasSprite());
  }, [pushHistory, setActiveLayerPixels, canvasWidth, canvasHeight]);

  // -- Layer operations --
  const addLayer = useCallback(() => {
    const newLayer = makeLayer(
      `Layer ${layers.length + 1}`,
      canvasWidth,
      canvasHeight
    );
    pushHistory();
    setFrames((prev) =>
      prev.map((f, i) =>
        i === currentFrameIndex
          ? { ...f, layers: [...f.layers, newLayer] }
          : f
      )
    );
    setActiveLayerIndex(layers.length);
  }, [layers.length, canvasWidth, canvasHeight, currentFrameIndex, pushHistory]);

  const deleteLayer = useCallback(
    (index: number) => {
      if (layers.length <= 1) return;
      pushHistory();
      setFrames((prev) =>
        prev.map((f, i) =>
          i === currentFrameIndex
            ? { ...f, layers: f.layers.filter((_, li) => li !== index) }
            : f
        )
      );
      setActiveLayerIndex((ai) =>
        ai >= index ? Math.max(0, ai - 1) : ai
      );
    },
    [layers.length, currentFrameIndex, pushHistory]
  );

  const duplicateLayer = useCallback(
    (index: number) => {
      const src = layers[index];
      const newLayer: Layer = {
        ...src,
        id: makeId(),
        name: src.name + " copy",
        pixels: src.pixels.clone(),
      };
      pushHistory();
      setFrames((prev) =>
        prev.map((f, i) => {
          if (i !== currentFrameIndex) return f;
          const next = [...f.layers];
          next.splice(index + 1, 0, newLayer);
          return { ...f, layers: next };
        })
      );
      setActiveLayerIndex(index + 1);
    },
    [layers, currentFrameIndex, pushHistory]
  );

  const moveLayer = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= layers.length) return;
      pushHistory();
      setFrames((prev) =>
        prev.map((f, i) => {
          if (i !== currentFrameIndex) return f;
          const next = [...f.layers];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { ...f, layers: next };
        })
      );
      setActiveLayerIndex(to);
    },
    [layers.length, currentFrameIndex, pushHistory]
  );

  const mergeLayerDown = useCallback(
    (index: number) => {
      if (index <= 0) return;
      const upper = layers[index];
      const lower = layers[index - 1];
      if (!upper.visible && !lower.visible) return;
      pushHistory();
      const merged = lower.pixels.clone();
      const len = canvasWidth * canvasHeight;
      for (let i = 0; i < len; i++) {
        const px = upper.pixels.data[i];
        if (px !== 0) {
          merged.data[i] = px;
        }
      }
      setFrames((prev) =>
        prev.map((f, i) => {
          if (i !== currentFrameIndex) return f;
          const next = f.layers
            .map((l, li) =>
              li === index - 1 ? { ...l, pixels: merged } : l
            )
            .filter((_, li) => li !== index);
          return { ...f, layers: next };
        })
      );
      setActiveLayerIndex(index - 1);
    },
    [layers, canvasWidth, canvasHeight, currentFrameIndex, pushHistory]
  );

  const setLayerVisibility = useCallback(
    (index: number, visible: boolean) => {
      setFrames((prev) =>
        prev.map((f, i) =>
          i === currentFrameIndex
            ? {
                ...f,
                layers: f.layers.map((l, li) =>
                  li === index ? { ...l, visible } : l
                ),
              }
            : f
        )
      );
      bumpVersion();
    },
    [currentFrameIndex, bumpVersion]
  );

  const setLayerOpacity = useCallback(
    (index: number, opacity: number) => {
      setFrames((prev) =>
        prev.map((f, i) =>
          i === currentFrameIndex
            ? {
                ...f,
                layers: f.layers.map((l, li) =>
                  li === index ? { ...l, opacity } : l
                ),
              }
            : f
        )
      );
      bumpVersion();
    },
    [currentFrameIndex, bumpVersion]
  );

  const renameLayer = useCallback(
    (index: number, name: string) => {
      setFrames((prev) =>
        prev.map((f, i) =>
          i === currentFrameIndex
            ? {
                ...f,
                layers: f.layers.map((l, li) =>
                  li === index ? { ...l, name } : l
                ),
              }
            : f
        )
      );
    },
    [currentFrameIndex]
  );

  // -- Frame operations --
  const addFrame = useCallback(() => {
    const id = makeId();
    const newFrame: AnimationFrame = {
      id,
      layers: [makeLayer("Layer 1", canvasWidth, canvasHeight)],
    };
    setFrames((prev) => {
      const next = [...prev];
      next.splice(currentFrameIndex + 1, 0, newFrame);
      return next;
    });
    setFrameHistories((prev) => ({ ...prev, [id]: { undo: [], redo: [] } }));
    setCurrentFrameIndex(currentFrameIndex + 1);
    setActiveLayerIndex(0);
    bumpVersion();
  }, [currentFrameIndex, canvasWidth, canvasHeight, bumpVersion]);

  const duplicateFrame = useCallback(
    (index: number) => {
      const src = frames[index];
      const id = makeId();
      const newFrame: AnimationFrame = {
        id,
        layers: cloneLayers(src.layers),
      };
      setFrames((prev) => {
        const next = [...prev];
        next.splice(index + 1, 0, newFrame);
        return next;
      });
      setFrameHistories((prev) => ({
        ...prev,
        [id]: { undo: [], redo: [] },
      }));
      setCurrentFrameIndex(index + 1);
      bumpVersion();
    },
    [frames, bumpVersion]
  );

  const deleteFrame = useCallback(
    (index: number) => {
      if (frames.length <= 1) return;
      const fid = frames[index].id;
      setFrames((prev) => prev.filter((_, i) => i !== index));
      setFrameHistories((prev) => {
        const next = { ...prev };
        delete next[fid];
        return next;
      });
      setCurrentFrameIndex((ci) =>
        ci >= index ? Math.max(0, ci - 1) : ci
      );
      bumpVersion();
    },
    [frames, bumpVersion]
  );

  const moveFrame = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= frames.length) return;
      setFrames((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
      setCurrentFrameIndex(to);
      bumpVersion();
    },
    [frames.length, bumpVersion]
  );

  const selectFrame = useCallback((index: number) => {
    setIsPlaying(false);
    setCurrentFrameIndex(index);
    setActiveLayerIndex(0);
  }, []);

  const prevFrame = useCallback(() => {
    setCurrentFrameIndex((i) => (i > 0 ? i - 1 : frames.length - 1));
  }, [frames.length]);

  const nextFrame = useCallback(() => {
    setCurrentFrameIndex((i) => (i < frames.length - 1 ? i + 1 : 0));
  }, [frames.length]);

  // -- Canvas resize --
  const resizeCanvas = useCallback(
    (newW: number, newH: number) => {
      pushHistory();
      setFrames((prev) =>
        prev.map((f) => ({
          ...f,
          layers: f.layers.map((l) => {
            const newPx = PixelBitmap.empty(newW, newH);
            const copyH = Math.min(canvasHeight, newH);
            const copyW = Math.min(canvasWidth, newW);
            for (let y = 0; y < copyH; y++) {
              for (let x = 0; x < copyW; x++) {
                newPx.set(x, y, l.pixels.get(x, y));
              }
            }
            return { ...l, pixels: newPx };
          }),
        }))
      );
      setCanvasWidth(newW);
      setCanvasHeight(newH);
    },
    [canvasWidth, canvasHeight, pushHistory]
  );

  // -- Import image --
  const importImage = useCallback(
    (imageData: ImageData) => {
      pushHistory();
      const px = PixelBitmap.empty(canvasWidth, canvasHeight);
      for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
          const si = (y * imageData.width + x) * 4;
          const r = imageData.data[si];
          const g = imageData.data[si + 1];
          const b = imageData.data[si + 2];
          const a = imageData.data[si + 3];
          if (a > 128) {
            px.set(x, y, ((0xff << 24) | (b << 16) | (g << 8) | r) >>> 0);
          }
        }
      }
      // Add as new layer
      const newLayer: Layer = {
        id: makeId(),
        name: "Imported",
        pixels: px,
        visible: true,
        opacity: 100,
      };
      setFrames((prev) =>
        prev.map((f, i) =>
          i === currentFrameIndex
            ? { ...f, layers: [...f.layers, newLayer] }
            : f
        )
      );
      setActiveLayerIndex(layers.length);
      bumpVersion();
    },
    [canvasWidth, canvasHeight, pushHistory, currentFrameIndex, layers.length, bumpVersion]
  );

  const handleImportFile = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        const data = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        importImage(data);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    };
    input.click();
  }, [canvasWidth, canvasHeight, importImage]);

  // -- Playback --
  const playbackRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (playbackRef.current !== null) {
        cancelAnimationFrame(playbackRef.current);
        playbackRef.current = null;
      }
      return;
    }

    const interval = 1000 / fps;
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - lastTimeRef.current;
      if (elapsed >= interval) {
        lastTimeRef.current = now - (elapsed % interval);
        setCurrentFrameIndex((i) => {
          const next = i + 1;
          if (next >= frames.length) {
            if (!loop) {
              setIsPlaying(false);
              return i;
            }
            return 0;
          }
          return next;
        });
      }
      playbackRef.current = requestAnimationFrame(tick);
    };

    playbackRef.current = requestAnimationFrame(tick);

    return () => {
      if (playbackRef.current !== null) {
        cancelAnimationFrame(playbackRef.current);
        playbackRef.current = null;
      }
    };
  }, [isPlaying, fps, frames.length, loop]);

  // -- Onion skin pixels --
  const onionFrames = useMemo(() => {
    if (!animateMode || !onionSkin.enabled) return { prev: [], next: [] };
    const prev: { pixels: PixelBitmap; opacity: number }[] = [];
    const next: { pixels: PixelBitmap; opacity: number }[] = [];
    for (let i = 1; i <= onionSkin.prevCount; i++) {
      const idx = currentFrameIndex - i;
      if (idx >= 0) {
        prev.push({
          pixels: flattenLayers(
            frames[idx].layers,
            canvasWidth,
            canvasHeight
          ),
          opacity: onionSkin.prevOpacity / (i * 100),
        });
      }
    }
    for (let i = 1; i <= onionSkin.nextCount; i++) {
      const idx = currentFrameIndex + i;
      if (idx < frames.length) {
        next.push({
          pixels: flattenLayers(
            frames[idx].layers,
            canvasWidth,
            canvasHeight
          ),
          opacity: onionSkin.nextOpacity / (i * 100),
        });
      }
    }
    return { prev, next };
  }, [
    animateMode,
    onionSkin,
    currentFrameIndex,
    frames,
    canvasWidth,
    canvasHeight,
  ]);

  // -- Export --
  const exportPNG = useCallback(
    (scale: number) => {
      const flat = flattenLayers(layers, canvasWidth, canvasHeight);
      const c = document.createElement("canvas");
      c.width = canvasWidth * scale;
      c.height = canvasHeight * scale;
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      // Draw at native size via putImageData, then scale
      const tmp = document.createElement("canvas");
      tmp.width = canvasWidth;
      tmp.height = canvasHeight;
      const tmpCtx = tmp.getContext("2d")!;
      tmpCtx.putImageData(flat.toImageData(), 0, 0);
      ctx.drawImage(tmp, 0, 0, canvasWidth * scale, canvasHeight * scale);
      setExportData({
        url: c.toDataURL("image/png"),
        scale,
        width: canvasWidth * scale,
        height: canvasHeight * scale,
        format: "png",
      });
    },
    [layers, canvasWidth, canvasHeight]
  );

  const exportSpriteSheet = useCallback(
    (scale: number) => {
      const sheetW = canvasWidth * scale * frames.length;
      const sheetH = canvasHeight * scale;
      const c = document.createElement("canvas");
      c.width = sheetW;
      c.height = sheetH;
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      const tmp = document.createElement("canvas");
      tmp.width = canvasWidth;
      tmp.height = canvasHeight;
      const tmpCtx = tmp.getContext("2d")!;
      frames.forEach((frame, fi) => {
        const flat = flattenLayers(frame.layers, canvasWidth, canvasHeight);
        tmpCtx.putImageData(flat.toImageData(), 0, 0);
        const ox = fi * canvasWidth * scale;
        ctx.drawImage(tmp, ox, 0, canvasWidth * scale, canvasHeight * scale);
      });
      setExportData({
        url: c.toDataURL("image/png"),
        scale,
        width: sheetW,
        height: sheetH,
        format: "png",
      });
    },
    [frames, canvasWidth, canvasHeight]
  );

  const exportGif = useCallback(
    (scale: number) => {
      const allPixels = frames.map((f) =>
        flattenLayers(f.layers, canvasWidth, canvasHeight)
      );
      const result = encodeGif(
        allPixels,
        fps,
        scale,
        loop,
        canvasWidth,
        canvasHeight
      );
      setExportData({
        url: result.url,
        scale,
        width: result.width,
        height: result.height,
        format: "gif",
      });
    },
    [frames, fps, loop, canvasWidth, canvasHeight]
  );

  // -- Keyboard shortcuts --
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
        }
        if (e.key === "y") {
          e.preventDefault();
          redo();
        }
        if (e.key === "s") {
          e.preventDefault();
        }
        return;
      }
      if (e.key === "b" || e.key === "p") setTool("pen");
      if (e.key === "e") setTool("eraser");
      if (e.key === "i") setTool("pick");
      if (e.key === "g") setTool("fill");
      if (e.key === "l") setTool("line");
      if (e.key === "r") setTool("rect");
      if (e.key === "o" && !animateMode) setTool("ellipse");
      if (e.key === "s" && !animateMode) setTool("select");
      if (e.key === "v") setTool("move");
      if (e.key === "m") setMirror((v) => !v);
      if (e.key === "f") setShapeFilled((v) => !v);
      if (e.key === "[")
        setBrushSize((s) => Math.max(1, s - 1));
      if (e.key === "]")
        setBrushSize((s) => Math.min(8, s + 1));
      if (e.key === "?") setShowShortcuts((v) => !v);
      if (e.key === "Escape") {
        setSelection(null);
        setShowShortcuts(false);
        setShowSizeDialog(false);
      }

      // Animation shortcuts
      if (e.key === "a") setAnimateMode((v) => !v);
      if (animateMode) {
        if (e.key === " ") {
          e.preventDefault();
          togglePlay();
        }
        if (e.key === ",") prevFrame();
        if (e.key === ".") nextFrame();
        if (e.key === "n") addFrame();
        if (e.key === "d") duplicateFrame(currentFrameIndex);
        if (e.key === "o") setOnionSkin((os) => ({ ...os, enabled: !os.enabled }));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    undo,
    redo,
    animateMode,
    currentFrameIndex,
    togglePlay,
    prevFrame,
    nextFrame,
    addFrame,
    duplicateFrame,
  ]);

  // Stop playback when leaving animate mode
  useEffect(() => {
    if (!animateMode) setIsPlaying(false);
  }, [animateMode]);

  if (isLoading) {
    return (
      <div
        style={{
          ...S.root,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#5a5a6a",
            fontSize: 14,
            letterSpacing: 2,
            fontFamily: "inherit",
          }}
        >
          LOADING...
        </div>
      </div>
    );
  }

  return (
    <div style={S.root}>
      {isSaving && (
        <div
          style={{
            position: "fixed",
            top: 8,
            right: 12,
            fontSize: 11,
            letterSpacing: 2,
            color: "#b8942c",
            fontWeight: 600,
            zIndex: 9999,
            background: "rgba(12,12,22,0.85)",
            padding: "4px 10px",
            borderRadius: 4,
            border: "1px solid rgba(184,148,44,0.2)",
            pointerEvents: "none",
          }}
        >
          SAVING...
        </div>
      )}

      <Sidebar
        tool={tool}
        color={color}
        mirror={mirror}
        showGrid={showGrid}
        zoom={zoom}
        animateMode={animateMode}
        brushSize={brushSize}
        shapeFilled={shapeFilled}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        recentColors={recentColors}
        activePalette={activePalette}
        onToolChange={setTool}
        onColorChange={handleColorChange}
        onMirrorChange={setMirror}
        onShowGridChange={setShowGrid}
        onZoomChange={setZoom}
        onAnimateModeChange={setAnimateMode}
        onBrushSizeChange={setBrushSize}
        onShapeFilledChange={setShapeFilled}
        onUndo={undo}
        onRedo={redo}
        onReset={reset}
        onClear={clear}
        onCanvasSizeClick={() => setShowSizeDialog(true)}
        onPaletteChange={setActivePalette}
        onShowShortcuts={() => setShowShortcuts(true)}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top bar: Export & Import */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "#0c0c16",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: "#6a6a7a",
              fontWeight: 600,
              marginRight: 4,
            }}
          >
            EXPORT
          </span>
          {animateMode && frames.length > 1 ? (
            <>
              <Tip label="Export GIF 64px" side="bottom">
                <button
                  onClick={() => exportGif(1)}
                  style={topBarBtn}
                >
                  GIF 1x
                </button>
              </Tip>
              <Tip label="Export GIF 256px" side="bottom">
                <button
                  onClick={() => exportGif(4)}
                  style={topBarBtn}
                >
                  GIF 4x
                </button>
              </Tip>
              <Tip label="Sprite Sheet 1x" side="bottom">
                <button
                  onClick={() => exportSpriteSheet(1)}
                  style={topBarBtn}
                >
                  Sheet 1x
                </button>
              </Tip>
              <Tip label="Sprite Sheet 4x" side="bottom">
                <button
                  onClick={() => exportSpriteSheet(4)}
                  style={topBarBtn}
                >
                  Sheet 4x
                </button>
              </Tip>
              <Tip label="Export current frame as PNG" side="bottom">
                <button
                  onClick={() => exportPNG(1)}
                  style={topBarBtn}
                >
                  Frame PNG
                </button>
              </Tip>
            </>
          ) : (
            <>
              <Tip label={`${canvasWidth}x${canvasHeight} PNG`} side="bottom">
                <button
                  onClick={() => exportPNG(1)}
                  style={topBarBtn}
                >
                  PNG 1x
                </button>
              </Tip>
              <Tip label={`${canvasWidth * 4}x${canvasHeight * 4} PNG`} side="bottom">
                <button
                  onClick={() => exportPNG(4)}
                  style={topBarBtn}
                >
                  PNG 4x
                </button>
              </Tip>
              <Tip label={`${canvasWidth * 8}x${canvasHeight * 8} PNG`} side="bottom">
                <button
                  onClick={() => exportPNG(8)}
                  style={topBarBtn}
                >
                  PNG 8x
                </button>
              </Tip>
            </>
          )}

          <div
            style={{
              width: 1,
              height: 18,
              background: "rgba(255,255,255,0.08)",
              margin: "0 4px",
            }}
          />

          <Tip label="Import image as new layer" side="bottom">
            <button onClick={handleImportFile} style={topBarBtn}>
              IMPORT
            </button>
          </Tip>
        </div>
        <CanvasArea
          pixels={flatPixels}
          activeLayerPixels={activeLayer.pixels}
          tool={tool}
          color={color}
          zoom={zoom}
          showGrid={showGrid}
          mirror={mirror}
          brushSize={brushSize}
          shapeFilled={shapeFilled}
          historyLength={history.undo.length}
          redoLength={history.redo.length}
          isPlaying={isPlaying}
          onionFrames={onionFrames}
          animateMode={animateMode}
          currentFrameIndex={currentFrameIndex}
          totalFrames={frames.length}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          selection={selection}
          activeLayerVisible={activeLayer.visible}
          onActiveLayerPixelsChange={setActiveLayerPixels}
          onToolChange={setTool}
          onColorChange={handleColorChange}
          onPushHistory={pushHistory}
          onUndo={undo}
          onRedo={redo}
          onJumpToStart={jumpToStart}
          onJumpToEnd={jumpToEnd}
          onSelectionChange={setSelection}
        />

        {animateMode && (
          <TimelinePanel
            frames={frames}
            currentFrameIndex={currentFrameIndex}
            fps={fps}
            isPlaying={isPlaying}
            loop={loop}
            onionSkin={onionSkin}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onSelectFrame={selectFrame}
            onAddFrame={addFrame}
            onDuplicateFrame={duplicateFrame}
            onDeleteFrame={deleteFrame}
            onMoveFrame={moveFrame}
            onFpsChange={setFps}
            onTogglePlay={togglePlay}
            onToggleLoop={() => setLoop((v) => !v)}
            onOnionSkinChange={setOnionSkin}
            onPrevFrame={prevFrame}
            onNextFrame={nextFrame}
          />
        )}
      </div>

      <LayersPanel
        layers={layers}
        activeIndex={safeLayerIndex}
        onSelect={setActiveLayerIndex}
        onAdd={addLayer}
        onDelete={deleteLayer}
        onDuplicate={duplicateLayer}
        onMove={moveLayer}
        onMergeDown={mergeLayerDown}
        onVisibilityChange={setLayerVisibility}
        onOpacityChange={setLayerOpacity}
        onRename={renameLayer}
      />

      {exportData && (
        <ExportOverlay
          data={exportData}
          onClose={() => {
            if (exportData.url.startsWith("blob:")) {
              URL.revokeObjectURL(exportData.url);
            }
            setExportData(null);
          }}
        />
      )}

      {showSizeDialog && (
        <CanvasSizeDialog
          currentWidth={canvasWidth}
          currentHeight={canvasHeight}
          onResize={resizeCanvas}
          onClose={() => setShowSizeDialog(false)}
        />
      )}

      {showShortcuts && (
        <ShortcutsPanel onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}

const topBarBtn = {
  padding: "5px 10px",
  borderRadius: 3,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#8a8a9a",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1,
} as const;
