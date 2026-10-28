# v3 rework assembly: independent review R1 (story, joins and attention), 2026-10-28

Reviewing the integrator's full render (`film_full.mp4`, 2469 frames, code at be03dfa; report `assembly_integrate.md`)
against the owner's words (playbook, v3/OWNER_NOTES), DIRECTION, CRAFT §a-§b/§e and flow_v2. Lens: one flowing story,
every join carrying something, one subject at a time, the support subtle but alive, the hook, the payoff and the loop.
Measured per CRAFT §e with the captions masked. Evidence (frames, scripts, numbers):
`/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/R1/`.

Status: IN PROGRESS (written as I go; measures so far below).

## Verdict
(pending)

## Scores
**Joins** (CRAFT §e on `film_full.mp4`, 108 px wide; first with the integrator's mask, y < 0.32 H out; then CRAFT's literal
caption band only, y 290-600 out): J1 0.87 / 0.053 / 12.8 (cap mask 0.85 / 0.053 / 6.5); J2 0.86 / 0.060 / 10.9 (0.84 /
0.046 / 5.1); J3 0.47 / 0.035 / 20.8 (0.45 / 0.091 / 33.3, declared light change); J4 0.58 / 0.092 / 12.4 (0.66 / 0.095 /
9.5); J5 0.99 / 0.020 / 0.8; loop 0.76 / 0.033 / 2.0 (0.80 / 0.073 / 10.7). The integrator's numbers reproduce exactly.
Carriers C C A A C + loop, 0 plain cuts; 6 shots, 6.9 s average. Every join carries (strip checked frame by frame).
**Thread:** on screen 0-19.2 and 22.45-41.15 (92 %), one gap of 3.25 s = the declared reveal. It reacts on every beat
(share of the tag box changing): jolt 15.30 61 %, tug 18.30 62 %, sway 24.44 59 %, tick 30.28 26 %, jolt 35.95 59 %, turn
39.70 24 %; off its beats it is still (only its 2-step tier switches show).
**SQA vs the approved pilot:** <= 0.5 % of pixels differ by > 8 levels at 10 sampled frames (renderer noise); frame 0
shows the first caption page from frame 0 (the loop's roll; the pilot from 0.10 s): fine.
**Per beat** (CRAFT §e at 540 wide, captions and label masked; subject = the beat's A box; salience = its share of the
top-3 %; motion = its share of a 0.5 s burst at 30 fps, ECC-registered; boxes checked on overlays):
- SQA (approved pilot): tap 98 / 85 %, launches 79-82 / 86-89 %, DC 4.04 54 % (window 91 %) / 43-50 %.
- SQB: 6.5-9.7 the card 9-38 % of the salience (the night-window strip x 0-125 24-34 %, skylight + slope string 10-35 %,
  Pip 10-13 %, dim phone 12-22 %), 33-52 % of the motion; card local contrast 4.6 vs the strip's 4.8 at 8.0 (subject /
  environment 1.6, target >= 2); from 10.1 (doodles) 57-78 % / 54-69 %; +9.7 % 60 / 70 %; tag jolt 83 / 56 %.
- SQC: phone rise 100 / 60 %; stick lift 65-100 / 56-74 % (the stick alone on "chips").
- SQD: stick 90-100 % at 19.55-20.05; pile 83 % at 20.55; DC 93 % at 21.15 (on "centers. By the"), mountain 68-70 % at
  21.5-21.95 (on "mountain"). The DC enters ~1 s after its word "AI" (19.96): flow_v2 §4 accepts it (the S5 move).
- SQE: gate 27 % / 49 % at 23.2; tag sway 72 %; van into the pool 31 / 63 %; the crate 26 / 67 %; notice 5x 44 / 45 %;
  van to the kerb 32 / 61 %; hop 76 / 72 %; tick 83 / 52 %; BETTER van 9 / 49 % (31.45) and 30 / 33 % (32.3); notice 2027
  51 / 51 %; overtake 24 % (the 2027 notice 50 %) / 86 %; jolt 69 %. Competitors at every queue beat: the factory wall's
  snow cap (25-27 % of the top-3 % within 7 px of it), the gate's lit yard 11-25 %, the mountain 10-15 %; the workers'
  loading loop 13-27 % of the motion.
- SQF: DC sign 48-52 % / 9-33 % (the tag's same-frame step-down 39 % of 36.95-37.45); payoff hold 74 / 46 %; turn 38 /
  90 %.
- Noticeable supporting movers (box > 0.3 %, outside the subject): SQB 2-7, SQE 1-7, SQF 0-7; most are slow snow fields
  and exhaust under 4 % of the motion each; the ones that compete are SQB's strip and skylight snow and SQE's workers.
- Stillness (share of frames with < 0.05 % of pixels changing > 12 levels): hook 3 % (longest 0.03 s: never still);
  SQB 13 %, SQE 15 %, SQF 25 % with the film's one long still run, 37.05-38.12 (1.08 s), on "an AI data center".

## Findings (most severe first; no blockers)
- **R1-1 major (window). SQE 25.70-33.50, the street band (the queue: "what's left costs about five times ... Normally
  you'd wait for the better one").** Owner: "too many moving parts and I'm not sure what to keep my attention on"; "the
  main arc going where the attention should be". Measured: the beat's subject holds 9-32 % of the top-3 % salience
  (van into the pool 31 %, the crate 26 %, van to the kerb 32 %, BETTER van 9 % at 31.45 and 30 % at 32.3; the notice 44 %
  at 27.10 and 51 % at 34.60); the band y 940-976 (the factory wall's snow cap, `STREET_CAP` L* 86 on `WALL_BRICK` L* 51,
  with the town's snow behind it: dL* ~35 along ~840 px in the pushed frame) holds 17-29 % of the top-3 % at every queue
  beat, the gate's lit yard 4-11 %, the far field 3-16 %. outside.tsx's own note says the cap "never holds the frame's
  top salience". **Fix:** `outside.tsx` `OutsideStreet`: the factory wall one value lighter toward the street's ambient
  (`WALL_BRICK` L* 51 -> ~63, flow_v2 §3's "soft warm brick", chroma kept) so its cap and the gate's lit yard sit <= ~20
  L* over it (CRAFT §c, tier C); target: the wall band <= 10 % of the top-3 % and each queue beat's subject >= 60 %.
- **R1-2 major (home). SQB 6.45-10.0, the left edge and the slope ("Which is backwards. Laptops get better for the same
  money.": inside the first 10 s).** Owner: "not sure what to keep my attention on"; the support "a bit more subtle but
  yet alive". Measured: until the doodles land (10.1) the card holds 9-38 % of the top-3 % salience: the night-window
  strip (screen x 0-125) 24-34 %, the skylight and slope string 10-35 %, Pip 10-13 %, the dim phone 12-22 %; the line's
  draw holds 33-52 % of the motion (target >= 60 %) with 2-7 noticeable supporting movers; at 8.0 the card's local
  contrast is 4.6 against the strip's 4.8 (subject / environment 1.6, target >= 2). 60-70 % of the strip's share sits on
  the Nook's mullion column (screen x 40-80: the trim bar and its near-black latch, `EMBER.anchor`) and the horizon row
  (y 900-1000). From 10.1 the card holds 57-78 %. **Fix:** `home_set.tsx` (the home set's owner), inside the 6.35
  window calm (`windowCalm`, so SQA stays the pilot): the mullion and latch (`NOOK.mullionX` +-7 over the glass) and the
  strip's horizon houses one more calm step (the kit `Haze` toward the glass's dusk, no near-black latch), so the strip
  holds <= 10 % of the top-3 % and the line's draw >= 60 % of the motion from 7.08 ("Laptops").
- **R1-3 major (reveal). SQD 19.50-20.60, the summit close-up ("And so do AI data centers.").** Owner: "There is no
  story"; playbook: every shot reads instantly with the sound off, recognisable things. Measured: THE stick holds
  90-100 % of the salience (the eye is right), but its neighbours read as wooden pallets, then a brick wall: 44-65 dark
  slots per frame (chips L* 50 in boards L* 70, 14-36 % of the pile's rows), no visible pin strip (the crest's pins
  `#D3B58B` sit ~5 L* over the board), many crest sticks tilted; so flow_v2 §5's read "one of a mountain of sticks" fails
  at phone size on the very line that names them. **Fix:** `SQD_peak.tsx` `RevealPeak`, the crest band while a stick is
  >= 120 px on screen: each crest stick shows the kit stick's pin comb (light pins with dark gaps, as THE stick's L* 92)
  and lies level (flow_v2 §4 "kit-shaped MemorySticks"; kit README `Pile`: "every stick shows its chips and lies mostly
  level"), so each neighbour reads as a memory stick.
- **R1-4 major (window). SQF 36.98-38.12, the horizon ("So that's how an AI data center": the payoff's rhyme of the
  hook's 4.04 beat).** Owner: "the main arc going where the attention should be"; G5: "way too empty" (no dead frames).
  Measured: after the sign's 2-step (36.98 / 37.03), 37.05-38.12 is the film's longest near-still run (1.08 s: < 0.05 % of
  the frame changes > 12 levels per frame); the per-syllable rows step 370-515 px each (the hook's twin rows at
  4.38-4.88: 1,100-1,300 px); the DC holds 48-52 % of the top-3 % salience (the trucks' white "AI" panels 16-17 %, the
  corner house 8 %) and 9-33 % of the motion (the tag's same-frame step-down takes 39 % of 36.95-37.45; then the far
  walker and the steam lead). **Fix:** `outside.tsx` the hall's `rowsOn` (`HALL_ROWS`, SQF's beat): each syllable's row
  lights as a band at least the hook's size (the soft bands 2-3x taller, lit to the sign's value: >= ~1,200 px per step),
  so on "an AI data center" the DC alone moves and holds >= 60 % of the salience and the motion.
- **R1-5 minor (window). SQE 25.60-32.90, the gate's mouth.** Owner: "too many moving parts". Measured: the two workers
  load truck B on a 2.6 s loop (`workersAt`: aGo + 1.3 -> bGo - 0.6) straight through five beats; at 32.30 ("for the
  better one") they take 27 % of the motion against the BETTER van's 33 %, 18 % at 31.45, 13 % at 28.62; CRAFT §b: one
  mover leads, supporting movers take turns. **Fix:** `outside.tsx` `workersAt`: load B only between the queue's beats
  (26.30-29.10), idle at the gate's mouth through the van's pull-up and hop (29.20-30.30) and the BETTER van
  (31.40-32.84), as they already idle through the sign.
- **R1-6 minor (window). SQF 40.55-41.05, the payoff tag (the loop's turn).** Owner: "There is no story"; playbook: end
  close to the payoff. Measured: after the voice ends (40.55) the tag turns from its "AI" back to a full-colour front
  reading "$999" (legible ~40.72-41.05) under "next laptop's price tag.": the last coloured price is the old one ($1,099
  -> AI -> $999). **Fix:** `SQF.tsx` the loop's `tagProps`: drop `ticker: [{t: -99, v: '$999'}], old: undefined` (keep
  the struck $999 / $1,099) so the front shows the payoff price until `EraseDown` takes the colour off onto SQA's
  frame-0 lines, which carry "$999".
- **R1-7 minor (thread). Sound on: SQF 36.98, the payoff's data-center beat.** Owner (playbook): "more sound effects";
  SFX land on visual hits. Measured: the hook's twin beat lands with `v3_thoom` (4.04); the payoff's rhyme is silent, and
  after 21.72 the only cues are the ding (30.28) and the like-pop (39.88). **Fix:** `Film3.tsx` `film3Sfx` (the board's
  list): add `{src: 'v3/v3_thoom.wav', t: 36.98, gain: 0.5}` so the rhyme lands in sound as the hook did.
