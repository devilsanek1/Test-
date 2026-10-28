#!/usr/bin/env python3
"""gate_check.py: the scripted gate check for any film render (PIPELINE_V2 anti-waste rule 1: the mechanical checks
before G6, instead of review agents). Generic: any entry / composition + its MP4 + its scenes / captions JSON.

  python3 -I scripts/qa/gate_check.py --mp4 out/v3_g5.mp4 --scenes src/v3/film/scenes.json \
      --captions src/v3/film/captions.json --voice public/v3/voice.wav \
      [--entry src/entry-v3-film.tsx --comp Film3] [--fps 60] [--only SQD] [--seam-comp Film3Seams] \
      [--frame0 "AI is making your|next laptop pricier." --frame0-until 3.37] [--frame0-geom JSON] [--density] [--json report.json]

  v2r (no frame-0 block since REVIEW_1 MUST 1, as v3: frame 0 shows the first spoken page):
  python3 -I scripts/qa/gate_check.py --mp4 out/v2r.mp4 --scenes src/v2r/film/scenes.json \
      --captions src/v2r/film/captions.json --voice public/v2/voice.wav --entry src/entry-v2r-film.tsx --comp Film2R
  (--frame0 / --frame0-geom stay for a film that still draws a frame0 block.)

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
             (lib/Film.tsx), always on (v1's wipes S07 / S10 get the new verdicts too): cut / matchcut /
             camera-continuous / none = one hard cut at the start c (an `unbuild` transitionIn is not modelled: it is
             expected as a cut, though Film's un-build ends on the incoming scene with none);
             push-through WITH a `bridge` colour = two cuts, into the flat bridge at c - hold/2 and out of it at
             c + hold/2 (the join's own `hold`, else Film's PT_HOLD 0.1 s; the bridge itself is drawn by the film, e.g. Film2R's Bridges: lib/Film
             culls it), cut-like frames on its zoom legs (c - hold/2 - (dur - hold) * 0.45 ..
             c + hold/2 + (dur - hold) * 0.55, +-1 frame) are expected (not listed as extra); a window colour-matched
             to the bridge moves the visible out-cut one frame later (a WARN); the generic peak rule needs short legs
             (v2r's 0.3 s passes), so a push's cut is also found as a SPIKE on its zoom legs (within 1 frame,
             d >= --cut-min and >= 1.5x both neighbours' d);
             push-through without a bridge = one cut at c, found AT ITS DECLARED FRAME when no peak shows it (before
             the spike rule): a
             carrier that MATCHES across the cut (v3's J3: the same stick, same place and size, on both sides) leaves no
             pixel spike, but Film's push always zooms IN on the outgoing scene and pulls back OUT of the incoming one
             (lib/Film.tsx pushThrough), so the cut is the frame where the zoom turns: each consecutive pair's zoom is
             measured translation-free (Fourier-Mellin: the log-polar spectra phase-correlated), and the last frame
             zooming in (>= 1.01 over its 3 frames) before the first zooming out (<= 0.99 over the next 3) must be the
             declared frame f = ceil(c * fps) +-1 (a push that is missing, held or shifted fails);
             foreground-wipe = NO hard cut (the element covers the
             change; its window c +- dur / 2 may hold cut-like frames, a cut within 1 frame of c is a WARN).
  seams      (opt-in by data) a matchcut with `"seam": true` (docs/G5_BLOCKING.md §2b, lib/sequence.tsx) joins two
             sequence builders that draw the IDENTICAL frame, so NO cut is expected: a detected cut within 1 frame of
             its frame f = ceil(c * fps) is a FAIL. With --seam-comp (and --entry): the film's seam probe composition
             (4 frames per seam: each side ALONE at f - 1 and at f) is rendered (scripts/render-frames.mjs,
             --seam-scale, default 0.25) and each pair compared: more than --seam-max (1 %) of the pixels differing
             by more than 4 L* is a FAIL (the two builders disagree at the seam). Without --seam-comp: a WARN that
             the frames were not compared.
  carriers   (opt-in by data: when any transitionIn names a `carrier`) every join names one, A-F (CRAFT.md §a), and
             at most 2 are F (plain cuts): else FAIL.
  captions   from the JSON, laid out like SkyCaptions (src/lib/Captions.tsx, tokens read from src/lib/theme.ts,
             glyph extents from the caption font): every page's ink and highlight boxes inside the caption band
             (--band, default 290-600) and inside the caption clip (no clipped letters), lines within the safe width
             (x 90-950: the right rail), 1-2 lines per page, ~20 characters per line (WARN), pages in time order.
             --frame0: the frame-0 words (Film `frame0`, lines split by '|') and the spoken pages lowered under them,
             with Film.tsx's F0 layout. --frame0-geom (JSON) overrides that layout with a film's own Frame0Text
             numbers: size, baselines, captionBaseline, captionScale (as in F0), plus the optional v2r fields:
             "spoken": "first" (only page 1 under the block: the later pages before the first page change after
             --frame0-until are never drawn, so they are skipped), "keys": [texts] (the box walks these words: every
             line holding one gets the highlight box's y extents; its x pad is not modelled), "highlight" (the box on
             the last line, as before) and "source" / "sourceSize" / "sourceBaseline" (the source line: inside the
             band and the safe width, and no overlap with the lowered captions' glyph ink and boxes, above or below
             it). Without --frame0-geom the captions result is exactly as before.
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


def has_highlight(b: dict, text: str) -> bool:
    """A line of page b carries one of its highlight boxes."""
    return any(h["text"].strip(" .,!?;:") and h["text"].strip(" .,!?;:").lower() in text.lower() for h in b.get("highlights", []))


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
            if has_highlight(b, ln["text"]):
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
        src_y = None
        if src:
            ss, sbl = float(f0.get("sourceSize", 20)), float(f0.get("sourceBaseline", 550))
            t, bt = font.ink(src, ss)
            w = font.width(src, ss)
            src_y = (sbl + t, sbl + bt)
            if sbl + t < band[0] - 0.5 or sbl + bt > band[1] + 0.5 or sky["cx"] - w / 2 < x_lo or sky["cx"] + w / 2 > x_hi:
                report("FAIL", "captions", f"frame-0 source '{src}': y {sbl + t:.0f}-{sbl + bt:.0f}, x {sky['cx'] - w / 2:.0f}-{sky['cx'] + w / 2:.0f} outside the band / safe width")
                bad += 1
        for b in low:
            for ln in page_layout(b, sky, typ, font):
                y_top = f0["captionBaseline"] + (ln["baseline"] - hb["topEm"] * ln["size"] - sky["oneLine"]) * f0["captionScale"]
                if y_top < f0_bottom - 0.5:
                    report("FAIL", "captions", f"lowered page '{ln['text']}' (top y {y_top:.0f}) overlaps the frame-0 words (bottom y {f0_bottom:.0f})")
                    bad += 1
                if src_y:
                    # what is drawn (glyph ink with its descenders, + the box on a highlighted line), lowered; an
                    # interval test, so a source line above or below the captions passes when nothing touches
                    t, bt = font.ink(ln["text"], ln["size"])
                    top, bot = ln["baseline"] + t, ln["baseline"] + bt
                    if has_highlight(b, ln["text"]):
                        top, bot = min(top, ln["baseline"] - hb["topEm"] * ln["size"]), max(bot, ln["baseline"] + hb["bottomEm"] * ln["size"])
                    c0, c1 = (f0["captionBaseline"] + (y - sky["oneLine"]) * f0["captionScale"] for y in (top, bot))
                    if c1 > src_y[0] + 0.5 and c0 < src_y[1] - 0.5:
                        report("FAIL", "captions", f"lowered page '{ln['text']}' (y {c0:.0f}-{c1:.0f}) overlaps the frame-0 source line (y {src_y[0]:.0f}-{src_y[1]:.0f})")
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
PT_TURN = 3  # frames each side of a push-through's declared cut whose zoom must run in (before) and out (after)


def film_const(name: str, default: float) -> float:
    m = re.search(rf"^const {name} = ([\d.]+);", (ROOT / "src/lib/Film.tsx").read_text(), re.M)
    return float(m.group(1)) if m else default


def transition_model(scenes: list[dict], fps: float) -> tuple[list, list, list, list]:
    """From each scene's transitionIn: the expected hard cuts [(label, frame, mode)] (mode None, or 'push' / 'bridge': a
    push-through's cut, without / with a bridge, on zoom legs), the windows
    [(label, f0, f1)] whose cut-like frames belong to a transition (not listed as extra), the frames that must NOT cut
    [(label, frame)], and the seams [(label, frame)] (a matchcut with "seam": true: no cut, the two builders' frames
    equal). A push-through's cut on zoom legs may also be found as a spike (bridged) or by its zoom turn (main)."""
    fr = lambda t: math.ceil(t * fps - 1e-6)  # noqa: E731
    expect, windows, no_cut, seams = [], [], [], []
    hold = film_const("PT_HOLD", PT_HOLD)
    for s in scenes:
        c, sid = s["start"], s["id"]
        tr = s.get("transitionIn") or {"type": "cut"}
        typ = tr.get("type", "cut")
        dur = tr.get("dur")
        d = float(dur) if dur is not None else TDUR.get(typ, 0.0)  # Film: t.dur ?? FILM_DEFAULT_DUR[t.type]
        if typ == "matchcut" and tr.get("seam"):
            seams.append((f"{sid} (seam {c:.2f} s)", fr(c)))
        elif typ == "push-through":
            # Film.tsx pushThrough: the zoom-in leg (d - hold) * 0.45 before the bridge, the pull-back 0.55 after it
            h = float(tr.get("hold", hold)) if tr.get("bridge") else 0.0  # Film.tsx pushThroughHold
            if h:
                expect += [(f"{sid} (into the push-through bridge)", fr(c - h / 2), "bridge"), (f"{sid} (out of the push-through bridge)", fr(c + h / 2), "bridge")]
            else:
                expect.append((sid, fr(c), "push"))
            windows.append((sid, fr(c - h / 2 - (d - h) * 0.45) - 1, fr(c + h / 2 + (d - h) * 0.55) + 1))
        elif typ == "foreground-wipe":
            no_cut.append((f"{sid} (foreground wipe)", fr(c)))
            windows.append((sid, fr(c - d / 2) - 1, fr(c + d / 2) + 1))
        else:
            expect.append((sid, fr(c), None))
    return expect, windows, no_cut, seams


def zoom_between(a: np.ndarray, b: np.ndarray) -> float:
    """The camera zoom from grey frame a to grey frame b (> 1: b's content is bigger, the camera pushes in), free of any
    translation: Fourier-Mellin (the windowed log spectra in log-polar, phase-correlated; an image zoomed by s has its
    spectrum shrunk by 1 / s)."""
    import cv2  # noqa: PLC0415
    h, w = a.shape
    win = np.outer(np.hanning(h), np.hanning(w)).astype(np.float32)
    spec = lambda x: np.log1p(np.abs(np.fft.fftshift(np.fft.fft2(x.astype(np.float32) * win)))).astype(np.float32)  # noqa: E731
    nr, na, r = 128, 180, min(h, w) / 2
    flags = cv2.INTER_LINEAR + cv2.WARP_FILL_OUTLIERS + cv2.WARP_POLAR_LOG
    la, lb = (cv2.warpPolar(spec(x), (nr, na), (w / 2, h / 2), r, flags) for x in (a, b))
    (dx, _dy), _resp = cv2.phaseCorrelate(la, lb)
    return math.exp(-dx * math.log(r) / nr)


def zoom_turn(g: np.ndarray, f: int) -> tuple[int | None, list[float]]:
    """Where a push-through's zoom turns from in to out near frame f (see the docstring): the frame n whose pair (n - 1,
    n) and the PT_TURN - 1 before it zoom in (>= 1.01) while the PT_TURN pairs after it zoom out (<= 0.99), searched
    over f +- 1; and the zooms of the pairs over f +- (PT_TURN + 1), for the report."""
    lo, hi = f - PT_TURN - 1, f + PT_TURN + 1
    if lo < 1 or hi >= len(g):
        return None, []
    z = {n: zoom_between(g[n - 1], g[n]) for n in range(lo, hi + 1)}
    for n in (f, f - 1, f + 1):
        if all(z[k] >= 1.01 for k in range(n - PT_TURN + 1, n + 1)) and all(z[k] <= 0.99 for k in range(n + 1, n + PT_TURN + 1)):
            return n, [z[k] for k in range(lo, hi + 1)]
    return None, [z[k] for k in range(lo, hi + 1)]


# ---------------------------------------------------------------- seams and carriers (docs/G5_BLOCKING.md §2b)

def lstar(rgb: np.ndarray) -> np.ndarray:
    """CIE L* (0-100) of an sRGB uint8 image (D65; luminance from the linear channels)."""
    c = rgb.astype(np.float32) / 255.0
    lin = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    y = lin[..., 0] * 0.2126 + lin[..., 1] * 0.7152 + lin[..., 2] * 0.0722
    f = np.where(y > (6 / 29) ** 3, np.cbrt(y), y / (3 * (6 / 29) ** 2) + 4 / 29)
    return 116 * f - 16


def seam_probe(a, scenes: list[dict], fps: float) -> None:
    """Render the film's seam probe (--seam-comp: 4 frames per seam, lib/sequence.tsx seamProbeFrames) and compare
    each seam's two builders at f - 1 and at f: share of pixels whose L* differs by more than 4."""
    import shutil  # noqa: PLC0415
    import tempfile  # noqa: PLC0415
    from PIL import Image  # noqa: PLC0415
    fr = lambda t: math.ceil(t * fps - 1e-6)  # noqa: E731
    seams = [(scenes[i - 1]["id"], s["id"], s["start"]) for i, s in enumerate(scenes) if i and (s.get("transitionIn") or {}).get("type") == "matchcut" and (s.get("transitionIn") or {}).get("seam")]
    if not seams:
        return
    n = 4 * len(seams)
    out = Path(a.seam_out) if a.seam_out else Path(tempfile.mkdtemp(prefix="seamprobe-"))
    out.mkdir(parents=True, exist_ok=True)
    times = ",".join(f"{k / fps:.6f}" for k in range(n))
    cmd = ["node", "scripts/render-frames.mjs", a.seam_comp, str(out), times, f"--entry={a.entry}", f"--scale={a.seam_scale}", "--concurrency=2"]
    try:
        res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=1800)
    except Exception as e:  # noqa: BLE001
        report("FAIL", "seams", f"the seam probe {a.seam_comp} did not render: {e}")
        return
    got = {}
    for line in res.stdout.splitlines():
        parts = line.split()
        if len(parts) == 3:
            got[round(float(parts[0]) * fps)] = (int(parts[1]), parts[2])
    if res.returncode or len(got) < n or any(got[k][0] != k for k in range(n) if k in got):
        report("FAIL", "seams", f"the seam probe {a.seam_comp} gave {len({v[0] for v in got.values()})} of {n} frames (scenes.json has {len(seams)} seams; "
               f"is the entry's probe built from the same scenes?): {res.stderr.strip()[-300:]}")
        return
    bad = 0
    lines = []
    for j, (o, i, c) in enumerate(seams):
        f = fr(c)
        shares = []
        for q, frame in ((0, f - 1), (2, f)):
            x = np.asarray(Image.open(got[4 * j + q][1]).convert("RGB"))
            y = np.asarray(Image.open(got[4 * j + q + 1][1]).convert("RGB"))
            dl = np.abs(lstar(x) - lstar(y))
            share = float((dl > 4).mean())
            shares.append((frame, share, dl))
        worst = max(sh for _, sh, _ in shares)
        msg = f"{o}|{i} at {c:.2f} s: " + ", ".join(f"frame {fm} {sh:.2%}" for fm, sh, _ in shares) + " of the pixels differ > 4 L* between the two builders"
        if worst > a.seam_max:
            fm, sh, dl = max(shares, key=lambda z: z[1])
            ys, xs = np.nonzero(dl > 4)
            k = W / dl.shape[1]
            report("FAIL", "seams", msg + f" (max {a.seam_max:.0%}; frame {fm} differs in x {xs.min() * k:.0f}-{xs.max() * k:.0f}, y {ys.min() * k:.0f}-{ys.max() * k:.0f})")
            bad += 1
        else:
            lines.append(msg)
    if not bad:
        report("PASS", "seams", f"{len(seams)} seam(s): the two builders draw the same frames (<= {a.seam_max:.0%} of the pixels > 4 L*): " + "; ".join(lines))
    if not a.seam_out:
        shutil.rmtree(out, ignore_errors=True)


def check_carriers(scenes: list[dict]) -> None:
    """CRAFT.md §a: every join names its carrier (A-F) and at most 2 are F. Opt-in by data: only when any scene
    declares a carrier (v1 / v2 never do)."""
    joins = scenes[1:]
    if not any("carrier" in (s.get("transitionIn") or {}) for s in joins):
        return
    letters = [(s["id"], (s.get("transitionIn") or {}).get("carrier")) for s in joins]
    missing = [sid for sid, c in letters if c not in tuple("ABCDEF")]
    plain = [sid for sid, c in letters if c == "F"]
    summary = " ".join(f"{sid}:{c}" for sid, c in letters)
    if missing:
        report("FAIL", "carriers", f"join(s) without a carrier A-F: {', '.join(missing)} ({summary})")
    elif len(plain) > 2:
        report("FAIL", "carriers", f"{len(plain)} plain cuts (F; at most 2, CRAFT.md §a): {', '.join(plain)}")
    else:
        report("PASS", "carriers", f"every join names its carrier, {len(plain)} plain cut(s): {summary}")


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
    ap.add_argument("--only", help="the MP4 is one scene alone (Film3Shot / <Film only>): its length, no cuts")
    ap.add_argument("--band", default="290,600", help="caption band y0,y1 (screen px)")
    ap.add_argument("--safe-x", default="90,950", help="caption x range (right rail beyond)")
    ap.add_argument("--max-chars", type=int, default=20)
    ap.add_argument("--frame0", help="frame-0 words, lines split by '|'")
    ap.add_argument("--frame0-until", type=float, default=0.0)
    ap.add_argument("--frame0-geom", default="{}", help="JSON: the film's own Frame0Text layout over Film.tsx's F0, e.g. "
                    '\'{"size":72,"baselines":[372,452],"captionBaseline":516,"captionScale":0.531,"spoken":"first"}\'')
    ap.add_argument("--cut-min", type=float, default=2.0, help="minimum mean grey difference of a cut (0-255)")
    ap.add_argument("--seam-comp", help="the film's seam probe composition (e.g. Film3Seams; needs --entry): compare each seam's two builders")
    ap.add_argument("--seam-scale", type=float, default=0.25, help="render scale of the seam probe (default 0.25)")
    ap.add_argument("--seam-max", type=float, default=0.01, help="max share of pixels differing > 4 L* at a seam (default 0.01)")
    ap.add_argument("--seam-out", help="keep the seam probe's frames here (default: a temp dir, deleted)")
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
    expect, windows, no_cut, seams = transition_model([] if a.only else scenes[1:], fps)
    miss = []
    used = set()
    declared, spikes = [], []
    for sid, f, mode in expect:
        hit = [c for c in cuts if abs(c - f) <= 1]
        zs: list[float] = []
        if not hit and mode == "push":
            # a push-through's cut at its DECLARED frame (the docstring): where Film's zoom turns from in to out
            n, zs = zoom_turn(g, f)
            if n is not None:
                hit = [n]
                declared.append(f"{sid} frame {f} (the zoom turns from in to out at frame {n}: x{zs[0]:.2f} .. x{zs[PT_TURN + 1]:.2f} | x{zs[PT_TURN + 2]:.2f} .. x{zs[-1]:.2f} per frame)")
        if not hit and mode in ("push", "bridge"):
            # a long dive: its zoom legs raise the neighbourhood median past the peak rule, but a scene change that does
            # not match is still a spike over the frames on either side of it
            sp = [n for n in (f - 1, f, f + 1) if 1 <= n < len(d) - 1 and d[n] >= a.cut_min and d[n] >= 1.5 * max(d[n - 1], d[n + 1])]
            if sp:
                n = max(sp, key=lambda k: d[k])
                hit = [n]
                spikes.append(f"{sid} frame {n} (d={d[n]:.1f}, x{d[n] / max(d[n - 1], d[n + 1], 1e-6):.1f} its neighbours)")
        if not hit and zs:
            report("WARN", "cuts", f"{sid}: no push-through turn at its declared frame {f} (zoom per frame over {f - PT_TURN - 1}-{f + PT_TURN + 1}: " + " ".join(f"{z:.2f}" for z in zs) + ")")
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
    seam_cut = []
    for sid, f in seams:
        hit = [c for c in cuts if abs(c - f) <= 1]
        if hit:
            used.add(hit[0])
            seam_cut.append(f"{sid}: a cut at frame {hit[0]} (d={d[hit[0]]:.1f})")
    if seam_cut:
        report("FAIL", "seams", f"{len(seam_cut)} of {len(seams)} seam(s) show a cut (a seam joins two identical frames): " + "; ".join(seam_cut))
    elif seams:
        report("PASS", "seams", f"no cut at the {len(seams)} seam(s): " + ", ".join(f"{sid} frame {f} d={d[f] if f < len(d) else float('nan'):.1f}" for sid, f in seams))
    in_tr = [c for c in cuts if c not in used and any(lo <= c <= hi for _, lo, hi in windows)]
    extra = [c for c in cuts if c not in used and c not in in_tr]
    trs = f"; {len(no_cut)} foreground wipe(s) without a cut" if no_cut else ""
    trs += f"; push-through cut(s) found at their declared frame: {', '.join(declared)}" if declared else ""
    trs += f"; push-through cut(s) found as a spike on the zoom legs: {', '.join(spikes)}" if spikes else ""
    trs += f"; {len(in_tr)} cut-like frame(s) inside transition windows (expected)" if in_tr else ""
    if miss:
        report("FAIL", "cuts", f"{len(miss)} scene start(s) without a cut within 1 frame: " + "; ".join(miss))
    elif expect:
        report("PASS", "cuts", f"all {len(expect)} cuts at their scene starts (+-1 frame)" + trs)
    elif no_cut:
        report("PASS", "cuts", trs.lstrip("; "))
    if extra:
        report("WARN", "cuts", f"{len(extra)} extra cut-like frame(s) inside shots: " + ", ".join(f"{c} ({c / fps:.2f} s, d={d[c]:.1f})" for c in extra[:12]))

    # ---- seams: the two builders' frames (the probe) and the carriers
    if seams and not a.only:
        if a.seam_comp and a.entry:
            seam_probe(a, scenes, fps)
        else:
            report("WARN", "seams", f"{len(seams)} seam(s): the two builders' frames were not compared (pass --entry and --seam-comp, e.g. Film3Seams)")
    if not a.only:
        check_carriers(scenes)

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
