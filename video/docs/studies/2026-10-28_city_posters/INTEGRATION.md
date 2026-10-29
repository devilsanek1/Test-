# Integration: the study's conclusions merged into the main docs (2026-10-29)

*The owner: "merge the findings and key points and conclusions into the main repo"; on layout: "layout is a big aspect.
I think we've discussed a bunch of it already, perhaps we can consolidate the previous discussions and reconcile it with
your findings here". What was decided (owner, 2026-10-28) became numbers in the rule docs; every open call and proposal
was recorded as such, never as a rule. Each line: what, where, why: **owner** (an owner-approved item given its numbers),
**clash** (a disagreement fixed in the lower doc, by the ladder and the owner's newest words; the row is `LAYOUT.md`
§7's), **proposal** (recorded, not a rule), **open** (the owner's call, recorded with both options), **pointer** (a
restated number replaced by a link to its one definition). Paths from `video/docs/` unless they start with the repo.*

## Files changed
**`look/LAYOUT.md` (new)**
- The one layout guide, from `layout.md` Part A and B and `STUDY.md`: §1 the zones (the one definition, moved from G5
  §2 with every other layout number), §2 shot framing, §3 composition, §4 across shots, §5 the cover, §6 checks, §7 the
  19 disagreements resolved, §8 the posters' Part B with each line's status ([owner] / [open] / [proposal]). Owner (the
  ask above) and clash (rows 1-19).

**`look/DIRECTION.md`**
- Intro, the ladder: `LAYOUT.md` added among the look docs, winning on its own topic (where things sit in the frame);
  CINEMATIC_GUIDE's topic now "shot recipes and camera moves", so the two don't overlap. Owner (the ask).
- "Open study" note -> "The city-poster study (done 2026-10-29)": STUDY.md and SUMMARY.md, where the numbers live (CRAFT
  §c, §d, §f.8), PALETTE's proposals, LAYOUT.md; the five decided items unchanged; the open calls listed: outline or
  not, the dark share, the subject's shade depth, the "low poly" world, the designed view, the sun disc; no numbers.
  Owner (status).
- Rule 6: "numbers: the city-poster study" -> "numbers: `CRAFT.md` §f.8". Pointer.
- Rule 7: a pointer to `LAYOUT.md` §2 (the framing per shot type). Pointer.
- Rule 10: the band's y range and the G5 §2 link replaced by `LAYOUT.md` (§1, §5); the rule's words unchanged. Pointer
  (row 19).

**`look/CRAFT.md`**
- §c "Texture": "its numbers from the city-poster study" -> "to the test spec below". Owner (rule 4).
- §c new bullet "The paper-and-paint test, its spec": the posters' grain and mottle; the test's mottle (<= 0.5 L*, 30-70
  px, colour <= 0.35 a*b*), static and locked per parallax plane (1.0 / 0.7 / 0.4, the sky ~0.6), none in the band, no
  grain first (any grain <= 0.25 L*), the bitrate cost (+27 %; grain +48 %; screen-locked 6.2x; re-seeded 14x). Owner
  (rule 4: a VERY subtle texture to try).
- §c new bullet "Thin lines twinkle in the float": the measured renderer fact (`details.md` §3: under 2 px a line's
  core swings 17-66 % of its contrast in the float; 2 px lines and 4 x 6 ticks don't). It clashes with §c's C hairlines
  (1.2-1.6 px at dL* <= 15); STUDY.md §7 does not settle it, so it is flagged as **the owner's call**: (a) 2.0 px on
  floating planes, (b) kept quiet there (twinkle x dL* <= ~2 L*) or on locked shots only; the hairlines stand until then.
  Open (new).
- §d.3: how deep the subject's shade face goes, as the owner's call: (a) -7 to -12 on every tier, (b) tier A -20 to -25
  L*, B and C -7 to -12 (posters -21 to -37, median -29); the numbers above stand. Open (decision 1).
- §d.4: every volume in 2-3 flat tones, a lit face and a shade face: a prism two, a round form up to three bands (the
  posters 3-4), never a gradient. Owner (rule 5).
- §f.8 new, the value range: p5 <= 32 L*; >= 30 L* from the near group to the air; L* < 65 on >= 25 %, 65-80 on <= 20
  %; >= 15 L* from the subject's group to the far group; no darks in the band or far; WARNs. The dark share as the
  owner's call: (a) ~5 %, rule 6's anchor, as now (it stands), (b) 6-10 % under L* 40 in >= 120 pieces. Owner (rule 6)
  and open (decision 2).
- §g.1: "across y 317-556" named the caption block, with a link to `LAYOUT.md` §1. Clash (row 1: two names, one value
  each).

**`look/PALETTE.md`**
- New section "Proposed by the city-poster study": 10b Canal Mint, full range (`pro_4_colour.md` §3.7), 11 Poster
  Harbour and 12 Lantern Paper (`style.md`), each a proposal, not added to `palettes.json` or the board; their DNA notes;
  what waits on the owner (10b's darks: the dark share; its tier-A shade: the shade depth). Proposal.
- "What our kit has": the texture test's spec lives in CRAFT §c. Pointer.

**`G5_BLOCKING.md`**
- §2 "Screen zones": the numbers moved to `LAYOUT.md` §1; the bullet keeps its name (code comments cite it, e.g.
  `lib/particles.tsx`) and points there. Pointer (row 19: G5 §2 called itself "the one definition" while four docs
  restated it).
- §2 "Look": `docs/look/LAYOUT.md` added to the docs a lane reads. Pointer.
- §5: the (v2) `Frame0Text` note marked history (v2's REVIEW_1 MUST 1 took the frame-0 block out). Clash (row 11, the
  owner's words: no title over the captions).

**`look/COZY_AND_SCALE.md`**
- Intro: the caption numbers -> a link to `LAYOUT.md`. Pointer.
- §2: a lead line (the zones: `LAYOUT.md` §1; this section is the enclosure recipe); the asymmetry bullet's flat field
  "across y 317-556" -> "through the caption band (y 290-600)". Clash (row 1).
- §4 K2: "flat across y 280-570" -> the band, y 290-600; K7: "flat above y 556" -> "flat through the caption band (y
  290-600)". Clash (row 1).
- §5: Stage, the depth stack, the observer and the horizons moved to `LAYOUT.md` §1-2, the roof vistas named apart (S1
  0.40 H, S5 0.46 H, not "0.43-0.46 H"). Clash (row 7) and pointer (row 19).
- §5 "Time and captions": "payoff words on frame 0" -> frame 0 shows the first spoken line, the payoff in words by ~2 s
  (DIRECTION rule 9). Clash (the owner's words, v3, 2026-10-28).

**`look/CINEMATIC_GUIDE.md`**
- Notation: the caption numbers -> the zones and framing numbers in `LAYOUT.md`. Pointer.
- S1: "with the mascot" -> never the mascot as an anchor (Pip hides). Clash (row 13, the owner: "keep it, but not as
  obvious").
- S4: "the 'you' or the mascot small ... bottom-left" -> the "you" only, its feet above y 1480 on a wall or a step (the
  strip may run under the bottom UI as a mass), or nobody. Clash (rows 9, 13).
- S5 idea and "Scale cues" 8: "the 'you' and the mascot" -> the "you", with a companion only if W1 names one; never Pip.
  Clash (row 13).
- "Scale cues" 9 and 11: "outside y 317-556" -> outside the caption band. Clash (row 1).
- Rule 2: "Captions sit on flat sky ... plain sky in every frame" -> one calm flat field: outdoors the one sky, a flat
  light wall or facade where there is none. Clash (rows 1-2: DIRECTION rules 6, 10).
- Rule 4: "3-4 planes" -> 4-6 (5-7 on a vista; CRAFT §f.1 wins; S4's 3 its declared exception). Clash (row 5).

**`look/STORYBOARD_STYLE.md`**
- §3 "Silhouette and depth": "at most 3 planes for staging" -> stage in 3, the set's full list (4-6) in its `planes`
  field (CRAFT §f.1). Clash (row 5).
- §3 "Space": the UI and band numbers -> a link to `LAYOUT.md` §1; "the frame-0 payoff line sits above them" -> frame
  0 shows the first spoken line, never a title over it. Clash (row 11, the owner's words, retired 2026-10-28) and
  pointer (row 19).
- §7: the worm's-eye horizon "~0.78 H" -> 0.58-0.64 H (the feet above y 1250). Clash (row 8).

**`look/LIFE_AND_DENSITY.md`**
- §4: the "you"'s "head top ~y 1380-1560" -> its body may run under the bottom UI, its head stays above it (head top y
  <= ~1380). Clash (row 10: G5 §2's "key information never" under the UI, with VT §1's distinction).
- §8: the band's and the UI zones' numbers -> links to `LAYOUT.md` §1. Pointer (row 19).

**`QA.md`** (v1-era, its banner only)
- The banner's link for framecheck's UI zones: G5 §2 -> `look/LAYOUT.md` §1. Pointer.

**`/home/user/Test-/HANDOFF.md`**
- The doc map lists `look/LAYOUT.md`; CINEMATIC_GUIDE described as "shot recipes". Pointer (a stale summary otherwise).

## For the orchestrator to check
- **A new open call for the owner:** the thin-line twinkle against CRAFT §c's 1.2-1.6 px hairlines (above). It is not
  in DIRECTION's list of open calls (that list is the six already asked); ask it with them, or decide it is ours to fix.
- **Numbers changed by the ladder, not by the owner:** LD §4's head top (<= ~1380), CG S4's figure (feet above y 1480),
  CS K7's flat zone; each follows G5 §2's "key information never under the UI" or DIRECTION rule 10's band. Worth the
  owner's eye in the next look clip.
- **Not in DIRECTION's list but open in the study:** Pip's frequency (a few spots or most exterior shots) and the
  cover's case and Pip on the cover (STUDY.md §9 decision 5; `LAYOUT.md` §5, §8); the left-third hero (CO question 2)
  and frontal landmarks against rule 2's "flat elevation" (PE question 2), both marked open in `LAYOUT.md` §8.

## Not changed, and why
- **`OWNER_PLAYBOOK.md`:** the owner's words are already captured there (the brief: don't touch).
- **Each video's own docs (`v1/`-`v4/`):** v2's STYLE §1, §3, §4, §7 (its frame-0 block, small words, "never quiet"
  bottom third, Pip's seats), v2's THROUGHLINE seats and v3's camera plan stay as they are; `LAYOUT.md` §7 calls their
  clashing values history.
- **`look/palettes.json` and the board:** the three palettes are proposals (PALETTE.md's new section).
- **Code and tooling (`video/src`, `video/scripts`), flagged in `LAYOUT.md` §1, §7, §8:** theme.ts `safe.action` (x
  90-990, y 200-1480) and `skyCaption`'s clip window (y 280-570); `scripts/capcheck.py` (y 280-570); `framecheck.py`'s
  `--caption-band 280,600` and no ad rail; `lib/depth.ts` `PARALLAX_K` (1/z, which breaks CS §4's 1.8x: a code-vs-doc
  fix with no owner call, STUDY.md §7) and `planeLod`'s `minFeature` 0 px on plane 0 (`details.md` §3: twinkle). One
  constant the checks read is the tooling lane's.
- **The v1-era docs** (`ENGINE.md`'s table of the code's constants, `CINE.md`, `BRIEF.md`, `style_bible*.md`,
  `scenes/`): API and measurements under their banner; `LAYOUT.md` never cites them for layout (row 18).
- **`look/research/` (e.g. `vertical.md`):** the evidence, cited, not edited.
- **`G3_ANIMATIC.md`:** its "3 planes" is the board's staging, as STORYBOARD_STYLE now says (row 5): no clash.
- **`EDGES.md`:** it already says the code paints past the top since 2026-10-25 (row 17).
- **CRAFT §b's tier-C contrast cap (<= 7):** raising it for the near patchwork is the "low poly" call (decision 3).
- **Every proposal outside the owner's decisions** stays in `STUDY.md`, `LAYOUT.md` §8 and PALETTE's proposal section,
  never in a rule: the near frame, the quiet field measured, the far anchor, the poster frame, off-centre vanishing
  points, frontal landmarks, the hero big and loud, the finish ladder (P2), nature's ladder (P3), the chroma plan and
  sibling tints (P4), the sky's paper preset, the cover template; the look clip (STUDY.md §10) shows them to the owner.
