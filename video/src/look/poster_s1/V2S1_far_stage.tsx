// The look test's FAR STAGE (STUDY.md §10 item 7; owner, 2026-10-29: decision 4 (a), the designed view; CRAFT §f.5;
// perspective.md L2; pro_1_depth.md §3.2 and §4: "a far group across the left quarter and over the wing's roofline:
// the far city at k 0.64 and a ghost ridge or skyline at k 0.87 with one landmark rising to y ~640-700").
// S1 is the home place's establishing view, so it may lift its far city onto a second horizon: lib/persp `farStage`
// (its own level pinhole, frontal, drawn twice the lens's scale: the posters' landmark bigger than one camera allows),
// its junction hidden behind the far roofs and the wing (the hiding band: no receding line in the far zone). On it:
//   the ghost skyline (+5)  a pale row of towers behind the far roofs, rising over them on the left (tops y ~712-748)
//                           and just over the wing's west roofline (tops >= y 622: the caption band ends at 600), low
//                           where the sun sets (its visible cap stays whole: one near-level edge, never a notch)
//   the landmark (+4)       ONE slender telecom tower (London's read: a shaft, stacked antenna rings, a drum crown, a
//                           mast) at x ~100, left of the sun, rising to y ~635; tone-on-tone rings, a lit sliver on the
//                           sun side, a pale foot where it meets the far roofs (the mist line)
// Tones: lane E's `anchorTones` on S1's air through a ghost-step atmosphere (lib/depth PLANE_STEPS_GHOST), authored
// through the pen's tier-C pull (darks.ts forTier) so the frame shows E's values. Tier C, no line, still in the float
// (the stage's share is 0: it is at infinity). Frame 0: pale shapes like the rest; the flood reaches it first.
import React from 'react';
import {Fill} from '../../lib/Fill';
import {farStage, type Quad} from '../../lib/persp';
import {anchorTones, makeAtmosphere, PLANE_STEPS_GHOST} from '../../lib/depth';
import {CM} from '../../v2r/palette';
import {S1_AIR, S1_EVENING} from '../../v2r/world/skies';
import {skyColorAt} from '../../lib/sky';
import {forTier} from './darks';

/** S1's far stage: its horizon behind the far roofs (y 806, 159 px over the lens's 965), its camera 30 m up, f twice the
 *  lens's 1400 px (the designed view draws the far city 2x what one camera allows). Bases land at y 832-838, hidden. */
export const S1_STAGE = farStage({horizon: 806, f: 2800, height: 30, vpx: 540});
/** Distances (m): the ghost skyline (+5) and the landmark (+4) a little nearer. */
export const S1_STAGE_Z = {ghost: 3200, mark: 2600} as const;
/** The landmark's spot (screen x of its axis) and its real heights (m): shaft, antenna rings, drum crown, mast. */
export const S1_MARK = {x: 100, top: 189} as const;

/** The stage's ladder: S1's air with the ghost step (lib/depth PLANE_STEPS_GHOST: +4 0.65, +5 0.87). */
const STAGE_ATM = makeAtmosphere({name: 'v2 S1 far stage', air: S1_AIR, steps: PLANE_STEPS_GHOST, hueTurn: 30});

/** The far stage's tones, as SHOWN (anchorTones) and as authored for tier C. The landmark at k 0.8 (dE ~8-10 from its
 *  air: a firm pale shape, still paler than anything nearer), the ghost skyline at the ghost step (dE <= 6). */
export function s1StageTones() {
  const mark = anchorTones(STAGE_ATM, 4, {shade: CM.shadeCool, k: 0.8});
  const ghost = anchorTones(STAGE_ATM, 5, {shade: CM.shadeCool});
  // the cluster over the wing's roofline stands in the sky's cooler, paler air at y ~632 (the light band), not in the
  // warm horizon's: its ghost takes that air (CRAFT §f.1: the air is the sky right behind the plane)
  const east = anchorTones(skyColorAt(S1_EVENING, 632, 450), 5, {shade: CM.shadeCool});
  const a = (c: string) => forTier(c, 'environment');
  return {
    shown: {mark, ghost, east},
    mark: {body: a(mark.body), lit: a(mark.lit), foot: a(mark.foot), detail: a(mark.detail)},
    ghost: {body: a(ghost.body), lit: a(ghost.lit), foot: a(ghost.foot)},
    east: {body: a(east.body), lit: a(east.lit)},
    problems: [...mark.problems, ...ghost.problems, ...east.problems],
  };
}

const quadPath = (q: Quad) => `M${q.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`;

/** The ghost skyline's profile: [screen x, height m] at the ghost's distance (scale 0.875 px/m, base y 832). West of
 *  the sun it rises over the far roofs (FAR tops y 752-774); round the sun (x 140-252) it stays under them; behind the
 *  calm tower and the wing a taller cluster shows only over the wing's roofline (coping y 656 at x 330 -> 636 at 600). */
const GHOST_WEST: [number, number][] = [
  [-40, 100], [-8, 100], [-8, 112], [20, 112], [20, 96], [36, 96], [36, 132], [60, 132], [60, 108], [78, 108], [78, 96],
  [128, 96], [128, 104], [146, 104], [146, 70], [252, 70],
];
const GHOST_EAST: [number, number][] = [
  [252, 70], [252, 150], [330, 150], [330, 226], [368, 226], [368, 208], [404, 208], [404, 239], [438, 239], [438, 212],
  [492, 212], [492, 230], [522, 230], [522, 204], [620, 204],
];
/** The lit facets (the sun is low in the west-southwest, on the screen's left of the eastern cluster and on the right of
 *  the landmark): a narrow lit face on the sun side of a few ghost towers (x0, x1, height m). */
const GHOST_LIT: [number, number, number][] = [[36, 44, 132], [330, 338, 226], [404, 411, 239], [492, 498, 230]];

/** The landmark's parts (half-widths in px at its distance, heights in m): a slender shaft, two antenna rings with
 *  necks, the drum crown, the top section, the mast (>= 5 px: nothing hair-thin on a far plane, CRAFT §f.2). */
const MARK_PARTS: [number, number, number][] = [
  // [half width px, from m, to m]
  [8.5, 0, 108],
  [12, 108, 114],
  [8, 114, 121],
  [12, 121, 127],
  [8, 127, 133],
  [13, 133, 151],
  [10, 151, 167],
  [2.5, 167, 189],
];
/** Tone-on-tone rings on the drum crown (from m, to m). */
const MARK_RINGS: [number, number][] = [[137, 140], [144, 147], [155, 158]];

/** The far stage: drawn behind the far roofs, after the sun (S1WestGap). */
export const S1FarStage: React.FC = () => {
  const T = s1StageTones();
  const st = S1_STAGE;
  const zg = S1_STAGE_Z.ghost;
  const zm = S1_STAGE_Z.mark;
  const ghost = st.profile(GHOST_WEST, zg);
  const ghostEast = st.profile(GHOST_EAST, zg);
  const litOf = (west: boolean) => GHOST_LIT.filter(([x0]) => (x0 < 252) === west).map(([x0, x1, h]) => quadPath(st.front({x0, x1, z: zg, h}))).join('');
  const mx = S1_MARK.x;
  const parts = MARK_PARTS.map(([hw, a, b]) => quadPath(st.front({x0: mx - hw, x1: mx + hw, z: zm, h: b - a, level: a}))).join('');
  // the lit sliver: the sun-side (right) third of the shaft, the rings and the crown
  const lit = MARK_PARTS.slice(0, 7).map(([hw, a, b]) => quadPath(st.front({x0: mx + hw * 0.36, x1: mx + hw, z: zm, h: b - a, level: a}))).join('');
  const rings = MARK_RINGS.map(([a, b]) => quadPath(st.front({x0: mx - 13, x1: mx + 13, z: zm, h: b - a, level: a}))).join('');
  // the pale foot: its lowest visible stretch, just over the far roofs (the mid row's ridge at y ~782 there)
  const footTop = 760;
  const foot = quadPath([[mx - 8.5, footTop], [mx + 8.5, footTop], [mx + 8.5, st.baseY(zm)], [mx - 8.5, st.baseY(zm)]]);
  return (
    <>
      <Fill d={ghost} color={T.ghost.body} offset={false} seed="s1stage/ghost" />
      <Fill d={litOf(true)} color={T.ghost.lit} offset={false} seed="s1stage/ghostLit" />
      <Fill d={ghostEast} color={T.east.body} offset={false} seed="s1stage/ghostEast" />
      <Fill d={litOf(false)} color={T.east.lit} offset={false} seed="s1stage/ghostEastLit" />
      <Fill d={parts} color={T.mark.body} offset={false} seed="s1stage/mark" />
      <Fill d={lit} color={T.mark.lit} offset={false} seed="s1stage/markLit" />
      <Fill d={rings} color={T.mark.detail} offset={false} seed="s1stage/markRings" />
      <Fill d={foot} color={T.mark.foot} offset={false} seed="s1stage/markFoot" />
    </>
  );
};

/** The far stage's things for lib/depth sizeProblems (tagged 'far': measured on its own horizon, lib/persp splitStages). */
export const S1_STAGE_THINGS = [S1_STAGE.thing('the landmark (telecom tower, 189 m)', S1_STAGE_Z.mark, S1_MARK.top), S1_STAGE.thing('a ghost tower (239 m)', S1_STAGE_Z.ghost, 239)];
