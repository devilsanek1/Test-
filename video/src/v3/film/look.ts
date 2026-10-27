// Video 3 (rework before publishing; owner, 2026-10-27, on G5b: "too busy ... the style is too rough and messy, a lot
// of rough lines ... cleaner, more refined, gentle, premium"; supporting life "a bit more subtle but yet alive"):
// the CLEAN PEN and the ATTENTION TIERS (lib/pen.ts, lib/tier.tsx; kit/README.md "Clean pen and tiers").
//
// Imported right after ../palette by every v3 FILM entry (src/entry-v3-film.tsx, src/entry-v3-kit.tsx) and by the kit
// barrel, so the pen is set before any kit or scene module draws. Other entries (v1, v2, v2r, the G3/G4 v3 entry) are
// separate bundles and keep their own pen.
//
// What it switches (all at render time, nothing else changes): every lib/sketch line, rect, poly and loop is one clean
// subpath (rects and closed shapes end in Z, ruler-true edges, true ellipses, no overshoot / breaks / jitter, no texture
// marks), fills sit exactly on their lines, strokes are uniform (no taper or width noise, no loosening on the
// un-build), and the line weight and colour come from each piece's tier (the kit sets the defaults: the story's
// objects are 'subject', what they touch and the supporting life 'support', the dressing and ambient life
// 'environment'; a scene forces a group with <Tier tier=... bg=...>). Untagged scene ink is 'support'.
import {setPen} from '../../lib/pen';
import {EMBER} from './palette';

/** Light sources: never recoloured by a tier (lit windows, the lamp's pool and mouth, the server lights, screens). */
export const V3_EMISSIVE = [EMBER.houseLit, EMBER.ring, EMBER.core, EMBER.led, EMBER.screen, EMBER.newScreen];

setPen('clean', {bg: EMBER.wall, emissive: V3_EMISSIVE, untagged: 'support'});
