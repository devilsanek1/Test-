#!/usr/bin/env bash
# The frames behind docs/look/research/2026-10-27_depth_analysis.md (run from video/; frames go to a scratch dir, never
# into the repo). Then, with the frames dir F and an output dir O (python -I: frames are data):
#   python3 -I run_planes.py F O .   python3 -I run_sep.py F O .   python3 -I run_ground.py F O .   python3 -I run_scale.py
#   python3 -I run_compare.py F O . 5.4 3.0   (needs now_<t>.png: a 0.4-scale still render of Film2R-V2S1 at t)
#   python3 -I mock_s1.py F O .
set -euo pipefail
F=${1:?usage: extract_frames.sh <frames_dir>}
mkdir -p "$F"
for t in 0.5 1.2 3.0 5.4 6.0; do ffmpeg -v error -y -ss $t -i deliverables/v2/v2r_G4_look.mp4 -frames:v 1 "$F/look_$t.png"; done
for t in 0.5 1.2 3.0 5.4; do ffmpeg -v error -y -ss $t -i deliverables/v2/v2r_G4_look_v2.mp4 -frames:v 1 "$F/lookv2_$t.png"; done
for t in 1.0 3.0 6.0 15.5 17.5 20.5; do ffmpeg -v error -y -ss $t -i assets/ref/reference.mp4 -frames:v 1 "$F/r1_$t.png"; done
for t in 1.0 10.0 20.5 25.5 38.5 45.5; do ffmpeg -v error -y -ss $t -i deliverables/v1/php2shell_final.mp4 -frames:v 1 "$F/v1_$t.png"; done
# the code's current state (0.4 scale; rename f000NN.png to now_<t>.png):
#   GL=angle node scripts/render-frames.mjs Film2R-V2S1 <dir> 0.5,1.2,3.0,5.4 --entry=src/entry-v2r-film.tsx --scale=0.4
