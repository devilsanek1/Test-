export const meta = {
  name: 'v2-g5-blocking',
  description: 'v2 G5 blocking cut: film engine + Cream & Cobalt kit, 5 panel lanes build real sets on the locked board, then assemble, sound-off cold read, one fix round, 60 fps render',
  phases: [
    { title: 'Setup', detail: 'engine (Film2 entry, scenes, captions, credits, board placeholders) and kit (palette + shared cast and sets, kit sheet, colour meter) in parallel' },
    { title: 'Lanes', detail: 'one agent per group of panels replaces the board placeholders with real sets' },
    { title: 'Assemble', detail: 'full 60 fps render + gate check, sound-off cold read, one cross-lane fix round, deliverable' },
  ],
}

const REPO = '/home/user/Test-'
const V = REPO + '/video'
const SCR = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/g5v2'

const CTX = `
PROJECT: video 2 of a short-form explainer channel ("What's All the Fuss About?", TikTok/Reels/Shorts, 1080x1920). Story: a former Google
DeepMind research engineer told BBC News (21 Oct 2026) she quit over where Google's military AI work was heading, and says her contract bans
her from criticizing Google, for life. Core line: "She quit Google, and says her contract bans criticizing it, for life."
We are at gate G5, the BLOCKING CUT (video/docs/PIPELINE_V2.md gate table): real sets and props at draft quality, FINAL camera, key poses,
NO edges / paper / texture; renders at 60 fps. The owner judges staging, readability at phone size, and transitions that play.
READ FIRST: video/docs/G5_BLOCKING.md (the generic G5 how-to, incl. section 8 "Lessons from v3"). Video 3 is the reference implementation
(src/entry-v3-film.tsx, src/v3/film/: Film3.tsx, BoardPanel.tsx, palette.ts, kit/ + kit/README.md, scenes/). Copy its patterns, not its look.

LOCKED (do not change story, cut points, shot content or transitions):
- G3 board animatic (owner: "Keep going"): ${V}/public/v2/animatic.json (per panel: s/e, camera from/to, every element with its timing, credit,
  notes), the render ${V}/deliverables/v2/v2_g3_animatic.mp4, and the panel table ${V}/docs/v2/storyboard_g3.md (its "Shot / framing", "Move",
  "Drawing" and "Sound" columns ARE the camera plan; read its "Cinematography" and "Fairness on screen" paragraphs). Render a board frame with
  npx remotion still src/entry-v2.tsx Animatic <out.png> --frame=<round(t*30)> --scale=0.5 (the board is 30 fps). The board is monochrome
  notation: translate it into a real set. Red pencil marks and the notes strip are board notation only (never in G5).
- Voice: ${V}/public/v2/voice.wav (39.08 s incl. a 0.12 s lead; speech ends ~38.74 s) with word timings ${V}/public/v2/voice_words.json.
  Sound cues: animatic.json "sfx" (signed chime 0.08, badge clack 0.92, marker squeak 2.60, paper unroll 3.00, like-pops 13.96 / 16.76 / 36.44,
  APRIL stamp 20.76, rise swell 21.32, NO VETO stamp 26.70, ...): visuals land on them.
- Look: ${V}/docs/v2/LOOK.md (LOCKED by the owner). Palette "3 Cream & Cobalt", warmed, exactly as the A palette in ${V}/src/v2/StyleDesk.tsx
  (the DeskPal role table: wall #F3E6D6, golden lamp pool, red-brown wood, saturated dusk-blue window #4D5C99). The APPROVED style frame is
  ${V}/review/look/v2_g4/desk_A.png (StyleDesk), the approved opening motion test ${V}/review/look/v2_g4/opening_test.mp4 (src/v2/StyleDeskOpen.tsx,
  60 fps). Match their drawing style: v1 house style, hand-drawn ink, flat fills, misregistered fills, no gradients. The ONE scale beat P8 (the
  Pentagon rise) is in the sister palette "6 Dusk" exactly as ${V}/review/look/v2_g4/pentagon_dusk.png (src/v2/StylePentagon.tsx, its DUSK roles:
  saturated blue-violet with peach accents, never grey mist). Owner rules: warm, never sickly. Colour jobs: hero cobalt #3F7FE0 ONLY on HER
  (her sweater sleeve, her badge lanyard), never on Google, the deal or the Pentagon; dark anchor #2B2A44; ONE pop, orange #EC6B2E, only on the
  highlighted clause and FOR LIFE.
- FAIRNESS (hard rules, docs/v2/CORE_LINE.md section 2 and the storyboard's "Fairness on screen"): "SHE SAYS" on screen for all of O1; her drawn
  clause is her account, credited "Her account to BBC News" wherever her contract is drawn (O1, P2, P12); "for life" never in quote marks; the
  running line only ever on HER page; "any lawful government purpose" always shown with the full oversight clause, as two separate quoted
  blocks; NO VETO only beside block 1; no war imagery, uniforms, figures in the Pentagon shot, aircraft or weapons; no "Google" lettering in
  P6-P10; Google's page (P11) at equal size, ground and tone to the deal page, with its safe-channels line; her bubble holds only her own word
  (FACTS); she is a generic figure (long dark hair, cobalt sweater; never a likeness of the real person); no real logos anywhere.
- House engine: ${V}/docs/ENGINE.md (section 1 the ten rules, 3 the scene template, 6 captions, 7 primitives, 10 kit) and ${V}/src/lib.
  Everything in seconds (useTime), deterministic (rng, never Math.random), flat (no blur, filters, gradients), no opacity fades.
  Cozy and scale: ${V}/docs/look/COZY_AND_SCALE.md; camera grammar: ${V}/docs/look/CINEMATIC_GUIDE.md ("The opening", the S1 rise-over).
- The opening rule: frame 0 is the scene being drawn (bare ink lines), colour floods in within ~0.3 s, voice from frame 1, never a still
  frame, one continuous shot; the film loops back to the bare-line frame 0.
- Captions own the caption band (screen y ~290-600): keep busy detail out of it. Platform UI covers the top (y < 180), the bottom (y > 1520)
  and a right rail (x > 950, y 900-1500). Key action inside x 90-990, y 600-1480.

FILES AND LANES: video/src/v2/film/ is the G5 film. The ENGINE agent owns video/src/entry-v2-film.tsx, video/src/v2/film/Film2.tsx,
BoardPanel.tsx, scenes.json, captions.json, captions_pages.txt, scenes/index.ts (and optional props in video/src/lib/Film.tsx only if
unavoidable, with v1 and v3 rendering exactly as before). The KIT agent owns video/src/v2/film/palette.ts (a stub now), video/src/v2/film/kit/**,
video/src/entry-v2-kit.tsx and video/scripts/qa/colour_meter.py. Each lane owns only its own panel files video/src/v2/film/scenes/<ID>.tsx (plus
new helper files named <ID>_*.tsx). Never edit another agent's files, and never edit src/v2/StyleDesk.tsx, StyleDeskOpen.tsx, StylePentagon.tsx
(copy code out of them). A change you need in a shared file goes in your report under "REQUESTS:" in one exact line each.

GIT: commit only your own paths (git add <paths>, never -A or .), message ending with exactly these two lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ
If .git/index.lock exists, wait 5 s and retry. Do NOT push and never pull, merge, rebase, reset, stash or checkout (the assembler pushes; another
session pushes video 3 work to the same branch). Never commit anything under video/out or the scratchpad.

RENDERS: 60 fps, so frame = round(t * 60). The machine has 4 CPUs and another agent renders at the same time: use --concurrency=2 for renders.
Check stills at --scale=0.5 (and a 0.25 phone-size look); write them under ${SCR}/<your lane>/. Look at no more than ~10 images in your session
(contact sheets count as one). Never render the whole film at full size.
The repo is PUBLIC: never write an email address into a file. No real logos, no photos, no footage: our own drawings only.
REPORT: your final message is at most 14 lines: what you built (files), what you checked (with the sheet path), what is open, then REQUESTS.
`

phase('Setup')
const [engine, kit] = await parallel([
  () => agent(`${CTX}
YOU ARE THE ENGINE AGENT. Build the G5 film shell so the whole film plays end to end from minute one, each panel a separate file that a lane
replaces. Work in ${V}. Follow docs/G5_BLOCKING.md sections 1, 5, 6, 7 and copy v3's engine files, changing the imports and data.
1. Scaffold from the locked board: python3 -I scripts/g5_scaffold.py --animatic public/v2/animatic.json --film src/v2/film --drop LOOP --end 39.08
   --loop-dur 0.3 (check its import defaults fit src/v2/film). Panels O1, P2 ... P13; every transitionIn a cut; P13 ends at 39.08 with the house
   loop transitionOut {type: 'unbuild', loop: true, dur: 0.3}: P13 un-builds after the last word and reveals O1 underneath at its t < 0
   bare-line state, so the film loops to the bare-line frame 0.
2. video/src/v2/film/BoardPanel.tsx (v3's, importing public/v2/animatic.json), Film2.tsx (v3's Film3.tsx pattern: FILM2_FPS 60, voice
   v2/voice.wav, the board's sfx, captionMotion 'pop', draftLabel 'G5', edges false) and video/src/entry-v2-film.tsx: import './v2/film/palette'
   FIRST, then register "Film2" (1080x1920, 60 fps, ceil(39.08 * 60) frames), "Film2Shot" (props {id}), "Film2-<ID>" per panel, and "Film2Bare"
   (the whole film with no captions, no frame-0 words, no credits and no draft label: for sound-off picture cold reads).
3. Frame 0 states the payoff in words: "SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE." until 6.12 (animatic frame0Until), in the style frame's
   caption look (desk_A.png: how the words sit and what is highlighted; FOR LIFE in the pop), with the board's frame0Credit "Her account to BBC
   News, 21 Oct 2026" as a small credit line under the words. Lines may run to ~24 characters if they read better.
4. Credits: every board panel's "credit" (P2, P3, P5 = the name caption "Sofia Liguori · former research engineer, Google DeepMind", P6, P7, P9,
   P10, P11, P12, P13) appears as a small, consistent credit line in a fixed safe spot (where the board's ShotView draws it unless that falls
   into a platform UI zone or the caption band; never over the key action), drawn by Film2 as a screen-space overlay keyed by the active panel
   (put "credit" in each scenes.json row). P5's name caption may be a larger lower-third name super (name bold, role under it). Keep the credit
   look in Cream & Cobalt (ink on cream, legible at 0.25 scale) and readable on P8's Dusk sky if P8 ever gets one (it has none now).
5. Captions: video/src/v2/film/captions_pages.txt hand-paged (one page per paragraph or phrase, 1-2 lines of at most ~20 characters, split on
   phrase and sentence boundaries), [brackets] on the key words (e.g. for life, scared, talking, military, Pentagon, any lawful government
   purpose, can't veto, of any kind, can't criticize, facts); quotes in quote marks exactly as the script (BBC spelling "criticising" inside
   her quote); then python3 -I scripts/film_captions.py --words public/v2/voice_words.json --pages src/v2/film/captions_pages.txt --out
   src/v2/film/captions.json. Note: voice_words.json has the token "can'tveto" (one ASR token for "can't veto"); the caption must say "can't veto".
6. captionTone per panel in scenes.json: 'dark' (ink) on the cream walls and pages; lanes may override by exporting captionTone.
7. Smoke test: npx tsc --noEmit; render Film2 at --scale=0.25 --concurrency=2 to ${SCR}/engine/smoke.mp4; run python3 -I scripts/qa/gate_check.py
   --mp4 ... --scenes src/v2/film/scenes.json --captions src/v2/film/captions.json --voice public/v2/voice.wav --entry src/entry-v2-film.tsx
   --comp Film2 --frame0 "<line 1>|<line 2>" --frame0-until 6.12; look at one contact sheet (frame 0 must show the words + credit; one frame
   per panel with its credit; the loop seam). If you touched src/lib/Film.tsx, prove v3 is unchanged (one Film3 still before/after, identical).
8. If you learned something generic (credits, a bare composition), add it in 1-3 lines to docs/G5_BLOCKING.md. Commit your paths.`, { label: 'engine', phase: 'Setup' }),
  () => agent(`${CTX}
YOU ARE THE KIT AGENT. Build the shared look, cast and sets every lane uses, so 13 panels built by 5 agents look like one film. Work in ${V}.
Template: src/v3/film/palette.ts, src/v3/film/kit/ and its README. Lessons (G5_BLOCKING.md section 8): kit defects surfaced only when a lane used
a prop at its real panel size, so YOUR SHEET MUST SHOW EVERY PROP AT EVERY SIZE THE BOARD USES IT (the extremes too) and you fix what does not
read at 0.25 scale BEFORE any lane starts.
1. video/src/v2/film/palette.ts (replace the stub): apply Cream & Cobalt (StyleDesk's A roles) to the house theme tokens (src/lib/theme.ts:
   palette, skies, the tod tables, glow, caption colours) at module load, exactly as v3's palette.ts does, and export the CC role tokens (all of
   StyleDesk's A DeskPal roles, extended for the nook, her, the staffers, the pages) and the DUSK role tokens (StylePentagon's DUSK) for P8.
   Verify the house kit really picks the values up (a check function like v3's emberProblems(), printed on the kit sheet: "0 problems").
   TIME OF DAY (one for the film): evening; inside, her warm lamp-lit room (the desk and the nook are the same home); outside her window, the
   saturated dusk blue of desk_A.png. THE COLD INSERTS (P3's interview backdrop is plain/neutral-warm; P7, P9, P10, P11 are pages "out of her
   room, cold"): decide one flat ground for the four pages, within the family and never the hero cobalt, never grey; render 2 candidates next to
   desk_A.png and pentagon_dusk.png and pick the one that reads "cold, official" yet belongs to this film; the pages themselves are warm white
   paper with ink. Write the decisions into the kit README.
2. video/src/v2/film/kit/*.tsx (+ index.ts), drawn like the style frame (lib/Ink, lib/Fill, lib/sketch; move or copy StyleDesk / StyleDeskOpen /
   StylePentagon drawing code into the kit, never edit those files). Every prop takes canvas px for position/size, an optional build time "at"
   (ink draws on, then fills; for the opening), and a seed:
   - Her: ONE protagonist model used by every lane: long dark hair mass (anchor), cobalt sweater (hero), a lanyard; generic, no likeness; a
     simple house-style face for the views that show it, with "worried" and "talking" variants. Poses at the board's sizes: standing, holding her
     contract up with both hands (P2, wide: small figure), seated at a desk facing a mic in side or 3/4 view (P4 nook at 1.4x, P13 at 1.2x),
     over-the-shoulder back view (P5 close: hair and shoulder cut by the frame), medium close 3/4 front with a worried face turned to a mic (P6),
     and the sleeve + hand arm (O1 / P12, StyleDesk's Arm).
   - Staffer: two generic staffers who are clearly NOT her (short hair or none, non-hero clothes), worried faces, badges on non-hero lanyards,
     seated waist-up at an interview table (P3).
   - Nook: her home-base room: one room-tone wall, a landscape window ~660 x 470 (about 15 % of the frame) with a sill, ONE mullion, the dusk
     outside with far roofs and a few lit windows; shelf/bookcase mass cut by the left edge, a curtain right, a soffit edge; her desk with the lamp
     and its golden paper pool; her chair; a plain interview mic on a small stand; her laptop (variant: an abstract "AI network" of nodes on its
     screen, no logos). Layouts: WIDE eye level (P2), the same room at 1.2x (P13, medium-wide) and 1.4x (P4, medium: the glass cut by the band's
     edge and the right side), plus the pieces P5 (over-the-shoulder close at her desk) and P6 (new angle, 3/4 front, the window behind her) need.
   - Contract: her contract page (CONTRACT title, ruled lines, the clause in words "no criticizing / Google" with the pop highlight band that can
     sweep on, a signature that draws on) and the run-on paper with a year every other row (2030, 2040, 2050, 2060 ...) that steps out past the
     page's edge and pours off a desk edge / down to the floor, faster and faster; any size (O1/P12 desk size; P2 held up small, running to the
     floor and on toward us).
   - Badge (hand-lettered GOOGLE, paper white, its lanyard in the hero), Box (cardboard, for O1), Bubble (a speech bubble that pops; sizes: small
     for P4 / P6, the 400 px FACTS bubble for P13 with hand-lettered text), Mic.
   - A hand-lettering text helper for pages, stamps and bubbles that matches the style frame's lettering.
3. video/src/entry-v2-kit.tsx (palette import first) with a "KitSheet2" composition (60 fps, 1080 wide, as tall as needed) laying out every prop
   and variant WITH LABELS AT EVERY BOARD SIZE (the extremes: P2's small standing her and her held contract, P6's medium-close face, P5's
   over-the-shoulder hair, P13's 400 px bubble, the staffers at P3's size, the nook layouts), plus the palette check. Render it at --scale=0.5 and
   look at it, then a 0.25 phone-size crop of the small sizes: does it read as desk_A.png's world (warm, never sickly; cobalt only on her; ink
   weights like the style frame)? Fix what doesn't read now. Typecheck.
4. video/scripts/qa/colour_meter.py: for PNG stills, report per image the % of pixels near the hero colour, near the pop colour, and dark
   (L* < 30), with --hero/--pop hex args (defaults Cream & Cobalt); lanes put its numbers on their sheets.
5. video/src/v2/film/kit/README.md: the kit API in one page (each export, props, the sizes that read at phone size, variants, the time-of-day and
   cold-ground decisions, the colour jobs), plus a "Consistency contract" (the same her, contract, nook, mic, bubble and lettering in every
   panel; ink weights by depth; nothing busy in the caption band). Commit your paths.`, { label: 'kit', phase: 'Setup' }),
])
log('setup done: engine ' + (engine ? 'ok' : 'FAILED') + ', kit ' + (kit ? 'ok' : 'FAILED'))

const LANE_RULES = `
YOU ARE A PANEL LANE. Replace the board placeholder files of your panels with real sets in the Cream & Cobalt house style, using the shared kit
(video/src/v2/film/kit, its README and consistency contract) and the scene contract in video/docs/G5_BLOCKING.md section 2. Keep each panel's ONE
idea, its framing, its shot type, its cozy/scale element and its timing exactly as locked in animatic.json and storyboard_g3.md; elements appear
on the same words and sound cues (lead the voice per ENGINE rule 5). Final camera: the boarded moves only (O1's pull-out, P8's rise); holds may
breathe 1.5-2 % at most; no other camera. Key poses only: secondary motion and polish are G6. Draft quality: clean readable shapes, no edges,
paper or texture. Phone-size read: check every panel at 0.25 scale; the subject must read at a glance with the sound off.
Engine setup report (what the shell gives you):
ENGINE_REPORT
Kit setup report:
KIT_REPORT
Check: typecheck, then stills of your panels via Film2Shot at --scale=0.5 at the board's own sample times (start, key beats, end), one contact
sheet per panel group, side by side with the board frame at the same time, with scripts/qa/colour_meter.py numbers. Fix what doesn't match the
plan. Then commit (no push). Report anything another lane, the engine or the kit must change under REQUESTS (prefer exporting captionTone
yourself; a kit defect you hit: work around it locally AND report it as one exact REQUESTS line, so the assembler can fold it back).`

const LANES = [
  { key: 'L1-desk', panels: 'O1, P12 (and O1 at t < 0: the bare-line state the loop reveals)', brief: `
O1 (0-6.12) is the HOOK, the most important shot of the film. Start from the approved opening test (src/v2/StyleDeskOpen.tsx, copy its code into
a shared set file O1_set.tsx that O1 and P12 both use) and complete it to the board's full O1: frame 0 = the desk scene's bare ink lines mostly
drawn and still drawing (t < 0 motions already running), colour floods in within ~0.3 s (faster than the G4 test's 0.16-0.67), voice from
frame 1; the signature draws on with the "signed!" chime (0.08); 0.36-0.58 her sleeve (the hero) brings the GOOGLE badge to the centre,
0.70-0.92 drops it in the box (badge clack 0.92), 1.24-1.82 carries the box out of frame (the G4 test tossed the badge in and skipped the box
exit: follow the board); 1.84-2.14 the sleeve brings a highlighter to the clause; 2.60-2.96 the pop band sweeps under "no criticizing / Google"
(marker squeak 2.60); 3.00-3.50 the page steps out past its edge (2030), 3.55-6.05 it pours over the desk's front edge faster and faster: 2040,
2050, 2060 ... ("for life" lands in near silence). Camera: PULL OUT 1.05 to 1.00, ease-in over the whole shot; never a still frame. The frame-0
words and their credit are the engine's (screen space): keep the caption band clear. HOME BASE desk, COZY, INSERT high 3/4 (desk back edge,
front face, right end + leg, the floor line past it; shelf cut left, lamp shade cut right; paper pool ~740 px) exactly like desk_A.png.
O1 at t < 0 must be exactly the bare-line frame 0 (the loop reveals it under P13's un-build): build with Ink / Fill / kit and the "at" times.
P12 (33.08-35.32) is O1's END frame, matched (same camera, same set: the highlighted clause, 2030, the run-on over the edge); on "can't" (33.72,
short unroll sound) the run-on pours on another ~200 px. HOLD.` },
  { key: 'L2-nook', panels: 'P2, P4, P13 (and the loop seam: P13 un-builds into O1 t < 0)', brief: `
The nook is her home base: the SAME room in three sizes (kit Nook layouts), the same her (kit Her). Size changes at every cut.
P2 (6.12-8.36) WIDE, eye level: the room tone wall, the landscape window with sill, one mullion and far roofs in the dusk, shelf cut left,
curtain right, soffit edge, lamp + golden paper pool on her desk, her chair; she stands holding her contract up, and it hangs to the floor and
runs on toward us with years on it (the running line only on HER page). "One odd contract: hers." HOLD.
P4 (13.24-15.00) the nook redrawn at 1.4x, MEDIUM: she sits at her mic (the glass cut by the caption band's lower edge and the right side); her
speech bubble pops on "SHE" (13.96, like-pop sound): she IS talking. HOLD.
P13 (35.32-39.08) the nook at 1.2x, MEDIUM-WIDE: she sits at her mic; her bubble (the subject, ~400 px) pops on "talking" (36.44, like-pop) with
FACTS hand-lettered (her own word, nothing else in it, no document). HOLD.
THE SEAM IS YOURS: P13 is the last panel; it un-builds over its last 0.3 s on top of O1's t < 0 bare-line state. Lesson from v3: the last
panel must drop its wall/sky slab while it un-builds (useExit() > 0 -> no full-frame background), so O1's lines draw on in place instead of
four near-empty frames. Check a strip of the film's last 0.3 s plus frames 0-6 (render Film2 frames, see G5_BLOCKING section 4; if O1 is still
a placeholder when you check, check against it and say so in your report).` },
  { key: 'L3-people', panels: 'P3, P5, P6', brief: `
P3 (8.36-13.24) MEDIUM 2-shot, a plain interview look (not her home, not cozy): two staffers (kit Staffer: badges, NOT her), worried faces, at an
interview table with a plain mic, a "CONTRACT" document on the table, NAME WITHHELD over the one who spoke; an ordinary underline draws on under
"contracts" (12.20, pencil sound). "Other staff told the BBC they're scared, because of their contracts." HOLD.
P5 (15.00-16.60) COZY CLOSE over her shoulder (long hair, the cobalt sweater shoulder): her laptop with the abstract AI network on its screen, the
lamp, a paper pool on the mid desk. The engine draws her name super; keep its spot clear. "She worked on Google's AI." HOLD.
P6 (16.60-20.52) COZY MEDIUM CLOSE, a NEW ANGLE (3/4 front, the window behind her): her worried face turned to the mic; her bubble pops on "told"
(16.76, like-pop). Nothing military, no Google lettering. "Worried, she tells the BBC she objected." HOLD.
Faces are the hardest drawing in the film: keep them simple, house style, readable at 0.25 (worry = brows + mouth), never a likeness.` },
  { key: 'L4-pages', panels: 'P7, P9, P10, P11', brief: `
The cold inserts: a hard cut out of her room. Use the kit's cold-ground decision; the pages are warm white paper with ink, hand-lettered with
the kit's lettering helper; one shared page set file (e.g. P9_page.tsx) so P9, P10 and P11 are literally the same page geometry. FAIRNESS is
strict here (see LOCKED): no Google lettering on P7-P10; block 1 never without block 2; NO VETO only beside block 1; P11 at equal size, ground
and tone. All text must be readable at 0.25 scale; charts/pages are never angled.
P7 (20.52-21.32) INSERT: the DEAL page with two signatures; an APRIL 2026 stamp slams on "April" (20.76, stamp sound). HOLD.
P9 (23.80-25.96) INSERT close, straight-on (the scale cut back in from P8): the deal page (~460 x 620 on the board, bigger if it reads better):
DEAL; block 1 "any lawful government purpose" (big, in quote marks); a rule; block 2 "should not be used for domestic mass surveillance or
autonomous weapons (including target selection) without appropriate human oversight and control" (smaller, in quote marks, never cut). HOLD.
P10 (25.96-28.20) the same page pulled back (~0.85x, both blocks whole) and a ~330 px NO VETO stamp (the subject) slamming on "veto" (26.70,
stamp sound) across the page's top edge, beside block 1, clear of block 2. HOLD.
P11 (28.20-33.08) GOOGLE SAYS (hand-lettered), at the deal page's size, position, ground and tone: "it follows its / AI principles"; "staff can
safely / raise concerns" (a paraphrase: no quote marks); "bans retaliation / "of any kind"" (that quote in quote marks). Underlines read along
on 30.04 and 30.76 (pencil sounds). "Google's side, equal weight." HOLD.` },
  { key: 'L5-scale', panels: 'P8', brief: `
P8 (21.32-23.80) is the film's ONE scale beat and its one big move, in the 6 Dusk sister palette exactly as the approved
review/look/v2_g4/pentagon_dusk.png (copy StylePentagon.tsx's drawing code and DUSK roles into P8.tsx / P8_*.tsx; use explicit Dusk colours,
since the house tokens are Cream & Cobalt). The S1 rise-over (CINEMATIC_GUIDE): the cut lands on a wide where a low stone wall (coping + courses)
hides about half of a Pentagon already cut by both side edges; the camera RISES (120 px + zoom 1.00 to 1.04, the "unveil" ease, 21.32-23.40,
landing on "AI" at 23.40, then a 0.4 s hold) while the wall drops away with real multiplane parallax (the wall fastest, its own ~640 px drop with
an outSine over the panel; the building; the far woods; the sky) and the whole five-ring building lands wider than the frame, two rows of
identical small parked cars at its foot as the scale ruler. Rise swell sound at 21.32. Respect the 60 fps speed limits (~450 px/s for long
flat-ink moves; check every frame of the move: render-frames with 60 fps times). No figures, aircraft, weapons, flags or "Google". Caption tone:
check the contrast of captions over the dusk sky in the band and export captionTone (ink on the light Dusk sky #A9B5EC is ~8.6:1).` },
]

phase('Lanes')
const laneCtx = LANE_RULES.replace('ENGINE_REPORT', engine || '(engine report missing: read src/v2/film and docs/G5_BLOCKING.md)').replace('KIT_REPORT', kit || '(kit report missing: read src/v2/film/kit/README.md)')
const lanes = await pipeline(LANES, (L) => agent(`${CTX}
${laneCtx}
YOUR LANE: ${L.key}. Panels: ${L.panels}. Scratch dir: ${SCR}/${L.key}/.
${L.brief}`, { label: L.key, phase: 'Lanes' }))
const laneReports = LANES.map((L, i) => `### ${L.key}\n${lanes[i] || 'FAILED (no report)'}`).join('\n\n')
log('lanes done: ' + lanes.filter(Boolean).length + '/' + LANES.length)

phase('Assemble')
const assemble = await agent(`${CTX}
YOU ARE THE ASSEMBLER (round 1). Five lanes replaced the board placeholders; their reports are below. Work in ${V}.
1. Apply the lanes' REQUESTS in shared files (scenes.json, captions, small kit or engine fixes) and fold kit workarounds back into the kit where a
   lane reported one, unless a request would change the locked story; list any you skip and why. Any panel still a placeholder: say so.
2. npx tsc --noEmit, then render Film2 at 60 fps, --scale=0.5 --concurrency=3, to video/out/v2_g5_blocking.mp4 (it takes a while: run it in the
   background and poll). Run scripts/qa/gate_check.py on it (frame0 words, --frame0-until 6.12). Fix FAIL lines.
3. Render Film2Bare stills (no captions) and Film2 stills at the same times, and build TWO contact sheets at phone size (0.25 scale per frame):
   ${SCR}/assemble/coldread_bare.jpg (Film2Bare) and ${SCR}/assemble/coldread_caps.jpg (Film2), with one frame per panel at its key beat (after
   its pop / stamp / bubble lands, never mid-pop), plus O1 at 0.0 / 0.15 / 0.3 / 1.0 / 2.0 / 3.0 / 4.5 / 6.0 s and P8 at its start, mid-rise and
   landing; frames in film order, numbered 1..N, NO panel ids, notes or times on the sheet. Also ${SCR}/assemble/seam.jpg: the last 0.3 s
   (every 3rd frame) next to frames 0-6, and ${SCR}/assemble/sheet.jpg: the same frames WITH panel ids and times, for you and the finisher.
4. Commit (your paths and files you fixed), then checkpoint: cd ${REPO}; git fetch origin video-production; if origin has new commits, git merge
   origin/video-production with a message ending in the two attribution lines (resolve conflicts by keeping both sides' additions); then
   git push -u origin video-production (retry on network errors 2s/4s/8s/16s).
REPORT (at most 16 lines): the MP4 path and length, the gate check result, the sheet paths, the frame-number to panel/time map of the cold-read
sheets (one line), the REQUESTS you applied or skipped, and the cross-lane problems you see but did not fix yet.

LANE REPORTS:
${laneReports}

SETUP REPORTS:
### engine
${engine || 'FAILED'}
### kit
${kit || 'FAILED'}`, { label: 'assemble', phase: 'Assemble' })

const coldread = await agent(`You are a sound-off cold reader for a 39-second vertical (9:16) short video, the kind people scroll past on Reels
or TikTok. You know NOTHING about its topic: do not read any project files, docs, scripts or code. Look only at these two contact sheets of
frames in film order (numbered 1..N), shown at phone size:
- ${SCR}/assemble/coldread_bare.jpg : the pictures only (no captions)
- ${SCR}/assemble/coldread_caps.jpg : the same frames with the on-screen captions, as a sound-off viewer sees them
(If a sheet is missing, look for jpg/png files in ${SCR}/assemble/ and use what is there; say so.)
First from the BARE sheet: for each frame number, say in a few literal words what you see (who, what object, where) and what you think is
happening; mark anything you can't make out, that looks broken, empty, unfinished or like a glitch, and anything that reads as something it
is not (e.g. a paper read as a towel). Then say in 2-3 sentences what story the pictures alone tell.
Then from the CAPTIONS sheet: what story do you get now; which frames still don't match their words; any caption hard to read on its
background or colliding with detail; does any frame read as an accusation, a war or weapons image, or a logo of a real company.
Finish with the 6 most important problems, most important first, each as: frame number, what you saw, what a viewer would need.
At most 45 lines. Be blunt and literal; do not guess what the makers meant.`, { label: 'cold-read', phase: 'Assemble' })

const finish = await agent(`${CTX}
YOU ARE THE FINISHER (one fix round). The assembler rendered the film and built the sheets; a sound-off cold reader who knows nothing about the
story read them. Work in ${V}. Reports below.
1. Read ${SCR}/assemble/sheet.jpg (ids + times) and ${SCR}/assemble/seam.jpg yourself at phone size, then pick at most 8 CROSS-LANE or
   READABILITY problems to fix now, from the cold read, the assembler's list and your own check: the same her / contract / nook / mic / bubble
   drawn differently between panels; palette roles drifting (sickly or cold colours in her room, cobalt anywhere but on her, the pop on anything
   but the clause / FOR LIFE); captions colliding with busy detail or unreadable; a panel that doesn't read with the sound off (what the cold
   reader misread); a cut or a pop that lands off its word or sound; the loop seam (the last frame vs frame 0); ANY breach of the FAIRNESS rules
   (always fix those). Fix them with small targeted edits in the panel, kit or engine files. No restaging, no polish, no new ideas.
   List what you did NOT fix and why (for the owner).
2. Re-render Film2 (60 fps, --scale=0.5, --concurrency=3) to video/out/v2_g5_blocking.mp4, re-run the gate check, copy the MP4 to
   video/deliverables/v2/v2_g5_blocking.mp4, rebuild the whole-film sheet with ids + times as video/review/v2_g5/sheet.jpg (our own drawings
   only) and the seam strip as video/review/v2_g5/seam.jpg.
3. Add a short "Lessons from v2" block (at most 8 lines) to the end of video/docs/G5_BLOCKING.md section 8: what made the lanes consistent or
   not this time, whether the kit-sheet-at-every-size and the bare cold read paid off, what to set up first next time.
4. Commit (your paths and the files you fixed), then cd ${REPO}; git fetch origin video-production; merge it if origin has new commits (message
   ending in the two attribution lines; keep both sides' additions); git push -u origin video-production (retry on network errors).
REPORT (at most 14 lines): the deliverable path, length and resolution, the gate check result, the fixes you made, what the cold reader got
right/wrong after the fixes (your judgement), anything open for the owner.

ASSEMBLER REPORT:
${assemble || 'FAILED (no report): check video/out and the scratch dir yourself, and render the film first'}

COLD READ:
${coldread || 'FAILED (no cold read): do the phone-size read yourself on the bare sheet'}`, { label: 'finish', phase: 'Assemble' })

return { engine, kit, lanes: laneReports, assemble, coldread, finish }
