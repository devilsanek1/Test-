# How series, anime and explainer studios board fast and keep boards readable (research lane, 2026-10-26)

For the owner's G3 note: "the sketch is making it confusing; make it very simple, maybe no colours, like an actual drawing".
Tags: **VERIFIED** = page read here (plain-text fetch), or several sources agree; **REPORTED** = search summary or one
secondary source (some pages sat behind bot checks, which we did not get around). *(proposal)* = our idea, to test at G3.
Sister lanes: `vertical.md` (phone geometry, UI margins), `arcane.md` (camera). Sources are listed at the end.

## 0. The rules in brief

1. **The animatic is black and white. Colour is a separate, later step.** Pixar's story reels are black and white so the
   team can move fast; colour comes from a separate colour script. Arcane also does its colourscript after or alongside
   the boards (S11 REPORTED, S8 VERIFIED).
2. **One idea per drawing.** "The audience can only look at one thing at a time." If something takes two steps, draw two
   panels: look, what they see, reaction (S1 VERIFIED).
3. **Draw clearly, not cleanly** (Ollie Johnston, quoted in S1). Rough lines are fine, but the subject must be readable as
   a silhouette, and it should be "the only object of that size, shape and value" in the frame (S1 VERIFIED).
4. **Draw the thing, don't label a box.** "If we can't tell what something is, take it out" (S24 REPORTED). Kurzgesagt
   settles each scene's visual metaphor in a sketch phase before any illustration (S12 VERIFIED).
5. **Keep the notes off the picture.** Every pro format keeps dialogue, action, timing and camera notes in fields or
   columns next to the panel, not on it (Toon Boom: S3 VERIFIED; anime e-konte: S6 VERIFIED).
6. **The picture shows what the voice says, while it says it.** Don't repeat the narration as on-screen text (Joss Fong of
   Vox, S16 VERIFIED; the multimedia-learning principles, S22 VERIFIED).
7. **Rough timing on purpose.** Professional animatics are mostly held drawings, cut to the voice, with motion only where
   the timing is the question (a circle jumping between windows; a still sliding across) (S19, S18 VERIFIED).
8. **Iterate in small rounds at small sizes.** Draw stamp-sized thumbnails, pick the one that reads best, then rough it
   up (S1, S19 VERIFIED). Arcane boards go through 3 to 6 rounds, from thumbnails to sketch to clean (S10 REPORTED).

## 1. TV animation boards (Toon Boom Storyboard Pro conventions)

- **Structure:** a *panel* is one drawing (one action); a *scene* is a new camera angle (one or more panels); a *sequence*
  is one location (S2 VERIFIED). Our `Shot` is the scene; we have no "panel" level yet.
- **Caption fields per panel**, under the drawing: Dialogue, Action Notes, Slugging (timing notes for the animatic), and
  Notes (scene heading, props, sound, continuity) (S3 VERIFIED).
- **Camera notation:** a move is two frames, A and B (IN and OUT in Storyboard Pro's PDF). Camera arrows are thick and sit at
  the frame edge; arrows for a subject's motion sit next to that subject (S4, S5 REPORTED).
- **Steps:** small, fast thumbnails (e.g. 4 options for one beat), the best one blown up to a *rough*, review by the
  director, then *cleanup*, where "tone may be added" (S1 VERIFIED).
- **Readability:** the horizon line is drawn first; low horizons give clean silhouettes; overlap and line weight show depth;
  to test a pose, fill it solid and check the action still reads (S1 VERIFIED).

## 2. Anime e-konte

- **Format:** 5 panels per page; 5 columns: cut number, picture, written description, lines (dialogue), and seconds +
  frames. This has been the standard since Mushi Pro in the 1960s (S6 VERIFIED).
- **Words:** short tags such as PAN, T.U. (track up, the camera moves closer), T.B. (track back), "OL 2"" (a 2 s overlap) and
  "repeat". Backgrounds are often one word ("sky"). Detail varies by director (some draw a lot and write little, others
  the reverse), but "storyboards are, first and foremost, instruments of communication" (S6 VERIFIED).
- **Video konte:** Makoto Shinkai builds a timed storyboard video and voices every character himself, as a scratch track
  (S7 REPORTED, three secondary sources agree). This is the same job as our G3 animatic.

## 3. Arcane (Fortiche) and Pixar

- The boards set the choreography, angles and framing, and layout matches them one-to-one (S9 REPORTED; `arcane.md`).
  Fortiche boards against sample music to set the mood quickly; a separate colourscript vignette per sequence, made after
  or during the boards, carries the colour story (S8 VERIFIED).
- Pixar: the story reel is black and white "so they can move very fast"; colour scripts are "mostly about the emotional
  tone", in abstract shapes, as a separate track (S11 REPORTED).

## 4. Explainer and motion studios (30-90 s)

- **Kurzgesagt:** research, script (about a dozen drafts), a sketch phase where they "deliberate over the best visual
  metaphors", then illustration; the narration sets the timing (S12 VERIFIED). Dettmer wanted "a condensed way to
  illustrate things, with simple shapes"; the team's script feedback round is about how clear and concise it is (S13 VERIFIED).
- **TED-Ed:** one Storyboard Pro board/animatic took 4 days for a 5.5 min lesson. The educator checked that the images were
  accurate, and the designer aimed to "go further explaining the lesson than just illustrating his words" (S14 VERIFIED).
  Order: script, storyboard, narration approved, then animation (S15 VERIFIED).
- **Vox:** "the perfect correspondence between what you're seeing … and what you're hearing tends to boost comprehension
  and retention"; data gets walked through "in a very physical way" (S16 VERIFIED).
- **Giant Ant:** most cameras are suggested in the board, then tested and improved in animation (S17 VERIFIED).
- **Client loop:** boards are "thumbnail sketches of each key point, like a comic book", with arrows for motion and the VO
  line. They take a couple of rounds, with frames dropped or added. Then an animatic at the final length on a scratch VO.
  The first motion pass has dull colours, and the client approves the motion before polish (S18 VERIFIED).
- One animator's animatic reused the board drawings, with "a circle jump[ing] from window to window" to test timing, and
  a wiggle look so the client won't think it is final. Motion with the voice gets "a different response than a static
  image" (S19 VERIFIED). Stick-figure animatics are common (S20 VERIFIED). A typical note on student work: "too detailed
  for an animatic" (S21 REPORTED). **Buck, and Vox's internal boards:** no first-hand source found (gap).

## 5. Readable on a phone (vertical)

- Think of the frame as three bands: the subject upper-centre, the main action centre, secondary information below.
  Vertical moves (rising, a reveal from below) read well; horizontal chases leave the frame quickly. Preview at real phone
  size (S23 REPORTED, vendor). UI margins and our phone numbers are in `vertical.md`.
- Signalling: make the one essential thing stand out by contrast and dim the rest. Put a label next to its thing, not in
  a legend. Show each picture on the word that names it (S22 VERIFIED).

## 6. What this means for SketchReel *(proposal; diagnosis from `public/v3/animatic.json` and `src/v3/SketchReel.tsx`)*

Today: O1 has 228 elements and S15 has 173. Every stroke is the same 4 px. Many objects are boxes with 34 px grey labels
("data center", "van"). Five colour fills (warm, cold, pop and others). Source citations ("Gartner, Q2 2026", "BLS") are
printed inside the frame. Captions, labels and the frame-0 text all compete for attention.
- **Values, not colours:** paper white, one light grey (the background planes), a near-black (the subject). No hues.
- **Line hierarchy:** subject 7-8 px, mid-ground 4 px, far planes 2 px in light grey.
- **A sketch icon kit with tested silhouettes:** laptop, phone, chip, rack and data center, van, crate, price tag, hand,
  calendar, window. Each must read at a quarter of the size (270x480) with no label.
- **About 12 to 25 elements per drawing, one focal subject.** Add a `panels[]` level under `Shot` (held drawings cut on the
  voice), so a two-step idea becomes two panels.
- **Text in the frame only when it will be on screen in the final**, handwritten and large: 1 number, or 1-3 words.
  Sources, beat notes and camera notes go in a notes strip under the frame (cut, action, line, seconds).
- **Motion:** holds and cuts by default. Camera moves as A to B frames or one slow push; keep real parallax only where the
  move is the story (the rise-over reveal). Keep line jitter low.
- **Tests before showing the owner:** a quarter-size contact sheet of all panels; a muted run with no captions (does the
  picture alone say it?); a squint test (the subject is the darkest, largest shape).

## Sources

S1 ImagineFX/Creative Bloq, "17 expert storyboard tips for TV animation" (Annie-winning board artist; Disney TV, Nickelodeon) https://www.creativebloq.com/advice/storyboard-tips
S2 Toon Boom, Storyboard Pro: storyboard structure https://docs.toonboom.com/help/storyboard-pro-22/storyboard/structure/about-storyboard-structure.html
S3 Toon Boom, Storyboard Pro: caption fields https://docs.toonboom.com/help/storyboard-pro-24/storyboard/caption/about-default-panel-caption.html
S4 Toon Boom Learn, camera moves https://learn.toonboom.com/modules/the-language-of-storyboards/topic/camera-moves1
S5 Vancouver Public Library, storyboarding conventions https://www.vpl.ca/guides/inspiration-lab-storyboarding/storyboarding-conventions
S6 Animétudes, "Atom through its storyboards" https://animetudes.com/2023/04/13/atom-storyboards/
S7 Shinkai video storyboards: https://admin.animenewsnetwork.com/interest/2020-03-06/makoto-shinkai-voices-weathering-with-you-hina-hodaka-in-storyboard-video/.157237 · https://appleinsider.com/articles/20/03/05/prolific-anime-director-profiled-in-new-behind-the-mac-video
S8 Cartoon Brew, Barth Maunoury on an Arcane sequence https://www.cartoonbrew.com/streaming/series-craft-director-barth-maunoury-breaks-down-an-emotional-arcane-sequence-244539.html
S9 SyncSketch, Alexis Wanneroy on Arcane https://blog.syncsketch.com/?p=75788
S10 AnimeClick, Lucca 2024 talk by Martial André https://www.animeclick.it/news/105132-lucca-comics-and-games-2024-incontro-con-il-direttore-delle-animazioni-di-arcane-2
S11 MoMA audio, Pixar: 20 Years of Animation https://www.moma.org/audio/playlist/192/2574 · https://www.moma.org/audio/playlist/192/2575
S12 Kurzgesagt, "Our video process" https://kurzgesagt.org/youtube/
S13 Forbes, Philipp Dettmer interview (2024) https://www.forbes.com/sites/danidiplacido/2024/10/24/kurzgesagt-in-a-nutshell-creator-talks-youtube-tiktok-and-optimistic-nihilism/
S14 Buzzco, the TED-Ed "Sex Determination" lesson https://buzzco.nyc/sex-determination/
S15 Kate Messner, "The making of a TED-Ed video" https://katemessner.com/the-making-of-a-ted-ed-video/
S16 Video Consortium, Joss Fong interview https://videoconsortium.org/mag/episode-1-joss-fong
S17 Skwigly, Giant Ant's Tako Faito https://www.skwigly.co.uk/tako-faito-serving-success/
S18 Mechanism Digital, "Trust the process" https://www.mechanismdigital.com/post/trust-the-process
S19 Animator newsletter, concept to animatic for a client https://animator.substack.com/p/animating-a-complex-scene-for-a-product
S20 Bold Content, "The Animation Process: Animatic" https://boldcontentvideo.com/?p=45699
S21 Ulster University student blog (animatic feedback) https://blogs.ulster.ac.uk/b00813743/2021/11/22/animatic/
S22 Mayer's multimedia principles: https://ocw.utoronto.ca/video-strategies/media-design · https://services.dartmouth.edu/TDClient/1806/Portal/KB/PrintArticle?ID=171655
S23 Vertical storyboarding and safe zones: https://www.elser.ai/blog/storyboard-vertical-ai-videos-tiktok-reels-shorts · https://reap.video/blog/short-form-video-safe-zones
S24 University of Washington, storyboarding slides https://courses.cs.washington.edu/courses/cse456/16su/labs/storyboarding_presentation.pdf
