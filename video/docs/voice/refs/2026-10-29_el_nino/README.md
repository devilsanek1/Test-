# Reference: the El Niño voice line (owner, 2026-10-29)

**The owner:** "I'll give you another point of reference - listen there is first word cut off about El nino but it
sounds directionally good to me" (sent after their note on v4's draft 2: "add more human / conversation like sentences
TACTICALLY ... 'to put it into perspective' ... 'Actually' / 'so'"). File: `voice_line.flac` (lossless copy of the
owner's `Voice_Line_Clean_24bit.wav`: 25.5 s, mono, 44.1 kHz, 24-bit). The source isn't named. Its first word is cut
off (the file starts mid-word at full level): a flaw of the clip, not its style. Our takes keep their 0.12 s lead.

## What it says (Parakeet and Whisper agree; `transcript_whisper.txt`)
> [El Niño has] a 69% chance of breaking every climate record in human history, and people aren't really ready for it.
> So how does it work?
> El Niño is a change in the surface temperatures of water in the tropical Pacific.
> Or in other words, El Niño is when ocean water that belongs on one side of the planet is moving to the other side.
> Normally, trade winds blow west, piling up shallow, warm water against Indonesia and pulling up deeper, colder water
> off the coast of South America.
> The result is [cut]

## Measured
| | El Niño | our API takes (v2, v3) |
|---|---|---|
| Pace | 3.57 words/s (214 wpm) over 25.5 s | ~2.87 words/s (~172 wpm) |
| Pauses between sentences | 0.18-0.32 s | longer (paragraph breaks in the paste) |
| Pitch | a male voice, F0 median 121 Hz; p10-p90 spread 9.0 semitones (a lively read; a flat one is about 4-5) | v4's voice "Lady1" is female, young, American |
| Loudness spread (voiced, p10-p90) | 16.8 dB | |
| `check_rhythm.py` (max run 2) | **FAIL**: sentences 3-5 are three long ones in a row (15, 24 and 24 words) | |
| Sentence lengths | 19, 5, 15, 24, 24, 4 (cut) words | |

## Why it works (what we take from it)
1. **Spoken connectors that do real work, at the joins:** "So how does it work?" (says the viewer's own question
   aloud, then answers it at length: a turn into the mechanism, not a staccato reveal like "The result? X."), "Or in
   other words," (the plain restatement right after the term's textbook definition), "Normally," (the usual case
   before the change), "The result is that" (the consequence). They sound like a person explaining to a friend, and
   each one tells the listener what kind of sentence comes next. (They overlap the creative brief's RULE #1 list
   only in wording: "In other words" and a question the narrator asks are fine when they do this work; what RULE #1
   still bans is the stock reveal that promises drama and names nothing.)
2. **Long, flowing sentences, carried by the connectors:** three long sentences in a row (15-24 words), each ONE
   spoken thought, joined by commas, "and", "-ing" phrases; short lines only at the turns ("So how does it work?").
   Our rhythm check as it was (a short line after every 1-2 long ones) rejected it; the owner likes it. So the rule keeps
   its point (no monotone run; a short line at each turn) with a run of up to three long sentences when they flow.
3. **The name, then the plain words:** the technical name (El Niño) is said, defined, then said again in everyday
   words ("ocean water that belongs on one side of the planet is moving to the other side"): our clarity rule's "a
   term the story needs is described once, plainly, where it first appears", done in two steps.
4. **Stakes up front, with a human consequence:** a number and a superlative ("a 69% chance of breaking every
   climate record in human history"), then what it means for people ("and people aren't really ready for it").
5. **A brisk, lively read:** about 214 words a minute with short pauses and a wide pitch range: energy without
   shouting. At G2 our take aims for a brisk pace (the voice's own; ElevenLabs' speed setting if it reads slowly),
   short pauses between sentences, and a lively range; at that pace 45 s holds more words than our 2.87 words/s
   budget assumes, so the word budget follows the measured pace of the film's voice.

Used by: the playbook (Script and voice: "Human connectors", Rhythm; Taste signals), `docs/voice/VOICE.md` (pace at
G2), v4's draft 3.
