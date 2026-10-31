// v8_s1: V8S1, scene 1 of the Google film again, FEELING FIRST (an ITERATION, a still: paint_test/v8_card.md and
// NOTES.md "v8"; docs/process/PLAN.md step 10). The owner on v7: "we lost the feeling ... the scene now is about a dark
// alley whete nothing happens but the life and action is rather on the background". Here: she has just stepped out of
// the Google lobby onto the canal-side street at golden hour, in front and alive, the evening opening up ahead of her
// (the canal running to the low sun, the far bank's lit windows, a cafe under an autumn tree, a narrowboat), from the eye
// height of someone sitting at that cafe. Built with v7's tools: the painter's pieces (MyPaint marks and the recipe
// book's sky), one story light solved into per-plane maps, one colour key at the source, the paper, her drawn by the
// people overhaul and lit live. v2's captions from frame 0, exactly as v7 (the band over open sky).
//   look 'flat'  the set's flat design (the pieces unpainted, unlit): the bake's check
//   look 'v8'    the delivered still (1.0 s)
//   parts [...]  the bake's input: only these movers on the `slab` colour (no Film, no captions)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Film, type FilmScene} from '../../lib/Film';
import {type CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../v2r/film/scenes.json';
import captionsJson from '../../v2r/film/captions.json';
import {V8CtxProvider, type LookName, type MoverName} from './context';
import {V8Scene} from './V8Scene';
import {PIECES_V8} from './pieces_v8';
import {FLAT_V8} from './flat_v8';
import {MAPS_V8} from './maps_v8';

export const V8_S1_FPS = 60;
export const V8_S1_FRAMES = 366;

export type V8S1Props = {
  look?: LookName;
  captions?: boolean;
  /** The bake's parts render: only these movers, on the `slab` colour, no Film. */
  parts?: MoverName[];
  slab?: string;
};

const SCENES = scenesJson as FilmScene[];
/** v2's captions with the hook page from frame 0 (as v7: v2's shipped frame 0). */
const CAPTIONS = (captionsJson as CaptionBeat[]).map((b, i) => (i ? b : {...b, s: 0, lines: b.lines.map((l, j) => (j ? l : {...l, s: 0}))}));
const COMPONENTS: Record<string, React.FC> = {V2S1: () => <V8Scene />};

export const V8S1: React.FC<V8S1Props> = ({look = 'v8', captions = true, parts, slab}) => {
  const pieces = look === 'flat' ? FLAT_V8 : PIECES_V8;
  return (
    <V8CtxProvider value={{look, parts: parts ?? null, pieces, maps: MAPS_V8}}>
      {parts ? (
        <AbsoluteFill>
          <V8Scene slab={slab ?? '#000000'} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <Film scenes={SCENES} components={COMPONENTS} captions={CAPTIONS} only="V2S1" offset={0} audio={false} showCaptions={captions} captionMotion="pop" edges={false} />
        </AbsoluteFill>
      )}
    </V8CtxProvider>
  );
};
