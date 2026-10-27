# Storyboard style: the "board" look for every G3 animatic (house style, 2026-10-26)

Owner, v3 G3: "the sketch is making it confusing ... very simple, avoid colours for now ... like an actual drawing". The spec for SketchReel's
`board` mode and the brief for storyboard agents (evidence: `research/storyboard_{feature,series,craft}.md`). **VERIFIED** = primary page or
sources agree; **REPORTED** = one secondary source or search summary; numbers without a source are our own choices for a 1080 x 1920 phone frame.

## 0. The principle (owner, 2026-10-26): signal per drawing
A board exists to give the director (the owner) the most signal about the final film in the least drawing and review
time. Draw at thumbnail level, make the intent explicit (one action, the framing, the shot type, cozy/scale, all stated
in the notes strip in big words), PLAY every move and transition the film will have at sketch fidelity (shape and
timing real, polish absent — stage spec: `docs/G3_ANIMATIC.md`), place a grey placeholder wherever the final film is
dense or alive, and stop the moment the panel says what it must. Quality is not the goal at G3; completeness of signal is.

## 1. Why
The v3 animatic (frames at 1, 3.4, 7, 18 and 22 s) gives the eye nothing to follow. Five fills are used as decoration (warm walls, blue
sky, a red button), every line is the same 4 px brown, and a shot holds 13 to 228 elements. Things are drawn as labelled boxes
("battery", "memory chips") with 34 px labels, notes sit on top of the picture, and S8's 4.2x zoom crops the drawing while it moves.

**What professionals do**
- Pixar's boards and story reels are black and white so the team can "work very, very, very fast"; colour comes later, in a separate
  colour script [1]. VERIFIED. Every panel says one thing (Joe Ranft [2], REPORTED); "draw clearly, not cleanly" (Ollie Johnston [3], VERIFIED).
- Depth comes from value, not colour. The front subject gets "the darkest areas" and the most detail, the middle figure is "just a medium
  grey flat area", and the far one is washed out; "storyboard artists rarely use color" (Klaus Scherwinski [4]). VERIFIED.
- Line weight leads the eye: "if all your lines are heavy, there are no heavy lines", and the heaviest line goes on the focal point [5].
  VERIFIED. A board has to read in silhouette, because the eye reads the outline before the detail inside it (Doug Lefler, Disney [6]). VERIFIED.
- Notes go next to the picture, never on it (Storyboard Pro caption fields [7], anime e-konte columns [8]). Camera arrows sit at the
  frame edge, subject arrows sit next to the subject, and notes are kept to a minimum [9][10]. VERIFIED.
- Explainer studios work the same way. Kurzgesagt settles each visual metaphor in a sketch phase [11]; client animatics are often stick
  figures over a scratch voice-over, with colour only after the motion is approved [12][13]; when what you see matches what you hear,
  understanding goes up (Joss Fong, Vox [14]). VERIFIED.
- Grey first, then colour "sparingly", as the strongest pointer (Knaflic, data viz [15]). VERIFIED. No source shows a red focus or camera
  mark as a studio standard; Storyboard Pro only draws its start and end camera frames in green and red [16]. VERIFIED.

## 2. The look
| Token | Hex | L\* | Use |
|---|---|---|---|
| paper | `#F7F5F0` | 97 | The page, sky, far plane and caption band. A neutral off-white: today's cream `#f3ebdd` reads as finished design. |
| light | `#CDCBC6` | 82 | Middle-plane masses (walls, a table, buildings behind); sky only when it must separate from the ground. |
| mid | `#9A9893` | 63 | Cast shadows and the subject's ground shadow, far-plane lines, slug and notes text. |
| dark | `#3A3835` | 24 | The subject's one mass (a screen, a body, the bar that matters). The only dark area in the panel. |
| ink | `#1F1E1C` | 11 | All subject and middle-plane lines, labels, numbers and captions. |
| red pencil | `#C23B22` | 45 | **Annotation layer only** (§4): one focus or camera mark. Never a fill, never on an object in the scene; most panels have none. |
- Neighbouring tones are 15+ L\* apart, so they hold up on a phone and at small size. The darkest tone meets the lightest only at the subject.
  Nothing in the scene has a hue. Marks are red because a grey arrow reads as an object in the scene; if the owner sees red as colour, marks become dashed ink.
- **Line weights:** subject outline 9 px ink; the subject's inner details and middle-plane lines 5 px ink; far plane 3 px mid grey, or no
  line (a flat light shape); marks 5 px. Nothing that has to be read is under 3 px. One clean round-capped stroke per edge: at most 8 px of
  overshoot (none on the subject), no construction tails, no breaks in long lines. **Texture: placeholder tone only** (the `{t:'scribble'}` mass — owner-approved sketchbook texture, 2026-10-27 — and
  flat mid-grey rects; the remaining `G3_ANIMATIC.md` §3 primitives when built — mid/far/dress roles, placeholder tone, never decoration). Still banned: hatching as rendering, grain, gradients, caption glow.

## 3. Drawing rules
- **One idea per panel.** Write the idea as one sentence first ("a hand taps Add to cart; the price jumps"). Two ideas means two panels,
  cut on the voice. Exactly one subject; 12-25 elements, and over 30 the panel gets split (`role:'dress'` placeholder elements exempt — `G3_ANIMATIC.md` §3).
- **Staging:** the subject sits on the centre axis (x 380-700) of the read zone (y 600-1250). It spans 35-60 % of the 760 px stage
  (at least 270 px) with 80 px of clear paper around it, and keeps its screen spot across a cut unless the cut is about movement.
  Before goes on the left, after on the right; more goes up or taller; time runs left to right. A scale panel inverts the
  size rule: its subject is too big to take in (§7, shot `scale: true`).
- **Silhouette and depth:** filled solid black at 270 x 480, the subject and its action can still be named; nothing touches its key edge,
  hands stay off faces and bodies, objects overlap clearly or keep 30 px apart. At most 3 planes: subject (9 px, a dark mass, or paper-white
  against light), middle (5 px, light fill), far (3 px mid-grey lines or a flat light shape, no detail). Overlap does the rest; no perspective grids.
- **People are gesture figures:** a head circle (r = 0.09 h), a bean-shaped torso along one curved line of action, limb lines, mitten
  hands, and arms held away from the body so the gaps show the pose. The pose is the verb (reach, point, shrug, slump, look up). Add a face
  only when the emotion is the beat (dot eyes, one brow line, one mouth line). A crowd is a row of small mid-grey figures, all the same size.
- **Objects** come from the icon kit, in their usual view (from slightly above, at 3/4), with the one feature that names them exaggerated:
  a laptop's open hinge and keyboard, a 1:2 phone with a notch, a price tag's hole and string, a chip's pins, a rack's stacked slots.
  Never a box with a word in it. If an object can't be drawn so that people recognise it, rethink the panel.
- **Charts:** a chart that fills the panel is the subject, at least 60 % of the stage wide. The axes are an L at 5 px, with no grid or
  ticks. Draw one line (9 px ink, drawn on with the voice) or 3-5 bars (the one that matters dark, the rest light). A comparison line is
  3 px mid grey. At most two axis words, at 56 px ("2005", "now").
- **Numbers:** one per panel, handwritten 120-160 px ink, on or touching what it measures, with its unit ("$1,299"). A change is the old
  number struck through, with the new one beside it. "How many" is a row of equal small icons (Isotype), not one bigger icon.
- **Labels:** at most one per panel, 56-72 px ink in the caption hand, within 40 px of its object, with no box. Use one only when the
  picture can't say it and the word will be in the final film; it never repeats the caption. No sources or footnotes in the frame.
- **Space:** at least 40 % of the SUBJECT ZONE is low-detail (plain paper or flat scribble tone), so the subject
  breathes. Outside the subject zone, bare paper is legal only where the final film stays plain, declared
  `negative: true`; every surface that will be dense or alive at G5 carries a placeholder mass (`G3_ANIMATIC.md` §3).
  A set panel over ~55 % bare stage, or a wide with no `role:'dress'` layer, is a lint WARN. Nothing important sits within 120 px of a side edge or under the UI rail (x > 780,
  y > 840). The **caption band** (y 290-600) is plain paper or one flat light sky, and no lines cross it. The captions keep today's
  in-place pop (100 px ink), and the frame-0 payoff line sits above them.
- **Notes strip (big words, v3 G3 fix round):** one strip at y 1680-1920, paper with a 2 px light rule, written for the director
  reading a 25 % contact sheet. Line 1, 48 px ink, bold, at most 2 lines: shot id, shot type, COZY / SCALE and the camera move
  ("S9 · SCALE 2/3: RISE over OUR ROOF (the big move)"). Line 2, 38 px ink, at most 2 lines: the one idea in plain words, then
  the transition. Data: `note: "line 1\nline 2"`; SketchReel appends the move word when line 1 does not name it. No label,
  no timecode, no mid-grey text: 31 px grey slug-first notes were unreadable on the sheet. If the picture needs a word to be
  read (a grey slab that is OUR ROOF), line 2 says it. Nothing is drawn under the text.

## 4. Camera and motion notation
- **Every cut, camera move, element animation and transition the final film will have is PLAYED in the animatic**
  with its real path shape and real timing (retimed to the reel: the reference gives the shape, never the speed), at
  sketch fidelity: drawn actions as 2-4 stepped key poses on their words, fast transits as one smear, ambient life as
  2-3 looping micro-moves per set panel, rough in/out easing only. A still panel is a claim that the G5 shot is still.
  Deferred to G5/G6: overshoot, settle, secondary motion, easing feel, morph tweens. Full rules and the transition
  grammar: `docs/G3_ANIMATIC.md` §4.
- **Real camera moves:** a push-in that reveals or isolates, or a rise or pan that reveals scale. Both end frames have to
  pass the checklist as panels; the subject is never cut off at an edge for more than 0.3 s. Every move ships its five
  values (move word, duration, start/end offset or scale, anchor, ease) and eases in AND out; speed budget ~15 px/frame
  at the render rate (~900 px/s at 60 fps — a lint WARN resolved by the sound-on check at 1x; derivation in
  `G3_ANIMATIC.md` §4). **A zoom of more than 2x becomes a cut to a closer panel** (a cut-in reads instantly; the 4.2x
  zoom in S8 did not). Board-mode parallax only behind `shot.parallax: true` (rise-over planes).
- **Arrows: none over a move we animate.** The move is its own notation, and an arrow would be one more thing to read. Paper boards need
  arrows because they can't move; even Storyboard Pro makes its camera frames optional in PDF exports [18] (REPORTED). A red mark appears
  only when (1) a move is planned but not animated yet (dashed end-frame box, corner arrows and the word, held for the panel); (2) a
  push-in targets something under 15 % of the frame width (the end-frame box for the first 0.4 s); or (3) the subject's path is the idea but isn't
  animated (one arrow beside the subject). Words: PUSH IN, PULL OUT, PAN L/R, RISE, TILT UP, HOLD (never "truck" or "zoom", which are ambiguous).
  Cases (1) and (3) are legal only in internal interim drafts: on any owner-facing render they are a lint FAIL — a mark
  where a played move belongs is the held-drawing loophole the animated-sketchbook rule retires (owner, 2026-10-26).
- The slug always names the camera move and the transition (every G3 transition is labelled). Cut by default; dissolves per `G3_ANIMATIC.md` §4: 0.2-0.4 s to
  soften, 1-2 s only for time passing. Frame 0 follows the playbook: lines, then tones, voice from frame 1. No other drawing draws itself on except a chart line, in step with the voice.

## 5. Speed: how to iterate
- **Thumbnails first:** for each beat, write the sentence, render 3 variants (a different subject size or angle) as 270 x 480 board stills
  on one contact sheet, pick one by the checklist, then finish that panel's JSON. Thumbnails are the first draft (Lefler [19], VERIFIED),
  "thinking" drawings (Matt Jones, Pixar [20], REPORTED). The whole reel as a 25 % contact sheet is the pacing check, before any MP4.
  Sheet samples: one frame per panel at its middle, never inside a caption's 2-frame pop (at least 0.07 s after a word starts,
  or the caption reads as fading text), the animated big move as its start AND landing frames, and every change that is the
  panel's idea already on screen at the sampled frame (put it on the earliest word that names it; hold it >= 1 s).
- **Re-board only the panel that fails:** each note (from the owner or a cold read) maps to a shot id plus a checklist number. Change that shot's JSON
  only, re-render its stills, then the 540p 60 fps reel (smoothness is judged at the film's real rate; `G3_ANIMATIC.md` §5). Panels that passed stay frozen. A fix is usually a swap from the kit (an icon,
  a pose, a size). Nothing is polished at G3: no colour, no final line, no easing feel, no line boil — but density placeholders,
  ambient loops and played moves are SIGNAL, not polish, and are required (`G3_ANIMATIC.md` §2).
- **Sound-off checklist, per panel, at 270 x 480:** (1) one sentence, one subject; (2) filled black, subject and action still named;
  (3) squinting or at 25 %, the eye lands on the subject within ~1 s (heaviest line, darkest against lightest); (4) 3 weights, 4 tones, no hue
  but at most one red mark; (5) subject centred, 35-60 % of the stage (a scale panel: >= 60 % of the frame or cut by both sides), 80 px clear, caption band empty, nothing key at an edge; (6) every object
  named by its shape (no words in boxes), lines that add nothing deleted; (7) at most 1 label (56+ px) and 1 number, no text repeating the
  caption, no sources in frame; (8) a cold reader, sound off, says the sentence from (1); (9) the notes strip's line 1 names the
  shot type, COZY / SCALE and the move, line 2 the idea, both readable on the sheet; (10) sound on at 1x: every move
  readable, no strobe, every cut lands on its word, cuts judged in pairs; (11) no panel surface both empty and
  undeclared (`negative: true` or a placeholder), and each set panel answers 'does this place feel inhabited?';
  (12) the subject stays the same size and on its ground line across a shot's poses unless the change is the idea.

## 6. Implementation notes for SketchReel (`Animatic.style: 'board' | 'sketch'`, default `board` at G3)
| Today | Board mode |
|---|---|
| `PAPER #f3ebdd`; `LEAD #4a443e` at 4 px everywhere | paper `#F7F5F0`; stroke set by `role`: subject 9 px ink, mid 5 px ink, far 3 px mid grey |
| fills `paper` / `warm`, `cold` / `dark` | paper (opaque, covers what is behind) / light / dark if `role: subject`, otherwise mid |
| fill `pop` | dark + `role: subject` (emphasis by value); a red `mark` only if something still needs pointing at |
| `hatch` | a flat mid-grey rect with no strokes |
| `label` (34 px MUTED), `text` (48 px) | ink, 56-72 px; lint flags a second label or text under 48 px |
| icon palette `C` (screen blue, lit yellow…) | `boardTone(hex)` snaps each colour's brightness to the nearest of the 4 tones; outlines follow `role`, details 3 px |
| `figure` (head + trapezoid) · `f` parallax | a gesture figure from `pose` · `f` doesn't move anything; it sets the default `role` (`far` if f < 0.5) |
| `shot.note` + top-left label · caption glow | the notes strip at y 1680-1920 (§3: line 1 / line 2) · glow removed (the band is empty) |
| `sketch.ts` overshoot and breaks | `over: 'small'` (`'none'` on the subject), `breaks: false`, `jitter` at most 0.8 |
New props: `role?: 'subject'|'mid'|'far'` on every element, icons and figures included; `sw?: number`, a rare stroke override (`w` is already a width);
shot `scale?: true` for a scale panel (the lint then wants its subject BIG: >= 60 % of the frame or cut by both side edges);
figure `pose?: 'stand'|'walk'|'point'|'reach'|'hold'|'shrug'|'slump'|'lookup'|'sit'`, `facing?: 'l'|'r'`,
`face?: 'none'|'happy'|'sad'|'shock'|'worried'`; text `strike?: boolean`; a new element `{t: 'mark', kind: 'circle'|'arrow'|'underline'|'frame',
…, word?}` on the red annotation layer (5 px; `frame` = a dashed end-frame box with corner arrows), with `in` and `out` like any other element.
**`board-lint` runs before every render.** Per shot it checks: at most 25 elements (warn at 30 to split); one subject group; at most 1 label and 1
mark; text at least 48 px; fills from the palette only; nothing crossing y 290-600 except a `far` flat fill; the subject's box centred
in x 380-700 and 270-460 px wide (a tall subject such as a standing figure is measured by its height, 300-650 px; a `scale` panel's
subject at least 648 px or cut by both side edges); a bare year ("2005") counts as an axis word, not the number; the camera's zoom
changing by at most 2x within a shot. Plus the `G3_ANIMATIC.md` §7 tier-1 checks: dress-layer exemption, move
five-values, speed WARN (~15 px/frame at the render rate, measured only over moves >= 2 frames, whip/carry shots
exempt), the default-cut check, the camera-plan cross-check (every plan row's move / transition device / `life:` item
exists in the board JSON), `life:` coverage, unaccounted emptiness (subject breathing ring and edge margins exempt;
FAIL = >= 4 contiguous undeclared bare cells), zero-ambient FAIL on set panels, red-mark cases (1)/(3) FAIL on
owner-facing renders. Boxes are measured on screen (clipped to the frame and the stage above the notes strip); a subject cut by a frame edge
(a waist-up figure) is measured by its visible width. Element moves take `ease` (default `inout`; `outSine` for a
rise-over's ledge). Implemented: `scripts/v3/board_lint.py` (props and defaults: the header of `src/v3/SketchReel.tsx`);
a worked board with every pattern (home base as 1-element window, icon ticker, element reuse, two-layer rise-over):
`scripts/v3/build_board_cine.py`.

## 7. Cinematography belongs in the board (owner, 2026-10-26)
Clarity and cinematics are not a trade-off. Each panel names its shot type and framing, drawn in monochrome:
- **Home base = cozy enclosure** (`COZY_AND_SCALE.md` §2-3): walls/shelf as dark masses cut by 2 frame edges, ONE opening
  (the window, 15-30 % of the frame) in light grey; the lamp pool as a light-grey shape. The subject stays the darkest.
  Reads as a window, not a screen (v3 G3): landscape glass, a sill, the lamp shade over one lower corner, the view in it
  (horizon, landmark) and ONE mullion in clear glass, never across the landmark or its sign (a cross over the subject
  brought back "screen or blinds?"); the landmark's body in paper so it separates from the light glass. The pool sits
  on a darker surface (the desk as part of the mid refuge mass) as a paper ellipse; on plain paper it reads as a stain.
- **The home base is ONE room tone (v3 G3 fix round):** a single far flat mid rect over the whole frame (wall, shelf and desk),
  so the light glass is the lightest thing around it; a light window on blank paper is darker than its surround and reads as
  a picture or a screen. Every home-base panel (the POV, the objective return, the close-ups at the desk, the callback)
  starts from the same room tone and the same lamp shade or pool, so the place visibly returns; a light desk on paper read
  as another place. In an objective return, reuse the opening's window and its outline of the landmark (scaled), never a
  new drawing: a tall slab with a cross read as a glass door, a box with notches as a castle. A cut-in keeps the object
  it cuts into (S15's phone, 1.275x on its axis), not a look-alike.
- **Scale** (`CINEMATIC_GUIDE.md`): the one big move (S1 rise-over reveal) drawn with its planes; a scale CUT from a close
  panel to a tiny figure (0.04-0.08 H, so at least ~80 px: a 3 % figure is a 15 px speck on the cold-read thumbnail;
  fix the plan, not the floor) under something huge; a low or worm's-eye angle for the colossus. Mark a move with the
  red `frame` / arrow notation only when it is not animated (§4); an animated move is its own notation.
- **Scale panels are BIG, never a centred object on paper (fix round):** shot `scale: true`. The reveal lands with the
  colossus cut by BOTH side edges (a wide hall, its sign readable), with a ruler at its foot (a row of houses, drawn paper
  with far lines so they show on a light body). The rise-over's near plane must read as OUR ROOF: a parapet lip (a light
  coping strip) and one vent in the roof's tone, and "OUR ROOF" in the notes; a flat grey slab read as ground, a hill or a
  sinking building. The worm's-eye: horizon low (~0.78 H), the colossus or pile past both side edges up to the caption band,
  >= 10:1 over the figure; the tiny figure stands on plain ground IN FRONT (against a busy colossus it vanishes). The ladder's
  small end: the one object breaks out of its container (over the bezel and the keys) and is the biggest whole thing in the
  frame (>= 60 % W); inside a screen rectangle it reads as a picture on the display.
- **Angle and size vary on purpose:** close for the personal beat, wide for the system, the home base to return to. Never
  three wides in a row that share a centred landmark on a ground line: change the angle (eye-level reveal, worm's-eye,
  slightly high) as well as the size.
- **A queue reads in depth:** look up the line from slightly above, the road as one light band from the waiting one (near,
  big, its cargo readable) to the source's door (far), the first in line at the door getting the goods, and one waiting cue
  (three dots over the cab). Side-on, the same objects read as "three buildings side by side". The reprise of a matched
  frame changes only what the voice says (who cuts in, who is pushed back) and moves the subject role to the newcomer.
- **Literal reads, small things (fix round cold read):** the mildest face that carries the beat (a shock face read as
  "something bad happened"); "better" drawn as bigger plus the voice's own word as the label; an object keeps its tone
  across panels unless the change is the idea (a laptop turned dark read as "a different, infected laptop"); a speech
  bubble's speaker is a figure and the tail ends at its head (a tail toward buildings has no speaker); the stake's number
  is on frame 0 and in the loop frame (an empty tag read as "price unknown").
- The sound-off read still rules: if a cinematic choice makes a panel unreadable, simplify the drawing, not the framing.

**Camera plan first (v3 G3, 2026-10-26; example `docs/v3/camera_plan_g3.md`).** Before re-boarding, the cinematographer
writes one row per panel: time, idea, shot type, framing, cozy/scale element, move, readability note, plus the notes-strip
lines. Then check the whole film:
- **Moves:** every cut, camera move, element action and transition the final film will have is PLAYED at sketch
  fidelity (`G3_ANIMATIC.md` §4-5; speed budget ~15 px/frame at the render rate, a lint WARN). "At most two" is retired;
  a held panel is a CLAIM that the G5 shot is still (G5 adds only the 1.5-2 % breathes and polish, never new motion).
- **Home base:** it opens the film, returns on the quiet beat (the waiting / thinking line) and hosts the callback; close-ups
  at the viewer's desk keep it with just a lamp-pool ellipse (0.5-0.7 W, wider than the object on it, so it reads as
  light, not a mat). Cozy is at least 50 % of the runtime outside full-frame chart inserts (`COZY_AND_SCALE.md` §1.3:
  an insert is a neutral breath); the nook is breached once.
- **Scale:** one moment (1.5-4 s) built as a ladder: a close-up of the one thing, the reveal of many, then ONE cut to a
  tiny figure (change the angle as well as the size, so the second wide steps up instead of repeating).
- **An S5 pull-back lands on the tiny figure inside the move** instead of a separate scale cut (v3, 2026-10-26).
- **Size or angle changes at every cut,** except a deliberate match (the same chart again, the same place later, the
  callback to the opening's end frame), which keeps the exact frame so the change is the only difference.
- **Rise-over in board mode = two layers:** the camera rises a little (the world sinks ~120 px, so nothing enters the
  caption band; ease `unveil`, landing on the key word) while the near ledge drops on its own move with ease `outSine`
  over the WHOLE panel. Budget the speed on screen: camera + own move at most 15 px per 30 fps frame (a sine ease-out
  peaks at pi/2 x the average speed; a quad or cubic ease-out landing early peaks at 2-3x and strobes). v3 S9: 120 px
  of camera + 384 px own move = 520 px on screen in 1.92 s, peak 14.8. Start with the ledge hiding about half the
  landmark, its sign showing; things flying in enter from the side edges when the landmark's top sits near the band.
  Board-mode parallax plays behind `shot.parallax: true` (rise-over planes, `G3_ANIMATIC.md` §4 — tier-2 tooling); other shots stay flat.
- **Close-ups are redrawn at size, never zoomed** (line weights scale with the camera). **Charts are straight-on, level
  inserts** (an angle bends the number). **A match is built, not redrawn:** the builder makes the reprise from the first
  panel's element list plus the changes (a redrawn S6 dropped S4's axis word; a redrawn S14 moved S10's ground line).
- **The low angle goes on the quantity, never on the thing under critique** (no villain): the pile of chips gets the
  worm's-eye; the company's building stays at eye level.
- **The opening shows the real mechanism, never a growth or consumption metaphor:** each unit of cause is one visible
  tick of the viewer's stake (one memory stick leaves, the price ticks up one step); the cause sits outside the
  home-base window, the effect in the hand, and both change on the payoff word (`CINEMATIC_GUIDE.md`, "The opening").

## Sources
[1] https://www.moma.org/audio/playlist/192/2574 · [2] https://2719hyperion.com/2009/05/conversation-with-joe-ranft.html · [3] https://www.creativebloq.com/advice/storyboard-tips
[4] https://community.wacom.com/en-us/how-to-storyboarding-with-klaus-scherwinski/ · [5] https://proko.com/course-lesson/how-to-draw-with-line-weight/notes
[6] https://douglefler.com/drawing-tips-silhouettes/ · [7] https://docs.toonboom.com/help/storyboard-pro-24/storyboard/caption/about-default-panel-caption.html
[8] https://animetudes.com/2023/04/13/atom-storyboards/ · [9] https://www.vpl.ca/guide/inspiration-lab-storyboarding/storyboarding-conventions · [10] https://www.storyboardthat.com/storyboards/sarah/camera-arrows
[11] https://kurzgesagt.org/youtube/ · [12] https://boldcontentvideo.com/?p=45699 · [13] https://www.mechanismdigital.com/post/trust-the-process · [14] https://videoconsortium.org/mag/episode-1-joss-fong
[15] https://www.storytellingwithdata.com/blog/2015/03/the-biggest-bang-for-your-buck · [16] https://docs.toonboom.com/help/storyboard-pro-22/storyboard/camera/about-camera-move.html
[17] https://www.awn.com/animationworld/director-and-after-effects-storyboarding-innovations-iron-giant · [18] https://mac.softpedia.com/progChangelog/Toon-Boom-Storyboard-Pro-Changelog-24676.html
[19] https://douglefler.com/the-art-of-thumbnails/ · [20] https://www.pressreader.com/australia/imagine-fx/20170127/282213715529141
