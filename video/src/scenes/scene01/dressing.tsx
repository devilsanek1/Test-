// S01 set dressing the scene adds to GovernmentPlaza (fix round 3, docs/scenes/S01.md). All pure functions of scene
// time; S12 (the loop seam) must draw the same pieces at their t = 0 state:
//   SunRipple     the press ripple in the glyph's CREAM (review: the kit's ink ring around the sun read as a sketched
//                 outline in the hook frame): r155 -> r195, thinning out over 0.2 s, same curve as SunPress 'release'.
//   DoorLanterns  two wall lanterns flanking govA's door (lit cream glass) that switch off on 'their' (the lamp's own
//                 lantern is cropped by the frame edge and eaten by the paint edge in the film).
//   S01Branch     a leafy plane-tree branch entering the TOP-RIGHT corner (x > 975, y < 250: outside the caption band
//                 and the sky ceiling), swaying: the hook frame's top-edge framing (every ref2 frame has one).
//   TreeTicks     (fix round 4) paints out the set tree's two level 'smile' ticks and draws three rim ticks instead.
//   LockRing      (fix round 4) the ring on govB's lock: a pop at r 30 / 3.4 px, easing to r 23.2 in the dive (= S02's
//                 74 px callout ring at the cut).
// Strokes are compensated in the dive by the enclosing <InkScale> (plaza.tsx wrap), not here.
import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, osc, prog, useTime} from '../../lib/time';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {circle, crownTicks, rectPath} from '../../lib/sketch';
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
export const DoorLanterns: React.FC<{offAt: number[]}> = ({offAt}) => (
  <>
    {DOOR_LANTERNS.map(({cx, glass}, i) => {
      const [gx, gy, gw, gh] = glass;
      const cap = `M${cx - 13} ${gy}L${cx} ${gy - 13}L${cx + 13} ${gy}Z`;
      const base = rectPath(cx - 11, gy + gh, 22, 5);
      const plate = rectPath(cx - 6, gy + gh + 13, 12, 7);
      const W = 2.4;
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

// ---------------------------------------------------------------- govD's tree: break the 'sleeping face'

/** The set's tree crown carries 4 seeded ticks (crownTicks(1078, 1300, 112, 124, 'gp/treek')); the two in frame sit
 *  level at ~(1035, 1370) / (1065, 1385) as a pair of 'smiles', and fix round 3's two extra ticks above them made the
 *  'closed eyes' (review: a sleeping face on the right edge). Fix round 4: the set's ticks are painted out with the
 *  crown's own sage (same path, a 10 px sage stroke, same sway), and three ticks of our own run ALONG the left rim
 *  ('(' contours tangent to the crown edge at three heights, none level with another, none a smile). Same sway as the
 *  set's tree: rotate osc(t, 0.3, 1.2) x 0.6 deg about the trunk foot (1058, 1558). Sets lane: drop when the set's
 *  ticks are re-seeded. */
const SET_TICKS = crownTicks(1078, 1300, 112, 124, {seed: 'gp/treek', n: 4, size: 13});
/** Rim ticks: angle on the crown ellipse (deg, 180 = left), radius fraction, half-length. */
const RIM_TICKS: [number, number, number][] = [
  [196, 0.8, 15],
  [158, 0.74, 13],
  [128, 0.7, 12],
];
export const TreeTicks: React.FC = () => {
  const t = useTime();
  const sway = osc(t, 0.3, 1.2) * 0.6;
  let d = '';
  for (const [deg, f, L] of RIM_TICKS) {
    const a = (deg * Math.PI) / 180;
    const cx = 1078 + Math.cos(a) * 112 * f;
    const cy = 1300 + Math.sin(a) * 124 * f;
    // tangent of the ellipse and the inward normal
    const tx = -Math.sin(a) * 112;
    const ty = Math.cos(a) * 124;
    const tl = Math.hypot(tx, ty);
    const ux = tx / tl;
    const uy = ty / tl;
    const nx = -Math.cos(a);
    const ny = -Math.sin(a);
    const P = (u: number, v: number) => `${(cx + ux * u + nx * v).toFixed(1)} ${(cy + uy * u + ny * v).toFixed(1)}`;
    d += `M${P(-L, 0)}Q${P(0, -6)} ${P(L, 0)}`;
  }
  return (
    <XG m={mat.about(mat.rotate(sway), 1058, 1558)}>
      <path d={SET_TICKS} fill="none" stroke={palette.sage} strokeWidth={10} strokeLinecap="round" />
      <Ink d={d} width={3.4} taper={false} seed="s01/treeTicks" />
    </XG>
  );
};

// ---------------------------------------------------------------- the ring on govB's lock

/** The ink ring around govB's lock box (fix round 4, review: drawn on from nothing in 0.12 s at r 24 / 2.4 px it was
 *  first visible 1-2 frames before the dive and too thin to settle on): fully drawn, it POPS 0.3 -> 1.15 -> 1 (0.13 s,
 *  like S01Padlock) at r 30 with 3.4 px ink, so it reads by f126 and holds ~0.2 s. In the dive its radius eases to
 *  23.2 (x 3.19 = 74 px at the cut = S02's callout ring r 64 x 1.15), so the matchcut ring keeps its size. */
export const LockRing: React.FC<{x: number; y: number; at: number; dive: number; cut: number; r?: number}> = ({x, y, at, dive, cut, r = 30}) => {
  const t = useTime();
  if (t < at) return null;
  const u = t - at;
  const pop = u < 0.05 ? 0.3 + 0.85 * E.outCubic(u / 0.05) : u < 0.13 ? 1.15 - 0.15 * E.inOutSine((u - 0.05) / 0.08) : 1;
  const rr = lerp(r, 23.2, E.inOutSine(clamp((t - dive) / (cut - dive))));
  return (
    <XG m={mat.about(mat.scale(pop), x, y)}>
      <Ink d={circle(x, y, rr, {seed: 's01/ring', overlap: 22})} width={3.4} taper={false} seed="s01/ring" />
    </XG>
  );
};
