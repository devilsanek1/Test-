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
import {fromLch, lch} from '../../lib/light';
import {CM} from '../../v2r/palette';
import {S1_AIR} from '../../v2r/world/skies';
import {skyColorAt, type SkySpec} from '../../lib/sky';
import {neverBand} from '../../lib/water';
import {forTier} from './darks';
import {s1Sky} from './V2S1_sky';
import {useSwitches} from './switches';

/** S1's far stage: its horizon behind the far roofs (y 806, 159 px over the lens's 965), its camera 30 m up, f twice the
 *  lens's 1400 px (the designed view draws the far city 2x what one camera allows). Bases land at y 832-838, hidden. */
export const S1_STAGE = farStage({horizon: 806, f: 2800, height: 30, vpx: 540});
/** Distances (m): the ghost skyline (+5) and the landmark (+4) a little nearer. */
export const S1_STAGE_Z = {ghost: 3200, mark: 2600} as const;
/** The landmark's spot (screen x of its axis) and its real heights (m): shaft, antenna rings, drum crown, mast. */
export const S1_MARK = {x: 100, top: 189} as const;

/** The stage's ladder: S1's air with the ghost step (lib/depth PLANE_STEPS_GHOST: +4 0.65, +5 0.87). */
const STAGE_ATM = makeAtmosphere({name: 'v2 S1 far stage', air: S1_AIR, steps: PLANE_STEPS_GHOST, hueTurn: 30});

/** The landmark's two flat height bands (fix pass 1, REVIEW.md MUST 6): the crown, the upper rings and the mast stand
 *  in the pale mint-to-warm sky at y ~635-708, the shaft in the warm glow below; each band takes the sky right beside
 *  it at its own height as its air (x 100: CRAFT §f.1, "the air is the sky right behind the plane"; the east cluster
 *  already did this at y 632). Split at the neck under the drum crown (130 m: y ~698), where the sky's chroma ramp (C* ~5
 *  at the mast's tip, ~12.5 at y 698, ~20 in the glow) can be met within +-4 by one flat tone on each side. */
const MARK_SPLIT_M = 130;
/** The landmark's warm pale foot starts here (screen y), where the shaft meets the horizon glow (MUST 6: ~740). */
const MARK_FOOT_Y = 735;
/** A far anchor's flat tone for one height band, from the sky beside it (MUST 6's targets on every row: L* >= 86,
 *  paler than the far roofs; C* within 4 of the air and >= 8; dE76 <= 8 from the sky beside it): sampled at x over
 *  [y0, y1], its value `dL` under the band's darkest sky row (never under L* 86.2), its chroma the middle of the band's
 *  sky chroma, its hue the sky's chroma-weighted mean hue; turned toward rose in 5 deg steps if it would land in the
 *  olive band (neverBand: the pale cream sky at h ~85-100). */
function bandTone(sky: SkySpec, x: number, y0: number, y1: number, dL = 2.5): string {
  let Lmin = 100;
  let Cmin = 200;
  let Cmax = 0;
  let sa = 0;
  let sb = 0;
  // the sky on both sides of the tower (40 px off its axis), as the eye compares it
  for (let y = y0; y <= y1; y += 4) {
    for (const xx of [x - 40, x + 40]) {
      const q = lch(skyColorAt(sky, y, xx));
      Lmin = Math.min(Lmin, q.L);
      Cmin = Math.min(Cmin, q.C);
      Cmax = Math.max(Cmax, q.C);
      sa += q.C * Math.cos((q.h * Math.PI) / 180);
      sb += q.C * Math.sin((q.h * Math.PI) / 180);
    }
  }
  const C = Math.max(8, (Cmin + Cmax) / 2);
  let h = ((Math.atan2(sb, sa) * 180) / Math.PI + 360) % 360;
  const L = Math.max(86.2, Lmin - dL);
  let c = fromLch(L, C, h);
  for (let i = 0; i < 8 && neverBand(c); i++) {
    h = (h - 5 + 360) % 360;
    c = fromLch(L, C, h);
  }
  return c;
}

/** The far stage's tones, as SHOWN and as authored for tier C (darks.ts forTier). The landmark in two bands, each from
 *  the sky at its own height (dE ~4-7 from the sky beside it: a pale silhouette, paler than the far roofs), its lit
 *  sliver +2.5 L*, tone-on-tone rings 1.4 L* under its body (so every row stays >= L* 86), a warm pale foot only where it meets the glow (y >= 735);
 *  the ghost skyline at the ghost step in two rows (the far row a step nearer the air), the cluster over the wing's
 *  roofline toned from the sky at y 632. `palette10b`: the live sky (10b's calmer band, or v2's). */
export function s1StageTones(palette10b = false) {
  const sky = s1Sky(palette10b);
  const at = (y: number, x: number = S1_MARK.x) => skyColorAt(sky, y, x);
  const upAir = at(667);
  const lowAir = at(723);
  // the bands' screen rows: the mast's tip (189 m) to the split, the split to the foot (y 748)
  const yOf = (m: number) => S1_STAGE.baseY(S1_STAGE_Z.mark) - S1_STAGE.scale(S1_STAGE_Z.mark) * m;
  const ySplit = yOf(MARK_SPLIT_M);
  const up = bandTone(sky, S1_MARK.x, Math.round(yOf(S1_MARK.top)), Math.round(ySplit), 2.0);
  const low = bandTone(sky, S1_MARK.x, Math.round(ySplit), MARK_FOOT_Y - 2, 1.0);
  const lift = (c: string, dL: number) => {
    const q = lch(c);
    return fromLch(Math.min(99, q.L + dL), q.C, q.h);
  };
  const foot = bandTone(sky, S1_MARK.x, MARK_FOOT_Y, 772, -0.8);
  const ghost = anchorTones(STAGE_ATM, 5, {shade: CM.shadeCool});
  const ghostFar = anchorTones(at(722, 60), 5, {k: 0.93});
  const east = anchorTones(skyColorAt(sky, 632, 450), 5, {shade: CM.shadeCool});
  const a = (c: string) => forTier(c, 'environment');
  return {
    shown: {up, low, foot, ghost, ghostFar, east, upAir, lowAir},
    mark: {up: a(up), upLit: a(lift(up, 2.5)), upRing: a(lift(up, -1.4)), low: a(low), lowLit: a(lift(low, 2.5)), lowRing: a(lift(low, -1.4)), foot: a(foot)},
    ghost: {body: a(ghost.body), lit: a(ghost.lit), foot: a(ghost.foot)},
    ghostFar: {body: a(ghostFar.body)},
    east: {body: a(east.body), lit: a(east.lit)},
    problems: [...ghost.problems, ...ghostFar.problems, ...east.problems],
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
/** (fix pass 1, REVIEW.md SHOULD 9) The far city goes on across the whole west gap at two values: a farther, paler row
 *  (z 4200, 0.667 px/m, base y 826) rising behind the near ghost row, from the frame's edge past the landmark to the
 *  sun's left edge, where it stays under the sun's visible cap (x >= 132: under y ~770). Heights m. */
const GHOST_FAR_Z = 4200;
const GHOST_FAR: [number, number][] = [
  [-40, 150], [-4, 150], [-4, 172], [26, 172], [26, 158], [52, 158], [52, 186], [70, 186], [70, 164], [92, 164], [92, 150],
  [116, 150], [116, 140], [132, 140], [132, 84], [252, 84],
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
  const {palette10b} = useSwitches();
  const T = s1StageTones(!!palette10b);
  const st = S1_STAGE;
  const zg = S1_STAGE_Z.ghost;
  const zm = S1_STAGE_Z.mark;
  const ghostFar = st.profile(GHOST_FAR, GHOST_FAR_Z);
  const ghost = st.profile(GHOST_WEST, zg);
  const ghostEast = st.profile(GHOST_EAST, zg);
  const litOf = (west: boolean) => GHOST_LIT.filter(([x0]) => (x0 < 252) === west).map(([x0, x1, h]) => quadPath(st.front({x0, x1, z: zg, h}))).join('');
  const mx = S1_MARK.x;
  // the landmark in its two height bands (MUST 6): the parts above MARK_SPLIT_M take the upper sky's tone, the rest the
  // glow's; a part that straddles the split is cut there
  const band = (upper: boolean) => (hw: number, a0: number, b0: number) => {
    const a1 = upper ? Math.max(a0, MARK_SPLIT_M) : a0;
    const b1 = upper ? b0 : Math.min(b0, MARK_SPLIT_M);
    return b1 > a1 ? quadPath(st.front({x0: mx - hw, x1: mx + hw, z: zm, h: b1 - a1, level: a1})) : '';
  };
  const partsOf = (upper: boolean) => MARK_PARTS.map(([hw, a, b]) => band(upper)(hw, a, b)).join('');
  // the lit sliver: the sun-side (right) third of the shaft, the rings and the crown
  const litOfBand = (upper: boolean) =>
    MARK_PARTS.slice(0, 7)
      .map(([hw, a, b]) => {
        const a1 = upper ? Math.max(a, MARK_SPLIT_M) : a;
        const b1 = upper ? b : Math.min(b, MARK_SPLIT_M);
        return b1 > a1 ? quadPath(st.front({x0: mx + hw * 0.36, x1: mx + hw, z: zm, h: b1 - a1, level: a1})) : '';
      })
      .join('');
  const rings = MARK_RINGS.map(([a, b]) => quadPath(st.front({x0: mx - 13, x1: mx + 13, z: zm, h: b - a, level: a}))).join('');
  // the warm pale foot: only where it meets the glow (y >= MARK_FOOT_Y), down to the hidden base
  const footTop = MARK_FOOT_Y;
  const foot = quadPath([[mx - 8.5, footTop], [mx + 8.5, footTop], [mx + 8.5, st.baseY(zm)], [mx - 8.5, st.baseY(zm)]]);
  return (
    <>
      <Fill d={ghostFar} color={T.ghostFar.body} offset={false} seed="s1stage/ghostFar" />
      <Fill d={ghost} color={T.ghost.body} offset={false} seed="s1stage/ghost" />
      <Fill d={litOf(true)} color={T.ghost.lit} offset={false} seed="s1stage/ghostLit" />
      <Fill d={ghostEast} color={T.east.body} offset={false} seed="s1stage/ghostEast" />
      <Fill d={litOf(false)} color={T.east.lit} offset={false} seed="s1stage/ghostEastLit" />
      <Fill d={partsOf(false)} color={T.mark.low} offset={false} seed="s1stage/markLow" />
      <Fill d={partsOf(true)} color={T.mark.up} offset={false} seed="s1stage/mark" />
      <Fill d={litOfBand(false)} color={T.mark.lowLit} offset={false} seed="s1stage/markLitLow" />
      <Fill d={litOfBand(true)} color={T.mark.upLit} offset={false} seed="s1stage/markLit" />
      <Fill d={rings} color={T.mark.upRing} offset={false} seed="s1stage/markRings" />
      <Fill d={foot} color={T.mark.foot} offset={false} seed="s1stage/markFoot" />
    </>
  );
};

/** The far stage's things for lib/depth sizeProblems (tagged 'far': measured on its own horizon, lib/persp splitStages). */
export const S1_STAGE_THINGS = [S1_STAGE.thing('the landmark (telecom tower, 189 m)', S1_STAGE_Z.mark, S1_MARK.top), S1_STAGE.thing('a ghost tower (239 m)', S1_STAGE_Z.ghost, 239)];
