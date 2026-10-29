// S02 preview entry (dev only, never imported by the film): registers composition "S02" exactly like FilmRoot's
// per-scene composition (Film with only="S02", its captions and offset), but with ONLY this scene's module bundled, so
// another lane's half-written scene file cannot break S02 previews.
//   node scripts/render-frames.mjs S02 <outDir> <t,..> --entry=src/scenes/scene02/preview.entry.tsx
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {canvas} from '../../lib/theme';
import {Film, FilmScene} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';
import Scene02 from '../Scene02';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const s = scenes.find((x) => x.id === 'S02')!;

const Only: React.FC = () => <Film scenes={scenes} components={{S02: Scene02}} wipers={{}} captions={captions} only="S02" offset={s.start} />;

const Root: React.FC = () => (
  <Composition id="S02" component={Only} durationInFrames={Math.max(1, Math.ceil((s.end - s.start) * canvas.fps))} fps={canvas.fps} width={canvas.width} height={canvas.height} />
);

registerRoot(Root);
