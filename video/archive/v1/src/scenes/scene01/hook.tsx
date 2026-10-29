// S01 hook pass 2 (the first 1.5 s and 'on PURPOSE'), drawn through plaza.tsx:
//   ShutdownRings  each later power press (timing.ts B.ring) emits a SHUTDOWN RING from the sun's rim: a cream band
//                  with 3.4 px ink edges (SunRipple, profile outQuad), drawn in SCREEN space over the facades and the
//                  ground, under the crowd and the near layer, CLIPPED to the plaza's silhouettes (buildings, govD,
//                  ground, far skyline: each arc ends at a roofline, never in open sky) and to screen y >= 590 (the
//                  caption band above stays calm sky). Centre = the sun's screen centre each frame.
//   SlatTag        govB's big lettered 'back soon' tag hung ON the shutter slats (string up to the shutter box), clear
//                  of the padlock and of the door's lock box: pops on swinging (lifted off the shutter: foreshortened)
//                  on 'on' and SLAPS flat against the slats ON 'PURPOSE' (squash + impact ticks).
// Both are new after frame 0 (rings from 0.16, the tag from 3.695), so the loop seam with S12 is untouched; S12 keeps
// S01_GOV's old govB tag (its S11 note hangs where this tag would).
import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, useTime} from '../../lib/time';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {captionFontStack, measureCaption, useCaptionFont} from '../../lib/font';
import {circle, line, poly, Pt} from '../../lib/sketch';
import {mat, useXf, XG} from '../../lib/xf';
import {matScale, misregScreen} from '../shared/props';
import {PLAZA} from '../shared/sets';
import {layerMat, toScreen, zoomAt} from './camera';
import {B} from './timing';
import {SunRipple} from './dressing';

// ---------------------------------------------------------------- the shutdown rings

/** Screen y the rings are clipped to (the caption band is y 280-570: nothing new draws above 590). */
export const RING_CLIP_Y = 590;
/** Fix round (hook review: a 6 px band with 2 px edges read as a pencil hairline over the beige facades): the house ink
 *  weight on both edges, the band 12 px (timing.ts B.ring w), thinning only to 75 %. */
const RING_EDGE = 3.4;
const RING_THIN_TO = 0.75;

// The plaza's silhouettes (world px of their layer: GovernmentPlaza's G / CIV / FAR_STEPS fills, traced): the rings ride
// ONLY over architecture and paving, so each arc ends at a roofline / skyline edge, never in a flat cut in open sky
// (hook review). Each list is clipped through its own layer matrix (multiplane parallax), unioned, then intersected with
// screen y >= RING_CLIP_Y.
type P2 = [number, number];
const sp = (pts: P2[]) => `M${pts.map((q) => `${q[0]} ${q[1]}`).join('L')}Z`;
const rct = (x: number, y: number, w: number, h: number) => sp([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
const LOW = 1500; // every silhouette runs down under the plaza horizon (1384), where the ground takes over
const halfDome = (cx: number, by: number, rx: number, ry: number) => `M${cx - rx} ${by}A${rx} ${ry} 0 0 1 ${cx + rx} ${by}Z`;
const SIL: Record<'buildings' | 'govD' | 'ground' | 'far', string[]> = {
  buildings: [
    // govA: pediment + cornice (pedL -64 .. pedR 424, cornT 712 .. cornB 748), the facade x -40 .. 400 to the steps
    sp([[-64, 712], [180, 614], [424, 712], [424, 748], [400, 748], [400, LOW], [-200, LOW], [-200, 748], [-64, 748]]),
    // govB: lantern + cap (to y 600), the dome (cx 518, by 792, rx 90, ry 140), the drum, the cornice, the facade
    sp([[505, 612], [518, 600], [531, 612], [528, 612], [528, 660], [508, 660], [508, 612]]),
    halfDome(518, 793, 90, 141),
    rct(424, 790, 188, 116),
    rct(384, 904, 268, 22),
    rct(396, 924, 244, LOW - 924),
    // govC: spire roof (to y 606), turret, cornice, the tower (behind govD from y 880)
    sp([[829, 640], [870, 606], [911, 640]]),
    rct(835, 638, 70, 64),
    rct(794, 700, 212, 14),
    rct(800, 712, 200, 200),
  ],
  // govD: the modern ministry, roof 880, cut by the right edge
  govD: [rct(790, 880, 600, LOW - 880)],
  // the plaza floor from the horizon down
  ground: [rct(-400, 1384, 2000, 800)],
  // the far civic skyline in the gap (far layer): the back band (top 1058, the raised blocks ignored) + the silhouettes
  // that rise over it (PLAZA_CIVIC: domeF's lantern, templeM's pediment, the two spires, domeB), and the far steps
  far: [
    rct(560, 1058, 520, LOW - 1058),
    sp([[665, 1060], [665, 1042], [672, 1036], [679, 1042], [679, 1060]]),
    sp([[620, 1060], [620, 1044], [648, 1030], [676, 1044], [676, 1060]]),
    sp([[680, 1060], [680, 996], [690, 966], [700, 996], [700, 1060]]),
    sp([[700, 1060], [700, 1030], [715, 996], [730, 1030], [730, 1060]]),
    halfDome(745, 1024, 14, 21),
    sp([[725, 1060], [725, 1023], [765, 1023], [765, 1060]]),
    sp([[739, 1004], [739, 988], [745, 982], [751, 988], [751, 1004]]),
  ],
};

/** All four rings, in SCREEN px, for a layer whose matrix is `layer` (the rings undo it). */
export const ShutdownRings: React.FC<{layer: string}> = ({layer}) => {
  const t = useTime();
  const live = B.ring.filter((r) => t >= r.at && t < r.at + r.dur);
  if (!live.length) return null;
  const sun = PLAZA.sun;
  const [cx, cy] = toScreen(t, [sun.x, sun.y], 'sun');
  return (
    <XG m={mat.inv(layerMat(t, layer))}>
      <defs>
        <clipPath id="s01-shutdown-band">
          <rect x={-200} y={RING_CLIP_Y} width={1480} height={2000} />
        </clipPath>
        <clipPath id="s01-shutdown-sil">
          {(Object.keys(SIL) as (keyof typeof SIL)[]).flatMap((k) => {
            const tr = mat.str(layerMat(t, k));
            return SIL[k].map((d, i) => <path key={`${k}${i}`} d={d} transform={tr} />);
          })}
        </clipPath>
      </defs>
      <g clipPath="url(#s01-shutdown-band)">
        <g clipPath="url(#s01-shutdown-sil)">
          {live.map((r) => (
            // r0 = the rim on screen at the emission (the sun layer's zoom then)
            <SunRipple key={r.at} cx={cx} cy={cy} r={sun.r * zoomAt(r.at, 'sun')} r1={r.r1} at={r.at} dur={r.dur} profile="outQuad" thinTo={RING_THIN_TO} width={r.w} edge={RING_EDGE} hold={false} />
          ))}
        </g>
      </g>
    </XG>
  );
};

// ---------------------------------------------------------------- govB's big 'back soon' tag on the slats

/** govB's window [414, 970, 208, 146]: the shutter box (18) ends at y 988, the slats run to 1116. The padlock (S01_GOV
 *  govB x 452, body centre 1096, 58 high) reaches up to y ~1057 with its shackle (x 429-475 with the body); the door's
 *  lock box is far below (543, 1318). The tag hangs from a nail on the box's bottom edge at the window's centre line,
 *  body 196 x 52 (y 998-1050 at rest), so it clears the window jambs (414 / 622) and stays >= 6 px above the shackle. */
export const SLAT_TAG = {x: 518, y: 989, w: 196, top: 9, h: 52, chamfer: 11} as const;

/** The tag's pose at t (about the nail): in-plane angle (deg), foreshortening (the tag lifted off the slats while it
 *  swings), squash on the slap and the pop-on scale. */
export const slatTagPose = (t: number, at: number, slap: number) => {
  const u = t - at;
  const pop = u < 0.05 ? 0.3 + 0.78 * E.outCubic(clamp(u / 0.05)) : u < 0.12 ? 1.08 - 0.08 * E.inOutSine((u - 0.05) / 0.07) : 1;
  const S0 = slap - 0.07; // the slap starts 2 frames before the word
  // swing: damped pendulum from +14 deg (right side down: the left corner never dips toward the padlock), lifted off the
  // slats (foreshortened 0.76-0.84) with its own wobble
  const sw = (tt: number) => {
    const v = tt - at;
    return {a: 14 * Math.cos(2 * Math.PI * 2.2 * v) * Math.exp(-2 * v), fy: 0.8 + 0.04 * Math.sin(2 * Math.PI * 1.7 * v)};
  };
  let a: number;
  let fy: number;
  if (t < S0) ({a, fy} = sw(t));
  else if (t < slap) {
    const s0 = sw(S0);
    const k = E.inQuad((t - S0) / (slap - S0));
    a = lerp(s0.a, 0, k);
    fy = lerp(s0.fy, 1, k);
  } else {
    a = 0;
    fy = 1;
  }
  // the slap: squash wide and short ON the word, settling in ~0.1 s
  const q = t >= slap ? Math.exp(-(t - slap) * 32) : 0;
  return {a, sx: pop * (1 + 0.06 * q), sy: pop * fy * (1 - 0.07 * q), pop};
};

/** `outAt`: the house pop exit (one 0.55 shrunken frame, then gone) late in the dive: the slats rush up through the
 *  caption band in the dive's last frames, and this tag must not be the new thing drawn there (its top would cross
 *  screen y 590 on f139). */
export const SlatTag: React.FC<{at: number; slap: number; outAt?: number; seed?: string}> = ({at, slap, outAt, seed = 's01/govB/slatTag'}) => {
  useCaptionFont();
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  if (t < at || (outAt !== undefined && t >= outAt + 1 / 30)) return null;
  const shrink = outAt !== undefined && t >= outAt ? 0.55 : 1;
  const {x, y, w: W, top, h: H, chamfer: n} = SLAT_TAG;
  const {a, sx, sy} = slatTagPose(t, at, slap);
  const m1 = measureCaption('back soon', 100) / 100;
  // the words fill ~0.86 of the width, capped at 48 world px (~58 px em on screen at the 'PURPOSE' zoom 1.21: the 'b' /
  // 'k' ascenders ~43 px, x-height ~29 px)
  const fs = Math.min((W * 0.86) / m1, 48);
  const body: Pt[] = [
    [-W / 2, top + n],
    [-W / 2 + n, top],
    [W / 2 - n, top],
    [W / 2, top + n],
    [W / 2, top + H],
    [-W / 2, top + H],
  ];
  const bodyD = `M${body.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L')}Z`;
  const ey = top + 7;
  const er = 3;
  const base = top + H - 7; // baseline 7 px above the bottom edge ('back soon' has no descenders)
  const off = misregScreen(seed);
  // impact ticks ON the slap: three short ink strokes off each side of the tag (pop full, retract to their tips by +0.12)
  const tu = t - slap;
  let ticks = '';
  if (tu >= 0 && tu < 0.12) {
    const back = E.inQuad(clamp((tu - 0.03) / 0.09));
    for (const side of [-1, 1]) {
      for (const [dy, deg] of [[top + 10, -28], [top + H / 2 + 2, 0], [top + H - 6, 28]] as [number, number][]) {
        // from just outside the window jambs (x 414 / 622) onto the clay facade, where ink reads (not on the dark slats)
        const r0 = W / 2 + 14;
        const L = 17;
        const ang = (deg * Math.PI) / 180;
        const dx = Math.cos(ang) * side;
        const dyy = Math.sin(ang);
        const s0 = lerp(0, L - 2, back);
        ticks += `M${(side * r0 + dx * s0).toFixed(1)} ${(dy + dyy * s0).toFixed(1)}L${(side * r0 + dx * L).toFixed(1)} ${(dy + dyy * L).toFixed(1)}`;
      }
    }
  }
  const tag = (
    <>
      <XG m={mat.compose(mat.translate(x, y), mat.rotate(a), mat.scale(sx, sy))}>
        <Ink d={line(0, -1, 0, ey - er, {over: [0, 0], seed: `${seed}/str`})} width={2.2} taper={false} seed={`${seed}/str`} />
        <Fill d={bodyD} color={palette.white} offset={[off[0] / k, off[1] / k]} seed={`${seed}/f`} />
        <Ink d={poly(body, {closed: true, over: 2, seed: `${seed}/o`})} width={3} taper={false} seed={`${seed}/o`} />
        <Ink d={circle(0, ey, er, {seed: `${seed}/h`})} width={2} taper={false} seed={`${seed}/h`} />
        <text x={0} y={base} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
          back soon
        </text>
      </XG>
      {/* the nail on the shutter box's bottom edge */}
      <Ink d={circle(x, y, 2.6, {seed: `${seed}/nail`})} width={2.4} taper={false} seed={`${seed}/nail`} />
      {ticks ? (
        <XG m={mat.translate(x, y)}>
          <Ink d={ticks} width={3.4} taper={false} seed={`${seed}/ticks`} />
        </XG>
      ) : null}
    </>
  );
  return shrink === 1 ? tag : <XG m={mat.about(mat.scale(shrink), x, y + top + H / 2)}>{tag}</XG>;
};
