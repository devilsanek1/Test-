export const meta = {
  name: 'v3-g5-blocking',
  description: 'v3 G5 blocking cut: film engine + Autumn Ember kit, then 6 panel lanes build real sets on the locked board, then assemble, gate check, one continuity fix, 60 fps render',
  phases: [
    { title: 'Setup', detail: 'engine (Film3 entry, scenes, captions, board placeholders, gate check) and kit (palette + shared props) in parallel' },
    { title: 'Lanes', detail: 'one agent per group of panels replaces the board placeholders with real sets' },
    { title: 'Assemble', detail: 'full 60 fps render, scripted gate check, one continuity fix round, deliverable' },
  ],
}

const REPO = '/home/user/Test-'
const V = REPO + '/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5'

const CTX = `
PROJECT: video 3 of a short-form explainer channel (TikTok/Reels/Shorts, 1080x1920). Core line: "AI is making your next laptop pricier."
We are at gate G5, the BLOCKING CUT (video/docs/PIPELINE_V2.md gate table): real sets and props at draft quality, FINAL camera, key poses,
NO edges / paper / texture; renders at 60 fps. The owner judges staging, readability at phone size, and transitions that play.

LOCKED (do not change story, cut points, shot content or transitions):
- G3 board animatic (owner: "okay fine, go ahead"): ${V}/public/v3/animatic.json (per panel: s/e times, camera from/to, every element with its
  timing, element moves, notes), the render ${V}/deliverables/v3/v3_g3_animatic_board.mp4, the panel table ${V}/docs/v3/storyboard_g3.md and the
  camera plan ${V}/docs/v3/camera_plan_g3.md (one row per panel: idea, shot type, framing, cozy/scale element, move, readability note).
  The board is monochrome notation: translate it into a real set. Red pencil marks and the notes strip are board notation only (never in G5):
  a red focus circle becomes a production emphasis that fits the look (light, colour, a pop).
- Voice: ${V}/public/v3/voice.wav (41.15 s, 0.12 s lead) with word timings ${V}/public/v3/voice_words.json. Sound cues: animatic.json "sfx".
- Look: Autumn Ember (${V}/docs/v3/LOOK.md; ${V}/docs/look/palettes.json "9 Autumn Ember"). The APPROVED style frame is
  ${V}/review/look/v3_g4/nook_C_warm.png, drawn by ${V}/src/v3/StyleNook.tsx with the EMBER roles: match its drawing style (v1 house style:
  hand-drawn ink, flat fills, misregistered fills, no gradients). Owner rules: warm, never sickly (peach creams, terracotta, red-brown lines, a
  golden lamp pool, a saturated dusk-blue outside); one hero colour (burnt orange: the laptops and the price tag, 5-15 % of the frame), one dark
  anchor, at most one pop (the blue "Add to cart" / price-tag accent).
- House engine: ${V}/docs/ENGINE.md (section 1 the ten rules, 3 the scene template, 6 captions, 7 primitives, 10 kit) and ${V}/src/lib.
  Everything in seconds (useTime), deterministic (rng, never Math.random), flat (no blur, filters, gradients), no opacity fades.
  Cozy and scale: ${V}/docs/look/COZY_AND_SCALE.md; camera grammar: ${V}/docs/look/CINEMATIC_GUIDE.md (S1 rise-over reveal, "The opening").
- The opening rule: frame 0 is the scene being drawn (bare ink lines), colour floods in within ~0.3 s, voice from frame 1, never a still
  frame, one continuous shot; the film loops back to the bare-line frame 0.
- Captions own the caption band (screen y ~290-600): keep busy detail out of it. Platform UI covers the top, the bottom and a right rail.

FILES AND LANES: video/src/v3/film/ is the G5 film. The engine agent owns video/src/entry-v3-film.tsx, video/src/v3/film/Film3.tsx,
scenes.json, captions.json, scenes/index.ts and the optional props it adds to video/src/lib/Film.tsx. The kit agent owns
video/src/v3/film/palette.ts, video/src/v3/film/kit/** and video/src/entry-v3-kit.tsx. Each lane owns only its own panel files
video/src/v3/film/scenes/<ID>.tsx (plus new helper files named <ID>_*.tsx). Never edit another agent's files; a change you need in a shared
file goes in your report under "REQUESTS:" in one exact line each. Read video/docs/G5_BLOCKING.md (the engine agent writes it) and
video/src/v3/film/kit/README.md (the kit agent writes it) before building a panel.

GIT: commit only your own paths (git add <paths>, never -A or .), message ending with exactly these two lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
If .git/index.lock exists, wait 5 s and retry. Then run once: git push origin HEAD:video-production; if it is rejected, leave it (the
orchestrator merges). Never pull, merge, rebase, reset, stash or checkout. Never commit anything under video/out or the scratchpad.

RENDERS: 60 fps, so frame = round(t * 60). Check stills at --scale=0.5 (and a 0.25 phone-size look); write them under ${SCR}/<your lane>/.
Look at no more than ~10 images in your session (contact sheets count as one). Never render the whole film at full size.
The repo is PUBLIC: never write an email address into a file. No Arcane footage or frames anywhere.
REPORT: your final message is at most 12 lines: what you built (files), what you checked (with the sheet path), what is open, then REQUESTS.
`

phase('Setup')
const [engine, kit] = await parallel([
  () => agent(`${CTX}
YOU ARE THE ENGINE AGENT. Build the G5 film shell so the whole film plays end to end from minute one, with each panel a separate file
that a lane replaces. Work in ${V}.
1. video/src/entry-v3-film.tsx: import './v3/film/palette' FIRST (the kit agent fills it; it exists as a stub), then register:
   - "Film3": 1080x1920, fps 60, duration ceil(41.15 * 60) frames, renders Film3.
   - "Film3Shot" (props {id}): one panel alone with its captions and its slice of the voice (like SceneOnly in src/Main.tsx), for lane previews.
2. video/src/v3/film/Film3.tsx wraps the house sequencer <Film> (src/lib/Film.tsx) with v3 data. Add only OPTIONAL props to Film.tsx so v1
   renders exactly as before (e.g. audioSrc, sfx list played like SketchReel does, a burned-in draft label). The draft label: small, mid
   grey, bottom-left outside the caption band and the UI rail: "G5 · <panel id> · <timecode>", so the owner can name a shot in feedback.
3. video/src/v3/film/scenes.json from animatic.json: panels O1, S4, S5, S6, S7, S8, S9, S9b, S10, S11, S12, S13, S14, S15, S16 with their
   s/e; every transitionIn a cut (keep the board's labels in note). Drop the board's LOOP panel: S16 ends at 41.15 with the house loop,
   transitionOut {type: 'unbuild', loop: true, dur: 0.3}: S16 un-builds and reveals O1 underneath at its t < 0 bare-line state (the lane for
   O1 draws that state), so the film loops to the bare-line frame 0. Support a per-panel captionTone (dark ink on light, light on dark skies).
4. video/src/v3/film/captions.json in the house CaptionBeat format (see src/data/captions.json and scripts/gen-captions.mjs), built from
   voice_words.json: pop captions (playbook), pages of 1-2 lines of at most ~20 characters per line, split on phrase and sentence
   boundaries (the board's 16-character fragments read badly with the sound off), highlights on the key words (pricier, AI data centers,
   memory chips, first dibs, five times, pass it on, next laptop's price tag). Frame 0 shows the core line in words ("AI is making your
   next laptop pricier.") until 3.37 s, together with the spoken captions, both inside the caption band; follow the style frame's caption
   look (dark ink on the wall, the highlight box).
5. Board placeholders: video/src/v3/film/scenes/<ID>.tsx for all 15 panels, each exporting the scene component the registry expects; the
   placeholder draws that board panel with SketchReel's ShotView (src/v3/SketchReel.tsx) at board time shot.s + local time, so Film3 plays the
   locked board inside the Film engine until a lane replaces the file. video/src/v3/film/scenes/index.ts imports all 15 statically.
   Put a short header comment in each placeholder: "Lane: replace this file with the real set (docs/G5_BLOCKING.md)".
6. A scripted gate check, video/scripts/qa/gate_check.py (generic: any entry/composition + an MP4): duration vs the voice, fps 60, an audio
   stream, cut times detected in the MP4 vs scenes.json starts (within 1 frame), and caption pages inside the caption band (from the JSON).
7. Smoke test: typecheck (npx tsc --noEmit), render Film3 at --scale=0.25 to ${SCR}/engine/smoke.mp4 and run the gate check on it; look at a
   contact sheet of a few frames (frame 0 must show the core-line text; the loop seam must work).
8. Write video/docs/G5_BLOCKING.md, the GENERIC how-to for any video's G5 (not v3-specific): a film entry per video that imports its palette
   module first; panels as separate files that start as board placeholders; the scene contract a lane implements (props, local time, t < 0 for
   the first panel's line-art state, wipers if any, captionTone); lane rules (own files only, REQUESTS); the fastest preview commands for one
   panel (Film3Shot stills/sheets; reuse scripts/render-frames.mjs or scripts/sheet.sh where they help); the 60 fps notes; the gate check.
   Add one row to the studio toolkit table in video/docs/PIPELINE_V2.md: "G5 blocking | docs/G5_BLOCKING.md; src/entry-v3-film.tsx (template);
   scripts/qa/gate_check.py | ...". Commit (your paths only) and push as described.`, { label: 'engine', phase: 'Setup' }),
  () => agent(`${CTX}
YOU ARE THE KIT AGENT. Build the shared look and props every lane uses, so 15 panels built by 6 agents look like one film. Work in ${V}.
1. video/src/v3/film/palette.ts: apply Autumn Ember to the house theme tokens (src/lib/theme.ts: palette, skies, the tod relight steps, glow,
   caption colours) at module load, so the house kit (Ink, Fill, World, lib/kit, lib/cine) draws in Autumn Ember inside the v3 film entries,
   and export the EMBER role tokens for the sets (start from StyleNook's EMBER: wall, shelf, desk, lamp ring/core, trim, sky, dc, hero,
   anchor, pop, skin, sleeve ...). Verify the house kit really picks the values up (some modules may read colours at import time: the
   entries import palette.ts first; check, and fix by reading at render time inside your own kit if needed). Decide ONE time of day for the
   film (the style frame: a warm lamp-lit room, a saturated dusk-blue night outside) and the matching exterior sky for the outdoor panels
   (S9, S9b, S10, S14), and write the decision into the README.
2. video/src/v3/film/kit/*.tsx (+ index.ts exports), drawn like the style frame (lib/Ink, lib/Fill, lib/sketch, lib/kit where it fits;
   reuse StyleNook's drawing code by moving or copying it into the kit, never by editing StyleNook.tsx). Every prop takes props for
   position/size, an optional build time (draw-on lines then colour, for the opening), and a seed:
   - Nook: the home-base room (shelf mass cut by the left and top edges, desk, lamp with its golden pool, ONE landscape window with a mullion
     and sill, the outside view as a slot/child) in the POV framing (O1, S15) and an objective variant (S13: window at the right edge).
   - Outside: the town band (two houses), the AI data center (AI DATA CENTER sign, server-row windows with small lights, 3 roof units;
     variants: normal / dark-named (O1 after 4.04, S15) / far silhouette (S13) / wide hall cut by both side edges (S9 landing)), our roof
     ledge with a parapet lip and a vent (S9 foreground).
   - Laptop (hero burnt orange, open 3/4 view; a "NEW / BETTER" variant), Phone with the listing UI (laptop photo, price area, Add to cart,
     cart badge) and the Hand holding it (cut by the frame bottom).
   - PriceTag on a string: value prop with a ticker (struck old price, new price), a front/back turn-over (the back shows a small data center
     drawing, for S16).
   - MemoryStick (a stick of memory chips: board with black chips and gold pins; any size) + a flight helper (a stick flying along an arc
     from A to B over a time window, landing/vanishing into a target).
   - Pile: a mountain of memory sticks (S9b), sticks at most ~130 px each so a big pile gets more sticks, not bigger ones.
   - You: ONE protagonist model used by every lane: hair, sweater, colours; poses: waist-up front with a simple worried face (S5), seated
     3/4 back view (S13), tiny standing back view holding one stick (S9b). Draw a simple face in house style only for the front view.
   - Charts on an insert card: LineChart (title "U.S. computer prices", years axis, a line drawn on over time, optional hook up and a label
     like "+9.7%") and BarChart (two bars, "last year" and "5x").
   - ChipFactory (sawtooth roof, chimney), Van (delivery van with a laptop decal), waiting dots, SpeechBubble, ThoughtBubble, WallClock,
     Calendar (2026 flips to 2027).
3. video/src/entry-v3-kit.tsx (palette import first) with a "KitSheet3" composition (60 fps, 1080x1920 or taller) that lays out every prop
   and variant with labels. Render it at --scale=0.5 to ${SCR}/kit/kit_sheet.png and look at it: does it read as the style frame's world
   (warm, never sickly; hero burnt orange; ink weights like the style frame)? Fix what doesn't. Typecheck.
4. video/src/v3/film/kit/README.md: the kit API in one page (each export, props, sizes that read at phone size, variants, the time-of-day
   decision, the colour jobs: hero / anchor / pop), plus a "Consistency contract" (the same laptop, tag, phone, data center and You in every
   panel; ink weights by depth; nothing busy in the caption band). Commit (your paths only) and push as described.`, { label: 'kit', phase: 'Setup' }),
])
log('setup done: engine ' + (engine ? 'ok' : 'FAILED') + ', kit ' + (kit ? 'ok' : 'FAILED'))

const LANE_RULES = `
YOU ARE A PANEL LANE. Replace the board placeholder files of your panels with real sets in the Autumn Ember house style, using the shared kit
(video/src/v3/film/kit, its README) and the scene contract in video/docs/G5_BLOCKING.md. Keep each panel's ONE idea, its framing, its shot type,
its cozy/scale element and its timing exactly as locked in animatic.json and camera_plan_g3.md; elements appear on the same words (lead the
voice per ENGINE rule 5). Final camera: the boarded moves (with real multiplane parallax where the plan has planes); holds may breathe
1.5-2 % at most; no other camera. Key poses only: secondary motion and polish are G6. Draft quality: clean readable shapes, no edges,
paper or texture. Phone-size read: check every panel at 0.25 scale; the subject must read at a glance with the sound off.
Check: typecheck, then stills of your panels via Film3Shot at --scale=0.5 at the board's own sample times (start, key beats, end), one
contact sheet per panel group, compared side by side with the board frame at the same time (render the board with
npx remotion still src/entry-v3.tsx Animatic --frame=<t*30> --scale=0.5). Fix what doesn't match the plan. Then commit and push.
Report anything another lane or the kit must change under REQUESTS (e.g. a captionTone for your panels: "captionTone S9: light").`

const LANES = [
  { key: 'L1-opening', panels: 'O1, S15, S16 (and O1 at t < 0: the bare-line state the loop reveals)', brief: `
O1 (0-5.80) is the HOOK, the most important shot of the film: the cozy home-base nook in POV, the phone with the laptop listing and its price
tag in front of the window, the AI data center outside on the horizon with two houses. Frame 0: bare ink lines being drawn (the board's draw
timings), colour floods in by ~0.3 s; the AI DATA CENTER sign pops at ~0.25 s; each memory stick that flies from the phone's laptop out of the
window into the data center's roof ticks the tag up one step ($999 to $1,099 in the board's six numbers; sticks at 1.88, 2.18, 2.40, burst
2.60-2.72); the phone lowers at 3.64-4.00; at 4.04 ("data centers") the building turns dark and named, with a production emphasis replacing
the red circle; camera PULL OUT z 1.05 to 1.00, ease-in, the whole shot; never still. Must read like the approved style frame. O1 at t < 0
must be the bare-line frame 0 exactly (the loop reveals it under S16's un-build).
S15 (36.36-38.84) is exactly O1's end frame, held (dark named data center in the window, lowered phone, tag struck $999 / $1,099).
S16 (38.84-41.15) cuts in on the tag: the tag hangs by its string from the laptop's corner (laptop cut by the left edge), lamp pool on the
desk, it turns over at 39.70 to show the data center drawn on its back (like-pop sound 39.88). The engine un-builds it into O1's frame 0.` },
  { key: 'L5-scale', panels: 'S9, S9b', brief: `
S9 (19.40-21.32) is the film's ONE big move, the S1 rise-over reveal (CINEMATIC_GUIDE): start behind our roof ledge (parapet lip + vent, cut by
both side edges) that hides the lower half of the AI data center (roof units and sign showing); RISE with real multiplane parallax (ledge
fastest and dropping out of frame, the data center, the town band, the sky) to land (~20.8, on "centers") on the data center hall too big for
the frame, cut by both side edges; memory sticks arc in from the side edges into its roof from 19.75. Ease and speed limits as in the plan
(STORYBOARD_STYLE section 7 rise-over speed rule; at 60 fps the per-second limits hold).
S9b (21.32-22.68) is the SCALE CUT to a worm's-eye view: horizon low (~y 1500), the mountain of memory sticks running past both side edges and
up to just under the caption band, the data center at half its S9 size at the pile's foot, and tiny You (at least ~86 px tall) standing in
front, back view, holding your one stick (about 10:1 to the pile). The low angle sits on the quantity of chips, never on the company's
building as a villain.` },
  { key: 'L3-you', panels: 'S5, S13', brief: `
S5 (9.48-11.48), MEDIUM waist-up, the one face beat: You (the kit's protagonist, front view, worried face) left of centre holding your laptop
with its $999 tag; on a shop shelf upper right, the NEW laptop labelled BETTER with the same $999 tag, bigger than yours. Reads: "right after
you buy one, a better one comes out at the same price".
S13 (31.32-33.40), the home base returns, objective MEDIUM-WIDE: You seated, 3/4 back view, facing the window on the right (the kit's
objective nook: shelf mass, window cut by the right edge with mullion and sill, the data center as a far silhouette outside above y 840, the
lamp and its pool), a wall clock upper left, a thought bubble above your head holding the NEW laptop. The stillness is the waiting: HOLD.` },
  { key: 'L6-queue', panels: 'S10, S14', brief: `
S10 (22.68-25.24), WIDE, the queue seen from slightly above (as built in the board's fix round): the chip factory on the right, the AI data
center first in line at its door (the subject) with memory sticks flying from the factory into it, the laptop delivery van small behind it
with waiting dots. Reads: "they pay more, so they get first dibs".
S14 (33.40-36.36), the exact S10 frame (a reprise: same camera, same set): a chip maker speaks from the factory (speech bubble with the
calendar flipping 2026 to 2027 on "next", 34.60), a second, darker data center cuts into the line (34.76) and the van is pushed back. The
matched frame makes the change the only difference.` },
  { key: 'L2-inserts', panels: 'S4, S6, S11, S12', brief: `
S4 (5.80-9.48): INSERT, the line chart card straight-on ("U.S. computer prices", from 2005), the line drawn downhill with the voice
("for twenty years the same money bought more computer"). S6 (11.48-16.60): EXACTLY the S4 frame, the line turns up at the end with "+9.7%"
(the only change). S11 (25.24-29.40): INSERT bar chart straight-on: a short "last year" bar and a bar five times as tall with "5x" (and memory
sticks as the bar's subject if the board shows them). Charts are never angled. Present the cards in the film's world (a card on the warm wall
or desk), not as UI slides, and keep them readable at phone size.
S12 (29.40-31.32): CLOSE on the laptop and its price tag (the kit's laptop and tag, same angle family as S7): $999 struck on "makers", $1,099
pops on "on" (the ding sound at 30.28).` },
  { key: 'L4-desk', panels: 'S7, S8', brief: `
S7 (16.60-18.28): CLOSE at your desk in the home base, slightly high: your laptop centred on the desk in the golden lamp pool (pool wider than
the laptop so it reads as light), the see-inside bubble pops upper right on "your" (17.24) showing the memory stick inside.
S8 (18.28-19.40): EXTREME CLOSE cut-in on S7's axis: the keyboard cut by both side edges, ONE memory stick rises (0.4 s) to fill the frame
(~700 px, over the bezel and keys, the biggest thing in frame: the small end of the scale ladder before S9's many sticks). Redraw at close
size; never zoom the camera to get there.` },
]

phase('Lanes')
const lanes = await pipeline(LANES, (L) => agent(`${CTX}
${LANE_RULES}
YOUR LANE: ${L.key}. Panels: ${L.panels}. Scratch dir: ${SCR}/${L.key}/.
${L.brief}`, { label: L.key, phase: 'Lanes' }))
const laneReports = LANES.map((L, i) => `### ${L.key}\n${lanes[i] || 'FAILED (no report)'}`).join('\n\n')
log('lanes done: ' + lanes.filter(Boolean).length + '/' + LANES.length)

phase('Assemble')
const assemble = await agent(`${CTX}
YOU ARE THE ASSEMBLER (one agent, one round). Six lanes replaced the board placeholders; their reports are below. Work in ${V}.
1. Apply the lanes' REQUESTS that are in shared files (scenes.json captionTone, small kit or engine fixes), unless one would change the locked
   story; list any you skip and why.
2. Typecheck, then render Film3 at 60 fps, --scale=0.5, to video/out/v3_g5_blocking.mp4 (it can take a while: use --concurrency=3 and a long
   timeout; run it in the background and poll if needed). Run video/scripts/qa/gate_check.py on it.
3. Make one contact sheet of the whole film (one frame per panel at its key beat, plus O1 at 0.0 / 0.15 / 0.4 / 2.0 / 3.0 / 4.5 s, S9 start and
   landing, and the last frame next to frame 0) to ${SCR}/assemble/sheet.jpg and look at it at phone size. Find at most 6 CROSS-LANE problems
   (things no single lane could see): the same laptop / tag / phone / data center / You drawn differently between panels; palette roles drifting
   (sickly or cold colours, the hero not burnt orange); captions colliding with busy detail or unreadable on their background; a panel that
   doesn't read with the sound off; a cut that lands off its word; the loop seam (last frame vs frame 0). Fix them with small, targeted edits
   in the panel or kit files. No restaging, no polish, no new ideas.
4. Re-render, re-run the gate check, copy the MP4 to video/deliverables/v3/v3_g5_blocking.mp4, save the sheet as
   video/review/v3_g5/sheet.jpg (our own drawings only), and add a short "Lessons from v3" section to video/docs/G5_BLOCKING.md (what made
   lanes consistent or not, what to set up first next time). Commit (your paths and the files you fixed) and push.
REPORT (at most 12 lines): the deliverable path and length, the gate check result, the fixes you made, anything open for the owner.

LANE REPORTS:
${laneReports}

SETUP REPORTS:
### engine
${engine || 'FAILED'}
### kit
${kit || 'FAILED'}`, { label: 'assemble', phase: 'Assemble' })

return { engine, kit, lanes: laneReports, assemble }
