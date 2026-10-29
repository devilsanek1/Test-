// The city-poster look test, the S1 composition (STUDY.md §10; notes docs/studies/2026-10-28_city_posters/test/SCENE.md).
// v2's S1 (0-6.1 s, "She quit Google. / And she says her contract bans her from criticizing it… / for life.") with v2's
// locked voice and pop captions, then a 0.9 s LOCKED HOLD (the camera at rest, the world still alive, no dive, no
// words, no sound): 7.0 s = 420 frames at 60 fps, 1080 x 1920. The same shell as v2's own Film2R-V2S1 (lib/Film in shot
// mode over v2's scenes.json and captions.json, read-only), so with every switch off the picture is v2's pixel for
// pixel; the voice is played here (trimmed to S1) instead of by Film, so the hold is silent.
// The scene is this folder's copy of v2r's S1 (src/v2r is never edited); the switches (./switches.tsx) are props.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Film, type FilmScene} from '../../lib/Film';
import {type CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../v2r/film/scenes.json';
import captionsJson from '../../v2r/film/captions.json';
import V2S1 from './V2S1';
import {PosterSwitchProvider, resolveSwitches, type PosterPreset, type PosterSwitches} from './switches';
import {applyFloat, applyPalette, applyPen} from './engine';

export const POSTER_S1_FPS = 60;
/** v2's S1 ends (its cut into S2) at 6.1 s; the test holds 0.9 s more. */
export const POSTER_S1_END = 6.1;
export const POSTER_S1_HOLD = 0.9;
export const POSTER_S1_SECONDS = POSTER_S1_END + POSTER_S1_HOLD;
export const POSTER_S1_FRAMES = Math.round(POSTER_S1_SECONDS * POSTER_S1_FPS); // 420
/** v2's locked voice (Film2R's FILM2R_VOICE) and its final mix (public/v2r/cues.json `audio`). */
export const POSTER_S1_AUDIO = {voice: 'v2/voice.wav', mix: 'v2r/mix.wav'} as const;

/** v2's shots (read-only): S2's start bounds S1's captions (the next page, 6.28 s, never shows). */
const SCENES = scenesJson as FilmScene[];
/** v2's captions, the hook page from frame 0: lib/Film renders a shot (`only`) with `hookAtStart` off, so page 1 would
 *  wait for its own start (0.12 s: no caption on S1 frames 0-4), while v2's shipped master shows "She quit Google." on
 *  frame 0 (DIRECTION rule 9). Starting page 1 and its first line at 0 gives the shot v2's frame 0 back (fix pass 1,
 *  REVIEW.md SHOULD 1; REVIEW_tech §10.2); the "quit" highlight keeps its 0.52 s. */
const CAPTIONS = (captionsJson as CaptionBeat[]).map((b, i) => (i ? b : {...b, s: 0, lines: b.lines.map((l, j) => (j ? l : {...l, s: 0}))}));
const COMPONENTS: Record<string, React.FC> = {V2S1};

export type PosterS1Props = Partial<PosterSwitches> & {
  /** 'v2' (default: every switch off), 'pass1', 'pass2' (switches.tsx PRESETS); single switches override it. */
  preset?: PosterPreset;
  /** A burned-in review label (lib/Film's draft label: "<label> · V2S1 · m:ss.ss"); none when empty. */
  label?: string;
  /** 'voice' (default: v2's locked voice), 'mix' (v2's final mix: voice, music and sound), 'none'. */
  audio?: 'voice' | 'mix' | 'none';
  /** v2's pop captions (default on). */
  captions?: boolean;
};

/** The soundtrack: S1's slice only. The voice is silent at 6.1 s (-72 dB: a clean cut); the mix carries the retired
 *  dive's whoosh from ~5.95 s, so it fades out over 5.80-5.95 s. */
const S1Audio: React.FC<{which: 'voice' | 'mix'}> = ({which}) => {
  const end = Math.round(POSTER_S1_END * POSTER_S1_FPS);
  const fade: [number, number] = which === 'mix' ? [5.8 * POSTER_S1_FPS, 5.95 * POSTER_S1_FPS] : [end - 1, end];
  return (
    <Sequence from={0} durationInFrames={end} layout="none">
      <Audio src={staticFile(POSTER_S1_AUDIO[which])} volume={(f) => interpolate(f, fade, [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    </Sequence>
  );
};

export const PosterS1: React.FC<PosterS1Props> = (props) => {
  const sw = resolveSwitches(props);
  const audio = props.audio ?? 'voice';
  // the film-wide module state for this frame, before anything draws: the palette's roles and the pen's line flags
  const t = useCurrentFrame() / POSTER_S1_FPS;
  applyPalette(sw);
  applyPen(sw, t);
  applyFloat(sw);
  return (
    <PosterSwitchProvider value={sw}>
      <AbsoluteFill>
        <Film scenes={SCENES} components={COMPONENTS} captions={CAPTIONS} only="V2S1" offset={0} audio={false} showCaptions={props.captions ?? true} captionMotion="pop" edges={false} draftLabel={props.label ? props.label : undefined} />
      </AbsoluteFill>
      {audio !== 'none' ? <S1Audio which={audio} /> : null}
    </PosterSwitchProvider>
  );
};
