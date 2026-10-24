// KitDemo — 12 s showcase of the engine + kit (engine stream). A street corner builds up in the reference's
// ink-sketch style: facades, a noticeboard, a bike, birds on a wire, a lamp, a tree, a crowd filling in,
// line-art people drawing on, a website that locks and switches off, captions with highlights, and a
// final un-build. Preview: scripts/sheet.sh KitDemo 0 12 24 out.png
import React from 'react';
import {Stage} from '../lib/timeline';
import {Panel} from '../lib/Card';
import {Sun} from '../lib/Sun';
import {palette} from '../lib/theme';
import {CaptionBeat} from '../lib/Captions';
import {Person, Crowd, Building, Ground, Tree, Bike, BirdsOnWire, LampPost, BrowserWindow, Padlock, Noticeboard, Paper} from '../lib/kit';

const captions: CaptionBeat[] = [
  {s: 0.25, lines: [{text: 'A street corner,', s: 0.25}, {text: 'drawn in ink.', s: 1.3}], highlights: [{text: 'ink', s: 1.75}]},
  {s: 3.0, lines: [{text: 'People gather,', s: 3.0}, {text: 'the crowd fills in.', s: 4.1}], highlights: [{text: 'crowd', s: 4.4}]},
  {s: 6.2, lines: [{text: 'The site locks up', s: 6.2}, {text: 'and switches off.', s: 7.4}], highlights: [{text: 'off.', s: 8.0}]},
  {s: 9.3, lines: [{text: 'Then everything', s: 9.3}, {text: 'un-builds.', s: 10.1}], highlights: [{text: 'un-builds.', s: 10.3}]},
];

export const KitDemo: React.FC = () => (
  <Stage captions={captions} unbuild={{at: 10.45, dur: 1.45}}>
    <Panel />
    <Sun at={0.05} breathe pulse={[8.05]} />
    <Ground y={880} fillH={215} at={0.1} lines={2} />
    <BirdsOnWire x1={60} y1={262} x2={900} y2={236} sag={16} us={[0.07, 0.11, 0.15]} at={1.5} flyAt={9.0} seed="kd-birds" />
    <Building x={70} y={880} w={290} floors={5} floorH={118} at={0.2} seed="kd-a" balconies={[2, 4]} shop={{sign: 'cart'}} roof="cornice" />
    <Building x={360} y={880} w={190} floors={6} floorH={100} at={0.6} seed="kd-b" color={palette.tan} roof="mansard" door={1} />
    <Building x={550} y={880} w={200} floors={4} floorH={110} at={1.0} seed="kd-c" color={palette.mintPale} roof="flat" win="grid" shop={{sign: 'cross', awning: palette.salmon}} />
    <LampPost x={566} y={884} h={300} at={1.6} lightAt={6.8} seed="kd-lamp" />
    <Tree x={822} y={882} size={62} at={2.0} seed="kd-tree" />
    <Noticeboard x={104} y={652} w={250} h={168} legs={60} at={2.2} seed="kd-board">
      <Paper x={124} y={672} w={92} h={124} at={4.6} entry="drop" seed="kd-paper" stamp={{at: 6.0}} />
    </Noticeboard>
    <Bike x={452} y={936} s={0.78} at={2.6} seed="kd-bike" basket />
    <BrowserWindow x={578} y={150} w={306} h={246} at={2.8} url="city.gov" content="gov" offAt={8.0} seed="kd-web" />
    <Padlock x={731} y={318} size={84} at={5.0} lockAt={5.65} seed="kd-lock" />
    <Crowd far={{y: 912, x0: 330, x1: 760, s: 0.27}} near={{y: 1010, x0: 250, x1: 880, s: 0.5}} rows={4} at={3.9} span={2.4} order="back" signs={0.12} seed="kd-crowd" />
    {[
      {x: 214, hair: 'bun', acc: ['backpack']},
      {x: 330, hair: 'short', acc: ['headphones', 'collar']},
      {x: 446, hair: 'long', acc: []},
      {x: 562, hair: 'cap', acc: ['phone', 'strap']},
    ].map((p, i) => (
      <Person key={i} x={p.x} y={1112} s={0.92} at={3.2 + i * 0.28} style="line" seed={`kd-p${i}`} hair={p.hair as 'bun'} acc={p.acc as never} />
    ))}
  </Stage>
);
