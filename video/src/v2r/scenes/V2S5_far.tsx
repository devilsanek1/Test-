// V2S5_far.tsx (lane L4): the S5 FAR plane (sky, clouds, the sun, the cloud bank, hills, the low city, the obelisk) in
// END coords. FAR_END is the contract the rig (V2S5_rig.ts) pins on: the horizon, its shift from the kit's 800, and the
// END sun (the rig maps it onto SUN1 at p 0 exactly).
import React from 'react';
import {FarPlane, VISTA} from '../kit/dc/vista';
import {CRANE_T} from '../kit/dc/crane';

export const FAR_END = {
  /** The end horizon (screen y) and its shift from the kit's 800. */
  horizon: VISTA.horizonY,
  dy: 0,
  /** The sun at the end (cut by the right edge). */
  sun: VISTA.sun,
};

/** The far plane (drawn inside the rig's FAR_S5 PullLayer). */
export const S5Far: React.FC = () => <FarPlane sun={{flip: CRANE_T.flip}} />;

/** Life in screen space between the far and the river planes (gulls, the V of birds). */
export const S5FarLife: React.FC = () => null;
