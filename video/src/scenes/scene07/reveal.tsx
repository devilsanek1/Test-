// scene07/reveal.tsx — S07's fill-first reveal drawn like a PEN (motion spec T-MATCH 4-5; fix round 2).
//
// The set arrives as flat fills; its linework then draws on top -> bottom over 0.46 s as pen strokes: the ink is revealed
// through a mask of thick strokes that FOLLOW the drawn lines (the pole, each wire from the pole out to the left edge, the
// cornice, the board frame round its rectangle, the legs, the kerb ...) or hatch an object in short rows (the browser
// window, the blind, J4's lettering, the door, the ground marks), each stroke 0.10-0.20 s long, successive strokes 1
// frame apart (3-6 in flight: the kit's <Ink pace="spec"> pacing). Under the mask the WHOLE render (fills + ink in their
// true z-order), so a back object's ink never shows through a front object's fill; outside it the fills-only pass of the
// same render (identical fills: no colour or panel step at a stroke's edge). Mask strokes run in WORLD px (the set's own
// coordinates, under the camera); `pathLength = 1` lets one dash pattern draw any path.
//
// The kit has no `drawAt` on NoticeboardCorner (sets lane request in docs/scenes/S07.md); this is the scene-side pen.

import React, {useId} from 'react';
import {ease as E, Look, prog, Pt, useTime} from '../../lib';
import {wireAt, WIRES} from '../shared/sets';

export type RevealPass = 'all' | 'fills';

/** One mask stroke: path (world px), brush width, start (frames after the reveal's `at`), duration (s). */
export type PenStroke = {d: string; w: number; f: number; dur: number};

const FR = 1 / 30;
const P = (pts: Pt[]) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L');
/** Rows hatched back and forth (a pen filling an area): x0 -> x1 on the first row, back on the next. */
const rows = (x0: number, x1: number, ys: number[]) => P(ys.flatMap((y, i): Pt[] => (i % 2 ? [[x1, y], [x0, y]] : [[x0, y], [x1, y]])));
const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}A${r} ${r} 0 1 1 ${cx - r} ${cy}A${r} ${r} 0 1 1 ${cx + r} ${cy}`;
/** Wire i from the pole (x 1000) out to the left edge, sampled on the set's own curve. */
const wirePath = (i: 0 | 1 | 2) => {
  const pts: Pt[] = [];
  for (let x = 1004; x >= -270; x -= 34) pts.push(wireAt(WIRES.S07, i, x));
  return P(pts);
};
/** Arc-length fraction of wire 0 at world x (the wire is nearly straight: x fraction from the pole). */
const wireFrac = (x: number) => Math.max(0, Math.min(1, (1004 - x) / 1274));

/** The S07 strokes (NoticeboardCorner + WORKSHOP_CORNER geometry at camera rest, J4 hung at jx). Ordered top -> bottom. */
export function s07Strokes(jx: number): PenStroke[] {
  const dj = jx - 822; // J4's nail offset from its fix-round-1 place
  return [
    // the sky: the pole, its crossbar + insulators, the three wires drawn from the pole out to the left edge
    {d: P([[1000, 612], [1000, 706]]), w: 30, f: 0, dur: 0.1},
    {d: P([[946, 638], [1054, 638]]), w: 28, f: 1, dur: 0.1},
    {d: wirePath(0), w: 20, f: 1, dur: 0.2},
    {d: wirePath(1), w: 20, f: 2, dur: 0.2},
    {d: wirePath(2), w: 20, f: 3, dur: 0.2},
    // far roofs: aerials, the far pole and its two lines (right -> left, after the wires)
    {d: P([[560, 770], [-30, 780]]), w: 66, f: 2, dur: 0.16},
    // the workshop: roof line, its left wall edge (top -> down), the upstairs browser window hatched
    {d: P([[776, 704], [1110, 704]]), w: 26, f: 2, dur: 0.12},
    {d: P([[781, 700], [781, 1506]]), w: 26, f: 3, dur: 0.2},
    {d: rows(872, 1058, [788, 830, 872]), w: 48, f: 3, dur: 0.16},
    // the wall's cornice + bold roof line, left -> right
    {d: P([[-150, 860], [792, 860]]), w: 80, f: 3, dur: 0.18},
    // the board: the frame round its rectangle and its legs (fix round 3: f4 0.2 s -> f3 0.14 s, legs f8 -> f3, so the frame
    // and legs are inked by ~0.25 local, before L7 pops on the bottom rail at w73+0.10), the address rail, the drainpipe
    {d: P([[142, 935], [738, 935], [738, 1358], [142, 1358], [142, 935]]), w: 46, f: 3, dur: 0.14},
    {d: P([[205, 1356], [205, 1502]]), w: 40, f: 3, dur: 0.1},
    {d: P([[672, 1356], [672, 1502]]), w: 40, f: 3, dur: 0.1},
    {d: P([[214, 915], [666, 915]]), w: 44, f: 4, dur: 0.12},
    {d: P([[14, 872], [14, 1556]]), w: 46, f: 4, dur: 0.2},
    // pane divider + the centre latch (its two ink bars are covered in the fills pass until this stroke inks them, fix
    // round 3); J4's lettering written left -> right; the blind's slats hatched; the first window
    {d: P([[440, 935], [440, 1358]]), w: 40, f: 5, dur: 0.14},
    {d: P([[752 + dj, 1000], [898 + dj, 1000]]), w: 92, f: 5, dur: 0.14},
    {d: rows(786, 950, [932, 985, 1038, 1092]), w: 56, f: 5, dur: 0.18},
    {d: P([[988, 942], [988, 1054]]), w: 82, f: 5, dur: 0.12},
    // pane glints, the round elephant sign (round its rim), the left wall field (poster, brick ticks)
    {d: P([[172, 958], [205, 1000]]), w: 44, f: 6, dur: 0.1},
    {d: P([[680, 958], [712, 1000]]), w: 44, f: 6, dur: 0.1},
    {d: P([[548, 1015], [496, 1115]]), w: 52, f: 6, dur: 0.1},
    {d: circle(850, 1080, 22), w: 58, f: 6, dur: 0.14},
    {d: rows(30, 128, [930, 1000, 1070, 1140, 1210, 1280, 1350, 1420, 1480]), w: 74, f: 6, dur: 0.2},
    // the door hatched, the second window, the corner's far ticks
    {d: rows(790, 934, [1150, 1222, 1294, 1366, 1438, 1480]), w: 80, f: 7, dur: 0.18},
    {d: P([[988, 1150], [988, 1264]]), w: 82, f: 7, dur: 0.12},
    {d: P([[1062, 990], [1062, 1310]]), w: 50, f: 7, dur: 0.14},
    // the wall's base line, the kerb (right -> left), the ground marks hatched
    {d: P([[-160, 1502], [1240, 1502]]), w: 34, f: 8, dur: 0.14},
    {d: P([[1240, 1534], [-160, 1534]]), w: 56, f: 9, dur: 0.16},
    {d: rows(-20, 1100, [1590, 1680, 1770, 1860]), w: 100, f: 9, dur: 0.16},
  ];
}

const strokeEase = (d: string) => (d.length > 120 ? E.pen : E.inOutSine);

/** When the pen passes world x on wire 0 (for the pigeons: they pop once their wire is inked under them). */
export function wire0InkedAt(at: number, x: number): number {
  const s = s07Strokes(822)[2];
  const u = wireFrac(x);
  // invert E.pen (1 - (1 - q)^2.2)
  const q = 1 - Math.pow(1 - u, 1 / 2.2);
  return at + s.f * FR + s.dur * q;
}

/** End of the reveal (s): the last stroke lands. */
export const penEnd = (at: number, strokes: PenStroke[]) => at + Math.max(...strokes.map((s) => s.f * FR + s.dur));

export const PenReveal: React.FC<{at: number; strokes: PenStroke[]; render: (pass: RevealPass) => React.ReactNode}> = ({at, strokes, render}) => {
  const t = useTime();
  const id = 'pen' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t >= penEnd(at, strokes)) return <>{render('all')}</>;
  const fills = <Look ink={false}>{render('fills')}</Look>;
  if (t < at) return fills;
  const live = strokes.map((s) => ({s, p: prog(t, at + s.f * FR, s.dur, strokeEase(s.d))})).filter((x) => x.p > 0);
  if (!live.length) return fills;
  return (
    <>
      {fills}
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={10000} height={10000}>
          {live.map(({s, p}, i) => (
            <path key={i} d={s.d} fill="none" stroke="#fff" strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={p >= 1 ? undefined : `${p.toFixed(4)} 2`} />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${id})`}>{render('all')}</g>
    </>
  );
};
