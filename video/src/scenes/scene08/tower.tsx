// S08 watchtower + searchlight (fix round 1; fix round 3: it has to READ with the sound off: 'Cloudflare sees it').
// The dome district moved left of the board, so the set's v3 tower (fixed at x 600-650, on the board's top edge) is
// switched off (towerAt far in the future, no searchAt) and the scene draws its own tower INSIDE the glass by the right
// flank: an INK-DARK silhouette (lattice + cabin) against the peach band with a one-sided peach rim (sun side), no guard.
// The light: a wide flat CREAM cone (half 15 deg) at a FIXED ~0.7 translucency (static light shaft: no fades), both edges
// inked (upper solid, lower dashed), switching on in 2 frames with a 3-frame lamp flash, a flat cream lit spot where it
// lands (on the glass, or on the crowd at the dome's foot: BeamSpot); one step quieter on 'day'.
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
  let lattice = `M${legL[0][0]} ${legL[0][1]}L${legL[1][0]} ${legL[1][1]}M${legR[0][0]} ${legR[0][1]}L${legR[1][0]} ${legR[1][1]}`;
  const us = [0, 0.24, 0.48, 0.72, 0.9];
  for (let i = 0; i < us.length - 1; i++) {
    const a0 = at(legL, us[i]);
    const b0 = at(legR, us[i]);
    const b1 = at(legR, us[i + 1]);
    const a1 = at(legL, us[i + 1]);
    lattice += `M${a0[0].toFixed(1)} ${a0[1].toFixed(1)}L${b0[0].toFixed(1)} ${b0[1].toFixed(1)}`;
    lattice += i % 2 ? `M${a0[0].toFixed(1)} ${a0[1].toFixed(1)}L${b1[0].toFixed(1)} ${b1[1].toFixed(1)}` : `M${b0[0].toFixed(1)} ${b0[1].toFixed(1)}L${a1[0].toFixed(1)} ${a1[1].toFixed(1)}`;
  }
  const cabin =
    `M${cx} ${cy}h${cw}v${ch}h${-cw}Z` +
    poly([
      [cx - 5, cy + 1],
      [cx + cw / 2, T.top],
      [cx + cw + 5, cy + 1],
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
      [cx + cw + 5, cy + 1],
      [cx + cw + 1, cy + 1 + r * 0.6],
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

/** The searchlight cone (pointing LEFT across the dome; angle = degrees BELOW the horizontal). Fix round 3: half 15 deg,
 *  flat cream at a fixed 0.7 (0.5 after `duskAt`), both edges inked (upper solid, lower dashed), full length in 2
 *  frames (0.07 s) with a 3-frame lamp flash, a flat cream lit spot where the centre line meets the glass. Clip it to
 *  the dome interior in the scene. */
export const Searchlight8: React.FC<{at: number; angle: (t: number) => number; duskAt?: number; half?: number}> = ({at, angle, duskAt, half = 15}) => {
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
  const up = end(a - half);
  const mid = end(a);
  const lo = end(a + half);
  const q1 = end(a - half * 0.5);
  const q2 = end(a + half * 0.5);
  const dusk = duskAt !== undefined && t >= duskAt;
  const flash = t < at + 0.1;
  const hit = beamHit(a);
  const tan = (a * Math.PI) / 180;
  return (
    <>
      <path d={poly([o, up, q1, mid, q2, lo])} fill={palette.cream} opacity={dusk ? 0.5 : 0.7} />
      {grow >= 0.999 && !hit.foot ? <ellipse cx={mid[0]} cy={mid[1]} rx={13} ry={7} transform={`rotate(${((-tan * 180) / Math.PI + 90).toFixed(1)} ${mid[0].toFixed(1)} ${mid[1].toFixed(1)})`} fill={palette.cream} /> : null}
      <path d={`M${o[0]} ${o[1]}L${up[0].toFixed(1)} ${up[1].toFixed(1)}`} fill="none" stroke={palette.ink} strokeWidth={2} strokeLinecap="round" />
      <path d={`M${o[0]} ${o[1]}L${lo[0].toFixed(1)} ${lo[1].toFixed(1)}`} fill="none" stroke={palette.ink} strokeWidth={1.6} strokeLinecap="round" strokeDasharray="9 7" />
      {flash ? <circle cx={o[0] - 3} cy={o[1]} r={11} fill={palette.cream} stroke={palette.ink} strokeWidth={1.6} /> : <circle cx={o[0] - 3} cy={o[1]} r={3.6} fill={palette.cream} />}
    </>
  );
};

/** The lit spot on the crowd in front of the dome's foot while the beam points down past the foot line: a flat cream
 *  pool (drawn under the pile's figures). */
export const BeamSpot: React.FC<{at: number; angle: (t: number) => number; until?: number}> = ({at, angle, until}) => {
  const t = useTime();
  const look = useLook();
  if (t < at + 0.07 || (until !== undefined && t >= until) || look.fills !== 'color') return null;
  const hit = beamHit(angle(t));
  if (!hit.foot) return null;
  // on the foot where the beam meets it (over the plinth and the glass's bottom), the caught heads in front of it
  return <ellipse cx={hit.p[0]} cy={DOME8.by - 3} rx={32} ry={10} fill={palette.cream} />;
};
