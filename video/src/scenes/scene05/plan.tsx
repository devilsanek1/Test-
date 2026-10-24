// S05 overlays ON the shared BlueprintWall (drawn inside its layers through Scene05's `wrap`): the colour accents on the
// white sheet (fix round 1: the lock is the one coloured spot, S02's mint section), the 'found' ring, the thumb-turn and
// bolt the dashed hand turns, and the flight of steps re-drawn as treads / risers. World px, scene seconds.
import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {Look} from '../../lib/exit';
import {blob, line, rect, rectPath, roundRect, smooth, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {BLUEPRINT_WALL, SI} from '../shared/sets';
import {Lock, LOCK, lockPoint} from '../shared/props';

const L = BLUEPRINT_WALL.lock;
export const LOCK_C: Pt = [L.x, L.y];
/** Lock-local point (100-unit design box) -> world. */
export const lp = (x: number, y: number): Pt => lockPoint(L.x, L.y, L.h, [x, y]);
/** The thumb-turn the dashed hand pinches: on the box's top edge. World. */
export const KNOB: Pt = lp(4, -43);

// ---------------------------------------------------------------- colour on the sheet

// the set's own geometry (BlueprintWall.tsx G, seed 'bpw'): the same seeded sketch paths, so the re-ink sits exactly on
// the set's ink (a misregistered fill goes UNDER its outline, as everywhere in the film)
const DT = BLUEPRINT_WALL.topMargin[3] + 6; // 796: the door elevation's head
const [BX, BY, , BH] = BLUEPRINT_WALL.sheet;
const PANEL_UL: [number, number, number, number] = [370, DT + 36, 98, 894 - DT - 36];
const PANEL_LR: [number, number, number, number] = [508, 1040, 98, 110];
const TITLE: [number, number, number, number] = [BX + 26, BY + BH - 96, 176, 70];
const REINK_DOOR = rect(...PANEL_UL, {seed: 'bpw/pn1', over: 'small'}) + rect(...PANEL_LR, {seed: 'bpw/pn4', over: 'small'});
const REINK_HAIR =
  rect(...TITLE, {seed: 'bpw/tb', over: 'small'}) +
  line(BX + 26, BY + BH - 70, BX + 202, BY + BH - 70, {seed: 'bpw/tb1', over: 0}) +
  line(BX + 40, BY + BH - 84, BX + 140, BY + BH - 84, {seed: 'bpw/tb2', over: 0}) +
  line(BX + 40, BY + BH - 52, BX + 120, BY + BH - 52, {seed: 'bpw/tb3', over: 0}) +
  line(BX + 40, BY + BH - 38, BX + 150, BY + BH - 38, {seed: 'bpw/tb4', over: 0}) +
  line(L.x + 44, L.y - 30, L.x + 120, L.y - 70, {seed: 'bpw/lead', over: 0});
/** The callout disc (inside the set's r64 callout ring) and the lock box / section in lock-local units. */
const DISC = blob(L.x, L.y, 58, 57, {seed: 's5disc'});
const BOX_D = roundRect(LOCK.box[0], LOCK.box[1], LOCK.box[2], LOCK.box[3], 9);
const SECTION_D = rectPath(LOCK.cover[0], LOCK.cover[1], LOCK.cover[2], LOCK.cover[3]);
/** The section colour inside the lock box: one step stronger than the disc so the lock is the strongest spot. */
export const SECTION = palette.bg;
const LOCK_M = mat.compose(mat.translate(L.x, L.y), mat.scale(L.h / LOCK.h));

/** Flat accents on the white plan (all misregistered fills under re-inked outlines): cream on two door panels and the
 *  title block, and THE coloured spot: a mintPale callout disc round the lock, the lock box white with S02's mintPale
 *  section, the lock's ink redrawn on top. */
export const SheetColour: React.FC = () => (
  <>
    <Fill rect={PANEL_UL} color={palette.cream} seed="s5pnUL" />
    <Fill rect={PANEL_LR} color={palette.cream} seed="s5pnLR" />
    <Fill rect={TITLE} color={palette.cream} seed="s5title" />
    <Ink d={REINK_DOOR} width={SI.far} taper={false} seed="s5reD" />
    <Ink d={REINK_HAIR} width={SI.hair} taper={false} seed="s5reH" />
    <Fill d={DISC} color={palette.mintPale} seed="s5disc" />
    <XG m={LOCK_M}>
      <Fill d={BOX_D} color={palette.white} offset={false} seed="s5box" />
      <Fill d={SECTION_D} color={SECTION} seed="s5sect" />
    </XG>
    {/* the set's lock (same props), ink only, over the new fills */}
    <Look fills="none">
      <Lock x={L.x} y={L.y} size={L.h} state="blueprint" seed="bpw/lock" ink={SI.mid} />
    </Look>
  </>
);

// ---------------------------------------------------------------- the 'found' ring

/** One open hand-circling pen stroke round the lock (well outside the set's r64 callout): it starts upper left, runs
 *  clockwise and overshoots its start by 25 deg, spiralling out ~7 % so the tail passes OUTSIDE the start. */
function ringPath(x: number, y: number, r: number): string {
  const a0 = (200 * Math.PI) / 180;
  const sweep = ((360 + 25) * Math.PI) / 180;
  const rot = (-10 * Math.PI) / 180;
  const n = 34;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = a0 + sweep * u;
    const f = 1 + 0.07 * u + 0.018 * Math.sin(3 * a + 1.3);
    const ex = Math.cos(a) * r * 1.05 * f;
    const ey = Math.sin(a) * r * 0.95 * f;
    pts.push([x + ex * Math.cos(rot) - ey * Math.sin(rot), y + ex * Math.sin(rot) + ey * Math.cos(rot)]);
  }
  return smooth(pts);
}

/** The 'found' mark: strokes on in 0.17 s at `at` (ON 'out'), one quick 0.15 s scale pulse at `pulseAt` ('how'). */
export const FoundRing: React.FC<{x: number; y: number; r: number; at: number; pulseAt: number; width?: number; color?: string}> = ({x, y, r, at, pulseAt, width = 4.8, color = palette.ink}) => {
  const t = useTime();
  if (t < at) return null;
  const k = 1 + 0.12 * Math.sin(Math.PI * clamp((t - pulseAt) / 0.15));
  return (
    <XG m={mat.about(mat.scale(k), x, y)}>
      <Ink d={ringPath(x, y, r)} at={at} dur={0.17} pace="free" width={width} color={color} seed="s5ring" />
    </XG>
  );
};

// ---------------------------------------------------------------- the thumb-turn and the bolt

/** The thumb-turn the dashed hand redraws and turns (90 deg, `dur`), and the short bolt retracting with it: the lock
 *  opens with no key (S02's 'take over', recalled on 'bad'). Drawn over the lock. */
export const LockTurn: React.FC<{drawAt: number; turnAt: number; undrawAt: number; dur?: number}> = ({drawAt, turnAt, undrawAt, dur = 0.28}) => {
  const t = useTime();
  if (t < drawAt) return null;
  const q = E.inOutSine(prog(t, turnAt, dur));
  const k = L.h / 100; // world px per lock unit
  const W = 2.2;
  // the bolt: a section-coloured patch over the short bar (x -21..9.5), then the bar at its new tip (9 -> -15)
  const tip = lerp(9, -15, q);
  const hb = -21;
  const br = 6.5;
  const P = (x: number, y: number) => lp(x, y).map((v) => v.toFixed(1)).join(' ');
  const patch = `M${P(hb + 0.6, -br - 1.4)}L${P(10.6, -br - 1.4)}L${P(10.6, br + 1.4)}L${P(hb + 0.6, br + 1.4)}Z`;
  const bar = `M${P(hb, -br)}L${P(tip - 2, -br)}L${P(tip, -br + 2)}L${P(tip, br - 2)}L${P(tip - 2, br)}L${P(hb, br)}`;
  const knobR = 7 * k;
  const knobOn = t < undrawAt + 0.12;
  const rot = 90 * q;
  return (
    <>
      {q > 0 ? (
        <>
          <path d={patch} fill={SECTION} />
          <Ink d={bar} width={W} taper={false} vary={0} seed="s5bolt" />
        </>
      ) : null}
      {knobOn ? (
        <XG m={mat.compose(mat.translate(KNOB[0], KNOB[1]), mat.rotate(rot))}>
          <path d={`M${-knobR} 0a${knobR} ${knobR} 0 1 0 ${2 * knobR} 0a${knobR} ${knobR} 0 1 0 ${-2 * knobR} 0Z`} fill={palette.white} />
          <Ink d={`M${-knobR} 0a${knobR} ${knobR} 0 1 0 ${2 * knobR} 0a${knobR} ${knobR} 0 1 0 ${-2 * knobR} 0` + `M${-knobR * 1.5} 0H${knobR * 1.5}`} at={drawAt + 0.04} dur={0.12} width={W} taper={false} vary={0} seed="s5knob" />
        </XG>
      ) : null}
    </>
  );
};

/** The hand's turn (deg) about its pinch point: 12 deg over 0.28 s in-out sine (the sleeve end stays < ~14 px/frame). */
export const handTurn = (t: number, at: number, deg = 12, dur = 0.28) => deg * E.inOutSine(prog(t, at, dur));

// ---------------------------------------------------------------- the steps

/** The flight re-drawn over the set's stripes (fix round 1): four steps (cream tread band + sand riser, ONE ink nosing
 *  line each, running off both frame sides) and the deep bottom tread / landing the front row stands on (feet 1470),
 *  its sand plinth riser above the forecourt. The back row stands on the landing's back edge (feet 1446). */
export const STEPS = {y0: 1320, pitch: 30, n: 4, tread: 9, landing: [1440, 1474] as [number, number], plinth: 1488};
const X0 = -170;
const X1 = 1260;
const STEP_G = (() => {
  let treads = rectPath(X0, STEPS.landing[0], X1 - X0, STEPS.landing[1] - STEPS.landing[0]);
  let ink = '';
  for (let i = 0; i < STEPS.n; i++) {
    const y = STEPS.y0 + i * STEPS.pitch;
    treads += rectPath(X0, y, X1 - X0, STEPS.tread);
    ink += line(X0, y, X1, y + 1.5, {seed: `s5st${i}`, over: [0, 0]});
  }
  ink += line(X0, STEPS.landing[0], X1, STEPS.landing[0] + 1.5, {seed: 's5stL', over: [0, 0]}) + line(X0, STEPS.landing[1], X1, STEPS.landing[1] + 2, {seed: 's5stP', over: [0, 0]});
  return {base: rectPath(X0, STEPS.y0 - 2, X1 - X0, STEPS.plinth - STEPS.y0 + 2), treads, ink};
})();

export const StepsOverlay: React.FC = () => (
  <>
    <Fill d={STEP_G.base} color={palette.sand} offset={false} seed="s5stB" />
    <Fill d={STEP_G.treads} color={palette.cream} seed="s5stT" />
    <Ink d={STEP_G.ink} width={SI.mid} seed="s5stI" />
  </>
);
