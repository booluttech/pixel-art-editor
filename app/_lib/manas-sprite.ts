import { DEFAULT_SIZE } from "./constants";
import { PixelBitmap, hexToU32 } from "./pixel-bitmap";

export function generateManasSprite(): PixelBitmap {
  const GRID = DEFAULT_SIZE;
  const px = PixelBitmap.empty(GRID, GRID);

  const P = {
    o: "#0a0a12",
    oL: "#14141e",
    kW: "#c8bfad",
    kM: "#a89e8c",
    kD: "#887e6e",
    kS: "#706858",
    kTr: "#b8942c",
    kTd: "#8a6e1e",
    kR: "#8b1a1a",
    sk: "#c4956a",
    skH: "#d4a87a",
    skD: "#9c7048",
    eW: "#d8d0c8",
    eI: "#1e1208",
    eB: "#141008",
    hr: "#1a1008",
    hrL: "#2a2018",
    bd: "#1e1408",
    bdL: "#2e2418",
    mu: "#141008",
    lip: "#9a6048",
    lipD: "#7a4838",
    aH: "#606070",
    aM: "#484858",
    aD: "#343444",
    aDD: "#242432",
    aHH: "#72728a",
    cH: "#585868",
    cM: "#424252",
    cD: "#2e2e3a",
    fB: "#0e2a52",
    fBL: "#163a6e",
    fBD: "#081a38",
    fR: "#7a2020",
    fRD: "#581818",
    g: "#b8942c",
    gH: "#d4ac3c",
    gD: "#8a6e1e",
    gDD: "#5c4a14",
    sB: "#8a8a98",
    sH: "#aaaab8",
    sD: "#686878",
    sE: "#c0c0d0",
    sGu: "#b8942c",
    sGr: "#3a2418",
    sPo: "#d4ac3c",
    bM: "#3a2418",
    bH: "#4e3422",
    bD: "#241610",
    bDD: "#1a0e08",
    lM: "#4a3828",
    lH: "#5a4838",
    lD: "#3a2818",
  };

  // Cache hex->u32 conversions
  const cache = new Map<string, number>();
  const u32 = (hex: string): number => {
    let v = cache.get(hex);
    if (v === undefined) {
      v = hexToU32(hex);
      cache.set(hex, v);
    }
    return v;
  };

  const set = (x: number, y: number, c: string) => {
    if (x >= 0 && x < GRID && y >= 0 && y < GRID && c) px.set(x, y, u32(c));
  };
  const hLine = (x: number, y: number, len: number, c: string) => {
    for (let i = 0; i < len; i++) set(x + i, y, c);
  };
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
    for (let j = 0; j < h; j++) hLine(x, y + j, w, c);
  };
  const vLine = (x: number, y: number, len: number, c: string) => {
    for (let i = 0; i < len; i++) set(x, y + i, c);
  };

  // Kalpak
  hLine(27, 0, 10, P.o);
  hLine(26, 1, 12, P.o);
  rect(27, 1, 10, 1, P.kW);
  hLine(25, 2, 14, P.o);
  rect(26, 2, 12, 1, P.kW);
  hLine(24, 3, 16, P.o);
  rect(25, 3, 14, 1, P.kW);
  hLine(23, 4, 18, P.o);
  rect(24, 4, 16, 1, P.kW);
  for (let y = 5; y <= 8; y++) {
    hLine(22, y, 20, P.o);
    rect(23, y, 18, 1, y < 7 ? P.kW : P.kM);
  }
  rect(23, 7, 3, 2, P.kD);
  rect(38, 7, 3, 2, P.kD);
  rect(29, 3, 6, 3, P.kW);
  hLine(21, 9, 22, P.o);
  rect(22, 9, 20, 1, P.kTr);
  for (let x = 23; x < 41; x += 3) {
    set(x, 9, P.kR);
    set(x + 1, 9, P.gH);
  }
  hLine(21, 10, 22, P.o);
  rect(22, 10, 20, 1, P.gD);
  hLine(20, 11, 24, P.o);
  rect(21, 11, 22, 1, P.kTd);

  // Face
  hLine(22, 12, 20, P.o);
  rect(23, 12, 18, 1, P.sk);
  hLine(22, 13, 20, P.o);
  rect(23, 13, 18, 1, P.sk);
  rect(23, 12, 2, 2, P.hr);
  rect(39, 12, 2, 2, P.hr);
  hLine(22, 14, 20, P.o);
  rect(23, 14, 18, 1, P.sk);
  rect(23, 14, 2, 1, P.hr);
  rect(39, 14, 2, 1, P.hr);
  rect(25, 14, 6, 1, P.eB);
  rect(33, 14, 6, 1, P.eB);
  set(26, 13, P.eB);
  set(27, 13, P.eB);
  set(37, 13, P.eB);
  set(36, 13, P.eB);
  hLine(22, 15, 20, P.o);
  rect(23, 15, 18, 1, P.sk);
  rect(23, 15, 2, 1, P.hr);
  rect(39, 15, 2, 1, P.hr);
  set(25, 15, P.o);
  set(26, 15, P.eW);
  set(27, 15, P.eW);
  set(28, 15, P.eI);
  set(29, 15, P.eI);
  set(30, 15, P.o);
  set(34, 15, P.o);
  set(35, 15, P.eI);
  set(36, 15, P.eI);
  set(37, 15, P.eW);
  set(38, 15, P.eW);
  set(39, 15, P.o);
  hLine(22, 16, 20, P.o);
  rect(23, 16, 18, 1, P.sk);
  rect(23, 16, 2, 1, P.hrL);
  rect(39, 16, 2, 1, P.hrL);
  set(26, 16, P.skD);
  set(27, 16, P.skD);
  set(36, 16, P.skD);
  set(37, 16, P.skD);
  hLine(22, 17, 20, P.o);
  rect(23, 17, 18, 1, P.sk);
  rect(23, 17, 2, 1, P.hrL);
  rect(39, 17, 2, 1, P.hrL);
  set(31, 17, P.skD);
  set(32, 17, P.skH);
  set(33, 17, P.skD);
  hLine(22, 18, 20, P.o);
  rect(23, 18, 18, 1, P.sk);
  rect(23, 18, 2, 1, P.hrL);
  rect(39, 18, 2, 1, P.hrL);
  set(30, 18, P.skD);
  set(31, 18, P.o);
  set(32, 18, P.skH);
  set(33, 18, P.o);
  set(34, 18, P.skD);
  set(24, 18, P.skD);
  set(39, 18, P.skD);
  hLine(22, 19, 20, P.o);
  rect(23, 19, 18, 1, P.sk);
  rect(23, 19, 2, 1, P.bd);
  rect(39, 19, 2, 1, P.bd);
  rect(26, 19, 12, 1, P.mu);
  set(25, 19, P.mu);
  set(38, 19, P.mu);
  hLine(22, 20, 20, P.o);
  rect(23, 20, 18, 1, P.sk);
  rect(23, 20, 2, 1, P.bd);
  rect(39, 20, 2, 1, P.bd);
  rect(29, 20, 6, 1, P.lip);
  set(30, 20, P.lipD);
  set(33, 20, P.lipD);

  // Beard
  for (let y = 21; y <= 24; y++) {
    const i = y - 21;
    hLine(22 + i, y, 20 - i * 2, P.o);
    rect(23 + i, y, 18 - i * 2, 1, y < 23 ? P.bd : P.bdL);
    for (let x = 24 + i; x < 40 - i; x += 2)
      set(x, y, y < 23 ? P.bdL : P.bd);
  }
  rect(27, 24, 10, 1, P.bd);
  hLine(27, 25, 10, P.o);

  // Neck + gorget
  rect(28, 25, 8, 1, P.skD);
  set(27, 25, P.o);
  set(36, 25, P.o);
  hLine(24, 26, 16, P.o);
  rect(25, 26, 14, 1, P.aM);
  rect(28, 26, 8, 1, P.aH);
  set(31, 26, P.aHH);
  set(32, 26, P.aHH);
  hLine(23, 27, 18, P.o);
  rect(24, 27, 16, 1, P.aD);
  rect(29, 27, 6, 1, P.g);

  // Chest armor
  const cL = 19,
    cR = 45;
  for (let y = 28; y <= 33; y++) {
    hLine(cL, y, cR - cL, P.o);
    rect(cL + 1, y, cR - cL - 2, 1, P.aD);
  }
  rect(21, 28, 10, 5, P.aM);
  rect(22, 28, 3, 1, P.aH);
  rect(22, 30, 3, 1, P.aH);
  set(21, 28, P.aHH);
  set(21, 30, P.aHH);
  rect(28, 28, 3, 5, P.aD);
  rect(33, 28, 10, 5, P.aM);
  rect(39, 28, 3, 1, P.aH);
  rect(39, 30, 3, 1, P.aH);
  set(42, 28, P.aHH);
  set(42, 30, P.aHH);
  rect(33, 28, 3, 5, P.aD);
  vLine(32, 28, 5, P.aDD);
  set(32, 28, P.gD);
  set(32, 30, P.gD);
  set(32, 32, P.gD);
  for (let y = 33; y <= 35; y++) {
    hLine(cL, y, cR - cL, P.o);
    rect(cL + 1, y, cR - cL - 2, 1, P.cD);
    for (let x = cL + 2; x < cR - 1; x += 2)
      set(x, y, (x + y) % 4 < 2 ? P.cH : P.cM);
  }

  // Shoulders
  for (let y = 26; y <= 30; y++) {
    const pw = y < 28 ? 5 : y < 30 ? 4 : 3;
    hLine(cL - pw, y, pw + 1, P.o);
    rect(cL - pw + 1, y, pw - 1, 1, P.aM);
    set(cL - pw + 1, y, P.aHH);
    hLine(cR, y, pw + 1, P.o);
    rect(cR, y, pw - 1, 1, P.aM);
    set(cR + pw - 2, y, P.aHH);
  }
  hLine(18, 26, 4, P.o);
  rect(19, 26, 2, 1, P.aH);
  hLine(42, 26, 4, P.o);
  rect(43, 26, 2, 1, P.aH);

  // Arms
  for (let y = 29; y <= 40; y++) {
    const ax = 14 + (y > 35 ? 1 : 0);
    hLine(ax, y, 5, P.o);
    rect(ax + 1, y, 3, 1, y < 36 ? P.fBL : P.lM);
    if (y < 36 && y % 2 === 0) set(ax + 2, y, P.fBD);
    if (y >= 36) set(ax + 1, y, P.lH);
    const rx = cR - (y > 35 ? 1 : 0);
    hLine(rx, y, 5, P.o);
    rect(rx + 1, y, 3, 1, y < 36 ? P.fBL : P.lM);
    if (y < 36 && y % 2 === 0) set(rx + 2, y, P.fBD);
    if (y >= 36) set(rx + 3, y, P.lH);
  }
  rect(15, 41, 4, 2, P.o);
  rect(16, 41, 2, 2, P.skD);
  rect(cR - 1, 41, 4, 2, P.o);
  rect(cR, 41, 2, 2, P.skD);

  // Belt
  hLine(cL, 36, cR - cL, P.o);
  rect(cL + 1, 36, cR - cL - 2, 1, P.gD);
  hLine(cL, 37, cR - cL, P.o);
  rect(cL + 1, 37, cR - cL - 2, 1, P.g);
  rect(30, 36, 4, 2, P.gH);
  set(31, 37, P.gDD);
  set(32, 36, P.gDD);
  for (let x = cL + 2; x < cR - 1; x += 4) {
    set(x, 37, P.gH);
    set(x + 2, 36, P.kR);
  }
  hLine(cL, 38, cR - cL, P.o);
  rect(cL + 1, 38, cR - cL - 2, 1, P.gD);

  // Lower tunic
  for (let y = 39; y <= 45; y++) {
    hLine(cL, y, cR - cL, P.o);
    rect(cL + 1, y, cR - cL - 2, 1, P.fBD);
    set(32, y, P.o);
    set(cL + 1, y, P.fRD);
    set(cR - 2, y, P.fRD);
    set(cL + 2, y, P.gDD);
    set(cR - 3, y, P.gDD);
    if (y % 2 === 0) {
      set(24, y, P.fB);
      set(40, y, P.fB);
    }
  }
  hLine(cL, 46, cR - cL, P.o);
  for (let x = cL + 1; x < cR - 1; x++)
    set(x, 46, x % 3 === 0 ? P.g : P.fR);

  // Legs
  const legW = 6,
    llx = 24,
    rlx = 35;
  for (let y = 47; y <= 53; y++) {
    hLine(llx, y, legW, P.o);
    rect(llx + 1, y, legW - 2, 1, y < 50 ? P.aD : P.aDD);
    if (y === 49 || y === 50) {
      rect(llx + 1, y, legW - 2, 1, P.aM);
      set(llx + 1, y, P.aHH);
    }
    if (y === 48 || y === 51) rect(llx + 1, y, legW - 2, 1, P.lD);
    hLine(rlx, y, legW, P.o);
    rect(rlx + 1, y, legW - 2, 1, y < 50 ? P.aD : P.aDD);
    if (y === 49 || y === 50) {
      rect(rlx + 1, y, legW - 2, 1, P.aM);
      set(rlx + legW - 2, y, P.aHH);
    }
    if (y === 48 || y === 51) rect(rlx + 1, y, legW - 2, 1, P.lD);
  }

  // Boots
  for (let y = 54; y <= 57; y++) {
    const bw = y > 55 ? legW + 2 : legW,
      bxl = y > 55 ? llx - 1 : llx,
      bxr = y > 55 ? rlx - 1 : rlx;
    hLine(bxl, y, bw, P.o);
    rect(bxl + 1, y, bw - 2, 1, y < 56 ? P.bM : P.bD);
    set(bxl + 1, y, P.bH);
    hLine(bxr, y, bw, P.o);
    rect(bxr + 1, y, bw - 2, 1, y < 56 ? P.bM : P.bD);
    set(bxr + bw - 2, y, P.bH);
  }
  set(llx + 1, 54, P.gD);
  set(rlx + 1, 54, P.gD);
  hLine(llx - 2, 58, legW + 3, P.o);
  rect(llx - 1, 58, legW + 1, 1, P.bDD);
  hLine(rlx - 2, 58, legW + 3, P.o);
  rect(rlx - 1, 58, legW + 1, 1, P.bDD);

  // Sword
  for (let y = 30; y <= 54; y++) {
    set(47, y, P.o);
    set(48, y, y < 45 ? P.sB : P.sD);
    set(49, y, P.o);
    if (y % 3 === 0) set(48, y, P.sH);
  }
  hLine(46, 29, 5, P.o);
  rect(46, 29, 5, 1, P.sGu);
  set(46, 29, P.gH);
  set(50, 29, P.gH);
  rect(47, 27, 3, 2, P.sGr);
  set(48, 26, P.sPo);
  set(48, 55, P.sE);

  return px;
}
