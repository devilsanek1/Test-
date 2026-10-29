// S09 solo preview entry: ONLY S09 (no neighbour scene imported, so a neighbour lane's half-written file can't break it).
//   node scripts/render-frames.mjs S09 out 0,2.4,4.9 --scale=0.5 --entry=src/scenes/scene09/preview.solo.entry.tsx
// "S09wipeSolo" = the film timeline with S09 + its tram Wiper and S10 left as the Film placeholder (the wipe itself).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film, FilmScene, filmDuration} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import {canvas} from '../../lib/theme';
import Scene09, {Wiper} from '../Scene09';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const s9 = scenes.find((s) => s.id === 'S09')!;
const One: React.FC = () => <Film scenes={scenes} components={{S09: Scene09}} wipers={{S09: Wiper}} captions={captions} only="S09" offset={s9.start} />;
const Wipe: React.FC = () => <Film scenes={scenes} components={{S09: Scene09}} wipers={{S09: Wiper}} captions={captions} />;
const Root: React.FC = () => (
  <>
    <Composition id="S09" component={One} durationInFrames={Math.ceil((s9.end - s9.start) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    <Composition id="S09wipeSolo" component={Wipe} durationInFrames={Math.ceil(filmDuration(scenes) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
  </>
);
registerRoot(Root);
