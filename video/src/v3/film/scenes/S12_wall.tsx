// S12_wall (lane S12, G5b; fixer pass): the wall of the home base's DESK set at S12's close (29.40-31.32), below the
// caption band (y 615-1000). S12 is S7's angle (the same desk, the laptop 35 px higher with the tag under it), so the wall
// is S7's (fixer pass, G5b review: the pinboard had moved into S7's bubble spot and a hoop and a night print filled the
// left, so the angle read as another wall): S7's leaf print and pinboard at S7's positions, the socket with the lamp's
// plug, and O1's window behind the laptop (scenes/desk_window.tsx S7_WINDOW: the frosted glass, the lit town, the
// snow, the dark data center's roof and sign cropped by the head). S12's own pieces round them: a shopping list taped to
// the glass above the lid, two sticky reminders on the window by the lid's top-right corner (they lift on the ding; the
// lower one drops to hang from a corner at 30.70). The 5x stick enters at (240, 704) over the pinboard (front ink).
// Nothing in the caption band (y 290-600); every motion is a pure function of scene seconds.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {circle, line, roundRect} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {useTime} from '../../../lib/time';
import {EMBER, FramedPrint, Pinboard, ring, sway, WallMarks, W} from '../kit';
import {DeskWindow, S7_WINDOW} from './desk_window';

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

/** A sticky note stuck on the wall (two lines of writing), its bottom edge lifting a hair; `jolt` = it flutters. */
export const WallNote: React.FC<{x: number; y: number; s: number; rot: number; color: string; jolt?: number; drop?: number; seed: string}> = ({x, y, s, rot, color, jolt, drop, seed}) => {
  const t = useTime();
  // `drop`: its right corner lets go; it swings down to hang from the top-left corner (+32 deg, damped)
  const dropped = drop !== undefined && t >= drop;
  const da = dropped ? 32 - ring(t, drop, 12, 1.6, 2.2) - 32 * Math.exp(-(t - drop) * 30) : 0;
  const a = rot + sway(t, 0.7, 3.7, x * 0.01) + ring(t, jolt, 7, 3, 4.5);
  return (
    <XG m={dropped ? mat.compose(mat.about(mat.rotate(da), x + 3, y + 3), mat.about(mat.rotate(a), x + s / 2, y)) : mat.about(mat.rotate(a), x + s / 2, y)}>
      <Fill rect={[x, y, s, s]} color={color} seed={`${seed}/f`} />
      <Ink d={`M${x} ${y}h${s}v${s}h${-s}Z`} width={W.hair} />
      <Ink d={line(x + s * 0.15, y + s * 0.4, x + s * 0.8, y + s * 0.38, {over: [0, 0], seed: `${seed}/l1`}) + line(x + s * 0.15, y + s * 0.62, x + s * 0.6, y + s * 0.62, {over: [0, 0], seed: `${seed}/l2`})} width={W.hair} />
    </XG>
  );
};

/** A small paper note taped at both top corners (a shopping list), slightly crooked. */
const TapedList: React.FC<{x: number; y: number; w: number; h: number; rot: number}> = ({x, y, w, h, rot}) => (
  <XG m={mat.about(mat.rotate(rot), x + w / 2, y + h / 2)}>
    <Fill rect={[x, y, w, h]} color={EMBER.frost} seed="s12/list" />
    <Ink d={`M${x} ${y}h${w}v${h}h${-w}Z`} width={W.hair} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${x + 10} ${y + 18 + i * 13}h${w * (i === 2 ? 0.4 : 0.62)}`} stroke={EMBER.ink} strokeWidth={1.5} strokeLinecap="round" />
    ))}
    <Fill rect={[x - 6, y - 5, 22, 10]} color={EMBER.frost} offset={false} />
    <Fill rect={[x + w - 16, y - 5, 22, 10]} color={EMBER.frost} offset={false} />
  </XG>
);

/** S12's wall below the band. `ding` = the scene time of the $1,099 step (the pinned notes flutter, the list lifts).
 *  Fixer pass (G5b review): S7's wall exactly (S12 is S7's angle): S7's leaf print and pinboard at S7's positions, the
 *  socket, and O1's window behind the laptop (S7_WINDOW); S12's own pieces round them: the shopping list taped to the
 *  window glass above the lid, and the two sticky reminders on the window's frame by the lid's top-right corner. */
export const S12WallLow: React.FC<{ding: number; settle?: number}> = ({ding, settle}) => (
  <>
    <WallMarks x={196} y={880} w={110} h={70} n={2} seed="s12/wm1" />
    {/* S7's pinboard (its notes flutter on the ding) and S7's leaf print over the lamp's rod, at S7's positions */}
    <Pinboard x={192} y={636} w={276} h={194} items={['photo', 'note', 'postcard', 'ticket', 'note', 'photo']} flutterAt={[ding + 0.04]} seed="s7/pin" ink={W.far} />
    <FramedPrint x={30} y={624} w={98} h={110} picture="leaf" seed="s7/print2" ink={W.far} />
    <Socket x={268} y={948} />
    {/* O1's window behind the laptop (S7's), O1 time from 6.0 */}
    <DeskWindow m={S7_WINDOW.m} glassTop={S7_WINDOW.glassTop} o1At={6.0} />
    {/* a shopping list taped to the glass above the lid, and two sticky reminders on the window by the lid's top-right
        corner (they lift on the ding; the lower one drops to hang from a corner at 30.70) */}
    <TapedList x={556} y={730} w={62} h={78} rot={4} />
    <WallNote x={790} y={856} s={54} rot={-7} color={EMBER.frost} jolt={ding + 0.05} seed="s12/wn1" />
    <WallNote x={820} y={906} s={50} rot={6} color={EMBER.hl} jolt={ding + 0.08} drop={settle} seed="s12/wn2" />
  </>
);
