// FLOW v5, GUST: the cast. Her first: the one saturated colour (a raspberry red), a long open coat to the shin whose
// own back half flies as one pointed flag, long dark hair leaving as one mass. Strangers each wear ONE long outer
// piece in one calmer related colour (camel, mauve, slate, sage, terracotta), so a crowd never becomes a field of
// saturated coats; hair and legs dark. Builds, heights and skin across the range; each a different cut.
import type {Look} from './figure';
import {COAT} from './garments';
import {TRENCH_B, SKIRT_Q, OVERCOAT_P, SHIRT_Q, CHORE_Q} from './garments_cast';
import {CUTS} from './hair';

export const HER: Look = {
  id: 'her',
  name: 'her: the long open coat',
  stature: 168,
  build: {sex: 'f', head: 1.6, neck: 43, sh: 80, hipY: 500, leg: [30, 15], foot: 66, hipW: 50},
  col: {garment: '#D23A60', inner: '#8E2148', skin: '#EDBA9A', hair: '#2A1B2D', legs: '#2D2333', shoes: '#1E1520'},
  garment: COAT,
  cut: CUTS.LONG,
};

/** A belted trench, a low knot (the calm cut), deep skin; tall and slim. */
export const NIA: Look = {
  id: 'nia',
  name: 'the belted trench',
  stature: 175,
  build: {sex: 'f', head: 1.52, neck: 42, sh: 84, hipY: 490, leg: [28, 14], foot: 64, hipW: 50},
  col: {garment: '#B88A64', skin: '#6B4332', hair: '#1E1416', legs: '#2B2228', shoes: '#1B1416'},
  garment: {b: TRENCH_B},
  cut: CUTS.KNOT,
};

/** A long bias skirt under a cropped knit, a lob, tan skin; petite. */
export const ROSA: Look = {
  id: 'rosa',
  name: 'the bias skirt and the cropped knit',
  stature: 160,
  build: {sex: 'f', head: 1.62, neck: 44, sh: 76, hipY: 505, leg: [30, 15], foot: 60, hipW: 50},
  col: {garment: '#8C5A86', top: '#A27A9C', skin: '#C68A62', hair: '#3A2420', legs: '#2E2230', shoes: '#22181F'},
  garment: {q: SKIRT_Q},
  cut: CUTS.LOB,
};

/** A long overcoat, a short cut swept back, light skin; tall and lean. */
export const THEO: Look = {
  id: 'theo',
  name: 'the long overcoat',
  stature: 188,
  build: {sex: 'm', head: 1.45, neck: 64, sh: 96, hipY: 488, leg: [32, 17], foot: 72, hipW: 56},
  col: {garment: '#5A6A88', skin: '#E9C2A2', hair: '#2A2024', legs: '#262630', shoes: '#1A1618'},
  garment: {p: OVERCOAT_P},
  cut: CUTS.SHORT,
};

/** A big open shirt over a dark tee and wide trousers, a close crop, deep skin; athletic. */
export const KOFI: Look = {
  id: 'kofi',
  name: 'the big shirt and wide trousers',
  stature: 182,
  build: {sex: 'm', head: 1.48, neck: 68, sh: 104, hipY: 490, leg: [34, 18], foot: 74, hipW: 60},
  col: {garment: '#7F998A', inner: '#2C2A33', skin: '#4E2F22', hair: '#141012', legs: '#2C2A33', shoes: '#1A1719'},
  garment: {q: SHIRT_Q},
  cut: CUTS.CROP,
};

/** A chore jacket over a dark tee and wide trousers, a short cut with a swept fringe, medium skin; average. */
export const JUN: Look = {
  id: 'jun',
  name: 'the chore jacket',
  stature: 176,
  build: {sex: 'm', head: 1.5, neck: 64, sh: 96, hipY: 492, leg: [32, 17], foot: 70, hipW: 56},
  col: {garment: '#A6644E', inner: '#2C3245', skin: '#D8A47C', hair: '#161214', legs: '#2C3245', shoes: '#1A1718'},
  garment: {q: CHORE_Q},
  cut: CUTS.SHORT2,
};

export const CAST: Record<string, Look> = {her: HER, nia: NIA, rosa: ROSA, theo: THEO, kofi: KOFI, jun: JUN};
