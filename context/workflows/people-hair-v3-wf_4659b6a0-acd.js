export const meta = {
  name: 'people-hair-v3',
  description: 'People iteration 3: the owner note on v2 (computer neck; bed-head hair): measure the references, revise the recipe to a proper clean stylish cut with one flow and a touch of looseness, upright neck, rebuild and re-render the stills',
  phases: [
    { title: 'Measure, revise, rebuild', detail: 'refs vs v2 measured; recipe v3; the code; stills re-rendered; refs-vs-ours sheet' },
  ],
}
const R = '/home/user/Test-'
const D = `${R}/video/docs/look/people_design/hair_v2`
const OUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['status', 'summary', 'files'] }
phase('Measure, revise, rebuild')
const r = await agent(`People iteration 3. Work in ${R}. Read ${D}/BRIEF_v3.md first (the owner's note on the v2 stills, the new playbook rule, my first read of the gap), then ${D}/BRIEF.md and follow its "Every agent" rules (an ITERATION: you are the one agent; no critic, no panel; stills only; about an hour). Your final reply is the structured output only, its summary at most 3 short lines.
Read: the references (${R}/video/docs/look/people_design/refs_hair_2026-10-30/, all images, and the owner's crop of our v2 there), ${D}/RECIPE.md (v2 and its "Changes from the stills"), ${D}/RESEARCH.md, ${D}/stills/STILLS.md and the v2 stills, and the code in ${R}/video/src/look/people_dirs/hair_v2/ (lock.ts, cuts.ts, states.ts, hair.ts, stance.ts, people.ts, Sheets.tsx) and ${R}/video/src/entry-look-people-hair.tsx.
DO, writing ${D}/V3.md from your first step:
1. COMPARE DEEPER: put each reference head beside our nearest v2 cut and measure both the same way (big shapes per head, lock count, flow-direction spread, tips and hem, breaks in the silhouette, inner detail, loose bits, wave frequency and phase, the neck angle); a sheet ${D}/stills/08_refs_vs_v2.png. Say plainly why ours reads "like a person woke up" and theirs clean and stylish.
2. REVISE the recipe as RECIPE.md section "v3 (after the owner's note)": the cut first (each cut's defining silhouette and lines, the way a stylist would cut it), one flow field from the parting and crown, 2-5 big shapes, a clean hem with tips alike per cut, the life as a touch (0-2 placed loose bits at film size, a few more only in close shots), broad in-phase waves, one shadow shape and one sheen per big shape; the wind states as the whole shape leaning and its accents lifting, never scattering into strands; the neck back upright (the head stacked over the shoulders, a long neck, chin level; keep the relaxed shoulders, the weight shift and the arm off the body if they still read well). Update the cut table where a cut changes, and drop or redesign any cut that can't be made clean and stylish (the textured crop's spikes read as dark flames; the twists read blocky).
3. REBUILD in the hair_v2 code (it is ours; keep v2 reproducible behind a version switch if cheap, else note what changed) and RE-RENDER into ${D}/stills/ with a v3 suffix: 01_her_before_after_v3.png (before = direction C as drawn now, after = v3; add v2 small for reference if it fits), 02_hair_library_v3.png, 03_wind_states_v3.png, 04_cast_in_evening_scene_v3.png, and 09_refs_vs_v3.png (the references beside our v3 cuts). Re-render 05-07 as v3 only if it costs one command each. LOOK at each at full size and at phone size: is every head a proper, stylish, clean haircut a regular viewer would call good-looking, with only a touch of looseness; is the neck upright and elegant? Fix what doesn't. Update ${D}/stills/STILLS.md (a v3 block) and rebuild ${D}/stills/contact_sheet.jpg with the v3 stills first.`,
  { label: 'v3: measure, revise, rebuild', phase: 'Measure, revise, rebuild', schema: OUT, effort: 'max' })
log(`v3: ${r ? r.status + ' | ' + r.summary : 'missing'}`)
return r
