// PLACEHOLDER (core lane) — proves the v2 full-bleed framework; the scene agent for S01 replaces this file.
// "Government websites in four countries just switched themselves off. Nobody hacked them."
import React from 'react';
import {World, Sun, Fill, Ink, Plane, wallQuad, Building, BrowserWindow, hline, palette, skies, world, stroke} from '../lib';

const VP: [number, number] = [540, world.horizon];

const Scene01: React.FC = () => (
  <World sky={skies.day}>
    <Sun rise={{at: 0, from: [540, 1000]}} cx={540} cy={820} horizon={world.horizon} beats={[1.33, 2.28]} drift={[8, 0]} />
    <Fill rect={[-200, world.horizon, 1480, 1300]} color={palette.mintPale} offset={false} />
    <Ink d={hline(-60, 1140, world.horizon, {seed: 's1h'})} width={stroke.ink} at={0.05} />
    <Plane quad={wallQuad({vp: VP, x: -40, top: 360, bottom: 1500, depth: 0.62})} w={1500} h={1140}>
      <Building x={0} y={1140} w={520} floors={4} floorH={260} at={0.1} seed="s1a" color={palette.cream} roof="cornice" />
      <Building x={560} y={1140} w={460} floors={5} floorH={210} at={0.4} seed="s1b" color={palette.tan} roof="flat" />
    </Plane>
    <BrowserWindow x={600} y={980} w={380} h={300} at={0.6} url="gov.example" content="gov" offAt={2.5} seed="s1w" />
  </World>
);
export default Scene01;
