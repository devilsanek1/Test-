// Fill.tsx — flat colour fills, slightly MISREGISTERED from the linework (offset a few px, like a misaligned print),
// optionally CLIPPED TO THE PANEL (card layout; full-bleed <World> scenes are unclipped), projected inside a <Plane>,
// with the measured entrance modes and the un-build recipe (docs/motion_spec.md). NOTHING FADES.
//
//   <Fill d={rectPath(100, 200, 300, 180)} color={palette.peach} at={1.4} />              // grows 20% -> 100% in 0.12 s
//   <Fill rect={[100, 200, 300, 180]} color={palette.teal} at={2} mode="wipe" dir="up" />  // base wipe, 0.12 s linear
//   <Fill d={blob(480, 400, 60, 60)} color={palette.sun} at={3} mode="snap" />            // hard 1-frame pop
//   <Drawn d={circle(...)} fill={palette.sage} at={1} />  // ink first, fill lands 0.13-0.27 s after the outline starts
//
// Modes: pop (default: centre grow 0.2 -> 1 over MOTION.fillGrow, no overshoot) | snap (1-frame pop) | wipe (reveal
// toward `dir`, linear) | grow (scale from the edge opposite `dir`, out-expo 0.2 s) | spring (centre pop with the 7%
// overshoot spring) | none. 'fade' is accepted for old code and behaves like 'snap' (@deprecated: nothing fades).
// Time of day: the colour goes through the current <Tod> (lib/tod.tsx: reference 2's relight step table). When a timed
// <World sky> key changes the light, each fill flips WHOLE in one frame as the sky's wipe edge reaches its centre (or
// its <TodAnchor>), so objects relight staggered by height. The World sky itself (lookExempt) is never relit.
// Exit (un-build): every fill shrinks to its centre (ease-in, small ones first); the big background slab (>= ~55% of
// the frame: sky, a bleed ground, a wall) collapses downward last, under the World sky's ONE falling edge (a slab fill
// is eaten by that shared edge when it reaches it: never a second slab with its own top edge). Inside an <ExitSync>
// (every Person) all fills share the group's jitter, so a figure leaves as one.
// CLEAN PEN (opt-in, lib/pen.ts setPen('clean'); off by default): fills are registered EXACTLY (no offset, authored
// offsets included), and on the calmer ATTENTION TIERS (lib/tier.tsx: support, environment) the colour is pulled toward
// the scope's background and its chroma eased. Backdrops (>= ~30 % of the frame, camera excluded), emissive colours
// and lookExempt fills keep theirs.

import React, {createContext, useContext, useId, useMemo} from 'react';
import {getBoundingBox} from '@remotion/paths';
import {misreg, panel as panelGeo} from './theme';
import {Ease, ease as E, prog, springAt, springs, useTime} from './time';
import {exitFillProgress, SLAB_SIZE, useExit, useExitSync, useLook, useSlab} from './exit';
import {palette} from './theme';
import {rand, rng, Seed} from './rng';
import {Ink, InkProps} from './Ink';
import {MOTION} from './spec';
import {applyH, projectPath} from './persp';
import {relightAt, useTodValue} from './tod';
import {isClean, PEN, tierFill} from './pen';
import {useLocalScale, useTierScope} from './tier';

import {rectPath} from './sketch';
import {mat, useProj, useXf} from './xf';

export type BBox = {x: number; y: number; w: number; h: number};
const bboxCache = new Map<string, BBox>();
export function bbox(d: string): BBox {
  let b = bboxCache.get(d);
  if (!b) {
    try {
      const r = getBoundingBox(d);
      b = {x: r.x1, y: r.y1, w: r.x2 - r.x1, h: r.y2 - r.y1};
    } catch {
      b = {x: 0, y: 0, w: 0, h: 0};
    }
    if (bboxCache.size > 20000) bboxCache.clear();
    bboxCache.set(d, b);
  }
  return b;
}

// ---------------------------------------------------------------- panel clipping

type ClipV = {id: string | null; rect: [number, number, number, number]};
const ClipCtx = createContext<ClipV>({id: null, rect: [panelGeo.x, panelGeo.y, panelGeo.w, panelGeo.h]});

/** Defines the panel clip for a subtree (Art does this for every scene). rect defaults to theme.panel. */
export const PanelClip: React.FC<{children?: React.ReactNode; rect?: [number, number, number, number]}> = ({children, rect = [panelGeo.x, panelGeo.y, panelGeo.w, panelGeo.h]}) => {
  const id = 'pc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={rect[0]} y={rect[1]} width={rect[2]} height={rect[3]} />
        </clipPath>
      </defs>
      <ClipCtx.Provider value={{id, rect}}>{children}</ClipCtx.Provider>
    </>
  );
};

/** Fills inside are NOT clipped to the panel (actors: people, cat, props, the sun). */
export const Unclipped: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const v = useContext(ClipCtx);
  return <ClipCtx.Provider value={{id: null, rect: v.rect}}>{children}</ClipCtx.Provider>;
};

/** Current panel-clip context ({id, rect}); id null = unclipped. */
export const useFillClip = () => useContext(ClipCtx);

// ---------------------------------------------------------------- frame area (un-build ordering)

const AreaCtx = createContext<number>(panelGeo.w * panelGeo.h);
/** Reference area for "how big is this fill" (un-build order). <World> sets the full frame; the card uses the panel. */
export const FrameArea = AreaCtx.Provider;

// ---------------------------------------------------------------- Fill

/** Fill entrance modes. `'fade'` is @deprecated: it is a 1-frame snap (nothing fades); use 'snap'. */
export type FillMode = 'pop' | 'snap' | 'wipe' | 'grow' | 'spring' | 'none' | /** @deprecated nothing fades: = 'snap' */ 'fade';
export type Dir = 'right' | 'left' | 'up' | 'down';

export type FillProps = {
  /** Closed path. Or use `rect`. */
  d?: string;
  /** [x, y, w, h] shortcut. */
  rect?: [number, number, number, number];
  color: string;
  /** Entrance start (scene s). Omit = already there. */
  at?: number;
  /** Entrance duration. Defaults: pop 0.12, wipe 0.12, grow 0.2 (spring/snap ignore it). */
  dur?: number;
  ease?: Ease;
  mode?: FillMode;
  /** wipe: reveal direction (default 'right'); grow: growth direction (default 'up'). */
  dir?: Dir;
  /** pop/grow origin in the same coordinates. Default: bbox centre (pop) / bbox edge (grow). */
  origin?: [number, number];
  /** Misregistration offset. Default: theme misreg + seeded jitter. false = exact. */
  offset?: [number, number] | false;
  seed?: Seed;
  /** STATIC opacity for translucent light shafts / glows only. Never animate it. */
  opacity?: number;
  /** React to SceneExit (default true). */
  exit?: boolean;
  /** 'collapse' (shrink to the centre / origin) | 'wipe' (retreat toward exitDir) | 'slab' (wipe down, last).
   *  Default: collapse; fills covering >= ~55% of the frame behave as 'slab'. 'fade' is @deprecated (= collapse). */
  exitMode?: /** @deprecated nothing fades: = 'collapse' */ 'fade' | 'collapse' | 'wipe' | 'slab';
  /** exitMode 'wipe': the direction the remaining fill retreats toward (default = dir). 'down' = the top edge
   *  drops to the bottom (the reference's wall collapse). */
  exitDir?: Dir;
  /** Clip to the panel (default: follow context; Art clips, <Unclipped> doesn't). */
  clip?: boolean;
  rule?: 'nonzero' | 'evenodd';
  style?: React.CSSProperties;
  /** Ignore <Look> (keep the colour in paper / cascade states). The World sky uses this. */
  lookExempt?: boolean;
  /** Clean pen: a backdrop (a sky, a wall, a ground plane): never recoloured by an attention tier, whatever its size. */
  backdrop?: boolean;
};

const growOrigin = (b: BBox, dir: Dir): [number, number] =>
  dir === 'up' ? [b.x + b.w / 2, b.y + b.h] : dir === 'down' ? [b.x + b.w / 2, b.y] : dir === 'right' ? [b.x, b.y + b.h / 2] : [b.x + b.w, b.y + b.h / 2];

function inset(dir: Dir, visible: number, fromEnd = false): string {
  const h = ((1 - visible) * 100).toFixed(2) + '%';
  switch (dir) {
    case 'right':
      return fromEnd ? `inset(0 0 0 ${h})` : `inset(0 ${h} 0 0)`;
    case 'left':
      return fromEnd ? `inset(0 ${h} 0 0)` : `inset(0 0 0 ${h})`;
    case 'up':
      return fromEnd ? `inset(0 0 ${h} 0)` : `inset(${h} 0 0 0)`;
    case 'down':
      return fromEnd ? `inset(${h} 0 0 0)` : `inset(0 0 ${h} 0)`;
  }
}


export const Fill: React.FC<FillProps> = ({
  d: dIn,
  rect,
  color,
  at,
  dur,
  ease,
  mode = 'pop',
  dir,
  origin,
  offset,
  seed,
  opacity = 1,
  exit = true,
  exitMode,
  exitDir,
  clip,
  rule,
  style,
  lookExempt,
  backdrop,
}) => {
  const t = useTime();
  const e = useExit();
  const sync = useExitSync();
  const slab = useSlab();
  const look = useLook();
  const tv = useTodValue();
  const clipCtx = useContext(ClipCtx);
  const area = useContext(AreaCtx);
  const proj = useProj();
  const m = useXf();
  const localId = 'fc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const scope = useTierScope();
  const local = useLocalScale();
  const clean = isClean();
  const dLocal = useMemo(() => dIn ?? (rect ? rectPath(rect[0], rect[1], rect[2], rect[3]) : ''), [dIn, rect?.[0], rect?.[1], rect?.[2], rect?.[3]]);
  const d = proj && dLocal ? projectPath(dLocal, proj.H, proj.key) : dLocal;
  const {jit, off} = useMemo(() => {
    const r = rng(seed ?? dLocal.slice(0, 48));
    const o: [number, number] = offset === false ? [0, 0] : offset ?? [misreg.dx + r.jitter(misreg.jitter), misreg.dy + r.jitter(misreg.jitter)];
    return {jit: r.next(), off: clean ? ([0, 0] as [number, number]) : o};
  }, [seed, dLocal, offset === false ? 0 : offset?.[0], offset === false ? 0 : offset?.[1], clean]);
  if (!d) return null;
  if (at !== undefined && t < at) return null;
  if (!lookExempt && look.fills === 'none') return null;
  const box = rect && !proj ? {x: rect[0], y: rect[1], w: rect[2], h: rect[3]} : bbox(d);
  // time of day: during a relight wave the fill flips whole, in one frame, when the sky edge reaches its centre
  // (or its <TodAnchor>): motion spec #12, never a clip edge through the object
  const screenC: [number, number] | undefined = tv.wave && !tv.anchor ? [m[0] * (box.x + box.w / 2) + m[2] * (box.y + box.h / 2) + m[4], m[1] * (box.x + box.w / 2) + m[3] * (box.y + box.h / 2) + m[5]] : undefined;
  let paint = lookExempt ? color : tv.tod === 'day' && !tv.wave && !tv.map ? color : relightAt(tv, color, screenC);
  if (clean && !lookExempt && !backdrop) {
    // the calmer tiers: pulled toward the background, chroma eased (never a backdrop or an emissive colour)
    const tier = scope?.tier ?? PEN.untagged;
    if (tier !== 'subject' && Math.sqrt(Math.min(1, (box.w * box.h * local * local) / area)) < PEN.backdrop) paint = tierFill(paint, tier, scope?.bg ?? PEN.bg);
  }
  if (!lookExempt && look.fills === 'paper') paint = palette.white;
  else if (!lookExempt && look.cascade) {
    const c = look.cascade;
    const dist = Math.hypot(m[0] * (box.x + box.w / 2) + m[2] * (box.y + box.h / 2) + m[4] - c.origin[0], m[1] * (box.x + box.w / 2) + m[3] * (box.y + box.h / 2) + m[5] - c.origin[1]);
    if (t < c.at + dist / (c.speed ?? 2600)) paint = palette.white;
  }
  const size = Math.sqrt(Math.min(1, (box.w * box.h * Math.abs(m[0] * m[3] - m[1] * m[2])) / area));
  const drain = exit ? exitFillProgress(e, sync ? sync.jitter : jit, size) : 0;
  if (drain >= 1) return null;
  const org0: [number, number] | undefined = origin ? (proj ? applyH(proj.H, origin[0], origin[1]) : origin) : undefined;

  const md: FillMode = mode === 'fade' ? 'snap' : mode;
  const wdir: Dir = dir ?? (md === 'grow' ? 'up' : 'right');
  let scale = 1;
  let sx = 1;
  let sy = 1;
  let clipCss: string | undefined;
  let org: [number, number] | null = null;
  let slabClip: React.ReactNode = null;

  if (at !== undefined) {
    if (md === 'pop') {
      const p = prog(t, at, dur ?? MOTION.fillGrow.dur, ease ?? E.outCubic);
      scale = MOTION.fillGrow.from + (1 - MOTION.fillGrow.from) * p;
      org = org0 ?? [box.x + box.w / 2, box.y + box.h / 2];
    } else if (md === 'spring') {
      scale = springAt(t, at, springs.pop);
      org = org0 ?? [box.x + box.w / 2, box.y + box.h / 2];
    } else if (md === 'grow') {
      const g = prog(t, at, dur ?? 0.2, ease ?? E.outExpo);
      org = org0 ?? growOrigin(box, wdir);
      if (wdir === 'up' || wdir === 'down') sy = g;
      else sx = g;
    } else if (md === 'wipe') {
      const p = prog(t, at, dur ?? MOTION.baseWipe.dur, ease ?? E.linear);
      if (p < 1) clipCss = inset(wdir, p);
    }
  }

  if (drain > 0) {
    const xm = exitMode === 'fade' ? 'collapse' : exitMode ?? (size >= SLAB_SIZE ? 'slab' : 'collapse');
    const k = E.inCubic(drain);
    if (xm === 'slab' && slab) {
      // ONE slab: the World sky's falling edge (world y = rect.y + rect.h * k), mapped into this fill's local space
      const [rx, ry, rw, rh] = slab.rect;
      if (k >= 1) return null;
      slabClip = (
        <clipPath id={`${localId}s`} clipPathUnits="userSpaceOnUse">
          <rect x={rx - rw} y={ry + rh * k} width={rw * 3} height={rh * (1 - k) + rh} transform={mat.str(mat.mul(mat.inv(m), slab.m))} />
        </clipPath>
      );
    } else if (xm === 'slab') clipCss = inset('down', 1 - k, true);
    else if (xm === 'wipe') clipCss = inset(exitDir ?? wdir, 1 - k, true);
    else {
      if (!org) org = org0 ?? (md === 'grow' ? growOrigin(box, wdir) : [box.x + box.w / 2, box.y + box.h / 2]);
      if (md === 'grow' && (wdir === 'right' || wdir === 'left')) sx *= 1 - k;
      else if (md === 'grow') sy *= 1 - k;
      else scale *= 1 - k;
    }
  }
  if (scale <= 0.001 || sx <= 0.001 || sy <= 0.001) return null;

  let tr = `translate(${off[0].toFixed(2)} ${off[1].toFixed(2)})`;
  if (org && (scale !== 1 || sx !== 1 || sy !== 1)) {
    tr += ` translate(${org[0]} ${org[1]}) scale(${(scale * sx).toFixed(4)} ${(scale * sy).toFixed(4)}) translate(${-org[0]} ${-org[1]})`;
  }
  const shape = <path d={d} fill={paint} fillRule={rule} opacity={opacity < 1 ? opacity : undefined} transform={tr} style={clipCss ? {...style, clipPath: clipCss} : style} />;
  const path = slabClip ? (
    <>
      <defs>{slabClip}</defs>
      <g clipPath={`url(#${localId}s)`}>{shape}</g>
    </>
  ) : (
    shape
  );

  const doClip = clip ?? clipCtx.id !== null;
  if (!doClip || !clipCtx.id) return path;
  if (mat.isIdentity(m)) return <g clipPath={`url(#${clipCtx.id})`}>{path}</g>;
  // inside a transformed group: clip with the panel rect mapped into local coordinates
  const [px, py, pw, ph] = clipCtx.rect;
  return (
    <>
      <defs>
        <clipPath id={localId} clipPathUnits="userSpaceOnUse">
          <rect x={px} y={py} width={pw} height={ph} transform={mat.str(mat.inv(m))} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${localId})`}>{path}</g>
    </>
  );
};

// ---------------------------------------------------------------- Drawn: ink + fill a beat later

export type DrawnProps = InkProps & {
  /** Fill colour (omit for linework only). */
  fill?: string;
  /** Closed shape for the fill (default: same as `d`). */
  fillD?: string;
  fillMode?: FillMode;
  fillDir?: Dir;
  fillDur?: number;
  /** Fill lag after the OUTLINE STARTS (s). Default: seeded 0.13-0.27 (MOTION.fillLag). */
  fillDelay?: number;
  fillOffset?: [number, number] | false;
  fillOpacity?: number;
  fillClip?: boolean;
};

/** Linework + misregistered fill that lands 4-8 frames after the outline starts (ink-first mode). */
export const Drawn: React.FC<DrawnProps> = ({fill, fillD, fillMode = 'pop', fillDir, fillDur, fillDelay, fillOffset, fillOpacity, fillClip, ...ink}) => {
  const lag = fillDelay ?? MOTION.fillLag.min + (MOTION.fillLag.max - MOTION.fillLag.min) * rand(ink.seed ?? ink.d.slice(0, 32), 'lag');
  const fillAt = ink.at !== undefined ? ink.at + lag : undefined;
  return (
    <>
      {fill ? (
        <Fill d={fillD ?? ink.d} color={fill} at={fillAt} mode={fillMode} dir={fillDir} dur={fillDur} offset={fillOffset} seed={ink.seed} opacity={fillOpacity} exit={ink.exit} clip={fillClip} />
      ) : null}
      <Ink {...ink} />
    </>
  );
};
