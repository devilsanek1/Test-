export const meta = {
  name: 'v2r-l3-build-s3',
  description: 'L3: build V2S3 (her window) at finished quality with two parallel builders (far terrace, near + story)',
  phases: [{title: 'Build', detail: 'S3 FAR (sun, terrace, her window + silhouette, her towpath, canal) + S3 NEAR+STORY (bottom third, Pip, camera)'}],
}

const S = '/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad'

const PRE = (who, files) => `You are a BUILDER in lane L3 of video 2 ("One Small Window") for the short-form explainer channel "What's All the Fuss About?" (vertical 1080x1920 reels). The repo is /home/user/Test- (branch video-production, already checked out); the Remotion project is /home/user/Test-/video (run commands from there). The owner rejected our first production of this film; this rebuild must be FRESH, BEAUTIFUL and ALIVE like reference 1 and our v1, at FINISHED quality (final drawing, character animation, ambient life; no texture). Quality first, no limit on tokens: iterate until it is genuinely excellent, then keep going on the weakest spot.

You are the V2S3 ${who} builder. Your files: ${files}.

READ FIRST (fully, in this order):
1. video/docs/v2/lanes/plan_L3.md: THE build spec (the builders/files table, rules section 0, section 2 for V2S3).
2. video/docs/v2/TREATMENT.md: the locked direction: sections 1-3 (concept, world, palette, line, cast, Pip), section 5 (rows S2, S3, S4, the bottom third), section 8 (fairness), section 9 (acceptance bar).
3. video/src/v2r/world/map.ts: sections 1 (UI zones), 3 (shared spots: W2, W2_CUT), 7 (S2, S3), 8 (PIP, PIP_HOP_S2_S3), 9 (MATCHES).
4. video/src/v2r/scenes/V2S3_rig.ts (film seconds: V2S3.tsx wraps the shot in <TimeShift by={-S3_START}>, so useTime() inside is FILM time) and the current V2S3.tsx + V2S3_*.tsx stubs; the neighbouring shots for continuity: video/src/v2r/scenes/V2S2.tsx (lane L2: the wall, its push on W2 and Pip's hop into your shot) and V2S4_rig.ts (Pip's entry into V2S4).
5. The kit READMEs: video/src/v2r/kit/canal/README.md, video/src/v2r/kit/cast/README.md, video/src/v2r/kit/pip/README.md; video/src/v2r/palette.ts (CM tokens, INK_PX).
6. video/docs/look/LIFE_AND_DENSITY.md sections 0-2 (what full and alive means) and video/docs/v2/lanes/COMMON.md (hard rules; its Setup/Git/Review/Done sections are the orchestrator's, not yours).
7. The kit source you build on (kit/canal/terrace.tsx, towpath.tsx, water.tsx, boat.tsx, life.tsx, far.tsx, core.tsx; kit/cast People.tsx, Her.tsx (HerWindow), Extras.tsx (NearBack, WindowPerson); kit/pip PipTrack.tsx, motion.ts): read the functions you call.
If video/docs/v2/STYLE.md exists, read it too (the film's one style sheet) and follow it.

REFERENCES at 216 px wide (look at them BEFORE you start and beside every check; never commit them): reference 1 frames ${S}/ref1/r_002.png ... r_032.png, our v1 frames ${S}/v1/v_002.png ... v_055.png, contact sheets ${S}/ref1_sheet.png and ${S}/v1_sheet.png.

HOW YOU WORK:
- Edit ONLY your own files. Another builder is editing the other parts of V2S3 right now (and two more builders are on V2S4); you see their latest work when you render, which is how you judge the composite. Never edit, revert or git-checkout their files; never touch map.ts, palette.ts, the kits, lib/, the rigs, docs, or other lanes' scenes (V2S2.tsx is L2's).
- Write each file whole (Write) or with small Edits that keep it syntactically valid at every step: the others' renders bundle your file too. If a render fails because of someone else's file, wait a minute and retry.
- Render often (stills), LOOK at them (Read the PNG), compare at 216 px (convert in.png -resize 216x out.png, or montage beside the references) and at full size for drawing quality (lines, misregistration, believable objects, no glitches). Judge as the owner would: is every paused frame as full, specific and alive as v1 and reference 1? Fix, re-render, repeat.
- Preview (from /home/user/Test-/video; ALWAYS GL=angle / --gl=angle and --concurrency=2):
  GL=angle node scripts/render-frames.mjs Film2R-V2S3 <dir> 0.0,0.05,0.12,0.6,1.0,1.4,1.75,1.86 --entry=src/entry-v2r-film.tsx --scale=0.5   (SHOT-local seconds: 0 = film 12.98)
  GL=angle node scripts/render-frames.mjs Film2R <dir> 12.96,12.98,13.0,14.84,14.86 --entry=src/entry-v2r-film.tsx --scale=0.5   (FILM seconds: the cuts in context)
  npx remotion render src/entry-v2r-film.tsx Film2R-V2S3 <out>.mp4 --gl=angle --concurrency=2 --scale=0.5   then   python3 -I scripts/qa/density.py <out>.mp4 --cozy
  Use your own scratch dir ${S}/build_s3_${who.replace(/[^A-Za-z0-9]/g, '_')}/ . The machine (4 CPUs) is shared by 4 builders: prefer stills at --scale=0.5; render a full clip only a few times.
- Typecheck: npx tsc --noEmit -p . 2>&1 | grep -E "V2S3" (your files must be clean).
- Performance: a full 1080x1920 frame of the shot should render in about <= 1 s at --gl=angle: put many small things into the kit's Batch + Paint (one Fill per colour per layer), memoize static batches (useMemo), animate with few nodes.
- COMMIT your files at checkpoints (at least every ~20 minutes and at the end), ONLY your files:
  cd /home/user/Test- && git add <your files> && git commit -m "v2r L3 (S3 ${who.toLowerCase()}): <what changed>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_014PwCXJs9nWENkpKqVhHWMP"
  If git reports .git/index.lock, wait 5 s and retry (another builder is committing). NEVER git add -A, NEVER push, NEVER pull, NEVER switch branches, NEVER stash or reset.
- Keep plan_L3.md section 0 in EVERY frame: nothing in the caption band y 317-556 and y 290-600 flat sky (sun top >= 575, built tops >= 600, flyers at y >= 580, smoke clamped at 580-600); colour roles (teal only on her: her coat, HER door, HER window frame; orange only the sun disc; plum small; shadows as colour; only CM tokens); people small and simple (near heads <= ~140 px WIDE, no faces); feet that never slide; seconds + rng (no Math.random / Date); no zoom in a hold; no opacity / blur / gradient; fairness.
- The shot is 1.88 s long: a viewer must get its ONE thing at once ("Unlike the blinds, her window is open: she is the one talking"), so her lit window with her silhouette on the phone is the brightest, clearest read in the frame, and everything else is a rich, calm, alive evening around it.

WHEN DONE: typecheck clean, a final set of stills (full shot at 0.5 scale + 216 px versions), committed, and return the structured result (files, what you built, known gaps, requests: one exact line each for something only the orchestrator or another owner can change).`

const FAR = PRE('FAR', 'video/src/v2r/scenes/V2S3_terrace.tsx (exports S3Sun, S3Terrace, S3Canal) and any new helpers named video/src/v2r/scenes/V2S3_t*.tsx') + `

YOUR PART: V2S3 FAR (plan_L3.md section 2: the sky / sun, her terrace with her window and her silhouette, the neighbours, her towpath in front of the terrace, the canal). Everything in WORLD px at the 12.98 match (the camera is identity then; V2S3.tsx, owned by the NEAR+STORY builder, applies the 5 % ease-back and the float): draw over S3_BLEED (x -60..1160) so no edge ever shows. V2S3.tsx renders, back to front: S3Sun - S3Terrace - S3Canal - S3Near - S3Pip. Keep your exported names.
Build at finished quality:
- HER FRENCH WINDOW exactly at MAP.W2_CUT (centre (335, 785), 132.5 x 164.3: the window match with S2's W2, same spot, same size on the cut frame): teal frame (CM.hero), Juliet rail, the lamp-lit room inside (a standard lamp, shelves, plants on the sill: warm CM.lamp / CM.lampCore), the blind ROLLING UP over the first frames (from ~35 % down at 12.98 to fully rolled at the top by ~13.08, a small spring: S2's blinds came down, hers goes up: the story point), and HER silhouette inside (HerWindow, plum, phone at her ear, pacing x 290-380, feet y 862, h 140: >= 137 px at the match; gestureAt 14.28). Choose its phase so she is at the LEFT end around 14.70-14.80, where Pip's exit leap (14.70, up-left out through the left edge) passes the window. Her window box x 255-520, y 868-900 with plants (Pip lands at (462, 878) at 13.10: keep that spot clear; the plants may flinch at 13.10). Her TEAL door on the ground floor below-left of the window (fanlight, steps).
- THE TERRACE y 600-1100 (two storeys + mansard; tops >= 600): stock brick in several colours (never one slab), stucco ground floors here and there, a squat mansard with dormers, chimney stacks with pots and aerials (birds on the aerials; one or two lift), sash windows lit / unlit (sunset ~60 % lit, a few switching on), balconies with pots and STRING LIGHTS twinkling, window boxes, doors with fanlights and steps, area railings, a bike on the railings, bins, drainpipes, ivy or a climbing rose. TWO LIT NEIGHBOURS: kettle steam rising from one window (smoke/steam clamped at y >= 580), a neighbour watering a window box in another (the can tips, a few drops fall). WindowPerson / small figures only (never faces).
- THE LOW SUN AT LEFT (S3Sun): CM.sun, r ~46, about (96, 652), half-hidden by the terrace's west end (a lower end house or a gap with far roofs and the viaduct beyond), top >= 575, no ink.
- HER TOWPATH y ~1100-1130 (in front of the terrace): the coping, a lit heritage lamp, a bench, walkers both ways (small, ~90-110 px, K4 Person with honest walk rates), a cyclist.
- THE CANAL y ~1130-1260 (S3Canal): warm reflections of the lit windows broken in ripples, a heron on a mooring post (one head turn), two ducks, glints. (Our moored boat below, from y ~1260, is the NEAR builder's.)
QUALITY BAR: paused at 216 px beside v1 and reference 1 the terrace is as full, specific and warm as their streets (a new surface every few dozen px, several colours in every small patch, thin lines: aerials, railings, string-light wires, glazing bars); flat tiles <= 30 %; something moves in every frame (her pacing, steam, watering, lights, birds, walkers, the heron, ripples); her lit window with her silhouette is the clearest read.`

const NEAR = PRE('NEAR+STORY', 'video/src/v2r/scenes/V2S3_near.tsx (exports S3Near), video/src/v2r/scenes/V2S3_pip.tsx (exports S3Pip), video/src/v2r/scenes/V2S3.tsx (the integration and the camera), and any new helpers named video/src/v2r/scenes/V2S3_n*.tsx') + `

YOUR PART: V2S3 NEAR + STORY (plan_L3.md section 2: the bottom third, Pip, the camera). The FAR builder is building the terrace, her window and the canal right now (V2S3_terrace.tsx): judge your parts on the composite. In V2S3.tsx keep rendering, back to front: S3Sun - S3Terrace - S3Canal (the FAR builder's) - S3Near - S3Pip, inside ONE camera: identity at 12.98, then the rig's ease-back (s3Zoom about W2) and float (s3FloatDx). Everything in WORLD px at the match; draw over S3_BLEED (y up to 2010, x -60..1160) so no edge shows after the ease-back.
Build at finished quality:
- THE BOTTOM THIRD (S3Near, y ~1260-1920): our moored narrowboat cut by both edges, the SAME boat as V2S4's foreground boat (sage cabin, ONE plum gunwale stripe, cream portholes with curtains, warmly lit inside at sunset, a painted flower panel with NO lettering, herb pots, a folded bike, a coiled rope, a stove chimney with smoke rising (clamped at y >= 580), rope fenders): roof y ~1260-1330 dressed, cabin side y 1330-1580 never a flat slab (beading, vents, doors, portholes, the panel), the hull and a sliver of water; our coping (stone edge, a mooring ring with the boat's rope); our towpath y 1640-1920 (paving with joints, leaves, a drain); TWO walkers' head-backs cut by the bottom (NearBack, at most ~140 px WIDE each: a beanie, a cap; they cross slowly, one left, one right, bobbing); a lamp-post foot cut by the bottom-right (x ~860-960). Rich, never flat; life in every frame (smoke, curtains, herbs, the walkers).
- PIP (S3Pip; S3_PIP in the rig): it continues L2's hop at the match EXACTLY (PIP_HOP_S2_S3: world = screen at 12.98; size 106 = S2's 100 px Pip under S2's 1.06 push; seed 'pipS2' = S2's idle). Render Film2R at FILM 12.96, 12.97, 12.98, 12.99, 13.02 (full size crops) and compare Pip's screen position, size and pose across the cut with S2 (V2S2.tsx's PipS2, lane L2's): fix your side until the hop is continuous. It lands on her window box (462, 878) at 13.10 (a soft squash), settles facing us (frontLeft), turns to her on "she" (13.90-13.96: its ONE reaction; the head toward her silhouette), then at 14.70 crouches and leaps up-LEFT out through the left edge: on screen at 14.86 it is inside x 0-120, y 620-700 (measure on a full-size still), its ears never in the caption band (y <= 556), the arc at y >= 600. It must pass over her silhouette for at most ~2 frames (the FAR builder times her pacing to be at the left end then).
- THE CAMERA (V2S3.tsx): the rig's ease-back + float only. Check the match at 12.98: her window centre (335, 785), 132.5 x 164.3 on screen (full-size still), the same as S2's W2 on its last frame (render Film2R at 12.96).
QUALITY BAR: the bottom third is as full and specific as v1's near planes at 216 px (flat tiles <= 30 % overall), alive in every frame; Pip's hop across the match cut is seamless and its turn to her reads; the exit leap is a clean, fast up-left zip into the cut.`

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
const [far, near] = await parallel([
  () => agent(FAR, {label: 'build:S3-far', phase: 'Build', effort: 'max', schema: SCHEMA}),
  () => agent(NEAR, {label: 'build:S3-near+story', phase: 'Build', effort: 'max', schema: SCHEMA}),
])
return {far, near}
