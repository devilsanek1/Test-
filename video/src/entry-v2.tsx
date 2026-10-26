// Video 2 gate cuts, isolated from the other videos' work. Animatic (G3 sketch animatic) reads public/v2/animatic.json
// and draws it with the shared SketchReel (src/v3/SketchReel.tsx). Voice: public/v2/voice.wav (the owner's take 2, 0.12 s
// lead), word timings public/v2/voice_words.json. Render: npx remotion render src/entry-v2.tsx Animatic out/v2_g3_animatic.mp4
import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import {SketchReel, type Animatic} from './v3/SketchReel';

const FPS = 30;
const V2Root: React.FC = () => (
  <Composition
    id="Animatic"
    component={SketchReel as unknown as React.FC<Record<string, unknown>>}
    fps={FPS}
    width={1080}
    height={1920}
    durationInFrames={30}
    defaultProps={{data: null as unknown as Animatic}}
    calculateMetadata={async () => {
      const data: Animatic = await (await fetch(staticFile('v2/animatic.json'))).json();
      return {durationInFrames: Math.ceil(data.durationSec * FPS), props: {data}};
    }}
  />
);

registerRoot(V2Root);
