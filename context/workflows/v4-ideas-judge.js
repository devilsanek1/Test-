export const meta = {
  name: 'v4-ideas-judge',
  description: 'Video 4 ideas round, the judge: one fresh judge reads the four finished sequences as films (frames first, sound off), ranks them, picks the base and lists the beats to improve inside it',
  phases: [{ title: 'Judge', detail: 'one fresh judge across the four sequences' }],
}
const R = '/home/user/Test-'
const D = `${R}/video/docs/v4/ideas`
const OUT = { type: 'object', properties: {
  status: { type: 'string', enum: ['done', 'partial', 'blocked'] },
  base: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
  ranking: { type: 'string' },
  summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } },
}, required: ['status', 'base', 'ranking', 'summary', 'files'] }
phase('Judge')
const j = await agent(`Video 4's ideas round, the judge across the four sequences. Work in ${R}. Read ${D}/BRIEF.md first (its "Every agent" rules apply to you; the beats and the feeling each should give) and, in ${R}/video/docs/PIPELINE_V2.md, "ONE FILM, NEVER A HODGE-PODGE", "A RICH, BEAUTIFUL WORLD" and "THE FRAME LOOP". You are a FRESH judge: you built and reviewed none of this.
FIRST, before reading any sequence's notes, look at the four final sheets ${D}/A_sheet.png, ${D}/B_sheet.png, ${D}/C_sheet.png and ${D}/D_sheet.png at phone size, in beat order, as a viewer with the sound off, and start ${D}/JUDGE.md with, for each: "The film it makes:" (what you understood and felt from the frames alone) and "The arc of feeling:" (beat by beat, in a line). THEN read each X.md (the film concept, the ideas, the round changes) and each sequence's last X_EVAL_rN.md.
Then judge them as FILMS: is the one concept clear, imaginative and readable at once; true to the facts (a plan, starting next year; no company names); do the beats land the feelings the brief asks, in order; one world, one thread, one arc; every frame worth pausing on and whole; would a regular viewer watch to the end, smile, and share it? Rank the four with a line of why for each. Recommend ONE base sequence. Then, inside the base's own concept only (never a collage), list the beats to improve and how; an idea from another sequence may come in only where it truly fits the base's world and concept, retold in its terms, and say why. Last, the two or three things the owner should look at first. Write only ${D}/JUDGE.md, plus, if it helps, ${D}/JUDGE_board.png (the four sequences as labelled strips one under another, at phone size). Your final reply is the structured output only, its summary at most 3 short lines.`,
  { label: 'judge', phase: 'Judge', schema: OUT, effort: 'max' })
log(`judge: ${j ? 'base ' + j.base + ' | ' + j.ranking + ' | ' + j.summary : 'missing'}`)
return j
