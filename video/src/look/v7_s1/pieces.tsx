// v7_s1: STEP 3's slots (ORGANIC.md §6 step 3, the second half: organic shapes and brushwork through MyPaint, and step
// 5's paper folded into them). Each slot sits in its plane's group, INSIDE the segment it repaints and BEFORE that plane's
// light slot, so the baked maps light it and it rides its plane's float; with no piece registered it draws nothing (v7a).
//   clouds    the sky plane, over v7's painted cloud planes (v6's cloud, which the owner liked: warped and marked as in
//             organic proof 1, then fewer, bolder marks on its lit side and a ragged found top; the mid bank a bank)
//   farcity   the far planes (+3, +4), over the west gap: lost tops, dry-brush teeth, coarse marks, windows tone-on-tone
//   facade    the subject plane, over the wing and the lobby, under the sliding leaves: holes for the door, the fascia
//             and W (they stay the scene's crisp layers)
//   water     the water plane, over the painted canal (its left third calmer)
//   paving    our bank, over the stone bands (organic proof 1's paving, its marks bold enough for 400 px; the shadows stay
//             the light's maps, never baked twice)
//   prop      the near plane, the kept table and chair at the near dose (hand-cut, a light ramp, edge strokes)
//   leaves    the near frame, a few soft leaves of the plane tree off-frame left at the left edge (the near frame's
//             dose: few marks, out of focus, inside the near shade mass)
// How to fill one: the painter (`src/look/v7_s1/bake/paint_v7.py`, MyPaint through the vendored peinten) bakes each piece
// to `./paint/<name>.v7piece.png` and writes `./paint_v7.ts` (the generated registry: each piece's import and its box in
// its layer's own px: x, y, w, h); then the light bake reruns from the parts renders (`bash src/look/v7_s1/bake/run.sh
// <scratch> --from=parts`): the maps are solved against what the slots now draw. The slots draw in look 'v7' only, so
// look 'v7a' stays the first half's still.
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {PIECES_V7} from './paint_v7';
import {useV7} from './context';

export type PieceName = 'clouds' | 'farcity' | 'facade' | 'water' | 'paving' | 'prop' | 'leaves';
export type V7Piece = {src: string; box: readonly [number, number, number, number]};

/** The registered pieces (look 'v7'; none in 'v7a', steps 4, 1, 2 only). */
export const PIECES: Partial<Record<PieceName, V7Piece>> = PIECES_V7;
/** Is this piece drawn here (look 'v7' and registered)? A piece that replaces what it covers hides it by this. */
export const usePiece = (name: PieceName): V7Piece | null => {
  const {look} = useV7();
  return look === 'v7' ? (PIECES[name] ?? null) : null;
};

/** One piece's image in its layer's own px, holding the frame until it has loaded (an SVG <image> loads asynchronously). */
const PieceImage: React.FC<{p: V7Piece; name: string}> = ({p, name}) => {
  const [handle] = useState(() => delayRender(`v7 piece ${name}`));
  useEffect(() => () => continueRender(handle), [handle]);
  const [x, y, w, h] = p.box;
  return <image href={p.src} x={x} y={y} width={w} height={h} preserveAspectRatio="none" onLoad={() => continueRender(handle)} onError={() => continueRender(handle)} />;
};

/** A step-3 slot: its piece in look 'v7' when one is registered, else nothing. */
export const PieceSlot: React.FC<{name: PieceName}> = ({name}) => {
  const p = usePiece(name);
  return p ? <PieceImage p={p} name={name} /> : null;
};
