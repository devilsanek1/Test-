// SQA HOOK (lines 1-2), 0.00-5.80 (docs/v3/flow_v2.md §2, §4): H1 = O1's framing, POV; frame 0 = the loop target.
// PLACEHOLDER (engine lane): plays the G5b panel it replaces, O1, in its own window (g5b_panels.tsx), so the film plays
// end to end. The SQA pilot replaces this file whole: O1 as built in the clean pen, the new ticker, LOW-C, the eased
// pull-out and Pip on the phone, on the shared pieces `home_set` + `homeCam(T)` and `thread_plane` (flow_v2 §3).
// Joins (docs/G5_BLOCKING.md §2b, the sequence contract): IN frame 0 (its t < 0 is the loop underlay: the frame-0
// drawing state under SQF's un-build); OUT J1, a seam mid-pan at 5.80 (frame 348): SQA and SQB both draw home_set and
// thread_plane on homeCam at FILM time (useFilmTime), so the two frames there are identical.
import type React from 'react';
import {g5bPlaceholder} from './g5b_panels';

const P = g5bPlaceholder('SQA', ['O1']);
const SQA: React.FC = P.Component;
export default SQA;

/** The placeholder's caption tone: its old panel's (the real build exports its own or falls back to scenes.json). */
export const captionTone = P.captionTone;
