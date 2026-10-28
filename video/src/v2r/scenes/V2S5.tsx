// V2S5 "The far side" (lane L4): the ONE big move and the only scale moment. Film 20.55-23.80 s (scene t = film -
// 20.55); conform_L4.md (wins over TREATMENT), THROUGHLINE §3-§5b, map.ts S5, the Arlington kit (kit/dc) on the crane rig.
//   in         a push-through out of S4's sun (20.40-20.70, carrier A): S5 opens inside SUN1 (250, 650) in the bright
//              slot under the canopy, Pip SEATED on the bench back beside the stranger reading an open newspaper.
//   0.21       "April": the slot's trees burst into blossom (a few petals drift); Pip looks up at it (its one reaction).
//   0.15-1.20  the news box is the subject (its headline at body size); 0.75-2.85 ONE ease: dolly back + crane up + an
//              arc round the two backs (the far slides right, the slope sinks, the valley rises); the lamppost wipes the
//              backs at the peak (the tiny drawings swap behind it); 1.88 "Pentagon": it clears the tree, its outline
//              returns (tier A), the plaque pops; the obelisk rises; 2.53 its lit wing's windows warm in one step.
//   2.85-3.25  the hold (a V of birds), then out by a FOREGROUND WIPE (carrier D, 23.62-23.98): one blossom tree passes
//              close to the lens right to left (`Wiper`, V2S5_wiper) and S6 is behind it. Pip stays put (no leap).
// Helpers: V2S5_rig (planes), V2S5_set (the layered set), V2S5_far*, V2S5_river, V2S5_mid, V2S5_deck*, V2S5_figs,
// V2S5_text, V2S5_depth (the atmosphere), V2S5_wiper.
import React from 'react';
import {World} from '../../lib/World';
import {CM} from '../palette';
import {S5Set} from './V2S5_set';
import type {ToneKey, WiperComponent} from '../../lib/Film';
import {S5Wiper} from './V2S5_wiper';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

/** The S5 -> S6 foreground wipe's element (scenes.json V2S6 transitionIn {kind 'foreground-wipe', element 'scene'}). */
export const Wiper: WiperComponent = S5Wiper;

const V2S5: React.FC = () => (
  <World sky={CM.sky} stage="context">
    <S5Set />
  </World>
);
export default V2S5;
