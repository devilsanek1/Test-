export const meta = {
  name: 'v3-g3-board-cine',
  description: 'v3 G3: put the cinematography back into the clear board (cozy enclosure home base, scale reveal + scale cut, angles) without losing clarity: plan, supervisor check, apply, cold read + cine check, fix',
  phases: [
    { title: 'Opening', detail: '3 new opening concepts (literal mechanism) + judge' },
    { title: 'Plan', detail: 'cinematographer camera plan + supervisor check' },
    { title: 'Apply', detail: 'story artist re-stages panels' },
    { title: 'Check', detail: '3 sound-off viewers + a cinematic reviewer' },
    { title: 'Fix', detail: 'one round' },
  ],
}

const ROOT = '/home/user/Test-/video'
const SP = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'
const CR = SP + '/coldread'
const DOCS = `${ROOT}/docs/look/STORYBOARD_STYLE.md (the board house style; read section 7 "Cinematography belongs in the board"), ${ROOT}/docs/look/CINEMATIC_GUIDE.md (environment shot types S1-S4 and "The opening"), ${ROOT}/docs/look/COZY_AND_SCALE.md (sections 1-3: enclosure framing and cozy rules)`
const CTX = `Video 3's animatic is now a clear monochrome storyboard the owner can follow: ${ROOT}/public/v3/animatic.json (style "board"; panels O1, S4-S16, LOOP), the panel table ${ROOT}/docs/v3/storyboard_g3.md, the render ${ROOT}/deliverables/v3/v3_g3_animatic_board.mp4 (one frame per panel: ${SP}/board_sheet.png). The owner: "this is great, I can follow the story better now. But where is the scale / coziness / learnings from Arcane? Is it intentional that we are not including it in the sketch?" It was not intentional: the clarity re-board flattened the cinematography (most panels are an icon on blank paper; the cozy nook and window were dropped; the rise-over reveal shrank). Goal: put the cinematography back, panel by panel, while keeping every panel's ONE idea and its sound-off readability. Locked: the story, the voice timing (cuts on the same words), the panel ideas EXCEPT the opening. The owner also said: "the only part I didn't get is why the AI data center is growing and consuming the buildings? I think we need to find a different view." So the opening (O1, 0-5.8 s: "Buying a laptop soon? AI's making it pricier. Well, AI DATA CENTERS are.") gets a NEW concept: no growing/consuming metaphor; show the real mechanism literally (AI data centers buy up the memory chips laptops need, so the laptop's price goes up), still a banger (frame 0 drawn live, the expected thing first, reality overtaking it on "pricier" at ~2.6 s, never still, one continuous shot, loop back to the bare-line frame 0), in the cozy home base (the nook with the window) where it helps. Docs: ${DOCS}.

THE PRINCIPLE (owner, now): "focus a lot less on quality and focus on ensuring the reviewer / director gets the highest amount of signal on the final work in the least amount of time / drawing." So: thumbnail-level drawings (the fewest elements that say it), the intent stated explicitly in the notes strip in plain words (the one action, the framing, the shot type, COZY / SCALE, the camera move) plus the red notation mark for any move; animate only where timing is the question (the opening); no polish, no extra detail. STORYBOARD_STYLE.md section 0.`

phase('Opening')
const OC = {
  type: 'object',
  properties: { title: { type: 'string' }, expected: { type: 'string' }, reality: { type: 'string' }, beats: { type: 'array', items: { type: 'object', properties: { t: { type: 'string' }, what: { type: 'string' } }, required: ['t', 'what'] } }, framing: { type: 'string' }, why: { type: 'string' } },
  required: ['title', 'expected', 'reality', 'beats', 'framing', 'why'],
}
const OPEN = [
  { key: 'tag', lens: `the price tag on the phone is the hero: the expected thing is the old deal (the next laptop cheaper or the same price), then the price ticks up as memory chips are pulled out of the laptop on screen toward an AI data center` },
  { key: 'window', lens: `the nook's window is the stage: outside, a calm town; a big AI data center (a plain, clearly labelled building) is already there, and trucks/conveyors pull boxes of memory chips into it while the price on the phone climbs` },
  { key: 'free', lens: `your own best literal, truthful and instantly readable idea for the opening` },
]
const ocs = await parallel(OPEN.map(o => () => agent(`${CTX}\n\nYou are an opening-shot director. Angle: ${o.lens}. Design the opening O1 (0-5.8 s) as ONE continuous board panel sequence that a sound-off viewer understands at once: the expected thing, then reality overtaking it on "pricier", the AI data center named on "AI DATA CENTERS". Concrete, drawable in the monochrome board style with icons (laptop, phone, ram, chip, datacenter, server, pricetag, chart, factory, truck, calendar, house, cart, crane, pile). Don't write files.`, { label: `opening:${o.key}`, phase: 'Opening', schema: OC })))
const openingPick = await agent(`${CTX}\n\nJudge these opening concepts on: instantly readable with the sound off (most important), literal and true to the mechanism, banger (stops the scroll in 1.5 s, escalates on "pricier"), fits the cozy home base and the next panel ("Which is backwards..."). Pick one, list grafts. Concepts:\n${JSON.stringify(ocs.filter(Boolean))}\nReturn max 10 lines: the winner, why, the grafts.`, { label: 'opening-judge', phase: 'Opening' })

phase('Plan')
const plan = await agent(`${CTX}\n\nThe NEW opening (judge's pick and grafts):\n${openingPick}\nConcepts:\n${JSON.stringify(ocs.filter(Boolean))}\n\nYou are the film's cinematographer. Write a camera plan for every panel: shot type (from the guides: the cozy home base as an enclosure frame; S1 rise-over reveal; S3 big sky one landmark; S4 low-horizon breather; a scale cut close->tiny figure; worm's-eye/low angle for the colossus; close-ups for personal beats), framing (size, angle, horizon height, where the subject sits), what the enclosure/scale elements are (drawn simply in monochrome: dark wall masses cut by the frame, one window opening in light grey, a lamp pool shape; tiny figure 0.04-0.08 H), the camera move if any (only where the move is the meaning; mark with the red frame/arrow notation), and how it keeps the one idea readable. Constraints: one big move per film (the reveal); the home base (the nook with the window) opens the film with the NEW opening above, returns in the middle (the waiting beat) and at the callback; 1-2 scale cuts; vary size and angle on purpose. Write the plan to ${ROOT}/docs/v3/camera_plan_g3.md as a table (panel, time, idea, shot type, framing, cozy/scale element, move, readability note). Don't commit. Return the table.`, { label: 'cinematographer', phase: 'Plan' })

const sup = await agent(`${CTX}\n\nYou are the storyboard supervisor. Review this camera plan for clarity risks against the sound-off rule and the board style (12-25 elements, subject darkest, one label): ${plan}\n\nFor each panel: OK, or the one change that keeps the cinematic idea but stays readable. Return max 15 lines.`, { label: 'supervisor', phase: 'Plan' })

phase('Apply')
const apply = await agent(`${CTX}\n\nThe NEW opening (judge's pick):\n${openingPick}\n\nYou are the story artist. Rebuild O1 with the new opening and apply the cinematographer's plan with the supervisor's changes to ${ROOT}/public/v3/animatic.json, panel by panel, in the board style (read ${ROOT}/src/v3/SketchReel.tsx, SketchIcons.tsx, board.ts for the API; ${ROOT}/scripts/v3/build_board.py is the previous builder script if it helps).\n\nPlan:\n${plan}\n\nSupervisor:\n${sup}\n\nKeep: the story, the panel ideas, cuts on the same words, words/audio/sfx/frame0 settings, the LOOP seam, "style":"board". Also fix: the grey ground slab under the mountain panel (S9b). Run "python3 ${ROOT}/scripts/v3/board_lint.py ${ROOT}/public/v3/animatic.json" until clean (if a cinematic element like a wall mass trips a rule, use role "far" or a flat tone as the style allows). Check with stills (cd ${ROOT} && npx remotion still src/entry-v3.tsx Animatic ${SP}/bc_<f>.png --frame=<f> --scale=0.25; 30 fps; max 14). Then regenerate the cold-read sheet ${CR}/sheet_board_cine.jpg (one frame per panel at its middle, opening also at 0.3/2.0/3.0/4.9 s; labelled numbers; montage) and ${CR}/index_board_cine.json. Update ${ROOT}/docs/v3/storyboard_g3.md (add the shot type column). Don't render a video, don't commit. Return max 12 lines: per panel what changed.`, { label: 'story-artist', phase: 'Apply' })

phase('Check')
const COLD = {
  type: 'object',
  properties: { frames: { type: 'array', items: { type: 'object', properties: {
    n: { type: 'number' }, see: { type: 'string' }, understood: { type: 'boolean' }, confusion: { type: 'string' },
  }, required: ['n', 'see', 'understood', 'confusion'] } } },
  required: ['frames'],
}
const PERSONAS = [`Maria, 41, needs to replace the family laptop, doesn't follow tech news`]
const [cold, cine] = await Promise.all([
  parallel(PERSONAS.map((p, i) => () => agent(`You are ${p}. You are watching a short vertical video with the SOUND OFF; you only see these frames (numbered, with caption words). Look at ${CR}/sheet_board_cine.jpg. For each numbered frame: what you see and what it means, whether you understood it, what is confusing. Be honest; judge the PICTURE (caption fragments are expected with sound off). Don't research.`, { label: `cold-read:${i + 1}`, phase: 'Check', schema: COLD }))),
  agent(`${CTX}\n\nYou are a cinematic reviewer. Compare ${CR}/sheet_board_cine.jpg with the camera plan ${ROOT}/docs/v3/camera_plan_g3.md and the docs (${DOCS}). For each panel: was the planned shot type applied (yes / partly / no), and does the film now have a cozy home base that returns, one big reveal, 1-2 scale cuts and purposeful variety of size and angle? Return max 12 lines: what is missing.`, { label: 'cine-reviewer', phase: 'Check' }),
])
const flags = {}
cold.filter(Boolean).forEach(c => c.frames.forEach(f => { if (!f.understood) { (flags[f.n] = flags[f.n] || []).push(f.confusion || f.see) } }))
log(`not understood: ${Object.keys(flags).join(', ') || 'none'}`)

phase('Fix')
const fix = await agent(`${CTX}\n\nYou are the story artist. One fix round on ${ROOT}/public/v3/animatic.json. Sound-off frames NOT understood (numbers -> panels via ${CR}/index_board_cine.json):\n${JSON.stringify(flags)}\nCinematic reviewer:\n${cine}\nFix only what these flag: clearer drawing where a viewer was lost, the planned cinematography where it is missing. Lint clean, check changed panels with stills (max 8), regenerate ${CR}/sheet_board_cine.jpg the same way, update ${ROOT}/docs/v3/storyboard_g3.md. Don't commit. Return max 8 lines.`, { label: 'story-artist-fix', phase: 'Fix' })
return { openingPick, plan, sup, apply, flags, cine, fix }
