"use client";

import { useRef, useEffect } from "react";
import type { PixelBitmap } from "../_lib/pixel-bitmap";

const THUMB_SIZE = 72;

interface FrameThumbnailProps {
  pixels: PixelBitmap;
  index: number;
  isActive: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onClick: () => void;
}

export function FrameThumbnail({
  pixels,
  index,
  isActive,
  canvasWidth,
  canvasHeight,
  onClick,
}: FrameThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tmpCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = THUMB_SIZE;
    cv.height = THUMB_SIZE;
    const ctx = cv.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0e0e12";
    ctx.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE);

    // Draw via putImageData + drawImage for correct scaling
    if (!tmpCanvasRef.current) {
      tmpCanvasRef.current = document.createElement("canvas");
    }
    const tmp = tmpCanvasRef.current;
    tmp.width = canvasWidth;
    tmp.height = canvasHeight;
    const tmpCtx = tmp.getContext("2d")!;
    tmpCtx.putImageData(pixels.toImageData(), 0, 0);
    ctx.drawImage(tmp, 0, 0, THUMB_SIZE, THUMB_SIZE);
  }, [pixels, canvasWidth, canvasHeight]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        flexShrink: 0,
      }}
    >
      <div
        onClick={onClick}
        style={{
          width: THUMB_SIZE + 4,
          height: THUMB_SIZE + 4,
          border: `2px solid ${
            isActive ? "#d4ac3c" : "rgba(255,255,255,0.08)"
          }`,
          borderRadius: 4,
          cursor: "pointer",
          overflow: "hidden",
          boxShadow: isActive
            ? "0 0 10px rgba(184,148,44,0.3)"
            : "none",
          transition: "border-color 0.1s, box-shadow 0.1s",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            imageRendering: "pixelated",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 10,
          color: isActive ? "#d4ac3c" : "#6a6a7a",
          fontWeight: isActive ? 700 : 400,
          letterSpacing: 1,
        }}
      >
        {index + 1}
      </div>
    </div>
  );
}
