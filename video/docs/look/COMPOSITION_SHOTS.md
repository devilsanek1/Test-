# COMPOSITION_SHOTS: the composition library, ranked (frames, moves, joins), with the guidelines for our 9:16 films

> **In five lines.**
> 1. **One library of 103 choices:** 67 frames (how a shot is composed), 17 moves (inside a shot), 19 joins (between shots); the owner's 58 first, in his reels' order and names (his 41 ideas and T, plus the 2 treatments, 9 moves and 5 joins his reels show), our 45 after, labelled.
> 2. **Ranked by three blind judges (attention, story, fit; 1-5 each) with one rule for all:** CORE = mean >= 4.0 and no lens under 3, SITUATIONAL = 3.0-3.67 and none under 2, RARE = 2.0-2.67, NOT FOR US = under 2.0; the result: CORE 34, SITUATIONAL 35, RARE 18, NOT FOR US 16 (Part 0).
> 3. **His 41 ideas and T:** 12 CORE (leading lines, the vanishing point, the tunnel, the frame within a frame, negative space, scale, the pattern with one break, the lit opening, the closed vista, the colour accent, the held frame the subject travels, the line first), 16 SITUATIONAL, 12 RARE, 2 NOT FOR US (the golden spiral, balance); his ideas are 19 of the 34 CORE tools, and the 14 that land low head Part 0, each to overrule in one line.
> 4. **The guidelines (Part 0b):** which tools by beat and by emotion; the rhythm (shots >= 3.5 s on average, 6-9 frame devices in a 40 s film, a change on the subject every 1.5-3 s); the grammar that ties each frame to its move and its join (timing in s and 60 fps frames, easing, the carrier, the dose); 22 numbered rules.
> 5. **The detail:** Part 1, every entry with its tier and its numbers (the owner's 41 first); Part 2, the recipes SR1-SR24 with their devices' tiers and the clashes with other docs (§5); the sheet `composition/library_sheet.png`.

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
that hold for every shot) into guidelines; Part 1 is the catalogue in detail; Part 2 the shot recipes. The evidence stays
in the research notes: `composition/reels.md` (the owner's five reels, frames in `reels_sheet.jpg`),
`composition/attention.md`, `composition/modern.md`, `composition/motion.md`, `composition/cinema.md`,
`composition/vertical.md`, `organic/composition.md`.

**Rank and status.** A look doc on DIRECTION's ladder: under the owner's words (the playbook, `docs/vN/OWNER_NOTES.md`),
DIRECTION, CRAFT, PIPELINE_V2 and the gate specs (`G3_ANIMATIC.md`, `G5_BLOCKING.md`); between look docs each wins on its
topic (`LAYOUT.md` the zones and each shot type's framing, `CINEMATIC_GUIDE.md` S1-S5 and the camera moves,
`COZY_AND_SCALE.md` the cozy and scale doses, `SOUND_SYNC.md` sound). This page's topic: which frame, move and join a
shot uses, and the grammar between them. A number quoted from those docs must match them; where this page differs,
Part 2 §5 names the doc that wins, and no other doc is edited from here. What is not already in a doc in force is a
proposal until the owner approves the library; its first use is video 4's composition-and-motion pass (the playbook:
"Every film's visual script gets a composition-and-motion pass from the shot library"). We learn principles from the
references: nothing traced, copied or used as an input, no creator named.

**Conventions.** Px at 1080 x 1920, y down (W = 1080, H = 1920); time in seconds and 60 fps frames (1 f = 16.7 ms, 6 f
= 0.1 s, 30 f = 0.5 s, 60 f = 1 s). **A·S·F** = the attention, story and fit judges' scores. "The feed" = the owner's
Instagram Reels tab (it shows x 98-982 of our frame, 1.22x larger than a review MP4 fit to the screen). "The 'you'" =
the film's one stand-in for the viewer. **Scene 1** = v2's canal opening at King's Cross on an October dusk (still v6,
the lit doorway with her silhouette in it); **video 4** = Helsinki's AI-heated homes on a snowy night (its G2.5 visual
script: 12 shots S1-S12 on one continuous camera, 42.24 s; the warm water the thread, the one window its home spot, the
giant computer by the harbour). Carriers A-F are `CRAFT.md` §a's (A push-through, B thread match, C continuous camera, D
object carry or wipe, E card flip, F plain cut). **Codes:** the owner's ideas A1-E11 and T, his reels' moves RM1-RM9,
joins RJ1-RJ4 and treatments X1-X3; ours: frames N, M3, Z1-Z4, S2, K8, moves I, joins J and T2 (Arcane's pinned
anchor, not his T), rejects X4-X11. Merged codes (`catalogue_notes.md` §2): N4 -> B10, N8 -> B8, N10 -> E3 (its motion
I12), I1 -> RM7, I2 -> RM5, I3 -> RM4, I7 -> RM3, I8 -> RM1, I9 -> RM2, I10 -> RM8, J1 -> RJ4, J12 -> RJ3, J14 -> RJ2.
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
changes that doc too.

| his idea | tier | A·S·F | why it lands there | what we use instead |
|---|---|---|---|---|
| A1 Rule of thirds | RARE | 1·3·3 | no gaze evidence for the thirds; on his feed they fall on the subject axis's edges (x 393 / 687) and the crossings sit 40 px under the band and 30 px under the read zone | A2's golden box and N1's centre for the subject; the thirds as 2:1 proportions in every exterior (rule 6) |
| A3 Golden section, nested | RARE | 1·3·3 | the big form and the small subject at its foot are two calls at phone size | D2 scale (CORE), the subject at the giant's foot (SR15) |
| A5 Golden triangle | RARE | 1·2·3 | its two feet ~226 px apart split the eye, and the slope outpulls both | C3 for cause and effect on a slope; N14 or J11 at the turn |
| B5 Parallel lines | RARE | 2·3·3 | the eye does not ride lines; sideways travel is the expensive direction in 9:16 | B1 (CORE) when lines must deliver the eye; RM3 when the travel is the story |
| B6 Diagonal | RARE | 2·3·3 | contrast, for the turn or a climb only, never in a cozy beat | the turn's CORE tools N14 and J11; B6 for the film's one climb |
| B7 Double diagonal | RARE | 2·2·2 | it needs a raised view whose arms cross the band; one high-angle slot a film | B2 (CORE) for a meeting place at eye level |
| B12 Spiral composition | RARE | 3·2·2 | the same raised view, once a film | B8 at eye level; C1 and E2 to gather the eye in |
| B13 Circular | RARE | 3·3·2 | as a round opening it IS C1; as a ring it needs a raised camera | C1 (CORE) with a round window |
| C2 Foreground | RARE | 1·2·4 | as a framing device the near layer lies under the name block and adds a named object; the playbook wants "a small, subtle hint at the edges" | the hint itself in every shot (rule 10: <= 2 props); B10 or N13 to frame |
| D5 Pyramid | RARE | 2·3·3 | one narrow job: a cause above many | D7's one break (CORE) for "this one" and "how many" |
| D6 Juxtaposition | RARE | 2·3·3 | two fields in one frame are two calls unless the subject sits on the seam | N14 (CORE): the same frame before and after, in sequence |
| E5 A soft near layer | RARE | 2·2·4 | a restraint rather than a tool, and it lies under the name block | its softness by value in every near thing (within 8 L*: rule 10); E6 for depth |
| A4 Golden spiral / golden ratio | NOT FOR US | 1·2·2 | no gaze evidence; fitted to our frame its pole lands in the band or under the read zone; scaled to the subject it is a curve the eye does not ride | the sweep that ends on the focal: B1 or B8 with RM1 (SR24) |
| D3 Balance | NOT FOR US | 1·2·2 | two equal masses are two equal calls (DIRECTION 2: one place to look) | D4's one soft counterweight; A7 for a formal beat |
| *also in his reels, and settled by a doc in force:* | | | | |
| RJ2 The hard cut | RARE | 3·3·2 | DIRECTION 1: at most 2 a film, each on a "But" turn | the carried joins (RJ4, J2, J3) |
| X1 Focus and motion blur | NOT FOR US | 2·1·1 | DIRECTION 5: no blur (a near framing object's one optical blur, 2.2-3 px, aside) | softness by value (E5), the light pull (I11) |
| X2 A title over the shot | NOT FOR US | 1·1·1 | the playbook: never a title over the captions; the core line goes on the cover | the captions; the cover |
| RM9 The handheld pass | NOT FOR US | 1·1·1 | DIRECTION 8: every hold is locked or a slow float | RM7, RM5 |
| RJ1 The black line card | NOT FOR US | 1·1·1 | DIRECTION 1: every join carries something | the carried joins; his line-first lives on as RM8 |
| X3 The fade | NOT FOR US | 1·1·1 | DIRECTION 8: no opacity fades (a declared time-passing dissolve aside: G3_ANIMATIC §4) | J11 for time passing; RM8's un-draw |

### 0.2 The tier rule

Three judges scored all 103 entries blind (each read `catalogue.json` and its own grounding docs; none saw the earlier
scores in `catalogue_prior.json` or the other judges): **ATTENTION**, does it stop a thumb and hold the eye at phone size
in a voice-led film (the first 3 s weigh most; a subtle effect counts as none); **STORY**, does it make one subject plain
at a time, carry the thread across a join and explain without clutter; **FIT**, does it suit our 9:16 frame and crop, our
engine (and what it costs to build) and our look. Each scale: 5 = among our strongest, 4 = strong for particular beats,
3 = useful in one narrow beat or an indirect help, 2 = marginal, 1 = hurts or does nothing. One rule, applied the same
way to every entry:

| tier | the mean of the three (their sum, of 15) | the lowest lens | what it means |
|---|---|---|---|
| **CORE** | >= 4.0 (>= 12) | >= 3 | the default tools: every film draws on them, each at its dose |
| **SITUATIONAL** | 3.0-3.67 (9-11) | >= 2 | by beat or emotion, under the condition named |
| **RARE** | 2.0-2.67 (6-8), or any lens at 1 | | once in a while, under the condition named |
| **NOT FOR US** | under 2.0 (<= 5) | | not used, for the reason named |

The lowest-lens guard never had to act: every entry with a mean of 4.0 or more has no lens under 3, every one at 3.0-3.67
none under 2, and the four with a lens at 1 above NOT FOR US (A1, A3, A5, C2) have means of 2.0-2.33. **A tier says how
readily to reach for a tool, not how often:** the dose stays with the entry (the one big move is CORE and once a film).
Nothing was moved by hand. Where the owner's words set a dose (the cozy home >= 50 % of the runtime, one big move a film,
every hold locked or floating, the loop, the "you" near the camera), that dose stands whatever the tier, and Part 0b
names the tools that carry it. In each table the owner's entries come first, in his reels' order; ours follow under
*ours*, by mean. **Recipes:** the SR recipes of Part 2 whose Device line names the entry; (v) a named variant.

### 0.3 Frames (67): CORE 19, SITUATIONAL 24, RARE 16, NOT FOR US 8

**CORE** (19: the owner's 12, ours 7)

| # | name | A·S·F | mean | use it when (the condition, the dose) | move -> join | recipes |
|---|---|---|---|---|---|---|
| B1 | Leading lines | 3·4·5 | 4.00 | a way in, an arrival: 2-3 legs of >= 150 px at 40-60 degrees ending within 40 px of the focal's box, AT the story light (the lines lead, the light decides) | RM1, RM4 -> J2, J3 | SR3, SR7, SR24 |
| B2 | Vanishing point / one point | 4·4·4 | 4.00 | a street, a quay, a pier that leads to one place: the vanishing point on the subject (within 60 px) or hidden behind it, closed by one object (E7) | RM4, RM1 -> RJ4, J2 | SR3, SR7 |
| B4 | Tunnel | 4·4·4 | 4.00 | passage and promise: a tall portal, its sides in the gutters through the band, its lit far opening 15-25 % at (540, 950-1100): a push-through waiting to happen | RM4 -> J2 | SR3, SR17 |
| C1 | Frame within a frame | 4·5·5 | 4.67 | "look in here", a threshold: one opening 15-30 % of the frame on the axis, its aperture >= 10 L* off the rim, a 150-300 px figure dark inside | RM7 + RM1, RM4, I11 -> J2, J3 | SR2, SR4, SR6, SR8, SR17 |
| D1 | Negative space | 3·5·5 | 4.33 | a breather, a key line, time passing: the subject 130-220 px at the foot of a 60-80 % patterned field (the sky with the band); never the hook's frame | RM7, RM5 -> J11, RJ4 | SR16, SR18 |
| D2 | Scale | 4·4·4 | 4.00 | awe, 1-2 a film: the giant >= 0.7 H and >= 10:1 over a 130-220 px figure low near the axis | I5, I4 -> RJ2 in, J2 back | SR14, SR15, SR17 |
| D7 | Patterns / repetition | 5·5·4 | 4.67 | "this one" or "how many": one texture (+-6 L*) with ONE break, the call, at (413-667, 860-1100), lighting on its word | RM6, RM8, I11 -> J4, J2 | SR8, SR21 |
| E2 | The lit opening | 5·5·5 | 5.00 | the subject's moment, home, a destination: the aperture L* >= 95, the figure L* <= 28 (a step >= 65 L*), no other light within 10 L* | RM7, I11 -> J2, J4 | SR2, SR6, SR7, SR8 |
| E7 | The closed vista | 4·4·4 | 4.00 | a destination: the sight line's vanishing point on the one object that ends it (x 540-700, y 950-1150), never open sky | RM4 -> J2, J3 | SR3, SR7 |
| E8 | One colour accent on the subject | 4·5·5 | 4.67 | every focal: one hot accent (C* >= 50, ~3-5 % of the frame) only on the subject, travelling with the thread | RM8, RM6 -> J4 | SR1, SR8, SR24 |
| E9 | The camera holds; the subject travels the device's line | 5·5·5 | 5.00 | the default held shot: the frame built as a path whose end is in the golden box | RM1 -> J7, J2 | SR6, SR7, SR9, SR20, SR23 |
| T | The line first, then the world under it | 5·5·5 | 5.00 | frame 0, always (the subject's line, then the world, >= 1 s); later only where the drawing is the beat | RM8 -> RJ3 | SR1, SR22 |
| *ours* | | | | | | |
| N7 | Figure and ground: notan and counterchange | 5·5·5 | 5.00 | every shot's notan (rule 5); the hook and the proof: the subject one closed shape a viewer names at 0.25 scale, its step >= 65 L* | RM8, I11 -> J4 | SR1, SR2, SR6, SR9, SR22 |
| N1 | The centre, the first look | 5·5·4 | 4.67 | the hook, the close, the proof, and after every plain cut: the focal within 130 px of x 540, at y 950-1050 | RM7, RM4 -> RJ4, J2, J3 | SR1, SR12, SR22 |
| N9 | Isolation (the close) | 5·4·4 | 4.33 | the personal beat, a mechanism's detail: one object >= 650 px on one quiet backing, a 30-60 px calm ring; never a face | RM4, then RM7 -> RJ4, J2 | SR12, SR22 |
| N14 | The deliberate match | 4·5·4 | 4.33 | before and after, the callback, the turn told by light: the same frame with ONE change at the focal | RM7 -> J3, J4, J11, RJ3 | SR19, SR24 |
| N2 | The stage square (rabatment) | 3·4·5 | 4.00 | every shot: the words in the top square (band y 290-600), the story in the stage square below (y 600-1520) | any -> any | all |
| N5 | Headroom: the drop | 4·4·4 | 4.00 | every shot: the focal's centre 300-450 px under the caption block's foot (y ~856-1006), 650 at most, nothing calling in the drop | RM4, I5 -> any | SR6 |
| Z4 | The insert (the paper) | 4·4·4 | 4.00 | the proof: the paper straight-on, >= 60 % of the stage wide, one number 120-160 px, words >= 56 px | RM8 -> J13, J10, J2 | SR22 |

**SITUATIONAL** (24: the owner's 16, ours 8)

| # | name | A·S·F | mean | use it when (the condition, the dose) | move -> join | recipes |
|---|---|---|---|---|---|---|
| A2 | Golden section (the phi grid) | 3·4·4 | 3.67 | the focal's home in every shot (rule 3: x 413-667, y 951-1187); as the shot's own device, a lone thing on a phi line where the dead centre would read formal | any (it lands in the box) -> J3, J4 | SR1, SR6, SR8, SR12, SR20, SR21 |
| A6 | Cross | 3·4·3 | 3.33 | an upright standing its ground: one vertical crossing the horizon at x 413-667, no other vertical near it | I5, RM7 -> J3, J11 | SR9, SR15 |
| A7 | Symmetry | 4·4·3 | 3.67 | a formal, settled beat (an answer, the end): the axis x 540, halves within +-5 %; once a film, two at most; broken once at the axis on the turn | RM7, RM4 on the axis -> J3, RJ3 | SR23 |
| B3 | Radiating | 3·3·3 | 3.00 | everything points at one cause: 5-9 rays tone-on-tone meeting on the subject in the golden box; no ray across the band | RM7, I11 -> J11, J4 | SR3, SR15, SR21 |
| B8 | S-curve | 2·3·4 | 3.00 | a calm way in by water or path: 2-3 bends, or zigzag legs >= 150 px, ending on the focal, the thread travelling it | RM1, I6 -> J7 | SR7 (v), SR11, SR24 |
| B9 | C-shape | 2·3·4 | 3.00 | shelter from a raised view: the BALCONY curve in at y 600-700, out at y 860-1060, the subject inside it | RM7, RM5 -> J3, RJ4 | SR5 |
| B10 | L-shape | 2·3·4 | 3.00 | the cozy frame: one tall side <= 216 px cut by the top, flat through the band, plus the ground line; the focal toward its inner corner | RM7, RM5 -> J2, J8 | SR2, SR3, SR4 |
| B11 | V-shape | 3·3·3 | 3.00 | a canyon funnelling to one point (the arms below y 600, meeting within 60 px of the focal); inverted, the turn | I5 -> RJ2, J2 | SR3, SR18 |
| C3 | Level change | 2·4·4 | 3.33 | cause and effect in one view: the upper level y 700-950, the lower y 1150-1450, a 30-45 degree stair between; the light hands the focal over (I11) | I5, I6, I11 -> RJ4 | SR11 |
| D4 | Unbalanced (the steelyard) | 2·3·4 | 3.00 | every frame's balance (rule 9); as the shot's device, the subject on the axis and one soft mass >= 300 px out, high (the hero cloud), never lower right | RM5 -> any | SR2, SR9, SR16 |
| E1 | One small figure where the lines meet | 4·3·4 | 3.67 | a human anchor: one 130-220 px figure from behind at the device's focal, its feet above y 1480 | RM1 -> J2, J6 | SR3, SR7, SR9, SR14, SR15 |
| E3 | Stillness against motion | 3·3·4 | 3.33 | isolation, time passing: the subject held within +-40 px while a flow (never one mover) passes in one band behind it | RM2, I12 -> RJ4 | SR9, SR10, SR17 |
| E4 | Looking room | 3·4·4 | 3.67 | a facing or moving figure: 1.5-2x room in front (right-facing at x <= 410 below y 860); from behind, the room is up the frame | RM3 -> J6 | SR9, SR10, SR14 |
| E6 | Atmospheric layers | 3·3·5 | 3.67 | every exterior's depth (`CRAFT.md` §f.2: the mix 0/12/22/40/65 %); as the shot's device, the scale wides and breathers, 3-5 layers paler with distance | RM5, I4, I6 -> J11 | SR2, SR14, SR16, SR17 |
| E10 | The near 'you' over the shoulder | 2·4·5 | 3.67 | the viewer's stake: one whole 130-220 px "you" from behind at x 130-380 facing right (or 700-830 left), tier B, its sightline through the focal's box | RM7 -> J6 | SR13, SR14 |
| E11 | The POV hook | 4·4·3 | 3.67 | "for you": the hand from the bottom LEFT, the thing in hand at (300-600, 1000-1250), the effect landing in it on its word | RM8 -> J2, J4 | SR13 |
| *ours* | | | | | | |
| N13 | Refuge and prospect | 3·3·5 | 3.67 | the cozy home place: refuge 35-55 % on >= 2 edges, one opening 15-30 % read in y 600-1250, the subject facing it | RM7, RM5 -> J2 | SR4 |
| Z3 | The medium | 3·4·4 | 3.67 | the mechanism, the explainer's working size: the subject box 270-460 px wide, one backing, <= 2 props | RM7, RM8 -> RJ4, J3 | SR10, SR11, SR20, SR21 |
| N6 | Depth stacked up the frame (the three distances) | 2·3·5 | 3.33 | every exterior (4-6 planes, the near low, the far high: rule 2); as the shot's device, the vista and the scale beats | RM5, I4, I6 -> RJ4 | SR2, SR14, SR15, SR16, SR17 |
| Z2 | The wide | 2·4·4 | 3.33 | the home view: the subject 15-35 % of the height (290-670 px) in its place, the "you" near the camera | RM7, RM5, RM1 -> J2, J3, RJ4 | SR2, SR3, SR9, SR14 |
| N3 | The horizon off the half, and the line of heads | 2·3·4 | 3.00 | every exterior's master decision (rule 6): setup A, horizon y 1150-1300, or B, y 690-860; as a device, the line of heads | RM7, RM5, I5 -> J3 | SR2, SR9, SR14 |
| N11 | The low angle (worm's-eye) | 3·3·3 | 3.00 | power on the quantity, never on the thing under critique: camera ~0.3 m, horizon y 1114-1229, verticals parallel | I5 -> RJ2, J2 | SR15 |
| Z1 | The extreme wide | 3·3·3 | 3.00 | the place and its scale, 1-2 a film, ~1.5-4 s: 5-7 planes, the "you" 60-150 px (S5's end 170-200) | I4, I6 -> RJ4, RJ2 | SR15, SR17 |
| S2 | The sun behind the roofline | 4·2·3 | 3.00 | time passing or an ending held 2.5-3 s, once a film: a ~650 px disc at (580, 1060), the roofline from y ~1500, 3 values | RM7 -> J11, J4 | SR16 (v) |

**RARE** (16: the owner's 12, ours 4)

| # | name | A·S·F | mean | use it when (the condition, the dose) | move -> join | recipes |
|---|---|---|---|---|---|---|
| A1 | Rule of thirds | 1·3·3 | 2.33 | a subject placed ON a third: only the left-third landmark (S3, x 220-420) or a figure on x 360-420 / 660-720 facing in; as 2:1 proportions it is rule 6, in every exterior | RM7, RM3 -> J3, J7 | SR2, SR9, SR14, SR16 |
| A3 | Golden section, nested | 1·3·3 | 2.33 | a big form with the small subject at its foot, at (570, 1086) on the stage square, only when the small subject carries the light and the onset | RM4 -> J2 | SR14 (v), SR15 |
| A5 | Golden triangle | 1·2·3 | 2.00 | a slope with two related points on the stage square's 40.4-degree diagonal (feet (626, 987) and (454, 1133)); once, on a climb or the turn | RM1 -> RJ2 | SR11, SR18 |
| B5 | Parallel lines | 2·3·3 | 2.67 | travel along parallels (steps, rails, a quay): 3-5 lines at 30-60 degrees below y 600, the camera riding them | RM3 -> J7 | SR10, SR11 |
| B6 | Diagonal | 2·3·3 | 2.67 | the turn or a climb: one 30-45 degree line rising to the focal and broken by it; never in a cozy beat | RM1, I5 -> RJ2, J7 | SR11, SR18, SR20 |
| B7 | Double diagonal | 2·2·2 | 2.00 | a crossing seen from the balcony (35-55 degrees down), the X on the focal; once a film, in the high angle's one slot | RM7 -> RJ4 | SR5 (v) |
| B12 | Spiral composition | 3·2·2 | 2.33 | a stair or a roundabout curling in, from the balcony (once a film, the high angle's slot), or a spiral pathway at eye level | RM7, RM1 -> J2 | SR5 (v), SR24 (v) |
| B13 | Circular | 3·3·2 | 2.67 | a round opening 300-500 px across (then it works as C1), or a ring round the cause from a raised camera | RM7, RM4 -> J2, J3 | SR4 (v), SR21 (v) |
| C2 | Foreground | 1·2·4 | 2.33 | a near layer as the shot's framing device; its hint (<= 2 props cut by an edge, top at y 1450-1650) is rule 10, in every shot | RM5, I6 -> J8 | SR2, SR4, SR7 |
| D5 | Pyramid | 2·3·3 | 2.67 | one cause above many (the lineup): the base >= 540 px wide at y 1350-1520, the apex on the focal | RM7, RM4 -> J3 | SR21 |
| D6 | Juxtaposition | 2·3·3 | 2.67 | a comparison whose two states must be seen at once: one seam, the subject on it, the fields >= 13 L* apart (else N14, in sequence) | RM7 + RM1 (the front) -> J3, J8 | SR20 |
| E5 | A soft near layer | 2·2·4 | 2.67 | the near layer as a device; softness by value (within 8 L* of its mass) is rule 10 for every near thing (M10) | RM5 -> J8 | SR2, SR4, SR7 |
| *ours* | | | | | | |
| N12 | The high angle | 2·3·3 | 2.67 | once a film, on a crowd, a pattern or a crossing, never one person: 35-55 degrees down, the lid's flat facade behind the band | RM7 -> RJ4 | SR5, SR21 |
| N15 | The off-balance | 2·3·3 | 2.67 | the "But" turn only, once or twice a film: the focal at x 250-380 or 700-830, no counterweight; the next beat back home | RM7 -> in by RJ2 | SR18 |
| K8 | The light shaft and its pool | 3·2·2 | 2.33 | one small life singled out by light in a vast interior, once: a shaft 108-151 px wide on the axis widening into a pool | RM7, RM6 -> J4 | SR15 (v) |
| M3 | Short-siding and the low quadrant | 2·2·2 | 2.00 | once a film, on the turn, never cozy: the subject at x 130-300 facing out of the frame, or its head below y 1150 under >= 60 % quiet field | RM7 -> in by RJ2 | SR18 (v) |

**NOT FOR US** (8: the owner's 4, ours 4)

| # | name | A·S·F | mean | why not | instead |
|---|---|---|---|---|---|
| A4 | Golden spiral / golden ratio | 1·2·2 | 1.67 | no gaze evidence; fitted to our frame its pole lands in the band (y 483-656) or under the read zone (y 1265-1437); scaled to the subject it is a curve the eye does not ride | the sweep that ends on the focal: B1 or B8 with RM1 |
| D3 | Balance | 1·2·2 | 1.67 | two equal masses are two equal calls (DIRECTION 2: one place to look) | D4's one soft counterweight; A7 for a formal beat |
| X1 | Focus and motion blur | 2·1·1 | 1.33 | DIRECTION 5: no depth-of-field, bokeh, rack focus or motion blur (its one exception stays: a near framing object may take one optical blur, 2.2-3 px) | softness by value (E5), the light pull (I11) |
| X2 | A title over the shot | 1·1·1 | 1.00 | the playbook: never a title over the captions; the core line as a title goes on the cover | the captions in the band (rule 2); the cover |
| *ours* | | | | | |
| X7 | Isometric or axonometric world views | 1·2·1 | 1.33 | one camera from a human viewpoint (DIRECTION 7) | a diagram as paper in the place (Z4) |
| X8 | Forced three-point perspective | 2·1·1 | 1.33 | verticals stay parallel (CINEMATIC_GUIDE "Not for us"); lib/cine's towers draw it: use the parallel form | N11, the frame shifted, not tilted |
| X4 | The split screen | 1·1·1 | 1.00 | two stacked stages split the eye (`composition/vertical.md` V10) | N14 in sequence, or D6's one seam |
| X5 | The Dutch tilt | 1·1·1 | 1.00 | no roll (DIRECTION 8): a tilted horizon reads as a mistake in a tall frame | one diagonal in the world (B6), N15 |

### 0.4 Moves (17): CORE 8, SITUATIONAL 5, RARE 0, NOT FOR US 4

**CORE** (8: the owner's 5, ours 3)

| # | name | A·S·F | mean | use it when | the frames it serves |
|---|---|---|---|---|---|
| RM1 | The subject travels a held frame (E9 in motion) | 5·5·5 | 5.00 | the default life of a held shot: one subject travels the device's line and arrives, its onset on its word | E9, B1, B2, B8, C1, E1, D6 |
| RM4 | A slow push (the push-in) | 4·5·4 | 4.33 | "this matters": a visible push toward the subject, one per beat at most, on its word | B1, B2, B4, C1, E7, N9, D5 |
| RM6 | A burst at the focal (the light event) | 5·4·4 | 4.33 | "now", arrival, wonder: a light flares or switches on at the focal of a held frame | D7, E2, B3, E8, S2, K8 |
| RM7 | The locked frame (the hold) | 3·4·5 | 4.00 | "look at this": the camera still, the subject's own event carries the time, slow life always running | most frames: A7, B2, C1, D1, D7, E2, N14 |
| RM8 | The line drawn live, then the world under it (T in motion) | 5·5·5 | 5.00 | frame 0, and wherever the drawing is the beat: the line draws on with a pen tip, the colour floods in under it | T, D7, E8, E11, N7, Z4 |
| *ours* | | | | | |
| I11 | The light pull (our focus pull) | 5·5·4 | 4.67 | "look here now" without moving the camera; the turn told by light | C1, C3, D7, E2, B3, N14 |
| I4 | The pull-back, and the one big move (S5) | 4·4·5 | 4.33 | the film's one big reveal (S5, the owner's pick), once: the camera pulls back until the world opens round the pivot | D2, Z1, E6, N6 |
| I12 | The pivot: the subject holds its screen spot | 4·5·4 | 4.33 | every camera move: the subject holds its screen spot while the world slides past | E3, D2, and every camera move |

**SITUATIONAL** (5: the owner's 3, ours 2)

| # | name | A·S·F | mean | use it when | the frames it serves |
|---|---|---|---|---|---|
| RM2 | The world passes a still frame (E3 in motion) | 3·3·4 | 3.33 | isolation, time passing: one band of the world flows past a still subject (E3), sharp and slow | E3, A6, B5, D2 |
| RM3 | The camera rides the lines (the follow) | 3·4·3 | 3.33 | the travel is the story: the camera rides the lines or the mover and the frame's geometry holds still | B5, E4, A1 |
| RM5 | A slow pan, the drift (the parallax float) | 2·2·5 | 3.00 | a hold where depth should read: every plane drifts by its depth, the sky and the band not at all | C2, D1, D4, E5, E6, B10, N6 |
| *ours* | | | | | |
| I5 | The reveal tilt (and pan) | 3·4·3 | 3.33 | wonder, "it keeps going", 1-2 a film: a tilt up (or down, into a place) over a tall thing | A6, D2, B11, C3, N11 |
| I6 | The crane: the rise-over (S1) | 3·3·4 | 3.33 | arrival, "here it all is": the camera rises over a near wall (S1); the one big move when it is S1 | C2, C3, E6, N6, Z1 |

**RARE:** none.

**NOT FOR US** (4: the owner's 1, ours 3)

| # | name | A·S·F | mean | why not | instead |
|---|---|---|---|---|---|
| RM9 | The handheld pass | 1·1·1 | 1.00 | DIRECTION 8: every hold is locked or a slow float | RM7, RM5 |
| *ours* | | | | | |
| X6 | The dolly zoom | 2·1·1 | 1.33 | a compound move and a feeling we never want (DIRECTION 8: one variable per move) | RM4 or I4, one variable each |
| X10 | The crash zoom and punch-ins on every key word | 2·1·1 | 1.33 | an editing tic that spends the eye's orienting response on nothing (DIRECTION 8) | one RM4 on the payoff word |
| X9 | A zoom in a hold (the breathe, the per-shot push) | 1·1·1 | 1.00 | DIRECTION's Retired list: no zoom, push or "breathe" in a hold; World push and ShotCam push: true are defaults to switch off | RM7 or RM5; RM4 only as a story move |

### 0.5 Joins (19): CORE 7, SITUATIONAL 6, RARE 2, NOT FOR US 4

**CORE** (7: the owner's 2, ours 5)

| # | name | A·S·F | mean | use it when | carrier |
|---|---|---|---|---|---|
| RJ3 | The loop back to the opening frame | 3·4·5 | 4.00 | the end of every film: the last frame un-builds to frame 0's drawing | the loop (un-build) |
| RJ4 | One continuous take, no cut | 4·5·5 | 4.67 | any change inside one place (closer, wider, along it): no cut is seen | C |
| *ours* | | | | | |
| J2 | The push-through, and the pull-out of an opening (carrier A) | 5·5·5 | 5.00 | into a place or a thing seen through an opening in this shot | A |
| J3 | The match cut on shape (carrier B) | 4·5·5 | 4.67 | to another place with the thread: one shape keeps its spot across a cut | B |
| J4 | The match cut on light and colour | 5·4·4 | 4.33 | "the same light, somewhere else" or "the same place, later": the bright shape or the hot accent keeps its spot | B |
| J10 | The morph: one thing becomes the next | 5·5·3 | 4.33 | "this IS that": one object becomes the next, staged; 0-2 a film, never two in a row | B or E |
| J11 | The light change: time passes in place | 4·4·4 | 4.00 | time passes in place, or the key turns on a story beat: the same frame, its light changed | the light, in place |

**SITUATIONAL** (6: the owner's 0, ours 6)

| # | name | A·S·F | mean | use it when | carrier |
|---|---|---|---|---|---|
| *ours* | | | | | |
| J6 | The eyeline: the look carries | 3·4·4 | 3.67 | "what it sees": the "you" looks, the next view is the thing it looks at | A or C (a push along the sightline) |
| J7 | The carry (carrier D) | 3·4·4 | 3.67 | "it went there": a traveller leaves one edge and enters the next shot from the opposite one | D |
| J15 | The sound bridge (the J-cut and the L-cut) | 3·4·4 | 3.67 | a join into or out of a place with its own sound: its ambience leads or trails the picture | sound, under any carrier |
| J5 | The cut on action (a match on motion) | 4·3·3 | 3.33 | "it keeps happening": a cut mid-action into the next size or angle | F (B if the thread crosses) |
| J8 | The wipe by a near mass (carrier D) | 3·3·3 | 3.00 | a jump in scale or place that must not show, 1-2 a film: a near mass passes the lens | D |
| J13 | The card flip or swipe of the same paper (carrier E) | 3·3·3 | 3.00 | paper only: the chart turns to its next page in place | E |

**RARE** (2: the owner's 1, ours 1)

| # | name | A·S·F | mean | use it when | carrier |
|---|---|---|---|---|---|
| RJ2 | The hard cut | 3·3·2 | 2.67 | the "But" turn only, at most 2 a film, the thread on both sides | F |
| *ours* | | | | | |
| T2 | Pinned-anchor jump cuts | 3·3·2 | 2.67 | "meanwhile, still this", once: 2-4 quick cuts round one anchor pinned at its spot | B (each cut carries the anchor) |

**NOT FOR US** (4: the owner's 2, ours 2)

| # | name | A·S·F | mean | why not | instead |
|---|---|---|---|---|---|
| RJ1 | The hard cut through the black line card | 1·1·1 | 1.00 | a list's grammar: every join carries something (DIRECTION 1; the owner: "a bunch of shots put together") | a carried join (RJ4, J2, J3); the line-first lives on as RM8 |
| X3 | The fade-in under the lines (the opacity cross-fade) | 1·1·1 | 1.00 | DIRECTION 8: no opacity fades; a declared time-passing dissolve stays the one exception (G3_ANIMATIC §4) | J11 for time passing; RM8's un-draw for an overlay |
| *ours* | | | | | |
| J9 | The whip (a carry at speed) | 2·2·1 | 1.67 | a whip hides its cut in blur and its speed fights "alive but calm" (unless declared: MR19) | J7 the carry, J8 the wipe |
| X11 | Effect transitions: spins, glitches, RGB splits and flashes | 1·1·1 | 1.00 | a full-frame onset with no place to look (DIRECTION 4, 8); never > 3 flashes a second | a carried join |

### 0.6 Where the judges split by 2 or more (24 entries), and how it was settled

The three lenses measure different things, so they split where a tool is quiet but free (a structure our frame already
has: high fit, low attention) or loud but costly (high attention, low fit). **How settled:** by the rule, never by hand:
the mean decides the tier. 22 of the 24 would change tier if their outlying lens were dropped (all but D1 and J10), so
for those the split decides the CONDITION of use: the low lens names the risk, and the entry's condition in Part 0
guards against it. The judges' own reasons are in `composition/judges/`.

| # | A·S·F | why they split | settled |
|---|---|---|---|
| A1 | 1·3·3 | attention: no gaze evidence, the first look lands on the centre whatever sits on a third; story and fit: a sound 2:1 proportion | RARE by the mean; its proportion half is rule 6, in every exterior |
| A3 | 1·3·3 | attention: the big form and the small subject are two calls; story and fit: a small discovery under a big form | RARE; only when the small subject carries the light and the onset |
| A5 | 1·2·3 | attention: two feet ~226 px apart split the eye; fit: free on the stage square | RARE; at the turn, N14 or J11 first |
| B1 | 3·4·5 | attention: the eye does not ride lines, their end draws looks only with the subject and the light there; fit: our ground recedes anyway, at no cost | CORE, on attention's condition: end the lines at the story light (rule 4) |
| B8 | 2·3·4 | attention: a slow way in, no thumb-stop; fit: the organic line the owner asked for | SITUATIONAL; light its end, or let the thread travel it (RM1) |
| B9 | 2·3·4 | attention: a big shape beside the subject; fit: LAYOUT's BALCONY curve, free | SITUATIONAL; from the raised view only |
| B10 | 2·3·4 | attention and story: no pull or job of its own; fit: the cozy frame's skeleton | SITUATIONAL; a frame, never the call |
| C2 | 1·2·4 | attention: under the name block and its scrim; story: one more named object; fit: the owner's hint at the edges | RARE as the shot's device; the hint is rule 10, in every shot |
| C3 | 2·4·4 | attention: two levels split the first look unless one is tone-on-tone; story and fit: cause and effect in one view, the tall frame made for it | SITUATIONAL; the light hands the focal from cause to effect (I11) |
| D1 | 3·5·5 | attention: a 130-220 px subject holds a calm beat but does not stop a thumb; story and fit: the owner's cure for "our scene is very busy" | CORE either way; never the hook's frame |
| D4 | 2·3·4 | attention and story: a balance, not a pull; fit: R8 placed for our crop, free | SITUATIONAL as the shot's device; rule 9 in every frame |
| E5 | 2·2·4 | attention and story: a restraint with no job, under the name block; fit: softness by value at no cost | RARE as the shot's device; softness by value in every near thing (rule 10) |
| E6 | 3·3·5 | attention and story: a quieting tool; fit: `CRAFT.md` §f.2 as written | SITUATIONAL as the shot's device; every exterior keeps §f.2's steps |
| E10 | 2·4·5 | attention: a body is a magnet that can take the first look; story and fit: DIRECTION 7's "you" exactly | SITUATIONAL; attention's risk becomes the check: tier B, its pull < 50 % of the focal's, its sightline through the focal's box |
| N2 | 3·4·5 | attention: structure, not a pull; fit: the frame's own grammar | CORE (every shot) |
| N3 | 2·3·4 | attention: no effect of its own; fit: the master decision of every exterior, only partly built (no setup helper) | SITUATIONAL as the shot's device; rule 6 in every exterior |
| N6 | 2·3·5 | attention: the pull belongs to E6, I12 and I4; fit: the tall frame's own depth | SITUATIONAL as the shot's device; rule 2 in every exterior |
| N13 | 3·3·5 | attention and story: the person and the opening are two calls, its job is mood; fit: LAYOUT §2's cozy home in one device | SITUATIONAL; the cozy home's frame, with B10 and C1 (>= 50 % of the runtime) |
| Z2 | 2·4·4 | attention: no lever of its own; story and fit: the home view | SITUATIONAL; its composing is N13's, C1's or E6's |
| S2 | 4·2·3 | attention: the clearest gist we can draw (a ~650 px disc, 3 values); story: the sun is the subject only on a time line; fit: it sets aside the lit and shade faces (DIRECTION 5) | SITUATIONAL; once a film, on a time-passing or ending line |
| RM5 | 2·2·5 | attention and story: under the capture threshold on purpose, no story job; fit: the owner's approved float | SITUATIONAL; DIRECTION 8 governs every hold anyway (locked or the float) |
| RM7 | 3·4·5 | attention: calm on its own, it needs slow life; fit: free, 17 of the reels' 23 example shots | CORE; never > 1 s without a mover |
| RJ3 | 3·4·5 | attention: nothing for the first 3 s, where most viewers leave; story and fit: DIRECTION 9's loop, built | CORE (once, in every film) |
| J10 | 5·5·3 | attention and story: one tracked object, "this IS that" (staged transitions helped viewers track change); fit: a new helper and a risk of a pasted look | CORE either way; build the staged-morph helper before a film plans one |

## PART 0b. THE GUIDELINES

How to use the library in a film: which tools for which beat and feeling (§1), how the shots follow each other (§2), how
a frame, its move and its join fit together (§3), and the rules every shot keeps (§4). Codes are Part 0's; a tier word
in capitals names the tier of the codes after it.

### 1. When to use which

**By story beat** (CORE first, then SITUATIONAL, then RARE; one frame device leads each shot):

| beat | the frame | the move inside the shot | the join out (carrier) | in numbers |
|---|---|---|---|---|
| **The hook, 0-3 s** (one continuous shot, never still) | CORE T + N7 + N1: one subject >= 400 px wide on the axis, drawn first; E2 or C1 (the subject in its lit opening); E8 (its one accent). SITUATIONAL E11 (the effect lands in the hand), E10 | RM8 the draw-on, then RM7 or one RM4; RM6 the light on the payoff word | RJ4 (C) or J2 (A) into the subject; no cut before the hook lands | the first word at ~0.12 s; 0-0.4 s the words and the gist; 0.4-0.7 s (24-42 f) the bold onset peaks in the golden box; 1.2-1.7 s a second change; ~2 s reality overtakes |
| **Setup: the home place** | CORE C1 + E2 (the opening), B1, B2 + E7 (the street, the path), D1 (the sky above). SITUATIONAL N13, B10 (the cozy frame), Z2, E10 and E4 (the "you" near, looking in), E6, N6, N3. RARE C2 as the framing | RM7 or RM5; RM1 the subject arrives along the line | J2 through the opening (A), J3 on the thread (B), RJ4 inside the place (C) | the home place >= 50 % of the runtime; the "you" 130-220 px; the focal within 150 px of the last shot's |
| **Explain: the mechanism** | CORE E9 (the cause's path), D7 (one among many), Z4 (the paper), N9 (the detail). SITUATIONAL C3 (cause above, effect below), Z3, E3, B3 | RM1 along the cause's line; RM8 the build (one tick per unit of cause); I11 the light passes from cause to effect | J3 (B), J10 (this becomes that), RJ4 (C), J7 (D: the thread travels on) | each step held >= 0.4 s; separate reads >= 0.5 s (30 f) apart; a build's pieces every 0.1-0.2 s; one causal chain at a time |
| **The turn ("But")** | CORE N14 (the same frame, one change), E2 (its light going out). SITUATIONAL A7 broken at the axis, B11 inverted. RARE N15, B6, M3 (once) | RM7: a hold of 0.5-1.0 s after the heaviest line; I11 | J11 (the key turns, in place), or in by RJ2 (F, at most 2 a film) | the only place the focal may jump > 370 px; the next beat returns to the focal home |
| **A reveal (scale)** | CORE D2, B4 or C1 (the threshold), D1. SITUATIONAL Z1, N6, E6, E1 (the tiny anchor), N11 (on the quantity) | I4 (S5) or I6 (S1), once, with I12 the pivot; I5 the tilt | in by RJ4, or RJ2 only on a "But"; J8 hides what a pull cannot show; out by J2 back home | 1-2 scale moments a film, ~1.5-4 s each; never two scale wides in a row; a pull carries its own event |
| **A list or a comparison** | CORE N14 (before and after, in sequence), D7 (one among many), Z4 (the number). RARE D6 (one seam), D5 (the lineup), T2 | RM7; units pop by rows on their words (never one by one for forty); RM6 | J3 or J4 (B: ONE change across), J13 (E: the next page), J10 | the anchor within 150 px (190 for a light), its size within 1.5x |
| **The payoff** | CORE E2 + E8 at the film's hardest step, N14 (the home view matched), Z4 (the number). SITUATIONAL E11 (in the hand), A7 | RM4 or RM6 on the payoff word; RM8 a chart line in step with the voice | in by J2, or I4 back out to the matched frame | every signal on the payoff word, the picture ~0.1 s (6 f) ahead; the release in a voice pause >= 0.8 s (48 f) (`SOUND_SYNC.md`); held >= 1 s after a number lands |
| **The loop** | CORE T and N14: the last frame is frame 0's drawing state. SITUATIONAL A7 (a formal end) | RM7 | RJ3: the un-build 0.5 s (30 f), then the draw-on >= 1 s | the captions back to page 1 ~0.22 s (13 f) before the seam |

**By emotion:**

| feeling | the frame | the move | the join | how it reads, in numbers |
|---|---|---|---|---|
| **Wonder** (awe, "bigger than you thought") | CORE D2, B4. SITUATIONAL Z1, N11 (on the quantity), E6, N6, E1 | I5 up, I4 (S5), I6 (S1); RM6 a light event | RJ4; RJ2 only on a "But" (the scale jolt: the figure 6-20x smaller) | a giant >= 10:1 over a 130-220 px figure; 5-7 planes; 1-2 moments a film |
| **Warmth** (cozy, home) | CORE C1 + E2, D7's one lit window. SITUATIONAL N13, B10, B9, E10 | RM7, RM5 (8-15 px/s) | J2 through the opening | affinity: level lines, close values, one warm key, slow life; >= 50 % of the runtime |
| **Tension** | CORE N9 (the close), N14 about to change. SITUATIONAL B11 inverted, A7 broken. RARE N15, M3, B6 | RM4 (a looming push on its word), then RM7 before the break | RJ2 (F), J11 (the key turns) | contrast: the hardest step, one diagonal, a size jump of 1.5-2x; once or twice a film |
| **Surprise** | CORE T with RM8 (the expected thing, then reality overtaking it), D7's break appearing, E2 lighting | RM6 (an onset of 0.1-0.3 s), RM8 | J10 (this IS that), J3 | at ~2 s in the hook; one onset, its sound on its first visible frame or up to 2 f after |
| **Calm** (a breather, time passing) | CORE D1. SITUATIONAL S2, A7, E3, B8, D4 | RM7, RM5, RM2 (a slow flow) | J11, RJ4 | no onset near the focal; clouds 0-15 px/s; held 2.5-3 s; never next to the big move |

### 2. Sequencing and rhythm

1. **Shot length.** Shots (panels) average >= 3.5 s (210 f; DIRECTION 1; a C move inside a panel keeps one shot), so a
   40 s film is ~10-12 shots and a 30 s one ~8-9. Vary them, never three near-equal in a row: a held peak 1.5-3 s
   (90-180 f); the big move 2.0-5.0 s plus its hold; a breather 2.5-3 s; a scale moment ~1.5-4 s; the paper held >= 1 s
   after its number lands.
2. **The change rate lives in the events, not the cuts.** Something new on the subject every ~1.5-3 s (90-180 f), a
   caption page every ~1.1-1.5 s (66-90 f), a build's pieces every 0.1-0.2 s (6-12 f); separate reads >= 0.5 s (30 f)
   apart; never > 1 s without a mover. Joins stay few and carried: ~9-11 a film, plain cuts at most 2.
3. **How many frame devices.** One device leads each shot (rule 8). A 10-12-shot film uses **6-9 different frame
   devices: 4-6 CORE, 2-3 SITUATIONAL, 0-2 RARE (each at most once), never one NOT FOR US**; about 7 in 10 shots lead
   with a CORE frame. The home place's devices come back with it (the callback is N14); any other device at most twice,
   never in neighbouring shots.
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
6. **Where to rest.** After a dense or a scale beat, a breather (D1 or S2, 2.5-3 s, never next to the big move); after
   the heaviest line, a hold of 0.5-1.0 s (the turn); after the big move, a landing hold >= 30 f below 5 % of its peak
   speed; at the payoff, the release in a voice pause >= 0.8 s (48 f) and a hold >= 1 s. The sound rests too: after
   the hook's 4-5 hard syncs, at most one per 10 s until the release (`SOUND_SYNC.md`).

### 3. How animation and transitions fit

**The grammar: a frame's device already holds its motion.** Lines are a path, an opening is a portal, a shape at a fixed
spot is an anchor, a tall thing is a tilt, a near layer is parallax and a wiper, a quiet field is a hold
(`composition/motion.md` §2, from the owner's 41 in motion). So a shot is planned in this order: the frame, then the
move it holds, then the join it offers, with the carrier that join needs:

| the frame's device | the move inside the shot | the join out | the carrier it needs | timing (s / 60 fps frames) and easing |
|---|---|---|---|---|
| **An opening** (C1, E2, B4, B13, N13's window, D7's lit window, E11's screen) | RM7 while the subject crosses or stands in it (RM1, ~1-2 s); or RM4 toward it; I11 it brightens a step | J2 the push-through | A: the opening itself, 15-30 % of the frame on the axis, shown >= 0.5 s (30 f), its aperture the lightest area below the sky | J2 1.1 s (66 f): in 0.5 s (30 f) in-cubic to 7x, out 0.6 s (36 f) out-cubic; the next focal where the aperture's centre was (within 150 px) |
| **Lines into depth** (B1, B2, E7, B8, B11) | RM1 the subject travels the line and arrives on its word; or RM4 a push along it, anchored on its end | J2 into the end's door; J3 on the end point; J7 along the line | A (an opening at the end), B (the end point held), D (the traveller) | RM1 ~0.8 x its height in px/s (the 180 px "you" ~150 px/s, 2.5 px/f), an opening crossed in 1-2 s (60-120 f); RM4 >= 3 % in <= 2 s (120 f), a lean-in out-cubic, a drawn-in push peaking at 65-80 % |
| **One shape or light at one spot** (A6's vertical, A7's axis, D5's apex, E2's bright shape, E8's accent, N14) | RM7 (the anchor still) | J3 on the shape; J4 on the light | B: the anchor within 150 px and 1.5x (the thread itself 1.2x), a light within 190 px; ONE change across | 0 f, at the anchor's fastest move or on the next sentence's first word; a match zoom 8 + 6 + 12 f |
| **A tall thing** (D2, A6, N11, B11) | I5 the tilt up (down: into a place) | in by RJ2 only on a "But"; out by RJ4 or J2 | C (the camera continues); F at the turn | I5 600-900 px in 3.5-4.5 s (210-270 f), front-loaded (trapezoid(0.1, 0.6)), no zoom-out; the band one flat field at every frame |
| **Two levels** (C3) | I5 or I6 between them; I11 the light passes from cause to effect | RJ4 the camera follows the cause to the effect | C | I6 400-700 px in 2.5-3.5 s (700 px needs >= 2.9 s); I11 a lamp 6-18 f |
| **A near layer** (C2, E5, B10's wing) | RM5 the float (the near plane moves most); I6 it slides out of the bottom | J8 the wipe | D: our own tier-C near mass in the clean pen, already in the shot, never a stranger's back | J8 0.8 s (48 f), on screen <= 0.5 s, >= 70 % of the stage covered on the cut frame, an in-out sine edge at ~50 px/f; 1-2 a film |
| **Negative space** (D1, S2, Z1's sky) | RM7 or RM5, never a push | J11 the light changes; RJ4 out by a rise | the light, in place; C | RM5 8-15 px/s (0.13-0.25 px/f), legs turning every 0.6-1.5 s; J11 a lamp 0.1-0.3 s (6-18 f), the sky 0.8-1.5 s (48-90 f) |
| **A pattern with one break** (D7, D5) | RM6 the break lights; RM8 the build (units pop by rows) | J4 the lit window matched; J2 into it | B; A | RM6 0.1-0.3 s (6-18 f), its bloom ramping at the source, >= 0.5 s from any other onset; a build's pieces every 0.1-0.2 s |
| **A still subject, a moving world** (E3) | RM2 a flow behind it; or I12, the camera moving round the held subject | RJ4 (the pivot carries the eye) | C | the subject within +-40 px; <= 3-4 movers taking turns (~0.6 entries a second); none in the 0.4 s round a join |
| **The subject travelling** (E9, E1, B8) | RM1 (the camera holds) | J7 the carry; J2 into where it arrived; J5 on a cut mid-action | D (the traveller); A | J7 the same speed (within ~10 %) and direction, entering within 0-2 f; J5 the motion starts >= 4-6 f before the cut and runs >= 0.3 s (18 f) after it |
| **The line first** (T, N7) | RM8 the draw-on | RJ3 the loop | frame 0's drawing | RM8 >= 1 s (60 f) peaking after 0.4 s (24 f), one pen tip at 12-25 px/f, strokes 6-12 f, fills ~7 f, pops peaking at ~12 f (~7 % overshoot); RJ3 0.5 s (30 f), all ease-in |
| **The close and the paper** (N9, Z4, Z3) | RM4 <= 2x per panel to reach it, then RM7; RM8 a chart line in step with the voice | J13 the flip (paper); J10 the morph (this becomes that); J2 into the paper | E; B or E | J13 a pre-tilt 0.62 s (37 f) before the cut, flat 0.45 s (27 f) after; J10 0.4-0.8 s (24-48 f), staged (position, then shape and colour, then the world), slow in and out |
| **The "you" looking** (E10, E4) | RM7; the head turns 0.3-0.5 s before the beat | J6 the eyeline, usually a push along the sightline | A or C | the look held >= 0.5 s (30 f); the next focal within 150 px of the gaze line's end |
| **The scale reveal** (D2, Z1, N6, E6) | I4 the pull-back (S5) or I6 the rise-over (S1), with I12 the pivot | in by RJ4, or RJ2 on a "But"; out by J2 back home or RJ4 | C; A | I4 2.0-5.0 s, default 3.3 s = 156 f of move + 42 f of hold, S5_EASE cubic-bezier(0.55, 0.03, 0.50, 1.0), the far plane's peak ~14 px/f; a continuous pull <= ~2.3x, beyond it J8 or J2 |
| **The turn** (N15, M3, B6, B11 inverted) | RM7, a hold of 0.5-1.0 s after the line | in by RJ2 (or a push landing off-centre); out by a carrier, never a second plain cut | F | RJ2 0 f; a size change >= 1.5-2x (G3_ANIMATIC: >= 20 %) or the angle >= 30 degrees; the incoming camera already moving (its first key 0.5-1.5 s before the cut) |

**The numbers the table leaves out:**
- **RJ4 the continuous camera (C):** Film's camera-continuous, dur 1.4 s: the outgoing leg accelerates into the cut over
  0.7 s (42 f, in-cubic), the incoming leg goes on at the same velocity and settles over 1.4 s (84 f, out-cubic); its
  travel <= 1.15x in zoom or <= 150 px; the subject the pivot (+-40 px); a seam on a held frame or mid-move, never on an
  event.
- **RM7 the hold:** a held peak of 1.5-3 s (90-180 f); never > 1 s without a mover; a story change on the subject every
  ~1.5-3 s.
- **RM3 the follow:** the camera starts 2-4 f after the subject and lands after it; the subject held at x 410-560 (a
  truck) or on the axis (a tilt), within +-40 px; the background drawn as the view plus the travel (+40 px overscan);
  never two follows in a row.
- **T2 the pinned-anchor cuts:** 2-4 cuts of 20-30 f round one bright anchor held within +-10 px; each counts as a B
  join, never an F.

**Shared by every move and join:**
- **One story motion at a time:** the camera holds and the subject moves, or the camera moves and the subject is the
  pivot (+-40 px); never both freely. The world's life stays slow, even and low in contrast.
- **Timing:** a join's midpoint on the next sentence's first word, in the voice's pause; nothing enters, pops or turns
  in the 0.4 s (24 f) round it, while slow life already moving keeps its pace; never a cut in the middle of a move (a
  cut on action aside); the picture leads its word by ~0.1 s (6 f), 0.3 s (18 f) at most, never after.
- **Easing:** arrivals decelerate over 15-27 f (cubic-bezier(0.05, 0.7, 0.1, 1.0)), exits accelerate over 9-15 f
  (cubic-bezier(0.3, 0.0, 0.8, 0.15)); a camera move eases in AND out (in-out cubic; a 4-6 s one in-out sine); a long
  move cruises (trapezoid(0.25, 0.35), its peak 1.43x the mean); a join's two legs meet at one velocity; drifts are
  linear; never a linear camera start or stop, a camera bounce, or staggered starts across many movers. Position and
  scale only, never opacity.
- **Speed:** detailed layers <= ~15 px/f (the one budget: `video/docs/PIPELINE_V2.md` "Frame rate"); a full-frame
  sideways pan of detail <= ~6.4 px/f (est.); the eye follows one point to ~37 px/f; a carrier's flat mass may pass at
  50-90 px/f (checked for direction and speed instead); huge means slow, the near mover is the fastest.
- **Drawing:** drawn poses step (held ~5 f) while the camera, the parallax, the light and the captions move every frame;
  a fast transit is one smear drawing held 2-3 f.
- **Sound** (`SOUND_SYNC.md` wins): a hard sync on its event's first visible frame or up to 2 f after, never before; a
  soft carrier sound only on a fast carrier (a push-through's rush, a wipe's air), cresting on the join's midpoint
  +-2 f; a place's ambience may lead its picture by 0.2-0.5 s (12-30 f) and trail 0.3-1.0 s (18-60 f) under the next,
  ducked, one bridge per join (J15); never a whoosh on every join.

**The dose per film** (a 40 s film of ~11 shots and ~10 joins; the owner's words and DIRECTION set the bounds, the tiers
the order of reach):

| tool | per film | set by |
|---|---|---|
| holds RM7 or RM5 | most shots; never > 1 s without a mover | DIRECTION 8 |
| RM1 the subject travels | the default life of a held shot (about half the shots) | `motion.md` §1.2: 11 of the reels' 25 shots |
| RM4 the story push | <= 1 per beat (2-4 a film), each on its word | DIRECTION 8 |
| RM6 / I11 the light events | 1-3, each >= 0.5 s from other onsets | MR11 |
| RM8 the draw-on | frame 0, then 0-2 where the drawing is the beat | DIRECTION 8-9 |
| I4 or I6, the one big move | exactly 1 (S1 or S5, never both) | DIRECTION 7; `CINEMATIC_GUIDE.md` rule 3 |
| I5 the tilt | 0-2 (the scale moments) | DIRECTION 7 |
| RM3 the follow | 0-2, never two in a row | §2 above |
| RJ4 (C) | most joins inside one place (3-5) | `CRAFT.md` §a |
| J2 (A) | each entry into another place through an opening (1-3) | `CRAFT.md` §a |
| J3 / J4 (B) | the thread's joins between places (1-3) | `CRAFT.md` §a |
| J11 the light change | 1-2 (the key changes only on a story turn) | DIRECTION 5 |
| J10 the morph | 0-2, never two in a row | MR17 |
| J7 / J8 (D) | J7 0-2; J8 1-2 at most | MR16 |
| J13 (E) | paper only | `CRAFT.md` §a |
| RJ2 (F) | 0-2, each on a "But" | DIRECTION 1 |
| RJ3 the loop | 1 | DIRECTION 9 |
| sound | one bridge per join where the place sounds; 4-5 hard syncs in the hook, <= 1 per 10 s after, one release | `SOUND_SYNC.md` |
| frames | 6-9 devices; 1-2 scale moments; S2 and S4 once each at most; A7 once (two at most); N12 once; N15 and M3 on the turn only | DIRECTION 7; `CINEMATIC_GUIDE.md` rule 5; C14 |

### 4. The rules (22)

The rules every shot keeps, drawn from `composition/principles.json` (its 130 rules, merged where several lanes say the
same thing; the ids after each rule are its sources there). Rules 1-13 keep the numbers the recipes cite; 14-22 add the
strongest of the attention, motion and modern lanes. "Proposal" applies to what no doc in force says yet (Part 2 §5).

1. **Design for the window the phone shows.** Key reads (the subject's action, a figure, a label, a number, a contact
   point) inside x 130-945 from y 600 to 860 and x 130-870 from y 860 to 1519; nothing to read above y 240 or at y >=
   1519; only masses run into x < 98 or > 982, under the rails and under the bottom UI; a thing cut by a side edge still
   reads with its outer 98 px gone. Words in the world >= 56 px, lines >= 2 px, a figure "doing what" >= 40 px and
   reliably 60-80 px. *CS1, V1-V4, V7, V11 (measured on the owner's recordings).*
2. **Three stacked pictures.** The words' sky (y 0-600: the band one flat field, no tops, lines, heads, props or shadow
   edges across it), the stage (y 600-1520: the story) and the near band (y 1250-1920: one quiet mass under the app's
   text, where light detail loses 10-20 % to the scrim). Depth stacks UP the frame: the near at the bottom, each farther
   plane higher, overlapping >= ~10 px, no two plane tops within ~40 px. Width is scarce (884 visible px), height is
   not: one stage, never a split screen. *CS2, M5, V10.*
3. **One focal, in its home.** The focal's centre on the subject axis x 380-700, by default within 130 px of x 540 and
   at y 950-1050 (the frame's centre y 960 and the stage's golden line y 951 meet there); the drop from the caption
   block's foot (y 556) 300-450 px (y ~856-1006), 650 at most; nothing calls in the drop. After every cut the focal is
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
   y 900-1020 (0.47-0.53 H; `LAYOUT.md` §2's street and eye-height scale horizons differ: Part 2 §5 row 5); S1 lands at
   y 768, S5 at 883, S3 ~1402, S4 ~1574, K7 1114-1229. Thirds as proportions: one quiet mass about twice the other,
   never two equal halves of anything. *CS6, C2, C3 (proposal).*
7. **People by the horizon-cut rule; the "you" soft, at one side, looking in.** Feet at y_h + P·c/h, the head's top at
   y_h - P·(h - c)/h (Part 2 §0). The "you": one figure of 130-220 px, from behind or in silhouette, tier B (its pull <
   50 % of the focal's), at x 130-380 facing right or x 700-830 facing left, its sightline crossing the focal's box, its
   head's top above y ~1380; lead room 1.5-2x; strangers small (mid walkers 110-260 px, far 15-60 px), in twos and
   threes, >= 220 px from the subject. *CS7, C9, L3, AR8.*
8. **One device per shot, and it delivers the eye to the focal.** Name one device by its code; a second only when it
   points at the same focal. Lines in 2-3 legs of >= 150 px at ~40-60 degrees, alternating sides, the last ending
   within 40 px of the focal's box; no line corner to corner, across the band or on into an empty vanishing point; the
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
11. **Sizes step 2-3x; an angle means something.** Extreme wide (the "you" 60-150 px), wide (the subject 15-35 % of the
    height), medium (270-460 px wide), close (one object >= 650 px), insert (one detail filling the stage); a push <= 2x
    per panel (beyond it, a push-through); a plain cut changes size by >= 20 % (G3_ANIMATIC §4, in force; this library
    asks 1.5-2x) or angle by >= 30 degrees, or keeps the exact frame; eye level by default, low only on the quantity,
    high once on crowds and patterns, overhead only as paper, never roll. *CS11, C4, C5, L9, AR3.*
12. **A move is three designed frames, and the subject is its pivot.** The start, middle (p 0.5) and end frames each
    pass rules 1-11 as stills (the middle at least the band and tangent checks); one variable per move, on one ease; the
    subject within +-40 px of its screen spot or on one path between two points of the golden box; the band a fixed
    mat; holds locked or the float, never a zoom. *CS12, MR1, MR2, C12.*
13. **Frame 0 peaks after the swipe settles.** The next reel settles ~0.4 s after the swipe: the opening's bold event
   lasts >= 1 s with its biggest change after 0.4 s. 0-0.4 s the words and the gist (frame 0 being drawn); 0.4-0.7 s the
   subject's onset peaks in the golden box with its sound; 1.2-1.7 s a second change on the subject; ~2 s reality
   overtakes. One subject on the axis >= 400 px wide with the hardest step; the first spoken line in the band from frame
   0; one pen tip in view at <= ~25 px/f; nothing important in the bottom 400 px or the outer 98 px. *CS13, AR15, V9,
   M27, MR23.*
14. **The subject owns the onsets.** Each beat has ONE onset, the subject's (a stroke drawing on, a pop, a tick, a light
    coming on), started inside the golden box (x 436-644, y 951-1168) within 0.1-0.4 s of a cut; tiers B and C drift in
    at a constant speed from an edge or from behind a mass, >= 370 px from the focal, never within 0.5 s of A's onset;
    every change leaves its new state on screen >= 0.5 s (better >= 1 s); events the viewer must catch >= 0.5 s apart.
    *L1, AR5, AR6.*
15. **One signal, on its word.** The caption's keyword, the light's peak, the accent's arrival and the push land on the
    same word, the picture ~0.1 s ahead (0.3 s at most, never after); the cue is the light (the surround 10-20 L* under
    its pool), never arrows, rings or callout boxes. *M26, AR7, AR11, L7, L13; DIRECTION 8.*
16. **Event rate, not cut rate.** Something new on the subject every ~1.5-3 s from its own build, a caption page every
    1.1-1.5 s, shots averaging >= 3.5 s, at most 2 plain cuts; no decorative interrupt; the hook's arousing beat never
    stacked with fast cuts. *L15, AR14, M12.*
17. **Pick the move and the join from the frame's device** (§3): an opening -> J2; one shape or light at one spot -> J3
    or J4; lines into depth -> RM1 or RM4; a tall thing -> I5; two levels -> I5 or I6; a near layer -> RM5 and J8;
    negative space -> RM7 or RM5, never a push; a pattern's break -> RM6 or RM8; time passing -> J11; the turn -> RJ2.
    *MR3, MR12.*
18. **Every camera move has a story reason.** A push is looming ("this matters"): >= 3 % in <= 2 s, <= 2x per panel,
   scaled about its target's centre, one per beat; a pull carries its own event (a light burst, the landmark rising on
   its word); a vertical reveal is slow and front-loaded; holds are locked or the float (8-15 px/s, home by every join);
   no zoom in a hold, no roll, no compound move. *M14, MR5-MR8; DIRECTION 8.*
19. **The eye stays where it is across a join.** The next focal within 150 px of the last (190 px for a light match,
    370 px at most; farther only on a plain cut); the join sits at a breakpoint (the end of a sentence or an action),
    its midpoint on the next sentence's first word, nothing new in the 0.4 s round it. *M19, AR13, MR13, MR21; CRAFT
    §a.*
20. **Ease and pace like current motion design, inside our speed budget.** Arrivals decelerate (15-27 f), exits
    accelerate (9-15 f), camera moves ease in and out, a join's legs meet at one velocity, travellers move on arcs;
    detailed layers <= ~15 px/f, a sideways pan of detail <= ~6.4 px/f, a walker ~0.8 x its height in px per second;
    drawn poses step (~5 f) while the camera glides. *M15, M16, M18, MR9, MR10, MR22.*
21. **Sound on the change, spent and not sprinkled** (`SOUND_SYNC.md` wins on sound). A hard sync is one short sound on
    one discrete change of the subject, on its first visible frame or up to 2 f after; 4-5 of them in the hook's first
    2-4.4 s, then at most one per 10 s, and ONE release at the payoff in a voice pause >= 0.8 s; hard syncs >= 0.5 s
    apart; nothing on tier-C life or on continuous motion; at most one soft sound per fast join. *L10, AR12, MR20, M23,
    as `SOUND_SYNC.md` settles them.*
22. **Check it cheaply.** The flash test (each key frame 0.25 s at feed size: what is it, where did you look?); an onset
   map per 0.5 s window (tier A >= 60 % of the pixels that start moving); a glyph check outside the band; the speed
   check (`video/scripts/camspeed.py`, with a lateral WARN), `video/scripts/qa/deadframes.py`,
   `video/scripts/qa/gate_check.py`, and the join checks (the anchor, the carry, the aperture, the sound offset) as they
   land. *AR18, MR24.*

## PART 1. THE CATALOGUE IN DETAIL

Every entry of Part 0 with its reference and its numbers in our frame. **§D1 is the spine:** the 41 ideas of the
owner's five reels, in `composition/reels.md`'s order and with the reels' own names (A placement, B lines, C frames and
levels, D masses, E the moves the examples make without naming them), then T, the reels' own teaching device. Each
header gives the tier, the three scores (attention·story·fit) and whether we use the idea as it is or adapted; under it
the reference (the reel and the time in it: `composition/reels.md` §3, its tile on `composition/reels_sheet.jpg`), what
it is, where it sits in our 1080 x 1920 frame, the beats and recipes it serves and, when adapted, the change in numbers.
§D2 holds our frame additions (merged ones point to the owner's entry they joined), §D3 the moves and joins, §D4 the
coverage. Where a device is also a rule for every shot (A1, A2, C2, D4, E5, E6, N2, N3, N5, N6, N7: rules 2-10), its
*Serves* line names the rule; its tier is for building a shot around it. The numbers used are Part 2 §0's.

### D1. The owner's 41 ideas (the reels' order and names)

#### A. Where the subject sits

**A1 Rule of thirds** · RARE · 1·3·3 · adapted. *Reference:* 02 at 4.75 s (a photographer on a boat, her face on the
right line), 03 at 0 s (a palm on the left line, a boat circled on a crossing), 04a at 7.5 s (a face on the right line,
from low in the grass), 04b at 28.25 s (a near profile on the left line).
- *What:* the frame cut 3 x 3; the subject on a line, the horizon on a third, never on the half.
- *9:16:* the verticals x 360 / 720 are the subject axis's edges (on the owner's feed his visible thirds fall at x 393 /
  687, inside the axis); the horizontals y 640 (40 px under the band) and y 1280 (setup A's horizon: the sky two thirds,
  the band high in it).
- *Serves:* every exterior as a 2:1 proportion; the horizon on the lower third (SR9, SR14), the sky a third (SR2's
  raised variant), a landmark on the left third (SR16), a figure on x 360-420 or 660-720 facing in. **SR2, SR9, SR14,
  SR16.**
- *Change:* the lines are proportions and the axis's edges; the four crossings are never placement points (the upper two
  sit 40 px under the band, the lower two 30 px under the read zone's floor).

**A2 Golden section (the phi grid)** · SITUATIONAL · 3·4·4 · used as it is. *Reference:* 03 at 8.0 s (a lone tree on the
right line at the upper line, a river winding in front).
- *What:* lines at 0.382 / 0.618 of the frame, nearer the centre than the thirds.
- *9:16:* x 413 / 667 (inside the subject axis), y 733 (setup B's horizon band) and y 1187 (the floor of the focal box);
  the stage square's y 951 / 1169. The golden box x 413-667, y 951-1187 is the focal's home.
- *Serves:* every beat's focal (rule 3); named in SR1, SR6, SR8, SR12, SR20, SR21. **All recipes (rule 3).**

**A3 Golden section, nested** · RARE · 1·3·3 · adapted. *Reference:* 03 at 16.5 s (a big tree on the main line; a small
house, with a path to it, in the nested cell at its foot).
- *What:* the frame cut at phi and the smaller part cut again, homing in on one point.
- *9:16:* built on the full frame, the nested point falls at y 1190-1380 (at or under the read zone's floor). Built on
  the stage square: the big thing on x 667 (its top under the band, y >= 620), the ground on y 1169; the cell x 413-667,
  y 951-1169 cut again at x 510 / 570, y 1034 / 1086; the small subject at (570, 1086), at the big thing's foot.
- *Serves:* a big thing with the subject small at its foot: a tower or a tree and the lit window under it, the giant and
  the figure. **SR15, SR14.**
- *Change:* built on the stage square, not the frame.

**A4 Golden spiral / golden ratio** · NOT FOR US · 1·2·2 · the owner's override: Part 0.1. *Reference:* 03 at 2.5 s (a
treehouse at the spiral's eye), 04a at frame 0 (the walker toward the villa at the eye as the title appears), 04b at
22.25 s (a firework burst at the eye), 05 at 3.25 s (a hiker on a ledge at the eye).
- *What:* a spiral built on golden rectangles; the eye travels the curve into its pole, where the subject is.
- *9:16:* fitted to the frame (a 1080 x 1747 golden rectangle) its pole lands at x 298 / 782 and y 483-656 or 1265-1437:
  in the band or under the read zone. Scaled so its pole is the subject (x 540-700, y 1000-1200), its outer arcs leave
  the frame: in the tall frame the outer arc runs from the hero cloud in a top gutter down the side mass and in to the
  subject, tying the counterweight (rule 9) to the focal (rule 4).
- *Serves:* none while it is NOT FOR US; overruled, it returns as SR6's and SR24's variant (the subject's moment
  and the payoff's sweep). Instead: the sweep that ends on the focal, B1 or B8 with RM1.
- *Change:* scaled to its pole on the subject; never fitted to the frame.

**A5 Golden triangle** · RARE · 1·2·3 · adapted. *Reference:* 03 at 14.5 s (a mountain slope on the long diagonal, two
smoke plumes on the perpendiculars).
- *What:* one diagonal and the perpendiculars to it from the other two corners: three similar triangles, the subjects at
  the two feet.
- *9:16:* on the full frame the diagonal is 61 degrees and its feet fall at (820, 461) and (260, 1459): in the band and
  by the bottom UI. On the stage square (y 600-1520) the diagonal is 40.4 degrees and its feet fall at (626, 987) and
  (454, 1133) (rising to the right; mirrored (454, 987) and (626, 1133)): both inside the golden box. The slope (a hill,
  a ramp, the steps, a roof line) lies on the stage's diagonal, broken by the subject at one foot, a tier-B thing at the
  other; its high end in the gutter at y >= 620.
- *Serves:* a slope, the level change, the turn's one diagonal. **SR11, SR18.**
- *Change:* drawn on the stage square, never on the frame.

**A6 Cross** · SITUATIONAL · 3·4·3 · used as it is. *Reference:* 03 at 18.0 s (a bare tree's trunk crossing the horizon,
a moon at the upper left).
- *What:* one strong vertical crossing one strong horizontal.
- *9:16:* the tall frame gives the vertical its full height: a lamp post, a mast, a trunk, a standing figure or the
  giant's edge crossing the horizon at x 413-667 (setup A y 1150-1300; setup B y 690-860), its top under the band (y >=
  620) or in a gutter.
- *Serves:* a person's moment, an upright subject, the giant on its ground line. **SR9, SR15.**

**A7 Symmetry** · SITUATIONAL · 4·4·3 · used as it is. *Reference:* 02 at 7.5 s (a pavilion on a bridge mirrored in a
still lake at dusk), 04a at 3.0 s (a pier straight out to a red-and-white tower), the titles 01 at 0 s and 04b at 19.25
s (a carriage's two doors round the centre pole).
- *What:* a mirror axis down the centre, or the water's mirror; the subject on the axis.
- *9:16:* the axis x 540, 20 px from the captions' centre line (x 520), so the words sit on it; the landmark at y
  850-1040, the waterline at 1040-1100 (off the half), the reflection to y ~1300 a step darker; the halves within +-5 %
  in mass.
- *Serves:* a stillness or formal beat, the loop's end. **SR23.**
- *Merged:* M4, symmetry then the break (`composition/modern.md`): at most two such frames a film; the break,
  if any, is ONE change at the axis on the turn's word.

#### B. Lines that carry the eye

**B1 Leading lines** · CORE · 3·4·5 · used as it is. *Reference:* 02 at 10.0 s (a path through tea fields from the
bottom edge to a lone tree), 04a at 12.0 s (a sunlit path and a stair's rails converging on a man).
- *What:* lines in the scene (a path's edges, kerbs, rails, a coping, a stair, a melt line) that run to the subject.
- *9:16:* the ground fills the lower half, so the lines rise from the bottom edge (they may start under the bottom UI as
  mass edges) at 40-60 degrees, in 2-3 legs of >= 150 px, and end within 40 px of the focal's box at (480-640,
  950-1150), at the story light and the hardest value step (the lines lead, the light decides: rule 4). Never across the
  band, never on past the focal down to the name block.
- *Serves:* arrival, the thing at the end of the way, the payoff's sweep. **SR7, SR3, SR24.**

**B2 Vanishing point / one point** · CORE · 4·4·4 · used as it is. *Reference:* 01 at 13.0 s (a street of mansion
blocks, parked cars on both sides, closed by a house and trees), 04b at 25.25 s (a pier straight out into a misty lake,
a man where the lines cross).
- *What:* one-point perspective: every receding line meets at one point on the horizon, the subject at or in front of
  it.
- *9:16:* the vanishing point on the subject (within 60 px) or hidden behind it, at x 540-700, y 950-1150 (a lane's
  horizon y 1020-1150, off the half); the receding lines on the ground and the facades, ending under the band (the
  reels' X from the four corners is 61 degrees steep and its upper arms would cross it); the sight line closed by one
  object (E7).
- *Serves:* a street or a quay as the home place; the walk; arrival. **SR3, SR7.**

**B3 Radiating** · SITUATIONAL · 3·3·3 · used as it is. *Reference:* 03 at 13.0 s (railway tracks, wires and poles
fanning out from a vanishing point).
- *What:* lines spreading from one point like a starburst.
- *9:16:* the point on the subject (within 60 px of its box) in the golden box; the rays on the ground (tracks, paving
  joints, tyre tracks in the snow) and on the walls (courses, a hall's rows), 5-9 of them, tone-on-tone except where
  they meet; no ray across the band (wires only above y 290 or below y 600).
- *Serves:* a hall or a yard where everything points at one thing. **SR15, SR3, SR21.**

**B4 Tunnel** · CORE · 4·4·4 · adapted. *Reference:* 03 at 14.0 s (a railway tunnel's mouth in a rock face, the small
light at its end centred).
- *What:* a frame inside a frame, joined at the corners (a one-point box): the eye goes through to the small lit
  opening.
- *9:16:* a tunnel's ceiling would cross the band, so a tall portal instead (an arch under a bridge, a gateway, a
  passage): its sides in the gutters (x < 95, x > 945) through the band's height, its lintel above y 290 or cut by the
  top edge, so the band lies in the lit far field; the far opening at (540, 950-1100), its corners joined to the
  portal's by the receding walls.
- *Serves:* the start of a reveal (a push-through, carrier A); arrival. **SR3, SR17.**
- *Change:* a tall portal with the band in its far field, never a ceiling through the band.

**B5 Parallel lines** · RARE · 2·3·3 · adapted. *Reference:* 01 at 4.25 s (an escalator's handrails, the wall's edge and
a row of ad panels at ~40 degrees, the camera riding it).
- *What:* several lines in one direction: rhythm and a direction of travel.
- *9:16:* steps, railings, a ramp's courses or roof ridges at 30-60 degrees (the reel's 40 is the stage square's
  diagonal), 3-5 lines, kept below y 600 and inside the stage; in motion the lines hold and the things on them pass.
- *Serves:* travel and the mechanism on its way; the steps between two levels. **SR10, SR11.**
- *Change:* the lines kept below y 600 and in the stage.

**B6 Diagonal** · RARE · 2·3·3 · used as it is. *Reference:* 03 at 3.5 s (a hillside falling from the upper left to the
lower right).
- *What:* one dominant line across the frame: a slope, energy.
- *9:16:* the full frame's diagonal is 60.6 degrees (a climb), the stage square's 40.4: one dominant diagonal of 30-45
  degrees inside the stage, rising toward the focal and broken by it (no unbroken corner-to-corner line: rule 8); never
  across the band; never in a cozy beat.
- *Serves:* contrast: the turn, the slope a figure climbs, the seam on a diagonal. **SR18, SR11, SR20.**

**B7 Double diagonal** · RARE · 2·2·2 · adapted. *Reference:* 03 at 11.5 s (two roads crossing, seen from above, lamps
along them).
- *What:* two diagonals crossing (an X, not from the corners).
- *9:16:* straight from above, the X's arms would cross the band. From SR5's balcony (35-55 degrees down, the lid's flat
  facade behind the band) a crossroads seen corner-on makes the X: the crossing in the golden box at (540, 1000-1100),
  the arms 30-50 degrees from level leaving by the side edges below y 620, the lamps along them as texture.
- *Serves:* the home place from above; two flows meeting at one place (two streets, two pipes). **SR5 (variant).**
- *Change:* SR5's raised angle, the crossing on the focal, once a film.

**B8 S-curve** · SITUATIONAL · 2·3·4 · used as it is. *Reference:* 03 at 5.5 s (a river curving between trees into the
distance).
- *What:* a winding line from the near frame to the far, leading the eye slowly through the depth.
- *9:16:* the tall ground holds one more bend than a landscape frame: 2-3 bends entering at the bottom edge (x 250-830),
  each 25-40 % W wide and about half the width of the bend below it, ending on or behind the focal at (480-640,
  950-1150); never through the band.
- *Serves:* a calm way in; arrival by water or path. **SR7 (the S variant).**
- *Merged:* N8 the zigzag way in (Poore: "triangulate in, with a series of zigzags"): where there is no line,
  2-3 legs of >= 150 px alternating sides, or a row of receding accents, ending within 40 px of the focal's box;
  this angular form serves SR7, SR11 and SR24's sweep.

**B9 C-shape** · SITUATIONAL · 2·3·4 · used as it is. *Reference:* 03 at 7.0 s (a big tree arching its trunk and canopy
over a valley).
- *What:* a curve that wraps the subject on one side, its opening facing the subject.
- *9:16:* LAYOUT's BALCONY curve: it enters just under the band (y 600-700), wraps the focal, leaves the other side at y
  860-1060 and dives under a mass through a mouth <= 150 px; the subject inside the curve or at its end, never outside
  it.
- *Serves:* the home place from above; a crowd's flow. **SR5.**

**B10 L-shape** · SITUATIONAL · 2·3·4 · used as it is. *Reference:* 03 at 6.0 s (a tall cypress at the left edge
standing on the horizon line, a low sun at the right).
- *What:* one tall vertical at one side plus the ground line: a frame on two sides, open on the others.
- *9:16:* our cozy asymmetric frame (LAYOUT §2): one tall side cut by the top edge, its face one flat field through the
  band (L* >= 70) or kept in the gutter (x < 95 / > 945) there; the ground line at y 1250-1450; the other side tops out
  below y 600; the focal toward the L's inner corner, in the golden box.
- *Serves:* the home place's cozy frame; refuge on two edges. **SR3, SR4.**
- *Merged:* N4 the repoussoir (`composition/cinema.md` §4.6): the L's tall side IS the one framing wing: one
  side only, cut by that edge, <= 216 px (20 % W) of visible width, quieter than the focal, never two equal wings.

**B11 V-shape** · SITUATIONAL · 3·3·3 · adapted. *Reference:* 03 at 9.0 s (two rows of tall buildings on a street,
converging).
- *What:* two masses sloping in to one point.
- *9:16:* the V's open top is the sky with the band in it: the slopes stay in the gutters (x < 95, x > 945) through y
  290-600, come in below it at 50-70 degrees from level and meet within 60 px of the focal (540, 950-1100).
- *Serves:* the lane's canyon; the turn's inverted triangle with its point at the focal. **SR3, SR18.**
- *Change:* the V opens round the band; its arms come in only below y 600.

**B12 Spiral composition** · RARE · 3·2·2 · adapted. *Reference:* 05 at 0 s (a spiral stair seen from straight above,
its pale floor at the centre, people dotted along the ramps).
- *What:* the subject's own spiral leads the eye round and in to its centre.
- *9:16:* straight from above, its rails would cross the band. From SR5's balcony (a high angle, once a film) the spiral
  sits under the lid: its centre at (540, 1000-1100), its outer turn <= 880 px wide inside x 98-982, people on the ramps
  as texture in twos and threes. At eye level the same idea is layout practice's spiral pathway: things placed round one
  curl that ends on the focal (`composition/cinema.md` §6.2).
- *Serves:* the home place from above; the payoff's sweep curling in. **SR5 (variant), SR24 (variant).**
- *Change:* SR5's raised angle under the lid, or a spiral pathway at eye level.

**B13 Circular** · RARE · 3·3·2 · adapted. *Reference:* 03 at 15.5 s (a round pond ringed by rocks and reeds).
- *What:* things in a ring that hold the eye inside it.
- *9:16:* seen from eye level a ring flattens to an ellipse, so two versions: a round window (an oculus, a porthole)
  300-500 px across as the one opening, its centre in the golden box, the view and the subject inside it (C1's round
  form); or a ring of things round the subject (units round the cause, lamps round a square) from a raised view, the
  subject inside the circuit, never outside it (Poore, via `composition/cinema.md` §4.11).
- *Serves:* the nook's opening; the lineup in a ring. **SR4 (variant), SR21 (variant).**
- *Change:* a round opening, or a ring seen from a raised camera.

#### C. Frames, layers and levels

**C1 Frame within a frame** · CORE · 4·5·5 · used as it is. *Reference:* 01 at 10.0 s (a platform's dark roof and two
pillars framing a train), 02 at 0 s (a round moon gate in a sunlit wall, a walker crossing it), 04a at 5.25 s (the gap
between two flights of a stairwell, a man on the stairs in it), the titles (two carriage windows).
- *What:* an opening inside the frame (a gate, a door, a window, a stairwell's gap) that frames the subject.
- *9:16:* tall openings fit: one opening on the axis, 15-30 % of the frame, its aperture's centre in the golden box, its
  top at y >= 620, the aperture >= 10 L* off its rim; a figure 150-300 px dark inside it.
- *Serves:* the subject's moment; the start of a push-through (A). **SR6, SR4, SR2, SR8, SR17.**

**C2 Foreground** · RARE · 1·2·4 · used as it is. *Reference:* 02 at 2.25 s (a lotus pond in the bottom 35 %, a pagoda
beyond it), 05 at 9.0 s (the corner of a white house's roof and terrace over the lower-left half, the sea beyond).
- *What:* a near layer at the frame's edge that gives depth and a place to stand.
- *9:16:* the near band (y 1250-1920) is its home, one mass that may run under the bottom UI; a hint: <= 2 props cut by
  an edge, inside the near shade mass (within 8 L*), its top at y 1450-1650.
- *Serves:* as the shot's framing device, rarely; as the hint at the edges, every exterior and the nook (rule 10).
  **SR2, SR7, SR4.** (05's terrace, half the frame, is the big near
  mass the owner rejected; the blur is E5's.)

**C3 Level change** · SITUATIONAL · 2·4·4 · used as it is. *Reference:* 01 at 7.25 s (a station footbridge's stair, a
walker high on it, three people waiting on the platform below).
- *What:* two levels in one frame, joined by a stair or a slope, with people on both.
- *9:16:* the height is made for it: the upper level at y 700-950, the lower at y 1150-1450, joined by steps or a slope
  of 30-45 degrees; the subject on one level in the golden box, the life or the effect on the other.
- *Serves:* cause and effect; two places joined. **SR11.**

#### D. Masses, balance and contrast

**D1 Negative space** · CORE · 3·5·5 · used as it is. *Reference:* 04a at 9.75 s (a boy low on the left third facing a
stepped stream in a forest).
- *What:* a small subject in a big field; the space gives it weight.
- *9:16:* the field is the sky with the band in it (or water, or snow): 60-80 % of the frame, patterned (+-4-6 L*,
  clouds in planes), never a hole; the subject small (130-220 px) at the field's foot, x 220-660, above y 1480.
- *Serves:* a breather; the turn's open side. **SR16, SR18.**

**D2 Scale** · CORE · 4·4·4 · used as it is. *Reference:* 04a at 16.5 s (a man at a bridge railing beside a weathered
red-and-white tower that fills half the picture).
- *What:* a small known thing (a person) beside a huge one, so the eye reads the size.
- *9:16:* the tall thing >= 0.7 H (>= 1344 px) and >= 10:1 over the figure, rising past the top edge (its face across
  the band one flat field, or its top in a gutter); the figure 130-220 px (60-150 px in a K wide) low near the axis (x
  420-660), its feet above y 1250.
- *Serves:* the scale beats. **SR15, SR14, SR17.**

**D3 Balance** · NOT FOR US · 1·2·2 · the owner's override: Part 0.1. *Reference:* 03 at 11.0 s (two trees of the same
size, one each side of a valley).
- *What:* two masses of equal weight, one on each side.
- *9:16:* in 884 visible px two equal masses become two equal calls (rule 4 allows one); used only as the symmetric
  frame of a centred subject: two soft dark masses cut by the side edges (each <= 216 px of visible width), mirrored
  within +-5 %, quieter than the one subject between them on x 540.
- *Serves:* none while it is NOT FOR US (SR23 keeps its mirrored banks as A7's own frame); two
  equal masses are two equal calls. Instead: D4's one soft counterweight.
- *Change:* the two masses are the frame, never the subjects.

**D4 Unbalanced (the steelyard)** · SITUATIONAL · 2·3·4 · adapted. *Reference:* 03 at 9.5 s (a big tree at the left, a
small house far right).
- *What:* unequal masses in balance: the farther out a mass sits, the more it weighs, so a small strong one near the
  centre is balanced by a big soft one far out (or the reverse).
- *9:16:* rule 9: the subject stays on the axis (0-130 px off x 540) and the big soft mass goes >= 300 px out on the
  other side (x < 240 or > 840), its pull < 50 % of the focal's: by default the hero cloud in a top gutter (y 0-290),
  cut by a side edge; never in the lower right (x > 830 below y 790), where the rail and the name block already weigh.
- *Serves:* every frame's balance; named in **SR2, SR9, SR16.**
- *Change:* the reel's small thing sits far out; ours, the subject, stays on the axis and the big soft mass goes out.
  (Its opposite, one heavy side with nothing against it, is our addition N15, for the turn.)

**D5 Pyramid** · RARE · 2·3·3 · used as it is. *Reference:* 03 at 4.5 s (a snowy peak, the triangle traced on its
slopes).
- *What:* a triangular mass, broad base and apex up: stable and calm.
- *9:16:* the base on the near ground (y 1350-1520, >= 540 px wide), the apex on the focal in the golden box with its
  top under the band (y >= 620), the sides 50-70 degrees, scalene, three spots at unequal distances.
- *Serves:* stable beats; how many (the cause at the apex, the units below). **SR21.**

**D6 Juxtaposition** · RARE · 2·3·3 · adapted. *Reference:* 05 at 6.0 s (a beach from straight above: the sea with
swimmers, rows of umbrellas, split by the diagonal shoreline).
- *What:* two contrasting things side by side, with one line between them.
- *9:16:* the seam runs across the stage (one state above, one below) or on a 30-45 degree diagonal; each field one
  value and one texture (means >= 13 L* apart); the subject at the seam in the golden box; seen at eye level or from a
  raised quay, not from straight above; never two stages stacked (X4, NOT FOR US: Part 0).
- *Serves:* a comparison in one frame; before and after. **SR20.**
- *Change:* eye level, one seam, the subject on it.

**D7 Patterns / repetition** · CORE · 5·5·4 · used as it is. *Reference:* 04a at 14.25 s (a row of six dark windows
along a warm wall, a man leaning out of the fifth).
- *What:* a repeated element reads as one texture; one break in it becomes the subject.
- *9:16:* a facade's windows stack in rows: one texture inside one mass (its pieces within +-6 L*, sizes varied 5-12
  %), one break, the call, at (413-667, 860-1100); never two breaks.
- *Serves:* the one among many; how many. **SR8, SR21.**

#### E. Moves the examples make without naming them

**E1 One small figure where the lines meet** · SITUATIONAL · 4·3·4 · used as it is. *Reference:* 11 of the 24 photo
examples, among them 04a at 0 s (the walker toward the villa), 04b at 25.25 s (the man on the pier), 04a at 5.25 s (the
man in the stairwell), 05 at 3.25 s (the hiker).
- *What:* one small figure at the device's focal point, from behind or in silhouette.
- *9:16:* 130-220 px (DIRECTION rule 7; the reels' figures measure 150-226 px at full phone width), where the lines
  meet, in the golden box, from behind or in silhouette, its feet above y 1480.
- *Serves:* any line device's end. **SR7, SR9, SR14, SR15, SR3.**

**E2 The lit opening** · CORE · 5·5·5 · used as it is. *Reference:* 02 at 0 s (the moon gate's lit garden), 04a at 5.25
s (the stairwell's lit wall), 03 at 14.0 s (the light at the tunnel's end), 04a at 14.25 s (the one occupied window).
- *What:* the inner frame is the brightest area, and the figure is dark inside it.
- *9:16:* the aperture the lightest area below the sky (L* >= 95), the figure inside it at L* <= 28 (a step >= 65 L*),
  in the golden box: the subject, the story light and the hardest value step in one place (rule 4).
- *Serves:* every opening. **SR6, SR2, SR8, SR7.**

**E3 Stillness against motion** · SITUATIONAL · 3·3·4 · adapted. *Reference:* 01 at 10.0 s (two walkers sharp in front
of a train streaking past), the titles 01 at 0 s and 04b at 19.25 s (a still carriage frame, the platform streaking past
through its windows).
- *What:* a still subject in front of a moving world.
- *9:16:* the subject held still in the golden box while life passes sideways behind it in one band (a tram, a boat,
  walkers, both ways), slow and low in contrast (within the band's value), never towards the lens.
- *Serves:* a pause; the pivot of a follow. **SR10, SR9.**
- *Change:* no motion blur (DIRECTION rule 5): the world moves, drawn sharp.
- *Merged:* N10 the pivot (`composition/cinema.md` §8 [S6]): the same stillness with the camera moving, the
  subject holding its screen spot within +-40 px while the world slides past (its motion: I12). Serves SR10, SR17.

**E4 Looking room** · SITUATIONAL · 3·4·4 · adapted. *Reference:* 02 at 4.75 s (the photographer aims up-left into the
forest), 04b at 28.25 s (a near profile looks right toward a lit tram), 04a at 9.75 s (the boy faces the stair into the
light).
- *What:* the subject faces into the open part of the frame.
- *9:16:* 1.5-2x more room in front than behind: a right-facing figure at x <= 410 below y 860 (the rail makes x 870 the
  right edge), a left-facing one at x >= 560; a figure seen from behind has its room up the frame, into the depth; its
  sightline crosses the focal's box (the gaze cue, `composition/cinema.md` §1).
- *Serves:* a person's moment; the "you"; a follow's lead room. **SR9, SR14, SR10.**
- *Change:* the rail moves the right edge to x 870; from behind, the room is up the frame.

**E5 A soft near layer** · RARE · 2·2·4 · adapted. *Reference:* 02 at 2.25 s (the lotus, out of focus), 04a at 7.5 s
(grass blades soft at the left), 04b at 28.25 s (a blurred near profile).
- *What:* a near thing at an edge, out of focus.
- *9:16:* the near layer simpler and lower in contrast instead: within 8 L* of the near shade mass, its edges lost, cut
  by the frame's edge, <= 2 props, its top at y 1450-1650.
- *Serves:* as the shot's device, rarely; its softness by value is rule 10 for every near band. **SR2, SR7, SR4.**
- *Change:* no focus blur (DIRECTION rule 5): softness by value, not by focus; DIRECTION 5's one exception, a near
  framing object's single optical blur (2.2-3 px: `CRAFT.md` §f), stays allowed.

**E6 Atmospheric layers** · SITUATIONAL · 3·3·5 · used as it is. *Reference:* 02 at 7.5 s (two ridges in a peach haze
behind the pavilion), 04a at 16.5 s (hazy hills behind the tower), 05 at 3.25 s (mist among the peaks).
- *What:* ridges, far shores and far rows paler with distance.
- *9:16:* 3-5 layers stacked up the frame, each farther one higher and a step nearer the sky's value (the farthest
  within ~10-15 L* of the sky, the nearest darkest), their tops >= 40 px apart, overlapping >= 10 px.
- *Serves:* depth in every wide. **SR14, SR16, SR17, SR2.**

**E7 The closed vista** · CORE · 4·4·4 · used as it is. *Reference:* 01 at 13.0 s (the street ended by a house and
trees), 02 at 10.0 s (the path ended by the tree), 04a at 3.0 s (the pier ended by the tower), 04b at 25.25 s (the pier
ended by the man).
- *What:* one sight line, ended by one object.
- *9:16:* the vanishing point on the object or hidden behind it, x 540-700, y 950-1150; never an open vanishing point
  into the sky (the eye leaves through it).
- *Serves:* the lane, the path. **SR3, SR7.**

**E8 One colour accent on the subject** · CORE · 4·5·5 · used as it is. *Reference:* 05 at 3.25 s (the hiker's blue
shirt, the one saturated colour among grey peaks), 01 at 10.0 s (the red train behind the walkers), 04a at 16.5 s (the
tower's red top).
- *What:* one saturated colour, on the subject.
- *9:16:* the scene's one hot accent only at the focal, in the golden box; everything else tone-on-tone in its mass (dE
  <= 6-8); no saturated yellow anywhere else (still v6's four yellow windows out-shouted the lit door).
- *Serves:* every shot (rule 4); named in **SR8, SR24, SR1.**

**E9 The camera holds; the subject travels the device's line** · CORE · 5·5·5 · used as it is. *Reference:* 04a at 3.0 s
(a man running away down the pier's axis, 305 -> 92 px in 1 s), 04a at 0 s (the walker into the spiral's eye), 02 at 0 s
(a walker crossing the moon gate), 02 at 7.5 s (an egret crossing the mirror); 17 of the 23 example shots are locked or
nearly.
- *What:* the shot locked; its life is the subject moving along the device's line.
- *9:16:* locked or the parallax float (8-15 px/s); the subject travels one path between two points of the golden box,
  or down a line into the vanishing point (shrinking as it goes), or across an opening.
- *Serves:* arrival, a crossing, a front travelling a seam. **SR7, SR9, SR6, SR20, SR23.**

**E10 The near "you" over the shoulder** · SITUATIONAL · 2·4·5 · adapted. *Reference:* 04b at 28.25 s (a big blurred
near profile on the left third, looking at a sunset and a lit tram).
- *What:* the viewer's stand-in big in the near frame, looking at the subject.
- *9:16:* never a big near head: the "you" is one whole figure of 130-220 px (DIRECTION rule 7), from behind at x
  130-380 facing right (or x 700-830 facing left), softer than the subject, its sightline crossing the focal's box; the
  near "you" cut by the bottom edge only as POV hands (SR13).
- *Serves:* scale from a human viewpoint; "for you". **SR14, SR13.**
- *Change:* the whole small figure at one side, or the hands; never the big head, never blurred.

**E11 The POV hook** · SITUATIONAL · 4·4·3 · used as it is. *Reference:* 05 at 12.25 s (a hand holding a camera on a
gimbal up into the frame over the spiral stair, the title beside it).
- *What:* the maker's hand and tool in the near frame.
- *9:16:* the hand and forearm from the bottom LEFT (the wrist runs under the bottom UI as a mass), the thing in hand at
  (300-600, 1000-1250), its face inside x <= 870 and y <= 1480; the cause above it on the axis.
- *Serves:* "for you"; a hook whose effect lands in the hand. **SR13.**

#### T. The reels' own teaching device

**T The line first, then the world under it** · CORE · 5·5·5 · adapted. *Reference:* all five reels (01 at 4.25 s, the
red lines on black before the escalator; 03 throughout, a pen tracing a red armature over a grey value thumbnail).
- *What:* an abstract line (the idea) on black; the shot appears under it, and the line turns out to trace the shot.
- *9:16:* our opening's draw-on (DIRECTION rule 9): the subject's line in the clean pen, the world flooding in under it,
  the bold event >= 1 s, peaking after 0.4 s; once per idea (a mechanism drawn as a line first, a chart in step with the
  voice); for the G3 board, the red armature over a grey value thumbnail (these sheets).
- *Serves:* the hook; the proof. **SR1, SR22.**
- *Change:* the line draws on and the colour floods in; never the reels' opacity cross-fade, never a title over the shot
  (X2, X3: NOT FOR US, Part 0).

### D2. Our frame additions (not in the owner's reels)

Frames our research adds (`composition/cinema.md`, `composition/vertical.md`, `composition/modern.md`,
`CINEMATIC_GUIDE.md`, `COZY_AND_SCALE.md`), the three the first library used without a reel behind them (N13-N15) and
the size ladder (Z1-Z4: the close is N9). They come after the owner's ideas and never replace one.

*Merged into the owner's entries* (`composition/catalogue_notes.md` §3): N4 the repoussoir is B10's one framing wing, N8
the zigzag way in is B8's angular form, N10 the pivot is E3 with the camera moving (its motion I12).

**N1 The centre, the first look** · CORE · 5·5·4 · used as it is. *Source:* `composition/cinema.md` §1, §4.3 [S7, S10];
`composition/vertical.md` §3.1, V8 [V5].
- *What:* a new shot's first look lands at the screen's centre, whatever the picture holds.
- *9:16:* (540, 960): a focal there costs no search, one 300 px away (~4 degrees) costs a saccade; a centred subject in
  vertical video held the eye better than a moving one.
- *Serves:* the hook, the close, the proof. **SR1, SR12, SR22.**

**N2 The stage square (rabatment)** · CORE · 3·4·5 · used as it is. *Source:* `composition/cinema.md` §1 [S3];
`composition/vertical.md` §2.
- *What:* the tall frame's implied squares: the top one (y 0-1080) holds the words and the sky, the bottom one (y
  840-1920) the stage and the near ground; the stage square (y 600-1520) is the picture under the words.
- *9:16:* the stage square's thirds y 907 / 1213, its golden lines y 951 / 1169, its diagonal 40.4 degrees, its eyes
  (454, 987) and (626, 1133); the frame's reciprocal from a top corner meets the far edge at y 608, the band's lower
  edge: keep that edge clean.
- *Serves:* every shot's placement (rules 2-3); A3 and A5 are built on it. **All recipes.**

**N3 The horizon off the half, and the line of heads** · SITUATIONAL · 2·3·4 · used as it is. *Source:*
`composition/cinema.md` §3.2-3.3, §4.1 (C2-C3; J. T. Smith 1797 via [S3]).
- *What:* the horizon's height is the master decision of an exterior; with a level camera every standing head is on it.
- *9:16:* setup A y 1150-1300 (camera 0.9-1.6 m), setup B y 690-860 (camera 3-7 m), never y 900-1020; a figure's feet at
  y_h + P·c/h, its head at y_h - P·(h - c)/h (Part 2 §0).
- *Serves:* every exterior (rule 6). **SR2, SR9, SR14.**

**N5 Headroom: the drop** · CORE · 4·4·4 · adapted. *Source:* `composition/cinema.md` §4.7 [S14];
`composition/vertical.md` §3.3, §7.1.
- *What:* the room above the subject.
- *9:16:* the caption band is the headroom: tops at y >= 620; the focal's centre 300-450 px under the block's foot (y
  556: so y ~856-1006), 650 px at most; nothing calls in the drop.
- *Serves:* every shot (rule 3). **SR6 (named).**
- *Change:* the band is the headroom, and its depth is a number.

**N6 Depth stacked up the frame (and the three distances)** · SITUATIONAL · 2·3·5 · used as it is. *Source:*
`composition/cinema.md` §4.8 [S15, S19]; `composition/vertical.md` §2.
- *What:* near, middle and far planes; in 9:16 they stack UP the frame, each farther one higher (the hanging scroll),
  and Guo Xi's three distances: high (looking up), deep (into the distance), level (out over a low land).
- *9:16:* 4-6 planes, the near at the bottom, overlapping >= ~10 px, their tops >= ~40 px apart; high = the tilt-up and
  the worm's-eye, deep = the S1 and S5 moves, level = S4's thin land under a huge sky.
- *Serves:* every wide. **SR2, SR14, SR15, SR16, SR17.**

**N7 Figure and ground: notan and counterchange** · CORE · 5·5·5 · used as it is. *Source:* `composition/cinema.md`
§4.13-4.14 [S1, S2].
- *What:* at two values the subject is one closed shape on a field of the other value; at the focal, light against dark.
- *9:16:* at a 2-value cut the subject is one shape a viewer can name at 0.25 scale; the focal's step >= 65 L*; its
  light reached by a bank of darker masses round it or by one long gradation toward it, never both.
- *Serves:* the hook, the home view, the opening, the line of light, the proof. **SR1, SR2, SR6, SR9, SR22.**

**N9 Isolation** · CORE · 5·4·4 · used as it is. *Source:* `composition/cinema.md` §2 [S1, S16].
- *What:* size on screen and space round it make the subject important.
- *9:16:* one object >= 60 % W (>= 650 px), its own backing one quiet field, a calm ring of 30-60 px round it.
- *Serves:* the close, the proof. **SR12, SR22.**

**N11 The low angle (worm's-eye)** · SITUATIONAL · 3·3·3 · adapted. *Source:* `composition/cinema.md` §3.1 [S12, S13].
- *What:* seen from below, the subject reads as powerful.
- *9:16:* K7: camera ~0.3 m, horizon y 1114-1229, verticals parallel (a shift, not a tilt).
- *Serves:* the quantity, the machine. **SR15.**
- *Change:* only on the quantity, never on the thing under critique.

**N12 The high angle** · RARE · 2·3·3 · adapted. *Source:* `composition/cinema.md` §3.1 [S12, S13].
- *What:* seen from above: an overview; on one person it reads as being looked down on.
- *9:16:* 35-55 degrees down from a 3rd-5th floor, the lid's flat facade behind the band; overhead only as paper.
- *Serves:* a crowd, a pattern, a crossing (B7, B12). **SR5, SR21.**
- *Change:* once a film, never on one person.

**N13 Refuge and prospect** · SITUATIONAL · 3·3·5 · used as it is. *Source:* `COZY_AND_SCALE.md` §2-3 (the library's
own).
- *What:* an enclosing mass with one opening onto the view: held, not shut.
- *9:16:* refuge 35-55 % of the frame on >= 2 edges, one opening of 15-30 %, read in y 600-1250.
- *Serves:* the interior home place. **SR4.**

**N14 The deliberate match** · CORE · 4·5·4 · used as it is. *Source:* `STORYBOARD_STYLE.md` §7; `composition/cinema.md`
§7.
- *What:* the same frame again, with one change.
- *9:16:* the exact frame (or the thread within +-8 % of its spot and +-20 % of its size), one change at the focal.
- *Serves:* the turn told by light; the callback. **SR19, SR24.**

**N15 The off-balance** · RARE · 2·3·3 · used as it is. *Source:* `composition/cinema.md` §9 (its reading of reel 03's
"unbalanced"; contrast and affinity [S17]).
- *What:* one heavy side and nothing against it: tension.
- *9:16:* the focal at x 250-380 or 700-830 (inside the clear window), no counterweight, the other side open.
- *Serves:* the "But" turn. **SR18.**

**M3 Short-siding and the low quadrant** · RARE · 2·2·2 · adapted. *Source:* `composition/modern.md` M3 [N36; cinema
S10].
- *What:* the subject pushed to the frame's edge looking out of it (no lead room), or set low in a corner under a heavy
  weight of empty frame: a rule broken for unease.
- *9:16:* short-sided, the subject at x 130-300 facing LEFT, out of the frame (the right side belongs to the rail), its
  feet above y 1480, the empty stage behind it; the low quadrant, the figure's head below y 1150 with >= 60 % of the
  frame above it as one quiet field.
- *Serves:* the "But" turn. **SR18 (variant).**
- *Change:* at most once a film, on the turn, never in a cozy beat; the next beat returns to the focal home (the low
  quadrant as a house style is not ours: cozy is >= 50 % of the runtime).

**Z1 The extreme wide** · SITUATIONAL · 3·3·3 · used as it is. *Source:* `composition/cinema.md` §2 [S12, S13];
`LAYOUT.md` §2 (the K wides).
- *What:* the place and its scale: the world past every edge, the subject or the "you" tiny.
- *9:16:* 5-7 planes, one landmark huge yet far; the "you" 60-150 px (a K wide) or 170-200 px (S5's end); the masses the
  simplest of all (three masses and one call at a glance); ~1.5-4 s.
- *Serves:* the scale beat, 1-2 a film. **SR15, SR17.**

**Z2 The wide** · SITUATIONAL · 2·4·4 · used as it is. *Source:* `composition/cinema.md` §2 [S12, S13].
- *What:* the whole subject in its place: the home view.
- *9:16:* the subject 15-35 % of the frame's height (290-670 px) in its place; the "you" 130-220 px near the camera
  (setup A or B); the background read in about a quarter of a second, so three masses and one call.
- *Serves:* the home place (>= 50 % of the runtime), establishing, the callback. **SR2, SR3, SR9, SR14.**

**Z3 The medium** · SITUATIONAL · 3·4·4 · used as it is. *Source:* `composition/cinema.md` §2 [S12, S13].
- *What:* the subject and its action with a little setting: the explainer's working size.
- *9:16:* the subject box 270-460 px wide (35-60 % of the stage), one backing, at most two props cut by the edges; sizes
  step 2-3x from the wide.
- *Serves:* the mechanism beats. **SR10, SR11, SR20, SR21.**

**Z4 The insert (the paper)** · CORE · 4·4·4 · used as it is. *Source:* `composition/cinema.md` §2, §3.1 [S12, S13].
- *What:* one detail filling the stage, "look at exactly this": a number, a date, a chart, the paper straight-on.
- *9:16:* the paper straight-on and level, >= 60 % of the stage wide (>= 456 px); one number 120-160 px on what it
  measures; words >= 56 px; an overhead view only as paper (a chart or a map is a flat thing in the place, seen
  straight-on).
- *Serves:* the proof, the payoff number. **SR22.**

**S2 The sun behind the roofline** · SITUATIONAL · 4·2·3 · used as it is. *Source:* `CINEMATIC_GUIDE.md` S2.
- *What:* the big low sun, the one light source, is the subject; everything in front of it is one flat silhouette.
- *9:16:* eye level, a long lens: the disc ~650 px wide centred at (580, 1060), its top at y ~735; the roofline
  silhouette in the darkest value across the bottom ~22 % (its top y ~1500), one dome or roof mass cut by the left edge
  rising to y ~880; 3 values (disc, sky, silhouette), 2-3 painted cloud streaks across the disc; a glow and bloom at the
  disc (<= +6-8 L* at its edge), never a ring; locked 2.5-3 s, clouds ~6 px/s, one bird ~15 px/s. The one shot where
  the sun is the "look here" (`CRAFT.md` §g.2).
- *Serves:* time passing, an ending, a key line held in a quiet grandeur, at most once a film. **SR16 (variant).**

**K8 The light shaft and its pool** · RARE · 3·2·2 · used as it is. *Source:* `COZY_AND_SCALE.md` §4 K8.
- *What:* one person, one light, in a vast structure: a soft shaft on the axis widening into a pool with the observer
  in it.
- *9:16:* the core 0.10-0.14 W (108-151 px) on the axis, a soft wedge of +2-4 L* against darker air, widening 1.3-1.6x
  down into a pool twice the core with the observer in it, its top below y 600; a soft glow and gentle bloom only at
  the source; never a volumetric show (`CINEMATIC_GUIDE.md` "Not for us"). Its window form, one warm window in a cold
  grid, is D7.
- *Serves:* one small life singled out by light in an indifferent vastness, once. **SR15 (variant).**

### D3. The moves and the joins (the owner's reels' first)

What each move and join is, where it comes from and what the engine has for it; its tier and when to use it are Part 0
(§0.4, §0.5), its timing, easing and carrier Part 0b §3. The owner's reels were measured frame by frame for motion
(`composition/motion.md` §1): 17 of their 23 example shots are locked or nearly, the life being the subject travelling
the device's line; every idea is joined by a hard cut through a black line card; reel 03 is one continuous take. Engine
paths are from `video/src/` (`lib/`) and `video/scripts/`.

| # | name | tier | A·S·F | from (his reel and time; or our source) | what | engine |
|---|---|---|---|---|---|---|
| RM1 | The subject travels a held frame (E9 in motion) | CORE | 5·5·5 | 02 at 1.0 s (a walker crosses the moon gate); 04a at 3.6 s (a runner down the pier, 305 -> 92 px tall in 1 s); 02 at 8.7 s (an egret crosses the mirror); 04a at 14.8 s (a man leans from the fifth window) | the frame locked; one subject moves along the device's own line and arrives | exists: Walk, Move (`lib/motion.tsx`), crossing, loopPos (`lib/idle.ts`) |
| RM2 | The world passes a still frame (E3 in motion) | SITUATIONAL | 3·3·4 | 01 at 0 s and 04b at 19.5 s (the platform streaking past the carriage windows); 01 at 10.9 s (walkers before a passing train) | the camera and the subject hold while a band of the world flows past, drawn sharp | exists: crossing, loopPos, shuttle (`lib/idle.ts`) |
| RM3 | The camera rides the lines (the follow) | SITUATIONAL | 3·4·3 | 01 at 5.0 s (the escalator: the handrails held, the ad panels sliding at 23-25 %W/s) | the camera travels with the lines or a mover; the frame's geometry holds still | exists: CineCamera x / y / anchor keys, camSpeed (`lib/cine/camera.tsx`) |
| RM4 | A slow push (the story push) | CORE | 4·5·4 | 02 at 6.1 s (2.6 %/s on the photographer: visible); 04a at 14.8 s (1.4 %/s on the window row: it reads frozen) | the camera moves in; the subject holds its spot | exists: ShotCam push (`lib/ShotCam.tsx`), CineCamera push and anchor keys |
| RM5 | A slow pan, the drift (the parallax float) | SITUATIONAL | 2·2·5 | 05 at 3.9 s (a pan of 1.7 %W/s over the hiker); small drifts in 04a and 04b | ours: every plane drifts by its depth (the owner, 2026-10-28: "planes move by depth") | exists: floatCam (`lib/idle.ts`), PARALLAX_K (`lib/depth.ts`) |
| RM6 | A burst at the focal (the light event) | CORE | 5·4·4 | 04b at 23.1 s (fireworks at the spiral's eye) | light flares or switches on at the focal of a held frame | partly: windowLit, LitWindows, Glow; new: a lightPull helper (shared with I11) |
| RM7 | The locked frame (the hold) | CORE | 3·4·5 | 01 at 14.1 s, 02 at 11.3 s, 04a at 10.4 s, 05 at 9.8 s: nothing moves, held 1.3-2.6 s | the camera does not move; the subject's own events carry the time | exists: CineCamera or ShotCam with no keys; `scripts/qa/deadframes.py` |
| RM8 | The line drawn live, then the world under it (T in motion) | CORE | 5·5·5 | 03 throughout (a pen traces each armature live, ~1 s a panel); 04a at 0 s (a spiral drawn over frame 0, gone by 0.75 s) | the subject's line draws on with a pen tip, the colour floods in; later the build (pops, ticks, growth) | exists: Ink, Fill, Pop, Rise (`lib/Ink.tsx`, `lib/Fill.tsx`, `lib/motion.tsx`); the un-build in `lib/exit.tsx` |
| RM9 | The handheld pass | NOT FOR US | 1·1·1 | 03, 0-19.2 s (a handheld phone drifting 1.5-7.7 %W/s over the sheet) | a hand-held camera wanders and wobbles | a parameter kept at 0 (CineCamera handheld) |
| I4 | The pull-back, the one big move (S5) | CORE | 4·4·5 | ours: `CINEMATIC_GUIDE.md` S5 (the owner's favourite Arcane shot), `COZY_AND_SCALE.md` K4 | the camera pulls back until the world opens round the pivot | exists: `lib/pullback.tsx` (S5_EASE, PullPlane) |
| I5 | The reveal tilt (and pan) | SITUATIONAL | 3·4·3 | ours: `COZY_AND_SCALE.md` K2; Arcane P7 (`research/cine_motion.md`) | the camera tilts up or down over a tall thing | exists: CineCamera tilt and pan keys; partly: the `unveil` ease only on the board (`video/src/v3/SketchReel.tsx`) |
| I6 | The crane: the rise-over (S1) | SITUATIONAL | 3·3·4 | ours: `CINEMATIC_GUIDE.md` S1, `COZY_AND_SCALE.md` K3 | the camera rises over a near wall and the world opens past it | exists: CineCamera y keys; Ledge, Balustrade (`lib/cine/props.tsx`, references) |
| I11 | The light pull (our focus pull) | CORE | 5·5·4 | ours: `composition/motion.md` I11 (no blur in our look, so the light moves instead of the focus) | in a held frame the light moves from one thing to the next | partly: windowLit, the World sky's keys, `lib/light2`; new: lightPull |
| I12 | The pivot: the subject holds its screen spot | CORE | 4·5·4 | ours: `composition/cinema.md` §8 [S6] | during any camera move the subject stays put on screen while the world slides past | exists: anchor and anchorTo keys (`lib/cine/camera.tsx`), PullPlane's pivot |
| X6 | The dolly zoom | NOT FOR US | 2·1·1 | ours: `composition/cinema.md` §8 [S20] | the camera dollies one way while the lens zooms the other | none |
| X9 | A zoom in a hold (the breathe) | NOT FOR US | 1·1·1 | ours: DIRECTION's Retired list; Arcane P2 | a slow automatic zoom on every shot | a default to switch off: World push, ShotCam push: true |
| X10 | The crash zoom and punch-ins | NOT FOR US | 2·1·1 | ours: `composition/modern.md` §7; Arcane P5 | a fast zoom or cut-in on each stressed word | none (possible with ShotCam push, unused) |
| RJ1 | The hard cut through the black line card | NOT FOR US | 1·1·1 | every idea in reels 01, 02, 04a, 04b, 05: a cut to a black card with the next idea's lines (0.6-1.3 s), then the shot | between two ideas the picture cuts to black with the next idea's lines | trivial (a Film cut and a card) |
| X3 | The fade-in under the lines (the cross-fade) | NOT FOR US | 1·1·1 | 01 (the shot fades in under the lines in 0.17-0.37 s), 04b (a 0.5 s fade-in); the overlays fade out in 0.1-0.6 s | one picture fades into the next | none: nothing in `lib/motion.tsx` animates opacity |
| RJ2 | The hard cut | RARE | 3·3·2 | 02, 04a, 05: a one-frame cut from the card to the shot; every idea-to-idea join | a plain cut, nothing carried | exists: Film cut; `scripts/qa/gate_check.py` counts the F joins |
| RJ3 | The loop back to the opening frame | CORE | 3·4·5 | 01 at 16.0 s, 05 at 12.3 s: a hard cut back to the opening | the end returns to the first frame, so the rewatch starts seamlessly | exists: Film transitionOut 'unbuild', `lib/exit.tsx` |
| RJ4 | One continuous take, no cut | CORE | 4·5·5 | 03, 0-19.2 s: one continuous shot over the drawn sheet, 18 ideas, no cut | no cut is seen: the camera moves on from one view of the place to the next | exists: Film camera-continuous; the matchcut seam (seam: true) |
| J2 | The push-through, and the pull-out of an opening | CORE | 5·5·5 | ours: `CRAFT.md` §a carrier A; `COZY_AND_SCALE.md` K9; Arcane T7, P8 | the camera pushes into an opening in this shot and comes out of the next shot's own opening | exists: Film push-through; partly: K9's Portal (to build) |
| J3 | The match cut on shape | CORE | 4·5·5 | ours: `CRAFT.md` §a carrier B; `composition/modern.md` M20 | a hard cut where one shape keeps its spot (a circle, a vertical, an apex, an opening) | exists: Film matchcut; new: an anchor check at the boundary frames |
| T2 | Pinned-anchor jump cuts | RARE | 3·3·2 | ours: Arcane T2 (`research/cine_light.md` §4) | a short run of quick cuts round one bright anchor pinned at its spot | exists: Film cut and matchcut; new: the anchor check |
| J4 | The match cut on light and colour | CORE | 5·4·4 | ours: Arcane T1 (the layout correlated 0.81-0.90 across such cuts) | a hard cut where a bright shape or the hot accent keeps its spot | exists: Film matchcut; the colour-shift and eye-jump metrics (`scripts/qa/retro_tools/story/carry.py`) |
| J5 | The cut on action | SITUATIONAL | 4·3·3 | ours: `composition/motion.md` J5 [MO3, MO4] | a cut in the middle of an action that carries on in the next size or angle | exists: cut or matchcut with the mover keyed on film time |
| J6 | The eyeline: the look carries | SITUATIONAL | 3·4·4 | ours: `composition/motion.md` J6 [S9] | the "you" or a figure looks; the next view is what it looks at | exists: poses and the camera (a planning rule) |
| J7 | The carry | SITUATIONAL | 3·4·4 | ours: `CRAFT.md` §a carrier D; `composition/cinema.md` §6.3 | a traveller leaves one edge and enters the next shot from the opposite one | exists: a carry across a cut; new: the carry check (direction and speed) |
| J8 | The wipe by a near mass | SITUATIONAL | 3·3·3 | ours: `CRAFT.md` §a carrier D; Arcane T3, T5; S5's chimney pot | a near mass of the world passes the lens and hides the change | partly: Film foreground-wipe with element 'scene'; new: a clean-pen near-mass wiper per film |
| J9 | The whip | NOT FOR US | 2·2·1 | ours: `composition/motion.md` J9 [MO21, MO22] | a very fast pan that smears one shot into the next | none built |
| J10 | The morph: one thing becomes the next | CORE | 5·5·3 | ours: `composition/modern.md` M24 | an object transforms into the next scene's object, staged | partly: interpolatePath (`@remotion/paths`, installed, unused); new: a staged-morph helper |
| J11 | The light change: time passes in place | CORE | 4·4·4 | ours: `composition/motion.md` J11; Arcane T6 | the same frame, its light changed (a lamp, a window, the sky) | partly: the World sky's keys, windowLit, `lib/light2` |
| J13 | The card flip or swipe of the same paper | SITUATIONAL | 3·3·3 | ours: `CRAFT.md` §a carrier E; v1's flip | the paper turns or swipes to its next page in place | partly: flipOut, flipIn (`lib/Card.tsx`); new: an E type in Film |
| J15 | The sound bridge (the J-cut and the L-cut) | SITUATIONAL | 3·4·4 | ours: `composition/motion.md` §4.4 [MO19, MO20]; `SOUND_SYNC.md` O6 | the next place's sound starts before its picture, or the last one's trails under the new picture | partly: Film sfx; `scripts/qa/av_lag.py`, `scripts/qa/beatsync.py` |
| X11 | Effect transitions: spins, glitches, RGB splits, flashes | NOT FOR US | 1·1·1 | ours: `composition/modern.md` §7; Arcane T4 | a designed transition effect | none (`scripts/qa/framecheck.py` flags 1-2 frame flashes) |

### D4. Coverage: every reference item has a place and a tier

- **The owner's 41 ideas and T are all entries,** in his reels' order and names (§D1), each with its tier: 12 CORE, 16
  SITUATIONAL, 12 RARE, 2 NOT FOR US (A4 the golden spiral, D3 balance; Part 0.1 to overrule). The first library had
  them 24 used as they are, 17 adapted, 0 rejected; the ranking now says how readily each is used, and "adapted" still
  marks the 9:16 change in numbers.
- **Everything else his reels show is an entry too:** the 2 treatments (X1 blur, X2 the title over the shot: NOT FOR
  US), the 9 kinds of motion measured in his shots (RM1-RM9: 5 CORE, 3 SITUATIONAL, RM9 NOT FOR US) and his 5 kinds of
  join (RJ1-RJ4 and X3: RJ3 and RJ4 CORE, RJ2 RARE, RJ1 and X3 NOT FOR US).
- **Where each is used:** the recipes that name each frame are Part 0's last column, and Part 2 §2 lists each recipe's
  devices by tier. Every device code a recipe names exists in Part 0; no device needed a recipe of its own beyond
  SR1-SR24 (the ones without one are named variants of the recipe whose camera they share).
- **Ours (45):** 15 CORE, 16 SITUATIONAL, 5 RARE, 9 NOT FOR US; none replaces an idea of his: where one of ours covered
  the same choice it was merged into his entry under his name (B8, B10, E3 above; `composition/catalogue_notes.md` §3).
- **Thumbnails:** each frame device of the first library has a value thumbnail on `composition/devices_sheet.png` (the
  owner's 41 first); `composition/library_sheet.png` shows the frames by tier, CORE big, with the move and the join each
  pairs with.

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
| focal home | the focal's centre on the subject axis x 380-700, y 860-1200 (R7); its heart the golden box x 413-667, y 951-1187, whose middle the stage square's diagonal "eyes" mark (x 454-626, y 987-1133) | the beat's one focal (rule 3) |
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

## 1. The rules

The 22 rules every shot keeps are Part 0b §4; rules 1-13 keep the numbers the recipes below cite.

## 2. The library at a glance

**Thumbnails:** `composition/shots_sheet.png`, one value thumbnail per recipe (our frame at 1/4, 270 x 480: five flat
values, white kept for the story light; the caption band and the app's interface on the owner's Reels tab marked
faintly; the composition idea in red), each in scene 1 or video 4 as its example says, drawn from the recipe's numbers
by `composition/shots_sheet.py` (seeded; no image copied or traced). The devices have their own sheets:
`composition/devices_sheet.png` (one thumbnail per device of the first library, the owner's 41 first) and
`composition/library_sheet.png` (the frames by tier, with the move and the join each pairs with).

Pick by the beat (Part 0b §1; §4 below has the pass). **By beat:** the hook SR1 · establishing the home place SR2-SR5 ·
the subject's moment SR6-SR11 · a reveal SR6 (through the opening), SR10 (the tilt), SR15 (the tilt-up), SR17 (the big
move), SR4 (out through the window) · the turn SR18, SR19 · scale SR14-SR17 · intimacy SR12, SR13 · a comparison SR20,
SR19, SR11 · a list SR21, SR22 · the payoff SR24, SR23, SR13. "The set's" = the set's own setup (A or B) and horizon
from W1. The focal is the centre of the beat's subject; its size is on screen. **Devices** are grouped by tier (CORE ·
SITUATIONAL · RARE; (v) a named variant); the moves and joins are Part 0's codes, the carriers `CRAFT.md` §a's (A = J2,
B = J3 or J4, C = RJ4, D = J7 or J8, E = J13, F = RJ2; the loop RJ3).

| # | recipe | the beat | setup, horizon y | the focal: centre; size | devices by tier | the move | the joins |
|---|---|---|---|---|---|---|---|
| SR1 | THE DRAWN SUBJECT | the hook, 0-3 s; the loop's frame | the set's | the focal home, near (540, 960); >= 400 px wide | CORE T, N7, N1, E8 · SIT A2 | RM8, then RM7 or one RM4 (>= 3 % in <= 2 s) | out RJ4 or J2; the loop RJ3 |
| SR2 | HOME ACROSS THE WATER | the home place | A 1100-1250, or B 690-860 | the lit opening, (540-670, 950-1180); 150-230 px wide | CORE C1, E2, N7 · SIT N6, E6, D4, N3, B10, Z2 · RARE A1, C2, E5 | RM7 or RM5 | in J2 or J3; out J2 |
| SR3 | THE LANE | the home place: a street | 1020-1150 | the closed vista at the vanishing point, (540-700, 950-1150) | CORE B2, E7, B1, B4 · SIT B3, B10, B11, E1, Z2 | RM7, RM5, or RM4 to the vista | out J2 or RJ4 |
| SR4 | THE NOOK | the home place: indoors | none (the window's own) | the lamp-lit subject, head y 864-1152 | CORE C1 · SIT N13, B10 · RARE C2, E5, B13 (v) | RM7 or RM5 | out J2 through the window |
| SR5 | THE BALCONY | the home place from above; a crowd | none (35-55 degrees down) | on the curve, y 860-1060 | SIT B9 · RARE N12, B7 (v), B12 (v) | RM7 | J2 or RJ4 |
| SR6 | THE LIT OPENING | the subject's moment | the set's | the lit aperture in the golden box; 15-30 % of the frame | CORE C1, E2, N7, N5, E9 · SIT A2 | RM7 (RM1 crosses it), then J2's push | out J2 |
| SR7 | THE PATH IN | arrival; the thing at the end of the way | A or B | the line's end, (480-640, 950-1150) | CORE B1, B2, E7, E2, E9 · SIT E1, B8 · RARE C2, E5 | RM1 the subject travels, or RM4 to the vista | out J2 or RJ4 |
| SR8 | THE BREAK IN THE ROW | the one among many | the set's | the one lit window, (413-667, 860-1100) | CORE D7, C1, E2, E8 · SIT A2 | RM7; RM6 the break lights | out J2 |
| SR9 | ON THE LINE OF LIGHT | a person's moment | A, camera 0.9-1.2 m, 1150-1300 | a figure straddling the lit horizon, x 413-667; 150-300 px | CORE N7, E9 · SIT A6, N3, E1, E4, E3, D4, Z2 · RARE A1 | RM7; RM1 the figure walks the line | out RJ4 or J7 |
| SR10 | THE FOLLOW | travel; the mechanism on its way | the set's | held at x 410-560 (truck) or on the axis (tilt) | SIT E3, E4, Z3 · RARE B5 | RM3 (a truck) or I5 (a tilt), with I12 | out RJ4 or J7 |
| SR11 | THE LEVEL CHANGE | cause and effect; two places in one frame | B | the subject's level in the golden box | SIT C3, B8, Z3 · RARE B6, A5, B5 | RM7, or I5 between the levels; I11 | out RJ4 |
| SR12 | THE CLOSE | intimacy: the object | none | the object in the golden box; >= 650 px wide | CORE N9, N1 · SIT A2 | RM4 <= 2x in, then RM7 | in J2, RJ4 or RJ2; out RJ4 or J2 |
| SR13 | THE HANDS | intimacy: the "you"; "for you" | the window's | the thing in hand, (300-600, 1000-1250) | SIT E11, E10 | RM7 or RM5; RM8 the effect lands | in J2 or J3; out J2 or J3 |
| SR14 | THE YOU AND THE WORLD | scale from a human viewpoint | A 1150-1300 | the far lit point on the axis; the "you" at x 130-380, 130-220 px | CORE D2 · SIT E1, E10, E4, N3, E6, N6, Z2 · RARE A1, A3 (v) | RM7, RM5, or RM4 to the vista | in RJ4; out J2 or RJ4 |
| SR15 | TINY UNDER GIANT | scale: the quantity, the machine | 1114-1229 (worm's-eye) or 1020-1133 | a figure 60-220 px at x 420-660; the giant >= 0.7 H | CORE D2 · SIT E1, A6, B3, N11, N6, Z1 · RARE A3, K8 (v) | RM7, or I5 the tilt-up | in RJ2 on a "But", or inside the big move; out J2 |
| SR16 | THE BIG SKY | a breather | ~1402 (S3) or ~1574 (S4) | a landmark on the left third, or a small "you" | CORE D1 · SIT N6, D4, E6, S2 (v) · RARE A1 | RM7 or RM5 | never next to SR17 |
| SR17 | THE ONE BIG MOVE | the scale reveal, once | S1 710 -> 768; S5 845 -> 883 | the pivot (S5's figures x 420-560, feet y 1490); the landmark (760, 760) | CORE D2, C1, B4 · SIT E3, N6, E6, Z1 | I4 (S5) or I6 (S1), with I12 | leaves from the thread; back by J2 or RJ4 |
| SR18 | THE OFF-BALANCE | the turn ("But") | the set's | off home: x 250-380 or 700-830, no counterweight; or one 30-45 degree diagonal | CORE D1 · SIT B11 · RARE N15, B6, A5, M3 (v) | RM7, a hold of 0.5-1.0 s | in RJ2 or RJ4 |
| SR19 | THE MATCHED PAIR | the turn told by light; before and after | the earlier shot's | the same focal, one change | CORE N14 | RM7 on both; RM6 or I11 the change | J3 or J4, or J11 inside one held shot |
| SR20 | THE SEAM | a comparison in one frame | the set's | at the seam, in the golden box | CORE E9 · SIT A2, Z3 · RARE D6, B6 | RM7; RM1 the seam's front travels | out RJ4 |
| SR21 | THE LINEUP | how many; a list of like things | the set's, a little from above | the cause at the apex in the golden box; units >= 60 px | CORE D7 · SIT A2, B3, Z3 · RARE D5, N12, B13 (v) | RM7; RM8 the units pop by rows | out RJ4 |
| SR22 | THE PAPER | the proof: a chart, a number, a date | none (straight-on) | the paper >= 60 % of the stage wide; one number 120-160 px | CORE N7, N9, N1, T, Z4 | RM8 the line in step with the voice, then RM7 | in J2 or J13; out J2 or J13 |
| SR23 | THE MIRROR | stillness; a formal beat; once | waterline 1040-1100 | the landmark on x 540, y 850-1040 | CORE E9 · SIT A7 | RM7; one slow mover (RM1) | in or out J3, or the loop's frame |
| SR24 | THE WHOLE RUN | the payoff; the callback | the opening's | the thread at its home spot; the film's hardest step | CORE N14, B1, E8 · SIT B8 · RARE B12 (v) | I4 a pull back, then RM7 | the loop RJ3 to frame 0 |

## 3. The recipes

Each recipe: **Beat** (when to use it); **Layout** (the horizon, the subject's place and size, the value masses, the
quiet areas, the story light, where the eye lands first, what sits behind the captions); **Device** (the composition
idea and where it comes from); **Camera and joins** (the move it pairs with and how it leaves); **Never**; and one line
on how it looks in scene 1 or video 4. Every recipe also keeps the 22 rules (Part 0b §4): the band one flat field, key
reads in the feed's clear window, one focal with the story light, two quiet fields, the near frame a hint.

### The hook

**SR1 THE DRAWN SUBJECT**
- **Beat:** the hook, 0-3 s, in one continuous shot (DIRECTION rule 9); the same frame is the loop's last (the film
  un-draws back to it).
- **Layout:** the set's setup, usually the home view or a closer view of the subject in it. The subject (tier A) is one
  closed shape >= 400 px wide, its centre in the focal home near (540, 960), where the eye already is when the reel
  lands. The drawing order is the value plan arriving: the subject's line first at full contrast (the darkest mark on
  the frame, a moving pen tip), then the world as flat pale shapes, the colour flood over the line, the light flooding
  from its source; the 3-value notan stands complete by ~1.5 s. The band shows the first spoken line on the flat sky
  from frame 0; the near band is one tone. The story light reaches the subject on the payoff word (~2 s) and makes the
  frame's hardest step there. Eye: the centre and the pen tip at once, the caption above, then the hook's change at ~2
  s.
- **Device:** figure and ground at two values (N7: the subject one shape a viewer can name at 0.25 scale), on the centre
  where the first look lands (N1), and the reels' own teaching move (T), "the line first, then the world under it": a
  line held 0.5-1.5 s reads at phone size (`composition/reels.md` §5); the one colour accent at the focal (E8), in the
  golden box (A2).
- **Camera and joins:** locked, or one visible story move >= 3 % in <= 2 s; never the reference's slow invisible
  pull-out; nothing scale before 3 s. The expected thing, then reality overtaking it at ~2 s through the real mechanism;
  the bold event lasts >= 1 s and peaks after 0.4 s (rule 13). Out by C (a push toward the mechanism) or A (into the
  subject).
- **Never:** a still frame; a subtle or short effect (a ~0.3 s pale draw-on was invisible); the biggest change before
  0.4 s; a title over the captions; extra supporting life as the novelty; the pen starting in a cut strip (x < 98) or
  anything to read at x > 945 or y > 1519.
- **Video 4 (S1):** start the pipe's visible draw at x >= 130 (the feed never shows x < 98, and the page is still
  sliding for the first 0.4 s), make the one window lighting on "heat" (2.14 s) the peak, inside the golden box, and let
  the windows that follow light as one spreading wave a step dimmer (+6-8 L* inside their facades), so the one window
  stays the call.

### Establishing the home place

**SR2 HOME ACROSS THE WATER**
- **Beat:** the home place's establishing view; the quiet beat's return; the callback's place.
- **Layout:** level across water (a canal, a river, a harbour), the camera on our bank. Two variants. **Enclosed**, the
  RIVERSIDE dose (`COZY_AND_SCALE.md` 3b.2): the far row rises behind the band as one flat facade (L* >= 75), the facade
  belt y 600-1000, a dark belt to y 1115, the far lane y 1115-1230 with the horizon on its standing heads (~y 1100), our
  bank y 1230-1420, the water from y 1420; the sky 8-15 % in the top gutter. **Open**, the human view (setup A, horizon
  y 1150-1250, scene 1's T1/T3; by `COZY_AND_SCALE.md`'s numbers a sky of >= 36 % counts as exposed: §5 row 12): the sky
  with the band down to the far belt's tops (never above y 620), the far belt to the horizon, the far waterline just
  under it, the water, our bank to the bottom edge. In both, the subject is the lit opening on the far bank (a door or
  one window, 150-230 px wide), centre (540-670, 950-1180); the far side's people, umbrellas, bikes and boats are
  texture in their band (within +-6 L*). The "you", when the card names one, stands on our bank at x 130-380 facing
  right, placed by the horizon-cut rule (in setup A its head on the horizon), soft and dark against the lit water;
  otherwise the view is the viewer's own (POV, v2's choice). Masses: the light sky (or the far row) with the band, the
  mid far belt, the dark near bank. Quiet: the sky and our bank, >= 65 % with the water. Light: the opening is the story
  light, its broken column on the water pointing at it; the low sun one step off its sky on the side away from the
  focal; the hero cloud high as the counterweight. Eye: the words, one drop to the lit opening, the light column below
  it confirming.
- **Device:** horizontal bands stacked up the frame (N6; level lines: the calm of affinity), paler with distance (E6),
  the horizon a third, off the half (A1, N3); one opening on the far bank (C1, E2: SR6 inside a wide); counterchange at
  the focal (N7); the steelyard (D4: the hero cloud high on the far side); the near quay a soft hint (C2, E5), with at
  most one framing wing (B10's).
- **Camera and joins:** locked, or the parallax float (our bank most, the far belt little, the sky and band not at all);
  life passes sideways in one lane, both ways, nothing comes at the lens. In by A (a pull back out of the opening) or B
  (the thread at its home spot); out by A (a push into the opening).
- **Never:** the horizon at the half; the far belt in the band, or so near it fills the frame ("I'm really
  suffocating"); the far side as an empty strip; a saturated far window competing with the focal; Pip on the light
  column under the door; more than 2 props on our bank.
- **Scene 1:** T1's values in v2's view, the frame moved up 140-190 px so the horizon leaves the half (y ~995 ->
  1135-1187; T3 moved it +140): the lit door lands at ~(630, 1105-1155), 550-600 px under the block; the sun one step
  off its sky at the left; our quay one shade mass with one table and chair cut by the right edge.

**SR3 THE LANE**
- **Beat:** a street as the home place; the walk; a closed vista where the story's object waits.
- **Layout:** the LANE dose (`COZY_AND_SCALE.md` §2, 3b.2): eye level along a street, H:W 1:1-1:1.5, the walls >= 35 %
  of the frame, the sky 15-30 %. One side tall, cut by the top, its face one flat light field (L* >= 70) through the
  band; the other side tops out below y 600. Horizon y 1020-1150, off the half; the vanishing point at x 540-700 on the
  subject (within 60 px) or hidden behind it. The subject is the one thing that closes the vista (a tower, a bend, a lit
  shopfront, the story's object), centre (540-700, 950-1150), the lightest thing at the street's end. Masses: the two
  walls in shade (mid to dark), the sky slot light, the street floor mid with the lit lane down its middle. Quiet: the
  sky slot and the near floor. Light: at the end (the vista lit, the walls in shade). Eye: the words, then down the
  walls' converging lines to the lit end.
- **Device:** one-point perspective to a closed vista (B2, E7): the walls' feet and the coping are the leading lines
  (B1), the facade's courses radiate from the vanishing point (B3); the L of one tall side and the ground (B10); the
  canyon's V (B11); the tunnel's light at the end (B4); the one small figure in the lit door where the lines meet (E1).
- **Camera and joins:** locked or the float; a push to the vista (K5) as a story move, visible (>= 3 % in <= 2 s, e.g. 6
  % in 3 s, on its word), anchored on the far vanishing point; walkers pass both ways on the walks. Out by A (into the
  lit end) or C.
- **Never:** an open vanishing point into empty sky (the eye leaves through it); both walls tall through the band (a
  symmetric 1:1 lane can't hold the captions); a line across the band; the vanishing point under the rail (x > 870); a
  brighter patch on the walk than at the end.
- **Scene 1:** along the towpath toward the bridge, the canal's coping and the wall's foot converging on the lit door at
  the end of the walk, the low sun one step off its sky over the far roofs, the band on the flat face of the tall wall
  at the right.

**SR4 THE NOOK**
- **Beat:** an interior home place; the personal, quiet beat; the place a "you" sits.
- **Layout:** the NOOK dose (`COZY_AND_SCALE.md` §2-3): refuge 35-55 % of the frame on >= 2 edges (a wall, a shelf, a
  soffit cutting the top 8-15 % over <= 70 % of the width) and a top-edge object in y 0-290 (a lamp shade, a beam); ONE
  opening, the window, 15-30 % of the frame, read in y 600-1250, >= 10 L* off its surround (lighter by day; at night the
  cool darker inset). No horizon in the room; the view in the window keeps the set's setup. The subject: the person at
  the desk (back or 3/4 back, head at y 864-1152, back to a wall, facing the window) or the object on the desk, in the
  golden box. Masses: the room one light-mid tone, the window, the desk mid. Quiet: the wall behind the captions and the
  floor or desk (the two quiet fields indoors). Light: one low lamp, the story light, and at most one secondary (a
  screen); its pool on the desk with real falloff; cold only in the window. Eye: the words on the wall, then the
  lamp-lit subject; the window one step under it. Band: a flat light wall (L* >= 70), never the window.
- **Device:** refuge and prospect (N13): one opening in an enclosing mass, held, not shut (C1); the room's two held
  edges an L (B10), the bookcase the one framing wing (B10's), the armchair a soft near hint cut by the edge (C2, E5).
  Variant: a round window as the opening (B13).
- **Camera and joins:** locked or the float; small loops inside (steam, a page, breath). Out by A through the window
  (K9: the window 15-25 %, a push 0 -> 0.85 in 1.2-2 s); back in by A out of it.
- **Never:** a ceiling light; the window and the lamp at the same brightness (two calls); a mullion across the view's
  landmark; the window behind the captions; the room's wall dead flat (it is patterned +-4-6 L*).
- **Video 4:** inside the flat behind the one window: the radiator under the sill as the subject (y ~1000-1150), the
  lamp's warm pool on the sill the story light, the snowy street and the giant computer's small lights a cool step
  darker in the glass.

**SR5 THE BALCONY**
- **Beat:** the home place seen from above (a street, a square, a courtyard); a crowd; the flow of a place.
- **Layout:** the BALCONY dose (`COZY_AND_SCALE.md` 3b.2): from a 3rd-5th floor window, 35-55 degrees down; no sky and
  no horizon. The lid y 0-600: >= 90 % mass cut by the top edge, one flat facade (L* >= 75) across x 95-945, y 290-600
  behind the captions, one corner mass cut by two edges and 1-2 smaller side masses (a C-shaped cradle). The life band y
  600-1250: the far kerb, people 70-190 px, the story's object. The floor y 1250-1920: one calm field in <= 2 tones,
  15-18 L* lighter than the masses. One C-curve (a kerb, a bank) enters just under the band (y 600-700), leaves the
  other side at y 860-1060 and dives under a mass through a mouth <= 150 px. The subject sits on the curve in the golden
  box. Light: a lit shopfront or the object's own light on the curve. Eye: the words on the lid's flat facade, then down
  to the subject; the curve carries the eye round it.
- **Device:** the C-curve (B9) under a lid that frames the band instead of crossing it, from a high angle (N12).
  Variants from the same balcony, once a film: a crossroads seen corner-on, its two streets crossing as an X on the
  focal (B7); a spiral stair or a roundabout curling in to its centre at (540, 1000-1100) (B12).
- **Camera and joins:** locked; the traffic follows the curve; movers enter and leave only through the open sides or the
  mouth. In and out by A (the window we look from) or C.
- **Never:** the canopy or a roof edge in the band; one lone person as the subject from this height (a high angle on one
  person reads as being looked down on); the floor busier than the life band.
- **Video 4:** from the next block's snowy balcony (Pip's spot in S1 and S12), the street below curving from under the
  band toward the harbour, the melt line along it the subject's path, a tram on the curve, the snow floor the calm
  field.

### The subject's moment

**SR6 THE LIT OPENING**
- **Beat:** the subject's moment: one person or one thing in its place; the start of a push-through reveal.
- **Layout:** the set's setup. One opening (a door, a window, an arch, a gate, the gap between two masses) on the axis,
  15-30 % of the frame; its lit aperture's centre in the golden box (x 413-667, y 951-1187), its top at y >= 620. The
  aperture is the lightest area below the sky (>= 10 L* off its rim); the figure or object inside it is dark against it
  (a step >= 65 L*), a figure 150-300 px tall; the rim (the wall around it) one mid or dark mass, quieter than the
  aperture, with <= 2 props. Quiet: the sky with the band above the wall; the ground below. Light: the opening is the
  story light, a soft glow and gentle bloom at it that end >= 10 px outside the band, a pool on the ground in front.
  Eye: the words, then straight down into the lit aperture and the silhouette in it.
- **Device:** frame within a frame with the lit opening (C1, E2): the inner frame the brightest area, the figure dark
  inside it (counterchange, N7). The two calmest reel examples are this (a stairwell's lit gap with one man in it: 2
  calls, 83 % quiet; a row of windows with one man in one: 1 call, 73 % quiet). The aperture in the golden box (A2), the
  drop from the words 300-450 px (N5); the figure may cross the opening while the camera holds (E9). (Its golden-spiral
  variant, A4, is NOT FOR US unless the owner overrules: Part 0.1.)
- **Camera and joins:** locked while the figure stands in the opening or crosses it; then a push-through (A, K9): 0 ->
  0.85 into the aperture in 1.2-2 s, and the aperture IS the next shot; or a C push of <= 2x to a closer view of it.
- **Never:** two openings lit alike; the opening under the rail (x > 870 below y 860); the figure touching the opening's
  edge (overlap it by >= 10 px or keep >= 20 px clear); the opening's glow laid over the wall; a centred, symmetric
  doorway in every beat (once is formal: SR23).
- **Scene 1:** a C push of <= 2x from the home view to the Google door: the doorway ~450 px wide with its canopy (~15 %
  of the frame), its inside at L* >= 95, her silhouette ~300 px tall at L* <= 28, the brick round it one mid mass (~L*
  52), the panes above tone-on-tone.

**SR7 THE PATH IN**
- **Beat:** arrival: the subject at the end of the way; the thread travelling to its place; a slow, calm way in (the
  S-curve).
- **Layout:** setup A or B. Lines in the ground (kerbs, a coping, a pier's rails, a path's edges, tracks, a light's
  column on water, a melt line in snow) rise from the bottom edge (they may start under the bottom UI as masses) at
  40-60 degrees, in 2-3 legs of >= 150 px, to the subject at (480-640, 950-1150); the vanishing point on the subject or
  hidden behind it; the sight line closed by one object. **The S-curve variant:** a canal, river or path winding up the
  frame in 2-3 bends, entering at the bottom edge (x 250-830), each bend 25-40 % W wide and about half the width of the
  bend below it, ending on or behind the focal. Masses: the ground mid with its lines tone-on-tone, except the lit lane;
  the sky light with the band; the far end lit. Quiet: the sky; the ground between the lines. Light: the lines end at
  the story light (a lit end, a light's column). Eye: the words, then the lit end; the lines confirm it from below.
- **Device:** leading lines and one-point perspective (B1, B2) to a closed vista (E7), entering in 2-3 zigzag legs (B8's
  angular form); the small figure or the lit opening where they meet (E1, E2); the subject travelling the line while the
  camera holds (E9); the near quay a soft hint (C2, E5). The S variant (B8): the tall ground holds one more bend than a
  landscape frame.
- **Camera and joins:** locked while the subject travels the line (into the vanishing point, along the path: the reels'
  runner went 305 -> 92 px in 1 s down a pier's axis); or a push to the vista (>= 3 % in <= 2 s, on its word). Out by A
  (into the end) or C (on along the line).
- **Never:** lines ending on nothing (an empty vanishing point in the sky); a brighter patch on the path than at its end
  (reel 04a's sunlit patch beat the man the lines pointed at); a line across the band or corner to corner unbroken; a
  line leading on past the focal down to the name block (the exit).
- **Scene 1:** the door's broken light column on the canal is the one line in, rising from our side of the water to the
  lit door, while the quay's paving lines stay level and quiet (in still v6 they run to a point ~1,100 px off the left
  edge).

**SR8 THE BREAK IN THE ROW**
- **Beat:** the one among many: one home in a city, one person in a crowd, the thread's home spot among its kind.
- **Layout:** the set's setup. A repeated motif (a facade's windows, boats, bollards, umbrellas) is ONE texture inside
  one mass: its pieces within +-6 L*, sizes varied 5-12 %, states mixed, never a ruler grid of identical rectangles. One
  break in it is the subject: one window lit warm with a person or the thread in it, at (413-667, 860-1100). Masses: the
  facade one mid mass, the sky with the band above, the street or water below. Quiet: the sky; the wall below the
  windows. Light: the one lit pane is the story light and carries the scene's one hot accent; the other panes dark or
  lit a step under it, inside the facade's value. Eye: the words, then the one break.
- **Device:** a pattern with one break (D7: a row of six windows with a man leaning out of the fifth, 1 call, 73 %
  quiet; cinema §4.15); the break a lit opening (C1, E2) carrying the scene's one hot accent (E8), in the golden box
  (A2).
- **Camera and joins:** locked; the break may happen on its word (the one window lights: a light change in place); out
  by A (a push-through into the window).
- **Never:** two breaks; a saturated colour in any other window (still v6's four yellow upper windows were the colour
  formula's #1, out-shouting the lit door); the pattern's pieces with their own silhouettes at a squint.
- **Video 4 (S1, S12):** the block's one window is the only warm pane before "seventy"; the windows that light after it
  stay a step under it (+6-8 L* inside their facades, cooler), so the one window stays the break all film long.

**SR9 ON THE LINE OF LIGHT**
- **Beat:** a person's moment: an arrival, a pause, the stillness after a turn; one upright thing (a lamp, a mast, a
  tree) as the subject.
- **Layout:** setup A with a low camera (0.9-1.2 m): the horizon y 1150-1300 is a lit line (a lit far shore, a sunset
  sea, the lit canal, a far band of lit windows); the subject stands ON it as one dark upright, 150-300 px, centre x
  413-667: at 0.9 m a 180 px figure spans y_h - 85 to y_h + 95, the light behind its chest. Masses: the sky 50-65 %
  (light, quiet, the band high in it, one big cloud high as the counterweight), the thin lit line (the frame's hardest
  step where the figure crosses it), the ground below dark. Quiet: the sky and the dark ground. Light: the lit line is
  the story light (a sun on it one step off its sky unless it is the shot's "look here"). Eye: the words, down to the
  brightest line, then its one break: the figure.
- **Device:** the cross (A6): one strong vertical across one strong horizontal, at the subject; counterchange (N7; the
  owner's beach reference: the couple dark ON the lit horizon line, its one call); the horizon near the lower third
  (A1, N3: setup A); the one small figure (E1) walking the line with its looking room ahead (E4, E9), or standing still
  while the far life passes (E3); the big cloud high on the far side as the steelyard (D4).
- **Camera and joins:** locked; the figure walks along the line with its lead room ahead, or stands; clouds drift 3-6
  px/s. Out by C, or D (the figure leaves one edge and enters the next shot from the opposite edge at the same speed).
- **Never:** two uprights of equal weight on the line; the line at the half; the figure's head in the band or its feet
  under the bottom UI; the figure facing us.
- **Video 4:** a walker crossing the snowy harbour front, dark against the far shore's band of lit windows on the
  horizon at y ~1200, the one big snow cloud over the harbour high on the other side.

**SR10 THE FOLLOW**
- **Beat:** travel and the mechanism on its way: a walker going home, the thread on its way, heat moving through a pipe.
- **Layout:** **Sideways (a truck):** the subject held at x 410-560 while the world slides past (each plane by its
  depth, 1/z), facing its travel with 1.5-2x lead room (moving right: at x <= 410 below y 860); the background drawn as
  the view plus the travel; life passes the other way at its own pace. **Up or down (a tilt, the tall frame's own
  move):** the subject or its effect travels the frame's height (water down a pipe, steam rising, a tower up), the
  camera shifting 600-900 px in 2.5-3.2 s with the verticals parallel (K2's shape), the subject on the axis, the band
  one flat field at every frame. In both, the subject is the one thing moving against the flow and carries the focal's
  value step with it.
- **Device:** the pivot (E3 with the camera moving, its motion I12; rule 12): the screen-locked subject among moving
  planes wins the eye [cinema S6], drawn sharp; the kerbs and rails as parallel lines that hold while things pass on
  them (B5); lead room ahead (E4); height, not width, is the tall frame's travel (`composition/vertical.md` §6).
- **Camera and joins:** one move on one ease: it catches the subject up, holds it, then lands with the next beat's frame
  in the golden box. Out by C (the camera goes on), or D (the subject leaves one edge and enters the next shot from the
  opposite edge at the same speed).
- **Never:** the subject wandering in the frame; a compound move (a truck plus a zoom, a tilt plus a zoom); a source's
  speed (retime it); the subject riding into the rail at the right edge; two follows in a row (Part 0b §2).
- **Video 4 (S10, S11):** S10 tilts down with the cool water from the computer's top to its foot while the steam above
  it thins; S11 trucks right with the hot water's front held at x ~400, its lead room to the right, the street sliding
  past, landing with the block's foot, its wall and the one window in the golden box.

**SR11 THE LEVEL CHANGE**
- **Beat:** cause and effect in one frame (the street above, the pipe below); two places joined (a square above, a
  towpath below).
- **Layout:** setup B (camera 3-7 m) or a soft cutaway. Two levels: the upper at y ~700-950, the lower at y ~1150-1450,
  joined by steps, a slope or the cut's edge, running 30-45 degrees through the stage (the shot's one diagonal). The
  subject on one level, in the golden box; the life or the effect on the other. Each level is one mass; the subject's
  holds the story light. Quiet: the sky with the band above the upper level; the lower level's ground. Eye: the words,
  the subject's level, then along the steps to the other.
- **Device:** the level change (C3: a walker high on a station stair, people waiting below); only the tall frame holds
  both stages. The steps are the shot's one diagonal (B6) on the stage square's 40.4 degrees, the subject at a foot of
  its golden triangle (A5: (626, 987) or (454, 1133)); their nosings are parallel lines (B5) the eye climbs in legs
  (B8's zigzag form).
- **Camera and joins:** locked, or a tilt from one level to the other (SR10); out by C.
- **Never:** two levels with equal calls; a ruler-straight cut through the ground (it reads as a diagram: the cut is a
  soft, irregular painted edge, or there is none); the lower level's key read under the bottom UI (y >= 1519).
- **Video 4:** the snowy street at y ~850-1150 above, the warm pipe in a soft, irregular painted cut of snow and earth
  at y ~1250-1450 below, the melt line in the snow joining the two; or no cut at all, the melt line alone showing the
  pipe's path.

### Intimacy

**SR12 THE CLOSE**
- **Beat:** intimacy with the object the story turns on; the personal beat; a mechanism's detail.
- **Layout:** no horizon (or the set's, far behind). The object >= 60 % W (>= 650 px), the biggest whole thing in the
  frame, its centre in the golden box, its top under the band (y >= 620); its own backing one quiet field in the place's
  colour, flat behind the captions; <= 2 other things, cut by the edges. The detail (found edges, the finest marks) on
  the object only. Light: the story light on the object: its lit face, a rim on the key's side, its shade face the
  deepest of the frame. Eye: the words, then the object's one feature that names it.
- **Device:** isolation (N9): size on screen makes the subject important, and the background is read in about a quarter
  of a second while the eye stays on the subject (2D layout practice, cinema S16); the object on the centre (N1), in the
  golden box (A2).
- **Camera and joins:** reached by a push of <= 2x per panel (A or C), the close drawn at its own size, or by a plain
  cut-in on its axis on a "But" turn (F); then locked or the float. Out by C (a pull back) or A.
- **Never:** a face, or a person as the subject; a 4x zoom of the wide drawing; the object inside a screen rectangle (it
  reads as a picture on a display); steam, a glow or the object's top in the band.
- **Video 4 (S3):** the computer's top ~700 px wide on the axis, its flakes melting to steam on "really" that rises and
  thins out below y 600, the snow beyond one quiet dark-blue field.

**SR13 THE HANDS**
- **Beat:** intimacy with the "you": the effect in the viewer's own hand; the "for you" of the payoff.
- **Layout:** POV: the "you"'s hand and forearm rise from the bottom left (the wrist runs under the bottom UI as a
  mass); the thing in hand (a phone, a cup, a key) centred at (300-600, 1000-1250), its face or screen inside x <= 870
  and y <= 1480. Behind it the world keeps the set's setup, the cause in it on the axis above the hand (y ~700-1000),
  changing on the same word as the thing in hand (one subject group). Masses: the hand and sleeve dark-mid (the near
  mass), the world mid, the sky light with the band. Light: the thing in hand lit (a screen's glow is a local story
  light); the cause a step under it until the payoff word. Eye: the words, the cause, then down to the hand (300-500
  px).
- **Device:** the POV hook (E11) with the cause above and the effect in hand (`CINEMATIC_GUIDE.md` "The opening": the
  cause outside the home window, the effect in the hand, both changing on the payoff word); the near "you" only as hands
  (E10).
- **Camera and joins:** locked or the float (the hand breathes <= 2 % W/s); the hand acts once, on its word. In by A (a
  pull back out of a window or a screen) or B; out by A (into the screen) or B.
- **Never:** the screen under the rail (x > 870 below y 860) or the name block (y >= 1519); a logo or readable fine
  print on the screen; a big near body; the hand coming in from the right edge (it lands under the rail).
- **Video 4 (S12):** the gloved hand and phone come in from the bottom LEFT (x ~150-500), not the bottom right, where
  Instagram's rail (x 877-954 from y 1032) and the name block (y >= 1519) sit; the phone's screen at ~(380, 1150), the
  chat bubble on it, the warm run and the one window above and right of it.

### Scale

**SR14 THE YOU AND THE WORLD**
- **Beat:** scale from a human viewpoint (the film's lesser scale moment, not the big move); the establishing view of a
  city or a coast; "what this means for you".
- **Layout:** setup A (horizon y 1150-1300, the camera at 0.9-1.6 m). The "you" at x 130-380 facing right, from behind
  or in silhouette, 130-220 px: its head on the horizon (camera 1.6 m: head y ~1140-1290) or 60-105 px above it (camera
  0.9 m), its feet at y ~1220-1510. The world beyond: one dense belt on the horizon (a far city, a coast, a harbour),
  rising into the sky where it is tall (tops at y >= 620). The focal is the far world's one lit point (a lit tower, a
  lit window, the sun on the horizon) on the axis at (480-640, 950-1200), on the "you"'s sightline. Masses: the sky
  light, 50-65 % with the band high in it; the far belt mid, its density inside it; the near ground and the "you" dark,
  one connected dark mass rising into the light at the line of heads. Quiet: the sky; the near ground. Light: the far
  lit point is the story light, the key behind the far world (the "you" a soft silhouette). Eye: the words, the far lit
  point, then the "you" looking at it.
- **Device:** scale from a known size (D2: "We feel the vastness of a scene by the presence of a lone figure", Poore
  1903, via cinema S1): the one small figure (E1), the reels' near "you" made one whole 130-220 px figure at one side
  (E10); its looking room and the gaze cue (E4: the "you"'s sightline sends the eye to the focal [cinema S9]); setup A's
  horizon near the lower third (A1, N3); the far belt paler with distance (E6, N6). Variant: a tower with the lit window
  small at its foot (A3). The owner's human-scale references (`refs_human_scale/`: the city hill, the beach) are this
  frame.
- **Camera and joins:** locked or the float; or a push to the vista (>= 3 % in <= 2 s, anchored on the far point); life
  in the sky (birds, clouds) and far away (a ferry, a tram), never by the "you". In by C (a rise or pull back from the
  home view); out by A (into the far point) or C.
- **Never:** the "you" on the axis covering the focal; the "you" facing us, or as bright as the focal; a far,
  poster-like panorama with no near figure ("too cheap looking"); a wall filling the frame ("suffocating").
- **Video 4:** the "you" walking home in the snow at the street's near edge (x ~200-350, ~180 px, from behind), the
  harbour and the far city as one band of lit windows on the horizon at y ~1200, the block's one lit window above it at
  ~(560, 1000) on the "you"'s sightline.

**SR15 TINY UNDER GIANT**
- **Beat:** scale: the quantity, the machine, the system beside one person.
- **Layout:** a worm's-eye (K7: camera 0.3 m, horizon y 1114-1229) or eye height (horizon y 1020-1133, off the half).
  The giant >= 0.7 H tall (>= 1344 px) and >= 10:1 over the figure, cut by the top edge, its face across the band one
  flat field (L* >= 70), its top in a gutter or cut off. The figure (the "you" 130-220 px, or an anchor 60-150 px in a K
  wide) low near the axis (x 420-660), feet above y 1250 (K7) and always above y 1480, on plain ground in front of the
  giant (against a busy giant it vanishes). Masses: the giant one mass (mid), the ground light and plain, slivers of
  sky. Quiet: the giant's face (patterned +-4-6 L*) and the ground. Light: at the figure's spot (a pool, or the giant's
  lit door at its foot): the figure is the stage's only high-contrast mark. Eye: the words on the giant's flat face,
  down its verticals to the figure at its foot.
- **Device:** scale (D2: a man at a railing, 214 px at full width, under a tower that fills half the picture), the one
  small figure at the giant's foot (E1); the cross (A6: the giant's vertical on the ground line); the nested golden
  section (A3: the giant's edge on x 667, the figure in the nested cell near (570, 1086)); the hall's rows and floor
  joints radiating from the figure's spot (B3); the worm's-eye (N11), Guo Xi's high distance (N6). Variant, once: a
  light shaft and its pool singling out the figure in a vast interior (K8).
- **Camera and joins:** locked (K6, 2-3.5 s), or a tilt-up reveal (K2's shape: 600-900 px in 2.5-3.2 s, the top landing
  at 0.08-0.15 H or cut). In by a plain cut F only on a "But" turn (K1: the wide's figure <= 1/8 of the close's size),
  or inside the big move; out by A.
- **Never:** the low angle on the thing under critique (scene 1: never on the Google building); the figure on busy
  ground or under the bottom UI; the giant's detail in the band; two scale wides in a row.
- **Video 4:** S10's planned hall, its rows of giant computers running past both side edges, with one engineer at ~130
  px at its foot: the one 2-storey computer is only ~4:1 over a person, so the hall, not the one machine, is the giant.

**SR16 THE BIG SKY**
- **Beat:** a breather: after a dense or scale beat, before a key line, or the outro; the caption owns the frame.
- **Layout:** a low horizon (S3 ~0.73 H, y ~1402; S4 0.82 H, y ~1574, its ground band allowed under the bottom UI as a
  mass). The sky 70-80 %: one gradient, 2-3 painted cloud masses in planes (the near one biggest), the hero cloud cut by
  a side edge as the counterweight, every cloud below the band. One landmark on the left third (x 220-420) rising to
  y >= 600 (S3), or the "you" small (~150 px) at the bottom left, its feet above y 1480 on a wall or a step (S4), or
  nobody. Masses: the sky light (one big quiet field, patterned), the land strip dark. Light: the sun half behind a
  cloud's edge (S3) or a half disc on the horizon (S4's closer variant), at the subject's side. Eye: the words, then the
  landmark or the figure at the field's foot.
- **Device:** negative space (D1: the space gives the small subject weight); Guo Xi's "level distance", a thin band of
  land under a huge sky (N6, cinema S19); the landmark on the left third (A1); the hero cloud as the steelyard's far
  weight (D4); the far city paler with distance (E6). Variant, once a film: the sun behind the roofline (S2), the
  disc itself the subject.
- **Camera and joins:** locked or the float; clouds drift 3-6 px/s, birds cross the top. S2 and S4 at most once each a
  film; never next to SR17.
- **Never:** an empty sky (it is patterned: clouds in planes, birds, a gentle variation in tone); a cloud or a top in
  the band; the figure under the bottom UI; the same breather twice in a film.
- **Scene 1:** the far city a thin strip at y ~1400-1520 under the dusk sky, one big cloud bank lit rose on the sun's
  side at the left, the bridge's arch the one landmark on the left third.

**SR17 THE ONE BIG MOVE**
- **Beat:** the film's one scale reveal ("it is bigger than you thought"), once a film: S1 or S5, never both.
- **Layout:** `CINEMATIC_GUIDE.md` S1 or S5, as three designed frames (rule 12). **S5's start:** the horizon at 0.44 H
  (y ~845) seen only through a slot (3-5 % of the frame, the brightest and coolest patch in a warm dark frame, x
  240-600, y 780-900), the figures from behind (heads <= ~140 px, from y 1060, cut at the hips). **S5's end:** the
  horizon at 0.46 H (y ~883), the landmark centred at (760, 760) on the right third with its top at y >= 620, the
  figures tiny at x 420-560 (feet y 1490, 170-200 px), 6 planes, a lit canyon leading to it. **S1:** the near wall and
  the "you" fill the bottom 25 % (top edge y ~1440) at 0.37 H (y ~710), landing at 0.40 H (y 768) with the city in the
  lower 60 %. The band stays in the flat sky at every frame (S5's start: sky y 0-840). Over the move: the bright slot in
  a dark frame, the darkest moment at the dormer, a light burst before the landmark lands, the settle. Eye: on the pivot
  (the figures) through the move, then the landmark as it lands.
- **Device:** scale (D2); the pivot (E3 with the camera moving, its motion I12: the subject holds still while the world
  moves past it); a frame within a frame opening into the world (C1; S5's slot is the tunnel's light at the end, B4);
  Guo Xi's deep distance in 6 planes (N6), paler with distance (E6).
- **Camera and joins:** one continuous move on one ease (S5: a dolly back, a crane up and a 70-80 degree arc; S1: a
  rise), retimed to the reel (S5's default a 2.6 s move + a 0.7 s hold), the landmark landing on the payoff word. It
  leaves from the thread (the declared scale reveal may run without it) and the next join returns to the thread, by A
  (the dive back in) or C.
- **Never:** a zoom instead of a dolly; a second big move; roll; the landmark in the band; Pip as the anchor.
- **Video 4 (S6):** out from the mug to the Earth's curve: hold the pivot (the mug, then Helsinki's lit spot) within
  +-40 px of one point on the axis all the way out, and land with the curve's horizon off the half (y <= 860 or >=
  1150), the band in the sky above it one flat field.

### The turn

**SR18 THE OFF-BALANCE**
- **Beat:** the turn ("But ..."): the one place in the film where the composition leans.
- **Layout:** the set's setup. The focal leaves its home to one side, x 250-380 or 700-830 (still inside the clear
  window), with no counterweight on the other side, which stays open (sky, water, empty ground); or one dominant
  diagonal of 30-45 degrees rises through the stage to the focal; or the inverted triangle (the V), its point at the
  focal. Masses: one heavy dark mass on the focal's side, the open side light, the band in the set's flat sky or wall
  above both; the step at the focal the film's hardest so far. Light: the story light hard on the focal (a raking key, a
  lamp switching on). Eye: the words, then a longer jump to the off-centre focal: the turn is felt.
- **Device:** the off-balance (N15: "deliberate tension: one heavy side and nothing against it", cinema §9; not the
  reels' "unbalanced", which is the steelyard of every frame), its open side negative space (D1); or one diagonal (B6),
  laid on the stage square's golden triangle with the focal at a foot (A5); or the V (B11), its point at the focal:
  contrast against the home beats' affinity (level lines, close values, slow), as a film's intensity curve is planned
  (cinema S17). Variant, once: short-siding or the low quadrant (M3).
- **Camera and joins:** a plain cut (F: at most 2 a film, only on a "But" turn, the thread on both sides, a size
  change >= 20 % (>= 1.5-2x proposed: §5 row 14) or an angle change >= 30 degrees), or a push that lands off-centre;
  then a hold of 0.5-1.0 s (the pause after the heaviest line) before the next move.
- **Never:** in a cozy or home beat; twice in a row; the focal under the rail (x > 870 below y 860) or in the cut
  strips; a tilted horizon.
- **Video 4 (S7, "But Helsinki WANTS that heat"):** the dive lands with the computer at x ~330, off the axis, the city's
  pipe coming in from the right, so the empty stretch the pen draws on "WANTS" crosses the open half toward it; S8's
  push re-centres on the plan.

**SR19 THE MATCHED PAIR**
- **Beat:** the turn told by light (a window goes dark, a lamp comes on); before and after; the callback.
- **Layout:** the same frame as an earlier shot (a B match: the thread within +-8 % of its spot and +-20 % of its size;
  a deliberate match keeps the exact frame) with ONE change at the focal: the light (lit to dark, dark to lit), the
  thing (a price, a sign, a level), or the hour. Everything else stays identical, so the change is the only difference.
  Light: the key changes only on a story turn, once or twice a film, carried by the light changing in place (a lamp or a
  window switching, a cloud crossing the sun), never cut in; a colour shift over 15 at the join is then declared
  (`CRAFT.md` §a). Eye: straight to the change.
- **Device:** the deliberate match (N14: "the same chart again, the same place later, the callback to the opening's end
  frame", `STORYBOARD_STYLE.md` §7); the colour script's one key change per story turn (cinema §7).
- **Camera and joins:** locked on both; the change lands on its word. The join between the two is B, or the change
  happens inside one held shot.
- **Never:** a drift between the two frames (it reads as a mistake); two changes at once; a light source that moves
  between them.
- **Scene 1:** the home view with her office window on the axis the one warm pane, then the same frame with it dark on
  "She quit": the other panes unchanged, so the one dark pane is the story.

### A comparison or a list

**SR20 THE SEAM**
- **Beat:** a comparison inside one frame: two states (cold and warm, before and after, thrown away and kept).
- **Layout:** one line (a waterline, a shoreline, a melt edge, a shadow edge, a wall) splits the stage into two fields,
  across it (one state above, one below) or on a 30-45 degree diagonal; each field one value and one texture, their
  means >= 13 L* apart; the subject sits at the seam, in the golden box. Quiet: each field calm inside itself. Light:
  the story light on the subject at the seam (the hardest step is the seam at the focal). Eye: the words, then the seam
  where the subject sits; the two fields read in one glance as "this against that".
- **Device:** juxtaposition (D6: a beach split from the sea by its shoreline), the seam often one diagonal (B6); two
  opposites side by side read as intense (cinema S17); the camera holds while the seam's front travels (E9); the subject
  in the golden box (A2).
- **Camera and joins:** locked; the seam's front may travel (a melt spreading, water rising, a shadow moving with the
  light) as the beat's one mover. Out by C.
- **Never:** two stages stacked as a split screen (the eye switches between streams: `composition/vertical.md` §2); the
  seam across the band; two equal fields with nothing at the seam.
- **Video 4:** the melt line in the snow over the pipe: white, untouched snow on one side, the dark wet melt on the
  other, the hot water's front running along the seam with the one warm accent at the front.

**SR21 THE LINEUP**
- **Beat:** how many: a count made visible ("forty kettles"); a list of like things.
- **Layout:** the set's setup, seen a little from above so the rows recede. The many are equal small things, each >= 60
  px, ONE texture in one mass (within +-6 L*, never forty subjects); the count reads as a shape (rows by columns: 5 rows
  of 8). The cause, when shown, is the apex behind them: a pyramid with its base on the near ground (y 1350-1520, >= 540
  px wide) and its apex in the golden box. Or one row on a ledge (an Isotype row), one unit broken out as the subject.
  Masses: the units one mid texture, the cause one strong mass (its top at y >= 620, under the band), the floor light.
  Light: on the cause (or the one unit broken out). Eye: the words, the cause at the apex, then the spread of units
  below it.
- **Device:** repetition (D7: "'How many' is a row of equal small icons (Isotype), not one bigger icon",
  `STORYBOARD_STYLE.md` §3); the pyramid (D5; cinema §4.10: the apex on the focal, sides 50-70 degrees), its rows
  receding toward the apex (B3), seen a little from above (N12), the apex in the golden box (A2). Variant: the units in
  a ring round the cause, the cause inside the circuit (B13).
- **Camera and joins:** locked; the units pop by rows on their word, never one by one for forty; out by C.
- **Never:** units of different sizes or colours (it becomes a tour); units as strong in value as the cause; a unit
  under the rail or in the bottom UI; a number tag beside the caption's number.
- **Video 4 (S4):** the 40 kettles in 5 rows of 8 on the snowy floor at the computer's foot (the front row ~650-700 px
  wide at y ~1400, the back row ~500 px at y ~1180), one mid texture of lids and spouts whose steam joins the
  computer's; the computer the apex with the hardest step.

**SR22 THE PAPER**
- **Beat:** the proof: a chart, a number, a date, a plan; information as paper in the place.
- **Layout:** paper in the place the camera is already in (a printout, a phone, a board, a tag), straight-on and level;
  as the beat's subject (a chart) it is >= 60 % of the stage wide (>= 456 px), with axes an L, one line or 3-5 bars
  and <= 2 axis words at 56 px; as a tag on the subject (a date, a price) it carries one number or word, 120-160 px, on
  or touching what it measures; the paper's face one quiet light field with its top under the band (y >= 620), its place
  visible at the edges (a hand, a wall, the snow). Light: the paper lit, the place a step under it. Eye: the words, then
  the number or the line's end.
- **Device:** figure and ground (N7): one light rectangle, one dark mark on it (`LAYOUT.md` §2 chart row), isolated (N9)
  on the centre (N1); the line drawn first, in step with the voice (T).
- **Camera and joins:** entered by a push (A) or a card flip (E); the line draws on in step with the voice (a draw-on is
  allowed where the drawing is the beat); held >= 1 s after its number lands.
- **Never:** a new place made for the chart (a billboard, a noticeboard); small words, sources or fine print (they go in
  the post's text); the paper at an angle (it bends the number); the same words as the caption.
- **Video 4 (S8):** the paper tag swinging onto the plan's front wall on the axis, below the computer's middle, "2027"
  at 120-160 px: the only word in the film's picture.

### The payoff

**SR23 THE MIRROR**
- **Beat:** stillness: a formal, settled beat (an answer, the quiet before the payoff, the loop's end); once a film.
- **Layout:** a landmark or a lit opening on the axis (x 540), mirrored left to right (the two halves within +-5 % in
  mass) and in still water below it: the landmark at y 850-1040, the waterline (the horizon) at y 1040-1100, off the
  half; the reflection below it to y ~1300, calmer and a step darker; the banks' masses at both sides as the symmetric
  frame. Masses: the sky light with the band; the landmark and its reflection the one call; the dark banks. Light: the
  landmark's light and its reflected column. Eye: the words, then straight down the axis to the landmark.
- **Device:** symmetry (A7: a pavilion mirrored in a still lake at dusk); the axis x 540 sits 20 px from the captions'
  centre line, so the words sit on the mirror's axis; the two banks mirror each other as A7's own frame
  (balance as two equal subjects, D3, is NOT FOR US); one slow mover crosses while the camera holds (E9).
- **Camera and joins:** locked; one slow mover (a bird, a boat) crosses and breaks the mirror once. In or out by B (a
  matched frame), or as the loop's frame.
- **Never:** more than one a film (two at most); the horizon at the half; three wides in a row sharing a centred
  landmark on a ground line; symmetry for a mechanism beat (it stops the eye).
- **Scene 1:** the lit doorway centred on x 540 across the still canal at dusk, its light column and reflection doubling
  it down to y ~1300, the two banks' dark masses mirrored at the sides: a still beat for her answer.

**SR24 THE WHOLE RUN**
- **Beat:** the payoff and the callback: the whole story in one picture; the frame the film loops from.
- **Layout:** the home view's matched frame (the opening's end frame, kept exact: SR19), now with everything the story
  built visible end to end: the thread's whole path drawn as one line that sweeps the eye through the frame in 2-3 legs,
  in the story's order, and ends at the focal (the thread at its home spot, in the golden box). The film's hardest value
  step (>= 65 L*) and its one hot accent at the focal; the light at its warmest; Pip back on its first spot. Eye: the
  words, the path's start, the sweep, the focal.
- **Device:** the matched frame (N14) and one sweep ("triangulate in, with a series of zigzags", Poore 1903, via cinema
  §4.5: B8's zigzag form): the thread's run is the leading line (B1), ending on the one hot accent (E8). Variant: a
  spiral pathway curling in to it (B12); the golden-spiral sweep (A4) only if the owner overrules (Part 0.1).
- **Camera and joins:** a pull back (A) out of the last close onto the matched frame, then locked; the last frame
  un-draws to frame 0 (B).
- **Never:** anything new the film has not shown; a title; a second focal.
- **Video 4 (S12):** the home view with the warm run lit from the giant computer under the street to the one window; the
  pulse travelling the run on "could ... heat ... apartment" is the sweep, ending on the one window lighting a step
  warmer; the phone from the bottom left (SR13).

### Not in the library (Part 0's NOT FOR US rows)
Each with its reason and what we use instead: Part 0 (§0.3-§0.5), and the owner's override, Part 0.1. From his reels:
the blur (X1; a near framing object's one optical blur of 2.2-3 px aside), the title over the shot (X2), the black line
card between ideas (RJ1), the fade (X3; a declared time-passing dissolve aside), the handheld pass (RM9), the golden
spiral (A4) and balance as two equal subjects (D3). From our research: the split screen (X4), the Dutch tilt (X5),
isometric views (X7), forced three-point perspective (X8), the dolly zoom (X6), a zoom in a hold (X9), crash zooms
(X10), the whip (J9) and effect transitions (X11). Also out: the grids placed on the full frame (the thirds' crossings,
the full-frame golden triangle's and dynamic symmetry's eyes, the spiral's pole: in the band or by the bottom UI; A1 and
A5 live on as proportions and on the stage square); straight top-down views (the high angle once a film on a crowd,
overhead only as paper); and the photographs' density (1-14 value calls, median 6, against the owner's painted models'
1-2): we take their armatures, never their clutter.

## 4. Picking shots for a film (the composition-and-motion pass)

Done on the visual script before G3 (the playbook: "for each shot, which composition recipe it uses, how the camera and
the action move WITHIN the shot, and how it moves to the next"), one row per shot in the camera plan: the beat's
sentence; the frame device (its code and tier) and its recipe; the move inside the shot (its code and numbers); the
join to the next (its code, carrier and timing). Then:

1. **One recipe per shot, picked by its beat** (Part 0b §1; §2 above). A beat that fits no recipe is a story question
   before it is a picture question.
2. **Sequence it** by Part 0b §2: 6-9 frame devices, about 7 in 10 shots led by a CORE frame, each RARE one at most
   once, neighbours differing in size, device or camera height, the intensity curve, the rests.
3. **Give every shot its move and every join its carrier** by Part 0b §3's grammar (the frame's device holds its
   motion), and check the doses there (one big move, at most 2 plain cuts, J8 and J11 once or twice, J10 never twice in
   a row).
4. **One camera per set:** W1 names setup A or B, the camera height and the horizon for each set, and every shot in the
   set keeps them; a light never moves between cuts; the key changes only on a story turn (SR19). The "you" is one
   drawing (or POV) for the film, placed by the horizon-cut rule; Pip has a planned hiding spot in each exterior shot
   (>= 250 px from the focal; none in closes and charts).
5. **The focal's path and the value strip:** mark every shot's focal on one 1080 x 1920 sheet (most land in the golden
   box; a jump of more than ~150 px between neighbours needs a carrier that moves the eye, 370 px at most, or is the
   turn); then one 108 x 192 notan thumbnail per shot side by side: every focal found in under a second, one hot accent
   each, no two neighbours at the same intensity where the story changes between them.
6. **The phone check:** each chosen frame, and each move's start, middle and end frames, seen at the feed's crop with
   its interface drawn over it (x 98-982, the rails, the name block: V12): no key read under it, the focal in the clear
   window.

*A check at work on video 4's visual script (an example; the pass itself follows the owner's settling of this
library):* S10 tilts down with the water (SR10, I5) and S11 trucks along with it (SR10 again, RM3): two follows in a
row, which Part 0b §2 rules out. S11 could hold the camera and let the hot water's front travel the melt line across the
frame (SR20 with RM1, the camera still, as in 17 of the reels' 23 example shots), so the two shots differ.

## 5. Clashes with other docs (each with the doc that wins; none edited from here)

The order is `CLAUDE.md`'s (in full: DIRECTION's intro): the owner's words (the playbook, `docs/vN/OWNER_NOTES.md`, the
newest note first) > DIRECTION > CRAFT > PIPELINE_V2 > G3_ANIMATIC, G5_BLOCKING > the look docs, each on its own topic
(a measured number beats a proposal) > a film's STYLE.md > the v1-era docs; the research notes under `composition/`
inform this page and rank below it. Until the owner approves a change, the doc that wins stands, and this library
follows it in practice ("here" says how). Rows 1-14 were flagged by the first library and are still open; 15-28 are
new.

| # | the clash | wins | here, until then |
|---|---|---|---|
| 1 | **The feed's interface.** `LAYOUT.md` §1: top y < 180, bottom y > 1520, the right rail x > 950 at y 900-1500, the key-read box x 120-950, y 600-1480. Measured on the owner's feed (`composition/vertical.md` §1): the header to y 218-235 with a scrim to ~240, Instagram's rail from x 877 at y 1032 (~860 with a repost button), TikTok's from x 948 at y 797, x < 98 and > 982 cut | LAYOUT (the zones' doc) | rule 1 designs to the measured window, which lies inside LAYOUT's, so no LAYOUT rule is broken; proposal V1-V4 (the code follows: `video/src/lib/theme.ts` safe, `video/scripts/qa/framecheck.py`) |
| 2 | **The caption's width.** `LAYOUT.md` §1: <= 850 px; a full 850 px line starts 3 px outside the feed's crop | LAYOUT | lines <= 780 px (x 130-910), inside LAYOUT's; proposal V5 |
| 3 | **The default horizon.** `LAYOUT.md` §1: y 768 (0.40 H); at eye level a standing "you" then stands at y ~757-937, in the drop where nothing may call | LAYOUT | two setups per set, A y 1150-1300 or B y 690-860 (rule 6); proposal C2-C3: the default becomes a per-setup value |
| 4 | **Two sizes of "you".** `LAYOUT.md` §1: head 90-140 px, cut by the bottom edge (a figure of ~650-1050 px); DIRECTION 7: ~130-220 px, a whole figure | DIRECTION | 130-220 px (rule 7, SR14); the near "you" cut by the bottom only as POV hands (SR13) |
| 5 | **Horizons near the half.** `LAYOUT.md` §2 street 0.50-0.60 H (y 960-1152, the VP at x 648-756) and eye-height scale shots 0.52-0.59 H (y 998-1133), `COZY_AND_SCALE.md` §2 the same; rule 6: never y 900-1020 | LAYOUT (framing) | SR3 at y 1020-1150 and SR15 at y 1020-1133, inside LAYOUT's ranges and off the half; the VP at x 540-700 on the subject; proposal |
| 6 | **Setup B and the respect rule.** `LAYOUT.md` §2 and `COZY_AND_SCALE.md` §5: the camera "at or below the person's eye level"; setup B's camera is 3-7 m up | LAYOUT | setup B only with the "you" in POV or seen from behind as the viewer's stand-in, never on a person under critique; the owner's call |
| 7 | **A figure as the subject.** `LAYOUT.md` §1: a standing figure 300-650 px; SR9's figure 150-300 px, the human size of the playbook's DEPTH AND SCALE | LAYOUT | SR9 at 150-300 px as a declared human-scale frame; proposal: the 300-650 px box stays for a figure-led medium shot |
| 8 | **The opening's timing.** `CINEMATIC_GUIDE.md` "The opening": "0.00-0.35 s, the scene is made", "a new element every 3-6 frames" (no frame rate) | the playbook (the owner: "~0.3 s was invisible", every opening effect "BIG enough to stop a thumb") | the bold event >= 1 s, peaking after 0.4 s (rule 13); "3-6 frames" read at the reference's 30 fps: every 0.1-0.2 s, inside one build |
| 9 | **S5's start frame.** `CINEMATIC_GUIDE.md` S5: heads ~140 px from y 1060, cut at the hips (figures of ~1000 px if whole), the owner's pick of 2026-10-26; DIRECTION 7's "you" 130-220 px comes from his later DEPTH AND SCALE (2026-10-29) | the newer owner's words (DIRECTION 7) | SR17 keeps S5's numbers and its end frame (170-200 px) agrees; whether the start keeps its near figures is the owner's call |
| 10 | **Pushes and tilts.** `CINEMATIC_GUIDE.md` rule 3 and `COZY_AND_SCALE.md` K5 (a push 3-8 % in 2-4 s: its slow end under the visible floor) and K2 (a tilt 2.5-3.2 s with a 3-5 % zoom-out: a compound move) | DIRECTION 8 on the compound move and the visible story move; COZY_AND_SCALE on K2's and K5's timings | RM4 >= 3 % in <= 2 s; I5 without a zoom-out, 3.5-4.5 s (Arcane measured, a proposal: MR8) |
| 11 | **The "you" as the owner sees it.** DIRECTION 7: ~130-220 px, "8-16 % of the screen's width"; on his feed the width is 884 of our px, so 8-16 % is 71-141 px | DIRECTION (his number) | 130-220 px; proposal: show him the "you" at ~145 and ~200 px at the feed's crop |
| 12 | **Cozy and the big sky.** DIRECTION 7 (cozy >= 50 % of the runtime); `COZY_AND_SCALE.md` §2, 3b.1 (a cozy sky 15-30 %, exposed from 36 %); `LAYOUT.md` §8.1 (45-58 % the exposed dose); setup A and the owner's human-scale references put 30-65 % sky in a home view | COZY_AND_SCALE on the cozy doses | SR2 keeps the enclosed RIVERSIDE variant (sky 8-15 %) beside the open one; the owner decides on the look test of setup A |
| 13 | **The focal's height in setup A.** `ORGANIC.md` R7, carried into `CRAFT.md` §b as a WARN: the focal's centre at y 860-1200; a setup-A subject on the horizon belt sits at y ~1100-1300 | CRAFT | a setup-A focal down to y ~1250 only as the WARN's declared exception, or the focal on something rising above the horizon (rule 3) |
| 14 | **The plain cut's size change.** `video/docs/G3_ANIMATIC.md` §4: >= 20 % or >= 30 degrees; film and layout practice (`composition/cinema.md` C4): >= 1.5-2x | G3_ANIMATIC | >= 20 % is the gate; this library asks 1.5-2x (rule 11) as a proposal |
| 15 | **The near framing object's one optical blur.** DIRECTION 5: "a near framing object may take one optical blur" (`CRAFT.md` §f: 2.2-3 px, `PAINT_RECIPES.md` §3 C3); the catalogue's X1 said "no blur anywhere" and the first library's E5 "never blurred" | DIRECTION | X1 rejects depth of field, bokeh, rack focus and motion blur; the one optical blur stays allowed (rule 10, E5) |
| 16 | **The dissolve.** DIRECTION 8 and `video/docs/G3_ANIMATIC.md` §4 allow a declared time-passing dissolve (0.2-0.4 s, up to 1-2 s); X3 is NOT FOR US | DIRECTION, G3_ANIMATIC | X3 never as a join and never by default; the declared exception stays; J11 first |
| 17 | **The canyon's sky.** `LAYOUT.md` §3 and `COZY_AND_SCALE.md`: a canyon >= 2:1 with a sky <= 10 %; B11's V opens round the band, and the band alone (x 95-945, y 290-600) is 12.7 % of the frame | LAYOUT, COZY_AND_SCALE (enclosure) | in a canyon the band goes on a flat light wall (L* >= 70, `LAYOUT.md` §1); B11's open V counts as a lane (sky 15-30 %) |
| 18 | **The light match's circles.** `composition/motion.md` and `research/cine_light.md` T1: circles 760-1000 px centred at x 540, y 800-1050, which reach into the band; `LAYOUT.md` §1: tops of discs at y >= 600 | LAYOUT | a matched circle's top at y >= 600, so its centre at y >= 600 + its radius (a 760 px circle at y >= 980) |
| 19 | **The thread match's tolerance.** `CRAFT.md` §a: the thread within ±8 % of its spot and ±20 % of its size (8 % is 86 px across, 154 px up and down); J3 and J4 here: 150 px (190 for a light), 1.5x (the thread 1.2x) | CRAFT | CRAFT's numbers for the thread; 150 / 190 px and 1.5x for two different matched objects, a proposal (MR13) |
| 20 | **Sound on the change.** `composition/attention.md` L10, AR12 ("every onset the viewer must catch gets its own sound") and `composition/motion.md` MR20 (an effect "never > 2 f before" its event); `SOUND_SYNC.md`: spend sync, never sprinkle; a hard sync never before its picture | SOUND_SYNC.md (the look doc on sound) | rule 21 follows SOUND_SYNC.md |
| 21 | **The push defaults in code.** World `push` (1.00 -> 1.06 over 2 s) and ShotCam `push: true` (`MOTION.camera.push`, `video/src/lib/spec.ts`) put a zoom in every hold; DIRECTION's Retired list | DIRECTION | X9 NOT FOR US; the defaults to switch off (tooling, `composition/motion.md` §10.2) |
| 22 | **Two speed limits.** `video/docs/PIPELINE_V2.md` "Frame rate": ~15 px/f; code: `MOTION.camera.peakPxPerFrame` 18 and `video/scripts/camspeed.py`'s --limit 18 | PIPELINE_V2 | ~15 px/f (Part 0b §3); the code to follow (tooling) |
| 23 | **The built-in wipers.** Film's default foreground-wipe element 'figure' (`video/src/lib/FigureWiper.tsx`) and `lib/cine/wipers.tsx`'s 'passer': strangers' backs at the lens, drawn with outlines | DIRECTION 3, 4 | J8 uses the film's own near mass (element 'scene'), clean pen, no outline; the 'figure' default to change (tooling, `composition/motion.md` §10.1) |
| 24 | **K9's push-through.** `COZY_AND_SCALE.md` K9: one push 0 -> 0.85 in 1.2-2 s; Film's push-through 1.1 s to 7x; Arcane's measured chain of two +7-9 % cuts of 0.8 s, then a moving landing | COZY_AND_SCALE on K9 | J2 names both forms; Film's single push is the engine's |
| 25 | **The reveal ease lives only on the board.** `unveil` is in `video/src/v3/SketchReel.tsx`, not in `lib/cine/camera.tsx`'s CAM or `MOTION.camera`, so a G3 tilt cannot be rebuilt by name at G5 | (a tooling gap) | I5 names `unveil` = trapezoid(0.1, 0.6); add it to the lib (tooling) |
| 26 | **"Exists" in the catalogue's engine field.** E1, E10, E11 and J6 cite `lib/figure`, which draws v6's her, not direction C (`PEOPLE_DESIGN.md` §5.10); the `lib/cine` drawing pieces (towers, monuments, windows, props) are references only (DIRECTION's Retired list; `CRAFT.md` §c) | PEOPLE_DESIGN, DIRECTION | for a film these count as "partly": each film draws its own (the fit judge's note) |
| 27 | **The first library's verdicts.** `composition/reels.md` §4 and this page's first version (24 used, 17 adapted, 0 rejected) against this ranking (12 RARE, A4 and D3 NOT FOR US) | this page (it supersedes its own first version and its research notes) | the tiers stand; the owner's override decides (Part 0.1) |
| 28 | **The picture's lead on its word.** DIRECTION 8: "visuals lead their word by ~0.1 s"; `composition/attention.md` §9.2: 0.1-0.3 s | DIRECTION | ~0.1 s (6 f), never more than 0.3 s, never after (rule 15) |

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
