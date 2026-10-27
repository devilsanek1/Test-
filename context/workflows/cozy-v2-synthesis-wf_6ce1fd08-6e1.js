export const meta = {
  name: 'cozy-v2-synthesis',
  description: 'Fold both of the owner\'s cozy references (painterly street from above; painterly riverside) into Coziness v2 (COZY_AND_SCALE.md), refine LIFE_AND_DENSITY.md (fullness first) and density.py (cozy-hold metrics), adversarial critic + fix, then a v3 application note',
  phases: [
    { title: 'Write', detail: 'cozy librarian (docs) and meter upgrade (tool) in parallel' },
    { title: 'Critic', detail: 'adversarial check against the measurements and the owner rules' },
    { title: 'Fix', detail: 'apply the critic\'s findings' },
    { title: 'Apply', detail: 'how Coziness v2 lands in video 3' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'
const GIT = `GIT: commit only the files you changed (git add <paths>, never -A or .); if .git/index.lock exists wait 5 s and retry; never pull, merge,
rebase, reset, stash or checkout; message ending with exactly these two lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
then run once: git push origin HEAD:video-production (if rejected, leave it). The repo is PUBLIC: no email addresses; never copy reference clips or
their frames into the repo (they stay in ${SCR}).`

const CTX = `
THE OWNER (2026-10-26) sent two references for COZINESS AND COMFORT: "really figure out what about the scene composition / movements / texture /
camera / details brings out this feeling. This is a recurring topic which we need to evolve, like the ratio of width / height of a building on a shot";
on the second: "it doesn't feel empty at all". Earlier today: "the scenes are way too empty" (our v3 G5 cut), "less prescriptive on the amount of
objects, but having a scene feel alive is absolutely the key", "even the Arcane scene felt alive because of the density of the city, the details, the
clouds and birds". Playbook rules: ${V}/docs/OWNER_PLAYBOOK.md (Visual style: feel alive; coziness evolves one measured reference at a time; warm
never sickly; paper edges never at the top or beside the caption band; very subtle texture).
THE MEASURED FINDINGS (read them all; numbers are in these files):
- Reference A, a painterly street seen from above (traffic under flowering trees): ${SCR}/cozy2/motion.md, ${SCR}/cozy2/composition.md,
  ${SCR}/cozy2/colour.md (strip ${SCR}/cozy2/strip.jpg).
- Reference B, a painterly riverside (dense layered buildings, people sitting by the water, a few cyclists): ${SCR}/cozy3/motion.md,
  ${SCR}/cozy3/composition.md, ${SCR}/cozy3/colour.md, ${SCR}/cozy3/fullness.md (strip ${SCR}/cozy3/strip.jpg).
Headline from B: our meter rates B FAR on motion (1.2 events/s) yet it never feels empty; it wins on fullness (flat 9 %, detail 62 %); our v3 G5 had
twice the events but flat 61 %, detail 16 %: emptiness is a fullness problem, not an event-count problem. B's camera floats (a slow 2D slide,
8-15 px/s at 1080, legs every 0.6-1.5 s) while our holds used an invisible 1.4 % push-in. A's camera is locked; life passes through calmly.
OUR DOCS: ${V}/docs/look/COZY_AND_SCALE.md (enclosure H:W ratios, prospect-refuge, cozy doses, K1-K10, scale), ${V}/docs/look/LIFE_AND_DENSITY.md
(feel alive; numbers are warnings), ${V}/docs/look/CINEMATIC_GUIDE.md (camera; "Scale cues"), ${V}/scripts/qa/density.py (the meter).`

phase('Write')
const [docs, meter] = await parallel([
  () => agent(`${CTX}
YOU ARE THE COZY LIBRARIAN. Evolve the coziness rules with both references, generic for every video:
1. ${V}/docs/look/COZY_AND_SCALE.md: add "Coziness v2" (or evolve the existing cozy sections in place; keep what still holds, refine what the
   references refine, add what is new), with numbers and a flat-colour translation. Cover at least: an angle-independent enclosure measure (enclosing
   mass : open field on screen, with the eye-level H:W ratio as its special case); the two new doses: BALCONY (high angle from a window, no sky, a lid
   of trees or facades cut by the top, a C-curve with a hidden far exit, lid / life / floor bands) and RIVERSIDE (eye level across water: the facade wall
   as the backdrop, the water as a moat, life in one lane); the detail gradient (busy edges and far side, calm centre or floor); how life moves in a cozy
   beat (passes through sideways at real-world speeds in body heights per second, 1-5 movers, steady change, people at rest next to motion, nothing
   coming at the viewer); the camera for cozy holds (locked or a slow 2D float, never a zoom), replacing invisible push-ins; colour and light (one calm
   field, a complementary warm accent where the eye rests, short soft coloured shadows, tinted whites, rare warm darks) and texture (large fields flat,
   small organic things textured; very subtle; paper edges only below the caption band and never at the top). Keep it a recipe for a FEELING with numbers
   as guides, never a quota. Add a short "References" log line per reference (described in words, no frames) so the topic keeps evolving.
2. ${V}/docs/look/LIFE_AND_DENSITY.md: refine with "fullness first, motion second" (the world's density and detail make a frame full even when little
   moves; motion only has to prove the place is alive) and the meter caveat (one long walk counts as one event; cozy holds are checked with moving
   figures per frame, frames without motion, steadiness of change).
${GIT}
REPORT (at most 10 lines): what changed, where, and any contradiction with existing rules you resolved.`, { effort: 'max', label: 'cozy librarian', phase: 'Write' }),
  () => agent(`${CTX}
YOU ARE THE METER ENGINEER. Upgrade ${V}/scripts/qa/density.py ADDITIVELY (defaults and existing output unchanged; other agents are using it right now):
add cozy-hold metrics per shot: camera motion removed first (a global 2D shift per frame), then moving blobs per frame (a proxy for moving figures),
the share of frames with no moving blob, the steadiness of change (coefficient of variation of changed pixels per frame), and the camera's own float
speed in px/s at 1080. Validate on reference B (${SCR}/cozy3/ref.mov; expect ~2-4 movers, 0 empty frames, CV ~0.14, float ~11 px/s at 1080), on
reference A (${SCR}/cozy2/ref.mov, 0-7.9 s; expect 1-5 movers, mean ~3, camera 0) and on our v3 G5 cut (${V}/deliverables/v3/v3_g5_blocking.mp4 with
${V}/src/v3/film/scenes.json). Document the new flags in the script header and add a line to ${V}/docs/look/research/density_numbers.md with the three
results. ${GIT}
REPORT (at most 8 lines): the new metrics and the three validation results.`, { effort: 'max', label: 'meter upgrade', phase: 'Write' }),
])

phase('Critic')
const critic = await agent(`${CTX}
YOU ARE THE ADVERSARIAL CRITIC. The librarian evolved ${V}/docs/look/COZY_AND_SCALE.md and ${V}/docs/look/LIFE_AND_DENSITY.md (report below). Read
both docs and the measured findings, and find at most 8 real problems, most severe first: a number that misquotes the measurements; a rule that
contradicts another rule in the same or another doc (e.g. a sky share vs the no-sky balcony; the camera float vs "holds breathe 1.5-2 %"; motion
cadence targets vs steady cozy motion); a rule that breaks an owner rule (paper edge at the top, a quota instead of a feeling, sickly colours); a rule
an agent could not apply (vague, no number, no flat-colour translation); bloat that hides the rules. For each: the doc and section, the problem, and the
exact fix. If the docs are sound, say so. Do not edit files. At most 30 lines.

LIBRARIAN REPORT:
${docs || 'FAILED'}`, { effort: 'max', label: 'critic', phase: 'Critic' })

phase('Fix')
const fix = await agent(`${CTX}
YOU ARE THE LIBRARIAN AGAIN. Apply the critic's findings below to ${V}/docs/look/COZY_AND_SCALE.md and ${V}/docs/look/LIFE_AND_DENSITY.md (and to
CINEMATIC_GUIDE.md or STORYBOARD_STYLE.md only where a contradiction lives there). Skip a finding only if it is wrong, and say why. ${GIT}
REPORT (at most 8 lines).

CRITIC:
${critic || 'FAILED'}`, { effort: 'max', label: 'fix', phase: 'Fix' })

phase('Apply')
const apply = await agent(`${CTX}
YOU ARE THE V3 ART DIRECTOR. Video 3 ("AI is making your next laptop pricier"; G5 cut ${V}/deliverables/v3/v3_g5_blocking.mp4; locked panels in
${V}/docs/v3/storyboard_g3.md; the dressing plan ${V}/docs/v3/density_plan_g5b.md; the S9 scale plan ${V}/docs/v3/s9_scale_plan.md) is getting a
density + life pass (pilot lanes are dressing O1 and S4 right now; the rest follows). Write ${V}/docs/v3/cozy_v2_application.md (at most ~45 lines):
how Coziness v2 (the evolved COZY_AND_SCALE.md and LIFE_AND_DENSITY.md) lands in video 3, panel by panel where it matters: the home-base nook as the
refuge and its window as the prospect (could the view out be a living street seen from above, the BALCONY dose through glass, with people and traffic
passing calmly in the snow?); which holds get the slow camera float instead of the push-in; where the motion lane sits in each cozy panel; where people
rest next to motion; the colour and light notes in Autumn Ember (coloured shadows, tinted whites, a warm accent where the eye rests); what NOT to change
(the locked story, camera moves, cuts). Mark anything that overrides density_plan_g5b.md. ${GIT}
REPORT (at most 8 lines).`, { effort: 'max', label: 'v3 apply', phase: 'Apply' })

return { docs, meter, critic, fix, apply }
