// PLACEHOLDER (engine stream) — proves the framework; the scene agent for S01 replaces this file.
// "Government websites in four countries just switched themselves off."
import React from 'react';
import {Panel, Sun, PowerSymbol, BrowserWindow, Person, Ground, palette} from '../lib';

const Scene01: React.FC = () => (
  <>
    <Panel />
    <Ground y={1000} fillH={95} />
    <Sun pulse={[3.3]}>{(r) => <PowerSymbol r={r} at={3.3} />}</Sun>
    <BrowserWindow x={100} y={250} w={430} h={330} at={0.0} url="gov.fr" content="gov" offAt={2.5} seed="g1" />
    <BrowserWindow x={440} y={380} w={420} h={320} at={0.35} url="gov.de" content="blog" offAt={2.8} seed="g2" accent={palette.teal} />
    <BrowserWindow x={170} y={620} w={450} h={330} at={0.7} url="gov.it" content="gov" offAt={3.1} seed="g3" />
    <Person x={760} y={1095} s={1} at={1.4} build="rise" style="line" acc={['phone']} seed="s1p" />
  </>
);
export default Scene01;
