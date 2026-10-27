// Film3 (engine lane): video 3's film. The house sequencer <Film> (src/lib/Film.tsx) with v3 data:
//   scenes.json    the six SEQUENCES of the rework (docs/v3/flow_v2.md §2: SQA hook, SQB old deal, SQC your stick, SQD
//                  their mountain, SQE first dibs, SQF payoff), joined by seams (matchcut + seam: two builders draw the
//                  identical frame) and J3's push-through, every join with its carrier; SQF's 0.3 s loop un-build into
//                  SQA's t < 0 bare-line state; captionTone per sequence (a sequence module's exported `captionTone`
//                  wins: the placeholders export their old panels')
//   captions.json  pop captions from public/v3/voice_words.json (scripts/film_captions.py + captions_pages.txt)
//   scenes/        one file per sequence (each starts as a placeholder playing the G5b panels it replaces:
//                  scenes/g5b_panels.tsx; lanes replace them; scenes/index.ts registers them)
//   voice          public/v3/voice.wav; sound cues = the locked board's (public/v3/animatic.json "sfx")
//   frame 0        the core line in words until 3.37 s (and from the loop roll on), spoken captions under it
//   draft          G5: no edges / paper / texture; a burned-in "G5 · <sequence> · <timecode>" label
//   seam probe     Film3Seams: each seam's two builders alone at its frames f - 1 and f (lib/sequence.tsx), for
//                  scripts/qa/gate_check.py --seam-comp Film3Seams
// Compositions: src/entry-v3-film.tsx (Film3, Film3Shot {id}, Film3-<ID>, Film3Seams). How-to: docs/G5_BLOCKING.md
// (§2b: the sequence contract).
import React from 'react';
import {Film, filmDuration, type FilmScene, type FilmSfx, type Frame0Text} from '../../lib/Film';
import {FilmSeamProbe, seamProbeFrames} from '../../lib/sequence';
import type {CaptionBeat} from '../../lib/Captions';
import animatic from '../../../public/v3/animatic.json';
import scenesJson from './scenes.json';
import captionsJson from './captions.json';
import {sceneComponents, sceneTones, sceneWipers} from './scenes';

export const FILM3_FPS = 60;
export const FILM3_VOICE = 'v3/voice.wav';
/** The gate label burned into every pre-final cut. */
export const FILM3_GATE = 'G5';

/** The loop's caption roll back to page 1 (the frame-0 words return): 41.00 s (f2460), when the last sequence's
 *  un-build has handed the frame to the lines, never over its still full-colour frame (the default end - 0.22 =
 *  40.93 s, f2456: G5b review of S16, now SQF's end). */
export const FILM3_LOOP_CAPTION_AT = 41.0;

/** The sequences, with each lane's own captionTone (exported by its sequence module) over the scenes.json default,
 *  and the loop's caption roll on the last sequence's un-build. */
export const film3Scenes: FilmScene[] = (scenesJson as FilmScene[])
  .map((s) => (sceneTones[s.id] ? {...s, captionTone: sceneTones[s.id]} : s))
  .map((s) => (s.transitionOut?.type === 'unbuild' ? {...s, transitionOut: {...s.transitionOut, captionAt: FILM3_LOOP_CAPTION_AT}} : s));
export const film3Captions = captionsJson as CaptionBeat[];
export const film3Sfx = (animatic as {sfx: FilmSfx[]}).sfx;
/** Film seconds (the voice: 41.15 s). */
export const film3Seconds = filmDuration(film3Scenes);
/** Frames at 60 fps: ceil(seconds * fps), the same rounding as Film's loop seam. */
export const film3Frames = (from = 0, to = film3Seconds) => Math.max(1, Math.ceil((to - from) * FILM3_FPS - 1e-6));

/** Frame 0 states the payoff in words (owner playbook), in the style frame's caption look (ink, the highlight box). */
export const FILM3_FRAME0: Frame0Text = {
  lines: ['AI is making your', 'next laptop pricier.'],
  highlight: 'pricier.',
  until: (animatic as {frame0Until: number}).frame0Until,
};

const common = {
  components: sceneComponents,
  wipers: sceneWipers,
  captions: film3Captions,
  audioSrc: FILM3_VOICE,
  sfx: film3Sfx,
  captionMotion: 'pop' as const,
  frame0: FILM3_FRAME0,
  draftLabel: FILM3_GATE,
  edges: false,
};

/** The whole film, end to end (loops to the bare-line frame 0). */
export const Film3: React.FC = () => <Film scenes={film3Scenes} {...common} />;

/** The posting master (G8): the whole film without the burned-in draft label. */
export const Film3Final: React.FC = () => <Film scenes={film3Scenes} {...common} draftLabel={undefined} />;

/** One sequence alone: its captions, its slice of the voice and sound cues, its own un-build (SQF). Composition time =
 *  sequence-local time; the label shows film time. */
export const Film3Shot: React.FC<{id: string}> = ({id}) => {
  const s = film3Scenes.find((x) => x.id === id);
  if (!s) return null;
  return <Film scenes={film3Scenes} {...common} only={id} offset={s.start} />;
};

/** The seam probe's frames (4 per seam: lib/sequence.tsx seamProbeFrames) and its composition length. */
export const film3SeamFrames = seamProbeFrames(film3Scenes, FILM3_FPS);
export const film3SeamProbeLength = Math.max(1, film3SeamFrames.length);

/** The seam probe (scripts/qa/gate_check.py --seam-comp Film3Seams): frame k = one side of one seam alone, at the
 *  film's exact frame time (no captions, no label, no audio). */
export const Film3Seams: React.FC = () => <FilmSeamProbe scenes={film3Scenes} components={sceneComponents} wipers={sceneWipers} edges={false} />;
