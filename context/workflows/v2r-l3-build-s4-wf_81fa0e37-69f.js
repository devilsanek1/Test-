export const meta = {
  name: 'v2r-l3-build-s4',
  description: 'L3: build V2S4 (the walk home) at finished quality with two parallel builders (world, story)',
  phases: [{title: 'Build', detail: 'S4 WORLD (far, backs, towpath, canal, boat) + S4 STORY (post, plates, tag, her, Pip, camera)'}],
}

const S = '/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad'

const PRE = (who, files) => `You are a BUILDER in lane L3 of video 2 ("One Small Window") for the short-form explainer channel "What's All the Fuss About?" (vertical 1080x1920 reels). The repo is /home/user/Test- (branch video-production, already checked out); the Remotion project is /home/user/Test-/video (run commands from there). The owner rejected our first production of this film; this rebuild must be FRESH, BEAUTIFUL and ALIVE like reference 1 and our v1, at FINISHED quality (final drawing, character animation, ambient life; no texture). Quality first, no limit on tokens: iterate until it is genuinely excellent, then keep going on the weakest spot.

You are the ${who} builder. Your files: ${files}.

READ FIRST (fully, in this order):
1. video/docs/v2/lanes/plan_L3.md: THE build spec (the builders/files table, rules section 0, section 1 for V2S4).
2. video/docs/v2/TREATMENT.md: the locked direction: sections 1-3 (concept, world, palette, line, cast, Pip), section 5 (rows S3 and S4, the bottom third, texts on objects), section 8 (fairness), section 9 (acceptance bar).
3. video/src/v2r/world/map.ts: sections 1 (UI zones), 3 (shared spots), 7 (S3 / S4), 8 (PIP), 9 (MATCHES).
4. video/src/v2r/scenes/V2S4_rig.ts (film seconds: V2S4.tsx wraps the shot in <TimeShift by={-S4_START}>, so useTime() inside is FILM time) and the current V2S4.tsx + V2S4_*.tsx stubs.
5. The kit READMEs: video/src/v2r/kit/canal/README.md, video/src/v2r/kit/cast/README.md, video/src/v2r/kit/pip/README.md; video/src/v2r/kit/boards/WorldText.tsx and texts.ts (lettering); video/src/v2r/palette.ts (CM tokens, INK_PX).
6. video/docs/look/LIFE_AND_DENSITY.md sections 0-2 (what full and alive means) and video/docs/v2/lanes/COMMON.md (hard rules; its Setup/Git/Review/Done sections are the orchestrator's, not yours).
7. The kit source you build on (kit/canal/sets.tsx S4Set, far.tsx, terrace.tsx, towpath.tsx, water.tsx, boat.tsx, life.tsx, core.tsx; kit/cast People.tsx, Her.tsx, Extras.tsx, gait.ts; kit/pip PipTrack.tsx, motion.ts): read the functions you call.
If video/docs/v2/STYLE.md exists, read it too (the film's one style sheet) and follow it.

REFERENCES at 216 px wide (look at them BEFORE you start and beside every check; never commit them): reference 1 frames ${S}/ref1/r_002.png ... r_032.png, our v1 frames ${S}/v1/v_002.png ... v_055.png, contact sheets ${S}/ref1_sheet.png and ${S}/v1_sheet.png.

HOW YOU WORK:
- Edit ONLY your own files. Another builder is editing the other parts of V2S4 right now (and two more builders are on V2S3); you see their latest work when you render, which is how you judge the composite. Never edit, revert or git-checkout their files; never touch map.ts, palette.ts, the kits, lib/, the rigs, docs, or other lanes' scenes.
- Write each file whole (Write) or with small Edits that keep it syntactically valid at every step: the others' renders bundle your file too. If a render fails because of someone else's file, wait a minute and retry.
- Render often (stills), LOOK at them (Read the PNG), compare at 216 px (convert in.png -resize 216x out.png, or montage beside the references) and at full size for drawing quality (lines, misregistration, believable objects, no glitches). Judge as the owner would: is every paused frame as full, specific and alive as v1 and reference 1? Fix, re-render, repeat.
- Preview (from /home/user/Test-/video; ALWAYS GL=angle / --gl=angle and --concurrency=2):
  GL=angle node scripts/render-frames.mjs Film2R-V2S4 <dir> 0.05,1.0,2.4,3.1,4.0,5.0,5.6 --entry=src/entry-v2r-film.tsx --scale=0.5   (SHOT-local seconds: 0 = film 14.86)
  GL=angle node scripts/render-frames.mjs Film2R <dir> 14.84,14.86,14.88,20.53,20.55 --entry=src/entry-v2r-film.tsx --scale=0.5   (FILM seconds: the cuts in context)
  npx remotion render src/entry-v2r-film.tsx Film2R-V2S4 <out>.mp4 --gl=angle --concurrency=2 --scale=0.5   then   python3 -I scripts/qa/density.py <out>.mp4 --cozy
  Use your own scratch dir ${S}/build_${who.replace(/[^A-Za-z0-9]/g, '_')}/ . The machine (4 CPUs) is shared by 4 builders: prefer stills at --scale=0.5; render a full clip only a few times.
- Typecheck: npx tsc --noEmit -p . 2>&1 | grep -E "V2S4" (your files must be clean).
- Performance: a full 1080x1920 frame of the shot should render in about <= 1 s at --gl=angle: put many small things into the kit's Batch + Paint (one Fill per colour per layer), memoize static batches (useMemo), animate with few nodes.
- COMMIT your files at checkpoints (at least every ~20 minutes and at the end), ONLY your files:
  cd /home/user/Test- && git add <your files> && git commit -m "v2r L3 (S4 ${who.toLowerCase()}): <what changed>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_014PwCXJs9nWENkpKqVhHWMP"
  If git reports .git/index.lock, wait 5 s and retry (another builder is committing). NEVER git add -A, NEVER push, NEVER pull, NEVER switch branches, NEVER stash or reset.
- Keep plan_L3.md section 0 in EVERY frame: nothing in the caption band y 317-556 and y 290-600 flat sky (sun top >= 575, built tops >= 600, flyers at y >= 580); colour roles (teal only on her, orange only the sun disc, plum small, shadows as colour, only CM tokens); people small and simple (near heads <= ~140 px wide, no faces); feet that never slide; seconds + rng (no Math.random / Date); camspeed <= 7.5 px/frame for long flat moves; no opacity / blur / gradient; fairness.

WHEN DONE: typecheck clean, a final set of stills (full shot at 0.5 scale + 216 px versions), committed, and return the structured result (files, what you built, known gaps, requests: one exact line each for something only the orchestrator or another owner can change).`

const WORLD = PRE('WORLD', 'video/src/v2r/scenes/V2S4_far.tsx (exports S4Far = the 0.3x plane, S4Backs = the 0.6x plane), video/src/v2r/scenes/V2S4_path.tsx (exports S4Path = the 1.0x towpath plane rendering its `children` (the post) inside the plane after your props and walkers, and S4Canal = the 1.0x canal strip), video/src/v2r/scenes/V2S4_boat.tsx (exports S4Boat = our narrowboat, screen-fixed, plus the near water at 2.0x), and any new helpers named video/src/v2r/scenes/V2S4_w*.tsx') + `

YOUR PART: the V2S4 WORLD (plan_L3.md section 1: the layout bullets, everything except her, the post, the tag and Pip, which the STORY builder owns). V2S4.tsx (the STORY builder's) renders, back to front, inside ONE camera (the 6 % push about SUN1): SunDisc (fixed, at MAP.S4.sunAtPose) - S4Far - S4Backs - S4Path{post} - S4Her - S4Canal - S4Boat - S4Pip - S4Tag. Keep your exported names and their meaning. Each plane part slides ITSELF: wrap its drawing in <XG m={mat.translate(s4PlaneDx(S4_K.<plane>, t), 0)}> (t = useTime(), FILM seconds; lib/xf), drawn at the 17.96 pose (the post lands at x 575 when dx = 0). The path plane travels -310 -> 0 px, so draw each plane from x about -(k x 310 + 80) to 1160 so no edge ever shows.

FIRST (within ~15 minutes): port the kit's S4Set (video/src/v2r/kit/canal/sets.tsx) into your three files as a working v1 (same look as the kit sample, minus the kit's Pip slot and minus the placeholder fingerpost) and COMMIT it, so the STORY builder sees a world. THEN build it to finished quality:
- THE FAR BAND (0.3x and 0.6x, y ~600-860; every top at y >= 600): the sun at (250, 650) r 61.3 (V2S4.tsx draws it) is seen THROUGH a King's-Cross-like gasholder frame on the 0.3x plane: thin ink lattice + a few flat members so the disc reads through it, and it slides across the disc during the truck (a parallax cue). Far roof rows in 2-3 flat depth steps with chimney pots, aerials, rows of small windows (some warmly lit), the viaduct with a train crossing once, birds perched on the gasholder / aerials: at 19.80 (S4_BEATS.birdsWest) a flock of 6-9 lifts and flies WEST (left) into the sun, small plum silhouettes crossing the disc at y ~620-700. The terrace BACKS (0.6x) over garden walls: rear sash windows (a few warmly lit), back extensions, drainpipes, chimney stacks with smoke, a washing line flapping, a tree in autumn leaf with falling leaves, ivy, pigeons on a wall. No cats (Pip is the only mascot; birds, ducks, the heron, dogs are fine).
- HER TOWPATH (1.0x, y 860-1082): never flat paving (joints, patches, leaves, a drain, a manhole), garden walls / gates / railings at the back, heritage lamp posts (off: lowSun), a bench with a seated READER (page turn), planters, a bin, a parked bike, a lifebuoy on a post, mooring rings and bollards on the coping, an ANGLER sitting on the coping left of centre with a rod and a bobbing float. WALKERS with the K4 Person component directly (never the kit Movers' fixed walk rate): positions in PLANE coordinates, walk rates from their speed in the plane (strideFor(stepPx, h)); a westbound walker slower than her (it drifts right on screen and passes BEHIND her: draw it in the path plane, which is under her), a jogger westbound faster than her (overtakes her; keep it behind her too), a cyclist eastbound, someone walking a dog; heights ~140-160 px on the path, never teal, no two alike, none of them ever crossing in front of her or covering her. Long low-sun shadows fall to the EAST (screen right) under lamps, bench, people and planters, as colour (shadowInto with the light at SUN1).
- THE CANAL STRIP (1.0x, y 1082-1220): Water with ripples, glints and broken reflections of the walls and backs, two ducks swimming, the heron standing on the coping or a mooring post (one head turn), floating leaves.
- OUR NARROWBOAT (screen-fixed) = the bottom third: roof edge y ~1220 with roof dressing standing on it (herb pots whose herbs flutter, a folded bike, a coiled rope, a watering can, a mop and a boat pole, a lifebuoy, the stove chimney whose smoke rises to y >= 600). Pip sits at (470, 1218) (the STORY builder draws it): keep the roof clear around x 410-530, and nothing on the roof may reach above y ~1090 near her (x 640-800) so she is never covered. The cabin side y 1290-1660 in SAGE is never a flat slab: panel beading, brass mushroom vents, cream portholes with curtains that sway (a pot plant behind one), a painted flower panel (roses-and-castles spirit, NO lettering), side doors, ONE plum gunwale stripe, rope fenders hanging, a slate hull strip down to the waterline ~1700; cut by both edges. It is the same boat as V2S3's (moored in the flash-forward): sage cabin, plum stripe, cream portholes, flower panel, herb pots, bike, rope.
- THE NEAR WATER (2.0x, y 1700-1920): wake lines and ripples streaming right, floating leaves, the hull's broken reflection, glints; after the stop (17.96) the wake calms but the water never stops.
QUALITY BAR: paused at 216 px beside v1 and reference 1, every band below y 600 is full of specific, drawn things (flat tiles <= 30 %, no hole > 200 px, a new surface every few dozen px down any column, several colours in every small patch, thin lines: wires, rails, poles, rigging); the bottom third is a rich mass; something moves in every frame (>= 2 movers always, no dead run > 0.4 s); the truck's parallax reads clearly (far slow, near fast) at <= 7.5 px/frame for flat planes; the sky above y 600 stays flat.`

const STORY = PRE('STORY', 'video/src/v2r/scenes/V2S4_post.tsx (exports S4Post, drawn in PLANE coordinates inside S4Path), video/src/v2r/scenes/V2S4_tag.tsx (S4Tag), video/src/v2r/scenes/V2S4_her.tsx (S4Her), video/src/v2r/scenes/V2S4_pip.tsx (S4Pip), and video/src/v2r/scenes/V2S4.tsx (the integration and the camera)') + `

YOUR PART: the V2S4 STORY (plan_L3.md sections 1b-1e). The WORLD builder is building the set right now (it ports the kit set into V2S4_far/path/boat first, ~15 min, then enriches it): judge your parts on the composite. In V2S4.tsx keep importing the world parts by name and in this order: SunDisc - S4Far - S4Backs - S4Path{S4Post} - S4Her - S4Canal - S4Boat - S4Pip - S4Tag; you own the camera (the 6 % push about SUN1, s4Zoom; no other camera move) and the order of your own parts.
- THE POST AND PLATES exactly per plan section 1b (contract rects map.ts S4.post / plateDec2025 / plateApr2026; lettering TXT_PLATES via WorldText in pen mode: keys 56 px with faux weight ~0.9, body 31 px, credits 18 px). On each build the plate face grows out from the post to the arrow tip (fill first, ~0.12 s, a small overshoot), its edge inks, then the lines pen; DEC at 18.92, APR 19.45 -> complete on "heading" 19.80. A heritage look: a slim post (plum CM.anchor or the warm CM.line) with a finial and a plinth, plate brackets; plates paper (CM.paper) with a plum keyline and ink lettering. The plates must READ at 216 px wide (render a 216 px still and check DEC 2025 / APR 2026 and the body lines) and the credits at ~390 px wide.
- THE TAG per plan section 1c (TXT_NAME_TAG; card x 594-876; build 1 at 15.07 y 600-764; build 2 at 16.60 grows to ~870; two-line credit; a thin ink leader to her head S4_HER_HEAD; pops off at 18.80). No text in the right rail (x > 780 below y 840). Paper card, a loose ink outline, crisp lettering; the builds are lively (a pop, a quick pen) but never jittery.
- HER per plan section 1 (Her: pose walk, view profile, step = s4HerSteps(t), stride = strideFor(62, 170), x 720, feet 1070, 170 px): her steps slow with the truck and she comes to rest at 17.96 into stopLook (head lifted, looking west along the plates). Make the walk -> stand switch clean (no pop of the whole figure; a tiny settle is fine). Never a protest gesture; she never touches the post. She is the only teal in the frame.
- PIP per plan section 1d (S4_PIP in the rig): the in-leap is mid-air at the cut inside the MATCHES rect (x 520-640, y 940-1060 at film 14.86) and LEFT of her, never over her; the landing squash at 14.95 on the boat roof; it rides (bob + roll) and watches her while she walks and the tag builds; at 19.55 it turns west (facing left: its ONE reaction, leading "heading"); at 20.25 it leaps toward the sun: at 20.55 on screen its body overlaps the sun disc's lower right, its ear tips stay below y 556 and the arc never rises above y 600. It never covers her or the plates' lettering.
- THE CUTS: render Film2R (FILM seconds) at 14.84, 14.86, 14.88 (S3 -> S4: Pip leaves V2S3 up-left through the left edge; it enters V2S4 descending down-left; V2S3 is being rebuilt by other builders right now, so judge only your side) and at 20.53, 20.55, 20.57 (the sun match into V2S5: SUN1 must be exactly (250, 650) r 65 on screen at 20.55 in both shots: measure it on a full-size still).
QUALITY BAR: with the sound off at 216 px a viewer gets who she is (the tag), that she stops by the post, the two dated plates (unclassified -> classified), and Pip leading west into the sun. Lettering crisp, plates believable, her walk natural (planted feet), Pip charming and alive (its idle never stops).`

const SCHEMA = {
  type: 'object',
  properties: {
    files: {type: 'array', items: {type: 'string'}},
    summary: {type: 'string'},
    done: {type: 'array', items: {type: 'string'}},
    gaps: {type: 'array', items: {type: 'string'}},
    stills: {type: 'array', items: {type: 'string'}},
    requests: {type: 'array', items: {type: 'string'}},
  },
  required: ['files', 'summary', 'done', 'gaps', 'stills', 'requests'],
}

phase('Build')
const [world, story] = await parallel([
  () => agent(WORLD, {label: 'build:S4-world', phase: 'Build', effort: 'max', schema: SCHEMA}),
  () => agent(STORY, {label: 'build:S4-story', phase: 'Build', effort: 'max', schema: SCHEMA}),
])
return {world, story}
