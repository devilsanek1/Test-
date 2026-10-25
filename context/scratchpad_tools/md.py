import json
ROOT = '/home/user/Test-/video'
SB = json.load(open(f'{ROOT}/docs/storyboard_v3.json'))
TM = json.load(open(f'{ROOT}/assets/timing_est_v3.json'))
WS = [w['s'] for w in TM['words']]; WORDS = SB['wordsRef'].split()
R = lambda a: WS[a['w']] + a['dt']
def an(a):
    w = WORDS[a['w']].strip('.,')
    d = a['dt']
    return f"w{a['w']}" + ('' if d == 0 else f"{d:+.2f}") + f" '{w}'"
def anS(a):
    return an(a) + f" ({R(a):.2f})"
sc = SB['scenes']
PEAK = {'S01': 'PEAK 1', 'S08': 'PEAK 2', 'S09': 'PEAK 3 (Part B)'}
VIS = {
 'S01': 'Government Plaza: civic buildings, browser-window facades, the r155 power-button sun pressed on "shut"; govA + govB shutters slam, govC half, govD stays lit; far civic skyline winks out; "back soon" tags on "purpose".',
 'S02': 'Tight on the PHP master blueprint: the lock detail with its short bolt, Bit in the gap; a dashed diagram hand turns it with no key and a tiny schematic site is taken over. Labels L1, L2.',
 'S03': 'Blueprint Street: the stamp slams on "PHP", the pop-up book on "the language", the "I [heart] PHP?" sticker on "loves", 7 plaques tick + the 7/10 sun pie. Labels L3 -> L4.',
 'S04': 'Door #4 close: Bit sits on the lock in plain sight while 14 year pages tear, seasons cycle, ghosts pass, Pip sleeps. Label L5 hangs from the lock.',
 'S05': 'The blueprint wall (low angle): two teams rise, AI tablets, scan beams; ring on "out", the S02 hand redraws on "bad" (how bad). Label L6. The messenger leaves with an envelope.',
 'S06': "Makers' Lane (golden): the sun pops a wax seal onto the envelope, mail slot, three makers' heads pop UP on 'heads-up'; blind down 'still fixing...'.",
 'S07': 'Noticeboard: the leak sheet lens-wipes in on "but", the address-bar rail goes online, clones 2-4-8, copies ride the wires, the sun becomes a spinning clock (fix not ready). Label L7.',
 'S08': 'Crane over our parapet: hooded figures already rattling doors across an endless city; on "Cloudflare" a glass dome draws over ONE far district (~1/5); a rooftop counter board counts from the announcement; 45-min wedge; millions burst; sunset. Labels L8-L11.',
 'S09': 'Sunrise at the set point; the makers drop a crate (fix is out), one keeper installs one lock; hidden match-cut, pull-back up a hillside of ~650 doors: wrench tags over every door, one check flag. Label L12.',
 'S10': 'Old Quarter at door height: 1/2 sun pie, plaques flip old on ~half the sites, cobweb + cane; "officially supported" tags skip the old ones; a host caretaker patches one anyway. Label L13.',
 'S11': "govB's browser window: a stalled progress bar, the advisory notice (L14), the sun pressed on 'turn', the shutter drops; a sticky note 'Turn it off and on again' gets 'and on again' struck on 'everything'.",
 'S12': 'Hard cut back to the plaza as the shutdown left it; on "before" the sun shows a clock spinning BACKWARDS and the whole plaza rewinds to the frame-0 morning (shutters up, lights on).',
}
CAMS = {
 'S01': 'sine push 1.00->1.04 from rest, lock; 0.30 s dive into govB\'s lock box',
 'S02': 'push-through lands 1.15->1.30, slow 3% creep',
 'S03': 'hard cut, 4% breath, lock',
 'S04': 'creep 1.50->1.55; 0.37 s push into lock4 (match)',
 'S05': 'match lands 1.08->1.12, lock; truck-right with the messenger',
 'S06': 'cut on action: truck-right (matched speed), lock',
 'S07': 'lens wipe; 6% push, lock; tilt-up into S08',
 'S08': 'BIG MOVE 1: crane 1.3->1.0 (out(quart)); gentle 5% lean, lock',
 'S09': 'hold; approach push 1.0->1.5; hidden match at zoom 6; BIG MOVE 2: pull-back 6->1 (2.1 s)',
 'S10': 'tram wipe; 5% push, lock; 0.4 s dive into siteM\'s window',
 'S11': 'push-through lands 1.60->1.66, lock; 3% lean into the joke',
 'S12': 'hard cut, 3% push; the rewind eases the camera back to rest (= frame 0)',
}
o = []
P = o.append
est_d = SB['est']['duration']
P('# Storyboard v3: php2shell, re-mapped onto the final script (word-anchored)\n')
P(f"Machine-readable twin: `docs/storyboard_v3.json` ({len(sc)} scenes, {sum(len(s['beats']) for s in sc)} beats, {sum(len(s['captions']) for s in sc)} caption pages, "
  f"{sum(len(s['labels']) for s in sc)} on-screen labels). Script: `docs/script/final_script.md` section 1 (178 words, the JSON's `wordsRef`). "
  f"Estimated timeline: `assets/timing_est_v3.json` (same schema as `assets/timing.json`, `\"estimated\": true`), **{est_d:.2f} s**.\n")
P("**Every time is a word anchor** `{w, dt}`: `t = words[w].s + dt`, where `w` is the 0-based index into `wordsRef.split()` (whitespace split, punctuation attached). "
  "In this document an anchor is written `w14+0.35 'purpose' (3.96)`: word 14, 0.35 s after its start, and in brackets the estimated second (for reading only). "
  "The film starts 0.125 s before word 0 (`w0-0.125` = 0 s) and ends 0.35 s after the last word ends. When the voice is recorded, only the timing file changes; "
  "every scene, cut, camera key, caption, highlight, label, sun key and sound cue moves with its word. Durations of motions (a 0.16 s shutter slam, a 0.4 s wipe) stay in seconds.\n")
P("**How the estimate was made.** Word durations and pauses come from the previous ElevenLabs take (`assets/timing.json`, 77.76 s): the median measured duration of the same word, "
  "otherwise a syllable fit on that take (0.075 s + 0.138 s per syllable), final lengthening x1.19 before a pause, x1.12 on the four cued CAPS words, sentence pauses 0.555 s and comma pauses 0.255 s (the take's medians), "
  "0.36 s for the cued ellipsis after 'PHP', 0.20 s where the cue asks for a breath ('announced,', 'off,'), lead-in 0.125 s, tail 0.35 s (tail + lead-in = 0.475 s, a sentence pause at the loop seam). "
  f"Result {est_d:.1f} s, against final_script.md's own estimate of about 56 s.\n")
P("**Validated.** The JSON parses; a lint that resolves every anchor against the estimate passes with 0 blockers, 0 majors, 0 minors: scenes tile 0 to the end, the captions reproduce the script word for word "
  "(28 pages, widest line 838 px at 98 px), every cut sits in a pause (one accepted phrase boundary), every camera segment is continuous or marked as a cut, the six match objects keep screen position and size, "
  "nothing but sky crosses screen y 560 at any camera key, sun landings / presses / pulses sit on their words, every mandatory label is present and held >= 1.5 s, every scene has >= 5 events/s and no gap > 0.45 s between events.\n")

P('## Concept\n')
P("**Unchanged world, new spine.** The web is a city and every building is a website (its main window is a browser window with chunky chrome). PHP is the elephant-stamped blueprint most of the city is built from; "
  "each PHP building has a sand elephant plaque. The bug is a flaw in that blueprint's lock (the bolt stops short), so every door built from the plan has it, and a tiny ink beetle called Bit lives in it. "
  "Pip, the periwinkle elephant, watches from ledges. The orange sun is the anchor and a character: a power button (pressed twice: the hook and the FBI line), a 7/10 pie, a wax seal, an hours clock, a 45-minute wedge, the one sunset and the one sunrise, a 1/2 pie, and finally a clock that runs BACKWARDS.\n")
P("**The story in pictures.** Government buildings switch themselves off with a power-button sun (S01). Why: a drawing of the flawed lock shows a hand opening it with no key (S02). The flaw is in the PHP plan most of the city is built from (S03), "
  "it sat in plain sight for fourteen years (S04) until researchers with AI found it and saw how bad it was (S05). They sent the makers a heads-up (S06), but the leak hit the public board before the fix existed (S07), "
  "and hooded figures were already at the doors when Cloudflare's dome started counting: tens of thousands in forty-five minutes, millions within a day (S08). Next morning the fix is out, but somebody has to install it, one door at a time, on a whole hillside of doors (S09), "
  "and about half the street runs plaques so old they get no official support (S10). So the official advice: turn it off (S11). And some of those governments did it before there was even a fix: the plaza rewinds to that morning (S12), and the loop plays it again.\n")
P("**Scale, with restraint (BALANCE NOTE).** Three Arcane-scale peaks: the hook's Government Plaza (S01, mirrored by S12), the rooftop vista with the Cloudflare dome and the biggest sun (S08), and the hillside of doors seen from the street (S09 Part B). "
  "Two big camera moves only (the S08 crane and the S09 pull-back). Everything else is the reference-2 baseline: eye level, full bleed, one gentle 3-6% push per shot, then a locked camera so the builds read.\n")

P('## What changed from the v1 storyboard\n')
P("| v1 scene | v3 | why |\n|---|---|---|")
for a, b, c in [
    ('S01 plaza', 'S01 (re-staged) + S12', "no count ('four' pennants gone); only SOME buildings close, govC half ('a bunch of'); a far civic skyline = 'all over Europe'; press on 'shut', tags on 'purpose'; frame 0 is COLOUR"),
    ('(new)', 'S02 takeover diagram', "final_script section 6's new inset: the stakes ('take over a site without a password') shown on the plan, never on a real door"),
    ('S02 lock close-up + Blueprint Street', 'S03 (wide part only)', 'the lock close-up job moved to S02; the WordPress cue dropped; the bait gets a dry sticker gag'),
    ('S03 two steps', 'cut', "no 'two steps' lesson; its wrench tags moved to S09 ('every single server')"),
    ('S04 tower + 14 years', 'S04 (14 years only)', "the 'hard part' tower, the look to camera and 'did' are gone with the setup"),
    ('S05 found it', 'S05', "ring on 'out'; the S02 hand redraws on 'bad' (how bad it was); 'August' moves into label L6"),
    ('S06 quiet letter', 'S06 heads-up', "the makers' heads pop UP on 'heads-up'; blind stays down = 'still fixing...'"),
    ('S07 pinned for everyone', 'S07 word got out', "lens wipe on 'but'; the clock now just says 'not ready yet'; dates in label L7"),
    ('S08 dome + flood', 'S08 (re-staged)', "opens on hackers ALREADY at the doors; the dome covers about 1/5 of the city; a rooftop counter board counts from the announcement; stamps; sunset on 'within a day'"),
    ('S09 night "?"', 'cut', "no 'how many got in' line; the night is skipped, the sunrise stays (S09 opens on it)"),
    ('S10 22 million doors', 'S09 every single server', "'But even with the fix out' = the crate arrives; the pull-back lands on 'every single server'; no '22 million'"),
    ('S12 one in three', 'S10 about half', "1/2 pie; ~half the plaques old; support tags skip them; a host caretaker patches one (label L13)"),
    ('S11 shutters down', 'S11 FBI', "advisory notice L14, press on 'turn', shutter on 'it off'; the tech-support joke is a sticky note + a tiny shrug"),
    ('S13 two options + un-build', 'cut', "the loop job moves to S12's rewind (the S11 -> S01 hard cut of final_script section 6)")]:
    P(f'| {a} | {b} | {c} |')
P('')

P('## Time-of-day arc\n')
P("1. `day`: S01-S05 (S05 is high summer: the facade calendar tears to its summer page, 'August' is in L6).\n2. `golden`: S06-S07, the heads-up and the leak.\n"
  "3. S08 runs `golden` -> **dusk**: the film's one sunset, in two steps on 'within' / 'day', at screen x 700.\n4. S09 opens on the last of that dusk, then the film's one **sunrise** at the exact point the sun set (the dawn wipes in bottom-up in bright cream): the next morning, the fix is out. Then `day`.\n"
  "5. `day`: S10-S12. The S12 rewind takes the plaza back to the frame-0 morning (the sun sinks back to its mid-rise point).\n\nCaptions are ink on every sky (ink on the sage dusk is 5:1); no white page is needed. No night beat (the old S09 night is cut).\n")

P('## Scene table\n')
P('| id | words covered | est. time (s) | visual | camera | peak? |\n|---|---|---|---|---|---|')
for s in sc:
    a0, a1 = s['words']
    P(f"| {s['id']} {s['title']} | w{a0}-w{a1} \"{WORDS[a0]} ... {WORDS[a1]}\" | {R(s['start']):.2f}-{R(s['end']):.2f} ({R(s['end'])-R(s['start']):.2f}) | {VIS[s['id']]} | {CAMS[s['id']]} | {PEAK.get(s['id'], '-')} |")
P('')
P(f"**Cuts (beat-locked to the voice):** " + ', '.join(f"{s['id']} at {anS(s['start'])}" for s in sc[1:]) + ". Every cut sits in a sentence or comma pause except S04 -> S05 ('years | before', a match-cut carried by the push into the lock). "
  "S08 is the one long scene (9.8 s: one continuous crane + vista); S04, S06, S07 are short (2.1-2.4 s, reference 2's median shot is 2.2 s). Once the voice is recorded the music's tempo map is re-fitted to these cuts (`scripts/qa/beatsync.py --fit-tempo`).\n")

P('## The loop\n')
L = SB['loop']
P(f"**Device: the rewind** ({an(L['window']['t0'])} to the end). The last line, 'And some of those governments did it before there was even a fix', plays on the plaza as the shutdown left it. On 'before' the sun shows a clock face whose hands spin BACKWARDS "
  "(the rhyme of S07's forward-spinning 'not ready yet' clock), and the whole plaza rewinds: padlocks and tags pop off, the shutters roll back up in reverse order, each building pops one step lighter, the lantern relights, the far civic windows come back on in a reverse wave, "
  "Bit walks backwards along the cornice, Pip does his S01 startle hop backwards, and the camera eases back out to rest. On 'fix.' the clock face pops off (the bold power glyph is back) and the sun sinks to its frame-0 mid-rise point.\n")
P("**The seam.** The last frame IS frame 0: camera at rest arriving at zero velocity (S01's push is a sine that starts from rest), every shutter up, every screen lit, the sun at PLAZA_REST.sunFrame0 (720,950) in an anticipation squash that frame 0 releases into its rise, "
  "the far civic switch-off wave already restarting at the far left (2-3 windows), Pip sit-back on his bollard, Bit on govA's cornice, and caption page 1 rolling in (it starts at " + an(L['captionAt']) + ", 0.15 s after 'fix.' ends, and is still 24 px low at the seam; frame 0 settles it by 0.25 s). "
  "The rewind -> play turn is the story beat: on the replay, 'Governments all over Europe just shut down...' is literally the morning before the fix. Audio: the reversed whoosh / ticker and the music bed wrap across the seam; the voice gap is 0.475 s, a sentence pause.\n")
P("Why not the v1 un-build to line art: final_script.md section 6 gives the loop job to the cut back to the plaza and asks for an end frame with the shutters up and the sun mid-rise, and the BRIEF asks for a first frame that tells the story on silent autoplay. "
  "A full-colour frame 0 does that; a line-art frame 0 does not. Declined on purpose: the optional label 'most sites were back within hours to a day' (during the rewind the shutters going up mean 'earlier', not 'back online'), "
  "and showing the Makers' Lane workshop from the plaza (it would be a few px in the far city; 'no fix yet' is carried by the 'still fixing...' blind in S06 / S07 and by the rewind itself).\n")

P('## Engagement layer\n')
P(f"- **First frame.** {SB['engagement']['firstFrame']}\n- **Cover frame:** {an(SB['coverFrame'])} ({R(SB['coverFrame']):.2f} s): {SB['coverFrameNote']}\n"
  "- **Open loop:** 'on purpose' (S01) is answered by the FBI advice (S11) and the rewind (S12).\n- **Bait:** 'the language everyone loves' gets the dry sticker gag only; no mocking visual.\n"
  "- **Quotable:** 'forty-five minutes' gets the one-sweep wedge and a stamp on the board.\n")
P('**Rewatch game: find Bit in every scene.**\n\n| scene | where Bit is | the game |\n|---|---|---|')
for r in SB['engagement']['rewatchBit']:
    P(f"| {r['scene']} | {r['where']} | {r['game']} |")
P('')
P('**Pause-worthy sign jokes (small, true to the story):**\n\n| id | scene | text | when | why it is true |\n|---|---|---|---|---|')
for j in SB['engagement']['signJokes']:
    P(f"| {j['id']} | {j['scene']} | {j['text']} | {an(j['at'])} | {j['why']} |")
P('')

P('## On-screen labels (final_script.md section 6)\n')
LS = SB['labelStyle']
P(f"Style: {LS['type']}. Motion: {LS['motion']} Placement: {LS['placement']}. Hold: {LS['hold']}. Labels are in-world objects, never captions, and never in the caption band.\n")
P('| id | text (lines) | scene | in -> out | on | est. hold |\n|---|---|---|---|---|---|')
for s in sc:
    for l in s['labels']:
        P(f"| {l['id']} | {' / '.join(l['lines'])} | {s['id']} | {an(l['at'])} -> {an(l['out'])} | {l['on']} ({l['size']} px) | {R(l['out'])-R(l['at']):.1f} s |")
P("\nThe long Cloudflare credit (final_script L9) is split in-world with every word kept: 'counted from the public announcement' sits by the counter's start flag (it is what the flag means), "
  "'attempts, not break-ins' is the counter's unit line, and 'Matthew Prince, Cloudflare CEO, on X · Cloudflare's own count' is the board's footer. The L8 header holds alone 1.6 s (on the estimate) before any count appears.\n")

P('## Transitions\n')
P('| scene | in | window | match object |\n|---|---|---|---|')
for s in sc:
    tr = s['transitionIn']
    m = ', '.join(x['id'] for x in tr.get('match', [])) or '-'
    P(f"| {s['id']} | {tr['type']} | {an(tr['t0'])} -> {an(tr['t1'])} | {m} |")
P("\nInside scenes: the S09 hidden match-cut on door #4 (lock, door, window and cornice line at zoom 6). Variety: dive, hard cut, sun hop, lock match, cut on action, lens wipe, camera-continuous crane, sunset / sunrise match, tram wipe, push-through, hard cut, rewind. No fades, no flips.\n")

P('## Camera budget\n')
P("- **Big moves (2):** the S08 crane (1.3 -> 1.0, out(quart), entering at S07's exit speed) and the S09 pull-back (zoom 6 -> 1 in 2.1 s on the approved v1 curve; rows pop in as the caption floor passes them, so the far rows enter static).\n"
  "- **Exempt:** the dives S01 -> S02, S04 -> S05, S10 -> S11 (<= 0.4 s, they read as cuts and keep moving IN after the cut) and the S09 approach push that sets up the hidden match.\n"
  "- **Everything else:** one gentle 3-6% push per shot, then locked. No segment starts linear from rest; push-throughs keep moving in while decelerating; the S12 pull-back is the rewind of its own push.\n"
  "- **Sky ceiling:** at every camera key only flat sky sits above screen y 560 inside x 90-990 (linted with each scene's `ceiling` items and `sunKeys`). New framings: S02 lands the cornice at screen 695-748, S04 at 570, S11's lean stops at 1.71 so govB's lantern stays at >= 563.\n")

P('## Scenes in detail\n')
P("Beats are motion STARTS (small elements lead the word by ~0.10 s, big builds by 0.15-0.25 s; marks, presses and sun touch-downs sit ON the word). `span` in the JSON = how long a beat's staggered events run. Element positions are the shared kit's anchors (SHARED_SETS.md / SHARED_PROPS.md); numbers in brackets are their current values.\n")
for s in sc:
    P(f"### {s['id']} {s['title']} ({an(s['start'])} -> {an(s['end'])}; est {R(s['start']):.2f}-{R(s['end']):.2f})\n")
    P(f"*VO:* \"{s['vo']}\"  \n*ToD:* {s['timeOfDay']}. *In:* {s['transitionIn']['type']}. *Reuses:* {'; '.join(s['reuses']['storyboard'])}. *Sets:* {'; '.join(s['reuses']['sets'])}.\n")
    P(f"{s['setting']}\n")
    P(f"**Frame.** {s['composition']}\n")
    P('**Beats.**\n')
    for b in s['beats']:
        P(f"- `{an(b['t'])}` ({R(b['t']):.2f}): {b['action']}")
    P('')
    P('**Sky keys.** ' + '; '.join(f"{an(k['t'])} {k['tod']}" + (f" (wipe {k['wipe']}" + (f", {k['dur']} s" if k.get('dur') else '') + ')' if k.get('wipe') else '') for k in s['sky']) + '. Captions: ink throughout.  ')
    P(f"**Sun.** {s['sun']}  \n**Pip.** {s['mascot']}  \n**Bit.** {s['bit']['where']}.")
    if s['labels']:
        P('**Labels.** ' + '; '.join(f"{l['id']} '{l['text']}' on {an(l['at'])}" for l in s['labels']) + '.')
    caps = ' | '.join(' / '.join(l['text'] for l in c['lines']) + (f" [{c['highlights'][0]['text']}]" if c['highlights'] else '') for c in s['captions'])
    P(f"**Captions** (highlight in brackets): {caps}  ")
    P(f"**Sound.** " + '; '.join(f"{x['sound']} {an(x['t'])}" for x in s['sfx']) + '.')
    P(f"**Life (estimate):** {s['eventsTotal']} events in {s['est']['dur']:.2f} s = {s['est']['eventsPerSecond']}/s.\n")

P('## Life plan (QA gate 2)\n')
P('| scene | est. length | events | events/s | allow-listed holds |\n|---|---|---|---|---|')
for s in sc:
    P(f"| {s['id']} | {s['est']['dur']:.2f} s | {s['eventsTotal']} | {s['est']['eventsPerSecond']} | none |")
P("\nNo allow-listed holds: the longest gap between in-frame events is <= 0.45 s in every scene on the estimate (the dead-run limit is 0.40 s of *pixels*, and every beat's motion lasts 0.15-0.5 s, so the renders should clear it). "
  "If a render shows a dead run, add an event; do not allow-list it. Camera drift never counts as life.\n")

P('## Requests to other lanes\n')
for k, v in SB['requests'].items():
    P(f"**{k}**\n")
    for x in v:
        P(f"- {x}")
    P('')
open(f'{ROOT}/docs/storyboard_v3.md', 'w').write('\n'.join(o) + '\n')
print('wrote', len('\n'.join(o)), 'chars')
