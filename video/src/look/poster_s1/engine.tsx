// The look test's hook-ups to the lanes' engine pieces (notes: test/SCENE.md "the switches"). ONE place where the
// scene meets lib code that is new for the test, so a lane's API change is fixed here:
//   lane E (test/ENGINE.md): the line flags (lib/pen PEN.outlines, PEN.lineMin), FormShade per tier (lib/light
//          withTierForm, tierFormFor), the float by 1/z (lib/depth PARALLAX_Z), the far anchor (lib/depth
//          anchorTones, used in V2S1_far_stage), the near floor (lib/depth nearPalette, used in near.ts), the 10b
//          palette (./palette_10b CM10B)
//   lane PT (test/ENGINE_PT.md): the patchwork (lib/patchwork, used in V2S1_patch.tsx); the mottle (lib/texture
//          <Mottle>) in <TextureSlot> below, one per plane group
//   lane N (test/ENGINE_NATURE.md): lib/foliage's London plane and lib/wind's one wind (<TreeSlot>, <SpraySlot>),
//          lib/clouds' hero cumulus (<CloudSlot>); the specs are V2S1_nature.tsx
// Module state (the pen, the palette roles) is set by the composition's root before its children render, every frame,
// from the props and the time (one value per frame; frames render in any order): deterministic.
import React from 'react';
import {PEN} from '../../lib/pen';
import {PARALLAX_Z} from '../../lib/depth';
import {withTierForm, tierFormFor, type LightRig} from '../../lib/light';
import {CM} from '../../v2r/palette';
import {Mottle, mottleK, mottleSeed} from '../../lib/texture';
import {CM10B, CM_V2} from './palette_10b';
import {textureOn, type PosterSwitches} from './switches';
import {S1Cloud, S1Spray, S1Tree} from './V2S1_nature';

// ---------------------------------------------------------------- the pen: no outlines, 2 px lines (lane E)

/** Frame 0's construction line (DIRECTION rule 9; the coordinator, 2026-10-29: "the drawing line is a construction line
 *  ... then the colour floods in over it, so the line ends up under the colour and no outline is left"): with the
 *  outlines off, the pen keeps its lines until every subject's colour has landed (her coat, the last, at 0.78: V2S1_clock
 *  HER_COAT_AT), each subject's line going under its colour on its own frame (`lineUntil`); from here no outline at all. */
export const LINES_OFF_AT = 0.8;
/** When each frame-0 subject's colour lands (its line goes under it): W's plum pane on the lamp click, the door when
 *  the flood reaches it (SUN0 (196, 772) -> the door's centre (630, 965): 0.44 + 475 / 5200), her coat last. */
export const LINE_UNTIL = {w: 0.4, door: 0.53, her: 0.78} as const;

/** The pen's film-wide flags for this frame (lib/pen: E's `outlines` and `lineMin`), and the page the calm tiers pull
 *  toward (the palette's sky). Called by the root before anything draws. */
export function applyPen(sw: PosterSwitches, t: number) {
  PEN.outlines = !(sw.lineOff && t >= LINES_OFF_AT);
  PEN.lineMin = sw.lines2px ? 2 : 0;
  PEN.bg = sw.palette10b ? CM10B.sky : CM_V2.sky;
}

/** A subject's frame-0 line under the no-outline switch: drawn until its colour lands (`until`), then never. */
export const lineOn = (sw: PosterSwitches, t: number, until: number) => !sw.lineOff || t < until;

// ---------------------------------------------------------------- the palette (lane E's 10b)

const ROLE_KEYS = Object.keys(CM_V2) as (keyof typeof CM_V2)[];
/** v2's hex -> its role (to re-resolve colours a module captured from CM at import time). */
const V2_ROLE = new Map<string, keyof typeof CM_V2>();
for (const k of ROLE_KEYS) {
  const v = CM_V2[k];
  if (typeof v === 'string' && v.startsWith('#') && !V2_ROLE.has(v.toUpperCase())) V2_ROLE.set(v.toUpperCase(), k);
}
let PALETTE_10B = false;

/** Swap v2r's live CM roles to 10b (or back), in place, before anything draws: every render-time read of CM.* follows
 *  (the shipped bundle never sees it: only this entry imports this module). */
export function applyPalette(sw: PosterSwitches) {
  const want = !!sw.palette10b;
  if (want === PALETTE_10B && (CM as Record<string, unknown>).sky === (want ? CM10B.sky : CM_V2.sky)) return;
  const src = want ? CM10B : CM_V2;
  for (const k of ROLE_KEYS) {
    const v = src[k];
    (CM as Record<string, unknown>)[k] = Array.isArray(v) ? [...v] : v;
  }
  PALETTE_10B = want;
}
/** Which palette is live (memo keys). */
export const paletteKey = (): '10b' | 'v2' => (PALETTE_10B ? '10b' : 'v2');
/** A colour a module captured from CM at import (v2's value): the live palette's colour of the same role; any other
 *  colour unchanged. */
export function live(hex: string): string {
  if (!PALETTE_10B) return hex;
  const role = V2_ROLE.get(hex.toUpperCase());
  const v = role ? (CM10B as Record<string, unknown>)[role] : undefined;
  return typeof v === 'string' ? v : hex;
}

// ---------------------------------------------------------------- light: the subject's shade face (lane E)

/** The rig the scene lights with: v2's, or under `shadeTier` its copy with the form step per tier (subject 0.56 of the
 *  warm family, B and C v2's 0.20: lib/light TIER_FORM_K). */
export const shadeRig = (sw: PosterSwitches, rig: LightRig, base: string): LightRig => (sw.shadeTier ? withTierForm(rig, base) : rig);
/** The subject's shade face on its main surface at CRAFT §d.3's -22 L* (lane E: tune per film with tierFormFor). */
export const subjectStrength = (surface: string, base: string, dL = -22) => tierFormFor(surface, base, dL);

// ---------------------------------------------------------------- the float (lane E)

/** The float's share table: v2's PARALLAX_K (undefined = lib/depth's default) or the 1/z table. */
export const floatTable = (sw: PosterSwitches) => (sw.float1z ? PARALLAX_Z : undefined);
let FLOAT_TABLE: Readonly<Record<number, number>> | undefined;
/** Set by the root every frame (the water's reflections read it from a plain function, not a hook). */
export function applyFloat(sw: PosterSwitches) {
  FLOAT_TABLE = floatTable(sw);
}
/** The share table in effect this frame (undefined = v2's PARALLAX_K). */
export const currentFloatTable = () => FLOAT_TABLE;

// ---------------------------------------------------------------- the mottle (lane PT)

/** The mottle of one parallax plane (lib/texture <Mottle>, CRAFT §c): static, locked to the plane's group (it rides
 *  the group's float transform), one seed per plane (`mottleSeed`: two groups of one plane read as one surface, two
 *  planes never slide as one sheet), the strength by plane (`mottleK`: the sky 0.6, near C 0.7, far C (+2 and farther)
 *  0.4), none in the caption band (cut out in SCREEN rows through the group's float `offset`). Off (or before its
 *  switch's second): the children as they are (v2's tree, no wrapper). A mottled group is ISOLATED: a multiply layer
 *  that falls on ANOTHER group goes in S1Plane's `under` / `over` (outside the filter), never inside. */
export const TextureSlot: React.FC<{sw: PosterSwitches; t: number; plane: number; sky?: boolean; offset?: [number, number]; region?: [number, number, number, number]; children?: React.ReactNode}> = ({sw, t, plane, sky, offset = [0, 0], region, children}) => {
  if (!textureAt(sw, t)) return <>{children}</>;
  const isSky = sky ?? !Number.isFinite(plane);
  return (
    <Mottle k={mottleK({plane, sky: isSky})} seed={mottleSeed(plane)} offset={offset} region={region}>
      {children}
    </Mottle>
  );
};
/** Is the texture on at t (the switch's number = on from that second: STUDY §10 pass 1's 3.5 s). */
export const textureAt = (sw: PosterSwitches, t: number) => textureOn(sw, t);

// ---------------------------------------------------------------- nature (lane N)

/** The planter's tree: lane N's London plane in the one wind (V2S1_nature S1Tree), Pip inside it under `pipHidden`
 *  (`pip`: drawn between the crown's front clusters); off, v2's bay crown (`fallback`, with the darks and its own
 *  hiding spot). */
export const TreeSlot: React.FC<{sw: PosterSwitches; pip?: React.ReactNode; fallback: React.ReactNode}> = ({sw, pip, fallback}) =>
  sw.foliage ? <S1Tree pip={sw.pipHidden ? pip : undefined} /> : <>{fallback}</>;
/** The near leaf spray in the top-left gutter: the London plane's own leaves (V2S1_nature S1Spray); off, v2's twig. */
export const SpraySlot: React.FC<{sw: PosterSwitches; fallback: React.ReactNode}> = ({sw, fallback}) => (sw.foliage ? <S1Spray /> : <>{fallback}</>);
/** The hero cumulus in v2's hero-cloud spot (V2S1_nature S1Cloud, above the caption band over its drift); off, the
 *  kit's cloud. */
export const CloudSlot: React.FC<{sw: PosterSwitches; fallback: React.ReactNode}> = ({sw, fallback}) => (sw.cloud ? <S1Cloud palette10b={!!sw.palette10b} /> : <>{fallback}</>);
