// V2S5_far_dev.tsx (lane L4, SKY & FAR): a DEV entry (not part of the film) to check the sky / far / river layers alone.
//   S5FarShot   the shot's 207 frames with only the far plane, the sky life and the river plane (scene time, crane p)
// GL=angle node scripts/render-frames.mjs S5FarShot <dir> 0,1.5,3.2 --entry=src/v2r/scenes/V2S5_far_dev.tsx --scale=0.5
import '../palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {World} from '../../lib/World';
import {CM} from '../palette';
import {S5Set} from './V2S5_set';

const FarShot: React.FC = () => (
  <World sky={CM.sky} stage="context">
    <S5Set only={['far', 'sky', 'river']} />
  </World>
);

const Root: React.FC = () => <Composition id="S5FarShot" component={FarShot} durationInFrames={207} fps={60} width={1080} height={1920} />;

registerRoot(Root);
