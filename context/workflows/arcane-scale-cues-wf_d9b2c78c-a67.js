export const meta = {
  name: 'arcane-scale-cues',
  description: 'Why the Arcane rooftop end frame feels so vast: 3 analysts measure the scale cues, a writer lands a generic "Scale cues" recipe in the guide, a designer plans v3 S9 end frame with them',
  phases: [
    { title: 'Analyse', detail: 'size gradient and repetition; vertical depth and layering; sky and ambient life' },
    { title: 'Write', detail: 'the generic Scale cues recipe in CINEMATIC_GUIDE + COZY_AND_SCALE' },
    { title: 'Plan', detail: 'v3 S9 end frame and move re-dressed with the cues' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'
const SRC = SCR + '/arcane_rec/arcane_s1.mp4'
const OUT = SCR + '/scale'

const CTX = `
THE OWNER (2026-10-26), on the end frames of their favourite Arcane shot (compilation shot #55, ${SRC} at 116-121 s: the sisters tiny at a rooftop
rail, a dense sunlit city receding to the sea, the upper city on its hill, airships, huge clouds): "another point in the Arcane shot is how GREAT the
SCALE feels"; and "even the Arcane scene felt alive because of the density of the city and the details there and the clouds / birds". New playbook
rules: every scene must feel alive (not an object quota); when a scale shot comes, the scale must feel great.
Our library: ${V}/docs/look/CINEMATIC_GUIDE.md (S1-S5; S5 = this shot's move, distilled earlier; analyses in ${SCR}/pullback/composition.md and
light.md), ${V}/docs/look/COZY_AND_SCALE.md (scale rules), measurements ${V}/docs/look/research/arcane_shots.json (other high-scale shots: #94 rise-
over landing, #24 vista with a beam tower, #60/#61/#108 low-horizon breathers). Our style is flat-colour hand-drawn ink (Autumn Ember palette for v3),
1080x1920. Footage and frames stay in the scratchpad (${OUT}); only numbers, words and our own drawings go into the repo; never commit a frame.`

const LENSES = [
  { key: 'gradient', ask: `SIZE GRADIENT, REPETITION AND ANCHORS. On the end frames of #55 (and #94, #24 for comparison): how many distinct buildings /
roofs are visible; how their size shrinks with depth (measure roof or window widths in several depth bands: near, mid, far, horizon; give the ratios);
how detail density changes with distance (texture per tile); the repetition that makes the city "keep going" (rows, how they overlap, where they pass
behind the frame edges); the landmark (the upper city on its hill): its size in the frame, the size of its windows vs the near windows, why it reads as
huge AND far; the scale anchors (the figures, airships, birds, chimneys) and their sizes relative to the frame and to the buildings around them.` },
  { key: 'depth', ask: `VERTICAL DEPTH AND LAYERING. On the end frames of #55 (and #94, #24): the camera height (how far above the street; the drop below the
rail: the street canyon falling away, what of it is visible), the horizon height, the number of depth planes and how each overlaps the next, the value
and saturation steps per plane (atmospheric perspective; measure the luma and saturation per band), the foreground mass (rooftop machinery, the rail) as
the near anchor and how big it is, and the composition lines that carry the eye from the tiny figures to the landmark and the sea.` },
  { key: 'sky', ask: `SKY AND AMBIENT LIFE. On #55 (whole shot, especially the end hold) and the vistas #24, #60, #61, #108: the sky's share of the frame, the
cloud shapes and sizes (huge cumulus vs the city), how clouds and their shadows add scale, what moves during the hold (clouds drifting, birds, airships,
smoke, flags, light) and how fast (measure drift speeds in % of width per second), and how these keep a still frame alive. Translate to flat colour:
cloud shapes in 2-3 flat values, bird flocks, smoke, flags, drift speeds that read on a phone.` },
]

phase('Analyse')
const analyses = await parallel(LENSES.map((L) => () => agent(`${CTX}
YOUR LENS: ${L.ask}
Measure with OpenCV where you can (frames from ${SRC}; write tools and crops to ${OUT}/${L.key}/). Then give a FLAT-COLOUR 9:16 RECIPE: the cues as
rules with numbers that a hand-drawn flat set can apply. At most ~70 lines, numbers first. Return the text and save it to ${OUT}/${L.key}.md.
Look at no more than ~10 images. Do not edit repo files.`, { label: 'scale:' + L.key, phase: 'Analyse' })))
const A = LENSES.map((L, i) => `### ${L.key}\n${analyses[i] || 'FAILED'}`).join('\n\n')

phase('Write')
const writer = 'The librarian already landed the generic Scale cues section in video/docs/look/CINEMATIC_GUIDE.md (after S5, linked from S1 and S5) and a pointer in COZY_AND_SCALE.md, commit f708f04. Read that section in the repo.'

phase('Plan')
const plan = await agent(`${CTX}
YOU ARE THE S9 DESIGNER for video 3. S9 (19.40-22.68, "And so do AI data centers. By the mountain.") is our S5 pull-back: it starts close behind you
on your roof holding your one gold memory stick and lands on tiny you at the parapet, the AI data center (dark, lit sign) and a mountain of memory
sticks bigger than it. The current G5 set: ${V}/src/v3/film/scenes/S9.tsx with kit pieces in ${V}/src/v3/film/kit/ (Rooftop.tsx, Pullback.tsx,
Outside.tsx, Memory.tsx, You.tsx); its frames: ${SCR}/g5/s9/my_check.jpg (and the cut ${V}/deliverables/v3/v3_g5_blocking.mp4 at 19.4-22.7 s).
Our own review: the end frame's lower ~40 % is an empty flat orange roof deck, the house rows look like a repeated pattern, the mountain is cut at the
top right and could dominate more, the data center is small; it does not feel vast or alive yet.
Using the new "Scale cues" recipe (the librarian's report and the analyses below), write ${V}/docs/v3/s9_scale_plan.md (at most ~50 lines): the S9
end frame and the move re-dressed so the scale feels GREAT and alive, keeping the locked staging (start, the move's shape and timing, the pot wipe,
tiny you, the data center, the mountain landing on "mountain"): the layout of the end frame in frame pixels by plane (near machinery and the rail; the
drop to the street below with life in it; the town receding in size steps into haze; the data center campus; the mountain; the sky with huge clouds,
birds, drones or planes; snow), what moves during the move and the hold, the value steps per plane in Autumn Ember at blue hour, and what the S9 lane
must change in the files (a list). This plan will be given to the S9 lane in the density rollout. Commit only that file (same git rules: git add
<path>; wait on index.lock; never pull/merge/rebase/reset/stash; message ending with the two lines above; push once, leave it if rejected).
Report in at most 8 lines.

LIBRARIAN:
${writer || 'FAILED'}

ANALYSES:
${A}`, { label: 'S9 designer', phase: 'Plan' })

return { analyses: A, writer, plan }
