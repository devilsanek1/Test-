import React from 'react';
import {Composition} from 'remotion';
import {canvas} from './lib/theme';
import {devCompositions} from './dev/registry';
import {FilmRoot} from './FilmRoot';

// Main (full timeline) + one composition per scene id ("S01", ...) + dev previews from src/dev/registry.ts.
// Isolated entries (scripts/render-frames.mjs picks them automatically): src/entry-film.ts = the film only; each dev
// composition gets a generated entry that imports just its own file.
export const Root: React.FC = () => (
  <>
    <FilmRoot />
    {devCompositions.map((c) => (
      <Composition key={c.id} id={c.id} component={c.component} durationInFrames={Math.round(c.durationSeconds * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    ))}
  </>
);
