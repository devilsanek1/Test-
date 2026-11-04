# People: a concrete recipe for the people we paint (the "you" first)

**Status (2026-10-30): superseded in part by the owner's pick, direction C (MODERN GRAPHIC) with the LASH face**
(`docs/look/PEOPLE_DESIGN.md`, which wins on people between the look docs; the playbook's people bullet). Superseded
here, each marked in place: §a's proportions (C: about 7.8 heads), §b.6's soft body gradient (off: C draws two flat
tones), §c's face (LASH) and §d's wardrobe (today's looks). Still in force: the silhouette rules and the line of
action (§a), the local light (§b.5), ONE flowing element (§d), the motion specs (§e: the wind, the walk, the idle) and
the mistakes (§f) where C agrees; rims follow CRAFT §d.8 by tier (the "you" as the subject; people near the story 2
px). Before the pick this was a proposal from the people study of 2026-10-29, proven as stills in `people_sheet.png`
(next to this file). It is a look doc: it ranks below the playbook, `DIRECTION.md` and `CRAFT.md` and never overrides
them. The engine piece is `src/lib/figure/` (§g); C's code is `src/look/people_dirs/graphic/` (LASH:
`src/look/people_dirs/graphic_faces/`). The sheet is rendered by `src/entry-look-people.tsx` (`PeopleSheet`).

## 0. What the owner asked (verbatim, 2026-10-29)

- "Another bit is humans we paint - they should be better / These are the references especially the video / On the
  video the person is not substantially different than yours but certainly more refined and clean and more fluid"
- "Why can't you do the research yourself and come up with a concrete detailed recipes to reproduce certain
  elements? Seems like you should be able to really clearly define a recipe"
- "Look at this example too" (resending `refs_human_scale/03_beach_dusk.jpg`, the couple walking at dusk).
- On stills first: "Again let's start with stills", "No video yet".

The rules that still hold (playbook, "People small and simple like reference 1", with its pick of 2026-10-30):
- people are simple, beautiful and pleasant, styled like today's 20-30-year-olds;
- they are seen from behind, in rear 3/4, in profile or turned away;
- faces are generic: the LASH face where one is seen, only the contour under ~200 px tall;
- they act with their pose;
- only the one "you" stands at a real size (~130-220 px tall in 1080 x 1920).

**The reference teaches refinement, not wardrobe.** Our "you" stays in the film's teal and is dressed for the film's
place and season.

## 1. What we measured

All the crops are side by side at the same height in `people_sheet.png`, row A. The study's scratch is not kept.

| | ref 04, the girl (the key one) | ref 03, the walking couple | ref 01, man from behind | our her (still v3, 210 px) |
|---|---|---|---|---|
| Heads tall | ~6.5 (the head wrap included) | ~7.2-7.5 | ~7 | **4.9** (head 0.204 H) |
| Head | a small egg on a visible neck (0.03-0.04 H wide) | small, the jaw read | small, the hair one mass | **a ball sitting on the collar, no neck** |
| Torso | narrow and upright: a vest 0.22 H tall; the chest 0.15 H deep in profile | slim, upright, a slight lean into the step | shoulders 0.27 H, the hood one shape | **a box 0.225 H wide, the same width from the shoulders to the hem** |
| Lower body | a bell skirt 0.6 H tall, 0.37 H wide at the hem | legs tapering from the thigh to the knee, calf and ankle | straight jeans, the weight on one leg | **legs as two near-uniform sticks** |
| Line of action | a near-vertical gentle C (the back straight, the chin up), set against the ribbons and cape streaming back and down | a forward lean of a few degrees; the legs make a clear scissor | a slight contrapposto | **vertical and stiff** |
| Value and colour shapes | ~9-10 flat shapes, plus 3 tiny lines (the eye, the vest's band, the hem band) | 2-3 planes per form | ~5 (a near-black mass, a lit edge) | ~14, many small (tote, straps, a plant, pot, belt, bow) |
| Light | a warm key on the front (face, vest front, the skirt's top); the back in a cool mauve shade; the skirt's soft gradient from warm at the waist to deep plum at the hem; no rim | the man's dark shirt has a lighter sky edge; the legs catch the warm horizon on their edges; **the phone's cool glow lights only her face, hand and forearm** | a warm rim on the shoulders and hair from the sunset ahead | **a straight vertical split down the middle of the coat** (two halves, not a form) |
| Edges | no outlines; the silhouette is a value step against the sky | no outlines; the silhouettes read against the bright sea line | none | no outlines (pass 2), but the hard vertical terminator reads as a seam |
| Clothes | 3 masses (vest, skirt, hem band); folds by value only | shirt, shorts, a hem band; no fold lines | a hoodie and jeans: 2 masses | a coat, collar, belt and bow, tote, plant: too many small parts |
| Hair and scarf | the head wrap one white mass; 2 ribbons as long thin streamers | her hair one long mass down the back | one dark mass | a ball plus a bun: one big dark circle |
| Grounding | a misty contact | a faint reflection under the feet on the wet sand | dark grass | a contact shadow |

`refs_paint/01_beach_van_dusk.jpg`: the couple on the rock are ~30 px tall. At that size a person is 3-4 shapes (two
silhouettes, one with a lighter top).

**The motion, measured on ref 04:** we measured all 336 frames of the 5.6 s video. It is a 60 fps screen recording of
a ~24 fps animation: the girl's pixels change every 2-3 frames.
- **What moves:** only the ribbons, the cape and the motes (plus a tumbleweed bouncing past). Her body is still. A
  motion-energy map, aligned on her head, is bright only on the ribbons and on the cape's middle band.
- **The ribbons' flutter: ~1.0 s.** They stream out at ~0.5, 1.5, 2.5, 3.5, 4.6 and 5.5 s. They droop (the loop) at
  ~0.9, 2.0, 2.9, 4.0 and 5.1 s. The beats are irregular (0.75-1.25 s apart).
- **The gust swell: ~2.2 s.** The white mass in the ribbon zone peaks at 0.85, 2.6 and 4.9 s.
- **The swing:** the ribbons' centre moves ~0.1 H. The tip swings about +-25 degrees. The root, at the head, is
  pinned.
- **The phase lag:** the bend forms near the head first, then reaches the tips, more than half a cycle later.
- **The cape:** a slow billow of its trailing edge, ~2 s, small (~0.03-0.05 H).

**What makes ours read less refined, in order:**
1. The big ball head (4.9 heads): it reads as a cute infographic, not an elegant person.
2. No neck.
3. A box silhouette with no rhythm of narrow and wide.
4. A straight-line terminator.
5. Too many small accessory shapes.
6. Stiff, uniform limbs.
7. Nothing flowing.

## 2. What the craft says (research; sources)

The page fetches were blocked by this session's network (wikipedia, proko and blogspot). These sources were read
through their search summaries, so the numbers this recipe relies on are our own measurements (§1).

1. **Proportions:** Richer's average figure is 7.5 heads, and Loomis's idealized one 8 (it reads "noble or
   graceful"). A smaller head with a longer body reads older and more serious; a big head reads cute and young.
   [Proko, Human Proportions: Idealistic Figures](https://proko.com/human-figure-proportions-idealistic-loomis);
   [Made Good Designs, Character Design Basics](https://madegooddesigns.com/character-design-basics/).
2. **Silhouette and shape language:** a design must read when filled solid black, and round forms read soft and
   approachable. [Filmdaft, What is character design](https://filmdaft.com/what-is-character-design-animation-explained-simply/);
   [RocketBrush, Shape language in character design](https://rocketbrush.com/blog/shape-language-in-game-character-design-how-to-make-characters-readable-and-consistent).
3. **Follow-through, overlapping action and drag (Thomas and Johnston, The Illusion of Life, 1981):** loose parts
   (hair, cloth) keep moving after the body stops and move at their own, later rate. Motion flows from the core out to
   the limbs, then to the extremities, then to the loose parts.
   [Wikipedia, Follow through and overlapping action](https://en.wikipedia.org/wiki/Follow_through_and_overlapping_action);
   [UIC, the 12 principles](https://www.evl.uic.edu/datsoupi/251_15/docs/12AnimationPrinciples.pdf).
4. **Offsets along a chain:** stagger each segment's keys by a fixed delay (e.g. 0, 3, 6 frames), or drive a sine
   with an offset and a falloff along the chain (the After Effects puppet-pin "wave").
   [Spine forum, offsetting keys](https://uk.esotericsoftware.com/forum/d/25137-move-the-animation-keys-automatically-);
   [Lester Banks, fake cloth with an expression](https://lesterbanks.com/tag/after-effects-rigging-character-clothes/).
5. **The walk (Richard Williams, The Animator's Survival Kit, 2001, pp. 102-115):**
   - the poses: contact, down, passing, up;
   - "people generally walk on 12s": 2 steps a second;
   - the body is lowest just after the contact and highest just after the passing;
   - without the up and down, a walk floats.

   [Survival Kit notes](https://s184753.blogspot.com/2019/01/more-research-animators-survival-kit.html);
   [The Anatomy of the Walk](https://artbyvaldez.blogspot.com/2010/04/anatomy-of-walk-part-1.html).
6. **Walk polish:**
   - counterpose: the arm opposite the forward leg swings forward;
   - the hips and shoulders counter-rotate;
   - level hips look mechanical;
   - a woman's walk adds ~10 degrees of hip rotation.

   [Animost, tips for walk cycles](https://animost.com/tutorials/tips-for-animating-walk-cycles/);
   [Polycount, a female walk critique](https://polycount.com/discussion/comment/552640);
   [SIGGRAPH, a walking exercise](https://education.siggraph.org/static/HyperGraph/animation/character_animation/walking/walking_excercise.htm).
7. **Flag physics:** the flapping Strouhal number St = f L / U is ~0.1-1. So f ~ St U / L: a 2-3 m/s breeze on a
   ~0.5 m scarf end gives ~0.6-1.5 Hz, matching the 1.0 s flutter we measured.
   [arXiv 2602.06237, flag wake and flapping](https://arxiv.org/pdf/2602.06237).

## 3. The recipe

### a. Design: proportions, silhouette, line of action

**The proportions are superseded by direction C (owner, 2026-10-30; `people_design/dir_graphic.md` §2):** about 7.8
heads (the skull 0.128 H; with its hair the head never above 0.14 H), a long neck showing 0.04-0.05 H, the hip joint at
0.545 H, the knee at 0.295 H, real hands (0.098 H) and feet (0.148 H), limbs tapered (thigh : ankle ~3 : 1); a
standing contrapposto with one hand always anchored; every form ONE rounded polygon (straight edges joined by
deliberate radii, crisp corners only where the material is crisp). The table below (6.75 heads) is history; the
silhouette rules and the line of action under it still hold.

Measured in H, her height (1000 local units in the engine).

| | Value | Why |
|---|---|---|
| Heads tall | **6.75** (the head, crown to chin, 0.148 H) | between ref 04 (6.5) and ref 03 (7.2-7.5); never below 6.5 for the "you" |
| Neck | a visible column 0.05 H wide, 0.04 H long (in profile; from behind the scarf may cover it) | ref 04's long neck is half of its elegance |
| Shoulders | 0.22-0.24 H wide (back view), sloping from the neck, rounded | slim, never square corners |
| Waist | 0.16-0.17 H (belted) at 0.62 H | the narrow between two wides |
| Hips | 0.20-0.21 H at 0.50 H | |
| Hem | 0.24-0.28 H wide at 0.19 H off the ground (mid-calf) | the A-line: ref 04's bell in a coat |
| Legs | hip joints at 0.505 H; thigh 0.245 H, shin 0.225 H, ankle 0.042 H; tapering widths (half-widths 0.046 H at the thigh, 0.026 H at the knee, 0.027 H with a calf bulge behind, 0.015 H at the ankle) | ref 03's legs: a thigh, a knee, a calf, a fine ankle |
| Arms | 0.18 H upper arm, 0.16 H forearm, the wrist at ~0.45 H (mid-thigh); sleeves 0.037 H at the shoulder to 0.029 H at the cuff | |
| Feet | an ankle boot 0.13 H long, the shaft 0.07 H high | |
| Contact stride (walking, profile) | front toe to back heel ~0.5 H (ref 03's woman: 0.49 H) | a confident stroll |

**Silhouette rules**
1. **A rhythm of narrow and wide.** Small head, narrow neck, sloped shoulders, cinched waist, the hips, then the hem
   flaring wider than the shoulders. Never a box.
2. **Readable filled black at 145 px.** Show at least one negative space: between the arm and the waist, between the
   legs below the hem, or around the scarf's end against the sky.
3. **Curves against straights.** The back and the coat's front are long, nearly straight lines; the head, the bun, the
   calves and the scarf are curves.
4. **One closed smooth loop per part.** No corners except the boot's heel and the box.

**Line of action**
- Standing: a near-vertical, gentle C. The chin is a few degrees up and the back straight. The flowing element gives
  the diagonal that the body lacks.
- Walking: a lean of 3 degrees into the step, the head level.
- Acting poses (reach, slump, look up) bend this one line first, then place the limbs.

### b. Shapes and colours

1. **How many: 8-10 flat shapes per figure at 130-220 px.**
   - The shapes: hair (with the bun), skin (face and neck), coat (with the arms), the scarf (wrap and end), legs,
     boots, at most one carried object.
   - Small details are value overlays inside their part (the belt, one fold, the vent), never new edges.
   - At 30-60 px tall a person is 3-4 shapes; under 30 px, 2.
2. **The palette rule:**
   - one hero colour, on the coat (the film's hero is hers only: teal `#0B8577` in v2);
   - the film's dark anchor for the hair (plum `#36223A`);
   - one warm accent that complements the hero (the scarf: dusty terracotta-rose `#C9705C` with a deeper tip,
     `#8E3F3C`);
   - the figure's real darks in small pieces (deep-plum tights `#4A3242`, near-black boots `#2E2026`);
   - warm skin (`#D9A27E`);
   - never a second saturated field.
3. **The light and shade split: 2-3 flat planes per part.**
   - LIT: the base.
   - SHADE: the form shade away from the key, -20 L* on the subject (CRAFT §d, tier A). It turns ~14 degrees toward
     the shade family's hue and keeps 95 % of its chroma (colour, never grey). On very dark materials it is -7 L*,
     and they get a stronger rim instead.
   - DEEP: -30 L*, only for small accents (under the bun, the far limbs).
   - The far arm and the far leg are drawn in their shade plane: depth by value.
4. **The terminator follows the form.**
   - The shade plane is the part minus itself shifted toward the key (the "offset crescent"). It is as wide as the
     shift: ~30 % of the coat's width from behind, ~35 % in profile.
   - So the edge between light and shade runs parallel to the part's own contour, never a straight seam down the
     middle (our current her's tell).
5. **Rim and local light.**
   - **Rim:** the subject's key-side edge gets a thin rim, +14 L* turned toward gold, 0.9 % H wide (1.9 px at
     210 px). It is the part minus itself shifted away from the key.
   - **Local light (ref 03):** a local light (a phone, a lit doorway, a shop window) lights only what is near it and
     faces it: a phone lights the face, the hands and the scarf's front; a doorway lights the back's edge.
   - It is drawn as the same crescent on the side facing the light, lifted +10 to +14 L* and turned at most
     12 degrees toward the light's hue. A phone's light is clipped to a disc of ~0.25 H around it.
   - It never covers the whole silhouette and is never a glow disc (DIRECTION rule 5).
6. **The soft body gradient: off (decided by the pick, 2026-10-30).**
   - Ref 04's skirt darkens from the waist to the hem. In the engine this is a multiplied vertical ramp inside the
     coat, from no change at 0.64 H to ~-8 L* at the hem (the ground's occlusion).
   - The owner's pick, direction C, draws people in two flat tones with a crisp terminator and no gradient, so it stays
     off; the sheet's row A keeps the A/B as history.
7. **No outlines.** Edges are steps of value (rule 4). The true lines are only:
   - the closed-eye line in profile (0.46 % H, in the hair's deep tone);
   - a strap or a phone's edge (they ARE lines).
8. **Grounding:** a flat contact shadow under the feet, multiplied on the ground (on a wet or shiny ground, a faint
   reflection, ref 03).

### c. The minimal face and hands

**The face is now LASH** (owner, 2026-10-30: "Let’s keep lash"; `people_design/faces_graphic.md`, `PEOPLE_DESIGN.md`):
closed-eye lash lines, one flick each (two in 3/4 and at a slight turn), and a short soft nose hook; no brows, mouth or
eye colour; under ~200 px tall only the contour (EDGE); in profile the hair tucked behind the eye; in the lost profile
the cheek's sliver, with the nose tip and a lash flick peeking past it; sunglasses and caps as some people's
accessories, never everyone's; never looking at the camera. Hands are C's mitten with a thumb lobe (0.098 H). The
rules below are history where they differ (the single eye line, the 0.064 H teardrop hand).

- **Profile:** the skin's own edge carries the face (brow, a small nose 0.013 H proud, lips, chin), plus at most ONE
  short closed-eye line, as ref 04 has. No brow, mouth, pupil or blush.
- **Rear 3/4:** a cheek-and-jaw sliver of skin past the hair's contour on the side she turns to, 0.02 H wide, no
  features.
- **From behind:** hair and nape only.
- **Hands:** one small tapered teardrop of skin (0.064 H long, 0.026 H wide), no fingers. It is turned in toward the
  thigh when hanging and follows the forearm when holding. The far hand is in its shade plane.
- **Gloves or pockets** are fine (ref 01 hides his hands in his pockets).

### d. Clothing and hair: few masses, ONE flowing element

- **Clothes are 2-3 masses:**
  - a long A-line coat (mid-calf), belted;
  - the legs, in a dark tone;
  - the boots.
- **Folds are value overlays, never lines:** at most one long tapering fold from the hip to the hem (one multiplied
  step), the belt as a band and the back vent as a sliver.
- **Hair is ONE mass,** an egg over the skull from the hairline to the nape, with a low bun as a second small oval
  (from behind it sits on the nape, in profile behind the ear). No strands. Its shade crescent and rim make it round.
- **ONE flowing element per figure:** the scarf's free end, thrown back over the shoulder. Only one thing streams.
  - Its size: 0.27 H long, 0.038 H wide at the root tapering to 0.022 H at a rounded tip.
  - Two planes along its length (the top lit, the underside in shade).
  - The last 14 % in a deeper tone: ref 04's red ties at the ribbons' ends.
  - For a stranger the flowing element is optional (a coat hem in a gust, a ponytail); never two at once.
- **Carried objects** are one simple shape in 2 planes (a kraft box with its top face and a tape band), held by
  arms that really carry it (the forearm under the box).
- **London October evening** (superseded, 2026-10-30: today's looks from `people_design/fashion.md`, as direction C
  dresses her: N1 the long open coat, L2 the baby tee with jeans, a cap and a ponytail, N6 the suede bomber, N3 the
  cropped leather jacket over a statement skirt; one roomy piece and one detail per look, one accent per person, the
  film's hero colour on the "you" only; the belted A-line coat, tights, ankle boots and blanket scarf read 2010s:
  `dir_graphic.md` §7):
  - the teal wool coat, belted;
  - the rose wool scarf;
  - plum tights;
  - ankle boots.

### e. Motion, for later (no video yet)

1. **The flowing element (`wind.ts`, measured on ref 04):**
   - An inextensible chain of 12 segments, so it never stretches.
   - Each segment's angle is the rest angle, plus the weight's sag (+34 degrees from the root to the tip), minus the
     gust, plus a travelling bend.
   - The flutter has a period T1 of 1.0 s. A gust swell (T2 = 2.3 s, incommensurate with T1) swings it +-7 degrees and
     adds a second wave at 0.35 of its strength.
   - The bend's amplitude is 8 degrees at the root and 36 at the tip (growing as s^0.8). Its phase lags 0.8 of a cycle
     from the root to the tip.
   - The root is pinned. The body never moves for it.
   - At strength 0 the end hangs; 1 is the reference's breeze.
   - On 60 fps it may move every frame (the reference is on ~24 fps), but keep the stills' shapes.
   - Row C of the sheet shows phases 0, 0.25, 0.5 and 0.75 s beside the reference's ribbons at the same spacing.
2. **The walk (Williams; ref 03):**
   - 2 steps a second (a step is 0.5 s; a stroll 0.55-0.6 s).
   - Stance takes 60 % of a leg's cycle, swing 40 %. The heel strikes with the toe 14 degrees up, the foot rolls flat,
     and the heel rises to 34 degrees at toe-off.
   - The swing foot lifts 0.058 H.
   - The hip rides as high as the planted legs allow, which makes the down after the contact and the up after the
     passing by itself (~3 % H).
   - Counterpose: the arm opposite the forward leg swings forward 19 degrees, and the elbow bends a little more on the
     forward swing.
   - A lean of 3 degrees into the step.
   - Later polish: ~10 degrees of hip rotation on the swing side, and the shoulders counter-rotating.
   - The coat's back hem follows the back calf ~2 frames late (follow-through); the scarf's root takes the walk's
     bob.
   - Never ice-skate: the planted foot stays fixed on the ground.
3. **The idle (a held shot):**
   - the body still (ref 04);
   - only the flowing element moves;
   - at most one breath (a 4 s cycle, the shoulders +-0.3 % H) and one small act per 4-6 s (a head turn, a weight
     shift), eased.
   - **Never a body that sways all the time.**

### f. Mistakes to avoid (what made ours read less refined)

- a head over 0.16 H for the "you" (ours: 0.204 H);
- the head sitting on the collar with no neck;
- a coat drawn as a box, the same width from the shoulders to the hem;
- a straight vertical terminator splitting the figure into two halves;
- limbs as uniform tubes (no knee, calf or ankle), or arms hanging like planks from square shoulders;
- more than ~10 shapes, or accessories (tote, straps, a plant, a bow) competing with the silhouette;
- a local light painted on the whole silhouette, or turning the hero colour toward another hue (it reads as a
  glowing outline);
- nothing flowing, or several things flowing at once;
- faces, eyes or mouths beyond §c;
- shapes that cross, gaps between fills, or a line around anything.

### g. Implementation: `src/lib/figure/`

```tsx
import {Figure} from '../../lib/figure';
<Figure x={feetX} y={groundY} h={210}                      // screen px
  pose={{view: 'rear34' | 'profile' | 'back', step?: number, weight?: 1 | -1, chin?: number, turn?: number,
         carry?: 'none' | 'box' | 'phone', wind?: {t: seconds, strength?: 0..1}, eye?: boolean, stride?: number}}
  facing={-1 | 1}                                           // profile: -1 faces the screen left (the drawing's own)
  look={{coat, hair, skin, legs, boots, scarf, scarfTip, box, leaf, phone}}  // any subset; defaults HER_LOOK
  light={{key?: [x, y], local?: {color, dL, dir, width?, at?, radius?}, grad?: 0..1, rim?: boolean}}
  shadow={'#D9C7BE' | null} />
```

- **`model.ts`** builds the parts at H = 1000 (feet on y = 0, facing left) from `PROP` (§a's numbers):
  - three views (profile; back, which also gives rear 3/4);
  - the walk: `footAt` (heel, flat, ball, swing), two-bone IK for the profile knees, and on-line knees from behind;
  - the arms' swing;
  - the scarf through `wind.ts`.
- **Each part is a closed Catmull-Rom loop** of 5-17 control points (`geom.ts` `loop`), a material, and its crescent
  widths (`shade`, `rim`, in local units). Optional fields: `overlay` (a multiplied value step clipped to a parent
  part), `local` (reachable by a local light) and `grad`.
- **`Figure.tsx`** paints each part:
  1. LIT;
  2. the SHADE crescent: an even-odd XOR of the loop with itself shifted toward the key, inside a clipPath of the
     loop;
  3. the RIM crescent: shifted away from the key;
  4. the LOCAL crescent (shifted away from the local light; with `at` and `radius`, clipped to a disc around the
     light, so it reaches only what is near it);
  5. the overlays: the clip and `mix-blend-mode: multiply` on the SAME element. A clipped `<g>` isolates the blend:
     the overlay then paints light instead of darkening.
- **`tones.ts`** derives the planes from each material's lit colour in L*C*h: the shade turns toward `SHADE_HUE` 285,
  the rim toward `KEY_HUE` 70.
- **Pure geometry:** no time, no randomness. Motion later is a pose per frame (`step`, `wind.t`), so a film's G3
  can block with it and G5 fills it.
- **Keys of light:** the default key is a low sun from the upper left (`[-0.92, -0.39]`). A film passes its own rig's
  direction. A profile facing right mirrors the drawing, and the key with it.
- **A film draws its own people with it:** its colours, poses and light. Strangers in the mid ground use the same
  model with a calmer look (C* <= 25, tier B), a tier-B rim only where the key or the story light touches them (2 px,
  +6-8 L*: CRAFT §d.8; `light.rim: false` elsewhere) and no flowing element. Never another film's figure.

## 4. The proof and how close it gets

`people_sheet.png` (2400 x 2760; the frame of `PeopleSheet`):
- **Row A:**
  - in the film's own frame (the still v3 landing, shown at 1.5x), our current her and the refined her, both 210 px;
  - then both at 640 px: current, refined in 3 flat planes, and refined with the soft gradient (the proposal);
  - beside them, ref 04's girl and ref 03's couple.
- **Row B:** four poses at 640 px:
  - rear 3/4 standing;
  - walking in profile on ref 03's gait;
  - walking away;
  - stepping out of a lit door with a box (the door as a local light on her back);
  - plus a phone-lit variant.
- **Row C:** the scarf end at 4 phases of the 1.0 s wind cycle, beside ref 04's ribbons.

The reference crops the sheet uses are in `public/figure/`.

### 4.1 How close it gets (honest, after viewing the sheet at phone size and one fix pass)

**The fix pass:** the first local lights were far too strong. The door turned her back's edge lime and the phone
painted a cyan band down to the hem. They are now +11 to +14 L* with at most a 12-degree hue turn, the phone's
clipped to a disc of 0.25 H around it. The walking-away toe-off foot floated, and now keeps its toe on the ground. The
wind strip now keeps the tip in view.

**Closer to the references (measured):**
- **6.75 heads instead of 4.9:** the head is 0.148 H, on a visible neck.
- **A silhouette with rhythm:** sloped shoulders, a belted waist, an A-line hem.
- **A terminator that follows the contour,** instead of the straight seam down the middle.
- **~10 shapes instead of ~14:** no tote, straps or plant blob.
- **Tapered legs,** with knees, calves and fine ankles.
- **One flowing element** with a measured wind spec.
- **A face hint like ref 04's:** the profile edge and one closed-eye line.
- **Ref 03's gait:** a contact span of ~0.5 H, counterpose arms, a 3-degree lean.
- **At 210 px in the film's own frame,** she reads taller, slimmer and more grown-up than our current her (row A). At
  640 px the difference is plain.

**Still short of ref 04:**
1. **Fluidity.** Ref 04 gets its flow from two light ribbons and a translucent cape. Ours is one wool scarf end, which
   reads heavier. At 640 px, in some phases it looks like a tube or a third sleeve. A thinner, longer end (a silk
   scarf, or a coat belt's loose tail) would get closer but is less "London October".
2. **A teal column at phone size.** The mid-calf coat hides most of the legs, so at 210 px she reads as a long teal
   column and the pose has less to act with. Ref 04's bell skirt has the same trade, but it is light in value.
3. **The views from behind are stiffer than the profile.**
   - The arms still hang long and straight.
   - The rear 3/4 is a back view with a cheek sliver, not a turned torso.
   - The contrapposto barely reads.

   The profile is the best view, as in ref 04.
4. **Crisper than the reference.** Our planes are crisp vector fills; ref 04's are a little soft (its body gradient,
   soft edges). The soft gradient's A/B is in row A; the owner's pick of 2026-10-30 (direction C, two flat tones,
   crisp) keeps it off.
5. **Placement.** In the still v3 frame, her shade side sits close in value to the teal canal behind her, so her
   right edge melts. This is a scene fix (a calmer, lighter field behind the "you", rule 2's separation), not a
   figure fix.
6. **Local light at 210 px.** Only the phone's light on the hands and the scarf reads; the door's rim is a hairline.

**Net:** in profile, close to ref 04's cleanliness and simplicity. About two-thirds of the way on refinement, less from
behind. The owner should judge the sheet.

**If the direction is liked, the next steps:**
- turn the torso in rear 3/4;
- loosen the back-view arms;
- try a thinner, longer flowing end;
- place her in v2's scene 1 against a calm field;
- then (motion, later) play the wind spec and the walk in a G4-style look clip.
