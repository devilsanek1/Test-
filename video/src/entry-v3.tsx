// Video 3 gate cuts, isolated from the v1 film and from other videos' work: RadioH1..H3 (G1 radio cut, one per hook
// variant) read public/v3/radio_h<N>.json; Core1..3 (G0.5 core-line cards) read public/v3/core_<N>.json; TakeH1..3 (G2 radio cut on the owner's take) read
// public/v3/take_h<N>.json (scripts/v3/build_take.py). Render: npx remotion render src/entry-v3.tsx RadioH1 out/v3_radio_h1.mp4
import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import {RadioCut, type RadioData} from './v3/RadioCut';

const FPS = 30;
const V3Root: React.FC = () => (
  <>
    {[1, 2, 3].flatMap((n) => [[`RadioH${n}`, `radio_h${n}`], [`Core${n}`, `core_${n}`], [`TakeH${n}`, `take_h${n}`]]).map(([id, file]) =>
      React.createElement(Composition, {
        key: id,
        id,
        component: RadioCut as unknown as React.FC<Record<string, unknown>>,
        fps: FPS,
        width: 1080,
        height: 1920,
        durationInFrames: 30,
        defaultProps: {data: null as unknown as RadioData},
        calculateMetadata: async () => {
          const data: RadioData = await (await fetch(staticFile(`v3/${file}.json`))).json();
          return {durationInFrames: Math.ceil(data.durationSec * FPS), props: {data}};
        },
      }),
    )}
  </>
);

registerRoot(V3Root);
