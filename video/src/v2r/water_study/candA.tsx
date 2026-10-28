// WATER STUDY seam, during the build (2026-10-28): candidate A's slot now draws the promoted shared water
// (src/lib/water.tsx through S1's spec, src/v2r/scenes/V2S1_water.tsx), so the build is measured against v5 through the
// same seam the judge used; the seam and this folder go once S1 draws it directly.
import {S1Water, S1Duck} from '../scenes/V2S1_water';
import type React from 'react';

export const CandWater: React.FC<{t: number}> = S1Water;
export const GLINTS_OFF = true;
export const CandDuck: React.FC<{t: number}> | null = S1Duck;
