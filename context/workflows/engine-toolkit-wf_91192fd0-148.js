export const meta = {
  name: 'engine-toolkit',
  description: 'Build the Remotion hand-drawn motion toolkit (ink, fills, pops, captions, card, transitions, kit props), review it against the reference on two lenses, and fix',
  phases: [
    { title: 'Build', detail: 'toolkit + KitDemo + preview scripts' },
    { title: 'Review', detail: 'style-fidelity and motion/API reviewers' },
    { title: 'Fix', detail: 'apply review findings' },
  ],
}

const ROOT = '/home/user/Test-/video'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad'

const BUILD = `
You are the lead motion-graphics engineer. Project: ${ROOT} (Remotion 4.0.538 + React 18 + TypeScript, already installed and smoke-tested).
FIRST read ${ROOT}/docs/BRIEF.md. Study the reference images: ${ROOT}/assets/ref/f_5.5.png, f_9.0.png, f_12.0.png, f_3.0.png, sheet_2fps_a.png, trans1.png, caproll.png, flip.png, ending.png (Read tool shows images). Shared tokens: ${ROOT}/src/lib/theme.ts (read it; you may ADD keys, do not change existing values — a style stream refines them later).
Other streams are working in parallel: a style-bible stream (docs/style_bible.md, docs/theme_proposal.json, public/fonts/CaptionHand.woff2), a motion-analysis stream (docs/motion_spec.md), a timing stream (assets/timing.json), a mascot stream (src/lib/mascot/**), a storyboard panel (docs/storyboard.json). If their files exist when you need them, use them; otherwise use sensible defaults that are easy to retune.

YOUR LANE: src/lib/** (except src/lib/mascot/**), src/dev/KitDemo.tsx, src/Root.tsx, src/Main.tsx, src/scenes/index.ts and placeholder scene files, src/data/*.json samples, scripts/**.

Build a toolkit that lets ~12 parallel scene agents create reference-quality hand-drawn animated illustrations fast. EVERYTHING time-based in SECONDS and deterministic (no Math.random; use remotion random(seed)).

Required modules (names are suggestions; keep the API small, typed, documented with a short header comment and an example):
1. time.ts: useTime() = scene-local seconds (via a SceneTime context provider that Main/scene compositions set), useGlobalTime(); prog(t, start, dur, ease?) clamped 0..1; easing presets (outCubic, inOutCubic, outBack(overshoot), outQuint, inCubic...); springAt(t, start, cfg) in seconds; stagger helpers.
2. sketch.ts: pure functions that return SVG path strings in the reference's ARCHITECTURAL INK SKETCH look: line(x1,y1,x2,y2,{overshoot, bow, seed}) with lines extending past their endpoints like the reference; rect/box with corner overshoot (edges as separate strokes); polyline; wobbly circle/ellipse (hand-drawn with slight gap/overlap); scalloped tree crown; window glint ticks; hatching; arrows; check and cross marks. Deterministic by seed.
3. Ink.tsx: <Ink d at dur ease width color/> draw-on with stroke-dashoffset using @remotion/paths getLength (cache lengths). Multi-subpath support (split on M). Round caps. Also <InkGroup> to sequence many strokes with stagger.
4. Fill.tsx: flat fills, slightly MISREGISTERED from the linework (offset a few px, like the reference), modes: fade, pop (scale from origin), wipe (direction), grow-up. Fills land a beat after their linework.
5. Motion wrappers: <Pop at x y origin> (scale with springy overshoot), <Move from to at dur ease>, <Walk> (translation + bob), <Appear> (opacity), <Wobble> idle micro motion. Must compose inside SVG (use <g transform>).
6. Exit/un-build support: a SceneExit context (0..1) that Ink and Fill read so a scene can automatically "un-build" (fills drain/collapse, then lines retract) without per-scene code, used for the final loop and optional transitions.
7. Card.tsx: mint page + white polaroid card (geometry from theme.ts) with an SVG layer in card-local coords (960x1400); the card supports transitions driven by Main: 3D Y-axis flip (pre-tilt ~3 deg, ease-in to edge-on, swap content, ease-out with tiny overshoot; perspective like the reference flip.png), push/slide, zoom-through. Subtle card shadow/edge. Optional very subtle paper grain (cheap: one static noise texture, no per-frame filters).
8. Sun.tsx: the orange disc (theme.sun) with modes: plain, pulse, set/rise (move), and a slot for overlays so scenes can morph it (power symbol, clock hands).
9. Captions.tsx: renders caption beats in the caption zone, reference grammar: centered 1–2 lines, hand font (@font-face 'CaptionHand' from staticFile('fonts/CaptionHand.woff2'); if that file does not exist yet, install @fontsource/patrick-hand via npm and copy a latin woff2 there as a placeholder; wait for the font with delayRender/continueRender), line 2 rolls in when its word is spoken, the whole caption rolls up/out as the next rolls in (match caproll.png), keyword highlight box (theme.highlight) wipes in left-to-right behind the keyword at its time. Caption data type: { s, e, lines: {text, s}[], highlights: {text, s}[] }. Sample data in src/data/captions.json.
10. kit/ (reusable illustration components in the reference look, each with build-in animation props like at/dur/seed): Person (back view, like the reference crowd: head circle, hair variants, shoulders, backpack/headphones/phone-up variants, palette-varied), Crowd (rows in perspective, staggered fill-in), Building/Facade (parametric floors, windows with glass fill + glints, balconies, door, shop sign), Window, Door, Tree, Bike, Birds on a wire, Lamp post, BrowserWindow (a website as a browser window: title bar dots, content blocks), Padlock, Noticeboard (like the reference's board), Paper/Notice. Quality bar: put a KitDemo frame next to f_5.5.png and f_9.0.png and it should look like the same artist drew it.
11. Scene framework + Main: src/data/scenes.json [{id,start,end,transitionIn:{type,dur}}] + src/scenes/index.ts mapping id -> component. Main.tsx sequences scenes on the VO timeline with transitions (outgoing and incoming scenes must keep rendering through transition overlap: scenes hold their final state past their end), renders Captions inside the card so they flip with it, plays public/vo.mp3. Root.tsx registers Main plus one composition per scene id ("S01"...) that renders that scene alone with the card, captions and VO offset to the scene's time range, plus devCompositions from src/dev/registry.ts (keep that registry mechanism; you own only the KitDemo entry). Create 2 placeholder scenes to prove a flip and an un-build.
12. scripts/still.sh <CompId> <seconds> <out.png> and scripts/sheet.sh <CompId> <t0> <t1> <count> <out.png> (renders count frames evenly across t0..t1 in ONE remotion invocation — e.g. render --sequence with --frames range and --every-nth-frame or similar — then tiles them with ImageMagick montage/convert into a labeled contact sheet). These are how every agent will check its work, so make them fast and robust.
13. src/dev/KitDemo.tsx: a 12 s showcase scene that exercises everything (a street corner with a facade, noticeboard, people building up, a crowd filling in, tree, bike, birds, browser window, padlock; a caption sequence with a highlight; ends with an un-build).

Verify: npx tsc --noEmit clean; render stills and sheets of KitDemo and the placeholders; LOOK at them (Read the PNGs) next to the reference stills and iterate until the look is genuinely close: ink weight, overshoot, misregistered fills, palette, density, crowd charm. Measure render speed (ms/frame) with a short npx remotion render of KitDemo (--concurrency=2) and keep it reasonable (avoid SVG filters per frame).
Write ${ROOT}/docs/ENGINE.md: the API cheat-sheet for scene agents (imports, every component/function signature, a complete minimal scene example, coordinate system, how to preview with the scripts, performance do's and don'ts). Keep it accurate to the code.
Final message: summary of the API, render speed, file list, known gaps.`

phase('Build')
const built = await agent(BUILD, { label: 'engine:build', phase: 'Build' })

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['ship', 'needs-work'] },
    findings: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      area: { type: 'string' }, problem: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' },
    }, required: ['severity', 'area', 'problem', 'fix'] } },
  },
  required: ['verdict', 'findings'],
}

const LENSES = [
  { key: 'style', brief: `STYLE FIDELITY. Render KitDemo stills at several times (scripts/still.sh or npx remotion still) into ${SCRATCH}/review/ and compare them side by side with ${ROOT}/assets/ref/f_5.5.png, f_9.0.png, f_12.0.png, f_3.0.png. Judge: ink line weight/color/overshoot, misregistered flat fills, palette harmony, people and crowd charm, building/window vocabulary, density of detail, caption typography and highlight box, card/sun proportions in 9:16. If docs/style_bible.md exists, check against it too. Be specific and visual: which component, what is wrong, what exact change.` },
  { key: 'motion', brief: `MOTION, FLUIDITY & API. Render contact sheets of KitDemo across time (scripts/sheet.sh) into ${SCRATCH}/review/ and compare with ${ROOT}/assets/ref/trans1.png, caproll.png, flip.png, ending.png. Judge: draw-on speed, fill lag, pop overshoot, stagger rhythm, caption roll-up and highlight wipe, flip and un-build smoothness, idle life. If docs/motion_spec.md exists, check numbers against it. Also judge the API from a scene-author's view by reading docs/ENGINE.md and writing a tiny throwaway scene in ${SCRATCH} (not in the repo): is it ergonomic, typed, deterministic, time-based? Check npx tsc --noEmit and render speed.` },
]

let findings = []
for (let round = 1; round <= 2; round++) {
  phase('Review')
  const reviews = await parallel(LENSES.map(l => () => agent(
    `You review a Remotion hand-drawn animation toolkit at ${ROOT} (read docs/BRIEF.md and docs/ENGINE.md first). Do NOT edit files in the repo. LENS: ${l.brief}\nReport concrete findings with exact fixes. Verdict "ship" only if a top motion designer would accept it as matching the reference.`,
    { label: `review:${l.key}:r${round}`, phase: 'Review', schema: REVIEW_SCHEMA })))
  const rs = reviews.filter(Boolean)
  findings = rs.flatMap(r => r.findings)
  const blocking = findings.filter(f => f.severity !== 'minor')
  log(`Round ${round}: ${rs.map(r => r.verdict).join('/')} — ${blocking.length} blocker/major, ${findings.length - blocking.length} minor`)
  if (rs.every(r => r.verdict === 'ship') && blocking.length === 0) break
  phase('Fix')
  await agent(
    `You are the lead motion-graphics engineer of the toolkit at ${ROOT} (read docs/BRIEF.md, docs/ENGINE.md; your lane: src/lib/** except src/lib/mascot/**, src/dev/KitDemo.tsx, src/Root.tsx, src/Main.tsx, src/scenes/index.ts, placeholder scenes, src/data samples, scripts/**). Reviewers found:\n${JSON.stringify(findings, null, 1)}\nFix every blocker and major and the cheap minors. Re-render and LOOK at results next to the reference stills to confirm. Keep docs/ENGINE.md accurate. tsc must be clean. Final message: what changed per finding.`,
    { label: `engine:fix:r${round}`, phase: 'Fix' })
}

return { built, remaining: findings }
