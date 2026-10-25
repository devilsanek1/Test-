// scene12/entry.tsx: an ISOLATED preview entry for S12 (node scripts/render-frames.mjs <Comp> <dir> <times>
// --entry=src/scenes/scene12/entry.tsx). The film entry bundles every scene module, so a neighbour's half-written file
// can stop S12 previews from bundling; this imports only S12 (and S01 / S11 for the seam checks), the data and the engine.
//   S12        = SceneOnly('S12'), identical to the film's per-scene composition (captions on)
//   S12nc      = S12 without captions (pixel diffs of the set)
//   S01nc      = S01 alone without captions (frame 0 = the loop's other side)
//   S11nc      = S11 alone without captions (its last frame = the cut into S12)
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {canvas} from '../../lib/theme';
import {Film, FilmScene} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';
import Scene12 from '../Scene12';
import Scene01 from '../Scene01';
import Scene11 from '../Scene11';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const components: Record<string, React.FC> = {S12: Scene12, S01: Scene01, S11: Scene11};
const sc = (id: string) => scenes.find((s) => s.id === id) as FilmScene;
const frames = (id: string) => Math.max(1, Math.ceil((sc(id).end - sc(id).start) * canvas.fps));

const only = (id: string, caps: CaptionBeat[]) => {
  const C: React.FC = () => <Film scenes={scenes} components={components} wipers={{}} captions={caps} only={id} offset={sc(id).start} />;
  return C;
};

const Root: React.FC = () => (
  <>
    <Composition id="S12" component={only('S12', captions)} durationInFrames={frames('S12')} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    <Composition id="S12nc" component={only('S12', [])} durationInFrames={frames('S12')} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    <Composition id="S01nc" component={only('S01', [])} durationInFrames={frames('S01')} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    <Composition id="S11nc" component={only('S11', [])} durationInFrames={frames('S11')} fps={canvas.fps} width={canvas.width} height={canvas.height} />
  </>
);

registerRoot(Root);
