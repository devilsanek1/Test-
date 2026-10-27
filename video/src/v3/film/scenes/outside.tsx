// scenes/outside.tsx: THE OUTSIDE at H2 (the WINDOW lane owns it; docs/v3/flow_v2.md §3): one geography seen from our
// window, standing at the glass. SQD draws it through its own camera (the pull-back lands on it), SQE and SQF through
// h2_window's cameras; every builder draws it read-only, on FILM time (each plane reads useFilmT(), film seconds even
// inside another FilmClock, and gives its kit pieces film time), so the frames match bit for bit across J4 and J5.
//
// H2 at rest (canvas px): flat sky behind the caption band (white captions); horizon y 930: THE DATA CENTER (S9's hall,
// dark, its sign lit) w 330 at x 230-560, THE MOUNTAIN (S9's PeakPile re-laid: summit (800, 640), crest sticks ~26 px,
// the summit stick a kit MemoryStick for SQD's x27 start) behind its right side and past the right edge; the town
// 930-1040 with the road from our street (x ~300) up to the data center; OUR STREET 1040-1250: the chip factory's wall
// x 330-950 (y 1000-1090) with its lit gate x 480-640, the booth on its left, the floodlight's pool (560, 1200) rx 230
// ry 55, the notice x 680-880 (y 1010-1150), the waiting lane x 720-940 (y 1140-1240); the sill is h2_window's.
// Planes (each a camera plane of its own: entryCam / pushCam scale them differently): OutsideFar (sky, clouds,
// mountain, data center), OutsideTown (the town, the road up, the factory behind its wall), OutsideStreet (the street
// and everything on it).
//
// The street's timeline (film seconds; flow_v2 §4 SQE / SQF): the two DC trucks A and B stand in the pool from the
// start (J4: nothing new moves 22.28-23.08); 23.10-24.20 two workers carry crates into A; 24.20 the barrier lifts, A
// drives up the road (24.30-25.45, shrinking into the data center's gate) as B rolls up to the gate (24.30-25.20); OUR
// VAN waits unlit at the head of the lane, rolls into the pool 25.72-26.20 (lit at last), ONE small crate lands on its
// roof on "left" 26.04; the van behind shuffles up 26.25-26.75; 27.08 the notice's 5x face swings on; 29.20-29.85 our
// van drives along the near kerb to x ~420; 29.90-30.25 its crate hops over the sill into the listing laptop (the
// thread plane's ~(171, 1236)); 30.40-31.20 it leaves left; 31.40-32.84 the BETTER van joins the back of the queue;
// 33.50-34.40 B leaves up the road; 34.60 the notice flips to 2027; 35.22-36.25 two DC trucks overtake the BETTER van
// (nudged back 35.62) and take the pool; 36.98 the data center's sign steps up one value (SQF), then the street holds,
// alive and calm. Tiers follow the beat (flow_v2 §5): the beat's subject gets the one outline and the motion.
import React, {createContext, useContext, useId} from 'react';
import {TimeProvider, clamp, ease, prog, useTime} from '../../../lib/time';
import {mat, XG, type Mat} from '../../../lib/xf';
import {rng} from '../../../lib/rng';
import {Tier} from '../../../lib/tier';
import {useFilmTime} from '../../../lib/sequence';
import {EMBER, BirdV, SnowLayers, windowLit, puffs, Txt, type Pt} from '../kit';
import {ContactShadow, LightPool, Lit, RIGS, ShadowLayer, mixHex, useLightOff, withKey, streetLamp} from '../kit/Light';
import {CrateBox, CrateFlight, crateFlightPose, ellD, FleetVan, fleetVanGeo, NoticeFlip, rrect, roundPoly, type FleetVariant} from '../kit/Fleet';
import {CornerCloud, HighClouds, CloudBank, FarGround, InfinityLine, FarField, HallB, HallPlume, HallFans, Hall, HALL, HALL_GEO, HORIZON as S9_HORIZON} from './S9_far';
import {RevealPeak, J3Stick, J3StickLight} from './SQD_peak';
import {RevealBirds} from './SQD_life';

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

// ---------------------------------------------------------------- the layout (H2 canvas px at rest)

export const H2_HORIZON = 930;
/** THE data center (S9's hall re-laid: dark, sign lit): base centre and width. */
export const H2_DC = {x: 395, y: 930, w: 330};
/** THE summit stick (the one that left your laptop; SQD's x27 start: its planeMat o): centre, width, rotation. */
export const H2_SUMMIT = {x: 800, y: 640 - (700 / 27) * 0.155, w: 700 / 27, rot: -4};
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
/** Where the van's crate lands in the thread plane's listing laptop (screen px at H2 rest; LEFT spot). */
export const H2_CRATE_TO: Pt = [171, 1236];

/** Film-time beats of the street (flow_v2 §4). */
export const H2_BEATS = {
  load: 23.1,
  barrier: 24.2,
  aGo: 24.3,
  vanIn: 25.72,
  vanInEnd: 26.2,
  crate: 26.04,
  fiveX: 27.08,
  vanGo: 29.2,
  vanKerb: 29.85,
  hop: 29.9,
  hopEnd: 30.25,
  ding: 30.28,
  vanLeave: 30.4,
  better: 31.4,
  betterEnd: 32.84,
  bGo: 33.5,
  flip: 34.6,
  trucks: 35.22,
  trucksEnd: 36.25,
  nudge: 35.62,
  sign: 36.98,
};

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
/** The road's mouth on our street and its top at the data center's gate. */
const ROAD_UP: Key[] = [
  {t: 0, p: [455, Y_POOL], k: 1},
  {t: 0, p: [398, 1124], k: 0.8},
  {t: 0, p: [316, 1056], k: 0.52},
  {t: 0, p: [352, 990], k: 0.32},
  {t: 0, p: [388, 936], k: 0},
];

export type Vehicle = {id: string; variant: FleetVariant; x: number; y: number; k: number; dir: 1 | -1; line: boolean; roll: number; crate?: boolean};

/** Every vehicle on the street at film time T (back to front by ground y). */
export function vehiclesAt(T: number): Vehicle[] {
  const B = H2_BEATS;
  const out: Vehicle[] = [];
  const roll = (x: number, k = 1) => (-x / (VAN_W * 0.085 * k)) % (Math.PI * 2);
  // A: loads at the gate, leaves up the road on "first dibs"
  if (T < B.aGo + 1.2) {
    const a = drive(T, B.aGo, B.aGo + 1.15, ROAD_UP, ease.inOutSine);
    if (a.k > 0.04) out.push({id: 'A', variant: 'dc', x: a.p[0], y: a.p[1], k: a.k, dir: -1, line: T >= B.load - 0.1 && T < B.vanIn - 0.4, roll: roll(a.p[0], a.k)});
  }
  // B: behind A in the pool, rolls up to the gate, loads, leaves up the road while chip makers speak (33.50)
  if (T < B.bGo + 1.2) {
    const b1 = drive(T, B.aGo, B.aGo + 0.9, [{t: 0, p: [675, Y_POOL]}, {t: 0, p: [455, Y_POOL]}], ease.inOutCubic);
    const b2 = drive(T, B.bGo, B.bGo + 1.15, ROAD_UP, ease.inOutSine);
    const q = T < B.bGo ? b1 : b2;
    if (q.k > 0.04) out.push({id: 'B', variant: 'dc', x: q.p[0], y: q.p[1], k: q.k, dir: -1, line: false, roll: roll(q.p[0], q.k)});
  }
  // OUR VAN: waits unlit at the head of the lane; into the pool; the kerb; the hop; away left
  {
    let q: {p: Pt; k: number};
    if (T < B.vanGo) q = drive(T, B.vanIn, B.vanInEnd, [{t: 0, p: [805, Y_LANE]}, {t: 0, p: [740, 1226]}, {t: 0, p: [680, Y_POOL]}], ease.inOutCubic);
    else if (T < B.vanLeave) q = drive(T, B.vanGo, B.vanKerb, [{t: 0, p: [680, Y_POOL]}, {t: 0, p: [592, 1244]}, {t: 0, p: [420, Y_KERB]}], ease.inOutCubic);
    else q = drive(T, B.vanLeave, B.vanLeave + 0.8, [{t: 0, p: [420, Y_KERB]}, {t: 0, p: [-170, Y_KERB]}], ease.inCubic);
    const on = (T >= B.vanIn - 0.1 && T < B.vanInEnd + 0.5) || (T >= B.vanGo - 0.1 && T < B.ding + 0.1);
    if (q.p[0] > -160) out.push({id: 'van', variant: 'van', x: q.p[0], y: q.p[1], k: 1, dir: -1, line: on, roll: roll(q.p[0]), crate: T >= B.crate && T < B.hop});
  }
  // the van behind ours shuffles up to the head of the lane
  {
    const q = drive(T, 26.25, 26.75, [{t: 0, p: [950, Y_LANE]}, {t: 0, p: [805, Y_LANE]}], ease.inOutCubic);
    out.push({id: 'van2', variant: 'van', x: q.p[0], y: q.p[1], k: 1, dir: -1, line: false, roll: roll(q.p[0])});
  }
  // the BETTER van joins the back of the queue; the trucks nudge it back
  if (T >= B.better - 0.05) {
    const q = drive(T, B.better, B.betterEnd, [{t: 0, p: [1190, 1244]}, {t: 0, p: [885, 1244]}], ease.outCubic);
    const nudge = 26 * ease.outBack(1.6)(prog(T, B.nudge, 0.22));
    out.push({id: 'better', variant: 'better', x: q.p[0] + nudge, y: q.p[1], k: 1, dir: -1, line: (T < B.betterEnd + 0.3) || (T >= B.trucks && T < B.trucksEnd), roll: roll(q.p[0] + nudge)});
  }
  // two DC trucks overtake the queue along the near kerb and take the pool
  if (T >= B.trucks - 0.05) {
    const lane = (x0: number, x1: number): Key[] => [{t: 0, p: [x0, 1252]}, {t: 0, p: [980, 1252]}, {t: 0, p: [x1 + 120, 1236]}, {t: 0, p: [x1, Y_POOL]}];
    const c = drive(T, B.trucks, B.trucksEnd, lane(1200, 455), ease.inOutSine);
    const d = drive(T, B.trucks + 0.1, B.trucksEnd + 0.08, lane(1420, 675), ease.inOutSine);
    const lit = T >= B.flip && T < B.trucksEnd + 0.1;
    out.push({id: 'C', variant: 'dc', x: c.p[0], y: c.p[1], k: 1, dir: -1, line: lit, roll: roll(c.p[0])});
    out.push({id: 'D', variant: 'dc', x: d.p[0], y: d.p[1], k: 1, dir: -1, line: lit, roll: roll(d.p[0])});
  }
  return out.sort((p, q) => p.y - q.y);
}

/** Where the van's crate sits on its roof (canvas px), at film time T. */
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
const ap = (m: Mat, p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
/** The data center's lit sign in H2 px (the sign step at 36.98 frames it). */
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

/** The far plane, back to front: the clouds, the far ground, THE MOUNTAIN (the REVEAL lane's kit-shaped pile, summit
 *  (800, 640)) with the summit stick, hall B and its plume, `streams` (SQD's stick streams: a slot), the hall's fans and
 *  THE DATA CENTER (dark, its sign lit: the brightest cold light), the infinity line, the far field's roofs (the town
 *  covers their foot). From 36.98 the sign steps up one value (one lighter frame round the panel: no glow disc).
 *  `summit` = draw the summit stick (SQD draws its own J3 stick in screen px); `birds` = the reveal's V of birds
 *  (SQD_life's RevealBirds, from 21.30). */
export const OutsideFar: React.FC<{streams?: React.ReactNode; summit?: boolean; birds?: boolean}> = ({streams, summit = true, birds = true}) => {
  const T = useFilmT();
  const signUp = T >= H2_BEATS.sign;
  const s = H2_SIGN;
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
          <HallB />
          <HallPlume />
        </XG>
        {streams}
        <XG m={S9_TO_H2}>
          <HallFans />
        </XG>
      </Tier>
      {signUp ? <path d={rrect(s.x - 7, s.y - 7, s.w + 14, s.h + 14, 5)} fill={mixHex(EMBER.led, EMBER.sky, 0.45)} /> : null}
      <Tier tier={T >= H2_BEATS.sign - 0.1 && T < 38.7 ? 'subject' : 'support'} bg={EMBER.sky}>
        <XG m={S9_TO_H2}>
          <Hall />
        </XG>
      </Tier>
      <Tier tier="environment" bg={EMBER.sky}>
        <XG m={S9_TO_H2}>
          <InfinityLine />
          <FarField />
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

const HouseRow: React.FC<{hs: House[]; seed: string; T: number}> = ({hs, seed, T}) => {
  const lit = useLightOff() ? EMBER.houseLit : '#FFD27A';
  let n = 0;
  hs.forEach((h) => (n += h.wins.length));
  let k = 0;
  return (
    <>
      {hs.map((h, i) => {
        const peak = h.base - h.h - h.roof;
        const body = roundPoly([[h.x, h.base], [h.x, h.base - h.h], [h.x + h.w / 2, peak], [h.x + h.w, h.base - h.h], [h.x + h.w, h.base]], [0, 2, 2, 2, 0]);
        const cap = roundPoly([[h.x - 3, h.base - h.h + 3], [h.x + h.w / 2, peak - 3], [h.x + h.w + 3, h.base - h.h + 3], [h.x + h.w + 1, h.base - h.h + 8], [h.x + h.w / 2, peak + 5], [h.x - 1, h.base - h.h + 8]], 2);
        return (
          <g key={i}>
            <path d={body} fill={h.color} />
            <path d={cap} fill={EMBER.snow} />
            {h.wins.map((w, j) => {
              const on = windowLit(T, seed, k, n, {gap: [0.9, 2.2], litFrac: 0.7});
              k++;
              return <path key={j} d={rrect(w[0], w[1], w[2], w[3], 1.5)} fill={on ? lit : mixHex(h.color, EMBER.sky, 0.4)} />;
            })}
          </g>
        );
      })}
    </>
  );
};

/** The chip factory behind its wall (calm C: a step toward the sky, no line): a low sawtooth roof whose north
 *  glazing glows warm, snow on the long slopes, one chimney whose steam rises slowly and shrinks to nothing well under
 *  the caption band. */
const FAB = {x0: 600, x1: 944, base: 1004, h: 34, teeth: 4, tooth: 30, chim: {x: 896, w: 18, top: 900}};
const FAB_BRICK = mixHex(EMBER.brick, EMBER.sky, 0.3);
const FAB_SHADE = mixHex(EMBER.brickShade, EMBER.sky, 0.3);
const FactoryRoof: React.FC<{T: number}> = ({T}) => {
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
  const ps = puffs(T, {n: 4, life: 3.4, rise: 120, drift: 26, r0: 4, r1: 11, wobble: 3, seed: 'h2/fab', ceil: 700}, chim.top - 6);
  return (
    <>
      {ps.map((q, i) => (
        <path key={i} d={ellD(chim.x + chim.w / 2 + q.x, chim.top - 6 + q.y, q.r * 1.25, q.r)} fill={mixHex(EMBER.snow, EMBER.sky, 0.3)} />
      ))}
      <path d={rrect(chim.x, chim.top, chim.w, base - chim.top, 2)} fill={FAB_SHADE} />
      <path d={rrect(chim.x - 3, chim.top - 4, chim.w + 6, 6, 2)} fill={EMBER.snow} />
      <path d={roof} fill={FAB_BRICK} />
      <path d={glaze} fill={useLightOff() ? EMBER.houseLit : '#F2C98E'} />
      <path d={snow} fill={EMBER.snow} />
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
        {/* the far snow under the town */}
        <path d={`M-400 ${H2_HORIZON}H1480V1100H-400Z`} fill={'#CDD3E8'} />
        <HouseRow hs={TOWN.back} seed="h2/townB" T={T} />
        {/* the road from our street up to the data center's gate: one trodden band, tiny lamps along it */}
        <path d={`M250 1092C262 1050 300 1010 342 978C368 958 384 944 392 932L404 932C400 946 392 962 378 984C352 1022 334 1058 338 1092Z`} fill={EMBER.road} />
        <path d={[[318, 1046], [346, 1000], [372, 962]].map(([x, y]) => ellD(x, y, 2.6, 2.6)).join('')} fill={'#FFE2B0'} />
        {onRoad}
        <HouseRow hs={TOWN.front} seed="h2/townF" T={T} />
        {/* the chip factory, behind its wall: a low sawtooth roof, its glazing lit, a chimney with slow soft steam */}
        <FactoryRoof T={T} />
      </Tier>
    </FilmClock>
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
  // which truck they load, and how fast (the subject's beat 23.10-24.20 fast; B and later C/D at a calm pace)
  const target = T < B.aGo ? 'A' : T < B.bGo ? 'B' : 'C';
  const back = backOf(target);
  const fast = T >= B.load && T < B.aGo;
  const period = fast ? 1.1 : 2.6;
  const start = fast ? B.load : target === 'B' ? B.aGo + 1.3 : B.trucksEnd + 0.4;
  return [0, 0.5].map((ph, i) => {
    const idle: Pt = [G[0] + (i ? 30 : -14), G[1] + 6];
    if (!back || T < start || (target === 'B' && T > B.bGo - 0.6) || (target === 'C' && T < B.trucksEnd + 0.4)) {
      return {x: idle[0], y: idle[1], h: 40, walk: 0, carry: false, face: 1 as const};
    }
    const c = (((T - start) / period + ph) % 1 + 1) % 1;
    // out carrying (0-0.45), in empty (0.5-0.95), short holds at each end
    const out = c < 0.5;
    const s = out ? ease.inOutSine(clamp(c / 0.45)) : 1 - ease.inOutSine(clamp((c - 0.5) / 0.45));
    const x = idle[0] + (back[0] - idle[0]) * s;
    const y = idle[1] + (back[1] - idle[1]) * s;
    const moving = (out ? c < 0.45 : c < 0.95);
    return {x, y, h: 40 + 6 * s, walk: moving ? (T - start) * 1.7 : 0, carry: out, face: (out ? 1 : -1) as 1 | -1};
  });
}

/** The 5x face: last year | now bars (S11's), "~5x", the source. Face-local px (200 x ~122). */
const FaceFiveX: React.FC = () => (
  <>
    <path d={rrect(16, 76, 26, 18, 2)} fill={EMBER.boardDeep} />
    <path d={rrect(52, 14, 26, 80, 2)} fill={EMBER.anchor} />
    <path d={`M10 95H86`} stroke={EMBER.beam} strokeWidth={2} />
    <Txt x={29} y={110} size={13} fill={EMBER.ink}>
      last year
    </Txt>
    <Txt x={65} y={110} size={13} fill={EMBER.ink}>
      now
    </Txt>
    <Txt x={144} y={78} size={72} fill={EMBER.ink} fit={108}>
      ~5x
    </Txt>
    <Txt x={144} y={104} size={22} fill={EMBER.beam} fit={110}>
      RAM chips
    </Txt>
    <Txt x={100} y={-4} size={1} fill={EMBER.card}>
      {' '}
    </Txt>
  </>
);
const FaceFiveXSource: React.FC = () => (
  <Txt x={100} y={121} size={11} fill={EMBER.beam} fit={190}>
    RAM chips · Gartner, Q2 2026
  </Txt>
);
/** The 2027 face: "2027" big, Micron's line small. */
const Face2027: React.FC = () => (
  <>
    <Txt x={100} y={78} size={84} fill={EMBER.ink} fit={184}>
      2027
    </Txt>
    <Txt x={100} y={100} size={13} fill={EMBER.beam} fit={190}>
      Micron: supply 'much tighter'
    </Txt>
    <Txt x={100} y={116} size={13} fill={EMBER.beam} fit={190}>
      in 2027 and 2028 than in 2026
    </Txt>
  </>
);
/** The notice's first face: the gate's queue rule, quiet (a van icon and an arrow). */
const FaceQueue: React.FC = () => (
  <>
    <Txt x={100} y={50} size={30} fill={EMBER.beam} fit={170}>
      CHIP PICKUP
    </Txt>
    <path d={rrect(60, 70, 52, 30, 4) + rrect(112, 80, 22, 20, 4)} fill={EMBER.reveal} />
    <path d={ellD(74, 102, 6, 6) + ellD(124, 102, 6, 6)} fill={EMBER.beam} />
    <path d={`M44 85L30 85M36 79L30 85L36 91`} stroke={EMBER.beam} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
);

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

/** Our street: ground, the factory's wall and gate, the booth and barrier, the floodlight and its pool, the notice,
 *  the queue, the workers, the walkers, the snow. */
export const OutsideStreet: React.FC = () => {
  const T = useFilmT();
  const B = H2_BEATS;
  const off = useLightOff();
  const id = 'h2s' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const vs = vehiclesAt(T);
  const ws = workersAt(T);
  const rig = withKey(RIGS.street, RIGS.street.key, [streetLamp([H2_FLOOD.x + 20, H2_FLOOD.y + 12], [H2_POOL.cx, H2_POOL.cy])]);
  const G = H2_GATE;
  const W = H2_WALL;
  const crate = vanCrateAt(T);
  // faces of the notice: the queue rule, the 5x (27.08), 2027 (34.60)
  const faces = [
    {t: -99, node: <FaceQueue />},
    {t: B.fiveX, node: <><FaceFiveX /><FaceFiveXSource /></>},
    {t: B.flip, node: <Face2027 />},
  ];
  const noticeOn = (T >= B.fiveX - 0.1 && T < B.vanGo) || (T >= B.flip - 0.1 && T < B.trucks + 0.2);
  // the far pavement's walker and dog (left of the factory, slow), then a second walker the other way
  const walkerX = T < 31 ? 30 + (T - 22) * 30 : 300 - (T - 31) * 26;
  const walkerOn = (T > 22 && T < 31.2) || (T > 31.6 && T < 42);
  return (
    <FilmClock>
      <Lit rig={rig}>
        <Tier tier="environment" bg={EMBER.sky}>
          {/* the ground: far pavement, the road (one trodden step), the near kerb's snow bank */}
          <path d={`M-400 ${H2_STREET.top}H1480V1500H-400Z`} fill={'#C9CFE6'} />
          <path d={`M-400 1104H1480V1500H-400Z`} fill={EMBER.road} />
          <path d={`M-400 1146H1480V1150H-400ZM-400 1196H1480V1200H-400Z`} fill={mixHex(EMBER.road, '#C9CFE6', 0.5)} />
          {/* the corner house on our side, left of the road's mouth (warm: ours), one lit window */}
          <path d={rrect(-40, 990, 228, 104, 3)} fill={'#9A5A46'} />
          <path d={roundPoly([[-50, 994], [70, 952], [200, 994], [194, 1002], [-44, 1002]], 3)} fill={EMBER.snow} />
          <path d={rrect(40, 1020, 34, 40, 2) + rrect(118, 1020, 34, 40, 2)} fill={off ? EMBER.houseLit : '#FFD27A'} />
          {/* the factory's wall (warm brick) with its snow cap; the gate's lit yard: a stack of crates inside */}
          <path d={rrect(W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0 + 4, 3)} fill={EMBER.brick} />
          <path d={rrect(W.x0 - 4, W.y0 - 6, W.x1 - W.x0 + 8, 9, 4)} fill={EMBER.snow} />
          <path d={`M${W.x0} ${W.y0 + 34}H${W.x1}V${W.y0 + 37}H${W.x0}ZM${W.x0} ${W.y0 + 64}H${W.x1}V${W.y0 + 67}H${W.x0}Z`} fill={EMBER.brickShade} />
          <path d={rrect(G.x0, G.y0, G.x1 - G.x0, G.y1 - G.y0 + 2, 4)} fill={off ? EMBER.houseLit : '#F7CB8E'} />
          <path d={rrect(G.x0 + 16, G.y0 + 34, 40, 38, 2) + rrect(G.x0 + 60, G.y0 + 44, 36, 28, 2)} fill={'#C98A64'} />
          <path d={rrect(G.x0 + 22, G.y0 + 28, 30, 8, 2) + rrect(G.x0 + 64, G.y0 + 38, 28, 8, 2)} fill={EMBER.board} />
          {/* the booth on the gate's left: a lit window, the guard's silhouette inside */}
          <path d={rrect(H2_BOOTH.x0, H2_BOOTH.y0, H2_BOOTH.x1 - H2_BOOTH.x0, H2_BOOTH.y1 - H2_BOOTH.y0, 3)} fill={EMBER.wall} />
          <path d={rrect(H2_BOOTH.x0 - 4, H2_BOOTH.y0 - 8, H2_BOOTH.x1 - H2_BOOTH.x0 + 8, 10, 4)} fill={EMBER.dcSide} />
          <path d={rrect(H2_BOOTH.x0 - 5, H2_BOOTH.y0 - 13, H2_BOOTH.x1 - H2_BOOTH.x0 + 10, 7, 3.5)} fill={EMBER.snow} />
          <path d={rrect(H2_BOOTH.x0 + 8, H2_BOOTH.y0 + 10, 30, 24, 2)} fill={off ? EMBER.houseLit : '#FFD27A'} />
          <path d={ellD(H2_BOOTH.x0 + 22, H2_BOOTH.y0 + 22, 5, 5.5) + rrect(H2_BOOTH.x0 + 14, H2_BOOTH.y0 + 27, 16, 8, 3)} fill={'#C98A64'} />
        </Tier>
        {/* the floodlight's pool on the street: THE light outside (two flat steps, lighter and warmer than the snow) */}
        <LightPool pool={H2_POOL} colors={['#E2D6D6', '#F2E2CF']} />
        <Tier tier="environment" bg={EMBER.sky}>
          {/* the floodlight on the wall over the gate (its lit face the source core) */}
          <path d={rrect(H2_FLOOD.x - 3, H2_FLOOD.y - 8, 6, 14, 2)} fill={EMBER.anchor} />
          <path d={roundPoly([[H2_FLOOD.x - 18, H2_FLOOD.y + 2], [H2_FLOOD.x + 18, H2_FLOOD.y + 2], [H2_FLOOD.x + 13, H2_FLOOD.y + 16], [H2_FLOOD.x - 13, H2_FLOOD.y + 16]], 3)} fill={EMBER.dcSide} />
          <path d={rrect(H2_FLOOD.x - 12, H2_FLOOD.y + 12, 24, 5, 2)} fill={EMBER.core} />
          {/* the street lamp at the road's mouth (a practical: its lantern, one halo step on the wall/sky) */}
          <path d={rrect(229, 966, 6, 128, 3)} fill={EMBER.dcSide} />
          <path d={rrect(222, 956, 20, 14, 4)} fill={EMBER.core} />
          <path d={rrect(220, 951, 24, 6, 3)} fill={EMBER.snow} />
        </Tier>
        <ShadowLayer>
          {/* contact shadows: the booth, the notice's posts, every vehicle (16 px), the workers */}
          <ContactShadow x={(H2_BOOTH.x0 + H2_BOOTH.x1) / 2} y={H2_BOOTH.y1} w={H2_BOOTH.x1 - H2_BOOTH.x0} h={8} />
          <ContactShadow x={H2_NOTICE.x + H2_NOTICE.w * 0.15} y={H2_NOTICE.ground} w={14} h={6} />
          <ContactShadow x={H2_NOTICE.x + H2_NOTICE.w * 0.85} y={H2_NOTICE.ground} w={14} h={6} />
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
        <NoticeFlip x={H2_NOTICE.x} y={H2_NOTICE.y} w={H2_NOTICE.w} h={H2_NOTICE.h} ground={H2_NOTICE.ground} faces={faces} line={noticeOn} />
        {/* the far pavement's walkers (C: no line, slow) */}
        {walkerOn ? <Walker x={walkerX} y={1098} dir={T < 31 ? 1 : -1} T={T} /> : null}
        {/* the workers, the vehicles, the barrier: back to front */}
        {ws.map((w, i) => (w.y < 1150 ? <Worker key={`wb${i}`} {...w} /> : null))}
        {vs.map((v) => (
          <React.Fragment key={v.id}>
            <FleetVan x={v.x} y={v.y} w={VAN_W * v.k} variant={v.variant} dir={v.dir} line={v.line} roll={v.roll} lift={off || v.variant === 'dc' ? 0 : poolLift(v.x, v.y, VAN_W * v.k)} />
            {v.crate && crate ? <CrateBox x={crate.x} y={crate.y} w={crate.w} line={T >= B.vanGo - 0.1} /> : null}
          </React.Fragment>
        ))}
        {ws.map((w, i) => (w.y >= 1150 ? <Worker key={`wf${i}`} {...w} /> : null))}
        {/* slow life in the queue: soft exhaust puffs at the waiting vans' tails (C: small, slow, shrink to nothing) */}
        {vs.filter((v) => v.id === 'van2' || v.id === 'better').map((v) =>
          puffs(T, {n: 3, life: 2.4, rise: 26, drift: 22, r0: 2, r1: 6, wobble: 2, seed: `h2/ex/${v.id}`}).map((q, i) => (
            <path key={`${v.id}${i}`} d={ellD(v.x + VAN_W / 2 + 6 + q.x, v.y - 8 + q.y, q.r * 1.3, q.r)} fill={mixHex(EMBER.snow, EMBER.road, 0.35)} />
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
          <path d={rrect(334, 1155, 118, 10, 4)} fill={EMBER.snow} />
          <path d={[0, 2, 4].map((i) => rrect(334 + 10 + i * 20, 1155, 18, 10, 1)).join('')} fill={EMBER.beam} />
        </XG>
        <path d={rrect(328, 1150, 12, 52, 3)} fill={EMBER.dcSide} />
        {/* falling snow (far + mid), kept under the caption band */}
        <clipPath id={id}>
          <rect x={-200} y={612} width={1480} height={1400} />
        </clipPath>
        <g clipPath={`url(#${id})`}>
          <SnowLayers x={-60} y={560} w={1200} h={760} layers={['far', 'mid']} density={0.5} band={null} seed="h2/snow" />
        </g>
        {/* birds: one small V crossing high and slow while the chip makers speak (C) */}
        <BirdV at={32.9} from={[-40, 700]} to={[460, 668]} dur={3.2} />
      </Lit>
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

/** The hop: from the van's roof over the sill into the listing laptop (29.90-30.25, shrinking into the screen), in
 *  SCREEN px (the push has released by 29.60: the street plane is at rest). `to` = the thread plane's listing laptop
 *  screen (default H2_CRATE_TO). Drawn ABOVE the front plane (it lands in the phone): <CrateHop> in the sequence. */
export function crateHop(T: number, to: Pt = H2_CRATE_TO) {
  const c = vanCrateAt(H2_BEATS.hop - 1 / 60);
  if (!c) return null;
  return crateFlightPose(T, {from: [c.x, c.y - 10], to, t0: H2_BEATS.hop, t1: H2_BEATS.hopEnd, arc: 90, w0: 34, w1: 16, rot0: 0, rot1: -14});
}

/** The crate's hop drawn in screen px over the front plane (the subject's outline). */
export const CrateHop: React.FC<{to?: Pt}> = ({to}) => {
  const T = useFilmT();
  const q = crateHop(T, to);
  return q ? <CrateBox x={q.x} y={q.y + (q.w * 0.62) / 2} w={q.w} rot={q.rot} line /> : null;
};

/** A small car on the street's far side (36.4-41.2, right to left at ~105 px/s): a flat body, a cabin, two lit
 *  headlights' dots; C tier, behind everything in the pool. */
const FarCar: React.FC<{T: number}> = ({T}) => {
  if (T < 36.4 || T > 41.2) return null;
  const x = 1150 - (T - 36.4) * 105;
  const y = 1132;
  return (
    <g>
      <path d={roundPoly([[x - 34, y - 14], [x - 20, y - 26], [x + 14, y - 26], [x + 26, y - 14], [x + 36, y - 12], [x + 36, y], [x - 36, y]], 5)} fill={'#8E6A88'} />
      <path d={roundPoly([[x - 16, y - 23], [x + 11, y - 23], [x + 20, y - 15], [x - 25, y - 15]], 3)} fill={'#7D8AB6'} />
      <path d={rrect(x - 22, y - 30, 30, 5, 2.5)} fill={EMBER.snow} />
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
const OurPavement: React.FC = () => {
  const pale = '#D3D8EC';
  const post = mixHex(EMBER.dcSide, EMBER.sky, 0.25);
  return (
    <g>
      <path d={`M-200 1262H1280V1560H-200Z`} fill={pale} />
      <path d={PAVE.stones} fill={mixHex(EMBER.road, pale, 0.3)} />
      <path d={PAVE.bank} fill={EMBER.snow} />
      <path d={PAVE.prints} fill={mixHex(pale, EMBER.road, 0.55)} />
      {PAVE.bollards.map((b, i) => (
        <g key={i}>
          <path d={ellD(b.x, b.base, 16, 4)} fill={mixHex(pale, EMBER.road, 0.7)} />
          <path d={rrect(b.x - 7, b.top, 14, b.base - b.top, 4)} fill={post} />
          <path d={rrect(b.x - 9, b.top - 4, 18, 7, 3.5)} fill={EMBER.snow} />
        </g>
      ))}
      {/* a bench (seat and back, snow on both) and a parked bike against the fourth bollard */}
      <path d={rrect(410, 1388, 150, 10, 3) + rrect(410, 1350, 150, 9, 3)} fill={EMBER.beam} />
      <path d={rrect(420, 1398, 8, 30, 2) + rrect(542, 1398, 8, 30, 2) + rrect(424, 1359, 6, 30, 2) + rrect(540, 1359, 6, 30, 2)} fill={mixHex(EMBER.beam, EMBER.anchor, 0.4)} />
      <path d={rrect(410, 1345, 150, 6, 3) + rrect(410, 1383, 150, 6, 3)} fill={EMBER.snow} />
      <path d={ellD(485, 1430, 82, 6)} fill={mixHex(pale, EMBER.road, 0.6)} />
      <path d={`M700 1392m-22 0a22 22 0 1 0 44 0a22 22 0 1 0 -44 0M770 1392m-22 0a22 22 0 1 0 44 0a22 22 0 1 0 -44 0M700 1392L726 1360L760 1360L770 1392M726 1360L716 1350M752 1360L756 1346`} fill="none" stroke={post} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d={rrect(708, 1346, 18, 5, 2.5)} fill={EMBER.snow} />
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
  <>
    <XG m={far}>
      <OutsideFar />
    </XG>
    <XG m={town}>
      <OutsideTown />
    </XG>
    <XG m={street}>
      <OutsideStreet />
    </XG>
  </>
);
