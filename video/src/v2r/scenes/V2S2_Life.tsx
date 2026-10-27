// V2S2_Life (lane L2): the shot's own life on top of the set's (TREATMENT §5 S2 "always": walkers on both towpaths, a
// jogger, a boat, window switches, pigeons, urn steam; the bottom third's head-backs and dog). FILM seconds.
//   S2FarLife   the far towpath, behind our railing: a cyclist and a walker with a dog (the set has two walkers + a jogger)
//   S2NearLife  our towpath, nearest: a passer-by's head-back gliding left -> right along the bottom edge, a second one
//               standing (head turns), a dog on a lead nosing a leaf, two pigeons pecking. People small (owner rule:
//               near head-backs <= ~140 px wide); nothing crosses the A-board's lettering or the story windows.
import React from 'react';
import {CM} from '../palette';
import {useTime, clamp, ease} from '../../lib/time';
import {Movers, Pigeons} from '../kit/canal/life';
import {CastSlot} from '../kit/canal/slots';
import {s2x, s2y, s2g, s2u} from '../kit/canal/wall';
import {NearBack} from '../kit/cast';

/** A point on the far towpath (the wing's base + 12 g) at screen x. */
const farPath = (x: number): [number, number] => {
  const u = s2u(x);
  return [x, s2y('base', u) + 12 * s2g(u)];
};

export const S2FarLife: React.FC = () => (
  <Movers
    idPrefix="s2farX"
    movers={[
      {pose: 'cycle', from: farPath(1100), to: farPath(560), h: [36, 104], speed: 120, phase: 0.1, pause: 2.2, seed: 's2cyc', acc: 'backpack'},
      {pose: 'walk', from: farPath(600), to: farPath(1100), h: [104, 36], speed: 24, phase: 0.35, seed: 's2fw3', acc: 'dogLead'},
    ]}
  />
);

export const S2NearLife: React.FC = () => {
  const t = useTime();
  // passer-by A glides left -> right along the bottom (a slow stroll, a small bob): x 240 -> 760 over the shot
  const ax = 230 + 75 * (t - 6.1);
  const bob = Math.abs(Math.sin((t - 6.1) * Math.PI * 1.7)) * 6;
  // passer-by B stands (waiting), the head turns toward the water at 7.6 and back at 11.2
  const turnB = 0.5 * ease.inOutCubic(clamp((t - 7.6) / 0.3)) - 0.5 * ease.inOutCubic(clamp((t - 11.2) / 0.3));
  // the dog: noses along a leaf 6.1-9.0, sits 9.0-10.4, trots on 10.4 -> off right
  const dogX = t < 10.4 ? 600 - 8 * (t - 6.1) : 566 + 90 * (t - 10.4);
  return (
    <>
      <Pigeons ledge={[300, 470, 1520]} n={2} size={26} seed="s2pave" />
      <CastSlot s={{id: 'dog', x: dogX, y: 1450, h: 66, pose: 'dog', seed: 's2dog', dir: t < 10.4 ? -1 : 1, gait: t < 9.0 || t >= 10.4 ? t : 9.0}} />
      <NearBack x={ax} y={1920 + bob} hv={196} seed="s2passA" traits={{hair: 'beanie', hatColor: CM.coatMustard, coat: CM.brick}} />
      <NearBack x={800} y={1920} hv={210} seed="s2passB" turn={turnB} traits={{hair: 'cap', hatColor: CM.coatSlate, coat: CM.coatOat}} />
    </>
  );
};
