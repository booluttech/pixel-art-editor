"use client";

import { S } from "../_lib/styles";
import { Tip } from "./tip";

interface HistoryNavProps {
  historyLength: number;
  redoLength: number;
  onUndo: () => void;
  onRedo: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
}

export function HistoryNav({
  historyLength,
  redoLength,
  onUndo,
  onRedo,
  onJumpToStart,
  onJumpToEnd,
}: HistoryNavProps) {
  const total = historyLength + redoLength;
  const progress = total > 0 ? (historyLength / total) * 100 : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
        userSelect: "none",
      }}
    >
      <Tip label="Undo (Ctrl+Z)" side="top">
        <button
          onClick={onUndo}
          disabled={!historyLength}
          style={{
            width: 44,
            height: 44,
            borderRadius: 4,
            background: historyLength
              ? "rgba(184,148,44,0.1)"
              : "rgba(255,255,255,0.02)",
            border: `1px solid ${
              historyLength
                ? "rgba(184,148,44,0.3)"
                : "rgba(255,255,255,0.05)"
            }`,
            color: historyLength ? "#d4ac3c" : "#2e2e3e",
            cursor: historyLength ? "pointer" : "default",
            fontFamily: "inherit",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
        >
          &#9664;
        </button>
      </Tip>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 130,
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: 2,
            color: "#8a8a9a",
            fontWeight: 700,
          }}
        >
          STEP {historyLength} / {total}
        </div>
        <div
          style={{
            width: 130,
            height: 4,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 2,
            marginTop: 4,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #8a6e1e, #d4ac3c)",
              borderRadius: 2,
              transition: "width 0.15s",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#5a5a6a",
            marginTop: 3,
            letterSpacing: 1,
          }}
        >
          {historyLength ? "\u25C0 BACK" : ""}
          {historyLength && redoLength ? "  \u2022  " : ""}
          {redoLength ? "FWD \u25B6" : ""}
          {!historyLength && !redoLength ? "NO EDITS YET" : ""}
        </div>
      </div>

      <Tip label="Redo (Ctrl+Shift+Z)" side="top">
        <button
          onClick={onRedo}
          disabled={!redoLength}
          style={{
            width: 44,
            height: 44,
            borderRadius: 4,
            background: redoLength
              ? "rgba(184,148,44,0.1)"
              : "rgba(255,255,255,0.02)",
            border: `1px solid ${
              redoLength
                ? "rgba(184,148,44,0.3)"
                : "rgba(255,255,255,0.05)"
            }`,
            color: redoLength ? "#d4ac3c" : "#2e2e3e",
            cursor: redoLength ? "pointer" : "default",
            fontFamily: "inherit",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
        >
          &#9654;
        </button>
      </Tip>

      <div
        style={{
          width: 1,
          height: 28,
          background: "rgba(255,255,255,0.06)",
          margin: "0 4px",
        }}
      />

      <Tip label="Jump to original" side="top">
        <button
          onClick={onJumpToStart}
          disabled={!historyLength}
          style={{
            ...S.smallBtn,
            color: historyLength ? "#8a8a9a" : "#2e2e3e",
            border: `1px solid ${
              historyLength
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.04)"
            }`,
            cursor: historyLength ? "pointer" : "default",
            fontSize: 13,
          }}
        >
          &#9198;
        </button>
      </Tip>
      <Tip label="Jump to latest" side="top">
        <button
          onClick={onJumpToEnd}
          disabled={!redoLength}
          style={{
            ...S.smallBtn,
            color: redoLength ? "#8a8a9a" : "#2e2e3e",
            border: `1px solid ${
              redoLength
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.04)"
            }`,
            cursor: redoLength ? "pointer" : "default",
            fontSize: 13,
          }}
        >
          &#9197;
        </button>
      </Tip>
    </div>
  );
}
