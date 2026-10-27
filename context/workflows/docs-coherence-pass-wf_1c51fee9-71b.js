export const meta = {
  name: 'docs-coherence-pass',
  description: 'Make the studio docs one coherent direction after the v3 feedback: a single DIRECTION page, a cross-doc conflict sweep, fixes at the source, a playbook coherence review, and a fresh next-video agent read-through',
  phases: [
    { title: 'Sweep', detail: 'DIRECTION page draft + conflict sweep (parallel)' },
    { title: 'Fix', detail: 'resolve every conflict at its source; playbook coherence review' },
    { title: 'Fresh read', detail: 'a next-video agent reads the docs cold; fix what confuses it' },
  ],
}

const V = '/home/user/Test-/video'
const ROOT = '/home/user/Test-'
const GIT = `GIT: before editing a file, run git pull --no-rebase origin video-production (another session edits docs too). Commit only the files you
changed (git add <paths>), message ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
If .git/index.lock exists wait 5 s and retry; push with git pull --no-rebase origin video-production then git push origin HEAD:video-production; never
discard another session's work. The repo is PUBLIC: no email addresses or secrets.`

const CTX = `
THE OWNER (2026-10-27): "Make sure you evaluate this feedback and compact it with the overall stylistic direction ... the next agent working on the next
video should not be confused with conflicting instructions"; "let's not focus on the playbook being a certain size, just keep it as coherent and clear
as we can". The newest direction (wins over anything older): the owner's general feedback after v3 G5b (verbatim in ${V}/docs/v3/OWNER_NOTES.md, the
2026-10-27 entries) and its distillation: ${V}/docs/OWNER_PLAYBOOK.md (Visual style: clean premium, light and shadow, attention hierarchy; Storyboard:
one flowing story), ${V}/docs/look/CRAFT.md (the craft spec: through-line and transitions, tiers, clean line, light and shadow; written and critic-checked
today) and ${V}/docs/retro/2026-10-27_v3_retro.md (the sketch-first verdict; its pipeline changes are split into "Applied now" and "For a yes": the
owner has NOT yet approved the "For a yes" part, so docs must present it as a pending proposal, not as the rule). Still valid and important: feel alive
(full, never empty, but calm and tiered, not busy), warm never sickly (palettes), coziness v2 and great scale (COZY_AND_SCALE, CINEMATIC_GUIDE), the
opening banger, story-first scripts, the API voice, 60 fps, captions, the posting rules, max effort for subagents, no token limit for creative work.
THE DOCS: ${ROOT}/CLAUDE.md, ${ROOT}/HANDOFF.md (sections 0-1 and the "how we work" parts; leave per-video status lines alone),
${V}/docs/OWNER_PLAYBOOK.md, ${V}/docs/PIPELINE_V2.md, ${V}/docs/G3_ANIMATIC.md, ${V}/docs/G5_BLOCKING.md, ${V}/docs/look/STORYBOARD_STYLE.md,
${V}/docs/look/CINEMATIC_GUIDE.md, ${V}/docs/look/COZY_AND_SCALE.md, ${V}/docs/look/LIFE_AND_DENSITY.md, ${V}/docs/look/PALETTE.md, ${V}/docs/look/CRAFT.md,
${V}/docs/ELEVENLABS.md, and the v1-era look docs that agents may still open (${V}/docs/style_bible.md, ${V}/docs/style_bible_ref2.md,
${V}/docs/motion_spec.md, ${V}/docs/ENGINE.md, ${V}/docs/EDGES.md, ${V}/docs/CINE.md).`

phase('Sweep')
const [direction, sweep] = await parallel([
  () => agent(`${CTX}
YOU ARE THE DIRECTION WRITER. Draft ${V}/docs/look/DIRECTION.md: ONE page (aim ~60-90 lines) that is the single source of truth for our current visual
and storytelling direction, written for the next agent starting a video. It states the direction in plain rules (story and flow; attention hierarchy;
alive but calm; clean premium line; gentle light and shadow; warm palettes; cozy and scale; motion and camera; the opening; captions), each with a link
to the detailed doc that holds the numbers, and an explicit "this page wins over older docs" line plus a list of retired ideas (e.g. scratchy sketch lines
in finals, misregistered fills, equal-weight clutter, an events-per-second quota, a new place per chart, plain cuts by default). Mark pending items as
pending (the pipeline proposal awaiting the owner's yes). Do not edit any other file yet. ${GIT}
REPORT: the path and a 6-line summary.`, { label: 'direction', phase: 'Sweep', effort: 'max' }),
  agent(`${CTX}
YOU ARE THE CONFLICT SWEEPER. Read every doc listed and find every instruction that conflicts with the newest direction or with another doc (e.g. rough
or misregistered ink as the house style, "something new every few frames" as a quota, ">= 5 events/s", "always-on idle layer" without tiers, "a cut by
default", "change size and angle at every cut", "dense set dressing" without the hierarchy, a new place per chart, strangers' backs as the foreground
audience, rules that reference retired tools or thresholds, pipeline rules stated as approved when they are still a proposal). For each: file, line or
section, the conflicting text (short quote), what it conflicts with, and the exact resolution (rewrite to X / retire with a pointer / keep because Y).
Do not edit files. Save the list to /tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/coherence/conflicts.md and return it
(at most ~120 lines).`, { label: 'sweep', phase: 'Sweep', effort: 'max' }),
])

phase('Fix')
const fix = await agent(`${CTX}
YOU ARE THE FIXER. Resolve every conflict in the sweep below AT ITS SOURCE (rewrite, or retire with a one-line pointer to DIRECTION.md / CRAFT.md),
keeping each doc's own job; v1-era docs get a short banner at the top saying which parts are superseded and where the current direction lives, rather
than a rewrite. Then finalise ${V}/docs/look/DIRECTION.md (the draft below) and link it from ${ROOT}/CLAUDE.md (one line near the top: read it before
any visual work), ${V}/docs/OWNER_PLAYBOOK.md's header and ${ROOT}/HANDOFF.md section 0. Then review ${V}/docs/OWNER_PLAYBOOK.md for coherence per its
Maintenance section (integrate, merge duplicates, retire with replacements, clear grouping; no size budget) without losing any owner rule or its
evidence. ${GIT}
REPORT (at most 12 lines): what you changed per file.
DIRECTION DRAFT REPORT:
${direction || 'FAILED'}
SWEEP:
${sweep || 'FAILED'}`, { label: 'fix', phase: 'Fix', effort: 'max' })

phase('Fresh read')
const fresh = await agent(`You are a NEW agent about to start video 4 of this short-form explainer studio, repo ${ROOT} (branch video-production). You know
nothing else. Read, in the order the repo tells you to (start with ${ROOT}/CLAUDE.md, then what it points to), everything you would read before
starting the topic, script, storyboard and visual work. Then list, as concretely as possible: every instruction that is unclear, every pair of
instructions that conflict (quote both, with file and section), every place where you would not know which rule wins, every step whose order or gate is
ambiguous, and anything stated as decided that looks like a pending proposal (or the reverse). Also say what you would do first for video 4 based on
the docs. Do not edit files. At most 60 lines.`, { label: 'fresh reader', phase: 'Fresh read', effort: 'max' })

const fix2 = await agent(`${CTX}
YOU ARE THE FINAL FIXER. A fresh agent read the docs cold, as if starting video 4 (its findings below). Fix every real confusion or conflict at its
source (skip one only if the reader misread, and say why). ${GIT}
REPORT (at most 10 lines).
FRESH READER:
${fresh || 'FAILED'}`, { label: 'final fix', phase: 'Fresh read', effort: 'max' })

return { direction, sweep, fix, fresh, fix2 }
