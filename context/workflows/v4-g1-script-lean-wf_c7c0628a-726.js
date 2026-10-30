export const meta = {
  name: 'v4-g1-script-lean',
  description: 'Video 4 G1 (Helsinki): one writer, one critic (cold retell first), one fix pass; files in video/docs/v4',
  phases: [
    { title: 'Write', detail: 'one writer: spines, the script with cues, paste file, through-line card, both checks OK' },
    { title: 'Critique', detail: 'one critic: cold retell first, at most 6 findings, verdict' },
    { title: 'Fix', detail: 'one fix pass from the writer notes and the critique; both checks OK again' },
  ],
}

const REPO = '/home/user/Test-'
const OUT = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['done', 'partial', 'blocked'] },
    summary: { type: 'string', description: 'at most 3 short lines' },
    files: { type: 'array', items: { type: 'string' } },
  },
  required: ['status', 'summary', 'files'],
}
const CRIT = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['FIX AND SEND', 'REWRITE'] },
    blockers: { type: 'integer' },
    majors: { type: 'integer' },
    minors: { type: 'integer' },
    summary: { type: 'string', description: 'at most 3 short lines' },
  },
  required: ['verdict', 'blockers', 'majors', 'minors', 'summary'],
}

const COMMON = `Work in ${REPO}. Rules for you: write your output files from your FIRST step and update them as you go (a usage limit can stop you at any moment); never run a git command that changes the index or history (no add, commit, push, checkout, stash: the orchestrator commits); never touch video/src, video/public or video/out; start no agents (if you ever do, they run at effort max). Your final reply is the structured output only, its summary at most 3 short lines.`

phase('Write')
const w = await agent(`You are the G1 writer for video 4 of the channel "What's All the Fuss About?". Read and follow ${REPO}/video/docs/v4/script/WRITER_BRIEF.md exactly: it lists what to read and what to deliver (script_g1.md, script_elevenlabs.md, THROUGHLINE.md).
Spine first (video/docs/PIPELINE_V2.md, the G1 bullet): before any line, draft 2-3 competing story spines (the throughline question, the viewer's situation, the beats joined by "but"/"so"/"because", the turn, the payoff that lands the core line) and pick one, and record all the spines, your pick and its reason in a "Spines" section of video/docs/v4/script/script_g1.md (a fresh fix-pass agent will continue from these notes, so make them clear). Then write the script with a delivery cue per line, then the paste file, and run python3 video/scripts/voice/check_rhythm.py and python3 video/scripts/voice/check_paste.py on video/docs/v4/script/script_elevenlabs.md until both say OK (record both verdicts in script_g1.md), then the through-line card video/docs/v4/THROUGHLINE.md with a carrier for every join taken from the script's own joins.
Create script_g1.md's skeleton (its headings) before you start reading.
${COMMON}`, { label: 'writer', phase: 'Write', schema: OUT, effort: 'max' })

if (!w || w.status === 'blocked') {
  return { writer: w, note: 'writer did not finish; the critic and fix pass did not run' }
}
log(`writer: ${w.status}`)

phase('Critique')
const c = await agent(`You are the G1 critic for video 4 of the channel "What's All the Fuss About?". Your output file is ${REPO}/video/docs/v4/script/critique_g1.md.
STEP 1, BEFORE READING ANY OTHER FILE (not your brief, not the notes, not the fact file, not script_g1.md): read only the spoken words of the paste block in ${REPO}/video/docs/v4/script/script_elevenlabs.md (skip the [tags]), once, as a viewer scrolling past who hears it one time. Then, without looking back at it, write your 3-5 sentence retell, as you would tell a friend, into critique_g1.md under "Cold retell".
STEP 2: only now read your brief, ${REPO}/video/docs/v4/script/CRITIC_BRIEF.md, part A, and do all of it: at most 6 findings ranked blocker > major > minor, each with a concrete fix (a replacement line checked against the fact file when a line is the problem), then the verdict FIX AND SEND or REWRITE.
${COMMON}`, { label: 'critic', phase: 'Critique', schema: CRIT, effort: 'max' })

if (!c) {
  return { writer: w, critic: null, note: 'critic did not finish; the fix pass did not run' }
}
log(`critic: ${c.verdict} (${c.blockers} blockers, ${c.majors} majors, ${c.minors} minors)`)

phase('Fix')
const f = await agent(`You are the G1 fix pass for video 4 of the channel "What's All the Fuss About?": you continue the writer's work. Follow ${REPO}/video/docs/v4/script/CRITIC_BRIEF.md part B. Start with the writer's own notes in video/docs/v4/script/script_g1.md (its "Spines" section and the story in 3 sentences), then read its WRITER_BRIEF.md (the rules the script must keep), the critique video/docs/v4/script/critique_g1.md (verdict: ${c.verdict}; ${c.blockers} blockers, ${c.majors} majors, ${c.minors} minors), and the fact file video/docs/v5/research/factlock.md for every line you change.
Keep script_g1.md, the paste in script_elevenlabs.md and the card video/docs/v4/THROUGHLINE.md in sync; re-run python3 video/scripts/voice/check_rhythm.py and python3 video/scripts/voice/check_paste.py on the paste until both say OK; write the "Fix pass" section (one line per finding: done, what changed / not done, why) with the final word count, length and both verdicts.
${COMMON}`, { label: 'fix pass', phase: 'Fix', schema: OUT, effort: 'max' })

return { writer: w, critic: c, fix: f }
