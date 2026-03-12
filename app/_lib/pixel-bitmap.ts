/**
 * Uint32Array-backed bitmap for pixel art.
 * Pixel format: 0xAABBGGRR (little-endian) where 0 = transparent.
 * When viewed as Uint8ClampedArray, bytes appear R,G,B,A matching ImageData.
 */
export class PixelBitmap {
  readonly width: number;
  readonly height: number;
  readonly data: Uint32Array;

  constructor(width: number, height: number, data?: Uint32Array) {
    this.width = width;
    this.height = height;
    this.data = data ?? new Uint32Array(width * height);
  }

  get(x: number, y: number): number {
    return this.data[y * this.width + x];
  }

  set(x: number, y: number, value: number): void {
    this.data[y * this.width + x] = value;
  }

  clone(): PixelBitmap {
    return new PixelBitmap(this.width, this.height, this.data.slice());
  }

  clear(): void {
    this.data.fill(0);
  }

  toImageData(): ImageData {
    const buf = new ArrayBuffer(this.data.length * 4);
    const u32 = new Uint32Array(buf);
    u32.set(this.data);
    const clamped = new Uint8ClampedArray(buf);
    return new ImageData(clamped, this.width, this.height);
  }

  toJSON(): { w: number; h: number; d: string } {
    const bytes = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return { w: this.width, h: this.height, d: btoa(binary) };
  }

  static fromJSON(json: { w: number; h: number; d: string }): PixelBitmap {
    const binary = atob(json.d);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const data = new Uint32Array(bytes.buffer);
    return new PixelBitmap(json.w, json.h, data);
  }

  static empty(w: number, h: number): PixelBitmap {
    return new PixelBitmap(w, h);
  }
}

/** "#rrggbb" -> 0xFFBBGGRR (opaque, ABGR little-endian for ImageData) */
export function hexToU32(hex: string): number {
  const v = parseInt(hex.slice(1), 16);
  const r = (v >> 16) & 0xff;
  const g = (v >> 8) & 0xff;
  const b = v & 0xff;
  return ((0xff << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

/** 0xAABBGGRR -> "#rrggbb" */
export function u32ToHex(u: number): string {
  const r = u & 0xff;
  const g = (u >> 8) & 0xff;
  const b = (u >> 16) & 0xff;
  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  );
}

/** Alpha blend two uint32 pixels. alpha is 0-1. */
export function blendU32(base: number, top: number, alpha: number): number {
  if (alpha >= 1) return top;
  if (alpha <= 0) return base;
  const br = base & 0xff;
  const bg = (base >> 8) & 0xff;
  const bb = (base >> 16) & 0xff;
  const tr = top & 0xff;
  const tg = (top >> 8) & 0xff;
  const tb = (top >> 16) & 0xff;
  const r = Math.round(br * (1 - alpha) + tr * alpha);
  const g = Math.round(bg * (1 - alpha) + tg * alpha);
  const b = Math.round(bb * (1 - alpha) + tb * alpha);
  return ((0xff << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

/** Convert old PixelGrid format to PixelBitmap */
export function pixelGridToBitmap(
  grid: (string | null)[][],
  w: number,
  h: number
): PixelBitmap {
  const bm = PixelBitmap.empty(w, h);
  for (let y = 0; y < h; y++) {
    const row = grid[y];
    if (!row) continue;
    for (let x = 0; x < w; x++) {
      const px = row[x];
      if (px) bm.set(x, y, hexToU32(px));
    }
  }
  return bm;
}
