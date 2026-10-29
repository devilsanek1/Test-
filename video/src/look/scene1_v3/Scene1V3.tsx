// Scene 1, still v3: the composition shell (this folder's copy of the look test's PosterS1). v2's S1 slot of lib/Film
// in shot mode over v2's scenes.json and captions.json (read-only), so the caption is v2's "She quit Google." in v2's
// pop style and place, with its peach "quit" box; the scene is V3S1 under the look test's pass-2 switches. 2.0 s at
// 60 fps, 1080 x 1920; the still is the frame at 1.6 s (V3_layout V3_T: the doors shut, the caption's first page).
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Film, type FilmScene} from '../../lib/Film';
import {type CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../v2r/film/scenes.json';
import captionsJson from '../../v2r/film/captions.json';
import V3S1 from './V3S1';
import {PosterSwitchProvider, resolveSwitches, type PosterPreset, type PosterSwitches} from './switches';
import {applyFloat, applyPalette, applyPen} from './engine';

export const SCENE1V3_FPS = 60;
export const SCENE1V3_SECONDS = 2.0;
export const SCENE1V3_FRAMES = Math.round(SCENE1V3_SECONDS * SCENE1V3_FPS); // 120

const SCENES = scenesJson as FilmScene[];
/** v2's captions with page 1 from frame 0 (as the look test: v2's shipped master shows "She quit Google." on frame 0). */
const CAPTIONS = (captionsJson as CaptionBeat[]).map((b, i) => (i ? b : {...b, s: 0, lines: b.lines.map((l, j) => (j ? l : {...l, s: 0}))}));
/** v2's S1 slot, filled by the v3 scene. */
const COMPONENTS: Record<string, React.FC> = {V2S1: V3S1};

export type Scene1V3Props = Partial<PosterSwitches> & {
  /** Default 'pass2' (every decided look-test change). */
  preset?: PosterPreset;
  label?: string;
  /** 'none' (default: a still), or v2's locked voice. */
  audio?: 'voice' | 'none';
  captions?: boolean;
};

export const Scene1V3: React.FC<Scene1V3Props> = (props) => {
  const sw = resolveSwitches({preset: 'pass2', ...props});
  const t = useCurrentFrame() / SCENE1V3_FPS;
  applyPalette(sw);
  applyPen(sw, t);
  applyFloat(sw);
  const end = SCENE1V3_FRAMES;
  return (
    <PosterSwitchProvider value={sw}>
      <AbsoluteFill>
        <Film scenes={SCENES} components={COMPONENTS} captions={CAPTIONS} only="V2S1" offset={0} audio={false} showCaptions={props.captions ?? true} captionMotion="pop" edges={false} draftLabel={props.label ? props.label : undefined} />
      </AbsoluteFill>
      {props.audio === 'voice' ? (
        <Sequence from={0} durationInFrames={end} layout="none">
          <Audio src={staticFile('v2/voice.wav')} volume={(f) => interpolate(f, [end - 6, end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
        </Sequence>
      ) : null}
    </PosterSwitchProvider>
  );
};
