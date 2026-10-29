// O1 (lane L1-opening): the HOOK, 0-5.80 (the set lives in O1_set.tsx, shared with S15).
// The cozy home-base nook in POV: the phone with the laptop listing and its price tag in front of the window, the AI
// data center on the snowy horizon between two houses. Frame 0 = bare ink lines being drawn, colour floods in by
// ~0.25 s, the thumb taps "Add to cart"; each memory stick that flies from the listing's laptop into the data center's
// roof ticks the tag up one step ($999 -> $1,099); the phone lowers (3.64-4.00); at 4.04 the building goes dark and its
// sign lights up. Camera: PULL OUT z 1.05 -> 1.00, ease-in, the whole shot (three planes). t < 0 = the bare-line state
// the loop reveals under S16's un-build.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {EMBER} from '../kit';
import {O1Set} from './O1_set';

const O1: React.FC = () => (
  <World sky={EMBER.wall}>
    <O1Set />
  </World>
);
export default O1;

/** Ink captions on the peach-cream wall (the caption band is wall all shot long). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
