export const meta = {
  name: 'edge-loose-paint',
  description: 'Evolve the chosen "trim" edge into a looser, messier painted-on-white-paper edge like reference 1, in three looseness levels, judged on premium polish and reference-1 charm',
  phases: [
    { title: 'Build', detail: 'painted-edge variant at three looseness levels' },
    { title: 'Judge', detail: 'premium vs reference-1 charm' },
    { title: 'Refine', detail: 'polish the winner, final sheet + clips' },
  ],
}
const ROOT = '/home/user/Test-/video'
const OUT = `${ROOT}/review/edges/loose`
const CONTEXT = `
Project: ${ROOT}. Read ${ROOT}/docs/EDGES.md and the code in ${ROOT}/src/lib/edges/ (variants.ts, EdgeTreatment.tsx, config.tsx) and ${ROOT}/src/dev/EdgeLab.tsx: the edge-treatment lab just finished; the user saw clean / trim / panel (${ROOT}/review/edges/final/edges_final_sheet.png, edges_final_corners.png) and PICKED THE TRIM DIRECTION, with this note:
"I'm thinking it's more like a default white base and then we paint on top of it in a somewhat messy, incomplete way, like in the very first video, with the edges around the page even more loose and messy."
Study reference 1's edges closely: ${ROOT}/assets/ref/f_5.5.png, f_9.0.png, f_3.0.png, f_12.0.png and ${ROOT}/docs/style_evidence/ (crops), plus ${ROOT}/docs/style_bible.md on how colour stops and ink overshoots (fills clipped to a panel, ink running 30–62 px past it into the white, corners overshooting, 20–40% of outlines left open, flat colour, no textures or gradients).
GOAL: a new variant "paint" (keep trim/panel/clean intact) = WHITE PAPER BASE with the scene's colour PAINTED ON TOP in a loose, incomplete way at ALL edges of the frame: the colour boundary is irregular and hand-made (uneven margins that wander, bites, a corner or two left mostly unpainted, an occasional stretch where colour reaches the edge), never a clean scissor cut; the ink line art continues past the colour into the white and stops at varied, natural points; still flat-style (no brush texture, no blur, no gradients, no opacity) and premium, not grungy. Keep it fixed on screen while the camera moves, deterministic per scene seed (each scene can get its own slightly different painted edge, like separate paintings), captions untouched (paper never enters the caption band), and keep platform UI zones in mind (the bottom ~400 px and top ~180 px are covered by app UI on a phone, so the messiest parts can live there; the right rail x>950, y 900–1500 has buttons).
Provide an "amount"/looseness parameter and THREE presets: "paint-subtle", "paint-medium", "paint-loose" (the last as messy as reference 1 dares).
LANE: src/lib/edges/** and src/dev/EdgeLab.tsx (+ registry entry), ${OUT}/**, docs/EDGES.md. Don't edit other files.
`
phase('Build')
const build = await agent(`${CONTEXT}
BUILD it and render to ${OUT}/: (a) a sheet with rows = trim (current), paint-subtle, paint-medium, paint-loose and columns = street / monument / vista shots, on a dark phone bezel like the final sheet; (b) 1:1 corner/edge zooms; (c) 6 s full-res clips of the street shot for each of the three paint presets plus one side-by-side. Look at everything next to reference 1's edges and iterate until each preset is the best version of itself. Report render cost.
Final message: what each preset looks like, paths, cost.`, { label: 'build', phase: 'Build' })

const JS = { type: 'object', properties: {
  scores: { type: 'array', items: { type: 'object', properties: { preset: { type: 'string' }, score: { type: 'number' }, why: { type: 'string' }, improve: { type: 'string' } }, required: ['preset', 'score', 'why', 'improve'] } },
  best: { type: 'string' } }, required: ['scores', 'best'] }
phase('Judge')
const vs = await parallel([
  { key: 'premium', brief: 'PREMIUM: which looks most polished, intentional and premium on a phone (a high-end illustrated short), not grungy or broken?' },
  { key: 'ref1', brief: 'REFERENCE-1 CHARM and the USER\'S NOTE: which best matches "white base, colour painted on top in a messy incomplete way, edges loose and messy" like reference 1?' },
].map(l => () => agent(`${CONTEXT}
You are a JUDGE. Do NOT edit files. Look at ${OUT}/ (sheet, zooms, frames you extract from the clips into /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/loosejudge/). LENS: ${l.brief} Score trim, paint-subtle, paint-medium, paint-loose 1–10 with why + how to improve; name the best.`, { label: `judge:${l.key}`, phase: 'Judge', schema: JS })))
const notes = vs.filter(Boolean).map(v => `${v.scores.map(s => `${s.preset} ${s.score}: ${s.why} | improve: ${s.improve}`).join('\n')}\nbest: ${v.best}`).join('\n\n')

phase('Refine')
const refined = await agent(`${CONTEXT}
Judges' notes:
${notes}
REFINE all three paint presets with these notes (the user will choose the level), keeping each distinct. Produce the FINAL material in ${OUT}/final/: a sheet (trim vs paint-subtle vs paint-medium vs paint-loose x 3 shots, phone bezel), corner zooms, a 6 s full-res street clip per paint preset, and a 4-panel side-by-side clip. Update docs/EDGES.md (presets, parameter, cost, the one-line Film integration). Final message: paths, a plain-words description of each preset, and which one you'd recommend and why.`, { label: 'refine', phase: 'Refine' })
return { notes, refined }
