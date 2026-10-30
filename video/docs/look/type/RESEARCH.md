# The words on screen: research (job 1 of 2, iteration 2026-10-30)

**What this is:** the research behind `docs/look/TYPE_GUIDE.md` (DRAFT): how premium short films design their words, where
words may sit in a 9:16 frame, what keeps them readable with a voice, which free fonts match the owner's references, and how
words move without looking cheap. Only what changes our answer is here. The owner's rules in `BRIEF.md` win over all of it.

**Strength marks:** **[S1]** a platform's own spec, a standard or a study · **[S2]** a studio's, designer's or research
firm's own account · **[S3]** a practitioner's advice, a press summary or a tool's template. **[REF]** = the owner's own
references, measured (`refs/README.md`).

## Findings

1. **Few, big, light words set INTO the picture's open space, in the same hand as the picture, is the premium move.**
   Ref 1 puts one or two thin, airy, hand-printed words (stroke ~7 % of the cap, wide spacing) in the calm wall above the
   cat, 28-41 % down the screen, each group cutting in whole for ~0.9 s; the landing word ("day") is bigger and set lower
   right on its own baseline; ref 2 locks a dry-brush script title over a small brush print on the dark tree mass, no box,
   no shadow. The city posters do the same with thin geometric caps in open sky. [REF] (`refs/README.md`;
   `docs/studies/2026-10-28_city_posters/style.md` §1.8). **For us:** our words leave the fixed peach-box block and become
   part of the composition: light strokes, airy spacing, placed in the open sky or wall by the subject, one landing word
   per sentence at most.

2. **The cheap look is a productised template: ultra-bold condensed ALL CAPS, black outline, 2-4 words popping word by
   word, keywords in loud colours, often emoji.** It is sold as a one-click preset by Kapwing, Submagic, OpenClip,
   BlitzCut and others ("Hormozi style"; Montserrat-class ultra-bold, all caps, black outline, word-by-word).
   [S3] https://www.kapwing.com/explore/hormozi-style-captions-template ·
   https://openclip.app/use-cases/hormozi-style-captions · https://www.submagic.co/blog/how-to-make-alex-hormozi-captions .
   **For us:** anything a preset can make reads as a preset. Never: outlines, boxes, heavy weights, all-caps running
   captions, rainbow keywords, emoji, bounce. Premium = a custom system drawn from our own picture.

3. **Full captions help comprehension; keyword-only captions do not.** 226 learners: full captions beat both no captions
   and keyword captions on global comprehension, and keyword captions did no better than none; a meta-analysis of 18
   studies found captions improve second-language listening and vocabulary. [S1] Montero Perez, Peters & Desmet 2014,
   ReCALL 26(1) https://doi.org/10.1017/S0958344013000256 · Montero Perez et al. 2013, System 41(3)
   https://doi.org/10.1016/j.system.2013.07.013 . **For us (our viewers read along, many non-native):** "few words" means
   few AT ONCE, never fewer words: every spoken word appears, in the voice's order, in groups of 2-4.

4. **Viewers keep up with fast same-language text; the ceiling is ~20 characters per second.** Netflix's English spec:
   up to 20 cps for adults, 17 for children, 42 characters a line, at most two lines, one line preferred, a bottom-heavy
   pyramid, never split an article from its noun. An eye-tracking study (74 viewers, 12/16/20 cps) found most viewers read
   fast subtitles and still followed the image; slow subtitles caused rereading and frustration. [S1]
   https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide · Szarkowska &
   Gerber-Moron 2018, PLOS ONE https://discovery.ucl.ac.uk/id/eprint/10050653/ . **For us:** our take runs 177.7 words/min
   (2.96 words/s); grouped at 2-4 words, video 4's groups run 6.6-22.8 cps (median ~15). The rule: <= 20 cps per group
   (merge a faster group into a build), >= 0.8 s on screen, Netflix's line-break rules for every two-baseline group.

5. **Text near the action shortens eye travel and keeps gaze on the picture.** Speaker-following subtitles (placed by
   the speaker) gave more fixations on the relevant image regions and shorter saccades than bottom-centre subtitles (40
   viewers, CHI 2017); with dynamic (placed) subtitles, gaze came closer to the no-subtitle baseline, and the experience
   improved for most, not all, viewers. [S1] Kurzhals et al. 2017 https://dl.acm.org/doi/10.1145/3025453.3025772 · Brown
   et al. 2015, TVX https://research.manchester.ac.uk/en/publications/dynamic-subtitles-the-user-experience/ . **For us:**
   place each group in the open space NEXT TO the beat's subject (above it by default), not in one band far from it; but
   keep one steady anchor per shot, because a group the eye has to hunt for costs more than it saves (finding 6).

6. **A steady anchor beats variety for running words; moves are small and follow the eye.** Ref 1 moves its group centre
   between 31 % and 54 % of the width (~250 px) with the vertical held to a 13 %-high strip; our join rule already caps the
   eye's jump at 0.10 of the frame diagonal (~220 px; `CRAFT.md` §a). [REF] + house rule. **For us:** within a shot,
   consecutive groups move <= 220 px (a stagger left-right of the anchor); bigger moves only on a join, toward where the
   eye already is.

7. **Readers who cannot look back understand less: one word at a time (RSVP) hurts comprehension.** Readers kept from
   re-reading words comprehend worse, for hard and simple sentences alike (Schotter, Tran & Rayner, UC San Diego). [S1]
   https://www.psychologicalscience.org/news/were-only-human/read-this-blog-post-in-less-than-a-minute.html . **For us:**
   word-by-word BUILDS keep the earlier words on screen until the group ends (build, never replace); a single-word group
   only for a landing word or a slow beat, never a whole sentence flashed word by word.

8. **Emphasis with one clear signal; jiggles hurt legibility.** Captions that mapped loudness to weight, pitch to a
   baseline shift and duration to letter-spacing were rated less legible (baseline shift and letter-spacing worst), and
   the prosody-only style did not beat plain captions at showing emphasis (16 deaf and hard-of-hearing viewers). [S1] de
   Lacerda Pataca et al., CHI 2023 https://par.nsf.gov/servlets/purl/10420024 (doi 10.1145/3544548.3581511); animated
   text for emotion: Rashid et al. 2008 https://doi.org/10.1080/10447310802142342 (results not re-checked). **For us:** at
   most ONE stressed word per group, marked once (the accent colour; for the film's 3-5 landing words, the brush face,
   bigger, in the accent); never bouncing baselines or animated spacing in running words.

9. **Hard-to-read type makes the content feel harder.** The same instructions in a cursive font (Brush Script) were
   judged harder and less worth doing than in Arial; recall was equal. [S1] Song & Schwarz 2008, Psychological Science
   https://www.psychologicalscience.org/news/releases/if-its-hard-to-read-its-hard-to-do-study-shows-difficult-to-read-instructions-decrease-motivation.html .
   **For us:** the running captions are an upright, open hand-PRINT (no script, no slant, no rough brush); a script or
   brush face is kept for one big word, a number or a title, where size carries it.

10. **Open letter spacing helps struggling readers and suits the airy look.** [S1] Zorzi et al. 2012, PNAS
    https://doi.org/10.1073/pnas.1205566109 (extra-large spacing improved reading in dyslexia; a benefit for typical
    readers is not claimed here). Ref 1's airy spacing (gap ~0.45 x-height) agrees [REF]. **For us:** track the hand +2 % (its natural gaps are already open); never the posters'
    1.0-1.6 cap-height gaps on running words (those are for one-word titles).

11. **Contrast without boxes: thin strokes need more contrast, or more size.** WCAG 2.x asks 4.5:1 for text and 3:1 for
    large text (>= 18 pt, or 14 pt bold); APCA's draft tables raise the bar for light weights. [S1]
    https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html · [S3, draft method]
    https://www.achecks.org/apca-accessible-colour-contrast-checker/ . Ref 1 runs only ~3.1:1, carried by its size [REF].
    Measured on our two test skies: warm white #FFF0DE 7.9:1 and amber #FFB868 5.2:1 on the night band; umber ink #2B1B0A
    10.3:1 and burnt orange #8E3A12 4.7:1 on the light dusk band (`scripts/type/bg/`). **For us:** running words >= 4.5:1
    (the house's 7:1 where the sky allows), a landing word >= 3:1; a soft, wide, offset-free halo in the sky's own darker
    (or lighter) tone instead of a box or an outline; the ink flips with the sky (dark ink on light, warm white on dusk and
    night).

12. **Words can live IN the world, moving with the camera, when the word belongs to a thing.** Panic Room's titles
    (Picture Mill, 2002): huge 3D letters hung among New York's buildings, tracked with the camera, from "floating letters
    hanging above the city" [S2] https://artofthetitle.com/title/panic-room ; Sherlock's texts float beside the actor, so
    "action and reaction" share one frame (Tony Zhou's essay, "A Brief Look at Texting and the Internet in Film") [S3]
    https://www.npr.org/sections/13.7/2014/10/07/354243631/ever-changing-technology-challenges-filmmakers . **For us:** a
    world word (video 4's "2027" tag) sits on its object and moves with it; the voice's captions stay in screen space
    (`LAYOUT.md`: screen space is a fixed mat), and the two never say the same thing at once.

13. **The platforms publish safe-zone FILES, not numbers; the measured union is x 120-888, y 288-1248.** TikTok: the safe
    zone "is determined by the dimension, ad caption length, and any additional formats" (downloadable files) [S1]
    https://ads.tiktok.com/help/article/video-ads-specifications?lang=en ; Google: an official 1080 x 1920 vertical safe-zone
    overlay PNG [S1] https://support.google.com/google-ads/answer/13547298 . Measured by third parties [S3]: TikTok ads
    top 240, bottom 660, sides 120, a button column from y ~840; Reels ads 14 % / 35 % / 6 % (269 / 672 / 65 px); Shorts
    (Google's vertical ad template) top 288, bottom 672, left 48, right 192
    (https://www.socialync.io/tools/safe-zones/tiktok · .../instagram-reels · .../youtube-shorts; our table:
    `docs/look/research/vertical.md` §2). Our organic zones: top y < 180, bottom y > 1520, right rail x > 950 at y 900-1500
    (`LAYOUT.md` §1). **For us:** the TYPE FRAME is x 96-944 above y 840 and x 96-860 below it, y 290-1250; a cut made
    for ads keeps words inside x 120-888, y 288-1248 and left of x 780 below y 840.

14. **Sound-off viewing is common, yet these feeds are sound-on: caption for the silent viewer, design for the voice.**
    69 % of US adults watch video with the sound off in public; 80 % say they are more likely to finish a video with
    captions (Verizon Media + Publicis, 2019, n = 5,616, commissioned) [S1]
    https://www.streamingmedia.com/Articles/News/Online-Video-News/80-of-Video-Caption-Users-Arent-Hearing-Impaired-Finds-Verizon-131860.aspx ·
    https://www.3playmedia.com/blog/take-your-video-ads-to-the-next-level-with-captions/ ; Facebook's internal tests:
    captions raised video-ad view time by 12 % on average (2016, self-reported) [S1]
    https://3playmedia.com/blog/captions-increase-viewership-for-facebook-video-ads ; Kantar for TikTok: 88 % of users call
    sound essential (platform-commissioned) [S1]
    https://ads.tiktok.com/business/en-US/blog/kantar-report-how-brands-are-making-noise-and-driving-impact-with-sound-on-tiktok .
    No study isolates a first-frame TEXT hook; TikTok's own advice is to state the proposition in the first 3 s
    (`vertical.md`, REPORTED). **For us:** the words carry the whole story with the sound off, in sync with the voice;
    frame 0 shows the first spoken words (the owner's rule), never a title.

15. **Motion that reads as calm: short entrances, eased; nothing that slides or clips.** UI research: simple feedback
    ~100 ms, larger elements 200-300 ms (Nielsen Norman Group, quoted) [S2]
    https://lists.w3.org/Archives/Public/public-css-archive/2025Apr/0702.html ; ease-out to enter, ease-in to leave [S3]
    https://blakecrosley.com/es/blog/motion-grammar-when-animation-earns-its-frames ; ref 1 cuts each group in whole, with
    no fade, slide or scale, sometimes one empty frame between groups [REF]. **For us (60 fps):** a 1-frame pop (or a
    3-frame fade) in place; builds pop on each word's voice time; a landing word's brush write-on in 10-16 frames; a
    stressed-word swell to 1.06 in 5 frames and back in 9; leaves cut out in 1 frame; never a slide, roll, bounce,
    typewriter or a reveal behind a mask edge.

## The fonts

**How:** every candidate was rendered with Pillow from the `@fontsource` woff2 files (`scripts/type/.fonts/`, OFL or
Apache) against the reference crops, at the reference's x-height and tracked to its spacing, then measured with the same
code on both (stroke = the median of the shorter run through each ink pixel; x-height and cap from the letters of
"Sometimes"). The working comparison sheets were scratch; the in-scene versions are job 2's stills (`stills/`, listed in
`TYPE_GUIDE.md` §h).

**The references, measured (crop px):** ref 1 "Sometimes": cap (S) 130, x-height 53.5, stroke 9.0 = **6.9 % of the cap**,
x-height **0.41 of the cap** (low: tall caps and ascenders), round o (0.94 x-height wide), gaps 0.45 x-height. Ref 2:
a tall, narrow, dry-brush script over a narrow brush print. Our Patrick Hand: stroke **12.8 % of the cap**, x-height 0.70.

**Ref 1 (thin rounded hand-print), 46 renders ranked by stroke, x-height and roundness, then by eye:**

| candidate | stroke / cap | x-height / cap | the "I" in "AI" | read |
|---|---|---|---|---|
| Zen Kurenaido 400 | 6.9 % | 0.60 | **plain: reads "Al"** | the closest feel: light felt-tip, open, grown-up |
| Gaegu 300 | 7.4 % | 0.65 | **barred** | close: round, slightly irregular felt-tip, airy; has 300/400/700 |
| Edu SA Beginner 400 | 7.7 % | 0.54 | barred | the lowest x-height of the prints, but a school-print slant |
| Yomogi 400 | 7.0 % | 0.69 | barred | thin and round but uneven spacing, cute |
| Mali 200 / 300 | 5.0 / 7.8 % | 0.73 | barred | clean, very legible, more "font" than hand; 200-700 |
| Shantell Sans 300 | 9.7 % | 0.70 | barred | a marker hand, heavier, a little comic; variable 300-800 |
| Annie Use Your Telescope, Coming Soon | 7.5 / 8.0 % | 0.73 / 0.77 | plain ("Al") | thin and hand-made, uneven |
| Playpen Sans 200, Klee One 400 | 6.3 / 7.5 % | 0.69 / 0.68 | plain ("Al") | designed, tidy; Klee is a textbook hand |
| Sue Ellen Francisco | 6.3 % | **0.40** | barred | the ref's proportions, but narrow letters |
| Comic Neue 300, Quicksand 300, Nunito 200 | 5.6-6.6 % | 0.70-0.73 | mixed | mechanical; Comic Neue reads as Comic Sans |
| Patrick Hand 400 (ours) | 12.8 % | 0.70 | **plain ("Al")** | heavier, comic; the "before" |

**A finding that changes the pick:** in Zen Kurenaido, Annie Use Your Telescope, Coming Soon, Playpen Sans, Klee One and
our current Patrick Hand, the capital I is a bare stroke, so "AI" reads as "Al", in a channel whose video 4 says "AI"
three times. The caption face must have a barred I.

**Ref 2 (dry-brush script + brush print), 12 renders:** the nearest is **Nanum Brush Script** (tall, narrow, light brush
with dry edges; its own lowercase is a near twin of the ref's "Sketched animated stories" line). Square Peg (thinner,
more connected) is second; Caveat Brush, Mansalva and Kaushan Script are heavier markers; Rock Salt, Permanent Marker and
Sedgwick Ave read as street or grunge, and Yellowtail, Damion and Satisfy as retro signage.

**Superseded in part (the owner, 2026-10-30: "shouldn't look like a blood message on the wall", on the brush WANTS in
burnt red capitals):** the brush and the burnt accent are retired; the stress is now THE LIT HAND (the hand's own Bold,
bigger, lowercase, lit by the film's warm light), so the system is one family. The diagnosis, findings P1-P8 and the
options: `PLEASANT.md`. The pick below is kept as the record of the first pass.

**The pick (one system, two families, three roles; first pass):**
- **The hand, for every running word: Gaegu Light 300** (400 for dark ink on light skies, which reads thinner), +2 %
  tracking. Why: the nearest free match to ref 1's felt-tip hand (stroke 7.4 % vs 6.9 %, round, airy), an upright PRINT
  that reads in one pass (finding 9), a barred I, warm and hand-made beside a painted world, and light where Patrick Hand
  is heavy (12.8 %). Fallback if the owner finds it too young: **Mali Light 300** (cleaner, same barred I).
- **The brush, for the one landing word, the big numbers, the lettered phrase and the titles: Nanum Brush Script 400.**
  Why: "a brush, not a pen" (the playbook's painted pieces): the key word looks painted with the picture's brush; it
  matches ref 2's lockup; its figures (40, 70,000, 2027) read at once; and it is light (stroke ~11 % of its small cap),
  never a heavy marker. It is kept to a few words per film, big, where size pays for a script's slower read.
- **Not picked:** the posters' Futura-like caps (Jost / Josefin Sans): beautiful for one tracked place name on a poster,
  but geometric and cool against the organic, painted direction ("ORGANIC, NOT GEOMETRIC"), and tracked caps read slowly
  as running words and vanish on a 360-px grid tile (`LAYOUT.md` §5); a third family would also break "one look, one
  brand" for little gain. A serif (Fraunces, Instrument Serif) reads editorial, not painted.

## Open questions for the owner

1. **The hand:** Gaegu Light (warm, hand-made) or Mali Light (cleaner)? Still 3 shows both on one moment, beside Zen
   Kurenaido (the closest feel, ruled out by its "Al").
2. ~~**The landing word in the brush**~~ (answered 2026-10-30: the brush read as "a blood message on the wall"; the
   stress is now the lit hand, `PLEASANT.md`): stills 2 and 7 now show the bigger lit word and the quiet lift.
3. ~~**The brush write-on**~~ (retired with the brush, 2026-10-30): the stressed word pops whole and its light blooms
   in 8 frames (still 14).
4. **Placement:** words follow the beat's open space (above the subject by default, beside it in close shots), or stay
   in one band with only the stagger varying? Stills 1 and 2 show the before and the after on one moment.
5. **The cover:** the core line in the hand with its key word in the brush, no peach box (still 11), or in the posters'
   thin geometric caps (still 12)? (Ref 2's brush-title-over-hand lockup is kept for a series title, once there is one.)
6. **Three steps of size** (the hook and the payoff's last group at 136 px, everyday 116 px, the brush 200-260 px): enough
   contrast to feel dynamic, or should the everyday words be bigger still (fewer words per line, more two-row groups)?
