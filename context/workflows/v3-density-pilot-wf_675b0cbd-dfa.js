export const meta = {
  name: 'v3-density-pilot',
  description: 'v3: make the G5 sets full and alive like reference 1 (France) and v1: measure density, write the generic rules + per-panel plan, build a dressing kit, dress two pilot panels (O1, S4) and render a full-res pilot',
  phases: [
    { title: 'Measure', detail: 'a density meter (scripted, ref vs v1 vs v3) and a set-dressing analyst' },
    { title: 'Spec', detail: 'an art director: generic LIFE_AND_DENSITY.md + the v3 per-panel plan' },
    { title: 'Kit', detail: 'the dressing and life kit in Autumn Ember' },
    { title: 'Pilot', detail: 'O1 and S4 dressed to reference density, a full-res 60 fps pilot clip' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/life'

const GIT = `GIT: commit only your own paths (git add <paths>, never -A or .), message ending with exactly these two lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
If .git/index.lock exists, wait 5 s and retry. Then run once: git push origin HEAD:video-production; if rejected, leave it (the orchestrator
merges). Never pull, merge, rebase, reset, stash or checkout. Never commit video/out or scratchpad files. The repo is PUBLIC: no email addresses.`

const CTX = `
THE OWNER'S VERDICT on video 3's G5 cut (${V}/deliverables/v3/v3_g5_blocking.mp4, sheet ${V}/review/v3_g5/sheet.jpg): "getting there, but the
scenes are WAY TOO EMPTY. Compare with the very first reference video about France and our first production video about PHP: those feel a lot more
ALIVE ... if those are the final versions it's not good enough; the quality and smoothness is not there." New playbook rule (OWNER_PLAYBOOK.md,
Visual style): every frame is FULL and ALIVE at the density of reference 1 and v1: dressed sets, people (back view) near and far, layered depth, a
recurring living character, constant motion (>= 5 medium visual events per second, no gap over 1 s, an idle layer always on); big flat empty fields
and an object alone on a blank wall are failures. Density belongs to the set build, not to polish.
THE REFERENCES: reference 1 (France) ${V}/assets/ref/reference.mp4 (31.5 s; frames in ${V}/assets/ref/; analysis ${V}/docs/style_bible.md and
${V}/docs/motion_spec.md, esp. sections 5, 6 and 9 with the measured change density); v1 (PHP) ${V}/deliverables/v1/php2shell_final.mp4 (55.4 s;
built with the house engine ${V}/docs/ENGINE.md: crowds, the sun as a character, the mascot Pip, kit buildings, string lights, walkers).
A side-by-side sheet (row 1 reference, row 2 v1, row 3 our v3 G5): ${SCR}/compare.jpg.
VIDEO 3 G5 FILM: ${V}/src/v3/film/ (entry ${V}/src/entry-v3-film.tsx: Film3 60 fps, Film3Shot {id}, Film3-<ID>; how-to ${V}/docs/G5_BLOCKING.md;
kit ${V}/src/v3/film/kit/ + README: Autumn Ember, blue hour with first snow). The STORY, the voice, the cut points, each panel's one idea and its
camera are LOCKED (${V}/docs/v3/storyboard_g3.md, ${V}/docs/v3/camera_plan_g3.md): we add density and life AROUND them, we never restage.
Keep the caption band (screen y ~290-600) calm enough to read, and the platform UI zones (top, bottom, right rail) free of key information.`

phase('Measure')
const [meter, dressing] = await parallel([
  () => agent(`${CTX}
YOU ARE THE DENSITY METER. Build a reusable, scripted density check so "too empty" is caught before the owner sees a cut. Work in ${V}.
1. video/scripts/qa/density.py (generic; any MP4, optional scene list JSON with s/e to report per shot): (a) motion: medium change events per second
   with the motion_spec section 9 method (space-time change blobs >= ~500 voxels at 1/4 res over 5 frames, onsets; frame-rate independent: work in
   seconds), the longest gap between medium events, the share of near-static frames (< 0.1 % pixels changing) and the longest static run;
   (b) fullness: per sampled frame, the share of the frame that is FLAT (e.g. 48 px tiles with almost no edges and one colour) excluding the caption
   band, the count of distinct small objects (connected edge components above a size), and the share of tiles with fine detail. Print one table per
   shot and a film summary, with PASS / WARN against targets you derive from the references.
2. Run it on reference 1, on v1 and on v3 G5 (scene lists: v3 ${V}/src/v3/film/scenes.json; v1 ${V}/src/data/scenes.json; reference: whole file or
   the scene timeline in motion_spec section 2). Write the numbers and the derived targets to video/docs/look/research/density_numbers.md (at most 60
   lines: the three films side by side, per-shot rows for v3, and the targets with the reason for each number).
3. Wire it into video/scripts/qa/gate_check.py as an optional --density flag (WARN, not FAIL, unless the film is far under target).
${GIT}
REPORT (at most 10 lines): the headline numbers (ref vs v1 vs v3: events/s, longest gap, flat share, objects per frame), the targets, the files.`,
    { label: 'density meter', phase: 'Measure' }),
  () => agent(`${CTX}
YOU ARE THE SET-DRESSING ANALYST. Look closely at reference 1 and v1 (sample ~10 frames of each at key moments; read style_bible.md, motion_spec.md
sections 5, 6 and 9, and ENGINE.md sections 1, 2b and 10) and at our v3 G5 sheet, and write down concretely WHAT makes the references full and alive
and v3 empty. Cover: (1) the inventory of dressing per frame (buildings with windows and balconies, signs, notices, plants, bikes, scooters, lamps,
wires, birds, crates ...) and how much of the frame each region (top third, middle, bottom) carries; (2) people: where and how big (e.g. the row of
backs cut by the frame bottom as a foreground "audience", the crowd converging on the horizon, the walkers), how many per frame, what they do;
(3) the recurring living character (the sun, the cat; v1's mascot Pip) and what it does in each shot; (4) idle motion and secondary motion (what moves
when nothing is being built, per motion_spec section 9); (5) how information (charts, notices, numbers) sits IN the world (a noticeboard on a street
wall with people looking at it) instead of on a blank card; (6) line and texture density (hatching, small detail lines, misregistered fills) at the
draft vs final level; (7) why v3 G5 is empty: list, per v3 panel, what is missing compared with the references. Save notes to ${SCR}/dressing.md and
return them (at most 80 lines, concrete, with frame times). Look at no more than ~12 images. Do not edit repo files.`,
    { label: 'dressing analyst', phase: 'Measure' }),
])

phase('Spec')
const spec = await agent(`${CTX}
YOU ARE THE ART DIRECTOR. From the meter's numbers and the analyst's notes (below), write two documents. Work in ${V}.
1. video/docs/look/LIFE_AND_DENSITY.md, the GENERIC rules for every video (at most ~120 lines): the targets with numbers (motion events/s, longest gap,
   flat share, objects and people per frame, regions), the dressing inventory by setting (street, interior, exterior/industrial, information inserts),
   people rules (back view, sizes by depth, the foreground row of backs, crowds), the recurring living character (what it is per video and its jobs:
   reacting, pointing the eye, idling), the idle layer and secondary motion, information in the world (never a card on a blank wall), what may stay
   calm (the caption band, one breath beat), how to check (scripts/qa/density.py), and at which gate each part is built (density and people at G5;
   motion life at G5 as an idle layer, refined at G6). Link it from video/docs/PIPELINE_V2.md's studio toolkit table (one row) and from
   video/docs/G5_BLOCKING.md (one line).
2. video/docs/v3/density_plan_g5b.md: for EACH of the 15 v3 panels (O1, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16; S9 is the pull-back),
   a concrete dressing + life plan that keeps the panel's locked idea, framing and camera: what to add (objects, people, the living character, window
   life, weather), what moves and when (the idle layer, secondary motion, reactions on the voice's words), and what stays calm. Interiors: how the
   nook gets alive (snow and neighbours' lit windows with silhouettes outside, steam, string lights, books, plants, a pinboard, the living character).
   Information panels (S4, S6, S11): put the chart IN the world. Exteriors (S9, S10, S14): streets with people, cars, lit windows, workers, trucks.
   Choose the recurring living character for v3 and justify it in 3 lines (the channel's mascot Pip, the purple elephant from v1 and the profile
   picture, ${V}/src/lib/mascot and ${V}/docs/mascot.md, redrawn in Autumn Ember; or a cat like the reference's), with its job per panel.
   End with the KIT LIST: every new kit piece the lanes need, with sizes and variants.
${GIT}
REPORT (at most 10 lines).

METER:
${meter || 'FAILED'}

ANALYST:
${dressing || 'FAILED'}`, { label: 'art director', phase: 'Spec' })

phase('Kit')
const kit = await agent(`${CTX}
YOU ARE THE KIT AGENT. Build the dressing and life kit from the art director's KIT LIST in ${V}/docs/v3/density_plan_g5b.md and the rules in
${V}/docs/look/LIFE_AND_DENSITY.md, in the Autumn Ember house style (match ${V}/review/look/v3_g4/nook_C_warm.png and the existing kit), into
${V}/src/v3/film/kit/ (+ index.ts, README). Prefer the house engine's people and crowds (lib/kit Person, Crowd: back view, depth ink, rim) recoloured
by ${V}/src/v3/film/palette.ts if they draw correctly in Ember; the living character redrawn in Ember with a few poses and an idle (blink, ear or tail,
bob) and reactions; window life (neighbours' windows with silhouettes that switch on and move, snowfall, chimney smoke); room clutter (books, plants,
posters, string lights, a pinboard with notes, a cork board for the charts); street and industrial life (walkers, cars with lights, lamp posts,
workers, forklifts, crates, steam). Every piece: position/size props, a seed, an optional build time, and its own idle motion where it has one,
driven by seconds (useTime), deterministic, flat (no opacity fades). Update KitSheet3 (${V}/src/entry-v3-kit.tsx) and render it at --scale=0.5 to
${SCR}/kit_sheet_life.png; look at it once and fix what doesn't match the style frame. Typecheck.
${GIT}
REPORT (at most 10 lines): the new exports, the living character, the sheet path, what is open.`, { label: 'life kit', phase: 'Kit' })

phase('Pilot')
const PILOT = `
YOU ARE A PILOT LANE. Dress your panel to reference density and give it a living idle layer, following ${V}/docs/look/LIFE_AND_DENSITY.md and your
panel's section of ${V}/docs/v3/density_plan_g5b.md, with the kit (README). Keep the locked idea, framing, camera and every timed beat; add around them.
You own only your panel files (video/src/v3/film/scenes/<ID>.tsx and <ID>_*.tsx); shared changes go under REQUESTS in your report.
Check: typecheck; stills via Film3Shot at --scale=0.5 at 4-6 times across the panel, compared with the reference sheet ${SCR}/compare.jpg (is it as full
and alive?), a 0.25 phone look; then render your panel alone at 60 fps, full size (1080x1920), with the voice (Film3-<ID> composition) to ${SCR}/<ID>.mp4
and run python3 video/scripts/qa/density.py on it: it must meet the targets in LIFE_AND_DENSITY.md (fix and re-run until it does, or say why not).
Look at no more than ~10 images.
${GIT}
REPORT (at most 10 lines): what you added, the density numbers before -> after, open items, REQUESTS.`

const pilots = await parallel([
  () => agent(`${CTX}
${PILOT}
YOUR PANEL: O1 (0-5.80), the HOOK (and S15, which reuses O1's set file O1_set.tsx: keep S15 working). The first 3 s are the most important of the film:
the bare-line frame 0 being drawn, the colour flood, then a frame packed with life (the nook dressed, the living character, snow and neighbours'
windows outside, steam) while the sticks fly and the tag ticks. Keep the loop (O1 at t < 0 = the bare-line state) working.`, { label: 'pilot O1', phase: 'Pilot' }),
  () => agent(`${CTX}
${PILOT}
YOUR PANEL: S4 (5.80-9.48), the price chart, today a lone card taped to an empty wall. Put the chart IN the world (per the plan), with people and
life, while the line still draws downhill with the voice and stays readable at phone size. S6 (11.48-16.60) is "exactly the S4 frame plus the hook
up and +9.7%": keep S6 a match of S4 (S6 may import S4's set; update it so the match holds).`, { label: 'pilot S4', phase: 'Pilot' }),
])

const pilotClip = await agent(`${CTX}
YOU ARE THE PILOT RENDERER. Two pilot lanes dressed O1 (and S15) and S4 (and S6). Work in ${V}.
1. Apply any small REQUESTS from their reports that touch shared files (kit, scenes.json), unless they would change the locked story.
2. Typecheck, then render Film3 frames 0 to 12.0 s (O1, S4, S5, S6 start) at 60 fps, FULL size 1080x1920, with the voice, to
   video/deliverables/v3/v3_g5b_pilot.mp4 (--frames=0-719, --concurrency=3, long timeout: background and poll). Run scripts/qa/density.py on it.
3. A before/after sheet (the G5 cut vs the pilot, the same times: 0.15, 1.0, 2.0, 3.0, 4.5, 7.0, 9.0 s) to ${SCR}/pilot_before_after.jpg; look at it
   once at phone size.
${GIT}
REPORT (at most 8 lines): the deliverable, the density numbers (G5 vs pilot vs reference), anything open.

PILOT REPORTS:
${pilots.map((p, i) => `### ${i ? 'S4' : 'O1'}\n${p || 'FAILED'}`).join('\n\n')}`, { label: 'pilot render', phase: 'Pilot' })

return { meter, dressing, spec, kit, pilots, pilotClip }
