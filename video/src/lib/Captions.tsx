// Captions.tsx — word-group captions, reference grammar (style bible 10 + motion measurements):
//  - Patrick Hand ('CaptionHand') 82 px, ink, centred on the card; baselines card-local 1208 / 1304
//    (a 1-line caption sits centred on 1265; style 'punch' = x1.16 there; style 'hook' = x1.06)
//  - a later line rises from +88 px into place when its first word is spoken (0.4 s, fast ease-out)
//  - on a new caption the old block exits upward (~250 px in 0.2 s) while the new block rises from +112 px
//  - everything is clipped to the caption viewport type.clip (y 1070..1400)
//  - keyword highlight box (theme.highlight / highlightBox em geometry) wipes in left->right behind the
//    keyword at its time; trailing punctuation stays outside the box; multi-word phrases get one box
// Times are VO / timeline seconds (useGlobalTime), so captions stay synced inside any scene.
//
//   <Captions beats={captions} />                       // inside <Card>, after <Art>
//   type CaptionBeat = {s, e?, lines: {text, s}[], highlights?: {text, s}[], style?: 'punch' | 'hook'}

import React, {useId} from 'react';
import {getInputProps} from 'remotion';
import {captionTones, CaptionTone, card, highlightBox, palette, skyCaption, skyHighlightBox, type as typeTok} from './theme';
import {clamp, ease as E, prog, useGlobalTime} from './time';
import {highlightDur, MOTION} from './spec';
import {captionFontStack, measureCaption, useCaptionFont} from './font';

export type CaptionLine = {text: string; s: number};
export type CaptionHighlight = {text: string; s: number};
export type CaptionBeat = {s: number; e?: number; lines: CaptionLine[]; highlights?: CaptionHighlight[]; style?: 'normal' | 'punch' | 'hook'};

export type CaptionsProps = {
  beats: CaptionBeat[];
  /** Only beats starting in [from, to) (seconds). Used per card so a flipping card keeps its own caption. */
  range?: [number, number];
  /** Also show the beat that was active at range[0] (a new card shows the current caption). Default true. */
  carry?: boolean;
  /** Beats / lines / highlights starting before range[0] + this are shown settled (no roll). Default 0.35 s. */
  instantWithin?: number;
  /** Base font size (px). Default type.size (82). Auto-shrinks to type.maxLineWidth. */
  size?: number;
  color?: string;
  highlightColor?: string;
};

// measured curves (docs/motion_evidence/measurements.json)
const PAGE_RISE = 112; // new block starts this far below its rest position
const LINE_RISE = 88; // a later line starts this far below
const RISE_DUR = 0.4;
const OUT_DIST = 250; // old block travel upward
const OUT_DUR = 0.2;
const riseEase = E.expOut(4.5);
const hlEase = E.expOut(4);

const TRAILING = /[\s.,!?;:…"')\]]+$/;

type Box = {x: number; y: number; w: number; h: number; r: number; s: number};
type LineLayout = {text: string; s: number; baseline: number; boxes: Box[]};

function layoutBeat(b: CaptionBeat, baseSize: number): {size: number; lines: LineLayout[]} {
  const n = b.lines.length;
  const style = b.style ?? 'normal';
  let size = baseSize * (style === 'punch' ? typeTok.punchScale : style === 'hook' ? typeTok.hookScale : 1);
  const widest = Math.max(1, ...b.lines.map((l) => measureCaption(l.text, size)));
  if (widest > typeTok.maxLineWidth) size = Math.floor((size * typeTok.maxLineWidth) / widest);
  const {line1, line2, punch} = typeTok.baselines;
  const gap = (line2 - line1) * (style === 'hook' ? typeTok.hookScale : 1);
  let baselines: number[];
  if (n === 1) baselines = [punch];
  else if (n === 2) baselines = style === 'hook' ? [(line1 + line2) / 2 - gap / 2, (line1 + line2) / 2 + gap / 2] : [line1, line2];
  else baselines = b.lines.map((_, i) => line1 - ((n - 2) * gap) / 2 + i * gap);
  const used = new Set<CaptionHighlight>();
  const cx = card.w / 2;
  const lines: LineLayout[] = b.lines.map((ln, i) => {
    const boxes: Box[] = [];
    const lw = measureCaption(ln.text, size);
    for (const h of b.highlights ?? []) {
      if (used.has(h) || !h.text) continue;
      const want = h.text.replace(TRAILING, '');
      let idx = ln.text.indexOf(want);
      if (idx < 0) idx = ln.text.toLowerCase().indexOf(want.toLowerCase());
      if (idx < 0 || !want) continue;
      used.add(h);
      const x0 = cx - lw / 2 + measureCaption(ln.text.slice(0, idx), size);
      const x1 = x0 + measureCaption(ln.text.slice(idx, idx + want.length), size);
      boxes.push({
        x: x0 - highlightBox.padLeftEm * size,
        y: baselines[i] - highlightBox.topEm * size,
        w: x1 - x0 + (highlightBox.padLeftEm + highlightBox.padRightEm) * size,
        h: (highlightBox.topEm + highlightBox.bottomEm) * size,
        r: highlightBox.radiusEm * size,
        s: h.s,
      });
    }
    return {text: ln.text, s: ln.s, baseline: baselines[i], boxes};
  });
  return {size, lines};
}

const Block: React.FC<{beat: CaptionBeat; T: number; dy: number; baseSize: number; instantUntil: number; color: string; hlColor: string}> = ({beat, T, dy, baseSize, instantUntil, color, hlColor}) => {
  const {size, lines} = layoutBeat(beat, baseSize);
  return (
    <g transform={dy ? `translate(0 ${dy.toFixed(2)})` : undefined}>
      {lines.map((ln, i) => {
        const rolls = i > 0 && ln.s > beat.s + 0.04 && ln.s > instantUntil;
        if (rolls && T < ln.s) return null;
        const ldy = rolls ? LINE_RISE * (1 - riseEase(prog(T, ln.s, RISE_DUR))) : 0;
        return (
          <g key={i} transform={ldy > 0.01 ? `translate(0 ${ldy.toFixed(2)})` : undefined}>
            {ln.boxes.map((bx, j) => {
              const p = bx.s <= instantUntil ? 1 : hlEase(prog(T, bx.s + 0.02, 0.2 + bx.w / 3000));
              if (p <= 0) return null;
              return <rect key={j} x={bx.x} y={bx.y} width={bx.w * p} height={bx.h} rx={Math.min(bx.r, (bx.w * p) / 2)} fill={hlColor} />;
            })}
            <text
              x={card.w / 2}
              y={ln.baseline}
              textAnchor="middle"
              fontFamily={captionFontStack}
              fontSize={size}
              fontWeight={typeTok.weight}
              fill={color}
              style={{fontKerning: 'normal', fontVariantLigatures: 'common-ligatures contextual', letterSpacing: typeTok.letterSpacing}}
            >
              {ln.text}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const Captions: React.FC<CaptionsProps> = ({beats, range, carry = true, instantWithin = 0.35, size = typeTok.size, color = typeTok.color, highlightColor = palette.highlight}) => {
  const T = useGlobalTime();
  const fontOk = useCaptionFont();
  const id = 'cap' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const sorted = beats.slice().sort((a, b) => a.s - b.s);
  let list = range ? sorted.filter((b) => b.s >= range[0] && b.s < range[1]) : sorted;
  if (range && carry && isFinite(range[0])) {
    const prev = sorted.filter((b) => b.s < range[0]).pop();
    if (prev) list = [prev, ...list];
  }
  const instantUntil = Math.max(range && isFinite(range[0]) ? range[0] + instantWithin : -Infinity, 0.05);
  let k = -1;
  for (let i = 0; i < list.length; i++) if (list[i].s <= T) k = i;
  if (k < 0) return null;
  const cur = list[k];
  const prev = k > 0 ? list[k - 1] : null;
  const instant = cur.s <= instantUntil;
  const u = prog(T, cur.s, RISE_DUR);
  const curDy = instant ? 0 : PAGE_RISE * (1 - riseEase(u));
  const prevDy = prev && !instant && T - cur.s < OUT_DUR ? -OUT_DIST * E.inSine(prog(T, cur.s, OUT_DUR)) : null;
  const common = {T, baseSize: size, instantUntil, color, hlColor: highlightColor};
  return (
    <svg width={card.w} height={card.h} viewBox={`0 0 ${card.w} ${card.h}`} style={{position: 'absolute', left: 0, top: 0, visibility: fontOk ? undefined : 'hidden'}}>
      <defs>
        <clipPath id={id}>
          <rect x={0} y={typeTok.clip.top} width={card.w} height={typeTok.clip.bottom - typeTok.clip.top} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {prev && prevDy !== null ? <Block key={`b${k - 1}`} beat={prev} dy={prevDy} {...common} /> : null}
        <Block key={`b${k}`} beat={cur} dy={curDy} {...common} />
      </g>
    </svg>
  );
};

// =====================================================================================================================
// SkyCaptions (v2, full-bleed): captions in the SKY, screen space, calibrated to docs/motion_spec.md section 4.
//  - Patrick Hand theme skyCaption.size (98 px) centred on skyCaption.cx; baselines skyCaption.line1 / line2 (387 / 510);
//    a one-line page sits at skyCaption.oneLine; lines wider than skyCaption.maxWidth shrink the page's font.
//  - PAGE CHANGE: the whole stack scrolls up by (clip height + 20) in 0.45 s, cubic-bezier(0, 0.7, 0.12, 1); the old
//    page is gone in 2-3 frames, the new one decelerates into place. Starts 0.04 s before the page's first word.
//  - LINE 2 rises ~1.15 line pitches from below the window in 0.42 s (same curve), 0.08 s before its first word.
//  - HIGHLIGHT: peach box (theme skyHighlightBox: reference 2's square box, 0.19 em padding both sides, ascenders and
//    trailing punctuation inside) wipes L->R, bezier(0.3, 0.3, 0.1, 1), 0.19 s + 0.3 ms/px, 0.10 s before its word; it
//    scrolls with its line and never wipes out. The word stays ink on the box in both tones.
//  - TONE: 'dark' = ink text (light skies), 'light' = white text (dusk / night skies). Switches in one frame, or
//    SPATIALLY: `split` (one vertical edge, e.g. a wipe) or `regions` (any rects / paths, painted in order) render the
//    text once per region, clipped, so the colour flips exactly at a wipe edge or over a dark foreground element.
//  - No opacity, no scale, no blur. Before the first page starts, the first page shows settled (the hook frame).
//  - capcheck: with input prop {capcheck: 'mask'} it draws a black frame with code colours (dark-tone text #FF0000,
//    light-tone text #00FF00, highlight boxes #0000FF) for scripts/capcheck.mjs; {capcheck: 'bg'} hides captions.
// Data times are WORD STARTS (src/data/captions.json, generated from assets/timing.json); the leads are applied here.
//
//   <SkyCaptions beats={captions} tone={(T) => (T > 50 ? 'light' : 'dark')} loopAt={70.4} />
//   <SkyCaptions beats={captions} split={{x: (T) => wipeEdge(T), left: 'light', right: 'dark'}} />

/** A screen-space tone region: a rect [x0, y0, x1, y1] or a path `d` (with an optional SVG transform). */
export type ToneRegion = {tone: CaptionTone; rect?: [number, number, number, number]; d?: string; transform?: string};
export type ToneSplit = {x: (T: number) => number; left: CaptionTone; right: CaptionTone};

export type SkyCaptionsProps = {
  beats: CaptionBeat[];
  /** Tone now: fixed, or a function of timeline seconds. Default 'dark'. */
  tone?: CaptionTone | ((T: number) => CaptionTone);
  /** Two tones split at a vertical screen edge x(T) (a wipe): left of it `left`, right of it `right`. Applied while
   *  0 < x(T) < 1080; otherwise the side that covers the frame wins. */
  split?: ToneSplit;
  /** Tone regions now (painted in order: later regions win where they overlap). null / [] = use `tone`. */
  regions?: (T: number) => ToneRegion[] | null | undefined;
  /** Only beats starting in [from, to) (+ the one active at `from`, shown settled). Scene previews. */
  range?: [number, number];
  /** Before the first page starts, show it settled (frame 0 = hook). Default true. */
  hookAtStart?: boolean;
  /** At this timeline time the stack scrolls to the FIRST page (line 1) so the end loops into frame 0. */
  loopAt?: number;
  /** Things that started before range[0] + this are shown settled (no roll). Default 0.35 s. */
  instantWithin?: number;
  size?: number;
  /** Override theme skyCaption.motion: 'scroll' (reference 1, measured) or 'pop' (reference 2: 1-frame pops). */
  motion?: 'scroll' | 'pop';
};

/** Caption-check render mode from the input props ({capcheck: 'mask' | 'bg'}), null in normal renders. */
export function capcheckMode(): 'mask' | 'bg' | null {
  try {
    const p = getInputProps() as {capcheck?: unknown} | undefined;
    return p && (p.capcheck === 'mask' || p.capcheck === 'bg') ? p.capcheck : null;
  } catch {
    return null;
  }
}
/** Mask code colours (scripts/capcheck.py reads them). */
export const CAPCHECK_COLORS = {dark: '#FF0000', light: '#00FF00', box: '#0000FF'} as const;

/** WCAG relative luminance of a #RRGGBB colour. */
export function luminance(hex: string): number {
  const v = hex.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
/** WCAG contrast ratio of two colours. */
export const contrast = (a: string, b: string) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
/** The caption tone that reads best on a flat background colour. */
export const toneOn = (bg: string): CaptionTone => (contrast(captionTones.dark.text, bg) >= contrast(captionTones.light.text, bg) ? 'dark' : 'light');

/** Regions for a vertical split at x. */
export function splitRegions(x: number, left: CaptionTone, right: CaptionTone): ToneRegion[] {
  if (x <= 0) return [{tone: right}];
  if (x >= 1080) return [{tone: left}];
  return [
    {tone: left, rect: [-200, -200, x, 2200]},
    {tone: right, rect: [x, -200, 1300, 2200]},
  ];
}

type SkyLine = {text: string; start: number; baseline: number; boxes: (Box & {start: number; dur: number})[]};
type SkyPage = {start: number; size: number; lines: SkyLine[]};

const SKY_D = skyCaption.clipBottom - skyCaption.clipTop + 20;
const PUNCT = /[.,!?;:…]/;

function layoutSky(b: CaptionBeat, baseSize: number): SkyPage {
  const n = b.lines.length;
  const style = b.style ?? 'normal';
  let size = baseSize * (style === 'punch' ? typeTok.punchScale : style === 'hook' ? typeTok.hookScale : 1);
  const widest = Math.max(1, ...b.lines.map((l) => measureCaption(l.text, size)));
  if (widest > skyCaption.maxWidth) size = Math.floor((size * skyCaption.maxWidth) / widest);
  const pitch = (skyCaption.line2 - skyCaption.line1) * (size / baseSize);
  const mid = skyCaption.oneLine;
  const baselines = n === 1 ? [mid] : b.lines.map((_, i) => (style === 'normal' && n === 2 ? [skyCaption.line1, skyCaption.line2][i] : mid - ((n - 1) * pitch) / 2 + i * pitch));
  const pageStart = b.s - MOTION.captionScroll.lead;
  const used = new Set<CaptionHighlight>();
  const cx = skyCaption.cx;
  const HB = skyHighlightBox;
  const lines: SkyLine[] = b.lines.map((ln, i) => {
    const lineStart = i === 0 || ln.s <= b.s + 0.04 ? pageStart : Math.max(pageStart, ln.s - MOTION.captionLine2.lead);
    const boxes: SkyLine['boxes'] = [];
    const lw = measureCaption(ln.text, size);
    for (const h of b.highlights ?? []) {
      if (used.has(h) || !h.text) continue;
      const want = h.text.replace(TRAILING, '');
      let idx = ln.text.indexOf(want);
      if (idx < 0) idx = ln.text.toLowerCase().indexOf(want.toLowerCase());
      if (idx < 0 || !want) continue;
      used.add(h);
      // reference 2 boxes include trailing punctuation ('asking.', 'cool.', 'jobs,')
      let end = idx + want.length;
      if (HB.includePunct) while (end < ln.text.length && PUNCT.test(ln.text[end])) end++;
      const x0 = cx - lw / 2 + measureCaption(ln.text.slice(0, idx), size);
      const x1 = x0 + measureCaption(ln.text.slice(idx, end), size);
      const pad = HB.padEm * size;
      const w = x1 - x0 + 2 * pad;
      boxes.push({
        x: x0 - pad,
        y: baselines[i] - HB.topEm * size,
        w,
        h: (HB.topEm + HB.bottomEm) * size,
        r: HB.radiusEm * size,
        s: h.s,
        start: Math.max(lineStart, h.s - MOTION.highlight.lead),
        dur: highlightDur(w),
      });
    }
    return {text: ln.text, start: lineStart, baseline: baselines[i], boxes};
  });
  return {start: pageStart, size, lines};
}

const textStyle: React.CSSProperties = {fontKerning: 'normal', fontVariantLigatures: 'common-ligatures contextual', letterSpacing: typeTok.letterSpacing};

type ToneCols = {text: string; highlight: string; highlightText: string};
const toneCols = (tone: CaptionTone, mask: boolean): ToneCols =>
  mask ? {text: CAPCHECK_COLORS[tone], highlight: CAPCHECK_COLORS.box, highlightText: CAPCHECK_COLORS.box} : captionTones[tone];

const SkyPageG: React.FC<{page: SkyPage; T: number; dy: number; instantUntil: number; col: ToneCols; uid: string; pop?: boolean}> = ({page, T, dy, instantUntil, col, uid, pop}) => {
  const pitch = (skyCaption.line2 - skyCaption.line1) * (page.size / skyCaption.size);
  return (
    <g transform={dy ? `translate(0 ${dy.toFixed(2)})` : undefined}>
      {page.lines.map((ln, i) => {
        const settled = ln.start <= instantUntil;
        if (!settled && T < ln.start) return null;
        const rises = i > 0 && ln.start > page.start + 0.001;
        const ldy = rises && !settled && !pop ? pitch * MOTION.captionLine2.pitch * (1 - MOTION.captionLine2.ease(clamp((T - ln.start) / MOTION.captionLine2.dur))) : 0;
        const boxes = ln.boxes
          .map((bx) => ({bx, p: bx.start <= instantUntil ? 1 : pop ? (T >= bx.start ? 1 : 0) : MOTION.highlight.ease(clamp((T - bx.start) / bx.dur))}))
          .filter(({p}) => p > 0);
        const needsInk = boxes.length > 0 && col.text !== col.highlightText;
        const textEl = (fill: string, clip?: string) => (
          <text x={skyCaption.cx} y={ln.baseline} textAnchor="middle" fontFamily={captionFontStack} fontSize={page.size} fontWeight={typeTok.weight} fill={fill} clipPath={clip} style={textStyle}>
            {ln.text}
          </text>
        );
        const cid = `${uid}l${i}`;
        return (
          <g key={i} transform={ldy > 0.01 ? `translate(0 ${ldy.toFixed(2)})` : undefined}>
            {boxes.map(({bx, p}, j) => (
              <rect key={j} x={bx.x} y={bx.y} width={bx.w * p} height={bx.h} rx={Math.min(bx.r, (bx.w * p) / 2)} fill={col.highlight} />
            ))}
            {needsInk ? (
              <defs>
                <clipPath id={`${cid}in`}>
                  {boxes.map(({bx, p}, j) => (
                    <rect key={j} x={bx.x} y={bx.y} width={bx.w * p} height={bx.h} />
                  ))}
                </clipPath>
                <clipPath id={`${cid}out`}>
                  <path clipRule="evenodd" d={`M-10 -10H1090V1930H-10Z` + boxes.map(({bx, p}) => `M${bx.x} ${bx.y}h${bx.w * p}v${bx.h}h${-bx.w * p}Z`).join('')} />
                </clipPath>
              </defs>
            ) : null}
            {textEl(col.text, needsInk ? `url(#${cid}out)` : undefined)}
            {needsInk ? textEl(col.highlightText, `url(#${cid}in)`) : null}
          </g>
        );
      })}
    </g>
  );
};

export const SkyCaptions: React.FC<SkyCaptionsProps> = ({beats, tone = 'dark', split, regions, range, hookAtStart = true, loopAt, instantWithin = 0.35, size = skyCaption.size, motion = skyCaption.motion}) => {
  const pop = motion === 'pop';
  const T = useGlobalTime();
  const fontOk = useCaptionFont();
  const uid = 'sc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const mode = capcheckMode();
  if (mode === 'bg') return null;
  const mask = mode === 'mask';
  const sorted = beats.slice().sort((a, b) => a.s - b.s);
  let list = range ? sorted.filter((b) => b.s >= range[0] && b.s < range[1]) : sorted.slice();
  if (range && isFinite(range[0])) {
    const prev = sorted.filter((b) => b.s < range[0]).pop();
    if (prev) list = [prev, ...list];
  }
  if (loopAt !== undefined && sorted.length) {
    const first = sorted[0];
    const l1 = first.lines[0];
    const hl = (first.highlights ?? []).filter((h) => l1 && l1.text.toLowerCase().includes(h.text.replace(TRAILING, '').toLowerCase()) && h.s <= (first.lines[1]?.s ?? Infinity));
    list = list.filter((b) => b.s < loopAt + MOTION.captionScroll.lead);
    list.push({...first, s: loopAt + MOTION.captionScroll.lead, lines: l1 ? [{text: l1.text, s: loopAt}] : [], highlights: hl.map((h) => ({...h, s: loopAt}))});
  }
  if (!list.length) return null;
  const pages = list.map((b) => layoutSky(b, size));
  const instantUntil = range && isFinite(range[0]) ? range[0] + instantWithin : -Infinity;
  let k = -1;
  for (let i = 0; i < pages.length; i++) if (pages[i].start <= T) k = i;
  let settledAll = false;
  if (k < 0) {
    if (!hookAtStart) return null;
    k = 0;
    settledAll = true;
  }
  const cur = pages[k];
  const prev = k > 0 ? pages[k - 1] : null;
  // the first page never scrolls in when it is the hook (it is already on screen at frame 0)
  const instant = pop || settledAll || cur.start <= instantUntil || (hookAtStart && k === 0);
  const u = clamp((T - cur.start) / MOTION.captionScroll.dur);
  const q = instant ? 1 : MOTION.captionScroll.ease(u);
  const tn: CaptionTone = typeof tone === 'function' ? tone(T) : tone;
  // the hook frame: the first page's line 1 shows settled before anything starts; later lines/boxes keep their times
  const iu = settledAll || (hookAtStart && k === 0) ? Math.max(instantUntil, cur.start) : instantUntil;
  const regs = (regions ? regions(T) : null) ?? (split ? splitRegions(split.x(T), split.left, split.right) : null);
  const stack = (t: CaptionTone, sfx: string) => (
    <>
      {prev && !instant && u < 1 ? <SkyPageG key={`p${k - 1}`} page={prev} T={T} dy={-SKY_D * q} instantUntil={iu} col={toneCols(t, mask)} uid={`${uid}${sfx}a`} pop={pop} /> : null}
      <SkyPageG key={`p${k}`} page={cur} T={settledAll ? Math.max(T, cur.start) : T} dy={SKY_D * (1 - q)} instantUntil={iu} col={toneCols(t, mask)} uid={`${uid}${sfx}b`} pop={pop} />
    </>
  );
  const body =
    regs && regs.length > 1 ? (
      regs.map((r, i) =>
        r.rect || r.d ? (
          <React.Fragment key={i}>
            <defs>
              <clipPath id={`${uid}g${i}`} clipPathUnits="userSpaceOnUse">
                {r.rect ? <rect x={r.rect[0]} y={r.rect[1]} width={Math.max(0, r.rect[2] - r.rect[0])} height={Math.max(0, r.rect[3] - r.rect[1])} transform={r.transform} /> : <path d={r.d} transform={r.transform} />}
              </clipPath>
            </defs>
            <g clipPath={`url(#${uid}g${i})`}>{stack(r.tone, `r${i}`)}</g>
          </React.Fragment>
        ) : (
          <React.Fragment key={i}>{stack(r.tone, `r${i}`)}</React.Fragment>
        ),
      )
    ) : (
      stack(regs && regs.length === 1 ? regs[0].tone : tn, '')
    );
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, visibility: fontOk ? undefined : 'hidden'}}>
      {mask ? <rect x={0} y={0} width={1080} height={1920} fill="#000000" /> : null}
      <defs>
        <clipPath id={uid}>
          <rect x={0} y={skyCaption.clipTop} width={1080} height={skyCaption.clipBottom - skyCaption.clipTop} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid})`}>{body}</g>
    </svg>
  );
};
