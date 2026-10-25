export const meta = {
  name: 'edge-hints-a2',
  description: 'Phase A2: per-scene paint-edge hints (bare corners only on drawing, keep rects for heroes/Pip/key props) for the finished scenes, reviewed on Main with paint-subtle',
  phases: [
    { title: 'Build', detail: 'scan clean renders, write EDGE_HINTS, add keep rects, render Main with edges' },
    { title: 'Review', detail: 'adversarial look at every finished scene with edges on' },
    { title: 'Fix', detail: 'one fix round' },
  ],
}
const ROOT = '/home/user/Test-/video'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/edgehints'
const SCENES = (args && args.scenes) || ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S11', 'S12']
const CTX = `Project ${ROOT} (Remotion + React + TS, a 55 s 1080x1920 hand-drawn explainer). The film uses the 'paint-subtle' edge treatment (src/lib/edges, docs/EDGES.md: read it fully, esp. the hints section, the keep rects and the presets): a white paper base with the colour painted on and a loosely painted edge; corners can go bare only where the scene has line art there, keep rects are never cut. Film (src/lib/Film.tsx) wraps the full film's scene stack in <FilmEdges scene={id}> (one painting per scene; S12 wears S01's painting for the loop seam). Single-scene comps (e.g. "S03") render WITHOUT edges (clean) - use them for scanning; use Main (the full film) to see edges.
YOUR LANE: src/lib/edges/hints.ts (EDGE_HINTS entries keyed by scene id) and docs/EDGES.md. Do NOT edit scenes, other lib files, or src/data. Other agents are editing scenes S07, S08, S09, S10 right now: do not write hints for those yet. Do not commit.
Tools: review/edges/loose/final/tools/scan_hints.py (read its header: it measures line-art density per edge region over several CLEAN full-res frames and finds the mascot Pip's bbox as a keep rect; hero figures and key props are added by hand). Render clean frames: node scripts/render-frames.mjs <SceneId> <dir> <t1,t2,...> --concurrency=2 (full res; scene-local seconds). Render Main with edges: node scripts/render-frames.mjs Main <dir> <film seconds> --scale=0.5 --concurrency=2. Scene times: src/data/scenes.json. The machine is shared: concurrency <= 2.`
const built = await agent(`${CTX}
TASK: write EDGE_HINTS for ${SCENES.join(', ')}. For each scene: render 5-6 clean full-res frames spread over the scene (include the first and last 0.2 s and any camera move extreme), run scan_hints.py, then add keep rects by hand for the hero figure(s), Pip (if the scan missed part of a move), and key story props near the frame edges (e.g. S01's near observer and onlookers, S11/S12's onlookers and lamp, labels near edges). Union the keep rects over the scene's motion (they are fixed screen rects for the whole scene). Then render Main at 4 times per scene (with edges) into ${SCRATCH}/main/ and LOOK at every frame: bare corners must hold drawing (never a blank white trapezoid on flat sky), no hero/Pip/prop half colour half line art, nothing important lost under the white margin, captions untouched. Iterate the hints until every frame looks deliberate. Also check the S12 -> S01 loop seam still matches (render Main at 55.3333 and 0, diff below y 600 must be 0 px). Make a contact sheet ${SCRATCH}/sheet.png (scene rows x 4 frames, half res). Final message: per scene the ink values and keep rects you set and why, anything you could not solve, the sheet path.`, { label: 'build', phase: 'Build' })
const review = await agent(`${CTX}
You are an ADVERSARIAL REVIEWER of the edge hints just written. Do NOT edit files. The builder reported:
${built}
Render Main yourself at 5 fresh times per scene for ${SCENES.join(', ')} (different from the builder's) into ${SCRATCH}/review/ at half res and LOOK. Find: blank white wedges on flat sky, any hero/Pip/key prop cut by the edge, an edge that looks like a rendering error rather than a hand-painted page, a bare corner under a caption, a scene where the edge pops or shifts within the scene (it must be fixed per scene), the S12->S01 loop seam (0 px below y 600). Report each problem with scene, time, region and an exact hints change (rect coordinates / ink value), or 'ok'.`, { label: 'review', phase: 'Review' })
let fix = null
if (!/^\s*ok\b/i.test(review)) {
  fix = await agent(`${CTX}
Fix what this reviewer found (verify each claim first by rendering that frame):
${review}
Re-render the affected frames and LOOK. Update docs/EDGES.md (a short per-scene hints note). Final message: what changed.`, { label: 'fix', phase: 'Fix' })
}
return { built, review, fix }