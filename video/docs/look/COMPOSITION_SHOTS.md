# COMPOSITION_SHOTS: the composition library, ranked (frames, moves, joins), with the guidelines for our 9:16 films

> **In five lines.**
> 1. **One library of 103 entries:** 67 frames (how a shot is composed), 17 moves (inside a shot), 19 joins (between shots); the owner's 58 first, in his reels' order and names (his 41 ideas and T, plus the 2 treatments, 9 moves and 5 joins his reels show), our 45 after, labelled by strand. Thirteen frames are also the frame's grammar, kept in EVERY shot (§0.3a), his seven first: the rule of thirds, the golden section, the foreground and the soft near layer, unbalanced, the atmospheric layers, the one colour accent.
> 2. **Ranked by three blind judges (attention, story, fit; 1-5 each) with one rule for all:** CORE = a sum of 12-15 with no lens under 3, SITUATIONAL = 9-11 with none under 2, RARE = 6-8, NOT FOR US = 5 or less (§0.2); of the 101 ranked (N2 and N5 are rules only): CORE 32, SITUATIONAL 35, RARE 18, NOT FOR US 16; † marks the 55 one judge-point from another tier, the owner's to settle.
> 3. **His 41 ideas and T:** 12 CORE (leading lines, the vanishing point, the tunnel, the frame within a frame, negative space, scale, the pattern with one break, the lit opening, the closed vista, the colour accent, the held frame the subject travels, the line first), 16 SITUATIONAL, 12 RARE, 2 NOT FOR US (the golden spiral, balance); his ideas are 19 of the 32 CORE tools, and the 14 that land low head Part 0, each to overrule in one line (three of them, the thirds, the foreground and the soft near layer, are in every shot all the same).
> 4. **The guidelines (Part 0b):** a one-screen planning card (the pass, the five numbers every shot keeps, the join by what changes, the dose per film); which tools by beat (with their recipes) and by emotion; the rhythm (shots >= 3.5 s on average, 6-9 lead devices in a 40 s film, a change on the subject every 1.5-3 s; on one continuous camera each framing stop counts as a shot); the grammar that ties each frame to its move and its join; 22 numbered rules.
> 5. **The detail, in sub-files:** every entry with its reference and its numbers, `composition/catalogue_detail.md`; the recipes SR1-SR25 in full, `composition/recipes.md` (their index: Part 2 §2); the clashes with other docs, `composition/library_clashes.md`; the sheet `composition/library_sheet.png`.

The owner (2026-10-30), after the first shot library left most of his reference ideas out: "Wait how many of the ones
mentioned in the references you actually took ? I don’t see leading lines or vanishing point or frankly most of the
references are not there?" / "I didn’t get once again why you ignored all my references and came up with yours?" / "I
think overall I would expect you to break down all mine references and whatever you research on other composition
strategies and on what makes a composition to be engaging and capturing attention and like a a super moden modern
cinematography / And then we would rank them and have a library and a set of guidelines on when to use one or other and
how animations and transitions fit into this" / "Yeah this plan sounds good remember to parallelize work". Earlier the
same day: "When we settle on the composition library recipes and overall approach we need to evaluate our visual script
for Helsinki story to figure out how to compose each scene and how we animate and move within a scene and from scene to
scene". The playbook since: "The owner's references are the SPINE of a distillation; ours come second, labelled."

**What this is.** Part 0 ranks the 103 entries of `composition/catalogue.json` (how it was built, merged and
deduplicated: `composition/catalogue_notes.md`) by three blind judges (`composition/judges/attention.json`,
`story.json`, `fit.json`); Part 0b turns the judges' notes, the research and `composition/principles.json` (130 rules
that hold for every shot) into guidelines; Part 2 gives the frame in numbers and the recipes' index. The catalogue in
detail, the recipes in full and the clashes are sub-files (`composition/catalogue_detail.md`, `composition/recipes.md`,
`composition/library_clashes.md`), cut from this page on 2026-10-30 (`composition/critique_library.md`, its Fix pass);
video 4's composition-and-motion pass (`video/docs/v4/visual/COMPOSITION_PASS.md`) was its first use, and its 15 library
gaps are settled here. The evidence stays in the research notes: `composition/reels.md` (the owner's five reels, frames in `reels_sheet.jpg`),
`composition/attention.md`, `composition/modern.md`, `composition/motion.md`, `composition/cinema.md`,
`composition/vertical.md`, `organic/composition.md`.

**Rank and status.** A look doc on DIRECTION's ladder: under the owner's words (the playbook, `docs/vN/OWNER_NOTES.md`),
DIRECTION, CRAFT, PIPELINE_V2 and the gate specs (`G3_ANIMATIC.md`, `G5_BLOCKING.md`); between look docs each wins on its
topic (`LAYOUT.md` the zones and each shot type's framing, `CINEMATIC_GUIDE.md` S1-S5 and the camera moves,
`COZY_AND_SCALE.md` the cozy and scale doses, `SOUND_SYNC.md` sound). This page's topic: which frame, move and join a
shot uses, and the grammar between them. A number quoted from those docs must match them; where this page differs,
`composition/library_clashes.md` names the doc that wins, and no other doc is edited from here. What is not already in a doc in force is a
proposal until the owner approves the library; its first use is video 4's composition-and-motion pass (the playbook:
"Every film's visual script gets a composition-and-motion pass from the shot library"). We learn principles from the
references: nothing traced, copied or used as an input, no creator named.

**Conventions.** Px at 1080 x 1920, y down (W = 1080, H = 1920); time in seconds and 60 fps frames (1 f = 16.7 ms, 6 f
= 0.1 s, 30 f = 0.5 s, 60 f = 1 s). **A·S·F** = the attention, story and fit judges' scores († one judge-point from
another tier: §0.2). **The golden box** = the focal's home, x 413-667, y 951-1187 (on the feed its heart is x 436-644,
y 951-1168); **the read zone** = the stage above the ad-cut floor, y 600-1250 (`composition/reels.md` §3). "The feed" = the owner's
Instagram Reels tab (it shows x 98-982 of our frame, 1.22x larger than a review MP4 fit to the screen). "The 'you'" =
the film's one stand-in for the viewer. **Scene 1** = v2's canal opening at King's Cross on an October dusk (still v6,
the lit doorway with her silhouette in it); **video 4** = Helsinki's AI-heated homes on a snowy night (its G2.5 visual
script: 12 shots S1-S12 on one continuous camera, 42.24 s; the warm water the thread, the one window its home spot, the
giant computer by the harbour). Carriers A-F are `CRAFT.md` §a's (A push-through, B thread match, C continuous camera, D
object carry or wipe, E card flip, F plain cut). **Codes:** the owner's ideas A1-E11 and T, his reels' moves RM1-RM9,
joins RJ1-RJ4 and treatments X1-X3 (RM8b is RM8's second half, the build); ours: frames N, M3, Z1-Z4, S2, K8, moves
I, joins J and T2 (Arcane's pinned anchor, not his T), rejects X4-X11; each of ours is tagged by its strand: [c]
classic composition and film (`composition/cinema.md`), [v] the vertical frame (`composition/vertical.md`), [m] modern
cinematography and motion design (`composition/modern.md`, `composition/motion.md`), [d] our own docs and the Arcane
study (`LAYOUT.md`, `COZY_AND_SCALE.md`, `CINEMATIC_GUIDE.md`, `CRAFT.md`, `STORYBOARD_STYLE.md`). Merged codes (`catalogue_notes.md` §2): N4 -> B10, N8 -> B8, N10 -> E3 (its motion
I12), I1 -> RM7, I2 -> RM5, I3 -> RM4, I7 -> RM3, I8 -> RM1, I9 -> RM2, I10 -> RM8 and RM8b, J1 -> RJ4, J12 -> RJ3,
J14 -> RJ2.
Paths are from `video/docs/look/` unless they start with `video/`. **Words:** the notan = the picture as 2-3 flat values
seen at a squint; counterchange = dark against light at the one spot; the steelyard = a big soft mass balancing a small
strong one farther out; a repoussoir = a framing mass at one side edge; affinity and contrast = calm (level lines, close
values, slow) against intense (diagonals, hard steps, jumps in size); the drop = the eye's way down from the captions to
the focal; the pivot = the subject held still on screen while the world moves past it.

## PART 0. THE LIBRARY, RANKED

### 0.1 The owner's override: his ideas that land RARE or NOT FOR US

Fourteen of his 41 ideas, and six more things his reels show, land in the two lower tiers. **To overrule one, one line
is enough** ("A4 SITUATIONAL", "keep D3", "B6 CORE"): the entry moves to that tier here and its recipe variants come back
(A4: SR6 and SR24; D3: SR23's frame). The six under the rule line are settled by a doc in force as well; moving one
changes that doc too. Three of the fourteen (A1, C2, E5) are in every shot all the same, as the frame's grammar (§0.3a):
only their use as a shot's lead is rare. Attention 1 means "does nothing for the eye" or "hurts"; for A1, A3, A5 and C2
it is the first. † = one judge-point from another tier (§0.2).

| his idea | tier | A·S·F | why it lands there | what we use instead |
|---|---|---|---|---|
| A1 Rule of thirds | **EVERY SHOT** (rule 6) · as a lead: RARE | 1·3·3 | in every shot as rule 6 (2:1 proportions); as a placement, no gaze evidence: on his feed the thirds fall on the subject axis's edges (x 393 / 687) and the crossings sit 40 px under the band and 30 px under the read zone | A2's golden box and N1's centre for the subject |
| A3 Golden section, nested | RARE | 1·3·3 | the big form and the small subject at its foot are two calls at phone size | D2 scale (CORE), the subject at the giant's foot (SR15) |
| A5 Golden triangle | RARE | 1·2·3† | its two feet ~226 px apart split the eye, and the slope outpulls both | C3 for cause and effect on a slope; N14 or J11 at the turn |
| B5 Parallel lines | RARE | 2·3·3† | the eye does not ride lines; sideways travel is the expensive direction in 9:16 | B1 (CORE) when lines must deliver the eye; RM3 when the travel is the story |
| B6 Diagonal | RARE | 2·3·3† | contrast, for the turn or a climb only, never in a cozy beat | the turn's CORE tools N14 and J11; B6 for the film's one climb |
| B7 Double diagonal | RARE | 2·2·2† | it needs a raised view whose arms cross the band; one high-angle slot a film | B2 (CORE) for a meeting place at eye level |
| B12 Spiral composition | RARE | 3·2·2 | the same raised view, once a film | B8 at eye level; C1 and E2 to gather the eye in |
| B13 Circular | RARE | 3·3·2† | as a round opening it IS C1; as a ring it needs a raised camera | C1 (CORE) with a round window |
| C2 Foreground | **EVERY SHOT** (rule 10) · as a lead: RARE | 1·2·4 | in every shot as rule 10, the hint at the edges (the playbook: "a small, subtle hint"); as a framing device the near layer lies under the name block and adds a named object | B10 or N13 to frame |
| D5 Pyramid | RARE | 2·3·3† | one narrow job: a cause above many | D7's one break (CORE) for "this one" and "how many" |
| D6 Juxtaposition | RARE | 2·3·3† | two fields in one frame are two calls unless the subject sits on the seam | N14 (CORE): the same frame before and after, in sequence |
| E5 A soft near layer | **EVERY SHOT** (rule 10) · as a lead: RARE | 2·2·4† | in every shot as rule 10, softness by value (within 8 L*); as a shot's device a restraint rather than a tool, under the name block | E6 for depth |
| A4 Golden spiral / golden ratio | NOT FOR US | 1·2·2† | no gaze evidence; fitted to our frame its pole lands in the band or under the read zone; scaled to the subject it is a curve the eye does not ride | the sweep that ends on the focal: B1 or B8 with RM1 (SR24) |
| D3 Balance | NOT FOR US | 1·2·2† | two equal masses are two equal calls (DIRECTION 2: one place to look) | D4's one soft counterweight; A7 for a formal beat |
| *also in his reels, and settled by a doc in force:* | | | | |
| RJ2 The hard cut | RARE | 3·3·2† | DIRECTION 1: at most 2 a film, each on a "But" turn | the carried joins (RJ4, J2, J3) |
| X1 Focus and motion blur | NOT FOR US | 2·1·1 | DIRECTION 5: no blur (a near framing object's one optical blur, 2.2-3 px, aside) | softness by value (E5), the light pull (I11) |
| X2 A title over the shot | NOT FOR US | 1·1·1 | the playbook: never a title over the captions; the core line goes on the cover | the captions; the cover |
| RM9 The handheld pass | NOT FOR US | 1·1·1 | DIRECTION 8: every hold is locked or a slow float | RM7, RM5 |
| RJ1 The black line card | NOT FOR US | 1·1·1 | DIRECTION 1: every join carries something | the carried joins; his line-first lives on as RM8 |
| X3 The fade | NOT FOR US | 1·1·1 | DIRECTION 8: no opacity fades (a declared time-passing dissolve aside: G3_ANIMATIC §4) | J11 for time passing; RM8's un-draw |

### 0.2 The tier rule

Three judges scored all 103 entries, blind to each other and to the earlier scores in `catalogue_prior.json` (the
attention judge started from `composition/attention.md` §7's scores of his 41 and moved 10 of them: its notes); each read
`catalogue.json` and its own grounding docs. **ATTENTION:** does it stop a thumb and hold the eye at phone size in a
voice-led film (the first 3 s weigh most; a subtle effect counts as none). **STORY:** does it make one subject plain at
a time, carry the thread across a join and explain without clutter (grounded in DIRECTION 1-3, `composition/modern.md`'s
explainer evidence M12-M28 and `composition/cinema.md`). **FIT:** does it suit our 9:16 frame and crop, our engine (and
what it costs to build) and our look. Each scale: 5 = among our strongest, 4 = strong for particular beats, 3 = useful
in one narrow beat or an indirect help, 2 = marginal, 1 = does nothing or hurts. One rule, applied the same way to every
entry:

| tier | the sum of the three, of 15 (the mean) | and the lowest lens | what it means |
|---|---|---|---|
| **CORE** | 12-15 (>= 4.0) | >= 3 | the default tools: every film draws on them, each at its dose |
| **SITUATIONAL** | 9-11 (3.0-3.67) with no lens under 2, or 12-15 with a lens at 2 | | by beat or emotion, under the condition named |
| **RARE** | 6-8 (2.0-2.67), or 9-11 with a lens at 1 | | once in a while, under the condition named |
| **NOT FOR US** | 5 or less (under 2.0) | | not used, for the reason named |

No entry falls in the two guard cases (12 or more with a lens at 2; 9-11 with a lens at 1), so the lowest lens never
had to act. **Edges (†):** 55 of the 101 ranked entries (30 of his 41 ideas) are one judge-point in one lens from another
tier (one judge per lens, no second read: leading lines, 3·4·5, are CORE by a single point); an edge tier is the owner's
to settle in one line, as an override. **Modern cinematography is no fourth lens:** `composition/modern.md`'s 0-15
scores rate its own principles M1-M29, not these entries (A1 carries a 15 only through M1, centre-weighted framing, which
is not the thirds), so beside A·S·F they would mislead; modern practice entered as entries (tag [m]) and through the
story judge's grounding. **A tier says how readily to reach for a tool, not how often:** the dose stays with the entry
(the one big move is CORE and once a film). Nothing was moved by hand. Where the owner's words set a dose (the cozy home
>= 50 % of the runtime, one big move a film, every hold locked or floating, the loop, the "you" near the camera), that
dose stands whatever the tier, and Part 0b names the tools that carry it. In each table the owner's entries come first,
in his reels' order; ours follow under *ours*, by mean. **Recipes:** the SR recipes whose Device line names the entry;
(v) a named variant.

### 0.3a Used in every shot: the frame's grammar (not ranked)

These are in every shot whatever leads it (the playbook: every used item visible in the output); the tier tables below
rank each one only as a shot's LEAD device. Each row: USED, every shot, by the rule named (Part 0b §4).

| # | name | in every shot as | rule | as a shot's lead |
|---|---|---|---|---|
| A1 | Rule of thirds | the thirds as proportions: one quiet mass about twice the other (sky to ground 2:1), never two equal halves; the horizon off the half | 6 | RARE |
| A2 | Golden section | the golden box, the focal's home: x 413-667, y 951-1187 | 3 | SITUATIONAL |
| C2, E5 | Foreground; a soft near layer | the near hint: >= 2 things cut by the edges, the near frame <= 2 props with its top at y 1450-1650, soft by value (within 8 L* of its mass) | 10 | RARE |
| D4 | Unbalanced | one soft counterweight >= 300 px out on the far side (x < 240 or > 840), its pull < 50 % of the focal's, never in the lower right | 9 | SITUATIONAL |
| E6 | Atmospheric layers | air by distance: each farther plane a step nearer the sky's value (`CRAFT.md` §f.2: the mix 0/12/22/40/65 %) | 2 | SITUATIONAL |
| E8 | One colour accent on the subject | the scene's one hot accent (C* >= 50, ~3-5 % of the frame) only at the focal | 4 | CORE |
| *ours* | | | | |
| N1 | The centre, the first look [c, v] | the focal re-found near (540, 960) after every cut | 3 | CORE |
| N2 | The stage square [c, v] | the words in the top square (the band y 290-600), the story in the stage square (y 600-1520), the band one flat field | 2 | not ranked: a rule (3·4·5) |
| N3 | The horizon off the half [c] | one setup per set: A, the horizon y 1150-1300, or B, y 690-860 | 6 | SITUATIONAL |
| N5 | Headroom: the drop [c, v] | the focal 300-450 px under the caption block's foot (y 556), 650 at most | 3 | not ranked: a rule (4·4·4) |
| N6 | Depth stacked up the frame [c, v] | 4-6 planes, the near low, the far high, overlapping >= ~10 px | 2 | SITUATIONAL |
| N7 | Figure and ground [c] | the 3-value notan drawn first; the focal's step >= 65 L* | 5 | CORE |

### 0.3 Frames (65 ranked; N2 and N5 are rules only, §0.3a): CORE 17, SITUATIONAL 24, RARE 16, NOT FOR US 8

**CORE** (17: the owner's 12, ours 5)

| # | name | A·S·F | mean | use it when (the condition, the dose) | move -> join | recipes |
|---|---|---|---|---|---|---|
| B1 | Leading lines | 3·4·5† | 4.00 | a way in, an arrival: 2-3 legs of >= 150 px at 40-60 degrees (in a side-on view level and vertical legs: rule 8) ending within 40 px of the focal's box, AT the story light (the lines lead, the light decides) | RM1, RM4 -> J2, J3 | SR3, SR7, SR24, SR25 |
| B2 | Vanishing point / one point | 4·4·4† | 4.00 | a street, a quay, a pier, a hall that leads to one place: the vanishing point on the subject (within 60 px) or hidden behind it, closed by one object (E7) | RM4, RM1 -> RJ4, J2 | SR3, SR7 |
| B4 | Tunnel | 4·4·4† | 4.00 | passage and promise: a tall portal, its sides in the gutters through the band, its lit far opening 15-25 % at (540, 950-1100): a push-through waiting to happen | RM4 -> J2 | SR3, SR17 |
| C1 | Frame within a frame | 4·5·5 | 4.67 | "look in here", a threshold: one opening 15-30 % of the frame on the axis, its aperture >= 10 L* off the rim, a 150-300 px figure dark inside | RM7 + RM1, RM4, I11 -> J2, J3 | SR2, SR4, SR6, SR8, SR17 |
| D1 | Negative space | 3·5·5† | 4.33 | a breather, a key line, time passing: the subject 130-220 px at the foot of a 60-80 % patterned field (the sky with the band); never the hook's frame | RM7, RM5 -> J11, RJ4 | SR16, SR18 |
| D2 | Scale | 4·4·4† | 4.00 | awe, 1-2 a film: the giant >= 0.7 H (its full height cut by the top: `LAYOUT.md` §2 K7) and >= 10:1 over a 130-220 px figure low near the axis | I5, I4 -> J2 back (in by RJ2 only on a "But") | SR14, SR15, SR17 |
| D7 | Patterns / repetition | 5·5·4 | 4.67 | "this one" or "how many": one texture (+-6 L*) with ONE break, the call, at (413-667, 860-1100), lighting on its word | RM6, RM8b, I11 -> J4, J2 | SR8, SR21, SR25 |
| E2 | The lit opening | 5·5·5 | 5.00 | the subject's moment, home, a destination: the aperture L* >= 95, the figure L* <= 28 (a step >= 65 L*), no other light within 10 L* | RM7, I11 -> J2, J4 | SR2, SR6, SR7, SR8, SR25 |
| E7 | The closed vista | 4·4·4† | 4.00 | a destination: the sight line's vanishing point on the one object that ends it (x 540-700, y 950-1150), never open sky | RM4 -> J2, J3 | SR3, SR7 |
| E8 | One colour accent on the subject | 4·5·5 | 4.67 | every focal (§0.3a): one hot accent (C* >= 50, ~3-5 % of the frame) only on the subject, travelling with the thread | RM8b, RM6 -> J4 | SR1, SR8, SR24, SR25 |
| E9 | The camera holds; the subject travels the device's line | 5·5·5 | 5.00 | the default held shot: the frame built as a path whose end is in the golden box | RM1 -> J7, J2 | SR6, SR7, SR9, SR20, SR23, SR25 |
| T | The line first, then the world under it | 5·5·5 | 5.00 | frame 0 of every film, its drawing (never counted as a lead: Part 0b §2): the subject's line draws on in the clean pen, then the colour floods in over it and the line ends under its fill (no outline stays), the light flooding in from its source, >= 1 s; after frame 0 only where the drawing is the beat (DIRECTION 4, 8, 9) | RM8 -> RJ3 | SR1, SR22 |
| *ours* | | | | | | |
| N7 | Figure and ground: notan and counterchange [c] | 5·5·5 | 5.00 | every shot's notan (§0.3a, rule 5); as the lead, the hook and the proof: the subject one closed shape a viewer names at 0.25 scale, its step >= 65 L* | RM8, I11 -> J4 | SR1, SR2, SR6, SR9, SR22 |
| N1 | The centre, the first look [c, v] | 5·5·4 | 4.67 | re-found after every cut (§0.3a, rule 3); as the lead, the hook, the close, the proof: the focal within 130 px of x 540 at y 951-1006 | RM7, RM4 -> RJ4, J2, J3 | SR1, SR12, SR22 |
| N9 | Isolation (the close) [c] | 5·4·4 | 4.33 | the personal beat, a mechanism's detail: one object (a mug, a radiator, a phone) >= 650 px on one quiet backing, a 30-60 px calm ring; never a face, a building or a wall | RM4, then RM7 -> RJ4, J2 | SR12, SR22 |
| N14 | The deliberate match [d, c] | 4·5·4 | 4.33 | before and after, the callback, the turn told by light: the same frame with ONE change at the focal | RM7 -> J3, J4, J11, RJ3 | SR19, SR24 |
| Z4 | The insert (the paper) [c] | 4·4·4† | 4.00 | the proof: the paper straight-on, >= 60 % of the stage wide, one number 120-160 px, words >= 56 px | RM8 -> J13, J10, J2 | SR22 |

**SITUATIONAL** (24: the owner's 16, ours 8)

| # | name | A·S·F | mean | use it when (the condition, the dose) | move -> join | recipes |
|---|---|---|---|---|---|---|
| A2 | Golden section (the phi grid) | 3·4·4† | 3.67 | EVERY SHOT as rule 3, the golden box (§0.3a); as the lead, a lone thing on a phi line where the dead centre would read formal | any (it lands in the box) -> J3, J4 | SR1, SR6, SR8, SR12, SR20, SR21, SR25 |
| A6 | Cross | 3·4·3 | 3.33 | an upright standing its ground: one vertical crossing the horizon at x 413-667, no other vertical near it | I5, RM7 -> J3, J11 | SR9, SR15 |
| A7 | Symmetry | 4·4·3† | 3.67 | a formal, settled beat (an answer, the end): the axis x 540, halves within +-5 %; once a film, two at most; broken once at the axis on the turn | RM7, RM4 on the axis -> J3, RJ3 | SR23 |
| B3 | Radiating | 3·3·3† | 3.00 | everything points at one cause: 5-9 rays tone-on-tone meeting on the subject in the golden box; no ray across the band | RM7, I11 -> J11, J4 | SR3, SR15, SR21 |
| B8 | S-curve | 2·3·4† | 3.00 | a calm way in by water or path: 2-3 bends, or zigzag legs >= 150 px (side-on, level and vertical: rule 8), ending on the focal, the thread travelling it | RM1, I6 -> J7 | SR7 (v), SR11, SR24, SR25 |
| B9 | C-shape | 2·3·4† | 3.00 | shelter from a raised view: the BALCONY curve in at y 600-700, out at y 860-1060, the subject inside it | RM7, RM5 -> J3, RJ4 | SR5 |
| B10 | L-shape | 2·3·4† | 3.00 | the cozy frame: one tall side <= 216 px cut by the top, flat through the band, plus the ground line; the focal toward its inner corner | RM7, RM5 -> J2, J8 | SR2, SR3, SR4 |
| B11 | V-shape | 3·3·3† | 3.00 | a canyon funnelling to one point (the arms below y 600, meeting within 60 px of the focal); inverted, the turn | I5 -> RJ4, J2 (inverted, in by RJ2 on the turn) | SR3, SR18 |
| C3 | Level change | 2·4·4† | 3.33 | cause and effect in one view: the upper level y 700-950, the lower y 1150-1450, a 30-45 degree stair between; the light hands the focal over (I11) | I5, I6, I11 -> RJ4 | SR11 |
| D4 | Unbalanced (the steelyard) | 2·3·4† | 3.00 | EVERY SHOT as rule 9 (§0.3a); as the lead, the subject on the axis and one soft mass >= 300 px out, high (the hero cloud), never lower right | RM5 -> any | SR2, SR9, SR16, SR25 |
| E1 | One small figure where the lines meet | 4·3·4† | 3.67 | a human anchor: one 130-220 px figure from behind at the device's focal, its feet above y 1480 | RM1 -> J2, J6 | SR3, SR7, SR9, SR14, SR15 |
| E3 | Stillness against motion | 3·3·4 | 3.33 | isolation, time passing: the subject held within +-40 px while a flow (never one mover) passes in one band behind it | RM2, I12 -> RJ4 | SR9, SR10, SR17 |
| E4 | Looking room | 3·4·4† | 3.67 | a facing or moving figure: 1.5-2x room in front (right-facing at x <= 410 below y 860); from behind, the room is up the frame | RM3 -> J6 | SR9, SR10, SR14 |
| E6 | Atmospheric layers | 3·3·5† | 3.67 | EVERY exterior as `CRAFT.md` §f.2 (§0.3a); as the lead, the scale wides and breathers, 3-5 layers paler with distance | RM5, I4, I6 -> J11 | SR2, SR14, SR16, SR17 |
| E10 | The near 'you' over the shoulder | 2·4·5† | 3.67 | the viewer's stake: one whole 130-220 px "you" from behind at x 130-380 facing right (or 700-830 left), tier B, its sightline through the focal's box | RM7 -> J6 | SR13, SR14 |
| E11 | The POV hook | 4·4·3† | 3.67 | "for you": the hand from the bottom LEFT, the thing in hand at (300-600, 1000-1250), lower (y 1310-1480) where the thread's run crosses that box (the thread wins), the effect landing in it on its word | RM8b -> J2, J4 | SR13 |
| *ours* | | | | | | |
| N13 | Refuge and prospect [d] | 3·3·5† | 3.67 | the cozy home place: refuge 35-55 % on >= 2 edges, one opening 15-30 % read in y 600-1250, the subject facing it | RM7, RM5 -> J2 | SR4 |
| Z3 | The medium [c] | 3·4·4† | 3.67 | the mechanism, the explainer's working size: the subject box 270-460 px wide, one backing, <= 2 props | RM7, RM8 -> RJ4, J3 | SR10, SR11, SR20, SR21 |
| N6 | Depth stacked up the frame (the three distances) [c, v] | 2·3·5† | 3.33 | EVERY exterior as rule 2 (§0.3a); as the lead, the vista and the scale beats | RM5, I4, I6 -> RJ4 | SR2, SR14, SR15, SR16, SR17 |
| Z2 | The wide [c] | 2·4·4† | 3.33 | the home view: the subject 15-35 % of the height (290-670 px) in its place, the "you" near the camera | RM7, RM5, RM1 -> J2, J3, RJ4 | SR2, SR3, SR9, SR14 |
| N3 | The horizon off the half, and the line of heads [c] | 2·3·4† | 3.00 | EVERY exterior as rule 6, one setup per set (§0.3a); as the lead, the line of heads | RM7, RM5, I5 -> J3 | SR2, SR9, SR14 |
| N11 | The low angle (worm's-eye) [c, d] | 3·3·3† | 3.00 | power on the quantity, never on the thing under critique: camera ~0.3 m, horizon y 1114-1229, verticals parallel | I5 -> RJ4, J2 (in by RJ2 only on a "But") | SR15 |
| Z1 | The extreme wide [c, d] | 3·3·3† | 3.00 | the place and its scale, 1-2 a film, ~1.5-4 s: 5-7 planes, the "you" 130-220 px near the camera (S5's end 170-200), the scale from the world past every edge and tiny strangers 15-60 px | I4, I6 -> RJ4, RJ2 (on a "But", from the landed frame) | SR15, SR17 |
| S2 | The sun behind the roofline [d] | 4·2·3† | 3.00 | time passing or an ending held 2.5-3 s, once a film: a ~650 px disc at (580, 1060), the roofline from y ~1500, 3 values | RM7 -> J11, J4 | SR16 (v) |

**RARE** (16: the owner's 12, ours 4)

| # | name | A·S·F | mean | use it when (the condition, the dose) | move -> join | recipes |
|---|---|---|---|---|---|---|
| A1 | Rule of thirds | 1·3·3 | 2.33 | EVERY SHOT as rule 6, 2:1 proportions (§0.3a); as the lead, a subject placed ON a third: only the left-third landmark (S3, x 220-420) or a figure on x 360-420 / 660-720 facing in | RM7, RM3 -> J3, J7 | SR2, SR9, SR14, SR16, SR25 |
| A3 | Golden section, nested | 1·3·3 | 2.33 | a big form with the small subject at its foot, at (570, 1086) on the stage square, only when the small subject carries the light and the onset | RM4 -> J2 | SR14 (v), SR15 |
| A5 | Golden triangle | 1·2·3† | 2.00 | a slope with two related points on the stage square's 40.4-degree diagonal (feet (626, 987) and (454, 1133)); once, on a climb or the turn | RM1 -> J3, RJ4 home (in by RJ2 on the turn) | SR11, SR18 |
| B5 | Parallel lines | 2·3·3† | 2.67 | travel along parallels (steps, rails, a quay): 3-5 lines at 30-60 degrees below y 600, the camera riding them | RM3 -> J7 | SR10, SR11 |
| B6 | Diagonal | 2·3·3† | 2.67 | the turn or a climb: one 30-45 degree line rising to the focal and broken by it; never in a cozy beat | RM1, I5 -> J7, RJ4 (in by RJ2 on the turn) | SR11, SR18, SR20 |
| B7 | Double diagonal | 2·2·2† | 2.00 | a crossing seen from the balcony (35-55 degrees down), the X on the focal; once a film, in the high angle's one slot | RM7 -> RJ4 | SR5 (v) |
| B12 | Spiral composition | 3·2·2 | 2.33 | a stair or a roundabout curling in, from the balcony (once a film, the high angle's slot), or a spiral pathway at eye level | RM7, RM1 -> J2 | SR5 (v), SR24 (v) |
| B13 | Circular | 3·3·2† | 2.67 | a round opening 300-500 px across (then it works as C1), or a ring round the cause from a raised camera | RM7, RM4 -> J2, J3 | SR4 (v), SR21 (v) |
| C2 | Foreground | 1·2·4 | 2.33 | EVERY SHOT as rule 10, the hint (§0.3a); as the lead, a near layer as the shot's framing device (one side, <= 216 px) | RM5, I6 -> J8 | SR2, SR4, SR7 |
| D5 | Pyramid | 2·3·3† | 2.67 | one cause above many (the lineup): the base >= 540 px wide at y 1350-1520, the apex on the focal | RM7, RM4 -> J3 | SR21 |
| D6 | Juxtaposition | 2·3·3† | 2.67 | a comparison whose two states must be seen at once: one seam, the subject on it, the fields >= 13 L* apart (else N14, in sequence) | RM7 + RM1 (the front) -> J3, J8 | SR20 |
| E5 | A soft near layer | 2·2·4† | 2.67 | EVERY SHOT as rule 10, softness by value (§0.3a); as the lead, the near layer as the device | RM5 -> J8 | SR2, SR4, SR7 |
| *ours* | | | | | | |
| N12 | The high angle [c, d] | 2·3·3† | 2.67 | once a film, on a crowd, a pattern or a crossing, never one person: 35-55 degrees down, the lid's flat facade behind the band | RM7 -> RJ4 | SR5, SR21 |
| N15 | The off-balance [c] | 2·3·3† | 2.67 | the "But" turn only, once or twice a film: the focal at x 250-380 or 700-830, no counterweight (its jump the turn's declared exception: rule 19); the next beat back home | RM7 -> RJ4 or J3 home (in by RJ2) | SR18 |
| K8 | The light shaft and its pool [d] | 3·2·2 | 2.33 | one small life singled out by light in a vast interior, once: a shaft 108-151 px wide on the axis widening into a pool | RM7, RM6 -> J4 | SR15 (v) |
| M3 | Short-siding and the low quadrant [m] | 2·2·2† | 2.00 | once a film, on the turn, never cozy: the subject at x 130-300 facing out of the frame, or its head below y 1150 under >= 60 % quiet field | RM7 -> J3 or RJ4 home (in by RJ2) | SR18 (v) |

**NOT FOR US** (8: the owner's 4, ours 4)

| # | name | A·S·F | mean | why not | instead |
|---|---|---|---|---|---|
| A4 | Golden spiral / golden ratio | 1·2·2† | 1.67 | no gaze evidence; fitted to our frame its pole lands at or just under the band (y 482 / 655) or under the read zone (y 1265 / 1438); scaled to the subject it is a curve the eye does not ride | the sweep that ends on the focal: B1 or B8 with RM1 |
| D3 | Balance | 1·2·2† | 1.67 | two equal masses are two equal calls (DIRECTION 2: one place to look) | D4's one soft counterweight; A7 for a formal beat |
| X1 | Focus and motion blur | 2·1·1 | 1.33 | DIRECTION 5: no depth-of-field, bokeh, rack focus or motion blur (its one exception stays: a near framing object may take one optical blur, 2.2-3 px) | softness by value (E5), the light pull (I11) |
| X2 | A title over the shot | 1·1·1 | 1.00 | the playbook: never a title over the captions; the core line as a title goes on the cover | the captions in the band (rule 2); the cover |
| *ours* | | | | | |
| X7 | Isometric or axonometric world views [m] | 1·2·1 | 1.33 | one camera from a human viewpoint (DIRECTION 7) | a diagram as paper in the place (Z4) |
| X8 | Forced three-point perspective [d, m] | 2·1·1 | 1.33 | verticals stay parallel (CINEMATIC_GUIDE "Not for us"); lib/cine's towers draw it: use the parallel form | N11, the frame shifted, not tilted |
| X4 | The split screen [v] | 1·1·1 | 1.00 | two stacked stages split the eye (`composition/vertical.md` V10) | N14 in sequence, or D6's one seam |
| X5 | The Dutch tilt [c] | 1·1·1 | 1.00 | no roll (DIRECTION 8): a tilted horizon reads as a mistake in a tall frame | one diagonal in the world (B6), N15 |

### 0.4 Moves (17): CORE 8, SITUATIONAL 5, RARE 0, NOT FOR US 4

**CORE** (8: the owner's 5, ours 3; RM8b is the second half of RM8's entry)

| # | name | A·S·F | mean | use it when | the frames it serves |
|---|---|---|---|---|---|
| RM1 | The subject travels a held frame (E9 in motion) | 5·5·5 | 5.00 | the default life of a held shot: one subject travels the device's line and arrives, its onset on its word | E9, B1, B2, B8, C1, E1, D6 |
| RM4 | A slow push (the push-in) | 4·5·4 | 4.33 | "this matters": a visible push toward the subject (rule 18), one per beat at most, on its word | B1, B2, B4, C1, E7, N9, D5 |
| RM6 | A burst at the focal (the light event) | 5·4·4 | 4.33 | "now", arrival, wonder: a light flares or switches on at the focal of a held frame | D7, E2, B3, E8, S2, K8 |
| RM7 | The locked frame (the hold) | 3·4·5† | 4.00 | "look at this": the camera still, the subject's own event carries the time, slow life always running | most frames: A7, B2, C1, D1, D7, E2, N14 |
| RM8 | The line drawn live, then the world under it (T in motion) | 5·5·5 | 5.00 | frame 0, and after it only where the drawing is the beat (DIRECTION 8: a plan, a chart line in step with the voice): the line draws on with a pen tip, then the colour floods in over it and the line ends under its fill (no outline stays); an un-draw counts as a draw-on | T, N7, Z4 |
| RM8b | The build: pops, ticks, growth (RM8's second half; never a draw-on) | 5·5·5 | 5.00 | every explain and list beat: units pop, tick or grow on their words, by rows, never one by one for many (RM8's scores: one entry, two codes) | D7, D5, E8, E11 |
| *ours* | | | | | |
| I11 | The light pull (our focus pull) [m] | 5·5·4 | 4.67 | "look here now" without moving the camera; the turn told by light | C1, C3, D7, E2, B3, N14 |
| I4 | The pull-back: a story pull, and at scale the one big move (S5) [m, d] | 4·4·5 | 4.33 | a story pull: <= ~2.3x continuous, carrying its own event (rule 18), 0-2 a film, never next to the big move; at full scale it is S5, the film's one big move (the owner's pick), once, the world opening round the pivot | D2, Z1, E6, N6 |
| I12 | The pivot: the subject holds its screen spot [m, c] | 4·5·4 | 4.33 | every camera move: the subject holds its screen spot while the world slides past | E3, D2, and every camera move |

**SITUATIONAL** (5: the owner's 3, ours 2)

| # | name | A·S·F | mean | use it when | the frames it serves |
|---|---|---|---|---|---|
| RM2 | The world passes a still frame (E3 in motion) | 3·3·4 | 3.33 | isolation, time passing: one band of the world flows past a still subject (E3), sharp and slow | E3, A6, B5, D2 |
| RM3 | The camera rides the lines (the follow) | 3·4·3 | 3.33 | the travel is the story: the camera rides the lines or the mover and the frame's geometry holds still | B5, E4, A1 |
| RM5 | A slow pan, the drift (the parallax float) | 2·2·5† | 3.00 | a hold where depth should read: every plane drifts by its depth, the sky and the band not at all | C2, D1, D4, E5, E6, B10, N6 |
| *ours* | | | | | |
| I5 | The reveal tilt (and pan) [m, d] | 3·4·3 | 3.33 | wonder, "it keeps going", 1-2 a film: a tilt up (or down, into a place) over a tall thing | A6, D2, B11, C3, N11 |
| I6 | The crane: the rise-over (S1) [m, d] | 3·3·4 | 3.33 | arrival, "here it all is": the camera rises over a near wall (S1); the one big move when it is S1 | C2, C3, E6, N6, Z1 |

**RARE:** none.

**NOT FOR US** (4: the owner's 1, ours 3)

| # | name | A·S·F | mean | why not | instead |
|---|---|---|---|---|---|
| RM9 | The handheld pass | 1·1·1 | 1.00 | DIRECTION 8: every hold is locked or a slow float | RM7, RM5 |
| *ours* | | | | | |
| X6 | The dolly zoom [c] | 2·1·1 | 1.33 | a compound move and a feeling we never want (DIRECTION 8: one variable per move) | RM4 or I4, one variable each |
| X10 | The crash zoom and punch-ins on every key word [m] | 2·1·1 | 1.33 | an editing tic that spends the eye's orienting response on nothing (DIRECTION 8) | one RM4 on the payoff word |
| X9 | A zoom in a hold (the breathe, the per-shot push) [d] | 1·1·1 | 1.00 | DIRECTION's Retired list: no zoom, push or "breathe" in a hold; World push and ShotCam push: true are defaults to switch off | RM7 or RM5; RM4 only as a story move |

### 0.5 Joins (19): CORE 7, SITUATIONAL 6, RARE 2, NOT FOR US 4

**CORE** (7: the owner's 2, ours 5)

| # | name | A·S·F | mean | use it when | carrier |
|---|---|---|---|---|---|
| RJ3 | The loop back to the opening frame | 3·4·5† | 4.00 | the end of every film: the last frame un-builds to frame 0's drawing | the loop (un-build) |
| RJ4 | One continuous take, no cut | 4·5·5 | 4.67 | a small change inside one place: at a seam between two panels <= 1.15x or 150 px (Film's camera-continuous); a larger change is a move inside one panel (Part 0b §2 item 7) | C |
| *ours* | | | | | |
| J2 | The push-through, and the pull-out of an opening (carrier A) [m, d] | 5·5·5 | 5.00 | into a place or a thing seen through an opening in this shot; the pull-out is the push-through's second leg (0.6 s, 36 f, out-cubic), never a pull-back on its own (that is I4) | A |
| J3 | The match cut on shape (carrier B) [m, d] | 4·5·5 | 4.67 | to another place with the thread: one shape keeps its spot across a cut | B |
| J4 | The match cut on light and colour [m, d] | 5·4·4 | 4.33 | "the same light, somewhere else" or "the same place, later": the bright shape or the hot accent keeps its spot | B |
| J10 | The morph: one thing becomes the next [m] | 5·5·3† | 4.33 | "this IS that": one object becomes the next, staged; 0-2 a film, never two in a row | B or E |
| J11 | The light change: time passes in place [m, c] | 4·4·4† | 4.00 | time passes in place, or the key turns on a story beat: the same frame across a cut, its light changed; inside one panel a light change is no join (RM6 or I11) | B (the same frame matched) |

**SITUATIONAL** (6: the owner's 0, ours 6)

| # | name | A·S·F | mean | use it when | carrier |
|---|---|---|---|---|---|
| *ours* | | | | | |
| J6 | The eyeline: the look carries [m, c] | 3·4·4† | 3.67 | "what it sees": the "you" looks, the next view is the thing it looks at | A or C (a push along the sightline) |
| J7 | The carry (carrier D) [m, d] | 3·4·4† | 3.67 | "it went there": a traveller leaves one edge and enters the next shot from the opposite one | D |
| J15 | The sound bridge (the J-cut and the L-cut) [m] | 3·4·4† | 3.67 | a join into or out of a place with its own sound: its ambience leads or trails the picture | sound, under any carrier |
| J5 | The cut on action (a match on motion) [m] | 4·3·3 | 3.33 | "it keeps happening": a cut mid-action into the next size or angle | F (B if the thread crosses) |
| J8 | The wipe by a near mass (carrier D) [m, d] | 3·3·3† | 3.00 | a jump in scale or place that must not show, 0-2 a film: a near mass passes the lens | D |
| J13 | The card flip or swipe of the same paper (carrier E) [m, d] | 3·3·3† | 3.00 | paper only: the chart turns to its next page in place | E |

**RARE** (2: the owner's 1, ours 1)

| # | name | A·S·F | mean | use it when | carrier |
|---|---|---|---|---|---|
| RJ2 | The hard cut | 3·3·2† | 2.67 | the "But" turn only, at most 2 a film, the thread on both sides | F |
| *ours* | | | | | |
| T2 | Pinned-anchor jump cuts [d] | 3·3·2† | 2.67 | "meanwhile, still this", once: 2-4 quick cuts round one anchor pinned at its spot | B (each cut carries the anchor) |

**NOT FOR US** (4: the owner's 2, ours 2)

| # | name | A·S·F | mean | why not | instead |
|---|---|---|---|---|---|
| RJ1 | The hard cut through the black line card | 1·1·1 | 1.00 | a list's grammar: every join carries something (DIRECTION 1; the owner: "a bunch of shots put together") | a carried join (RJ4, J2, J3); the line-first lives on as RM8 |
| X3 | The fade-in under the lines (the opacity cross-fade) | 1·1·1 | 1.00 | DIRECTION 8: no opacity fades; a declared time-passing dissolve stays the one exception (G3_ANIMATIC §4) | J11 for time passing; RM8's un-draw for an overlay |
| *ours* | | | | | |
| J9 | The whip (a carry at speed) [m] | 2·2·1† | 1.67 | a whip hides its cut in blur and its speed fights "alive but calm" (unless declared: MR19) | J7 the carry, J8 the wipe |
| X11 | Effect transitions: spins, glitches, RGB splits and flashes [m] | 1·1·1 | 1.00 | a full-frame onset with no place to look (DIRECTION 4, 8); never > 3 flashes a second | a carried join |

### 0.6 Where the judges split

The 24 entries where the judges differ by 2 or more, and how each was settled (by the rule, never by hand: the low
lens names the risk and the entry's condition guards it): `composition/catalogue_detail.md` (the judges' splits).


## PART 0b. THE GUIDELINES

How to use the library in a film: the planning card (§0), which tools for which beat and feeling (§1), how the shots
follow each other (§2), how a frame, its move and its join fit together (§3), and the rules every shot keeps (§4).
Codes are Part 0's; a tier word in capitals names the tier of the codes after it.

### 0. The planning card (plan a film from this screen)

**The pass** (the playbook: "Every film's visual script gets a composition-and-motion pass from the shot library": for
each shot, which recipe it uses, how the camera and the action move WITHIN the shot, and how it moves to the next). It is
done on the visual script before G3, one row per shot in the camera plan: the beat's sentence, the lead (code, tier), its
recipe, the move (code, numbers), the join (code, carrier, timing).
1. **One recipe per shot, picked by its beat** (§1's recipes column; the index: Part 2 §2). A beat that fits no recipe
   is a story question before it is a picture question.
2. **One lead per shot, then the sequence** (§2): the lead is the first code in the shot's row; 6-9 different leads in
   10-12 shots; neighbours differ; the rests and the intensity curve. On one continuous camera each framing stop is a
   shot (§2 item 7).
3. **Every shot's move and every join's carrier** by §3's grammar (the frame's device holds its motion) and by what
   changes (the table below); then the doses (below).
4. **One camera per set:** W1 names setup A or B, the camera height and the horizon for each set, and every shot in the
   set keeps them; a light never moves between cuts; the key changes only on a story turn (SR19). One "you" (a drawing
   or POV) for the film, placed by the horizon-cut rule; Pip has a planned hiding spot in each exterior shot (>= 250 px
   from the focal; none in closes and charts).
5. **The focal's path and the value strip:** every shot's focal on one 1080 x 1920 sheet (most in the golden box; a jump
   over ~150 px between neighbours needs a carrier that moves the eye, 220 px at most: rule 19); then one 108 x 192 notan
   thumbnail per shot side by side: every focal found in under a second, one hot accent each, no two neighbours at the
   same intensity where the story changes between them.
6. **The phone check:** each chosen frame, and each move's start, middle and end frames, at the feed's crop with its
   interface drawn over it (x 98-982, the rails, the name block: V12): no key read under it, the focal in the clear window.

**The five numbers every shot keeps:**

| | the number | rule |
|---|---|---|
| the focal's home | within 130 px of x 540, at y 951-1006 (allowed y 860-1200), inside the golden box x 413-667, y 951-1187 | 3 |
| the drop | the focal 300-450 px under the caption block's foot (y 556), 650 at most; nothing calls in it | 3 |
| the band | y 290-600, one flat field at every frame; every top at y >= 620 | 2 |
| the read window | key reads in x 130-945 from y 600 to 860 and x 130-870 from y 860 to 1519; nothing to read at y >= 1519 | 1 |
| the onsets | ONE a beat, the subject's, started in the golden box; reads >= 0.5 s (30 f) apart; the picture ~0.1 s (6 f) ahead of its word | 14, 15 |

**The join, by what changes** (`composition/motion.md` §4.3 in Part 0's codes; §3 gives each one's move and timing):

| what changes at the join | the join (carrier) | its numbers |
|---|---|---|
| nothing but the sentence (the voice runs on, no pause) | RJ4 at rest (C) | the frame holds through the boundary; the next beat's onset on its first stressed word |
| closer or wider, the same place | a move inside the panel (C): RM4 in, I4 out, I5, I6, RM3; RJ4 at a seam | RJ4 <= 1.15x or 150 px over 1.4 s; a push <= 2x a panel |
| into a place seen through an opening in this one | J2 (A) | the opening 15-30 % of the frame, shown >= 0.5 s; 1.1 s (66 f) |
| to another place, with the thread | J3 or J4 (B) | the anchor within 150 px (190 for a light) and 1.5x; one change |
| following a traveller | J7 (D) | the same speed (within ~10 %) and direction; it enters within 0-2 f |
| a jump in scale or place that must not show | J8 (D) | >= 70 % of the stage covered on the cut frame; <= 0.5 s on screen |
| one thing becomes another | J10 (B or E) | staged, 0.4-0.8 s (24-48 f) |
| time passes, the same place | J11 (B) across a cut; inside a panel RM6 or I11 (no join) | a lamp 0.1-0.3 s (6-18 f); the sky 0.8-1.5 s (48-90 f) |
| to the proof (a chart, a number) | J13 (E), or J2 into a paper object | the flip's pre-tilt 0.62 s (37 f) before the cut, flat 0.45 s (27 f) after |
| the turn ("But") | RJ2 (F), or a push landing off-centre | at most 2 a film; size >= 20 % or the angle >= 30 degrees |
| the end, back to the start | RJ3 (the loop) | the un-build 0.5 s (30 f) onto frame 0's drawing |

**The dose per film** (a 40 s film of ~11 shots and ~10 joins; the owner's words and DIRECTION set the bounds, the tiers
the order of reach):

| tool | per film | set by |
|---|---|---|
| holds RM7 or RM5 | most shots; never > 1 s without a mover | DIRECTION 8 |
| RM1 the subject travels | the default life of a held shot (about half the shots) | `motion.md` §1.2: 11 of the reels' 25 shots |
| RM4 the story push | <= 1 per beat (2-4 a film), each on its word | DIRECTION 8 |
| RM6 / I11 the light events | 1-3 (a light change inside a held frame is one of these), each >= 0.5 s from other onsets | MR11 |
| RM8 the draw-on, and its un-draw | frame 0, then 0-2 where the drawing (or its undoing) is the beat | DIRECTION 8-9 |
| RM8b the build | one per explain or list beat: pieces every 0.1-0.2 s (6-12 f), separate reads >= 0.5 s apart, a pop's ~7 % overshoot at ~12 f | DIRECTION 8; MR23 |
| the one big move | exactly 1: S5 (I4 at scale) or S1 (I6), never both | DIRECTION 7; `CINEMATIC_GUIDE.md` rule 3 |
| I4, a story pull-back | 0-2, never next to the big move | rule 18 |
| I5 the tilt | 0-2 (the scale moments) | DIRECTION 7 |
| RM3 the follow | 0-2, never two in a row | §2 |
| RJ4 and the moves between stops (C) | most joins inside one place (3-5 in a film of several places; on one place, every join but the turn's) | `CRAFT.md` §a |
| J2 (A) | each entry into another place through an opening (1-3) | `CRAFT.md` §a |
| J3 / J4 (B) | the thread's joins between places (1-3) | `CRAFT.md` §a |
| J11 the light change across a cut | 0-2 (the key changes only on a story turn) | DIRECTION 5 |
| J10 the morph | 0-2, never two in a row | MR17 |
| J7 / J8 (D) | 0-2 each | MR16 |
| J13 (E) | paper only | `CRAFT.md` §a |
| RJ2 (F) | 0-2, each on a "But" | DIRECTION 1 |
| RJ3 the loop | 1 | DIRECTION 9 |
| sound | one bridge per join where the place sounds; 4-5 hard syncs in the hook, <= 1 per 10 s after, one release | `SOUND_SYNC.md` |
| frames | 6-9 leads (§2 item 3); 1-2 scale moments; S2 and S4 once each at most; A7 once (two at most); N12 once; N15 and M3 on the turn only | DIRECTION 7; `CINEMATIC_GUIDE.md` rule 5; `composition/cinema.md` C14 |

### 1. When to use which

**By story beat** (the lead first; CORE, then SITUATIONAL, then RARE; one lead per shot: §2 item 3):

| beat | recipes | the frame | the move inside the shot | the join out (carrier) | in numbers |
|---|---|---|---|---|---|
| **The hook, 0-3 s** (one continuous shot, never still) | SR1 (SR8 for one among many) | lead E2 or C1 (the subject in its lit opening; D7 for one among many), drawn by T as RM8; keeps N1, N7, E8: one subject >= 400 px wide on the axis. SITUATIONAL E11 (the effect lands in the hand), E10 | RM8 the draw-on, then RM7 or one RM4; RM6 the light on the payoff word | RJ4 (C) or J2 (A) into the subject; no cut before the hook lands | the first word at ~0.12 s; 0-0.4 s the words and the gist; 0.4-0.7 s (24-42 f) the bold onset peaks in the golden box; 1.2-1.7 s a second change; ~2 s reality overtakes |
| **Setup: the home place** | SR2-SR5, SR25 | CORE C1 + E2 (the opening), B1, B2 + E7 (the street, the path), D1 (the sky above). SITUATIONAL N13, B10 (the cozy frame), Z2, E10 and E4 (the "you" near, looking in), E6, N6, N3. RARE C2 as the framing | RM7 or RM5; RM1 the subject arrives along the line | J2 through the opening (A), J3 on the thread (B), RJ4 inside the place (C) | the home place >= 50 % of the runtime; the "you" 130-220 px; the focal within 150 px of the last shot's |
| **Explain: the mechanism** | SR8-SR11, SR20, SR25 | CORE E9 (the cause's path), D7 (one among many), Z4 (the paper), N9 (the detail). SITUATIONAL C3 (cause above, effect below), Z3, E3, B3 | RM1 along the cause's line; RM8b the build (one tick per unit of cause); I11 the light passes from cause to effect | J3 (B), J10 (this becomes that), RJ4 (C), J7 (D: the thread travels on) | each step held >= 0.4 s; separate reads >= 0.5 s (30 f) apart; a build's pieces every 0.1-0.2 s; one causal chain at a time |
| **The turn ("But")** | SR18, SR19 | CORE N14 (the same frame, one change), E2 (its light going out). SITUATIONAL A7 broken at the axis, B11 inverted. RARE N15, B6, M3 (once) | RM7: a hold of 0.5-1.0 s after the heaviest line; I11 (the key turns in the shot) | in by RJ2 (F, at most 2 a film) or a push landing off-centre; J11 (B) when the key turns across a cut | the one join where the focal may jump > 220 px (declared, within ~370 px: rule 19); the next beat returns to the focal home |
| **A reveal (scale)** | SR14-SR17 | CORE D2, B4 or C1 (the threshold), D1. SITUATIONAL Z1, N6, E6, E1 (the tiny anchor), N11 (on the quantity) | the one big move (I4 at scale, S5; or I6, S1), once, with I12 the pivot; I5 the tilt | in by RJ4, or RJ2 only on a "But"; J8 hides what a pull cannot show; out by J2 back home, or by RJ2 on a "But" from the landed frame | 1-2 scale moments a film, ~1.5-4 s each; never two scale wides in a row; a pull carries its own event |
| **A list or a comparison** | SR19-SR22 | CORE N14 (before and after, in sequence), D7 (one among many), Z4 (the number). RARE D6 (one seam), D5 (the lineup), T2 | RM7; RM8b the units pop by rows on their words (never one by one for forty); RM6 | J3 or J4 (B: ONE change across), J13 (E: the next page), J10 | the anchor within 150 px (190 for a light), its size within 1.5x |
| **The payoff** | SR24, SR23, SR13 | CORE E2 + E8 at the film's hardest step, N14 (the home view matched), Z4 (the number). SITUATIONAL E11 (in the hand), A7 | RM4 or RM6 on the payoff word; RM8 a chart line in step with the voice | in by J2, or I4 (a story pull, not the big move) back out to the matched frame | every signal on the payoff word, the picture ~0.1 s (6 f) ahead; the release in a voice pause >= 0.8 s (48 f) (`SOUND_SYNC.md`); held >= 1 s after a number lands |
| **The loop** | SR1 (as frame 0) | CORE T and N14: the last frame is frame 0's drawing state. SITUATIONAL A7 (a formal end) | RM7 | RJ3: the un-build 0.5 s (30 f), then the draw-on >= 1 s | the captions back to page 1 ~0.22 s (13 f) before the seam |

**By emotion:**

| feeling | the frame | the move | the join | how it reads, in numbers |
|---|---|---|---|---|
| **Wonder** (awe, "bigger than you thought") | CORE D2, B4. SITUATIONAL Z1, N11 (on the quantity), E6, N6, E1 | I5 up, I4 (S5), I6 (S1); RM6 a light event | RJ4; RJ2 only on a "But" (the scale jolt: the figure 6-20x smaller) | a giant >= 10:1 over a 130-220 px figure; 5-7 planes; 1-2 moments a film |
| **Warmth** (cozy, home) | CORE C1 + E2, D7's one lit window. SITUATIONAL N13, B10, B9, E10 | RM7, RM5 (8-15 px/s) | J2 through the opening | affinity: level lines, close values, one warm key, slow life; >= 50 % of the runtime |
| **Tension** | CORE N9 (the close), N14 about to change. SITUATIONAL B11 inverted, A7 broken. RARE N15, M3, B6 | RM4 (a looming push on its word), then RM7 before the break | RJ2 (F), J11 (the key turns across a cut) or I11 in the shot | contrast: the hardest step, one diagonal, a size jump of 1.5-2x; once or twice a film |
| **Surprise** | CORE T with RM8 (the expected thing, then reality overtaking it), D7's break appearing, E2 lighting | RM6 (an onset of 0.1-0.3 s); RM8 at frame 0, RM8b a pop | J10 (this IS that), J3 | at ~2 s in the hook; one onset, its sound on its first visible frame or up to 2 f after |
| **Calm** (a breather, time passing) | CORE D1. SITUATIONAL S2, A7, E3, B8, D4 | RM7, RM5, RM2 (a slow flow) | J11, RJ4 | no onset near the focal; clouds 0-15 px/s; held 2.5-3 s; never next to the big move |

### 2. Sequencing and rhythm

1. **Shot length.** Shots (panels) average >= 3.5 s (210 f; DIRECTION 1; a C move inside a panel keeps one shot, except
   on one continuous camera: item 7), so a
   40 s film is ~10-12 shots and a 30 s one ~8-9. Vary them, never three near-equal in a row: a held peak 1.5-3 s
   (90-180 f); the big move 2.0-5.0 s plus its hold; a breather 2.5-3 s; a scale moment ~1.5-4 s; the paper held >= 1 s
   after its number lands.
2. **The change rate lives in the events, not the cuts.** Something new on the subject every ~1.5-3 s (90-180 f), a
   caption page every ~1.1-1.5 s (66-90 f), a build's pieces every 0.1-0.2 s (6-12 f); separate reads >= 0.5 s (30 f)
   apart; never > 1 s without a mover. Joins stay few and carried: ~9-11 a film, plain cuts at most 2.
3. **How many lead devices.** Count LEAD devices only: one per shot, the code named first in the shot's row of the
   camera plan; the every-shot grammar (§0.3a) never counts, nor T (frame 0's drawing, in every film). A 10-12-shot film
   uses **6-9 different leads, >= 7 in 10 shots led by a CORE device, at most 2 RARE (each once), never a NOT FOR US
   one**; the home place's lead returns with it (N14), any other lead at most twice, never in neighbouring shots; a held
   frame that carries two beats keeps one lead. A film on one place keeps the same counts: its variety comes from size
   and device, never from new places.
4. **Variety inside one flowing story: change the frame, keep the thread.** Neighbours differ in at least one of: size
   (>= 1.5-2x; the ladder steps 2-3x), the device, the camera's height. They keep: the place (one home place, at most
   one comparison or scale place), the thread (on screen >= 80 %, no gap over 3 s), the light rig, the "you", and the
   focal's spot across the join (within 150 px). Never the same recipe twice in a row (N14 and the callback aside),
   three wides in a row, three wides sharing a centred landmark, two scale wides, two follows (RM3) or two morphs (J10)
   in a row.
5. **The intensity curve.** Affinity in the home beats (level lines, close values, slow life: N13, B10, C1, D1);
   contrast at the hook, the turn and the payoff (a diagonal, the hardest step, a jump in size: T, N15, N14, D2). Peaks
   alternate with calm beats, never a sustained high; sizes move in toward the close on the personal beat and out to
   the wide for the system.
6. **Where to rest.** After the big move, its landing hold (>= 30 f below 5 % of its peak speed) is the rest; a
   breather (D1 or S2, 2.5-3 s) follows another scale or dense beat, never directly before or after the big move; after
   the heaviest line, a hold of 0.5-1.0 s (the turn); at the payoff, the release in a voice pause >= 0.8 s (48 f) and a
   hold >= 1 s. The sound rests too: after the hook's 4-5 hard syncs, at most one per 10 s until the release
   (`SOUND_SYNC.md`).
7. **A film on one continuous camera** (video 4). Each beat's framing is a STOP and counts as a shot for items 1-4 and
   the doses. Between two stops the camera makes the in-shot move that fits (RM4 <= 2x in, I4 a story pull out, I5 a
   tilt, I6 a rise, RM3 a follow; a straight dolly toward an off-axis target is one move: rule 12), its midpoint on the
   next sentence's first word, landing >= 30 f before the stop's onset so the onset reads on a still camera; the change
   counts as a C join in the doses. Where the voice runs on with no pause, the stop holds (RJ4 at rest). RJ4's seam
   (Film's camera-continuous, <= 1.15x or 150 px) is only where two panels meet. Every join may be C but the turn's (RJ2,
   or one J2).

### 3. How animation and transitions fit

**The grammar: a frame's device already holds its motion.** Lines are a path, an opening is a portal, a shape at a fixed
spot is an anchor, a tall thing is a tilt, a near layer is parallax and a wiper, a quiet field is a hold
(`composition/motion.md` §2, from the owner's 41 in motion). So a shot is planned in this order: the frame, then the
move it holds, then the join it offers, with the carrier that join needs:

| the frame's device | the move inside the shot | the join out | the carrier it needs | timing (s / 60 fps frames) and easing |
|---|---|---|---|---|
| **An opening** (C1, E2, B4, B13, N13's window, D7's lit window, E11's screen) | RM7 while the subject crosses or stands in it (RM1, ~1-2 s); or RM4 toward it; I11 it brightens a step | J2 the push-through | A: the opening itself, 15-30 % of the frame on the axis, shown >= 0.5 s (30 f), its aperture the lightest area below the sky | J2 1.1 s (66 f): in 0.5 s (30 f) in-cubic to 7x, out 0.6 s (36 f) out-cubic; the next focal where the aperture's centre was (within 150 px) |
| **Lines into depth** (B1, B2, E7, B8, B11; side-on, the level and vertical legs of rule 8) | RM1 the subject travels the line and arrives on its word; or RM4 a push along it, anchored on its end | J2 into the end's door; J3 on the end point; J7 along the line | A (an opening at the end), B (the end point held), D (the traveller) | RM1 ~0.8 x its height in px/s (the 180 px "you" ~150 px/s, 2.5 px/f), an opening crossed in 1-2 s (60-120 f); RM4 visible (rule 18) in <= 2 s (120 f), in-out cubic in a held shot, out-cubic only when it starts on a cut or as a join's incoming leg (a lean-in), a drawn-in push peaking at 65-80 % |
| **One shape or light at one spot** (A6's vertical, A7's axis, D5's apex, E2's bright shape, E8's accent, N14) | RM7 (the anchor still) | J3 on the shape; J4 on the light | B: the anchor within 150 px and 1.5x (the thread itself 1.2x), a light within 190 px; ONE change across | 0 f, at the anchor's fastest move or on the next sentence's first word; a match zoom 8 + 6 + 12 f |
| **A tall thing** (D2, A6, N11, B11) | I5 the tilt up (down: into a place) | in by RJ2 only on a "But"; out by RJ4 or J2 | C (the camera continues); F at the turn | I5 600-900 px in 3.5-4.5 s (210-270 f), front-loaded (trapezoid(0.1, 0.6)), no zoom-out; the band one flat field at every frame |
| **Two levels** (C3) | I5 or I6 between them; I11 the light passes from cause to effect | RJ4 the camera follows the cause to the effect | C | I6 400-700 px in 2.5-3.5 s (700 px needs >= 2.9 s); I11 a lamp 6-18 f |
| **A near layer** (C2, E5, B10's wing) | RM5 the float (the near plane moves most); I6 it slides out of the bottom | J8 the wipe | D: our own tier-C near mass in the clean pen, already in the shot, never a stranger's back | J8 0.8 s (48 f), on screen <= 0.5 s, >= 70 % of the stage covered on the cut frame, an in-out sine edge at ~50 px/f; 0-2 a film |
| **Negative space** (D1, S2, Z1's sky) | RM7 or RM5, never a push; a light change in the shot (RM6, I11) | J11 across a cut; RJ4 out by a rise | B; C | RM5 8-15 px/s (0.13-0.25 px/f), legs turning every 0.6-1.5 s; a lamp 0.1-0.3 s (6-18 f), the sky 0.8-1.5 s (48-90 f) |
| **A pattern with one break** (D7, D5) | RM6 the break lights; RM8b the build (units pop by rows) | J4 the lit window matched; J2 into it | B; A | RM6 0.1-0.3 s (6-18 f), its bloom ramping at the source, >= 0.5 s from any other onset; a build's pieces every 0.1-0.2 s |
| **A still subject, a moving world** (E3) | RM2 a flow behind it; or I12, the camera moving round the held subject | RJ4 (the pivot carries the eye) | C | the subject within +-40 px; <= 3-4 movers taking turns (~0.6 entries a second); none in the 0.4 s round a join |
| **The subject travelling** (E9, E1, B8) | RM1 (the camera holds) | J7 the carry; J2 into where it arrived; J5 on a cut mid-action | D (the traveller); A | J7 the same speed (within ~10 %) and direction, entering within 0-2 f; J5 the motion starts >= 4-6 f before the cut and runs >= 0.3 s (18 f) after it |
| **The line first** (T, N7) | RM8 the draw-on | RJ3 the loop | frame 0's drawing | RM8 >= 1 s (60 f) peaking after 0.4 s (24 f), one pen tip at 12-25 px/f, strokes 6-12 f, fills ~7 f, pops peaking at ~12 f (~7 % overshoot); RJ3 0.5 s (30 f), all ease-in |
| **The close and the paper** (N9, Z4, Z3) | RM4 <= 2x per panel to reach it, then RM7; RM8 a chart line in step with the voice | J13 the flip (paper); J10 the morph (this becomes that); J2 into the paper | E; B or E | J13 a pre-tilt 0.62 s (37 f) before the cut, flat 0.45 s (27 f) after; J10 0.4-0.8 s (24-48 f), staged (position, then shape and colour, then the world), slow in and out |
| **The "you" looking** (E10, E4) | RM7; the head turns 0.3-0.5 s before the beat | J6 the eyeline, usually a push along the sightline | A or C | the look held >= 0.5 s (30 f); the next focal within 150 px of the gaze line's end |
| **The scale reveal** (D2, Z1, N6, E6) | the one big move, I4 at scale (S5) or I6 (S1), with I12 the pivot | in by RJ4, or RJ2 on a "But"; out by J2 back home or RJ4, or by RJ2 on a "But" from the landed frame after its hold | C; A; F | I4 2.0-5.0 s, default 3.3 s = 156 f of move + 42 f of hold, S5_EASE cubic-bezier(0.55, 0.03, 0.50, 1.0), the far plane's peak ~14 px/f; a continuous pull <= ~2.3x, beyond it the nested pull (below), J8 or J2 |
| **The turn** (N15, M3, B6, B11 inverted) | RM7, a hold of 0.5-1.0 s after the line | in by RJ2 (or a push landing off-centre); out by a carrier, never a second plain cut | F | RJ2 0 f; a size change >= 1.5-2x (G3_ANIMATIC: >= 20 %) or the angle >= 30 degrees; the incoming camera already moving (its first key 0.5-1.5 s before the cut) |

**The numbers the table leaves out:**
- **RJ4 the continuous camera (C):** Film's camera-continuous, dur 1.4 s: the outgoing leg accelerates into the cut over
  0.7 s (42 f, in-cubic), the incoming leg goes on at the same velocity and settles over 1.4 s (84 f, out-cubic); its
  travel <= 1.15x in zoom or <= 150 px; the subject the pivot (+-40 px); a seam on a held frame or mid-move, never on an
  event. **At rest** where the voice runs on with no pause: no move; the frame holds through the boundary and the next
  beat starts with its own onset.
- **I4 at scale, the nested pull** (the one big move beyond a continuous ~2.3x): the world as nested pictures, each drawn
  inside the next at its exact screen size and spot on the hand-off frame; each step <= ~2.3x over >= 0.5 s (30 f) at the
  move's mean rate (a detail 540 px from the pivot then moves ~15 px/f, the budget); ONE S5_EASE over the whole chain,
  never one per step (its peak runs 2.1x its mean, so near the peak only big simple masses lie beyond ~260 px of the
  pivot); the angle changes only inside a hand-off, where nothing reads; 2.0-5.0 s in all; each hand-off frame drawn as a
  still at G3 (rule 12).
- **I12, the pivot's hand-off:** the pivot passes from one object to the next (a mug, then a city's lit spot) only at one
  screen spot: the incoming object drawn on the outgoing one's spot (within +-40 px) at a size within 1.5x of it on the
  hand-off frame, so the eye never moves.
- **RM7 the hold:** a held peak of 1.5-3 s (90-180 f); never > 1 s without a mover; a story change on the subject every
  ~1.5-3 s.
- **RM3 the follow:** the camera starts 2-4 f after the subject and lands after it; the subject held at x 410-560 (a
  truck) or on the axis (a tilt), within +-40 px; the background drawn as the view plus the travel (+40 px overscan);
  never two follows in a row.
- **RM8's un-draw:** the draw-on run backwards (the pen tip retracting along the stroke, fills shrinking back to the
  line), never an opacity fade; it counts in RM8's dose (the loop's un-build, RJ3, does not).
- **T2 the pinned-anchor cuts:** 2-4 cuts of 20-30 f round one bright anchor held within +-10 px; each counts as a B
  join, never an F.

### 4. The rules (22)

The rules every shot keeps, drawn from `composition/principles.json` (its 130 rules, merged where several lanes say the
same thing; the ids after each rule are its sources there). Rules 1-13 keep the numbers the recipes cite; 14-22 add the
strongest of the attention, motion and modern lanes (what every move and join shares, timing, easing, speed and sound, is
rules 12 and 19-21). "Proposal" applies to what no doc in force says yet (`composition/library_clashes.md`).

1. **Design for the window the phone shows.** Key reads (the subject's action, a figure, a label, a number, a contact
   point) inside x 130-945 from y 600 to 860 and x 130-870 from y 860 to 1519; nothing to read above y 240 or at y >=
   1519; only masses run into x < 98 or > 982, under the rails and under the bottom UI; a thing cut by a side edge still
   reads with its outer 98 px gone. Words in the world >= 56 px, lines >= 2 px, a figure "doing what" >= 40 px and
   reliably 60-80 px. *CS1, V1-V4, V7, V11 (measured on the owner's recordings).*
2. **Three stacked pictures.** The words' sky (y 0-600: the band one flat field, no tops, lines, heads, props or shadow
   edges across it; a rising column, steam or smoke, whose source sits within ~160 px under y 620 bends sideways at y
   620-700 and never enters it), the stage (y 600-1520: the story) and the near band (y 1250-1920: one quiet mass under the app's
   text, where light detail loses 10-20 % to the scrim). Depth stacks UP the frame: the near at the bottom, each farther
   plane higher, overlapping >= ~10 px, no two plane tops within ~40 px. Width is scarce (884 visible px), height is
   not: one stage, never a split screen. *CS2, M5, V10.*
3. **One focal, in its home.** The focal's centre on the subject axis x 380-700, by default within 130 px of x 540, at
   y 951-1006 (where the drop below meets the golden box; allowed y 860-1200: `CRAFT.md` §b's WARN, from R7); the drop
   from the caption block's foot (y 556) 300-450 px, 650 at most; nothing calls in the drop. After every cut the focal is
   re-found near the centre or within ~150 px of the last one. Off its home only for a declared reason: a scale shot's
   landmark on a third, the left-third hero spot (x 200-450), the turn, a setup-A focal on the horizon belt to y ~1250.
   *CS3, C1, V8, L4, AR2, M1.*
4. **The focal is one place: the subject, the story light and the hardest value step.** A step >= 65 L* at the focal (a
   lit doorway L* >= 95 with her silhouette <= 28); below the band no other step over ~40 L* and no light within 10 L*
   of the focal's; the brightest 5 % below the sky within 134-288 px of the subject; the scene's one hot accent (C* >=
   50 against tier B's <= 25, ~3-5 % of the frame) only there, everything else within dE 6-8 of its mass; <= 3 regions
   pull at >= 50 % of the strongest, one at >= 70 %. **The lines lead, the light decides:** in 12 of the 20 one-subject
   reel examples a brighter patch beat the subject the lines pointed at. *CS4, R3, R4, R11, L5, AR1, M8, M9.*
5. **Notan first: three masses, two quiet fields, few things.** At a 1 % squint in 3 values the three largest masses
   hold >= 85 % (<= 8 masses >= 1 %), one value group 40-55 %, the means >= 13 L* apart; <= 10 value pieces; <= 6 named
   objects (the subject, the thread, one big quiet mass, 1-3 supporting things); >= 65 % of the frame quiet in two
   fields (the sky with the band >= 30 %, the near ground >= 15 %), each patterned +-4-6 L*, never a hole; nothing
   off-story pulls >= 50 % of the focal; Pip >= 250 px from the focal, tone-on-tone, off the eye path. Draw the 3-value
   notan of every shot first. *CS5, R1, R2, R5, R6, R12, M11, M25, AR17.*
6. **The horizon off the half, declared per set.** Setup A (camera 0.9-1.6 m) y 1150-1300, or B (3-7 m) y 690-860; never
   y 900-1020 (0.47-0.53 H), though until approved `LAYOUT.md` §2's street (0.50-0.60 H, y 960-1152) and eye-height
   scale horizons (0.52-0.59 H, y 998-1133) stand (`composition/library_clashes.md` row 5); S1 lands at
   y 768, S5 at 883, S3 ~1402, S4 ~1574, K7 1114-1229. Thirds as proportions: one quiet mass about twice the other,
   never two equal halves of anything. *CS6, C2, C3 (proposal).*
7. **People by the horizon-cut rule; the "you" soft, at one side, looking in.** Feet at y_h + P·c/h, the head's top at
   y_h - P·(h - c)/h (Part 2 §0). The "you": one figure of 130-220 px, from behind or in silhouette, tier B (its pull <
   50 % of the focal's), at x 130-380 facing right or x 700-830 facing left, its sightline crossing the focal's box, its
   head's top above y ~1380; lead room 1.5-2x; strangers small (mid walkers 110-260 px, far 15-60 px), in twos and
   threes, >= 220 px from the subject. When the "you" is POV only (SR13's hands), a person near the camera may still give
   the scale: one tier-B stranger in the mid ground, 110-220 px, in profile or three-quarter (never a back square to the
   lens at the near edge: it reads as "you", `CRAFT.md` §a.3), walking a path that ends at the story's place and seen
   there later (SR8's lit window with a person in it); one such person a film, the owner's call. *CS7, C9, L3, AR8.*
8. **One device per shot, and it delivers the eye to the focal.** Name one lead by its code; a second only when it
   points at the same focal. Lines in 2-3 legs of >= 150 px at ~40-60 degrees, alternating sides, the last ending
   within 40 px of the focal's box; in a side-on view (no depth to recede into) the legs may be level and vertical (B8's
   angular form at 0 and 90 degrees), alternating direction (along, then up), and they lead only by what travels them
   (RM1) or by ending at the story light; no line corner to corner, across the band or on into an empty vanishing point; the
   vanishing point within 60 px of the subject or hidden behind it; an inner frame 15-30 % of the frame, its aperture >=
   10 L* off its rim; a pattern within +-6 L* with one break, never two. *CS8, C6, C7, L11, AR9.*
9. **One soft counterweight, high or on the far side.** The focal 0-130 px off x 540 is balanced by one bigger, softer
   mass >= 300 px out on the other side (x < 240 or > 840), its pull < 50 % of the focal's: by default the hero cloud in
   the top gutter (y 0-290), cut by a side edge; never in the lower right (x > 830 below y 790), where the rail and the
   name block already weigh. *CS9, C8, R8, V11.*
10. **The near frame is a hint at the edges.** >= 2 things cut by the frame's edges in every shot; the near frame <= 2
    props, cut by an edge, inside its shade mass (within 8 L*), its top at y 1450-1650; one framing mass on one side
    only, <= 216 px (20 % W); never half the frame; soft by value, never by blur (a near framing object's one optical
    blur of 2.2-3 px aside: DIRECTION 5); found edges only at the focal; contours overlap >= ~10 px or keep >= ~20 px
    apart. *CS10, R6, R9, C13, M10.*
11. **Sizes step 2-3x; an angle means something.** Extreme wide (the "you" 130-220 px near the camera, S5's end 170-200
    px; the scale from the world past every edge and tiny strangers 15-60 px), wide (the subject 15-35 % of the height),
    medium (270-460 px wide), close (one object >= 650 px), insert (one detail filling the stage); a push <= 2x per panel
    (beyond it, a push-through); a side-on set scales at most until its top and its lowest key read fill y 620-1480
    (Part 2 §0); a plain cut changes size by >= 20 % (G3_ANIMATIC §4, in force; this library
    asks 1.5-2x) or angle by >= 30 degrees, or keeps the exact frame; eye level by default, low only on the quantity,
    high once on crowds and patterns, overhead only as paper, never roll. *CS11, C4, C5, L9, AR3.*
12. **A move is three designed frames, and the subject is its pivot.** One story motion at a time: the camera holds
    while the subject moves, or the camera moves round the subject held as the pivot (+-40 px), never both freely; the
    world's life stays slow, even and low in contrast. The start, middle (p 0.5) and end frames each pass rules 1-11 as
    stills (the middle at least the band and tangent checks); one variable per move, on one ease: a straight dolly toward
    an off-axis target is one (a zoom about the point the camera travels toward, the target sliding on a straight line to
    its landing spot), a truck or a tilt plus a zoom is two; the subject within +-40 px of its screen spot or on one path
    between two points of the golden box; the band a fixed mat; holds locked or the float, never a zoom. *CS12, MR1, MR2,
    C12.*
13. **Frame 0 peaks after the swipe settles.** The next reel settles ~0.4 s after the swipe: the opening's bold event
   lasts >= 1 s with its biggest change after 0.4 s. 0-0.4 s the words and the gist (frame 0 being drawn); 0.4-0.7 s the
   subject's onset peaks in the golden box with its sound; 1.2-1.7 s a second change on the subject; ~2 s reality
   overtakes. One subject on the axis >= 400 px wide with the hardest step; the first spoken line in the band from frame
   0; one pen tip in view at <= ~25 px/f; nothing important in the bottom 400 px or the outer 98 px. *CS13, AR15, V9,
   M27, MR23.*
14. **The subject owns the onsets.** Each beat has ONE onset, the subject's (a stroke drawing on, a pop, a tick, a light
    coming on), started inside the golden box (x 413-667, y 951-1187; on the feed its heart is x 436-644, y 951-1168)
    within 0.1-0.4 s of a cut; tiers B and C drift in
    at a constant speed from an edge or from behind a mass, >= 370 px from the focal, never within 0.5 s of A's onset;
    every change leaves its new state on screen >= 0.5 s (better >= 1 s); events the viewer must catch >= 0.5 s apart.
    *L1, AR5, AR6.*
15. **One signal, on its word.** The caption's keyword, the light's peak, the accent's arrival and the push land on the
    same word, the picture ~0.1 s ahead (0.3 s at most, never after); the cue is the light (the surround 10-20 L* under
    its pool), never arrows, rings or callout boxes. *M26, AR7, AR11, L7, L13; DIRECTION 8.*
16. **Event rate, not cut rate.** Something new on the subject every ~1.5-3 s from its own build, a caption page every
    1.1-1.5 s, shots averaging >= 3.5 s, at most 2 plain cuts; no decorative interrupt; the hook's arousing beat never
    stacked with fast cuts. *L15, AR14, M12.*
17. **Pick the move and the join from the frame's device** (§3) and from what changes (§0): an opening -> J2; one shape
    or light at one spot -> J3 or J4; lines into depth -> RM1 or RM4; a tall thing -> I5; two levels -> I5 or I6; a near
    layer -> RM5 and J8; negative space -> RM7 or RM5, never a push; a pattern's break -> RM6 or RM8b; time passing -> J11
    across a cut, RM6 or I11 in the shot; the turn -> RJ2.
    *MR3, MR12.*
18. **Every camera move has a story reason.** A push is looming ("this matters"): visible, >= 3 % in <= 2 s in force
   (`COZY_AND_SCALE.md` 3b.5), >= 5 % in <= 2 s (>= 2.5 %/s) proposed (his reels' 1.4 %/s push read frozen, the 2.6 %/s
   one visible: `composition/catalogue_detail.md` §D3 RM4; `composition/library_clashes.md` row 31), <= 2x per panel,
   scaled about its target's centre, one per beat; a pull carries its own event (a light burst, the landmark rising on
   its word); a vertical reveal is slow and front-loaded; holds are locked or the float (8-15 px/s, home by every join);
   no zoom in a hold, no roll, no compound move. *M14, MR5-MR8; DIRECTION 8.*
19. **The eye stays where it is across a join.** The next focal within 150 px of the last (190 px for a light match),
    220 px at most (`CRAFT.md` §a, §e: the eye jump <= 0.10 of the 2203 px diagonal); farther only on the declared turn
    (G3_ANIMATIC: a warning with a declared exception), and then within ~370 px (one 5-degree look). The join sits at a
    breakpoint (the end of a sentence or an action), its midpoint on the next sentence's first word, in the voice's
    pause; nothing enters, pops or turns in the 0.4 s (24 f) round it, while slow life already moving keeps its pace;
    never a cut in the middle of a move (a cut on action aside). *M19, AR13, MR13, MR21; CRAFT §a.*
20. **Ease and pace like current motion design, inside our speed budget.** Arrivals decelerate over 15-27 f
    (cubic-bezier(0.05, 0.7, 0.1, 1.0)), exits accelerate over 9-15 f (cubic-bezier(0.3, 0.0, 0.8, 0.15)); a camera move
    eases in AND out (in-out cubic; a 4-6 s one in-out sine), out-cubic only when it starts on a cut or as a join's
    incoming leg; a long move cruises (trapezoid(0.25, 0.35), its peak 1.43x the mean); a join's two legs meet at one
    velocity; travellers move on arcs; drifts are linear; never a linear camera start or stop, a camera bounce, or
    staggered starts across many movers; position and scale only, never opacity. Speeds: detailed layers <= ~15 px/f (the
    one budget: `video/docs/PIPELINE_V2.md` "Frame rate"), a full-frame sideways pan of detail <= ~6.4 px/f (est.), the eye
    follows one point to ~37 px/f, a carrier's flat mass may pass at 50-90 px/f (checked for direction and speed
    instead), a walker ~0.8 x its height in px per second; huge means slow, the near mover the fastest. Drawn poses step
    (held ~5 f) while the camera, the parallax, the light and the captions move every frame; a fast transit is one smear
    drawing held 2-3 f. *M15, M16, M18, MR9, MR10, MR22.*
21. **Sound on the change, spent and not sprinkled** (`SOUND_SYNC.md` wins on sound). A hard sync is one short sound on
    one discrete change of the subject, on its first visible frame or up to 2 f after, never before; 4-5 of them in the
    hook's first 2-4.4 s, then at most one per 10 s, and ONE release at the payoff in a voice pause >= 0.8 s (48 f),
    written at G1 and locked with the take (a locked take's shorter pause is `SOUND_SYNC.md`'s to settle:
    `composition/library_clashes.md` row 32; the picture's release stays on its word); hard syncs >= 0.5 s apart; nothing
    on tier-C life or on continuous motion; a soft carrier sound only on a fast carrier (a push-through's rush, a wipe's
    air), cresting on the join's midpoint +-2 f, at most one per join; a place's ambience may lead its picture by 0.2-0.5
    s (12-30 f) and trail 0.3-1.0 s (18-60 f) under the next, ducked, one bridge per join (J15); never a whoosh on every
    join. *L10, AR12, MR20, M23, as `SOUND_SYNC.md` settles them.*
22. **Check it cheaply.** The flash test (each key frame 0.25 s at feed size: what is it, where did you look?); an onset
   map per 0.5 s window (tier A >= 60 % of the pixels that start moving); a glyph check outside the band; the speed
   check (`video/scripts/camspeed.py`, with a lateral WARN), `video/scripts/qa/deadframes.py`,
   `video/scripts/qa/gate_check.py`, and the join checks (the anchor, the carry, the aperture, the sound offset) as they
   land. *AR18, MR24.*

## PART 1. THE CATALOGUE IN DETAIL

Every entry with its reference (the reel and the time), what it is, its numbers in our frame and the recipes it
serves, the owner's 41 first in his reels' order: `composition/catalogue_detail.md` (§D1 his ideas, §D2 ours, §D3
the moves and joins with their engine, §D4 the coverage).


## PART 2. THE SHOT LIBRARY (the recipes)

## 0. The frame in numbers

**The zones that composition works with** (`LAYOUT.md` §1 is the one definition; the measured feed numbers are
`composition/vertical.md` §1, proposals V1-V5 until approved):

| zone | numbers (px) | what goes there |
|---|---|---|
| visible on the feed | x 98-982 on the owner's Reels tab (98 px cut per side; 108 on most Androids, 129 on 21:9 phones); x 52-1028 on a profile; TikTok shows all 1080 | key reads inside x 130-945; only masses run into the cut strips |
| header | y 0-218 (Reels tab) or 0-235 (profile), a 10 % darker scrim to y ~240 | framing only: the sky's top, the hero cloud, a lid |
| caption band | y 290-600, one calm flat field (dL* <= 1.5 behind the block, ink >= 7:1); the block y 317-556, centred on x 520, <= 2 lines (lines <= 780 px: V5) | the words; outdoors the one sky, indoors a flat light wall (L* >= 70) |
| stage square | y 600-1520, full width; under the words the feed shows x 98-982 by y 600-1519, a near square (884 x 919) | the story: the subject, its device, the "you" |
| focal home | the focal's centre on the subject axis x 380-700, its target y 951-1006, allowed y 860-1200 (R7); its heart the golden box x 413-667, y 951-1187 (on the feed x 436-644, y 951-1168), whose middle the stage square's diagonal "eyes" mark (x 454-626, y 987-1133) | the beat's one focal (rule 3) |
| right rails | TikTok x 948-1059 from y 797; Instagram's Reels tab x 877-954, y 1032-1660 (from ~860 when a repost button shows) | nothing to read at x > 945 below y 790, or at x > 870 below y 860 |
| bottom UI | the app's text from y 1519 (Instagram), 1738 (TikTok); a 10-20 % darker scrim from y ~1680 | the near ground as one quiet mass; the "you"'s body may run under it, never its head |
| ad cut | key reads above y 1250, and left of x 780 below y 840 | a cut made for a boosted post |

**The grid lines, and where they land** (`composition/cinema.md` §1, `composition/vertical.md` §2):
- **Centre** (540, 960): the first look of every new shot goes here [cinema S7]; 20 px right of the captions' centre
  line.
- **Thirds** x 360 / 720 (20 px outside the subject axis), y 640 (40 px under the band) / 1280 (30 px under the read
  zone). The feed's own visible thirds fall at x 393 / 687, inside the axis: on the phone "on a third" and "on the axis"
  are the same place. Use thirds as proportions (2:1), never as hot spots.
- **Golden section** x 413 / 667 (the axis), y 733 / 1187; the stage square's y 951 / 1169. Our layout already sits on
  this grid (`composition/reels.md` §0).
- **Diagonals:** the full frame's is 60.6 degrees from level (it reads as a climb), the stage square's 40.4 degrees (the
  comfortable "dynamic" one). The golden spiral's pole and the dynamic-symmetry eyes of the full frame land in or just
  under the band (y ~461-656) or near the bottom UI (y ~1265-1459): never a placement grid for us.
- **Angles on the feed** (32 cm from the eye): 74 px = 1 degree; the eye's sharp centre covers ~150 px; while it rests
  on one spot it previews ~370 px around it (5 degrees); the "you" at 130-220 px is 1.75-2.97 degrees.

**Two camera setups for an exterior** (`composition/cinema.md` §3; proposal C2-C3). With a level camera at height c,
every standing figure of height h drawn P px tall on the camera's ground has **feet at y_h + P·c/h and its head top at
y_h - P·(h - c)/h** (y_h the horizon): at eye level every standing head sits on the horizon, near or far. So the horizon
and the "you" fix each other:

| | **A, the low eye** (the owner's human-scale references) | **B, the raised eye** | never |
|---|---|---|---|
| camera | 0.9-1.6 m on the "you"'s ground | 3-7 m: a raised quay, a bridge, steps, a first floor | |
| horizon | y 1150-1300 (0.60-0.68 H) | y 690-860 (0.36-0.45 H) | y 900-1020 (0.47-0.53 H): the half; still v6 sits at y ~995 |
| sky | up to 60-68 % of the frame, the band high in it, less what rises into it | 36-45 %, the band inside it | |
| a 180 px "you" (1.7 m) | camera 1.6 m: head y_h - 11, feet y_h + 169 (horizon 1187: 1176-1356); camera 0.9 m: head y_h - 85, feet y_h + 95 | below the horizon, seen from a little above: camera 5 m, horizon 768: head 1117, feet 1297; or no "you" in frame (POV) | |
| the focal | on the horizon belt or rising above it (a lit window, a doorway, a tower): centre y 950-1200 | in the middle distance below the horizon: y 860-1150 | |
| the far world | one dense belt on the horizon, rising into the sky where it is tall | spread below the horizon: more ground, more pieces to keep quiet | |
| use | the human view, the home view, the payoff | when the ground must spread (a square, two levels, a street from steps) | |

**The side-on set's scale ceiling** (SR25). Seen side-on, the set's top must stay under the band (y >= 620) and its
lowest key read (a street's run, a door) above the name block (y <= 1480): 860 px. A set whose top-to-lowest-read height
is h px at 1x scales at most k = 860 / h, its anchor then at y = 620 + (anchor - top) x k; closer than that, frame one
part (a new stop), never the whole set cut by the band. Video 4's home view: the roof y 690, the run y 1272, so h = 582
and k <= 1.48 (the window, y 985, then lands at y ~1056); S11 lands at 1.15x, anchored on the window at y 1000: the roof
at y 661, the run at y 1330.

## 1. The rules

The 22 rules every shot keeps are Part 0b §4; rules 1-13 keep the numbers the recipes (`composition/recipes.md`) cite.

## 2. The library at a glance

**Thumbnails:** `composition/shots_sheet.png`, one value thumbnail per recipe (our frame at 1/4, 270 x 480: five flat
values, white kept for the story light; the caption band and the app's interface on the owner's Reels tab marked
faintly; the composition idea in red), each in scene 1 or video 4 as its example says, drawn from the recipe's numbers
by `composition/shots_sheet.py` (seeded; no image copied or traced). The devices have their own sheets:
`composition/devices_sheet.png` (one thumbnail per device of the first library, the owner's 41 first; its YES and ADAPT
labels are the first library's verdicts, superseded by Part 0's tiers) and `composition/library_sheet.png` (the
every-shot grammar, then the frames by tier, with the move and the join out each pairs with).

Pick by the beat (Part 0b §1; the pass: Part 0b §0). **By beat:** the hook SR1 · establishing the home place SR2-SR5,
SR25 (side-on, its mechanism running through it) ·
the subject's moment SR6-SR11 · a reveal SR6 (through the opening), SR10 (the tilt), SR15 (the tilt-up), SR17 (the big
move), SR4 (out through the window) · the turn SR18, SR19 · scale SR14-SR17 · intimacy SR12, SR13 · a comparison SR20,
SR19, SR11 · a list SR21, SR22 · the payoff SR24, SR23, SR13. "The set's" = the set's own setup (A or B) and horizon
from W1. The focal is the centre of the beat's subject; its size is on screen. **Devices** are grouped by tier (CORE ·
SITUATIONAL · RARE; (v) a named variant); the moves and joins are Part 0's codes, the carriers `CRAFT.md` §a's (A = J2,
B = J3 or J4, C = RJ4, D = J7 or J8, E = J13, F = RJ2; the loop RJ3).

| # | recipe | the beat | setup, horizon y | the focal: centre; size | devices by tier | the move | the joins |
|---|---|---|---|---|---|---|---|
| SR1 | THE DRAWN SUBJECT | the hook, 0-3 s; the loop's frame | the set's | the focal home, near (540, 960); >= 400 px wide | CORE T, N7, N1, E8 · SIT A2 | RM8, then RM7 or one RM4 (rule 18) | out RJ4 or J2; the loop RJ3 |
| SR2 | HOME ACROSS THE WATER | the home place | A 1100-1250, or B 690-860 | the lit opening, (540-670, 950-1180); 150-230 px wide | CORE C1, E2, N7 · SIT N6, E6, D4, N3, B10, Z2 · RARE A1, C2, E5 | RM7 or RM5 | in J2 or J3; out J2 |
| SR3 | THE LANE | the home place: a street | 1020-1150 | the closed vista at the vanishing point, (540-700, 950-1150) | CORE B2, E7, B1, B4 · SIT B3, B10, B11, E1, Z2 | RM7, RM5, or RM4 to the vista | out J2 or RJ4 |
| SR4 | THE NOOK | the home place: indoors | none (the window's own) | the lamp-lit subject, head y 864-1152 | CORE C1 · SIT N13, B10 · RARE C2, E5, B13 (v) | RM7 or RM5 | out J2 through the window |
| SR5 | THE BALCONY | the home place from above; a crowd | none (35-55 degrees down) | on the curve, y 860-1060 | SIT B9 · RARE N12, B7 (v), B12 (v) | RM7 | J2 or RJ4 |
| SR6 | THE LIT OPENING | the subject's moment | the set's | the lit aperture in the golden box; 15-30 % of the frame | CORE C1, E2, N7, E9 · SIT A2 | RM7 (RM1 crosses it), then J2's push | out J2 |
| SR7 | THE PATH IN | arrival; the thing at the end of the way | A or B | the line's end, (480-640, 950-1150) | CORE B1, B2, E7, E2, E9 · SIT E1, B8 (v) · RARE C2, E5 | RM1 the subject travels, or RM4 to the vista | out J2 or RJ4 |
| SR8 | THE BREAK IN THE ROW | the one among many | the set's | the one lit window, (413-667, 860-1100) | CORE D7, C1, E2, E8 · SIT A2 | RM7; RM6 the break lights | out J2 |
| SR9 | ON THE LINE OF LIGHT | a person's moment | A, camera 0.9-1.2 m, 1150-1300 | a figure straddling the lit horizon, x 413-667; 150-300 px | CORE N7, E9 · SIT A6, N3, E1, E4, E3, D4, Z2 · RARE A1 | RM7; RM1 the figure walks the line | out RJ4 or J7 |
| SR10 | THE FOLLOW | travel; the mechanism on its way | the set's | held at x 410-560 (truck) or on the axis (tilt) | SIT E3, E4, Z3 · RARE B5 | RM3 (a truck) or I5 (a tilt), with I12 | out RJ4 or J7 |
| SR11 | THE LEVEL CHANGE | cause and effect; two places in one frame | B | the subject's level in the golden box | SIT C3, B8, Z3 · RARE B6, A5, B5 | RM7, or I5 between the levels; I11 | out RJ4 |
| SR12 | THE CLOSE | intimacy: the object | none | the object in the golden box; >= 650 px wide | CORE N9, N1 · SIT A2 | RM4 <= 2x in, then RM7 | in J2, RJ4 or RJ2; out RJ4 or J2 |
| SR13 | THE HANDS | intimacy: the "you"; "for you" | the window's | the thing in hand, (300-600, 1000-1250); lower (y 1310-1480) under a thread's run | SIT E11, E10 | RM7 or RM5; RM8 the effect lands | in J2 or J3; out J2 or J3 |
| SR14 | THE YOU AND THE WORLD | scale from a human viewpoint | A 1150-1300 | the far lit point on the axis; the "you" at x 130-380, 130-220 px | CORE D2 · SIT E1, E10, E4, N3, E6, N6, Z2 · RARE A1, A3 (v) | RM7, RM5, or RM4 to the vista | in RJ4; out J2 or RJ4 |
| SR15 | TINY UNDER GIANT | scale: the quantity, the machine | 1114-1229 (worm's-eye) or 1020-1133 | a figure 130-220 px (strangers 15-60 px as tiny anchors) at x 420-660; the giant >= 0.7 H | CORE D2 · SIT E1, A6, B3, N11, N6, Z1 · RARE A3, K8 (v) | RM7, or I5 the tilt-up | in RJ2 on a "But", or inside the big move; out J2 |
| SR16 | THE BIG SKY | a breather | ~1402 (S3) or ~1574 (S4) | a landmark on the left third, or a small "you" | CORE D1 · SIT N6, D4, E6, S2 (v) · RARE A1 | RM7 or RM5 | never next to SR17 |
| SR17 | THE ONE BIG MOVE | the scale reveal, once | S1 710 -> 768; S5 845 -> 883 | the pivot (S5's figures x 420-560, feet y 1490); the landmark (760, 760) | CORE D2, C1, B4 · SIT E3, N6, E6, Z1 | I4 (S5) or I6 (S1), with I12 | leaves from the thread; back by J2 or RJ4 |
| SR18 | THE OFF-BALANCE | the turn ("But") | the set's | off home: x 250-380 or 700-830, no counterweight; or one 30-45 degree diagonal | CORE D1 · SIT B11 · RARE N15, B6, A5, M3 (v) | RM7, a hold of 0.5-1.0 s | in RJ2 or RJ4 |
| SR19 | THE MATCHED PAIR | the turn told by light; before and after | the earlier shot's | the same focal, one change | CORE N14 | RM7 on both; RM6 or I11 the change | J3, J4 or J11 (B); inside one held shot the change is RM6 or I11, no join |
| SR20 | THE SEAM | a comparison in one frame | the set's | at the seam, in the golden box | CORE E9 · SIT A2, Z3 · RARE D6, B6 | RM7; RM1 the seam's front travels | out RJ4 |
| SR21 | THE LINEUP | how many; a list of like things | the set's, a little from above | the cause at the apex in the golden box; units >= 60 px | CORE D7 · SIT A2, B3, Z3 · RARE D5, N12, B13 (v) | RM7; RM8b the units pop by rows | out RJ4 |
| SR22 | THE PAPER | the proof: a chart, a number, a date | none (straight-on) | the paper >= 60 % of the stage wide; one number 120-160 px | CORE N7, N9, N1, T, Z4 | RM8 the line in step with the voice, then RM7 | in J2 or J13; out J2 or J13 |
| SR23 | THE MIRROR | stillness; a formal beat; once | waterline 1040-1100 | the landmark on x 540, y 850-1040 | CORE E9 · SIT A7 | RM7; one slow mover (RM1) | in or out J3, or the loop's frame |
| SR24 | THE WHOLE RUN | the payoff; the callback | the opening's | the thread at its home spot; the film's hardest step | CORE N14, B1, E8 · SIT B8 · RARE B12 (v) | I4 a story pull (not the big move), then RM7 | the loop RJ3 to frame 0 |
| SR25 | THE SECTION | a side-on home place with its mechanism running through it | A, the set's (video 4: 1170) | the run's end at the story light, in the golden box | CORE E9, B1, D7, E2, E8 · SIT B8, A2, D4 · RARE A1 (the source on a third) | RM7; RM1 the thread travels the run | out RJ4, or J2 into the opening |

## 3. The recipes

Each recipe in full (beat, layout, device, camera and joins, never, and its example in scene 1 or video 4):
`composition/recipes.md`. The table above is the index.


## 4. Picking shots for a film (the composition-and-motion pass)

The pass is Part 0b §0 (the planning card). Its first use, video 4's (`video/docs/v4/visual/COMPOSITION_PASS.md`), found
15 choices the library could not answer; each is settled in this version (`composition/critique_library.md`, Fix pass).

## 5. Clashes with other docs

Every number here that differs from a doc in force, with the doc that wins and what this page does until the owner
settles it: `composition/library_clashes.md` (rows 1-14 open since the first library, 15 on new). A clash is a bug:
each row names its fix.


## 6. Sources

The ranking's inputs: `composition/catalogue.json` (103 entries; every merge and count in
`composition/catalogue_notes.md`), `composition/catalogue_prior.json` (the earlier scores, kept from the judges),
`composition/principles.json` (130 rules) and the three judges `composition/judges/attention.json`, `story.json`,
`fit.json` (each with its scale, its reasons per entry and its notes). The evidence and every source are in the
research notes: `composition/reels.md` (the owner's five reels, watched frame by frame and scored with our notan check),
`composition/attention.md` (15 attention levers ranked, AR1-AR18), `composition/modern.md` (current cinematography and
motion design, M1-M29), `composition/motion.md` (the reels' motion measured, moves and joins, MR1-MR24),
`composition/cinema.md` §12 (S1-S20: Poore 1903, Dow 1899, J. T. Smith 1797 via the rule of thirds' history, the golden
ratio's and dynamic symmetry's construction, Disney's staging, eye-tracking studies of scenes and film, aesthetic
studies of framing, shot sizes and angles, lead room and the repoussoir, the multiplane camera, 2D layout practice,
contrast and affinity, colour scripts, Guo Xi's three distances, the 30-degree rule), `composition/vertical.md` §10
(V1-V15: the platforms' safe-zone files measured on their pixels, the owner's screen recordings measured, eye-tracking
studies of vertical and short-form video, subtitle guidelines, reading-size research) and `organic/composition.md` §8
(notan, the steelyard, staging); sound: `SOUND_SYNC.md`. The owner's references: `refs_composition/`,
`refs_human_scale/`. Nothing from them is traced or copied; we measured them to learn methods.
