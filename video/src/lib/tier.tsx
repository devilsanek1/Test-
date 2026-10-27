// tier.tsx — ATTENTION TIERS for the clean pen (lib/pen.ts; docs/look/CRAFT.md §b-§c): which tier a piece of linework
// or a fill belongs to. Everything here is a no-op under the default sketch pen (PEN.mode 'sketch'): v1 / v2 / v2r
// render exactly as before.
//
//   Kit pieces declare a DEFAULT tier (and their tone, the fill their lines bound) once, at the export:
//     export const Mug = tiered('environment', {tone: EMBER.mug}, MugBody);    // <Mug tier="support" /> overrides
//   Scenes FORCE a tier on a whole group (kit pieces' defaults included; an explicit tier prop still wins):
//     <Tier tier="environment" bg={EMBER.sky}>...the far town...</Tier>
//   lib Ink / Fill (and every kit / set / prop drawn with them, lib/kit/Person too) read the scope themselves. Raw SVG
//   in a kit piece asks for its paint:  const line = useTierLine(); <path {...line(EMBER.ink, 2.2)} fill="none" />
//                                       const paint = useTierPaint(); <circle fill={paint(EMBER.snow)} />
//   Idle motion: const k = useTierMotion(); sway(t, 3 * k, ...).
//
// Resolution: an explicit `tier` prop > a forced scope (<Tier>, or an explicit prop higher up) > the piece's default.
// Ink / Fill outside any scope use PEN.untagged ('support', with its tinted lines kept: PEN.untaggedLines). `bg` (what
// calmer fills are pulled toward) and `lines` (draw the tier's tinted lines: CRAFT B "where close values touch, and
// round the mascot") inherit down the tree unless a piece sets its own; `tone` belongs to the piece that sets it.

import React, {createContext, useContext} from 'react';
import {isClean, PEN, PenMode, Tier as TierT, tierFill, tierLightWidth, tierLineColor, tierWidth, lightness, TierSpec} from './pen';
import {useXf} from './xf';
import {useAppliedStageMat} from './stage';
import {useInkScale} from './inkComp';
import {palette} from './theme';

export type {TierSpec, PenMode};
/** 'subject' | 'support' | 'environment' (lib/pen.ts). */
export type Tier = TierT;

export type TierScope = {
  tier: Tier;
  /** Forced scopes (a <Tier>, or a piece given an explicit tier) override nested pieces' defaults. */
  forced: boolean;
  /** The fill the lines inside bound (the piece's main colour): lines are its shade. */
  tone?: string;
  /** The background calmer fills are pulled toward (default PEN.bg). */
  bg?: string;
  /** Draw this tier's contours and strokes as its tinted lines (a tier that draws none by default: support, environment). */
  lines?: boolean;
};

const TierCtx = createContext<TierScope | null>(null);

/** The tier scope here (null outside any scope: Ink / Fill then use PEN.untagged). */
export const useTierScope = () => useContext(TierCtx);

/** The tier in effect here. */
export const useTierHere = (): Tier => useContext(TierCtx)?.tier ?? PEN.untagged;

export type TierProps = {
  /** Attention tier (clean pen only): 'subject' | 'support' | 'environment'. Omit = the piece's default (or the
   *  tier a scene forced on the group it sits in). */
  tier?: Tier;
};

/** Force a tier on everything inside (scene level). `tone` = the fill the raw lines inside bound; `bg` = what calmer
 *  fills inside are pulled toward (e.g. the sky for a far town); `lines` = draw the tier's tinted lines. */
export const Tier: React.FC<{tier: Tier; tone?: string; bg?: string; lines?: boolean; children?: React.ReactNode}> = ({tier, tone, bg, lines, children}) => {
  const parent = useContext(TierCtx);
  return <TierCtx.Provider value={{tier, forced: true, tone, bg: bg ?? parent?.bg, lines: lines ?? parent?.lines}}>{children}</TierCtx.Provider>;
};

/** A piece's scope: explicit prop > forced parent scope > the piece's default. */
export function resolveTier(parent: TierScope | null, prop: Tier | undefined, def: Tier, tone?: string, bg?: string, lines?: boolean): TierScope {
  const inherit = {bg: bg ?? parent?.bg, lines: lines ?? parent?.lines};
  if (prop) return {tier: prop, forced: true, tone, ...inherit};
  if (parent?.forced) return {tier: parent.tier, forced: true, tone, ...inherit};
  return {tier: def, forced: false, tone, ...inherit};
}

type TierOpts<P> = {
  /** The piece's main colour (its lines are its shade), or a function of its props. */
  tone?: string | ((p: P) => string | undefined);
  /** The background its calmer fills are pulled toward (default: inherited, then PEN.bg). */
  bg?: string;
  /** Draw its tier's tinted lines (support / environment draw none by default). Default: inherited. */
  lines?: boolean;
};

/** Wrap a kit piece: it takes an optional `tier` prop, resolves its tier (prop > forced scope > `def`) and provides it
 *  to everything it draws. Under the sketch pen it renders the piece exactly as before (one context provider). */
export function tiered<P extends object>(def: Tier | ((p: P) => Tier), opts: TierOpts<P>, C: React.FC<P>): React.FC<P & TierProps> {
  const W: React.FC<P & TierProps> = (props) => {
    const parent = useContext(TierCtx);
    const d = typeof def === 'function' ? def(props) : def;
    const tone = typeof opts.tone === 'function' ? opts.tone(props) : opts.tone;
    const scope = resolveTier(parent, props.tier, d, tone, opts.bg, opts.lines);
    return (
      <TierCtx.Provider value={scope}>
        <C {...props} />
      </TierCtx.Provider>
    );
  };
  W.displayName = `Tiered(${C.displayName ?? C.name ?? 'piece'})`;
  return W;
}

/** A scope for a part of a piece (a sub-part with its own default tier or tone): same resolution as tiered(); with
 *  no `def` the part keeps its piece's tier. */
export const TierPart: React.FC<{def?: Tier; tier?: Tier; tone?: string; bg?: string; lines?: boolean; children?: React.ReactNode}> = ({def, tier, tone, bg, lines, children}) => {
  const parent = useContext(TierCtx);
  const scope = resolveTier(parent, tier, def ?? parent?.tier ?? PEN.untagged, tone ?? (def ? undefined : parent?.tone), bg, lines);
  if (!tier && !def && parent) scope.forced = parent.forced;
  return <TierCtx.Provider value={scope}>{children}</TierCtx.Provider>;
};

// ---------------------------------------------------------------- scale (camera excluded)

/** The local scale of the drawing space here relative to the camera (1 at camera rest, outside any scaled group). */
export function useLocalScale(): number {
  const m = useXf();
  const cam = useAppliedStageMat();
  const det = Math.abs(m[0] * m[3] - m[1] * m[2]);
  const cdet = Math.abs(cam[0] * cam[3] - cam[1] * cam[2]) || 1;
  const s = Math.sqrt(det / cdet);
  return Number.isFinite(s) && s > 1e-6 ? s : 1;
}

// ---------------------------------------------------------------- the clean line

export type CleanLineOpts = {
  /** This stroke IS the thing (a wire, a string, a bird's V), not a contour: kept on every tier. */
  thing?: boolean;
  /** A graphic mark (a shape drawn with a stroke: a rod, a bar): width and colour kept. */
  graphic?: boolean;
  /** The fill this stroke bounds (overrides the scope's tone). */
  tone?: string;
  /** Raw SVG: the stroke is an open edge stroke (false) rather than a closed outline (default true). */
  contour?: boolean;
};

export type CleanLine = {
  /** Width in the local units of the space it is drawn in (before the camera ink compensation). */
  width: number;
  color: string;
  /** Static opacity (the tone-on-tone fallback); 1 = opaque. */
  alpha: number;
  kind: 'graphic' | 'light' | 'ink' | 'tone';
  tier: Tier;
  spec: TierSpec;
  /** Contours (closed outlines) and plain open strokes are drawn here (things, lights and graphics always are). */
  contours: boolean;
  strokes: boolean;
};

/** The tier, line flags and tone in effect for a scope (null = untagged). */
export function scopeLine(scope: TierScope | null): {tier: Tier; tone?: string; contours: boolean; strokes: boolean} {
  const tier = scope?.tier ?? PEN.untagged;
  const spec = PEN.tiers[tier];
  const lines = scope ? scope.lines : PEN.untaggedLines;
  return {tier, tone: scope?.tone, contours: spec.contours || !!lines, strokes: spec.strokes || !!lines};
}

/** Resolve a stroke under the clean pen: width (authored local width in, clean local width out), colour and alpha.
 *  `local` = the local scale (useLocalScale). */
export function cleanLine(scope: TierScope | null, authoredColor: string | undefined, authoredW: number, local: number, o: CleanLineOpts & {dash?: boolean} = {}): CleanLine {
  const sl = scopeLine(scope);
  const spec = PEN.tiers[sl.tier];
  const base = {tier: sl.tier, spec, contours: sl.contours, strokes: sl.strokes};
  const color0 = authoredColor ?? palette.ink;
  const screen = authoredW * local;
  if (o.graphic || o.dash || screen >= PEN.graphic) return {width: authoredW, color: color0, alpha: 1, kind: 'graphic', ...base};
  const L = lightness(color0);
  if (L !== null && L >= PEN.light) return {width: tierLightWidth(screen, sl.tier) / local, color: color0, alpha: 1, kind: 'light', ...base};
  const width = tierWidth(screen, sl.tier) / local;
  if (L === null || L <= PEN.dark) {
    const c = tierLineColor(sl.tier, o.tone ?? sl.tone);
    return {width, color: c.color, alpha: c.alpha, kind: 'ink', ...base};
  }
  return {width, color: color0, alpha: 1, kind: 'tone', ...base};
}

/** Raw SVG strokes in a kit piece: `line(color, width, opts)` -> props to spread on the <path> (stroke, strokeWidth,
 *  strokeOpacity), or {display: 'none'} when the tier draws no such line. Sketch pen: the authored values unchanged. */
export function useTierLine(): (color: string | undefined, width: number, o?: CleanLineOpts) => {stroke?: string; strokeWidth?: number; strokeOpacity?: number; display?: 'none'} {
  const scope = useContext(TierCtx);
  const ks = useInkScale();
  const local = useLocalScale();
  const clean = isClean();
  return (color, width, o = {}) => {
    if (!clean) return {stroke: color ?? palette.ink, strokeWidth: width};
    const c = cleanLine(scope, color, width, local, o);
    if ((c.kind === 'ink' || c.kind === 'tone') && !o.thing && !((o.contour ?? true) ? c.contours : c.strokes)) return {display: 'none'};
    return {stroke: c.color, strokeWidth: c.width * ks, strokeOpacity: c.alpha < 1 ? c.alpha : undefined};
  };
}

/** Raw SVG fills in a kit piece: `paint(color)` -> the colour on this tier (identity for the subject, emissive
 *  colours and under the sketch pen). Backdrops: pass `{backdrop: true}`. */
export function useTierPaint(): (color: string, o?: {backdrop?: boolean}) => string {
  const scope = useContext(TierCtx);
  const clean = isClean();
  return (color, o = {}) => {
    if (!clean || o.backdrop) return color;
    return tierFill(color, scope?.tier ?? PEN.untagged, scope?.bg ?? PEN.bg);
  };
}

/** Idle-motion amplitude factor of the tier here (1 under the sketch pen). */
export function useTierMotion(): number {
  const scope = useContext(TierCtx);
  if (!isClean()) return 1;
  return PEN.tiers[scope?.tier ?? PEN.untagged].motion;
}
