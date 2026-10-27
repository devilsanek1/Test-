// O1_runon (lane L1-desk): HER contract's run-on for O1 and P12, the page running on past its own end and pouring off
// the desk: ON THE DESK (page-local, the page's own tilt) to the desk's front edge, a crease, HANGING down the front of
// the desk (foreshortened x0.66: a vertical drop seen from the high 3/4 camera), a second crease where it meets the
// floor, then ON THE FLOOR coming toward us (perspective: wider, rows and years growing). A year every 180 px of paper
// (2030 on the desk, 2040 / 2050 / 2060 down the drop, 2070 ... on the floor), ruled rows between, the rolled leading
// edge. Everything is a pure function of the paper length L and the slide S (P12: the paper slides 200 px further
// over the edge; the paper that comes out from under the page carries ruled rows only, so the years keep their order).
// Local variant of the kit's ContractPage run-on (kit/Contract.tsx RunOnLocal, flat on one plane): see the lane's
// REQUESTS line. "for life" is never written; the running line only ever runs on HER page.
import React from 'react';
import {hline, line, polyPath, roundRect, ellipse} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {useCaptionFont} from '../../../lib/font';
import {CC, CL_X, CONTRACT_PAGE, DESK, Fill, Ink, Letter, O1_PAGE, PAPER_HANG, pageMat, type Pt, W, applyM} from '../kit';

// ---------------------------------------------------------------- geometry (canvas px at camera rest)

const M = pageMat(O1_PAGE);
const {w: PW, h: PH} = CONTRACT_PAGE;
/** Page-local y where the run-on meets the desk's front edge (the page is tilted: 671 left, 689 right). */
const edgeLocal = (xl: number) => (DESK.front - M[1] * xl - M[5]) / M[3];
const E0 = edgeLocal(0);
const E1 = edgeLocal(PW);
/** Paper length (from the page's bottom) at the front edge, mid-strip. */
export const RUN_EDGE = (E0 + E1) / 2 - PH;
/** The hanging strip's screen x (where the page's sides cross the front edge). */
const XL = applyM(M, 0, E0)[0];
const XR = applyM(M, PW, E1)[0];
const XC = (XL + XR) / 2;
const SW = XR - XL;
/** Where the hanging paper meets the floor under the desk's front (the floor line under the desk). */
export const RUN_FLOOR_Y = 1772;
const KH = 0.66;
/** Paper length at the floor crease. */
export const RUN_FLOOR = RUN_EDGE + (RUN_FLOOR_Y - DESK.front) / KH;
/** A year every DEC px of paper, the first (2030) at P0; ruled rows every ROW px. */
const DEC = 180;
const P0 = 74;
const ROW = 26;
const YEAR0 = 2030;

/** Floor: paper v past the floor crease -> screen y (perspective: rows grow toward us). */
const floorY = (v: number) => RUN_FLOOR_Y + 0.9 * v * (1 + v / 260);
/** Floor: width scale at screen y. */
const floorK = (y: number) => 1 + (y - RUN_FLOOR_Y) / 420;

type Seg = 'desk' | 'hang' | 'floor';
/** Paper u (from the page's bottom) -> segment and screen y of the strip's centre line (desk: page-local y). */
const segOf = (u: number): Seg => (u < RUN_EDGE ? 'desk' : u < RUN_FLOOR ? 'hang' : 'floor');
const screenY = (u: number) => (u < RUN_FLOOR ? DESK.front + (u - RUN_EDGE) * KH : floorY(u - RUN_FLOOR));

/** The hanging paper stirs a little (a slow travelling wave, stronger toward the floor). */
const swayX = (y: number, t: number) => {
  if (y <= DESK.front) return 0;
  const k = Math.min(1, (y - DESK.front) / (RUN_FLOOR_Y - DESK.front));
  return 5 * k * Math.sin(2 * Math.PI * 0.55 * t - (y - DESK.front) / 90);
};

/** The strip's left / right screen x at screen y (hang + floor). */
const sides = (y: number, t: number): [number, number] => {
  const s = swayX(Math.min(y, RUN_FLOOR_Y), t);
  if (y <= RUN_FLOOR_Y) return [XL + s, XR + s];
  const k = floorK(y);
  return [XC - (SW / 2) * k + s, XC + (SW / 2) * k + s];
};

export type RunOnProps = {
  /** Paper length past the page's bottom edge (page px). */
  L: number;
  /** P12: how far the paper has slid on (content moves with it; the paper from under the page has rows only). */
  slide?: number;
  seed?: string;
};

/** The run-on, drawn on top of <ContractPage {...O1_PAGE} runOn={0}/> (the page's bottom line stays: its own end). */
export const O1RunOn: React.FC<RunOnProps> = ({L: L0, slide = 0, seed = 'o1run'}) => {
  const t = useTime();
  const ok = useCaptionFont();
  const L = L0 + slide;
  if (L <= 0.5) return null;
  // content: paper u carries content p = u - slide (p < 0 = the paper that came out from under the page: rows only)
  const years: {u: number; label: number}[] = [];
  for (let k = 0; k < 12; k++) {
    const u = P0 + k * DEC + slide;
    if (u < L - 30) years.push({u, label: YEAR0 + 10 * k});
  }
  const rowU: number[] = [];
  const first = 30 + (((slide % ROW) + ROW) % ROW) - ROW;
  for (let u = first; u < L - 22; u += ROW) {
    if (u < 8) continue;
    if (years.some((y) => Math.abs(y.u - 14 - u) < 26)) continue;
    if (Math.abs(u - RUN_EDGE) < 14 || Math.abs(u - RUN_FLOOR) < 14) continue;
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
  const N = 14;
  const hangL: Pt[] = [];
  const hangR: Pt[] = [];
  if (over) {
    for (let i = 0; i <= N; i++) {
      const y = DESK.front + ((yHangEnd - DESK.front) * i) / N;
      const [a, z] = sides(y, t);
      hangL.push([a, y]);
      hangR.push([z, y]);
    }
  }
  const onFloor = L > RUN_FLOOR;
  const yEnd = screenY(L);
  const flL: Pt[] = [];
  const flR: Pt[] = [];
  if (onFloor) {
    for (let i = 0; i <= 8; i++) {
      const y = RUN_FLOOR_Y + ((yEnd - RUN_FLOOR_Y) * i) / 8;
      const [a, z] = sides(y, t);
      flL.push([a, y]);
      flR.push([z, y]);
    }
  }
  // rows / years below the edge: screen x by the strip's local x fraction
  const rowsBelow = rowU.filter((u) => u > RUN_EDGE);
  let hangRows = '';
  let floorRows = '';
  rowsBelow.forEach((u, i) => {
    const y = screenY(u);
    const [a, z] = sides(y, t);
    const k = (z - a) / PW;
    const d = line(a + CL_X * k, y, a + (CL_X + 318 * lw(u)) * k, y, {seed: `${seed}/hr${Math.round(u - slide)}`, over: [0, 0]});
    if (segOf(u) === 'hang') {
      // foreshortened: every other row
      if (i % 2 === 0) hangRows += d;
    } else floorRows += d;
  });
  const yearsBelow = years.filter((y) => y.u > RUN_EDGE + 8);
  const rollT = segOf(L);
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
          {over ? <Ink d={line(0, E0, PW, E1, {seed: `${seed}/crease`, over: [0, 0]})} width={W.far} taper={false} /> : null}
          {rollT === 'desk' ? <Roll x0={0} x1={PW} y={PH + L} h={30} seed={seed} /> : null}
      </XG>
      {/* down the front of the desk */}
      {/* its shadows (the lamp is up right: they fall to the left), drawn under the paper */}
      {over ? <Fill d={polyPath([...hangL, ...[...hangR].reverse()].map(([x, y]): Pt => [x - 14, y + 4]))} color={CC.chairShade} offset={false} /> : null}
      {onFloor ? <Fill d={polyPath([...flL, ...[...flR].reverse()].map(([x, y]): Pt => [x - 12, y + 7]))} color={CC.under} offset={false} /> : null}
      {over ? (
        <>
          <Fill d={polyPath([...hangL, ...[...hangR].reverse()])} color={PAPER_HANG} offset={false} />
          {/* where it bends over the front edge: the curl's underside */}
          <Fill d={polyPath([hangL[0], hangR[0], [hangR[0][0], DESK.front + 12], [hangL[0][0], DESK.front + 12]])} color={CC.paperEdge} offset={false} />
          <Ink d={hangRows} width={W.far} />
          <Ink d={smoothLine(hangL) + smoothLine(hangR)} width={W.mid} taper={false} />
        </>
      ) : null}
      {/* on the floor, toward us */}
      {onFloor ? (
        <>
          <Fill d={polyPath([...flL, ...[...flR].reverse()])} color={CC.paper} offset={false} />
          <Ink d={floorRows} width={W.far} />
          <Ink d={smoothLine(flL) + smoothLine(flR) + line(flL[0][0], RUN_FLOOR_Y, flR[0][0], RUN_FLOOR_Y, {seed: `${seed}/fcrease`, over: [0, 0]})} width={W.mid} taper={false} />
        </>
      ) : null}
      {yearsBelow.map((y, i) => {
        const yy = screenY(y.u);
        const [a, z] = sides(yy, t);
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
      {rollT !== 'desk' ? <Roll x0={sides(yEnd, t)[0]} x1={sides(yEnd, t)[1]} y={yEnd} h={rollT === 'floor' ? 30 * floorK(yEnd) : 26} seed={seed} /> : null}
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

// ---------------------------------------------------------------- timing

/** O1's run-on length at O1 time t: 3.00-3.42 the page steps out past its edge (120 px: 2030), then from 3.55 it
 *  pours, faster and faster (100 px/s + 72 px/s^2): over the front edge ~4.0 ("criticizing"), 2040 ~4.6, 2050 ~5.2,
 *  2060 ~5.7, on the floor ~5.9, the roll on the floor near the frame's bottom at 6.12 (O1's end = P12's start). */
export const o1RunOn = (t: number): number => {
  if (t < 3.0) return 0;
  const p = Math.min(1, (t - 3.0) / 0.42);
  const step = 120 * (1 - Math.pow(1 - p, 3));
  const s = Math.max(0, Math.min(t, 6.12) - 3.55);
  return step + 100 * s + 72 * s * s;
};
export const O1_RUN_END = o1RunOn(6.12);
/** The leading roll's screen point (canvas px at rest): the cat's eye-line follows it. */
export const runOnTip = (L: number): Pt => {
  if (L < RUN_EDGE) {
    const q = applyM(M, PW / 2, PH + L);
    return [q[0], q[1]];
  }
  return [XC, screenY(L)];
};
