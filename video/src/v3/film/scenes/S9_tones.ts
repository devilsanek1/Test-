// S9_tones (S9 lane, G5b): the scale frame's plane tones (docs/v3/s9_scale_plan.md section 1). Each farther plane is a
// fixed flat mix toward the horizon (skyLow), its shade leaning to the dusk blue, with fewer value steps and less ink
// (Scale cues 5): near 68 L of range, then 59 / 53 / 40 / 24 toward infinity. Warm only on our side and the sticks.
import {EMBER} from '../kit';

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (v: number[]) => '#' + v.map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('').toUpperCase();
/** A flat mix of colour a toward b (0 = a, 1 = b). */
export const mix = (a: string, b: string, f: number) => {
  const A = hex(a);
  const B = hex(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * f));
};
/** A plane tone: the colour mixed toward the horizon (skyLow) by f. */
export const planeTone = (c: string, f: number) => mix(c, EMBER.skyLow, f);

export const T9 = {
  // sky and the hero cloud bank (far plane, behind all)
  cloud: '#6C7AA5',
  belly: '#6C7AA5',
  rim: EMBER.frost,
  glow: '#A4B0D1',
  // infinity (65 %)
  infDark: '#636E97',
  infLight: '#A2ACCD',
  // the far field (40 %)
  farDark: '#505A81',
  farLight: '#BCC4DD',
  farDot: '#D2A978',
  farGround: '#8590B6',
  // the campus and the mountain (far)
  hallB: '#373E5D',
  pylon: '#505A81',
  pileGold: '#CFA67C',
  pileDeep: '#BD956D',
  pilePin: '#DDC29B',
  pileChip: '#463E46',
  pileInk: '#826A5A',
  // the mid band (22 %)
  midDark: '#424C71',
  midLight: '#CFD6E9',
  midDot: '#E3AF6D',
  midInk: '#2E3554',
  // the near-mid band (12 %)
  nmDark: '#3B4469',
  nmLight: '#D9DFEF',
  nmWin: '#ECB266',
  litWall: '#C2CBE3',
  road: '#8E99C0',
  pool: '#C9A784',
  // our roof (warm, in shade)
  deck: EMBER.brickShade,
  deckDeep: '#5E2C1C',
  deckSnow: '#B4BEDC',
  deckSnowLit: '#CBD5EC',
  footprint: '#8790B4',
  parapet: EMBER.beam,
  stackShade: '#6A3220',
} as const;
