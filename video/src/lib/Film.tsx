// Film.tsx — the v2 sequencer: full-bleed scenes on the VO timeline, cinematic transitions, sky captions, audio.
// Main renders <Film scenes={scenes.json} components={sceneComponents} captions={captions.json} />.
//
// src/data/scenes.json: [{id, start, end, transitionIn?: {type, dur?, ...}, transitionOut?: {type: 'unbuild', ...},
//                         captionTone?: [{t, tone}], note?}]
//   start = the CUT (VO seconds) where this scene takes over; transitions are centred on / anchored to it.
//   captionTone: t is SCENE-LOCAL seconds; tone 'dark' (ink, light skies) | 'light' (white, dusk/night skies). The
//   first entry also applies before its t. Default 'dark'. The caption colour switches in exactly one frame at t, or,
//   with `wipe: 'down' | 'up'` (+ dur, default 0.4), follows the sky wipe's edge across the caption band (give it the
//   same t / wipe / dur as the World sky key).
// CAPTION TONE ACROSS TRANSITIONS: during a foreground wipe the captions are split at the wipe edge (old scene's tone
//   on the unswept side, new scene's tone on the swept side) and take the WIPER's own tone over the element
//   (`captionRegions` of the wiper component; built-ins: figure head / pole -> 'light', foliage per crown). During an
//   un-build the new tone follows the collapsing slab's top edge. Override with transition `captionTone`.
//
// Transition types (transitionIn of the INCOMING scene; c = its start):
//   cut              hard cut at c.
//   matchcut         hard cut at c; the two scenes put their shared object (sun, horizon, a door) in the same place.
//   camera-continuous  the outgoing camera move accelerates into the cut (dur / 2 before it, ease-in cubic) and the
//                    incoming scene continues it with the SAME velocity and decelerates over dur after it
//                    (out-cubic, n = 3): one weighty move, no whip-and-stop. {dur = 1.4, dir: 'in' | 'out' | 'up' |
//                    'down' | 'left' | 'right' = 'in', amount? (incoming travel: zoom factor <= 1.15 or px <= 150),
//                    focus?: [x, y] (outgoing push target), to?: [x, y] (incoming push target)}. The incoming scene
//                    starts zoomed out / offset by up to ~12%: author it with world.bleed (140 px) past every edge.
//   foreground-wipe  something passes close to the lens and the new scene is behind it: {dur = 0.8,
//                    element: 'figure' | 'pole' | 'foliage' | 'scene' = 'figure', dir: 'left' | 'right' = 'right',
//                    color?, captionTone?}. 'scene' uses the OUTGOING scene module's exported `Wiper` component
//                    (WiperProps; give it a static `captionRegions` for its caption tone over the element).
//   push-through     zoom into a point of the outgoing scene until it fills the frame, (optional flat `bridge` colour
//                    for 3 frames), then the incoming scene pulls back out of its own point:
//                    {dur = 1.1, from: [x, y], to?: [x, y] (default centre), zoom = 7, bridge?: colour}.
//                    Match the colours: zoom into a window whose glass is the incoming scene's sky.
//   unbuild          the outgoing scene un-builds (MOTION.unbuild recipe) over [c - dur, c] on top of the incoming
//                    scene, which is already rendered underneath (its local time is negative: show its line-art
//                    state at t < 0). {dur = 0.5}
//   transitionOut (LAST scene only): {type: 'unbuild', dur = 0.5, loop = true} un-builds the final scene before its
//   end and reveals the FIRST scene underneath at its t < 0 state; the captions scroll back to the first page.
// Scenes keep rendering (holding their end state) through any overlap after their own end.

import React from 'react';
import {Audio, AbsoluteFill, getStaticFiles, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CaptionTone, palette, stroke, world} from './theme';
import {clamp, ease as E, lerp, osc, prog, TimeProvider} from './time';
import {ExitProvider, NoExit} from './exit';
import {capcheckMode, CaptionBeat, SkyCaptions, ToneRegion, toneOn} from './Captions';
import {exitFillProgress} from './exit';
import {SceneInfo, StageCam, StageContexts, STAGE_REST, TransitionInfo, zoomAbout} from './stage';
import {Ink} from './Ink';
import {Fill} from './Fill';
import {blob, circle, crown, crownTicks, line, torso} from './sketch';
import type {Pt} from './sketch';
import {MOTION} from './spec';
import {World} from './World';
import {Sun} from './Sun';
import {captionFontStack} from './font';

// ---------------------------------------------------------------- data types

export type CamDir = 'in' | 'out' | 'up' | 'down' | 'left' | 'right';
export type FilmTransition =
  | {type: 'cut'; dur?: number}
  | {type: 'matchcut'; dur?: number}
  | {type: 'camera-continuous'; dur?: number; dir?: CamDir; amount?: number; focus?: Pt; to?: Pt}
  | {
      type: 'foreground-wipe';
      dur?: number;
      element?: 'figure' | 'pole' | 'foliage' | 'scene';
      dir?: 'left' | 'right';
      color?: string;
      /** Caption tone over the wiper element (default: the wiper's captionRegions, else derived from `color`). */
      captionTone?: CaptionTone;
    }
  | {type: 'push-through'; dur?: number; from?: Pt; to?: Pt; zoom?: number; bridge?: string}
  | {type: 'unbuild'; dur?: number};
/** Caption tone key (scene-local t). `wipe` makes the switch follow a sky wipe edge across the caption band. */
export type ToneKey = {t: number; tone: CaptionTone; wipe?: 'down' | 'up' | 'snap'; dur?: number};
export type FilmScene = {
  id: string;
  start: number;
  end: number;
  transitionIn?: FilmTransition;
  /** Last scene only. loop: reveal the first scene underneath; captionAt: VO time the captions roll back to page 1
   *  (default end - 0.22). */
  transitionOut?: {type: 'unbuild'; dur?: number; loop?: boolean; captionAt?: number};
  captionTone?: ToneKey[];
  note?: string;
};

export const FILM_DEFAULT_DUR: Record<FilmTransition['type'], number> = {
  cut: 0,
  matchcut: 0,
  'camera-continuous': 1.4,
  'foreground-wipe': 0.8,
  'push-through': 1.1,
  unbuild: MOTION.unbuild.total,
};
const tdur = (t?: FilmTransition | FilmScene['transitionOut']) => (t ? t.dur ?? FILM_DEFAULT_DUR[t.type] : 0);

/** Props of a foreground wiper (built-in or a scene's exported `Wiper`): draw in SCREEN px, centred on the boundary x.
 *  It MUST be opaque over [x - 90, x + 90] for the full frame height. p = 0..1 through the wipe. */
export type WiperProps = {x: number; p: number; dir: 'left' | 'right'; color?: string};
/** A wiper component with an optional static `captionRegions`: where (screen px) the element covers the caption band
 *  and which caption tone reads on it there (painted in order, later wins). Without it Film assumes x +- 90 and a tone
 *  derived from the wipe colour. */
export type WiperComponent = React.FC<WiperProps> & {captionRegions?: (p: WiperProps) => ToneRegion[]};

// ---------------------------------------------------------------- transition math

const C: Pt = [world.w / 2, world.h / 2];
const PT_HOLD = 0.1;

function camCont(tr: Extract<FilmTransition, {type: 'camera-continuous'}>): {dOut: number; dIn: number; out: (u: number) => StageCam; in: (v: number) => StageCam} {
  // One continuous, weighty move: the outgoing leg (dur / 2 before the cut) accelerates with ease-in cubic, the
  // incoming leg (dur after the cut = 2x the outgoing one) continues at the SAME velocity and decelerates with
  // out-cubic (n = 3): a long settle (0.6-1.2 s for 0.6-1.2 s transitions), never a whip-and-stop.
  // Matched velocity at the cut: 3 * travelOut / dOut = n * travelIn / dIn  =>  travelOut = travelIn * dOut / dIn.
  // The incoming travel is bounded by the bleed (world.bleed 140 px, ~12 % zoom); the outgoing one follows from it.
  const d = tdur(tr);
  const dOut = d / 2;
  const dIn = d;
  const n = 3;
  const dir = tr.dir ?? 'in';
  const k = Math.min(1, d / 1.4);
  if (dir === 'in' || dir === 'out') {
    // a 0.25 s continuation is a nudge, a 1.4 s one a real push
    const lnB = Math.log(clamp(tr.amount ?? 1 + 0.12 * k, 1.001, 1.15));
    const lnA = (lnB * n * dOut) / (3 * dIn);
    const sgn = dir === 'in' ? 1 : -1;
    const f: Pt = tr.focus ?? C;
    const to: Pt = tr.to ?? C;
    return {
      dOut,
      dIn,
      out: (u) => zoomAbout(f, Math.exp(sgn * lnA * E.inCubic(u)), f),
      in: (v) => zoomAbout(to, Math.exp(-sgn * lnB * Math.pow(1 - v, n)), to),
    };
  }
  const Din = clamp(tr.amount ?? 150 * k, 1, 150);
  const D = (Din * n * dOut) / (3 * dIn);
  const [vx, vy] = dir === 'up' ? [0, -1] : dir === 'down' ? [0, 1] : dir === 'left' ? [-1, 0] : [1, 0];
  return {
    dOut,
    dIn,
    out: (u) => ({ox: vx * D * E.inCubic(u), oy: vy * D * E.inCubic(u), zoom: 1, rot: 0}),
    in: (v) => ({ox: -vx * Din * Math.pow(1 - v, n), oy: -vy * Din * Math.pow(1 - v, n), zoom: 1, rot: 0}),
  };
}

function pushThrough(tr: Extract<FilmTransition, {type: 'push-through'}>) {
  const d = tdur(tr);
  const hold = tr.bridge ? PT_HOLD : 0;
  const dOut = (d - hold) * 0.45;
  const dIn = (d - hold) * 0.55;
  const Z = tr.zoom ?? 7;
  const from: Pt = tr.from ?? C;
  const to: Pt = tr.to ?? C;
  const lz = Math.log(Z);
  return {
    hold,
    dOut,
    dIn,
    out: (u: number): StageCam => {
      const k = E.inCubic(u);
      return zoomAbout(from, Math.exp(lz * k), [lerp(from[0], C[0], k), lerp(from[1], C[1], k)]);
    },
    in: (v: number): StageCam => {
      const k = 1 - E.outCubic(v);
      return zoomAbout(to, Math.exp(lz * k), [lerp(to[0], C[0], k), lerp(to[1], C[1], k)]);
    },
  };
}

const WIPE_HALF: Record<string, number> = {figure: 660, pole: 120, foliage: 460, scene: 600};

/** Boundary x of a foreground wipe at progress p (crosses the centre at p = 0.5). */
function wipeX(p: number, dir: 'left' | 'right', half: number): number {
  const x0 = -half - 30;
  const x1 = world.w + half + 30;
  const x = lerp(x0, x1, p);
  return dir === 'right' ? x : world.w - x;
}

// ---------------------------------------------------------------- built-in wipers (screen px)

/** A giant back-view passer-by right in front of the lens (head + shoulders fill the frame height). */
const figureGeo = (x: number, p: number, dir: 'left' | 'right') => ({hy: 330 + osc(p * 1.6, 1) * 14, lean: (dir === 'right' ? 1 : -1) * 1.5, R: 385});
/** Plain SVG ellipse path (clip shapes). */
const ellipseD = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;

export const FigureWiper: WiperComponent = ({x, p, dir, color = palette.tealDark}) => {
  const {hy, lean, R} = figureGeo(x, p, dir);
  const hx = x;
  const W = 1320;
  return (
    <g transform={`rotate(${lean} ${x} 1920)`}>
      <Fill d={torso(x, 2060, W, 1430, 0.42, 0.04)} color={color} offset={false} exit={false} />
      {/* a hood around the head: one dark silhouette over the caption band (no skin-coloured ears at caption height) */}
      <Fill d={blob(hx, hy + 70, R * 1.16, R * 1.12, {seed: 'fwHd', wobble: 0.01})} color={color} offset={false} exit={false} />
      <Ink d={circle(hx, hy + 70, R * 1.14, {seed: 'fwHdi', overlap: 20})} width={stroke.inkBold + 0.4} exit={false} />
      <Fill d={blob(hx, hy, R, R, {seed: 'fwH', wobble: 0.015})} color={palette.ink} offset={false} exit={false} />
      <Ink d={torso(x, 2060, W, 1430, 0.42, 0.04)} width={stroke.inkBold + 0.4} exit={false} />
      <Ink d={circle(hx, hy, R, {seed: 'fwHi', overlap: 20})} width={stroke.inkBold + 0.4} exit={false} />
      <Ink d={`M${x - 330} ${hy + 520}Q${x} ${hy + 640} ${x + 330} ${hy + 520}`} width={stroke.inkBold} exit={false} />
      {/* rim light on the leading side: a one-sided lighter strip */}
      <Fill d={torso(x + (dir === 'right' ? 18 : -18), 2060, W - 30, 1415, 0.42, 0.04)} color={palette.teal} offset={false} exit={false} rule="evenodd" style={{clipPath: dir === 'right' ? 'inset(0 0 0 52%)' : 'inset(0 52% 0 0)'}} />
    </g>
  );
};

/** Over the caption band the figure is one dark silhouette (head in its hood): white captions on it. */
FigureWiper.captionRegions = ({x, p, dir, color = palette.tealDark}) => {
  const {hy, lean, R} = figureGeo(x, p, dir);
  const transform = `rotate(${lean} ${x} 1920)`;
  const t = toneOn(color) === 'light' ? 'light' : 'dark';
  // + the outline stroke and the blob wobble
  return [{tone: t, d: ellipseD(x, hy + 70, R * 1.16 + 6, R * 1.12 + 6) + ellipseD(x, hy, R + 6, R + 6), transform}];
};

/** A near-camera post sliding past (lateral truck). */
export const PoleWiper: WiperComponent = ({x, dir, color = palette.tealDark}) => {
  const w = 230;
  const rim = dir === 'right' ? x + w / 2 - 26 : x - w / 2;
  return (
    <>
      <Fill rect={[x - w / 2, -40, w, 2000]} color={color} offset={false} exit={false} />
      <Fill rect={[rim, -40, 26, 2000]} color={palette.teal} offset={false} exit={false} />
      {[260, 980, 1600].map((y, i) => (
        <Fill key={i} rect={[x - w / 2 - 14, y, w + 28, 46]} color={palette.ink} offset={false} exit={false} />
      ))}
      <Ink d={line(x - w / 2, -60, x - w / 2, 1990, {seed: 'pw1', breaks: false})} width={stroke.inkBold} exit={false} />
      <Ink d={line(x + w / 2, -60, x + w / 2, 1990, {seed: 'pw2', breaks: false})} width={stroke.inkBold} exit={false} />
    </>
  );
};

PoleWiper.captionRegions = ({x, color = palette.tealDark}) => [{tone: toneOn(color), rect: [x - 130, -200, x + 130, 2200]}];

const foliageItems = (color: string): [number, number, number, string][] => [
  [-60, 120, 380, palette.sage],
  [80, 560, 420, color],
  [-90, 1020, 430, palette.sage],
  [60, 1480, 420, color],
  [-40, 1900, 400, palette.sage],
];

/** Leaves right in front of the lens: a column of big two-tone crowns. */
export const FoliageWiper: WiperComponent = ({x, color = palette.teal}) => {
  const items = foliageItems(color);
  return (
    <>
      {items.map(([dx, y, r, c], i) => (
        <React.Fragment key={i}>
          <Fill d={crown(x + dx, y, r, r * 0.9, {seed: `fol${i}`, bumps: 9})} color={c} offset={[4, 3]} exit={false} />
          <Ink d={crown(x + dx, y, r, r * 0.9, {seed: `fol${i}`, bumps: 9})} width={stroke.inkBold} open={0.15} exit={false} />
          <Ink d={crownTicks(x + dx, y, r, r * 0.9, {seed: `folt${i}`, n: 5, size: 26})} width={stroke.inkBold} order="all" exit={false} />
        </React.Fragment>
      ))}
    </>
  );
};

/** Each crown takes the caption tone that reads best on its own colour (sage: ink, teal: white). */
FoliageWiper.captionRegions = ({x, color = palette.teal}) =>
  foliageItems(color)
    .filter(([, y, r]) => y - r < 600)
    .map(([dx, y, r, c], i) => ({tone: toneOn(c), d: crown(x + dx, y, r, r * 0.9, {seed: `fol${i}`, bumps: 9})}));

export const BUILTIN_WIPERS: Record<string, WiperComponent> = {figure: FigureWiper, pole: PoleWiper, foliage: FoliageWiper};

// ---------------------------------------------------------------- helpers

/** Caption tone at timeline time T from the scenes' captionTone keys (scene-local t). */
export function toneAt(scenes: FilmScene[], T: number): CaptionTone {
  let cur: FilmScene | undefined;
  for (const s of scenes) if (T >= s.start) cur = s;
  cur = cur ?? scenes[0];
  const keys = cur?.captionTone;
  if (!keys || !keys.length) return 'dark';
  const t = T - cur.start;
  let tone = keys[0].tone;
  for (const k of keys) if (t >= k.t) tone = k.tone;
  return tone;
}

/** Caption tone of ONE scene at timeline T (its keys are scene-local; before its first key, the first key). */
export function sceneToneAt(s: FilmScene | undefined, T: number): CaptionTone {
  const keys = s?.captionTone;
  if (!s || !keys || !keys.length) return 'dark';
  const t = T - s.start;
  let tone = keys[0].tone;
  for (const k of keys) if (t >= k.t) tone = k.tone;
  return tone;
}

const FULL: [number, number, number, number] = [-200, -200, 1300, 2200];
/** Screen y of a sky-wipe edge at progress p (the World sky rect at rest is y -60 .. 1980). */
const skyEdgeY = (p: number) => -60 + 2040 * clamp(p);
const uniform = (r: ToneRegion[]) => r.every((x) => x.tone === r[0].tone);

/** One scene's own tone switch in progress (a tone key with `wipe`), as regions; else null. */
export function sceneToneRegions(s: FilmScene | undefined, T: number): ToneRegion[] | null {
  const keys = s?.captionTone;
  if (!s || !keys || keys.length < 2) return null;
  const t = T - s.start;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (!k.wipe || k.wipe === 'snap') continue;
    const dur = k.dur ?? 0.4;
    if (t < k.t || t >= k.t + dur) continue;
    const before = keys[i - 1].tone;
    if (before === k.tone) return null;
    const e = skyEdgeY((t - k.t) / dur);
    return k.wipe === 'down'
      ? [{tone: before, rect: FULL}, {tone: k.tone, rect: [-200, -200, 1300, e]}]
      : [{tone: before, rect: FULL}, {tone: k.tone, rect: [-200, 1980 - (e + 60), 1300, 2200]}];
  }
  return null;
}

/** Caption tone REGIONS at timeline T: split at a foreground wipe's edge (with the wiper's own tone over the element),
 *  at an un-build slab's edge, or at a scene's own tone wipe. null = one tone everywhere (toneAt). */
export function toneRegionsAt(scenes: FilmScene[], T: number, wipers: Record<string, React.FC<WiperProps>> = {}): ToneRegion[] | null {
  for (let i = 1; i < scenes.length; i++) {
    const s = scenes[i];
    const tr = s.transitionIn;
    if (!tr) continue;
    const prev = scenes[i - 1];
    if (tr.type === 'foreground-wipe') {
      const d = tdur(tr);
      const p = (T - s.start + d / 2) / d;
      if (p <= 0 || p >= 1) continue;
      const dir = tr.dir ?? 'right';
      const el = tr.element ?? 'figure';
      const x = wipeX(p, dir, WIPE_HALF[el]);
      const cx = clamp(x, -1, world.w + 1);
      const tOld = sceneToneAt(prev, T);
      const tNew = sceneToneAt(s, T);
      const sides: ToneRegion[] =
        dir === 'right'
          ? [{tone: tNew, rect: [-200, -200, cx, 2200]}, {tone: tOld, rect: [cx, -200, 1300, 2200]}]
          : [{tone: tOld, rect: [-200, -200, cx, 2200]}, {tone: tNew, rect: [cx, -200, 1300, 2200]}];
      // the same component Film draws (a scene without its own Wiper falls back to the figure)
      const W = ((el === 'scene' ? wipers[prev.id] : BUILTIN_WIPERS[el]) ?? FigureWiper) as WiperComponent;
      const props: WiperProps = {x, p, dir, color: tr.color};
      let wr: ToneRegion[] = W.captionRegions ? W.captionRegions(props) : [{tone: tr.color ? toneOn(tr.color) : 'light', rect: [x - 90, -200, x + 90, 2200]}];
      if (tr.captionTone) wr = wr.map((r) => ({...r, tone: tr.captionTone!}));
      const all = [...sides, ...wr];
      return uniform(all) ? null : all;
    }
    if (tr.type === 'unbuild') {
      const d = tdur(tr);
      if (T < s.start - d || T >= s.start) continue;
      const k = E.inCubic(exitFillProgress(prog(T, s.start - d, d), 0, 1));
      if (k <= 0) continue;
      const all: ToneRegion[] = [{tone: sceneToneAt(prev, T), rect: FULL}, {tone: sceneToneAt(s, s.start), rect: [-200, -200, 1300, skyEdgeY(k)]}];
      return uniform(all) ? null : all;
    }
  }
  const last = scenes[scenes.length - 1];
  const to = last?.transitionOut;
  if (last && to?.type === 'unbuild' && to.loop !== false && scenes.length > 1) {
    const d = tdur(to);
    if (T >= last.end - d && T < last.end) {
      const k = E.inCubic(exitFillProgress(prog(T, last.end - d, d), 0, 1));
      if (k > 0) {
        const all: ToneRegion[] = [{tone: sceneToneAt(last, T), rect: FULL}, {tone: sceneToneAt(scenes[0], scenes[0].start), rect: [-200, -200, 1300, skyEdgeY(k)]}];
        return uniform(all) ? null : all;
      }
    }
  }
  let cur: FilmScene | undefined;
  for (const s of scenes) if (T >= s.start) cur = s;
  return sceneToneRegions(cur ?? scenes[0], T);
}

/** public/mix.wav if present, else public/vo.mp3. */
export function audioFile(): string {
  try {
    const files = getStaticFiles();
    if (files.some((f) => f.name === 'mix.wav')) return 'mix.wav';
  } catch {
    // not available: fall through
  }
  return 'vo.mp3';
}

export const filmDuration = (scenes: FilmScene[]) => Math.max(...scenes.map((s) => s.end));

/** Placeholder for ids without a component: a full-bleed sky, a horizon, the sun and the scene id. */
const MissingScene: React.FC<{id: string}> = ({id}) => (
  <World sky={palette.sky}>
    <Fill rect={[-200, world.horizon, world.w + 400, world.h - world.horizon + 200]} color={palette.mintPale} offset={false} />
    <Ink d={line(-40, world.horizon, world.w + 40, world.horizon, {seed: `ph${id}`})} width={stroke.ink} />
    <Sun horizon={world.horizon} drift={[10, 0]} />
    <text x={world.w / 2} y={1200} textAnchor="middle" fontSize={64} fill={palette.ink} fontFamily={captionFontStack}>
      {id}
    </text>
  </World>
);

type Layer = {key: string; node: React.ReactNode; z: number};

// ---------------------------------------------------------------- Film

export type FilmProps = {
  scenes: FilmScene[];
  components: Record<string, React.FC>;
  /** Scene modules' exported Wiper components by scene id (for foreground-wipe element 'scene'). */
  wipers?: Record<string, React.FC<WiperProps>>;
  captions: CaptionBeat[];
  /** Timeline seconds at frame 0 (scene previews pass scene.start). */
  offset?: number;
  /** Render only this scene id (no neighbours, no transition cameras; its captions; its own transitionOut). */
  only?: string;
  /** Play the soundtrack aligned to the timeline. Default true. */
  audio?: boolean;
  /** Draw captions. Default true. */
  showCaptions?: boolean;
};

export const Film: React.FC<FilmProps> = ({scenes: scenesIn, components, wipers = {}, captions, offset = 0, only, audio = true, showCaptions = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = frame / fps + offset;
  const scenes = scenesIn.slice().sort((a, b) => a.start - b.start);
  const comp = (id: string): React.FC => components[id] ?? (() => <MissingScene id={id} />);
  const capMask = capcheckMode() === 'mask'; // scripts/capcheck.mjs: captions only (no scenes)
  const layers: Layer[] = [];
  const overlays: React.ReactNode[] = [];
  const end = filmDuration(scenes);

  const pushLayer = (s: FilmScene, i: number, o: {offset?: number; cam?: StageCam; clip?: string; exit?: number; z: number; trans?: TransitionInfo | null; key?: string}) => {
    const Comp = comp(s.id);
    const ti = s.transitionIn;
    const info: SceneInfo = {id: s.id, start: s.start, end: s.end, dur: s.end - s.start, transitionIn: ti && i > 0 ? {type: ti.type, dur: tdur(ti), dir: 'dir' in ti ? ti.dir : undefined} : undefined};
    layers.push({
      key: o.key ?? `${s.id}#${i}`,
      z: o.z,
      node: (
        <TimeProvider offset={o.offset ?? s.start}>
          <StageContexts scene={info} cam={o.cam ?? STAGE_REST} clip={o.clip} transition={o.trans ?? null}>
            <ExitProvider value={o.exit ?? 0}>
              <AbsoluteFill>
                <Comp />
              </AbsoluteFill>
            </ExitProvider>
          </StageContexts>
        </TimeProvider>
      ),
    });
  };

  scenes.forEach((s, i) => {
    if (capMask) return;
    if (only && s.id !== only) return;
    const next = only ? undefined : scenes[i + 1];
    const tin = only || i === 0 ? undefined : s.transitionIn;
    const tout = next?.transitionIn;
    const cIn = s.start;
    const cOut = next ? next.start : Infinity;

    // ---- visibility window
    let vs = -Infinity;
    if (tin) {
      if (tin.type === 'unbuild') vs = cIn - tdur(tin);
      else if (tin.type === 'foreground-wipe') vs = cIn - tdur(tin) / 2;
      else if (tin.type === 'push-through') vs = cIn + pushThrough(tin).hold / 2;
      else vs = cIn;
    }
    let ve = Infinity;
    if (tout) {
      if (tout.type === 'foreground-wipe') ve = cOut + tdur(tout) / 2;
      else if (tout.type === 'push-through') ve = cOut - pushThrough(tout).hold / 2;
      else ve = cOut;
    }
    if (T < vs || T >= ve) return;

    // ---- camera, clip, exit
    let cam: StageCam = STAGE_REST;
    let clip: string | undefined;
    let exit = 0;
    let trans: TransitionInfo | null = null;
    let z = i * 10;
    if (tin && T < cIn + 3) {
      const q = T - cIn;
      if (tin.type === 'camera-continuous') {
        const cc = camCont(tin);
        if (q < cc.dIn) {
          cam = cc.in(clamp(q / cc.dIn));
          trans = {type: tin.type, phase: 'in', p: clamp(q / cc.dIn)};
        }
      } else if (tin.type === 'push-through') {
        const pt = pushThrough(tin);
        const v = (q - pt.hold / 2) / pt.dIn;
        if (v < 1) {
          cam = pt.in(clamp(v));
          trans = {type: tin.type, phase: 'in', p: clamp(v)};
        }
      } else if (tin.type === 'foreground-wipe') {
        const d = tdur(tin);
        const p = clamp((q + d / 2) / d);
        if (p < 1) {
          const dir = tin.dir ?? 'right';
          const x = wipeX(p, dir, WIPE_HALF[tin.element ?? 'figure']);
          const cx = clamp(x, 0, world.w);
          clip = dir === 'right' ? `inset(0px ${(world.w - cx).toFixed(1)}px 0px 0px)` : `inset(0px 0px 0px ${cx.toFixed(1)}px)`;
          const drift = (dir === 'right' ? 1 : -1) * 50 * (1 - p);
          cam = {ox: drift, oy: 0, zoom: 1, rot: 0};
          trans = {type: tin.type, phase: 'in', p};
        }
      } else if (tin.type === 'unbuild' && T < cIn) {
        z = (i - 1) * 10 - 5; // incoming waits UNDER the un-building scene
        trans = {type: tin.type, phase: 'in', p: prog(T, cIn - tdur(tin), tdur(tin))};
      }
    }
    if (tout && next) {
      const q = T - cOut;
      if (tout.type === 'camera-continuous') {
        const cc = camCont(tout);
        if (q > -cc.dOut) {
          cam = cc.out(clamp((q + cc.dOut) / cc.dOut));
          trans = {type: tout.type, phase: 'out', p: clamp((q + cc.dOut) / cc.dOut)};
        }
      } else if (tout.type === 'push-through') {
        const pt = pushThrough(tout);
        const u = (q + pt.hold / 2 + pt.dOut) / pt.dOut;
        if (u > 0) {
          cam = pt.out(clamp(u));
          trans = {type: tout.type, phase: 'out', p: clamp(u)};
        }
      } else if (tout.type === 'foreground-wipe') {
        const d = tdur(tout);
        const p = clamp((q + d / 2) / d);
        if (p > 0) {
          const dir = tout.dir ?? 'right';
          const x = wipeX(p, dir, WIPE_HALF[tout.element ?? 'figure']);
          const cx = clamp(x, 0, world.w);
          clip = dir === 'right' ? `inset(0px 0px 0px ${cx.toFixed(1)}px)` : `inset(0px ${(world.w - cx).toFixed(1)}px 0px 0px)`;
          const drift = (dir === 'right' ? 1 : -1) * 50 * p;
          cam = {ox: -drift, oy: 0, zoom: 1, rot: 0};
          trans = {type: tout.type, phase: 'out', p};
          // the element itself, above both scenes
          const Wiper = tout.element === 'scene' ? wipers[s.id] ?? FigureWiper : BUILTIN_WIPERS[tout.element ?? 'figure'] ?? FigureWiper;
          if (p < 1)
            overlays.push(
              <svg key={`wipe${i}`} width={world.w} height={world.h} viewBox={`0 0 ${world.w} ${world.h}`} style={{position: 'absolute', left: 0, top: 0}}>
                <TimeProvider offset={s.start}>
                  <NoExit>
                    <Wiper x={x} p={p} dir={dir} color={tout.color} />
                  </NoExit>
                </TimeProvider>
              </svg>,
            );
        }
      } else if (tout.type === 'unbuild') {
        const d = tdur(tout);
        exit = prog(T, cOut - d, d);
        if (exit > 0) trans = {type: tout.type, phase: 'out', p: exit};
      }
      if (tout.type === 'push-through' && tout.bridge) {
        const pt = pushThrough(tout);
        if (Math.abs(q) <= pt.hold / 2 + 1e-6) overlays.push(<AbsoluteFill key={`bridge${i}`} style={{background: tout.bridge}} />);
      }
    }
    // own transitionOut (last scene / previews): un-build (+ loop underlay)
    if (!next && s.transitionOut?.type === 'unbuild') {
      const d = tdur(s.transitionOut);
      exit = Math.max(exit, prog(T, s.end - d, d));
      if (exit > 0) {
        trans = {type: 'unbuild', phase: 'out', p: exit};
        if (!only && s.transitionOut.loop !== false && scenes.length > 1 && T >= s.end - d) {
          // the opening scene, at its t < 0 state, waits underneath
          pushLayer(scenes[0], 0, {offset: end, z: z - 5, key: 'loop'});
        }
      }
    }
    pushLayer(s, i, {cam, clip, exit, z, trans});
  });

  layers.sort((a, b) => a.z - b.z);
  const tone = (t: number) => toneAt(scenes, t);
  const regions = (t: number) => (only ? sceneToneRegions(scenes.find((x) => x.id === only), t) : toneRegionsAt(scenes, t, wipers));
  const last = scenes[scenes.length - 1];
  // the captions roll back to page 1 for the loop (unless captions.json already ends on an explicit loop page)
  const firstText = captions[0]?.lines[0]?.text;
  const lastCap = captions[captions.length - 1];
  const explicitLoopPage = captions.length > 1 && lastCap.lines.length === 1 && lastCap.lines[0].text === firstText && lastCap.s > end - 1.5;
  const loopAt = !only && !explicitLoopPage && last?.transitionOut?.type === 'unbuild' && last.transitionOut.loop !== false ? last.transitionOut.captionAt ?? end - 0.22 : undefined;
  const onlyIdx = only ? scenes.findIndex((s) => s.id === only) : -1;
  const range: [number, number] | undefined = only && onlyIdx >= 0 ? [scenes[onlyIdx].start, scenes[onlyIdx + 1]?.start ?? Infinity] : undefined;

  return (
    <TimeProvider global={T} offset={0}>
      <AbsoluteFill style={{background: palette.sky, overflow: 'hidden'}}>
        {layers.map((l) => (
          <React.Fragment key={l.key}>{l.node}</React.Fragment>
        ))}
        {overlays}
        {showCaptions ? <SkyCaptions beats={captions} tone={tone} regions={regions} loopAt={loopAt} range={range} hookAtStart={!only} /> : null}
      </AbsoluteFill>
      {audio ? <Audio src={staticFile(audioFile())} trimBefore={offset > 0 ? Math.round(offset * fps) : undefined} /> : null}
    </TimeProvider>
  );
};

/** Standalone full-bleed preview (dev compositions): one scene component with captions, time = frame / fps, an
 *  optional un-build at the end and an optional LOOP (the same scene, at its t < 0 state, waits underneath the un-build
 *  and the captions scroll back to page 1):
 *  <Standalone captions={beats} tone={[{t: 0, tone: 'dark'}]} unbuild={{at: 11.5}} loop={{at: 12}}> <MyScene/> </Standalone> */
export const Standalone: React.FC<{
  children?: React.ReactNode;
  captions?: CaptionBeat[];
  tone?: ToneKey[];
  unbuild?: {at: number; dur?: number};
  /** Loop point (= composition end): the children are rendered again underneath with time offset `at`. */
  loop?: {at: number};
  /** Transition camera to apply (to preview a camera-continuous exit etc.). */
  cam?: (t: number) => StageCam;
}> = ({children, captions, tone, unbuild, loop, cam}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = frame / fps;
  const exit = unbuild ? prog(T, unbuild.at, unbuild.dur ?? MOTION.unbuild.total) : 0;
  const scene: FilmScene = {id: 'standalone', start: 0, end: 1e9, captionTone: tone};
  const info = {id: 'standalone', start: 0, end: 1e9, dur: 1e9};
  const loopT = (t: number) => (loop && t >= loop.at ? t - loop.at : t);
  // the loop's caption tone follows the collapsing slab edge (old tone below it, the opening tone above it)
  const regions = (t: number): ToneRegion[] | null => {
    if (loop && unbuild && t >= unbuild.at && t < loop.at) {
      const k = E.inCubic(exitFillProgress(prog(t, unbuild.at, unbuild.dur ?? MOTION.unbuild.total), 0, 1));
      const a = toneAt([scene], t);
      const b = toneAt([scene], -1e-3);
      if (k > 0 && a !== b) return [{tone: a, rect: FULL}, {tone: b, rect: [-200, -200, 1300, skyEdgeY(k)]}];
    }
    return sceneToneRegions(scene, loopT(t));
  };
  const capMask = capcheckMode() === 'mask';
  return (
    <TimeProvider global={T} offset={0}>
      <AbsoluteFill style={{background: palette.sky, overflow: 'hidden'}}>
        {!capMask && loop && unbuild && T >= unbuild.at ? (
          <TimeProvider offset={loop.at}>
            <StageContexts scene={info}>
              <AbsoluteFill>{children}</AbsoluteFill>
            </StageContexts>
          </TimeProvider>
        ) : null}
        {capMask ? null : (
          <StageContexts scene={info} cam={cam ? cam(T) : STAGE_REST}>
            <ExitProvider value={exit}>
              <AbsoluteFill>{children}</AbsoluteFill>
            </ExitProvider>
          </StageContexts>
        )}
        {captions ? (
          <SkyCaptions
            beats={captions}
            tone={(t) => toneAt([scene], loopT(t))}
            regions={regions}
            loopAt={loop ? loop.at - 0.3 : undefined}
          />
        ) : null}
      </AbsoluteFill>
    </TimeProvider>
  );
};
