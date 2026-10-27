// dc/bloom.tsx: a blossoming tree's crown, drawn the same way everywhere in the Arlington kit (the near-mid slope, the
// terrace tree, the planter crabapple): a dark mass (the twig network and its buds), limbs in ink that fork into twigs
// poking past the silhouette, then CLUMPS of blossom (small lobed masses, lit on the side facing the sun, mauve in
// the shade) and clusters of single flowers on top. With `burstAt` the clumps and clusters pop in 4 frames
// (TREATMENT section 6: "the slot's trees burst into blossom in 4 frames"); before it, only the dark mass, the limbs
// and buds show. Flat fills, no fade.

import React, {useMemo} from 'react';
import {CM} from '../../palette';
import {useTime} from '../../../lib/time';
import {Batch, Paint, mix, crownD, ellD, rng, blossomD, burstScale, type Pt} from './core';
import {tiered} from '../tiers';

export type BloomTones = {
  base: string;
  limb: string;
  shade: string;
  mid: string;
  lit: string;
  flower: string;
  flowerShade: string;
  white: string;
  bud: string;
};

/** Near, backlit or side-lit cherries on a light page (deck / near-mid: plane steps 0-1). */
export const BLOOM_NEAR: BloomTones = {
  base: mix(CM.shadeWarm, CM.anchor, 0.42),
  limb: CM.anchor,
  shade: mix(CM.shadeWarm, CM.blossom, 0.22),
  mid: mix(CM.shadeWarm, CM.blossom, 0.5),
  lit: mix(CM.blossom, CM.brickLight, 0.18),
  flower: CM.blossom,
  flowerShade: mix(CM.blossom, CM.shadeWarm, 0.32),
  white: CM.paper,
  bud: mix(CM.leafRust, CM.shadeWarm, 0.25),
};

export type CrownSpec = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  seed: string;
  /** Unit vector toward the light (screen). */
  light: Pt;
  /** Bloom density 0..1. */
  bloom?: number;
  /** Draw the limbs (ink). */
  limbs?: boolean;
  /** Limb ink width at this size (px). */
  ink?: number;
};

type Clump = {x: number; y: number; rx: number; ry: number; col: string; seed: string; i: number};
type Flower = {x: number; y: number; r: number; col: string; i: number};

function layout(c: CrownSpec, T: BloomTones) {
  const r = rng(`${c.seed}/bloom`);
  const base = crownD(c.cx, c.cy, c.rx, c.ry, `${c.seed}/b`, Math.max(7, Math.round(c.rx / 18)), 0.28);
  // limbs: from below the crown's centre, fanning up to ~0.8 of the radius, each forking into 2-3 twigs past the edge
  let limbs = '';
  let twigs = '';
  const n = c.rx > 120 ? 5 : c.rx > 60 ? 4 : 3;
  const root: Pt = [c.cx + r.range(-0.05, 0.05) * c.rx, c.cy + c.ry * 0.95];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + ((k - (n - 1) / 2) / n) * 2.3 + r.range(-0.15, 0.15);
    const end: Pt = [c.cx + Math.cos(a) * c.rx * 0.72, c.cy + Math.sin(a) * c.ry * 0.72];
    const mid: Pt = [(root[0] + end[0]) / 2 + r.range(-0.12, 0.12) * c.rx, (root[1] + end[1]) / 2];
    limbs += `M${root[0].toFixed(1)} ${root[1].toFixed(1)}Q${mid[0].toFixed(1)} ${mid[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
    for (let j = 0; j < 3; j++) {
      const b = a + r.range(-0.55, 0.55);
      const len = r.range(0.25, 0.42);
      const tx = end[0] + Math.cos(b) * c.rx * len;
      const ty = end[1] + Math.sin(b) * c.ry * len;
      twigs += `M${end[0].toFixed(1)} ${end[1].toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}`;
    }
  }
  // clumps: small lobed masses over the crown, toned by their side toward the light
  const clumps: Clump[] = [];
  const nc = Math.max(5, Math.round(((c.rx * c.ry) / 1500) * (c.bloom ?? 0.8)));
  for (let i = 0; i < nc; i++) {
    const a = r.range(0, Math.PI * 2);
    const d = Math.sqrt(r.next()) * 0.82;
    const x = c.cx + Math.cos(a) * c.rx * d;
    const y = c.cy + Math.sin(a) * c.ry * d * 0.92;
    const side = (Math.cos(a) * c.light[0] + Math.sin(a) * c.light[1]) * d;
    const col = side > 0.35 ? T.lit : side > -0.15 ? T.mid : T.shade;
    const s = r.range(0.16, 0.28);
    clumps.push({x, y, rx: c.rx * s, ry: c.ry * s * 0.8, col, seed: `${c.seed}/c${i}`, i});
  }
  // clumps toward the light last (on top)
  clumps.sort((p, q) => (p.x - c.cx) * c.light[0] + (p.y - c.cy) * c.light[1] - ((q.x - c.cx) * c.light[0] + (q.y - c.cy) * c.light[1]));
  // single flowers: pink on the lit side, white sparks on the rim, mauve inside
  const flowers: Flower[] = [];
  const nf = Math.round(((c.rx * c.ry) / 420) * (c.bloom ?? 0.8));
  for (let i = 0; i < nf; i++) {
    const a = r.range(0, Math.PI * 2);
    const d = Math.sqrt(r.next()) * 0.92;
    const side = (Math.cos(a) * c.light[0] + Math.sin(a) * c.light[1]) * d;
    const col = side > 0.55 && r.chance(0.35) ? T.white : side > 0 ? T.flower : T.flowerShade;
    flowers.push({x: c.cx + Math.cos(a) * c.rx * d, y: c.cy + Math.sin(a) * c.ry * d * 0.9, r: Math.max(3, Math.min(14, c.rx * r.range(0.05, 0.09))), col, i: i + nc});
  }
  return {base, limbs, twigs, clumps, flowers};
}

export type BloomCrownsProps = {
  crowns: CrownSpec[];
  tones?: BloomTones;
  /** Scene time the clumps and flowers burst (4 frames). Undefined = in bloom. */
  burstAt?: number;
  seed?: string;
  misreg?: number | false;
};

/** Several blossoming crowns, back to front, in one batched drawing (each crown: mass, limbs, clumps, flowers). */
const BloomCrownsBody: React.FC<BloomCrownsProps> = ({crowns, tones = BLOOM_NEAR, burstAt, seed = 'bloom', misreg = 3}) => {
  const t = useTime();
  const L = useMemo(() => crowns.map((c) => layout(c, tones)), [crowns, tones]);
  const build = (scaleOf: (i: number) => number) => {
    const B = new Batch();
    crowns.forEach((c, k) => {
      const l = L[k];
      B.layer();
      B.fill(tones.base, l.base);
      if (c.limbs !== false) {
        const w = c.ink ?? Math.max(2.2, Math.min(5, c.rx / 30));
        B.ink(l.limbs, w, tones.limb, 0, {thing: true});
        B.ink(l.twigs, w * 0.55, tones.limb, 0, {thing: true});
      }
      B.layer();
      let buds = '';
      for (const q of l.clumps) {
        const sc = scaleOf(q.i);
        if (sc > 0) B.fill(q.col, sc === 1 ? crownD(q.x, q.y, q.rx, q.ry, q.seed, 6, 0.25) : crownD(q.x, q.y, q.rx * sc, q.ry * sc, q.seed, 6, 0.25));
        else buds += ellD(q.x, q.y, Math.max(2, q.rx * 0.1), Math.max(1.6, q.ry * 0.09));
      }
      for (const f of l.flowers) {
        const sc = scaleOf(f.i);
        if (sc > 0) B.fill(f.col, blossomD(f.x, f.y, f.r * sc, `${seed}/f${k}/${f.i}`, 3));
      }
      if (buds) B.fill(tones.bud, buds);
    });
    return B;
  };
  const bloomed = burstAt === undefined || t >= burstAt + 0.12;
  const before = burstAt !== undefined && t < burstAt;
  const full = useMemo(() => build(() => 1), [L]);
  const bare = useMemo(() => build(() => 0), [L]);
  const b = bloomed ? full : before ? bare : build((i) => burstScale(t, burstAt, i));
  return <Paint b={b} seed={seed} misreg={misreg} />;
};
export const BloomCrowns = tiered('environment', {}, BloomCrownsBody);
