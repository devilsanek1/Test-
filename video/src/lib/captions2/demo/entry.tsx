// The captions2 test composition (scripts/captions2/render_test.mjs bundles THIS entry only, so another lane's
// half-written file never breaks it): the film's caption file over a still background, 60 fps, the file's length.
//   Captions2Test  props: {src: 'v4/captions2.json', bg: 'bg_night.png' (a public path; '' = the plain night sky),
//                          debug: false, tone?: 'dark' | 'light', mono?: boolean}
import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile} from 'remotion';
import {Captions2} from '../Captions2';
import type {CaptionFile, SkyTone} from '../types';

type Props = {src: string; bg: string; debug: boolean; tone?: SkyTone; mono?: boolean; data?: CaptionFile | null};

const Test: React.FC<Props> = ({bg, debug, tone, mono, data}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#313A66 0%, #3A467C 31%, #555673 47%, #404566 65%)'}}>
    {bg ? <Img src={staticFile(bg)} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}} /> : null}
    <Captions2 data={data ?? null} debug={debug} tone={tone} mono={mono} />
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <Composition
    id="Captions2Test"
    component={Test as unknown as React.FC<Record<string, unknown>>}
    fps={60}
    width={1080}
    height={1920}
    durationInFrames={60}
    defaultProps={{src: 'v4/captions2.json', bg: '', debug: false, data: null} as unknown as Record<string, unknown>}
    calculateMetadata={async ({props}) => {
      const p = props as unknown as Props;
      const data: CaptionFile = await (await fetch(staticFile(p.src))).json();
      return {durationInFrames: Math.ceil(data.durationSec * 60), props: {...props, data} as unknown as Record<string, unknown>};
    }}
  />
);
registerRoot(Root);
