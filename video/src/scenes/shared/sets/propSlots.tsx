// sets/propSlots.tsx — THE ONLY PLACE THE SETS IMPORT PROPS FROM.
//
// Each export is a slot named after the props-lane component it stands for (src/scenes/shared/props/**, built in
// parallel). While a prop is not ready, the slot draws a simple on-style PLACEHOLDER (marked `PLACEHOLDER`); when the
// prop lands, the slot body becomes a one-line adapter to it, and every set picks it up. Scenes can also replace any
// slot per set instance through the set's `slots` prop.
//
// Slot geometry conventions: (x, y) = centre unless the name says otherwise; sizes in the parent's units.

import React from 'react';
import {palette, stroke} from '../../../lib/theme';
import {ease as E, osc, prog, springAt, springs, useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {arc, blob, check, circle, ellipse, hline, line, polyPath, rect, rectPath, roundRect, smooth} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {Noticeboard} from '../../../lib/kit';
import {Seed} from '../../../lib/rng';
import {popK, PopAt} from './common';
import {BackSoonTag, Bit, BrowserChrome, CheckFlag, CheckMark, ElephantEmblem, ElephantPlaque, ElephantStamp, Lock, RollerShutter, ShutterPadlock, TargetRing, WrenchTag} from '../props';

// ---------------------------------------------------------------- elephant emblem (P2 ElephantEmblem stand-in)

/** PLACEHOLDER for props ElephantEmblem: a generic side-on elephant with its trunk raised, as one ink path in a
 *  unit box (-0.5..0.5), scaled by `s`. Never periwinkle, never the PHP logo. */
export function elephantPath(cx: number, cy: number, s: number, old = false): string {
  const P = (x: number, y: number) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
  // body + head + raised trunk, two legs, ear, tail
  const body = `M${P(-0.34, 0.18)}C${P(-0.42, -0.05)} ${P(-0.28, -0.24)} ${P(-0.02, -0.22)}C${P(0.12, -0.3)} ${P(0.3, -0.26)} ${P(0.33, -0.1)}C${P(0.4, -0.18)} ${P(0.42, -0.36)} ${P(0.36, -0.44)}`;
  const under = `M${P(0.3, 0.02)}C${P(0.3, 0.12)} ${P(0.22, 0.2)} ${P(0.18, 0.22)}L${P(-0.3, 0.22)}`;
  const legs = `M${P(-0.24, 0.2)}L${P(-0.24, 0.36)}M${P(-0.12, 0.2)}L${P(-0.12, 0.36)}M${P(0.08, 0.2)}L${P(0.08, 0.36)}M${P(0.18, 0.2)}L${P(0.18, 0.36)}`;
  const ear = `M${P(0.12, -0.18)}C${P(0.02, -0.1)} ${P(0.04, 0.06)} ${P(0.16, 0.04)}`;
  const tail = `M${P(-0.36, 0.04)}C${P(-0.44, 0.08)} ${P(-0.46, 0.14)} ${P(-0.44, 0.18)}`;
  const eye = `M${P(0.24, -0.14)}l0.01 0`;
  const curl = old ? `M${P(0.36, -0.44)}C${P(0.3, -0.5)} ${P(0.26, -0.42)} ${P(0.32, -0.4)}` : '';
  return body + under + legs + ear + tail + eye + curl;
}

export const ElephantGlyph: React.FC<{x: number; y: number; s: number; width?: number; color?: string; at?: number; old?: boolean}> = ({x, y, s, width = stroke.inkThin, color = palette.ink, at, old}) => (
  <Ink d={elephantPath(x, y, s, old)} width={width} color={color} at={at} taper={false} vary={0} />
);

// ---------------------------------------------------------------- P4 BrowserChrome

export type ChromeSlotProps = {
  /** Window rect (top-left, size). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Chrome reveal (bar wipes on, dots pop 0.04 s apart, pill draws 0.2 s). Omit = already there. */
  chromeAt?: number;
  /** false = a plain window (no chrome yet / ever). */
  chrome?: boolean;
  /** Screen content (cream glow + peach header + 3 hairlines) pops on. Omit = on. */
  screenOnAt?: number;
  /** Screen goes dark (tealDark). */
  offAt?: number;
  /** Level of detail: 'full' | 'simple' (bar + dots + screen fill, no hairlines) | 'dots' (a lit rect + 3 dots). */
  lod?: 'full' | 'simple' | 'dots';
  /** Frame ink (on-screen px of the parent). */
  width?: number;
  seed?: Seed;
  /** Glass colour of the plain window state. */
  glass?: string;
};

/** -> props BrowserChrome (P4). `chrome={false}` = a plain window forever. */
export const ChromeSlot: React.FC<ChromeSlotProps> = ({x, y, w, h, chromeAt, chrome = true, screenOnAt, offAt, lod = 'full', width = stroke.ink, seed = 'chrome', glass = palette.sage}) => (
  <BrowserChrome
    x={x}
    y={y}
    w={w}
    h={h}
    chromeAt={chrome ? chromeAt : 1e9}
    plainFirst={!chrome || chromeAt !== undefined}
    screenOnAt={screenOnAt}
    offAt={offAt}
    mode={lod === 'dots' ? 'dots' : 'window'}
    ink={width}
    glass={glass}
    seed={seed}
  />
);

// ---------------------------------------------------------------- P1 Lock

export type LockVariant = 'closed' | 'open' | 'blueprint' | 'sketch' | 'ghost' | 'dot' | 'fixed';
export type LockSlotProps = {x: number; y: number; w: number; h: number; variant?: LockVariant; width?: number; seed?: Seed; at?: number};

/** -> props Lock (P1). (x, y) = box centre, h = box height (the prop's width is 0.8 h). */
export const LockSlot: React.FC<LockSlotProps> = ({x, y, h, variant = 'closed', width = stroke.inkThin, seed = 'lock', at}) => <Lock x={x} y={y} size={h} state={variant} ink={width} at={at} seed={seed} />;

// ---------------------------------------------------------------- P2 ElephantPlaque

export type PlaqueVariant = 'new' | 'blank' | 'old' | 'dot';
/** -> props ElephantPlaque (P2): 'new' sand plate, 'blank' cream, 'old' tan + chipped corner, 'dot' LOD. `at` = tick-on pop. */
export const PlaqueSlot: React.FC<{x: number; y: number; size: number; variant?: PlaqueVariant; width?: number; seed?: Seed; at?: number}> = ({x, y, size, variant = 'new', width = stroke.inkThin, seed = 'plq', at}) => (
  <ElephantPlaque x={x} y={y} size={size} variant={variant === 'blank' ? 'blank' : variant === 'dot' ? 'dot' : 'plate'} age={variant === 'old' ? 'old' : 'new'} tickOnAt={at} ink={width} seed={seed} />
);

// ---------------------------------------------------------------- P3 Bit

/** -> props Bit (P3): solid ink beetle (16 x 10 at size 16). */
export const BitSlot: React.FC<{x: number; y: number; size?: number; flip?: boolean; at?: number; seed?: Seed; state?: 'idle' | 'silhouette'}> = ({x, y, size = 16, flip, at, seed = 'bit', state = 'idle'}) => <Bit x={x} y={y} size={size} flip={flip} at={at} seed={seed} state={state} />;

// ---------------------------------------------------------------- P5 shutter set

/** -> props RollerShutter (P5): box (18 px) above the window rect; slams over it at `slamAt` (0.16 s, 6 px bounce). */
export const ShutterSlot: React.FC<{x: number; y: number; w: number; h: number; slamAt?: number; down?: boolean; boxH?: number; peephole?: [number, number]; width?: number; seed?: Seed}> = ({x, y, w, h, slamAt, down, boxH = 18, peephole, width = stroke.ink, seed = 'sh'}) => (
  <RollerShutter x={x} y={y} w={w} h={h} box={boxH} slamAt={slamAt} state={down ? 'down' : 'up'} peephole={peephole ? {x: peephole[0], y: peephole[1]} : undefined} width={width} seed={seed} />
);

/** -> props ShutterPadlock (P5): 24 x 28, sand body, ink shackle, cream glint (distinct from the door lock). */
export const PadlockSlot: React.FC<{x: number; y: number; size?: number; at?: number; glintAt?: number; seed?: Seed}> = ({x, y, size = 28, at, glintAt, seed = 'pl'}) => <ShutterPadlock x={x} y={y} size={size} at={at} glintAt={glintAt} seed={seed} />;

/** -> props BackSoonTag (P5): white 30 x 36 tag with an ink clock, hung from (x, y); swings from `at`, again on `tapAt`. */
export const BackSoonSlot: React.FC<{x: number; y: number; at?: number; tapAt?: number; seed?: Seed}> = ({x, y, at, tapAt, seed = 'tag'}) => <BackSoonTag x={x} y={y} at={at} tapAt={tapAt} seed={seed} />;

// ---------------------------------------------------------------- P17 Bollard

/** PLACEHOLDER for props Bollard (P17): cream post 50 x 90, ink 4.8; (x, y) = top centre (Pip's feet). */
export const BollardSlot: React.FC<{x: number; y: number; w?: number; h?: number; width?: number; seed?: Seed; at?: number}> = ({x, y, w = 50, h = 90, width = stroke.inkBold, seed = 'bollard', at}) => (
  <PopAt at={at} x={x} y={y + h}>
    <Fill d={`M${x - w / 2} ${y + h}L${x - w / 2} ${y + w * 0.3}Q${x - w / 2} ${y} ${x} ${y}Q${x + w / 2} ${y} ${x + w / 2} ${y + w * 0.3}L${x + w / 2} ${y + h}Z`} color={palette.cream} seed={`${seed}/f`} />
    <Ink d={`M${x - w / 2} ${y + h + 6}L${x - w / 2} ${y + w * 0.3}Q${x - w / 2} ${y} ${x} ${y}Q${x + w / 2} ${y} ${x + w / 2} ${y + w * 0.3}L${x + w / 2} ${y + h + 6}` + hline(x - w / 2, x + w / 2, y + w * 0.62, {seed: `${seed}/b`, over: 'small'})} width={width} taper={false} />
  </PopAt>
);

// ---------------------------------------------------------------- hanging signs (P2 variants)

/** -> props ElephantPlaque 'round' (S06 r45 / S07 r40): sand disc on an iron bracket from the wall at wallX; (x, y) =
 *  the disc centre. `swingAt` = pendulum -16 -> 0 deg over 0.5 s. */
export const RoundSignSlot: React.FC<{x: number; y: number; r: number; wallX: number; swingAt?: number; width?: number; seed?: Seed}> = ({x, y, r, wallX, swingAt, width = stroke.ink, seed = 'rsign'}) => {
  const b = bracketFor(x, y, r * 2, wallX);
  return <ElephantPlaque x={b.x} y={b.y} size={r * 2} variant="round" side={b.side} arm={b.arm} swingAt={swingAt} ink={width} seed={seed} />;
};

/** -> props ElephantPlaque 'hanging' (S12 / S13, 110-130 px): (x, y) = the plate centre, bracket from wallX. */
export const HangingPlaqueSlot: React.FC<{x: number; y: number; size: number; wallX: number; variant?: PlaqueVariant; swingAt?: number; flipOldAt?: number; cobwebAt?: number; dustAt?: number; caneAt?: number; at?: number; seed?: Seed}> = ({x, y, size, wallX, variant = 'new', swingAt, flipOldAt, cobwebAt, dustAt, caneAt, at, seed = 'hp'}) => {
  const b = bracketFor(x, y, size, wallX);
  return (
    <ElephantPlaque x={b.x} y={b.y} size={size} variant="hanging" age={variant === 'old' ? 'old' : 'new'} side={b.side} arm={b.arm} swingAt={swingAt} flipOldAt={flipOldAt} cobwebAt={cobwebAt} dustAt={dustAt} caneAt={caneAt} at={at} ink={stroke.ink} seed={seed} />
  );
};

/** Bracket root for a hanging sign whose face centre is (x, y): the props lane hangs the face at hook = 0.66 arm, 16 + 50
 *  local units below the bracket (local unit = size / 100). */
export function bracketFor(x: number, y: number, size: number, wallX: number): {x: number; y: number; side: 'left' | 'right'; arm: number} {
  const side = x >= wallX ? 'right' : 'left';
  const arm = Math.max(size * 0.6, Math.abs(x - wallX) / 0.66);
  return {x: x - (side === 'right' ? 1 : -1) * arm * 0.66, y: y - (66 * size) / 100, side, arm};
}

// ---------------------------------------------------------------- P15 glyphs, flags, rings

/** -> props CheckFlag: (x, y) = pole foot, size = flag width (60). */
export const CheckFlagSlot: React.FC<{x: number; y: number; size?: number; at?: number; raiseAt?: number; width?: number; seed?: Seed}> = ({x, y, size = 60, at, raiseAt, width = stroke.ink, seed = 'cf'}) => <CheckFlag x={x} y={y} size={size} at={at} raiseAt={raiseAt} width={width} seed={seed} />;

/** -> props TargetRing / LoadingRing (P6): peach ring + ink outline; pops at `at`. */
export const TargetRingSlot: React.FC<{x: number; y: number; r: number; at?: number; width?: number; seed?: Seed}> = ({x, y, r, at, width = stroke.inkThin, seed = 'tr'}) => <TargetRing x={x} y={y} r={r} popAt={at} width={width} seed={seed} />;

/** -> props WrenchTag (P15): sage tag with a cream wrench; size = tag width. */
export const WrenchTagSlot: React.FC<{x: number; y: number; size: number; at?: number; seed?: Seed}> = ({x, y, size, at, seed = 'wt'}) => <WrenchTag x={x} y={y} size={size} at={at} seed={seed} />;

/** Wrench glyph path (centre, length). */
export function wrenchPath(x: number, y: number, L: number): string {
  const a = L * 0.5;
  return `M${x - a * 0.7} ${y + a * 0.7}L${x + a * 0.35} ${y - a * 0.35}M${x + a * 0.2} ${y - a * 0.75}a${a * 0.32} ${a * 0.32} 0 1 0 ${a * 0.55} ${a * 0.55}`;
}
/** Magnifier glyph path (centre, radius of the lens). */
export function magnifierPath(x: number, y: number, r: number): string {
  return circle(x - r * 0.2, y - r * 0.2, r, {seed: `mg${Math.round(x)}`}) + line(x + r * 0.5, y + r * 0.5, x + r * 1.3, y + r * 1.3, {over: 0, seed: `mgh${Math.round(x)}`});
}

// ---------------------------------------------------------------- P8 Noticeboard with address rail

/** PLACEHOLDER for props NoticeboardRail (P8): kit Noticeboard (teal frame, two mintPale panes, legs) + an
 *  address-bar rail (cream pill + three dots) on the top frame. Frame rect x, y, w, h; legs to legsY. */
export const NoticeboardSlot: React.FC<{x: number; y: number; w: number; h: number; legsY: number; rail?: [number, number, number, number]; at?: number; seed?: Seed; children?: React.ReactNode}> = ({x, y, w, h, legsY, rail, at, seed = 'nb', children}) => (
  <>
    <Noticeboard x={x} y={y} w={w} h={h} legs={legsY - (y + h)} at={at} seed={seed}>
      {children}
    </Noticeboard>
    {rail ? (
      <>
        <Fill d={roundRect(rail[0], rail[1], rail[2], rail[3], rail[3] / 2)} color={palette.cream} at={at} seed={`${seed}/rail`} />
        <Ink d={roundRect(rail[0], rail[1], rail[2], rail[3], rail[3] / 2, {closed: false, seed: `${seed}/raili`})} width={stroke.inkThin} at={at} taper={false} />
        {[palette.cream, palette.sage, palette.peach].map((c, i) => (
          <circle key={i} cx={rail[0] + rail[3] * 0.7 + i * rail[3] * 0.62} cy={rail[1] + rail[3] / 2} r={rail[3] * 0.22} fill={c} stroke={palette.ink} strokeWidth={1} />
        ))}
      </>
    ) : null}
  </>
);

// ---------------------------------------------------------------- P2 ElephantStamp, P14 Calendar

/** -> props ElephantStamp: perspective ellipse print (S02) or round corner stamp (S05). `at` = the slam. */
export const ElephantStampSlot: React.FC<{x: number; y: number; rx: number; ry: number; ring?: number; at?: number; seed?: Seed}> = ({x, y, rx, ry, ring = 14, at, seed = 'stamp'}) => <ElephantStamp x={x} y={y} rx={rx} ry={ry} ring={ring} slamAt={at} seed={seed} />;

/** PLACEHOLDER for props Calendar (P14): tear-off calendar 70 x 80, cream pages, sand header, no numerals. */
export const CalendarSlot: React.FC<{x: number; y: number; w?: number; h?: number; at?: number; seed?: Seed}> = ({x, y, w = 70, h = 80, at, seed = 'cal'}) => (
  <PopAt at={at} x={x + w / 2} y={y}>
    <Fill rect={[x, y, w, h]} color={palette.cream} seed={`${seed}/p`} />
    <Fill rect={[x, y, w, h * 0.22]} color={palette.sand} offset={false} seed={`${seed}/h`} />
    <Ink d={rect(x, y, w, h, {seed: `${seed}/o`, over: 'small'}) + hline(x, x + w, y + h * 0.22, {seed: `${seed}/hl`, over: 0}) + circle(x + w * 0.5, y + h * 0.6, w * 0.16, {seed: `${seed}/s`})} width={stroke.inkThin} taper={false} />
  </PopAt>
);

/** -> props CheckMark (P15): strokes on over 0.17 s from `at`. */
export const CheckSlot: React.FC<{x: number; y: number; size: number; at?: number; width?: number}> = ({x, y, size, at, width = stroke.inkBold}) => <CheckMark x={x} y={y} size={size} at={at} width={width} />;

/** -> props ElephantEmblem: the generic ink elephant (blueprints, stamps). (x, y) = centre, size = width. */
export const EmblemSlot: React.FC<{x: number; y: number; size: number; width?: number; bg?: string; old?: boolean; at?: number; seed?: Seed}> = ({x, y, size, width, bg = palette.white, old, at, seed = 'emb'}) => <ElephantEmblem x={x} y={y} size={size} ink={width} bg={bg} style={old ? 'old' : 'modern'} mode="line" at={at} seed={seed} />;

/** re-export for sets that draw the props-lane glyph shapes themselves */
export {smooth, arc, springAt, springs, rectPath, ellipse, blob, polyPath, popK};
