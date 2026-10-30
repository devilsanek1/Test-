export const meta = {
  name: 'v4-ideas-round',
  description: 'Video 4 ideas round (the new loop, step 3): two whole sequences of whole-frame idea thumbnails, each from one film concept, then THE FRAME LOOP (a fresh evaluator, adjust or rework, at most 2 rounds)',
  phases: [
    { title: 'Ideas', detail: 'two independent imaginations, one whole sequence each' },
    { title: 'Evaluate', detail: 'a fresh evaluator: the feeling first, every frame in its board, a board read' },
    { title: 'Adjust', detail: 'the builders fix exactly the notes; NOT THERE frames reworked from the idea' },
  ],
}
const R = '/home/user/Test-'
const D = `${R}/video/docs/v4/ideas`
const OUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['status', 'summary', 'files'] }
const EVAL = { type: 'object', properties: {
  status: { type: 'string', enum: ['done', 'partial', 'blocked'] },
  A: { type: 'string', enum: ['THERE', 'ALMOST', 'NOT THERE'] },
  B: { type: 'string', enum: ['THERE', 'ALMOST', 'NOT THERE'] },
  base: { type: 'string', enum: ['A', 'B'] },
  summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } },
}, required: ['status', 'A', 'B', 'base', 'summary', 'files'] }
const IMAG = [
  { id: 'A', lens: 'THE CITY AS THE STORY: Helsinki itself is the imaginative stage (its homes, windows, streets, harbour and the heat travelling through them); the ideas grow out of the place' },
  { id: 'B', lens: 'THE MACHINE AND THE MECHANISM: the giant computer, its heat, the water and the pipes are the imaginative stage; the ideas make the mechanism delightful and readable' },
]
const RULES = `Read ${D}/BRIEF.md first and follow it, its "Every agent" rules included. Your final reply is the structured output only, its summary at most 3 short lines.`

phase('Ideas')
const built = await parallel(IMAG.map(I => () => agent(`Ideas round, imagination ${I.id}. Work in ${R}. ${RULES}
Your lens (lean on it, but every beat must still say what the voice says): ${I.lens}.
First write your FILM CONCEPT at the top of ${D}/${I.id}.md: one imaginative idea for the whole film (its world, its central device, the thread's journey, the arc of feeling from the first frame to the payoff), invented for this story. Then, for EACH of the 12 beats (the brief's table), 2 ideas as two takes inside that one concept (free: the pictures, the staging and the camera are yours; v3's visual script is only one candidate; composed with the brief's toolbox: the composition library's grammar in every frame and one lead device per frame, named by its code; the layout bands; a full, specific, coherent world): a title, one line (what the viewer sees and gets), how it flows into the next beat, and a whole-frame thumbnail (each 270 x 480 on a sheet, monochrome values plus the one warm accent, the caption seat marked as a light band; drawn whole: the idea, the world around it, people, light). Partial files from a stopped earlier run may sit at your paths: replace them with your own. Write ${D}/${I.id}.md from your first step (the concept, then beat by beat: the two ideas, which you'd pick and why), and render ${D}/${I.id}_sheet.png (all 24 thumbnails in a grid in beat order, labelled B1a, B1b, ...). Then LOOK at your sheet at phone size, in order, as one film: is every frame worth pausing on, readable in a second, imaginative, whole (no lone object on an empty field), and a chapter of your concept? Redraw what isn't.`,
  { label: `ideas ${I.id}`, phase: 'Ideas', schema: OUT, effort: 'max' })))
built.forEach((r, i) => log(`build ${IMAG[i].id}: ${r ? r.status + ' | ' + r.summary : 'missing'}`))

const verdicts = []
for (let round = 1; round <= 2; round++) {
  phase('Evaluate')
  const ev = await agent(`THE FRAME LOOP, evaluation round ${round} of the video 4 ideas round. Work in ${R}. ${RULES}
You are a FRESH evaluator: you built none of this. Read the frame loop in ${R}/video/docs/PIPELINE_V2.md ("THE FRAME LOOP", "ONE FILM, NEVER A HODGE-PODGE", "A RICH, BEAUTIFUL WORLD" points 3-4) and the playbook's THE THREE RULES (${R}/video/docs/OWNER_PLAYBOOK.md, top). Then look at the two sequences: ${D}/A_sheet.png with ${D}/A.md, and ${D}/B_sheet.png with ${D}/B.md${round > 1 ? `, after the builders' fixes to round ${round - 1}'s notes (${D}/EVAL_r${round - 1}.md)` : ''}. Judge each sequence as a viewer would, at phone size, every frame IN its board (all frames in order), the FEELING first: does each frame give its beat's feeling and idea in a second, and is it worth pausing on? Then: is it imaginative (never a dry diagram, never a metaphor that needs explaining or bends the facts), whole (the full world, never a lone object on an empty field), and a chapter of its sequence's film concept, continuing the thread and handing on to the next frame? Then one BOARD READ per sequence: does the story read from the frames alone, as one world, one thread, one arc?
Write ${D}/EVAL_r${round}.md from your first step: per sequence, per thumbnail one verdict (THERE / ALMOST / NOT THERE) with, for ALMOST, exactly what holds it back and why (each note one concrete change), and for NOT THERE why the idea fails the feeling; then the board read; then the sequence's verdict (THERE when every frame is THERE or needs only polish). Where it helps, a paint-over: a marked-up copy of a sheet (circles, arrows, short labels drawn on it) at ${D}/EVAL_r${round}_A.png or _B.png. Last, which sequence is the stronger BASE for the film (the base is then improved beat by beat inside its own concept, never a collage of both) and why, in two lines.`,
    { label: `evaluate r${round}`, phase: 'Evaluate', schema: EVAL, effort: 'max' })
  verdicts.push(ev)
  log(`evaluate r${round}: ${ev ? `A ${ev.A}, B ${ev.B}, base ${ev.base} | ${ev.summary}` : 'missing'}`)
  if (!ev) break
  const todo = IMAG.filter(I => ev[I.id] !== 'THERE')
  if (!todo.length) break
  phase('Adjust')
  const fixed = await parallel(todo.map(I => () => agent(`THE FRAME LOOP, adjust round ${round} for imagination ${I.id} of the video 4 ideas round. Work in ${R}. ${RULES}
You are the builder of sequence ${I.id} (its lens: ${I.lens}). Your work so far: ${D}/${I.id}.md and ${D}/${I.id}_sheet.png (its source sits next to it, as ${I.id}.md says). A fresh evaluator judged it: read ${D}/EVAL_r${round}.md (the ${I.id} part, and ${D}/EVAL_r${round}_${I.id}.png if it exists). For every ALMOST thumbnail, fix exactly what the note names, nothing else. For every NOT THERE thumbnail, rework it from the idea: a new approach to the beat (a different idea, staging or device) inside your film concept, never a patch${round > 1 ? ' (a thumbnail already reworked in an earlier round is reworked no more: leave it, and say in your .md what each of its options lacks, for the owner to choose)' : ''}. Keep every THERE thumbnail as it is. If the board read found a break in the one world, the thread or the arc, mend it at its source. Re-render ${D}/${I.id}_sheet.png (same grid and labels) and add a section "Round ${round} changes" to ${D}/${I.id}.md (each change, one line: the note and what you did). Then LOOK at the sheet at phone size, in order, before you reply.`,
    { label: `adjust ${I.id} r${round}`, phase: 'Adjust', schema: OUT, effort: 'max' })))
  fixed.forEach((r, i) => log(`adjust ${todo[i].id} r${round}: ${r ? r.status + ' | ' + r.summary : 'missing'}`))
}
return { built, verdicts }
