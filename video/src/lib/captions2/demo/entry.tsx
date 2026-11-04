// The captions2 test compositions (scripts/captions2/render_test.mjs bundles THIS entry only, so another lane's
// half-written file never breaks it), 60 fps, the file's length:
//   Captions2Test   the film's caption file over a still background. Props: {src: 'v4/captions2.json', bg: 'bg.png'
//                   (a public path; '' = the plain night sky), debug: false, tone?: 'dark' | 'light', mono?: boolean}
//   Captions2Cover  R10 the cover title over the background, and R7 the file's first world word on a plain paper tag
//                   (280 x 170 at (600, 857), the type still 09's spot), from its `at` to its `until`.
import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile} from 'remotion';
import {Captions2, CoverTitle, WorldWord} from '../Captions2';
import type {CaptionFile, SkyTone} from '../types';

type Props = {src: string; bg: string; debug: boolean; tone?: SkyTone; mono?: boolean; data?: CaptionFile | null};

const Test: React.FC<Props> = ({bg, debug, tone, mono, data}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#313A66 0%, #3A467C 31%, #555673 47%, #404566 65%)'}}>
    {bg ? <Img src={staticFile(bg)} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}} /> : null}
    <Captions2 data={data ?? null} debug={debug} tone={tone} mono={mono} />
  </AbsoluteFill>
);

const Cover: React.FC<Props> = ({bg, data}) => (
  <AbsoluteFill style={{background: '#313A66'}}>
    {bg ? <Img src={staticFile(bg)} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}} /> : null}
    {data?.world?.length ? (
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <g transform="rotate(3.5 600 786)">
          <rect x={460} y={772} width={280} height={170} rx={6} fill="#EDE0C8" />
          <WorldWord item={data.world[0]} cx={600} cy={857} />
        </g>
      </svg>
    ) : null}
    {data?.cover ? <CoverTitle cover={data.cover} /> : null}
  </AbsoluteFill>
);

const meta = async ({props}: {props: Record<string, unknown>}) => {
  const p = props as unknown as Props;
  const data: CaptionFile = await (await fetch(staticFile(p.src))).json();
  return {durationInFrames: Math.ceil(data.durationSec * 60), props: {...props, data} as unknown as Record<string, unknown>};
};

const Root: React.FC = () => (
  <>
  <Composition
    id="Captions2Cover"
    component={Cover as unknown as React.FC<Record<string, unknown>>}
    fps={60}
    width={1080}
    height={1920}
    durationInFrames={60}
    defaultProps={{src: 'v4/captions2.json', bg: '', debug: false, data: null} as unknown as Record<string, unknown>}
    calculateMetadata={meta}
  />
  <Composition
    id="Captions2Test"
    component={Test as unknown as React.FC<Record<string, unknown>>}
    fps={60}
    width={1080}
    height={1920}
    durationInFrames={60}
    defaultProps={{src: 'v4/captions2.json', bg: '', debug: false, data: null} as unknown as Record<string, unknown>}
    calculateMetadata={meta}
  />
  </>
);
registerRoot(Root);
