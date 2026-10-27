// G3Demo: a ~10 s demo of the ANIMATED SKETCHBOOK G3 style (docs/G3_ANIMATIC.md) for the owner — not a video gate.
// Data: public/g3demo/animatic.json. Render: npx remotion render src/entry-g3demo.tsx G3Demo out/g3demo.mp4 --scale=0.5
// 60 fps per the new spec (motion smoothness is judged at the film's real rate).
import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import {SketchReel, type Animatic} from './v3/SketchReel';

const FPS = 60;
const comp = (id: string, file: string) => (
  <Composition
    key={id}
    id={id}
    component={SketchReel as unknown as React.FC<Record<string, unknown>>}
    fps={FPS}
    width={1080}
    height={1920}
    durationInFrames={60}
    defaultProps={{data: null as unknown as Animatic}}
    calculateMetadata={async () => {
      const data: Animatic = await (await fetch(staticFile(file))).json();
      return {durationInFrames: Math.ceil(data.durationSec * FPS), props: {data}};
    }}
  />
);
const DemoRoot: React.FC = () => (
  <>
    {comp('G3Show', 'g3demo/showcase.json')}
    {legacy()}
  </>
);
const legacy = () => (
  <Composition
    id="G3Demo"
    component={SketchReel as unknown as React.FC<Record<string, unknown>>}
    fps={FPS}
    width={1080}
    height={1920}
    durationInFrames={60}
    defaultProps={{data: null as unknown as Animatic}}
    calculateMetadata={async () => {
      const data: Animatic = await (await fetch(staticFile('g3demo/animatic.json'))).json();
      return {durationInFrames: Math.ceil(data.durationSec * FPS), props: {data}};
    }}
  />
);
registerRoot(DemoRoot);
