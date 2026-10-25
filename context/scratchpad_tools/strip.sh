#!/usr/bin/env bash
# strip.sh name f0 f1 crop(WxH+X+Y at half scale) [cols]
F=/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/scenes/S11/rev/qa/frames
O=/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/scenes/S11/rev/strips
name=$1; a=$2; b=$3; crop=$4; cols=${5:-8}
args=()
for i in $(seq $a $b); do
  f=$(printf "%s/f%05d.png" $F $i)
  t=$(python3 -c "print(f'{45.618+$i/30:.3f}')")
  args+=( -label "f$i $t" "$f[$crop]" )
done
montage "${args[@]}" -tile ${cols}x -geometry +2+2 -pointsize 11 $O/$name.png
echo $O/$name.png
