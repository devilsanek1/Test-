# L3 handover (V2S3 + V2S4): first session, stopped at the orchestrator's request

**Done:** the direction is read (TREATMENT, map.ts S3/S4/PIP/MATCHES, BUILD.md, canal/cast/pip READMEs) and the plan below is set. No scene code is written yet:
`src/v2r/scenes/V2S3.tsx` and `V2S4.tsx` are still the engine placeholders. K3 boards (`src/v2r/kit/boards`) had not landed at handover.

**Findings for the next session:**
- Setup: `npm ci` works. Python needs `pip install opencv-python-headless fonttools brotli`. The remotion.config browser path exists. `CanalSample-S4` renders at ~0.5 s/frame (0.5 scale, angle).
- Kit: `S4Set` in `kit/canal/sets.tsx` is a usable base (far 0.3x / backs / path planes, narrowboat foreground, Pip slot). Plan: copy its structure into `V2S4_set.tsx`, because her figure must be
  screen-fixed (outside the path plane) and the fingerpost must sit ON the path plane. S3 has no set: build it from `TerraceRow`
  (samples.tsx cell 4: levels ground 1100 / first 878 / cornice 664 / mansardTop 602, `her={{index:1, french: MAP.W2_CUT, inside: <HerWindow .../>}}`)
  + `Water` + `Narrowboat` (roof y 1260-1330) + `Towpath` + NearBack heads (cap them at ~140 px wide, the owner's rule).
- Sky: samples use plain bands (`World sky={[CM.sky, CM.bandGold]}` S4, `[CM.sky, CM.bandSunset]` S3, horizon 1000), with no tod relight.
- Camera: use map.ts `zoomAt(S4.camera.push, filmT)` / `S3.camera.easeBack` via `mat.about(mat.scale(z), ax, ay)` on an `XG`.
- S4 truck plan: her stride 56 px at ~1.8 steps/s (~100 px/s, `strideFor(56,170)`). Constant speed for local 0-2.50, then speed falls linearly to 0 at 3.10.
  That is D = 280 px = 5 whole steps, so the path plane dx runs -280 -> 0 (the set is drawn at the 17.96 pose with the post at x 575). Far plane 0.3x, backs ~0.6x.
  From 3.10 her pose is `stopLook`.
- Word times (`public/v2r/voice_words_heard.json`): So 13.16 · she 13.96 · talking 14.28 · She 15.07 · AI 16.12 · BBC 17.08 · objected 17.96 ·
  military 18.92 · was 19.64 · heading 19.80 · In 20.67. Local t = film - 12.98 (S3) / - 14.86 (S4).
- Lettering widths (CaptionHand, measured with PIL): "DEC 2025" at 56 px is 196 px · "unclassified work" at 34 px is 203 px · F8 credit at 18 px is 383 px · F9 credit at 18 px is 370 px ·
  "Sofia Liguori" at 44 px is 191 px · "research engineer, Google DeepMind" at 26 px is 337 px · "3 years · resigned Oct 2026" at 26 px is 258 px.
  So each 450x100 plate fits its key line (56) plus its body line (34), but NOT its 18 px credit. Proposal: a small paper notice on the post below the plates
  (x ~150-560, y ~975-1055) carrying both credits, pen-revealed with each plate (or whatever K3's Fingerpost does). The tag (280x200) cannot hold
  every line at body 30 px: use 26 px body and/or a REQUEST to grow it to ~300x230.
- References at 216 px: extract with ffmpeg (two separate commands: reference.mp4 and deliverables/v1/php2shell_final.mp4).

**Next:** build V2S4 (set, her, tag, fingerpost, Pip ride/turn/leap per map PIP + MATCHES), then V2S3 (the W2 match, the ease-back, the HerWindow,
Pip's land / turn / leap out of the left edge at y 620-700). Then make the review files, run the critic loop (ultracode: a Workflow with art-director /
sound-off / standards / motion critics), and write report_L3.md.

## 2026-10-27, second session (ultracode), stopped at the orchestrator's request for the max-effort session
**Done:** setup checked in a fresh container (`npm ci`; `pip install opencv-python-headless fonttools brotli numpy pillow`; the remotion.config
browser path exists; `CanalSample-S4` renders at ~0.5 s/frame at 0.5 scale). Re-read the direction; still NO scene code: `V2S3.tsx` / `V2S4.tsx`
are the engine placeholders. K3 still has no Fingerpost / tag component (`src/v2r/kit/boards` = `WorldText.tsx` + `texts.ts` only: words from
`TXT_NAME_TAG` / `TXT_PLATES`), so L3 builds the post and tag itself (`V2S4_post.tsx`, `V2S4_tag.tsx`) unless L5 lands one.
**Workflow:** a build workflow (two parallel builders, one per shot, self-reviewing renders) was launched and STOPPED before it wrote any file;
its builder briefs are a good starting prompt: `~/.claude/projects/-home-user-Test-/<session>/workflows/scripts/v2r-l3-build-wf_837d1d64-aeb.js`
(not in the repo; the gist is below).
**Decisions in those briefs (keep or revise):** S4 path plane dx -280 -> 0 (constant to local 2.50, ease to 0 at 3.10 = 17.96), backs 0.6x,
far 0.3x; post on the path plane landing x 575; credits F8 / F9 on a small paper notice on the post under the plates (x ~150-560, y ~975-1055),
pen-revealed with each plate; the tag may grow down to y ~840 (x <= 880) so build 2 (more + credit) fits with body 30 px (26 minimum + a
REQUEST); Pip S4 lands (470, 1218) 14.95, rides, faces left 19.55, leaps to the sun 20.25; S3 uses `pipHopS2S3At` across the cut, leaps out of the
left edge (x 0-120, y 620-700 at 14.86); check `lib/Film.tsx` for how `matchcut` renders S3 at negative local t; S3 near head-backs <= ~140 px wide.
**Next:** build V2S4, then V2S3, the review files (COMMON.md), the critic loop, report_L3.md.
