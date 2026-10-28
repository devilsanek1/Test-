// Film2R (K8, the engine): video 2's finished film, "One Small Window" (docs/v2/TREATMENT.md). The house sequencer
// <Film> (src/lib/Film.tsx) with this film's data (the Film3 pattern, docs/v2/BUILD.md):
//   scenes.json    V2S1-V2S8, TREATMENT section 5's times and transitions (hand-written); V2S8's un-build loops into
//                  V2S1's t < 0 bare-line state; captionTone per shot (a shot module's exported `captionTone` wins)
//   captions.json  pop captions from public/v2r/voice_words_heard.json (scripts/film_captions.py + captions_pages.txt)
//   scenes/        one file per shot, src/v2r/scenes/V2S<n>.tsx (lanes replace the placeholders; index.ts registers them)
//   audio          the voice public/v2/voice.wav; sound cues from public/v2r/cues.json once the sound lane writes it
//                  ({"sfx": [{src, t, gain}], "audio"?: "v2r/mix.wav"}: `audio` replaces the voice, e.g. the final mix)
//   frame 0        NO title over the captions (REVIEW_1 MUST 1; playbook "Hook and pacing": no `frame0` block, as
//                  Film3): frame 0 shows the first spoken page, "She [quit] Google.", at the house size; the core line
//                  is the cover's text and the source goes to the post (docs/v2/POSTING_KIT.md)
//   credits        none in the picture (REVIEW_1 MUST 3; playbook: no small source lines in the picture): every source
//                  and cut detail is in the post caption and the pinned comment (docs/v2/POSTING_KIT.md)
//   draftLabel     ON for review renders ("V2R · <shot> · <m:ss.ss>"), OFF for the final (--props='{"draftLabel":false}')
// Compositions: src/entry-v2r-film.tsx (Film2R, Film2RShot {id}, Film2R-<ID>, Film2RBare).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, getStaticFiles, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Film, filmDuration, pushThroughHold, type FilmScene, type FilmSfx} from '../../lib/Film';
import {type CaptionBeat} from '../../lib/Captions';
import scenesJson from './scenes.json';
import captionsJson from './captions.json';
import {sceneComponents, sceneTones, sceneWipers} from '../scenes';

export const FILM2R_FPS = 60;
export const FILM2R_VOICE = 'v2/voice.wav';
export const FILM2R_CUES = 'v2r/cues.json';
/** The label burned into every review render. */
export const FILM2R_LABEL = 'V2R';

/** The shots, with each lane's own captionTone (exported by its shot module) over the scenes.json default. */
export type Film2RScene = FilmScene & {light?: string; lane?: string};
export const film2rScenes: Film2RScene[] = (scenesJson as Film2RScene[]).map((s) => (sceneTones[s.id] ? {...s, captionTone: sceneTones[s.id]} : s));
export const film2rCaptions = captionsJson as CaptionBeat[];
/** Film seconds (the voice: 39.08 s). */
export const film2rSeconds = filmDuration(film2rScenes);
/** Frames at 60 fps: ceil(seconds * fps), the same rounding as Film's loop seam (2345). */
export const film2rFrames = (from = 0, to = film2rSeconds) => Math.max(1, Math.ceil((to - from) * FILM2R_FPS - 1e-6));

/** No frame-0 title over the captions (REVIEW_1 MUST 1; owner, 2026-10-28: "Why are we having this out of order
 *  weirdly?"): the words follow the voice. Frame 0 shows the first spoken page, "She [quit] Google.", at the house
 *  size; "And she says her contract / bans her from criticizing it…" pops at 2.00 and "for life." at 4.79 (it leaves
 *  the band at 5.88, as the dive into W starts: captions_pages.txt `@out`). At the loop roll (captionAt 39.04) page 1
 *  pops back, as at frame 0. The core line is the cover's text; the S1 source line went to the post (POSTING_KIT.md). */

/** The sound lane's cue file (optional): a bare [{src, t, gain}] array or {sfx, audio}. */
type CueFile = FilmSfx[] | {sfx?: FilmSfx[]; audio?: string};

/** The public files (names relative to public/), or null where the API is unavailable. */
function publicNames(): Set<string> | null {
  try {
    return new Set(getStaticFiles().map((f) => f.name));
  } catch {
    return null;
  }
}

/** Reads public/v2r/cues.json when it exists (no file = voice only, no cues). Cues whose file is not in public/ yet
 *  (the sound lane mid-work) are skipped, and a missing `audio` falls back to the voice, so a half-written cue sheet
 *  never breaks a render. */
function useCues(): {sfx: FilmSfx[]; audio?: string} {
  const [names] = useState(publicNames);
  const has = names?.has(FILM2R_CUES) ?? false;
  const [handle] = useState(() => (has ? delayRender('v2r cues.json') : null));
  const [cues, setCues] = useState<{sfx: FilmSfx[]; audio?: string}>({sfx: []});
  useEffect(() => {
    if (handle === null) return;
    fetch(staticFile(FILM2R_CUES))
      .then((r) => r.json() as Promise<CueFile>)
      .then((j) => {
        const ok = (src?: string) => !!src && (!names || names.has(src));
        const raw = Array.isArray(j) ? {sfx: j} : {sfx: j.sfx ?? [], audio: j.audio};
        setCues({sfx: raw.sfx.filter((c) => ok(c.src)), audio: ok(raw.audio) ? raw.audio : undefined});
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle, names]);
  return cues;
}

/** The push-through's flat bridge colour (V2S1 -> V2S2 and V2S3 -> V2S4: plum, 3 frames). lib/Film computes the hold
 *  (the join's own `hold`, 0.05 s here since REVIEW_1 MUST 5, else its PT_HOLD 0.1: pushThroughHold) but culls the
 *  outgoing scene at c - hold / 2 before it pushes the bridge overlay, so the bridge never draws (no other film uses a
 *  bridge yet); Film2R draws it here, above everything, for the hold's frames. Full film only (a one-shot preview has
 *  no outgoing scene). The bridge ends exactly where Film shows the incoming scene (c + hold / 2, same expression, no
 *  epsilon), so no frame draws neither. */
const Bridges: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = frame / fps;
  for (const s of film2rScenes) {
    const tin = s.transitionIn;
    if (tin?.type !== 'push-through' || !tin.bridge) continue;
    const hold = pushThroughHold(tin);
    if (T >= s.start - hold / 2 - 1e-6 && T < s.start + hold / 2) return <AbsoluteFill style={{background: tin.bridge}} />;
  }
  return null;
};

type Common = Omit<React.ComponentProps<typeof Film>, 'scenes'>;
const useCommon = (draftLabel: boolean): Common => {
  const cues = useCues();
  return {
    components: sceneComponents,
    wipers: sceneWipers,
    captions: film2rCaptions,
    audioSrc: cues.audio ?? FILM2R_VOICE,
    sfx: cues.sfx,
    captionMotion: 'pop',
    draftLabel: draftLabel ? FILM2R_LABEL : undefined,
    edges: false,
  };
};

export type Film2RProps = {draftLabel?: boolean};

/** The whole film, end to end (loops to the bare-line frame 0). draftLabel defaults ON (review renders). */
export const Film2R: React.FC<Film2RProps> = ({draftLabel = true}) => {
  const common = useCommon(draftLabel);
  return (
    <AbsoluteFill>
      <Film scenes={film2rScenes} {...common} />
      <Bridges />
    </AbsoluteFill>
  );
};

/** One shot alone: its captions, its slice of the voice and cues, its own un-build (V2S8). Composition time =
 *  shot-local time; the label shows film time. */
export const Film2RShot: React.FC<{id: string; draftLabel?: boolean}> = ({id, draftLabel = true}) => {
  const common = useCommon(draftLabel);
  const s = film2rScenes.find((x) => x.id === id);
  if (!s) return null;
  return (
    <AbsoluteFill>
      <Film scenes={film2rScenes} {...common} only={id} offset={s.start} />
    </AbsoluteFill>
  );
};

/** Sound-off cold reads: the picture and the voice only (no captions, credits or label). */
export const Film2RBare: React.FC = () => {
  const cues = useCues();
  return (
    <AbsoluteFill>
      <Film scenes={film2rScenes} components={sceneComponents} wipers={sceneWipers} captions={film2rCaptions} showCaptions={false} audioSrc={cues.audio ?? FILM2R_VOICE} sfx={cues.sfx} captionMotion="pop" edges={false} />
      <Bridges />
    </AbsoluteFill>
  );
};
