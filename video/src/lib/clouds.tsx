// lib/clouds.tsx: the HERO CUMULUS, an engine primitive (city-poster study 2026-10-28, `pro_3_nature.md` §3.4 and N5 c;
// STUDY.md §3, §10 item 9). The posters' "real effects" in the sky are soft air: the tablecloth cloud's top edge is
// 7.5 px wide against a building's 1.9. We draw that softness the clean pen's way (owner, 2026-10-29: "Go with your
// suggestions" on the study's C2): flat steps, never blur, a gradient or an opacity.
//
//   <Cumulus spec={HERO} wind={WIND} />              a lit top of lobes 3-8 % of its width, a flat base, a belly a step
//                                                    down (dL* -6 to -10, cooler), soft edges where it thins as 2 flat
//                                                    steps of 3.5 px toward the sky there, drifting 2-6 px/s, never
//                                                    reshaped
//   cloudProblems([cumulusGeometry(HERO)], {t1: 7})  // [] = OK: clear of the caption band over its whole drift
//
// HOW (built once per spec, cached; the drift is one translate): the cloud is a union of circles (2-4 towers on a flat
// base, shoulders at its ends, small lobes along the towers' upper outline: Earle's blob, then smaller and smaller
// lobes), so its outline and every soft step are exact (a circle grown by d is the step d px out; SVG's nonzero fill
// unions the subpaths). Inside the union, cut by the flat base: the belly tone; over it the circles moved toward the key
// as faceted polygons in the body tone (the terminator is a low-poly cut, the silhouette stays round), the lit caps on
// the lobes facing the key, and the belly band along the base with a faceted top. Real at the silhouette and in the air,
// low poly where the light turns, like the foliage (lib/foliage.tsx). Libraries: none (the note: ENGINE_NATURE.md §2).

import React, {useId} from 'react';
import {Fill} from './Fill';
import {useTime} from './time';
import {fromLch, lch, mixHex} from './light';
import {rng} from './rng';
import {neverBand} from './water';
import {lightVec, type LightInput, type Pt} from './foliage';
import type {Wind} from './wind';

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const r1 = (n: number) => Math.round(n * 10) / 10;

export type CloudTones = {lit: string; body: string; belly: string};

/** A cumulus's three flat tones from its sky: the lit top a warm white (the key's warmth, h 78), the body a step
 *  under it, the belly dL* -8 under the body and cooler (toward the sky's hue, turned toward blue). Never beige: the
 *  body keeps C* < 6 at L* >= 86 or sits in the warm-white band. */
export function cloudTones(o: {sky: string; warmHue?: number; lit?: number; body?: number; belly?: number}): CloudTones {
  const s = lch(o.sky);
  const litL = o.lit ?? clamp(s.L + 11, 93, 97.5);
  const bodyL = o.body ?? litL - 3.5;
  const bellyL = o.belly ?? bodyL - 6.5;
  return {
    lit: fromLch(litL, 7, o.warmHue ?? 78),
    body: fromLch(bodyL, 4.5, (o.warmHue ?? 78) + 8),
    // the belly: a step down and cooler, its hue between the sky's and a soft violet (never a separate blue slab)
    belly: fromLch(bellyL, 6, (s.h + 24) % 360),
  };
}

export type CumulusSpec = {
  seed: string;
  /** The flat base: its left end x, its y (canvas px at t = 0), the cloud's width, and its height (base to the top). */
  x: number;
  base: number;
  w: number;
  h: number;
  /** Towers on the base (2-4, default 3). */
  towers?: number;
  /** THE key (one light for all nature): lib/light's rig or sun, or a 3D vector toward the light. */
  light: LightInput;
  /** The sky around the cloud (a colour, or lib/sky's skyColorAt as (x, y) => colour): the soft steps go toward it. */
  sky: string | ((x: number, y: number) => string);
  tones?: CloudTones;
  /** The soft edge where it thins: `steps` flat steps of `px` each toward the sky (default 2 x 3.5 px; >= 3 px a step). */
  soft?: {steps?: number; px?: number};
  /** Drift along the wind (px/s, default 3: N7's 2-6, slower than anything on the ground). */
  drift?: number;
  /** The top lobes' radius as a share of the width (default [0.03, 0.075]: the tablecloth's 3-8 %). */
  lobes?: [number, number];
};

type Circle = {x: number; y: number; r: number; soft: boolean; facing: number; lobe: boolean};
export type CumulusGeom = {
  spec: CumulusSpec;
  tones: CloudTones;
  /** The union of every circle (one path, nonzero). */
  union: string;
  /** The soft steps, outermost first: path and colour. */
  rings: {d: string; color: string}[];
  /** Inside the union, in order: the body (faceted, moved toward the key), the lit caps, the belly band. */
  inner: {d: string; color: string}[];
  /** [x0, y0, x1, y1] at t = 0, the soft steps included. */
  bbox: [number, number, number, number];
  stats: {lobePx: [number, number]; lobeShare: [number, number]; stepPx: number; steps: number; towers: number};
};

const circleD = (c: {x: number; y: number; r: number}) => `M${r1(c.x - c.r)} ${r1(c.y)}a${r1(c.r)} ${r1(c.r)} 0 1 0 ${r1(c.r * 2)} 0a${r1(c.r)} ${r1(c.r)} 0 1 0 ${r1(-c.r * 2)} 0Z`;

/** A circle as a 32-gon (its sagitta < 0.5 px up to r ~ 100: reads round). */
function circlePts(x: number, y: number, r: number, n = 32): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) out.push([x + Math.cos((i / n) * Math.PI * 2) * r, y + Math.sin((i / n) * Math.PI * 2) * r]);
  return out;
}
const area2 = (p: Pt[]) => p.reduce((acc, q, i) => acc + q[0] * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * q[1], 0) / 2;
const polyD = (p: Pt[]) => {
  const q = area2(p) < 0 ? p.slice().reverse() : p;
  return 'M' + q.map(([a, b]) => `${r1(a)} ${r1(b)}`).join('L') + 'Z';
};
/** Sutherland-Hodgman: a polygon clipped by a convex polygon (either winding). */
function clipConvex(subject: Pt[], clip: Pt[]): Pt[] {
  const cw = area2(clip) > 0;
  let out = subject;
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i];
    const b = clip[(i + 1) % clip.length];
    const side = (p: Pt) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const inside = (p: Pt) => (cw ? side(p) >= 0 : side(p) <= 0);
    const next: Pt[] = [];
    for (let j = 0; j < out.length; j++) {
      const p = out[j];
      const q = out[(j + 1) % out.length];
      if (inside(p)) next.push(p);
      if (inside(p) !== inside(q)) {
        const k = side(p) / (side(p) - side(q));
        next.push([p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]);
      }
    }
    out = next;
  }
  return out.length >= 3 ? out : [];
}
/** The convex region on the key's side of a straight cut through `c` (`u` px toward the key), turned `turn` deg, bent
 *  once by `bend` px toward the shade (a two-facet terminator). */
function facetCut(c: Pt, L2: Pt, u: number, turn: number, bend: number, size: number): Pt[] {
  const a = Math.atan2(L2[1], L2[0]) + (turn * Math.PI) / 180;
  const nx = Math.cos(a);
  const ny = Math.sin(a);
  const tx = -ny;
  const ty = nx;
  const q: Pt = [c[0] + nx * u, c[1] + ny * u];
  const far = size * 3;
  const A: Pt = [q[0] - tx * far, q[1] - ty * far];
  const B: Pt = [q[0] + tx * far, q[1] + ty * far];
  const M: Pt = [q[0] + tx * size * 0.12 * Math.sign(bend || 1) - nx * Math.abs(bend), q[1] + ty * size * 0.12 * Math.sign(bend || 1) - ny * Math.abs(bend)];
  return [A, M, B, [B[0] + nx * far, B[1] + ny * far], [A[0] + nx * far, A[1] + ny * far]];
}

const CACHE = new Map<string, CumulusGeom>();

/** The cumulus, built once per spec (cached by its content). */
export function cumulusGeometry(spec: CumulusSpec): CumulusGeom {
  const key = JSON.stringify(spec, (_, v) => (typeof v === 'function' ? `fn:${String(v).length}` : v));
  const hit = CACHE.get(key);
  if (hit) return hit;
  const g = buildCumulus(spec);
  if (CACHE.size > 64) CACHE.clear();
  CACHE.set(key, g);
  return g;
}

function buildCumulus(spec: CumulusSpec): CumulusGeom {
  const R = rng(`cumulus/${spec.seed}`);
  const {x, base, w, h} = spec;
  const L = lightVec(spec.light);
  // a cloud hangs high in the light: its lit side faces up more than a thing on the ground does
  const up: Pt = [L[0], L[1] - 0.8 * Math.max(0.3, Math.hypot(L[0], L[1]))];
  const ln = Math.hypot(up[0], up[1]) || 1;
  const L2: Pt = [up[0] / ln, up[1] / ln];
  const skyAt = (px: number, py: number) => (typeof spec.sky === 'function' ? spec.sky(px, py) : spec.sky);
  const tones = spec.tones ?? cloudTones({sky: skyAt(x + w / 2, base - h / 2)});
  const steps = spec.soft?.steps ?? 2;
  const px = spec.soft?.px ?? 3.5;
  const [l0, l1] = spec.lobes ?? [0.03, 0.075];

  // ---- the masses: towers on the flat base (the tallest a little off-centre), overlapping, a row of low masses along
  //      the base joining them (a cumulus is one body on one flat base), shoulders at its ends
  const n = clamp(spec.towers ?? 3, 1, 5);
  const peak = R.range(0.3, 0.55);
  const big: Circle[] = [];
  for (let i = 0; i < n; i++) {
    const u = n > 1 ? lerp(0.22, 0.78, i / (n - 1)) + R.jitter(0.03) : 0.5;
    const hi = h * clamp(1 - 1.35 * Math.abs(u - peak) ** 1.5 + R.jitter(0.06), 0.55, 1);
    const r = Math.min(hi * R.range(0.58, 0.68), (w / Math.max(1, n - 0.4)) * 0.62);
    big.push({x: x + u * w, y: base - hi + r, r, soft: false, facing: 0, lobe: false});
  }
  const nb = Math.max(3, n + 2);
  for (let i = 0; i < nb; i++) {
    const u = lerp(0.12, 0.88, i / (nb - 1));
    const r = h * R.range(0.36, 0.44);
    big.push({x: x + u * w, y: base + r * 0.25, r, soft: false, facing: 0, lobe: false});
  }
  const sh = h * R.range(0.26, 0.32);
  big.push({x: x + w * 0.05 + sh * 0.5, y: base - sh * 0.5, r: sh, soft: true, facing: 0, lobe: false});
  big.push({x: x + w * 0.95 - sh * 0.5, y: base - sh * 0.45, r: sh * 0.92, soft: true, facing: 0, lobe: false});

  // ---- the lobes: small circles along the masses' upper outline (outside every other mass, above the base)
  const lobes: Circle[] = [];
  const inside = (p: Pt, except: number, pad = 0.5) => big.some((c, j) => j !== except && Math.hypot(p[0] - c.x, p[1] - c.y) < c.r - pad);
  big.forEach((c, i) => {
    const mean = w * (l0 + l1) * 0.5;
    const stepA = (mean * 1.15) / c.r;
    for (let a = Math.PI * 1.02; a < Math.PI * 1.98; a += stepA * R.range(0.85, 1.15)) {
      const p: Pt = [c.x + Math.cos(a) * c.r, c.y + Math.sin(a) * c.r];
      if (p[1] > base - 8 || inside(p, i)) continue;
      const rl = w * R.range(l0, l1) * (0.8 + 0.4 * clamp((base - p[1]) / h, 0, 1));
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      const lowSide = (base - p[1]) / h < 0.42;
      lobes.push({x: p[0] - nx * rl * 0.42, y: p[1] - ny * rl * 0.42, r: rl, soft: lowSide || c.soft, facing: nx * L2[0] + ny * L2[1], lobe: true});
    }
  });
  const all = big.concat(lobes);
  const cx = all.reduce((s, c) => s + c.x, 0) / all.length;
  const cy = all.reduce((s, c) => s + c.y, 0) / all.length;
  for (const c of big) {
    const l = Math.hypot(c.x - cx, c.y - cy) || 1;
    c.facing = ((c.x - cx) / l) * L2[0] + ((c.y - cy) / l) * L2[1];
  }
  const union = all.map(circleD).join('');

  // ---- the soft steps where it thins: the soft circles grown by k x px, outermost first, toward the sky there
  const softs = all.filter((c) => c.soft);
  const sx = softs.reduce((s, c) => s + c.x, 0) / Math.max(1, softs.length);
  const sy = softs.reduce((s, c) => s + c.y, 0) / Math.max(1, softs.length);
  const air = skyAt(sx, sy);
  const edge = mixHex(tones.body, tones.belly, 0.5);
  const rings: {d: string; color: string}[] = [];
  for (let k = steps; k >= 1; k--) {
    rings.push({d: softs.map((c) => circleD({x: c.x, y: c.y, r: c.r + k * px})).join(''), color: mixHex(edge, air, k / (steps + 1))});
  }

  // ---- inside: the body is the whole union moved toward the key (its shade a crescent along the edges facing away);
  //      the lit band is the lobes facing the key, moved further, cut once by a straight facet (low poly where the
  //      light turns; the silhouette stays round)
  const d1 = h * 0.06;
  const body = all.map((c) => circleD({x: c.x + L2[0] * d1, y: c.y + L2[1] * d1, r: c.r})).join('');
  const d2 = h * 0.13;
  const cx0 = all.reduce((acc, c) => acc + c.x * c.r * c.r, 0) / all.reduce((acc, c) => acc + c.r * c.r, 0);
  const cy0 = all.reduce((acc, c) => acc + c.y * c.r * c.r, 0) / all.reduce((acc, c) => acc + c.r * c.r, 0);
  const cut = facetCut([cx0, cy0], L2, h * R.range(0.12, 0.24), R.jitter(16), h * R.range(0.03, 0.08) * R.sign(), w);
  const caps = all
    .filter((c) => c.facing > -0.05)
    .map((c) => clipConvex(circlePts(c.x + L2[0] * d2, c.y + L2[1] * d2, c.r * 0.86), cut))
    .filter((q) => q.length >= 3)
    .map(polyD)
    .join('');
  // the belly: the low masses' undersides in the cloud's own shade (a lobed top, thicker away from the key), the flat
  //      base under it
  // the belly: the flat base's own shade, a wedge (thin under the lit side, thick away from the key: the shade wrapping
  //      under the cloud), its top two straight facets
  const sag = h * R.range(0.16, 0.21);
  let band = `M${r1(x - w * 0.1)} ${r1(base + 2)}`;
  for (let i = 0; i <= 2; i++) {
    const u = i / 2;
    const away = L2[0] >= 0 ? 1 - u : u; // 0 on the key's side .. 1 away from it
    band += `L${r1(x - w * 0.06 + w * 1.12 * u)} ${r1(base - sag * lerp(0.35, 1.45, away) * R.range(0.92, 1.08))}`;
  }
  band += `L${r1(x + w * 1.1)} ${r1(base + 2)}Z`;
  const inner = [
    {d: body, color: tones.body},
    {d: caps, color: tones.lit},
    {d: band, color: tones.belly},
  ];
  const ext = steps * px;
  const bbox: [number, number, number, number] = [
    Math.min(...all.map((c) => c.x - c.r)) - ext,
    Math.min(...all.map((c) => c.y - c.r)) - ext,
    Math.max(...all.map((c) => c.x + c.r)) + ext,
    base,
  ];
  const lr = lobes.map((c) => c.r);
  const stats = {
    lobePx: [lr.length ? Math.min(...lr) : 0, lr.length ? Math.max(...lr) : 0] as [number, number],
    lobeShare: [lr.length ? Math.min(...lr) / w : 0, lr.length ? Math.max(...lr) / w : 0] as [number, number],
    stepPx: px,
    steps,
    towers: n,
  };
  return {spec, tones, union, rings, inner, bbox, stats};
}

/** The cloud's drift at time t (px): along the wind's horizontal sense, `drift` px/s (clouds never reshape). */
export function cloudOffset(spec: CumulusSpec, t: number, wind?: Wind): Pt {
  const v = spec.drift ?? 3;
  const sgn = wind ? (wind.u[0] >= 0 ? 1 : -1) : 1;
  return [sgn * v * t, 0];
}

export type CumulusProps = {spec: CumulusSpec; wind?: Wind; t?: number};

/** The hero cumulus: flat steps only, drifting as one translate. Its fills are backdrops (part of the sky: never
 *  recoloured by a clean-pen tier) and follow the paper state and the frame-0 flood like the World sky's neighbours. */
export const Cumulus: React.FC<CumulusProps> = ({spec, wind, t: tIn}) => {
  const tScene = useTime();
  const t = tIn ?? tScene;
  const g = cumulusGeometry(spec);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [dx, dy] = cloudOffset(spec, t, wind);
  const [x0, y0, x1] = g.bbox;
  const pad = 40;
  return (
    <g transform={`translate(${dx.toFixed(3)} ${dy.toFixed(3)})`}>
      <defs>
        <clipPath id={`cb${id}`} clipPathUnits="userSpaceOnUse">
          <rect x={x0 - pad} y={y0 - pad} width={x1 - x0 + pad * 2} height={spec.base - (y0 - pad)} />
        </clipPath>
        <clipPath id={`cu${id}`} clipPathUnits="userSpaceOnUse">
          <path d={g.union} />
        </clipPath>
      </defs>
      <g clipPath={`url(#cb${id})`}>
        {g.rings.map((r, i) => (
          <Fill key={`r${i}`} d={r.d} color={r.color} offset={false} backdrop seed={`cumulus/${spec.seed}/r${i}`} />
        ))}
        <Fill d={g.union} color={g.tones.belly} offset={false} backdrop seed={`cumulus/${spec.seed}/u`} />
        <g clipPath={`url(#cu${id})`}>
          {g.inner.map((l, i) => (
            <Fill key={`i${i}`} d={l.d} color={l.color} offset={false} backdrop seed={`cumulus/${spec.seed}/i${i}`} />
          ))}
        </g>
      </g>
    </g>
  );
};

/** The cloud checks (empty = OK): clear of the caption band (y 290-600) over its whole drift [t0, t1], every soft step
 *  >= 3 px (a thinner step bands or twinkles), the drift 2-6 px/s, the top lobes 3-8 % of the width, the belly 6-10 L*
 *  under the body and cooler, the lit top >= 5 L* over its sky, no tone in the never bands. */
export function cloudProblems(geoms: CumulusGeom[], o: {band?: [number, number]; t0?: number; t1?: number; wind?: Wind} = {}): string[] {
  const out: string[] = [];
  const [b0, b1] = o.band ?? [290, 600];
  for (const g of geoms) {
    const s = g.spec;
    const name = `cumulus ${s.seed}`;
    const a = cloudOffset(s, o.t0 ?? 0, o.wind);
    const b = cloudOffset(s, o.t1 ?? 7, o.wind);
    const y0 = g.bbox[1] + Math.min(a[1], b[1]);
    const y1 = g.bbox[3] + Math.max(a[1], b[1]);
    if (y0 < b1 && y1 > b0) out.push(`${name}: y ${Math.round(y0)}-${Math.round(y1)} reaches the caption band (y ${b0}-${b1})`);
    if (g.stats.stepPx < 3) out.push(`${name}: soft steps of ${g.stats.stepPx} px (>= 3)`);
    const v = Math.abs(s.drift ?? 3);
    if (v < 2 || v > 6) out.push(`${name}: drifts ${v} px/s (2-6)`);
    if (g.stats.lobeShare[0] < 0.025 || g.stats.lobeShare[1] > 0.085) out.push(`${name}: top lobes ${(g.stats.lobeShare[0] * 100).toFixed(1)}-${(g.stats.lobeShare[1] * 100).toFixed(1)} % of the width (3-8 %)`);
    const tl = lch(g.tones.lit);
    const tb = lch(g.tones.body);
    const tbe = lch(g.tones.belly);
    const step = tb.L - tbe.L;
    if (step < 6 - 0.3 || step > 10 + 0.3) out.push(`${name}: the belly sits ${step.toFixed(1)} L* under the body (6-10)`);
    const sky = typeof s.sky === 'function' ? s.sky(s.x + s.w / 2, s.base - s.h / 2) : s.sky;
    if (tl.L - lch(sky).L < 5) out.push(`${name}: the lit top is only ${(tl.L - lch(sky).L).toFixed(1)} L* over its sky (>= 5)`);
    for (const [k, c] of Object.keys(g.tones).map((q) => [q, (g.tones as Record<string, string>)[q]] as [string, string])) {
      const band = neverBand(c);
      if (band) out.push(`${name}: ${k} ${c} sits in the ${band} band`);
    }
  }
  return out;
}
