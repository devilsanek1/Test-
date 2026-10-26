export const meta = {
  name: 'elevenlabs-clean-takes',
  description: 'Root-cause ElevenLabs take failures (repeats, loops, derails, read-aloud tags): research docs/community/modes, analyse all our takes, synthesize a paste format + settings + workflow that narrate cleanly in one paste, critic pass',
  phases: [
    { title: 'Research', detail: 'official docs, community failure reports, generation modes' },
    { title: 'Evidence', detail: 'every take we have vs its paste file' },
    { title: 'Synthesis', detail: 'paste format v2, settings, workflow, linter spec' },
    { title: 'Critic', detail: 'adversarial check of the proposal' },
  ],
}

const ROOT = '/home/user/Test-/video'
const OUT = ROOT + '/docs/voice'
const CTX = `Context: today is 2026-10-26. The owner of a short-video channel writes nothing technical; they paste our script into ElevenLabs (the web app; the model shows as "eleven_v4" in their file names, e.g. ElevenLabs_2026-10-26T17_26_03_Test_3_eleven_v4.wav), generate, and send us the WAV. Our scripts are ~110-120 words (30-45 s), one delivery cue in square brackets before each line. The owner's request (verbatim): "We need to be able to paste it full and get eleven labs to narrate it cleanly. It's been a few times since we messed up; can you make sure we don't see this issue again." Failures so far: v4 read our notes and labels aloud; spoke words quoted inside tags; a cue "correcting yourself" made it repeat the previous line; the opening was said twice ("She quit. She quit Google."); on the latest take (video 2, take 1) it derailed mid-line ("she objected to swear its military..."), restarted from the top, then looped the last 3 lines three times, and swallowed the G in "And Google" ("And 'oogle"): 88 s instead of 43 s. Our current guide: ${ROOT}/docs/ELEVENLABS.md; our linter: ${ROOT}/scripts/voice/check_paste.py; take checker: ${ROOT}/scripts/voice/check_take.py.`

const RESEARCH = [
  { key: 'docs', brief: `Official ElevenLabs documentation and announcements (2025-2026) for their newest expressive models (Eleven v3 and anything newer, e.g. "v4"): how audio tags are meant to be used (the documented tag vocabulary, length, placement, whether free-text "director's notes" in brackets are supported), stability settings (e.g. Creative / Natural / Robust or a slider) and their effect on hallucination, repetition and tag adherence, speed and other settings, recommended and maximum prompt lengths, punctuation, ellipses, CAPS, line breaks and paragraphs, known limitations (repeats, skipped or invented words, reading tags aloud), and their own prompting guide's advice for long-form narration.` },
  { key: 'community', brief: `Real-world reports (Reddit, ElevenLabs Discord/forums, GitHub issues, blogs, YouTube creator guides, 2025-2026) of v3/v4 failures: repeated sentences, loops, restarts, hallucinated or garbled words, tags read aloud, swallowed consonants. For each failure type: what triggered it and what fixed it (settings, tag style, text formatting, chunking, seeds, regenerating a part). Note which fixes are confirmed by several people.` },
  { key: 'modes', brief: `The ways to generate a voice-over with ElevenLabs and how each affects reliability: the Text to Speech page (one generation for the whole text), Studio / Projects (paste a full script, generated paragraph by paragraph, with per-paragraph regeneration; does it support the newest model and audio tags?), the Dialogue mode, and the API (per-request generation, seeds, request stitching / previous_text and next_text for continuity, timestamps endpoints, the newest model id). Which mode lets a non-technical owner paste the full script once and get a clean, continuous narration with the fewest failures? And what would an API workflow look like where WE generate line by line with the owner's voice, check each line with speech recognition and regenerate failures automatically (what the owner would need to give us: an API key as an environment secret, the voice id).` },
]

phase('Research')
const research = await parallel(RESEARCH.map(r => () => agent(
  `${CTX}\n\nTask: ${r.brief}\n\nUse WebSearch and WebFetch (load them with ToolSearch "select:WebSearch,WebFetch"); WebFetch is often blocked here, so rely on search results from several sources and say when something is unconfirmed. Cite URLs and dates. Write your findings to ${OUT}/research_${r.key}.md (max ~120 lines; end with "What this means for us": concrete rules). Don't commit. Return at most 12 lines: the rules you would bet on, each with its confidence.`,
  { label: `research:${r.key}`, phase: 'Research' })))

phase('Evidence')
const evidence = await agent(
  `${CTX}\n\nTask: forensic analysis of every take we have, to find what in our paste files correlates with failures. Data:
- video 3: takes in ${ROOT}/assets/v3/ (take1_raw_eleven_v4.wav, take2_raw_eleven_v4.wav + _words.json, take4_raw_eleven_v4.wav + _words.json; take 3 may be missing) and the paste file history: run cd /home/user/Test- && git log --format='%h %ad %s' -- video/docs/v3/script/script_elevenlabs.md and git show <hash>:video/docs/v3/script/script_elevenlabs.md for the version each take was generated from (match by commit times and messages).
- video 2: ${ROOT}/assets/v2/take1_raw.wav + take1_raw_words.json, generated from ${ROOT}/docs/v2/archive/script_elevenlabs_take1.md.
- video 1: ${ROOT}/docs/script/original_annotated.md (the owner's own annotated script that worked) and the v1 voice takes in ${ROOT}/assets/ (vo_v2_eleven.wav, vo_v3_draft_take.wav, vo_v3_final.wav).
For takes without word timings, transcribe with: python3 ${ROOT}/scripts/voice/transcribe.py TAKE.wav /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8 OUT_words.json (or check_take.py TAKE PASTE MODEL to diff against the paste).
For every take: list each failure (type: repeat / loop / restart / garble / read-aloud / swallowed sound; where; which paste line and tag preceded it). Then compare features of failed vs clean lines: tag length (words), negations in tags, mid-line tags, ellipses, quotes, CAPS, line length, sentence starts that repeat ("But..." twice), total characters, number of tags. Say which features clearly correlate and which don't. Write ${OUT}/evidence.md (max ~120 lines, with a table). Don't commit. Return at most 12 lines.`,
  { label: 'evidence', phase: 'Evidence' })

phase('Synthesis')
const synth = await agent(
  `${CTX}\n\nYou are the voice-pipeline lead. Read ${OUT}/research_docs.md, research_community.md, research_modes.md and ${OUT}/evidence.md (skip missing ones), plus ${ROOT}/docs/ELEVENLABS.md and ${ROOT}/scripts/voice/check_paste.py.\n\nWrite ${OUT}/PROPOSAL.md (max ~150 lines):\n1. Root causes, ranked, with the evidence for each (ours and external), and your confidence.\n2. "Paste format v2": the exact format of a paste file that is most likely to narrate cleanly in ONE paste (tag vocabulary and length, one tag per line or fewer tags, paragraphs/line breaks, punctuation, CAPS, ellipses, numbers, the opening, the ending, max length), with a full example built from the video 2 script in ${ROOT}/docs/v2/script/script_elevenlabs.md (same spoken words).\n3. "Settings": exactly what the owner should pick in the ElevenLabs UI (model, stability mode, speed, other toggles), and which mode/page to use (Text to Speech vs Studio), with why.\n4. "If a take still breaks": the fastest owner-side recovery (e.g. regenerate one paragraph in Studio) and our side (check_take + clean_take).\n5. "Option: automated takes via the API": what it takes, what the owner gives us, how we'd guarantee a clean take (generate per line or paragraph with request stitching, ASR-check, auto-regenerate), cost, and the trade-offs.\n6. "Linter spec": the exact rules check_paste.py should enforce (errors vs warnings), so a bad paste file can never reach the owner.\nBe concrete and honest about what is unconfirmed. Don't commit. Return at most 12 lines: the top 3 root causes and the recommended format + settings in brief.`,
  { label: 'synthesis', phase: 'Synthesis' })

phase('Critic')
const critic = await agent(
  `${CTX}\n\nYou are a sceptical audio engineer who has produced hundreds of ElevenLabs voice-overs. Review ${OUT}/PROPOSAL.md against ${OUT}/research_*.md and ${OUT}/evidence.md: is every root cause supported, would the format really prevent each failure we saw, are the settings right for an expressive but stable read, is anything over-claimed, is anything missing (e.g. a cheaper fix, a setting that matters more)? Use WebSearch (load with ToolSearch) to check doubtful claims. Fix the proposal in place with minimal edits and add a "Critic notes" section at the end. Don't commit. Return at most 8 lines.`,
  { label: 'critic', phase: 'Critic' })

return { research: research.filter(Boolean), evidence, synthesis: synth, critic }
