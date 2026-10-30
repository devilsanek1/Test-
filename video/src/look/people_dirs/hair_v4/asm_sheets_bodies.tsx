// PEOPLE v4, BODIES: the stills (docs/look/people_design/bodies_v4/stills/, STILLS.md). The new bodies (people_v4/
// body5.ts: poses, hands, clothes, proportions) under the v4 heads and hair, lit as one character (asm_bodies.ts).
//   B6Before  01_her_before_after.png  her: direction C now, the v4 stand-in body, the new body; three views at 640 px
//                                      and at film size
//   B6Cast    02_cast.png              the six people in their clothes and poses at one scale; their hands close; each
//                                      in three views at film size
//   B6Poses   03_poses.png             standing, walking, seated on a ledge, seated on the ground, leaning, each beside
//                                      its reference where one exists
//   B6Walk    04_walk_strip.png        her walk, eight frames of one cycle (and at film size)
//   B6Dev     a working sheet (the design desk; not a deliverable)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {person6, CAST6, CAST6_ORDER, PROPS, WALK6, walkMotion6, walkPhase, type Who6, type Opts6} from './asm_bodies';
import {person5, CAST5} from './asm_people';
import {placeSvg} from './asm_render';
import {stand5, walk5, ledge5, ground5, lean5, skel5, type Pose5} from '../people_v4/skel5';
import {Figure} from '../graphic/Figure';
import {build as buildOld} from '../graphic_faces/cast';
import {REFS4} from '../people_v4/refs';
import {REFS5} from '../people_v4/refs5';
import {cam, proj} from '../graphic/rig';
import {lerp3, add3, mul3, type V3} from '../graphic/geo';

const FONT = 'Inter, DejaVu Sans, sans-serif';
export const C6 = {bg: '#2B2C41', panel: '#4A4D6A', panel2: '#41445F', film: '#3A3C54', ink: '#F3EEE8', sub: '#C2BDCE', dim: '#9590A8', ring: '#E6C78F'};
export const T6: React.FC<{x: number; y: number; s?: number; w?: number; c?: string; a?: 'start' | 'middle' | 'end'; children: React.ReactNode}> = ({x, y, s = 21, w = 400, c = C6.sub, a = 'start', children}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={s} fontWeight={w} fill={c} textAnchor={a}>
    {children}
  </text>
);
export const Raw6: React.FC<{svg: string}> = ({svg}) => <g dangerouslySetInnerHTML={{__html: svg}} />;
let UID = 0;
export const uid6 = (p: string) => `${p}${++UID}`;
export const resetUid6 = () => {
  UID = 0;
};

/** A person placed: the body's floor (y 1000 in figure units) at screen y, h px for 1000 units; props (SVG in the
 *  same figure units) under it. */
export function fig6(w: Who6, o: Opts6, x: number, y: number, h: number, props = ''): string {
  const f = person6(w, {...o, px: o.px ?? h});
  const k = h / 1000;
  // a walk's travel moves the figure in its own units: the camera tracks it (the figure stays at x)
  const xx = x - (o.bob?.[0] ?? 0) * k;
  const svg = placeSvg(f.parts, uid6('f'), xx, y, h);
  if (!props) return svg;
  return `<g transform="translate(${x},${y - h}) scale(${k})">${props}</g>${svg}`;
}

export const DEV_W = 2400;
export const DEV_H = 1500;
export const B6Dev: React.FC = () => {
  resetUid6();
  const her = CAST6.her;
  const items: {w: Who6; pose: Pose5; yaw: number; label: string}[] = [
    {w: her, pose: stand5('f', {coat: true}), yaw: -58, label: 'stand 3/4'},
    {w: her, pose: walk5('f', 0.1), yaw: -90, label: 'walk profile'},
    {w: her, pose: stand5('f', {coat: true, headYaw: 26}), yaw: 196, label: 'back'},
    {w: CAST6.W1, pose: stand5('f', {arms: 'loose'}), yaw: -58, label: 'W1'},
    {w: CAST6.W6, pose: stand5('f', {arms: 'loose'}), yaw: -58, label: 'W6'},
    {w: CAST6.M1, pose: stand5('m', {}), yaw: -58, label: 'M1'},
  ];
  const h = 620;
  return (
    <AbsoluteFill style={{background: C6.bg}}>
      <svg width={DEV_W} height={DEV_H} viewBox={`0 0 ${DEV_W} ${DEV_H}`}>
        {items.map((it, i) => (
          <g key={i}>
            <rect x={20 + i * 395} y={20} width={385} height={700} rx={12} fill={C6.panel} />
            <Raw6 svg={fig6(it.w, {pose: it.pose, yaw: it.yaw, px: h}, 212 + i * 395, 690, h)} />
            <T6 x={30 + i * 395} y={50}>
              {it.label}
            </T6>
          </g>
        ))}
        {[
          {w: CAST6.W1, pose: ledge5('f'), yaw: -90, label: 'ledge', props: PROPS.ledge(330, -230, 420)},
          {w: CAST6.M2, pose: ground5('m'), yaw: 196, label: 'ground', props: PROPS.hill(-420, 420)},
          {w: CAST6.M1, pose: lean5('m'), yaw: -50, label: 'lean', props: PROPS.rail3(-50, 520, -96, -420, 380)},
          {w: CAST6.M2, pose: stand5('m', {arms: 'loose'}), yaw: -58, label: 'M2'},
          {w: CAST6.W4, pose: stand5('f', {arms: 'pockets'}), yaw: -58, label: 'W4'},
          {w: her, pose: walk5('f', 0.35), yaw: -90, label: 'walk passing'},
        ].map((it: {w: Who6; pose: Pose5; yaw: number; label: string; props?: string}, i) => (
          <g key={`b${i}`}>
            <rect x={20 + i * 395} y={760} width={385} height={700} rx={12} fill={C6.panel} />
            <svg x={20 + i * 395} y={760} width={385} height={700} viewBox={`${20 + i * 395} 760 385 700`} overflow="hidden">
              <Raw6 svg={fig6(it.w, {pose: it.pose, yaw: it.yaw, px: h}, 212 + i * 395, 1430, h, it.props)} />
            </svg>
            <T6 x={30 + i * 395} y={790}>
              {it.label}
            </T6>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ shared
/** The standing 3/4: the body at -44 (the coat's far panel shows as a band, the open front as a column), the head turned
 *  to the face's designed 3/4 (-36), never at us. */
const Q6 = {yaw: -44, head: 8};
const views6 = (w: Who6): {pose: Pose5; yaw: number; label: string}[] => {
  const coat = w.fit.outer?.kind === 'coat';
  return [
    {pose: stand5(w.sex, {coat, headYaw: Q6.head}), yaw: Q6.yaw, label: 'front 3/4, standing'},
    {pose: walk5(w.sex, 0.1), yaw: -90, label: 'walking, profile'},
    {pose: stand5(w.sex, {coat, headYaw: 26}), yaw: 196, label: 'from behind (lost profile)'},
  ];
};
const RefImg6: React.FC<{src: string; iw: number; ih: number; x: number; y: number; w: number; h: number; fit?: 'cover' | 'contain'}> = ({src, iw, ih, x, y, w, h, fit = 'cover'}) => {
  const id = uid6('r');
  const s = fit === 'cover' ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
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
const Label6: React.FC<{x: number; y: number; t: string; sub?: string; gold?: boolean}> = ({x, y, t, sub, gold}) => (
  <g>
    <T6 x={x} y={y} s={19} w={700} c={gold ? C6.ring : C6.ink}>
      {t}
    </T6>
    {sub ? (
      <T6 x={x} y={y + 23} s={15} c={C6.sub}>
        {sub}
      </T6>
    ) : null}
  </g>
);
const Title6: React.FC<{t: string; l1: string; l2?: string}> = ({t, l1, l2}) => (
  <g>
    <T6 x={40} y={66} s={42} w={800} c={C6.ink}>
      {t}
    </T6>
    <T6 x={42} y={104} s={20}>
      {l1}
    </T6>
    {l2 ? (
      <T6 x={42} y={132} s={20}>
        {l2}
      </T6>
    ) : null}
  </g>
);
/** the old v4 stand-in body (asm_people.ts person5), for the before/after */
function fig5(view: 'q' | 'p' | 'b', x: number, y: number, h: number): string {
  const pose = view === 'q' ? {pose: 'stand' as const, bodyYaw: -58, headYaw: 22} : view === 'p' ? {pose: 'walk' as const, bodyYaw: -90, headYaw: 0} : {pose: 'stand' as const, bodyYaw: 196, headYaw: 26};
  const f = person5(CAST5.her, {...pose, px: h});
  return placeSvg(f.parts, uid6('o'), x, y, h);
}

// ================================================================ 01: her, before and after
export const BEFORE6_W = 2880;
export const BEFORE6_H = 1390;
export const B6Before: React.FC = () => {
  resetUid6();
  const her = CAST6.her;
  const pw = 925;
  const col = pw / 3;
  const kinds: {k: 'old' | 'v4' | 'new'; t: string; gold?: boolean}[] = [
    {k: 'old', t: 'DIRECTION C NOW (LASH)'},
    {k: 'v4', t: 'v4 STAND-IN BODY (the hair round)'},
    {k: 'new', t: 'NEW: poses, hands, clothes', gold: true},
  ];
  const V = views6(her);
  const draw = (k: 'old' | 'v4' | 'new', j: number, x: number, y: number, h: number): string | React.ReactNode => {
    if (k === 'old') return <Figure fig={buildOld('herEvening', (['q', 'p', 'b'] as const)[j], 'lash')} x={x} y={y} h={h} uid={uid6('o')} />;
    if (k === 'v4') return <Raw6 svg={fig5((['q', 'p', 'b'] as const)[j], x, y, h)} />;
    return <Raw6 svg={fig6(her, {pose: V[j].pose, yaw: V[j].yaw, px: h}, x, y, h)} />;
  };
  return (
    <AbsoluteFill style={{background: C6.bg}}>
      <svg width={BEFORE6_W} height={BEFORE6_H} viewBox={`0 0 ${BEFORE6_W} ${BEFORE6_H}`}>
        <Title6
          t="People v4, bodies: her before and after"
          l1="Her evening look (N1: the long open coat over the light column of a knit tucked into wide trousers, pointed flats) on the new body: a pose with weight (contrapposto, the far hand in the coat's pocket),"
          l2="authored hands, the coat in two panels hanging straight from sloping shoulders, its open front showing the column; the v4 hair and face unchanged. Three views at 640 px, then film size."
        />
        {kinds.map((kd, i) => {
          const x = 40 + i * (pw + 15);
          return (
            <g key={i}>
              <rect x={x} y={150} width={pw} height={800} rx={16} fill={C6.panel} />
              <T6 x={x + 24} y={194} s={28} w={800} c={kd.gold ? C6.ring : C6.ink}>
                {kd.t}
              </T6>
              {(['front 3/4', 'walking, profile', 'from behind'] as const).map((lab, j) => (
                <g key={j}>
                  <T6 x={x + col * (j + 0.5)} y={232} s={17} a="middle">
                    {lab}
                  </T6>
                  {draw(kd.k, j, x + col * (j + 0.5), 920, 640)}
                </g>
              ))}
              <rect x={x} y={965} width={pw} height={300} rx={16} fill={C6.film} />
              <T6 x={x + 22} y={996} s={16} c={C6.dim}>
                film size 1:1: 200 px and 156 px tall
              </T6>
              {[0, 1, 2].map((j) => (
                <g key={j}>
                  {draw(kd.k, j, x + 105 + j * 125, 1235, 200)}
                  {draw(kd.k, j, x + 545 + j * 120, 1235, 156)}
                </g>
              ))}
            </g>
          );
        })}
        <T6 x={42} y={BEFORE6_H - 62} s={21} c={C6.ink}>
          Look at: a natural stance with weight and gesture (never stiff)? Hands that read as hands at 640 px and at film size (never paddles)? A coat with fit and fall, the column showing in the open front?
        </T6>
        <T6 x={42} y={BEFORE6_H - 32} s={21} c={C6.ink}>
          Slim, modern proportions (sloping shoulders, her waist and hips, slim wrists and ankles, the slender neck)? Still her: the same look, now premium?
        </T6>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ 02: the cast
export const CAST6_W = 2400;
export const CAST6_H = 1800;
/** each person's pose for the close row (one scale): weight on one leg, hands with a reason */
const castPose = (id: string): {pose: Pose5; yaw: number; note: string} => {
  const w = CAST6[id];
  switch (id) {
    case 'her':
      return {pose: stand5('f', {coat: true, headYaw: Q6.head}), yaw: Q6.yaw, note: 'contrapposto, a hand in the coat'};
    case 'W1':
      return {pose: walk5('f', 0.12), yaw: -60, note: 'walking, the arms against the legs'};
    case 'W6':
      return {pose: stand5('f', {arms: 'loose', headYaw: Q6.head}), yaw: Q6.yaw, note: 'standing, both arms loose'};
    case 'W4':
      return {pose: stand5('f', {arms: 'pockets', headYaw: Q6.head}), yaw: Q6.yaw, note: 'both hands in the pockets'};
    case 'M1':
      return {pose: stand5('m', {headYaw: Q6.head}), yaw: Q6.yaw, note: 'a hand in the pocket, the jacket open'};
    default:
      return {pose: stand5(w.sex, {arms: 'loose', headYaw: Q6.head}), yaw: Q6.yaw, note: 'standing, loose'};
  }
};
/** where a hand is (figure units): the wrist plus half the hand along its axis */
function handAt(w: Who6, pose: Pose5, yaw: number, side: 'l' | 'r'): [number, number] {
  const sk = skel5(w.sex, w.build, pose);
  const A = sk.arm[side];
  const H = sk.hand[side];
  const p: V3 = add3(A.wr, mul3(H.hd, sk.b.hand * 0.42));
  return proj(p, cam(yaw));
}
/** a close-up: the figure drawn at scale h, viewed through a box around a point (figure units) */
function closeUp(w: Who6, o: Opts6, at: [number, number], bx: number, by: number, bw: number, bh: number, h: number, props = ''): string {
  const k = h / 1000;
  // put `at` at the box's centre
  const x = bx + bw / 2 - at[0] * k;
  const y = by + bh / 2 - at[1] * k + h;
  return `<svg x="${bx}" y="${by}" width="${bw}" height="${bh}" viewBox="${bx} ${by} ${bw} ${bh}" overflow="hidden"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12" fill="${C6.panel}"/>${fig6(w, {...o, px: h}, x, y, h, props)}</svg>`;
}
export const B6Cast: React.FC = () => {
  resetUid6();
  const ids = CAST6_ORDER;
  const yA = 150;
  const k = 3.55;
  const floor = yA + 790;
  const hands: {id: string; pose: Pose5; yaw: number; side: 'l' | 'r'; t: string; props?: string}[] = [
    {id: 'her', pose: stand5('f', {coat: true, headYaw: Q6.head}), yaw: Q6.yaw, side: 'l', t: 'her: relaxed, from the coat sleeve'},
    {id: 'W6', pose: stand5('f', {arms: 'loose', headYaw: Q6.head}), yaw: Q6.yaw, side: 'l', t: 'the shirt: the bare forearm, the wrist'},
    {id: 'W1', pose: walk5('f', 0.12), yaw: -60, side: 'l', t: 'walking: the swing'},
    {id: 'W1', pose: ledge5('f'), yaw: -90, side: 'l', t: 'seated: on the knee', props: PROPS.ledge(330, -230, 420)},
    {id: 'M1', pose: lean5('m'), yaw: -50, side: 'l', t: 'him: gripping the rail', props: PROPS.rail3(-50, 520, -96, -420, 380)},
    {id: 'M2', pose: stand5('m', {arms: 'loose', headYaw: Q6.head}), yaw: Q6.yaw, side: 'l', t: 'him: loose, from the knit cuff'},
  ];
  const yH = floor + 130;
  const hw = 368;
  const hh = 260;
  const yC = yH + hh + 60;
  return (
    <AbsoluteFill style={{background: C6.bg}}>
      <svg width={CAST6_W} height={CAST6_H} viewBox={`0 0 ${CAST6_W} ${CAST6_H}`}>
        <Title6
          t="People v4, bodies: the cast in their clothes and poses"
          l1="Six people on the new body (fashion.md: N1 the long open coat; a knit and straight jeans; L1 the big shirt tucked; a tee and wide trousers; N5 the suede jacket and boots; a knit and dark jeans),"
          l2="each in a pose with weight, at one scale (3.55 px a cm, 150 / 170 / 190 cm marked). Middle: their hands close (the same figures drawn 1500 px tall). Bottom: each at film size, 3/4, walking, from behind."
        />
        <rect x={40} y={yA} width={2320} height={floor - yA + 20} rx={16} fill={C6.panel} />
        {[150, 170, 190].map((cm) => (
          <g key={cm}>
            <path d={`M70 ${floor - cm * k}H2330`} stroke="#6E7192" strokeWidth={1.5} strokeDasharray="6 8" />
            <T6 x={74} y={floor - cm * k - 8} s={15} c={C6.dim}>
              {`${cm} cm`}
            </T6>
          </g>
        ))}
        {ids.map((id, i) => {
          const w = CAST6[id];
          const cp = castPose(id);
          const x = 250 + i * 375;
          return (
            <g key={id}>
              <Raw6 svg={fig6(w, {pose: cp.pose, yaw: cp.yaw, px: w.cm * k}, x, floor, w.cm * k)} />
              <Label6 x={x - 160} y={floor + 48} t={w.label} sub={`${w.sex === 'f' ? 'woman' : 'man'}, ${w.build}, ${w.cm} cm`} />
              <T6 x={x - 160} y={floor + 94} s={15} c={C6.dim}>
                {cp.note}
              </T6>
            </g>
          );
        })}
        {hands.map((hd, i) => {
          const w = CAST6[hd.id];
          const at = handAt(w, hd.pose, hd.yaw, hd.side);
          const bx = 40 + i * (hw + 22.4);
          return (
            <g key={`h${i}`}>
              <Raw6 svg={closeUp(w, {pose: hd.pose, yaw: hd.yaw, px: 1500}, at, bx, yH, hw, hh, 1500, hd.props)} />
              <T6 x={bx + 6} y={yH + hh + 26} s={16} c={C6.sub}>
                {hd.t}
              </T6>
            </g>
          );
        })}
        <rect x={40} y={yC} width={2320} height={300} rx={16} fill={C6.film} />
        <T6 x={64} y={yC + 32} s={16} c={C6.dim}>
          film size 1:1: each person in 3/4, walking profile, from behind (the tallest 200 px)
        </T6>
        {ids.map((id, i) =>
          views6(CAST6[id]).map((v, j) => {
            const w = CAST6[id];
            const h = (200 * w.cm) / 188;
            return <Raw6 key={`${id}${j}`} svg={fig6(w, {pose: v.pose, yaw: v.yaw, px: h}, 130 + i * 380 + j * 100, yC + 270, h)} />;
          }),
        )}
        <T6 x={42} y={CAST6_H - 30} s={21} c={C6.ink}>
          Look at: natural poses with weight (nothing stiff)? Simple but real hands? Clothes with fit, fall and a few folds? Slim modern adults: her waist and hips, his V, sloping shoulders, slender necks?
        </T6>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ 03: the poses beside the references
export const POSES6_W = 2400;
export const POSES6_H = 1990;
export const B6Poses: React.FC = () => {
  resetUid6();
  const her = CAST6.her;
  const y1 = 150;
  const y2 = 1060;
  const H = 790;
  const fh = 600;
  type Cell = {kind: 'ref'; src: string; iw: number; ih: number; w: number; t: string; sub: string} | {kind: 'fig'; w: number; svg: (x: number, y: number) => string; t: string; sub: string; gold?: boolean};
  const fig = (who: Who6, pose: Pose5, yaw: number, props = '', dx = 0, h = fh): ((x: number, y: number) => string) => (x, y) => fig6(who, {pose, yaw, px: h}, x + dx, y, h, props);
  const row1: Cell[] = [
    {kind: 'ref', src: REFS5.stand03.src, iw: REFS5.stand03.w, ih: REFS5.stand03.h, w: 420, t: 'REF 03: standing', sub: 'weight, a slender neck, relaxed hands'},
    {kind: 'fig', w: 440, svg: fig(her, stand5('f', {coat: true, headYaw: Q6.head}), Q6.yaw), t: 'STANDING: contrapposto', sub: 'the weight on her right leg, a hand in the coat', gold: true},
    {kind: 'ref', src: REFS5.walk02.src, iw: REFS5.walk02.w, ih: REFS5.walk02.h, w: 360, t: 'REF 02: walking', sub: 'slim, tall, a bag under the arm'},
    {kind: 'fig', w: 460, svg: fig(her, walk5('f', 0.06), -90), t: 'WALKING: the contact', sub: 'the arms against the legs, the coat swings', gold: true},
    {kind: 'fig', w: 520, svg: fig(CAST6.M1, lean5('m'), -50, PROPS.rail3(-50, 520, -96, -460, 420), 30), t: 'LEANING on a rail (no reference)', sub: 'the seat on the rail, the ankles crossed, the head turned', gold: true},
  ];
  const row2: Cell[] = [
    {kind: 'ref', src: REFS5.ledge05.src, iw: REFS5.ledge05.w, ih: REFS5.ledge05.h, w: 520, t: 'REF 05: seated on a ledge', sub: 'the back rounded, the legs hanging'},
    {kind: 'fig', w: 560, svg: fig(CAST6.W1, ledge5('f'), -90, PROPS.ledge(330, -230, 560), 60, 680), t: 'SEATED ON A LEDGE', sub: 'the knit and jeans; the hands on the knee', gold: true},
    {kind: 'ref', src: REFS5.hill01.src, iw: REFS5.hill01.w, ih: REFS5.hill01.h, w: 560, t: 'REF 01: seated on the ground', sub: 'from behind, read by posture alone'},
    {kind: 'fig', w: 560, svg: fig(CAST6.M2, ground5('m'), 196, PROPS.hill(-600, 600), 0, 680), t: 'SEATED ON THE GROUND', sub: 'knees up, the back rounded, the arms round the knees', gold: true},
  ];
  const drawRow = (cells: Cell[], y: number) => {
    let x = 40;
    return cells.map((c, i) => {
      const cx = x;
      x += c.w + 20;
      if (c.kind === 'ref')
        return (
          <g key={i}>
            <RefImg6 src={c.src} iw={c.iw} ih={c.ih} x={cx} y={y} w={c.w} h={H} fit="cover" />
            <Label6 x={cx + 4} y={y + H + 30} t={c.t} sub={c.sub} />
          </g>
        );
      return (
        <g key={i}>
          <rect x={cx} y={y} width={c.w} height={H} rx={14} fill={C6.panel} />
          <Raw6 svg={`<svg x="${cx}" y="${y}" width="${c.w}" height="${H}" viewBox="${cx} ${y} ${c.w} ${H}" overflow="hidden">${c.svg(cx + c.w / 2, y + H - 34)}</svg>`} />
          <Label6 x={cx + 4} y={y + H + 30} t={c.t} sub={c.sub} gold={c.gold} />
        </g>
      );
    });
  };
  return (
    <AbsoluteFill style={{background: C6.bg}}>
      <svg width={POSES6_W} height={POSES6_H} viewBox={`0 0 ${POSES6_W} ${POSES6_H}`}>
        <Title6
          t="People v4, bodies: the poses beside the references"
          l1="The pose library on the new body (skel5.ts: the torso a leaned and bent chain with the contrapposto's tilts, the limbs by two-bone IK): standing, walking, seated on a ledge, seated on the ground, leaning."
          l2="Each beside the owner's reference for it (ref 03, 02, 05, 01; we take the posture, never the character). Our figures face screen-left (the key light is upper left)."
        />
        {drawRow(row1, y1)}
        {drawRow(row2, y2)}
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ 04: her walk, eight frames
export const WALK6_W = 2400;
export const WALK6_H = 1290;
const WALK_KEYS = ['contact (right heel)', 'down', 'passing', 'up', 'contact (left heel)', 'down', 'passing', 'up'];
export const B6Walk: React.FC = () => {
  resetUid6();
  const her = CAST6.her;
  const cw = 284;
  const t0 = WALK6.TC * 2;
  const frames = WALK_KEYS.map((_, k) => t0 + (k * WALK6.TC) / 8);
  const y1 = 180;
  const h1 = 600;
  const y2 = y1 + h1 + 120;
  return (
    <AbsoluteFill style={{background: C6.bg}}>
      <svg width={WALK6_W} height={WALK6_H} viewBox={`0 0 ${WALK6_W} ${WALK6_H}`}>
        <Title6
          t="People v4, bodies: her walk (eight frames of one cycle)"
          l1={`One cycle every ${WALK6.TC.toFixed(2)} s at 60 fps (~${Math.round((WALK6.V / 590) * 100) / 100} m/s; the camera tracks her): contact, down, passing, up, each side. The arms swing against the legs (+-16 degrees, the forearm lagging), the hips turn`}
          l2="and drop on the swing side, the shoulders turn against them, the body is lowest at the down; the coat's hem swings after the legs and the hair (the v4 spring rig) trails and bounces. Below: the same frames at film size."
        />
        {frames.map((t, k) => {
          const x = 40 + k * (cw + 6.5);
          const ph = walkPhase(t);
          const bob: [number, number] = [-WALK6.V * t, 0];
          const o: Opts6 = {pose: walk5('f', ph), yaw: -90, px: h1, motion: walkMotion6(her, t), bob};
          return (
            <g key={k}>
              <rect x={x} y={y1 - 20} width={cw} height={h1 + 60} rx={14} fill={C6.panel} />
              <Raw6 svg={`<svg x="${x}" y="${y1 - 20}" width="${cw}" height="${h1 + 60}" viewBox="${x} ${y1 - 20} ${cw} ${h1 + 60}" overflow="hidden">${fig6(her, o, x + cw / 2 + 10, y1 + h1 + 10, h1)}</svg>`} />
              <T6 x={x + 10} y={y1 + h1 + 70} s={16} w={700} c={C6.ink}>
                {WALK_KEYS[k]}
              </T6>
              <T6 x={x + 10} y={y1 + h1 + 92} s={15} c={C6.sub}>
                {`f ${Math.round(t * 60)}  •  ${t.toFixed(2)} s  •  phase ${(ph % 1).toFixed(3)}`}
              </T6>
            </g>
          );
        })}
        <rect x={40} y={y2} width={2320} height={300} rx={16} fill={C6.film} />
        <T6 x={64} y={y2 + 32} s={16} c={C6.dim}>
          film size 1:1 (200 px tall)
        </T6>
        {frames.map((t, k) => {
          const ph = walkPhase(t);
          const bob: [number, number] = [-WALK6.V * t, 0];
          return <Raw6 key={`s${k}`} svg={fig6(her, {pose: walk5('f', ph), yaw: -90, px: 200, motion: walkMotion6(her, t), bob}, 200 + k * 285, y2 + 270, 200)} />;
        })}
        <T6 x={42} y={WALK6_H - 26} s={21} c={C6.ink}>
          Look at: does she walk with weight (the down, the passing, the push-off)? The arms loose, never marching? The coat and the hair following, never stiff? At film size: a calm, elegant walk?
        </T6>
      </svg>
    </AbsoluteFill>
  );
};
