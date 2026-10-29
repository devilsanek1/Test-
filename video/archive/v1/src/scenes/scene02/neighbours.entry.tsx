// S02 boundary preview entry (dev only, never imported by the film): composition "S02N" = the film timeline (Film, as
// Main renders it, captions included) with ONLY S01, S02 and S03 bundled, so the S01 -> S02 match-cut and the S02 -> S03
// hard cut can be checked frame by frame even while another lane's scene file is mid-edit. Times are FILM seconds.
//   node scripts/render-frames.mjs S02N <outDir> 4.5,4.7,4.75 --entry=src/scenes/scene02/neighbours.entry.tsx
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {canvas} from '../../lib/theme';
import {Film, FilmScene, filmDuration} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';
import Scene01 from '../Scene01';
import Scene02 from '../Scene02';
import Scene03 from '../Scene03';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];

const N: React.FC = () => <Film scenes={scenes} components={{S01: Scene01, S02: Scene02, S03: Scene03}} wipers={{}} captions={captions} />;

const Root: React.FC = () => (
  <Composition id="S02N" component={N} durationInFrames={Math.ceil(filmDuration(scenes) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
);

registerRoot(Root);
