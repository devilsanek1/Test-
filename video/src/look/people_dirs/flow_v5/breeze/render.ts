// FLOW v5, BREEZE: the SVG writer (after hair_v4/asm_render.ts svgOf, copied and extended, never edited there). A
// figure is a list of PARTS in z order, each one flat shape softly painted inside: a fill (flat or one soft gradient
// toward the light), planes clipped inside it (a long straight shade plane, a soft blurred shade), and a RIM: the thin
// lit edge where the figure's silhouette faces the key (the part minus the whole figure shifted away from the light),
// sized in screen pixels by the caller so it survives at film size. A part may FADE (a ribbon's feathered tip: an alpha
// ramp along it). A GROUND part (the soft contact shadow) is drawn first and left out of silhouettes. No outlines.
import type {V2} from './v';

export type Stop = [number, string, number?];
export type Paint = string | {lin: [V2, V2]; stops: Stop[]} | {rad: {c: V2; r: number; ry?: number; a?: number}; stops: Stop[]};
export type Region = {d: string; fill: Paint; opacity?: number; blur?: number};
export type Rim = {dx: number; dy: number; color: string; opacity?: number; blur?: number};
export type Part = {
  name: string;
  d: string;
  fill: Paint;
  z: number;
  regions?: Region[];
  rim?: Rim;
  /** an alpha ramp from a (opaque) to b (clear), starting at `from` (0..1 of the way) */
  fade?: {a: V2; b: V2; from?: number};
  opacity?: number;
  /** the contact shadow: drawn first, blurred, never in a silhouette */
  ground?: boolean;
  blur?: number;
  /** left out of the silhouette the rims are cut from (a translucent veil) */
  ghost?: boolean;
};

const f2 = (v: number) => (Math.round(v * 100) / 100).toString();
function paintDef(id: string, f: Paint): {def: string; ref: string} {
  if (typeof f === 'string') return {def: '', ref: f};
  const stops = f.stops.map(([o, c, a]) => `<stop offset="${f2(o)}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${f2(a)}"` : ''}/>`).join('');
  if ('lin' in f) {
    const [a, b] = f.lin;
    return {def: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}">${stops}</linearGradient>`, ref: `url(#${id})`};
  }
  const {c, r, ry, a} = f.rad;
  const k = (ry ?? r) / r;
  const tr = `translate(${f2(c[0])} ${f2(c[1])}) rotate(${f2(a ?? 0)}) scale(1 ${f2(k)})`;
  return {def: `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${f2(r)}" gradientTransform="${tr}">${stops}</radialGradient>`, ref: `url(#${id})`};
}
const BOX = 'x="-6000" y="-6000" width="14000" height="16000"';
const FBOX = `filterUnits="userSpaceOnUse" ${BOX}`;

export type SvgOpts = {
  /** every part filled with this colour (the silhouette test); no shadow, no paint */
  mono?: string;
  shadow?: boolean;
};

/** The parts (figure units) as one SVG fragment, sorted by z; uid keeps every id unique on the page. */
export function svgOf(parts: Part[], uid: string, o: SvgOpts = {}): string {
  const sorted = parts.filter((p) => p.d).slice().sort((a, b) => a.z - b.z);
  const out: string[] = [];
  if (o.mono) {
    for (const p of sorted) if (!p.ground && !p.ghost) out.push(`<path d="${p.d}" fill="${o.mono}"/>`);
    return out.join('');
  }
  const solid = sorted.filter((p) => !p.ground && !p.ghost);
  if (sorted.some((p) => p.rim)) out.push(`<defs><g id="${uid}S">${solid.map((p) => `<path d="${p.d}"/>`).join('')}</g></defs>`);
  sorted.forEach((p, i) => {
    const id = `${uid}_${i}`;
    const op = p.opacity !== undefined && p.opacity !== 1 ? ` opacity="${f2(p.opacity)}"` : '';
    if (p.ground) {
      if (o.shadow === false) return;
      const pd = paintDef(`${id}f`, p.fill);
      let defs = pd.def;
      let filt = '';
      if (p.blur) {
        defs += `<filter id="${id}g" ${FBOX}><feGaussianBlur stdDeviation="${f2(p.blur)}"/></filter>`;
        filt = ` filter="url(#${id}g)"`;
      }
      out.push(`${defs ? `<defs>${defs}</defs>` : ''}<path d="${p.d}" fill="${pd.ref}"${op}${filt}/>`);
      return;
    }
    const base = paintDef(`${id}f`, p.fill);
    let defs = base.def;
    const regs = p.regions ?? [];
    const rb = p.rim;
    let fadeRef = '';
    if (p.fade) {
      const fr = p.fade.from ?? 0;
      defs += `<linearGradient id="${id}fg" gradientUnits="userSpaceOnUse" x1="${f2(p.fade.a[0])}" y1="${f2(p.fade.a[1])}" x2="${f2(p.fade.b[0])}" y2="${f2(p.fade.b[1])}"><stop offset="0" stop-color="#fff"/><stop offset="${f2(fr)}" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>`;
      defs += `<mask id="${id}fm" maskUnits="userSpaceOnUse" ${BOX}><rect ${BOX} fill="url(#${id}fg)"/></mask>`;
      fadeRef = ` mask="url(#${id}fm)"`;
    }
    if (!regs.length && !rb) {
      out.push(`<g${op}${fadeRef}>${defs ? `<defs>${defs}</defs>` : ''}<path d="${p.d}" fill="${base.ref}"/></g>`);
      return;
    }
    defs += `<clipPath id="${id}c"><path d="${p.d}"/></clipPath>`;
    const inner: string[] = [];
    regs.forEach((r, j) => {
      const pd = paintDef(`${id}r${j}`, r.fill);
      defs += pd.def;
      let filt = '';
      if (r.blur) {
        defs += `<filter id="${id}b${j}" ${FBOX}><feGaussianBlur stdDeviation="${f2(r.blur)}"/></filter>`;
        filt = ` filter="url(#${id}b${j})"`;
      }
      inner.push(`<path d="${r.d}" fill="${pd.ref}"${r.opacity !== undefined ? ` opacity="${f2(r.opacity)}"` : ''}${filt}/>`);
    });
    if (rb) {
      defs += `<mask id="${id}m" maskUnits="userSpaceOnUse" ${BOX}><path d="${p.d}" fill="#fff"/><use href="#${uid}S" transform="translate(${f2(rb.dx)} ${f2(rb.dy)})" fill="#000"/></mask>`;
      let filt = '';
      if (rb.blur) {
        defs += `<filter id="${id}rb" ${FBOX}><feGaussianBlur stdDeviation="${f2(rb.blur)}"/></filter>`;
        filt = ` filter="url(#${id}rb)"`;
      }
      inner.push(`<g mask="url(#${id}m)"><rect ${BOX} fill="${rb.color}" opacity="${f2(rb.opacity ?? 1)}"${filt}/></g>`);
    }
    out.push(`<g${op}${fadeRef}><defs>${defs}</defs><path d="${p.d}" fill="${base.ref}"/><g clip-path="url(#${id}c)">${inner.join('')}</g></g>`);
  });
  return out.join('');
}

/** A figure placed with its soles at (x, y), drawn h px tall (figure units: H = 1000). */
export function place(parts: Part[], uid: string, x: number, y: number, h: number, o: SvgOpts & {opacity?: number} = {}): string {
  const s = h / 1000;
  const f5 = (v: number) => (Math.round(v * 1e5) / 1e5).toString();
  const op = o.opacity !== undefined && o.opacity < 1 ? ` opacity="${f5(o.opacity)}"` : '';
  return `<g transform="translate(${f5(x)},${f5(y - h)}) scale(${f5(s)})"${op}>${svgOf(parts, uid, o)}</g>`;
}
