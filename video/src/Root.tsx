import React from 'react';
import {AbsoluteFill, Audio, Composition, staticFile} from 'remotion';
import {canvas, palette} from './lib/theme';
import {devCompositions} from './dev/registry';

// Placeholder main. Replaced by the real timeline once the storyboard and engine land.
const Placeholder: React.FC = () => (
  <AbsoluteFill style={{background: palette.bg}}>
    <Audio src={staticFile('vo.mp3')} />
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Placeholder} durationInFrames={Math.ceil(70.69 * canvas.fps) + 15} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    {devCompositions.map((c) => (
      <Composition key={c.id} id={c.id} component={c.component} durationInFrames={Math.round(c.durationSeconds * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    ))}
  </>
);
