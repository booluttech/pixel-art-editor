"use client";

interface ShortcutsPanelProps {
  onClose: () => void;
}

const shortcuts = [
  { cat: "DRAWING", items: [
    ["B / P", "Pen"],
    ["E", "Eraser"],
    ["L", "Line"],
    ["R", "Rectangle"],
    ["O", "Ellipse"],
    ["G", "Fill"],
    ["I", "Color Picker"],
    ["F", "Toggle Filled Shapes"],
  ]},
  { cat: "SELECTION", items: [
    ["S", "Selection Tool"],
    ["V", "Move Tool"],
    ["Esc", "Deselect"],
  ]},
  { cat: "CANVAS", items: [
    ["M", "Toggle Mirror"],
    ["[ / ]", "Brush Size -/+"],
    ["Ctrl+Z", "Undo"],
    ["Ctrl+Shift+Z", "Redo"],
    ["Ctrl+Y", "Redo"],
  ]},
  { cat: "ANIMATION", items: [
    ["A", "Toggle Animation Mode"],
    ["Space", "Play / Pause"],
    [", / .", "Prev / Next Frame"],
    ["N", "New Frame"],
    ["D", "Duplicate Frame"],
    ["O", "Toggle Onion Skin"],
  ]},
  { cat: "OTHER", items: [
    ["?", "This Panel"],
    ["Esc", "Close Dialogs"],
  ]},
];

export function ShortcutsPanel({ onClose }: ShortcutsPanelProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(4,4,10,0.94)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#10101c",
          border: "1px solid rgba(184,148,44,0.25)",
          borderRadius: 8,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          cursor: "default",
          minWidth: 360,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#d4ac3c",
            textAlign: "center",
          }}
        >
          KEYBOARD SHORTCUTS
        </div>

        {shortcuts.map((group) => (
          <div key={group.cat}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "#6a6a7a",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {group.cat}
            </div>
            {group.items.map(([key, desc]) => (
              <div
                key={key + desc}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  fontSize: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <span
                  style={{
                    color: "#d4ac3c",
                    fontWeight: 700,
                    letterSpacing: 1,
                    minWidth: 100,
                  }}
                >
                  {key}
                </span>
                <span style={{ color: "#8a8a9a" }}>{desc}</span>
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={onClose}
          style={{
            padding: "8px 20px",
            borderRadius: 4,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#8a8a9a",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            alignSelf: "center",
          }}
        >
          CLOSE (Esc)
        </button>
      </div>
    </div>
  );
}
