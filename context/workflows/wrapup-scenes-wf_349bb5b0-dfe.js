export const meta = {
  name: 'wrapup-scenes',
  description: 'Wrap-up: lean review -> fix loop (max 2 fix rounds) for the last scenes under the bar (S08, S09, S10)',
  phases: [
    { title: 'Review', detail: 'one combined art+motion reviewer per round' },
    { title: 'Fix', detail: 'smallest changes that fix the blockers/majors' },
  ],
}
const ROOT = '/home/user/Test-/video'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrap'
const scenes = (args && args.scenes) || []
const notes = (args && args.notes) || {}
const MAX_FIX = (args && args.maxFix) || 2
const ctx = (id) => `Project ${ROOT} (Remotion 4 + React + TS): a 55.37 s 1080x1920 hand-drawn ink explainer for TikTok/Reels, 12 scenes assembled in the comp "Main" (with paper edges + captions). We are WRAPPING UP: make the smallest changes that fix the listed problems; no redesign beyond them.
Read ONLY: docs/WRAPUP.md; docs/scenes/${id}.md (skim, the latest sections at the bottom matter most); your scene's section in docs/storyboard_v3.md (grep '${id}'); the gate summary at the top of docs/QA.md. For style, look at assets/ref/f_5.5.png and assets/ref2/f_12.png only.
Tools: node scripts/render-frames.mjs <Comp> <dir> <t1,t2,...> --scale=0.5 --concurrency=2 (Main = full film, film seconds; ${id} = clean scene, scene-local seconds; scene times in src/data/scenes.json); QA gate: bash scripts/qa/run_all.sh ${id}. Work in ${SCRATCH}/${id}/. Machine: 4 CPUs shared, concurrency <= 2.
Lane: src/scenes/Scene${id.slice(1)}.tsx, src/scenes/scene${id.slice(1)}/**, docs/scenes/${id}.md (append at most 10 lines). Never edit src/lib, src/scenes/shared, src/data or other scenes: put such needs under CROSS-LANE in your final message. Keep the scene's first and last 0.3 s (the cut frames) unchanged unless a finding is about them. Do not commit.${notes[id] ? `\nKNOWN ISSUES FOR ${id}: ${notes[id]}` : ''}`
const SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'number', description: '1-10: the LOWER of art and motion' },
    gate_pass: { type: 'boolean' },
    findings: { type: 'array', maxItems: 6, items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      at: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
    }, required: ['severity', 'at', 'problem', 'fix'] } },
  },
  required: ['score', 'gate_pass', 'findings'],
}
const review = (id, r) => agent(`${ctx(id)}
You are an independent REVIEWER of ${id}, round ${r}. Do NOT edit files. Render a 12-frame contact sheet of the scene from Main (half res) and strips at the beats in question; run the QA gate. Judge as a demanding art director and motion editor at once: every frame reads on a phone, carries its line's story beat with sound off, looks like the reference artist drew it, moves smoothly with no glitches or dead frames. Score = the lower of art and motion. Max 6 findings, most important first, each with a concrete fix. Severity: blocker = must fix to ship; major = clearly below the bar; minor = polish.`, { label: `review:${id}:r${r}`, phase: 'Review', schema: SCHEMA })

const runScene = async (id) => {
  const hist = []
  for (let r = 1; r <= MAX_FIX + 1; r++) {
    const v = await review(id, r)
    if (!v) { hist.push({ r, failed: true }); break }
    const blocking = v.findings.filter(f => f.severity !== 'minor')
    hist.push({ r, score: v.score, gate: v.gate_pass, blocking: blocking.length })
    log(`${id} r${r}: ${v.score}, gate ${v.gate_pass ? 'pass' : 'FAIL'}, ${blocking.length} blocker/major`)
    if (v.score >= 8 && v.gate_pass && blocking.length === 0) return { id, hist, final: v }
    if (r > MAX_FIX) return { id, hist, final: v }
    const fx = await agent(`${ctx(id)}
FIX ROUND ${r} for ${id}. The reviewer found:
${JSON.stringify(v.findings, null, 1)}
Fix every blocker and major and only the cheap minors. Verify each fix on a render (LOOK at it), re-run the QA gate. Final message (max 12 lines): what changed per finding, QA life score, CROSS-LANE needs (exact).`, { label: `fix:${id}:r${r}`, phase: 'Fix' })
    hist.push({ r, fix: (fx || 'FAILED').slice(0, 1500) })
  }
  return { id, hist }
}
return await Promise.all(scenes.map(runScene))
