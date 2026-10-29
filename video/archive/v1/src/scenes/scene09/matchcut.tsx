// S09 hidden match-cut kit. At the hidden cut (local 2.432, zoom 6) Part B must show exactly what A2 showed, so the cut
// stays hidden: the A2 pieces are drawn in A2 world coordinates THROUGH camera.ts a2ToBMat (B = (457.5, 1182) + 0.25 A2),
// with the SAME geometry, seeds and ink as StoopStreet draws them, so at the match they land on their A2 pixels and then
// shrink with the pull-back like any world object.
//   A2Ghost (ghost.tsx, fix round 2) the WHOLE A2 view: StoopStreet itself (PartA ghost mode: no actors / lock / dusk
//             dressing) under a frozen time over a sky-coloured backing, so f73 = f72 everywhere (the side context, the
//             receding right row, the far towers, the pavement, the lamp post); it leaves in ONE pop at A2_BAND_UNTIL
//             (the pull-back's cruise, ~72 px/frame), revealing the hill.
//   A2Ground  the two stoop steps and the hero's tan plinth ledge (Pip, the crate and the fallen lock sit on it): they
//             stay as a quarter-size doorstep until door #4's 'single' pop.
//   DoorMatch house #4's own front is drawn at B scale: at zoom 6 its absolute 3-8 px sketch overshoots become a scaffold
//             of lintels and jambs around the door and the window. Until the door turns 'fixed' (B.single) facade patches
//             cover them and A2's browser window, door and plaque are drawn through the map instead (ink kept >= the set's
//             rest weight on screen), house #4's lock re-drawn on top (identical props); the swap back hides inside the
//             'fixed' pop.
// ClipOut + WIRE_HOLE (used by Part A): clip a set layer to everything except some holes.

import React, {useId} from 'react';
import {Fill, Ink, palette, useTime, line, rectPath, polyPath, wirePoint, XG} from '../../lib';
import {STOOP, SI, FacadeDoor, TERRACE} from '../shared/sets';
import {ChromeSlot, PlaqueSlot} from '../shared/sets/propSlots';
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
/** Fix round 2b, the 'to install' BUILD (was ONE full-frame pop in the cruise at 2.862, ~72 px/frame: a jump cut): the A2
 *  ghost (the whole Stoop Street view) comes apart outward from door #4 in four steps while the camera is still in its
 *  ramp (< ~50 px/frame at the corners), each step revealing the hill behind it:
 *    props (f79) the lamp post, the walkers (+ bike) and the puddle pop off;
 *    right (f81) everything right of the hero house above the street line (side street, right row, towers) -> houses #5, #6;
 *    left  (f82) everything left of it (the neighbour) -> houses #3, #2;
 *    all   (f83) the hero facade + the street go: house #4 (A2's door, browser and plaque kept by DoorMatch, the quarter-size
 *          doorstep by A2Ground) on the terrace street, re-toned to A2's pavement so the ground value holds.
 *  Each newly revealed row-0 plaque blinks as its house appears (hill.tsx NearLodRow0). */
export const GHOST = {props: B.to - 0.1, right: B.to - 0.052, left: B.to - 0.007, all: B.to + 0.032};
export const A2_BAND_UNTIL = GHOST.all;
/** The ghost's clip boundaries in A2 world: the hero house's sides and the B-world street line (row 0's base 1500). */
export const GHOST_CUT = {left: STOOP.hero.x, right: STOOP.hero.x + STOOP.hero.w, street: (1500 - 1182) / 0.25};
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
/** The A2 ground under the actors (draw it through a2ToBMat, BEFORE <A2Actors/>); pops off with the crate and the
 *  fallen lock in door #4's 'single' pop. (The lamp post now lives only in the ghost: it leaves at A2_BAND_UNTIL instead
 *  of standing on the pavement as a stick at rest.) */
export const A2Ground: React.FC = () => {
  const t = useTime();
  // under the ghost the set's own plinth + stoop are there (A2Ghost); from its pop until 'single' this quarter-size copy
  if (t < A2_BAND_UNTIL || t >= B.single) return null;
  const zoom = camAt(t).zoom;
  const W = inkFloor(SI.mid, 2.2, zoom);
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
    </>
  );
};

/** House #4's front as A2 drew it, from the ghost's pop until the door turns 'fixed': patches over house #4's own
 *  window + door ink (their 3-8 unit overshoots are 12-25 px at zoom 4-3), then A2's browser window, door and plaque
 *  through the map (A2's new lock rides on top in <A2Actors/>). Draw it in TerraceHill's 'house4' wrap, after the house
 *  and the A2 ghost (B world), before <A2Ground/>. */
export const DoorMatch: React.FC = () => {
  const t = useTime();
  // under the ghost (A2Ghost) the set's own door, browser and plaque are there
  if (t < A2_BAND_UNTIL || t >= DOOR_MATCH_UNTIL) return null;
  const zoom = camAt(t).zoom;
  const H4 = TERRACE.house4;
  const shade = H4.facade[0] + H4.facade[2] * 0.22; // the tan shade strip's right edge (502.3)
  const W = inkFloor(SI.mid, 1.9, zoom);
  return (
    <>
      <Fill rect={[shade - 12.3, 1356, 12.3, 135]} color={palette.tan} offset={false} mode="snap" seed="s9dm/t" />
      <Fill rect={[shade, 1356, 68, 135]} color={palette.sand} offset={false} mode="snap" seed="s9dm/s" />
      <XG m={a2ToBMat}>
        <ChromeSlot x={STOOP.browser[0]} y={STOOP.browser[1]} w={STOOP.browser[2]} h={STOOP.browser[3]} width={W} seed="stoop/hbw" />
        <FacadeDoor r={STOOP.door4} seed="stoop/door4" width={W} />
        <PlaqueSlot x={STOOP.plaque4.x} y={STOOP.plaque4.y} size={STOOP.plaque4.size} seed="stoop/pq4" width={inkFloor(SI.far, 1.4, zoom)} />
      </XG>
    </>
  );
};
