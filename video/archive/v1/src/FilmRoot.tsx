import React from 'react';
import {Composition} from 'remotion';
import {canvas} from './lib/theme';
import {Main, SceneOnly, mainDurationSeconds, scenes} from './Main';

/** The film's compositions only: Main (full timeline) + one per scene id ("S01", ...). No dev previews, so a dev file
 *  that is mid-edit in another lane can never break a film render (src/entry-film.ts; scripts/render-frames.mjs). */
export const FilmRoot: React.FC = () => (
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
  </>
);
