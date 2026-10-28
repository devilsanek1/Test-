// scenes/outside.tsx: THE OUTSIDE at H2 (the WINDOW lane owns it; docs/v3/flow_v2.md §3): one geography seen from our
// window, standing at the glass. SQD draws it through its own camera (the pull-back lands on it), SQE and SQF through
// h2_window's cameras; every builder draws it read-only, on FILM time (each plane reads useFilmT(), film seconds even
// inside another FilmClock, and gives its kit pieces film time), so the frames match bit for bit across J4 and J5.
//
// H2 at rest (canvas px): flat sky behind the caption band (white captions); horizon y 930: THE DATA CENTER (S9's hall,
// dark) w 330 at x 230-560, THE MOUNTAIN (the REVEAL lane's pile: summit (800, 640), the summit stick a kit MemoryStick,
// 30 px, for SQD's x23.3 start) behind its right side and past the right edge; the town 930-1040 with the road from our street
// (x ~300) up to the data center; OUR STREET 1040-1250: the chip factory's wall x 330-950 (y 1000-1090) with its lit
// gate x 480-640, the booth on its left, the floodlight's pool (560, 1200) rx 230 ry 55, the notice x 680-880 (y
// 1010-1150), the waiting lane x 720-940 (y 1140-1240), the road-mouth lamp (232) with its own small pool; the sill is
// h2_window's. Planes (each a camera plane of its own: entryCam / pushCam scale them differently): OutsideFar (sky,
// clouds, mountain, data center), OutsideTown (the town, the road up, the factory behind its wall), OutsideStreet (the
// street and everything on it). H2View hands the planes their cameras (PlaneCams): the street keeps the snow under the
// caption band in SCREEN px and drives the trucks up the town plane's road while the planes are scaled apart.
//
// THE FAR FIELD SITS BACK (early review E3; CRAFT §b tier C, §f one flat step per plane toward the air): off its two
// beats the data center is tier C: one haze step toward the sky's lowest colour (kit Haze, k 0.35: its body L* 18 -> 33),
// its server rows the clean pen's three long soft bands (no dash rows, no blink), its sign panel and letters within a
// calm step of the facade, no outline; hall B one more step back (k 0.5), the roof fans without their spinning ticks.
// Its beats (HALL_A): 19.40-21.60 (the reveal's "AI data centers.", the sign lit, its one outline) and 36.98-38.70 (SQF:
// the sign LIGHTS on "AI", drawn on top of the hall: the payoff's one event on the horizon); every switch is a 2-step
// change. The town's houses are calm too: walls half way into the far snow, caps one pale step, every raw fill through
// the tier's paint (useTierPaint); the factory's steam a light step of the pile's own gold (E14: pale puffs read as holes
// in the mountain).
//
// The street's timeline (film seconds; flow_v2 §4 SQE / SQF; the push x1.35 is held 25.70-36.36, so the queue is laid
// out inside the pushed frame: right of the phone and Pip, left of the platform's right rail): the two DC trucks A and
// B stand in the pool from the start; THE STREET IS CALM until the load beat (E5): the gate's pool and its lit opening one
// value calmer, the trucks one haze step back, the notice blank, so SQD's "By the mountain" and J4's entry keep the eye;
// 23.10 the gate comes up with the load (one event: the pool warms, truck A takes its outline, the workers start);
// 23.10-24.20 two workers carry crates into A; 24.20 the barrier lifts, A drives up the road (24.30-25.45, shrinking
// into the data center's gate) as B rolls up to the gate (24.30-25.20); OUR VAN waits unlit at the head of the lane,
// rolls into the pool 25.72-26.20 (lit at last), ONE small crate lands on its roof on "left" 26.04; the van behind
// waits; 27.08 the notice's 5x face swings on (full for 1.5 s, then one value down, its small lines
// hidden: E9); 28.62-29.12 the van behind shuffles up to the lane's head (the pause after "price."); 29.20-29.85 our van pulls up at the near kerb (x 565: clear of Pip); 29.85-30.29 its crate hops over the
// sill into the listing laptop, growing to ~120 px as it comes toward the glass and shrinking into the screen (E4: the
// carry reads), the tag ticks to $1,099 on "pass" (30.28); 30.40 our van leaves left as the van behind moves up into the
// pool (30.55-31.15); 31.40-32.84 the BETTER van joins the queue at the lane's head; 33.50-34.65 B leaves up the road;
// 34.60 the notice flips to 2027 (full until 35.85, then one value down); 35.22-36.25 two DC trucks overtake along the
// near kerb (BETTER nudged back 35.62): C takes the gate, D stops in front of the pool; 36.98 the notice goes blank as
// the data center's sign lights and its rows go dark, then light one at a time on "an AI data center" (37.00-37.80, the
// hook's 4.04 beat rhymed; the trucks sit back in the same frame), then the street holds, alive and calm (the workers
// load C from 38.75, a small far car crosses slowly from 37.3: nothing near the gate walks while the sign lights). Tiers follow the beat (flow_v2 §5): the
// beat's subject gets the one outline and the motion.
// Light (CRAFT §d; the street rig: the open sky the key): the gate's floodlight pool is THE light (two warm steps: L* 87
// C* 13 / L* 91 C* 16, lighter AND warmer than the road: E11), the gate's lit yard spills onto the pavement down to it,
// the road-mouth lamp lights its own small pool, contact shadows under everything that stands.
import React, {createContext, useContext, useId} from 'react';
import {TimeProvider, clamp, ease, prog, useTime} from '../../../lib/time';
import {mat, XG, type Mat} from '../../../lib/xf';
import {rng} from '../../../lib/rng';
import {Tier, useTierPaint} from '../../../lib/tier';
import {useFilmTime} from '../../../lib/sequence';
import {EMBER, BirdV, DataCenter, SnowLayers, windowLit, puffs, Txt, type Pt} from '../kit';
import {ContactShadow, LightPool, Lit, RIGS, ShadowLayer, WindowSpill, fromLch, lch, mixHex, useLightOff, withKey, streetLamp} from '../kit/Light';
import {nearStep} from '../../../lib/depth';
import {CrateBox, CrateFlight, ellD, FleetVan, fleetVanGeo, NoticeFlip, rrect, roundPoly, type FleetVariant} from '../kit/Fleet';
import {Haze, stepAt, twoStepIn} from '../kit/Haze';
import {CornerCloud, HighClouds, CloudBank, FarGround, InfinityLine, HallPlume, HALL, HALL_GEO, HALL_ROOF, HALLB, HORIZON as S9_HORIZON, roofRows, RoofRowsView, type RoofRowSpec} from './S9_far';
import {T9} from './S9_tones';
import {RevealPeak, J3Stick, J3StickLight, PEAK_TONES, SUMMIT_STICK} from './SQD_peak';
import {RevealBirds} from './SQD_life';

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

// ---------------------------------------------------------------- the layout (H2 canvas px at rest)

export const H2_HORIZON = 930;
/** THE data center (S9's hall re-laid: dark, sign lit): base centre and width. */
export const H2_DC = {x: 395, y: 930, w: 330};
/** THE summit stick (the one that left your laptop; SQD's start: its planeMat o): centre, width (30 px: SQD_peak's
 *  SUMMIT_W, so J3's 700 px stick lands at K0 = x23.3), rotation. The REVEAL lane's object, never a copy. */
export const H2_SUMMIT = SUMMIT_STICK;
/** Our street: the far pavement's top, the near kerb (the sill's top is h2_window's 1250). */
export const H2_STREET = {top: 1040, pave: 1092, near: 1250};
/** The chip factory's wall, its lit gate, the booth, the floodlight and its pool, the notice, the waiting lane. */
export const H2_WALL = {x0: 330, x1: 950, y0: 1000, y1: 1090};
export const H2_GATE = {x0: 480, x1: 640, y0: 1018, y1: 1090};
export const H2_BOOTH = {x0: 404, x1: 462, y0: 1022, y1: 1092};
export const H2_FLOOD = {x: 560, y: 1006};
export const H2_POOL = {cx: 560, cy: 1200, rx: 230, ry: 55};
export const H2_NOTICE = {x: 680, y: 1010, w: 200, h: 140, ground: 1104};
export const H2_LANE = {x0: 720, x1: 940, y0: 1140, y1: 1240};
/** Where the van's crate lands in the thread plane's listing laptop (screen px at H2 rest; LEFT spot): the default
 *  only, SQE passes the plane's own listing screen at film time. */
export const H2_CRATE_TO: Pt = [171, 1236];
/** The road-mouth lamp (a practical: lantern, post foot on the far pavement) and its small pool (E11). */
export const H2_ROAD_LAMP = streetLamp([232, 962], [232, 1094]);

/** Film-time beats of the street (flow_v2 §4). */
export const H2_BEATS = {
  /** The street's calm ends (E5): the gate comes up with the load beat. */
  calmEnd: 23.1,
  load: 23.1,
  barrier: 24.2,
  aGo: 24.3,
  vanIn: 25.72,
  vanInEnd: 26.2,
  crate: 26.04,
  fiveX: 27.08,
  /** The 5x face steps one value down (E9: ~1.5 s at full contrast from its swing). */
  fiveXCalm: 28.58,
  vanGo: 29.2,
  vanKerb: 29.85,
  hop: 29.85,
  hopEnd: 30.29,
  ding: 30.28,
  vanLeave: 30.4,
  /** The van behind ours shuffles up to the lane's head in the pause after "price." (never during the crate's or the
   *  5x face's beat), then moves up into the pool (the lane's head frees for the BETTER van). */
  van2Up: 28.62,
  van2In: 30.55,
  van2InEnd: 31.15,
  better: 31.4,
  betterEnd: 32.84,
  bGo: 33.5,
  flip: 34.6,
  /** The 2027 face steps one value down (before J5's 0.4 s: nothing changes in 35.96-36.76). */
  flipCalm: 35.85,
  trucks: 35.22,
  trucksEnd: 36.25,
  nudge: 35.62,
  /** The data center's sign lights (SQF, on "AI"); the notice goes blank in the same frame (one event). */
  sign: 36.98,
};
/** THE STREET SITS BACK WHILE THE FAR FIELD LEADS (early review E5, the street half; flow_v2 §4 SQD): through the reveal
 *  ("And so do AI data centers. By the mountain.") the WHOLE street plane is one calm tier step (CRAFT §b, tier C: low
 *  contrast, slow life): every colour on it (the ground, the corner house, the factory's wall and lit gate, the booth,
 *  the blank notice, the vans and the trucks, the workers, our pavement with its bench and bollards, the falling snow)
 *  keeps `contrast` of its value contrast against the street's own ambient snow and `chroma` of its chroma, hue kept
 *  (CalmPlane: one colour matrix, never blur, a fade or grey: a warm piece stays warm, the snow stays the snow), so the
 *  street is calm but present, never emptied; the pool, the gate and the trucks keep their own calm step on top until the
 *  load beat. (At 21.9 the street held 88 % of the frame's top-3 % salience and the mountain 10 %.) It steps back up
 *  GRADUALLY across J4, `t0` -> `t1` (smoothstep, under the entry's pull back through our glass, 22.35-22.95): the REVEAL
 *  lane's whole-street switch read as a cut. SQE's street is whole from 23.05, so the load beat (23.10) stays one event. */
export const STREET_CALM = {t0: 22.25, t1: 23.05, contrast: 0.6, chroma: 0.9};
/** The street plane's calm at film time T: 1 through the reveal, smoothly to 0 across J4 (see STREET_CALM). */
export function streetCalm(T: number): number {
  if (T <= STREET_CALM.t0) return 1;
  if (T >= STREET_CALM.t1) return 0;
  const u = (T - STREET_CALM.t0) / (STREET_CALM.t1 - STREET_CALM.t0);
  return 1 - u * u * (3 - 2 * u);
}
const rgb01 = (hex: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
/** A plane one calm tier step toward its ground (STREET_CALM): out = M in + (I - M) ground, M = q I + (c - q) 1 wT (w the
 *  Rec. 709 luma weights; c = the value contrast kept, q = the chroma kept, both 1 at s 0): every colour's luma
 *  difference from the ground x c, its chroma x q, its hue kept, the ground itself exactly unchanged. One feColorMatrix
 *  in sRGB, on flat fills: no blur, no gradient, no fade. s <= 0.001 draws the children bare. */
const CalmPlane: React.FC<{s: number; ground: string; children?: React.ReactNode}> = ({s, ground, children}) => {
  const id = 'calm' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (!(s > 0.001)) return <>{children}</>;
  const c = 1 - (1 - STREET_CALM.contrast) * Math.min(1, s);
  const q = 1 - (1 - STREET_CALM.chroma) * Math.min(1, s);
  const w = [0.2126, 0.7152, 0.0722];
  const P = rgb01(ground);
  const Y = w[0] * P[0] + w[1] * P[1] + w[2] * P[2];
  const rows = [0, 1, 2].map((i) => [...[0, 1, 2].map((j) => (i === j ? q : 0) + (c - q) * w[j]), 0, (1 - c) * Y]);
  const v = [...rows, [0, 0, 0, 1, 0]].map((r) => r.map((x) => x.toFixed(5)).join(' ')).join(' ');
  return (
    <>
      <defs>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={v} />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </>
  );
};

/** The data center's beats (E3): A (the subject) inside, C (calm, hazed) outside; each switch a 2-step change. */
export const HALL_A: [number, number][] = [
  [-99, 21.6],
  [36.98, 38.7],
];
/** The far field's haze (CRAFT §f: one flat step per plane toward the air, the sky's lowest colour). */
export const FAR_AIR = EMBER.skyLow;
/** THE OUTSIDE'S SNOW (CRAFT §d.2, a night exterior: sky-facing snow caps L* 87-89, thin, never above the pool core; the
 *  open ground snow at 83, the rig's groundAmbient): the street rig's own sky-facing cap #D9DFF2 (L* 88.9), never the
 *  palette's lit EMBER.snow (L* 93, the snow's lit surface colour that the rig's ambient brings to 83), so the brightest
 *  thing outside is a light (the gate's pool, the lit panes, the data center's sign on its beats), never the snow. Every
 *  cap, lid, bank and flake of the outside takes it (h2_window's outer sill and kit Fleet's roofs too); SQA's H1 window
 *  keeps its own (home_set: the approved pilot). */
export const H2_SNOW = RIGS.street.snowCap;
/** The data center's calm haze step off its beats (kit Haze k; home_set's H1 window takes the same: one building). */
export const HALL_K = 0.35;
const HALLB_K = 0.5;

// ---------------------------------------------------------------- film clock

const FilmTCtx = createContext<number | null>(null);
/** Film seconds here: useFilmTime(), or the film time a FilmClock above already set (inside one, useFilmTime() would
 *  read its own time base as a shift: nested shared pieces must call THIS). */
export function useFilmT(): number {
  const c = useContext(FilmTCtx);
  const f = useFilmTime();
  return c ?? f;
}

/** Gives everything inside FILM seconds as useTime() (kit pieces' own idle clocks: blinking lights, steam, snow); it
 *  nests (useFilmT keeps the film's seconds). */
export const FilmClock: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const T = useFilmT();
  return (
    <FilmTCtx.Provider value={T}>
      <TimeProvider offset={0} global={T}>
        {children}
      </TimeProvider>
    </FilmTCtx.Provider>
  );
};

// ---------------------------------------------------------------- the planes' cameras (from H2View)

/** The cameras the planes are drawn through right now (h2_window's h2Cams; absent = identity: SQD's own pull-back). */
export type PlaneCams = {far: Mat; town: Mat; street: Mat};
const PlaneCamsCtx = createContext<PlaneCams | null>(null);
export const PlaneCamsProvider = PlaneCamsCtx.Provider;
/** The street plane -> the town plane's road (inv(street) x town): the trucks climbing the road follow the road the
 *  town plane draws, whatever the push does to the two planes. */
function roadMapOf(c: PlaneCams | null): Mat {
  return c ? mat.mul(mat.inv(c.street), c.town) : mat.I;
}
const ap = (m: Mat, p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

// ---------------------------------------------------------------- tracks

type Key = {t: number; p: Pt; k?: number};

/** A Catmull-Rom path through key points, travelled by arc length; `u` 0..1 (already eased by the caller). */
function along(pts: Pt[], u: number): {p: Pt; i: number} {
  const N = 24;
  const sm: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < N; j++) {
      const s = j / N;
      const s2 = s * s;
      const s3 = s2 * s;
      const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s2 + (-a + 3 * b - 3 * c + d) * s3);
      sm.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  sm.push(pts[pts.length - 1]);
  const L: number[] = [0];
  for (let i = 1; i < sm.length; i++) L.push(L[i - 1] + Math.hypot(sm[i][0] - sm[i - 1][0], sm[i][1] - sm[i - 1][1]));
  const target = clamp(u) * L[L.length - 1];
  let i = 1;
  while (i < L.length - 1 && L[i] < target) i++;
  const a = L[i - 1];
  const b = L[i];
  const k = b > a ? (target - a) / (b - a) : 0;
  return {p: [sm[i - 1][0] + (sm[i][0] - sm[i - 1][0]) * k, sm[i - 1][1] + (sm[i][1] - sm[i - 1][1]) * k], i};
}

/** A drive: from `t0` to `t1` along `keys` (their k = scale), eased; before t0 at the first key, after t1 at the last. */
function drive(T: number, t0: number, t1: number, keys: Key[], e = ease.inOutSine): {p: Pt; k: number; u: number; moving: boolean} {
  const u = e(prog(T, t0, t1 - t0));
  const {p} = along(keys.map((q) => q.p), u);
  // the scale follows the path's progress between the keys' own k
  const ks = keys.map((q) => q.k ?? 1);
  const seg = u * (keys.length - 1);
  const j = Math.min(keys.length - 2, Math.floor(seg));
  const k = ks[j] + (ks[j + 1] - ks[j]) * (seg - j);
  return {p, k, u, moving: T > t0 && T < t1};
}

/** How far into the floodlight's pool a vehicle stands (0..1): the warm lift "lit at last". */
function poolLift(x: number, y: number, w: number): number {
  const dx = Math.max(0, Math.abs(x - H2_POOL.cx) - (H2_POOL.rx - w * 0.3));
  const dy = Math.abs(y - 8 - H2_POOL.cy) / (H2_POOL.ry * 1.6);
  return clamp(1 - dx / (w * 0.45)) * clamp(1.4 - dy);
}

// ---------------------------------------------------------------- the vehicles (film time)

const VAN_W = 140;
/** Ground lines: the pool (the gate's lane), the waiting lane, the near kerb. */
const Y_POOL = 1218;
const Y_LANE = 1236;
const Y_KERB = 1250;
/** Our van's stop at the near kerb (clear of Pip and the phone in the held push). */
const KERB_X = 565;
/** The lane's head (where the next van waits). */
const LANE_HEAD = 805;
/** The road's mouth on our street and its top at the data center's gate (keys from index 2 lie on the town plane's
 *  road: they follow it through roadMapOf). */
const ROAD_UP: Key[] = [
  {t: 0, p: [455, Y_POOL], k: 1},
  {t: 0, p: [398, 1124], k: 0.8},
  {t: 0, p: [316, 1056], k: 0.52},
  {t: 0, p: [352, 990], k: 0.32},
  {t: 0, p: [388, 936], k: 0},
];
const roadUp = (m: Mat): Key[] => {
  if (mat.isIdentity(m)) return ROAD_UP;
  const s = Math.hypot(m[0], m[1]);
  return ROAD_UP.map((q, i) => (i < 2 ? q : {t: 0, p: ap(m, q.p), k: (q.k ?? 1) * s}));
};

/** `calm` (DC trucks): 0 on the truck's own beat, 1 off it (tier B: one haze step toward the street's ambient snow, so a
 *  dark truck waiting in the bright pool never out-shouts the beat's subject), 0.5 the 3-frame half step. */
export type Vehicle = {id: string; variant: FleetVariant; x: number; y: number; k: number; dir: 1 | -1; line: boolean; roll: number; crate?: boolean; calm?: number};

/** Every vehicle on the street at film time T (back to front by ground y). `road` = the street -> town-road map. */
export function vehiclesAt(T: number, road: Mat = mat.I): Vehicle[] {
  const B = H2_BEATS;
  const out: Vehicle[] = [];
  const roll = (x: number, k = 1) => (-x / (VAN_W * 0.085 * k)) % (Math.PI * 2);
  const up = roadUp(road);
  // A: loads at the gate, leaves up the road on "first dibs" (at the gate's speed, gone into the data center's gate by
  // 24.95: the push only starts at 24.90, so the road and the street never part under it)
  if (T < B.aGo + 0.7) {
    const a = drive(T, B.aGo, B.aGo + 0.65, up, ease.inOutSine);
    if (a.k > 0.04) out.push({id: 'A', variant: 'dc', x: a.p[0], y: a.p[1], k: a.k, dir: -1, line: T >= B.load - 0.1 && T < B.vanIn - 0.4, roll: roll(a.p[0], a.k), calm: 1 - stepAt(T, B.calmEnd)});
  }
  // B: behind A in the pool, rolls up to the gate, loads, leaves while chip makers speak (33.50): left along the street
  // toward the road's mouth, out of view behind the phone (in the held push the town plane's road lies apart from the
  // street's wall: a truck climbing it would cross the wall's corner)
  if (T < B.bGo + 1.6) {
    const b1 = drive(T, B.aGo, B.aGo + 0.9, [{t: 0, p: [675, Y_POOL]}, {t: 0, p: [455, Y_POOL]}], ease.inOutCubic);
    const b2 = drive(T, B.bGo, B.bGo + 1.5, [{t: 0, p: [455, Y_POOL]}, {t: 0, p: [330, 1214]}, {t: 0, p: [-240, 1214]}], ease.inQuad);
    const q = T < B.bGo ? b1 : b2;
    if (q.k > 0.04) out.push({id: 'B', variant: 'dc', x: q.p[0], y: q.p[1], k: q.k, dir: -1, line: false, roll: roll(q.p[0], q.k), calm: 1});
  }
  // OUR VAN: waits unlit at the head of the lane; into the pool; the kerb; the hop; away left (slow while it is in
  // view, faster once the phone hides it)
  {
    let q: {p: Pt; k: number};
    if (T < B.vanGo) q = drive(T, B.vanIn, B.vanInEnd, [{t: 0, p: [LANE_HEAD, Y_LANE]}, {t: 0, p: [740, 1226]}, {t: 0, p: [680, Y_POOL]}], ease.inOutCubic);
    else if (T < B.vanLeave) q = drive(T, B.vanGo, B.vanKerb, [{t: 0, p: [680, Y_POOL]}, {t: 0, p: [618, 1242]}, {t: 0, p: [KERB_X, Y_KERB]}], ease.inOutCubic);
    else q = drive(T, B.vanLeave, B.vanLeave + 1.4, [{t: 0, p: [KERB_X, Y_KERB]}, {t: 0, p: [-170, Y_KERB]}], ease.inQuad);
    const on = (T >= B.vanIn - 0.1 && T < B.vanInEnd + 0.5) || (T >= B.vanGo - 0.1 && T < B.ding + 0.1);
    if (q.p[0] > -160) out.push({id: 'van', variant: 'van', x: q.p[0], y: q.p[1], k: 1, dir: -1, line: on, roll: roll(q.p[0]), crate: T >= B.crate && T < B.hop});
  }
  // the van behind ours: shuffles up to the head of the lane, then moves up into the pool when ours has gone
  {
    const q =
      T < B.van2In
        ? drive(T, B.van2Up, B.van2Up + 0.5, [{t: 0, p: [950, Y_LANE]}, {t: 0, p: [LANE_HEAD, Y_LANE]}], ease.inOutCubic)
        : drive(T, B.van2In, B.van2InEnd, [{t: 0, p: [LANE_HEAD, Y_LANE]}, {t: 0, p: [740, 1226]}, {t: 0, p: [680, Y_POOL]}], ease.inOutCubic);
    out.push({id: 'van2', variant: 'van', x: q.p[0], y: q.p[1], k: 1, dir: -1, line: false, roll: roll(q.p[0])});
  }
  // the BETTER van joins the queue at the lane's head; the trucks nudge it back
  if (T >= B.better - 0.05) {
    const q = drive(T, B.better, B.betterEnd, [{t: 0, p: [1190, Y_LANE]}, {t: 0, p: [LANE_HEAD, Y_LANE]}], ease.outCubic);
    const nudge = 26 * ease.outBack(1.6)(prog(T, B.nudge, 0.22));
    out.push({id: 'better', variant: 'better', x: q.p[0] + nudge, y: q.p[1], k: 1, dir: -1, line: T < B.betterEnd + 0.3 || (T >= B.trucks && T < B.trucksEnd), roll: roll(q.p[0] + nudge)});
  }
  // two DC trucks overtake the queue along the near kerb: C takes the gate, D stops in front of the pool
  if (T >= B.trucks - 0.05) {
    const c = drive(T, B.trucks, B.trucksEnd, [{t: 0, p: [1200, 1252]}, {t: 0, p: [980, 1252]}, {t: 0, p: [575, 1240]}, {t: 0, p: [455, Y_POOL]}], ease.inOutSine);
    const d = drive(T, B.trucks + 0.1, B.trucksEnd + 0.08, [{t: 0, p: [1420, 1252]}, {t: 0, p: [980, 1252]}, {t: 0, p: [720, 1252]}], ease.inOutSine);
    const lit = T >= B.flip && T < B.trucksEnd + 0.1;
    // their beat ends where the payoff's starts: from the sign step (36.98) they sit back with the rest of the street
    const calm = stepAt(T, B.sign);
    out.push({id: 'C', variant: 'dc', x: c.p[0], y: c.p[1], k: 1, dir: -1, line: lit, roll: roll(c.p[0]), calm});
    out.push({id: 'D', variant: 'dc', x: d.p[0], y: d.p[1], k: 1, dir: -1, line: lit, roll: roll(d.p[0]), calm});
  }
  return out.sort((p, q) => p.y - q.y);
}

/** Where the van's crate sits on its roof (street-plane px), at film time T. */
export function vanCrateAt(T: number): {x: number; y: number; w: number} | null {
  const v = vehiclesAt(T).find((q) => q.id === 'van');
  if (!v) return null;
  const g = fleetVanGeo({x: v.x, y: v.y, w: VAN_W, variant: 'van', dir: -1});
  return {x: v.x + VAN_W * 0.17, y: g.top - 2, w: 34};
}

// ---------------------------------------------------------------- the far plane

/** S9 px -> H2 px: S9's far field re-laid by ONE map (S9's 380 px hall becomes the 330 px data center at x 230-560,
 *  S9's horizon 960 -> 930), the same map the REVEAL lane's pull-back was built on. */
export const S9_TO_H2: Mat = mat.compose(mat.translate(H2_DC.x, H2_HORIZON), mat.scale(H2_DC.w / HALL.w), mat.translate(-HALL.x, -S9_HORIZON));
/** The data center's sign in H2 px. */
export const H2_SIGN = (() => {
  const s = HALL_GEO.sign;
  const a = ap(S9_TO_H2, [s.x, s.y]);
  const b = ap(S9_TO_H2, [s.x + s.w, s.y + s.h]);
  return {x: a[0], y: a[1], w: b[0] - a[0], h: b[1] - a[1]};
})();
/** S9's pieces run on S9's clock (film seconds - 19.40), as they did in the reveal: one motion across J4. */
const S9Clock: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const T = useFilmT();
  return (
    <TimeProvider offset={19.4} global={T}>
      {children}
    </TimeProvider>
  );
};

const rd = (x: number, y: number, w: number, h: number) => `M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`;

/** The data center's sign: lit (its beats: the cold light panel, ink letters) or calm (a panel one step over the hazed
 *  facade, letters a calm step over it: it still reads at full size, never the frame's brightest cold light). */
/** Lit: the frame's brightest cold light (a light box, L* ~92: CRAFT §d.2's 85-92 for lit panes and bulbs). */
const SIGN_LIT = {panel: '#E2EAFF', text: EMBER.ink};
export const SIGN_CALM = {panel: '#5F6782', text: '#8D95AE'};
/** SQF's beat rhymes with the hook's (4.04): as the sign lights at 36.98 the rows go dark, then light one at a time on
 *  "an AI data center" (37.00-37.80: the subject owns its line's motion; kit DataCenter `rowsOn`). */
const HALL_ROWS = {at: H2_BEATS.sign + 0.02, dur: 0.8};
/** The server rows' bands: the clean pen's soft rows on the beat; one value over the body when calm (before the haze). */
const DC_LED = '#A8B6DE';
const DC_LED_CALM = EMBER.dc;

/** Hall B (no sign) beside and behind the hall: S9's shape, its rows as three long soft bands (no dash rows, no blink),
 *  always calm, one haze step farther than the hall (S9 px). */
const HallBCalm: React.FC = () => {
  const {x0, x1, top, base} = HALLB;
  const units = [688, 742, 796, 850];
  const bw = (x1 - x0 - 26 - 2 * 8) / 3;
  const bands = [930, 948]
    .map((y) => [0, 1, 2].map((j) => rrect(x0 + 16 + j * (bw + 8), y + 4, bw, 5, 2.5)).join(''))
    .join('');
  return (
    <Haze k={HALLB_K} color={FAR_AIR}>
      {/* the roof units in the body's own value (one silhouette with the hall, never a row of dark dashes on the sky) */}
      <path d={units.map((ux) => rd(ux, top - 11, 26, 12)).join('')} fill={T9.hallB} />
      <path d={units.map((ux) => rd(ux - 1.5, top - 13, 29, 3)).join('')} fill={T9.infLight} />
      <path d={rd(x0, top, x1 - x0, base - top)} fill={T9.hallB} />
      <path d={rd(x0, top, 14, base - top)} fill={mixHex(T9.hallB, '#1C2036', 0.5)} />
      <path d={rd(x0 - 2, top - 3, x1 - x0 + 4, 4)} fill={T9.infLight} />
      <path d={rd(x0 + 16, 930, x1 - x0 - 26, 13) + rd(x0 + 16, 948, x1 - x0 - 26, 13)} fill={EMBER.dcSide} />
      <path d={bands} fill={mixHex(DC_LED_CALM, T9.hallB, 0.2)} />
    </Haze>
  );
};

/** The hall's roof: S9's run of 7 fan units, still (no spinning blade ticks, no dark fan discs): boxes in the hall's
 *  own dark value under their snow lids, so the roof reads as one silhouette with snow caps (S9 px). */
const HallFansCalm: React.FC = () => {
  let box = '';
  let lid = '';
  for (let i = 0; i < 7; i++) {
    const cx = HALL.x - 132 + i * 44;
    const y = HALL_ROOF;
    box += rd(cx - 15, y - 15, 30, 16);
    lid += rd(cx - 16.5, y - 17.5, 33, 3.5);
  }
  return (
    <>
      <path d={box} fill={EMBER.dcDark} />
      <path d={lid} fill={H2_SNOW} />
    </>
  );
};

/** THE AI data center at H2 (S9 px; through S9_TO_H2): the kit DataCenter (dark, 'bands' rows, no blink, no sign of its
 *  own) under one haze step when calm, its roof fans, then the sign drawn on top in its state. `s` = 0 on its beat (A),
 *  1 calm (C), 0.5 the 3-frame half step. */
const H2Hall: React.FC<{s: number}> = ({s}) => {
  const g = HALL_GEO;
  const sideW = HALL.w * 0.06;
  const tier = s >= 1 ? 'environment' : s > 0 ? 'support' : 'subject';
  const signSize = Math.min(g.sign.h * 0.78, HALL.w * 0.16);
  return (
    <>
      <Haze k={HALL_K * s} color={FAR_AIR}>
        <HallFansCalm />
        {/* on FILM time (OutsideFar runs S9's clock for S9's pieces): the rows' darkAt / rowsOn are film seconds */}
        <FilmClock>
        <DataCenter x={HALL.x} y={HALL.y} w={HALL.w} h={HALL.h} variant="dark" units={0} sign={null} signH={52} ink={2.6} ledStyle="bands" ledColor={mixHex(DC_LED, DC_LED_CALM, s)} blink={false} darkAt={H2_BEATS.sign} rowsOn={HALL_ROWS} snow={H2_SNOW} tier={tier} seed="s9/dc" />
        </FilmClock>
      </Haze>
      <path d={rrect(g.sign.x, g.sign.y, g.sign.w, g.sign.h, 3)} fill={mixHex(SIGN_LIT.panel, SIGN_CALM.panel, s)} />
      <Txt x={HALL.x + sideW / 2} y={g.sign.y + g.sign.h * 0.74} size={signSize} fill={mixHex(SIGN_LIT.text, SIGN_CALM.text, s)} fit={g.sign.w * 0.92}>
        AI DATA CENTER
      </Txt>
    </>
  );
};

/** S9's far field (seven rows of tiny roofs, S9 y 972-1040: the same seeded shapes as S9_far's FarField) one plane step
 *  calmer (CRAFT §f, +3: walls and roofs close to the air, the lit dots tone-on-tone). Only seen in SQD's pull-back (the
 *  town's far snow covers it at H2). */
const FF_CALM: RoofRowSpec[] = Array.from({length: 7}, (_, i) => {
  const haze = ((6 - i) / 6) * 0.18;
  const dark = mixHex('#7E89AD', T9.glow, haze);
  const light = mixHex('#B1BBD8', T9.glow, haze * 0.6);
  return {y: 980 + i * 9.6, w: 9 + i * 1.25, dark, light, dot: mixHex(dark, light, 0.25), dotEvery: 3, chimEvery: 3.5, x0: -150, x1: 1500, tall: 0.14};
});
const FF_CALM_PATHS = roofRows(FF_CALM, 'farfield');
const FarFieldCalm: React.FC = () => <RoofRowsView rows={FF_CALM} paths={FF_CALM_PATHS} />;

/** The far plane, back to front: the clouds, the far ground, THE MOUNTAIN (the REVEAL lane's pile, summit (800, 640))
 *  with the summit stick, hall B and its plume, `streams` (SQD's stick streams: a slot), THE DATA CENTER (the header:
 *  calm off its beats, its sign lit on them, drawn on top of the hall), the infinity line, the far field's roofs (the
 *  town covers their foot). `summit` = draw the summit stick (SQD draws its own J3 stick in screen px); `birds` = the
 *  reveal's V of birds (SQD_life's RevealBirds, from 21.30: the film's one flock there, SQD draws none of its own). */
export const OutsideFar: React.FC<{streams?: React.ReactNode; summit?: boolean; birds?: boolean}> = ({streams, summit = true, birds = true}) => {
  const T = useFilmT();
  const s = twoStepIn(T, HALL_A);
  return (
    <S9Clock>
      <Tier tier="environment" bg={EMBER.sky}>
        <XG m={S9_TO_H2}>
          <CornerCloud />
          <HighClouds />
          <CloudBank />
          <FarGround />
        </XG>
        {/* the reveal's V of birds (SQD_life: from 21.30, film time, H2 px), carried across J4 by this plane */}
        {birds ? <RevealBirds T={T} /> : null}
        <RevealPeak />
        {summit ? <SummitStick /> : null}
        <XG m={S9_TO_H2}>
          <HallBCalm />
          <HallPlume />
        </XG>
        {streams}
        <XG m={S9_TO_H2}>
          <H2Hall s={s} />
          <InfinityLine />
          <FarFieldCalm />
        </XG>
      </Tier>
    </S9Clock>
  );
};

/** THE summit stick (the one that left your laptop): the kit MemoryStick + S8's close-up detail, lying on the summit,
 *  with its contact shadow and cold rim (SQD's J3 stick at H2 size). */
const SummitStick: React.FC = () => (
  <>
    <J3StickLight x={H2_SUMMIT.x} y={H2_SUMMIT.y} w={H2_SUMMIT.w} rot={H2_SUMMIT.rot} />
    <J3Stick x={H2_SUMMIT.x} y={H2_SUMMIT.y} w={H2_SUMMIT.w} rot={H2_SUMMIT.rot} />
  </>
);

// ---------------------------------------------------------------- the town plane

type House = {x: number; w: number; base: number; h: number; roof: number; color: string; wins: [number, number, number, number][]};
const TOWN_COLORS = ['#3B4570', EMBER.roofs, '#46527C', '#404A74'];
/** The town's far snow (what the houses stand on and the walls are hazed half way into; home_set's H1 window steps its
 *  houses toward it after the hook). */
export const FAR_SNOW = '#CDD3E8';
/** Two rows of small houses on the horizon (the back one over the far snow, the front one standing on our street's far
 *  side), with a gap where the road climbs to the data center. */
const TOWN: {back: House[]; front: House[]} = (() => {
  const r = rng('h2/town');
  const row = (base: number, x0: number, x1: number, wR: [number, number], hR: [number, number], gap?: [number, number]): House[] => {
    const hs: House[] = [];
    for (let x = x0; x < x1; ) {
      const w = r.range(wR[0], wR[1]);
      if (gap && x + w > gap[0] && x < gap[1]) {
        x = gap[1] + r.range(2, 8);
        continue;
      }
      const h = r.range(hR[0], hR[1]);
      const wins: [number, number, number, number][] = [];
      const n = w > 54 ? 2 : 1;
      for (let i = 0; i < n; i++) wins.push([x + w * (n === 1 ? 0.4 : 0.22 + i * 0.36), base - h * 0.62, w * 0.18, h * 0.26]);
      hs.push({x, w, base, h, roof: w * r.range(0.3, 0.42), color: TOWN_COLORS[Math.floor(r.range(0, TOWN_COLORS.length - 0.01))], wins});
      x += w + r.range(-4, 6);
    }
    return hs;
  };
  return {back: row(964, -40, 1120, [38, 60], [22, 34], [372, 418]), front: row(1036, -50, 1130, [52, 82], [34, 52], [262, 344])};
})();

/** A row of the town's houses, calm (E3; tier C): walls half way into the far snow (L* ~56-61 before the tier's pull),
 *  caps one pale step (the tier's H2_SNOW, L* ~82, never the frame's white), unlit panes a step under the wall; lit
 *  panes stay emissive (one switching at a time). Every raw fill through the tier's paint. */
const HouseRow: React.FC<{hs: House[]; seed: string; T: number}> = ({hs, seed, T}) => {
  const paint = useTierPaint();
  const lit = useLightOff() ? EMBER.houseLit : '#FFD27A';
  const cap = paint(H2_SNOW);
  let n = 0;
  hs.forEach((h) => (n += h.wins.length));
  let k = 0;
  return (
    <>
      {hs.map((h, i) => {
        const peak = h.base - h.h - h.roof;
        const wall = mixHex(h.color, FAR_SNOW, 0.5);
        const body = roundPoly([[h.x, h.base], [h.x, h.base - h.h], [h.x + h.w / 2, peak], [h.x + h.w, h.base - h.h], [h.x + h.w, h.base]], [0, 2, 2, 2, 0]);
        const capD = roundPoly([[h.x - 3, h.base - h.h + 3], [h.x + h.w / 2, peak - 3], [h.x + h.w + 3, h.base - h.h + 3], [h.x + h.w + 1, h.base - h.h + 8], [h.x + h.w / 2, peak + 5], [h.x - 1, h.base - h.h + 8]], 2);
        return (
          <g key={i}>
            <path d={body} fill={paint(wall)} />
            <path d={capD} fill={cap} />
            {h.wins.map((w, j) => {
              const on = windowLit(T, seed, k, n, {gap: [0.9, 2.2], litFrac: 0.7});
              k++;
              return <path key={j} d={rrect(w[0], w[1], w[2], w[3], 1.5)} fill={on ? lit : paint(mixHex(wall, EMBER.sky, 0.3))} />;
            })}
          </g>
        );
      })}
    </>
  );
};

/** The chip factory behind its wall (calm C: a step toward the sky, no line): a low sawtooth roof whose north
 *  glazing glows warm, snow on the long slopes, one chimney whose steam rises slowly and shrinks to nothing well under
 *  the caption band. The steam lies over the mountain's flank: a light step of the pile's own lit gold, small (r <= 7),
 *  so it reads as steam in front of the gold, never as holes in it (E14). */
const FAB = {x0: 600, x1: 944, base: 1004, h: 34, teeth: 4, tooth: 30, chim: {x: 896, w: 18, top: 900}};
/** Its roof one plane step behind the street's calm wall (toward the far snow), the chimney a step under it, the north
 *  glazing a warm glow one step over the roof (not a window-bright stripe: the sawtooth held the frame's top salience). */
const FAB_BRICK = '#AE8078';
const FAB_SHADE = '#A16E63';
const FAB_GLAZE = '#D8AF87';
const STEAM = mixHex(PEAK_TONES.lit, '#FFFFFF', 0.2);
const FactoryRoof: React.FC<{T: number}> = ({T}) => {
  const paint = useTierPaint();
  const {x0, x1, base, h, teeth, tooth, chim} = FAB;
  const top = base - h;
  const tw = (x1 - x0) / teeth;
  let roof = `M${x0} ${base}V${top}`;
  let glaze = '';
  let snow = '';
  for (let i = 0; i < teeth; i++) {
    const a = x0 + i * tw;
    roof += `L${f1(a + tw * 0.78)} ${top - tooth}L${f1(a + tw * 0.78)} ${top}L${f1(a + tw)} ${top}`;
    glaze += `M${f1(a + tw * 0.8)} ${top - tooth + 6}L${f1(a + tw * 0.97)} ${top - 2}L${f1(a + tw * 0.8)} ${top - 2}Z`;
    snow += `M${f1(a - 1)} ${top + 1}L${f1(a + tw * 0.78)} ${top - tooth - 2}L${f1(a + tw * 0.78)} ${top - tooth + 5}L${f1(a + 6)} ${top + 3}Z`;
  }
  roof += `V${base}Z`;
  const ps = puffs(T, {n: 4, life: 3.4, rise: 100, drift: 22, r0: 3, r1: 7, wobble: 2.5, seed: 'h2/fab', ceil: 700}, chim.top - 6);
  return (
    <>
      {ps.map((q, i) => (
        <path key={i} d={ellD(chim.x + chim.w / 2 + q.x, chim.top - 6 + q.y, q.r * 1.25, q.r)} fill={paint(STEAM)} />
      ))}
      <path d={rrect(chim.x, chim.top, chim.w, base - chim.top, 2)} fill={paint(FAB_SHADE)} />
      <path d={rrect(chim.x - 3, chim.top - 4, chim.w + 6, 6, 2)} fill={paint(H2_SNOW)} />
      <path d={roof} fill={paint(FAB_BRICK)} />
      <path d={glaze} fill={FAB_GLAZE} />
      <path d={snow} fill={paint(H2_SNOW)} />
    </>
  );
};

/** The town on the horizon, the road up to the data center, the chip factory behind its wall. `onRoad` = what drives
 *  on the road between the back houses and the front ones (SQD's trucks: a slot). */
export const OutsideTown: React.FC<{onRoad?: React.ReactNode}> = ({onRoad}) => {
  const T = useFilmT();
  return (
    <FilmClock>
      <Tier tier="environment" bg={EMBER.sky}>
        <TownBody T={T} onRoad={onRoad} />
      </Tier>
    </FilmClock>
  );
};
const TownBody: React.FC<{T: number; onRoad?: React.ReactNode}> = ({T, onRoad}) => {
  const paint = useTierPaint();
  return (
    <>
      {/* the far snow under the town */}
      <path d={`M-400 ${H2_HORIZON}H1480V1100H-400Z`} fill={paint(FAR_SNOW)} />
      <HouseRow hs={TOWN.back} seed="h2/townB" T={T} />
      {/* the road from our street up to the data center's gate: one trodden band, tiny lamps along it */}
      <path d={`M250 1092C262 1050 300 1010 342 978C368 958 384 944 392 932L404 932C400 946 392 962 378 984C352 1022 334 1058 338 1092Z`} fill={paint(EMBER.road)} />
      <path d={[[318, 1046], [346, 1000], [372, 962]].map(([x, y]) => ellD(x, y, 2.6, 2.6)).join('')} fill={'#FFE2B0'} />
      {onRoad}
      <HouseRow hs={TOWN.front} seed="h2/townF" T={T} />
      {/* the chip factory, behind its wall: a low sawtooth roof, its glazing lit, a chimney with slow soft steam */}
      <FactoryRoof T={T} />
    </>
  );
};

// ---------------------------------------------------------------- the street plane

/** A small worker (line-only: a light flat fill and a thin same-hue line; tier B): hard hat, hi-vis, legs that step. */
const Worker: React.FC<{x: number; y: number; h: number; walk: number; carry: boolean; face: 1 | -1}> = ({x, y, h, walk, carry, face}) => {
  const u = h / 46;
  const step = Math.sin(walk * Math.PI * 2) * 4 * u;
  const lineC = '#B7884E';
  const body = rrect(x - 8 * u, y - 34 * u, 16 * u, 20 * u, 5 * u);
  const legs = `M${f1(x - 3 * u)} ${f1(y - 15 * u)}L${f1(x - 3 * u + step)} ${f1(y)}M${f1(x + 3 * u)} ${f1(y - 15 * u)}L${f1(x + 3 * u - step)} ${f1(y)}`;
  return (
    <g>
      <path d={legs} stroke={'#5A6488'} strokeWidth={4.2 * u} strokeLinecap="round" fill="none" />
      <path d={body} fill={'#F2C46B'} stroke={lineC} strokeWidth={1.6} />
      <path d={ellD(x, y - 39 * u, 5.2 * u, 5.4 * u)} fill={'#D9926B'} />
      <path d={`M${f1(x - 6.4 * u)} ${f1(y - 40 * u)}Q${f1(x)} ${f1(y - 49 * u)} ${f1(x + 6.4 * u)} ${f1(y - 40 * u)}Z`} fill={EMBER.card} stroke={lineC} strokeWidth={1.4} />
      {carry ? <CrateBox x={x + face * 4 * u} y={y - 22 * u} w={20 * u} /> : null}
    </g>
  );
};

/** The two workers' loading loop: from the gate's mouth to a truck's back and back (film time). */
function workersAt(T: number): {x: number; y: number; h: number; walk: number; carry: boolean; face: 1 | -1}[] {
  const B = H2_BEATS;
  const G: Pt = [548, 1104];
  const vs = vehiclesAt(T);
  const backOf = (id: string): Pt | null => {
    const v = vs.find((q) => q.id === id);
    if (!v || v.y < 1200) return null;
    return [v.x + (VAN_W * 1.4 * v.k) / 2 + 6, v.y - 6];
  };
  // which truck they load, and how fast (the subject's beat 23.10-24.20 fast; B and later C at a calm pace)
  const target = T < B.aGo ? 'A' : T < B.bGo ? 'B' : 'C';
  const back = backOf(target);
  const fast = T >= B.load && T < B.aGo;
  const period = fast ? 1.1 : 2.6;
  // C is loaded only after the data center's beat (38.75): nothing walks while the payoff's sign lights
  const start = fast ? B.load : target === 'B' ? B.aGo + 1.3 : 38.75;
  return [0, 0.5].map((ph, i) => {
    const idle: Pt = [G[0] + (i ? 30 : -14), G[1] + 6];
    if (!back || T < start || (target === 'B' && T > B.bGo - 0.6) || (target === 'C' && T < 38.75)) {
      return {x: idle[0], y: idle[1], h: 40, walk: 0, carry: false, face: 1 as const};
    }
    const c = (((T - start) / period + ph) % 1 + 1) % 1;
    // out carrying (0-0.45), in empty (0.5-0.95), short holds at each end
    const out = c < 0.5;
    const s = out ? ease.inOutSine(clamp(c / 0.45)) : 1 - ease.inOutSine(clamp((c - 0.5) / 0.45));
    const x = idle[0] + (back[0] - idle[0]) * s;
    const y = idle[1] + (back[1] - idle[1]) * s;
    const moving = out ? c < 0.45 : c < 0.95;
    return {x, y, h: 40 + 6 * s, walk: moving ? (T - start) * 1.7 : 0, carry: out, face: (out ? 1 : -1) as 1 | -1};
  });
}

// ---- the notice's faces (face-local px, 200 x ~122). E9: each face at full contrast ~1.5 s from its swing, then one
// value down with its small lines hidden; blank from the sign step (36.98). `k` 0 = full, 0.5 the half step, 1 calm.
/** The calm notice (tier C): a soft warm paper (L* 88), its big glyph a calm step under it (L* 69: it still reads at
 *  full size, never as loud as the beat's subject), its bars pale. */
const NOTICE_CALM = {paper: '#E9DACF', ink: '#C9A08F', now: '#A69389', last: '#E3C09B', faint: '#D8BAAC', binding: '#8E6A62'};
const mixK = (full: string, calm: string, k: number) => (k <= 0 ? full : k >= 1 ? calm : mixHex(full, calm, k));

/** The 5x face: last year | now bars (S11's), "~5x", the source. */
const FaceFiveX: React.FC<{k: number}> = ({k}) => {
  const small = k < 0.5;
  return (
    <>
      <path d={rrect(16, 76, 26, 18, 2)} fill={mixK(EMBER.boardDeep, NOTICE_CALM.last, k)} />
      <path d={rrect(52, 14, 26, 80, 2)} fill={mixK(EMBER.anchor, NOTICE_CALM.now, k)} />
      {small ? (
        <>
          <path d={`M10 95H86`} stroke={EMBER.beam} strokeWidth={2} />
          <Txt x={29} y={110} size={13} fill={EMBER.ink}>
            last year
          </Txt>
          <Txt x={65} y={110} size={13} fill={EMBER.ink}>
            now
          </Txt>
          <Txt x={144} y={104} size={22} fill={EMBER.beam} fit={110}>
            RAM chips
          </Txt>
          <Txt x={100} y={121} size={11} fill={EMBER.beam} fit={190}>
            RAM chips · Gartner, Q2 2026
          </Txt>
        </>
      ) : null}
      <Txt x={144} y={78} size={72} fill={mixK(EMBER.ink, NOTICE_CALM.ink, k)} fit={108}>
        ~5x
      </Txt>
    </>
  );
};
/** The 2027 face: "2027" big, Micron's line small; nothing once blank. */
const Face2027: React.FC<{k: number; blank: boolean}> = ({k, blank}) =>
  blank ? null : (
    <>
      <Txt x={100} y={78} size={84} fill={mixK(EMBER.ink, NOTICE_CALM.ink, k)} fit={184}>
        2027
      </Txt>
      {k < 0.5 ? (
        <>
          <Txt x={100} y={100} size={13} fill={EMBER.beam} fit={190}>
            Micron: supply 'much tighter'
          </Txt>
          <Txt x={100} y={116} size={13} fill={EMBER.beam} fit={190}>
            in 2027 and 2028 than in 2026
          </Txt>
        </>
      ) : null}
    </>
  );
/** The notice's first face: the gate's queue rule, always calm (a faint "CHIP PICKUP", a van icon and an arrow), shown
 *  from the load beat (blank through SQD's reveal and J4: E5). */
const FaceQueue: React.FC<{on: boolean}> = ({on}) =>
  on ? (
    <>
      <Txt x={100} y={50} size={30} fill={NOTICE_CALM.faint} fit={170}>
        CHIP PICKUP
      </Txt>
      <path d={rrect(60, 70, 52, 30, 4) + rrect(112, 80, 22, 20, 4)} fill={mixHex(EMBER.reveal, NOTICE_CALM.paper, 0.5)} />
      <path d={ellD(74, 102, 6, 6) + ellD(124, 102, 6, 6)} fill={NOTICE_CALM.faint} />
      <path d={`M44 85L30 85M36 79L30 85L36 91`} stroke={NOTICE_CALM.faint} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ) : null;

/** The barrier's angle (deg; 0 = across the lane, 85 = up) at T: a stepped pivot, 4 drawings over 0.25 s. */
function barrier(T: number): number {
  const ev = [
    {t: H2_BEATS.barrier, up: true},
    {t: 25.05, up: false},
    {t: H2_BEATS.bGo - 0.1, up: true},
    {t: 34.5, up: false},
  ];
  let a = 0;
  for (const e of ev) {
    if (T < e.t) break;
    const k = Math.min(1, Math.floor(((T - e.t) / 0.25) * 4) / 4);
    a = e.up ? 85 * k : 85 * (1 - k);
  }
  return a;
}

/** The gate's floodlight pool: two warm steps, both lighter and warmer than the road and the snow (CRAFT §d.7; E11),
 *  and its calm step (until the load beat: E5). */
const POOL_FULL: [string, string] = ['#ECD6C3', '#F8E2C8'];
const POOL_CALM: [string, string] = ['#E1D1C7', '#EBDAC9'];
/** The gate's lit yard: full, and one value calmer until the load beat. */
const GATE_LIT = '#F7CB8E';
const GATE_CALM = '#E9B881';
/** The DC trucks off their beats (Vehicle.calm: A until the load beat, B always, C and D from the sign step): one haze
 *  step toward the street's ambient snow. */
const TRUCK_CALM_K = 0.18;
const STREET_AMBIENT = '#C9CFE6';
/** The waiting vans' exhaust: a light vapour step over the road (L* 88, under the snow caps' 89: not snow, so it keeps
 *  its own value; at the caps' value it fell under the change a phone shows and the queue's slow life went still). */
const EXHAUST = mixHex(EMBER.snow, EMBER.road, 0.35);
/** The street's stage (tier C): the factory's wall a soft warm brick, sky-lit snow caps one pale step (L* 86, under the
 *  pool's core: CRAFT §d.2), so the wall's top edge and the roofline never hold the frame's top salience. */
const WALL_BRICK = '#A66B5C';
const STREET_CAP = '#D0D6E7';
/** The guard booth's cream body in the street's ambient light (CRAFT §d.2-3: a wall facing us under the open sky sits
 *  one step down, L* 91 -> 81, its chroma kept, turned toward rose): the room's wall cream (EMBER.wall, lit by the nook's
 *  lamp) was the brightest thing outside, over the snow and the gate's pool. */
const BOOTH_WALL = (() => {
  const c = lch(EMBER.wall);
  return fromLch(c.L - 10, c.C, c.h - 10);
})();

/** Our street: ground, the factory's wall and gate, the booth and barrier, the floodlight and its pool, the notice,
 *  the queue, the workers, the walkers, the snow. */
export const OutsideStreet: React.FC = () => {
  const T = useFilmT();
  const B = H2_BEATS;
  const off = useLightOff();
  const cams = useContext(PlaneCamsCtx);
  const id = 'h2s' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const vs = vehiclesAt(T, roadMapOf(cams));
  const ws = workersAt(T);
  const rig = withKey(RIGS.street, RIGS.street.key, [streetLamp([H2_FLOOD.x + 20, H2_FLOOD.y + 12], [H2_POOL.cx, H2_POOL.cy]), H2_ROAD_LAMP]);
  const G = H2_GATE;
  const W = H2_WALL;
  const crate = vanCrateAt(T);
  // the street's calm until the load beat (E5): 1 calm, 0.5 the half step, 0 full
  const calm = 1 - stepAt(T, B.calmEnd);
  const poolCols: [string, string] = [mixK(POOL_FULL[0], POOL_CALM[0], calm), mixK(POOL_FULL[1], POOL_CALM[1], calm)];
  // the notice's faces (E9): the queue rule (calm, from the load beat), the 5x (27.08), 2027 (34.60), blank at 36.98
  const k5 = stepAt(T, B.fiveXCalm);
  const k27 = stepAt(T, B.flipCalm);
  const faces = [
    {t: -99, paper: NOTICE_CALM.paper, node: <FaceQueue on={T >= B.calmEnd} />},
    {t: B.fiveX, paper: mixK(EMBER.card, NOTICE_CALM.paper, k5), node: <FaceFiveX k={k5} />},
    {t: B.flip, paper: mixK(EMBER.card, NOTICE_CALM.paper, k27), node: <Face2027 k={k27} blank={T >= B.sign} />},
  ];
  const noticeOn = (T >= B.fiveX - 0.1 && T < B.fiveXCalm) || (T >= B.flip - 0.1 && T < B.flipCalm);
  // the far pavement's walker and dog (left of the factory, slow), then a second walker the other way
  const walkerX = T < 31 ? 30 + (T - 22) * 30 : 300 - (T - 31) * 26;
  const walkerOn = (T > 22 && T < 31.2) || (T > 31.6 && T < 42);
  // the snow stays under the caption band in SCREEN px (y 612), whatever the camera does to this plane
  const sm = cams?.street ?? mat.I;
  const snowTop = (612 - sm[5]) / (sm[3] || 1);
  return (
    <FilmClock>
      <CalmPlane s={streetCalm(T)} ground={STREET_AMBIENT}>
      <Lit rig={rig}>
        <Tier tier="environment" bg={EMBER.sky}>
          {/* the ground: far pavement, the road (one trodden step), the near kerb's snow bank */}
          <path d={`M-400 ${H2_STREET.top}H1480V1500H-400Z`} fill={'#C9CFE6'} />
          <path d={`M-400 1104H1480V1500H-400Z`} fill={EMBER.road} />
          <path d={`M-400 1146H1480V1150H-400ZM-400 1196H1480V1200H-400Z`} fill={mixHex(EMBER.road, '#C9CFE6', 0.5)} />
        </Tier>
        {/* the road-mouth lamp's own small pool (E11; behind the corner house, which stands in front of its far half) */}
        <LightPool light={H2_ROAD_LAMP} colors={POOL_FULL} />
        <Tier tier="environment" bg={EMBER.sky}>
          {/* the corner house on our side, left of the road's mouth (warm: ours), one lit window; tier C: its brick a calm
              step toward the snow, its roof's snow one pale step (the street's stage, never louder than the beat) */}
          <path d={rrect(-40, 990, 228, 104, 3)} fill={'#A6776E'} />
          <path d={roundPoly([[-50, 994], [70, 952], [200, 994], [194, 1002], [-44, 1002]], 3)} fill={STREET_CAP} />
          <path d={rrect(40, 1020, 34, 40, 2) + rrect(118, 1020, 34, 40, 2)} fill={off ? EMBER.houseLit : '#FFD27A'} />
          {/* the factory's wall (tier C: a soft warm brick, L* 51 C* 28, never the saturated dark field that held the
              frame's top salience behind every beat) with its snow cap one pale step; the gate's lit yard: crates inside */}
          <path d={rrect(W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0 + 4, 3)} fill={WALL_BRICK} />
          <path d={rrect(W.x0 - 4, W.y0 - 6, W.x1 - W.x0 + 8, 9, 4)} fill={STREET_CAP} />
          {/* two string courses: long same-hue bands a calm step under the brick (CRAFT §c: dL* <= ~6), never dark lines */}
          <path d={`M${W.x0} ${W.y0 + 34}H${W.x1}V${W.y0 + 37}H${W.x0}ZM${W.x0} ${W.y0 + 64}H${W.x1}V${W.y0 + 67}H${W.x0}Z`} fill={mixHex(WALL_BRICK, EMBER.brickShade, 0.3)} />
          <path d={rrect(G.x0, G.y0, G.x1 - G.x0, G.y1 - G.y0 + 2, 4)} fill={off ? EMBER.houseLit : mixK(GATE_LIT, GATE_CALM, calm)} />
          <path d={rrect(G.x0 + 16, G.y0 + 34, 40, 38, 2) + rrect(G.x0 + 60, G.y0 + 44, 36, 28, 2)} fill={'#C98A64'} />
          <path d={rrect(G.x0 + 22, G.y0 + 28, 30, 8, 2) + rrect(G.x0 + 64, G.y0 + 38, 28, 8, 2)} fill={EMBER.board} />
          {/* the booth on the gate's left: a lit window, the guard's silhouette inside */}
          <path d={rrect(H2_BOOTH.x0, H2_BOOTH.y0, H2_BOOTH.x1 - H2_BOOTH.x0, H2_BOOTH.y1 - H2_BOOTH.y0, 3)} fill={BOOTH_WALL} />
          <path d={rrect(H2_BOOTH.x0 - 4, H2_BOOTH.y0 - 8, H2_BOOTH.x1 - H2_BOOTH.x0 + 8, 10, 4)} fill={mixHex(EMBER.dcSide, STREET_AMBIENT, 0.3)} />
          <path d={rrect(H2_BOOTH.x0 - 5, H2_BOOTH.y0 - 13, H2_BOOTH.x1 - H2_BOOTH.x0 + 10, 7, 3.5)} fill={STREET_CAP} />
          <path d={rrect(H2_BOOTH.x0 + 8, H2_BOOTH.y0 + 10, 30, 24, 2)} fill={off ? EMBER.houseLit : '#FFD27A'} />
          <path d={ellD(H2_BOOTH.x0 + 22, H2_BOOTH.y0 + 22, 5, 5.5) + rrect(H2_BOOTH.x0 + 14, H2_BOOTH.y0 + 27, 16, 8, 3)} fill={'#C98A64'} />
        </Tier>
        {/* the floodlight's pool on the street: THE light outside (two flat warm steps), and the gate's lit yard spilling
            onto the pavement down to it (one lit zone: the yard, the spill, the pool) */}
        <WindowSpill win={[G.x0, G.y0, G.x1 - G.x0, G.y1 - G.y0]} base={G.y1 + 4} widen={1.45} depth={0.75} color={poolCols[0]} />
        <LightPool pool={H2_POOL} colors={poolCols} />
        <Tier tier="environment" bg={EMBER.sky}>
          {/* the floodlight on the wall over the gate (its lit face the source core) */}
          <path d={rrect(H2_FLOOD.x - 3, H2_FLOOD.y - 8, 6, 14, 2)} fill={EMBER.anchor} />
          <path d={roundPoly([[H2_FLOOD.x - 18, H2_FLOOD.y + 2], [H2_FLOOD.x + 18, H2_FLOOD.y + 2], [H2_FLOOD.x + 13, H2_FLOOD.y + 16], [H2_FLOOD.x - 13, H2_FLOOD.y + 16]], 3)} fill={EMBER.dcSide} />
          <path d={rrect(H2_FLOOD.x - 12, H2_FLOOD.y + 12, 24, 5, 2)} fill={EMBER.core} />
          {/* the street lamp at the road's mouth (a practical: its lantern lights the small pool at its foot) */}
          <path d={rrect(229, 966, 6, 128, 3)} fill={EMBER.dcSide} />
          <path d={rrect(222, 956, 20, 14, 4)} fill={EMBER.core} />
          <path d={rrect(220, 951, 24, 6, 3)} fill={H2_SNOW} />
        </Tier>
        <ShadowLayer>
          {/* contact shadows: the booth, the notice's posts, the lamp post, every vehicle (16 px), the workers */}
          <ContactShadow x={(H2_BOOTH.x0 + H2_BOOTH.x1) / 2} y={H2_BOOTH.y1} w={H2_BOOTH.x1 - H2_BOOTH.x0} h={8} />
          <ContactShadow x={H2_NOTICE.x + H2_NOTICE.w * 0.15} y={H2_NOTICE.ground} w={14} h={6} />
          <ContactShadow x={H2_NOTICE.x + H2_NOTICE.w * 0.85} y={H2_NOTICE.ground} w={14} h={6} />
          <ContactShadow x={232} y={1094} w={10} h={5} />
          {vs.map((v) => {
            const g = fleetVanGeo({x: v.x, y: v.y, w: VAN_W * v.k, variant: v.variant, dir: v.dir});
            return v.y > 1080 ? <ContactShadow key={v.id} x={v.x} y={v.y} w={g.w * 0.94} h={16 * v.k} /> : null;
          })}
          {ws.map((w, i) => (
            <ContactShadow key={`w${i}`} x={w.x} y={w.y} w={14} h={6} k={1.25} />
          ))}
          {walkerOn ? <ContactShadow x={walkerX} y={1098} w={14} h={6} k={1.25} /> : null}
        </ShadowLayer>
        {/* the notice on its posts (the subject on its beats: the 5x face, the 2027 flip) */}
        <NoticeFlip x={H2_NOTICE.x} y={H2_NOTICE.y} w={H2_NOTICE.w} h={H2_NOTICE.h} ground={H2_NOTICE.ground} faces={faces} line={noticeOn} binding={noticeOn ? EMBER.anchor : NOTICE_CALM.binding} rings={noticeOn ? EMBER.reveal : NOTICE_CALM.paper} />
        {/* the far pavement's walkers (C: no line, slow) */}
        {walkerOn ? <Walker x={walkerX} y={1098} dir={T < 31 ? 1 : -1} T={T} /> : null}
        {/* the workers, the vehicles, the barrier: back to front */}
        {ws.map((w, i) => (w.y < 1150 ? <Worker key={`wb${i}`} {...w} /> : null))}
        {vs.map((v) => {
          const van = <FleetVan x={v.x} y={v.y} w={VAN_W * v.k} variant={v.variant} dir={v.dir} line={v.line} roll={v.roll} lift={off || v.variant === 'dc' ? 0 : poolLift(v.x, v.y, VAN_W * v.k)} />;
          return (
            <React.Fragment key={v.id}>
              {v.variant === 'dc' ? (
                <Haze k={TRUCK_CALM_K * (v.calm ?? 0)} color={STREET_AMBIENT}>
                  {van}
                </Haze>
              ) : (
                van
              )}
              {v.crate && crate ? <CrateBox x={crate.x} y={crate.y} w={crate.w} line={T >= B.vanGo - 0.1} /> : null}
            </React.Fragment>
          );
        })}
        {ws.map((w, i) => (w.y >= 1150 ? <Worker key={`wf${i}`} {...w} /> : null))}
        {/* slow life in the queue: soft exhaust puffs at the waiting vans' tails (C: small, slow, shrink to nothing) */}
        {vs
          .filter((v) => v.id === 'van2' || v.id === 'better')
          .map((v) =>
            puffs(T, {n: 3, life: 2.4, rise: 26, drift: 22, r0: 2, r1: 6, wobble: 2, seed: `h2/ex/${v.id}`}).map((q, i) => (
              <path key={`${v.id}${i}`} d={ellD(v.x + VAN_W / 2 + 6 + q.x, v.y - 8 + q.y, q.r * 1.3, q.r)} fill={EXHAUST} />
            )),
          )}
        {/* a small car crosses the street's far side while the payoff holds (C: flat, slow) */}
        <FarCar T={T} />
        {/* ONE small crate onto our van's roof on "left" (26.04) */}
        <CrateFlight {...CRATE_ON} line />
        {/* OUR side of the street, under our window (H2 y 1250-1520): hidden by the sill at rest, seen in J4's entry
            (street x1.12 under the window's x3): the kerb stones, a soft snowbank, our pavement with footprints, a
            row of bollards, a bench and a parked bike. C: flat, still, no line. */}
        <OurPavement />
        {/* the barrier across the lane's exit: striped arm on a post, lifts on "first dibs" */}
        <XG m={mat.about(mat.rotate(-barrier(T)), 334, 1160)}>
          <path d={rrect(334, 1155, 118, 10, 4)} fill={H2_SNOW} />
          <path d={[0, 2, 4].map((i) => rrect(334 + 10 + i * 20, 1155, 18, 10, 1)).join('')} fill={EMBER.beam} />
        </XG>
        <path d={rrect(328, 1150, 12, 52, 3)} fill={EMBER.dcSide} />
        {/* falling snow (far + mid), kept under the caption band (screen y 612) */}
        <clipPath id={id}>
          <rect x={-200} y={snowTop} width={1480} height={Math.max(0, 2012 - snowTop)} />
        </clipPath>
        <g clipPath={`url(#${id})`}>
          <SnowLayers x={-60} y={560} w={1200} h={760} layers={['far', 'mid']} density={0.5} band={null} color={H2_SNOW} seed="h2/snow" />
        </g>
        {/* birds: one small V crossing slow while the chip makers speak (C), under the caption band in the held push */}
        <BirdV at={32.9} from={[-40, 790]} to={[460, 760]} dur={3.2} />
      </Lit>
      </CalmPlane>
    </FilmClock>
  );
};

/** The crate's flight onto the van's roof (26.04): from the worker at the gate's mouth. */
const CRATE_ON = (() => {
  const to = (() => {
    const v = vehiclesAt(H2_BEATS.crate).find((q) => q.id === 'van')!;
    const g = fleetVanGeo({x: v.x, y: v.y, w: VAN_W, variant: 'van', dir: -1});
    return [v.x + VAN_W * 0.17, g.top - 2 - 34 * 0.31] as Pt;
  })();
  return {from: [590, 1128] as Pt, to, t0: H2_BEATS.crate - 0.24, t1: H2_BEATS.crate + 0.02, arc: 40, w0: 22, w1: 34, rot0: -12, rot1: 0};
})();

/** THE HOP (E4: the carry must read): the van's crate leaves its roof at 29.85 and arcs over the sill into the thread
 *  plane's listing laptop, GROWING as it comes toward the glass (from the pushed crate's own screen size to ~120 px at
 *  mid-arc, "at the sill") and shrinking into the screen (~40 px at 84 %, then to nothing by 30.29: the tag ticks to
 *  $1,099 at 30.28 as it disappears, with the screen lit). In SCREEN px, drawn ABOVE the front plane. `to` = the
 *  listing's screen centre at film time; `street` = the street plane's camera (the start is its crate on screen). */
export const HOP = {t0: H2_BEATS.hop, t1: H2_BEATS.hopEnd, arc: 110, peak: 120, peakU: 0.5, land: 40, landU: 0.84};
const smooth01 = (u: number) => {
  const v = clamp(u);
  return v * v * (3 - 2 * v);
};
export function crateHop(T: number, to: Pt = H2_CRATE_TO, street: Mat = mat.I): {x: number; y: number; w: number; rot: number} | null {
  if (T < HOP.t0 || T >= HOP.t1) return null;
  const c = vanCrateAt(HOP.t0 - 1 / 60);
  if (!c) return null;
  const s = Math.hypot(street[0], street[1]);
  const from = ap(street, [c.x, c.y - (c.w * 0.62) / 2]);
  const w0 = c.w * s;
  const u = (T - HOP.t0) / (HOP.t1 - HOP.t0);
  const p = ease.inOutSine(u);
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p - HOP.arc * 4 * p * (1 - p);
  const w =
    u < HOP.peakU
      ? w0 + (HOP.peak - w0) * smooth01(u / HOP.peakU)
      : u < HOP.landU
        ? HOP.peak + (HOP.land - HOP.peak) * smooth01((u - HOP.peakU) / (HOP.landU - HOP.peakU))
        : HOP.land * (1 - ease.inCubic(clamp((u - HOP.landU) / (1 - HOP.landU))));
  return w < 2 ? null : {x, y, w, rot: -14 * p};
}

/** The crate's hop drawn in screen px over the front plane (the subject's outline). */
export const CrateHop: React.FC<{to?: Pt; street?: Mat}> = ({to, street}) => {
  const T = useFilmT();
  const q = crateHop(T, to, street);
  return q ? <CrateBox x={q.x} y={q.y + (q.w * 0.62) / 2} w={q.w} rot={q.rot} line /> : null;
};

/** A small car on the street's far side (from 37.3, once the sign has lit: right to left at a slow ~85 px/s, entering
 *  the frame ~37.5): a flat body, a cabin, two lit headlights' dots; C tier (small, slow, far), behind everything in the
 *  pool: the payoff's hold stays alive while nothing near the gate walks. */
const FAR_CAR_T0 = 37.3;
const FarCar: React.FC<{T: number}> = ({T}) => {
  if (T < FAR_CAR_T0 || T > 41.2) return null;
  const x = 1130 - (T - FAR_CAR_T0) * 85;
  const y = 1132;
  return (
    <g>
      <path d={roundPoly([[x - 34, y - 14], [x - 20, y - 26], [x + 14, y - 26], [x + 26, y - 14], [x + 36, y - 12], [x + 36, y], [x - 36, y]], 5)} fill={'#8E6A88'} />
      <path d={roundPoly([[x - 16, y - 23], [x + 11, y - 23], [x + 20, y - 15], [x - 25, y - 15]], 3)} fill={'#7D8AB6'} />
      <path d={rrect(x - 22, y - 30, 30, 5, 2.5)} fill={H2_SNOW} />
      <path d={ellD(x - 38, y - 8, 2.4, 2.4)} fill={EMBER.core} />
      <path d={ellD(x - 20, y, 6, 6) + ellD(x + 22, y, 6, 6)} fill={EMBER.anchor} />
    </g>
  );
};

/** Our pavement (see OutsideStreet): everything below the near kerb, tops >= y 1254 so the sill hides it at rest. */
const PAVE = (() => {
  const r = rng('h2/pave');
  let stones = '';
  for (let x = -60; x < 1140; x += 58) stones += rrect(x, 1254, 54, 9, 2);
  let bank = 'M-80 1300';
  for (let x = -80; x <= 1160; x += 70) bank += `Q${x + 35} ${f1(1266 + r.range(-4, 4))} ${x + 70} ${f1(1278 + r.range(-3, 3))}`;
  bank += 'L1160 1300Z';
  let prints = '';
  for (let i = 0; i < 26; i++) {
    const x = 60 + i * 38 + r.range(-6, 6);
    const y = 1372 + (i % 2 ? 14 : 0) + Math.sin(i * 0.5) * 18;
    prints += ellD(x, y, 5.5, 3.2);
  }
  const bollards = [130, 330, 530, 730, 930].map((x) => ({x, top: 1300, base: 1352}));
  return {stones, bank, prints, bollards};
})();
/** Our pavement's colours: the nearest outdoor plane, in front of the street (CRAFT §f.2: nearer than the subject's
 *  plane, one value step darker, hue and chroma kept: lib/depth nearStep -1, -5 L*). Its ground is the street's ambient
 *  snow (L* 83 -> 78; it was a pale #D3D8EC, L* 86.5: lighter than the street behind it, depth inverted), its bank and
 *  caps the outside's sky-facing snow (89 -> 84), the kerb, the posts, the bench and the bike one step down with it.
 *  Seen only in SQD's pull, its hold and J4's entry (the sill hides it at rest). */
const NEAR = (c: string) => nearStep(c, -1);
const PAVE_C = (() => {
  const ground = NEAR(STREET_AMBIENT);
  const road = NEAR(EMBER.road);
  const post = NEAR(mixHex(EMBER.dcSide, EMBER.sky, 0.25));
  return {
    ground,
    kerb: NEAR(mixHex(EMBER.road, STREET_AMBIENT, 0.3)),
    snow: NEAR(H2_SNOW),
    prints: mixHex(ground, road, 0.55),
    foot: mixHex(ground, road, 0.7),
    shadow: mixHex(ground, road, 0.6),
    post,
    bench: NEAR(EMBER.beam),
    legs: NEAR(mixHex(EMBER.beam, EMBER.anchor, 0.4)),
  };
})();
const OurPavement: React.FC = () => {
  const C = PAVE_C;
  return (
    <g>
      <path d={`M-200 1262H1280V1560H-200Z`} fill={C.ground} />
      <path d={PAVE.stones} fill={C.kerb} />
      <path d={PAVE.bank} fill={C.snow} />
      <path d={PAVE.prints} fill={C.prints} />
      {PAVE.bollards.map((b, i) => (
        <g key={i}>
          <path d={ellD(b.x, b.base, 16, 4)} fill={C.foot} />
          <path d={rrect(b.x - 7, b.top, 14, b.base - b.top, 4)} fill={C.post} />
          <path d={rrect(b.x - 9, b.top - 4, 18, 7, 3.5)} fill={C.snow} />
        </g>
      ))}
      {/* a bench (seat and back, snow on both) and a parked bike against the fourth bollard */}
      <path d={rrect(410, 1388, 150, 10, 3) + rrect(410, 1350, 150, 9, 3)} fill={C.bench} />
      <path d={rrect(420, 1398, 8, 30, 2) + rrect(542, 1398, 8, 30, 2) + rrect(424, 1359, 6, 30, 2) + rrect(540, 1359, 6, 30, 2)} fill={C.legs} />
      <path d={rrect(410, 1345, 150, 6, 3) + rrect(410, 1383, 150, 6, 3)} fill={C.snow} />
      <path d={ellD(485, 1430, 82, 6)} fill={C.shadow} />
      <path d={`M700 1392m-22 0a22 22 0 1 0 44 0a22 22 0 1 0 -44 0M770 1392m-22 0a22 22 0 1 0 44 0a22 22 0 1 0 -44 0M700 1392L726 1360L760 1360L770 1392M726 1360L716 1350M752 1360L756 1346`} fill="none" stroke={C.post} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d={rrect(708, 1346, 18, 5, 2.5)} fill={C.snow} />
    </g>
  );
};

/** A walker with a dog on the far pavement (C: flat, no line, slow). */
const Walker: React.FC<{x: number; y: number; dir: 1 | -1; T: number}> = ({x, y, dir, T}) => {
  const step = Math.sin(T * 5.2) * 2.6;
  const coat = '#7B6C9A';
  return (
    <g>
      <path d={`M${f1(x - 2)} ${f1(y - 14)}L${f1(x - 2 + step)} ${y}M${f1(x + 2)} ${f1(y - 14)}L${f1(x + 2 - step)} ${y}`} stroke={'#4A5478'} strokeWidth={3.2} strokeLinecap="round" />
      <path d={rrect(x - 7, y - 34, 14, 22, 5)} fill={coat} />
      <path d={ellD(x, y - 38, 4.6, 4.8)} fill={'#C98A64'} />
      <path d={rrect(x - 5, y - 45, 10, 6, 3)} fill={'#A8492F'} />
      {/* the dog, a step ahead on its lead */}
      <path d={rrect(x + dir * 14 - 8, y - 10, 16, 7, 3.5) + ellD(x + dir * 23, y - 11, 3.6, 3.4)} fill={'#8E5A40'} />
      <path d={`M${f1(x + dir * 7)} ${f1(y - 22)}Q${f1(x + dir * 14)} ${f1(y - 14)} ${f1(x + dir * 21)} ${f1(y - 12)}`} stroke={'#4A5478'} strokeWidth={1.2} fill="none" />
    </g>
  );
};

// ---------------------------------------------------------------- the three planes together (for previews)

/** The whole outside through three plane matrices (a camera hands them; identity = H2 at rest). The sky is NOT here:
 *  it is the World's flat background. */
export const OutsidePlanes: React.FC<{far?: Mat; town?: Mat; street?: Mat}> = ({far = mat.I, town = mat.I, street = mat.I}) => (
  <PlaneCamsProvider value={{far, town, street}}>
    <XG m={far}>
      <OutsideFar />
    </XG>
    <XG m={town}>
      <OutsideTown />
    </XG>
    <XG m={street}>
      <OutsideStreet />
    </XG>
  </PlaneCamsProvider>
);
void useTime;
