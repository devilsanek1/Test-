// S08 watchtower + searchlight (fix round 1). The dome district moved left of the board, so the set's v3 tower (fixed at
// x 600-650, on the board's top edge) is switched off (towerAt far in the future, no searchAt) and the scene draws its
// own tower INSIDE the glass by the right flank, in the set's silhouette style (tealDark lattice + cabin, dark window,
// no guard), and a flat light cone: one solid 1.6 px ink edge on the upper side, none below, stopping at the dome's far
// (left) side instead of the frame edge; fixed translucency (no fades), the fill stepped to a dusk value on 'day'.
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

/** The watchtower: rises at `at` (scaleY 0 -> 1.04 -> 1 about its base, 0.3 + 0.15 s). */
export const Watchtower8: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  if (t < at) return null;
  const p = prog(t, at, 0.3, E.outCubic);
  const tk = p < 1 ? p * 1.04 : 1.04 - 0.04 * prog(t, at + 0.3, 0.15);
  const T = TOWER8;
  return (
    <XG m={tk !== 1 ? mat.about(mat.scale(1, tk), (T.x0 + T.x1) / 2, T.base) : mat.I}>
      <Ink d={TOWER.lattice} width={3.2} color={palette.tealDark} taper={false} vary={0} seed="s8/tw" />
      <Fill d={TOWER.cabin} color={palette.tealDark} offset={false} seed="s8/twc" />
      <Fill d={TOWER.window} color={DEEP_WINDOW} offset={false} seed="s8/tww" />
      <Fill d={TOWER.lamp} color={palette.tealDark} offset={false} seed="s8/twl" />
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

/** The searchlight cone (pointing LEFT across the dome; angle = degrees BELOW the horizontal). */
export const Searchlight8: React.FC<{at: number; angle: (t: number) => number; duskAt?: number; half?: number}> = ({at, angle, duskAt, half = 7}) => {
  const t = useTime();
  const look = useLook();
  if (t < at || look.fills !== 'color') return null;
  const o = TOWER8.light;
  const a = angle(t);
  const grow = E.outCubic(prog(t, at, 0.35));
  const end = (deg: number): Pt => {
    const r = (deg * Math.PI) / 180;
    const s = rayToGlass(o, deg) * grow;
    return [o[0] - Math.cos(r) * s, o[1] + Math.sin(r) * s];
  };
  const up = end(a - half);
  const mid = end(a);
  const lo = end(a + half);
  const dusk = duskAt !== undefined && t >= duskAt;
  return (
    <>
      <path d={poly([o, up, mid, lo])} fill={dusk ? '#A0C7B5' : palette.cream} opacity={0.5} />
      <path d={`M${o[0]} ${o[1]}L${up[0].toFixed(1)} ${up[1].toFixed(1)}`} fill="none" stroke={palette.ink} strokeWidth={SI.hair} strokeLinecap="round" />
    </>
  );
};
