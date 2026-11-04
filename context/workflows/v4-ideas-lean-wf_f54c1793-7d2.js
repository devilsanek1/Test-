export const meta = {
  name: 'v4-ideas-lean',
  description: 'Video 4 ideas round, lean (weekly tokens tight): one builder draws one whole sequence from one film concept, one fresh evaluator judges it feeling first, at most one fix round',
  phases: [
    { title: 'Ideas', detail: 'one builder, one sequence' },
    { title: 'Evaluate', detail: 'a fresh evaluator: the feeling it gives first, then the board read' },
    { title: 'Adjust', detail: 'the fixes the evaluator named, once' },
  ],
}
const R = '/home/user/Test-'
const D = `${R}/video/docs/v4/ideas`
const OUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['status', 'summary', 'files'] }
const EVAL = { type: 'object', properties: {
  status: { type: 'string', enum: ['done', 'partial', 'blocked'] },
  verdict: { type: 'string', enum: ['THERE', 'ALMOST', 'NOT THERE'] },
  summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } },
}, required: ['status', 'verdict', 'summary', 'files'] }
const RULES = `Read ${D}/BRIEF.md first and follow it, its "Every agent" rules included. Your final reply is the structured output only, its summary at most 3 short lines.`

phase('Ideas')
const built = await agent(`Video 4 ideas round, one sequence. Work in ${R}. ${RULES}
Start from the feeling: the brief's table gives each beat's story moment and what the viewer should feel. First write your FILM CONCEPT at the top of ${D}/SEQ.md: one imaginative idea for the whole film (its world, its central device, the thread's journey, the arc of feeling from the first frame to the payoff), invented for this story. Choose the concept that makes the strongest, most readable film for these beats and these feelings; starting thoughts, never limits: the city itself as the stage; the machine and its mechanism made delightful; the heat's journey from a computer to a home; one home and one person at the centre. Then, for each of the 12 beats, ONE idea inside that concept, and for the beats you are least sure of (at most four) one alternate, each as the brief's job says. Plan each frame on the frame card's questions (feeling first; the composition library consulted only after the frame is imagined). Draw each as a whole-frame thumbnail: value sketches with the one warm accent, the caption seat kept as a light band. Render ${D}/SEQ_sheet.png: the 12 in beat order labelled B1 to B12, the alternates after them labelled like B4alt. Write SEQ.md from your first step (the concept, then beat by beat). Then LOOK at your sheet at phone size, in order, as one film: does each frame give its beat's feeling in a second, is it worth pausing on, imaginative, whole, and a chapter of your concept? Redraw what isn't.`,
  { label: 'ideas: one sequence', phase: 'Ideas', schema: OUT, effort: 'max' })
log(`build: ${built ? built.status + ' | ' + built.summary : 'missing'}`)

phase('Evaluate')
const ev = await agent(`THE FRAME LOOP for video 4's ideas sequence. Work in ${R}. You are a FRESH evaluator: you built none of this. FIRST, before reading anything else, look at ${D}/SEQ_sheet.png at full size and at phone size, in order, and start ${D}/EVAL.md with one line per thumbnail, "The feeling it gives: ...", written from the picture alone. THEN read ${D}/BRIEF.md (its "Every agent" rules apply to you; the beats and the feeling each should give), ${D}/SEQ.md (the concept and the ideas), and in ${R}/video/docs/PIPELINE_V2.md the sections "THE FRAME LOOP", "ONE FILM, NEVER A HODGE-PODGE" and "A RICH, BEAUTIFUL WORLD". Then, per thumbnail, the intended feeling beside the one it gives and a verdict: THERE, ALMOST (exactly what holds it back, each note one concrete change and why) or NOT THERE (why the idea fails its feeling). Then one BOARD READ: does the story read from the frames alone, as one world, one thread, one arc of feeling? Then the sequence's verdict (THERE when every frame is THERE or needs only polish). Where it helps, a paint-over: a marked-up copy of the sheet (circles, arrows, short labels) at ${D}/EVAL.png. Measurements only ever explain a gap your eye found. Your final reply is the structured output only, its summary at most 3 short lines.`,
  { label: 'evaluate', phase: 'Evaluate', schema: EVAL, effort: 'max' })
log(`evaluate: ${ev ? ev.verdict + ' | ' + ev.summary : 'missing'}`)

let fixed = null
if (ev && ev.verdict !== 'THERE') {
  phase('Adjust')
  fixed = await agent(`THE FRAME LOOP, the adjust round for video 4's ideas sequence. Work in ${R}. ${RULES}
You are the builder now: the work so far is ${D}/SEQ.md and ${D}/SEQ_sheet.png (its source sits next to it, as SEQ.md says). A fresh evaluator judged it: read ${D}/EVAL.md (and ${D}/EVAL.png if it exists). For every ALMOST thumbnail, fix exactly what the note names, nothing else. For every NOT THERE thumbnail, rework it from the idea: a new approach to the beat (a different idea or staging) inside the film concept, never a patch. Keep every THERE thumbnail as it is. If the board read found a break in the one world, the thread or the arc of feeling, mend it at its source. Re-render ${D}/SEQ_sheet.png (same layout and labels) and add a section "Round 1 changes" to SEQ.md (each change in one line: the note and what you did). Then LOOK at the sheet at phone size, in order, before you reply.`,
    { label: 'adjust', phase: 'Adjust', schema: OUT, effort: 'max' })
  log(`adjust: ${fixed ? fixed.status + ' | ' + fixed.summary : 'missing'}`)
}
return { built, ev, fixed }
