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

## 2026-10-27 ~15:10 UTC, third session (MAX + ultracode, session_014PwCXJs9nWENkpKqVhHWMP): CONTROLLED PAUSE (5-hour limit at 89 %)
**State (all pushed; typecheck clean; Film2R renders):** both shots are BUILT at near-finished quality by four parallel builders (two workflows),
stopped at the pause; their work is committed (last commits: S4 world e1ff69b 14:43 + WIP checkpoints to d961a34; S4 story 0f77403; S3 far
6b2e36e; S3 near+story dbb4b0c). Spec: `plan_L3.md` (builders/files table, rules §0, §1 V2S4, §2 V2S3). Style check answered:
`stylecheck_L3.md` (its last paragraph lists what STYLE.md changes in the build). Files: V2S4 = `V2S4.tsx` (integration + push camera) + rig
`V2S4_rig.ts` + world `V2S4_far/path/boat` (thin wrappers) over `V2S4_w{far,backs,path,canal,boat,cast,core}` + story `V2S4_post` (post +
`S4Plates` drawn ABOVE Pip/boat) `_tag` `_her` `_pip`; V2S3 = `V2S3.tsx` (integration + ease-back/float camera) + rig `V2S3_rig.ts` + far
`V2S3_terrace` over `V2S3_t{Houses,Her,Canal,Life,Parts,West}` + near `V2S3_near` over `V2S3_n{boat,dress,folk,ground}` + `V2S3_pip`.
**What each stopped builder was doing:** S4 WORLD: densifying the set after its big pass (backs, yard, towpath life, canal, our boat + near water;
the boat's cabin side was still being enriched). S4 STORY: polishing Pip's gaze path and the plates' build; post, plates, tag (2 builds), her
walk/stop/look and Pip in place. S3 FAR: polishing the terrace (light, ivy, lantern, steam). S3 NEAR+STORY: dressing the bottom third (boat, folk,
puddle, pigeons; S2's near lamp held across the match). None was mid-way through a structural change.
**Workflows (do NOT resume the builders; go to review):** build S4 run `wf_81fa0e37-69f` (script `context/workflows/v2r-l3-build-s4-wf_81fa0e37-69f.js`),
build S3 run `wf_8624d14c-4d1` (`context/workflows/v2r-l3-build-s3-wf_8624d14c-4d1.js`); both stopped. Review script `context/workflows/v2r-l3-review.sh`
(writes the review files to the scratchpad `review/<round>/`; edit its `S=` path in a new container), critic round `context/workflows/v2r-l3-critic-round.js`
(ONE combined critic, then the V2S4 fixer, then the V2S3 fixer, one agent at a time; args `{round, review, fix: true, mandated: {V2S4: [...], V2S3: [...]}}`).
**BUDGET (orchestrator, 15:00):** at most ONE agent at a time; ONE critic round in total, then one fixer per shot (sequential); no polling loops;
renders of my shots only at 0.5 scale; report by the new deadline the orchestrator gives at resume.
**Next steps, in order (after the resume message):**
1. Rig edits (mine, no agent): `V2S4_rig.ts` S4_TRUCK v 110.7 -> 119 px/s (0.70 body heights/s, STYLE.md §4; D = 333, the post rides in from x ~242;
   keep 5 steps) and check every S4 plane still covers the frame at the cut (plane x from -(k x 333 + 80)); `V2S3_rig.ts` float -> two eased legs
   within ±12 px of home (STYLE.md §6 float law: e.g. +7 px x by 14.05, then (+3, -6)), add `s3FloatDy` and apply dy in `V2S3.tsx`; check Pip's exit
   stays in x 0-120 / y 620-700 at 14.86.
2. `bash context/workflows/v2r-l3-review.sh r1` (fix its `S=` path if the scratchpad moved), look at the sheets yourself.
3. Launch the critic round (Workflow scriptPath `context/workflows/v2r-l3-critic-round.js`, args `{round: 'r1', review: '<scratch>/review/r1', fix: true,
   mandated: ...}`) with the MANDATED STYLE.md items: V2S4: flyers + smoke `ceil={600}`; no plum on lamps / railings / birds / the post (CM.line; birds ink
   V-strokes or CM.shadeWarm); shadows <= ~40 px; canal water no motion of its own (no drift, no glint flicker); a slow cloud bar in the top gutter
   (y 120-260); cozy-lane movers enter at edges at cruising speed; THE NAME TAG (orchestrator 15:00): card x 590-1000, y 600-~800, body 30 px, build 1 =
   "Sofia Liguori" (44) / "research engineer," / "Google DeepMind (Google's AI lab)", build 2 = "3 years · resigned Oct 2026" / one-line credit, leader to
   her head; update `map.ts` S4.nameTag to {x0 590, y0 600, x1 1000, y1 800} IN THE SAME COMMIT (the orchestrator allows it). V2S3: her window = L6's S8
   window (closed glazing with a teal central mullion, the same gold lamp shade, two shelves, plants on the sill; keep the blind rolling up, the Juliet
   rail, the planter box for Pip; L6 told to keep theirs); flyers + smoke `ceil={600}`; no plum on lamps / railings / birds (the HELD near lamp must match
   S2's lamp colour at fix time: L2 was asked to recolour theirs to CM.line; if they haven't, keep matching S2 and list a REQUEST); shadows <= ~40 px (the
   long towpath shadows); water no motion of its own; one string-light bulb twinkling at a time (<= 3 flashes / s); something in the top gutter (a static
   branch from the top-left, or a slow cloud bar); near head-backs <= ~140 px wide at the shoulders (NearBack hv <= ~150).
4. Verify the fixes (stills of my shots), commit + push, write `report_L3.md` (<= 15 lines: built, critic verdict, QA numbers, open items, REQUESTS:
   map.ts S4.nameTag already changed; any kit defect) and push it LAST.
