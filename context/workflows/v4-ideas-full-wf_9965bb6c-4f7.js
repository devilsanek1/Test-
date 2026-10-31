export const meta = {
  name: 'v4-ideas-full',
  description: 'Video 4 ideas round, done properly: independent imaginations, each one whole sequence from one film concept, each through THE FRAME LOOP (a fresh evaluator per round, feeling first; up to 2 adjust rounds)',
  phases: [
    { title: 'Ideas', detail: 'one builder per imagination, a whole sequence each' },
    { title: 'Evaluate', detail: 'a fresh evaluator per sequence and round: the feeling it gives first, then the board read' },
    { title: 'Adjust', detail: 'the builder fixes exactly the notes; a NOT THERE frame is reworked from the idea once' },
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
const LENS = {
  A: 'THE CITY AS THE STORY: Helsinki itself is the imaginative stage (its homes, windows, streets, harbour and the heat travelling through them); the ideas grow out of the place',
  B: 'THE MACHINE AND THE MECHANISM: the giant computer, its heat, the water and the pipes are the imaginative stage; the ideas make the mechanism delightful and readable',
  C: "THE HEAT'S JOURNEY: the heat itself is the visible thread the eye follows through the whole film, from a computer answering someone's question to a warm home (a glow, a warm current, never a cartoon face): one continuous trip",
  D: 'ONE HOME, ONE PERSON: the "you" at the centre, a person in one warm Helsinki apartment on a snowy night; every beat is seen from that home or connects back to it, so the big system is always measured against one cozy human life',
}
const IDS = (args && args.ids) || ['A', 'B']
const RULES = `Read ${D}/BRIEF.md first and follow it, its "Every agent" rules included. Your final reply is the structured output only, its summary at most 3 short lines.`

const build = id => agent(`Video 4 ideas round, imagination ${id}. Work in ${R}. ${RULES}
Your lens (lean on it, but every beat must still say what the voice says): ${LENS[id]}.
Start from the feeling: the brief's table gives each beat's story moment and what the viewer should feel. First write your FILM CONCEPT at the top of ${D}/${id}.md: one imaginative idea for the whole film (its world, its central device, the thread's journey, the arc of feeling from the first frame to the payoff), invented for this story through your lens. Then, for each of the 12 beats, ONE idea inside that concept, and for the beats you are least sure of (at most four) one alternate, each as the brief's job says. Plan each frame on the frame card's questions (feeling first; the composition library consulted only after the frame is imagined). Draw each as a whole-frame thumbnail: value sketches with the one warm accent, the caption seat kept as a light band. Render ${D}/${id}_sheet.png: the 12 in beat order labelled ${id}-B1 to ${id}-B12, the alternates after them labelled like ${id}-B4alt. Other imaginations are drawing their own sequences beside you in the same folder: touch only your own files (${id}.md, ${id}_sheet.png and a source folder ${D}/${id}_src/). Write ${id}.md from your first step (the concept, then beat by beat). Then LOOK at your sheet at phone size, in order, as one film: does each frame give its beat's feeling in a second, is it worth pausing on, imaginative, whole, and a chapter of your concept? Redraw what isn't.`,
  { label: `ideas ${id}`, phase: 'Ideas', schema: OUT, effort: 'max' })

const evaluate = (id, round) => agent(`THE FRAME LOOP, evaluation round ${round} of video 4's ideas sequence ${id}. Work in ${R}. You are a FRESH evaluator: you built none of this${round > 1 ? ', and you judge the sheet as it is now, after the builder fixed the notes of the earlier round' : ''}. FIRST, before reading anything else, look at ${D}/${id}_sheet.png at full size and at phone size, in order, and start ${D}/${id}_EVAL_r${round}.md with one line per thumbnail, "The feeling it gives: ...", written from the picture alone. THEN read ${D}/BRIEF.md (its "Every agent" rules apply to you; the beats and the feeling each should give), ${D}/${id}.md (the concept and the ideas${round > 1 ? `, and its "Round ${round - 1} changes"` : ''}), and in ${R}/video/docs/PIPELINE_V2.md the sections "THE FRAME LOOP", "ONE FILM, NEVER A HODGE-PODGE" and "A RICH, BEAUTIFUL WORLD". Then, per thumbnail, the intended feeling beside the one it gives and a verdict: THERE, ALMOST (exactly what holds it back, each note one concrete change and why) or NOT THERE (why the idea fails its feeling). Then one BOARD READ: does the story read from the frames alone, as one world, one thread, one arc of feeling, and is the film concept clear? Then the sequence's verdict (THERE when every frame is THERE or needs only polish). Where it helps, a paint-over: a marked-up copy of the sheet (circles, arrows, short labels) at ${D}/${id}_EVAL_r${round}.png. Measurements only ever explain a gap your eye found. Write only your own two files. Your final reply is the structured output only, its summary at most 3 short lines.`,
  { label: `evaluate ${id} r${round}`, phase: 'Evaluate', schema: EVAL, effort: 'max' })

const adjust = (id, round) => agent(`THE FRAME LOOP, adjust round ${round} for video 4's ideas sequence ${id}. Work in ${R}. ${RULES}
You are the builder of sequence ${id} now (its lens: ${LENS[id]}). The work so far: ${D}/${id}.md, ${D}/${id}_sheet.png and its source in ${D}/${id}_src/. A fresh evaluator judged it: read ${D}/${id}_EVAL_r${round}.md (and ${D}/${id}_EVAL_r${round}.png if it exists). For every ALMOST thumbnail, fix exactly what the note names, nothing else. For every NOT THERE thumbnail, rework it from the idea: a new approach to the beat (a different idea or staging) inside the film concept, never a patch${round > 1 ? '; a thumbnail already reworked in an earlier round is reworked no more: leave it, and say in your .md what each of its options lacks, for the owner to choose' : ''}. Keep every THERE thumbnail as it is. If the board read found a break in the one world, the thread or the arc of feeling, mend it at its source. Re-render ${D}/${id}_sheet.png (same layout and labels) and add a section "Round ${round} changes" to ${id}.md (each change in one line: the note and what you did). Touch only sequence ${id}'s files. Then LOOK at the sheet at phone size, in order, before you reply.`,
  { label: `adjust ${id} r${round}`, phase: 'Adjust', schema: OUT, effort: 'max' })

const results = await pipeline(IDS,
  id => build(id).then(b => { log(`build ${id}: ${b ? b.status + ' | ' + b.summary : 'missing'}`); return b }),
  async (built, id) => {
    const evals = [], fixes = []
    for (let round = 1; round <= 3; round++) {
      const ev = await evaluate(id, round)
      evals.push(ev)
      log(`evaluate ${id} r${round}: ${ev ? ev.verdict + ' | ' + ev.summary : 'missing'}`)
      if (!ev || ev.verdict === 'THERE' || round === 3) break
      const fx = await adjust(id, round)
      fixes.push(fx)
      log(`adjust ${id} r${round}: ${fx ? fx.status + ' | ' + fx.summary : 'missing'}`)
    }
    return { id, built, evals, fixes }
  })
return results
