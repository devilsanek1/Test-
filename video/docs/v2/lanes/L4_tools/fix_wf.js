export const meta = {
  name: 'v2r-l4-crane-fix',
  description: 'Lane L4 V2S5: one fix round (a fixer per owner file group, two at a time) on the ranked fix list',
  phases: [{title: 'Fix', detail: 'one fixer per owner group'}],
}

// args: {round: 2, items: [fix list items], notes: '<lead notes for the fixers>'}
const S = '/tmp/claude-0/-home-user-Test-/77c1a0dc-af15-5a35-a3e3-e76f15ecdd7f/scratchpad'
const ROUND = args.round
const ITEMS = args.items || []
const NOTES = args.notes || ''

const GROUPS = [
  {key: 'far', owners: ['far', 'river'], files: 'video/src/v2r/scenes/V2S5_far.tsx, V2S5_river.tsx and their V2S5_far_* / V2S5_river_* helpers'},
  {key: 'valley', owners: ['mid', 'nearmid'], files: 'video/src/v2r/scenes/V2S5_mid.tsx, V2S5_nearmid.tsx and their V2S5_mid_* / V2S5_nearmid_* helpers'},
  {key: 'deck', owners: ['deck'], files: 'video/src/v2r/scenes/V2S5_deck.tsx and its V2S5_deck_* helpers'},
  {key: 'figs', owners: ['figs', 'text'], files: 'video/src/v2r/scenes/V2S5_figs.tsx, V2S5_text.tsx and their V2S5_figs_* / V2S5_text_* helpers'},
  {key: 'start', owners: ['start'], files: 'video/src/v2r/scenes/V2S5_start.tsx and its V2S5_start_* helpers'},
  {key: 'rig', owners: ['rig', 'other'], files: 'video/src/v2r/scenes/V2S5_rig.ts and V2S5_set.tsx (the lane lead delegates them to you for this round)'},
]

const COMMON = `You are a FIXER in lane L4 (the crane, shot V2S5) of video 2 "One Small Window" (vertical 1080x1920 reels, 60 fps). Repo
/home/user/Test-, branch video-production, Remotion project /home/user/Test-/video (run commands from there). Effort MAX, quality
first. Fix round ${ROUND}. Read first: video/docs/v2/lanes/L4_spec.md (sections 7-9: rules, method, ownership + git), then
video/docs/v2/STYLE.md and the parts of video/docs/v2/TREATMENT.md your items touch; then your files and whatever they import.
Method: dev entry video/src/v2r/scenes/V2S5_entry.tsx (S5At {p, t, only}; S5Shot), render into ${S}/fix${ROUND}_<your group>/,
look at full size and at 216 px beside ${S}/refs216/ (reference 1 and v1); iterate until each item is really fixed (verify the
way the item says) without breaking anything else (look at the whole frame, not just the item). Before you finish: npx tsc
--noEmit -p . clean; python3 ${S}/tools/bandcheck.py --step 2 (0 in the band and the margin from your layers); the camera check
(V2S5_qa.ts header command, --outfile=${S}/fix${ROUND}_<group>/s5qa.js) if you touched a map, a box or a path. Edit ONLY your files;
keep them compiling at every save (another fixer renders at the same time); if a render fails in a file you do not own, wait and
retry. Commit your files (git add <your files>; never -A) with a message "v2r L4 fix${ROUND} <group>: ..." whose body ends with
"Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" and "Claude-Session: https://claude.ai/code/session_014PwCXHEmk7T2Y5xLmUSX6h";
retry if .git/index.lock exists; do NOT pull or push. An item you cannot or should not fix in your files: say exactly why and
what would fix it (file, change). ${NOTES}`

const OUT = {
  type: 'object',
  properties: {
    group: {type: 'string'},
    fixed: {type: 'array', items: {type: 'object', properties: {id: {type: 'string'}, what: {type: 'string'}}, required: ['id', 'what']}},
    not_fixed: {type: 'array', items: {type: 'object', properties: {id: {type: 'string'}, why: {type: 'string'}, needs: {type: 'string'}}, required: ['id', 'why', 'needs']}},
    files: {type: 'array', items: {type: 'string'}},
    checks: {type: 'string'},
    images: {type: 'array', items: {type: 'string'}},
    commits: {type: 'array', items: {type: 'string'}},
  },
  required: ['group', 'fixed', 'not_fixed', 'files', 'checks', 'images', 'commits'],
}

phase('Fix')
const jobs = GROUPS.map((g) => ({g, items: ITEMS.filter((it) => g.owners.includes(it.owner))})).filter((j) => j.items.length)
log(`fix round ${ROUND}: ${jobs.map((j) => `${j.g.key} (${j.items.length})`).join(', ')}`)
const results = await parallel(
  jobs.map((j) => () =>
    agent(`${COMMON}\n\nYOUR GROUP: ${j.g.key}. YOUR FILES: ${j.g.files}.\nYOUR ITEMS (fix every must; every should unless it would make the shot worse, then say why):\n${JSON.stringify(j.items, null, 1)}`, {
      label: `fix:${j.g.key}`,
      phase: 'Fix',
      schema: OUT,
      effort: 'max',
    }),
  ),
)
return {results: results.map((r, i) => r || {group: jobs[i].g.key, fixed: [], not_fixed: [], files: [], checks: 'FAILED', images: [], commits: []})}
