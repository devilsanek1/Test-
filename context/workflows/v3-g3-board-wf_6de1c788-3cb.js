export const meta = {
  name: 'v3-g3-board',
  description: 'v3 G3 re-board in the studio storyboard style: implement the board look + lint in SketchReel, re-board the whole animatic (one idea per panel, icons, monochrome), lint + sound-off cold read, one fix round',
  phases: [
    { title: 'Implement', detail: 'board mode + lint in SketchReel' },
    { title: 'Re-board', detail: 'the whole animatic in board style' },
    { title: 'Check', detail: 'lint + 3 sound-off viewers' },
    { title: 'Fix', detail: 'one round on flagged panels' },
  ],
}

const ROOT = '/home/user/Test-/video'
const SP = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'
const CR = SP + '/coldread'
const STYLE = ROOT + '/docs/look/STORYBOARD_STYLE.md'
const SAFE = `Never leave public/v3/animatic.json broken: to test, copy it to ${SP}/animatic_keep.json, swap in your test, render, and copy it back immediately; check "git -C ${ROOT}/.. diff --stat -- video/public/v3/animatic.json".`

phase('Implement')
const impl = await agent(`You are a front-end engineer for our Remotion animatic tool. Read ${STYLE} fully (section 6 is the implementation spec), ${ROOT}/src/v3/SketchReel.tsx and ${ROOT}/src/v3/SketchIcons.tsx, and ${ROOT}/src/lib/sketch.ts.

Implement the "board" render mode exactly as section 6 specifies: Animatic.style 'board' | 'sketch' (default 'board'); paper/ink/4-tone mapping; stroke widths by role (subject 9 / mid 5 / far 3 px, far in mid grey); fills mapped to tones (pop -> dark subject); hatch -> flat mid-grey; labels/text in ink at 56-72 px (text min 48); icons snapped to the tones via boardTone with outlines following role; the new props role, w, figure pose/facing/face (gesture figures: stand, walk, point, reach, hold, shrug, slump, lookup, sit), text strike, and the {t:'mark'} red notation element (circle/arrow/underline/frame, dashed end-frame with corner arrows for 'frame'); the shot note moved into a notes strip at y 1680-1900 (small grey, off the picture), the caption glow removed; sketch.ts options per the spec (small overshoot, no breaks, low jitter). Keep 'sketch' mode rendering as today so old data still renders. Keep all existing features (draw/fillIn/in/out/moves/f/camera/transitions/icons).

Also write ${ROOT}/scripts/v3/board_lint.py: reads an animatic JSON and prints per-shot warnings per section 6's board-lint list (<= 25 elements, warn at 30; one subject group; <= 1 label and <= 1 mark; text >= 48 px; palette fills only; nothing crossing y 290-600 except a far flat fill; the subject's box centred in x 380-700 and 270-460 px wide; the camera zoom changing <= 2x in a shot); exit code 1 on errors.

Test with a small board-style test file rendered as a still (swap method below), look at it, fix. ${SAFE} "npx tsc --noEmit -p ." must be clean. Don't commit. Return at most 10 lines: the API (new props, defaults) for the storyboard artist.`, { effort: 'max', label: 'implementer', phase: 'Implement' })

const STORY_CTX = `Video 3 (locked story and voice): ${ROOT}/docs/v3/script/script_g1.md; word timings ${ROOT}/public/v3/voice_words.json (voice lead 0.12 s; total 41.15 s). Current animatic (structure, shot timings, the banger opening O1, the S9 rise-over reveal, the LOOP tail): ${ROOT}/public/v3/animatic.json and ${ROOT}/docs/v3/storyboard_g3.md. Owner rules to keep: the opening rule (${ROOT}/docs/look/CINEMATIC_GUIDE.md "The opening": frame 0 is the scene being drawn, the hook made physical, expected world then reality overtaking it on "pricier", never still, one continuous opening shot, loop back to the bare-line frame 0; in board mode "colour floods" becomes the grey tones flooding in); every shot reads instantly with the sound off, literal beats clever; the owner could not read: the dark block growing in the window (make it an unmistakable datacenter icon with a big sign), a price line on window fog (use a plain chart), a chip held to the glass (show a laptop's ram stick vs ram sticks pouring into a datacenter). A sound-off cold read of the current animatic flagged ALL 18 frames; the flags are in ${CR}/flags_v3.json (frame numbers map to shots via ${CR}/index.json).`

phase('Re-board')
const board = await agent(`You are a story artist at an animation studio. Re-board video 3's whole animatic in our storyboard house style: read ${STYLE} fully and follow it exactly (one idea per panel, 12-25 elements, the subject as the only darkest shape, line weight by role, icons for objects, gesture figures, at most one label, notes in the strip, held drawings cut on the voice, real camera moves only where the move is the meaning).\n\n${STORY_CTX}\n\nThe tool's board API (from the implementer):\n${impl}\nRead ${ROOT}/src/v3/SketchReel.tsx and ${ROOT}/src/v3/SketchIcons.tsx for exact props.\n\nWork like a story artist: for each beat, thumbnail 2-3 options mentally, pick the clearest, then write it. Rewrite ${ROOT}/public/v3/animatic.json with "style": "board" (keep words, audio, sfx, frame0, frame0Until, durationSec; panels tile 0 to 41.15, cuts on words). Run "python3 ${ROOT}/scripts/v3/board_lint.py ${ROOT}/public/v3/animatic.json" until clean. Check with stills (cd ${ROOT} && npx remotion still src/entry-v3.tsx Animatic ${SP}/bd_<f>.png --frame=<f> --scale=0.25; 30 fps; max 14 renders). Then make a cold-read sheet: one frame per panel (at each panel's middle; for the opening panel also at 0.3, 2.0, 3.0, 4.9 s), rendered as stills at --scale=0.25, each labelled with its number (ImageMagick: convert in.png -gravity northwest -fill white -undercolor '#000a' -pointsize 18 -annotate +6+6 '<n>' out.png), tiled with montage into ${CR}/sheet_board.jpg, plus ${CR}/index_board.json mapping numbers to panel ids and times. Update ${ROOT}/docs/v3/storyboard_g3.md (panel table: id, time, the one idea, what we see, camera). Don't render a video, don't commit. Return max 12 lines: the panel list.`, { effort: 'max', label: 'story-artist', phase: 'Re-board' })

phase('Check')
const COLD = {
  type: 'object',
  properties: { frames: { type: 'array', items: { type: 'object', properties: {
    n: { type: 'number' }, see: { type: 'string' }, understood: { type: 'boolean' }, confusion: { type: 'string' },
  }, required: ['n', 'see', 'understood', 'confusion'] } } },
  required: ['frames'],
}
const PERSONAS = [
  `Maria, 41, needs to replace the family laptop, doesn't follow tech news`,
  `Jayden, 17, scrolls TikTok for hours`,
  `Dev, 29, office worker, impatient and sceptical`,
]
const cold = await parallel(PERSONAS.map((p, i) => () => agent(`You are ${p}. You are watching a short vertical video with the SOUND OFF; you only see these frames (numbered, with the on-screen caption words). Look at ${CR}/sheet_board.jpg. For each numbered frame: what you see and what you think it means, whether you understood it, what is confusing. Be honest and specific; don't be generous. Don't research anything.`, { effort: 'max', label: `cold-read:${i + 1}`, phase: 'Check', schema: COLD })))
const flags = {}
cold.filter(Boolean).forEach(c => c.frames.forEach(f => { if (!f.understood) { (flags[f.n] = flags[f.n] || []).push(f.confusion || f.see) } }))
log(`not understood: ${Object.keys(flags).length} frames: ${Object.keys(flags).join(', ')}`)

phase('Fix')
let fix = 'no fixes needed'
if (Object.keys(flags).length) {
  fix = await agent(`You are the story artist from before. ${STORY_CTX}\n\nA sound-off cold read of your board flagged these frames as NOT understood (numbers -> panels via ${CR}/index_board.json; the sheet is ${CR}/sheet_board.jpg):\n${JSON.stringify(flags)}\n\nAll viewer notes:\n${JSON.stringify(cold.filter(Boolean))}\n\nRe-board ONLY the flagged panels in ${ROOT}/public/v3/animatic.json, following ${STYLE}: simpler, more literal, one idea. Re-run the lint until clean, check the changed panels with stills (max 8), and regenerate ${CR}/sheet_board.jpg the same way. Update ${ROOT}/docs/v3/storyboard_g3.md. Don't commit. Return max 8 lines: what changed.`, { effort: 'max', label: 'story-artist-fix', phase: 'Fix' })
}
return { impl, board, flags, fix }
