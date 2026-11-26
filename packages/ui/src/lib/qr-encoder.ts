/**
 * QR Code encoder (ISO/IEC 18004): numeric, alphanumeric and byte modes,
 * versions 1-40, error-correction levels L, M, Q and H.
 *
 * It returns the module matrix that the `qrcode` package (1.5) returns for the
 * same input: same segment optimiser, version choice and mask choice. The
 * tests compare both encoders module by module.
 */

export type QrErrorLevel = "H" | "L" | "M" | "Q";

/** `modules` holds `size * size` cells in row order; `1` is a dark module. */
export type QrMatrix = { modules: Uint8Array; size: number };

type Run = { data: string; mode: number };
type Segment = Run & { length: number };
type Edge = { cost: number; to: number };
type Entry = { cost: number; node: number };
type Graph = {
  edges: Edge[][];
  lastCount: number[];
  nodes: (Segment | undefined)[];
  version: number;
};
type Grid = {
  dark: Uint8Array;
  isDark: (row: number, column: number) => number;
  isReserved: (row: number, column: number) => boolean;
  put: (row: number, column: number, dark: boolean) => void;
  reserve: (row: number, column: number, dark: boolean) => void;
  size: number;
  toggle: (row: number, column: number) => void;
};

const NUMERIC = 0;
const ALPHANUMERIC = 1;
const BYTE = 2;
const MAX_VERSION = 40;
const ALPHANUMERIC_CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
const RUNS = /\d+|[A-Z $%*+\-./:]+|[^\dA-Z $%*+\-./:]+/g;
const MODE_INDICATORS = [1, 2, 4];
// Character-count field widths per mode, for versions 1-9, 10-26 and 27-40.
const COUNT_BITS = [
  [10, 12, 14],
  [9, 11, 13],
  [8, 16, 16],
];
const LEVELS = ["L", "M", "Q", "H"];
const LEVEL_BITS = [1, 0, 3, 2];
const PENALTY_RUN = 3;
const PENALTY_BLOCK = 3;
const PENALTY_FINDER = 40;
const PENALTY_BALANCE = 10;
const MASKS: ((row: number, column: number) => boolean)[] = [
  (row, column) => (row + column) % 2 === 0,
  (row) => row % 2 === 0,
  (_row, column) => column % 3 === 0,
  (row, column) => (row + column) % 3 === 0,
  (row, column) => (Math.floor(row / 2) + Math.floor(column / 3)) % 2 === 0,
  (row, column) => ((row * column) % 2) + ((row * column) % 3) === 0,
  (row, column) => (((row * column) % 2) + ((row * column) % 3)) % 2 === 0,
  (row, column) => (((row * column) % 3) + ((row + column) % 2)) % 2 === 0,
];
const utf8 = new TextEncoder();

// Rows are versions 1-40, columns are the levels L, M, Q, H.
const EC_BLOCKS = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 2, 4, 1, 2, 4, 4, 2, 4, 4, 4, 2, 4,
  6, 5, 2, 4, 6, 6, 2, 5, 8, 8, 4, 5, 8, 8, 4, 5, 8, 11, 4, 8, 10, 11, 4, 9, 12,
  16, 4, 9, 16, 16, 6, 10, 12, 18, 6, 10, 17, 16, 6, 11, 16, 19, 6, 13, 18, 21,
  7, 14, 21, 25, 8, 16, 20, 25, 8, 17, 23, 25, 9, 17, 23, 34, 9, 18, 25, 30, 10,
  20, 27, 32, 12, 21, 29, 35, 12, 23, 34, 37, 12, 25, 34, 40, 13, 26, 35, 42,
  14, 28, 38, 45, 15, 29, 40, 48, 16, 31, 43, 51, 17, 33, 45, 54, 18, 35, 48,
  57, 19, 37, 51, 60, 19, 38, 53, 63, 20, 40, 56, 66, 21, 43, 59, 70, 22, 45,
  62, 74, 24, 47, 65, 77, 25, 49, 68, 81,
];
const EC_CODEWORDS = [
  7, 10, 13, 17, 10, 16, 22, 28, 15, 26, 36, 44, 20, 36, 52, 64, 26, 48, 72, 88,
  36, 64, 96, 112, 40, 72, 108, 130, 48, 88, 132, 156, 60, 110, 160, 192, 72,
  130, 192, 224, 80, 150, 224, 264, 96, 176, 260, 308, 104, 198, 288, 352, 120,
  216, 320, 384, 132, 240, 360, 432, 144, 280, 408, 480, 168, 308, 448, 532,
  180, 338, 504, 588, 196, 364, 546, 650, 224, 416, 600, 700, 224, 442, 644,
  750, 252, 476, 690, 816, 270, 504, 750, 900, 300, 560, 810, 960, 312, 588,
  870, 1050, 336, 644, 952, 1110, 360, 700, 1020, 1200, 390, 728, 1050, 1260,
  420, 784, 1140, 1350, 450, 812, 1200, 1440, 480, 868, 1290, 1530, 510, 924,
  1350, 1620, 540, 980, 1440, 1710, 570, 1036, 1530, 1800, 570, 1064, 1590,
  1890, 600, 1120, 1680, 1980, 630, 1204, 1770, 2100, 660, 1260, 1860, 2220,
  720, 1316, 1950, 2310, 750, 1372, 2040, 2430,
];

const range = (count: number): number[] =>
  Array.from({ length: count }, (_, index) => index);

const lookup = (table: number[], index: number): number => table[index] ?? 0;

function countBits(mode: number, version: number): number {
  return COUNT_BITS[mode]?.[Number(version > 9) + Number(version > 26)] ?? 0;
}

function dataBits(mode: number, length: number): number {
  if (mode === NUMERIC) {
    const rest = length % 3;
    return 10 * Math.floor(length / 3) + (rest === 0 ? 0 : rest * 3 + 1);
  }
  if (mode === ALPHANUMERIC) {
    return 11 * Math.floor(length / 2) + 6 * (length % 2);
  }
  return 8 * length;
}

/** Codewords of a symbol, data and error correction together. */
function totalCodewords(version: number): number {
  const patterns = Math.floor(version / 7) + 2;
  const alignment = version >= 2 ? (25 * patterns - 10) * patterns - 55 : 0;
  const versionInfo = version >= 7 ? 36 : 0;
  const modules = (16 * version + 128) * version + 64;
  return Math.floor((modules - alignment - versionInfo) / 8);
}

function dataCodewordCount(version: number, level: number): number {
  return (
    totalCodewords(version) - lookup(EC_CODEWORDS, (version - 1) * 4 + level)
  );
}

function makeSegment(mode: number, data: string): Segment {
  const length = mode === BYTE ? utf8.encode(data).length : data.length;
  return { data, length, mode };
}

function runMode(run: string): number {
  if (/^\d/.test(run)) return NUMERIC;
  return /^[A-Z $%*+\-./:]/.test(run) ? ALPHANUMERIC : BYTE;
}

/** Splits `text` into maximal runs of digits, alphanumerics and other text. */
function splitRuns(text: string): Run[] {
  return (text.match(RUNS) ?? []).map((data) => ({
    data,
    mode: runMode(data),
  }));
}

/** Cost of coding `segment` right after the node `from`. */
function edgeCost(graph: Graph, from: number, segment: Segment): number {
  const { length, mode } = segment;
  const source = graph.nodes[from];
  const before = graph.lastCount[from] ?? 0;
  if (source?.mode === mode) {
    graph.lastCount[from] = before + length;
    return dataBits(mode, before + length) - dataBits(mode, before);
  }
  if (source) graph.lastCount[from] = length;
  return dataBits(mode, length) + 4 + countBits(mode, graph.version);
}

function addNode(graph: Graph, segment: Segment, previous: number[]): number {
  const id = graph.nodes.length;
  graph.nodes.push(segment);
  graph.lastCount.push(0);
  graph.edges.push([]);
  previous.forEach((from) => {
    graph.edges[from]?.push({ cost: edgeCost(graph, from, segment), to: id });
  });
  return id;
}

function walkBack(previous: number[], end: number): number[] {
  const path = [end];
  range(previous.length).forEach(() => {
    const before = previous[path.at(-1) ?? 0];
    if (before !== undefined) path.push(before);
  });
  return path.reverse();
}

/**
 * Cheapest path from node 0 to `end`. Equal costs resolve to the entry that
 * joined the queue first, the way the `dijkstrajs` package `qrcode` uses does.
 */
function cheapestPath(edges: Edge[][], end: number): number[] {
  const best = [0];
  const previous: number[] = [];
  const queue: Entry[] = [{ cost: 0, node: 0 }];
  const visit = ({ cost, node }: Entry) => {
    (edges[node] ?? []).forEach((edge) => {
      const total = cost + edge.cost;
      const known = best[edge.to];
      if (known !== undefined && known <= total) return;
      best[edge.to] = total;
      previous[edge.to] = node;
      const position = queue.findIndex((entry) => entry.cost > total);
      queue.splice(position === -1 ? queue.length : position, 0, {
        cost: total,
        node: edge.to,
      });
    });
  };
  // Every queue entry comes from one edge, so edges + 1 rounds drain it.
  range(edges.flat().length + 1).forEach(() => {
    const entry = queue.shift();
    if (entry) visit(entry);
  });
  return walkBack(previous, end);
}

/** Joins neighbours that share a mode. */
function mergeSegments(segments: Segment[]): Segment[] {
  const merged: Run[] = [];
  segments.forEach(({ data, mode }) => {
    const last = merged.at(-1);
    if (last?.mode === mode) {
      last.data += data;
    } else {
      merged.push({ data, mode });
    }
  });
  return merged.map(({ data, mode }) => makeSegment(mode, data));
}

/**
 * Picks the modes that give the shortest bit stream. Each run of digits can
 * also use alphanumeric or byte mode, each alphanumeric run byte mode.
 */
function optimizeSegments(text: string, version: number): Segment[] {
  const graph: Graph = {
    edges: [[]],
    lastCount: [0],
    nodes: [undefined],
    version,
  };
  const lastGroup = splitRuns(text).reduce(
    (previous, run) =>
      range(BYTE - run.mode + 1).map((offset) =>
        addNode(graph, makeSegment(run.mode + offset, run.data), previous),
      ),
    [0],
  );
  const end = graph.nodes.length;
  lastGroup.forEach((from) => graph.edges[from]?.push({ cost: 0, to: end }));
  const path = cheapestPath(graph.edges, end).slice(1, -1);
  return mergeSegments(path.flatMap((id) => graph.nodes[id] ?? []));
}

function smallestVersion(
  segments: Segment[],
  level: number,
): number | undefined {
  const bitsFor = (version: number) =>
    segments.reduce(
      (sum, { length, mode }) =>
        sum + 4 + countBits(mode, version) + dataBits(mode, length),
      0,
    );
  return range(MAX_VERSION)
    .map((index) => index + 1)
    .find(
      (version) => bitsFor(version) <= dataCodewordCount(version, level) * 8,
    );
}

function appendBits(bits: number[], value: number, length: number): void {
  range(length).forEach((index) => {
    bits.push((value >>> (length - 1 - index)) & 1);
  });
}

function chunks(text: string, size: number): string[] {
  return range(Math.ceil(text.length / size)).map((index) =>
    text.slice(index * size, (index + 1) * size),
  );
}

function appendSegment(bits: number[], { data, mode }: Segment): void {
  if (mode === NUMERIC) {
    chunks(data, 3).forEach((group) => {
      appendBits(bits, Number(group), group.length * 3 + 1);
    });
  } else if (mode === ALPHANUMERIC) {
    chunks(data, 2).forEach((pair) => {
      const value = (pair.match(/./gu) ?? []).reduce(
        (sum, character) =>
          sum * 45 + ALPHANUMERIC_CHARACTERS.indexOf(character),
        0,
      );
      appendBits(bits, value, pair.length * 5 + 1);
    });
  } else {
    utf8.encode(data).forEach((byte) => {
      appendBits(bits, byte, 8);
    });
  }
}

/** Data codewords of every segment, padded to fill the symbol. */
function buildDataCodewords(
  segments: Segment[],
  version: number,
  level: number,
): number[] {
  const bits: number[] = [];
  segments.forEach((segment) => {
    appendBits(bits, lookup(MODE_INDICATORS, segment.mode), 4);
    appendBits(bits, segment.length, countBits(segment.mode, version));
    appendSegment(bits, segment);
  });
  const capacity = dataCodewordCount(version, level) * 8;
  if (bits.length + 4 <= capacity) appendBits(bits, 0, 4);
  appendBits(bits, 0, (8 - (bits.length % 8)) % 8);
  range((capacity - bits.length) / 8).forEach((pad) => {
    // Pad bytes 0xEC and 0x11 alternate.
    appendBits(bits, pad % 2 === 0 ? 236 : 17, 8);
  });
  return range(bits.length / 8).map((index) =>
    bits.slice(index * 8, index * 8 + 8).reduce((byte, bit) => byte * 2 + bit),
  );
}

/** Multiplies in GF(256) with the QR polynomial x^8 + x^4 + x^3 + x^2 + 1. */
function multiply(left: number, right: number): number {
  return range(8).reduceRight((product, shift) => {
    // 285 is 0x11D, the field polynomial.
    const shifted = (product << 1) ^ ((product >>> 7) * 285);
    return shifted ^ (((right >>> shift) & 1) * left);
  }, 0);
}

function generatorPolynomial(degree: number): number[] {
  const start = range(degree).map((index) => Number(index === degree - 1));
  return range(degree).reduce(
    ({ coefficients, root }) => ({
      coefficients: coefficients.map(
        (coefficient, index) =>
          multiply(coefficient, root) ^ (coefficients[index + 1] ?? 0),
      ),
      root: multiply(root, 2),
    }),
    { coefficients: start, root: 1 },
  ).coefficients;
}

function errorCorrection(block: number[], generator: number[]): number[] {
  return block.reduce(
    (state, byte) => {
      const factor = byte ^ (state[0] ?? 0);
      return [...state.slice(1), 0].map(
        (value, index) => value ^ multiply(generator[index] ?? 0, factor),
      );
    },
    generator.map(() => 0),
  );
}

function interleave(blocks: number[][], length: number): number[] {
  return range(length).flatMap((index) =>
    blocks.flatMap((block) =>
      index < block.length ? [block[index] ?? 0] : [],
    ),
  );
}

/** Splits the data into blocks, adds error correction and interleaves them. */
function buildCodewords(
  data: number[],
  version: number,
  level: number,
): number[] {
  const total = totalCodewords(version);
  const blockCount = lookup(EC_BLOCKS, (version - 1) * 4 + level);
  const shortCount = blockCount - (total % blockCount);
  const shortSize = Math.floor(dataCodewordCount(version, level) / blockCount);
  const generator = generatorPolynomial(
    Math.floor(total / blockCount) - shortSize,
  );
  const sizes = range(blockCount).map(
    (block) => shortSize + (block < shortCount ? 0 : 1),
  );
  const dataBlocks = sizes.map((size, block) => {
    const start = sizes.slice(0, block).reduce((sum, value) => sum + value, 0);
    return data.slice(start, start + size);
  });
  const correction = dataBlocks.map((block) =>
    errorCorrection(block, generator),
  );
  return [
    ...interleave(dataBlocks, shortSize + 1),
    ...interleave(correction, generator.length),
  ];
}

function createGrid(size: number): Grid {
  const dark = new Uint8Array(size * size);
  const reserved = new Uint8Array(size * size);
  const indexOf = (row: number, column: number) => row * size + column;
  return {
    dark,
    isDark: (row, column) => dark[indexOf(row, column)] ?? 0,
    isReserved: (row, column) => reserved[indexOf(row, column)] === 1,
    put: (row, column, value) => {
      dark[indexOf(row, column)] = Number(value);
    },
    reserve: (row, column, value) => {
      dark[indexOf(row, column)] = Number(value);
      reserved[indexOf(row, column)] = 1;
    },
    size,
    toggle: (row, column) => {
      dark[indexOf(row, column)] = (dark[indexOf(row, column)] ?? 0) ^ 1;
    },
  };
}

/** A finder pattern plus its light separator, clipped at the symbol edge. */
function drawFinderPattern(grid: Grid, top: number, left: number): void {
  range(9).forEach((rowStep) => {
    range(9).forEach((columnStep) => {
      const [row, column] = [rowStep - 1, columnStep - 1];
      if (!isInside(grid, top + row, left + column)) return;
      const inside = row >= 0 && row <= 6 && column >= 0 && column <= 6;
      const ring = [0, 6].includes(row) || [0, 6].includes(column);
      const core = row >= 2 && row <= 4 && column >= 2 && column <= 4;
      grid.reserve(top + row, left + column, inside && (ring || core));
    });
  });
}

function isInside({ size }: Grid, row: number, column: number): boolean {
  return row >= 0 && row < size && column >= 0 && column < size;
}

function drawTimingPatterns(grid: Grid): void {
  range(grid.size - 16).forEach((offset) => {
    const index = offset + 8;
    grid.reserve(index, 6, index % 2 === 0);
    grid.reserve(6, index, index % 2 === 0);
  });
}

function alignmentCenters(version: number, size: number): number[] {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const step = size === 145 ? 26 : Math.ceil((size - 13) / (2 * count - 2)) * 2;
  return [
    6,
    ...range(count - 1).map((index) => size - 7 - (count - 2 - index) * step),
  ];
}

function drawAlignmentPattern(
  grid: Grid,
  centerRow: number,
  centerColumn: number,
): void {
  range(5).forEach((rowStep) => {
    range(5).forEach((columnStep) => {
      const [row, column] = [rowStep - 2, columnStep - 2];
      const edge = Math.abs(row) === 2 || Math.abs(column) === 2;
      const middle = row === 0 && column === 0;
      grid.reserve(centerRow + row, centerColumn + column, edge || middle);
    });
  });
}

function drawAlignmentPatterns(grid: Grid, version: number): void {
  const centers = alignmentCenters(version, grid.size);
  const last = centers.length - 1;
  centers.forEach((centerRow, rowIndex) => {
    centers.forEach((centerColumn, columnIndex) => {
      const onFinder =
        (rowIndex === 0 && (columnIndex === 0 || columnIndex === last)) ||
        (rowIndex === last && columnIndex === 0);
      if (!onFinder) drawAlignmentPattern(grid, centerRow, centerColumn);
    });
  });
}

/** Division of `value` by `generator` as polynomials over GF(2). */
function bchCheck(value: number, generator: number): number {
  const length = 32 - Math.clz32(generator);
  const steps = Math.max(0, 32 - Math.clz32(value) - length + 1);
  return range(steps).reduceRight(
    (check, shift) =>
      ((check >>> (shift + length - 1)) & 1) === 1
        ? check ^ (generator << shift)
        : check,
    value,
  );
}

function drawVersionInfo(grid: Grid, version: number): void {
  // 7973 is 0x1F25, the version BCH generator.
  const bits = (version << 12) | bchCheck(version << 12, 7973);
  range(18).forEach((index) => {
    const row = Math.floor(index / 3);
    const column = (index % 3) + grid.size - 11;
    const dark = ((bits >> index) & 1) === 1;
    grid.reserve(row, column, dark);
    grid.reserve(column, row, dark);
  });
}

function formatRow(index: number, size: number): number {
  if (index < 6) return index;
  return index < 8 ? index + 1 : size - 15 + index;
}

function formatColumn(index: number, size: number): number {
  if (index < 8) return size - index - 1;
  return index < 9 ? 15 - index : 14 - index;
}

function drawFormatInfo(grid: Grid, level: number, mask: number): void {
  const data = (lookup(LEVEL_BITS, level) << 3) | mask;
  // 1335 is 0x537, the format BCH generator; 21_522 is the 0x5412 mask.
  const bits = ((data << 10) | bchCheck(data << 10, 1335)) ^ 21_522;
  range(15).forEach((index) => {
    const dark = ((bits >> index) & 1) === 1;
    grid.reserve(formatRow(index, grid.size), 8, dark);
    grid.reserve(8, formatColumn(index, grid.size), dark);
  });
  grid.reserve(grid.size - 8, 8, true);
}

/** Cells in placement order: two-column strips, up and down by turns. */
function dataCells(grid: Grid): number[][] {
  const { size } = grid;
  return range((size - 1) / 2)
    .flatMap((pair) => {
      const right = size - 1 - pair * 2;
      const strip = right <= 6 ? right - 1 : right;
      return range(size).flatMap((step) => {
        const row = pair % 2 === 0 ? size - 1 - step : step;
        return [
          [row, strip],
          [row, strip - 1],
        ];
      });
    })
    .filter(([row = 0, column = 0]) => !grid.isReserved(row, column));
}

function drawCodewords(grid: Grid, codewords: number[]): void {
  dataCells(grid).forEach(([row = 0, column = 0], bitIndex) => {
    const byte = codewords[bitIndex >> 3];
    const dark =
      byte !== undefined && ((byte >>> (7 - (bitIndex & 7))) & 1) === 1;
    grid.put(row, column, dark);
  });
}

function applyMask(grid: Grid, mask: number): void {
  const applies = MASKS[mask];
  range(grid.size * grid.size).forEach((index) => {
    const row = Math.floor(index / grid.size);
    const column = index % grid.size;
    if (applies?.(row, column) && !grid.isReserved(row, column)) {
      grid.toggle(row, column);
    }
  });
}

const runPoints = (run: number): number =>
  run >= 5 ? PENALTY_RUN + run - 5 : 0;

/** Penalty for long runs of one colour and for finder-like 1:1:3:1:1 bars. */
function linePenalty(line: number[]): number {
  const { points, run } = line.reduce(
    (state, module, index) => {
      const same = module === state.last;
      // Keep 11 modules; 1488 and 93 are 10111010000 and 00001011101.
      const window = ((state.window << 1) & 2047) | module;
      const finder = index >= 10 && (window === 1488 || window === 93);
      return {
        last: module,
        points:
          state.points +
          (same ? 0 : runPoints(state.run)) +
          (finder ? PENALTY_FINDER : 0),
        run: same ? state.run + 1 : 1,
        window,
      };
    },
    { last: -1, points: 0, run: 0, window: 0 },
  );
  return points + runPoints(run);
}

function blockPenalty(grid: Grid): number {
  const span = grid.size - 1;
  const uniform = range(span * span).filter((index) => {
    const [row, column] = [Math.floor(index / span), index % span];
    const dark =
      grid.isDark(row, column) +
      grid.isDark(row, column + 1) +
      grid.isDark(row + 1, column) +
      grid.isDark(row + 1, column + 1);
    return dark === 0 || dark === 4;
  });
  return uniform.length * PENALTY_BLOCK;
}

function balancePenalty({ dark }: Grid): number {
  const count = dark.reduce((sum, module) => sum + module, 0);
  return (
    Math.abs(Math.ceil((count * 100) / dark.length / 5) - 10) * PENALTY_BALANCE
  );
}

function penalty(grid: Grid): number {
  const lines = range(grid.size).reduce(
    (sum, index) =>
      sum +
      linePenalty(range(grid.size).map((other) => grid.isDark(index, other))) +
      linePenalty(range(grid.size).map((other) => grid.isDark(other, index))),
    0,
  );
  return lines + blockPenalty(grid) + balancePenalty(grid);
}

/** Tries all eight masks and keeps the first one with the lowest penalty. */
function bestMask(grid: Grid, level: number): number {
  return range(8).reduce(
    (best, mask) => {
      drawFormatInfo(grid, level, mask);
      applyMask(grid, mask);
      const score = penalty(grid);
      applyMask(grid, mask);
      return score < best.score ? { mask, score } : best;
    },
    { mask: 0, score: Number.POSITIVE_INFINITY },
  ).mask;
}

function chooseSegments(value: string, level: number) {
  // The run split gives a first guess of the version; segment costs depend on
  // it through the width of the character-count field.
  const runs = splitRuns(value).map(({ data, mode }) =>
    makeSegment(mode, data),
  );
  const segments = optimizeSegments(
    value,
    smallestVersion(runs, level) ?? MAX_VERSION,
  );
  const version = smallestVersion(segments, level);
  if (version === undefined) {
    throw new Error("The amount of data is too big to be stored in a QR Code");
  }
  return { segments, version };
}

function drawFunctionPatterns(version: number, level: number): Grid {
  const grid = createGrid(version * 4 + 17);
  const { size } = grid;
  [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ].forEach(([top = 0, left = 0]) => {
    drawFinderPattern(grid, top, left);
  });
  drawTimingPatterns(grid);
  drawAlignmentPatterns(grid, version);
  drawFormatInfo(grid, level, 0);
  if (version >= 7) drawVersionInfo(grid, version);
  return grid;
}

/**
 * Encodes `value` as a QR Code symbol. Throws when the text is empty or too
 * long for version 40 at the requested level.
 */
export function encodeQrMatrix(value: string, level: QrErrorLevel): QrMatrix {
  if (value === "") throw new Error("No input text");
  const found = LEVELS.indexOf(level);
  const levelIndex = found === -1 ? 1 : found;
  const { segments, version } = chooseSegments(value, levelIndex);
  const data = buildDataCodewords(segments, version, levelIndex);
  const grid = drawFunctionPatterns(version, levelIndex);
  drawCodewords(grid, buildCodewords(data, version, levelIndex));
  const mask = bestMask(grid, levelIndex);
  applyMask(grid, mask);
  drawFormatInfo(grid, levelIndex, mask);
  return { modules: grid.dark, size: grid.size };
}
