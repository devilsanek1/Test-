# Streamlining plan (2026-10-28): faster, cheaper films with the same look

From three reviews (analysis only, nothing changed): `tokens.md` (where a film's tokens go), `render.md` (render and
engine speed, measured on the v2r film), `codebase.md` (code, scripts and automation). The owner's condition: "we MUST
not sacrifice the quality of the video, we MUST not sacrifice the details and overall look and feel".

## What never changes
The look and the detail; 60 fps full-size owner cuts and masters (same encode: CRF 14, slow preset); every gate and
every owner review; the cold viewer and the G4 art director; MAX effort. Every render change is proven by a frame diff
or an MD5 against the delivered v2r master (a re-render of it is byte-identical, so it is an exact test bed).

## Where the time and tokens go today
- **Review and fix loops** are most of a film's tokens (v1: fix 40 %, review 28 %, build 18 %). A scene went through
  12-25 reviews and 5-11 fixes, with fresh reviewers every round, so it never converged (141 of 173 reviews still found
  a blocker). Reviewers also measured things by hand that scripts already measure.
- **Long sessions cost with the square of their length**, since every step re-reads the whole context. Sessions of 60+
  steps hold 55 % of the recorded G3-G5 tokens; the largest single agent (a G5b fixer, 137 steps) used about 30 M.
- **Reading lists:** an agent is told to read 26-128k tokens of docs before working, re-paid on every step.
- **The orchestrator:** big contexts (433k mean per step on v1, about 400k mean and up to 782k on v4) and many small steps (27 % were commits).
- **Each film rewrites its own G3-G8 automation** (168-276 KB of new workflow scripts) and hand-copies about 360 lines of
  film setup; 45 % of `video/src` is finished or dead code (v1, v2's first try, unused v3 panels).
- **Renders:** a full master takes 6.5 min on an idle box (10 min on a busy one). The bare CLI renders gate videos with
  a slow software GL (`swangle`): 45x slower, with 36 % of pixels different from the master (v3's G5b cut took 63 min +
  26 min of audio). Every still rebuilds the bundle and launches two browsers (3.5 s for a 0.5 s frame).
- **The meter itself over-counts about 2.4x** (usage repeated per transcript line): v1's "12.5 B tokens" is about 5 B. Fixed in Phase 1 (spend.py v2).

## Phase 1: safe now (no pixel changes; each checked by an MD5 or a 0-pixel diff)
1. **Fix the spend meter** (dedupe per API call; per gate and per role), so every saving below is measured. (S)
2. **Gate videos through `render-media.mjs`, never the bare CLI; drop `swangle`.** CLI cuts go from hours to minutes
   and match the master's pixels. (S)
3. **Chunked renders mux the premixed voice-and-sound file** instead of an audio-only render (26 min -> seconds). (S)
4. **Previews: a cached bundle and one browser per call; one call per contact sheet:** about 60-80 % off every still
   and 2x on sheets. (S-M)
5. **Review cuts and lane clips render as parallel chunks + concat** (timing seamless; masters stay one encode). (S-M)
6. **Scripts measure first:** the existing QA checks run before any reviewer, and the reviewer judges only what scripts
   can't. Workflow steps become resumable after a usage limit (nothing is replayed). The image budget of about 8 per
   agent comes back. (S)
7. **The orchestrator:** a fresh session per gate, onboarded from the film's README and a gate brief (about 10k tokens,
   not 80k); woken by events, not the clock; status written by a script. (S-M)
8. **Code hygiene:** tag the delivered films (an old film re-renders exactly from its tag); move v1, v2's first try and
   v3's dead panels to `video/archive/` (typecheck 15-18 s -> about 9 s; 37-47 % less noise in code searches); a scripts
   index; v1's history docs to `docs/v1/`; `npm run typecheck`, never `npx tsc` (12,041 false errors from the wrong
   TypeScript). (S-M)

## Phase 2: needs the owner's yes and a quality test (before v4's G3)
9. **Masters on Remotion's own Chrome (raw frames, no PNG round trip): 6:28 -> 3:51 (-40 %).** The rendered pixels are
   identical; the encode rounds colour by a hair (54 dB to today's master) and is exactly as faithful to the lossless
   frames; the sky's banding checks give the same verdicts. Test: those numbers again, and a side-by-side for the owner.
10. **Masters across 3 browsers: 2:56 (-55 %)**, within the measured noise floor. Test as above.
11. **Closed-list reviews with a hard stop:** one review (at most 6 findings, each with a time and a measure) -> one fix
    -> one check of those findings only -> the owner. Plus `qa_pack`: one command that renders the review sheets once
    and runs every check, then one taste reviewer and one cold viewer. Test: replayed on v3 and v2r, it must find 100 %
    of the blockers the old panels found.
12. **Short sessions:** a fixer owns one group of findings and hands over at about 60 steps; resume, never restart. Test:
    the same findings, fixed split vs unsplit, close the same way with no regression on the same frames.
13. **A short brief per gate** (5-8k tokens, the owner's words first, built by a script from the canonical docs)
    instead of 26-128k reading lists. Test: the lane style quiz answered from the brief matches the full read.
14. **A new film from a template:** one workflow template per gate with a parameter block, a film manifest and a
    `new_film.py` that generates the entries (60 fps), the film shell, cover, palette stub and docs; the G3 toolkit in one
    shared place (`lib/g3`), where the planned tier-1 tools get built. Test: a throwaway film generated from v3's data
    renders frames identical to v3's.

## Phase 3: engine work, one shot first
15. **The light layers' blend groups take 54 % of a frame's time** (one Chrome compositor thread re-blends them about
    6 times per frame). Merging groups and trimming their masks could save up to about 35 % of a lit frame; ship only
    what is pixel-identical. (M-L)
16. **A scene-level render cache:** a fix re-renders only the scene it touched and its joins (an exact key; a cached
    rebuild must equal a fresh render byte for byte). (M)

## The expected result (estimates)
- **Tokens:** about 35-50 % fewer for G3-G8, about 12-20 weekly points per film (a G3-G8 film costs about 30-45 today).
- **Time:** masters 40-55 % faster; gate cuts minutes instead of hours; stills about 1 s; a one-shot fix re-renders one
  scene; a new film starts from a template instead of copies.

## Order and coordination
Phase 1 first, in one focused session. The code moves and the shared render scripts wait until v2r ships (it is at
its master) or go in with that session's knowledge, since every change is pixel-neutral. Phase 2's tests run on the
v2r and v3 renders already delivered, so no new film is needed, and land before v4's G3. Phase 3 after.
