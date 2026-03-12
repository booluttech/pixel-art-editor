"use client";

import { S } from "../_lib/styles";
import { MAX_BRUSH_SIZE } from "../_lib/constants";
import type { Tool } from "../_lib/types";
import { Toolbar } from "./toolbar";
import { Palette } from "./palette";
import { Tip } from "./tip";

interface SidebarProps {
  tool: Tool;
  color: string;
  mirror: boolean;
  showGrid: boolean;
  zoom: number;
  animateMode: boolean;
  brushSize: number;
  shapeFilled: boolean;
  canvasWidth: number;
  canvasHeight: number;
  recentColors: string[];
  activePalette: string;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onMirrorChange: (mirror: boolean) => void;
  onShowGridChange: (show: boolean) => void;
  onZoomChange: (zoom: number) => void;
  onAnimateModeChange: (animate: boolean) => void;
  onBrushSizeChange: (size: number) => void;
  onShapeFilledChange: (filled: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onClear: () => void;
  onCanvasSizeClick: () => void;
  onPaletteChange: (name: string) => void;
  onShowShortcuts: () => void;
}

export function Sidebar({
  tool,
  color,
  mirror,
  showGrid,
  zoom,
  animateMode,
  brushSize,
  shapeFilled,
  canvasWidth,
  canvasHeight,
  recentColors,
  activePalette,
  onToolChange,
  onColorChange,
  onMirrorChange,
  onShowGridChange,
  onZoomChange,
  onAnimateModeChange,
  onBrushSizeChange,
  onShapeFilledChange,
  onUndo,
  onRedo,
  onReset,
  onClear,
  onCanvasSizeClick,
  onPaletteChange,
  onShowShortcuts,
}: SidebarProps) {
  return (
    <div style={S.sidebar}>
      {/* Title */}
      <div style={{ textAlign: "center", padding: "6px 0 4px" }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: 5,
            color: "#d4ac3c",
          }}
        >
          MANAS
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: "#5a5a6a",
            marginTop: 2,
          }}
        >
          PIXEL EDITOR
        </div>
      </div>

      {/* Animate mode toggle */}
      <Tip label="Animation Mode (A)" side="right">
        <button
          onClick={() => onAnimateModeChange(!animateMode)}
          style={{
            width: "100%",
            padding: "5px 8px",
            background: animateMode
              ? "rgba(184,148,44,0.15)"
              : "rgba(255,255,255,0.02)",
            border: `1px solid ${
              animateMode
                ? "rgba(184,148,44,0.3)"
                : "rgba(255,255,255,0.06)"
            }`,
            borderRadius: 3,
            color: animateMode ? "#d4ac3c" : "#5a5a6a",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: animateMode ? 700 : 400,
            letterSpacing: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "all 0.15s",
          }}
        >
          ANIM {animateMode ? "ON" : "OFF"}
        </button>
      </Tip>

      {/* Drawing: Tools + Modifiers + History */}
      <div style={S.section}>
        <Toolbar tool={tool} onToolChange={onToolChange} />

        {/* Brush size + shape fill */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#5a5a6a", letterSpacing: 1 }}>
            BRUSH
          </span>
          <Tip label="Decrease Brush ([)">
            <button
              onClick={() => onBrushSizeChange(Math.max(1, brushSize - 1))}
              style={{ ...S.smallBtn, padding: "2px 6px", fontSize: 12 }}
            >
              -
            </button>
          </Tip>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#d4ac3c",
              minWidth: 16,
              textAlign: "center",
            }}
          >
            {brushSize}
          </span>
          <Tip label="Increase Brush (])">
            <button
              onClick={() =>
                onBrushSizeChange(Math.min(MAX_BRUSH_SIZE, brushSize + 1))
              }
              style={{ ...S.smallBtn, padding: "2px 6px", fontSize: 12 }}
            >
              +
            </button>
          </Tip>
          <div
            style={{
              width: 1,
              height: 16,
              background: "rgba(255,255,255,0.06)",
              margin: "0 2px",
            }}
          />
          <Tip label="Toggle Filled Shapes (F)">
            <button
              onClick={() => onShapeFilledChange(!shapeFilled)}
              style={{
                ...S.smallBtn,
                padding: "2px 8px",
                fontSize: 10,
                letterSpacing: 1,
                color: shapeFilled ? "#d4ac3c" : "#6a6a7a",
                background: shapeFilled
                  ? "rgba(184,148,44,0.1)"
                  : undefined,
                border: shapeFilled
                  ? "1px solid rgba(184,148,44,0.25)"
                  : undefined,
              }}
            >
              {shapeFilled ? "FILL" : "LINE"}
            </button>
          </Tip>
        </div>

        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          <Tip label="Mirror (M)">
            <button
              onClick={() => onMirrorChange(!mirror)}
              style={{
                ...S.toolBtn(mirror),
                fontSize: 12,
                padding: "6px 4px",
                flex: 1,
              }}
            >
              MIR
            </button>
          </Tip>
          <Tip label="Toggle Grid">
            <button
              onClick={() => onShowGridChange(!showGrid)}
              style={{
                ...S.toolBtn(showGrid),
                fontSize: 12,
                padding: "6px 4px",
                flex: 1,
              }}
            >
              GRID
            </button>
          </Tip>
          <div
            style={{
              width: 1,
              alignSelf: "stretch",
              background: "rgba(255,255,255,0.06)",
              margin: "0 1px",
            }}
          />
          <Tip label="Undo (Ctrl+Z)">
            <button
              onClick={onUndo}
              style={{
                ...S.toolBtn(false),
                fontSize: 14,
                padding: "6px 4px",
                flex: 1,
              }}
            >
              &#9664;
            </button>
          </Tip>
          <Tip label="Redo (Ctrl+Shift+Z)">
            <button
              onClick={onRedo}
              style={{
                ...S.toolBtn(false),
                fontSize: 14,
                padding: "6px 4px",
                flex: 1,
              }}
            >
              &#9654;
            </button>
          </Tip>
        </div>
      </div>

      {/* Color */}
      <div style={S.section}>
        <span style={S.label}>COLOR</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: color,
              borderRadius: 3,
              border: "2px solid rgba(255,255,255,0.12)",
              boxShadow: `0 0 12px ${color}44`,
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#b0b0c0",
              padding: "4px 6px",
              borderRadius: 3,
              fontFamily: "inherit",
              fontSize: 12,
            }}
          />
        </div>
        {/* Recent colors */}
        {recentColors.length > 0 && (
          <div>
            <span
              style={{
                fontSize: 10,
                color: "#50505e",
                letterSpacing: 1,
              }}
            >
              RECENT
            </span>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                marginTop: 2,
              }}
            >
              {recentColors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => onColorChange(c)}
                  style={{
                    width: 16,
                    height: 16,
                    background: c,
                    borderRadius: 2,
                    padding: 0,
                    border:
                      color === c
                        ? "2px solid #d4ac3c"
                        : "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Palette */}
      <div style={{ ...S.section, flex: 1, overflowY: "auto" }}>
        <Palette
          color={color}
          activePalette={activePalette}
          onColorChange={onColorChange}
          onToolChange={onToolChange}
          onPaletteChange={onPaletteChange}
        />
      </div>

      {/* Canvas: Size, Reset, Clear, Zoom */}
      <div style={S.section}>
        <div style={{ display: "flex", gap: 3 }}>
          <Tip label="Canvas Size">
            <button
              onClick={onCanvasSizeClick}
              style={{
                ...S.smallBtn,
                flex: 1,
                fontSize: 10,
                letterSpacing: 1,
              }}
            >
              {canvasWidth}x{canvasHeight}
            </button>
          </Tip>
          <Tip label="Reset to Manas">
            <button
              onClick={onReset}
              style={{
                ...S.toolBtn(false),
                fontSize: 11,
                padding: "6px 4px",
                flex: 1,
              }}
            >
              RST
            </button>
          </Tip>
          <Tip label="Clear Active Layer">
            <button
              onClick={onClear}
              style={{
                ...S.toolBtn(false),
                fontSize: 11,
                padding: "6px 4px",
                flex: 1,
              }}
            >
              CLR
            </button>
          </Tip>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {[4, 6, 9, 12].map((z) => (
            <Tip key={z} label={`Zoom ${z}x`}>
              <button
                onClick={() => onZoomChange(z)}
                style={{
                  ...S.smallBtn,
                  flex: 1,
                  background:
                    zoom === z ? "rgba(184,148,44,0.1)" : undefined,
                  color: zoom === z ? "#d4ac3c" : undefined,
                  border:
                    zoom === z
                      ? "1px solid rgba(184,148,44,0.25)"
                      : undefined,
                  fontWeight: zoom === z ? 700 : undefined,
                }}
              >
                {z}x
              </button>
            </Tip>
          ))}
        </div>
      </div>

      {/* Shortcuts */}
      <Tip label="Keyboard Shortcuts (?)" side="right">
        <button
          onClick={onShowShortcuts}
          style={{
            ...S.smallBtn,
            width: "100%",
            textAlign: "center",
            letterSpacing: 2,
            fontSize: 10,
          }}
        >
          SHORTCUTS (?)
        </button>
      </Tip>
    </div>
  );
}
