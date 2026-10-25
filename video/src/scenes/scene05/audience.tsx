// S05 foreground audience (fix round 2, ref 2 f_1 / f_33): two rows of big back-view heads + shoulders filling the
// bottom band (screen y ~1580-1920, under the platform UI, which is allowed for foreground), the outer ones cropped by
// the frame's left / right edges, a narrow aisle left open in the centre (the plaza, the shade wedge and the pigeons
// show through it). They are the props EdgeOnlooker (tier A heads, coat running off the bottom), drawn in the
// `foreground` layer (parallax 1.12). They react with 1-frame pose swaps: two heads tilt UP on 'figured', one turns to
// its neighbour on 'bad'. Plus the plaza's pigeons (steps layer). World px, scene seconds.
import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {prog, useTime} from '../../lib/time';
import {mat, Mat, XG} from '../../lib/xf';
import {Bird} from '../../lib/kit';
import type {Acc, Hair} from '../../lib/kit';
import {EdgeOnlooker} from '../shared/props';
import type {Beats} from './beats';

type Head = {x: number; y: number; head: number; hair: Hair; hairColor?: string; body: string; acc?: Acc[]; rim: 'left' | 'right'; react?: 'look' | 'turn'; seed: string};

/** Back row first (drawn first), then the front row. Screen at rest: x' = (x - 540) 1.13 + 540, y' = (y - 940) 1.13 +
 *  960. The fifth of each row is off frame right at rest and slides in with the exit truck. */
export const HEADS: Head[] = [
  // back row: heads 128-134 (~147 px), centres ~1556 (screen ~1656, tops ~1582)
  {x: 150, y: 1560, head: 130, hair: 'bun', hairColor: palette.brown, body: palette.sand, acc: ['scarf'], rim: 'right', seed: 's5au/b1'},
  {x: 392, y: 1552, head: 128, hair: 'curly', hairColor: palette.tan, body: palette.sage, acc: ['collar'], rim: 'right', react: 'look', seed: 's5au/b2'},
  {x: 690, y: 1558, head: 132, hair: 'beanie', body: palette.sand, rim: 'left', seed: 's5au/b3'},
  {x: 935, y: 1548, head: 134, hair: 'short', hairColor: palette.ink, body: palette.tan, acc: ['collar'], rim: 'left', seed: 's5au/b4'},
  {x: 1170, y: 1556, head: 130, hair: 'bun', hairColor: palette.tan, body: palette.sage, rim: 'left', seed: 's5au/b5'},
  // front row: heads 182-196 (~210 px), centres ~1660 (screen ~1774), the outer two cropped by the frame edges
  {x: 60, y: 1652, head: 192, hair: 'short', hairColor: palette.brown, body: palette.teal, acc: ['hood'], rim: 'right', seed: 's5au/f1'},
  {x: 280, y: 1672, head: 182, hair: 'bun', hairColor: palette.tan, body: palette.sage, acc: ['collar'], rim: 'right', react: 'turn', seed: 's5au/f2'},
  {x: 808, y: 1664, head: 186, hair: 'cap', body: palette.tan, rim: 'left', react: 'look', seed: 's5au/f3'},
  {x: 1012, y: 1646, head: 196, hair: 'long', hairColor: palette.brown, body: palette.teal, rim: 'left', seed: 's5au/f4'},
  {x: 1290, y: 1660, head: 188, hair: 'short', hairColor: palette.ink, body: palette.sand, acc: ['hood'], rim: 'left', seed: 's5au/f5'},
];

/** The neck line (head centre + this x head diameter): the split between the head (posed) and the coat (still). */
const neckK = (h: Head) => (h.hair === 'cap' ? 0.6 : 0.42);

/** The head's pose matrix (about the neck point) once its reaction fired: 'look' = the head tips back to look up at the
 *  banner (the back of the head drops and foreshortens), 'turn' = it turns toward its neighbour on the right. */
function poseM(h: Head, t: number, b: Beats): Mat | null {
  const nx = h.x;
  const ny = h.y + neckK(h) * h.head;
  if (h.react === 'look' && t >= b.look) return mat.about(mat.compose(mat.translate(0, h.head * 0.045), mat.scale(1.03, 0.86)), nx, ny);
  if (h.react === 'turn' && t >= b.headTurn) return mat.compose(mat.translate(h.head * 0.05, 0), mat.about(mat.rotate(13), nx, ny));
  return null;
}

/** Draws `children` twice: the coat below the neck line as is, the head above it through `m`. */
const NeckSplit: React.FC<{x: number; y: number; m: Mat; children: React.ReactNode}> = ({x, y, m, children}) => {
  const id = 'nk' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <defs>
        <clipPath id={`${id}a`} clipPathUnits="userSpaceOnUse">
          <rect x={x - 900} y={y - 1200} width={1800} height={1200} />
        </clipPath>
        <clipPath id={`${id}b`} clipPathUnits="userSpaceOnUse">
          <rect x={x - 900} y={y} width={1800} height={2400} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}b)`}>{children}</g>
      <g clipPath={`url(#${id}a)`}>
        <XG m={m}>{children}</XG>
      </g>
    </>
  );
};

/** The audience (the BlueprintWall `foreground` slot). */
export const Audience: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  return (
    <>
      {HEADS.map((h) => {
        const node = <EdgeOnlooker x={h.x} y={h.y} head={h.head} hair={h.hair} hairColor={h.hairColor} body={h.body} acc={h.acc} rim={h.rim} arms="near" bob={1.2} seed={h.seed} />;
        const m = poseM(h, t, b);
        return m ? (
          <NeckSplit key={h.seed} x={h.x} y={h.y + neckK(h) * h.head} m={m}>
            {node}
          </NeckSplit>
        ) : (
          <React.Fragment key={h.seed}>{node}</React.Fragment>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the plaza's pigeons (steps layer)

/** Two pigeons in the audience's aisle, on the shade wedge (screen ~(515-590, 1590)); the near one hops on 'using'. */
export const Pigeons: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const u = prog(t, b.pigeon, 0.22);
  const hop = u > 0 && u < 1 ? -18 * Math.sin(Math.PI * u) : 0;
  return (
    <>
      <Bird x={596} y={1508} s={1.45} color={palette.cream} flip seed="s5pg2" />
      <XG m={mat.translate(u > 0 ? 10 * Math.min(1, u * 1.2) : 0, hop)}>
        <Bird x={500} y={1500} s={1.55} color={palette.white} seed="s5pg1" />
      </XG>
    </>
  );
};
