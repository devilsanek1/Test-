// light_s1: LightS1, the LIGHT AND TEXTURE PROOF's composition (docs/look/organic/light_proof.md; the owner,
// 2026-10-30: "I noticed this too the light source yes - can we do the proper lights?", "9 [an overall texture] that
// seems solvable too?", the one colour key "that's just color palette and selection"). v6's scene 1 at its still
// (1.0 s: "She quit Google."), drawn by this folder's composers over paint_s1's parts, in three looks:
//   look 'v6'     v6 exactly (PaintS1 set 'v6': the painted pieces, the darks switch, the refined her)
//   look 'light'  + PROPER LIGHT: the low October sun as the key (its glow, the in-scatter veil, rims on what it
//                 touches), the lit Google doorway as the story light (the lobby, its bloom, the light on the jambs,
//                 the pool on the towpath with her shadows cut out of it, her wrap and rim), the backlit facade and our
//                 bank in shade masses; baked per plane (./maps) + live on her and Pip (./movers.tsx)
//   look 'full'   + the ONE colour key (a dusk family, the doorway's gold the one hot accent) and the paper grain,
//                 folded into the same per-plane maps (and the grain on the movers)
// The bake's input (bake/README in light_proof.md §6): `parts` renders named segments alone on a black or white slab
// (`slab`), with no Film and no captions. Props: look, captions (default true), parts, slab, movers (default true).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Film, type FilmScene} from '../../lib/Film';
import {type CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../v2r/film/scenes.json';
import captionsJson from '../../v2r/film/captions.json';
import {PaintProvider} from '../../lib/paint';
import {PAINT_SETS} from '../paint_s1/paint_set';
import {V6Provider} from '../paint_s1/v6';
import {PosterSwitchProvider, resolveSwitches} from '../paint_s1/switches';
import {applyFloat, applyPalette, applyPen} from '../paint_s1/engine';
import {POSTER_S1_FPS, POSTER_S1_FRAMES} from '../paint_s1/PosterS1';
import {LightCtxProvider, type LookName, type SegName} from './context';
import {LightV2S1} from './LightV2S1';
import {MAPS} from './maps';

export const LIGHT_S1_FPS = POSTER_S1_FPS;
export const LIGHT_S1_FRAMES = POSTER_S1_FRAMES;

export type LightS1Props = {
  look?: LookName;
  captions?: boolean;
  /** The bake's parts render: only these segments, on the `slab` colour, no Film. */
  parts?: SegName[];
  slab?: string;
  /** Her, Pip and the particles drawn (default true). */
  movers?: boolean;
};

const SCENES = scenesJson as FilmScene[];
/** v2's captions with the hook page from frame 0 (as paint_s1's PosterS1: v2's shipped frame 0). */
const CAPTIONS = (captionsJson as CaptionBeat[]).map((b, i) => (i ? b : {...b, s: 0, lines: b.lines.map((l, j) => (j ? l : {...l, s: 0}))}));
const COMPONENTS: Record<string, React.FC> = {V2S1: () => <LightV2S1 />};

export const LightS1: React.FC<LightS1Props> = ({look = 'full', captions = true, parts, slab, movers = true}) => {
  // v6's switches (PaintS1 set 'v6': PosterS1 preset 'v2' + the darks switch) and its module state, every frame
  const sw = resolveSwitches({preset: 'v2', darks: true});
  const t = useCurrentFrame() / LIGHT_S1_FPS;
  applyPalette(sw);
  applyPen(sw, t);
  applyFloat(sw);
  const maps = look === 'v6' ? {slots: {}, live: {}} : MAPS[look];
  return (
    <PaintProvider on set={PAINT_SETS.v6}>
      <V6Provider on>
        <PosterSwitchProvider value={sw}>
          <LightCtxProvider value={{look, parts: parts ?? null, movers, maps}}>
            {parts ? (
              <AbsoluteFill>
                <LightV2S1 slab={slab ?? '#000000'} />
              </AbsoluteFill>
            ) : (
              <AbsoluteFill>
                <Film scenes={SCENES} components={COMPONENTS} captions={CAPTIONS} only="V2S1" offset={0} audio={false} showCaptions={captions} captionMotion="pop" edges={false} />
              </AbsoluteFill>
            )}
          </LightCtxProvider>
        </PosterSwitchProvider>
      </V6Provider>
    </PaintProvider>
  );
};
