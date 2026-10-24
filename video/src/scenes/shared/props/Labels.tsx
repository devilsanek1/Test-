// props/Labels.tsx — on-screen LABELS (storyboard v3 labelStyle): small, legible, in-world paper carrying the source
// notes (never voiced, never captions). CaptionHand (Patrick Hand) 28-40 px ON SCREEN, ink on cream paper, 2.2 px ink
// outline, the fill misregistered ~3 px (screen space), slightly soft corners, an attachment (string / pin / clip / tape /
// A-frame legs / the stamp's slam ring).
//
//   <LabelTag kind="tag" x={385} y={1150} text={['in the code since', 'at least 2012']} at={15.39} />      // hangs from (x, y)
//   <LabelTag kind="card" box={[215, 700, 540, 745]} text="PHP2Shell · two linked flaws" at={5.78} />   // pinned card
//   <LabelTag kind="card" box={[490, 1320, 910, 1440]} text={L3} at={9.26} flipTo={{at: 12.51, text: L4}} />
//   <LabelTag kind="card" box={[215, 1100, 600, 1185]} text={L2} at={6.57} leader={[700, 1150]} />     // short leader
//   <LabelTag kind="slip" box={[205, 688, 650, 760]} text={L6} at={18.11} />                             // clipped slip
//   <LabelTag kind="notice" x={300} y={1080} text={['FBI · NSA', 'UK NCSC · CERT-EU']} at={46.2} />      // 4 tape strips
//   <LabelTag kind="sign" box={[125, 1262, 445, 1462]} fontSize={30} text={L13} at={41.0} />             // A-frame board
//   <LabelTag kind="stamp" x={640} y={1180} text="millions · within a day" at={32.9} />                 // slams
//
// Anchor: `box` = [x0, y0, x1, y1] = the PAPER (the storyboard's label box; for `sign` the board face, its legs stand
// below it). Without a box: (x, y) = the paper CENTRE, except `tag` (the HANG point: the string's top, the tag hangs
// below it) and `sign` (the GROUND point under the board). w / h fix the paper size; by default it fits the text.
// Text: `text` (string, '\n' or ' / ' NOT split: pass an array for lines) or `lines`. fontSize in WORLD px (default
// 36 / 30 sign / 34 stamp): the label is in the world and scales with the camera, so divide the on-screen target by the
// zoom. With a box the font shrinks (never grows) to fit it.
// Motion: `at` pops in with the 7 % spring (0.2 s) about the attachment; tags (and `swing`) add the pendulum -16 -> 0
// (0.5 s); stamps SLAM (ink ring 0.13 s, then the print 2.6 x -> 1.0 x in 0.27 s); `flipTo` paper-flips to new text (0.2 s,
// swap at edge-on); `swing={t | [t..]}` swings it again (a tap); `outAt` = a 1-frame shrink pop (outMode 'unbuild' =
// the measured un-build). Never a fade. Paper Look: white paper, ink text and outline (a label reads in line art).
//
// Also here: StickyNote (S11), Sticker (S03), CheckBoxTag + CheckBoxTags (S09, batched) and SupportTag (S10).

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../../lib/time';
import {rand, Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitFade, UnBuild, useLook} from '../../../lib/exit';
import {captionFontStack, measureCaption, useCaptionFont} from '../../../lib/font';
import {circle, line, poly, Pt, rect, rectPath, roundRect} from '../../../lib/sketch';
import {mat, Mat, XG} from '../../../lib/xf';
import {Depth, DEPTH_INK, pendulum, usePropFrame} from './common';
import {ElephantEmblem} from './Elephant';

// ---------------------------------------------------------------- shared text layout

export type LabelKind = 'tag' | 'card' | 'slip' | 'notice' | 'sign' | 'stamp';
export type LabelText = string | string[];
export type LabelFlip = {at: number; text: LabelText; fontSize?: number};

/** Patrick Hand metrics (em): cap 0.67, descender ~0.3, line pitch 1.12 for small multi-line labels. */
const PITCH = 1.12;
const CAP = 0.7;
const DESC = 0.26;

export const labelLines = (t: LabelText | undefined): string[] => (t === undefined ? [] : Array.isArray(t) ? t : t.split('\n'));

export type TextLayout = {fs: number; w: number; h: number; lines: string[]; widths: number[]; base0: number; padX: number; pitch?: number};

/** Lay out lines at font size fs inside paper padding (padX, padTop, padBot in em). With `box` [w, h] the font shrinks
 *  to fit and the block is centred vertically in it. */
export function layoutText(lines: string[], fs: number, pad: {x: number; top: number; bot: number; pitch?: number}, box?: [number, number]): TextLayout {
  const raw = lines.map((l) => measureCaption(l, 100) / 100);
  const m = Math.max(0.5, ...raw);
  const n = Math.max(1, lines.length);
  const pitch = pad.pitch ?? PITCH;
  const blockEm = (n - 1) * pitch + CAP + DESC;
  let f = fs;
  if (box) {
    f = Math.min(fs, box[0] / (m + 2 * pad.x), box[1] / (blockEm + pad.top + pad.bot));
    f = Math.max(f, fs * 0.5);
  }
  const w = box ? box[0] : f * (m + 2 * pad.x);
  const h = box ? box[1] : f * (blockEm + pad.top + pad.bot);
  // centre the block in the space left after the top pad (keeps the attachment's room at the top)
  const free = h - f * (pad.top + pad.bot + blockEm);
  const base0 = f * (pad.top + CAP) + Math.max(0, free) / 2;
  return {fs: f, w, h, lines, widths: raw.map((r) => r * f), base0, padX: pad.x * f, pitch};
}

/** Ink text block (CaptionHand) laid out by `layoutText`, at local (0, 0) = the block's paper top-left. Hairline
 *  placeholders below 7 px on screen; hidden in the fills-only Look; shrinks with the un-build. */
export const InkTextBlock: React.FC<{L: TextLayout; align: 'center' | 'left'; color: string; k: number; seed: Seed; strike?: {line: number; from: number; to: number; p: number; width: number}}> = ({L, align, color, k, seed, strike}) => {
  const look = useLook();
  if (!look.ink) return null;
  const onScreen = L.fs * k;
  if (onScreen < 7) {
    let d = '';
    L.lines.forEach((ln, i) => {
      const lw = L.widths[i] * 0.92;
      const x0 = align === 'center' ? (L.w - lw) / 2 : L.padX;
      const y = L.base0 + i * (L.pitch ?? PITCH) * L.fs - L.fs * 0.25;
      d += `M${x0.toFixed(1)} ${y.toFixed(1)}h${lw.toFixed(1)}`;
    });
    return <path d={d} stroke={color} strokeWidth={Math.max(0.6, L.fs * 0.14)} strokeLinecap="round" fill="none" />;
  }
  const x = align === 'center' ? L.w / 2 : L.padX;
  return (
    <ExitFade x={L.w / 2} y={L.h / 2}>
      {L.lines.map((ln, i) => (
        <text key={i} x={x} y={L.base0 + i * (L.pitch ?? PITCH) * L.fs} fontFamily={captionFontStack} fontSize={L.fs} fill={color} textAnchor={align === 'center' ? 'middle' : 'start'}>
          {ln}
        </text>
      ))}
      {strike && strike.p > 0 ? (
        <path
          d={`M${strike.from.toFixed(1)} ${(L.base0 + strike.line * (L.pitch ?? PITCH) * L.fs - L.fs * 0.27).toFixed(1)}L${lerp(strike.from, strike.to, strike.p).toFixed(1)} ${(L.base0 + strike.line * (L.pitch ?? PITCH) * L.fs - L.fs * 0.3 + strike.p * L.fs * 0.03).toFixed(1)}`}
          stroke={color}
          strokeWidth={strike.width}
          strokeLinecap="round"
          fill="none"
        />
      ) : null}
    </ExitFade>
  );
};

// ---------------------------------------------------------------- LabelTag

export type LabelTagProps = {
  /** tag (string) | card (pin) | slip (clip) | notice (4 tape strips) | sign (A-frame) | stamp. `variant` / `type` are
   *  accepted aliases. Default 'card'. */
  kind?: LabelKind;
  variant?: LabelKind;
  type?: LabelKind;
  /** Alias of `kind` (scene shims). */
  style?: LabelKind;
  /** The text: a string or one string per line. `lines` is an alias. */
  text?: LabelText;
  lines?: string[];
  /** Anchor (see the file header): paper centre; tag = hang point; sign = ground point. */
  x?: number;
  y?: number;
  /** The paper rect [x0, y0, x1, y1] (sign: the board face). Overrides x / y / w / h. */
  box?: [number, number, number, number];
  w?: number;
  h?: number;
  /** Font size in WORLD px (on screen = x camera zoom). Default 36 (sign 30, stamp 34). `size` is an alias. */
  fontSize?: number;
  size?: number;
  align?: 'center' | 'left';
  /** Pop in (7 % spring) about the attachment; omit = already there. */
  at?: number;
  /** Out: a 1-frame shrink pop (default) or the measured un-build (outMode 'unbuild', outDur 0.5). */
  outAt?: number;
  outMode?: 'pop' | 'unbuild';
  outDur?: number;
  /** Paper flip to new text (0.2 s, the swap at edge-on): {at, text} (or several), or text + `flipAt`. */
  flipTo?: LabelText | LabelFlip | LabelFlip[];
  flipAt?: number;
  /** true = the pendulum on entry (default for 'tag'); a time / times = swing again (a tap); false = never. */
  swing?: boolean | number | number[];
  /** Static tilt in degrees (default: a small seeded tilt; tags hang straight, stamps -3.5). `tilt` = alias. */
  rot?: number;
  tilt?: number;
  /** tag: the string's top (default: (x, y), or 0.5 em above the box). */
  hang?: [number, number];
  /** A short ink leader from the paper edge to a point (draws on 0.12 s after the pop), with a dot at the end. */
  leader?: [number, number] | {to: [number, number]; at?: number};
  /** Paper colour (default cream). `color` = alias. */
  paper?: string;
  color?: string;
  textColor?: string;
  depth?: Depth;
  /** Outline width in world px (default 2.2: the labelStyle outline). */
  ink?: number;
  /** Outline width in SCREEN px (divided by the accumulated camera scale, so a push keeps the pen). Overrides `ink`. */
  inkPx?: number;
  /** notice: the tape strips pop one after another this far apart, after the paper (default 0.04 s). */
  tapeStagger?: number;
  /** sign: leg length below the board (default 0.32 x board height); frame={false} = paper only (the set draws it). */
  legH?: number;
  frame?: boolean;
  seed?: Seed;
};

const DEF_FS: Record<LabelKind, number> = {tag: 36, card: 36, slip: 36, notice: 36, sign: 30, stamp: 34};
const PAD: Record<LabelKind, {x: number; top: number; bot: number}> = {
  tag: {x: 0.42, top: 0.62, bot: 0.3},
  card: {x: 0.42, top: 0.42, bot: 0.3},
  slip: {x: 0.42, top: 0.4, bot: 0.28},
  notice: {x: 0.48, top: 0.4, bot: 0.32},
  sign: {x: 0.62, top: 0.5, bot: 0.45},
  stamp: {x: 0.42, top: 0.3, bot: 0.24},
};

const flipsOf = (p: LabelTagProps): LabelFlip[] => {
  const f = p.flipTo;
  if (f === undefined) return [];
  if (typeof f === 'string' || (Array.isArray(f) && (f.length === 0 || typeof f[0] === 'string'))) {
    return p.flipAt === undefined ? [] : [{at: p.flipAt, text: f as LabelText}];
  }
  const arr = Array.isArray(f) ? (f as LabelFlip[]) : [f as LabelFlip];
  return [...arr].sort((a, b) => a.at - b.at);
};

/** The paper shape (local: 0..w x 0..h) per kind: fill path + ink path. */
function paperPaths(kind: LabelKind, w: number, h: number, fs: number, seed: Seed): {fill: string; ink: string} {
  if (kind === 'tag') {
    const c = Math.min(h * 0.24, w * 0.14, fs * 0.42);
    const pts: Pt[] = [
      [c, 0],
      [w - c, 0],
      [w, c],
      [w, h],
      [0, h],
      [0, c],
    ];
    return {fill: poly(pts, {closed: true, joined: true, jitter: 0.4, seed: `${seed}/pf`}) + 'Z', ink: poly(pts, {closed: true, over: 2.5, seed: `${seed}/pi`})};
  }
  if (kind === 'card' || kind === 'sign') {
    const r = Math.min(5, fs * 0.14);
    return {fill: roundRect(0, 0, w, h, r, {seed: `${seed}/pf`}), ink: roundRect(0, 0, w, h, r, {seed: `${seed}/pi`, closed: false})};
  }
  if (kind === 'stamp') {
    const r = Math.min(6, fs * 0.18);
    return {fill: roundRect(0, 0, w, h, r, {seed: `${seed}/pf`}), ink: roundRect(0, 0, w, h, r, {seed: `${seed}/pi`, closed: false})};
  }
  // slip / notice: a plain sheet, the slip a hair trapezoid (torn from a pad)
  const sk = kind === 'slip' ? Math.min(3, w * 0.01) : 0;
  const pts: Pt[] = [
    [0, 0],
    [w, sk],
    [w - sk * 0.5, h],
    [sk * 0.4, h - sk * 0.6],
  ];
  return {fill: poly(pts, {closed: true, joined: true, jitter: 0.3, seed: `${seed}/pf`}) + 'Z', ink: rect(0, 0, w, h, {seed: `${seed}/pi`, over: 3})};
}

const springPop = (t: number, at: number | undefined) => (at === undefined ? 1 : t < at ? 0 : springAt(t, at, springs.pop));

/** Stamp slam scale (motion spec #15): hidden before at, the ring strokes on 0.13 s, then the print 2.6 x -> 1.0 x in 0.27 s. */
export const slamScale = (t: number, at: number | undefined): number => (at === undefined ? 1 : t < at + 0.13 ? 0 : lerp(2.6, 1, E.inOutCubic(prog(t, at + 0.13, 0.27))));

const LabelTagInner: React.FC<LabelTagProps & {t: number}> = (p) => {
  const {t} = p;
  const kind: LabelKind = p.kind ?? p.variant ?? p.type ?? p.style ?? 'card';
  const seed = p.seed ?? `label/${kind}/${labelLines(p.text ?? p.lines).join('|')}`;
  const F = usePropFrame({depth: p.depth, ink: p.ink ?? (p.depth ? undefined : 2.2), seed, defDepth: 'far'});
  const look = useLook();
  const W = p.inkPx !== undefined ? p.inkPx / F.k : F.W;
  const fs0 = p.fontSize ?? p.size ?? DEF_FS[kind];
  const align = p.align ?? 'center';
  const paperCol = p.paper ?? p.color ?? palette.cream;
  const textCol = p.textColor ?? palette.ink;
  const pad = PAD[kind];

  // current text (flips swap at the edge-on, 0.1 s into the 0.2 s flip)
  const flips = flipsOf(p);
  let lines = labelLines(p.text ?? p.lines);
  let fs = fs0;
  let flipX = 1;
  for (const f of flips) {
    if (t >= f.at + 0.1) {
      lines = labelLines(f.text);
      fs = f.fontSize ?? fs;
    }
    if (t >= f.at && t < f.at + 0.2) flipX = Math.max(0.03, Math.abs(Math.cos(Math.PI * prog(t, f.at, 0.2))));
  }

  // paper rect + layout
  const legRatio = 0.32;
  let L: TextLayout;
  let px: number;
  let py: number;
  if (p.box) {
    const [x0, y0, x1, y1] = p.box;
    L = layoutText(lines, fs, pad, [x1 - x0, y1 - y0]);
    px = x0;
    py = y0;
  } else {
    L = layoutText(lines, fs, pad, p.w !== undefined || p.h !== undefined ? [p.w ?? layoutText(lines, fs, pad).w, p.h ?? layoutText(lines, fs, pad).h] : undefined);
    const x = p.x ?? 0;
    const y = p.y ?? 0;
    px = x - L.w / 2;
    if (kind === 'tag') py = y + fs * 0.5;
    else if (kind === 'sign') py = y - (p.legH ?? L.h * legRatio) - L.h;
    else py = y - L.h / 2;
  }
  const w = L.w;
  const h = L.h;
  const cx = px + w / 2;
  const legH = p.legH ?? h * legRatio;

  // the attachment point (pivot of the pop and the swing)
  const hang: Pt = p.hang ?? (p.box || p.x === undefined ? [cx, py - fs * 0.5] : [p.x ?? cx, p.y ?? py]);
  const pivot: Pt =
    kind === 'tag' ? hang : kind === 'card' ? [cx, py + fs * 0.22] : kind === 'slip' ? [px + w * 0.24, py] : kind === 'sign' ? [cx, py + h + legH] : [cx, py + h / 2];

  // motion
  const swingOn = p.swing === undefined ? kind === 'tag' : p.swing === true;
  const taps = typeof p.swing === 'number' ? [p.swing] : Array.isArray(p.swing) ? p.swing : [];
  let ang = (p.rot ?? p.tilt ?? (kind === 'tag' || kind === 'sign' ? 0 : kind === 'stamp' ? -3.5 + (rand(seed, 'tilt') - 0.5) * 2 : (rand(seed, 'tilt') - 0.5) * 2.4));
  if (swingOn && p.at !== undefined) ang += pendulum(t, p.at, -16, 0.5, 0.8);
  for (const tp of taps) ang += pendulum(t, tp, 12, 0.5, 0.9);
  let k = kind === 'stamp' ? slamScale(t, p.at) : springPop(t, p.at);
  if (p.outAt !== undefined && (p.outMode ?? 'pop') === 'pop' && t >= p.outAt) k *= 0.72;
  if (k <= 0.001) {
    if (kind === 'stamp' && p.at !== undefined && t >= p.at) {
      // the slam ring strokes on before the print lands
      const rr = paperPaths('stamp', w + fs * 0.24, h + fs * 0.24, fs, `${seed}/ring`);
      return (
        <XG m={mat.compose(mat.translate(px - fs * 0.12, py - fs * 0.12), mat.about(mat.rotate(ang), w / 2 + fs * 0.12, h / 2 + fs * 0.12))}>
          <Ink d={rr.ink} at={p.at} dur={0.13} width={W * 1.2} color={textCol} taper={false} seed={`${seed}/ring`} />
        </XG>
      );
    }
    return null;
  }

  // the paper in local coordinates (0, 0 = paper top-left), then: flip about the centre x, rotate + pop about the pivot
  const lp: Pt = [pivot[0] - px, pivot[1] - py];
  const m: Mat = mat.compose(mat.translate(px, py), mat.about(mat.rotate(ang), lp[0], lp[1]), mat.about(mat.scale(k), lp[0], lp[1]), mat.about(mat.scale(flipX, 1), w / 2, 0));
  const P = paperPaths(kind, w, h, fs, seed);
  const off = F.off;
  const parts: React.ReactNode[] = [];

  // attachment behind / under the paper
  if (kind === 'tag') {
    const er = Math.max(2.5, Math.min(7, fs * 0.13));
    const ey = Math.max(er + 3, fs * 0.36);
    const hx = hang[0] - px;
    const hy = hang[1] - py;
    parts.push(<Ink key="str" d={line(w / 2, ey - er * 0.6, hx, hy, {over: [0, 0], seed: `${seed}/str`, drift: 0.4})} width={W * 0.6} taper={false} seed={`${seed}/str`} />);
    parts.push(<Fill key="pf" d={P.fill} color={paperCol} offset={off} seed={`${seed}/pf`} />);
    parts.push(<Ink key="pi" d={P.ink} width={W} taper={false} seed={`${seed}/pi`} />);
    parts.push(<Fill key="ey" d={circle(w / 2, ey, er * 1.55, {seed: `${seed}/eyf`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/eyf`} />);
    parts.push(<Ink key="eyi" d={circle(w / 2, ey, er, {seed: `${seed}/eyi`, overlap: 10})} width={W * 0.7} taper={false} seed={`${seed}/eyi`} />);
  } else if (kind === 'sign') {
    if (p.frame !== false) {
      // a sandwich-board A-frame seen from the front: a slightly tapered teal frame whose side rails run on down to the
      // ground as the legs (splaying with the taper), a crossbar under the face and a handle slot on top
      const fw = Math.max(8, fs * 0.42);
      const tp = Math.min(w * 0.04, fs * 0.5);
      const yb = h + fw;
      const sl = (tp / (h + 2 * fw)) * (legH - fw);
      const legW = fw * 1.1;
      const frame: Pt[] = [
        [-fw, -fw],
        [w + fw, -fw],
        [w + fw + tp, yb],
        [-fw - tp, yb],
      ];
      const legs: Pt[][] = [
        [
          [-fw - tp, yb - 2],
          [-fw - tp + legW, yb - 2],
          [-fw - tp + legW - sl, h + legH],
          [-fw - tp - sl, h + legH],
        ],
        [
          [w + fw + tp - legW, yb - 2],
          [w + fw + tp, yb - 2],
          [w + fw + tp + sl, h + legH],
          [w + fw + tp - legW + sl, h + legH],
        ],
      ];
      legs.forEach((q, i) => {
        parts.push(<Fill key={`lg${i}`} d={poly(q, {closed: true, joined: true, jitter: 0.3, seed: `${seed}/lgf${i}`}) + 'Z'} color={palette.teal} offset={off} seed={`${seed}/lgf${i}`} />);
        parts.push(<Ink key={`lgi${i}`} d={line(q[0][0], q[0][1], q[3][0], q[3][1], {over: [0, 1], seed: `${seed}/la${i}`}) + line(q[1][0], q[1][1], q[2][0], q[2][1], {over: [0, 1], seed: `${seed}/lb${i}`}) + line(q[3][0] - 1, q[3][1], q[2][0] + 1, q[2][1], {over: [0, 0], seed: `${seed}/lc${i}`})} width={W} taper={false} seed={`${seed}/lgi${i}`} />);
      });
      // the crossbar between the legs (a shade step under the face)
      const cbY = h + fw + (legH - fw) * 0.45;
      parts.push(<Fill key="cb" d={rectPath(-fw - tp + legW - sl * 0.45, cbY - fw * 0.3, w + 2 * fw + 2 * tp - 2 * legW + sl * 0.9, fw * 0.6)} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/cb`} />);
      parts.push(<Fill key="fr" d={poly(frame, {closed: true, joined: true, jitter: 0.3, seed: `${seed}/frf`}) + 'Z'} color={palette.teal} offset={off} seed={`${seed}/frf`} />);
      parts.push(<Ink key="fri" d={poly(frame, {closed: true, over: 3, seed: `${seed}/fri`})} width={W * 1.15} taper={false} seed={`${seed}/fri`} />);
      parts.push(<Fill key="hs" d={roundRect(w / 2 - fs * 0.55, -fw * 0.78, fs * 1.1, fw * 0.5, fw * 0.25)} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/hs`} />);
    }
    parts.push(<Fill key="pf" d={P.fill} color={paperCol} offset={p.frame === false ? off : [off[0] * 0.5, off[1] * 0.5]} seed={`${seed}/pf`} />);
    parts.push(<Ink key="pi" d={P.ink} width={W * 0.8} taper={false} seed={`${seed}/pi`} />);
  } else if (kind === 'stamp') {
    const inset = fs * 0.12;
    parts.push(<Fill key="pf" d={P.fill} color={paperCol} offset={off} seed={`${seed}/pf`} />);
    parts.push(<Ink key="pi" d={P.ink} width={W * 1.2} taper={false} color={textCol} seed={`${seed}/pi`} />);
    parts.push(<Ink key="pi2" d={roundRect(inset, inset, w - 2 * inset, h - 2 * inset, Math.min(4, fs * 0.12), {seed: `${seed}/pi2`, closed: false})} width={W * 0.6} taper={false} color={textCol} seed={`${seed}/pi2`} />);
  } else {
    parts.push(<Fill key="pf" d={P.fill} color={paperCol} offset={off} seed={`${seed}/pf`} />);
    parts.push(<Ink key="pi" d={P.ink} width={W} taper={false} seed={`${seed}/pi`} />);
  }

  // text
  parts.push(<InkTextBlock key="tx" L={L} align={align} color={textCol} k={F.k * k} seed={seed} />);

  // attachments over the paper
  if (kind === 'card') {
    const pr = Math.max(2.4, Math.min(6, fs * 0.12));
    const [qx, qy] = lp;
    parts.push(<Fill key="pin" d={circle(qx, qy, pr, {seed: `${seed}/pin`})} color={palette.ink} offset={false} mode="none" lookExempt seed={`${seed}/pin`} />);
    if (look.fills === 'color') parts.push(<circle key="pg" cx={qx - pr * 0.35} cy={qy - pr * 0.35} r={pr * 0.28} fill={palette.cream} />);
  } else if (kind === 'slip') {
    // a wire paper clip over the top edge (ink only: two nested loops), sticking out above the slip
    const cw = Math.max(6, fs * 0.36);
    const ch = Math.max(16, fs * 1.25);
    const qx = lp[0];
    const top = -ch * 0.42;
    const r1 = cw / 2;
    const r2 = cw * 0.3;
    const d =
      `M${qx + r2} ${top + ch * 0.55}V${top + r2 * 1.2}A${r2} ${r2} 0 0 0 ${qx - r2} ${top + r2 * 1.2}V${top + ch - r1}` +
      `A${r1} ${r1} 0 0 0 ${qx + r1} ${top + ch - r1}V${top + r1}A${r1} ${r1} 0 0 0 ${qx - r1} ${top + r1}V${top + ch * 0.62}`;
    parts.push(<Ink key="clip" d={d} width={Math.max(1.4, W * 0.75)} taper={false} color={palette.tealDark} seed={`${seed}/clip`} />);
  } else if (kind === 'notice') {
    const tw = Math.max(14, fs * 1.05);
    const th = Math.max(6, fs * 0.34);
    const corners: [number, number, number][] = [
      [0, 0, -38],
      [w, 0, 38],
      [w, h, -38],
      [0, h, 38],
    ];
    corners.forEach(([qx, qy, a], i) => {
      const jx = (rand(seed, `tp${i}`) - 0.5) * 4;
      const tk = p.at === undefined ? 1 : springPop(t, p.at + 0.08 + i * (p.tapeStagger ?? 0.04));
      if (tk <= 0.001) return;
      parts.push(
        <XG key={`tp${i}`} m={mat.compose(mat.translate(qx + jx, qy), mat.rotate(a + (rand(seed, `ta${i}`) - 0.5) * 10), mat.scale(tk))}>
          <Fill d={rectPath(-tw / 2, -th / 2, tw, th)} color={palette.sand} offset={false} mode="none" seed={`${seed}/tp${i}`} />
          <Ink d={`M${-tw / 2} ${-th / 2}l${-1} ${th}M${tw / 2} ${-th / 2}l1 ${th}`} width={W * 0.55} taper={false} seed={`${seed}/te${i}`} />
        </XG>,
      );
    });
  }

  let node = <XG m={m}>{parts}</XG>;

  // a short leader to what the label explains
  const ld = p.leader === undefined ? undefined : Array.isArray(p.leader) ? {to: p.leader as Pt, at: undefined} : p.leader;
  if (ld) {
    const [tx, ty] = ld.to;
    const sx = Math.max(px, Math.min(px + w, tx));
    const sy = Math.max(py, Math.min(py + h, ty));
    const la = ld.at ?? (p.at !== undefined ? p.at + 0.12 : undefined);
    node = (
      <>
        <Ink d={line(sx, sy, tx, ty, {over: [0, 0], seed: `${seed}/ld`, drift: 0.5})} at={la} dur={0.15} width={W * 0.8} taper={false} seed={`${seed}/ld`} />
        {la === undefined || t >= la + 0.1 ? <Fill d={circle(tx, ty, Math.max(2, W * 1.3), {seed: `${seed}/ldd`})} color={palette.ink} offset={false} mode="none" lookExempt seed={`${seed}/ldd`} /> : null}
        {node}
      </>
    );
  }
  return node;
};

/** An in-world label (storyboard v3 labelStyle). See the file header. */
export const LabelTag: React.FC<LabelTagProps> = (p) => {
  useCaptionFont();
  const t = useTime();
  if (p.at !== undefined && t < p.at) return null;
  if (p.outAt !== undefined) {
    const mode = p.outMode ?? 'pop';
    if (mode === 'pop' && t >= p.outAt + 1 / 30) return null;
    if (mode === 'unbuild') {
      const dur = p.outDur ?? 0.5;
      if (t >= p.outAt + dur) return null;
      return (
        <UnBuild at={p.outAt} dur={dur}>
          <LabelTagInner {...p} t={t} />
        </UnBuild>
      );
    }
  }
  return <LabelTagInner {...p} t={t} />;
};

/** The paper rect [x0, y0, x1, y1] a LabelTag will occupy at rest (for lint boxes / placing leaders). Needs the font
 *  (exact once CaptionHand has loaded, an estimate before). */
export function labelBox(p: LabelTagProps): [number, number, number, number] {
  if (p.box) return p.box;
  const kind: LabelKind = p.kind ?? p.variant ?? p.type ?? p.style ?? 'card';
  const fs = p.fontSize ?? p.size ?? DEF_FS[kind];
  const lines = labelLines(p.text ?? p.lines);
  const L0 = layoutText(lines, fs, PAD[kind]);
  const L = p.w !== undefined || p.h !== undefined ? layoutText(lines, fs, PAD[kind], [p.w ?? L0.w, p.h ?? L0.h]) : L0;
  const x = p.x ?? 0;
  const y = p.y ?? 0;
  const px = x - L.w / 2;
  const py = kind === 'tag' ? y + fs * 0.5 : kind === 'sign' ? y - (p.legH ?? L.h * 0.32) - L.h : y - L.h / 2;
  return [px, py, px + L.w, py + L.h];
}

// keep the shared ink ladder import used (labels default to the 2.2 px outline, `depth` overrides)
export const LABEL_INK = DEPTH_INK.far;

// ---------------------------------------------------------------- CheckBoxTag (S09) + CheckBoxTags (batched)

/** The tag's local outline (the LockCrate / fixed-lock cream tag: a slightly skewed card hanging from its loop): hang
 *  point (0, 0), size = tag width. Returns the corners. */
function checkTagPts(x: number, y: number, s: number): Pt[] {
  return [
    [x - s * 0.46, y + s * 0.22],
    [x + s * 0.5, y + s * 0.12],
    [x + s * 0.47, y + s * 0.98],
    [x - s * 0.5, y + s * 1.02],
  ];
}
const ptsD = (p: Pt[]) => `M${p.map((q) => `${q[0].toFixed(2)} ${q[1].toFixed(2)}`).join('L')}Z`;
/** The check box on a tag (square, 0.5 of the tag) and its tick. */
function checkBoxD(x: number, y: number, s: number): string {
  const b = s * 0.25;
  const cy = y + s * 0.58;
  return `M${(x - b).toFixed(2)} ${(cy - b).toFixed(2)}h${(2 * b).toFixed(2)}v${(2 * b).toFixed(2)}h${(-2 * b).toFixed(2)}z`;
}
function tickD(x: number, y: number, s: number): string {
  const cy = y + s * 0.58;
  return `M${(x - s * 0.2).toFixed(2)} ${(cy - s * 0.02).toFixed(2)}L${(x - s * 0.05).toFixed(2)} ${(cy + s * 0.16).toFixed(2)}L${(x + s * 0.3).toFixed(2)} ${(cy - s * 0.34).toFixed(2)}`;
}

export type CheckBoxTagProps = {
  /** Hang point (the loop's top); the tag hangs below it. */
  x: number;
  y: number;
  /** Tag width (world px). Default 40. */
  size?: number;
  /** Ticked (the box carries an ink tick) or EMPTY (default: the fix is there, not installed yet). */
  ticked?: boolean;
  /** Pops in (7 % spring) and swings -16 -> 0. */
  at?: number;
  /** The tick strokes on (0.17 s): an empty tag becomes ticked. */
  tickAt?: number;
  swingAt?: number | number[];
  depth?: Depth;
  ink?: number;
  seed?: Seed;
};

/** One cream check-box tag on a short loop (the LockCrate's tag), EMPTY or ticked. For hundreds use CheckBoxTags. */
export const CheckBoxTag: React.FC<CheckBoxTagProps> = ({x, y, size = 40, ticked = false, at, tickAt, swingAt, depth, ink, seed = 'cbt'}) => {
  const t = useTime();
  const F = usePropFrame({depth, ink, seed, defDepth: 'far'});
  if (at !== undefined && t < at) return null;
  const s = size;
  let a = at !== undefined ? pendulum(t, at, -16, 0.5, 0.8) : 0;
  const sw = swingAt === undefined ? [] : Array.isArray(swingAt) ? swingAt : [swingAt];
  for (const w of sw) a += pendulum(t, w, 12, 0.5, 0.9);
  const k = springPop(t, at);
  const P = checkTagPts(0, 0, s);
  const W = F.W;
  const small = s * F.k < 10;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(a), mat.scale(k))}>
      <Ink d={`M0 0L${(-s * 0.02).toFixed(2)} ${(s * 0.18).toFixed(2)}`} width={W * 0.6} taper={false} vary={0} seed={`${seed}/lp`} />
      <Fill d={ptsD(P)} color={palette.cream} offset={small ? false : F.off} mode="none" seed={`${seed}/f`} />
      {small ? null : <Ink d={poly(P, {closed: true, over: 1.5, seed: `${seed}/o`})} width={W * 0.75} taper={false} seed={`${seed}/o`} />}
      {small ? null : <Ink d={checkBoxD(0, 0, s)} width={W * 0.65} taper={false} vary={0} seed={`${seed}/bx`} />}
      {ticked || tickAt !== undefined ? <Ink d={tickD(0, 0, s)} at={ticked ? undefined : tickAt} dur={0.17} width={W * 1.1} taper={false} vary={0} seed={`${seed}/tk`} /> : null}
    </XG>
  );
};

export type CheckBoxSpot = {x: number; y: number; size: number; at?: number; ticked?: boolean; tickAt?: number};

/** Hundreds of check-box tags in FOUR paths (cream bodies, ink outlines + boxes, ink ticks, loops): S09's wave over
 *  every door. Each pops at its `at` (one frame at +30 %, like LockSpecks); ink only on tags >= `inkFrom` world px wide,
 *  boxes from `boxFrom`; ticks show on `ticked` spots (or from `tickAt`). Ink in WORLD px (pass ink / zoom for a
 *  screen weight). */
export const CheckBoxTags: React.FC<{spots: CheckBoxSpot[]; ink?: number; inkFrom?: number; boxFrom?: number; outAt?: number; color?: string}> = ({spots, ink = 0.8, inkFrom = 8, boxFrom = 12, outAt, color = palette.cream}) => {
  const t = useTime();
  const look = useLook();
  if (outAt !== undefined && t >= outAt) return null;
  const bodyCol = look.fills === 'paper' ? palette.white : look.fills === 'none' ? undefined : color;
  const inkOn = look.ink;
  let body = '';
  let line_ = '';
  let tick = '';
  for (const sp of spots) {
    if (sp.at !== undefined && t < sp.at) continue;
    const k = sp.at !== undefined && t < sp.at + 0.067 ? 1.3 : 1;
    const s = sp.size * k;
    const P = checkTagPts(sp.x, sp.y, s);
    const d = ptsD(P);
    body += d;
    if (sp.size >= inkFrom) line_ += d + `M${sp.x.toFixed(2)} ${sp.y.toFixed(2)}l0 ${(s * 0.18).toFixed(2)}`;
    if (sp.size >= boxFrom) line_ += checkBoxD(sp.x, sp.y, s);
    if (sp.ticked || (sp.tickAt !== undefined && t >= sp.tickAt)) tick += tickD(sp.x, sp.y, s);
  }
  return (
    <ExitFade>
      {body && bodyCol ? <path d={body} fill={bodyCol} /> : null}
      {line_ && ink > 0 && inkOn ? <path d={line_} fill="none" stroke={palette.ink} strokeWidth={ink} strokeLinejoin="round" strokeLinecap="round" /> : null}
      {tick && inkOn ? <path d={tick} fill="none" stroke={palette.ink} strokeWidth={Math.max(ink * 1.6, 0.6)} strokeLinejoin="round" strokeLinecap="round" /> : null}
    </ExitFade>
  );
};

// ---------------------------------------------------------------- SupportTag (S10)

export type SupportTagProps = {
  /** Hang point (the loop's top); the tag hangs below it. */
  x: number;
  y: number;
  /** Tag width (world px). Default 44 (height ~0.9 x). */
  size?: number;
  /** Pops in (7 % spring) and swings -16 -> 0 (a maker hands it over). */
  at?: number;
  /** The cream check strokes on (0.17 s; default: drawn with the tag). */
  checkAt?: number;
  /** The elephant stamp slams onto it (ring 0.13 s, print 2.6 x -> 1 x). Default: already stamped. */
  stampAt?: number;
  swingAt?: number | number[];
  depth?: Depth;
  ink?: number;
  seed?: Seed;
};

/** The makers' official "supported" tag: a sage check tag with a bold cream check, stamped with the elephant mark (an
 *  ink ring with the solid elephant). Below ~22 px on screen: sage tag + cream check only. */
export const SupportTag: React.FC<SupportTagProps> = ({x, y, size = 44, at, checkAt, stampAt, swingAt, depth, ink, seed = 'sup'}) => {
  const t = useTime();
  const F = usePropFrame({depth, ink, seed, defDepth: 'far'});
  if (at !== undefined && t < at) return null;
  const s = size;
  let a = at !== undefined ? pendulum(t, at, -16, 0.5, 0.8) : 0;
  const sw = swingAt === undefined ? [] : Array.isArray(swingAt) ? swingAt : [swingAt];
  for (const w of sw) a += pendulum(t, w, 12, 0.5, 0.9);
  const k = springPop(t, at);
  const W = F.W;
  const screen = s * F.k;
  const bw = s;
  const bh = s * 0.82;
  const top = s * 0.16;
  const body = roundRect(-bw / 2, top, bw, bh, bh * 0.16, {seed: `${seed}/b`});
  const er = Math.max(1, s * 0.05);
  const stampK = stampAt === undefined ? 1 : slamScale(t, stampAt);
  const sc: Pt = [bw * 0.2, top + bh * 0.66];
  const sr = s * 0.19;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(a), mat.scale(k))}>
      <Ink d={`M0 0L0 ${(top + er).toFixed(2)}`} width={W * 0.6} taper={false} vary={0} seed={`${seed}/lp`} />
      <Fill d={body} color={palette.sage} offset={screen < 22 ? false : F.off} mode="none" seed={`${seed}/f`} />
      {screen >= 14 ? <Ink d={roundRect(-bw / 2, top, bw, bh, bh * 0.16, {seed: `${seed}/o`, closed: false})} width={W * 0.75} taper={false} seed={`${seed}/o`} /> : null}
      {screen >= 14 ? <Fill d={circle(0, top + er * 2.2, er, {seed: `${seed}/e`})} color={palette.cream} offset={false} mode="none" seed={`${seed}/e`} /> : null}
      <Ink d={`M${(-bw * 0.32).toFixed(2)} ${(top + bh * 0.42).toFixed(2)}L${(-bw * 0.14).toFixed(2)} ${(top + bh * 0.62).toFixed(2)}L${(bw * 0.12).toFixed(2)} ${(top + bh * 0.2).toFixed(2)}`} at={checkAt} dur={0.17} width={Math.max(W * 1.3, s * 0.085)} color={palette.cream} taper={false} vary={0} seed={`${seed}/ck`} />
      {screen >= 22 && stampK > 0 ? (
        <XG m={mat.about(mat.scale(stampK), sc[0], sc[1])}>
          <Ink d={circle(sc[0], sc[1], sr, {seed: `${seed}/sr`, overlap: 8})} width={W * 0.6} taper={false} vary={0} seed={`${seed}/sr`} />
          <ElephantEmblem x={sc[0]} y={sc[1] + sr * 0.04} size={sr * 1.45} mode="solid" seed={`${seed}/el`} />
        </XG>
      ) : null}
    </XG>
  );
};

// ---------------------------------------------------------------- StickyNote (S11)

export type StickyNoteProps = {
  /** Rest centre on the surface (world). */
  x: number;
  y: number;
  /** Note size (world px). Default: fits the text (min square-ish). */
  w?: number;
  h?: number;
  /** One string per line (`text` = alias; a string splits on '\n'). */
  lines?: string[];
  text?: LabelText;
  /** Font size (world px). Keep it >= 24 px ON SCREEN. Default 30. `fontSize` = alias. */
  size?: number;
  fontSize?: number;
  /** The substring that gets struck through (only its own width, measured), e.g. 'and on again'. */
  strike?: string;
  /** The slap: the note lands flat at slapAt (0.12 s squash 1.12 x / 0.8 y + three slap ticks); it flutters in on a
   *  breeze before it when `flutter` is given (default: a short flutter from up-left). Omit = already stuck on. */
  slapAt?: number;
  flutter?: {from: Pt; dur?: number; spin?: number} | false;
  /** One ink strike-through stroke over `strike` (0.15 s). */
  strikeAt?: number;
  /** The bottom-right corner curls up and settles (0.4 s). */
  curlAt?: number | number[];
  /** Static tilt (deg). Default -4. */
  rot?: number;
  /** Paper colour (default cream) and its adhesive band (sand). */
  color?: string;
  /** Outline in world px (default 2.4) or SCREEN px (`inkPx`, divided by the camera scale). */
  ink?: number;
  inkPx?: number;
  outAt?: number;
  seed?: Seed;
};

/** A cream sticky note with hand-lettered text (CaptionHand): it flutters in and SLAPS onto a surface, then a substring
 *  gets struck through. J6: <StickyNote x y lines={['Turn it off', 'and on again']} strike="and on again" slapAt strikeAt />. */
export const StickyNote: React.FC<StickyNoteProps> = (p) => {
  useCaptionFont();
  const t = useTime();
  const seed = p.seed ?? 'note';
  const F = usePropFrame({ink: p.ink ?? 2.4, seed, defDepth: 'mid'});
  const flutter = p.flutter === false ? undefined : (p.flutter ?? (p.slapAt !== undefined ? {from: [p.x - 220, p.y - 160] as Pt} : undefined));
  const fd = flutter?.dur ?? 0.36;
  if (p.slapAt !== undefined && t < p.slapAt - (flutter ? fd : 0)) return null;
  if (p.outAt !== undefined && t >= p.outAt + 1 / 30) return null;
  const iw = p.inkPx !== undefined ? p.inkPx / F.k : F.W;
  const lines = p.lines ?? labelLines(p.text);
  const fs0 = p.fontSize ?? p.size ?? 30;
  const pad = {x: 0.4, top: 0.62, bot: 0.38, pitch: 1.08};
  const auto = layoutText(lines, fs0, pad);
  const side = Math.max(auto.w, auto.h);
  const w = p.w ?? side;
  const h = p.h ?? side;
  const L = layoutText(lines, fs0, pad, [w, h]);
  // placement: flutter in (a tumbling, edge-turning sheet on an arc), then the slap squash
  const rot = p.rot ?? -4;
  let cx = p.x;
  let cy = p.y;
  let a = rot;
  let sx = 1;
  let sy = 1;
  if (flutter && p.slapAt !== undefined && t < p.slapAt) {
    const q = prog(t, p.slapAt - fd, fd);
    const e = E.outQuad(q);
    const [fx, fy] = flutter.from;
    cx = lerp(fx, p.x, e) + Math.sin(q * Math.PI * 2.2) * 26 * (1 - q);
    cy = lerp(fy, p.y, e) - Math.sin(q * Math.PI) * 40;
    a = rot + (flutter.spin ?? 70) * (1 - e) * Math.cos(q * Math.PI * 1.5);
    sx = 0.3 + 0.7 * Math.abs(Math.cos(q * Math.PI * 1.6 * (1 - q * 0.4)));
    sy = 0.9 + 0.1 * q;
  } else if (p.slapAt !== undefined) {
    const q = prog(t, p.slapAt, 0.12, E.outCubic);
    if (q < 1) {
      sx = lerp(1.12, 1, q);
      sy = lerp(0.8, 1, q);
    }
  }
  if (p.outAt !== undefined && t >= p.outAt) {
    sx *= 0.72;
    sy *= 0.72;
  }
  const curls = p.curlAt === undefined ? [] : Array.isArray(p.curlAt) ? p.curlAt : [p.curlAt];
  let c = 0;
  for (const ca of curls) if (t >= ca && t < ca + 0.4) c = Math.max(c, Math.sin(prog(t, ca, 0.4) * Math.PI) * Math.min(w, h) * 0.22);
  const x0 = -w / 2;
  const y0 = -h / 2;
  const x1 = w / 2;
  const y1 = h / 2;
  const body: Pt[] =
    c > 0.5
      ? [
          [x0, y0],
          [x1, y0],
          [x1, y1 - c],
          [x1 - c, y1],
          [x0, y1],
        ]
      : [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ];
  const bodyD = ptsD(body);
  const flap = c > 0.5 ? ptsD([[x1, y1 - c], [x1 - c, y1], [x1 - c * 0.92, y1 - c * 0.92]]) : '';
  // the strike: the substring's measured extent on its line (centred lines)
  let strikeNode: React.ReactNode = null;
  if (p.strike && p.strikeAt !== undefined && t >= p.strikeAt) {
    const li = L.lines.findIndex((l) => l.includes(p.strike!));
    if (li >= 0) {
      const ln = L.lines[li];
      const i0 = ln.indexOf(p.strike);
      const pre = (measureCaption(ln.slice(0, i0), 100) / 100) * L.fs;
      const sub = (measureCaption(p.strike, 100) / 100) * L.fs;
      const lx = x0 + (w - L.widths[li]) / 2 + pre;
      const ly = y0 + L.base0 + li * (L.pitch ?? PITCH) * L.fs - L.fs * 0.28;
      strikeNode = <Ink d={line(lx - 4, ly + 1.5, lx + sub + 4, ly - 1.5, {seed: `${seed}/st`, over: [2, 5]})} at={p.strikeAt} dur={0.15} width={iw * 1.3} seed={`${seed}/sti`} />;
    }
  }
  // slap marks: three short ink ticks for 0.16 s as it lands
  let slapMarks: React.ReactNode = null;
  if (p.slapAt !== undefined && t >= p.slapAt && t < p.slapAt + 0.16) {
    const q = prog(t, p.slapAt, 0.16);
    const Ln = 9 * Math.sin(Math.PI * q) + 2;
    const tk = (px: number, py: number, dx: number, dy: number) => `M${(px + dx * 4).toFixed(1)} ${(py + dy * 4).toFixed(1)}l${(dx * Ln).toFixed(1)} ${(dy * Ln).toFixed(1)}`;
    slapMarks = <path d={tk(x0 - 3, y0 - 3, -0.7, -0.7) + tk(x1 + 3, y0 - 3, 0.7, -0.7) + tk(x1 + 4, 0, 1, 0) + tk(x0 - 4, y1 * 0.4, -1, 0.15)} stroke={palette.ink} strokeWidth={iw * 0.8} strokeLinecap="round" fill="none" />;
  }
  const off = F.off;
  return (
    <XG m={mat.compose(mat.translate(cx, cy), mat.rotate(a), mat.scale(sx, sy))}>
      <Fill d={bodyD} color={p.color ?? palette.cream} offset={off} mode="none" seed={`${seed}/p`} />
      <Fill d={ptsD([[x0, y0], [x1, y0], [x1, y0 + h * 0.15], [x0, y0 + h * 0.15]])} color={palette.sand} offset={off} mode="none" seed={`${seed}/band`} />
      <Ink d={bodyD} width={iw} taper={false} vary={0} open={0.06} seed={`${seed}/o`} />
      {flap ? (
        <>
          <Fill d={flap} color={palette.sand} offset={false} mode="none" seed={`${seed}/fl`} />
          <Ink d={flap} width={iw * 0.8} taper={false} vary={0} seed={`${seed}/fli`} />
        </>
      ) : null}
      {sx > 0.55 ? (
        <XG m={mat.translate(x0, y0)}>
          <InkTextBlock L={L} align="center" color={palette.ink} k={F.k} seed={seed} />
        </XG>
      ) : null}
      {strikeNode}
      {slapMarks}
    </XG>
  );
};

// ---------------------------------------------------------------- Sticker (S03)

export type StickerProps = {
  /** Centre (world). */
  x: number;
  y: number;
  /** Width (world px). Default 124 (keep >= 110 on screen; the lettering is 0.24 w >= 24 px). */
  w?: number;
  /** Static tilt (deg). Default -6. */
  rot?: number;
  /** Optional pop-in (it rides its building's pop-up otherwise: static, no animation). */
  at?: number;
  /** The scribbled '?' (default true). */
  question?: boolean;
  ink?: number;
  seed?: Seed;
};

/** The bait sticker: 'I [heart] PHP' with a DRAWN heart (CaptionHand has no heart glyph) and a hand-scribbled '?' in
 *  ink half off its edge. A white rounded sticker, slightly peeled at one corner. Static: a pauser detail. */
export const Sticker: React.FC<StickerProps> = ({x, y, w = 124, rot = -6, at, question = true, ink, seed = 'sticker'}) => {
  useCaptionFont();
  const t = useTime();
  const F = usePropFrame({ink: ink ?? 2.2, seed, defDepth: 'far'});
  const look = useLook();
  if (at !== undefined && t < at) return null;
  const k = springPop(t, at);
  const W = F.W;
  const fs = w * 0.25;
  const h = fs * 1.75;
  const x0 = -w / 2;
  const y0 = -h / 2;
  const r = h * 0.28;
  const peel = h * 0.26;
  // body with the peeled top-right corner folded back
  const body = `M${x0 + r} ${y0}H${w / 2 - peel}L${w / 2} ${y0 + peel}V${y0 + h - r}A${r} ${r} 0 0 1 ${w / 2 - r} ${y0 + h}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y0 + h - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
  const fold = `M${w / 2 - peel} ${y0}L${w / 2} ${y0 + peel}L${w / 2 - peel * 0.9} ${y0 + peel * 0.92}Z`;
  // 'I', the heart, 'PHP' laid out by measurement, centred
  const wI = (measureCaption('I', 100) / 100) * fs;
  const wP = (measureCaption('PHP', 100) / 100) * fs;
  const hw = fs * 0.78;
  const gap = fs * 0.2;
  const total = wI + gap + hw + gap + wP;
  const sx0 = -total / 2 - w * 0.04;
  const base = y0 + h * 0.5 + fs * 0.34;
  const hx = sx0 + wI + gap + hw / 2;
  const hy = base - fs * 0.32;
  const hs = hw / 2;
  const heart = `M${hx} ${hy + hs * 0.85}C${hx - hs * 0.2} ${hy + hs * 0.6} ${hx - hs * 1.05} ${hy + hs * 0.15} ${hx - hs * 0.98} ${hy - hs * 0.35}C${hx - hs * 0.92} ${hy - hs * 0.85} ${hx - hs * 0.2} ${hy - hs * 0.95} ${hx} ${hy - hs * 0.45}C${hx + hs * 0.2} ${hy - hs * 0.95} ${hx + hs * 0.92} ${hy - hs * 0.85} ${hx + hs * 0.98} ${hy - hs * 0.35}C${hx + hs * 1.05} ${hy + hs * 0.15} ${hx + hs * 0.2} ${hy + hs * 0.6} ${hx} ${hy + hs * 0.85}Z`;
  // the scribbled '?': a loose ink hook + dot, overlapping the sticker's right edge
  const qx = w / 2 + fs * 0.12;
  const qy = y0 + h * 0.42;
  const qs = fs * 1.15;
  const qD = `M${qx - qs * 0.26} ${qy - qs * 0.26}C${qx - qs * 0.3} ${qy - qs * 0.6} ${qx + qs * 0.3} ${qy - qs * 0.66} ${qx + qs * 0.28} ${qy - qs * 0.3}C${qx + qs * 0.26} ${qy - qs * 0.06} ${qx + qs * 0.02} ${qy - qs * 0.04} ${qx + qs * 0.01} ${qy + qs * 0.2}`;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(k))}>
      <Fill d={body} color={palette.white} offset={F.off} mode="none" seed={`${seed}/b`} />
      <Ink d={body} width={W} taper={false} vary={0} seed={`${seed}/bo`} />
      <Fill d={fold} color={palette.sand} offset={false} mode="none" seed={`${seed}/fd`} />
      <Ink d={fold} width={W * 0.7} taper={false} vary={0} seed={`${seed}/fdi`} />
      <Fill d={heart} color={palette.peach} offset={[F.off[0] * 0.6, F.off[1] * 0.6]} mode="none" seed={`${seed}/h`} />
      <Ink d={heart} width={W * 0.75} taper={false} vary={0} seed={`${seed}/hi`} />
      {look.ink ? (
        <ExitFade x={0} y={0}>
          <text x={sx0} y={base} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink}>
            I
          </text>
          <text x={sx0 + wI + gap + hw + gap} y={base} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink}>
            PHP
          </text>
        </ExitFade>
      ) : null}
      {question ? (
        <>
          <Ink d={qD} width={W * 1.25} taper={false} seed={`${seed}/q`} />
          <Fill d={circle(qx + qs * 0.02, qy + qs * 0.4, Math.max(1.4, W * 0.85), {seed: `${seed}/qd`})} color={palette.ink} offset={false} mode="none" lookExempt seed={`${seed}/qd`} />
        </>
      ) : null}
    </XG>
  );
};
