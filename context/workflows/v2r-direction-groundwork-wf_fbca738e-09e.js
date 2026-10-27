export const meta = {
  name: 'v2r-direction-groundwork',
  description: 'Conform video 2 to the owner-approved DIRECTION/CRAFT: through-line card + per-lane conform briefs (director, adversarial critic-fixer, STYLE/map integrator) in parallel with the engine (lib/light.tsx port, the tiered clean pen + kit tier defaults for v2r)',
  phases: [
    { title: 'Through-line', detail: 'director -> critic-fixer -> style integrator' },
    { title: 'Engine', detail: 'lib/light.tsx + tiered clean pen for v2r' },
  ],
}

const CTX = `
PROJECT: video 2 ("One Small Window", restart "v2r") of the short-form explainer series. Repo /home/user/Test- (PUBLIC repo: never commit
emails, keys or third-party frames), branch video-production; Remotion project in video/; v2r code in video/src/v2r (entries
video/src/entry-v2r-*.tsx; Film2R composition, 1080x1920, 60 fps, 2345 frames), docs in video/docs/v2. Voice, script and timings are LOCKED
(public/v2/voice.wav, 39.08 s; heard word times in video/docs/v2/direction/beat_map.md). Eight shots V2S1-V2S8 built ~60-80 % by six lanes
(L1 S1 hook, L2 S2 wall of windows, L3 S3+S4 her bank, L4 S5 Arlington crane, L5 boards + S6 + S7, L6 S8 + the loop seam), now PAUSED; their
state: video/docs/v2/PROGRESS.md (top snapshot) and video/docs/v2/lanes/handover_L1..L6.md.
WHAT CHANGED (why this run exists): while paused, the owner approved a new direction after rejecting video 3's G5b ("too busy, too incoherent,
just a bunch of shots put together, too many moving parts, too rough and messy, no shadows, light weirdly put"). It lives in
video/docs/look/DIRECTION.md (ONE page, it WINS) and video/docs/look/CRAFT.md (numbers, code, checks), with the approved pipeline in
video/docs/PIPELINE_V2.md. Doc order: owner's words (video/docs/OWNER_PLAYBOOK.md, docs/v2/OWNER_NOTES.md) > DIRECTION > CRAFT > PIPELINE_V2
> G3_ANIMATIC/G5_BLOCKING > look/*.md > docs/v2/STYLE.md (values only) > older docs. v2 was built BEFORE this direction: dark ink on
everything, strangers' backs in the foreground (S1 near row, S2/S3/S6/S7 head-backs), two cuts carried only by Pip hopping (retired), no
light rig or contact shadows, Pip periwinkle at C* > 25, no through-line object. The owner said go: conform v2 to DIRECTION, a 6-8 s look clip
of the S1 opening comes next for approval, while the lanes conform their shots.
OWNER RULES THAT BIND HERE: MAX effort; finishing the film inside the weekly token budget comes first (be thorough but never wasteful: no
full-film renders, stills or short clips at 0.25-0.4 scale only, render with --gl=angle --concurrency=2); every set/figure/Pip/prop is drawn
new for this film (engine, tools and QA are reused; never import from src/v3 or src/v2 film code into v2r); people small and simple like
reference 1, no faces; fairness rules in docs/v2/TREATMENT.md §8 stay (her never in Washington; Google at equal weight; no war imagery).
GIT: commit ONLY your own files with clear messages ending with the two trailer lines below; push with: for i in 1 2 3 4; do git fetch -q origin
video-production && git merge -q --no-edit origin/video-production && git push -q origin HEAD:video-production && break; sleep $((2**i)); done.
Other sessions (video 3) push to the same branch: never touch src/v3, docs/v3, deliverables/v3; keep v1/v3 renders unchanged.
Trailer lines for every commit message:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ
`

const DIRECTOR = CTX + `
YOUR JOB (director): write the through-line card and the per-lane conform briefs that make v2 satisfy DIRECTION/CRAFT with the least rework
of what is built. Read first: DIRECTION.md, CRAFT.md (all of §a-§d), PIPELINE_V2.md (G0.5 through-line card, W1 world bible), the playbook,
docs/v2/TREATMENT.md, docs/v2/STYLE.md, docs/v2/direction/beat_map.md, video/src/v2r/world/map.ts, video/src/v2r/film/scenes.json, the core
line and script in docs/v2 (find them), PROGRESS.md's top snapshot and every lanes/handover_L*.md. Look at the current film: render 2-3 stills per
shot at 0.25 scale (npx remotion still src/entry-v2r-film.tsx Film2R <out.png> --frame=<f> --scale=0.25 --gl=angle) into
/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/groundwork/ and view them.
DECIDE AND WRITE video/docs/v2/THROUGHLINE.md (the card + W1 world bible for v2; plain, numbered, <= ~170 lines):
1. The core line (as locked) and the ONE thread object that carries the arc (CRAFT §a.1: on screen >= 80 % of the runtime, never gone > 3 s;
   the S5 crane may run without it as the declared scale reveal ONLY if the move leaves from the thread and the next join returns to it). Her
   lit window W ("One Small Window") is the obvious candidate but the Arlington sequence (S5-S6, ~20-28 s) and S7 must keep it: solve it with a
   DIRECTION-legal mechanism (e.g. other places entered and left THROUGH the window, the thread keeping a home spot, a reflection, a paper that
   carries it) or pick a better thread; show the per-shot on-screen table with the summed screen time and the longest gap.
2. The home place and the places (<= 3, 1 scale reveal); the "you" (likely none: no strangers' backs in the foreground in ANY shot; strangers
   small in the mid and far ground; the foreground holds only Pip or things); what fills each shot's bottom third instead of the backs.
3. Every join S1->S2 ... S7->S8 and S8->loop: carrier letter A-F (CRAFT §a; F plain cut at most 2, only on a "But" turn, thread on both sides),
   the engine type, the midpoint time on the next sentence's first heard word, what leads, Pip's path (it rides the carrier or keeps its screen
   spot; the "cut on Pip's leap" joins are retired and must be re-carried), <= 4 movers within 0.4 s of the join.
4. Per shot, per beat: the tier map by STORY ROLE (A subject 1-3 objects with times; B supporting: Pip, people near the story; C environment),
   the mover budget (<= 3-4 noticeable supporting movers at once, taking turns), and the colour-script line.
5. The light rig per set (CRAFT §d.1): key (sun azimuth/elevation, screen side), the ONE shadow tint family, pool colours, which shots use it;
   no source moves between cuts; contact shadows under everything that touches a surface, form and cast shadows; rim only on the subject.
6. What stays exactly as built (to protect the budget) and what changes, per shot.
THEN WRITE video/docs/v2/lanes/conform_L1.md ... conform_L6.md (one per lane, <= ~60 lines each): the exact changes for its shots (strangers out
of the foreground and what replaces them; joins in/out with carrier and Pip path; thread presence and screen spot; tier tags per element and
beat; the set's light rig with contact/form/cast shadows via lib/light.tsx, which the engine agent is building in parallel; line: the tiered
clean pen is global, so delete per-element ink weights and any explicit over/breaks/jitter/drift/misreg; the mover budget), what to keep, and the
acceptance checks it must report (CRAFT §a-§d checks that apply, eye checks, a 0.4-scale clip of its shots). Commit + push both. Return a
<= 25-line summary: the thread, its screen-time %, the carriers per join, the biggest per-lane changes, open questions for the owner (if any).`

const CRITIC = CTX + `
YOUR JOB (adversarial critic + fixer): the director just wrote video/docs/v2/THROUGHLINE.md and video/docs/v2/lanes/conform_L1..L6.md. Try
to BREAK them against DIRECTION.md and CRAFT.md (read both fully), the locked script/timings (docs/v2/direction/beat_map.md), TREATMENT §8
fairness, map.ts and what is actually built (render stills at 0.25 scale where needed, scratch dir
/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/groundwork/). Recompute independently: the thread's
summed screen time and longest gap (the FAIL lines), the F count and that each F sits on a "But" turn with the thread both sides, each join's
midpoint vs the next sentence's first heard word, Pip on both sides of every join, no strangers' backs in any foreground, one light rig per set
with no source moving between cuts, the tier map giving A >= 60 % of the motion per beat, <= 3-4 noticeable supporting movers, and that every
brief is buildable by its lane in ~60-75 minutes with ONE agent at a time (cut anything that is not required by DIRECTION). FIX the docs in
place (keep them plain and short), commit + push. Return: verdict (pass / fixed), the recomputed numbers, every change you made (one line
each), and anything only the owner can decide.`

const INTEGRATOR = CTX + `
YOUR JOB (style integrator): make the film's own docs and contract agree with DIRECTION/CRAFT and the (critic-checked)
video/docs/v2/THROUGHLINE.md, so no lane meets conflicting instructions (owner rule: integrate, never just append; the lower doc is fixed).
1. video/docs/v2/STYLE.md: it is now VALUES ONLY inside DIRECTION (say so at the top). Rewrite, do not append: §1 non-negotiables; §2 light =
   the rig per set from THROUGHLINE; §3 line = tiers by story role via lib/pen.ts setPen('clean') (retire the 15:40 note about lib/sketch's
   lighter pen as the film's pen, the depth weights, misregistration, open-contour rules); §4 people (no strangers' backs in any foreground;
   strangers small mid/far), Pip = tier B (C* <= 25, a same-hue line <= 2.2 px, <= 1 % of the frame): pick Pip's new hex(es) keeping its
   periwinkle identity at C* <= 25, update the Pip token in video/src/v2r/palette.ts (and its problems() checks) in the same commit; §5 life =
   DIRECTION rule 3 (no events/s quota, <= 3-4 noticeable supporting movers, the profile names LIVELY/DENSE-CALM only as information); §6 joins =
   THROUGHLINE's carriers (retire "cut on Pip's leap", "hops across every cut", the sun as a character); §8 references (retire the loose-line and
   G5b-motion rows); §9 NEVER list aligned with DIRECTION's Retired list. Keep every film-specific value that still holds (palette roles, the
   caption band y 317-556, sizes, fairness).
2. video/src/v2r/world/map.ts: BOTTOM_THIRD and every comment/value that puts strangers' backs in a foreground (S1 seated near row, S2/S3/S6/S7
   head-backs) -> what THROUGHLINE puts there; Pip seats/paths at the joins THROUGHLINE changes; MATCHES/transition notes; keep the file
   typechecking (cd video && npx tsc --noEmit -p .) and do not break the lanes' imports (keep exported names; change values/comments).
3. video/docs/v2/TREATMENT.md: replace the 15:40 banner with one pointing to DIRECTION.md + THROUGHLINE.md as winning where they differ.
4. video/docs/v2/lanes/COMMON.md: the reading order becomes DIRECTION.md, CRAFT.md, THROUGHLINE.md, your conform_<id>.md, STYLE.md, then the
   rest; the review loop's critics check CRAFT's checks; keep everything else.
Typecheck, commit + push. Return a <= 15-line summary (Pip's new colour with its L*/C*, what moved in map.ts, anything left open).`

const ENGINE = CTX + `
YOUR JOB (engine): give v2 the owner-approved clean pen WITH attention tiers and a light-and-shadow module, so the lanes only tag and place.
1. Light: write video/src/lib/light.tsx, the film-agnostic light module CRAFT §d asks for ("lib/light.tsx, to build; first version: v3's
   src/v3/film/kit/Light.tsx"): read src/v3/film/kit/Light.tsx and its README section, and port its generic parts into lib (a LightRig
   context per set: key = point lamp / sun with azimuth + elevation / sky, one shadow tint family, pool colours; <ShadowLayer> = one isolated
   multiply group after the fills and before the ink; <ContactShadow>, <CastShadow> (footprint swept along the light; parallel for a sun),
   <FormShade> (the side away from the key), <LightPool>, <PoolLift>, <Rim> (subject only); colour helpers; 2 flat steps, never blur). Do NOT
   edit or import v3 files (v3 keeps its copy; add a header note that films use lib/light.tsx). Write a short section in a new
   video/src/lib/LIGHT.md (API + the CRAFT §d numbers it implements) and a tiny demo composition in a v2r entry (e.g. entry-v2r-contract or
   a new entry-v2r-light.tsx) that shows a person, Pip, a bench, a lamp and a boat under the canal evening sun with form/cast/contact shadows.
   Run scripts/qa/check_light.py on the demo still if it applies (read its usage).
2. Pen: v2r now uses the FULL clean pen with tiers: in video/src/v2r/pen.ts replace setPenMode('clean') with lib/pen.ts setPen('clean', {...})
   (read lib/pen.ts, lib/tier.tsx and how lib/Ink, lib/Fill and lib/mascot read them; v3's src/v3/film/look.ts shows a call): bg = the Canal
   Mint page/sky token, emissive = the lit window, lamp pool and sun tokens (from video/src/v2r/palette.ts). Then give every v2r KIT export a
   default tier (lib/tier.tsx's wrapper or scope, as v3's kit did with tiered()): canal sets, buildings, water, towpath, far city, Arlington
   environment = environment; cast people = support (line-drawn figures keep the tinted line); Pip = support with lines; her = subject; the
   boards = support by default (a scene promotes the board on its beat); the ghosts (her outline copies, closed outlines on purpose) = subject on
   their beat, support otherwise. Scenes can override per beat. Document the tier defaults in each kit README (one short section).
3. Prove it: typecheck (cd video && npx tsc --noEmit -p .); render before/after stills at 0.4 scale of Film2R at ~f60 (S1), f640 (S2), f900
   (S3), f1300 (S5), f1700 (S6), f2000 (S7), f2250 (S8) into /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/groundwork/engine/
   (before = with your pen.ts change reverted locally, never committed) and one contact sheet before|after; view it; confirm v3 is untouched
   (render one Film3 still from v3's entry before and after your change and compare bytes or pixels). Count CRAFT §c's line metrics roughly
   if a tool exists in scripts/qa (retro_tools).
Commit + push (only your files). Return a <= 15-line summary: the API, the tier defaults, what the before/after shows, v3 identical (yes/no),
anything a lane must know.`

phase('Through-line')
const chain = async () => {
  const d = await agent(DIRECTOR, { label: 'director: THROUGHLINE + conform briefs', phase: 'Through-line', effort: 'max' })
  const c = await agent(CRITIC + '\n\nTHE DIRECTOR SAID:\n' + (d || '(no summary)'), { label: 'critic-fixer: break it, fix it', phase: 'Through-line', effort: 'max' })
  const i = await agent(INTEGRATOR + '\n\nTHE CRITIC SAID:\n' + (c || '(no summary)'), { label: 'integrator: STYLE, map, TREATMENT, COMMON', phase: 'Through-line', effort: 'max' })
  return { director: d, critic: c, integrator: i }
}
const eng = () => agent(ENGINE, { label: 'engine: lib/light + tiered clean pen', phase: 'Engine', effort: 'max' })
const [tl, en] = await parallel([chain, eng])
return { throughline: tl, engine: en }