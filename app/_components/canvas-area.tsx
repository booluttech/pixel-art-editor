"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { S } from "../_lib/styles";
import {
  floodFill,
  getLinePoints,
  getRectPoints,
  getEllipsePoints,
  getBrushPoints,
} from "../_lib/drawing";
import { PixelBitmap, hexToU32, u32ToHex } from "../_lib/pixel-bitmap";
import type { Tool, Selection } from "../_lib/types";
import { HistoryNav } from "./history-nav";

interface OnionFrame {
  pixels: PixelBitmap;
  opacity: number;
}

interface CanvasAreaProps {
  pixels: PixelBitmap; // flattened for display
  activeLayerPixels: PixelBitmap;
  tool: Tool;
  color: string;
  zoom: number;
  showGrid: boolean;
  mirror: boolean;
  brushSize: number;
  shapeFilled: boolean;
  historyLength: number;
  redoLength: number;
  isPlaying: boolean;
  onionFrames: { prev: OnionFrame[]; next: OnionFrame[] };
  animateMode: boolean;
  currentFrameIndex: number;
  totalFrames: number;
  canvasWidth: number;
  canvasHeight: number;
  selection: Selection | null;
  activeLayerVisible: boolean;
  onActiveLayerPixelsChange: (pixels: PixelBitmap) => void;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onPushHistory: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  onSelectionChange: (sel: Selection | null) => void;
}

/** Draw a PixelBitmap onto a canvas context using putImageData + drawImage for correct alpha */
function drawBitmap(
  ctx: CanvasRenderingContext2D,
  bm: PixelBitmap,
  tmpCanvas: HTMLCanvasElement,
  sw: number,
  sh: number,
  alpha: number
) {
  tmpCanvas.width = bm.width;
  tmpCanvas.height = bm.height;
  const tmpCtx = tmpCanvas.getContext("2d")!;
  tmpCtx.putImageData(bm.toImageData(), 0, 0);
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  ctx.drawImage(tmpCanvas, 0, 0, sw, sh);
  ctx.globalAlpha = prevAlpha;
}

export function CanvasArea({
  pixels,
  activeLayerPixels,
  tool,
  color,
  zoom,
  showGrid,
  mirror,
  brushSize,
  shapeFilled,
  historyLength,
  redoLength,
  isPlaying,
  onionFrames,
  animateMode,
  currentFrameIndex,
  totalFrames,
  canvasWidth,
  canvasHeight,
  selection,
  activeLayerVisible,
  onActiveLayerPixelsChange,
  onToolChange,
  onColorChange,
  onPushHistory,
  onUndo,
  onRedo,
  onJumpToStart,
  onJumpToEnd,
  onSelectionChange,
}: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tmpCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const painting = useRef(false);
  const lastCell = useRef<{ x: number; y: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  // Lazy-init temp canvas
  const getTmpCanvas = () => {
    if (!tmpCanvasRef.current) {
      tmpCanvasRef.current = document.createElement("canvas");
    }
    return tmpCanvasRef.current;
  };

  // Shape preview state
  const [shapePreview, setShapePreview] = useState<[number, number][] | null>(
    null
  );
  // Selection drag state
  const [selDrag, setSelDrag] = useState<{
    x: number;
    y: number;
    x2: number;
    y2: number;
  } | null>(null);
  // Move drag
  const [moveDelta, setMoveDelta] = useState<{
    dx: number;
    dy: number;
  } | null>(null);

  const W = canvasWidth;
  const H = canvasHeight;

  // Draw canvas
  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const sw = W * zoom;
    const sh = H * zoom;
    cv.width = sw;
    cv.height = sh;
    const ctx = cv.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    const tmp = getTmpCanvas();

    // Checkerboard
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#141418" : "#0e0e12";
        ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
      }

    // Onion skin - previous (tinted red)
    for (const of_ of onionFrames.prev) {
      drawBitmap(ctx, of_.pixels, tmp, sw, sh, of_.opacity);
      // Red tint overlay
      ctx.globalAlpha = of_.opacity;
      ctx.fillStyle = "rgba(255,80,80,0.15)";
      const d = of_.pixels.data;
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          if (d[y * W + x] !== 0) {
            ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
          }
        }
      ctx.globalAlpha = 1.0;
    }
    // Onion skin - next (tinted blue)
    for (const of_ of onionFrames.next) {
      drawBitmap(ctx, of_.pixels, tmp, sw, sh, of_.opacity);
      ctx.globalAlpha = of_.opacity;
      ctx.fillStyle = "rgba(80,80,255,0.15)";
      const d = of_.pixels.data;
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          if (d[y * W + x] !== 0) {
            ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
          }
        }
      ctx.globalAlpha = 1.0;
    }

    // Current pixels (flattened) via putImageData + drawImage
    drawBitmap(ctx, pixels, tmp, sw, sh, 1.0);

    // Shape preview
    if (shapePreview && !isPlaying) {
      ctx.globalAlpha = 0.5;
      for (const [px, py] of shapePreview) {
        if (px >= 0 && px < W && py >= 0 && py < H) {
          ctx.fillStyle = color;
          ctx.fillRect(px * zoom, py * zoom, zoom, zoom);
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // Selection rectangle
    if (selDrag && !isPlaying) {
      const sx = Math.min(selDrag.x, selDrag.x2) * zoom;
      const sy = Math.min(selDrag.y, selDrag.y2) * zoom;
      const sw2 = (Math.abs(selDrag.x2 - selDrag.x) + 1) * zoom;
      const sh2 = (Math.abs(selDrag.y2 - selDrag.y) + 1) * zoom;
      ctx.strokeStyle = "#d4ac3c";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(sx + 0.5, sy + 0.5, sw2 - 1, sh2 - 1);
      ctx.setLineDash([]);
    }
    if (selection && !isPlaying) {
      const sx = selection.x * zoom;
      const sy = selection.y * zoom;
      const sw2 = selection.w * zoom;
      const sh2 = selection.h * zoom;
      ctx.strokeStyle = "#d4ac3c";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(sx + 0.5, sy + 0.5, sw2 - 1, sh2 - 1);
      ctx.setLineDash([]);
      // Draw floating selection content
      if (selection.pixels && moveDelta) {
        const selBm = selection.pixels;
        const offX = (selection.x + moveDelta.dx) * zoom;
        const offY = (selection.y + moveDelta.dy) * zoom;
        tmp.width = selBm.width;
        tmp.height = selBm.height;
        const tmpCtx = tmp.getContext("2d")!;
        tmpCtx.putImageData(selBm.toImageData(), 0, 0);
        ctx.globalAlpha = 0.7;
        ctx.drawImage(
          tmp,
          offX,
          offY,
          selBm.width * zoom,
          selBm.height * zoom
        );
        ctx.globalAlpha = 1.0;
      }
    }

    // Grid
    if (showGrid && zoom >= 4 && !isPlaying) {
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= W; i++) {
        ctx.beginPath();
        ctx.moveTo(i * zoom, 0);
        ctx.lineTo(i * zoom, sh);
        ctx.stroke();
      }
      for (let i = 0; i <= H; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * zoom);
        ctx.lineTo(sw, i * zoom);
        ctx.stroke();
      }
    }
  }, [
    pixels,
    zoom,
    showGrid,
    onionFrames,
    isPlaying,
    W,
    H,
    shapePreview,
    tool,
    color,
    selDrag,
    selection,
    moveDelta,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getCell = (e: React.MouseEvent | React.TouchEvent) => {
    const cv = canvasRef.current;
    if (!cv) return null;
    const rect = cv.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = Math.floor((clientX - rect.left) / zoom);
    const y = Math.floor((clientY - rect.top) / zoom);
    if (x < 0 || x >= W || y < 0 || y >= H) return null;
    return { x, y };
  };

  const applyBrush = useCallback(
    (
      px: PixelBitmap,
      cx: number,
      cy: number,
      c: number
    ): PixelBitmap => {
      const np = px.clone();
      const points = getBrushPoints(cx, cy, brushSize, W, H);
      for (const [bx, by] of points) {
        np.set(bx, by, c);
        if (mirror) {
          const mx = W - 1 - bx;
          if (mx >= 0 && mx < W) np.set(mx, by, c);
        }
      }
      return np;
    },
    [brushSize, mirror, W, H]
  );

  const applyTool = useCallback(
    (cell: { x: number; y: number } | null) => {
      if (!cell || isPlaying || !activeLayerVisible) return;
      const { x, y } = cell;

      if (tool === "pick") {
        const u = pixels.get(x, y);
        if (u !== 0) onColorChange(u32ToHex(u));
        onToolChange("pen");
        return;
      }
      if (tool === "fill") {
        onPushHistory();
        onActiveLayerPixelsChange(
          floodFill(activeLayerPixels, x, y, hexToU32(color), W, H)
        );
        return;
      }
      if (tool === "pen" || tool === "eraser") {
        const c = tool === "eraser" ? 0 : hexToU32(color);
        onActiveLayerPixelsChange(applyBrush(activeLayerPixels, x, y, c));
      }
    },
    [
      tool,
      color,
      activeLayerPixels,
      pixels,
      mirror,
      isPlaying,
      activeLayerVisible,
      brushSize,
      W,
      H,
      onPushHistory,
      onActiveLayerPixelsChange,
      onColorChange,
      onToolChange,
      applyBrush,
    ]
  );

  const isShapeTool = tool === "line" || tool === "rect" || tool === "ellipse";

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPlaying) return;
    e.preventDefault();
    const cell = getCell(e);
    if (!cell) return;

    if (tool === "select") {
      // Start selection drag
      onSelectionChange(null);
      setSelDrag({ x: cell.x, y: cell.y, x2: cell.x, y2: cell.y });
      return;
    }

    if (tool === "move" && selection) {
      // Start moving selection
      dragStart.current = cell;
      setMoveDelta({ dx: 0, dy: 0 });
      return;
    }

    if (isShapeTool) {
      dragStart.current = cell;
      onPushHistory();
      return;
    }

    painting.current = true;
    lastCell.current = cell;
    if (tool === "pen" || tool === "eraser") onPushHistory();
    applyTool(cell);
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPlaying) return;
    e.preventDefault();
    const cell = getCell(e);

    // Cursor overlay
    if (overlayRef.current && cell) {
      const half = Math.floor(brushSize / 2);
      overlayRef.current.style.left = (cell.x - half) * zoom + "px";
      overlayRef.current.style.top = (cell.y - half) * zoom + "px";
      overlayRef.current.style.width = brushSize * zoom + "px";
      overlayRef.current.style.height = brushSize * zoom + "px";
      overlayRef.current.style.display = "block";
    } else if (overlayRef.current) {
      overlayRef.current.style.display = "none";
    }

    // Selection drag
    if (selDrag && cell) {
      setSelDrag((s) => (s ? { ...s, x2: cell.x, y2: cell.y } : null));
      return;
    }

    // Move drag
    if (tool === "move" && dragStart.current && cell && selection) {
      setMoveDelta({
        dx: cell.x - dragStart.current.x,
        dy: cell.y - dragStart.current.y,
      });
      return;
    }

    // Shape preview
    if (isShapeTool && dragStart.current && cell) {
      let pts: [number, number][];
      if (tool === "line") {
        pts = getLinePoints(
          dragStart.current.x,
          dragStart.current.y,
          cell.x,
          cell.y
        );
      } else if (tool === "rect") {
        pts = getRectPoints(
          dragStart.current.x,
          dragStart.current.y,
          cell.x,
          cell.y,
          shapeFilled
        );
      } else {
        pts = getEllipsePoints(
          dragStart.current.x,
          dragStart.current.y,
          cell.x,
          cell.y,
          shapeFilled
        );
      }
      setShapePreview(pts);
      return;
    }

    if (!painting.current || !cell) return;
    if (
      lastCell.current &&
      cell.x === lastCell.current.x &&
      cell.y === lastCell.current.y
    )
      return;

    // Interpolate pen/eraser for smooth lines
    if (
      (tool === "pen" || tool === "eraser") &&
      lastCell.current
    ) {
      const linePoints = getLinePoints(
        lastCell.current.x,
        lastCell.current.y,
        cell.x,
        cell.y
      );
      const c = tool === "eraser" ? 0 : hexToU32(color);
      const current = activeLayerPixels.clone();
      for (const [lx, ly] of linePoints) {
        const pts = getBrushPoints(lx, ly, brushSize, W, H);
        for (const [bx, by] of pts) {
          current.set(bx, by, c);
          if (mirror) {
            const mx = W - 1 - bx;
            if (mx >= 0 && mx < W) current.set(mx, by, c);
          }
        }
      }
      onActiveLayerPixelsChange(current);
    } else {
      applyTool(cell);
    }

    lastCell.current = cell;
  };

  const onUp = () => {
    // Commit shape
    if (isShapeTool && dragStart.current && shapePreview) {
      const np = activeLayerPixels.clone();
      const c = hexToU32(color);
      for (const [px, py] of shapePreview) {
        if (px >= 0 && px < W && py >= 0 && py < H) {
          np.set(px, py, c);
          if (mirror) {
            const mx = W - 1 - px;
            if (mx >= 0 && mx < W) np.set(mx, py, c);
          }
        }
      }
      onActiveLayerPixelsChange(np);
      setShapePreview(null);
      dragStart.current = null;
    }

    // Commit selection
    if (selDrag) {
      const x = Math.min(selDrag.x, selDrag.x2);
      const y = Math.min(selDrag.y, selDrag.y2);
      const w = Math.abs(selDrag.x2 - selDrag.x) + 1;
      const h = Math.abs(selDrag.y2 - selDrag.y) + 1;
      if (w > 1 || h > 1) {
        // Copy selection content
        const selPixels = PixelBitmap.empty(w, h);
        for (let sy = 0; sy < h; sy++) {
          for (let sx = 0; sx < w; sx++) {
            const srcX = x + sx;
            const srcY = y + sy;
            if (srcX < W && srcY < H) {
              selPixels.set(sx, sy, activeLayerPixels.get(srcX, srcY));
            }
          }
        }
        onSelectionChange({ x, y, w, h, pixels: selPixels });
      }
      setSelDrag(null);
    }

    // Commit move
    if (tool === "move" && moveDelta && selection?.pixels) {
      onPushHistory();
      const np = activeLayerPixels.clone();
      // Clear original position
      for (let sy = 0; sy < selection.h; sy++)
        for (let sx = 0; sx < selection.w; sx++) {
          const ox = selection.x + sx;
          const oy = selection.y + sy;
          if (ox >= 0 && ox < W && oy >= 0 && oy < H) {
            np.set(ox, oy, 0);
          }
        }
      // Place at new position
      for (let sy = 0; sy < selection.h; sy++)
        for (let sx = 0; sx < selection.w; sx++) {
          const nx = selection.x + sx + moveDelta.dx;
          const ny = selection.y + sy + moveDelta.dy;
          const srcPx = selection.pixels.get(sx, sy);
          if (
            nx >= 0 &&
            nx < W &&
            ny >= 0 &&
            ny < H &&
            srcPx !== 0
          ) {
            np.set(nx, ny, srcPx);
          }
        }
      onActiveLayerPixelsChange(np);
      onSelectionChange({
        ...selection,
        x: selection.x + moveDelta.dx,
        y: selection.y + moveDelta.dy,
      });
      setMoveDelta(null);
      dragStart.current = null;
    }

    painting.current = false;
    lastCell.current = null;
    dragStart.current = null;
  };

  return (
    <div style={S.main}>
      {!isPlaying ? (
        <HistoryNav
          historyLength={historyLength}
          redoLength={redoLength}
          onUndo={onUndo}
          onRedo={onRedo}
          onJumpToStart={onJumpToStart}
          onJumpToEnd={onJumpToEnd}
        />
      ) : (
        <div
          style={{
            marginBottom: 12,
            fontSize: 12,
            letterSpacing: 2,
            color: "#b8942c",
            fontWeight: 700,
            userSelect: "none",
          }}
        >
          PLAYING &middot; FRAME {currentFrameIndex + 1} / {totalFrames}
        </div>
      )}

      <div
        style={{
          position: "relative",
          cursor: isPlaying
            ? "default"
            : tool === "move"
              ? "grab"
              : "crosshair",
          touchAction: "none",
          boxShadow: isPlaying
            ? "0 0 80px rgba(184,148,44,0.15)"
            : "0 0 80px rgba(0,0,0,0.5)",
          border: `1px solid ${
            isPlaying ? "rgba(184,148,44,0.15)" : "rgba(255,255,255,0.03)"
          }`,
          borderRadius: 4,
          overflow: "hidden",
          transition: "box-shadow 0.2s, border-color 0.2s",
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={() => {
            onUp();
            if (overlayRef.current)
              overlayRef.current.style.display = "none";
          }}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
          style={{ display: "block", imageRendering: "pixelated" }}
        />
        {!isPlaying && (
          <div
            ref={overlayRef}
            style={{
              position: "absolute",
              border: `1px solid ${
                tool === "eraser"
                  ? "rgba(255,100,100,0.5)"
                  : "rgba(184,148,44,0.5)"
              }`,
              pointerEvents: "none",
              display: "none",
              boxSizing: "border-box",
            }}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 10,
          fontSize: 11,
          color: "#5a5a6a",
          letterSpacing: 1,
          flexWrap: "wrap",
        }}
      >
        <span>
          {W}&times;{H}
        </span>
        <span>ZOOM {zoom}x</span>
        <span>TOOL: {tool.toUpperCase()}</span>
        {brushSize > 1 && <span>BRUSH: {brushSize}px</span>}
        <span>EDITS: {historyLength + redoLength}</span>
        {mirror && <span style={{ color: "#b8942c" }}>MIRROR ON</span>}
        {animateMode && (
          <span style={{ color: "#8a6e1e" }}>
            FRAME {currentFrameIndex + 1}/{totalFrames}
          </span>
        )}
        {selection && (
          <span style={{ color: "#d4ac3c" }}>
            SEL: {selection.w}x{selection.h}
          </span>
        )}
      </div>
    </div>
  );
}
