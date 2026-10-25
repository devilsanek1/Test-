"""Write assets/timing_est_v3.json (same schema as assets/timing.json, flagged estimated) from est_raw.json."""
import json, re, sys
ROOT = '/home/user/Test-/video'
raw = json.load(open('est_raw.json'))
plain = open('plain.txt').read().strip()
words = plain.split()
W = raw['words']
TAIL = 0.35
FUNC = set('a an the of in on to and but or so if it its it\'s is was were be has have that this those these there they they\'re you we our their own with for at by from as like about over all just even which what where when before once some somebody someone'.split())
NUM = {'seven', 'ten', 'fourteen', 'forty-five', 'tens', 'thousands', 'millions', 'half'}
CAPS = {14, 84, 119, 131}
def nrm(w): return re.sub(r"[^a-z0-9'\-]", '', w.lower()).strip("'-")
out_words = []
for x in W:
    n = nrm(x['w'])
    st = 0.95 if x['i'] in CAPS else 0.9 if n in NUM else 0.0 if n in FUNC else 0.6
    out_words.append({'i': x['i'], 'w': x['w'], 's': x['s'], 'e': x['e'], 'stress': st})
pauses = []
for k, (kind, dur) in sorted(((int(k), v) for k, v in raw['pauses'].items())):
    s = W[k]['e']; e = W[k + 1]['s']
    pauses.append({'s': round(s, 3), 'e': round(e, 3), 'dur': round(e - s, 3), 'after': k, 'kind': kind})
sent = []
a = 0
for i, w in enumerate(words):
    if w.endswith('.'):
        sent.append({'text': ' '.join(words[a:i + 1]), 's': W[a]['s'], 'e': W[i]['e'], 'words': [a, i]})
        a = i + 1
voEnd = W[-1]['e']
dur = round(voEnd + TAIL, 3)
hits = [{'i': x['i'], 'w': x['w'], 's': x['s'], 'stress': x['stress'], 'number': nrm(x['w']) in NUM} for x in out_words if x['stress'] >= 0.9]
caps = json.load(open('caption_pages.json')) if len(sys.argv) > 1 else []
T = {
    'estimated': True,
    'note': 'ESTIMATED timeline for the v3 script (docs/script/final_script.md section 1). The voiceover has not been recorded. '
            'Word durations and pauses come from the previous ElevenLabs take (assets/timing.json, 77.76 s). Replace this file with '
            'the measured timing of the new take; everything in docs/storyboard_v3.json is anchored to word indices, so nothing else changes.',
    'source': 'assets/timing.json (ElevenLabs v2 take: per-word durations, sentence / comma pause medians)',
    'method': {
        'wordDuration': 'median measured duration of the same word in the v2 take (mid-sentence occurrences); otherwise a + b * syllables fitted on the v2 take '
                        f"(a = {raw['params']['a']:.4f} s, b = {raw['params']['b']:.4f} s per syllable); floor 0.09 s",
        'finalLengthening': f"x {raw['params']['pre_ratio']:.3f} on the word before a pause (measured median in the v2 take)",
        'stressedWords': 'x 1.12 on the cued CAPS words (PURPOSE, ALREADY, STILL, HALF)',
        'pauses': f"sentence {raw['params']['sent_pause']:.3f} s and comma {raw['params']['comma_pause']:.3f} s (v2 medians); the cued ellipsis after 'PHP' 0.36 s; "
                  "'announced,' and 'off,' 0.20 s (the cues ask for a breath, not a pause)",
        'leadIn': raw['params']['lead_in'], 'tail': TAIL,
        'tailWhy': 'tail + leadIn = 0.475 s, about a sentence pause, so the loop seam sounds like the next sentence',
        'stress': 'heuristic (cued CAPS 0.95, numbers 0.9, content words 0.6, function words 0), not measured',
        'check': 'final_script.md predicts about 56 s for the recorded voice; this estimate gives ' + f'{dur:.2f} s',
    },
    'script': 'docs/script/final_script.md section 1 (plain script, 178 words); word i = wordsRef.split()[i]',
    'wordsRef': plain,
    'duration': dur, 'decodedDuration': dur,
    'voStart': round(raw['params']['lead_in'], 3), 'voEnd': round(voEnd, 3),
    'words': out_words, 'pauses': pauses, 'sentences': sent, 'captions': caps, 'hits': hits,
    'leadIn': {'s': 0.0, 'e': round(raw['params']['lead_in'], 3)}, 'tail': {'s': round(voEnd, 3), 'e': dur},
}
json.dump(T, open(f'{ROOT}/assets/timing_est_v3.json', 'w'), indent=1)
print('duration', dur, 'pauses', len(pauses), 'sentences', len(sent), 'captions', len(caps))
