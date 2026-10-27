// P6 helper (lane L3-people): her WORRIED talking face for P6's medium close (the art director: the kit's talking mouth
// is the same round 'o' whatever the face, so at phone size she read surprised, "Oh!", not worried; the brows were
// hairlines and the far one hid under her fringe).
// P6Head is a local copy of kit Her.tsx Head (front views, long hair), drawn EXACTLY over the head the kit's
// <HerSeated part="body"/> draws (the same centre with the same breath and nod, radius, blob seeds and misregistration),
// so only the face changes:
//   - the talking mouth for 'worried' is a squashed, downturned oval (a cap shape: round top, flatter bottom, the corners
//     pulled down; ~1.3x as wide as tall when fully open), and the half-open step is used more than the full one;
//   - the closed mouth is a clear downturned arc at a heavier weight;
//   - the worried brows are drawn at (a little over) the full ink width with a steeper inner rise (0.16 r) and a slight arch, the far
//     brow kept below the hairline, and both drawn OVER the hair cap so neither can hide.
// Then the kit's two hair locks are drawn again on top (the kit draws them after its head).
// Fold back into kit Her.tsx Head (REQUESTS line in the lane report); delete this file then.
import React from 'react';
import {blob, line, smooth} from '../../../lib/sketch';
import {rand} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {b, CC, Fill, fillAt, hairSway, HER, HerHeadParts, Ink, inkForHead, type At, type HeadSpec, type Pt, type Talking} from '../kit';

const {HairLocks} = HerHeadParts;

const talkingAt = (t: number, talking?: Talking): boolean => {
  if (!talking) return false;
  if (talking === true) return true;
  return talking.some(([a, z]) => t >= a && t < z);
};
/** Worried talking: 0 closed, 1 half, 2 open (10 drawings / s), the half step most of the time (2 open, 6 half, 2 closed). */
const WORRY_STEPS = [1, 2, 1, 0, 1, 1, 2, 1, 0, 1];
/** The kit's blink clock (Her.tsx `blinking`). */
const blinking = (t: number, seed: string) => (t + rand(seed, 'blink') * 3.3) % 3.3 < 0.1;
/** The kit's talking nod (Her.tsx `talkNod`). */
const talkNod = (t: number, talking: Talking | undefined, r: number) => (talkingAt(t, talking) ? Math.sin(Math.floor(t * 8) * 1.7) * r * 0.035 : 0);

/** The head spec the kit's <HerSeated view="front34"> builds (Her.tsx HerSeated: H0 = Pb(0.04, 0.755), the breath bob,
 *  the talking nod, turn 0.32), so the overlay lands on the same pixels. */
export const seatedHeadSpec = (p: {x: number; y: number; h: number; facing: 'l' | 'r'; talking?: Talking; at?: At; seed: string; t: number}): HeadSpec => {
  const s = p.facing === 'r' ? 1 : -1;
  const r = 0.09 * p.h;
  const bob = Math.sin(p.t * 1.6) * 0.0018 * p.h;
  const H: Pt = [p.x + s * 0.04 * p.h, p.y - 0.755 * p.h + bob + talkNod(p.t, p.talking, r)];
  return {c: H, r, s, turn: 0.32, face: 'worried', talking: p.talking, ink: inkForHead(r), at: p.at, seed: p.seed, sway: hairSway(p.t, p.seed)};
};

/** A downturned open mouth: a dome (the corners low, the top arched, the bottom nearly straight between the corners),
 *  so it reads as a worried "frown, talking", never a round "o". W = half width, H = height. */
const capMouth = (mx: number, my: number, W: number, H: number): string =>
  smooth(
    [
      [mx - W, my + 0.34 * H],
      [mx - 0.66 * W, my - 0.36 * H],
      [mx, my - 0.62 * H],
      [mx + 0.66 * W, my - 0.36 * H],
      [mx + W, my + 0.34 * H],
      [mx + 0.45 * W, my + 0.4 * H],
      [mx - 0.45 * W, my + 0.4 * H],
    ],
    {closed: true, tension: 0.34},
  );

export const P6Head: React.FC<{h: HeadSpec}> = ({h}) => {
  const t = useTime();
  const {c, r, s, turn, ink, at, seed} = h;
  // ---- the kit's head, unchanged (Her.tsx Head)
  const headD = blob(c[0], c[1], r * 0.92, r, {seed: `${seed}/head`, wobble: 0.012});
  const inner = Math.max(1.8, ink * 0.62);
  const fx = c[0] + s * turn * 0.6 * r;
  const ey = c[1] + 0.04 * r;
  const e = 0.3 * r * (1 - 0.42 * turn);
  const eyes: Pt[] = [[fx - s * e, ey], [fx + s * e * (1 - 0.25 * turn), ey - 0.02 * r]];
  const blink = blinking(t, seed);
  const nose = smooth([[fx + s * 0.07 * r, ey + 0.02 * r], [fx + s * (0.2 + 0.1 * turn) * r, ey + 0.26 * r], [fx + s * 0.04 * r, ey + 0.31 * r]]);
  const CAP_FRONT: Pt[] = [[-0.9, 0.12], [-1.05, -0.3], [-0.86, -0.86], [-0.3, -1.1], [0.35, -1.08], [0.88, -0.8], [1.05, -0.3], [0.9, 0.12], [0.7, -0.28], [0.36, -0.52], [-0.18, -0.5], [-0.68, -0.25]];
  const CAP_SIDE: Pt[] = [[-0.3, 0.72], [-1.06, 0.05], [-0.86, -0.82], [-0.2, -1.1], [0.46, -1.02], [0.86, -0.62], [0.86, -0.45], [0.62, -0.46], [0.4, -0.4], [0.2, -0.2], [0.05, 0.15], [-0.06, 0.56]];
  const capPts: Pt[] = CAP_FRONT.map((p, i) => [c[0] + s * (p[0] + (CAP_SIDE[i][0] - p[0]) * turn) * r, c[1] + (p[1] + (CAP_SIDE[i][1] - p[1]) * turn) * r]);
  const cap = smooth(capPts, {closed: true, tension: 0.4});
  // ---- the worried brows: full ink width, the inner end 0.16 r above the outer, a slight arch; the far brow (eye 0)
  // sits lower and shorter so it stays under the hairline
  const brow = (i: number) => {
    const [x, y] = eyes[i];
    const side = i === 0 ? -1 : 1;
    const far = i === 0;
    const half = (far ? 0.12 : 0.15) * r;
    const inX = x + s * -side * half;
    const outX = x + s * side * half;
    const by = y - (far ? 0.2 : 0.25) * r;
    return smooth([[outX, by + 0.05 * r], [(outX + inX) / 2, by - 0.025 * r], [inX, by - 0.11 * r]]);
  };
  // ---- the mouth
  const mx = fx + s * 0.04 * r;
  const my = c[1] + 0.56 * r;
  const mw = 0.17 * r * (1 - 0.3 * turn);
  const step = talkingAt(t, h.talking) ? WORRY_STEPS[Math.floor(t * 10) % WORRY_STEPS.length] : 0;
  let mouth: React.ReactNode;
  if (step > 0) {
    const W = step === 2 ? 1.3 * mw : 1.26 * mw;
    const H = step === 2 ? 0.22 * r : 0.13 * r;
    const md = capMouth(mx, my + 0.02 * r, W, H);
    mouth = (
      <>
        <Fill d={md} color={CC.mouth} offset={false} at={fillAt(at, 0.12)} />
        <Ink d={md} width={inner * 1.1} at={b(at, 0.12)} />
      </>
    );
  } else {
    const md = smooth([[mx - mw * 1.1, my + 0.08 * r], [mx - mw * 0.45, my - 0.02 * r], [mx + mw * 0.4, my - 0.02 * r], [mx + mw * 1.1, my + 0.09 * r]]);
    mouth = <Ink d={md} width={ink * 0.82} at={b(at, 0.12)} />;
  }
  return (
    <>
      <Fill d={headD} color={HER.skin} at={fillAt(at, 0.02)} seed={`${seed}/headF`} />
      <Ink d={headD} width={ink} at={b(at, 0.02)} open={0.08} />
      {eyes.map(([x, y], i) =>
        blink ? (
          <Ink key={i} d={line(x - 0.08 * r, y, x + 0.08 * r, y, {over: [0, 0], seed: `${seed}/bl${i}`})} width={inner} at={b(at, 0.1)} />
        ) : (
          <Fill key={i} d={blob(x, y, 0.072 * r * (i === 1 ? 1 - 0.25 * turn : 1), 0.105 * r, {seed: `${seed}/e${i}`})} color={CC.ink} offset={false} at={fillAt(at, 0.08)} />
        ),
      )}
      <Ink d={nose} width={Math.max(1.6, inner * 0.85)} at={b(at, 0.1)} />
      {mouth}
      <Fill d={cap} color={HER.hair} at={fillAt(at, 0.06)} seed={`${seed}/cap`} />
      <Ink d={cap} width={inner} at={b(at, 0.06)} open={0.15} />
      <Ink d={brow(0) + brow(1)} width={ink * 1.15} at={b(at, 0.1)} />
      <HairLocks h={h} />
    </>
  );
};
