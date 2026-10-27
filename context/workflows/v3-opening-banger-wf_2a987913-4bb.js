export const meta = {
  name: 'v3-opening-banger',
  description: 'v3: the first 3 s banger. 3 concepts for one continuous opening shot (drawn live, expectation then reality overtaking it, never still), judge, storyboard artist builds it into animatic.json + the loop back to bare lines',
  phases: [
    { title: 'Concepts', detail: '3 opening concepts' },
    { title: 'Judge', detail: 'pick against the opening rule' },
    { title: 'Build', detail: 'replace S1-S3 with one opening shot; loop end' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V3 = ROOT + '/docs/v3'
const SP = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'
const RULE = `THE OPENING RULE (owner, from a reference reel in our style; read ${ROOT}/docs/look/CINEMATIC_GUIDE.md, section "The opening"): the first 3 s, the whole first scene, must be a banger: the viewer feels "something is about to happen". (1) Frame 0 is the scene being MADE: bare ink lines draw on, flat colour floods in shape by shape within ~0.3 s. (2) The voice starts at once (it starts at 0.12 s; our cart-pop sound plays at 0.0 as a thumb taps "Add to cart"). (3) The hook's claim is made physical and escalates: show the EXPECTED thing first, then reality overtakes it and overflows, landing on the payoff word (reference: neat empty markers for "France expected 200,000", then a crowd pours in past them on "half a million came" at ~2.2 s). (4) Something new appears every 3-6 frames; never a still frame in the first 3 s. (5) One continuous shot through the opening, no cut; a slow ~5 % pull-out that gathers speed (ease-in) over the shot. (6) The film's last frames return to the bare-line frame 0 so it loops.`
const CTX = `Context: video 3 of "What's All the Fuss About?" (vertical 1080x1920, hand-drawn ink, flat colour). Locked story and voice: ${V3}/script/script_g1.md. Frame-0 claim text: "AI IS MAKING YOUR NEXT LAPTOP PRICIER" (stays on screen at the top until ~3.4 s). The opening lines and timings (owner's take 4, voice lead 0.12 s): "Buying a laptop soon?" 0.12-1.6; "AI's making it pricier." 1.64-3.4 ("pricier" at ~2.6); "Well, AI DATA CENTERS are." 3.64-5.7 ("data" ~4.44, "centers" ~4.76); the next line "Which is backwards..." starts at 5.8. Word timings: ${ROOT}/public/v3/voice_words.json. The current animatic ${ROOT}/public/v3/animatic.json opens with shots S1-S3 (0-5.8 s): S1 the cozy desk nook at night from the viewer's POV (bookshelf, frosty window with the AI data center outside, the old taped laptop in a lamp pool, the phone in the foreground with a new laptop, a price tag and "Add to cart"), S2 a price-tag close-up, S3 over the shoulder with the data center's LEDs lighting up. The G4 style frame of that nook is ${ROOT}/review/look/v3_g4/nook_B.png (look at it). ${RULE}`

const C = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    expectation: { type: 'string', description: 'what we show as the EXPECTED thing, and when' },
    reality: { type: 'string', description: 'how reality overtakes it and overflows, landing on which word' },
    beats: { type: 'array', items: { type: 'object', properties: { t: { type: 'string' }, what: { type: 'string' } }, required: ['t', 'what'] }, description: 'a new event every 0.1-0.3 s for 0-3 s, then the build to 5.8 s' },
    camera: { type: 'string' },
    why_banger: { type: 'string' },
  },
  required: ['title', 'expectation', 'reality', 'beats', 'camera', 'why_banger'],
}
const LENSES = [
  { key: 'tag', lens: `the price tag is the hero: the expected price (the old deal: tech gets cheaper) is shown, then the tag keeps ticking up and up, outgrowing the phone` },
  { key: 'window', lens: `the window is the hero: a small, quiet data center far away is the expected scene, then it grows, lights up floor by floor and overflows the window as the voice says AI DATA CENTERS` },
  { key: 'free', lens: `your own best idea for the strongest truthful escalation in this nook, inside one continuous shot` },
]

phase('Concepts')
const cs = await parallel(LENSES.map(l => () => agent(`${CTX}\n\nYou are an opening-shot director. Angle: ${l.lens}. Design the ONE continuous opening shot from 0 to 5.8 s. Be concrete and drawable as a sketch animatic. Don't write files.`, { effort: 'max', label: `concept:${l.key}`, phase: 'Concepts', schema: C })))
const ok = LENSES.map((l, i) => cs[i] ? { key: l.key, ...cs[i] } : null).filter(Boolean)

phase('Judge')
const verdict = await agent(`${CTX}\n\nYou are a short-form editor judging which opening is the biggest banger while staying clear and true to the story (the cause is AI data centers buying memory chips; no villains). Score each 1-10 on stop-power in the first 1.5 s, escalation clarity, the payoff landing on the right word, never-still, and fit with the next shot ("Which is backwards. Laptops get better for the same money..."). Pick one and list grafts from the others. Concepts:\n${JSON.stringify(ok)}\n\nReturn: the winner key, scores, and the grafts in max 12 lines.`, { effort: 'max', label: 'judge', phase: 'Judge' })

phase('Build')
const build = await agent(`${CTX}\n\nYou are the storyboard artist. The opening concepts and the judge's verdict:\n${JSON.stringify(ok)}\n\nVerdict:\n${verdict}\n\nEdit ${ROOT}/public/v3/animatic.json:\n1. Replace shots S1-S3 (0 to 5.8 s) with ONE shot "O1" (s 0, e 5.8) implementing the winner with the grafts. Use SketchReel's opening tools (read ${ROOT}/src/v3/SketchReel.tsx): per-element "draw": [start, dur] (stroke draw-on; multi-stroke shapes build stroke by stroke) and "fillIn": seconds (the colour floods in), "in" (pop in), "moves" (in-shot motion), "f" (parallax), camera {from,to,ease:"in"} for the slow pull-out that gathers speed (z ~1.05 -> 1.0). Frame 0 must be bare lines only (fills come in by ~0.35 s); a new element every 3-6 frames through 3 s; the escalation lands on its word. Keep the caption band y 317-556 flat (the frame-0 title sits there until ~3.4 s) and key action in x 60-940, y 620-1560. The next shot (S4) must still follow naturally (change its transition if needed).\n2. The loop: make the last ~0.3 s of the film return to O1's frame-0 composition as bare lines (no fills), e.g. a final short shot "LOOP" with O1's elements without fills and no draw, so the rewatch starts seamlessly; shorten the previous shot accordingly; shots must tile 0 to 41.15 with no gaps.\n3. Update the shot table in ${V3}/storyboard_g3.md (replace S1-S3 with O1, add LOOP).\nCheck: render stills at frames 0, 3, 6, 10, 18, 30, 45, 70, 100, 140, 170 and the last frame: cd ${ROOT} && npx remotion still src/entry-v3.tsx Animatic ${SP}/op_<f>.png --frame=<f> --scale=0.25 (30 fps; max 14 renders). Look and fix. Don't render a video, don't commit. Return max 10 lines: the beat list with times.`, { effort: 'max', label: 'storyboard-artist', phase: 'Build' })

return { concepts: ok.map(c => ({ key: c.key, title: c.title })), verdict, build }
