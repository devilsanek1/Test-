// S10 seam preview: S09 -> S10 (the tram wipe) and S10 -> S11 (the hard cut) as Film runs them (only S09, S10, S11
// are bundled). Composition "S09S10": film 38.9-40.6 s; "S10S11": film 45.0-46.4 s.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {canvas} from '../../../lib/theme';
import {Film, FilmScene} from '../../../lib/Film';
import type {CaptionBeat} from '../../../lib/Captions';
import scenesJson from '../../../data/scenes.json';
import captionsJson from '../../../data/captions.json';
import Scene09, {Wiper as Wiper09} from '../../Scene09';
import Scene10 from '../../Scene10';
import Scene11 from '../../Scene11';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const comps = {S09: Scene09, S10: Scene10, S11: Scene11};
const A: React.FC = () => <Film scenes={scenes} components={comps} wipers={{S09: Wiper09}} captions={captions} offset={38.9} audio={false} />;
const B: React.FC = () => <Film scenes={scenes} components={comps} wipers={{S09: Wiper09}} captions={captions} offset={45.0} audio={false} />;

const Root: React.FC = () => (
  <>
    <Composition id="S09S10" component={A} durationInFrames={Math.round(1.7 * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    <Composition id="S10S11" component={B} durationInFrames={Math.round(1.4 * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
  </>
);
registerRoot(Root);
