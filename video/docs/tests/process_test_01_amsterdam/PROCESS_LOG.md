# Process log: process test 01 (Amsterdam), one section per step

## Step 1: the core line and the moment (`CORE.md`), 2026-10-31

**What I did:** read the news (WebFetch cannot resolve capgemini.com here; curl through the proxy worked), ran two
searches for a source that is not the vendor's (none found), and wrote `CORE.md`: the facts in the source's own words,
what we must not claim, the core line (with two options), the concept ("The canal remembers": the canal's reflection
holds the city's paper twin, which lights up and answers when asked) and the hook's frame with its caption.

**Docs I opened (about 12k words in all):** CLAUDE.md, all (auto-loaded). The test README, all. PIPELINE_V2.md, lines
1-157 (THE LOOP NOW, THE FRAME LOOP, the two modes, the G0-G8 table): about 4.3k of its 10k words. OWNER_PLAYBOOK.md,
the three rules, audience, script and voice, hook and pacing, taste signals: about 3.7k of 8k. FRAME_CARD.md, all (0.7k).
DESIGN_LANGUAGE.md, the first two thirds (0.7k of 1k). DIRECTION.md, the intro only (0.6k of 5.7k). HANDOFF.md, the top,
§0 and §1 (1.2k of 8.4k). CREATIVE_BRIEF.md, the banner, §1-10 and §18-19 (0.6k of 2.8k). LAYOUT.md, one row (the caption
block) found by grep (0.2k of 8.6k); TYPE_GUIDE.md, grep hits only.

**What helped:**
- CLAUDE.md's "The story and the voice", with the playbook's "Hook and pacing" and "Taste signals", gave almost all a
  core line needs: what it drives (frame 0, the hook, the cover, the payoff), exaggerating is fine if the core event is
  real, never a commercial, one impossible object in frame 0.
- The playbook's niche rule names this very kind of story ("a city bringing its history to life with AI"), so the fit
  took one sentence.
- FRAME_CARD §1 (what happens, what they feel, what they understand) was exactly the shape the moment needed.
- The best single tool for finding the line was CREATIVE_BRIEF §9 ("After watching this video, people will understand
  that ___, and that matters because ___"). Nothing in CLAUDE.md points to it; I found it only through HANDOFF.
- LAYOUT's caption row: 2-4 words a group, so the still carries one group of the line, never the whole line.

**What got in the way, was unclear or contradicted itself:**
- The README I read at the start still listed "script, beats with their feelings"; it was updated to the owner's "no
  script" a few minutes into my step. The computed task already had the owner's words, so no harm done.
- PIPELINE_V2's beats step says "no pictures, no staging, no camera: nothing that restricts the ideas", yet this step
  asks for the film's central device and what happens in the hook frame. I gave the event and the device and left the
  picture (camera, composition, light) to the ideas step. Who owns the concept is unclear too: THE LOOP NOW gives the
  vision note to "one art director", but here the story step writes the concept.
- The only source is the vendor's marketing. The fact lock wants every fact "checked against its primary source"; no
  doc says what to do when the only source is PR. I quoted its words and wrote down its limits.
- Contradictions: the playbook says "Exaggerating, generalizing and making it bigger are fine", CREATIVE_BRIEF §4-8
  says "Never invent or exaggerate consequences", and the playbook's hook rule asks for a "TRUE claim". Freshness is
  "about the last month" in the playbook and "24-72 h" in the brief (this news is about 10 months old). The source says
  both "750 years" and "over five centuries".
- "The payoff in words within about 2 s" pulls against a core line that carries the WOW number: an 11-word line lands
  its payoff near 3 s. No doc says which wins.
- A story about old handwriting meets two hard rules, "words in the picture few and big" and "no ink lines in the
  build". Nothing says whether handwriting as a texture, or ink as the subject, counts. I flagged both for the builder.
- HANDOFF says "Read in this order (about 30-45 minutes of reading)" across eight docs and old state summaries;
  CLAUDE.md says never pre-load it all. I followed CLAUDE.md. A new agent that obeys HANDOFF reads about 40k words
  before it starts.
- The caption row in LAYOUT is one 215-word line of pixel values; I needed one fact from it.
- Template pull: the G0-G1 rows push a heavy fixed format (the through-line card with its carriers A-F, a sync plan,
  `check_clarity.py`, a cold viewer panel). I used none of it for a still. The "Did you know" opener nudges every line
  into one shape; I weighed it and left it for the spoken hook.

**What I decided without guidance:**
- Which number leads: 50 km (three times in the source, consistent) over "750 years" (the source contradicts itself).
- That the hook may say the papers "answer" when about 2 % is read, with the 2 % as the honest last turn; it also gives
  the ending its feeling (the city has barely started talking).
- The caption group on the still ("now answer your questions"), so the picture alone must say "old papers".
- A made-up "you" (a resident) instead of a real person: the taste signal "one real person in their own words" is met
  by the archivist's real words seeding the light idea, not by the core line.
- I wrote `CORE.md` once, after about 25 minutes of reading, not "from the first step" as the task asked.

**One change I would make:** give PIPELINE_V2 a one-page "From a piece of news" start used by both modes: the source
(and what to do when it is only PR), the facts with what we must not claim, the core line found with the brief's "people
will understand that ___, because ___" test, the film concept, and the hero moment in FRAME_CARD §1's words; plus one
line on which rule wins when the 2 s payoff, a WOW number and the TRUE-claim rule pull apart. Today the only road to a
core line runs through the G0-G1 table, which an iteration skips without saying what replaces it.

## Step 2: the ideas, the vision note and the pick (`VISION.md`, `IDEAS.md`, `ideas_sheet.png`), 2026-10-31

**What I did:** as the art director, wrote the vision note (the concept, world, arc, thread and look in words), then
imagined three whole-frame ideas for the moment before opening the composition library: 1 THE PAPER HALF (from a boat:
the bridge and its paper reflection close into one glowing ring, the light climbing to her), 2 HER QUESTION LANDS (over
her shoulder: rings of light across the twin), 3 COME TO LIGHT (low: pages lifting out of the canal to her). I drew
them as grey value thumbnails with one gold accent from one small 3D sketch of the canal (`ideas_sheet.py`, so all
three are views of one world), redrew twice until each sketch was fair to its idea, judged them at phone size and at
a squint, and picked 1 by the feeling it gives. Only then did I check it against the library.

**Docs I opened (about 17k words in all):** CLAUDE.md, all (auto-loaded). This test's CORE, README and log, all (2.1k).
FRAME_CARD, all (0.7k). DESIGN_LANGUAGE, all (1k). PIPELINE_V2, THE LOOP NOW through the two modes (lines 29-128: 2.2k
of 10k). OWNER_PLAYBOOK, the three rules and "loose and imaginative", then Visual style through Motion (4.5k of 8k).
DIRECTION, the intro plus the Pip rule found by grep (0.9k of 5.7k). LAYOUT, the §1 zones table only (1.3k of 8.6k).
PEOPLE_DESIGN, its top (0.8k). PALETTE, the house family (1.2k). CRAFT, grep hits for dusk (a few lines).
COMPOSITION_SHOTS, after the pick: its intro and the §0.3a-§0.3 frame tiers (3.5k of 19k).

**What helped:**
- CORE's moment (what happens, felt, understood, the caption, two traps, the picture left open) was a near-perfect
  brief for this step.
- FRAME_CARD's order (feeling first, then the idea, the eye, and the library only after) is right. §11's "name the
  feeling in three words at phone size" was my actual pick tool. It gave "a hushed, glowing doorway" / "quiet, personal,
  dim" / "a joyful lift, flying letters" against the moment's "hushed whoa". The squint showed one place to look in 1
  only.
- The playbook's visual rules (one story light, a person's viewpoint, people small and simple, big quiet areas and one
  place to look) gave the world and the light without dictating a picture.
- Read late, the library did add three real fixes: one lamp, not a matched pair (D3/D4); a near hint (our boat's
  bow); and a reason to keep the far vista open (E7, rejected on purpose).
- Redrawing until each sketch was fair mattered. My first sketches made 1's climbing light an Eiffel-tower lattice
  (the wrong city) and its twin icicles. Judged then, 3 might have won on drawing quality, not on the idea.

**What got in the way, was unclear or contradicted itself:**
- PIPELINE_V2 ("Our recipes are the toolbox") says the ideas are "composed with COMPOSITION_SHOTS.md ... one lead device
  per frame named by its code". FRAME_CARD §4 and the playbook say imagine first and consult after. The two orders
  contradict; I followed the card.
- The library is a template even when read late. Its rows are placements and numbers ("one opening 15-30 % of the frame
  on the axis", "a 150-300 px figure", the golden box in pixels), which goes against the owner's "never a number as a
  target". It is 19k words, with its feelings index ("By emotion") buried at line 433.
- Past-film pull: the library's running example is "Scene 1 = v2's canal opening ... on an October dusk ... her
  silhouette", and PALETTE offers "Canal Mint: v2's restart, an evening outdoors by water". This film is also a canal
  at dusk with "her", so a new agent is pointed straight at a past film of ours. I did not open v2.
- The strongest template pull came from LAYOUT §1's caption band, "outdoors the one sky", flat across x 95-945. In 9:16
  it forces every outdoor frame into sky on top, a stage in the middle and dark below. Idea 2's view down the canal
  could not keep its rooflines out of the band without cheating the perspective, and that counted against it. The hard
  constraint lives in the densest table in the repo.
- DIRECTION rule 6 says "the caption band stays light"; LAYOUT/TYPE_GUIDE say "Gaegu 300 on dusk and night, warm white
  on dark". A dusk film can't have both; I used a mid dusk sky with warm white words.
- PEOPLE_DESIGN's top has two "IN USE FOR NOW" blocks (open eyes and hair v4; direction C with the closed-eye LASH
  face). I took the newer one.
- The playbook says "literal beats clever, never a metaphor that needs explaining", yet also "one impossible object in
  frame 0", and the concept is a paper twin. Likewise "near a person at a real size" vs "people small and simple" (my
  pick has her small, on the bridge). No doc reconciles either pair; I judged by "reads in a second".
- "Grey with one accent" hides this story's key read. Paper vs brick is mostly a COLOUR difference (cream vs dusk
  blue), so the values-only thumbnail understates idea 1's paper. The paper read stays its main risk for the build.
- The task makes me the art director, but the concept was already written at the story step. I kept it and wrote the
  vision around it; who owns the concept is split, as step 1 also noted.

**What I decided without guidance:**
- What "three different ideas" means: three picture devices at three camera heights, all inside the given concept,
  not three concepts.
- How to weigh the feeling against CORE's "the picture alone must say old papers". Idea 3 read "old papers" best; I
  picked 1 on the feeling and carried 3's lesson (the paper must read where the light leaves the water) into the build
  notes as the concept's own wake. I took that to be allowed under "never a collage", which no doc settles.
- A boat as "a person's viewpoint": the ring only exists from near the water.
- The palette direction in words only (Autumn Ember's family, pushed to dusk). PALETTE gives the pick to W1; THE LOOP NOW
  gives the world to the art director.
- The sketch method: a tiny 3D world rather than freehand values. Honest geometry, but it took about a third of my
  time, with three redraws.

**One change I would make:** give the ideas step its own half-page card, in FRAME_CARD or PIPELINE_V2. It would say:
three ideas means three different picture devices inside the one concept; the thumbnails allow the scene's one key
colour contrast, not grey only; each is judged at phone size and at a squint by the three words it gives; the pick is
by feeling, naming what the losers teach; and only then the library, starting from its "By emotion" table. Also delete
THE LOOP NOW's "composed with COMPOSITION_SHOTS.md ... one lead device per frame named by its code", so the order is the
card's everywhere.

## Step 3: the hero frame built whole (`CARD.md`, `hero_r1.png`, code `video/src/look/test01_s1/`), 2026-10-31

**What I did:** resumed a half-built step. The stopped run had already written `CARD.md` and part of the scene (the set's
design and the painter, unlit pieces; no light bake, no composer, no entry), all committed, while the README says the
build did not run. I kept the card (complete, feeling first) and the code, judged the unlit pieces (spiky gables, a
striped twin, stray grey discs) and reworked from there, following v8_s1's bake: set -> paint -> parts -> light solve ->
engine. I wrote the light bake (`light_t01.py`: one story light, the waking pages, the stream and the phone, plus the
blue hour, the afterglow's rims, the lamp and the windows a step under it, the twin waking round the source, air,
bloom, the paper), the composer, the entry, a one-group R4 caption file and `bake/run.sh`. Six render rounds, each
judged at phone width by the feeling first: (1) her pose sheet: the stopped run's pose stood upright with an arm at her
face, because a lean toward the camera is invisible from the front; a three-quarter lean reads; (2) the set: real gable
types with their stone trims, leafy elms (as balls they hid the street), a smaller bow; (3) the first lit target: the
twin far too bright, a black void under the source, the bow orange; (4) the whole frame: calm and pretty, but nothing
said "the reflection is paper", and the stream read as lightning; (5) the ring's lower half as a ragged shelf of
ledgers, the stone above cooler, a parchment of written pages as the twin's ground, a gentler stream: the double take
arrived at phone size; (6) polish: the vault lit like a lantern in a cave, the band flattened, half the windows found.
Checks: capcheck --words passes (5.5-6.8:1); the band is one calm field (dL* 0.77); check_banding still FAILs on the
painted wisps and stroke edges (verified on the painted sky alone: the steps sit exactly on the four wisps).
`npm run typecheck` passes. My part took about an hour of wall time; one bake round about 3 minutes.

**Docs I opened (about 22k words, plus code):** CLAUDE.md, all (auto-loaded). This test's README, CORE, VISION, IDEAS,
the stopped run's CARD and the log, all (6.5k). FRAME_CARD, all (0.7k). DESIGN_LANGUAGE, all (1k). PIPELINE_V2, THE LOOP
NOW through the two modes (2.3k of 10k) and its heading list. OWNER_PLAYBOOK, the three rules and Visual style (4k of
8k). PEOPLE_DESIGN, its top (1.3k of 8k). LAYOUT, the §1 table (1.3k of 8.6k). TYPE_GUIDE, §b and R4 (1.1k of 7.7k).
`src/lib/captions2/README.md` (0.9k). bodies_v4 NOTES, the top (0.5k), and its poses still. The docstrings of
check_banding.py and capcheck.py (0.9k). v8's delivered still, once, to see what the engine makes. Code: v8_s1 (run.sh,
entry, scene, context, rig, most of light_v8), the stopped run's set and painter (all), skel5's pose model, the cast,
light2's live layers, solve/texture, Pip's props, captions2's types. Never opened: DIRECTION, COMPOSITION_SHOTS,
PAINT_RECIPES, ORGANIC, light.md, PALETTE, CRAFT, HANDOFF, LIFE_AND_DENSITY, COZY_AND_SCALE, CINEMATIC_GUIDE, refs_*.

**What helped:**
- The card, VISION's "look in words" and IDEAS' "for the builder" (the ring is the one big shape, the light's source in
  it, the paper must read at phone size, the evaluator's test sentence) were a complete brief: I never needed a look
  guide's recipe to know what the frame should feel like.
- v8_s1's pattern is a real production path: the light solve lands the browser's composite on the Python target (max
  error under 1 code), so the light is designed in one place and stays per plane for a later float.
- captions2 made the caption a 20-line JSON (R4: "now / answer / your questions", the honey lit word); capcheck --words
  gave a per-word verdict.
- Judging the phone-size image after every round: it showed at once what full size hid (the missing "paper" read, the
  stream reading as lightning, the orange bow).
- A pose sheet (five variants side by side) picked her pose in one render.

**What got in the way, was unclear or contradicted itself:**
- Resuming: nothing says how to pick up a step stopped mid-build (keep its code or restart?), and the README's "the build
  did not run" was wrong.
- "Start from v8_s1" (the task) against "no film of ours is ever the bar or the example": nothing separates reusing a
  past scene's CODE (fine) from looking at its picture. I used the code and looked at its still once.
- The people in use: PEOPLE_DESIGN has two "IN USE" blocks and a FLOW study, and the playbook's people rule was already
  rewritten for FLOW ("simpler, flowier"), which is not built. The v4 people I used no longer match the playbook's rule.
- The people engine had no pose for this moment (its "lean" is back to the rail) and nothing says its figures read best
  in three-quarter or profile; I authored the pose by trial on a sheet.
- LAYOUT's §1 rows "a standing figure 300-650 px tall" and "the subject 270-460 px wide" contradict the card and the
  playbook ("people small and simple"); she is about 125 px. I treated them as examples. The playbook still says "the
  caption band stays light", which a dusk film cannot keep (TYPE_GUIDE's dark tone resolves it; the playbook does not).
- check_banding FAILs any painted sky (it reads wisps and soft strokes as steps) and no doc says how to read it there;
  its band budget did catch a real flaw (the afterglow lifting the band 4.2 L*).
- Two undocumented traps in the bake cost a round each: the set draws faces far-first by each face's MEAN depth, so a
  window deeper than its wall's centre is painted over (half the lit windows and the houseboat's window were missing);
  the sky recipe's layers hold OKLab, so my RGB edit turned the sky grey. My eye caught the second, no check did.
- The real difficulty was not in any doc: CORE asks that "the picture alone must say old papers", the ideas sheet (grey
  values) could not test it (step 2 predicted this), and the card named the paper in words only. The read arrived in
  round 5, from build-time inventions: the ragged book shelf, the cooler stone, the parchment ground.
- Template pull: small. v8's rig names (sky up, east, west, sun) pulled me toward a sun-and-sky rig; this story light
  is a point source below, so its light falls off and rises instead.

**What I decided without guidance:** to keep and rework the stopped run's code; her three-quarter lean (yaw -56, one
forearm on the rail, the near arm out with the phone, her hand drawn in front of the iron); the twin's ground as
parchment (the twin of the sky); the ring of books (spines and page-blocks, ragged, muted leather) and the cooler stone;
the water clearing to paper round the source; Pip on the bridge's coping (LAYOUT forbids the right rail, where the
houseboat is); no near elms (the sky stays one field); flattening the band; accepting the banding FAIL on painted wisps
after locating every strong step on them.

**One change I would make:** when a concept rests on a MATERIAL read (here paper against stone, in the water), make the
ideas step prove it in colour at phone size: one small colour key of the focal area in the frame's light, and the card's
§2 naming what makes the material read (for this frame: books of different lengths, cream page-blocks, a parchment
ground, the stone kept cool). It would have saved three of the six build rounds, and it is where the "whoa" lives.

## Step 4: THE FRAME LOOP, the fresh evaluation of `hero_r1.png` (`EVAL_r1.md`, `EVAL_r1_paintover.jpg`), 2026-10-31

**What I did:** looked at the frame before reading anything (full size, a 390 px wide copy, crops of her, the ring,
the quays, the bow, the words) and wrote the first line and a picture-only section: "a hushed, cosy dusk wonder ... a
secret found, not surprise and not news". Then read CORE, VISION and CARD, compared, answered the four questions and
the card's, took four measurements, each to explain something my eye had already found (the black lower third, the
warm brick far from the light, her size and the stream's width, the aliasing's block size), looked at two of the
owner's references beside it, and made a rough paint-over. **Verdict: ALMOST**, seven notes, each with what, why and
the fix. Roughly half an hour of wall time.

**Docs I opened (about 11k words):** CLAUDE.md, all (auto-loaded). The test README, CORE, VISION and CARD, all (4k).
PIPELINE_V2, THE LOOP NOW, A RICH BEAUTIFUL WORLD and THE FRAME LOOP (about 2k of 10k) and its heading list.
FRAME_CARD, all (0.7k). LAYOUT, its intro and the §1 table (about 2k of 8.6k), for the band, the bars and to learn what
the lavender blob was (Pip). OWNER_PLAYBOOK, the three rules (about 1.4k of 8k) and its headings. DESIGN_LANGUAGE, its
headings only. `ideas_sheet.png`, once, to see the picked thumbnail. Two references (`refs_paint/01_beach_van_dusk.jpg`,
`refs_human_scale/02_bus_stop_night.jpg`) and the refs folder listings. This log's step 3, only after my verdict, to
match its format. Never opened: IDEAS.md, DIRECTION, COMPOSITION_SHOTS, PAINT_RECIPES, ORGANIC, PALETTE, TYPE_GUIDE,
PEOPLE_DESIGN, the code.

**What helped:**
- The order "look first, write the feeling line, then read the brief" made the evaluation. I felt "a secret found" and
  only then read that the frame meant "a whoa: the reflection is paper, and it is answering her"; the distance between
  the two lines is the verdict. Had I read CARD first, its §11 (the builder's own read, "it matches §1") would have
  told me what to see.
- CARD §1 (the feeling in words) and §4 (the planned eye path): comparing the planned path (glow, up the stream to
  her lit face, the ring, the words) with the built one (glow, the words, her) was the single most useful comparison.
- "Measurements only explain a gap the eye found" kept the numbers few and each one tied to a thing seen.
- The owner's references beside the frame turned "final production quality" from a phrase into two concrete gaps
  (their small figures sit inside the light; their foregrounds are painted and alive).

**What got in the way, was unclear or contradicted itself:**
- The task said an ALMOST lists what holds it back; PIPELINE_V2 and the playbook say an ALMOST "comes back as a
  paint-over, never as new rules". I did both. Nothing says who paints it, how rough it may be, or with what: an
  evaluator's overlays can show values and colours (the water's sheen, the lifted twin, her gold) but not drawing (the
  hanging paper gables, the curl of old paper), so notes 2 and 4 rest on words.
- Where ALMOST ends and NOT THERE begins is drawn on "the feeling", but this card's feeling has two layers: a register
  (hushed, warm, never ghostly) that the frame gives, and a part that only the idea delivers (the whoa, "answering
  her") that it does not. Nothing says which decides. I decided: the register is there and the same idea, staging and
  device can deliver the rest, so ALMOST, not a new approach.
- The builder's self-read (CARD "§11, again") sits inside the card the evaluator must read, with its verdict and
  numbers. I was protected only by the task's order.
- "Beside the hero frame (once it exists) and the owner's references": for the hero frame itself there is no hero,
  and nothing says which of the five reference folders (about twenty files) fit a given frame; I picked two dusk and
  night ones by their names.
- Pip is in no doc an evaluator is pointed to (not CLAUDE.md, the card or VISION); the blue blob was a mystery until
  LAYOUT §1, a dense table I read about 2k words of for two facts and one name.
- A still out of its film: the caption is the last group of a sentence, so alone it reads as an order ("now answer
  your questions!"), and the frame's whoa depends on the frame before it (an ordinary bridge). THE FRAME LOOP asks to
  judge in the board; this test has no board.
- Template pull: the eleven card sections plus the four questions plus the craft overlap; following them all made the
  report longer (about 2k words) than the verdict needs. Nothing pushed me toward a picture template.

**What I decided without guidance:** the ALMOST/NOT THERE line (above); making the paint-over and its form (r1 marked
up beside a rough paint-over, both also at phone width, the notes numbered on both); which references to look at;
which four things to measure; putting the caption-as-an-order and the cover in a note for the orchestrator, not in
the frame's notes.

**One change I would make:** a cold read inside the build, before the builder calls a frame built. One fresh agent
that has never seen the brief gets only the phone-size frame and answers in two lines: what is happening, and what it
feels like; the builder compares that with card §1 and keeps going until they match. It is the same test as THE FRAME
LOOP's first line, moved earlier and costing a few lines. Here it would have caught, during the build, the two things
the builder could not un-know: the ring's lower half reads as a well, not a reflection, and she does not read as the
one being answered.
