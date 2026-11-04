export const meta = {
  name: 'v4-visual-script',
  description: 'Video 4: research how studios write a visual script, our method, three visual concepts, two judges, one shot-by-shot visual script timed to the locked voice, a cold read + critic, a fix pass',
  phases: [
    { title: 'Research', detail: 'pro pre-production formats; visual storytelling craft for a 40 s vertical explainer' },
    { title: 'Method and concepts', detail: 'METHOD.md from the research; three visual concepts' },
    { title: 'Judge', detail: 'a story/attention judge and a craft/feasibility judge' },
    { title: 'Write', detail: 'the one visual script, timed to the voice' },
    { title: 'Review', detail: 'a cold read (can you see the film?) and a critic' },
    { title: 'Fix', detail: 'one fix pass' },
  ],
}
const R = '/home/user/Test-'
const D = `${R}/video/docs/v4/visual`
const COMMON = `Work in ${R}. First read ${D}/BRIEF.md (the shared brief: the owner's words, what is locked, the rules, the files) and follow its "Every agent" rules. Your final reply is the structured output only, its summary at most 3 short lines.`
const OUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['status', 'summary', 'files'] }
const JUDGE = { type: 'object', properties: { ranking: { type: 'array', items: { type: 'string' }, description: 'concept letters, best first' }, scores: { type: 'string' }, winner_why: { type: 'string' }, grafts: { type: 'string', description: 'the best ideas from the other concepts worth grafting onto the winner' }, summary: { type: 'string' } }, required: ['ranking', 'scores', 'winner_why', 'grafts', 'summary'] }
const CRIT = { type: 'object', properties: { verdict: { type: 'string', enum: ['FIX AND SEND', 'REWRITE'] }, blockers: { type: 'integer' }, majors: { type: 'integer' }, minors: { type: 'integer' }, summary: { type: 'string' } }, required: ['verdict', 'blockers', 'majors', 'minors', 'summary'] }

// ---------- Research ----------
phase('Research')
const research = await parallel([
  () => agent(`Research lane FORMATS: how professional studios write the visual plan of a narrated film between the locked script/voice and the storyboard/animatic. ${COMMON}
Cover, with sources: the two-column A/V (audio/video) script of documentary, TV and corporate video; the shooting script and shot list (scene and shot numbering, shot sizes, angles, camera moves, transitions); the animation pre-production chain (script, beat board, thumbnails, storyboard, animatic or leica reel) at Pixar, DreamWorks, Laika and TV animation; how motion-design and explainer studios (Buck, Giant Ant, Oddfellows, Kurzgesagt, TED-Ed, Vox, explainer agencies) write a "visual script" or "storyboard script" and what columns it carries (time, VO, visual, camera, transition, on-screen text, SFX/music, notes); how timing is attached to a locked VO (word timings, a timing sheet, the x-sheet / dope sheet); how a visual script is reviewed (a read-through, notes, sign-off) before boards; what makes one easy for a director or client to picture on one read. Write ${D}/research_formats.md: "Findings" (at most 12, each: the practice in one line; who does it and why, with a source URL and its strength; what it means for our 40-second vertical films; how we'd check it), then "The format we should use" (the columns and the conventions, concretely), then "The steps, in order".`,
    { label: 'research: formats', phase: 'Research', schema: OUT, effort: 'max' }),
  () => agent(`Research lane CRAFT: how professionals design the shots and camera of a short narrated explainer so a broad audience follows it, for a 30-45 s vertical (9:16) film. ${COMMON}
Cover, with sources: motivated camera movement (why a camera moves; push-in for importance, pull-back for reveal and scale, tracking a moving subject, the "one move per shot" rule); joins that carry the eye (match cuts on shape or action, a continuous camera through a cross-section or a zoom into a detail, the subject leading out and in, sound bridges); literal pictures versus visual metaphors (when each helps a lay viewer); one idea per shot and the shot length that fits the voice's pace in short-form; the first 3 seconds of a reel; framing and composition in 9:16 (headroom, the caption band, a single subject, vertical moves); establishing, detail and scale rhythm; how on-screen words and numbers are used sparingly; sound cues written into the visual plan. Study examples: Kurzgesagt, Vox, Johnny Harris, Wendover, and the owner's model reel (${R}/video/docs/studies/2026-10-28_city_posters/refs/bigbend_reel/README.md). Then read our own rules and map the research onto them: ${R}/video/docs/look/DIRECTION.md, CRAFT.md §a (carriers A-F), LAYOUT.md, CINEMATIC_GUIDE.md. Write ${D}/research_craft.md: "Findings" (at most 12, each: the practice; why, with a source and its strength; what it means for video 4's locked narration, with an example beat; how to check it), then "The 8 that matter most for video 4".`,
    { label: 'research: craft', phase: 'Research', schema: OUT, effort: 'max' }),
])
log(`research: ${research.filter(Boolean).map(r => r.status).join(', ')}`)

// ---------- Method and three concepts (the concepts need the craft research; the method needs both) ----------
phase('Method and concepts')
const LENSES = [
  { key: 'A', lens: 'THE HEAT\'S JOURNEY: the camera follows the heat itself (the thread: warm water, a drawn thing) from one giant computer to one home, one continuous path where each line of the voice moves the heat one step further; the big scale beat (the Earth\'s curve) is where the heat is wasted elsewhere' },
  { key: 'B', lens: 'THE DESIGNED VIEW: one poster-like designed view of Helsinki (a snowy street cut open like a cross-section, the harbour, the far city, the plan at its edge) that the camera explores with push-ins, cutaways and one big pull-back, returning to the same view at the end (the loop)' },
  { key: 'C', lens: 'FROM YOUR CHAT TO A HOME: the film is built around the one "you": frame 0 still shows the hook (Helsinki, AI, homes) being drawn, but the camera keeps finding the viewer\'s own chatbot question as the link, until the payoff lands on your phone under a warm window (the loop back to frame 0)' },
]
const [method, ...concepts] = await parallel([
  () => agent(`Write our METHOD for a visual script, from the research. ${COMMON}
Read ${D}/research_formats.md and ${D}/research_craft.md, then ${R}/video/docs/PIPELINE_V2.md (G3 and its spec ${R}/video/docs/G3_ANIMATIC.md: what the animatic will play from the visual script) and the playbook rule "The film's visual story is written first, as a VISUAL SCRIPT" (${R}/video/docs/OWNER_PLAYBOOK.md, Storyboard (G3) and flow). Write ${D}/METHOD.md: why the step exists (the owner's words); the format (a shot table: shot number, time in and out from the locked voice's word times, the words spoken, what is on screen, the camera (shot size, angle, move with its start and end), the join into the next shot (its carrier, CRAFT §a), words in the picture, sound, the thread, notes), how it reads on a phone (one block per shot, not a wide table); the steps (concepts, judge, write, cold read, critic, fix, the owner); the checks (every spoken line has a picture that shows it literally with the sound off; one subject at a time; a carrier at every join, at most 2 plain cuts; the first 3 s per the playbook; shot lengths that fit the voice; nothing outside the fact file; style-neutral); and what the G3 animatic takes from it. One page, plain words. Also list "Doc changes needed" (the exact PIPELINE_V2 text for the new step between G2 and G3) at the end.`,
    { label: 'method', phase: 'Method and concepts', schema: OUT, effort: 'max' }),
  ...LENSES.map(L => () => agent(`Visual concept ${L.key} for video 4. Your lens: ${L.lens}. ${COMMON}
Read: ${D}/research_craft.md; the locked words and times (${R}/video/public/v4/voice_words.json); the script doc ${R}/video/docs/v4/script/script_g1.md (each line's job; its picture ideas are a starting point, not a rule); the card ${R}/video/docs/v4/THROUGHLINE.md; the rules named in the brief (the playbook's Hook and pacing and Storyboard sections, DIRECTION, CRAFT §a, LAYOUT, CINEMATIC_GUIDE).
Write ${D}/concepts/${L.key}.md: (1) the concept in 3 sentences and why it fits this story and its viewers; (2) a beat-by-beat outline timed to the voice (for each line of the voice: time in and out, what we see, the camera, the join into the next beat), from frame 0 to the end and the loop; (3) the three moments a viewer would remember; (4) the risks (clarity, pace, what is hard to build in a 2D layered engine, any fact risk) and how the concept handles them. Keep it style-neutral, true to the fact file (the plant is a plan), one subject at a time, a carrier at every join.`,
    { label: `concept ${L.key}`, phase: 'Method and concepts', schema: OUT, effort: 'max' })),
])
log(`method ${method ? method.status : 'missing'}; concepts ${concepts.filter(Boolean).length}/3`)

// ---------- Judge ----------
phase('Judge')
const judges = await parallel([
  () => agent(`You judge the three visual concepts for video 4 on STORY AND ATTENTION, as the viewer: a regular person scrolling on a phone, sound on or off. ${COMMON}
Read ${D}/concepts/A.md, B.md and C.md, the locked words (${R}/video/public/v4/voice_words.json), the playbook's "Hook and pacing" and "Storyboard (G3) and flow" sections (${R}/video/docs/OWNER_PLAYBOOK.md) and ${D}/research_craft.md. Score each concept 1-10 on: the first 3 seconds (stops a thumb, the hook made physical, payoff in words by ~2 s); every line shown literally with the sound off; one subject at a time; a flowing story (every join carries the eye); a memorable picture (what people would send); the ending and the loop. Write ${D}/judge_story.md: the scores in a table, the ranking, why the winner wins, and the best ideas from the others worth grafting onto it.`,
    { label: 'judge: story', phase: 'Judge', schema: JUDGE, effort: 'max' }),
  () => agent(`You judge the three visual concepts for video 4 on CRAFT AND FEASIBILITY. ${COMMON}
Read ${D}/concepts/A.md, B.md and C.md, the locked words and times (${R}/video/public/v4/voice_words.json), ${R}/video/docs/look/DIRECTION.md, CRAFT.md §a, LAYOUT.md, CINEMATIC_GUIDE.md, ${R}/video/docs/G3_ANIMATIC.md and ${D}/research_craft.md; glance at how our films are built (${R}/video/docs/G5_BLOCKING.md §1-2: a 2D layered Remotion engine with camera moves, parallax planes and drawn sets; no 3D). Score each 1-10 on: camera grammar (motivated moves, one move per shot, readable speeds at 60 fps); carriers at every join (at most 2 plain cuts) and the thread on screen; timing against the voice (no beat too short to read, none idle); fit with our rules (one home place, at most one comparison or scale shot, people small, Pip hidden, words few and big, the caption band); buildability in our engine within one film's budget; truth to the fact file (the plant drawn as a plan). Write ${D}/judge_craft.md: the scores in a table, the ranking, why the winner wins, and the grafts.`,
    { label: 'judge: craft', phase: 'Judge', schema: JUDGE, effort: 'max' }),
])
const js = judges.filter(Boolean)
log(`judges: ${js.map(j => j.ranking.join('>')).join(' | ')}`)

// ---------- Write ----------
phase('Write')
const w = await agent(`Write video 4's VISUAL SCRIPT, the one the owner will read. ${COMMON}
Read ${D}/METHOD.md (the format and the checks), the judges (${D}/judge_story.md, ${D}/judge_craft.md: rankings ${JSON.stringify(js.map(j => j.ranking))}), the concepts they discuss (${D}/concepts/), the locked words and times (${R}/video/public/v4/voice_words.json), the script doc ${R}/video/docs/v4/script/script_g1.md, the card ${R}/video/docs/v4/THROUGHLINE.md and the rules named in the brief. Build on the judges' winner (if they disagree, take the concept with the better total and say why), graft the best ideas they name, and keep it one concept, not a blend of three.
Write ${D}/VISUAL_SCRIPT.md in METHOD's format: a short top (the concept in 3 sentences; the home place; the thread; the one "you"; the one scale shot; where Pip hides), then one block per shot, numbered, with time in and out taken from the voice's word times (seconds, 2 decimals), the words spoken, what is on screen, the camera (shot size, angle, the move from where to where, its easing feel), the join into the next shot (carrier letter and what it is), words in the picture (few, big), sound cues, the thread's state, and a one-line note where needed; then the loop back to frame 0; then a check list against METHOD's checks with the answer for each. Plain words a director could picture on one read. Style-neutral.`,
  { label: 'visual script writer', phase: 'Write', schema: OUT, effort: 'max' })
if (!w) return { research, method, concepts, judges, note: 'the writer did not finish' }

// ---------- Review ----------
phase('Review')
const [cold, crit] = await parallel([
  () => agent(`You are a cold reader: a film director who has never seen this project. ${COMMON} (For you, the brief's first paragraph is enough context: skip the rest of it and every other file.)
Read only ${D}/VISUAL_SCRIPT.md, once, top to bottom. Then, without looking back, write in ${D}/review_cold.md: the film as you picture it, shot by shot, in your own words (what you see and hear); where you could not picture what was meant, or pictured two things; where a camera move or a join was unclear; which moment you'd remember; and whether you could storyboard it from this alone (yes / mostly / no, and what is missing).`,
    { label: 'cold read', phase: 'Review', schema: OUT, effort: 'max' }),
  () => agent(`You are the critic of video 4's visual script. Your file: ${D}/review_critic.md. ${COMMON}
Read ${D}/VISUAL_SCRIPT.md, ${D}/METHOD.md (the checks), the locked words and times (${R}/video/public/v4/voice_words.json), the card ${R}/video/docs/v4/THROUGHLINE.md, the fact file ${R}/video/docs/v5/research/factlock.md (sections 2, 6, 8) and the rules named in the brief. Check: every spoken line has a picture that shows it literally with the sound off; the first 3 s per the playbook (frame 0 drawn on, the hook made physical, the payoff in words by ~2 s, never still); one subject at a time; a carrier at every join, at most 2 plain cuts, the thread on screen; the times match the voice and no shot is too short to read or idle; camera moves are motivated and readable; words in the picture few, big and in the caption band's rules; no side quest; nothing against the fact file (the plant is a plan; no logos or company names); style-neutral. At most 6 findings ranked blocker > major > minor, each with the shot, the problem and a concrete fix. Verdict: FIX AND SEND or REWRITE.`,
    { label: 'critic', phase: 'Review', schema: CRIT, effort: 'max' }),
])
log(`critic: ${crit ? crit.verdict + ' ' + crit.blockers + '/' + crit.majors + '/' + crit.minors : 'missing'}; cold read ${cold ? cold.status : 'missing'}`)

// ---------- Fix ----------
phase('Fix')
const f = await agent(`Fix pass on video 4's visual script. ${COMMON}
Read ${D}/VISUAL_SCRIPT.md, the critic (${D}/review_critic.md: ${crit ? crit.verdict + ', ' + crit.blockers + ' blockers, ' + crit.majors + ' majors, ' + crit.minors + ' minors' : 'missing'}) and the cold read (${D}/review_cold.md: every place the director could not picture what was meant, or pictured two things, is a finding), then ${D}/METHOD.md and the locked words and times (${R}/video/public/v4/voice_words.json). Apply every blocker and major, every place the cold reader could not picture, and the plainly right minors, keeping the concept and the style-neutral stance; keep the times on the voice's word times. Add a short "Fix pass" section at the end (each finding: done, what changed / not done, why). Also make sure the top of the file has a 5-line summary a phone reader sees first.`,
  { label: 'fix pass', phase: 'Fix', schema: OUT, effort: 'max' })

return { research, method, concepts, judges, writer: w, cold, critic: crit, fix: f }
