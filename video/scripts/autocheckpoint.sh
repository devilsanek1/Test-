#!/usr/bin/env bash
# Periodic checkpoint (owner, 2026-10-27: "make sure to commit the progress periodically if we get stopped on the usage
# limits"): commits and pushes ONLY the given paths every CHECKPOINT_INTERVAL seconds (default 600) whenever they changed,
# so an agent stopped mid-task by a usage limit loses at most one interval of work.
#
# Usage, from the repo root, as a background command (the session's own film paths, never the whole repo):
#   CHECKPOINT_TRAILERS="$(printf 'Co-Authored-By: ...\nClaude-Session: ...')" \
#     video/scripts/autocheckpoint.sh <branch> <path>...          # loops; --once <branch> <path>... checkpoints once
# Never `git add -A`: other sessions edit the repo too. A round is skipped while another git command holds the index lock.
set -u
once=0
[ "${1:-}" = "--once" ] && { once=1; shift; }
[ $# -ge 2 ] || { echo "usage: $0 [--once] <branch> <path>..." >&2; exit 2; }
branch=$1; shift
interval=${CHECKPOINT_INTERVAL:-600}
trailers=${CHECKPOINT_TRAILERS:-}

checkpoint() {
  [ -e .git/index.lock ] && { echo "$(date -u +%H:%M) index locked, skipped"; return; }
  { [ -e .git/MERGE_HEAD ] || [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; } &&
    { echo "$(date -u +%H:%M) a merge or rebase is in progress, skipped"; return; }
  git add -- "$@" 2>/dev/null
  if git diff --cached --quiet -- "$@"; then
    return
  fi
  n=$(git diff --cached --name-only -- "$@" | wc -l)
  msg="WIP checkpoint (auto, $(date -u +%H:%M) UTC): $n file(s) in $*"
  if [ -n "$trailers" ]; then
    git commit -q -m "$msg" -m "$trailers" -- "$@" || return
  else
    git commit -q -m "$msg" -- "$@" || return
  fi
  for i in 1 2 3 4; do
    git push -q origin "HEAD:$branch" 2>/dev/null && { echo "$(date -u +%H:%M) pushed: $msg"; return; }
    sleep $((2 ** i))
  done
  echo "$(date -u +%H:%M) committed, push failed (next round retries): $msg"
}

if [ $once = 1 ]; then
  checkpoint "$@"
  exit 0
fi
while true; do
  sleep "$interval"
  checkpoint "$@"
  git push -q origin "HEAD:$branch" 2>/dev/null   # retries an earlier failed push
done
