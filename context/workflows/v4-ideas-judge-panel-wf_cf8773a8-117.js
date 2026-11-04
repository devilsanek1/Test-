export const meta = {
  name: 'v4-ideas-judge-panel',
  description: 'Video 4 ideas round, the judges: three fresh judges with different eyes (the cold viewer, the art director, the story editor) read the four finished sequences as films, frames first; one synthesis picks the base and the beats to improve inside it',
  phases: [
    { title: 'Judge', detail: 'three fresh judges, one lens each, frames before notes' },
    { title: 'Synthesize', detail: 'the base film, the ranking, the beats to improve inside the base' },
  ],
}
const R = '/home/user/Test-'
const D = `${R}/video/docs/v4/ideas`
const OUT = { type: 'object', properties: {
  status: { type: 'string', enum: ['done', 'partial', 'blocked'] },
  base: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
  ranking: { type: 'string' },
  summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } },
}, required: ['status', 'base', 'ranking', 'summary', 'files'] }
const LENSES = [
  { id: 'viewer', who: 'THE COLD VIEWER: a regular person scrolling short videos at night, who has never heard of this project. Judge what you understand and feel from the frames in order, sound off first, then imagining the voice over them: where you would stop scrolling, where you would smile, where you would get lost or bored, whether you would watch to the end and send it to a friend' },
  { id: 'art', who: 'THE ART DIRECTOR: judge each sequence as the plan for a premium painted film (one world, one light, one warm accent, organic painted pieces, whole frames worth pausing on): how rich, specific and beautiful its world can become when painted with our tools, how imaginative and readable each picture idea is, and whether every frame belongs to one world' },
  { id: 'story', who: 'THE STORY EDITOR: judge each sequence against the voice, beat by beat: does each picture say what its line says, in the voice\'s order, true to the facts (a plan, starting next year; no company names), with the arc of feeling the brief asks (surprise, awe, a smile, a pang, the turn, hope, "oh, that\'s how", cozy relief, the personal payoff), and does the payoff loop back to the hook' },
]
const COMMON = `Work in ${R}. Read ${D}/BRIEF.md first (its "Every agent" rules apply to you; the beats and the feeling each should give) and, in ${R}/video/docs/PIPELINE_V2.md, "ONE FILM, NEVER A HODGE-PODGE" and "A RICH, BEAUTIFUL WORLD". You are FRESH: you built and reviewed none of this. Your final reply is the structured output only, its summary at most 3 short lines.`

phase('Judge')
const judged = await parallel(LENSES.map(L => () => agent(`Video 4's ideas round, a judge across the four finished sequences. ${COMMON}
Your eye: ${L.who}.
FIRST, before reading any sequence's notes, look at the four final sheets ${D}/A_sheet.png, ${D}/B_sheet.png, ${D}/C_sheet.png and ${D}/D_sheet.png at phone size, in beat order, and start ${D}/JUDGE_${L.id}.md with, for each: "The film it makes:" (what you understood and felt from the frames alone) and "The arc of feeling:" (beat by beat, in a line). THEN read each X.md (the concept, the ideas, the round changes) and each sequence's last X_EVAL_rN.md. Then, through your eye, rank the four with a line of why for each, name the one you would make, and list, for that one, the beats that most need to improve and how (inside its own concept, never a collage of the others). Write only ${D}/JUDGE_${L.id}.md.`,
  { label: `judge: ${L.id}`, phase: 'Judge', schema: OUT, effort: 'max' })))
judged.forEach((j, i) => log(`judge ${LENSES[i].id}: ${j ? 'base ' + j.base + ' | ' + j.ranking : 'missing'}`))

phase('Synthesize')
const syn = await agent(`Video 4's ideas round, the synthesis of three judges. ${COMMON}
Three fresh judges, each with a different eye, read the four finished sequences: ${D}/JUDGE_viewer.md (the cold viewer), ${D}/JUDGE_art.md (the art director) and ${D}/JUDGE_story.md (the story editor). Read the three, then look at the four sheets yourself (${D}/A_sheet.png, B_sheet.png, C_sheet.png, D_sheet.png) to settle where they disagree. Write ${D}/JUDGE.md: (1) the four films in one line each (the concept as a viewer would tell it to a friend); (2) the ranking, with where the judges agreed and where they split, and why; (3) ONE recommended base film and why it is the strongest film for this voice; (4) inside the base's own concept only (never a collage of sequences), the beats to improve and how, each in a line, and any picture from another sequence that truly fits the base's world, retold in its terms, with why; (5) the two or three things the owner should look at first. Also render ${D}/JUDGE_board.png: the four sequences as labelled strips one under another (the 12 beat frames each, in order, at phone size, the base marked), built from the sheets' own frame images where they exist, else crops of the sheets. Write only JUDGE.md and JUDGE_board.png.`,
  { label: 'synthesize', phase: 'Synthesize', schema: OUT, effort: 'max' })
log(`synthesis: ${syn ? 'base ' + syn.base + ' | ' + syn.ranking + ' | ' + syn.summary : 'missing'}`)
return { judged, syn }
