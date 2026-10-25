import json, copy, re, sys
from sb_common import *
from sb_s01_s04 import S01, S02, S03, S04
from sb_s05_s08 import S05, S06, S07
from sb_s08 import S08
from sb_s09_s12 import S09, S10, S11, S12

OLD = json.load(open(f'{ROOT}/docs/storyboard.json'))
scenes = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12]
from patch import apply, apply2
apply(scenes)
apply2(scenes)
for s in scenes:
    tr = s['transitionIn']
    tr['dur'] = round(est(tr['t1']) - est(tr['t0']), 2)
    s['est'] = {'start': est(s['start']), 'end': est(s['end']), 'dur': round(est(s['end']) - est(s['start']), 2), 'note': 'informational, from assets/timing_est_v3.json; author against the anchors'}
    s['eventsTotal'] = sum(b['events'] for b in s['beats'])
    s['est']['eventsPerSecond'] = round(s['eventsTotal'] / s['est']['dur'], 1)

mascot = copy.deepcopy(OLD['mascot'])
mascot['design'] = mascot['design'].replace("Size: scale 1.0 (~96 px sitting) in the three vistas (S01, S08, S10 Part B)", "Size: scale 1.0 (~96 px sitting) in the vistas (S01, S08, S09 Part B, S12)")
mascot['design'] = mascot['design'].replace("Exactly ONE look to camera in the film (S04 'right?').", "No look to camera in v3 (the 'right?' beat is gone with the two-steps setup).")
mascot['design'] = mascot['design'].replace("Poses used, all from docs/mascot.md: sit-back, sit-front, stand-side, walk-side, trunk-up, hold, ears-cover, sleep.", "Poses used, all from docs/mascot.md: sit-back, sit-front, stand-side, walk-side, trunk-up, hold, ears-cover, sleep, shrug.")
mascot['design'] = mascot['design'].replace("Props: Flashlight (S09) and NewLock (S10) are authored by those scene builders in their own folders through the prop API; the S07 flyer is a scene overlay over the sit-front head bounds, not a prop; the S11 nod is a sit-back squash pulse.",
                                            "Props: NewLockIcon (S09, props lane); the S07 flyer is a scene overlay over the sit-front head bounds, not a prop; the S12 nod and the S09 sigh are sit-back squash pulses.")
mascot['design'] = mascot['design'].replace("a sand-shelled snail (running gag S09-S11)", "a sand-shelled snail (running gag S09, S11)")

band = copy.deepcopy(OLD['captionBand'])
band['acceptedWide'] = []
band['note'] = "Every v3 line fits 850 px at 98 px (widest: 'already trying to use it.' 838 px). Two lines max, one highlight max, pages >= 1.4 s except the accepted short pages. Labels never enter the band (y 280-570): they live at screen y 600-1480, x 90-930."

ROOTD = {
    'version': 'v3',
    'title': 'php2shell storyboard v3 (word-anchored, re-mapped onto docs/script/final_script.md)',
    'wordsRef': T['wordsRef'],
    'anchorRule': "Every time is {w, dt}: t = words[w].s + dt, with words from the VO timing file (assets/timing_est_v3.json until the new voiceover is recorded, then the measured timing of that take); w is the 0-based index into wordsRef.split() (whitespace split, punctuation attached; 178 words). "
                  "The film starts 0.125 s before word 0 (trim the take's lead-in to the v2 take's 0.125 s), so S01.start = {w:0, dt:-0.125} = 0 s. The film ends 0.35 s after the last word ends (tail): duration = {w:177, dt:" + str(END_DT) + "} on the estimate; after recording use voEnd + 0.35 s. "
                  "Durations (transitionIn.dur, motion lengths in prose) are seconds and do not move with the voice; transitionIn.dur and every 'est' block are informational (computed on the estimate).",
    'timingFile': 'assets/timing_est_v3.json (estimated: true)',
    'fps': 30,
    'duration': END,
    'est': {'duration': T['duration'], 'scenes': len(scenes), 'note': 'informational'},
    'timeline': "v3 (word-anchored). No seconds anywhere except durations and the informational 'est' blocks. To get seconds: resolve each {w, dt} against the timing file named in timingFile. The v1/v2 storyboard (docs/storyboard.json) and scripts/timewarp.py no longer apply to this file.",
    'mascot': mascot,
    'captionBand': band,
    'labelStyle': {
        'what': "On-screen labels from final_script.md section 6 (never voiced). Small, legible, in-world: tags on strings, cards and slips pinned or clipped to surfaces, a notice with pins, an A-frame sign, a counter board with stamps.",
        'type': "CaptionHand (Patrick Hand) at 34-40 px on screen (fine print 28-32 px, only on the S08 board footer and the S10 sign); ink #2B1B0F on cream paper (palette cream), 2.2 px ink outline, fill misregistered 3 px (props rule), corners slightly soft, a pin dot / string / clip / tape as the attachment",
        'motion': "in: pop with the 7% spring (0.2 s), hanging tags add the pendulum (-16 -> 0 deg, 0.5 s), stamps slam (ink ring 0.13 s, print 2.6x -> 1.0x in 0.27 s, motion spec #15), cards can paper-flip to new text (0.2 s, swap at edge-on). out: 1-frame shrink pop or carried off by the camera / the next cut. Never a fade.",
        'placement': 'screen x 90-930, y 600-1480 (under the caption band, above the bottom UI, left of the right rail); never over the focal event of the word they sit on',
        'hold': 'on screen >= 1.5 s (the S08 header holds >= 1.5 s alone before any counter appears); longer labels get more (>= 0.25 s per word is the target)',
        'numerals': 'labels may carry numbers and names (they are the source notes); the ART still carries no text or numerals outside labels and the three sign jokes',
        'mandatory': ['L4 (W3Techs denominator)', 'L8 (Cloudflare 1 in 5, before the counters)', 'L9 (credit: split in-world into L9a / L9b / L9c, words kept)', 'L13 (rough estimate)'],
    },
    'engagement': {
        'firstFrame': "Frame 0 is full colour (no line-art frame): government buildings whose windows are browser windows, all lit; a big orange sun carrying a bold power-button glyph; the far civic skyline already switching off at the left. On silent autoplay it reads 'government websites + a power button + lights going out' before a word is heard.",
        'rewatchBit': [{'scene': s['id'], 'where': s['bit']['where'], 'game': s['bit']['game']} for s in scenes],
        'signJokes': [j | {'scene': s['id']} for s in scenes for j in s.get('signJokes', [])],
        'loop': "The last line rewinds the plaza to the morning before the fix (S12), so the replay of S01 IS 'some of those governments did it before there was even a fix'. Seamless: the camera, sun, shutters, Pip, Bit and caption end exactly in the frame-0 state.",
        'baitAndHooks': "Bait line 'the language everyone loves' gets a dry sticker gag ('I [heart] PHP' + a scribbled '?'), never a mocking visual; 'forty-five minutes' gets the one-sweep wedge + a stamp; the open loop 'on purpose' (S01) is closed by the FBI advice (S11) and the rewind (S12).",
    },
    'loop': {
        'device': 'rewind (replaces the v1 S13 un-build)',
        'window': {'t0': A(172, -0.05), 't1': END},
        'endState': "S12's last frame = frame 0: camera at rest (540,960,1.0) arriving at zero velocity; every shutter up, padlocks and tags gone, screens lit, lantern on; far civic skyline lit except the first 2-3 windows of the restarting switch-off wave; the sun at PLAZA_REST.sunFrame0 (720,950) r155 with the bold glyph, in an anticipation squash; Pip sit-back on PLAZA.pip; Bit on PLAZA.bit.",
        'seam': "Frame 0 is 'end + 1 frame': the sun releases its squash and rises (anticipation -> action), the camera's sine push starts from rest, the far wave continues, and caption page 1 finishes its last 24 px of roll (it started at captionAt). The rewind -> play turn is the story beat; nothing jumps.",
        'captionAt': A(177, 0.52),
        'captionNote': "The last page stays until 'fix.' has ended, then rolls to page 1 (A(177,0.52) = 0.15 s after the estimated end of 'fix.'; after recording use the word's end + 0.15 s).",
        'audio': 'The reversed whoosh / ticker of the rewind and the music bed wrap across the seam; the VO gap at the seam = tail 0.35 s + lead-in 0.125 s, about a sentence pause.',
        'story': "The film ends on 'before there was even a fix' and restarts on 'Governments all over Europe just shut down...': the replay shows them doing it.",
    },
    'coverFrame': A(13, 0.0),
    'coverFrameNote': "'on': three buildings shuttered and dark, govD lit, padlocks popping, the sun just pressed (platform cover).",
    'acceptedShortPages': ['how bad it was.', 'they saw / tens of thousands'],
    'acceptedShortScenes': ['S04', 'S05', 'S06', 'S07'],
    'acceptedShortScenesWhy': 'TikTok pacing (reference 2 median shot 2.2 s); each is one idea with its own set and a strong in-frame build',
    'acceptedLongScenes': ['S08'],
    'acceptedLongScenesWhy': "S08 is one continuous crane + vista (PEAK 2) covering 'already trying to use it' and the whole Cloudflare sentence; the cut inside it would break the reveal. Builders may split it into two components at the sentence boundary A(89,-0.25) without a visible cut.",
    'acceptedPhraseBoundaries': ['S05'],
    'acceptedPhraseBoundariesWhy': "'fourteen years | before researchers': the push into the lock carries the cut (a match-cut on motion), like v1's S05/S06 cut on action.",
    'holds': [],
    'holdsNote': 'No allow-listed holds: every scene keeps beats <= 0.45 s apart. If a render shows a dead run anyway, fix it with an event, not the allow-list.',
    'requests': {
        'sets': [
            "GovernmentPlaza: `farCivic` far civic skyline in the gap (6-8 fill-only domes / pediments / clock spires in the two haze tiers, >= 3 px window dots) with `civicOffAt` (left-to-right wave) and `civicOnAt` (reverse wave) for the S12 rewind; no pennants count (omit pennantsAt).",
            "GovernmentPlaza: rewind support on the per-building events: shutter `liftAt` (reversed slam), lights back on (`onAt`, one step lighter), padlock / tag `outAt`; govC partial shutter (stops at 0.5).",
            "BlueprintStreet: the title-block card at the plan's bottom-right corner (world x 490-930, y 1320-1450) as a label slot (L3 -> L4 paper flip).",
            "DomeCity: `dome` prop to re-scale the dome to one far district: feet (180,1080) and (600,1080), apex (390,830) (~1/5 of the visible city); watchtower at the dome's right foot (x 600-650, cabin top ~880) silhouetted against the sun; observer off; rattler-door anchors along rows 2-3 across the width.",
            'TelephoneWires: WIRES.S08 ends at a rooftop pole at x 540 on our parapet (the counter board must stay clear).',
            "MakersLane / Workshop: `blindSign` slot on the shop-window blind ('still fixing...') for S06 and the S07 corner preset.",
            "OldQuarter: `noticeSign` slot (A-frame on the left pavement, world 70-500 x 1290-1478); second-row plaques with an `old` mask (5 of 9, alternating); support-tag slots on the plaques.",
            'BlueprintWall: a clean top margin on the sheet (no grid above world y ~760) so the S02 tight framing and the L6 slip read.'],
        'props': [
            'LabelTag (new): tag (string) / card (pin) / slip (clip) / notice (4 pins) / sign (A-frame) / stamp; `at`, `outAt`, `flipTo` (paper flip to new text), `swing`; CaptionHand 28-40 px; see labelStyle.',
            'CounterBoard (new, S08): rooftop sign board with a shield-dome emblem, header slot, start flag + note, rolling counter (`startAt`, never settles), two stamp slots (`stamps: [{at, text}]`), footer fine print; `riseAt`.',
            'DiagramHand (new, S02 + S05 callback): a bare hand drawn in DASHED ink, no fill; `enterAt`, `turnAt`, `exitAt`; plus KeyCross (key glyph + ink cross) and SiteIcon (schematic website house; `takenAt`: window hatching + roof flag).',
            "StickyNote (new, S11): cream note with text and `strikeAt` + `strike` substring ('and on again').",
            'Sticker (tiny, S03): "I [heart] PHP" with a drawn heart (the font has no heart glyph) and `scribbleAt` for the "?".',
            'HoursClock: negative `turns` (backward spin) for the S12 rewind. SunPie: n=2 cream=1 (the 1/2 pie). RollerShutter: `stopAt` fraction (govC half). Keeper Part B speck walk door-to-door.'],
        'engine': [
            "A resolver for {w, dt} anchors (gen-scenes / gen-captions from docs/storyboard_v3.json + the timing file in timingFile). The old docs/storyboard_v2voice.json / timewarp path is retired for v3.",
            "Caption loop seam as in v1: frame 0 shows page 1 24 px low and settles it by 0.25 s (the roll starts at loop.captionAt).",
            'Labels are scene-owned props (LabelTag); captions never render them.'],
        'sound': ["Rewind sound = existing whoosh_soft + counter_ticker played REVERSED (no new file needed).", 'Re-fit the music tempo map to the v3 cut list once the voice is recorded (scripts/qa/beatsync.py --fit-tempo).'],
        'voice': ["Record the cued script (final_script_elevenlabs.txt); then replace assets/timing_est_v3.json with the measured timing (same schema) and re-run the resolver: nothing in the storyboard changes."],
    },
    'scenes': scenes,
}
json.dump(ROOTD, open(f'{ROOT}/docs/storyboard_v3.json', 'w'), indent=1, ensure_ascii=False)
print('wrote docs/storyboard_v3.json')
