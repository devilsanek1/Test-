// TerraceHill (a.k.a. SeaOfDoors) — S8 (S10 Part B "twenty-two million doors", PEAK 3). Canvas coords at rest.
//
// Terraces of identical frontal website facades climbing a hill, looked UP at from the street, with NO overlap:
//   w_k = 90 * 0.8^k, h_k = 158 * 0.8^k, base_0 = 1500, base_k = top_(k-1) - 3 * 0.8^k   (rows 0-11 hold ~650 doors,
//   bases 1500 ... 767.4, ridge ~715; past row 11 the pattern tiles on in flat, fill-only rows).
// Thin retaining-wall lines and zig-zag stairs between the terraces, no roof planes. ROW 0 HOUSE #4 is the hidden-match
// object: facade x 482.5-572.5 (y 1342-1500), window (500, 1372, 55, 35), door (515, 1439.5, 30, 50), lock centred
// (540, 1464.5) 8.5 x 10.5; at the Part B start camera (540, 1407) zoom 6.0 it lands exactly where Part A's door #4,
// window, lock and cornice line (screen y 570) were. Ink is authored in WORLD units (row 0 ~0.85, rows 1-5 0.6 -> 0.4,
// none beyond), fill misregistration is SCREEN space (/ zoom), detail drops by on-screen size. Rows pop in as the
// caption floor (screen y 570, `revealFloor`) passes their tops during the pull-back. Waves: plaque dots row 0 -> ridge,
// Bit silhouettes in every lock; the check flag (548, 1300); 12 peach target rings (x <= 930, r 7-25; the dive target
// is the row-7 ring at (600, 858) r7); the edges extend outward (`extendAt`). `mode: 'flat'` = a sea of doors to the
// horizon instead (rows overlap).
//
//   <TerraceHill revealFloor={570} plaqueWaveAt={50.6} bitWaveAt={52.2} flagAt={51.9} ringsAt={53.5} extendAt={52.9}
//     house4Lock={{state: 'fixed'}} sun={<Sun .../>} />
//   TERRACE.rows[k] = {base, top, w, h}; terraceDoor(k, j) / TERRACE.house4 / TERRACE.rings / stairPoint(k)

import React from 'react';
import {palette, misreg} from '../../../lib/theme';
import {useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {line, Pt} from '../../../lib/sketch';
import {mat, useXf, XG} from '../../../lib/xf';
import {rand, Seed} from '../../../lib/rng';
import {PathBuf} from '../../../lib/cine/util';
import {atmos} from '../../../lib/cine/atmosphere';
import {LayerWrap, noWrap, SetPlace} from './common';
import {ChromeSlot, CheckFlagSlot, LockProps, PlaqueSlot, TargetRingSlot} from './propSlots';
import {Lock} from '../props';
import {FacadeDoor} from './SiteFacade';

// ---------------------------------------------------------------- the row formula

export type TerraceRow = {k: number; w: number; h: number; base: number; top: number; x0: number};

function makeRows(mode: 'hill' | 'flat', n = 26): TerraceRow[] {
  const rows: TerraceRow[] = [];
  let base = 1500;
  for (let k = 0; k < n; k++) {
    const f = Math.pow(0.8, k);
    const w = 90 * f;
    const h = 158 * f;
    if (k > 0) base = mode === 'hill' ? rows[k - 1].top - 3 * f : rows[k - 1].base - rows[k - 1].h * 0.42;
    const top = base - h;
    // row 0: house #4 spans 482.5-572.5 (x0 = 32.5 + 90 j); higher rows alternate by half a facade
    const x0 = 527.5 - w / 2 + (k % 2 ? w / 2 : 0);
    rows.push({k, w, h, base, top, x0});
    if (h < 1.6 || top < 690) break;
  }
  return rows;
}

const ROWS_HILL = makeRows('hill');
const ROWS_FLAT = makeRows('flat');

export const TERRACE = {
  rows: ROWS_HILL,
  /** The hidden-match house (row 0). */
  house4: {facade: [482.5, 1342, 90, 158] as [number, number, number, number], window: [500, 1372, 55, 35] as [number, number, number, number], door: [515, 1439.5, 30, 50] as [number, number, number, number], lock: {x: 540, y: 1464.5, w: 8.5, h: 10.5}},
  /** Part B start camera (world point at screen centre, zoom) and the cornice line it lands at. */
  matchCam: {x: 540, y: 1407, zoom: 6, corniceScreenY: 570},
  ridge: 715,
  flag: [548, 1342] as Pt,
  /** 12 "could be hit" target rings (x <= 930), [x, y, r]; index 7 = the dive target (row 7, r7). */
  rings: [
    [182, 1460, 25],
    [858, 1466, 24],
    [322, 1290, 20],
    [742, 1300, 19],
    [430, 1180, 15],
    [862, 1190, 15],
    [262, 1083, 12],
    [600, 858, 7],
    [690, 1010, 10],
    [148, 960, 10],
    [905, 905, 8],
    [455, 940, 8],
  ] as [number, number, number][],
  /** Screen floor the rows reveal under during the pull-back (the caption band floor). */
  revealFloor: 570,
} as const;

/** Door centre (world) of house j in row k (j = 0 at the row's x0; negative j to the left). */
export function terraceDoor(k: number, j: number, mode: 'hill' | 'flat' = 'hill'): {door: [number, number, number, number]; lock: Pt; plaque: Pt; overDoor: Pt} {
  const R = (mode === 'hill' ? ROWS_HILL : ROWS_FLAT)[k];
  const u = R.w / 90;
  const x = R.x0 + j * R.w;
  return {door: [x + 32.5 * u, R.top + 97.5 * u, 30 * u, 50 * u], lock: [x + 57.5 * u, R.top + 122.5 * u], plaque: [x + 18 * u, R.top + 110 * u], overDoor: [x + 47.5 * u, R.top + 86 * u]};
}

/** The zig-zag stair: a point on flight k (0..), t 0..1 along it. */
export function stairPoint(k: number, t = 0, mode: 'hill' | 'flat' = 'hill'): Pt {
  const rows = mode === 'hill' ? ROWS_HILL : ROWS_FLAT;
  const R = rows[Math.min(k, rows.length - 1)];
  const sx = stairX(k);
  const dir = k % 2 ? -1 : 1;
  return [sx + dir * (t - 0.5) * R.w * 0.5, R.base - t * R.h];
}
const stairX = (k: number) => 612 + (k % 2 ? 1 : -1) * 6 * Math.pow(0.8, k);

// ---------------------------------------------------------------- per-row batched geometry

type RowChunk = {facades: string[]; screens: string; bars: string; doors: string; plaques: string; locks: string; bits: string; ink: string; stairs: string; stairInk: string};

const COLORS = [palette.cream, palette.sand, palette.tan, palette.mintPale];

function rowChunks(R: TerraceRow, half: [number, number], ext: [number, number], seed: string): {core: RowChunk; left: RowChunk; right: RowChunk} {
  const mk = (): {pb: PathBuf[]; screens: PathBuf; bars: PathBuf; doors: PathBuf; plaques: PathBuf; locks: PathBuf; bits: PathBuf; ink: string; stairs: PathBuf; stairInk: string} => ({
    pb: COLORS.map(() => new PathBuf(2)),
    screens: new PathBuf(2),
    bars: new PathBuf(2),
    doors: new PathBuf(2),
    plaques: new PathBuf(2),
    locks: new PathBuf(2),
    bits: new PathBuf(2),
    ink: '',
    stairs: new PathBuf(2),
    stairInk: '',
  });
  const parts = {core: mk(), left: mk(), right: mk()};
  const u = R.w / 90;
  const sx = stairX(R.k);
  const jFrom = Math.floor((ext[0] - R.x0) / R.w) - 1;
  const jTo = Math.ceil((ext[1] - R.x0) / R.w) + 1;
  for (let j = jFrom; j <= jTo; j++) {
    const x = R.x0 + j * R.w;
    const cx = x + R.w / 2;
    if (cx < ext[0] || cx > ext[1]) continue;
    const P = cx < half[0] ? parts.left : cx > half[1] ? parts.right : parts.core;
    // the stair gap (rows 1-6): no house where the stair climbs
    if (R.k >= 1 && R.k <= 6 && Math.abs(cx - sx) < R.w * 0.5) {
      const dir = R.k % 2 ? -1 : 1;
      const xa = sx - dir * R.w * 0.3;
      const xb = sx + dir * R.w * 0.3;
      P.stairs.rect(x, R.top, R.w, R.h);
      let st = `M${xa.toFixed(2)} ${R.base.toFixed(2)}L${xb.toFixed(2)} ${R.top.toFixed(2)}M${(xa + dir * R.w * 0.14).toFixed(2)} ${R.base.toFixed(2)}L${(xb + dir * R.w * 0.14).toFixed(2)} ${R.top.toFixed(2)}`;
      for (let s = 1; s < 8; s++) {
        const q = s / 8;
        const px = xa + (xb - xa) * q;
        const py = R.base - R.h * q;
        st += `M${px.toFixed(2)} ${py.toFixed(2)}l${(dir * R.w * 0.14).toFixed(2)} 0`;
      }
      P.stairInk += st;
      continue;
    }
    const ci = Math.floor(rand(seed, `${R.k}/${j}`) * COLORS.length);
    P.pb[ci].rect(x, R.top, R.w - 0.6 * u, R.h);
    P.screens.rect(x + 17.5 * u, R.top + 30 * u + 9.5 * u, 55 * u, 25.5 * u);
    P.bars.rect(x + 17.5 * u, R.top + 30 * u, 55 * u, 9.5 * u);
    P.doors.rect(x + 32.5 * u, R.top + 97.5 * u, 30 * u, 50 * u);
    P.plaques.rect(x + 14 * u, R.top + 106 * u, 8 * u, 8 * u);
    P.locks.rect(x + 53.25 * u, R.top + 117.25 * u, 8.5 * u, 10.5 * u);
    P.bits.circle(x + 57.5 * u, R.top + 121 * u, 2.6 * u);
    if (R.k <= 5) {
      // facade outline (left side + cornice), window frame, door frame: world-unit ink
      P.ink += `M${x.toFixed(2)} ${R.base.toFixed(2)}L${x.toFixed(2)} ${R.top.toFixed(2)}L${(x + R.w).toFixed(2)} ${R.top.toFixed(2)}`;
      if (R.k <= 3) P.ink += `M${(x + 17.5 * u).toFixed(2)} ${(R.top + 30 * u).toFixed(2)}h${(55 * u).toFixed(2)}v${(35 * u).toFixed(2)}h${(-55 * u).toFixed(2)}z` + `M${(x + 32.5 * u).toFixed(2)} ${R.base.toFixed(2)}V${(R.top + 97.5 * u).toFixed(2)}H${(x + 62.5 * u).toFixed(2)}V${R.base.toFixed(2)}`;
    }
  }
  const fin = (p: ReturnType<typeof mk>): RowChunk => ({facades: p.pb.map((b) => b.d), screens: p.screens.d, bars: p.bars.d, doors: p.doors.d, plaques: p.plaques.d, locks: p.locks.d, bits: p.bits.d, ink: p.ink, stairs: p.stairs.d, stairInk: p.stairInk});
  return {core: fin(parts.core), left: fin(parts.left), right: fin(parts.right)};
}

const CHUNKS = new Map<string, ReturnType<typeof rowChunks>>();
function chunksFor(mode: 'hill' | 'flat', k: number, seed: string) {
  const key = `${mode}/${k}/${seed}`;
  let v = CHUNKS.get(key);
  if (!v) {
    const R = (mode === 'hill' ? ROWS_HILL : ROWS_FLAT)[k];
    // the initial hill: narrower toward the ridge; extended rows run far past the frame
    const hw = 610 - Math.min(1, k / 16) * 300;
    v = rowChunks(R, [540 - hw, 540 + hw], [-700, 1780], seed);
    CHUNKS.set(key, v);
  }
  return v;
}

// ---------------------------------------------------------------- render

const inkFor = (k: number) => (k === 0 ? 0.85 : k <= 5 ? 0.6 - (k - 1) * 0.05 : 0);

const RowNode: React.FC<{mode: 'hill' | 'flat'; k: number; zoom: number; reveal: number; extended: boolean; plaques: boolean; bits: boolean; seed: string}> = ({mode, k, zoom, reveal, extended, plaques, bits, seed}) => {
  const R = (mode === 'hill' ? ROWS_HILL : ROWS_FLAT)[k];
  const C = chunksFor(mode, k, seed);
  const depth = Math.min(1, k / 11);
  const off: [number, number] = [misreg.dx / zoom, misreg.dy / zoom];
  const cols = COLORS.map((c) => (k <= 2 ? c : atmos(c, depth, 'day', {clear: 0.2})));
  const wall = k <= 2 ? palette.sand : atmos(palette.sand, depth, 'day', {clear: 0.2});
  const door = k <= 4 ? palette.teal : atmos(palette.teal, depth, 'day', {clear: 0.2});
  const iw = inkFor(k);
  const sets: RowChunk[] = extended ? [C.core, C.left, C.right] : [C.core];
  const inner = (
    <>
      {/* retaining wall strip under the row + its line */}
      <Fill rect={[-700, R.base, 2480, Math.max(0.6, 3 * Math.pow(0.8, k) + 0.5)]} color={wall} offset={false} mode="snap" seed={`${seed}/w${k}`} />
      {sets.map((c, i) => (
        <React.Fragment key={i}>
          {c.facades.map((d, ci) => (d ? <Fill key={ci} d={d} color={cols[ci]} offset={k <= 2 ? off : false} mode="snap" seed={`${seed}/f${k}/${i}/${ci}`} /> : null))}
          {c.stairs ? <Fill d={c.stairs} color={wall} offset={false} mode="snap" seed={`${seed}/st${k}/${i}`} /> : null}
          {c.screens && k <= 9 ? <Fill d={c.screens} color={palette.cream} offset={false} mode="snap" seed={`${seed}/s${k}/${i}`} /> : null}
          {c.bars && k <= 9 ? <Fill d={c.bars} color={palette.tealDark} offset={false} mode="snap" seed={`${seed}/b${k}/${i}`} /> : null}
          {c.doors ? <Fill d={c.doors} color={door} offset={false} mode="snap" seed={`${seed}/d${k}/${i}`} /> : null}
          {plaques && c.plaques && k <= 13 ? <Fill d={c.plaques} color={palette.sand} offset={false} mode="snap" seed={`${seed}/p${k}/${i}`} /> : null}
          {c.locks && k <= 11 ? <Fill d={c.locks} color={palette.sand} offset={false} mode="snap" seed={`${seed}/l${k}/${i}`} /> : null}
          {bits && c.bits && k <= 11 ? <Fill d={c.bits} color={palette.ink} offset={false} mode="snap" seed={`${seed}/bit${k}/${i}`} /> : null}
          {iw > 0 && c.ink ? <Ink d={c.ink} width={iw} taper={false} vary={0} seed={`${seed}/i${k}/${i}`} /> : null}
          {c.stairInk && iw > 0 ? <Ink d={c.stairInk} width={iw * 0.8} taper={false} vary={0} seed={`${seed}/si${k}/${i}`} /> : null}
        </React.Fragment>
      ))}
      {iw > 0 ? <Ink d={`M-700 ${R.base.toFixed(2)}L1780 ${R.base.toFixed(2)}`} width={iw} taper={false} vary={0} seed={`${seed}/rw${k}`} /> : null}
    </>
  );
  if (reveal >= 1) return inner;
  if (reveal <= 0) return null;
  return <XG m={mat.about(mat.scale(1, reveal), 540, R.base)}>{inner}</XG>;
};

export type TerraceHillProps = {
  mode?: 'hill' | 'flat';
  /** Rows appear as their top passes below this SCREEN y (the caption floor, 570) — a 14 px spatial pop. Omit = all. */
  revealFloor?: number;
  /** Plaque dots blink on row 0 -> ridge (row k at plaqueWaveAt + k * waveStep). Omit = there. */
  plaqueWaveAt?: number;
  /** A Bit silhouette pops into every lock, row by row. Omit = none. */
  bitWaveAt?: number;
  waveStep?: number;
  /** The terraces extend at the edges (row k at extendAt + k * 0.03). Omit = already extended. */
  extendAt?: number;
  /** The check flag on house #4 rises. Omit = none; -1 = up. */
  flagAt?: number;
  /** The 12 target rings pop (0.05 s stagger) from here. Omit = none. */
  ringsAt?: number;
  /** House #4's lock (props-lane Lock props; default the FIXED lock: Part A installed it). */
  house4Lock?: Partial<LockProps>;
  sun?: React.ReactNode;
  wrap?: LayerWrap;
  x?: number;
  y?: number;
  scale?: number;
  seed?: Seed;
};

export const TerraceHill: React.FC<TerraceHillProps> = ({mode = 'hill', revealFloor, plaqueWaveAt, bitWaveAt, waveStep = 0.06, extendAt, flagAt, ringsAt, house4Lock = {}, sun, wrap = noWrap, x = 0, y = 0, scale = 1, seed = 'terr'}) => {
  const t = useTime();
  const m = useXf();
  const zoom = Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) * scale || 1;
  const rows = mode === 'hill' ? ROWS_HILL : ROWS_FLAT;
  const sd = String(seed);
  const screenY = (wy: number) => m[1] * 540 + m[3] * (wy * scale + y) + m[5];
  const nodes: React.ReactNode[] = [];
  for (let k = rows.length - 1; k >= 0; k--) {
    const R = rows[k];
    const reveal = revealFloor === undefined ? 1 : Math.max(0, Math.min(1, (screenY(R.top) - revealFloor) / 14 + 1));
    if (reveal <= 0) continue;
    const extended = extendAt === undefined || t >= extendAt + k * 0.03;
    const plaques = plaqueWaveAt === undefined || t >= plaqueWaveAt + k * waveStep;
    const bits = bitWaveAt !== undefined && t >= bitWaveAt + k * waveStep;
    nodes.push(<RowNode key={k} mode={mode} k={k} zoom={zoom} reveal={reveal} extended={extended} plaques={plaques} bits={bits} seed={sd} />);
  }
  // house #4 in full detail (the hidden-match object) over its batched stand-in
  const H4 = TERRACE.house4;
  const r0 = rows[0];
  const house4 = (
    <>
      <Fill rect={H4.facade} color={palette.sand} offset={[misreg.dx / zoom, misreg.dy / zoom]} seed={`${sd}/h4f`} />
      <Fill rect={[H4.facade[0], H4.facade[1], H4.facade[2] * 0.22, H4.facade[3]]} color={palette.tan} offset={false} seed={`${sd}/h4s`} />
      <Ink d={line(H4.facade[0], H4.facade[1], H4.facade[0] + H4.facade[2], H4.facade[1], {seed: `${sd}/h4c`, over: [1.2, 1.2], breaks: false}) + line(H4.facade[0], H4.facade[1], H4.facade[0], r0.base, {seed: `${sd}/h4l`, over: [0, 1], breaks: false}) + line(H4.facade[0] + H4.facade[2], H4.facade[1], H4.facade[0] + H4.facade[2], r0.base, {seed: `${sd}/h4r`, over: [0, 1], breaks: false})} width={0.85} taper={false} vary={0} />
      <ChromeSlot x={H4.window[0]} y={H4.window[1]} w={H4.window[2]} h={H4.window[3]} width={0.85} seed={`${sd}/h4w`} />
      <FacadeDoor r={H4.door} width={0.85} seed={`${sd}/h4d`} />
      <PlaqueSlot x={H4.facade[0] + 18} y={H4.facade[1] + 110} size={8} width={0.4} seed={`${sd}/h4p`} />
      <Lock x={H4.lock.x} y={H4.lock.y} size={H4.lock.h} state="fixed" ink={0.6} seed={`${sd}/h4lock`} {...house4Lock} />
      {flagAt !== undefined ? <CheckFlagSlot x={TERRACE.flag[0]} y={TERRACE.flag[1]} size={44} raiseAt={flagAt < 0 ? undefined : flagAt} at={flagAt < 0 ? undefined : flagAt} width={1.6} seed={`${sd}/flag`} /> : null}
    </>
  );
  const rings =
    ringsAt === undefined
      ? null
      : TERRACE.rings.map(([rx, ry, rr], i) => <TargetRingSlot key={i} x={rx} y={ry} r={rr} at={ringsAt + i * 0.05} width={Math.max(0.8, rr * 0.12)} seed={`${sd}/ring${i}`} />);
  const street = (
    <>
      <Fill rect={[-700, r0.base, 2480, 700]} color={palette.mintPale} offset={false} mode="snap" seed={`${sd}/street`} />
      <Fill rect={[-700, r0.base, 2480, 10]} color={palette.sand} offset={false} mode="snap" seed={`${sd}/kerbF`} />
      <Ink d={`M-700 ${r0.base + 10}L1780 ${r0.base + 10}M-700 ${r0.base + 34}L1780 ${r0.base + 34}`} width={0.85} taper={false} vary={0} seed={`${sd}/kerb`} />
    </>
  );
  return (
    <SetPlace x={x} y={y} scale={scale}>
      {sun ? wrap('sun', 0.05, sun) : null}
      {wrap('street', 0.9, street)}
      {wrap('hill', 0.6, <>{nodes}</>)}
      {wrap('house4', 0.6, house4)}
      {wrap('rings', 0.6, rings)}
    </SetPlace>
  );
};

