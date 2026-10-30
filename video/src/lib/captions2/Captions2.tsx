// Captions2.tsx: the words on screen per docs/look/TYPE_GUIDE.md (PICKED 2026-10-30), played from a caption file
// (public/vN/captions2.json, scripts/captions2/build_captions.py). API: ./README.md.
//
//   <Captions2 data={captions} />                   // at the composition root, ABOVE the camera layer (screen space)
//   <Captions2 src="v4/captions2.json" />           // or fetched from public/
//   <WorldWord item={captions.world[0]} cx={...} cy={...} />   // R7, inside the camera layer's SVG, on its object
//   <CoverTitle cover={captions.cover} />           // R10, the cover frame
//
// What it plays (the guide's §d): a piece pops whole `lead` frames (2 at 60 fps) before its build chunk's first word,
// in place, in 1 frame; a group pops whole or builds word by word into slots laid out for the whole group (nothing
// reflows); the lit hand pops whole and BLOOMS: its glow 0 -> full while it settles 0.96 -> 1.00 about its baseline
// centre in 8 frames (ease-out cubic), its neighbours never move; the running words carry the soft halo in the sky's
// tone; a group cuts out whole (the next pops), or fades out in 3 frames (a sentence end before a pause), or the
// optional soft pop (3 + 6 frames). Never clipped: no clip path, no mask, no slide; filter regions are sized to the
// ink plus 3 sigma. One group at a time. Capcheck: input props {capcheck: 'mask'} draws a black frame with each
// piece in a code colour rgb(255, id x 8, tone code x 40) for scripts/capcheck.py --words; {capcheck: 'bg'} draws
// nothing.

import React, {useEffect, useId, useMemo, useState} from 'react';
import {continueRender, delayRender, getInputProps, staticFile, useVideoConfig} from 'remotion';
import recipes from './recipes.json';
import {handStack, useHandFonts} from './fonts';
import {layoutGroup, measure} from './layout';
import type {CaptionFile, Cover, Group, GroupLayout, PlacedPiece, SkyTone, WorldItem} from './types';
import {useGlobalTime} from '../time';

type ToneSpec = {
  ink: string;
  weight: number;
  lit: string;
  halo: {color: string; a: number; r: number}[];
  glow: {color: string; a: number; r: number; dilate: number; under?: {color: string; a: number; r: number}};
};
const TONES = recipes.tones as unknown as Record<SkyTone, ToneSpec>;
const M = recipes.motion;

/** Mask code colours (scripts/capcheck.py --words): R 255, G = the piece's id (1-31) x idStep, B = the tone code x
 *  codeStep; spaced out so an anti-aliased edge never reads as a neighbour (capcheck decodes fully covered pixels). */
export const CAPTIONS2_MASK = {r: 255, idStep: 8, codeStep: 40, codes: {darkInk: 1, darkLit: 2, lightInk: 3, lightLit: 4, world: 5}} as const;

const outCubic = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
const inQuad = (x: number) => Math.max(0, Math.min(1, x)) * Math.max(0, Math.min(1, x));

/** The bloom's progress f frames after the pop (the stills' numbers: 2 of 8 frames = 58 %). */
export const bloomAt = (f: number) => (f <= 0 ? 0 : f >= M.bloom.frames ? 1 : outCubic(f / M.bloom.frames));

function capMode(): 'mask' | 'bg' | null {
  try {
    const p = getInputProps() as {capcheck?: unknown} | undefined;
    return p && (p.capcheck === 'mask' || p.capcheck === 'bg') ? p.capcheck : null;
  } catch {
    return null;
  }
}

/** Fetches a caption file from public/ once (holds the render until it is in). */
export function useCaptionFile(src: string | undefined, data?: CaptionFile | null): CaptionFile | null {
  const [file, setFile] = useState<CaptionFile | null>(data ?? null);
  const [handle] = useState(() => (data || !src ? null : delayRender(`captions2: loading ${src}`)));
  useEffect(() => {
    if (data || !src) return;
    let alive = true;
    const done = () => {
      if (handle !== null) continueRender(handle);
    };
    fetch(staticFile(src))
      .then((r) => r.json())
      .then((j: CaptionFile) => {
        if (alive) setFile(j);
        done();
      })
      .catch((err) => {
        console.warn('[captions2] could not load', src, err);
        done();
      });
    return () => {
      alive = false;
    };
  }, [src, data, handle]);
  return data ?? file;
}

type Timed = {g: Group; first: number; end: number};

/** The groups' frame windows at `fps`: the first pop (from each piece's `at` and the file's lead) and the first frame
 *  it is gone (`end`, never past the next group's first pop). */
export function groupWindows(file: CaptionFile, fps: number, range?: [number, number]): Timed[] {
  const leadSec = file.lead / file.fps;
  const pop = (at: number) => (at <= 0 ? 0 : Math.max(0, Math.floor((at - leadSec) * fps + 1e-6)));
  const groups = (range ? file.groups.filter((g) => g.start >= range[0] - 1e-9 && g.start < range[1]) : file.groups).slice();
  const out: Timed[] = groups.map((g) => {
    let first = Infinity;
    for (const r of g.rows) for (const p of r.pieces) first = Math.min(first, pop(p.at));
    return {g, first, end: Math.round(g.end * fps)};
  });
  out.sort((a, b) => a.first - b.first);
  for (let i = 0; i + 1 < out.length; i++) out[i].end = Math.min(out[i].end, out[i + 1].first);
  return out;
}

export type Captions2Props = {
  /** The parsed caption file (preferred: import it or load it in calculateMetadata). */
  data?: CaptionFile | null;
  /** Or a path under public/ ('v4/captions2.json'), fetched once. */
  src?: string;
  /** Override every group's sky tone (e.g. a light board: plum ink). */
  tone?: SkyTone;
  /** The lit hand without colour or glow: size, weight and the swell still carry the stress (a monochrome board). */
  mono?: boolean;
  /** The light-sky halo (the guide: only where the field behind varies). Default false. */
  haloOnLight?: boolean;
  /** Only groups starting in [from, to) (s). */
  range?: [number, number];
  /** Draws the type frame, the band floor (585) and the seats, and each group's id (review only). */
  debug?: boolean;
};

type Run = {lit: boolean; pieces: PlacedPiece[]; size: number};

/** Consecutive running pieces of one row and one size share one halo (as one typed line does); a lit piece is its own. */
function runsOf(pieces: PlacedPiece[]): Run[] {
  const runs: Run[] = [];
  for (const p of pieces) {
    const last = runs[runs.length - 1];
    if (!p.piece.lit && last && !last.lit && last.size === p.piece.size && last.pieces[last.pieces.length - 1].row === p.row) last.pieces.push(p);
    else runs.push({lit: p.piece.lit, pieces: [p], size: p.piece.size});
  }
  return runs;
}

const sigma = (rEm: number, size: number) => (rEm * size) / 2; // CSS blur radius r -> Gaussian sigma r / 2 (type.js)

function region(pieces: PlacedPiece[], margin: number) {
  const x0 = Math.min(...pieces.map((p) => p.x0)) - margin;
  const x1 = Math.max(...pieces.map((p) => p.x1)) + margin;
  const y0 = Math.min(...pieces.map((p) => p.top)) - margin;
  const y1 = Math.max(...pieces.map((p) => p.bottom)) + margin;
  return {x: x0.toFixed(1), y: y0.toFixed(1), width: (x1 - x0).toFixed(1), height: (y1 - y0).toFixed(1)};
}

/** The running words' halo (§b): the sky darkened (or lightened) at 40 % over 0.22 em + 25 % over 0.06 em. */
function HaloFilter({id, run, tone}: {id: string; run: Run; tone: ToneSpec}) {
  const s = run.size;
  const margin = 3 * Math.max(...tone.halo.map((h) => sigma(h.r, s))) + 4;
  return (
    <filter id={id} filterUnits="userSpaceOnUse" {...region(run.pieces, margin)} colorInterpolationFilters="sRGB">
      {tone.halo.map((h, i) => (
        <React.Fragment key={i}>
          <feGaussianBlur in="SourceAlpha" stdDeviation={sigma(h.r, s).toFixed(2)} result={`b${i}`} />
          <feFlood floodColor={h.color} floodOpacity={h.a} />
          <feComposite in2={`b${i}`} operator="in" result={`s${i}`} />
        </React.Fragment>
      ))}
      <feMerge>
        {tone.halo.map((_, i) => (
          <feMergeNode key={i} in={`s${i}`} />
        ))}
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

/** The lit hand's light (PLEASANT.md): dilated 0.04 em, blurred 0.34 em, at a x k (the bloom); on dark skies over a
 *  thin dark halo (0.06 em at 30 %). */
function GlowFilter({id, run, tone, k, mono}: {id: string; run: Run; tone: ToneSpec; k: number; mono: boolean}) {
  const s = run.size;
  const g = tone.glow;
  const margin = 3 * sigma(g.r, s) + g.dilate * s + 4;
  return (
    <filter id={id} filterUnits="userSpaceOnUse" {...region(run.pieces, margin)} colorInterpolationFilters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius={(g.dilate * s).toFixed(1)} result="fat" />
      <feGaussianBlur in="fat" stdDeviation={sigma(g.r, s).toFixed(2)} result="b1" />
      <feFlood floodColor={g.color} floodOpacity={mono ? 0 : +(g.a * k).toFixed(4)} />
      <feComposite in2="b1" operator="in" result="s1" />
      {g.under ? (
        <>
          <feGaussianBlur in="SourceAlpha" stdDeviation={sigma(g.under.r, s).toFixed(2)} result="b2" />
          <feFlood floodColor={g.under.color} floodOpacity={g.under.a} />
          <feComposite in2="b2" operator="in" result="s2" />
        </>
      ) : null}
      <feMerge>
        <feMergeNode in="s1" />
        {g.under ? <feMergeNode in="s2" /> : null}
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

function PieceText({p, fill}: {p: PlacedPiece; fill: string}) {
  const pc = p.piece;
  const style: React.CSSProperties = {fontFamily: handStack, fontWeight: pc.weight, fontSize: pc.size, letterSpacing: `${pc.track * pc.size}px`, fontKerning: 'normal'};
  return (
    <>
      {p.parts.map((pt, i) => (
        <text key={i} x={pt.x.toFixed(2)} y={p.y} fill={fill} style={style}>
          {pt.t}
        </text>
      ))}
    </>
  );
}

/** One group drawn at `frame` (its own window already checked). Exported for still pages and tests. */
export function GroupView({g, layout, frame, fps, first, end, leadSec, toneOverride, mono = false, haloOnLight = false, mask = false, uid}: {
  g: Group;
  layout: GroupLayout;
  frame: number;
  fps: number;
  first: number;
  end: number;
  leadSec: number;
  toneOverride?: SkyTone;
  mono?: boolean;
  haloOnLight?: boolean;
  mask?: boolean;
  uid: string;
}) {
  const toneName: SkyTone = toneOverride ?? g.tone;
  const tone = TONES[toneName];
  const pop = (at: number) => (at <= 0 ? 0 : Math.max(0, Math.floor((at - leadSec) * fps + 1e-6)));
  // frames scale with the fps (the guide's frames are at 60)
  const fr = (n: number) => Math.max(1, Math.round((n * fps) / recipes.fps));
  const f60 = (f: number) => (f * recipes.fps) / fps;
  const visible = layout.pieces.filter((p) => {
    if (frame < pop(p.piece.at)) return false;
    const out = g.rows[p.row].out;
    return out === undefined || frame < Math.round(out * fps);
  });
  if (!visible.length) return null;
  // the group's entrance and exit
  let opacity = 1;
  let scale = 1;
  const f0 = frame - first;
  if (g.enter === 'soft' && f0 >= 0) {
    const oF = fr(M.softPop.opacityFrames);
    const sF = fr(M.softPop.scaleFrames);
    if (f0 < oF) opacity *= outCubic((f0 + 1) / oF);
    if (f0 < sF) scale = M.softPop.from + (1 - M.softPop.from) * outCubic((f0 + 1) / sF);
  }
  if (g.leave === 'soft') {
    const n = fr(M.softOut.frames);
    const i = frame - (end - n) + 1; // 1..n in the last n frames
    if (i >= 1 && i <= n) opacity *= 1 - inQuad(i / (n + 1));
  }
  if (mask) opacity = 1;
  const cx = (layout.x0 + layout.x1) / 2;
  const cy = (layout.top + layout.bottom) / 2;
  const groupTf = scale !== 1 && !mask ? `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${scale.toFixed(4)}) translate(${(-cx).toFixed(1)} ${(-cy).toFixed(1)})` : undefined;
  const runs = runsOf(visible);
  const code = (lit: boolean) => CAPTIONS2_MASK.codes[toneName === 'dark' ? (lit && !mono ? 'darkLit' : 'darkInk') : lit && !mono ? 'lightLit' : 'lightInk'];
  const idOf = (p: PlacedPiece) => 1 + layout.pieces.indexOf(p);
  const useHalo = toneName === 'dark' || haloOnLight;
  return (
    <g opacity={opacity < 1 ? +opacity.toFixed(4) : undefined} transform={groupTf}>
      {runs.map((run, ri) => {
        if (mask)
          return (
            <g key={ri}>
              {run.pieces.map((p) => {
                const k = run.lit ? bloomAt(f60(frame - pop(p.piece.at))) : 1;
                const bs = run.lit ? M.bloom.from + (1 - M.bloom.from) * k : 1;
                const bx = (p.x0 + p.x1) / 2;
                return (
                  <g key={idOf(p)} transform={bs !== 1 ? `translate(${bx.toFixed(1)} ${p.y}) scale(${bs.toFixed(4)}) translate(${(-bx).toFixed(1)} ${-p.y})` : undefined}>
                    <PieceText p={p} fill={`rgb(${CAPTIONS2_MASK.r},${Math.min(31, idOf(p)) * CAPTIONS2_MASK.idStep},${code(run.lit) * CAPTIONS2_MASK.codeStep})`} />
                  </g>
                );
              })}
            </g>
          );
        const fid = `${uid}r${ri}`;
        if (!run.lit) {
          return (
            <React.Fragment key={ri}>
              {useHalo ? (
                <defs>
                  <HaloFilter id={fid} run={run} tone={tone} />
                </defs>
              ) : null}
              <g filter={useHalo ? `url(#${fid})` : undefined}>
                {run.pieces.map((p) => (
                  <PieceText key={idOf(p)} p={p} fill={tone.ink} />
                ))}
              </g>
            </React.Fragment>
          );
        }
        const p = run.pieces[0];
        const k = bloomAt(f60(frame - pop(p.piece.at)));
        const bs = M.bloom.from + (1 - M.bloom.from) * k;
        const bx = (p.x0 + p.x1) / 2;
        return (
          <React.Fragment key={ri}>
            <defs>
              <GlowFilter id={fid} run={run} tone={tone} k={k} mono={mono} />
            </defs>
            <g transform={bs !== 1 ? `translate(${bx.toFixed(1)} ${p.y}) scale(${bs.toFixed(4)}) translate(${(-bx).toFixed(1)} ${-p.y})` : undefined}>
              <g filter={`url(#${fid})`}>
                <PieceText p={p} fill={mono ? tone.ink : tone.lit} />
              </g>
            </g>
          </React.Fragment>
        );
      })}
    </g>
  );
}

function DebugOverlay({label}: {label: string | null}) {
  const F = recipes.frame;
  const S = recipes.seats as Record<string, number>;
  const st = {stroke: 'rgba(255,80,160,0.7)', strokeWidth: 2, fill: 'none'};
  return (
    <g>
      <path d={`M${F.x0} ${F.y0}H${F.x1}V${F.yLow}H${F.x1Low}V${F.y1}H${F.x0}Z`} {...st} strokeDasharray="10 8" />
      <line x1={F.x0} x2={F.x1} y1={F.bandFloor} y2={F.bandFloor} {...st} />
      {Object.keys(S).map((k) => (
        <line key={k} x1={S[k]} x2={S[k]} y1={F.y0 - 20} y2={F.y0 + 30} {...st} />
      ))}
      {label ? (
        <text x={F.x0} y={F.y0 - 30} style={{fontFamily: 'monospace', fontSize: 30}} fill="rgba(255,80,160,0.9)">
          {label}
        </text>
      ) : null}
    </g>
  );
}

/** The film's captions: one group at a time, in screen space. */
export const Captions2: React.FC<Captions2Props> = ({data, src, tone, mono = false, haloOnLight = false, range, debug = false}) => {
  const file = useCaptionFile(src, data);
  const ready = useHandFonts();
  const T = useGlobalTime();
  const {fps} = useVideoConfig();
  const uid = 'c2' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const mode = capMode();
  const windows = useMemo(() => (file ? groupWindows(file, fps, range) : []), [file, fps, range ? range[0] : null, range ? range[1] : null]);
  const layouts = useMemo(() => (ready && file ? new Map(windows.map((w) => [w.g, layoutGroup(w.g)])) : null), [ready, file, windows]);
  if (!file || !ready || !layouts || mode === 'bg') return null;
  const frame = Math.round(T * fps);
  let cur: Timed | null = null;
  for (const w of windows) if (w.first <= frame) cur = w;
  const show = cur && frame < cur.end ? cur : null;
  const mask = mode === 'mask';
  if (!show && !mask && !debug) return null;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      {mask ? <rect x={0} y={0} width={1080} height={1920} fill="#000000" /> : null}
      {show ? (
        <GroupView
          g={show.g}
          layout={layouts.get(show.g)!}
          frame={frame}
          fps={fps}
          first={show.first}
          end={show.end}
          leadSec={file.lead / file.fps}
          toneOverride={tone}
          mono={mono}
          haloOnLight={haloOnLight}
          mask={mask}
          uid={uid}
        />
      ) : null}
      {debug && !mask ? <DebugOverlay label={show ? `${show.g.id} ${show.g.recipe}${show.g.part ? '.' + show.g.part : ''} ${show.g.seat ? 'seat ' + show.g.seat : ''}` : null} /> : null}
    </svg>
  );
};

/** R7: the word on its object, inside the camera layer's SVG. (cx, cy): the object face's centre in the parent's
 *  coordinates; the figures' ink is fitted to the object's width - fitPad (the guide: "2027" at ~122 px on a 280-px
 *  tag); plum ink, tracking 0, no halo. Shown from `from` to `to` (s; default the item's at / until), or always. */
export const WorldWord: React.FC<{item: WorldItem; cx: number; cy: number; width?: number; from?: number; to?: number; always?: boolean; rotate?: number}> = ({item, cx, cy, width, from, to, always = false, rotate}) => {
  const ready = useHandFonts();
  const T = useGlobalTime();
  if (!ready || capMode() === 'mask') return null;
  if (!always && (T < (from ?? item.at) || T >= (to ?? item.until))) return null;
  const w = (width ?? item.objectWidth) - item.fitPad;
  const m100 = measure(item.t, 100, item.weight, item.track);
  const size = Math.floor((100 * w) / Math.max(1, m100.right - m100.left));
  const m = measure(item.t, size, item.weight, item.track);
  const x = cx - (m.left + m.right) / 2;
  const y = cy + (m.asc - m.desc) / 2;
  return (
    <g transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined}>
      <text x={x.toFixed(2)} y={y.toFixed(2)} fill={item.ink} style={{fontFamily: handStack, fontWeight: item.weight, fontSize: size, letterSpacing: `${item.track * size}px`, fontKerning: 'normal'}}>
        {item.t}
      </text>
    </g>
  );
};

/** R10: the cover title, fully lit (no times). A full-frame SVG over the cover's frame. */
export const CoverTitle: React.FC<{cover: Cover; tone?: SkyTone}> = ({cover, tone}) => {
  const ready = useHandFonts();
  const uid = 'ct' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const layout = useMemo(() => (ready ? layoutGroup({rows: cover.rows, seat: null}) : null), [ready, cover]);
  if (!layout) return null;
  const g: Group = {id: 'cover', recipe: 'R10', tone: tone ?? cover.tone, text: cover.text, rows: cover.rows, start: 0, end: 1e9, enter: 'pop', leave: 'cut'};
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <GroupView g={g} layout={layout} frame={10000} fps={60} first={0} end={1e9} leadSec={0} toneOverride={tone} uid={uid} />
    </svg>
  );
};
