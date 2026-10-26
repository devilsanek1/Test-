// Video 3 G5 film entry (engine lane; the TEMPLATE for any video's film entry, docs/G5_BLOCKING.md).
// The palette module is imported FIRST, so the Autumn Ember tokens are in place before any lib / kit module reads
// them. Compositions (1080 x 1920, 60 fps):
//   Film3         the whole film, ceil(41.15 * 60) = 2469 frames, voice + sound cues + captions + draft label
//   Film3Shot     props {id}: one panel alone (its captions and its slice of the voice), composition time = panel time
//   Film3-<ID>    the same per panel without props (sheet.sh's caption check passes its own --props)
// Render: npx remotion render src/entry-v3-film.tsx Film3 out/v3_g5.mp4 --scale=0.5
// Stills: node scripts/render-frames.mjs Film3Shot <dir> 0,1.5 --entry=src/entry-v3-film.tsx --props='{"id":"S9"}' --scale=0.5
import './v3/film/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film3, Film3Shot, FILM3_FPS, film3Frames, film3Scenes} from './v3/film/Film3';

const W = 1080;
const H = 1920;
const shotFrames = (id: string) => {
  const s = film3Scenes.find((x) => x.id === id);
  return s ? film3Frames(s.start, s.end) : 1;
};
const ShotById: React.FC<{id: string}> = ({id}) => <Film3Shot id={id} />;

const V3FilmRoot: React.FC = () => (
  <>
    <Composition id="Film3" component={Film3} durationInFrames={film3Frames()} fps={FILM3_FPS} width={W} height={H} />
    <Composition
      id="Film3Shot"
      component={ShotById}
      defaultProps={{id: film3Scenes[0].id}}
      durationInFrames={shotFrames(film3Scenes[0].id)}
      calculateMetadata={({props}) => ({durationInFrames: shotFrames(props.id)})}
      fps={FILM3_FPS}
      width={W}
      height={H}
    />
    {film3Scenes.map((s) => (
      <Composition key={s.id} id={`Film3-${s.id}`} component={ShotById} defaultProps={{id: s.id}} durationInFrames={shotFrames(s.id)} fps={FILM3_FPS} width={W} height={H} />
    ))}
  </>
);

registerRoot(V3FilmRoot);
