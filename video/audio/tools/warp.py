"""Word-anchored time warp: v1 timeline (assets/vo.mp3, 70.7 s loop) -> v2 timeline (assets/vo_v2_eleven.wav).

Anchors = words that match in both ASR word lists (difflib on normalised tokens). Times in between are
interpolated linearly; the loop ends map onto each other (70.7 -> VIDEO_DUR). Temporary stand-in until the
timing stream's scripts/timewarp.py exists (then use that: same idea, refined word times; it is v1's, archived since
2026-10-29 in archive/v1/scripts/).

    python3 audio/tools/warp.py 30.64 35.6          # print mapped times
"""
from __future__ import annotations

import difflib
import json
import re
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from common import ASSETS, VIDEO_DUR  # noqa: E402

V1_LOOP = 70.7


def _tok(w):
    return re.sub(r"[^a-z0-9']", "", w.lower())


@lru_cache(None)
def anchors():
    old = json.loads((ASSETS / "vo_words_raw.json").read_text())["words"]
    new = json.loads((ASSETS / "vo_v2_words_raw.json").read_text())["words"]
    a, b = [_tok(w["w"]) for w in old], [_tok(w["w"]) for w in new]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    pts = [(0.0, 0.0)]
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            pts.append((old[blk.a + k]["s"], new[blk.b + k]["s"]))
    pts.append((V1_LOOP, VIDEO_DUR))
    pts = sorted(set(pts))
    # keep strictly increasing pairs only
    clean = [pts[0]]
    for p in pts[1:]:
        if p[0] > clean[-1][0] and p[1] > clean[-1][1]:
            clean.append(p)
    return np.array(clean)


def old_to_new(t):
    A = anchors()
    return float(np.interp(t, A[:, 0], A[:, 1]))


def new_word_time(word, nth=1):
    """Start time of the nth occurrence of `word` in the v2 raw word list."""
    new = json.loads((ASSETS / "vo_v2_words_raw.json").read_text())["words"]
    k = 0
    for w in new:
        if _tok(w["w"]) == _tok(word):
            k += 1
            if k == nth:
                return float(w["s"])
    raise KeyError(word)


if __name__ == "__main__":
    A = anchors()
    print(f"{len(A)} anchors; overall ratio {A[-2, 1] / A[-2, 0]:.4f}")
    for arg in sys.argv[1:]:
        print(f"{float(arg):7.3f} -> {old_to_new(float(arg)):7.3f}")
