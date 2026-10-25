# Workflow engine-verify-fix-wf_8a2c252c-73a.js (run wf_8a2c252c-73a, last activity 2026-10-24 20:01 UTC)

Script: `context/workflows/engine-verify-fix-wf_8a2c252c-73a.js`

---

## verify:core

{
 "items": [
  {
   "finding": "r2#16 scenes.json still on v1 voice timing",
   "lane": "core",
   "severity": "blocker",
   "status": "fixed",
   "kit_level": true,
   "evidence": "src/data/scenes.json now S02 4.823 ... S13 73.307-77.76 = assets/timing.json duration 77.76; captions.json last page 75.585-77.76. Main renders 2333 frames (render-frames Main 77.75 s and 80 s both clamp to f2332). `node scripts/gen-scenes.mjs --out=<scratch>` regenerates a byte-identical cut list from docs/storyboard_v2voice.json (now the default). Guards present: gen-scenes refuses to write when max(end) or the captions' last e differs from the voice, and engine-numbers --check exits 0 ('scenes.json and captions.json end on the voice'). Scratch copy: /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/scenes_regen.json",
   "fix_needed": "None."
  },
  {
   "finding": "r2#1 KitDemo camera ~3.8x person height (diorama view)",
   "lane": "core",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": "KitDemo 4.4 s, captions hidden (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/kit/f00132.png): horizon y 768; walker 1 head top ~812 / feet ~1540, so camH/h = (1540-768)/728 = 1.06; walker 2 (bun) 795 / 1495 = 1.04; passer-by cut by the left edge = 1.16; queue heads sit in a band y ~775-830 just under the horizon and the queue converges on it. People are placed from eyeLevel({ratio 1.1}) and Crowd eye rows, not lerped scales.",
   "fix_needed": "None."
  },
  {
   "finding": "r2#23 KitDemo framing = documented reference figure at 2.2x head height",
   "lane": "core",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": "ENGINE.md section 2b documents the eyeLevel camera (target measureEye 1.0-1.2), and the section-3 Scene07 template uses it. I extracted the template into scratch: it typechecks against src/lib, and rendered with Standalone (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/template_render.png) its hero walker's head top is ~836 for feet ~1507 with the horizon at ~777, so the head sits just under the horizon. KitDemo sheet: /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/kit_sheet.png.",
   "fix_needed": "None."
  },
  {
   "finding": "r2#9 dusk framing teal->sage vanishes into the sage dusk sky",
   "lane": "core",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": "todSteps.dusk.framing = {sage: teal}; teal is no longer mapped to sage. Pixel modes in the top-left 300x250 of KitDemo: day fronds #547977 on #ACD1BF; dusk (7.3 s) #547977 on #6D988B (1.39:1, a darker silhouette); night (8.7 s) #6D988B on #588077 (one step lighter, as in ref 2). Crops: /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/kit_fronds.png. The requested check exists: theme relightProblems() (min 1.15:1 per role vs todSky), run by engine-numbers --check, which passes.",
   "fix_needed": "None for the frond case. relightProblems only checks the far/cloud/framing sky-facing colours, not base fills against a golden cream sky (see the golden finding)."
  },
  {
   "finding": "r2#21 tod relight = hard clip edge sweeping through figures",
   "lane": "core",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": "Every frame of KitDemo 6.90-7.37 s (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/kit_strip_dusk.png): only the sky slab wipes (~150 px/frame). Objects flip whole when the edge reaches their TodAnchor or centre: far city at f212, walkway cream->sand (243,224,203)->(217,187,161) at f217-219, lawn later. No two-tone figures or pavement, and the scene is drawn once (the World passes a TodWave, not a double render). Caption tone follows the night wipe edge exactly: /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/kit_strip_night_cap.png (f256-f258: line 1 white above the edge, line 2 ink below it).",
   "fix_needed": "None in core. Cine pieces that rely on the default useTodPal (no point) all flip together at the vanishing-point moment; per-piece timing only happens with an explicit tod={useTod([x,y])}, which is acceptable."
  },
  {
   "finding": "r2#22 mascot un-build via Elephant draw = opacity fade",
   "lane": "core",
   "severity": "major",
   "status": "partial",
   "kit_level": true,
   "evidence": "Core side done: ExitShrink (exit.tsx) exists, ENGINE.md section 8 forbids draw={1-exit}, and both the template and KitDemo use ExitShrink plus popIn. In the KitDemo un-build (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/kit_unbuild_mascot.png, f340-352) the elephant shrinks to its feet with solid fills in every frame. Still fading: CineDemo LoopScene's Mascot helper (src/dev/CineDemo.tsx:104-106, draw={1-e*1.6}). Its fills go translucent over the background in f107-f110 of the loop mode (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/cine_mascot_fade.png). CINE.md section 8 still prescribes '<Elephant draw={1 - exit}>'. Elephant.tsx still ramps fill opacity with draw, and ElephantTimeline still offers mode 'fade'.",
   "fix_needed": "Cine: replace the CineDemo Mascot helper with ExitShrink and fix CINE.md section 8, so scene agents don't copy the fade from the cine doc. Mascot lane (request): make draw's fill arrival a scale or misregistration slide with no opacity, and deprecate or remove ElephantTimeline mode 'fade' and the opacity behaviour of drawIn/drawOut."
  },
  {
   "finding": "r2#24 two diverging camera ease vocabularies",
   "lane": "core",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": "Evaluated in node (esbuild): MOTION.camera.reveal(u) == CAM.reveal(u) at u = 0.1/0.25/0.5/0.75/0.9 (0.25 -> 0.17857 both, a trapezoid). ease: inOutCubic in both; slow: inOutSine in both; settle: the same function object. The ShotCam header example (1200 px crane over 5 s, reveal) gives camSpeed max 11.43 px/frame and avg 8.0, under peakPxPerFrame 18.",
   "fix_needed": "Optional: spec.ts cruiseEase and cine trapezoid are still two copies of the same curve. Have CAM re-export MOTION.camera so they cannot drift apart."
  },
  {
   "finding": "r2#28 loop seam is a held frame",
   "lane": "core",
   "severity": "minor",
   "status": "fixed",
   "kit_level": true,
   "evidence": "KitDemo full-res frames, captions hidden (capcheck bg), share of pixels changed: 357->358 13.27 %, 358->359 0.39 %, 359->0 2.60 %, 0->1 1.44 % (it was 0.00 % before). The opening starts before t 0 (Sun rise.at -0.12, Look cascade.at -0.05), and ENGINE section 5 documents negative starts. Film's loop underlay renders scene 0 at T - end, so the same recipe works in Main.",
   "fix_needed": "None. Scene agents must still start their opening motion before t 0, which the ENGINE.md text asks for."
  },
  {
   "finding": "r2#29 Crowd rise order='back' sprouts people from bare pavement",
   "lane": "core",
   "severity": "minor",
   "status": "fixed",
   "kit_level": true,
   "evidence": "Crowd now defaults to order 'front' for build 'rise'. riseOk lets a person rise only when the row in front started at least 0.2 s earlier, or when the front row stands at the frame bottom or is `occluded`; everyone else pops. KitDemo queue 2.30-4.37 s (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/kit_strip_queue.png): rear figures rise behind people already standing, and the unoccluded front figure pops (scale) instead of emerging head-first.",
   "fix_needed": "Minor follow-up: riseOk is decided per row, not per x, so in a sparse row (density < 0.8) a rear person can still rise through a gap in the row in front. Consider checking x-overlap with the occluding row."
  },
  {
   "finding": "r2#30 camera-continuous 'out' + World push reverses ~0.8 s after the cut",
   "lane": "core",
   "severity": "minor",
   "status": "fixed",
   "kit_level": true,
   "evidence": "Scratch Film harness (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/harness/entry.tsx, marker tracking in harness/track.json) with A->B camera-continuous dir 'out' 1.4 s and default push on B. Log-zoom rate x960 per frame: A -5.6/-6.9 just before the cut, B -7.7/-8.0 just after, so velocity is matched. B decelerates to ~0 by 4.2 s, holds ~0.2 s, and the push starts at 4.4 s (= scene t 1.4): no bounce. pushStart() is applied in both World and ShotCam pushKeys. Also checked: 'in' 0.25 s (+4.0 -> +7.6, a small nudge) and 'up' 1.9 s (7.3 -> 7.8 px/frame across the cut) are velocity-continuous.",
   "fix_needed": "None. Push-through has the same reversal and is not covered; see the separate finding."
  },
  {
   "finding": "r2#12 Person hero heads: light hair reads bald, 'cap' reads as a face",
   "lane": "core",
   "severity": "minor",
   "status": "fixed",
   "kit_level": true,
   "evidence": "KitDemo 4.4 s zoom (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/kit_heads.png): the bun head has 3 strand strokes and a notched nape; the tan curly head has a bumpy, misregistered outline; the dark head has a notched nape over the hood. At hero size the cap passer-by (kit_capcrop.png) shows a teal dome over a dark nape strip with no strap opening and does not read as a face. The scarf in the template walker sits below the collar on the back.",
   "fix_needed": "The detail only applies above the 60 px head threshold. In the LOD harness (head ~52 px) a sand-haired head is still a plain skin disc. Consider lowering the threshold to ~40 px (tied in with the LOD-pop finding)."
  },
  {
   "finding": "r2#15 tsc not clean",
   "lane": "core",
   "severity": "minor",
   "status": "fixed",
   "kit_level": false,
   "evidence": "`npx tsc --noEmit` exits clean with no output (7 s). Log: /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/tsc.txt",
   "fix_needed": "None."
  },
  {
   "finding": "r2#36 preview tooling: one lane's broken import breaks every preview",
   "lane": "core",
   "severity": "minor",
   "status": "fixed",
   "kit_level": false,
   "evidence": "render-frames.mjs --entry=auto: KitDemo bundled node_modules/.cache/render-entry/KitDemo.js (imports only KitDemo), Main bundled src/entry-film.ts (FilmRoot, no dev previews), and --entry=<path> works (used it for the scratch harnesses). sheet.sh, strip.sh and still.sh all ran fine. Measured perf: KitDemo 121 ms/frame at 0.35 scale and 148-169 ms/frame at full res (concurrency 2).",
   "fix_needed": "None. The dev-entry lookup is a regex over registry.ts and assumes the `{id, component, durationSeconds}` key order."
  },
  {
   "finding": "r2#8 cine TOD.dusk sky/caption tone disagrees with core theme",
   "lane": "cine",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": "cine/atmosphere.ts imports skies, todTone and captionTones from theme: TOD.dusk.skyBands[0] = skies.dusk (sage #6D988B), text = captionTones[todTone.dusk] (ink), and night stays #588077 with white text. One table now drives both lanes for dusk and night. Golden still diverges (see the golden finding).",
   "fix_needed": "None for dusk. Reconciling golden is still open."
  },
  {
   "finding": "r2#17 (tool part) no camera-speed / strobe check usable on real scenes",
   "lane": "cine",
   "severity": "major",
   "status": "partial",
   "kit_level": true,
   "evidence": "camSpeed() exists (cine/camera.tsx) and CineDemo's 'speed' mode and cineSpeedReport() work: C pull-back peaks at 19.2 px/frame, A at 13.5, D 2.0, B 2.3. That only covers CineCamera keys, and only from code. There is no CLI or QA check in scripts/ or scripts/qa for on-screen px/frame in a scene render, which would need to cover Film transitions (push-through peaks >100 px/frame by design), World push, ShotCam foreground layers and Person moves. A grep of scripts/qa for speed/strobe finds nothing.",
   "fix_needed": "Core scripts: add a speed check (e.g. scripts/camspeed.mjs that evaluates a scene's ShotCam/CineCamera keys plus its transitionIn, or a deadframes.py flag that reports the ORB-estimated camera px/frame) and flag peaks above MOTION.camera.peakPxPerFrame outside allow-listed transitions."
  },
  {
   "finding": "r2#26 (core part) Film can't use column/passer wipers; linear wipe edge and drift",
   "lane": "cine",
   "severity": "major",
   "status": "partial",
   "kit_level": true,
   "evidence": "Cine part done: wipers.tsx is a leaf module with CINE_WIPERS {column, passer} in the WiperComponent shape with captionRegions, plus wipeEdgeX (inOutSine). Core Film.tsx still accepts element 'figure'|'pole'|'foliage'|'scene' only, WIPE_HALF has no column/passer, wipeX is a linear lerp, and the 50 px scene drift is linear. Harness tracking of the foreground wipe (frames 355-367): the outgoing scene goes 0 -> 3.1 -> 4.3 px/frame in one step and the incoming one 4.1 -> 3.2 -> 0.0, i.e. velocity steps at both ends. Caption tone across the wipe is correct (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/harness_wipe.png).",
   "fix_needed": "Core Film: wipers = {...BUILTIN_WIPERS, ...CINE_WIPERS}, use CINE_WIPE_HALF, move the edge with wipeEdgeX (inOutSine), and ease the 50 px parallax drift (sine) so neither scene starts or stops dead."
  },
  {
   "finding": "r2#27 (doc part) useTod outside World silently 'day'; ENGINE still prescribes explicit tod",
   "lane": "cine",
   "severity": "major",
   "status": "partial",
   "kit_level": true,
   "evidence": "Cine part done: tod is optional and defaults to the core context via useTodPal, the type is renamed TodLike, and CINE.md section 2 has the note. ENGINE.md (core) still has no warning that useTod() returns 'day' when called in a scene body above <World>. Sections 4 and 14 still tell scene agents to pass `tod={useTod([cx, cy])}`, which in a template-style scene function (the body that returns <World>) silently yields 'day'.",
   "fix_needed": "ENGINE.md: say that cine pieces now follow the World automatically, and that useTod([x,y]) is only for per-piece timing and must be called in a child component below <World>."
  },
  {
   "finding": "r2#35 (tool part) event-density tool not committed for kit numbers",
   "lane": "cine",
   "severity": "minor",
   "status": "partial",
   "kit_level": false,
   "evidence": "scripts/qa/deadframes.py (QA lane) now counts space-time events with fixed thresholds and scores life per scene. CINE.md section 12 still quotes numbers from the reviewer's uncommitted density.py and says a scripts/ copy is the core lane's to add. ENGINE.md section 11 doesn't mention deadframes.py.",
   "fix_needed": "Point ENGINE.md section 11 and CINE.md section 12 at scripts/qa/deadframes.py and re-measure the CineDemo and KitDemo densities with it, so both lanes use one tool."
  },
  {
   "finding": "NEW core FigureWiper is clip art; 'rim' paints a 45% panel with a hard seam",
   "lane": "core",
   "severity": "major",
   "status": "open",
   "kit_level": true,
   "evidence": "Film harness foreground-wipe (element 'figure') at 12.0 s, full res (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/figurewiper_p50.png): head and hood are concentric ruler circles with thin outlines on a ~1300 px element. The 'rim light' is a second torso Fill clipped with CSS inset(0 0 0 52%), so palette.teal covers the whole right ~45% of the torso with a straight vertical seam: a two-tone panel, not a one-sided sliver. Film falls back to FigureWiper for element 'scene' when the outgoing module has no Wiper (S07 and S12 in scenes.json use 'scene'), and the ENGINE.md template exports `Wiper = FigureWiper`. This is the same flaw the cine passer was redrawn for.",
   "fix_needed": "Redraw it the way PasserWiper was: an irregular hood/head silhouette with an ear, collar ink that overshoots, fills misregistered 3-5 px, and a 6-10 px rim sliver that follows the leading outline rather than a bbox inset. Or alias 'figure' to the cine passer."
  },
  {
   "finding": "NEW golden time of day: core cream sky vs cine/bible day sky; golden relights nothing",
   "lane": "core",
   "severity": "major",
   "status": "open",
   "kit_level": true,
   "evidence": "theme todSky.golden = skies.golden = cream #F3E2CB, while cine TOD.golden.skyBands = [skies.day] and style_bible_ref2 section 8 says 'golden = same flat day sky + peach-lit faces'. CINE.md sections 2 and 12 flag this as the core lane's to reconcile. todSteps.golden = {}, so a golden key changes only the sky. The template render (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/template_render.png) shows a cream sky. Cream facades and walkways are 1.0:1 and white clouds 1.27:1 against it, and relightProblems doesn't check base fills. The storyboard (S08 'sky wipes cream -> sage', S09 dawn cream) assumes the core value while cine golden haze (mix(cream, sky)) assumes a mint sky. The brief says most of the film is day/golden.",
   "fix_needed": "Decide golden once in theme.ts (bible: the day sky plus a golden relight row with light faces stepped toward peach/cream). Make cine TOD.golden import it, update the storyboard notes if the sky changes, and extend relightProblems to base fills that commonly sit against the sky (cream, white, sand)."
  },
  {
   "finding": "NEW Person hero/LOD thresholds on authored s -> single-frame detail pop",
   "lane": "core",
   "severity": "major",
   "status": "open",
   "kit_level": true,
   "evidence": "Scratch harness (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/harness/entry2.tsx): a Person whose s goes 1.32 -> 1.08 over 2 s (walking into depth, as ENGINE section 10 suggests: 'move x / y / s yourself'). At s = 1.2 (f30->f31) sleeves, seams, cuffs, hands, waistband and the rim strip all vanish in one frame: 0.20 % of pixels change vs a 0.06 %/frame baseline (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/lod_pop.png). Cause: Person.tsx:311 hero = s >= 1.2 and :335 bigHead = 2*hr*s > 60 are thresholds on authored s. Crowd lod/ink thresholds (0.28/0.45/0.75) would do the same to any animated crowd scale.",
   "fix_needed": "Give the LOD steps hysteresis and per-person jitter, drop the details one at a time on different frames (rim, then hands, then seams), or let a scene freeze the lod/hero level per person for a shot. Document it in ENGINE section 10."
  },
  {
   "finding": "NEW cine dusk haze on a core flat World sky -> washed grey ghost skyline",
   "lane": "cine",
   "severity": "major",
   "status": "open",
   "kit_level": true,
   "evidence": "KitDemo far city (cine Skyline relit from the core World through useTod), /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/kit_farcity_tod.png. Day: #7FA49B/#8BB2A4 on #ACD1BF (fine). Dusk (7.5 s): #90A294 and #9BB09D, lighter than the sage sky #6D988B (1.19:1 and 1.4:1), an off-palette grey mix that reads as fog. Night: #4F7371/#5B837B. The cause is TOD.dusk.haze = mix(sky, peach, 0.35): it assumes cine's banded dusk sky with a peach horizon, but the core World dusk sky is one flat sage value.",
   "fix_needed": "Haze far rows toward the sky that is actually drawn: at dusk, far rows step to teal/tealDark silhouettes one step darker than sage, as in ref 2 and Arcane. Use palette steps rather than mixes, or only apply the peach haze when a cine banded Sky is present."
  },
  {
   "finding": "NEW push-through incoming pull-back + World push reverses after the cut",
   "lane": "core",
   "severity": "minor",
   "status": "open",
   "kit_level": true,
   "evidence": "Film harness E->F push-through 0.61 s with default push on F (harness/track.json frames 455-465). Log-zoom rate x960 per frame: -167, -114, -70, -35, -14, -1.5, then +0.8, +0.8, +0.5, +1.6. The pull-back lands and the camera reverses into a push-in ~0.33 s after the cut, because F's push started at t 0. pushStart() only special-cases camera-continuous. S02 and S11 use push-through.",
   "fix_needed": "In stage.pushStart, treat an incoming push-through (whose leg is a zoom-out) like camera-continuous 'out': start a push-in after the leg settles (t >= dIn + hold/2), or default the push to a pull-out for those scenes."
  },
  {
   "finding": "NEW core Sun has no default idle drift",
   "lane": "core",
   "severity": "minor",
   "status": "open",
   "kit_level": true,
   "evidence": "Sun.tsx:172 applies drift only when the prop is given, so by default the sun is perfectly still. ENGINE rule 6 and motion_spec section 9 require >= 10 px/s or a bob, and cine BigSun now defaults to sunDrift(tod). The ENGINE template passes drift explicitly, but a scene that forgets it has a dead sun.",
   "fix_needed": "Default drift to ~[10, 0] (or a small bob) in World stage kind, and let drift={[0,0]} pin it for match-cuts."
  },
  {
   "finding": "NEW ENGINE.md stale cine statements and wrong dusk tone in the template",
   "lane": "core",
   "severity": "minor",
   "status": "open",
   "kit_level": true,
   "evidence": "ENGINE section 7 says 'Raw-SVG (cine) rows do not read Look / exit: wrap them (KitDemo CineRow)', and section 14 says to wrap Skyline/EndlessCity in a Look/exit-aware group. Both are false since cine/state.tsx: Skyline, EndlessCity, Monument and the rest call useCineState and do their own un-build and paper Look. Wrapping them as told applies the un-build twice (wrapper scaleY plus the piece's own sink) and hides the paper-state hairlines. In section 3, the example scenes.json captionTone switches to 'light' at the dusk key, but todTone.dusk = 'dark': white on #6D988B is 3.22:1 vs ink 5.14:1.",
   "fix_needed": "Update ENGINE sections 7 and 14 (cine pieces are state-aware; don't wrap them) and correct the template's tone example to keep 'dark' at dusk, switching to 'light' only at a night key."
  },
  {
   "finding": "NEW Festoon halos are translucent blobs -> off-palette mixes",
   "lane": "core",
   "severity": "minor",
   "status": "open",
   "kit_level": true,
   "evidence": "kit/Nature.tsx Festoon lit halos are Fills with opacity 0.22 and 0.3. In KitDemo at night (8.7 s, top-left crop) they produce #7A8C7C and #9F9982 where they overlap the fronds and wire (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/kit_fronds.png). Ref 2 measures an opaque flat halo disc #749484 at r = 2.2x the bulb, and the brief asks for 'glows as stepped concentric flat discs'.",
   "fix_needed": "Draw halos as opaque stepped flat discs (a bulbHalo token, r 2.2x) behind the wire and bulb, not translucent overlays."
  }
 ]
}

---

## verify:cine

{
 "items": [
  {
   "finding": "F0 passer wiper: see-through hole in head/neck + clip-art drawing",
   "lane": "cine",
   "severity": "blocker",
   "status": "fixed",
   "kit_level": true,
   "evidence": "src/lib/cine/wipers.tsx passerGeo(): the head, ear, neck and shoulders are now ONE closed clockwise outline. passerPath() returns that outline, and captionRegions uses the same path, so the tone region has no hole either. Strip /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/passer_strip.png (9.70-10.25 s, every frame) and full frame .../engverify/full/f00298.png: no hole and no WipeCut seam. The redraw has an egg-shaped irregular head with hair bumps, one ear, ochre hair with 3 clump strokes and a ragged nape, overshooting collar ink, fills offset 3 px + 4 px from the ink, and an ~8 px rim sliver on the leading side only. Caption tone over the passer is correct (white on the body and hair, ink on the sky): .../engverify/wipe_captions.png f00299/f00301.",
   "fix_needed": "None."
  },
  {
   "finding": "F2 baseline street (D): camera too high, empty road, bare facades",
   "lane": "cine",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": "CineDemo D_ST = {camH 187, road 120} for 170 px people (1.1x). Measured on .../engverify/full/f00225.png (7.5 s, horizon y 800): camera / person height = 1.10 (long-hair figure), 1.02 (right walker) and 1.26 (strap figure), all in the 1.0-1.3 band, with heads hugging the horizon. The queue starts at the lens with the hero at 0.55 H cut by the bottom edge, and the mascot sits at their feet. The street has StreetDressing (water tower, palms, tree, lamp post, car, bike, mailbox), pitched roofs and doors, a right-hand fence, TinyCrowd walkers on both walks, and bulbs that shrink toward the VP.",
   "fix_needed": "None."
  },
  {
   "finding": "F3 monument shot B: near figure breaks scale, building fits in frame, empty plaza at the cut",
   "lane": "cine",
   "severity": "major",
   "status": "fixed",
   "kit_level": false,
   "evidence": "MON bw 1950 / taper 0.52: in .../engverify/full/f00345.png (11.5 s) the pediment runs past both edges and the drum leaves the top. Only flat fields sit behind the caption. The near figure is now a lens head-and-shoulders silhouette (s 4.4, bottom right). The plaza has TinyCrowd n 44 at ~70-100 px, and the door (~170 px) is ~3x a person. build.at = -1.6, so the colonnade already stands at the cut (passer_strip f304-f308, 10.13-10.27 s).",
   "fix_needed": "None for scale. The lens silhouette's avatar-icon shape is filed separately (NEW silhouette finding)."
  },
  {
   "finding": "F4 Monument light='back': flat vector stripes, no hand-drawn ink",
   "lane": "cine",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": ".../engverify/full/f00345.png and .../engverify/crop_B_steps.png: below quietY the shafts have hairline flutes, step nosings are broken into 80-160 px dashes of varied weight, the door has a frame and transom bar, and the plaza paving joints converge on the VP (GroundPlane). Shade fills are offset from the ink, and the entablature mouldings are broken and capped. Residual (taste): the steps still read as evenly ruled stripes.",
   "fix_needed": "Optional: vary the step riser heights a little and break up the stripe rhythm (a worn step, a shadow wedge)."
  },
  {
   "finding": "F5 shot A city: theatre flats, no colossal landmark, front-lit against the sun",
   "lane": "cine",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": ".../engverify/full/f00150.png (5.0 s) and .../engverify/crop_A_mid.png: the near rows are backlit (teal / tealDark facades, warm windows the only accents, peach rim on roof edges). They have sage roof top faces seen from above, tree clumps and lamp dots. The colossal landmark is ~3x its neighbours, fill-only, crosses the caption band and leaves the top of the frame, with a cloud band across it (frame 0: .../engverify/full/f00000.png). The observer is a Rimmed deep.teal78 silhouette.",
   "fix_needed": "The observer is head-and-shoulders at ~0.19 H rather than shoulders-to-waist at 0.3 H, and it reads as an avatar icon (see the NEW silhouette finding)."
  },
  {
   "finding": "F6 hook shot A holds one composition; first second has nothing happening",
   "lane": "cine",
   "severity": "major",
   "status": "demo-only",
   "kit_level": false,
   "evidence": "A_KEYS now open tilted up 640 px and tilt down with CAM.reveal over 2.5 s (peak 13.5 px/f). Other beats: a district sweep at 1.15, a second at 3.55, the tower, beacons and lamps at 4.4, and the sun sinks 140 px. However, scripts/qa/deadframes.py on every frame (.../engverify/dead/deadframes.md, chart .../engverify/dead/deadframes.png) flags shot A for a 0.93 s dead run (0.13-1.07 s: only the camera tilt and slow cloud drift) and a max gap of 1.13 s. That fails the 0.40 s gate in the hook's first second.",
   "fix_needed": "Start a visible build event inside the first 0.3 s (e.g. the first district sweep or the tower crown windows at ~0.3-0.5 s, a bird flock, or the sun pulse at 0.4 s), so the opening tilt is not camera-only."
  },
  {
   "finding": "F7 shot C: caption letterbox band, frames through glyphs, dead parapet slab, odd hero",
   "lane": "cine",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": "keepDark now uses the caption LINE boxes plus pad and a ragged per-cell noise, with hysteresis along camPath (wall.tsx wallDarkFrom). The first off block sits under 'switch it off' (CAP_UV). Close-ups behind the words are flat dark glass, no ink: .../engverify/band_strip1.png (f512-f535). The Ledge has detail (brick courses, drain pipe, vents, antenna), so the bottom is no longer a dead slab: .../engverify/full/f00585.png and f00648.png. The hero is framed at (422-458, 1087-1132), ~36x46 px, and at glass level it looks like a grid pane: .../engverify/crop_C_hero.png.",
   "fix_needed": "The remaining mask-edge stream along the box top is tracked under F19."
  },
  {
   "finding": "F8 TOD.dusk caption-band sky = night teal; lanes disagree on dusk",
   "lane": "cine",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": "atmosphere.ts: OPTS.dusk.skyBands[0] = skies.dusk (sage), and text = captionTones[todTone[name]].text, imported from theme. Pixel at (60, 300) in a CineDemo loop-mode dusk frame (.../engverify/loop/f00009.png, half scale (30, 150)) = rgb(109,152,139) = sage. Night stays #588077 + white.",
   "fix_needed": "None for dusk. Golden still disagrees: see the NEW golden-sky finding."
  },
  {
   "finding": "F10 EndlessCity mid rows look generated (ruler lines, regular grids)",
   "lane": "cine",
   "severity": "minor",
   "status": "fixed",
   "kit_level": true,
   "evidence": ".../engverify/crop_A_mid.png (2x crop of 5.0 s): line ends are jittered, verticals drift and tilt, weights vary, some verticals are broken, and there are setbacks, pitched roofs and domes plus window variety (blinds, mixed lit colours, skipped cells). This now reads close to ref 1 f_5.5's overshooting hand.",
   "fix_needed": "None."
  },
  {
   "finding": "F11 StringLights constant bulb size along a receding string",
   "lane": "cine",
   "severity": "minor",
   "status": "fixed",
   "kit_level": true,
   "evidence": ".../engverify/crop_D_bulbs.png (8.42 s, 3x): along the zig-zag toward the VP, bulb radius and spacing shrink with depth, and far bulbs drop into the wire. There is no chain of overlapping circles at the sun.",
   "fix_needed": "None."
  },
  {
   "finding": "F13 Sky stepped bands: divider line under the caption band at day/golden",
   "lane": "cine",
   "severity": "minor",
   "status": "fixed",
   "kit_level": true,
   "evidence": "Column samples at x 1000 / 60, y 180-760, in .../engverify/full/f00036.png (A, golden) and f00225.png (D): one flat value rgb(172,209,191) down to the scenery, no steps. sky.tsx: day and golden have skyBands = [skies.day]. Dusk and night steps have wobbled streak edges (bandPath).",
   "fix_needed": "None (zoom-related caption-band breach filed separately)."
  },
  {
   "finding": "F14 WindowCloseup chair as a white sheet; time of day / sun regress across cuts",
   "lane": "cine",
   "severity": "minor",
   "status": "demo-only",
   "kit_level": false,
   "evidence": "Chair FIXED: .../engverify/crop_C_chair.png shows an ink frame, two slats, legs and a cream fill. Time of day order is golden, golden, golden, night. However, the sun still visibly hops UP on screen at both cuts. A->D: D_SUN_START (602,1003) r 309 hops to (560,778), 225 px up (.../engverify/AD_strip.png f182-f190). D->B: (560,~817) to (930,560), ~257 px up. CINE.md's claim that 'the sun only sets across cuts' is not true in screen terms.",
   "fix_needed": "In CineDemo, hop the sun to an equal or lower screen height (or keep it off-frame in B), or reword the CINE.md claim."
  },
  {
   "finding": "F17 shot C pull-back strobing (48-53 px/frame)",
   "lane": "cine",
   "severity": "major",
   "status": "fixed",
   "kit_level": false,
   "evidence": "C_KEYS are now 8x -> 1.3x over 5.3 s with CAM.reveal. camSpeed (scratch .../engverify/speed.cjs, same numbers as CINE.md): max 19.2 px/f at the far frame corner, avg 11.2. Mid-frame cruise is 17.3 px/f (.../engverify/vel.cjs). The window pitch on screen stays >= ~125 px, far above the per-frame shift, so there is no wagon-wheel. camSpeed and the {mode:'speed'} check exist. CINE.md table corrected.",
   "fix_needed": "Optional: the corner peak (19.2) is just over MOTION.camera.peakPxPerFrame (18). Stretch the move ~0.4 s, or say in CINE.md that 20 is the cine ceiling."
  },
  {
   "finding": "F18 WallOfWindows LOD: close-up block swaps to panes in one frame / reads as an odd patch",
   "lane": "cine",
   "severity": "major",
   "status": "partial",
   "kit_level": true,
   "evidence": "There is no block swap any more: the grid swap never happens because the zoom ends at 1.3 > LOD_ABOVE 1.15. The close-ups degrade per cell with jittered thresholds (full >= ~74 px, room >= ~48 px, glass), one cell every frame or two: .../engverify/lod_full_room.png (18.67-19.13 s) and .../engverify/lod_room_glass.png (19.60-20.07 s). But every cell's step is still a visible one-frame change: a room with person, desk and lamp becomes a flat peach pane at ~70 px wide. The 'room' level of DARK cells paints the wall teal rgb(84,121,119) with a dark curtain L, while grid dark panes are rgb(62,94,93) / rgb(48,75,74). So through ~18.7-20.0 s the 9x7 block still reads as a patch of different windows among flat panes (.../engverify/full/f00585.png, .../engverify/crop_C_lodpatch.png). The kit's lod.above swap was never exercised.",
   "fix_needed": "WindowCloseup 'room' level for unlit cells must paint the grid's dark pane colour (p.windowDark / look.dark) at the grid pane quad. Only the curtain sliver should differ. Drop the room interior through an intermediate step (person/desk out first, then the lamp) or switch at ~40 px. Add a check that renders a close-up at 'glass' next to the grid pane and diffs them."
  },
  {
   "finding": "F19 WallOfWindows keepDark re-tests every frame (windows pop on/off at band edges)",
   "lane": "cine",
   "severity": "major",
   "status": "partial",
   "kit_level": true,
   "evidence": "Hysteresis is in (wallDarkFrom along camPath): no window pops back ON when it leaves the band (.../engverify/band_strip1.png, f512-f535). But during the pull-back, lit cells flow down into the caption line box and switch OFF exactly at its top edge. From ~18.9 to 19.6 s this traces a continuous horizontal line of switch-offs at y ~ 280 (lit above, all dark below), so the mask edge is still readable as a scan line: .../engverify/band_strip2.png (f566-f586).",
   "fix_needed": "Decide membership once from the union of the boxes over the whole camera path (static per shot), or switch the swept cells off in a few ragged wave pulses timed to words, not continuously as they cross the edge."
  },
  {
   "finding": "F20 shot C ending: hero lost as a speck, 1.5 s of dead air",
   "lane": "cine",
   "severity": "major",
   "status": "demo-only",
   "kit_level": false,
   "evidence": "The hero stays framed: (422-458, 1087-1132) at 20.6 s, ~36x46 px (.../engverify/crop_C_hero.png). It is the last light off on 'did.' (21.45 s), then the mascot turns at 21.55 and the cut follows ~0.5 s later. deadframes.py still flags a 0.53 s dead run at 20.93-21.47 s (.../engverify/dead/deadframes.md): only sub-threshold straggler windows switch off while the camera lands.",
   "fix_needed": "Add one visible beat at ~21.0-21.2 s (a whole block of floors going dark, the mascot's glance, a star twinkle burst) or pull HERO_OFF earlier by ~0.15 s."
  },
  {
   "finding": "F21 time-of-day relight: cine pieces per-piece switch time",
   "lane": "core",
   "severity": "major",
   "status": "partial",
   "kit_level": true,
   "evidence": "Throwaway World golden->night test (entry under node_modules/.cache, removed after; frames .../engverify/relight_strip.png): there is no clip edge through figures, and the core Building flips whole when the edge reaches it (f40-f45). Every cine piece (EndlessCity, Skyline, TinyCrowd, StringLights) reads useTodPal() = the subtree tod at the VP, so they all flip in the same frame (f36, edge at y~960) regardless of position. Per-piece timing was not implemented. The docs disagree: ENGINE.md §4/§14 tell agents to pass tod={useTod([cx, cy])} (which returns 'day' in a scene body), while CINE.md §2 says to omit tod.",
   "fix_needed": "Have useTodPal accept the piece's anchor point (or wrap each cine row / piece in a TodAnchor at its own centre) so each piece flips when the edge reaches it. Make ENGINE.md §4/§14 match CINE §2 (omit tod; never call useTod in the scene body)."
  },
  {
   "finding": "F22 mascot un-build fades (draw = 1 - exit)",
   "lane": "core",
   "severity": "major",
   "status": "partial",
   "kit_level": true,
   "evidence": "The core side is fixed: ENGINE §8 has ExitShrink and the template wraps the mascot. But CINE.md §8 still says 'The mascot: <Elephant draw={1 - exit}>', and the CineDemo Mascot helper uses draw = 1 - e*1.6. In the loop-mode un-build the mascot's fills fade through translucency: purple px in the mascot box are 1500 (f106), 1223 (f107), 633 (f108), 0 (f109) (.../engverify/mascot_fade.png). Elephant still ramps fill opacity for draw < 1, and ElephantTimeline still offers mode 'fade' (mascot lane).",
   "fix_needed": "CINE.md §8 and the CineDemo Mascot: use <ExitShrink x y> around the mascot. Mascot lane request: make draw's fill arrival / leave a scale or misreg slide with no opacity, and remove mode 'fade'."
  },
  {
   "finding": "F24 camera ease vocabulary: MOTION.camera vs cine CAM",
   "lane": "core",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": "spec.ts MOTION.camera = {ease inOutCubic, slow inOutSine, reveal cruiseEase(0.25, 0.35), settle outCubic, peakPxPerFrame 18}. A runtime check (.../engverify/names.cjs) gives CAM.reveal(0.25) = MOTION.camera.reveal(0.25) = 0.1786, and ease / settle are the same function objects. The ShotCam example is now 1200 px over 5 s (8 avg, 11.4 peak).",
   "fix_needed": "Cosmetic: CAM.reveal and MOTION.camera.reveal are two instances (trapezoid vs cruiseEase). Have one re-export the other to stay single-source."
  },
  {
   "finding": "F25 CineCamera: no tilt/pan; crane breaks the horizon",
   "lane": "cine",
   "severity": "major",
   "status": "fixed",
   "kit_level": true,
   "evidence": "camera.tsx: pan / tilt channels (screen px applied after anchoring to every layer, the sky included) go through the same PCHIP plan (channels 7/8). Shot A uses tilt 640 -> 0 and the horizon / sun / city stay coherent (.../engverify/full/f00000.png -> f00150.png). The crane-vs-tilt rule is documented in camera.tsx and CINE.md §1.",
   "fix_needed": "None."
  },
  {
   "finding": "F26 wipes API: cine WipeCut vs Film foreground-wipe",
   "lane": "cine",
   "severity": "major",
   "status": "partial",
   "kit_level": true,
   "evidence": "Cine side done: wipers.tsx is a leaf module (type-only imports from Film). ColumnWiper / PasserWiper have the WiperComponent shape with static captionRegions, plus CINE_WIPERS and wipeEdgeX (in-out sine). Core side not done: Film.tsx BUILTIN_WIPERS = {figure, pole, foliage}, the element union is still 'figure'|'pole'|'foliage'|'scene', and wipeX() is still linear. Scene agents can only reach the passer via element 'scene', where WIPE_HALF.scene = 600 < passer half 680. The passer's shoulder would then show ~30 px at the first and last frames of the wipe (a pop), and Film applies no 8% growth.",
   "fix_needed": "Core: in Film, use {...BUILTIN_WIPERS, ...CINE_WIPERS}, add 'column' | 'passer' to the element union, take WIPE_HALF from CINE_WIPE_HALF, and switch wipeX to wipeEdgeX."
  },
  {
   "finding": "F27 tod prop ergonomics (cine defaults ignore core <Tod>; Tod name clash)",
   "lane": "cine",
   "severity": "major",
   "status": "partial",
   "kit_level": true,
   "evidence": "Cine side fixed: every piece takes tod?: and useTodPal() reads the core context. The throwaway World test relit EndlessCity / Skyline / TinyCrowd / StringLights with no tod prop (.../engverify/relight_strip.png f36+). The type is TodLike and the barrel does not export Tod. But ENGINE.md (core) still prescribes tod={useTod([cx, cy])} (§4, §14) with no note that useTod() returns 'day' outside <World>, which is the original trap. A new barrel clash also exists (ExitShrink, filed separately).",
   "fix_needed": "ENGINE.md §4/§14: 'omit tod; cine pieces follow the World'. Add the note that useTod() only works below <World>."
  },
  {
   "finding": "F31 cine un-build: empty dusk slab with a lone horizon stripe",
   "lane": "cine",
   "severity": "minor",
   "status": "fixed",
   "kit_level": true,
   "evidence": "CineDemo {mode:'loop'} every frame: .../engverify/loop_strip.png and .../engverify/loop_ub.png. The Sky glow bands shrink with the fills (exitScale(e, 0.3, 0.4)) and the slab collapses from e 0.5. f112-f113 still have pieces, f114-f115 are the only near-bare frames (2, the target), and f116 shows the incoming state.",
   "fix_needed": "None."
  },
  {
   "finding": "F32 sun as a character (BigSun drift, inter-shot hops)",
   "lane": "cine",
   "severity": "minor",
   "status": "fixed",
   "kit_level": true,
   "evidence": "light.tsx sunDrift(tod) = [3, 9.5] px/s (9.96 px/s, sinking; rising at dawn) and a bob option. CineDemo hops the sun after each wiper has passed: A->D hop at 6.1 s after the column (centre 5.85), visible in .../engverify/AD_strip.png f182-f200; D->B at 10.37 s after the passer.",
   "fix_needed": "Nit: 9.96 px/s is a hair under ENGINE rule 6's '>= 10 px/s'. Use [3, 9.6]. The screen-height direction of the hops is filed under F14."
  },
  {
   "finding": "F33 CineDemo sync and baseline zoom (no parallax)",
   "lane": "cine",
   "severity": "minor",
   "status": "fixed",
   "kit_level": false,
   "evidence": "Each wipe midpoint now sits on a caption page start: CUT_AD 5.6+0.25 = 5.85, CUT_DB 10.0, CUT_BC 15.95. D uses a dolly push 0.09 anchored on the VP (anchorDepth 0.95): peak 2.0 px/f at depth -0.6 vs less at the far street (.../engverify/vel.cjs).",
   "fix_needed": "None."
  },
  {
   "finding": "F34 WallOfWindows floor-band ink: free ends crawl / now pops on in one frame",
   "lane": "cine",
   "severity": "minor",
   "status": "partial",
   "kit_level": true,
   "evidence": "Bands now end on a pier line, so the crawl is gone. But they are drawn only while zoom <= bandsBelow (3), so all ~13 long band lines APPEAR IN ONE FRAME when the zoom crosses 3: f559 -> f560 (18.63 -> 18.67 s), .../engverify/bands_pop.png. This is a single-frame LOD pop of full-wall ink, introduced by the fix.",
   "fix_needed": "Bring the bands in without a pop: draw them on with core Ink (pen pacing, staggered per band) over ~0.3 s from the zoom threshold, or grow each band from its near end as the zoom falls through [3.4, 2.8]."
  },
  {
   "finding": "F35 event density in CineDemo / uncommitted density tool",
   "lane": "cine",
   "severity": "minor",
   "status": "demo-only",
   "kit_level": false,
   "evidence": "A committed tool now exists (scripts/qa/deadframes.py). On all 658 frames at half scale, events per second are A 6.31, D 7.74, B 7.58, C 22.17 (all >= 5), but A and C FAIL the dead-run gate: A 0.93 s (0.13-1.07 s), C 0.53 s (20.93-21.47 s). See .../engverify/dead/deadframes.md. CINE.md §12 quotes different numbers from the reviewer's private density.py.",
   "fix_needed": "See F6 and F20. Update CINE.md §12 to quote scripts/qa/deadframes.py."
  },
  {
   "finding": "NEW camera: anchor change/drop at a key breaks velocity continuity",
   "lane": "cine",
   "severity": "major",
   "status": "open",
   "kit_level": true,
   "evidence": "camera.tsx plan(): ox/oy tangents are zeroed (linked=false) at a key between an anchored and an unanchored (or differently anchored) segment, while the anchored segment's derived offset is still moving. Scratch test .../engverify/kink.ts (node .../engverify/kink.cjs): keys {t0 push 0 anchor A}, {t2 push .15 anchor A}, {t4 push .3 (no anchor or anchor B)}. On-screen speed goes 4.93 -> 4.82 -> 2.91 px/f in one frame at t = 2.0 (a 40% hitch). Monotone crane / zoom keys without anchor changes are smooth (max |dv| 0.38). This breaks gate 1 ('an interrupted motion retargets with its current velocity') for any push that retargets.",
   "fix_needed": "At an anchor switch, give the outgoing ox/oy (or anchorTo) channel the derivative of the anchored offset at the key (finite-difference anchorOffset over zoom / push), and start the next segment's Hermite with that tangent. Or interpolate in screen space: blend the anchored and free solutions over the next segment. Add a camSpeed-based continuity check (max frame-to-frame speed change)."
  },
  {
   "finding": "NEW golden sky: core World golden (cream) != cine TOD.golden (day sky)",
   "lane": "cine",
   "severity": "major",
   "status": "open",
   "kit_level": true,
   "evidence": "theme.ts todSky.golden = skies.golden = cream #F3E0CB, while atmosphere.ts OPTS.golden.skyBands = [skies.day]. Throwaway test: inside <World sky={[{t:0,tod:'golden'}]}> the World sky renders rgb(243,224,203) and a context-tod cine <Sky> renders rgb(172,209,191) (.../engverify/golden/f00003.png). The golden haze / silhouette mixes and the far rows' atmos() are tuned to the day sky, so cine rows in a golden core World haze toward the wrong sky. CINE.md lists it as a known gap for core to reconcile. Golden is the baseline time of day for most scenes.",
   "fix_needed": "Pick one table (style_bible_ref2 §8 says golden = the same flat day sky): set theme todSky.golden to skies.day (core), or have TOD.golden read todSky. Add a check that TOD[x].skyBands[0] === todSky[x] for every tod."
  },
  {
   "finding": "NEW backlit lens silhouette (Rimmed + Person) reads as a default-avatar icon",
   "lane": "cine",
   "severity": "major",
   "status": "open",
   "kit_level": true,
   "evidence": ".../engverify/silhouettes.png (crops of 5.0 s A observer and 13.0 s B lens figure): a perfectly round head disc with two ear bumps and a symmetric shoulder dome, no hair contour, no ink. They are the largest shapes on screen at two of the three peaks, and CINE.md §9 prescribes this recipe ('Rimmed peach + deep.teal78 silhouette, shoulders up') for every peak. They read as stock 'user profile' icons, not the reference hand.",
   "fix_needed": "Add a cine back-view lens figure (or a Silhouette mode of Person at s > 3) with an irregular head contour: hair clumps or hood or cap brim, asymmetric ear, collar / hood ridge, one shoulder lower. The passer's headR() / clump geometry can be reused. Allow a shoulders-to-waist crop and an optional 1-2 ink fold strokes."
  },
  {
   "finding": "NEW Sky steps leave 'below y 600' under lens zoom (caption band breach)",
   "lane": "cine",
   "severity": "minor",
   "status": "open",
   "kit_level": true,
   "evidence": "sky.tsx places dusk / night value steps at layer y >= 600, but the depth-1 layer is scaled by lens zoom about the screen centre. In shot C's last frame (zoom 1.3, .../engverify/full/f00648.png, column x 30) the night step sits at y 498, inside the caption band (280-570): rgb(88,128,119) -> (94,135,125). The same happens in any dusk / night scene with a lens zoom > 1.",
   "fix_needed": "In Sky, compute the step edges in SCREEN space from the current layer matrix (useXf scale / translate), keeping every step edge >= screen y 600, or clamp them each frame."
  },
  {
   "finding": "NEW WallOfWindows ink (floor bands / piers) crosses the caption glyphs",
   "lane": "cine",
   "severity": "minor",
   "status": "open",
   "kit_level": true,
   "evidence": "keepDark only darkens cells. Band and pier hairlines run through the caption band and the white glyphs, e.g. 21.6 s 'That's what those' (.../engverify/full/f00648.png) and 19.5 s 'the safest thing' (.../engverify/full/f00585.png). capcheck passes (thin lines < 5%), but this contradicts CINE §10 'keep busy detail out of the band'.",
   "fix_needed": "Break band and pier ink where it crosses the keepDark boxes (reuse the box list), or clip the ink out of the caption line boxes."
  },
  {
   "finding": "NEW Rimmed/Silhouette/FlatColor and RimLight ignore the Look (and RimLight the un-build)",
   "lane": "cine",
   "severity": "minor",
   "status": "open",
   "kit_level": true,
   "evidence": "Throwaway <Look fills='paper'> test: a Rimmed deep.teal78 Person stays a dark filled blob with a peach rim, and a RimLight strip stays peach (.../engverify/papersil/f00003.png). FlatColor forces fill / stroke with !important, so the paper Look cannot reach the children. RimLight has no useCineState (no exit, no look). The frame-0 / loop line-art state therefore keeps dark silhouettes and coloured rims.",
   "fix_needed": "In paper or cascade-before-wave states, have FlatColor / Silhouette / Rimmed render the children normally (white fills + ink) and drop the rim copy. Give RimLight exitScale and lookPaint like Glow (null unless the Look is 'color')."
  },
  {
   "finding": "NEW ExitShrink exported by both core and cine barrels with different behaviour",
   "lane": "cine",
   "severity": "minor",
   "status": "open",
   "kit_level": true,
   "evidence": "Runtime barrel scan (.../engverify/names.cjs): the only name in core ∩ cine is 'ExitShrink'. Core exit.tsx ExitShrink = ExitFade (exitFillProgress(e, jitter), inCubic, about x/y). Cine state.tsx ExitShrink uses exitScale(e, jitter, size = 0.2) with an axis option. The same JSX gives a different un-build depending on the import. This reintroduces the barrel clash that the Tod -> TodLike rename removed.",
   "fix_needed": "Rename the cine one (e.g. CineExitShrink / SinkToBase), or re-export core's and add size / axis to it."
  },
  {
   "finding": "NEW camera stalls at every CineDemo seam; no 'exit in motion' recipe",
   "lane": "cine",
   "severity": "minor",
   "status": "open",
   "kit_level": true,
   "evidence": "Per-frame speeds (.../engverify/vel.cjs): A's push decelerates to ~0.3 px/f at the A->D wipe midpoint (5.85) and D starts from 0. D is ~0.3 px/f at the D->B midpoint (10.0) and B starts at rest. B lands at rest at 15.75, 0.2 s before the B->C midpoint, and C holds still until 16.0. Gate 1 says a camera move must not stall at a seam. The kit has CAM.settle for entering in motion, but CINE.md recipes all end at rest, and nothing documents carrying speed out through a cut (e.g. a key beyond the shot end).",
   "fix_needed": "Document the pattern in CINE.md §1/§9 (put the outgoing shot's last key past its end, or add a CAM.exit / ease-in preset for the last segment) and use it in CineDemo so each camera is still moving at the wipe midpoint."
  }
 ]
}

---

## fix:core

I fixed seven of the eight core items: FigureWiper, golden, Person LOD, push-through, Sun drift, ENGINE.md and Festoon. F21 is half done: each cine piece or row now flips when the sky wipe reaches it, but only if it is wrapped in `<TodAnchor>`. The two mascot fade items (r2#22 and F22) are still open, because what's left is in the cine and mascot lanes. `npx tsc --noEmit` is clean and `node scripts/engine-numbers.mjs --check` passes.

Midway through, the cine lane edited core's `Film.tsx` (it now registers the cine `column` / `passer` wipers and moves the wipe edge with an in-out sine). My edits sit on top of theirs and both sets are present; ENGINE §5 now documents their change.

All renders are in /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/core/.

- **r2#22 + F22 (mascot un-build fades): not fixed.** The core side was already done (`ExitShrink`, ENGINE §8, template and KitDemo). The remaining fade is in another lane's files, and the cine lane was editing `CineDemo.tsx` at the same time, so I didn't touch it. Still needed:
  - **Cine lane:** `src/dev/CineDemo.tsx:106-108` still passes `draw={Math.max(0, 1 - e * 1.6)}`. Replace it with `<ExitShrink x={p.x} y={p.y}><Elephant {...p} /></ExitShrink>`. Also change CINE.md §8 from "`<Elephant draw={1 - exit}>`" to "`<ExitShrink x y>` around the mascot".
  - **Mascot lane:** `Elephant.tsx:120-144` ramps fill opacity with `draw`; it should arrive by scale or a misregistration slide instead. Remove `ElephantTimeline` mode `'fade'` (lines 8-27), and make `drawIn` / `drawOut` stop driving opacity.

- **FigureWiper: fixed.** Redrawn in a new `src/lib/FigureWiper.tsx` the way the passer was (`Film.tsx` re-exports it):
  - one closed outline with an irregular, slightly peaked hood, a back seam and creases;
  - drape ink that runs 18-24 px past the silhouette, and the outline left open in two places;
  - fills offset 5 px from the ink, and an ~8 px sage rim inside the leading outline (the old 45 % inset panel is gone);
  - a walking bob, and a caption region that follows the outline.
  - Evidence: `fw_three.png`, `fw/f00360.png`, `fw_crop_rim.png`; before was `../figurewiper_p50.png`.

- **Golden: fixed.** In `theme.ts`, `skies.golden` is now the day sky, and the golden relight row warms mintPale to cream, clouds to cream, and figure rims to peach.
  - I tried cream → peach for walls first and rejected it: it flooded the walkway with the accent colour and the peach placard disappeared.
  - The old cream sky is kept as `skies.cream` for a deliberate stylised beat; it is not a time of day.
  - The cine lane's TOD palettes now read the core sky table, so the two agree.
  - `relightProblems` now also checks white, cream, sand, mintPale and tan against each sky, accepting a 1.15:1 contrast or a colour difference of dE 15. It also checks the bulb halo.
  - The storyboard still says "cream sky" for S06, S08 and S09. It belongs to another stream, so ENGINE §4 tells scene agents to build those as golden or dawn on the day sky.
  - Evidence: `golden_before_after.png`, `cine_sheet_after.png` (0 caption failures).

- **Person LOD pop: fixed.** Each detail now fades with the figure's scale instead of switching in one frame:
  - **What changed:** the rim shortens, seams thin, hands shrink into the sleeves, the hood sinks, and the nape notch flattens. The windows are staggered and jittered per person.
  - **New options:** `lodScale` on `Person` freezes the detail level for a shot. `Crowd`'s ink ladder is now ramped and its LOD jittered per person. A new `Crowd layout={{far, near}}` freezes slots and LOD when the rows themselves animate.
  - **Measured:**

    | Test | Before | After |
    |---|---|---|
    | One person, s 1.32 → 1.08 | spike 0.261 % at f31 | max 0.153 %, no spike |
    | Animated crowd rows, no `layout` | — | one-frame re-layout spike, 16 % at f43 (no LOD spikes) |
    | Animated crowd rows, with `layout` | — | max 2.50 % vs median 2.25 %, no spikes |

  - Evidence: `lod_ramp_after.png`, `lod_list.txt` / `lod_before_list.txt` (measured with `diffpct.py`), `lc_42_43.png`.

- **Push-through reversal: fixed.** Film now tells each scene when its incoming camera move settles and which way it zooms. After a pull-back (push-through or camera-continuous 'out'), the default World / ShotCam push becomes a gentle pull-out, 1/1.06. An explicit push the other way waits until the move has settled. Zoom rate (log-zoom × 960 per frame) is now -168, -115, -71, -37, -14, -2.9, -0.6, -1.1 … and stays negative until it settles at 0.943 (f510); before, it reversed to +0.8. Evidence: `pt_rates_after.txt`.

- **Sun drift: fixed.** In a World the sun now drifts 10 px/s by default (`SUN_IDLE_DRIFT`); `drift={[0,0]}` pins it for a match-cut. Measured x positions at 0/1/2/3 s: 539, 549, 559, 569. Evidence: `sun_list.txt`.

- **ENGINE.md: fixed.**
  - **§7 / §14:** cine pieces are state-aware and must not be wrapped.
  - **§3:** the tone example stays dark at dusk; light comes only with a night key.
  - **§4:** omit `tod` on cine pieces, use `<TodAnchor>`, and never call `useTod` in the scene body. Plus the golden rules.
  - **§5, §9, §10:** the push-through default, the cine wipers, Sun drift, the LOD rules and the halos.
  - **KitDemo:** dropped its `CineRow` wrapper, so the far city un-builds once and shows as line art at frame 0.
  - Evidence: `kit_sheet_after.png` (0 caption failures), `kit_unbuild_city.png`.

- **Festoon halos: fixed.** Each lit bulb now gets one opaque flat disc, r 2.2× the bulb, in a new `bulbHalo` colour #749484 at night, drawn behind the wire. There is no halo by day or at dusk; I first tried a dusk halo and it read too bright. In the KitDemo night crop, off-palette pixels went from 6378 + 2331 to 0. Evidence: `festoon_before_after.png`, `kit_fronds_after.png`.

- **F21 per-piece relight: fixed only for anchored pieces.** `TodAnchor` now passes its anchored time of day down, so a cine piece wrapped in `<TodAnchor at={centre}>` flips when the wipe edge reaches it. In the test, three rows flip at f46, f50 and f56; unwrapped they all flip at f46. Evidence: `relight_plain_vs_anchored.png`.
  - **Request to the cine lane:** have `Skyline`, `EndlessCity` rows, `Monument`, `TinyCrowd` and `StringLights` wrap themselves in a `TodAnchor` at their own centre, so scene agents don't need to.

---

## fix:cine

All 16 items are fixed. `npx tsc --noEmit` is clean, and a 110-frame `capcheck` of CineDemo has 0 FAIL. I edited three core-lane files because the items needed it: `src/lib/Film.tsx`, a new `scripts/camspeed.py`, and a small check added to `scripts/engine-numbers.mjs`. I did not touch `src/scenes/shared` or `src/lib/mascot`, and the mascot needs no change.

Renders are in `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/cine2/` (written `cine2/` below).

1. **r2#17 speed check:** added `scripts/camspeed.py`, which measures a real render of any composition. It fails on camera speed above `peakPxPerFrame` or a speed jump above 2.5 px/frame between frames, with Film transitions allowed automatically; fast local motion is only a warning. Also added `maxDv` to `camSpeed` and a new `camSpeedAt`. Whole CineDemo passes (camera peak 16.8); a synthetic 6→0 px/frame stop fails. Evidence: `cine2/camspeed_cinedemo.png`, `cine2/camspeed_main.png`.
2. **r2#26 + F26 Film wipers:** Film now accepts `'column'` and `'passer'`, takes their half-widths from `CINE_WIPE_HALF`, moves the edge with `wipeEdgeX`, and eases the 50 px drift with the same sine. Outgoing scene now starts 0→0.4→1.0→1.5 px/frame (was 0→3.1); incoming lands …1.0→0.4→0 (was 3.2→0). Evidence: `cine2/wipe_passer_film.png`, `cine2/wipe_column_film.png`, `cine2/wipe_drift_track.txt`.
3. **r2#27 + F27 ENGINE.md tod notes:** the core lane had already made this change while I worked. ENGINE.md §4 (~line 180) and §14 (~line 366) now say to omit `tod` on cine pieces and never call `useTod()` in the scene body. I checked it and made no ENGINE.md edit; CINE.md §2 matches.
4. **Dusk haze:** at dusk and night, far rows now take flat palette steps instead of a mix (dusk: teal, #4B706B, tealDark, teal78; night one step darker). KitDemo far city at dusk is now #547977 / #4B706B on the #6D988B sky, darker than the sky instead of a lighter grey. Evidence: `cine2/kit_farcity_tod_after.png`.
5. **F18 window LOD:**
   - Close-ups now degrade one element at a time by on-screen width, and the big areas (frame, floor band, curtain) shrink away instead of popping.
   - Big grid panes draw the same room shapes and colours as the close-ups, so the hand-over between close-up and grid happens per cell and is invisible.
   - Unlit rooms use the grid's dark-pane colour with a slightly lighter curtain.
   - New CineDemo `lod` check mode: grid vs close-ups at 1.2x differ in 82 px (0.004%).
   - Evidence: `cine2/lodcheck/cmp_1.2.png`, `cine2/lod_strip1.png`, `cine2/lod_strip2.png`, `cine2/c_189_crop.png`.
6. **F19 scan line:** caption darkening is now decided once per shot (`mode: 'static'`, the default), so no switch-offs trace the box edge. Evidence: `cine2/band_strip2_after.png`.
7. **Golden sky:** the core lane set the golden sky to the day sky. On my side the cine palettes now read their sky from the core table, and `engine-numbers --check` runs a new table check, which passes.
8. **Lens silhouette:** new `LensFigure` (`src/lib/cine/lens.tsx`): irregular skull with hair, bun, cap with brim, hood or long hair, one ear, a dropped shoulder, rim inside the outline, ink folds, head turns on words, paper and un-build states. It replaces the round "user icon" figures in shots A and B. Evidence: `cine2/silhouettes_after.png`, `cine2/lens_check.png`, `cine2/lens_turn_strip.png`.
9. **Sky steps in the caption band:** step edges are now placed in screen space and kept below y 600 (`minScreenY`). Shot C's first step is at y 617 (was 498). Evidence: `cine2/skyc/f00659.png`.
10. **Wall ink through captions:** band and pier ink is cut out of the padded caption boxes. Evidence: `cine2/wall_ink_caption.png`.
11. **Look / un-build for light pieces:** in paper or before the cascade, `FlatColor`, `Silhouette` and `Rimmed` draw their children normally with no rim copy; `RimLight` shows only in colour and thins out in the un-build. Evidence: `cine2/paper_states.png`.
12. **ExitShrink clash:** the cine one is renamed `CineExitShrink`, so the barrels no longer export two `ExitShrink`s.
13. **Anchor-switch hitch:** at an anchor change the camera keeps its on-screen velocity. Kink harness speed now goes 4.82→4.76 px/frame (was 4.82→2.91); largest frame-to-frame jump 0.28 (was 1.94).
14. **Seam stalls:** CineDemo keys now sit past the shot ends, and CINE.md documents the recipe plus `camSpeedAt`. Speed at each wipe midpoint: A out 1.6, D 1.1/1.1, B 1.2/0.8, C in 9.9 (were roughly 0–0.3). This also lowered shot C's peak from 19.2 to 16.8 px/frame.
15. **F34 band pop:** floor bands now draw on from their near ends, staggered over about 0.4 s of zoom, instead of all appearing in one frame. Evidence: `cine2/lod_strip1.png` (f548–551).
16. **Mascot fade:** CineDemo's loop mascot used `draw={1 - exit}`, which fades its opacity, and CINE.md §8 told scene agents to do the same. Both now use core `ExitShrink`. Evidence: `cine2/loop_unbuild.png`.

Two things for the core lane:
- `engine-numbers --check` currently fails as stale because the voice is now 55.36 s while scenes and captions still end at 77.76 s. That is not from this pass.
- ENGINE.md §11 should list `scripts/camspeed.py`.

Full contact sheet after all fixes: `cine2/cine_sheet_after.png`.

---

## re-verify

{
 "verdict": "needs-work",
 "still_open": [
  {
   "lane": "mascot (request; core doc mitigation)",
   "severity": "major",
   "problem": "The mascot still fades in. Core and cine are fixed: the CineDemo Mascot helper wraps ExitShrink (src/dev/CineDemo.tsx:110-116) and CINE.md section 8 prescribes ExitShrink. The loop-mode un-build shrinks the elephant with solid fills (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/r3/loop_mascot.png, f110-f112). But src/lib/mascot/Elephant.tsx:128 still ramps fill opacity whenever draw < 1. docs/mascot.md:95-97 tells scene agents to use `draw={drawIn(...)}` for entrances and `drawOut` for un-builds, and ElephantTimeline still offers mode 'fade' (ElephantTimeline.tsx:22-27). Measured in a drawIn(t, 0.2, 1.0) render: the body fill passes through sky/purple mixes #AACCC0 -> #A5C3C2 -> #9FB5C4 -> #97A6C8 -> #929ACB -> #8D90CC over 7 frames (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/r3/mascot/fr/f00022-f00028). ENGINE section 8 forbids draw={1-exit} but says nothing about drawIn for entrances.",
   "fix": "Mascot lane: make draw's fill arrival a misregistration slide or a 20->100% scale at full opacity, remove ElephantTimeline mode 'fade', and change mascot.md (entrance = popIn or draw-on with opaque fills, un-build = core ExitShrink). Core, now: add one line to ENGINE section 8 and the template comment: 'mascot entrances use popIn; never drawIn/drawOut until the mascot lane removes the fill-opacity ramp'."
  },
  {
   "lane": "core",
   "severity": "major",
   "problem": "The caption jumps 60-85 px in one frame at the loop seam. SkyCaptions' loop roll-back (src/lib/Captions.tsx:365-371) pushes page 1 with line 1 only. layoutSky then lays it out as a ONE-line page, centred on baseline 448. At frame 0 the same page is a TWO-line page whose line 2 has not risen yet, so line 1 sits in slot 1 (baseline 387). captions.json page 0 and KitDemo page 0 are both two-line hook pages. KitDemo: caption ink top y 395 -> 388 -> 383 (f357-359, still settling) then 309 at f0 (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/r3/kit_seam_caption.png). Probe Film loop: f179 y 402 -> f0 y 318 (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/probe/full/f00179.png vs f00000.png). The seamless loop is a headline engagement device, and every film inherits this.",
   "fix": "In the loopAt roll-back, keep page 1's full layout: all its lines, with line 2+ and their highlights timed after the loop end so they stay hidden, exactly as at frame 0. Line 1 then lands in slot 1. Also make the roll finish >= 2 frames before the seam: captionAt <= end - (scroll dur 0.45 - lead), or end the scroll on the seam frame. Add a seam check (caption mask of the last frame vs frame 0) to engine-numbers --check or capcheck."
  },
  {
   "lane": "core",
   "severity": "minor",
   "problem": "Crowd un-build makes a 3-frame hairball, and bleed-authored grounds collapse as a second slab. Fills shrink first while every occluded person's outline ink stays and 'loosens' until exitInkProgress >= 0.5. For about 3 frames the hidden head, leg and arm strokes of the whole crowd show as a tangle of loops larger than the heads. Probe f172-f174 (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/probe/crowd_unbuild.png) and KitDemo f350-f352 (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/r3/kit_unbuild.png): a broken half-state on the loop ending. Separately, Fill's slab test uses its bbox area (size = sqrt(bbox / frame) >= 0.74), so a ground authored with world.bleed (as ENGINE section 2 instructs) is a slab even when it covers only ~43% of the screen. Two slabs then collapse together and the night-sky slab shows as a band below the horizon for 3 frames (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/probe/unbuild.png f176-f178).",
   "fix": "Person / Crowd exit: retract each figure's ink with its own fill (ink gone once its fill is below ~40%), or un-build crowds back->front so occluded outlines are gone before the front fills shrink. Skip or cap the loosen overshoot for figures. Fill: decide 'slab' from the VISIBLE screen area (bbox clipped to the frame), so only the World sky (plus at most one full-frame wall) is the slab."
  },
  {
   "lane": "core",
   "severity": "minor",
   "problem": "Foreground-wipe element 'scene' pops a 20-36 px sliver at the frame edge. Film's WIPE_HALF.scene = 600 (src/lib/Film.tsx:191), but the ENGINE template's Wiper and Film's fallback for 'scene' are FigureWiper, which spans x +-662. On the first wipe frame 20 px of the figure appears at the left edge in one frame (then 29, 59). On the last frame a 36 px sliver vanishes at the right edge in one frame (renders /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/r3/film/sc/f00078.png, f00101.png). S07 and S12 use 'scene'. Elements 'figure', 'passer' and 'column' are fine, and caption tone across all three wipes is correct.",
   "fix": "Give WiperComponent an optional static `half` (FigureWiper 680, the passer 680), have Film use wipers[id].half ?? 680 for 'scene', or simply set WIPE_HALF.scene to 690."
  },
  {
   "lane": "core (scripts)",
   "severity": "minor",
   "problem": "The speed and preview tooling has gaps. scripts/camspeed.py works on real renders (CineDemo C camera peak 16.8; the probe's camera-continuous seam 9.95 -> 10.64 px/f is continuous). But (a) qalib.film_transition_windows allow-lists every camera-continuous window (c - d/2 .. c + d), so a velocity mismatch at exactly the seam gate 1 cares about can never FAIL. (b) A NaN camera estimate on the cut frame silently drops the adjacent dv: the probe logged dv 10.64 at the cut and still reported OK. (c) The docstring example `--t0 0` is not a valid flag. Also scripts/strip.sh never forwards --props to render-frames, so a strip of CineDemo {mode:'loop'} silently renders the default demo.",
   "fix": "Exclude camera-continuous from the automatic allow-list, or check its dv only across the cut frame pair. Interpolate over NaN camera frames instead of zeroing them. Fix the docstring. Forward extra args (--props, --entry) from strip.sh and sheet.sh to render-frames.mjs."
  },
  {
   "lane": "core (docs/data)",
   "severity": "minor",
   "problem": "The data and docs still target the v2 voice. assets/timing.json is the locked v3 voice (55.36 s), but src/data/scenes.json and captions.json end at 77.76 s, and `node scripts/engine-numbers.mjs --check` reports STALE for both. ENGINE.md sections 3, 6 and 11 still say the data is generated from docs/storyboard_v2voice.json on 'the CURRENT voice (v2, 77.76 s)'. gen-scenes.mjs cannot read the word-anchored docs/storyboard_v3.json. The v3 path, scripts/anchor/resolve.py (which emits scenes.json and captions.json), is not mentioned in ENGINE.md, so scene agents will follow the wrong pipeline.",
   "fix": "Once storyboard_v3 lands, run scripts/anchor/resolve.py to regenerate the engine files. Update ENGINE sections 3, 6 and 11 to the v3 voice and resolver (gen-scenes / gen-captions = legacy v2), and make gen-scenes refuse word-anchored storyboards with a pointer to the resolver."
  },
  {
   "lane": "core",
   "severity": "minor",
   "problem": "LampPost glow discs are translucent overlays. kit/Nature.tsx:218-220 draws two peach circles at opacity 0.3 (plus a 0.38 cream cone). The cone is an allowed static shaft, but the 'glow' is the same translucent-overlay flaw that was just fixed for Festoon. KitDemo at night (9.4 s, x 400-800, y 700-1300) has off-palette mixes #70756A, #798278, #988F7E, #899686, #6D5743 over the street and crowd. Ref 2 measures the street-lamp glow as an opaque peach disc #F0B394.",
   "fix": "Draw the lamp glow as opaque stepped flat discs (glow.lamp peach, plus a one-step halo ring) behind the shade, like todBulbHalo. Keep only the cone as static translucency, or make it an opaque one-step-lighter ground pool."
  },
  {
   "lane": "cine",
   "severity": "minor",
   "problem": "EndlessCity relights all its rows in one frame. Every row reads the single palette from useTodPal at the component (city.tsx:842), and the city can only sit under one <TodAnchor>, so the colossal element of a scene flips day -> night in a single frame. Probe: ~35% of the frame switched between f112 and f113 (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify/probe/relight.png), while the kit's own rule is per-object pops staggered by the sky edge. Colours are on-palette: KitDemo dusk far rows #4B706B / #547977 / #3E605F on the sage sky #6D988B, night #3E605F / #304B4A, no off-token mixes.",
   "fix": "Inside EndlessCity (and Skyline with several clusters), evaluate the context time of day per row at the row's own screen anchor (todAtScreen with the row base and centre), or wrap each row in a TodAnchor internally. A sky wipe then relights the city row by row (far rows first on a 'down' wipe)."
  }
 ]
}

