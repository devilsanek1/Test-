import React from 'react';
import {Stage} from '../lib/timeline';
import {Panel} from '../lib/Card';
import {Sun} from '../lib/Sun';
import {palette} from '../lib/theme';
import {useTime} from '../lib/time';
import {Person, Crowd, Building, Wall, Ground, Tree, Bike, BirdsOnWire, LampPost, BrowserWindow, Padlock, Noticeboard, Paper, Door} from '../lib/kit';

const GalleryA: React.FC = () => (
  <>
    <Panel />
    <Wall x={70} y={210} w={820} h={760} color={palette.cream} ground={110} />
    <Sun cy={150} horizon={216} />
    <Noticeboard x={150} y={380} w={400} h={300} legs={180}>
      <Paper x={340} y={410} w={150} h={190} seed="pA" stamp />
    </Noticeboard>
    <Paper x={140} y={620} w={150} h={190} rot={-9} seed="pB" pin={false} />
    <Door x={680} y={400} w={190} h={460} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <Person key={i} x={150 + i * 112} y={1170} s={0.95} seed={`ga${i}`} style="line" acc={i === 4 ? ['phone', 'strap'] : i === 2 ? ['headphones', 'collar'] : undefined} hair={i === 3 ? 'long' : i === 5 ? 'beanie' : undefined} />
    ))}
  </>
);

const GalleryB: React.FC = () => (
  <>
    <Panel />
    <Sun />
    <Ground y={900} fillH={195} />
    <Building x={70} y={900} w={300} floors={5} floorH={118} seed="b1" balconies={[2, 4]} shop={{sign: 'cart'}} roof="cornice" />
    <Building x={370} y={900} w={200} floors={6} floorH={100} seed="b2" color={palette.tan} roof="mansard" win="tall" door={1} />
    <Building x={570} y={900} w={170} floors={4} floorH={105} seed="b3" color={palette.mintPale} roof="flat" win="grid" shop={{sign: 'cross', awning: palette.salmon}} />
    <Tree x={800} y={900} size={70} seed="t1" />
    <LampPost x={750} y={905} h={300} seed="lp" lightAt={0} />
    <BirdsOnWire x1={40} y1={230} x2={920} y2={250} sag={22} n={3} seed="bw" />
    <Bike x={190} y={1000} seed="bk" basket />
    <Crowd far={{y: 960, x0: 330, x1: 640, s: 0.3}} near={{y: 1110, x0: 280, x1: 900, s: 0.62}} rows={5} seed="cr" signs={0.1} />
    <BrowserWindow x={560} y={380} w={300} h={260} url="gov.example" content="gov" />
    <Padlock x={180} y={1200} size={90} />
  </>
);

const Gallery: React.FC = () => {
  const t = useTime();
  return t < 6 ? <GalleryA /> : <GalleryB />;
};

export const KitDemo: React.FC = () => (
  <Stage
    captions={[
      {s: 0.0, lines: [{text: 'But normally they march', s: 0}, {text: 'against one law,', s: 0}], highlights: [{text: 'one law', s: 0}]},
      {s: 6.0, lines: [{text: 'Half a million came.', s: 6}], highlights: [{text: 'Half a million', s: 6}]},
    ]}
  >
    <Gallery />
  </Stage>
);
