import { PixelBitmap, blendU32 } from "./pixel-bitmap";

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Bresenham line
export function getLinePoints(
  x0: number,
  y0: number,
  x1: number,
  y1: number
): [number, number][] {
  const points: [number, number][] = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0,
    cy = y0;
  while (true) {
    points.push([cx, cy]);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
  return points;
}

// Rectangle outline
export function getRectPoints(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  filled: boolean
): [number, number][] {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  const points: [number, number][] = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (filled || x === minX || x === maxX || y === minY || y === maxY) {
        points.push([x, y]);
      }
    }
  }
  return points;
}

// Midpoint ellipse
export function getEllipsePoints(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  filled: boolean
): [number, number][] {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const rx = Math.abs(x1 - x0) / 2;
  const ry = Math.abs(y1 - y0) / 2;
  if (rx < 0.5 || ry < 0.5) {
    return getLinePoints(x0, y0, x1, y1);
  }
  const points = new Set<string>();
  const add = (px: number, py: number) => {
    const ix = Math.round(px);
    const iy = Math.round(py);
    points.add(`${ix},${iy}`);
  };

  const steps = Math.max(Math.ceil(Math.PI * (rx + ry)), 64);
  for (let i = 0; i <= steps; i++) {
    const a = (2 * Math.PI * i) / steps;
    add(cx + rx * Math.cos(a), cy + ry * Math.sin(a));
  }

  const result: [number, number][] = [];
  if (filled) {
    const minY = Math.round(cy - ry);
    const maxY = Math.round(cy + ry);
    for (let y = minY; y <= maxY; y++) {
      const dy = y - cy;
      const span = rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry)));
      const left = Math.round(cx - span);
      const right = Math.round(cx + span);
      for (let x = left; x <= right; x++) {
        result.push([x, y]);
      }
    }
  } else {
    for (const key of points) {
      const [x, y] = key.split(",").map(Number);
      result.push([x, y]);
    }
  }
  return result;
}

// Flood fill
export function floodFill(
  pixels: PixelBitmap,
  startX: number,
  startY: number,
  newColor: number,
  w: number,
  h: number
): PixelBitmap {
  const target = pixels.get(startX, startY);
  if (target === newColor) return pixels;
  const np = pixels.clone();
  const stack: [number, number][] = [[startX, startY]];
  const visited = new Uint8Array(w * h);
  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
    const idx = cy * w + cx;
    if (visited[idx]) continue;
    visited[idx] = 1;
    if (np.data[idx] !== target) continue;
    np.data[idx] = newColor;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  return np;
}

// Brush stamp
export function getBrushPoints(
  cx: number,
  cy: number,
  size: number,
  w: number,
  h: number
): [number, number][] {
  const half = Math.floor(size / 2);
  const points: [number, number][] = [];
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const px = cx - half + dx;
      const py = cy - half + dy;
      if (px >= 0 && px < w && py >= 0 && py < h) {
        points.push([px, py]);
      }
    }
  }
  return points;
}

// Flatten layers into a single PixelBitmap for display/export
export function flattenLayers(
  layers: { pixels: PixelBitmap; visible: boolean; opacity: number }[],
  w: number,
  h: number
): PixelBitmap {
  const result = PixelBitmap.empty(w, h);
  const len = w * h;
  for (const layer of layers) {
    if (!layer.visible || layer.opacity === 0) continue;
    const alpha = layer.opacity / 100;
    const src = layer.pixels.data;
    const dst = result.data;
    for (let i = 0; i < len; i++) {
      const px = src[i];
      if (px !== 0) {
        if (alpha >= 1 || dst[i] === 0) {
          dst[i] = px;
        } else {
          dst[i] = blendU32(dst[i], px, alpha);
        }
      }
    }
  }
  return result;
}
