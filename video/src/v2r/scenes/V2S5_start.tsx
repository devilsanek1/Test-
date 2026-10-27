// V2S5_start.tsx (lane L4): the START-only layers in screen space, given the crane progress p: S5StartBack (behind
// every plane) and S5StartFore (over everything): the warm-dark canopy and the near foreground of the held start
// (20.55-21.30) that drop out down-left as the crane rises; gone by the end.
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports the slot files).
import React from 'react';

export const S5StartBack: React.FC<{p: number}> = () => null;
export const S5StartFore: React.FC<{p: number}> = () => null;
