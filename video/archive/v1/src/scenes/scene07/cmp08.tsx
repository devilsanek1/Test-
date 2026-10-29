// scene07/cmp08.tsx — dev-only comparison entry (not part of the film): the S07 -> S08 cut with only S07 + S08 mounted.
// render-frames --entry=src/scenes/scene07/cmp08.tsx S07S08 <out> <film seconds>
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {canvas} from '../../lib/theme';
import {Film, FilmScene, filmDuration} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';
import Scene07 from '../Scene07';
import Scene08 from '../Scene08';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const Whole: React.FC = () => <Film scenes={scenes} components={{S07: Scene07, S08: Scene08}} wipers={{}} captions={captions} />;
registerRoot(() => <Composition id="S07S08" component={Whole} durationInFrames={Math.ceil(filmDuration(scenes) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />);
