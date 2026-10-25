// Video 3 gate cuts, isolated from the v1 film and from other videos' work: RadioH1..H3 (G1 radio cut, one per hook
// variant) read public/v3/radio_h<N>.json. Render: npx remotion render src/entry-v3.tsx RadioH1 out/v3_radio_h1.mp4
import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import {RadioCut, type RadioData} from './v3/RadioCut';

const FPS = 30;
const V3Root: React.FC = () => (
  <>
    {[1, 2, 3].map((n) =>
      React.createElement(Composition, {
        key: n,
        id: `RadioH${n}`,
        component: RadioCut as unknown as React.FC<Record<string, unknown>>,
        fps: FPS,
        width: 1080,
        height: 1920,
        durationInFrames: 30,
        defaultProps: {data: null as unknown as RadioData},
        calculateMetadata: async () => {
          const data: RadioData = await (await fetch(staticFile(`v3/radio_h${n}.json`))).json();
          return {durationInFrames: Math.ceil(data.durationSec * FPS), props: {data}};
        },
      }),
    )}
  </>
);

registerRoot(V3Root);
