// V2S5_wiper.tsx (lane L4): the S5 -> S6 foreground wipe (conform_L4 §1; THROUGHLINE §3 join S5->S6: carrier D,
// `foreground-wipe` {element 'scene', dir 'left', dur 0.36}, 23.62-23.98, midpoint 23.80, 0.23 s before "any" 24.03).
// ONE blossom tree passing close to the lens, RIGHT TO LEFT: trunk + crown ~300 px wide, flat fills, no outline (tier C).
// Right to left because S5's end sun sits at the right edge (1058, 646) and S6's SUN2 at the left (260, 620): S5's sun
// is covered (and gone) first, S6's appears last, so two suns never share a frame. Nothing of it is drawn above
// y 566 (and it is clipped at y >= 560 as S7's boat is): the crown covers both discs (tops 586 and 575) while the edge
// passes them, the caption band stays one flat field (captionRegions: none), and above the tree the two skies are the
// same (S5's top gutter carries S6's clouds, V2S5_far). Drawn in SCREEN px centred on the wipe edge x.
import React, {useMemo} from 'react';
import type {WiperComponent, WiperProps} from '../../lib/Film';
import {CM} from '../palette';
import {mix, crownD} from '../kit/dc/core';
import {rc} from './V2S5_depth';

/** Nothing of the wiper above this screen y. */
const CLIP_Y = 560;
/** The crown's real half-width about x (lobes + misjudged margins); Film runs the edge from -half - 30 to W + half + 30. */
const HALF = 160;

/** A near cherry against the light (the end sun beyond, to the right), the NEAREST plane (-2: lib/depth nearStep, one
 *  value step darker than the terrace frames, hue and chroma kept; CRAFT §f.2): the slot crowns' calm blossom (V2S5_valley
 *  BLOOM_S5) two steps nearer: a mid mauve mass (L* 40-51), blossom L* 60-73, a warm-dark trunk (L* ~28), flat, no line. */
const T = {
  trunk: rc(mix(CM.anchor, CM.shadeWarm, 0.62), -2),
  trunkLit: rc(mix(CM.brickDeep, CM.shadeWarm, 0.5), -2),
  crownDark: rc(mix(CM.shadeWarm, CM.blossom, 0.12), -2),
  crown: rc(mix(CM.shadeWarm, CM.blossom, 0.42), -2),
  bloomShade: rc(mix(CM.shadeWarm, CM.blossom, 0.64), -2),
  bloom: rc(mix(CM.blossom, CM.shadeWarm, 0.26), -2),
  bloomLit: rc(CM.blossom, -2),
};

/** The tree in local px (x centred on the wipe edge, y screen). Static geometry. */
function treePaths(): {color: string; d: string}[] {
  // trunk: a slightly leaning, tapering stem from below the frame into the crown, one fork
  const trunk = 'M-44 1990L-34 1500L-26 1240L-60 1060L-36 1048L-4 1180L26 1010L50 1022L20 1250L30 1520L44 1990Z';
  const trunkLit = 'M14 1990L18 1520L10 1260L30 1040L40 1046L20 1250L30 1520L44 1990Z';
  // crown masses: dark core, then warm blossom clusters toward the light (right / top), lit flowers on the sun side
  const L: [number, number, number, number, string, string][] = [
    // [cx, cy, rx, ry, colour, seed]
    [-18, 900, 150, 230, T.crownDark, 'w/core'],
    [-70, 760, 92, 110, T.crown, 'w/c1'],
    [60, 720, 98, 120, T.crown, 'w/c2'],
    [-96, 980, 66, 92, T.crown, 'w/c3'],
    [-40, 680, 70, 84, T.bloomShade, 'w/b1'],
    [70, 860, 74, 96, T.bloomShade, 'w/b2'],
    [-104, 860, 52, 62, T.bloom, 'w/b3'],
    [16, 646, 70, 72, T.bloom, 'w/b4'],
    [96, 760, 52, 70, T.bloom, 'w/b5'],
    [-20, 1060, 82, 70, T.bloomShade, 'w/b6'],
    [52, 1000, 58, 56, T.bloom, 'w/b7'],
    [40, 640, 44, 40, T.bloomLit, 'w/l1'],
    [108, 700, 34, 44, T.bloomLit, 'w/l2'],
    [-60, 740, 36, 34, T.bloomLit, 'w/l3'],
    [80, 930, 34, 40, T.bloomLit, 'w/l4'],
  ];
  const out: {color: string; d: string}[] = [
    {color: T.trunk, d: trunk},
    {color: T.trunkLit, d: trunkLit},
  ];
  for (const [cx, cy, rx, ry, color, seed] of L) out.push({color, d: crownD(cx, cy, rx, ry, seed, 9, 0.3)});
  return out;
}

export const S5Wiper: WiperComponent = ({x}: WiperProps) => {
  const parts = useMemo(treePaths, []);
  return (
    <g>
      <defs>
        <clipPath id="s5wiper-clip">
          <rect x={-200} y={CLIP_Y} width={1480} height={1500} />
        </clipPath>
      </defs>
      <g clipPath="url(#s5wiper-clip)">
        <g transform={`translate(${x.toFixed(2)} 0)`}>
          {parts.map((p, i) => (
            <path key={i} d={p.d} fill={p.color} />
          ))}
        </g>
      </g>
    </g>
  );
};
S5Wiper.half = HALF;
S5Wiper.captionRegions = () => [];

/** The wiper's geometry (for the checks): the crown spans x - 150 .. x + 150, its top ~y 566; nothing above CLIP_Y. */
export const S5_WIPER = {half: HALF, clipY: CLIP_Y, crownTop: 566, crownBottom: 1130, trunkHalf: 44} as const;
