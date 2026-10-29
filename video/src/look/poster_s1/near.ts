// The look test's NEAR WORLD IN MID-TONES (owner, 2026-10-29: decision 2 (b), "the near world in mid-tones"; CRAFT §f.8;
// pro_1_depth.md §3.1: the near group's median L* 45-60, >= 30 from the air; pro_4_colour.md §4: "the café set and planter
// as the near group at L* 50-60"). Lane E's absolute near floor (lib/depth `nearPalette`: plane -1 lands at L* 60, -2 at
// 55, every internal step kept) moves S1's pale bank and its near things into the mid-tones; a result that falls in the
// never-beige band (a peach stone darkened keeps h ~61 at C* ~13: muddy tan) takes its warm chroma back as terracotta
// (pro_4_colour.md §3.2: the mids at C* 18-32; (d) "a warm fill under L* 86 takes C* >= 18 or turns rose": at L* 60 a
// rose at C* 13 read grey-mauve, terracotta warm and clean); then the pen's tier-C pull is inverted (darks.ts forTier)
// so the frame SHOWS E's values. Pure, cached per palette.
import {lch, fromLch} from '../../lib/light';
import {nearPalette} from '../../lib/depth';
import {cleanColour, neverBand} from '../../lib/water';
import {forTier} from './darks';

/** A beige near stone turns terracotta: CIE h <= TERRA_H (out of the beige band, h 55-95), C* >= TERRA_C. */
const TERRA_H = 50;
const TERRA_C = 19;

/** A darkened warm colour out of the never bands, its value kept: beige turns terracotta, any other band goes through
 *  lib/water cleanColour. */
export function noBeige(hex: string): string {
  const band = neverBand(hex);
  if (!band) return hex;
  if (band === 'beige') {
    const c = lch(hex);
    const out = fromLch(c.L, Math.max(TERRA_C, c.C), Math.min(c.h, TERRA_H));
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
