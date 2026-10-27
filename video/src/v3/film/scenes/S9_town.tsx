// S9_town (S9 lane, G5b): the town between the far field and our roof, for the scale end frame
// (docs/v3/s9_scale_plan.md section 1): the MID BAND (plane S9_FAR2: 3-4 rows of 22-34 px roofs with snow tops, the
// roofline climbing toward the mountain, hairline ink) and the NEAR-MID BAND (plane S9_MID: 2-3 rows of 50-80 px houses
// in five types, chimneys smoking) cut by THE DROP: the street as a canyon from below our parapet to the hall (vanishing
// point (470, 980)): no floor near us, a dark slot with its right wall lit, string lights across it, then the floor as a
// lit ribbon narrowing 26 -> 3 px with five lamps, posed walkers (about half standing; a sledge, a dog) and one car's
// lights heading for the data center's gate. End-frame coordinates (screen at rest).
//
// The town mass holds still in the hold (s9_scale_plan section 2: nothing moves inside it but the listed tiers): the
// houses' windows are drawn at one fixed time; smoke, walkers, the car and the bulbs carry its life.
import React from 'react';
import {rng} from '../../../lib/rng';
import {TimeShift, useTime} from '../../../lib/time';
import {EMBER, TownHouse, Smoke, StringLights3, Tiny, WINTER, type HouseKind} from '../kit';
import {T9, planeTone} from './S9_tones';
import {roofRows, RoofRowsView, type RoofRowSpec} from './S9_far';

type Pt = [number, number];
const f1 = (v: number) => v.toFixed(1);
const rectD = (x: number, y: number, w: number, h: number) => `M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`;
const polyD = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + 'Z';
const smooth01 = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

// ---------------------------------------------------------------- the street (one line for every plane)
export const VP: Pt = [470, 980];
const PARAPET_Y = 1398;
/** The canyon's curbs at height y (left, right): a slot 80 px wide at our parapet (x 430-510) running to the VP. */
export const canyonAt = (y: number): [number, number] => {
  const u = (PARAPET_Y - y) / (PARAPET_Y - VP[1]);
  return [430 + (VP[0] - 430) * u, 510 + (VP[0] - 510) * u];
};

// ---------------------------------------------------------------- the mid band (plane S9_FAR2)
const climb = (x: number) => -40 * smooth01((x - 560) / 440);
const MB_ROWS: RoofRowSpec[] = [0, 1, 2, 3].map((i) => {
  const haze = ((3 - i) / 3) * 0.18;
  return {
    y: 1062 + i * 15.6,
    w: 22 + i * 4,
    dark: planeTone(T9.midDark, haze),
    light: planeTone(T9.midLight, haze * 0.5),
    dot: T9.midDot,
    dotEvery: 6,
    chimEvery: 3,
    x0: -130,
    x1: 1270,
    climb,
    tall: 0.22,
  };
});
const MB = roofRows(MB_ROWS, 'midband', true);
/** A few chimneys smoking in the mid band (drifting right). */
const MB_SMOKE: Pt[] = [
  [128, 1036],
  [356, 1052],
  [612, 1030],
  [930, 1004],
  [1060, 1010],
];
export const MidBand: React.FC = () => (
  <>
    <RoofRowsView rows={MB_ROWS} paths={MB} inkColor={T9.midInk} inkW={1} />
    {MB_SMOKE.map(([x, y], i) => (
      <Smoke key={i} x={x} y={y} seed={`s9/mbs${i}`} rise={34} drift={30} r0={1.6} r1={5} n={6} />
    ))}
  </>
);

// ---------------------------------------------------------------- the near-mid band (plane S9_MID)
type NM = {x: number; y: number; w: number; h: number; kind: HouseKind; seed: string; smoke: boolean; lit: number};
const KINDS: HouseKind[] = ['cottage', 'terrace', 'block', 'mansard', 'shop'];
const NM_ROWS = [
  {y: 1172, w: 54},
  {y: 1205, w: 64},
  {y: 1240, w: 76},
];
const NEAR_MID: NM[] = (() => {
  const r = rng('s9/nearmid');
  const out: NM[] = [];
  let smokeLeft = 4;
  NM_ROWS.forEach((R, ri) => {
    const [cl, cr] = canyonAt(R.y);
    const order = r.shuffle(KINDS);
    let k = ri;
    const add = (x: number, w: number, streetFront: boolean) => {
      const kind = order[k++ % order.length];
      const hgt = w * (kind === 'block' ? r.range(0.7, 0.86) : kind === 'terrace' ? r.range(0.62, 0.74) : r.range(0.48, 0.64)) * (1 + r.int(-1, 1) * 0.12);
      const smoke = smokeLeft > 0 && kind !== 'block' && kind !== 'shop' && r.chance(0.3) && x > 120 && x < 1000;
      if (smoke) smokeLeft--;
      out.push({x, y: R.y + r.jitter(2), w, h: hgt, kind, seed: `s9/nm${ri}_${out.length}`, smoke, lit: streetFront ? 0.95 : 0.55});
    };
    // left of the street, from the curb outward; then right of it
    for (let x = cl - 3, first = true; x > -140; first = false) {
      const w = R.w * r.range(0.85, 1.15);
      add(x - w, w, first);
      x -= w * r.range(0.9, 1.04);
    }
    for (let x = cr + 3, first = true; x < 1220; first = false) {
      const w = R.w * r.range(0.85, 1.15);
      add(x, w, first);
      x += w * r.range(0.9, 1.04);
    }
  });
  // back rows first
  return out;
})();
/** Where a TownHouse's chimney top is (mirrors kit/Town.tsx: its first rng draw places the chimney). */
const chimneyTop = (h: NM): Pt => {
  const top = h.y - h.h;
  const u = rng(`th/${h.seed}`).range(0.62, 0.78);
  const chX = h.x + h.w * u;
  const chW = Math.max(5, h.w * 0.1);
  const chTop = h.kind === 'cottage' ? top - h.w * 0.42 : h.kind === 'terrace' ? top - h.w * 0.36 : top - h.w * 0.42;
  return [chX + chW / 2, chTop - 3];
};

/** The houses, at one fixed time (their windows do not switch: the town mass is still in the hold). */
const NearMidHouses: React.FC = () => {
  const t = useTime();
  return (
    <TimeShift by={t - 1.7}>
      {NEAR_MID.map((h, i) => (
        <TownHouse key={i} x={h.x} y={h.y} w={h.w} h={h.h} kind={h.kind} color={T9.nmDark} litFrac={h.lit} smoke={false} seed={h.seed} sign={h.kind === 'shop' ? (i % 2 ? 'BAKERY' : 'CAFE') : undefined} />
      ))}
    </TimeShift>
  );
};

// the street: slot, lit wall, ribbon, lamps
const RIBBON = {y0: 990, y1: 1124, w0: 3, w1: 26};
const ribbonW = (y: number) => RIBBON.w0 + ((RIBBON.w1 - RIBBON.w0) * (y - RIBBON.y0)) / (RIBBON.y1 - RIBBON.y0);
const STREET = (() => {
  // the dark slot between the rows (no floor near us), from under the near roofs up to where the floor shows
  const slot: Pt[] = [];
  for (let y = 1270; y >= RIBBON.y1 - 4; y -= 10) slot.push([canyonAt(y)[0], y]);
  for (let y = RIBBON.y1 - 4; y <= 1270; y += 10) slot.push([canyonAt(y)[1], y]);
  // its right wall, lit by the street (a light face with storeys of window ticks, smaller up the street)
  const wallL = (y: number) => {
    const [l, rr] = canyonAt(y);
    return l + (rr - l) * 0.52;
  };
  const wall: Pt[] = [];
  for (let y = 1270; y >= RIBBON.y1; y -= 10) wall.push([wallL(y), y]);
  for (let y = RIBBON.y1; y <= 1270; y += 10) wall.push([canyonAt(y)[1], y]);
  let ticks = '';
  for (let y = 1262; y > RIBBON.y1 + 6; ) {
    const k = (y - RIBBON.y1) / (1270 - RIBBON.y1);
    const th = 3 + 3 * k;
    const tw = 2.2 + 2.6 * k;
    const x0 = wallL(y) + 2;
    const x1 = canyonAt(y)[1] - 2;
    for (let x = x0; x + tw < x1; x += tw * 2.1) ticks += rectD(x, y - th, tw, th);
    y -= th * 2.4;
  }
  // the ribbon: the lit floor from y 1124 (26 px) to 990 (3 px), with dark curb edges
  const rib: Pt[] = [];
  const kerbs: string[] = [];
  for (let y = RIBBON.y1; y >= RIBBON.y0; y -= 6) rib.push([VP[0] - ribbonW(y) / 2, y]);
  for (let y = RIBBON.y0; y <= RIBBON.y1; y += 6) rib.push([VP[0] + ribbonW(y) / 2, y]);
  kerbs.push(`M${f1(VP[0] - RIBBON.w1 / 2 - 1)} ${RIBBON.y1}L${f1(VP[0] - RIBBON.w0 / 2 - 0.5)} ${RIBBON.y0}M${f1(VP[0] + RIBBON.w1 / 2 + 1)} ${RIBBON.y1}L${f1(VP[0] + RIBBON.w0 / 2 + 0.5)} ${RIBBON.y0}`);
  // shopfront glows along both sides (warm dots, smaller up the street)
  const r = rng('s9/fronts');
  let fronts = '';
  for (let y = RIBBON.y1 - 4; y > RIBBON.y0 + 8; y -= r.range(5, 9)) {
    const s = 1.2 + 2.6 * ((y - RIBBON.y0) / (RIBBON.y1 - RIBBON.y0));
    if (r.chance(0.7)) fronts += rectD(VP[0] - ribbonW(y) / 2 - s - 1.5, y - s, s, s * 1.3);
    if (r.chance(0.7)) fronts += rectD(VP[0] + ribbonW(y) / 2 + 1.5, y - s, s, s * 1.3);
  }
  return {slot: polyD(slot), wall: polyD(wall), ticks, rib: polyD(rib), kerbs: kerbs.join(''), fronts};
})();
const LAMPS: {y: number; side: -1 | 1}[] = [
  {y: 1114, side: -1},
  {y: 1088, side: 1},
  {y: 1062, side: -1},
  {y: 1040, side: 1},
  {y: 1018, side: -1},
];

const StreetLamps: React.FC = () => (
  <>
    {LAMPS.map((L, i) => {
      const k = (L.y - RIBBON.y0) / (RIBBON.y1 - RIBBON.y0);
      const halo = 5 + 7 * k; // radius: diameter 24 -> 10
      const x = VP[0] + L.side * (ribbonW(L.y) / 2 + 1.5 + k * 2);
      const postH = 10 + 12 * k;
      const hx = x - L.side * (2 + 3 * k);
      const hy = L.y - postH;
      return (
        <React.Fragment key={i}>
          <ellipse cx={x - L.side * 3 * k} cy={L.y + 1} rx={4 + 6 * k} ry={1.4 + 2 * k} fill={EMBER.houseLit} />
          <circle cx={hx} cy={hy} r={halo} fill={EMBER.houseLit} />
          <circle cx={hx} cy={hy} r={halo * 0.45} fill={EMBER.core} />
          <path d={`M${f1(x)} ${f1(L.y)}V${f1(hy)}L${f1(hx)} ${f1(hy)}`} fill="none" stroke={EMBER.anchor} strokeWidth={1 + k * 0.8} />
        </React.Fragment>
      );
    })}
  </>
);

// tiny posed walkers on the lit floor (8-14 px; about half standing), and one car heading for the gate
type W9 = {y: number; dx: number; kind: 'walker' | 'dog' | 'sledge' | 'umbrella' | 'pair'; v: number; dir: 1 | -1};
const WALKERS: W9[] = [
  {y: 1118, dx: -5, kind: 'walker', v: 5, dir: -1},
  {y: 1108, dx: 7, kind: 'pair', v: 0, dir: 1},
  {y: 1094, dx: -6, kind: 'dog', v: 0, dir: 1},
  {y: 1082, dx: 4, kind: 'sledge', v: 4, dir: -1},
  {y: 1070, dx: -4, kind: 'walker', v: 0, dir: 1},
  {y: 1056, dx: 3, kind: 'walker', v: -3.5, dir: 1},
  {y: 1044, dx: -3, kind: 'umbrella', v: 0, dir: 1},
  {y: 1030, dx: 2, kind: 'walker', v: 3, dir: -1},
  {y: 1016, dx: -1.5, kind: 'walker', v: 0, dir: 1},
];
const StreetLife: React.FC = () => {
  const t = useTime();
  const r = rng('s9/walkers');
  return (
    <>
      {WALKERS.map((w, i) => {
        const coat = r.pick(WINTER.coats);
        const hair = r.pick([EMBER.anchor, EMBER.beam, EMBER.dcSide, '#C98A64']);
        // moving ones walk along the street (up = away); standing ones hold one pose
        const y = w.y - w.v * t;
        const k = (y - RIBBON.y0) / (RIBBON.y1 - RIBBON.y0);
        const h = 8 + 6 * k;
        const x = VP[0] + w.dx * (ribbonW(y) / RIBBON.w1) * 1.6;
        return <Tiny key={i} x={x} y={y} h={h} t={w.v ? t + i : i * 0.37} coat={coat} hair={hair} kind={w.kind} dir={w.dir} />;
      })}
    </>
  );
};
/** One car creeping up the street toward the gate (6 px/s), its two lights on the road ahead. */
const StreetCar: React.FC = () => {
  const t = useTime();
  const y = 1112 - 6 * t;
  const k = (y - RIBBON.y0) / (RIBBON.y1 - RIBBON.y0);
  const w = 6 + 6 * k;
  const x = VP[0] + 3 * k;
  return (
    <>
      {/* the beams on the snow ahead (flat, warm-white) */}
      <path d={polyD([[x - w * 0.35, y - w * 0.5], [x + w * 0.35, y - w * 0.5], [x + w * 0.2, y - w * 1.9], [x - w * 0.2, y - w * 1.9]])} fill={EMBER.core} />
      <path d={rectD(x - w / 2, y - w * 0.55, w, w * 0.9)} fill={EMBER.dcDark} />
      <path d={rectD(x - w * 0.4, y - w * 0.5, w * 0.8, w * 0.36)} fill={T9.nmLight} />
      <path d={rectD(x - w / 2, y + w * 0.25, w * 0.22, w * 0.16) + rectD(x + w * 0.28, y + w * 0.25, w * 0.22, w * 0.16)} fill={EMBER.houseLit} />
    </>
  );
};

/** The near-mid band with the drop (all in the MID plane). */
export const NearMid: React.FC = () => (
  <>
    {/* the ground between the rows: snow in the blue-hour shade */}
    <path d={rectD(-400, 1150, 1900, 700)} fill={EMBER.dc} />
    {/* the floor far down the street: the lit ribbon (over the far rows: it is the gap between them) */}
    <path d={STREET.rib} fill={EMBER.road} />
    <path d={STREET.kerbs} fill="none" stroke={EMBER.dcSide} strokeWidth={1.4} />
    <path d={STREET.fronts} fill={T9.nmWin} />
    <StreetLamps />
    <StreetCar />
    <StreetLife />
    {/* the slot near us: no floor, its right wall lit */}
    <path d={STREET.slot} fill={EMBER.dcDark} />
    <path d={STREET.wall} fill={T9.litWall} />
    <path d={STREET.ticks} fill={EMBER.dc} />
    <NearMidHouses />
    {NEAR_MID.filter((h) => h.smoke).map((h, i) => {
      const [sx, sy] = chimneyTop(h);
      return <Smoke key={i} x={sx} y={sy} seed={`s9/nms${i}`} rise={h.w * 0.9} drift={h.w * 0.6} r0={2} r1={Math.max(4, h.w * 0.11)} />;
    })}
    {/* string lights across the street (bulbs 5-8 px) */}
    <StringLights3 from={[410, 1146]} to={[530, 1152]} sag={9} n={6} r={2.6} halo={false} sway={0.8} every={0.5} seed="s9/sl1" ink={1.1} />
    <StringLights3 from={[404, 1197]} to={[540, 1204]} sag={10} n={7} r={3} halo={false} sway={0.8} every={0.5} seed="s9/sl2" ink={1.2} />
  </>
);
