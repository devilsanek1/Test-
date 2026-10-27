export const meta = {
  name: 'g3-animated-sketchbook',
  description: 'Research and spec the G3 animated-sketchbook stage: near-final story/motion signal, placeholder detail, minimal time',
  phases: [
    { title: 'Research', detail: '5 practice lanes + 1 repo audit' },
    { title: 'Synthesize', detail: 'write docs/G3_ANIMATIC.md + cross-doc edits' },
    { title: 'Critique', detail: 'time, signal, consistency critics' },
    { title: 'Revise', detail: 'apply critic findings' },
  ],
}

const REPO = '/home/user/Test-'
const V = REPO + '/video'
const RES = V + '/docs/look/research'

const CONTEXT = `CONTEXT (read first):
We produce 30-45s vertical (1080x1920) explainer videos (TikTok/Reels/Shorts) in Remotion (React), hand-drawn-ink flat-colour style, for the channel "What's All the Fuss About?". Pipeline doc: ${V}/docs/PIPELINE_V2.md. Gate G3 = sketch animatic: after script+voice lock, the whole film as monochrome studio-storyboard panels timed to the locked voice-over, rendered from a JSON file by a React component (src/v3/SketchReel.tsx, "board" mode), with pop captions; current drawing spec: ${V}/docs/look/STORYBOARD_STYLE.md. The owner (our director) reviews one MP4 per gate on a phone.
THE OWNER'S NEW DIRECTION (2026-10-26, verbatim): "we need to write a story and draw the simple, but very close version of the story ... This is where we need to see pretty much close to final version of the story, transitions, animations, camera movements, but a lot of details can be omitted - so we are not wasting time on exact details, but having them as placeholders is important. In my mind its more like an animated sketchbook where a lot of details are not perfectly sharp, but you can very clearly see the backbone of the future story ... the goal is to have the closest signal to the final story in as little time as possible".
Known failure we must fix: on video 3 the owner approved the G3 board, then at G5 blocking said "the scenes are way too empty ... the quality and smoothness is not there" — the G3 animatic did not carry aliveness/density or motion-feel signal, so G5 surprised the owner.
YOUR OUTPUT RULES: write your findings as ONE markdown file (path given below), max ~120 lines, dense, no filler. Tag each claim VERIFIED (primary page or several sources agree) or REPORTED (one secondary source), with a numbered source list of URLs at the end, like STORYBOARD_STYLE.md does. End the file with a section "## What this means for our G3" — 6-12 concrete, implementable implications (numbers, conventions, checks), each on one line. Do NOT commit to git; just write the file. To search the web, first call ToolSearch with query "select:WebSearch,WebFetch", then use WebSearch (mode "extended" for niche/hard-to-find practice details). Your final text reply: just the file path and your 6-12 implications, nothing else.`

const LANES = [
  {
    key: 'reels',
    file: RES + '/animatic_reels.md',
    prompt: `${CONTEXT}

LANE: STORY REELS in feature animation (Pixar, Disney, DreamWorks, Aardman, Sony/Spider-Verse, Studio Ghibli where known).
Research questions:
1. What exactly is LOCKED at the story-reel/animatic stage vs decided later (cuts, shot content, timing, staging, acting, camera)? What do directors judge a reel on?
2. How do editorial teams fake motion in reels cheaply: pans/scales on stills, 2D moves over boards, limited animation of key actions, sound scratch? How many drawings per shot is typical?
3. Iteration practice: how often reels are screened, how a failing sequence is found and re-boarded, what "the movie works in reels" means before layout/animation is allowed to start.
4. What reels deliberately OMIT (colour, detail, inbetweens, effects) and why omitting them does not break story judgment.
5. Any documented cost stories of skipping reel fidelity (sequences that failed late because the reel hid a problem).
Write to: ${RES}/animatic_reels.md`,
  },
  {
    key: 'layout',
    file: RES + '/animatic_layout.md',
    prompt: `${CONTEXT}

LANE: LAYOUT and PREVIS — the stage where the CAMERA is final but the art is rough.
Research questions:
1. Feature-animation 3D layout / rough layout: gray-box or low-res assets with final camera, final lensing, final edit timing. What does a layout artist deliver and what is judged?
2. Anime production: the e-konte (storyboard) -> layout (レイアウト) handoff. What a layout drawing contains (BG perspective, character placement at size, camera frame + movement notation, time allocation). How camera moves (pans, slides, zoom-ins) are specified on paper for 2D.
3. Live-action previs: what previs locks (blocking, lens, cut) with placeholder render quality; why gray-box is enough to judge a camera move.
4. The specific craft of judging a CAMERA MOVE from rough material: what must be real (path shape, easing, screen-speed, start/end framing, what enters/leaves frame) vs what can be fake (surface detail, light).
5. Transition planning: how scene-to-scene transitions (cuts, dissolves, wipes, match cuts, camera carries) are specified and tested before production.
Write to: ${RES}/animatic_layout.md`,
  },
  {
    key: 'rough',
    file: RES + '/animatic_rough.md',
    prompt: `${CONTEXT}

LANE: the ROUGH PASS in 2D animation — loose drawings that already carry 100% of the motion.
Research questions:
1. Pose test / blocking pass practice: key poses + breakdowns shot on twos; how animators judge timing and acting from stepped roughs before any cleanup. The rule "if it doesn't work in rough it never will".
2. What a rough drawing keeps vs drops: line of action, silhouette, volume, contact points kept; detail, cleanup, faces often dropped. How much faster roughs are than cleanup (ratios if documented).
3. LINE BOIL and the sketch aesthetic kept in finished films (Joanna Quinn, Bill Plympton, music videos, "Snack Attack" style shorts): how boiling loose lines stay readable in motion; typical boil rate (new drawing every 2-4 frames) and amplitude.
4. How roughs suggest DENSITY cheaply: scribble masses for crowds/foliage/architecture, mass-shapes first, selective detail only at the focal point.
5. Smears, multiples and stepped motion at low drawing counts: how few drawings still read as fluid intended motion (drawings per second ranges for a rough pass vs polish).
Write to: ${RES}/animatic_rough.md`,
  },
  {
    key: 'mograph',
    file: RES + '/animatic_mograph.md',
    prompt: `${CONTEXT}

LANE: MOTION DESIGN / explainer-studio animatic practice — the industry closest to us.
Research questions:
1. The standard mograph pipeline (script -> VO scratch or final -> boards -> ANIMATIC with final timing -> style frames -> design -> animation): what the animatic contains (placeholder solids, rough type, blocked transitions timed to VO) and why client sign-off on the animatic is treated as a timing contract.
2. Named studio/channel processes: Kurzgesagt, Vox, TED-Ed, Buck, Giant Ant, Ordinary Folk, School of Motion teaching: what their animatics/boardomatics include, what fidelity of motion, how they handle revisions at animatic vs after.
3. TRANSITION GRAMMAR of short-form explainer motion design: a catalogue of the transition devices that join scenes seamlessly (object wipe, shape morph, match cut on silhouette, camera carry/whip, scale-through, element hand-off between scenes, background colour swap on action). For each: what it says narratively and what must be decided at animatic time for it to work (matching positions, shared elements, direction of motion).
4. How timing to VO is blocked (markers on words/beats; cuts land on stressed words; breathing room rules).
5. What motion designers call "blocking in" animation: first-pass animation with final timing but linear/rough easing — how it differs from the polish pass (easing, overshoot, secondary).
Write to: ${RES}/animatic_mograph.md`,
  },
  {
    key: 'sketchlook',
    file: RES + '/animatic_sketchlook.md',
    prompt: `${CONTEXT}

LANE: the ANIMATED SKETCHBOOK look itself — how loose sketches stay dense, alive and readable.
First LOOK at the owner's reference image: Read the file ${V}/docs/look/ref_animated_sketchbook.png (an urban sketcher's notebook, Piccadilly-like street scenes in loose ink). Describe in the file what makes it work: dense scribbled suggestion everywhere (crowds, facades, signage as squiggles), confident contours on the main subject, selective detail at the focal point, nothing "empty", value from hatching/mass, varying line confidence.
Research questions:
1. Urban sketching technique: how sketchers get a dense, alive page FAST — big-shape-first, scribble masses for crowds and foliage, broken/implied lines, selective focus ("draw the thing, suggest the rest"), the 80/20 of where detail goes. Named practitioners/teachers and their stated methods (e.g. urban sketching handbooks).
2. How this translates to MOTION: films or sequences that animate in a sketch/boil style and stay readable; what they keep stable (silhouette, framing, the focal subject) while everything else boils or stays loose.
3. Concrete placeholder vocabulary for OUR vector (SVG path) setting, monochrome 4-tone board palette: a "scribble fill" primitive (one wandering path that reads as mass/texture), squiggle crowds, suggested architecture rows, implied windows as tick marks, scribble foliage. For each: roughly how it is built as 1-2 SVG paths and why it reads at phone size (readability at 270x480 thumbnail).
4. The key insight to verify and sharpen: in a sketchbook, LOOSE never means EMPTY — a loose page is dense with suggestion. How to encode that as a per-panel rule so a G3 panel that passes it cannot produce a "way too empty" surprise at G5 (e.g. every surface that will hold detail in the final carries a scribble-mass placeholder at G3).
5. Line boil in vector animation: cheap techniques (2-3 jitter variants per path swapped at 6-12 Hz, seeded wobble), when boil helps (sketch feel, aliveness) vs hurts (readability of small text, strobing), with any documented practice.
Write to: ${RES}/animatic_sketchlook.md`,
  },
  {
    key: 'audit',
    file: RES + '/animatic_audit.md',
    prompt: `${CONTEXT}

LANE: AUDIT of our own G3 practice — repo work only, no web research needed (skip ToolSearch/WebSearch).
Tasks:
1. Read ${V}/docs/look/STORYBOARD_STYLE.md (the current G3 spec), ${V}/docs/OWNER_PLAYBOOK.md (sections Storyboard, Motion, Visual style, Hook), ${V}/docs/PIPELINE_V2.md (the G3 and G5 rows, toolkit table), ${V}/docs/v3/OWNER_NOTES.md, ${V}/docs/v3/camera_plan_g3.md, ${V}/docs/v3/storyboard_g3.md, ${V}/docs/v2/storyboard_g3.md, ${V}/docs/G5_BLOCKING.md.
2. Inventory the tooling: the props/capability header of ${V}/src/v3/SketchReel.tsx (first ~150 lines; skim deeper only as needed), ${V}/scripts/v3/board_lint.py, ${V}/scripts/v3/build_board_cine.py, ${V}/scripts/v2/build_board.py. List exactly what SketchReel board mode can animate today (element in/out, moves, camera, draw-on, transitions?) and what it cannot.
3. Visual gap check: with ffmpeg (the binary is installed), extract 4-6 representative frames each from ${V}/deliverables/v3/v3_g3_animatic_board.mp4 and ${V}/deliverables/v3/v3_g5_blocking.mp4 (same story moments where possible; scale to ~33%), into contact sheets (montage or ffmpeg tile) in your scratchpad, view them (at most ~8 image views total), and name what the G5 cut shows that the G3 board gave NO signal of (density/aliveness, motion smoothness, transition feel, scale feel, palette aside - colour is deliberately G4+).
4. From the owner notes, list every G5-or-later surprise or rework on v2/v3 that a higher-signal G3 would have caught, each with the owner's quote and date.
5. Gap list: for each signal the owner now wants near-final at G3 (story, transitions, animations, camera moves, aliveness-as-placeholder), state what the current spec/tooling does today, what is missing, and the smallest tool or spec change that closes it.
Write to: ${RES}/animatic_audit.md (same length/format rules; use OUR-REPO evidence tags instead of VERIFIED/REPORTED, quoting file paths).`,
  },
]

const LANE_SCHEMA = {
  type: 'object',
  properties: {
    file: { type: 'string' },
    implications: { type: 'array', items: { type: 'string' } },
  },
  required: ['file', 'implications'],
}

phase('Research')
log('6 research lanes: story reels, layout/previs, rough pass, mograph animatics, sketchbook look, repo audit')
const laneResults = await parallel(LANES.map(l => () =>
  agent(l.prompt, { label: 'research:' + l.key, phase: 'Research', schema: LANE_SCHEMA })
))
const ok = laneResults.filter(Boolean)
log(`research lanes done: ${ok.length}/6 returned`)

const laneSummary = LANES.map((l, i) => {
  const r = laneResults[i]
  if (!r) return `- ${l.key}: AGENT DIED — read ${l.file} directly if it exists, else note the gap.`
  return `- ${l.key} (${r.file}):\n` + r.implications.map(s => '  * ' + s).join('\n')
}).join('\n')

phase('Synthesize')
const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    open_questions: { type: 'array', items: { type: 'string' } },
  },
  required: ['files'],
}
const synthPrompt = `${CONTEXT}

YOU ARE THE SYNTHESIS AGENT. Six research lanes have finished. Their files are in ${RES}/animatic_*.md — READ ALL SIX FULLY (reels, layout, rough, mograph, sketchlook, audit). Their one-line implications:
${laneSummary}

Also read: ${V}/docs/look/STORYBOARD_STYLE.md (stays the DRAWING spec; do not duplicate it), ${V}/docs/OWNER_PLAYBOOK.md (Storyboard/Motion/Visual style/Hook sections are law), ${V}/docs/PIPELINE_V2.md (G3 row, anti-waste rules, toolkit table), ${V}/docs/G5_BLOCKING.md (format model: a lean stage how-to), and skim ${V}/docs/look/CINEMATIC_GUIDE.md + ${V}/docs/look/COZY_AND_SCALE.md section headers so you reference them correctly.

WRITE ${V}/docs/G3_ANIMATIC.md — the definitive spec + how-to for the G3 stage as the owner now defines it: "an animated sketchbook: close-to-final story, transitions, animations and camera movements; details omitted but present as placeholders; the closest signal to the final story in as little time as possible."

Required shape (lean, <= ~220 lines, written as rules a build agent can follow; cite research files by path for the why, don't re-argue it):
1. **The principle** — the animated sketchbook: what G3 IS (the film's rough pass: every decision that is expensive to change later is made and VISIBLE here) and IS NOT (polish, colour, final lines).
2. **The signal contract** — a table: each signal (story/cuts, shot framing+staging, camera moves, transitions, key actions/animations, aliveness/density, scale+cozy moments, hook/frame-0, captions/timing), its G3 fidelity (near-final / placeholder / absent), what "near-final" concretely means for it (shape+timing real, polish absent), and how it is checked. This table is the heart: after G3 locks, G5/G6 may only ADD (detail, colour, easing polish, secondary motion, density fill-in), never change what the contract locked.
3. **Placeholder vocabulary** — the loose-but-never-empty rules: scribble-mass placeholders for every surface that will be dense in the final (crowds, facades, shelves, foliage), suggested detail conventions, what a placeholder promises G5 ("this area becomes N real things"). Pull the concrete SVG-level primitives from the sketchlook lane. Keep monochrome 4-tone (STORYBOARD_STYLE §2 palette stands).
4. **Motion at G3** — supersedes STORYBOARD_STYLE §4's "held drawing by default": every cut, camera move and transition the final film will have is PLAYED in the animatic with its real path shape and real timing (retimed to the reel per the playbook Motion rule), with rough/linear-but-shaped easing; drawn actions as 2-4 key poses stepped; what stays unanimated. Transition grammar: the allowed device list (from the mograph lane) and what each requires to be decided at G3.
5. **Build order and time budget** — fastest path to the first cut (target: first full animatic in ~2 h of agent time, rounds 30 min, per PIPELINE_V2): story/beat pass -> camera plan -> thumbnails -> board JSON -> motion pass -> lint -> cold read -> owner. State what is parallelisable.
6. **Review and lock** — sound-off cold read stays; add the motion check (watch at 1x: every move readable, no strobe, cuts on words) and the density-promise check (no panel surface left both empty AND unmarked); the G3 lock = the signal contract frozen; what a G3 revision costs (a JSON data edit).
7. **Tooling deltas** — exact SketchReel/board_lint/build-script changes needed (from the audit lane), each with ~effort; mark which exist already.
Then WRITE ${RES}/g3_spec_edits.md: the exact edit list for the OTHER docs (do NOT edit them yourself): STORYBOARD_STYLE.md (which clauses §0/§4/§5 change and their new wording), PIPELINE_V2.md (new G3 row text + toolkit rows), root CLAUDE.md (the one G3 bullet update), each as old->new. Keep every existing owner rule intact unless the new direction supersedes it, and say so where it does.
Do NOT commit. Reply with just: files written + open questions.`
const synth = await agent(synthPrompt, { label: 'synthesize:G3 spec', phase: 'Synthesize', schema: SYNTH_SCHEMA, effort: 'high' })
log('synthesis done: ' + (synth ? synth.files.join(', ') : 'AGENT DIED'))
if (!synth) throw new Error('synthesis agent died — rerun from resume')

phase('Critique')
const CRITIC_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['pass', 'needs_fixes'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          what: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['severity', 'what', 'fix'],
      },
    },
  },
  required: ['verdict', 'findings'],
}
const criticBase = `${CONTEXT}

YOU ARE A CRITIC. Read ${V}/docs/G3_ANIMATIC.md and ${RES}/g3_spec_edits.md (just written, not yet applied), plus ${V}/docs/OWNER_PLAYBOOK.md and ${V}/docs/PIPELINE_V2.md for the rules they must respect. Report findings (max 8, most severe first) with a concrete fix each. Default to needs_fixes only for real problems; do not invent work. Reply ONLY via the structured output.`
const critics = await parallel([
  () => agent(criticBase + `
YOUR LENS: TIME. The owner's goal is "the closest signal in as little time as possible". Hunt for anything in the spec that inflates build or review time without adding story signal: requirements that force per-panel hand-tuning, vague rules an agent will over-build, missing time budgets, review loops that can run more than once, polish smuggled in as "motion", tooling marked needed that a cheaper convention replaces. Also check the reverse: is the fastest path (first cut in ~2h) actually spelled out step by step?`, { label: 'critic:time', phase: 'Critique', schema: CRITIC_SCHEMA }),
  () => agent(criticBase + `
YOUR LENS: SIGNAL FIDELITY. Replay video 3's history against this spec: the owner approved G3, then at G5 said "way too empty ... the quality and smoothness is not there"; scale felt flat; a window read as a screen; metaphors confused. Would a G3 built exactly to this spec have shown those problems BEFORE the lock? Walk each G5+ surprise from ${V}/docs/v3/OWNER_NOTES.md and ${RES}/animatic_audit.md through the spec and name any that still slip through. Also: does the signal contract really cover transitions and camera moves at near-final fidelity (shape AND timing), or does it quietly allow held panels with marks again?`, { label: 'critic:signal', phase: 'Critique', schema: CRITIC_SCHEMA }),
  () => agent(criticBase + `
YOUR LENS: CONSISTENCY + FEASIBILITY. Check every rule in the new spec against (a) the owner playbook (monochrome at G3, sound-off cold read, one version to the owner, no polish before story lock, 30 fps allowed at G3, signal-per-drawing, literal beats clever, no unsupported metaphors) and (b) what SketchReel/board_lint can actually do today (read the audit lane file ${RES}/animatic_audit.md, and the header of ${V}/src/v3/SketchReel.tsx if needed): every requirement must be implementable as animatic JSON today or appear in the tooling-deltas table with effort. Flag contradictions between G3_ANIMATIC.md and STORYBOARD_STYLE.md that the edits file forgets to reconcile, and any edit in g3_spec_edits.md whose old-text anchor does not actually exist in the target doc.`, { label: 'critic:consistency', phase: 'Critique', schema: CRITIC_SCHEMA }),
])
const liveCritics = critics.filter(Boolean)
const allFindings = liveCritics.flatMap((c, i) => c.findings.map(f => ({ lens: ['time', 'signal', 'consistency'][critics.indexOf(liveCritics[i])] || 'critic', ...f })))
log(`critique done: ${liveCritics.length}/3 critics, ${allFindings.length} findings (${allFindings.filter(f => f.severity === 'blocker').length} blockers)`)

phase('Revise')
let revision = null
if (allFindings.length > 0) {
  const findingsText = allFindings.map(f => `- [${f.severity}/${f.lens}] ${f.what}\n  FIX: ${f.fix}`).join('\n')
  revision = await agent(`${CONTEXT}

YOU ARE THE REVISION AGENT. ${V}/docs/G3_ANIMATIC.md and ${RES}/g3_spec_edits.md were just written by a synthesis agent; three critics (time, signal-fidelity, consistency) reviewed them. Apply their findings by EDITING both files in place (read them first; keep their structure and length discipline; the research files in ${RES}/animatic_*.md are the evidence base if you need to re-check something). Findings:
${findingsText}

Judgment call: a finding that contradicts an owner rule in ${V}/docs/OWNER_PLAYBOOK.md loses; a 'minor' finding that would grow the doc for little value may be rejected — list rejected findings with one reason each in your reply. Do NOT commit. Reply with: what changed per file, rejected findings.`, { label: 'revise:apply findings', phase: 'Revise', effort: 'high' })
} else {
  log('no critic findings — skipping revision')
}

return {
  lanes: LANES.map((l, i) => ({ key: l.key, file: l.file, died: !laneResults[i] })),
  synthFiles: synth.files,
  openQuestions: synth.open_questions || [],
  findings: allFindings,
  revision: revision,
}