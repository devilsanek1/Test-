// Frame-rate test (owner, 2026-10-26): the same 6 s scale move (CineDemo shot A, the tower tilt-down) at 30 and 60 fps.
// Render: npx remotion render src/dev/entry-fpstest.tsx Fps60 out/fps60.mp4
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {CineDemo} from './CineDemo';

const Root: React.FC = () => (
  <>
    {[30, 60].map((fps) => (
      <Composition key={fps} id={`Fps${fps}`} component={CineDemo} fps={fps} width={1080} height={1920} durationInFrames={6 * fps} />
    ))}
  </>
);
registerRoot(Root);
