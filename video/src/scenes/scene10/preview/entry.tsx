// S10 ISOLATED preview entry (scene lane only; not part of the film bundle: src/scenes/index.ts only discovers top-level
// SceneNN.tsx files). Other lanes' half-written scene files can't break S10's previews / QA renders:
//   node scripts/render-frames.mjs S10 <out> <t1,t2,..> --entry=src/scenes/scene10/preview/entry.tsx
//   node scripts/render-frames.mjs S09S10 <out> ... --entry=src/scenes/scene10/preview/seam.tsx   (the tram wipe, with S09)
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {canvas} from '../../../lib/theme';
import {Film, FilmScene} from '../../../lib/Film';
import type {CaptionBeat} from '../../../lib/Captions';
import scenesJson from '../../../data/scenes.json';
import captionsJson from '../../../data/captions.json';
import Scene10 from '../../Scene10';
import {TramWiper} from '../../scene09/TramWiper';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const s10 = scenes.find((x) => x.id === 'S10')!;

const S10Only: React.FC = () => <Film scenes={scenes} components={{S10: Scene10}} wipers={{S09: TramWiper}} captions={captions} only="S10" offset={s10.start} audio={false} />;

const Root: React.FC = () => (
  <Composition id="S10" component={S10Only} durationInFrames={Math.ceil((s10.end - s10.start) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
);
registerRoot(Root);
