# Palette direction: soft and warm, with a few contrasting details (owner, 2026-10-25)

**The owner's words:** "One of the core rules is let's play with the colour palettes. I really like the colour palette we
have now: very soft, nice, warm, no screaming colours. Love it. Perhaps we can play a bit more with it. These are the
colour palettes I find visually appealing. See, the background is very similar to ours, which is great, and there are
still soft colours, but some details have a bit more contrast to them."

**References:** `palette_refs/1.webp` to `5.webp`. These are editorial flat illustrations: a WSJ giant in a blue suit,
a woman with a croissant and a dog, a couple wrapped in fairy lights, an autumn dog walk, and a couple in confetti.
`palette_refs/swatches.png` shows the measured colours (k-means, k=10; swatch width = share of the image) next to our v1
theme and the proposed direction.

## What the references do (measured)

| | Background | Hero colour (one per image) | Dark anchor | Small pops | Soft secondaries |
|---|---|---|---|---|---|
| 1 WSJ | `#F4E9DF` 74 % | cobalt `#509EFB` 10 % | `#362D28` <1 % | coral `#EA8056` | olive `#BEA226` 8 %, sand `#E7D7B7` |
| 2 croissant | `#F3E9E1` 78 % | periwinkle `#7C8AFD` 7 % | `#2A2628` <1 % | orange `#EC940E` | pink `#EEB5D7` 5 %, sand `#DECBBA` |
| 3 lights | `#F3E9E1` 78 % | coral-red `#FA582F` 6 % | aubergine `#34244A` 6 % | orange `#FA9306` 2 % | periwinkle `#6A70F7` 4 % |
| 4 autumn | `#F3E9E1` 82 % | burnt orange `#D05D38` 6 % | `#211E1E` <1 % | orange `#FA9204` 3 % | olive `#AC933A`, sand `#DDC8B4` |
| 5 confetti | `#F3E8E0` 51 % (+ pink wash 32 %) | periwinkle `#6872F9` 4 % | aubergine `#37274F` 5 % | orange `#F79411` 1 % | pink `#FCB4E2` |

**Takeaways:**

1. **The same warm off-white background** (`#F3E9E1`) fills 50-80 % of every frame. It's close to our cream (`#F3E0CB`).
   It's mostly empty: generous negative space around one subject (editorial stills; our films stay full, so our 50-80 %
   is many soft fills made of things, never one empty slab: `LIFE_AND_DENSITY.md` §0, `COZY_AND_SCALE.md` 3b.6).
2. **The contrast comes from a few details, not from more colours:**
   - one saturated **hero** colour per image covers 5-15 % of the frame, usually on the subject's clothes. It is often a
     cool cobalt or periwinkle against the warm base (blue against orange: complementary);
   - one **deep dark anchor** covers about 5 %: aubergine/navy (`#34244A`) instead of black, on hair, trousers and shoes;
   - **tiny hot pops** cover 1-3 %: orange `#FA9306`, coral `#FA582F` (a croissant, fairy lights, leaves, confetti).
3. **Everything else stays soft:** sand, olive, pink, low-saturation mids (we keep the softness, never their olive or
   sand: playbook "Warm, never sickly").
4. **Texture:** a fine stipple/halftone grain on the fills, which keeps saturated colours soft.
5. **Lines:** thin, and only for interior details (folds, fingers, faces), not full outlines.
6. **Secondary elements as line-only drawings:** in ref 1 the house and trees are single-colour olive line art, so the
   subject is the only solid mass.

(5-6 describe the references; ours, `CRAFT.md` §c: no outlines on any tier since 2026-10-29, edges from light and
shade, thin lines only on things that are lines.)

## The house palette family: tools, not a cage (owner, 2026-10-25)

**The owner's direction, in three messages:**
- "It's not that we should mix ALL these colours in the same video, then we get a complete mess, but be tactical about it."
- "The idea is to have multiple 'similar-ish' stylistic ones that we can pick and choose for each video, that would all
  have the same general style, but be slightly different and unique."
- "I frankly like our colours too. It's not that we should change it completely, but see if we can make a next
  incremental shift and polish, and ultimately have multiple palettes as tools available for various use cases, but
  not get completely stuck in the given set of colours: expand if needed and where relevant."

**The board** is `palette_family.png`: the same small scene drawn in each palette (8 when it was made; #9 Autumn Ember
came with v3 and #10 Canal Mint with v2's restart, so regenerate it). The data (role → hex) is in
`palettes.json`. Regenerate the board after any change, with
`python3 scripts/look/palette_board.py && node scripts/look/shoot.cjs` (run from `video/`). The Python step also checks
every palette against the DNA below.

**The house DNA** keeps the palettes one family. The numbers are CIE L* (lightness) and C (colourfulness):
- **Background:** soft and light (L* >= 75, C <= 20), never saturated or dark. It fills 50-80 % of the frame.
- **Mids:** soft, from our clay family (cream, peach, terracotta, rose, leaf sage) or the palette's own tints; never
  beige, muddy tan, olive or grey (playbook "Warm, never sickly", v3 G4). Figures are crisp flat shapes and props are
  painted at their plane's dose (ONE painted language since 2026-10-30), all without lines, parted by their lit and
  shade faces (`CRAFT.md` §c). Each scene keeps ONE colour key inside its palette: one strong family (the sky's own),
  one hot accent at the focal, every other colour tone-on-tone in its mass (playbook PROPER LIGHT; `ORGANIC.md` §4.3).
- **Where the values and the colour live** (owner, 2026-10-29: "Go with your suggestions", the city-poster study's
  decision 2; the darks settled anew on 2026-10-30 under his hand-over as the references' low key; numbers `CRAFT.md`
  §f.8): calm lights (the page, the sky with the caption band), the mid-tones carrying the colour, and real darks:
  small darks at the focal (an unlit pane, a doorway, a hull, the subject's silhouette) plus one or two big quiet dark
  masses below the band in the key's shade colour at its value, chroma kept (never black, grey or muddy), never darks
  scattered as confetti or a narrow band of light pastels; a palette carries roles for those darks (unlit panes,
  doorways, an eave shade, as 10b does, and the shade mass's colour: v7's violet-plum quay). The study's chroma numbers
  for it (light fills C* 4-8, mids C* 18-32) are 10b's proposal below.
- **Ink:** dark and warm (L* <= 25), never pure black, for captions and the darkest thin lines; a thin line takes its
  object's own deep shade (`CRAFT.md` §c). At least 7:1 contrast on the background.
- **The references' trick, used tactically:**
  - **one hero** (C >= 30): saturated, on the subject or the story's object, 5-15 % of the frame;
  - **one dark anchor** (L* <= 40): tinted, instead of black; its hue carries the frame's darks: the small darks at the
    focal and the one or two big quiet dark masses below the band, up to ~45 % of the frame under L* 40 (the
    references' low key, decided 2026-10-30 under the owner's hand-over: `CRAFT.md` §f.8; 6-10 % in many small pieces
    from 2026-10-29, about 5 % before);
  - **at most one hot pop** (C >= 50): 1-3 %, only on "look here" (the frame-0 hook detail, a notification, a reveal);
    the sun is never the pop unless it is the shot's "look here": one step off its sky, or behind a ridge (owner,
    2026-10-29: `CRAFT.md` §g.2).
- **Texture and lines:** no outlines, thin lines only on things that are lines (`CRAFT.md` §c); the
  halftone ("Texture and lines" below) is optional, a last-step polish used tactically on a few elements, never everywhere.

**The family:**

| # | Palette | What it is | Use cases |
|---|---|---|---|
| 1 | Mint & Clay (v1) | video 1 as shipped; the reference point | anything; our signature |
| 2 | Mint & Clay 1.1 | **the incremental polish of v1:** same world, a saturated teal hero `#00857F`, a deeper anchor `#203A3B`, a tiny marigold pop `#F9A31B` | a candidate for any story (it was planned as the default from video 2 on; v2 and v3 picked others for their stories) |
| 3 | Cream & Cobalt | our cream as the page, cobalt hero, our orange as the pop | tech, clear explainers |
| 4 | Blush & Pip | blush page, periwinkle hero (Pip's colour), aubergine anchor | human, light, brand moments |
| 5 | Sage Study | sage and oat, lamp light, forest anchor, amber pop | cozy enclosure: home, desk, quiet interiors |
| 6 | Dusk | cool mist, low peach sun, indigo hero, coral pop | serious, night, high stakes |
| 7 | Autumn Ochre | our clay family warmer, burnt-orange hero, a small cool blue pop | read sick on v3's G4 frame ("we need to have a warm feeling, not sick"): use #9 instead |
| 8 | Harbour | a cool, fresh page with a warm coral hero and a deep sea anchor | science, health, the outdoors |
| 9 | Autumn Ember | Autumn Ochre made warm (owner, v3 G4: "much better"): peach-cream page, terracotta-apricot ground, red-brown wood and lines, golden lamp light, burnt-orange hero, blue pop, a saturated dusk blue outside | money, everyday life, cozy interiors at night (v3: `docs/v3/LOOK.md`) |
| 10 | Canal Mint | v2's restart (chosen by its judges, not yet shown to the owner as a palette pick): a flat mint sky `#BCDCCF` over warm stucco `#F4E4D2` and brick, a canal-teal hero `#0B8577`, a plum anchor `#36223A`, a sun-orange pop `#EE6A2E` | an evening outdoors by water, a serious personal story (roles: `src/v2r/palette.ts` `CM`, `docs/v2/STYLE.md` §2); not yet in `palettes.json` or on the board: add it at the next regeneration |

**How to use it:**
- **Each video picks one main palette:** the W1 world bible proposes it (by the story's use case; 2-3 candidates judged
  internally when the topic needs a new look) and writes its light rigs and colour script in its terms; the G4 look
  clip shows it and the owner approves it there (`PIPELINE_V2.md` W1, G4). A sister palette may carry a
  deliberate shift inside the story, for example a Sage Study interior followed by a Dusk exterior for the scale
  reveal, because they share the DNA. Never mix many at once.
- **Within a video, colours keep their jobs:** hero = what the story is about, anchor = weight, pop = "look here".
- **Don't get stuck:**
  - add a colour when the story needs one (a brand colour, a map, a warning sign) and give it a role;
  - make a new palette by copying the closest one, changing the background tint and the hero / anchor / pop, running
    the DNA check, and adding it to `palettes.json` with its mood and use cases.
- The palettes evolve: polish the existing ones with each video's lessons (owner feedback goes in the playbook).

## Proposed by the city-poster study (2026-10-28): proposals, not in `palettes.json`
The study (`docs/studies/2026-10-28_city_posters/STUDY.md` §4) found v2's hues inside the posters' range on every
harmony measure: the gap to their premium feel is value and where the colour lives, not hue (the owner: "I like the
colors of our last video about Google, but our video still feels cheap and lazy"). It proposes three sister palettes in
`palettes.json`'s role format, each passing the DNA check above. None is added to `palettes.json` or the board until
the owner sees it in a look clip (a W1 proposes it, the G4 clip shows it: "How to use it" above); the DNA above stands.

| # | Palette (proposal) | What it is | Use cases | Its JSON |
|---|---|---|---|---|
| 10b | Canal Mint, full range | v2's Canal Mint with the posters' value and chroma plan, every hue within 7 deg of v2's (only L* and C* move): a calmer mint sky (C* 13 -> 10), cream-paper lights (stucco C* 11 -> 6, lit paving 14.5 -> 7, a rose paving shade), colour in the mid-tone brick, water (L* 77 -> 70 / 56) and sage (77 -> 66), slate and plum darks in many small pieces (unlit panes L* 46 -> 33, a new eave shade), a tier-A stone shade at -24; the brick family, hero, anchor, pop, line, ink and caption box unchanged | the next step for the look we have (the study's look clip of v2's canal bank); whether its calm creams are still "the colours of the Google video" is the owner's eye | `pro_4_colour.md` §3.7 |
| 11 | Poster Harbour | a city by water on a clear morning (Singapore, Reykjavik, Cape Town) with Canal Mint's DNA: a pale blue paper sky and the harbour as the one cool field, warm limestone and white walls, facades as confetti, slate windows as the darks, a terracotta-roof hero, a marigold pop | a new place film by water (a W1 candidate) | `style.md` "Sister palettes" |
| 12 | Lantern Paper | old-town warmth (Hanoi, Kyoto, Buenos Aires) without their beige, olive and grey: a warm paper sky, peach-cream stone, pine and leaf-sage greens, rose-grey stone, red-brown wood, a gold hero, a vermilion pop, deep pine as the anchor; the pond the one cool field | a new old-town place film (a W1 candidate) | `style.md` "Sister palettes" |

- **Poster Harbour** breaks one DNA line on purpose: a cool page (L* 87, C* 9) where rule 6 says warm by default; its
  sky is the one cool field, as Canal Mint's mint is. **Lantern Paper**'s page and ground sit just outside the beige band
  and under the olive band: lint their shaded copies on the frame. The same check flags house palettes #1-2's ground
  (yellow-green) and #5 Sage Study's page (olive, h 116) (`style.md`).
- **What goes with 10b, decided by the owner** (2026-10-29: "Go with your suggestions"): its real darks (`CRAFT.md`
  §f.8: then 6-10 % under L* 40 in many pieces; since 2026-10-30 the references' low key, small darks at the focal
  plus one or two big quiet dark masses) and its tier-A shade at -24 (inside `CRAFT.md` §d.3's -20 to -25); its
  sun-orange pop stays for a "look here", never a calm far sun, which sits one step off its sky (`CRAFT.md` §g.2).
  Every proposal here follows the same three rules. The palettes themselves and the study's chroma numbers (light
  fills calm, the colour in the mid-tones, saturation as confetti: `STUDY.md` §4) stay proposals until the owner sees
  10b in the look test.

## Texture and lines (owner, 2026-10-25)

> "I only really like these very subtle texture pieces and the black outlines, VERY subtle but in key places. Perhaps
> this is something we can test out in the production."

The reference is `texture_refs/autumn_walk_detail.png`, a crop of `palette_refs/4.webp`. Zoomed in, it shows:

- **Texture: a regular halftone dot grid, not random noise.**
  - The grid is rotated about 45°, with a pitch of about 0.6 % of the image width (about 6-7 px at 1080).
  - It is **tone-on-tone**: the dots are the fill's own hue, about 6-10 % darker in L* on mid and dark fills, and
    slightly lighter on very light fills. A few paper-white flecks sit on top (we keep the dots, never the flecks:
    `CRAFT.md` §c).
  - It reads as material, not as grain.
- **Lines:**
  - **Interior and key places only:** a crease on trousers, a leash, a collar, a mouth, the ear's edge.
  - **No outline around silhouettes;** shapes are separated by colour alone.
  - **The stroke:** dark warm ink, about 2-4 px at 1080 wide, **tapered at both ends** (a brush, not a pen). Our
    `brush()` in `src/lib/mascot/ink.ts` already tapers (`tipIn` / `tipOut`).

**Our lines today: `CRAFT.md` §c** replaces this reading's line spec: no outlines on any tier since 2026-10-29 (owner:
"Go with your suggestions", the A vs B picture's B), edges from light and shade, as in this reference ("no outline
around silhouettes"). The owner's "black outlines, VERY subtle, in key places" now lives only as thin dark lines on
things that are lines (window bars, railings, rigging), in the object's own deep shade (2026-10-27 to 10-29 it was the
subject's one outline plus a few inner details, B's thin tinted line or none); taper only where the stroke IS the
thing (hair, steam).

**What our kit has:**
- an optional paper-grain overlay (`public/textures/grain.png`, `Card` `grain`; off by default): retired as it was;
  since 2026-10-28 a VERY subtle paper-and-paint texture is being tested again (owner: "start playing with it, very
  subtly especially if its adding to the premium look"), measured from the city posters
  (`docs/studies/2026-10-28_city_posters/`), and since 2026-10-30 it is the one paper per film (owner, on an overall
  texture: "that seems solvable too?"; its spec: `CRAFT.md` §c);
- tapered brush lines (the mascot ink; the clean pen keeps taper off unless asked).

**What it lacks:** a halftone fill. Add it as an SVG `<pattern>` (dots in the fill's darker tone), applied per shape
and locked to the shape, so it moves with the camera.

**The production test (planned 2026-10-25; history, answered by the preview test below):**
1. Render a style frame three ways: no texture; the halftone at 6 % and at 10 % tone difference; the same with key
   lines only and with full outlines.
2. Encode the motion test like Reels does (about 3.5 Mbps H.264) and view it on a phone.
3. Check for:
   - shimmer or moiré when the camera pushes, since the dots scale with the object (fix it by snapping the pattern
     scale, or by fading the texture out during fast moves);
   - the texture vanishing after compression (then raise the contrast slightly or the pitch to about 8 px);
   - lines staying crisp at phone size.
4. The owner picks.

**Preview test, 2026-10-25** (`review/look/texture/`; regenerate with `python3 scripts/look/texture_test.py && node scripts/look/texture_shoot.cjs`):
- **What was rendered:** variants A (flat), B (dots 6 % + key lines), C (dots 10 % + key lines) and D (dots 10 % + full
  outlines), in palettes 2 and 7.
- **Outputs:**
  - `texture_sheet.png`: 1:1 crops;
  - `full_B_p2_p7.png`: the full frames;
  - `motion_master.mp4` and `motion_reels_sim.mp4`: a 5 s camera push from 1.0 to 1.22, with the texture locked to
    the shapes, re-encoded at 3.5 Mbps.
- **Result:** the halftone survives Reels-like compression, at rest and mid-push, and no moiré was visible in the stills.
- **The owner's decision, 2026-10-25:** "it needs to be very subtle and only tactically in some places where it makes
  sense, not everywhere; super tactically, perhaps as the very last step in production, otherwise optional."
  - **Strength:** at most variant B (6 %), lighter if in doubt.
  - **Where:** only on a few chosen elements per shot, e.g. the hero's clothing in a close-up, one key prop or a cozy
    interior surface. Never the background, never every shape, never small or fast-moving things.
  - **When:** an optional texture pass, as the last step after G6 polish and before the G8 render. The film must be
    finished and good flat. Key-place lines stay part of the normal drawing (`CRAFT.md` §c).
