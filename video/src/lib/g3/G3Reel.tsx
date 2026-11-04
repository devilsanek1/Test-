// G3Reel.tsx: the shared G3 reel composition. A film's entry registers it with its id, its animatic JSON and its
// voice (both public/ paths); the duration comes from the voice file itself (the locked take is the clock), with the
// JSON's durationSec as the fallback. 1080 x 1920 at 60 fps (PIPELINE_V2 "Frame rate": the G3 reel renders at 60 too).
//
//   <G3ReelComposition id="G3Reel" film="v4" animatic="v4/animatic.json" voice="v4/voice.wav" />
//
// Render (from video/): node scripts/render-media.mjs G3Reel out/v4/g3.mp4 --entry=src/entry-v4.tsx --scale=0.5

import React from 'react';
import {Composition, staticFile} from 'remotion';
import {getAudioDurationInSeconds} from '@remotion/media-utils';
import {SketchReel} from './SketchReel';
import type {CaptionLayer} from './Captions';
import type {Animatic} from './types';

export const G3_FPS = 60;

export type G3ReelProps = {
  /** the film's id ('v4') */
  film: string;
  /** the board JSON, a public/ path ('v4/animatic.json') */
  animatic: string;
  /** the voice, a public/ path ('v4/voice.wav'); overrides the JSON's audio */
  voice?: string;
  /** resolved by calculateMetadata */
  data?: Animatic;
  notes?: boolean;
};

/** the reel with its data loaded */
export const G3ReelView: React.FC<G3ReelProps & {captions?: CaptionLayer}> = ({data, voice, captions, notes}) =>
  data ? <SketchReel data={data} voice={voice} captions={captions} notes={notes} /> : null;

export const G3ReelComposition: React.FC<{id?: string; film: string; animatic: string; voice?: string; fps?: number;
  captions?: CaptionLayer; width?: number; height?: number}> = ({id = 'G3Reel', film, animatic, voice, fps = G3_FPS, captions,
  width = 1080, height = 1920}) => {
  // one component identity per caption layer (the root may re-render)
  const Comp = React.useMemo(() => {
    const C: React.FC<G3ReelProps> = (p) => <G3ReelView {...p} captions={captions} />;
    return C;
  }, [captions]);
  return (
    <Composition
      id={id}
      component={Comp as unknown as React.FC<Record<string, unknown>>}
      fps={fps}
      width={width}
      height={height}
      durationInFrames={fps}
      defaultProps={{film, animatic, voice} as unknown as Record<string, unknown>}
      calculateMetadata={async ({props}) => {
        const p = props as unknown as G3ReelProps;
        const data: Animatic = await (await fetch(staticFile(p.animatic ?? animatic))).json();
        let sec = data.durationSec;
        const v = p.voice ?? voice ?? data.audio;
        if (v) {
          try {
            sec = await getAudioDurationInSeconds(staticFile(v));
          } catch {
            // the JSON's durationSec (the take's length) stands in
          }
        }
        return {durationInFrames: Math.max(1, Math.ceil(sec * fps - 1e-6)), props: {...p, data} as unknown as Record<string, unknown>};
      }}
    />
  );
};
