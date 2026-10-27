// S9_town (S9 lane, G5b): the town between the far field and our roof, for the scale end frame
// (docs/v3/s9_scale_plan.md section 1): the MID BAND (plane S9_FAR2: 3-4 rows of 22-34 px roofs with snow tops, the
// roofline climbing toward the mountain, hairline ink) and the NEAR-MID BAND (plane S9_MID: 2-3 rows of 50-80 px houses
// in five types, chimneys smoking) cut by THE DROP: the street as a canyon from below our parapet to the hall (vanishing
// point (470, 980)): the floor narrowing ~54 -> 3 px between the house rows (the near slot with its lit wall is the
// near plane's: S9_near.tsx), string lights across it with five lamps, posed walkers (about half standing; a sledge, a dog) and one car's
// lights heading for the data center's gate. End-frame coordinates (screen at rest).
// G5b review 3 (the lit street grew out of your head like a mast): the street is a WEDGE now, 85 px at its near end
// (y ~1246, where the near plane's gap house hides it, 60 px above your head) tapering to 3 px at the gate, with kerbs,
// a lit wall on the right and a shade wall on the left, lamps along BOTH kerbs, and one roof row (y ~1168) laid over it.
//
// The town mass holds still in the hold (s9_scale_plan section 2: nothing moves inside it but the listed tiers): the
// houses' windows are drawn at one fixed time; smoke, walkers, the car and the bulbs carry its life.
import React, {useId} from 'react';
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
/** The canyon's curbs at height y (left, right): 132 px wide at our parapet (x 404-536), ~90 where the street shows
 *  (y 1246), running to the VP. */
export const canyonAt = (y: number): [number, number] => {
  const u = (PARAPET_Y - y) / (PARAPET_Y - VP[1]);
  return [404 + (VP[0] - 404) * u, 536 + (VP[0] - 536) * u];
};

// ---------------------------------------------------------------- the mid band (plane S9_FAR2)
const climb = (x: number) => -40 * smooth01((x - 560) / 440);
const MB_ROWS: RoofRowSpec[] = [0, 1, 2, 3].map((i) => {
  const haze = ((3 - i) / 3) * 0.18;
  return {
    y: 1056 + i * 16.8,
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

// the street: the floor all the way from under the near roofs to the hall's gate (a road receding, never a dark spire)
const RIBBON = {y0: 990, y1: 1124, w0: 3, w1: 26};
/** Up the street from here (past the roof rows) it takes the mid band's haze: the bright wedge is only the near reach
 *  (y 1110-1246, 36-85 px wide), and the far reach is a mid-tone road glimpsed between roofs (never a pale spire). */
const FAR_Y = 1110;
const FAR_MIX = 0.42;
const FLOOR_Y1 = 1262;
/** The floor's width at y (the canyon's, a little inside it): 26 px at 1124, ~54 at 1262, ~2 at 990. */
const ribbonW = (y: number) => (0.94 * (canyonAt(y)[1] - canyonAt(y)[0]));
const STREET = (() => {
  const rib: Pt[] = [];
  for (let y = FLOOR_Y1; y >= RIBBON.y0; y -= 6) rib.push([VP[0] - ribbonW(y) / 2, y]);
  for (let y = RIBBON.y0; y <= FLOOR_Y1; y += 6) rib.push([VP[0] + ribbonW(y) / 2, y]);
  const kerbs = `M${f1(VP[0] - ribbonW(FLOOR_Y1) / 2 - 1)} ${FLOOR_Y1}L${f1(VP[0] - 1)} ${RIBBON.y0}M${f1(VP[0] + ribbonW(FLOOR_Y1) / 2 + 1)} ${FLOOR_Y1}L${f1(VP[0] + 1)} ${RIBBON.y0}`;
  // the pavements (a snow strip inside each kerb) and the house walls outside them: the right wall lit by the lamps,
  // the left in shade (wedges that taper with the street, so it reads as a road going away, never a strip)
  const wedge = (side: -1 | 1, a: number, b: number) => {
    const pts: Pt[] = [];
    for (let y = FLOOR_Y1; y >= RIBBON.y0; y -= 8) pts.push([VP[0] + side * (ribbonW(y) / 2) * a, y]);
    for (let y = RIBBON.y0; y <= FLOOR_Y1; y += 8) pts.push([VP[0] + side * (ribbonW(y) / 2) * b, y]);
    return polyD(pts);
  };
  const paveL = wedge(-1, 0.8, 1);
  const paveR = wedge(1, 0.8, 1);
  const wallR = wedge(1, 1.03, 1.3);
  const wallL = wedge(-1, 1.03, 1.3);
  // two tyre tracks one step darker, converging with the kerbs
  const tracks = `M${f1(VP[0] - ribbonW(FLOOR_Y1) * 0.16)} ${FLOOR_Y1}L${VP[0]} ${RIBBON.y0 + 6}M${f1(VP[0] + ribbonW(FLOOR_Y1) * 0.16)} ${FLOOR_Y1}L${VP[0]} ${RIBBON.y0 + 6}`;
  // shopfront glows along both sides (warm, smaller up the street)
  const r = rng('s9/fronts');
  let fronts = '';
  for (let y = FLOOR_Y1 - 4; y > RIBBON.y0 + 8; y -= r.range(5, 9) * (0.6 + (y - RIBBON.y0) / 200)) {
    const s = 1.2 + 2.6 * Math.min(1.8, (y - RIBBON.y0) / (RIBBON.y1 - RIBBON.y0));
    if (r.chance(0.65) && y >= FAR_Y) fronts += rectD(VP[0] - ribbonW(y) / 2 - s - 1.5, y - s, s, s * 1.3); // the shade side dark up the street
    if (r.chance(0.65)) fronts += rectD(VP[0] + ribbonW(y) / 2 + 1.5, y - s, s, s * 1.3);
  }
  return {rib: polyD(rib), kerbs, tracks, fronts, paveL, paveR, wallL, wallR};
})();
/** Lamps along BOTH kerbs (two converging lines, never one centre line of dots); none behind the roof row (1120-1170)
 *  and none past y 1030 (a tapering double column of gold dots read as a lit tree at phone size). */
const LAMPS: {y: number; side: -1 | 1}[] = [1226, 1194, 1108, 1080, 1056, 1036].flatMap((y, i) => [
  // up the street (past the roof row) only the lit right kerb keeps its lamps: two converging columns of dots there
  // drew a lit Christmas tree at phone size
  ...(y < FAR_Y ? [] : [{y, side: -1 as const}]),
  {y: y - 4 - (i % 2) * 3, side: 1 as const},
]);

const StreetLamps: React.FC = () => (
  <>
    {LAMPS.map((L, i) => {
      const k = (L.y - RIBBON.y0) / (RIBBON.y1 - RIBBON.y0);
      // radius: diameter 14 near; up the street (past the roof row) small, 6 -> 4 (wider read as a column of gold blobs)
      const halo = L.y < FAR_Y ? 1.3 + 2.4 * k : 2.6 + 3.6 * Math.min(1.25, k);
      const x = VP[0] + L.side * (ribbonW(L.y) / 2 + 1.5 + k * 2);
      const postH = 7 + 10 * Math.min(1.6, k);
      const hx = x - L.side * (2 + 3 * k);
      const hy = L.y - postH;
      return (
        <React.Fragment key={i}>
          <ellipse cx={VP[0] + L.side * ribbonW(L.y) * 0.3} cy={L.y + 1} rx={ribbonW(L.y) * 0.2} ry={1.2 + 1.6 * k} fill={T9.pool} />
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
  {y: 1228, dx: 8, kind: 'dog', v: 0, dir: -1},
  {y: 1196, dx: -7, kind: 'walker', v: 6, dir: -1},
  {y: 1186, dx: 9, kind: 'pair', v: 0, dir: 1},
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
        const h = 8 + 6 * Math.min(1.6, k);
        const x = VP[0] + w.dx * (ribbonW(y) / RIBBON.w1) * 0.9;
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

/** One roof row laid over the street at y ~1168 (the street runs on behind it: a road, never a mast): two houses
 *  standing on the kerbs, their roofs meeting over ~70 % of the street's width. Farther up, three small roofs of the
 *  mid band's size stand in front of it, alternating sides (G5b fix: at phone size the unbroken pale wedge with its two
 *  lines of lamps still read as a lit tower; glimpsed between roofs it reads as a street running away into the town). */
const OVER_ROW: (NM & {color?: string})[] = [
  {x: 424, y: 1170, w: 34, h: 18, kind: 'cottage', seed: 's9/ov0', smoke: false, lit: 0.9},
  {x: 466, y: 1168, w: 40, h: 22, kind: 'terrace', seed: 's9/ov1', smoke: true, lit: 0.9},
  {x: 459, y: 1106, w: 30, h: 12, kind: 'cottage', seed: 's9/ov2', smoke: false, lit: 0.7, color: T9.nmDark},
  {x: 452, y: 1064, w: 23, h: 9, kind: 'cottage', seed: 's9/ov3', smoke: false, lit: 0.6, color: planeTone(T9.midDark, 0.06)},
  {x: 467, y: 1038, w: 18, h: 7, kind: 'cottage', seed: 's9/ov4', smoke: false, lit: 0.5, color: planeTone(T9.midDark, 0.12)},
];
const OverRow: React.FC = () => {
  const t = useTime();
  return (
    <>
      <TimeShift by={t - 1.7}>
        {OVER_ROW.map((h, i) => (
          <TownHouse key={i} x={h.x} y={h.y} w={h.w} h={h.h} kind={h.kind} color={h.color ?? T9.nmDark} litFrac={h.lit} smoke={false} seed={h.seed} />
        ))}
      </TimeShift>
      {OVER_ROW.filter((h) => h.smoke).map((h, i) => {
        const [sx, sy] = chimneyTop(h);
        return <Smoke key={i} x={sx} y={sy} seed={`s9/ovs${i}`} rise={30} drift={22} r0={1.6} r1={4.4} n={6} />;
      })}
    </>
  );
};

const StreetFloorTones: React.FC<{mix: number}> = ({mix}) => (
  <>
    <path d={STREET.wallL} fill={planeTone(EMBER.dcSide, mix)} />
    <path d={STREET.wallR} fill={planeTone(T9.litWall, mix)} />
    <path d={STREET.rib} fill={planeTone(T9.road, mix * 0.6)} />
    <path d={STREET.paveL} fill={planeTone(T9.paveShade, mix * 0.6)} />
    <path d={STREET.paveR} fill={planeTone(T9.nmLight, mix)} />
    <path d={STREET.tracks} fill="none" stroke={EMBER.skyLow} strokeWidth={1.6} />
    <path d={STREET.kerbs} fill="none" stroke={planeTone(EMBER.dcSide, mix)} strokeWidth={1.4} />
    <path d={STREET.fronts} fill={T9.nmWin} />
  </>
);
const StreetFloor: React.FC = () => {
  const id = 's9st' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <defs>
        <clipPath id={`${id}n`} clipPathUnits="userSpaceOnUse">
          <rect x={300} y={FAR_Y} width={340} height={300} />
        </clipPath>
        <clipPath id={`${id}f`} clipPathUnits="userSpaceOnUse">
          <rect x={300} y={900} width={340} height={FAR_Y - 900} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}n)`}>
        <StreetFloorTones mix={0} />
      </g>
      <g clipPath={`url(#${id}f)`}>
        <StreetFloorTones mix={FAR_MIX} />
      </g>
    </>
  );
};

/** The near-mid band with the drop (all in the MID plane). */
export const NearMid: React.FC = () => (
  <>
    {/* the ground between the rows: snow in the blue-hour shade */}
    <path d={rectD(-400, 1150, 1900, 700)} fill={EMBER.dc} />
    {/* the street's floor down to the hall's gate (over the far rows: it is the gap between them): the near reach in
        its own tones, the far reach hazed toward the horizon */}
    <StreetFloor />
    <StreetLamps />
    <StreetCar />
    <StreetLife />
    <NearMidHouses />
    <OverRow />
    {NEAR_MID.filter((h) => h.smoke).map((h, i) => {
      const [sx, sy] = chimneyTop(h);
      return <Smoke key={i} x={sx} y={sy} seed={`s9/nms${i}`} rise={h.w * 0.9} drift={h.w * 0.6} r0={2} r1={Math.max(4, h.w * 0.11)} />;
    })}
    {/* string lights across the near reach of the street (bulbs 5-8 px; none up the street: a garland there read as a tree) */}
    <StringLights3 from={[404, 1197]} to={[540, 1204]} sag={10} n={7} r={3} halo={false} sway={0.8} every={0.5} seed="s9/sl2" ink={1.2} />
  </>
);
