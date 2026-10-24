#!/usr/bin/env python3
"""Estimate a word timeline for a script that has NOT been recorded yet, from a recorded take's measured pace.

  python3 scripts/anchor/estimate_timing.py                      # -> assets/timing_est_v3.json (v3 final script)
  python3 scripts/anchor/estimate_timing.py --pace-from assets/timing_v1.json -o /tmp/est_v1pace.json
  python3 scripts/anchor/estimate_timing.py --dry-run             # print the summary only

Inputs (defaults):
  --script     docs/script/final_script.md            its "## 1. Plain script" section = the words (wordsRef)
  --cued       docs/script/final_script_elevenlabs.txt the paste text: CAPS stress words + the ellipsis after "PHP"
  --pace-from  assets/timing.json                     the previous ElevenLabs take (v2, measured word starts/ends)

Model (all numbers measured on --pace-from, printed with --verbose and stored under "estimate"):
  * word SLOT = time from a word's start to the next word's start (connected speech), or to its energy end when
    punctuation follows (then a pause comes). Slot = a + b * syllables + c * function_word (least squares), plus the
    mean residual of its (syllables, content/function) bucket, shrunk toward 0 with k = 5 pseudo-counts, plus the
    measured final lengthening before a comma / a sentence end. Letter acronyms (PHP, AI, FBI) take the measured
    mean time per spoken letter instead.
  * PAUSE after a comma / a sentence end = the measured MEAN gap after commas / sentence ends (zero gaps included, so
    the expected position of every later word is unbiased). The ellipsis after "PHP" (cued text) = the midpoint of
    the comma and the sentence pause (override: --ellipsis-pause).
  * Lead-in (first word start), voStart and the tail after the last word are copied from --pace-from.
  * stress (0-1) is a TEXT heuristic (no audio yet): cued CAPS words 1.0, numbers 0.9, function words 0.15, content
    words 0.55-0.95 (longer and phrase-final words higher). hits = stress >= 0.9 or a number.
  * captions = an automatic paging (<= 2 lines of <= 24 characters and <= 850 px at Patrick Hand 98 px, pages never
    cross a sentence end, breaks at punctuation / before conjunctions, >= 0.8 s per page, one highlight per page).
Output schema = assets/timing.json (+ "estimated": true and an "estimate" block). Pause kind "ellipsis" is new.
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import anchorlib as A  # noqa: E402

# Spoken syllables (CMU-style counts; digits as spoken). Unknown words fall back to a vowel-group heuristic.
SYL = {}
for _tok in """10:1 14:2 22:3 45:3 7:2 a:1 about:2 ai:2 all:1 already:3 and:1 announced:2 answer:2 anymore:3 anyone:3
are:1 attempts:2 august:2 bad:1 basically:3 be:1 because:2 before:2 behind:2 big:1 break-in:2 bug:1 bunch:1 but:1 by:1
came:1 can:1 can't:1 chunk:1 cloudflare:2 comes:1 company:3 copies:2 could:1 countries:2 day:1 details:2 did:1 don't:1
down:1 else:1 enough:2 europe:2 evening:2 even:2 every:2 everyone:3 everything:3 everywhere:3 except:2 fast:1 fbi:3
figured:2 find:1 finding:2 first:1 fix:1 fixing:2 for:1 forty-five:3 found:1 four:1 fourteen:2 gave:1 got:1
government:3 governments:3 hacked:1 hackers:2 hacking:2 half:1 hard:1 has:1 heads-up:2 hit:1 hope:1 hosting:2 hours:2
how:1 if:1 in:1 install:2 is:1 it:1 it's:1 just:1 knew:1 knows:1 language:2 leaked:1 like:1 loves:1 make:1 many:2
million:2 millions:2 minutes:2 nobody:3 not:1 now:1 of:1 off:1 officially:4 old:1 on:1 once:1 one:1 online:2 or:1 out:1
over:2 own:1 part:1 password:2 people:2 php:3 plus:1 programming:3 protects:2 purpose:2 quietly:3 ready:2
researchers:3 right:1 run:1 runs:1 safest:2 said:1 saw:1 says:1 security:4 server:2 seven:2 shut:1 single:2 site:1
sites:1 slow:1 so:1 some:1 somebody:3 someone:2 something:2 sorts:1 step:1 steps:1 still:1 support's:2 supported:3
switch:1 switched:1 take:1 takes:1 teams:1 tech:1 ten:1 tens:1 that:1 that's:1 the:1 their:1 them:1 themselves:2 then:1
there:1 they:1 they're:1 thing:1 think:1 this:1 those:1 thousands:2 three:1 to:1 told:1 tools:1 trying:2 turn:1 two:1
until:2 update:2 use:1 using:2 version:2 versions:2 was:1 web:1 websites:2 were:1 what:1 where:1 which:1 who:1 with:1
within:2 without:2 word:1 wordpress:2 years:1 yet:1 you:1 you'd:1""".split():
    _k, _v = _tok.rsplit(':', 1)
    SYL[_k] = int(_v)

FUNC = set("""a an the of in on to and but or so for it is was were are be by as at that this those these there their
they them then than with if you your it's that's they're can could has have had how what which who where when some all
just like not now once even own its from into until because before after while about""".split())
# break BEFORE these words is natural (captions)
BREAK_BEFORE = set("""and but because before after so which who where that if until once with within without when while
or than for in on by""".split())
# never START a caption line with these (particles / complements that belong to the previous word: "figured | out")
NO_BREAK_BEFORE = set("""out up off down of it them to""".split())
# never end a caption line on these (they lean on the next word)
GLUE = set("""a an the of to in on at by for from with their this those these that's it's some every single my your our
his her its into about like just even still has have had was were is are be can can't could would will tens""".split())
NUMBERISH = set('tens hundreds thousands millions billions hundred thousand million billion half dozen'.split())


def syllables(tok):
    k = A.base_token(tok)
    if k in SYL:
        return SYL[k]
    n = A.number_value(k)
    if n is not None and str(n) in SYL:
        return SYL[str(n)]
    if is_acronym(tok):
        return acronym_letters(tok)
    w = re.sub(r'[^a-z]', '', k)
    if not w:
        return 1
    groups = re.findall(r'[aeiouy]+', w)
    s = len(groups)
    if w.endswith('e') and not w.endswith(('le', 'ee', 'ye')) and s > 1:
        s -= 1
    if w.endswith('ed') and not w.endswith(('ted', 'ded')) and s > 1:
        s -= 1
    return max(1, s)


def is_acronym(tok):
    t = re.sub(r"[^A-Za-z]", '', tok)
    return 2 <= len(t) <= 5 and t.isupper()


def acronym_letters(tok):
    return len(re.sub(r"[^A-Za-z]", '', tok))


def is_func(tok):
    return A.base_token(tok) in FUNC


def is_number(tok):
    b = A.base_token(tok)
    return A.number_value(b) is not None or b in NUMBERISH


# ---------------------------------------------------------------- pace model

class Pace:
    """Word-slot and pause model measured on a recorded take (timing.json schema)."""

    def __init__(self, timing, shrink=5.0):
        import numpy as np
        W = timing['words']
        self.src_first = float(W[0]['s'])
        self.src_vostart = float(timing.get('voStart', W[0]['s']))
        self.src_tail = float(timing['duration']) - float(timing.get('voEnd', W[-1]['e']))
        rows = []
        for i, w in enumerate(W):
            kind = A.punct_kind(w['w'])
            nxt = W[i + 1]['s'] if i + 1 < len(W) else None
            if kind or nxt is None:
                slot, gap = w['e'] - w['s'], (nxt - w['e'] if nxt is not None else None)
            else:
                slot, gap = nxt - w['s'], None
            rows.append({'w': w['w'], 'kind': kind, 'slot': slot, 'gap': gap, 'acr': is_acronym(w['w']),
                         'syl': syllables(w['w']), 'func': is_func(w['w'])})
        self.rows = rows
        mean = lambda xs: sum(xs) / len(xs) if xs else 0.0  # noqa: E731
        self.comma_pause = mean([r['gap'] for r in rows if r['kind'] == 'comma' and r['gap'] is not None])
        self.sentence_pause = mean([r['gap'] for r in rows if r['kind'] == 'sentence' and r['gap'] is not None])
        self.ellipsis_pause = (self.comma_pause + self.sentence_pause) / 2
        self.n_comma = sum(1 for r in rows if r['kind'] == 'comma')
        self.n_sentence = sum(1 for r in rows if r['kind'] == 'sentence')
        reg = [r for r in rows if not r['acr']]
        X = np.array([[1.0, r['syl'], 1.0 if r['func'] else 0.0] for r in reg])
        y = np.array([r['slot'] for r in reg])
        self.coef = [float(c) for c in np.linalg.lstsq(X, y, rcond=None)[0]]
        lin = lambda r: self.coef[0] + self.coef[1] * r['syl'] + self.coef[2] * (1.0 if r['func'] else 0.0)  # noqa: E731
        self.final = {k: mean([r['slot'] - lin(r) for r in reg if r['kind'] == k]) for k in ('comma', 'sentence')}
        self.final['ellipsis'] = self.final['comma']
        res = {}
        for r in reg:
            res.setdefault(self.bucket(r['syl'], r['func']), []).append(r['slot'] - lin(r) - self.final.get(r['kind'], 0.0)
                                                                         if r['kind'] else r['slot'] - lin(r))
        self.bucket_adj = {b: sum(v) / (len(v) + shrink) for b, v in res.items()}
        self.bucket_n = {b: len(v) for b, v in res.items()}
        acr = [(r['slot'] - (self.final.get(r['kind'], 0.0) if r['kind'] else 0.0)) / max(1, acronym_letters(r['w']))
               for r in rows if r['acr']]
        self.per_letter = mean(acr) if acr else 0.21
        self.n_acr = len(acr)

    @staticmethod
    def bucket(syl, func):
        return f"{'func' if func else 'content'}:{min(int(syl), 4)}"

    def slot(self, tok, kind):
        if is_acronym(tok):
            base = self.per_letter * acronym_letters(tok)
        else:
            syl, func = syllables(tok), is_func(tok)
            base = self.coef[0] + self.coef[1] * syl + self.coef[2] * (1.0 if func else 0.0)
            base += self.bucket_adj.get(self.bucket(syl, func), 0.0)
        if kind:
            base += self.final.get(kind, 0.0)
        return max(0.05, base)

    def pause(self, kind):
        return {'comma': self.comma_pause, 'sentence': self.sentence_pause, 'ellipsis': self.ellipsis_pause}.get(kind, 0.0)

    def table(self):
        t = {}
        for func in (False, True):
            for syl in (1, 2, 3, 4):
                b = self.bucket(syl, func)
                if b in self.bucket_n:
                    t[b] = {'slot': round(self.coef[0] + self.coef[1] * syl + self.coef[2] * (1.0 if func else 0.0)
                                          + self.bucket_adj[b], 3), 'n': self.bucket_n[b]}
        return t


def cross_validate(timing):
    """Leave-one-sentence-out: predict each sentence's word time from the others. Returns rms of the sentence error."""
    W = timing['words']
    sents, cur = [], []
    for i, w in enumerate(W):
        cur.append(i)
        if A.punct_kind(w['w']) == 'sentence':
            sents.append(cur)
            cur = []
    if cur:
        sents.append(cur)
    errs = []
    for sidx in sents:
        keep = [i for i in range(len(W)) if i not in set(sidx)]
        sub = {'words': [W[i] for i in keep], 'duration': timing['duration'], 'voEnd': timing.get('voEnd'),
               'voStart': timing.get('voStart')}
        # the held-out sentence's real span (first start to last end) vs predicted slots
        p = Pace(sub)
        pred = sum(p.slot(W[i]['w'], A.punct_kind(W[i]['w'])) for i in sidx)
        real = W[sidx[-1]]['e'] - W[sidx[0]]['s']
        errs.append(pred - real)
    rms = (sum(e * e for e in errs) / len(errs)) ** 0.5
    return rms, sum(errs) / len(errs)


# ---------------------------------------------------------------- estimate

def stress_of(words, cued_caps):
    out = []
    n = len(words)
    for i, w in enumerate(words):
        if i in cued_caps:
            out.append(1.0)
            continue
        if is_number(w):
            out.append(0.9)
            continue
        if is_func(w):
            out.append(0.15)
            continue
        s = 0.55 + 0.1 * min(syllables(w) - 1, 2)
        # phrase-final content word (nuclear stress) and the first content word of a sentence
        j = i + 1
        while j < n and is_func(words[j]) and not A.punct_kind(words[j - 1]):
            j += 1
        if A.punct_kind(w) or (j < n and A.punct_kind(words[j - 1]) and j - 1 != i and all(is_func(x) for x in words[i + 1:j])):
            s += 0.15
        k = i - 1
        while k >= 0 and is_func(words[k]) and A.punct_kind(words[k]) != 'sentence':
            k -= 1
        if k < 0 or A.punct_kind(words[k]) == 'sentence':
            s += 0.1
        out.append(round(min(0.95, s), 2))
    return out


def estimate(words, cued, pace, pace_factor=1.0, ellipsis_pause=None):
    kinds = []
    caps = set()
    for i, (p, c) in enumerate(zip(words, cued)):
        kc, kp = A.punct_kind(c), A.punct_kind(p)
        kinds.append('ellipsis' if kc == 'ellipsis' else kp)
        letters = re.sub(r'[^A-Za-z]', '', c)
        if len(letters) >= 2 and letters.isupper() and not is_acronym(p):
            caps.add(i)
    ell = pace.ellipsis_pause if ellipsis_pause is None else ellipsis_pause
    t = pace.src_first
    out, pauses = [], []
    for i, w in enumerate(words):
        slot = pace.slot(w, kinds[i]) * pace_factor
        s = t
        if kinds[i] or i == len(words) - 1:
            e = s + slot
            pz = (ell if kinds[i] == 'ellipsis' else pace.pause(kinds[i])) * pace_factor if i < len(words) - 1 else 0.0
            t = e + pz
            if pz > 0:
                pauses.append((i, e, t, kinds[i]))
        else:
            e = s + slot
            t = e
        out.append([s, e])
    # round so connected words stay exactly contiguous
    rs = [round(s, 3) for s, _ in out]
    words_out = []
    stress = stress_of(words, caps)
    for i, w in enumerate(words):
        s = rs[i]
        e = rs[i + 1] if (i + 1 < len(words) and not kinds[i]) else round(out[i][1], 3)
        words_out.append({'i': i, 'w': w, 's': s, 'e': e, 'stress': stress[i]})
    vo_end = words_out[-1]['e']
    vo_start = round(max(0.0, words_out[0]['s'] - (pace.src_first - pace.src_vostart)), 3)
    duration = round(vo_end + pace.src_tail, 3)
    pause_rows = []
    for i, ps, pe, kind in pauses:
        a, b = words_out[i]['e'], words_out[i + 1]['s']
        if b - a >= 0.12 - 1e-9:
            pause_rows.append({'s': a, 'e': b, 'dur': round(b - a, 3), 'after': i, 'kind': kind})
    return words_out, pause_rows, vo_start, vo_end, duration, sorted(caps)


def sentences_of(words_out):
    out, start = [], 0
    for i, w in enumerate(words_out):
        if A.punct_kind(w['w']) == 'sentence' or i == len(words_out) - 1:
            seg = words_out[start:i + 1]
            out.append({'text': ' '.join(x['w'] for x in seg), 's': seg[0]['s'], 'e': seg[-1]['e'], 'words': [start, i]})
            start = i + 1
    return out


# ---------------------------------------------------------------- caption pager

def _text_width():
    try:
        from fontTools.ttLib import TTFont
        f = TTFont(os.path.join(A.ROOT, 'node_modules/@fontsource/patrick-hand/files/patrick-hand-latin-400-normal.woff'))
        cmap, hmtx, upm = f.getBestCmap(), f['hmtx'], f['head'].unitsPerEm
        return lambda s, size=98: sum(hmtx[cmap[ord(c)]][0] if ord(c) in cmap else upm * 0.5 for c in s) * size / upm
    except Exception:  # noqa: BLE001
        return None


def paginate(words_out, sentences, duration, max_chars=24, max_px=850, min_page=0.8):
    textw = _text_width()
    W = [w['w'] for w in words_out]
    S = [w['s'] for w in words_out]

    def fits(a, b):
        txt = ' '.join(W[a:b])
        return len(txt) <= max_chars and (textw is None or textw(txt) <= max_px)

    def fill(a, b):
        return ((max_chars - len(' '.join(W[a:b]))) / max_chars) ** 2 * 2.0

    def brk(k, page):
        """cost of a break after word k-1 (before word k)."""
        prev = W[k - 1]
        if A.punct_kind(prev):
            return 0.0
        if A.base_token(prev) in GLUE:
            return 15.0
        if A.base_token(W[k]) in NO_BREAK_BEFORE:
            return 12.0
        if A.base_token(W[k]) in BREAK_BEFORE:
            return 1.5 if page else 1.0
        return 5.0 if page else 3.0

    pages = []
    for sen in sentences:
        a0, b0 = sen['words'][0], sen['words'][1] + 1
        nxt_start = lambda k: S[k] if k < len(S) else duration  # noqa: E731
        best = {a0: (0.0, None)}
        for k in range(a0 + 1, b0 + 1):
            cand = None
            for j in range(a0, k):
                if j not in best:
                    continue
                # page j..k: one line or two lines
                opts = []
                if fits(j, k):
                    opts.append((fill(j, k) + 0.8, [(j, k)]))
                for m in range(j + 1, k):
                    if fits(j, m) and fits(m, k):
                        opts.append((fill(j, m) + fill(m, k) + brk(m, False), [(j, m), (m, k)]))
                if not opts:
                    continue
                c, lines = min(opts, key=lambda o: o[0])
                c += brk(k, True) if k < b0 else 0.0
                dur = nxt_start(k) - S[j]
                if dur < min_page:
                    c += 30.0
                if dur > 3.6:
                    c += (dur - 3.6) * 6
                tot = best[j][0] + c
                if cand is None or tot < cand[0]:
                    cand = (tot, (j, lines))
            if cand:
                best[k] = cand
        seq, k = [], b0
        while k != a0:
            j, lines = best[k][1]
            seq.append(lines)
            k = j
        pages.extend(reversed(seq))
    caps = []
    for pi, lines in enumerate(pages):
        a, b = lines[0][0], lines[-1][1]
        e = S[b] if b < len(S) else duration
        cand = [i for i in range(a, b) if not is_func(W[i])]
        hl = []
        if cand:
            i = max(cand, key=lambda i: (words_out[i]['stress'], -i))
            if words_out[i]['stress'] >= 0.5:
                hl = [{'text': re.sub(r"[^\w'\-]+$", '', W[i]), 's': S[i], 'i': i}]
        caps.append({'s': S[a], 'e': e, 'lines': [{'text': ' '.join(W[x:y]), 's': S[x], 'words': [x, y - 1]} for x, y in lines],
                     'words': [a, b - 1], 'highlights': hl})
    return caps


# ---------------------------------------------------------------- main

def build(script_path, cued_path, pace_path, pace_factor=1.0, ellipsis_pause=None):
    words = A.plain_script(script_path)
    cued = A.plain_script(cued_path) if cued_path and os.path.exists(cued_path) else list(words)
    if [A.key(w) for w in cued] != [A.key(w) for w in words]:
        diff, _ = A.word_diff(words, cued, 'plain script', 'cued script')
        raise SystemExit('the cued script does not have the same words as the plain script:\n' + '\n'.join(diff))
    src = A.load_json(pace_path)
    pace = Pace(src)
    words_out, pauses, vo_start, vo_end, duration, caps = estimate(words, cued, pace, pace_factor, ellipsis_pause)
    sents = sentences_of(words_out)
    captions = paginate(words_out, sents, duration)
    hits = [{'i': w['i'], 'w': w['w'], 's': w['s'], 'stress': w['stress'], 'number': is_number(w['w'])}
            for w in words_out if w['stress'] >= 0.9 or is_number(w['w'])]
    cv_rms, cv_bias = cross_validate(src)
    n_sent = len(sents)
    n_comma = sum(1 for p in pauses if p['kind'] in ('comma', 'ellipsis'))
    # 1-sigma of the total: per-sentence word-time error (cross-validated) + per-pause spread, independent
    import statistics as st
    gaps_c = [r['gap'] for r in pace.rows if r['kind'] == 'comma' and r['gap'] is not None]
    gaps_s = [r['gap'] for r in pace.rows if r['kind'] == 'sentence' and r['gap'] is not None]
    sig = (n_sent * cv_rms ** 2 + n_comma * st.pstdev(gaps_c) ** 2 + (n_sent - 1) * st.pstdev(gaps_s) ** 2) ** 0.5
    doc = {
        'duration': duration,
        'estimated': True,
        'decodedDuration': duration,
        'voStart': vo_start,
        'voEnd': vo_end,
        'words': words_out,
        'pauses': pauses,
        'sentences': sents,
        'captions': captions,
        'hits': hits,
        'leadIn': {'s': 0.0, 'e': vo_start},
        'tail': {'s': vo_end, 'e': duration},
        'estimate': {
            'note': ('ESTIMATED timeline for the unrecorded v3 script: every time here is a prediction from the measured '
                     'pace of ' + A.rel(pace_path) + '. Replace with the real timing (same schema, no "estimated") once '
                     'the voice is recorded; storyboards anchor to WORDS, so scripts/anchor/resolve.py re-times them.'),
            'script': A.rel(script_path),
            'cued': A.rel(cued_path) if cued_path else None,
            'paceFrom': A.rel(pace_path),
            'paceFactor': pace_factor,
            'generatedBy': 'scripts/anchor/estimate_timing.py',
            'words': len(words_out),
            'model': {
                'slot': 'a + b*syllables + c*function_word + bucket residual (k=5 shrink) + final lengthening; acronyms per letter',
                'coef': {'a': round(pace.coef[0], 4), 'b_per_syllable': round(pace.coef[1], 4),
                         'c_function_word': round(pace.coef[2], 4)},
                'slotBySyllables': pace.table(),
                'finalLengthening': {k: round(v, 3) for k, v in pace.final.items()},
                'acronymPerLetter': round(pace.per_letter, 3),
                'pauses': {'comma': round(pace.comma_pause, 3), 'sentence': round(pace.sentence_pause, 3),
                           'ellipsis': round(pace.ellipsis_pause if ellipsis_pause is None else ellipsis_pause, 3),
                           'measuredCommas': pace.n_comma, 'measuredSentenceEnds': pace.n_sentence},
                'leadIn': round(pace.src_first, 3), 'tail': round(pace.src_tail, 3),
            },
            'stressHeuristic': 'cued CAPS 1.0, numbers 0.9, function words 0.15, content 0.55-0.95 (no audio yet)',
            'cuedCaps': [words_out[i]['w'] for i in caps],
            'uncertainty': {'sentenceWordTimeRms': round(cv_rms, 3), 'sentenceBias': round(cv_bias, 3),
                            'totalSigma': round(sig, 2),
                            'how': 'leave-one-sentence-out on the pace source + spread of the measured pauses'},
        },
    }
    return doc, pace


def summary(doc):
    est = doc['estimate']
    m = est['model']
    out = [f"estimated duration {doc['duration']:.2f} s (voice {doc['voStart']:.3f}-{doc['voEnd']:.3f}), "
           f"{len(doc['words'])} words, {len(doc['sentences'])} sentences, {len(doc['pauses'])} pauses, "
           f"{len(doc['captions'])} caption pages (+-{est['uncertainty']['totalSigma']} s 1-sigma)",
           f"pace from {est['paceFrom']} x{est['paceFactor']}: slot = {m['coef']['a']:.3f} + {m['coef']['b_per_syllable']:.3f}*syl "
           f"{m['coef']['c_function_word']:+.3f}*func; pauses comma {m['pauses']['comma']:.3f} / sentence "
           f"{m['pauses']['sentence']:.3f} / ellipsis {m['pauses']['ellipsis']:.3f}; acronym {m['acronymPerLetter']:.3f} s/letter"]
    for s in doc['sentences']:
        out.append(f"  {s['s']:7.3f}-{s['e']:7.3f}  w{s['words'][0]:>3}-{s['words'][1]:<3} {s['text'][:70]}")
    return '\n'.join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--script', default=os.path.join(A.ROOT, 'docs/script/final_script.md'))
    ap.add_argument('--cued', default=os.path.join(A.ROOT, 'docs/script/final_script_elevenlabs.txt'))
    ap.add_argument('--pace-from', default=os.path.join(A.ROOT, 'assets/timing.json'))
    ap.add_argument('--pace', type=float, default=1.0, help='scale every slot and pause (0.9 = 10%% faster)')
    ap.add_argument('--ellipsis-pause', type=float, default=None)
    ap.add_argument('-o', '--out', default=os.path.join(A.ROOT, 'assets/timing_est_v3.json'))
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    doc, _ = build(a.script, a.cued, a.pace_from, a.pace, a.ellipsis_pause)
    print(summary(doc))
    if not a.dry_run:
        A.dump_pretty(doc, a.out)
        print(f'-> {A.rel(a.out)}')


if __name__ == '__main__':
    main()
