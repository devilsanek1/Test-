// Isolated SEAM entry for S05's cut checks (dev only, never imported by the film): Main's timeline (Film, the real
// scenes.json, captions, transitions) with ONLY S04, S05 and S06 bundled, so a sibling scene that is mid-edit cannot
// break the S04 -> S05 matchcut / S05 -> S06 cut-on-action renders. Composition id "Main" (Main's film seconds).
//   node scripts/render-frames.mjs Main <outDir> 16.5667,16.6 --entry=src/scenes/scene05/seam.tsx
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film, FilmScene, filmDuration} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import {canvas} from '../../lib/theme';
import Scene04 from '../Scene04';
import Scene05 from '../Scene05';
import Scene06 from '../Scene06';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];

const Seam: React.FC = () => <Film scenes={scenes} components={{S04: Scene04, S05: Scene05, S06: Scene06}} wipers={{}} captions={captions} />;

const Root: React.FC = () => (
  <Composition id="Main" component={Seam} durationInFrames={Math.ceil(filmDuration(scenes) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
);

registerRoot(Root);
