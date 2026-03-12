"use client";

import { useRef, useEffect } from "react";
import { S } from "../_lib/styles";
import { flattenLayers } from "../_lib/drawing";
import type { AnimationFrame, OnionSkinSettings } from "../_lib/types";
import { FrameThumbnail } from "./frame-thumbnail";
import { Tip } from "./tip";

interface TimelinePanelProps {
  frames: AnimationFrame[];
  currentFrameIndex: number;
  fps: number;
  isPlaying: boolean;
  loop: boolean;
  onionSkin: OnionSkinSettings;
  canvasWidth: number;
  canvasHeight: number;
  onSelectFrame: (index: number) => void;
  onAddFrame: () => void;
  onDuplicateFrame: (index: number) => void;
  onDeleteFrame: (index: number) => void;
  onMoveFrame: (from: number, to: number) => void;
  onFpsChange: (fps: number) => void;
  onTogglePlay: () => void;
  onToggleLoop: () => void;
  onOnionSkinChange: (os: OnionSkinSettings) => void;
  onPrevFrame: () => void;
  onNextFrame: () => void;
}

const frameActionBtn = {
  height: 30,
  borderRadius: 3,
  cursor: "pointer",
  padding: "0 12px",
  fontFamily: "inherit",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  transition: "all 0.1s",
} as const;

export function TimelinePanel({
  frames,
  currentFrameIndex,
  fps,
  isPlaying,
  loop,
  onionSkin,
  canvasWidth,
  canvasHeight,
  onSelectFrame,
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  onMoveFrame,
  onFpsChange,
  onTogglePlay,
  onToggleLoop,
  onOnionSkinChange,
  onPrevFrame,
  onNextFrame,
}: TimelinePanelProps) {
  const totalTime = frames.length / fps;
  const stripRef = useRef<HTMLDivElement>(null);
  const canMoveLeft = currentFrameIndex > 0;
  const canMoveRight = currentFrameIndex < frames.length - 1;
  const canDelete = frames.length > 1;

  useEffect(() => {
    if (!stripRef.current) return;
    const active = stripRef.current.children[
      currentFrameIndex
    ] as HTMLElement;
    if (active) {
      active.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentFrameIndex]);

  return (
    <div
      style={{
        background: "#0c0c16",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "10px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {/* Row 1: Playback controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <Tip label="Previous Frame (,)" side="top">
          <button
            onClick={onPrevFrame}
            disabled={isPlaying}
            style={{
              ...S.smallBtn,
              width: 28,
              height: 28,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: isPlaying ? "#2e2e3e" : "#8a8a9a",
            }}
          >
            &#9664;
          </button>
        </Tip>

        <Tip
          label={isPlaying ? "Pause (Space)" : "Play (Space)"}
          side="top"
        >
          <button
            onClick={onTogglePlay}
            style={{
              width: 32,
              height: 28,
              borderRadius: 3,
              background: isPlaying
                ? "rgba(184,148,44,0.18)"
                : "rgba(184,148,44,0.1)",
              border: `1px solid ${
                isPlaying
                  ? "rgba(184,148,44,0.4)"
                  : "rgba(184,148,44,0.25)"
              }`,
              color: "#d4ac3c",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            {isPlaying ? "\u2016" : "\u25B6"}
          </button>
        </Tip>

        <Tip label="Next Frame (.)" side="top">
          <button
            onClick={onNextFrame}
            disabled={isPlaying}
            style={{
              ...S.smallBtn,
              width: 28,
              height: 28,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: isPlaying ? "#2e2e3e" : "#8a8a9a",
            }}
          >
            &#9654;
          </button>
        </Tip>

        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.06)",
            margin: "0 2px",
          }}
        />

        {/* FPS control */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            letterSpacing: 1,
          }}
        >
          <span style={{ color: "#6a6a7a", fontWeight: 600 }}>FPS</span>
          <Tip label="Decrease FPS" side="top">
            <button
              onClick={() => onFpsChange(Math.max(1, fps - 1))}
              style={{
                ...S.smallBtn,
                width: 22,
                height: 22,
                padding: 0,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              -
            </button>
          </Tip>
          <span
            style={{
              minWidth: 18,
              textAlign: "center",
              fontWeight: 700,
              color: "#d4ac3c",
              fontSize: 12,
            }}
          >
            {fps}
          </span>
          <Tip label="Increase FPS" side="top">
            <button
              onClick={() => onFpsChange(Math.min(24, fps + 1))}
              style={{
                ...S.smallBtn,
                width: 22,
                height: 22,
                padding: 0,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              +
            </button>
          </Tip>
        </div>

        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.06)",
            margin: "0 2px",
          }}
        />

        <Tip label="Toggle Loop" side="top">
          <button
            onClick={onToggleLoop}
            style={{
              ...S.smallBtn,
              height: 26,
              fontSize: 11,
              letterSpacing: 1,
              color: loop ? "#d4ac3c" : "#6a6a7a",
              background: loop ? "rgba(184,148,44,0.1)" : undefined,
              border: loop
                ? "1px solid rgba(184,148,44,0.25)"
                : "1px solid rgba(255,255,255,0.07)",
              fontWeight: loop ? 700 : 400,
            }}
          >
            LOOP
          </button>
        </Tip>

        <Tip label="Onion Skin (O)" side="top">
          <button
            onClick={() =>
              onOnionSkinChange({
                ...onionSkin,
                enabled: !onionSkin.enabled,
              })
            }
            style={{
              ...S.smallBtn,
              height: 26,
              fontSize: 11,
              letterSpacing: 1,
              color: onionSkin.enabled ? "#d4ac3c" : "#6a6a7a",
              background: onionSkin.enabled
                ? "rgba(184,148,44,0.1)"
                : undefined,
              border: onionSkin.enabled
                ? "1px solid rgba(184,148,44,0.25)"
                : "1px solid rgba(255,255,255,0.07)",
              fontWeight: onionSkin.enabled ? 700 : 400,
            }}
          >
            ONION
          </button>
        </Tip>

        {/* Onion skin prev/next count */}
        {onionSkin.enabled && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                fontSize: 10,
                color: "#6a6a7a",
              }}
            >
              <span style={{ color: "#cc6666" }}>P{onionSkin.prevCount}</span>
              <button
                onClick={() =>
                  onOnionSkinChange({
                    ...onionSkin,
                    prevCount: onionSkin.prevCount >= 3 ? 1 : onionSkin.prevCount + 1,
                  })
                }
                style={{ ...S.smallBtn, padding: "1px 4px", fontSize: 9 }}
              >
                +
              </button>
              <span style={{ color: "#6666cc" }}>N{onionSkin.nextCount}</span>
              <button
                onClick={() =>
                  onOnionSkinChange({
                    ...onionSkin,
                    nextCount: onionSkin.nextCount >= 3 ? 0 : onionSkin.nextCount + 1,
                  })
                }
                style={{ ...S.smallBtn, padding: "1px 4px", fontSize: 9 }}
              >
                +
              </button>
            </div>
          </>
        )}

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontSize: 11,
            color: "#6a6a7a",
            letterSpacing: 1,
            textAlign: "right",
          }}
        >
          <span style={{ color: "#8a8a9a", fontWeight: 700 }}>
            {currentFrameIndex + 1}/{frames.length}
          </span>
          &nbsp;&middot;&nbsp;
          {totalTime.toFixed(1)}s @ {fps}fps
        </div>
      </div>

      {/* Row 2: Frame actions toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 0",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: 2,
            color: "#5a5a6a",
            fontWeight: 600,
            marginRight: 2,
          }}
        >
          FRAME {currentFrameIndex + 1}
        </span>

        <Tip label="Move Frame Left" side="top">
          <button
            onClick={() =>
              onMoveFrame(currentFrameIndex, currentFrameIndex - 1)
            }
            disabled={!canMoveLeft}
            style={{
              ...frameActionBtn,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${
                canMoveLeft
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.04)"
              }`,
              color: canMoveLeft ? "#8a8a9a" : "#2e2e3e",
              cursor: canMoveLeft ? "pointer" : "default",
            }}
          >
            &#9664;
          </button>
        </Tip>

        <Tip label="Move Frame Right" side="top">
          <button
            onClick={() =>
              onMoveFrame(currentFrameIndex, currentFrameIndex + 1)
            }
            disabled={!canMoveRight}
            style={{
              ...frameActionBtn,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${
                canMoveRight
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.04)"
              }`,
              color: canMoveRight ? "#8a8a9a" : "#2e2e3e",
              cursor: canMoveRight ? "pointer" : "default",
            }}
          >
            &#9654;
          </button>
        </Tip>

        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.06)",
            margin: "0 2px",
          }}
        />

        <Tip label="Duplicate Frame (D)" side="top">
          <button
            onClick={() => onDuplicateFrame(currentFrameIndex)}
            style={{
              ...frameActionBtn,
              background: "rgba(184,148,44,0.08)",
              border: "1px solid rgba(184,148,44,0.25)",
              color: "#d4ac3c",
            }}
          >
            DUP
          </button>
        </Tip>

        <Tip label="Add Blank Frame (N)" side="top">
          <button
            onClick={onAddFrame}
            style={{
              ...frameActionBtn,
              background: "rgba(184,148,44,0.08)",
              border: "1px dashed rgba(184,148,44,0.25)",
              color: "#b8942c",
            }}
          >
            + NEW
          </button>
        </Tip>

        <Tip label="Delete Frame" side="top">
          <button
            onClick={() => {
              if (canDelete) onDeleteFrame(currentFrameIndex);
            }}
            disabled={!canDelete}
            style={{
              ...frameActionBtn,
              background: canDelete
                ? "rgba(255,80,80,0.08)"
                : "rgba(255,255,255,0.02)",
              border: `1px solid ${
                canDelete
                  ? "rgba(255,80,80,0.2)"
                  : "rgba(255,255,255,0.04)"
              }`,
              color: canDelete ? "#cc5555" : "#2e2e3e",
              cursor: canDelete ? "pointer" : "default",
            }}
          >
            DEL
          </button>
        </Tip>
      </div>

      {/* Row 3: Frame strip */}
      <div
        ref={stripRef}
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: 4,
          alignItems: "flex-start",
        }}
      >
        {frames.map((frame, i) => (
          <FrameThumbnail
            key={frame.id}
            pixels={flattenLayers(frame.layers, canvasWidth, canvasHeight)}
            index={i}
            isActive={i === currentFrameIndex}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onClick={() => onSelectFrame(i)}
          />
        ))}
      </div>
    </div>
  );
}
