import type { PixelBitmap } from "./pixel-bitmap";

export type Tool =
  | "pen"
  | "eraser"
  | "pick"
  | "fill"
  | "line"
  | "rect"
  | "ellipse"
  | "select"
  | "move";

export interface ExportData {
  url: string;
  scale: number;
  width: number;
  height: number;
  format: "png" | "gif";
}

export interface ToolDef {
  k: Tool;
  l: string;
  s: string;
}

export interface Layer {
  id: string;
  name: string;
  pixels: PixelBitmap;
  visible: boolean;
  opacity: number; // 0-100
}

export interface AnimationFrame {
  id: string;
  layers: Layer[];
}

export interface FrameHistory {
  undo: Layer[][];
  redo: Layer[][];
}

export interface Selection {
  x: number;
  y: number;
  w: number;
  h: number;
  pixels: PixelBitmap | null; // floating selection content
}

export interface PaletteDef {
  name: string;
  colors: string[];
  builtin?: boolean;
}

export interface OnionSkinSettings {
  enabled: boolean;
  prevCount: number; // 1-3
  nextCount: number; // 0-3
  prevOpacity: number; // 0-100
  nextOpacity: number; // 0-100
}
