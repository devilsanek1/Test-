"""A small multi-sample instrument player for CC0 sample libraries (VSCO-2-CE, VCSL)
plus a SoundFont (GeneralUser GS) renderer via tinysoundfont.

Notes are rendered offline into numpy buffers; pitch shifting = resampling (soxr) from the
nearest sampled root, so every note is a real recorded instrument sound.
"""
from __future__ import annotations

import glob
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import soundfile as sf
import soxr

sys.path.insert(0, str(Path(__file__).parent))
from common import SR, SAMPLES, db2a  # noqa: E402

NOTE_RE = re.compile(r"(?<![A-Za-z])([A-G])([#b]?)(-?\d)(?![\d])")
PC = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def name_to_midi(name: str, c_octave_midi=60, middle_c_octave=4):
    """Parse the LAST note token in a filename. middle_c_octave says which octave number
    the library calls middle C (4 = scientific, 3 = Yamaha)."""
    m = NOTE_RE.findall(name)
    if not m:
        return None
    l, acc, octv = m[-1]
    p = PC[l] + (1 if acc == "#" else -1 if acc == "b" else 0)
    return 60 + p + 12 * (int(octv) - middle_c_octave)


@dataclass
class Zone:
    root: float
    vel: int  # velocity layer index (0 = softest)
    rr: int
    data: np.ndarray  # (n, 2) float32 at SR
    path: str = ""


@dataclass
class Instrument:
    name: str
    zones: list = field(default_factory=list)
    release: float = 0.25   # default note-off fade (s)
    max_len: float = 6.0    # max ring length after note-off for plucked sounds (s)
    gain_db: float = 0.0
    sustained: bool = False  # True: note length = duration (+release); False: one-shot (rings)
    _rr: dict = field(default_factory=dict)
    _cache: dict = field(default_factory=dict)

    @property
    def n_layers(self):
        return 1 + max(z.vel for z in self.zones)

    def pick(self, pitch: float, velocity: int) -> tuple[Zone, float]:
        layer = min(self.n_layers - 1, int(velocity / 128 * self.n_layers))
        cands = [z for z in self.zones if z.vel == layer] or self.zones
        best = min(abs(z.root - pitch) for z in cands)
        near = [z for z in cands if abs(abs(z.root - pitch) - best) < 1e-6]
        k = (layer, round(near[0].root, 2))
        i = self._rr.get(k, 0)
        self._rr[k] = i + 1
        z = near[i % len(near)]
        return z, pitch - z.root

    def render(self, pitch: float, velocity: int, dur: float) -> np.ndarray:
        z, shift = self.pick(pitch, velocity)
        key = (id(z), round(shift, 3))
        y = self._cache.get(key)
        if y is None:
            ratio = 2.0 ** (shift / 12.0)
            y = z.data if abs(shift) < 1e-4 else soxr.resample(z.data, SR * ratio, SR, quality="HQ").astype(np.float32)
            self._cache[key] = y
        # velocity -> gain (within a layer, +-6 dB around the layer's centre)
        nl = self.n_layers
        pos = (velocity / 127.0) * nl - min(nl - 1, int(velocity / 128 * nl))
        g = db2a(self.gain_db + (pos - 0.5) * 8.0 + (velocity / 127.0 - 0.75) * 10.0)
        if self.sustained:
            n = int((dur + self.release) * SR)
        else:
            n = int(min(dur + self.max_len, len(y) / SR) * SR)
        n = min(n, len(y))
        out = y[:n].astype(np.float64) * g
        # note-off fade
        if self.sustained:
            r0 = int(dur * SR); rl = n - r0
            if rl > 0:
                out[r0:] *= np.linspace(1, 0, rl)[:, None] ** 2
        else:
            # plucked: natural ring; damp after dur + max_len with a release fade
            rl = min(int(self.release * SR), n)
            if n < len(y):
                out[n - rl:] *= np.linspace(1, 0, rl)[:, None] ** 2
        # 2 ms fade-in guard against sample-start clicks
        f = min(96, n)
        out[:f] *= np.linspace(0, 1, f)[:, None]
        return out


def _trim_lead(x, thr_db=-50.0, pre_ms=3.0):
    a = np.abs(x).max(axis=1)
    pk = a.max() + 1e-12
    idx = np.argmax(a > pk * db2a(thr_db))
    s = max(0, idx - int(pre_ms * 1e-3 * SR))
    y = x[s:].copy()
    # fade out the last 20 ms of the file to avoid tail truncation clicks
    f = min(len(y), int(0.02 * SR))
    y[-f:] *= np.linspace(1, 0, f)[:, None]
    return y


def load_instrument(name, pattern, parse, *, normalize_layers=None, **kw) -> Instrument:
    """parse(filename) -> (root_midi, vel_layer, rr) or None to skip."""
    inst = Instrument(name=name, **kw)
    files = sorted(glob.glob(str(SAMPLES / pattern)))
    if not files:
        raise FileNotFoundError(f"no samples for {name}: {SAMPLES / pattern}")
    for f in files:
        r = parse(os.path.basename(f))
        if r is None:
            continue
        root, vel, rr = r
        x, fs = sf.read(f, dtype="float32", always_2d=True)
        if x.shape[1] == 1:
            x = np.repeat(x, 2, axis=1)
        x = x[:, :2]
        if fs != SR:
            x = soxr.resample(x, fs, SR, quality="VHQ").astype(np.float32)
        x = _trim_lead(x)
        inst.zones.append(Zone(root=float(root), vel=vel, rr=rr, data=x, path=f))
    # remap velocity layers to 0..n-1
    layers = sorted({z.vel for z in inst.zones})
    for z in inst.zones:
        z.vel = layers.index(z.vel)
    if normalize_layers is not None:
        # equalise peak per layer to a target (dB) per layer index, keeps relative tone
        for z in inst.zones:
            pk = np.abs(z.data).max() + 1e-9
            z.data = (z.data / pk * db2a(normalize_layers[min(z.vel, len(normalize_layers) - 1)])).astype(np.float32)
    return inst


def even_out(inst: Instrument, slope_db_per_semi=-0.15, win_s=0.3):
    """Equalise uneven sample sets: scale each zone so its attack RMS follows a straight line
    (per velocity layer) through the layer's median level, with a gentle natural high-note roll-off."""
    import numpy as _np
    for layer in {z.vel for z in inst.zones}:
        zs = [z for z in inst.zones if z.vel == layer]
        lv = _np.array([20 * _np.log10(_np.sqrt((z.data[: int(win_s * SR)] ** 2).mean()) + 1e-12) for z in zs])
        roots = _np.array([z.root for z in zs])
        med_l, med_r = _np.median(lv), _np.median(roots)
        for z, l in zip(zs, lv):
            target = med_l + slope_db_per_semi * (z.root - med_r)
            z.data = (z.data * db2a(target - l)).astype(_np.float32)
    inst._cache.clear()
    return inst


class Track:
    """Stereo buffer you can drop notes into."""

    def __init__(self, dur, pan=0.0):
        self.buf = np.zeros((int(dur * SR) + 1, 2))
        self.pan = pan

    def add(self, y, t, pan=None, gain_db=0.0):
        p = self.pan if pan is None else pan
        # constant-power pan on a stereo source (balance)
        th = (p + 1) * np.pi / 4
        gl, gr = np.cos(th) * np.sqrt(2), np.sin(th) * np.sqrt(2)
        i = int(round(t * SR))
        if i < 0:
            y = y[-i:]; i = 0
        n = min(len(y), len(self.buf) - i)
        if n <= 0:
            return
        g = db2a(gain_db)
        self.buf[i:i + n, 0] += y[:n, 0] * gl * g
        self.buf[i:i + n, 1] += y[:n, 1] * gr * g

    def note(self, inst: Instrument, pitch, vel, t, dur, pan=None, gain_db=0.0):
        self.add(inst.render(pitch, vel, dur), t, pan, gain_db)


# ---------------------------------------------------------------- SoundFont (GeneralUser GS)
SF2 = SAMPLES / "gugs" / "repo" / "GeneralUser-GS.sf2"


def render_sf2(notes, dur, program, bank=0, sf2=SF2, chan_gain_db=0.0, is_drum=False):
    """notes: list of (t, dur, pitch, vel). Returns (n,2) at SR rendered by TinySoundFont."""
    import tinysoundfont
    syn = tinysoundfont.Synth(samplerate=SR, gain=chan_gain_db)
    sfid = syn.sfload(str(sf2))
    chan = 9 if is_drum else 0
    syn.program_select(chan, sfid, bank, program, is_drums=is_drum)
    ev = []
    for (t, d, p, v) in notes:
        ev.append((t, 1, int(p), int(v)))
        ev.append((t + d, 0, int(p), 0))
    ev.sort(key=lambda e: (e[0], e[1]))
    total = int(dur * SR)
    out = np.zeros((total, 2), dtype=np.float32)
    pos = 0
    for (t, on, p, v) in ev + [(dur, -1, 0, 0)]:
        i = min(total, int(round(t * SR)))
        if i > pos:
            blk = np.frombuffer(syn.generate(i - pos), dtype=np.float32).reshape(-1, 2)
            out[pos:i] = blk
            pos = i
        if on == 1:
            syn.noteon(chan, p, v)
        elif on == 0:
            syn.noteoff(chan, p)
    return out.astype(np.float64)
