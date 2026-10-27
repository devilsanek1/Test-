// V2S1 helper (lane L1): OUR BANK, the bottom third y 1215-1920 (TREATMENT section 5 "the bottom third", S1): the
// coping, the landing and five broad stone steps rising toward us, the seated public (backs, small and simple like
// reference 1, near head-backs <= ~140 px wide), their things and their life. Pip's bollard and Pip are the `pip`
// slot's (drawn on top at (700, 1235)): x 620-780, y 1120-1302 stays clear of people and props.
//
// Drawn back to front, the stone of each tread INTERLEAVED with what sits on it, so a nearer step's edge runs in front
// of whoever sits at the back of the lower tread, and every row overlaps the one behind it (reference 1's crowds):
//   coping -> landing stone -> the low row by the water -> tread 1 stone -> tread 1 ... -> tread 5 stone -> the
//   bike -> the near head-backs -> the flyers.
// Parts: V2S1_steps_stone (the stone), V2S1_public (the people, their things, the life), V2S1_steps_figs (the
// figures: hands-free seated backs, stand-up / sit-down / walk, dogs, pigeons, cast shadows), V2S1_steps_props.
import React from 'react';
import {Coping, StoneBand} from './V2S1_steps_stone';
import {BankRow, NearBike, NearRow, BankAir} from './V2S1_public';

/** Our bank: the `seated` slot (drawn after the water and the boats, before Pip). */
export const S1Steps: React.FC = () => (
  <>
    <Coping />
    <StoneBand k={0} />
    <BankRow band={0} />
    <StoneBand k={1} />
    <BankRow band={1} />
    <StoneBand k={2} />
    <BankRow band={2} />
    <StoneBand k={3} />
    <BankRow band={3} />
    <StoneBand k={4} />
    <BankRow band={4} />
    <StoneBand k={5} />
    <NearBike />
    <NearRow />
    <BankAir />
  </>
);
