export const meta = {
  name: 'v2r-l3-critic-round',
  description: 'L3 critic round (budget): ONE fresh-eyes critic on V2S3 + V2S4, then one fixer per shot, one agent at a time',
  phases: [
    {title: 'Critique', detail: 'one combined critic: art director, cold viewer, standards, contract, motion, completeness'},
    {title: 'Fix', detail: 'V2S4 fixer, then V2S3 fixer (sequential): mandated STYLE.md deltas + every must + worthwhile shoulds'},
  ],
}

// args: {round: 'r1', review: '<abs dir of the review files>', fix: true|false}
const R = args.round
const DIR = args.review
const S = '/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad'

const BRIEF_CRITIC = `"You are a fresh-eyes art director and a sound-off viewer for her bank (V2S3 + V2S4) of a premium hand-drawn reel (9:16, on a phone). The owner rejected our last film and wants it fresh, beautiful, ALIVE like reference 1 and our v1, people small and simple like reference 1 (never big models), a new Pip in every shot, strictly fair. Read video/docs/v2/TREATMENT.md (V2S3 + V2S4; the acceptance bar in section 9; fairness in section 8). Look at the review files and at reference 1 / v1 frames at the same 216 px size. Judge: would the owner say 'yes, this'? Is every paused frame as full and specific as the references? Does it move like v1 (something new every few frames, motion carried across cuts, never a still tableau)? Does every frame read literally with the sound off? Do the dated plates read at phone size, and does the walk feel like one continuous evening? Colour roles right (teal only on her, orange only in the sun)? Speeds readable at 60 fps? Verdict pass only when nothing must change; at most 12 problems, most important first, each with a concrete fix."`

const FILES = `THE REVIEW FILES (round ${R}; index ${DIR}/README.txt): the clip ${DIR}/clip.mp4 (film 12.75-20.80 at 0.5 scale with voice + cues) and its decoded frames ${DIR}/frames/fNNNN.png (film frame = NNNN + 764; film s = film frame / 60: e.g. film 17.96 s = frame 1078 = f0314); 216 px labelled stills beside reference 1 / v1: ${DIR}/sheet_S3.png, ${DIR}/sheet_S4.png; full-size 1080x1920 key frames ${DIR}/key_*.png (named by film second); motion strips ${DIR}/strip_S3_busy.png, strip_S3_calm.png, strip_S4_busy.png, strip_S4_calm.png (10 frames 0.1 s apart from the busiest second; 8 frames 0.25 s apart from the calmest); the three cuts ${DIR}/cuts.png (S2->S3 12.98, S3->S4 14.86, S4->S5 20.55); QA numbers ${DIR}/density.txt (per shot; DENSE-CALM targets: flat <= 30 %, detail >= 33 %, objects >= 120/Mpx, cozy movers >= 2, empty <= 5 %), ${DIR}/camspeed.txt, ${DIR}/deadframes.txt, ${DIR}/colour.txt. References at 216 px: ${S}/ref1/r_002.png ... r_032.png and ${S}/v1/v_002.png ... v_055.png (sheets ${S}/ref1_sheet.png, ${S}/v1_sheet.png). V2S3 = film 12.98-14.86 (1.88 s), V2S4 = film 14.86-20.55 (5.69 s). LOOK at the images yourself (Read the PNGs; crop / zoom with ImageMagick into your own dir ${S}/critic_${R}_<lens>/ when you need detail). BUDGET: do not render anything (the review files are enough); read only what you need.`

const SPEC = `THE SPEC: video/docs/v2/TREATMENT.md (sections 2-3, the S3 / S4 rows of section 5 + the bottom third + texts on objects, section 8, section 9), video/docs/v2/STYLE.md (the film's style sheet: it wins on style), video/docs/v2/lanes/plan_L3.md (L3's build spec: what each part must contain, the beats, the text layouts), video/src/v2r/world/map.ts (sections 1, 3, 7 S3/S4, 8 PIP, 9 MATCHES), the rigs video/src/v2r/scenes/V2S3_rig.ts and V2S4_rig.ts. The code (repo /home/user/Test-): video/src/v2r/scenes/V2S3*.tsx and V2S4*.tsx.`

const MANDATED = args.mandated || {V2S3: [], V2S4: []}
const MAND_TXT = `ALREADY MANDATED by the orchestrator (STYLE.md deltas the fixers apply anyway; do not re-report them, but DO report anything else): V2S4: ${JSON.stringify(MANDATED.V2S4)}; V2S3: ${JSON.stringify(MANDATED.V2S3)}.`

const RULES = `Rules: you are READ-ONLY (never edit a repo file, never commit). Be concrete: every finding names the shot, the film time(s) or frame(s), what is wrong, the evidence (which image / number), and a fix a builder can do in code (which file, what). Severity: "must" = the owner would not say "yes, this", or a rule / contract / fairness break; "should" = a clear improvement; "nit" = small. Verdict "pass" only when nothing must change. At most 12 findings, most important first; no praise.`

const LENS_A = `Your lenses: the ART DIRECTOR and the SOUND-OFF COLD VIEWER. (1) COLD READ FIRST, before reading TREATMENT, plan_L3 or code: look only at the two 216 px sheets, the four strips and the cuts sheet, and write in "coldRead" what a cold viewer on a phone understands happens in each shot and what each piece of text says (can you read the name tag, DEC 2025 / unclassified work, APR 2026 / classified work at 216 px?); note every confusion or possible misread (a gesture that reads as protest, a figure that looks like her or a ghost, Pip doing something odd, unreadable text, motion over text). (2) THEN read the spec and judge as the art director: beauty, freshness, fullness and specificity of every paused frame at 216 px beside reference 1 and v1, and at full size (the key frames: line quality, misregistration, believable objects, glitches, layering mistakes, colour harmony, warm-never-sickly, the top sky as the one quiet field, the bottom third as a rich mass); does the eye land on her / her window / the plates / Pip at the right moment; does each shot tell its ONE thing (TREATMENT section 5, last column) literally with the sound off? Would the owner say "yes, this"?`
const LENS_B = `Your lenses: STANDARDS + CONTRACT, MOTION + CONTINUITY, and COMPLETENESS. (1) Contract and standards: TREATMENT section 8 and STYLE.md sections 2 and 9 in every frame; map.ts positions (W2_CUT at the S2->S3 cut: centre (335, 785), 132.5 x 164.3; SUN1 (250, 650) r 65 on screen at 20.53-20.55; the post x 575; the plates' rects; the tag rect; Pip seats and its rect at each cut; never in the caption band y 317-556, the right rail x > 780 below y 840, or over her; built tops >= 600; sun tops >= 575); the exact texts (video/src/v2r/kit/boards/texts.ts TXT_NAME_TAG, TXT_PLATES, letter by letter on the key frames); the type scale (keys >= 56, body 30-34, credits 18-20); people (near head-backs <= ~140 px wide, no faces, no look-alike of her within ~300 px, the public never teal); colour roles (colour.txt; teal only her coat / her door / her window frame; orange only sun discs; no grey, beige, tan, olive); code hygiene by grep in V2S3*.tsx / V2S4*.tsx (no Math.random / Date, opacity, gradient, blur, filter, raw hex outside palette tokens, forbidden imports: src/scenes, src/v3 except idle.ts / Pullback.tsx, src/v2, lib/kit, lib/cine, lib/mascot, lib/index). (2) Motion and continuity at 60 fps, stepping through the frames around every beat and cut: her walk (feet planted against the towpath; the slow-down 17.36-17.96; the stop into stopLook without a pop), walkers' feet vs travel, Pip (the S2->S3 hop continuous across 12.98; landing 13.10; turn on "she" 13.90-13.96; exit leap 14.70 inside x 0-120, y 620-700 at 14.86; S4 entry inside x 520-640, y 940-1060 at 14.86 and LEFT of her; landing 14.95; turn west 19.55; the leap with its body over the sun's lower right at 20.53), the cameras (S3 ease-back + float, no stop; S4 truck parallax by plane, the stop, the push 18.40-20.10), builds vs the voice (heard word times video/public/v2r/voice_words_heard.json: marks ON the word ±0.05 s; tag 15.07 / 16.60 / off 18.80; DEC 18.92; APR complete on "heading" 19.80; birds 19.80), life cadence (>= 2 movers always, no dead run > 0.40 s: deadframes.txt, density.txt), strobing, jitter, popping, boil, motion over lettering, camspeed.txt. (3) Completeness: tick every item of the TREATMENT S3 / S4 rows (picture, life, Pip, beats, bottom third, texts, credits) and plan_L3 sections 1-2; report the MISSING and the WEAK ones.`
const LENSES = [{key: 'combined', body: `You are the ONE critic of this round (budget: one critic), so you cover every lens, in this order.\n(A) ${LENS_A}\n(B) ${LENS_B}\nReport at most 12 findings PER SHOT (most important first).`}]

const FIND_SCHEMA = {
  type: 'object',
  properties: {
    lens: {type: 'string'},
    verdict: {type: 'string', enum: ['pass', 'fail']},
    summary: {type: 'string'},
    coldRead: {type: 'string'},
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          shot: {type: 'string', enum: ['V2S3', 'V2S4']},
          severity: {type: 'string', enum: ['must', 'should', 'nit']},
          problem: {type: 'string'},
          evidence: {type: 'string'},
          fix: {type: 'string'},
        },
        required: ['shot', 'severity', 'problem', 'evidence', 'fix'],
      },
    },
  },
  required: ['lens', 'verdict', 'summary', 'findings'],
}

phase('Critique')
const crits = (await parallel(LENSES.map((L) => () =>
  agent(`${BRIEF_CRITIC}\n\nThe brief's critic prompt above is your core instruction. You have FRESH EYES (you did not build this).\n\n${L.body}\n\n${FILES}\n\n${SPEC}\n\n${MAND_TXT}\n\n${RULES}\n\nReturn lens = "${L.key}".`,
    {label: `critic:${L.key}`, phase: 'Critique', effort: 'max', schema: FIND_SCHEMA})))).filter(Boolean)

const verdicts = crits.map((c) => ({lens: c.lens, verdict: c.verdict, summary: c.summary, musts: c.findings.filter((f) => f.severity === 'must').length, coldRead: c.coldRead || ''}))
log(`critics: ${verdicts.map((v) => `${v.lens} ${v.verdict} (${v.musts} must)`).join(' · ')}`)
const all = crits.flatMap((c) => c.findings.map((f) => ({...f, lens: c.lens})))
const pass = crits.length === 1 && crits.every((c) => c.verdict === 'pass') && !(MANDATED.V2S3.length + MANDATED.V2S4.length)
if (!args.fix || pass) return {round: R, pass, verdicts, findings: all, fixes: []}

const SHOTS = {
  V2S4: {files: 'video/src/v2r/scenes/V2S4.tsx and every V2S4_*.tsx (the world parts V2S4_far / V2S4_path / V2S4_boat / V2S4_w*, the story parts V2S4_post / V2S4_tag / V2S4_her / V2S4_pip); V2S4_rig.ts only if a number in it is wrong (say why)', comp: 'Film2R-V2S4', times: '0.05,1.0,2.4,3.1,4.0,5.0,5.6 (shot-local; 0 = film 14.86)'},
  V2S3: {files: 'video/src/v2r/scenes/V2S3.tsx and every V2S3_*.tsx (V2S3_terrace / V2S3_t*, V2S3_near / V2S3_n*, V2S3_pip); V2S3_rig.ts only if a number in it is wrong (say why)', comp: 'Film2R-V2S3', times: '0.0,0.12,0.6,1.0,1.4,1.75,1.86 (shot-local; 0 = film 12.98)'},
}
const FIX_SCHEMA = {
  type: 'object',
  properties: {
    shot: {type: 'string'},
    fixed: {type: 'array', items: {type: 'string'}},
    notFixed: {type: 'array', items: {type: 'string'}},
    stills: {type: 'array', items: {type: 'string'}},
    requests: {type: 'array', items: {type: 'string'}},
  },
  required: ['shot', 'fixed', 'notFixed', 'stills', 'requests'],
}

phase('Fix')
const work = ['V2S4', 'V2S3'].map((id) => ({id, items: MANDATED[id].map((m) => ({shot: id, severity: 'must', problem: m, evidence: 'orchestrator: STYLE.md delta', fix: m, lens: 'orchestrator'})).concat(all.filter((f) => f.shot === id && f.severity !== 'nit'), all.filter((f) => f.shot === id && f.severity === 'nit'))})).filter((w) => w.items.length)
const fixes = []
for (const w of work) {
  const r = await agent(`You are the FIXER for ${w.id} of lane L3 (video 2 "One Small Window", a premium hand-drawn 9:16 reel; repo /home/user/Test-, branch video-production, already checked out; Remotion project /home/user/Test-/video). Your files (edit ONLY these): ${SHOTS[w.id].files}. Another fixer will edit the other shot after you: never edit, revert or git-checkout its files, map.ts, palette.ts, kits, lib/ or docs; write files whole or with small Edits that keep them valid at every step (its renders bundle your files too); if a render fails because of someone else's file, wait a minute and retry.
READ FIRST: video/docs/v2/lanes/plan_L3.md (the spec; rules section 0), video/docs/v2/STYLE.md (the style sheet), video/docs/v2/TREATMENT.md (the ${w.id} row, sections 2-3, 8, 9), your files and the kit functions they call.
THE FINDINGS for ${w.id} (the orchestrator's mandated STYLE.md items first, then the fresh-eyes critic's) (round ${R}; the same problem may appear twice: fix it once). Critic verdicts: ${JSON.stringify(verdicts.map((v) => ({lens: v.lens, verdict: v.verdict, summary: v.summary})))}. Findings: ${JSON.stringify(w.items)}.
TIME BOX: about 15-20 minutes. Fix EVERY must (mandated ones first) and the shoulds you can do well in that time (nits only if trivial). A finding that contradicts STYLE.md / TREATMENT / map.ts, or is wrong about the frames: do not apply it; list it under notFixed with the reason. Verify each fix by rendering ONLY your shot at 0.5 scale (from /home/user/Test-/video, ALWAYS GL=angle and --concurrency=2): GL=angle node scripts/render-frames.mjs ${SHOTS[w.id].comp} <dir> <seconds> --entry=src/entry-v2r-film.tsx --scale=0.5 with ${SHOTS[w.id].times}; for a cut use Film2R with a few FILM seconds around it (never a full-film render); LOOK at the stills (Read; at 216 px beside ${S}/ref1/*.png and ${S}/v1/*.png, and at full size) and iterate until it is genuinely fixed and nothing else broke. BUDGET: renders of your shot only, stills, at most one 0.5-scale clip of your shot. Keep plan_L3 section 0 in every frame. Typecheck: npx tsc --noEmit -p . 2>&1 | grep -E "${w.id}" (clean). Scratch dir ${S}/fix_${R}_${w.id}/.
COMMIT at checkpoints and at the end, ONLY your files: cd /home/user/Test- && git add <your files> && git commit -m "v2r L3 (${w.id}, critic ${R}): <what changed>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_014PwCXJs9nWENkpKqVhHWMP" (if .git/index.lock exists, wait 5 s and retry; NEVER git add -A, push, pull, stash, reset or switch branches).
Return: what you fixed (one line each), what you did not fix and why, your final stills' paths, and requests (one exact line each for something only the orchestrator or another owner can change).`,
    {label: `fix:${w.id}`, phase: 'Fix', effort: 'max', schema: FIX_SCHEMA})
  if (r) fixes.push(r)
}

return {round: R, pass, verdicts, findings: all, fixes}
