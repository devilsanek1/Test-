// S01 set dressing the scene adds to GovernmentPlaza (fix round 3, docs/scenes/S01.md). All pure functions of scene
// time; S12 (the loop seam) must draw the same pieces at their t = 0 state:
//   SunRipple     the press ripple in the glyph's CREAM (review: the kit's ink ring around the sun read as a sketched
//                 outline in the hook frame): r155 -> r195, thinning out over 0.2 s, same curve as SunPress 'release'.
//   DoorLanterns  two wall lanterns flanking govA's door (lit cream glass) that switch off on 'their' (the lamp's own
//                 lantern is cropped by the frame edge and eaten by the paint edge in the film).
//   S01Branch     a leafy plane-tree branch entering the TOP-RIGHT corner (x > 975, y < 250: outside the caption band
//                 and the sky ceiling), swaying: the hook frame's top-edge framing (every ref2 frame has one).
import React from 'react';
import {palette} from '../../lib/theme';
import {osc, prog, useTime} from '../../lib/time';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {rectPath} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {releaseState} from '../shared/props';
import {LanternOff} from './shims';

// ---------------------------------------------------------------- the press ripple, in cream

/** The SunPress 'release' ripple (pass `ripple={false}` to SunPress) drawn in cream, 3.8 px at its emission radius:
 *  light leaving the button, not an outline. Frame 0 (u = 0) = the ring at r, full width. */
export const SunRipple: React.FC<{cx: number; cy: number; r: number; at: number; width?: number}> = ({cx, cy, r, at, width = 3.8}) => {
  const t = useTime();
  const u = t < at ? 0 : prog(t, at, 0.2);
  const [, rg, rw] = releaseState(u, 0.12);
  if (u >= 1 || rw <= 0.02) return null;
  return <circle cx={cx} cy={cy} r={r + rg} fill="none" stroke={palette.cream} strokeWidth={width * rw + 0.01} />;
};

// ---------------------------------------------------------------- govA's door lanterns ('their')

/** Wall lanterns flanking govA's door [148, 1228, 84, 164]: glass 18 x 26 (cream = lit), tealDark cap and base, a
 *  short stem to a wall plate. Glass rects for LanternOff. */
export const DOOR_LANTERNS: {cx: number; glass: [number, number, number, number]}[] = [
  {cx: 124, glass: [115, 1238, 18, 26]},
  {cx: 256, glass: [247, 1238, 18, 26]},
];
export const DoorLanterns: React.FC<{offAt: number[]; ink?: number}> = ({offAt, ink = 1}) => (
  <>
    {DOOR_LANTERNS.map(({cx, glass}, i) => {
      const [gx, gy, gw, gh] = glass;
      const cap = `M${cx - 13} ${gy}L${cx} ${gy - 13}L${cx + 13} ${gy}Z`;
      const base = rectPath(cx - 11, gy + gh, 22, 5);
      const plate = rectPath(cx - 6, gy + gh + 13, 12, 7);
      const W = 2.4 * ink;
      return (
        <React.Fragment key={i}>
          <Fill d={cap + base + plate} color={palette.tealDark} offset={false} mode="none" seed={`s01/dl${i}/f`} />
          <Fill d={rectPath(gx, gy, gw, gh)} color={palette.cream} offset={false} mode="none" seed={`s01/dl${i}/g`} />
          <Ink
            d={`${cap}${base}${plate}M${gx} ${gy}H${gx + gw}V${gy + gh}H${gx}Z` + `M${cx} ${gy + gh + 5}V${gy + gh + 13}M${cx} ${gy - 13}V${gy - 18}`}
            width={W}
            taper={false}
            seed={`s01/dl${i}/i`}
          />
          <LanternOff r={[gx + 2, gy + 2, gw - 4, gh - 4]} at={offAt[i]} seed={`s01/dl${i}/off`} />
        </React.Fragment>
      );
    })}
  </>
);

// ---------------------------------------------------------------- the top-right branch

/** Leaves along the twig: stem point, hang angle (deg, + = tip swings left), length, width, colour. The cluster hangs
 *  down the right edge (x ~980-1130, y -60..260 at frame 0; the push lifts it ~60 px), clear of the caption band. */
const LEAVES: {p: [number, number]; a: number; L: number; w: number; c: string}[] = [
  {p: [1094, -14], a: 22, L: 80, w: 34, c: palette.sage},
  {p: [1078, 36], a: -38, L: 84, w: 36, c: palette.tealDark},
  {p: [1068, 66], a: 30, L: 88, w: 36, c: palette.sage},
  {p: [1052, 116], a: -18, L: 82, w: 34, c: palette.teal},
  {p: [1044, 146], a: 44, L: 74, w: 32, c: palette.sage},
  {p: [1034, 184], a: 6, L: 72, w: 30, c: palette.sage},
  {p: [1036, 178], a: 62, L: 58, w: 26, c: palette.tealDark},
];
const TWIG = 'M1112 -64Q1062 58 1030 196M1074 44L1106 96';
const leafPath = (L: number, w: number) => `M0 0Q${w * 0.62} ${L * 0.42} 0 ${L}Q${-w * 0.62} ${L * 0.42} 0 0Z`;

/** The branch, in the NEAR layer (it leaves up and out with the dive). Sways about its off-frame root (1.4 deg,
 *  0.35 Hz) and each leaf flutters (+-5 deg, 0.8-1.1 Hz, own phase): continuous life in the top band. */
export const S01Branch: React.FC = () => {
  const t = useTime();
  const sway = osc(t, 0.35, 0.4) * 1.4;
  return (
    <XG m={mat.about(mat.rotate(sway), 1112, -64)}>
      <Ink d={TWIG} width={4.8} taper seed="s01/br/tw" />
      {LEAVES.map((l, i) => {
        const fl = osc(t, 0.8 + 0.06 * i, i * 1.3) * 5;
        const d = leafPath(l.L, l.w);
        return (
          <XG key={i} m={mat.compose(mat.translate(l.p[0], l.p[1]), mat.rotate(l.a + fl))}>
            <Fill d={d} color={l.c} offset={false} mode="none" seed={`s01/br/l${i}`} />
            <Ink d={d} width={3.4} taper={false} seed={`s01/br/li${i}`} />
            <Ink d={`M0 2L0 ${(l.L * 0.78).toFixed(1)}`} width={2.2} taper={false} color={l.c === palette.tealDark ? palette.sage : palette.ink} seed={`s01/br/v${i}`} />
          </XG>
        );
      })}
    </XG>
  );
};

// ---------------------------------------------------------------- govD's tree: break the 'smiling face'

/** Two more leaf ticks on the tree crown at other heights and angles (review: its two level 'smile' arcs at ~(1035,1370)
 *  / (1065,1385) read as a closed-eyed face on the right edge; style bible: 3-5 ticks per crown, never two level).
 *  Same sway as the set's tree (rotate osc(t, 0.3, 1.2) x 0.6 deg about the trunk foot (1058, 1558)), MID ink. */
const CROWN_TICKS: [number, number, number][] = [
  [1006, 1268, 24],
  [1052, 1226, -14],
];
export const TreeTicks: React.FC = () => {
  const t = useTime();
  const sway = osc(t, 0.3, 1.2) * 0.6;
  let d = '';
  for (const [x, y, a] of CROWN_TICKS) {
    const c = Math.cos((a * Math.PI) / 180);
    const s = Math.sin((a * Math.PI) / 180);
    const P = (u: number, v: number) => `${(x + u * c - v * s).toFixed(1)} ${(y + u * s + v * c).toFixed(1)}`;
    d += `M${P(-12, 0)}Q${P(0, 9)} ${P(12, 0)}`;
  }
  return (
    <XG m={mat.about(mat.rotate(sway), 1058, 1558)}>
      <Ink d={d} width={3.4} taper={false} seed="s01/treeTicks" />
    </XG>
  );
};
