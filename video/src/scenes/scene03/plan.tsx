// S03 scene-owned overlays on the shared BlueprintStreet (injected through the set's `wrap` layers, so they sit at the
// right depth): the far plain + horizon skyline that the bare plan runs to before the city springs up, the ten dashed
// FOOTPRINTS, the browser-screen states (dark until their beat, then a 2-frame glow pop), the count pings on the plaques
// and the roof-vent puffs (the set's VentPuff takes one time; the storyboard puffs three times).
//
// The side-building geometry is the set's own layout, rebuilt here with the SAME inputs (quadRowLayout is pure and
// memoised): LX / RX / lTop / lBase / rTop / rBase are copied from sets/BlueprintStreet.tsx. If that set's geometry
// changes, update them (request: per-building `screenOnAt` / `ventAt[]` on BlueprintStreet makes this file shrink).

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {line, polyPath, rect, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {rng} from '../../lib/rng';
import {Quad} from '../../lib/persp';
import {BLUEPRINT, PopUp, quadRowLayout, RowHouse, SideId, BlueprintId} from '../shared/sets';
import {chromeScreen} from '../shared/props';

// ---------------------------------------------------------------- the set's side-building layout (copied inputs)

const LX = [-140, 0, 95, 175, 240, 300, 360];
const RX = [1220, 1080, 985, 905, 840, 760];
const lTop = (x: number) => 560 + ((800 - 560) * x) / 360;
const lBase = (x: number) => 1560 - ((1560 - 1180) * x) / 360;
const rTop = (x: number) => 560 + ((800 - 560) * (1080 - x)) / 320;
const rBase = (x: number) => 1560 - ((1560 - 1180) * (1080 - x)) / 320;

const leftQuads: Quad[] = LX.slice(0, -1).map((x0, i) => {
  const x1 = LX[i + 1];
  return [
    [x0, lTop(x0)],
    [x1, lTop(x1)],
    [x1, lBase(x1)],
    [x0, lBase(x0)],
  ] as Quad;
});
const rightQuads: Quad[] = RX.slice(0, -1).map((x0, i) => {
  const x1 = RX[i + 1];
  return [
    [x1, rTop(x1)],
    [x0, rTop(x0)],
    [x0, rBase(x0)],
    [x1, rBase(x1)],
  ] as Quad;
});
const LEFT_IDS: (SideId | null)[] = [null, 'L1', 'L2', 'L3', 'L4', 'L5'];
const RIGHT_IDS: (SideId | null)[] = [null, 'R1', 'R2', 'R3', 'R4'];
const plaqueOf = (id: SideId | null) => (id === null ? 'new' : BLUEPRINT.blank.includes(id) ? 'blank' : 'new');
const LEFT = quadRowLayout({quads: leftQuads, side: 'left', storeys: 4, colors: [palette.sand, palette.cream, palette.tan, palette.mintPale, palette.sand, palette.cream], plaque: (i) => plaqueOf(LEFT_IDS[i]), seed: 'bpL', plaqueK: 0.16});
const RIGHT = quadRowLayout({quads: rightQuads, side: 'right', storeys: 4, colors: [palette.cream, palette.tan, palette.sand, palette.mintPale, palette.cream], plaque: (i) => plaqueOf(RIGHT_IDS[i]), seed: 'bpR', plaqueK: 0.16});

/** Every side house with its id (near -> far per side). */
export const SIDE_HOUSES: {id: SideId; h: RowHouse}[] = [
  ...LEFT.houses.map((h, i) => ({id: LEFT_IDS[i], h})),
  ...RIGHT.houses.map((h, i) => ({id: RIGHT_IDS[i], h})),
].filter((e): e is {id: SideId; h: RowHouse} => e.id !== null);

// ---------------------------------------------------------------- far plain + horizon skyline (the bare plan's horizon)

const HORIZON = BLUEPRINT.vp[1]; // 950
const SKY_FAR = '#98C0AE'; // day haze ladder (style_bible_ref2 8): farther tier
const SKY_NEAR = '#84B09C'; //                                      nearer tier

const FAR = (() => {
  const r = rng('s03/far');
  let far = '';
  let near = '';
  // farther tier: tall thin blocks with set-back tops; nearer tier: low long blocks (all fill-only, no ink)
  for (let x = -200; x < 1300; ) {
    const w = r.range(40, 95);
    const h = r.range(28, 62);
    far += polyPath([
      [x, HORIZON + 4],
      [x, HORIZON - h],
      [x + w * 0.3, HORIZON - h],
      [x + w * 0.3, HORIZON - h - r.range(6, 16)],
      [x + w * 0.62, HORIZON - h - r.range(6, 16)],
      [x + w * 0.62, HORIZON - h],
      [x + w, HORIZON - h],
      [x + w, HORIZON + 4],
    ]);
    x += w + r.range(-8, 22);
  }
  for (let x = -220; x < 1320; ) {
    const w = r.range(70, 150);
    const h = r.range(12, 30);
    near += polyPath([
      [x, HORIZON + 6],
      [x, HORIZON - h],
      [x + w, HORIZON - h],
      [x + w, HORIZON + 6],
    ]);
    x += w + r.range(10, 50);
  }
  return {far, near};
})();

/** The far construction lines of the bare plan: the horizon and rays from the vanishing point (hidden under the street
 *  and the buildings below y 1180 / once the city is up). */
const RAYS = (() => {
  let d = '';
  for (let i = 0; i <= 14; i++) {
    const xb = -900 + i * 205;
    if (Math.abs(xb - 560) < 60) continue;
    d += line(BLUEPRINT.vp[0], BLUEPRINT.vp[1], BLUEPRINT.vp[0] + (xb - BLUEPRINT.vp[0]) * 1.0, 1200, {seed: `s03/ray${i}`, over: 0, breaks: false, drift: 0.2});
  }
  return d;
})();
const HLINE = line(-120, HORIZON, 1200, HORIZON, {seed: 's03/hz', over: 0});

/** The plain from the horizon down to the street (sand, like the set's street), a low hazy far city on it, and the
 *  plan's horizon + construction rays (drawn on with the grid). */
export const FarPlain: React.FC<{gridAt?: number}> = ({gridAt}) => (
  <>
    <Fill d={FAR.far} color={SKY_FAR} offset={false} mode="none" seed="s03/farA" />
    <Fill d={FAR.near} color={SKY_NEAR} offset={false} mode="none" seed="s03/farB" />
    <Fill rect={[-260, HORIZON, 1600, 1200 - HORIZON + 10]} color={palette.sand} offset={false} mode="none" seed="s03/plain" />
    <Ink d={HLINE} width={1.6} taper={false} seed="s03/hzi" />
    <Ink d={RAYS} at={gridAt} dur={0.25} order="all" width={1.3} taper={false} seed="s03/rays" />
  </>
);

// ---------------------------------------------------------------- the ten footprints (dashed, on the bare plan)

const FOOT = (() => {
  // left lots: the base line (4 px inside the facades, so it hides under them after the pop) and a horizontal lot line
  // at every building boundary running away from the street; right lots mirrored; the press house a trapezoid lot
  let d = '';
  const inL = -4;
  d += line(360 + inL, 1180, 0 + inL, 1560, {seed: 's03/fpL', over: 0, breaks: false});
  for (const x of LX.slice(1)) d += line(x + inL, lBase(x), x - 240, lBase(x), {seed: `s03/fpl${x}`, over: 0, breaks: false});
  d += line(760 + 4, 1180, 1080 + 4, 1560, {seed: 's03/fpR', over: 0, breaks: false});
  for (const x of RX.slice(1)) d += line(x + 4, rBase(x), x + 240, rBase(x), {seed: `s03/fpr${x}`, over: 0, breaks: false});
  // the press house lot (front edge 4 px behind its base line; back edge at depth y 1120)
  const k = (1120 - HORIZON) / (1180 - HORIZON);
  const bx0 = 560 + (360 - 560) * k;
  const bx1 = 560 + (760 - 560) * k;
  d += line(366, 1176, 754, 1176, {seed: 's03/fpP1', over: 0, breaks: false});
  d += line(366, 1176, bx0 + 4, 1122, {seed: 's03/fpP2', over: 0, breaks: false});
  d += line(754, 1176, bx1 - 4, 1122, {seed: 's03/fpP3', over: 0, breaks: false});
  d += line(bx0 + 4, 1122, bx1 - 4, 1122, {seed: 's03/fpP4', over: 0, breaks: false});
  // a small cross at each lot's centre (a plan mark)
  const marks: Pt[] = [
    [560, 1150],
    ...LX.slice(1).map((x, i): Pt => [x - 46, (lBase(x) + lBase(LX[i])) / 2]),
    ...RX.slice(1).map((x, i): Pt => [x + 46, (rBase(x) + rBase(RX[i])) / 2]),
  ];
  let m = '';
  for (const [x, y] of marks) m += `M${x - 6} ${y - 6}L${x + 6} ${y + 6}M${x + 6} ${y - 6}L${x - 6} ${y + 6}`;
  return {d, m};
})();

/** The lots' poche (a flat tan step under each future building): both side triangles and the press-house trapezoid. */
const LOTS = (() => {
  const k = (1120 - HORIZON) / (1180 - HORIZON);
  return (
    polyPath([[354, 1180], [-300, 1180], [-300, 1716], [-146, 1708]]) +
    polyPath([[766, 1180], [1380, 1180], [1380, 1740], [1232, 1726]]) +
    polyPath([[366, 1175], [754, 1175], [560 + (760 - 560) * k - 4, 1122], [560 + (360 - 560) * k + 4, 1122]])
  );
})();

export const Footprints: React.FC = () => (
  <>
    <Fill d={LOTS} color={palette.tan} offset={false} mode="none" seed="s03/lots" />
    <Ink d={FOOT.d} width={2.2} dash="10 7" taper={false} seed="s03/foot" />
    <Ink d={FOOT.m} width={1.8} taper={false} seed="s03/footm" />
  </>
);

// ---------------------------------------------------------------- browser screens: dark until lit, then a glow pop

const GLOW = 0.067; // two frames of white

/** One screen overlay: unlit sage glass (BrowserChrome's glass before `screenOnAt`; never the tealDark 'off' of S01)
 *  before `lightAt`, white for two frames at it (the glow pop), then the set's own lit screen shows. */
const ScreenState: React.FC<{d: string; lightAt: number; seed: string}> = ({d, lightAt, seed}) => {
  const t = useTime();
  if (t >= lightAt + GLOW) return null;
  return <Fill d={d} color={t < lightAt ? palette.sage : palette.white} offset={false} mode="none" seed={seed} />;
};

/** Side screens (each inside a PopUp synced with its building). */
export const SideScreens: React.FC<{popAt: Record<SideId, number>; lightAt: Record<SideId, number>}> = ({popAt, lightAt}) => (
  <>
    {SIDE_HOUSES.map(({id, h}) => (
      <PopUp key={id} at={popAt[id]} x={h.base[0]} y={h.base[1]}>
        <ScreenState d={h.g.screen} lightAt={lightAt[id]} seed={`s03/scr${id}`} />
      </PopUp>
    ))}
  </>
);

/** The press house's screen (BrowserChrome screen rect under its bar). */
export const PressScreen: React.FC<{lightAt: number; pulseAt?: number}> = ({lightAt, pulseAt}) => {
  const t = useTime();
  const [wx, wy, ww, wh] = BLUEPRINT.window;
  const s = chromeScreen(wx, wy, ww, wh);
  const d = `M${s.x} ${s.y}H${s.x + s.w}V${s.y + s.h}H${s.x}Z`;
  const pulse = pulseAt !== undefined && t >= pulseAt && t < pulseAt + GLOW;
  return (
    <>
      <ScreenState d={d} lightAt={lightAt} seed="s03/scrP" />
      {pulse ? <Fill d={d} color={palette.white} offset={false} mode="none" seed="s03/scrPp" /> : null}
    </>
  );
};

// ---------------------------------------------------------------- count pings (the plaques are small: a ring reads)

/** An ink ring that pops at r and expands to 1.8 r while thinning to nothing (0.32 s): a count "tick". */
export const CountPing: React.FC<{x: number; y: number; r: number; at: number; width?: number}> = ({x, y, r, at, width = 3}) => {
  const t = useTime();
  if (t < at) return null;
  const p = prog(t, at, 0.32, E.outCubic);
  if (p >= 1) return null;
  return <circle cx={x} cy={y} r={r * (1 + 0.8 * p)} fill="none" stroke={palette.ink} strokeWidth={width * (1 - p) + 0.01} />;
};

// ---------------------------------------------------------------- roof vent puffs (several)

/** Paper sheets puffed out of the press-house roof vent at each time (n sheets, 0.12 s apart, up with a tumble). */
export const VentPuffs: React.FC<{times: number[]; n?: number; seed?: string}> = ({times, n = 2, seed = 's03/vent'}) => {
  const t = useTime();
  const V = BLUEPRINT.vent;
  const out: React.ReactNode[] = [];
  times.forEach((at, j) => {
    const r = rng(`${seed}/${j}`);
    for (let i = 0; i < n; i++) {
      const t0 = at + i * 0.12;
      if (t < t0) continue;
      const p = prog(t, t0, 1.0, E.outCubic);
      if (p >= 1) continue;
      const side = (i % 2 ? 1 : -1) * (j % 2 ? -1 : 1);
      const dx = side * r.range(26, 48);
      const x = V.x + dx * p + Math.sin(p * 6 + i + j) * 7;
      const y = V.y - 30 - r.range(120, 150) * p; // stays under screen y ~620 (the caption floor is 570)
      const rot = side * 50 * p + Math.sin(p * 9 + i) * 18;
      out.push(
        <XG key={`${j}/${i}`} m={mat.about(mat.rotate(rot), x, y)}>
          <Fill rect={[x - 8, y - 10, 16, 20]} color={palette.white} offset={false} mode="snap" seed={`${seed}/f${j}${i}`} />
          <Ink d={rect(x - 8, y - 10, 16, 20, {seed: `${seed}/i${j}${i}`, over: 'small'}) + `M${x - 5} ${y - 4}L${x + 4} ${y - 4}M${x - 5} ${y + 1}L${x + 5} ${y + 1}`} width={1.6} taper={false} seed={`${seed}/k${j}${i}`} />
        </XG>,
      );
    }
  });
  return <>{out}</>;
};

export type {BlueprintId};

// ---------------------------------------------------------------- the pen-nib sign, made visible

/** The set's pen-nib sign hangs at BLUEPRINT.sign (795, 930), which is entirely BEHIND building R4 in this framing (R4's
 *  facade covers x 760-840 from y 800 down). S03 hangs the same sign (cream disc + ink nib, r 32) from a little iron
 *  pole on the press house's left roof slope instead, against the sky, where it can swing and Bit can ride it.
 *  Request to the sets lane: a `signAt` slot (or move BLUEPRINT.sign) so the sign is visible in the S03 wide. */
export const ROOF_SIGN = {pole: [438, 832] as Pt, top: 704, hook: [392, 712] as Pt, x: 392, y: 762, r: 32};

export const RoofSign: React.FC<{swingAt?: number; seed?: string}> = ({swingAt, seed = 's03/nib'}) => {
  const t = useTime();
  const S = ROOF_SIGN;
  const a = swingAt !== undefined && t >= swingAt ? -16 * Math.exp(-5 * (t - swingAt)) * Math.cos((t - swingAt) * 12.5) : 0;
  const nib = `M${S.x} ${S.y - 19}L${S.x + 12} ${S.y + 4}L${S.x} ${S.y + 21}L${S.x - 12} ${S.y + 4}Z`;
  const pole =
    line(S.pole[0], S.pole[1] + 6, S.pole[0], S.top, {seed: `${seed}/p`, over: [0, 4], breaks: false}) +
    line(S.pole[0] + 2, S.top + 8, S.x - 22, S.top + 8, {seed: `${seed}/arm`, over: [0, 5], breaks: false}) +
    line(S.pole[0], S.top + 34, S.pole[0] - 26, S.top + 8, {seed: `${seed}/br`, over: 0, breaks: false});
  return (
    <>
      <Ink d={pole} width={3.0} taper={false} seed={`${seed}/pi`} />
      <XG m={mat.about(mat.rotate(a), S.hook[0], S.top + 8)}>
        <Ink d={`M${S.x - 15} ${S.top + 8}L${S.x - 18} ${S.y - S.r + 4}M${S.x + 15} ${S.top + 8}L${S.x + 18} ${S.y - S.r + 4}`} width={1.6} taper={false} seed={`${seed}/h`} />
        <Fill d={`M${S.x - S.r} ${S.y}a${S.r} ${S.r} 0 1 0 ${2 * S.r} 0a${S.r} ${S.r} 0 1 0 ${-2 * S.r} 0Z`} color={palette.cream} seed={`${seed}/df`} />
        <Ink d={`M${S.x - S.r} ${S.y}a${S.r} ${S.r} 0 1 0 ${2 * S.r} 0a${S.r} ${S.r} 0 1 0 ${-2 * S.r} 0`} width={3.0} taper={false} seed={`${seed}/di`} />
        <Fill d={nib} color={palette.ink} offset={false} mode="none" seed={`${seed}/nib`} />
        <Ink d={`M${S.x} ${S.y - 5}L${S.x} ${S.y + 19}`} width={2} color={palette.cream} taper={false} seed={`${seed}/slit`} />
        <circle cx={S.x} cy={S.y - 3} r={3} fill={palette.cream} />
      </XG>
    </>
  );
};
