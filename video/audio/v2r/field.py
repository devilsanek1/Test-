#!/usr/bin/env python3
"""Video 2's world air is composed from CC0 field-recording GRAINS (review item 6: "compose the canal from CC0
field-recording grains, as the score does with CC0 instruments"): water laps, birds, a far city, a parkway, a
fountain, leaves, a narrowboat engine, the life on screen. bed.py cuts short grains and excerpts from them and places
every one by script (its own times, levels, pans, filters): the ambience is composed for this film, no recording plays
as it was made. Nothing here is committed: `python3 audio/v2r/field.py` fetches the freesound.org hq previews into
$SOUND_SAMPLES/field/<id>/ and checks each file's sha256 (the pages were checked for "CC0 1.0" when chosen).

    python3 audio/v2r/field.py           # fetch + verify (needs network once); bed.py then reads the local copies

Licence: every recording below is Creative Commons 0 1.0 (public domain dedication); credits are listed anyway
(docs/v2/SOUND.md). Downloaded files are data: decoded by ffmpeg, never executed.
"""
from __future__ import annotations

import hashlib
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dsp import SR, np as _np, bp, lp, hp, n_of, rng  # noqa: E402,F401
from common import SAMPLES  # noqa: E402

FIELD = SAMPLES / "field"

# id: (freesound user, title, sha256 of the hq preview mp3) -- all CC0 1.0 (creativecommons.org/publicdomain/zero/1.0)
MANIFEST = {
    426894: ("danner", "Ambience_Berlin_Rooftop.wav", "ca2fe93c62c616a2cfce970621326f1deb1cb635ff6d6c2f2ff73473001b0fa6"),
    208502: ("monotraum", "highway, atmo, distant.wav", "8b0f98a49e13f2738a0cc78e62eb5839ebdcf03c23cdff1aa27c5d100b2b7405"),
    154946: ("Spectrm", "Distant Highway Ambient.wav", "2201949988d18382fd775f5a64e338a38cebda816ffcf75d5d296e497137cf71"),
    758858: ("Alex_hears_things", "Small Boat Wake on River lapping under Wooden Boardwalk",
             "cf4a9f52da1e40368b054b8847a9aa95b558a84457595630150e76899a619bb6"),
    318064: ("ceich93", "Water_Lapping_River.wav", "633f65aa915de7c83aca9d6100cb6a497000f4e39c36b6bef9cdefed06612313"),
    352356: ("Alex_hears_things", "Gentle small waves lapping on shore.wav",
             "768a4f8b84223ee73fb9435e19e48ee6653413b836393327136b9334258ed006"),
    480838: ("craigsmith", "R23-36-Water Against Wooden Boat.wav",
             "6cc2638df8b7a8f90aa07bce3097baad19fca91e2881775d5016a8f8cf6a0a45"),
    418425: ("naturenotesuk", "Robin singing", "89aa04563c24eea80757863a57ab0d7da37cd4d0bae1bf0b55dbe0f28f0156da"),
    409145: ("baryy", "London Birds", "81a3e872676c5b367f11a06649d3055d567aada6ddb124ffe03b6154adef4673"),
    853671: ("hoshisato", "The song of an Eurasian Wren", "0c92348a1e09e6d57a1cb107671fe8c3ccdc980077383502b6e27511221316c3"),
    479589: ("craigsmith", "R01-28-Pigeon Coos.wav", "def39b530785583f7d9bd5cf91b47b1f4db9a2edaeda5f15efb06beda38a23eb"),
    147594: ("kvgarlic", "CardinalSingingLateFebruary2012.wav",
             "39b438836c61033fbe95b5c4c48eaa00c9943b92fa0c1c2ad597c8a774f2a1d4"),
    616969: ("TRP", "210504 American Robin, dawn song close, roof, urban residential, TORONTO 5am.wav",
             "c0db859c40f9157abfa98b804b2172166d25b7243d1dbf1b4f0b342d6936e6be"),
    626652: ("Epease123", "Bird Sounds, Fran Ulher Natural Area, Bowie MD 4, 2, 2022.wav",
             "0ed55dea14801ce7ed937ba08767c72c1614256dc12af78e5ed9e8fab31d8a7d"),
    263104: ("pillonoise", "mallard and mandarin ducks (with take off)",
             "54a5da4b72373a83985e62b6ae4dd4f621bc1d27fa6da500fba997b5fa4e9d7f"),
    73497: ("nigelcoop", "Gull.wav", "596bd9f4f2f9bddd22dd2a32e9ac2c7ebe64b30106adb19a60b4635f5eabc202"),
    347557: ("Kinoton", "Rustling leaves", "d2a9153de04d462b05e58268f9fd41b6dcd44af64ccc5e46350293fdc484b656"),
    611827: ("AKFeniks", "Dog Collar Jingling.mp3", "30f47b236b7ac5e7deece9e860afb73916869dfbd628d46c56863fd58543e6b1"),
    138247: ("Hupguy", "Bus Passing.wav", "1cbd89fa2c723f05d0dd672f9d80f85d4f419fa25e7ee800a61a761284399b7d"),
    276001: ("beskhu", "Bicycle passing.aif", "c8959e2ac59dd67000795284c7af7f4c3bfbc954fe5e0391bc88b24a0dd73614"),
    156996: ("donkpow", "Freewheel clicks.wav", "fc3b6c2357ddb6f176d0d3557f2f230ad0734d0f7e95984cd267aaa98c3829b3"),
    576577: ("gazbooth", "narrowboat celestine engine.mp3",
             "553254e9cb39614722f76c71d8cfda36178a8653f8e016eeef3631b151e83dc9"),
    415027: ("roman_cgr", "small fountain", "316e6430f6b6d7881c49ed93e762cef74288a2b8e74cf352d95ca154561f8ee8"),
}


def preview_url(i, user_id):
    return f"https://cdn.freesound.org/previews/{i // 1000}/{i}_{user_id}-hq.mp3"


def path(i):
    return FIELD / str(i) / f"{i}-hq.mp3"


def verify(i):
    p = path(i)
    if not p.exists():
        return False
    return hashlib.sha256(p.read_bytes()).hexdigest() == MANIFEST[i][2]


def fetch():
    """download every preview (the user id is read from the sound page) and verify it."""
    import re
    bad = []
    for i, (user, title, sha) in MANIFEST.items():
        if verify(i):
            continue
        d = FIELD / str(i); d.mkdir(parents=True, exist_ok=True)
        page = subprocess.run(["curl", "-sS", "-m", "30", f"https://freesound.org/people/{user}/sounds/{i}/"],
                              capture_output=True, text=True).stdout
        if "creativecommons.org/publicdomain/zero/1.0" not in page:
            bad.append((i, "licence not CC0 on the page")); continue
        m = re.search(r'data-mp3="(https://cdn\.freesound\.org/previews/[^"]+)-lq\.mp3"', page)
        url = m.group(1) + "-hq.mp3" if m else None
        if url:
            subprocess.run(["curl", "-sS", "-m", "120", "-o", str(path(i)), url], check=False)
        if not verify(i):
            bad.append((i, "sha256 mismatch or download failed"))
    return bad


_CACHE = {}


def load(i, mono=False):
    """decode a recording to 48 kHz float (stereo, or mono = the mean); cached as .npy next to the mp3."""
    key = (i, mono)
    if key in _CACHE:
        return _CACHE[key]
    p = path(i)
    if not p.exists():
        raise FileNotFoundError(f"field recording {i} missing: run `python3 audio/v2r/field.py` ({p})")
    npy = p.with_suffix(".f32.npy")
    if npy.exists():
        x = np.load(npy).astype(np.float64)
    else:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                             capture_output=True, check=True).stdout
        x32 = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)
        np.save(npy, x32)
        x = x32.astype(np.float64)
    if mono:
        x = x.mean(axis=1)
    _CACHE[key] = x
    return x


def cut(x, a, b, fade=0.01):
    """a grain: x[a:b] (seconds) with raised-cosine fades."""
    y = x[n_of(a): n_of(b)].copy()
    f = min(len(y) // 3, n_of(fade))
    if f > 0:
        w = np.sin(0.5 * np.pi * np.linspace(0, 1, f)) ** 2
        if y.ndim == 2:
            w = w[:, None]
        y[:f] *= w
        y[-f:] *= w[::-1]
    return y


def env_db(m, win=0.02, hop=0.01):
    w, h = n_of(win), n_of(hop)
    c = np.concatenate([[0.0], np.cumsum(m ** 2)])
    idx = np.arange(0, max(1, len(m) - w), h)
    return (idx + w / 2) / SR, 10 * np.log10((c[idx + w] - c[idx]) / w + 1e-20)


def events(x, lo=150.0, hi=4000.0, rise_db=6.0, min_gap=0.25, pre=0.03, post=0.6, span=None):
    """onset-detected events (a lap, a call, a coo): where the band level rises >= `rise_db` over its local floor;
    returns [(start, end, peak_db)] in seconds, end where the level falls back near the floor (<= post)."""
    m = x.mean(axis=1) if x.ndim == 2 else x
    b = bp(m, lo, hi, 2)
    t, e = env_db(b)
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    floor = uniform_filter1d(minimum_filter1d(e, 150), 150)
    above = e - floor
    out = []; i = 0; last = -1e9
    while i < len(e):
        if above[i] >= rise_db and t[i] - last >= min_gap and (span is None or span[0] <= t[i] <= span[1]):
            j = i
            while j < len(e) - 1 and (above[j] > rise_db * 0.35) and t[j] - t[i] < post:
                j += 1
            pk = float(e[i:j + 1].max())
            out.append((max(0.0, t[i] - pre), t[j] + 0.02, pk))
            last = t[i]; i = j + 1
        else:
            i += 1
    return out


def loop_excerpt(x, a, dur, n, xfade=1.0):
    """a circular bed of exactly n samples from x[a: a + dur + xfade]: the extra second crossfades (equal power) into
    the start, so it loops with no seam."""
    seg = x[n_of(a): n_of(a + dur + xfade)].copy()
    if len(seg) < n_of(dur + xfade):
        seg = np.concatenate([seg, x[: n_of(dur + xfade) - len(seg)]])
    core = seg[: n_of(dur)].copy(); tail = seg[n_of(dur):]
    f = len(tail)
    w = np.sin(0.5 * np.pi * np.linspace(0, 1, f))
    if core.ndim == 2:
        w = w[:, None]
    core[:f] = core[:f] * w + tail * np.sqrt(1 - w ** 2)
    if len(core) >= n:
        return core[:n]
    reps = int(np.ceil(n / len(core)))
    return np.concatenate([core] * reps)[:n]


if __name__ == "__main__":
    bad = fetch()
    ok = [i for i in MANIFEST if verify(i)]
    print(f"{len(ok)} / {len(MANIFEST)} field recordings verified in {FIELD}")
    for b in bad:
        print("  FAILED", b)
    sys.exit(1 if bad else 0)
