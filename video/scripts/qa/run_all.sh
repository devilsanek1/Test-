#!/usr/bin/env bash
# run_all.sh <CompId> [--out=DIR] [--scale=0.5] [--concurrency=2] [--keep-frames] [--allow=FILE] [--t0=S --t1=S]
# The whole QA pass for one composition (docs/QA.md):
#   1. renders EVERY frame of <CompId> at half scale into a temp dir (scripts/render-frames.mjs: one bundle, one browser),
#   2. deadframes.py  -> life per scene, dead runs, events (chart: deadframes.png),
#   3. framecheck.py  -> blank frames, flashes, caption legibility, platform UI zones (framecheck_frames.png),
#   4. beatsync.py    -> (Main only) cut offsets vs the music's beat grid + a tempo-map proposal and retimed MIDI,
#   5. report.py      -> REPORT.md with the QA gate. Exit code 0 = gate PASS.
# Output: out/qa/<CompId>-<timestamp>/ (or --out). --t0/--t1 render only part of the composition (seconds).
# Allow-list of deliberate holds: scripts/qa/holds.json (default) or --allow=FILE.
# Keep the shared machine responsive: half scale, concurrency 2 (override with care).
set -euo pipefail
cd "$(dirname "$0")/../.."
[ $# -ge 1 ] || { sed -n '2,12p' "$0"; exit 2; }
COMP="$1"; shift
OUT=""; SCALE="0.5"; CONC="2"; KEEP=0; ALLOW="scripts/qa/holds.json"; T0=""; T1=""; FPS="30"
for a in "$@"; do
  case "$a" in
    --out=*) OUT="${a#--out=}" ;;
    --scale=*) SCALE="${a#--scale=}" ;;
    --concurrency=*) CONC="${a#--concurrency=}" ;;
    --keep-frames) KEEP=1 ;;
    --allow=*) ALLOW="${a#--allow=}" ;;
    --t0=*) T0="${a#--t0=}" ;;
    --t1=*) T1="${a#--t1=}" ;;
    *) echo "unknown option $a"; exit 2 ;;
  esac
done
[ -n "$OUT" ] || OUT="out/qa/${COMP}-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
FR="$(mktemp -d "${TMPDIR:-/tmp}/qa-${COMP}.XXXXXX")"
cleanup() { if [ "$KEEP" = 1 ]; then rm -rf "$OUT/frames"; mv "$FR/frames" "$OUT/frames" 2>/dev/null || true; fi; rm -rf "$FR"; }
trap cleanup EXIT

# ---- composition length and its place on the film timeline (Main / S01.. from scenes.json, dev comps from the registry)
read -r DUR OFF SCN < <(python3 - "$COMP" <<'PY'
import json, re, sys
comp = sys.argv[1]
sc = sorted(json.load(open('src/data/scenes.json')), key=lambda s: s['start'])
if comp == 'Main':
    print(max(s['end'] for s in sc), 0, 'film')
    sys.exit()
for s in sc:
    if s['id'] == comp:
        print(s['end'] - s['start'], s['start'], 'scene')
        sys.exit()
reg = open('src/dev/registry.ts').read()
m = re.search(r"id:\s*'%s'[^}]*durationSeconds:\s*([\d.]+)" % re.escape(comp), reg)
if m:
    print(m.group(1), 0, 'dev')
else:
    print('nan', 0, 'unknown')
PY
)
if [ "$DUR" = "nan" ]; then echo "unknown composition length for $COMP (not Main, a scene id or a src/dev/registry.ts entry)"; exit 2; fi
A="${T0:-0}"; B="${T1:-$DUR}"
TIMES="$(python3 -c "
import math
fps=float('$FPS'); a=float('$A'); b=min(float('$B'), float('$DUR'))
f0=round(a*fps); f1=max(f0, math.ceil(b*fps-1e-6)-1)
print(','.join(f'{f/fps:.5f}' for f in range(f0, f1+1)))")"
NF=$(echo "$TIMES" | tr ',' '\n' | wc -l)
echo "[qa] $COMP: rendering $NF frames ($A-$B s) at scale $SCALE, concurrency $CONC -> $FR/frames"
T_START=$(date +%s)
node scripts/render-frames.mjs "$COMP" "$FR/frames" "$TIMES" --scale="$SCALE" --concurrency="$CONC" > "$FR/list.txt"
T_REND=$(date +%s)
echo "[qa] rendered in $((T_REND - T_START)) s"

# film time of the first rendered frame (scene compositions start at their scene's start)
FT0="$(python3 -c "print(float('$OFF') + round(float('$A')*float('$FPS'))/float('$FPS'))")"
DF_ARGS=(--fps "$FPS" --out "$OUT" --name "$COMP" --quiet)
FC_ARGS=(--fps "$FPS" --out "$OUT" --name "$COMP" --quiet)
case "$SCN" in
  film)  DF_ARGS+=(--scenes src/data/scenes.json --t0 "$FT0"); FC_ARGS+=(--scenes src/data/scenes.json --t0 "$FT0") ;;
  scene) DF_ARGS+=(--scenes src/data/scenes.json --only "$COMP" --t0 "$FT0"); FC_ARGS+=(--scenes src/data/scenes.json --t0 "$FT0") ;;
  *)     DF_ARGS+=(--scenes cuts); FC_ARGS+=(--scenes none) ;;
esac
[ -f "$ALLOW" ] && DF_ARGS+=(--allow "$ALLOW")
set +e
python3 scripts/qa/deadframes.py "$FR/frames" "${DF_ARGS[@]}"
python3 scripts/qa/framecheck.py "$FR/frames" "${FC_ARGS[@]}"
if [ "$COMP" = "Main" ]; then
  python3 scripts/qa/beatsync.py --cuts scenes --fit-tempo --tempo-out "$OUT/tempo_map_proposal.json" \
    --write-midi "$OUT/music_retimed.mid" --out "$OUT/beatsync" --quiet | tail -n 4
  python3 scripts/qa/beatsync.py --cuts "json:$OUT/deadframes.json" --out "$OUT/beatsync_detected" --quiet | grep BEFORE
fi
python3 scripts/qa/report.py "$OUT" "$COMP"
RC=$?
set -e
echo "[qa] total $(( $(date +%s) - T_START )) s. Report: $OUT/REPORT.md  charts: $OUT/deadframes.png $OUT/framecheck_frames.png"
exit $RC
