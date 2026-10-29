export const meta = {
  name: 'scene-production',
  description: 'Build a group of storyboard-v3 scenes on the engine + shared kit, gate each with QA tools and two independent reviewers (art direction, motion/sync), and fix until every scene scores >= 8/10',
  phases: [
    { title: 'Build', detail: 'one builder per scene' },
    { title: 'Review', detail: 'QA gate + art director + motion/sync reviewer' },
    { title: 'Fix', detail: 'fix rounds until >= 8/10 and gate passes' },
  ],
}

const ROOT = '/home/user/Test-/video'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/scenes'
const scenes = (args && args.scenes) || []
const after = (args && args.after) || {}
// notes added after the usage-limit interruption: appended only to calls that had not completed (rounds >= noteFrom[id]),
// so completed calls keep byte-identical prompts and replay from cache
const noteFrom = (args && args.noteFrom) || {}
const notes = (args && args.notes) || {}
const buildNotes = (args && args.buildNotes) || {}
const kitNote = (args && args.kitNote) || ''
const noteFor = (id, round) => (noteFrom[id] !== undefined && round >= noteFrom[id] ? `\n${kitNote}${notes[id] ? `\nFOR ${id}: ${notes[id]}` : ''}` : '')

const CONTEXT = `
Project: ${ROOT} (Remotion 4 + React 18 + TypeScript). You are building ONE scene of a 55.4 s vertical (1080x1920) motion-design explainer for TikTok/Reels, in a hand-drawn ink style, full-bleed.
READ FIRST, fully: ${ROOT}/docs/BRIEF.md (every section: BALANCE NOTE, ENGAGEMENT LAYER, QUALITY GATES, measured full-bleed numbers, CINEMATIC DIRECTION, EDGE TREATMENT, VOICEOVER v3 FINAL), ${ROOT}/docs/storyboard_v3.md (global sections + YOUR scene's section + your neighbours' sections), ${ROOT}/docs/storyboard_v3_resolved.json (your scene's entry in SECONDS on the recorded voice; absolute film time), ${ROOT}/docs/ENGINE.md (World, useTime, captions, transitions, Wiper, exits, Look, eyeLevel, rules), ${ROOT}/docs/CINE.md (camera, light, scale kit), ${ROOT}/docs/SHARED_SETS.md and ${ROOT}/docs/SHARED_PROPS.md (the world kit: use its sets and props by name), ${ROOT}/docs/mascot.md (Pip, no fades: draw/exit), ${ROOT}/docs/QA.md (the gates), ${ROOT}/docs/motion_spec.md, ${ROOT}/docs/style_bible.md, ${ROOT}/docs/style_bible_ref2.md (two-tier scale playbook). Look at the references: ${ROOT}/assets/ref/f_5.5.png, f_9.0.png, ${ROOT}/assets/ref2/f_1.png, f_12.png, f_33.png, and ${ROOT}/review/compare_refs.png.
Voice: ${ROOT}/assets/timing.json (recorded take, word starts). Captions are rendered by the engine (Film/SkyCaptions) from src/data/captions.json, NOT by your scene; keep the caption sky band (screen y ~280–570) calm behind the text. Labels (LabelTag etc.) ARE scene-owned props.
YOUR LANE: src/scenes/SceneNN.tsx (default export; export a \`Wiper\` too if the storyboard says the next transition uses your scene's wiper) and src/scenes/sceneNN/** for local helpers. Do NOT edit src/lib/**, src/scenes/shared/**, src/data/**, scripts/**, docs/** (except writing docs/scenes/SNN.md: your scene notes) or other scenes. A parallel stream is ADDING shared kit pieces requested in storyboard_v3.json "requests" (GovernmentPlaza farCivic/screenOffAt/rewind, BlueprintStreet title block, DomeCity dome rescale, TerraceHill check boxes, OldQuarter signs, LabelTag, CounterBoard, DiagramHand, StickyNote, Sticker, CheckBoxTag, SupportTag, RewindGlyph, lettered BackSoonTag, SunGlowSteps r260, SunPie 1/2, shutter stopAt...) and an engine stream is adding a non-unbuild loop and stepped sky snaps. If a piece you need exists in src/scenes/shared (check exports), use it. If not yet, write a minimal LOCAL stand-in in src/scenes/sceneNN/shims.tsx behind the same name/props, and say so in your report so a later fix round swaps it in.
Time: scene components use scene-local time (see ENGINE.md useTime/scene timing): local = absolute - your scene's start. Lock every beat to its word time (the resolved storyboard gives absolute seconds; leads per ENGINE rule 5).
Previews: your composition id is your scene id (e.g. "S07"), registered automatically from src/data/scenes.json. Use scripts/still.sh <id> <t> out.png, scripts/sheet.sh, scripts/strip.sh into ${SCRATCH}/<id>/, and the QA gate: bash scripts/qa/run_all.sh <id> (life score >= 8/10, no dead run > 0.40 s unless a deliberate hold you justify, framecheck clean). Use --scale=0.5 and concurrency 1–2 for previews: the machine is shared by ~10 agents.
QUALITY BAR: every frame must look like the reference artist drew it, read instantly on a phone, carry the story beat of its words, and feel alive (>= 5 events/s). No opacity fades anywhere. Velocity-continuous camera. Bit hidden in your scene (rewatch game). Mandatory labels present and legible. Match/continuity objects at the cuts placed exactly as the storyboard specifies (check neighbours' entries; if a neighbour's scene file exists, render its boundary frame and align to it). Render cost reasonable (report ms/frame).
`

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'number', description: '1-10 for this lens' },
    gate_pass: { type: 'boolean', description: 'QA gate (life score, dead runs, framecheck) passes, if you ran it' },
    findings: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      at: { type: 'string', description: 'time or frame range' },
      problem: { type: 'string' }, fix: { type: 'string' },
    }, required: ['severity', 'at', 'problem', 'fix'] } },
  },
  required: ['score', 'gate_pass', 'findings'],
}

const LENSES = [
  { key: 'art', brief: 'ART DIRECTION: render stills at every beat and a contact sheet of the whole scene; compare side by side with the reference stills. Same artist? (ink weight by depth, overshoot, open corners, misregistered flat fills, palette, people from behind, Pip on-model). Composition and scale per the playbook (baseline vs peak), readability on a phone at a glance, the story beat of each line obvious with sound off, labels legible and placed after their art event, caption band calm behind the text, Bit present, premium polish (nothing cheap, cluttered or broken). Score 1-10.' },
  { key: 'motion', brief: 'MOTION, SYNC & QA GATE: run bash scripts/qa/run_all.sh <id> and read its REPORT.md + deadframes chart; run python3 scripts/camspeed.py if relevant; render frame strips around every beat and both scene boundaries. Check: every beat lands on its word per storyboard_v3_resolved.json (within ~2 frames, leads per ENGINE rule 5); no opacity fades; camera velocity-continuous, speeds under the strobe limit unless the storyboard allows it; transitions/match objects align with the neighbour scenes (render their boundary frames if their files exist); density >= 5 events/s, no dead run > 0.40 s unless a deliberate hold; mascot draws/pops, never fades. Score 1-10 and report gate_pass.' },
]

const runScene = async (id) => {
  const nn = id.replace('S', '')
  const tag = `${CONTEXT}\nYOUR SCENE: ${id} (file src/scenes/Scene${nn}.tsx; local helpers in src/scenes/scene${nn}/). Its storyboard entry is scenes[] with id "${id}" in docs/storyboard_v3.json / _resolved.json and its section in docs/storyboard_v3.md.`
  await agent(`${tag}
BUILD the scene completely, exactly per the storyboard (every element, beat, camera key, label, sun/mascot/Bit action, transition in/out). Iterate visually: render stills at every beat, strips around the cuts, and run the QA gate until it passes and you'd score it >= 8/10 yourself. Write docs/scenes/${id}.md (what's in it, shims used, render cost, known gaps).
Final message: summary, QA life score, ms/frame, shims used, open issues.${buildNotes[id] ? `\n${kitNote}\nFOR ${id}: ${buildNotes[id]}` : ''}`, { effort: 'max', label: `build:${id}`, phase: 'Build' })

  let last = null
  for (let round = 1; round <= 3; round++) {
    const reviews = await parallel(LENSES.map(l => () => agent(`${tag}
You are an independent REVIEWER of scene ${id}. Do NOT edit repo files. LENS: ${l.brief} Be concrete (time/frame, what, exact fix). Severity: blocker = must fix to ship; major = clearly below the bar; minor = polish.`, { effort: 'max', label: `review:${id}:${l.key}:r${round}`, phase: 'Review', schema: REVIEW_SCHEMA })))
    const rs = reviews.filter(Boolean)
    if (rs.length < LENSES.length) {
      // a reviewer died (e.g. usage limit): never count that as a pass
      last = { round, scores: rs.map(r => r.score), gate: false, incomplete: true }
      log(`${id} r${round}: ${LENSES.length - rs.length} review(s) failed, stopping this scene as INCOMPLETE`)
      break
    }
    const findings = rs.flatMap(r => r.findings)
    const blocking = findings.filter(f => f.severity !== 'minor')
    const minScore = Math.min(...rs.map(r => r.score))
    const gate = rs.every(r => r.gate_pass !== false)
    last = { round, scores: rs.map(r => r.score), gate, blocking: blocking.length, minors: findings.length - blocking.length }
    log(`${id} r${round}: scores ${rs.map(r => r.score).join('/')}, gate ${gate ? 'pass' : 'FAIL'}, ${blocking.length} blocker/major`)
    if (minScore >= 8 && gate && blocking.length === 0) break
    await agent(`${tag}
FIX ROUND ${round} for scene ${id}. Reviewers found:
${JSON.stringify(findings, null, 1)}
Fix every blocker and major and the cheap minors. Also swap any local shims for the shared kit pieces if they now exist in src/scenes/shared (check exports). Re-render, re-run the QA gate, LOOK at the results. Update docs/scenes/${id}.md. Final message: what changed per finding, new QA life score.${noteFor(id, round)}`, { effort: 'max', label: `fix:${id}:r${round}`, phase: 'Fix' })
  }
  return { id, ...last }
}

const built = {}
for (const id of scenes) {
  const dep = after[id]
  built[id] = (async () => {
    if (dep && built[dep]) await built[dep]
    return runScene(id)
  })()
}
const results = await Promise.all(scenes.map(id => built[id]))
return results
