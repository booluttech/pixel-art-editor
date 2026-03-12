# Pixel Art Editor

A browser-based pixel art editor built with Next.js and React. Features layers, animation with timeline, GIF/PNG/sprite sheet export, and persistent storage via IndexedDB.

## Features

- **Drawing Tools** — Pen, eraser, line, rectangle, ellipse, fill, color picker, selection, and move
- **Layers** — Multiple layers with visibility, opacity, reordering, merging, and duplication
- **Animation** — Frame-based animation with timeline, onion skinning, and playback controls
- **Export** — PNG (1x/4x/8x), GIF animation, and sprite sheet export
- **Palettes** — Built-in palettes (Manas, Pico-8, GameBoy, Endesga-32, NES) with color picker
- **Canvas Sizes** — Presets from 8x8 to 256x256 with custom sizing
- **Persistence** — Auto-saves to IndexedDB with schema migration support
- **Mirror Mode** — Symmetrical drawing along the vertical axis
- **Undo/Redo** — Full history with up to 40 states per frame
- **Keyboard Shortcuts** — Comprehensive shortcut support for all tools and actions
- **Zero Dependencies** — All drawing algorithms, GIF encoding (LZW), and image processing implemented from scratch

## What Makes This Editor Different

### Built-from-scratch GIF encoder

The editor includes a complete GIF89a encoder written from scratch in TypeScript — no libraries, no WebAssembly, no server round-trips. It implements LZW compression, builds global color tables from the actual pixels in your frames, supports transparency, configurable frame delay derived from the FPS setting, and the Netscape looping extension. The entire encode runs synchronously in the browser and produces a blob URL you can download immediately.

### Per-frame undo/redo history

Unlike most editors that maintain a single global history, each animation frame has its own independent undo/redo stack (up to 40 states each). Switching between frames preserves their individual histories, so undoing on frame 3 doesn't affect your work on frame 1. The history also supports jump-to-start and jump-to-end for quickly comparing the original state against the current one.

### Color-tinted onion skinning

The onion skin system shows previous frames tinted red and next frames tinted blue, with configurable count (1–3 frames in each direction) and opacity. The tinting is applied per-pixel on the canvas — only pixels that actually contain data get the color overlay, keeping transparent areas clean.

### Procedural Manas sprite

The default canvas ships with a 64x64 pixel art warrior generated entirely in code — the Manas sprite, inspired by the Kyrgyz epic hero. Every pixel is placed procedurally using helper functions (`hLine`, `vLine`, `rect`) with a named palette covering skin, armor, chainmail, kalpak, sword, and leather. It serves as both a demo and a functional color palette reference.

### Native drawing algorithms

All drawing tools are implemented from first principles: Bresenham's algorithm for lines, midpoint algorithm for ellipses, scanline flood fill with a visited bitmap, and square brush stamping. Mirror mode applies symmetry at the algorithm level, duplicating brush strokes across the vertical axis in real time. Shape tools (line, rect, ellipse) show a live preview overlay while dragging before committing to the canvas.

### Sprite sheet export

In animation mode, the editor can export all frames as a horizontal sprite sheet PNG — a single image with frames laid side by side, ready for use in game engines. Available at 1x and 4x scale.

### Self-migrating persistence

The IndexedDB storage layer automatically detects and migrates data from older schema versions. v1 (flat 2D color arrays) and v2 (per-layer color arrays) are transparently upgraded to v3 (binary `PixelBitmap` format) on load, then re-saved in the new format. Projects are never lost across editor updates.

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- [Next.js 15](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Radix UI](https://www.radix-ui.com/) (tooltips only)
- Inline CSS-in-JS (no CSS framework dependency for the editor)

## Bitmap Architecture

The editor uses a custom `PixelBitmap` class backed by a `Uint32Array` for pixel storage instead of traditional 2D arrays of color strings. Each pixel is a single 32-bit integer in `0xAABBGGRR` format (little-endian ABGR), where `0` represents a fully transparent pixel.

**Why this matters:**

- **Memory efficiency** — A 256x256 canvas uses ~256 KB as a flat `Uint32Array`, compared to ~1.5 MB+ with a 2D array of hex strings and object overhead
- **Performance** — Iterating a typed array is significantly faster than nested arrays of heap-allocated strings. Layer flattening, flood fill, and export operations work directly on contiguous memory
- **Zero-copy ImageData** — The `Uint32Array` buffer is reinterpreted as `Uint8ClampedArray` for direct use with `canvas.putImageData()`, avoiding per-pixel color parsing
- **Compact serialization** — Bitmaps serialize to base64-encoded binary for IndexedDB storage, much smaller than JSON arrays of color strings

Helper functions (`hexToU32`, `u32ToHex`, `blendU32`) handle conversion between `#rrggbb` hex strings and the internal format. The storage layer includes automatic migration from older schema versions (v1: 2D string arrays, v2: per-layer string arrays) to the current v3 bitmap format.

## Project Structure

```
app/
├── page.tsx              # Entry point
├── layout.tsx            # Root layout
├── _lib/                 # Core logic (framework-agnostic)
│   ├── types.ts          # Type definitions
│   ├── constants.ts      # Palettes, tools, canvas presets
│   ├── pixel-bitmap.ts   # Uint32Array-backed pixel storage
│   ├── drawing.ts        # Drawing algorithms (Bresenham, flood fill, etc.)
│   ├── gif-encoder.ts    # GIF89a encoder with LZW compression
│   ├── manas-sprite.ts   # Default sprite generator
│   ├── storage.ts        # IndexedDB persistence with migrations
│   ├── use-project-storage.ts  # React hook for auto-save
│   └── styles.ts         # CSS-in-JS style definitions
└── _components/          # React components
    ├── pixel-editor.tsx  # Main editor (state management)
    ├── canvas-area.tsx   # Drawing canvas with input handling
    ├── sidebar.tsx       # Tool/color/settings panel
    ├── layers-panel.tsx  # Layer stack management
    ├── timeline-panel.tsx # Animation timeline
    ├── toolbar.tsx       # Tool selector
    ├── palette.tsx       # Color palette
    ├── export-overlay.tsx # Export preview modal
    ├── canvas-size-dialog.tsx # Canvas resize dialog
    ├── frame-thumbnail.tsx    # Animation frame preview
    ├── history-nav.tsx   # Undo/redo controls
    ├── shortcuts-panel.tsx # Keyboard shortcuts help
    └── tip.tsx           # Tooltip wrapper
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| B/P | Pen |
| E | Eraser |
| L | Line |
| R | Rectangle |
| O | Ellipse |
| G | Fill |
| I | Color Picker |
| S | Selection |
| V | Move |
| M | Toggle Mirror |
| F | Toggle Filled Shapes |
| [ / ] | Brush Size |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| A | Toggle Animation Mode |
| Space | Play/Pause |
| , / . | Previous/Next Frame |
| N | New Frame |
| D | Duplicate Frame |
| ? | Shortcuts Panel |

## License

[MIT](LICENSE)
