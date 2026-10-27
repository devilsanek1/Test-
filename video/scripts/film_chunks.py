#!/usr/bin/env python3
"""film_chunks.py: the CHUNK LIST of a film for the chunked full-size render (docs/G5_BLOCKING.md §8b), one line per
chunk, "idx id first last n" (the format the chunked render / join scripts read):

  python3 -I scripts/film_chunks.py src/v3/film/scenes.json > chunks.txt
  python3 -I scripts/film_chunks.py src/v3/film/scenes.json --max 360 > chunks.txt   # split long sequences

One chunk per scene, on Film's OWN boundaries: a scene's first frame is ceil(start * fps) (Film switches on the first
frame with t >= start), so no chunk starts with the previous scene's last frame (the G5b list used round() and three
chunks did: a fix to one scene then had to re-render the next chunk too). The last scene runs to ceil(end * fps) - 1,
the film's last frame. --max N splits a scene longer than N frames into near-equal parts named <id>.1, <id>.2, ...
(e.g. SQE's 821 frames), so a fix re-renders less and long chunks can run side by side. Chunk borders are invisible
after a stream-copy join (one composition, one encode per frame); the audio comes from one direct render.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path


def chunks(scenes: list[dict], fps: float, end: float | None, max_n: int | None) -> list[tuple[str, int, int]]:
    sc = sorted(scenes, key=lambda s: s["start"])
    fr = lambda t: math.ceil(t * fps - 1e-6)  # noqa: E731  (Film / gate_check rounding)
    total = fr(end if end is not None else max(s["end"] for s in sc))
    out: list[tuple[str, int, int]] = []
    for i, s in enumerate(sc):
        a = fr(s["start"]) if i else 0
        b = (fr(sc[i + 1]["start"]) if i + 1 < len(sc) else total) - 1
        n = b - a + 1
        if n <= 0:
            continue
        k = math.ceil(n / max_n) if max_n and n > max_n else 1
        for j in range(k):
            lo = a + (n * j) // k
            hi = a + (n * (j + 1)) // k - 1
            out.append((s["id"] if k == 1 else f"{s['id']}.{j + 1}", lo, hi))
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("scenes", help="the film's scenes.json")
    ap.add_argument("--fps", type=float, default=60)
    ap.add_argument("--end", type=float, help="the film's end in seconds (default: the last scene's end = the voice)")
    ap.add_argument("--max", type=int, help="split a scene longer than this many frames into near-equal parts")
    a = ap.parse_args()
    rows = chunks(json.loads(Path(a.scenes).read_text()), a.fps, a.end, a.max)
    for idx, (cid, lo, hi) in enumerate(rows):
        print(f"{idx:02d} {cid} {lo} {hi} {hi - lo + 1}")
    total = sum(hi - lo + 1 for _, lo, hi in rows)
    print(f"{len(rows)} chunks, {total} frames", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
