export const meta = {
  name: 'engine-v2-cinematic',
  description: 'Convert the hand-drawn toolkit to full-bleed cinematic scale: core engine (captions in sky, transitions, timing calibration) and a cinematic kit (multiplane camera, light, skylines), then review and fix',
  phases: [
    { title: 'Build', detail: 'core engine v2 and cinematic kit in parallel lanes' },
    { title: 'Review', detail: 'scale/style and motion/API reviewers' },
    { title: 'Fix', detail: 'both lanes fix their findings' },
  ],
}

const ROOT = '/home/user/Test-/video'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad'

const CONTEXT = `
Project: ${ROOT} (Remotion 4.0.538 + React 18 + TypeScript). FIRST read ${ROOT}/docs/BRIEF.md, especially the section "CINEMATIC DIRECTION" at the top: the user wants the video FULL-BLEED (no polaroid card) and CINEMATIC, making the viewer feel SMALL like Arcane's shots, in the hand-drawn ink style of the references.
Look at: ${ROOT}/assets/ref2/sheet.png, ${ROOT}/assets/ref2/f_1.png, f_12.png, f_33.png, f_42.png (reference 2: full-bleed, same artist family), ${ROOT}/assets/ref_cinematic/arcane_collage.jpg (the scale we want), and reference 1 stills ${ROOT}/assets/ref/f_5.5.png, f_9.0.png (the ink look). Use the Read tool on images.
Binding specs (measured): ${ROOT}/docs/style_bible.md (look; numbers), ${ROOT}/docs/motion_spec.md (motion constants, sync grammar, NO opacity fades, the sun as a character, >= 5 events/s), ${ROOT}/assets/timing.json (VO timing and caption beats), ${ROOT}/docs/mascot.md (elephant mascot API in src/lib/mascot, owned by another stream: import it, don't edit it). Tokens: ${ROOT}/src/lib/theme.ts (you may add keys).
A toolkit already exists (~4,600 lines, typechecks, renders ~0.6 s/frame): src/lib/{time,sketch,Ink,Fill,motion,exit,timeline,Captions,Card,Sun,font,rng,xf}.ts(x) and src/lib/kit/* (Person, Crowd, Building, Window, Door, Nature, Noticeboard, Padlock, BrowserWindow, Icons), plus src/Main.tsx, src/Root.tsx, src/scenes/*, scripts/still.sh and scripts/sheet.sh (preview tools: use them). Read the code before changing it. Keep existing exported APIs backward compatible unless a change is clearly better; the other lane depends on them.
All animation is time-based in SECONDS and deterministic (remotion random(seed), no Math.random). No CSS/SVG blur filters or gradients (flat style; also too slow). Check: npx tsc --noEmit clean; render stills/sheets and LOOK at them next to the references; keep render speed reasonable (report ms/frame at concurrency 2).
Two lanes work in parallel; stay in yours:
- CORE lane: src/lib/** except src/lib/cine/** and src/lib/mascot/**; src/Main.tsx, src/Root.tsx, src/scenes/index.ts + placeholder scenes, src/data/**, scripts/**, src/dev/KitDemo.tsx, docs/ENGINE.md.
- CINE lane: src/lib/cine/** (new), src/dev/CineDemo.tsx (its durationSeconds entry in src/dev/registry.ts too), docs/CINE.md.
`

const CORE = `${CONTEXT}
YOU ARE THE CORE LANE. Deliver engine v2:
1. Full-bleed stage: a <World>/<Frame> (name it well) that renders a scene full-bleed 1080x1920 (world coords = canvas coords at camera rest) with the scene's sky as background. Keep <Card> available but no longer the default.
2. Captions v2 in the SKY: centered on x=540, line-1 baseline ~y 330, line-2 ~y 426 (theme tokens; 82 px CaptionHand), max width ~860, screen-space (unaffected by scene camera), with a tone switch (dark ink on light skies; white or cream on dark skies) driven by scene data with an exact switch time. Calibrate to docs/motion_spec.md: page change = whole stack scrolls up with cubic-bezier(0,0.7,0.12,1) over 0.45 s, old page gone in 2–3 frames, NO fade; line 2 rises ~one line pitch over ~0.42 s; highlight wipe L->R with bezier(0.3,0.3,0.1,1), 0.19 s + 0.3 ms/px; lead times relative to word starts: page -0.04 s, line 2 -0.08 s, highlight -0.10 s (apply in the component; timing.json stays at word starts). Captions data comes from src/data/captions.json, generated from assets/timing.json by a script you write (scripts/gen-captions.mjs) so it can be regenerated.
3. Calibrate primitives to the motion spec: no opacity fades anywhere (pops, scale, wipes, slides); draw-on strokes 3–6 frames each regardless of length with ~1-frame staggered starts; fills pop/grow 20%->100% over 3–4 frames, landing 4–8 frames after their outline starts; rise-ins with Easing.out(exp) 0.33 s or spring {damping 40, stiffness 700, mass 1}; Sun as a character (beat pulse +4–13% on given word times, bounce, squash-and-stretch hop) and big (r ~150) for full-bleed scenes; un-build recipe (lines loosen, fills shrink, ink retracts, slab collapse) per the spec.
4. Fix the kit's look against the style bible: people are ALWAYS seen from behind (no faces) — fix any front-facing smiley figures; crowds layered in perspective with depth-based ink weight (4.8 front / 3.4 mid / 2.2 far / 1.6 hairline, no ink on far things); misregistration per theme.misreg; palette tokens only.
5. Main v2: sequences scenes from src/data/scenes.json [{id,start,end,transitionIn:{type,dur}, captionTone:[{t,tone}]}] full-bleed. Transition types: cut, matchcut (cut; the scenes align their shared objects), camera-continuous (outgoing scene's camera push hands over to incoming scene), foreground-wipe (a scene-provided foreground element sweeps across), push-through (zoom into a point of the outgoing scene, incoming scene starts zoomed out from it), unbuild (spec recipe; used for the loop). Outgoing and incoming scenes keep rendering through overlaps (they hold their end state). Audio: public/mix.wav if present else public/vo.mp3. Root registers Main, one composition per scene (renders that scene alone with captions + audio offset to its range), and src/dev/registry.ts compositions (you own only the KitDemo entry).
6. KitDemo v2: a 12 s full-bleed eye-level street like reference 2 (one-point perspective, crowd from behind, string lights, captions in the sky, a sun on the horizon, an un-build at the end) that exercises core features.
7. docs/ENGINE.md: accurate API cheat-sheet for scene agents, including a complete minimal full-bleed scene example, the coordinate system, caption tones, transitions, preview commands, performance rules. Reference docs/CINE.md for the camera/light/skyline kit (the other lane writes it).
Final message: API summary, render speed, files changed, known gaps.`

const CINE = `${CONTEXT}
YOU ARE THE CINE LANE. Build src/lib/cine/**: the cinematic-scale kit that makes viewers feel small, in the flat hand-drawn ink style. Import Ink/Fill/sketch/time/motion from src/lib (read them first). Deliver:
1. Camera + multiplane: <Camera keys=[{t, x, y, zoom, rot?, ease}]> (or similar) with smooth weighty eases (default inOutCubic/inOutSine over 2–6 s, optional subtle handheld drift), and <Layer depth={0..1}> children that parallax by depth (far layers move less; zoom scales layers by depth for a real dolly feel). Must compose with scene-local time and be cheap.
2. Atmosphere: depth-tinted palettes — a function that maps a palette color + depth + time of day to a flatter, sky-ward tint (stepped, not continuous gradients); time-of-day palette sets (day, golden, dusk, night, dawn) as theme-compatible tokens derived from the reference palette (dusk/night ramps toward deep teal like reference 2's last frames; lit windows peach/cream).
3. Sky: flat banded sky (a few horizontal value steps), flat clouds (reference style), stars for night, haze/fog bands between layers.
4. BigSun: the huge orange disc (r ~150 by default) sitting on/behind the horizon with a set/rise path, compatible with the core lane's Sun-as-character behaviors (coordinate: the core lane owns src/lib/Sun.tsx; you can wrap it or provide a scene-level helper).
5. Light (flat): LightShaft (translucent flat polygons from a source, optional slow sweep), Glow (stepped concentric flat discs), RimLight (one-sided lighter edge strip helper), LitWindows (grids of windows that switch on/off in staggered patterns — needed for "websites switched off" and night cities), Silhouette (fill-only dark shapes of any kit element or path).
6. Scale kit: EndlessCity / Skyline (procedural rows of buildings receding to the horizon in 4–6 depth layers with atmospheric tint and window grids; must render FAST: batch windows into a few paths per layer, memoize by seed), Tower (monumental building in worm's-eye 3-point perspective with converging verticals), PerspectiveStreet (one-point street like reference 2: road, sidewalks, facades converging to a vanishing point, poles, wires, string lights), WallOfWindows (a vast facade receding in perspective, thousands of windows, cheap), Monument (a colossal civic/government building with columns and steps), StringLights, Wires/Poles, tiny Figure/Crowd silhouettes for the far distance (back-view, fill-only, 6–30 px tall).
7. CineDemo (src/dev/CineDemo.tsx, 18 s, full-bleed, captions optional): three shots that prove the direction, each with camera motion and continuous small life (>= 5 events/s): (a) Arcane vista: the tiny elephant mascot (src/lib/mascot, pose sit-back) and a back-view figure on a ledge overlooking an endless city at dusk with a giant low sun, windows lighting up across the city, slow push-in; (b) worm's-eye: a monumental government building towering over tiny people, light shaft, tilt-up crane reveal; (c) pull-back reveal: from one lit window to a wall of thousands of windows going dark in waves. Iterate visually until these frames genuinely give a sense of scale and look hand-drawn by the same artist as the references, not generic vector art.
8. docs/CINE.md: API cheat-sheet with examples and performance rules.
Final message: API summary, render speed of CineDemo, files, known gaps.`

phase('Build')
const builds = await parallel([
  () => agent(CORE, { effort: 'max', label: 'core:build', phase: 'Build' }),
  () => agent(CINE, { effort: 'max', label: 'cine:build', phase: 'Build' }),
])

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['ship', 'needs-work'] },
    findings: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      lane: { type: 'string', enum: ['core', 'cine'] },
      area: { type: 'string' }, problem: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' },
    }, required: ['severity', 'lane', 'area', 'problem', 'fix'] } },
  },
  required: ['verdict', 'findings'],
}

const LENSES = [
  { key: 'scale-style', brief: `SCALE & STYLE. Render stills of CineDemo (several times per shot) and KitDemo with scripts/still.sh into ${SCRATCH}/review2/ and compare side by side with ${ROOT}/assets/ref_cinematic/arcane_collage.jpg, ${ROOT}/assets/ref2/f_*.png and ${ROOT}/assets/ref/f_5.5.png. Does each shot make the viewer feel SMALL (scale contrast, depth, light, composition)? Does it look hand-drawn by the reference artist (ink weight by depth, overshoot, misregistered flat fills, palette, people from behind) rather than generic vector art? Captions in the sky correct (size, position, tone, highlight)? Be concrete: component, problem, exact fix.` },
  { key: 'motion-api', brief: `MOTION, FLUIDITY, API & PERFORMANCE. Render contact sheets across time (scripts/sheet.sh) of CineDemo and KitDemo into ${SCRATCH}/review2/. Check against docs/motion_spec.md: no opacity fades, draw-on/fill/pop timings, caption scroll curve and lead times, highlight wipe, sun character behavior, camera eases weighty and smooth with correct parallax, no jitter or popping artifacts, density >= 5 events/s. Read docs/ENGINE.md and docs/CINE.md and write a tiny throwaway full-bleed scene in ${SCRATCH}/apitest/ (not in the repo) using both kits plus the mascot: is the API ergonomic, typed, deterministic? npx tsc --noEmit; render speed at concurrency 2 (a 70 s video must render in reasonable time).` },
]

let findings = []
for (let round = 1; round <= 2; round++) {
  phase('Review')
  const reviews = await parallel(LENSES.map(l => () => agent(
    `${CONTEXT}\nYou are a REVIEWER of both lanes. Do NOT edit repo files. LENS: ${l.brief}\nVerdict "ship" only if a top motion designer would accept it for this direction. Tag each finding with its lane (core or cine).`,
    { effort: 'max', label: `review:${l.key}:r${round}`, phase: 'Review', schema: REVIEW_SCHEMA })))
  const rs = reviews.filter(Boolean)
  findings = rs.flatMap(r => r.findings)
  const blocking = findings.filter(f => f.severity !== 'minor')
  log(`Round ${round}: ${rs.map(r => r.verdict).join('/')} — ${blocking.length} blocker/major, ${findings.length - blocking.length} minor`)
  if (rs.every(r => r.verdict === 'ship') && blocking.length === 0) break
  phase('Fix')
  await parallel(['core', 'cine'].map(lane => () => {
    const mine = findings.filter(f => f.lane === lane)
    if (!mine.length) return Promise.resolve('nothing')
    return agent(`${CONTEXT}\nYOU ARE THE ${lane.toUpperCase()} LANE (stay in your lane). Reviewers found:\n${JSON.stringify(mine, null, 1)}\nFix every blocker and major and the cheap minors. Re-render and LOOK at the results next to the references to confirm. Keep your docs accurate. tsc must be clean. Final message: what changed per finding.`,
      { effort: 'max', label: `${lane}:fix:r${round}`, phase: 'Fix' })
  }))
}

return { builds, remaining: findings }
