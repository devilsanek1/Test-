// S9_sky (S9 lane, G5b): the life that leads the scale hold (CINEMATIC_GUIDE Scale cues 11; docs/v3/s9_scale_plan.md
// section 2): a V of five birds in a size ladder crossing from the left edge at 1.85 s (flapping 3-4 Hz, one gliding;
// the two far ones smaller and paler), and the near snow that rushes past during the move. Screen coordinates.
import React from 'react';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {EMBER} from '../kit';

const f1 = (v: number) => v.toFixed(1);

type Bird = {dx: number; dy: number; size: number; color: string; w: number; hz: number; ph: number; glide?: boolean};
const BIRDS: Bird[] = [
  {dx: 0, dy: 0, size: 36, color: EMBER.ink, w: 3, hz: 3.4, ph: 0},
  {dx: -46, dy: -24, size: 31, color: EMBER.ink, w: 2.7, hz: 3.7, ph: 1.1, glide: true},
  {dx: -50, dy: 26, size: 29, color: EMBER.ink, w: 2.6, hz: 3.2, ph: 2.3},
  {dx: -96, dy: -46, size: 24, color: EMBER.roofs, w: 2.2, hz: 3.9, ph: 0.6},
  {dx: -104, dy: 50, size: 22, color: EMBER.roofs, w: 2.1, hz: 3.5, ph: 1.8},
];

/** The V (pointing right): from (-40, 610) toward (440, 700) at ~165 px/s (5.5 wingspans/s). */
export const S9Birds: React.FC<{at?: number}> = ({at = 1.85}) => {
  const t = useTime();
  if (t < at) return null;
  const k = t - at;
  const lead: [number, number] = [-40 + 165 * k, 610 + 31 * k + Math.sin(k * 2.2) * 3];
  const groups: Record<string, string> = {};
  const widths: Record<string, number> = {};
  for (const b of BIRDS) {
    const x = lead[0] + b.dx + Math.sin(k * 1.7 + b.ph) * 2;
    const y = lead[1] + b.dy + Math.sin(k * 2.3 + b.ph) * 2.5;
    const s = b.size / 2;
    // flap: the wing tips swing about the body; the glider holds its wings in a shallow V (a slow tilt only)
    const lift = b.glide ? s * (0.32 + 0.06 * Math.sin(k * 2)) : Math.sin(k * b.hz * Math.PI * 2 + b.ph) * s * 0.62;
    const mid = s * 0.32;
    const d = `M${f1(x - s)} ${f1(y - lift)}Q${f1(x - s * 0.42)} ${f1(y - mid - lift * 0.3)} ${f1(x)} ${f1(y)}Q${f1(x + s * 0.42)} ${f1(y - mid - lift * 0.3)} ${f1(x + s)} ${f1(y - lift)}`;
    const key = `${b.color}|${b.w}`;
    groups[key] = (groups[key] ?? '') + d;
    widths[key] = b.w;
  }
  return (
    <>
      {Object.entries(groups).map(([key, d]) => (
        <path key={key} d={d} fill="none" stroke={key.split('|')[0]} strokeWidth={widths[key]} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </>
  );
};

/** Near flakes (8-10 px) that rush past with the camera during the move, then fall gently in the hold. The camera's
 *  shift (1.2x the mid plane's) runs inside the wrap, so the flakes stream instead of jumping off. Kept out of the
 *  caption band's top (y < 625) and at most 6 px inside it. */
export const NearFlakes: React.FC<{p: number; n?: number}> = ({p, n = 14}) => {
  const t = useTime();
  const r = rng('s9/nearFlakes');
  const shiftX = (1 - p) * 1100;
  const shiftY = -(1 - p) * 360;
  const W = 1240;
  const H = 1500;
  let d = '';
  for (let i = 0; i < n; i++) {
    const x0 = r.range(0, W);
    const y0 = r.range(0, H);
    const v = r.range(70, 105);
    let rad = r.range(4, 5);
    const x = -80 + ((((x0 + shiftX + Math.sin(t * 0.9 + i) * 8) % W) + W) % W);
    const y = 625 + ((((y0 + v * t + shiftY) % H) + H) % H);
    if (y > 1940) continue;
    if (y < 640) rad = Math.min(rad, 3);
    d += `M${f1(x - rad)} ${f1(y)}a${f1(rad)} ${f1(rad)} 0 1 0 ${f1(2 * rad)} 0a${f1(rad)} ${f1(rad)} 0 1 0 ${f1(-2 * rad)} 0`;
  }
  return d ? <path d={d} fill={EMBER.snow} /> : null;
};
