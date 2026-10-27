// V2S5_deck_dev.tsx (lane L4, TERRACE): a DEV entry for the deck builder (not part of the film; the film is
// src/entry-v2r-film.tsx). Palette first. ONE bundle renders many stills of the set: the composition runs at 1 fps and
// frame i shows props.shots[i] = {p, t, only} (crane progress p, scene time t for the life, layer groups `only`).
//   GL=angle node scripts/render-frames.mjs DeckShots <dir> 0,1,2 --entry=src/v2r/scenes/V2S5_deck_dev.tsx --scale=0.5 \
//     --props='{"shots":[{"p":1,"t":3.2},{"p":0,"t":0.4},{"p":1,"t":3.2,"only":["deck","frames","figs","text"]}]}'
import '../palette';
import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {World} from '../../lib/World';
import {TimeProvider} from '../../lib/time';
import {CM} from '../palette';
import {S5Set, type S5Layer} from './V2S5_set';

type Shot = {p: number; t: number; only?: S5Layer[]};
type ShotsProps = {shots: Shot[]};

const Shots: React.FC<ShotsProps> = ({shots}) => {
  const f = useCurrentFrame();
  const s = shots[Math.max(0, Math.min(shots.length - 1, f))] ?? {p: 1, t: 3.2};
  return (
    <TimeProvider global={s.t}>
      <World sky={CM.sky} stage="context">
        <S5Set p={s.p} only={s.only} />
      </World>
    </TimeProvider>
  );
};

const Root: React.FC = () => (
  <Composition id="DeckShots" component={Shots} defaultProps={{shots: [{p: 1, t: 3.2}]} as ShotsProps} durationInFrames={200} fps={1} width={1080} height={1920} />
);

registerRoot(Root);
