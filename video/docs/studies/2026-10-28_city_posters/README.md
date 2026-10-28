# The city-poster study (2026-10-28): the shared brief

**The owner** sent seven illustrated city posters (`video/docs/look/poster_refs/`, read its README for the owner's words
verbatim) and asked for two things:
1. "how we can learn from these pictures in terms of perspective, visual style, details and composition";
2. "which type of content would be best fit into videos where we have more of cities / architectures / buildings / etc"
   ("our very first video was the most successful so far and i personally like the last video about google i think the
   story wasn't quite good, but visually it was nice to be honest").
They also said: "i really like the style and i want us to experiment more with the style and the focus on our videos";
"i think visually in the video about Google we have made good improvemnets in terms of overall style". So v2 ("One
Small Window") is the BASELINE the owner likes: every look lesson starts from where v2 stands.

**The owner's four feelings: the frame the synthesis answers** (verbatim in `video/docs/look/poster_refs/README.md`;
"research each further how professional studios approach this and how my feelings translate to a concrete approach and
techniques"; "let me know if i am missing anything you observed too"):
1. **Depth and scale:** some buildings obviously closer, some further, "and there is something WAY further out that
   gives me a sense of scale".
2. **A hierarchy of finish:** the main objects stand out, "more details and cleaner lines and just all around
   crispier"; the rest give fullness, life and density, "less detailed, a bit more low poly but nonetheless coherently
   fit into the style ... you can't immidetaly spot that something is off".
3. **Nature:** "very subtle" and "visually very interesting ... obviously very real, but if you look closely we combine
   the real effects with the lower poly kind of effects".
4. **Colour:** "very vibrant and coherently fit together"; the owner likes v2's colours, "but our video still feels
   cheap and lazy as if these pictures give a very premium feel to it".
Every lens says which feeling its findings explain, and what it observed that the owner didn't name.

**This is a study, not a rule change.** Nothing here outranks `video/docs/look/DIRECTION.md` or the playbook; the owner
approves what becomes a rule. Paths below are relative to the repo root `/home/user/Test-`.

## The files (this folder)
| File | Who | What |
|---|---|---|
| `perspective.md` | look lens 1 | viewpoint, horizon, vanishing points, depth cues, the ground |
| `style.md` | look lens 2 | colour, light, texture, shape language (the geometric patchwork), line, sky, water, type |
| `details.md` | look lens 3 | where detail lives, how much, which small things make it rich, how it stays calm |
| `composition.md` | look lens 4 | frame structure, the one hero (the owner's "focus"), framing, the title zone, the 9:16 mapping |
| `content_market.md` | content lens A | what place-led content works on short-form and for visual-explainer studios (sourced) |
| `content_fit.md` | content lens B | our own evidence (v1-v3), content archetypes that fit cities and buildings, candidates now |
| `pro_1_depth.md`, `pro_2_hierarchy.md`, `pro_3_nature.md`, `pro_4_colour.md` | pro-practice researchers | how professional studios, illustrators and art directors get each of the owner's four feelings, and the concrete techniques for our films |
| `content_discussion.md` | the parallel thread (a helper session) | the owner's discussion of which content fits this style: ideas, the owner's reactions verbatim, picks |
| `STUDY.md`, `SUMMARY.md` | synthesis | the merged study, organised by the owner's four feelings plus what they didn't name; SUMMARY is one phone screen |
| `VERIFY.md` | adversarial check | what was checked, what was wrong, what was fixed |
| `img/` | everyone | measurement sheets and annotated references (`<lens>_*.jpg`) |
| `baseline/` | orchestrator | our films' frames at half size (540 x 960): `v1_tNN.NN.jpg` (php2shell, 30 fps, posted 10-25, the best performer), `v2_tNN.NN_<shot>.jpg` (One Small Window, the G7 master; `S1cover` = the cover frame), `v3_tNN.NN.jpg` (the laptop-price reel, posted, 64.5 % skipped); `baseline_v*_sheet.jpg` = one contact sheet per film |

## Inputs
- **The references:** `video/docs/look/poster_refs/0*.jpg` (1206 px wide, about 3:4). The Instagram UI is burned in:
  mask it with `video/docs/look/poster_refs/ui_mask.json` in every measurement.
- **Our films:** `baseline/` above. A full-size frame when you need detail:
  `ffmpeg -ss <t> -i video/deliverables/v2/v2r_G7_master_v1.mp4 -frames:v 1 <out>.png` (v1:
  `video/deliverables/v1/php2shell_final.mp4`; v3: `video/deliverables/v3/v3_final.mp4`); v2's cover:
  `video/deliverables/v2/v2r_cover.png`. v2's shots: S1 0-6.1 s, S2 6.1-12.98, S3 12.98-14.86, S4 14.86-20.55, S5
  20.55-23.8, S6 23.8-28.1, S7 28.1-32.93, S8 32.93-39.08 (its values: `video/docs/v2/STYLE.md`).
- **The direction:** `video/docs/look/DIRECTION.md` (the rules, one page), `video/docs/look/CRAFT.md` (§b tiers, §c line,
  §d light, §f depth, §g sky), `video/docs/look/PALETTE.md` + `palettes.json`, `COZY_AND_SCALE.md`,
  `CINEMATIC_GUIDE.md`, `LIFE_AND_DENSITY.md` (all in `video/docs/look/`), `video/docs/OWNER_PLAYBOOK.md`. They are
  large: read the sections your lens needs (grep, sed -n ranges).
- **Content:** `video/docs/CREATIVE_BRIEF.md`, `video/docs/TOPIC_CRITERIA.md`, `video/docs/IDEAS_BANK.md`, the
  playbook's "Taste signals" and "Performance log", `video/docs/v4/G0_TOPICS_r4.md` (the paused v4 shortlist), each
  film's `video/docs/vN/OWNER_NOTES.md`.
- **Tools:** Python 3.13 with numpy, Pillow, OpenCV (`cv2`), scikit-learn, scipy, scikit-image; ffmpeg; ImageMagick.

## Hard rules
- **Analysis only.** Write only your own files: your report, your `img/<lens>_*` sheets, and (if it is reusable) your
  measurement script as `video/scripts/look/posters/<lens>.py`. Scratch goes to `/tmp/posters-<lens>/`. Never edit
  other docs, code, the playbook or DIRECTION; never run git commands that change anything (the orchestrator commits).
  Other sessions work in this repo: never touch `video/src`, `video/public`, `video/out`.
- **Evidence first.** Every finding points at pixels (the poster, a region as an x,y box, a measured number) or, for
  content, a source (URL and date). Estimates are marked "est.". No claim you can't point to.
- **The owner's words win.** Where a lesson clashes with an owner rule (quote the playbook or DIRECTION line), say so
  plainly and leave the call to the owner. Never water a lesson down to fit, never overrule the owner.
- **Apply it.** Every lesson ends with "In our films": what would change (the rule or doc, the tool or lib in
  `video/src/lib`, the gate), the cost (S/M/L) and the risk. We make 9:16 films in motion (1080 x 1920, 60 fps,
  captions in the band at y ~290-600, platform UI at the top, bottom and right rail), not 3:4 posters: say how each
  lesson survives the format, the motion and a phone screen.
- **Images cost context.** View the posters and sheets at the size you need; a contact sheet beats many full images.
- **Checkpoint.** A usage limit can stop you at any moment: write your report's skeleton first and fill it in as you go.
- **Final reply** to the orchestrator: at most 3 lines (your file and its top 3 findings).
- Lean: don't start agents or workflows yourself.

## Report format (each lens, about 120-220 lines)
1. **What the posters do** (measured, per poster where it differs).
2. **Where our films stand** (v2 first; v1 and v3 where they teach something).
3. **Lessons, ranked by the difference they would make**: each with what, the evidence, "In our films", cost, risk, and
   any clash with the owner's earlier words.
4. **What not to take**, and why (it would cost the story, the motion, phone readability or an owner rule).
5. **Open questions for the owner** (at most 3).
The content lenses use their own outline (their briefs give it).
