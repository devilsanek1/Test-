# People v4 assembled: the v4 hair on the v4 heads and bodies (2026-10-30)

**Status: DONE for this iteration** (stills and motion strips only, no video file; the orchestrator looks before the
owner). Brief: `../BRIEF.md` (the owner's words, the ref 03 bar) and `../../EVALUATION.md` (the eight changes).
Inputs: the hair round `../V4.md` (six cuts as designed shapes on a 2D spring rig) and the faces round
`../../faces_v2/V4.md` (authored pen faces, smooth bodies). One glance at all four: `contact_sheet.jpg`.

## The stills (what the owner should look at)
| Still | What it shows | Look at |
|---|---|---|
| `01_her_before_after.png` (2400 x 2010) | Her as drawn now (direction C, LASH, the evening coat) beside the assembled v4 (her long layers with curtain bangs on the v4 head and body), front 3/4, walking profile and from behind at 640 px, then at film size (200 and 156 px); below, her head close beside ref 05: profile and 3/4, each in LASH and OPEN EYES (looking away, never at us), and the lost profile | One clean, stylish cut that sits ON the head (the hairline, no seams at the ear or the nape)? A cute, delicate face framed by the hair? **Your pick: LASH or open eyes.** Still her? |
| `02_cast.png` (2400 x 1990) | Six people, the six cuts (her long layers, the wavy lob, the coily cloud, the sleek ponytail, the textured crop, the middle-part flow), women and men, slim / average / athletic / soft, 160-188 cm, six skins: busts in 3/4 (ref 03's bob beside our lob, the bar), all six standing at one scale with 150/170/190 cm marks, and each in three views at film size | Would a regular viewer call each one a clean, current, good-looking haircut? Cute women, manly men? Our lob beside ref 03's bob: the gap closed enough? At film size, does every cut still read? |
| `03_motion_strips.png` (2400 x 2890) | Eight frames a row at 60 fps on the v4 heads: her head turn 3/4 -> profile, her walk (profile), a gust on her from behind; then the ponytail's turn, the lob's walk, the cloud in a gust | Read along each row: the hanging pieces lag, overlap, overshoot a little and settle; the shapes stay smooth (no kinks, no crossing); the cap never slides on the head; the face's drawing swaps exactly where the hair's turn ends |
| `04_in_scene.png` (2240 x 2080) | The cast at film size (149-224 px) in the painted dusk still v6 (her walking at the lit doorway, five strangers on the quay and the promenade, one breeze), two 2x crops, the frame at phone size (360 px wide) | At phone size: does each head read as a clean, current cut on a person, never a wig on a mannequin? Do they belong in the scene's light? |
| `contact_sheet.jpg` | The four stills at a glance | |

## What the assembly did (`video/src/look/people_dirs/hair_v4/asm_*.ts`, `SheetsFinal.tsx`)
- **One character, one light** (`asm_people.ts`): the v4 body, the v4 head placed on the pose's head frame, the cut on
  the SAME frame (head units: crown -0.5, chin 0.5). Joined by light: the hair's soft shadow cast on the forehead, the
  cheek, the ear and the nape (one group per skin part, shifted away from the key, blurred, so overlaps never
  double-darken); the head's soft shadow under the jaw on the neck; the rim on the hair AND on the top of the shoulders
  (a near-vertical band, never an outline); a stronger, crisper gloss on each cut's one authored highlight (ref 03's
  glossy crown); a contact shadow. Grounds are dusk, never pale-on-pale; the busts keep each face >= 25 L* from its
  ground (deep skins on the lightened dusk). One SVG writer takes both rounds' parts (`asm_render.ts`).
- **The switch points aligned:** the faces swap 3/4 -> profile at 63 degrees and profile -> lost profile at 114; the
  hair's 3/4 -> profile morph now runs 36 -> 63 (was 38 -> 69 for the LASH heads), so a turn's hair finishes exactly
  where the face's drawing swaps (`hair.ts SWITCH`).
- **The necks:** a whole figure in profile uses the head's designed neck (the throat's line); a head turned to profile on
  a 3/4 body keeps the body's neck (no neck pop mid-turn); the lost profile uses the head's own neck (it meets the jaw;
  the body's narrower neck left a fin of jaw in the air).
- **The seams, redrawn node by node on the v4 heads** (`asm_fit.ts`, found on a design desk: each cut on each head at
  620 px a skull, the nodes numbered). The faces round kept the cranium (so the crown, the back and the volume fit as
  drawn) but moved the ear to its anatomical place (3/4: from (0.27, 0.06) to her (0.36, 0.14) / his (0.38, 0.10),
  smaller; profile: further forward and lower), and its back view is a real lost profile at yaw -138 where the hair's
  was a yaw -150 back:
  - the ponytail: the hairline round the new ear (a bald band at the temple and behind the ear before), the sideburn
    tip in front of it, the near tendril framing the face in front of the ear; from behind the hairline comes down the
    temple, round the sideburn, over the ear and behind it (a fin of jaw under a helmet before);
  - the lob: the near side really tucked behind the ear (hair showed in front of the ear before);
  - the crop: the faded sides' notch round the ear; the fringe's three points softened into one soft wave (no jagged
    tips); from behind the ear shows;
  - the flow: the notch round the ear, a short sideburn; from behind the left flick ends above the ear;
  - her long layers: the profile's skin triangle behind the jaw closed; from behind the fall drops from the temple
    BEHIND the cheek, so the cheek's line and the lash peek past it (the lost profile reads alive).
- **A bug in the faces round, repaired downstream:** every lash, lid and brow stroke ended in a NaN point
  (`people_v4/head.ts` PROF.lash: `Math.pow(1 - (t - 0.58) / 0.42, 1.05)` is the power of -2e-16 at t = 1), so the
  browser drew only half of each stroke (its upper edge and a chord). `asm_render.ts` puts the tip back and rejoins the
  loop; the one-line source fix (a `Math.max(0, ...)` clamp) is the faces round's.

## My look, beside the references
- **Clean:** yes. Every cut is a few smooth shapes; nothing is jagged; the hairlines now meet the ear and the nape on
  the new heads with no skin teeth, bald bands or fins; the cast shadow makes the hair sit ON the head.
- **Appealing / modern:** much nearer the bar than v3. The lob beside ref 03's bob has the volume, the side-swept swoop,
  the out-turned flips, the flyaway arcs, the gloss and the rim; ref 03 still wins on her face (big open eyes, a 3D
  painted finish) and on her hem's crisper flips. Her long layers frame a cute face; the open-eye variant reads more
  alive (the owner's pick). The men read manly (brow, jaw, neck) in clean current cuts.
- **Motion:** believable: the turn, the walk and the gust bend the same designed shapes and settle; the lob's flips and
  her fall read best; the cloud's give is small at strip size (as designed: curls hold).

## Still rough (honest) and the owner's calls
- **Your calls:** LASH or open eyes (01 row 3); brows on him (on by the faces round's default).
- **The wardrobe is not built on the v4 bodies:** everyone wears the fitted tee and slim trousers (her in her evening
  colours: a dark top, cream trousers), so the BEFORE wears her coat and the AFTER does not; hands are simple mittens
  and the stand is the relaxed default (the faces round's next build).
- **A turn swaps the face's drawing at 63 degrees** (a cut-out turnaround; the hair morphs, the face does not): fine at
  60 fps in the strip, a 4th face drawing (yaw ~-55) would smooth it if a film turns slowly.
- The crop's two short crown tips still flick up a little; the far curtain and the flyaways take a thin rim that can
  read as a line at 2x; the deep-skinned figures on the shared standing panel (02, middle) sit only ~2-10 L* from it
  (their busts above have their own lighter ground; in the scene the quay separates them).

## Rebuild (from `video/`, one at a time)
`node scripts/render-frames.mjs P4Before <dir> 0 --entry=src/entry-look-people-v4.tsx --concurrency=1` (also `P4Cast`,
`P4Motion`, `P4Scene`); the frame lands as `<dir>/f00000.png`, copied here under the names above. Code:
`video/src/look/people_dirs/hair_v4/` (`asm_people.ts` the figure, `asm_fit.ts` the seams, `asm_render.ts` the
writer, `asm_motion.ts` the strips' motions, `SheetsFinal.tsx` the stills; `hair.ts` gained `SWITCH` and `gloss`,
the hair round's own sheets unchanged).

## Log
- step 0: read the brief, both V4.md files, the evaluation, their stills, the refs (03, 05, the owner's crop) and
  hair_v2's 01 and 04; this file started.
- step 1: the assembly: one SVG writer for both rounds' parts (`asm_render.ts`), the figure builder (`asm_people.ts`:
  body() + head() + hair() on one head frame, the switch points aligned at 63 / 114 degrees), the light that joins
  them (the hair's soft cast shadow on the forehead, cheek, ear and nape; the head's shadow under the jaw; the rim on
  the shoulders as well as the hair; a contact shadow).
- step 2: the design desk (each cut on each v4 head at 620 px a skull, the nodes numbered): the seams found and redrawn
  in `asm_fit.ts` (the ear moved on the v4 heads; the hair round's back view was a yaw -150 back, the v4 head a real
  lost profile at -138; LONG's profile nape triangle); the lost profile's neck (the head's own).
- step 3: the motions on the v4 head track (`asm_motion.ts`); the four sheets (`SheetsFinal.tsx`, entry
  `entry-look-people-v4.tsx`, compositions P4Before / P4Cast / P4Motion / P4Scene).
- step 4: rendered and LOOKED: fixed the NaN lashes (downstream), M2's skin-coloured tee (read shirtless in the scene:
  now sage), the neck pop mid-turn (the body's neck kept), the rim reading as an outline on dark tops (top edges only),
  the gloss (stronger), the lost profile of her long hair (the cheek and the lash now peek), the value plan of the deep
  skins' busts; re-rendered; the contact sheet.
