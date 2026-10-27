// SQD THEIR MOUNTAIN (line 5b), 19.40-22.68 (docs/v3/flow_v2.md §2, §4): the scale reveal, the thread's one declared
// gap: the same stick on the pile's summit, then ONE S5 pull-back (19.40-21.98) to just outside our window, hold.
// PLACEHOLDER (engine lane): plays the G5b panel it replaces, S9, in its own window (g5b_panels.tsx), so the film plays
// end to end. The REVEAL lane replaces this file whole (the S9 rig, S9_far, S9_peak, S9_town, S9_sky, Pullback; it
// draws `outside` and `h2_window` through its own camera in its last 0.6 s).
// Joins (docs/G5_BLOCKING.md §2b, the sequence contract): IN J3, the engine's push-through (from = to = (540, 870), zoom
// 7, no bridge; its in leg pulls THIS sequence back 19.40-20.005: draw the summit stick at (540, 870), w 700, rot -4 at
// t 0); OUT J4, a seam mid-entry at 22.68 (frame 1361): entryCam 22.35-22.95 runs across it (FILM time).
import type React from 'react';
import {g5bPlaceholder} from './g5b_panels';

const P = g5bPlaceholder('SQD', ['S9']);
const SQD: React.FC = P.Component;
export default SQD;

/** The placeholder's caption tone: its old panel's (scenes.json holds the build's: dark, then a 'down' wipe to light
 *  at t 0.15 when the stick has left the band). */
export const captionTone = P.captionTone;
