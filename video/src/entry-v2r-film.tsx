// Video 2 (restart, "One Small Window") film entry (K8, the engine; docs/v2/BUILD.md). The palette module is imported
// FIRST, so the Canal Mint tokens are in place before any lib / kit module reads them. Compositions (1080 x 1920, 60 fps):
//   Film2R         the whole film, ceil(39.08 * 60) = 2345 frames: voice (+ cues), captions, frame-0 block, credits,
//                  draft label (props {draftLabel}: ON by default for review renders; the final passes false)
//   Film2RShot     props {id}: one shot alone (its captions and its slice of the voice), composition time = shot time
//   Film2R-<ID>    the same per shot without props (V2S1 ... V2S8)
//   Film2RBare     the whole film without captions, frame-0 words, credits or label (sound-off cold reads)
// Render (always --gl=angle; 4 shared CPUs: --concurrency=2):
//   npx remotion render src/entry-v2r-film.tsx Film2R out/v2r.mp4 --gl=angle --concurrency=2 --scale=0.5
//   npx remotion render src/entry-v2r-film.tsx Film2R out/v2r_final.mp4 --gl=angle --concurrency=2 --crf 14 --props='{"draftLabel":false}'
// Stills: GL=angle node scripts/render-frames.mjs Film2R-V2S1 <dir> 0,1.5 --entry=src/entry-v2r-film.tsx --scale=0.5
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film2R, Film2RBare, Film2RShot, FILM2R_FPS, film2rFrames, film2rScenes} from './v2r/film/Film2R';

const W = 1080;
const H = 1920;
const shotFrames = (id: string) => {
  const s = film2rScenes.find((x) => x.id === id);
  return s ? film2rFrames(s.start, s.end) : 1;
};
const ShotById: React.FC<{id: string; draftLabel?: boolean}> = ({id, draftLabel}) => <Film2RShot id={id} draftLabel={draftLabel} />;

const V2RFilmRoot: React.FC = () => (
  <>
    <Composition id="Film2R" component={Film2R} defaultProps={{draftLabel: true}} durationInFrames={film2rFrames()} fps={FILM2R_FPS} width={W} height={H} />
    <Composition
      id="Film2RShot"
      component={ShotById}
      defaultProps={{id: film2rScenes[0].id, draftLabel: true}}
      durationInFrames={shotFrames(film2rScenes[0].id)}
      calculateMetadata={({props}) => ({durationInFrames: shotFrames(props.id)})}
      fps={FILM2R_FPS}
      width={W}
      height={H}
    />
    {film2rScenes.map((s) => (
      <Composition key={s.id} id={`Film2R-${s.id}`} component={ShotById} defaultProps={{id: s.id, draftLabel: true}} durationInFrames={shotFrames(s.id)} fps={FILM2R_FPS} width={W} height={H} />
    ))}
    <Composition id="Film2RBare" component={Film2RBare} durationInFrames={film2rFrames()} fps={FILM2R_FPS} width={W} height={H} />
  </>
);

registerRoot(V2RFilmRoot);
