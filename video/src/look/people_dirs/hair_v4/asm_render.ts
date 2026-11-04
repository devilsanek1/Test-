// PEOPLE v4 ASSEMBLED (docs/look/people_design/hair_v4/final/FINAL.md): ONE SVG writer for the assembled figures.
// The faces round's parts (people_v4/paint.ts PartV4: pen segments, flat / linear / radial paints, clipped regions,
// free strokes) and the hair round's parts (part4.ts Part4: path strings, a linear paint, blurred regions, the rim band)
// are normalised to one part (P5) and written as one SVG string in z order. What the assembly adds:
//   casts    a cast shadow GROUP inside a part: many shapes shaded as ONE (so overlaps never double-darken), shifted
//            away from the key and softened: the hair's shadow on the forehead, the cheek, the ear and the nape
//   rimBand  on any part (the hair's, and now the shoulders'): a band inside the part where the FIGURE's silhouette
//            faces the key (the part minus the whole figure shifted away from the light; CRAFT section d.8)
import {toD, through, type Seg} from '../people_v4/pen';
import type {V2} from './bez';
import type {PartV4, Paint as PV4} from '../people_v4/paint';
import type {Part4} from './part4';

export type Paint5 = PV4;
export type Region5 = {d: string; fill: Paint5; opacity?: number; blur?: number};
export type Cast5 = {ds: string[]; fill: string; opacity: number; blur?: number; dx: number; dy: number};
export type Rim5 = {dx: number; dy: number; color: string; opacity?: number; blur?: number};
export type Role = 'skin' | 'face' | 'hair' | 'body' | 'prop';
export type P5 = {
  name: string;
  d: string;
  fill: Paint5;
  z: number;
  regions?: Region5[];
  casts?: Cast5[];
  opacity?: number;
  free?: boolean;
  rimBand?: Rim5;
  line?: {w: number; color: string; cap?: 'round' | 'butt'};
  ground?: boolean;
  role?: Role;
};

/** The faces round's tapered strokes (the lash, the lid, the brow) end in a NaN tip point: people_v4/head.ts PROF.lash
 *  takes Math.pow of 1 - (t - 0.58) / 0.42, which is -2e-16 at t = 1 in floating point, and the browser then stops the
 *  path at the NaN (half the stroke drawn: only its upper edge and a chord). Repaired here, downstream: the loop's points
 *  are the segments' starts; a NaN point is put back where the stroke's centre line ends (extrapolated from its two
 *  neighbours on either edge), and the loop is rejoined with the same smooth-through (pen.ts through). The one-line fix
 *  at the source is a clamp, Math.max(0, ...), for the faces round. */
function repairSegs(segs: Seg[]): Seg[] {
  const bad = (q: V2) => !Number.isFinite(q[0]) || !Number.isFinite(q[1]);
  if (!segs.some((s) => s.some(bad))) return segs;
  const pts: V2[] = segs.map((s) => s[0]);
  const m = pts.length;
  for (let i = 0; i < m; i++) {
    if (!bad(pts[i])) continue;
    const a1 = pts[(i - 1 + m) % m];
    const a2 = pts[(i - 2 + m) % m];
    const b1 = pts[(i + 1) % m];
    const b2 = pts[(i + 2) % m];
    if ([a1, a2, b1, b2].some(bad)) {
      pts[i] = bad(a1) ? b1 : a1;
      continue;
    }
    const m1: V2 = [(a1[0] + b1[0]) / 2, (a1[1] + b1[1]) / 2];
    const m2: V2 = [(a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2];
    pts[i] = [2 * m1[0] - m2[0], 2 * m1[1] - m2[1]];
  }
  return through(pts, true, 1);
}

export function fromV4(p: PartV4, role: Role): P5 {
  return {
    name: p.name,
    d: toD(repairSegs(p.segs)),
    fill: p.fill,
    z: p.z,
    regions: (p.regions ?? []).filter((r) => r.segs.length).map((r) => ({d: toD(r.segs, undefined, !r.open), fill: r.fill, opacity: r.opacity})),
    opacity: p.opacity,
    free: p.free,
    role,
  };
}
export function fromH4(p: Part4, role: Role): P5 {
  return {
    name: p.name,
    d: p.d,
    fill: p.paint ? {lin: [p.paint.a, p.paint.b], stops: p.paint.stops} : p.fill,
    z: p.z,
    regions: (p.regions ?? []).filter((r) => r.d).map((r) => ({d: r.d, fill: r.paint ? {lin: [r.paint.a, r.paint.b], stops: r.paint.stops} : r.fill, opacity: r.opacity, blur: r.blur})),
    opacity: p.opacity,
    rimBand: p.rimBand,
    line: p.line,
    ground: p.ground,
    role,
  };
}

const f2 = (v: number) => (Math.round(v * 100) / 100).toString();
function paintDef(id: string, f: Paint5): {def: string; ref: string} {
  if (typeof f === 'string') return {def: '', ref: f};
  const stops = f.stops.map(([o, c, a]) => `<stop offset="${f2(o)}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${f2(a)}"` : ''}/>`).join('');
  if ('lin' in f) {
    const [a, b] = f.lin;
    return {def: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}">${stops}</linearGradient>`, ref: `url(#${id})`};
  }
  const {c, rx, ry, a} = f.rad;
  const k = (ry ?? rx) / rx;
  const tr = `translate(${f2(c[0])} ${f2(c[1])}) rotate(${f2(a ?? 0)}) scale(1 ${f2(k)})`;
  return {def: `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${f2(rx)}" gradientTransform="${tr}">${stops}</radialGradient>`, ref: `url(#${id})`};
}
const BOX = 'filterUnits="userSpaceOnUse" x="-4000" y="-4000" width="8000" height="12000"';

/** The figure's parts (figure units) as one SVG fragment, sorted by z. uid keeps every id unique on the page. */
export function svgOf(parts: P5[], uid: string, o: {mono?: string; shadow?: boolean} = {}): string {
  const sorted = parts.filter((p) => p.d).slice().sort((a, b) => a.z - b.z);
  const solid = sorted.filter((p) => !p.ground && !p.line && (p.opacity ?? 1) > 0.5);
  const out: string[] = [];
  if (!o.mono && sorted.some((p) => p.rimBand)) out.push(`<defs><g id="${uid}S">${solid.map((p) => `<path d="${p.d}"/>`).join('')}</g></defs>`);
  sorted.forEach((p, i) => {
    const id = `${uid}_${i}`;
    const op = p.opacity !== undefined && p.opacity !== 1 ? ` opacity="${f2(p.opacity)}"` : '';
    if (p.ground) {
      if (o.mono || o.shadow === false) return;
      const pd = paintDef(`${id}f`, p.fill);
      out.push(`${pd.def ? `<defs>${pd.def}</defs>` : ''}<path d="${p.d}" fill="${pd.ref}"${op}/>`);
      return;
    }
    if (p.line) {
      out.push(`<path d="${p.d}" fill="none" stroke="${o.mono ?? p.line.color}" stroke-width="${f2(p.line.w)}" stroke-linecap="${p.line.cap ?? 'round'}" stroke-linejoin="round"${op}/>`);
      return;
    }
    if (o.mono) {
      out.push(`<path d="${p.d}" fill="${o.mono}"${op}/>`);
      return;
    }
    const base = paintDef(`${id}f`, p.fill);
    const regs = p.regions ?? [];
    const casts = (p.casts ?? []).filter((c) => c.ds.length);
    const rb = p.rimBand;
    if (p.free || (!regs.length && !casts.length && !rb)) {
      out.push(`${base.def ? `<defs>${base.def}</defs>` : ''}<path d="${p.d}" fill="${base.ref}"${op}/>`);
      return;
    }
    let defs = base.def + `<clipPath id="${id}c"><path d="${p.d}"/></clipPath>`;
    const inner: string[] = [];
    regs.forEach((r, j) => {
      const pd = paintDef(`${id}r${j}`, r.fill);
      defs += pd.def;
      let filt = '';
      if (r.blur) {
        defs += `<filter id="${id}b${j}" ${BOX}><feGaussianBlur stdDeviation="${f2(r.blur)}"/></filter>`;
        filt = ` filter="url(#${id}b${j})"`;
      }
      inner.push(`<path d="${r.d}" fill="${pd.ref}"${r.opacity !== undefined ? ` opacity="${f2(r.opacity)}"` : ''}${filt}/>`);
    });
    casts.forEach((c, j) => {
      let filt = '';
      if (c.blur) {
        defs += `<filter id="${id}k${j}" ${BOX}><feGaussianBlur stdDeviation="${f2(c.blur)}"/></filter>`;
        filt = ` filter="url(#${id}k${j})"`;
      }
      inner.push(`<g opacity="${f2(c.opacity)}"><g${filt}><g transform="translate(${f2(c.dx)} ${f2(c.dy)})" fill="${c.fill}">${c.ds.map((d) => `<path d="${d}"/>`).join('')}</g></g></g>`);
    });
    if (rb) {
      defs += `<mask id="${id}m" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="8000" height="12000"><path d="${p.d}" fill="#fff"/><use href="#${uid}S" transform="translate(${f2(rb.dx)} ${f2(rb.dy)})" fill="#000"/></mask>`;
      let filt = '';
      if (rb.blur) {
        defs += `<filter id="${id}rb" ${BOX}><feGaussianBlur stdDeviation="${f2(rb.blur)}"/></filter>`;
        filt = ` filter="url(#${id}rb)"`;
      }
      inner.push(`<g mask="url(#${id}m)"><rect x="-4000" y="-4000" width="8000" height="12000" fill="${rb.color}" opacity="${f2(rb.opacity ?? 1)}"${filt}/></g>`);
    }
    out.push(`<g${op}><defs>${defs}</defs><path d="${p.d}" fill="${base.ref}"/><g clip-path="url(#${id}c)">${inner.join('')}</g></g>`);
  });
  return out.join('');
}

/** A figure placed like Fig4: soles at (x, y), drawn h px tall (figure units: H = 1000); flip mirrors it. */
export function placeSvg(parts: P5[], uid: string, x: number, y: number, h: number, o: {flip?: boolean; mono?: string; shadow?: boolean} = {}): string {
  const s = h / 1000;
  const f5 = (v: number) => (Math.round(v * 1e5) / 1e5).toString();
  return `<g transform="translate(${f5(x)},${f5(y - h)}) scale(${f5(o.flip ? -s : s)},${f5(s)})">${svgOf(parts, uid, o)}</g>`;
}
