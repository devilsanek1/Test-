// S9_far (S9 lane, G5b): the far plane of the pull-back (S9_FAR, k 1.11, sliding 1 W from the right), dressed for
// the scale end frame (docs/v3/s9_scale_plan.md section 1; CINEMATIC_GUIDE "Scale cues"): the corner cloud, the hero
// cloud bank on its glow strip (the hall and the mountain stand on the palest shape), the hill town of the start slot,
// the infinity line with a second data center, the far field (six rows of tiny roofs into haze: the detail peak), the
// campus (the hall with its fan run and LED grid, hall B with its plume, pylons marching off the right edge).
// All in END-frame coordinates (screen at rest). Far planes: fill only (no ink), fewer values, mixed toward skyLow.
// Static geometry is computed once at module load (deterministic) and drawn as a few raw paths per colour.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {blob} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {EMBER, TownBand, DataCenter, dataCenterGeo, CoolingPlume, type HouseSpec} from '../kit';
import {T9, mix, planeTone} from './S9_tones';

type Pt = [number, number];
const f1 = (v: number) => v.toFixed(1);
const polyD = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + 'Z';
const rectD = (x: number, y: number, w: number, h: number) => `M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`;
const smooth01 = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

// ---------------------------------------------------------------- the frame's numbers (end coords)
export const HORIZON = 960;
export const HALL = {x: 460, y: 1005, w: 380, h: 210};
export const HALL_GEO = dataCenterGeo(HALL.x, HALL.y, HALL.w, HALL.h, 'dark', 52);
export const HALL_ROOF = HALL_GEO.top; // 795
/** The far ground's top: the hill of the start slot on the left (houses step down it), level at the horizon from x -150. */
export const groundTop = (x: number) => (x <= -300 ? 896 : x >= -150 ? HORIZON : 896 + ((x + 300) / 150) * (HORIZON - 896));

// ---------------------------------------------------------------- the corner cloud (cut by the top and right edges)
const CORNER = (() => {
  const pts: Pt[] = [[1240, -140], [600, -140], [604, -40], [626, 20], [664, 58], [716, 82], [770, 112], [830, 150], [900, 176], [972, 196], [1050, 214], [1140, 226], [1240, 232]];
  const body = polyD(pts);
  // the lit underside: a sliver along the lower-left edge (skyLow), thick in the middle
  const lower = pts.slice(2, 12);
  const inner = lower.map(([x, y], i): Pt => {
    const u = i / (lower.length - 1);
    const th = 4 + 12 * Math.sin(u * Math.PI);
    return [x + th * 0.35, y - th];
  });
  const rim = polyD([...lower, ...inner.reverse()]);
  return {body, rim};
})();

export const CornerCloud: React.FC = () => {
  const t = useTime();
  const dx = t * 4; // 4 px/s to the right (slow tier)
  return (
    <g transform={`translate(${f1(dx)} 0)`}>
      <path d={CORNER.body} fill={T9.cloud} />
      <path d={CORNER.rim} fill={EMBER.skyLow} />
    </g>
  );
};

/** Two flat cloud bars high over the start slot (far x -900..-80, y <= 275: above the caption band; at p 0 they sit in
 *  the start's sky, at p 1 they have slid off the left edge, leaving the end frame its one corner cloud). */
const HIGH = [
  {cx: -620, cy: 214, rx: 210, ry: 34},
  {cx: -250, cy: 150, rx: 150, ry: 26},
  {cx: -820, cy: 120, rx: 120, ry: 22},
];
const HIGH_D = (() => {
  let body = '';
  let rim = '';
  HIGH.forEach((c, i) => {
    const pts: Pt[] = [];
    for (let k = 0; k <= 24; k++) {
      const u = k / 24;
      const x = c.cx - c.rx + u * 2 * c.rx;
      const bump = Math.abs(Math.sin(u * Math.PI * (3 + (i % 2)))) * c.ry * 0.5;
      pts.push([x, c.cy - Math.sin(u * Math.PI) * c.ry - bump * Math.sin(u * Math.PI)]);
    }
    body += polyD([...pts, [c.cx + c.rx, c.cy + 2], [c.cx - c.rx, c.cy + 2]]);
    rim += rectD(c.cx - c.rx * 0.8, c.cy - 4, c.rx * 1.6, 6);
  });
  return {body, rim};
})();
export const HighClouds: React.FC = () => {
  const t = useTime();
  return (
    <g transform={`translate(${f1(t * 7)} 0)`}>
      <path d={HIGH_D.body} fill={T9.cloud} />
      <path d={HIGH_D.rim} fill={EMBER.skyLow} />
    </g>
  );
};

// ---------------------------------------------------------------- the hero cloud bank and its glow strip
type Lobe = {cx: number; w: number; top: number; h: number};
const LOBES: Lobe[] = [
  // the start slot (far x -775..-343 at p 0): gentle lobes at the old pale band's height (~790), so the start holds
  {cx: -1150, w: 300, top: 784, h: 18},
  {cx: -900, w: 320, top: 778, h: 20},
  {cx: -640, w: 360, top: 782, h: 22},
  {cx: -400, w: 300, top: 776, h: 20},
  // rising into the reveal: the biggest lobes behind the hall (top >= 622: at p 0.22, when they slide in, the far map
  // lifts them 8 %, and they must stay under the caption band), ~760 behind the mountain
  {cx: -170, w: 300, top: 730, h: 60},
  {cx: 60, w: 250, top: 682, h: 80},
  {cx: 250, w: 290, top: 640, h: 96},
  {cx: 470, w: 400, top: 624, h: 110},
  {cx: 690, w: 260, top: 676, h: 84},
  {cx: 880, w: 300, top: 742, h: 70},
  {cx: 1100, w: 300, top: 760, h: 60},
  {cx: 1340, w: 320, top: 776, h: 40},
];
const BANK_X0 = -1320;
const BANK_X1 = 1560;
const lobeY = (L: Lobe, x: number) => {
  const u = (x - L.cx) / (L.w / 2);
  if (Math.abs(u) >= 1) return Infinity;
  return L.top + L.h * (1 - Math.sqrt(1 - u * u));
};
const BANK = (() => {
  const step = 5;
  const top: Pt[] = [];
  const rimRuns: Pt[][] = [];
  let run: Pt[] = [];
  let runIn: Pt[] = [];
  for (let x = BANK_X0; x <= BANK_X1; x += step) {
    let y = 800;
    let li = -1;
    LOBES.forEach((L, i) => {
      const ly = lobeY(L, x);
      if (ly < y) {
        y = ly;
        li = i;
      }
    });
    top.push([x, y]);
    // the crown rim: the upper part of each lobe on the silhouette, tapering out (frost, 15-25 % of the lobe)
    const L = li >= 0 ? LOBES[li] : null;
    const k = L ? 1 - (y - L.top) / (L.h * 0.42) : 0;
    if (L && L.h >= 40 && k > 0) {
      const th = 3 + L.h * 0.13 * k;
      run.push([x, y - 0.5]);
      runIn.push([x + 1.5, y + th]);
    } else if (run.length) {
      rimRuns.push([...run, ...runIn.reverse()]);
      run = [];
      runIn = [];
    }
  }
  if (run.length) rimRuns.push([...run, ...runIn.reverse()]);
  const body = polyD([[BANK_X0, 965], ...top, [BANK_X1, 965]]);
  const rims = rimRuns.map(polyD).join('');
  // the belly: a darker scalloped band above the glow strip (from far x -260: none behind the start slot's hill)
  const r = rng('s9/belly');
  const belly: Pt[] = [];
  for (let x = -260; x <= BANK_X1; x += 6) {
    const s = Math.sin((x + 40) / 37) * 6 + Math.sin(x / 13) * 2;
    belly.push([x, 872 + s + (x < -200 ? (x + 200) * -0.5 : 0) + r.jitter(0.8)]);
  }
  const bellyD = polyD([[-260, 906], ...belly, [BANK_X1, 906]]);
  return {body, rims, belly: bellyD};
})();

export const CloudBank: React.FC = () => {
  const t = useTime();
  const dx = t * 4; // drifts right 3-5 px/s (the hold's slow tier: still, never frozen)
  return (
    <>
      <g transform={`translate(${f1(dx)} 0)`}>
        <path d={BANK.body} fill={EMBER.skyLow} />
        <path d={BANK.belly} fill={T9.belly} />
        <path d={BANK.rims} fill={T9.rim} />
      </g>
      {/* the glow strip: the brightest band, flat, on the horizon */}
      <path d={rectD(-2000, 905, 4000, 70)} fill={T9.glow} />
    </>
  );
};

// ---------------------------------------------------------------- the far ground and the hill town (the start slot)
/** Far houses on the hill (the start slot's view): two rows, ~34 px wide, fill only. Kept from G5 (the locked start). */
export const FAR_HOUSES: HouseSpec[] = (() => {
  const r = rng('s9/farTown');
  const out: HouseSpec[] = [];
  const row = (x0: number, x1: number, ground: (x: number) => number, w0: number) => {
    for (let x = x0; x < x1; ) {
      const w = w0 * r.range(0.85, 1.15);
      out.push({x, w, y: ground(x + w / 2), lit: r.chance(0.72), chimney: r.chance(0.5)});
      x += w + w0 * r.range(0.05, 0.35);
    }
  };
  row(-1900, -330, () => 884, 32); // hill crest, back row
  row(-1880, -160, (x) => groundTop(x) + 22, 36); // the hill's face down to the plain
  return out;
})();

export const FarGround: React.FC = () => (
  <>
    <Fill d={`M-2000 1500L-2000 ${groundTop(-2000)}L-300 ${groundTop(-300)}L-150 ${HORIZON}L-150 1500Z`} color={EMBER.frost} offset={false} />
    <path d={rectD(-152, HORIZON + 2, 3200, 600)} fill={T9.farGround} />
  </>
);

export const HillTown: React.FC = () => <TownBand y={1078} houses={FAR_HOUSES} far seed="s9/far" />;

// ---------------------------------------------------------------- roof rows (the far field and the mid band)
export type RoofRowSpec = {
  y: number; // ground line
  w: number; // mean roof width
  dark: string;
  light: string;
  dot?: string;
  dotEvery?: number; // a lit dot on 1 in n
  chimEvery?: number; // a chimney on 1 in n
  x0: number;
  x1: number;
  climb?: (x: number) => number; // dy at x (a hill toward the mountain)
  tall?: number; // share of flat blocks (taller walls)
};
export type RoofPaths = {walls: string[]; roofs: string[]; dots: string; chim: string; ink: string; tops: {x: number; y: number}[]};

/** Rows of small roofs, back to front: wall (dark) + snowy roof (light), gables / hips / flat blocks, chimney ticks,
 *  lit dots. Each row's roofs overlap the walls of the row behind (no gaps). Returns raw paths per row colour. */
export function roofRows(rows: RoofRowSpec[], seed: string, withInk = false): RoofPaths {
  const r = rng(`s9/rows/${seed}`);
  const walls: string[] = [];
  const roofs: string[] = [];
  let dots = '';
  let chim = '';
  let ink = '';
  const tops: {x: number; y: number}[] = [];
  rows.forEach((R, ri) => {
    let wd = '';
    let rd = '';
    for (let x = R.x0 - r.range(0, R.w); x < R.x1; ) {
      const w = R.w * r.range(0.82, 1.18);
      const cy = R.y + (R.climb ? R.climb(x + w / 2) : 0) + r.jitter(R.w * 0.07);
      const kind = r.next();
      const flat = kind < (R.tall ?? 0.18);
      const hip = !flat && kind < 0.5;
      const hw = w * (flat ? r.range(0.55, 0.7) : r.range(0.36, 0.46));
      const eave = cy - hw;
      wd += rectD(x, eave, w, hw + 1);
      let peak = eave;
      if (flat) {
        rd += rectD(x - w * 0.04, eave - w * 0.1, w * 1.08, w * 0.12);
        peak = eave - w * 0.1;
        if (withInk) ink += `M${f1(x - w * 0.04)} ${f1(eave - w * 0.1)}h${f1(w * 1.08)}`;
      } else if (hip) {
        const rh = w * 0.26;
        rd += polyD([[x - w * 0.07, eave + 1], [x + w * 0.22, eave - rh], [x + w * 0.78, eave - rh], [x + w * 1.07, eave + 1]]);
        peak = eave - rh;
        if (withInk) ink += `M${f1(x - w * 0.07)} ${f1(eave + 1)}L${f1(x + w * 0.22)} ${f1(eave - rh)}L${f1(x + w * 0.78)} ${f1(eave - rh)}L${f1(x + w * 1.07)} ${f1(eave + 1)}`;
      } else {
        const rh = w * r.range(0.34, 0.44);
        rd += polyD([[x - w * 0.08, eave + 1], [x + w / 2, eave - rh], [x + w * 1.08, eave + 1]]);
        peak = eave - rh;
        if (withInk) ink += `M${f1(x - w * 0.08)} ${f1(eave + 1)}L${f1(x + w / 2)} ${f1(eave - rh)}L${f1(x + w * 1.08)} ${f1(eave + 1)}`;
      }
      tops.push({x: x + w / 2, y: peak});
      if (R.chimEvery && r.chance(1 / R.chimEvery)) {
        const cx = x + w * r.range(0.6, 0.78);
        const cw = Math.max(2, w * 0.1);
        const chH = Math.max(3, w * r.range(0.32, 0.45));
        chim += rectD(cx, peak + (eave - peak) * 0.35 - chH, cw, chH);
      }
      if (R.dot && r.chance(1 / (R.dotEvery ?? 3))) {
        const ds = Math.max(1.2, w * 0.11);
        dots += rectD(x + w * r.range(0.2, 0.7), eave + hw * r.range(0.25, 0.45), ds, ds * 1.2);
      }
      x += w * r.range(0.78, 0.98);
    }
    walls[ri] = wd;
    roofs[ri] = rd;
  });
  return {walls, roofs, dots, chim, ink, tops};
}

export const RoofRowsView: React.FC<{rows: RoofRowSpec[]; paths: RoofPaths; inkColor?: string; inkW?: number}> = ({rows, paths, inkColor, inkW = 1}) => (
  <>
    {rows.map((R, i) => (
      <React.Fragment key={i}>
        <path d={paths.walls[i]} fill={R.dark} />
        <path d={paths.roofs[i]} fill={R.light} />
      </React.Fragment>
    ))}
    {paths.chim ? <path d={paths.chim} fill={rows[rows.length - 1].dark} /> : null}
    {paths.dots ? <path d={paths.dots} fill={rows[rows.length - 1].dot ?? EMBER.houseLit} /> : null}
    {paths.ink && inkColor ? <path d={paths.ink} fill="none" stroke={inkColor} strokeWidth={inkW} strokeLinejoin="round" /> : null}
  </>
);

// The far field: seven rows every ~9.6 px (972-1040), roofs 9 -> 16.5 wide, the back rows a step paler (haze).
const FF_ROWS: RoofRowSpec[] = Array.from({length: 7}, (_, i) => {
  const haze = ((6 - i) / 6) * 0.32;
  return {
    y: 980 + i * 9.6,
    w: 9 + i * 1.25,
    dark: planeTone(T9.farDark, haze),
    light: planeTone(T9.farLight, haze * 0.6),
    dot: T9.farDot,
    dotEvery: 3,
    chimEvery: 3.5,
    x0: -150,
    x1: 1500,
    tall: 0.14,
  };
});
const FF = roofRows(FF_ROWS, 'farfield');
/** The far field's roof tops (where streams rise from). */
export const farRoofTop = (x: number) => {
  let best = FF.tops[0];
  for (const tp of FF.tops) if (Math.abs(tp.x - x) < Math.abs(best.x - x) && tp.y < 990) best = tp;
  return best.y;
};
export const FarField: React.FC = () => <RoofRowsView rows={FF_ROWS} paths={FF} />;

// ---------------------------------------------------------------- the infinity line and the second data center
const INF = (() => {
  const r = rng('s9/inf');
  let dark = '';
  let light = '';
  for (let x = -150; x < 300; ) {
    const w = r.range(7, 9);
    const y = 969 + r.jitter(1);
    const h = r.range(3, 4.5);
    dark += rectD(x, y - h, w, h + 3);
    light += r.chance(0.6) ? polyD([[x - 0.5, y - h + 0.5], [x + w / 2, y - h - w * 0.32], [x + w + 0.5, y - h + 0.5]]) : rectD(x - 0.5, y - h - 1.6, w + 1, 2);
    x += w * r.range(0.82, 1.0);
  }
  return {dark, light};
})();
export const InfinityLine: React.FC = () => {
  const t = useTime();
  const led = Math.sin(t * 2.1) > -0.6;
  return (
    <>
      <path d={INF.dark} fill={T9.infDark} />
      <path d={INF.light} fill={T9.infLight} />
      {/* a second data center far out (no sign): "data centers", plural */}
      <path d={rectD(60, 946, 34, 20)} fill={mix(T9.hallB, EMBER.skyLow, 0.25)} />
      <path d={rectD(64, 942, 7, 4) + rectD(80, 942, 7, 4)} fill={mix(T9.hallB, EMBER.skyLow, 0.25)} />
      <path d={rectD(58, 945, 38, 2)} fill={T9.infLight} />
      {led ? <path d={rectD(74, 954, 2.4, 2.4)} fill={EMBER.led} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- the campus
/** Hall B (no sign) beside and behind the hall. */
export const HALLB = {x0: 640, x1: 900, top: 905, base: 1005};
/** Pylons marching off the right edge toward hall B, with sagging wires (thin lines: cheap fullness). */
const PYLONS: {x: number; y: number; h: number}[] = [
  {x: 1062, y: 1000, h: 60},
  {x: 1004, y: 994, h: 46},
  {x: 962, y: 990, h: 36},
  {x: 930, y: 987, h: 28},
  {x: 906, y: 985, h: 22},
];
const PYLON_D = (() => {
  let d = '';
  const arms: Pt[][] = [];
  for (const p of PYLONS) {
    const {x, y, h} = p;
    const w = h * 0.34;
    const top = y - h;
    // legs, a waist, two cross arms, a few braces
    d += `M${f1(x - w / 2)} ${f1(y)}L${f1(x - w * 0.12)} ${f1(top + h * 0.18)}L${f1(x)} ${f1(top)}L${f1(x + w * 0.12)} ${f1(top + h * 0.18)}L${f1(x + w / 2)} ${f1(y)}`;
    d += `M${f1(x - w * 0.95)} ${f1(top + h * 0.2)}H${f1(x + w * 0.95)}M${f1(x - w * 0.7)} ${f1(top + h * 0.38)}H${f1(x + w * 0.7)}`;
    d += `M${f1(x - w * 0.36)} ${f1(y - h * 0.25)}L${f1(x + w * 0.24)} ${f1(top + h * 0.5)}M${f1(x + w * 0.36)} ${f1(y - h * 0.25)}L${f1(x - w * 0.24)} ${f1(top + h * 0.5)}`;
    arms.push([[x - w * 0.95, top + h * 0.2], [x + w * 0.95, top + h * 0.2], [x - w * 0.7, top + h * 0.38]]);
  }
  let wires = '';
  for (let i = 0; i + 1 < arms.length; i++) {
    for (let k = 0; k < 3; k++) {
      const [ax, ay] = arms[i][k];
      const [bx, by] = arms[i + 1][k];
      const sag = Math.abs(ax - bx) * 0.12;
      wires += `M${f1(ax)} ${f1(ay)}Q${f1((ax + bx) / 2)} ${f1((ay + by) / 2 + sag)} ${f1(bx)} ${f1(by)}`;
    }
  }
  // the last span runs into hall B's roof
  wires += `M${f1(arms[4][0][0])} ${f1(arms[4][0][1])}Q878 966 860 ${f1(HALLB.top + 6)}`;
  return {d, wires};
})();

export const Pylons: React.FC = () => (
  <>
    <path d={PYLON_D.wires} fill="none" stroke={T9.pylon} strokeWidth={1} />
    <path d={PYLON_D.d} fill="none" stroke={T9.pylon} strokeWidth={1.7} strokeLinejoin="round" />
  </>
);

const LEDS = (x0: number, x1: number, rows: number[], pitch: number, w: number, h: number, seed: string) => {
  const r = rng(seed);
  const out: {x: number; y: number; ph: number; rate: number; skip: boolean}[] = [];
  for (const y of rows) for (let x = x0; x + w < x1; x += pitch) out.push({x, y, ph: r.range(0, 100), rate: r.range(0.6, 1.6), skip: r.chance(0.14)});
  return {out, w, h};
};
const HALLB_LEDS = LEDS(HALLB.x0 + 18, HALLB.x1 - 8, [934, 952], 10, 2.4, 4.6, 's9/hbLed');
const ledsD = (L: ReturnType<typeof LEDS>, t: number) => {
  let d = '';
  for (const e of L.out) {
    if (e.skip) continue;
    if (Math.sin(t * e.rate * 2.3 + e.ph) > 0.93) continue; // blink: a few off at a time
    d += rectD(e.x, e.y, L.w, L.h);
  }
  return d;
};

export const HallB: React.FC = () => {
  const t = useTime();
  const {x0, x1, top, base} = HALLB;
  const units = [688, 742, 796, 850];
  return (
    <>
      {units.map((ux, i) => (
        <React.Fragment key={i}>
          <path d={rectD(ux, top - 11, 26, 12)} fill={EMBER.dcSide} />
          <path d={rectD(ux - 1.5, top - 13, 29, 3)} fill={T9.infLight} />
        </React.Fragment>
      ))}
      <path d={rectD(x0, top, x1 - x0, base - top)} fill={T9.hallB} />
      <path d={rectD(x0, top, 14, base - top)} fill={mix(T9.hallB, '#1C2036', 0.5)} />
      <path d={rectD(x0 - 2, top - 3, x1 - x0 + 4, 4)} fill={T9.infLight} />
      <path d={rectD(x0 + 16, 930, x1 - x0 - 26, 13) + rectD(x0 + 16, 948, x1 - x0 - 26, 13)} fill={EMBER.dcSide} />
      <path d={ledsD(HALLB_LEDS, t)} fill={mix(EMBER.led, T9.hallB, 0.2)} />
    </>
  );
};

/** The cooling plume off the hall's first fan (~20 px/s, y >= 684): it rises against the pale bank, left of the
 *  mountain (over the gold it read as holes), never over the sign or the summit. */
export const HallPlume: React.FC = () => (
  <CoolingPlume x={322} y={HALL_ROOF - 16} seed="s9/plume" rise={104} life={5.5} drift={40} r0={5} r1={13} n={6} ceil={684} color={EMBER.frost} />
);

/** The hall's roof: a run of 7 fan units (18 px fans on 44) between which the streams dive. */
export const HallFans: React.FC = () => {
  const t = useTime();
  const els: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const cx = HALL.x - 132 + i * 44;
    const y = HALL_ROOF;
    const spin = (t * 9 + i * 1.7) % (Math.PI * 2);
    els.push(
      <React.Fragment key={i}>
        <path d={rectD(cx - 15, y - 15, 30, 16)} fill={EMBER.dcSide} />
        <path d={rectD(cx - 16.5, y - 17.5, 33, 3.5)} fill={EMBER.snow} />
        <ellipse cx={cx} cy={y - 8} rx={9} ry={4.2} fill={EMBER.dcDark} />
        {/* the fan blade: one dark tick turning (a slow loop on the roof) */}
        <path d={`M${f1(cx - 7 * Math.cos(spin))} ${f1(y - 8 - 3 * Math.sin(spin))}L${f1(cx + 7 * Math.cos(spin))} ${f1(y - 8 + 3 * Math.sin(spin))}`} stroke={EMBER.dc} strokeWidth={1.6} />
      </React.Fragment>,
    );
  }
  return <>{els}</>;
};

/** THE AI data center (the kit model: dark, sign lit), at the scale plan's size; its server rows redrawn as an LED
 *  grid (3 x 6 px dots on a 9 px pitch: two bands farther than the mid windows, so 2x their density). */
const HALL_LEDS = (() => {
  const rowsTop = HALL_GEO.sign.y + HALL_GEO.sign.h + 16;
  const rows = [0, 1, 2, 3].map((i) => rowsTop + 2 + i * 21);
  return {rows, L: LEDS(HALL_GEO.x0 + HALL.w * 0.06 + 12, HALL_GEO.x1 - 10, rows, 9, 3, 6, 's9/hallLed')};
})();
export const Hall: React.FC = () => {
  const t = useTime();
  const g = HALL_GEO;
  const sideW = HALL.w * 0.06;
  return (
    <>
      <DataCenter x={HALL.x} y={HALL.y} w={HALL.w} h={HALL.h} variant="dark" units={0} signLitAt={0} signH={52} ink={2.6} seed="s9/dc" />
      {/* cover the kit's server strips (inside the outline) and lay the finer LED grid */}
      <path d={rectD(g.x0 + sideW + 2.5, HALL_LEDS.rows[0] - 6, HALL.w - sideW - 5, HALL.y - HALL_LEDS.rows[0] + 6)} fill={EMBER.dcDark} />
      <path d={HALL_LEDS.rows.map((ry) => rectD(g.x0 + sideW + 8, ry - 2, HALL.w - sideW - 14, 10)).join('')} fill="#1C2036" />
      <path d={ledsD(HALL_LEDS.L, t)} fill={EMBER.led} />
    </>
  );
};

/** Snow puffs off roof edges on the thoom (a flat burst that grows, rises a little and shrinks to nothing). */
export const ThoomPuffs: React.FC<{at: number; pts: Pt[]; size?: number; color?: string; seed?: string}> = ({at, pts, size = 10, color = EMBER.snow, seed = 'thoom'}) => {
  const t = useTime();
  const k = (t - at) / 0.55;
  if (k <= 0 || k >= 1) return null;
  const r = rng(`s9/puff/${seed}`);
  let d = '';
  pts.forEach(([x, y], i) => {
    const dl = r.range(0, 0.15);
    const kk = Math.max(0, Math.min(1, (k - dl) / (1 - dl)));
    if (kk <= 0) return;
    const rad = size * r.range(0.7, 1.2) * Math.sin(kk * Math.PI) * (1 - kk * 0.3);
    if (rad < 0.6) return;
    const dx = r.jitter(size * 0.8) * kk;
    d += blob(x + dx, y - size * 0.9 * smooth01(kk), rad * 1.4, rad, {seed: `${seed}/${i}`});
    d += blob(x + dx + size * 0.9, y - size * 0.4 * kk, rad * 0.8, rad * 0.6, {seed: `${seed}/b${i}`});
  });
  return d ? <path d={d} fill={color} /> : null;
};
