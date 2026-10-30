// people_dirs/painterly: the painter (dir_painterly.md "Rendering"). Each surface's regions (mesh.ts) are laid down as a
// painter blocks a figure: the LIT colour fills the crisp outline; the SHADE is brushed in soft (a gaussian blur, with a
// faint dry-brush break in its edge at large sizes) and clipped by the outline; then the warm HI band, the skin's GLOW
// along its terminator and the thin cool RIM. Surfaces are painted back to front (camera depth + a bias per kind), and
// decals (the face's few marks, occlusion under hems and the jaw, a strap's line) ride their surface's clip. Over the
// whole figure: a soft darkening toward the ground (the playbook's "soft gradients", the ground's occlusion).
import React from 'react';
import {planes, type Kind, type Rig, DUSK, mixLab} from './color';
import {type Cam, type Regions, type Surface, project, projectSurface, regionsOf} from './mesh';
import type {V2, V3} from './math';

export type Palette = Record<string, {base: string; kind: Kind}>;

/** A mark painted after its target surface, inside the target's clip (or over the figure if no target). */
export type Decal = {
  key: string;
  target?: string;
  /** Screen-space path. */
  d: string;
  fill?: string;
  stroke?: string;
  /** Stroke width and blur in model units (scaled to px). */
  sw?: number;
  blur?: number;
  opacity?: number;
  blend?: 'multiply' | 'screen' | 'normal';
  /** Painted after every surface (not inside a clip). */
  top?: boolean;
};
export type DecalFn = (cam: Cam) => Decal[];

export type Model = {
  surfaces: Surface[];
  decals: DecalFn[];
  palette: Palette;
  /** Ground contact points (the soles' centres) for the contact shadow. */
  feet: V3[];
};

export type PaintOpts = {
  rig?: Rig;
  /** The contact shadow's colour (multiplied); null = none. */
  shadow?: string | null;
  /** The soft ground occlusion's strength (0 = off). */
  groundGrad?: number;
  /** Dry-brush break of the shade edges (0 = off); automatic below 300 px. */
  brush?: number;
  /** A fine paint grain over the figure, locked to it (0 = off; default 1 at >= 260 px). */
  grain?: number;
  /** A unique id prefix (filters, clips). */
  uid: string;
  /** Debug: draw outlines only. */
  flat?: boolean;
  /** The black-fill test: every surface in this one colour, no light, no shadow (design_research L1). */
  silhouette?: string;
};

type Entry = {sf: Surface; reg: Regions; under: boolean; key: number};

const fmt = (x: number) => (Math.round(x * 10) / 10).toString();

export function paintFigure(model: Model, cam: Cam, opt: PaintOpts): React.ReactElement {
  const rig = opt.rig ?? DUSK;
  const s = cam.s;
  const px = s * 1000; // the figure's height in px
  const small = px < 260;
  const blurS = (u: number) => Math.max(0.35, u * s);
  const extPx = Math.max(1.5, 3.2 * blurS(7));
  const P = opt.uid;
  // tones per material
  const tones: Record<string, ReturnType<typeof planes>> = {};
  for (const [k, m] of Object.entries(model.palette)) tones[k] = planes(m.base, m.kind, rig);
  // project and extract
  const entries: Entry[] = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const sf of model.surfaces) {
    const ps = projectSurface(sf, cam);
    for (const q of ps.S) {
      if (q[0] < minX) minX = q[0];
      if (q[0] > maxX) maxX = q[0];
      if (q[1] < minY) minY = q[1];
      if (q[1] > maxY) maxY = q[1];
    }
    const reg = regionsOf(ps, cam, {extPx, small});
    const bias = sf.bias ?? 0;
    if (reg.under) entries.push({sf, reg, under: true, key: ps.zBack + bias - 20});
    if (reg.outline) entries.push({sf, reg, under: false, key: ps.zFront + bias});
  }
  entries.sort((a, b) => (a.sf.order ?? 0) - (b.sf.order ?? 0) || a.key - b.key);
  enforceCovers(entries);
  const pad = 60 * s + 20;
  const fx = minX - pad;
  const fy = minY - pad;
  const fw = maxX - minX + 2 * pad;
  const fh = maxY - minY + 2 * pad;
  const flt = (id: string, sd: number, brush = 0) => (
    <filter key={id} id={`${P}-${id}`} filterUnits="userSpaceOnUse" x={fx} y={fy} width={fw} height={fh} colorInterpolationFilters="sRGB">
      {brush > 0 ? (
        <>
          <feTurbulence type="fractalNoise" baseFrequency={`${fmt3(1 / (6 * s))} ${fmt3(1 / (20 * s))}`} numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={brush * s} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation={sd} />
        </>
      ) : (
        <feGaussianBlur stdDeviation={sd} />
      )}
    </filter>
  );
  // the dry-brush break of the soft edges: in model units, so it scales with the figure (invisible below ~260 px)
  const brush = opt.brush ?? (small ? 0 : 5.5);
  const defs: React.ReactNode[] = [
    flt('bR', blurS(1.6)),
    flt('bD1', blurS(2)),
    flt('bD2', blurS(5)),
    flt('bD3', blurS(10)),
  ];
  // the soft planes' filters, one per blur size in use (a surface may ask for a tighter one: the face)
  const made = new Set<string>();
  const soft = (kind: 'S' | 'H' | 'G', u: number) => {
    const k = `b${kind}${Math.round(u * 10)}`;
    if (!made.has(k)) {
      made.add(k);
      const br = kind === 'G' ? 0 : kind === 'H' ? brush * 0.7 : brush;
      defs.push(flt(k, blurS(u), u < 4 ? br * 0.4 : br));
    }
    return `url(#${P}-${k})`;
  };
  const blurId = (u?: number) => (u === undefined || u <= 0 ? undefined : u <= 3 ? 'bD1' : u <= 7 ? 'bD2' : 'bD3');
  const decals: Decal[] = opt.silhouette ? [] : model.decals.flatMap((f) => f(cam));
  const byTarget = new Map<string, Decal[]>();
  const loose: Decal[] = [];
  for (const d of decals) {
    if (d.target && !d.top) {
      const l = byTarget.get(d.target) ?? [];
      l.push(d);
      byTarget.set(d.target, l);
    } else loose.push(d);
  }
  const decalEl = (d: Decal) => {
    const b = blurId(d.blur);
    return (
      <path
        key={d.key}
        d={d.d}
        fill={d.fill ?? 'none'}
        stroke={d.stroke}
        strokeWidth={d.sw !== undefined ? Math.max(0.6, d.sw * s) : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={d.opacity}
        filter={b ? `url(#${P}-${b})` : undefined}
        style={d.blend && d.blend !== 'normal' ? {mixBlendMode: d.blend} : undefined}
      />
    );
  };
  const body: React.ReactNode[] = [];
  const unionPaths: string[] = [];
  let n = 0;
  for (const e of entries) {
    const t = tones[e.sf.mat] ?? planes('#FF00FF', 'cloth', rig);
    const id = `${P}-c${n++}`;
    if (e.under) {
      body.push(<path key={`${id}u`} d={e.reg.under} fill={opt.silhouette ?? t.under} />);
      unionPaths.push(e.reg.under);
      continue;
    }
    const r = e.reg;
    unionPaths.push(r.outline);
    if (opt.silhouette) {
      body.push(<path key={id} d={r.outline} fill={opt.silhouette} />);
      continue;
    }
    if (opt.flat || e.sf.flat) {
      body.push(<path key={id} d={r.outline} fill={t.lit} />);
      const ds = byTarget.get(e.sf.key);
      if (ds) body.push(<g key={`${id}d`}>{ds.map(decalEl)}</g>);
      continue;
    }
    defs.push(
      <clipPath key={id} id={id}>
        <path d={r.outline} />
      </clipPath>,
    );
    const ds = byTarget.get(e.sf.key);
    body.push(
      <g key={id}>
        <path d={r.outline} fill={t.lit} />
        <g clipPath={`url(#${id})`}>
          {r.glow ? <path d={r.glow} fill={t.glow} filter={soft('G', (e.sf.look?.blur ?? 7) * 0.85)} opacity={0.85} /> : null}
          {r.shade ? <path d={r.shade} fill={t.shade} filter={soft('S', e.sf.look?.blur ?? 7)} /> : null}
          {r.hi ? <path d={r.hi} fill={t.hi} filter={soft('H', (e.sf.look?.blur ?? 7) * 0.8)} opacity={0.9} /> : null}
          {r.rim ? <path d={r.rim} fill={t.rim} filter={`url(#${P}-bR)`} /> : null}
          {ds ? ds.map(decalEl) : null}
        </g>
      </g>,
    );
  }
  // the contact shadow
  let shadow: React.ReactNode = null;
  if (opt.shadow !== null && !opt.silhouette && model.feet.length) {
    const pts = model.feet.map((f) => project(cam, f));
    const xs = pts.map((p) => p[0]);
    const y = Math.max(...pts.map((p) => p[1]));
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const rx = (Math.max(...xs) - Math.min(...xs)) / 2 + 70 * s;
    shadow = <ellipse cx={cx} cy={y + 2 * s} rx={rx} ry={Math.max(2, 16 * s)} fill={opt.shadow ?? '#C9B3A8'} style={{mixBlendMode: 'multiply'}} filter={`url(#${P}-bD2)`} />;
  }
  // the soft ground occlusion over the whole figure: no change above the knees, a little deeper toward the feet
  const gg = opt.silhouette ? 0 : opt.groundGrad ?? 0.5;
  const union = unionPaths.join('');
  const gTop = project(cam, [0, 420, 0])[1];
  const gBot = project(cam, [0, 0, 0])[1];
  // the paint grain: a fine, sparse mottle in the figure's own units (it rides the figure, never the screen)
  const gr = opt.silhouette ? 0 : opt.grain ?? (small ? 0 : 1);
  const grainEl =
    gr > 0 ? (
      <>
        <defs>
          <filter id={`${P}-grain`} filterUnits="userSpaceOnUse" x={fx} y={fy} width={fw} height={fh} colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency={`${fmt3(1 / (3.2 * s))} ${fmt3(1 / (4.6 * s))}`} numOctaves={1} seed={11} result="t" />
            <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.27  0 0 0 0 0.3  1.3 0 0 0 -0.6" />
          </filter>
        </defs>
        <rect x={fx} y={fy} width={fw} height={fh} filter={`url(#${P}-grain)`} clipPath={`url(#${P}-u)`} opacity={0.07 * gr} style={{mixBlendMode: 'multiply'}} />
      </>
    ) : null;
  const gradEl =
    gg > 0 ? (
      <>
        <defs>
          <linearGradient id={`${P}-g`} x1="0" y1={fmt(gTop)} x2="0" y2={fmt(gBot)} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor={mixLab('#FFFFFF', '#6E5A78', 0.3 * gg)} />
          </linearGradient>
        </defs>
        <rect x={fx} y={gTop} width={fw} height={gBot - gTop + 10} fill={`url(#${P}-g)`} clipPath={`url(#${P}-u)`} style={{mixBlendMode: 'multiply'}} />
      </>
    ) : null;
  return (
    <g>
      <defs>
        {defs}
        <clipPath id={`${P}-u`}>
          <path d={union} />
        </clipPath>
      </defs>
      {shadow}
      {body}
      {gradEl}
      {grainEl}
      {loose.map(decalEl)}
    </g>
  );
}

const fmt3 = (x: number) => (Math.round(x * 10000) / 10000).toString();

/** The enclosure rule (Surface.covers): an enclosed surface is never painted after its encloser, and the encloser's
 *  inside (UNDER) goes right before the first surface it encloses. Minimal moves, two passes (nested enclosures). */
function enforceCovers(list: Entry[]) {
  const match = (e: Entry, pre: string[]) => pre.some((p) => e.sf.key.startsWith(p));
  for (let pass = 0; pass < 3; pass++) {
    const enclosers = list.filter((e) => !e.under && e.sf.covers && e.sf.covers.length);
    for (const E of enclosers) {
      const pre = E.sf.covers!;
      // move every enclosed outline/under that sits after E's outline to just before it (keeping their order)
      let iO = list.indexOf(E);
      const late = list.filter((x, i) => i > iO && x.sf !== E.sf && match(x, pre));
      if (late.length) {
        for (const x of late) list.splice(list.indexOf(x), 1);
        iO = list.indexOf(E);
        list.splice(iO, 0, ...late);
      }
      // the inside: right before the first enclosed surface (or right before E if it encloses nothing drawn)
      const U = list.find((x) => x.under && x.sf === E.sf);
      if (U) {
        list.splice(list.indexOf(U), 1);
        iO = list.indexOf(E);
        let first = iO;
        for (let i = 0; i < iO; i++)
          if (list[i].sf !== E.sf && match(list[i], pre)) {
            first = i;
            break;
          }
        list.splice(first, 0, U);
      }
    }
  }
}

// ---------------------------------------------------------------- path helpers for decals

export const polyD = (pts: V2[], close = true) => {
  if (!pts.length) return '';
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += `L${fmt(pts[i][0])} ${fmt(pts[i][1])}`;
  return close ? d + 'Z' : d;
};
/** A smooth closed curve through screen points (Catmull-Rom). */
export const smoothD = (pts: V2[], close = true, tension = 0.5) => {
  const n = pts.length;
  if (n < 2) return '';
  const k = tension / 3;
  const g = (i: number) => (close ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  const m = close ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = g(i - 1);
    const p1 = g(i);
    const p2 = g(i + 1);
    const p3 = g(i + 2);
    d += `C${fmt(p1[0] + (p2[0] - p0[0]) * k)} ${fmt(p1[1] + (p2[1] - p0[1]) * k)} ${fmt(p2[0] - (p3[0] - p1[0]) * k)} ${fmt(p2[1] - (p3[1] - p1[1]) * k)} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return close ? d + 'Z' : d;
};
