export const meta = {
  name: 'script-clarity',
  description: 'Owner: scripts too ambiguous and weird. Research how spoken messages land, distill rules, bake them in (+ check_clarity.py), rework the v4 script, cold viewer panel, critic, fix',
  phases: [
    { title: 'Research', detail: 'two lanes: understood on one hearing (ear, plain language, cognition); short explainers that land (structure, naming, humor, retention)' },
    { title: 'Distill', detail: 'one synthesis: PRINCIPLES.md, RULES_DRAFT.md, LINT_SPEC.md, from the research and our v1-v5 scripts' },
    { title: 'Build and rework', detail: 'check_clarity.py built; the v4 script reworked under the new rules' },
    { title: 'Panel', detail: 'three cold regular viewers hear the new narration sentence by sentence' },
    { title: 'Critique', detail: 'one critic (panel, lints, facts, the owner notes); the rules integrated into the docs alongside' },
    { title: 'Fix', detail: 'one fix pass, all checks OK' },
  ],
}

const R = '/home/user/Test-'
const D = `${R}/video/docs/retro/2026-10-29_script_clarity`
const COMMON = `Work in ${R}. First read ${D}/BRIEF.md (the shared brief: the owner's words, the audience, the rules for every agent) and follow its "Every agent" rules. Your final reply is the structured output only, its summary at most 3 short lines.`

const OUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['status', 'summary', 'files'] }
const WOUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, spoken_text: { type: 'string', description: 'exactly what the voice says, no tags, one sentence per line' }, words: { type: 'integer' }, checks: { type: 'string' } }, required: ['status', 'summary', 'spoken_text', 'words', 'checks'] }
const PANEL = { type: 'object', properties: {
  persona: { type: 'string' },
  sentences: { type: 'array', items: { type: 'object', properties: { sentence: { type: 'string' }, understood: { type: 'string' }, missed_words: { type: 'string' }, pointers: { type: 'string', description: 'what each it/that/this/they/them/those points to, as you heard it; empty if none' }, thumb: { type: 'string', enum: ['keep watching', 'unsure', 'swipe'] }, why: { type: 'string' } }, required: ['sentence', 'understood', 'missed_words', 'pointers', 'thumb', 'why'] } },
  retell: { type: 'string' }, most_confusing: { type: 'string' }, would_send: { type: 'boolean' }, why_send: { type: 'string' } },
  required: ['persona', 'sentences', 'retell', 'most_confusing', 'would_send', 'why_send'] }
const CRIT = { type: 'object', properties: { verdict: { type: 'string', enum: ['FIX AND SEND', 'REWRITE'] }, blockers: { type: 'integer' }, majors: { type: 'integer' }, minors: { type: 'integer' }, summary: { type: 'string' } }, required: ['verdict', 'blockers', 'majors', 'minors', 'summary'] }

// ---------- Research: two lanes in parallel (the synthesis needs both) ----------
phase('Research')
const research = await parallel([
  () => agent(`Research lane EAR: how a spoken message is understood on ONE hearing by a broad audience. ${COMMON}
Cover, with sources: (1) writing for the ear: broadcast and radio news writing guides (NPR, AP, Reuters, CBC, Mervin Block, public-radio and podcast scripting): sentence shape (subject first, one idea per sentence), pronouns and referents (when to say the noun again), numbers by ear, signposting, "say it the way you'd tell a friend"; (2) the cognitive science of listening: working memory for speech, the given-new contract (Haviland and Clark) and old-to-new information flow, what makes a pronoun's referent obvious (recency, subjecthood, a single candidate), garden-path sentences, processing fluency (easy to process = liked and believed), the concreteness effect, the curse of knowledge (Camerer, Loewenstein and Weber; Newton's tapping study; Pinker, The Sense of Style); (3) plain language: ISO 24495-1, plainlanguage.gov, GOV.UK's common words, what readability formulas can and can't tell; jargon and false friends (common words with a tech meaning: chips, cabinet, cloud, cooling), how science journalists introduce a technical thing to lay people (the familiar thing first, then the term, an analogy tied to the real thing, one new term at a time); (4) non-native listeners: what helps (common words, literal language) and what hurts (idioms, wordplay, slang).
Write ${D}/research_ear.md: "Findings", ranked by impact for a 30-45 s spoken short, at most 14, each: the rule in one line; why (source URL, and its strength: study / style guide / practitioner); a bad -> good example taken from video 4's draft 1 (${R}/video/docs/v4/archive/g1_draft1/script_elevenlabs.md); how to check it (by script, or by a cold listener). Then "The 6 that matter most". About 15-20 searches.`,
    { label: 'research: ear', phase: 'Research', schema: OUT, effort: 'max' }),
  () => agent(`Research lane EXPLAINERS: how short explainers land with the biggest audience, and how the message is structured. ${COMMON}
Cover, with sources: (1) structure: how top explainers (Kurzgesagt, Vox, Johnny Harris, Veritasium, Wendover and Half as Interesting, TED-Ed, Mark Rober, and our model reel, @civilext's Big Bend: ${R}/video/docs/studies/2026-10-28_city_posters/refs/bigbend_reel/README.md) shape a 30-60 s script so a lay viewer follows every step: set-up, mechanism, payoff; Randy Olson's ABT (And, But, Therefore); Loewenstein's information-gap theory of curiosity; the Heaths' Made to Stick (simple, unexpected, concrete, credible, emotional, stories); one sentence = one step; repeating the key noun; when an analogy helps (tied to the real thing) and when it confuses; (2) introducing technical things to a broad audience: the everyday name first ("the computers that run AI"), how much jargon a general audience tolerates, good examples of naming a tech object in voice and on screen; (3) retention and confusion: what creators and platforms report about confusion and swipes (retention curves, "never confuse the viewer", MrBeast's production notes, Paddy Galloway, YouTube creator guidance), captions read along, the reading level of successful explainers; (4) humor for a broad audience in explainers: what lands (plain, relatable, observational) and what reads weird or cheeky; (5) apply it: the Big Bend reel's script line by line (why it is clear), and video 4's draft 1 line by line (${R}/video/docs/v4/archive/g1_draft1/script_elevenlabs.md): why each line the owner flagged fails, and which lines the owner didn't flag fail the same way.
Write ${D}/research_explainers.md: "Findings", ranked by impact for a 30-45 s spoken short, at most 14, each: the rule in one line; why (source URL, and its strength: study / style guide / practitioner); a bad -> good example from video 4's draft 1; how to check it. Then the two line-by-line analyses, then "The 6 that matter most". About 15-20 searches.`,
    { label: 'research: explainers', phase: 'Research', schema: OUT, effort: 'max' }),
])
log(`research: ${research.filter(Boolean).map(r => r.status).join(', ')}`)

// ---------- Distill ----------
phase('Distill')
const synth = await agent(`You distill and generalize the owner's notes into principles, rules and a check. ${COMMON}
Read, in order: the owner's words (${R}/video/docs/v4/OWNER_NOTES.md, the last entry); ${D}/research_ear.md and ${D}/research_explainers.md; then our scripts as a corpus, to find where the same failures recur (generalize from the owner's notes to every pattern behind them): v4 draft 1 (${R}/video/docs/v4/archive/g1_draft1/script_elevenlabs.md), v3 (${R}/video/docs/v3/script/script_elevenlabs.md), v2 (${R}/video/docs/v2/script/script_elevenlabs.md), v5's draft 1 (${R}/video/docs/v5/script/spine_draft_as_sent.md) and v1, the best performer (${R}/video/docs/script/final_script.md); the model reel (${R}/video/docs/studies/2026-10-28_city_posters/refs/bigbend_reel/README.md). Then the rules they must sit with: the playbook's "Script and voice", "Hook and pacing" and "Taste signals" sections (${R}/video/docs/OWNER_PLAYBOOK.md) and the G1 bullet of ${R}/video/docs/PIPELINE_V2.md.
Write three files in ${D}/:
1. PRINCIPLES.md (owner-facing, about one phone screen per part): 6-9 principles, each: the principle in one plain sentence; the owner's own example (their line and words) or a corpus example, bad -> good; the research behind it in one line with its source; the test a writer or a cold viewer applies. Then "How a 40-second script is structured so it lands" (the order of beats; how each sentence hands the next its subject; where the plain mechanism goes; where a number goes; where a joke may go). Then a corpus table (each pattern, how often it occurs in v1-v5, two examples).
2. RULES_DRAFT.md: the exact new text for each doc and what it replaces: the playbook (refine today's "CLEAR TO A REGULAR PERSON ON ONE HEARING" bullet with the method, keeping the owner's quotes verbatim; merge or retire what it overlaps, such as "Everyday spoken language" and Taste signals "Lines: plain, direct and personal over clever"); PIPELINE_V2's G1 bullet (the writer's clarity pass with check_clarity.py; the critic's cold viewer panel: three plain personas hear the narration once, sentence by sentence, and report what they understood, the words they missed, what each pronoun points to and their thumb; what counts as a finding); the CREATIVE_BRIEF banner line; one clause for CLAUDE.md's script bullet.
3. LINT_SPEC.md: what ${R}/video/scripts/voice/check_clarity.py should catch by script (only what a script catches reliably; the rest is the panel's job): pronouns with no single obvious referent in the sentence before (heuristics), vague scope words, tech words and false friends unglossed on first use (a default list plus a per-film list), rare words (name a word-frequency library and a threshold), idioms and wordplay; inputs and outputs like check_rhythm.py (each sentence with its flags; exit 0 OK, 1 FAIL; warnings); and the regression set: it must flag the owner's flagged lines in v4 draft 1 for the owner's reasons, pass line 1, and pass the clean rewrites in PRINCIPLES.md.
Return the principles, one line each, in the summary (up to 9 short lines allowed here).`,
  { label: 'distill', phase: 'Distill', schema: OUT, effort: 'max' })
if (!synth) return { research, synth: null, note: 'the synthesis did not finish; nothing after it ran' }

// ---------- Build the check and rework the script, in parallel ----------
phase('Build and rework')
const lintP = agent(`Build ${R}/video/scripts/voice/check_clarity.py from ${D}/LINT_SPEC.md (read PRINCIPLES.md there first). ${COMMON}
Follow the playbook's "Find the PRO way and the pro tools" rule: for each part, search for a maintained, small, permissively licensed, deterministic library (e.g. wordfreq for word frequency) and use it only if it is genuinely better than a few lines of our own; pin it; record the choice, the alternatives and why in the script's header. Match ${R}/video/scripts/voice/check_rhythm.py and check_paste.py: the same inputs (an ElevenLabs paste file or plain text; tags, headings and blank lines ignored), each sentence printed with its flags, exit 0 = OK, 1 = FAIL, warnings printed. Add --selftest with the spec's regression set (the owner's flagged lines in ${R}/video/docs/v4/archive/g1_draft1/script_elevenlabs.md FAIL for the owner's reasons; line 1 and the clean rewrites pass) and run it; run the tool on the v1, v2, v3 and v4-draft-1 scripts and report what it flags (false positives you can't fix: list them). pip install only what you need. Write ${D}/LINT_REPORT.md: usage, the checks, the library choice, the selftest result, the corpus run, and "Doc changes needed" (the exact Studio toolkit row and G1 bullet words) for the integrator.`,
  { label: 'build check_clarity.py', phase: 'Build and rework', schema: OUT, effort: 'max' })

const w = await agent(`You rework video 4's G1 script after the owner's line-by-line notes. ${COMMON}
Read FIRST the owner's words (${R}/video/docs/v4/OWNER_NOTES.md, the last entry): they are the spec. Then ${D}/PRINCIPLES.md and ${D}/RULES_DRAFT.md (the new rules); then the current files, still draft 1: ${R}/video/docs/v4/script/script_g1.md (its Spines, the story, the hook options, the facts table), script_elevenlabs.md and ${R}/video/docs/v4/THROUGHLINE.md; the film's brief ${R}/video/docs/v4/script/WRITER_BRIEF.md (still in force: 30-45 s, 95-125 words, one subject, positive, no company in line 1, the floor); the fact file ${R}/video/docs/v5/research/factlock.md for every line you change.
Rework: keep line 1, which the owner praised ("Did you know Helsinki wants AI to heat seventy thousand homes?"); rewrite every line the owner flagged so a regular person gets it on one hearing, for the reason the owner gave; apply the same test to every other line (for example "those chips are water-cooled", "they've done this before", "a data center under a cathedral", "your chatbot"). Keep the spine, the turn and the payoff unless a principle says otherwise; keep every fact inside the fact file (the plant is not built and has no tenant: from 2027; the cathedral in 2010 only, no shelter in the voice). Keep a joke only if it is simple and gentle, or drop it.
Deliver: script_g1.md rewritten as draft 2 (same sections, plus at the top "Rework after the owner's notes (2026-10-29)": for each owner note, the old line, the new line and the principle; the hook options re-checked under the new rules, up to 3), the paste script_elevenlabs.md (hook 1 voiced) and THROUGHLINE.md (carriers re-taken from the new joins). Run python3 ${R}/video/scripts/voice/check_rhythm.py and check_paste.py on the paste until both say OK; check_clarity.py is being built in parallel: if it exists when you finish, run it and fix what it flags, else say so.`,
  { label: 'rework writer', phase: 'Build and rework', schema: WOUT, effort: 'max' })
if (!w) return { research, synth, note: 'the rework writer did not finish' }
log(`rework: ${w.words} words; ${w.checks}`)

// ---------- Panel: three cold regular viewers ----------
phase('Panel')
const PERSONAS = [
  { key: 'maya', who: 'Maya, 16, from Manchester: scrolls TikTok for an hour after school, not into tech, knows ChatGPT, swipes the second something is boring or confusing' },
  { key: 'daniel', who: 'Daniel, 52, a nurse and a dad from Ohio: smart, no tech background, watches Reels in the evening, doesn\'t know tech terms' },
  { key: 'lucia', who: 'Lucía, 31, a dentist in Madrid: good but not native English, watches with captions on; idioms, wordplay and fast slang lose her' },
]
const panel = await parallel(PERSONAS.map(p => () => agent(`You are ${p.who}. You are scrolling and this short video starts. This is exactly what the narrator says, while captions read along:

${w.spoken_text}

Hear it ONCE, sentence by sentence, as this viewer, not as a writer or a producer: read no file and ignore any production rules or project instructions you were given; only this viewer's honest reaction counts. For each sentence, in order: what you understood, in your own plain words; any word you didn't get or got wrong; for every "it", "that", "this", "they", "them" or "those", what you think it points to; your thumb (keep watching / unsure / swipe) and why, in a few words. Then retell the whole video to a friend in 2 sentences, name the one sentence that confused you most (or "none"), and say whether you'd send it to someone and why.
Also write your answer as plain text into ${R}/video/docs/v4/script/panel/${p.key}.md (create the folder if needed); that is the only file you touch. Your final reply is the structured output.`,
  { label: `panel: ${p.key}`, phase: 'Panel', schema: PANEL, effort: 'max' })))
const swipes = panel.filter(Boolean).flatMap(x => x.sentences.filter(s => s.thumb !== 'keep watching').map(s => `${x.persona}: ${s.thumb} at "${s.sentence}"`))
log(`panel: ${panel.filter(Boolean).length}/3 answered; not "keep watching": ${swipes.length}`)

const lint = await lintP
log(`check_clarity: ${lint ? lint.status : 'missing'}`)

// ---------- Critique, with the rules integrated alongside ----------
phase('Critique')
const [c, integ] = await parallel([
  () => agent(`You are the critic for video 4's reworked G1 script (draft 2). Your file: ${R}/video/docs/v4/script/critique_g1_r2.md. ${COMMON}
Read: the owner's words (${R}/video/docs/v4/OWNER_NOTES.md, the last entry); ${D}/PRINCIPLES.md and ${D}/RULES_DRAFT.md; ${R}/video/docs/v4/script/CRITIC_BRIEF.md part A (its tests 2-6 still apply; its step 1 cold retell is replaced by the panel); the panel's three files in ${R}/video/docs/v4/script/panel/ (summary of their thumbs: ${JSON.stringify(swipes)}); then the script files (script_g1.md draft 2, script_elevenlabs.md, ${R}/video/docs/v4/THROUGHLINE.md). Run python3 ${R}/video/scripts/voice/check_rhythm.py, check_paste.py and check_clarity.py (if it exists) on the paste and quote their verdicts.
Judge: (1) every owner note answered: the new line beats the old one for a regular person, for the owner's reason; the praised line 1 kept; (2) the panel: every word a viewer missed, every pronoun heard wrong, every "unsure" or "swipe" is a finding unless it is one persona's quirk (say why); (3) the story still flows (one subject, the turn, the payoff), the facts hold against ${R}/video/docs/v5/research/factlock.md (the floor), the hook options pass; (4) any line still clever, compressed, vague or weird. At most 6 findings, ranked blocker > major > minor, each with the line, the problem in one sentence and a concrete replacement checked against the fact file. Verdict: FIX AND SEND or REWRITE.`,
    { label: 'critic', phase: 'Critique', schema: CRIT, effort: 'max' }),
  () => agent(`Integrate the new script-clarity rules into the process docs. ${COMMON}
Read ${D}/PRINCIPLES.md, ${D}/RULES_DRAFT.md and ${D}/LINT_REPORT.md (the tool as built; if it is missing, leave its rows out and say so). Apply RULES_DRAFT's text, integrating, never just appending (the playbook's "New feedback is INTEGRATED" and its Maintenance section): ${R}/video/docs/OWNER_PLAYBOOK.md (Script and voice: refine today's CLEAR TO A REGULAR PERSON ON ONE HEARING bullet with the method, the owner's quotes verbatim; merge or retire what overlaps or contradicts it, so no two rules conflict); ${R}/video/docs/PIPELINE_V2.md (the G1 bullet: the writer's clarity pass and check_clarity.py, the critic's cold viewer panel; the Studio toolkit row for check_clarity.py); ${R}/video/docs/CREATIVE_BRIEF.md (its banner: one line); ${R}/CLAUDE.md (one clause in the script bullet, nothing else); ${R}/video/docs/v5/script/WRITER_BRIEF.md (one line: the clarity rule and the check apply). Do NOT edit anything in ${R}/video/docs/v4/ (other agents own it). Write ${D}/INTEGRATION.md: every file changed with the old and new text in a line each, and anything you chose not to change and why.`,
    { label: 'integrate the rules', phase: 'Critique', schema: OUT, effort: 'max' }),
])
if (!c) return { research, synth, lint, w, panel, integ, note: 'the critic did not finish; no fix pass' }
log(`critic: ${c.verdict} (${c.blockers}/${c.majors}/${c.minors})`)

// ---------- Fix ----------
phase('Fix')
const f = await agent(`Fix pass for video 4's G1 draft 2. ${COMMON}
Follow ${R}/video/docs/v4/script/CRITIC_BRIEF.md part B, with the critique ${R}/video/docs/v4/script/critique_g1_r2.md (verdict ${c.verdict}; ${c.blockers} blockers, ${c.majors} majors, ${c.minors} minors), the panel files in ${R}/video/docs/v4/script/panel/, ${D}/PRINCIPLES.md and the owner's words (${R}/video/docs/v4/OWNER_NOTES.md, the last entry). Start from the writer's notes in script_g1.md ("Rework after the owner's notes" and the Spines). Apply every blocker and major and the plainly right minors; keep script_g1.md, script_elevenlabs.md and ${R}/video/docs/v4/THROUGHLINE.md in sync; re-run check_rhythm.py, check_paste.py and check_clarity.py (if it exists) on the paste until all say OK; write a "Fix pass (draft 2)" section (one line per finding: done, what changed / not done, why) with the final word count, length and the verdicts. Then add to ${R}/video/docs/v4/script/WRITER_BRIEF.md and CRITIC_BRIEF.md a short pointer to the new rules (PRINCIPLES.md, check_clarity.py, the cold viewer panel), so the next pass on this film uses them. Return the final spoken text in the structured output.`,
  { label: 'fix pass', phase: 'Fix', schema: WOUT, effort: 'max' })

return { research, synth, lint, writer: w, panel, critic: c, integ, fix: f }
