// V2S2_Staff (lane L2): the five staff windows' story overlay (map S2.staffWindows; TREATMENT §3 "five window
// silhouettes", V11: a few, unnamed, faceless). Drawn by V2S2_Set's WingS2 `storyOverlay` over each pane the set paints
// (the set turns the pane its 'cool' white at staffCoolAt + i x 0.04). FILM seconds.
//   8.96 + i x 0.04 "staff": a standing silhouette rises into each pane (2 drawings): a person at a glance, mono
//     CM.paneUnlit, faceless: short or cropped hair, ear bumps, a neck notch, shoulders 1.9-2.05 x the head width, ONE
//     accessory each (a lanyard cord, a headphone band, a mug at chest height); no two neighbours alike.
//   idle: a 2-drawing weight shift or head turn (<= 5 px) every 0.62-0.88 s, staggered across the five.
//   10.26 + i x 0.085 "scared": each figure starts stepping back 0.11 s before its blind (4 drawings at 12/s): it
//     scales to 0.75 and sinks until its head top sits just under the half blind's bottom rail (further back in the
//     room); the blind (one flat CM.shadeWarm shape, two soft fold bands, a rail and cord in its own deep shade: no
//     ink) drops to half.
//   12.20 "contracts": W2's blind drops fully (a full mauve block, the darkest pane after hers); its figure is gone.
// The window's own mullion and transom (the set's, same fill and seed) are redrawn over the figure and the blind: the
// person stands behind the glass. Everything is clipped to the pane, 2 px inside the set's frame line.
import React, {useId} from 'react';
import {CM} from '../palette';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {seamTone} from '../../lib/depth';
import {useTime} from '../../lib/time';
import {ExitSync} from '../../lib/exit';
import * as MAP from '../world/map';
import {blindAt, BlindKey} from '../kit/cast/Staff';
import {drawingAt} from './V2S2_Bench';

const S2 = MAP.S2;

type Hair = 'crop' | 'short' | 'tuft';
type Acc = 'lanyard' | 'headphones' | 'mug';
type StaffLook = {
  hair: Hair;
  acc: Acc;
  /** Which half of the pane the figure stands in (-1 left, +1 right): the head clears the mullion. */
  side: -1 | 1;
  /** Shoulders as a multiple of the head width (>= 1.8). */
  broad: number;
  /** The idle: a weight shift or a head turn, every `period` s from `phase`. */
  idle: 'shift' | 'turn';
  period: number;
  phase: number;
  /** The mug / hair-bump side (+1 right). */
  hand: -1 | 1;
};

/** No two neighbours alike (W2-SW2, W2-SW4, SW2-SW3, SW3-SW4, SW4-SW5 touch). */
export const STAFF_LOOK: Record<string, StaffLook> = {
  // keyed by map S2.staffWindows ids since the conform: SW1 (200, 795) at her old spot, W2 (465, 776) beside hers
  // SW1's mug in its left hand, away from her pane (the critic, 2026-10-28: a forearm pointing at her window read as blame)
  SW1: {hair: 'short', acc: 'mug', side: 1, broad: 1.95, idle: 'turn', period: 0.74, phase: 0.12, hand: -1},
  W2: {hair: 'crop', acc: 'headphones', side: 1, broad: 2.05, idle: 'shift', period: 0.86, phase: 0.47, hand: -1},
  SW3: {hair: 'short', acc: 'mug', side: -1, broad: 1.9, idle: 'turn', period: 0.66, phase: 0.29, hand: -1},
  SW4: {hair: 'crop', acc: 'headphones', side: 1, broad: 1.95, idle: 'shift', period: 0.8, phase: 0.05, hand: 1},
  SW5: {hair: 'tuft', acc: 'lanyard', side: 1, broad: 2.0, idle: 'turn', period: 0.62, phase: 0.38, hand: -1},
};

const P = (n: number) => n.toFixed(1);
/** Closed circle / ellipse, CLOCKWISE on screen (every subpath of a silhouette winds the same way: no holes). */
const circle = (cx: number, cy: number, r: number) => `M${P(cx - r)} ${P(cy)}a${P(r)} ${P(r)} 0 1 1 ${P(2 * r)} 0a${P(r)} ${P(r)} 0 1 1 ${P(-2 * r)} 0Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${P(cx - rx)} ${P(cy)}a${P(rx)} ${P(ry)} 0 1 1 ${P(2 * rx)} 0a${P(rx)} ${P(ry)} 0 1 1 ${P(-2 * rx)} 0Z`;

/** The silhouette as fill paths (one mono colour) + light cord strokes, for a figure with its head top at `top`. */
function staffFigure(o: {cx: number; top: number; r: number; sill: number; look: StaffLook; headDx: number; tilt: number}): {fill: string; cord: string} {
  const {cx, top, r, sill, look, headDx} = o;
  const hx = cx + headDx;
  const hy = top + r;
  const W = 2 * r * look.broad;
  const shoulderY = top + 2 * r + 0.32 * r;
  let d = '';
  // the head (the hair IS the head from behind) + the hair's own bump
  d += circle(hx, hy, r);
  if (look.hair === 'short') d += circle(hx + look.hand * 0.32 * r, hy - 0.5 * r, 0.62 * r);
  if (look.hair === 'tuft') d += ellipse(hx - look.hand * 0.18 * r, hy - 0.86 * r, 0.42 * r, 0.3 * r);
  // ears (headphone cups replace them)
  if (look.acc === 'headphones') {
    d += ellipse(hx - 1.02 * r, hy + 0.12 * r, 0.27 * r, 0.38 * r) + ellipse(hx + 1.02 * r, hy + 0.12 * r, 0.27 * r, 0.38 * r);
    // the band: a ring over the crown (outer 1.16 r, inner 1.0 r), upper half only
    const ro = 1.17 * r;
    const ri = 1.0 * r;
    const a0 = (196 * Math.PI) / 180;
    const a1 = (344 * Math.PI) / 180;
    const pt = (rad: number, a: number) => `${P(hx + Math.cos(a) * rad)} ${P(hy + Math.sin(a) * rad)}`;
    d += `M${pt(ro, a0)}A${P(ro)} ${P(ro)} 0 0 1 ${pt(ro, a1)}L${pt(ri, a1)}A${P(ri)} ${P(ri)} 0 0 0 ${pt(ri, a0)}Z`;
  } else {
    const er = 0.2 * r;
    if (o.headDx <= 2) d += circle(hx - 0.97 * r, hy + 0.12 * r, er);
    if (o.headDx >= -2) d += circle(hx + 0.97 * r, hy + 0.12 * r, er);
  }
  // the neck (a notch between the head and the shoulders)
  const nw = 0.4 * r;
  d += `M${P(hx - nw)} ${P(hy + 0.4 * r)}L${P(hx + nw)} ${P(hy + 0.4 * r)}L${P(cx + nw * 1.08)} ${P(shoulderY + 0.4 * r)}L${P(cx - nw * 1.08)} ${P(shoulderY + 0.4 * r)}Z`;
  // the torso: a tombstone (rounded shoulders) down past the sill, its shoulder line tilted by `tilt` (px)
  const hw = W / 2;
  const R = W * 0.36;
  const yl = shoulderY + o.tilt;
  const yr = shoulderY - o.tilt;
  const bot = sill + 6;
  d +=
    `M${P(cx - hw * 1.04)} ${P(bot)}L${P(cx - hw)} ${P(yl + R)}Q${P(cx - hw)} ${P(yl)} ${P(cx - hw + R)} ${P(yl)}` +
    `L${P(cx + hw - R)} ${P(yr)}Q${P(cx + hw)} ${P(yr)} ${P(cx + hw)} ${P(yr + R)}L${P(cx + hw * 1.04)} ${P(bot)}Z`;
  let cord = '';
  if (look.acc === 'mug') {
    // a forearm out at chest height on the hand side and a mug (with its handle ring) at its end
    const s = look.hand;
    const ay = shoulderY + 1.15 * r;
    const ax0 = cx + s * (hw - 0.3 * r);
    const ax1 = cx + s * (hw + 0.42 * r);
    const aw = 0.26 * r;
    const [axl, axr] = s > 0 ? [ax0, ax1] : [ax1, ax0];
    const [dyl, dyr] = s > 0 ? [0, -0.1 * r] : [-0.1 * r, 0];
    d += `M${P(axl)} ${P(ay - aw + dyl)}L${P(axr)} ${P(ay - aw + dyr)}L${P(axr)} ${P(ay + aw + dyr + (s > 0 ? 0 : 0.2 * r))}L${P(axl)} ${P(ay + aw + dyl + (s > 0 ? 0.2 * r : 0))}Z`;
    const mw = 0.56 * r;
    const mh = 0.7 * r;
    const mx0 = s > 0 ? ax1 - 0.05 * r : ax1 + 0.05 * r - mw;
    const my0 = ay - mh * 0.75;
    d += `M${P(mx0)} ${P(my0)}L${P(mx0 + mw)} ${P(my0)}L${P(mx0 + mw * 0.94)} ${P(my0 + mh)}L${P(mx0 + mw * 0.06)} ${P(my0 + mh)}Z`;
    // the handle ring on the outer side (a ring: outer ellipse + inner hole, evenodd-safe as two subpaths)
    const hxr = s > 0 ? mx0 + mw + 0.12 * r : mx0 - 0.12 * r;
    d += ellipse(hxr, my0 + mh * 0.42, 0.2 * r, 0.24 * r);
  }
  if (look.acc === 'lanyard') {
    // the lanyard cord over the nape, from one side of the collar to the other (a light cord on the dark back)
    const ly = shoulderY + 0.16 * r;
    cord = `M${P(cx - 0.62 * r)} ${P(ly + 0.18 * r)}Q${P(cx - 0.4 * r)} ${P(ly - 0.12 * r)} ${P(cx)} ${P(ly - 0.14 * r)}Q${P(cx + 0.4 * r)} ${P(ly - 0.12 * r)} ${P(cx + 0.62 * r)} ${P(ly + 0.18 * r)}`;
  }
  return {fill: d, cord};
}

/** The blind's two deeper tones: its fold bands (one soft step under the blind, seamTone 6) and its bottom rail and
 *  cord (the blind's own deep shade, seamTone 12). */
const BLIND_BAND = seamTone(CM.shadeWarm, 6);
const BLIND_DEEP = seamTone(CM.shadeWarm, 12);

/** The blind (the critic, 2026-10-28: the slat hairlines striped the beat's subject): ONE flat warm-shade shape
 *  (CM.shadeWarm), two soft fold bands across it a step deeper (flat fills at 0.36 and 0.7 of its drop, so a pleated
 *  blind opens as it comes down), its bottom rail a flat bar in its own deep shade, and a short cord under the rail:
 *  no ink anywhere. */
const S2Blind: React.FC<{x: number; y: number; w: number; h: number; keys: BlindKey[]; seed: string}> = ({x, y, w, h, keys, seed}) => {
  const t = useTime();
  const k = blindAt(t, keys);
  if (k <= 0.005) return null;
  const bh = h * k;
  const rail = y + bh;
  const railH = Math.max(2.5, Math.min(4, h * 0.026));
  const bandH = Math.max(2.5, Math.min(6, bh * 0.05));
  let bands = '';
  for (const f of [0.36, 0.7]) {
    const yb = y + bh * f - bandH / 2;
    if (yb + bandH < rail - railH - 2) bands += `M${P(x)} ${P(yb)}h${P(w)}v${P(bandH)}h${P(-w)}Z`;
  }
  const cx = x + w * 0.8;
  const cordL = Math.min(22, h * 0.16);
  return (
    <>
      <Fill rect={[x, y, w, bh]} color={CM.shadeWarm} offset={false} seed={`${seed}/f`} />
      {bands ? <Fill d={bands} color={BLIND_BAND} offset={false} seed={`${seed}/b`} /> : null}
      <Fill d={`M${P(x - 2)} ${P(rail - railH)}h${P(w + 4)}v${P(railH)}h${P(-w - 4)}Z`} color={BLIND_DEEP} offset={false} seed={`${seed}/r`} />
      <Fill d={`M${P(cx - 0.9)} ${P(rail)}h1.8v${P(cordL)}h-1.8Z`} color={BLIND_DEEP} offset={false} seed={`${seed}/c`} />
    </>
  );
};

/** The scared step back: 0..1 progress (4 drawings at 12/s from `at`). */
const backAt = (t: number, at: number): number => {
  const k = drawingAt(t, at, 4);
  return k < 0 ? 0 : [0.32, 0.64, 0.88, 1][k];
};

/** One staff window's overlay: the figure (from `lightAt`), the blind, the redrawn mullion + transom. */
export const S2StaffWindow: React.FC<{w: MAP.Spot & {id: string}; i: number}> = ({w, i}) => {
  const t = useTime();
  const uid = 's2sw' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const look = STAFF_LOOK[w.id];
  const x0 = w.x - w.w / 2;
  const y0 = w.y - w.h / 2;
  const lightAt = S2.staffOnAt + i * S2.staffOnStagger;
  const tBlind = S2.blindsAt + i * S2.blindsStagger;
  const keys: BlindKey[] = [{t: tBlind, k: 0.5}];
  if (w.id === 'W2') keys.push({t: S2.w2BlindDownAt, k: 1});
  const blindK = blindAt(t, keys);
  // the figure
  let fig: {fill: string; cord: string} | null = null;
  if (t >= lightAt && blindK < 0.985) {
    const r0 = 0.125 * w.w;
    const top0 = y0 + Math.max(0.24 * w.h, 0.2 * w.h + 7);
    const cx0 = w.x + look.side * w.w * 0.22;
    const u = backAt(t, tBlind - 0.11);
    const sc = 1 - 0.25 * u;
    const top = top0 + (y0 + 0.5 * w.h + 4 - top0) * u;
    // the rise in (2 drawings): 10 px low, then in place
    const rise = t < lightAt + 2 / 60 ? 10 : 0;
    // the idle (paused while stepping back)
    const flip = u > 0 && u < 1 ? 0 : Math.floor((t + look.phase) / look.period) % 2;
    const headDx = look.idle === 'turn' && flip ? -look.side * 4 : 0;
    const shift = look.idle === 'shift' && flip ? look.side * 3 : 0;
    const tilt = look.idle === 'shift' && flip ? 1.6 * look.side : 0;
    fig = staffFigure({cx: cx0 + shift, top: top + rise, r: r0 * sc, sill: y0 + w.h, look, headDx, tilt});
  }
  const cx = x0 + w.w * 0.5;
  return (
    <ExitSync seed={`s2sw/${w.id}`}>
      <defs>
        <clipPath id={uid}>
          <rect x={x0 + 2} y={y0 + 2} width={w.w - 4} height={w.h - 4} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid})`}>
        {fig ? <Fill d={fig.fill} color={CM.paneUnlit} offset={false} mode="snap" seed={`s2sw/${w.id}/fig`} /> : null}
        {fig && fig.cord ? <Ink d={fig.cord} width={1.6} color={CM.paper} taper={false} seed={`s2sw/${w.id}/cord`} /> : null}
        <S2Blind x={x0} y={y0} w={w.w} h={w.h} keys={keys} seed={`s2sw/${w.id}/blind`} />
        {/* the window's mullion and transom (the set's fills, its seed = its misregistration) over the room */}
        <Fill d={`M${P(cx - 2)} ${P(y0)}h4v${P(w.h)}h-4Z`} color={CM.shadeCool} seed={'wingS2/story/0/' + CM.shadeCool} />
        <Fill d={`M${P(x0)} ${P(y0 + w.h * 0.2)}h${P(w.w)}v3h${P(-w.w)}Z`} color={CM.shadeCool} seed={'wingS2/story/0/' + CM.shadeCool} />
      </g>
    </ExitSync>
  );
};

/** The storyOverlay callback for V2S2_Set's WingS2: the five staff windows (her ring is V2S2's). */
export const staffOverlay = (w: MAP.Spot & {id: string}): React.ReactNode => {
  const i = S2.staffWindows.findIndex((s) => s.id === w.id);
  if (i < 0) return null;
  return <S2StaffWindow w={w} i={i} />;
};
