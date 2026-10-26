#!/usr/bin/env python3
"""gate_check.py: the scripted gate check for any film render (PIPELINE_V2 anti-waste rule 1: the mechanical checks
before G6, instead of review agents). Generic: any entry / composition + its MP4 + its scenes / captions JSON.

  python3 -I scripts/qa/gate_check.py --mp4 out/v3_g5.mp4 --scenes src/v3/film/scenes.json \
      --captions src/v3/film/captions.json --voice public/v3/voice.wav \
      [--entry src/entry-v3-film.tsx --comp Film3] [--fps 60] [--only S9] \
      [--frame0 "AI is making your|next laptop pricier." --frame0-until 3.37] [--json report.json]

Checks (FAIL = exit 1; WARN never fails):
  fps        the video stream is --fps (default 60); with --entry/--comp also the composition's own fps and length
             (`npx remotion compositions`).
  duration   video frames = ceil(voice seconds * fps) (+-1 frame); with --only ID: that panel's length. scenes.json and
             captions.json end on the voice (+-1 frame).
  audio      an audio stream exists, starts at 0 and lasts as long as the video (+-2 frames: A/V sync).
  cuts       hard cuts detected in the MP4 (frame difference outside the caption band and the draft label strip, a
             local peak well above its neighbourhood) vs the scenes' starts: every scene start must have a detected cut
             within 1 frame (first frame of a scene = ceil(start * fps)). Extra detected cuts are listed as WARN
             (a big in-shot event looks like a cut).
  captions   from the JSON, laid out like SkyCaptions (src/lib/Captions.tsx, tokens read from src/lib/theme.ts,
             glyph extents from the caption font): every page's ink and highlight boxes inside the caption band
             (--band, default 290-600) and inside the caption clip (no clipped letters), lines within the safe width
             (x 90-950: the right rail), 1-2 lines per page, ~20 characters per line (WARN), pages in time order.
             --frame0: the frame-0 words (Film `frame0`, lines split by '|') and the spoken pages lowered under them,
             with Film.tsx's F0 layout.
Works on any render scale (quarter-scale smoke renders included): cut detection runs on a 90 x 160 grey copy.
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
    bad = 0
    prev_s = -1.0
    for i, b in enumerate(caps):
        tag = f"page {i + 1} '{' / '.join(l['text'] for l in b['lines'])}'"
        if b["s"] < prev_s:
            report("FAIL", "captions", f"{tag} starts before the page before it")
            bad += 1
        prev_s = b["s"]
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
        for i, text in enumerate(f0_lines):
            bl = f0["baselines"][min(i, len(f0["baselines"]) - 1)]
            t, bt = font.ink(text, size)
            top, bot = bl + t, bl + bt
            if i == len(f0_lines) - 1:
                top, bot = min(top, bl - hb["topEm"] * size), max(bot, bl + hb["bottomEm"] * size)
            w = font.width(text, size)
            if top < band[0] - 0.5 or bot > band[1] + 0.5 or sky["cx"] - w / 2 < x_lo or sky["cx"] + w / 2 > x_hi:
                report("FAIL", "captions", f"frame-0 words '{text}': y {top:.0f}-{bot:.0f}, x {sky['cx'] - w / 2:.0f}-{sky['cx'] + w / 2:.0f} outside the band / safe width")
                bad += 1
        # the frame-0 words must clear the lowered captions under them
        f0_bottom = f0["baselines"][min(len(f0_lines), len(f0["baselines"])) - 1] + hb["bottomEm"] * size
        low = [b for b in caps if b["s"] - lead < lower_until]
        for b in low:
            for ln in page_layout(b, sky, typ, font):
                y_top = f0["captionBaseline"] + (ln["baseline"] - hb["topEm"] * ln["size"] - sky["oneLine"]) * f0["captionScale"]
                if y_top < f0_bottom - 0.5:
                    report("FAIL", "captions", f"lowered page '{ln['text']}' (top y {y_top:.0f}) overlaps the frame-0 words (bottom y {f0_bottom:.0f})")
                    bad += 1
    end = caps[-1].get("e", caps[-1]["s"]) if caps else 0
    if abs(end - voice_s) > 1 / fps + 1e-6:
        report("FAIL", "captions", f"the last page ends at {end:.3f} s, the voice at {voice_s:.3f} s")
        bad += 1
    if not bad:
        report("PASS", "captions", f"{len(caps)} pages inside the band {band[0]:.0f}-{band[1]:.0f} and the clip {clip[0]:.0f}-{clip[1]:.0f}, x {x_lo}-{x_hi}" + (f"; frame-0 words + {len([b for b in caps if b['s'] - lead < lower_until])} lowered pages" if f0_lines else ""))


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
    ap.add_argument("--cut-min", type=float, default=2.0, help="minimum mean grey difference of a cut (0-255)")
    ap.add_argument("--json", help="write the results here")
    a = ap.parse_args()
    a.safe_x = tuple(int(x) for x in a.safe_x.split(","))

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
    expect = [] if a.only else [(s["id"], math.ceil(s["start"] * fps - 1e-6)) for s in scenes[1:]]
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
    extra = [c for c in cuts if c not in used]
    if miss:
        report("FAIL", "cuts", f"{len(miss)} scene start(s) without a cut within 1 frame: " + "; ".join(miss))
    elif expect:
        report("PASS", "cuts", f"all {len(expect)} cuts at their scene starts (+-1 frame)")
    if extra:
        report("WARN", "cuts", f"{len(extra)} extra cut-like frame(s) inside shots: " + ", ".join(f"{c} ({c / fps:.2f} s, d={d[c]:.1f})" for c in extra[:12]))

    # ---- captions
    check_captions(caps, a, voice_s, fps)
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
