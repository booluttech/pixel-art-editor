"use client";

import { MANAS_PALETTE, BUILTIN_PALETTES } from "../_lib/constants";
import { S } from "../_lib/styles";
import type { Tool } from "../_lib/types";

interface PaletteProps {
  color: string;
  activePalette: string;
  onColorChange: (color: string) => void;
  onToolChange: (tool: Tool) => void;
  onPaletteChange: (name: string) => void;
}

export function Palette({
  color,
  activePalette,
  onColorChange,
  onToolChange,
  onPaletteChange,
}: PaletteProps) {
  const isManas = activePalette === "Manas";
  const otherPalette = BUILTIN_PALETTES.find(
    (p) => p.name === activePalette && !isManas
  );

  return (
    <div>
      {/* Palette selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
        <span style={S.label}>PALETTE</span>
        <select
          value={activePalette}
          onChange={(e) => onPaletteChange(e.target.value)}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#8a8a9a",
            padding: "3px 4px",
            borderRadius: 3,
            fontFamily: "inherit",
            fontSize: 10,
            cursor: "pointer",
          }}
        >
          {BUILTIN_PALETTES.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Manas palette: grouped by category */}
      {isManas &&
        Object.entries(MANAS_PALETTE).map(([group, colors]) => (
          <div key={group} style={{ marginBottom: 6 }}>
            <div
              style={{
                fontSize: 10,
                color: "#50505e",
                letterSpacing: 1,
                marginBottom: 3,
                fontWeight: 600,
              }}
            >
              {group.toUpperCase()}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {colors.map((c, i) => (
                <ColorSwatch
                  key={i}
                  c={c}
                  active={color === c}
                  onClick={() => {
                    onColorChange(c);
                    onToolChange("pen");
                  }}
                />
              ))}
            </div>
          </div>
        ))}

      {/* Other palettes: flat grid */}
      {!isManas && otherPalette && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {otherPalette.colors.map((c, i) => (
            <ColorSwatch
              key={i}
              c={c}
              active={color === c}
              onClick={() => {
                onColorChange(c);
                onToolChange("pen");
              }}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 4 }}>
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          style={{
            width: "100%",
            height: 24,
            border: "none",
            cursor: "pointer",
            background: "transparent",
          }}
        />
      </div>
    </div>
  );
}

function ColorSwatch({
  c,
  active,
  onClick,
}: {
  c: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 18,
        height: 18,
        background: c,
        borderRadius: 2,
        padding: 0,
        border: active
          ? "2px solid #d4ac3c"
          : "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
        boxShadow: active ? `0 0 6px ${c}66` : "none",
      }}
      title={c}
    />
  );
}
