// The look test's NEAR WORLD IN MID-TONES (owner, 2026-10-29: decision 2 (b), "the near world in mid-tones"; CRAFT §f.8;
// pro_1_depth.md §3.1: the near group's median L* 45-60, >= 30 from the air; pro_4_colour.md §4: "the café set and planter
// as the near group at L* 50-60"). Lane E's absolute near floor (lib/depth `nearPalette`: plane -1 lands at L* 60, -2 at
// 55, every internal step kept) moves S1's pale bank and its near things into the mid-tones; a result that falls in the
// never-beige band (a peach stone darkened keeps h ~61 at C* ~13: muddy tan) turns rose as 10b's paving shade does
// (#CFAFA4: "rose, never beige"); then the pen's tier-C pull is inverted (darks.ts forTier) so the frame SHOWS E's
// values. Pure, cached per palette.
import {lch, fromLch} from '../../lib/light';
import {nearPalette} from '../../lib/depth';
import {cleanColour, neverBand} from '../../lib/water';
import {forTier} from './darks';

/** The hue a beige near stone turns to (CIE h, deg): rose-terracotta, 10b's paving shade family. */
const ROSE_H = 42;

/** A darkened warm colour out of the never bands, its value kept: beige turns rose (h <= ROSE_H, C* >= 12), any other
 *  band goes through lib/water cleanColour. */
export function noBeige(hex: string): string {
  const band = neverBand(hex);
  if (!band) return hex;
  if (band === 'beige') {
    const c = lch(hex);
    const out = fromLch(c.L, Math.max(12, c.C), Math.min(c.h, ROSE_H));
    return neverBand(out) ? cleanColour(out) : out;
  }
  return cleanColour(hex);
}

const CACHE = new Map<string, Record<string, string>>();

/** Source -> the colour to AUTHOR for plane `plane` (< 0) in the mid-tones: E's near floor, no beige, the pen's pull
 *  inverted. `entries`: the plane's colours with their rough area shares (the median is area-weighted). */
export function nearMid(entries: readonly (readonly [string, number])[], plane: number): Record<string, string> {
  const key = `${plane}|${entries.map(([c, a]) => `${c}:${a}`).join(',')}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const pal = nearPalette(entries, plane);
  const out: Record<string, string> = {};
  for (const [c] of entries) out[c] = forTier(noBeige(pal[c] ?? c), 'environment');
  CACHE.set(key, out);
  return out;
}
