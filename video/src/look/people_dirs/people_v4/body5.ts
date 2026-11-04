// PEOPLE v4, BODIES (docs/look/people_design/bodies_v4/NOTES.md): THE DRESSED BODY. body5(sex, build, pose, outfit)
// returns the figure's parts (body units, H = 1000; the parts in the figure's local screen: y down, the standing sole at
// y 1000), its skeleton, and the head's placement for head() (as body.ts's body() does). It builds on body.ts (the
// recipe's composition: compOf, the smooth tubes and lofts, one gradient lit plane and a crisp computed terminator per
// form) and adds what the stand-in body lacked:
//   the POSE      skel5.ts: weight, gesture, sitting and leaning; the torso's rings are authored upright and mapped by
//                 the pose (X), so a leaned or seated torso keeps its designed shape
//   the HANDS     hand5.ts: authored hands (a thumb, a finger mass with separations, a relaxed curl, the wrist's taper)
//   the CLOTHES   garments with fit, fall and a few folds (fashion.md §3-4; design_research.md C1-C10): the long open
//                 coat hanging straight from the shoulders in two panels (the open front shows the column between them),
//                 the hip jacket, the knit (rib bands, tucked), the tee, the big shirt (half-tucked, the collar's V, the
//                 sleeves pushed up), wide trousers falling from the hip, straight trousers and jeans (the fade, the
//                 stack), slim flats, loafers, slim sneakers (the sole band) and Chelsea boots
// Folds are value slivers at tension points, by size (C7): none under 130 px, one a garment to 300 px, two or three above.
import type {V2, V3} from '../graphic/geo';
import {add3, sub3, mul3, norm3, lerp3, dot3, len3, clamp} from '../graphic/geo';
import {cam, toCam, proj, screen, tube, ringP, type Cam, type Ring} from '../graphic/rig';
import {framePt, type Frame} from '../graphic/body';
import {fr, blend} from '../graphic/wear';
import {mixLab, shiftL, type Tone} from '../graphic/color';
import {through, taper, type Seg} from './pen';
import {polySegs, type PartV4, type Paint, type Region} from './paint';
import {compOf, type Comp} from './body';
import {headFrame} from '../graphic_faces/head';
import {skel5, type Skel5, type Pose5} from './skel5';
import {handPart} from './hand5';
import type {Sex} from './faces';
import type {BuildName} from '../hair_v2/stance';

// ---------------------------------------------------------------- the outfit
export type Top5 = {kind: 'knit' | 'tee' | 'shirt'; tone: Tone; rib?: Tone; tuck: 'full' | 'half' | 'none'; sleeve: 'long' | 'short' | 'pushed'};
export type Outer5 = {kind: 'coat' | 'jacket'; tone: Tone; facing: Tone; hemY?: number};
export type Bottom5 = {kind: 'wide' | 'straight' | 'jeans'; tone: Tone; rise?: number};
export type Shoe5 = {kind: 'flat' | 'loafer' | 'sneaker' | 'boot'; tone: Tone; sole?: string; stripe?: string};
export type Outfit5 = {top: Top5; outer?: Outer5; bottom: Bottom5; shoe: Shoe5};
export type Body5Opts = {yaw: number; skin: Tone; px: number; neck?: boolean};
export type Body5 = {parts: PartV4[]; skel: Skel5; cam: Cam; head: {c: V2; s: number; rot: number; yaw: number}};

// ---------------------------------------------------------------- rings, lofts and tubes in the pose
/** A ring with an optional front-back slope k (y += k * z: k > 0 lifts the front: a half-tucked hem) and a front
 *  kick (z += kick on the front half, fading to nothing at the sides: a coat's front panel swung by its knee while the
 *  back hangs as one cloth). */
type RingK = Ring & {k?: number; kick?: number};
const ringPt = (r: RingK, phi: number): V3 => {
  const p = ringP(r, phi);
  if (!r.k && !r.kick) return p;
  const kick = r.kick ? r.kick * Math.pow(Math.max(0, Math.sin((phi * Math.PI) / 180)), 1.5) : 0;
  return [p[0], p[1] + (r.k ? r.k * (p[2] - (r.z ?? 0)) : 0), p[2] + kick];
};
function ringNrm(r: Ring, phi: number): V3 {
  const t = ((r.tw ?? 0) * Math.PI) / 180;
  const ph = (phi * Math.PI) / 180;
  const nx = Math.cos(ph) / Math.max(1e-6, r.a);
  const nz = Math.sin(ph) / Math.max(1e-6, r.b);
  return norm3([nx * Math.cos(t) + nz * Math.sin(t), 0, -nx * Math.sin(t) + nz * Math.cos(t)]);
}
type Xf = {X: (p: V3) => V3; Xn: (n: V3, y: number) => V3};
const IDX: Xf = {X: (p) => p, Xn: (n) => n};
type Smp = {s: V2; z: number; nz: number; lit: boolean};
export type LoftX = {outline: Seg[]; shade: Seg[]; L: V2[]; R: V2[]; T: V2[]; top: V2[]; bot: V2[]};

/** A loft through rings (top to bottom), each ring sampled over its whole circle or over a range of angles (a coat's
 *  panel), mapped by the pose and projected: the outline (the top ring's visible arc, the silhouettes, the bottom arc)
 *  as one smooth curve, and the shade region from the computed terminator (the key is upper left: the shade lies
 *  screen-right of it). */
export function loftX(rings: RingK[], c: Cam, xf: Xf, range?: (i: number) => [number, number], visibleOnly = false): LoftX {
  const N = 120;
  const per0: Smp[][] = rings.map((r, i) => {
    const out: Smp[] = [];
    const rg = range?.(i);
    const n = rg ? Math.max(12, Math.round(((rg[1] - rg[0]) / 360) * N)) : N;
    for (let k = 0; k < n + (rg ? 1 : 0); k++) {
      const phi = rg ? rg[0] + ((rg[1] - rg[0]) * k) / n : (k * 360) / n;
      const pl = ringPt(r, phi);
      const q = toCam(xf.X(pl), c);
      const nc = toCam(xf.Xn(ringNrm(r, phi), pl[1]), c);
      out.push({s: screen(q, c), z: q[2], nz: nc[2], lit: nc[0] * c.light[0] + nc[1] * c.light[1] + nc[2] * c.light[2] > 0});
    }
    return out;
  });
  // a panel drawn only where it faces us (the longest run of camera-facing samples): its back half never covers the
  // column in its open front
  const per: Smp[][] = !visibleOnly || !range
    ? per0
    : per0.map((S) => {
        let best: [number, number] = [0, -1];
        let st = -1;
        S.forEach((q, k) => {
          const vis = q.nz > -0.04;
          if (vis && st < 0) st = k;
          if ((!vis || k === S.length - 1) && st >= 0) {
            const en = vis ? k : k - 1;
            if (en - st > best[1] - best[0]) best = [st, en];
            st = -1;
          }
        });
        if (best[1] - best[0] < 1) {
          // nothing faces us here: the two samples nearest to facing (a sliver)
          let k = 0;
          S.forEach((q, j) => {
            if (q.nz > S[k].nz) k = j;
          });
          const j = Math.min(S.length - 1, k + 1);
          return [S[Math.max(0, j - 1)], S[j]];
        }
        return S.slice(best[0], best[1] + 1);
      });
  const closed = !range;
  const ext = per.map((S) => {
    let iL = 0;
    let iR = 0;
    S.forEach((q, k) => {
      if (q.s[0] < S[iL].s[0]) iL = k;
      if (q.s[0] > S[iR].s[0]) iR = k;
    });
    return {iL, iR};
  });
  /** the visible arc of ring i from index a to index b */
  const arc = (i: number, a: number, b: number): V2[] => {
    const S = per[i];
    const n = S.length;
    if (!closed) {
      const out: V2[] = [];
      const st = a <= b ? 1 : -1;
      for (let k = a; ; k += st) {
        out.push(S[k].s);
        if (k === b) break;
      }
      return out;
    }
    const fwd: number[] = [];
    for (let k = a; ; k = (k + 1) % n) {
      fwd.push(k);
      if (k === b) break;
    }
    const bwd: number[] = [];
    for (let k = a; ; k = (k - 1 + n) % n) {
      bwd.push(k);
      if (k === b) break;
    }
    const mz = (ix: number[]) => S[ix[Math.floor(ix.length / 2)]].z;
    return (mz(fwd) >= mz(bwd) ? fwd : bwd).map((k) => S[k].s);
  };
  const n = rings.length;
  const L = ext.map((e, i) => per[i][e.iL].s);
  const R = ext.map((e, i) => per[i][e.iR].s);
  const top = arc(0, ext[0].iR, ext[0].iL);
  const bot = arc(n - 1, ext[n - 1].iL, ext[n - 1].iR);
  const pts: V2[] = [...top, ...L.slice(1, -1), ...bot, ...R.slice(1, -1).reverse()];
  const outline = through(pts, true, 1);
  // the terminator per ring: the lit/shaded change nearest the camera on the visible side
  const T: V2[] = per.map((S, i) => {
    let best = -Infinity;
    let at: V2 | null = null;
    const m = S.length;
    for (let k = 0; k < (closed ? m : m - 1); k++) {
      const a = S[k];
      const b = S[(k + 1) % m];
      if (a.lit !== b.lit && a.nz + b.nz > best && a.nz + b.nz > 0) {
        best = a.nz + b.nz;
        at = [(a.s[0] + b.s[0]) / 2, (a.s[1] + b.s[1]) / 2];
      }
    }
    if (at) return at;
    // no change on the visible side: all lit (no shade) or all shaded
    const vis = S.filter((q) => q.nz > 0);
    const litFrac = vis.length ? vis.filter((q) => q.lit).length / vis.length : 1;
    return litFrac > 0.5 ? [R[i][0] + 2, R[i][1]] : [L[i][0] - 2, L[i][1]];
  });
  const t0 = T[0];
  const t1 = T[n - 1];
  const tl = through([[t0[0], t0[1] - 400], ...T, [t1[0], t1[1] + 400]], false, 1);
  const shade: Seg[] = [...tl, ...polySegs([[t1[0], t1[1] + 400], [t1[0] + 3000, t1[1] + 400], [t0[0] + 3000, t0[1] - 400], [t0[0], t0[1] - 400]]).slice(0, 3)];
  return {outline, shade, L, R, T, top, bot};
}

export type TubeX = {outline: Seg[]; shade: Seg[]; A: V2[]; B: V2[]; T: V2[]; axis: V2[]; z: number; shadeSide: 'A' | 'B'};
/** A smooth tube along a joint chain with radius r(t) (body.ts smoothTube, with flat or round ends). */
export function tubeX(chain: V3[], r: (t: number) => number, c: Cam, o: {n?: number; capStart?: number; capEnd?: number} = {}): TubeX {
  const n = o.n ?? 20;
  const Ls: number[] = [0];
  for (let i = 1; i < chain.length; i++) Ls.push(Ls[i - 1] + len3(sub3(chain[i], chain[i - 1])));
  const tot = Ls[Ls.length - 1] || 1;
  const ax: V3[] = [];
  const ts: number[] = [];
  for (let k = 0; k <= n; k++) {
    const s = (k / n) * tot;
    let i = 1;
    while (i < chain.length - 1 && Ls[i] < s) i++;
    const u = (s - Ls[i - 1]) / Math.max(1e-6, Ls[i] - Ls[i - 1]);
    const a = chain[Math.max(0, i - 2)];
    const b = chain[i - 1];
    const cc = chain[i];
    const d = chain[Math.min(chain.length - 1, i + 1)];
    const u2 = u * u;
    const u3 = u2 * u;
    ax.push([0, 1, 2].map((j) => 0.5 * (2 * b[j] + (-a[j] + cc[j]) * u + (2 * a[j] - 5 * b[j] + 4 * cc[j] - d[j]) * u2 + (-a[j] + 3 * b[j] - 3 * cc[j] + d[j]) * u3)) as V3);
    ts.push(k / n);
  }
  const tb = tube(ax, ts.map(r), c);
  const A = tb.A;
  const B = tb.B;
  const cap = (P: V2, Q: V2, dir: V2, k: number): V2[] => {
    const m: V2 = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
    const hw = Math.hypot(P[0] - Q[0], P[1] - Q[1]) / 2;
    return [
      [m[0] + (P[0] - m[0]) * 0.72 + dir[0] * hw * k * 0.7, m[1] + (P[1] - m[1]) * 0.72 + dir[1] * hw * k * 0.7],
      [m[0] + dir[0] * hw * k, m[1] + dir[1] * hw * k],
      [m[0] + (Q[0] - m[0]) * 0.72 + dir[0] * hw * k * 0.7, m[1] + (Q[1] - m[1]) * 0.72 + dir[1] * hw * k * 0.7],
    ];
  };
  const d0 = tb.dirs[0];
  const d1 = tb.dirs[tb.dirs.length - 1];
  const endCap = cap(A[A.length - 1], B[B.length - 1], d1, o.capEnd ?? 0.55);
  const startCap = cap(B[0], A[0], [-d0[0], -d0[1]], o.capStart ?? 0.55);
  const outline = through([...A, ...endCap, ...B.slice().reverse(), ...startCap], true, 1);
  const S = tb.shadeSide === 'A' ? A : B;
  const far: V2[] = S.map((q, i) => {
    const v: V2 = [q[0] - tb.T[i][0], q[1] - tb.T[i][1]];
    const l = Math.hypot(v[0], v[1]) || 1;
    return [q[0] + (v[0] / l) * 300, q[1] + (v[1] / l) * 300];
  });
  const e0: V2 = [tb.T[0][0] - d0[0] * 200, tb.T[0][1] - d0[1] * 200];
  const e1: V2 = [tb.T[tb.T.length - 1][0] + d1[0] * 200, tb.T[tb.T.length - 1][1] + d1[1] * 200];
  const f0: V2 = [far[0][0] - d0[0] * 200, far[0][1] - d0[1] * 200];
  const f1: V2 = [far[far.length - 1][0] + d1[0] * 200, far[far.length - 1][1] + d1[1] * 200];
  const shade: Seg[] = [...through([e0, ...tb.T, e1], false, 1), ...polySegs([e1, f1, ...far.slice().reverse(), f0, e0]).slice(0, far.length + 3)];
  return {outline, shade, A, B, T: tb.T, axis: tb.axis, z: tb.z, shadeSide: tb.shadeSide};
}
/** A point on a tube's screen band: t along it, v from -1 (the A silhouette) to 1 (B). */
const onTube = (t: TubeX, tt: number, v: number): V2 => {
  const n = t.A.length - 1;
  const f = clamp(tt, 0, 1) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const u = f - i;
  const a: V2 = [t.A[i][0] + (t.A[i + 1][0] - t.A[i][0]) * u, t.A[i][1] + (t.A[i + 1][1] - t.A[i][1]) * u];
  const b: V2 = [t.B[i][0] + (t.B[i + 1][0] - t.B[i][0]) * u, t.B[i][1] + (t.B[i + 1][1] - t.B[i][1]) * u];
  const w = (v + 1) / 2;
  return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w];
};
/** A fold: a tapered value sliver along screen points (C7: never a line). */
function sliver(pts: V2[], w: number, fill: string, opacity = 0.55, skew = 0.5): Region {
  const segs = taper(through(pts, false, 1), (t) => w * Math.pow(Math.max(0, Math.sin(Math.PI * clamp(t < skew ? (t / skew) * 0.5 : 0.5 + ((t - skew) / (1 - skew)) * 0.5, 0, 1))), 0.8));
  return {segs, fill, opacity};
}
/** The lit plane's gentle gradient (body.ts litPaint): warmer toward the key, a touch deeper away from it. */
const litPaint = (t: Tone, at?: [V2, V2]): Paint => ({lin: at ?? [[-260, 0], [260, 700]], stops: [[0, mixLab(t.lit, t.sheen, 0.12)], [0.6, t.lit], [1, mixLab(t.lit, t.shade, 0.12)]]});

// ---------------------------------------------------------------- the torso's levels (body.ts's tee rings, named)
type Lv = {f: Frame; y: number; a: number; b: number; dz: number};
type Levels = Record<'neck' | 'slope' | 'shoulder' | 'delt' | 'chest' | 'rib' | 'waist' | 'hiph' | 'hip', Lv>;
function levels(sk: Skel5, C: Comp, sex: Sex): Levels {
  const b = sk.b;
  const ch = sk.chest;
  const pv = sk.pelvis;
  const wa = sk.waist;
  const m = sex === 'm';
  const slopeDrop = Math.tan((C.slope * Math.PI) / 180) * (C.shoulderW / 2 - C.neckW / 2 - 6);
  const topY = b.shoulderY + 20;
  return {
    neck: {f: ch, y: topY, a: C.neckW / 2 + (m ? 16 : 9), b: C.neckW * 0.62, dz: -6},
    slope: {f: ch, y: topY - slopeDrop * 0.45, a: C.neckW / 2 + (C.shoulderW / 2 - C.neckW / 2) * 0.55, b: C.chestD * 0.36, dz: -4},
    shoulder: {f: ch, y: topY - slopeDrop - 4, a: C.shoulderW / 2 - 8, b: C.chestD * 0.4, dz: -2},
    delt: {f: ch, y: topY - slopeDrop - 26, a: C.shoulderW / 2, b: C.chestD * 0.44, dz: -1},
    chest: {f: ch, y: b.chestY + 20, a: C.chestW / 2, b: C.chestD / 2, dz: 0},
    rib: {f: blend(ch, wa, 0.5), y: (b.chestY + b.waistY) / 2 - 10, a: (C.chestW + C.waistW) / 4, b: (C.chestD + C.waistD) / 4, dz: 0},
    waist: {f: wa, y: b.waistY, a: C.waistW / 2, b: C.waistD / 2, dz: 0},
    hiph: {f: blend(wa, pv, 0.6), y: b.waistY - 55, a: (C.waistW + C.hipW) / 4 + 2, b: (C.waistD + C.hipD) / 4, dz: 0},
    hip: {f: pv, y: b.hipY + (m ? 40 : 34), a: C.hipW / 2 - (m ? 6 : 10), b: C.hipD / 2 - 2, dz: 0},
  };
}
const ringOf = (l: Lv, ea: number, eb: number, dy = 0, f?: Frame): RingK => fr(f ?? l.f, l.y + dy, l.a + ea, l.b + eb, l.dz);

// ---------------------------------------------------------------- the API
export function body5(sex: Sex, kind: BuildName, pose: Pose5, fit: Outfit5, o: Body5Opts): Body5 {
  const sk = skel5(sex, kind, pose);
  const C = compOf(sex, kind);
  const c = cam(o.yaw);
  const b = sk.b;
  const m = sex === 'm';
  const LV = levels(sk, C, sex);
  const xf: Xf = {X: sk.X, Xn: sk.Xn};
  const parts: PartV4[] = [];
  const depth = (q: V3) => toCam(q, c)[2];
  const dzz = (q: V3) => depth(q) * 0.01;
  const lod = o.px >= 300 ? 2 : o.px >= 130 ? 1 : 0;
  const seated = pose.kind === 'ledge' || pose.kind === 'ground';
  const T = fit;
  const skin = o.skin;
  const rise = T.bottom.rise ?? (T.bottom.kind === 'wide' ? b.waistY - 4 : m ? b.waistY - 26 : b.waistY - 16);

  // ================================================================ the legs: skin below, the trouser legs, the shoes
  const legZ: Record<'l' | 'r', number> = {l: 0, r: 0};
  const legTubes: Record<'l' | 'r', TubeX | null> = {l: null, r: null};
  for (const side of ['l', 'r'] as const) {
    const L = sk.leg[side];
    const s = side === 'l' ? 1 : -1;
    const zL = 30 + dzz(L.knee);
    legZ[side] = zL;
    // the bare lower leg (shows where a seated hem rides up, or above a flat)
    const shin = tubeX([lerp3(L.knee, L.ankle, 0.3), L.ankle], (t) => (C.calf / 2) * (1 - t) * 0.82 + (C.ankle / 2) * (0.18 + t * 0.82) + 0.5, c, {capStart: 0.3, capEnd: 0.4, n: 8});
    parts.push({name: `shin-${side}`, segs: shin.outline, fill: litPaint(skin), z: zL - 0.6, regions: [{segs: shin.shade, fill: skin.shade}]});
    // the trouser leg
    const hipTop = sk.X(framePt(sk.pelvis, s * 48 * (b.hipW / 210) * 0.86, b.hipJ - 6, 0));
    const dir = norm3(sub3(L.ankle, L.knee));
    const knee = L.knee;
    const bent = dot3(norm3(sub3(L.knee, L.hip)), dir) < 0.82;
    let hem: V3;
    if (seated) hem = lerp3(knee, L.ankle, T.bottom.kind === 'wide' ? 0.9 : 0.86);
    else {
      const hy = Math.max(T.bottom.kind === 'wide' ? 10 : 18, L.ankle[1] - (T.bottom.kind === 'wide' ? 34 : 22));
      const k = (L.ankle[1] - hy) / Math.max(0.2, -dir[1]);
      hem = add3(L.ankle, mul3(dir, k));
    }
    const prof = legProf(T.bottom.kind, sex, C, seated);
    let chain: V3[];
    if (T.bottom.kind === 'wide' && !seated) {
      // a wide leg falls from the hip: the knee only nudges it (a bent knee more), never a balloon round the knee
      const mid = lerp3(lerp3(hipTop, hem, 0.5), knee, bent ? 0.38 : 0.42);
      chain = [hipTop, mid, hem];
    } else chain = [hipTop, knee, hem];
    const tl = tubeX(chain, prof, c, {capStart: 0.2, capEnd: 0.1, n: 22});
    legTubes[side] = tl;
    const regs: Region[] = [{segs: tl.shade, fill: T.bottom.tone.shade}];
    // jeans: the fade down the front of the thigh (a lighter soft band) and the stack at the ankle
    if (T.bottom.kind === 'jeans' && lod >= 1) {
      const fa = [onTube(tl, 0.12, -0.35), onTube(tl, 0.3, -0.42), onTube(tl, 0.5, -0.4)];
      regs.push(sliver(fa, (prof(0.25) * 2) * 0.32, shiftL(T.bottom.tone.lit, 9), 0.5, 0.45));
    }
    if (lod >= 1) {
      // the fold worth drawing: in a stride, the pull from the crotch to the forward knee; standing, the drop (wide) or
      // the break above the shoe; seated, the crease behind the knee and across the lap
      if (pose.kind === 'walk') {
        const fwd = depthFwd(sk, side);
        if (fwd) regs.push(sliver([onTube(tl, 0.06, 0.55), onTube(tl, 0.24, 0.1), onTube(tl, 0.42, -0.3)], prof(0.3) * 0.16, T.bottom.tone.shade, 0.55, 0.35));
      } else if (seated) {
        regs.push(sliver([onTube(tl, 0.36, 0.7), onTube(tl, 0.46, 0.2), onTube(tl, 0.52, -0.2)], prof(0.4) * 0.18, T.bottom.tone.deep, 0.45, 0.6));
      } else if (T.bottom.kind === 'wide') {
        regs.push(sliver([onTube(tl, 0.42, -0.1), onTube(tl, 0.7, -0.14), onTube(tl, 0.97, -0.2)], prof(0.7) * 0.13, T.bottom.tone.shade, 0.5, 0.25));
      }
      if (!seated && T.bottom.kind !== 'wide' && lod >= 2) {
        regs.push(sliver([onTube(tl, 0.9, -0.7), onTube(tl, 0.92, 0), onTube(tl, 0.9, 0.7)], prof(0.9) * 0.12, T.bottom.tone.shade, 0.5));
      }
    }
    parts.push({name: `leg-${side}`, segs: tl.outline, fill: litPaint(T.bottom.tone), z: zL, regions: regs});
    parts.push(shoe5(sk, side, c, T.shoe, sex, zL - 0.3, lod));
  }
  // the seat: the trousers from the waistband to the crotch
  {
    const pv = sk.pelvis;
    const e = T.bottom.kind === 'wide' ? 8 : 4;
    const rings: RingK[] = [
      fr(pv, rise, C.waistW / 2 + e - 2 + (rise < b.waistY - 10 ? 6 : 0), C.waistD / 2 + e - 2, 0),
      fr(pv, b.hipY + 30, C.hipW / 2 + e - 4, C.hipD / 2 + e - 6, 0),
      fr(pv, b.hipY - 2, C.hipW / 2 + e, C.hipD / 2 + e - 8, 0),
      fr(pv, b.crotch + 6, C.hipW / 2 - 26 + e, C.hipD / 2 - 16 + e, 0),
    ];
    const lf = loftX(rings, c, xf);
    parts.push({name: 'seat', segs: lf.outline, fill: litPaint(T.bottom.tone), z: 33, regions: [{segs: lf.shade, fill: T.bottom.tone.shade}]});
  }

  // ================================================================ the top (knit, tee, shirt)
  const top = T.top;
  const tucked = top.tuck !== 'none';
  {
    const knit = top.kind === 'knit';
    const shirt = top.kind === 'shirt';
    // the ease: a knit relaxed (0.006-0.008 H), a tee fitted, the big shirt roomy (C3); the shoulders keep their slope
    // (a dropped seam is a soft arc down into the sleeve, never a corner)
    const e = shirt ? 15 : knit ? 7 : 3;
    const rings: RingK[] = [
      ringOf(LV.neck, shirt ? 5 : 2, shirt ? 5 : 2),
      ringOf(LV.slope, e * 0.45, e * 0.4),
      ringOf(LV.shoulder, e * 0.45, e * 0.5, shirt || knit ? -4 : 0),
      ringOf(LV.delt, e * 0.6 - 5, e * 0.7),
      ringOf(LV.chest, e, e * 0.85),
      ringOf(LV.rib, e + (shirt ? 3 : 0), e * 0.9),
    ];
    let hemRing: RingK | null = null;
    if (top.tuck === 'full') {
      rings.push(ringOf(LV.waist, e + 1, e + 1));
      rings.push(fr(LV.waist.f, rise - 14, LV.waist.a + e, LV.waist.b + e, 0));
    } else if (top.tuck === 'half') {
      rings.push(ringOf(LV.waist, e + 3, e + 2));
      const r = fr(blend(LV.waist.f, sk.pelvis, 0.6), b.waistY - 62, LV.hiph.a + e + 4, LV.hiph.b + e + 3, 0) as RingK;
      r.k = 0.72;
      rings.push(r);
    } else {
      // untucked: a gentle in at the waist, then the hem (a knit's rib hugs the hip; a tee hangs straight)
      rings.push(ringOf(LV.waist, e + (knit ? 1 : 2), e + 1));
      rings.push(ringOf(LV.hiph, e + (knit ? 1 : 3), e + 1));
      hemRing = fr(sk.pelvis, (m ? b.hipY - 2 : b.hipY + 10) + (knit ? 0 : 4), LV.hip.a + (knit ? 3 : e + 3), LV.hip.b + (knit ? 2 : e + 1), 0);
      rings.push(hemRing);
    }
    const lf = loftX(rings, c, xf);
    const regs: Region[] = [{segs: lf.shade, fill: top.tone.shade}];
    const rib = top.rib ?? top.tone;
    // the knit's rib band at an untucked hem
    if (knit && hemRing && lod >= 1) {
      const band = loftX([{...hemRing, y: hemRing.y + 17, a: hemRing.a + 1, b: hemRing.b + 1}, {...hemRing, y: hemRing.y - 6, a: hemRing.a + 1, b: hemRing.b + 1}], c, xf);
      regs.push({segs: band.outline, fill: mixLab(rib.lit, rib.shade, 0.55), opacity: 0.6});
    }
    // the neckline's band (the knit's rib, the tee's binding): inside the top, along its neck edge
    if (!shirt) {
      const nr = rings[0];
      const band = loftX([{...nr, y: nr.y + 2}, {...nr, y: nr.y - (knit ? 14 : 9), a: nr.a + 4, b: nr.b + 4}], c, xf);
      regs.push({segs: band.outline, fill: mixLab(rib.lit, rib.shade, knit ? 0.45 : 0.3), opacity: 0.75});
    }
    // folds: a tuck blouses (short drops from the waistband); an untucked top pulls a little at the near side
    if (lod >= 1 && tucked) {
      const fy = rise + 2;
      const wr = (y: number) => fr(LV.waist.f, y, LV.waist.a + e + 1, LV.waist.b + e + 1, 0);
      const at = (phi: number, y: number): V2 => proj(sk.X(ringPt(wr(y), phi)), c);
      const nF = lod >= 2 ? 2 : 1;
      for (let k = 0; k < nF; k++) {
        const ph = 66 + k * 30;
        const nz = toCam(sk.Xn(ringNrm(wr(fy), ph), fy), c)[2];
        if (nz > 0.25) regs.push(sliver([at(ph, fy), at(ph + 2, fy + 24), at(ph + 3, fy + 44)], shirt ? 9 : 6, top.tone.shade, 0.6, 0.3));
      }
    }
    parts.push({name: 'top', segs: lf.outline, fill: litPaint(top.tone), z: 40, regions: regs});
    // the waistband over a tucked top: all round (under a half tuck it shows below the hanging sides, and only the
    // front, where the shirt is tucked, lies over it)
    if (tucked) {
      const ea = T.bottom.kind === 'wide' ? 5 : 3;
      const wb: RingK[] = [fr(sk.pelvis, rise + 5, C.waistW / 2 + ea + (rise < b.waistY - 10 ? 6 : 0) + 1, C.waistD / 2 + ea + 1, 0), fr(sk.pelvis, rise - 17, C.waistW / 2 + ea + (rise < b.waistY - 10 ? 8 : 2), C.waistD / 2 + ea + 2, 0)];
      const lf2 = loftX(wb, c, xf, top.tuck === 'half' ? () => [36, 144] : undefined);
      parts.push({name: 'waistband', segs: lf2.outline, fill: litPaint(T.bottom.tone), z: 41, regions: [{segs: lf2.shade, fill: T.bottom.tone.shade}]});
    }
    // the shirt's open collar: the V of skin and the two collar wings lying on the chest
    if (shirt) {
      const nr = rings[0];
      const at = (r: RingK, phi: number, dy = 0): V2 => proj(sk.X(ringPt({...r, y: r.y + dy}, phi)), c);
      const face = (r: RingK, phi: number) => toCam(sk.Xn(ringNrm(r, phi), r.y), c)[2] > 0.05;
      const cr = rings[4];
      if (face(nr, 90)) {
        const vTip = at(cr, 90, 26);
        parts.push({name: 'collarV', segs: through([at(nr, 62, 3), at(nr, 90, -4), at(nr, 118, 3), vTip], true, 1), fill: litPaint(skin), z: 40.4, regions: [{segs: polySegs([at(nr, 62, 26), at(nr, 118, 26), vTip]), fill: skin.shade, opacity: 0.5}]});
      }
      for (const sgn of [-1, 1]) {
        const ph0 = 90 + sgn * 78;
        const ph1 = 90 + sgn * 26;
        if (!face(nr, ph1)) continue;
        const sr = rings[1];
        const pts = [at(nr, ph0, 8), at(nr, ph1, 0), at(cr, 90 + sgn * 9, 34), at(sr, 90 + sgn * 36, -10), at(sr, 90 + sgn * 64, -2)];
        const lit = toCam(sk.Xn(ringNrm(nr, ph1), nr.y), c)[0] < 0.2;
        parts.push({name: 'collar', segs: through(pts, true, 1), fill: lit ? mixLab(top.tone.lit, top.tone.sheen, 0.4) : top.tone.shade, z: 40.6});
      }
    }
  }

  // ================================================================ the outer layer: the coat or the jacket, in two panels
  if (T.outer) {
    const ou = T.outer;
    const coat = ou.kind === 'coat';
    const hemY = ou.hemY ?? (coat ? 182 : 470);
    const ph = pose.phase ?? 0;
    const walk = pose.kind === 'walk';
    // the lower body's frame: the hang follows the shoulders more than the hips
    const lowF = blend(sk.chest, sk.pelvis, 0.45);
    const lowF2: Frame = {...lowF, roll: lowF.roll * 0.5};
    // the stride pushes the hem: toward the forward knee, deeper with the spread of the knees
    const kz = (sk.leg.l.knee[2] + sk.leg.r.knee[2]) / 2;
    const spread = Math.abs(sk.leg.l.knee[2] - sk.leg.r.knee[2]);
    const swing = walk ? Math.sin(Math.PI * 2 * (ph - 0.08)) : 0;
    // the ease over the knit: a coat roomy (it hangs straight from the shoulders, 0.04 H off the body at the hem), a
    // jacket relaxed; the shoulders natural (the sleeve's seat just past the shoulder point), sloping
    const eC = coat ? 18 : 10;
    const rings: RingK[] = [
      ringOf(LV.neck, coat ? 9 : 7, coat ? 8 : 6, 14),
      ringOf(LV.slope, eC * 0.5, eC * 0.45),
      ringOf(LV.shoulder, eC * 0.45, eC * 0.5, -3),
      ringOf(LV.delt, eC * 0.6 - 4, eC * 0.7),
      ringOf(LV.chest, eC, eC * 0.85),
      fr(LV.rib.f, LV.rib.y, LV.chest.a + eC + 1, LV.chest.b + eC * 0.85, 0),
    ];
    // the lower rings follow a knee: each panel swings with its own leg (a stride kicks the near panel forward round the
    // near knee, so the leg never bulges out of the open front)
    const kk = (r: RingK, kick: number): RingK => ({...r, kick});
    const lower = (dk: number): RingK[] =>
      coat
        ? [
            fr(lowF2, b.waistY - 30, Math.max(LV.chest.a, LV.hip.a) + eC + 3, LV.chest.b + eC * 0.85 + 2, 0),
            kk(fr(lowF2, b.hipY, LV.hip.a + 10 + eC + 2, LV.hip.b + eC * 0.8, 2 + (kz - 20) * 0.1), dk * 0.3),
            kk(fr(lowF2, 330, LV.hip.a + 10 + eC + 9 + (seated ? 20 : 0), LV.hip.b + eC * 0.8 + 4 + spread * 0.12, 3 + (kz - 20) * 0.25), dk * 0.62),
            kk(fr(lowF2, hemY, LV.hip.a + 10 + eC + 14 + (seated ? 30 : 0), LV.hip.b + eC * 0.8 + 8 + spread * 0.18, 4 + (kz - 20) * 0.3 + swing * 6), dk * 0.72),
          ]
        : [fr(lowF2, b.waistY - 20, LV.chest.a + eC + 1, LV.chest.b + eC * 0.85 + 1, 0), kk(fr(lowF2, hemY, LV.hip.a + 8 + eC, LV.hip.b + eC * 0.8 + 2, 2 + (kz - 20) * 0.12), dk * 0.2)];
    // each front panel kicked by its own knee (how far that knee is ahead of the pair's average)
    const kOf = (side: 'l' | 'r') => Math.max(-10, sk.leg[side].knee[2] - kz);
    const upper = rings.slice();
    rings.push(...lower(0));
    const ringsL: RingK[] = [...upper, ...lower(kOf('l'))];
    const ringsR: RingK[] = [...upper, ...lower(kOf('r'))];
    const n = rings.length;
    // the front edges: x of each edge (the lapels open the V above the break, the edges hang straight below it)
    const breakY = coat ? 690 : 700;
    const open = seated ? 14 : 0;
    const edgeX = (y: number, i: number) => {
      const base = (coat ? 36 : 34) + (i >= n - 2 ? open * (i === n - 1 ? 1 : 0.6) : 0);
      if (y >= breakY) return base - (base - (C.neckW / 2 + (coat ? 16 : 12))) * clamp((y - breakY) / (rings[0].y - breakY), 0, 1);
      return base;
    };
    const phiE = (i: number) => (Math.acos(clamp(edgeX(rings[i].y, i) / rings[i].a, -0.98, 0.98)) * 180) / Math.PI;
    const OV = 16;
    const rangeL = (i: number): [number, number] => [-90 - OV, phiE(i)];
    const rangeR = (i: number): [number, number] => [180 - phiE(i), 270 + OV];
    const pL = loftX(ringsL, c, xf, rangeL, true);
    const pR = loftX(ringsR, c, xf, rangeR, true);
    // the layering: each panel is drawn only where it faces us, so both lie over the column (it shows between them)
    const edgePhi = (sgn: number) => (sgn > 0 ? phiE(4) : 180 - phiE(4));
    const edgeDepth = (sgn: number) => depth(sk.X(ringPt(rings[4], edgePhi(sgn))));
    const leftNear = edgeDepth(1) >= edgeDepth(-1);
    const facing = ou.facing;
    const lapel = (lf: LoftX, sgn: number, near: boolean): Region[] => {
      const regs: Region[] = [];
      // the lapel: folded back along the edge from the collar to the break
      const ii = rings.map((r, i) => i).filter((i) => rings[i].y >= breakY - 10);
      if (ii.length >= 2 && lod >= 1) {
        const pE: V2[] = [];
        const pI: V2[] = [];
        for (const i of ii) {
          const r = rings[i];
          const pe = sgn > 0 ? phiE(i) : 180 - phiE(i);
          const w = (coat ? 44 : 34) * clamp((r.y - breakY) / (rings[0].y - breakY), 0, 1);
          const dphi = ((w / r.a) * 180) / Math.PI;
          pE.push(proj(sk.X(ringPt(r, pe)), c));
          pI.push(proj(sk.X(ringPt(r, pe - sgn * dphi)), c));
        }
        const brk = proj(sk.X(ringPt(fr(LV.rib.f, breakY, LV.chest.a + eC + 2, LV.chest.b + eC, 0), sgn > 0 ? phiE(5) : 180 - phiE(5))), c);
        regs.push({segs: through([...pE, brk, ...pI.slice().reverse()], true, 1), fill: near ? mixLab(facing.lit, ou.tone.sheen, 0.25) : facing.shade});
      }
      return regs;
    };
    const panel = (lf: LoftX, sgn: number, near: boolean): PartV4 => {
      const regs: Region[] = [{segs: lf.shade, fill: ou.tone.shade}, ...lapel(lf, sgn, near)];
      // the inside of the open front in shadow: a deep band along the far edge
      const own = sgn > 0 ? ringsL : ringsR;
      if (!near) {
        const pts: V2[] = own.map((r, i) => proj(sk.X(ringPt(r, sgn > 0 ? phiE(i) : 180 - phiE(i))), c));
        const inner: V2[] = own.map((r, i) => proj(sk.X(ringPt(r, sgn > 0 ? phiE(i) - 5 : 180 - phiE(i) + 5)), c));
        regs.push({segs: through([...pts, ...inner.slice().reverse()], true, 1), fill: facing.deep, opacity: 0.8});
      }
      // a long drop fold on the near panel (from the chest to the hem) and from the back of the shoulder blade
      if (coat && lod >= 1 && near) {
        const phF = sgn > 0 ? phiE(4) - 26 : 180 - phiE(4) + 26;
        const pts = [4, 6, 7, 8].filter((i) => i < n).map((i) => proj(sk.X(ringPt(own[i], phF + (i - 4) * sgn * 2)), c));
        if (toCam(sk.Xn(ringNrm(rings[6], phF), rings[6].y), c)[2] > 0.1) regs.push(sliver(pts, lod >= 2 ? 10 : 8, ou.tone.shade, 0.55, 0.65));
      }
      if (lod >= 1) {
        // seen from behind: a soft drop from each shoulder blade
        for (const phB of [-90 + 26 * sgn, -90 - 26 * sgn].slice(0, lod >= 2 ? 2 : 1)) {
          const phx = sgn > 0 ? phB : 180 - phB;
          if (toCam(sk.Xn(ringNrm(rings[4], phx), rings[4].y), c)[2] < 0.25) continue;
          const pts = [4, 5, 6, 7].filter((i) => i < n).map((i) => proj(sk.X(ringPt(rings[i], phx)), c));
          regs.push(sliver(pts, 9, ou.tone.shade, 0.5, 0.7));
        }
      }
      return {name: sgn > 0 ? 'outer-l' : 'outer-r', segs: lf.outline, fill: litPaint(ou.tone), z: near ? 44 : 43.9, regions: regs};
    };
    parts.push(panel(pL, 1, leftNear));
    parts.push(panel(pR, -1, !leftNear));
  }

  // ================================================================ the arms: skin, sleeves, hands
  const chestD = depth(sk.X([sk.chest.x, b.chestY, sk.chest.z]));
  const legDepth = Math.max(depth(sk.leg.l.knee), depth(sk.leg.r.knee));
  for (const side of ['l', 'r'] as const) {
    const A = sk.arm[side];
    const H = sk.hand[side];
    const s = side === 'l' ? 1 : -1;
    const ad = depth(A.el);
    let z: number;
    if (ad > chestD - 30) z = 60 + dzz(A.el);
    else if (seated && ad > legDepth - 20) z = 34 + dzz(A.el);
    else z = 22 + dzz(A.el);
    if (H.pose === 'lap' && z < 40) z = Math.min(legZ.l, legZ.r) + 0.35;
    // the sleeve's seat: under the shoulder line (dropped for a coat, a knit, a shirt)
    const dropped = !!T.outer || top.kind !== 'tee';
    // the sleeve's seat: on the arm below the shoulder joint, so the sleeve's round head meets the shoulder line (never
    // a pad above it); a dropped seam a little further out and down
    const out: V3 = sk.X(framePt(sk.chest, s * (C.shoulderW / 2 + 40), b.shoulderY, -14));
    const shOut = norm3(sub3(out, sk.X(framePt(sk.chest, 0, b.shoulderY, -14))));
    const armDir = norm3(sub3(A.el, A.sh));
    // the cap (capStart 0.5) bulges half a radius back up the arm: its top lands ~12 above the joint, on the line
    const seatAt = (r0: number) => add3(add3(A.sh, mul3(armDir, 0.5 * r0 - 16)), mul3(shOut, dropped ? 3 : 0));
    const sh: V3 = [A.sh[0], A.sh[1] - 8, A.sh[2]];
    const ap = armProf(C);
    const sleeveTone = T.outer ? T.outer.tone : top.tone;
    const long = !!T.outer || top.sleeve === 'long';
    const elR = C.elbow / 2;
    // bare skin where it shows
    if (!long) {
      const from = top.sleeve === 'pushed' ? lerp3(A.el, A.wr, 0.1) : sh;
      const arm = tubeX(top.sleeve === 'pushed' ? [from, A.wr] : [from, A.el, A.wr], top.sleeve === 'pushed' ? (t) => C.fore / 2 * (1 - t) * 0.95 + (C.wrist / 2) * t + 0.5 : ap, c, {capStart: 0.35, capEnd: 0.3});
      parts.push({name: `arm-${side}`, segs: arm.outline, fill: litPaint(skin), z, regions: [{segs: arm.shade, fill: skin.shade}]});
    }
    // the sleeve
    let cuffEnd = 1;
    if (long) {
      const coatS = T.outer?.kind === 'coat';
      const r0 = (C.arm / 2) * 1.1 + (T.outer ? (coatS ? 11 : 9) : 4);
      const r1 = elR + (T.outer ? (coatS ? 13 : 11) : 6);
      const r2 = C.wrist / 2 + (T.outer ? (coatS ? 12 : 10) : 5);
      cuffEnd = T.outer ? 0.97 : 0.95;
      const cuff = lerp3(A.el, A.wr, cuffEnd);
      const seam = seatAt(r0);
      const sl = tubeX([seam, lerp3(seam, A.el, 0.5), A.el, cuff], (t) => (t < 0.5 ? r0 + (r1 - r0) * (t / 0.5) : r1 + (r2 - r1) * ((t - 0.5) / 0.5)), c, {capStart: 0.5, capEnd: 0.06, n: 20});
      const regs: Region[] = [{segs: sl.shade, fill: sleeveTone.shade}];
      // the inner elbow's fold when the arm bends
      const bend = Math.acos(clamp(dot3(norm3(sub3(A.el, A.sh)), norm3(sub3(A.wr, A.el))), -1, 1)) * (180 / Math.PI);
      if (lod >= 1 && bend > 14) {
        const vIn = sl.shadeSide === 'A' ? -0.45 : 0.45;
        regs.push(sliver([onTube(sl, 0.4, vIn * 0.3), onTube(sl, 0.5, vIn), onTube(sl, 0.6, vIn * 0.5)], r1 * 0.32, sleeveTone.shade, 0.6));
      }
      // the knit's rib cuff
      if (!T.outer && top.kind === 'knit' && lod >= 1) {
        const cb = tubeX([lerp3(A.el, A.wr, 0.84), cuff], () => r2 - 0.5, c, {capStart: 0.05, capEnd: 0.06, n: 4});
        regs.push({segs: cb.outline, fill: (top.rib ?? top.tone).shade, opacity: 0.5});
      }
      parts.push({name: `sleeve-${side}`, segs: sl.outline, fill: litPaint(sleeveTone), z: z + 0.3, regions: regs});
    } else if (top.sleeve === 'short') {
      const cuff = lerp3(A.sh, A.el, 0.44);
      const rr = (C.arm / 2) * 1.1 + (m ? 5 : 3);
      const tp = seatAt(rr);
      const sl = tubeX([tp, lerp3(tp, cuff, 0.5), cuff], (t) => rr - 2 * t, c, {capStart: 0.5, capEnd: 0.08, n: 8});
      parts.push({name: `sleeve-${side}`, segs: sl.outline, fill: litPaint(top.tone), z: z + 0.3, regions: [{segs: sl.shade, fill: top.tone.shade}]});
    } else {
      // pushed up: the roomy sleeve from the dropped seam to just past the elbow, bunched at its end
      const end = lerp3(A.el, A.wr, 0.18);
      const r0 = (C.arm / 2) * 1.1 + 10;
      const seam = seatAt(r0);
      const sl = tubeX([seam, lerp3(seam, A.el, 0.5), A.el, end], (t) => (t < 0.75 ? r0 - 4 * (t / 0.75) : r0 - 4 + 3 * ((t - 0.75) / 0.25)), c, {capStart: 0.5, capEnd: 0.2, n: 16});
      const regs: Region[] = [{segs: sl.shade, fill: top.tone.shade}];
      if (lod >= 1) {
        regs.push(sliver([onTube(sl, 0.86, -0.8), onTube(sl, 0.88, 0), onTube(sl, 0.86, 0.8)], 6, top.tone.shade, 0.6));
        if (lod >= 2) regs.push(sliver([onTube(sl, 0.94, -0.8), onTube(sl, 0.95, 0), onTube(sl, 0.94, 0.8)], 5, top.tone.shade, 0.5));
      }
      parts.push({name: `sleeve-${side}`, segs: sl.outline, fill: litPaint(top.tone), z: z + 0.3, regions: regs});
    }
    // the hand
    const hp = handPart(`hand-${side}`, H, lerp3(A.el, A.wr, long ? Math.min(1, cuffEnd + 0.01) : 1), c, skin, C.hand, m ? 1.12 : 1.0, z + (long ? 0.2 : 0.5), o.px);
    if (hp) parts.push(hp);
  }

  // ================================================================ the neck: an upright column, slender, tapering up
  if (o.neck ?? true) parts.push(neck5(sk, c, skin, C, sex));

  const hf = headFrame(sk, c);
  return {parts: parts.filter((p) => p.segs.length), skel: sk, cam: c, head: {c: hf.c, s: hf.s, rot: hf.rot, yaw: hf.yaw}};
}

/** Is this leg the forward one in the stride (its knee ahead of the other)? */
function depthFwd(sk: Skel5, side: 'l' | 'r'): boolean {
  const o = side === 'l' ? 'r' : 'l';
  return sk.leg[side].knee[2] > sk.leg[o].knee[2] + 20;
}

/** The trouser leg's radius along its chain (hip -> knee -> hem). */
function legProf(kind: Bottom5['kind'], sex: Sex, C: Comp, seated: boolean): (t: number) => number {
  const m = sex === 'm';
  const th = C.thigh / 2;
  const k: Record<Bottom5['kind'], [number, number, number, number]> = {
    wide: m ? [th + 18, th + 12, 56, 56] : [th + 22, th + 16, 64, 68],
    straight: m ? [th + 12, th + 6, 52, 52] : [th + 14, th + 8, 50, 50],
    jeans: m ? [th + 9, th + 3, 47, 47] : [th + 10, th + 4, 44, 45],
  };
  const [r0, r1, r2, r3] = k[kind];
  const kn = seated ? 0.5 : 0.48;
  return (t: number) => {
    // the top tucks into the seat (a little narrower), so the hip's curve is the seat's, never a cap
    if (t < 0.06) return r0 - 8 + 8 * (t / 0.06);
    if (t < 0.18) return r0 + (r1 - r0) * ((t - 0.06) / 0.12);
    if (t < kn) return r1 + (r2 - r1) * ((t - 0.18) / (kn - 0.18));
    return r2 + (r3 - r2) * ((t - kn) / (1 - kn));
  };
}
/** The bare arm (body.ts armProfile). */
function armProf(c: Comp): (t: number) => number {
  const keys: [number, number][] = [
    [0, c.arm * 1.12],
    [0.12, c.arm * 1.02],
    [0.38, c.arm * 0.88],
    [0.53, c.elbow],
    [0.62, c.fore],
    [0.8, c.fore * 0.82],
    [1, c.wrist],
  ];
  return (t: number) => {
    if (t <= 0) return keys[0][1] / 2;
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, v0] = keys[i - 1];
        const [t1, v1] = keys[i];
        const e = (1 - Math.cos((Math.PI * (t - t0)) / (t1 - t0))) / 2;
        return (v0 + (v1 - v0) * e) / 2;
      }
    }
    return keys[keys.length - 1][1] / 2;
  };
}

/** The neck: rings from the base (wider: her gentle flare, his trapezius) up under the skull, one shade plane. */
function neck5(sk: Skel5, c: Cam, skin: Tone, C: Comp, sex: Sex): PartV4 {
  const nb = sk.neckBase;
  const hc = sk.head.c;
  const s = sk.b.skull;
  const r = C.neckW / 2;
  const top: V3 = [hc[0], hc[1] - 0.18 * s, hc[2] - 0.12 * s];
  const base: V3 = [nb[0], nb[1] - 14, nb[2] + 4];
  const flare = sex === 'm' ? 1.5 : 1.2;
  const ts = [0, 0.3, 0.62, 0.88, 1];
  const rs = [r * 0.94, r * 0.97, r, r * (1 + (flare - 1) * 0.45), r * flare];
  const rings: Ring[] = ts.map((t, i) => {
    const p = lerp3(top, base, t);
    return {y: p[1], a: rs[i], b: rs[i] * 1.3, x: p[0], z: p[2]};
  });
  const lf = loftX(rings, c, IDX);
  const tp = proj(top, c);
  const bp = proj(base, c);
  // under the collar: the neckline of the top (z 40) and the coat's collar lie over its base
  return {name: 'neck', segs: lf.outline, fill: {lin: [tp, bp], stops: [[0, skin.shade], [0.35, skin.shade], [1, mixLab(skin.shade, skin.lit, 0.3)]]}, z: 39, regions: []};
}

/** The shoe: its sole and its upper as points in the foot's frame (heel to toe, the width, the height profile of the
 *  kind), the heel lifted about the ball by the pose, projected and wrapped smooth; the sneaker's light sole band, the
 *  boot's shaft. */
function shoe5(sk: Skel5, side: 'l' | 'r', c: Cam, sh: Shoe5, sex: Sex, z: number, lod: number): PartV4 {
  const L = sk.leg[side];
  const m = sex === 'm';
  const f = sk.b.foot * (sh.kind === 'boot' ? 1.02 : sh.kind === 'sneaker' ? 0.99 : 0.97);
  const yaw = ((L.fy + (side === 'l' ? 4 : -4)) * Math.PI) / 180;
  const fd: V3 = [Math.sin(yaw), 0, Math.cos(yaw)];
  const sd: V3 = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const w = f * (m ? 0.32 : 0.27);
  const hk: Record<Shoe5['kind'], [number, number][]> = {
    flat: [[0, 18], [0.3, 20], [0.55, 13], [0.8, 8], [1, 5]],
    loafer: [[0, 26], [0.3, 34], [0.55, 20], [0.8, 12], [1, 8]],
    sneaker: [[0, 32], [0.32, 40], [0.55, 23], [0.8, 14], [1, 8]],
    boot: [[0, 104], [0.3, 104], [0.5, 36], [0.78, 22], [1, 14]],
  };
  const H = (u: number) => {
    const K = hk[sh.kind];
    for (let i = 1; i < K.length; i++) if (u <= K[i][0]) return K[i - 1][1] + ((K[i][1] - K[i - 1][1]) * (u - K[i - 1][0])) / (K[i][0] - K[i - 1][0]);
    return K[K.length - 1][1];
  };
  const pointed = sh.kind === 'flat';
  const hw = (u: number) => (w / 2) * (u < 0.15 ? 0.62 + u * 1.6 : u < 0.62 ? 0.86 + (u - 0.15) * 0.3 : u < 0.86 ? 1.0 - (u - 0.62) * 0.9 : (1.0 - 0.216) * (1 - (u - 0.86) / 0.14) * (pointed ? 0.8 : 1) + (pointed ? 0.02 : 0.25));
  // the foot under the ankle (the ankle joint 0.24 f in front of the heel, 40 above the sole), turned by the toe's
  // pitch about the ankle (+ toes down); the skeleton lifts the ankle so the ball (or the heel) meets the ground
  const A = L.ankle;
  const fp = (L.fp * Math.PI) / 180;
  const cs = Math.cos(fp);
  const sn = Math.sin(fp);
  const P3 = (u: number, v: number, h: number): V3 => {
    const a = (u - 0.24) * f;
    const y = h - 40;
    const a2 = a * cs + y * sn;
    const y2 = -a * sn + y * cs;
    return [A[0] + fd[0] * a2 + sd[0] * v, A[1] + y2, A[2] + fd[2] * a2 + sd[2] * v];
  };
  const US = [0, 0.05, 0.12, 0.25, 0.4, 0.55, 0.68, 0.8, 0.9, 0.96, 1];
  // the near side (toward the camera)
  const sideOf = (sg: number) => US.map((u) => P3(u, hw(u) * sg, sh.kind === 'sneaker' ? 9 : 5));
  const dS = (sg: number) => sideOf(sg).reduce((a, q) => a + depth(q, c), 0);
  const near = dS(1) >= dS(-1) ? 1 : -1;
  // seen from the side, the shoe is its designed side profile (the toe box, the vamp, the collar's dip, the rounded
  // heel: what a hull cannot make), drawn on the near side's plane; a foot pointing at us falls back to the hull
  const fdc = toCam(norm3([fd[0] * cs, -sn, fd[2] * cs]), c);
  let outline: Seg[];
  if (Math.abs(fdc[2]) < 0.62) {
    const pr = SHOE_PROFILE[sh.kind].map(([u, h]) => proj(P3(u, hw(clamp(u, 0, 1)) * near * 0.92, h), c));
    outline = through(pr, true, 1);
  } else {
    const pts: V2[] = [];
    for (const u of US) {
      for (const v of [-1, -0.5, 0, 0.5, 1]) {
        const wv = hw(u) * v;
        pts.push(proj(P3(u, wv, 0), c));
        pts.push(proj(P3(u, wv * 0.86, H(u) * (1 - 0.25 * v * v)), c));
      }
    }
    outline = through(hull(pts), true, 0.85);
  }
  const regs: Region[] = [];
  const line = sideOf(near).map((q) => proj(q, c));
  const toeS = proj(P3(1.02, 0, sh.kind === 'sneaker' ? 9 : 5), c);
  const heelS = proj(P3(-0.02, 0, sh.kind === 'sneaker' ? 9 : 5), c);
  const band = [heelS, ...line, toeS, [toeS[0], toeS[1] + 200] as V2, [heelS[0], heelS[1] + 200] as V2];
  regs.push({segs: polySegs(band), fill: sh.kind === 'sneaker' ? sh.sole ?? '#EFE7DA' : sh.tone.shade});
  // the shade: the far side of the upper (away from the key)
  const tp = proj(P3(0.5, 0, H(0.5)), c);
  const lt = proj(P3(0.5, hw(0.5) * near, H(0.5) * 0.6), c);
  if (Math.abs(lt[0] - tp[0]) > 1) regs.push({segs: polySegs([[tp[0] + 2, tp[1] - 300], [tp[0] + 300, tp[1] - 300], [tp[0] + 300, tp[1] + 300], [tp[0] + 2, tp[1] + 300]]), fill: sh.tone.shade, opacity: 0.5});
  // the sneaker's stripe (a swoosh-free curved band) and the loafer's saddle, at size
  if (lod >= 2 && sh.kind === 'sneaker' && sh.stripe) {
    const a = [0.3, 0.42, 0.56, 0.68].map((u, i) => proj(P3(u, hw(u) * near, 14 + i * 6), c));
    regs.push(sliver(a, 9, sh.stripe, 0.9, 0.5));
  }
  return {name: `shoe-${side}`, segs: outline, fill: litPaint(sh.tone, [proj(P3(0, 0, 40), c), proj(P3(1, 0, 0), c)]), z, regions: regs};
}
const depth = (q: V3, c: Cam) => toCam(q, c)[2];
/** Each shoe's side profile: (u along the foot from the heel, f = 1; h up from the sole, body units), drawn round from
 *  the heel's base along the sole to the toe, over the toe box and the vamp, down into the collar, round the heel. */
const SHOE_PROFILE: Record<Shoe5['kind'], [number, number][]> = {
  sneaker: [[0.04, -1], [0.45, -1.5], [0.86, 0], [0.98, 4], [1.01, 11], [0.97, 19], [0.86, 25], [0.66, 31], [0.46, 40], [0.38, 42], [0.31, 35], [0.22, 31], [0.11, 34], [0.04, 36], [-0.012, 27], [-0.018, 12]],
  loafer: [[0.04, -1], [0.5, -1.5], [0.88, 0], [0.99, 3], [1.01, 9], [0.95, 16], [0.82, 21], [0.62, 26], [0.5, 27], [0.42, 23], [0.26, 22], [0.12, 25], [0.04, 27], [-0.01, 19], [-0.016, 8]],
  flat: [[0.04, -1], [0.5, -1.5], [0.9, 0], [1.0, 2], [1.02, 5], [0.95, 10], [0.8, 14], [0.66, 17], [0.58, 15], [0.4, 15], [0.2, 17], [0.06, 19], [-0.005, 14], [-0.012, 6]],
  boot: [[0.04, -1], [0.5, -1.5], [0.88, 0], [0.99, 4], [1.01, 12], [0.95, 21], [0.82, 28], [0.62, 36], [0.48, 52], [0.42, 84], [0.4, 106], [0.18, 108], [0.08, 104], [0.03, 72], [-0.01, 30], [-0.018, 10]],
};
function hull(pts: V2[]): V2[] {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: V2, a: V2, b: V2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: V2[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: V2[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
