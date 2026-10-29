"""Check a script for what makes a regular listener stumble on ONE hearing: trade words, pointers with no single
target, vague scope, idioms, numbers by ear.

Rule (owner, v4 G1, 2026-10-29): CLEAR TO A REGULAR PERSON ON ONE HEARING (docs/OWNER_PLAYBOOK.md, "Script and
voice"; principles, research and the v1-v5 corpus: docs/retro/2026-10-29_script_clarity/PRINCIPLES.md; this tool's
spec: LINT_SPEC.md there; its build report: LINT_REPORT.md there). It finds the failures a script can find reliably
and turns each into a question for the writer and, after the cold pass, for the G1 critic's viewer panel. It never
passes a line: OK means none of its patterns fired, never that the script is clear (a readability formula rates "The
chips get that hot." the easiest line of v4's draft 1).

Input: a plain text or markdown file of spoken lines; an ElevenLabs paste works ([tags], headings and blank lines are
ignored; sentences are split and numbered by check_rhythm.py's own splitter, so the numbers match).
Usage (from video/):
  python3 scripts/voice/check_clarity.py SCRIPT.md                     # every sentence with its flags, then the summary
  python3 scripts/voice/check_clarity.py SCRIPT.md --film CLARITY.json # with the film's word list
  python3 scripts/voice/check_clarity.py SCRIPT.md --no-film           # ignore docs/vN/script/clarity.json
  python3 scripts/voice/check_clarity.py SCRIPT.md --questions         # also the panel's targeted questions
  python3 scripts/voice/check_clarity.py SCRIPT.md --quiet             # only the flagged sentences and the summary
  python3 scripts/voice/check_clarity.py SCRIPT.md --json              # machine-readable, for workflows
  python3 scripts/voice/check_clarity.py --selftest                    # the regression set (clarity_tests/)
Without --film, a script under docs/vN/ uses docs/vN/script/clarity.json when it exists, and the report says which.
Exit 0 = OK (no errors; each warning is fixed or answered in the script doc's "Checks" section), 1 = FAIL (fix each
error, or allow it in the film's list with a reason), 2 = a usage error or a missing library (the install line).

Errors:   C1 a trade word or a false friend ("chips") at its first use, not described plainly; C2 a pointer with
          rivals or no target (a short line, rivals side by side, a "they" with no plural thing); C3 a vague scope
          ("almost everywhere"); C4 an idiom a worldwide ear must decode ("first dibs").
Warnings: W1 a pointer with rivals in a longer line; W2 a pointer at a whole idea ("That's", "did it"); W3 a degree
          with nothing to point at ("that hot"); W4 a first mention with "the/those/this"; W5 no doer ("gets
          dumped", "someone"); W6 a figurative phrasal verb; W7 a scolding or outrage frame; W8 a rare word or an
          unknown name (Zipf < 3.0); W9 numbers (two in a sentence, a multiplier, a percentage, degrees); W10 a
          "like" that doesn't say what is alike; W11 more than 4 words before the subject; W12 more than one step;
          W13 a rival name for the film's thread object (needs the film's list).
The lists sit at the top of this file. When the panel or the owner finds a line the lint missed or flagged wrongly,
the fix and that line (a case in clarity_tests/cases.json) go in the same commit.

Regression (--selftest; clarity_tests/cases.json, R1-R5 of LINT_SPEC.md section 4): v4's G1 draft 1 FAILs on the
owner's lines for the owner's reasons and flags nothing on line 1; the clean rewrites in PRINCIPLES.md pass with no
warning; the Big Bend opening passes; v1, v2, v3 and v5 draft 1 give the spec's errors; the spec's unit cases hold.

Libraries (the playbook's "Find the PRO way and the pro tools"; the full comparison is in LINT_REPORT.md):
- spaCy 3.8.18 + en_core_web_sm 3.8.0 (MIT; deterministic on CPU; a 15 MB model): parts of speech, lemmas, number
  and the dependency parse that passives, subjects, finite verbs, degree words and pronoun candidates need. Weighed:
  NLTK (no dependency parser), Stanza and Flair (PyTorch, hundreds of MB), UDPipe (models CC BY-NC-SA: no
  commercial use). Every rule is ours; the parse is the one thing we don't hand-roll.
- wordfreq 3.1.1 (Apache-2.0, data CC BY-SA 4.0; frozen at 2021 data by its author): Zipf frequency blended from 7
  English sources (subtitles from SUBTLEX and OpenSubtitles among them), names included. Weighed: SUBTLEX-US alone
  (one of wordfreq's sources); Brysbaert et al.'s 2019 word prevalence norms (the share of people who know a word:
  the right measure, but a static research table of 62,000 lemmas, no names, no package).
- Pronouns: our listener's-window rule over the parse. Weighed: coreferee 1.5.0 (MIT, spaCy 3.8): a resolver picks
  one antecedent, the check needs the rivals a listener hears; its rule-based candidate lists span 5 sentences (5-12
  per pronoun on draft 1, numbers included), rule out the right reading of "the city above it" and miss "staff" as a
  plural. fastcoref, Maverick and spacy-experimental need transformers or spaCy < 3.8.
- Lists (trade words, scope, idioms, scolding): ours, curated for a worldwide ear, regex like check_paste.py.
  Weighed: proselint 0.16.0 (BSD): on our five scripts it flags only "No paragraph should start with a 'But'" (our
  joins), and holds 3 of 26 sampled idioms; no-cliches 0.3.6 (MIT, 740 written cliches) holds 8 of our 36 idioms and
  none of the six our scripts used; write-good, retext and Vale (MIT) lint written prose by regex or POS patterns.
- No readability score (textstat): it proves nothing on a cold ear (PRINCIPLES P9).
Install: pip install "spacy==3.8.18" "wordfreq==3.1.1" && python3 -m spacy download en_core_web_sm-3.8.0 --direct
"""
import importlib.util
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TESTS = os.path.join(HERE, "clarity_tests")
VALIDATED = {"spacy": "3.8.18", "en_core_web_sm": "3.8.0", "wordfreq": "3.1.1"}
INSTALL = 'pip install "spacy==3.8.18" "wordfreq==3.1.1" && python3 -m spacy download en_core_web_sm-3.8.0 --direct'
SHORT = 5    # a short line, as check_rhythm.py counts it: it has no context of its own
RARE = 3.0   # Zipf below this is rare: about the 30,000th English word form (kettle 3.54 passes, dibs 2.83 stops)
WPS = 2.87   # our measured narration speed (the v2 and v3 takes), for the numbers-per-10-s info line

# ---------------------------------------------------------------------------------------------------------- lists
# C1. A false friend: a common word in its trade sense. lemma -> (what most people hear, everyday compounds that pass)
FALSE_FRIENDS = {
    "chip": ("food, like crisps or fries",
             [r"computer chips?", r"potato chips?", r"chocolate chips?", r"poker chips?", r"fish and chips",
              r"bags? of chips"]),
    "cabinet": ("a cupboard, or a government's ministers",
                [r"kitchen cabinets?", r"bathroom cabinets?", r"filing cabinets?", r"medicine cabinets?",
                 r"cabinet ministers?", r"shadow cabinet"]),
    "rack": ("a shelf, or a coat rack", [r"(?:coat|dish|spice|bike|roof|wine) racks?"]),
    "server": ("a waiter", []),
    "model": ("a fashion model, or a toy", [r"fashion models?", r"role models?", r"model (?:trains?|planes?|cars?)"]),
    "node": ("a lump", []),
    "cluster": ("a bunch of grapes", []),
    "grid": ("a pattern of squares", []),
    "token": ("a coin for a machine", []),
    "agent": ("a spy, or an estate agent",
              [r"travel agents?", r"(?:real )?estate agents?", r"secret agents?", r"(?:fbi|federal) agents?"]),
    "compute": ("a verb to most people, not a thing", []),
}
# C1. Tech words: (the term, its regex). Each passes where it is described plainly at its first use.
TECH_WORDS = [
    ("data center", r"data[- ]?cent(?:er|re)s?"), ("heat pump", r"heat[- ]pumps?"),
    ("district heating", r"district[- ]heating"), ("heat recovery", r"heat[- ]recovery"),
    ("water-cooled", r"water[- ]cooled"), ("liquid-cooled", r"liquid[- ]cooled"), ("air-cooled", r"air[- ]cooled"),
    ("liquid cooling", r"liquid[- ]cooling"), ("memory chips", r"memory[- ]chips?"),
    ("server farm", r"server[- ]farms?"), ("the cloud", r"the cloud"), ("AI model", r"ai[- ]models?"),
    ("language model", r"(?:large[- ])?language[- ]models?"), ("training data", r"training[- ]data"),
    ("neural network", r"neural[- ]networks?"), ("machine learning", r"machine[- ]learning"),
    ("heat exchanger", r"heat[- ]exchangers?"), ("GPU", r"gpus?"), ("CPU", r"cpus?"),
    ("processor", r"processors?"), ("semiconductor", r"semiconductors?"), ("coolant", r"coolants?"),
    ("inference", r"inference"), ("kilowatt", r"kilowatts?"), ("megawatt", r"megawatts?"),
    ("gigawatt", r"gigawatts?"), ("kWh", r"kwh"), ("MWh", r"mwh"), ("GWh", r"gwh"), ("kW", r"kw"), ("MW", r"mw"),
    ("GW", r"gw"), ("API", r"apis?"), ("LLM", r"llms?"), ("bandwidth", r"bandwidth"), ("latency", r"latency"),
    ("hyperscaler", r"hyperscalers?"), ("chiller", r"chillers?"), ("firmware", r"firmware"),
]
# Never flagged as trade (C1) or rare (W8): everyday since wordfreq's 2021 data. The film's "allow" adds its own.
EVERYDAY_NEW = {"ai", "chatbot", "chatbots", "chatgpt", "app", "apps", "emoji", "emojis", "selfie", "selfies",
                "smartphone", "smartphones", "wi-fi", "wifi", "online", "livestream", "livestreams", "tiktok",
                "youtube", "instagram", "netflix", "google", "iphone", "iphones"}
# C1. Described plainly where it first appears: "called X", "named X", "known as X" ...
GLOSS_BEFORE = re.compile(r"\b(?:called|named|known as)\s+(?:an?\s+|the\s+)?$", re.I)
# ... or "X, which ...", "X, meaning ...", "X, or ...", "X: ..." (an appositive is read from the parse)
GLOSS_AFTER = re.compile(r"^\s*[,:]\s*(?:which|that is|meaning|basically|or|in other words)\b", re.I)
# C3. A vague scope: where is that? (a typical case named by a concrete noun, "in most data centers", passes)
VAGUE_SCOPE = re.compile(r"(?<![\w'-])(?:almost everywhere|nearly everywhere|pretty much everywhere|everywhere else|"
                         r"everywhere|most places|many places|some places|other places|elsewhere|"
                         r"in (?:many|most|other|some) countries)(?![\w'-])", re.I)
# C4. Idioms whose words don't say their meaning
IDIOMS = re.compile(r"(?<![\w'-])(?:first dibs|dibs|by the mountain|by the ton|a heads[- ]up|heads[- ]up|"
                    r"word (?:got|gets|get) out|the elephant in the room|the tip of the iceberg|a drop in the bucket|"
                    r"low[- ]hanging fruit|game[- ]changers?|in a nutshell|out of the blue|through the roof|"
                    r"an arm and a leg|break(?:s|ing)? the bank|under the radar|ballpark|catch[- ]22|no[- ]brainer|"
                    r"bit(?:e|es|ing)? the bullet|piece of cake|back to square one|at the end of the day|"
                    r"the bottom line|red tape|pull(?:s|ed|ing)? the plug|the last straw|on the same page|"
                    r"up in the air|in hot water|hot potato|spill(?:s|ed|ing)? the beans|out of the bag|"
                    r"once in a blue moon|jump(?:s|ed|ing)? the gun)(?![\w'-])", re.I)
# W6. Figurative phrasal verbs and soft figures: often fine, so they only ask
SOFT_FIGURES = re.compile(r"(?<![\w'-])(?:(?:get|gets|got|getting) a boost|(?:give|gives|gave|giving) (?:it |them )?a boost|"
                          r"(?:end|ends|ended|ending) up|(?:turn|turns|turned|turning) out|"
                          r"(?:figure|figures|figured|figuring) (?:it |that |this )?out|"
                          r"(?:pass|passes|passed|passing) (?:that|it|this) on|(?:kick|kicks|kicked|kicking) in|"
                          r"(?:blow|blows|blew|blown|blowing) up|(?:step|steps|stepped|stepping) up|"
                          r"(?:take|takes|took|taking) off|where(?: [\w']+){1,4}? (?:is|was|are|were) heading|"
                          r"the smart move)(?![\w'-])", re.I)
# W7. A scolding or outrage frame
SCOLDING = re.compile(r"(?<![\w'-])(?:(?:nobody|no one|no-one)(?:'s| is| was| has)? even|not even|"
                      r"(?:can't|cannot|couldn't|doesn't|didn't|won't|isn't|aren't|wasn't|weren't|don't|haven't|hasn't) even|"
                      r"of course|how dare|shameful|outrageous|scandal|scandals|scandalous|ridiculous)(?![\w'-])", re.I)
# W4: nouns any listener knows with "the" from the start (the film's "unique" adds its own)
UNIQUE = {"world", "sun", "moon", "sky", "air", "sea", "ocean", "weather", "internet", "news", "planet", "earth",
          "future", "past", "rest", "end", "same", "way", "first", "last", "top", "bottom", "middle", "winter",
          "summer", "spring", "autumn", "fall", "snow", "night", "morning", "day", "year", "time", "moment", "truth",
          "answer", "point", "street", "streets", "city", "u.s.", "us", "uk", "eu", "one", "ones"}
MONTHS_DAYS = {"january", "february", "march", "april", "may", "june", "july", "august", "september", "october",
               "november", "december", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}
TIME_MEASURE = {"minute", "hour", "day", "week", "month", "year", "decade", "century", "time", "second", "percent",
                "degree", "foot", "feet", "meter", "metre", "mile", "kilometer", "kilometre", "km", "kg", "ton",
                "tonne", "tenth", "half", "third", "quarter"} | MONTHS_DAYS
FILLER = {"purpose", "bunch", "fact", "life", "kind", "sort", "lot", "way", "end", "course", "while", "now"}
GENERAL = {"project", "plan", "idea", "thing", "place", "building", "deal", "story", "problem", "move", "proposal",
           "case", "kind", "number", "fact", "change", "trick", "question", "news", "way", "stuff", "one", "machine"}
COLLECTIVE = {"staff", "team", "crew", "police", "family", "audience", "public", "couple"}
PRONOUNS = {"it": False, "its": False, "itself": False, "they": True, "them": True, "their": True, "theirs": True,
            "themselves": True}  # -> plural?
NAMING = re.compile(r"\b(?:it's|it is|it was|they're|they are|they were|this is|that's)\s+(?:called|named|known as)\b")
# CAPS is emphasis in our pastes ("WANTS"): read as lower case, except these acronyms (check_paste.py's, plus tech)
ACRONYMS = {"AI", "BBC", "US", "UK", "EU", "CEO", "CIA", "FBI", "NASA", "TV", "OK", "UN", "NATO", "NHS", "PHP",
            "GPU", "GPUS", "CPU", "CPUS", "API", "APIS", "LLM", "LLMS", "PC", "USB", "DNA", "ID", "CNN", "IBM",
            "AMD", "KWH", "MWH", "GWH", "KW", "MW", "GW"}
# W9
NUMWORD = (r"(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|"
           r"sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|"
           r"thousand|million|billion)")
NUMBER = rf"(?:\d[\d,.]*|(?:a )?{NUMWORD}(?:[- ]{NUMWORD})*)"
NUMBER_WORDS = {"half", "halves", "dozen", "dozens", "tens", "hundreds", "thousands", "millions", "billions",
                "trillion", "trillions"}
ORDINALS = {"first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
            "twentieth", "hundredth", "thousandth", "millionth", "thirds", "fourths", "fifths", "tenths",
            "hundredths"}
MULTIPLIER = re.compile(rf"\b{NUMBER} times(?= (?:bigger|more|higher|larger|smaller|as|the|last|faster|cheaper|longer)\b)")
PERCENT = re.compile(r"\b(?:percent|per cent)\b|%")
DEGREES = re.compile(rf"\b{NUMBER}\s+degrees?\b")
DEGREE_ANCHOR = re.compile(r"\b(?:as (?:cold|cool|warm|hot) as|like (?:a|an|the)|fridge|freezer|room temperature|"
                           r"body temperature|freezing|boiling|oven)\b")
# W10: a comparison that says what is alike
LIKE = re.compile(r"\b(?:is|are|was|were|'s|'re) like\b")
SHARED = re.compile(r"\b(?:as much|as many|as \w+ as|the size of|the weight of|the price of|the height of|"
                    r"the length of|worth of)\b")
LEADS = {"and", "but", "so", "then", "plus"}   # W11: a leading join doesn't count
# The name chain (info): every name the script gives its things, so a swap shows at a glance
CHAIN = re.compile(r"(?<![\w-])(?:ai(?:[- ]models?)?|chatbots?|chatgpt|computers?|data[- ]?cent(?:er|re)s?|"
                   r"server[- ]farms?|servers?|(?:memory[- ])?chips?|cabinets?|racks?|gpus?|cpus?|processors?|"
                   r"semiconductors?|(?:large[- ])?language[- ]models?|llms?|hyperscalers?|nodes?|clusters?)(?![\w-])",
                   re.I)
QUESTION_NOTE = "ask only AFTER the cold pass, one per flag"

NLP = ZIPF = RHYTHM = None


# ---------------------------------------------------------------------------------------------------------- setup
def load_libs():
    """spaCy, the model and wordfreq; exit 2 with the install line when one is missing."""
    global NLP, ZIPF, RHYTHM
    if NLP is not None:
        return
    try:
        import spacy
        from wordfreq import zipf_frequency
    except ImportError as e:
        print(f"check_clarity.py needs spaCy and wordfreq ({e.name} is missing). Install:\n  {INSTALL}")
        sys.exit(2)
    try:
        NLP = spacy.load("en_core_web_sm")
    except OSError:
        print(f"check_clarity.py needs spaCy's en_core_web_sm model. Install:\n  {INSTALL}")
        sys.exit(2)
    ZIPF = zipf_frequency
    spec = importlib.util.spec_from_file_location("check_rhythm", os.path.join(HERE, "check_rhythm.py"))
    RHYTHM = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(RHYTHM)


def versions():
    import importlib.metadata as md
    out = {}
    for name in ("spacy", "en_core_web_sm", "wordfreq"):
        try:
            out[name] = md.version(name)
        except md.PackageNotFoundError:
            out[name] = None
    return out


def version_note():
    v = versions()
    off = [f"{k} {v[k]}" for k in VALIDATED if v[k] != VALIDATED[k]]
    if not off:
        return None
    return (f"note: validated on spaCy 3.8.18 + en_core_web_sm 3.8.0 + wordfreq 3.1.1; this runs {', '.join(off)}: "
            "run --selftest before trusting it")


def read_film(path):
    """The film's word list (docs/vN/script/clarity.json; format: LINT_SPEC.md section 3), normalised."""
    try:
        raw = json.load(open(path, encoding="utf-8"))
    except (OSError, ValueError) as e:
        print(f"usage: cannot read the film's word list {path}: {e}")
        sys.exit(2)
    if not isinstance(raw, dict):
        print(f"usage: the film's word list {path} must be a JSON object (thread, trade, allow, unique)")
        sys.exit(2)
    unknown = set(raw) - {"thread", "trade", "allow", "unique"}
    if unknown:
        print(f"usage: the film's word list {path} has unknown keys {sorted(unknown)} (thread, trade, allow, unique)")
        sys.exit(2)
    thread = raw.get("thread") or {}
    allow = raw.get("allow") or {}
    if isinstance(allow, list):  # a bare list is accepted, but the reason is the point
        allow = {a: "(no reason given)" for a in allow}
    rivals = []
    for r in thread.get("rivals", []):  # "chips" and "chip" are one rival
        r = str(r).lower().strip()
        if r and singular(r) not in {singular(x) for x in rivals}:
            rivals.append(r)
    return {
        "thread_name": str(thread.get("name", "")).strip(),
        "rivals": rivals,
        "trade": {str(k).lower().strip(): [str(g).lower() for g in (v or [])] for k, v in (raw.get("trade") or {}).items()},
        "allow": {str(k).lower().strip(): str(v) for k, v in allow.items()},
        "unique": {str(u).lower().strip() for u in raw.get("unique", [])},
        "path": path,
    }


def find_film(script_path):
    """docs/vN/script/clarity.json for a script under docs/vN/ (None when the path has no docs/vN/)."""
    parts = os.path.abspath(script_path).split(os.sep)
    for k in range(len(parts) - 2, 0, -1):
        if re.fullmatch(r"v\d+", parts[k]) and parts[k - 1] == "docs":
            return os.sep.join(parts[: k + 1] + ["script", "clarity.json"])
    return None


# ---------------------------------------------------------------------------------------------------------- helpers
def for_analysis(s):
    """Same length as s (so offsets map back): curly quotes made straight, emphasis CAPS read as lower case."""
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\b[A-Z]{2,}\b", lambda m: m.group(0) if m.group(0) in ACRONYMS or ZIPF(m.group(0).lower(), "en") < RARE
                  else m.group(0).lower(), s)


def singular(w):
    w = w.lower()
    if w.endswith("ies") and len(w) > 4:
        return w[:-3] + "y"
    if w.endswith("s") and not w.endswith("ss") and len(w) > 3:
        return w[:-1]
    return w


def is_num(t):
    low = t.lower_
    if low in ORDINALS:
        return False
    return bool(t.like_num) or low in NUMBER_WORDS


def is_fraction(t):
    """'a tenth', 'two thirds': an ordinal used as a number."""
    return t.lower_ in ORDINALS and t.i > 0 and (t.doc[t.i - 1].lower_ in ("a", "an", "one") or is_num(t.doc[t.i - 1]))


def number_runs(doc):
    """Each number said as one (seventy thousand, twenty twenty-seven, tens of thousands, one in ten); a bare 'one' isn't one."""
    runs, cur = [], None
    for t in doc:
        num = is_num(t) or is_fraction(t)
        joiner = cur is not None and (t.text == "-" or t.lower_ in ("and", "of")) and t.i + 1 < len(doc) and \
            (is_num(doc[t.i + 1]) or is_fraction(doc[t.i + 1]))
        if num or joiner:
            if cur is None:
                cur = [t.i, t.i]
            cur[1] = t.i
        elif cur is not None:
            runs.append(cur)
            cur = None
    if cur is not None:
        runs.append(cur)
    merged = []
    for r in runs:  # "N out of M", "N in M" count once
        if merged:
            gap = [x.lower_ for x in doc[merged[-1][1] + 1: r[0]]]
            if gap in (["out", "of"], ["in"]):
                merged[-1] = [merged[-1][0], r[1], True]
                continue
        merged.append(r)
    return [r for r in merged if len(r) == 3 or not (r[0] == r[1] and doc[r[0]].lower_ == "one")]


def best_zipf(t):
    """The word's best Zipf over its form, its lemma and simple de-inflections; a hyphenated word: its rarest part."""
    w = re.sub(r"'s$", "", t.lower_)
    if "-" in w.strip("-"):
        return min(ZIPF(p, "en") for p in w.split("-") if p)
    cands = {w, t.lemma_.lower()}
    rules = [("ies", "y"), ("es", ""), ("s", ""), ("ied", "y"), ("ed", ""), ("ed", "e"), ("ing", ""), ("ing", "e")]
    if t.pos_ in ("ADJ", "ADV"):
        rules += [("ier", "y"), ("ier", "ey"), ("iest", "y"), ("iest", "ey"), ("er", ""), ("er", "e"), ("est", ""),
                  ("est", "e")]
    for suf, rep in rules:
        if w.endswith(suf) and len(w) > len(suf) + 2:
            cands.add(w[: -len(suf)] + rep)
    for suf in ("ed", "ing", "er", "est"):  # stopped, running, bigger
        if w.endswith(suf) and len(w) > len(suf) + 3 and w[-len(suf) - 1] == w[-len(suf) - 2]:
            cands.add(w[: -len(suf) - 1])
    return max(ZIPF(c, "en") for c in cands if c)


def word_of(t):
    """The whitespace-delimited word a token sits in ('Wi-Fi' for 'Fi'), lower case, punctuation stripped."""
    doc, a, b = t.doc, t.i, t.i
    while a > 0 and not doc[a - 1].whitespace_:
        a -= 1
    while b + 1 < len(doc) and not doc[b].whitespace_:
        b += 1
    return doc[a: b + 1].text.lower().strip(".,;:!?\"'()")


def inside(pos, spans):
    return any(s <= pos < e for s, e in spans)


def in_relative(t):
    x = t
    while x.dep_ != "ROOT" and x.head is not x:
        if x.dep_ in ("relcl", "acl"):
            return True
        x = x.head
    return False


def plural_noun(x):
    return x.morph.get("Number") == ["Plur"] or x.tag_ in ("NNS", "NNPS") or x.lemma_.lower() in COLLECTIVE


def third_person(verb):
    v = verb.lower()
    if v in ("be", "have", "do", "go"):
        return {"be": "is", "have": "has", "do": "does", "go": "goes"}[v]
    if re.search(r"(s|sh|ch|x|z)$", v):
        return v + "es"
    if re.search(r"[^aeiou]y$", v):
        return v[:-1] + "ies"
    return v + "s"


class Flag:
    def __init__(self, code, start, end, span, msg, question):
        self.code, self.start, self.end, self.span, self.msg, self.question = code, start, end, span, msg, question

    def as_dict(self):
        return {"code": self.code, "span": self.span, "message": self.msg, "question": self.question}


def order(code):
    return (0 if code[0] == "C" else 1, int(code[1:]))


# ---------------------------------------------------------------------------------------------------------- the lint
def lint_text(text, film=None, label="(text)"):
    load_libs()
    pairs = RHYTHM.sentences(text)
    sents = [s for s, _ in pairs]
    nwords = [n for _, n in pairs]
    ana = [for_analysis(s) for s in sents]
    docs = list(NLP.pipe(ana))
    film = film or {"thread_name": "", "rivals": [], "trade": {}, "allow": {}, "unique": set(), "path": None}
    allow, unique = film["allow"], UNIQUE | film["unique"]
    terms = [[k.lower(), re.compile(r"(?<![\w-])(?:" + rx + r")(?![\w-])", re.I), []] for k, rx in TECH_WORDS]
    for k, gl in film["trade"].items():  # the film's trade words; one the defaults know gets the film's descriptions
        hit = next((term for term in terms if term[1].fullmatch(k)), None)
        if hit:
            hit[2] = hit[2] + gl
        else:
            frag = "[- ]".join(re.escape(w) for w in re.split(r"[- ]+", k) if w) + ("s?" if k[-1:].isalpha() else "")
            terms.append([k, re.compile(r"(?<![\w-])(?:" + frag + r")(?![\w-])", re.I), gl])
    terms.sort(key=lambda term: -len(term[0]))  # the longer phrase first: "district heating network"
    used, heard = set(), set()
    chain, pointers, rare, allowed_rare, allowed_hits, resolved = [], [], [], [], {}, {}
    numbers_total, out = 0, []
    idioms_by_line = [[(m.start(), m.end()) for rx in (IDIOMS, SOFT_FIGURES) for m in rx.finditer(x)] for x in ana]

    def allowed(*words):
        for w in words:
            for k in (w.lower(), singular(w)):
                if k in allow:
                    allowed_hits[k] = allow[k]
                    return True
        return False

    for i, (s, d, a) in enumerate(zip(sents, docs, ana)):
        flags, low = [], a.lower()
        prev_a = ana[i - 1] if i > 0 else ""
        F = lambda code, st, en, msg, q: flags.append(Flag(code, st, en, s[st:en], msg, q))

        # C1: tech words (and the film's trade words), described plainly at their first use or flagged once
        covered = []
        for key, rx, glosses in terms:
            for m in rx.finditer(a):
                if inside(m.start(), covered) or inside(m.end() - 1, covered):
                    continue  # already part of a longer term here
                covered.append((m.start(), m.end()))
                for w in re.findall(r"[a-z]+", m.group(0).lower()):
                    if singular(w) in FALSE_FRIENDS:
                        used.add(singular(w))
                if key in used:
                    continue
                used.add(key)
                if allowed(key, m.group(0)) or m.group(0).lower() in EVERYDAY_NEW:
                    continue
                if gloss_ok(a, m, d, prev_a, glosses):
                    continue
                surface = s[m.start(): m.end()]
                F("C1", m.start(), m.end(),
                  f'"{surface}": a trade word. Say the everyday thing, or describe it plainly where it first appears '
                  f'("machines called heat pumps")', c1_question(surface, d, m))
        # C1: false friends ("chips": to most people, food)
        for t in d:
            lem = t.lemma_.lower()
            if lem not in FALSE_FRIENDS or t.pos_ not in ("NOUN", "PROPN") or inside(t.idx, covered) or lem in used:
                continue
            if any(m.start() <= t.idx < m.end() for p in FALSE_FRIENDS[lem][1] for m in re.finditer(p, a, re.I)):
                continue
            used.add(lem)
            if allowed(lem, t.lower_):
                continue
            covered.append((t.idx, t.idx + len(t)))
            F("C1", t.idx, t.idx + len(t), f'"{t.text}": a common word in its trade sense (to most people: '
              f'{FALSE_FRIENDS[lem][0]}). Call it what regular people call it', c1_question(t.text, d, None))

        # C3, C4, W6, W7: the lists
        idiom_spans = []
        for m in VAGUE_SCOPE.finditer(a):
            if not allowed(m.group(0)):
                F("C3", m.start(), m.end(), f'"{s[m.start():m.end()]}": vague scope (where is that?). Say the typical '
                  'case: who does what, where ("in most data centers, ...")', f'Where is "{s[m.start():m.end()]}"?')
        for m in IDIOMS.finditer(a):
            idiom_spans.append((m.start(), m.end()))
            if not allowed(m.group(0)):
                F("C4", m.start(), m.end(), f'"{s[m.start():m.end()]}": an idiom a worldwide ear must decode. Say it '
                  'literally', f'What does "{s[m.start():m.end()]}" mean here?')
        for m in SOFT_FIGURES.finditer(a):
            idiom_spans.append((m.start(), m.end()))
            if not allowed(m.group(0)):
                F("W6", m.start(), m.end(), f'"{s[m.start():m.end()]}": figurative. Would a listener who takes every '
                  'word literally get it?', f'What does "{s[m.start():m.end()]}" mean here?')
        for m in SCOLDING.finditer(a):
            if not allowed(m.group(0)):
                F("W7", m.start(), m.end(), f'"{s[m.start():m.end()]}": sounds like a scolding or a scandal. Say the '
                  'plain situation, kindly', "How does this line sound to you: kind, funny or angry?")

        # C2 / W1: pointers
        pointer_flags(i, docs, nwords, ana, F, pointers, idioms_by_line, resolved)

        # W2: a pointer at a whole idea
        m = re.match(r"(?:and |but |so )?(that's|that is|this is|that was|this was)\b"
                     r"(?! (?:because|why|how|what|where|when)\b)", low)
        if m:
            word = re.split(r"[\s'’]", s[m.start(1):m.end(1)])[0].lower()
            F("W2", m.start(1), m.end(1), f'"{s[m.start(1):m.end(1)]}" points at a whole idea. Say the thing',
              f'What is "{word}" here?')
        m = re.match(r"(?:and |but |so )?(which)\b", low)
        if m:
            F("W2", m.start(1), m.end(1), '"Which" points at a whole idea. Say the thing', 'What does "which" point at here?')
        did = []
        for m in re.finditer(r"\b(?:do|does|did|doing|done) (?:it|that)\b", low):
            did.append((m.start(), m.end()))
            F("W2", m.start(), m.end(), f'"{s[m.start():m.end()]}": which action? Say what is done',
              f'What does "{s[m.start():m.end()]}" mean here?')
        for t in d:
            if t.lower_ in ("this", "that") and t.pos_ == "PRON" and t.dep_ in ("dobj", "pobj") and \
               not inside(t.idx, did) and not inside(t.idx, idiom_spans):  # "pass that on" is W6's
                F("W2", t.idx, t.idx + len(t), f'"{t.text}": a whole idea as a pronoun. Say what it is',
                  f'What is "{t.text}" here?')

        # W3: a degree with nothing to point at
        for t in d:
            if t.lower_ in ("that", "this") and t.dep_ == "advmod" and t.head.pos_ in ("ADJ", "ADV") and t.head.i == t.i + 1:
                end = t.head.idx + len(t.head)
                F("W3", t.idx, end, f'"{s[t.idx:end]}": a degree nobody said yet (how {t.head.text}?). Say it, or '
                  'compare it to something everyday', f'How {t.head.text} is "{s[t.idx:end]}"?')

        # W4: a first mention that says we already know it
        for t in d:
            if t.pos_ != "NOUN":
                continue
            dets = [c for c in t.children if c.dep_ == "det" and c.lower_ in ("the", "those", "these", "that", "this")]
            if not dets:
                continue
            det, lem, lw = dets[0], t.lemma_.lower(), t.lower_
            if lem in unique or lw in unique or lem in TIME_MEASURE or lw in TIME_MEASURE or inside(t.idx, idiom_spans):
                continue  # "by the mountain", "the smart move": the idiom's flag asks already
            if lem in heard or lw in heard or lem in {x.lemma_.lower() for x in d[: t.i]} | {x.lower_ for x in d[: t.i]}:
                continue
            if any(c.dep_ in ("relcl", "acl") for c in t.children) or \
               any(c.dep_ == "prep" and c.lower_ == "of" for c in t.children):
                continue
            if any(c.dep_ == "amod" and (c.tag_ == "JJS" or c.lower_ in ("same", "other", "next", "last", "first"))
                   for c in t.children):
                continue
            mods = [c for c in t.children if c.dep_ in ("amod", "compound", "nummod", "npadvmod", "quantmod")]
            if det.lower_ in ("this", "these") and (i == 0 or len(mods) >= 2):
                continue
            if det.lower_ in ("this", "that", "these", "those") and lem in GENERAL:
                continue
            st, en = det.idx, t.idx + len(t)
            F("W4", st, en, f'"{s[st:en]}": first mention, but "{det.text}" says we know it (which {t.text}?). '
              'Introduce it first', f"Which {t.text}?")

        # W5: no doer
        for t in d:
            if t.dep_ == "auxpass":
                v = t.head
                if v.lemma_.lower() in ("call", "name", "know", "bear", "base", "locate"):
                    continue  # naming and stative passives ("is called", "is based in")
                if v.lower_ == "left" and any(c.lower_ == "what" for c in v.children):
                    continue  # "what's left": the rest, not a deed
                if any(c.dep_ == "agent" or (c.dep_ == "prep" and c.lower_ in ("with", "by")) for c in v.children):
                    continue
                st, en = min(t.idx, v.idx), max(t.idx + len(t), v.idx + len(v))
                ask = "Who plans it?" if v.lemma_.lower() == "mean" else f"Who {third_person(v.lemma_)} it?"
                F("W5", st, en, f'"{t.text} {v.text}": who does it? Name the actor', ask)
        for t in d:
            if t.lower_ in ("someone", "somebody") and t.dep_ in ("nsubj", "nsubjpass"):
                F("W5", t.idx, t.idx + len(t), f'"{t.text}": a vague doer. Who?', f'Who is "{t.text}"?')

        # W8: rare words and unknown names
        for t in d:
            if t.pos_ not in ("NOUN", "VERB", "ADJ", "ADV", "PROPN") or is_num(t) or not re.search(r"[a-z]", t.lower_):
                continue
            if inside(t.idx, covered) or inside(t.idx, idiom_spans):
                continue
            z = best_zipf(t)
            if z >= RARE:
                continue
            wf = word_of(t)
            if {t.lower_, t.lemma_.lower(), wf} & EVERYDAY_NEW:
                allowed_rare.append(t.text)
                continue
            if allowed(t.lower_, t.lemma_, wf):
                allowed_rare.append(t.text)
                continue
            rare.append((t.text, z, i + 1))
            kind = "a name most people may not know" if t.pos_ == "PROPN" else "a rare word"
            ask = f'Do you know who or what "{t.text}" is?' if t.pos_ == "PROPN" else f'Do you know the word "{t.text}"?'
            F("W8", t.idx, t.idx + len(t), f'"{t.text}" (Zipf {z:.1f}): {kind}. Would a regular person say it?', ask)

        # W9: numbers by ear
        runs = number_runs(d)
        numbers_total += len(runs)
        nq = "What was the number, and what did it mean?"
        if len(runs) > 1:
            st, en = d[runs[0][0]].idx, d[runs[-1][1]].idx + len(d[runs[-1][1]])
            F("W9", st, en, f"{len(runs)} numbers in one sentence ("
              + ", ".join(s[d[r[0]].idx: d[r[1]].idx + len(d[r[1]])] for r in runs) + "): one per sentence", nq)
        for rx, why in ((MULTIPLIER, "a multiplier: the listener has to do the math. Compare it to an everyday thing"),
                        (PERCENT, 'a percentage: "one in ten" is easier by ear')):
            m = rx.search(low)
            if m:
                F("W9", m.start(), m.end(), f'"{s[m.start():m.end()]}": {why}', nq)
        m = DEGREES.search(low)
        if m and not DEGREE_ANCHOR.search(low):
            F("W9", m.start(), m.end(), f'"{s[m.start():m.end()]}": a unit nobody pictures. Say what it means in '
              'everyday terms (as cold as a fridge?)', nq)

        # W10: a "like" that doesn't say what is alike
        m = LIKE.search(low)
        if m and not SHARED.search(low):
            F("W10", m.start(), m.end(), '"like": like in what way? Say what is alike ("as much heat as forty '
              'kettles")', "Like in what way?")

        # W11: front-loading
        if not re.match(r"(?:did|do) you (?:know|ever)\b", low):
            subj = [t for t in d if t.dep_ in ("nsubj", "nsubjpass", "expl", "csubj")]
            if subj:
                first = min(x.i for x in subj[0].subtree)
                n = words_before(d, first)
                if n > 4:
                    F("W11", 0, d[first].idx, f"{n} words before the subject: start with who or what (a place or "
                      'time signpost of 4 words, "In most data centers,", is fine)', "Say this line back in your own words.")

        # W12: more than one step
        frame = re.match(r"(?:did|do) you know(?: that)?\b", low)
        skip = len(frame.group(0).split()) if frame else 0
        verbs = [t for t in d[skip:] if t.tag_ in ("VBD", "VBP", "VBZ", "MD") and t.dep_ not in ("aux", "auxpass")
                 and not in_relative(t)]
        m = re.search(r",\s*then\b", low)
        if len(verbs) >= 3 or m:
            why = '", then"' if m else f"{len(verbs)} verbs ({', '.join(v.text for v in verbs)})"
            F("W12", 0, len(s), f"more than one step in this sentence ({why}): one new thing per sentence",
              "Say this line back in your own words.")

        # W13: rival names for the thread object (the film's list)
        for rv in film["rivals"]:
            for m in re.finditer(r"(?<![\w-])" + re.escape(singular(rv)) + r"(?:s|es)?(?![\w-])", low):
                if re.match(r"\s+(?:called|named|known as)\b", low[m.end():]):
                    continue  # "machines called heat pumps" introduces another thing
                said = s[m.start():m.end()]
                F("W13", m.start(), m.end(), f'one name per thing: you called the {film["thread_name"]} '
                  f'"{said}" here. Keep "{film["thread_name"]}"',
                  f'{"Are" if said.lower().endswith("s") else "Is"} the "{said}" the same thing as the '
                  f'{film["thread_name"]}?')

        # the name chain (info)
        names = [(m.start(), m.group(0)) for m in CHAIN.finditer(a)]
        names += [(m.start(), m.group(0)) for nm in [film["thread_name"]] + film["rivals"] if nm
                  for m in re.finditer(r"(?<![\w-])" + re.escape(singular(nm)) + r"(?:s|es)?(?![\w-])", low)
                  if not CHAIN.match(a, m.start())]
        for st, nm in sorted(names):
            name = " ".join(w if w.upper() in ACRONYMS else w.lower() for w in s[st: st + len(nm)].split())
            if chain and chain[-1][0] == name:  # "AI 2, 3": the same name again
                if chain[-1][1][-1] != i + 1:
                    chain[-1][1].append(i + 1)
            else:
                chain.append((name, [i + 1]))

        for t in d:
            heard.add(t.lemma_.lower())
            heard.add(t.lower_)
        flags.sort(key=lambda f: (order(f.code), f.start))
        out.append({"n": i + 1, "text": s, "words": nwords[i], "flags": flags})

    total_words = sum(nwords)
    errors = sum(1 for r in out for f in r["flags"] if f.code[0] == "C")
    warns = sum(1 for r in out for f in r["flags"] if f.code[0] == "W")
    counts = {}
    for r in out:
        for f in r["flags"]:
            counts[f.code] = counts.get(f.code, 0) + 1
    secs = total_words / WPS
    return {
        "file": label, "film": film.get("path"), "sentences": out, "errors": errors, "warnings": warns,
        "counts": dict(sorted(counts.items(), key=lambda kv: order(kv[0]))),
        "info": {
            "names": chain, "pointers": pointers,
            "numbers": {"count": numbers_total, "seconds": round(secs, 1),
                        "per_10s": round(numbers_total / secs * 10, 1) if secs else 0.0},
            "rare": {"below": len(rare), "words": total_words, "list": rare, "allowed": sorted(set(allowed_rare))},
            "allowed": allowed_hits,
        },
        "verdict": "FAIL" if errors else "OK",
    }


def gloss_ok(a, m, d, prev_a, glosses):
    """A tech word is described plainly where it first appears."""
    if GLOSS_BEFORE.search(a[: m.start()]) or GLOSS_AFTER.match(a[m.end():]):
        return True
    if re.match(r"\s*[,:]", a[m.end():]):  # "data centers, buildings full of computers"; "heat pumps: machines that ..."
        heads = [t for t in d if m.start() <= t.idx < m.end()]
        head = heads[-1] if heads else None
        if head is not None:
            for x in d[head.i + 1: head.i + 7]:
                if x.pos_ in ("NOUN", "PROPN"):
                    y = x.head if x.dep_ == "compound" else x
                    listing = any(c.dep_ == "cc" and c.lower_ == "and" for c in list(y.children) + list(head.children))
                    if y.dep_ in ("appos", "conj") and y.head == head and not listing:
                        return True
                    break
    window = (prev_a + " " + a).lower()
    return any(re.search(r"(?<![\w-])" + re.escape(g) + r"(?![\w-])", window) for g in glosses)


def c1_question(surface, d, m):
    surface = shown(surface)
    w = surface.lower()
    if "-" in w and w.endswith("ed"):
        return f'What does "{surface}" mean?'
    if w.endswith("s") and not w.endswith("ss"):
        return f"What are the {surface}?"
    return f'What is {"an" if w[:1] in "aeiou" else "a"} {surface}?'


def pointer_flags(i, docs, nwords, ana, F, pointers, idioms, resolved):
    """C2 / W1: each it / they / them / their with its candidates, the reading a script can pick, and why."""
    d = docs[i]
    naming = bool(NAMING.search(ana[i].lower()))
    asked = set()
    for t in d:
        low = t.lower_
        if low not in PRONOUNS or t.pos_ != "PRON" or (low == "it" and t.dep_ == "expl"):
            continue
        if t.i > 0 and d[t.i - 1].lemma_.lower() == "do":
            continue  # "do it" is W2's
        plural = PRONOUNS[low]
        window, j = [], i - 1
        while j >= 0:  # the line before, extended back over verbless fragments ("by the mountain.")
            window = [(x, j) for x in docs[j]] + window
            if any(x.pos_ in ("VERB", "AUX") for x in docs[j]):
                break
            j -= 1
        window += [(x, i) for x in d[: t.i]]
        bound = []  # "But Helsinki WANTS it": an object pronoun can't be its own clause's subject. Objects only:
        # spaCy often hangs a noun's phrase on the verb ("heating the city above it"), where "it" is the subject
        if t.dep_ in ("dobj", "dative"):
            bound = [c for c in t.head.children if c.dep_ in ("nsubj", "nsubjpass")]
        cands, carried = [], {}
        for x, k in window:
            if (k, x.i) in resolved and PRONOUNS.get(x.lower_) == plural and x not in bound:
                lem, disp = resolved[(k, x.i)]  # "... using them? They're everywhere": "them" carries the bins on
                cands.append((lem, x, k))
                carried.setdefault(lem, disp)
                continue
            if x.pos_ not in ("NOUN", "PROPN") or (x.dep_ == "compound" and x.head.pos_ in ("NOUN", "PROPN")):
                continue
            lem = x.lemma_.lower()
            if lem in TIME_MEASURE or lem in FILLER or x.lower_ in TIME_MEASURE or is_num(x) or x in bound:
                continue
            if naming and x.pos_ == "PROPN":
                continue
            if inside(x.idx, idioms[k]):  # "word got out", "a heads-up": no thing to point at
                continue
            if plural_noun(x) == plural:
                cands.append((lem, x, k))
        if plural:  # "Google and Microsoft ... they"
            for x, k in window:
                if x.pos_ in ("NOUN", "PROPN") and not plural_noun(x) and \
                   any(c.dep_ == "conj" for c in x.children) and any(c.dep_ == "cc" and c.lower_ == "and" for c in x.children):
                    y = [c for c in x.children if c.dep_ == "conj"][0]
                    cands.append((f"{x.lemma_.lower()} and {y.lemma_.lower()}", x, k))
        labels, said = [], {}  # by lemma; shown as said ("chips", "data centers")
        for lem, x, _ in cands:
            if lem not in labels:
                labels.append(lem)
                said[lem] = carried.get(lem) or (lem if " and " in lem else shown_noun(x))
        where = f"{i + 1} {t.text}"
        if plural and not labels:
            nxt = d[t.i + 1].lemma_.lower() if t.i + 1 < len(d) else ""
            if nxt in ("say", "call") or t.head.lemma_.lower() in ("say", "call") and t.dep_ == "nsubj":
                pointers.append((where, "people in general (they say)"))
                continue
            pointers.append((where, "(no plural thing)"))
            F("C2", t.idx, t.idx + len(t), f'"{t.text}": no plural thing in the line before (who or what are '
              f'"{low}"?). A city or a company is "it", or say its name', what_question(d, t))
            continue
        if not labels:
            pointers.append((where, "(no candidate)"))
            continue
        if len(labels) == 1:
            pointers.append((where, said[labels[0]]))
            resolved[(i, t.i)] = (labels[0], said[labels[0]])
            continue
        others = lambda pick: ", ".join(said[l] for l in labels if l != pick)
        prom = []
        for lem, x, _ in cands:
            if (x.dep_ in ("nsubj", "nsubjpass") or any(c.dep_ == "det" and c.lower_ in ("this", "that", "these", "those")
                                                        for c in x.children)) and lem not in prom:
                prom.append(lem)
        recent = cands[-1][0]
        if len(prom) == 1 and prom[0] == recent:
            pointers.append((where, f"{said[recent]} (prominent and recent; also {others(recent)})"))
            resolved[(i, t.i)] = (recent, said[recent])
            continue
        toks = {x for _, x, _ in cands}
        side = any(x.dep_ == "conj" and x.head in toks for _, x, _ in cands)
        own = []
        for lem, x, k in cands:
            if k == i and x.dep_ in ("nsubj", "nsubjpass") and lem not in own:
                own.append(lem)
        if len(own) == 1 and not side:
            pointers.append((where, f"{said[own[0]]} (the subject of its own line; also {others(own[0])})"))
            resolved[(i, t.i)] = (own[0], said[own[0]])
            continue
        code = "C2" if nwords[i] <= SHORT or side else "W1"
        names = [said[l] for l in labels]
        pointers.append((where, " | ".join(names) + f" ({code})"))
        key = (plural, tuple(labels))
        if key in asked:  # "They pay more, so they get first dibs.": one question, not two
            continue
        asked.add(key)
        F(code, t.idx, t.idx + len(t), f'"{t.text}" could be: {", ".join(names)}. Say the noun again',
          what_question(d, t))


def shown_noun(x):
    """A candidate as the listener heard it: with its compound words ("AI data centers"), lower case unless a name."""
    words = [c for c in x.children if c.dep_ == "compound" and c.i < x.i] + [x]
    return " ".join(w.text if w.pos_ == "PROPN" or w.text.upper() in ACRONYMS else w.text.lower() for w in words)


def shown(text):
    """Emphasis CAPS as plain words in a question ("DATA CENTERS" -> "data centers"); acronyms stay."""
    return " ".join(w if w.upper().strip(".,'") in ACRONYMS else w.lower() for w in text.split()) if text.isupper() else text


def what_question(d, t):
    """The line as the panel's echo question: "But Helsinki WANTS it." -> "Helsinki wants what?"."""
    expand = {"'ve": "has", "'re": "is", "'s": "is", "'ll": "will", "'d": "would"}
    out = ""
    for x in d:
        if (x.is_punct and x.i == len(d) - 1) or (x.i == 0 and x.lower_ in LEADS):
            continue
        if x.i == t.i:
            out += {"they": "who", "its": "whose", "their": "whose"}.get(x.lower_, "what") + " "
        elif x.i == t.i + 1 and x.lower_ in expand:
            out += expand[x.lower_] + x.whitespace_
        else:
            out += x.text + x.whitespace_
    q = re.sub(r"\s+([,.?!])", r"\1", re.sub(r"\s+", " ", out)).strip()
    return q[:1].upper() + q[1:] + "?"


def words_before(d, end):
    """W11: words before the subject; a number counts as one, a hyphenated word as one, a leading join as none."""
    n, prev_num = 0, False
    for t in d[:end]:
        if t.i == 0 and t.lower_ in LEADS:
            continue
        if t.is_punct:
            prev_num = prev_num and t.text == "-"
            continue
        if t.i > 0 and d[t.i - 1].text == "-" and not d[t.i - 1].whitespace_:
            continue
        if is_num(t):
            if not prev_num:
                n += 1
            prev_num = True
        else:
            n, prev_num = n + 1, False
    return n


# ---------------------------------------------------------------------------------------------------------- output
def report(res, quiet=False, questions=False):
    film = res["film"]
    if film and not os.path.relpath(film).startswith(".."):
        film = os.path.relpath(film)
    print(f"film list: {film}" if film else f"film list: {res.get('film_note') or 'none (W13 off; pass --film)'}")
    note = version_note()
    if note:
        print(note)
    for r in res["sentences"]:
        if quiet and not r["flags"]:
            continue
        print(f"{r['n']:2d}  {r['text']}")
        for f in r["flags"]:
            print(f"      {f.code:<4} {f.msg}")
    info = res["info"]
    print()
    if info["names"]:
        print("names: " + " -> ".join(f"{nm} {', '.join(map(str, ns))}" for nm, ns in info["names"]))
    if info["pointers"]:
        print("pointers: " + "; ".join(f"{w} -> {r}" for w, r in info["pointers"]))
    nm = info["numbers"]
    print(f"numbers: {nm['count']} in about {nm['seconds']:.0f} s ({nm['per_10s']} per 10 s at {WPS} words a second)")
    for k, why in info["allowed"].items():
        print(f'allowed by the film\'s list: "{k}" ({why})')
    rr = info["rare"]
    allowed_txt = f" (allowed: {', '.join(rr['allowed'])})" if rr["allowed"] else ""
    print(f"{len(res['sentences'])} sentences, {res['errors']} errors, {res['warnings']} warnings; "
          f"{rr['below']} of {rr['words']} words below Zipf {RARE}{allowed_txt}")
    if questions:
        qs = [(r["n"], f) for r in res["sentences"] for f in r["flags"]]
        if qs:
            print(f"\nquestions for the panel ({QUESTION_NOTE}):")
            for n, f in qs:
                print(f"  {n:2d} {f.code:<4} {f.question}")
    if res["errors"]:
        ec = ", ".join(f"{c} x{k}" for c, k in res["counts"].items() if c[0] == "C")
        print(f"FAIL: {res['errors']} errors ({ec}): fix each, or allow it in the film's list with a reason")
    else:
        print(f"OK: none of the error patterns; {res['warnings']} warnings: fix each, or answer it in the script doc's "
              "Checks section. OK never means clear: the cold viewer panel decides")


def as_json(res):
    out = dict(res)
    out["sentences"] = [dict(r, flags=[f.as_dict() for f in r["flags"]]) for r in res["sentences"]]
    out["info"] = dict(res["info"], names=[{"name": a, "lines": b} for a, b in res["info"]["names"]],
                       pointers=[{"pointer": a, "reading": b} for a, b in res["info"]["pointers"]],
                       rare=dict(res["info"]["rare"], list=[{"word": w, "zipf": round(z, 2), "line": n}
                                                             for w, z, n in res["info"]["rare"]["list"]]))
    out["versions"] = versions()
    return json.dumps(out, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------------------------------------- selftest
def matches(f, exp):
    """exp = [code], [code, span substring] or [code, span substring, message substring]."""
    if f.code != exp[0]:
        return False
    if len(exp) > 1 and exp[1] and exp[1].lower() not in f.span.lower():
        return False
    return len(exp) < 3 or exp[2].lower() in f.msg.lower()


def check_case(case):
    """One regression case -> a list of problems (empty = pass)."""
    film = read_film(os.path.join(TESTS, case["film"])) if case.get("film") else None
    if "file" in case:
        text = open(os.path.join(TESTS, case["file"]), encoding="utf-8").read()
    else:
        text = case["text"]
    res = lint_text(text, film, case.get("file", "(text)"))
    bad = []
    got_exit = 1 if res["errors"] else 0
    if "exit" in case and case["exit"] != got_exit:
        bad.append(f"exit {got_exit}, expected {case['exit']}")
    for key in ("errors", "warnings"):
        if key in case and case[key] != res[key]:
            bad.append(f"{res[key]} {key}, expected {case[key]}")
    sents = res["sentences"]
    allf = [(r["n"], f) for r in sents for f in r["flags"]]
    for key, exp in case.get("lines", {}).items():
        if key.isdigit():
            rows = [r for r in sents if r["n"] == int(key)]
        else:
            rows = [r for r in sents if key.lower() in r["text"].lower()]
        if len(rows) != 1:
            bad.append(f"line {key!r}: found {len(rows)} sentences")
            continue
        r = rows[0]
        fl = r["flags"]
        shown = ", ".join(f"{f.code} {f.span!r}" for f in fl) or "nothing"
        if exp.get("none") and fl:
            bad.append(f"line {r['n']}: expected nothing, got {shown}")
        for h in exp.get("has", []):
            if not any(matches(f, h) for f in fl):
                bad.append(f"line {r['n']}: missing {h}, got {shown}")
        for h in exp.get("not", []):
            if any(matches(f, h) for f in fl):
                bad.append(f"line {r['n']}: unexpected {h}, got {shown}")
        if exp.get("only"):
            ok = exp.get("has", []) + exp.get("may", [])
            extra = [f for f in fl if not any(matches(f, h) for h in ok)]
            if extra:
                bad.append(f"line {r['n']}: unexpected " + ", ".join(f"{f.code} {f.span!r}" for f in extra))
        if "count" in exp:
            want, k = exp["count"]
            got = sum(1 for f in fl if matches(f, want))
            if got != k:
                bad.append(f"line {r['n']}: {got} x {want}, expected {k}; got {shown}")
    if "errors_exactly" in case:
        errs = [f for _, f in allf if f.code[0] == "C"]
        want = list(case["errors_exactly"])
        left = list(errs)
        for w in want:
            hit = next((f for f in left if matches(f, w)), None)
            if hit is None:
                bad.append(f"missing error {w}")
            else:
                left.remove(hit)
        if left:
            bad.append("unexpected errors: " + ", ".join(f"{f.code} {f.span!r}" for f in left))
    if "script_only" in case:
        extra = [(n, f) for n, f in allf if not any(matches(f, h) for h in case["script_only"])]
        if extra:
            bad.append("unexpected flags: " + ", ".join(f"{n} {f.code} {f.span!r}" for n, f in extra))
    return bad, res


def selftest():
    load_libs()
    cases = json.load(open(os.path.join(TESTS, "cases.json"), encoding="utf-8"))["cases"]
    note = version_note()
    if note:
        print(note)
    failed = 0
    for case in cases:
        bad, res = check_case(case)
        tag = f"{case['id']:<6} {case['level']:<6}"
        if bad:
            failed += 1
            print(f"FAIL {tag} {case['what']}")
            for b in bad:
                print(f"         - {b}")
        else:
            print(f"pass {tag} {case['what']} (exit {1 if res['errors'] else 0}: {res['errors']} errors, "
                  f"{res['warnings']} warnings)")
    if failed:
        print(f"FAIL: {failed} of {len(cases)} regression cases")
        return 1
    print(f"OK: all {len(cases)} regression cases pass (LINT_SPEC.md section 4)")
    return 0


# ---------------------------------------------------------------------------------------------------------- main
def main():
    args = sys.argv[1:]
    if "--selftest" in args:
        return selftest()
    paths = [a for a in args if not a.startswith("--")]
    film_arg = None
    if "--film" in args:
        k = args.index("--film")
        if k + 1 >= len(args):
            print("usage: --film needs a path to the film's word list (docs/vN/script/clarity.json)")
            return 2
        film_arg = args[k + 1]
        paths = [p for p in paths if p != film_arg]
    known = {"--film", "--no-film", "--questions", "--quiet", "--json", "--selftest"}
    unknown = [a for a in args if a.startswith("--") and a not in known]
    if len(paths) != 1 or unknown:
        print(__doc__)
        return 2
    path = paths[0]
    try:
        text = open(path, encoding="utf-8").read()
    except OSError as e:
        print(f"usage: cannot read {path}: {e}")
        return 2
    film, film_note = None, None
    if film_arg:
        film = read_film(film_arg)
    elif "--no-film" not in args:
        cand = find_film(path)
        if cand and os.path.exists(cand):
            film = read_film(cand)
        elif cand:
            film_note = f"none (no {os.path.relpath(cand)}; W13 off)"
        else:
            film_note = "none (the script is not under docs/vN/; pass --film; W13 off)"
    else:
        film_note = "none (--no-film; W13 off)"
    load_libs()
    if not RHYTHM.sentences(text):
        print("FAIL: no sentences found")
        return 1
    res = lint_text(text, film, path)
    res["film_note"] = film_note
    if "--json" in args:
        print(as_json(res))
    else:
        report(res, quiet="--quiet" in args, questions="--questions" in args)
    return 1 if res["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
