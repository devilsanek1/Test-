// P3 helpers (lane L3-people):
//   P3Contract   the CONTRACT on the table, front and centre-left under A's hand with its own space (the art director:
//                it was pushed left and half-tucked beside a NAME WITHHELD tent of the same cream and lettering size, so
//                the table read as two equal labels): a real contract (a second sheet under it, a staple, the title at
//                48 px, ruled lines, a signature line with a signature), on the table top's deeper value so it pops.
//   P3Underline  the ordinary underline under its CONTRACT title, drawn on fast like a pencil stroke on "contracts"
//                (12.20, the pencil sound): anchor ink, 15 px, with a slight overshoot and a small hook, never the pop.
//   P3TableTop   the table's dressing, re-laid round the page and the tent: the recorder back-left beside the mic (its
//                light blinks), the mic's short cable to it, a water glass in front of it (a ripple), a second glass and
//                the pen on the right by B; nothing touches the page or the tent.
//   P3GlassNotes the office's things stuck on the frosted partition, clear of both heads: a printed notice taped on the
//                middle pane, sticky notes on the right pane, a room-booking card by the left mullion.
//   P3Passers    life that READS at phone size in the room's walker gap (the colleague behind the partition crosses at
//                t 0-1.3 and 2.7-4.9): a second colleague carrying a stack of archive boxes crosses behind the frosted
//                glass left to right (1.15-3.25), and a flock of filled birds crosses the dusk in the glass wall (from 1.3).
import React, {useId} from 'react';
import {hline, line, polyPath, roundRect, smooth, textLines} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {b, CC, Fill, Flock, INTERVIEW, Ink, Letter, Live, loopT, onOff, quadPt, W, type Pt} from '../kit';
import {P3C} from './P3_room';

/** The CONTRACT page on the table (screen px): a perspective quad (the far edge inset), front and centre-left. */
export const P3_PAGE = {x0: 120, x1: 440, top: 1384, bottom: 1526, inset: 18};
/** NAME WITHHELD's tent in front of A (bottom centre x, y; w, h): its words at 46 px, clear of the page. */
export const P3_TENT = {x: 664, y: 1520, w: 320, h: 100};

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

/** The table's dressing (screen px; draw after the page, before the staffers' arms). */
export const P3TableTop: React.FC<{seed?: string}> = ({seed = 'p3top'}) => {
  const t = useTime();
  const m = INTERVIEW.mic;
  const rec = {x: 8, y: 1388, w: 110, h: 54};
  const blink = onOff(t, `${seed}/rec`, 1.1, 0.55);
  const glass = (x: number, y: number, k: string, ph: number) => {
    const rp = loopT(t, 2.4, ph) / 2.4;
    return (
      <React.Fragment key={k}>
        <Fill d={roundRect(x - 26, y - 76, 52, 76, 8)} color={CC.glass} seed={`${seed}/${k}`} />
        <Fill rect={[x - 22, y - 46, 44, 42]} color={CC.studioPanel} offset={false} />
        <Ink d={roundRect(x - 26, y - 76, 52, 76, 8, {seed: `${seed}/${k}I`}) + hline(x - 22, x + 22, y - 46, {over: [0, 0], seed: `${seed}/${k}w`})} width={W.far} />
        <Live c={[x, y - 46]}>
          <path d={`M${x - 18 + rp * 14} ${y - 46}h${8 - rp * 4}`} stroke={CC.white} strokeWidth={3} strokeLinecap="round" />
        </Live>
      </React.Fragment>
    );
  };
  return (
    <>
      {/* the mic's short cable round to the recorder's back */}
      <Ink d={smooth([[m.x - 20, m.y - 2], [m.x - 36, m.y + 22], [rec.x + rec.w - 6, rec.y + 14]])} width={4} color={CC.cable} taper={false} />
      <Fill d={roundRect(rec.x, rec.y, rec.w, rec.h, 10)} color={CC.stand} seed={`${seed}/rec`} />
      <Fill d={roundRect(rec.x + 12, rec.y + 12, 52, 30, 4)} color={CC.studioDeep} offset={false} />
      <Ink d={roundRect(rec.x, rec.y, rec.w, rec.h, 10, {seed: `${seed}/recI`})} width={W.mid} />
      <Live c={[rec.x + 86, rec.y + 27]}>
        <circle cx={rec.x + 86} cy={rec.y + 27} r={10} fill={blink ? CC.recLight : CC.studioDeep} />
      </Live>
      {glass(78, 1512, 'g1', 0)}
      {glass(1010, 1460, 'g2', 1.1)}
      <Ink d={line(850, 1508, 950, 1482, {over: [0, 0], seed: `${seed}/pen`})} width={12} color={CC.anchor} taper={false} />
    </>
  );
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

/** The second passer behind the frosted partition and a flock in the glass wall (screen px, kit INTERVIEW numbers). */
export const P3Passers: React.FC<{seed?: string}> = ({seed = 'p3pass'}) => {
  const t = useTime();
  const PT = INTERVIEW.partition;
  const [gx, gy, gw] = INTERVIEW.glass;
  const id = ('p3pass' + useId()).replace(/[^a-zA-Z0-9-]/g, '');
  // the passer: a stepped walk (12 drawings / s), 2.1 s across, carrying a stack of two archive boxes at chest height
  const T0 = 1.15;
  const DURW = 2.1;
  const wt = Math.floor(t * 12) / 12;
  const p = (wt - T0) / DURW;
  const feet = PT.bottom - 6;
  const wx = PT.x0 - 90 + (PT.x1 - PT.x0 + 180) * p;
  const step = Math.floor(t * 6) % 2;
  const C = CC.officeWalker;
  const panes: [number, number][] = [[PT.x0, PT.mullions[0] - 6], [PT.mullions[0] + 6, PT.mullions[1] - 6], [PT.mullions[1] + 6, PT.x1]];
  const sky: [number, number][] = [[gx, gx + gw * 0.5 - 5], [gx + gw * 0.5 + 5, gx + gw]];
  return (
    <>
      <defs>
        <clipPath id={`${id}p`} clipPathUnits="userSpaceOnUse">
          {panes.map(([a, z], i) => (
            <rect key={i} x={a} y={PT.top} width={z - a} height={PT.bottom - PT.top} />
          ))}
        </clipPath>
        <clipPath id={`${id}g`} clipPathUnits="userSpaceOnUse">
          {sky.map(([a, z], i) => (
            <rect key={i} x={a} y={gy} width={z - a} height={300} />
          ))}
        </clipPath>
      </defs>
      {p >= 0 && p <= 1 ? (
        <g clipPath={`url(#${id}p)`}>
          <circle cx={wx} cy={feet - 276} r={27} fill={C} />
          <path d={roundRect(wx - 36, feet - 244, 72, 156, 26)} fill={C} />
          <path d={`M${wx - 13} ${feet - 96}L${wx - (step ? 30 : 6)} ${feet}M${wx + 13} ${feet - 96}L${wx + (step ? 30 : 6)} ${feet}`} stroke={C} strokeWidth={24} strokeLinecap="round" />
          {/* the boxes held in front of the chest, both forearms under them */}
          <rect x={wx + 4} y={feet - 236 + step * 3} width={70} height={52} rx={4} fill={C} />
          <rect x={wx + 8} y={feet - 284 + step * 3} width={62} height={46} rx={4} fill={C} />
          <rect x={wx + 20} y={feet - 270 + step * 3} width={36} height={12} rx={3} fill={CC.frost} />
          <rect x={wx + 20} y={feet - 218 + step * 3} width={40} height={12} rx={3} fill={CC.frost} />
          <path d={`M${wx - 20} ${feet - 222}L${wx + 46} ${feet - 180 + step * 3}`} stroke={C} strokeWidth={18} strokeLinecap="round" />
          {/* the frosted band stays in front of him (it is on the glass) */}
          <rect x={PT.x0} y={960} width={PT.x1 - PT.x0} height={52} fill={CC.frost} />
        </g>
      ) : null}
      <g clipPath={`url(#${id}g)`}>
        <Flock x={gx} y={gy + 40} w={gw} h={140} n={6} size={15} period={4.6} dur={2.0} offset={1.3} dir={-1} single={false} seed={`${seed}/flock`} />
      </g>
    </>
  );
};
