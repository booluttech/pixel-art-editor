import type { ToolDef, PaletteDef } from "./types";

export const DEFAULT_SIZE = 64;
export const MIN_SIZE = 8;
export const MAX_SIZE = 256;

export const CANVAS_PRESETS = [
  { label: "8x8", w: 8, h: 8 },
  { label: "16x16", w: 16, h: 16 },
  { label: "32x32", w: 32, h: 32 },
  { label: "64x64", w: 64, h: 64 },
  { label: "128x128", w: 128, h: 128 },
  { label: "256x256", w: 256, h: 256 },
];

export const MANAS_PALETTE: Record<string, string[]> = {
  Outline: ["#0a0a12", "#14141e", "#1e1e2a"],
  Kalpak: ["#c8bfad", "#a89e8c", "#887e6e", "#706858"],
  Skin: ["#d4a87a", "#c4956a", "#9c7048", "#7a5838"],
  Face: ["#d8d0c8", "#1e1208", "#141008", "#9a6048", "#7a4838"],
  "Hair/Beard": ["#1a1008", "#2a2018", "#1e1408", "#2e2418"],
  Armor: ["#72728a", "#606070", "#484858", "#343444", "#242432", "#1e1e26"],
  Chain: ["#585868", "#424252", "#2e2e3a"],
  Fabric: ["#163a6e", "#0e2a52", "#081a38", "#962c2c", "#7a2020", "#581818"],
  Gold: ["#d4ac3c", "#b8942c", "#8a6e1e", "#5c4a14"],
  Sword: ["#c0c0d0", "#aaaab8", "#8a8a98", "#686878", "#3a2418"],
  Boots: ["#4e3422", "#3a2418", "#241610", "#1a0e08"],
  Leather: ["#5a4838", "#4a3828", "#3a2818"],
  Accent: ["#8b1a1a", "#a82828", "#5e1818"],
};

export const BUILTIN_PALETTES: PaletteDef[] = [
  {
    name: "Manas",
    builtin: true,
    colors: Object.values(MANAS_PALETTE).flat(),
  },
  {
    name: "Pico-8",
    builtin: true,
    colors: [
      "#000000", "#1d2b53", "#7e2553", "#008751",
      "#ab5236", "#5f574f", "#c2c3c7", "#fff1e8",
      "#ff004d", "#ffa300", "#ffec27", "#00e436",
      "#29adff", "#83769c", "#ff77a8", "#ffccaa",
    ],
  },
  {
    name: "GameBoy",
    builtin: true,
    colors: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"],
  },
  {
    name: "Endesga-32",
    builtin: true,
    colors: [
      "#be4a2f", "#d77643", "#ead4aa", "#e4a672",
      "#b86f50", "#733e39", "#3e2731", "#a22633",
      "#e43b44", "#f77622", "#feae34", "#fee761",
      "#63c74d", "#3e8948", "#265c42", "#193c3e",
      "#124e89", "#0099db", "#2ce8f5", "#ffffff",
      "#c0cbdc", "#8b9bb4", "#5a6988", "#3a4466",
      "#262b44", "#181425", "#ff0044", "#68386c",
      "#b55088", "#f6757a", "#e8b796", "#c28569",
    ],
  },
  {
    name: "NES",
    builtin: true,
    colors: [
      "#000000", "#fcfcfc", "#f8f8f8", "#bcbcbc",
      "#7c7c7c", "#a4e4fc", "#3cbcfc", "#0078f8",
      "#0000fc", "#b8b8f8", "#6888fc", "#0058f8",
      "#0000bc", "#d8b8f8", "#9878f8", "#6844fc",
      "#4428bc", "#f8b8f8", "#f878f8", "#d800cc",
      "#940084", "#f8a4c0", "#f85898", "#e40058",
      "#a80020", "#f0d0b0", "#f87858", "#f83800",
      "#a81000", "#fce0a8", "#fca044", "#e45c10",
      "#881400", "#f8d878", "#f8b800", "#ac7c00",
      "#503000", "#d8f878", "#b8f818", "#00b800",
      "#007800", "#b8f8b8", "#58d854", "#00a800",
      "#006800", "#b8f8d8", "#58f898", "#00a844",
      "#005800", "#00fcfc", "#00e8d8", "#008888",
      "#004058", "#f8d8f8", "#787878",
    ],
  },
];

export const TOOLS: ToolDef[] = [
  { k: "pen", l: "P", s: "B" },
  { k: "eraser", l: "E", s: "E" },
  { k: "line", l: "L", s: "L" },
  { k: "rect", l: "R", s: "R" },
  { k: "ellipse", l: "O", s: "O" },
  { k: "fill", l: "F", s: "G" },
  { k: "pick", l: "?", s: "I" },
  { k: "select", l: "S", s: "S" },
  { k: "move", l: "M", s: "V" },
];

export const MAX_BRUSH_SIZE = 8;
