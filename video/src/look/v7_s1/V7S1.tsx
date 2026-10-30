// v7_s1: V7S1, painter v7's scene 1 at its still (1.0 s, "She quit Google."), the first half of ORGANIC.md §6 (an
// ITERATION, stills only: docs/studies/2026-10-28_city_posters/paint_test/NOTES.md "v7a"). v6's scene (src/look/paint_s1,
// its switches: preset 'v2' + the darks, the refined her) drawn by this folder's composers, in three looks:
//   look 'cut'   step 4: the composition's prop cut alone, on v6's palette, painting and rig
//   look 'key'   + step 1: the ONE colour key at the source (T3's sky and cloud from the painter, the world through
//                palette_v7's map, the lobby the one hot accent)
//   look 'v7a'   + step 2: the story light (T3's low key: the backlit facade and our bank in deep shade masses with named
//                casters, the dusk water, the lit doorway the one place to look): the delivered still
// The bake's inputs: `parts` (named segments alone on the `slab` colour, no Film, no captions), `movers` (her, Pip, the
// particles), `design` (the canal's design frame for the painter: the vector water, unkeyed, no painted water).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Film, type FilmScene} from '../../lib/Film';
import {type CaptionBeat} from '../../lib/Captions';
import {PEN} from '../../lib/pen';
import scenesJson from '../../v2r/film/scenes.json';
import captionsJson from '../../v2r/film/captions.json';
import {PaintProvider} from '../../lib/paint';
import {V6Provider} from '../paint_s1/v6';
import {PosterSwitchProvider, resolveSwitches} from '../paint_s1/switches';
import {applyFloat, applyPalette, applyPen} from '../paint_s1/engine';
import {POSTER_S1_FPS, POSTER_S1_FRAMES} from '../paint_s1/PosterS1';
import {V7CtxProvider, type LookName, type SegName} from './context';
import {V7Scene} from './V7Scene';
import {ACCENT_V7, V7_BG} from './palette_v7';
import {PAINT_V6_CUT, PAINT_V7} from './paint_set';
import {MAPS} from './maps';

export const V7_S1_FPS = POSTER_S1_FPS;
export const V7_S1_FRAMES = POSTER_S1_FRAMES;

export type V7S1Props = {
  look?: LookName;
  captions?: boolean;
  /** The bake's parts render: only these segments, on the `slab` colour, no Film. */
  parts?: SegName[];
  slab?: string;
  /** Her, Pip and the particles drawn (default true). */
  movers?: boolean;
  /** The canal's design frame for the painter (look 'key', the vector water unkeyed, no painted water). */
  design?: boolean;
  /** The bake's marker render (the lit panes pure green). */
  marker?: boolean;
};

const SCENES = scenesJson as FilmScene[];
/** v2's captions with the hook page from frame 0 (as PosterS1: v2's shipped frame 0). */
const CAPTIONS = (captionsJson as CaptionBeat[]).map((b, i) => (i ? b : {...b, s: 0, lines: b.lines.map((l, j) => (j ? l : {...l, s: 0}))}));
const COMPONENTS: Record<string, React.FC> = {V2S1: () => <V7Scene />};
/** The design frame's painted pieces: every piece but the canal (the painter repaints it from this frame). */
const DESIGN_PIECES = ['sky', 'clouds_p1', 'clouds_p2', 'clouds_p3', 'farroofs', 'fartower', 'flock'];

export const V7S1: React.FC<V7S1Props> = ({look = 'v7a', captions = true, parts, slab, movers = true, design = false, marker = false}) => {
  // v6's switches (PaintS1 set 'v6': preset 'v2' + the darks switch) and its module state, every frame
  const sw = resolveSwitches({preset: 'v2', darks: true});
  const t = useCurrentFrame() / V7_S1_FPS;
  applyPalette(sw);
  applyPen(sw, t);
  applyFloat(sw);
  // step 1: the clean pen's page is v7's caption field (the calm tiers pull toward the sky they sit under), and the
  // one hot accent is a LIGHT SOURCE to the pen (emissive: never calmed by a tier, as v2's lamp role was)
  if (look !== 'cut') {
    PEN.bg = V7_BG;
    PEN.emissive.add(ACCENT_V7.lamp.toUpperCase());
    PEN.emissive.add(ACCENT_V7.lampCore.toUpperCase());
    if (marker) PEN.emissive.add('#00FF00');
  }
  const set = look === 'cut' ? PAINT_V6_CUT : PAINT_V7;
  return (
    <PaintProvider on set={set} only={design ? DESIGN_PIECES : undefined}>
      <V6Provider on>
        <PosterSwitchProvider value={sw}>
          <V7CtxProvider value={{look: design ? 'key' : look, parts: parts ?? null, movers, design, marker, maps: MAPS}}>
            {parts ? (
              <AbsoluteFill>
                <V7Scene slab={slab ?? '#000000'} />
              </AbsoluteFill>
            ) : (
              <AbsoluteFill>
                <Film scenes={SCENES} components={COMPONENTS} captions={CAPTIONS} only="V2S1" offset={0} audio={false} showCaptions={captions && !design} captionMotion="pop" edges={false} />
              </AbsoluteFill>
            )}
          </V7CtxProvider>
        </PosterSwitchProvider>
      </V6Provider>
    </PaintProvider>
  );
};
