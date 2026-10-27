export const meta = {
  name: 'v3-rework-design-and-pilot',
  description: 'v3 rework on the owner\'s feedback: 3 flow designers + judge (one flowing story, carriers, thread tag, hierarchy, light per place), clean-look engine (clean pen, tiers, light & shadow kit), restructure scenes, then a full-res pilot of sequence A with an independent review and fix',
  phases: [
    { title: 'Design', detail: 'flow designers x3 + judge; look engineers (clean pen + tiers; light & shadow kit) in parallel' },
    { title: 'Structure', detail: 'scenes.json and the registry restructured into sequences, with the handoff specs' },
    { title: 'Pilot', detail: 'sequence A built in the new flow and look, reviewed, fixed, rendered full size' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'
const R = SCR + '/retro'
const OUT = SCR + '/rework'
const GIT = `GIT: commit after every meaningful step (the container has restarted before; uncommitted work is lost), only your own paths
(git add <paths>), message ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
If .git/index.lock exists wait 5 s and retry. Push: git pull --no-rebase origin video-production, then git push origin HEAD:video-production (other
sessions push too; resolve only conflicts in your own files, never discard their work). The repo is PUBLIC: no email addresses or secrets.`

const CTX = `
VIDEO 3 ("AI is making your next laptop pricier", 41.15 s; voice LOCKED: ${V}/public/v3/voice.wav + voice_words.json; script
${V}/docs/v3/script/script_g1.md). The current cut ${V}/deliverables/v3/v3_g5b.mp4 (sheet ${V}/review/v3_g5b/sheet.jpg) was about to be posted; the
owner now wants the feedback APPLIED before publishing ("let's make it better before we publish it"). The owner's feedback, verbatim: "It's too busy,
too incoherent. There is no story, no clean transitions, just a bunch of shots put together ... we did the sketch first and then added a whole bunch of
details to make it feel alive, which is wrong ... too many moving parts and I'm not sure what to keep my attention on. Across the story we should have
the main arc going where the attention should be and the supporting details / supporting animation that adds subtle loveliness, like a bird flying, is
not the core of the story, so its visual should be a bit more subtle but yet alive ... some supporting environment can be drawn a bit more subtle.
The style is too rough and messy, a lot of rough lines, not looking clean at all. It should be cleaner, more refined, gentle, to feel a lot more
premium. We don't have the shadows much and the light is weirdly put; lighting and shadows should be gentle but should exist."
Earlier the owner judged G5 "way too empty" and approved density; the new rules (${V}/docs/OWNER_PLAYBOOK.md, Visual style + Storyboard) keep "feel
alive" but add: CLEAN premium lines, gentle light and shadow, ATTENTION HIERARCHY (subtle supporting life), ONE FLOWING STORY with clean transitions.
MEASURED DIAGNOSIS (read all four; they carry the numbers, the code parameters and concrete proposals): ${R}/story.md (cut-by-cut carry scores, the
thread-object rule, the transition grammar, a full proposal for v3's flow), ${R}/hierarchy.md (tiers with values), ${R}/line.md (why it reads rough,
the CLEAN LINE SPEC, the code changes), ${R}/light.md (the light and shadow system, the code approach). The retro is also writing the generic craft spec ${V}/docs/look/CRAFT.md and
the process verdict ${V}/docs/retro/2026-10-27_v3_retro.md: read them when they exist; where they and these notes differ, CRAFT.md wins.
THE FILM: ${V}/src/v3/film/ (entry ${V}/src/entry-v3-film.tsx: Film3 / Film3Final / Film3Shot / Film3-<ID>; engine ${V}/src/lib/Film.tsx with
transitions cut / matchcut / camera-continuous / push-through / foreground-wipe / unbuild; kit ${V}/src/v3/film/kit/ + README; panels in scenes/; how-to
${V}/docs/G5_BLOCKING.md incl. the chunked render recipe in section 8b). Shared lib code (${V}/src/lib) is also used by v1 and video 2: every change there
must be OPT-IN (a flag or a new export) so other films render exactly as before.
WHAT STAYS: the voice and its timing, the core line, the story beats in order (the script's lines), the Autumn Ember palette, blue hour and first snow,
Pip as the companion (but in the hierarchy). WHAT MAY CHANGE: shot boundaries (merge shots, continuous cameras), transitions, staging, what is drawn
and how prominently, the lines, the light.`

phase('Design')
const FLOWS = [
  'MAXIMUM CONTINUITY: as close to one continuous journey as the voice allows (one home place, every other place entered through a sub-frame of it and left back through it; continuous cameras; object carries)',
  'CLARITY FIRST: the fewest places and the simplest, most readable carriers; every beat reads with the sound off on a phone; the price tag always on screen as the thread',
  'BEST RESULT FOR THE BUILD: keep the strongest G5b sets and moments (the nook, the S9 pull-back, the queue) and connect them with clean carriers; least rework for the most coherence',
]
const [flows, lookPen, lookLight] = await Promise.all([
  parallel(FLOWS.map((f, i) => () => agent(`${CTX}
YOU ARE FLOW DESIGNER ${i + 1}; your priority: ${f}. Starting from the proposal in ${R}/story.md section 5, design video 3's new flow on the LOCKED
voice: the sequences (merged shots) with exact times on the word timings, each join with its carrier (grammar A-F in story.md) and its exact handoff
(what is where on screen, at what size, on which word), the thread object's schedule (your price tag: on screen when, where its screen home is while the
shot is elsewhere, when it ticks), the one home place and how other places are entered and left, "you" and Pip (one drawing of you or POV only; Pip
crosses joins or stays home), and per sequence the HIERARCHY (what is the subject, what is support, what is environment) and the LIGHT (key light
direction per place). Say what you reuse from the G5b sets. At most 60 lines. Do not edit files.`, { label: 'flow:' + (i + 1), phase: 'Design', effort: 'max' }))),
  agent(`${CTX}
YOU ARE LOOK ENGINEER 1: THE CLEAN PEN AND THE TIERS. Implement ${R}/line.md section 3-4 (the CLEAN LINE SPEC) and the tier values from
${R}/hierarchy.md section 4 as OPT-IN code: a clean pen (one closed subpath per shape, round joins, no jitter, overshoot, breaks or double strokes,
exact fill registration, smooth tapered or uniform weights by tier), and a tier system the kit pieces accept (e.g. tier: 'subject' | 'support' |
'environment' -> line weight or no line, contrast pulled toward the background, saturation, detail, motion amplitude), switched on for the v3 film
entries only (as palette.ts applies the palette). Apply it across the v3 kit (${V}/src/v3/film/kit/) so the existing panels pick it up, with sensible
defaults (people in crowds, birds, snow, far town = environment or support; your tag, laptop, phone, the data center when it is the subject = subject).
Then render before/after stills of O1 at 2.0 s, S9 at 22.4 s and S13 at 32.9 s (Film3Shot, --scale=0.5) to ${OUT}/look/ and check: cleaner, calmer,
the subject first, still warm and alive. Typecheck; v1 (src/entry-film.ts) and v2 entries must still typecheck and look unchanged. Update the kit README
("Clean pen and tiers"). ${GIT}
REPORT (at most 12 lines): the API (flags, tier prop), defaults, the before/after sheet path, what is open.`, { label: 'look:pen+tiers', phase: 'Design', effort: 'max' }),
  agent(`${CTX}
YOU ARE LOOK ENGINEER 2: LIGHT AND SHADOW. Implement ${R}/light.md sections C-D as a v3 kit module (${V}/src/v3/film/kit/Light.tsx + README section):
key-light direction per place (the nook: lamp + window; the shop; the street at blue hour; the roof), flat soft-edged form shadows and cast shadows as
shapes (colour = the surface darkened and hue-shifted, never grey; no blur filters), contact shadows under objects and people, light pools that agree
with their source, rim light, lit windows at dusk. Do NOT edit other kit files or panels (look engineer 1 is changing the kit pens right now): build
the module and a demo composition (register it in ${V}/src/entry-v3-kit.tsx) that shows the nook desk props and a street corner lit with it; render it
to ${OUT}/light/ and check it against the cozy references' "short soft coloured shadows". Typecheck. ${GIT}
REPORT (at most 10 lines): the API, how a panel applies it (3-line example), the demo path, open items.`, { label: 'look:light', phase: 'Design', effort: 'max' }),
])
const FL = flows.map((f, i) => `### Flow designer ${i + 1}\n${f || 'FAILED'}`).join('\n\n')

const judge = await agent(`${CTX}
THREE FLOW DESIGNS for video 3 are below. Judge them on: one flowing story the owner can follow (the main arc always visible, clean carriers at every
join, no unrelated jumps), the attention hierarchy, the sound-off phone read, staying on the locked voice, and what the build can deliver well (fewer,
better shots beat many). Pick ONE with grafts and write the BUILD SPEC to ${V}/docs/v3/flow_v2.md (at most ~120 lines): the sequences (ids SQA, SQB, ...
with exact s/e on the word timings), every join (type, carrier, the exact handoff positions/sizes/times so two builders meet frame-exactly), the thread
tag schedule, "you" and Pip, the hierarchy and the light per sequence, which G5b set pieces each sequence reuses, and the old panel ids each sequence
replaces. Commit it. ${GIT}
REPORT (at most 10 lines).

${FL}`, { label: 'flow judge', phase: 'Design', effort: 'max' })

phase('Structure')
const structure = await agent(`${CTX}
YOU ARE THE ENGINE AGENT. The new flow is in ${V}/docs/v3/flow_v2.md (the judge's report below). Restructure the film to it, without losing the G5b
work: (1) ${V}/src/v3/film/scenes.json gets the new sequences (ids, s/e, transitionIn types the engine supports; add engine support OPT-IN in Film.tsx
only if a join needs a type it lacks, e.g. a match zoom or an object carry across a join, and document it); (2) the registry scenes/index.ts maps each
sequence id to a new file scenes/<SQ>.tsx that, as a starting placeholder, plays the OLD panels it replaces inside it (so the film still plays end to
end), each in its own time window; (3) old panel files stay (the sequence builders reuse their sets); (4) the gate check and the chunk list use the new
ids; (5) a short "Sequence contract" section in ${V}/docs/G5_BLOCKING.md (how a sequence owns its camera and its joins, how two builders meet at a
join). Typecheck; render a 0.25-scale smoke of Film3 to ${OUT}/smoke.mp4 and check it plays. ${GIT}
REPORT (at most 10 lines): the new scene list, engine changes, open items.
JUDGE:
${judge || 'FAILED'}`, { label: 'engine', phase: 'Structure', effort: 'max' })

phase('Pilot')
const pilot = await agent(`${CTX}
YOU ARE THE PILOT BUILDER. Build sequence SQA (the first sequence in ${V}/docs/v3/flow_v2.md, from frame 0) in the NEW flow and the NEW look: the clean
pen and tiers (kit README "Clean pen and tiers"), the light and shadow module (kit/Light.tsx), the hierarchy (one focus at a time: the subject strong,
supporting life subtle but alive, environment softer), the joins exactly as the spec says (its outgoing join must hand over frame-exactly to the next
sequence's spec). The opening rule still holds (frame 0 = the scene being drawn, colour floods in, voice from frame 1, never still; the loop returns to
the bare-line frame 0). Reuse the G5b sets where the spec says. Check with stills at 0.5 and a 0.25 phone look against the G5b cut at the same times
(is it calmer, clearer, cleaner, better lit, and still alive and warm?), and with python3 scripts/qa/density.py (fullness must stay near the approved
bar; motion should now be concentrated on the subject). Render SQA alone at FULL size, 60 fps, with the voice to ${OUT}/pilot_SQA.mp4. ${GIT}
REPORT (at most 12 lines): what changed vs G5b, the numbers, the render path, open items.
ENGINE:
${structure || 'FAILED'}`, { label: 'pilot SQA', phase: 'Pilot', effort: 'max' })

const review = await agent(`${CTX}
YOU ARE AN INDEPENDENT REVIEWER of the SQA pilot (${OUT}/pilot_SQA.mp4; the builder's report below). You did not build it. Judge it ONLY against the
owner's feedback: is there one clear story with clean transitions; is it obvious where to look at every moment (one focus, supporting life subtle but
alive); is it clean, refined, gentle and premium (no rough lines); are light and shadow gentle but present and consistent; is it still warm, cozy and
alive (not empty)? Extract frames yourself (and a strip around every join). At most 8 problems, most severe first, each with time, screen area and the
concrete fix. Do not edit files.
BUILDER:
${pilot || 'FAILED'}`, { label: 'pilot review', phase: 'Pilot', effort: 'max' })

const fix = await agent(`${CTX}
YOU ARE THE PILOT FIXER. Fix every real problem the reviewer found in SQA (skip one only if wrong; say why), re-check, re-render SQA at full size with the
voice to ${OUT}/pilot_SQA.mp4 and copy it to ${V}/deliverables/v3/v3_rework_pilot.mp4, plus a before/after sheet (G5b vs pilot at the same 6-8 times) to
${OUT}/pilot_before_after.jpg. ${GIT}
REPORT (at most 10 lines).
REVIEW:
${review || 'FAILED'}`, { label: 'pilot fix', phase: 'Pilot', effort: 'max' })

return { flows: FL, lookPen, lookLight, judge, structure, pilot, review, fix }
