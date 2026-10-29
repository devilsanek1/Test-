export const meta = {
  name: 'hook-build',
  description: 'Build the chosen hook changes in S01/S02/S03 in parallel, then one independent hook review of 0-10 s and one fix round per flagged scene',
  phases: [
    { title: 'Build', detail: 'S01, S02, S03 builders in parallel' },
    { title: 'Review', detail: 'one hook reviewer over 0-10 s' },
    { title: 'Fix', detail: 'flagged scenes only' },
  ],
}
const ROOT = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/hookbuild'
const BASE = `Project ${ROOT} (Remotion 4 + React + TS): a 55 s vertical (1080x1920, 30 fps) hand-drawn ink explainer for TikTok/Reels, comp "Main" (scenes S01-S12 + paper edges + sky captions). GOAL NOW: make the first 10 s as hook-powerful as possible; the first 2 s and 5 s matter most. House style: hand-drawn ink, flat misregistered fills, NO opacity fades (things pop/draw/exit), every beat on its word (assets/timing.json word starts), captions are drawn by the engine in the sky band y 280-570, which must stay calm sky behind the text (nothing new may draw into it).
Tools: node scripts/render-frames.mjs <Comp> <dir> <t1,...> --scale=0.5 --concurrency=2 (Main = full film in film seconds; SNN = clean scene in scene-local seconds); QA gate: bash scripts/qa/run_all.sh SNN; npx tsc --noEmit -p . . Machine: 4 CPUs shared by 3 agents: concurrency <= 2, half res for strips. Work in ${SCR}/<scene>/. Do not commit. Read only what you need: the scene's code, the top of docs/scenes/SNN.md, assets/timing.json for the words you touch.`
const S01 = `${BASE}
YOU OWN S01 (src/scenes/Scene01.tsx, src/scenes/scene01/**). Do NOT edit other scenes except as stated, src/lib, src/data or audio.
Build:
(A) POWER PRESSES + SHUTDOWN RINGS (0-1.5 s; today 0.25-1.0 s is a near-freeze where a scroller decides). The power-button sun (scene01/dressing.tsx SunPress / SunRipple, sun ~screen (720,900)) PRESSES (glyph 1 -> 0.9 -> 1 over ~0.08 s) and each press emits a shutdown RING expanding from the sun across the plaza: generalise SunRipple (r0, r1, dur, out(quad)); each ring a ~6 px cream band with 2 px ink edges, drawn above the facades and ground, under the 'near' layer, CLIPPED to screen y >= 590 (never in the caption band), thinning to ~40 % width and popping off on its last frame (no fade). Rings must ARRIVE on their events: ring 1 on 'Governments' (emit 0.19, r155 -> ~r640 in ~0.30 s, sweeping the crowd as heads turn at 0.34); ring 2 reaching govA's screen ON 'all' 0.63 (crtA); ring 3 reaching govC's screen ON 'over' 0.885 (crtC); ring 4, the big one, on 'Europe' 1.155 sweeping across the far civic skyline as it steps dark (1.155-1.455). Fit emit times / radii so each ring crosses its target on the word.
(B) A SECOND CAMERA PUNCH on 'Governments' (scene01/camera.ts): split today's punch into the click (0 -> 0.12 s, x1.025, out(cubic)) and a punch landing with ring 1 (0.19 -> 0.36 s, x1.035, out(cubic)); keep the creep reaching zoom 1.16 by the dive. Keep the existing slam jolts.
(C) 'on PURPOSE' (3.955, the hook's most stressed word; today the stillest frames): govB's 'back soon' tag much bigger (S01 tag size ~124 -> ~210 so its lettering reads >= 40 px on screen), hung ON the shutter slats (string up to the shutter box), clear of the padlock (~452,1096) and the door lock box (543,1318); it swings on during 'on' (~3.70) and SLAPS flat against the shutter ON 3.955. Camera: a +4 % punch about the push anchor landing ON 3.955 (out(cubic) from ~3.84) plus a jolt entry [3.955, 8 px]; keep the camera moving after it (a small creep) into the dive so 3.96-4.38 is never still.
HARD CONSTRAINTS (verify each with renders and numbers in your report):
1. Frame 0 unchanged and the LOOP SEAM intact: render Main at 0 and 55.3333; their pixel difference below y 600 must be 0. Everything new starts after frame 0.
2. The S01 -> S02 matchcut still lands: the dive math in camera.ts must use the ACTUAL push matrix at B.dive (P0 = the lock box's screen point there; CAM.dive.z = 3.19 / zoom at B.dive) so govB's lock box lands where S02 picks it up; compare full-res Main f141 vs f142 around (560,1150): the lock may not jump more than ~10 px and must keep growing ~1.2x per frame across the cut. Pip's exit leap into S02 (f135-f145) must stay continuous.
3. S12 rewinds onto S01's opening: if S12 reuses S01 parts, check S12's last second still ends exactly on frame 0 (constraint 1 covers it).
4. QA gate S01 passes; tsc clean; caption band clean (nothing new above y 590).
Final message (max 15 lines): what you built with exact event times (for the sound lane: list each new audible event: press/ring times, the PURPOSE slap), the seam diff, the f141/f142 lock numbers, QA result.`
const S02 = `${BASE}
YOU OWN S02 (src/scenes/Scene02.tsx, src/scenes/scene02/**). Do NOT edit other scenes, src/lib, src/data or audio.
Build:
(A) 'bug' HITS (5.305 film, stress 0.96, the topic word; today S02's camera stalls exactly there): in scene02/camera.ts add a punch: +6 % log zoom about the lock's screen point (560,1150), 0.10 s out(cubic) from 5.205 landing ON 5.305, plus a ~5 px decaying vertical jolt; take the same 6 % out of the K1 -> K2 creep so camAt(end) is IDENTICAL to today (S03 hand-off). Bit's peek (~5.235): a scale pop 1 -> 1.35 -> 1.15 with an antenna flick landing ON 5.305 (Bit = literally the bug).
(B) 'take over a site' gets its own framing: push 6.30 -> 6.55 (out(cubic)), landing as the arrow hits the roof and the flag pops on 'over', ~x1.25 over the creep's current value, bringing the takeover (knob -> connector -> site icon, today around screen (700,1250)) to frame centre and clear of the right UI rail; hold with a +3 % creep through 'site' (~6.90); pull back 6.98 -> 7.24 (out(cubic)) onto the original creep path; from 7.24 the camera is exactly today's (eraser 7.03, key 7.10, cross strike 7.275, Pip's gag 7.77, the S03 hand-off unchanged). Move the L2 card ('no password · control of the site and its data') from 6.70 to ~7.45 so it is never cropped and lands on its words. During the push nothing may rise into the caption band (y < 570 must stay sky: pan so the cornice / board top stays at y >= 590, or keep the push lower).
HARD CONSTRAINTS (verify with renders + numbers): S02's first 0.40 s (the landing of the S01 dive) unchanged; camAt(end) identical so Pip's hand-off into S03 (Main f249-f254 centroid steps ~(-35,+43)/frame) is unchanged; QA gate S02 passes; tsc clean.
Final message (max 12 lines): what changed with times (for the sound lane: any new audible event, e.g. the 'bug' punch 5.305, the push whoosh 6.30, the pull-back 6.98, L2's new time), QA result, hand-off numbers.`
const S03 = `${BASE}
YOU OWN S03 (src/scenes/Scene03.tsx, src/scenes/scene03/**). Do NOT edit other scenes, src/lib, src/data or audio.
Build: the street must be BUILT ON 'PHP'. Today the hard cut at 8.393 opens on ~1.07 s of bare plan and the street (the one-gesture build: press house pop, street wedge, then the L/R rows 0.035 s apart) starts at 9.46, half a second after 'PHP'. In scene03/beats.ts move that build from 9.46 to ~9.03 so it erupts from the stamp CONTACT (8.99) and the existing 2 px plan jolt becomes its trigger; move L3's card pop from 9.26 to ~9.55 so it lands after the rows; leave everything from ~9.9 on unchanged. Check the opener's construction lines still read as an intentional blank-blueprint beat (~0.6 s).
HARD CONSTRAINTS: the S02|S03 cut (first ~0.6 s: Pip's drop arc onto the stamp, the sun at (690,700)) unchanged; the S03|S04 end unchanged; QA gate S03 passes; tsc clean.
Final message (max 8 lines): what moved (old -> new times, for the sound lane: the build's first frame and the card pop), QA result.`
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    hook_score: { type: 'number', description: '1-10: how well 0-10 s holds a scrolling viewer' },
    findings: { type: 'array', maxItems: 8, items: { type: 'object', properties: {
      scene: { type: 'string', enum: ['S01', 'S02', 'S03'] },
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      at: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
    }, required: ['scene', 'severity', 'at', 'problem', 'fix'] } },
  },
  required: ['hook_score', 'findings'],
}
phase('Build')
const built = await parallel([
  () => agent(S01, { effort: 'max', label: 'build:S01', phase: 'Build' }),
  () => agent(S02, { effort: 'max', label: 'build:S02', phase: 'Build' }),
  () => agent(S03, { effort: 'max', label: 'build:S03', phase: 'Build' }),
])
phase('Review')
const review = await agent(`${BASE}
You are an independent HOOK REVIEWER (top TikTok retention editor + motion director). Do NOT edit files. The builders report:
S01: ${built[0] || 'FAILED'}
S02: ${built[1] || 'FAILED'}
S03: ${built[2] || 'FAILED'}
Render Main 0-10 s every 0.1 s at half res (and full-res frames where needed) and watch it as a scrolling viewer, sound off and with the words in assets/timing.json. Judge: does 0-0.5 s stop the thumb, does 0-2 s make the promise, does 2-5 s escalate to 'on PURPOSE', does 5-10 s pay off (bug, take over a site, PHP)? Also catch anything broken: glitches, pops, rings or art inside the caption band (y 280-570), a cropped label, a jump at the S01|S02 (4.715) or S02|S03 (8.393) cut, frame 0 vs the loop seam (Main 0 vs 55.3333, 0 px below y 600). Max 8 findings, most important first, each tied to one scene with an exact fix.`, { effort: 'max', label: 'review:hook', phase: 'Review', schema: REVIEW_SCHEMA })
phase('Fix')
const fixes = {}
if (review) {
  const byScene = {}
  for (const f of review.findings) if (f.severity !== 'minor') (byScene[f.scene] = byScene[f.scene] || []).push(f)
  const scenes = Object.keys(byScene)
  const prompts = { S01, S02, S03 }
  const res = await parallel(scenes.map(s => () => agent(`${prompts[s]}
FIX ROUND: your build is done (see the code). The hook reviewer found:
${JSON.stringify(byScene[s], null, 1)}
Fix these (verify on renders), keep every HARD CONSTRAINT, re-run the QA gate. Final message (max 10 lines).`, { effort: 'max', label: `fix:${s}`, phase: 'Fix' })))
  scenes.forEach((s, i) => { fixes[s] = res[i] })
}
return { built, review, fixes }
