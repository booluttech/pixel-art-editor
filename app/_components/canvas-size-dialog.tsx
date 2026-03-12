"use client";

import { useState } from "react";
import {
  CANVAS_PRESETS,
  MIN_SIZE,
  MAX_SIZE,
} from "../_lib/constants";
import { S } from "../_lib/styles";

interface CanvasSizeDialogProps {
  currentWidth: number;
  currentHeight: number;
  onResize: (w: number, h: number) => void;
  onClose: () => void;
}

export function CanvasSizeDialog({
  currentWidth,
  currentHeight,
  onResize,
  onClose,
}: CanvasSizeDialogProps) {
  const [w, setW] = useState(currentWidth);
  const [h, setH] = useState(currentHeight);

  const clamp = (v: number) =>
    Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(v)));

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
          minWidth: 300,
          cursor: "default",
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
          CANVAS SIZE
        </div>

        <div
          style={{
            fontSize: 11,
            color: "#6a6a7a",
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          Current: {currentWidth}&times;{currentHeight}
        </div>

        {/* Presets */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {CANVAS_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setW(p.w);
                setH(p.h);
              }}
              style={{
                ...S.smallBtn,
                flex: "1 0 auto",
                background:
                  w === p.w && h === p.h
                    ? "rgba(184,148,44,0.12)"
                    : undefined,
                color:
                  w === p.w && h === p.h ? "#d4ac3c" : undefined,
                border:
                  w === p.w && h === p.h
                    ? "1px solid rgba(184,148,44,0.3)"
                    : undefined,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom inputs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <label style={{ fontSize: 11, color: "#6a6a7a" }}>W</label>
          <input
            type="number"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={w}
            onChange={(e) => setW(clamp(Number(e.target.value)))}
            style={inputStyle}
          />
          <span style={{ color: "#5a5a6a" }}>&times;</span>
          <label style={{ fontSize: 11, color: "#6a6a7a" }}>H</label>
          <input
            type="number"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={h}
            onChange={(e) => setH(clamp(Number(e.target.value)))}
            style={inputStyle}
          />
        </div>

        <div
          style={{
            fontSize: 10,
            color: "#5a5a6a",
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          {MIN_SIZE}-{MAX_SIZE}px, existing content preserved
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            onClick={() => {
              if (w !== currentWidth || h !== currentHeight) {
                onResize(clamp(w), clamp(h));
              }
              onClose();
            }}
            style={{
              padding: "8px 20px",
              borderRadius: 4,
              background: "rgba(184,148,44,0.12)",
              border: "1px solid rgba(184,148,44,0.3)",
              color: "#d4ac3c",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            APPLY
          </button>
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
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: 60,
  padding: "5px 8px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 3,
  color: "#b0b0c0",
  fontFamily: "inherit",
  fontSize: 13,
  textAlign: "center" as const,
};
