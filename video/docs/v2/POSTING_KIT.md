# Video 2 posting kit: "One Small Window"

Created in REVIEW_1 fix pass A (MUST 1, 2026-10-28): the film has no title and no source line over its captions any
more (playbook "Hook and pacing": frame 0 shows the first spoken line, "She quit Google."), so the core line and the
source live here. The truth rules (`CORE_LINE.md` §1-2) hold for every word below: "she says" stays on the claim, "for
life" is never in quote marks, no legal claim, no count of the staff, never "silenced" or "gagged", never "exclusive".

Fix pass B (MUST 3, 2026-10-28; playbook: "No small source lines, quotes or fine print in the picture (sources go in the
caption and the pinned comment)"): every source and small line the picture used to carry is below. The words are the
record in `src/v2r/kit/boards/texts.ts` (quote marks only on exact words). What left the picture:
- S2's newsstand board: "One current staffer stayed unnamed," and its source (the board now shows only the BBC's
  quote "for fear of retaliation").
- S4's name tag: "research engineer," "(Google's AI lab)", "3 years · resigned Oct 2026" and its source (the tag now
  shows "Sofia Liguori" and "Google DeepMind").
- S4's two plates: "work" and their sources (each plate now shows one row: "DEC 2025 · unclassified", "APR 2026 ·
  classified").
- S5's news box: its two source rows; S5's plaque: "US Department of Defense".
- S6's deal board: the five-line clause (the deal's own stated limits) and its source.
- S6's service door plate: "CLASSIFIED / AUTHORIZED PERSONNEL ONLY" (20 / 11 px).
- S7's board: the small row Google's AI Principles: "human oversight" and the statement's source.
- S8: the caption-band source line (33.16-36.54) and her board's credit.

The kit (G8, 2026-10-28): every claim below is one the film makes (its voice, or a board line it drew before fix B
moved it here) and `research/factlock.md` backs (FL rows in brackets in the check list at the end). Every URL is one
the v2 docs already cite (FL 1.1, 2.1-2.4, 2.12); the six headlines and dates were read off the live pages on
2026-10-28 (bbc.co.uk is blocked from the container: its headline and date are the owner's paste,
`source_bbc_2026-10-21.md`). Links in captions and comments aren't clickable on Instagram, TikTok or Shorts, so every
source is text plus a URL people can copy (owner, 2026-10-26, `OWNER_NOTES.md` "Posting").

## Files

| File | What |
|---|---|
| `deliverables/v2/v2r_G7_master_v1.mp4` | The master: 1080x1920 (9:16), 60 fps, 39.10 s, H.264 High, yuv420p, BT.709 tv range, AAC LC 48 kHz stereo, -14.0 LUFS / -1.2 dBTP (`MASTER.md`), 25.5 MB. Upload this file as it is, everywhere. |
| `deliverables/v2/v2r_cover.png` | The cover, 1080x1920 PNG (0.7 MB). |
| `deliverables/v2/v2r_cover.jpg` | The same cover as a JPEG for the phone's camera roll (q95, 4:4:4, 0.44 MB, under 1 MB). |
| `deliverables/v2/v2r_cover_grid_preview.jpg` | A check, not an upload: the cover's 4:5 centre crop (1080x1350, y 285-1635) at 0.5 (540x675), as the profile grid shows it. |

Cover render (from `video/`): `npx remotion still src/entry-v2r-cover.tsx Cover2R deliverables/v2/v2r_cover.png
--frame=312 --gl=angle` (entry `src/entry-v2r-cover.tsx`, composition `Cover2R`).

## Cover

The core line is the cover's text, ALL CAPS, "SHE SAYS" at full size:

**SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE.**

- The frame: the film's own S1 at 5.20 s (frame 312), the "for life." beat: she walks out of the Google building's lit
  door with the row of her copies behind her, greying from dark to white down the line, and Pip covering its ears on
  the post. It is Film2R's frame drawn by the same scene code, with no captions, no draft label, no audio and no paper
  edge (`edges={false}`).
- The type: the film's caption type (CaptionHand 92 px, the caption ink on the mint sky, the peach highlight box under
  "FOR LIFE."), three lines centred on x 540: "SHE SAYS:" / "NO CRITICIZING GOOGLE." / "FOR LIFE.". Measured: ink
  y 312-559 (the widest line 830 px, x 124-954), the box y 478-576; all of it in the clean sky above S1's roofline
  (the first non-sky row is y 590) and inside the 4:5 centre (y 285-1635), so the grid keeps it (and the newer 3:4
  grid crop, y 240-1680, keeps more). No source line in the picture (playbook; the sources are below).
- Checked by eye at 1080 x 1920 and at 360 px wide (the 4:5 crop): the three lines read at a glance at 360; her, the
  row and the Google sign stay in the grid tile.

## Caption (Instagram Reels)

Paste as it is (1,241 characters with the hashtags, counted 2026-10-28; Instagram's limit is 2,200; the hook line is
105 characters, so it shows before "more"):

```text
She quit Google. And she says her contract bans her from criticizing it… for life. So why is she talking?

Google's staff told the BBC they're scared to speak out because of their contracts. One current staffer stayed unnamed "for fear of retaliation".

Sofia Liguori was a research engineer at Google DeepMind (Google's AI lab) for 3 years. She told the BBC she objected to where Google's military work was heading, and resigned in October 2026.

In April 2026 Google signed a deal letting the Pentagon use its AI for classified work, for "any lawful government purpose". Google can't veto how it's used. The deal also says Google's AI models "should not be used for domestic mass surveillance or autonomous weapons (including target selection) without appropriate human oversight and control".

Google says it follows its AI principles and bans retaliation "of any kind". She says: "talking about facts is not criticising".

Source: BBC News, "Google staff resign in backlash over its AI contracts with military", 21 Oct 2026
https://www.bbc.co.uk/news/articles/cmreyvepnv0po
(Links here aren't clickable: copy it into your browser. All sources are in the pinned comment.)

#google #deepmind #ai #aiethics #bigtech #technews #techexplained
```

## Pinned comment (Instagram)

Post it as the first comment and pin it (1,591 characters; the comment limit is 2,200):

```text
Sources (copy a link into your browser):

1) BBC News, "Google staff resign in backlash over its AI contracts with military", 21 Oct 2026 (her account and words, the staff, the deal's terms, Google's statement)
https://www.bbc.co.uk/news/articles/cmreyvepnv0po

2) Fox Business, "Pentagon launches military AI platform powered by Google Gemini for defense operations", 9 Dec 2025 (Gemini on the Pentagon's GenAI.mil, unclassified work)
https://www.foxbusiness.com/technology/pentagon-launches-military-ai-platform-powered-google-gemini-defense-operations

3) Decrypt, "War Department Launches New Platform With Google's Gemini in Military AI Push", 9 Dec 2025
https://decrypt.co/351691/war-department-launches-googles-gemini-military-ai-push

4) The Japan Times, "Google inks deal allowing Pentagon to use AI models for classified work", 28 Apr 2026 (the April deal, first reported by The Information; no veto)
https://www.japantimes.co.jp/business/2026/04/28/tech/google-classified-ai-deal-pentagon/

5) 9to5Google, "Google's updated Pentagon deal uses Gemini for 'any lawful government purpose' with classified data", 28 Apr 2026
https://9to5google.com/2026/04/28/googles-updated-pentagon-deal-uses-gemini-for-any-lawful-government-purpose-with-classified-data/

6) Android Authority, "Google is back in the defense business with a secret new Pentagon deal", 29 Apr 2026 (no veto)
https://www.androidauthority.com/google-pentagon-deal-for-gemini-3661815/

The lifetime ban is her own account of her contract: no outlet has published the contract, and Google's statement doesn't address it.
```

Reply ready for "is that legal?" (`CORE_LINE.md` §2; never a legal claim): "We can't say. We haven't seen her contract, and
Google's statement doesn't mention it. This is her account to the BBC."

## Hashtags

- Instagram (in the caption above, 7): `#google #deepmind #ai #aiethics #bigtech #technews #techexplained`
- TikTok (7): `#google #deepmind #ai #aiethics #bigtech #technews #learnontiktok`
- No war or weapons tags (the cover and hook rule, `CORE_LINE.md` §2: work story first) and no legal ones (N10).

## TikTok

TikTok comments hold 150 characters, so the full source list goes in the caption (TikTok's limit: 4,000).

Caption: the Instagram caption above with two changes: the line in brackets becomes "(Links here aren't clickable:
copy them into your browser.)", the six sources of the pinned comment (from "1) BBC News" through the Android Authority
URL, and its last line) go after it, and the hashtags are TikTok's (2,755 characters in all).

Pinned comment (109 characters):

```text
Source: BBC News, 21 Oct 2026: https://www.bbc.co.uk/news/articles/cmreyvepnv0po (all sources in the caption)
```

## YouTube Shorts

Title (63 characters; the limit is 100): `She says her contract bans criticizing Google, for life #Shorts`

Description: the TikTok caption (all six sources; Shorts descriptions don't make links clickable either), with the
Instagram hashtags.

## Alt text (the cover)

Instagram: Advanced settings → Accessibility → Write alt text, where the app offers it (also YouTube's thumbnail, if
asked):

```text
Illustration: a canal-side street at golden hour. A woman in a green coat walks out of the lit glass door of a building with a "Google" sign, followed by a long row of copies of her in identical beige trench coats, their hair going from dark to grey to white down the line. A small lilac elephant on a post by the water covers its ears. Big text over the mint sky: SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE.
```

## Video description (accessibility; the picture alone, no on-screen text)

For a described-video field, the YouTube description's end, or a reply to anyone who asks (the narration says every
word the screen shows, and the burned-in captions follow it word for word):

```text
A 39-second animated film, narrated, in a pastel canal town. A woman in a green coat walks out of the lit door of a building marked Google; a long row of copies of her in identical trench coats follows, their hair greying down the line, while a small lilac elephant on a post covers its ears. Across the water, Google's offices are a wall of lit windows; the blinds drop in five of them, and on a bench a staffer talking to a reporter pulls up a hood. Her own window glows at sunset. She walks home along the towpath past a signpost with two dated plates. The camera pulls back and rises from blossoming trees to the Pentagon on the far shore. A board at its perimeter path shows the deal, a board outside Google's building gives Google's side, and a board on a café boat by her house gives her answer. The film loops back to the first street.
```

## Upload settings (each platform at its highest quality)

Upload natively on each platform from the clean master (the house checklist: `docs/POSTING_KIT.md` "Upload
checklist"); get the file to the phone as the original (AirDrop, Files or Drive, never WhatsApp or Messenger, which
recompress it). AI label ON everywhere (the voice is AI generated; playbook "Platforms and posting"). Captions are
burned in: platform auto-captions OFF.

**Instagram Reels**
1. Settings and activity → Data usage and media quality → **Upload at highest quality** ON; data saver OFF; upload on
   strong Wi-Fi.
2. Upload `v2r_G7_master_v1.mp4` as it is (1080x1920, 9:16): no in-app filters, trims, music, text or stickers.
3. 60 fps: the master is 60 fps on purpose (production renders at 60 fps). Upload it unchanged; never re-export it at
   30 fps for Instagram. Judge playback only after processing (~10-15 min; it sharpens once processing finishes).
4. Cover: Edit cover → **Add from camera roll** → `v2r_cover.jpg`; in the profile-grid crop step keep it centred (the
   title sits inside the 4:5 centre; compare with `v2r_cover_grid_preview.jpg`).
5. The caption and hashtags above, the alt text (Advanced settings → Accessibility), the AI label ON; then post the
   pinned comment and pin it.

**TikTok**
1. On the Post screen → More options → **Allow high-quality uploads** ON (HD).
2. Upload the same master as it is (1080x1920, 60 fps); no TikTok filters, text, stickers or sounds on top.
3. Cover: upload `v2r_cover.jpg` if the cover editor offers it; otherwise pick the frame at 5.2 s (the row of her
   copies) without adding text.
4. More options → AI-generated content ON. The TikTok caption, then the short pinned comment.

**YouTube Shorts**
1. Upload the master as it is (1080x1920, 60 fps, 39 s: a Short). No YouTube editor changes.
2. The title and description above; the thumbnail: the cover where the app offers a custom image, else the frame at
   5.2 s.
3. Altered or synthetic content: Yes (the AI voice), per the AI-label rule.
4. (The house checklist's 1440x2560 render, which gets YouTube's better encodes, was not made for v2: optional, the
   owner's call.)

## Owner TODO

- Optional: The Information's own (paywalled) report of the April deal is not in the repo. The film credits it only
  "via" The Japan Times and 9to5Google (both listed, both say so), so nothing is missing; to list it as well, add its
  headline, date and URL (TODO for the owner).

## Claim check (every line of the caption)

| Caption line | In the film | Backed by |
|---|---|---|
| She quit Google; she says her contract bans her from criticizing it, for life; so why is she talking? | voice 0-14.6 s | BBC (FL 1.4, 5.2, 5.3) |
| Staff told the BBC they're scared to speak out because of their contracts | voice | BBC (FL 5.1) |
| One current staffer stayed unnamed "for fear of retaliation" | S2 board (the quote; the line before fix B) | BBC (FL 1.13) |
| Research engineer at Google DeepMind, 3 years, resigned Oct 2026 | S4 tag (before fix B) | BBC (FL 1.4) |
| She told the BBC she objected to where Google's military work was heading | voice | BBC (FL 1.7) |
| April 2026 deal for classified work, "any lawful government purpose" | voice, S4 plate, S5 news box, S6 board | Japan Times, 9to5Google, BBC (FL 2.1, 2.2) |
| Google can't veto how it's used | voice | Japan Times, Android Authority (FL 2.4) |
| The oversight clause, in full | S6 board (before fix B) | BBC, 9to5Google (FL 2.3) |
| Google says it follows its AI principles and bans retaliation "of any kind" | voice, S7 board | BBC: Google's statement (FL 6.1-6.2) |
| "talking about facts is not criticising" | voice, S8 board | BBC (FL 5.4) |
| Gemini on GenAI.mil, Dec 2025, unclassified (pinned comment only) | S4 plate | Fox Business, Decrypt (FL 2.12) |
