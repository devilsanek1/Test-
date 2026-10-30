// HAIR v4: the builder and the assembler's API.
//   hair(cut, view, headFrame, motion?, opts) -> Part4[]
// It takes the cut's AUTHORED pieces for the head's view (the 3/4 and profile drawings morphed by the head's yaw),
// puts them on the skull's frame (headFrame.P: crown -0.5, chin 0.5 in head units, so any face drops in), poses the
// hanging pieces by their bone chains (settled under gravity for a still head, or simulated over a motion), skins the
// exact authored anchors and handles to the bones, and paints them: crisp two-tone (direction C) or soft (one gentle
// ramp across the hair, a soft shadow and a soft gloss), with a rim on the silhouette and a few thin flow lines.
import {nodes, mapShape, lerpShape, dOf, ribbon, polyD, smooth, sample, type Shape, type V2, type N} from './bez';
import {bind, skin, chainXfs, unfold, type Xf} from './rig';
import {simulate, settle, type MotionState, type SimSpec} from './sim';
import type {Cut, CutView, Piece, View, Over, Flow, Chain} from './cut';
import type {HeadFrame} from '../graphic_faces/head';
import {mixLab, shiftL, type Tone} from '../graphic/color';
import type {Part4, Region4, Paint} from './part4';

export type Shading = 'crisp' | 'soft';
export type HairOpts = {
  tone: Tone;
  shading?: Shading;
  /** the figure's drawn height in px (crown to sole): the level of detail (flow lines and strands need room) */
  px?: number;
  /** part names start with this (default 'hair') */
  name?: string;
  /** move every z (to sit the hair in front of a prop) */
  dz?: number;
  /** the rim light on the silhouette (default on; a colour, or false) */
  rim?: boolean | string;
  /** draw the authored chains on top (the rig sheet) */
  bones?: boolean;
  /** the skin's lit colour (a faded side lets it show through) */
  skin?: string;
  /** the gloss's strength (the one authored highlight): 1 = the hair round's soft sheen; more = lighter and crisper
   *  (the assembly's premium read: ref 03's glossy crown) */
  gloss?: number;
};

/** The morph between the 3/4 drawing (0) and the profile drawing (1) by the head's yaw: the 3/4 head turns from -38
 *  (our standing 3/4) to -69, where the head's own drawing switches to the profile. */
export const morphOf = (view: View, yaw: number) => (view === 'p' ? 1 : view === 'q' ? smooth(SWITCH.m0, SWITCH.m1, Math.abs(yaw)) : 0);
export const viewOfYaw = (yaw: number): View => {
  const a = Math.abs(yaw);
  return a >= SWITCH.p && a <= SWITCH.b ? 'p' : a > SWITCH.b ? 'b' : 'q';
};
/** The head's switch points (the head's own drawing changes 3/4 -> profile at p and profile -> back past b) and the
 *  hair's 3/4 -> profile morph (m0 -> m1). The LASH heads switch at 70 / 112; the assembled v4 heads (people_v4/head.ts
 *  viewOfYaw) at 63 / 114, so the assembly sets {m0: 36, m1: 63, p: 63, b: 114} (asm_people.ts): the hair's turn
 *  finishes exactly where the face's drawing swaps. */
export const SWITCH = {m0: 38, m1: 69, p: 70, b: 112};
export function setSwitch(o: Partial<typeof SWITCH>) {
  Object.assign(SWITCH, o);
}

type RPiece = {pc: Piece; restU: Shape; chains: Chain[]; open: boolean; z: number};
type RView = {pieces: RPiece[]; shadow: Over[]; light: Over[]; flows: Flow[]; ears: boolean};

const lerpN = (a: N[], b: N[], t: number): Shape => lerpShape(nodes(a), nodes(b), t);
const lerpPts = (a: V2[], b: V2[], t: number): V2[] => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]);
/** A strand's chain when none is authored: five points along its centre curve. */
function strandChain(c: Shape): Chain {
  const pl = sample(c, 12, false);
  const pts: V2[] = [];
  for (let i = 0; i < 5; i++) pts.push(pl[Math.round((i / 4) * (pl.length - 1))]);
  return {pts, rigid: 0.06};
}

/** The view's pieces for a morph s (q -> p). Pieces with chains must exist in both drawings with the same nodes. */
export function resolveView(cut: Cut, view: View, s: number): RView | null {
  const fam = view === 'b' ? cut.views.b : cut.views.q ?? cut.views.p;
  if (!fam) return null;
  const A: CutView | undefined = view === 'b' ? cut.views.b : cut.views.q ?? cut.views.p;
  const B: CutView | undefined = view === 'b' ? undefined : cut.views.p;
  const t = view === 'b' || !B || !A ? 0 : s;
  const base = !A ? B! : t >= 1 && B ? B : A;
  const other = A && B ? (t >= 1 ? A : B) : undefined;
  const pieces: RPiece[] = [];
  for (const pc of base.pieces) {
    const twin = other?.pieces.find((q) => q.name === pc.name);
    let restU: Shape;
    let chains: Chain[] = pc.chains ?? [];
    const ok = twin && twin.shape.length === pc.shape.length && t > 0 && t < 1;
    let z = pc.z;
    if (ok) {
      const [a, b] = base === A ? [pc, twin!] : [twin!, pc];
      restU = lerpN(a.shape, b.shape, t);
      z = t < 0.5 ? a.z : b.z;
      if (a.chains && b.chains && a.chains.length === b.chains.length) {
        chains = a.chains.map((c, k) => ({pts: lerpPts(c.pts, b.chains![k].pts, t), rigid: c.rigid}));
      }
    } else {
      // pieces only in one drawing pop at the middle of the turn
      if (t > 0 && t < 1 && twin === undefined && other) {
        const inA = base === A;
        if ((inA && t >= 0.5) || (!inA && t < 0.5)) continue;
      }
      restU = nodes(pc.shape);
    }
    if (pc.strand && !chains.length) chains = [strandChain(restU)];
    pieces.push({pc, restU, chains, open: !!pc.strand, z});
  }
  // the other drawing's pieces that this one lacks, shown past the middle
  if (other && t > 0 && t < 1) {
    for (const pc of other.pieces) {
      if (base.pieces.find((q) => q.name === pc.name)) continue;
      const inOtherIsB = other === B;
      if ((inOtherIsB && t >= 0.5) || (!inOtherIsB && t < 0.5)) {
        const restU = nodes(pc.shape);
        pieces.push({pc, restU, chains: pc.chains ?? (pc.strand ? [strandChain(restU)] : []), open: !!pc.strand, z: pc.z});
      }
    }
  }
  const pick = <T,>(a: T[] | undefined, b: T[] | undefined) => (t < 0.5 ? a ?? [] : b ?? a ?? []);
  const mo = (a: Over[] | undefined, b: Over[] | undefined): Over[] => {
    if (!a || !b || a.length !== b.length || t <= 0 || t >= 1) return t >= 1 ? b ?? a ?? [] : a ?? b ?? [];
    return a.map((o, k) => (o.shape.length === b[k].shape.length ? {shape: lerpShape(nodes(o.shape), nodes(b[k].shape), t).map((n) => [n.p[0], n.p[1], n.i[0] - n.p[0], n.i[1] - n.p[1], n.o[0] - n.p[0], n.o[1] - n.p[1]] as N), on: o.on} : t < 0.5 ? o : b[k]));
  };
  const mf = (a: Flow[] | undefined, b: Flow[] | undefined): Flow[] => {
    if (!a || !b || a.length !== b.length || t <= 0 || t >= 1) return t >= 1 ? b ?? a ?? [] : a ?? b ?? [];
    return a.map((f, k) => (f.c.length === b[k].c.length ? {...f, c: lerpShape(nodes(f.c), nodes(b[k].c), t).map((n) => [n.p[0], n.p[1], n.i[0] - n.p[0], n.i[1] - n.p[1], n.o[0] - n.p[0], n.o[1] - n.p[1]] as N)} : t < 0.5 ? f : b[k]));
  };
  const Av = A ?? B!;
  const Bv = B ?? A!;
  return {
    pieces,
    shadow: view === 'b' ? Av.shadow ?? [] : mo(Av.shadow, Bv.shadow),
    light: view === 'b' ? Av.light ?? [] : mo(Av.light, Bv.light),
    flows: view === 'b' ? Av.flows ?? [] : mf(Av.flows, Bv.flows),
    ears: pick([Av.ears ?? false], [Bv.ears ?? false])[0] ?? false,
  };
}

/** The simulation spec of a cut in a view family: every chain of every hanging piece, rest joints per head frame. */
export function specOf(cut: Cut, view: View): {key: string; spec: SimSpec} | null {
  const probe = resolveView(cut, view, 0);
  if (!probe) return null;
  const owners = probe.pieces.filter((r) => r.chains.length);
  if (!owners.length) return null;
  const mult = owners.flatMap((r) => r.chains.map(() => (r.pc.strand ? {k: 0.7, air: 1.1, damp: 1.4} : {k: 1, air: 1, damp: 1})));
  const vOf = (hf: HeadFrame): View => (view === 'b' || viewOfYaw(hf.yaw) === 'b' ? 'b' : viewOfYaw(hf.yaw));
  const spec: SimSpec = {
    spring: cut.spring,
    mult,
    morph: (hf: HeadFrame) => morphOf(vOf(hf), hf.yaw),
    rest: (hf: HeadFrame, sm?: number) => {
      const v = vOf(hf);
      const R = resolveView(cut, v === 'p' && sm !== undefined && sm < 1 ? 'q' : v, sm ?? morphOf(v, hf.yaw))!;
      const out: V2[][] = [];
      for (const r of owners) {
        const twin = R.pieces.find((q) => q.pc.name === r.pc.name) ?? r;
        const cs = twin.chains.length === r.chains.length ? twin.chains : r.chains;
        for (const c of cs) out.push(c.pts.map((p) => hf.P(p)));
      }
      return out;
    },
  };
  return {key: `${cut.id}|${view === 'b' ? 'b' : 'qp'}`, spec};
}

/** A colour lighter or darker in L* (hair keeps its hue). */
const L = (hex: string, d: number) => shiftL(hex, d);

/** The hair as parts on a head. `view` is the head's drawing (q, p, b); a motion poses the hanging pieces over time. */
export function hair(cut: Cut, view: View, hf: HeadFrame, motion: MotionState | undefined, o: HairOpts): Part4[] {
  const s = morphOf(view, hf.yaw);
  const R = resolveView(cut, view, s);
  if (!R) return [];
  const t = o.tone;
  const shading = o.shading ?? 'soft';
  const px = o.px ?? 640;
  const name = o.name ?? 'hair';
  const dz = o.dz ?? 0;
  const S = hf.s; // local units per head unit
  // ---- pose the chains
  const sp = specOf(cut, view);
  let posed: V2[][] | null = null;
  if (sp) posed = motion ? simulate(sp.key, sp.spec, motion) : settle(sp.key, sp.spec, hf);
  const restW = sp ? sp.spec.rest(hf) : [];
  const xfsAll: Xf[][] = restW.map((rw, k) => chainXfs(rw, posed ? posed[k] : rw));
  // chain index ranges per owner piece
  let ci = 0;
  const xfsOf = new Map<string, Xf[][]>();
  for (const r of R.pieces) {
    if (!r.chains.length) continue;
    xfsOf.set(r.pc.name, xfsAll.slice(ci, ci + r.chains.length));
    ci += r.chains.length;
  }
  const P = (sh: Shape) => mapShape(sh, hf.P);
  /** a shape in head units, posed with a piece's chains */
  const poseOn = (shU: Shape, r: RPiece | undefined): Shape => {
    const W = P(shU);
    if (!r || !r.chains.length) return W;
    const X = xfsOf.get(r.pc.name);
    if (!X) return W;
    const b = bind(shU, r.chains);
    return skin(W, b, X);
  };
  // ---- the light: soft = one ramp across the whole hair from the key (upper left) to the far lower side
  const ramp = (base: string): Paint => {
    const a = hf.P([-0.55, -0.62]);
    const b = hf.P([0.6, 1.05]);
    const dark = mixLab(base, t.shade, 0.85);
    return {kind: 'lin', a, b, stops: [[0, L(base, 8)], [0.34, base], [1, dark]]};
  };
  const baseOf = (pc: Piece) => (pc.tone === 'shade' ? t.shade : pc.tone === 'deep' ? t.deep : t.lit);
  const rimC = typeof o.rim === 'string' ? o.rim : mixLab(L(t.sheen, 8), '#FFE9CF', 0.2);
  // the rim: a thin band on the silhouette's key-facing edges; the key is high on the left, so the band lives on the
  // crown and the top edges and thins out down the vertical sides (never an even outline)
  const rimW = 0.03 * S;
  const RX = 0.5;
  const RY = 0.87;
  const parts: Part4[] = [];
  const lod = px >= 300 ? 3 : px >= 160 ? 2 : px >= 120 ? 1 : 0;
  for (const r of R.pieces) {
    const pc = r.pc;
    if ((pc.lod ?? 0) > lod) continue;
    const base = baseOf(pc);
    const z = r.z + dz;
    if (r.open) {
      // an accent strand: the centre curve posed, then a tapered ribbon (at least ~1.2 px wide on screen)
      const c = poseOn(r.restU, r);
      const minW = (1.3 * 1000) / Math.max(60, px);
      const w = Math.max(pc.strand!.w * S, minW);
      const rb = ribbon(c, w, {at: pc.strand!.at ?? 0.25, per: 14});
      parts.push({name: `${name}-${pc.name}`, d: polyD(rb), fill: shading === 'soft' ? L(base, 4) : base, z, rimBand: o.rim === false || !pc.rim ? undefined : {dx: rimW * RX, dy: rimW * RY, color: rimC, opacity: 0.9}});
      continue;
    }
    const restW1 = P(r.restU);
    let sh = poseOn(r.restU, r);
    if (r.chains.length) sh = unfold(restW1, sh);
    const regions: Region4[] = [];
    const onThis = (ov: Over) => ov.on.includes(pc.name);
    for (const ov of R.shadow.filter(onThis)) {
      const d = dOf(poseOn(nodes(ov.shape), r));
      const fill = pc.tone === 'shade' ? t.deep : t.shade;
      regions.push(shading === 'soft' ? {d, fill: mixLab(fill, base, 0.12), blur: 0.03 * S} : {d, fill});
    }
    for (const ov of R.light.filter(onThis)) {
      const d = dOf(poseOn(nodes(ov.shape), r));
      const fill = pc.tone === 'shade' ? t.lit : t.sheen;
      const g = o.gloss ?? 1;
      regions.push(shading === 'soft' ? {d, fill: pc.tone === 'shade' ? fill : L(fill, 4 + 7 * (g - 1)), blur: (0.018 * S) / Math.max(1, g), opacity: 1} : {d, fill});
    }
    if (pc.fade && o.skin) {
      // the fade: the skin shows through the short hair toward the hairline (one vertical ramp in head units)
      const a = hf.P([0, pc.fade[0]]);
      const b = hf.P([0, pc.fade[1]]);
      regions.push({d: dOf(sh), fill: o.skin, paint: {kind: 'lin', a, b, stops: [[0, o.skin, 0], [1, o.skin, 0.62]]}});
    }
    if (lod >= 2) {
      for (const f of R.flows.filter((q) => q.on === pc.name)) {
        const c = poseOn(nodes(f.c), r);
        const rb = ribbon(c, Math.max(f.w * S, (1.1 * 1000) / Math.max(60, px)), {at: f.at ?? 0.35, per: 14});
        regions.push(shading === 'soft' ? {d: polyD(rb), fill: t.deep, opacity: 0.8, blur: 0.003 * S} : {d: polyD(rb), fill: t.deep, opacity: 0.9});
      }
    }
    parts.push({
      name: `${name}-${pc.name}`,
      d: dOf(sh),
      fill: base,
      paint: shading === 'soft' ? ramp(base) : undefined,
      regions,
      z,
      rimBand: o.rim === false || !(pc.rim ?? 1) ? undefined : {dx: rimW * RX * (pc.rim ?? 1), dy: rimW * RY * (pc.rim ?? 1), color: rimC, opacity: 0.95},
    });
  }
  if (o.bones && sp) {
    // the rig sheet: each chain's rest bones (thin) and posed bones (the joints as dots)
    restW.forEach((rw, k) => {
      const pw = posed ? posed[k] : rw;
      const dd = 'M' + pw.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L');
      parts.push({name: `bones${k}`, d: dd, fill: 'none', line: {w: 0.012 * S, color: '#E8F06A'}, z: 99});
      pw.forEach((q, j) => parts.push({name: `joint${k}_${j}`, d: `M${q[0] - 0.014 * S} ${q[1]}a${0.014 * S} ${0.014 * S} 0 1 0 ${0.028 * S} 0a${0.014 * S} ${0.014 * S} 0 1 0 ${-0.028 * S} 0Z`, fill: j === 0 ? '#F0606A' : '#E8F06A', z: 99.5}));
    });
  }
  return parts;
}

/** Whether the cut leaves the ears showing in this view (the figure builder draws them). */
export const earsOf = (cut: Cut, view: View) => !!cut.views[view]?.ears;
