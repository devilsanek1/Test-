export const meta = {
  name: 'wrapup-cuts',
  description: 'Wrap-up: one auditor checks a set of cuts in the full film; only flagged cuts get a fix (one at a time) and a quick re-check',
  phases: [
    { title: 'Audit', detail: 'one agent renders and judges every cut in the set' },
    { title: 'Fix', detail: 'sequential fixes for flagged cuts only' },
  ],
}
const ROOT = '/home/user/Test-/video'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrapcuts'
const cuts = (args && args.cuts) || []
const CTX = `Project ${ROOT} (Remotion 4 + React + TS): a 55.37 s 1080x1920 hand-drawn ink explainer, 12 scenes assembled in comp "Main" (paper edges + sky captions). We are WRAPPING UP: smallest changes only. Read ONLY docs/WRAPUP.md and, for a cut you fix, the 'Cut' notes at the bottom of the two scenes' docs/scenes/SNN.md plus their storyboard_v3.md transition lines (grep). Render: node scripts/render-frames.mjs Main <dir> <film seconds,...> --scale=0.5 --concurrency=2 (omit --scale for full res). Scene times: src/data/scenes.json. QA gate: bash scripts/qa/run_all.sh SNN. Work in ${SCRATCH}/. 4 shared CPUs: concurrency <= 2. Do not commit.
THE BAR for a cut: on a phone, frame by frame, it reads as one deliberate motion: match objects locked, ink weight continuous, the sun where it should be, Pip continuous (pose, scale, direction), the caption band never shows a stale or half-scrolled page over the incoming shot, the tone switch lands on the cut frame, the paper edge repaints on the cut, velocity carries through.`
const AUDIT = {
  type: 'object',
  properties: { cuts: { type: 'array', items: { type: 'object', properties: {
    cut: { type: 'string' }, pass: { type: 'boolean' }, score: { type: 'number' },
    problems: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, at: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
    }, required: ['severity', 'at', 'problem', 'fix'] } },
  }, required: ['cut', 'pass', 'score', 'problems'] } } },
  required: ['cuts'],
}
const list = cuts.map(c => `${c.a}|${c.b} at film ${c.t} s (Main f${Math.round(c.t * 30)})${c.notes ? ` — ${c.notes}` : ''}`).join('\n')
phase('Audit')
const audit = await agent(`${CTX}
AUDIT these cuts (do NOT edit files):
${list}
For each: render Main every frame from cut-0.4 s to cut+0.4 s at half res plus the 2 frames either side at full res; build a strip and LOOK frame by frame against THE BAR. pass=true only if no blocker/major. Be concrete (frame, px, exact fix and which scene file it belongs in). Captions/edge-hint fixes are cross-lane: name the exact data change.`, { effort: 'max', label: 'audit', phase: 'Audit', schema: AUDIT })
const results = []
for (const c of (audit && audit.cuts) || []) {
  const blocking = c.problems.filter(p => p.severity !== 'minor')
  if (c.pass && !blocking.length) { results.push({ cut: c.cut, score: c.score, pass: true, minors: c.problems.length }); continue }
  const [a, b] = c.cut.split('|')
  const fixed = await agent(`${CTX}
YOU OWN THE CUT ${c.cut}. Lane: src/scenes/Scene${a.slice(1)}.tsx + src/scenes/scene${a.slice(1)}/** and src/scenes/Scene${b.slice(1)}.tsx + src/scenes/scene${b.slice(1)}/**; append a short note (max 8 lines) to docs/scenes/${a}.md and ${b}.md. Do NOT edit src/lib, src/scenes/shared, src/data or other scenes: put caption/edge/shared needs under CROSS-LANE (exact). Change only what this cut needs, inside the last ~1.5 s of ${a} / first ~1.5 s of ${b}; never move a beat off its word; keep both QA gates passing. The auditor found:
${JSON.stringify(c.problems, null, 1)}
Verify each on a render, fix the blockers/majors (and cheap minors), re-render the strip, LOOK, run both QA gates. Final message (max 12 lines): before -> after per problem, QA results, CROSS-LANE (exact), strip path.`, { effort: 'max', label: `fix:${c.cut}`, phase: 'Fix' })
  results.push({ cut: c.cut, score: c.score, pass: false, problems: c.problems, fixed })
}
return { audit, results }
