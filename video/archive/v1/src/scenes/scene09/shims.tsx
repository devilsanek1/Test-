// S09 LOCAL STAND-INS for shared-kit pieces that do not exist (fix round 1: LidCrate -> props LockCrate (lidAt /
// tagsAt) and CartSign -> props FixSign in the MakersCart sign slot were swapped for the shared kit and removed):
//   Glint         = a 1-frame-pop four-point sparkle (plaque glint)
// Everything is flat: pops (7 % spring). No opacity animation anywhere.

import React from 'react';
import {palette, springAt, springs, useTime} from '../../lib';

const f2 = (v: number) => v.toFixed(2);

// ---------------------------------------------------------------- Glint

/** A four-point cream sparkle with an ink edge that pops (spring) and is gone after `dur`. */
export const Glint: React.FC<{x: number; y: number; r: number; at: number; dur?: number; ink?: number}> = ({x, y, r, at, dur = 0.3, ink = 1}) => {
  const t = useTime();
  if (t < at || t > at + dur) return null;
  const k = springAt(t, at, springs.pop) * (t > at + dur - 0.07 ? 0.6 : 1);
  const q = r * 0.28;
  const d = `M${f2(x)} ${f2(y - r * k)}L${f2(x + q * k)} ${f2(y - q * k)}L${f2(x + r * k)} ${f2(y)}L${f2(x + q * k)} ${f2(y + q * k)}L${f2(x)} ${f2(y + r * k)}L${f2(x - q * k)} ${f2(y + q * k)}L${f2(x - r * k)} ${f2(y)}L${f2(x - q * k)} ${f2(y - q * k)}Z`;
  return <path d={d} fill={palette.cream} stroke={palette.ink} strokeWidth={ink} strokeLinejoin="round" />;
};
