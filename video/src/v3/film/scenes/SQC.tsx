// SQC YOUR STICK (line 5a), 16.60-19.40 (docs/v3/flow_v2.md §2, §4): H1 again (homeCam back at x 0 by 17.25); the phone
// rises to HIGH2 (17.24-17.64), one MemoryStick lifts out of the listing laptop to centre (540, 870), w 700, rot -4.
// PLACEHOLDER (engine lane): plays the G5b panels it replaces, S7 and S8, each in its own window (g5b_panels.tsx), so the
// film plays end to end. The HOME lane replaces this file whole (home_set + thread_plane; S8's MemoryStick).
// Joins (docs/G5_BLOCKING.md §2b, the sequence contract): IN J2, a seam mid-pan at 16.60 (frame 996: shared pieces at
// FILM time); OUT J3, the engine's push-through into the stick (scenes.json SQD: from = to = (540, 870), zoom 7, no
// bridge; its out leg zooms THIS sequence 18.905-19.40): hold the stick at (540, 870), w 700, rot -4 from 18.905 on.
import type React from 'react';
import {g5bPlaceholder} from './g5b_panels';

const P = g5bPlaceholder('SQC', ['S7', 'S8']);
const SQC: React.FC = P.Component;
export default SQC;

/** The placeholder's caption tones: its old panels' (the real build exports its own or falls back to scenes.json). */
export const captionTone = P.captionTone;
