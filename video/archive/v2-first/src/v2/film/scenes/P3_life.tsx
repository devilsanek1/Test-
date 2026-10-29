// P3 helpers (lane L3-people):
//   P3Contract   the CONTRACT on the table, front and centre-left under A's hand with its own space (the art director:
//                it was pushed left and half-tucked beside a NAME WITHHELD tent of the same cream and lettering size, so
//                the table read as two equal labels): a real contract (a second sheet under it, a staple, the title at
//                48 px, ruled lines, a signature line with a signature), on the table top's deeper value so it pops.
//   P3Underline  the ordinary underline under its CONTRACT title, drawn on fast like a pencil stroke on "contracts"
//                (12.20, the pencil sound): anchor ink, 15 px, with a slight overshoot and a small hook, never the pop.
//   P3GlassNotes the office's things stuck on the frosted partition, clear of both heads: a printed notice taped on the
//                middle pane, sticky notes on the right pane, a room-booking card by the left mullion.
// (P3TableTop, P3Passers, the room and the table are the kit's now: InterviewTableTop, InterviewRoom `passer` /
// `flockAt`, InterviewTable, STUDIO; folded back by the assembler.)
import React from 'react';
import {hline, line, polyPath, roundRect, smooth, textLines} from '../../../lib/sketch';
import {CC, Fill, INTERVIEW, Ink, Letter, quadPt, W, type Pt} from '../kit';
import {STUDIO as P3C} from '../palette';

/** The CONTRACT page on the table (screen px): a perspective quad (the far edge inset), front and centre-left. */
export const P3_PAGE = {x0: 120, x1: 440, top: 1384, bottom: 1526, inset: 18};

const pageQuad = (): [Pt, Pt, Pt, Pt] => {
  const {x0, x1, top, bottom, inset} = P3_PAGE;
  return [[x0 + inset, top], [x1 - inset, top], [x1, bottom], [x0, bottom]];
};
/** The title's baseline centre and size. */
const TITLE = (() => {
  const c = quadPt(pageQuad(), 0.5, 0.36);
  return {x: c[0], y: c[1] + 4, size: 48};
})();

export const P3Contract: React.FC<{seed?: string}> = ({seed = 'p3page'}) => {
  const q = pageQuad();
  const under: Pt[] = q.map(([x, y], i): Pt => [x + (i === 0 || i === 3 ? 12 : 16), y + (i < 2 ? -6 : 6)]);
  const shadow: Pt[] = under.map(([x, y]): Pt => [x + 6, y + 8]);
  const rows = [0.6, 0.7, 0.8].map((v, i) => {
    const a = quadPt(q, 0.1, v);
    const z = quadPt(q, 0.9 - (i % 2) * 0.16, v);
    return line(a[0], a[1], z[0], z[1], {over: [0, 0], seed: `${seed}/r${i}`});
  });
  const s0 = quadPt(q, 0.52, 0.92);
  const s1 = quadPt(q, 0.92, 0.92);
  const sig = smooth([[s0[0] + 10, s0[1] - 6], [s0[0] + 28, s0[1] - 22], [s0[0] + 40, s0[1] - 4], [s0[0] + 58, s0[1] - 20], [s0[0] + 80, s0[1] - 8], [s0[0] + 104, s0[1] - 14]]);
  const st = quadPt(q, 0.06, 0.08);
  return (
    <>
      <Fill d={polyPath(shadow)} color={P3C.tableShade} offset={false} />
      <Fill d={polyPath(under)} color={CC.paperEdge} offset={false} />
      <Ink d={polyPath(under)} width={W.far} />
      <Fill d={polyPath(q)} color={CC.paper} seed={`${seed}/p`} />
      <Ink d={polyPath(q)} width={W.mid} />
      <Ink d={line(st[0], st[1] + 6, st[0] + 20, st[1] - 4, {over: [0, 0], seed: `${seed}/staple`})} width={4} color={CC.shelfMetal} taper={false} />
      <Letter x={TITLE.x} y={TITLE.y} size={TITLE.size} fit={(P3_PAGE.x1 - P3_PAGE.x0) * 0.74} anchor="middle">
        CONTRACT
      </Letter>
      <Ink d={rows.join('')} width={W.far} />
      <Ink d={line(s0[0], s0[1], s1[0], s1[1], {over: [0, 0], seed: `${seed}/sl`}) + sig} width={W.hair + 0.4} />
      <Ink d={line(s0[0] - 22, s0[1] - 16, s0[0] - 8, s0[1] - 4, {over: [0, 0], seed: `${seed}/x1`}) + line(s0[0] - 22, s0[1] - 4, s0[0] - 8, s0[1] - 16, {over: [0, 0], seed: `${seed}/x2`})} width={W.hair} />
    </>
  );
};

/** The underline under CONTRACT (screen px), drawn on fast from `at`: 15 px, a slight overshoot, a small hook. */
export const P3Underline: React.FC<{at: number}> = ({at}) => {
  const half = 112;
  const yl = TITLE.y + 16;
  const x = TITLE.x;
  const d = smooth([[x - half, yl + 2], [x - half * 0.3, yl - 1], [x + half * 0.4, yl + 1], [x + half + 12, yl - 4], [x + half - 4, yl + 8]]);
  return <Ink d={d} width={15} color={CC.anchor} at={at} dur={0.16} pace="free" taper={false} />;
};

/** Notes and a notice on the frosted partition (screen px; kit INTERVIEW.partition 352..952 x 700..1362, mullions 552
 *  and 752; A's head ~523..685 x 1000..1180, B's ~798..946 x 1020..1180: everything sits above y 960). */
export const P3GlassNotes: React.FC<{seed?: string}> = ({seed = 'p3notes'}) => {
  const tape = (x: number, y: number, k: string) => <Fill key={k} d={polyPath([[x - 14, y - 6], [x + 14, y - 9], [x + 15, y + 3], [x - 13, y + 6]])} color={CC.frost} offset={false} />;
  const notice: [number, number][] = [[602, 770], [692, 764], [698, 884], [606, 890]];
  const stickies: [number, number, number, string][] = [[790, 800, -5, CC.note2], [846, 822, 4, CC.note3], [812, 866, 2, CC.note3]];
  return (
    <>
      <Fill d={polyPath(notice)} color={CC.paper} seed={`${seed}/n`} />
      <Ink d={polyPath(notice) + textLines(616, 800, 64, {n: 4, gap: 18, seed: `${seed}/nl`, heading: true})} width={W.far} />
      {tape(608, 772, 'ta')}
      {tape(690, 766, 'tb')}
      {stickies.map(([x, y, rot, c], i) => {
        const r = (rot * Math.PI) / 180;
        const q: [number, number][] = [[-24, -24], [24, -24], [24, 24], [-24, 24]].map(([u, v]) => [x + u * Math.cos(r) - v * Math.sin(r), y + u * Math.sin(r) + v * Math.cos(r)]);
        return (
          <React.Fragment key={i}>
            <Fill d={polyPath(q)} color={c} seed={`${seed}/s${i}`} />
            <Ink d={polyPath(q) + hline(x - 14, x + 12, y - 4, {over: [0, 0], seed: `${seed}/sl${i}`}) + hline(x - 14, x + 6, y + 8, {over: [0, 0], seed: `${seed}/sm${i}`})} width={W.hair} />
          </React.Fragment>
        );
      })}
      <Fill d={roundRect(500, 900, 40, 56, 5)} color={CC.paper} offset={false} />
      <Ink d={roundRect(500, 900, 40, 56, 5, {seed: `${seed}/card`}) + hline(508, 532, 916, {over: [0, 0], seed: `${seed}/c1`}) + hline(508, 526, 930, {over: [0, 0], seed: `${seed}/c2`})} width={W.hair} />
    </>
  );
};
