#!/usr/bin/env bash
# Checkpoint the L3 builders' in-progress files: the bundle must render (a syntax error blocks it); type-only errors are
# noted in the message (builders clear them before they finish). Commits ONLY V2S3*/V2S4* scene files, then pull + push.
S=/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad
cd /home/user/Test-/video
errs=$(timeout 300 npx tsc --noEmit -p . 2>&1 | grep -E "src/v2r/scenes/V2S[34]" | head -5)
mkdir -p $S/wip
ok=$(nice -n 10 env GL=angle node scripts/render-frames.mjs Film2R $S/wip 13.5,17.0 --entry=src/entry-v2r-film.tsx --scale=0.25 2>&1 | grep -c "render-frames\]")
if [ "$ok" = "0" ]; then echo "RENDER FAILED (not committing)"; exit 1; fi
note="typecheck clean"; [ -n "$errs" ] && note="open type-only errors: $(echo "$errs" | cut -d'(' -f1 | sort -u | tr '\n' ' ')"
cd /home/user/Test-
git add video/src/v2r/scenes/V2S3* video/src/v2r/scenes/V2S4* 2>/dev/null
if git diff --cached --quiet; then echo "nothing to checkpoint"; else
  for i in 1 2 3 4 5; do git commit -q -m "v2r L3: WIP checkpoint (builders in progress; renders; $note)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_014PwCXJs9nWENkpKqVhHWMP" && break; sleep 3; done
fi
for i in 1 2 3 4; do git pull --no-rebase -q origin video-production 2>&1 | tail -1; if git push -q origin HEAD:video-production 2>&1 | grep -q "rejected\|hint"; then sleep 4; else break; fi; done
git log --oneline -1 | cat
git status --short | cat
