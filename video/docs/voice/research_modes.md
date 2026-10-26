# ElevenLabs generation modes and reliability (research, 2026-10-26)

Question: which way of generating gives the owner a clean, continuous narration from one paste, and what an API workflow
(we generate per line with the owner's voice, check by speech recognition, regenerate failures) needs. Official pages
were read with curl via their `.md` versions (WebFetch could not resolve third-party hosts). "Unconfirmed" = not stated
by any official page; "inferred" = our reading of official facts. Sibling notes: `research_docs.md`, `research_community.md`.

## Sources (date = published / updated; "n.d." = undated doc page, read 2026-10-26)
- [V1] Eleven v4 overview, n.d.: https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4 ; help "What is
  Eleven v4?", n.d.: https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/what-is-eleven-v4
- [V2] Models + character limits, n.d.: https://elevenlabs.io/docs/overview/models
- [V3] Blog "Introducing Eleven v4", 2026-09-28, upd. 2026-10-19: https://elevenlabs.io/blog/eleven-v4
- [V4] v4 landing page + FAQ, n.d.: https://elevenlabs.io/v4
- [V5] Changelog, entries 2026-09-28, 2026-10-12, 2026-10-19: https://elevenlabs.io/docs/changelog
- [S1] Studio guide, n.d.: https://elevenlabs.io/docs/eleven-creative/products/studio
- [S2] Studio help pages, n.d.: .../docs/help-center/product/studio/studio/what-is-auto-regenerate, ...does-it-cost-credits-to-regenerate-in-studio,
  ...can-i-regenerate-individual-words-in-studio, ...what-is-generation-history-in-studio (all under https://elevenlabs.io)
- [S3] Troubleshooting, n.d.: https://elevenlabs.io/docs/eleven-creative/troubleshooting
- [T1] Help "Do I use quota on every generation?", n.d.: https://elevenlabs.io/docs/help-center/account/general/do-i-use-quota-on-every-generation
- [D1] Help "What is Dialogue mode?", n.d.: https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/what-is-dialogue-mode
- [D2] Text to Dialogue overview + API (Create dialogue, with timestamps), n.d.: https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue ,
  https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert , .../text-to-dialogue/convert-with-timestamps
- [A1] API Create speech, n.d.: https://elevenlabs.io/docs/api-reference/text-to-speech/convert ; with timing:
  https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- [A2] Guide "Stitching multiple requests", n.d.: https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/request-stitching
- [A3] API keys, n.d.: https://elevenlabs.io/docs/overview/administration/workspaces/api-keys ; voice ID help, n.d.:
  https://elevenlabs.io/docs/help-center/technical/how-do-i-find-the-voice-id-of-my-voices-via-the-website-and-api
- [X1] RAXXO blog, n.d. (after 2026-09-28): https://raxxo.shop/blogs/lab/eleven-v4-vs-v4-turbo-vs-v3-which-to-use ; [X2] Jack
  Righteous, 2026-09-01 (snippet date): https://jackrighteous.com/en-gb/blogs/ai-creator-tools/elevenlabs-studio-3-long-form-workflow

## 1. Text to Speech page: one generation for the whole paste
- Paste, pick voice and model, Generate [T1]. Up to 10,000 characters per generation on v4 [V2]; our pastes are ~1,000.
- Two free regenerations if text, voice and model stay the same, the first take is under 2 h old and the page wasn't
  refreshed; sliders may change [T1]. On v3 each click gave two alternatives for one charge [T1]; v4: unconfirmed.
- No seed, no stitching, no partial regenerate on this page [T1, A1]. One generation = one failure domain: a derail in
  line 5 or a loop at the end ruins or lengthens the whole take (v2 take 1: 88 s instead of 43 s).
- Pro: whole-script context, one emotional arc. Con: nothing contains or detects a failure; we find it afterwards.

## 2. Studio (Audio project): paste once, generated paragraph by paragraph
- Supports v4 ("supports our latest speech models, including Eleven v4", switch in Project settings) [S1]; but "the
  default model for most new projects is Eleven Multilingual v2" [S1], so v4 must be picked in every new project.
- Each paragraph is its own generation (status bar per paragraph; "generate one at a time" play mode); up to 5,000
  characters per paragraph, 400 paragraphs per chapter [S1]. Pasting keeps line breaks [S3].
- Repair: regenerate one paragraph, or a selection ("regenerate a complete phrase or sentence") [S2]; two free
  regenerations per paragraph if text and voice are unchanged [S2]; generation history with restore; lock paragraph [S1].
- **Auto-regeneration on Export:** when the whole chapter or project is converted in one step from Export, Studio checks
  "volume distortions, voice similarity, mispronunciations, missing or additional words" and regenerates up to twice,
  free [S1, S2]. This is the built-in version of our `check_take.py` loop. Whether it runs on v4: unconfirmed.
- Context between paragraphs: "Request stitching ... is significantly more reliable in Eleven v4, which improves the
  experience of working in ElevenLabs Studio" [V3]: Studio chains paragraphs with stitching (inferred).
- Audio tags in Studio: no official page says so either way; v4 tags are plain text, so they should pass (unconfirmed).
  How Studio splits a single newline (our tag line + text line) is undocumented: a tag alone in a paragraph could be
  spoken or played as a sound (inferred risk).
- Known faults: "glitches or sharp breaths" between paragraphs (regenerate the one before) [S3]; the next paragraph's
  first phoneme heard twice (`research_community.md` K10). Third-party advice: approve, lock, repair one paragraph [X2].
- Fit for our owner: fewer runaway takes (a loop cannot spread past its paragraph) and cheap repairs, but more clicks
  (Studio 4.0 is prompt-first with video projects and an agent [S1]) and per-line paragraphs are short (v4 "works best"
  with passages, `research_docs.md` B3). Untested by us.

## 3. Dialogue mode
- Web: only "when you use multiple speakers" [D1]; a single narrator gains nothing. API Text to Dialogue: v4 and v3,
  default model `eleven_v3`; "keep the total ... at or below 2,000 characters per request. Longer requests can
  terminate early" [D2]; continuity fields `previous_text` / `future_text` (max 100
  characters) and request ids, "not supported by every model" [D2]; the timestamps variant returns `voice_segments` with
  `dialogue_input_index`, i.e. per-line start and end times [D2]. Changelog 2026-09-28: "Use eleven_v4 through the Text
  to Dialogue API for content creation and long-form audio" [V5]. One voice per input for a narrator: possible, untested.

## 4. API: Create speech (`POST /v1/text-to-speech/{voice_id}`, header `xi-api-key`)
- Model ids: `eleven_v4` (quality), `eleven_v4_turbo` (real-time) [V1]; endpoint default `eleven_multilingual_v2` [A1].
- `seed`: "best effort ... Determinism is not guaranteed" [A1]. Good for varying retries, not for reproducing a take.
- Stitching: `previous_text` / `next_text`, or `previous_request_ids` / `next_request_ids` (max 3 each; ids win over text;
  `next_request_ids` is meant for regenerating a middle clip) [A1]. Ids come from the `request-id` response header, must be
  under 2 h old, and the audio must be fully read first [A2]. "Not available for the `eleven_v3` model"; the guide's own
  example uses `eleven_v4` [A2]; v4 marketing: "context stitching keeps pacing and delivery consistent" [V4].
- With timestamps (`/with-timestamps`): audio plus per-character times of OUR input text (and normalized text) [A1]. It
  aligns the intended text, so it cannot show a repeated, skipped or invented line (inferred): it is not a check.
- v4 settings: Stability, Similarity, Clone Strength for PVCs; "Style and Speed sliders are not available in Eleven v4"
  [V1]. The API still accepts `style` / `speed`; their effect on v4 is unconfirmed: leave them at defaults.
- Output: WAV/PCM at 44.1 kHz needs the Pro plan, 192 kbps MP3 needs Creator [A1]. No free regenerations via the API:
  every try is charged [T1]. Pre-v4 clones "will need to retrain them with Eleven v4" (hover the voice, click plus) [V4].
- "Speaker identity is now stable across regenerations" [V4] (vendor claim); on v3 a regenerated line could sound like
  "a close cousin" of the narrator [X1], which made per-line repair risky.

## 5. The API pipeline (we generate; the owner only listens)
1. Parse the paste file into units: one tag + one or more whole sentences; never cut mid-sentence.
2. Generate unit i with `eleven_v4`, the owner's voice, the paste's tag, `previous_request_ids` = the last 1-3 accepted
   units, `next_text` = the next unit's words, a fresh seed per try, WAV/PCM output.
3. Check: transcribe the unit (local Parakeet, as `check_take.py`; ElevenLabs Scribe is a paid alternative), compare
   words exactly with the script, and gate duration (reject over ~1.5x the expected length: runaway or loop).
4. Fail: retry with a new seed (3-4 tries); then retry without the tag; then flag the unit for a human ear.
5. Repairing a unit after its successor exists: pass `next_request_ids` = [the successor] so both joins fit [A1].
6. Stitch at the pauses (trim silences, short crossfades, keep natural gaps), then run `check_take.py` on the whole take
   (must print MATCH) and keep its word timings for G3+. Send the owner one WAV + a one-line report.
- The owner gives once: a restricted API key (scopes Text to Speech + Voices read; credit cap; optional expiry; IP
  allowlist possible) stored as the environment secret `ELEVENLABS_API_KEY` [A3]; the voice ID (My Voices > More
  actions > Copy voice ID) [A3]; the plan tier (WAV 44.1 kHz); a yes that the clone was retrained for v4. A key leaked to
  public GitHub is auto-disabled [A3]: never write it to a file.
- Cost: ~1 credit per character (search results; unconfirmed for v4): ~1,500-3,000 credits per take with retries (estimate).
- `scripts/voice/generate_take.py` (draft, untracked) already follows steps 1-4; from this research it should send
  `previous_request_ids` (not only text), `next_request_ids` on repairs, and leave `style` / `speed` unset on v4.

## 6. Ranking for "paste once, get a clean narration"
1. **API pipeline (owner pastes nothing):** the only mode where every failure is caught and regenerated before the owner
   hears it. Risk: joins between units; mitigated by stitching ids and whole-sentence units.
2. **Studio + Export of the chapter:** per-paragraph containment, built-in missing/extra-word auto-regeneration, cheap
   paragraph repairs. Unconfirmed on v4 and with tags; must be A/B-tested once against the TTS page with `check_take.py`.
3. **Text to Speech page:** simplest, best one-shot arc, but no containment; keep it with three takes and our checker.
4. **Dialogue mode:** for several speakers; not for our narrator.

## What this means for us
1. No paste rule makes a one-shot v4 take reliable: loops, restarts and doubled openings are undocumented and random.
   "Make sure we don't see this again" = verify every take and regenerate failures automatically. (high)
2. Default path once the key and voice ID arrive: the API pipeline in section 5; the owner receives a checked WAV. (high)
3. Units are whole sentences under one tag, chained with `previous_request_ids` (max 3, under 2 h) + `next_text`;
   repairs also pass `next_request_ids`. (medium: documented, untested on our voice)
4. Always send `model_id: "eleven_v4"` (API defaults are `eleven_multilingual_v2`, and `eleven_v3` for dialogue). (high)
5. A unit passes only on an exact ASR word match and a duration within ~1.5x of expected; `/with-timestamps` is
   timing, never a check. (high)
6. The owner gives once: restricted key as the secret `ELEVENLABS_API_KEY`, the voice ID, the plan tier, and confirms
   the clone was retrained for v4. (high)
7. Seeds vary retries; they don't reproduce takes. API retries cost credits: cap at 4 tries per unit. (high)
8. If the owner must paste: try Studio (Audio project, model v4, tag on the same line as its words, Export the chapter)
   once against the TTS page, both checked with `check_take.py`; adopt only if cleaner. (low-medium)
9. TTS-page fallback: three takes (Generate + two free regenerations), all checked; never Dialogue mode. (high)
