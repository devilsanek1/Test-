// Video 2 gate cuts, isolated from the other videos' work. Animatic (G3 sketch animatic) reads public/v2/animatic.json
// and draws it with the shared SketchReel (src/v3/SketchReel.tsx). Voice: public/v2/voice.wav (the owner's take 2, 0.12 s
// lead), word timings public/v2/voice_words.json. Render: npx remotion render src/entry-v2.tsx Animatic out/v2_g3_animatic.mp4
// StyleDesk (G4 look check, src/v2/StyleDesk.tsx): frame 0 / O1 as a style frame; props {palette: 'A' | 'B' | 'C', caption}.
// StylePentagon (G4 look check, src/v2/StylePentagon.tsx): P8 (the scale moment); props {palette: '6 Dusk' | '3 Cream & Cobalt',
// caption}; landing frame 140: npx remotion still src/entry-v2.tsx StylePentagon out.png --frame=140 --props='{"palette":"6 Dusk"}'
import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import {SketchReel, type Animatic} from './v3/SketchReel';
import {StyleDesk} from './v2/StyleDesk';
import {StylePentagon} from './v2/StylePentagon';

const FPS = 30;
const V2Root: React.FC = () => (
  <>
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
    {/* G4 look check: O1 (frame 0, the desk insert) as a style frame, 60 fps, 6 s idle (pull-out, steam, clouds) */}
    <Composition
      id="StyleDesk"
      component={StyleDesk as unknown as React.FC<Record<string, unknown>>}
      fps={60}
      width={1080}
      height={1920}
      durationInFrames={360}
      defaultProps={{palette: 'A', caption: true}}
    />
    {/* G4 look check: P8 (the scale moment, the rise over the wall) as a style frame, 60 fps; the rise lands at 2.08 s
        (frame 125), the panel is 2.48 s */}
    <Composition
      id="StylePentagon"
      component={StylePentagon as unknown as React.FC<Record<string, unknown>>}
      fps={60}
      width={1080}
      height={1920}
      durationInFrames={149}
      defaultProps={{palette: '6 Dusk', caption: true}}
    />
  </>
);

registerRoot(V2Root);
