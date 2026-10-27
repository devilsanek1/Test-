export const meta = {
  name: 'v2r-understand-a',
  description: 'v2 restart, understanding (a): the house direction digest and the story beat map',
  phases: [{ title: 'Understand', detail: 'house direction digest + beat map of the locked script' }],
}
const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r'
const CTX = `
PROJECT: video 2 of "What's All the Fuss About?" (Instagram what.the.fuss.is.about; TikTok/Reels/Shorts, vertical 1080x1920), a short
explainer channel. Repo: ${V} (Remotion). Topic: a former Google DeepMind research engineer told BBC News (21 Oct 2026) she quit over where
Google's military AI work was heading, and says her contract bans her from criticizing Google, for life.
THE OWNER'S INSTRUCTION (2026-10-27, after rejecting our first production): "No I don't like it, let's start from scratch, let's reset all
cache, let's not do the sketch. Do the video right away, full creative freedom, but look at our GitHub repo's general direction and
principles. NO LIMIT ON TOKENS." So: a FRESH production straight to the FINISHED film (no sketch/board stage), full creative freedom inside
the repo's principles. The first production (G3 board, G4 Cream & Cobalt look, G5 blocking cut: docs/v2/archive/restart_2026-10-27/,
src/v2/, src/entry-v2*.tsx, public/v2/animatic.json, deliverables/v2/archive/) is DROPPED: never build on it or reuse its ideas.
FIXED (approved by the owner, cannot change in this session: the voice API key is not available): the script and its narration, take 2:
${V}/public/v2/voice.wav (39.08 s incl. a 0.12 s lead) with word timings ${V}/public/v2/voice_words.json. The script:
"She quit Google. And she says her contract bans her from criticizing it... for life. You'd think that's one odd contract. But Google's staff
told the BBC they're scared to speak out, because of their contracts. So why is she talking? She worked on Google's AI and told the BBC she
objected to where its military work was heading. In April, that meant a deal letting the Pentagon use its AI for "any lawful government
purpose". Google can't veto how it's used. But Google says it follows its AI principles, and bans retaliation "of any kind". She says she
can't criticize Google. But in her words, "talking about facts is not criticising"."
GIT: commit only the files you write (git add <paths>; never -A or .), message ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ
If .git/index.lock exists, wait 5 s and retry. Never push, pull, merge, rebase, reset, stash or checkout. The repo is PUBLIC: no email
addresses, no keys, no third-party images committed (reference frames stay in the scratch dir ${SCR}).
`
phase('Understand')
const [digest, beats] = await parallel([
  () => agent(`${CTX}
YOU WRITE THE HOUSE DIRECTION DIGEST: everything the repo says a FINISHED film of this channel must be, in one dense, well-organised page
that a creative team (treatment writers, art directors, builders) can work from without reading 3,000 lines of docs. Read in full:
${V}/docs/CREATIVE_BRIEF.md (the owner's master brief), ${V}/docs/OWNER_PLAYBOOK.md (every owner rule), ${V}/docs/PIPELINE_V2.md (the quality
bars of G4-G8: look, density/life, polish, sound, final; ignore the gate ceremony), ${V}/docs/look/CINEMATIC_GUIDE.md, COZY_AND_SCALE.md,
LIFE_AND_DENSITY.md, PALETTE.md (+ palettes.json), ${V}/docs/style_bible.md, ${V}/docs/mascot.md, ${V}/docs/EDGES.md, ${V}/docs/motion_spec.md,
${V}/docs/sound_plan.md, ${V}/docs/POSTING_KIT.md (skim), and skim ${V}/docs/v3/OWNER_NOTES.md and ${V}/docs/v1 notes if any (what the owner
praised and rejected, concretely). Write ${V}/docs/v2/direction/house_digest.md with: (1) the channel's promise and storytelling rules that
shape VISUALS (animation explains; every 3-5 s something worth knowing; the payoff); (2) the hook rules (frame 0, first 3 s, 5 s, 10 s) with
the owner's evidence; (3) the visual style rules (ink, flat colour, palette family and roles, warm never sickly, edges/paper, texture,
captions); (4) aliveness/density (the bar, the two profiles, what fills a frame) and cozy + scale (enclosure, the Arcane pull-back crane,
great-scale cues); (5) motion and camera (60 fps, reference shape not speed, transitions, cuts on the beat); (6) the mascot Pip's role
(the channel's recurring living character: in every scene like reference 1's cat) and its design rules; (7) sound and music (beds, SFX
rules, the positive phone sound in the first second, mix); (8) process lessons that matter for a direct-to-final production (what went
wrong on v3 G5 and our rejected v2 cut: emptiness, stillness, tableaux); (9) a checklist of 25-40 yes/no acceptance questions a finished
film must pass. Cite file + section for each rule (short). At most ~260 lines. Commit it.`, { effort: 'max', label: 'house-digest', phase: 'Understand' }),
  () => agent(`${CTX}
YOU WRITE THE BEAT MAP of the fixed narration: the clock and the meaning every visual must serve. Read ${V}/public/v2/voice_words.json
(word timings; the token "can'tveto" is "can't veto"), ${V}/docs/v2/CORE_LINE.md (the core line and section 2: what the script must do,
the FAIRNESS rules), ${V}/docs/v2/research/factlock.md, timeline.md, guardrails.md, industry.md, ${V}/docs/v2/source_bbc_2026-10-21.md and
${V}/docs/v2/script/script_g1.md (the approved script and its notes). Listen-proxy: also compute the pauses between words from the timings.
Write ${V}/docs/v2/direction/beat_map.md with: (1) the story spine in 4-6 lines (hook, stakes, explanation, twist, payoff per CREATIVE_BRIEF
section 11) and the one-sentence understanding shift; (2) a beat table: every phrase (2-6 words) with its exact start/end seconds, the one
thing the viewer must understand at that moment, the emotional temperature, the natural cut points (pauses >= 0.15 s, sentence ends) and the
word that should land a visual hit; (3) every verifiable FACT usable on screen (names, titles, dates, the deal's exact quoted words, who
reported what, Google's statement), each with its source and how it may be shown (quote marks or paraphrase, attribution needed); (4) the
FAIRNESS RULES for visuals as a strict list (from CORE_LINE section 2, guardrails and the brief's nonpartisan rule): what must never be shown
or implied (war imagery, villains, a likeness of the real person, "for life" in quote marks, the deal's purpose line without its oversight
clause, Google lettering where it implies wrongdoing, ...) and what must always be shown (attribution "she says", Google's side at equal
weight, credits); (5) the open questions a treatment must answer visually (who are "Google's staff", what was the deal, why she can talk).
At most ~220 lines. Commit it.`, { effort: 'max', label: 'beat-map', phase: 'Understand' }),
])
return { digest, beats }
