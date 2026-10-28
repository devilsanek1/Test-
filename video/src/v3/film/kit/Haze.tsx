// kit/Haze.tsx (the v3 rework, WINDOW lane): ONE flat haze step for a far piece that must sit back (DIRECTION rule 2:
// "distance shows in colour: far planes lighter, cooler, less saturated"; CRAFT §b: tier C, low contrast). Every colour
// inside the group is mixed `k` of the way toward `color` (the sky's lowest colour: rule 6, "the far haze takes the
// sky's lowest colour"): out = in x (1 - k) + color x k, per channel in sRGB. It is a colour transform, never blur, a
// gradient or an opacity fade: flat fills stay flat and keep their exact edges, darks lift more than lights (contrast
// compresses like air), and a 2-step change of `k` (k/2 for 3 frames) moves a piece between its beat and its calm.
// k <= 0.001 draws the children bare (no filter). It is the GROUP form of CRAFT §f.2's plane step, for a kit piece whose
// inner colours a scene cannot pass (DataCenter's body, side, rows and snow line); a straight mix suits hues on the
// air's side only (the dusk blues): a warm hue across from the air would cross grey, so recolour such fills one by one
// with lib/depth.ts `recede` instead (it keeps their hue).
//   <Haze k={0.35} color={EMBER.skyLow}><DataCenter ... /></Haze>
import React, {useId} from 'react';

const rgb01 = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
};

export const Haze: React.FC<{k: number; color: string; children?: React.ReactNode}> = ({k, color, children}) => {
  const id = 'hz' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (!(k > 0.001)) return <>{children}</>;
  const kk = Math.min(1, k);
  const [r, g, b] = rgb01(color);
  const a = (1 - kk).toFixed(4);
  const v = `${a} 0 0 0 ${(kk * r).toFixed(4)} 0 ${a} 0 0 ${(kk * g).toFixed(4)} 0 0 ${a} 0 ${(kk * b).toFixed(4)} 0 0 0 1 0`;
  return (
    <>
      <defs>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={v} />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </>
  );
};

/** A 2-step value on a schedule (film seconds): 0 inside the windows, 1 outside, 0.5 for the 3 frames after each
 *  switch (never a fade). */
export function twoStepIn(T: number, windows: [number, number][]): number {
  const inW = (t: number) => windows.some(([a, b]) => t >= a && t < b);
  const a = inW(T);
  const b = inW(T - 0.05);
  return a && b ? 0 : !a && !b ? 1 : 0.5;
}

/** 0 before `t`, 0.5 for the 3 frames from `t`, 1 after (a 2-step switch at one moment). */
export const stepAt = (T: number, t: number): number => (T < t ? 0 : T < t + 0.05 ? 0.5 : 1);
