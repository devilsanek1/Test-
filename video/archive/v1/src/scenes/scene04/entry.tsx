// Isolated preview entry for S04 (dev only, never imported by the film): the S04 composition exactly as FilmRoot builds
// it (Film, only='S04', its captions and soundtrack offset) but bundling ONLY Scene04, so a sibling scene that is mid-edit
// cannot break S04 previews.
//   node scripts/render-frames.mjs S04 <outDir> 1.0,2.0 --scale=0.5 --entry=src/scenes/scene04/entry.tsx
// The neighbours' boundary frames: S03 / S05 compositions from the same bundle (S03's last frame, S05's first).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film, FilmScene} from '../../lib/Film';
import {CaptionBeat} from '../../lib/Captions';
import {canvas} from '../../lib/theme';
import Scene03 from '../Scene03';
import Scene04 from '../Scene04';
import Scene05 from '../Scene05';
import scenesJson from '../../data/scenes.json';
import captionsJson from '../../data/captions.json';

const scenes = scenesJson as FilmScene[];
const captions = captionsJson as CaptionBeat[];
const comps = {S03: Scene03, S04: Scene04, S05: Scene05};

const solo = (id: 'S03' | 'S04' | 'S05') => {
  const s = scenes.find((x) => x.id === id)!;
  const C: React.FC = () => <Film scenes={scenes} components={{[id]: comps[id]}} wipers={{}} captions={captions} only={id} offset={s.start} />;
  return {s, C};
};

/** S03 -> S04 -> S05 as the film plays them (the two cuts), offset to S03's start. */
const Seam: React.FC = () => {
  const s = scenes.find((x) => x.id === 'S03')!;
  return <Film scenes={scenes} components={comps} wipers={{}} captions={captions} offset={s.start} />;
};

const Root: React.FC = () => {
  const items = (['S03', 'S04', 'S05'] as const).map((id) => {
    const {s, C} = solo(id);
    return <Composition key={id} id={id} component={C} durationInFrames={Math.max(1, Math.ceil((s.end - s.start) * canvas.fps))} fps={canvas.fps} width={canvas.width} height={canvas.height} />;
  });
  const s3 = scenes.find((x) => x.id === 'S03')!;
  const s5 = scenes.find((x) => x.id === 'S05')!;
  return (
    <>
      {items}
      <Composition id="S04seam" component={Seam} durationInFrames={Math.ceil((s5.end - s3.start) * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
    </>
  );
};

registerRoot(Root);
