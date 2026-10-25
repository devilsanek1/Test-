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

## The house palette family: tools, not a cage (owner, 2026-10-25)

**The owner's direction, in three messages:**
- "It's not that we should mix ALL these colours in the same video, then we get a complete mess, but be tactical about it."
- "The idea is to have multiple 'similar-ish' stylistic ones that we can pick and choose for each video, that would all
  have the same general style, but be slightly different and unique."
- "I frankly like our colours too. It's not that we should change it completely, but see if we can make a next
  incremental shift and polish, and ultimately have multiple palettes as tools available for various use cases, but
  not get completely stuck in the given set of colours: expand if needed and where relevant."

**The board** is `palette_family.png`: the same small scene drawn in each of the 8 palettes. The data (role → hex) is in
`palettes.json`. Regenerate the board after any change, with
`python3 scripts/look/palette_board.py && node scripts/look/shoot.cjs` (run from `video/`). The Python step also checks
every palette against the DNA below.

**The house DNA** keeps the palettes one family. The numbers are CIE L* (lightness) and C (colourfulness):
- **Background:** soft and light (L* >= 75, C <= 20), never saturated or dark. It fills 50-80 % of the frame.
- **Mids:** soft, from our clay family (cream, peach, sand, tan, sage) or the palette's own tints. Background props can
  be single-colour line drawings.
- **Ink:** dark and warm (L* <= 25), never pure black, for lines and captions. At least 7:1 contrast on the background.
- **The references' trick, used tactically:**
  - **one hero** (C >= 30): saturated, on the subject or the story's object, 5-15 % of the frame;
  - **one dark anchor** (L* <= 40): tinted, instead of black, about 5 %;
  - **at most one hot pop** (C >= 50): 1-3 %, only on "look here" (the frame-0 hook detail, a notification, a reveal).
- **Texture:** a very light stipple grain on fills (it must survive Reels compression). Thin interior lines.

**The family (v1):**

| # | Palette | What it is | Use cases |
|---|---|---|---|
| 1 | Mint & Clay (v1) | video 1 as shipped; the reference point | anything; our signature |
| 2 | Mint & Clay 1.1 | **the incremental polish of v1:** same world, a saturated teal hero `#00857F`, a deeper anchor `#203A3B`, a tiny marigold pop `#F9A31B` | the default from video 2 on, unless a story asks for another |
| 3 | Cream & Cobalt | our cream as the page, cobalt hero, our orange as the pop | tech, clear explainers |
| 4 | Blush & Pip | blush page, periwinkle hero (Pip's colour), aubergine anchor | human, light, brand moments |
| 5 | Sage Study | sage and oat, lamp light, forest anchor, amber pop | cozy enclosure: home, desk, quiet interiors |
| 6 | Dusk | cool mist, low peach sun, indigo hero, coral pop | serious, night, high stakes |
| 7 | Autumn Ochre | our clay family warmer, burnt-orange hero, a small cool blue pop | money, everyday life |
| 8 | Harbour | a cool, fresh page with a warm coral hero and a deep sea anchor | science, health, the outdoors |

**How to use it:**
- **Each video picks one main palette** at G4, by rendering style frames in 2-3 candidates. A sister palette may carry a
  deliberate shift inside the story, for example a Sage Study interior followed by a Dusk exterior for the scale
  reveal, because they share the DNA. Never mix many at once.
- **Within a video, colours keep their jobs:** hero = what the story is about, anchor = weight, pop = "look here".
- **Don't get stuck:**
  - add a colour when the story needs one (a brand colour, a map, a warning sign) and give it a role;
  - make a new palette by copying the closest one, changing the background tint and the hero / anchor / pop, running
    the DNA check, and adding it to `palettes.json` with its mood and use cases.
- The palettes evolve: polish the existing ones with each video's lessons (owner feedback goes in the playbook).
