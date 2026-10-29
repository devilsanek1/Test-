// scene11/entry.tsx — an ISOLATED preview entry for S11 (render-frames --entry=src/scenes/scene11/entry.tsx).
// The film entry bundles every scene module (src/scenes/index.ts require.context), so a half-written neighbour can stop
// S11 previews from bundling; this entry imports only Scene11, the data and the engine.
//   S11      = SceneOnly('S11'), identical to the film's per-scene composition
//   S11Film  = the whole timeline with only S11 mounted (neighbours show the engine's missing-scene placeholder)
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {canvas} from '../../lib/theme';
import {Film, FilmScene, filmDuration} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';
import Scene11 from '../Scene11';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const components: Record<string, React.FC> = {S11: Scene11};
const s11 = scenes.find((s) => s.id === 'S11')!;

const Only: React.FC = () => <Film scenes={scenes} components={components} wipers={{}} captions={captions} only="S11" offset={s11.start} />;
const Whole: React.FC = () => <Film scenes={scenes} components={components} wipers={{}} captions={captions} />;

const Root: React.FC = () => (
  <>
    <Composition id="S11" component={Only} durationInFrames={Math.max(1, Math.ceil((s11.end - s11.start) * canvas.fps))} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    <Composition id="S11Film" component={Whole} durationInFrames={Math.ceil(filmDuration(scenes) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
  </>
);

registerRoot(Root);
