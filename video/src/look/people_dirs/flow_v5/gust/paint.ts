// FLOW v5, GUST: the paint. Flat shapes softly painted inside (one gradient across each shape toward the light, a
// few long straight planes), crisp outer edges, ribbon tips feathered, a thin crisp LIT EDGE on the light side, a
// soft contact shadow; no outlines. Written as one SVG string in z order (after hair_v4/asm_render.ts svgOf).
//   rim    a band inside a part where the whole FIGURE's silhouette faces the key: the part minus the silhouette
//          shifted away from the light. Its width is given in SCREEN pixels, so it survives at film size.
//   fade   an alpha fade along a line for the whole part, rim included (a ribbon's tip feathering into the sky)
//   ground the contact shadow: soft, outside the silhouette
import type {V2} from './geo';

export type Stop = [number, string, number?];
export type Paint = string | {lin: [V2, V2]; stops: Stop[]} | {rad: {c: V2; rx: number; ry?: number; a?: number}; stops: Stop[]};
export type Region = {d: string; fill: Paint; opacity?: number; blurPx?: number};
export type Part = {
  name: string;
  d: string;
  fill: Paint;
  z: number;
  /** shapes painted inside the part (clipped to it): planes, soft light, soft shade */
  regions?: Region[];
  /** the lit edge: width in screen px (scaled by the figure's px), colour, opacity */
  rim?: {px: number; color: string; opacity?: number};
  /** feather the whole part along a -> b: opaque until `from`, gone at `to` (fractions of a -> b) */
  fade?: {a: V2; b: V2; from: number; to: number};
  /** the contact shadow (not in the silhouette, not in the black test) */
  ground?: boolean;
  /** soft edges for the whole part, screen px */
  blurPx?: number;
  opacity?: number;
  /** left out of the silhouette that masks the rim (a thin wisp, a ground shadow) */
  noSil?: boolean;
};

const f2 = (v: number) => (Math.round(v * 100) / 100).toString();
function paintDef(id: string, p: Paint): {def: string; ref: string} {
  if (typeof p === 'string') return {def: '', ref: p};
  const stops = p.stops.map(([o, c, a]) => `<stop offset="${f2(o)}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${f2(a)}"` : ''}/>`).join('');
  if ('lin' in p) {
    const [a, b] = p.lin;
    return {def: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}">${stops}</linearGradient>`, ref: `url(#${id})`};
  }
  const {c, rx, ry, a} = p.rad;
  const k = (ry ?? rx) / rx;
  const tr = `translate(${f2(c[0])} ${f2(c[1])}) rotate(${f2(a ?? 0)}) scale(1 ${f2(k)})`;
  return {def: `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${f2(rx)}" gradientTransform="${tr}">${stops}</radialGradient>`, ref: `url(#${id})`};
}
const BOX = 'filterUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="8000"';

export type SvgOpts = {
  /** the figure's height on screen in px (sizes the rim, the blurs) */
  px: number;
  /** the direction the light travels (unit vector, screen): from the upper left = [0.8, 0.6] */
  light?: V2;
  /** draw every part in one colour (the silhouette test) */
  mono?: string;
  /** leave the contact shadow out */
  noGround?: boolean;
};

/** The parts (figure units) as one SVG fragment, sorted by z. uid keeps every id unique on the page. */
export function svgOf(parts: Part[], uid: string, o: SvgOpts): string {
  const u = 1000 / o.px; // figure units per screen px
  const L = o.light ?? [0.8, 0.6];
  const sorted = parts.filter((p) => p.d).slice().sort((a, b) => a.z - b.z);
  const out: string[] = [];
  const solid = sorted.filter((p) => !p.ground && !p.noSil && (p.opacity ?? 1) > 0.5);
  const anyRim = !o.mono && sorted.some((p) => p.rim);
  if (anyRim) out.push(`<defs><g id="${uid}S">${solid.map((p) => `<path d="${p.d}"/>`).join('')}</g></defs>`);
  sorted.forEach((p, i) => {
    const id = `${uid}_${i}`;
    const op = p.opacity !== undefined && p.opacity !== 1 ? ` opacity="${f2(p.opacity)}"` : '';
    let defs = '';
    let wrapOpen = '';
    let wrapClose = '';
    if (p.fade) {
      const {a, b, from, to} = p.fade;
      defs += `<linearGradient id="${id}fg" gradientUnits="userSpaceOnUse" x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}"><stop offset="${f2(from)}" stop-color="#fff"/><stop offset="${f2(to)}" stop-color="#000"/></linearGradient>`;
      defs += `<mask id="${id}fm" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="8000"><path d="${p.d}" fill="url(#${id}fg)"/></mask>`;
      wrapOpen = `<g mask="url(#${id}fm)">`;
      wrapClose = '</g>';
    }
    if (p.blurPx && !o.mono) {
      defs += `<filter id="${id}pb" ${BOX}><feGaussianBlur stdDeviation="${f2(p.blurPx * u)}"/></filter>`;
      wrapOpen += `<g filter="url(#${id}pb)">`;
      wrapClose = '</g>' + wrapClose;
    }
    if (p.ground) {
      if (o.mono || o.noGround) return;
      const pd = paintDef(`${id}f`, p.fill);
      out.push(`<defs>${defs}${pd.def}</defs>${wrapOpen}<path d="${p.d}" fill="${pd.ref}"${op}/>${wrapClose}`);
      return;
    }
    if (o.mono) {
      out.push(`${defs ? `<defs>${defs}</defs>` : ''}${wrapOpen}<path d="${p.d}" fill="${o.mono}"${op}/>${wrapClose}`);
      return;
    }
    const base = paintDef(`${id}f`, p.fill);
    defs += base.def;
    const regs = p.regions ?? [];
    if (!regs.length && !p.rim) {
      out.push(`<defs>${defs}</defs>${wrapOpen}<path d="${p.d}" fill="${base.ref}"${op}/>${wrapClose}`);
      return;
    }
    defs += `<clipPath id="${id}c"><path d="${p.d}"/></clipPath>`;
    const inner: string[] = [];
    regs.forEach((r, j) => {
      const pd = paintDef(`${id}r${j}`, r.fill);
      defs += pd.def;
      let filt = '';
      if (r.blurPx) {
        defs += `<filter id="${id}b${j}" ${BOX}><feGaussianBlur stdDeviation="${f2(r.blurPx * u)}"/></filter>`;
        filt = ` filter="url(#${id}b${j})"`;
      }
      inner.push(`<path d="${r.d}" fill="${pd.ref}"${r.opacity !== undefined ? ` opacity="${f2(r.opacity)}"` : ''}${filt}/>`);
    });
    if (p.rim) {
      const w = p.rim.px * u;
      const dx = L[0] * w;
      const dy = L[1] * w;
      defs += `<mask id="${id}m" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="8000"><path d="${p.d}" fill="#fff"/><use href="#${uid}S" transform="translate(${f2(dx)} ${f2(dy)})" fill="#000"/></mask>`;
      inner.push(`<g mask="url(#${id}m)"><rect x="-3000" y="-3000" width="7000" height="8000" fill="${p.rim.color}" opacity="${f2(p.rim.opacity ?? 1)}"/></g>`);
    }
    out.push(`<g${op}><defs>${defs}</defs>${wrapOpen}<path d="${p.d}" fill="${base.ref}"/><g clip-path="url(#${id}c)">${inner.join('')}</g>${wrapClose}</g>`);
  });
  return out.join('');
}

/** The low sun's long cast shadow of a figure with its soles at (x, y), h px tall: its silhouette laid on the ground
 *  away from the sun (k: the shadow's run per unit of height, x to the right and y up the screen), soft, in the scene's
 *  shadow colour. Drawn before the figure. */
export function castShadow(parts: Part[], uid: string, x: number, y: number, h: number, o: {k: V2; color: string; opacity: number; blurPx?: number}): string {
  const s = h / 1000;
  const f5 = (v: number) => (Math.round(v * 1e5) / 1e5).toString();
  const solid = parts.filter((p) => p.d && !p.ground && !p.noSil && (p.opacity ?? 1) > 0.5);
  const [kx, ky] = o.k;
  // figure units: a point at height (1000 - y) above the soles moves kx of it to the right and ky of it up the screen
  const m = `matrix(1 0 ${f5(-kx)} ${f5(ky)} ${f5(1000 * kx)} ${f5(1000 * (1 - ky))})`;
  const blur = (o.blurPx ?? 2.5) / s;
  return (
    `<defs><filter id="${uid}cs" filterUnits="userSpaceOnUse" x="-3000" y="-3000" width="9000" height="8000"><feGaussianBlur stdDeviation="${f5(blur)}"/></filter></defs>` +
    `<g transform="translate(${f5(x)},${f5(y - h)}) scale(${f5(s)},${f5(s)})" opacity="${f5(o.opacity)}"><g filter="url(#${uid}cs)"><g transform="${m}" fill="${o.color}">${solid.map((p) => `<path d="${p.d}"/>`).join('')}</g></g></g>`
  );
}

/** A figure with its soles at (x, y), drawn h px tall (figure units: H = 1000). */
export function place(parts: Part[], uid: string, x: number, y: number, h: number, o: Omit<SvgOpts, 'px'> & {flip?: boolean} = {}): string {
  const s = h / 1000;
  const f5 = (v: number) => (Math.round(v * 1e5) / 1e5).toString();
  return `<g transform="translate(${f5(x)},${f5(y - h)}) scale(${f5(o.flip ? -s : s)},${f5(s)})">${svgOf(parts, uid, {...o, px: h})}</g>`;
}
