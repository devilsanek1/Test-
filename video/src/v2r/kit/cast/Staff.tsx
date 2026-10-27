// K4 cast: Google's staff (TREATMENT section 3, V11: a few, unnamed, faceless) and the S2 bench.
//   <StaffWindow {...spot} seed="W2" lightAt={8.96} backAt={10.26} blind={[{t: 10.26, k: 0.5}, {t: 12.2, k: 1}]} />
//     one of S2's five staff windows: the pane turns a cooler white, a standing silhouette pops in, steps back on
//     "scared", the blind drops (to half, then W2 fully down). Spot = centre + size (map.ts S2.staffWindows).
//   <Blind x y w h keys={[{t, k}]} />        the blind rig alone (Venetian slats, bottom rail, cord; drops with a bounce)
//   <StaffWindows />                          all five, timed from map.ts S2 (lanes may place them one by one instead)
//   <Staffer x={712} y={1150} h={190} />      the bench staffer: slate coat, auburn hair, plain lanyard; turns to the
//                                             reporter at 9.48; the hood goes up at 10.36 (a whole-head shape change)
//   <Reporter x={615} y={1150} h={168} />     a small seated back: satchel, notebook (opens 9.48, claps shut 12.85)
// Never a row, a crowd or a count; no Google figure in Washington; backs only.

import React, {useId} from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {ExitSync} from '../../../lib/exit';
import {clamp, ease, useTime} from '../../../lib/time';
import {CM} from '../../palette';
import {S2} from '../../world/map';
import {Model} from './body';
import {Person, Seated} from './People';
import {Traits} from './traits';
import {tieredAll} from '../tiers';

/** Silhouette colour of the staff (a cool slate against the cooler white panes). */
export const STAFF_SIL = CM.paneUnlit;
/** The staff windows' "cooler white" (from lamp-warm to cool). */
export const STAFF_PANE = CM.glass;
/** The blind fabric. */
export const BLIND = CM.stoneShade;

export type BlindKey = {t: number; k: number};

/** Blind drop 0..1 at time t from keys (each key drops over `dur` with an ease-out and a small bounce). */
export function blindAt(t: number, keys: BlindKey[], dur = 0.16): number {
  let k = 0;
  for (const key of keys) {
    if (t < key.t) break;
    const u = clamp((t - key.t) / dur);
    const from = k;
    const bounce = u >= 1 ? Math.sin(Math.min(1, (t - key.t - dur) / 0.18) * Math.PI) * 0.035 * Math.exp(-(t - key.t - dur) * 6) : 0;
    k = from + (key.k - from) * ease.outCubic(u) - (u >= 1 ? bounce * Math.sign(key.k - from) : 0);
  }
  return clamp(k);
}

export type BlindProps = {
  /** Pane rect: top-left x, y and size. */
  x: number;
  y: number;
  w: number;
  h: number;
  keys: BlindKey[];
  color?: string;
  seed?: string;
};

/** A Venetian blind dropping inside a pane: slats as hair lines, an ink bottom rail, a cord. */
const BlindBody: React.FC<BlindProps> = ({x, y, w, h, keys, color = BLIND, seed = 'blind'}) => {
  const t = useTime();
  const k = blindAt(t, keys);
  if (k <= 0.005) return null;
  const bh = h * k;
  const rail = y + bh;
  const gap = Math.max(7, Math.min(13, h / 12));
  let slats = '';
  for (let yy = y + gap; yy < rail - 2; yy += gap) slats += `M${(x + 2).toFixed(1)} ${yy.toFixed(1)}L${(x + w - 2).toFixed(1)} ${(yy + 0.6).toFixed(1)}`;
  const cx = x + w * 0.82;
  return (
    <g>
      <Fill rect={[x, y, w, bh]} color={color} offset={false} seed={`${seed}/f`} />
      {slats ? <Ink d={slats} width={1.1} color={CM.shadeCool} taper={false} seed={`${seed}/s`} /> : null}
      <Ink d={`M${(x - 2).toFixed(1)} ${rail.toFixed(1)}L${(x + w + 2).toFixed(1)} ${(rail + 0.5).toFixed(1)}`} width={2.6} taper={false} seed={`${seed}/r`} />
      <Ink d={`M${cx.toFixed(1)} ${rail.toFixed(1)}L${cx.toFixed(1)} ${(rail + Math.min(26, h * 0.18)).toFixed(1)}`} width={1.1} taper={false} seed={`${seed}/c`} />
    </g>
  );
};
export const Blind = tieredAll('support', {lines: true}, BlindBody);

export type StaffWindowProps = {
  /** Pane CENTRE and size (map.ts Spot). */
  x: number;
  y: number;
  w: number;
  h: number;
  seed: string;
  /** "staff" (8.96): the pane turns a cooler white and the silhouette pops in. */
  lightAt?: number;
  /** "scared": the silhouette steps back (smaller, deeper in the room) over 0.3 s. */
  backAt?: number;
  /** Blind keys (drop fractions). */
  blind?: BlindKey[];
  /** Draw the pane fill (default true). The window frame / mullions are the set's (K6 / the lane). */
  pane?: boolean;
  /** Pane colour before `lightAt` (default lamp-lit). */
  paneBefore?: string;
};

/** One staff window: the cooler pane, a standing silhouette cut by the sill, the step back, the blind. */
const StaffWindowBody: React.FC<StaffWindowProps> = ({x, y, w, h, seed, lightAt, backAt, blind = [], pane = true, paneBefore = CM.lamp}) => {
  const t = useTime();
  const uid = 'sw' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const x0 = x - w / 2;
  const y0 = y - h / 2;
  const on = lightAt === undefined || t >= lightAt;
  const back = backAt === undefined ? 0 : ease.inOutCubic(clamp((t - backAt) / 0.3));
  // the figure: a standing back (head + torso), cut by the sill; stepping back = smaller and a little higher
  const off = (seed.length * 37) % 11;
  const fx = x + (off - 5) * w * 0.035;
  // a standing back seen through the pane, cut by the sill: ~58 % of the figure shows; stepping back = smaller and
  // sinking behind the sill (we look up at the first storey from the towpath)
  const sc = 1 - 0.16 * back;
  const hb = h * 0.74 * sc - h * 0.05 * back;
  const H = ((h * 0.74) / 0.58) * sc;
  const sillY = y0 + h + 2;
  const feetY = sillY - hb + H;
  return (
    <ExitSync seed={`sw/${seed}`}>
      <defs>
        <clipPath id={uid}>
          <rect x={x0} y={y0} width={w} height={h} />
        </clipPath>
      </defs>
      {pane ? <Fill rect={[x0, y0, w, h]} color={on ? STAFF_PANE : paneBefore} offset={false} seed={`${seed}/pane`} mode="snap" /> : null}
      <g clipPath={`url(#${uid})`}>
        {on ? (
          <Person
            x={fx}
            y={feetY}
            h={H}
            exact
            seed={`staff/${seed}`}
            model={{mono: STAFF_SIL, coatLen: 'jacket'}}
            pose="stand"
            view="back"
            ink={0}
            exactFill
            lod={1}
            noSync
            at={lightAt}
            fillLag={0}
            fillMode="snap"
          />
        ) : null}
        <Blind x={x0} y={y0} w={w} h={h} keys={blind} seed={`${seed}/blind`} />
      </g>
    </ExitSync>
  );
};
export const StaffWindow = tieredAll('support', {lines: true}, StaffWindowBody);

/** S2's five staff windows, timed from the map (lights 0.04 s apart from 8.96; blinds to half 0.085 s apart from 10.26;
 *  W2 fully down at 12.20). `toScreen` maps a window spot through the shot's camera if the lane draws in screen space. */
const StaffWindowsBody: React.FC<{pane?: boolean}> = ({pane = true}) => (
  <>
    {S2.staffWindows.map((s, i) => {
      const keys: BlindKey[] = [{t: S2.blindsAt + i * S2.blindsStagger, k: 0.5}];
      if (s.id === 'W2') keys.push({t: S2.w2BlindDownAt, k: 1});
      return <StaffWindow key={s.id} {...s} seed={s.id} lightAt={S2.staffOnAt + i * S2.staffOnStagger} backAt={S2.blindsAt + i * S2.blindsStagger} blind={keys} pane={pane} />;
    })}
  </>
);
export const StaffWindows = tieredAll('support', {lines: true}, StaffWindowsBody);

// ---------------------------------------------------------------- the bench

/** The staffer's model sheet: slate coat, auburn hair, a plain lanyard, the hood down until it goes up. */
export const STAFFER: Partial<Traits> & Partial<Model> = {
  hair: 'short',
  hairColor: CM.hair[2],
  coat: CM.coatSlate,
  coatLen: 'mid',
  acc: 'none',
  skin: CM.brickLight,
  broad: 1.04,
  tall: 1,
  lanyard: CM.coatMustard,
  hoodDown: true,
};

export type StafferProps = {
  /** Seat line (canvas px). */
  x: number;
  y: number;
  /** Seated height (>= 180 px: the legibility floor). */
  h?: number;
  /** Turns toward the reporter (default 9.48) on this side (-1 = left, where map.ts seats the reporter). */
  turnAt?: number;
  toward?: 1 | -1;
  /** The hood goes up (default 10.36) over 0.2 s. */
  hoodAt?: number;
  at?: number;
  seed?: string;
};

const StafferBody: React.FC<StafferProps> = ({x, y, h = 190, turnAt = S2.notebookOpenAt, toward = -1, hoodAt = S2.hoodAt, at, seed = 'staffer'}) => {
  const t = useTime();
  const turn = toward * 0.7 * ease.inOutCubic(clamp((t - turnAt) / 0.25));
  const hood = clamp((t - hoodAt) / 0.2);
  return <Seated x={x} y={y} h={h} seed={seed} traits={STAFFER} model={{...STAFFER, hoodUp: hood > 0 ? ease.outCubic(hood) : undefined}} turn={turn} at={at} />;
};
export const Staffer = tieredAll('support', {lines: true}, StafferBody);

export const REPORTER: Partial<Traits> & Partial<Model> = {
  hair: 'crop',
  hairColor: CM.hair[0],
  coat: CM.coatOat,
  coatLen: 'mid',
  acc: 'none',
  skin: CM.brick,
  broad: 0.98,
  tall: 0.97,
  satchel: CM.brickDeep,
};

export type ReporterProps = {
  x: number;
  y: number;
  /** Seated height (a small back beside the staffer). */
  h?: number;
  openAt?: number;
  shutAt?: number;
  /** Which side the notebook is held on (+1 = toward the staffer on the right). */
  side?: 1 | -1;
  at?: number;
  seed?: string;
};

const ReporterBody: React.FC<ReporterProps> = ({x, y, h = 168, openAt = S2.notebookOpenAt, shutAt = S2.notebookShutAt, side = 1, at, seed = 'reporter'}) => {
  const t = useTime();
  let k = ease.outCubic(clamp((t - openAt) / 0.18));
  if (t >= shutAt) k = 1 - ease.inCubic(clamp((t - shutAt) / 0.08));
  return <Seated x={x} y={y} h={h} seed={seed} traits={REPORTER} model={REPORTER} notebook={k} side={side} at={at} />;
};
export const Reporter = tieredAll('support', {lines: true}, ReporterBody);

export {STAFF_SIL as STAFF_SILHOUETTE};
