export const meta = {
  name: 'edge-treatment-lab',
  description: 'Prototype 5+ hand-drawn edge treatments (reference-1 messiness at the frame edges) as a global switch, render stills and motion clips on 3 shots, judge on 4 lenses, refine the top 2 for the user to pick',
  phases: [
    { title: 'Build', detail: 'edge module + EdgeLab variants, stills and clips' },
    { title: 'Judge', detail: 'premium, immersion, hand-drawn charm, legibility' },
    { title: 'Refine', detail: 'polish the top 2, final comparison' },
  ],
}

const ROOT = '/home/user/Test-/video'
const OUT = `${ROOT}/review/edges`
const CONTEXT = `
Project: ${ROOT} (Remotion 4 + React 18 + TypeScript). FIRST read ${ROOT}/docs/BRIEF.md (BALANCE NOTE, QUALITY GATES, measured full-bleed numbers), ${ROOT}/docs/ENGINE.md (especially <World>, <Look> ink-only / fills-only states, captions), ${ROOT}/docs/CINE.md, ${ROOT}/docs/style_bible.md (section on how ink overshoots the panel: fills clipped hard to the panel, ink runs 30–62 px past it into the white card; corners overshoot; 20–40% of outlines left open) and ${ROOT}/docs/style_bible_ref2.md.
Look closely at the edges in reference 1: ${ROOT}/assets/ref/f_5.5.png, f_9.0.png, f_3.0.png, f_12.0.png, and the evidence crops in ${ROOT}/docs/style_evidence/ (Read the images). Compare with reference 2's clean full-bleed edges: ${ROOT}/assets/ref2/f_1.png, f_12.png.
THE USER: "I like a bit of hand-drawing messiness that the first video has around the edges of the screen. Maybe we can experiment with a few different variations and see what looks cleaner, more polished and premium." We are full-bleed (reference 2 framing, the viewer feels small) and must stay that way; the edge treatment adds reference 1's hand-made charm at the frame edges without shrinking the world into a card.
LANE: src/lib/edges/** (new module), src/dev/EdgeLab.tsx and its entry in src/dev/registry.ts, ${OUT}/**, docs/EDGES.md. Other agents are editing src/lib core and cine files right now: do NOT edit them. Implement edge treatments as a SCREEN-SPACE wrapper that composes with any scene, e.g. render the scene twice: an ink-only <Look> layer full-frame + the full-colour layer clipped to a hand-cut shape (if <Look> doesn't cover some cine pieces, note it), plus hand-drawn overlay strokes. The edge must stay fixed on screen while the world's camera moves, never flicker, and never touch the caption band's readability (captions render above the treatment).
Render with scripts/render-frames.mjs / scripts/still.sh / npx remotion render (half scale for clips is fine). Keep the machine responsive (concurrency 2).
`

phase('Build')
const build = await agent(`${CONTEXT}
BUILD the edge module and the lab:
1. src/lib/edges: an <EdgeTreatment variant=... seed=... >{scene}</EdgeTreatment> wrapper (and a tiny API to apply it globally from Film/Main later; don't edit Film yourself, document the one-line integration in docs/EDGES.md).
2. Variants (all hand-drawn, deterministic, in the reference ink and paper colours):
   - "clean": control, no treatment.
   - "panel": reference 1 nearly full-bleed: full colour clipped to a slightly hand-cut, slightly irregular inset panel (about 30–45 px in at 1080 wide, not perfectly straight), ink-only layer continuing past it into a thin paper/cream margin, a few corner overshoots.
   - "vignette": full colour clipped to a loose organic hand-drawn shape that pulls in more at the corners; ink-only drawing continues out to the screen edge (center finished, periphery sketch).
   - "construction": full-bleed colour plus subtle hand-drawn construction lines at the edges (overshooting perspective guides, frame tick marks, a few loose strokes) — sparse, never busy.
   - "rough-tb": hand-cut paper edge with ink overshoot at TOP and BOTTOM only (sides stay fully immersive).
   - plus ONE variant of your own invention that you think is the most premium answer to the user's note.
   Each variant has a strength/amount parameter.
3. src/dev/EdgeLab.tsx: renders three representative shots (KitDemo's street at ~7 s, CineDemo's monument shot and CineDemo's vista shot: import those components and time-offset them) under any variant, selectable via props or via a composition per variant (register what you need in src/dev/registry.ts).
4. Outputs in ${OUT}/: (a) a comparison sheet PNG: rows = variants, columns = the three shots, full frames at readable size with labels; (b) a zoomed sheet of the top-left and bottom-right corners per variant (edges are the point); (c) 5 s MP4 clips per variant of the street and the monument with camera motion (half scale is fine), so the edge behaviour in motion can be judged. Look at everything yourself and iterate until each variant is the best version of its idea.
Final message: what each variant does, file paths, render cost per frame for each variant, any limitations (e.g. pieces that ignore <Look>).`, { label: 'build', phase: 'Build' })

const JSCHEMA = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: {
      variant: { type: 'string' }, score: { type: 'number' }, why: { type: 'string' }, improve: { type: 'string' },
    }, required: ['variant', 'score', 'why', 'improve'] } },
    top2: { type: 'array', items: { type: 'string' } },
  },
  required: ['scores', 'top2'],
}
const LENSES = [
  { key: 'premium', brief: 'PREMIUM POLISH: which looks the most clean, polished and premium, like a high-end illustrated short (think top editorial motion studios), not like a filter?' },
  { key: 'immersion', brief: 'FEEL SMALL / IMMERSION: which keeps the viewer inside the world (reference 2 framing) instead of shrinking it back into a card (reference 1\'s "feel big")?' },
  { key: 'charm', brief: 'HAND-DRAWN CHARM: which captures the reference 1 edge messiness the user likes (ink running past the colour, open corners, overshoot) most authentically?' },
  { key: 'phone', brief: 'TIKTOK/REELS ON A PHONE: at phone size with platform UI on top (top ~180 px, bottom ~400 px, right rail), which reads best, keeps captions crisp, and holds up in motion (no flicker, no distracting edge)?' },
]
phase('Judge')
const verdicts = await parallel(LENSES.map(l => () => agent(`${CONTEXT}
You are a JUDGE. Do NOT edit files. Look at everything in ${OUT}/ (comparison sheet, corner zooms, and sample frames you extract from the clips with ffmpeg into /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/edgejudge/). LENS: ${l.brief} Score every variant 1–10, say why in one or two sentences, how it could be better, and pick your top 2.`, { label: `judge:${l.key}`, phase: 'Judge', schema: JSCHEMA })))
const v = verdicts.filter(Boolean)
const tally = {}
for (const x of v) for (const s of x.scores) { tally[s.variant] = (tally[s.variant] || 0) + s.score }
const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1])
log('Ranking: ' + ranked.map(([k, s]) => `${k}=${s.toFixed(1)}`).join(', '))
const notes = v.map((x, i) => `## ${LENSES[i].key}\n${x.scores.map(s => `${s.variant} ${s.score}: ${s.why} | improve: ${s.improve}`).join('\n')}\ntop2: ${x.top2.join(', ')}`).join('\n\n')

phase('Refine')
const top = ranked.slice(0, 2).map(r => r[0])
const refined = await agent(`${CONTEXT}
The judges ranked the edge variants (sum of 4 lenses): ${ranked.map(([k, s]) => `${k}=${s.toFixed(1)}`).join(', ')}.
Their notes:
${notes}
REFINE the top two (${top.join(' and ')}) using every improvement note, and keep "clean" as the control. Then produce the FINAL comparison for the user in ${OUT}/final/: (a) a 3-row sheet (clean, ${top[0]}, ${top[1]}) x the three shots, full frames, labeled; (b) corner zooms; (c) 6 s MP4 clips at FULL 1080x1920 for each of the three variants on the street shot with camera motion and captions, plus one side-by-side MP4 (three panels) for quick comparison. Update docs/EDGES.md with the API, the strength parameter, the integration line for Film, render cost, and limitations.
Final message: paths of the final sheet and clips, and a one-paragraph plain-words description of each of the three for the user.`, { label: 'refine', phase: 'Refine' })
return { ranked, refined }
