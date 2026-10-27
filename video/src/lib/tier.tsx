// tier.tsx — ATTENTION TIERS for the clean pen (lib/pen.ts): which tier a piece of linework or a fill belongs to.
// Everything here is a no-op under the default sketch pen (lib/pen.ts PEN.mode 'sketch'): v1 / v2 render as before.
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
// Ink / Fill outside any scope use PEN.untagged ('support'). `bg` (what calmer fills are pulled toward) inherits down
// the tree; `tone` belongs to the piece that sets it.

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
 *  fills inside are pulled toward (e.g. the sky for a far town). */
export const Tier: React.FC<{tier: Tier; tone?: string; bg?: string; children?: React.ReactNode}> = ({tier, tone, bg, children}) => {
  const parent = useContext(TierCtx);
  return <TierCtx.Provider value={{tier, forced: true, tone, bg: bg ?? parent?.bg}}>{children}</TierCtx.Provider>;
};

/** A piece's scope: explicit prop > forced parent scope > the piece's default. */
export function resolveTier(parent: TierScope | null, prop: Tier | undefined, def: Tier, tone?: string, bg?: string): TierScope {
  if (prop) return {tier: prop, forced: true, tone, bg: bg ?? parent?.bg};
  if (parent?.forced) return {tier: parent.tier, forced: true, tone, bg: bg ?? parent.bg};
  return {tier: def, forced: false, tone, bg: bg ?? parent?.bg};
}

type TierOpts<P> = {
  /** The piece's main colour (its lines are its shade), or a function of its props. */
  tone?: string | ((p: P) => string | undefined);
  /** The background its calmer fills are pulled toward (default: inherited, then PEN.bg). */
  bg?: string;
};

/** Wrap a kit piece: it takes an optional `tier` prop, resolves its tier (prop > forced scope > `def`) and provides it
 *  to everything it draws. Under the sketch pen it renders the piece exactly as before (one context provider). */
export function tiered<P extends object>(def: Tier | ((p: P) => Tier), opts: TierOpts<P>, C: React.FC<P>): React.FC<P & TierProps> {
  const W: React.FC<P & TierProps> = (props) => {
    const parent = useContext(TierCtx);
    const d = typeof def === 'function' ? def(props) : def;
    const tone = typeof opts.tone === 'function' ? opts.tone(props) : opts.tone;
    const scope = resolveTier(parent, props.tier, d, tone, opts.bg);
    return (
      <TierCtx.Provider value={scope}>
        <C {...props} />
      </TierCtx.Provider>
    );
  };
  W.displayName = `Tiered(${C.displayName ?? C.name ?? 'piece'})`;
  return W;
}

/** Provide a scope for part of a piece (e.g. a sub-part with its own tone): same resolution as tiered(). */
export const TierPart: React.FC<{def?: Tier; tier?: Tier; tone?: string; bg?: string; children?: React.ReactNode}> = ({def, tier, tone, bg, children}) => {
  const parent = useContext(TierCtx);
  const scope = resolveTier(parent, tier, def ?? parent?.tier ?? PEN.untagged, tone, bg);
  // a part inherits its piece's forcing (a sub-part never escapes a forced scope)
  if (!tier && parent && !def) scope.forced = parent.forced;
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
  /** This stroke IS the thing (a wire, a string, a bird's V, steam), not a contour: kept on the environment tier. */
  thing?: boolean;
  /** A graphic mark (a shape drawn with a stroke: key rows, a rod): width and colour kept. */
  graphic?: boolean;
  /** The fill this stroke bounds (overrides the scope's tone). */
  tone?: string;
  /** The stroke is a closed outline (raw SVG only: Ink measures it). */
  contour?: boolean;
};

export type CleanLine = {
  /** Screen-px width to draw (before camera ink compensation) — multiply nothing, it is final for this space. */
  width: number;
  color: string;
  /** Static opacity (the tone-on-tone fallback); 1 = opaque. */
  alpha: number;
  kind: 'graphic' | 'light' | 'ink' | 'tone';
  tier: Tier;
  spec: TierSpec;
};

/** Resolve a stroke under the clean pen: width (local units: authored width in, clean width out), colour and alpha.
 *  `local` = the local scale (useLocalScale). Returns the tier spec too (for the subpath filters). */
export function cleanLine(tier: Tier, scopeTone: string | undefined, authoredColor: string | undefined, authoredW: number, local: number, o: CleanLineOpts & {dash?: boolean} = {}): CleanLine {
  const spec = PEN.tiers[tier];
  const color0 = authoredColor ?? palette.ink;
  const screen = authoredW * local;
  if (o.graphic || o.dash || screen >= PEN.graphic) return {width: authoredW, color: color0, alpha: 1, kind: 'graphic', tier, spec};
  const L = lightness(color0);
  if (L !== null && L >= PEN.light) return {width: tierLightWidth(screen, tier) / local, color: color0, alpha: 1, kind: 'light', tier, spec};
  const width = tierWidth(screen, tier) / local;
  if (L === null || L <= PEN.dark) {
    const c = tierLineColor(tier, o.tone ?? scopeTone);
    return {width, color: c.color, alpha: c.alpha, kind: 'ink', tier, spec};
  }
  return {width, color: color0, alpha: 1, kind: 'tone', tier, spec};
}

/** Raw SVG strokes in a kit piece: `line(color, width, opts)` -> props to spread on the <path> (stroke, strokeWidth,
 *  strokeOpacity), or {display: 'none'} when the tier draws no such line. Sketch pen: the authored values unchanged
 *  (times the camera ink compensation, as lib Ink does). */
export function useTierLine(): (color: string | undefined, width: number, o?: CleanLineOpts) => {stroke?: string; strokeWidth?: number; strokeOpacity?: number; display?: 'none'} {
  const scope = useContext(TierCtx);
  const ks = useInkScale();
  const local = useLocalScale();
  const clean = isClean();
  return (color, width, o = {}) => {
    if (!clean) return {stroke: color ?? palette.ink, strokeWidth: width};
    const tier = scope?.tier ?? PEN.untagged;
    const c = cleanLine(tier, scope?.tone, color, width, local, o);
    if ((c.kind === 'ink' || c.kind === 'tone') && !o.thing) {
      // a raw stroke is a contour unless the caller says it is an open edge stroke (contour: false) or a thing
      if ((o.contour ?? true) ? !c.spec.contours : !c.spec.strokes) return {display: 'none'};
    }
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
    const tier = scope?.tier ?? PEN.untagged;
    return tierFill(color, tier, scope?.bg ?? PEN.bg);
  };
}

/** Idle-motion amplitude factor of the tier here (1 under the sketch pen). */
export function useTierMotion(): number {
  const scope = useContext(TierCtx);
  if (!isClean()) return 1;
  return PEN.tiers[scope?.tier ?? PEN.untagged].motion;
}
