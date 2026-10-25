const RULE1 = `
RULE #1 (the user's top rule; it outranks everything except accuracy): read the section "RULE #1 FOR EVERY LINE" at the end of ${ROOT}/docs/CREATIVE_BRIEF.md. Every sentence must sound like a real person casually telling a friend, NOT like AI writing. No "X. Not Y." / "Not X. Y." contrasts, no staccato dramatic fragments, no tidy aphorisms or zingers, no stock reveal phrases ("Problem is", "Here's the thing", "turns out", "the catch", "there's no X button", "quietly", "in secret"), no colon reveals, no self-answered rhetorical questions, no rule-of-three, no em-dashes. Use natural connective tissue (so, and, but, which means, basically, like, pretty much), relaxed full sentences that flow into each other, everyday words a person actually says out loud. The one deliberate crafted line the user approved is the bait "PHP, the language everyone loves" (make everything around it natural). Accuracy rules still apply: only the fact sheet's safe wording.
`

phase('Final')
const draft = await agent(`${COMMON}${RULE1}
Read everything in ${OUT}/ (fact sheet, audience/so-what, critiques, four rewrites, original_annotated.md for the cue format). The judges said:
${summary}
YOUR JOB: write a FIRST FINAL DRAFT that takes the strongest backbone (the judges picked the twist structure), grafts in the judges' best lines, fixes every must-fix, and obeys RULE #1 in every sentence (rewrite any judged "best line" that breaks it, keeping its meaning). 50–62 s at ~165 wpm. Write ${OUT}/final_draft.md with: the plain script, the cued script in the user's format, word count and estimated duration.
Final message: the plain script and the cued script.`, { label: 'final:draft', phase: 'Final' })

phase('Everyday speech')
const AI_SCHEMA = {
  type: 'object',
  properties: {
    human_score: { type: 'number', description: '1-10: how much the whole script sounds like a real person talking' },
    sentences: { type: 'array', items: { type: 'object', properties: {
      sentence: { type: 'string' },
      tells: { type: 'array', items: { type: 'string' }, description: 'each AI tell by name' },
      severity: { type: 'string', enum: ['none', 'minor', 'major'] },
      how_a_person_would_say_it: { type: 'string' },
    }, required: ['sentence', 'tells', 'severity', 'how_a_person_would_say_it'] } },
    flow_notes: { type: 'array', items: { type: 'string' } },
  },
  required: ['human_score', 'sentences', 'flow_notes'],
}
const panel = await parallel([
  () => agent(`${COMMON}${RULE1}
You are an expert at spotting AI-written text and a dialogue coach. Read ${OUT}/final_draft.md. For EVERY sentence of the plain script: name each AI tell (from the brief's list or any other pattern you know LLMs overuse), rate severity, and write how a real person would actually say it out loud. Then judge the FLOW: does it move like speech (one thought leading into the next with so/and/but) or like a stack of punchy lines? Score the whole thing 1–10 on "sounds like a human talking".`, { label: 'everyday:detector', phase: 'Everyday speech', schema: AI_SCHEMA }),
  () => agent(`${COMMON}${RULE1}
You are a 29-year-old non-technical American who just read about this story and is telling it to a friend over dinner. Read ${OUT}/final_draft.md and ${OUT}/fact_sheet.md (stick to its safe wording; you can't add facts). Retell the whole story OUT LOUD in your own words, the way you'd really say it (about 150–175 words; keep the "PHP, the language everyone loves" bait because your friend codes and you're teasing them). Write it to ${OUT}/dinner_retelling.md, then add a list of your phrasings that sound more natural than the draft's and why.
Final message: your retelling text.`, { label: 'everyday:dinner', phase: 'Everyday speech' }),
])
const detector = panel[0]
const dinner = panel[1]
log(`Detector human score for the first draft: ${detector ? detector.human_score : 'n/a'}`)

const VOICES = [
  { key: 'dinner', brief: 'a smart friend telling it over dinner: relaxed, flowing, a little amused, never performing' },
  { key: 'walk', brief: 'telling a friend on a walk: a touch quicker and more casual, the odd tiny aside, still clear' },
  { key: 'narrator', brief: 'the channel\'s warm short-form narrator: natural and quick, confident, but it must never sound scripted or "written"' },
]
const convo = await parallel(VOICES.map(vc => () => agent(`${COMMON}${RULE1}
Inputs: ${OUT}/final_draft.md (structure and facts), ${OUT}/fact_sheet.md (the only allowed facts, safe wording), ${OUT}/dinner_retelling.md (how a real person said it), and the AI-detector's sentence flags:
${JSON.stringify(detector, null, 1)}
YOUR JOB: write a full version in this voice: ${vc.brief}. 50–62 s at ~165 wpm (about 140–175 words). Keep the story order of the draft unless a more natural order is clearly better. Every sentence must pass RULE #1. Keep the approved bait line. Include the cued version in the user's format (docs/script/original_annotated.md) with concrete cues.
Write ${OUT}/everyday_${vc.key}.md with: the plain script, the cued script, word count and duration, and a short list of what you changed vs the draft and why.
Final message: the plain script.`, { label: `everyday:${vc.key}`, phase: 'Everyday speech' })))

const HJ_SCHEMA = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: {
      version: { type: 'string' }, human: { type: 'number' }, clarity: { type: 'number' }, engagement: { type: 'number' },
      ai_sounding_lines: { type: 'array', items: { type: 'string' } },
    }, required: ['version', 'human', 'clarity', 'engagement', 'ai_sounding_lines'] } },
    winner: { type: 'string' },
    best_lines: { type: 'array', items: { type: 'string' } },
    must_fix: { type: 'array', items: { type: 'string' } },
  },
  required: ['scores', 'winner', 'best_lines', 'must_fix'],
}
const HJUDGES = [
  { key: 'human', brief: 'a podcast producer and dialogue coach: which version sounds MOST like a real person talking? (primary criterion; score human 1–10, plus clarity and engagement)' },
  { key: 'detector', brief: 'an AI-text detector: for each version, list every line you\'d bet was written by an AI; fewer = better; score human 1–10' },
  { key: 'tiktok', brief: 'a TikTok/Reels retention strategist who also checks accuracy against the fact sheet: does the natural version still hook in 1–3 s, hold, and deliver the payoff? score human, clarity, engagement' },
]
const hverdicts = await parallel(HJUDGES.map(j => () => agent(`${COMMON}${RULE1}
Compare these versions: ${OUT}/final_draft.md ("draft"), ${OUT}/everyday_dinner.md, ${OUT}/everyday_walk.md, ${OUT}/everyday_narrator.md. Read them out loud in your head. You are ${j.brief}. Pick a winner, list the best lines from any version, and the must-fix problems.`, { label: `judge-human:${j.key}`, phase: 'Everyday speech', schema: HJ_SCHEMA })))
const hsum = hverdicts.filter(Boolean).map((x, i) => `## ${HJUDGES[i].key}\nwinner: ${x.winner}\n${x.scores.map(s => `${s.version}: human ${s.human}, clarity ${s.clarity}, engagement ${s.engagement}; AI-sounding: ${s.ai_sounding_lines.join(' | ')}`).join('\n')}\nbest lines:\n- ${x.best_lines.join('\n- ')}\nmust fix:\n- ${x.must_fix.join('\n- ')}`).join('\n\n')
log('Everyday-speech judging done')

phase('Final')
const final = await agent(`${COMMON}${RULE1}
Read ${OUT}/final_draft.md, ${OUT}/everyday_*.md, ${OUT}/dinner_retelling.md and ${OUT}/fact_sheet.md. The everyday-speech judges said:
${hsum}
YOUR JOB: write the FINAL script from the winner, grafting the best lines and fixing every must-fix. RULE #1 first, accuracy always. 50–62 s at ~165 wpm. Write ${OUT}/final_script.md with:
1. The final script (plain paragraphs, ready to read).
2. The CUED version in the user's format (docs/script/original_annotated.md): a bracketed, concrete delivery cue before each beat (pace, energy, intent, who we're talking to, emphasis, a "don't" where there's a trap), CAPS sparingly on stressed words, "…" for beats, numbers spelled as spoken. Also save it alone, exactly as the user would paste it into ElevenLabs, as ${OUT}/final_script_elevenlabs.txt.
3. The thesis, the understanding shift, word count and estimated duration.
4. A line-by-line table: line | job | engagement mechanism (if any) | source(s) | what changed vs the current script and why.
5. 2 alternative opening hooks (verified, natural-sounding) the user could A/B.
6. A "visual impact" note: which current storyboard scenes still fit and which need re-staging.
7. A plain-words changelog of the biggest improvements, for the user.
Final message: the final plain script, word count, duration estimate, and the 5 biggest improvements.`, { label: 'final:synthesize', phase: 'Final' })

const FC_SCHEMA = {
  type: 'object',
  properties: {
    issues: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      line: { type: 'string' }, problem: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' },
    }, required: ['severity', 'line', 'problem', 'fix'] } },
  },
  required: ['issues'],
}
const checks = await parallel([
  () => agent(`${COMMON}
ADVERSARIAL FACT-CHECK of ${OUT}/final_script.md. Assume every sentence is wrong until you verify it yourself against primary sources with WebSearch/WebFetch (don't rely only on the fact sheet). Flag anything unverified, overstated, misleading by compression, missing a denominator, or not neutral. Default to flagging when uncertain.`, { label: 'factcheck:adversarial', phase: 'Final', schema: FC_SCHEMA }),
  () => agent(`${COMMON}${RULE1}
ADVERSARIAL EVERYDAY-SPEECH & DELIVERY CHECK of ${OUT}/final_script.md and final_script_elevenlabs.txt: read it aloud in your head at 165 wpm as a warm American friend. Flag EVERY remaining AI tell by name, any line a real person wouldn't say, any TTS trap, any sentence that doesn't earn its place, any weak link between sentences, and anything a general viewer won't get on one listen. Check the cues are concrete and in the user's format.`, { label: 'check:everyday', phase: 'Final', schema: FC_SCHEMA }),
])
const issues = checks.filter(Boolean).flatMap(c => c.issues)
log(`Final checks: ${issues.filter(i => i.severity === 'blocker').length} blockers, ${issues.filter(i => i.severity === 'major').length} major, ${issues.filter(i => i.severity === 'minor').length} minor`)
let fixed = 'no issues'
if (issues.length) {
  fixed = await agent(`${COMMON}${RULE1}
Apply these findings to ${OUT}/final_script.md and ${OUT}/final_script_elevenlabs.txt (keep the wording identical between them), updating the tables, word count and duration. Accuracy findings win; RULE #1 comes next; then everything else. Don't let the script grow past ~175 words.
${JSON.stringify(issues, null, 1)}
Final message: the final plain script exactly as it now stands, the cued version, word count, duration estimate, and one line per finding saying what you did.`, { label: 'final:fix', phase: 'Final' })
}
return { draft, detector, final, issues, fixed }
