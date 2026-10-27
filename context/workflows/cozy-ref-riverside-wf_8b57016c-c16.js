export const meta = {
  name: 'cozy-ref-riverside',
  description: 'Measure the owner\'s second cozy reference (painterly riverside: dense layered buildings, people sitting by the water, a few cyclists): camera and motion, composition and layering, colour and texture, and why it never feels empty with little motion (density.py on both cozy refs vs v3)',
  phases: [
    { title: 'Analyse', detail: '4 lenses on the riverside reference' },
  ],
}

const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'
const REF = SCR + '/cozy3/ref.mov'
const V = '/home/user/Test-/video'

const CTX = `
The owner of our short-form explainer channel (vertical 1080x1920, flat-colour hand-drawn ink style) sent two references for COZINESS AND COMFORT
and asked us to "really figure out what about the scene composition / movements / texture / camera / details brings out this feeling. This is a
recurring topic which we need to evolve, like the ratio of width / height of a building on a shot". On THIS clip they added: "it doesn't feel empty
at all".
THIS CLIP: ${REF} (704x1346 portrait phone recording, 60 fps, 4.9 s). A painterly riverside: dense, colourful layered buildings (pink, orange, purple,
a yellow glass block) with balconies, signs and power lines across the top half; trees and a dark-red bush; stairs down to a riverside path where people
sit and cyclists pass; a stone embankment; a turquoise river with brushy texture at the bottom; a dark torn-paper edge around the frame. Strip:
${SCR}/cozy3/strip.jpg. The OTHER reference (a painterly street from above, traffic under flowering trees) is ${SCR}/cozy2/ref.mov (strip
${SCR}/cozy2/strip.jpg); other agents are analysing it, do not duplicate that.
Our rules today: ${V}/docs/look/COZY_AND_SCALE.md (enclosure H:W ratios, prospect-refuge, the cozy dose), ${V}/docs/look/LIFE_AND_DENSITY.md (feel
alive; numbers are a warning signal, never a quota), ${V}/docs/OWNER_PLAYBOOK.md (Visual style). Our video 3 G5 cut, judged "way too empty":
${V}/deliverables/v3/v3_g5_blocking.mp4. Footage stays in the scratchpad; never copy the clip or its frames into the repo; do not edit repo files.
Write tools and outputs under ${SCR}/cozy3/<your lens>/ and save findings to ${SCR}/cozy3/<your lens>.md. Look at no more than ~10 images.
Final answer: findings, at most ~60 lines, numbers first, then rules for a flat hand-drawn 9:16 frame.`

const LENSES = [
  { key: 'motion', ask: `CAMERA AND MOTION: does the camera move (pan, drift, zoom, sway)? Every moving element (cyclists, walkers, the water, leaves,
people sitting): path, speed in % of frame per second, size, entries and exits, how many move at once, the rhythm, any frame with nothing moving;
change density over time (share of pixels changing per frame, motion blobs per second); ambient motion (water shimmer, texture boil); the loop. Then:
what in the motion makes it calm and comfortable.` },
  { key: 'composition', ask: `COMPOSITION, LAYERING AND ENCLOSURE: the horizontal bands (sky, buildings, trees, path, embankment, river) and their shares
of the frame; the eye-level vantage from across the water; how the buildings stack in depth (overlap, how many layers, how much sky); what encloses the
view (the building wall as a backdrop, the river as a moat, the trees); where people sit and how small they are vs the frame; where the busy and calm
areas are; what is cut by the frame edges. Compare with the enclosure H:W ratios in COZY_AND_SCALE.md: what is the equivalent ratio or rule here
(e.g. the building wall's height vs the open foreground)? How should the rules evolve?` },
  { key: 'colour', ask: `COLOUR, LIGHT, TEXTURE AND DETAIL: k-means palette with shares, warm vs cool, saturation and value; the pastel-pink/orange
buildings vs the turquoise water and sky; the light and shadows; the texture (brush-stroke scale, where it is strong vs absent, the water strokes,
the paper edge's width and colour); line work; the small lived-in details (AC units, signs, balconies, antennas, bikes, people's clothes). How far can
we take this inside our flat style (owner: very subtle texture, paper edges never at the top or beside the caption band)?` },
  { key: 'fullness', ask: `WHY IT NEVER FEELS EMPTY although little moves. Run ${V}/scripts/qa/density.py (read its usage in the header; run from ${V})
on BOTH cozy references (${REF} and ${SCR}/cozy2/ref.mov, trimmed to the illustration: the street clip plays 0-7.9 s) and on our v3 G5 cut, and compare
the fullness metrics (flat share, objects, fine-detail tiles) and the motion metrics. Then explain, with numbers, what makes a frame feel full: detail
density per region, the number of distinct small things, layering, texture, colour variety, people even when still, and how little motion is enough
when the world is dense. Turn it into guidance that refines LIFE_AND_DENSITY.md (feel alive, never a quota): e.g. "fullness comes first from the world,
motion second".` },
]

phase('Analyse')
const results = await parallel(LENSES.map((L) => () => agent(`${CTX}
YOUR LENS: ${L.ask}`, { effort: 'max', label: 'riverside:' + L.key, phase: 'Analyse' })))
return LENSES.map((L, i) => `### ${L.key}\n${results[i] || 'FAILED'}`).join('\n\n')
