// V2S1 helper (lane L1): OUR BANK, the bottom third y 1215-1920 (TREATMENT section 5 "the bottom third", S1): the
// coping, the landing and five broad stone steps rising toward us, the seated public (backs, small and simple like
// reference 1, near head-backs <= ~140 px wide), their things and their life. Pip's bollard is the `pip` slot's.
// STUB: the kit's Steps (stone only) + the first helper's V2S1_public rows (the export below is final).
import React from 'react';
import {Steps} from '../kit/canal/steps';
import {S1Public} from './V2S1_public';

/** Our bank: the `seated` slot (drawn after the water and the boats, before Pip). */
export const S1Steps: React.FC = () => (
  <>
    <Steps people={false} />
    <S1Public />
  </>
);
