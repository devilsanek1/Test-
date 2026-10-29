# The look test's nature lane (N): one species tree, one wind, one hero cumulus

*Lane N of the 7 s look test (`STUDY.md` §10, build items 8 and 9). Written as it goes. Specs: `pro_3_nature.md` §3.0
(N1-N7), §3.1 (trees), §3.4 (clouds); the owner on nature: "the "nature" objects are very subtle and they are visually
very interesting like they are obviously very real, but if you look closely we combine the real effects with the lower
poly kind of effects". Decided (2026-10-29, "Go with your suggestions"): no outlines (edges from light and shade), a lit
and a shade face on every volume, one look, a VERY subtle mottle, a full value range, 2 px lines on floating layers.*

Status: in progress (2026-10-29).

## 1. The pieces (all new files; nothing existing changed)
| File | What |
|---|---|
| `src/lib/wind.ts` | ONE gentle wind for all foliage (N7) |
| `src/lib/foliage.tsx` | one species (the London plane): `<Crown>`, `<LeafSpray>`, tones, `foliageProblems()` |
| `src/lib/clouds.tsx` | the hero cumulus (§3.4): `<Cumulus>`, `cloudTones()`, `cloudProblems()` |
| `src/entry-look-nature.tsx` | the demo compositions (stills and the 2 s wind check) |
| `scripts/look/posters/nature_check.py` | the still meter (pro_3's metrics on a box) and the motion check (twinkle, boil) |

## 2. Libraries (the owner: "Search for any libraries or supporting code on GitHub ... But only if it's genuinely better than built yourself")
(filled in below)

## 3. API
(filled in as each piece lands)

## 4. Checks and numbers
(filled in after the renders)
