# ElevenLabs v3 / v4 failures: what people outside report (research, 2026-10-26)

Scope: real-world reports from 2025-2026 on Eleven v3 / v4 repeating, looping, restarting, garbling, reading tags aloud
and swallowing sounds, and what fixed them. Companion to `research_docs.md` (official docs).
Access: WebFetch was blocked. Reddit (403), the ElevenLabs feedback board and GitHub search were unreachable, and the
ElevenLabs Discord is not public, so pages were read with curl (forums, blogs, Hacker News via its API) or seen only in
search snippets. **"Snippet only"** = not read in full. Eleven v4 launched 2026-09-28, so v4-specific community reports
are still few. Most evidence is from v3, which the official v4 docs say shares the same tags and prompting.

## Sources (date = published / updated)
- [K1] Fabio Akita, "How ElevenLabs was not killed by Qwen3 TTS", 2026-04-09 (production dub, 194 chunks):
  https://akitaonrails.com/en/2026/04/09/how-elevenlabs-was-not-killed-by-qwen3-tts/
- [K2] Hacker News "Eleven v3" thread, 2025-06-05: https://news.ycombinator.com/item?id=44194521
- [K3] Robo Rhythms, "ElevenLabs Just Dropped v3", 2025-06-08 (round-up of user complaints): https://www.roborhythms.com/elevenlabs-v3-whats-new/
- [K4] Micdrop, "ElevenLabs Audio Tags in a Real-Time Voice Agent", 2026-09-30 (tested v4 Turbo on 2026-09-28): https://micdrop.dev/blog/elevenlabs-audio-tags-voice-agent
- [K5] inference.sh, "ElevenLabs v3 emotion without losing your voice", 2026-09-18: https://inference.sh/blog/guides/elevenlabs-v3-voice-cloning-fix
- [K6] QuestStudio, "Eleven v3 Audio Tags", 2026-09-13: https://queststudio.io/blog/eleven-v3-voice-audio-tags-guide
- [K7] VISK, "ElevenLabs v4 in Japanese vs v3", 2026-10-04: https://visk.co.jp/blog/elevenlabs-v4-japanese-test
- [K8] GlobalGPT, "Eleven v4 Turbo review", 2026-10-24 (upd. 10-26): https://glbgpt.com/hub/eleven-v4-turbo-review
- [K9] Duke DDMC, "Eleven Labs reflections", 2025-07-11: https://sites.duke.edu/ddmc/2025/07/11/eleven-labs-reflections/
- [K10] The Quantum Milkman, "Notes on AI for Text-To-Speech", 2025-08-16 (Studio audiobook): https://thequantummilkman.substack.com/p/notes-on-ai-for-text-to-speech
- [K11] Convai forum, "ElevenLabs voice returning slow motion audio", 2025-04-07..12 (v2 era, ElevenLabs support quoted):
  https://forum.convai.com/t/elevenlabs-voice-returning-slow-motion-audio/3522
- [K12] AI Voice Lab, "ElevenLabs emphasis guide", 2026-06-11: https://aivoicelab.com/blog/how-to-emphasize-in-elevenlabs-tts
- [K13] Bolna PR #1133, "send elevenlabs speech one sentence at a time" (snippet only, undated): https://github.com/bolna-ai/bolna/pull/1133
- [K14] zilpzalp issue #310 / PR #313, "eleven_v3 cuts short texts off" (snippet only, ~Oct 2026): https://github.com/schnaq/zilpzalp/issues/310
- [K15] dev.to (zrr), "Why I stopped paying for ElevenLabs", 2025-08-25: https://dev.to/zrr/why-i-stopped-paying-for-elevenlabs-in-2026-the-hidden-limitations-for-commercial-video-workflows-hcc
- [K16] Morphic, "Eleven v4 prompt guide", 2026-10 (vendor): https://morphic.com/resources/how-to/eleven-v4-guide
- Official pages used for cross-checks (read via curl, 2026-10-26): [E1] troubleshooting
  https://elevenlabs.io/docs/eleven-creative/troubleshooting ; [E2] Audio Tags list for v4 blog, 2026-09-30 (upd. 10-15)
  https://elevenlabs.io/blog/elevenlabs-audio-tags-list ; [E3] v3 precision-delivery blog, 2025-06-16
  https://elevenlabs.io/blog/eleven-v3-audio-tags-precision-delivery-control-for-ai-speech ; [E4] help "preview without
  losing quota" (free regenerations) https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/is-there-a-way-to-preview-audio-without-losing-quota-before-downloading ;
  [E5] best practices / Prompting Eleven v4 https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices

## 1. Runaway takes, loops, restarts (our v2 take 1: 88 s instead of 43 s)
- **Trigger: long input.** K1: on v3, ~1,500 characters in one go produced **nine minutes** of audio instead of ~1.5 min
  ("the model just decides to keep talking ... inventing content"). E1 (official): keep generations under 800-900
  characters; quality "may degrade" over longer ones. K11 (v2 era): output drifted into slow motion in the second half of
  ~340-character answers; support blamed extreme Stability/Similarity values.
- **Fix that held (K1, one producer, 194 chunks, zero hallucinations):** chunks of 700 characters or less, cut only at a
  sentence end; stability 0.9 (v3 "Robust"); text normalization on; **reject any take longer than 1.8x the expected
  duration** and regenerate. The official v3 guide (via search snippets) agrees that "Creative" is "prone to
  hallucinations". K5: "Creative ... can occasionally hallucinate sounds or insert unexpected vocalizations; regenerate".
- **Counter-signal:** the official v4 tag blog [E2] says v4 "performs better with context" and offers 10,000 characters.
  No v4 runaway report was found yet, so the length limit is **confirmed for v3 only** (K1, E1, K11) and unconfirmed for v4.
- **Tag density as a trigger:** K5 ("over-tagging produces chaotic audio"), K6 ("the voice adds extra sounds or words?
  The prompt is overloaded: remove all but one direction"), K4 (v4 Turbo: without a cap the voice overacts; they allow
  1-3 tags per 2-4 sentences). Official [E2]: "emotion carries forward ... only introduce another tag when you want the
  delivery to shift"; "one tag per clause: contrasting tags on the same words can blur the performance".
  **Confirmed by 4 sources**, but none ties over-tagging to loops specifically: they report extra sounds, overacting and chaos.

## 2. Repeated words or sentences, doubled openings
- **Instruction-like text gets performed.** E3 lists `[repeats]` and `[stammers]` as real v3 tags, so a cue about
  correcting or repeating is an instruction to repeat (this matches our "correcting yourself" failure). K2: a user wrote
  "(Do not read this sentence.)" and v3 skipped it once; `[verse]` / `[chorus]` labels made it sing. **Confirmed**
  (official tag list plus a user report).
- **Boundary repeats.** K10 (Studio): the first phoneme of the next paragraph sometimes appears at the end of the one
  before, so it is heard twice. K13 (streaming, snippet only): a chunk that ends mid-sentence gets a word voiced twice or
  garbled. The fix in both: whole sentences per unit, with clear pauses between paragraphs.
- **False alarms.** K8: "apparent repeated words at transcription chunk boundaries did not recur" on re-check: an
  automatic mismatch calls for listening, not a verdict.
- **Doubled first words ("She quit. She quit Google."):** **no community report or fix found.** The nearest is the HN
  skipped-first-sentence anecdote (K2) and the v3 advice that very short prompts are less consistent (old official v3 guide, snippet only: ≥250
  characters). Treat it as unsolved and cut it in post.

## 3. Tags, notes and quoted words read aloud
- **Wrong model or wrong brackets** (round or curly brackets) is the most common cause: official FAQ [E2], K4 (Flash v2.5
  read "laughs ... whispers" aloud; v4 Turbo read no tag words), K6, K16. **Confirmed by many sources.**
- **Voice mismatch:** a soft voice asked to `[shout]` may say the tag (official v3 blog). K3: early v3 testers said
  it "often just reads them out loud"; one said tags worked 1 time in 6.
- **Anything that is not tagged speech is spoken:** headings, labels, notes. K9 removed quotes and CAPS in pre-processing;
  K10: a leading dash was read as "dash" / "minus". Official v4 docs: a tag can be taken as a **sound effect** request,
  so describe the voice ("[low, gravelly voice]"). No source tested **negations** ("no gasp"). Since tags are performed,
  not parsed, "gasp" inside a negated tag is a plausible trigger (**our inference, unconfirmed**).

## 4. Garbled, hallucinated or swallowed words
- **Proper nouns:** K7 (v4, Japanese): name errors fell from 4 (v3) to 2 but did not go away; v4 invented one new
  wrong reading. K10: names get "completed" ("R. Descartes" became "René Descartes"). K15: "slurs a proper noun at minute
  four", fixed by re-rendering the paragraph. Official fixes: spell names phonetically, use IPA in slashes on v4, or use
  a pronunciation dictionary (Studio).
- **CAPS:** K9 found all-caps words "made for unreliable results" (extra letters inserted); K12 says use one or two CAPS
  words per sentence at most. Official v4 docs: CAPS adds emphasis. So it works, but **sparingly** (2 sources).
- **Swallowed first consonant ("And 'oogle"):** **no direct report found.** Closest: K1 (a clipped first syllable, caused
  by the voice-clone sample having no lead-in silence), K14 (v3 cut short texts), K10 (phonemes moving across boundaries).
  Unconfirmed; we rely on our transcript check.
- **Stability does not tame a tagged read on v4:** K7 set stability to maximum and heard "hardly any difference": the tags
  dominate. One test only.

## 5. What fixed things, ranked by how many people report it
1. **Regenerate the take (or only the bad part)** and keep the best: official (E1 "regenerate the section", E2 "swap the
   tag ... and regenerate"), K1, K5, K6, K15, K16 ("generate two or three takes"). The web app gives **two free
   regenerations** if the text, voice and model are unchanged, within two hours and without a page refresh (sliders may change) [E4].
2. **Shorter units at sentence ends** (≤700-900 characters; regenerate one paragraph or sentence): E1, K1, K10, K11, K13.
3. **Fewer, plainer tags** where the delivery shifts: E2, K4, K5, K6.
4. **Duration sanity check on every take** (reject over 1.8x the expected length): K1. One source, but cheap and mechanical.
5. **Higher stability / "Robust" against hallucination**: official v3 guide, K1. On v4: unconfirmed (K7 heard no effect on delivery).
6. **Seeds:** the API's `seed` is "best effort ... not guaranteed" (official). The web app has no seed field: not usable for the owner.

## What this means for us
1. **The owner always makes three takes and sends all three:** Generate once, then press "Regenerate speech" twice
   (free, same text, no page refresh, no edits in between). We check them all and keep the best. Never edit the text
   between takes: an edit costs credits and loses the free regenerations.
2. **Owner-side length check, written into the hand-off:** "this should be about N seconds; if a take is longer than
   N x 1.3, it went wrong: regenerate (free)". A take over 1.3x is rejected, not cut (v2 take 1 was 2x).
3. **The whole paste stays at 800 characters or less, tags included** (spoken text ~650 + tags ≤ ~150). The broken v2
   take came from a 1,345-character paste with 699 characters of tags; the re-cut v2 paste is still 1,034.
   `check_paste.py` should count characters (warn over 800, error over 1,000).
4. **Tags only where the delivery shifts: 4-6 per script, 2-5 words each,** built from documented tags or a plain voice
   description ("quiet, close", "dry, level"). The emotion carries forward, so a line with the same tone gets no new tag.
5. **No tag may contain a sound or reaction word, even negated** (gasp, laugh, sigh, breath, mic drop, applause, pause),
   an action word (repeat, correct, stammer, quote, read, say), quotes, digits or a label. Extend the linter's word list.
6. **The owner never presses "Enhance" / auto-tag;** model "Eleven v4" (not Turbo, not v2); stability at default or
   higher, never the far "creative" end. We put these settings in every hand-off.
7. **Fallback after two broken takes at the same spot:** split the paste at a sentence end into two parts of at least
   250 characters each. The owner regenerates only the broken part, and we stitch the parts at a pause.
8. **CAPS at most once per line, never on a brand name glued to "And":** rephrase so the name does not follow "And"
   (e.g. "Google can't even veto how it's used"). Unconfirmed: keep checking every name in the transcript.
9. **Doubled opening: no known paste fix.** Keep `check_take.py` + `clean_take.py`. Confirm any EXTRA at a transcript
   chunk boundary by listening before cutting (K8).
10. **One ellipsis per script at most;** the official docs say an ellipsis "usually also adds some hesitation or nervousness".
11. **Re-test after model updates:** the official docs say v4 "may shift over time". Log the voice, model, settings and
    outcome of every take in `ELEVENLABS.md` (K6's take log).
