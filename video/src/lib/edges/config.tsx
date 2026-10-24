// edges/config.tsx — the one switch for the whole film. Film / Main wrap their SCENE STACK (not the captions) in
// <FilmEdges>; the variant comes from (first wins):
//   1. an <EdgeProvider value={{variant: 'panel', amount: 1}}> above it (Main, a scene composition, a dev preview),
//   2. the render's input props: --props='{"edges": "panel"}' or '{"edges": {"variant": "panel", "amount": 0.8}}'
//      (review any variant on the real film without touching code),
//   3. FILM_EDGES below (the house default).

import React, {createContext, useContext} from 'react';
import {getInputProps} from 'remotion';
import {capcheckMode} from '../Captions';
import {EdgeTreatment, EdgeTreatmentProps} from './EdgeTreatment';
import {EDGE_VARIANTS, EdgeVariant} from './variants';
import {EDGE_HINTS} from './hints';

export type EdgeConfig = Omit<EdgeTreatmentProps, 'children'>;

/** House default for the film: 'paint-subtle', the user's pick (docs/BRIEF.md, EDGE TREATMENT). Film applies it to the full
 *  film only; single-scene previews stay 'clean'. Override per render with --props='{"edges":"paint-medium"}'. */
export const FILM_EDGES: EdgeConfig = {variant: 'paint-subtle', seed: 'film', amount: 1};

const EdgeCtx = createContext<EdgeConfig | null>(null);
export const EdgeProvider: React.FC<{value: EdgeConfig; children?: React.ReactNode}> = ({value, children}) => <EdgeCtx.Provider value={value}>{children}</EdgeCtx.Provider>;

function fromInputProps(): EdgeConfig | null {
  try {
    const p = getInputProps() as {edges?: unknown};
    const e = p?.edges;
    if (typeof e === 'string' && (EDGE_VARIANTS as string[]).includes(e)) return {variant: e as EdgeVariant};
    if (e && typeof e === 'object' && (EDGE_VARIANTS as string[]).includes((e as EdgeConfig).variant as string)) return e as EdgeConfig;
  } catch {
    // no input props (Studio) -> default
  }
  return null;
}

/** The edge config in effect here (provider > input props > FILM_EDGES). */
export function useEdgeConfig(): EdgeConfig {
  const ctx = useContext(EdgeCtx);
  return {...FILM_EDGES, ...(ctx ?? fromInputProps() ?? {})};
}

/** Film's one-line integration: wrap the scene stack (every layer + transition overlays, NOT the captions). Steps aside
 *  in the caption check's 'mask' pass (Film draws no scene there; a paper layer would cover the whole frame).
 *  `scene` (optional): the id of the scene on screen; it is appended to the config seed, so each scene gets its own
 *  hand-made edge (with 'paint': a separate painting per scene; the edge changes on the cut, never within a scene),
 *  and the scene's EDGE_HINTS entry (edges/hints.ts) is applied: bare corners only where the scene has drawing,
 *  keep rects never cut. */
export const FilmEdges: React.FC<{scene?: string; children?: React.ReactNode}> = ({scene, children}) => {
  const cfg = useEdgeConfig();
  if (capcheckMode() === 'mask') return <>{children}</>;
  const seed = scene ? `${String(cfg.seed ?? 'film')}/${scene}` : cfg.seed;
  const hints = cfg.hints ?? (scene ? EDGE_HINTS[scene] : undefined);
  return (
    <EdgeTreatment {...cfg} seed={seed} hints={hints}>
      {children}
    </EdgeTreatment>
  );
};
