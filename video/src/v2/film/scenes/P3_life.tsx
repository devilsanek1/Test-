// P3 helpers (lane L3-people):
//   P3Underline  the ordinary underline under the page's CONTRACT title, drawn on like a pencil stroke on "contracts"
//                (12.20, the pencil sound): anchor ink, a hand-drawn line with a small hook, never the pop.
//   P3TableTop   the table's dressing, re-laid for this panel (a local copy of kit InterviewTableTop, same pieces and
//                life): the kit's mic cable runs diagonally across the CONTRACT page (it read as a slash through the
//                page, right where the underline lands) and its recorder sits behind the NAME WITHHELD tent (its
//                blinking light never shows). Here the recorder sits in front of the mic, left of the page, on a short
//                cable that never touches the page; the glasses and the pen stay where the kit put them.
//   P3GlassNotes the office's things stuck on the frosted partition, clear of both heads: a printed notice taped on the
//                middle pane, sticky notes on the right pane, a room-booking card by the left mullion (it breaks the
//                flat glass behind them; all static, the walker and the office beyond carry the life).
//   P3Passers    life that READS at phone size in the kit walker's gap (it crosses the partition at t 0-1.3 and
//                2.7-4.9, so 1.3-2.7 had only faces moving): a second colleague carrying a stack of archive boxes
//                crosses behind the frosted glass left to right (1.15-3.25, the kit walker's silhouette and colour,
//                behind the mullions and the frosted band), and a flock of filled birds crosses the dusk sky in the glass
//                wall right to left (from 1.3).
import React, {useId} from 'react';
import {hline, line, polyPath, roundRect, smooth, textLines} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {CC, Fill, Flock, INTERVIEW, Ink, Live, loopT, onOff, quadPt, W, type Pt} from '../kit';

/** The page quad (the kit TablePage's numbers). */
const pageQuad = (): [Pt, Pt, Pt, Pt] => {
  const {x, y, w, h} = INTERVIEW.page;
  const inset = w * 0.06;
  return [[x + inset, y], [x + w - inset, y], [x + w, y + h], [x, y + h]];
};

/** The CONTRACT title's underline (screen px): the title is centred at the page's (0.5, 0.3) point, baseline + 0.1 h,
 *  fitted to 0.7 w. */
export const P3Underline: React.FC<{at: number}> = ({at}) => {
  const {w, h} = INTERVIEW.page;
  const c = quadPt(pageQuad(), 0.5, 0.3);
  const yl = c[1] + h * 0.1 + 12;
  const half = w * 0.33;
  const d = smooth([[c[0] - half, yl + 2], [c[0] - half * 0.3, yl - 1], [c[0] + half * 0.4, yl + 1], [c[0] + half, yl - 3], [c[0] + half - 14, yl + 7]]);
  return <Ink d={d} width={9} color={CC.anchor} at={at} dur={0.26} pace="free" taper={false} />;
};

/** The recorder (left of the page, in front of the mic: its light blinks), two water glasses (a ripple), the mic's
 *  short cable, a pen. Draw after the table and the page, before the staffers' arms. */
export const P3TableTop: React.FC<{seed?: string}> = ({seed = 'p3top'}) => {
  const t = useTime();
  const m = INTERVIEW.mic;
  const rec = {x: 34, y: 1436, w: 118, h: 58};
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
      {/* the mic's cable: down from its base, round to the recorder's back (left of the page) */}
      <Ink d={smooth([[m.x + 14, m.y - 2], [m.x + 10, m.y + 40], [m.x - 20, m.y + 76], [rec.x + rec.w - 10, rec.y + 6]])} width={4} color={CC.cable} taper={false} />
      <Fill d={roundRect(rec.x, rec.y, rec.w, rec.h, 10)} color={CC.stand} seed={`${seed}/rec`} />
      <Fill d={roundRect(rec.x + 12, rec.y + 12, 56, 32, 4)} color={CC.studioDeep} offset={false} />
      <Ink d={roundRect(rec.x, rec.y, rec.w, rec.h, 10, {seed: `${seed}/recI`})} width={W.mid} />
      <Live c={[rec.x + 94, rec.y + 28]}>
        <circle cx={rec.x + 94} cy={rec.y + 28} r={10} fill={blink ? CC.recLight : CC.studioDeep} />
      </Live>
      {glass(250, 1440, 'g1', 0)}
      {glass(1010, 1460, 'g2', 1.1)}
      <Ink d={line(820, 1500, 940, 1470, {over: [0, 0], seed: `${seed}/pen`})} width={12} color={CC.anchor} taper={false} />
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
