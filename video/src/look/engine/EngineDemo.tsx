// The look test's engine demos (STUDY.md §10 build items 2, 3, 4; notes: docs/studies/2026-10-28_city_posters/test/
// ENGINE.md). One still per piece, drawn FROM the engine's own outputs (every colour and share on screen is computed
// by lib/depth, lib/gamut, lib/light and the pen at render time), so the still shows what the next lane gets:
//   DepthDemo    lib/depth: the float by 1/z against today's PARALLAX_K, the +5 ghost step, nearStep's floor, anchorTones
//   PaletteDemo  the 10b roles against v2's (src/look/poster_s1/palette_10b.ts) and lib/gamut siblings per fill role
//   LightDemo    lib/light FormShade per tier (A 0.56 / tuned to -22, B and C 0.20) and the pen's tier-A line flag
//                (props {outlines}: true = v2's line, false = the no-outline look)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {anchorTones, dE76, makeAtmosphere, nearPalette, nearStep, PARALLAX_K, PARALLAX_Z, parallaxK, parallaxProblems, PLANE_STEPS_GHOST, planeK, recede} from '../../lib/depth';
import {familyFor, FormShade, formStepOf, lch, Lit, makeRig, rectD, sunLight, tierFormFor, tintFamily, TIER_FORM_K, withTierForm} from '../../lib/light';
import {siblingProblems} from '../../lib/gamut';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {Tier} from '../../lib/tier';
import {PEN, setOutlines} from '../../lib/pen';
import {CM10B, CM_V2, LIGHT_SIBLINGS, problems10b, siblings10b, SIBLING_ROLES, TENB} from '../poster_s1/palette_10b';

const W = 1080;
const H = 1920;
const FONT = 'DejaVu Sans, Arial, sans-serif';
const INK = '#2B1B0A';
const PAPER = '#FBF7F0';
const r1 = (x: number) => (Math.round(x * 10) / 10).toFixed(1);
const r2 = (x: number) => (Math.round(x * 100) / 100).toFixed(2);

const T: React.FC<{x: number; y: number; s?: number; w?: number; c?: string; a?: 'start' | 'middle' | 'end'; children: React.ReactNode}> = ({x, y, s = 22, w = 400, c = INK, a = 'start', children}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={s} fontWeight={w} fill={c} textAnchor={a}>
    {children}
  </text>
);
const Sw: React.FC<{x: number; y: number; w: number; h: number; c: string; label?: string; dark?: boolean}> = ({x, y, w, h, c, label, dark}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={c} />
    {label ? (
      <T x={x + 6} y={y + h - 8} s={15} c={dark ?? lch(c).L < 55 ? '#FFFFFF' : INK}>
        {label}
      </T>
    ) : null}
  </g>
);

// ================================================================= lib/depth (item 2)

/** v2 S1's air (lib/sky horizonColor(S1_EVENING, SUN0.x)), its near props, its far brick. */
const S1_AIR = '#FDD6B8';
const NEAR_V2 = ['#EFD8C2', '#E3A88C', '#C9806A', '#A5604F', '#AFC4A8', '#5E6F86', '#36223A'];

export const DepthDemo: React.FC = () => {
  const ATM = makeAtmosphere({name: 'S1, the ghost step', air: S1_AIR, steps: PLANE_STEPS_GHOST});
  const planes = [-2, -1, 0, 1, 2, 3, 4, 5];
  const lintK = parallaxProblems([0, 1, 2, 3, 4]);
  const lintZ = parallaxProblems([0, 1, 2, 3, 4, 5], {table: PARALLAX_Z});
  // per object: each prop's own main colour into the band (ref = itself); per plane: the plane's main mass (the treads'
  // paving, ~70 % of the near plane's area) as the reference, one step for the whole plane
  const perObject = (c: string) => nearStep(c, -2, undefined, {maxL: 55});
  const perPlane = nearPalette([['#EFD8C2', 14], ...NEAR_V2.slice(1).map((c) => [c, 1] as const)], -2);
  const A = anchorTones(S1_AIR, 4, {shade: '#6F80A0'});
  const A0 = anchorTones(S1_AIR, 4);
  const G = anchorTones(ATM, 5);
  const bar = (x: number, y: number, k: number, c: string) => <rect x={x} y={y} width={Math.max(1, k * 300)} height={14} fill={c} />;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <T x={40} y={56} s={34} w={700}>lib/depth: the look test's engine (item 2)</T>
        <T x={40} y={92} s={19} c="#6B5A4A">every number below is computed by the engine at render time</T>
        {/* A: the float by 1/z */}
        <T x={40} y={150} s={24} w={700}>1. The float by 1/z: PARALLAX_Z (opt-in) vs PARALLAX_K (default, unchanged)</T>
        {planes.map((p, i) => {
          const y = 178 + i * 44;
          return (
            <g key={p}>
              <T x={40} y={y + 22} s={18}>{`plane ${p > 0 ? '+' : ''}${p}${p === 4 ? ' anchor' : p === 5 ? ' ghost' : ''}`}</T>
              {bar(250, y, parallaxK(p), '#C9A48A')}
              {bar(250, y + 18, parallaxK(p, PARALLAX_Z), '#3A5065')}
              <T x={570} y={y + 13} s={15} c="#8A6B55">{`K ${r2(parallaxK(p))}`}</T>
              <T x={570} y={y + 31} s={15} c="#3A5065">{`1/z ${r2(parallaxK(p, PARALLAX_Z))}  (${r1(12 * parallaxK(p, PARALLAX_Z))} px of a 12 px float)`}</T>
            </g>
          );
        })}
        <T x={40} y={545} s={17} c="#8A3A2A">{`PARALLAX_K lint: ${lintK.length} WARN (+0/+1 ${r2(PARALLAX_K[0] / PARALLAX_K[1])}x, +1/+2 ${r2(PARALLAX_K[1] / PARALLAX_K[2])}x: cards)`}</T>
        <T x={40} y={570} s={17} c="#2F5A3A">{`PARALLAX_Z lint: ${lintZ.length ? lintZ.join('; ') : 'OK'} (+0/+1 ${r2(0.6 / 0.24)}x, +1/+2 ${r2(0.24 / 0.1)}x, +2/+3 ${r2(0.1 / 0.04)}x)`}</T>
        {/* B: the ladder with the ghost */}
        <T x={40} y={630} s={24} w={700}>2. The ladder with the +5 ghost step (PLANE_STEPS_GHOST, k 0.87)</T>
        <rect x={40} y={650} width={1000} height={300} fill={S1_AIR} />
        <T x={52} y={672} s={15}>{`the air ${S1_AIR} (v2 S1)`}</T>
        {[0, 1, 2, 3, 4, 5].map((p, i) => {
          const x = 52 + i * 164;
          const brick = recede('#C9806A', p, ATM);
          const stucco = recede('#F4E4D2', p, ATM);
          const sage = recede('#AFC4A8', p, ATM);
          return (
            <g key={p}>
              <Sw x={x} y={690} w={150} h={70} c={brick} />
              <Sw x={x} y={764} w={150} h={50} c={stucco} />
              <Sw x={x} y={818} w={150} h={50} c={sage} />
              <T x={x} y={890} s={16} w={700}>{`+${p}  k ${r2(planeK(ATM, p))}`}</T>
              <T x={x} y={912} s={14}>{`brick dE ${r1(dE76(brick, S1_AIR))}`}</T>
              <T x={x} y={932} s={14}>{p === 5 ? 'ghost: <= 6 from the air' : `stucco ${r1(dE76(stucco, S1_AIR))}`}</T>
            </g>
          );
        })}
        {/* C: the near floor */}
        <T x={40} y={1000} s={24} w={700}>3. nearStep's floor: v2 S1's near props at plane -2</T>
        <T x={40} y={1028} s={16} c="#6B5A4A">{'row 1 as drawn (plane 0); row 2 nearStep(c, -2), as before (-10 L*); row 3 per object: nearStep(c, -2, atm, {maxL: 55}),'}</T>
        <T x={40} y={1050} s={16} c="#6B5A4A">{'each prop its own reference; row 4 per plane: nearPalette with the paving as its main mass (one step, internal steps kept, floor 16)'}</T>
        {NEAR_V2.map((c, i) => {
          const x = 40 + i * 143;
          const rows = [c, nearStep(c, -2), perObject(c), perPlane[c]];
          return (
            <g key={c}>
              {rows.map((v, j) => (
                <Sw key={j} x={x} y={1066 + j * 66} w={135} h={60} c={v} label={`L* ${r1(lch(v).L)}`} />
              ))}
            </g>
          );
        })}
        {/* D: the far anchor */}
        <T x={40} y={1360} s={24} w={700}>4. anchorTones(air, 4, {'{'}shade: CM.shadeCool{'}'}): something WAY further out</T>
        <rect x={40} y={1380} width={1000} height={420} fill={S1_AIR} />
        <path d="M40 1700 L140 1610 L250 1640 L380 1560 L520 1600 L640 1575 L780 1620 L900 1585 L1040 1630 L1040 1720 L40 1720 Z" fill={A.ghost} />
        <path d="M40 1720 L40 1660 L120 1660 L120 1630 L190 1630 L190 1590 L230 1590 L236 1500 L242 1590 L300 1590 L300 1645 L420 1645 L420 1620 L520 1620 L520 1655 L700 1655 L700 1630 L820 1630 L820 1665 L1040 1665 L1040 1720 Z" fill={A.body} />
        <path d="M236 1500 L242 1590 L300 1590 L300 1645 L270 1645 L270 1600 L236 1600 Z" fill={A.lit} />
        <rect x={40} y={1700} width={1000} height={20} fill={A.foot} />
        {[150, 330, 460, 600, 760, 900].map((x) => (
          <rect key={x} x={x} y={1676} width={10} height={8} fill={A.detail} />
        ))}
        <path d="M40 1800 L40 1712 L170 1712 L170 1690 L330 1690 L330 1722 L560 1722 L560 1700 L760 1700 L760 1718 L1040 1718 L1040 1800 Z" fill={recede('#C9806A', 2, ATM)} />
        <T x={52} y={1404} s={15}>{`body ${A.body} dE ${r1(A.dE.body)} | lit ${A.lit} | foot ${A.foot} (+${r1(lch(A.foot).L - lch(A.body).L)} L*) | ghost ${A.ghost} dE ${r1(A.dE.ghost)}`}</T>
        <T x={52} y={1426} s={15}>{`hue: the air's ${r1(lch(S1_AIR).h)} turned to ${r1(lch(A.body).h)} toward the cool shade; C* ${r1(lch(A.body).C)} (air ${r1(lch(S1_AIR).C)} +-4); problems: ${A.problems.length ? A.problems.join('; ') : 'none'}`}</T>
        <T x={52} y={1448} s={15}>{`no shade given: body ${A0.body} (the air's hue), dE ${r1(A0.dE.body)}; the ghost as the anchor (plane 5): ${G.body} dE ${r1(G.dE.body)}`}</T>
        <T x={52} y={1790} s={15} c="#FFFFFF">a nearer plane (+2 brick) crosses the anchor's base; tiny far roofs in its tone-on-tone detail</T>
        <T x={40} y={1860} s={17} c="#6B5A4A">Defaults unchanged: PARALLAX_K, PLANE_STEPS (+5 takes +4's 0.65), nearStep's relative steps; all of the above is opt-in.</T>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================= the 10b palette and lib/gamut (item 3)

const MOVED = ['sky', 'skyHigh', 'bandGold', 'stucco', 'limestone', 'paper', 'paving', 'water', 'waterDeep', 'sage', 'paneUnlit', 'stoneShade', 'coatOat', 'pavingShade', 'eaveShade'] as const;

export const PaletteDemo: React.FC = () => {
  const sib = siblings10b();
  const probs = problems10b();
  const v2 = CM_V2 as unknown as Record<string, string>;
  const tb = CM10B as unknown as Record<string, string>;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <T x={40} y={56} s={34} w={700}>10b Canal Mint, full range (item 3)</T>
        <T x={40} y={90} s={18} c="#6B5A4A">src/look/poster_s1/palette_10b.ts: v2's roles copied; 10b moves only L* and C* (every hue within 7 deg)</T>
        <T x={40} y={130} s={18} w={700}>role</T>
        <T x={300} y={130} s={18} w={700}>v2 (CM)</T>
        <T x={640} y={130} s={18} w={700}>10b (CM10B)</T>
        {MOVED.map((k, i) => {
          const y = 144 + i * 52;
          const a = v2[k];
          const b = tb[k];
          return (
            <g key={k}>
              <T x={40} y={y + 31} s={19}>{k}</T>
              {a ? <Sw x={300} y={y} w={320} h={46} c={a} label={`${a}  L* ${r1(lch(a).L)}  C* ${r1(lch(a).C)}`} /> : <T x={300} y={y + 31} s={16} c="#8A6B55">(new role)</T>}
              <Sw x={640} y={y} w={400} h={46} c={b} label={`${b}  L* ${r1(lch(b).L)}  C* ${r1(lch(b).C)}  h ${Math.round(lch(b).h)}`} />
            </g>
          );
        })}
        <T x={40} y={950} s={24} w={700}>lib/gamut siblings(role, 4, seed): 3-5 tints per fill role</T>
        <T x={40} y={976} s={16} c="#6B5A4A">{'hue +-8, L* +-4-10, C* +-3-6, dE76 8-14 from the role, >= 8 apart (calm lights 6), in the mask, no never band'}</T>
        {SIBLING_ROLES.map((k, i) => {
          const y = 992 + i * 64;
          const base = tb[k];
          const s = sib[k];
          const pr = siblingProblems(base, s, ['stucco', 'limestone', 'paving'].includes(k) ? LIGHT_SIBLINGS : {});
          return (
            <g key={k}>
              <T x={40} y={y + 36} s={18}>{k}</T>
              <Sw x={230} y={y} w={150} h={56} c={base} label="role" />
              {s.map((c, j) => (
                <Sw key={c} x={392 + j * 140} y={y} w={132} h={56} c={c} label={`dE ${r1(dE76(c, base))}`} />
              ))}
              <T x={960} y={y + 36} s={15} c={pr.length ? '#8A3A2A' : '#2F5A3A'}>{pr.length ? `${s.length} (${pr.length} note)` : 'OK'}</T>
            </g>
          );
        })}
        <T x={40} y={1720} s={20} w={700}>problems10b():</T>
        {(probs.length ? probs : ['none']).map((p, i) => (
          <T key={i} x={40} y={1750 + i * 26} s={17} c={probs.length ? '#8A3A2A' : '#2F5A3A'}>{p}</T>
        ))}
        <T x={40} y={1880} s={16} c="#6B5A4A">{`moved roles: ${Object.keys(TENB).length - 1}; the brick family, hero, anchor, pop, line, ink and caption box unchanged`}</T>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================= lib/light FormShade per tier + the line flag (item 4)

const WARM = '#8C5E6B'; // CM.shadeWarm: the canal's ONE tint family
const COOL = '#6F80A0'; // CM.shadeCool
const RIG = withTierForm(
  makeRig({
    name: 'demo, golden hour',
    key: sunLight({toward: 12, el: 36}),
    ground: 0.28,
    tints: tintFamily(WARM, {form: 0.2, cast: 0.28, contact: 0.48}, '#FFFFFF'),
    pool: ['#FBE6C2', '#FFF2D9'],
    surface: '#EFD8C2',
    form: {frac: 0.35},
  }),
  WARM,
);

type Obj = {name: string; color: string; x: number; w: number};
const OBJS: Obj[] = [
  {name: 'stucco', color: '#F4E4D2', x: 70, w: 270},
  {name: 'brick', color: '#C9806A', x: 405, w: 270},
  {name: 'the hero teal', color: '#0B8577', x: 740, w: 270},
];

export const LightDemo: React.FC<{outlines?: boolean}> = ({outlines = true}) => {
  setOutlines(outlines); // the demo shows both: one render per value (the flag is a film-wide setting)
  const rows: {tier: 'subject' | 'environment'; y: number; h: number; label: string}[] = [
    {tier: 'subject', y: 700, h: 330, label: 'tier A (subject): TIER_FORM_K.subject 0.56 of the family'},
    {tier: 'environment', y: 1250, h: 300, label: 'tier C (environment): 0.20, v2\'s TINT_CANAL strength'},
  ];
  return (
    <AbsoluteFill style={{background: '#C5DDD3'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect x={0} y={1100} width={W} height={H - 1100} fill="#E9DED3" />
        <T x={40} y={70} s={34} w={700}>lib/light FormShade per tier (item 4)</T>
        <T x={40} y={110} s={20}>{`the pen's tier-A line flag: PEN.outlines = ${String(PEN.outlines)} (${outlines ? "v2's line" : 'the no-outline look'})`}</T>
        <T x={40} y={146} s={17} c="#4A4038">one tint family (CM.shadeWarm; the cool family on cool surfaces: familyFor), multiplied; the key from the left,</T>
        <T x={40} y={170} s={17} c="#4A4038">the shade face on the right; dL* below = formStepOf on the role colour (C's fills are calmed by the pen)</T>
        <Lit rig={RIG}>
          {rows.map((row) => (
            <Tier key={row.tier} tier={row.tier}>
              <T x={40} y={row.y - 24} s={20} w={700}>{row.label}</T>
              {OBJS.map((o) => {
                const d = rectD(o.x, row.y, o.w, row.h);
                const base = familyFor(o.color, WARM, COOL);
                const k = row.tier === 'subject' ? (base === WARM ? TIER_FORM_K.subject : tierFormFor(o.color, base, -22)) : TIER_FORM_K.environment;
                return (
                  <g key={o.name}>
                    <Fill d={d} color={o.color} />
                    <Ink d={d} width={3.4} tone={o.color} />
                    <FormShade d={d} tier={row.tier} base={base} strength={row.tier === 'subject' && base !== WARM ? k : undefined} />
                    <T x={o.x} y={row.y + row.h + 30} s={17}>{`${o.name}: k ${r2(k)} ${base === WARM ? 'warm' : 'cool'}`}</T>
                    <T x={o.x} y={row.y + row.h + 54} s={17} w={700}>{`dL* ${r1(formStepOf(o.color, base, k))}`}</T>
                  </g>
                );
              })}
            </Tier>
          ))}
        </Lit>
        <Tier tier="environment">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Ink key={i} d={`M${120 + i * 120} 1700 L${120 + i * 120} 1800`} width={2.4} color="#5E4A44" thing />
          ))}
          <Ink d="M80 1700 L1000 1700" width={2.4} color="#5E4A44" thing />
        </Tier>
        <T x={40} y={1660} s={17} c="#4A4038">{'a railing drawn as a `thing` (it IS a line): kept in both looks'}</T>
        <T x={40} y={1860} s={17} c="#4A4038">{`stucco at 0.56 is ${r1(formStepOf('#F4E4D2', WARM, 0.56))}: tune the subject's main surface to -22 with tierFormFor (k ${r2(tierFormFor('#F4E4D2', WARM, -22))})`}</T>
      </svg>
    </AbsoluteFill>
  );
};
