# Integration plan (after the scene polish workflows)

Goal: one 55.37 s film that is seamless across all 12 cuts and the loop seam, where every scene scores >= 8/10 with
both reviewers, the full-film QA passes, the sound is re-locked to the final picture, and the final render is
delivered. Inputs: docs/INTEGRATION_TODO.md (open items), docs/scenes/SNN.md (per-scene notes),
storyboard_v3_resolved.json (beats), audio/ (voice, bed, cues, mixer).

Each phase is a workflow. The orchestrator reads its result before launching the next one, and every fix is
followed by a render and a look.

## Phase A: last scene polish + edge hints (parallel; no shared files)

- **A1. Polish:** run scene-polish for every scene whose last review is under 8 or carries a "+fix" (a final fix
  round that was never re-reviewed): currently S03, S05, S11, plus whatever S04, S07, S08, S09, S10, S12 end on.
  Same lenses, 2 rounds max, prebuilt.
- **A2. Edge hints (lib lane, `src/lib/edges/hints.ts` only):** run `review/edges/loose/final/tools/scan_hints.py` on
  clean renders of each scene, then add keep rects by hand for the hero, Pip and key props. Render a Main sheet with
  paint-subtle (12 frames + every cut) and check that the bare corners hold drawing and never cut an actor.

## Phase B: continuity at the cuts (two waves, so no two agents ever edit the same scene)

Each agent owns one cut: it may edit the two scenes on either side of it. It renders the last 8 frames of the outgoing
scene and the first 8 of the incoming one, in Main, with edges and captions. It checks:
- the match object's position and scale (lock, door, sign, sun)
- ink weight (inkComp where a dive ends)
- sun size and position
- Pip's pose and position
- the caption hand-off (`out` where a dive crosses the band)
- the tone switch
- the edge repaint on the cut
- that velocity carries through the cut (camera and actors)

Then it fixes and re-renders.
- **Wave 1:** S01|S02, S03|S04, S05|S06, S07|S08, S09|S10, S11|S12.
- **Wave 2:** S02|S03, S04|S05, S06|S07, S08|S09, S10|S11, S12|S01 (the loop seam: frame 1661 -> frame 0,
  captions roll back to page 1).

Cross-scene items folded into the matching cut agent:
- **FixSign:** the same object across S06, S07, S09 and S10 (size, line breaks, ink). Check J3 -> J4 -> J5 side by
  side.
- **S05 -> S06 messenger:** hair, collar and FigureArm (see INTEGRATION_TODO).
- **S11 -> S12 -> S01 plaza state:** set diff 0 px.

## Phase C: full-film QA + beat sync (no scene edits unless a gate fails)

- `bash scripts/qa/run_all.sh Main`: deadframes (life >= 8, no dead run > 0.40 s outside holds.json), framecheck,
  capcheck.
- `python3 scripts/qa/beatsync.py --fit-tempo`: every cut on a beat or half-beat (10/11 + S07 was the earlier state).
- S09's pull-back speed against the strobe limit (camspeed.py).
- Any failure goes back to the owning scene for one fix.

## Phase D: sound re-lock

- Re-derive SFX cue times from the final scene beats (`audio/tools/cues_from_storyboard.py` plus each scene's
  beats.ts where it moved a beat), and re-run `audio/tools/beatlock.py` if the cut times moved.
- Re-run `audio/tools/mix.py`: treated voice (vo_v3_final), the cinematic bed (subtle at the start), SFX at least
  8 dB under the voice, -14 LUFS, -1 dBTP.
- Check:
  - loudness and peak (ffmpeg ebur128)
  - voice intelligibility band
  - no SFX masking a stressed word (cross-check against timing.json stress)
  - the loop seam is click-free (last 50 ms -> first 50 ms)

## Phase E: final render + review panel

- Render Main at full quality: 1080x1920, 30 fps, H.264 high profile, CRF ~14 or 25-35 Mbps, yuv420p, AAC 320 kbps
  or better, with faststart. Check the duration (1661 frames = 55.367 s), A/V sync (the first plosive against the
  first caption), and that the loop replays cleanly in a player.
- Review panel: 3 independent judges look at dense frame samples (every 0.25 s), all cuts and the audio levels,
  each with a different lens:
  - the TikTok viewer (hook in the first second, retention, readability with sound off)
  - the reference artist (style match to ref 1 and the ref 2 scale peaks)
  - QA (glitches, typos, label legibility)

  Their findings become one last fix round, then a re-render.
- Deliverables: `out/php2shell_final.mp4` and a cover frame (the hook frame). Posting kit: the caption, a pinned
  comment, hashtags and A/B hook variants (as offered earlier).
