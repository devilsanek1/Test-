// WATER STUDY, candidate A: "TRUE REFLECTION" (the owner on v5's water, 2026-10-28: "it's just looking way too cheap,
// not clean or premium quality or refined. Just lazy and cheap. I mean that about the water"). The canal is drawn like
// a building: it is the MIRROR of S1 itself under the one camera, seen through the water.
//   1. The open water: the shot's own sky (S1_EVENING) mirrored about the horizon, toned by Fresnel toward the water's
//      teal body (warm along the far quay, a light crossing, teal at our edge): the ONE allowed gradient, through lib/sky's
//      eased curve and blue-noise dither (candA_s1 waterRamp); it holds still on screen while the water floats.
//   2. Every reflection: the bridge and its arch, the far tower and roofs, Google's ground storey (the brick wall, the
//      corner pier, the slit bay, the lit lobby's gold column), the lamp posts, the bollards, the coping's own face, the
//      moored boats, her and the row, the door's sliding leaves, the bus, the duck: each mirrored about its own waterline
//      on its own parallax plane, simplified to masses, verticals and lights (R5), cut into level ripple rows spaced by
//      perspective (2.7 px far -> 13.5 px near), each row swaying on waves that travel toward us, every piece's ends
//      ragged (a little everywhere, a lot near us, rounded there). HUE FROM THE WATER, VALUE FROM THE WORLD, LIGHT KEEPS
//      ITS COLOUR: every opaque thing takes the water's teal family at its value, toned by a Fresnel ladder (7 flat steps,
//      k 0.40 -> 0.70); only the lobby's gold stays gold (never an RGB mix: no khaki, beige, tan or grey).
//   3. The ripple gaps: lenses of the open water's colour: thin warm light lines along the far quay, row-tall teal pills
//      near us (the reflection breaking up, the water's own body showing between: Fresnel by coverage); each lens grows
//      along its length and shrinks out on its own slow cycle.
//   4. The sun's glitter column under SUN0: a gold bed of level lenses, one per row, each swelling and shrinking on its
//      own cycle, and warm-white level slivers that grow in and out (0.42-0.9 s each, 4-6 alive), densest at the sun's
//      mirror point. GLINTS_OFF: v5's star field is gone.
//   5. The duck (CandDuck): the kit's mallard exactly, its paper V wake replaced by one slow, flat ring (a still duck
//      makes rings, not a V: research R11); its reflection lives in the water's rows.
//   Frame 0: the water lands as flat pale shapes (its reflections, unsliced) and the colour floods in from SUN0 with
//   the rest of the set (a circle at 5800 px/s, f5-f12). Deterministic: integer hashes and the frame time only.
// docs/v2/water/cand_A.md has the numbers, the render cost and the API sketch for a shared lib/water.
import React, {useId, useMemo} from 'react';
import {Sky, type SkySpec} from '../../lib/sky';
import {Fill} from '../../lib/Fill';
import {CM} from '../palette';
import {P, ovalPath} from '../kit/canal/core';
import {S1_PLANE} from '../scenes/V2S1_float';
import {S1_PALE} from '../scenes/V2S1_clock';
import * as G from './geometry';
import {clamp01, gapsAt, glitterAt, glitterHalfW, hash01, lensD, lerp, paleOf, pillD, polyD, reflectTone, rowOffset, slice, smooth, type Src} from './candA_core';
import {BED, CAM, GAPS, GLITTER, GLITTER_Y, PAPER, RAGGED, ROWS, SLIVER, SWAY, TONE, duckPose, dynamicSources, gapRange, kOf, rampColorAt, staticSources, waterRamp} from './candA_s1';

/** The flood front has crossed all the water (and its tucks) by 0.02 + 1069 / 5800 s. */
const FLOOD_END = 0.21;

type Built = {srcs: Src[]; ramp: SkySpec; waterD: string; xr: ([number, number] | null)[]; pale: {color: string; d: string}[]; paleBase: string};

function build(): Built {
  const srcs = staticSources();
  const ramp = waterRamp();
  // frame 0: the reflections as flat pale shapes (unsliced, in z-order), on a flat pale water
  const acc = new Map<string, {layer: number; color: string; parts: string[]}>();
  for (const s of srcs.slice().sort((a, b) => a.layer - b.layer)) {
    const color = paleOf(reflectTone(s.col, 0.45, TONE, s.kind), S1_PALE, PAPER);
    const key = `${s.layer}|${color}`;
    let a = acc.get(key);
    if (!a) acc.set(key, (a = {layer: s.layer, color, parts: []}));
    a.parts.push(polyD(s.p));
  }
  const pale = Array.from(acc.values())
    .sort((a, b) => a.layer - b.layer)
    .map((a) => ({color: a.color, d: a.parts.join('')}));
  return {srcs, ramp, waterD: G.waterPolygon(10), xr: ROWS.map((r) => gapRange(r)), pale, paleBase: paleOf(rampColorAt(ramp, 1180), S1_PALE, PAPER)};
}

/** Quantise a colour to even codes (fewer distinct lens fills: one path each). */
const q2 = (hex: string) =>
  '#' +
  [1, 3, 5]
    .map((i) => Math.min(254, Math.round(parseInt(hex.slice(i, i + 2), 16) / 2) * 2))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');

/** Candidate A's canal: drawn in S1Water's place (the water's parallax plane, the environment tier, the flood's Look,
 *  RIG_CANAL); raw SVG with computed colours (never re-tinted by the pen's tier pull). */
export const CandWater: React.FC<{t: number}> = ({t}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const B = useMemo(build, []);
  const flooding = t < FLOOD_END;
  const r = G.floodRadius(t);
  const colour = r > 0;
  let body: React.ReactNode = null;
  if (colour) {
    const offs = ROWS.map((row) => rowOffset(row, t, SWAY));
    const shift = (plane: number) => G.floatOf(plane, t);
    // 1-2: every reflection, sliced into the rows, swayed, toned by the Fresnel ladder
    const sliced = slice(B.srcs.concat(dynamicSources(t)), ROWS, offs, shift, (s, row) => reflectTone(s.col, kOf(row), TONE, s.kind), {t, r: RAGGED});
    // 3: the ripple gaps, in the open water's colour at their place
    const lensBy = new Map<string, string[]>();
    for (const L of gapsAt(ROWS, t, GAPS, (row) => B.xr[row.i])) {
      const x = L.x + offs[L.row];
      const c = q2(rampColorAt(B.ramp, L.y, x));
      (lensBy.get(c) ?? lensBy.set(c, []).get(c)!).push(L.pill ? pillD(x - L.len / 2, x + L.len / 2, L.y - L.h / 2, L.y + L.h / 2) : lensD(x, L.y, L.len, L.h));
    }
    // 4: the glitter column, straight under the sun (which rides the far roofs' plane)
    const sunDx = shift(S1_PLANE.farRoofs)[0];
    let bed = '';
    for (let i = 0; i < ROWS.length; i++) {
      const row = ROWS[i];
      if (row.yc < GLITTER_Y[0] || row.y0 > GLITTER_Y[1] + 6) continue;
      // a broken, breathing column (never a ladder): each row's slice is a level lens of the sun's light whose length
      // swells and shrinks on its own 2.6-4.4 s cycle, now and then to nothing; slices wander +-30 % of the half-width
      const env = clamp01((0.5 + 0.5 * Math.sin((2 * Math.PI * t) / lerp(2.6, 4.4, hash01(4104, row.i, 6)) + 6.283 * hash01(4104, row.i, 7)) - 0.18) / 0.82);
      if (env < 0.04) continue;
      const taper = smooth(GLITTER_Y[0], GLITTER_Y[0] + 16, row.yc);
      const hw = glitterHalfW(CAM, GLITTER, row.yc) * 0.85 * lerp(0.5, 1.15, hash01(4104, row.i)) * lerp(0.35, 1, taper) * Math.pow(env, 0.6);
      const cx = GLITTER.x + sunDx + offs[i] + hw * 0.3 * (2 * hash01(4104, row.i, 3) - 1);
      bed += lensD(cx, row.yc, 2 * hw, row.h * 0.62);
    }
    let sliv = '';
    for (const s of glitterAt(CAM, ROWS, t, GLITTER, GLITTER_Y)) sliv += lensD(s.x + sunDx + offs[s.row], s.y, s.len, s.h);
    // the sky in the water is at infinity: it holds still on screen while the water plane floats
    const sky = G.floatOf(S1_PLANE.sky, t);
    body = (
      <>
        <g transform={`translate(${sky[0].toFixed(3)} ${sky[1].toFixed(3)})`}>
          <Sky spec={B.ramp} />
        </g>
        {sliced.map((p, i) => (
          <path key={`r${i}`} d={p.d} fill={p.color} />
        ))}
        {Array.from(lensBy.entries()).map(([c, ds]) => (
          <path key={`g${c}`} d={ds.join('')} fill={c} />
        ))}
        {bed ? <path d={bed} fill={BED} /> : null}
        {sliv ? <path d={sliv} fill={SLIVER} /> : null}
      </>
    );
  }
  return (
    <g>
      <defs>
        <clipPath id={`${uid}w`} clipPathUnits="userSpaceOnUse">
          <path d={B.waterD} />
        </clipPath>
        {flooding && colour ? (
          <clipPath id={`${uid}f`} clipPathUnits="userSpaceOnUse">
            <circle cx={G.FLOOD_ORIGIN[0]} cy={G.FLOOD_ORIGIN[1]} r={r} />
          </clipPath>
        ) : null}
      </defs>
      <g clipPath={`url(#${uid}w)`}>
        {flooding ? (
          <>
            <path d={B.waterD} fill={B.paleBase} />
            {B.pale.map((p, i) => (
              <path key={`p${i}`} d={p.d} fill={p.color} />
            ))}
          </>
        ) : null}
        {colour ? flooding ? <g clipPath={`url(#${uid}f)`}>{body}</g> : body : null}
      </g>
    </g>
  );
};

/** v5's sun-path star field goes: this water draws its own glitter column. */
export const GLINTS_OFF = true;

/** The duck's ring (R11: a duck at rest paddles rings, never a V): one at a time, 2.4 s every 3.4 s, growing ~28 px/s
 *  from 22 px, flattened by the water's foreshortening there (ry/rx 0.12), a hairline that thins from 1.3 to 0.45 px
 *  (it grows in from nothing: never a fade), in the far water's light ripple colour. */
const RINGS = {t0: 0.45, period: 3.4, life: 2.4, r0: 22, grow: 28, w0: 1.3, w1: 0.45} as const;

/** Candidate A's duck: the kit's mallard exactly as before (its body, head and beak through <Fill>, so the pen and
 *  the flood treat it the same), without the paper V wake; its rings on the water; its reflection is in CandWater's
 *  rows. */
const CandDuckBody: React.FC<{t: number}> = ({t}) => {
  const ramp = useMemo(() => waterRamp(), []);
  const {x, by, y, s, face} = duckPose(t);
  const fs = (y - CAM.horizon) / CAM.f;
  const ringCol = q2(rampColorAt(ramp, y - 4, x));
  const rings: React.ReactNode[] = [];
  for (let j = 0; j < 1; j++) {
    const u = (t - RINGS.t0) / RINGS.period;
    if (u < 0) continue;
    const tau = (u - Math.floor(u)) * RINGS.period;
    if (tau > RINGS.life) continue;
    const k = tau / RINGS.life;
    const rx = RINGS.r0 + RINGS.grow * tau;
    const w = lerp(RINGS.w0, RINGS.w1, k) * Math.min(1, tau / 0.25);
    rings.push(<ellipse key={j} cx={x} cy={y + 1} rx={rx} ry={rx * fs} fill="none" stroke={ringCol} strokeWidth={w} />);
  }
  const bodyD = `M${P(x - s * 0.55, by)}Q${P(x - s * 0.5, by + s * 0.32)} ${P(x, by + s * 0.3)}Q${P(x + s * 0.5, by + s * 0.3)} ${P(x + s * 0.55, by - s * 0.02)}Q${P(x + face * s * 0.1, by - s * 0.3)} ${P(x - s * 0.55, by)}Z`;
  const headD = ovalPath(x + face * s * 0.4, by - s * 0.32, s * 0.16, s * 0.15);
  const beakD = `M${P(x + face * s * 0.52, by - s * 0.33)}L${P(x + face * s * 0.72, by - s * 0.29)}L${P(x + face * s * 0.52, by - s * 0.25)}Z`;
  return (
    <>
      {rings}
      <Fill d={bodyD + headD} color={CM.line} seed="ducks/s1ducks/1/line" offset={false} />
      <Fill d={beakD} color={CM.coatMustard} seed="ducks/s1ducks/1/mustard" offset={false} />
    </>
  );
};
export const CandDuck: React.FC<{t: number}> | null = CandDuckBody;
