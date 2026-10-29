// scene06/entry.tsx — an ISOLATED preview entry for S06 (render-frames --entry=src/scenes/scene06/entry.tsx).
// The film entry bundles every scene module (src/scenes/index.ts require.context), so a half-written neighbour can stop
// S06 previews from bundling; this entry imports only S05 / S06 / S07 (+ S06's Wiper), the data and the engine.
//   S06      = Film only='S06' (identical to the film's per-scene composition: scene time)
//   S06Film  = the whole timeline with S05, S06, S07 mounted and S06's Wiper registered (FILM time): use it for the
//              cut on action in (19.77) and the lens wipe out (21.775-22.195)
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {canvas} from '../../lib/theme';
import {Film, FilmScene, filmDuration} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';
import Scene05 from '../Scene05';
import Scene06, {Wiper} from '../Scene06';
import Scene07 from '../Scene07';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const s6 = scenes.find((s) => s.id === 'S06')!;

const Only: React.FC = () => <Film scenes={scenes} components={{S06: Scene06}} wipers={{S06: Wiper}} captions={captions} only="S06" offset={s6.start} />;
const Whole: React.FC = () => <Film scenes={scenes} components={{S05: Scene05, S06: Scene06, S07: Scene07}} wipers={{S06: Wiper}} captions={captions} />;

const Root: React.FC = () => (
  <>
    <Composition id="S06" component={Only} durationInFrames={Math.max(1, Math.ceil((s6.end - s6.start) * canvas.fps))} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    <Composition id="S06Film" component={Whole} durationInFrames={Math.ceil(filmDuration(scenes) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
  </>
);

registerRoot(Root);
