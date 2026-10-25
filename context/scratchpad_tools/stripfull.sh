#!/usr/bin/env bash
F=/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/scenes/S11/rev/qa/frames
O=/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/scenes/S11/rev/strips
name=$1; a=$2; b=$3; step=${4:-1}; cols=${5:-8}; crop=${6:-540x960+0+0}; rs=${7:-50%}
args=()
for i in $(seq $a $step $b); do
  f=$(printf "%s/f%05d.png" $F $i)
  t=$(python3 -c "print(f'{45.618+$i/30:.3f}')")
  args+=( -label "f$i $t" "$f[$crop]" )
done
montage "${args[@]}" -resize $rs -tile ${cols}x -geometry +2+2 -pointsize 11 $O/$name.png
echo $O/$name.png
