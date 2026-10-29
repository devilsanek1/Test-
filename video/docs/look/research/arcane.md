# Arcane's camera grammar of scale, as 2D recipes (research lane, 2026-10-25)

For v3 (laptop prices: cozy desk nook at night, the AI data center outside) and v2 (DeepMind staff, military AI). Tags:
**VERIFIED** = primary source quoted, or several sources agree; **REPORTED** = one secondary source or a search summary;
**UNCERTAIN** = our memory or inference, to check on the owner's clips (section 8); *(proposal)* = our numbers, test at G4.
**[M]** = our own measurements of 12 stills (`../../v1/style_bible_ref2.md` section 8, which keeps the doses per device).
**Caveat:** page fetches were blocked here (DNS / proxy 403), so every claim comes from search-result summaries.
Colours follow `../PALETTE.md`. Camera fields (`tilt`, `push`, `anchor`, `CAM.reveal`, `Layer depth`) are our kit (`../../CINE_KIT.md`).
We describe shots in words only and never copy footage or frames.

## 0. The rules in brief

1. **The camera acts like a real camera.** It is heavy, eases in, lands softly and drifts a little at rest. It never does a
   move that a crane, a drone or a person could not do (Fortiche's stated intent, section 1).
2. **Scale comes from contrast across the cut:** a close-up, then the huge wide (figure ratio of 8:1 or more), then back.
   It does not come from a long wide.
3. **There is one big move per video** (a tilt-up, a rise-over or a pull-back, 2.5-4 s) and one mid-size move at most.
   Everything else uses pushes of 3-8 %.
4. **Depth is stepped flat haze:** each plane is lighter toward the sky, the far planes are fill-only, and the ink weight
   grows toward the viewer. There is no blur and no gradient.
5. **The system is drawn above, symmetrical and cold; the person below, asymmetrical and warm.** Verticality is power.
6. **The darkness lives in the near layers, never on the page.** Arcane is dark (median L* 9-49 % [M]); we keep the page
   at L* >= 75 and put the weight in the silhouettes and the anchor.

## 1. What Fortiche says about the camera (facts we build on)

- **The storyboards set the cinematography** (composition, angles, framing); layout "would just match that one-to-one", so
  the animators did not reinvent shots (A. Wanneroy). [VERIFIED, S1] For us, the camera is decided at G3 (sketch animatic).
- **The virtual camera is treated as a physical live-action camera:** simulated handheld, naturalistic zooms, subtle shake,
  with slight handheld imperfections even in quiet dialogue. [REPORTED, S2, S1]
- **The camera is imperfect on purpose:** "scratches on the lens, and dust particles that made things a bit blurry, but it
  felt real because it's imperfect" (C. Linke). [VERIFIED, S3]
- **The backgrounds are painted and projected onto simple 3D geometry for big moves,** so parallax is real and the brushwork
  stays. Linke cites anime and Miyazaki landscapes as influences. [VERIFIED: S2, S4 and S5 agree]
- **Frame rates:** CG mostly at 24 fps and action at 12 fps, keyframed with no mocap; the 2D FX are on twos, made by 4-5
  artists. The show is framed at 2.35:1. [REPORTED, S6, S7]
- **Shots are short by economics:** "We animate a half-second a day, so we usually avoid long shots." The longest shot is
  40 s (a kiss; three months of work). [VERIFIED, S8] The average shot length is not published. [UNCERTAIN]
- **Crowds:** season 2 has 313 crowd shots, with 3 to over 600 agents each, treated "as full-fledged actors". [VERIFIED, S9]
- **City design:** Piltover above (bright, open, ordered), Zaun below (dense, polluted, hard to navigate); height tracks
  control [REPORTED, S10]. Piltover is New York Art Deco (symmetrical, geometric, clean) and Zaun European Art Deco (ornate,
  asymmetrical) [REPORTED, S11].
- **Colour by district:** Piltover is warm gold, white and blue; Zaun is neon green, purple and pink, smoky and desaturated
  [REPORTED; several reviews agree, S12, S10]. J. Georgel (art director): palette and light follow the story arcs, for example
  Vi's world "gray and black" and a fight-pit light "cold and white" [REPORTED, S13].

## 2. The moves: Arcane grammar, then our 2D recipe

The grammar below is our reading of the show, [UNCERTAIN] until we measure the clips in section 8. The speeds respect our
strobe limit: flat inked art strobes above about 15-20 px/frame at 30 fps (CINE_KIT.md; `camSpeed` checks it).

| move (Arcane use) | 2D recipe *(proposal)* |
|---|---|
| **A. Tilt-up reveal** (start on people at street level, tilt up a tower until its top lands near the frame top) | A `tilt` of 600-900 px in 2.5-3.2 s with `CAM.reveal` (25 % ramp, cruise, 35 % soft landing). The horizon goes from 0.40 H to 0.70 H or off-frame, and the top lands at 0.08-0.15 H. A tilt moves every layer equally, so add a 3-5 % zoom-out to shrink the figure. Peak about 14 px/frame at 900 px per 3 s. |
| **B. Rise-over reveal** (drone-like: rise past a roof edge or wall, and the city opens behind it) | A crane `y` of 400-700 px in 2.5-3.5 s with `CAM.reveal`. A foreground edge (depth -0.3) fills the bottom 30-45 % and slides out the bottom; the colossus is cut by the frame. Hide the ground horizon behind building rows (CINE "Crane vs tilt"). At 700 px per 3 s the foreground peaks at about 14.5 px/frame. |
| **C. Pull-back, intimate to vast** (tight on a face or object, end on a tiny figure in a huge place) | A dolly-log from about 2.5x to 1.0x in 3-4 s, multiplane far x0.95 / mid x0.75 / fore x0.67 (ref-2 shot 16), anchored on the subject so the world grows around it. The subject lands at 0.04-0.08 H; hold 0.6-1.0 s with a drift. The analogue is the S1E9 slow zoom-out that ends on Ekko's broken stopwatch [REPORTED, S14]. |
| **D. Slow push toward the vista** (a back-view figure facing the city: 7 of 12 stills [M]) | A `push` of 3-8 % in 2-4 s with `CAM.slow`, anchored on the far vanishing point (`anchorDepth` 0.85+): the city grows and the foreground slides out. The baseline shot after a big reveal. |
| **E. Locked tiny-figure wide** (a figure at 0.10-0.12 H under a mural, hall or facade; a light shaft [M]) | A still camera with `handheld` 1-1.5 px. Life comes from 1-3 small things only: smoke, a bird, one window popping on. The colossus is cut by the frame, at 10:1 or more. 2-3.5 s. |
| **F. Worm's-eye on a tower** (a tower at 0.85 H [M]; airships as scale cues) | The horizon is at 0.85 H or below the frame, the base cut by the bottom. One tiny mover (an airship or bird, 0.01-0.02 H) crosses at 10-20 px/s; clouds drift at 8-15 px/s on depth 1. Optional tilt of 2-4 %. |
| **G. Height looking down** (privilege looks down from balconies and roofs) | A high angle, horizon at 0.15-0.30 H, verticals converging down (a VP about 1.5 H below the frame). Once per video, for the institution's point of view (v2). |

**How the camera settles** *(proposal from section 1)*: it never stops dead. The landing takes the last 35 % of the move,
then `handheld` 1-1.5 px drifts on through the hold. Cut while it still drifts, or carry speed into the next shot (CINE
"Carry speed through a cut"). A hold over 1.5 s needs something else moving.

## 3. Haze, depth and parallax

- **Haze steps:** A7 runs from the sky at L* 147 through 135, 110 and 78 to 42, with steps that grow toward the viewer
  (12, 25, 32, 36) [M]. Our 4-6 planes, each one flat value step darker: sky = the page; far city fill-only; mid
  fill-only or 1.5 px ink; near 2.5-3.5 px ink; foreground the darkest mid with 4-5 px ink; the observer in the anchor.
- **Dusk hexes for v3's exterior** *(proposal)*: `#D9DEE5`, then `#BAC3CE`, `#8A9AA8` and `#545F6D` (a 50/50 mix of `#8A9AA8`
  and the anchor), then the anchor `#1F2433` for the observer only. Foreground framing uses `#545F6D`, never the anchor, so
  the anchor stays at about 5 % of the frame.
- **Parallax for a truck or crane** *(proposal)*: the screen motion is the camera move times f, with f = 1 - depth. Sky (depth
  1, f 0), far skyline (0.9, f 0.1), city (0.7, 0.3), near blocks (0.35, 0.65), subject (0, 1), foreground frame (-0.3 to -0.5,
  1.3-1.5). Keep neighbouring planes 1.8x or more apart in f so they separate on a phone. A pure tilt or pan gives no
  parallax, so it reads as a "look"; a truck, crane or push reads as "being there".
- **Depth of field without blur:** the far planes lose their ink and detail and drop a value step. That is our stand-in
  for Arcane's soft backgrounds.
- **Imperfect lens, flat** *(proposal)*: 6-12 dust specks (2-4 px, a lighter tint of the local colour) drift at 5-15 px/s,
  only inside a lamp pool or a light shaft. No lens scratches: on a phone they read as damage.

## 4. Rhythm: intimate close-ups against huge wides

- **The contrast is the effect** [UNCERTAIN, check on clips 3, 6, 9]. Cut INTO a scale wide from a close-up (a face at
  0.5-0.7 H, then the observer at 0.04-0.08 H), on a beat or a breath in the voice-over. The line over the wide is 6 words or
  fewer so the eye can roam. Cut back to a close-up.
- **Durations** *(proposal, within our 30-45 s)*: baseline shots 1.2-2.5 s; a scale wide 2.5-4 s; the big move 3-4 s
  plus a 0.6-1.0 s hold; 2-3 scale moments per video (hook, reveal, close), never two wides in a row.
- **Twos for the actors, ones for the camera** *(proposal from S6, S7)*: step the pose animation and the FX (vent steam,
  sparks) on twos (15 fps), while the camera and parallax run at 30 fps. Step the pose, never the layer transform. Test it
  at G4, since it may fight our hand-drawn boil.

## 5. Colour: warm against cold, inside our palette rules

- **Arcane codes places by temperature,** so a cut tells you where you are. 8 of 12 stills are near-monochrome (one hue
  carries 81-93 % of the chromatic pixels) with one warm accent [M].
- **v3** (PALETTE: one palette, with one deliberate sister shift):
  - the nook is **Sage Study** (page `#EEF0E3`, lamp `#F2D49B`, hero `#1F8A78`, anchor `#22332C`, pop `#F2A541`);
  - it shifts to **Dusk** at the window (mist `#D9DEE5`, indigo hero `#3E5BD0`, coral pop `#FF7A4D`);
  - in the reveal, the data center is a fill-only mass one or two haze steps off the sky, rising past the frame top, and
    its cold windows and vents carry the indigo hero (5-15 %);
  - the nook's lit window, now tiny, is the single coral pop (1-3 %): "you are here". This is the collage's top-left tile
    in our language: tiny warm windows under a vast cool field.
- **v2:** the institution (a glass HQ, the contract) is symmetrical, gridded and frontal, seen from below, in the cool
  hero. The staff are warm, small and asymmetrical, at eye level. Choose between Dusk and Mint & Clay 1.1 at G4.

## 6. 2D and 3D: Arcane's hybrid, our 2.5D

- **Arcane:** 3D characters with painted textures and 2D FX on twos; painted backgrounds, projected onto simple geometry
  when the camera travels (section 1).
- **Ours** *(proposal)*: flat SVG planes on `Layer depth`, with true per-frame perspective only on the one hero structure
  (`Tower` with `vpy`, or `Monument`): its side faces widen or narrow 3-8 % in a truck or crane, the "projection" cue that
  sells 3D. Ground lines follow the VP (`GroundPlane`); far planes stay flat cards, like Arcane's distant matte paintings.
- **Vertical frame:** Arcane composes for 2.35:1, and our 9:16 is about 0.32 of its width. That favours towers, light shafts,
  deep streets and stacked bands (captions on the sky, then the colossus, the city and the observer).
- **Placement** *(proposal)*: v3 hook = the laptop price in the lamp pool; v3 reveal = move C through the frosty window,
  landing in move F framing, with the Sage-to-Dusk shift; v3 close = move D on the nook from outside, the coral window as
  the last pop. v2 = move E (a tiny employee under the facade) and move G once.

## 7. Clip list for the owner (screen-record 10-40 s each, privately, for frame-by-frame measuring only)

How to record: native 16:9; start 2 s before the move and stop 2 s after the next cut; note the player time. We measure
the shot and move lengths, the speed curve, the layer parallax, the figure and horizon heights, and the value steps. No
source gives timestamps: each scene is sourced, and its framing is [UNCERTAIN] until we see it.

| # | S/E | Scene (source) | What it should show |
|---|---|---|---|
| 1 | S1E1 | Cold open on the Bridge of Progress aftermath: Vi stares past the enforcers at the gleaming Piltover skyline (S15) | small figures in haze, a warm city behind a cold foreground, a back view |
| 2 | S1E1 | The heist starts on Piltover's rooftops; Powder fears the gap between buildings (S15, S16) | a high vantage over a drop; small kids in a big city; camera height |
| 3 | S1E1 | That night, Vi takes Powder up on the roof and points out places in the city (S15, S17) | two silhouettes over warm windows (probably the collage's top-left tile); the close-up-to-wide rhythm |
| 4 | S1E4 | Progress Day: the establishing wides of Piltover, its airships and Jayce's hexgates (S18) | daylight Art Deco scale, airships as scale cues, the low angles on the towers |
| 5 | S1E4 | The Firelights' hoverboard raid on Silco's shimmer airship; Jinx destroys the ship (S18) | tiny figures against a huge craft; vertical camera travel |
| 6 | S1E9 | The ending: the rocket's blue tail crosses a moonlit sky over the city, then the council window, then black (S14, S19) | one accent on a vast monochrome field; how long the wide is held |
| 7 | S1E9 | The slow zoom-out during Ekko and Heimerdinger's talk, ending on the broken stopwatch (S14) | the speed curve of a pull-back and its landing (move C) |
| 8 | S2 (E6 or Act 3) | Jayce alone in the future wasteland: Piltover in ruins, empty, overgrown (S20) | a lone tiny figure in vast space; stepped haze; one hue |
| 9 | S2E7 | The alternate prosperous Zaun: Ekko and Powder above a vibrant, peaceful city (S21, S22) | coziness and scale at once: a warm lit city from above, two small figures |
| 10 | S2E9 | Jayce and Viktor at the top of the Hexgate tower while the war rages below (S23) | extreme height, figures against the abyss, crowds far below |
| 11 | S2 (Act 2) | Viktor's camp of followers in the undercity (S24) | a crowd around a lone figure; any light shaft (compare the collage) |

## 8. Sources (page fetches were blocked; each claim is from the search summary of the page)

- S1 Wanneroy interview, SyncSketch: https://blog.syncsketch.com/creator-stories/arcane-fortiche/ · S2 RedShark News: https://www.redsharknews.com/why-netflixs-arcane-looks-so-good-how-fortiche-ramped-up-the-animation-pipeline
- S3 Hollywood Reporter, 2025-06-13 (Linke): https://www.hollywoodreporter.com/tv/tv-features/how-arcane-championed-human-intelligence-final-season-1236258103/ · S4 80.lv, Riot on Piltover and Zaun (matte painter on projection): https://80.lv/articles/riot-games-on-designing-arcane-s-piltover-zaun/
- S5 SciFi Vision, Linke: https://scifivision.com/interviews/7090-exclusive-interview-christian-linke-reveals-what-s-next-for-arcane-s-iconic-characters · S6 The Digital Bits, S1 4K review: https://digitalbits.com/item/arcane-s1-steel-2024-uhd
- S7 iAnimate podcast, Wanneroy: https://ianimate.net/animationpodcast/arcane-magic-secrets-fortiche-lead-alexis-wanneroy-podcast · S8 Variety via AOL: https://www.aol.com/entertainment/arcane-league-legends-team-unpacks-170000850.html
- S9 Autodesk, Golaem crowds: https://blogs.autodesk.com/media-and-entertainment/2025/03/26/crafting-crowds-fortiche-golaem-and-the-magic-of-arcane-season-2/ · S10 Fantasy/Animation: https://www.fantasy-animation.org/current-posts/how-arcane-riot-games-fortiche-production-2021-visualizes-class-conflict-through-its-fantasy-world
- S11 VFX Voice: https://vfxvoice.com/riot-games-and-fortiche-get-revolutionary-with-arcane-season-2/ · S12 The Science Survey: https://thesciencesurvey.com/arts-entertainment/2022/03/13/arcane-an-analysis-and-review/
- S13 Netflix Tudum, S2: https://www.netflix.com/tudum/features/arcane-season-two-behind-the-scenes · S14 Looper: https://www.looper.com/758599/the-most-pause-worthy-jinx-moment-in-netflixs-arcane
- S15 League wiki, S1E1: https://wiki.leagueoflegends.com/en-us/Welcome_to_the_Playground · S16 Netflix Tudum, S1 easter eggs: https://www.netflix.com/tudum/articles/arcane-season-1-league-of-legends-easter-eggs
- S17 Wikiquote: https://en.wikiquote.org/wiki/Arcane · S18 League wiki, S1E4: https://wiki.leagueoflegends.com/en-us/Happy_Progress_Day!
- S19 TechRadar: https://www.techradar.com/streaming/netflix/8-huge-questions-i-need-arcane-season-2-to-answer-before-the-highly-rated-netflix-show-ends · S20 Dexerto: https://www.dexerto.com/tv-movies/arcane-season-2-jayce-death-explained-2989229
- S21 esports.gg, Ekko: https://esports.gg/news/league-of-legends/how-arcane-season-2-masterfully-used-ekkos-lol-lore-and-expanded-it/ · S22 Vocal, S2 moments: https://vocal.media/geeks/arcane-season-2-top-12-best-moments-in-the-league-of-legends-adaptation
- S23 TheWrap: https://thewrap.com/arcane-season-2-episode-9-ending-explained · S24 High on Films: https://www.highonfilms.com/arcane-season-2-review-recap-ending-explained/
