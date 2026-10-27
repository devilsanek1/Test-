// S12_wall (lane S12, G5b): the wall of the home base's DESK set at S12's close (29.40-31.32), below the caption band
// (y 615-1000). S12 is S7's angle family (the same desk, the laptop 35 px higher with the tag under it), so the wall
// carries S7's things (docs/v3/density_plan_g5b.md §1 S12: "DESK_set as in S7"), re-hung for S12's board: no bubble
// here, and the 5x stick pops in at (240, 704) and slides down into the keyboard, so
//   left         the leaf print, the lamp's shade cut by the edge (S12.tsx), the socket with the lamp's plug; the strip
//                round the stick's entrance (x 140-330, y 615-790) stays plain wall: its calm ring.
//   centre       an embroidery hoop on a nail and a taped note above the lid's left half (off the stick's path).
//   right        the cork pinboard (moved into S7's bubble spot; its notes flutter on the ding), the wall shelf cut by the
//                right edge (books, a trailing pothos), the taped postcard, the 2026 calendar, two sticky reminders by
//                the lid's top-right corner (they lift on the ding).
// Nothing in the caption band (y 290-600); every motion is a pure function of scene seconds.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, circle, line, roundRect} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {useTime} from '../../../lib/time';
import {Calendar, EMBER, FramedPrint, Pinboard, Plant, ring, sway, WallMarks, WallShelf, W} from '../kit';

/** A wall socket with the lamp's plug in it; the cable droops off the left edge (to the lamp's base). As S7's. */
const Socket: React.FC<{x: number; y: number}> = ({x, y}) => {
  const plate = roundRect(x - 36, y - 26, 72, 52, 8);
  const cable = `M${x - 14} ${y + 14}C${x - 20} ${y + 46} ${x - 70} ${y + 52} ${x - 120} ${y + 44}S${x - 220} ${y + 26} ${x - 300} ${y + 40}`;
  return (
    <>
      <Fill d={plate} color={EMBER.card} seed="s12/sock" />
      <Ink d={roundRect(x - 36, y - 26, 72, 52, 8, {closed: false, seed: 's12/sockI'})} width={W.far} />
      <Fill d={circle(x + 15, y, 9)} color={EMBER.reveal} offset={false} />
      <Ink d={circle(x + 15, y, 9, {seed: 's12/sockO'})} width={W.hair} />
      <path d={`M${x + 11} ${y}h1.6M${x + 17.4} ${y}h1.6`} stroke={EMBER.ink} strokeWidth={2.6} strokeLinecap="round" />
      <path d={cable} fill="none" stroke={EMBER.ink} strokeWidth={9} strokeLinecap="round" />
      <path d={cable} fill="none" stroke={EMBER.anchor} strokeWidth={5.4} strokeLinecap="round" />
      <Fill d={roundRect(x - 26, y - 14, 24, 30, 5)} color={EMBER.anchor} offset={false} />
      <Ink d={roundRect(x - 26, y - 14, 24, 30, 5, {closed: false, seed: 's12/plugI'})} width={W.hair} />
    </>
  );
};

/** S7's taped postcard (a snowy hill under a dusk sky), its free corner lifting in the room's air and on the ding. */
const TapedCard: React.FC<{x: number; y: number; w: number; h: number; jolt?: number}> = ({x, y, w, h, jolt}) => {
  const t = useTime();
  const a = 5 + sway(t, 0.8, 4.6, 0.9) + ring(t, jolt, 4, 2.4, 4);
  return (
    <XG m={mat.about(mat.rotate(a), x + w / 2, y + 4)}>
      <Fill rect={[x, y, w, h]} color={EMBER.card} seed="s12/tc" />
      <Fill rect={[x + 5, y + 5, w - 10, h * 0.6]} color={EMBER.sky} offset={false} />
      <Fill d={`M${x + 5} ${y + h - 5}L${x + 5} ${y + h * 0.56}Q${x + w * 0.45} ${y + h * 0.3} ${x + w - 5} ${y + h * 0.58}L${x + w - 5} ${y + h - 5}Z`} color={EMBER.snow} offset={false} />
      <Fill d={circle(x + w * 0.72, y + h * 0.26, 6)} color={EMBER.houseLit} offset={false} />
      <Fill rect={[x + w * 0.36, y - 7, 26, 12]} color={EMBER.frost} offset={false} />
      <Ink d={`M${x} ${y}h${w}v${h}h${-w}Z`} width={W.hair} />
    </XG>
  );
};

/** A sticky note stuck on the wall (two lines of writing), its bottom edge lifting a hair; `jolt` = it flutters. */
export const WallNote: React.FC<{x: number; y: number; s: number; rot: number; color: string; jolt?: number; seed: string}> = ({x, y, s, rot, color, jolt, seed}) => {
  const t = useTime();
  const a = rot + sway(t, 0.7, 3.7, x * 0.01) + ring(t, jolt, 7, 3, 4.5);
  return (
    <XG m={mat.about(mat.rotate(a), x + s / 2, y)}>
      <Fill rect={[x, y, s, s]} color={color} seed={`${seed}/f`} />
      <Ink d={`M${x} ${y}h${s}v${s}h${-s}Z`} width={W.hair} />
      <Ink d={line(x + s * 0.15, y + s * 0.4, x + s * 0.8, y + s * 0.38, {over: [0, 0], seed: `${seed}/l1`}) + line(x + s * 0.15, y + s * 0.62, x + s * 0.6, y + s * 0.62, {over: [0, 0], seed: `${seed}/l2`})} width={W.hair} />
    </XG>
  );
};

/** An embroidery hoop on a nail: a wooden ring with its brass screw, the cloth, a stitched snowy house under a dusk
 *  sky with a lit window (cross-stitch ticks), and a loop of spare thread hanging off the screw that sways. */
const Hoop: React.FC<{cx: number; cy: number; r: number; jolt?: number}> = ({cx, cy, r, jolt}) => {
  const t = useTime();
  const a = sway(t, 1.1, 4.3, 0.4) + ring(t, jolt, 2.4, 2.2, 3.6);
  const nailY = cy - r - 26;
  const thread = (k: number) => `M${cx} ${cy - r - 6}Q${cx + 16 + k} ${cy - r + 18} ${cx + 10 + k * 1.4} ${cy - r + 44}`;
  return (
    <>
      <Ink d={line(cx, nailY, cx - 18, cy - r + 6, {over: [0, 0], seed: 's12/hw1'}) + line(cx, nailY, cx + 18, cy - r + 6, {over: [0, 0], seed: 's12/hw2'})} width={W.hair} />
      <Fill d={circle(cx, nailY, 4)} color={EMBER.anchor} offset={false} />
      <XG m={mat.about(mat.rotate(a), cx, nailY)}>
        {/* the cloth: a dusk sky over snow, a little house with a lit window, three stitched flakes */}
        <Fill d={blob(cx, cy, r, r, {seed: 's12/hoopC', wobble: 0.01})} color={EMBER.card} offset={false} />
        <Fill d={`M${cx - r * 0.8} ${cy - r * 0.05}A${r * 0.82} ${r * 0.82} 0 0 1 ${cx + r * 0.8} ${cy - r * 0.05}Z`} color={EMBER.skyLow} offset={false} />
        <Fill d={`M${cx - r * 0.82} ${cy + r * 0.12}Q${cx} ${cy - r * 0.16} ${cx + r * 0.82} ${cy + r * 0.12}A${r * 0.84} ${r * 0.84} 0 0 1 ${cx - r * 0.82} ${cy + r * 0.12}Z`} color={EMBER.snow} offset={false} />
        <Fill rect={[cx - r * 0.24, cy - r * 0.28, r * 0.48, r * 0.36]} color={EMBER.books[4]} offset={false} />
        <Fill d={`M${cx - r * 0.34} ${cy - r * 0.26}L${cx} ${cy - r * 0.56}L${cx + r * 0.34} ${cy - r * 0.26}Z`} color={EMBER.beam} offset={false} />
        <Fill rect={[cx - r * 0.07, cy - r * 0.18, r * 0.15, r * 0.14]} color={EMBER.houseLit} offset={false} />
        <path
          d={[[-0.56, -0.42], [0.5, -0.5], [0.62, -0.16]].map(([u, v]) => `M${cx + u * r - 4} ${cy + v * r - 4}l8 8M${cx + u * r + 4} ${cy + v * r - 4}l-8 8`).join('')}
          stroke={EMBER.snow}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path d={`M${cx - r * 0.6} ${cy + r * 0.42}h${r * 0.3}M${cx + r * 0.3} ${cy + r * 0.5}h${r * 0.26}`} stroke={EMBER.frost} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="4 4" />
        {/* the wooden ring (two rings: the hoop and its outer band) and the screw at the top */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={EMBER.shelf} strokeWidth={9} />
        <Ink d={circle(cx, cy, r + 5, {seed: 's12/hoopO'}) + circle(cx, cy, r - 5, {seed: 's12/hoopI'})} width={W.hair} />
        <Fill rect={[cx - 8, cy - r - 12, 16, 12]} color={EMBER.board} offset={false} />
        <Ink d={`M${cx - 8} ${cy - r - 12}h16v12h-16Z`} width={W.hair} />
        <path d={thread(sway(t, 2, 2.9, 1.2))} fill="none" stroke={EMBER.hl} strokeWidth={2.2} strokeLinecap="round" />
      </XG>
    </>
  );
};

/** A small paper note taped at both top corners (a shopping list), slightly crooked. */
const TapedList: React.FC<{x: number; y: number; w: number; h: number; rot: number}> = ({x, y, w, h, rot}) => (
  <XG m={mat.about(mat.rotate(rot), x + w / 2, y + h / 2)}>
    <Fill rect={[x, y, w, h]} color={EMBER.card} seed="s12/list" />
    <Ink d={`M${x} ${y}h${w}v${h}h${-w}Z`} width={W.hair} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${x + 10} ${y + 18 + i * 13}h${w * (i === 2 ? 0.4 : 0.62)}`} stroke={EMBER.ink} strokeWidth={1.5} strokeLinecap="round" />
    ))}
    <Fill rect={[x - 6, y - 5, 22, 10]} color={EMBER.frost} offset={false} />
    <Fill rect={[x + w - 16, y - 5, 22, 10]} color={EMBER.frost} offset={false} />
  </XG>
);

/** S12's wall below the band. `ding` = the scene time of the $1,099 step (the pinned notes flutter, the hoop swings). */
export const S12WallLow: React.FC<{ding: number}> = ({ding}) => (
  <>
    <WallMarks x={150} y={640} w={150} h={110} n={2} seed="s12/wm1" />
    <WallMarks x={196} y={880} w={110} h={70} n={2} seed="s12/wm2" />
    <WallMarks x={520} y={772} w={60} h={50} n={1} seed="s12/wm3" />
    {/* left: S7's leaf print over the lamp's rod */}
    <FramedPrint x={30} y={624} w={98} h={110} picture="leaf" seed="s12/print2" ink={W.far} />
    {/* centre: the hoop on a nail, a taped list beside it (both clear of the stick's path, x < 330 above y 790) */}
    <Hoop cx={430} cy={712} r={52} jolt={ding + 0.06} />
    <TapedList x={498} y={660} w={62} h={78} rot={4} />
    {/* right: the pinboard in S7's bubble spot (its notes flutter on the ding), the shelf cut by the right edge */}
    <Pinboard x={590} y={626} w={236} h={164} items={['photo', 'note', 'postcard', 'ticket', 'photo', 'note']} flutterAt={[ding + 0.04]} seed="s12/pin" ink={W.far} />
    <WallShelf x={852} y={806} w={290} room={118} seed="s7/shelf" ink={W.far} />
    <Plant x={886} y={806} kind="pothos" size={50} trail={118} amp={3} period={3.4} seed="s7/shelfpothos" ink={W.far} />
    <Calendar x={952} y={866} w={100} from="2026" seed="s7/cal" ink={W.far} />
    <TapedCard x={958} y={618} w={94} h={62} jolt={ding + 0.1} />
    <Socket x={268} y={948} />
    {/* two sticky reminders by the lid's top-right corner */}
    <WallNote x={784} y={890} s={56} rot={-7} color={EMBER.core} jolt={ding + 0.05} seed="s12/wn1" />
    <WallNote x={812} y={942} s={52} rot={6} color={EMBER.hl} jolt={ding + 0.08} seed="s12/wn2" />
  </>
);
