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
   It's mostly empty: generous negative space around one subject.
2. **The contrast comes from a few details, not from more colours:**
   - one saturated **hero** colour per image covers 5-15 % of the frame, usually on the subject's clothes. It is often a
     cool cobalt or periwinkle against the warm base (blue against orange: complementary);
   - one **deep dark anchor** covers about 5 %: aubergine/navy (`#34244A`) instead of black, on hair, trousers and shoes;
   - **tiny hot pops** cover 1-3 %: orange `#FA9306`, coral `#FA582F` (a croissant, fairy lights, leaves, confetti).
3. **Everything else stays soft:** sand, olive, pink, low-saturation mids.
4. **Texture:** a fine stipple/halftone grain on the fills, which keeps saturated colours soft.
5. **Lines:** thin, and only for interior details (folds, fingers, faces), not full outlines.
6. **Secondary elements as line-only drawings:** in ref 1 the house and trees are single-colour olive line art, so the
   subject is the only solid mass.

## The rule: be tactical, one palette card per video (owner, 2026-10-25)

> "It's not that we should mix ALL these colours in the same video, then we get a complete mess, but be tactical about it."

- **Every video is the shared house base plus ONE accent card, chosen at G4 to fit the story.**
  - The base is the same in every video: the warm off-white or cream background, soft mids (sand, peach, tan) and
    dark-brown ink for lines and captions.
  - The card has 3 colours, no more:
    - **1 hero colour** at 5-15 % of the frame, on the subject or the story's object, in the same hue for the whole video;
    - **1 dark anchor** at about 5 %, for weight and the darkest large shapes;
    - **at most 1 hot pop** at 1-3 %, only on what the eye must hit first (the frame-0 hook detail, a key reveal).
- **Every colour has one job and keeps it all video long.** For example: hero = what the story is about,
  anchor = weight / threat, pop = "look here". Don't recolour roles mid-video.
- **Never bring in reference colours outside the card.** No second hero, no confetti of accents. Any frame shows the
  base neutrals plus at most the card's 3 colours.
- **Example cards** (see `palette_refs/swatches.png`):

  | Card | Hero | Anchor | Pop | Suits |
  |---|---|---|---|---|
  | A Pip periwinkle | periwinkle `#6A70F7` | aubergine `#34244A` | orange `#FA9306` | the brand default; tech explainers (Pip is periwinkle) |
  | B Cobalt + coral | cobalt `#509EFB` | aubergine `#34244A` | coral `#FA582F` | serious / alarm stories (the cool hero against a warm alarm pop) |
  | C Autumn warm | burnt orange `#D05D38` | charcoal `#211E1E` | olive `#AC933A` (soft, as the pop) | cozy, human, everyday-life stories |
  | D Pink wash | pink wash `#FCB4E2` (large, soft) | aubergine `#37274F` | periwinkle `#6872F9` | light or celebratory topics; use rarely |

- **Also from the references:** a fine stipple grain on the hero and anchor fills (check it survives Reels compression),
  thin interior lines only, and background props as single-colour line drawings so the subject is the only solid mass.
- **The G4 look gate:** render 2-4 cards on the same style frame. The owner picks one card for the whole video, and it
  is frozen with the look.
