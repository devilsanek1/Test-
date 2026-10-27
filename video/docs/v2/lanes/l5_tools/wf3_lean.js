export const meta = {
  name: 'v2r-l5-final-review',
  description: 'L5 (budget): wire K3 into S6/S7 + review files; ONE combined critic for K3 and one for S6/S7 (STYLE.md, fairness, acceptance); fixers; a second K3 round only if it failed. Max 2 agents at a time.',
  phases: [
    {title: 'Critique 1', detail: 'K3 combined critic + (wire boards + review files)'},
    {title: 'Fix 1', detail: 'S6/S7 combined critic + K3 fixer'},
    {title: 'Fix 2', detail: 'S6 fixer + S7 fixer'},
    {title: 'Round 2', detail: 'K3 only, if its critic failed; final review files'},
  ],
}

const SCRATCH = '/tmp/claude-0/-home-user-Test-/5b04204c-6c47-55d3-9e18-d0defeafecc8/scratchpad'

const CONTEXT = `
You are working in lane L5 of video 2 "One Small Window" (a premium hand-drawn 9:16 news explainer reel, 1080x1920, 60 fps; Remotion + TypeScript). Repo /home/user/Test- (git), project dir /home/user/Test-/video, branch video-production (other sessions push to it too). L5 owns the K3 boards kit (video/src/v2r/kit/boards/**, video/src/entry-v2r-boards.tsx; used by L2 in S2, L3 in S4, L4 in S5, L6 in S8) and shots V2S6 "The gate" (24.00-28.06; video/src/v2r/scenes/V2S6.tsx + V2S6_*.tsx) and V2S7 "Google says" (28.06-32.93, visible under the wipe to 33.16; V2S7.tsx + V2S7_*.tsx; V2S7_pip.ts is shared with S6). The owner wants it fresh, beautiful and ALIVE like reference 1 and our v1, people small and simple, Pip in every shot, strictly fair. BUDGET: the owner must finish the whole video inside a weekly token limit: be thorough but economical (no full-film renders, render only what you need at --scale=0.5, one agent does one job).
READ FIRST, IN FULL (MANDATORY): video/docs/v2/STYLE.md (the definitive style document; where it is stricter than an older doc it wins on style; e.g. a near head-back is <= ~140 px wide AT THE SHOULDERS, NearBack hv <= ~150; shadows short, colour, never grey; floats within +-12 px of home; the BUSY / DENSE-CALM profiles; the NEVER list), then video/docs/v2/TREATMENT.md (the spec of what is in each shot: S6 / S7 rows in section 5, texts on objects, section 8 fairness, section 9 acceptance bar), video/docs/v2/lanes/COMMON.md, brief_L5.md, video/src/v2r/kit/boards/README.md, video/src/v2r/world/map.ts (S6, S7, B, BOARD_BOLLARD, SUN2, UI, LEGIBILITY).
HEARD words (film s): any 24.03 · veto 26.50 · used 27.56-27.82 · But 28.31 · Google 28.36 · AI 29.64 · principles 30.04 · bans 30.84 · retaliation 31.16 · of 32.08 · kind 32.52-32.70 · She 33.16 · her 35.72 · talking 36.54 · facts 37.18 · not 37.70.
RENDERING (4 shared CPUs): GL=angle / --gl=angle, --concurrency=2, --scale=0.5. Shot stills (run from video/, SHOT-local s): GL=angle node scripts/render-frames.mjs Film2R-V2S6 <dir> <t1,t2> --entry=src/entry-v2r-film.tsx --scale=0.5 ; film context (film s): ... Film2R <dir> <t1,t2> ... ; K3 sheets: --entry=src/entry-v2r-boards.tsx (compositions listed in that file). LOOK at renders with the Read tool. References at 216 px: ${SCRATCH}/ref1/r_*.png, ${SCRATCH}/v1/v_*.png. Typecheck: cd video && npx tsc --noEmit -p .
GIT: commit only L5 paths (git add <paths>), message 'v2r L5: <what>' ending with:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014PwCXJBpuhBWJAJtA6vrSe
Push: git pull --no-rebase origin video-production, then git push origin HEAD:video-production (retry with backoff 2/4/8/16 s; if .git/index.lock exists wait 5 s). Never touch other lanes' files, CLAUDE.md, HANDOFF.md, TREATMENT.md, STYLE.md, OWNER_PLAYBOOK.md.
`

const CRITIC_SCHEMA = {
  type: 'object',
  properties: {
    verdict: {type: 'string', enum: ['pass', 'fail']},
    problems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          shot: {type: 'string', enum: ['V2S6', 'V2S7', 'both', 'K3']},
          severity: {type: 'string', enum: ['must', 'should']},
          what: {type: 'string'},
          where: {type: 'string'},
          fix: {type: 'string'},
        },
        required: ['shot', 'severity', 'what', 'where', 'fix'],
      },
    },
    evidence: {type: 'array', items: {type: 'string'}},
  },
  required: ['verdict', 'problems', 'evidence'],
}

const K3_CRITIC = (round, prior) => `${CONTEXT}
YOU ARE THE K3 CRITIC (round ${round}): one fresh-eyes reviewer wearing four hats at once: ART DIRECTOR + READABILITY (beautiful, of the film's hand, clear hierarchy, no cramped rows or holes; every key line >= 56 px reads at 216 px wide, body and credits at ~390 px), STANDARDS EDITOR (word-exact vs TREATMENT section 5 "Texts on objects" and texts.ts; quote marks only on exact words; US spelling except her quote; the deal board ALWAYS shows the FULL clause whenever the purpose line is up; no Google letters on the deal board; every board / object carries its credit; MEASURE that the deal board and Google's board are equal in face size, frame, type sizes, colour, weight, light and shadow, and that her board matches Google's), STYLE.md AUDITOR (palette jobs, line and fill, shadows, the boards' anatomy: an enamel A-board, plum stiles and rails, a paper face, a plum keyline, fill-first pen, line pops, ONE clack, ONE pen; nothing fades), LANE USER (L2 / L3 / L4 / L6 can drop the presets in: map-default positions, every time a prop with a documented clock, exit + frame-0 paper look work, nothing in the caption band or the right rail by default).
Render the K3 sheet and preset compositions (see video/src/entry-v2r-boards.tsx) into ${SCRATCH}/k3review/r${round}/ at the key times of each preset's timeline, make 216 px and 390 px downscales (magick <png> -resize 216x <out>), LOOK at them; read the code where you need to.
${prior ? `Previous round's problems and the fixer's answer (check each is really fixed, then look for anything new):\n${prior}` : ''}
Verdict 'pass' only when nothing MUST change. At most 10 problems, most important first, each tagged shot 'K3' with a concrete fix (file, what to change). Do not edit any repo file.`

const WIRE_REVIEW = (tag) => `${CONTEXT}
YOUR JOB (wire + review files${tag}): (1) pull; make sure V2S6 uses K3's DealBoard and V2S7 uses K3's GoogleBoard (video/src/v2r/kit/boards/index.ts): if a scene still draws a STAND-IN board (V2S6_board.tsx / V2S7_board.tsx), swap it for the K3 preset with the shot's times (S6: purpose 0.03, F12 2.40, clack 0; S7: header 0.30, "AI principles" complete 1.98, small row 2.24, "of any kind" complete 4.02); check S6's board rides the mid plane at S6.board0 with its legs on the kerb, S7's board sits at B inside the camera group (exact at local 1.98) with legs to y 1250, the same light / shadow in both, Pip clear of the faces (>= 200 px from the S6 clause), nothing over the lettering; typecheck; commit + push if you changed anything. (2) The review files: from /home/user/Test-/video run python3 -I ${SCRATCH}/tools/l5_review.py ${SCRATCH}/review${tag} (renders per shot 8 key-time stills -> a 216 px montage beside reference 1 / v1, one full-size 1080x1920 key frame, a 10-frame motion strip; then the 0.5-scale clip WITH voice of Film2R frames 23.80-32.93 and density.py --cozy + deadframes.py on it; ~10-15 min); then the band check: npx remotion render src/entry-v2r-film.tsx Film2RBare ${SCRATCH}/review${tag}/bare.mp4 --frames=1440-1990 --gl=angle --concurrency=2 --scale=0.5 --log=error && python3 -I ${SCRATCH}/tools/bandcheck.py ${SCRATCH}/review${tag}/bare.mp4 --t0 24.0 > ${SCRATCH}/review${tag}/bandcheck.txt . If a script call fails, fix the call (not the scripts) and say so. LOOK at the montages, full frames and strips. RETURN (plain text): every output path (one per line, with what it is) and the key numbers (density per shot: ev/s, gap, flat, objects, detail, cozy movers / empty; deadframes per shot: score, dead runs; band check: frames with intrusions), plus what you changed in step 1 (commit).`

const SHOT_CRITIC = (review) => `${CONTEXT}
YOU ARE THE S6 / S7 CRITIC (their second and LAST round): a fresh-eyes art director, a sound-off viewer and a standards editor for two shots of a premium hand-drawn reel (9:16, on a phone). The owner rejected our last film and wants it fresh, beautiful, ALIVE like reference 1 and our v1, people small and simple like reference 1, Pip in every shot, strictly fair. Read STYLE.md and TREATMENT.md (shots V2S6, V2S7; acceptance bar in section 9; fairness in section 8). Judge: as full and alive as the references at 216 px? Every board line readable (keys at 216 px, body at ~390 px)? The deal board and Google's board truly equal? No implied accusation, no war imagery, the full oversight clause always with the purpose line? Something new every few frames? Plus the acceptance numbers (density: S6 BUSY flat <= 40 %, objects >= 105 / Mpx, detail >= 34 %, >= 3.5 ev/s, no gap > 1 s; S7 DENSE-CALM flat <= 30 %, detail >= 33 %, objects >= 120, cozy movers >= 2; deadframes >= 8/10, no dead run > 0.40 s; band check 0 intrusions), the people rule (near backs <= ~140 px wide at the shoulders), Pip (S6: lands by 24.12 on the post, one ear flick on "veto", >= 200 px from the clause, hops at 27.95; S7: lands on the bollard by 28.22 continuing the same arc across the SUN2 cut, then sits facing the board, NO reaction), the cuts (render film frames 23.95-24.15, 27.95-28.25 and 32.66-33.20 every 2-3 frames: SUN2 identical across 28.06; the narrowboat wipe's bow only after 32.70, nothing of it in y 317-556, the seam always covered). The review files and numbers: ${review}
${args && args.prior ? `An earlier fresh-eyes critic already reported on the first build (check whether each point still holds on the current build; keep the ones that do, drop the fixed ones):\n${args.prior}\n` : ''}Verdict 'pass' only when nothing MUST change. At most 12 problems, most important first, each tagged V2S6 / V2S7 / both, with a concrete fix (file, what to change). Do not edit any repo file.`

const FIXER = (who, files, report) => `${CONTEXT}
YOUR JOB (fixer: ${who}): apply EVERY 'must' and every worthwhile 'should' below to ${files} ONLY (another fixer edits other files at the same time). Re-render what changed (--scale=0.5) and LOOK at it (full size and 216 px); typecheck; commit and push.
${report}
RETURN: per problem: fixed / not fixed + why; the pushed commit; anything still weak.`

const fmt = (crit, pick) => crit.problems.filter(pick).map((p, i) => `${i + 1}. [${p.shot} ${p.severity}] ${p.what} @ ${p.where} -> FIX: ${p.fix}`).join('\n')

// Round 1: K3 critic || wire + review files
phase('Critique 1')
const [k3c1, review1] = await parallel([
  () => agent(K3_CRITIC(1, ''), {label: 'K3 critic r1', phase: 'Critique 1', schema: CRITIC_SCHEMA, effort: 'max'}),
  () => agent(WIRE_REVIEW('/r1'), {label: 'wire + review files', phase: 'Critique 1', effort: 'max'}),
])
log(`K3 r1: ${k3c1 ? k3c1.verdict : 'none'} (${k3c1 ? k3c1.problems.length : 0} problems)`)

// S6/S7 critic || K3 fixer
phase('Fix 1')
const k3rep = k3c1 ? fmt(k3c1, () => true) : ''
const [shotc, k3fix1] = await parallel([
  () => agent(SHOT_CRITIC(review1), {label: 'S6/S7 critic (round 2)', phase: 'Fix 1', schema: CRITIC_SCHEMA, effort: 'max'}),
  () => (k3rep ? agent(FIXER('K3 kit', 'video/src/v2r/kit/boards/** and video/src/entry-v2r-boards.tsx (keep README.md in step with the API)', k3rep), {label: 'K3 fixer r1', phase: 'Fix 1', effort: 'max'}) : Promise.resolve('K3: nothing to fix')),
])
log(`S6/S7 r2: ${shotc ? shotc.verdict : 'none'} (${shotc ? shotc.problems.length : 0} problems)`)

// S6 fixer || S7 fixer
phase('Fix 2')
const fixes = shotc
  ? await parallel(['V2S6', 'V2S7'].map((sid) => () => {
      const rep = fmt(shotc, (p) => p.shot === sid || p.shot === 'both')
      if (!rep) return Promise.resolve(`${sid}: nothing to fix`)
      const files = sid === 'V2S6' ? 'video/src/v2r/scenes/V2S6.tsx and V2S6_*.tsx' : 'video/src/v2r/scenes/V2S7.tsx and V2S7_*.tsx (V2S7_pip.ts too: keep S6 in step and say so)'
      return agent(FIXER(sid, files, rep), {label: `fix ${sid} (round 2)`, phase: 'Fix 2', effort: 'max'})
    }))
  : []

// Round 2 for K3 only if it failed in round 1; plus the final review files
phase('Round 2')
let k3c2 = null
let k3fix2 = null
const finalTasks = [() => agent(WIRE_REVIEW('/final'), {label: 'final review files', phase: 'Round 2', effort: 'max'})]
if (k3c1 && k3c1.verdict !== 'pass') {
  const prior = `${k3rep}\n\nFIXER: ${k3fix1}`
  finalTasks.push(() => agent(K3_CRITIC(2, prior), {label: 'K3 critic r2', phase: 'Round 2', schema: CRITIC_SCHEMA, effort: 'max'}))
}
const [reviewFinal, k3c2r] = await parallel(finalTasks)
k3c2 = k3c2r || null
if (k3c2 && k3c2.verdict !== 'pass') {
  const musts = fmt(k3c2, (p) => p.severity === 'must')
  if (musts) k3fix2 = await agent(FIXER('K3 kit (last round: MUSTs only)', 'video/src/v2r/kit/boards/** and video/src/entry-v2r-boards.tsx', musts), {label: 'K3 fixer r2', phase: 'Round 2', effort: 'max'})
}
return {k3: {r1: k3c1, fix1: k3fix1, r2: k3c2, fix2: k3fix2}, shots: {review1, critic: shotc, fixes, reviewFinal}}
