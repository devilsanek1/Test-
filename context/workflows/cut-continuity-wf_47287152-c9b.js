export const meta = {
  name: 'cut-continuity',
  description: 'Phase B: one owner per cut makes the cut seamless in the full film (match objects, ink, sun, Pip, captions, tone, edges, velocity), then an independent verifier checks it; one more fix round if needed',
  phases: [
    { title: 'Own', detail: 'cut owner: render the cut in Main, check, fix both sides' },
    { title: 'Verify', detail: 'independent frame-by-frame check of the cut' },
    { title: 'Fix', detail: 'one more fix round when the verifier finds problems' },
  ],
}
const ROOT = '/home/user/Test-/video'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/cuts'
const cuts = (args && args.cuts) || []
const CTX = `Project ${ROOT} (Remotion 4 + React 18 + TS): a 55.37 s vertical (1080x1920, 30 fps) hand-drawn ink explainer for TikTok/Reels, built as 12 scenes S01-S12 assembled by src/lib/Film.tsx into the composition "Main" (full film, with the 'paint-subtle' paper edges and the sky captions). Scene times (film seconds): src/data/scenes.json. Beats: docs/storyboard_v3_resolved.json and each scene's beats/timing file. Read docs/storyboard_v3.md (the global sections + both scenes' sections, esp. their transition in/out and match objects), docs/ENGINE.md (transitions, Wiper, exits, inkComp/InkScale section 4b, caption 'out'), docs/EDGES.md, docs/mascot.md (Pip: draw/pop, never fades), docs/INTEGRATION_PLAN.md (phase B) and docs/INTEGRATION_TODO.md (open cross-lane items), and both scenes' notes docs/scenes/SNN.md.
Render: node scripts/render-frames.mjs Main <dir> <film seconds,...> --scale=0.5 --concurrency=2 (full film WITH edges + captions; omit --scale for full res), node scripts/render-frames.mjs SNN <dir> <scene-local seconds> for a single clean scene (no edges). QA gate per scene: bash scripts/qa/run_all.sh SNN. The machine has 4 CPUs shared by several agents: concurrency <= 2, half res for strips. Work in ${SCRATCH}/<cut>/. Do not commit.
THE BAR: a viewer must not feel the cut as a glitch. On a phone, frame by frame, the cut should read as one deliberate motion: match objects locked, ink weight continuous, the sun where it should be, Pip continuous, captions handing over cleanly, the tone switch on the cut (never a half-frame of the wrong tone), the paper edge repainting on the cut (not mid-shot), and camera/actor velocity carrying through.`
const VERDICT = {
  type: 'object',
  properties: {
    pass: { type: 'boolean', description: 'true only if the cut has no blocker/major problem' },
    score: { type: 'number', description: '1-10 for this cut' },
    findings: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      at: { type: 'string', description: 'film time / Main frame' },
      problem: { type: 'string' }, fix: { type: 'string' },
    }, required: ['severity', 'at', 'problem', 'fix'] } },
  },
  required: ['pass', 'score', 'findings'],
}
const lane = (c) => `YOUR LANE: src/scenes/Scene${c.a.slice(1)}.tsx + src/scenes/scene${c.a.slice(1)}/** and src/scenes/Scene${c.b.slice(1)}.tsx + src/scenes/scene${c.b.slice(1)}/**, plus docs/scenes/${c.a}.md and docs/scenes/${c.b}.md (append a short 'Cut ${c.a}|${c.b}' note). Do NOT edit src/lib/**, src/scenes/shared/**, src/data/**, scripts/**, other scenes or other docs: if the fix belongs there (caption page 'out' times, edge hints in src/lib/edges/hints.ts, a shared prop), put the exact change in your final message under CROSS-LANE and the orchestrator applies it. Other agents own the OTHER end of each of your two scenes (${c.a}'s start and ${c.b}'s end are other cuts): change only what this cut needs, keep edits inside the last ~1.5 s of ${c.a} and the first ~1.5 s of ${c.b} unless the cut can't be fixed otherwise, never move a beat off its word, and keep both scenes' QA gates passing.`
const cutName = (c) => `${c.a}|${c.b}`
const strip = (c) => `The cut is at film ${c.t} s (Main frame ${Math.round(c.t * 30)}). Render Main at half res for every frame from ${(c.t - 0.5).toFixed(3)} to ${(c.t + 0.5).toFixed(3)} s and at FULL res for the 2 frames on either side of the cut; build a strip/contact sheet and LOOK at it frame by frame.`

const results = await pipeline(cuts,
  async (c) => agent(`${CTX}
${lane(c)}
YOU OWN THE CUT ${cutName(c)}. ${strip(c)}
Check and fix, in this order: (1) the match / continuity objects per the storyboard (position and scale across the cut, measured in px on the full-res frames); (2) ink weight (stroke px either side; inkComp/InkScale where a dive or push ends); (3) the sun (size, position, layer); (4) Pip (pose, position, scale, direction of travel; Bit too if present); (5) the caption hand-off (no stale page over the incoming shot, no half-scrolled line over the cut; propose 'out' times if needed); (6) the tone/palette switch lands exactly on the cut frame; (7) the paper edge repaints on the cut; (8) velocity: camera and actor motion carry through (no stop-start, no reversal unless the storyboard asks for it).
${c.notes ? `SPECIFIC TO THIS CUT: ${c.notes}\n` : ''}Fix everything you can in your lane, re-render the same strip, LOOK again, and run the QA gate on both scenes. Final message: per check what you measured before -> after, what you changed (files + what), the QA results, CROSS-LANE requests (exact), and the strip path.`, { effort: 'max', label: `own:${cutName(c)}`, phase: 'Own' }),
  async (owned, c) => {
    const v = await agent(`${CTX}
You are an INDEPENDENT VERIFIER of the cut ${cutName(c)}. Do NOT edit any repo file. The cut owner reported:
${owned}
${strip(c)} Do your own renders (fresh dir). Check every item of THE BAR: match objects (measure px), ink weight, sun, Pip/Bit, caption hand-off, tone switch, edge repaint, velocity; and look for anything new the owner broke (glitches, one-frame pops, clipped art, a beat moved off its word). Also render both scenes' single comps at 3 times each away from the cut to make sure nothing else regressed. Be concrete: film time / frame, what, exact fix. pass=true only if there is no blocker or major.`, { effort: 'max', label: `verify:${cutName(c)}`, phase: 'Verify', schema: VERDICT })
    if (!v) return { cut: cutName(c), owned, verdict: null, incomplete: true }
    if (v.pass && !v.findings.some(f => f.severity !== 'minor')) return { cut: cutName(c), owned, verdict: v }
    const fixed = await agent(`${CTX}
${lane(c)}
FIX ROUND for the cut ${cutName(c)}. The independent verifier found:
${JSON.stringify(v.findings, null, 1)}
Verify each claim on a render first, fix every blocker and major and the cheap minors, re-render the strip (${strip(c)}), LOOK, run both scenes' QA gates. Final message: what changed per finding, QA results, CROSS-LANE requests (exact).`, { effort: 'max', label: `fix:${cutName(c)}`, phase: 'Fix' })
    const v2 = await agent(`${CTX}
You are an INDEPENDENT VERIFIER of the cut ${cutName(c)} after a fix round. Do NOT edit any repo file. Earlier findings:
${JSON.stringify(v.findings, null, 1)}
The fixer reported:
${fixed}
${strip(c)} Do your own renders (fresh dir) and check THE BAR again, plus the earlier findings one by one. pass=true only if there is no blocker or major.`, { effort: 'max', label: `verify2:${cutName(c)}`, phase: 'Verify', schema: VERDICT })
    return { cut: cutName(c), owned, verdict: v, fixed, verdict2: v2 }
  })
return results.map(r => r && ({ cut: r.cut, v1: r.verdict && { pass: r.verdict.pass, score: r.verdict.score }, v2: r.verdict2 && { pass: r.verdict2.pass, score: r.verdict2.score, findings: r.verdict2.findings }, incomplete: r.incomplete, crossLane: [r.owned, r.fixed].filter(Boolean).map(t => (t.split('CROSS-LANE')[1] || '').slice(0, 1500)) }))
