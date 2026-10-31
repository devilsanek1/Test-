#!/usr/bin/env python3
"""Check the small owner playbook against the full one archived before it was made small (PLAN.md step 6).

Usage (from anywhere):
    python3 video/docs/process/check_playbook_quotes.py            # check and write the report
    python3 video/docs/process/check_playbook_quotes.py --no-write # check only

Three checks, all on the text with its line wrapping undone:
1. Every double-quoted string of the archived playbook is looked up in the live one: KEPT (its words are there),
   KEPT IN PART (a quote of the live file is a piece of it) or DROPPED (it lives on in the archive only).
   The report lists the KEPT IN PART and DROPPED ones by section and rule, so the owner sees what moved.
2. Every double-quoted string of the live playbook must be words from the archive, exactly (each piece between
   "..." elisions is looked up): a miss would be a paraphrase inside quotes. Any miss is an ERROR.
3. Every rule title of the archive (the bold lead of a bullet, numbered item or paragraph) is in the live file (as a
   rule title, or inside another rule: merged), or TITLE_MAP below says what happened to it (shortened, rewritten to a
   newer owner note, merged into a named live rule, or retired). A title in neither is a lost rule: an ERROR, as is a
   TITLE_MAP target the live file doesn't have.

Writes `playbook_dropped_quotes.md` beside this script. Exit status 1 on any ERROR.
"""
import argparse
import datetime
import pathlib
import re
import sys

VIDEO = pathlib.Path(__file__).resolve().parents[2]
ARCHIVE = VIDEO / "docs/archive/OWNER_PLAYBOOK_full_2026-10-31.md"
LIVE = VIDEO / "docs/OWNER_PLAYBOOK.md"
REPORT = pathlib.Path(__file__).resolve().parent / "playbook_dropped_quotes.md"
ARCHIVE_HEADER = "Archived 2026-10-31:"

# What happened to each archived rule title that the live file no longer carries word for word.
# (start of the old title, status, start of the live rule that holds it now (or None), the note for the owner)
TITLE_MAP = [
    ("Last reviewed for coherence", "updated", "Last reviewed for coherence",
     "the line now records this pass: 2026-10-31, made small"),
    ("Rhythm: never a monotone run of long sentences", "shortened", "Rhythm: never a monotone run of long sentences",
     "the checker's limits (5 words, 3 long sentences) live in `scripts/voice/check_rhythm.py`"),
    ("Learn from the city posters and experiment with that style in our films", "updated",
     "Learn from the city posters and experiment with that style in our films",
     "\"starting from v2's look\" dropped: no film of ours is the bar or the example (THE THREE RULES, 2026-10-30)"),
    ("A full value range", "updated", "A full value range",
     "\"in the references' low key: small darks at the focal and one or two big quiet dark masses below the caption "
     "band\" retired: how dark, and where, follows each scene's mood and setup (owner, 2026-10-31; see Retired rules)"),
    ("Every video has ONE core line, picked before the script", "shortened",
     "Every video has ONE core line, picked before the script", "the topic-screen detail moved into the rule's text"),
    ("State the payoff in words within the first ~2 s", "shortened",
     "State the payoff in words within the first ~2 s, in the voice's order",
     "\"polish the first 2 s and 5 s most, then the first 10 s\" became \"polish the opening most\""),
    ("Every frame at least 8/10, no dead frames, joins on the beat", "merged", "No dead frames, joins on the beat",
     "the 8/10 bar is THE THREE RULES' \"every frame is worth pausing on\" (2026-10-30)"),
    ("The film's visual story is written first, as a VISUAL SCRIPT", "updated", "The order: the story beats",
     "rewritten to the owner's 2026-10-30 order: the visual script (the shot plan) is written from the key frames"),
    ("The pipeline after v3", "merged", "The order: the story beats",
     "its designed sketch and look clip are replaced by the key frames (THE LOOP NOW, 2026-10-30; see Retired rules); "
     "the through-line card lives in Hook and pacing"),
    ("G3 is the most important gate", "updated", "G3 is the most important gate",
     "the animatic now plays the key frames (2026-10-30); the grey placeholders are retired"),
    ("Palettes: the clean \"news\" one (Cream & Cobalt) for a serious story", "merged",
     "Palettes: the warm, everyday one for a money / everyday-life story", ""),
    ("When the owner hands a pick over", "merged", "When the owner hands a call over, make it",
     "the pick's three criteria (engagement, pleasantness, attention retention) are in that rule"),
    ("When the owner hands a call over, make it", "shortened", "When the owner hands a call over, make it", ""),
    ("Parallelize as much as possible", "shortened", "Parallelize as much as possible", ""),
    ("Playable video from the sketch animatic (G3) on", "updated", "Playable video from the animatic (G3) on",
     "\"before G3 text and audio only\" and \"one look clip\" updated to THE LOOP NOW: the ideas, the hero frame and the "
     "key frames come before the animatic (2026-10-30)"),
    ("The engine and the process serve the production", "shortened",
     "The engine and the process serve the production; the films are the customer",
     "a piece of the owner's words in the old title is now the rule's quote"),
    ("Spend on the film, never on overhead", "shortened", "Spend on the film, never on overhead",
     "the owner's words in the old title are in the archive; the rule quotes his 2026-10-28 words on quality"),
]

# Places where the small file changes a rule's meaning, to match a newer owner note (shown at the top of the report).
INTEGRATIONS = [
    "**A full value range** (Visual style): the references' low key as every scene's key (one or two big quiet dark "
    "masses below the caption band, decided under the owner's hand-over on 2026-10-30 and built in painter v7) is "
    "retired: how dark, and where, follows each scene's mood and setup (owner, 2026-10-31: \"each scene would have a "
    "different contrast level depending on what is shown and what the mood and setup is\"; on v7: \"we lost the "
    "feeling\"). Real darks where the eye should go, never confetti, never a pastel band, stay.",
    "**Learn from the city posters** and **Arcane references** (Visual style): \"starting from v2's look\" and \"build on "
    "our own videos\" dropped, because no film of ours is the bar or the example (THE THREE RULES, 2026-10-30). What the "
    "owner liked in v2 stays where a rule needs it, as his words (the eye-level view: DEPTH AND SCALE FROM A HUMAN "
    "VIEWPOINT).",
    "**Storyboard (G3) and flow:** the designed sketch, its grey placeholders and the separate look clip (the pipeline "
    "after v3) are folded into the 2026-10-30 order the file already announced: the beats, the ideas, the key frames "
    "made whole (approved by the owner), the shot plan (the visual script, written from the key frames), the animatic. "
    "Two lines follow from it: Process's \"before G3 text and audio only\" now reads \"before it, text, audio and the "
    "frames\", and the rules that were to be settled \"in the G4 look clip\" (the water, the paper edges, the texture) "
    "no longer name it.",
    "**No dead frames, joins on the beat** (Hook and pacing): \"every frame at least 8/10\" is now THE THREE RULES' "
    "\"every frame is worth pausing on\".",
]

# The archive's "Retired rules" section is struck-through lines with no bold title, so the title check skips them.
RETIRED_NOTE = (
    "The archive's \"Retired rules\" section ({old} struck-through lines) is kept in the live file as {new} one-line "
    "entries, related ones grouped (the grey placeholders, the designed sketch, the look clip and the density filled in "
    "later; the rough ink line and the outlines; the faceless people and the closed eyes; the successive darks rules); "
    "five old lines that later rules had already replaced in full (G3 "
    "animating only where timing is the question; frame 0 as bare ink lines; something new from any element; cuts "
    "locked to the beat; the G4 look as stills beside G3) are in the archive only. New in the live list: the visual "
    "script before the ideas, the references' low key in every scene, and \"No size budget\"."
)

# Quoted strings that are not the owner's words (script lines, connectors, banned phrases, labels), marked in the report.
NOT_OWNER = {
    "Buying a laptop soon?", "Here's the thing", "The catch?", "Turns out", "Let that sink in", "Actually,", "So,",
    "Now,", "So how does it work?", "Or in other words,", "Normally,", "The result is that", "The result? X.",
    "In other words, [zinger]", "Let's find out.", "But Helsinki wants that heat.", "To put that into perspective,",
    "The chips get that hot.", "the chips", "a cabinet of them", "buildings called data centers",
    "one stack of these computers", "the X", "those X", "that hot", "What I mean is: ___", "first dibs",
    "by the mountain", "nobody's even ...", "as much heat as forty kettles", "like forty kettles", "how?",
    "which chips?", "Did you know that ...", "find Pip", "for density", "for the sake of density", "more stuff",
    "a feel of distance", "contrastful, to give feeling X", "does this sound like an ad or bait?", "look here",
    "the language everyone loves", "the strange part isn't how high", "Or in other words, ...", "Normally, ...",
    "Did you know Helsinki wants AI to heat seventy thousand homes?", "Why This Skyscraper Curves Back Down??",
    "G5: G3's plan in colour; next: G6 easing, G7 sound, full res", "frame0", "Add to cart", "helped", "did",
    "you", "you pick", "it", "they", "this", "that", "but", "so", "because", "and also", "top 3", "weirdest places",
    "oh", "why", "wait, seriously?", "Did you know ...", "almost everywhere", "But Helsinki WANTS it",
    "-> what we did", "Review owner playbook", "Retired", "Last reviewed", "No size budget", "brisk",
    "THE LOOP NOW", "A RICH, BEAUTIFUL WORLD", "THE FRAME LOOP", "The opening", "Scale cues", "Checks",
    "How a 40-second script is structured", "a 69% chance of breaking every climate record in human history, and "
    "people aren't really ready for it", "Did you know that New York once got a proposal to build this giant "
    "2,000-foot tall bending skyscraper? It's called the Big Bend.", "Lines", "at most 3 places", "twist",
    "One Small Window", "WANTS", "scribble-mass placeholders", "fork", "10 Canal Mint", "no glow, no gradient",
    "loose never means empty", "no outlines",
}

BULLET = re.compile(r"^(\s*)(?:[-*]|\d+\.)\s+(.*)$")
HEADING = re.compile(r"^(#{1,6})\s+(.*)$")
CODE = re.compile(r"`[^`]*`")
ELISION = re.compile(r"\s*(?:\.\.\.|…)\s*")


def norm(s):
    return " ".join(s.split())


def plain(s):
    return norm(s.replace("**", "").replace("~~", ""))


def bare(title):
    return norm(title).rstrip(" :;.,").strip()


def section_name(heading):
    # "Visual style (one page: ...)" -> "Visual style"; "Storyboard (G3) and flow" stays whole
    name = re.sub(r"\s*\([^()]*\)\s*$", "", heading.strip()).strip()
    return name or heading.strip()


class Unit:
    def __init__(self, section, indent, content_indent, text, parent, kind):
        self.section, self.indent, self.content_indent = section, indent, content_indent
        self.lines, self.parent, self.kind = [text], parent, kind

    @property
    def text(self):
        return norm(" ".join(self.lines))

    @property
    def title(self):
        m = re.match(r"\*\*(.+?)\*\*", self.text)
        if m and m.group(1).startswith("(Changed"):
            # a bold dated note in front of the rule ("(Changed 2026-10-30: ...)"): the rule's title is the next bold span
            nxt = re.match(r"\s*\*\*(.+?)\*\*", self.text[m.end():])
            return bare(nxt.group(1)) if nxt else bare(m.group(1))
        return bare(m.group(1)) if m else None

    @property
    def label(self):
        own = self.title or (" ".join(plain(self.text).split()[:9]) + " ...")
        return f"{self.parent.label} > {own}" if self.parent is not None else own


def parse(path):
    lines = path.read_text(encoding="utf-8").splitlines()
    if lines and lines[0].startswith(ARCHIVE_HEADER):
        lines = lines[1:]
    units, stack, para, section, prev_blank = [], [], None, "(header)", True
    for raw in lines:
        if not raw.strip():
            prev_blank, para = True, None
            continue
        h = HEADING.match(raw)
        if h:
            section = section_name(h.group(2)) if h.group(1) == "##" else section
            stack, para, prev_blank = [], None, False
            continue
        indent = len(raw) - len(raw.lstrip(" "))
        b = BULLET.match(raw)
        if b:
            ind = len(b.group(1))
            while stack and stack[-1].indent >= ind:
                stack.pop()
            unit = Unit(section, ind, b.start(2), b.group(2), stack[-1] if stack else None, "item")
            units.append(unit)
            stack.append(unit)
            para = None
        elif indent > 0 and stack:
            target = next((u for u in reversed(stack) if u.content_indent <= indent), stack[0])
            target.lines.append(raw.strip())
        elif not prev_blank and (para or stack):
            (para or stack[-1]).lines.append(raw.strip())
        else:
            stack = []
            para = Unit(section, 0, 0, raw.strip(), None, "para")
            units.append(para)
        prev_blank = False
    return units


def quotes_of(text):
    """The outermost double-quoted spans of a unit's text, nesting-aware: an owner quote may hold his own inner quotes
    ("... like "layers and feel of distance" and ..."). A mark after a space or an opening bracket (or at the start)
    opens; a mark before a space, punctuation or the end closes; between two non-spaces it closes when one is open."""
    s = CODE.sub("`code`", plain(text))
    spans, depth, start = [], 0, 0
    for i, ch in enumerate(s):
        if ch != '"':
            continue
        before = s[i - 1] if i > 0 else " "
        after = s[i + 1] if i + 1 < len(s) else " "
        opens = (before.isspace() or before in "([{/—-:;") and not after.isspace()
        closes = not before.isspace() and (after.isspace() or after in ".,;:!?)]}/—-'’") or (depth and not opens)
        if depth and (closes or not opens):
            depth -= 1
            if depth == 0:
                spans.append(s[start:i])
        else:
            if depth == 0:
                start = i + 1
            depth += 1
    return [q for q in spans if q.strip()]


def retired_lines(path):
    """The struck-through lines of a playbook's "Retired rules" section."""
    inside, n = False, 0
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            inside = line.startswith("## Retired rules")
        elif inside and line.startswith("- ~~"):
            n += 1
    return n


def words(path):
    """Words as `wc -w` counts them in the POSIX locale (PLAN.md's measure): a token counts only if it has a printable
    ASCII character, so a standalone em dash is no word."""
    lines = path.read_text(encoding="utf-8").splitlines()
    if lines and lines[0].startswith(ARCHIVE_HEADER):
        lines = lines[1:]
    return sum(1 for tok in re.split(r"[ \t\n\r\f\v]+", "\n".join(lines)) if re.search(r"[!-~]", tok))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--archive", type=pathlib.Path, default=ARCHIVE)
    ap.add_argument("--live", type=pathlib.Path, default=LIVE)
    ap.add_argument("--report", type=pathlib.Path, default=REPORT)
    ap.add_argument("--no-write", action="store_true", help="check only; don't write the report")
    args = ap.parse_args()

    old_units, new_units = parse(args.archive), parse(args.live)
    old_plain = plain(args.archive.read_text(encoding="utf-8"))
    new_plain = plain(args.live.read_text(encoding="utf-8"))
    new_quotes = sorted({q.strip() for u in new_units for q in quotes_of(u.text)}, key=len, reverse=True)
    errors = []

    # 2. The live file's quotes are the owner's exact words (each piece between elisions is in the archive).
    for q in new_quotes:
        for piece in ELISION.split(q):
            if len(piece.strip()) > 1 and piece.strip() not in old_plain:
                errors.append(f'quote not in the archive word for word (a paraphrase?): "{q}" (piece: "{piece}")')

    # 1. Each archived quote: kept, kept in part, or dropped.
    def status(q):
        s = q.strip()
        if f'"{q}"' in new_plain or any(s in nq for nq in new_quotes) or (len(s.split()) >= 3 and s in new_plain):
            return "kept", []
        parts = [nq for nq in new_quotes if len(nq.split()) >= 3 and nq in s]
        return ("part", parts) if parts else ("dropped", [])

    by_section, counts = {}, {"kept": 0, "part": 0, "dropped": 0}
    for u in old_units:
        for q in quotes_of(u.text):
            st, parts = status(q)
            counts[st] += 1
            if st != "kept":
                by_section.setdefault(u.section, {}).setdefault(u.label, []).append((st, q, parts))

    # 3. Rule titles.
    new_titles = {u.title: u for u in new_units if u.title}
    title_rows, tcounts, used_map = {}, {}, set()
    for u in old_units:
        t = u.title
        if not t:
            continue
        if t in new_titles:
            st, where = "same", "kept as a rule title"
        elif plain(t) in new_plain:
            holder = next((n for n in new_units if plain(t) in plain(n.text)), None)
            st = "merged"
            where = f"kept word for word inside **{holder.label}**" if holder else "kept word for word"
        else:
            entry = next((m for m in TITLE_MAP if t.startswith(bare(m[0]))), None)
            if entry is None:
                st, where = "LOST", "not in the live file and not in TITLE_MAP"
                errors.append(f"rule title lost: {t!r} ({u.section})")
            else:
                used_map.add(entry[0])
                st, target, note = entry[1], entry[2], entry[3]
                found = target is None or any(n.title and n.title.startswith(bare(target)) for n in new_units) \
                    or plain(target) in new_plain
                if not found:
                    errors.append(f"TITLE_MAP target missing from the live file: {target!r} (for {t!r})")
                verb = {"shortened": "same rule, title shortened to", "updated": "same rule, rewritten:",
                        "merged": "merged into", "same": "same rule, title now", "retired": "retired;"}[st]
                where = f"{verb} **{target}**" if target else verb
                where += f" ({note})" if note else ""
        tcounts[st] = tcounts.get(st, 0) + 1
        title_rows.setdefault(u.section, []).append((t, st, where))
    unused = [m[0] for m in TITLE_MAP if m[0] not in used_map]

    w_old, w_new = words(args.archive), words(args.live)
    total_q = sum(counts.values())
    summary = [
        f"- Words: {w_old:,} -> {w_new:,} (`wc -w`; the archive's one-line header not counted).",
        f"- Quoted strings in the archived playbook: {total_q}; their words are still in the live file for "
        f"{counts['kept']}, in part for {counts['part']}, and in the archive only for {counts['dropped']}.",
        f"- Quotes in the live file that are not the archive's exact words: "
        f"{sum(1 for e in errors if e.startswith('quote'))} (each live quote is the owner's words, or a line we quoted, "
        f"exactly as the archive has it).",
        "- Rule titles (bold leads) in the archive: " + str(sum(tcounts.values())) + ": "
        + ", ".join(f"{v} {k}" for k, v in sorted(tcounts.items())) + "; lost: " + str(tcounts.get("LOST", 0)) + ".",
    ]

    if not args.no_write:
        out = [
            "# Playbook step 6: what moved to the archive",
            "",
            f"Generated {datetime.date.today().isoformat()} by `python3 video/docs/process/check_playbook_quotes.py` "
            "(PLAN.md step 6): the small `docs/OWNER_PLAYBOOK.md` checked against the full playbook archived unchanged "
            "at `docs/archive/OWNER_PLAYBOOK_full_2026-10-31.md`. Nothing the owner said is lost: the archive keeps every "
            "word. This page lists what the live file no longer carries, so the owner can see it in one place.",
            "",
            "## Summary",
            *summary,
            "",
            "## Changes of meaning (a rule brought in line with a newer owner note)",
            *[f"- {i}" for i in INTEGRATIONS],
            "",
            "## Retired rules",
            RETIRED_NOTE.format(old=retired_lines(args.archive), new=retired_lines(args.live)),
            "",
            "## Every rule title: kept, merged, rewritten or retired (by section)",
            "\"same\": the title is a rule title in the live file, word for word; \"merged\": its words are inside "
            "another rule; the others say what happened. Retired rules that were already in the archive's \"Retired "
            "rules\" have no title (they are struck through) and keep one line each in the live file.",
        ]
        def short(t, n=100):
            return (t if len(t) <= n else t[: n - 3].rstrip() + "...").replace("|", "/")

        for sec, rows in title_rows.items():
            out += ["", f"### {sec}", "", "| Old rule title | Now |", "|---|---|"]
            for t, st, where in rows:
                out.append(f"| {short(t)} | {'same' if st == 'same' else st + ': ' + where.replace('|', '/')} |")
        out += [
            "",
            "## The owner's quotes that live in the archive only now (by section and rule)",
            "A dropped quote is shown in full. \"(in part)\": the live rule keeps the quote's decisive piece, and the "
            "whole quote, shown here by its opening words, is in the archive. The last line of a section lists the "
            "lines and labels we had quoted there that are not the owner's words (script lines, connectors, banned "
            "phrases, doc labels).",
        ]
        for sec, rules in by_section.items():
            out += ["", f"### {sec}"]
            ours = []
            for label, items in rules.items():
                mine = [(st, q) for st, q, _ in items if q.strip() not in NOT_OWNER]
                ours += [q.strip() for _, q, _ in items if q.strip() in NOT_OWNER]
                if mine:
                    out += ["", f"**{short(label, 110)}**"]
                    for st, q in mine:
                        if st == "part":
                            head = q.strip().split()
                            opening = " ".join(head[:14]) + (" ..." if len(head) > 14 else "")
                            out.append(f'- (in part) "{opening}"')
                        else:
                            out.append(f'- "{q.strip()}"')
            if ours:
                out += ["", "Not the owner's: " + "; ".join(f'"{q}"' for q in dict.fromkeys(ours)) + "."]
        out.append("")
        args.report.write_text("\n".join(out), encoding="utf-8")

    print("\n".join(summary))
    for m in unused:
        print("note: TITLE_MAP entry not needed (its title is in the live file word for word):", m)
    for e in errors:
        print("ERROR:", e)
    if not args.no_write:
        print(f"report: {args.report}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
