// S08 "Counted from the announcement" (cut(ready) -> cut(day); 24.09-34.48 s on the take). PEAK 2 in two short doses with a
// baseline count between them (docs/storyboard_v3.md S08):
//   1. the CRANE (fixed 2.0 s, out(quart), multiplane) over our own rooftop parapet: an endless city of websites to the
//      horizon, the film's biggest sun (r260, half-set, two stepped glow rings); the hooded attempters are ALREADY at the
//      doors, rattling handles (not counted).
//   2. BASELINE dolly push (1.0 -> 1.15, sine) on 'Cloudflare ... forty-five minutes': a glass dome draws itself over ONE far
//      district (~1/5), the counter board rises on our parapet (L8 holds alone 1.7 s), the count starts at 'announced'
//      (start flag + L9a, hand-drawn tally gates, no digits), L9b footer; the sun hops up as a clock and sweeps the
//      45-minute wedge; stamp 1 (L10).
//   3. PAYOFF: on 'millions' the stipple floods the whole city and the camera pulls back to the vista; stamp 2 (L11); the
//      sun sets in two steps at screen x 700 (S09's sunrise point) while the sky steps golden -> sage dusk.
// Match-cut IN from S07 (its 0.40 s tilt): the three wires at screen y 896 / 928 / 960 and the sun at (640, 1021) r110
// half behind the skyline. Match-cut OUT to S09: the sun set at screen x 700 (S09's VP).
//
// Set: the shared DomeCity v3 (dome="district"), its layers mapped onto this scene's multiplane depths through `wrap`
// (scene08/layout.ts) with the scene's overlays injected per layer; the shared CounterBoard, LabelTag (in it),
// TelephoneWires (WIRES.S08, pole at x 540), Attempter, LeakSheet, Bit, SunGlowSteps, MinuteWedge.
import React, {useId} from 'react';
import {World, Sun, palette} from '../lib';
import {ease as E, lerp, prog, useTime as useTimeLocal} from '../lib/time';
import {Layer} from '../lib/cine/camera';
import type {CamKey} from '../lib/cine/camera';
import {ShotCam} from '../lib/ShotCam';
import type {SkyKey} from '../lib/World';
import {CounterBoard, counterBoardZones, MinuteWedge, SunGlowSteps} from './shared/props';
import {DomeCity, DOME, TelephoneWires, WIRES} from './shared/sets';
import {DUR, GATES_AT, T} from './scene08/times';
import {BOARD, copingY, depthOf, EXTRA_DOORS3, PIP, R2, R3} from './scene08/layout';
import {BitRide, clumps, CopySpec, GlintSweep, PaperSpecks, Pigeons, Pip, Rattler, RattlerSpec, RimCrowd, RimFig, specksAlong, splitDome, StampHit, Stipple, WindowWink, WireCopy} from './scene08/cast';
import {DeckClutter, ExtraDoors} from './scene08/extras';

// ---------------------------------------------------------------- camera (depth-0 plane = our parapet)

const DOLLY = 1 - 1 / 1.15; // the baseline push is a DOLLY: far rows grow less, the sky and the sun not at all

export const CAMERA: CamKey[] = [
  {t: 0, x: 540, y: 1260, zoom: 1.3, push: 0},
  // BIG MOVE 1: the multiplane crane, a fixed 2.0 s from the cut, entering at S07's tilt exit speed (out(quart))
  {t: T.craneEnd, x: 540, y: 960, zoom: 1, push: 0, ease: E.outQuart},
  {t: T.pushAt, x: 540, y: 960, zoom: 1, push: 0},
  // BASELINE: a slow dolly push toward the dome rim and the board over 'Cloudflare ... forty-five minutes'
  {t: T.pushEnd, x: 600, y: 1100, zoom: 1, push: DOLLY, ease: E.inOutSine},
  {t: T.pullAt, x: 600, y: 1100, zoom: 1, push: DOLLY},
  // PEAK again: pull back to the vista on 'millions' (a fixed 0.9 s)
  {t: T.pullEnd, x: 540, y: 960, zoom: 1, push: 0, ease: E.inOutSine},
  {t: DUR + 1, x: 540, y: 960, zoom: 1, push: 0},
];

// ---------------------------------------------------------------- sky: golden, then a STEPPED uniform dusk tween

const DUSK_STEPS = ['#A0C7B5', '#94BDAA', '#88B3A0', '#7CA995', '#709F8B'];
const SKY: SkyKey[] = [{t: 0, tod: 'golden'}, ...DUSK_STEPS.map((c, i): SkyKey => ({t: T.within + i * 0.15, color: c, wipe: 'snap', ...(i === 4 ? {tod: 'dusk' as const} : {})}))];

// ---------------------------------------------------------------- the sun (screen space, behind every row)

const SUN = {x: DOME.sunV3.x, y: DOME.sunV3.y, r: DOME.sunV3.r};
const SUN_MOVES = [
  // swells from the S07 match (640, 1021) r110 to the peak sun, half-set on the skyline, during the crane
  {at: 0.1, dur: 1.8, x: SUN.x, y: SUN.y, r: SUN.r, ease: E.inOutSine},
  // sinks back onto the horizon after the clock (the comma pause)
  {at: T.comma, dur: 0.4, y: SUN.y, ease: E.inOutSine},
  // the film's one sunset, in two steps (gone at screen x 700: S09's sunrise point)
  {at: T.within, dur: 0.16, y: 1130, ease: E.inCubic},
  {at: T.day, dur: 0.16, y: 1320, ease: E.inCubic},
];
// 'forty-five': the sun hops up 150 px (centre 850, top 590) and becomes a clock, landing on the word
const SUN_HOPS = [{t: T.fortyFiveWord - 0.2, to: [SUN.x, 850] as [number, number], h: 18, air: 0.22}];

const SunInSky: React.FC = () => (
  <>
    <SunGlowSteps cx={SUN.x} cy={SUN.y} r={SUN.r} at={T.settle} outAt={T.fortyFiveWord - 0.32} />
    <SunGlowSteps cx={SUN.x} cy={SUN.y} r={SUN.r} at={T.comma + 0.4} outAt={T.within} />
    <Sun cx={640} cy={1021} r={110} drift={[0, 0]} moves={SUN_MOVES} hops={SUN_HOPS} breathe={0.01}>
      {(r: number) => <MinuteWedge r={r} at={T.fortyFiveWord} dur={0.6} outAt={T.comma} seed="s8/wedge" />}
    </Sun>
  </>
);

// ---------------------------------------------------------------- the searchlight sweep (DomeCity v3: degrees BELOW the
// horizontal, pointing left at the dome; clamped -10..+25 by the set)

const SWEEP: [number, number][] = [
  [T.that, 10],
  [T.once, 2],
  [T.tens + 0.3, -8], // crosses the dome's crown
  [T.hacking + 0.4, 24], // sweeps back down, catching the groups at the rim
  [T.fortyFive, 8],
];
const sweepAngle = (t: number) => {
  if (t <= SWEEP[0][0]) return SWEEP[0][1];
  for (let i = 1; i < SWEEP.length; i++) {
    if (t <= SWEEP[i][0]) return lerp(SWEEP[i - 1][1], SWEEP[i][1], E.inOutSine(prog(t, SWEEP[i - 1][0], SWEEP[i][0] - SWEEP[i - 1][0])));
  }
  return 8 + 13 * Math.sin((t - T.fortyFive) * 1.5);
};

// ---------------------------------------------------------------- attempters

// row 3 (the near doors, 55-70 px): four on 'ALREADY', two more right after; two give up and hop on 'attempts'
const at3 = (i: number) => R3[i].x - R3[i].h * 0.16;
const RATTLERS3: RattlerSpec[] = [
  {x: at3(0), y: R3[0].y, h: R3[0].h, at: T.already, rattles: [T.already + 0.04, T.rattleA, T.thousands + 0.1, T.in + 0.1, T.millions, T.wave2 + 0.2], seed: 'r3a'},
  {x: at3(1), y: R3[1].y, h: R3[1].h, at: T.already + 0.05, rattles: [T.already + 0.09, T.itWas, T.thousands + 0.15, T.attempts + 0.42, T.comma, T.millions + 0.05], hop: {at: T.attempts, to: EXTRA_DOORS3[1].x - 10}, seed: 'r3b'},
  {x: at3(2), y: R3[2].y, h: R3[2].h, at: T.already + 0.1, rattles: [T.already + 0.14, T.rattleA + 0.05, T.thousands + 0.2, T.in, T.millions + 0.1, T.within + 0.3], seed: 'r3c'},
  {x: at3(3), y: R3[3].y, h: R3[3].h, at: T.already + 0.15, rattles: [T.already + 0.19, T.itWas + 0.06, T.tens + 0.2, T.attempts + 0.5, T.millions + 0.1], hop: {at: T.attempts + 0.08, to: EXTRA_DOORS3[2].x - 10}, seed: 'r3d'},
  {x: at3(4), y: R3[4].y, h: R3[4].h, at: T.already2, rattles: [T.already2 + 0.04, T.they + 0.1, T.thousands + 0.25, T.stamp1 + 0.1, T.millions + 0.15], seed: 'r3e'},
  {x: EXTRA_DOORS3[0].x - 10, y: EXTRA_DOORS3[0].y, h: 60, at: T.already2 + 0.06, rattles: [T.already2 + 0.1, T.they + 0.2, T.hacking, T.comma + 0.05, T.wave2], seed: 'r3f'},
  // 'more rattlers crowd row 3' (the second wave): a second rank behind the first, and two by Pip at the right
  {x: at3(0) + 26, y: R3[0].y - 1, h: 55, at: T.wave2, rattles: [T.wave2 + 0.04, T.day], seed: 'r3g'},
  {x: at3(2) + 30, y: R3[2].y - 1, h: 58, at: T.wave2 + 0.05, rattles: [T.within + 0.1], seed: 'r3h'},
  {x: 965, y: copingY(965) - 9, h: 58, at: T.wave2 + 0.08, rattles: [T.wave2 + 0.12, T.within + 0.2], seed: 'r3i'},
  {x: 1030, y: copingY(1030) - 9, h: 62, at: T.wave2 + 0.12, rattles: [T.day + 0.05], seed: 'r3j'},
];
// row 2 (doors across the whole width, 30-40 px) on 'trying': six doors, two of them with a second figure waiting
const RATTLERS2: RattlerSpec[] = [
  ...R2.map((q, i) => ({
    x: q.x - q.h * 0.16,
    y: q.y,
    h: q.h,
    at: T.trying + (i % 3) * 0.1 + Math.floor(i / 3) * 0.05,
    rattles: [T.trying + 0.04 + (i % 3) * 0.1, T.rattleA + i * 0.06, T.itWas + 0.3 + i * 0.05, T.tens + (i % 3) * 0.1, T.attempts + 0.2 + i * 0.04, T.millions + i * 0.03],
    seed: `r2_${i}`,
  })),
  {x: R2[0].x + 20, y: R2[0].y + 1, h: 33, at: T.trying + 0.22, rattles: [T.tens + 0.2], seed: 'r2_w0'},
  {x: R2[5].x + 22, y: R2[5].y + 1, h: 35, at: T.trying + 0.28, rattles: [T.attempts], seed: 'r2_w1'},
];
// the rim crowd at the dome's foot (counted: tapping the glass): 6 on 'they saw', 20 more in a ripple on 'thousands'
const RIM: RimFig[] = (() => {
  const out: RimFig[] = [];
  const foot = DOME.district.by + 2;
  for (let i = 0; i < 26; i++) {
    const first = i < 6;
    const x = first ? 214 + i * 18 : 192 + ((i - 6) / 19) * 226;
    const at = first ? T.they + i * 0.04 : T.thousands + ((i - 6) / 19) * 0.3;
    out.push({x, y: foot - (i % 3) * 2.5, h: 15 + ((i * 7) % 5), at, taps: [at + 0.02, T.in + (x - 188) / 900, T.stamp1Ring + ((i * 3) % 7) * 0.03, T.millions + (i % 5) * 0.05, T.within + (i % 4) * 0.08]});
  }
  return out;
})();

// ---------------------------------------------------------------- the stipple flood

const offBoard = (x: number) => x < BOARD.x0 - 8 || x > BOARD.x1 + 8;
const SPECKS = (() => {
  // 'use it': ~40 specks along the far streets (rows 0-1)
  const useIt = specksAlong('s8/u', 40, -40, 1120, 1062, 4.5, 6.5, T.useIt, 0.28, {jy: 14});
  // 'millions': hundreds in ONE frame across the whole city, inside and outside the dome, as packed crowds; a second
  // wave fills the far rows left to right
  const burstFar = clumps('s8/bf', 46, -60, 1140, 1020, 1100, 4.6, 7, [5, 10], T.millions, 0);
  const waveFar = clumps('s8/wf', 30, -60, 1140, 1015, 1095, 4.4, 6.6, [4, 9], T.wave2, 0.25, {order: 'ltr'});
  const burst2 = clumps('s8/b2', 20, -40, 1120, 1170, 1300, 9, 13, [4, 7], T.millions, 0);
  const wave2 = clumps('s8/w2', 9, -40, 1120, 1180, 1300, 9, 12, [3, 6], T.wave2 + 0.06, 0.2, {order: 'ltr'});
  const burst3 = clumps('s8/b3', 6, -20, 1100, 1438, 1442, 15, 19, [2, 3], T.millions, 0, {skip: (x) => !offBoard(x - 40) || !offBoard(x + 40) || (x > 860 && x < 980)});
  const far = splitDome([...useIt, ...burstFar, ...waveFar]);
  return {farIn: far.inside, farOut: far.outside, row2: [...burst2, ...wave2], row3: burst3};
})();

// the leaked copies landing in the far streets (paper specks)
const PAPER = [
  {x: 40, y: 1250, at: T.were + 0.3, s: 9},
  {x: 118, y: 1110, at: T.were + 0.38, s: 6},
  {x: 210, y: 1262, at: T.were + 0.45, s: 9},
  {x: 70, y: 1118, at: T.were + 0.5, s: 6},
  {x: 300, y: 1108, at: T.were + 0.56, s: 6},
  {x: 160, y: 1240, at: T.were + 0.62, s: 9},
];

// ---------------------------------------------------------------- the copies on the wires (S07 match) + Bit

const COPIES: CopySpec[] = [
  {wire: 0, x0: 128, speed: 150, unpegAt: T.were, seed: 's8/cp0'},
  {wire: 2, x0: 262, speed: 165, unpegAt: T.were + 0.16, seed: 's8/cp1'},
  {wire: 1, x0: 392, speed: 118, unpegAt: 2.62, seed: 's8/cp2'},
];
const BIT_COPY: CopySpec = {wire: 1, x0: 478, speed: 26, unpegAt: T.says + 0.35, seed: 's8/cp3'};

// ---------------------------------------------------------------- Pip (scale 0.75: the peak's tininess)

const PIP_KEYS = [
  {t: 0, pose: 'sit-back' as const, look: 0.25},
  {t: T.itWas, pose: 'sit-back' as const, look: -0.85},
  {t: T.itWas + 1.1, pose: 'sit-back' as const, look: -0.35},
  {t: T.tens + 0.15, pose: 'sit-back' as const, look: -0.9},
  {t: T.thousands + 0.2, pose: 'sit-back' as const, look: -0.5},
  {t: T.attempts + 0.1, pose: 'sit-back' as const, look: -0.95},
  {t: T.earsCover, pose: 'ears-cover' as const},
  {t: T.duskIdle, pose: 'sit-front' as const, expression: 'worried' as const},
];

// ---------------------------------------------------------------- the board (clipped above our coping: it stands behind it)

const BOARD_BOX: [number, number, number, number] = [BOARD.x0, BOARD.y0, BOARD.x1, BOARD.y1];
const AboveCoping: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const id = 'cp8' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const y = (x: number) => copingY(x) + 1;
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={`M-200 -2000H1300V${y(1300).toFixed(1)}L-200 ${y(-200).toFixed(1)}Z`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
};

// ---------------------------------------------------------------- dome glass + board zones (for the overlays)

const DOME_INTERIOR = (() => {
  const a = DOME.district;
  let d = '';
  for (let i = 0; i <= 48; i++) {
    const th = (Math.PI * i) / 48;
    d += `${i ? 'L' : 'M'}${(a.cx + Math.cos(th) * a.rx).toFixed(1)} ${(a.by - Math.sin(th) * a.ry).toFixed(1)}`;
  }
  return d + 'Z';
})();
const ZONES = counterBoardZones(BOARD_BOX);

/** Dashed empty stamp slots on the board (an empty form waiting): each is covered by its stamp when it slams. */
const EmptySlots: React.FC = () => (
  <>
    {ZONES.stamps.map((z, i) => (
      <SlotOutline key={i} box={z} from={T.board + 0.4} to={i ? T.stamp2 + 0.13 : T.stamp1 + 0.13} />
    ))}
  </>
);
const SlotOutline: React.FC<{box: [number, number, number, number]; from: number; to: number}> = ({box, from, to}) => {
  const t = useTimeLocal();
  if (t < from || t >= to) return null;
  const [x0, y0, x1, y1] = box;
  return <path d={`M${x0 + 6} ${y0 + 4}H${x1 - 6}V${y1 - 4}H${x0 + 6}Z`} fill="none" stroke={palette.ink} strokeWidth={1.4} strokeDasharray="7 7" strokeLinecap="round" />;
};

// ---------------------------------------------------------------- the layers

/** The set's peach horizon band, stepped toward sage with the dusk (storyboard layer 1: 'peach band (stepped to sage at
 *  dusk)'): it holds peach through the first steps (the last light), then snaps to a light sage band (two of the
 *  storyboard's dusk steps above the final sky) as the sun goes on 'day'. Drawn over the set's band (the sky layer)
 *  and, one more step lighter, inside the dome's glass. */
const DuskBand: React.FC<{glass?: boolean}> = ({glass}) => {
  const t = useTimeLocal();
  if (t < T.day) return null;
  const c = glass ? DUSK_STEPS[0] : DUSK_STEPS[2];
  const [y0, y1] = DOME.band;
  const node = <path d={`M-300 ${y0}H1400V${y1 + 2}H-300Z`} fill={c} />;
  return glass ? <g clipPath="url(#s8domeclip)">{node}</g> : node;
};

/** Overlays injected into the DomeCity v3 layers (by its layer names). */
const EXTRAS: Record<string, React.ReactNode> = {
  sky: <DuskBand />,
  domeGlass: (
    <>
      <defs>
        <clipPath id="s8domeclip" clipPathUnits="userSpaceOnUse">
          <path d={DOME_INTERIOR} />
        </clipPath>
      </defs>
      <DuskBand glass />
    </>
  ),
  row1: (
    <>
      <WindowWink x={46} y={1036} cols={5} rows={3} at={T.once + 0.05} size={5} />
      <Stipple specks={SPECKS.farOut} flickerAt={T.duskIdle} seed="s8/sf" />
      <Stipple specks={SPECKS.farIn} flickerAt={T.duskIdle} glass seed="s8/sfg" />
    </>
  ),
  dome: (
    <>
      <GlintSweep at={T.once} interior={DOME_INTERIOR} x0={130} x1={560} y={1060} L={190} />
      <RimCrowd figs={RIM} />
    </>
  ),
  row2: (
    <>
      <PaperSpecks spots={PAPER} />
      {RATTLERS2.map((r) => (
        <Rattler key={r.seed} {...r} />
      ))}
      <Stipple specks={SPECKS.row2} flickerAt={T.duskIdle} seed="s8/s2" />
    </>
  ),
  near: (
    <>
      <ExtraDoors />
      {RATTLERS3.map((r) => (
        <Rattler key={r.seed} {...r} />
      ))}
      <Stipple specks={SPECKS.row3} flickerAt={T.duskIdle} seed="s8/s3" />
    </>
  ),
  fg: (
    <>
      <DeckClutter />
      <Pigeons flyAt={T.trying} />
      <TelephoneWires spec={WIRES.S08} seed="s8/wires" />
      <AboveCoping>
        {COPIES.map((c) => (
          <WireCopy key={c.seed} {...c} />
        ))}
        <WireCopy {...BIT_COPY} />
      </AboveCoping>
      <AboveCoping>
        <CounterBoard
          box={BOARD_BOX}
          riseAt={T.board}
          header={['Cloudflare · sits in front', 'of about 1 in 5 websites']}
          headerSize={36}
          flagAt={T.announced}
          note={['counted from the', 'public announcement', 'attempts, not break-ins']}
          noteSize={27}
          gatesAt={GATES_AT}
          stamps={[
            {at: T.stamp1, text: 'first 45 min: tens of thousands'},
            {at: T.stamp2, text: 'millions · within a day'},
          ]}
          stampSize={31}
          footer={['Matthew Prince, Cloudflare CEO, on X', "Cloudflare's own count"]}
          footerAt={T.footer}
          footerSize={26}
          seed="s8/board"
        />
        <EmptySlots />
      </AboveCoping>
      <StampHit box={ZONES.stamps[0]} at={T.stamp1 + 0.4} dur={0.3} />
      <StampHit box={ZONES.stamps[1]} at={T.stamp2 + 0.4} dur={0.3} />
      <BitRide plan={{copy: BIT_COPY, hopAt: T.bitHop, land: [466, BOARD.y0], crawlAt: T.bitHop + 0.55, crawlTo: [ZONES.top[0] - 14, BOARD.y0], alertAt: T.millionsWord, cheers: [T.tens + 0.06, T.thousands + 0.06, T.attempts + 0.1], size: 20}} />
      <Pip plan={{hopAt: T.settle - 0.42, hopFrom: [1150, copingY(1150)], hopDur: 0.42, spot: PIP, keys: PIP_KEYS, scale: 0.75}} />
    </>
  ),
};

const wrap = (name: string, _nearness: number, node: React.ReactNode) =>
  // the sun is screen space (it only swells and sets: no parallax, no lens)
  name === 'sun' ? (
    node
  ) : (
    <Layer depth={depthOf(name)}>
      {node}
      {EXTRAS[name]}
    </Layer>
  );

const Scene08: React.FC = () => (
  <World stage="context" sky={SKY}>
    <ShotCam keys={CAMERA}>
      <DomeCity
        dome="district"
        wrap={wrap}
        sun={<SunInSky />}
        dotsAt={0.12}
        domeAt={T.cloudflare}
        domeDur={0.5}
        towerAt={T.says}
        searchAt={T.that}
        searchAngle={sweepAngle}
        footprintAt={false}
        duskAt={T.within}
        observer={false}
      />
    </ShotCam>
  </World>
);

export default Scene08;
