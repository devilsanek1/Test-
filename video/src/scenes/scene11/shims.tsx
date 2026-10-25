// S11 local pieces around shared kit pieces. No opacity anywhere: rotations, scales, pops.
//   NoteBreeze  the J6 sticky note flutters on its adhesive top edge in a breeze (a damped swing about its top) and jolts
//               under the pen as the strike starts. Applied OUTSIDE the shared StickyNote so the prop stays untouched.
//   NoteFlight  the note's drop from behind govB's cornice (clipped there), its back out, flipping to the lettered
//               face on the slap (the shared StickyNote's flutter shows the lettering in flight and pops in mid-air).
//   NoteBack    the note's back for the flight: a squarer sheet, sand glue band, the lettering showing through mirrored
//               in flat sand, a curled corner (fix round 3: the plain cream back read as an empty placeholder card).
//   NoteStrike  the J6 strike-through: ONE marker stroke (~4 px) along the x-height centre (StickyNote's own is ~3 px
//               and has no width option), the letters stay readable above and below it.
//   StepRipple  the SunPress ripple as a flat peach band expanding in 3 discrete steps (12 / 8 / 4 px): the house glow
//               language (PressRipple is an ink ring thinning to sub-pixel grey: reads as a fade / a UI outline).
//   PadlockRock the S01 padlock (the shared ShutterPadlock, S01's size / seed) rocking on its shackle (+-6 deg): Bit's
//               weight / tap. ShutterPadlock has no rock of its own.
//   TagTwirl    the S01 lettered 'back soon' tag (the shared BackSoonTag, one line, white) twirling in the breeze as a
//               NARROWING (to 15 % width and back, then a smaller one): never past edge-on (BackSoonTag's own twirlAt
//               shows its blank back for ~4 frames); below 35 % width it draws the unlettered edge (backSoonFont).
//   PipHopSmear 3 short ink speed lines trailing Pip's fast in-hop (S12's PipFallSmear language).
//   ShutterStreaks cream motion streaks on govB's shutter during the slam's fastest frames (its evenly spaced ribs
//               moving 60-80 px / frame alias: they read as static or creeping).
//   backSoonW   the width of a one-line lettered BackSoonTag whose total drop (string + tag) is a given height.
//   BitRim      a cream rim under the shared Bit (on the dark shutter he read as a speck; Bit has no rim option).

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, Pt, speedLines} from '../../lib/sketch';
import {mat, useXf, XG} from '../../lib/xf';
import {captionFontStack, measureCaption, useCaptionFont} from '../../lib/font';
import {matScale} from '../shared/props/common';
import {layoutText} from '../shared/props/Labels';
import {bitPath, slamCurve} from '../shared/props';

// ---------------------------------------------------------------- NoteBreeze

export const NoteBreeze: React.FC<{
  /** The note's rest centre and height (world): the swing pivots on the middle of its top edge. */
  x: number;
  y: number;
  h: number;
  /** Breeze flutters (0.7 s each, +-5 deg decaying, 1.5 swings). */
  flutterAt?: number[];
  /** The pen press: a 3.5 % squash over 0.12 s. */
  joltAt?: number;
  children?: React.ReactNode;
}> = ({x, y, h, flutterAt = [], joltAt, children}) => {
  const t = useTime();
  let fa = 0;
  for (const fl of flutterAt) if (t >= fl && t < fl + 0.7) fa += 5 * Math.sin(prog(t, fl, 0.7) * Math.PI * 3) * (1 - prog(t, fl, 0.7));
  let jolt = 1;
  if (joltAt !== undefined && t >= joltAt && t < joltAt + 0.12) jolt = 1 - 0.035 * Math.sin(prog(t, joltAt, 0.12) * Math.PI);
  if (fa === 0 && jolt === 1) return <>{children}</>;
  return <XG m={mat.compose(mat.about(mat.scale(jolt), x, y), mat.about(mat.rotate(fa), x, y - h / 2))}>{children}</XG>;
};

// ---------------------------------------------------------------- NoteFlight

/** The J6 note's drop onto the shutter. It slips out from behind govB's cornice (clipped above `clipY`, world: hidden
 *  while it is behind the cornice, so it never pops into the open sky) as a sheet tipped back (scaleY 0.45),
 *  opens toward the shutter as it falls (scaleY -> 1, one flutter dip), sways on the breeze and settles its spin; it shows its BLANK
 *  BACK the whole way (no lettering in flight: the words are the punchline on 'tech') and paper-flips to the lettered
 *  face over the last `flipDur` (scaleX 1 -> 0 -> 1), arriving at `arriveAt` where the slapping note takes over.
 *  Motion: y falls with a light gravity (0.85 q + 0.15 q^2), x is pushed by the breeze and eases out (1 - (1 - q)^2) with
 *  1.5 sways and a decaying spin: no linear tween, the fall stays <= ~20 px / frame at this zoom (the 0.15 s flip's
 *  edges are faster: a paper flip). Nothing before `arriveAt - dur` or after `arriveAt`. */
export const NoteFlight: React.FC<{
  /** Rest centre (world). */
  x: number;
  y: number;
  /** Start centre (world, behind the cornice). */
  from: Pt;
  arriveAt: number;
  dur: number;
  /** Hidden above this world y (the cornice's lower edge). */
  clipY: number;
  flipDur?: number;
  /** The note's blank back and its lettered face, both drawn at the rest centre (x, y). */
  back: React.ReactNode;
  face: React.ReactNode;
  id?: string;
}> = ({x, y, from, arriveAt, dur, clipY, flipDur = 0.15, back, face, id = 's11-noteclip'}) => {
  const t = useTime();
  if (t < arriveAt - dur || t >= arriveAt) return null;
  const q = (t - (arriveAt - dur)) / dur;
  const fx = 1 - (1 - q) * (1 - q);
  // fix round 1: a flatter fall (0.85 q + 0.15 q^2: the end speed is only 1.15 x the mean, <= ~20 px / frame at 1.69 over
  // the 0.42 s drop) and TWO sways on the breeze (x and spin), so it reads as a sheet fluttering down, not a dropped card
  const fy = 0.85 * q + 0.15 * q * q;
  const px = from[0] + (x - from[0]) * fx + 7 * Math.sin(q * Math.PI * 3) * (1 - q);
  const py = from[1] + (y - from[1]) * fy;
  const a = 7 * (1 - q) * Math.cos(q * Math.PI * 2.5);
  // tipped back as it slips out (scaleY 0.45), opening toward the shutter as it falls, with one flutter dip
  const sy = Math.min(1, 0.45 + 0.55 * E.outCubic(Math.min(1, q / 0.75)) - 0.12 * Math.sin(Math.min(1, q / 0.75) * Math.PI));
  // the paper flip: back folds edge-on, the lettered face unfolds
  const qf = 1 - flipDur / dur;
  const f = q < qf ? 0 : (q - qf) / (1 - qf);
  const cx = Math.cos(Math.PI * f);
  const sx = Math.max(0.03, Math.abs(cx));
  const side = cx >= 0 ? back : face;
  const g = <XG m={mat.compose(mat.translate(px, py), mat.rotate(a), mat.scale(sx, sy), mat.translate(-x, -y))}>{side}</XG>;
  if (q > 0.5) return g;
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect x={-1e4} y={clipY} width={2e4} height={2e4} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{g}</g>
    </>
  );
};

// ---------------------------------------------------------------- NoteBack

/** The J6 note's BACK, shown while it falls (fix round 3: the plain cream card read as an empty placeholder): a squarer
 *  sheet (`w` x `h` world, ~210 x 200 px on screen), the sand adhesive band across its top ~20 % (the glue is on the
 *  back), the face's lettering showing through MIRRORED as flat sand glyphs (no opacity: a flat colour one step off the
 *  paper), one curled corner (bottom-left: the face's bottom-right, seen from behind) and the ink outline. Drawn about
 *  its rest centre (x, y) with the note's tilt, like the StickyNote it flips to. */
export const NoteBack: React.FC<{x: number; y: number; w: number; h: number; rot: number; lines: string[]; fontSize: number; inkPx: number; seed?: string}> = ({x, y, w, h, rot, lines, fontSize, inkPx, seed = 's11/noteback'}) => {
  useCaptionFont();
  const k = Math.max(1e-4, matScale(useXf()));
  const iw = inkPx / k;
  const x0 = -w / 2;
  const y0 = -h / 2;
  const x1 = w / 2;
  const y1 = h / 2;
  const c = Math.min(w, h) * 0.17; // the curl
  const body = `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0 + c} ${y1}L${x0} ${y1 - c}Z`;
  const flap = `M${x0 + c} ${y1}L${x0} ${y1 - c}L${x0 + c * 0.92} ${y1 - c * 0.92}Z`;
  const band = `M${x0} ${y0}L${x1} ${y0}L${x1} ${y0 + h * 0.2}L${x0} ${y0 + h * 0.2}Z`;
  // the show-through: the face's two lines, mirrored, centred under the band
  const pitch = fontSize * 1.08;
  const top = y0 + h * 0.2 + (h * 0.8 - pitch * (lines.length - 1)) / 2 + fontSize * 0.3;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot))}>
      <Fill d={body} color={palette.cream} offset={false} mode="none" seed={`${seed}/p`} />
      <Fill d={band} color={palette.sand} offset={false} mode="none" seed={`${seed}/band`} />
      <g transform="scale(-1 1)">
        {lines.map((ln, i) => (
          <text key={i} x={0} y={top + i * pitch} fontFamily={captionFontStack} fontSize={fontSize} fill={palette.sand} textAnchor="middle">
            {ln}
          </text>
        ))}
      </g>
      <Ink d={body} width={iw} taper={false} vary={0} open={0.06} seed={`${seed}/o`} />
      <Fill d={flap} color={palette.sand} offset={false} mode="none" seed={`${seed}/fl`} />
      <Ink d={flap} width={iw * 0.8} taper={false} vary={0} seed={`${seed}/fli`} />
    </XG>
  );
};

// ---------------------------------------------------------------- NoteStrike

/** The J6 strike-through drawn by the scene: ONE marker stroke at `widthPx` (screen px, ~4: inkBold-ish) along the
 *  x-height centre of `strike`, flat along the note's text line (the note's own rotation), overshooting each end by
 *  `overPx` (~7 px), drawn left -> right inside `dur`. No return pass: the letters stay readable above and below it.
 *  The geometry mirrors StickyNote's text layout (layoutText with its paper padding) so it lands on `strike`. */
export const NoteStrike: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  fontSize: number;
  strike: string;
  rot: number;
  at: number;
  dur?: number;
  widthPx?: number;
  overPx?: number;
  seed?: string;
}> = ({x, y, w, h, lines, fontSize, strike, rot, at, dur = 0.15, widthPx = 4, overPx = 7, seed = 's11/strike'}) => {
  useCaptionFont();
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  if (t < at) return null;
  const L = layoutText(lines, fontSize, {x: 0.4, top: 0.62, bot: 0.38, pitch: 1.08}, [w, h]);
  const li = L.lines.findIndex((l) => l.includes(strike));
  if (li < 0) return null;
  const ln = L.lines[li];
  const i0 = ln.indexOf(strike);
  const pre = (measureCaption(ln.slice(0, i0), 100) / 100) * L.fs;
  const sub = (measureCaption(strike, 100) / 100) * L.fs;
  const x0 = -w / 2 + (w - L.widths[li]) / 2 + pre;
  // the x-height centre: ~0.24 em above the baseline
  const ly = -h / 2 + L.base0 + li * (L.pitch ?? 1.08) * L.fs - L.fs * 0.24;
  const ov = overPx / k;
  const go = `M${(x0 - ov).toFixed(1)} ${(ly + 0.5).toFixed(1)}L${(x0 + sub + ov).toFixed(1)} ${(ly - 0.5).toFixed(1)}`;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot))}>
      <Ink d={go} at={at} dur={dur} pace="free" width={widthPx / k} vary={0.04} taper={false} seed={seed} />
    </XG>
  );
};

// ---------------------------------------------------------------- StepRipple

/** The SunPress ripple in the house glow language (fix round 3: a flat stepped band, not an ink hairline): a flat PEACH
 *  ring band that expands in discrete steps, one radius + width per step (`radii` / `widths`, screen px when drawn in
 *  screen space), each held `dur / steps` (2 frames at the default 0.2 s), then gone in one frame. No ink, no fade. */
export const StepRipple: React.FC<{cx: number; cy: number; at: number; radii?: number[]; widths?: number[]; dur?: number; color?: string}> = ({cx, cy, at, radii = [124, 146, 168], widths = [12, 8, 4], dur = 0.2, color = palette.peach}) => {
  const t = useTime();
  if (t < at || t >= at + dur) return null;
  const n = Math.min(radii.length, widths.length);
  const i = Math.min(n - 1, Math.floor(((t - at) / dur) * n));
  return <circle cx={cx} cy={cy} r={radii[i]} fill="none" stroke={color} strokeWidth={widths[i]} />;
};

// ---------------------------------------------------------------- Sparkle

/** A cream 4-point sparkle with an ink rim (sketch 'glint' language): pops full size for one frame at `at`, then shrinks
 *  to nothing by scale over `dur`. `r` = arm length (world). */
export const Sparkle: React.FC<{x: number; y: number; r: number; at: number[]; dur?: number; inkPx?: number}> = ({x, y, r, at, dur = 0.17, inkPx = 1.6}) => {
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  let s = 0;
  for (const a of at) if (t >= a && t < a + 1 / 30 + dur) s = Math.max(s, t < a + 1 / 30 ? 1 : 1 - E.inQuad(prog(t, a + 1 / 30, dur)));
  if (s <= 0.04) return null;
  const w = r * 0.26;
  const d = `M0 ${-r}Q${w * 0.35} ${-w * 0.35} ${r} 0Q${w * 0.35} ${w * 0.35} 0 ${r}Q${-w * 0.35} ${w * 0.35} ${-r} 0Q${-w * 0.35} ${-w * 0.35} 0 ${-r}Z`;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(8), mat.scale(s))}>
      <path d={d} fill={palette.cream} stroke={palette.ink} strokeWidth={inkPx / (k * Math.max(0.2, s))} strokeLinejoin="round" />
    </XG>
  );
};

// ---------------------------------------------------------------- PadlockRock

/** Shackle-top offset (world, for a ShutterPadlock of total height `size`) above the body centre: where Bit sits. */
export const padlockShackleTop = (size: number) => (-9 - 6.5 - 1) * (size / 28);

/** Rocks its child (the shared ShutterPadlock at body centre x, y) about the shackle top, where it hangs from the rail:
 *  +-6 deg, 1.5 swings, decaying over 0.5 s at each `rockAt`; `tapAt` = a small quick rock (+-3 deg, gone in 0.25 s:
 *  Bit's tap, so it is settled before the strike starts). */
export const PadlockRock: React.FC<{x: number; y: number; size: number; rockAt: number[]; tapAt?: number[]; children?: React.ReactNode}> = ({x, y, size, rockAt, tapAt = [], children}) => {
  const t = useTime();
  let rot = 0;
  for (const r of rockAt) if (t >= r && t < r + 0.5) rot += 6 * Math.sin(prog(t, r, 0.5) * Math.PI * 3) * Math.exp(-(t - r) * 6);
  for (const r of tapAt) if (t >= r && t < r + 0.25) rot += 3 * Math.sin(prog(t, r, 0.25) * Math.PI * 2) * (1 - prog(t, r, 0.25));
  if (rot === 0) return <>{children}</>;
  return <XG m={mat.about(mat.rotate(rot), x, y + padlockShackleTop(size))}>{children}</XG>;
};

// ---------------------------------------------------------------- TagTwirl

/** The 'back soon' tag twirling in a breeze WITHOUT ever turning its blank back to us: a narrowing about its hang point
 *  (x) to 15 % width and back over 0.25 s, then a smaller one (to 55 %) over 0.2 s. The first narrowest point is at
 *  `at + 0.125`. A1 polish (review: at the narrowest frames the squashed glyphs read as a barcode / render glitch): while
 *  the tag is narrower than 35 % (`EDGE_ON`, ~3-4 frames) it draws `edge` instead (the same tag with no lettering: the
 *  paper edge sliver with its ink outline); the lettering returns as it turns back. */
export const TagTwirl: React.FC<{x: number; y: number; twirlAt: number[]; edge?: React.ReactNode; children?: React.ReactNode}> = ({x, y, twirlAt, edge, children}) => {
  const t = useTime();
  let sx = 1;
  for (const a of twirlAt) {
    const d = t - a;
    if (d >= 0 && d < 0.25) sx = 1 - 0.85 * Math.sin((d / 0.25) * Math.PI);
    else if (d >= 0.25 && d < 0.45) sx = 1 - 0.45 * Math.sin(((d - 0.25) / 0.2) * Math.PI);
  }
  if (sx === 1) return <>{children}</>;
  return <XG m={mat.about(mat.scale(sx, 1), x, y)}>{Math.abs(sx) < EDGE_ON && edge !== undefined ? edge : children}</XG>;
};
const EDGE_ON = 0.35;

/** The lettering size BackSoonTag picks for a ONE-line lettered tag `W` wide (props layout: min(0.84 W / m, 0.34 W)):
 *  passed as `font` with text ' ' it draws the SAME tag body with no lettering (TagTwirl's edge-on frames). */
export function backSoonFont(W: number, text = 'back soon'): number {
  const m1 = measureCaption(text, 100) / 100;
  return Math.min((W * 0.84) / m1, W * 0.34);
}

// ---------------------------------------------------------------- backSoonW

/** Width (world) of a ONE-line lettered BackSoonTag ('back soon') whose whole drop (string + tag) is `drop` (world),
 *  from the props layout (fs = 0.84 W / m, notch min(0.14 W, 0.6 fs), string max(6, 0.36 fs), body notch + 1.72 fs). */
export function backSoonW(drop: number, text = 'back soon'): number {
  const m1 = measureCaption(text, 100) / 100;
  const dropOf = (W: number) => {
    const fs = Math.min((W * 0.84) / m1, W * 0.34);
    return Math.max(6, fs * 0.36) + Math.min(W * 0.14, fs * 0.6) + fs * 1.72;
  };
  let W = 100;
  for (let i = 0; i < 6; i++) W *= drop / dropOf(W);
  return W;
}

// ---------------------------------------------------------------- BitRim

/** A cream rim (`px` screen px outside his shell + head silhouette) drawn UNDER the shared Bit, with Bit's own outer
 *  transform (feet at x, y, `rot`, `flip`, body length `size`): on the tealDark shutter the ink beetle on the shackle
 *  read as a dark speck; the rim (as on other dark grounds) gives him a readable silhouette. Bit has no rim option. */
export const BitRim: React.FC<{x: number; y: number; size: number; rot?: number; flip?: boolean; px?: number; color?: string}> = ({x, y, size, rot = 0, flip = false, px = 1.8, color = palette.cream}) => {
  const k = Math.max(1e-4, matScale(useXf()));
  const s = size / 20;
  const d = bitPath(0, 0, 20, false);
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(flip ? -s : s, s))}>
      <path d={d} fill={color} stroke={color} strokeWidth={(2 * px) / (k * s)} strokeLinejoin="round" />
    </XG>
  );
};

// ---------------------------------------------------------------- PipHopSmear

/** A1 polish (review: the in-hop crosses ~55 px / frame for 6 frames, the fastest unsmeared figure motion in the scene):
 *  3 short ink speed lines trailing Pip's hop (S12's PipFallSmear language, scaled with him), anchored behind his body
 *  centre along -velocity, their length growing with his speed. SCREEN space: (x, y) = his feet, (vx, vy) = px / s,
 *  `scale` = his on-screen scale (1 = the ~92 px stand-side body). */
export const PipHopSmear: React.FC<{x: number; y: number; vx: number; vy: number; scale: number}> = ({x, y, vx, vy, scale}) => {
  const sp = Math.hypot(vx, vy) || 1;
  const ux = -vx / sp;
  const uy = -vy / sp;
  const cx = x + ux * 50 * scale;
  const cy = y - 42 * scale + uy * 50 * scale;
  const len = Math.max(24, Math.min(48, (sp / 30) * 0.85));
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
  return <Ink d={speedLines(cx, cy, {n: 3, len, gap: 16 * scale, angle: ang, seed: 's11/pipSpd'})} width={2.6} taper={false} seed="s11/pipSpdI" />;
};

// ---------------------------------------------------------------- ShutterStreaks

/** A1 polish (review: on the slam's fastest frames the shutter's evenly spaced ribs move 60-80 px / frame and alias,
 *  reading as static or creeping while only the bottom edge drops): 4 cream motion streaks on the curtain just above its
 *  falling bottom edge, each as long as ~80 % of the edge's travel over the last frame (capped), drawn only while the
 *  drop is fast (slam u 0.05-0.16 s: f101-f103). The curtain = govB's window rect (x, y, w, h, world), the set's slam
 *  curve (props slamCurve: 0.16 s in(quad)). */
export const ShutterStreaks: React.FC<{x: number; y: number; w: number; h: number; slamAt: number}> = ({x, y, w, h, slamAt}) => {
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  const u = t - slamAt;
  if (u < 0.05 || u >= 0.16) return null;
  const bottom = y + h * slamCurve(u)[0];
  const travel = h * (slamCurve(u)[0] - slamCurve(u - 1 / 30)[0]);
  const L = Math.min(70, travel * 0.8);
  const cols: [number, number][] = [[0.18, 1], [0.39, 0.7], [0.61, 0.9], [0.82, 0.6]];
  const d = cols.map(([f, l]) => `M${(x + w * f).toFixed(1)} ${(bottom - 5 / k - L * l).toFixed(1)}L${(x + w * f).toFixed(1)} ${(bottom - 5 / k).toFixed(1)}`).join('');
  return <path d={d} fill="none" stroke={palette.cream} strokeWidth={3 / k} strokeLinecap="round" />;
};
