// Main — the full video: scenes from src/data/scenes.json sequenced on the VO timeline (see lib/timeline.tsx).
import React from 'react';
import {Timeline, SceneDef, timelineDuration} from './lib/timeline';
import {CaptionBeat} from './lib/Captions';
import {sceneComponents} from './scenes';
import scenesJson from './data/scenes.json';
import captionsJson from './data/captions.json';

export const scenes = scenesJson as SceneDef[];
export const captions = captionsJson as CaptionBeat[];
export const mainDurationSeconds = timelineDuration(scenes);

export const Main: React.FC = () => <Timeline scenes={scenes} components={sceneComponents} captions={captions} />;

/** One scene alone (card, captions and VO offset to its range). Registered per scene id in Root. */
export const SceneOnly: React.FC<{id: string}> = ({id}) => {
  const s = scenes.find((x) => x.id === id);
  if (!s) return null;
  return <Timeline scenes={scenes} components={sceneComponents} captions={captions} only={id} offset={s.start} />;
};
