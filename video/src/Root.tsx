import React from 'react';
import {Composition} from 'remotion';
import {canvas} from './lib/theme';
import {devCompositions} from './dev/registry';
import {Main, SceneOnly, mainDurationSeconds, scenes} from './Main';

// Main (full timeline) + one composition per scene id ("S01", ...) + dev previews from src/dev/registry.ts.
export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={Math.ceil(mainDurationSeconds * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    {scenes.map((s) => (
      <Composition
        key={s.id}
        id={s.id}
        component={SceneOnly}
        defaultProps={{id: s.id}}
        durationInFrames={Math.max(1, Math.ceil((s.end - s.start) * canvas.fps))}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
      />
    ))}
    {devCompositions.map((c) => (
      <Composition key={c.id} id={c.id} component={c.component} durationInFrames={Math.round(c.durationSeconds * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    ))}
  </>
);
