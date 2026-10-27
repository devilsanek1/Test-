export const meta = {
  name: 'pipeline-retro',
  description: 'Measure where this project spent tokens/time, research a faster-feedback production pipeline (sketch/animatic gates), audit tooling, and write the pipeline v2 plan',
  phases: [
    { title: 'Research', detail: 'spend forensics + pipeline research + tooling audit, in parallel' },
    { title: 'Plan', detail: 'one synthesis agent writes docs/PIPELINE_V2.md' },
  ],
}
const P = '/root/.claude/projects/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2'
const ROOT = '/home/user/Test-/video'
const OUT = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/retro'
const SHARED = `Context: we just finished a 55 s vertical (1080x1920) hand-drawn ink explainer about a PHP security bug, built in Remotion (${ROOT}) by an orchestrator plus many AI agents over ~20 hours (12 scenes S01-S12, a shared kit of sets/props, a mascot, captions, paper edges, sound). The owner's feedback: they only saw stills until the very end, so they could not steer incrementally; they want a production LOOP with more, smaller stages (research/idea -> script -> voice -> a clean SKETCH of the story and transitions -> ...), story locked before big commitments, polish pushed late, and NO wasted tokens/time. Write everything you produce to ${OUT}/ and keep your final message under 400 words. Do not edit repo files. A render is running on the machine: do not render anything.`
const SPEND = `${SHARED}
TASK: SPEND FORENSICS. Measure, don't guess. Data: every subagent transcript is JSONL under ${P}/subagents/ (agent-*.jsonl at the top level and ${P}/subagents/workflows/<runId>/agent-*.jsonl; each has a sibling agent-*.meta.json, and each workflow dir has journal.jsonl mapping agent ids to labels via 'started' events: {type:'started', agentId, label}). Assistant messages carry message.usage {input_tokens, cache_creation_input_tokens, cache_read_input_tokens, output_tokens}. Workflow scripts/args/logs: ${P}/workflows/*.json and ${P}/workflows/scripts/*.js. The orchestrator's own transcript: ${P}.jsonl (big; stream it).
Write a Python script (in ${OUT}/) that streams all of it and computes, per workflow and per agent label category (build / review / fix / kit / sets / props / edge / cut / hook / ideas / sound / other) and for the orchestrator: total input (incl. cache read + creation), output, number of agents, wall time if available. Then find the WASTE with evidence and numbers:
- agents that died (usage limits, killed) and their tokens lost; work redone after interruptions
- rework loops: scenes reviewed/fixed many times (count review+fix rounds per scene and tokens); fixes later reverted
- how many tokens each agent spent just reading docs before working (Read tool calls on docs/*.md in its first N turns; estimate with the tool_result sizes)
- reviews that found nothing actionable; parallel lenses that duplicated each other
- exploration that was thrown away (edge-treatment lab variants, kit versions, storyboard versions)
- orchestrator overhead: check-ins, re-reading big reports, the huge task list echo, long prompts repeated
Output ${OUT}/spend.md: a table of spend by stage/category, and the TOP 10 waste sources ranked by tokens, each with the concrete rule that would have avoided it.`
const RESEARCH = `${SHARED}
TASK: PIPELINE RESEARCH. How do animation / motion-design / explainer studios (Kurzgesagt, TED-Ed, Pixar-style pre-production, agency explainer workflows, YouTube/TikTok creator workflows) structure production for fast feedback? Cover: script lock, thumbnail boards, storyboard, ANIMATIC (timed to the scratch/final VO, with rough camera and transitions), style frames, layout, blocking (key poses / camera), spline/polish, sound, final. For each stage: the artifact, what the client approves, what is frozen after it, typical revision rounds, and the cost of a change at that stage vs later (the cost-of-change curve). Also: how short-form creators iterate on hooks (test the first 3 s early). Use web search sparingly (max ~6 searches; cite sources). Then map it to OUR setup: an AI agent pipeline in Remotion, where the owner reviews on a phone and every gate must give them a PLAYABLE low-res video with voice (not stills). Output ${OUT}/research.md: the recommended stage list with gates, what the owner sees and approves at each gate, and the rules (what may change after each gate).`
const TOOLING = `${SHARED}
TASK: TOOLING AUDIT for a fast-feedback loop in this repo. Look at (do not read docs/ broadly; skim only what you need): scripts/render-frames.mjs, scripts/still.sh, scripts/sheet.sh, scripts/review/checkin.sh, scripts/qa/run_all.sh, src/lib/Film.tsx, src/FilmRoot.tsx, src/Root.tsx, src/data/scenes.json, src/data/captions.json, audio/mix.py's docstring, and docs/WRAPUP.md. Measure what exists (render times we observed: full film full-res ~60 min at concurrency 4; half-res 10 s clip ~1-2 min; stills ~0.1-0.6 s/frame). Propose CONCRETE tooling for each early stage, sized so a stage's playable output renders in under ~5 minutes on 4 CPUs:
- an ANIMATIC mode: each scene as rough boxes/silhouettes/placeholder text + the real captions + the voice, camera moves and transitions roughed in, rendered at 30-50 % scale (how: a per-scene 'sketch' component or a 'draft' flag in Film; scene timing from scenes.json; what the minimal API is)
- a BLOCKING mode: real sets/props in flat grey, key poses, final camera
- a 'preview the film' command that renders the whole film at low res with sound in a few minutes (encoder settings, scale, concurrency, frame skipping / half fps for previews), plus a 'preview the hook' command (first 10 s)
- per-stage cheap automated checks (caption timing, scene timing vs voice, cut list) so review agents are not needed for mechanical checks
Output ${OUT}/tooling.md with the concrete commands/components to build, estimated effort each, and which existing tools to drop or simplify.`
phase('Research')
const [spend, research, tooling] = await parallel([
  () => agent(SPEND, { effort: 'max', label: 'spend-forensics', phase: 'Research' }),
  () => agent(RESEARCH, { effort: 'max', label: 'pipeline-research', phase: 'Research' }),
  () => agent(TOOLING, { effort: 'max', label: 'tooling-audit', phase: 'Research' }),
])
phase('Plan')
const plan = await agent(`${SHARED}
TASK: write ${ROOT}/docs/PIPELINE_V2.md (you MAY create this one repo file), the production pipeline for the NEXT video, from these three reports (read their full files in ${OUT}/: spend.md, research.md, tooling.md):
SPEND SUMMARY: ${spend || 'FAILED'}
RESEARCH SUMMARY: ${research || 'FAILED'}
TOOLING SUMMARY: ${tooling || 'FAILED'}
The doc must be short and usable (max ~2 pages): (1) the stage list as a loop with owner GATES; for each stage: the artifact, what the owner gets on their phone (always a playable video from the animatic on), what is frozen after the gate, the token/time budget, and who does it (orchestrator vs N agents); (2) the anti-waste rules, each tied to a measured waste from spend.md (with its number); (3) the tooling to build before video 2, in order, with effort; (4) the agent prompt rules (what context each agent gets, max doc reads, report length, review only at gates, one combined reviewer lens, no reviews of things that will change). Plain language, no fluff. Final message: 10-line summary + the top 5 rules.`, { effort: 'max', label: 'plan', phase: 'Plan' })
return { spend, research, tooling, plan }
