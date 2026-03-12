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
