export const meta = {
  name: 'v4-ideas-round',
  description: 'Video 4 ideas round (the new loop, step 3): two independent imaginations each draw whole-frame idea thumbnails for all 12 beats, readable and imaginative like video 1',
  phases: [{ title: 'Ideas', detail: 'two independent idea agents' }],
}
const R = '/home/user/Test-'
const D = `${R}/video/docs/v4/ideas`
const OUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['status', 'summary', 'files'] }
const IMAG = [
  { id: 'A', lens: 'THE CITY AS THE STORY: Helsinki itself is the imaginative stage (its homes, windows, streets, harbour and the heat travelling through them); the ideas grow out of the place' },
  { id: 'B', lens: 'THE MACHINE AND THE MECHANISM: the giant computer, its heat, the water and the pipes are the imaginative stage; the ideas make the mechanism delightful and readable' },
]
phase('Ideas')
const res = await parallel(IMAG.map(I => () => agent(`Ideas round, imagination ${I.id}. Work in ${R}. Read ${D}/BRIEF.md first and follow it. Your lens (lean on it, but every beat must still say what the voice says): ${I.lens}. Your final reply is the structured output only, its summary at most 3 short lines.
Look first at video 1's frame (${R}/video/docs/look/ref_v1_governments_frame.png) and the visual script v3. For EACH of the 12 beats, 2 ideas: a title, one line, and a whole-frame thumbnail (each 270 x 480 on a sheet, monochrome values plus the one warm accent, the caption seat marked as a light band; drawn whole: the idea, the world around it, people, light). Write ${D}/${I.id}.md from your first step (beat by beat: the two ideas, which you'd pick and why), and render ${D}/${I.id}_sheet.png (all 24 thumbnails in a grid, labelled S1a, S1b, ...). Then LOOK at your sheet at phone size: is every frame worth pausing on, readable in a second, imaginative, and whole (no lone object on an empty field)? Redraw what isn't.`,
  { label: `ideas ${I.id}`, phase: 'Ideas', schema: OUT, effort: 'max' })))
res.forEach((r, i) => log(`${IMAG[i].id}: ${r ? r.status + ' | ' + r.summary : 'missing'}`))
return res
