// S08 watchtower + searchlight (fix round 1; fix round 3: it has to READ with the sound off: 'Cloudflare sees it').
// The dome district moved left of the board, so the set's v3 tower (fixed at x 600-650, on the board's top edge) is
// switched off (towerAt far in the future, no searchAt) and the scene draws its own tower INSIDE the glass by the right
// flank: an INK-DARK silhouette (lattice + cabin) against the peach band with a one-sided peach rim (sun side), no guard.
// The light (fix round 3b, the playbook's light-shaft recipe): a CORE cone (half 7 deg) of cream at a fixed 0.85 inside
// one stepped HALO (half 13 deg: ~1.8x the core) of cream at a fixed 0.4 (static translucency: a light shaft; no fades,
// no opacity change all scene), both halo edges thin SOLID ink, switching on in 2 frames with a 3-frame lamp flash, a
// flat cream lit spot where it lands (on the glass, or a lit POOL on the crowd at the dome's foot: BeamSpot).
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {useLook} from '../../lib/exit';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import type {Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {SI} from '../shared/sets';
import {DOME8, TOWER8} from './layout';

const poly = (p: Pt[]) => p.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('') + 'Z';
const DEEP_WINDOW = '#2F4A49';

const TOWER = (() => {
  const T = TOWER8;
  const [cx, cy, cw, ch] = T.cabin;
  const legL: [Pt, Pt] = [[T.x0 - 6, T.base], [cx + 5, cy + ch]];
  const legR: [Pt, Pt] = [[T.x1 + 6, T.base], [cx + cw - 5, cy + ch]];
  const at = (leg: [Pt, Pt], u: number): Pt => [leg[0][0] + (leg[1][0] - leg[0][0]) * u, leg[0][1] + (leg[1][1] - leg[0][1]) * u];
  // A1 fix round 1: TWO legs and TWO X-braces (the 4-level lattice read as an oil derrick / pylon at phone size): a
  // lookout on stilts
  let lattice = `M${legL[0][0]} ${legL[0][1]}L${legL[1][0]} ${legL[1][1]}M${legR[0][0]} ${legR[0][1]}L${legR[1][0]} ${legR[1][1]}`;
  const us = [0.04, 0.47, 0.9];
  for (let i = 0; i < us.length - 1; i++) {
    const a0 = at(legL, us[i]);
    const b0 = at(legR, us[i]);
    const b1 = at(legR, us[i + 1]);
    const a1 = at(legL, us[i + 1]);
    lattice += `M${a0[0].toFixed(1)} ${a0[1].toFixed(1)}L${b1[0].toFixed(1)} ${b1[1].toFixed(1)}M${b0[0].toFixed(1)} ${b0[1].toFixed(1)}L${a1[0].toFixed(1)} ${a1[1].toFixed(1)}`;
  }
  const cabin =
    `M${cx} ${cy}h${cw}v${ch}h${-cw}Z` +
    poly([
      [cx - 9, cy + 3],
      [cx + cw / 2, T.top],
      [cx + cw + 9, cy + 3],
    ]) +
    `M${cx - 4} ${cy + ch - 3}h${cw + 8}v5h${-cw - 8}Z`;
  const window = `M${cx + 5} ${cy + 7}h${cw - 10}v${(ch * 0.42).toFixed(1)}h${-(cw - 10)}Z`;
  const lamp = `M${T.light[0] - 6} ${T.light[1] - 6}h10v12h-10Z`;
  return {lattice, cabin, window, lamp};
})();

/** The cabin's sun-side (right) rim: a peach strip down the cabin's right edge + along the roof's right slope. */
const CABIN_RIM = (() => {
  const T = TOWER8;
  const [cx, cy, cw, ch] = T.cabin;
  const r = 3.2;
  return (
    poly([
      [cx + cw - r, cy + 2],
      [cx + cw, cy + 2],
      [cx + cw, cy + ch - 3],
      [cx + cw - r, cy + ch - 3],
    ]) +
    poly([
      [cx + cw / 2 + 2, T.top + 2],
      [cx + cw + 9, cy + 3],
      [cx + cw + 5, cy + 3 + r * 0.6],
      [cx + cw / 2 + 1, T.top + 2 + r],
    ])
  );
})();

/** The watchtower: rises at `at` (scaleY 0 -> 1.04 -> 1 about its base, 0.3 + 0.15 s). Fix round 3: an INK-DARK
 *  silhouette on the peach band (was tealDark on pale glass: its rise on 'says' was lost) with a peach rim. */
export const Watchtower8: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  if (t < at) return null;
  const p = prog(t, at, 0.3, E.outCubic);
  const tk = p < 1 ? p * 1.04 : 1.04 - 0.04 * prog(t, at + 0.3, 0.15);
  const T = TOWER8;
  return (
    <XG m={tk !== 1 ? mat.about(mat.scale(1, tk), (T.x0 + T.x1) / 2, T.base) : mat.I}>
      <Ink d={TOWER.lattice} width={3.4} color={palette.ink} taper={false} vary={0} seed="s8/tw" />
      <Fill d={TOWER.cabin} color={palette.ink} offset={false} seed="s8/twc" />
      <Fill d={CABIN_RIM} color={palette.peach} offset={false} seed="s8/twr" />
      <Fill d={TOWER.window} color={DEEP_WINDOW} offset={false} seed="s8/tww" />
      <Fill d={TOWER.lamp} color={palette.ink} offset={false} seed="s8/twl" />
    </XG>
  );
};

/** Distance along a ray from the lamp (inside the dome) to the glass or the dome's foot line. */
function rayToGlass(o: Pt, deg: number): number {
  const a = DOME8;
  const r = (deg * Math.PI) / 180;
  const dx = -Math.cos(r);
  const dy = Math.sin(r);
  const X0 = o[0] - a.cx;
  const Y0 = a.by - o[1];
  // ((X0 + dx s) / rx)^2 + ((Y0 - dy s) / ry)^2 = 1
  const A = (dx * dx) / (a.rx * a.rx) + (dy * dy) / (a.ry * a.ry);
  const B = 2 * ((X0 * dx) / (a.rx * a.rx) - (Y0 * dy) / (a.ry * a.ry));
  const C = (X0 * X0) / (a.rx * a.rx) + (Y0 * Y0) / (a.ry * a.ry) - 1;
  const disc = Math.max(0, B * B - 4 * A * C);
  let s = (-B + Math.sqrt(disc)) / (2 * A);
  if (dy > 0) s = Math.min(s, (a.by - o[1]) / dy);
  return Math.max(0, s);
}

/** Where the cone's centre line meets the glass at time t (for the scene: who the beam catches). */
export const beamEnd = (deg: number): Pt => {
  const o = TOWER8.light;
  const s = rayToGlass(o, deg);
  const r = (deg * Math.PI) / 180;
  return [o[0] - Math.cos(r) * s, o[1] + Math.sin(r) * s];
};

/** Where the beam's centre line ends at time t: on the glass, or (pointing down past the foot) on the crowd in front
 *  of it (`foot` = true). */
export const beamHit = (deg: number): {p: Pt; foot: boolean} => {
  const e = beamEnd(deg);
  return {p: e, foot: e[1] >= DOME8.by - 0.5};
};

/** The searchlight (pointing LEFT across the dome; angle = degrees BELOW the horizontal). Fix round 3b: a cream CORE
 *  (half `core` deg, fixed 0.85) inside a stepped HALO (half `half` deg, fixed 0.4), both halo edges thin solid ink, full
 *  length in 2 frames (0.07 s) with a 3-frame lamp flash, a flat cream lit spot where the centre line meets the glass.
 *  Constant translucency all scene (the old 0.7 -> 0.5 step on 'day' is gone). Clip it to the dome interior. */
export const Searchlight8: React.FC<{at: number; angle: (t: number) => number; half?: number; core?: number}> = ({at, angle, half = 13, core = 7}) => {
  const t = useTime();
  const look = useLook();
  if (t < at || look.fills !== 'color') return null;
  const o = TOWER8.light;
  const a = angle(t);
  const grow = E.outCubic(prog(t, at, 0.07));
  const end = (deg: number): Pt => {
    const r = (deg * Math.PI) / 180;
    const s = rayToGlass(o, deg) * grow;
    return [o[0] - Math.cos(r) * s, o[1] + Math.sin(r) * s];
  };
  const fan = (hw: number) => poly([o, end(a - hw), end(a - hw * 0.5), end(a), end(a + hw * 0.5), end(a + hw)]);
  const up = end(a - half);
  const lo = end(a + half);
  const mid = end(a);
  const flash = t < at + 0.1;
  const hit = beamHit(a);
  const tan = (a * Math.PI) / 180;
  return (
    <>
      <path d={fan(half)} fill={palette.cream} opacity={0.4} />
      <path d={fan(core)} fill={palette.cream} opacity={0.85} />
      {grow >= 0.999 && !hit.foot ? <ellipse cx={mid[0]} cy={mid[1]} rx={14} ry={7} transform={`rotate(${((-tan * 180) / Math.PI + 90).toFixed(1)} ${mid[0].toFixed(1)} ${mid[1].toFixed(1)})`} fill={palette.cream} /> : null}
      <path d={`M${o[0]} ${o[1]}L${up[0].toFixed(1)} ${up[1].toFixed(1)}M${o[0]} ${o[1]}L${lo[0].toFixed(1)} ${lo[1].toFixed(1)}`} fill="none" stroke={palette.ink} strokeWidth={1.6} strokeLinecap="round" />
      {flash ? <circle cx={o[0] - 3} cy={o[1]} r={11} fill={palette.cream} stroke={palette.ink} strokeWidth={1.6} /> : <circle cx={o[0] - 3} cy={o[1]} r={6.5} fill={palette.cream} stroke={palette.ink} strokeWidth={1.8} />}
    </>
  );
};

/** The lit POOL on the attempters OUTSIDE the glass (A1 fix round 1: the counted heap presses on the dome's left
 *  flank): while the beam's centre line meets the left flank low down (y >= `minY`), a flat cream pool sits just
 *  OUTSIDE the glass at that point (drawn under the heap's figures, over the city behind them), elongated along the
 *  flank, popping 1.25x for 2 frames at `popAt` (the beam landing on 'hacking'). The beam's own lit spot on the glass
 *  (Searchlight8) sits right inside, so light runs from the lamp through the glass onto the people outside. Pointing
 *  down past the foot line, it falls on the foot. */
export const BeamSpot: React.FC<{at: number; angle: (t: number) => number; until?: number; popAt?: number; minY?: number}> = ({at, angle, until, popAt, minY = 960}) => {
  const t = useTime();
  const look = useLook();
  if (t < at + 0.07 || (until !== undefined && t >= until) || look.fills !== 'color') return null;
  const hit = beamHit(angle(t));
  const k = popAt !== undefined && t >= popAt && t < popAt + 0.067 ? 1.25 : 1;
  if (hit.foot) return <ellipse cx={hit.p[0]} cy={DOME8.by - 2} rx={46 * k} ry={13 * k} fill={palette.cream} />;
  const [hx, hy] = hit.p;
  if (hy < minY || hx > DOME8.cx) return null;
  // the flank's outward normal at the hit (left side of the ellipse)
  const nx = (hx - DOME8.cx) / (DOME8.rx * DOME8.rx);
  const ny = (hy - DOME8.by) / (DOME8.ry * DOME8.ry);
  const nl = Math.hypot(nx, ny) || 1;
  const ux = nx / nl;
  const uy = ny / nl;
  const deg = (Math.atan2(uy, ux) * 180) / Math.PI;
  const cx = hx + ux * 22;
  const cy = hy + uy * 22;
  return <ellipse cx={cx} cy={cy} rx={30 * k} ry={44 * k} transform={`rotate(${deg.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`} fill={palette.cream} />;
};
