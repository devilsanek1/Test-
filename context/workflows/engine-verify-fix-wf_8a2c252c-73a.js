export const meta = {
  name: 'engine-verify-fix',
  description: 'Verify which round-2 engine/cine review findings are still open after the last fix pass, fix the kit-level ones in two lanes, and re-verify with fresh eyes',
  phases: [
    { title: 'Verify', detail: 'per-lane status of every round-2 finding' },
    { title: 'Fix', detail: 'core and cine lanes fix open kit-level issues' },
    { title: 'Re-verify', detail: 'fresh adversarial check of the fixes' },
  ],
}

const ROOT = '/home/user/Test-/video'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/engverify'
const CONTEXT = `
Project: ${ROOT} (Remotion 4 + React 18 + TypeScript). FIRST read ${ROOT}/docs/BRIEF.md (BALANCE NOTE, QUALITY GATES, measured full-bleed numbers, CINEMATIC DIRECTION), ${ROOT}/docs/ENGINE.md, ${ROOT}/docs/CINE.md, ${ROOT}/docs/motion_spec.md, ${ROOT}/docs/style_bible.md, ${ROOT}/docs/style_bible_ref2.md. Reference look: ${ROOT}/assets/ref/f_5.5.png, f_9.0.png, ${ROOT}/assets/ref2/f_1.png, f_12.png, f_33.png.
The round-2 review findings (37, 22 blocker/major) are in ${ROOT}/docs/review/engine_r2_findings.json. A fix pass ran after them but was never re-reviewed.
PRIORITY: scene production will build ~13 real scenes on this toolkit soon. What matters most is KIT-LEVEL correctness and quality that every scene inherits: velocity-continuous camera keys and transitions (no stalls/slams/whips), every cine component participating in the core un-build / Look states, time-of-day relight that stays on-palette (stepped palette shifts, no muddy mixes), hand-drawn quality of kit pieces (ink overshoot, 2–5 px misregistration, ink by depth) rather than stock-vector look, no single-frame LOD pops or strobing on fast moves (flat art strobes above ~15–20 px/frame), caption tone correct during wipes, mascot never fading (pops/draw-ons only), no opacity fades anywhere. Demo-only composition issues (CineDemo/KitDemo framing) matter only where they reveal a kit flaw or a wrong default.
Lanes: CORE = src/lib/** except src/lib/cine/** and src/lib/mascot/**, plus src/Main.tsx, src/Root.tsx, src/data/**, scripts/** (not scripts/qa/** or scripts/review/**), src/dev/KitDemo.tsx, docs/ENGINE.md. CINE = src/lib/cine/**, src/dev/CineDemo.tsx, docs/CINE.md. Don't touch src/scenes/shared/** (another stream) or src/lib/mascot/** (if the mascot needs a change, write it in your report).
Checks: npx tsc --noEmit clean; render stills/strips (scripts/still.sh, scripts/sheet.sh, scripts/strip.sh) into ${SCRATCH}/ and LOOK. If scripts/qa/deadframes.py exists, you may use it on short renders.
`

const STATUS_SCHEMA = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'object', properties: {
      finding: { type: 'string', description: 'short id: area + problem gist' },
      lane: { type: 'string', enum: ['core', 'cine'] },
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      status: { type: 'string', enum: ['fixed', 'partial', 'open', 'demo-only'] },
      kit_level: { type: 'boolean' },
      evidence: { type: 'string' },
      fix_needed: { type: 'string' },
    }, required: ['finding', 'lane', 'severity', 'status', 'kit_level', 'evidence', 'fix_needed'] } },
  },
  required: ['items'],
}

phase('Verify')
const statuses = await parallel(['core', 'cine'].map(lane => () => agent(`${CONTEXT}
You are the VERIFIER for the ${lane.toUpperCase()} lane. Do NOT edit repo files. For EVERY finding in docs/review/engine_r2_findings.json whose lane is "${lane}" (and any core/cine finding whose fix crosses into your lane), determine its current status by reading the code AND rendering evidence: fixed / partial / open / demo-only (affects only the demo's composition, not the kit). Mark kit_level true if real scenes would inherit the problem. Also add any NEW kit-level problem you notice while checking (status open). Be strict: "fixed" needs evidence.`, { label: `verify:${lane}`, phase: 'Verify', schema: STATUS_SCHEMA })))

const all = statuses.filter(Boolean).flatMap(s => s.items)
const todo = all.filter(i => i.status !== 'fixed' && (i.kit_level || i.severity === 'blocker'))
log(`Verify: ${all.filter(i => i.status === 'fixed').length} fixed, ${todo.length} kit-level/blocker items still open or partial, ${all.filter(i => i.status === 'demo-only').length} demo-only`)

phase('Fix')
await parallel(['core', 'cine'].map(lane => () => {
  const mine = todo.filter(i => i.lane === lane)
  if (!mine.length) return Promise.resolve('nothing')
  return agent(`${CONTEXT}
YOU ARE THE ${lane.toUpperCase()} LANE. Fix these verified open items (kit-level first, blockers first):
${JSON.stringify(mine, null, 1)}
Prefer fixing the toolkit default so every scene inherits it, and update the docs (ENGINE.md / CINE.md) so scene agents use the right API. Re-render and LOOK at the before/after. tsc must be clean. Final message: one line per item: what you changed and the evidence (paths of renders).`, { label: `fix:${lane}`, phase: 'Fix' })
}))

phase('Re-verify')
const REV_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['ready-for-scenes', 'needs-work'] },
    still_open: { type: 'array', items: { type: 'object', properties: {
      lane: { type: 'string' }, severity: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
    }, required: ['lane', 'severity', 'problem', 'fix'] } },
  },
  required: ['verdict', 'still_open'],
}
const rev = await agent(`${CONTEXT}
You are a FRESH, adversarial reviewer. Do NOT edit repo files. These items were just worked on:
${JSON.stringify(todo, null, 1)}
Check each one with renders and code reading. Then do a broader sanity pass a scene builder cares about: write a throwaway 6 s full-bleed scene in ${SCRATCH}/probe/ (NOT in the repo) that uses World, SkyCaptions tones, a CineCamera move with two keys, a camera-continuous transition, a TOD change, EndlessCity or a Monument, a kit Crowd, the Elephant mascot, and an un-build; render a strip and confirm it all behaves (velocity-continuous camera, no fades, un-build includes every element, on-palette relight, captions readable). Verdict ready-for-scenes only if a scene builder could rely on the kit without hitting these problems.`, { label: 're-verify', phase: 'Re-verify', schema: REV_SCHEMA })
log(`Re-verify: ${rev ? rev.verdict : 'n/a'} (${rev ? rev.still_open.length : '?'} still open)`)
return { statuses: all, todo, rev }
