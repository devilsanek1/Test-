# Storyboard style: the "board" look for every G3 animatic (house style, 2026-10-26)

Owner, v3 G3: "the sketch is making it confusing ... very simple, avoid colours for now ... like an actual drawing". The spec for SketchReel's
`board` mode and the brief for storyboard agents (evidence: `research/storyboard_{feature,series,craft}.md`). **VERIFIED** = primary page or
sources agree; **REPORTED** = one secondary source or search summary; numbers without a source are our own choices for a 1080 x 1920 phone frame.

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
  overshoot (none on the subject), no construction tails, no breaks in long lines. **Texture: none** (no hatching, grain, gradients or caption glow).

## 3. Drawing rules
- **One idea per panel.** Write the idea as one sentence first ("a hand taps Add to cart; the price jumps"). Two ideas means two panels,
  cut on the voice. Exactly one subject; 12-25 elements, and over 30 the panel gets split.
- **Staging:** the subject sits on the centre axis (x 380-700) of the read zone (y 600-1250). It spans 35-60 % of the 760 px stage
  (at least 270 px) with 80 px of clear paper around it, and keeps its screen spot across a cut unless the cut is about movement.
  Before goes on the left, after on the right; more goes up or taller; time runs left to right.
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
- **Space:** at least 40 % of the stage is plain paper. Nothing important sits within 120 px of a side edge or under the UI rail (x > 780,
  y > 840). The **caption band** (y 290-600) is plain paper or one flat light sky, and no lines cross it. The captions keep today's
  in-place pop (100 px ink), and the frame-0 payoff line sits above them.
- **Notes strip:** the director's note and the slug (shot, transition, camera word, timecode) go in one strip at y 1680-1900: paper with a
  2 px light rule, 30-32 px mid grey, at most 2 lines. Nothing is drawn under the text; below the stage the ground is light or plain paper.

## 4. Camera and motion notation
- **By default a panel is a held drawing, cut on the voice.** Motion is used only where the motion is the meaning (the Iron Giant reels
  tested camera moves early, crude on purpose [17], REPORTED). An element pops in on the word that names it (at most 3 per panel). An
  element moves only when its movement is the idea (the price tag climbing), in a straight line with easing.
- **Real camera moves:** a push-in that reveals or isolates (at most 1.6x), or a rise or pan that reveals scale. Both end frames have to
  pass the checklist as panels; the subject is never cut off at an edge for more than 0.3 s; at most one move per three panels.
  **A zoom of more than 2x becomes a cut to a closer panel** (a cut-in reads instantly; the 4.2x zoom in S8 did not). No parallax in board mode.
- **Arrows: none over a move we animate.** The move is its own notation, and an arrow would be one more thing to read. Paper boards need
  arrows because they can't move; even Storyboard Pro makes its camera frames optional in PDF exports [18] (REPORTED). A red mark appears
  only when (1) a move is planned but not animated yet (dashed end-frame box, corner arrows and the word, held for the panel); (2) a
  push-in targets something under 15 % of the frame width (the end-frame box for the first 0.4 s); or (3) the subject's path is the idea but isn't
  animated (one arrow beside the subject). Words: PUSH IN, PULL OUT, PAN L/R, RISE, TILT UP, HOLD (never "truck" or "zoom", which are ambiguous).
- The slug always names the camera move and the transition (every G3 transition is labelled). Cut by default; a dissolve means time
  passes. Frame 0 follows the playbook: lines, then tones, voice from frame 1. No other drawing draws itself on except a chart line, in step with the voice.

## 5. Speed: how to iterate
- **Thumbnails first:** for each beat, write the sentence, render 3 variants (a different subject size or angle) as 270 x 480 board stills
  on one contact sheet, pick one by the checklist, then finish that panel's JSON. Thumbnails are the first draft (Lefler [19], VERIFIED),
  "thinking" drawings (Matt Jones, Pixar [20], REPORTED). The whole reel as a 25 % contact sheet is the pacing check, before any MP4.
- **Re-board only the panel that fails:** each note (from the owner or a cold read) maps to a shot id plus a checklist number. Change that shot's JSON
  only, re-render its stills, then the 540p 30 fps reel. Panels that passed stay frozen. A fix is usually a swap from the kit (an icon,
  a pose, a size). Nothing is polished at G3: no parallax, texture, colour or extra draw-on.
- **Sound-off checklist, per panel, at 270 x 480:** (1) one sentence, one subject; (2) filled black, subject and action still named;
  (3) squinting or at 25 %, the eye lands on the subject within ~1 s (heaviest line, darkest against lightest); (4) 3 weights, 4 tones, no hue
  but at most one red mark; (5) subject centred, 35-60 % of the stage, 80 px clear, caption band empty, nothing key at an edge; (6) every object
  named by its shape (no words in boxes), lines that add nothing deleted; (7) at most 1 label (56+ px) and 1 number, no text repeating the
  caption, no sources in frame; (8) a cold reader, sound off, says the sentence from (1).

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
| `shot.note` + top-left label · caption glow | the notes strip at y 1680-1900 · glow removed (the band is empty) |
| `sketch.ts` overshoot and breaks | `over: 'small'` (`'none'` on the subject), `breaks: false`, `jitter` at most 0.8 |
New props: `role?: 'subject'|'mid'|'far'` on every element, icons and figures included; `sw?: number`, a rare stroke override (`w` is already a width);
figure `pose?: 'stand'|'walk'|'point'|'reach'|'hold'|'shrug'|'slump'|'lookup'|'sit'`, `facing?: 'l'|'r'`,
`face?: 'none'|'happy'|'sad'|'shock'|'worried'`; text `strike?: boolean`; a new element `{t: 'mark', kind: 'circle'|'arrow'|'underline'|'frame',
…, word?}` on the red annotation layer (5 px; `frame` = a dashed end-frame box with corner arrows), with `in` and `out` like any other element.
**`board-lint` runs before every render.** Per shot it checks: at most 25 elements (warn at 30 to split); one subject group; at most 1 label and 1
mark; text at least 48 px; fills from the palette only; nothing crossing y 290-600 except a `far` flat fill; the subject's box centred
in x 380-700 and 270-460 px wide (a tall subject such as a standing figure is measured by its height, 300-650 px); the camera's zoom
changing by at most 2x within a shot. Implemented: `scripts/v3/board_lint.py` (props and defaults: the header of `src/v3/SketchReel.tsx`).

## Sources
[1] https://www.moma.org/audio/playlist/192/2574 · [2] https://2719hyperion.com/2009/05/conversation-with-joe-ranft.html · [3] https://www.creativebloq.com/advice/storyboard-tips
[4] https://community.wacom.com/en-us/how-to-storyboarding-with-klaus-scherwinski/ · [5] https://proko.com/course-lesson/how-to-draw-with-line-weight/notes
[6] https://douglefler.com/drawing-tips-silhouettes/ · [7] https://docs.toonboom.com/help/storyboard-pro-24/storyboard/caption/about-default-panel-caption.html
[8] https://animetudes.com/2023/04/13/atom-storyboards/ · [9] https://www.vpl.ca/guide/inspiration-lab-storyboarding/storyboarding-conventions · [10] https://www.storyboardthat.com/storyboards/sarah/camera-arrows
[11] https://kurzgesagt.org/youtube/ · [12] https://boldcontentvideo.com/?p=45699 · [13] https://www.mechanismdigital.com/post/trust-the-process · [14] https://videoconsortium.org/mag/episode-1-joss-fong
[15] https://www.storytellingwithdata.com/blog/2015/03/the-biggest-bang-for-your-buck · [16] https://docs.toonboom.com/help/storyboard-pro-22/storyboard/camera/about-camera-move.html
[17] https://www.awn.com/animationworld/director-and-after-effects-storyboarding-innovations-iron-giant · [18] https://mac.softpedia.com/progChangelog/Toon-Boom-Storyboard-Pro-Changelog-24676.html
[19] https://douglefler.com/the-art-of-thumbnails/ · [20] https://www.pressreader.com/australia/imagine-fx/20170127/282213715529141
