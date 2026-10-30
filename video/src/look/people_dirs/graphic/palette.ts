// MODERN GRAPHIC people: the wardrobe palette (fashion.md §2.5, inside the house: warm, no beige, muddy tan, olive or
// grey; design_research.md V4-V6). An outfit is a tonal base plus at most ONE accent; the film's teal only on her.
import {tone, skinTone, hairTone, Tone} from './color';

export const HEX = {
  cloud: '#F0EAE1', // Cloud Dancer, the 2026 white: tees, knits, the light at the neck
  cream: '#E6D7C3',
  butter: '#F2DD9C',
  caramel: '#B58058',
  cognac: '#9E5A3C',
  chocolate: '#664334',
  burgundy: '#743137',
  denim: '#557B9A',
  indigo: '#2F4566',
  navy: '#254161',
  black: '#3A2E33', // warm near-black, never pure black
  ink: '#2A2124',
  teal: '#0B8577', // the film's hero: only on her
};

export const SKIN = {
  /** S2 light-medium (her) */
  s2: skinTone('#DDAF92'),
  /** S3 medium golden (the man) */
  s3: skinTone('#C79671'),
  /** S5 deep brown (the woman), with a sheen on the key-side planes */
  s5: skinTone('#8E5C43'),
};
export const HAIR = {
  copper: hairTone('#8A4A31'),
  blackBrown: hairTone('#2F2627'),
  black: hairTone('#2B2324'),
  honey: hairTone('#A8784F'),
};

export const T = {
  coat: tone(HEX.black, {k: 0.66}),
  coatFacing: tone('#4C3D43', {k: 0.7}),
  knit: tone(HEX.cloud, {k: 0.84}),
  trouserCream: tone(HEX.cream, {k: 0.82}),
  teal: tone(HEX.teal, {k: 0.74, toward: 230, maxTurn: 6}),
  shoeBlack: tone(HEX.ink, {k: 0.7}),
  tee: tone(HEX.cloud, {k: 0.84}),
  denim: tone(HEX.denim, {k: 0.8, toward: 280, maxTurn: 6}),
  sneaker: tone('#EFE7DB', {k: 0.86}),
  cognac: tone(HEX.cognac, {k: 0.78}),
  indigo: tone(HEX.indigo, {k: 0.76, toward: 290, maxTurn: 6}),
  burgundy: tone(HEX.burgundy, {k: 0.74, sheen: 22}),
  butter: tone(HEX.butter, {k: 0.86, sheen: 6}),
  phones: tone('#EDE5D8', {k: 0.84}),
  latte: tone('#A87653', {k: 0.8, sheen: 18}),
};

export const BG = {
  sheet: '#F2EAE2',
  panel: '#EAE0D6',
  mid: '#A99391',
  ground: '#3B2A2E',
};

export type Outfit = Record<string, Tone>;
