// HAIR v4: the stills (docs/look/people_design/hair_v4/stills/, STILLS.md).
//   H4Cuts     01_cuts_v4.png     the six cuts, three views each, close and at film size, on the current heads
//   H4Shading  02_shading.png     her cut in the two shadings: crisp two-tone (direction C) and soft
//   H4Motion   03_motion_strips   a head turn, a walk and a gust, frames laid out on one image, frame numbers shown
// Each figure is the v3 body and LASH head with the v4 hair (people4.ts), drawn by Fig4 (render.tsx).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fig4} from './render';
import {person4, type Who} from './people4';
import {CUTS4, WEARS} from './cuts';
import {MOTIONS, motionState, type MotionKind} from './motion4';
import type {Shading} from './hair';
import type {View} from './cut';
import {REFS} from '../hair_v2/refs';

const FONT = 'Inter, DejaVu Sans, sans-serif';
const C = {bg: '#2E2F44', panel: '#4B4E6B', film: '#3B3D55', ink: '#F1ECE6', sub: '#BDB8C9', dim: '#8F8AA3', line: '#5C5F7E'};
const T: React.FC<{x: number; y: number; s?: number; w?: number; c?: string; a?: 'start' | 'middle' | 'end'; children: React.ReactNode}> = ({x, y, s = 22, w = 400, c = C.ink, a = 'start', children}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={s} fontWeight={w} fill={c} textAnchor={a}>
    {children}
  </text>
);

type FigSpec = {who: Who; view: View; cut: string; headYaw?: number; shading?: Shading; px?: number; motion?: {kind: MotionKind; t: number}; face?: 'lash' | 'edge'};
let UID = 0;
/** One figure in a box: the head's centre at (cx, cy) inside the box (fractions), u = px per head unit. */
const Box: React.FC<{x: number; y: number; w: number; h: number; f: FigSpec; u: number; cx?: number; cy?: number; bg?: string; r?: number}> = ({x, y, w, h, f, u, cx = 0.5, cy = 0.3, bg = C.panel, r = 10}) => {
  const id = `b${++UID}`;
  const M = f.motion ? MOTIONS[f.motion.kind] : null;
  const bob = M ? M.bob(f.motion!.t) : ([0, 0] as [number, number]);
  const fig = person4(f.who, {
    view: M ? M.view : f.view,
    cut: CUTS4[f.cut],
    headYaw: M ? M.headYaw(f.motion!.t) ?? f.headYaw : f.headYaw,
    shading: f.shading ?? 'soft',
    px: f.px ?? 900,
    bob,
    face: f.face,
    motion: M ? motionState(f.motion!.kind, f.who, f.motion!.t) : undefined,
  });
  const H = (u * 1000) / fig.hf.s; // the figure's drawn height for u px per head unit
  const sc = H / 1000;
  // the camera follows a walk sideways (the body stays in its cell) but not its bob
  const hx = fig.head[0];
  const hy = fig.head[1] - bob[1];
  const X = x + w * cx - hx * sc;
  const Y = y + h * cy - hy * sc;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={bg} />
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} rx={r} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <Fig4 fig={fig} x={X} y={Y + H} h={H} uid={id} />
      </g>
    </g>
  );
};
/** A full figure at a drawn height (px), standing on a line. */
const Stand: React.FC<{x: number; y: number; f: FigSpec; h: number}> = ({x, y, f, h}) => {
  const id = `s${++UID}`;
  const fig = person4(f.who, {view: f.view, cut: CUTS4[f.cut], headYaw: f.headYaw, shading: f.shading ?? 'soft', px: h, face: h < 200 ? 'edge' : 'lash'});
  return <Fig4 fig={fig} x={x} y={y} h={h} uid={id} />;
};
const Ref: React.FC<{x: number; y: number; w: number; h: number; id: keyof typeof REFS; label: string}> = ({x, y, w, h, id, label}) => {
  const r = REFS[id];
  const cid = `r${++UID}`;
  return (
    <g>
      <clipPath id={cid}>
        <rect x={x} y={y} width={w} height={h} rx={6} />
      </clipPath>
      <image href={r.src} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${cid})`} />
      <T x={x} y={y + h + 18} s={14} c={C.sub}>
        {label}
      </T>
    </g>
  );
};

const VIEWS: [View, number | undefined, string][] = [
  ['q', undefined, '3/4'],
  ['p', undefined, 'profile'],
  ['b', 14, 'from behind'],
];
const NAMES: Record<string, [string, string, string]> = {
  LONG: ['1  Long layers, curtain bangs', 'her (the lead), copper', 'a centre part; curtain panels; a face-framing layer in one broad S over the shoulder; two tips of different lengths'],
  LOB: ['2  The wavy lob', 'espresso', 'a deep side part; one big swoop across the forehead, out at the jaw; tucked behind the ear; flips of different sizes'],
  CLOUD: ['3  The natural coily cloud', 'black, deep skin', 'a round cloud 1.6x the skull, its edge a run of curl clumps radiating from the crown; a fringe of small coils; two loose coils'],
  PONY: ['4  The sleek ponytail', 'honey', 'smoothed back from a clean hairline (the ears show) into a tie at the crown; the tail one tapered S; two tendrils'],
  CROP: ['5  The men’s textured crop', 'black-brown', 'faded sides; a textured top with volume pushed forward into three tips of different sizes; two short tips at the crown'],
  FLOW: ['6  The men’s middle-part flow', 'dark brown', 'today’s curtains: a centre part with lift, two sections sweeping over the temples into flicks above the ears; a tapered nape'],
};
const REF_OF: Record<string, [keyof typeof REFS, string] | undefined> = {
  LONG: ['fall', 'ref 05, the long fall'],
  LOB: ['bob', 'ref 03, her bob (the bar)'],
  CLOUD: ['curls', 'ref 03, the sheet’s curls'],
  PONY: undefined,
  CROP: ['swept', 'ref 03, his swept crop'],
  FLOW: ['blue', 'ref 04, the leaf crop'],
};

// ---------------------------------------------------------------- 01: the six cuts
export const CUTS_W = 2400;
export const CUTS_H = 2965;
export const H4Cuts: React.FC = () => {
  UID = 0;
  const bw = 1170;
  const bh = 900;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={CUTS_W} height={CUTS_H} viewBox={`0 0 ${CUTS_W} ${CUTS_H}`}>
        <T x={30} y={62} s={44} w={700}>
          Hair v4: six designed cuts, built to animate
        </T>
        <T x={30} y={104} s={21} c={C.sub}>
          Each cut is a few AUTHORED shapes (cubic Béziers with few deliberate points: back, cap, front, 0-2 strands), one shadow shape and one highlight, a rim on the
        </T>
        <T x={30} y={132} s={21} c={C.sub}>
          silhouette and 1-3 thin flow lines, on the skull’s frame of the current LASH heads. Close: 3/4, profile, from behind. Below: the same at film size, 1:1 (200 px tall). Soft shading.
        </T>
        {WEARS.map(([cut, who], i) => {
          const bx = 20 + (i % 2) * (bw + 20);
          const by = 160 + Math.floor(i / 2) * (bh + 20);
          const [title, sub, note] = NAMES[cut];
          const ref = REF_OF[cut];
          return (
            <g key={cut}>
              <rect x={bx} y={by} width={bw} height={bh} rx={14} fill="#383A52" />
              <T x={bx + 18} y={by + 38} s={28} w={700}>
                {title}
              </T>
              <T x={bx + 18} y={by + 66} s={17} c={C.sub}>
                {sub}: {note}
              </T>
              {VIEWS.map(([v, hy, lab], j) => (
                <g key={v}>
                  <Box x={bx + 14 + j * 384} y={by + 84} w={372} h={560} f={{who, view: v, cut, headYaw: hy}} u={cut === 'LONG' || cut === 'PONY' ? 172 : 205} cy={cut === 'LONG' || cut === 'PONY' ? 0.26 : 0.34} />
                  <T x={bx + 14 + j * 384 + 14} y={by + 84 + 548} s={16} c={C.sub}>
                    {lab}
                  </T>
                </g>
              ))}
              <rect x={bx + 14} y={by + 656} width={ref ? 880 : bw - 28} height={230} rx={10} fill={C.film} />
              <T x={bx + (ref ? 880 : bw - 28)} y={by + 680} s={15} c={C.dim} a="end">
                film size 1:1 (200 px tall)
              </T>
              {VIEWS.map(([v, hy], j) => (
                <Stand key={v} x={bx + 160 + j * 250} y={by + 872} f={{who, view: v, cut, headYaw: hy}} h={200} />
              ))}
              {ref ? (
                <g>
                  <rect x={bx + 906} y={by + 656} width={250} height={230} rx={10} fill={C.film} />
                  <Ref x={bx + 924} y={by + 668} w={214} h={186} id={ref[0]} label={ref[1]} />
                </g>
              ) : null}
            </g>
          );
        })}
        <T x={30} y={CUTS_H - 22} s={20} c={C.sub}>
          Look at: is each a clean, stylish, appealing haircut a regular viewer would call good-looking? Volume round the skull, one flow, ends of different sizes turning one way?
        </T>
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 02: crisp vs soft
export const SHADE_W = 2400;
export const SHADE_H = 1560;
export const H4Shading: React.FC = () => {
  UID = 0;
  const rows: [Shading, string, string][] = [
    ['crisp', 'A  CRISP two-tone (direction C)', 'flat lit fill; the authored shadow shape and highlight as hard flat shapes; flow lines; the rim'],
    ['soft', 'B  SOFT (the pick)', 'one gentle ramp across the whole hair from the key; the same shadow and highlight shapes, soft-edged; flow lines; the same rim'],
  ];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={SHADE_W} height={SHADE_H} viewBox={`0 0 ${SHADE_W} ${SHADE_H}`}>
        <T x={30} y={62} s={44} w={700}>
          Two shadings on her cut
        </T>
        <T x={30} y={102} s={21} c={C.sub}>
          The same authored shapes, painted two ways. Close: 3/4, profile, from behind; right: film size 1:1 (200 px tall).
        </T>
        {rows.map(([sh, title, note], i) => {
          const y = 130 + i * 700;
          return (
            <g key={sh}>
              <T x={30} y={y + 34} s={28} w={700}>
                {title}
              </T>
              <T x={30} y={y + 62} s={17} c={C.sub}>
                {note}
              </T>
              {VIEWS.map(([v, hy, lab], j) => (
                <g key={v}>
                  <Box x={20 + j * 500} y={y + 80} w={488} h={600} f={{who: 'her', view: v, cut: 'LONG', headYaw: hy, shading: sh}} u={200} cy={0.27} />
                  <T x={34 + j * 500} y={y + 668} s={16} c={C.sub}>
                    {lab}
                  </T>
                </g>
              ))}
              <rect x={1520} y={y + 80} width={860} height={600} rx={10} fill={C.film} />
              {VIEWS.map(([v, hy], j) => (
                <g key={v}>
                  <Stand x={1660 + j * 290} y={y + 400} f={{who: 'her', view: v, cut: 'LONG', headYaw: hy, shading: sh}} h={200} />
                  <Stand x={1660 + j * 290} y={y + 660} f={{who: 'her', view: v, cut: 'LONG', headYaw: hy, shading: sh}} h={156} />
                </g>
              ))}
              <T x={1540} y={y + 112} s={15} c={C.dim}>
                film size 1:1: 200 px and 156 px tall
              </T>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 03: the motion strips
type Strip = {kind: MotionKind; who: Who; cut: string; title: string};
export const STRIPS: Strip[] = [
  {kind: 'turn', who: 'her', cut: 'LONG', title: 'TURN • her long layers: the head turns 3/4 → profile in 0.4 s (the drawings morph by the yaw); the layer lags, overshoots a little, settles'},
  {kind: 'turn', who: 'W4', cut: 'PONY', title: 'TURN • the ponytail: the tail swings out behind the turn and comes back'},
  {kind: 'walk', who: 'her', cut: 'LONG', title: 'WALK • her long layers, profile: from standing to 1.3 m/s (the camera tracks), the head bobbing twice a stride; the fall trails and bounces'},
  {kind: 'walk', who: 'W1', cut: 'LOB', title: 'WALK • the wavy lob, profile: the flips bounce with the steps, the swoop holds its shape'},
  {kind: 'gustb', who: 'her', cut: 'LONG', title: 'GUST • her long layers from behind: still air, a 2.5 m/s gust from the left rises, holds, dies away; the fall sweeps right and settles'},
  {kind: 'gust', who: 'W6', cut: 'CLOUD', title: 'GUST • the coily cloud, 3/4: the outer coils spring downwind and bounce back, the cloud keeps its shape'},
];
export const MOTION_W = 2400;
export const MOTION_H = 150 + STRIPS.length * 450 + 40;
export const H4Motion: React.FC = () => {
  UID = 0;
  const cw = 292;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={MOTION_W} height={MOTION_H} viewBox={`0 0 ${MOTION_W} ${MOTION_H}`}>
        <T x={30} y={62} s={44} w={700}>
          Motion strips: the same shapes, bent by the rig
        </T>
        <T x={30} y={102} s={21} c={C.sub}>
          Each piece is skinned to a chain of 4-6 bones; the chains are springs at 240 Hz (strength, shape, elasticity, damping, gravity, air), the head animated.
        </T>
        <T x={30} y={130} s={21} c={C.sub}>
          Eight frames per row at 60 fps (frame number and time under each). Read along a row: lag, overlap, settle; the shapes stay smooth (no kinks, no crossing).
        </T>
        {STRIPS.map((s, i) => {
          const y = 150 + i * 450;
          const M = MOTIONS[s.kind];
          const tall = s.cut === 'LONG' || s.cut === 'PONY';
          return (
            <g key={i}>
              <T x={30} y={y + 30} s={20} w={600}>
                {s.title}
              </T>
              {M.frames.map((t, j) => (
                <g key={j}>
                  <Box x={20 + j * (cw + 6)} y={y + 44} w={cw} h={368} f={{who: s.who, view: M.view, cut: s.cut, motion: {kind: s.kind, t}}} u={tall ? 128 : 150} cy={tall ? 0.24 : 0.32} />
                  <T x={20 + j * (cw + 6) + 12} y={y + 436} s={17} c={C.sub}>
                    {`f ${Math.round(t * 60)}  •  ${t.toFixed(2)} s`}
                  </T>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
