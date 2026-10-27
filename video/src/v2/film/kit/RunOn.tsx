// kit/RunOn.tsx (lane L1's O1_runon.tsx, folded back into the kit by the assembler: the kit Contract's run-on is flat
// on one plane): HER contract's run-on for O1 and P12, the page running on past its own end and pouring off
// the desk. The roll at its leading edge unrolls: ON THE DESK (page-local, the page's own tilt) to the desk's front
// edge, over a ROUNDED LIP (a bright curl band, a dark crease under it, its cast shadow on the front face and the
// drawer on both sides), HANGING down the front of the desk (foreshortened x0.66: a vertical drop seen from the high
// 3/4 camera), a second bend where it meets the floor, then ON THE FLOOR coming toward us (perspective: wider, rows
// and years growing) and out past the frame's bottom edge: no paper end shows at the cut (art director, fix round).
// A year every 160 px of paper (2030 on the desk; 2040 / 2050 / 2060 / 2070 down the drop; 2080 on the floor), ruled
// rows between; each year is revealed as the roll passes it, at SHRINKING intervals (the pour accelerates ~5x:
// ~150 px/s on the desk to ~700 px/s on the floor, measured along the screen path), and each reveal sends a flutter
// down the hanging sheet; the sheet's sway grows with the speed. Everything is a pure function of the paper length L,
// the slide S (P12: the paper slides 200 px further over the lip; the paper that comes out from under the page carries
// ruled rows only, so the years keep their order) and the motion inputs (speed, flutter kicks).
// The desk insert's geometry (DESK.front, O1_PAGE, the floor at y 1772) is built in: it is THE desk's run-on.
// "for life" is never written; the running line only ever runs on HER page.
import React from 'react';
import {hline, line, polyPath, roundRect, ellipse} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {ease as E, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {useCaptionFont} from '../../../lib/font';
import {CC} from '../palette';
import {applyM, Fill, Ink, Letter, Pt, W} from './util';
import {CL_X, CONTRACT_PAGE, O1_PAGE, PAPER_HANG, pageMat} from './Contract';
import {DESK} from './Desk';

// ---------------------------------------------------------------- geometry (canvas px at camera rest)

const M = pageMat(O1_PAGE);
const {w: PW, h: PH} = CONTRACT_PAGE;
/** Page-local y where the run-on meets the desk's front edge (the page is tilted: 671 left, 689 right). */
const edgeLocal = (xl: number) => (DESK.front - M[1] * xl - M[5]) / M[3];
const E0 = edgeLocal(0);
const E1 = edgeLocal(PW);
/** Paper length (from the page's bottom) at the front edge, mid-strip (~180). */
export const RUN_EDGE = (E0 + E1) / 2 - PH;
/** The hanging strip's screen x (where the page's sides cross the front edge). */
const XL = applyM(M, 0, E0)[0];
const XR = applyM(M, PW, E1)[0];
const XC = (XL + XR) / 2;
const SW = XR - XL;
/** Where the hanging paper meets the floor under the desk's front (the floor line under the desk). */
export const RUN_FLOOR_Y = 1772;
const KH = 0.66;
/** Paper length at the floor bend (~768). */
export const RUN_FLOOR = RUN_EDGE + (RUN_FLOOR_Y - DESK.front) / KH;
/** A year every DEC px of paper, the first (2030) at P0; ruled rows every ROW px; a year shows once the roll is
 *  REVEAL px past it. */
const DEC = 160;
const P0 = 74;
const ROW = 26;
const YEAR0 = 2030;
const REVEAL = 22;
/** The years' paper positions (content p, before any slide). */
export const YEAR_U = Array.from({length: 10}, (_, k) => P0 + k * DEC);

/** Floor: paper v past the floor bend -> screen y (perspective: rows grow toward us). */
const floorY = (v: number) => RUN_FLOOR_Y + 0.8 * v * (1 + v / 400);
/** Floor: inverse of floorY. */
const floorV = (dy: number) => {
  // 0.002 v^2 + 0.8 v - dy = 0
  const a = 0.8 / 400;
  return (-0.8 + Math.sqrt(0.64 + 4 * a * Math.max(0, dy))) / (2 * a);
};
/** Floor: width scale at screen y. */
const floorK = (y: number) => 1 + Math.max(0, y - RUN_FLOOR_Y) / 300;

type Seg = 'desk' | 'hang' | 'floor';
/** Paper u (from the page's bottom) -> segment and screen y of the strip's centre line (desk: page-local y). */
const segOf = (u: number): Seg => (u < RUN_EDGE ? 'desk' : u < RUN_FLOOR ? 'hang' : 'floor');
const screenY = (u: number) => (u < RUN_FLOOR ? DESK.front + (u - RUN_EDGE) * KH : floorY(u - RUN_FLOOR));

/** The SCREEN path length of the leading edge (desk ~1:1, the drop x0.66, the floor in perspective) and its inverse:
 *  the pour is timed on screen, where the viewer reads its speed. */
const S_EDGE = RUN_EDGE;
const S_FLOOR = RUN_EDGE + (RUN_FLOOR_Y - DESK.front);
export const sOfL = (L: number) => (L <= RUN_EDGE ? L : L <= RUN_FLOOR ? S_EDGE + (L - RUN_EDGE) * KH : S_FLOOR + floorY(L - RUN_FLOOR) - RUN_FLOOR_Y);
export const lOfS = (s: number) => (s <= S_EDGE ? s : s <= S_FLOOR ? RUN_EDGE + (s - S_EDGE) / KH : RUN_FLOOR + floorV(s - S_FLOOR));

// ---------------------------------------------------------------- timing (O1-local seconds = VO seconds)

/** The step out: on "bans" (3.00, paper unroll) the page ratchets out past its own end in five small steps (2030). */
const STEP = {at: 3.0, n: 5, every: 0.085, dur: 0.07, px: 120};
/** The pour: from 3.50 the roll runs on along the screen path, v(tau) = v0 + (v1 - v0) tau^n, until it leaves the frame's
 *  bottom edge at POUR.end (then keeps going, off frame). */
const POUR = {at: 3.5, end: 6.04, v0: 150, n: 4.5};
/** Where the roll's top clears the bottom edge (paper length): the screen path to there fixes v1. */
const S_EXIT = S_FLOOR + 176;
const POUR_T = POUR.end - POUR.at;
const S0 = STEP.px;
const V1 = POUR.v0 + ((S_EXIT - S0 - POUR.v0 * POUR_T) * (POUR.n + 1)) / POUR_T;

/** O1's run-on length (paper px) at O1 time t. */
export const o1RunOn = (t: number): number => {
  if (t < STEP.at) return 0;
  let step = 0;
  for (let i = 0; i < STEP.n; i++) step += (STEP.px / STEP.n) * prog(t, STEP.at + i * STEP.every, STEP.dur, E.outCubic);
  if (t < POUR.at) return step;
  const tau = (t - POUR.at) / POUR_T;
  const s = tau <= 1 ? S0 + POUR.v0 * POUR_T * tau + ((V1 - POUR.v0) * POUR_T * Math.pow(tau, POUR.n + 1)) / (POUR.n + 1) : S_EXIT + V1 * (t - POUR.end);
  return lOfS(s);
};
/** The leading edge's screen speed (px/s) at O1 time t. */
export const o1RunSpeed = (t: number) => (sOfL(o1RunOn(t + 1 / 120)) - sOfL(o1RunOn(t - 1 / 120))) * 60;
export const O1_RUN_END = o1RunOn(6.12);
/** When each year is revealed in O1 (the roll passes it): the flutter kicks; also a kick when the roll crosses the
 *  lip and when it lands on the floor. Bisection on the monotonic o1RunOn. */
const timeAtL = (L: number) => {
  let a = 2.9;
  let z = 7;
  for (let i = 0; i < 40; i++) {
    const m = (a + z) / 2;
    if (o1RunOn(m) < L) a = m;
    else z = m;
  }
  return (a + z) / 2;
};
export const O1_REVEALS = YEAR_U.map((u) => timeAtL(u + REVEAL)).filter((x) => x < 6.12);
export const O1_KICKS = [timeAtL(RUN_EDGE + 6), ...O1_REVEALS.filter((x) => x > timeAtL(RUN_EDGE + 6)), timeAtL(RUN_FLOOR + 4)].sort((a, b) => a - b);

/** The leading roll's screen point (canvas px at rest): the cat's eye-line follows it (clamped to the frame). */
export const runOnTip = (L: number): Pt => {
  if (L < RUN_EDGE) {
    const q = applyM(M, PW / 2, PH + L);
    return [q[0], q[1]];
  }
  return [XC, Math.min(1930, screenY(L))];
};

// ---------------------------------------------------------------- drawing

export type RunOnMotion = {
  /** The leading edge's screen speed (px/s): the hanging sheet's sway grows with it. */
  speed: number;
  /** Flutter kicks (component time, s): a ripple runs down the hanging sheet from each. */
  kicks: number[];
};

const makeSway = (t: number, motion: RunOnMotion) => {
  const base = 2 + 3 * Math.min(1, motion.speed / 600);
  return (y: number) => {
    if (y <= DESK.front) return 0;
    const k = Math.min(1, (y - DESK.front) / (RUN_FLOOR_Y - DESK.front));
    let s = base * Math.sin(2 * Math.PI * 0.55 * t - (y - DESK.front) / 90);
    for (const tk of motion.kicks) {
      const d = t - tk;
      if (d < 0 || d > 1.2) continue;
      // a ripple travelling down the sheet (~700 px/s), dying out
      const arrive = (y - DESK.front) / 700;
      const dd = d - arrive;
      if (dd < 0) continue;
      s += 8 * Math.exp(-dd * 4.5) * Math.sin(2 * Math.PI * 3.2 * dd);
    }
    return k * s;
  };
};

export type RunOnProps = {
  /** Paper length past the page's bottom edge (page px). */
  L: number;
  /** P12: how far the paper has slid on (content moves with it; the paper from under the page has rows only). */
  slide?: number;
  motion?: RunOnMotion;
  seed?: string;
};

/** The run-on, drawn on top of <ContractPage {...O1_PAGE} runOn={0}/> (the page's bottom line stays: its own end). */
export const O1RunOn: React.FC<RunOnProps> = ({L: L0, slide = 0, motion = {speed: 0, kicks: []}, seed = 'o1run'}) => {
  const t = useTime();
  const ok = useCaptionFont();
  const L = L0 + slide;
  if (L <= 0.5) return null;
  const swayX = makeSway(t, motion);
  /** The strip's left / right screen x at screen y (hang + floor). */
  const sides = (y: number): [number, number] => {
    const s = swayX(Math.min(y, RUN_FLOOR_Y));
    if (y <= RUN_FLOOR_Y) return [XL + s, XR + s];
    const k = floorK(y);
    return [XC - (SW / 2) * k + s, XC + (SW / 2) * k + s];
  };
  // content: paper u carries content p = u - slide (p < 0 = the paper that came out from under the page: rows only)
  const years: {u: number; label: number}[] = [];
  YEAR_U.forEach((p, k) => {
    const u = p + slide;
    if (u < L - REVEAL) years.push({u, label: YEAR0 + 10 * k});
  });
  const rowU: number[] = [];
  const first = 30 + (((slide % ROW) + ROW) % ROW) - ROW;
  for (let u = first; u < L - 22; u += ROW) {
    if (u < 8) continue;
    if (years.some((y) => Math.abs(y.u - 14 - u) < 26)) continue;
    if (Math.abs(u - RUN_EDGE) < 16 || Math.abs(u - RUN_FLOOR) < 14) continue;
    rowU.push(u);
  }
  const lw = (u: number) => 0.6 + 0.4 * rng(`${seed}/lw${Math.round(u - slide)}`).next();

  // ---- the desk part (page-local, inside the page matrix)
  const deskL = Math.min(L, RUN_EDGE + 12);
  const deskEndL = PH + deskL;
  const deskQuad: Pt[] = [
    [0, PH + 1],
    [PW, PH + 1],
    [PW, Math.min(deskEndL, E1)],
    [0, Math.min(deskEndL, E0)],
  ];
  let deskRows = '';
  rowU.filter((u) => u < RUN_EDGE).forEach((u) => {
    deskRows += hline(CL_X, CL_X + 318 * lw(u), PH + u, {seed: `${seed}/dr${Math.round(u - slide)}`, over: [0, 0]});
  });
  const deskYears = years.filter((y) => y.u < RUN_EDGE - 10);
  const over = L > RUN_EDGE;

  // ---- the hanging + floor parts (screen space)
  const hangEnd = Math.min(L, RUN_FLOOR);
  const yHangEnd = screenY(hangEnd);
  const N = 18;
  const hangL: Pt[] = [];
  const hangR: Pt[] = [];
  if (over) {
    for (let i = 0; i <= N; i++) {
      const y = DESK.front + ((yHangEnd - DESK.front) * i) / N;
      const [a, z] = sides(y);
      hangL.push([a, y]);
      hangR.push([z, y]);
    }
  }
  const onFloor = L > RUN_FLOOR;
  const yEnd = screenY(L);
  const yFloorEnd = Math.min(yEnd, 2000);
  const flL: Pt[] = [];
  const flR: Pt[] = [];
  if (onFloor) {
    for (let i = 0; i <= 10; i++) {
      const y = RUN_FLOOR_Y + ((yFloorEnd - RUN_FLOOR_Y) * i) / 10;
      const [a, z] = sides(y);
      flL.push([a, y]);
      flR.push([z, y]);
    }
  }
  // rows / years below the edge: screen x by the strip's local x fraction
  const rowsBelow = rowU.filter((u) => u > RUN_EDGE && screenY(u) < 2000);
  let hangRows = '';
  let floorRows = '';
  rowsBelow.forEach((u, i) => {
    const y = screenY(u);
    const [a, z] = sides(y);
    const k = (z - a) / PW;
    const d = line(a + CL_X * k, y, a + (CL_X + 318 * lw(u)) * k, y, {seed: `${seed}/hr${Math.round(u - slide)}`, over: [0, 0]});
    if (segOf(u) === 'hang') {
      // foreshortened: every other row
      if (i % 2 === 0) hangRows += d;
    } else floorRows += d;
  });
  const yearsBelow = years.filter((y) => y.u > RUN_EDGE + 8 && screenY(y.u) < 1990);
  const rollT = segOf(L);
  const lipY = DESK.front;
  return (
    <>
      {/* on the desk */}
      <XG m={M}>
        <Fill rect={[5, PH + 2, PW, Math.min(deskL, E0 - PH)]} color={CC.paperEdge} offset={false} />
        <Fill d={polyPath(deskQuad)} color={CC.paper} offset={false} />
        <Ink d={deskRows} width={W.far} />
        {deskYears.map((y, i) => (
          <React.Fragment key={i}>
            <Ink d={hline(CL_X, 218, PH + y.u - 14, {seed: `${seed}/dy${y.label}`, over: [0, 0]})} width={W.far} />
            {ok ? (
              <Letter x={232} y={PH + y.u} size={48}>
                {String(y.label)}
              </Letter>
            ) : null}
          </React.Fragment>
        ))}
        <Ink d={line(0, PH, 0, Math.min(deskEndL, E0), {seed: `${seed}/dL`, over: [0, 0]}) + line(PW, PH, PW, Math.min(deskEndL, E1), {seed: `${seed}/dR`, over: [0, 0]})} width={W.mid} taper={false} />
        {rollT === 'desk' ? <Roll x0={0} x1={PW} y={PH + L} h={30} seed={seed} /> : null}
      </XG>
      {/* down the front of the desk: its cast shadows first (the lamp is up right: a wide one to the left, a thin
          contact shadow to the right), on the front face, the drawer and the knee space */}
      {over ? (
        <>
          <Fill d={polyPath([...hangL, ...[...hangR].reverse()].map(([x, y]): Pt => [x - 16, y + 3]))} color={CC.chairShade} offset={false} />
          <Fill d={polyPath([...hangR.map(([x, y]): Pt => [x - 2, y]), ...[...hangR].reverse().map(([x, y]): Pt => [x + 7, y + 2])])} color={CC.chairShade} offset={false} />
        </>
      ) : null}
      {onFloor ? <Fill d={polyPath([...flL, ...[...flR].reverse()].map(([x, y]): Pt => [x - 14, y + 8]))} color={CC.chairShade} offset={false} /> : null}
      {over ? (
        <>
          <Fill d={polyPath([...hangL, ...[...hangR].reverse()])} color={PAPER_HANG} offset={false} />
          <Ink d={hangRows} width={W.far} />
          <Ink d={smoothLine(hangL) + smoothLine(hangR)} width={W.mid} taper={false} />
          {/* the rounded lip: the curl catches the lamp (a bright band over the edge), the crease under it */}
          <Fill d={roundRect(XL - 4, lipY - 5, SW + 8, 16, 7)} color={CC.paper} offset={false} />
          <Ink d={`M${XL - 3} ${lipY + 4}Q${XL - 4} ${lipY - 5} ${XL + 6} ${lipY - 5}L${XR - 6} ${lipY - 5}Q${XR + 4} ${lipY - 5} ${XR + 3} ${lipY + 4}`} width={W.far} taper={false} />
          <Ink d={line(XL + 2, lipY + 12, XR - 2, lipY + 12, {seed: `${seed}/lipC`, over: [0, 0]})} width={W.mid} taper={false} />
        </>
      ) : null}
      {/* on the floor, toward us */}
      {onFloor ? (
        <>
          <Fill d={polyPath([...flL, ...[...flR].reverse()])} color={CC.paper} offset={false} />
          <Ink d={floorRows} width={W.far} />
          <Ink d={smoothLine(flL) + smoothLine(flR)} width={W.mid} taper={false} />
          {/* the bend onto the floor: a soft roll of paper, its crease */}
          <Fill d={roundRect(flL[0][0] - 3, RUN_FLOOR_Y - 6, flR[0][0] - flL[0][0] + 6, 12, 6)} color={CC.paper} offset={false} />
          <Ink d={line(flL[0][0], RUN_FLOOR_Y + 6, flR[0][0], RUN_FLOOR_Y + 6, {seed: `${seed}/fcrease`, over: [0, 0]})} width={W.mid} taper={false} />
        </>
      ) : null}
      {yearsBelow.map((y) => {
        const yy = screenY(y.u);
        const [a, z] = sides(yy);
        const k = (z - a) / PW;
        return (
          <React.Fragment key={`y${y.label}`}>
            <Ink d={line(a + CL_X * k, yy - 14 * k, a + 218 * k, yy - 14 * k, {seed: `${seed}/hy${y.label}`, over: [0, 0]})} width={W.far} />
            {ok ? (
              <Letter x={a + 232 * k} y={yy + 2} size={Math.round(48 * k)}>
                {String(y.label)}
              </Letter>
            ) : null}
          </React.Fragment>
        );
      })}
      {rollT !== 'desk' && yEnd < 2040 ? <Roll x0={sides(yEnd)[0]} x1={sides(yEnd)[1]} y={yEnd} h={rollT === 'floor' ? 30 * floorK(yEnd) : 26} seed={seed} /> : null}
    </>
  );
};

/** A polyline through points (ink). */
const smoothLine = (pts: Pt[]) => (pts.length < 2 ? '' : pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(''));

/** The rolled leading edge (the kit's look): a cream roll with its underside, ends drawn. */
const Roll: React.FC<{x0: number; x1: number; y: number; h: number; seed: string}> = ({x0, x1, y, h, seed}) => (
  <XG m={mat.translate(0, y)}>
    <Fill d={roundRect(x0 - 8, -h / 2, x1 - x0 + 16, h, h * 0.47)} color={CC.paper} offset={false} />
    <Fill d={roundRect(x0 - 8, 1, x1 - x0 + 16, h / 2 - 1, h * 0.23)} color={CC.paperEdge} offset={false} />
    <Ink d={roundRect(x0 - 8, -h / 2, x1 - x0 + 16, h, h * 0.47, {seed: `${seed}/roll`})} width={W.mid} taper={false} />
    <Ink d={ellipse(x0 + 8, 0, 5, h * 0.3, {seed: `${seed}/rollA`}) + ellipse(x1 - 8, 0, 5, h * 0.3, {seed: `${seed}/rollB`})} width={W.hair} />
  </XG>
);
