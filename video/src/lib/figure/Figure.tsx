// lib/figure: the refined "you" as one React/SVG component (docs/look/paint_recipes/people.md §g).
//   <Figure x y h pose look light />  x, y = the point between the feet on the ground (screen px); h = height (px)
// Every part is painted in flat planes, never outlined (DIRECTION rules 4-5):
//   1. the LIT plane (the whole part);
//   2. the SHADE crescent: the part minus itself shifted toward the key by `shade` (an even-odd XOR clipped to the
//      part), so the terminator follows the part's own contour instead of a straight split down the middle;
//   3. the RIM: the part minus itself shifted AWAY from the key by `rim`: a thin warm edge on the key side (subject only);
//   4. a LOCAL light (a phone, a doorway: people.md §b.5): the same crescent on the side facing that light, lifted
//      toward its colour, on the parts it can reach;
//   5. value overlays (the belt, a fold, the vent): one multiplied step inside their part;
//   6. (a proposal, off by default) the soft body gradient: the coat darkening toward the ground.
// Pure geometry: no time, no randomness; a pose is all the state (motion later = a pose per frame).
import React, {useId} from 'react';
import {mixHex} from '../light';
import {type Pt, loop} from './geom';
import {buildFigure, type FigurePose, type Mat, type Part} from './model';
import {litBy, tone, type Tone} from './tones';

export type FigureLook = Record<Mat, string>;

/** Her colours for a London October evening: the film's teal coat (hers only), plum hair (the dark anchor), warm skin,
 *  deep plum tights and near-black boots (the figure's real darks), a dusty terracotta-rose scarf with a deeper tip. */
export const HER_LOOK: FigureLook = {
  coat: '#0B8577',
  hair: '#36223A',
  skin: '#D9A27E',
  legs: '#4A3242',
  boots: '#2E2026',
  scarf: '#C9705C',
  scarfTip: '#8E3F3C',
  box: '#C99A64',
  leaf: '#8FA77A',
  phone: '#26202C',
};

export type FigureLight = {
  /** Unit vector toward the key light, screen space (default: a low sun from the upper left). */
  key?: Pt;
  /** A local light: its colour, the lift (dL*), the direction toward it (screen space), the lit edge's width (local
   *  units, H = 1000). */
  local?: {color: string; dL: number; dir: Pt; width?: number};
  /** The soft body gradient's strength (0 = off, the default: DIRECTION rule 5 keeps volumes flat; 1 = the proposal). */
  grad?: number;
  /** false = no rim (a figure outside the subject tier). */
  rim?: boolean;
};

export type FigureProps = {
  x: number;
  y: number;
  h: number;
  pose: FigurePose;
  /** Profile: -1 faces the screen left (the drawing's own), 1 faces right. */
  facing?: 1 | -1;
  look?: Partial<FigureLook>;
  light?: FigureLight;
  /** The contact shadow's colour (multiplied on the ground); null = none. */
  shadow?: string | null;
};

const KEY: Pt = [-0.92, -0.39];

function xor(pts: Pt[], v: Pt, tension: number): string {
  return loop(pts, tension) + loop(
    pts.map(([x, y]) => [x + v[0], y + v[1]] as Pt),
    tension,
  );
}

export const Figure: React.FC<FigureProps> = ({x, y, h, pose, facing = -1, look, light = {}, shadow = '#D9C7BE'}) => {
  const uid = useId().replace(/:/g, '');
  const L: FigureLook = {...HER_LOOK, ...look};
  const tones = {} as Record<Mat, Tone>;
  (Object.keys(L) as Mat[]).forEach((m) => (tones[m] = tone(L[m])));
  const {parts, lines, ground} = buildFigure(pose);
  const s = h / 1000;
  const mir = pose.view === 'profile' && facing === 1 ? -1 : 1;
  const key0 = light.key ?? KEY;
  const k: Pt = [key0[0] * mir, key0[1]];
  const loc = light.local;
  const lv: Pt | null = loc ? [loc.dir[0] * mir, loc.dir[1]] : null;
  const byKey = new Map(parts.map((p) => [p.k, p]));
  const clipId = (p: Part) => `fg${uid}-${p.k}`;
  const needsClip = new Set<string>();
  parts.forEach((p) => {
    if ((p.plane ?? 'form') === 'form' && ((p.shade ?? 0) > 0 || (p.rim ?? 0) > 0 || (p.local && loc) || (p.grad && (light.grad ?? 0) > 0))) needsClip.add(p.k);
    if (p.overlay) needsClip.add(p.overlay.in);
  });
  const gradId = `fg${uid}-grad`;
  const rimOn = light.rim ?? true;

  const body: React.ReactNode[] = [];
  for (const p of parts) {
    const t = tones[p.mat];
    const tn = p.tension ?? 0.5;
    const d = loop(p.pts, tn);
    if (p.overlay) {
      const parent = byKey.get(p.overlay.in);
      if (!parent) continue;
      const pt = tones[parent.mat];
      // the clip and the blend on ONE element: a clipped <g> would isolate the multiply from what it darkens
      body.push(<path key={p.k} d={d} clipPath={`url(#${clipId(parent)})`} fill={mixHex('#FFFFFF', pt.deep, (1 - p.overlay.tint) * 1.25)} style={{mixBlendMode: 'multiply'}} />);
      continue;
    }
    const plane = p.plane ?? 'form';
    if (plane !== 'form') {
      body.push(<path key={p.k} d={d} fill={t[plane]} />);
      continue;
    }
    const g: React.ReactNode[] = [<path key="lit" d={d} fill={t.lit} />];
    const cp = `url(#${clipId(p)})`;
    if ((p.shade ?? 0) > 0) {
      g.push(
        <g key="shade" clipPath={cp}>
          <path d={xor(p.pts, [k[0] * p.shade!, k[1] * p.shade!], tn)} fill={t.shade} fillRule="evenodd" />
        </g>,
      );
    }
    if (rimOn && (p.rim ?? 0) > 0) {
      g.push(
        <g key="rim" clipPath={cp}>
          <path d={xor(p.pts, [-k[0] * p.rim!, -k[1] * p.rim!], tn)} fill={t.rim} fillRule="evenodd" />
        </g>,
      );
    }
    if (p.local && loc && lv) {
      const w = loc.width ?? 22;
      g.push(
        <g key="local" clipPath={cp}>
          <path d={xor(p.pts, [-lv[0] * w, -lv[1] * w], tn)} fill={litBy(t.lit, loc.color, loc.dL)} fillRule="evenodd" />
        </g>,
      );
    }
    if (p.grad && (light.grad ?? 0) > 0) {
      g.push(<rect key="grad" x={-600} y={-700} width={1200} height={720} clipPath={cp} fill={`url(#${gradId})`} style={{mixBlendMode: 'multiply'}} />);
    }
    body.push(<g key={p.k}>{g}</g>);
  }
  for (const ln of lines) {
    body.push(<path key={ln.k} d={ln.d} fill="none" stroke={tones[ln.mat][ln.plane]} strokeWidth={ln.w} strokeLinecap="round" />);
  }

  const coatT = tones.coat;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * mir} ${s})`}>
      <defs>
        {[...needsClip].map((kk) => {
          const p = byKey.get(kk)!;
          return (
            <clipPath key={kk} id={clipId(p)}>
              <path d={loop(p.pts, p.tension ?? 0.5)} />
            </clipPath>
          );
        })}
        <linearGradient id={gradId} x1="0" y1="-640" x2="0" y2="-150" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor={mixHex('#FFFFFF', coatT.deep, 0.42 * (light.grad ?? 0))} />
        </linearGradient>
      </defs>
      {shadow ? <ellipse cx={ground[0]} cy={6} rx={ground[1]} ry={20} fill={shadow} style={{mixBlendMode: 'multiply'}} /> : null}
      {body}
    </g>
  );
};
