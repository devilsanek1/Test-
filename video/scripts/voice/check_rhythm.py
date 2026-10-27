"""Check a script's sentence rhythm: long sentences must be broken up by short ones.

Rule (owner, 2026-10-27, from a creator's reel): if every sentence is long the script sounds boring, so put short
sentences of 5 words or fewer between the long ones ("Let's find out." "But there was a problem."). See
docs/OWNER_PLAYBOOK.md, "Script and voice".

Input: a plain text or markdown file of spoken lines (an ElevenLabs paste file works: [tags] and blank lines are ignored).
Usage: python3 scripts/voice/check_rhythm.py SCRIPT.md [--max-run 2] [--long 9]
Exit 0 = OK, 1 = FAIL. Prints every sentence with its word count and marks the runs that break the rule.
"""
import re
import sys

SHORT = 5  # a short sentence: 5 words or fewer


def sentences(text):
    text = re.sub(r"\[[^\]]*\]", " ", text)           # delivery tags
    text = re.sub(r"^\s*(#|\||>|-{3,}).*$", " ", text, flags=re.M)  # headings, tables, quotes, rules
    text = text.replace("…", ". ").replace("...", ". ")
    parts = re.split(r"(?<=[.!?])\s+|\n\s*\n", text)
    out = []
    for p in parts:
        p = " ".join(p.split())
        words = re.findall(r"[\w'’$%€-]+", p)
        if words:
            out.append((p, len(words)))
    return out


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2
    max_run, long_ = 2, 9
    if "--max-run" in args:
        max_run = int(args[args.index("--max-run") + 1])
    if "--long" in args:
        long_ = int(args[args.index("--long") + 1])
    sents = sentences(open(args[0], encoding="utf-8").read())
    if not sents:
        print("FAIL: no sentences found")
        return 1

    run, bad_runs, flags = 0, [], set()
    for i, (_, n) in enumerate(sents):
        if n > SHORT:
            run += 1
            if run > max_run:
                flags.add(i)
                if run == max_run + 1:
                    bad_runs.append(i - max_run)
        else:
            run = 0
    n_short = sum(1 for _, n in sents if n <= SHORT)
    n_long = sum(1 for _, n in sents if n >= long_)

    for i, (s, n) in enumerate(sents):
        mark = "SHORT" if n <= SHORT else ("RUN!" if i in flags else "")
        print(f"{n:3d}w {mark:5s} {s}")
    share = n_short / len(sents)
    print(f"\n{len(sents)} sentences, {n_short} short (<= {SHORT} words, {share:.0%}), {n_long} long (>= {long_} words)")

    problems = []
    if bad_runs:
        problems.append(f"{len(bad_runs)} run(s) of more than {max_run} sentences over {SHORT} words in a row "
                        f"(starting at sentence {', '.join(str(b + 1) for b in bad_runs)}): break each with a short sentence")
    if share < 0.25:
        problems.append(f"only {share:.0%} short sentences; aim for at least about a quarter")
    if problems:
        print("FAIL: " + "; ".join(problems))
        return 1
    print("OK: long sentences are broken up by short ones")
    return 0


if __name__ == "__main__":
    sys.exit(main())
