// S09 isolated preview entry (not part of the film bundle): the S09 composition exactly as Film renders it alone, and
// "S09film" = the whole film timeline with S08, S09 and S10 built (every other scene a placeholder), for the cuts.
// Another lane's half-written scene can't break it. Usage:
//   node scripts/render-frames.mjs S09 out 0,2.4,4.9 --scale=0.5 --entry=src/scenes/scene09/preview.entry.tsx
//   node scripts/render-frames.mjs S09film out 34.45,39.6,39.8 --scale=0.4 --entry=src/scenes/scene09/preview.entry.tsx
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film, FilmScene, filmDuration} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import {canvas} from '../../lib/theme';
import Scene09, {Wiper} from '../Scene09';
import Scene08 from '../Scene08';
import Scene10 from '../Scene10';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const s9 = scenes.find((s) => s.id === 'S09')!;
const One: React.FC = () => <Film scenes={scenes} components={{S09: Scene09}} wipers={{S09: Wiper}} captions={captions} only="S09" offset={s9.start} />;
const Cuts: React.FC = () => <Film scenes={scenes} components={{S08: Scene08, S09: Scene09, S10: Scene10}} wipers={{S09: Wiper}} captions={captions} />;
const Root: React.FC = () => (
  <>
    <Composition id="S09" component={One} durationInFrames={Math.ceil((s9.end - s9.start) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    <Composition id="S09film" component={Cuts} durationInFrames={Math.ceil(filmDuration(scenes) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
  </>
);
registerRoot(Root);
