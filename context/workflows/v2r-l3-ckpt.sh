#!/usr/bin/env bash
# Lane L3 checkpoint: usage  bash context/workflows/v2r-l3-ckpt.sh "<one-line message>"
# The bundle must render (a syntax/runtime error blocks the commit); tsc must be clean for V2S3*/V2S4* (type errors are
# named and block too). Commits ONLY L3's paths (git add <paths>, never -A): the V2S3*/V2S4* scene files, L3's presets in
# world/skies.ts, the L3 depth sheets, the L3 lane docs; then fetch + merge origin/video-production and push (4 tries).
msg="${1:-v2r L3: checkpoint}"
S=/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad
cd /home/user/Test-/video || exit 1
errs=$(timeout 300 npx tsc --noEmit -p . 2>&1 | grep -E "error TS" | head -8)
if [ -n "$errs" ]; then echo "TYPE ERRORS (not committing):"; echo "$errs"; exit 1; fi
mkdir -p $S/wip
ok=$(nice -n 10 env GL=angle node scripts/render-frames.mjs Film2R $S/wip 13.5,17.0 --entry=src/entry-v2r-film.tsx --scale=0.25 2>&1 | grep -c "render-frames\]")
if [ "$ok" = "0" ]; then echo "RENDER FAILED (not committing)"; exit 1; fi
cd /home/user/Test- || exit 1
git add video/src/v2r/scenes/V2S3* video/src/v2r/scenes/V2S4* video/src/v2r/world/skies.ts video/docs/v2/lanes/*_L3.md context/workflows/v2r-l3-* 2>/dev/null
git add video/scripts/qa/depth_sheets/v2_s3*.json video/scripts/qa/depth_sheets/v2_s4*.json 2>/dev/null
if git diff --cached --quiet; then echo "nothing to checkpoint"; else
  for i in 1 2 3 4 5; do git commit -q -m "$msg" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_014PwCXJs9nWENkpKqVhHWMP" && break; sleep 3; done
fi
for i in 1 2 3 4; do
  git fetch -q origin video-production && git merge -q --no-edit origin/video-production 2>&1 | tail -2
  if git push -q origin HEAD:video-production 2>&1 | grep -q "rejected\|error\|fatal"; then sleep $((2 ** i)); else echo "pushed"; break; fi
done
git log --oneline -1 | cat
git status --short | grep -v "^??" | cat
