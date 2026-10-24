// S09 hidden match-cut kit (fix round 1). At the hidden cut (local 2.432, zoom 6) Part B must show what A2 showed around
// door #4, so the cut stays hidden: the A2 pieces below are drawn in A2 world coordinates THROUGH camera.ts a2ToBMat
// (B = (457.5, 1182) + 0.25 A2), with the SAME geometry, seeds and ink as StoopStreet draws them, so at the match they
// land on their A2 pixels and then shrink with the pull-back like any world object.
//   A2Ground  the two stoop steps, the hero's tan plinth ledge (Pip, the crate and the fallen lock sit on it) and the
//             lamp post: they STAY (a quarter-size doorstep + a street lamp at rest).
//   DoorMatch house #4's own front is drawn at B scale: at zoom 6 its absolute 3-8 px sketch overshoots become a scaffold
//             of lintels and jambs around the door and the window. Until the door turns 'fixed' (B.single) facade patches
//             cover them and A2's browser window, door and plaque are drawn through the map instead (ink kept >= the set's
//             rest weight on screen), house #4's lock re-drawn on top (identical props); the swap back hides inside the
//             'fixed' pop. Until A2_BAND_UNTIL (the pull-back's cruise, ~70 px/frame) the whole A2 hero facade around it
//             holds too (fills, the six side windows, bricks, side edges, cornice band, dawn rim), then leaves in one pop.
// ClipOut + WIRE_HOLE (used by Part A): clip a set layer to everything except some holes.

import React, {useId} from 'react';
import {Fill, Ink, palette, useTime, line, rect, rectPath, polyPath, wirePoint, XG} from '../../lib';
import {STOOP, SI, cornice, FacadeDoor, TERRACE, windowInk, paneFill, brickHints} from '../shared/sets';
import {ChromeSlot, PlaqueSlot} from '../shared/sets/propSlots';
import {Lock} from '../shared/props';
import {B} from './beats';
import {a2ToBMat, camAt} from './camera';

type Rect = [number, number, number, number];

/** Clips its children to everything EXCEPT `holes` (and, with `top`, everything above world y `top`): an evenodd clip in
 *  the children's own coordinates. */
export const ClipOut: React.FC<{holes?: (Rect | string)[]; top?: number; children?: React.ReactNode}> = ({holes = [], top, children}) => {
  const id = 's9clip' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const y0 = top ?? -4000;
  const d = `M-4000 ${y0}H5000V6000H-4000Z` + holes.map((r) => (typeof r === 'string' ? r : rectPath(r[0], r[1], r[2], r[3]))).join('');
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={d} clipRule="evenodd" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
};

/** A2's near-layer hole along the telephone wire (StoopStreet G.wireD: the set's wire() from STOOP.wire.a to b + 160,
 *  sag x 1.15), +-9 px, from right of the lamp's crossbar: in the close the wire would cross the band under the caption
 *  floor during the page roll at the hard cut, and it has nothing to hold on to at the hidden cut. */
export const WIRE_HOLE = (() => {
  const a = STOOP.wire.a;
  const bx = STOOP.wire.b[0] + 160;
  const by = STOOP.wire.b[1] + 6;
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const u = 0.02 + (0.98 * i) / 24;
    const p = wirePoint(a[0], a[1], bx, by, STOOP.wire.sag * 1.15, u);
    top.push(`${p[0].toFixed(1)} ${(p[1] - 9).toFixed(1)}`);
    bot.unshift(`${p[0].toFixed(1)} ${(p[1] + 9).toFixed(1)}`);
  }
  return `M${top.join('L')}L${bot.join('L')}Z`;
})();
/** The A2-only hero facade (its sides, side windows, cornice band, rim) leaves in ONE pop during the pull-back's cruise
 *  (zoom ~4.3, ~70 px/frame), revealing house #4's neighbours. */
export const A2_BAND_UNTIL = B.hidden + 0.43;
/** The door overlay hands back to house #4's own (now fixed, sage) door. */
export const DOOR_MATCH_UNTIL = B.single;

/** A2-unit ink width that stays >= `px` on screen at the current Part B zoom (and = `base` at the zoom-6 match). */
const inkFloor = (base: number, px: number, zoom: number) => Math.max(base, px / (0.25 * zoom));

// ---------------------------------------------------------------- StoopStreet geometry (A2 world, the set's seeds)

const TREAD = 9;
const STEP = (() => {
  const [s2x, s2y, s2w, s2h] = STOOP.step2;
  const [s1x, s1y, s1w, s1h] = STOOP.step1;
  const sd = 'stoop/stoop';
  return {
    t2: polyPath([[s2x - 6, s2y - TREAD], [s2x + s2w + 6, s2y - TREAD], [s2x + s2w, s2y], [s2x, s2y]]),
    r2: [s2x, s2y, s2w, s2h] as Rect,
    i2: line(s2x - 8, s2y - TREAD, s2x + s2w + 8, s2y - TREAD, {seed: `${sd}/i2a`, over: [3, 6]}) + line(s2x - 2, s2y, s2x + s2w + 4, s2y, {seed: `${sd}/i2b`, over: [2, 4]}) + line(s2x, s2y, s2x, s2y + s2h, {seed: `${sd}/i2c`, over: [0, 0]}) + line(s2x + s2w, s2y, s2x + s2w, s2y + s2h, {seed: `${sd}/i2d`, over: [0, 0]}),
    t1: polyPath([[s1x - 6, s1y - TREAD], [s1x + s1w + 6, s1y - TREAD], [s1x + s1w, s1y], [s1x, s1y]]),
    r1: [s1x, s1y, s1w, s1h] as Rect,
    i1: line(s1x - 8, s1y - TREAD, s1x + s1w + 8, s1y - TREAD, {seed: `${sd}/i1a`, over: [3, 6]}) + line(s1x - 2, s1y, s1x + s1w + 4, s1y, {seed: `${sd}/i1d`, over: [2, 4]}) + line(s1x, s1y, s1x, s1y + s1h, {seed: `${sd}/i1e`, over: [0, 0]}) + line(s1x + s1w, s1y, s1x + s1w, s1y + s1h, {seed: `${sd}/i1g`, over: [0, 0]}),
  };
})();
const HERO = STOOP.hero;
const BASE = HERO.y + HERO.h; // 1230
const PLINTH: Rect = [HERO.x, BASE, HERO.w, STOOP.pavementY - BASE];
const PLINTH_INK = line(HERO.x, BASE, HERO.x, STOOP.pavementY, {seed: 'stp/pl', over: [0, 4]}) + line(HERO.x + HERO.w, BASE, HERO.x + HERO.w, STOOP.pavementY, {seed: 'stp/pr', over: [0, 4]});
const BASE_INK = line(HERO.x - 10, BASE, HERO.x + HERO.w + 14, BASE, {seed: 'stp/b', over: [6, 10]});
const CORNICE_INK = cornice(HERO.x, HERO.x + HERO.w, HERO.y, 40, 'stp/c', 30);
/** The hero's windows (StoopStreet G.wins, its seeds): cream frames, sage glass, mintPale panes, window ink + bricks. */
const HERO_WINS: Rect[] = [
  [70, 712, 62, 92],
  [70, 862, 62, 92],
  [70, 1012, 62, 92],
  [428, 712, 62, 92],
  [428, 862, 62, 92],
  [466, 1132, 36, 70],
];
const WIN = (() => {
  let ink = '';
  let glass = '';
  HERO_WINS.forEach((q, i) => {
    ink += windowInk(q[0], q[1], q[2], q[3], `stp/w${i}`, {mullion: q[2] > 40});
    glass += paneFill(q[0], q[1], q[2], q[3], `stp/g${i}`);
  });
  const bricks = brickHints(HERO.x + 20, HERO.y + 60, HERO.w - 40, HERO.h - 80, 'stp/bk', 5, 26);
  const sides = line(HERO.x, HERO.y + 40, HERO.x, BASE, {seed: 'stp/l', over: [2, 8]}) + line(HERO.x + HERO.w, HERO.y + 40, HERO.x + HERO.w, BASE, {seed: 'stp/r', over: [2, 8]});
  return {ink: ink + bricks, glass, sides};
})();
const LP = STOOP.lamp;
const LAMP = {
  fill: rectPath(LP.x - 12, LP.top, 24, 1400) + rectPath(LP.x, LP.lantern[1] - 46, 42, 6),
  lantern: polyPath([[LP.lantern[0] + 6, LP.lantern[1] - 40], [LP.lantern[0] + 42, LP.lantern[1] - 40], [LP.lantern[0] + 36, LP.lantern[1] + 6], [LP.lantern[0] + 12, LP.lantern[1] + 6]]),
  ink:
    line(LP.x - 12, 2000, LP.x - 12, LP.top, {seed: 'stp/lp1', over: 0}) +
    line(LP.x + 12, 2000, LP.x + 12, LP.top + 4, {seed: 'stp/lp2', over: 0}) +
    line(LP.x - 26, LP.top + 12, LP.x + 34, LP.top + 12, {seed: 'stp/lpb', over: [4, 6]}) +
    line(LP.x + 12, LP.lantern[1] - 46, LP.lantern[0] + 26, LP.lantern[1] - 46, {seed: 'stp/arm', over: [0, 4]}) +
    rect(LP.lantern[0] + 6, LP.lantern[1] - 40, 36, 46, {seed: 'stoop/lanti', over: 'small'}),
};

/** The A2 ground under the actors (draw it through a2ToBMat, BEFORE <A2Actors/>). */
export const A2Ground: React.FC = () => {
  const t = useTime();
  const zoom = camAt(t).zoom;
  const W = inkFloor(SI.mid, 2.2, zoom);
  const WF = inkFloor(SI.front, 2.6, zoom);
  return (
    <>
      {/* the hero's plinth ledge (Pip's ledge) + its base line */}
      <Fill rect={PLINTH} color={palette.tan} mode="snap" seed="stoop/plinth" />
      <Ink d={PLINTH_INK + BASE_INK} width={W} taper={false} />
      {/* the stoop: step 2, then step 1 in front (StoopStreet's <Stoop/>, its seeds) */}
      <Fill d={STEP.t2} color={palette.sand} mode="snap" seed="stoop/stoop/t2" />
      <Fill rect={STEP.r2} color={palette.cream} mode="snap" seed="stoop/stoop/r2" />
      <Ink d={STEP.i2} width={W} />
      <Fill d={STEP.t1} color={palette.sand} mode="snap" seed="stoop/stoop/t1" />
      <Fill rect={STEP.r1} color={palette.cream} mode="snap" seed="stoop/stoop/r1" />
      <Ink d={STEP.i1} width={W} />
      {/* the lamp post (the set's near layer, as A2 shows it) */}
      <Fill d={LAMP.fill} color={palette.tealDark} mode="snap" seed="stoop/lamp" />
      <Fill d={LAMP.lantern} color={palette.cream} mode="snap" seed="stoop/lant" />
      <Ink d={LAMP.ink} width={WF} seed="stoop/lampi" />
    </>
  );
};

/** House #4's front as A2 drew it. Until the door turns 'fixed': patches over house #4's own window + door ink (their
 *  3-8 unit overshoots are 18-48 px at zoom 6), then A2's browser window, door and plaque through the map, house #4's
 *  lock re-drawn on top (identical props). Until A2_BAND_UNTIL also the whole A2 hero facade around it (fills, the six
 *  side windows, bricks, side edges, cornice band, dawn rim), so the cut frame equals A2's. Draw it in TerraceHill's
 *  'house4' wrap, after the house (B world), before <A2Ground/>. */
export const DoorMatch: React.FC = () => {
  const t = useTime();
  if (t < B.hidden || t >= DOOR_MATCH_UNTIL) return null;
  const zoom = camAt(t).zoom;
  const H4 = TERRACE.house4;
  const shade = H4.facade[0] + H4.facade[2] * 0.22; // the tan shade strip's right edge (502.3)
  const ghost = t < A2_BAND_UNTIL;
  const W = inkFloor(SI.mid, 1.9, zoom);
  return (
    <>
      <Fill rect={[shade - 12.3, 1356, 12.3, 135]} color={palette.tan} offset={false} mode="snap" seed="s9dm/t" />
      <Fill rect={[shade, 1356, 68, 135]} color={palette.sand} offset={false} mode="snap" seed="s9dm/s" />
      <XG m={a2ToBMat}>
        {ghost ? (
          <>
            <Fill rect={[HERO.x, HERO.y + 40, HERO.w, HERO.h - 40]} color={palette.sand} mode="snap" seed="stoop/hf" />
            <Fill rect={[HERO.x, HERO.y + 40, HERO.w * 0.25, HERO.h - 40]} color={palette.tan} offset={false} mode="snap" seed="stoop/hs" />
            {HERO_WINS.map((q, i) => (
              <Fill key={i} rect={[q[0] - 6, q[1] - 6, q[2] + 12, q[3] + 12]} color={palette.cream} offset={false} mode="snap" seed={`stoop/wf${i}`} />
            ))}
            {HERO_WINS.map((q, i) => (
              <Fill key={`g${i}`} rect={q} color={palette.sage} mode="snap" seed={`stoop/wg${i}`} />
            ))}
            <Fill d={WIN.glass} color={palette.mintPale} offset={false} mode="snap" seed="stoop/wgl" />
            <Ink d={WIN.ink} width={inkFloor(SI.far, 1.4, zoom)} taper={false} seed="stoop/hwin" />
            <Ink d={WIN.sides} width={W} seed="stoop/hink" />
            <Fill rect={[HERO.x - 6, HERO.y, HERO.w + 12, 40]} color={palette.tan} offset={false} mode="snap" seed="stoop/hc" />
            <Fill rect={[HERO.x - 6, HERO.y - 6, HERO.w + 12, 7]} color={palette.cream} offset={false} mode="snap" seed="stoop/hrim" />
            <Ink d={CORNICE_INK} width={W} seed="stoop/hink" />
            <Fill rect={STOOP.dawnRims[0]} color={palette.peach} offset={false} mode="snap" seed="stoop/rim0" />
          </>
        ) : null}
        <ChromeSlot x={STOOP.browser[0]} y={STOOP.browser[1]} w={STOOP.browser[2]} h={STOOP.browser[3]} width={W} seed="stoop/hbw" />
        <FacadeDoor r={STOOP.door4} seed="stoop/door4" width={W} />
        <PlaqueSlot x={STOOP.plaque4.x} y={STOOP.plaque4.y} size={STOOP.plaque4.size} seed="stoop/pq4" width={inkFloor(SI.far, 1.4, zoom)} />
      </XG>
      <Lock x={H4.lock.x} y={H4.lock.y} size={H4.lock.h} state="fixed" ink={Math.max(0.6, 1.2 / zoom)} seed="terr/h4lock" checkAt={B.check} />
    </>
  );
};
