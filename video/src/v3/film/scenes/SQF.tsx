// SQF PAYOFF (line 9), 36.36-41.15 (docs/v3/flow_v2.md §2, §4): H2 held; the DC's sign steps up (36.98), the phone rises
// to PAYOFF (38.12-38.62), the tag turns (39.70: the mini data center "AI" on its back), Pip shrugs (40.30); the loop.
// PLACEHOLDER (engine lane): plays the G5b panels it replaces, S15 and S16, each in its own window (g5b_panels.tsx), so
// the film plays end to end. The WINDOW lane replaces this file whole (S16's tag turn, shrug and loop: EraseDown,
// o1FrontMat).
// Joins (docs/G5_BLOCKING.md §2b, the sequence contract): IN J5, a seam on a held frame at 36.36 (frame 2182); OUT the
// loop, scenes.json transitionOut {type: 'unbuild', loop: true, dur: 0.3}: un-build over 40.85-41.15 onto SQA's t < 0
// bare lines (drop the sky slab while useExit() > 0, as S16 does); the captions roll at 41.00 (Film3.tsx).
import type React from 'react';
import {g5bPlaceholder} from './g5b_panels';

const P = g5bPlaceholder('SQF', ['S15', 'S16']);
const SQF: React.FC = P.Component;
export default SQF;

/** The placeholder's caption tones: its old panels' (scenes.json holds the build's: light, white on H2's sky). */
export const captionTone = P.captionTone;
