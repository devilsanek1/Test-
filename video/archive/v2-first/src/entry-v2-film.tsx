// Video 2 G5 film entry (engine lane; template: src/entry-v3-film.tsx, docs/G5_BLOCKING.md).
// The palette module is imported FIRST, so the Cream & Cobalt tokens are in place before any lib / kit module reads
// them. Compositions (1080 x 1920, 60 fps):
//   Film2         the whole film, ceil(39.08 * 60) = 2345 frames, voice + sound cues + captions + credits + draft label
//   Film2Shot     props {id}: one panel alone (its captions, credit and slice of the voice), composition time = panel time
//   Film2-<ID>    the same per panel without props (sheet.sh's caption check passes its own --props)
//   Film2Bare     the whole film's picture only: no captions, no frame-0 words, no credits, no label (sound-off cold reads)
// Render: npx remotion render src/entry-v2-film.tsx Film2 out/v2_g5.mp4 --scale=0.5 --concurrency=2
// Stills: node scripts/render-frames.mjs Film2Shot <dir> 0,1.5 --entry=src/entry-v2-film.tsx --props='{"id":"P8"}' --scale=0.5
import './v2/film/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film2, Film2Bare, Film2Shot, FILM2_FPS, film2Frames, film2Scenes} from './v2/film/Film2';

const W = 1080;
const H = 1920;
const shotFrames = (id: string) => {
  const s = film2Scenes.find((x) => x.id === id);
  return s ? film2Frames(s.start, s.end) : 1;
};
const ShotById: React.FC<{id: string}> = ({id}) => <Film2Shot id={id} />;

const V2FilmRoot: React.FC = () => (
  <>
    <Composition id="Film2" component={Film2} durationInFrames={film2Frames()} fps={FILM2_FPS} width={W} height={H} />
    <Composition
      id="Film2Shot"
      component={ShotById}
      defaultProps={{id: film2Scenes[0].id}}
      durationInFrames={shotFrames(film2Scenes[0].id)}
      calculateMetadata={({props}) => ({durationInFrames: shotFrames(props.id)})}
      fps={FILM2_FPS}
      width={W}
      height={H}
    />
    {film2Scenes.map((s) => (
      <Composition key={s.id} id={`Film2-${s.id}`} component={ShotById} defaultProps={{id: s.id}} durationInFrames={shotFrames(s.id)} fps={FILM2_FPS} width={W} height={H} />
    ))}
    <Composition id="Film2Bare" component={Film2Bare} durationInFrames={film2Frames()} fps={FILM2_FPS} width={W} height={H} />
  </>
);

registerRoot(V2FilmRoot);
