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

## Proposed direction for video 2 (test at G4 against our v1 theme)

- **Keep:** our soft, warm base and mids (cream, sand, peach, tan) and the no-screaming-colours rule for large areas.
- **Add, per shot:**
  - **1 hero colour** at 5-15 % of the frame, on the subject or the story object. Candidate: periwinkle `#6A70F7`. Our
    mascot Pip is already a periwinkle/purple elephant, so this ties the brand together. Alternatives: cobalt `#509EFB`,
    or coral `#FA582F` for alarm beats.
  - **1 dark anchor:** aubergine `#34244A` for the darkest large shapes (hair, coats, the shadow side). Our dark-brown
    ink `#2B1B0A` stays for thin lines and caption text.
  - **Hot pops at 1-3 %:** orange `#FA9306` or coral `#D05D38` on the thing the eye must hit first (a notification
    badge, a lamp, a button). On frame 0 this is where the hook lives.
- **Composition:** the background is 60-80 % of the frame. Background props can be single-colour line drawings so the
  subject is the only solid mass.
- **Texture:** test a fine stipple grain on the hero and dark fills. Check it survives Reels compression (playbook:
  avoid full-frame fine noise).
- **G4 look gate:** 2-4 style frames: the v1 theme as is; v1 + periwinkle hero + aubergine anchor; a cobalt/orange
  complementary version; and optionally a pink-wash variant like ref 5. The owner picks.
