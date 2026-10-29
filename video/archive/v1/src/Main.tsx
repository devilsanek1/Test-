// Main — the full video (v2, full-bleed): scenes from src/data/scenes.json sequenced on the VO timeline by <Film>
// (lib/Film.tsx: transitions, sky captions with tones, soundtrack = public/mix.wav if present else public/vo.mp3).
import React from 'react';
import {Film, FilmScene, filmDuration} from './lib/Film';
import {CaptionBeat} from './lib/Captions';
import {sceneComponents, sceneWipers} from './scenes';
import scenesJson from './data/scenes.json';
import captionsJson from './data/captions.json';

export const scenes = scenesJson as FilmScene[];
export const captions = captionsJson as CaptionBeat[];
export const mainDurationSeconds = filmDuration(scenes);

export const Main: React.FC = () => <Film scenes={scenes} components={sceneComponents} wipers={sceneWipers} captions={captions} />;

/** One scene alone (its captions, soundtrack offset to its range, its own un-build). Registered per scene id in Root. */
export const SceneOnly: React.FC<{id: string}> = ({id}) => {
  const s = scenes.find((x) => x.id === id);
  if (!s) return null;
  return <Film scenes={scenes} components={sceneComponents} wipers={sceneWipers} captions={captions} only={id} offset={s.start} />;
};
