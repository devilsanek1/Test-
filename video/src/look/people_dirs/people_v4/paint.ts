// PEOPLE v4: parts, paints and the SVG writer. A part is one closed pen outline with its fill, plus regions drawn
// inside it (clipped by it): the shade plane, the cheek's warm tone, the lips' tone, a cast shadow. A fill is a flat
// colour or a SOFT GRADIENT (the playbook: "few shapes lit warm on one side with soft gradients"; DIRECTION rule 5:
// colour and light moving gently inside a plane, the step between the planes kept crisp). Parts are authored in any
// units (head units for a face, body units for a figure) and mapped to the figure's screen by a similarity map, which
// keeps every cubic and every gradient exact.
import type {V2} from '../graphic/geo';
import {toD, mapSegs, type Seg} from './pen';

export type Stop = [number, string, number?];
/** A flat colour, a linear gradient (from, to) or a radial one (centre, rx, ry, angle of rx in degrees). */
export type Paint = string | {lin: [V2, V2]; stops: Stop[]} | {rad: {c: V2; rx: number; ry?: number; a?: number}; stops: Stop[]};

export type Region = {segs: Seg[]; fill: Paint; opacity?: number; open?: boolean};
export type PartV4 = {
  name: string;
  segs: Seg[];
  fill: Paint;
  z: number;
  regions?: Region[];
  opacity?: number;
  /** a crisp rim of light on the key-facing edge (the subject only; DIRECTION rule 5): the fill shifted down-right */
  rim?: string;
  /** no clip (a lash drawn over everything), drawn as is */
  free?: boolean;
};

/** A similarity map: p -> c + R(rot) * s * p (mirror flips x first). */
export type Sim = {c: V2; s: number; rot: number; mirror?: boolean};
export const simP = (m: Sim) => {
  const r = (m.rot * Math.PI) / 180;
  const cs = Math.cos(r);
  const sn = Math.sin(r);
  return (p: V2): V2 => {
    const x = (m.mirror ? -p[0] : p[0]) * m.s;
    const y = p[1] * m.s;
    return [m.c[0] + x * cs - y * sn, m.c[1] + x * sn + y * cs];
  };
};
export function mapPaint(f: Paint, m: Sim): Paint {
  if (typeof f === 'string') return f;
  const P = simP(m);
  if ('lin' in f) return {lin: [P(f.lin[0]), P(f.lin[1])], stops: f.stops};
  const a = (m.mirror ? 180 - (f.rad.a ?? 0) : f.rad.a ?? 0) + m.rot;
  return {rad: {c: P(f.rad.c), rx: f.rad.rx * m.s, ry: (f.rad.ry ?? f.rad.rx) * m.s, a}, stops: f.stops};
}
export function mapPart(p: PartV4, m: Sim): PartV4 {
  const P = simP(m);
  return {
    ...p,
    segs: mapSegs(p.segs, P),
    fill: mapPaint(p.fill, m),
    regions: p.regions?.map((r) => ({...r, segs: mapSegs(r.segs, P), fill: mapPaint(r.fill, m)})),
  };
}

/** A polygon as straight segments (a region that is only ever seen through a clip). */
export function polySegs(pts: V2[]): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    out.push([a, [a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3], [a[0] + ((b[0] - a[0]) * 2) / 3, a[1] + ((b[1] - a[1]) * 2) / 3], b]);
  }
  return out;
}

// ---------------------------------------------------------------- the SVG writer (one string: previews and Remotion)
const fmt = (v: number) => (Math.round(v * 100) / 100).toString();
function paintDef(id: string, f: Paint): {def: string; ref: string} {
  if (typeof f === 'string') return {def: '', ref: f};
  const stops = f.stops.map(([o, c, a]) => `<stop offset="${fmt(o)}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${fmt(a)}"` : ''}/>`).join('');
  if ('lin' in f) {
    const [a, b] = f.lin;
    return {def: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${fmt(a[0])}" y1="${fmt(a[1])}" x2="${fmt(b[0])}" y2="${fmt(b[1])}">${stops}</linearGradient>`, ref: `url(#${id})`};
  }
  const {c, rx, ry, a} = f.rad;
  const k = (ry ?? rx) / rx;
  const tr = `translate(${fmt(c[0])} ${fmt(c[1])}) rotate(${fmt(a ?? 0)}) scale(1 ${fmt(k)})`;
  return {def: `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${fmt(rx)}" gradientTransform="${tr}">${stops}</radialGradient>`, ref: `url(#${id})`};
}

/** All parts (already in screen units) as one SVG fragment, sorted by z. uid makes the ids unique per figure. */
export function partsSvg(parts: PartV4[], uid: string, o: {mono?: string; rimShift?: V2} = {}): string {
  const out: string[] = [];
  const sorted = parts.slice().sort((a, b) => a.z - b.z);
  const RS = o.rimShift ?? [5.5, 4];
  sorted.forEach((p, i) => {
    const id = `${uid}p${i}`;
    const d = toD(p.segs);
    if (!d) return;
    const op = p.opacity !== undefined ? ` opacity="${fmt(p.opacity)}"` : '';
    if (o.mono) {
      out.push(`<path d="${d}" fill="${o.mono}"${op}/>`);
      return;
    }
    const base = paintDef(`${id}f`, p.fill);
    const regs = (p.regions ?? []).filter((r) => r.segs.length);
    if (p.free || (!regs.length && !p.rim)) {
      out.push(`${base.def}<path d="${d}" fill="${base.ref}"${op}/>`);
      return;
    }
    const inner: string[] = [];
    let defs = base.def;
    if (p.rim) inner.push(`<path d="${d}" fill="${base.ref}" transform="translate(${RS[0]} ${RS[1]})"/>`);
    regs.forEach((r, j) => {
      const pd = paintDef(`${id}r${j}`, r.fill);
      defs += pd.def;
      inner.push(`<path d="${toD(r.segs, undefined, !r.open)}" fill="${pd.ref}"${r.opacity !== undefined ? ` opacity="${fmt(r.opacity)}"` : ''}/>`);
    });
    out.push(
      `<g${op}><defs>${defs}<clipPath id="${id}c"><path d="${d}"/></clipPath></defs><path d="${d}" fill="${p.rim ?? base.ref}"/><g clip-path="url(#${id}c)">${inner.join('')}</g></g>`,
    );
  });
  return out.join('');
}
