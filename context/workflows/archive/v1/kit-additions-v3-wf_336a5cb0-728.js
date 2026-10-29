export const meta = {
  name: 'kit-additions-v3',
  description: 'Build the shared sets/props additions requested by storyboard v3 (plaza civic skyline + screen-off + rewind, dome rescale, check-box tags, label tags, counter board, diagram hand, sticky note, sticker, rewind glyph...) in two lanes, then one art-director review + fix',
  phases: [
    { title: 'Build', detail: 'sets lane + props lane' },
    { title: 'Review', detail: 'art director' },
    { title: 'Fix', detail: 'both lanes' },
  ],
}
const ROOT = '/home/user/Test-/video'
const CONTEXT = `
Project: ${ROOT}. FIRST read ${ROOT}/docs/BRIEF.md, ${ROOT}/docs/SHARED_SETS.md, ${ROOT}/docs/SHARED_PROPS.md, ${ROOT}/docs/ENGINE.md, ${ROOT}/docs/CINE.md, ${ROOT}/docs/style_bible.md and look at the current kit sheet (scripts/still.sh SharedKitSheet 2.5 /tmp/... ). The new storyboard ${ROOT}/docs/storyboard_v3.json has a "requests" object listing new shared pieces; storyboard_v3.md describes how each is used per scene. TWELVE scene agents are building scenes RIGHT NOW in parallel and will import these from src/scenes/shared (until they exist they use local shims with the same names/props), so: (1) keep EVERY existing export and API backward compatible, (2) use exactly the names and props the requests specify, (3) land the most-needed pieces first and keep tsc clean at every save (a broken shared file breaks 12 agents' renders).
Lanes: SETS = src/scenes/shared/sets/** + docs/SHARED_SETS.md; PROPS = src/scenes/shared/props/** + src/dev/SharedKitSheet.tsx + docs/SHARED_PROPS.md. Same quality bar as the kit so far (reference ink look, flat fills with misregistration, ink by depth, no fades, deterministic, time in seconds, cheap to render).
`
phase('Build')
await parallel([
  () => agent(`${CONTEXT}\nYOU ARE THE SETS LANE. Implement every item in storyboard_v3.json requests.sets (GovernmentPlaza farCivic + civicOffAt/civicOnAt, per-building screenOffAt CRT collapse + screenOnAt, the frame-0 state, rewind support liftAt/onAt/outAt, govC partial shutter; BlueprintStreet title-block label slot; DomeCity dome rescale + watchtower + searchAngle clamp + sun slot r260 + rattler anchors + multiplane depths; TelephoneWires S08 rooftop pole; MakersLane blindSign; StoopStreet dawnAt + crate slot; TerraceHill Bit dot, checkBoxWaveAt, keeper speck; OldQuarter noticeSign, people/furniture modes, old-plaque mask, support-tag slots, cart line; BlueprintWall clean top margin + banner bottom rail). Order: GovernmentPlaza first (S01/S11/S12 depend on it), then DomeCity, TerraceHill, OldQuarter, the rest. Verify each with stills. Final message: what landed (names/props), render cost, anything deferred.`, { effort: 'max', label: 'sets:build', phase: 'Build' }),
  () => agent(`${CONTEXT}\nYOU ARE THE PROPS LANE. Implement every item in storyboard_v3.json requests.props (LabelTag with tag/card/slip/notice/sign/stamp + at/outAt/flipTo/swing; lettered BackSoonTag + liftAt/outAt; RewindGlyph; CounterBoard; DiagramHand + KeyCross + SiteIcon; StickyNote with slapAt/strikeAt; Sticker 'I [heart] PHP?' static; CheckBoxTag empty/ticked batched for hundreds + SupportTag; SunGlowSteps r260; SunPie n=2; RollerShutter stopAt; reversed SunPress). Order: LabelTag first (used in most scenes), then RewindGlyph/BackSoonTag (S01/S12), CounterBoard (S08), DiagramHand (S02), CheckBoxTag (S09), StickyNote (S11), Sticker (S03), the rest. Add them to SharedKitSheet. Verify each with stills. Final message: what landed (names/props), render cost, anything deferred.`, { effort: 'max', label: 'props:build', phase: 'Build' }),
])
const RS = { type: 'object', properties: { findings: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, lane: { type: 'string', enum: ['sets', 'props'] }, item: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'lane', 'item', 'problem', 'fix'] } } }, required: ['findings'] }
phase('Review')
const r = await agent(`${CONTEXT}\nYou are the ART DIRECTOR. Do NOT edit files. Check every requested piece exists with the requested name/props (compare against storyboard_v3.json requests), renders in the reference look, reads at phone size (labels >= the requested px), and that existing APIs still work (npx tsc --noEmit). Render the SharedKitSheet and the changed sets into /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/kitv3/.`, { effort: 'max', label: 'review', phase: 'Review', schema: RS })
const fs = (r && r.findings) || []
log(`Kit review: ${fs.filter(f => f.severity !== 'minor').length} blocker/major, ${fs.filter(f => f.severity === 'minor').length} minor`)
phase('Fix')
await parallel(['sets', 'props'].map(lane => () => {
  const mine = fs.filter(f => f.lane === lane)
  if (!mine.length) return Promise.resolve('nothing')
  return agent(`${CONTEXT}\nYOU ARE THE ${lane.toUpperCase()} LANE. Fix:\n${JSON.stringify(mine, null, 1)}\nKeep APIs stable (scene agents are using them), tsc clean. Final message: per finding, what changed.`, { effort: 'max', label: `${lane}:fix`, phase: 'Fix' })
}))
return { findings: fs }
