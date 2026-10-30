// Editorial people: the direction's sheet (docs/look/people_design/dir_editorial.png; the rules: dir_editorial.md).
// Stills only. 2400 x SHEET_H, one frame:
//   A  HER (the lead, ~27, the film's teal as her accent): autumn city evening and casual weekend, each from the front
//      3/4, in profile and from behind, 640 px tall
//   B  two supporting people (a man and a woman, other looks and ethnicities), 3/4, 640 px; the whole cast at film size
//      (200 and 140 px, 1:1 in our 1080 x 1920 frame) on a mid-tone ground; her in the painted still v6's doorway
//   C  the face treatment, large (640 px panels)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EdPerson} from './Person';
import {HER_EVENING, HER_WEEKEND, MAN_SUEDE, WOMAN_SHIRT, TEAL} from './cast';
import {POSES} from './poses';
import {buildPerson, type Person} from './figure';
import type {Pose} from './body';
import plate from './door_v6_plate.png';

export const SHEET_W = 2400;
export const SHEET_H = 2800;

const INK = '#3A2E2C';
const SOFT = '#8A7670';
const PAPER = '#F3EDE6';
const MID = '#B48C7C';
const FONT = 'Helvetica, Arial, sans-serif';

const T: React.FC<{x: number; y: number; s?: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; children: React.ReactNode}> = ({x, y, s = 22, c = INK, w = 400, a = 'start', children}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={s} fill={c} fontWeight={w} textAnchor={a}>
    {children}
  </text>
);

type Fig = {p: Person; pose: Pose; flip?: boolean; label: string; sub?: string};

const HER_A: Fig[] = [
  {p: HER_EVENING, pose: POSES.herEveningFront, label: 'front 3/4', sub: 'head turned to a profile'},
  {p: HER_EVENING, pose: POSES.herEveningProfile, label: 'profile', sub: 'walking'},
  {p: HER_EVENING, pose: POSES.herEveningBack, label: 'from behind', sub: 'a lost profile'},
];
const HER_B: Fig[] = [
  {p: HER_WEEKEND, pose: POSES.herWeekendFront, label: 'front 3/4', sub: 'oversized sunglasses'},
  {p: HER_WEEKEND, pose: POSES.herWeekendProfile, label: 'profile', sub: 'walking'},
  {p: HER_WEEKEND, pose: POSES.herWeekendBack, label: 'from behind', sub: 'the ponytail'},
];
const SUPPORT: Fig[] = [
  {p: MAN_SUEDE, pose: POSES.manFront, label: 'him, ~28', sub: 'suede chore jacket, tee, navy, white socks'},
  {p: WOMAN_SHIRT, pose: POSES.womanFront, flip: true, label: 'her friend, ~24', sub: 'big shirt half-tucked, wide jeans, flats'},
];
const CAST: Fig[] = [...HER_A, ...HER_B, ...SUPPORT];

/** A serene 3/4 face (both lashes closed, the nose shade): the face made of light, for the face row. */
const HER_SERENE: Person = {...HER_EVENING, face: {lash: 'closed', planes: true}};
const FACES: (Fig & {span?: number})[] = [
  {p: HER_EVENING, pose: POSES.herEveningProfile, label: 'profile line', sub: '+ one lash, open'},
  {p: HER_SERENE, pose: {...POSES.herEveningFront, head: {turn: -8, nod: 14, roll: 3}}, label: '3/4, eyes lowered', sub: 'two lashes, a nose shade, a lip tone'},
  {p: HER_EVENING, pose: POSES.herEveningBack, label: 'lost profile', sub: 'the cheek between the hair'},
  {p: HER_WEEKEND, pose: POSES.herWeekendFront, label: '3/4, sunglasses', sub: 'oversized, one glint'},
  {p: HER_WEEKEND, pose: POSES.herWeekendProfile, label: 'profile, sunglasses', sub: 'the ear free'},
  {p: HER_WEEKEND, pose: POSES.herWeekendBack, label: 'from behind', sub: 'hair is the face'},
  {p: MAN_SUEDE, pose: POSES.manFront, label: 'head bowed', sub: 'one lash, closed'},
  {p: WOMAN_SHIRT, pose: POSES.womanFront, flip: true, label: 'profile, bob', sub: 'hair frames the line'},
];

/** A figure standing on its own soft ground shadow, with its label under it. */
const Standing: React.FC<{f: Fig; x: number; y: number; h: number; labels?: boolean}> = ({f, x, y, h, labels = true}) => (
  <g>
    <EdPerson x={x} y={y} h={h} person={f.p} pose={f.pose} flip={f.flip} />
    {labels ? (
      <>
        <T x={x} y={y + 54} s={24} w={600} a="middle">
          {f.label}
        </T>
        {f.sub ? (
          <T x={x} y={y + 84} s={20} c={SOFT} a="middle">
            {f.sub}
          </T>
        ) : null}
      </>
    ) : null}
  </g>
);

/** A head panel: the figure drawn large and framed on its head. */
const HeadPanel: React.FC<{f: Fig; x: number; y: number; w: number; h: number; span: number}> = ({f, x, y, w, h, span}) => {
  const b = buildPerson(f.p, f.pose, f.flip, (1000 * h) / span);
  // frame on the head and its hair (not the fall): centred across, the crown a little below the top
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  for (const q of b.parts) {
    if (q.k !== 'head' && q.k !== 'hairCap') continue;
    for (const p of q.pts) {
      x0 = Math.min(x0, p[0]);
      x1 = Math.max(x1, p[0]);
      y0 = Math.min(y0, p[1]);
    }
  }
  const mid = (x0 + x1) / 2;
  const cx = f.flip ? -mid : mid;
  const vh = span;
  const vw = (span * w) / h;
  const top = y0 - 0.16 * vh;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#EDE5DC" />
      <svg x={x} y={y} width={w} height={h} viewBox={`${cx - vw / 2} ${top} ${vw} ${vh}`}>
        <EdPerson x={0} y={0} h={1000} person={f.p} pose={f.pose} flip={f.flip} shadow={null} pxScale={h / vh} />
      </svg>
      <T x={x + w / 2} y={y + h + 34} s={23} w={600} a="middle">
        {f.label}
      </T>
      {f.sub ? (
        <T x={x + w / 2} y={y + h + 62} s={19} c={SOFT} a="middle">
          {f.sub}
        </T>
      ) : null}
    </g>
  );
};

const Swatch: React.FC<{x: number; y: number; c: string; name: string}> = ({x, y, c, name}) => (
  <g>
    <rect x={x} y={y} width={46} height={46} rx={8} fill={c} />
    <T x={x + 56} y={y + 20} s={18} w={600}>
      {name}
    </T>
    <T x={x + 56} y={y + 42} s={16} c={SOFT}>
      {c}
    </T>
  </g>
);

export const EdSheet: React.FC = () => {
  const yA = 236;
  const hA = 640;
  const feetA = yA + hA + 40;
  const colA = [190, 560, 900, 1340, 1700, 2070];
  const yB = 1080;
  const feetB = yB + hA + 44;
  const yC = 1924;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={SHEET_W} height={SHEET_H} viewBox={`0 0 ${SHEET_W} ${SHEET_H}`}>
        <rect x={0} y={0} width={SHEET_W} height={SHEET_H} fill={PAPER} />
        {/* header */}
        <T x={60} y={84} s={58} w={700}>
          People, direction: CLEAN EDITORIAL
        </T>
        <T x={60} y={132} s={26} c={SOFT}>
          Fashion-illustration proportions (8.1 heads), crisp flat shapes with one soft light gradient each, a restrained palette, faces as a profile line or
          hidden by hair and angle.
        </T>
        <T x={60} y={168} s={26} c={SOFT}>
          Stills, 2026-10-30. Drawn by the reusable SVG components in src/look/people_dirs/editorial (any view, any pose). Rules: dir_editorial.md.
        </T>

        {/* A: her, two outfits x three views */}
        <T x={60} y={yA + 6} s={30} w={700}>
          A  HER, the lead (~27)
        </T>
        <T x={colA[1]} y={yA + 6} s={26} w={600} c={TEAL} a="middle">
          autumn city evening
        </T>
        <T x={colA[1]} y={yA + 38} s={20} c={SOFT} a="middle">
          open chocolate coat, crew knit, teal satin slip skirt, pointed flats
        </T>
        <T x={colA[4]} y={yA + 6} s={26} w={600} c={TEAL} a="middle">
          casual weekend
        </T>
        <T x={colA[4]} y={yA + 38} s={20} c={SOFT} a="middle">
          teal cropped cardigan, white tee, straight indigo jeans, slim sneakers, tote
        </T>
        <line x1={1160} y1={yA + 70} x2={1160} y2={feetA + 80} stroke="#DDD2C8" strokeWidth={2} />
        {[...HER_A, ...HER_B].map((f, i) => (
          <Standing key={i} f={f} x={colA[i]} y={feetA} h={hA} />
        ))}

        {/* B: the supporting people */}
        <T x={60} y={yB + 4} s={30} w={700}>
          B  Supporting cast (3/4)
        </T>
        {SUPPORT.map((f, i) => (
          <Standing key={i} f={f} x={[220, 590][i]} y={feetB} h={hA} />
        ))}

        {/* B: the cast at film size on a mid-tone ground */}
        <g>
          <rect x={800} y={yB - 26} width={900} height={760} rx={16} fill={MID} />
          <T x={830} y={yB + 14} s={24} w={700} c="#FFF6EE">
            The cast at film size, 1:1 (200 px and 140 px tall in 1080 x 1920)
          </T>
          {CAST.map((f, i) => (
            <EdPerson key={`a${i}`} x={858 + i * 110} y={yB + 330} h={200} person={f.p} pose={f.pose} flip={f.flip} shadow="#9A7464" />
          ))}
          {CAST.map((f, i) => (
            <EdPerson key={`b${i}`} x={880 + i * 78} y={yB + 560} h={140} person={f.p} pose={f.pose} flip={f.flip} shadow="#9A7464" />
          ))}
          <T x={830} y={yB + 370} s={19} c="#FFF6EE">
            200 px: the "you" near the camera
          </T>
          <T x={830} y={yB + 600} s={19} c="#FFF6EE">
            140 px: a near stranger
          </T>
          <T x={830} y={yB + 690} s={19} c="#F6E6DA">
            What carries them here: the hair's outline, the garment lengths, one value split, the feet.
          </T>
        </g>

        {/* B: her in the painted still v6's doorway */}
        <g>
          <T x={1730} y={yB + 4} s={24} w={700}>
            In the painted still v6, at the doorway (x2)
          </T>
          <svg x={1724} y={yB + 24} width={660} height={620} viewBox="40 20 330 310">
            <image href={plate} x={0} y={0} width={460} height={330} />
            <EdPerson x={246} y={288.5} h={156} person={HER_EVENING} pose={POSES.herDoor} flip shadow="#B49582" />
          </svg>
          <T x={1730} y={yB + 676} s={19} c={SOFT}>
            She steps out in profile, 156 px tall in the 1080 x 1920 frame
          </T>
          <T x={1730} y={yB + 700} s={19} c={SOFT}>
            (the still's own her painted out of the plate). Hero colour: teal
          </T>
          <T x={1730} y={yB + 724} s={19} c={SOFT}>
            {TEAL} on her only, one piece per outfit, never the biggest mass.
          </T>
        </g>

        {/* C: the face treatment */}
        <T x={60} y={yC} s={30} w={700}>
          C  Faces: generic, never blank. The line, the light, the hair and the angle carry them.
        </T>
        {FACES.map((f, i) => (
          <HeadPanel key={i} f={f} x={24 + i * 296} y={yC + 24} w={284} h={640} span={330} />
        ))}

        {/* footer: the palette */}
        <T x={60} y={yC + 790} s={24} w={700}>
          Palette (lit values; each form fades to its own shade, warm, never grey):
        </T>
        {[
          ['teal (hero)', TEAL],
          ['chocolate', '#5E3E31'],
          ['cloud cream', '#EEE6DB'],
          ['indigo', '#33476A'],
          ['caramel suede', '#AD7752'],
          ['navy', '#283651'],
          ['mid denim', '#5F86A6'],
          ['burgundy', '#7A3238'],
          ['espresso hair', '#3A2B27'],
        ].map(([n, c], i) => (
          <Swatch key={i} x={60 + i * 258} y={yC + 812} c={c} name={n} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
