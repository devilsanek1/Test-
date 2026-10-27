// Video 2 (restart): the film-wide CLEAN PEN (owner, 2026-10-27, after v3 G5b: "too rough and messy, a lot of rough lines;
// cleaner, more refined, gentle, premium"). Imported first by palette.ts, so it is set before any kit or scene module draws:
// every lib/sketch line, rect, poly and loop in this film is one smooth, confident stroke (no overshoot, breaks, drift or
// jitter; loops close cleanly). docs/v2/STYLE.md §3. Other films keep the default loose pen (v3 renders are unchanged).
import {setPenMode} from '../lib/sketch';

setPenMode('clean');
