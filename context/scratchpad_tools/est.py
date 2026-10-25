"""Estimate word timings for the v3 script from the previous ElevenLabs take's measured pace (assets/timing.json)."""
import json, re, statistics as st, sys
import numpy as np
ROOT = '/home/user/Test-/video'
d = json.load(open(f'{ROOT}/assets/timing.json'))
W = d['words']; P = d['pauses']
pa = {p['after']: p for p in P}
plain = open(sys.argv[1]).read().strip()
words = plain.split()
assert len(words) == 178, len(words)

def norm(w): return re.sub(r"[^a-z0-9']", '', w.lower().replace('’', "'"))
SPECIAL_SYL = {'php': 3, 'ai': 2, 'fbi': 3, 'forty-five': 3, 'heads-up': 2, "support's": 2, "they're": 1,
               "can't": 1, "it's": 1, 'everyone': 3, 'governments': 3, 'europe': 2, 'officially': 5, 'anymore': 3,
               'researchers': 3, 'announced': 2, 'basically': 4, 'something': 2, 'somebody': 3, 'supported': 3,
               'cloudflare': 2, 'hackers': 2, 'purpose': 2, 'password': 2, 'versions': 2, 'single': 2, 'server': 2,
               'everything': 3, 'already': 3, 'thousands': 2, 'attempts': 2, 'minutes': 2, 'millions': 2,
               'fourteen': 2, 'figured': 2, 'websites': 2, 'language': 2, 'update': 2, 'install': 2}
def syl(w):
    n = norm(w)
    if n in SPECIAL_SYL: return SPECIAL_SYL[n]
    if n.isdigit(): return {'7': 2, '10': 1, '14': 2, '45': 3, '22': 3}.get(n, 2)
    g = re.findall(r'[aeiouy]+', n)
    k = len(g)
    if n.endswith('e') and not n.endswith(('le', 'ee')) and k > 1: k -= 1
    return max(1, k)

# measured: duration of each old word (s to next onset; pre-pause words end at the pause)
X = np.array([syl(x['w']) for x in W if x['i'] not in pa])
Y = np.array([x['e'] - x['s'] for x in W if x['i'] not in pa])
b, a = np.polyfit(X, Y, 1)
lookup = {}
for x in W:
    if x['i'] in pa: continue
    lookup.setdefault(norm(x['w']), []).append(x['e'] - x['s'])
pre_ratio = st.median([(x['e'] - x['s']) / (a + b * syl(x['w'])) for x in W if x['i'] in pa])
sent_pause = st.median([p['dur'] for p in P if p['kind'] == 'sentence'])
comma_pause = st.median([p['dur'] for p in P if p['kind'] == 'comma'])

CAPS = {14: 'PURPOSE', 84: 'ALREADY', 119: 'STILL', 131: 'HALF'}  # cued-script stress words (plain indices)
# pauses after word index: kind, dur (cue-specific notes from final_script.md section 2)
pauses = {}
for i, w in enumerate(words):
    if w.endswith('.'): pauses[i] = ('sentence', sent_pause)
    elif w.endswith(','): pauses[i] = ('comma', comma_pause)
pauses[31] = ('ellipsis', 0.36)    # "PHP…" in the cued script: "tiny pause after PHP" (comma + ~0.1 s)
pauses[95] = ('comma', 0.20)       # "announced," : "a breath, not a dramatic pause"
pauses[156] = ('comma', 0.20)      # "off, which" : "a small breath"
pauses.pop(177, None)              # last word: the tail follows
lead_in = W[0]['s']                # 0.125: the old take's first onset
out = []
t = lead_in
for i, w in enumerate(words):
    n = norm(w)
    if n in lookup and i not in pauses:
        dur = st.median(lookup[n])
        src = 'measured'
    else:
        dur = a + b * syl(w)
        src = 'model'
        if n in lookup:  # pre-pause: measured mid-sentence value x final lengthening
            dur = st.median(lookup[n]); src = 'measured'
    dur = max(dur, 0.09)             # ASR-glitch floor (the old take has 0.05 s 'They' / 'if')
    if i in pauses or i == 177: dur *= pre_ratio
    if i in CAPS: dur *= 1.12
    out.append({'i': i, 'w': w, 's': round(t, 3), 'e': round(t + dur, 3), 'syl': syl(w), 'src': src})
    t += dur
    if i in pauses: t += pauses[i][1]
voEnd = out[-1]['e']
print('voEnd', voEnd, 'a', a, 'b', b, 'pre', pre_ratio, 'sent', sent_pause, 'comma', comma_pause)
json.dump({'words': out, 'pauses': {str(k): v for k, v in pauses.items()}, 'params': {'a': a, 'b': b, 'pre_ratio': pre_ratio,
          'sent_pause': sent_pause, 'comma_pause': comma_pause, 'lead_in': lead_in}}, open(sys.argv[2], 'w'), indent=1)
