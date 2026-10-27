export const meta = {
  name: 'v2r-l4-crane-critics',
  description: 'Lane L4 V2S5: lean fresh-eyes critic panel (art director + sound-off, scale, motion + fairness + completeness), two at a time',
  phases: [
    {title: 'Critics', detail: 'three lenses on the round review files'},
  ],
}

// args: {tag: 'r1', dir: '<review dir>', round: 1, prior: '<text of the previous round verdicts or empty>'}
const DIR = args.dir
const ROUND = args.round
const PRIOR = args.prior || ''

const CONTEXT = `CONTEXT. Video 2 "One Small Window" for the reel channel "What's All the Fuss About?" (1080x1920, 60 fps, watched on a
phone). Shot V2S5 "The far side" (film 20.55-24.00; scene t = film - 20.55): the film's ONE big move, a pull-back crane in Arlington
from a bench under blossoming trees (the stranger reading a newspaper, Pip, a US newspaper box "Google–Pentagon deal for classified
work") to a vast view (the Pentagon, the Potomac, the low white city, the obelisk, a cloud bank) on the line "In April, that meant a
deal letting the Pentagon use its AI for". Repo /home/user/Test-, Remotion project /home/user/Test-/video.
READ: video/docs/v2/TREATMENT.md (section 6 "The scale moment", section 5 row S5 + "The bottom third" S5 + "Texts on objects" S5,
section 8 fairness, section 9 acceptance bar), video/docs/v2/STYLE.md, video/docs/v2/lanes/L4_spec.md (the lane's spec; its section
3b is the scale checklist), video/docs/look/CINEMATIC_GUIDE.md (S5 + "Scale cues").
REVIEW FILES (round ${ROUND}) in ${DIR}: sheet_216_vs_refs.png (our 10 key times at 216 px wide, labelled with film time, above
rows of v1 and reference 1 frames at the same size); keys/f0*.png (the 10 key times at FULL size 1080x1920: film 20.60, 20.80,
21.20, 21.85, 22.10, 22.30, 22.44, 22.80, 23.10, 23.70); full/start_20.80.png and full/end_23.70.png; strip_busy.png (21.80-22.70 at
0.1 s steps, no captions); strip_calm.png (the start hold 20.55-21.25 and the end hold 23.40-23.98); v2s5_half.mp4 (the shot at
0.5 scale with voice, captions and cues: extract any frame with ffmpeg -ss <scene s> into /tmp/claude-0/-home-user-Test-/77c1a0dc-af15-5a35-a3e3-e76f15ecdd7f/scratchpad/critic_${ROUND}/<you>/);
density.txt + density_cozy.txt (density.py), bandcheck.txt (non-sky pixels in the caption band y 317-556 and its margin, every
frame), camera_check.txt (each plane's fastest on-screen speed, px per 60 fps frame, analytic), camspeed.txt (scripts/camspeed.py on
every 60 fps frame; the wipe window 1.47-1.64 is allow-listed), colour_meter.txt (hero / pop / dark shares of the key stills),
deadframes.txt (dead frames and life score). The 216 px sheet's second row also holds two frames of the approved density bar (the v3
G5b pilot). STYLE.md (video/docs/v2/STYLE.md) is the film's definitive style page: judge against it AND TREATMENT.md. Reference videos for any extra comparison:
video/assets/ref/reference.mp4 (reference 1) and video/deliverables/v1/php2shell_final.mp4 (v1). LOOK at the images yourself
(Read tool) at full size AND at 216 px; every finding cites a film time and a screen region.
OWNERS (for each finding name the file that must change): far = V2S5_far.tsx (sky, clouds, bank, sun, far city, obelisk, sky
life) · river = V2S5_river.tsx · mid = V2S5_mid.tsx (Pentagon, lawns) · nearmid = V2S5_nearmid.tsx (the slope's crowns, the big
tree, the slot trees) · deck = V2S5_deck.tsx (terrace, balustrade, bench, people, left/right frames, the wipe lamppost) · start =
V2S5_start.tsx (start-only canopy + near foreground) · figs = V2S5_figs.tsx (stranger, Pip) · text = V2S5_text.tsx (news box,
plaque) · rig = V2S5_rig.ts / V2S5_set.tsx (camera maps, layer order, the wipe path, the swap time).
${PRIOR ? `\nTHE PREVIOUS ROUND'S FINDINGS (check whether each is fixed; do not repeat a fixed one; a regression is a must):\n${PRIOR}\n` : ''}
Your verdict is "pass" only when nothing MUST change. At most 12 problems, most important first, each with a CONCRETE fix (what
to draw / move / recolour, where, how much). Severity: must (blocks pass), should (clearly worth it), nit.`

const FINDINGS = {
  type: 'object',
  properties: {
    lens: {type: 'string'},
    verdict: {type: 'string', enum: ['pass', 'fail']},
    owner_would_say: {type: 'string'},
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: {type: 'string', enum: ['must', 'should', 'nit']},
          time: {type: 'string'},
          region: {type: 'string'},
          problem: {type: 'string'},
          fix: {type: 'string'},
          owner: {type: 'string', enum: ['far', 'river', 'mid', 'nearmid', 'deck', 'start', 'figs', 'text', 'rig', 'other']},
        },
        required: ['severity', 'time', 'region', 'problem', 'fix', 'owner'],
      },
    },
    strengths: {type: 'string'},
  },
  required: ['lens', 'verdict', 'owner_would_say', 'findings', 'strengths'],
}

const LENSES = [
  {key: 'art-director', prompt: `You are a fresh-eyes art director and a sound-off viewer for the crane (V2S5) of a premium hand-drawn reel (9:16, on a phone). The owner rejected our last film and wants it fresh, beautiful, ALIVE like reference 1 and our v1, people small and simple like reference 1 (never big models), a new Pip in every shot, strictly fair. Read video/docs/v2/TREATMENT.md (V2S5; the acceptance bar in section 9; fairness in section 8). Look at the review files and at reference 1 / v1 frames at the same 216 px size. Judge: would the owner say 'yes, this'? Is every paused frame as full and specific as the references? Does it move like v1 (something new every few frames, motion carried across cuts, never a still tableau)? Does every frame read literally with the sound off? Does the scale feel great, like a world that keeps going, and is the Pentagon unmistakable without any war imagery? Colour roles right (teal only on her, orange only in the sun)? Speeds readable at 60 fps? Verdict pass only when nothing must change; at most 12 problems, most important first, each with a concrete fix.`},
  {key: 'scale', prompt: `You are the SCALE critic. You know Arcane's S1E1 rooftop pull-back crane (the owner's favourite shot: "it has pretty much everything: suspense, sense of scale, fantastic environment and composition") through docs/look/CINEMATIC_GUIDE.md S5 and "Scale cues" 1-11, and the lane's checklist (L4_spec.md 3b). The owner's order for this shot: "The scale must feel GREAT." Judge the END frame (full size and 216 px) and the move: does the world keep going (nothing ends inside the frame)? 5-7 planes each 2.2-3x smaller? the far band packed with detail peaking under the horizon? flat atmospheric steps toward the sky? the drop below the camera? the Pentagon huge yet far and calm, the obelisk the one far shape over the horizon with a huge bank behind it, huge top clouds, a big sky? tiny anchors that read at 216 px with lines leading up? does the terrace read as a map or an empty plaza (a failure) or as a near world with its own size gradient? does the START make the reveal (bright slot in a warm-dark frame, the darkest beat, the light burst, the landing) pay off? Name the 1-3 changes that would most increase the felt scale first.`},
  {key: 'qa', prompt: `You are the QA critic: MOTION and TIMING (60 fps), then FAIRNESS + TEXT, then COMPLETENESS. PART 1, motion. Extract frames from v2s5_half.mp4 yourself (ffmpeg, every frame where it matters) and judge, frame by frame: the cut at scene 0 (Pip mid-air out of the sun at ~(292, 721)); Pip's drop onto the bench (seated by ~0.17, no teleport, no strobe); "April" 0.21 (the calendar flip, the 4-frame blossom burst, Pip's look-up) and back by 0.65; the hold has something new every few frames (no dead run > 0.40 s); the move starts at 0.75 with a creep; the darkest beat (the big tree where the Pentagon lands, p 0.15-0.40 = 1.20-1.51); THE WIPE 1.45-1.70 frame by frame: does the lamppost's mass fully hide the swap of the figures at 1.567, is anything popping or jumping?; the light burst 1.69-1.78; the Pentagon clearing the tree ON "Pentagon" 1.88 with the plaque's pop; the obelisk rising 1.99-2.47; the windows warming 2.53; the landing hold 2.85-3.45 (alive: a V of birds, the terrace's people, never 1 s still; no zoom in the hold); Pip's leap 3.35-3.45 (up-right, mid-air at the cut, y >= 600). Speeds: camera_check.txt (detailed layers <= 15 px/f, long flat-ink <= 7.5), strobing of fine repeating patterns (paving joints, balusters, windows) during the move, anything crossing the caption band (bandcheck.txt). Every motion must read on a phone. PART 2, fairness + text (TREATMENT section 8, STYLE.md sections 2 and 9): the Pentagon calm in daylight and blossom, no flag, seal, helipad, vehicle, guard, camera, uniform or glow at it, nothing military; "classified" only in the news box headline; no teal anywhere in S5; orange only on the sun disc and its calendar header; the texts exactly: news box "Google–Pentagon deal for classified work" (40 px) + "Reported Apr 2026 · The Information via Japan Times; 9to5Google" (18 px), no masthead; plaque "The Pentagon" (>= 56 px) + "US Department of Defense"; key lines read at 216 px, body and credits at ~390 px phone width (make 390 px crops); people small and simple (reference 1's grammar, no faces, never teal), no raised phones or cameras, nobody pointing at the Pentagon. PART 3, completeness: every item of TREATMENT section 5 row S5, section 5 "The bottom third" S5 (start AND end), section 6 (start, beats by progress, the end frame list), Pip's S5 beats (section 3), the S4->S5 and S5->S6 cut contracts (map.ts MATCHES; L3's S4 out-leap in video/src/v2r/scenes/V2S4_rig.ts), the acceptance bar (section 9): present, timed and READABLE? What is missing or only nominally there?`},
]

phase('Critics')
const verdicts = await parallel(LENSES.map((l) => () => agent(`${l.prompt}\n\n${CONTEXT}`, {label: `critic:${l.key}`, phase: 'Critics', schema: FINDINGS, effort: 'max'})))
const got = verdicts.map((v, i) => (v ? {...v, lens: LENSES[i].key} : {lens: LENSES[i].key, verdict: 'fail', owner_would_say: 'critic failed to return', findings: [], strengths: ''}))
log(`verdicts: ${got.map((v) => `${v.lens}=${v.verdict} (${v.findings.filter((f) => f.severity === 'must').length} must)`).join(', ')}`)

return {verdicts: got}
