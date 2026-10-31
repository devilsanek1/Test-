# D3 reconciled: the darks, settled with v7's numbers (2026-10-30/31)

`ORGANIC.md` §8 D3 (with C7's L* 35 floor and C8) waited for the owner's pick of the dark key. He handed it over ("Do
what you think is right and make the videos better", 2026-10-30; playbook Process: when the owner hands a call over,
make it); the pick was T3, the references' low key (`ORGANIC.md` §8 end), and painter v7 built it (NOTES v7,
`v7_checks.json`). This log lists every edit that settled it. Paths are from `video/`. Nothing is committed here.

**The wording, everywhere:** small darks at the focal (the subject's silhouette, a doorway, a window, a hull) plus one
or two big quiet dark masses below the caption band, each a shade with a named caster, painted and alive inside, in the
key's shade colour (never black, grey or a dead slab); R10's dark group 15-40 % of the frame at mean L* <= 45, >= 80 %
of it in one or two masses; up to ~45 % of the whole frame under L* 40; the caption band kept light for the ink
captions (a night sky's band: DIRECTION rule 10); darks scattered as confetti are out (R2).

**The evidence:** v7 43.0 % under L* 40, median L* 44, the dark group 28 % at L* 27 (92 % in its two largest masses),
her L* 25 at the focal, the band L* 77 with the words at 9:1, 1 composition WARN (R2); v7a 47 % (its quay unpainted:
"an empty purple slab"); T3 45 %; v6 7 %. Measured here on `paint_still_v7.png`: 30.9 % of the frame under L* 35 (the
old floor), 10.6 % under L* 25 (12.0 % with the band out), p5 21.5. **The brief's "the references measure 45 %" is
T3's number:** `docs/look/organic/composition_metrics.json` gives ref 02 84 % and ref 03 67 % under L* 40 (medians 21
and 34), under dark skies our light caption band rules out; the docs say so.

## The edits (old -> new, why)

| # | File, place | Old -> new | Why |
|---|---|---|---|
| 1 | `docs/look/DIRECTION.md` intro, the 2026-10-29 list | "real darks in many small pieces and a calm sun (rule 6)" -> + "(settled anew on 2026-10-30 under the owner's hand-over: small darks at the focal plus one or two big quiet dark masses, rule 6)" | the list says "in the rules below" |
| 2 | DIRECTION intro, the 2026-10-30 note | "One call is still the owner's: the dark key, T1 ... or T3 ..." -> handed over and decided: T3, the caption band kept light, built in painter v7 | pending note |
| 3 | DIRECTION rule 6 | "real darks ... drawn in many small pieces (owner, 2026-10-29), never one dark mass ... (owner's pick pending: D3)" -> the wording above, with "up to ~45 % ... (v7 43 %)" and "(a night sky's band: rule 10)" | D3; rule 10 lets a night band take warm-white words (video 4) |
| 4 | DIRECTION Retired | new line: the 6-10 % small-pieces rule (CRAFT §f.8, 2026-10-29 to 2026-10-30) -> the low key | a reversed rule goes to Retired |
| 5 | `docs/look/CRAFT.md` intro | "One call waits for the owner: the dark key (§d.2, §f.8; D3)" -> decided 2026-10-30: T3, built in v7, whose numbers set §d.2's floor and §f.8's darks | the index note |
| 6 | CRAFT §d.2 | "Nothing under L* 35 but ink, anchor-dark surfaces and §f.8's dark pieces ... (owner's pick pending)" -> "... and §f.8's darks: the small darks at the focal and the big quiet dark masses below the band, each a shade with a named caster (§d.5)" | C7: v7 has 31 % of the frame under L* 35, most of it the quay |
| 7 | CRAFT §d "Check" | "nor under L* 35 except on an anchor-dark surface or a dark piece (§f.8; owner's pick pending)" -> "... a small dark or inside a dark mass (§f.8)"; check_light: + "and the dark masses' as `--dark-mass`" | C7; the checker's new flag (#34) |
| 8 | CRAFT §f.8 | title "real darks ... in many small pieces" -> "in the references' low key: small darks at the focal and one or two big quiet dark masses below the band"; "The dark share: 6-10 % under L* 40 in >= 120 pieces across >= 9 of 16 cells ..., the near world in mid-tones (pending)" -> "The darks: the references' low key" with R10's group, up to ~45 % under L* 40, the evidence above, the T1 lift only where it reads gloomy, confetti out (R2); the old share history; measured by `composition_study.py frame` + `pro_4_colour.py`; p5 + "v7 22" | C8 / D3 |
| 9 | `docs/look/LAYOUT.md` status legend | + "or decided under the owner's hand-over of 2026-10-30 (in force)" | the status §8.2 now uses |
| 10 | LAYOUT §1 "bottom third" | "the foreground ..., in mid-tones with its small darks (CR §f.8; owner's pick pending)" -> "in the references' low key the near ground is usually the frame's big quiet dark mass, a shade with a named caster, painted and alive inside (v7's wet quay ...), the small darks at the focal above it" | D3 |
| 11 | LAYOUT §6, the composition check | "the real dark mass (owner's pick pending: D3)" -> "the real dark mass (R10), and as information the share under L* 40 (up to ~45 %)" | pending note; the check's info row (#35) |
| 12 | LAYOUT §8.2, the near frame's status | "the near world in mid-tones, its darks in many small pieces: owner-decided (2026-10-29) ... (owner's pick pending)" -> "the near frame inside the near ground's quiet dark mass, the references' low key: decided under the owner's hand-over (2026-10-30)"; the 2026-10-29 wording marked history | pending note |
| 13 | `docs/OWNER_PLAYBOOK.md` "Learn from the city posters" | "real darks 6-10 % of the frame in many small pieces;" -> + "(settled anew on 2026-10-30 under his hand-over: the references' low key, A full value range below)" | the decided list read as in force |
| 14 | Playbook "A full value range" | rule text: "drawn in many small pieces (... 6-10 % ...), never one dark mass" -> "in the references' low key: small darks at the focal and one or two big quiet dark masses below the caption band (...; the caption band kept light), never darks scattered as confetti"; evidence: the owner's words kept exactly ("5 - good point too!", "Go with your suggestions"), + "the darks rule settled under his hand-over, "Do what you think is right and make the videos better", 2026-10-30, with painter v7: ..." | D3; the playbook: a rule's meaning changes only under a hand-over, and says so |
| 15 | Playbook Retired | the 5 % -> 6-10 % line + "(retired in turn, next line)"; new line: the 6-10 % small-pieces rule -> the low key (2026-10-30) | a reversed rule moves to Retired |
| 16 | `docs/look/PALETTE.md` DNA, "Where the values and the colour live" | "the near world in mid-tones ..., and real darks drawn in many small pieces" -> "the mid-tones carrying the colour, and real darks: small darks at the focal ... plus one or two big quiet dark masses below the band in the key's shade colour, chroma kept"; + the shade mass's colour as a palette role | a copy of the old rule |
| 17 | PALETTE DNA, "one dark anchor" | "in many small pieces on 6-10 % of the frame ..., never one mass" -> "the small darks at the focal and the one or two big quiet dark masses ..., up to ~45 % under L* 40" (the old shares as history) | a copy |
| 18 | PALETTE "What goes with 10b" | "its darks in many pieces (§f.8: 6-10 %)" -> "its real darks (then 6-10 % ...; since 2026-10-30 the references' low key ...)" | a copy |
| 19 | `docs/look/COZY_AND_SCALE.md` 3b.6 "Tinted extremes" | "darks warm and rare (L* < 25 on <= 6 % of the frame)" -> "the deepest rare (L* < 25 only at the focal and in a dark mass's deepest end, on <= ~12 %: v7 11 %; <= 6 % until the low key)", + "or the key's shade end" | v7 has 10.6 % under L* 25: the old cap failed the decided key |
| 20 | COZY "Shared rules", the dusk ladder | "L* <= 40 ... only in small pieces (§f.8: 6-10 % of a held frame) and big foregrounds are #8A9AA8 with a #545F6D lip" -> the small darks and the dark masses (the group 15-40 %, up to ~45 % under L* 40); a big foreground is that dark mass, or #8A9AA8 with its lip where lifted | a copy of 6-10 % |
| 21 | `docs/look/ORGANIC.md` intro | "integrated them all but the dark key (D3, the owner's pick)" -> "... and the dark key (D3), handed over and decided as T3, was settled with painter v7's numbers the same day" | pending note |
| 22 | ORGANIC §1 row 1 | "the dose (T1's ... or T3's) is the owner's pick, and CRAFT §f.8 disagrees (C8)" -> "the dose is T3's ..., built in v7 (43 %; the group 28 % at L* 27), now CRAFT §f.8's" | pending note |
| 23 | ORGANIC §4.4 R10 | + "v7 28 % at 27, 92 % in two", "with up to ~45 % of the whole frame under L* 40 (T3 45 %, v7 43 %): CRAFT §f.8's low key" | the two measures side by side |
| 24 | ORGANIC §6 step 1, check | "the words' contrast unchanged (68.9 L*)" -> "the words >= 7:1 (T3's band at ~77: 63.7 L*, 9:1)" | NOTES v7a's flag: T3's light band cannot keep 68.9 |
| 25 | ORGANIC §6 step 2, check | "darks (L* < 40) 15-40 % ... (R10)" -> "R10's dark group 15-40 % at mean L* <= 45 ..., and up to ~45 % under L* 40 (two measures: v7a 27/47 %, v7 28/43 %)" | NOTES v7a's flag: two measures conflated |
| 26 | ORGANIC §6 step 4 | "Show T3's key beside it ... for the owner's pick." -> "decided under the owner's hand-over (§8 end), and v7 built it" | pending note |
| 27 | ORGANIC §6 "The v7 sheet" | "with T3's key as the second option ... ask the owner §8's three questions" -> the sheet (`compare_v7.jpg`, `v7_checks.json`) shows the result; the questions were handed over and decided | pending note |
| 28 | ORGANIC §7.3 | "T3's darker top is the owner's call"; "our median stays ~61" -> taken under the hand-over (v7's sky 60 -> 77, the words 9:1); "(proof 2 ~61, v7 44)" | pending note |
| 29 | ORGANIC §8 intro | "Only the dark key (D3, with C7's floor and C8) waits, for the owner's pick." -> decided and settled with v7's numbers; every item now FIXED (the shared code stays flagged) | |
| 30 | ORGANIC §8 D3 | **OPEN** -> **FIXED** with v7's numbers, the wording and where | the task |
| 31 | ORGANIC §8 C7 | "**OPEN** for the L* 35 floor (waits for D3)" -> FIXED with D3 (CRAFT §d.2 and its check; `check_light.py --dark-mass`) | the task |
| 32 | ORGANIC §8 C8 | **OPEN** -> **FIXED** with D3 (CRAFT §f.8; the 6-10 % and the mid-tone near world history; the info row) | the task |
| 33 | ORGANIC §8 end | "D3's wording follows v7a." -> "D3's wording followed v7 (FIXED above)." | v7, not v7a, set it |
| 34 | `scripts/qa/check_light.py` | new `--dark-mass x0,y0,x1,y1[;...]`: check (2)'s L* 35 floor skips shadow pixels inside a declared dark mass (reported as `in_dark_mass`, printed), still FAILs a greyed shadow there; without the flag nothing changes | it FAILed any designed shade mass under L* 35 |
| 35 | `docs/look/organic/composition_study.py` `frame` | info row "(CRAFT §f.8 asks 6-10 %)" -> "(CRAFT §f.8: up to ~45 %, R10 the mass[, OVER])"; R10's own check already matched (unchanged) | the stale threshold text |

**Checker tests.** #34 on a synthetic A/B (a quay at L* 56 shaded to 32, C* kept): no flag FAIL (669,600 px under L* 35),
the mass declared OK (the pixels reported), a box over half of it FAILs the other half (334,800 px). #35 still prints an
`info` row (no new WARN), so `src/look/v7_s1/bake/check_v7.py`'s parse and WARN count are unchanged; it reads 43 % on v7
and 47 %, OVER, on v7a. `v7_checks.json` / `v7a_checks.json` keep the old text as recorded output until a rerun.

**Checked and left as they are.** Compatible: `CINEMATIC_GUIDE.md` (the anchor's L* 15 step and colour "in small dark
pieces": the deepest step stays in small darks), `COZY_AND_SCALE.md` §3's night anchor, `paint_recipes/water.md` (the
water's own darks in a light scene; v7's canal is 47 L*, not the mass), `paint_recipes/people.md` (a figure's darks),
PALETTE's 10b row (describes the proposal). No thresholds: `scripts/look/posters/pro_4_colour.py` (measures only),
`check_v7.py` (reports against T3's 45 %). Records (dated, kept as history, as STUDY §9 keeps decision 4 without its
hold): `STUDY.md` §9 decision 2, `SUMMARY.md`, `INTEGRATION.md`, `pro_4_colour.md`, `test/`, `organic/composition.md`
§0/§5/§7.3, `organic/light_proof.md` §9, NOTES v7a's flags (resolved here), `summary_sheet.py`. Unrelated "6-10 %":
facet sizes (CRAFT §b, LAYOUT §8), halftone dots (PALETTE).

## For the orchestrator
- Not mine to edit: `HANDOFF.md` (the 2026-10-29 entry lists "real darks 6-10 % in many small pieces") and this study's
  `HANDOVER.md` (D3 as a to-do / "waits for the owner's key pick").
- The composition lane (not touched): `docs/look/composition/modern.md` row "the flat, low-contrast, murky streaming
  look" cites DIRECTION 6 as "real darks in small pieces, a light page" and "M9's lit practical in a light key";
  `composition/recipes.md` "Scene 1: T1's values in v2's view, the frame moved up 140-190 px" (the key is T3, and v7
  kept v2's camera without T3's 140 px tilt); `composition/cinema.md` C3 says of T3 "the owner picks" (the key is
  decided; the camera height stays the lane's call).
- A T3 consequence outside the darks: CRAFT §g.1 lets a zenith go ~6 L* deeper than the field; T3's is 17 (60 against
  77). The still passes `check_banding.py`; a master encode is the gate before a film takes it.
- The playbook's "Last reviewed" line is unchanged (a targeted integration, not a review pass).
