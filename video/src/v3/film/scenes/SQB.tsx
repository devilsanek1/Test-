// SQB OLD DEAL (lines 3-4), 5.80-16.60 (docs/v3/flow_v2.md §2, §4): the chart card on the nook's wall, right of the
// window (homeCam pans x 0 -> -775 over 5.15-6.45 and back over 15.95-17.25).
// PLACEHOLDER (engine lane): plays the G5b panels it replaces, S4, S5 and S6, each in its own window (g5b_panels.tsx),
// so the film plays end to end. The HOME lane replaces this file whole (home_set + thread_plane + the card; S4_chart's
// PriceChart, kit Charts, Laptop, PriceTag).
// Joins (docs/G5_BLOCKING.md §2b, the sequence contract): IN J1, a seam mid-pan at 5.80 (frame 348); OUT J2, a seam
// mid-pan at 16.60 (frame 996). Both are carrier C: the same homeCam move runs across each, so both builders draw the
// identical frame there (shared pieces at FILM time: useFilmTime); the card is static (title, axes) until 6.98.
import type React from 'react';
import {g5bPlaceholder} from './g5b_panels';

const P = g5bPlaceholder('SQB', ['S4', 'S5', 'S6']);
const SQB: React.FC = P.Component;
export default SQB;

/** The placeholder's caption tones: its old panels' (the real build exports its own or falls back to scenes.json). */
export const captionTone = P.captionTone;
