// S01 local stand-ins for GovernmentPlaza changes requested from the sets lane (fix round 2, docs/scenes/S01.md). Each
// one draws ON TOP of the set's own piece through the set's `wrap` layers (same world coords, same paths), so it can be
// dropped the moment the kit does the same thing:
//   S01FarCivic       the far civic skyline with a TWO-value dark step (far #A2C8B6 -> #6E9A88, nearer #84B09C ->
//                     #4E786A) and tealDark clock faces / lanterns once off (kit CIVIC_FILL steps only ~1.3:1: 'Europe'
//                     did not read on a phone). Same PLAZA_CIVIC geometry and left-to-right timing as the set.
//   LanternOff        a switched-off lantern = ink-dark glass + a one-frame squash pop (the kit steps cream -> sand,
//                     ~1.15:1): the lamp lantern on 'their', govB's dome lantern on 'PURPOSE'.
//   GovCShutter       govC's HALF shutter with the props RollerShutter's partial-drop jolt (`stopAt`: the kit's
//                     ShutterRig passes h x stop and no stopAt, so the half shutter bounced like a short full one), with
//                     its padlock and lettered tag (same props, seeds and rail offsets as the set's rigs).
import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, useTime} from '../../lib/time';
import {Fill} from '../../lib/Fill';
import {rectPath} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {GovEvents, HALF, PLAZA, PLAZA_CIVIC, SI} from '../shared/sets';
import {BackSoonTag, RollerShutter, ShutterPadlock} from '../shared/props';

// ---------------------------------------------------------------- far civic skyline, two-value dark step

/** [lit, dark] per tier (tier 0 = far, 1 = nearer). Lit = the kit's; dark = two haze values down (1.7:1 / 2.1:1), the
 *  two tiers still 1.6:1 apart when both are dark. */
export const S01_CIVIC_FILL: [string, string][] = [
  ['#A2C8B6', '#6E9A88'],
  ['#84B09C', '#4E786A'],
];

/** The set's FarCivic paths (GovernmentPlaza CIV, mirrored 1:1 from PLAZA_CIVIC). */
const CIV = (() => {
  const base = PLAZA.horizon + 4;
  const f = (n: number) => n.toFixed(1);
  return PLAZA_CIVIC.map((c) => {
    const {x0, x1, top, cx} = c;
    let d = '';
    let lantern = '';
    let face = '';
    if (c.kind === 'dome') {
      const rx = (x1 - x0) / 2 - 3;
      const ry = 30;
      const lanH = 18;
      const domeTop = top + lanH + 6;
      const drumTop = domeTop + ry;
      d =
        `M${f(x0)} ${base}L${f(x0)} ${f(drumTop + 5)}L${f(x0 - 3)} ${f(drumTop + 5)}L${f(x0 - 3)} ${f(drumTop)}` +
        `L${f(cx - rx)} ${f(drumTop)}A${f(rx)} ${ry} 0 0 1 ${f(cx + rx)} ${f(drumTop)}` +
        `L${f(x1 + 3)} ${f(drumTop)}L${f(x1 + 3)} ${f(drumTop + 5)}L${f(x1)} ${f(drumTop + 5)}L${f(x1)} ${base}Z` +
        `M${f(cx - 5)} ${f(domeTop + 3)}L${f(cx - 5)} ${f(top + 6)}L${f(cx)} ${f(top)}L${f(cx + 5)} ${f(top + 6)}L${f(cx + 5)} ${f(domeTop + 3)}Z`;
      lantern = rectPath(cx - 2.5, top + 8, 5, 9);
    } else if (c.kind === 'temple') {
      const corn = top + 22;
      d =
        `M${f(x0)} ${base}L${f(x0)} ${f(corn + 6)}L${f(x0 - 4)} ${f(corn + 6)}L${f(x0 - 4)} ${f(corn)}L${f(cx)} ${f(top)}` +
        `L${f(x1 + 4)} ${f(corn)}L${f(x1 + 4)} ${f(corn + 6)}L${f(x1)} ${f(corn + 6)}L${f(x1)} ${base}Z` +
        `M${f(x0 - 3)} ${f(corn + 46)}h${f(x1 - x0 + 6)}v6h${f(-(x1 - x0 + 6))}Z`;
    } else {
      const bel = top + 34;
      d =
        `M${f(x0 + 4)} ${base}L${f(x0 + 4)} ${f(bel + 6)}L${f(x0)} ${f(bel + 6)}L${f(x0)} ${f(bel)}L${f(cx)} ${f(top)}` +
        `L${f(x1)} ${f(bel)}L${f(x1)} ${f(bel + 6)}L${f(x1 - 4)} ${f(bel + 6)}L${f(x1 - 4)} ${base}Z`;
      const fy = bel + 26;
      face = `M${f(cx - 8)} ${f(fy)}a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z`;
    }
    return {...c, d, lantern, face};
  });
})();
const CIV_DRAW = CIV.map((c, i) => [c.tier, i] as const)
  .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  .map((q) => q[1]);
const LANTERN_IDX = CIV.map((c, i) => CIV.slice(0, i).filter((q) => 'lantern' in q && q.lantern).length);

/** Drawn in the set's 'far' layer AFTER its FarCivic (same paths): nothing until the first step (frame 0 = the set's
 *  own lit skyline, pixel-identical for S12's seam), then all six in the set's paint order with S01's dark values.
 *  `offAt` steps them left to right 0.06 s apart (= GovernmentPlaza civicOffAt); a lantern goes off at
 *  lanternsOffAt + its index x 0.06 (= civicLanternsOffAt) and shows tealDark glass. */
export const S01FarCivic: React.FC<{offAt: number; lanternsOffAt: number; seed?: string}> = ({offAt, lanternsOffAt, seed = 'plaza'}) => {
  const t = useTime();
  if (t < offAt) return null;
  return (
    <>
      {CIV_DRAW.map((i) => {
        const c = CIV[i];
        const dark = t >= offAt + i * 0.06;
        const [lit, drk] = S01_CIVIC_FILL[c.tier];
        const lantern = 'lantern' in c && c.lantern ? c.lantern : '';
        const lOff = lantern ? t >= lanternsOffAt + LANTERN_IDX[i] * 0.06 : false;
        return (
          <React.Fragment key={c.id}>
            <Fill d={c.d} color={dark ? drk : lit} offset={false} mode="none" seed={`${seed}/s01civ${i}`} />
            {c.face ? <Fill d={c.face} color={dark ? palette.tealDark : HALF.daySky} offset={false} mode="none" seed={`${seed}/s01civf${i}`} /> : null}
            {lantern ? <Fill d={lantern} color={lOff ? palette.tealDark : palette.cream} offset={false} mode="none" seed={`${seed}/s01civl${i}`} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- a lantern switching off

/** Ink-dark glass over a lantern's glass rect (inset inside its ink frame) from `at`, popping on with a one-frame
 *  squash (1.2 x 0.84 -> 1 in 0.1 s), plus one cream glint stroke like the dead screens. */
export const LanternOff: React.FC<{r: [number, number, number, number]; at: number; seed: string}> = ({r, at, seed}) => {
  const t = useTime();
  if (t < at) return null;
  const [x, y, w, h] = r;
  const u = clamp((t - at) / 0.1);
  const k = u < 1 ? 1 - E.outCubic(u) : 0;
  const sx = 1 + 0.2 * k;
  const sy = 1 - 0.16 * k;
  const g = Math.max(2.5, w * 0.16);
  const glint = `M${x + w * 0.2} ${y + h * 0.62}L${x + w * 0.42} ${y + h * 0.16}L${x + w * 0.42 + g} ${y + h * 0.16}L${x + w * 0.2 + g} ${y + h * 0.62}Z`;
  return (
    <XG m={mat.about(mat.scale(sx, sy), x + w / 2, y + h / 2)}>
      <Fill d={rectPath(x, y, w, h)} color={palette.ink} offset={false} mode="none" seed={`${seed}/g`} />
      <Fill d={glint} color={palette.cream} offset={false} mode="none" seed={`${seed}/gl`} />
    </XG>
  );
};
/** The lamp's glass (set: lanternRect [34, 1048, 32, 38] inside its ink rect [32, 1046, 36, 42]), inset 2 px. */
export const LAMP_GLASS: [number, number, number, number] = [PLAZA.lamp.x - 14, PLAZA.lamp.lantern[1] - 16, 28, 34];
/** govB's dome lantern glass (set: rect [508, 612, 20, 40] under the cap to (518, 600)), inset 3 px. */
export const DOME_GLASS: [number, number, number, number] = [511, 615, 14, 34];

// ---------------------------------------------------------------- govC: the half shutter with the partial-drop jolt

/** The set's WindowRig hardware for govC with a real partial drop: RollerShutter over the FULL window with `stopAt`
 *  (gravity fall 0.16 x sqrt(stop) s, then the 1-frame jolt +5 / -2 px), the padlock and the lettered tag hanging from
 *  the half rail (y + (stop - 1) x h, like the set). Same props / seeds as GovernmentPlaza's ShutterSlot / PadlockSlot
 *  / BackSoonSlot. Pass the set govC WITHOUT shutterAt / padlockAt / tagAt (keep shutterStop: the set then draws only
 *  the rolled-up box, which this redraws identically on top). */
export const GovCShutter: React.FC<{ev: GovEvents; seed?: string}> = ({ev, seed = 'plaza'}) => {
  const g = PLAZA.gov.govC;
  const [x, y, w, h] = g.window;
  const stop = clamp(ev.shutterStop ?? ev.stopAt ?? 1, 0.05, 1);
  const dy = (stop - 1) * h;
  return (
    <>
      <RollerShutter x={x} y={y} w={w} h={h} box={18} slamAt={ev.shutterAt} stopAt={stop} width={SI.mid} seed={`${seed}/govC/sh`} />
      {ev.tagAt !== undefined ? <BackSoonTag x={g.tag[0]} y={g.tag[1] + dy} at={ev.tagAt} tapAt={ev.tagTapAt} seed={`${seed}/govC/tag`} {...ev.tagProps} /> : null}
      {ev.padlockAt !== undefined ? <ShutterPadlock x={g.padlock[0]} y={g.padlock[1] + dy} size={28} at={ev.padlockAt} glintAt={ev.glintAt} seed={`${seed}/govC/pl`} {...ev.padlockProps} /> : null}
    </>
  );
};
