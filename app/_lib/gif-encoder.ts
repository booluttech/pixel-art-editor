import { PixelBitmap, u32ToHex } from "./pixel-bitmap";

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
}

function buildColorTable(frames: PixelBitmap[]): string[] {
  const set = new Set<string>();
  for (const frame of frames) {
    const data = frame.data;
    for (let i = 0; i < data.length; i++) {
      if (data[i] !== 0) set.add(u32ToHex(data[i]));
    }
  }
  const colors = Array.from(set);
  // GIF requires power-of-2 color table. We need +1 for transparent.
  while (colors.length < 255) colors.push("#000000");
  // index 255 = transparent
  colors.push("#000000");
  return colors;
}

function lzwEncode(indexStream: number[], minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const maxCode = 4095;

  const table = new Map<string, number>();
  for (let i = 0; i < clearCode; i++) table.set(String(i), i);

  const output: number[] = [];
  let buffer = 0;
  let bitsInBuffer = 0;

  const emit = (code: number) => {
    buffer |= code << bitsInBuffer;
    bitsInBuffer += codeSize;
    while (bitsInBuffer >= 8) {
      output.push(buffer & 0xff);
      buffer >>= 8;
      bitsInBuffer -= 8;
    }
  };

  emit(clearCode);

  let w = String(indexStream[0]);
  for (let i = 1; i < indexStream.length; i++) {
    const k = String(indexStream[i]);
    const wk = w + "," + k;
    if (table.has(wk)) {
      w = wk;
    } else {
      emit(table.get(w)!);
      if (nextCode <= maxCode) {
        table.set(wk, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
      } else {
        emit(clearCode);
        table.clear();
        for (let j = 0; j < clearCode; j++) table.set(String(j), j);
        nextCode = eoiCode + 1;
        codeSize = minCodeSize + 1;
      }
      w = k;
    }
  }
  emit(table.get(w)!);
  emit(eoiCode);
  if (bitsInBuffer > 0) output.push(buffer & 0xff);

  return output;
}

function subBlock(data: number[]): number[] {
  const out: number[] = [];
  let i = 0;
  while (i < data.length) {
    const chunk = Math.min(255, data.length - i);
    out.push(chunk);
    for (let j = 0; j < chunk; j++) out.push(data[i++]);
  }
  out.push(0); // block terminator
  return out;
}

export function encodeGif(
  frames: PixelBitmap[],
  fps: number,
  scale: number,
  loop: boolean,
  gridW: number,
  gridH: number
): { url: string; width: number; height: number } {
  const sizeW = gridW * scale;
  const sizeH = gridH * scale;
  const delay = Math.round(100 / fps); // in 1/100s
  const palette = buildColorTable(frames);
  const transparentIndex = 255;

  const colorMap = new Map<string, number>();
  for (let i = 0; i < palette.length; i++) colorMap.set(palette[i], i);

  // Build u32 -> color index map for hot loop
  const u32ColorMap = new Map<number, number>();
  for (const frame of frames) {
    const data = frame.data;
    for (let i = 0; i < data.length; i++) {
      const px = data[i];
      if (px !== 0 && !u32ColorMap.has(px)) {
        const hex = u32ToHex(px);
        u32ColorMap.set(px, colorMap.get(hex) ?? transparentIndex);
      }
    }
  }

  const bytes: number[] = [];
  const w = (v: number) => bytes.push(v);
  const w16 = (v: number) => {
    bytes.push(v & 0xff);
    bytes.push((v >> 8) & 0xff);
  };

  // Header
  [0x47, 0x49, 0x46, 0x38, 0x39, 0x61].forEach(w); // GIF89a

  // Logical Screen Descriptor
  w16(sizeW);
  w16(sizeH);
  w(0xf7); // GCT flag, 8 bits color resolution, 256 colors
  w(transparentIndex); // background color index
  w(0); // pixel aspect ratio

  // Global Color Table (256 entries)
  for (const hex of palette) {
    const [r, g, b] = hexToRgb(hex);
    w(r);
    w(g);
    w(b);
  }

  // Netscape extension for looping
  if (loop) {
    w(0x21);
    w(0xff);
    w(11); // block size
    [0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30].forEach(w); // NETSCAPE2.0
    w(3); // sub-block size
    w(1); // loop sub-block id
    w16(0); // loop count (0 = infinite)
    w(0); // block terminator
  }

  for (const frame of frames) {
    // Graphic Control Extension
    w(0x21);
    w(0xf9);
    w(4); // block size
    w(0x09); // disposal: restore to bg, transparent flag
    w16(delay);
    w(transparentIndex);
    w(0); // block terminator

    // Image Descriptor
    w(0x2c);
    w16(0); // left
    w16(0); // top
    w16(sizeW);
    w16(sizeH);
    w(0); // no local color table

    // Image Data
    const minCodeSize = 8;
    w(minCodeSize);

    const indexStream: number[] = [];
    for (let y = 0; y < gridH; y++) {
      // Build one scaled row
      const row: number[] = [];
      for (let x = 0; x < gridW; x++) {
        const px = frame.get(x, y);
        const idx = px !== 0 ? (u32ColorMap.get(px) ?? transparentIndex) : transparentIndex;
        for (let sx = 0; sx < scale; sx++) row.push(idx);
      }
      // Repeat the row `scale` times for vertical scaling
      for (let sy = 0; sy < scale; sy++) {
        for (let j = 0; j < row.length; j++) indexStream.push(row[j]);
      }
    }

    const lzw = lzwEncode(indexStream, minCodeSize);
    subBlock(lzw).forEach(w);
  }

  // Trailer
  w(0x3b);

  const binary = new Uint8Array(bytes);
  const blob = new Blob([binary], { type: "image/gif" });
  return { url: URL.createObjectURL(blob), width: sizeW, height: sizeH };
}
