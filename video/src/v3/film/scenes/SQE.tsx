// SQE FIRST DIBS (lines 6-8), 22.68-36.36 (docs/v3/flow_v2.md §2, §4): H2, standing at the glass: our street with the
// chip factory's lit gate, the DC and the mountain behind; the queue, the crate, the 5x notice, the tick to $1,099 on
// "pass" (30.28), the BETTER van, the 2027 flip.
// PLACEHOLDER (engine lane): plays the G5b panels it replaces, S10 to S14, each in its own window (g5b_panels.tsx), so
// the film plays end to end. The WINDOW lane replaces this file whole (`outside` first; ChipFactory, GateBooth,
// Floodlight, StickCrate, Van, Calendar; S11's bars, S12's tick, S14's shove).
// Joins (docs/G5_BLOCKING.md §2b, the sequence contract): IN J4, a seam mid-entry at 22.68 (frame 1361: h2_window +
// outside on entryCam at FILM time; the front plane rises into LEFT 22.45-22.95); OUT J5, a seam on a held frame at
// 36.36 (frame 2182).
import type React from 'react';
import {g5bPlaceholder} from './g5b_panels';

const P = g5bPlaceholder('SQE', ['S10', 'S11', 'S12', 'S13', 'S14']);
const SQE: React.FC = P.Component;
export default SQE;

/** The placeholder's caption tones: its old panels' (scenes.json holds the build's: light, white on H2's sky). */
export const captionTone = P.captionTone;
