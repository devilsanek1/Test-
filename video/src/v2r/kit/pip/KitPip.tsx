// KitPip.tsx — the K5 character sheet for "towpath Pip": turnaround, every pose and action of TREATMENT section 3, the
// sizes 44-120 px, Pip against every ground colour of 10 Canal Mint, the draw-on and the un-build. A still at any
// frame (idle life runs with the frame time).
//   npx remotion still src/entry-v2r-pip.tsx KitPip <out.png> --frame=60 --scale=0.5 --gl=angle

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {captionFontStack, useCaptionFont} from '../../../lib/font';
import {useTime} from '../../../lib/time';
import {CM, GROUNDS} from '../../palette';
import {Pip, PipProps} from './Pip';
import {PipKey, PipTrack} from './PipTrack';
import {V2} from './geom';

export const SHEET = {w: 2160, h: 4560};

const Label: React.FC<{x: number; y: number; size?: number; anchor?: 'start' | 'middle'; children: React.ReactNode; colour?: string}> = ({x, y, size = 30, anchor = 'middle', children, colour = CM.ink}) => (
  <text x={x} y={y} fontFamily={captionFontStack} fontSize={size} fill={colour} textAnchor={anchor}>
    {children}
  </text>
);

const Band: React.FC<{y: number; h: number; fill: string; title: string; note?: string}> = ({y, h, fill, title, note}) => (
  <g>
    <rect x={0} y={y} width={SHEET.w} height={h} fill={fill} />
    <Label x={60} y={y + 56} size={44} anchor="start">
      {title}
    </Label>
    {note ? (
      <Label x={60} y={y + 98} size={26} anchor="start">
        {note}
      </Label>
    ) : null}
  </g>
);

type Cell = {label: string; pip?: Partial<PipProps>; track?: {keys: PipKey[]; at: number; facing?: PipProps['facing']; x?: number; y?: number}};

export const KitPip: React.FC = () => {
  useCaptionFont();
  const t = useTime() + 1.0;
  // ---------------- 1. turnaround (120 px)
  const turn: [string, PipProps['facing']][] = [
    ['front', 'front'],
    ['3/4 front', 'frontRight'],
    ['profile', 'right'],
    ['3/4 back', 'backRight'],
    ['back (the watcher)', 'back'],
    ['3/4 back L', 'backLeft'],
    ['profile L', 'left'],
    ['3/4 front L', 'frontLeft'],
  ];
  // ---------------- 2. poses + actions (96 px)
  const hopKeys = (style: 'tuck' | 'leap'): PipKey[] => [{t: 0.5, hop: {to: [-150, 0], height: style === 'leap' ? 120 : 70, style, dur: style === 'leap' ? 0.6 : 0.4}}];
  const poses: Cell[] = [
    {label: 'sit-watch (perch)', pip: {facing: 'back'}},
    {label: 'head follows: left', pip: {facing: 'back', look: -0.65}},
    {label: 'head follows: right', pip: {facing: 'back', look: 0.65}},
    {label: 'alert', pip: {facing: 'back', pose: 'alert', look: -0.25}},
    {label: 'ears-cover ("life")', pip: {facing: 'back', pose: 'earsCover', look: -0.45}},
    {label: 'ears down ("can\'t")', pip: {facing: 'back', pose: 'earsDown'}},
    {label: 'looks up (left)', pip: {facing: 'back', pose: 'lookUp', look: -0.45}},
    {label: 'looks up (right)', pip: {facing: 'back', pose: 'lookUp', look: 0.45}},
    {label: 'one ear flick ("veto")', track: {keys: [{t: 0, facing: 'back'}, {t: 0.5, flick: 'A'}], at: 0.54}},
    {label: 'crouch (before a hop)', track: {keys: hopKeys('tuck'), at: 0.44, facing: 'back'}},
    {label: 'hop: in the air', track: {keys: hopKeys('tuck'), at: 0.7, facing: 'back', x: 75, y: 40}},
    {label: 'leap: in the air', track: {keys: hopKeys('leap'), at: 0.8, facing: 'back', x: 75, y: 60}},
    {label: 'land (squash, ears flop)', track: {keys: [{t: 0, facing: 'back'}, {t: 0.2, hop: {to: [0, 0], height: 60, dur: 0.4}}], at: 0.66}},
    {label: 'rides a boat roof', pip: {facing: 'left', pose: 'ride', wind: 1}},
    {label: 'turns to us', pip: {facing: 'frontLeft'}},
    {label: 'ears-cover, from the front', pip: {facing: 'front', pose: 'earsCover'}},
  ];
  // ---------------- 3. sizes
  const sizes = [44, 60, 86, 96, 120];
  // ---------------- 4. grounds
  const groundNames = ['sky', 'skyHigh', 'bandGold', 'bandSunset', 'bandDusk', 'stucco', 'paving', 'limestone', 'glass', 'paper', 'brickLight', 'brick', 'brickDeep', 'sage', 'stoneShade', 'water', 'waterDeep'];
  const Y1 = 140;
  const Y2 = Y1 + 520;
  const Y3 = Y2 + 1040;
  const Y4 = Y3 + 560;
  const Y5 = Y4 + 1100;
  const Y6 = Y5 + 520;
  return (
    <AbsoluteFill style={{background: CM.paper}}>
      <svg width={SHEET.w} height={SHEET.h}>
        <Label x={60} y={92} size={64} anchor="start">
          towpath Pip · K5 character sheet (video 2, 10 Canal Mint)
        </Label>
        {/* 1 */}
        <Band y={Y1} h={520} fill={CM.sky} title="1 · turnaround at 120 px" note="one loose stroke per pose, open at the head top, the base and one ear root · fills 3 px right / 2 px down" />
        {turn.map(([lab, f], i) => (
          <g key={lab}>
            <Pip x={170 + i * 260} y={Y1 + 420} size={120} facing={f} t={t} seed={`turn${i}`} />
            <Label x={170 + i * 260} y={Y1 + 490}>
              {lab}
            </Label>
          </g>
        ))}
        {/* 2 */}
        <Band y={Y2} h={1040} fill={CM.stucco} title="2 · poses and actions at 96 px (TREATMENT section 3, Pip per shot)" note="the watcher is a 3/4 back view: we look over its shoulder at what it watches; one reaction per shot" />
        {poses.map((c, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const cx = 150 + col * 265;
          const cy = Y2 + 420 + row * 460;
          return (
            <g key={c.label}>
              <rect x={cx - 95} y={cy + 2} width={190} height={14} fill={CM.line} />
              {c.track ? (
                <PipTrack x={cx + (c.track.x ?? 0)} y={cy + (c.track.y ?? 0)} size={96} facing={c.track.facing} keys={c.track.keys.map((k) => (k.hop ? {...k, hop: {...k.hop, to: [cx + k.hop.to[0], cy + k.hop.to[1]] as V2}} : k))} t={c.track.at} seed={`pose${i}`} />
              ) : (
                <Pip x={cx} y={cy} size={96} t={t} seed={`pose${i}`} {...c.pip} />
              )}
              <Label x={cx} y={cy + 66} size={26}>
                {c.label}
              </Label>
            </g>
          );
        })}
        {/* 3 */}
        <Band y={Y3} h={560} fill={CM.bandGold} title="3 · sizes 44 / 60 / 86 / 96 / 120 px (the line stays ~3.4 px; 2.3 px at 44)" note="44 px = the S5 end frame's scale anchor; 86-120 px in every other shot" />
        {sizes.map((sz, i) => (
          <g key={sz}>
            <Pip x={140 + i * 200} y={Y3 + 420} size={sz} facing="back" look={-0.3} t={t} seed={`sz${i}`} />
            <Pip x={1180 + i * 200} y={Y3 + 420} size={sz} facing="frontRight" t={t} seed={`szf${i}`} />
            <Label x={140 + i * 200} y={Y3 + 490}>
              {`${sz} px`}
            </Label>
            <Label x={1180 + i * 200} y={Y3 + 490}>
              {`${sz} px`}
            </Label>
          </g>
        ))}
        {/* 4 */}
        <Band y={Y4} h={1100} fill={CM.paper} title={`4 · against every ground of 10 Canal Mint (body ${CM.pipBody}, dE76 >= 20 from all)`} />
        {GROUNDS.map((g, i) => {
          const col = i % 6;
          const row = Math.floor(i / 6);
          const x0 = 60 + col * 345;
          const y0 = Y4 + 130 + row * 320;
          return (
            <g key={g + i}>
              <rect x={x0} y={y0} width={330} height={290} fill={g} />
              <Pip x={x0 + 120} y={y0 + 230} size={96} facing={i % 2 ? 'back' : 'backLeft'} look={i % 3 === 0 ? -0.5 : 0.2} t={t + i * 0.37} seed={`g${i}`} />
              <Pip x={x0 + 265} y={y0 + 230} size={44} facing="back" t={t} seed={`gs${i}`} />
              <Label x={x0 + 10} y={y0 + 276} size={22} anchor="start">
                {`${groundNames[i] ?? ''} ${g}`}
              </Label>
            </g>
          );
        })}
        {/* 5 */}
        <Band y={Y5} h={520} fill={CM.sky} title="5 · draw-on (frame 0 / an entrance) and un-build (the loop seam): no opacity, ever" />
        {[0.12, 0.3, 0.45, 0.6, 0.8, 1].map((d, i) => (
          <g key={`d${i}`}>
            <Pip x={130 + i * 170} y={Y5 + 400} size={96} facing="back" draw={d} t={t} seed="draw" />
            <Label x={130 + i * 170} y={Y5 + 460} size={24}>
              {`draw ${d}`}
            </Label>
          </g>
        ))}
        {[0.1, 0.25, 0.4, 0.5, 0.6, 0.68].map((e, i) => (
          <g key={`e${i}`}>
            <Pip x={1130 + i * 170} y={Y5 + 400} size={96} facing="back" exit={e} t={t} seed="exit" />
            <Label x={1130 + i * 170} y={Y5 + 460} size={24}>
              {`un-build ${e}`}
            </Label>
          </g>
        ))}
        {/* 6 */}
        <Band y={Y6} h={SHEET.h - Y6} fill={CM.stucco} title="6 · the design" />
        <Pip x={300} y={Y6 + 560} size={300} facing="frontRight" t={t} seed="big" />
        <Pip x={720} y={Y6 + 560} size={300} facing="back" look={-0.35} t={t} seed="big2" />
        {[
          'a pebble-round elephant, no neck: a pebble body, a round head straight on it',
          'two big LEAF ears (two half-blades on a midrib): they fold along the midrib and flick',
          'a short trunk with one curl · a three-hair tuft through the head-top gap',
          'teddy-bear soles (one pad, three beans) · two haunch arcs from behind',
          'a short knitted mustard scarf, its two tails lifting in the canal wind',
          'contour: ONE loose continuous stroke, 2-3 gaps (head top, base, an ear root)',
          `body ${CM.pipBody} · shade ${CM.pipShade} (far ear, far legs) · inner ear ${CM.pipEar} · scarf ${CM.pipScarf} (all C* <= 25: tier B)`,
          'idle always: blink, ear fold-and-flick, breathing, scarf flutter, tuft, tail',
        ].map((s, i) => (
          <Label key={i} x={1000} y={Y6 + 180 + i * 50} size={30} anchor="start">
            {`· ${s}`}
          </Label>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
