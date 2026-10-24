// S01 LOCAL STAND-INS for shared-kit pieces requested in docs/storyboard_v3.json "requests" that are not in
// src/scenes/shared yet. Same names / props as the requests, so a later fix round can swap each one for the kit's:
//   CrtChrome          -> GovernmentPlaza per-building `screenOffAt` (screen -> bright line -> dot -> dark, 0.15 s)
//   FarCivic           -> GovernmentPlaza `farCivic` + `civicOffAt` (whole-shape step dark, left to right)
//   ShutterCurtain     -> RollerShutter `stopAt` (govC's half shutter with a 1-frame jolt)
//   BackSoonTag        -> props BackSoonTag LETTERED variant ('back soon' in CaptionHand >= 22 px on screen)
// Everything is flat (no fades): pops, scale collapses, colour steps in one frame.
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {captionFontStack, useCaptionFont} from '../../lib/font';
import {circle, line, polyPath, rectPath, Pt} from '../../lib/sketch';
import {rng} from '../../lib/rng';
import {mat, XG} from '../../lib/xf';
import {BrowserChrome} from '../shared/props';
import {misregScreen, pendulum} from '../shared/props/common';

// ---------------------------------------------------------------- CRT power-off (BrowserChrome + collapse overlay)

/** Title-bar height BrowserChrome uses for a window of height h. */
const barOf = (h: number) => Math.min(30, h * 0.27);

/** The CRT collapse of a browser screen, starting at `at`: [0, 0.05) the lit screen squashes to a bright WHITE line,
 *  [0.05, 0.10) the line shrinks to a dot, [0.10, 0.15) the dot shrinks away; the screen is tealDark from `at` on.
 *  Pass a negative `at` to start mid-collapse (frame 0: govB's screen IS the bright line at t = 0). */
export const CrtOff: React.FC<{x: number; y: number; w: number; h: number; at?: number; ink: number; seed: string}> = ({x, y, w, h, at, ink, seed}) => {
  const t = useTime();
  if (at === undefined || t < at) return null;
  const bar = barOf(h);
  const ins = ink * 0.5 + 0.5;
  const sx = x + ins;
  const sy = y + bar + ins;
  const sw = w - 2 * ins;
  const sh = h - bar - 2 * ins;
  const cx = sx + sw / 2;
  const cy = sy + sh / 2;
  const dt = t - at;
  let band: React.ReactNode = null;
  if (dt < 0.05) {
    const q = E.inQuad(dt / 0.05);
    const bh = lerp(sh * 0.92, 5, q);
    const bw = lerp(sw * 0.97, sw * 0.9, q);
    band = <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} fill={palette.white} />;
  } else if (dt < 0.1) {
    const q = E.inQuad((dt - 0.05) / 0.05);
    const bw = lerp(sw * 0.9, 7, q);
    const bh = lerp(5, 4, q);
    band = <rect x={cx - bw / 2} y={cy - bh / 2} width={bw} height={bh} rx={bh / 2} fill={palette.white} />;
  } else if (dt < 0.15) {
    const r = lerp(4.5, 0.5, E.inQuad((dt - 0.1) / 0.05));
    band = <circle cx={cx} cy={cy} r={r} fill={palette.white} />;
  }
  return (
    <>
      <Fill rect={[sx, sy, sw, sh]} color={palette.tealDark} offset={false} mode="snap" seed={`${seed}/crt`} />
      {band}
    </>
  );
};

/** A lit browser window (chunky chrome) that powers off like a CRT at `screenOffAt`. */
export const CrtChrome: React.FC<{x: number; y: number; w: number; h: number; screenOffAt?: number; width: number; seed: string}> = ({x, y, w, h, screenOffAt, width, seed}) => (
  <>
    <BrowserChrome x={x} y={y} w={w} h={h} ink={width} seed={seed} />
    <CrtOff x={x} y={y} w={w} h={h} at={screenOffAt} ink={width} seed={seed} />
  </>
);

// ---------------------------------------------------------------- the far civic skyline in the sun gap

/** Haze ladder (style_bible_ref2 8): back tier #98C0AE, front tier #84B09C; dark = one fill step darker. */
const CIVIC = {back: '#98C0AE', backDark: '#84B09C', front: '#84B09C', frontDark: palette.sage} as const;
const HZ = 1388;

type Civic = {d: string; tier: 'back' | 'front'; col: 0 | 1 | 2; win: [number, number, number, number]; lantern?: [number, number, number, number]; clock?: Pt};

const dome = (x0: number, x1: number, drumTop: number, ry: number): string => {
  const cx = (x0 + x1) / 2;
  const rx = (x1 - x0) / 2 - 4;
  return rectPath(x0, drumTop, x1 - x0, HZ - drumTop) + `M${cx - rx} ${drumTop + 1}A${rx} ${ry} 0 0 1 ${cx + rx} ${drumTop + 1}Z`;
};
const temple = (x0: number, x1: number, corn: number, apex: number): string =>
  rectPath(x0, corn, x1 - x0, HZ - corn) + polyPath([[x0 - 3, corn + 1], [(x0 + x1) / 2, apex], [x1 + 3, corn + 1]]);
const spire = (x0: number, x1: number, top: number, sx: number, apex: number): string =>
  rectPath(x0, top, x1 - x0, HZ - top) + polyPath([[sx - 13, top + 1], [sx, apex], [sx + 13, top + 1]]);

/** World coords of the S01 rest camera. The sun's glyph ring bottom sits at y ~960: back tops stay below it inside the
 *  glyph's span, the spire rises only right of the ring. Each silhouette is >= 40 px wide on screen. */
const SHAPES: Civic[] = [
  // back tier (#98C0AE): dome / temple / clock spire
  {d: dome(644, 708, 1012, 30), tier: 'back', col: 0, win: [652, 1024, 50, 150], lantern: [672, 972, 8, 12]},
  {d: temple(708, 754, 1008, 988), tier: 'back', col: 1, win: [712, 1020, 38, 130]},
  {d: spire(754, 802, 1000, 779, 944), tier: 'back', col: 2, win: [760, 1034, 36, 120], clock: [779, 1016]},
  // front tier (#84B09C): low dome / stepped ministry / pediment
  {d: dome(640, 694, 1096, 24), tier: 'front', col: 0, win: [646, 1108, 44, 230], lantern: [663, 1062, 7, 11]},
  {d: rectPath(694, 1082, 52, HZ - 1082) + rectPath(704, 1068, 32, 16), tier: 'front', col: 1, win: [698, 1094, 44, 240]},
  {d: temple(746, 802, 1086, 1066), tier: 'front', col: 2, win: [750, 1098, 48, 240]},
];

/** Lit windows of a silhouette: 3 x 5 px cream slits on a seeded grid (they go out with the whole-shape step). */
const windowsOf = (r: [number, number, number, number], seed: string): string => {
  const g = rng(`civic/${seed}`);
  let d = '';
  for (let yy = r[1]; yy < r[1] + r[3]; yy += 14) for (let xx = r[0]; xx < r[0] + r[2] - 3; xx += 9) if (g.chance(0.42)) d += rectPath(xx, yy, 3, 5);
  return d;
};
const WINDOWS = SHAPES.map((s, i) => windowsOf(s.win, `w${i}`));

/** The far civic skyline in the sun gap ('governments all over Europe'): 6 fill-only domes / temples / clock spires in
 *  two haze tiers, lit windows + dome lanterns; at `civicOffAt[col]` each column steps one fill darker as a WHOLE shape
 *  and its windows go out (left to right); `lanternOffAt` pops the two dome lanterns off. */
export const FarCivic: React.FC<{civicOffAt?: number[]; lanternOffAt?: number[]; seed?: string}> = ({civicOffAt = [], lanternOffAt = [], seed = 'civic'}) => {
  const t = useTime();
  const off = (c: number) => civicOffAt[c] !== undefined && t >= civicOffAt[c];
  let lanternI = 0;
  return (
    <>
      {SHAPES.map((s, i) => {
        const dark = off(s.col);
        const col = s.tier === 'back' ? (dark ? CIVIC.backDark : CIVIC.back) : dark ? CIVIC.frontDark : CIVIC.front;
        const li = s.lantern ? lanternI++ : -1;
        const lanternOn = s.lantern && !(lanternOffAt[li] !== undefined && t >= lanternOffAt[li]);
        return (
          <React.Fragment key={i}>
            <Fill d={s.d} color={col} offset={false} mode="snap" seed={`${seed}/s${i}`} />
            {!dark ? <Fill d={WINDOWS[i]} color={palette.cream} offset={false} mode="snap" seed={`${seed}/w${i}`} /> : null}
            {s.lantern ? <Fill rect={s.lantern} color={lanternOn ? palette.cream : col} offset={false} mode="snap" seed={`${seed}/l${i}`} /> : null}
            {s.clock ? <circle cx={s.clock[0]} cy={s.clock[1]} r={6} fill={palette.white} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- RollerShutter stopAt (curtain only)

/** Drop of a curtain that stops at `stop` (0..1) of the window: gravity drop, then a 1-frame jolt (+5 px, -2 px). */
export function curtainDrop(t: number, slamAt: number | undefined, stop = 1): [number, number] {
  if (slamAt === undefined || t < slamAt) return [0, 0];
  const dur = 0.16 * Math.sqrt(stop);
  const q = prog(t, slamAt, dur, E.inQuad) * stop;
  const d = t - slamAt - dur;
  const jolt = d < 0 ? 0 : d < 1 / 30 ? 5 : d < 2 / 30 ? -2 : 0;
  return [q, jolt];
}

/** The curtain of a RollerShutter (the box is the set's), stopping at `stopAt` of the window (govC: 0.5). */
export const ShutterCurtain: React.FC<{x: number; y: number; w: number; h: number; slamAt?: number; stopAt?: number; width: number; rib?: number; seed: string}> = ({x, y, w, h, slamAt, stopAt = 1, width, rib = 14, seed}) => {
  const t = useTime();
  const [k, jolt] = curtainDrop(t, slamAt, stopAt);
  const bottom = y + h * k + jolt;
  const curH = bottom - y;
  if (curH <= 0.5) return null;
  let ribs = '';
  for (let yy = bottom - 10; yy > y + 2; yy -= rib) ribs += `M${x + 3} ${yy.toFixed(1)}H${x + w - 3}`;
  return (
    <>
      <Fill d={rectPath(x, y, w, curH)} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/c`} />
      {ribs ? <Ink d={ribs} width={width * 0.45} taper={false} vary={0} seed={`${seed}/rb`} /> : null}
      <Fill d={rectPath(x - 3, bottom - 9, w + 6, 9)} color={palette.sand} offset={false} mode="none" seed={`${seed}/rl`} />
      <Ink d={`M${x - 4} ${(bottom - 9).toFixed(1)}H${x + w + 4}M${x - 4} ${bottom.toFixed(1)}H${x + w + 4}M${x + w / 2 - 9} ${bottom.toFixed(1)}v5h18v-5`} width={width * 0.75} taper={false} seed={`${seed}/rli`} />
      <Ink d={`M${x} ${y}V${bottom.toFixed(1)}M${x + w} ${y}V${bottom.toFixed(1)}`} width={width * 0.8} taper={false} seed={`${seed}/sd`} />
    </>
  );
};

/** Bottom rail y of a ShutterCurtain at t (where its padlock / tag hang). */
export const curtainBottom = (t: number, y: number, h: number, slamAt?: number, stopAt = 1) => {
  const [k, jolt] = curtainDrop(t, slamAt, stopAt);
  return y + h * k + jolt;
};

// ---------------------------------------------------------------- lettered "back soon" tag

/** A LETTERED 'back soon' tag (props request): a white tag with clipped top corners on a short string, the words in
 *  CaptionHand. (x, y) = hang point; `w` = tag width (world px); one line when wide enough, else 'back' / 'soon'.
 *  Appears at `at` (scale pop) swinging -16 -> 0 deg (settles in ~0.35 s); `tapAt` swings it again. */
export const BackSoonTag: React.FC<{x: number; y: number; w?: number; at?: number; tapAt?: number; width?: number; font?: number; tilt?: number; seed?: string}> = ({x, y, w = 90, at, tapAt, width = 2.2, font, tilt = 0, seed = 'bst'}) => {
  useCaptionFont();
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const oneLine = w >= 88;
  const fs = font ?? (oneLine ? w * 0.27 : w * 0.36);
  const H = oneLine ? fs * 1.55 : fs * 2.35;
  const str = 9;
  const a = pendulum(t, at, -16, 0.42, 0.45) + (tapAt !== undefined ? pendulum(t, tapAt, 12, 0.42, 0.5) : 0) + tilt;
  const pop = at !== undefined ? Math.min(1, 0.3 + springAt(t, at, springs.pop) * 0.7) : 1;
  const c = 7;
  const body = polyPath([[-w / 2 + c, str], [w / 2 - c, str], [w / 2, str + c], [w / 2, str + H], [-w / 2, str + H], [-w / 2, str + c]]);
  const off = misregScreen(seed);
  const textY = oneLine ? str + H * 0.68 : str + H * 0.47;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(a), mat.scale(pop))}>
      <Ink d={line(0, 0, 0, str + 2, {over: [0, 0], seed: `${seed}/str`})} width={width * 0.7} taper={false} seed={`${seed}/str`} />
      <Fill d={body} color={palette.white} offset={[off[0] * 0.6, off[1] * 0.6]} seed={`${seed}/f`} />
      <Ink d={body} width={width} taper={false} seed={`${seed}/o`} />
      <Ink d={circle(0, str + 5, 2, {seed: `${seed}/h`})} width={width * 0.55} taper={false} seed={`${seed}/h`} />
      <text x={0} y={textY} textAnchor="middle" fontFamily={captionFontStack} fontSize={fs} fill={palette.ink}>
        {oneLine ? 'back soon' : 'back'}
      </text>
      {oneLine ? null : (
        <text x={0} y={textY + fs * 0.92} textAnchor="middle" fontFamily={captionFontStack} fontSize={fs} fill={palette.ink}>
          soon
        </text>
      )}
    </XG>
  );
};
