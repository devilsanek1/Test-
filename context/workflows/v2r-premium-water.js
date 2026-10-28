export const meta = {
  name: 'v2r-premium-water',
  description: 'Redesign the canal water as one shared premium component (research, two judged candidates on S1, build, look clip v6, critic)',
  phases: [
    { title: 'Ground', detail: 'pro research on premium 2D water + diagnosis of v5 water + a study seam on S1' },
    { title: 'Candidates', detail: 'two competing water treatments on S1 (true reflection vs designed editorial)' },
    { title: 'Judge', detail: 'fresh-eyes pick + grafts + must-fixes' },
    { title: 'Build', detail: 'lib/water.tsx + WATER.md, S1 swapped, look clip v6 master + sheets' },
    { title: 'Critic', detail: 'art director on v6 vs v5, then one fix round' },
  ],
}

const COMMON = `
CONTEXT (read carefully; you are one agent in a small workflow run by the video-2 orchestrator):
- Repo /home/user/Test- (Remotion project in video/), branch video-production. The repo is PUBLIC: never write emails, keys or tokens anywhere.
- Video 2 "One Small Window" (1080x1920, 60 fps). Scene 1 (S1, 0-6.13 s, the canal at an October evening, palette "10 Canal Mint") was approved by the owner as the look (G4 look clip v4, then v5 with particles: video/deliverables/v2/v2r_G4_look_v5.mp4).
- The owner on v5's WATER (quote, this is the brief): "I don't like the water too much, leafs are great" ... "It's just looking way too cheap, not clean or premium quality or refined. Just lazy and cheap. I mean that about the water."
  What v5's water is: a flat mint band with box-shaped beige reflection patches, scattered white dashes and four-point star sparkles. Everything else in the look is approved and must not change.
- Doc order (owner's words win): video/docs/OWNER_PLAYBOOK.md (its depth/particles/water rule) > video/docs/look/DIRECTION.md > video/docs/look/CRAFT.md (§f depth, §g sky, "Failures the eye catches first") > the rest. Also read src/lib/DEPTH.md, src/lib/SKY.md, src/lib/LIGHT.md as needed.
- Hard style rules: flat colour, clean edges, the clean pen (src/lib/pen.ts, src/lib/tier.tsx). NO blur, NO glow, NO gradients, with ONE exception decided for this job: water may reflect the shot's own sky preset (the same one sky via src/lib/sky.tsx, compressed, toned toward the water, dithered the same way) because that is the sky's own gradient seen in the water; nothing else gradates. Calm motion (alive but calm), deterministic per frame (seeds, @remotion/noise; never Math.random or Date). 60 fps.
- KEEP untouched: the leaves and the near motes (the owner: "leafs are great"), the people, Pip, the sky, the buildings, captions. The sun-path glints (the four-point sparkle field in src/v2r/scenes/V2S1_particles.tsx) belong to the water design now: the water may replace them with its own glitter.
- Water sites in the film (the shared component must later serve all): S1Water in src/v2r/scenes/V2S1_set_life.tsx (~l.155-220); the kit Water in src/v2r/kit/canal/water.tsx; S2's src/v2r/scenes/V2S2_Water.tsx; S4 / S8 water in src/v2r/kit/canal/sets.tsx; S5's river (src/v2r/scenes/V2S5*.tsx, April morning). Other sessions (lanes L2-L6) are editing those other scenes right now: do NOT edit their files; only S1's files and the files this brief names.
- Render recipes: video/docs/v2/lanes/report_L1_look.md (its v5 section: the master render via scripts/render-media.mjs --master, the phone test scripts/qa/particles_phone.py, the checks). The machine has 4 CPUs and another agent may render at the same time: render only the frames you need (stills via npx remotion still), contact sheets at 0.5 scale, view at most ~10 images yourself.
- Git: other sessions push to this branch every few minutes. Commit ONLY your own paths (git add <paths>, never -A or .), then: for i in 1 2 3 4; do git fetch -q origin video-production && git merge -q --no-edit origin/video-production && git push -q origin video-production && break; sleep $((2**i)); done. End every commit message with these two lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ
- Any agent you start runs at max effort (the Agent tool's effort: "max"). Prefer doing the work yourself.
- Your FINAL message is read by the orchestrator: keep it short (the lines asked for), put details in the files you write.
`

phase('Ground')
const [research, seam] = await parallel([
  () => agent(`${COMMON}
YOUR JOB: research how premium 2D / flat vector illustration and motion-design studios draw calm city water (a canal or river at an evening and at a morning), and turn it into rules we can build. Use web search (several searches, real sources: illustrators and studios known for refined flat work, motion-design breakdowns, animation layout/background books, SVG technique articles).
Cover: what makes flat water read CHEAP vs PREMIUM (name the cheap tells: box patches, random dashes, star sparkles, a flat band with no reflection, ...); reflections (a compressed mirror of what stands above, toned toward the water; simplified masses; lit windows as vertical streaks; how ripples break a reflection into horizontal slices; how much detail survives); the Fresnel tone structure (far water mirrors more sky, near water shows the body); the bank/quay contact line and its shade; ripple lines (tapered, sparse, spaced by perspective); the sun's glitter path (tapered horizontal slivers that shimmer, its width and taper by distance); wakes behind a duck or boat (a clean V); MOTION (slow drift speeds in px/s at 1080 wide, shimmer cycles, what stays still); the colour relations in numbers where you can (L* steps between sky, reflection and water body).
Then the IMPLEMENTATION in SVG/React/Remotion, deterministic per frame: options to mirror the real set (re-render the plane components flipped and clipped, SVG <use> of a group, strip slicing with per-strip offsets) vs drawing simplified reflection shapes from a list; per-frame render cost of each (filters like feDisplacementMap are slow and blur-like: say whether any is acceptable); how to keep it one shared component that S1, S2, S3/S4 (canal), S5 (an April-morning river) and S8 (canal) can all feed with their own geometry.
WRITE video/docs/look/research/2026-10-28_water.md: sources (titles + URLs), 10-14 concrete rules with numbers, the cheap-vs-premium list, the implementation options with costs, your recommendation. Commit + push it.
FINAL MESSAGE (max 15 lines): the path, the 6 rules that matter most, your implementation recommendation.`, {label: 'research: premium 2D water', phase: 'Ground', effort: 'max'}),
  () => agent(`${COMMON}
YOUR JOB (three parts):
1) DIAGNOSE v5's water. Extract frames at 1.0, 2.5, 3.8 and 5.0 s from video/deliverables/v2/v2r_G4_look_v5.mp4 (ffmpeg), crop the water at 1:1 and look at the whole frame at 360 px wide. Read S1Water (src/v2r/scenes/V2S1_set_life.tsx), the glint field (src/v2r/scenes/V2S1_particles.tsx) and the kit Water (src/v2r/kit/canal/water.tsx). List exactly what reads cheap and why (shape, edge, colour, motion, logic: e.g. reflections that do not match what stands above them).
2) DOCUMENT S1's water geometry for two designers who will each draw a new water: the water region (y0/y1, the far quay edge and our near edge as functions of x if not straight), the camera (groundCam: horizon, vanishing point), every object above the water that should reflect (the Google building and its lit windows, the far row, the tower, the bridge, boats A/B, the duck and its path, bollards, people on the far quay), the sun (SUN0 position/radius in src/v2r/world/map.ts) and its time, the sky preset (src/v2r/world/skies.ts S1_EVENING, S1_AIR, S1_HORIZON), the light rig (src/v2r/world/rigs.ts, TINT_CANAL.water), the palette keys for water (src/v2r/palette.ts), the parallax float (V2S1_float.tsx: the water's plane share) and which S1 timeline events touch the water (floods, pen draw-in at frame 0: the water must draw in with the scene).
3) BUILD A STUDY SEAM so two designers can each work in ONE file without touching shared code: in V2S1_set_life.tsx export a React context (e.g. S1WaterSlot: React.FC<{t:number}> | null, default null) that S1Water checks first and renders instead of its own body when set; in V2S1_particles.tsx a context (e.g. S1GlintsOff: boolean, default false) that hides only the glint field. With the contexts unset, the S1 render must be BYTE-IDENTICAL (prove it: render the same 3 frames before and after, compare PNG hashes). Create src/v2r/water_study/candA.tsx and candB.tsx as stubs (each exports a component CandWater, returning null for now, plus a const GLINTS_OFF = false) and src/entry-v2r-waterstudy.tsx registering three compositions (WaterStudyBase = S1 as is; WaterStudyA / WaterStudyB = S1 wrapped in the providers with candA / candB) covering S1's 0-6.13 s at 60 fps, same size as the film. Typecheck (npx tsc --noEmit -p video).
WRITE video/docs/v2/water/DIAGNOSIS.md: the cheap list, the geometry, the seam (how to render a still and a 2 s clip of WaterStudyA/B, exact commands), the byte-identical proof. Commit + push the seam files and the doc.
FINAL MESSAGE (max 15 lines): the doc path, the top cheap tells, the render commands, the proof result.`, {label: 'diagnose v5 water + study seam', phase: 'Ground', effort: 'max'}),
])
log('ground done')

const CAND = (id, file, approach) => `${COMMON}
INPUTS (read first): the research video/docs/look/research/2026-10-28_water.md and the diagnosis video/docs/v2/water/DIAGNOSIS.md (geometry, the study seam, the render commands).
Research summary from its author: ${String(research).slice(0, 2500)}
Diagnosis summary from its author: ${String(seam).slice(0, 2500)}

YOU ARE DESIGNER ${id}. Another designer is drawing a competing water at the same time; a judge will pick one by the owner's words: CLEAN, PREMIUM, REFINED, never lazy or cheap; reads as water at phone size; sits in the approved look (palette, light, depth, calm).
YOUR APPROACH: ${approach}
WORK ONLY IN: src/v2r/water_study/${file} (+ helper files named src/v2r/water_study/cand${id}_*.ts(x) if needed). Export CandWater (the S1 water, drawn in the same z-slot as S1Water: it gets the frame time) and GLINTS_OFF (true if your water draws its own glitter and the old glint field must go). Never edit shared files or the other candidate's.
DRAW IT LIKE A BUILDING, not a fill: every reflection logically matches what stands above it (positions mirrored about the waterline under the one camera), tone steps in flat colour (the reflected sky may carry the sky's own gradient), clean pen edges, perspective (ripple spacing and glitter width by distance), the quay contact line, the duck's wake, a glitter path under the sun if the sun shows. Motion: slow, calm, alive (state the speeds); the water draws in with the scene at frame 0 (the pen draw-in). Deterministic.
RENDER (into video/out/water_study/cand${id}/, gitignored): full-res stills of WaterStudy${id} at 1.0, 2.5, 3.8 and 5.0 s; a sheet of those 4 at 0.5 scale; the same 4 at 360 px wide (phone); 1:1 crops of the water; a motion strip of 10 frames at 6-frame steps around 3.0 s (water crop only); the render time per frame vs WaterStudyBase. Look at them yourself, critique once against the owner's words, the cheap tells in the research, DIRECTION and CRAFT; fix; re-render.
WRITE video/docs/v2/water/cand_${id}.md: what it is, why it reads premium, the numbers (tones as hex + L*, sizes, speeds), render cost, and an API sketch for a shared lib component the other scenes could feed (S2/S3/S4/S8 canals, S5's April river). Copy the 0.5 sheet and the phone sheet into video/docs/v2/water/cand_${id}_sheet.jpg and cand_${id}_phone.jpg (JPEG, each <= 400 KB). Typecheck your files. Commit + push your files only.
FINAL MESSAGE (max 12 lines): the files, the 4 choices that make it premium, render cost, anything you are unsure about.`

phase('Candidates')
const cands = await parallel([
  () => agent(CAND('A', 'candA.tsx', `"TRUE REFLECTION": mirror the real set. Re-draw S1's actual planes above the water (the Google building, the far row, the tower, the bridge, the boats, the duck, the far quay life) flipped and compressed about the waterline and clipped to the water, toned toward the water colour by a Fresnel structure (far water lighter, mirroring more sky; near water darker, the body), broken into horizontal ripple slices with slow, small sine offsets, plus sparse tapered ripple lines, a glitter path of tapered slivers under the sun, the quay contact line and the duck's V wake. Reuse the existing set components where you can (mind render cost: measure it).`), {label: 'candidate A: true reflection', phase: 'Candidates', effort: 'max'}),
  () => agent(CAND('B', 'candB.tsx', `"DESIGNED EDITORIAL": a graphic, simplified reflection in the manner of refined editorial / poster illustration. Each mass above becomes a clean simplified reflection shape (the Google facade as a toned block, lit windows as warm vertical tapered streaks, the tower and the far row as calm vertical shapes), broken by a few horizontal gaps; a two- or three-step flat tone structure (far mirrors the sky, near shows the water body); long tapered ripple lines in perspective (sparse, two tones); the sun's glitter as nested tapered horizontal slivers; the quay contact line; the duck's clean V wake. Fewer, better shapes: every one designed.`), {label: 'candidate B: designed editorial', phase: 'Candidates', effort: 'max'}),
])
log('candidates done')

phase('Judge')
const VERDICT = {
  type: 'object',
  properties: {
    winner: {type: 'string', enum: ['A', 'B']},
    why: {type: 'string'},
    scores: {type: 'object', properties: {A: {type: 'number'}, B: {type: 'number'}, v5: {type: 'number'}}, required: ['A', 'B', 'v5']},
    grafts: {type: 'array', items: {type: 'string'}},
    mustFix: {type: 'array', items: {type: 'string'}},
    shippable: {type: 'boolean'},
  },
  required: ['winner', 'why', 'scores', 'grafts', 'mustFix', 'shippable'],
}
const verdict = await agent(`${COMMON}
YOU ARE THE JUDGE, fresh eyes: an art director for a premium animation studio. Two designers drew a new water for S1. Their notes: video/docs/v2/water/cand_A.md and cand_B.md; their sheets: video/docs/v2/water/cand_A_sheet.jpg, cand_A_phone.jpg, cand_B_sheet.jpg, cand_B_phone.jpg; v5 (the baseline the owner called cheap): extract the same frames (1.0/2.5/3.8/5.0 s) from video/deliverables/v2/v2r_G4_look_v5.mp4. Render anything else you need (DIAGNOSIS.md has the commands; full-res crops of the water from WaterStudyA / WaterStudyB; a motion strip).
Designer A said: ${String(cands[0]).slice(0, 1500)}
Designer B said: ${String(cands[1]).slice(0, 1500)}
Score each 0-10 (and v5) on: CLEAN, PREMIUM, REFINED (the owner's words) at 1:1 and at 360 px wide; reads as water at a glance; reflections logical under the one camera; sits in the approved look (palette, light, depth, calm, nothing else changed); motion calm and alive; render cost; how well it becomes ONE shared component for the other scenes (S2/S3/S4/S8 canals, S5's April river). Be honest: if neither is clearly premium, say shippable=false and what is missing.
Pick the winner; list grafts (specific ideas from the loser worth bringing over) and the winner's must-fixes (max 6, concrete, measurable). WRITE video/docs/v2/water/JUDGE.md with the scores, the reasons and the lists; commit + push it.`, {label: 'judge: A vs B vs v5', phase: 'Judge', schema: VERDICT, effort: 'max'})
log(`judge: ${verdict ? verdict.winner + ' (A ' + verdict.scores.A + ' / B ' + verdict.scores.B + ' / v5 ' + verdict.scores.v5 + ')' : 'no verdict'}`)
if (!verdict) return {error: 'judge failed', research, seam, cands}

phase('Build')
const build = await agent(`${COMMON}
YOU ARE THE BUILDER. The judge picked candidate ${verdict.winner} (video/docs/v2/water/JUDGE.md; the winner's code in src/v2r/water_study/cand${verdict.winner}.tsx, notes in cand_${verdict.winner}.md; research video/docs/look/research/2026-10-28_water.md; geometry and seam: video/docs/v2/water/DIAGNOSIS.md).
Why: ${verdict.why}
Grafts to bring over: ${JSON.stringify(verdict.grafts)}
Must-fix: ${JSON.stringify(verdict.mustFix)}
DO:
1) Promote the winner to ONE shared component: src/lib/water.tsx (the shot feeds it its geometry: water region and edges, the camera, the reflection sources (objects above, with colours / lit windows), the sun and its glitter, the shot's sky preset and air, the light rig's water tint, a seed, the tier), with a lint like the others (e.g. waterProblems: no reflection outside its source's mirrored footprint, glitter only under the sun, speeds inside CRAFT's calm limits, the draw-in at frame 0). Apply the grafts and must-fixes.
2) Use it in S1: S1Water's body becomes the lib call; if the winner set GLINTS_OFF, remove the old glint field from V2S1_particles.tsx (leaves and motes unchanged). Remove the study seam (the contexts), src/entry-v2r-waterstudy.tsx and src/v2r/water_study/ (the loser lives on only in JUDGE.md). Typecheck.
3) Docs: src/lib/WATER.md (the API, the numbers, a recipe per scene: S2/S3/S4/S8 canal at evening, S5's April-morning river); CRAFT.md gets a short §f.7 Water (the rules with numbers, linking the research); the lanes' page video/docs/v2/lanes/RESUME_2026-10-28.md gets a "Water" bullet (use lib/water.tsx, recipe in WATER.md). Keep every doc consistent with DIRECTION (the reflected-sky exception as stated above; add it to DIRECTION rule 6's sentence in a few words).
4) Render the G4 look clip v6 as the MASTER (same recipe as v5: report_L1_look.md): video/deliverables/v2/v2r_G4_look_v6.mp4, its _sheet.jpg and _phone.jpg (scripts/qa/particles_phone.py), plus video/deliverables/v2/v2r_G4_look_v6_water_vs_v5.jpg (same 3 frames, v5 left / v6 right: the water at 1:1 crop and the whole frame at 360 px). Run the checks on the master: particle lint, water lint, check_depth, check_banding (open sky AND the water if it carries the reflected sky), check_light with S1's sky key. Prove nothing outside the water (and the removed glints) changed: a pixel-diff mask of v5 vs v6 at 3 frames.
Commit + push in steps (code, docs, renders).
FINAL MESSAGE (max 15 lines): the files, the checks' numbers, the diff-mask result, render cost per frame, anything left open.`, {label: 'build lib/water + S1 + look clip v6', phase: 'Build', effort: 'max'})
log('build done')

phase('Critic')
const CRIT = {
  type: 'object',
  properties: {
    premium: {type: 'number'},
    phoneRead: {type: 'string'},
    mustFix: {type: 'array', items: {type: 'string'}},
    niceToHave: {type: 'array', items: {type: 'string'}},
    outsideWaterChanged: {type: 'boolean'},
    readyForOwner: {type: 'boolean'},
  },
  required: ['premium', 'phoneRead', 'mustFix', 'niceToHave', 'outsideWaterChanged', 'readyForOwner'],
}
const critic = await agent(`${COMMON}
YOU ARE A FRESH-EYES ART DIRECTOR (you did not design or build this). The owner called v5's water "way too cheap, not clean or premium quality or refined, just lazy and cheap". The new water: video/deliverables/v2/v2r_G4_look_v6.mp4 (+ _sheet.jpg, _phone.jpg, _water_vs_v5.jpg), the code src/lib/water.tsx, docs src/lib/WATER.md and video/docs/v2/water/JUDGE.md. Extract your own frames (ffmpeg) at 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 s and a 10-frame motion strip around 3 s; look at 1:1 water crops and the whole frame at 360 px wide.
Builder's note: ${String(build).slice(0, 2000)}
Judge: would a premium studio's art director sign this water off? Is it CLEAN, PREMIUM, REFINED; does it read as water at phone size; are the reflections logical under the one camera; is the motion calm and alive (no jitter, no strobing slices, no popping at loop points); does it sit in the approved look; did anything outside the water change (the leaves, motes, people, Pip, sky, buildings, captions)? Max 6 must-fixes, concrete and measurable, ranked; nice-to-haves separately. Write video/docs/v2/water/CRITIC.md; commit + push it.`, {label: 'critic: v6 water', phase: 'Critic', schema: CRIT, effort: 'max'})
log(`critic: premium ${critic ? critic.premium : '?'}; must-fix ${critic ? critic.mustFix.length : '?'}`)

let fix = null
if (critic && (critic.mustFix.length > 0 || critic.outsideWaterChanged)) {
  fix = await agent(`${COMMON}
YOU ARE THE FIXER for the new water (src/lib/water.tsx, S1's use of it; docs src/lib/WATER.md; the critic's notes video/docs/v2/water/CRITIC.md).
Must-fix (do all, in order): ${JSON.stringify(critic.mustFix)}
${critic.outsideWaterChanged ? 'ALSO: the critic found changes OUTSIDE the water; restore everything outside the water to v5 exactly (prove it with the pixel-diff mask).' : ''}
Nice-to-have (only if cheap and clearly better): ${JSON.stringify(critic.niceToHave)}
Then re-render the G4 look clip v6 IN PLACE (same files: video/deliverables/v2/v2r_G4_look_v6.mp4 master, _sheet.jpg, _phone.jpg, _water_vs_v5.jpg), re-run the checks (particle + water lints, check_depth, check_banding, check_light, the diff mask), update WATER.md / CRITIC.md (a "fixed" line per item), typecheck, commit + push.
FINAL MESSAGE (max 10 lines): what changed per must-fix, the checks' numbers.`, {label: 'fix: critic must-fixes', phase: 'Critic', effort: 'max'})
}

return {
  research: String(research).slice(0, 1500),
  seam: String(seam).slice(0, 1200),
  candA: String(cands[0]).slice(0, 1000),
  candB: String(cands[1]).slice(0, 1000),
  verdict,
  build: String(build).slice(0, 2000),
  critic,
  fix: fix ? String(fix).slice(0, 1500) : null,
}
