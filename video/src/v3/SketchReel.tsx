// SketchReel: the G3 sketch animatic, drawn entirely from one JSON file (public/v3/animatic.json) so a storyboard
// revision is a data edit. Each shot: a time range, pencil elements (boxes, lines, ellipses, figures, labels, value
// fills), a rough camera move and a labelled transition in. On top: pop captions from the voice's word timings, the
// frame-0 text, the voice and sound cues, and a burned-in "G3 · shot · transition · timecode" label.

import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {captionFontStack, useCaptionFont} from '../lib/font';
import {arrow, ellipse, hatch, poly, rect} from '../lib/sketch';

type Fill = 'warm' | 'cold' | 'dark' | 'paper' | 'pop';
/** f = depth factor for parallax (1 = moves with the camera, 0 = fixed far plane, > 1 = foreground); the authored end frame is exact for every f. */
type Depth = {
  f?: number;
  /** stroke draw-on: [start, duration] in s after the shot start (the opening "scene is drawn" build) */
  draw?: [number, number];
  /** the fill floods in at this many s after the shot start (0.12 s fade); before it, lines only */
  fillIn?: number;
  /** the element pops out at this many s after the shot start (0.07 s), e.g. a highlight that leaves with its text */
  out?: number;
};
export type El = Depth & (
  | {t: 'rect'; x: number; y: number; w: number; h: number; fill?: Fill; label?: string; in?: number}
  | {t: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill?: Fill; label?: string; in?: number}
  | {t: 'line'; pts: [number, number][]; closed?: boolean; fill?: Fill; in?: number}
  | {t: 'arrow'; x1: number; y1: number; x2: number; y2: number; in?: number}
  | {t: 'hatch'; x: number; y: number; w: number; h: number; in?: number}
  | {t: 'figure'; x: number; y: number; h: number; in?: number}
  | {t: 'text'; x: number; y: number; text: string; size?: number; in?: number});
/** r = roll in degrees (CINEMATIC_GUIDE: <= 2 deg drift, <= 6 deg in action). */
type Cam = {x: number; y: number; z: number; r?: number};
type Ease = 'inout' | 'out' | 'in' | 'linear' | 'unveil' | 'inQuad';
export type Shot = {
  id: string;
  s: number;
  e: number;
  note: string;
  /** dur = transition length in s (dissolve default 0.2; T10 slow dissolve 0.5-0.8); dip = through dark, flash = through white. */
  transition: {type: 'cut' | 'dissolve' | 'push-through' | 'match-cut' | 'wipe' | 'dip' | 'flash'; label?: string; dur?: number};
  camera: {from: Cam; to: Cam; ease?: Ease; start?: number; end?: number};
  els: El[];
  moves?: {el: number; dx: number; dy: number; at: number; dur: number}[];
};
export type Animatic = {
  label: string;
  audio: string;
  durationSec: number;
  frame0: string;
  frame0Until: number;
  words: {w: string; s: number; e: number}[];
  sfx: {src: string; t: number; gain?: number}[];
  shots: Shot[];
};

const W = 1080;
const H = 1920;
const PAPER = '#f3ebdd';
const LEAD = '#4a443e';
const MUTED = '#8a7f72';
const FILLS: Record<Fill, string> = {warm: '#f2d49b', cold: '#bac3ce', dark: '#5b5560', paper: '#fbf6ee', pop: '#e0573a'};
const CAPTION_TOP = 300;
const MAX_CHARS = 16;

// unveil = trapezoid(0.1, 0.6): accelerate over the first 10 %, cruise, decelerate over the last 60 % (Arcane's reveals)
const trapezoid = (a: number, d: number) => {
  const v = 1 / (1 - a / 2 - d / 2);
  return (u: number) => (u < a ? (v * u * u) / (2 * a) : u <= 1 - d ? v * (u - a / 2) : 1 - (v * (1 - u) * (1 - u)) / (2 * d));
};
const EASE: Record<Ease, (x: number) => number> = {
  inout: Easing.inOut(Easing.sin), out: Easing.out(Easing.cubic), in: Easing.in(Easing.cubic), linear: (x: number) => x,
  unveil: trapezoid(0.1, 0.6), inQuad: Easing.in(Easing.quad),
};

function camAt(shot: Shot, t: number): Cam {
  const {from, to, ease = 'inout', start = shot.s, end = shot.e} = shot.camera;
  const u = interpolate(t, [start, Math.max(start + 0.01, end)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE[ease]});
  return {x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u, z: from.z + (to.z - from.z) * u,
    r: (from.r ?? 0) + ((to.r ?? 0) - (from.r ?? 0)) * u};
}

/** camera for a plane at depth factor f: the same end frame, f times the move */
function camForDepth(shot: Shot, c: Cam, f: number): Cam {
  const e = shot.camera.to;
  return {x: e.x + (c.x - e.x) * f, y: e.y + (c.y - e.y) * f, z: e.z * Math.pow(c.z / e.z, f), r: c.r};
}

const camTf = (c: Cam) => `translate(${W / 2} ${H / 2}) rotate(${c.r ?? 0}) scale(${c.z}) translate(${-c.x} ${-c.y})`;

/** A pencil path; with `u` < 1 its strokes (subpaths) draw on one after another, so multi-stroke shapes build up. */
const Pen: React.FC<{d: string; u: number; style: React.SVGProps<SVGPathElement>}> = ({d, u, style}) => {
  if (u >= 1) return <path d={d} {...style} />;
  const subs = d.split(/(?=M)/).filter((x) => x.trim());
  return (
    <>
      {subs.map((sp, k) => {
        const v = Math.max(0, Math.min(1, u * subs.length - k));
        return v <= 0 ? null : <path key={k} d={sp} {...style} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - v} />;
      })}
    </>
  );
};

const Element: React.FC<{el: El; t: number; shot: Shot; i: number}> = ({el, t, shot, i}) => {
  const gone = el.out === undefined ? 1 : interpolate(t - shot.s, [el.out, el.out + 0.07], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const appear = gone * (el.in === undefined ? 1 : interpolate(t - shot.s, [el.in, el.in + 0.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  if (appear <= 0) return null;
  let dx = 0;
  let dy = 0;
  for (const m of shot.moves ?? []) {
    if (m.el !== i) continue;
    const u = interpolate(t - shot.s, [m.at, m.at + m.dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inout});
    dx += m.dx * u;
    dy += m.dy * u;
  }
  const seed = `${shot.id}-${i}`;
  const local = t - shot.s;
  const drawU = el.draw ? interpolate(local, [el.draw[0], el.draw[0] + Math.max(0.01, el.draw[1])], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const fillO = el.fillIn === undefined ? 1 : interpolate(local, [el.fillIn, el.fillIn + 0.12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const stroke = {stroke: LEAD, strokeWidth: 4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const label = (x: number, y: number, s?: string) =>
    s ? <text x={x} y={y} fontSize={34} fill={MUTED} textAnchor="middle" fontFamily={captionFontStack}>{s}</text> : null;
  let body: React.ReactNode = null;
  switch (el.t) {
    case 'rect':
      body = (
        <>
          {el.fill && <rect x={el.x} y={el.y} width={el.w} height={el.h} fill={FILLS[el.fill]} opacity={fillO} />}
          <Pen d={rect(el.x, el.y, el.w, el.h, {seed})} u={drawU} style={stroke} />
          {label(el.x + el.w / 2, el.y + el.h / 2 + 12, el.label)}
        </>
      );
      break;
    case 'ellipse':
      body = (
        <>
          {el.fill && <ellipse cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} fill={FILLS[el.fill]} opacity={fillO} />}
          <Pen d={ellipse(el.cx, el.cy, el.rx, el.ry, {seed})} u={drawU} style={stroke} />
          {label(el.cx, el.cy + 12, el.label)}
        </>
      );
      break;
    case 'line': {
      const pts = el.pts;
      body = (
        <>
          {el.fill && el.closed && <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={FILLS[el.fill]} opacity={fillO} />}
          <Pen d={poly(pts, {seed, closed: el.closed})} u={drawU} style={stroke} />
        </>
      );
      break;
    }
    case 'arrow':
      body = <Pen d={arrow(el.x1, el.y1, el.x2, el.y2, {seed})} u={drawU} style={stroke} />;
      break;
    case 'hatch':
      body = <Pen d={hatch(el.x, el.y, el.w, el.h, {seed})} u={drawU} style={{...stroke, strokeWidth: 2}} />;
      break;
    case 'figure': {
      const r = el.h * 0.12;
      body = (
        <>
          <Pen d={ellipse(el.x, el.y - el.h + r, r, r, {seed})} u={drawU} style={stroke} />
          <Pen d={poly([[el.x - el.h * 0.16, el.y], [el.x - el.h * 0.12, el.y - el.h * 0.72], [el.x + el.h * 0.12, el.y - el.h * 0.72], [el.x + el.h * 0.16, el.y]], {seed: seed + 'b'})} u={drawU} style={stroke} />
        </>
      );
      break;
    }
    case 'text':
      body = <text x={el.x} y={el.y} fontSize={el.size ?? 48} fill={LEAD} textAnchor="middle" fontFamily={captionFontStack}>{el.text}</text>;
      break;
  }
  return <g opacity={appear} transform={`translate(${dx} ${dy})`}>{body}</g>;
};

export const ShotView: React.FC<{shot: Shot; t: number}> = ({shot, t}) => {
  const c = camAt(shot, t);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <rect width={W} height={H} fill={PAPER} />
      {shot.els.map((el, i) => (
        <g key={i} transform={camTf(el.f === undefined || el.f === 1 ? c : camForDepth(shot, c, el.f))}>
          <Element el={el} t={t} shot={shot} i={i} />
        </g>
      ))}
    </svg>
  );
};

function pages(words: Animatic['words']) {
  const out: Animatic['words'][] = [];
  let cur: Animatic['words'] = [];
  for (const w of words) {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    const sentenceEnd = cur.length > 0 && /[.?!]$/.test(cur[cur.length - 1].w);
    if (cur.length && (len > MAX_CHARS || sentenceEnd)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
}

export const SketchReel: React.FC<{data: Animatic}> = ({data}) => {
  useCaptionFont();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const shots = data.shots;
  const k = Math.max(0, shots.findIndex((s, i) => t >= s.s && t < (shots[i + 1]?.s ?? Infinity)));
  const shot = shots[k];
  const prev = shots[k - 1];
  const since = t - shot.s;
  const tr = shot.transition.type;
  const dur = shot.transition.dur ?? (tr === 'dissolve' ? 0.2 : tr === 'push-through' ? 0.3 : tr === 'wipe' ? 0.25 : tr === 'dip' ? 0.3 : tr === 'flash' ? 0.12 : 0);
  const inTr = prev && dur > 0 && since < dur;
  const u = inTr ? since / dur : 1;

  const ps = pages(data.words.map((w) => ({...w, w: w.w.replace(/([a-z])(\d)/i, '$1 $2')})));
  const page = t < (ps[0]?.[0].s ?? 0) ? ps[0] : ps.find((p, i) => t >= p[0].s && t < (ps[i + 1]?.[0].s ?? Infinity));
  const popD = page ? (page === ps[0] ? 99 : (t - page[0].s) * fps) : 0;
  const pop = {
    opacity: interpolate(popD, [0, 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
    scale: interpolate(popD, [0, 2, 5], [0.86, 1.04, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  };
  const tc = `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily: captionFontStack}}>
      <Audio src={staticFile(data.audio)} />
      {data.sfx.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * fps)}>
          <Audio src={staticFile(s.src)} volume={s.gain ?? 0.6} />
        </Sequence>
      ))}

      {inTr && tr === 'push-through' ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.4 * u})`, opacity: 1 - u}}><ShotView shot={prev} t={t} /></div>
      ) : null}
      <div style={{position: 'absolute', inset: 0, opacity: inTr && tr !== 'wipe' && tr !== 'dip' && tr !== 'flash' ? u : 1,
        clipPath: inTr && tr === 'wipe' ? `inset(0 ${100 - u * 100}% 0 0)` : undefined}}>
        <ShotView shot={shot} t={t} />
      </div>
      {inTr && (tr === 'dissolve' || tr === 'wipe') ? (
        <div style={{position: 'absolute', inset: 0, opacity: tr === 'dissolve' ? 1 - u : 1, clipPath: tr === 'wipe' ? `inset(0 0 0 ${u * 100}%)` : undefined}}>
          <ShotView shot={prev} t={t} />
        </div>
      ) : null}

      {inTr && (tr === 'dip' || tr === 'flash') && u < 0.5 ? (
        <div style={{position: 'absolute', inset: 0}}><ShotView shot={prev} t={t} /></div>
      ) : null}
      {inTr && (tr === 'dip' || tr === 'flash') ? (
        <div style={{position: 'absolute', inset: 0, background: tr === 'dip' ? '#2a2420' : '#ffffff', opacity: 1 - Math.abs(2 * u - 1)}} />
      ) : null}
      {t < data.frame0Until && (
        <div style={{position: 'absolute', top: CAPTION_TOP - 160, left: 60, right: 60, textAlign: 'center', fontSize: 86, fontWeight: 700,
          lineHeight: 1.05, color: LEAD}}>{data.frame0}</div>
      )}
      {page && (
        <div style={{position: 'absolute', top: CAPTION_TOP + 80, left: 60, right: 60, textAlign: 'center', fontSize: 100, lineHeight: 1.1,
          color: LEAD, opacity: pop.opacity, transform: `scale(${pop.scale})`, textShadow: `0 0 18px ${PAPER}, 0 0 8px ${PAPER}`}}>
          {page.map((w) => w.w).join(' ')}
        </div>
      )}

      <div style={{position: 'absolute', bottom: 210, left: 70, right: 70, textAlign: 'center', fontSize: 34, color: MUTED, fontStyle: 'italic',
        lineHeight: 1.25, textShadow: `0 0 10px ${PAPER}`}}>{shot.note}</div>
      <div style={{position: 'absolute', top: 120, left: 60, fontSize: 30, color: MUTED}}>
        {data.label} · {shot.id} · {inTr || since < 0.6 ? `${tr}${shot.transition.label ? ` (${shot.transition.label})` : ''}` : ''} · {tc}
      </div>
    </AbsoluteFill>
  );
};
