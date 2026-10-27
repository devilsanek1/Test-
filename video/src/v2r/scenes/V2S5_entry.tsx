// V2S5_entry.tsx (lane L4): a DEV entry for the crane's builders (not part of the film; the film is
// src/entry-v2r-film.tsx). Palette first. Compositions (1080 x 1920, 60 fps):
//   S5Shot   the shot alone in scene time (207 f), no captions, no voice (= Film2RBare's S5 slice)
//   S5At     props {p, t, only}: ONE still of the set at crane progress p (life at scene time t); `only` = layer groups
//            (V2S5_set.tsx S5Layer: start far sky river mid nearmid deck figs text frames wipe near), e.g. ["far","river"]
// GL=angle node scripts/render-frames.mjs S5At <dir> 0 --entry=src/v2r/scenes/V2S5_entry.tsx --scale=0.5 \
//   --props='{"p":1,"t":3.2,"only":["deck","figs","text"]}'
import '../palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {World} from '../../lib/World';
import {TimeProvider} from '../../lib/time';
import {CM} from '../palette';
import {S5Set, type S5Layer} from './V2S5_set';

const Shot: React.FC = () => (
  <World sky={CM.sky} stage="context">
    <S5Set />
  </World>
);

type AtProps = {p: number; t: number; only?: S5Layer[]};
const At: React.FC<AtProps> = ({p, t, only}) => (
  <TimeProvider global={t}>
    <World sky={CM.sky} stage="context">
      <S5Set p={p} only={only} />
    </World>
  </TimeProvider>
);

const Root: React.FC = () => (
  <>
    <Composition id="S5Shot" component={Shot} durationInFrames={207} fps={60} width={1080} height={1920} />
    <Composition id="S5At" component={At} defaultProps={{p: 1, t: 3.2} as AtProps} durationInFrames={1} fps={60} width={1080} height={1920} />
  </>
);

registerRoot(Root);
