// scene07/entry.tsx — an ISOLATED preview entry for S07 (render-frames --entry=src/scenes/scene07/entry.tsx).
// The film entry bundles every scene module (src/scenes/index.ts require.context), so a half-written neighbour can stop
// S07 previews from bundling; this entry imports only Scene07 (+ its Wiper, if any), the data and the engine.
//   S07      = SceneOnly('S07'), identical to the film's per-scene composition
//   S07Film  = the whole timeline with only S07 mounted (neighbours show the engine's missing-scene placeholder):
//              use it at film times to check the foreground-wipe in and the cut out.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {canvas} from '../../lib/theme';
import {Film, FilmScene, filmDuration} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';
import Scene07 from '../Scene07';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const components: Record<string, React.FC> = {S07: Scene07};
const s7 = scenes.find((s) => s.id === 'S07')!;

const Only: React.FC = () => <Film scenes={scenes} components={components} wipers={{}} captions={captions} only="S07" offset={s7.start} />;
const Whole: React.FC = () => <Film scenes={scenes} components={components} wipers={{}} captions={captions} />;

const Root: React.FC = () => (
  <>
    <Composition id="S07" component={Only} durationInFrames={Math.max(1, Math.ceil((s7.end - s7.start) * canvas.fps))} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    <Composition id="S07Film" component={Whole} durationInFrames={Math.ceil(filmDuration(scenes) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
  </>
);

registerRoot(Root);
