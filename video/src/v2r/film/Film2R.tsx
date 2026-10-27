// Film2R (K8, the engine): video 2's finished film, "One Small Window" (docs/v2/TREATMENT.md). The house sequencer
// <Film> (src/lib/Film.tsx) with this film's data (the Film3 pattern, docs/v2/BUILD.md):
//   scenes.json    V2S1-V2S8, TREATMENT section 5's times and transitions (hand-written); V2S8's un-build loops into
//                  V2S1's t < 0 bare-line state; captionTone per shot (a shot module's exported `captionTone` wins)
//   captions.json  pop captions from public/v2r/voice_words_heard.json (scripts/film_captions.py + captions_pages.txt)
//   scenes/        one file per shot, src/v2r/scenes/V2S<n>.tsx (lanes replace the placeholders; index.ts registers them)
//   audio          the voice public/v2/voice.wav; sound cues from public/v2r/cues.json once the sound lane writes it
//                  ({"sfx": [{src, t, gain}], "audio"?: "v2r/mix.wav"}: `audio` replaces the voice, e.g. the final mix)
//   frame 0        TREATMENT section 4: the block SHE SAYS: NO CRITICIZING / GOOGLE. FOR LIFE. + its source line, the
//                  box walking the block's own words on timed keys, only the first spoken page under it, until 5.95
//   credits        TREATMENT section 8: the engine draws only the S8 caption-band source line (33.16-36.54); every
//                  other credit lives on an object in its shot (boards, tag, plates, news box: the lanes')
//   draftLabel     ON for review renders ("V2R · <shot> · <m:ss.ss>"), OFF for the final (--props='{"draftLabel":false}')
// Compositions: src/entry-v2r-film.tsx (Film2R, Film2RShot {id}, Film2R-<ID>, Film2RBare).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, getStaticFiles, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Film, filmDuration, type FilmScene, type FilmSfx, type Frame0Text} from '../../lib/Film';
import {CAPCHECK_COLORS, capcheckMode, type CaptionBeat} from '../../lib/Captions';
import {captionFontStack, useCaptionFont} from '../../lib/font';
import {skyCaption, world} from '../../lib/theme';
import {CM} from '../palette';
import scenesJson from './scenes.json';
import captionsJson from './captions.json';
import {sceneComponents, sceneTones, sceneWipers} from '../scenes';

export const FILM2R_FPS = 60;
export const FILM2R_VOICE = 'v2/voice.wav';
export const FILM2R_CUES = 'v2r/cues.json';
/** The label burned into every review render. */
export const FILM2R_LABEL = 'V2R';
export const SOURCE_BBC = 'Source: BBC News, 21 Oct 2026';

/** The shots, with each lane's own captionTone (exported by its shot module) over the scenes.json default. */
export type Film2RScene = FilmScene & {light?: string; lane?: string};
export const film2rScenes: Film2RScene[] = (scenesJson as Film2RScene[]).map((s) => (sceneTones[s.id] ? {...s, captionTone: sceneTones[s.id]} : s));
export const film2rCaptions = captionsJson as CaptionBeat[];
/** Film seconds (the voice: 39.08 s). */
export const film2rSeconds = filmDuration(film2rScenes);
/** Frames at 60 fps: ceil(seconds * fps), the same rounding as Film's loop seam (2345). */
export const film2rFrames = (from = 0, to = film2rSeconds) => Math.max(1, Math.ceil((to - from) * FILM2R_FPS - 1e-6));

/** Frame 0 (TREATMENT section 4): ONE tier of words in the caption band on the flat mint, the source line under it.
 *  The only spoken page under the block is "She [quit] Google." (52 px, baseline 516); from ~1.9 s the box walks the
 *  block's own words (landing ~0.06 s before each audible onset) and holds FOR LIFE through the cover to 5.95, when
 *  block and source pop out together as the dive starts. At the loop roll (captionAt 39.04) the words pop back, no box. */
export const FILM2R_FRAME0: Frame0Text = {
  lines: ['SHE SAYS: NO CRITICIZING', 'GOOGLE. FOR LIFE.'],
  size: 72,
  baselines: [372, 452],
  until: 5.95,
  source: SOURCE_BBC,
  sourceSize: 20,
  sourceBaseline: 550,
  keys: [
    {t: 2.06, text: 'SAYS:'},
    {t: 3.14, text: 'NO'},
    {t: 3.74, text: 'NO CRITICIZING'},
    {t: 4.77, text: 'FOR LIFE.'},
  ],
  spoken: 'first',
  captionBaseline: 516,
  captionScale: 52 / skyCaption.size,
};

/** Engine-drawn credits (film seconds), small ink lines under the captions. TREATMENT section 8: S1's source rides
 *  the frame-0 block (FILM2R_FRAME0.source); S8's sits under the caption 33.16-36.54, then moves onto her board (L6). */
export type Film2RCredit = {from: number; to: number; text: string; baseline?: number; size?: number};
export const FILM2R_CREDITS: Film2RCredit[] = [{from: 33.16, to: 36.54, text: SOURCE_BBC, baseline: 552, size: 20}];

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

/** The engine credits overlay (caption font, ink, pops in and out; never in capcheck's background pass). */
const Credits: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ok = useCaptionFont();
  const mode = capcheckMode();
  if (mode === 'bg') return null;
  const T = frame / fps + offset;
  const on = FILM2R_CREDITS.filter((c) => T >= c.from - 1e-6 && T < c.to - 1e-6);
  if (!on.length) return null;
  const fill = mode === 'mask' ? CAPCHECK_COLORS.dark : CM.ink;
  return (
    <svg width={world.w} height={world.h} viewBox={`0 0 ${world.w} ${world.h}`} style={{position: 'absolute', left: 0, top: 0, visibility: ok ? undefined : 'hidden'}}>
      {on.map((c, i) => (
        <text key={i} x={skyCaption.cx} y={c.baseline ?? 552} textAnchor="middle" fontFamily={captionFontStack} fontSize={c.size ?? 20} fill={fill}>
          {c.text}
        </text>
      ))}
    </svg>
  );
};

/** The push-through's flat bridge colour (V2S1 -> V2S2: plum, 6.05-6.15). lib/Film computes the hold (0.1 s, its
 *  PT_HOLD) but culls the outgoing scene at c - hold / 2 before it pushes the bridge overlay, so the bridge never
 *  draws (no other film uses a bridge yet); Film2R draws it here, above everything, for the hold's frames. Full film
 *  only (a one-shot preview has no outgoing scene). */
const PT_HOLD = 0.1;
const Bridges: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = frame / fps;
  for (const s of film2rScenes) {
    const tin = s.transitionIn;
    if (tin?.type === 'push-through' && tin.bridge && T >= s.start - PT_HOLD / 2 - 1e-6 && T < s.start + PT_HOLD / 2 - 1e-6) return <AbsoluteFill style={{background: tin.bridge}} />;
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
    frame0: FILM2R_FRAME0,
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
      <Credits offset={0} />
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
      <Credits offset={s.start} />
    </AbsoluteFill>
  );
};

/** Sound-off cold reads: the picture and the voice only (no captions, frame-0 words, credits or label). */
export const Film2RBare: React.FC = () => {
  const cues = useCues();
  return (
    <AbsoluteFill>
      <Film scenes={film2rScenes} components={sceneComponents} wipers={sceneWipers} captions={film2rCaptions} showCaptions={false} audioSrc={cues.audio ?? FILM2R_VOICE} sfx={cues.sfx} captionMotion="pop" edges={false} />
      <Bridges />
    </AbsoluteFill>
  );
};
