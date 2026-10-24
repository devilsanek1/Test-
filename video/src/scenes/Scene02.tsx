// PLACEHOLDER (core lane) — proves camera-continuous in and a scene-provided Wiper; the S02 agent replaces this file.
import React from 'react';
import {World, Sun, Fill, Ink, Bug, hline, palette, skies, world, stroke, PoleWiper, WiperProps} from '../lib';

const Scene02: React.FC = () => (
  <World sky={skies.day}>
    <Sun cx={540} cy={800} horizon={world.horizon} beats={[1.5, 3.4]} drift={[10, 0]} />
    <Fill rect={[-200, world.horizon, 1480, 1300]} color={palette.sand} offset={false} />
    <Ink d={hline(-60, 1140, world.horizon, {seed: 's2h'})} width={stroke.ink} />
    <Bug x={540} y={1200} size={160} at={0.8} crawl seed="s2bug" />
  </World>
);
export default Scene02;

/** Example: this scene's own foreground element for a {type: 'foreground-wipe', element: 'scene'} out of S02. */
export const Wiper: React.FC<WiperProps> = (p) => <PoleWiper {...p} color={palette.teal} />;
