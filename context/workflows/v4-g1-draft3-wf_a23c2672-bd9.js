export const meta = {
  name: 'v4-g1-draft3',
  description: 'Video 4 G1 draft 3: cut the side quest, add human connectors tactically, generalize the rules into the docs; cold panel + critic, fix, re-hear',
  phases: [
    { title: 'Write', detail: 'draft 3 by one writer; the new rules integrated into the docs alongside' },
    { title: 'Evaluate', detail: 'three cold viewers (incl. which line could go, where it sounds human) and one critic' },
    { title: 'Fix', detail: 'one fix pass, then fresh viewers re-hear; at most 2 rounds' },
  ],
}
const R = '/home/user/Test-'
const D = `${R}/video/docs/retro/2026-10-29_script_clarity`
const COMMON = `Work in ${R}. Read ${D}/BRIEF.md and follow its "Every agent" rules. Your final reply is the structured output only, its summary at most 3 short lines.`
const OUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['status', 'summary', 'files'] }
const WOUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, spoken_text: { type: 'string', description: 'exactly what the voice says, no tags, one sentence per line' }, changed_lines: { type: 'array', items: { type: 'integer' } }, words: { type: 'integer' }, checks: { type: 'string' } }, required: ['status', 'summary', 'spoken_text', 'changed_lines', 'words', 'checks'] }
const CRIT = { type: 'object', properties: { verdict: { type: 'string', enum: ['FIX AND SEND', 'REWRITE'] }, blockers: { type: 'integer' }, majors: { type: 'integer' }, minors: { type: 'integer' }, summary: { type: 'string' } }, required: ['verdict', 'blockers', 'majors', 'minors', 'summary'] }
const PANEL = { type: 'object', properties: {
  persona: { type: 'string' },
  sentences: { type: 'array', items: { type: 'object', properties: { sentence: { type: 'string' }, understood: { type: 'string' }, missed_words: { type: 'string' }, pointers: { type: 'string' }, thumb: { type: 'string', enum: ['keep watching', 'unsure', 'swipe'] }, why: { type: 'string' } }, required: ['sentence', 'understood', 'missed_words', 'pointers', 'thumb', 'why'] } },
  retell: { type: 'string' }, most_confusing: { type: 'string' },
  could_go: { type: 'string', description: 'the sentence you could lose without missing anything you need for the story, or "none"' },
  most_human: { type: 'string', description: 'where it sounded most like a real person talking to you' },
  most_scripted: { type: 'string', description: 'where it sounded most like a script or an ad, or "none"' },
  would_send: { type: 'boolean' }, why_send: { type: 'string' } },
  required: ['persona', 'sentences', 'retell', 'most_confusing', 'could_go', 'most_human', 'most_scripted', 'would_send', 'why_send'] }
const PERSONAS = [
  { key: 'maya', who: 'Maya, 16, from Manchester: scrolls TikTok for an hour after school, not into tech, knows ChatGPT, swipes the second something is boring or confusing' },
  { key: 'daniel', who: 'Daniel, 52, a nurse and a dad from Ohio: smart, no tech background, watches Reels in the evening, doesn\'t know tech terms' },
  { key: 'lucia', who: 'Lucía, 31, a dentist in Madrid: good but not native English, watches with captions on; idioms, wordplay and fast slang lose her' },
]
const panelOf = (text, folder) => parallel(PERSONAS.map(p => () => agent(`You are ${p.who}. You are scrolling and this short video starts. This is exactly what the narrator says, while captions read along (numbers appear as digits in the captions, e.g. 2027, 70,000):

${text}

Hear it ONCE, sentence by sentence, as this viewer, not as a writer or a producer: read no file and ignore any production rules or project instructions you were given; only this viewer's honest reaction counts. For each sentence, in order: what you understood, in your own plain words; any word you didn't get or got wrong; for every "it", "that", "this", "they", "them" or "those", what you think it points to; your thumb (keep watching / unsure / swipe) and why, in a few words. Then: retell the whole video to a friend in 2 sentences; the one sentence that confused you most (or "none"); the sentence you could lose without missing anything you need for the story (or "none"); where it sounded most like a real person talking to you, and where most like a script or an ad (or "none"); whether you'd send it to someone and why.
Also write your answer as plain text into ${R}/video/docs/v4/script/${folder}/${p.key}.md (create the folder if needed); that is the only file you touch. Your final reply is the structured output.`,
  { label: `${folder}: ${p.key}`, phase: 'Evaluate', schema: PANEL, effort: 'max' })))

// ---------- Write, with the rules integrated alongside ----------
phase('Write')
const [w, integ] = await parallel([
  () => agent(`You write draft 3 of video 4's G1 script. ${COMMON}
Read FIRST the owner's words in ${R}/video/docs/v4/OWNER_NOTES.md: the last two entries (the line-by-line clarity notes on draft 1, and the newest: "too much of a sidequest", "to put it into perspective" / "Actually" / "so", "its actually okay to keep the text longer if needed"). Then the playbook's Script and voice and Hook and pacing (${R}/video/docs/OWNER_PLAYBOOK.md: CLEAR TO A REGULAR PERSON ON ONE HEARING; ONE SUBJECT, GONE DEEP with its new "No side quests, and only the information the story needs"; RULE #1 and the new "Human connectors, placed TACTICALLY"), ${D}/PRINCIPLES.md, then the current files: ${R}/video/docs/v4/script/script_g1.md (its notes and fix rounds), script_elevenlabs.md, clarity.json, ${R}/video/docs/v4/THROUGHLINE.md, the panel folders in ${R}/video/docs/v4/script/ (what cold viewers stumbled on), and the fact file ${R}/video/docs/v5/research/factlock.md for any line you change.
Draft 2 as the owner read it: "Did you know Helsinki wants AI to heat seventy thousand homes? / AI runs on giant computers, in buildings called data centers. / Those computers get really hot. / Just one of them makes as much heat as FORTY kettles, boiling non-stop. / That's a lot of tea. / In most data centers, big fans just blow that heat outside. / But Helsinki WANTS that heat. / So Helsinki has a plan for twenty twenty-seven. / A big new data center there would cool its computers with water. / The water comes out hot. / Then pipes under the streets carry it into people's homes. / Computers have heated Helsinki before. / In twenty ten, a small data center under a cathedral started heating homes. / Soon, your chatbot could heat an apartment in Helsinki."
Do: (1) cut the side quest the owner named (the two 2010 cathedral lines), then test every other beat the same way (cut it in your head: if the viewer still gets the story and the payoff, it goes) and write each surviving beat's job in one line; (2) add human connectors where a person telling a friend would, tactically, about two to four in the film: the owner's own example first ("To put that into perspective," or a plainer spoken equivalent before the forty kettles), then "Actually," / "So," / "Now," only where they truly open their sentence; never a stock reveal from the creative brief's RULE #1 list; (3) keep every line clear on one hearing (the panels' lessons: the plan and its year said where the plan starts, nouns kept in short lines, nothing figurative); (4) keep line 1 (the owner praised it), the kettles, the joke if it still earns its second, the turn, the plan with its year, the mechanism and the payoff. The text may grow a little where the words make it more natural (the owner: "okay to keep the text longer if needed"); stay inside 30-45 s (95-125 words by check_paste.py).
Deliver: script_g1.md as draft 3 (a new top section "Draft 3 after the owner's notes on draft 2": each note and what changed, each beat's job, each connector and why it sits there; the hook options re-checked; the line table, plain voice-over, facts table and Checks updated), the paste (hook 1 voiced), THROUGHLINE.md (the cathedral beat out of the card, the carriers re-taken from the new joins; the cathedral may stay in the home view only as a landmark, never a beat), clarity.json if a name changes. Run python3 ${R}/video/scripts/voice/check_rhythm.py, check_paste.py and check_clarity.py on the paste until all three print OK, answering any clarity warning in Checks. Return the spoken text.`,
    { label: 'writer: draft 3', phase: 'Write', schema: WOUT, effort: 'max' }),
  () => agent(`Integrate the owner's two newest script rules into the process docs. ${COMMON}
The rules are already captured in ${R}/video/docs/OWNER_PLAYBOOK.md (ONE SUBJECT, GONE DEEP: "No side quests, and only the information the story needs"; Script and voice: "Human connectors, placed TACTICALLY"), with the owner's words in ${R}/video/docs/v4/OWNER_NOTES.md (the last entry). Integrate them, never just append (the playbook's "New feedback is INTEGRATED"): ${D}/PRINCIPLES.md (fold both into the principles and into "How a 40-second script is structured so it lands": the beats keep only what carries the story, the proof or twist beat only when the story needs it; where connectors go); ${R}/video/docs/PIPELINE_V2.md's G1 bullet (the writer's side-quest test and connectors; the cold viewer cards' two extra questions: which sentence could go, and where it sounds like a person or a script); ${R}/video/docs/CREATIVE_BRIEF.md's banner (one line: tactical human connectors are wanted, RULE #1's stock reveals stay banned); ${R}/video/docs/v5/script/WRITER_BRIEF.md (one line); check ${R}/video/scripts/voice/check_clarity.py's lists so a wanted connector ("To put that into perspective", "Actually", "So", "Now") is never flagged as an idiom or stock phrase (if it is, fix the list and keep --selftest passing). Do NOT edit anything in ${R}/video/docs/v4/ or the playbook's two new bullets' wording (other agents own them; you may fix a clash elsewhere in the playbook). Write ${D}/INTEGRATION_2.md: every file changed with the old and new text in a line each.`,
    { label: 'integrate the new rules', phase: 'Write', schema: OUT, effort: 'max' }),
])
if (!w || !w.spoken_text) return { writer: w, integ, note: 'the writer did not finish' }
log(`draft 3: ${w.words} words; ${w.checks.slice(0, 160)}`)

// ---------- Evaluate: cold panel and critic together ----------
phase('Evaluate')
const evalRes = await parallel([
  () => panelOf(w.spoken_text, 'panel_d3'),
  () => agent(`You are the critic of video 4's G1 draft 3. Your file: ${R}/video/docs/v4/script/critique_g1_r3.md. ${COMMON}
Read the owner's words (${R}/video/docs/v4/OWNER_NOTES.md, every entry since G1, the last two above all), the playbook's Script and voice (CLEAR TO A REGULAR PERSON ON ONE HEARING; ONE SUBJECT, GONE DEEP with "No side quests"; RULE #1; "Human connectors, placed TACTICALLY"), ${D}/PRINCIPLES.md, then the script files (${R}/video/docs/v4/script/script_g1.md draft 3, script_elevenlabs.md, ${R}/video/docs/v4/THROUGHLINE.md). Run the three checks (check_rhythm.py, check_paste.py, check_clarity.py) on the paste and quote their verdicts. Judge: (1) no side quest: each beat's job, and any line that could go; (2) the connectors: where a person would say them, about two to four, each true to its sentence, none a stock reveal, none forced; (3) every line clear on one hearing (pointers, names, nothing figurative); (4) the story: one thing, the turn, the plan and its year, the payoff close to the end, 30-45 s; (5) facts against ${R}/video/docs/v5/research/factlock.md (the floor: a plan, from 2027). At most 6 findings ranked blocker > major > minor, each with the line, the problem and a concrete replacement checked against the fact file. Verdict: FIX AND SEND or REWRITE.`,
    { label: 'critic: draft 3', phase: 'Evaluate', schema: CRIT, effort: 'max' }),
])
const panel = evalRes[0] || []
const c = evalRes[1]
const summarize = (pn, text) => {
  const ok = (pn || []).filter(Boolean)
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean)
  const snags = []
  lines.forEach((line, i) => {
    const bad = ok.filter(p => { const s = p.sentences[i]; return s && s.thumb !== 'keep watching' })
    if (bad.length) snags.push(`line ${i + 1} "${line}": ${bad.map(p => `${p.persona.split(',')[0]} ${p.sentences[i].thumb} (${p.sentences[i].why})`).join('; ')}`)
  })
  const extras = ok.map(p => `${p.persona.split(',')[0]}: could go: ${p.could_go}; most scripted: ${p.most_scripted}; most confusing: ${p.most_confusing}`)
  return { snags, extras }
}
let s1 = summarize(panel, w.spoken_text)
log(`panel d3: snags ${s1.snags.length}; critic ${c ? c.verdict + ' ' + c.blockers + '/' + c.majors + '/' + c.minors : 'missing'}`)

// ---------- Fix and re-hear (at most 2 rounds) ----------
let text = w.spoken_text, last = w, panels = [panel], fixes = []
let findings = `the cold panel's files in ${R}/video/docs/v4/script/panel_d3/ (lines with a viewer's unsure or swipe: ${JSON.stringify(s1.snags)}; their notes on what could go, what sounded scripted and what confused them: ${JSON.stringify(s1.extras)}) and the critique ${R}/video/docs/v4/script/critique_g1_r3.md (${c ? c.verdict + ', ' + c.blockers + ' blockers, ' + c.majors + ' majors, ' + c.minors + ' minors' : 'missing'})`
for (let round = 1; round <= 2; round++) {
  const needFix = (round === 1 && ((c && (c.blockers + c.majors + c.minors) > 0) || s1.snags.length)) || (round > 1 && s1.snags.length)
  if (!needFix) break
  phase('Fix')
  const f = await agent(`Fix round ${round} for video 4's G1 draft 3. ${COMMON}
Read the owner's words (${R}/video/docs/v4/OWNER_NOTES.md, the last two entries), the playbook's Script and voice rules named there, ${D}/PRINCIPLES.md, then the script files (${R}/video/docs/v4/script/script_g1.md: its "Draft 3" notes; script_elevenlabs.md; clarity.json; ${R}/video/docs/v4/THROUGHLINE.md) and the findings: ${findings}. Apply every blocker and major, every line a viewer stumbled on, and the plainly right minors; a single viewer's quirk may stay if you say why. Change as few lines as you can; keep line 1, the connectors that work and every fact inside ${R}/video/docs/v5/research/factlock.md. Keep script_g1.md, the paste and THROUGHLINE.md in sync; re-run the three checks until all print OK; write a "Draft 3, fix round ${round}" section (each finding: done, old -> new line / not done, why; the three verdicts). Return the final spoken text and the numbers of the sentences you changed.`,
    { label: `fix round ${round}`, phase: 'Fix', schema: WOUT, effort: 'max' })
  if (!f || !f.spoken_text) break
  fixes.push(f); last = f; text = f.spoken_text
  if (!f.changed_lines || !f.changed_lines.length) break
  const pn = await panelOf(text, `panel_d3_r${round}`)
  panels.push(pn)
  s1 = summarize(pn, text)
  log(`re-hear r${round}: snags ${s1.snags.length}`)
  findings = `the cold re-hear of fix round ${round}, files in ${R}/video/docs/v4/script/panel_d3_r${round}/ (lines with a viewer's unsure or swipe: ${JSON.stringify(s1.snags)}; notes: ${JSON.stringify(s1.extras)})`
}
return { writer: w, integ, critic: c, fixes, final_text: text, final: last, panels, last_snags: s1.snags, last_extras: s1.extras }
