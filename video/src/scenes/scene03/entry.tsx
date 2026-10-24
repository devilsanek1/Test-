// Isolated preview entry for S03 (dev only, never imported by the film): the S03 composition exactly as FilmRoot builds
// it (Film, only='S03', its captions and soundtrack offset) but bundling ONLY Scene03, so a sibling scene that is mid-edit
// cannot break S03 previews.
//   node scripts/render-frames.mjs S03 <outDir> 1.0,2.5 --scale=0.5 --entry=src/scenes/scene03/entry.tsx
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film, FilmScene} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import {canvas} from '../../lib/theme';
import Scene03 from '../Scene03';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const s = scenes.find((x) => x.id === 'S03')!;

const S03Solo: React.FC = () => <Film scenes={scenes} components={{S03: Scene03}} wipers={{}} captions={captions} only="S03" offset={s.start} />;

const Root: React.FC = () => (
  <Composition id="S03" component={S03Solo} durationInFrames={Math.max(1, Math.ceil((s.end - s.start) * canvas.fps))} fps={canvas.fps} width={canvas.width} height={canvas.height} />
);

registerRoot(Root);
