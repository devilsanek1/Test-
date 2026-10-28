// V2S5_particles.tsx (lane L4): the shot's PARTICLES (lib/particles; CRAFT §f.6; conform_L4 §10; the owner on v4: they
// must be SEEN at phone size). One exported list of fields, each drawn in its plane's camera group (they ride the crane
// like the world they live in); S5Particles draws them inside the set's <Lit>, the lint reads the same list.
//   petals (start)  the slot's burst on "April" (0.21) lets go of two petals: 28-36 px blossom almonds, born in the
//                   foot of the left mass at 0.30 / 0.70 (after the push-through's 0.2 s), fluttering and turning on
//                   a light westerly down across the lawn band (pink on green: seen) onto the balustrade's top rail,
//                   clear of the news box (the subject), the pair and the caption band; plane 0 (the deck's start map).
//   petals (end)    two petals from the terrace tree (the left frame) in the landing hold, born 2.30 / 2.62 (film
//                   22.85 / 23.17: no entrance near the wipe 23.60-24.00), falling out of its lower crown past its
//                   trunk onto the paving (pink on the tree's mauve: seen), clear of the Pentagon, the plaque and the
//                   pair; plane 0 (the deck's end map).
//   (no glints: the Potomac under the end sun is a 23 px band 50 px under the horizon; its glitter path flattens a
//   28-36 px sparkle to a speck, unseen at phone size: tried 2026-10-28 and dropped)
// The old near-lens petals (NearPetals5: 14 petals of 4.5-9 px) are retired: too small to see on a phone, too many.
import React from 'react';
import {CAPTION_BAND, Particles, type ParticlesProps} from '../../lib/particles';
import {PullLayer} from '../../lib/pullback';
import {CM} from '../palette';
import {mix} from '../kit/dc/core';
import {planeMat, startMat, PLANES} from './V2S5_rig';
import {BLOOM_S5, MT5} from './V2S5_valley';
import {FAR_END} from './V2S5_far';
import {S5} from '../world/map';

/** Scene-local joins: the push-through in (film 20.55) and the foreground wipe out (film 23.80). */
export const S5_JOINS = [0, 23.8 - 20.55];

type Rect = [number, number, number, number];
const nb = S5.start.newsBox;
/** START coords: the news box (the subject 20.90-21.75) and the pair on the bench (heads included). */
const START_NEWS: Rect = [nb.x0 - 12, nb.y0 - 12, nb.x1 - nb.x0 + 24, nb.y1 - nb.y0 + 24];
const START_PAIR: Rect = [210, 980, 270, 260];
/** END coords: the Pentagon's box, the plaque, the pair at the balustrade. */
const END_PENT: Rect = [322, 846, 758, 258];
const END_PLAQUE: Rect = [436, 1110, 340, 142];
const END_PAIR: Rect = [286, 1150, 110, 100];

const PETALS = [CM.blossom, mix(CM.blossom, CM.paper, 0.35), mix(CM.blossom, CM.shadeWarm, 0.18)];

/** The fields and the camera group each is drawn in ('deckStart': the deck's start map, START coords; 'deck': the
 *  deck's map, END coords). */
export const S5_PARTICLE_FIELDS: {group: 'deckStart' | 'deck'; f: ParticlesProps}[] = [
  {
    group: 'deckStart',
    f: {
      kind: 'leaves',
      seed: 's5petalsStart',
      region: {rect: [10, 950, 150, 34]},
      on: MT5.lawn,
      colors: PETALS,
      leaf: 'almond',
      births: [0.3, 0.7],
      size: [30, 36],
      speed: [55, 75],
      drift: [30, 0],
      floor: 1085,
      margin: 12,
      t0: 0.25,
      t1: 1.2,
      joins: S5_JOINS,
      avoid: [CAPTION_BAND, START_NEWS, START_PAIR],
      sun: [250, 650],
    },
  },
  {
    group: 'deck',
    f: {
      kind: 'leaves',
      seed: 's5petalsEnd',
      region: {rect: [40, 1080, 140, 60]},
      on: mix(CM.shadeWarm, CM.blossom, 0.2),
      colors: PETALS,
      leaf: 'almond',
      births: [2.3, 2.62],
      size: [30, 36],
      speed: [40, 55],
      drift: [18, 0],
      floor: 1640,
      margin: 12,
      t0: 2.25,
      t1: 2.75,
      joins: S5_JOINS,
      avoid: [CAPTION_BAND, END_PENT, END_PLAQUE, END_PAIR],
      sun: [FAR_END.sun.x, FAR_END.sun.y],
    },
  },
];

export const S5Particles: React.FC<{p: number}> = ({p}) => {
  const m = {deckStart: startMat(PLANES.deck, p), deck: planeMat(PLANES.deck, p)};
  return (
    <>
      {S5_PARTICLE_FIELDS.map(({group, f}) => (
        <PullLayer key={f.seed} m={m[group]}>
          <Particles {...f} />
        </PullLayer>
      ))}
    </>
  );
};
