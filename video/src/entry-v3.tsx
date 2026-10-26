// Video 3 gate cuts, isolated from the v1 film and from other videos' work: RadioH1..H3 (G1 radio cut, one per hook
// variant) read public/v3/radio_h<N>.json; Core1..3 (G0.5 core-line cards) read public/v3/core_<N>.json; TakeH1..3 (G2 radio cut on the owner's take) read
// public/v3/take_h<N>.json (scripts/v3/build_take.py); Animatic (G3 sketch animatic) reads public/v3/animatic.json; StyleNook (G4 style frame, src/v3/StyleNook.tsx) takes a palette prop. Render: npx remotion render src/entry-v3.tsx RadioH1 out/v3_radio_h1.mp4
import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import {RadioCut, type RadioData} from './v3/RadioCut';
import {SketchReel, type Animatic} from './v3/SketchReel';
import {ShotSketch, type SketchData} from './v3/ShotSketch';
import {StyleNook} from './v3/StyleNook';

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
    <Composition
      id="Animatic"
      component={SketchReel as unknown as React.FC<Record<string, unknown>>}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={30}
      defaultProps={{data: null as unknown as Animatic}}
      calculateMetadata={async () => {
        const data: Animatic = await (await fetch(staticFile('v3/animatic.json'))).json();
        return {durationInFrames: Math.ceil(data.durationSec * FPS), props: {data}};
      }}
    />
    <Composition
      id="ShotSketch"
      component={ShotSketch as unknown as React.FC<Record<string, unknown>>}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={1}
      defaultProps={{data: null as unknown as SketchData}}
      calculateMetadata={async () => {
        const data: SketchData = await (await fetch(staticFile('look/cine_sketches.json'))).json();
        return {durationInFrames: data.sketches.length, props: {data}};
      }}
    />
    {/* G4 look check: frame 0 (the hook) as a style frame; props {palette: 'Mint & Clay 1.1' | 'Sage Study' | 'Autumn Ochre'} */}
    <Composition
      id="StyleNook"
      component={StyleNook as unknown as React.FC<Record<string, unknown>>}
      fps={60}
      width={1080}
      height={1920}
      durationInFrames={240}
      defaultProps={{palette: 'Mint & Clay 1.1', caption: true}}
    />
  </>
);

registerRoot(V3Root);
