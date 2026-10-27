export const meta = {
  name: 'v2r-depth-particles-toolkit',
  description: 'Owner feedback on the v2 G4 look clip (no depth, no separation, no perspective; add subtle particles; research GitHub libraries): research libraries + measure depth vs references, build lib/depth + lib/particles + check_depth, compact it into CRAFT/PIPELINE so quality compounds, adversarial check',
  phases: [
    { title: 'Research', detail: 'library scout + depth analyst' },
    { title: 'Build', detail: 'toolkit, check, docs, pipeline' },
    { title: 'Verify', detail: 'adversarial critic + fixes' },
  ],
}

const SCR = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/depth'
const CTX = `
PROJECT: short-form vertical explainer videos (Remotion 4, 1080x1920, 60 fps), repo /home/user/Test- (PUBLIC repo: never commit emails, keys or
third-party frames), branch video-production, project in video/. Video 2 ("One Small Window", code in video/src/v2r, docs video/docs/v2) is being
conformed to the owner-approved direction: video/docs/look/DIRECTION.md (one page, it wins) + video/docs/look/CRAFT.md (numbers, code, checks),
pipeline video/docs/PIPELINE_V2.md, the owner's rules video/docs/OWNER_PLAYBOOK.md (they win over everything). Doc order: owner's words
(playbook, vN/OWNER_NOTES) > DIRECTION > CRAFT > PIPELINE_V2 > G3_ANIMATIC/G5_BLOCKING > look/*.md > a film's STYLE.md > v1-era docs. A clash is a
bug: fix the lower doc in the same pass.
THE OWNER'S NEW FEEDBACK (tonight, on video 2's G4 look clip video/deliverables/v2/v2r_G4_look.mp4 = the S1 opening: Google's canal-side wing in
front, a far London city on the left behind it, a canal, stone steps in the foreground): "the foreground and the main focus still blurs with the
background supporting entities. Like take a look at the Google office vs the building on the background - they are all blurred together and it's
not clear to separate one from the other, there is no distance effect nor perspective here. Similarly the bottom part of the view - there is little
to no perspective or depth here at all. The shadows added are better. I'm thinking you should research some libraries on GitHub that would help you
achieve better, more natural effects and add perhaps a bit of particles here and there just to make things a bit more natural looking." Then: "let's
address those first, distill those and generalize and compact into the production pipeline so that the quality compounds over time, and show me this
scene once again given the feedback." Already captured: playbook rule "DEPTH AND SEPARATION" and a clause in DIRECTION rule 2 (read both).
CONSTRAINTS: deterministic rendering (Remotion renders frames in parallel: everything must be a pure function of the frame; no Math.random, no
requestAnimationFrame state, no wall clock); the approved look stays: flat colour, the clean pen with attention tiers (lib/pen.ts, lib/tier.tsx),
the light module (lib/light.tsx, LIGHT.md); DIRECTION currently forbids blur, glow discs and gradients: if a library's natural effect needs one of
those, say so plainly as an owner decision, never sneak it in. Existing engine to build on: video/src/lib (persp.ts perspective, World, ShotCam, Ink,
Fill, pen, tier, light, sketch, rng, idle, pullback), the dc kit's atmosphere helpers (video/src/v2r/kit/dc: grep for atm / mix), scripts/qa
(check_light.py, density.py, gate_check.py, scripts/qa/retro_tools). References to measure against: assets/ref/reference.mp4 (+ stills),
deliverables/v1/php2shell_final.mp4, deliverables/v3/v3_g5b_pilot.mp4 (only how FULL), the owner's cozy references described in
video/docs/look/COZY_AND_SCALE.md, video/docs/look/CINEMATIC_GUIDE.md "Scale cues". Scratch dir: ${SCR} (mkdir -p). Renders: stills only, 0.4
scale, --gl=angle --concurrency=2. MAX effort; finish what the job needs, nothing more. Another session (video 3) pushes to the same branch: never
touch src/v3, docs/v3, deliverables/v3; keep v1/v3 renders byte-identical (everything new is opt-in). A helper session (L1) is editing video 2's S1
scene files (src/v2r/scenes/V2S1*) and may touch S1 spots in src/v2r/world/map.ts right now: do not edit those.
GIT: commit only your files; messages end with the two trailer lines below; push with: for i in 1 2 3 4; do git fetch -q origin video-production &&
git merge -q --no-edit origin/video-production && git push -q origin HEAD:video-production && break; sleep $((2**i)); done.
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ
`

const SCOUT = CTX + `
YOUR JOB (library scout): research GitHub / npm / the web for libraries and proven techniques that give our flat, clean, hand-drawn 2D vector style
MORE NATURAL DEPTH and LIFE inside Remotion: (a) particles (dust motes in light, pollen, drifting leaves, water glints, birds far off) that are
deterministic per frame; (b) noise for natural motion (e.g. @remotion/noise, simplex-noise, open-simplex-noise); (c) perceptual colour for
atmospheric perspective and separation (e.g. culori, chroma-js, colorjs.io; compare with our own Lab code in lib/pen.ts); (d) perspective / 2.5D
depth helpers that fit SVG (compare with lib/persp.ts; consider @remotion/three only if it clearly earns its weight); (e) anything else the
illustration/motion-design community uses for "natural" flat 2D (e.g. Remotion's own packages: @remotion/paths, @remotion/shapes, @remotion/noise,
@remotion/motion-blur; SVG feTurbulence for a subtle texture; Lottie only if relevant). For each candidate: repo URL, licence, maintenance, size,
whether it is deterministic under Remotion (and how to make it so), what concrete effect it gives US, how it fits DIRECTION (flat, clean, no blur/
glow/gradient unless the owner opts in), and the risk. Check that npm install works here (npm view <pkg> version; do not install yet). Also collect
the craft knowledge: how flat-colour illustrators and 2D animators build depth (atmospheric perspective steps, value grouping by plane, edge contrast
at the subject, overlap, size and texture gradients, ground-plane perspective in a vertical frame) and how they use particles sparingly; cite
sources. Write ${SCR}/../../../../../..${'/home/user/Test-/video/docs/look/research/2026-10-27_effects_libraries.md'.replace('/home/user/Test-','')} -> i.e. write the file
/home/user/Test-/video/docs/look/research/2026-10-27_effects_libraries.md (mkdir -p): a ranked shortlist (adopt / consider / reject, with why), the
recommended stack in one paragraph, the craft notes with sources. Commit + push it. Return <= 20 lines: the recommended stack and the top craft rules.`

const ANALYST = CTX + `
YOUR JOB (depth analyst): measure WHY the look clip reads flat, against the references, and turn it into numbers. Extract frames (ffmpeg -ss <t> -i
<file> -frames:v 1) from the look clip (0.5, 1.2, 3.0, 5.4 s), reference 1 (several), v1 (several) and, if useful, CINEMATIC_GUIDE's scale frames;
work at 540 px wide in CIE Lab (OpenCV / numpy; scripts/qa/retro_tools may help). Measure: (1) PLANES: segment each frame into depth planes (by
hand-picked boxes is fine: near ground, subject plane, mid, far, farthest, sky) and report mean L*, C*, hue and local contrast per plane: does
lightness rise and chroma fall with distance (atmospheric perspective)? by how much per plane in the references? (2) SEPARATION: along the subject's
silhouette (her, the Google wing; in the refs their main subject), the L* / C* difference between the inside and a 10-20 px band outside, and how
often the subject's edge sits on a same-value neighbour; (3) GROUND PERSPECTIVE: in the lower third, line directions (Hough on edges): converging
toward a vanishing point vs parallel horizontals; texture spacing vs height; object size vs height; (4) what the cozy and scale guides already say
(COZY_AND_SCALE.md, CINEMATIC_GUIDE.md scale cues: 5-7 planes, value steps, far planes fill-only...). Deliver
/home/user/Test-/video/docs/look/research/2026-10-27_depth_analysis.md: the measured tables (look clip vs refs), the diagnosis in plain words, and a
proposed DEPTH SPEC: targets and warnings with numbers (per-plane dL*/dC*/hue shift toward the atmosphere, min silhouette separation, ground
perspective requirements, texture/size gradients, how many planes, how depth interacts with the attention tiers: tier = story role, plane = distance;
both apply), plus how to MEASURE each in a script, plus S1-specific notes (what exactly to change in the opening). Commit + push it. Return <= 25
lines: the diagnosis and the spec in short.`

const BUILDER = CTX + `
YOUR JOB (toolkit builder): turn the research into reusable code, a check, and pipeline rules, so every future shot and video gets depth and
natural life by default ("the quality compounds"). Read first: the two research files just written (video/docs/look/research/2026-10-27_effects_
libraries.md and 2026-10-27_depth_analysis.md; their summaries are below), DIRECTION, CRAFT, PIPELINE_V2, G3_ANIMATIC.md, G5_BLOCKING.md,
LIFE_AND_DENSITY.md, lib/persp.ts, lib/light.tsx + LIGHT.md, lib/pen.ts, lib/tier.tsx.
BUILD (opt-in, film-agnostic, deterministic, typed, documented):
1. video/src/lib/depth.ts: depth planes for flat colour: a per-set Atmosphere (haze colour from the rig/sky, per-plane mix amounts) and helpers that
   recede a colour by plane (perceptual Lab mix toward the haze: lighter, cooler, lower chroma), simplify by plane (which planes draw no lines, which
   lose small detail), a separation helper (the calm contrasting backing value behind a subject's silhouette), texture/size gradients by depth, and
   ground-plane perspective helpers on top of lib/persp (a vanishing point, receding treads/joints/quay edges in a vertical frame). Add the chosen
   libraries to video/package.json only if the scout's stack says so (npm install them; keep the lockfile consistent).
2. video/src/lib/particles.tsx: deterministic particle layers as flat shapes (no blur, no glow): motes in a light shaft or sun-side air, pollen /
   dust, drifting leaves, water glints, far birds; each a pure function of frame + seed (noise from the chosen lib), tier-aware (C environment by
   default, B only if asked), with a mover budget that respects DIRECTION rule 3 / CRAFT §b (small, slow, low contrast, taking turns, none entering
   in the 0.4 s around a join), lit by the set's rig (lighter on the sun side); presets per kind; a hard cap on count and coverage.
3. scripts/qa/check_depth.py: the analyst's measurements as a check (planes' atmospheric gradient, subject silhouette separation, ground perspective
   / parallel-band detector, texture gradient), PASS / WARN / FAIL with the numbers, usage like check_light.py; it must FAIL or WARN on the current
   look clip's flat frames and PASS reference 1 / v1 where they show depth (report the numbers).
4. A demo: one composition (e.g. src/entry-v2r-depth.tsx) showing the same simple canal set flat vs with depth (planes, separation, a receding
   ground) and the particle presets; render before/after stills to ${SCR}/ and view them.
5. DOCS, compact and integrated (owner rule: integrate, never just append; fix lower docs that clash): video/src/lib/DEPTH.md (API + the numbers it
   implements); CRAFT.md gets a section "f. Depth and separation" (numbers, code, checks; and rewrite §b/§c/§d lines that the depth rules change, e.g.
   C environment by plane); PIPELINE_V2.md: where depth is decided and checked at each gate (W1 world bible: planes, atmosphere and vanishing point per
   set; G3: planes and VP sketched; G4: the look clip passes check_depth and shows the particles; G5: lanes build with lib/depth + lib/particles;
   G6: particle polish; the QA list), plus the G3_ANIMATIC / G5_BLOCKING contract rows that need a depth line; LIFE_AND_DENSITY: particles are C-tier
   life inside the mover budget; DIRECTION rule 2's link to §f already exists (keep DIRECTION short). Keep every doc coherent and short.
6. VIDEO 2: add a short "Depth" section to video/docs/v2/THROUGHLINE.md (per set: planes, atmosphere, vanishing point, the separation field behind
   each subject) and a 5-10 line "Depth + particles" section to each video/docs/v2/lanes/conform_L2.md ... conform_L6.md (what changes in that shot),
   and a note in conform_L1.md for the particles slot (L1 is doing S1's depth pass by hand right now and will pull your libs).
Typecheck (cd video && npx tsc --noEmit -p .); confirm v3 is byte-identical (render one Film3 still before/after: npx remotion still
src/entry-v3-film.tsx or the v3 entry the repo uses; find it); commit + push in small steps. Return <= 25 lines: the APIs, the check's numbers on the
look clip vs refs, the doc changes, anything needing an owner decision.`

const CRITIC = CTX + `
YOUR JOB (adversarial critic + fixer): the builder just added lib/depth.ts, lib/particles.tsx, scripts/qa/check_depth.py, a demo, DEPTH.md, CRAFT §f,
PIPELINE_V2 / G3 / G5 / LIFE_AND_DENSITY edits and v2 brief sections (summary below). Try to BREAK it: determinism (render the same frame twice in
separate processes; particles at frame N identical regardless of render order), performance (render time of a particle-heavy frame), v1/v3
byte-identical, the check really discriminates (FAIL the flat look clip frames, PASS the references' depth; try to fool it with a frame that is
flat but passes), the particles respect DIRECTION (no blur/glow/gradient, small, slow, low contrast, budgets, join quiet window), the docs are
coherent (no rule contradicts DIRECTION / CRAFT / the playbook; nothing duplicated; numbers consistent between DEPTH.md, CRAFT §f and the check), the
v2 brief sections are buildable. FIX what you find (code and docs), commit + push. Return <= 20 lines: verdict, numbers, fixes, owner decisions.`

phase('Research')
const [scout, analyst] = await parallel([
  () => agent(SCOUT, { label: 'scout: libraries + craft (web/GitHub)', phase: 'Research', effort: 'max' }),
  () => agent(ANALYST, { label: 'analyst: measure depth vs references', phase: 'Research', effort: 'max' }),
])
phase('Build')
const built = await agent(BUILDER + '\n\nSCOUT SUMMARY:\n' + (scout || '(missing: read the file)') + '\n\nANALYST SUMMARY:\n' + (analyst || '(missing: read the file)'),
  { label: 'builder: lib/depth + lib/particles + check_depth + docs', phase: 'Build', effort: 'max' })
phase('Verify')
const crit = await agent(CRITIC + '\n\nBUILDER SUMMARY:\n' + (built || '(missing)'), { label: 'critic: break it, fix it', phase: 'Verify', effort: 'max' })
return { scout, analyst, built, crit }