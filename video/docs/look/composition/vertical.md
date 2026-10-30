# VERTICAL: composition for the phone feed (TikTok, Reels, Shorts) (research, 2026-10-30)

The owner (2026-10-30): "After we are done with this I want you to do another research and distill of the composition
shots to use / Take a look at this folder I collected some initial references but do the deeper research"
(`docs/look/refs_composition/`). Earlier the same day, on our list of differences from the references: "8 agreed this is
an important point about scene composition"; on still v6: "our scene is very busy".

**What this is.** The VERTICAL SHORT-FORM lane of that research: how composition changes when the picture is a 9:16
video in a phone feed. It measures what the owner's phone actually shows of our frame (§1: the crop and every piece of
the app's interface, in our pixels), then covers stacking and the centre column (§2), where the eye lands (§3), the
thumb-stop first frame (§4), captions and words (§5), how the best illustrated explainers compose for vertical (§6) and
the classic principles converted to 9:16 with numbers (§7), with doc clashes (§8), a procedure to measure the other two
apps (§9) and sources (§10, cited [V1]-[V15]). Its siblings: `cinema.md` (the classic devices as film and animation use
them, rules C1-C14, sources [S1]-[S20]) and `reels.md` (the owner's five reels, ideas A1-E11); this page cites them and
`docs/look/organic/composition.md`'s R1-R12 and does not repeat them. **Rank:** research notes, the lowest rank on
DIRECTION's ladder; nothing here is a rule until it is integrated into `LAYOUT.md`, `CINEMATIC_GUIDE.md`,
`src/lib/theme.ts` or the playbook (§7.2 names the target of each). Methods only: no footage copied or traced, no
creator named, no living artist as a style target. Paths are from `video/` (`context/` is at the repo root).

**Conventions.** Px are OUR frame's pixels (1080 x 1920, y down), whatever the screen. Tags: **MEASURED** (ours, on the
owner's own screen recordings or on the platforms' files; method in §1 and §9), **OFFICIAL** (a platform's own page or
file), **REPORTED** (secondary sources), **est.** (our estimate). Angles are on the owner's phone at the two mean phone
distances, 32 cm (web) and 36 cm (texts) (Bababekova et al. 2011, via `docs/look/research/vertical.md` §3). Zones are
`LAYOUT.md` §1's: caption band y 290-600 (block y 317-556, centred on x 520), read zone y 600-1250, subject axis x
380-700, key-read box x 120-950 / y 600-1480. Scratch (scripts, frames, a zone sheet over still v6, the downloaded
templates): `/tmp/comp/vertical/`; not committed.

## 0. Bottom line

1. **The owner never sees our whole frame.** In Instagram's Reels tab (the main feed; v1 drew 86 % of its views there)
   on his iPhone (2622 x 1206 px at 460 ppi [V15]), a 9:16 reel fills the whole 402 x 874-pt screen: our frame is
   scaled 1.366x and **98 px are cut from each side** (visible x 98-982, all of y). On a profile or a shared link the
   video sits above an opaque bar and 52 px are cut per side (MEASURED, §1.1). Everything therefore looks **1.22x
   bigger** on his feed than in a review MP4 played fit-to-screen.
2. **Instagram's interface over our frame, measured to the pixel** (Reels tab): status bar and header to y 218; the
   right rail of icons at **x 877-954, y 1032-1660**; the name block from **y 1519** (the avatar's top), then the
   caption line, the progress bar and the floating tab bar (x 210-870, y 1752-1860); a scrim darkens the top ~240 px
   by ~10 % and the bottom by up to ~20 % (§1.2-1.3). `LAYOUT.md`'s bottom (y 1520) is exact; its rail (x > 950 at y
   900-1500) sits 73 px too far right; its top (y < 180) stops 38-55 px short of the header's bottom (§8).
3. **The ad safe zones are now verified from the platforms' own files** (OFFICIAL, measured on their pixels): TikTok
   In-Feed x 120-960 / y 240-840, then x 120-780 to y 1260 (38 % of the frame); YouTube vertical x 48-887 / y
   288-1247 (39 %); Meta's Reels figure (14 % top, 35 % bottom, 6 % sides) is REPORTED. Their intersection is x
   120-887, y 288-1247, with x <= 780 below y 840: 33 % of the frame (§1.4). `LAYOUT.md`'s ad row holds.
4. **The centre column is our subject axis.** Clear in every measured view: x 130-870 from the band down to y 1519 (to
   x 950 above y 1020). The feed's visible thirds fall at x 393 and 687, so the subject axis (x 380-700) IS the phone's
   middle third; the visible stage under the words (x 98-982, y 600-1519, a near square) has its golden box at x
   436-644, y 951-1168, inside `cinema.md` C1's focal home (§2, §7).
5. **The eye starts at the centre and is pulled to words.** A centred subject in vertical video gave longer fixations
   and fewer saccades than a moving one [V5]; educational short videos got "stable" gaze on one or two areas [V6];
   subtitles are read "more or less obligatorily" [V9]. So: one band of words, one focal on the axis close under it, a
   drop of ~300-450 px (4-6 degrees) preferred; every caption pop pulls the eye back up (§3).
6. **The thumb-stop happens while the page is still moving.** The next reel slides up from the bottom, its TOP band
   first: half the travel in 0.07 s, settled by ~0.4 s (MEASURED, §4). People give a mobile feed item ~1.7 s and
   recall what they saw at 0.25 s [V4]; TikTok asks for the proposition in 3 s [V2]; YouTube for "tight framing" and
   "focus on your main subject" [V1]. The ~0.3 s draw-on the owner found barely visible (playbook Hook) was over before
   the page had settled: an opening's big event must peak after 0.4 s and last >= 1 s.
7. **Words, in angle:** our 98 px caption has a 46 px x-height = 0.55-0.62 degrees, about 3x the floor of fluent
   reading (0.2 degrees [V11] = 15-17 px x-height, a ~32-36 px Patrick Hand); the 56 px floor for words is 0.31-0.36
   degrees. The crop makes a full 850 px caption line lose its first 3 px on the owner's phone (13 px on a 20:9
   phone): lines <= 780 px. Reading speed: <= 20 characters a second [V8], 160-180 words a minute [V7] (§5).
8. **What stops reading on a phone:** under 0.2 degrees of text or ~2 px of line; the crop, rail, header or name block;
   a colour-only edge (colour is stored at half resolution [V15]); detail that needs more than a glance in a 1.7 s look;
   two calls or several movers at once; light detail under the bottom scrim (§3.4).
9. **The best vertical explainers compose as a stage under a sky of words.** The owner's own model (reference 2,
   measured in `docs/style_bible_ref2.md`) centres its vanishing point (x 0.45-0.53 W in 11 of 16 shots), keeps 37-43 %
   of the frame as flat sky holding the captions at y 317-556, and puts its mascot on the axis in 11 of 18 samples; the
   platforms and publishers say the same in words (§6).
10. **Distilled rules V1-V14 with their target docs: §7.2; clashes: §8** (the main ones: the rail, the caption width,
    reviewing at fit-to-screen size, and the human-scale size read through the feed's 1.22x).

## 1. The screen we are watched on (MEASURED)

### 1.1 How each view scales our frame (the owner's phone)

The owner's phone records its screen at 1206 x 2622 (an iPhone 16 Pro-class screen: 6.3 inch, 2622 x 1206 px at 460
ppi [V15]); his five reference recordings are the same screen at 540 x 1174. Two sources of truth:
- **Our own v1 inside Instagram** (`context/uploads/5c49279a-ScreenRecording_10-25-2026_16-18-22_1.mp4`, the post
  opened from the profile, an opaque bar below it), registered against v1's render
  (`deliverables/v1/php2shell_final.mp4`): SIFT features and a RANSAC similarity on four frames (1050-1192 inliers
  each) give screen = 1.2359 x ours + (-64.3, +0.1) native px, the same within 0.0002 in scale and 0.15 px in offset
  across the four.
- **Other creators' 9:16 reels in the Reels tab** (`docs/look/refs_composition/03_rec_09-54-22.mp4`, 2026-10-30;
  `context/uploads/982a368f-*` and `f2bb4a5a-*`, 2026-10-27): the reel's content moves under the status bar and under
  and below the floating tab bar (a temporal spread of 18 and 26 grey levels in reel 03's top and bottom rows), so a
  9:16 video fills the full screen height: an aspect fill. The landscape reels (01, 02, 04, 05) are shown fit to the
  width with black above and below.

| view | how it fits | screen px per our px | visible part of our frame | 1 px of ours | angle per px (32 / 36 cm) |
|---|---|---|---|---|---|
| **Reels tab** (the main feed; the floating tab bar over the video) | fills the whole screen | 1.366 | **x 98-982** (884 px), y 0-1920 | 0.0754 mm | 0.81' / 0.72' |
| a profile or a shared reel (an opaque 83-pt bar below) | fills the area above the bar | 1.236 | x 52-1028 (976 px), y 0-1920 | 0.0682 mm | 0.73' / 0.65' |
| a review MP4 in a player, fit to the screen | fits the width | 1.117 | all (1080 px) | 0.0617 mm | 0.66' / 0.59' |

The visible frame in the Reels tab is 66.6 x 144.8 mm, 11.9 x 25.9 degrees at 32 cm: about a hand at arm's length.
The Reels tab shows our frame 1.22x larger than a fit-to-screen review of the same MP4, and cuts 9 % off each side.

### 1.2 Instagram's interface over our frame (MEASURED, our px)

Reels tab: the temporal median and spread of the three recordings at 4 frames a second (the interface is what stays
bright and still while the reel moves); the layout is the same in all three, three days and two creators apart (the
name row within ~8 px). Profile view: the pixels where the recording differs from our registered v1 by more than 40
grey levels in at least 3 of 4 frames.

| element | Reels tab (fill) | profile / shared view |
|---|---|---|
| status bar (time, island, battery) | glyphs y 52-90; island x 380-687, y 29-111 | glyphs y 60-97; island x 359-704, y 33-124 |
| header | "Reels" title x 455-627, filter icon x 882-936, y 165-218 | back and "+" icons x 130-156 / 948-996, title x 491-591, y 187-235 |
| right rail | icons and counts **x 877-954**: like y 1032-1088 (count 1112-1138), comment 1186-1245 (count 1267-1292), share 1351-1405 (count 1428-1457), more 1518-1531, audio thumbnail x 879-950, y 1588-1660 | icons x 919-988: like y 1303-1362, comment 1476-1535, share 1594-1652, more 1718-1731, audio thumbnail ~1798-1865 |
| name block | avatar x 135-212, **y 1519-1596**; name and Follow x 229-578, y 1534-1577 | avatar x 88-178, y 1711-1786; name and the "AI content" label x 198-~563, y 1716-1786 |
| caption line, progress | caption y 1624-1660 (x 131-682); progress bar y 1699-1711 (x 131-946) | caption line y ~1829-1865, under the scrim |
| tab bar | a floating capsule x 210-870, y 1752-1860 (icons y 1781-1830); the video runs on under it | an opaque bar below the video (off our frame) |
| visible and uncovered | **x 98-982 from y 218 to 1032, x 98-877 from y 1032 to 1519: 53 % of our frame** | x 52-1028 from y 235 to 1303, x 52-919 to y 1711: 67 % |

A post's own rows (a caption opened with "more", a music line, a translation or AI label) may add a text row to the
name block; our own post in the Reels tab is the one view not yet recorded (§9).

### 1.3 The scrims (MEASURED, profile view)

Instagram darkens our frame where its white glyphs sit. The ratio of the recording's luminance to our render's, by row,
against a mid-frame baseline of ~0.94 (the display and the screen recording's own encode): **top** 0.84-0.89 at y
0-240 (about 10 % darker), back to the baseline by y ~300; **bottom** from y ~1680: 0.87 at y 1720-1760, 0.82 at
1760-1800, 0.77 at 1840-1880, 0.75 at the bottom edge (about 20 % darker). The Reels tab shows a similar bottom gradient
in its median map (not measured: no render to compare). A near mass under the name block is darkened a further 10-20 %
for free; a light detail there loses contrast.

### 1.4 The ad templates (OFFICIAL files, measured on their pixels)

| platform | source | safe area (our px) | covered | safe share |
|---|---|---|---|---|
| TikTok In-Feed, standard LTR | TikTok's safe-zone file `Feed.png` (2880 x 5120 = 4x a 720 x 1280 canvas, dated 2025-04-15) [V2] | x 120-960, y 240-840; then x 120-780, y 840-1260 | top 240, bottom 660, sides 120, an action column x 780-960 from y 840 | 38 % |
| YouTube vertical video ads | Google's transparent overlay `youtubesafezoneoverlay_vertical_final.png` (1080 x 1920) [V1] | x 48-887, y 288-1247 (840 x 960) | top 288 (15 %), bottom 672 (35 %), left 48, right 192 | 39 % |
| Meta Reels ads | REPORTED: 14 % top, 35 % bottom, 6 % sides, from secondary sources quoting Meta [V3] | x 65-1015, y 269-1248 | | 45 % |
| **all three** | the intersection | **x 120-887, y 288-1247; below y 840 only x 120-780** | | 33 % |

TikTok: "The safe zone size is determined by the dimension (vertical, horizontal, or square), ad caption length, and any
additional formats used", and its ad preview "is not specific to a device" [V2]. Google: "Overlays, call-to-actions,
and buttons may appear in different places depending on the format, campaign type, and screen", and "YouTube
dynamically adjusts your video to fit the viewer's device without stretching or cutting off your content" [V1]. These
are ad layouts (a call-to-action button, an ad label, a longer caption); organic posts cover less, as §1.2 shows for
Instagram. TikTok's and YouTube's organic interfaces were not measured (no recording; §9 is the five-minute procedure).

### 1.5 Other phones (arithmetic)

When an app fills a screen of width/height ratio a with our 9:16 frame, it cuts (1080 - 1920 a) / 2 px from each side:

| screen | cut per side |
|---|---|
| 16:9 (older, smaller iPhones) | 0 |
| 19.5:9 (most iPhones since 2017) | 97 |
| the owner's (1206 x 2622) | **98** |
| 20:9 (most current Androids) | 108 |
| 21:9 (tall Androids) | 129 |
| an app filling the area above an 83-pt bar on the owner's phone (Instagram's profile view, measured) | 52 |

So x 0-108 and x 972-1080 are cut on most current phones where the app fills the screen (up to 129 px on 21:9);
key reads inside x 130-950 survive all of them (est., for apps that fill; YouTube says it fits instead [V1]).

### 1.6 Against LAYOUT §1

| LAYOUT §1 says | measured | verdict |
|---|---|---|
| organic top UI y < 180 | header to y 218 (Reels tab) or 235 (profile), a top scrim to ~240 | the band (y 290) stays clear by 55-72 px; the number moves to 240 (§8 row 2) |
| organic bottom UI y > 1520 | the name block starts at y 1519 (Reels tab), 1711 (profile) | **exact** |
| organic right rail x > 950 at y 900-1500 | x 877-954 at y 1032-1660 (Reels tab); x 919-988 at y 1303-1868 (profile) | **x > 870 at y 1020-1520** (below that, everything is bottom UI) (§8 row 1) |
| side margins: nothing key within 120 px of a side edge; the gutters x < 95, x > 945 may hold quiet detail | x < 98 and x > 982 are not on the owner's feed at all | 120 holds (22 px inside the crop); the gutters are partly never seen (§8 row 4) |
| caption block x 95-945, <= 850 px, centred on x 520 | a full 850 px line starts 3 px outside the crop | lines <= 780 px (§8 row 3) |
| key-read box x 120-950, y 600-1480 | the rail covers x 877-950 from y 1032; the crop x > 982 | x 130-870 below y 1020 (§8 row 5) |
| ad overlay: top 240-288, bottom 35 %, rail x > 780 from y 840, sides 48-192 (REPORTED) | the same numbers in the platforms' own files | now OFFICIAL (§1.4) |

The zone sheet (scratch, `/tmp/comp/vertical/zones_sheet.png`) draws these over still v6: in the Reels tab v6's fourth
and fifth calls (the boat at the right edge and the man beside it, `docs/look/organic/composition.md` §3) sit in the cut
strip and under the rail, and its near tree loses its left third.

## 2. Stacking and the centre column

**The phone shows four stacked bands** (Reels tab, our px):

| band | y | what it is on the phone | what we put there |
|---|---|---|---|
| status and header | 0-240 | the clock, the island, "Reels", a 10 % scrim | framing only: the sky's top, a lid, the hero cloud (LAYOUT's top gutter) |
| words | 240-600 (the band 290-600) | clear across x 98-982 | the caption on one flat field of sky or wall |
| the stage | 600-1519 | clear across x 98-982 to y 1032, then x 98-870 beside the rail | the beat: the subject on the axis, the "you", the opening |
| the app's text and the hand | 1519-1920 | the name block, caption, progress bar, tab bar, a 10-20 % scrim; the thumb, in one-handed use (49 % of 780 people seen touching their phones held them in one hand [V14]) | the near ground as one quiet mass cut by the bottom edge, nothing to read |

**The stage square.** Under the words the visible stage is x 98-982 by y 600-1519, 884 x 919 px: a square, the same
"stage square" `cinema.md` §1 finds at full width (y 600-1520). Its grid on the owner's feed: thirds x 393 / 687 and y
906 / 1213; golden lines x 436 / 644 and y 951 / 1168; centre (540, 1060); diagonal 46 degrees. In a square the
diagonal method's "eyes" close in on the centre: the stage itself asks for a centred subject.

**The centre column** is what every measured view leaves clear: x 130-870 from the band down to y 1519 (the right edge
950 above y 1020, where no rail reaches). Our subject axis (x 380-700) is its middle third, and the feed's own thirds (x
393, 687) fall inside the axis, 13 px from its edges: on the phone, "on a third" and "on the axis" are the same place.
The caption's centre line (x 520) is 20 px left of the visible centre (540), a margin reference 2 kept for the rail
(`docs/style_bible_ref2.md` §3.1); the crop is symmetric and no rail reaches the band, so nothing needs the offset, and
with lines <= 780 px (V5) nothing is lost by keeping it.

**Depth stacks up the frame, never across it.** Width is scarce (884 visible px), height is not: the near ground at the
bottom under the app's text, the subject on the stage, the far world and the sky climbing behind and above it. This is
`cinema.md` §4.8 (the hanging scroll's distances) and `reels.md` §4 (a landscape picture at full width becomes our read
zone, with sky above and ground below), now with the phone's bands: the stack's two quiet masses (R5) are exactly the
two bands the app covers, the words' sky and the near ground.

**One stage, never a split screen.** Multi-screen short videos produced a "segmented" mode of attention, rhythmic
switching between streams [V6]; a subject that kept moving round a vertical frame cost more saccades and shorter
fixations than one kept centred [V5]. A comparison is a sequence of one-stage frames, or one frame with the subject at
the seam (`reels.md` D6), never two stages stacked.

## 3. Where the eye lands first

### 3.1 The evidence

- **The centre first.** When a scene appears the first look goes to the screen's centre whatever it holds (Tatler 2007,
  `cinema.md` [S7]); on the feed that is (540, 960), 100 px above the stage's centre.
- **Centred beats moving, on phones, in vertical video.** 40 people aged 18-35 watched two 20 s vertical videos on their
  own phones, the subject kept in the middle or moving top, bottom, left and right: the centred one gave longer
  fixations and fewer saccades, the moving one more eye movement and more load [V5].
- **Educational videos get stable gaze.** In a lab study of ten TikTok videos (16 viewers), lifestyle and educational
  videos drew a "stable mode" where "the gaze focused on one or two dominant areas with low physiological activation";
  fast, sensitive videos a "fragmented, reactive mode with shorter fixations, more frequent shifts" [V6].
- **Words pull the eye automatically.** Viewers read subtitles even when they understand the soundtrack: reading them
  is "more or less obligatory" [V9]. Each caption pop is an attention event that pulls the gaze to the band.
- **Words near the action cost less.** Titles placed near the focus of attention brought viewers back to the focal
  points sooner and left more time to explore the image; and in short vertical videos, subtitles placed at the top drew
  far fewer fixations than ones in the middle, with no difference in comprehension (both REPORTED, the second a
  master's thesis [V10]).
- **The vertical format itself reads easily.** Vertical mobile video ads were processed more fluently than horizontal
  ones, because watching them takes less effort (no turning the phone), more so for younger viewers [V12].

### 3.2 The eye on our frame, in angles (owner's phone, Reels tab, 32 cm)

| distance on our frame | angle | what it means |
|---|---|---|
| 74 px | 1 degree | the eye's sharp centre is about 2 degrees across: ~150 px of our frame |
| 370 px | 5 degrees | the edge of the near-centre preview field while the eye rests on one spot |
| 304-644 px (R7: the focal 300-650 px under the caption block) | 4.1-8.7 degrees | one saccade from the words to the focal; at the short end the focal sits at the edge of the preview field while the eye reads |
| 884 x 1920 (the visible frame) | 11.9 x 25.9 degrees | the eye crosses the width in two or three fixations, the height in four or five (est.) |

### 3.3 What this asks of the frame

- **One path, from the words to the focal, then stop.** Words (the band) -> one drop to the focal on the axis -> nothing
  else. The bottom of the frame is where the app's text and the hand are: a line or a call that leads the eye down past
  the focal delivers it to the name block, the exit (Poore's "never straight out", `cinema.md` §4.5, made literal).
- **A short drop.** The focal's centre 300-450 px under the block (y ~860-1010, 4-6 degrees) when the shot allows;
  650 px (8.7 degrees) is the far limit. Every caption pop (one every ~1.1-1.5 s) sends the eye back up and down this
  drop.
- **The interface is part of the picture.** The rail and the name block are bright white glyphs on a scrim: calls the
  viewer always has in view at the lower right and the bottom. Our own pulls stay out of their way: no call of ours at
  x > 830 below y 1000 or below y 1480; R8's counterweight high (the top gutters, y < 600) or on the left, never in the
  lower right, where it would merge with the rail.

### 3.4 What stops reading on a phone

| cause | the number on the owner's phone | where it comes from |
|---|---|---|
| text too small | x-height under 0.2 degrees = 15 px (32 cm) to 17 px (36 cm): Patrick Hand under ~32-36 px | the fluent range of reading, 0.2-2 degrees of x-height [V11] |
| a line too thin | 1 arcminute = 1.2-1.4 px: a 1 px line vanishes, 2 px is the floor, 3 px reads | acuity (`docs/look/research/vertical.md` §3) |
| a figure too small | "a person" from ~25 px, "a person doing what" from ~40 px, reliably 60-80 px | Johnson's criteria (`docs/look/research/vertical.md` §3) |
| out of view | x < 98 or > 982 (Reels tab); the header y < 218-235; the rail x >= 877 at y 1032-1660; y >= 1519 | §1 |
| too short | a caption page shorter than its characters / 20 s; a detail needing more than ~0.25 s while the eye is on the subject | [V8]; `cinema.md` §5 (the background's quarter second); the 1.7 s a mobile item gets [V4] |
| colour only | an edge between two hues of equal value, or a thin coloured line: colour is stored at half resolution (4:2:0, a 540 x 960 colour image) and blurs over 2+ px, more after the platform's re-encode | [V15]; our 3.5 Mbps Reels-like encode test (`docs/look/research/vertical.md` §3) |
| two calls | the eye splits; gaze fragments with several movers | [V5, V6]; R3 |
| under the scrim | light detail in the bottom ~240 px loses up to ~20 % of its luminance, the top ~240 px ~10 % | §1.3 |

## 4. The thumb-stop first frame

**What the swipe shows (MEASURED, reel 04 at 19.2 s, phase correlation at 30 fps).** The next reel slides up from the
bottom of the screen: its top band (our words) appears first, at the bottom of the screen, and rises. The page travels
one screen in about 0.4 s: half of it in 0.07 s, 90 % in 0.15 s, 99 % in 0.23 s, settled by ~0.4 s. Whatever our
opening does in its first ~0.3 s happens while the frame is still sliding under the viewer's eye: the ~0.3 s draw-on
the owner found "barely visible or noticeable" (playbook Hook and pacing, v3, 2026-10-28) was over before the page came
to rest.

**How long the frame has.** People spent 1.7 s with a piece of mobile feed content against 2.5 s on desktop, and could
recall mobile content at a statistically significant rate after 0.25 s (Facebook IQ, 2016, REPORTED [V4]). A scene's
gist is caught in ~0.1 s (`docs/look/research/vertical.md` §3). Our own curves: v1 kept 76 % of viewers at 2 s, v3 40 %
(playbook Performance log). TikTok: "Introduce your content proposition in the first 3 seconds for better recall and
awareness"; "Prioritize your hook in the first 6 seconds" [V2]. YouTube Shorts: "Be unavoidable", "Use tight framing for
ease of viewing", "Announce yourself with audio", "Focus on your main subject" [V1]. A publisher on TikTok: "the first
sentence (first few seconds) is definitely the most important ... If we have images and a person on the first frame then
people are like 'OK this is catching my attention'"; an animated science explainer there, "always packing as big a punch
as possible in the first three seconds" [V13].

**Frame 0 in vertical, with numbers** (on top of DIRECTION rule 9 and `CINEMATIC_GUIDE.md` "The opening", which stand):
- **Peak after the page settles.** The opening's bold event (the subject's line drawing on, the colour flood) runs >= 1
  s and makes its biggest change after 0.4 s; its first strokes may start at frame 0, under the slide.
- **Read as one gist at 0.25 s.** One subject on the axis, big: the opening's tier A at the top of LAYOUT's subject box
  (>= 400 px wide: 45 % of the visible width, >= 5.4 degrees), its line drawn at full contrast, the frame's hardest
  value step on it (R4); nothing else in the stage pulling at half its strength (R3).
- **The words enter first.** The band rides in first on the swipe: frame 0 shows the first spoken line there
  (playbook), flat sky behind it, nothing in the top 240 px that needs reading.
- **Motion near the centre.** The new thing moves inside the stage square's golden box (x 436-644, y 951-1168), where
  the centre bias already puts the eye; nothing important starts in the bottom 400 px or the outer 98 px.

**The cover in the grids.** On the profile grid and in Explore (11 % of v1's views) a reel is a tile about a third of
the screen wide: 1 px of ours is ~0.2 arcminutes there, so our 98 px caption type has an x-height of 0.15-0.17
degrees, just under the 0.2-degree floor [V11]. A cover title meant to be read in a tile needs an x-height of >= 54-61
px: Patrick Hand at ~115-130 px (`LAYOUT.md` §5 checks the cover "at 360 px wide", the same third; est.).

## 5. Captions and words on screen

| question | the evidence | ours now | proposal |
|---|---|---|---|
| where | the bottom 21-35 % is the app's (§1.2, §1.4); BBC, for 9:16 in its own player: "it is common to position subtitles a little higher up, though still generally in the lower third", because faces sit in the top half [V7]; top-placed subtitles drew fewer fixations than middle ones in short vertical video, with equal comprehension (REPORTED [V10]) | the band y 290-600, in the sky | keep: the only text zone clear in every view; the focal close under it (§3.3) |
| how big | the fluent range 0.2-2 degrees of x-height [V11]; BBC for 9:16: a line height of 3.9-4.5 % of the video's height (75-86 px) [V7] | 98 px, x-height 46 px (MEASURED from the font: 0.47 em) = 0.55-0.62 degrees; baselines 123 px apart (6.4 % of the height, 1.5x BBC's) | keep: the large end suits a 1.7 s glance |
| how wide | BBC: 90 % of a 9:16 video's width [V7]; the Reels tab shows 884 px | <= 850 px centred on x 520: x 95-945, its left end 3 px outside the crop | **<= 780 px** (x 130-910, 88 % of the visible width): ~23 characters at 98 px (34 px a character) |
| how many lines | BBC: up to three in 9:16 [V7] | <= 2 | keep 2: the band stays one 310 px field |
| how fast | Netflix: up to 20 characters a second for adults [V8]; BBC: 160-180 words a minute, ~0.3 s a word [V7]; TikTok's ad advice, "5-10 words per second" [V2], is far above both | a change at least every 1.5 s; reference 2: an event every 1.13 s, pages 0.8-4.0 s | **a page's characters <= 20 x its seconds** (a 40-character page stays >= 2.0 s; a 1.1 s event holds <= 22 characters) |
| contrast | BBC: white on black [V7] | dark ink on a flat light sky, >= 7:1, the sky flat to dL* <= 1.5 behind it (LAYOUT §1) | keep; the top scrim (-10 %) ends above the band |
| words in the world | the same floor | >= 56 px for any word a viewer must read (x-height 26 px, 0.31-0.36 degrees); one number 120-160 px; the board's floor 48 px (0.27-0.30 degrees) | keep; all are 1.4-1.8x the floor. The owner's "this text is weird" (11-13 px lines, v3) was 0.06-0.08 degrees |

## 6. How the best illustrated and animated explainers compose for vertical (principles)

**The owner's own model, measured** (reference 2, an illustrated, animated 9:16 explainer; `docs/style_bible_ref2.md`
§1-3): a centred one-point stage (the vanishing point at x 0.45-0.53 W in 11 of 16 shots, an aisle or path from the
bottom centre to it); only three sets, re-framed 16 times; a flat sky of 37-43 % of the frame holding the captions (y
317-556, centred on x 520, 98 px) with the sun just under them; the mascot on the axis in 11 of 18 samples; foreground
figures cut by the bottom and side edges; a caption event every 1.13 s. The 9:16 motion reference the owner sent on
2026-10-29 (`docs/look/refs_human_scale/04_cloud_beast_motion.mp4`) is 91 % quiet at a squint in three masses, one small
figure (~145 px) at a junction of light, ~5 % of its pixels moving (`docs/look/organic/composition.md` §2;
`docs/look/refs_human_scale/README.md`).

**What the platforms and publishers say** [V1, V2, V13]: the proposition in 3 s; tight framing; be unavoidable; focus
on the main subject; anchor the story with on-screen words; announce it with sound; complex ideas explained visually
in a strong graphic style, the punch in the first three seconds; 30-60 s long.

**The grammar they share** (each a principle, not a copy):
1. **A stage under a sky of words.** The words have one fixed home at the top on a calm field; the story happens under
   them on one stage. Ours: the band and the stage square (§2).
2. **Everything on the axis.** The vanishing point, the path, the mascot, the subject: the centre column; side positions
   are rare and deliberate.
3. **Few sets, re-framed.** Three sets for 16 shots in reference 2: the stage stays familiar, so each new frame costs
   the eye nothing to find its subject. Ours: one home place (DIRECTION 1).
4. **The subject big, the frame tight.** On a 6.7 cm wide screen the subject is a third to half of the visible width;
   the scale shot is the exception, and there one small figure carries it.
5. **Height, not width.** Paths that climb, towers cut by the top edge, rise-overs and pull-backs: the tall frame's own
   moves (`CINEMATIC_GUIDE.md` S1, S5; `cinema.md` §8).
6. **Words few and big; the rest in the post's text.** On-screen words are the captions, one label or one number.
7. **No split screens, no talking heads.** Explainers built on a presenter (a face, a green screen behind) do not
   apply: we draw no faces (DIRECTION 3), and a second stream stacked on the first splits attention [V6].

## 7. The classic principles in 9:16, with numbers

### 7.1 Each principle on the owner's phone

| principle | its classic form | in our frame, on the feed (numbers) | ours |
|---|---|---|---|
| the frame | the whole picture | the visible frame is x 98-982; 53 % of our frame is visible and clear of interface (§1.2) | design to the clear window; only masses run into the cut strips and under the interface (LAYOUT §1) |
| thirds | lines at 1/3 and 2/3 | full frame x 360 / 720, y 640 / 1280 (`cinema.md` §1); **the feed's visible thirds x 393 / 687**; the stage's y 906 / 1213 | the subject axis is the middle third; a horizon near y 640 (ground-led) or ~1150-1280 (sky-led, setup A, `cinema.md` §3.3) |
| golden section | lines at 0.382 / 0.618 | the visible stage's x 436 / 644, y 951 / 1168 | the focal's home x 436-644, y 951-1168, inside `cinema.md` C1's x 413-667, y 951-1187 |
| centre, symmetry | formal balance | the visible centre x 540 (the crop is symmetric); a centred subject holds the eye better in vertical [V5] | centred is the default, not a formal exception; a side-facing subject still sits off centre, on its back side |
| headroom | space above the subject | the band is the headroom: tops at y >= 620; the drop from the block 300-450 px | R7, its short end |
| lead room | space in front of a facing or moving subject | in the rail's band (y 1032-1660) the right edge is x 870, not 982: for 1.5:1 room a right-facing subject sits at x <= 410, a left-facing one at x >= 560 | `cinema.md` C9 with 870 as the right edge below y 1020 |
| balance (the steelyard) | a big soft mass near the centre balances a small strong one far out | the interface is a fixed weight at the lower right (the rail) and along the bottom (the name block) | the counterweight high (y < 600) or left; never lower right (R8) |
| leading lines | lines that carry the eye to the subject | seen from y 1519 up; inside x 98-870 below y 1020; the visible frame's diagonal is 65 degrees, the stage's 46 | the lines rise from the bottom edge to the focal and stop there (`cinema.md` C7); none into the rail, the band or the name block |
| negative space | the quiet field round the subject | the two bands the app covers (the words' sky, the near ground) are the frame's two quiet masses | R5's two quiet masses sit under the app's own text: quiet there costs nothing |
| figure and ground, notan | the subject one clear shape | the gist in ~0.1 s; the subject's silhouette >= 3 degrees (~220 px); edges as value steps, not hue alone | R1, R4; DIRECTION 4's edges from light and shade survive 4:2:0 colour |
| scale, the human figure | a known-size person beside a big world | the "you" at 130-220 px = 1.6-3.0 degrees = 15-25 % of the visible width; the references' people (8-16 % of the screen's width) are 71-141 px of ours on this feed | §8 row 6 |
| depth layering | near, middle, far planes | the planes stack upward: near under the name block, the subject on the stage, far and sky behind the words | `cinema.md` §4.8; R5 |
| frame within a frame | an opening that holds the subject | tall openings fit: a door or window on the axis, 15-30 % of the frame, inside the clear window | `reels.md` C1; `cinema.md` §4.6 |
| rhythm | a repeated motif with one break | the break on the axis; the pattern a texture inside its mass | `cinema.md` C14 |
| motion | the eye goes to the mover | the swipe is the first motion; then one mover at a time, inside the golden box | DIRECTION 3's budget; R3 |

### 7.2 The rules, distilled (each a proposal, with the doc it would go into)

| # | rule (our px, 1080 x 1920) | why | target |
|---|---|---|---|
| V1 | **Design to the feed's visible frame.** On the owner's feed only x 98-982 is seen (52 px a side on a profile, up to 108 on 20:9 phones): key reads inside x 130-950; anything that must read as cut by the frame edge is cut at x 98 / 982, so it must still read with its outer 98 px gone | §1.1, §1.5 | `LAYOUT.md` §1 (canvas, side margins rows) |
| V2 | **The rail, measured.** Organic right rail x > 870 at y 1020-1520 (Reels tab: icons x 877-954, y 1032-1660; profile: x 919-988, y 1303-1868); the key-read box's right edge 870 below y 1020 | §1.2 | `LAYOUT.md` §1 (platform UI, key-read box); `src/lib/theme.ts` `safe.rail`; `scripts/qa/framecheck.py` (tooling) |
| V3 | **The top, measured.** Nothing to read above y 240 (the header to y 218-235, a 10 % scrim to ~240); the band from y 290 stays as it is | §1.2-1.3 | `LAYOUT.md` §1; `theme.ts` `safe.top` 180 -> 240 (tooling) |
| V4 | **The bottom, measured.** The app's text from y 1519 (LAYOUT's 1520 confirmed); under it one quiet dark-mid mass, no light detail and no call: the scrim darkens it a further 10-20 % | §1.2-1.3; R5, R10 | `LAYOUT.md` §1 (bottom third row) |
| V5 | **Caption lines <= 780 px** (x 130-910 on the x 520 centre line, ~23 characters at 98 px), still <= 2 lines | §1.5, §5; [V7] | `LAYOUT.md` §1 (caption block); `theme.ts` `skyCaption.maxWidth` 850 -> 780; `scripts/capcheck.py` (tooling) |
| V6 | **Caption pace:** a page's characters <= 20 x its seconds on screen | [V8], [V7] | `LAYOUT.md` §1 (caption block); the caption builder |
| V7 | **Sizes by angle:** words' x-height >= 0.2 degrees on the feed (>= 17 px; our 56 px floor keeps 1.5x over it); lines >= 2 px; a cover title meant for a grid tile ~115-130 px | [V11]; §3.4, §4 | `LAYOUT.md` §3 (words), §5 (the cover) |
| V8 | **The centre column and the focal's home:** key reads in x 130-870 from the band to y 1519 (x 130-950 above y 1020); the focal centred in the visible stage's golden box (x 436-644, y 951-1168); the drop from the caption block to the focal 300-450 px preferred, 650 at most | §2, §3; [V5, V6, V9, V10] | `LAYOUT.md` §1 (subject axis), §3; R7 |
| V9 | **Frame 0 in the swipe:** the opening's bold event lasts >= 1 s and peaks after 0.4 s; the subject (tier A) >= 400 px wide on the axis with the hardest value step; the first spoken line in the band from frame 0 | §4 (the measured swipe); [V1, V2, V4, V13] | `CINEMATIC_GUIDE.md` "The opening"; DIRECTION 9 and the playbook's Hook and pacing (evidence) |
| V10 | **One stage, no split screens;** a comparison is a sequence, or one frame with the subject at the seam | [V5, V6] | `LAYOUT.md` §3 |
| V11 | **The interface is in the picture:** no call of ours at x > 830 below y 1000 or below y 1480; the counterweight high or left; leading lines end at the focal, never at the name block | §3.3 | `LAYOUT.md` §3; R8 |
| V12 | **Review as the feed shows it:** every review MP4 also checked at the Reels tab's crop and scale (x 98-982, our frame 1.22x its fit-to-screen size) with §1.2's interface drawn over it; sizes judged there | §1.1 | `LAYOUT.md` §6 (checks); `scripts/qa/framecheck.py` (a Reels-tab overlay, tooling) |
| V13 | **Reference sizes through the feed:** a landscape reference shown at full phone width maps its width to 883 of our px on the owner's feed, not 1080 | §1.1 | the owner's call (§8 row 6): DIRECTION 7, playbook DEPTH AND SCALE, `docs/look/refs_human_scale/README.md` |
| V14 | **Ads:** the three platforms' official safe areas intersect at x 120-887, y 288-1247, with x <= 780 below y 840 | §1.4; [V1, V2, V3] | `LAYOUT.md` §1 (ad overlay: REPORTED -> OFFICIAL) |

## 8. Doc clashes found (flagged for the orchestrator; not edited here)

1. **The rail.** `LAYOUT.md` §1 (platform UI, organic: "right rail x > 950 at y 900-1500"), `src/lib/theme.ts`
   `safe.rail` ({x 950, y0 900, y1 1500}) and `scripts/qa/framecheck.py`'s organic zones, against the measured rail: x
   877-954 at y 1032-1660 (Reels tab), x 919-988 at y 1303-1868 (profile). **Proposal:** V2: x > 870 at y 1020-1520; the
   key-read box (x 120-950, y 600-1480) becomes x 120-870 below y 1020.
2. **The top.** `LAYOUT.md` §1 "top y < 180" and `theme.ts` `safe.top` 180, against the header measured to y 218
   (Reels tab) and 235 (profile). **Proposal:** V3: 240. Nothing we draw changes: the band starts at 290.
3. **The caption's width.** `LAYOUT.md` §1 (the block x 95-945, <= 850 px) and `theme.ts` `skyCaption.maxWidth` 850,
   against the feed's crop (visible x 98-982; 108 px a side on 20:9 phones). **Proposal:** V5: <= 780 px.
4. **The gutters.** `LAYOUT.md` §1 side margins: "the gutters beside the block (x < 95, x > 945) may hold quiet detail
   and may rise through the band's height": x < 98 and x > 982 are not on the owner's feed. **Proposal:** keep the
   words and add "x < 98 and x > 982 are cut in most phones' main feed: nothing there is surely seen".
5. **The key-read box** (`LAYOUT.md` §1, x 120-950, y 600-1480; `theme.ts` `safe.action` x 90-990, y 200-1480): the
   rail covers x 877-950 from y 1032, and the crop x > 982. **Proposal:** x 130-950 to y 1020, x 130-870 from y 1020
   to 1480.
6. **The human-scale size as the owner sees it.** `docs/look/refs_human_scale/README.md` ("the landscape pictures fill the
   phone's width, so their people read at ~8-16 % of the screen's WIDTH: ~90-170 px tall in our 1080-wide frame"),
   DIRECTION rule 7 and the playbook's DEPTH AND SCALE ("~130-220 px tall in our 1080 x 1920 frame (the references'
   people as the owner sees them on the phone, full width: 8-16 % of the screen's width ...)") convert the screen's
   width to our 1080 px. On his Reels tab the screen's width is 883 of our px, so 8-16 % is **71-141 px**; `reels.md`'s
   median reel figure (178 px "at full width") is 146 px; the 9:16 motion reference's girl (~145 px, a 9:16 frame
   filled the same way as ours) agrees with these. A 130-220 px "you" reads on his feed at 15-25 % of the screen's
   width, up to 1.6x his references. Not a rule change: the owner's words ("about v2's original size or a little
   more"; "where a person would be about this size") stand. **Proposal:** show the owner the "you" at ~145 and ~200 px
   in the Reels-tab preview (V12) and let him pick; until then, the low half of the band (130-180 px).
7. **`docs/look/research/vertical.md` §2** (2026-10-25: the UI table, all REPORTED from search snippets). **Proposal:**
   a banner pointing to §1 here; its "union stage" x 120-880, y 290-1250 stays as the ad stage (now x 120-887, y
   288-1247, x <= 780 below y 840).
8. **Not a clash, a cause:** the playbook's Hook and pacing ("~0.3 s was invisible") is explained by the swipe (§4):
   the page settles at ~0.4 s. Its rule (every opening effect long enough to register) is right; V9 adds the number.

## 9. Measuring TikTok and YouTube Shorts the same way (procedure; ~5 minutes of the owner's time)

1. The owner plays one of our posted films in TikTok (in the For You feed if it comes up, otherwise from the profile)
   and in YouTube's Shorts player, and screen-records 5 s of each, as he did for v1 in Instagram.
2. Register the recording against our render: SIFT features on a recorded frame (masking the top 330, the bottom 320
   and the right 200 native px), matched against nearby frames of the render, then a RANSAC similarity
   (`cv2.estimateAffinePartial2D`, a 2-3 px threshold) on the best match: scale and offset, hence the crop.
3. Warp the render's frame onto the screen and take the absolute difference: pixels over 40 grey levels in 3 of 4
   frames are the interface; their boxes, mapped back with the inverse transform, are its zones in our px. The scrim:
   the recording's luminance over the render's, row by row.
4. Without a render, the Reels-tab method works too: 30+ frames at 4 a second, their temporal median and spread; what
   stays bright and still is the interface; the crop follows from whether the reel's content moves in the top and
   bottom rows (fill) or not (fit).

The scratch scripts for these steps are in `/tmp/comp/vertical/scripts/` (`register_v1.py`, `ui_mask_v1.py`,
`ui_boxes.py`, `scrim.py`, `reels_tab_ui.py`, `reels_tab_boxes.py`); they are not repo tools.

## 10. Sources (methods and facts only; no picture copied)

- **[V1]** Google. Ads Help, "About video ad specs", section "Universal safe zones for video ads on YouTube", with the
  transparent overlay `youtubesafezoneoverlay_vertical_final.png` (1080 x 1920), measured on its pixels:
  [support.google.com/google-ads/answer/13547298](https://support.google.com/google-ads/answer/13547298),
  [the overlay](https://services.google.com/fh/files/misc/youtubesafezoneoverlay_vertical_final.png). And "YouTube
  Shorts ABCDs Summary", a one-page PDF of creative guidance for Shorts ads:
  [services.google.com](https://services.google.com/fh/files/misc/formarketingshortsabcdsonesheeters.pdf).
- **[V2]** TikTok Ads Help. "TikTok Auction In-Feed Ads", section "Safe Zone", with its file "In-Feed-Standard Version
  LTR.zip" (`In-Feed/Feed.png`, 2025-04-15), measured on its pixels:
  [ads.tiktok.com](https://ads.tiktok.com/help/article/tiktok-auction-in-feed-ads?lang=en). And "Creative best
  practices": [ads.tiktok.com](https://ads.tiktok.com/help/article/creative-best-practices?lang=en).
- **[V3]** Meta's Reels ads margins (14 % top, 35 % bottom, 6 % sides) as quoted by secondary tools; Meta's own Ads
  Guide did not load from here: [inro.social](https://www.inro.social/tools/instagram-reels-safe-zone-checker),
  [socialync.io](https://www.socialync.io/tools/safe-zones/instagram-reels). REPORTED.
- **[V4]** Facebook IQ (2016), "Capturing attention in feed: the science behind effective video creative": 1.7 s per
  mobile item against 2.5 s on desktop; recall after 0.25 s (independent tests by Fors Marsh); as reported by
  [Social Media Today](https://www.socialmediatoday.com/news/facebook-releases-new-guide-to-help-advertisers-maximize-video-ad-performan/450818)
  and [The Motley Fool](https://www.fool.com/investing/general/2016/03/18/have-a-second-that-may-be-all-facebooks-video-ads.aspx).
  REPORTED; dated.
- **[V5]** A. Y. Baig et al. (2025), "Dynamics of Viewer's Attention: Making Content More Engaging in a Vertical Frame"
  (40 participants, webcam eye tracking on their own phones), as summarised by the platform the study used:
  [RealEye, "The Gravity of the Center"](https://realeye.io/blog/post/the-gravity-of-the-center-what-grabs-attention-in-vertical-videos/);
  [ResearchGate](https://www.researchgate.net/publication/395974456_Dynamics_of_Viewer's_Attention_Making_Content_More_Engaging_in_a_Vertical_Frame).
- **[V6]** L. Novanská Škripcová (2026), "Watching TikTok: An Eye-Tracking Study of Visual Attention Paid to
  Short-Form Videos", *Communication Today*; the abstract via
  [iMotions](https://imotions.com/blog/publications/watching-tiktok-an-eye-tracking-study-of-visual-attention-paid-to-short-form-videos/).
- **[V7]** BBC, *Subtitle Guidelines*: sections 3.1 (line length, 90 % of a 9:16 video's width), 3.3 (up to three lines
  in 9:16), 4 (160-180 words a minute), 8.1 (white on black), 9.2.1 (a line height of 3.9-4.5 % for 9:16), 10.1
  (vertical position in 9:16).
  [bbc.co.uk/accessibility/forproducts/guides/subtitles](https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/).
- **[V8]** Netflix, "English (USA) Timed Text Style Guide": 42 characters a line; up to 20 characters a second for
  adults, 17 for children.
  [partnerhelp.netflixstudios.com](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide).
- **[V9]** G. d'Ydewalle, C. Praet, K. Verfaillie and J. Van Rensbergen (1991), "Watching Subtitled Television:
  Automatic Reading Behavior", *Communication Research* 18(5), 650-666,
  [doi:10.1177/009365091018005005](https://doi.org/10.1177/009365091018005005).
- **[V10]** Subtitle placement: W. Fox (2016), "Integrated titles: An improved viewing experience?", in *Eyetracking
  and Applied Linguistics* (Language Science Press), as summarised in its abstract record
  ([MAP, UAB](https://mapaccess.uab.cat/node/3667)); and a Utrecht University master's thesis, "The influence of
  subtitle design of short videos on people's comprehension and visual attention distribution"
  ([studenttheses.uu.nl](https://studenttheses.uu.nl/handle/20.500.12932/46814)), its finding as reported by the
  search index (the repository did not load from here). REPORTED; the thesis preliminary.
- **[V11]** G. E. Legge and C. A. Bigelow (2011), "Does print size matter for reading? A review of findings from vision
  science and typography", *Journal of Vision* 11(5):8: "the fluent range ... from approximately 0.2 deg to 2 deg" of
  x-height. [PMC3428264](https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264).
- **[V12]** L. Mulier, H. Slabbinck and I. Vermeir (2021), "This Way Up: The Effectiveness of Mobile Vertical Video
  Marketing", *Journal of Interactive Marketing* 55, 1-15,
  [doi:10.1016/j.intmar.2020.12.002](https://doi.org/10.1016/j.intmar.2020.12.002).
- **[V13]** N. Newman (2022), "How publishers are learning to create and distribute news on TikTok", Reuters Institute
  for the Study of Journalism.
  [reutersinstitute.politics.ox.ac.uk](https://reutersinstitute.politics.ox.ac.uk/how-publishers-are-learning-create-and-distribute-news-tiktok).
- **[V14]** S. Hoober (2013), "How Do Users Really Hold Mobile Devices?", UXmatters: 1,333 observations, of the 780
  people touching their phones 49 % one-handed, 36 % cradled, 15 % two-handed.
  [uxmatters.com](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php).
- **[V15]** Device and codec facts: Apple, "iPhone 16 Pro - Tech Specs" (6.3 inch, 2622 x 1206 px at 460 ppi),
  [support.apple.com/en-us/121031](https://support.apple.com/en-us/121031); Wikipedia,
  [Chroma subsampling](https://en.wikipedia.org/wiki/Chroma_subsampling) (4:2:0: both colour channels at half the
  resolution in each direction).

**Our measurements** (scratch, `/tmp/comp/vertical/`): (M1) Instagram's profile view over our v1, by registration
(§1.1-1.2); (M2) Instagram's Reels tab, by temporal median and spread over three recordings (§1.1-1.2); (M3) the scrims
(§1.3); (M4) the official templates' pixels (§1.4); (M5) the swipe, by phase correlation (§4); (M6) Patrick Hand's
x-height, rendered at 98 px from `public/fonts/CaptionHand.woff2` (46 px; cap height 65 px). Angles and crops are
arithmetic from these and [V15]. No reference frame was used as an input to a picture of ours; the owner's recordings
were only measured.
