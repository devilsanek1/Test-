// Isolated preview entry for S01 (scene lane): bundles ONLY Scene01 with the film's captions, so another lane's
// half-written scene module can't break S01 previews / QA renders (src/entry-film.ts bundles every scene through the
// require.context registry). Usage: node scripts/render-frames.mjs S01 <out> <times> --entry=src/scenes/scene01/preview.entry.tsx
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film, FilmScene} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import {canvas} from '../../lib/theme';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';
import Scene01 from '../Scene01';

const scenes = scenesJson as FilmScene[];
const s = scenes.find((x) => x.id === 'S01') as FilmScene;
const Comp: React.FC = () => <Film scenes={scenes} components={{S01: Scene01}} wipers={{}} captions={captionsJson as CaptionBeat[]} only="S01" offset={s.start} />;
const Root: React.FC = () => <Composition id="S01" component={Comp} durationInFrames={Math.max(1, Math.ceil((s.end - s.start) * canvas.fps))} fps={canvas.fps} width={canvas.width} height={canvas.height} />;
registerRoot(Root);
