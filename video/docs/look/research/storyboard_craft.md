# Storyboard craft: making a monochrome panel read in one second (research lane, 2026-10-26)

For the G3 animatic (`video/src/v3/SketchReel.tsx`) after the owner's "make the sketch very simple, maybe no colours, like an actual
drawing". Companion to `storyboard_feature.md` (studio process); this is the drawing craft. **VERIFIED** = primary page read, or sources
agree; **REPORTED** = one secondary source or search summary; *(ours)* = our derivation. Scale (`vertical.md`): 1 px = 0.61 arcmin on a phone.

## 0. The rules in brief
1. **Fill it black: does it still read?** Every panel passes the silhouette test at 25 % size before anything else (§1).
2. **Three line weights in ink:** subject contour 9 px, inner and secondary lines 5 px, background 3 px in mid grey (§2).
3. **Three planes, at most four tones:** only the subject has black and detail; middle plane flat light grey; far plane faint (§3).
4. **One idea, one subject, centred on the stage** with empty paper round it; nothing important near an edge (§4).
5. **Draw objects the way everyone doodles them:** the one feature that names the thing, seen slightly from above (§5).
6. **Emphasis by contrast, weight, isolation and detail, not colour.** If any hue at all: one, on camera marks only (§6).
7. **Camera moves are marks:** the end frame as a box inside the panel, corner arrows, the word written in the arrow (§7).
8. **Thumbnail first:** three tiny versions of each beat, pick one, then build; "fewest lines wins" (§8).

## 1. The silhouette test
- Doug Lefler (Disney story artist): "make your ideas read in silhouette"; Disney trainees shaded the backs of flipped drawings
  "because the human eye can perceive the outline of a form quicker than it can perceive the internal detail". Digitally: fill the
  primary elements black on a layer [1]. VERIFIED. Poses that only work fully rendered "fall apart ... on small screens" [2]. REPORTED.
- *(ours)* For SVG: render the subject's shapes solid #000 on white, background off, at 270 x 480; a viewer must name the object and
  the action. Objects that touch: 30+ px apart or a clear overlap, never tangent. Hands off the face and body (`storyboard_feature.md` §3).

## 2. Line-weight hierarchy
- Thick lines come forward and read as important; thin lines recede (James Gurney) [3]. VERIFIED (sources agree).
- Proko: weight is value contrast as much as width; "heavy on the outside, medium on the inside, and the lightest lines for the
  smallest details"; "if all your lines are heavy, there are no heavy lines"; the heaviest line goes to the focal point; three weights
  "can do a lot" [4]. VERIFIED. Avoid too big a jump from heavy to medium [5] REPORTED; drafting steps ~1.4x (ISO 128) [5] REPORTED.
- Scherwinski (storyboard artist): strong outlines on the main subject; the middle figure gets "thinner line work and no separating
  outline" [6]. VERIFIED.
- *(ours)* For 1080 x 1920: subject contour **9 px** (0.54 mm on the phone); inner lines and secondary objects **5 px**; background
  **3 px** in mid grey; hatching 2 px, middle plane only, sparingly; camera marks 4 px dashed. Nothing that must read under 3 px (2 px is
  ~1.2 arcmin, at the edge of sight, and compression smears it). Today the tool draws every line at 4 px in #4a443e, so nothing leads.

## 3. Value grouping: 2-4 tones
- Scherwinski, on his own board: the front subject gets "the darkest areas and biggest amount of highlights" and the most rendering;
  the middle figure has "no black areas" and is "just a medium grey flat area"; the far one is "very washed out" and "becomes one with
  the background plane". "Storyboard artists rarely use color"; depth matters "more than almost anything else" [6]. VERIFIED.
- One value range per depth plane (black, grey or white, any order); muddy values hurt shapes at small size [7]. REPORTED. Dark
  foreground to light background is the usual order [8]. REPORTED.
- *(ours)* Palette (L\*): paper #F6F4EF (96); light grey #C8C8C8 (81) middle-plane fills; mid grey #8A8A8A (58) background lines and
  slugs; ink #222222 (13) subject lines and its one dark fill. Steps 15+ L\* apart; darkest meets lightest only at the focus.

## 4. Staging: one idea, placement, negative space
- One thing per panel (Joe Ranft; `storyboard_feature.md` §3). Scherwinski: keep everything central to the story in a "live area"
  away from the frame edge so the eye can't escape; thirds crossings have "nothing magical" about them; the main object reads as main
  partly "because there is only ONE of it"; repeated things come big, medium and small [6]. VERIFIED.
- One primary point of interest, isolated by negative space [2]; keep characters on the same side of screen across cuts [9]. REPORTED.
- *(ours, stage from `vertical.md`)*: draw in x 120-880, y 600-1250, below the captions (y 317-556). Subject on the centre axis
  (x 380-700), 35-60 % of the stage width, 80+ px of clear paper round its silhouette, same screen spot across a cut unless the cut is
  about movement. Before on the left, after on the right.

## 5. Everyday objects as instant forms
- Line drawings are recognised about as fast and as accurately as colour photos (Biederman and Ju 1988, via Hertzmann) [10]. VERIFIED.
  People picture objects from a "canonical" view, slightly above and to one side (Palmer, Rosch, Chase 1981) [11]. REPORTED. Isotype
  showed "more" as more copies of one same-size sign, not a bigger sign [12] VERIFIED, and avoided perspective [12] REPORTED.
  Simplifying amplifies meaning (McCloud) [13]. REPORTED.
- *(ours)* Library, each by its naming feature in the canonical view:
  - *Laptop:* 3/4 view from slightly above, screen tilted back ~110 deg, flat keyboard parallelogram, clear hinge. Front-on = a TV.
  - *Phone:* upright rounded rectangle 1:2, thick bezel, one dot at the top; held or tilted, or it reads as a card or a door.
  - *Building:* tall rectangle, grid of small windows, door on the ground line, a person beside it for scale. Bank = pediment + columns.
  - *Chart:* an L of axes + 3-5 bars, or one line ending in an arrowhead; no gridlines; numbers only if the number is the point; the
    bar that matters in ink, the rest mid grey.
  - *Money:* note = rectangle with a centre circle; coin = ellipse with an edge; more = a taller stack. *Person:* the pose carries it.

## 6. Emphasis without colour
- *(ours, from [4][6][2])* Strongest first: the only black-on-white contrast; the heaviest line; the only detail; isolation in empty
  space; size and centre position; the only thing moving; an annotation mark (circle or arrow) pointing at it.
- Data-viz practice: make everything light grey first, then colour "sparingly", "your single biggest tool for drawing your audience's
  attention" (Knaflic) [14]. VERIFIED, but for charts, not boards.
- **"A red marker for camera moves or focus" is NOT verified as a studio standard.** Found: Storyboard Pro draws the start camera frame
  green and the end frame red by default, into exports [15] VERIFIED; a Danger Mouse layout with scene notes in red pencil [16]
  REPORTED; one guide's own scheme of red for zooms, green for tracking [17] REPORTED. **Rule:** no hue in the drawing; if colour is
  ever used, one hue on the annotation layer only, so it never reads as part of the world. For now: annotations dashed mid grey.

## 7. Camera notation
- Mark Simon (*The Art of Storyboarding*): show a zoom "by outlining the framing of both extremes in one frame" with arrows; pans,
  tilts and tracking as one drawing over two or more frames with arrows; an arrow alone is ambiguous, so write "Tilt", "Crane" or the
  object's name inside it; dissolve = an X joining corners between two panels; cut = a small solid triangle pointing down between
  panels (animation boards); shake = lines round the corners; 3D arrows for depth [18]. VERIFIED.
- Storyboard That: pan = arrows on top and bottom edges ("PAN RIGHT"); zoom = four corner arrows in or out, possibly round one area;
  tilt = curved side arrows; camera marks at the edge, object-motion marks inside by the object [19]. VERIFIED. Camera lines thicker [20].
  REPORTED. Storyboard Pro: a smaller second camera frame = "truck in", a move along Z [15]. VERIFIED. In film "truck" can mean a
  sideways move [20], so write **PUSH IN / PULL OUT** *(ours)*. Capitals: PAN L, TILT UP, PUSH IN, HOLD, CUT, DISSOLVE.
- *(ours)* In our reel: at the shot start show the end frame as a dashed 4 px box with corner arrows for ~0.5 s, then move the camera
  into it. Cuts by default; a move only where the move is the meaning.

## 8. Captions and dialogue under panels; thumbnailing for speed
- Production boards carry scene/shot/panel numbers plus separate action and dialogue lines under every panel; thumbnail sheets carry
  none [21]. VERIFIED (template publisher). Animation templates add SOUND and NOTES lines [22]. REPORTED.
- *(ours)* The voice is our dialogue line and the pop captions sit in their own band; the drawing never sits under text and never
  repeats the caption's words. One fixed corner slug (shot number, camera word) in mid grey = the panel-number box. In-picture labels:
  at most one per panel, ink, 56+ px (today's 34 px grey labels are too small to read on a phone).
- Lefler: thumbnails are small sketches, several to a page, "a continuity of thought", the first draft of the board; at Disney he and
  Pete Young raced to draw gags and "the person who used the fewest lines would win"; "it takes more thought to express an idea in
  simple terms" [23]. VERIFIED. Scherwinski: settle composition while sketching, not at render time [6]. VERIFIED. Thumbnail templates
  put many panels on a page "to get a feeling for the rhythm" [21]. VERIFIED.
- *(ours)* For an agent: per beat, 3 compositions at 270 x 480 on one contact sheet (different subject size or angle), pick by §9,
  then write the shot JSON. The whole reel as a thumbnail strip doubles as the pacing check.

## 9. Per-panel checklist (artist or SVG agent)
1. The panel's one idea fits in one short sentence; there is exactly one subject.
2. Silhouette: subject filled #000 at 270 x 480; the object and the action can be named.
3. At 25 % size or squinting, the eye lands on the subject first, within about a second.
4. Three line weights only (9 / 5 / 3 px); the heaviest only on the subject; nothing that must read under 3 px.
5. At most 4 tones (paper, light grey, mid grey, ink); black only on the subject; background pale.
6. Subject on the centre axis, 35-60 % of stage width, 80+ px clear round it; nothing key within 120 px of an edge or under captions.
7. Each object drawn by its one naming feature in the canonical view; delete any line that names nothing.
8. No text that repeats the voice; at most one label, 56+ px, ink.
9. Every camera move has its mark (end-frame box, edge or corner arrows, the word); otherwise it is a cut.
10. No hue in the drawing; if a mark is coloured, it is the only colour and it sits on the annotation layer.

## Sources
[1] Lefler, Silhouettes: https://douglefler.com/drawing-tips-silhouettes/ · [2] Staging (community skill page):
https://playbooks.com/skills/dylantarre/animation-principles/staging-mastery · [3] Gurney: https://jamesgurney.substack.com/p/the-logic-of-line-weight
[4] Proko, line weight: https://proko.com/course-lesson/how-to-draw-with-line-weight/notes · [5] https://proko.com/course-lesson/project-organizing-line-weight ;
ISO 128: https://archademia.com/?p=16227 · [6] Scherwinski: https://community.wacom.com/en-us/how-to-storyboarding-with-klaus-scherwinski/
[7] Muddy Colors: https://www.muddycolors.com/?p=16666 · [8] https://forum.svslearn.com/post/131480 ; https://www.proko.com/community/topics/how-can-i-improve-my-concept-art
[9] Rubber Onion: https://www.rubberonion.com/blog/storyboards-stage-broken-egg-part-ii-2 · [10] Hertzmann: https://ar5iv.labs.arxiv.org/html/2002.06260
[11] https://www.blog.theteamw.com/2009/10/29/100-things-you-should-know-about-people-4-the-canonical-perspective/ ; https://etheses.durham.ac.uk/id/eprint/5789
[12] https://en.wikipedia.org/wiki/Isotype_(picture_language) ; https://oss.adm.ntu.edu.sg/sng093/isotype-picture-language/
[13] McCloud: https://www.ebsco.com/research-starters/literature-and-writing/understanding-comics-invisible-art-scott-mccloud · [14] Knaflic: https://www.storytellingwithdata.com/blog/2015/03/the-biggest-bang-for-your-buck
[15] Toon Boom: https://docs.toonboom.com/help/storyboard-pro-22/storyboard/camera/about-camera-move.html · [23] Lefler, Thumbnails: https://douglefler.com/the-art-of-thumbnails/
[16] https://propstore.com/product/danger-mouse-tv-series-1981-1992/349-dangermouse-penfold-and-colonel-k-set-of-three-original-camera-layout-drawings/
[17] https://filmlifestyle.com/storyboard-arrows/ · [18] Mark Simon ch. 26: https://tfreites.weebly.com/uploads/2/6/3/8/26387211/s._mark_-_storyboards_montion_in_art__b_.pdf
[19] https://www.storyboardthat.com/storyboards/sarah/camera-arrows · [20] VPL: https://vpl.ca/guide/storyboarding-conventions
[21] Bloop: https://www.bloopanimation.com/storyboard-template/ · [22] Boords: https://boords.com/storyboard-template/animation
