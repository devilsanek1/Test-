# The words on screen: the shared brief (iteration, 2026-10-30)

**The owner, verbatim:** "One aspect I want you to evaluate and research is the fonts and the text caption positioning
I'll give you a few references / We previously would have the text to be pretty static but there is so much more we can
do to make it look premium, more interesting, dynamic and more engaging / Research —-> distill it in the guidebook and
recipes to use —-> give me still examples". The references, measured: `refs/README.md` (look at the images too).

**This is an ITERATION** (playbook, Process: "Two modes: PRODUCTION and ITERATION"): two agents, no panels, no critics,
no QA suite, no fix pass; stills (no MP4s); the result in about an hour, straight to the owner, whose verdict is the
review. Only what the owner picks goes into production. Speed of feedback is the quality here: be thorough where it
changes the answer, and skip the rest.

**The two jobs:**
1. **Research, then the guide** (one agent): `RESEARCH.md` (this folder), then the guidebook `video/docs/look/TYPE_GUIDE.md`
   (marked DRAFT until the owner picks), whose last section is the still list for job 2.
2. **The stills** (one agent): every still in the guide's list rendered at 1080 x 1920 with the tooling in
   `video/scripts/type/` (README there), looked at on a phone-sized preview, adjusted until each one reads and looks
   premium; `stills/` here, with `stills/STILLS.md` (one line per still) and a contact sheet.

**What stays (the owner's words, which win over everything here):** captions are burned in and never clipped (they
pop in place or rise without clipping; a reveal that cuts letters looks like a glitch); frame 0 shows the first spoken
line, in the voice's order, never a title over the captions (the core line as a title is for the cover); the payoff in
words by ~2 s; words in the picture few and big, each one read at phone size at a glance, never the same words twice on
screen at once, nothing passes in front of words while they are the beat; one subject at a time; the paper edge never
beside the words; ONE LOOK, ONE BRAND (one type system for the channel, varied by recipe, never a new font per film);
warm, premium, calm, never cheap. The look is moving to PAINTED pieces and an organic feel ("a brush, not a pen"; the
playbook's Visual style; `video/docs/v4/visual/STYLE_ADJUSTMENTS.md`). Video 4's colour key: a cold blue snowy night
with one warm accent (the heat), the lit window as the story light.

**Read:** the playbook `video/docs/OWNER_PLAYBOOK.md` (Visual style: the captions bullets, "The words on screen are
DESIGNED"; Hook and pacing; Storyboard (G3) and flow: words few and big; Process: the two modes); `video/docs/look/DIRECTION.md`
(rule 10, the caption band); `video/docs/look/LAYOUT.md` (the band y 290-600, the block y 317-556, the safe frame);
the posters' type (`video/docs/studies/2026-10-28_city_posters/style.md` §1.8, `img/style_type.jpg`); our captions
now (`video/src/lib/Captions.tsx` SkyCaptions, `video/src/lib/theme.ts` skyCaption; the look still
`video/docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png`); video 4's words with their times
(`video/public/v4/voice_words.json`, 42.24 s) and its shots (`video/docs/v4/visual/VISUAL_SCRIPT.md`, "At a glance",
and `STYLE_ADJUSTMENTS.md`), so every example uses video 4's real words at their real times.

**Every agent:** writes its file from its FIRST step and updates it as it goes (a usage limit can stop it at any
moment); returns at most 3 short lines; never runs a git command that changes the index or history (the orchestrator
commits); never touches `video/src`, `video/public`, `video/out`; starts no agents (if it ever does, they run at max
effort); cites a source (URL) for every research claim and marks its strength (a platform's own spec or a study; a
studio's or designer's own account; a practitioner's advice or a tool's template); never bbc.co.uk. WebFetch may be
missing: fetch with curl through the session proxy and read as text. Fonts: only ones free for commercial use (OFL or
Apache: Google Fonts, fetched from jsdelivr's `@fontsource` packages; `video/scripts/type/fetch_fonts.py`). No company
logos, no copying the references' art or lettering (fonts that resemble a feel are fine).
