export const meta = {
  name: 'v2-g3-board',
  description: 'v2 G3 sketch animatic in the studio board style: 3 whole-film board concepts (clear + cinematic + banger opening), 3 judges, story artist builds the animatic JSON (lint, stills, cold-read sheet), sound-off viewers + cine + standards check, one fix round',
  phases: [
    { title: 'Concepts', detail: '3 board directors, whole film' },
    { title: 'Judge', detail: 'sound-off clarity, cinematic, story + standards' },
    { title: 'Build', detail: 'story artist writes public/v2/animatic.json' },
    { title: 'Check', detail: '2 sound-off viewers, cine reviewer, standards reviewer' },
    { title: 'Fix', detail: 'one round' },
  ],
}

const ROOT = '/home/user/Test-/video'
const SP = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad'
const CR = SP + '/v2coldread'
const LINES = `L1 0.12-6.12 s: She quit Google. And she says her CONTRACT bans her from criticizing it… for life.
L2 6.12-8.36 s: You'd think that's one odd contract.
L3 8.36-13.24 s: But Google staff told the BBC they're scared to speak out, because of their contracts.
L4 13.24-15.00 s: So why is SHE talking?
L5 15.00-20.52 s: She worked on Google's AI, and told the BBC she objected to where its military work was heading.
L6 20.52-25.96 s: In April, that meant a deal letting the Pentagon use its AI for any lawful government purpose.
L7 25.96-28.20 s: Google can't veto how it's used.
L8 28.20-33.08 s: But Google says it follows its AI principles, and bans retaliation of any kind.
L9 33.08-35.32 s: She says she can't criticize Google.
L10 35.32-39.08 s: But in her words, talking about FACTS is not criticizing.`
const DOCS = `${ROOT}/docs/look/STORYBOARD_STYLE.md (the board house style: read it all, especially section 0 "signal per drawing" and section 7 "Cinematography belongs in the board"), ${ROOT}/docs/look/CINEMATIC_GUIDE.md ("The opening" and the environment shot types S1-S4), ${ROOT}/docs/look/COZY_AND_SCALE.md (sections 1-3: enclosure framing, cozy rules, scale)`
const CTX = `Context: today is 2026-10-26. We make 30-45 s vertical explainers (1080x1920) for "What's All the Fuss About?". Video 2 is at G3, the sketch animatic: the FIRST video the owner watches for this film. The story, core line and voice are LOCKED.
- Core line: "She quit Google, and says her contract bans criticizing it, for life." Frame-0 text: "SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE."
- Script, with the G1 picture ideas per line (a starting point, not a spec): ${ROOT}/docs/v2/script/script_g1.md. Rules for what may be shown (fairness, sources, Google's side): ${ROOT}/docs/v2/CORE_LINE.md section 2. Facts: ${ROOT}/docs/v2/research/factlock.md ("Never say" list).
- The voice (owner's take, locked), with the line timings in seconds (cut on these words):
${LINES}
  Word timings: ${ROOT}/public/v2/voice_words.json (words with s/e times). Audio: public/v2/voice.wav (39.08 s).
- The owner's rules (playbook ${ROOT}/docs/OWNER_PLAYBOOK.md, sections "Hook and pacing" and "Storyboard (G3)"):
  - the board is a professional storyboard: simple, monochrome, clarity first, one idea per panel, icons not labelled boxes, notes off the picture;
  - every shot reads instantly with the sound off: literal beats clever, no metaphors that need explaining;
  - boards optimise for signal per drawing and review time, not polish;
  - the board ALSO carries the cinematography: framing, angle, scale, a cozy enclosure home base that returns, one big reveal, 1-2 scale cuts;
  - the opening (0 to ~6 s) is a banger: frame 0 is the scene being drawn (bare lines, then fills), the voice from the first frames, the hook made physical and escalating (the expected thing, then reality overtaking it), never still, one continuous opening shot;
  - the film loops back to the bare-line frame 0;
  - a positive phone-like sound in the first second (G1 idea: a cheerful two-note "signed!" chime as her signature lands on her job contract, then quiet for "for life");
  - captions pop (SketchReel does this from the word timings).
- Fairness on screen (CORE_LINE): her claim stays "she says"; "for life" is never in quote marks; the full oversight clause is shown whenever "any lawful government purpose" is; no war imagery, weapons or strikes; no "Google" lettering near anything military; Google's reply gets its own panel with equal visual weight; BBC quotes credited ("Source: BBC News, 21 Oct 2026"); she is a generic figure (never a likeness), with a name caption at most.
- Docs: ${DOCS}. The tool: SketchReel board mode (API and element types in ${ROOT}/src/v3/SketchReel.tsx, icons in ${ROOT}/src/v3/SketchIcons.tsx, roles/tones in ${ROOT}/src/v3/board.ts; v3's finished board for reference: ${ROOT}/public/v3/animatic.json and ${ROOT}/docs/v3/storyboard_g3.md).`

const CONCEPT = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    home_base: { type: 'string', description: 'the cozy enclosure home base and where it returns' },
    reveal: { type: 'string', description: 'the one big reveal (shot type, which line)' },
    opening: { type: 'array', items: { type: 'object', properties: { t: { type: 'string' }, what: { type: 'string' } }, required: ['t', 'what'] }, description: 'beats of the continuous opening shot, 0-6 s' },
    panels: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, s: { type: 'number' }, e: { type: 'number' }, idea: { type: 'string', description: 'the ONE idea a sound-off viewer must get' },
      drawing: { type: 'string', description: 'the fewest elements that say it (icons, figures, text), framing, angle' },
      shot: { type: 'string', description: 'shot type and COZY / SCALE / plain' }, move: { type: 'string' }, transition: { type: 'string' },
    }, required: ['id', 's', 'e', 'idea', 'drawing', 'shot', 'move', 'transition'] } },
    sfx: { type: 'array', items: { type: 'string' } },
    why: { type: 'string' },
  },
  required: ['title', 'home_base', 'reveal', 'opening', 'panels', 'sfx', 'why'],
}

phase('Concepts')
const LENSES = [
  { key: 'contract', lens: `THE CONTRACT as the throughline object: her job contract (the line that never ends) and the deal page (the Pentagon's "any lawful government purpose") are the two documents the whole film is built on; paper, stamps, signatures, highlighted lines` },
  { key: 'room', lens: `ONE ROOM as the home base: her small lamp-lit room at night (the cozy enclosure), the contract on the desk, a window to the outside; the film keeps returning to this room, and the big reveal leaves through the window into the vast, cold world of the deal` },
  { key: 'free', lens: `your own best concept: literal, instantly readable with the sound off, cinematic, true` },
]
const concepts = await parallel(LENSES.map(l => () => agent(
  `${CTX}\n\nYou are a storyboard director. Your concept lens: ${l.lens}.\n\nRead the script, CORE_LINE section 2, the playbook sections and the docs first. Design the WHOLE film as a board: the opening as one continuous shot (beats with times), then one panel per idea (cut on the line timings; 8-14 panels total incl. a LOOP back to frame 0), each with the one idea, the fewest elements that say it, the shot type (COZY home base / SCALE reveal or cut / plain), framing, any camera move, the transition, and the sound cues (the first-second phone sound first). Don't write files.`,
  { effort: 'max', label: `concept:${l.key}`, phase: 'Concepts', schema: CONCEPT })))
const cs = LENSES.map((l, i) => concepts[i] ? { key: l.key, ...concepts[i] } : null).filter(Boolean)

phase('Judge')
const SCORE = {
  type: 'object',
  properties: { scores: { type: 'array', items: { type: 'object', properties: {
    key: { type: 'string' }, clarity: { type: 'number' }, opening: { type: 'number' }, cinematic: { type: 'number' }, story: { type: 'number' }, fairness: { type: 'number' },
    keep: { type: 'string' }, problems: { type: 'string' },
  }, required: ['key', 'clarity', 'opening', 'cinematic', 'story', 'fairness', 'keep', 'problems'] } } },
  required: ['scores'],
}
const JUDGES = [
  { key: 'soundoff', lens: `a sound-off viewer advocate: would a scrolling viewer with the sound off understand every panel at a glance? (penalise anything abstract or needing explanation hard)` },
  { key: 'cine', lens: `a cinematographer for animated explainers (Arcane-informed, environment shots): home base, one big reveal, scale cuts, purposeful variety of size and angle, and the banger opening` },
  { key: 'story', lens: `a story editor and standards editor in one: does the board tell the story line by line, and does it follow every fairness rule in CORE_LINE section 2?` },
]
const js = await parallel(JUDGES.map(j => () => agent(
  `${CTX}\n\nYou are ${j.lens}. Score each concept 1-10 on clarity, opening, cinematic, story, fairness. Be harsh; use the full range. Say what to keep or graft and the problems.\n\nConcepts (JSON):\n${JSON.stringify(cs)}`,
  { effort: 'max', label: `judge:${j.key}`, phase: 'Judge', schema: SCORE })))
const tot = {}
cs.forEach(c => { tot[c.key] = 0 })
js.filter(Boolean).forEach(j => j.scores.forEach(s => { if (s.key in tot) tot[s.key] += 3 * s.clarity + 2 * s.opening + 2 * s.cinematic + 2 * s.story + 2 * s.fairness }))
const ranked = cs.slice().sort((a, b) => tot[b.key] - tot[a.key])
log(`concepts: ${ranked.map(c => `${c.key} ${tot[c.key]}`).join(', ')}`)
const notes = JSON.stringify(js.filter(Boolean).map((j, i) => ({ judge: JUDGES[i].key, scores: j.scores })))

phase('Build')
const build = await agent(
  `${CTX}\n\nYou are the story artist. Build the board animatic from the winning concept, grafting the judges' best ideas from the others and fixing their problems.\n\nWinner:\n${JSON.stringify(ranked[0])}\n\nOthers:\n${JSON.stringify(ranked.slice(1))}\n\nJudges:\n${notes}\n\nDo this:\n1. Write ${ROOT}/public/v2/animatic.json in SketchReel's board format (style "board"; label "v2 G3 board"; audio "v2/voice.wav"; durationSec = the voice length + ~0.5 s; frame0 = "SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE." with frame0Until where the voice reaches "for life"; words = the "words" array from ${ROOT}/public/v2/voice_words.json; sfx; shots cut on the line timings; LOOP last). Read the API in SketchReel.tsx, SketchIcons.tsx and board.ts first. A builder script is fine (e.g. ${ROOT}/scripts/v2/build_board.py, modelled on ${ROOT}/scripts/v3/build_board.py).\n2. Icons: if a needed object has no icon (e.g. a contract page, a pen, a stamp, an office building, a lamp, an envelope), ADD new icons to SketchIcons.tsx additively: new names only, appended, never changing existing ones (the video 3 session uses the file too). List any added icons in your return.\n3. Sounds: make our own first-second "signed!" chime (cheerful, two notes, ~0.3 s) and any other cues with ${ROOT}/scripts/v3/make_phone_sfx.py (extend it or write a small ${ROOT}/scripts/v2/make_sfx.py); save the wav files to ${ROOT}/public/v2/. Never use real system sounds.\n4. Run python3 ${ROOT}/scripts/v3/board_lint.py ${ROOT}/public/v2/animatic.json until it is clean.\n5. Check with stills: cd ${ROOT} && npx remotion still src/entry-v2.tsx Animatic ${SP}/v2s_<frame>.png --frame=<frame> --scale=0.25 (30 fps; at most 16 stills; look at them and fix what reads wrong).\n6. Make the cold-read sheet ${CR}/sheet.jpg: one frame per panel at its middle, plus the opening at 0.3, 1.2, 2.0, 3.0 and 5.0 s, each labelled with a number, in a montage; and ${CR}/index.json mapping numbers to panel ids and times.\n7. Write ${ROOT}/docs/v2/storyboard_g3.md: a panel table (id, time, line, the one idea, drawing, shot type COZY/SCALE/plain, move, transition, sound).\nDon't render a video and don't commit. Return at most 12 lines: the panels, icons added, sounds made, lint status.`,
  { effort: 'max', label: 'story-artist', phase: 'Build' })

phase('Check')
const COLD = {
  type: 'object',
  properties: { frames: { type: 'array', items: { type: 'object', properties: {
    n: { type: 'number' }, see: { type: 'string' }, understood: { type: 'boolean' }, confusion: { type: 'string' },
  }, required: ['n', 'see', 'understood', 'confusion'] } } },
  required: ['frames'],
}
const PERSONAS = [
  `Maria, 41, two kids, watches Reels in the evening, doesn't follow tech news`,
  `Jayden, 17, scrolls TikTok for hours, wants to study computer science`,
]
const [cold, cine, std] = await Promise.all([
  parallel(PERSONAS.map((p, i) => () => agent(
    `You are ${p}. You are watching a short vertical video with the SOUND OFF; you only see these frames (numbered, with caption words). Look at ${CR}/sheet.jpg. For each numbered frame: what you see and what it means, whether you understood it, what is confusing. Be honest; judge the PICTURE (caption fragments are expected with sound off). Don't research.`,
    { effort: 'max', label: `cold-read:${i + 1}`, phase: 'Check', schema: COLD }))),
  agent(`${CTX}\n\nYou are a cinematic reviewer. Look at ${CR}/sheet.jpg (index ${CR}/index.json) and the panel table ${ROOT}/docs/v2/storyboard_g3.md, against the docs (${DOCS}). Is there a cozy home base that returns, one big reveal, 1-2 scale cuts, purposeful variety of size and angle, and a banger opening (drawn live, escalating, never still)? Return at most 10 lines: what is missing, per panel.`, { effort: 'max', label: 'cine-reviewer', phase: 'Check' }),
  agent(`${CTX}\n\nYou are a standards editor and media lawyer. Look at ${CR}/sheet.jpg (index ${CR}/index.json), ${ROOT}/public/v2/animatic.json (all text elements) and ${ROOT}/docs/v2/storyboard_g3.md, against CORE_LINE section 2 and the factlock "Never say" list. Check every on-screen word and image: attribution, quotes, the oversight clause, no military imagery near "Google", Google's reply panel weight, source tags. Return at most 10 lines: each problem with the panel and the fix.`, { effort: 'max', label: 'standards', phase: 'Check' }),
])
const flags = {}
cold.filter(Boolean).forEach(c => c.frames.forEach(f => { if (!f.understood) { (flags[f.n] = flags[f.n] || []).push(f.confusion || f.see) } }))
log(`not understood with sound off: ${Object.keys(flags).join(', ') || 'none'}`)

phase('Fix')
const fix = await agent(
  `${CTX}\n\nYou are the story artist. One fix round on ${ROOT}/public/v2/animatic.json.\nSound-off frames NOT understood (numbers -> panels via ${CR}/index.json):\n${JSON.stringify(flags)}\nCinematic reviewer:\n${cine}\nStandards:\n${std}\nFix what these flag: clearer, more literal drawings where a viewer was lost; the cinematography where it is missing; every standards problem. Lint clean, check changed panels with stills (at most 10), regenerate ${CR}/sheet.jpg and ${CR}/index.json the same way, update ${ROOT}/docs/v2/storyboard_g3.md. Don't render a video and don't commit. Return at most 8 lines.`,
  { effort: 'max', label: 'story-artist-fix', phase: 'Fix' })

return { ranking: ranked.map(c => ({ key: c.key, title: c.title, score: tot[c.key] })), build, flags, cine, std, fix }
