// SQD_peak (REVEAL lane): THE mountain of memory sticks, built for SQD's x23.3 pull-back (docs/v3/flow_v2.md §4 SQD):
// at the start the camera sits on its summit, where ONE stick (the same MemoryStick SQC lifts out of your laptop) lies
// on its neighbours, so every stick of the pile must read as a real stick at any zoom: each one is the kit's stick
// shape (kit/Memory.tsx stickGeo: the board with its key notch and side notches, 4 chips, the pin strip), never a
// plain quad (x23 shows real chips, never hay). Rows from the foot to the crest (the silhouette's sticks jutting out,
// drawn back to front in layered groups so no chip prints through a nearer stick) at outside's summit (800, 640), H2
// size: sticks 26 px at the crest -> 52 at the foot (hidden behind the town).
// THE CREST (final pass, E7): THE stick (SUMMIT_W = 30 px, rot -4) rests on a BED of two sticks at its own angle, their tops
// tucked 1.35 px behind its bottom edge, so at every zoom of the pull it lies on gold (never on a strip of sky); a second
// layer of six sticks steps the crest out to the flanks; the mound behind follows the bed, so no sky shows through.
// THE READ (final pass, E5: "a mountain of memory sticks" read as pallets, then as a brick texture): detail is kept
// where the camera dwells and dropped where it does not. Round the summit (seen at 190-830 px during the pull) the
// sticks wear THE stick's own colours one value under it: a gold board, a pin strip, four warm dark chips; further out
// the chips go pale, and the lower pile (first seen small, at the frame's edge, as the camera leaves the crest) is
// flat boards with a soft lit top, no chips, no pins: one calm golden mass with a pile's silhouette.
// DETAIL BY SIZE ON SCREEN (atmospheric perspective: far things simpler, lower in contrast): the crest's chips are a
// warm brown, 20 L* under the board (the reveal's declared exception to CRAFT §c's dL* 15: the sticks must read as
// memory, not pallets; THE stick's own chips stay near-black, L* 13), while a crest stick is >= 120 px on screen (the
// pull to ~20.8), and pale out to tier C (11 L* under the board) by the time it is 50 px (~21.2, inside the move's
// fastest stretch); the pale chips further out go with them. So the hold, SQE and SQF (the far plane at x1.0-1.08) see the calm pile: a golden mass with a pile's
// silhouette, no specks. One look on both sides of J4 by construction (it is the far plane's scale, the same in every
// builder). Light (the street rig: the open sky is the key, upper left): the sticks' tops a step lighter, the right
// flank's boards in shade one step down, no ink inside the pile (the summit stick alone carries the subject's
// outline). Static geometry, computed once. H2 px.
import React from 'react';
import {rng} from '../../../lib/rng';
import {clamp, useGlobalTime} from '../../../lib/time';
import {mat, useXf, type Mat} from '../../../lib/xf';
import {MemoryStick, STICK_RATIO} from '../kit';
import {StickDetail} from '../kit/S8_stick';
import {Rim, ContactShadow, ShadowLayer, Lit, RIGS, polyD, mixHex, multiply, useLightOff} from '../kit/Light';
import {T9} from './S9_tones';

type Pt = [number, number];
const f1 = (v: number) => v.toFixed(2);

/** The summit of the mountain (H2 px): outside's frame (flow_v2 §3). */
export const SUMMIT: Pt = [800, 640];
export const PEAK = {x: SUMMIT[0], y: SUMMIT[1], base: 1010, tanL: Math.tan((33 * Math.PI) / 180), tanR: Math.tan((31 * Math.PI) / 180)};
const X1 = 1260;
/** J3's carrier at the push-through (flow_v2 §6): SQC lifts THE stick out of your laptop to this pose (screen px), and
 *  SQD's t 0 draws the summit stick exactly here. */
export const J3_STICK = {x: 540, y: 870, w: 700, rot: -4};
/** THE stick's width at H2 rest (px): >= ~30, so it still reads on the summit at phone size (early review E5; it was
 *  700 / 27 = 25.9). ONE number for every builder: the far plane's start zoom at J3's landing is K0 = 700 / SUMMIT_W
 *  (SQD_rig), outside.tsx's summit stick is this one, and the crest's bed is built round it, so J3 still matches. */
export const SUMMIT_W = 30;
/** The far plane's zoom at SQD's t 0 (x23.3): the summit stick at J3_STICK's 700 px. */
export const K0 = J3_STICK.w / SUMMIT_W;
/** THE stick in H2 px (outside.tsx's H2_SUMMIT and SQD_rig's SUMMIT_STICK are this object): its pins' edge on the summit
 *  point (its centre half its height, 0.155 w, above it). The crest is built round it. */
export const SUMMIT_STICK = {x: SUMMIT[0], y: SUMMIT[1] - SUMMIT_W * 0.155, w: SUMMIT_W, rot: J3_STICK.rot};
const THE = SUMMIT_STICK;

/** The pile's tones: THE stick's gold one value under it (L* 70, C* 39), a step darker for the boards turned from the
 *  sky, lit tops a step lighter, gold pins, the mound behind in the gaps; the tops and pins brightest on the crest
 *  THE stick lies on (L* 75.5 / 75), then softer with distance (73.5 / 73, 72.6 / 72.2; the lower pile's tops 71.8, no
 *  pins), all under THE stick's own board (77), pins (92), label and rim: the brightest 5 % of the frame sits on it and
 *  right round it at every zoom of the pull (CRAFT §d.2: the light leads the eye). */
const TONES = {gold: '#D4A268', deep: '#C5935E', litC: '#DEB37D', lit: '#D9AD76', litB: '#D8AB73', lit2: '#D6A871', pinC: '#D3B58B', pin: '#CEAF85', pinB: '#CDAA7F', mound: '#B98757'} as const;
/** The chips' two ends (see the header): `near` while a crest stick is big on screen, `far` once it is small; the
 *  crest's chips (A) and the pale ones further out (B). */
const CHIPS = {A: {near: '#966E59', far: '#B3865F'}, B: {near: '#AD8366', far: '#C99762'}} as const;
/** On-screen width of a crest stick (px) at which its chips are fully `near`, and fully `far`. */
const CHIP_NEAR_W = 120;
const CHIP_FAR_W = 50;
/** THE FORM SHADE (CRAFT §d.4; the street rig: the open sky's bright side is up-left): the right flank, turned from it,
 *  one flat step down, every fill times the dusk family's form tint (#BBA8DA at 0.5: gold L* 70 -> 60), its
 *  terminator a line from just right of the crest down the flank (~25-35 % of the pile's width), the sticks on it whole
 *  (the terminator follows the stick edges, as a pile's would). The A side of the light check draws it off. */
const FORM_TINT = mixHex('#FFFFFF', '#BBA8DA', 0.5);
const TERM: [Pt, Pt] = [[818, 640], [960, 1010]];
const termX = (y: number) => TERM[0][0] + ((y - TERM[0][1]) * (TERM[1][0] - TERM[0][0])) / (TERM[1][1] - TERM[0][1]);
const SHADE_POLY: Pt[] = [[TERM[0][0], 560], TERM[0], TERM[1], [TERM[1][0], 1100], [1500, 1100], [1500, 560]];
const shadeOf = (c: string) => multiply(c, FORM_TINT);
/** THE PILE'S RIM on its beat (CRAFT §d.8: the subject on a darker field gets the key's light along its key-facing
 *  silhouette): from "By the mountain." (21.32) to the street's load beat (23.10, outside.tsx's H2_BEATS.load: the
 *  far field hands the eye to the street there), a lit gold band 4 px (screen) inside the pile's upper-left
 *  silhouette, each switch a 2-step change; off its beat the pile is tier C, no rim. */
export const PILE_RIM_A: [number, number] = [21.32, 23.1];
const PILE_RIM = '#F4D29F';
const rimK = (T: number) => {
  const [a, b] = PILE_RIM_A;
  if (T < a || T >= b + 0.05) return 0;
  return T < a + 0.05 || T >= b ? 0.5 : 1;
};
/** The pile's tones in SQE / SQF (tier C), for other builders that sit things over it (outside's chimney puffs). */
export const PEAK_TONES = {gold: TONES.gold, deep: TONES.deep, lit: TONES.lit2, pin: TONES.pinB, chip: CHIPS.A.far, mound: TONES.mound} as const;

/** The kit stick's outline, chips and pins (local, centred on 0, 0), for width w: the same proportions as
 *  kit/Memory.tsx's stickGeo (4 chips, margin 0.06 w, gap 0.04 w, chips 0.13-0.63 h, pins from 0.76 h). */
export function stickParts(w: number) {
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

/** A stick's map: local (centred) -> its frame, for a pose {x, y, rot}. */
const poseMap = (s: {x: number; y: number; rot: number}) => {
  const a = (s.rot * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  return ([lx, ly]: Pt): Pt => [s.x + lx * ca - ly * sa, s.y + lx * sa + ly * ca];
};
const pathOf = (pts: Pt[], P: (q: Pt) => Pt) => pts.map((q, i) => {
  const [x, y] = P(q);
  return `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`;
}).join('') + 'Z';

/** A stick of the pile. lod: 0 = the crest (chips dark in the reveal), 1 = chips pale, 2 = the lower pile (a flat
 *  board with a soft lit top: no chips, no pins). */
type S = {x: number; y: number; w: number; rot: number; shade: boolean; lod: 0 | 1 | 2; crest?: boolean};
type Parts = {board: string; deep: string; topC: string; top: string; topB: string; top2: string; pinsC: string; pins: string; pinsB: string; chipA: string; chipB: string};
/** One layered group: the lit flank's parts and the shaded flank's (`dark`). */
type Group = {lit: Parts; dark: Parts};
const noParts = (): Parts => ({board: '', deep: '', topC: '', top: '', topB: '', top2: '', pinsC: '', pins: '', pinsB: '', chipA: '', chipB: ''});
/** Detail by distance from the summit (H2 px; vertical distances count 0.85x: the camera's view reaches further down
 *  than sideways): the crest's chips to 42 px, pale chips to 150 px, flat beyond. */
const lodAt = (x: number, y: number): 0 | 1 | 2 => {
  const d = Math.hypot(x - SUMMIT[0], (y - SUMMIT[1]) * 0.85);
  return d < 42 ? 0 : d < 150 ? 1 : 2;
};

const PEAK_D = (() => {
  const r = rng('sqd/peak');
  const rows: S[][] = [];
  const H = PEAK.base - PEAK.y;
  const wAt = (y: number) => 26 + 26 * Math.max(0, Math.min(1, (y - PEAK.y) / H));
  // the rows, from the foot up to just under the crest (the crest's two layers are placed by hand, below)
  for (let y = PEAK.base - 4; y > PEAK.y + 22; ) {
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
      // near level inside the pile; at the silhouette (the row ends) they jut out at an angle
      const rot = edge ? r.range(10, 28) * (sx < PEAK.x ? -1 : 1) * (r.chance(0.3) ? -1 : 1) : r.chance(0.04) ? r.range(20, 34) * r.sign() : r.jitter(8);
      // a few boards one step deeper, for variety (the right flank's shade is the form shade)
      const shade = r.chance(0.14);
      const x = sx + (edge ? (i === 0 ? -w * 0.16 : w * 0.16) : 0);
      const yy = y + r.jitter(w * 0.07) - (edge ? r.range(1, 4) : 0);
      row.push({x, y: yy, w: w * r.range(0.9, 1.04), rot, shade, lod: lodAt(x, yy)});
    }
    rows.push(row);
    y -= w * STICK_RATIO * 0.74;
  }
  // the crest's second layer: six sticks stepping out to the flanks (left ones turned down to the left, right ones to
  // the right), in front of the bed
  const layer2: S[] = ([
    [-38, 21, 28, -26, false],
    [-26, 13, 27, -18, false],
    [-11, 15.5, 28, -4, false],
    [12, 16, 28, 6, true],
    [26, 12, 27, 16, true],
    [39, 20, 28, 24, true],
  ] as [number, number, number, number, boolean][]).map(([dx, dy, w, rot, shade]) => ({x: SUMMIT[0] + dx, y: SUMMIT[1] + dy, w, rot, shade, lod: 0, crest: true}));
  // THE BED: two sticks at THE stick's angle right under it, their tops 1.35 px behind its bottom edge (under the key
  // notch's 1.29 px depth: the notch shows the bed, never the sky), wider than it on both sides so its contact shadow
  // lands on gold (E7)
  const hT = THE.w * STICK_RATIO;
  const bedW = 27;
  const dv = hT / 2 + (bedW * STICK_RATIO) / 2 - 1.35;
  const onThe = poseMap(THE);
  const bed: S[] = [
    {...xy(onThe([-9, dv])), w: bedW, rot: THE.rot, shade: false, lod: 0, crest: true},
    {...xy(onThe([12, dv])), w: bedW, rot: THE.rot, shade: false, lod: 0, crest: true},
  ];
  rows.push(layer2);
  rows.push(bed);
  const groups: Group[] = [];
  for (let ri = rows.length - 1; ri >= 0; ri--) {
    for (const parity of [0, 1]) {
      const g: Group = {lit: noParts(), dark: noParts()};
      rows[ri].forEach((s, si) => {
        if (si % 2 !== parity) return;
        const q = s.x > termX(s.y) ? g.dark : g.lit;
        const P = poseMap(s);
        const k = stickParts(s.w);
        const body = pathOf(k.outline, P);
        if (s.shade) q.deep += body;
        else q.board += body;
        // tops lit by the sky: only where the top edge faces up (|rot| < 60)
        if (Math.abs(s.rot) < 60) {
          if (s.crest) q.topC += pathOf(k.top, P);
          else if (s.lod === 0) q.top += pathOf(k.top, P);
          else if (s.lod === 1) q.topB += pathOf(k.top, P);
          else q.top2 += pathOf(k.top, P);
        }
        if (s.lod < 2) {
          if (s.crest) q.pinsC += pathOf(k.pins, P);
          else if (s.lod === 0) q.pins += pathOf(k.pins, P);
          else q.pinsB += pathOf(k.pins, P);
          for (const c of k.chips) {
            if (s.lod === 0) q.chipA += pathOf(c, P);
            else q.chipB += pathOf(c, P);
          }
        }
      });
      if (g.lit.board || g.lit.deep || g.dark.board || g.dark.deep) groups.push(g);
    }
  }
  // the mound behind the sticks (no sky through the gaps), inside the silhouette: at the crest its top runs through the
  // centres of the outer crest sticks and the bed (so it never shows past them), then down the flanks
  const c0 = (s: S): Pt => [s.x, s.y + 1];
  const mound: Pt[] = [
    [PEAK.x - (PEAK.base - PEAK.y) / PEAK.tanL + 8, PEAK.base],
    c0(layer2[0]),
    c0(layer2[1]),
    [bed[0].x, bed[0].y],
    [bed[1].x, bed[1].y],
    c0(layer2[4]),
    c0(layer2[5]),
    [X1, PEAK.y + (X1 - PEAK.x) * PEAK.tanR + 6],
    [X1, PEAK.base],
  ];
  // the surface under THE stick that its contact shadow may land on: the mound and the bed (E7: never the sky)
  const under = polyD(mound) + bed.map((s) => pathOf(stickParts(s.w).outline, poseMap(s))).join('');
  // the pile's whole silhouette (the mound and every stick: one union), for its rim on its beat
  const silhouette = polyD(mound) + rows.map((row) => row.map((s) => pathOf(stickParts(s.w).outline, poseMap(s))).join('')).join('');
  return {groups, mound: polyD(mound), under, shade: polyD(SHADE_POLY), silhouette};
})();
function xy(p: Pt) {
  return {x: p[0], y: p[1]};
}

/** The mountain (H2 px): mound, then ~1000 kit-shaped sticks in layered groups; the chips by the plane's scale on
 *  screen (see the header). Tier C mass (raw fills, no line). */
export const RevealPeak: React.FC = () => {
  const m = useXf();
  const off = useLightOff();
  const id = 'sqdpk' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const sc = Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));
  const wS = THE.w * sc;
  const rk = rimK(useGlobalTime());
  const u = clamp((CHIP_NEAR_W - wS) / (CHIP_NEAR_W - CHIP_FAR_W));
  const chipA = u <= 0 ? CHIPS.A.near : u >= 1 ? CHIPS.A.far : mixHex(CHIPS.A.near, CHIPS.A.far, u);
  const chipB = u <= 0 ? CHIPS.B.near : u >= 1 ? CHIPS.B.far : mixHex(CHIPS.B.near, CHIPS.B.far, u);
  const lit: Record<keyof Parts, string> = {board: TONES.gold, deep: TONES.deep, topC: TONES.litC, top: TONES.lit, topB: TONES.litB, top2: TONES.lit2, pinsC: TONES.pinC, pins: TONES.pin, pinsB: TONES.pinB, chipA, chipB};
  const dark: Record<keyof Parts, string> = {...lit};
  if (!off) for (const k of Object.keys(lit) as (keyof Parts)[]) dark[k] = shadeOf(lit[k]);
  const parts = (q: Parts, c: Record<keyof Parts, string>, k: string) => (
    <React.Fragment key={k}>
      {q.board ? <path d={q.board} fill={c.board} /> : null}
      {q.deep ? <path d={q.deep} fill={c.deep} /> : null}
      {q.topC ? <path d={q.topC} fill={c.topC} /> : null}
      {q.top ? <path d={q.top} fill={c.top} /> : null}
      {q.topB ? <path d={q.topB} fill={c.topB} /> : null}
      {q.top2 ? <path d={q.top2} fill={c.top2} /> : null}
      {q.pinsC ? <path d={q.pinsC} fill={c.pinsC} /> : null}
      {q.pins ? <path d={q.pins} fill={c.pins} /> : null}
      {q.pinsB ? <path d={q.pinsB} fill={c.pinsB} /> : null}
      {q.chipA ? <path d={q.chipA} fill={c.chipA} /> : null}
      {q.chipB ? <path d={q.chipB} fill={c.chipB} /> : null}
    </React.Fragment>
  );
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={PEAK_D.shade} />
        </clipPath>
      </defs>
      <path d={PEAK_D.mound} fill={TONES.mound} />
      {off ? null : <path d={PEAK_D.mound} fill={shadeOf(TONES.mound)} clipPath={`url(#${id})`} />}
      {PEAK_D.groups.map((g, i) => (
        <React.Fragment key={i}>
          {parts(g.lit, lit, 'l')}
          {parts(g.dark, dark, 'd')}
        </React.Fragment>
      ))}
      {rk > 0 ? (
        <Lit rig={RIGS.street}>
          <Rim d={PEAK_D.silhouette} c={[640, 840]} size={[900, 420]} width={Math.min(5, 4 / sc)} color={rk >= 1 ? PILE_RIM : mixHex(TONES.gold, PILE_RIM, 0.5)} />
        </Lit>
      ) : null}
    </>
  );
};

/** THE stick (J3's carrier), drawn in SCREEN px at its screen centre and width: the kit MemoryStick + S8's close-up
 *  detail, the props SQC's stick uses at (540, 870), w 700, rot -4 (one look on both sides of the push-through). */
export const J3Stick: React.FC<{x: number; y: number; w: number; rot: number}> = ({x, y, w, rot}) => (
  <>
    <MemoryStick x={x} y={y} w={w} rot={rot} seed="s8/stick" />
    <StickDetail x={x} y={y} w={w} rot={rot} seed="s8/stickD" />
  </>
);

/** THE stick's real silhouette (the board with its key notch and side notches), at a pose. */
export const stickOutlineD = (x: number, y: number, w: number, rot: number) => pathOf(stickParts(w).outline, poseMap({x, y, rot}));

/** A closed polygon (clockwise on screen) moved `d` px inward: each edge offset along its inward normal, each vertex
 *  where its two offset edges meet (the stick's outline has no edge shorter than ~4 % of its width, so d up to a few px
 *  stays a simple polygon). */
function insetPoly(pts: Pt[], d: number): Pt[] {
  const n = pts.length;
  const line = (i: number) => {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    return {p: [a[0] + nx * d, a[1] + ny * d] as Pt, v: [dx, dy] as Pt};
  };
  return pts.map((_, i) => {
    const A = line((i - 1 + n) % n);
    const B = line(i);
    const den = A.v[0] * B.v[1] - A.v[1] * B.v[0];
    if (Math.abs(den) < 1e-9) return B.p;
    const t = ((B.p[0] - A.p[0]) * B.v[1] - (B.p[1] - A.p[1]) * B.v[0]) / den;
    return [A.p[0] + A.v[0] * t, A.p[1] + A.v[1] * t] as Pt;
  });
}

/** The summit stick's contact shadow (the street rig: the open sky upper left): where it lies on its bed, drawn UNDER
 *  the stick. `x y w rot` in the space it is drawn in (screen px in SQD's pull, H2 px in outside's summit); `m` = H2 px
 *  -> that space (default: H2 itself), so the shadow is clipped to the bed and the mound under it, never painted on
 *  the sky (E7); its penumbra and offset scale with the stick, so it never outweighs it far away. */
export const J3StickLight: React.FC<{x: number; y: number; w: number; rot: number; m?: Mat}> = ({x, y, w, rot, m = mat.I}) => {
  const h = w * STICK_RATIO;
  const foot = poseMap({x, y, rot})([0, h / 2]);
  const id = 'sqdbed' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const fine = Math.max(0.3, Math.min(3.5, w * 0.005));
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={PEAK_D.under} transform={mat.str(m)} />
        </clipPath>
      </defs>
      <ShadowLayer>
        <g clipPath={`url(#${id})`}>
          <ContactShadow x={foot[0]} y={foot[1] + Math.max(0.3, h * 0.02)} w={w} h={Math.max(1, Math.min(14, h * 0.06))} k={1.06} away={fine} soft={fine} tint="cast" />
        </g>
      </ShadowLayer>
    </>
  );
};

/** The summit stick's COLD RIM, drawn OVER the stick (E7: under it, only its stray edge at the side notch showed): the
 *  dusk sky's light along its upper-left edges (CRAFT §d.8: the subject's rim, on a darker field), a band `rimW` px
 *  wide just inside its outline (the subject's 3 px line stays whole; the band follows the notches), never an offset
 *  copy. Screen px (SQD's pull: from 19.40 while it is big on screen). */
export const J3StickRim: React.FC<{x: number; y: number; w: number; rot: number}> = ({x, y, w, rot}) => {
  const h = w * STICK_RATIO;
  const rimW = Math.max(0.8, Math.min(5, w * 0.008));
  if (w < 120) return null;
  // the subject's outline is 3 px from 100 px up (kit MemoryStick under the clean pen)
  const line = 3;
  const inner = insetPoly(stickParts(w).outline, line).map(poseMap({x, y, rot}));
  return <Rim d={polyD(inner)} c={[x, y]} size={[w - 2 * line, h - 2 * line]} width={rimW} color={RIM_COLD} />;
};
/** The cold rim: the dusk sky's light on the stick's gold, one gentle step lighter and cooler than the board (#F2B263,
 *  L* 77 -> 88, the hue toward the sky's cream): lit, never a white stroke. */
export const RIM_COLD = '#F7DDB4';
