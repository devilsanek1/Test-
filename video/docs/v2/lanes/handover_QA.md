# Handover QA (gate_check for v2r)

Done (commits on video-production):
- `scripts/qa/gate_check.py`: cuts follow each scene's `transitionIn.type` (push-through + bridge = cuts at c +- 0.05 s;
  push-through without bridge = cut at c; foreground-wipe = no cut, WARN if one is detected at c; cut-like frames inside
  transition windows not listed as extra); `--frame0-geom` JSON (size, baselines, captionBaseline, captionScale, spoken
  "first", keys, source/sourceSize/sourceBaseline). Header documents both.
- `docs/v2/BUILD.md` gate-check command line now carries FILM2R_FRAME0's geometry.
- v3 (out/v3_check.mp4, Film3 at --scale=0.25 --gl=angle): before = after, byte-identical text + JSON: PASS (0 fail, 2 warn);
  also identical without --frame0.
- v2r (Film2R at --scale=0.25): new: PASS (0 fail, 1 warn: extra cut-like frames 8, 10, 2334, 2337, 2343 = intro and
  un-build); old script on the same render: FAIL cuts V2S2 (366) and V2S8 (1976). Negative tests: captions into the block
  and caption over the source line both FAIL as they should; a non-object --frame0-geom errors out.

Next:
- Fresh-eyes critic round on `git diff 5760d6f~1 -- video/scripts/qa/gate_check.py` (was interrupted; not run yet).
- Write `report_QA.md` (done signal) with the numbers above + the critic verdict.
- REQUEST for the orchestrator: BUILD.md section 5's "Known by design" note (FAIL cuts V2S2/V2S8; frame-0 modelled with
  the default F0) is stale now; replace with: "gate_check models push-through / foreground-wipe and FILM2R_FRAME0 via
  --frame0-geom: the 2026-10-27 quarter-scale render passes (0 fail, 1 warn: the intro and un-build cut-like frames)."

## 2026-10-27 (second helper, handed over before any result)
- Finished: nothing new in code. Pulled, read COMMON / brief / handover and the full gate_check diff (`git diff 5760d6f~1 -- video/scripts/qa/gate_check.py`).
  No workflow was run; no renders made (this container had no node_modules or out/: `npm ci` was mid-install; `pip install opencv-python-headless` needed).
- Next (unchanged): adversarial verification workflow on that diff (critics: v3 backward compatibility; v2r push-through / foreground-wipe
  transition model vs lib/Film.tsx pushThrough + PT_HOLD; frame-0 geometry vs Film2R.tsx FILM2R_FRAME0, incl. "spoken":"first" hidden pages and
  "keys" boxing; edge cases: --only, missing transitionIn/dur, bridge falsy, empty --frame0-geom), fix survivors, re-render
  `out/v3_check.mp4` (Film3, --scale=0.25 --gl=angle) and Film2R at --scale=0.25, confirm v3 byte-identical (old vs new script) and v2r PASS,
  then write report_QA.md (done signal) with the numbers above + the critic verdict + the BUILD.md section 5 REQUEST.
- Note: BUILD.md section 5's command uses captionScale 0.5306 and keys ["SAYS:","NO","NO CRITICIZING","FOR LIFE."]; the script header
  example uses 0.531 and three keys: align the header to BUILD.md / Film2R.tsx.
