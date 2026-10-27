// V2S2_Bench (lane L2): the bench pair on S2_BENCH_SEAT (V2S2_Layout), drawn from the K4 seated geometry
// (cast/body.ts seatParts, the kit's STAFFER / REPORTER sheets) with this shot's own acting on top. FILM seconds.
//   the staffer (right, x 718, seat-to-head 140: feet 1290 -> head top 186 px): slate coat, auburn hair, lanyard.
//     9.48 "BBC": turns to the reporter, head (kit turn) AND the whole figure leaning 2 -> 3.5 -> 5 deg about its seat
//     (3 drawings at 12/s). 10.36 "scared": the hood goes up (kit hoodUp) with a hunch (head dips 6 px, shoulders lift
//     4 px) in 4 drawings at 12/s, easing back out of the lean (it pulls into itself).
//   the reporter (left, x 640, seat-to-head 124: head 0.89 x the staffer's): oat coat, satchel, no BBC marks.
//     9.48 lifts an open notebook beside its right shoulder, over the staffer's slate coat (lift + open in 3 drawings,
//     0.10 s), head turns a little to the staffer; 9.62-12.70 a pencil scribbles (2 drawings at 12/s, drifting along
//     the line); 12.85 the book claps shut in 2 drawings with a 9 px drop toward the lap (the clap SFX, Pip's take-off).
// Draw order: staffer, then the notebook + pencil (it is held in front of the reporter, so the reporter's back covers
// its near edge), then the reporter. The bench furniture (V2S2_Set) is drawn after both (the backrest covers the seat).
import React from 'react';
import {CM, INK_PX} from '../palette';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {ExitSync} from '../../lib/exit';
import * as MAP from '../world/map';
import {seatParts} from '../kit/cast/body';
import type {Model} from '../kit/cast/body';
import {Parts, inkFor, misregFor} from '../kit/cast/parts';
import type {Part} from '../kit/cast/parts';
import {STAFFER as STAFFER_SHEET, REPORTER as REPORTER_SHEET} from '../kit/cast/Staff';
import {traitsFor} from '../kit/cast/traits';
import {S2_BENCH_SEAT} from './V2S2_Layout';

const S2 = MAP.S2;

/** The pair on the seat line (x = seat centre, h = seat to head top). */
export const BENCH_PAIR = {
  staffer: {x: 718, h: 140},
  reporter: {x: 640, h: 124},
} as const;

/** Drawing index of a stepped action: -1 before t0, then 0..n-1 at `rate` drawings/s, held on the last. */
export const drawingAt = (t: number, t0: number, n: number, rate = 12): number => (t < t0 ? -1 : Math.min(n - 1, Math.floor((t - t0) * rate + 1e-6)));

// ---------------------------------------------------------------- the acting (pure: also used by the QA script)

export type StafferPose = {turn: number; lean: number; hood: number | undefined; dip: number; lift: number};

/** The staffer at film time t: the 9.48 turn + lean, then the 10.36 hood + hunch. */
export function stafferPose(t: number): StafferPose {
  let turn = 0;
  let lean = 0;
  let hood: number | undefined;
  let dip = 0;
  let lift = 0;
  const i = drawingAt(t, S2.notebookOpenAt, 3);
  if (i >= 0) {
    turn = [-0.35, -0.65, -0.85][i];
    lean = [-2, -3.5, -5][i];
  }
  const j = drawingAt(t, S2.hoodAt, 4);
  if (j >= 0) {
    hood = [0.42, 0.78, 1, 1][j];
    const hunch = [0.15, 0.5, 0.85, 1][j];
    dip = 6 * hunch;
    lift = 4 * hunch;
    turn = [-0.75, -0.55, -0.4, -0.3][j];
    lean = [-4.5, -3.5, -2.6, -2.2][j];
  }
  return {turn, lean, hood, dip, lift};
}

export type NotebookState = {kind: 'none' | 'closed' | 'half' | 'open'; dy: number; pencil: number};

/** The reporter's notebook at film time t (pencil: -1 none, else the drawing index 0/1 and a drift step). */
export function notebookAt(t: number): NotebookState & {drift: number} {
  const o = S2.notebookOpenAt;
  const s = S2.notebookShutAt;
  if (t < o) return {kind: 'none', dy: 0, pencil: -1, drift: 0};
  if (t >= s) {
    const k = drawingAt(t, s, 2);
    return {kind: k === 0 ? 'half' : 'closed', dy: k === 0 ? 4 : 9, pencil: -1, drift: 0};
  }
  const k = Math.min(2, Math.floor((t - o) / 0.05 + 1e-6));
  if (k < 2) return {kind: k === 0 ? 'closed' : 'half', dy: k === 0 ? 10 : 3, pencil: -1, drift: 0};
  // 9.62-12.70 the pencil scribbles: 2 drawings at 12/s; it drifts along the line in 6 steps, then back (a new line)
  if (t >= 9.62 && t < 12.7) {
    const f = Math.floor((t - 9.62) * 12 + 1e-6);
    return {kind: 'open', dy: 0, pencil: f % 2, drift: Math.floor(f / 2) % 6};
  }
  return {kind: 'open', dy: 0, pencil: t >= 12.7 ? 0 : -1, drift: t >= 12.7 ? 5 : 0};
}

/** The reporter's head turn toward the staffer (3 drawings from 9.48; back a little on the clap). */
export function reporterTurn(t: number): number {
  const i = drawingAt(t, S2.notebookOpenAt, 3);
  let turn = i < 0 ? 0 : [0.12, 0.25, 0.35][i];
  const j = drawingAt(t, S2.notebookShutAt, 2);
  if (j >= 0) turn = [0.25, 0.15][j];
  return turn;
}

// ---------------------------------------------------------------- the seated figure (kit geometry, split head/body)

const HEAD_KEYS = new Set(['earR', 'earL', 'bunHi', 'head', 'strands', 'seam', 'face', 'crop', 'cheek', 'bunLo', 'cap', 'bill', 'capOpen', 'capBtn', 'beanie', 'band', 'pom', 'hoodRise', 'hpBand', 'hpCup-1', 'hpCup1']);

const geoCache = new Map<string, Part[]>();
function seatGeo(m: Model, h: number, seed: string, turn: number): Part[] {
  const key = JSON.stringify([seed, h, Math.round(turn * 100), m.hoodUp ?? -1]);
  let g = geoCache.get(key);
  if (!g) {
    g = seatParts(m, {h, lod: 0, seed, turn: Math.round(turn * 100) / 100});
    if (geoCache.size > 400) geoCache.clear();
    geoCache.set(key, g);
  }
  return g;
}

type SeatFigureProps = {
  x: number;
  y: number;
  h: number;
  seed: string;
  model: Model;
  turn: number;
  /** Degrees about the seat point (- = the top leans left). */
  lean?: number;
  /** Head dips by this many px (a hunch); the shoulders lift by `lift` px. */
  dip?: number;
  lift?: number;
};

/** A seated back from the kit's geometry, with a lean about the seat and a hunch (head down, shoulders up). */
const SeatFigure: React.FC<SeatFigureProps> = ({x, y, h, seed, model, turn, lean = 0, dip = 0, lift = 0}) => {
  const parts = seatGeo(model, h, seed, turn);
  const body = parts.filter((p) => !HEAD_KEYS.has(p.k));
  const headParts = parts.filter((p) => HEAD_KEYS.has(p.k));
  const Heq = h / 0.56;
  const inkPx = inkFor(Heq);
  const off = misregFor(Heq, seed);
  const shoulderH = h * 0.546;
  const ly = 1 + lift / shoulderH;
  return (
    <ExitSync seed={`fig/${seed}`}>
      <XG m={mat.compose(mat.translate(x, y), mat.rotate(lean))}>
        <XG m={mat.scale(1, ly)}>
          <Parts parts={body} inkPx={inkPx} offset={off} seed={seed} />
        </XG>
        <XG m={mat.translate(0, dip)}>
          <Parts parts={headParts} inkPx={inkPx} offset={off} seed={seed} />
        </XG>
      </XG>
    </ExitSync>
  );
};

const STAFFER_MODEL: Model = {...traitsFor('staffer', STAFFER_SHEET), ...STAFFER_SHEET} as Model;
const REPORTER_MODEL: Model = {...traitsFor('reporter', REPORTER_SHEET), ...REPORTER_SHEET} as Model;

export const S2Staffer: React.FC = () => {
  const t = useTime();
  const p = stafferPose(t);
  const {x, h} = BENCH_PAIR.staffer;
  const model: Model = {...STAFFER_MODEL, hoodUp: p.hood};
  return <SeatFigure x={x} y={S2_BENCH_SEAT} h={h} seed="s2staffer" model={model} turn={p.turn} lean={p.lean} dip={p.dip} lift={p.lift} />;
};

export const S2Reporter: React.FC = () => {
  const t = useTime();
  const {x, h} = BENCH_PAIR.reporter;
  return <SeatFigure x={x} y={S2_BENCH_SEAT} h={h} seed="s2reporter" model={REPORTER_MODEL} turn={reporterTurn(t)} />;
};

// ---------------------------------------------------------------- the notebook (this shot's overlay; the kit's is hidden)

/** The open notebook's page box (screen px at the 6.70 pose): beside the reporter's right shoulder, over the staffer's
 *  coat, under the staffer's head (bottom ~1160) and above the backrest (top 1206). */
export const NOTEBOOK_BOX = {x0: 672, y0: 1166, x1: 732, y1: 1205};

const P1 = (n: number) => n.toFixed(1);

/** A hand scribble line from (x0, y) to (x1, y): small loops and waves (ink, round caps). */
function scribble(x0: number, x1: number, y: number, seed: number): string {
  let d = `M${P1(x0)} ${P1(y)}`;
  const n = Math.max(3, Math.round((x1 - x0) / 5));
  for (let i = 1; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const up = ((i + seed) % 3 === 0 ? -3.2 : -1.6) * (i % 2 ? 1 : -0.6);
    d += `Q${P1(x - (x1 - x0) / n / 2)} ${P1(y + up)} ${P1(x)} ${P1(y + (i % 2 ? 0.4 : -0.3))}`;
  }
  return d;
}

export const S2Notebook: React.FC = () => {
  const t = useTime();
  const nb = notebookAt(t);
  if (nb.kind === 'none') return null;
  const {x0, y0, x1, y1} = NOTEBOOK_BOX;
  const dy = nb.dy;
  const w = x1 - x0;
  const hgt = y1 - y0;
  const spineX = x0 + w * 0.42;
  const ink = INK_PX.far;
  const cover = CM.brickDeep;
  const out: React.ReactNode[] = [];
  if (nb.kind === 'closed') {
    // a closed book standing in the hand: the cover, the page edges along its open side
    const cx0 = spineX - 4;
    const cw = 24;
    out.push(<Fill key="cv" rect={[cx0, y0 + dy, cw, hgt]} color={cover} offset={[1.5, 1]} seed="s2nb/cv" />);
    out.push(<Fill key="pe" rect={[cx0 + cw - 4, y0 + dy + 2, 3, hgt - 4]} color={CM.paper} offset={false} seed="s2nb/pe" />);
    out.push(<Ink key="ci" d={`M${P1(cx0)} ${P1(y0 + dy)}H${P1(cx0 + cw)}V${P1(y0 + dy + hgt)}H${P1(cx0)}Z`} width={ink} seed="s2nb/ci" />);
  } else {
    // open (or half open): the left page flat against the cover, the right page swinging out
    const rw = nb.kind === 'open' ? x1 - spineX : (x1 - spineX) * 0.45;
    const lw = spineX - x0;
    const top = y0 + dy;
    const pageL = `M${P1(spineX)} ${P1(top + 1)}L${P1(spineX - lw)} ${P1(top + 3)}L${P1(spineX - lw)} ${P1(top + hgt + 1)}L${P1(spineX)} ${P1(top + hgt - 1)}Z`;
    const pageR = `M${P1(spineX)} ${P1(top + 1)}L${P1(spineX + rw)} ${P1(top - 1)}L${P1(spineX + rw)} ${P1(top + hgt - 2)}L${P1(spineX)} ${P1(top + hgt - 1)}Z`;
    // the cover peeking under the pages (a darker rim at the bottom edge)
    out.push(<Fill key="cvL" d={`M${P1(spineX - lw - 2)} ${P1(top + 5)}L${P1(spineX + rw + 2)} ${P1(top + 1)}L${P1(spineX + rw + 2)} ${P1(top + hgt + 1)}L${P1(spineX - lw - 2)} ${P1(top + hgt + 3)}Z`} color={cover} offset={false} seed="s2nb/rim" />);
    out.push(<Fill key="pL" d={pageL} color={CM.paper} offset={[1.5, 1]} seed="s2nb/pL" />);
    out.push(<Fill key="pR" d={pageR} color={CM.paper} offset={[1.5, 1]} seed="s2nb/pR" />);
    out.push(<Ink key="iL" d={pageL} width={ink} seed="s2nb/iL" />);
    out.push(<Ink key="iR" d={pageR} width={ink} seed="s2nb/iR" />);
    if (nb.kind === 'open') {
      // three scribble lines on the right page, one short one on the left
      let sc = '';
      for (let i = 0; i < 3; i++) {
        const yy = top + 9 + i * 9.5;
        const xe = spineX + rw - 4 - (i === 2 ? 10 : 0);
        sc += scribble(spineX + 4, xe, yy, i);
      }
      sc += scribble(spineX - lw + 4, spineX - 5, top + 12, 5);
      out.push(<Ink key="sc" d={sc} width={1.6} seed="s2nb/sc" />);
    }
  }
  if (nb.pencil >= 0) {
    // the pencil: tip on the third line, its body back toward the reporter (lower left), two drawings
    const tipX = spineX + 6 + nb.drift * 3.2 + (nb.pencil ? 3 : 0);
    const tipY = y0 + 9 + 2 * 9.5 + (nb.pencil ? -1.5 : 1);
    // down-left toward the reporter's hand (SVG y down): ~150 deg, the two drawings 4 deg apart
    const ang = ((nb.pencil ? 146 : 152) * Math.PI) / 180;
    const L = 30;
    const ux = Math.cos(ang);
    const uy = Math.sin(ang);
    const nx = -uy * 2.6;
    const ny = ux * 2.6;
    const sx = tipX + ux * 7;
    const sy = tipY + uy * 7;
    const ex = tipX + ux * L;
    const ey = tipY + uy * L;
    const body = `M${P1(sx + nx)} ${P1(sy + ny)}L${P1(ex + nx)} ${P1(ey + ny)}L${P1(ex - nx)} ${P1(ey - ny)}L${P1(sx - nx)} ${P1(sy - ny)}Z`;
    const cone = `M${P1(tipX)} ${P1(tipY)}L${P1(sx + nx)} ${P1(sy + ny)}L${P1(sx - nx)} ${P1(sy - ny)}Z`;
    out.push(<Fill key="pb" d={body} color={CM.coatMustard} offset={false} seed="s2nb/pb" />);
    out.push(<Fill key="pc" d={cone} color={CM.paving} offset={false} seed="s2nb/pc" />);
    out.push(<Ink key="pi" d={`${body}${cone}`} width={1.6} seed="s2nb/pi" />);
  }
  return <ExitSync seed="fig/s2notebook">{out}</ExitSync>;
};

/** The bench pair in draw order: the staffer, the notebook + pencil, the reporter. */
export const S2BenchPeople: React.FC = () => (
  <>
    <S2Staffer />
    <S2Notebook />
    <S2Reporter />
  </>
);
