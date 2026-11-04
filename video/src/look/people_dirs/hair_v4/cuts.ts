// HAIR v4: the six cuts (each its own file, drawn by hand in head units).
import type {Cut} from './cut';
import {LONG} from './cut_long';
import {LOB} from './cut_lob';
import {CLOUD} from './cut_cloud';
import {PONY} from './cut_pony';
import {CROP} from './cut_crop';
import {FLOW} from './cut_flow';

export const CUTS4: Record<string, Cut> = {LONG, LOB, CLOUD, PONY, CROP, FLOW};
/** Who wears each cut on the sheets (the v3 cast's looks), and the order. */
export const WEARS: [string, 'her' | 'W1' | 'W4' | 'W6' | 'M1' | 'M2'][] = [
  ['LONG', 'her'],
  ['LOB', 'W1'],
  ['CLOUD', 'W6'],
  ['PONY', 'W4'],
  ['CROP', 'M1'],
  ['FLOW', 'M2'],
];
