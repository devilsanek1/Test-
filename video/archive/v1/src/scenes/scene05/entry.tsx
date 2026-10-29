// Isolated preview entry for S05 (dev only, never imported by the film): the S05 composition exactly as FilmRoot builds
// it (Film, only='S05', its captions and soundtrack offset) but bundling ONLY Scene05, so a sibling scene that is mid-edit
// cannot break S05 previews.
//   node scripts/render-frames.mjs S05 <outDir> 1.0,2.5 --scale=0.5 --entry=src/scenes/scene05/entry.tsx
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film, FilmScene} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import {canvas} from '../../lib/theme';
import Scene05 from '../Scene05';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const s = scenes.find((x) => x.id === 'S05')!;

const S05Solo: React.FC = () => <Film scenes={scenes} components={{S05: Scene05}} wipers={{}} captions={captions} only="S05" offset={s.start} />;

const Root: React.FC = () => (
  <Composition id="S05" component={S05Solo} durationInFrames={Math.max(1, Math.ceil((s.end - s.start) * canvas.fps))} fps={canvas.fps} width={canvas.width} height={canvas.height} />
);

registerRoot(Root);
