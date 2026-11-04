// Editorial people: the painter (dir_editorial.md §5, finish). Every form is ONE closed path filled with ONE soft linear
// light gradient (hi -> base -> shade) across its narrow axis, toward the key (screen upper-left); crisp shapes on top
// only where a material is crisp or a form casts onto another (a sheen, a lens, a rib band, the hair's sheen). No
// outlines: edges are steps of value. `finish: 'flat'` paints the same parts in their base colour alone (an A/B).
import React, {useId} from 'react';
import {type PP, type V2, pathOf, polyOf} from './core';
import {type Pose} from './body';
import {ramp, type Ramp} from './color';
import {buildPerson, type Person} from './figure';
import type {Part} from './parts';

export type Finish = 'gradient' | 'flat';
/** The key light's direction on screen (toward the light): the upper left. */
export const KEY: V2 = [-0.82, -0.57];

export type PersonProps = {
  /** The point between the feet on the ground (screen px) and the figure's height (px). */
  x: number;
  y: number;
  h: number;
  person: Person;
  pose: Pose;
  /** Mirror (a figure facing screen-right). */
  flip?: boolean;
  finish?: Finish;
  /** The contact shadow (multiplied); null = none. */
  shadow?: string | null;
  /** Only these part keys (a face crop, a silhouette test), or a fill override (the black-fill test). */
  only?: (p: Part) => boolean;
  fillAll?: string;
  /** Screen px per unit of `h` when the figure is drawn inside a scaled group (a zoomed panel), for the face budget. */
  pxScale?: number;
};

function gradAxis(pts: PP[], key: V2, forced?: V2): {a: V2; b: V2} {
  const n = pts.length;
  let cx = 0;
  let cy = 0;
  pts.forEach((p) => {
    cx += p[0];
    cy += p[1];
  });
  cx /= n;
  cy /= n;
  let g: V2;
  if (forced) g = forced;
  else {
    let sxx = 0;
    let syy = 0;
    let sxy = 0;
    pts.forEach((p) => {
      const dx = p[0] - cx;
      const dy = p[1] - cy;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    });
    const th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    const ax: V2 = [Math.cos(th), Math.sin(th)];
    const elong = Math.sqrt(Math.max(sxx, syy) / Math.max(1e-6, Math.min(sxx, syy)));
    // light across the form's narrow axis: remove most of the key's component along the long axis (more for long forms)
    const k = Math.min(0.85, 0.35 + 0.12 * elong);
    const d = key[0] * ax[0] + key[1] * ax[1];
    g = [key[0] - k * d * ax[0], key[1] - k * d * ax[1]];
    const l = Math.hypot(g[0], g[1]) || 1;
    g = [g[0] / l, g[1] / l];
  }
  let smax = -Infinity;
  let smin = Infinity;
  pts.forEach((p) => {
    const s = (p[0] - cx) * g[0] + (p[1] - cy) * g[1];
    smax = Math.max(smax, s);
    smin = Math.min(smin, s);
  });
  return {a: [cx + g[0] * smax, cy + g[1] * smax], b: [cx + g[0] * smin, cy + g[1] * smin]};
}

export const EdPerson: React.FC<PersonProps> = ({x, y, h, person, pose, flip = false, finish = 'gradient', shadow = '#C9B2A6', only, fillAll, pxScale}) => {
  const uid = useId().replace(/:/g, '');
  const built = buildPerson(person, pose, flip, h * (pxScale ?? 1));
  const ramps: Record<string, Ramp> = {};
  for (const [k, m] of Object.entries(person.mats)) ramps[k] = ramp(m.c, m.kind);
  const s = h / 1000;
  const mx = flip ? -1 : 1;
  const key: V2 = [KEY[0] * mx, KEY[1]];
  const parts = only ? built.parts.filter(only) : built.parts;
  const byK = new Map(built.parts.map((p) => [p.k, p]));
  const pid = (k: string) => `ep${uid}-${k}`;
  const defs: React.ReactNode[] = [];
  const clipNeeded = new Set<string>();
  parts.forEach((p) => p.clip && clipNeeded.add(p.clip));
  // union clips: a garment's outline plus everything below a line (sleeve caps inside their shoulders)
  parts.forEach((p) => {
    if (!p.clipBelow) return;
    const q = byK.get(p.clipBelow.k);
    if (!q) return;
    defs.push(
      <clipPath key={`cb-${p.k}`} id={pid(`clipb-${p.k}`)}>
        <path d={pathOf(q.pts, true, q.tension ?? 0.5)} />
        <rect x={-4000} y={p.clipBelow.y} width={8000} height={8000} />
      </clipPath>,
    );
  });
  clipNeeded.forEach((k) => {
    const q = byK.get(k);
    if (q) defs.push(<clipPath key={`c-${k}`} id={pid(`clip-${k}`)}><path d={pathOf(q.pts, true, q.tension ?? 0.5)} /></clipPath>);
  });
  // gradient groups: one axis over all the group's points
  const groupPts = new Map<string, PP[]>();
  built.parts.forEach((p) => {
    if (!p.grp) return;
    const a = groupPts.get(p.grp) ?? [];
    a.push(...p.pts);
    groupPts.set(p.grp, a);
  });
  const groupDone = new Set<string>();
  const body: React.ReactNode[] = [];
  for (const p of parts) {
    const r = ramps[p.mat] ?? ramp('#FF00FF');
    const d = pathOf(p.pts, !p.line, p.tension ?? 0.5);
    const clip = p.clip ? `url(#${pid(`clip-${p.clip}`)})` : p.clipBelow && byK.has(p.clipBelow.k) ? `url(#${pid(`clipb-${p.k}`)})` : undefined;
    if (p.line) {
      const col = fillAll ?? r[p.tone === 'form' || !p.tone ? 'base' : p.tone];
      body.push(<path key={p.k} d={d} fill="none" stroke={col} strokeWidth={p.line} strokeLinecap="round" strokeLinejoin="round" clipPath={clip} />);
      continue;
    }
    let fill: string;
    if (fillAll) fill = fillAll;
    else if (!p.tone || p.tone === 'form') {
      if (finish === 'flat') fill = r.base;
      else if (p.grp && groupDone.has(p.grp)) fill = `url(#${pid(`g-grp-${p.grp}`)})`;
      else {
        const gid = p.grp ? pid(`g-grp-${p.grp}`) : pid(`g-${p.k}`);
        if (p.grp) groupDone.add(p.grp);
        const {a, b} = gradAxis(p.grp ? groupPts.get(p.grp)! : p.pts, key, p.gAxis);
        const gk = p.gk ?? 1;
        const mixS = (c: string) => c;
        defs.push(
          <linearGradient key={gid} id={gid} gradientUnits="userSpaceOnUse" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}>
            <stop offset={0} stopColor={mixS(r.hi)} />
            <stop offset={0.3 / gk} stopColor={r.base} />
            <stop offset={Math.min(1, 0.8)} stopColor={r.shade} />
            <stop offset={1} stopColor={r.shade} />
          </linearGradient>,
        );
        fill = `url(#${gid})`;
      }
    } else fill = r[p.tone];
    let el: React.ReactNode = <path key={p.k} d={d} fill={fill} opacity={p.op} />;
    if (p.cut && p.cut.length) {
      // cuts as a mask (overlapping cut regions stay cut: an even-odd clip would refill their overlap)
      const cid = pid(`cut-${p.k}`);
      defs.push(
        <mask key={cid} id={cid} maskUnits="userSpaceOnUse" x={-3000} y={-3000} width={6000} height={6000}>
          <rect x={-3000} y={-3000} width={6000} height={6000} fill="#FFFFFF" />
          {p.cut.map((c, i) => (
            <path key={i} d={polyOf(c.map((q) => [q[0], q[1]]))} fill="#000000" />
          ))}
        </mask>,
      );
      el = <g key={p.k} mask={`url(#${cid})`}>{el}</g>;
    }
    body.push(clip ? <g key={p.k + '-c'} clipPath={clip}>{el}</g> : el);
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s * mx} ${s})`}>
      <defs>{defs}</defs>
      {shadow && !only ? <ellipse cx={built.ground.x} cy={4} rx={built.ground.w * 0.62} ry={20} fill={shadow} style={{mixBlendMode: 'multiply'}} /> : null}
      {body}
    </g>
  );
};
