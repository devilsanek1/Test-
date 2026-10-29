export const meta = {
  name: 'shared-world-kit',
  description: 'Build the recurring props and sets of the php2shell world (government buildings, lock flaw, plaques, beetle, noticeboard, dome, door street, sun morphs) in two lanes, review against the references, fix',
  phases: [
    { title: 'Inventory', detail: 'find recurring elements across the storyboard' },
    { title: 'Build', detail: 'sets lane + props/characters lane' },
    { title: 'Review', detail: 'style & readability reviewer' },
    { title: 'Fix', detail: 'both lanes fix findings' },
  ],
}

const ROOT = '/home/user/Test-/video'
const CONTEXT = `
Project: ${ROOT} (Remotion 4 + React 18 + TypeScript). FIRST read ${ROOT}/docs/BRIEF.md (BALANCE NOTE + measured full-bleed numbers + CINEMATIC DIRECTION), then ${ROOT}/docs/ENGINE.md, ${ROOT}/docs/CINE.md, ${ROOT}/docs/mascot.md, ${ROOT}/docs/style_bible.md, ${ROOT}/docs/style_bible_ref2.md (incl. the two-tier scale playbook), ${ROOT}/docs/motion_spec.md. Look at ${ROOT}/assets/ref/f_5.5.png, f_9.0.png and ${ROOT}/assets/ref2/f_1.png, f_12.png, f_33.png (the look to match) and render the existing demos for API reference (scripts/still.sh KitDemo 7 /tmp/...; CineDemo).
The storyboard ${ROOT}/docs/storyboard.json (and storyboard.md) defines a world: the web is a city, every building is a website (its main window is a browser window: three dots + address bar), PHP is the elephant-stamped blueprint, each PHP building has a sand elephant plaque by its door, the bug is a lock whose bolt stops short (the same flaw in every door built from the plan), a tiny ink beetle "Bit" lives in the flaw, Cloudflare is a colossal glass dome with a watchtower guard, the orange sun morphs (power button, pie chart, clock, wax seal), "Pip" is the periwinkle elephant mascot (src/lib/mascot, don't edit it). NOTE: the script may still be revised, so build REUSABLE, parametric props and sets (not scene-locked choreography); every prop exposes build-in/out animation props (at, dur, seed, state) in seconds, like the kit components.
Everything time-based in seconds, deterministic, flat style, palette tokens, ink weight by depth, misregistration, people from behind, no fades. Check: npx tsc --noEmit clean; render stills and LOOK at them next to the references until they look like the same artist made them; keep render cost low.
Lanes (stay in yours):
- SETS lane: src/scenes/shared/sets/** (larger compositions: GovernmentPlaza with 4 distinct monumental government buildings (govA..govD per storyboard) whose main windows are browser windows with working shutters, a 'rest' layout reusable as S01's opening and S11's ending frame; StoopStreet (one-point street of stoops and identical doors, day/night); Makers' Lane; a noticeboard street corner; the Dome over an endless city with a watchtower; a SeaOfDoors / endless identical facades to the horizon with one door fixed; the blueprint wall) + docs/SHARED_SETS.md.
- PROPS lane: src/scenes/shared/props/** (Lock with short-bolt flaw and fixed variant + open/close/test animations, ElephantPlaque (new / old with cobweb), Bit the ink beetle (crawl, hide, peek), Noticeboard with an address-bar top rail and swappable panes, BrowserWindow chrome helper if the kit's isn't enough, SunMorphs (power glyph overlay with press animation, pie chart 7/10 and 1/3, clock wedge for 45 minutes, wax seal stamp), Envelope + mail slot, Snail, Keeper/caretaker figure from behind with keys, sparkle tablets for the AI teams, attempt figures trying handles (silhouettes from behind), progress bar, 'back soon' tag, shutters) + docs/SHARED_PROPS.md. Also own src/dev/SharedKitSheet.tsx (a 10 s sheet showing every prop and a thumbnail of every set, with labels) and its registry entry durationSeconds.
`

phase('Inventory')
const inventory = await agent(`${CONTEXT}
YOUR JOB (read-only, no repo edits): read docs/storyboard.json + storyboard.md fully and list every element, set and character that appears in 2+ scenes or carries continuity (match-cuts, returns, the loop), plus any element that is complex enough that two scene builders would draw it inconsistently. For each: name, which lane (sets/props), which scenes use it, required states/animations, size range on screen, key visual notes from the storyboard. Output a concise, structured build list for the two lanes.`, { effort: 'max', label: 'inventory', phase: 'Inventory' })

phase('Build')
await parallel([
  () => agent(`${CONTEXT}\nBUILD LIST (from the inventory step):\n${inventory}\n\nYOU ARE THE SETS LANE. Build the sets in your lane from the list, importing props from src/scenes/shared/props when they exist (the props lane is building them in parallel; if a prop isn't ready, use a simple placeholder behind a clearly named import you can swap later, and note it). Final message: API summary, render cost, files, gaps.`, { effort: 'max', label: 'sets:build', phase: 'Build' }),
  () => agent(`${CONTEXT}\nBUILD LIST (from the inventory step):\n${inventory}\n\nYOU ARE THE PROPS LANE. Build the props in your lane from the list, plus SharedKitSheet. Final message: API summary, render cost, files, gaps.`, { effort: 'max', label: 'props:build', phase: 'Build' }),
])

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['ship', 'needs-work'] },
    findings: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      lane: { type: 'string', enum: ['sets', 'props'] },
      item: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
    }, required: ['severity', 'lane', 'item', 'problem', 'fix'] } },
  },
  required: ['verdict', 'findings'],
}
let findings = []
for (let round = 1; round <= 2; round++) {
  phase('Review')
  const r = await agent(`${CONTEXT}\nYou are the ART DIRECTOR reviewing the shared world kit (src/scenes/shared/**, docs/SHARED_SETS.md, docs/SHARED_PROPS.md, SharedKitSheet). Do NOT edit repo files. Render the SharedKitSheet at several times and each set at rest into /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/sharedreview/, compare side by side with the reference stills. Judge: same artist as the references (ink, overshoot, misregistered flat fills, palette, people from behind)? Instantly readable at phone size (is the browser-window-on-a-building idea obvious? is the short bolt readable? is Bit charming and visible?) Scale per the playbook (baseline vs peak)? Parametric and reusable with clean APIs and docs? Render cost? Verdict ship only if a top illustrator would sign it.`, { effort: 'max', label: `review:r${round}`, phase: 'Review', schema: REVIEW_SCHEMA })
  findings = (r && r.findings) || []
  const blocking = findings.filter(f => f.severity !== 'minor')
  log(`Round ${round}: ${r ? r.verdict : 'no review'} — ${blocking.length} blocker/major, ${findings.length - blocking.length} minor`)
  if (r && r.verdict === 'ship' && blocking.length === 0) break
  phase('Fix')
  await parallel(['sets', 'props'].map(lane => () => {
    const mine = findings.filter(f => f.lane === lane)
    if (!mine.length) return Promise.resolve('nothing')
    return agent(`${CONTEXT}\nYOU ARE THE ${lane.toUpperCase()} LANE. The art director found:\n${JSON.stringify(mine, null, 1)}\nFix every blocker and major and the cheap minors; re-render and LOOK to confirm; keep docs accurate; tsc clean. Final message: what changed per finding.`, { effort: 'max', label: `${lane}:fix:r${round}`, phase: 'Fix' })
  }))
}
return { inventory, remaining: findings }
