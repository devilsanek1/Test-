// V2S1 helper (lane L1): the S1 WORLD, everything but the story slots (TREATMENT section 4 layout, map S1_SHEET):
// the sky things, the west gap (SUN0, far roofs, the road bridge), the far towpath and its bend, Google's canal wing
// (W, the glass doors, the canopy letters), the water and the two moored boats, the far-towpath life. Our bank (the
// steps, the seated public) is the `seated` slot (V2S1_steps / V2S1_public); Pip and its bollard the `pip` slot.
// STUB: the kit's S1Set without its walkers (the slot contract below is final; the builder replaces the body).
import React from 'react';
import {S1Set} from '../kit/canal/sets';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';

export type S1WorldProps = {
  /** Her figure behind the glass doors (between the lobby and the door glass). */
  behindDoor?: React.ReactNode;
  /** The far towpath plane: her and the ghost row (drawn in front of the wing and the far-towpath life). */
  towpath?: React.ReactNode;
  /** Our bank y 1215-1920: the steps and the seated public (drawn after the water and the boats). */
  seated?: React.ReactNode;
  /** Pip on its waterline bollard (drawn after the steps). */
  pip?: React.ReactNode;
};

export const S1World: React.FC<S1WorldProps> = ({behindDoor, towpath, seated, pip}) => (
  <CanalCast person={k4Person}>
    <S1Set walkers={false} behindDoor={behindDoor} towpath={towpath} seated={seated} pip={pip} />
  </CanalCast>
);
