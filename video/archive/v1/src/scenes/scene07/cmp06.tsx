// scene07/cmp06.tsx — dev-only comparison entry (not part of the film): the S06 -> S07 lens wipe with S06, S07 and
// S06's exported Wiper mounted (the film's foreground-wipe element 'scene').
// render-frames --entry=src/scenes/scene07/cmp06.tsx S06S07 <out> <film seconds>
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {canvas} from '../../lib/theme';
import {Film, FilmScene, filmDuration} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';
import Scene06, {Wiper as Wiper06} from '../Scene06';
import Scene07 from '../Scene07';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const Whole: React.FC = () => <Film scenes={scenes} components={{S06: Scene06, S07: Scene07}} wipers={{S06: Wiper06}} captions={captions} />;
registerRoot(() => <Composition id="S06S07" component={Whole} durationInFrames={Math.ceil(filmDuration(scenes) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />);
