// SketchReel: the G3 sketch animatic, drawn entirely from one JSON file (public/v3/animatic.json) so a storyboard
// revision is a data edit. Each shot: a time range, pencil elements (boxes, lines, ellipses, figures, labels, value
// fills), a rough camera move and a labelled transition in. On top: pop captions from the voice's word timings, the
// frame-0 text, the voice and sound cues, and a burned-in "G3 · shot · transition · timecode" label.

import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {captionFontStack, useCaptionFont} from '../lib/font';
import {arrow, ellipse, hatch, poly, rect} from '../lib/sketch';

type Fill = 'warm' | 'cold' | 'dark' | 'paper' | 'pop';
export type El =
  | {t: 'rect'; x: number; y: number; w: number; h: number; fill?: Fill; label?: string; in?: number}
  | {t: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill?: Fill; label?: string; in?: number}
  | {t: 'line'; pts: [number, number][]; closed?: boolean; fill?: Fill; in?: number}
  | {t: 'arrow'; x1: number; y1: number; x2: number; y2: number; in?: number}
  | {t: 'hatch'; x: number; y: number; w: number; h: number; in?: number}
  | {t: 'figure'; x: number; y: number; h: number; in?: number}
  | {t: 'text'; x: number; y: number; text: string; size?: number; in?: number};
type Cam = {x: number; y: number; z: number};
export type Shot = {
  id: string;
  s: number;
  e: number;
  note: string;
  transition: {type: 'cut' | 'dissolve' | 'push-through' | 'match-cut' | 'wipe'; label?: string};
  camera: {from: Cam; to: Cam; ease?: 'inout' | 'out' | 'in' | 'linear'; start?: number; end?: number};
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

const EASE = {inout: Easing.inOut(Easing.sin), out: Easing.out(Easing.cubic), in: Easing.in(Easing.cubic), linear: (x: number) => x};

function camAt(shot: Shot, t: number): Cam {
  const {from, to, ease = 'inout', start = shot.s, end = shot.e} = shot.camera;
  const u = interpolate(t, [start, Math.max(start + 0.01, end)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE[ease]});
  return {x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u, z: from.z + (to.z - from.z) * u};
}

const Element: React.FC<{el: El; t: number; shot: Shot; i: number}> = ({el, t, shot, i}) => {
  const appear = el.in === undefined ? 1 : interpolate(t - shot.s, [el.in, el.in + 0.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
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
  const stroke = {stroke: LEAD, strokeWidth: 4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const label = (x: number, y: number, s?: string) =>
    s ? <text x={x} y={y} fontSize={34} fill={MUTED} textAnchor="middle" fontFamily={captionFontStack}>{s}</text> : null;
  let body: React.ReactNode = null;
  switch (el.t) {
    case 'rect':
      body = (
        <>
          {el.fill && <rect x={el.x} y={el.y} width={el.w} height={el.h} fill={FILLS[el.fill]} />}
          <path d={rect(el.x, el.y, el.w, el.h, {seed})} {...stroke} />
          {label(el.x + el.w / 2, el.y + el.h / 2 + 12, el.label)}
        </>
      );
      break;
    case 'ellipse':
      body = (
        <>
          {el.fill && <ellipse cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} fill={FILLS[el.fill]} />}
          <path d={ellipse(el.cx, el.cy, el.rx, el.ry, {seed})} {...stroke} />
          {label(el.cx, el.cy + 12, el.label)}
        </>
      );
      break;
    case 'line': {
      const pts = el.pts;
      body = (
        <>
          {el.fill && el.closed && <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={FILLS[el.fill]} />}
          <path d={poly(pts, {seed, closed: el.closed})} {...stroke} />
        </>
      );
      break;
    }
    case 'arrow':
      body = <path d={arrow(el.x1, el.y1, el.x2, el.y2, {seed})} {...stroke} />;
      break;
    case 'hatch':
      body = <path d={hatch(el.x, el.y, el.w, el.h, {seed})} {...stroke} strokeWidth={2} />;
      break;
    case 'figure': {
      const r = el.h * 0.12;
      body = (
        <>
          <path d={ellipse(el.x, el.y - el.h + r, r, r, {seed})} {...stroke} />
          <path d={poly([[el.x - el.h * 0.16, el.y], [el.x - el.h * 0.12, el.y - el.h * 0.72], [el.x + el.h * 0.12, el.y - el.h * 0.72], [el.x + el.h * 0.16, el.y]], {seed: seed + 'b'})} {...stroke} />
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
  const tf = `translate(${W / 2} ${H / 2}) scale(${c.z}) translate(${-c.x} ${-c.y})`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <rect width={W} height={H} fill={PAPER} />
      <g transform={tf}>{shot.els.map((el, i) => <Element key={i} el={el} t={t} shot={shot} i={i} />)}</g>
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
  const dur = tr === 'dissolve' ? 0.2 : tr === 'push-through' ? 0.3 : tr === 'wipe' ? 0.25 : 0;
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
      <div style={{position: 'absolute', inset: 0, opacity: inTr && tr !== 'wipe' ? u : 1,
        clipPath: inTr && tr === 'wipe' ? `inset(0 ${100 - u * 100}% 0 0)` : undefined}}>
        <ShotView shot={shot} t={t} />
      </div>
      {inTr && (tr === 'dissolve' || tr === 'wipe') ? (
        <div style={{position: 'absolute', inset: 0, opacity: tr === 'dissolve' ? 1 - u : 1, clipPath: tr === 'wipe' ? `inset(0 0 0 ${u * 100}%)` : undefined}}>
          <ShotView shot={prev} t={t} />
        </div>
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
