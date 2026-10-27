#!/usr/bin/env python3
"""gate_check.py: the scripted gate check for any film render (PIPELINE_V2 anti-waste rule 1: the mechanical checks
before G6, instead of review agents). Generic: any entry / composition + its MP4 + its scenes / captions JSON.

  python3 -I scripts/qa/gate_check.py --mp4 out/v3_g5.mp4 --scenes src/v3/film/scenes.json \
      --captions src/v3/film/captions.json --voice public/v3/voice.wav \
      [--entry src/entry-v3-film.tsx --comp Film3] [--fps 60] [--only S9] \
      [--frame0 "AI is making your|next laptop pricier." --frame0-until 3.37] [--frame0-geom JSON] [--density] [--json report.json]

  v2r (src/v2r/film/Film2R.tsx: FILM2R_FRAME0's numbers):
  python3 -I scripts/qa/gate_check.py --mp4 out/v2r.mp4 --scenes src/v2r/film/scenes.json \
      --captions src/v2r/film/captions.json --voice public/v2/voice.wav \
      --frame0 "SHE SAYS: NO CRITICIZING|GOOGLE. FOR LIFE." --frame0-until 5.95 \
      --frame0-geom '{"size":72,"baselines":[372,452],"captionBaseline":516,"captionScale":0.531,"spoken":"first",
                      "keys":["SAYS:","NO CRITICIZING","FOR LIFE."],"source":"Source: BBC News, 21 Oct 2026",
                      "sourceSize":20,"sourceBaseline":550}'

Checks (FAIL = exit 1; WARN never fails):
  fps        the video stream is --fps (default 60); with --entry/--comp also the composition's own fps and length
             (`npx remotion compositions`).
  duration   video frames = ceil(voice seconds * fps) (+-1 frame); with --only ID: that panel's length. scenes.json and
             captions.json end on the voice (+-1 frame).
  audio      an audio stream exists, starts at 0 and lasts as long as the video (+-2 frames: A/V sync).
  cuts       hard cuts detected in the MP4 (frame difference outside the caption band and the draft label strip, a
             local peak well above its neighbourhood) vs the scenes' starts: every scene start must have a detected cut
             within 1 frame (first frame of a scene = ceil(start * fps)). Extra detected cuts are listed as WARN
             (a big in-shot event looks like a cut). The expected cuts follow each scene's `transitionIn.type`
             (lib/Film.tsx): cut / matchcut / camera-continuous / unbuild / none = one hard cut at the start c;
             push-through WITH a `bridge` colour = two cuts, into the flat bridge at c - 0.05 and out of it at
             c + 0.05 (Film's PT_HOLD 0.1 s), cut-like frames on its zoom legs (c - hold/2 - (dur - hold) * 0.45 ..
             c + hold/2 + (dur - hold) * 0.55, +-1 frame) are expected (not listed as extra);
             push-through without a bridge = one cut at c; foreground-wipe = NO hard cut (the element covers the
             change; its window c +- dur / 2 may hold cut-like frames, a cut within 1 frame of c is a WARN).
  captions   from the JSON, laid out like SkyCaptions (src/lib/Captions.tsx, tokens read from src/lib/theme.ts,
             glyph extents from the caption font): every page's ink and highlight boxes inside the caption band
             (--band, default 290-600) and inside the caption clip (no clipped letters), lines within the safe width
             (x 90-950: the right rail), 1-2 lines per page, ~20 characters per line (WARN), pages in time order.
             --frame0: the frame-0 words (Film `frame0`, lines split by '|') and the spoken pages lowered under them,
             with Film.tsx's F0 layout. --frame0-geom (JSON) overrides that layout with a film's own Frame0Text
             numbers: size, baselines, captionBaseline, captionScale (as in F0), plus the optional v2r fields:
             "spoken": "first" (only page 1 under the block: the later pages before the first page change after
             --frame0-until are never drawn, so they are skipped), "keys": [texts] (the box walks these words: every
             line holding one gets the highlight box's extents), "highlight" (the box on the last line, as before)
             and "source" / "sourceSize" / "sourceBaseline" (the source line: inside the band and the safe width,
             clear of the lowered captions). Without it the result is exactly as before.
  density    (--density, optional) scripts/qa/density.py on the MP4 with the scenes: medium events per second, the
             longest gap, near-static frames, flat share, objects and fine detail per shot vs targets measured on
             reference 1 and v1 (docs/look/research/density_numbers.md). WARN per shot under target; FAIL only when
             a film AVERAGE is far under target (an empty film, not one quiet shot). Adds ~30 s.
Works on any render scale (quarter-scale smoke renders included): cut detection runs on a 90 x 160 grey copy
(density wants a half-scale render or better: its fullness pass reads edges at 540 px wide).
"""
from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]  # video/
W, H = 1080, 1920
RESULTS: list[tuple[str, str, str]] = []


def report(level: str, check: str, msg: str) -> None:
    RESULTS.append((level, check, msg))
    print(f"{level:4} {check:9} {msg}")


# ---------------------------------------------------------------- media probing

def ffprobe(path: Path) -> dict:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def rate(s: str) -> float:
    a, _, b = s.partition("/")
    return float(a) / float(b or 1)


def media_seconds(path: Path) -> float:
    if path.suffix.lower() == ".wav":
        with wave.open(str(path)) as w:
            return w.getnframes() / w.getframerate()
    if path.suffix.lower() == ".json":
        d = json.loads(path.read_text())
        return float(d.get("durationSec") or d["words"][-1]["e"])
    return float(ffprobe(path)["format"]["duration"])


def count_frames(path: Path) -> int:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries",
                          "stream=nb_read_packets", "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True).stdout
    return int(out.strip().split(",")[0])


def grey_frames(path: Path, w: int = 90, h: int = 160) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"scale={w}:{h}:flags=area,format=gray",
                          "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    n = len(raw) // (w * h)
    return np.frombuffer(raw[: n * w * h], dtype=np.uint8).reshape(n, h, w).astype(np.float32)


def comp_meta(entry: str, comp: str) -> tuple[float, int] | None:
    try:
        out = subprocess.run(["npx", "remotion", "compositions", entry], cwd=ROOT, capture_output=True, text=True, timeout=600).stdout
    except Exception as e:  # noqa: BLE001
        report("WARN", "fps", f"could not list compositions of {entry}: {e}")
        return None
    for line in out.splitlines():
        m = re.match(rf"^{re.escape(comp)}\s+(\d+(?:\.\d+)?)\s+(\d+)x(\d+)\s+(\d+)\s", line.strip())
        if m:
            return float(m.group(1)), int(m.group(4))
    report("WARN", "fps", f"composition {comp} not found in {entry}")
    return None


# ---------------------------------------------------------------- caption layout (mirrors SkyCaptions)

def ts_object(src: str, name: str) -> dict:
    m = re.search(rf"export const {name}\s*=\s*\{{(.*?)\}}\s*(?:as const)?;", src, re.S)
    out: dict = {}
    if not m:
        return out
    body = re.sub(r"/\*.*?\*/|//[^\n]*", "", m.group(1), flags=re.S)
    for k, v in re.findall(r"(\w+)\s*:\s*([-\d.]+|true|false)\s*[,}\n]", body + "\n"):
        out[k] = True if v == "true" else False if v == "false" else float(v)
    return out


def tokens() -> tuple[dict, dict, dict, dict]:
    theme = (ROOT / "src/lib/theme.ts").read_text()
    sky = {"cx": 520, "line1": 387, "line2": 510, "oneLine": 448, "size": 98, "maxWidth": 850, "clipTop": 280, "clipBottom": 570}
    sky.update(ts_object(theme, "skyCaption"))
    hb = {"padEm": 0.19, "topEm": 0.9, "bottomEm": 0.19, "includePunct": True}
    hb.update(ts_object(theme, "skyHighlightBox"))
    typ = {"hookScale": 1.06, "punchScale": 1.16}
    typ.update({k: v for k, v in ts_object(theme, "type").items() if k in ("hookScale", "punchScale")})
    f0 = {"size": 72, "captionBaseline": 545, "captionScale": 0.84, "baselines": [342, 432]}
    film = (ROOT / "src/lib/Film.tsx").read_text()
    m = re.search(r"const F0 = \{size: ([\d.]+), baselines: \[([\d.]+), ([\d.]+)\], captionBaseline: ([\d.]+), captionScale: ([\d.]+)\}", film)
    if m:
        f0 = {"size": float(m.group(1)), "baselines": [float(m.group(2)), float(m.group(3))], "captionBaseline": float(m.group(4)), "captionScale": float(m.group(5))}
    return sky, hb, typ, f0


class Font:
    def __init__(self) -> None:
        self.ok = False
        try:
            from PIL import ImageFont  # noqa: PLC0415
            self.path = str(ROOT / "public/fonts/CaptionHand.woff2")
            self.cache: dict = {}
            self.IF = ImageFont
            self.IF.truetype(self.path, 98)
            self.ok = True
        except Exception:  # noqa: BLE001
            pass

    def _f(self, size: float):
        k = round(size * 4) / 4
        if k not in self.cache:
            self.cache[k] = self.IF.truetype(self.path, max(1, int(round(k))))
        return self.cache[k]

    def width(self, text: str, size: float) -> float:
        return self._f(size).getlength(text) * size / max(1, round(size)) if self.ok else len(text) * size * 0.45

    def ink(self, text: str, size: float) -> tuple[float, float]:
        """(top, bottom) of the glyph ink relative to the baseline (y down)."""
        if not self.ok:
            return -0.75 * size, 0.25 * size
        f = self._f(size)
        asc, _ = f.getmetrics()
        _, t, _, b = f.getbbox(text, anchor="ls")
        return float(t), float(b)


def page_layout(b: dict, sky: dict, typ: dict, font: Font) -> list[dict]:
    """SkyCaptions.layoutSky: per line {text, size, baseline, width, boxes: [(x0, x1, top, bottom)]}."""
    lines = b["lines"]
    n = len(lines)
    style = b.get("style", "normal")
    size = sky["size"] * (typ["punchScale"] if style == "punch" else typ["hookScale"] if style == "hook" else 1)
    widest = max([1.0] + [font.width(l["text"], size) for l in lines])
    if widest > sky["maxWidth"]:
        size = math.floor(size * sky["maxWidth"] / widest)
    pitch = (sky["line2"] - sky["line1"]) * (size / sky["size"])
    mid = sky["oneLine"]
    if n == 1:
        bls = [mid]
    else:
        bls = [([sky["line1"], sky["line2"]][i] if style == "normal" and n == 2 else mid - (n - 1) * pitch / 2 + i * pitch) for i in range(n)]
    return [{"text": l["text"], "size": size, "baseline": bls[i], "width": font.width(l["text"], size)} for i, l in enumerate(lines)]


def check_captions(caps: list[dict], a, voice_s: float, fps: float) -> None:
    sky, hb, typ, f0 = tokens()
    f0 = {**f0, **a.frame0_geom}
    font = Font()
    if not font.ok:
        report("WARN", "captions", "caption font not readable by PIL: widths and glyph extents are estimates")
    band = [float(x) for x in a.band.split(",")]
    clip = (sky["clipTop"], sky["clipBottom"])
    x_lo, x_hi = a.safe_x
    lead = 0.04
    f0_lines = [x for x in (a.frame0 or "").split("|") if x]
    lower_until = math.inf
    if f0_lines:
        nxt = next((b for b in sorted(caps, key=lambda c: c["s"]) if b["s"] - lead >= a.frame0_until - 1e-6), None)
        lower_until = nxt["s"] - lead if nxt else math.inf
    # spoken: 'first' (Film.tsx f0HideSpoken): pages 2.. that start before lower_until are never drawn
    first_only = bool(f0_lines) and f0.get("spoken") == "first"
    hidden: set[int] = set()
    if first_only:
        order = sorted(range(len(caps)), key=lambda j: caps[j]["s"])
        hidden = {j for j in order[1:] if caps[j]["s"] - lead < lower_until}
    bad = 0
    prev_s = -1.0
    for i, b in enumerate(caps):
        tag = f"page {i + 1} '{' / '.join(l['text'] for l in b['lines'])}'"
        if b["s"] < prev_s:
            report("FAIL", "captions", f"{tag} starts before the page before it")
            bad += 1
        prev_s = b["s"]
        if i in hidden:
            continue
        if not 1 <= len(b["lines"]) <= 2:
            report("WARN", "captions", f"{tag}: {len(b['lines'])} lines (pages are 1-2 lines)")
        for l in b["lines"]:
            if len(l["text"]) > a.max_chars + 2:
                report("WARN", "captions", f"{tag}: line '{l['text']}' has {len(l['text'])} characters (max ~{a.max_chars})")
        lowered = f0_lines and b["s"] - lead < lower_until
        k, dy = (f0["captionScale"], f0["captionBaseline"] - sky["oneLine"]) if lowered else (1.0, 0.0)
        # the lowered stack is scaled about (cx, oneLine) and moved by dy: y' = oneLine + (y - oneLine) * k + dy
        Y = (lambda y: sky["oneLine"] + (y - sky["oneLine"]) * k + dy)
        X = (lambda x: sky["cx"] + (x - sky["cx"]) * k)
        cy0, cy1 = Y(clip[0]), Y(clip[1])
        for ln in page_layout(b, sky, typ, font):
            t, bt = font.ink(ln["text"], ln["size"])
            top, bot = ln["baseline"] + t, ln["baseline"] + bt
            hl = any(h["text"].strip(" .,!?;:") and h["text"].strip(" .,!?;:").lower() in ln["text"].lower() for h in b.get("highlights", []))
            if hl:
                top = min(top, ln["baseline"] - hb["topEm"] * ln["size"])
                bot = max(bot, ln["baseline"] + hb["bottomEm"] * ln["size"])
            sy0, sy1 = Y(top), Y(bot)
            sx0, sx1 = X(sky["cx"] - ln["width"] / 2), X(sky["cx"] + ln["width"] / 2)
            where = f"{tag} line '{ln['text']}'" + (" (lowered under the frame-0 words)" if lowered else "")
            if sy0 < band[0] - 0.5 or sy1 > band[1] + 0.5:
                report("FAIL", "captions", f"{where}: y {sy0:.0f}-{sy1:.0f} outside the caption band {band[0]:.0f}-{band[1]:.0f}")
                bad += 1
            if Y(ln["baseline"] + t) < cy0 - 0.5 or Y(ln["baseline"] + bt) > cy1 + 0.5:
                report("FAIL", "captions", f"{where}: glyphs y {Y(ln['baseline'] + t):.0f}-{Y(ln['baseline'] + bt):.0f} cut by the caption clip {cy0:.0f}-{cy1:.0f}")
                bad += 1
            if sx0 < x_lo or sx1 > x_hi:
                report("FAIL", "captions", f"{where}: x {sx0:.0f}-{sx1:.0f} outside the safe width {x_lo}-{x_hi}")
                bad += 1
    if f0_lines:
        size = f0["size"]
        widest = max(font.width(x, size) for x in f0_lines)
        if widest > sky["maxWidth"]:
            size = math.floor(size * sky["maxWidth"] / widest)
        # the highlight box: the last line (as before) + every line holding one of the keys' words
        key_texts = [k["text"] if isinstance(k, dict) else str(k) for k in f0.get("keys", [])]
        boxed = {len(f0_lines) - 1} | {i for i, x in enumerate(f0_lines) if any(k and k in x for k in key_texts)}
        for i, text in enumerate(f0_lines):
            bl = f0["baselines"][min(i, len(f0["baselines"]) - 1)]
            t, bt = font.ink(text, size)
            top, bot = bl + t, bl + bt
            if i in boxed:
                top, bot = min(top, bl - hb["topEm"] * size), max(bot, bl + hb["bottomEm"] * size)
            w = font.width(text, size)
            if top < band[0] - 0.5 or bot > band[1] + 0.5 or sky["cx"] - w / 2 < x_lo or sky["cx"] + w / 2 > x_hi:
                report("FAIL", "captions", f"frame-0 words '{text}': y {top:.0f}-{bot:.0f}, x {sky['cx'] - w / 2:.0f}-{sky['cx'] + w / 2:.0f} outside the band / safe width")
                bad += 1
        # the frame-0 words must clear the lowered captions under them
        f0_bottom = f0["baselines"][min(len(f0_lines), len(f0["baselines"])) - 1] + hb["bottomEm"] * size
        low = [b for j, b in enumerate(caps) if b["s"] - lead < lower_until and j not in hidden]
        src = f0.get("source")
        src_top = math.inf
        if src:
            ss, sbl = float(f0.get("sourceSize", 20)), float(f0.get("sourceBaseline", 550))
            t, bt = font.ink(src, ss)
            w = font.width(src, ss)
            src_top = sbl + t
            if sbl + t < band[0] - 0.5 or sbl + bt > band[1] + 0.5 or sky["cx"] - w / 2 < x_lo or sky["cx"] + w / 2 > x_hi:
                report("FAIL", "captions", f"frame-0 source '{src}': y {sbl + t:.0f}-{sbl + bt:.0f}, x {sky['cx'] - w / 2:.0f}-{sky['cx'] + w / 2:.0f} outside the band / safe width")
                bad += 1
        for b in low:
            for ln in page_layout(b, sky, typ, font):
                y_top = f0["captionBaseline"] + (ln["baseline"] - hb["topEm"] * ln["size"] - sky["oneLine"]) * f0["captionScale"]
                if y_top < f0_bottom - 0.5:
                    report("FAIL", "captions", f"lowered page '{ln['text']}' (top y {y_top:.0f}) overlaps the frame-0 words (bottom y {f0_bottom:.0f})")
                    bad += 1
                y_bot = f0["captionBaseline"] + (ln["baseline"] + hb["bottomEm"] * ln["size"] - sky["oneLine"]) * f0["captionScale"]
                if y_bot > src_top + 0.5:
                    report("FAIL", "captions", f"lowered page '{ln['text']}' (bottom y {y_bot:.0f}) overlaps the frame-0 source line (top y {src_top:.0f})")
                    bad += 1
    end = caps[-1].get("e", caps[-1]["s"]) if caps else 0
    if abs(end - voice_s) > 1 / fps + 1e-6:
        report("FAIL", "captions", f"the last page ends at {end:.3f} s, the voice at {voice_s:.3f} s")
        bad += 1
    if not bad:
        report("PASS", "captions", f"{len(caps)} pages inside the band {band[0]:.0f}-{band[1]:.0f} and the clip {clip[0]:.0f}-{clip[1]:.0f}, x {x_lo}-{x_hi}" + (f"; frame-0 words + {len(low)} lowered pages" + (f" ({len(hidden)} hidden under the block)" if hidden else "") + (" + source line" if f0.get("source") else "") if f0_lines else ""))


# ---------------------------------------------------------------- density (scripts/qa/density.py)

def check_density(a, mp4: Path, scenes: list[dict]) -> None:
    sys.dont_write_bytecode = True
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import density as D  # noqa: PLC0415
    band = tuple(float(x) for x in a.band.split(","))
    sc = [{"id": a.only, "start": 0.0, "end": 1e9}] if a.only else scenes
    res = D.analyze(str(mp4), sc, band=band, quiet=True)
    f = res["film"]
    summ = (f"{f['evps']:.1f} medium events/s, longest gap {f['gap']:.2f} s, static {f['static']:.0%}, flat {f['flat']:.0%}, "
            f"{f['obj']:.0f} objects/Mpx, fine detail {f['detail']:.0%}")
    if f["far"]:
        report("FAIL", "density", f"film far under target ({', '.join(f['far'])}): {summ}")
    elif res["verdict"] == "PASS":
        report("PASS", "density", f"{summ} (density_numbers.md targets)")
    else:
        report("WARN", "density", summ)
    for r in res["shots"]:
        bad = [f"{k} {D.TARGETS[k]['fmt'].format(r[k])} ({v})" for k, v in r["verdicts"].items() if v not in ("PASS", "-")]
        if bad:
            report("WARN", "density", f"{r['id']}: " + ", ".join(bad))


# ---------------------------------------------------------------- transitions (lib/Film.tsx)

TDUR = {"camera-continuous": 1.4, "foreground-wipe": 0.8, "push-through": 1.1}  # Film.tsx default durations
PT_HOLD = 0.1  # Film.tsx PT_HOLD: a push-through's flat bridge, c - hold / 2 .. c + hold / 2


def film_const(name: str, default: float) -> float:
    m = re.search(rf"^const {name} = ([\d.]+);", (ROOT / "src/lib/Film.tsx").read_text(), re.M)
    return float(m.group(1)) if m else default


def transition_model(scenes: list[dict], fps: float) -> tuple[list, list, list]:
    """From each scene's transitionIn: the expected hard cuts [(label, frame)], the windows [(label, f0, f1)] whose
    cut-like frames belong to a transition (not listed as extra), and the frames that must NOT cut [(label, frame)]."""
    fr = lambda t: math.ceil(t * fps - 1e-6)  # noqa: E731
    expect, windows, no_cut = [], [], []
    hold = film_const("PT_HOLD", PT_HOLD)
    for s in scenes:
        c, sid = s["start"], s["id"]
        tr = s.get("transitionIn") or {"type": "cut"}
        typ = tr.get("type", "cut")
        d = float(tr.get("dur", TDUR.get(typ, 0.0)))
        if typ == "push-through":
            # Film.tsx pushThrough: the zoom-in leg (d - hold) * 0.45 before the bridge, the pull-back 0.55 after it
            h = hold if tr.get("bridge") else 0.0
            if h:
                expect += [(f"{sid} (into the push-through bridge)", fr(c - h / 2)), (f"{sid} (out of the push-through bridge)", fr(c + h / 2))]
            else:
                expect.append((sid, fr(c)))
            windows.append((sid, fr(c - h / 2 - (d - h) * 0.45) - 1, fr(c + h / 2 + (d - h) * 0.55) + 1))
        elif typ == "foreground-wipe":
            no_cut.append((f"{sid} (foreground wipe)", fr(c)))
            windows.append((sid, fr(c - d / 2) - 1, fr(c + d / 2) + 1))
        else:
            expect.append((sid, fr(c)))
    return expect, windows, no_cut


# ---------------------------------------------------------------- main

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--mp4", required=True)
    ap.add_argument("--scenes", required=True)
    ap.add_argument("--captions", required=True)
    ap.add_argument("--voice", required=True, help="the voice (.wav / any media) or its words JSON (durationSec)")
    ap.add_argument("--fps", type=float, default=60)
    ap.add_argument("--entry", help="the film entry (with --comp: check the composition's fps and length)")
    ap.add_argument("--comp")
    ap.add_argument("--only", help="the MP4 is one panel alone (Film3Shot / <Film only>): its length, no cuts")
    ap.add_argument("--band", default="290,600", help="caption band y0,y1 (screen px)")
    ap.add_argument("--safe-x", default="90,950", help="caption x range (right rail beyond)")
    ap.add_argument("--max-chars", type=int, default=20)
    ap.add_argument("--frame0", help="frame-0 words, lines split by '|'")
    ap.add_argument("--frame0-until", type=float, default=0.0)
    ap.add_argument("--frame0-geom", default="{}", help="JSON: the film's own Frame0Text layout over Film.tsx's F0, e.g. "
                    '\'{"size":72,"baselines":[372,452],"captionBaseline":516,"captionScale":0.531,"spoken":"first"}\'')
    ap.add_argument("--cut-min", type=float, default=2.0, help="minimum mean grey difference of a cut (0-255)")
    ap.add_argument("--density", action="store_true", help="also run the density meter (scripts/qa/density.py)")
    ap.add_argument("--json", help="write the results here")
    a = ap.parse_args()
    a.safe_x = tuple(int(x) for x in a.safe_x.split(","))
    try:
        a.frame0_geom = json.loads(a.frame0_geom)
        assert isinstance(a.frame0_geom, dict)
    except Exception:  # noqa: BLE001
        ap.error(f"--frame0-geom is not a JSON object: {a.frame0_geom}")

    mp4 = Path(a.mp4)
    scenes = sorted(json.loads(Path(a.scenes).read_text()), key=lambda s: s["start"])
    caps = json.loads(Path(a.captions).read_text())
    voice_s = media_seconds(Path(a.voice))
    fps = a.fps
    print(f"gate_check {mp4.name}: voice {voice_s:.3f} s, {len(scenes)} scenes, {len(caps)} caption pages" + (f", only {a.only}" if a.only else ""))

    # ---- streams
    info = ffprobe(mp4)
    vs = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    aus = [s for s in info["streams"] if s["codec_type"] == "audio"]
    if not vs:
        report("FAIL", "fps", "no video stream")
        return finish(a)
    vfps = rate(vs.get("avg_frame_rate") or vs["r_frame_rate"])
    (report("PASS", "fps", f"video {vfps:g} fps ({vs['width']}x{vs['height']})") if abs(vfps - fps) < 0.01
     else report("FAIL", "fps", f"video is {vfps:g} fps, the gate wants {fps:g}"))
    if a.entry and a.comp:
        meta = comp_meta(a.entry, a.comp)
        if meta:
            cfps, cframes = meta
            (report("PASS", "fps", f"composition {a.comp}: {cfps:g} fps, {cframes} frames") if abs(cfps - fps) < 0.01
             else report("FAIL", "fps", f"composition {a.comp} is {cfps:g} fps, the gate wants {fps:g}"))

    # ---- duration
    if a.only:
        sc = next((s for s in scenes if s["id"] == a.only), None)
        if not sc:
            report("FAIL", "duration", f"--only {a.only}: no such scene")
            return finish(a)
        want_s = sc["end"] - sc["start"]
    else:
        want_s = voice_s
    want = math.ceil(want_s * fps - 1e-6)
    nb = int(vs["nb_frames"]) if vs.get("nb_frames", "").isdigit() else count_frames(mp4)
    vdur = nb / vfps
    (report("PASS", "duration", f"{nb} frames = {vdur:.3f} s (want {want} = ceil({want_s:.3f} s x {fps:g}))") if abs(nb - want) <= 1
     else report("FAIL", "duration", f"{nb} frames = {vdur:.3f} s, want {want} (ceil({want_s:.3f} s x {fps:g}))"))
    if not a.only and abs(scenes[-1]["end"] - voice_s) > 1 / fps + 1e-6:
        report("FAIL", "duration", f"scenes.json ends at {scenes[-1]['end']:.3f} s, the voice at {voice_s:.3f} s")

    # ---- audio
    if not aus:
        report("FAIL", "audio", "no audio stream")
    else:
        au = aus[0]
        adur = float(au.get("duration") or info["format"]["duration"])
        ast = float(au.get("start_time") or 0)
        ok = abs(adur - vdur) <= 2 / fps + 0.03 and abs(ast) <= 1 / fps
        report("PASS" if ok else "FAIL", "audio", f"{au['codec_name']} {au.get('sample_rate', '?')} Hz, starts {ast:.3f} s, lasts {adur:.3f} s (video {vdur:.3f} s)")

    # ---- cuts
    g = grey_frames(mp4)
    h, w = g.shape[1:]
    band = [float(x) for x in a.band.split(",")]
    mask = np.ones((h, w), bool)
    mask[int(band[0] / H * h): int(math.ceil(band[1] / H * h)), :] = False  # caption band (pages pop at cuts too)
    mask[int(1820 / H * h):, :] = False  # the draft label strip (its timecode changes every frame)
    d = np.zeros(len(g))
    d[1:] = np.abs(g[1:] - g[:-1])[:, mask].mean(axis=1)
    cuts = []
    for n in range(1, len(d)):
        lo, hi = max(1, n - 15), min(len(d), n + 16)
        neigh = np.concatenate([d[lo:n], d[n + 1:hi]])
        base = float(np.median(neigh)) if len(neigh) else 0.0
        if d[n] >= a.cut_min and d[n] >= 4 * base + 0.5 and d[n] >= d[max(1, n - 1)] and d[n] >= d[min(len(d) - 1, n + 1)]:
            cuts.append(n)
    expect, windows, no_cut = transition_model([] if a.only else scenes[1:], fps)
    miss = []
    used = set()
    for sid, f in expect:
        hit = [c for c in cuts if abs(c - f) <= 1]
        if hit:
            used.add(hit[0])
            if hit[0] != f:
                report("WARN", "cuts", f"{sid}: cut at frame {hit[0]}, expected {f} (within 1 frame)")
        else:
            near = min(cuts, key=lambda c: abs(c - f)) if cuts else None
            miss.append(f"{sid} (frame {f}, d={d[f] if f < len(d) else float('nan'):.1f}{'' if near is None else f', nearest detected cut {near}'})")
    for sid, f in no_cut:
        hit = [c for c in cuts if abs(c - f) <= 1]
        if hit:
            report("WARN", "cuts", f"{sid}: a hard cut at frame {hit[0]}, but its foreground wipe should cover the change (no cut)")
    in_tr = [c for c in cuts if c not in used and any(lo <= c <= hi for _, lo, hi in windows)]
    extra = [c for c in cuts if c not in used and c not in in_tr]
    trs = f"; {len(no_cut)} foreground wipe(s) without a cut" if no_cut else ""
    trs += f"; {len(in_tr)} cut-like frame(s) inside transition windows (expected)" if in_tr else ""
    if miss:
        report("FAIL", "cuts", f"{len(miss)} scene start(s) without a cut within 1 frame: " + "; ".join(miss))
    elif expect:
        report("PASS", "cuts", f"all {len(expect)} cuts at their scene starts (+-1 frame)" + trs)
    elif no_cut:
        report("PASS", "cuts", trs.lstrip("; "))
    if extra:
        report("WARN", "cuts", f"{len(extra)} extra cut-like frame(s) inside shots: " + ", ".join(f"{c} ({c / fps:.2f} s, d={d[c]:.1f})" for c in extra[:12]))

    # ---- captions
    check_captions(caps, a, voice_s, fps)

    # ---- density (optional)
    if a.density:
        check_density(a, mp4, scenes)
    return finish(a)


def finish(a) -> int:
    fails = [r for r in RESULTS if r[0] == "FAIL"]
    warns = [r for r in RESULTS if r[0] == "WARN"]
    print(f"gate_check: {'FAIL' if fails else 'PASS'} ({len(fails)} fail, {len(warns)} warn)")
    if a.json:
        Path(a.json).write_text(json.dumps([{"level": l, "check": c, "msg": m} for l, c, m in RESULTS], indent=1))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
