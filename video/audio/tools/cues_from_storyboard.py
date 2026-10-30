"""Build audio/cues.json from the storyboard's per-scene sfx lists (docs/v1/storyboard_v3_resolved.json scenes[].sfx).

The storyboard times are already resolved on the recorded voice (assets/timing.json) by scripts/anchor/resolve.py (v1's,
archived since 2026-10-29 in archive/v1/scripts/anchor/).
This converts its free-text notes into mixer cues:
  "-18 dB, ..."                  -> gain_db (else a per-sound default, in the kit's usual range)
  "x3", "x7, 0.08 s apart"       -> that many hits (default 0.08 s apart, each 1.5 dB softer)
  "(3 offsets)", "(6 offsets 0.1 s)" -> the same
  "re-triggered per gate, to the scene end" -> re-triggers every 0.75 s until the scene ends
  "+ door_knock layered"         -> a second cue at the same time
  "to the scene end" (ambience)  -> held until the scene end (taken from the middle of the file, faded)
  "REVERSED" / "stepped"         -> "reverse": true / "stepped": true (mix.py plays the file backwards / gated in steps)
Cues "on the cut" (or at a scene start) are final; everything else is "provisional": true (it follows animation
beats that can still move). Each cue keeps its scene, the storyboard note and its source time.

    python3 audio/tools/cues_from_storyboard.py [--storyboard docs/v1/storyboard_v3_resolved.json] [--out audio/cues.json]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import ROOT, AUDIO  # noqa: E402

DEFAULT_DB = {"pop_low": -18, "pop_mid": -20, "pop_high": -20, "bubble_pop": -20, "whoosh_soft": -22, "fg_wipe": -18,
              "switch_toggle": -14, "power_off_thunk": -16, "lock_click": -16, "paper_flip": -20, "card_flip": -22,
              "pencil_scratch_short": -20, "pencil_scratch_medium": -20, "pencil_scratch_long": -20, "typing_tick": -24,
              "click_light": -20, "ding": -16, "alert_ping": -16, "counter_ticker": -18, "handle_rattle": -18,
              "door_knock": -20, "light_shimmer": -22, "crowd_murmur": -26, "low_swell": -24, "sub_impact": -20}


def convert(sb):
    cues = []
    for sc in sb["scenes"]:
        s0, s1 = float(sc["start"]), float(sc["end"])
        for c in sc.get("sfx", []):
            t, snd, note = float(c["t"]), c["sound"], c.get("notes", "") or ""
            m = re.search(r"(-\d+(?:\.\d+)?)\s*dB", note)
            g = float(m.group(1)) if m else float(DEFAULT_DB.get(snd, -20))
            on_cut = ("on the cut" in note) or ("on the hard cut" in note) or abs(t - s0) < 0.02
            base = {"t": round(t, 3), "sfx": snd, "gain_db": g, "pan": 0.0, "provisional": not on_cut,
                    "scene": sc["id"], "why": note, "src_t": t}
            if "REVERSED" in note:
                base["reverse"] = True
            if "stepped" in note:
                base["stepped"] = True
            n, gap = 1, 0.08
            m1 = re.search(r"\bx(\d+)(?:,\s*([\d.]+)\s*s apart)?", note)
            m2 = re.search(r"\((\d+) offsets(?:\s*([\d.]+)\s*s)?\)", note)
            mm = m1 or m2
            if mm:
                n = int(mm.group(1))
                gap = float(mm.group(2)) if mm.group(2) else 0.08
            if "re-triggered per gate" in note:
                n = max(1, int((s1 - t) / 0.75))
                gap = 0.75
            if snd in ("crowd_murmur", "air_bed", "city_bed") and "scene end" in note:
                base.update({"offset": 1.0, "dur": round(s1 - t, 3)})
            for k in range(n):
                cue = dict(base)
                cue["t"] = round(t + k * gap, 3)
                cue["gain_db"] = round(g - 1.5 * k if gap < 0.5 else g - 0.5 * k, 1)
                cue["pan"] = [0.0, -0.25, 0.25][k % 3] if n > 1 else 0.0
                cues.append(cue)
            if "door_knock layered" in note:
                extra = dict(base); extra["sfx"] = "door_knock"; extra["why"] = "layered with the rattle (" + note + ")"
                cues.append(extra)
    cues.sort(key=lambda c: (c["t"], c["sfx"]))
    return cues


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--storyboard", default=str(ROOT / "docs" / "v1" / "storyboard_v3_resolved.json"))
    ap.add_argument("--out", default=str(AUDIO / "cues.json"))
    a = ap.parse_args()
    sb = json.loads(Path(a.storyboard).read_text())
    cues = convert(sb)
    Path(a.out).write_text(json.dumps(cues, indent=1))
    prov = sum(c["provisional"] for c in cues)
    print(f"{len(cues)} cues ({len(cues) - prov} final on cuts, {prov} provisional) from "
          f"{sum(len(s.get('sfx', [])) for s in sb['scenes'])} storyboard entries -> {a.out}")


if __name__ == "__main__":
    main()
