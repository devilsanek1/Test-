// S05 foreground audience (fix round 2, ref 2 f_1 / f_33): two rows of big back-view heads + shoulders filling the
// bottom band (screen y ~1580-1920, under the platform UI, which is allowed for foreground), the outer ones cropped by
// the frame's left / right edges, a narrow aisle left open in the centre (the plaza, the shade wedge and the pigeons
// show through it). They are the props EdgeOnlooker (tier A heads, coat running off the bottom), drawn in the
// `foreground` layer (parallax 1.12). They react with 1-frame pose swaps: two heads tilt UP on 'figured', one turns to
// its neighbour on 'was.' (19.45). Plus the plaza's pigeons (steps layer). World px, scene seconds.
import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {osc, prog, useTime} from '../../lib/time';
import {rand} from '../../lib/rng';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, circle, roundRect} from '../../lib/sketch';
import {mat, Mat, XG} from '../../lib/xf';
import {Bird} from '../../lib/kit';
import type {Acc, Hair} from '../../lib/kit';
import {DEPTH_INK, EdgeOnlooker} from '../shared/props';
import type {Beats} from './beats';

type Head = {x: number; y: number; head: number; hair: Hair; hairColor?: string; body: string; acc?: Acc[]; rim: 'left' | 'right'; react?: 'look' | 'turn'; seed: string; bun?: boolean; tail?: string; masses?: boolean; hat?: boolean};

/** Back row first (drawn first), then the front row. Screen at rest: x' = (x - 540) 1.13 + 540, y' = (y - 940) 1.13 +
 *  960. The fifth of each row is off frame right at rest and slides in with the exit truck.
 *  Fix round 3 (ref 2 f_33: mid-value backs, one parting / tie, collars): no ink-black head in the frame at rest (the
 *  one ink head, b5, slides in on the truck); every torso has a collar band, a hood edge or a scarf; the buns are LOCAL
 *  (`bun`: the kit's 'short' head, whose three strands follow the skull, plus a registered bun and a peach hair tie): the
 *  kit's bun drew its parting across the strands (an X) and its ring 10-15 px off its fill. */
export const HEADS: Head[] = [
  // A1 polish (review: the 10 heads were the largest, highest-contrast mass and sat at the teams' feet, so the audience
  // read as seated children): both rows DROP 45 world (~51 px) and calm down: ONE dark head (f4, the long brown hair at
  // the right edge), every other hair one step lighter (tan), the beanie sage (seed b3d: the kit's hat pick), f1's coat
  // sage (and b4's: a tan head on a tan coat makes the kit swap the hair to ink). The teams and tablets are the contrast
  // peak above y 1480.
  // back row: heads 128-134 (~147 px), centres ~1601 (screen ~1707, tops ~1633)
  // Final polish (review: still the largest, darkest mass in the frame: ochre / brown hair, a tealDark cap, bowl heads
  // drawn with evenly spaced vertical strokes; ref 2 f_33's near audience is lighter and more detailed): b2 and f1 SAND
  // hair, f4 tan (f2's ochre ponytail is the one dark head at rest), f3's dark cap is a CREAM SUN HAT with a teal band
  // (ref 2 f_33), straps on b4 and f1, and the 'short' heads draw a parting and a few uneven hair masses (`masses`)
  // over the kit's three even strands.
  {x: 150, y: 1605, head: 130, hair: 'short', bun: true, hairColor: palette.tan, body: palette.sand, acc: ['scarf'], rim: 'right', seed: 's5au/b1'},
  {x: 392, y: 1597, head: 128, hair: 'curly', hairColor: palette.sand, body: palette.sage, acc: ['collar'], rim: 'right', react: 'look', seed: 's5au/b2'},
  {x: 690, y: 1603, head: 132, hair: 'beanie', hairColor: palette.tan, body: palette.sand, acc: ['collar'], rim: 'left', seed: 's5au/b3d'},
  {x: 935, y: 1593, head: 134, hair: 'short', hairColor: palette.tan, body: palette.sage, acc: ['collar', 'strap'], rim: 'left', masses: true, seed: 's5au/b4'},
  {x: 1170, y: 1601, head: 130, hair: 'curly', hairColor: palette.brown, body: palette.sage, acc: ['collar'], rim: 'left', seed: 's5au/b5'},
  // front row: heads 182-196 (~210 px), centres ~1705 (screen ~1825), the outer two cropped by the frame edges
  {x: 60, y: 1697, head: 192, hair: 'short', hairColor: palette.sand, body: palette.sage, acc: ['hood', 'strap'], rim: 'right', masses: true, seed: 's5au/f1'},
  // A1 fix round (review: two identical tan buns stacked diagonally with b1, one flat value mass, copy-paste): f2 is an
  // OCHRE head with a low PONYTAIL down the back of the coat and a cream tie (a different silhouette and value step)
  {x: 280, y: 1717, head: 182, hair: 'short', tail: palette.cream, hairColor: palette.brown, body: palette.sage, acc: ['collar'], rim: 'right', react: 'turn', masses: true, seed: 's5au/f2'},
  {x: 808, y: 1709, head: 186, hair: 'short', hairColor: palette.brown, body: palette.tan, acc: ['collar'], rim: 'left', react: 'look', hat: true, seed: 's5au/f3'},
  {x: 1012, y: 1691, head: 196, hair: 'long', hairColor: palette.tan, body: palette.teal, acc: ['collar'], rim: 'left', seed: 's5au/f4'},
  {x: 1290, y: 1705, head: 188, hair: 'short', hairColor: palette.tan, body: palette.sand, acc: ['hood'], rim: 'left', masses: true, seed: 's5au/f5'},
];

/** EdgeOnlooker's idle bob (props Figures.tsx: osc(t, 0.5, rand(seed, 'b') x 6) x bob): the bun rides it. */
const BOB = 1.2;
const bobAt = (t: number, seed: string) => osc(t, 0.5, rand(seed, 'b') * 6) * BOB;

/** A bun on top of the head (kit proportions: centre 1.12 r above the head centre, r 0.38), REGISTERED (fill and ring
 *  on one path), and a peach hair tie at its base. Ink at the onlooker's depth weight (front 4.8 screen px). */
const Bun: React.FC<{h: Head}> = ({h}) => {
  const t = useTime();
  const hr = h.head / 2;
  const cx = h.x;
  const cy = h.y + bobAt(t, h.seed) - hr * 1.1;
  const br = hr * 0.37;
  const W = DEPTH_INK.front; // the onlooker head outline weight (world px, as EdgeOnlooker passes it)
  const d = blob(cx, cy, br, br * 0.94, {seed: `${h.seed}/bun`});
  const ring = circle(cx, cy, br, {seed: `${h.seed}/bunI`, overlap: 6});
  const tie = roundRect(cx - br * 0.62, cy + br * 0.62, br * 1.24, br * 0.42, br * 0.16);
  return (
    <>
      <Fill d={d} color={h.hairColor ?? palette.brown} offset={false} mode="none" seed={`${h.seed}/bunF`} />
      <Ink d={ring} width={W} seed={`${h.seed}/bunR`} />
      <Fill d={tie} color={palette.peach} offset={false} mode="none" seed={`${h.seed}/tieF`} />
      <Ink d={tie} width={W * 0.7} taper={false} vary={0} seed={`${h.seed}/tieI`} />
    </>
  );
};

/** A low ponytail (A1 fix round): from the back of the skull's lower half down over the collar onto the coat, tapering,
 *  swung a touch toward the rim side, with a tie of colour `h.tail` at its root (fill + ink at the onlooker's weight). */
const Ponytail: React.FC<{h: Head}> = ({h}) => {
  const t = useTime();
  const hr = h.head / 2;
  const cx = h.x;
  const cy = h.y + bobAt(t, h.seed);
  const sd = h.rim === 'right' ? 1 : -1;
  const y0 = cy + hr * 0.28;
  const y1 = cy + hr * 1.95;
  const w = hr * 0.3;
  const tip = cx + sd * hr * 0.16;
  const tail = `M${cx - w} ${y0}C${cx - w * 1.25} ${y0 + hr * 0.7} ${tip - w * 0.7} ${y1 - hr * 0.45} ${tip} ${y1}C${tip + w * 0.8} ${y1 - hr * 0.5} ${cx + w * 1.3} ${y0 + hr * 0.7} ${cx + w} ${y0}Z`;
  const strand = `M${cx + w * 0.05} ${y0 + hr * 0.35}C${cx + w * 0.1} ${y0 + hr * 0.9} ${tip - w * 0.15} ${y1 - hr * 0.55} ${tip - w * 0.05} ${y1 - hr * 0.22}`;
  const tie = roundRect(cx - w * 1.15, y0 + hr * 0.02, w * 2.3, hr * 0.2, hr * 0.07);
  const W = DEPTH_INK.front;
  return (
    <>
      <Fill d={tail} color={h.hairColor ?? palette.brown} offset={false} mode="none" seed={`${h.seed}/ptF`} />
      <Ink d={tail} width={W} seed={`${h.seed}/ptI`} />
      <Ink d={strand} width={W * 0.55} taper={false} seed={`${h.seed}/ptS`} />
      <Fill d={tie} color={h.tail ?? palette.cream} offset={false} mode="none" seed={`${h.seed}/ptT`} />
      <Ink d={tie} width={W * 0.7} taper={false} vary={0} seed={`${h.seed}/ptTI`} />
    </>
  );
};

/** Final polish: a parting and a few uneven hair MASSES over a 'short' head (the kit draws three evenly spaced strands on a
 *  big light head: from behind they read as a ribbed bowl). A hair-coloured cover over the strands (the upper skull, above
 *  the kit's nape notch), then a short parting from the top of the head and four curved masses of different lengths
 *  falling to either side (or, under a ponytail, pulled back toward its tie). Ink at the onlooker's weight. */
const HairMasses: React.FC<{h: Head}> = ({h}) => {
  const t = useTime();
  const hr = h.head / 2;
  const cx = h.x;
  const cy = h.y + bobAt(t, h.seed);
  const R = hr * 0.93;
  const lim = Math.asin(Math.min(1, (hr * 0.5) / R));
  const cover = Array.from({length: 25}, (_, i) => {
    const th = -lim + ((Math.PI + 2 * lim) * i) / 24;
    return `${i ? 'L' : 'M'}${(cx + R * Math.cos(th)).toFixed(1)} ${(cy - R * Math.sin(th)).toFixed(1)}`;
  }).join('') + 'Z';
  const P = (x: number, y: number) => `${(cx + x * hr).toFixed(1)} ${(cy + y * hr).toFixed(1)}`;
  const sd = h.rim === 'right' ? 1 : -1;
  const lines = h.tail
    ? `M${P(-0.12, -0.95)}Q${P(-0.08, -0.4)} ${P(0, 0.2)}` + `M${P(-0.6, -0.55)}Q${P(-0.4, -0.05)} ${P(-0.12, 0.22)}` + `M${P(0.55, -0.62)}Q${P(0.36, -0.08)} ${P(0.12, 0.22)}` + `M${P(-0.78, -0.05)}Q${P(-0.55, 0.22)} ${P(-0.3, 0.3)}`
    : `M${P(sd * 0.12, -0.96)}Q${P(sd * 0.07, -0.72)} ${P(sd * 0.02, -0.5)}` +
      `M${P(sd * -0.02, -0.66)}Q${P(sd * -0.42, -0.6)} ${P(sd * -0.64, 0.02)}` +
      `M${P(sd * -0.3, -0.28)}Q${P(sd * -0.44, 0.04)} ${P(sd * -0.36, 0.36)}` +
      `M${P(sd * 0.1, -0.62)}Q${P(sd * 0.5, -0.52)} ${P(sd * 0.68, -0.04)}` +
      `M${P(sd * 0.36, -0.18)}Q${P(sd * 0.5, 0.12)} ${P(sd * 0.42, 0.42)}`;
  const W = DEPTH_INK.front;
  return (
    <>
      <Fill d={cover} color={h.hairColor ?? palette.tan} offset={false} mode="none" seed={`${h.seed}/hmC`} />
      <Ink d={lines} width={W * 0.55} seed={`${h.seed}/hmI`} />
    </>
  );
};

/** Final polish (ref 2 f_33): a cream SUN HAT with a teal band on a back-view head: a wide brim ellipse round the skull,
 *  the crown dome on it, the band at the crown's foot (fill + ink at the onlooker's weight). It rides the head's pose. */
const SunHat: React.FC<{h: Head}> = ({h}) => {
  const t = useTime();
  const hr = h.head / 2;
  const cx = h.x;
  const cy = h.y + bobAt(t, h.seed);
  const P = (x: number, y: number) => `${(cx + x * hr).toFixed(1)} ${(cy + y * hr).toFixed(1)}`;
  const by = cy - hr * 0.3;
  const brim = `M${(cx - hr * 1.5).toFixed(1)} ${by.toFixed(1)}a${(hr * 1.5).toFixed(1)} ${(hr * 0.42).toFixed(1)} 0 1 0 ${(hr * 3).toFixed(1)} 0a${(hr * 1.5).toFixed(1)} ${(hr * 0.42).toFixed(1)} 0 1 0 ${(-hr * 3).toFixed(1)} 0Z`;
  const crown = `M${P(-0.84, -0.32)}C${P(-0.88, -1.02)} ${P(-0.42, -1.32)} ${P(0, -1.32)}C${P(0.42, -1.32)} ${P(0.88, -1.02)} ${P(0.84, -0.32)}Q${P(0, -0.16)} ${P(-0.84, -0.32)}Z`;
  const band = `M${P(-0.84, -0.32)}L${P(-0.86, -0.58)}Q${P(0, -0.44)} ${P(0.86, -0.58)}L${P(0.84, -0.32)}Q${P(0, -0.16)} ${P(-0.84, -0.32)}Z`;
  const W = DEPTH_INK.front;
  return (
    <>
      <Fill d={brim} color={palette.cream} offset={false} mode="none" seed={`${h.seed}/brimF`} />
      <Ink d={brim} width={W} seed={`${h.seed}/brimI`} />
      <Fill d={crown} color={palette.cream} offset={false} mode="none" seed={`${h.seed}/crF`} />
      <Fill d={band} color={palette.teal} offset={false} mode="none" seed={`${h.seed}/bdF`} />
      <Ink d={crown + `M${P(-0.86, -0.58)}Q${P(0, -0.44)} ${P(0.86, -0.58)}`} width={W} seed={`${h.seed}/crI`} />
    </>
  );
};

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
        const node = (
          <>
            <EdgeOnlooker x={h.x} y={h.y} head={h.head} hair={h.hair} hairColor={h.hairColor} body={h.body} acc={h.acc} rim={h.rim} arms="near" bob={BOB} seed={h.seed} />
            {h.masses ? <HairMasses h={h} /> : null}
            {h.bun ? <Bun h={h} /> : null}
            {h.hat ? <SunHat h={h} /> : null}
          </>
        );
        const m = poseM(h, t, b);
        // the ponytail hangs from the head across the neck line: drawn whole, through the head's pose (it swings with it)
        const tail = h.tail ? m ? <XG m={m}><Ponytail h={h} /></XG> : <Ponytail h={h} /> : null;
        return m ? (
          <React.Fragment key={h.seed}>
            <NeckSplit x={h.x} y={h.y + neckK(h) * h.head} m={m}>
              {node}
            </NeckSplit>
            {tail}
          </React.Fragment>
        ) : (
          <React.Fragment key={h.seed}>
            {node}
            {tail}
          </React.Fragment>
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
