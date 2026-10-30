// HAIR v2: the builder (RECIPE.md (a)-(c)). A head of hair = a BASE MASS (the cut's silhouette: who she is) plus a few
// tapered LOCKS in three sizes and 0-4 WISPS (the life), with GAPS at the edge, a PARTING and the light: two flat tones
// and one head-scale terminator (the head is the form), a thin shade edge on each lit lock where it turns away, slivers
// of shade where a lock overlaps the hair behind it (never drawn lines), and sheen dashes across the locks, one per wave
// crest, stepped between neighbours. A STATE (states.ts) bends every lock by the bend rule; gravity keeps long locks
// hanging when the head bows. The level of detail follows the figure's drawn height (a.6).
// The cut data (cuts.ts) is per view in head units; this file never knows a cut by name.
import type {V2} from '../graphic/geo';
import type {Tone} from '../graphic/color';
import type {Part, Region} from '../graphic/part';
import type {HeadFrame} from '../graphic_faces/head';
import {buildLock, lockShade, sheenDash, crestsLit, splitSliver, smoothPath, polyPath, smooth, type Lock, type MP, type Wave} from './lock';
import type {Cut, LockDef, ViewDef, CloudDef} from './cuts';
import {CALM, DTIP, AIR, type HairState} from './states';

export type HairView = 'q' | 'p' | 'b';
export type HairOpts = {
  hf: HeadFrame;
  view: HairView;
  faceX: number;
  tone: Tone;
  cut: Cut;
  state?: HairState;
  /** the figure's drawn height in px (crown to sole): sets the level of detail and the pixel minimums */
  px?: number;
  /** the back view's turn toward screen-left (0..1): the cheek's sliver shows past the hair */
  turn?: number;
  /** a second, warmer sheen band toward the tips (light hair, a.5) */
  sheen2?: string;
  /** draw the rim on the silhouette edges facing the key (the subject only) */
  rim?: string;
  /** part names start with this (default 'hair') */
  name?: string;
  /** move every z by this (to sit the hair in front of a prop) */
  dz?: number;
};

/** The default widest widths by size (u, a.2) and their default level of detail. */
export const SIZE_W: Record<LockDef['size'], number> = {B: 0.4, M: 0.21, S: 0.1, W: 0.026};
const SIZE_LOD: Record<LockDef['size'], number> = {B: 0, M: 1, S: 2, W: 2};
const SIZE_AIR: Record<LockDef['size'], number> = {B: 0.75, M: 0.9, S: 1.05, W: 1.8};

/** The level of detail from the figure's drawn height (a.6): 3 close (>= 300 px), 2 film (160-300), 1 small
 *  (130-160), 0 tiny (60-130). */
export const lodOf = (px: number) => (px >= 300 ? 3 : px >= 160 ? 2 : px >= 130 ? 1 : 0);

/** Toward the key light in head units (screen: from the upper left), un-rotated by the head's roll. */
function lightU(hf: HeadFrame): V2 {
  const a = (-hf.rot * Math.PI) / 180;
  const x = -0.88;
  const y = -0.474;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
}

const rotAbout = (p: V2, c: V2, deg: number): V2 => {
  const a = (deg * Math.PI) / 180;
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};
const cross = (a: V2, b: V2) => a[0] * b[1] - a[1] * b[0];
const sgn = (v: number) => (v > 0 ? 1 : v < 0 ? -1 : 0);

type Built = {def: LockDef; L: Lock; z: number; fill: string; tone: 'lit' | 'shade' | 'deep'; name: string; box: [number, number, number, number]};

export function hairV2(o: HairOpts): Part[] {
  const cut = o.cut;
  if (cut.cloud && cut.cloud[o.view]) return cloudHair(o, cut.cloud[o.view]!);
  const vd: ViewDef | undefined = cut.views[o.view];
  if (!vd) return [];
  const hf = o.hf;
  const t = o.tone;
  const st = o.state ?? CALM;
  const px = o.px ?? 640;
  const lod = lodOf(px);
  const pxU = (hf.s * px) / 1000; // px per head unit at the drawn size
  const tn = o.view === 'b' ? (o.turn ?? 0) : 0;
  const name = o.name ?? 'hair';
  const dz = o.dz ?? 0;
  const LU = lightU(hf);
  const P = (u: V2) => hf.P(u);
  const PP = (us: V2[]) => us.map(P);
  const rot = hf.rot;
  const parts: Part[] = [];

  // ---- the state, as degrees
  const range = DTIP[cut.motion][st.name];
  const air = AIR[cut.motion];
  /** the cheek's side moves in as the back view turns (the head's sliver shows past the hair) */
  const cheek = (p: V2): V2 => {
    if (!tn) return p;
    const w = smooth(-0.12, -0.42, p[0]) * smooth(-0.55, -0.2, p[1]) * (1 - smooth(0.35, 0.85, p[1]));
    return [p[0] + tn * 0.12 * w, p[1]];
  };
  // the mass's swing: its lower part rotates about the pivot by the bend rule
  const downSign = sgn(cross([0, 1], st.wind)) || 1;
  const massBend = (() => {
    let d = 0;
    if (st.name === 'breeze' || st.name === 'walk') d = downSign * range[0] * st.k * 0.9;
    if (st.name === 'turn') d = (st.lag ?? -1) * range[0] * st.k;
    return d;
  })();
  const massGrav = -rot * (vd.hang ?? 1);
  const span = Math.max(0.2, vd.hem - vd.pivot[1]);
  const bendMass = (p: V2): V2 => {
    let q = cheek(p);
    const s = smooth(0, 1, (q[1] - vd.pivot[1]) / span);
    if (s <= 0) {
      // above the pivot: the upwind side lies flat (a breeze presses it onto the head)
      if (st.name === 'breeze' && (q[0] - vd.pivot[0]) * st.wind[0] < 0) {
        const k = 0.1 * st.k * air;
        q = [q[0] - (q[0] - vd.pivot[0]) * k, q[1] - (q[1] - vd.pivot[1]) * k * 0.4];
      }
      return q;
    }
    let r = rotAbout(q, vd.pivot, massBend * Math.pow(s, 1.7) + massGrav * smooth(0, 0.3, s));
    if (st.name === 'turn') {
      // the hem fans 20-30 % wider, most on the outside of the turn (screen-right)
      const out = r[0] > vd.pivot[0] ? 1.6 : 0.6;
      const f = 1 + (st.fan ?? 0) * 0.018 * out * Math.pow(s, 1.7);
      r = [vd.pivot[0] + (r[0] - vd.pivot[0]) * f, r[1]];
    }
    if (st.name === 'breeze') {
      // the downwind side reaches out much further than the upwind side (0.3-0.5 u for long hair at the hem)
      const side = (q[0] - vd.pivot[0]) * st.wind[0] > 0 ? 1 : 0.4;
      r = [r[0] + st.wind[0] * 0.24 * st.k * air * Math.pow(s, 1.4) * side, r[1] + st.wind[1] * 0.12 * st.k * Math.pow(s, 1.4) * side];
    }
    return r;
  };
  const massPath = (pts: MP[], bend = true) => {
    const q = pts.map((m) => (bend ? bendMass([m[0], m[1]]) : cheek([m[0], m[1]])));
    return smoothPath(PP(q), (i) => !!pts[i][2]);
  };

  // ---- the locks
  const shown = (d: LockDef) => {
    if ((d.lod ?? SIZE_LOD[d.size]) > lod) return false;
    if (d.only && !d.only.includes(st.name)) return false;
    if (d.size === 'W' && st.name === 'calm' && !d.rest) return false;
    if (d.not && d.not.includes(st.name)) return false;
    return true;
  };
  /** The lock's wave: coherent across the head (its phase set by the height where its wave starts, so neighbouring
   *  locks wave together, staggered only by their own small offsets): styled waves, never noise. */
  const waveOf = (d: LockDef, pts: V2[]): Wave | undefined => {
    const w = cut.wave;
    if (!w || d.wave === 0) return undefined;
    const k = d.wave ?? 1;
    const sz = d.size === 'B' ? 1 : d.size === 'M' ? 0.9 : d.size === 'S' ? 0.75 : 0.6;
    const from = w.from ?? 0.12;
    const r = pts[0];
    const tp = pts[pts.length - 1];
    const yStart = r[1] + (tp[1] - r[1]) * from;
    const coh = (yStart - vd.pivot[1]) / w.l0;
    return {...w, a0: w.a0 * k * sz, a1: w.a1 * k * sz, ph: (w.ph ?? 0) + (d.ph ?? 0) + coh};
  };
  const built: Built[] = [];
  vd.locks.forEach((d, i) => {
    if (!shown(d)) return;
    // a lock rooted on the lengths (below the pivot) rides the mass's own swing and fall, so it never comes loose
    const onLengths = d.pts[0][1] > vd.pivot[1] + 0.05;
    const pts = d.pts.map((p) => (onLengths ? bendMass(p) : cheek(p)));
    const root = pts[0];
    const tipP = pts[pts.length - 1];
    const dir: V2 = [tipP[0] - root[0], tipP[1] - root[1]];
    const resp = (d.air ?? SIZE_AIR[d.size]) * (onLengths ? 0.5 : 1);
    let bend = 0;
    if (st.name === 'breeze' || st.name === 'walk') {
      const outer = d.outer ?? 0.6;
      const dd = range[0] + (range[1] - range[0]) * outer;
      bend += (sgn(cross(dir, st.wind)) || downSign) * dd * st.k * resp;
    }
    if (st.name === 'turn') {
      const outer = d.outer ?? 0.6;
      const dd = range[0] + (range[1] - range[0]) * outer;
      bend += (st.lag ?? -1) * dd * st.k * resp;
      const side = d.fan ?? sgn(tipP[0] - vd.pivot[0]);
      // the outside of the turn (the right) swings out further; the leading side presses toward the neck
      if (side > 0) bend += -(st.fan ?? 0) * outer * resp;
    }
    // gravity: a hanging lock keeps hanging when the head bows or tilts (it turns back to straight down early)
    const grav = onLengths ? 0 : -rot * (d.hang ?? (d.size === 'W' ? 0.5 : 1)) * smooth(0.2, 0.6, Math.hypot(dir[0], dir[1]));
    bend += d.bend ?? 0;
    let w = d.w ?? SIZE_W[d.size];
    if (d.size === 'W') w = Math.max(w, 1.4 / pxU);
    const L = buildLock({
      pts,
      w,
      wave: waveOf(d, pts),
      hook: d.hook,
      hookFrom: d.hookFrom,
      asym: d.asym ?? (i % 2 ? -0.8 : 0.8),
      bend,
      grav,
      twist: d.twist ?? (cut.wave ? 0.1 : 0),
      root: d.root ?? (d.size === 'W' ? 0.45 : 1),
      swell: d.swell,
      k: d.k,
      m: d.m,
      stretch: st.name === 'walk' && cut.motion === 'C4' ? 0.06 : undefined,
      n: d.size === 'W' ? 22 : 30,
    });
    const xs = L.outline.map((q) => q[0]);
    const ys = L.outline.map((q) => q[1]);
    const tone = d.tone ?? 'lit';
    built.push({
      def: d,
      L,
      z: d.z + dz,
      tone,
      fill: tone === 'deep' ? t.deep : tone === 'shade' ? t.shade : t.lit,
      name: d.edge || d.size === 'W' ? `${name}-${d.size}${i}` : `${name.replace(/^hair/, 'hl')}-${d.size}${i}`,
      box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
    });
  });

  // ---- the light: the head-scale terminator (a region right of a line) and the slivers
  const tw = cut.wave;
  const termU = (() => {
    const raw = vd.term.map((p) => cheek(p));
    if (!tw) return raw;
    // resample the line and let it wave with the hair below the pivot (the head is the form; the waves cross it)
    const out: V2[] = [];
    for (let i = 0; i < raw.length - 1; i++) {
      const a = raw[i];
      const b = raw[i + 1];
      const n = Math.max(2, Math.ceil(Math.abs(b[1] - a[1]) / 0.06));
      for (let k = 0; k < n; k++) {
        const u = k / n;
        const y = a[1] + (b[1] - a[1]) * u;
        const x = a[0] + (b[0] - a[0]) * u;
        const d = Math.max(0, y - vd.pivot[1]);
        const lam = tw.l0 + (tw.l1 - tw.l0) * Math.min(1, d / span);
        const amp = (tw.a0 + (tw.a1 - tw.a0) * Math.min(1, d / span)) * smooth(0, 0.3, d) * 1.3;
        out.push([x + amp * Math.sin(2 * Math.PI * (d / lam + (tw.ph ?? 0))), y]);
      }
    }
    out.push(raw[raw.length - 1]);
    return out;
  })();
  const termPts: V2[] = [[termU[0][0], termU[0][1] - 1.5], ...termU, [termU[termU.length - 1][0], termU[termU.length - 1][1] + 1.5]];
  const termRegion = smoothPath(PP([...termPts, [termPts[termPts.length - 1][0] + 4, termPts[termPts.length - 1][1]], [termPts[0][0] + 4, termPts[0][1]]]), (i) => i === 0 || i >= termPts.length - 1);
  const termX = (y: number) => {
    if (y <= termU[0][1]) return termU[0][0];
    for (let i = 1; i < termU.length; i++) {
      if (y <= termU[i][1]) {
        const a = termU[i - 1];
        const b = termU[i];
        return a[0] + ((b[0] - a[0]) * (y - a[1])) / Math.max(1e-6, b[1] - a[1]);
      }
    }
    return termU[termU.length - 1][0];
  };
  const SLV: V2 = [0.026, 0.016]; // a sliver: the front shape shifted away from the key
  const sliverOf = (b: Built) => polyPath(PP(b.L.outline.map((q) => [q[0] + SLV[0], q[1] + SLV[1]] as V2)));
  const overlaps = (a: [number, number, number, number], b: [number, number, number, number]) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
  const sliversOn = (z: number, box: [number, number, number, number] | null, shadeFill: string, self?: Built): Region[] => {
    if (lod < 2) return [];
    const out: Region[] = [];
    for (const b of built) {
      if (b === self || b.z <= z || b.def.size === 'W' || b.tone !== 'lit' || b.def.sliver === false) continue;
      // slivers only from long locks, at close size (at film size the locks' own shade edges separate them)
      if (lod < 3 || b.def.size === 'S') continue;
      if (self && self.def.size === 'S') continue;
      if (box && !overlaps(box, b.box)) continue;
      out.push({d: sliverOf(b), fill: shadeFill});
    }
    return out;
  };

  // ---- the back mass (deep, behind the neck and the body) and the extra masses
  const gapCut = (vd.gaps ?? [])
    .filter((g) => (g.lod ?? 1) <= lod && (!g.only || g.only.includes(st.name)))
    .map((g) => massPath(g.pts))
    .join('');
  if (vd.back) {
    const bf = vd.backTone === 'shade' || lod < 1 ? t.shade : t.deep;
    parts.push({name: `${name.replace(/^hair/, 'hb')}-back`, d: massPath(vd.back), fill: bf, z: (vd.backZ ?? 18) + dz, cut: gapCut || undefined});
  }
  for (const ex of vd.extra ?? []) {
    if ((ex.lod ?? 0) > lod) continue;
    if (ex.only && !ex.only.includes(st.name)) continue;
    const fill = ex.tone === 'deep' ? t.deep : ex.tone === 'shade' ? t.shade : t.lit;
    const regs: Region[] = [];
    if ((ex.tone ?? 'lit') === 'lit') {
      if (ex.shade !== false) regs.push({d: termRegion, fill: t.shade});
      if (ex.crown) for (const c of crownDashes(ex.crown, lod, pxU)) regs.push({d: polyPath(PP(c)), fill: t.sheen});
    }
    parts.push({name: ex.edge ? `${name}-${ex.name}` : `${name.replace(/^hair/, 'hx')}-${ex.name}`, d: massPath(ex.pts, ex.bend !== false), fill, regions: regs, z: ex.z + dz});
  }

  // ---- the parting: a deep notch under the hair, filling the V where the two sides spring apart above the skull
  if (vd.parting) parts.push({name: `${name.replace(/^hair/, 'hp')}-parting`, d: massPath(vd.parting, false), fill: lod >= 1 ? t.deep : t.shade, z: 54.5 + dz});

  // ---- the base mass
  const massRegs: Region[] = [{d: termRegion, fill: t.shade}];
  if (vd.crown) for (const c of crownDashes(vd.crown, lod, pxU)) massRegs.push({d: polyPath(PP(c)), fill: t.sheen});
  massRegs.push(...sliversOn(vd.massZ + dz, null, t.shade));
  parts.push({name: `${name}-mass`, d: massPath(vd.mass), fill: t.lit, regions: massRegs, z: vd.massZ + dz, cut: gapCut || undefined});

  // ---- the locks as parts
  built.forEach((b, j) => {
    const L = b.L;
    const mid = Math.floor(L.spine.length * 0.4);
    const litA = L.nrm[mid][0] * LU[0] + L.nrm[mid][1] * LU[1] > 0;
    const regs: Region[] = [];
    if (b.tone === 'lit') {
      // the head's terminator through the lock, then the lock's own thin shade edge where it turns away
      if (b.def.shade !== 0 && b.def.size !== 'W') regs.push({d: termRegion, fill: t.shade});
      const base = b.def.shade ?? (b.def.size === 'W' ? 0 : b.def.size === 'S' ? (lod >= 3 ? 0.2 : 0) : 0.15);
      if (base > 0) {
        const fr = (s: number, i: number) => {
          const p = L.spine[i];
          const inShade = p[0] > termX(p[1]) ? 1 : 0;
          const wv = L.off.length ? 0.1 * Math.sin(2 * Math.PI * (L.phi[i] + L.ph + 0.25)) : 0;
          return inShade ? 1 : base + wv * smooth(0.1, 0.3, s);
        };
        regs.push({d: polyPath(PP(lockShade(L, !litA, fr))), fill: t.shade});
      }
      // the sheen: one dash per wave crest on the lit part of a lit lock (or one band on a straight lock)
      if (b.def.sheen !== false && b.def.size !== 'W' && lod >= 1) {
        let at: number[] = Array.isArray(b.def.sheen) ? b.def.sheen : crestsLit(L, litA);
        if (!at.length) at = [0.28 + 0.06 * ((j * 7) % 3)];
        at = at.filter((s) => s > 0.12 && s < 0.86);
        const maxN = b.def.size === 'S' ? 0 : b.def.size === 'M' ? (lod >= 3 ? 1 : 0) : lod >= 3 ? 3 : lod >= 2 ? 2 : 1;
        let k = 0;
        for (const s0 of at) {
          if (k >= maxN) break;
          const i = Math.round(s0 * (L.spine.length - 1));
          const p = L.spine[i];
          if (p[0] > termX(p[1]) + 0.04) continue; // no sheen in the shade plane
          const th = Math.max(lod >= 3 ? 0.042 : 0.07, 2.2 / pxU);
          const reach = b.def.size === 'B' ? 0.6 : 0.68;
          regs.push({d: polyPath(PP(sheenDash(L, s0 + 0.012 * ((j % 3) - 1), reach, th, litA))), fill: t.sheen});
          if (o.sheen2 && lod >= 2 && k === 0 && s0 + 0.1 < 0.9) regs.push({d: polyPath(PP(sheenDash(L, s0 + 0.09, reach * 0.6, th * 0.8, litA, 0.12))), fill: o.sheen2});
          k++;
        }
      }
      regs.push(...sliversOn(b.z, b.box, t.shade, b));
      // close size: a big lock shows its sub-locks (one split each, two on the widest), in the shade tone
      if (lod >= 3 && (b.def.size === 'B' || (b.def.size === 'M' && (b.def.w ?? SIZE_W.M) >= 0.17)) && L.len > 0.45) {
        const th = Math.max(0.03, 1.6 / pxU);
        regs.push({d: polyPath(PP(splitSliver(L, litA, 0.42 + 0.06 * ((j % 2) - 0.5), 0.22, 0.9, th))), fill: t.shade});
        if (b.def.size === 'B' && (b.def.w ?? SIZE_W.B) >= 0.3) regs.push({d: polyPath(PP(splitSliver(L, litA, 0.72, 0.4, 0.95, th * 0.85))), fill: t.shade});
      }
    }
    const part: Part = {name: b.name, d: smoothPath(PP(L.outline), (i) => i === L.tipAt), fill: b.fill, regions: regs, z: b.z};
    parts.push(part);
  });
  return o.rim ? parts.map((p) => (/^hair/.test(p.name) && !p.line ? {...p, rim: o.rim} : p)) : parts;
}

/** The crown's sheen (a.5): a band 20-35 % down from the top on the key side, broken into 2-4 dashes that step up and
 *  down 0.03-0.06 u, so it reads as made of locks, never as one painted ring. */
function crownDashes(c: NonNullable<ViewDef['crown']>, lod: number, pxU: number): V2[][] {
  const n = lod >= 3 ? (c.n ?? 2) : 2;
  const th = Math.max(c.th, 2.4 / pxU);
  const out: V2[][] = [];
  const span = c.a1 - c.a0;
  for (let i = 0; i < n; i++) {
    const g = span * 0.02;
    const a0 = c.a0 + (span * i) / n + (i ? g : 0);
    const a1 = c.a0 + (span * (i + 1)) / n - (i < n - 1 ? g : 0);
    const dr = [0, 0.03, -0.015, 0.022][i % 4];
    const outer: V2[] = [];
    const inner: V2[] = [];
    const N = 10;
    for (let k = 0; k <= N; k++) {
      const a = ((a0 + ((a1 - a0) * k) / N) * Math.PI) / 180;
      const w = th * Math.pow(Math.sin((Math.PI * k) / N), 0.55);
      outer.push([c.c[0] + (c.r[0] + dr) * Math.cos(a), c.c[1] + (c.r[1] + dr) * Math.sin(a)]);
      inner.push([c.c[0] + (c.r[0] + dr - w) * Math.cos(a), c.c[1] + (c.r[1] + dr - w) * Math.sin(a)]);
    }
    out.push([...outer, ...inner.reverse()]);
  }
  return out;
}

// ---------------------------------------------------------------- coils: the shaped cloud (W6, M5's TWA; a.4)
/** A coily head at film size is a CLOUD OF LOBES, not locks: a base shape whose edge is a chain of circles of unequal
 *  size (2.5 : 1), 1-3 popping out, 2-4 single small curls off the key side and the crown, shade slivers between the
 *  big lobes, sheen arcs on the lobes facing the key. */
function cloudHair(o: HairOpts, cd: CloudDef): Part[] {
  const hf = o.hf;
  const t = o.tone;
  const st = o.state ?? CALM;
  const px = o.px ?? 640;
  const lod = lodOf(px);
  const pxU = (hf.s * px) / 1000;
  const name = o.name ?? 'hair';
  const dz = o.dz ?? 0;
  const P = (u: V2) => hf.P(u);
  const PP = (us: V2[]) => us.map(P);
  const parts: Part[] = [];
  const c = cd.c;
  // the wind presses the upwind side and lifts the edge curls downwind
  const press = st.name === 'breeze' ? 0.04 * st.k : 0;
  const bounce = st.name === 'walk' ? 0.025 : 0;
  // the lobes' polar radius at angle a: the max over the base ellipse and the lobe circles
  const lobes = cd.lobes.map((l) => {
    const a = (l[0] * Math.PI) / 180;
    const up = Math.cos(a) * st.wind[0] < 0 ? 1 : 0; // on the upwind side
    const rr = l[1] - press * up * 0.8;
    return {a, rc: rr, r: l[2] * (1 - press * up * 1.5)};
  });
  const base = (a: number) => {
    const ex = cd.rx * Math.cos(a);
    const ey = cd.ry * Math.sin(a);
    return Math.hypot(ex, ey) * 0.86;
  };
  const N = 220;
  const pts: V2[] = [];
  const corners = new Set<number>();
  let prevBest = -1;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    let best = base(a);
    let who = -1;
    lobes.forEach((l, j) => {
      const da = a - l.a;
      const s = Math.sin(da);
      const cc = Math.cos(da);
      const disc = l.r * l.r - l.rc * l.rc * s * s;
      if (disc < 0) return;
      const d = l.rc * cc + Math.sqrt(disc);
      if (d > best) {
        best = d;
        who = j;
      }
    });
    if (who !== prevBest && i > 0) corners.add(pts.length);
    prevBest = who;
    pts.push([c[0] + best * Math.cos(a), c[1] + best * Math.sin(a) * (1 - bounce)]);
  }
  // the face's side: a clean hairline (the cloud is cut by it), from the data
  const cloudD = smoothPath(PP(pts), (i) => corners.has(i));
  const regs: Region[] = [];
  // the head's terminator
  const term = cd.term;
  const tp: V2[] = [[term[0][0], term[0][1] - 1.5], ...term, [term[term.length - 1][0], term[term.length - 1][1] + 1.5]];
  regs.push({d: smoothPath(PP([...tp, [tp[tp.length - 1][0] + 4, tp[tp.length - 1][1]], [tp[0][0] + 4, tp[0][1]]]), (i) => i === 0 || i >= tp.length - 1), fill: t.shade});
  // slivers between the big lobes (a lobe's own crescent of shade on its lower-right) and sheen arcs on the key side
  const big = lobes.map((l, j) => ({...l, j})).sort((a2, b2) => b2.r - a2.r);
  const nSl = lod >= 3 ? 5 : lod >= 2 ? 3 : 0;
  big.slice(0, nSl).forEach((l) => {
    const cx = c[0] + l.rc * Math.cos(l.a);
    const cy = c[1] + l.rc * Math.sin(l.a);
    const arc: V2[] = [];
    const inn: V2[] = [];
    for (let k = 0; k <= 10; k++) {
      const a = ((10 + 110 * (k / 10)) * Math.PI) / 180; // the lower right of the lobe
      const w = 0.03 * Math.sin((Math.PI * k) / 10);
      arc.push([cx + l.r * Math.cos(a), cy + l.r * Math.sin(a)]);
      inn.push([cx + (l.r - w) * Math.cos(a), cy + (l.r - w) * Math.sin(a)]);
    }
    regs.push({d: polyPath(PP([...arc, ...inn.reverse()])), fill: t.shade});
  });
  const nSh = lod >= 3 ? 7 : lod >= 2 ? 5 : lod >= 1 ? 3 : 0;
  lobes
    .map((l, j) => ({...l, j, face: Math.cos(l.a) * -0.88 + Math.sin(l.a) * -0.47}))
    .filter((l) => l.face > 0.15)
    .sort((a2, b2) => b2.face - a2.face)
    .slice(0, nSh)
    .forEach((l) => {
      const cx = c[0] + l.rc * Math.cos(l.a);
      const cy = c[1] + l.rc * Math.sin(l.a);
      const th = Math.max(0.035, 2 / pxU);
      const arc: V2[] = [];
      const inn: V2[] = [];
      for (let k = 0; k <= 8; k++) {
        const a = ((200 + 60 * (k / 8)) * Math.PI) / 180;
        const w = th * Math.pow(Math.sin((Math.PI * k) / 8), 0.7);
        const r = l.r * 0.78;
        arc.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
        inn.push([cx + (r - w) * Math.cos(a), cy + (r - w) * Math.sin(a)]);
      }
      regs.push({d: polyPath(PP([...arc, ...inn.reverse()])), fill: t.sheen});
    });
  parts.push({name: `${name}-cloud`, d: cloudD, fill: t.lit, regions: regs, z: cd.z + dz, cut: cd.hairline ? smoothPath(PP(cd.hairline.map((m) => [m[0], m[1]] as V2)), (i) => !!cd.hairline![i][2]) : undefined});
  // single small curls off the edge (spirals: a short lock that turns ~300 degrees), streaming downwind in a breeze
  if (lod >= 2) {
    const n = st.name === 'calm' ? Math.min(2, cd.curls.length) : cd.curls.length;
    cd.curls.slice(0, n).forEach((cu, i) => {
      const a = (cu[0] * Math.PI) / 180;
      const r0 = cu[1];
      const root: V2 = [c[0] + r0 * Math.cos(a), c[1] + r0 * Math.sin(a)];
      const out: V2 = [Math.cos(a), Math.sin(a)];
      const wind = st.name === 'breeze' ? st.wind : st.name === 'walk' ? [0, 0.3] : [0, 0];
      const d0: V2 = [out[0] + (wind as V2)[0] * 0.8, out[1] + (wind as V2)[1] * 0.8];
      const l = cu[2];
      const L = buildLock({
        pts: [root, [root[0] + d0[0] * l * 0.5, root[1] + d0[1] * l * 0.5], [root[0] + d0[0] * l, root[1] + d0[1] * l]],
        w: Math.max(0.05, 1.8 / pxU),
        root: 0.9,
        hook: (cu[3] ?? 1) * 200,
        hookFrom: 0.3,
        m: 0.7,
        n: 24,
      });
      parts.push({name: `${name}-curl${i}`, d: smoothPath(PP(L.outline), (k) => k === L.tipAt), fill: t.lit, z: cd.z + 0.5 + dz});
    });
  }
  return o.rim ? parts.map((p) => ({...p, rim: o.rim})) : parts;
}
