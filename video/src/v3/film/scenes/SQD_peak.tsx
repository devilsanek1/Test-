// SQD_peak (REVEAL lane): THE mountain of memory sticks, built for SQD's x27 pull-back (docs/v3/flow_v2.md §4 SQD):
// at the start the camera sits on its summit, where ONE stick (the same MemoryStick SQC lifts out of your laptop) lies
// on its neighbours, so every stick of the pile must read as a real stick at any zoom: each one is the kit's stick
// shape (kit/Memory.tsx stickGeo: the board with its key notch and side notches, 4 chips, the pin strip), never a
// plain quad (x27 shows real chips, never hay). S9_peak's layout (rows from the foot to the crest, the silhouette's
// sticks jutting out, drawn back to front in layered groups so no chip prints through a nearer stick), moved to
// outside's summit (800, 640) at the H2 size: sticks 26 px at the crest -> 52 at the foot (hidden behind the town).
// Light (the street rig: the open sky is the key, upper left): every stick's top edge a step lighter (the pile's tops
// lit), the boards in shade one step down on the right flank, no ink inside the pile (tier C mass; the summit stick
// alone carries the subject's outline). Static geometry, computed once. H2 px.
import React from 'react';
import {rng} from '../../../lib/rng';
import {MemoryStick, STICK_RATIO} from '../kit';
import {StickDetail} from '../kit/S8_stick';
import {Rim, ContactShadow, polyD} from '../kit/Light';
import {T9} from './S9_tones';

type Pt = [number, number];
const f1 = (v: number) => v.toFixed(2);

/** The summit of the mountain (H2 px): outside's frame (flow_v2 §3). */
export const SUMMIT: Pt = [800, 640];
export const PEAK = {x: SUMMIT[0], y: SUMMIT[1], base: 1010, tanL: Math.tan((33 * Math.PI) / 180), tanR: Math.tan((31 * Math.PI) / 180)};
const X1 = 1260;
/** The pile's tones (S9's gold memory at the far plane's mix: L 71 / C 36, the warmest far shape), + its lit tops. */
export const PEAK_TONES = {
  gold: T9.pileGold,
  deep: T9.pileDeep,
  lit: '#E0B680',
  pin: '#DDBB8C',
  /** The neighbours' chips: a calm warm brown (L* 60, 11 under the gold: CRAFT §c's tier C, <= 15 inside a plane), never
   *  the summit stick's near-black: the pile reads as sticks at every zoom without a field of dark rectangles (the
   *  owner: "too busy"), and the subject stick keeps the contrast. */
  chip: '#B3865F',
  mound: '#B98757',
} as const;

/** The kit stick's outline, chips and pins (local, centred on 0, 0), for width w: the same proportions as
 *  kit/Memory.tsx's stickGeo (4 chips, margin 0.06 w, gap 0.04 w, chips 0.13-0.63 h, pins from 0.76 h). */
function stickParts(w: number) {
  const h = w * STICK_RATIO;
  const x0 = -w / 2;
  const y0 = -h / 2;
  const nx = x0 + w * 0.42;
  const nw = Math.max(0.6, w * 0.035);
  const nd = h * 0.16;
  const sd = h * 0.12;
  const outline: Pt[] = [
    [x0, y0], [x0 + w, y0], [x0 + w, y0 + h * 0.5], [x0 + w - sd, y0 + h * 0.58], [x0 + w, y0 + h * 0.66], [x0 + w, y0 + h],
    [nx + nw, y0 + h], [nx + nw, y0 + h - nd], [nx, y0 + h - nd], [nx, y0 + h], [x0, y0 + h], [x0, y0 + h * 0.66], [x0 + sd, y0 + h * 0.58], [x0, y0 + h * 0.5],
  ];
  const m = w * 0.06;
  const g = w * 0.04;
  const cw = (w - m * 2 - g * 3) / 4;
  const chips: Pt[][] = [0, 1, 2, 3].map((i) => {
    const cx = x0 + m + i * (cw + g);
    return [[cx, y0 + h * 0.13], [cx + cw, y0 + h * 0.13], [cx + cw, y0 + h * 0.63], [cx, y0 + h * 0.63]];
  });
  const pins: Pt[] = [[x0 + w * 0.05, y0 + h * 0.76], [x0 + w * 0.95, y0 + h * 0.76], [x0 + w * 0.95, y0 + h], [x0 + w * 0.05, y0 + h]];
  // the lit top: a band along the top edge (12 % of the height), inside the board
  const top: Pt[] = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h * 0.12], [x0, y0 + h * 0.12]];
  return {outline, chips, pins, top};
}

const pathOf = (pts: Pt[], P: (q: Pt) => Pt) => pts.map((q, i) => {
  const [x, y] = P(q);
  return `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`;
}).join('') + 'Z';

type Group = {board: string; deep: string; top: string; pins: string; chips: string};
const PEAK_D = (() => {
  const r = rng('sqd/peak');
  type S = {x: number; y: number; w: number; rot: number; shade: boolean};
  const rows: S[][] = [];
  const H = PEAK.base - PEAK.y;
  const wAt = (y: number) => 26 + 26 * Math.max(0, Math.min(1, (y - PEAK.y) / H));
  for (let y = PEAK.base - 4; y > PEAK.y + 3; ) {
    const w = wAt(y);
    const dy = Math.max(0, y - PEAK.y);
    const xl = PEAK.x - dy / PEAK.tanL;
    const xr = Math.min(X1, PEAK.x + dy / PEAK.tanR);
    const row: S[] = [];
    const step = w * 0.62;
    const n = Math.max(1, Math.round((xr - xl) / step));
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1);
      const edge = i === 0 || i === n - 1;
      const sx = xl + u * (xr - xl) + r.jitter(step * 0.3);
      // near level inside the pile; at the silhouette (row ends, the crest rows) they jut out at an angle
      const jut = edge || dy < 20;
      const rot = jut ? r.range(10, 28) * (sx < PEAK.x ? -1 : 1) * (r.chance(0.3) ? -1 : 1) : r.chance(0.04) ? r.range(20, 34) * r.sign() : r.jitter(8);
      // the right flank turns from the sky (upper left): more of its boards in shade
      const shade = r.chance(0.18 + 0.3 * Math.max(0, Math.min(1, (sx - PEAK.x) / 420)));
      row.push({x: sx + (jut && edge ? (i === 0 ? -w * 0.16 : w * 0.16) : 0), y: y + r.jitter(w * 0.07) - (jut ? r.range(1, 4) : 0), w: w * r.range(0.9, 1.04), rot, shade});
    }
    rows.push(row);
    y -= w * STICK_RATIO * 0.74;
  }
  // a few sticks round the summit stick, so it lies ON sticks (its neighbours at x27: real chips)
  const crest: S[] = [
    {x: PEAK.x - 16, y: PEAK.y + 6, w: 26, rot: -12, shade: false},
    {x: PEAK.x + 15, y: PEAK.y + 7, w: 25, rot: 10, shade: true},
    {x: PEAK.x - 1, y: PEAK.y + 10, w: 27, rot: 2, shade: false},
    {x: PEAK.x - 30, y: PEAK.y + 14, w: 26, rot: -20, shade: false},
    {x: PEAK.x + 29, y: PEAK.y + 15, w: 26, rot: 18, shade: true},
    {x: PEAK.x + 8, y: PEAK.y + 17, w: 27, rot: -4, shade: true},
    {x: PEAK.x - 15, y: PEAK.y + 20, w: 27, rot: 5, shade: false},
  ];
  rows.push(crest);
  const groups: Group[] = [];
  for (let ri = rows.length - 1; ri >= 0; ri--) {
    for (const parity of [0, 1]) {
      const g: Group = {board: '', deep: '', top: '', pins: '', chips: ''};
      rows[ri].forEach((s, si) => {
        if (si % 2 !== parity) return;
        const a = (s.rot * Math.PI) / 180;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const P = ([lx, ly]: Pt): Pt => [s.x + lx * ca - ly * sa, s.y + lx * sa + ly * ca];
        const k = stickParts(s.w);
        const body = pathOf(k.outline, P);
        if (s.shade) g.deep += body;
        else g.board += body;
        // tops lit by the sky: only where the top edge faces up (|rot| < 60)
        if (Math.abs(s.rot) < 60) g.top += pathOf(k.top, P);
        g.pins += pathOf(k.pins, P);
        for (const c of k.chips) g.chips += pathOf(c, P);
      });
      if (g.board || g.deep) groups.push(g);
    }
  }
  // the mound behind the sticks (no sky through the gaps), a little inside the silhouette
  const mound: Pt[] = [[PEAK.x - (PEAK.base - PEAK.y) / PEAK.tanL + 8, PEAK.base], [PEAK.x - 18, PEAK.y + 5], [PEAK.x - 10, PEAK.y + 1], [PEAK.x + 10, PEAK.y + 1], [PEAK.x + 18, PEAK.y + 5], [X1, PEAK.y + (X1 - PEAK.x) * PEAK.tanR + 6], [X1, PEAK.base]];
  return {groups, mound: polyD(mound)};
})();

/** The mountain (H2 px): mound, then ~1000 kit-shaped sticks in layered groups. Tier C (raw fills, no line). */
export const RevealPeak: React.FC = () => (
  <>
    <path d={PEAK_D.mound} fill={PEAK_TONES.mound} />
    {PEAK_D.groups.map((g, i) => (
      <React.Fragment key={i}>
        <path d={g.board} fill={PEAK_TONES.gold} />
        <path d={g.deep} fill={PEAK_TONES.deep} />
        <path d={g.top} fill={PEAK_TONES.lit} />
        <path d={g.pins} fill={PEAK_TONES.pin} />
        <path d={g.chips} fill={PEAK_TONES.chip} />
      </React.Fragment>
    ))}
  </>
);

/** THE stick (J3's carrier), drawn in SCREEN px at its screen centre and width: the kit MemoryStick + S8's close-up
 *  detail, the props SQC's stick uses at (540, 870), w 700, rot -4 (one look on both sides of the push-through). */
export const J3Stick: React.FC<{x: number; y: number; w: number; rot: number}> = ({x, y, w, rot}) => (
  <>
    <MemoryStick x={x} y={y} w={w} rot={rot} seed="s8/stick" />
    <StickDetail x={x} y={y} w={w} rot={rot} seed="s8/stickD" />
  </>
);

/** The summit stick's light in SCREEN px (the street rig: the open sky upper left): a contact shadow where it lies on
 *  its neighbours and a COLD rim along its upper-left edges (the subject's rim; CRAFT §d.8: 4-6 px inside, never an
 *  offset copy). `w` = its screen width; the rim thins with the stick so it never outweighs it far away. */
export const J3StickLight: React.FC<{x: number; y: number; w: number; rot: number}> = ({x, y, w, rot}) => {
  const h = w * STICK_RATIO;
  const rimW = Math.max(0.8, Math.min(5, w * 0.008));
  const a = (rot * Math.PI) / 180;
  // its silhouette as the rim's shape (the board without the notches: the rim lies on the top and left edges)
  const P = (lx: number, ly: number): Pt => [x + lx * Math.cos(a) - ly * Math.sin(a), y + lx * Math.sin(a) + ly * Math.cos(a)];
  const board = polyD([P(-w / 2, -h / 2), P(w / 2, -h / 2), P(w / 2, h / 2), P(-w / 2, h / 2)]);
  const foot = P(0, h / 2);
  return (
    <>
      <ContactShadow x={foot[0]} y={foot[1] + Math.max(1, h * 0.02)} w={w} h={Math.max(2, Math.min(14, h * 0.06))} k={1.06} tint="cast" />
      <Rim d={board} c={[x, y]} size={[w, h]} width={rimW} color={RIM_COLD} />
    </>
  );
};
/** The cold rim: the dusk sky's light on the stick's gold (lighter, cooler: the subject's edge on the darker sky). */
export const RIM_COLD = '#F4F0F6';
