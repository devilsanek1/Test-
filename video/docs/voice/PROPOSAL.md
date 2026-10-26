# ElevenLabs clean takes: root causes and plan (proposal, 2026-10-26)

Inputs: `research_docs.md` [D], `research_community.md` [K], `research_modes.md` [M], `evidence.md` [E] (8 generations),
plus v2 take 2 (`assets/v2/take2_raw.wav`, made after `evidence.md`: clean on the first generation, 38.96 s, word for
word). v4 is non-deterministic, so no paste can promise a perfect take every time. What we can promise: a paste format
with a clean record that removes every trigger we have evidence for; a linter that refuses any other paste; a check on
every take before we use it, with free one-click retakes; and the API option, where nobody hears an unchecked take.

## 1. Root causes, ranked

1. **A delivery change requested inside a paragraph (mid-line tags; tags with "then ... at the end").** v4 loses its
   place at the tag boundary and jumps back to an earlier copy of the next word, or to the top. All 8 of our structural
   failures (repeats, derail + restart, 3x loop, wrap to the top, "swear its military", "And 'oogle") came from the 3
   pastes with mid-line tags: 3/3 broke, 0/6 without them did (v1 x4, v3 take 1, v2 take 2); 1 chance in 84 if failures
   fell at random (takes aren't independent, and this feature was picked after looking at 9: a strong hint, not proof).
   The doubled "She quit. She quit Google." sat under a tag asking for "a small beat, then low and flat at the end" (one
   case). External: "one tag per clause; contrasting tags on the same words can blur" [D]; over-tagging gives "chaotic
   audio" and extra words (4 sources) [K]; nobody outside ties it to loops, and the official v4 examples use both
   mid-line tags and "then" tags [D]. Tag density moves with it (broken 8.8-12.3 per 100 words, clean 4.5-6.9): we cap
   both. **Confidence: medium-high that the fix works (6/6 without them clean, but only take 2 used this exact format,
   and it changed five things at once: length, tag count, tag length, negations, "And Google"); medium on why.**
2. **Anything that isn't tagged speech gets spoken.** Notes, labels ("H2", "Alternate first lines") and script phrases
   quoted inside a tag were said aloud 6/6 times; single quoted words 0/26 [E]. Official: text outside square brackets
   is spoken, round/curly brackets get read, "Enhance" rewrites tags [D]; many community reports [K]. **Confidence: high.**
3. **One-shot generation with nothing between the take and its use.** v4 tags are "not perfect yet", behaviour "may
   shift over time", the official fix for corrupt speech is "regenerate" [D]; a 1,500-character v3 paste ran nine
   minutes, and "regenerate, keep the best" is the most reported fix [K]. On the Text to Speech page one slip ruins the
   whole take, and so far we found it only after the owner sent one take. **Confidence: high.** So "never again" needs
   a check and a free retake on top of a better paste.
4. **Tags naming an action, a sound or a gesture get performed.** [repeats], [stammers], [interrupting] are real tags; a
   tag can become a sound effect [D]. "correcting yourself" added a "Well,", but take 4 repeated without it: it shaped
   the repeat, it didn't cause it [E]. **Confidence: medium.**

Not causes on our data [E]: negations, tags up to 17 words, up to 2,337 characters, ellipses, CAPS, long lines; "And
'oogle" is one case inside an already derailed take. Some keep cheap warnings because outside advice points that way.

## 2. Paste format v2 (v2 take 2's format, written down)

The paste file is exactly what the owner pastes, nothing else.
1. **Paragraphs:** one beat (1-2 whole sentences) per paragraph, each on ONE line, a blank line between (a line break
   is a pause on v4 [D]). No headings, notes, labels, markdown, separators; alternates go in their own file.
2. **Few tags, at the start of a paragraph, on the same line:** `[warm, steady] She worked on...`. Only where the
   delivery changes; untagged paragraphs carry the last tag ("emotion carries forward" [D]). 4-6 per script, at most
   1 per ~15 spoken words; never after spoken words, never alone on a line, never two in a row (comma-combine). The v1
   form (tag alone on the line above) was also clean 5/5: same-line is the documented form, and in Studio a lone tag
   would become its own paragraph.
3. **Tag words:** 1-4 words, square brackets, a voice quality: tone (quiet disbelief, curious, warm, serious, dry,
   amused, firm), pace/volume (steady, slower, quiet, close, soft). One delivery per tag (no "then", "at the end",
   "beat"). Never quotes or script words, digits, actions (repeat, correct, read, say, quote, list, stammer, interrupt),
   sounds (gasp, laugh, sigh, breath, pause, mic, music), gestures (smile, shrug, nod, lean). No "no ..." (unproven, free).
4. **Punctuation:** full stops, question marks, commas for a breath; no dashes (a dash "cuts a speaker off" [D]); at
   most one ellipsis per script, inside a sentence. **CAPS:** one stressed word per paragraph, three per script at most
   (acronyms like AI, BBC, U.S. don't count). **Numbers and symbols** spelled out; "U.S." with dots.
5. **Opening:** a tag, then the words; one delivery for the whole first paragraph; the next sentence never restates the
   first (v3: "...AI's making it pricier." + "Well, AI DATA CENTERS are." was said twice in two takes).
6. **Ending:** the last paragraph ends on a full stop; no ellipsis, tag, note or throwaway line after it.
7. **Length:** 650-900 characters with tags (take 2: 714), tags at most ~15 % of them (take 2: 10 %).
8. **Names:** checked in every take transcript; if one drops a sound, reword so it doesn't follow "And".

The owner's rule "detailed emotional cues" stays met in the script document (`script_gN.md`, a full cue per line, to
read); the paste carries only the short tags v4 needs, since the long-cue paste is the one that broke.

Example: video 2, same spoken words. This exact text narrated clean on the first generation (take 2, 38.96 s):

```
[quiet disbelief] She quit Google. And she says her CONTRACT bans her from criticizing it… for life.

You'd think that's one odd contract.

[serious, steady] But Google staff told the BBC they're scared to speak out, because of their contracts.

[curious] So why is SHE talking?

[warm, steady] She worked on Google's AI, and told the BBC she objected to where its military work was heading.

In April, that meant a deal letting the Pentagon use its AI for any lawful government purpose.

Google can't veto how it's used.

But Google says it follows its AI principles, and bans retaliation of any kind.

[quiet, close] She says she can't criticize Google.

But in her words, talking about FACTS is not criticizing.
```

5 tags for 112 words (4.5 per 100), 1-2 words each; 1 ellipsis; 3 CAPS; 714 characters. Soft spot: three sentences
start with "But", where v4 landed when it lost its place in take 1; harmless without mid-line tags, so only a warning.

## 3. Settings (stated in every hand-off)

- **Page: Text to Speech.** Every clean take we have came from it; it reads the script as one scene (v4 "works best"
  with passages [D]); two free regenerations [M]. Not Studio for now: untested by us with v4 + tags, new projects
  default to Multilingual v2, Export auto-regenerate unconfirmed on v4 [M]. Not Dialogue (it is for several speakers).
- **Model: Eleven v4** (not v4 Turbo, v3 or Multilingual v2); the file name must end in `_eleven_v4`, we check it.
- **Voice:** the usual one; if the app offers to retrain an older clone for v4, do it once [M].
- **Stability: 50 % (the API default; set it, don't assume the app's).** After a broken take, about 65 % and regenerate
  (moving sliders keeps the free regeneration [M]); never below 40 %. Unconfirmed: no v4 doc ties stability to loops;
  v3's low "Creative" end was "prone to hallucinations", a v3 producer had none at 0.9, one v4 test heard little change
  [K].
- **Similarity:** default. **Clone Strength** (professional clones only): 0 %, the official start point [D]. **Speed /
  Style:** not on v4; if a speed control shows, 1.0.
- **Never press "Enhance"** or any auto-tag: it rewrites our tags, adds CAPS, "!" and ellipses [D].
- **Three takes from one paste:** Generate, then Regenerate twice without editing the text or refreshing the page (free
  within two hours; still offered on v4: unconfirmed); download all three (WAV if offered; if one click gives two
  versions, as v3 did, both), send them with one screenshot of the settings panel (per-take settings are the biggest
  unknown in `evidence.md`); we keep the best. The owner's own check: a take longer than the max we state ("about 40 s,
  max 52 s" = 1.3x) is broken: regenerate.

## 4. If a take still breaks

Owner, fastest first: (1) regenerate (free, same text, stability up to 65 %); with three takes up front this should be
rare (unmeasured). (2) Same spot broken twice: we send a split paste (two blocks at a paragraph break, each at least 250
characters), the owner generates only the broken block, we stitch at the pause. Never edit the text between takes (costs
credits, drops the free regenerations). Studio paragraph-regenerate only after an A/B shows it works with v4 and our
tags. Us, on every take (nothing enters G2+ without it): `check_take.py TAKE PASTE MODEL` must print MATCH (to add: exit
1 on any EXTRA/MISSING, today it exits 0; fail over 1.3x the expected length; file name must say `eleven_v4`; flag any
silence inside the take over 1.0 s for a listen: take 2's longest is 0.68 s, take 1 has 1.34 s). Prefer a take that is
MATCH uncut; cut only if none of the three is. Extras at a pause (doubled opening, looped paragraph): `clean_take.py`,
re-check until MATCH, listen to every cut. Missing or garbled words: swap in that paragraph from another take of the
same paste at the blank-line pauses, re-check; else regenerate. Listen to every name (the ASR smooths slurs: "And
'oogle" became "Ugo"). Log every take (paste stats, settings, outcome) in `ELEVENLABS.md` §5; a new failure type reopens
this proposal.

## 5. Option: automated takes via the API

We generate with the owner's voice, check, and hand over a take that already passed; the owner only listens. Chosen by
the owner on 2026-10-26 (`ELEVENLABS.md` §4); `generate_take.py` exists (per paragraph, Parakeet + Whisper check,
retries, stitch), tested offline only. **The owner gives once:** a restricted API key (Text to Speech + Voices read,
credit cap) as the environment secret `ELEVENLABS_API_KEY` (absent from this environment so far); the voice ID (into
`VOICE.md`); the plan tier (WAV 44.1 kHz needs Pro); a yes that the clone works on v4.
**How a clean take is guaranteed:**
1. Whole script first: one request with the lint-clean paste (`eleven_v4`, stability 0.5, new seed per try), checked by
   `check_take.py` + the duration gate; first MATCH wins, up to 3 tries. Keeps v4's whole-scene arc.
2. Otherwise per paragraph, each with its carried tag, chained with `previous_request_ids` (last 1-3 accepted units,
   under 2 h old) + `next_text`; a repair in the middle also passes `next_request_ids` [M]. A unit must match word for
   word (Parakeet; a unit passed only on Whisper's second opinion gets a human listen, since Whisper smooths slurs) at
   1.5-4.2 words/s; up to 4 seeds, then once untagged, then flagged for a human.
3. Stitch at the blank-line pauses, `check_take.py` on the whole take must print MATCH; deliver take + word timings + a
   one-line report. A take with a flagged unit is never called clean.
**Fixes needed in `generate_take.py`:** default model `eleven_v3` → `eleven_v4` (v3 rejects request stitching); leave
`style` / `speed` unset on v4; use request ids from the `request-id` header; PCM/WAV output when the plan allows (now MP3
128 kbps); add the whole-script-first mode; refuse a paste that fails `check_paste.py`.
**Cost (unconfirmed for v4):** ~1 credit per character: ~720 per whole-script try, ~1,500-3,000 per video with retries;
every API try is charged. **Trade-offs:** + the only mode where every failure is caught and redone before anyone hears
it; + no owner clicks. - Per-paragraph takes can sound assembled (stitching helps; untested on this voice). - A leaked
key costs money (restricted scope, credit cap, never printed or written). - The owner no longer picks between
performances unless we send alternates. - v4 drifts server-side for the API too, so the checks stay.

## 6. Linter spec (`check_paste.py`)

The owner only ever gets text printed by `check_paste.py --handoff` (paste block, expected length and max, settings
line; prints nothing on any error); a pre-commit hook runs it on every `docs/*/script/script_elevenlabs.md`. Regression
set: it must fail the v2 take-1 paste and the v3 pastes @ 4693e6f, ac73038, 1ca72e7, and pass the v2 take-2 paste.
**ERRORS (exit 1, nothing handed over):**
- E1 non-speech text: markdown (`#`, `>`, `|`, `- `, `* `, code fences), separators, labels (H1-H9, alternate, note,
  hook, option, take, version, line N), URLs.
- E2 brackets other than `[...]`, unbalanced or nested brackets, an empty tag.
- E3 a tag anywhere but the start of a paragraph (mid-line; today only a warning).
- E4 a tag alone on a line, two tags in a row, or two non-blank lines in a row (a paragraph is one line).
- E5 the first line doesn't start with a tag; the last line ends with a tag, an ellipsis, or no . ? !
- E6 in a tag: quotes, digits, a 3-word run from the spoken text, action, sound/reaction or multi-step words (then, at
  the end, beat, pause), more than 8 words.
- E7 more than 7 tags per 100 spoken words, or more than 8 tags.
- E8 in spoken text: digits, symbols (% $ & / = + @ # * _ ~ ^ |), emoji, dashes used as breaks (— – " - " --).
- E9 over 1,200 characters or over 150 spoken words.
**WARNINGS (printed; fixed, or why it is fine goes in the commit note):** W1 a tag of 5-8 words; W2 a negation in a tag;
W3 gesture words; W4 a tag repeating the tag in force; W5 5.5-7 tags per 100 words; W6 900-1,200 characters; W7 tags
over 15 % of characters; W8 CAPS over one per paragraph or three per script (acronym allowlist: AI, BBC, U.S., UK, EU,
CEO); W9 more than one ellipsis, or one at a paragraph start; W10 "US" (write "U.S."); W11 "And" right before a
capitalised name; W12 a two-word sentence start or a 3-word phrase used twice ("But Google", "told the BBC": landing
spots for a jump); W13 a paragraph over 45 words.
Output: spoken text, words, characters, tags, tags per 100 words, expected length (words / 2.8 per s) and max (1.3x).

**Unconfirmed:** the mid-line-tag cause (9 generations, one voice, unknown settings, confounded with density);
stability's effect on v4 loops; free regenerations on v4; Studio with v4 + tags; v4 credit cost; per-paragraph API joins.

## Critic notes (2026-10-26, sceptical review against `research_*.md`, `evidence.md` and the live ElevenLabs docs)

Verdict: sound and mostly honest. The format removes every trigger we have evidence for, but "never again" rests on
§3-§5 (three takes, `check_take.py`, the API path), not on the format; the intro already says so. Edits made above:
1. **Cause 1 was over-stated.** The 1-in-84 is post hoc (the feature was picked after screening 9 in `evidence.md` §4);
   take 2 changed five variables at once; and the official "Prompting Eleven v4" page itself uses mid-line tags
   (`[applause] Thank you all for coming tonight! [gunshot] What was that?`, `a VERY long day [sigh] … nobody`) and
   "then" tags (`[Gentle laugh, then sincere]`, `[Gentle pause, then quiet realization]`). Our ban rests on our data
   only: keep it (it is free), confidence now medium-high. A paste-level reading fits as well: v2 take 1's doubled
   opening came at 0.0 s, before any mid-line tag, in a paste at 8.8 tags per 100 words with about half its
   characters in tags. The format caps both, so the fix holds either way; "loses its place at the tag boundary"
   describes what we hear, it is not a known mechanism.
2. **Failure by failure:** read-aloud notes, labels, quoted phrases and the "correcting yourself" repeat are prevented
   mechanically (E1, E2, E6; the owner only gets `--handoff` output). Doubled opening, derail, restart and end loop are
   made less likely, not prevented: one clean generation is the whole evidence, the checks are the guarantee. The
   swallowed G gets a warning plus listening, the right weight for one case inside a derailed take.
3. **Settings:** right for an expressive but stable read (50 %, 65 % after a break, never below 40 %). Corrected: Clone
   Strength is "start at 0 %" (v4 overview; API: "We recommend 0"), not "default"; the app's default stability is not
   documented, so 50 % is set explicitly. Nothing on the web page matters more: v4 has no Style, Speed or Speaker
   boost slider; regeneration plus stability is all there is.
4. **Checked live (elevenlabs.io `.md` pages, 2026-10-26):** two free regenerations, sliders may change, under 2 h, no
   refresh, website only; on v3 one click gave two alternatives (v4 not stated), so the owner downloads both if shown;
   stitching not available for `eleven_v3`, at most 3 request ids, under 2 h; WAV/PCM 44.1 kHz needs Pro; API
   stability default 0.5. New in the API: an audio-effects block (distance, reverb, noise, pan); `generate_take.py`
   must leave it at its defaults.
5. **Cheap additions:** one settings screenshot with every set of takes (per-take settings are the biggest unknown in
   our evidence; costs the owner one click); prefer an uncut MATCH among the three takes before cutting; flag internal
   silences over 1.0 s (measured at -45 dB from peak: take 2's longest is 0.68 s, take 1 has 1.34 s); W12 widened to
   repeated 3-word phrases (jump landing spots: the "swear its military" garble came right after the second "told the
   BBC"; it also fires on the clean take-2 paste, so it stays a warning); a unit that passes only on Whisper gets a
   listen (Whisper's language model repairs slurs such as "And 'oogle").
6. **Numbers:** the take-2 paste is 714 characters (file at d86d51a, `ELEVENLABS.md` §5), not 717.
7. **Still to measure:** the new format's failure rate. Log every take; re-rate after about 10 generations. One
   structural failure in a lint-clean paste means cause 1 is wrong, and the API path becomes the default, not an
   option. The linter is deliberately stricter than the evidence (E9 would refuse v1's four clean 1,745-1,819
   character pastes); fine for 30-45 s scripts.
