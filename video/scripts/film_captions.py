#!/usr/bin/env python3
"""film_captions.py: caption pages (a hand-written paging file) + the voice's word timings -> the house CaptionBeat JSON.

  python3 -I scripts/film_captions.py --words public/v3/voice_words.json --pages src/v3/film/captions_pages.txt \
      --out src/v3/film/captions.json [--max-chars 20] [--hook] [--spell criticizing=criticising]

Pages file: '#' lines are comments; one page per paragraph (blank line between pages); one caption line per text line;
[brackets] mark a highlight (one phrase per bracket, never across two lines). Every voice word must appear exactly
once, in order (a voice token like "almost10%." may be split as "almost 10%." in the captions). The script aligns the
caption text to the voice by characters, so spelling must match the transcript (case and punctuation are free).
A page may end early with a directive line `@out <seconds>` (film seconds, between its first word and the next page):
it leaves the band at that time (SkyCaptions `out`: pop captions pop away in one frame) and the band stays empty until
the next page, e.g. while a push-through sweeps big shapes through the band (v3's J3).
A page may also carry `@hide`: its words stay in the file (the voice check still covers them) but the page is never
drawn (SkyCaptions `hide`: the band is empty for its time), because a board or sign in the shot carries the same words
in step with the voice (owner playbook: never the same words twice on screen at once; v2r REVIEW_1 MUST 3).

Output (src/lib/Captions.tsx CaptionBeat, one page per line): {s, e, lines: [{text, s}], highlights: [{text, s}]}, all
WORD-START seconds (the caption component applies its own leads; never shift times here). e = the next page's s (or
the page's `@out`, also written as "out"); the last page ends on the voice's durationSec. `@hide` writes "hide": true.
--hook gives page 1 style "hook" (x1.06). Exit 1 on any alignment error.

--spell VOICE=CAPTION (optional, repeatable): a caption token may spell a voice word differently, e.g. British
"criticising" inside a quote where the transcript says "criticizing". Only tokens the paging file actually writes with
the CAPTION spelling are mapped (so the paging file decides where: e.g. only the last token); a --spell that maps no
token is a warning. Without --spell the script behaves exactly as before.
"""
import argparse
import json
import re
import sys
from pathlib import Path


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def read_pages(path: Path) -> list[list[str]]:
    pages: list[list[str]] = []
    cur: list[str] = []
    for raw in path.read_text(encoding="utf8").splitlines():
        line = raw.strip()
        if line.startswith("#"):
            continue
        if not line:
            if cur:
                pages.append(cur)
                cur = []
            continue
        cur.append(line)
    if cur:
        pages.append(cur)
    return pages


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--words", required=True, help="voice word timings JSON: {durationSec, words: [{w, s, e}]}")
    ap.add_argument("--pages", required=True, help="paging file (see the docstring)")
    ap.add_argument("--out", required=True)
    ap.add_argument("--max-chars", type=int, default=20, help="warn above this many characters per line (+2 tolerated)")
    ap.add_argument("--hook", action="store_true", help='page 1 gets style "hook"')
    ap.add_argument("--spell", action="append", default=[], metavar="VOICE=CAPTION",
                    help="a caption spelling for a voice word, e.g. criticizing=criticising (repeatable)")
    a = ap.parse_args()
    spell: list[tuple[str, str]] = []  # (normalised caption spelling, normalised voice spelling)
    for sp in a.spell:
        if "=" not in sp or not all(norm(x) for x in sp.split("=", 1)):
            print(f"[film_captions] ERROR --spell '{sp}' is not VOICE=CAPTION", file=sys.stderr)
            return 1
        v, c = sp.split("=", 1)
        spell.append((norm(c), norm(v)))
    spell_used = {c: 0 for c, _ in spell}

    timing = json.loads(Path(a.words).read_text(encoding="utf8"))
    words = timing["words"]
    dur = float(timing.get("durationSec") or words[-1]["e"])
    # the voice as a character stream: char i -> index of the voice word it belongs to
    stream: list[tuple[str, int]] = []
    for wi, w in enumerate(words):
        for ch in norm(w["w"]):
            stream.append((ch, wi))

    pages = read_pages(Path(a.pages))
    pos = 0
    errors: list[str] = []
    warns: list[str] = []
    out = []

    def take(token: str, where: str) -> float:
        """Consume a caption token from the stream; return the start of the voice word its first character is in."""
        nonlocal pos
        n = norm(token)
        for c, v in spell:  # --spell: the caption's own spelling stands for the voice word
            if c in n and c != v:
                cand = n.replace(c, v)
                if "".join(ch for ch, _ in stream[pos:pos + len(cand)]) == cand:
                    n = cand
                    spell_used[c] += 1
                    break
        if not n:
            return words[stream[min(pos, len(stream) - 1)][1]]["s"]
        got = "".join(ch for ch, _ in stream[pos:pos + len(n)])
        if got != n:
            ctx = " ".join(w["w"] for w in words[stream[min(pos, len(stream) - 1)][1]:][:6])
            errors.append(f"{where}: caption '{token}' does not match the voice here ('{ctx} ...')")
            raise ValueError
        wi = stream[pos][1]
        pos += len(n)
        return float(words[wi]["s"])

    try:
        for pi, page0 in enumerate(pages):
            # directive lines ("@out <seconds>") belong to the page; everything else is a caption line
            out_at = None
            hide = False
            page = []
            for raw in page0:
                if raw.startswith("@"):
                    if raw.strip() == "@hide":
                        hide = True
                        continue
                    m = re.fullmatch(r"@out\s+([0-9]+(?:\.[0-9]+)?)", raw)
                    if not m:
                        errors.append(f"page {pi + 1}: unknown directive '{raw}' (only '@out <seconds>' and '@hide')")
                        raise ValueError
                    out_at = float(m.group(1))
                    continue
                page.append(raw)
            if not 1 <= len(page) <= 2:
                warns.append(f"page {pi + 1}: {len(page)} lines (pages are 1-2 lines)")
            lines = []
            hls = []
            for li, raw in enumerate(page):
                if raw.count("[") != raw.count("]"):
                    errors.append(f"page {pi + 1} line {li + 1}: unbalanced [ ] in '{raw}'")
                    raise ValueError
                text = raw.replace("[", "").replace("]", "")
                if len(text) > a.max_chars + 2:
                    warns.append(f"page {pi + 1}: line '{text}' has {len(text)} characters (max ~{a.max_chars})")
                # walk the line token by token; a highlight's s = its first token's word start
                line_s = None
                for m in re.finditer(r"\[([^\]]+)\]|([^\s\[\]]+)", raw):
                    if m.group(1):
                        toks = m.group(1).split()
                        s0 = None
                        for tk in toks:
                            s = take(tk, f"page {pi + 1}")
                            s0 = s if s0 is None else s0
                        hls.append({"text": m.group(1), "s": round(s0, 3)})
                        line_s = s0 if line_s is None else line_s
                    else:
                        s = take(m.group(2), f"page {pi + 1}")
                        line_s = s if line_s is None else line_s
                lines.append({"text": text, "s": round(line_s, 3)})
            entry = {"s": lines[0]["s"], "e": None, "lines": lines, "highlights": hls}
            if out_at is not None:
                entry["out"] = round(out_at, 3)
            if hide:
                entry["hide"] = True
            out.append(entry)
    except ValueError:
        pass
    if not errors and pos != len(stream):
        rest = " ".join(w["w"] for w in words[stream[pos][1]:][:8])
        errors.append(f"the pages end before the voice does (next voice words: '{rest} ...')")
    for c, k in spell_used.items():
        if not k and not errors:
            warns.append(f"--spell '{c}' mapped no caption token")
    for e in errors:
        print(f"[film_captions] ERROR {e}", file=sys.stderr)
    if errors:
        return 1
    for i, p in enumerate(out):
        nxt = out[i + 1]["s"] if i + 1 < len(out) else round(dur, 3)
        p["e"] = nxt
        if "out" in p:
            last_word = max([ln["s"] for ln in p["lines"]] + [h["s"] for h in p["highlights"]])
            if not last_word < p["out"] < nxt:
                errors.append(f"page {i + 1} '{p['lines'][0]['text']}': @out {p['out']} is not between its last word start ({last_word}) and the next page ({nxt})")
            p["e"] = p["out"]
        if p["e"] <= p["s"]:
            warns.append(f"page {i + 1} '{p['lines'][0]['text']}' is empty in time ({p['s']}..{p['e']})")
    for e in errors:
        print(f"[film_captions] ERROR {e}", file=sys.stderr)
    if errors:
        return 1
    if a.hook and out:
        out[0]["style"] = "hook"
    for w in warns:
        print(f"[film_captions] WARN {w}", file=sys.stderr)
    body = "[\n" + ",\n".join("  " + json.dumps(p, ensure_ascii=False, separators=(",", ":")) for p in out) + "\n]\n"
    Path(a.out).write_text(body, encoding="utf8")
    print(f"[film_captions] {len(out)} pages -> {a.out} ({out[0]['s']}..{out[-1]['e']} s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
