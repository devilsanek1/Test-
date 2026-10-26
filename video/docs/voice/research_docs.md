# ElevenLabs v4 / v3: what the official docs say (research, 2026-10-26)

Scope: official ElevenLabs docs, help centre, changelog and blog, read on 2026-10-26 with curl via the `.md`
versions of the doc pages (WebFetch was blocked). "Unconfirmed" = seen only in search snippets or third-party pages.
Model the owner uses: **Eleven v4** (`eleven_v4`), launched 2026-09-28 (changelog), "first in a new generation",
"built on an entirely new architecture" (launch blog). v3 is now "previous generation"; v3 tag scripts still work on v4.

## Sources (date = published / last updated; "n.d." = undated doc page, read 2026-10-26)
- [D1] Best practices: "Prompting Eleven v4" + "Prompting Eleven v3", n.d.:
  https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices (old /docs/best-practices/prompting redirects here)
- [D2] Eleven v4 overview, n.d.: https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4
- [D3] Help "What is Eleven v4?", n.d.: https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/what-is-eleven-v4
- [D4] Help "How do audio tags work with Eleven v3 and v4?", n.d.: .../text-to-speech/how-do-audio-tags-work-with-eleven-v3-and-v4
- [D5] Help "How can I add pauses?" and "What's the maximum amount of characters?", n.d. (same help-centre folder)
- [D6] Models, n.d.: https://elevenlabs.io/docs/overview/models
- [D7] TTS playground guide (voice settings), n.d.: https://elevenlabs.io/docs/eleven-creative/playground/text-to-speech
- [D8] Troubleshooting, n.d.: https://elevenlabs.io/docs/eleven-creative/troubleshooting ; help "Why does my voice start
  whispering ... or break?": https://elevenlabs.io/docs/help-center/troubleshooting/why-does-my-voice-start-whispering-change-accent-change-tone-or-break
- [D9] API reference, Create speech / Create dialogue, n.d.: https://elevenlabs.io/docs/api-reference/text-to-speech/convert , .../text-to-dialogue/convert
- [C1] Changelog 2026-09-28: https://elevenlabs.io/docs/changelog/2026/9/28
- [B1] Blog "Introducing Eleven v4" (2026-09-28, upd. 2026-10-19): https://elevenlabs.io/blog/eleven-v4
- [B2] Blog "The Eleven v4 Audio Tags list" (2026-09-30, upd. 2026-10-15): https://elevenlabs.io/blog/elevenlabs-audio-tags-list
- [B3] Blog "Emotional TTS with Eleven v4" (2026-09-28): https://elevenlabs.io/blog/emotional-text-to-speech-with-eleven-v4
- [B4] Blog "How to add pauses in AI voiceover" (2026-10-02, upd. 2026-10-15): https://elevenlabs.io/blog/how-to-add-pauses-in-ai-voiceover
- [B5] Blog "Eleven v3 Audio Tags" (2025-06-06, upd. 2026-10-15): https://elevenlabs.io/blog/v3-audiotags
- [B6] Blog "v3 Audio Tags: precision delivery control" (2025-06-16): https://elevenlabs.io/blog/eleven-v3-audio-tags-precision-delivery-control-for-ai-speech
- [S1] Old v3 alpha prompting guide (Creative/Natural/Robust, 250 chars): **search snippets only**, page now redirects to D1.

## 1. Audio tags: vocabulary, form, placement
- Form: "Wrap a short instruction in square brackets and place it in the text where the delivery should change" [D4].
  Square brackets only: a tag gets read aloud "when the tag isn't formatted correctly ... parentheses or curly braces" [B2 FAQ].
- No fixed list: "Tags aren't limited to a fixed list"; write your own in natural language [B2]. Documented families:
  emotion ([excited], [curious], [thoughtful], [let down] ...), delivery/volume ([whispers], [softly], [quietly]),
  pacing ([slowly], [rushed], [pause], [long pause], [drawn out]), reactions ([sighs], [laughs]), accents, **sound effects**.
- Free-text director's notes ARE supported on v4: official examples "[Low, steady voice, restrained urgency]",
  "[Quiet, reflective narration]", "[Building tension, measured pace]", "[hushed and reverent, like a nature documentary
  narrator]", "[starting calm, then losing patience]", "[a tired detective who has heard it all before]" [D1, B2]; "describe how a
  line should be delivered in natural language ... [said angrily in French accent]" [B1]. Longest official tags: ~8 words.
- Placement: before the words it affects; "Emotion carries forward ... only introduce another tag when you want the
  delivery to shift" [B2]. "Use one tag per clause: contrasting tags on the same words can blur the performance" [B2];
  "Adding contrasting emotions ... may lead to a less accurate output" [B3]. Comma-combine in ONE bracket: [whispering, playful] [B2].
- Every official narration example puts the tag inline, on the same line, right before the text [D1, D2, B2, B3]. A tag
  alone on its own line appears only as a standalone event ("[Brief pause]" [D1]). Separate-line placement: not documented.
- Tags can become sounds: v4 "is trained to generate both vocal delivery styles and sound effects, a tag can occasionally be
  interpreted as a request for a sound effect"; write tags that "clearly describe the voice quality" [D1, B2 FAQ].
- Tags are performed, not just coloured: official tags include [repeats], [stammers], [interrupting] [B6, D1], so verbs in a
  tag get acted out (matches our "correcting yourself" repeat). ElevenLabs' own Enhance prompt: tags "MUST describe something
  auditory ... only for the voice"; never [standing], [grinning], [pacing], [music]; "never place original text inside brackets" [D1].
- Text outside brackets is spoken: "the model will still speak out the emotional delivery guides" written as prose [D1].
- Adherence is not guaranteed: tags are "not perfect yet ... we're continuing to iterate" [D1, D2]; tags land more readily
  when the delivery is in the voice's training data; match tags to the voice's character [D1].

## 2. Settings (v4 web app)
- v4 has two sliders, **Stability** and **Similarity** (+ Clone Strength for PVCs, start at 0%). "Style and Speed sliders are
  not available in Eleven v4, and SSML is not supported" [D2, D3]. (An older help page says speed works on "all models": stale.)
- Stability: "how consistent the delivery stays across generations. Lower values allow more expressive, varied delivery;
  higher values keep the performance closer to a fixed baseline" [D2]. Generic guide: too low gives "odd performances that are
  overly random and cause the character to speak too quickly"; too high gives monotone; "most common: stability around 50,
  similarity around 75" [D7]. API default 0.5 [D9]. Sliders set a randomness range, not a fixed result [D7].
- v3 presets [S1, unconfirmed verbatim]: Creative = most expressive but "prone to hallucinations"; Natural = closest to the
  reference, balanced; Robust = most stable but "less responsive to directional prompts". No v4 doc ties stability to
  hallucination, repeats or loops: our inference only.
- Similarity: higher = closer to the reference voice, "can come at the cost of some naturalness" [D2].
- Seed (best-effort determinism), previous_text/next_text: API only [D9]; not in the web app as far as the docs show.
- "Enhance" / "v4 Enhance" button auto-adds tags and may add CAPS, "?", "!" and ellipses [D1, B4]: it changes our cues.

## 3. Length
- Max per generation: v4 10,000 characters (~10 min), v3 5,000 [D5, D6]. Text to Dialogue API: keep <= 2,000 characters
  "for reliable generation. Longer requests can terminate early" [D9].
- v4 "works best when used for paragraphs or passages ... enough text to establish the context of a scene" [B3]; "Give the
  model a full scene" [B2]. v3: "Very short prompts are more likely to cause inconsistent outputs ... prompts greater than 250
  characters" [S1]. Our ~1,000-character paste is well inside every limit.
- Older generic advice (pre-v4 models): keep generations under 800-900 characters for accent stability, under 800 against
  degradation; use Studio (regenerate one paragraph) for anything over "a few hundred characters" with problems [D8].

## 4. Punctuation, CAPS, line breaks
- "Ellipses (...) add pauses and weight; Capitalization increases emphasis; standard punctuation provides natural speech
  rhythm" [D1]. Ellipsis "usually also adds some hesitation or nervousness" [D5]. "dashes cut a speaker off mid-sentence" [B3].
- Pause equivalents on v4: "[pause], an ellipsis in your text, or a line break" [B5]; [pause] = a breath, [long pause] = a
  deliberate silence, length set by context [B4]. "Text structure strongly influences output with v4" [D1].
- Long-form: "use the same pause conventions throughout"; switching style mid-script "might sound strange" [B4].
- Numbers/symbols: write them out; out-of-distribution names, abbreviations, symbols, emojis make output "more unstable" [D7].
- Pronunciation: v4 reads IPA between slashes inline, e.g. "/ˌbaɪoʊˈkemɪstri/", still voice-dependent: test first [D1].

## 5. Known limitations (official)
- Non-deterministic; regenerate and pick the best [D1, D8]. "Corrupt speech": no known cause, regenerate [D8].
- v4 "is under active, continuous development ... its behavior may shift over time"; re-test periodically [D2].
- Not documented anywhere official for v3 or v4: repeated opening, looped closing lines, mid-line restarts, dropped
  first consonant. No official cause or fix exists; third-party tips (raise stability, generate per paragraph, add a throwaway
  last line and trim it) are unconfirmed.

## What this means for us
1. The paste holds only `[tag] spoken words`. Anything else is spoken; never () or {}. Owner never presses Enhance. (high)
2. Put each tag on the SAME line, right before its words: `[quiet disbelief] She quit Google.` Our files put the tag on its own
   line, a form the docs only use for standalone events. Change it, and A/B it once against the old layout. (medium)
3. A tag names the voice only: emotion, tone, pace, volume, plus "like a ..." if it describes the voice. No objects, sounds,
   gestures, script words or verbs that can be acted out (repeat, correct, quote, interrupt, stammer). (high)
4. Tags: 1-8 words, positive, comma-combined in one bracket. Tags carry forward, so add one only where the delivery
   really changes. One per clause, never two contrasting tags on the same words, no mid-line tags. (high; fewer tags = fewer loops: medium)
5. Settings: model Eleven v4, Stability at the 0.5 default or a bit higher (0.5-0.65) if takes derail or loop, Similarity
   default, Clone Strength 0 if shown. There is no Speed slider on v4: pace comes from tags and punctuation. The owner
   reports the settings with each take. (medium: documented direction, number untested)
6. Paste the whole script in one go: about 1,000 characters is ideal context, far under the 10,000 limit. Don't split
   it into clips. (high)
7. Punctuation: CAPS for emphasis (one or two words per line), "..." for a weighted beat, no dangling dashes (a dash
   cuts the speaker off), same conventions all the way through. Numbers and symbols spelled out. (high)
8. A name at risk (a word starting with G or K after "And"): CAPS first. v4 IPA `/ˈɡuːɡəl/` is a tested fallback only. (medium)
9. Repeats, loops and restarts are an undocumented v4 failure mode, not something a paste rule can fully prevent: keep
   `check_take.py` on every take, and plan for one or two takes, or a paragraph regenerate in Studio. (high)
10. v4 keeps changing server-side: re-check this note and our rules when a new failure type appears. (high)
