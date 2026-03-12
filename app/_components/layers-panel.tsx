"use client";

import type { CSSProperties } from "react";
import { S } from "../_lib/styles";
import type { Layer } from "../_lib/types";
import { Tip } from "./tip";

interface LayersPanelProps {
  layers: Layer[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onMergeDown: (index: number) => void;
  onVisibilityChange: (index: number, visible: boolean) => void;
  onOpacityChange: (index: number, opacity: number) => void;
  onRename: (index: number, name: string) => void;
}

function actionBtn(
  enabled: boolean,
  variant: "default" | "danger" = "default"
): CSSProperties {
  const base: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 24,
    borderRadius: 3,
    cursor: enabled ? "pointer" : "default",
    fontFamily: "inherit",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0,
    padding: 0,
    transition: "all 0.1s",
  };
  if (variant === "danger") {
    return {
      ...base,
      background: enabled ? "rgba(200,60,60,0.1)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${enabled ? "rgba(200,60,60,0.25)" : "rgba(255,255,255,0.04)"}`,
      color: enabled ? "#cc5555" : "#2a2a38",
    };
  }
  return {
    ...base,
    background: enabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
    border: `1px solid ${enabled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`,
    color: enabled ? "#9a9aaa" : "#2a2a38",
  };
}

export function LayersPanel({
  layers,
  activeIndex,
  onSelect,
  onAdd,
  onDelete,
  onDuplicate,
  onMove,
  onMergeDown,
  onVisibilityChange,
  onOpacityChange,
  onRename,
}: LayersPanelProps) {
  return (
    <div
      style={{
        width: 210,
        minWidth: 210,
        background: "#0c0c16",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflowY: "auto",
        maxHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={S.label}>LAYERS</span>
        <Tip label="Add New Layer" side="left">
          <button
            onClick={onAdd}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 26,
              height: 22,
              borderRadius: 3,
              fontSize: 15,
              fontWeight: 700,
              padding: 0,
              color: "#d4ac3c",
              background: "rgba(184,148,44,0.1)",
              border: "1px solid rgba(184,148,44,0.25)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            +
          </button>
        </Tip>
      </div>

      {/* Layer action toolbar (for active layer) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          padding: "4px 0",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <Tip label="Move Layer Up" side="bottom">
          <button
            onClick={() => onMove(activeIndex, activeIndex + 1)}
            disabled={activeIndex >= layers.length - 1}
            style={actionBtn(activeIndex < layers.length - 1)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2.5L10 7.5H2L6 2.5Z" fill="currentColor" />
            </svg>
          </button>
        </Tip>

        <Tip label="Move Layer Down" side="bottom">
          <button
            onClick={() => onMove(activeIndex, activeIndex - 1)}
            disabled={activeIndex <= 0}
            style={actionBtn(activeIndex > 0)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 9.5L2 4.5H10L6 9.5Z" fill="currentColor" />
            </svg>
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

        <Tip label="Duplicate Layer" side="bottom">
          <button
            onClick={() => onDuplicate(activeIndex)}
            style={actionBtn(true)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <rect x="4" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
          </button>
        </Tip>

        <Tip label="Merge Into Layer Below" side="bottom">
          <button
            onClick={() => onMergeDown(activeIndex)}
            disabled={activeIndex <= 0}
            style={actionBtn(activeIndex > 0)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5V8M6 8L3.5 5.5M6 8L8.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="2" y1="10.5" x2="10" y2="10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </Tip>

        <div style={{ flex: 1 }} />

        <Tip label="Delete Layer" side="bottom">
          <button
            onClick={() => {
              if (layers.length > 1) onDelete(activeIndex);
            }}
            disabled={layers.length <= 1}
            style={actionBtn(layers.length > 1, "danger")}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 3.5L9 9.5M9 3.5L3 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </Tip>
      </div>

      {/* Layer list (reversed so top layer is visually on top) */}
      <div
        style={{ display: "flex", flexDirection: "column-reverse", gap: 2 }}
      >
        {layers.map((layer, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={layer.id}
              onClick={() => onSelect(i)}
              style={{
                padding: "7px 8px",
                background: isActive
                  ? "rgba(184,148,44,0.08)"
                  : "rgba(255,255,255,0.015)",
                border: `1px solid ${
                  isActive
                    ? "rgba(184,148,44,0.25)"
                    : "rgba(255,255,255,0.04)"
                }`,
                borderRadius: 4,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                transition: "background 0.1s, border-color 0.1s",
              }}
            >
              {/* Row 1: visibility, name, opacity badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {/* Visibility toggle */}
                <Tip label={layer.visible ? "Hide Layer" : "Show Layer"} side="left">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVisibilityChange(i, !layer.visible);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 22,
                      height: 20,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      borderRadius: 2,
                      color: layer.visible ? "#9a9aaa" : "#2e2e3e",
                      transition: "color 0.1s",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      {layer.visible ? (
                        <>
                          <path
                            d="M1 7C1 7 3.5 3 7 3C10.5 3 13 7 13 7C13 7 10.5 11 7 11C3.5 11 1 7 1 7Z"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                          />
                          <circle cx="7" cy="7" r="2" fill="currentColor" />
                        </>
                      ) : (
                        <>
                          <path
                            d="M1 7C1 7 3.5 3 7 3C10.5 3 13 7 13 7C13 7 10.5 11 7 11C3.5 11 1 7 1 7Z"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                          />
                          <line
                            x1="2"
                            y1="12"
                            x2="12"
                            y2="2"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        </>
                      )}
                    </svg>
                  </button>
                </Tip>

                {/* Layer name */}
                <input
                  value={layer.name}
                  onChange={(e) => onRename(i, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    color: isActive ? "#d4ac3c" : "#8a8a9a",
                    fontFamily: "inherit",
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 400,
                    letterSpacing: 1,
                    padding: "2px 0",
                    outline: "none",
                    minWidth: 0,
                  }}
                />

                {/* Opacity badge */}
                <span
                  style={{
                    fontSize: 10,
                    color: layer.opacity < 100 ? "#b8942c" : "#4a4a5a",
                    fontWeight: layer.opacity < 100 ? 600 : 400,
                    minWidth: 30,
                    textAlign: "right",
                    letterSpacing: 0,
                  }}
                >
                  {layer.opacity}%
                </span>
              </div>

              {/* Row 2: opacity slider (only for active layer) */}
              {isActive && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0 2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      color: "#5a5a6a",
                      letterSpacing: 1,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    OPACITY
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={layer.opacity}
                    onChange={(e) =>
                      onOpacityChange(i, Number(e.target.value))
                    }
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      height: 14,
                      cursor: "pointer",
                      accentColor: "#d4ac3c",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
