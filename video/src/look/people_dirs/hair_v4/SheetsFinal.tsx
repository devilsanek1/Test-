// PEOPLE v4 ASSEMBLED: the final stills (docs/look/people_design/hair_v4/final/, FINAL.md). The hair round's cuts
// (hair_v4) fitted to the faces round's heads and bodies (people_v4) and lit as one character (asm_people.ts).
//   P4Before  01_her_before_after.png  her as drawn now (direction C) beside the assembled v4: three views at 640 px,
//                                      film size; the heads beside ref 05, LASH beside the open-eye variant
//   P4Cast    02_cast.png              six people, the six cuts, women and men of different builds and heights:
//                                      close (busts, ref 03's bob beside our lob), standing together, film size
//   P4Motion  03_motion_strips.png     her turn, walk and gust (and three more cuts), eight frames a row
//   P4Scene   04_in_scene.png          the cast at film size in the dusk still, 2x crops, the frame at phone size
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {Figure} from '../graphic/Figure';
import {build as buildOld} from '../graphic_faces/cast';
import {REFS} from '../hair_v2/refs';
import {REFS4} from '../people_v4/refs';
import {PLATE_V6, PLATE_W, PLATE_H} from '../hair_v2/plate';
import {person5, CAST5, CAST_ORDER, type Opts5, type Who5} from './asm_people';
import {MOTIONS5, motion5, type Kind5} from './asm_motion';
import {placeSvg} from './asm_render';
import type {V2} from './bez';

const FONT = 'Inter, DejaVu Sans, sans-serif';
const C = {bg: '#2B2C41', panel: '#4A4D6A', panel2: '#41445F', film: '#3A3C54', ink: '#F3EEE8', sub: '#C2BDCE', dim: '#9590A8', ring: '#E6C78F'};
const T: React.FC<{x: number; y: number; s?: number; w?: number; c?: string; a?: 'start' | 'middle' | 'end'; children: React.ReactNode}> = ({x, y, s = 21, w = 400, c = C.sub, a = 'start', children}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={s} fontWeight={w} fill={c} textAnchor={a}>
    {children}
  </text>
);
const Raw: React.FC<{svg: string}> = ({svg}) => <g dangerouslySetInnerHTML={{__html: svg}} />;
let UID = 0;
const uid = (p: string) => `${p}${++UID}`;

type Pose = Pick<Opts5, 'pose' | 'bodyYaw' | 'headYaw'>;
const Q: Pose = {pose: 'stand', bodyYaw: -58, headYaw: 22};
const P: Pose = {pose: 'walk', bodyYaw: -90, headYaw: 0};
const L: Pose = {pose: 'stand', bodyYaw: 196, headYaw: 26};
const VIEWS: [Pose, string][] = [
  [Q, 'front 3/4'],
  [P, 'walking, profile'],
  [L, 'from behind (lost profile)'],
];

/** A standing person, soles at (x, y), h px tall. */
function stand(w: Who5, pose: Pose, x: number, y: number, h: number, extra: Partial<Opts5> = {}): string {
  const f = person5(w, {...pose, px: h, ...extra});
  return placeSvg(f.parts, uid('s'), x, y, h);
}
/** A bust in a box: the head's centre at (cx, cy) of the box (fractions), the skull `skull` px tall. */
function bust(w: Who5, pose: Pose, bx: number, by: number, bw: number, bh: number, skull: number, o: {cx?: number; cy?: number; bg?: string; extra?: Partial<Opts5>; ring?: boolean} = {}): string {
  const h = (skull * 1000) / 128;
  const f = person5(w, {...pose, px: h, ground: false, ...(o.extra ?? {})});
  const s = h / 1000;
  const bob = o.extra?.bob ?? [0, 0];
  const x = bx + bw * (o.cx ?? 0.5) - f.head[0] * s;
  const y = by + bh * (o.cy ?? 0.32) - (f.head[1] - bob[1]) * s + h;
  const ring = o.ring ? `<rect x="${bx + 1.5}" y="${by + 1.5}" width="${bw - 3}" height="${bh - 3}" rx="11" fill="none" stroke="${C.ring}" stroke-width="3"/>` : '';
  return `<svg x="${bx}" y="${by}" width="${bw}" height="${bh}" viewBox="${bx} ${by} ${bw} ${bh}" overflow="hidden"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12" fill="${o.bg ?? C.panel}"/>${placeSvg(f.parts, uid('b'), x, y, h)}</svg>${ring}`;
}
const RefImg: React.FC<{src: string; iw: number; ih: number; x: number; y: number; w: number; h: number}> = ({src, iw, ih, x, y, w, h}) => {
  const id = uid('r');
  const s = Math.max(w / iw, h / ih);
  return (
    <g>
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} rx={12} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill="#20212F" />
        <image href={src} x={x + (w - iw * s) / 2} y={y + (h - ih * s) / 2} width={iw * s} height={ih * s} />
      </g>
    </g>
  );
};
const Label: React.FC<{x: number; y: number; t: string; sub?: string; gold?: boolean}> = ({x, y, t, sub, gold}) => (
  <g>
    <T x={x} y={y} s={19} w={700} c={gold ? C.ring : C.ink}>
      {t}
    </T>
    {sub ? (
      <T x={x} y={y + 23} s={15} c={C.sub}>
        {sub}
      </T>
    ) : null}
  </g>
);

// ================================================================ 01: her, before and after
export const BEFORE_W = 2400;
export const BEFORE_H = 2010;
export const P4Before: React.FC = () => {
  UID = 0;
  const her = CAST5.her;
  const pw = 1160;
  const col = pw / 3;
  const panel = (x: number, after: boolean) => (
    <g>
      <rect x={x} y={160} width={pw} height={800} rx={16} fill={C.panel} />
      <T x={x + 24} y={204} s={30} w={800} c={after ? C.ring : C.ink}>
        {after ? 'AFTER (v4 assembled): the v4 hair on the v4 head and body' : 'BEFORE: her as drawn now (direction C, LASH)'}
      </T>
      {VIEWS.map(([pose, lab], i) => (
        <g key={i}>
          <T x={x + col * (i + 0.5)} y={244} s={18} a="middle">
            {lab}
          </T>
          {after ? <Raw svg={stand(her, pose, x + col * (i + 0.5), 935, 640)} /> : <Figure fig={buildOld('herEvening', (['q', 'p', 'b'] as const)[i], 'lash')} x={x + col * (i + 0.5)} y={935} h={640} uid={uid('o')} />}
        </g>
      ))}
      <rect x={x} y={980} width={pw} height={290} rx={16} fill={C.film} />
      <T x={x + 24} y={1014} s={17} c={C.dim}>
        film size, 1:1: 200 px and 156 px tall
      </T>
      {VIEWS.map(([pose], i) =>
        after ? (
          <g key={i}>
            <Raw svg={stand(her, pose, x + 150 + i * 150, 1245, 200)} />
            <Raw svg={stand(her, pose, x + 680 + i * 140, 1245, 156)} />
          </g>
        ) : (
          <g key={i}>
            <Figure fig={buildOld('herEvening', (['q', 'p', 'b'] as const)[i], 'lash')} x={x + 150 + i * 150} y={1245} h={200} uid={uid('o')} />
            <Figure fig={buildOld('herEvening', (['q', 'p', 'b'] as const)[i], 'lash')} x={x + 680 + i * 140} y={1245} h={156} uid={uid('o')} />
          </g>
        ),
      )}
    </g>
  );
  // the heads: ref 05 beside her profile; LASH beside the open-eye variant (looking away, never at us)
  const hy = 1330;
  const cw = 372;
  const ch = 500;
  const heads: {kind: 'ref' | 'v4'; pose?: Pose; eyes?: 'lash' | 'open'; t: string; sub: string; gold?: boolean}[] = [
    {kind: 'ref', t: 'REF 05: the blue-cliff woman', sub: 'the bar: delicate, soft, appealing'},
    {kind: 'v4', pose: P, eyes: 'lash', t: 'v4 PROFILE, LASH', sub: 'closed eyes (the direction now)', gold: true},
    {kind: 'v4', pose: P, eyes: 'open', t: 'v4 PROFILE, OPEN EYES', sub: 'looking ahead, never at us: your pick'},
    {kind: 'v4', pose: Q, eyes: 'lash', t: 'v4 3/4, LASH', sub: 'the hair frames the face', gold: true},
    {kind: 'v4', pose: Q, eyes: 'open', t: 'v4 3/4, OPEN EYES', sub: 'looking down-left, away'},
    {kind: 'v4', pose: L, eyes: 'lash', t: 'v4 LOST PROFILE', sub: 'the cheek and the lash peek past the fall'},
  ];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={BEFORE_W} height={BEFORE_H} viewBox={`0 0 ${BEFORE_W} ${BEFORE_H}`}>
        <T x={40} y={66} s={42} w={800} c={C.ink}>
          People v4, assembled: her before and after
        </T>
        <T x={42} y={104} s={20}>
          After: the hair round’s long layers with curtain bangs (designed shapes on a spring rig) fitted to the faces round’s head and body, lit as one character: one key from the upper left,
        </T>
        <T x={42} y={132} s={20}>
          soft gradients, the hair’s soft shadow on the forehead and the nape, the head’s shadow under the jaw, a rim on the hair and the shoulders; on a dusk ground (no pale-on-pale).
        </T>
        {panel(40, false)}
        {panel(1200, true)}
        {heads.map((c, i) => {
          const x = 40 + i * (cw + 18);
          return (
            <g key={i}>
              {c.kind === 'ref' ? (
                <RefImg src={REFS4.her05.src} iw={REFS4.her05.w} ih={REFS4.her05.h} x={x} y={hy} w={cw} h={ch} />
              ) : (
                <Raw svg={bust(her, c.pose!, x, hy, cw, ch, 250, {cy: c.pose === L ? 0.34 : 0.33, extra: {eyes: c.eyes}, ring: c.gold})} />
              )}
              <Label x={x + 4} y={hy + ch + 30} t={c.t} sub={c.sub} gold={c.gold} />
            </g>
          );
        })}
        <T x={42} y={BEFORE_H - 30} s={21} c={C.ink}>
          Look at: one clean, stylish cut that sits ON the head (the hairline, the ear, the nape)? A cute, delicate face framed by the hair? LASH or open eyes? Still her, but premium?
        </T>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ 02: the cast
export const CAST_W = 2400;
export const CAST_H = 1990;
const BUILD: Record<string, string> = {slim: 'slim', average: 'average', athletic: 'athletic', soft: 'soft'};
/** The value plan per figure (EVALUATION.md 4: the face >= 25 L* from its ground): light and mid skins on the dusk
 *  panel (L* 34), the deep skins on the same dusk lightened (L* 68): W6's face L* 31 -> 37 apart, M2's 43 -> 25. */
const GROUND: Record<string, string> = {W6: '#a2a4c1', M2: '#a2a4c1'};
export const P4Cast: React.FC = () => {
  UID = 0;
  const ids = CAST_ORDER;
  // close: the six busts in 3/4, ref 03's bob beside our lob
  const cw = 318;
  const ch = 440;
  const cells: ({kind: 'ref'} | {kind: 'p'; id: string})[] = [{kind: 'p', id: 'her'}, {kind: 'p', id: 'W1'}, {kind: 'ref'}, {kind: 'p', id: 'W6'}, {kind: 'p', id: 'W4'}, {kind: 'p', id: 'M1'}, {kind: 'p', id: 'M2'}];
  const yA = 170;
  // standing together at one scale: 4 px a cm
  const yB = 760;
  const ground = yB + 790;
  const k = 4;
  // film size
  const yC = ground + 60;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={CAST_W} height={CAST_H} viewBox={`0 0 ${CAST_W} ${CAST_H}`}>
        <T x={40} y={66} s={42} w={800} c={C.ink}>
          People v4, assembled: the cast (six cuts, six people)
        </T>
        <T x={42} y={104} s={20}>
          Women and men of different builds, heights and skins; each cut fitted to the v4 head (the hairline round the ear, the line behind it, the nape). Close: busts in 3/4,
        </T>
        <T x={42} y={132} s={20}>
          ref 03’s bob (the bar) beside our lob. Middle: all six at one scale (4 px a cm). Bottom: film size 1:1 (the tallest 200 px): 3/4, walking profile, from behind.
        </T>
        {cells.map((c, i) => {
          const x = 40 + i * (cw + 14);
          if (c.kind === 'ref')
            return (
              <g key={i}>
                <RefImg src={REFS4.girl03.src} iw={REFS4.girl03.w} ih={REFS4.girl03.h} x={x} y={yA} w={cw} h={ch} />
                <Label x={x + 4} y={yA + ch + 30} t="REF 03: her bob" sub="the bar for our lob" />
              </g>
            );
          const w = CAST5[c.id];
          return (
            <g key={i}>
              <Raw svg={bust(w, Q, x, yA, cw, ch, 205, {cy: w.cut === 'CLOUD' ? 0.36 : 0.34, ring: c.id === 'W1', bg: GROUND[c.id]})} />
              <Label x={x + 4} y={yA + ch + 30} t={w.label} sub={`${w.sex === 'f' ? 'woman' : 'man'}, ${BUILD[w.build]}, ${w.cm} cm`} gold={c.id === 'W1'} />
            </g>
          );
        })}
        {/* standing together */}
        <rect x={40} y={yB} width={2320} height={ground - yB + 20} rx={16} fill={C.panel} />
        {[150, 170, 190].map((cm) => (
          <g key={cm}>
            <path d={`M70 ${ground - cm * k}H2330`} stroke="#6E7192" strokeWidth={1.5} strokeDasharray="6 8" />
            <T x={74} y={ground - cm * k - 8} s={15} c={C.dim}>
              {`${cm} cm`}
            </T>
          </g>
        ))}
        {ids.map((id, i) => {
          const w = CAST5[id];
          return <Raw key={id} svg={stand(w, Q, 300 + i * 360, ground, w.cm * k)} />;
        })}
        {/* film size */}
        <rect x={40} y={yC} width={2320} height={300} rx={16} fill={C.film} />
        <T x={64} y={yC + 34} s={17} c={C.dim}>
          film size 1:1: each person in 3/4, walking profile, from behind (the tallest 200 px)
        </T>
        {ids.map((id, i) =>
          VIEWS.map(([pose], j) => {
            const w = CAST5[id];
            return <Raw key={`${id}${j}`} svg={stand(w, pose, 130 + i * 380 + j * 100, yC + 270, (200 * w.cm) / 188)} />;
          }),
        )}
        <T x={42} y={CAST_H - 30} s={21} c={C.ink}>
          Look at: would a regular viewer call each one a clean, current, good-looking haircut? Cute women, manly men, different builds? At film size: does each cut still read?
        </T>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ 03: motion strips
type Strip = {kind: Kind5; id: string; title: string};
const STRIPS: Strip[] = [
  {kind: 'turn', id: 'her', title: 'TURN • her: the head turns 3/4 → profile in 0.4 s; the face’s drawing swaps where the hair’s morph ends; the front layer lags, overshoots a little, settles'},
  {kind: 'walk', id: 'her', title: 'WALK • her, profile: from standing to 1.3 m/s (the camera tracks), the head bobbing twice a stride; the long fall trails and bounces'},
  {kind: 'gust', id: 'her', title: 'GUST • her from behind: still air, a 2.5 m/s gust from the left rises, holds, dies away; the fall sweeps right and settles'},
  {kind: 'turn', id: 'W4', title: 'TURN • the ponytail: the tail swings out behind the turn and comes back'},
  {kind: 'walk', id: 'W1', title: 'WALK • the lob, profile: the flips bounce with the steps, the swoop holds its shape'},
  {kind: 'gustq', id: 'W6', title: 'GUST • the coily cloud, 3/4: the outer coils give downwind and spring back, the cloud keeps its shape'},
];
export const MOTION_W = 2400;
export const MOTION_H = 160 + STRIPS.length * 450 + 30;
export const P4Motion: React.FC = () => {
  UID = 0;
  const cw = 292;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={MOTION_W} height={MOTION_H} viewBox={`0 0 ${MOTION_W} ${MOTION_H}`}>
        <T x={40} y={66} s={42} w={800} c={C.ink}>
          People v4, assembled: the motion strips
        </T>
        <T x={42} y={104} s={20}>
          The same designed shapes bent by the rig on the v4 heads: each hanging piece skinned to a chain of 4-6 bones, the chains springs at 240 Hz (strength, shape, damping, gravity, air).
        </T>
        <T x={42} y={132} s={20}>
          Eight frames a row at 60 fps (frame and time under each). Read along a row: the lag, the overlap, the settle; the shapes stay smooth; the cap never slides on the head.
        </T>
        {STRIPS.map((s, i) => {
          const y = 160 + i * 450;
          const M = MOTIONS5[s.kind];
          const w = CAST5[s.id];
          const tall = w.cut === 'LONG' || w.cut === 'PONY';
          return (
            <g key={i}>
              <T x={40} y={y + 28} s={19} w={600} c={C.ink}>
                {s.title}
              </T>
              {M.frames.map((t, j) => {
                const bob: V2 = M.bob(t);
                return (
                  <g key={j}>
                    <Raw svg={bust(w, M.pose(t), 20 + j * (cw + 6), y + 42, cw, 370, tall ? 124 : 142, {cy: tall ? 0.25 : 0.33, extra: {bob, motion: motion5(s.kind, w, t)}})} />
                    <T x={20 + j * (cw + 6) + 10} y={y + 436} s={16} c={C.sub}>
                      {`f ${Math.round(t * 60)}  •  ${t.toFixed(2)} s`}
                    </T>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ 04: the cast in the dusk still
export const SCENE_W = 2240;
export const SCENE_H = 2080;
type Placed = {id: string; pose: Pose; x: number; y: number; h: number};
// hair_v2's places (S4 v3), the heights scaled by each person's stature
const PLACED: Placed[] = [
  {id: 'W1', pose: Q, x: 222, y: 1074, h: 149},
  {id: 'M2', pose: L, x: 432, y: 1080, h: Math.round((169 * 188) / 182)},
  {id: 'W6', pose: Q, x: 372, y: 1388, h: 198},
  {id: 'W4', pose: L, x: 548, y: 1402, h: Math.round((212 * 174) / 172)},
  {id: 'M1', pose: P, x: 856, y: 1400, h: Math.round((218 * 182) / 178)},
  {id: 'her', pose: P, x: 684, y: 1083, h: 156},
];
const BREEZE: V2 = [520, -60];
const sceneSvg = (): string =>
  PLACED.slice()
    .sort((a, b) => a.y - b.y)
    .map((p) => {
      const w = CAST5[p.id];
      const walking = p.pose.pose === 'walk';
      // walkers feel their own headwind on top of the breeze
      const br: V2 = walking ? [BREEZE[0] + 540, BREEZE[1]] : BREEZE;
      return stand(w, p.pose, p.x, p.y, p.h, {breeze: br, contact: {color: '#4A2E2C', opacity: 0.45}});
    })
    .join('');
export const P4Scene: React.FC = () => {
  UID = 0;
  const crops = [
    {x: 160, y: 890, w: 560, h: 220, label: 'the quay and the lit doorway, 2x: her (156 px, walking) and two strangers'},
    {x: 320, y: 1150, w: 560, h: 280, label: 'the promenade, 2x: three strangers, 198-224 px'},
  ];
  const figs = sceneSvg();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Img src={PLATE_V6} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
      <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
        <T x={30} y={60} s={40} w={800} c={C.ink}>
          People v4, assembled: the cast in our dusk still
        </T>
        <T x={32} y={98} s={20}>
          The painted still v6 at dusk. Her and five strangers in the v4 cuts on the v4 heads and bodies, one breeze from the left (the walkers feel their own headwind). Left: the frame 1:1.
        </T>
        <svg x={30} y={130} width={PLATE_W} height={PLATE_H} viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}>
          <image href={PLATE_V6} x={0} y={0} width={PLATE_W} height={PLATE_H} />
          <Raw svg={figs} />
        </svg>
        {crops.map((c, i) => {
          const y = i === 0 ? 130 : 130 + 2 * crops[0].h + 60;
          const sc = 1060 / 1120;
          return (
            <g key={i}>
              <svg x={1150} y={y} width={c.w * 2 * sc} height={c.h * 2 * sc} viewBox={`${c.x} ${c.y} ${c.w} ${c.h}`}>
                <image href={PLATE_V6} x={0} y={0} width={PLATE_W} height={PLATE_H} />
                <Raw svg={sceneSvg()} />
              </svg>
              <T x={1150} y={y + c.h * 2 * sc + 26} s={19}>
                {c.label}
              </T>
            </g>
          );
        })}
        <svg x={1150} y={1220} width={360} height={640} viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}>
          <image href={PLATE_V6} x={0} y={0} width={PLATE_W} height={PLATE_H} />
          <Raw svg={sceneSvg()} />
        </svg>
        <T x={1530} y={1250} s={22} w={700} c={C.ink}>
          At phone size
        </T>
        <T x={1530} y={1282} s={18}>
          the frame 1080 px wide shown 360 px
        </T>
        <T x={1530} y={1308} s={18}>
          wide (a phone held at arm’s length)
        </T>
        {['Look at: at phone size, does each', 'head read as a clean, current cut', 'on a person (not a wig on a', 'mannequin)? Do they belong in the', 'scene’s light?'].map((t, i) => (
          <T key={i} x={1530} y={1370 + i * 26} s={19} c={C.ink}>
            {t}
          </T>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
