// MODERN GRAPHIC people: the direction's sheet (docs/look/people_design/dir_graphic.png), one frame, 2400 px wide.
// Rows: HER in two outfits x three views at 640 px; the two supporting people at 640 px with the face treatment
// (the one mark, magnified); the whole cast at film size (200 and 140 px) on a mid tone, with the black silhouette
// test; her in the painted still v6's doorway (before / after at 1:1, and 2x); the palette as worn.
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {Figure} from './Figure';
import {build, Who, View} from './cast';
import {BG, HEX, SKIN, HAIR, T} from './palette';
import {DOOR_AFTER, DOOR_BEFORE, DOOR_CROP, DOOR_SPOT} from './doorway';

export const SHEET_W = 2400;
export const SHEET_H = 3290;

const INK = '#3B2C2E';
const SUB = '#7A6668';
const FONT = 'Inter, DejaVu Sans, sans-serif';

const Title: React.FC<{x: number; y: number; children: React.ReactNode; size?: number; color?: string}> = ({x, y, children, size = 30, color = INK}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={size} fontWeight={700} fill={color}>
    {children}
  </text>
);
const Note: React.FC<{x: number; y: number; children: React.ReactNode; size?: number; anchor?: 'start' | 'middle' | 'end'; color?: string}> = ({
  x,
  y,
  children,
  size = 21,
  anchor = 'start',
  color = SUB,
}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={size} fill={color} textAnchor={anchor}>
    {children}
  </text>
);

const ITEMS: {who: Who; view: View; label: string}[] = [
  {who: 'herEvening', view: 'q', label: 'front 3/4, standing'},
  {who: 'herEvening', view: 'p', label: 'profile, walking'},
  {who: 'herEvening', view: 'b', label: 'from behind, turning'},
  {who: 'herWeekend', view: 'q', label: 'front 3/4, standing'},
  {who: 'herWeekend', view: 'p', label: 'profile, walking'},
  {who: 'herWeekend', view: 'b', label: 'from behind, turning'},
];
const CAST: {who: Who; view: View}[] = [...ITEMS.map(({who, view}) => ({who, view})), {who: 'man', view: 'q'}, {who: 'woman', view: 'q'}];

/** A head close-up: the figure drawn `mag` times its 640 px size, framed on its head. */
const HeadCrop: React.FC<{who: Who; view: View; x: number; y: number; w: number; h: number; mag: number; id: string; bg: string}> = ({who, view, x, y, w, h, mag, id, bg}) => {
  const fig = build(who, view);
  const H = 640 * mag;
  const s = H / 1000;
  // put the head's centre at 40 % down the window
  const cx = x + w / 2 - fig.head[0] * s;
  const cy = y + h * 0.4 - fig.head[1] * s;
  return (
    <g>
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} rx={10} />
      </clipPath>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={bg} />
      <g clipPath={`url(#${id})`}>
        <Figure fig={fig} x={cx} y={cy + H} h={H} uid={`${id}f`} />
      </g>
    </g>
  );
};

const Swatch: React.FC<{x: number; y: number; c: string; w?: number}> = ({x, y, c, w = 44}) => (
  <rect x={x} y={y} width={w} height={44} rx={6} fill={c} stroke="#CDBFB6" strokeWidth={1.5} />
);

export const GrSheet: React.FC = () => {
  const figs = CAST.map((it) => build(it.who, it.view));
  // ---------------------------------------------------------------- layout
  const A = {y: 190, h: 820};
  const B = {y: A.y + A.h + 20, h: 880};
  const C = {y: B.y + B.h + 20, h: 640};
  const D = {y: C.y + C.h + 20, h: SHEET_H - (C.y + C.h + 20)};
  const colW = SHEET_W / 6;
  const big = 640;
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      {/* load guards: the render waits until both crops are decoded */}
      <Img src={DOOR_BEFORE} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
      <Img src={DOOR_AFTER} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
      <svg width={SHEET_W} height={SHEET_H} viewBox={`0 0 ${SHEET_W} ${SHEET_H}`}>
        {/* header */}
        <Title x={60} y={88} size={56}>
          People: MODERN GRAPHIC
        </Title>
        <Note x={62} y={138} size={25}>
          Natural adult proportions (7.8 heads), every form one rounded polygon in two flat tones with a crisp terminator, one key from the upper left, no outlines.
        </Note>
        <Note x={62} y={170} size={25}>
          Styled from clothes and hair alone; the face is generic by design: ONE mark, the shade of the brow ridge running into the nose. The film's teal is her accent.
        </Note>

        {/* ---------------------------------------------------------------- A: HER, two outfits x three views */}
        <rect x={0} y={A.y} width={SHEET_W} height={A.h} fill={BG.panel} />
        <line x1={SHEET_W / 2} y1={A.y + 30} x2={SHEET_W / 2} y2={A.y + A.h - 30} stroke="#CDBFB6" strokeWidth={2} />
        <Title x={60} y={A.y + 56}>HER (27), the film's lead. Autumn city evening</Title>
        <Note x={60} y={A.y + 90}>the long open coat, a cream column, a teal bag under the arm, pointed flats; long copper hair</Note>
        <Title x={SHEET_W / 2 + 40} y={A.y + 56}>Casual weekend</Title>
        <Note x={SHEET_W / 2 + 40} y={A.y + 90}>the teal cap with the ponytail through it, a baby tee, relaxed jeans, slim sneakers, an iced coffee</Note>
        {ITEMS.map((it, i) => {
          const x = colW * (i + 0.5) + (i === 1 || i === 4 ? 20 : 0);
          const yS = A.y + 110 + big;
          return (
            <g key={i}>
              <Figure fig={figs[i]} x={x} y={yS} h={big} uid={`a${i}`} />
              <Note x={colW * (i + 0.5)} y={yS + 50} anchor="middle">
                {it.label}
              </Note>
            </g>
          );
        })}

        {/* ---------------------------------------------------------------- B: two supporting people + the face */}
        <Title x={60} y={B.y + 56}>Two supporting people, 3/4</Title>
        {[6, 7].map((k, j) => {
          const x = 230 + j * 400;
          const yS = B.y + 110 + big;
          return (
            <g key={k}>
              <Figure fig={figs[k]} x={x} y={yS} h={big} uid={`b${k}`} />
              <Note x={x} y={yS + 50} anchor="middle">
                {k === 6 ? 'suede bomber, curtains, headphones' : 'cropped leather, satin skirt, braids'}
              </Note>
            </g>
          );
        })}
        <Title x={900} y={B.y + 56}>The face: one mark, as drawn at 640 px, shown 2.5x</Title>
        <Note x={900} y={B.y + 90}>The brow ridge's shade running into the nose's shaded side (a "7" of light, never eyes or a mouth); the side plane in shade.</Note>
        {(
          [
            {who: 'herEvening', view: 'q', label: 'the mark, 3/4'},
            {who: 'herEvening', view: 'p', label: 'profile: the edge + wing'},
            {who: 'herEvening', view: 'b', label: 'lost profile: no mark'},
            {who: 'herWeekend', view: 'q', label: "the brim's shadow"},
            {who: 'man', view: 'q', label: 'the same mark, his jaw'},
            {who: 'woman', view: 'q', label: 'sunglasses'},
          ] as {who: Who; view: View; label: string}[]
        ).map((f, i) => {
          const w = 238;
          const x = 900 + i * (w + 14);
          const y = B.y + 120;
          return (
            <g key={i}>
              <HeadCrop who={f.who} view={f.view} x={x} y={y} w={w} h={560} mag={2.5} id={`hc${i}`} bg={BG.panel} />
              <Note x={x + w / 2} y={y + 600} anchor="middle" size={20}>
                {f.label}
              </Note>
            </g>
          );
        })}
        <Note x={900} y={B.y + 790} size={20}>
          At film size the mark is 1-3 px: a hint of which way the face turns (the face budget, design_research.md 11.3). Eyes, brows, mouths: never.
        </Note>

        {/* ---------------------------------------------------------------- C: the cast at film size on a mid tone */}
        <rect x={0} y={C.y} width={SHEET_W} height={C.h} fill={BG.mid} />
        <Title x={60} y={C.y + 56} color="#FFF6EE">
          At film size, 1:1: 200 px and 140 px tall (the 1080 x 1920 frame)
        </Title>
        {figs.map((f, i) => (
          <Figure key={`c2-${i}`} fig={f} x={110 + i * 150} y={C.y + 330} h={200} uid={`c2${i}`} />
        ))}
        {figs.map((f, i) => (
          <Figure key={`c1-${i}`} fig={f} x={110 + i * 150} y={C.y + 560} h={140} uid={`c1${i}`} />
        ))}
        <rect x={1300} y={C.y + 90} width={1040} height={510} rx={14} fill="#EFE6DE" />
        <Note x={1330} y={C.y + 132} color={INK} size={22}>
          The black silhouette test at 140 px (design_research.md L1):
        </Note>
        <Note x={1330} y={C.y + 162} size={20}>
          walking or standing, woman or man, coat, skirt or trousers must read from the shape alone
        </Note>
        {figs.map((f, i) => (
          <Figure key={`k-${i}`} fig={f} x={1380 + i * 120} y={C.y + 560} h={140} uid={`k${i}`} mono="#2A2124" shadow={false} />
        ))}
        <Note x={1330} y={C.y + 370} size={20}>
          and at 200 px:
        </Note>
        {[0, 1, 4, 6].map((k, j) => (
          <Figure key={`k2-${j}`} fig={figs[k]} x={1560 + j * 150} y={C.y + 380} h={200} uid={`k2${j}`} mono="#2A2124" shadow={false} />
        ))}

        {/* ---------------------------------------------------------------- D: in the scene, the palette */}
        <Title x={60} y={D.y + 56}>In the scene: the painted still v6's doorway, her at the old her's spot and size</Title>
        {(() => {
          const y0 = D.y + 90;
          const sc = 1;
          const w = DOOR_CROP.w * sc;
          const h = DOOR_CROP.h * sc;
          const herFig = build('herEvening', 'p');
          const sx = (DOOR_SPOT.x - DOOR_CROP.x) * sc;
          const sy = (DOOR_SPOT.y - DOOR_CROP.y) * sc;
          // the 2x zoom of the after, round her
          const zx = 1200;
          const zw = 420;
          const zh = 540;
          const zs = 2.0;
          const fx = DOOR_SPOT.x - DOOR_CROP.x;
          const fy = DOOR_SPOT.y - DOOR_CROP.y;
          const ox = zx + zw / 2 - fx * zs;
          const oy = y0 + zh * 0.86 - fy * zs;
          return (
            <g>
              <image href={DOOR_BEFORE} x={60} y={y0} width={w} height={h} />
              <Note x={60 + w / 2} y={y0 + h + 36} anchor="middle">
                before: v6 as painted (1:1)
              </Note>
              <image href={DOOR_AFTER} x={620} y={y0} width={w} height={h} />
              <Figure fig={herFig} x={620 + sx} y={y0 + sy} h={DOOR_SPOT.h * sc + 2} uid="door1" shadowColor="#6A4A44" />
              <Note x={620 + w / 2} y={y0 + h + 36} anchor="middle">
                after: her, same spot and size (1:1)
              </Note>
              <clipPath id="zoomc">
                <rect x={zx} y={y0} width={zw} height={zh} rx={8} />
              </clipPath>
              <g clipPath="url(#zoomc)">
                <image href={DOOR_AFTER} x={ox} y={oy} width={DOOR_CROP.w * zs} height={DOOR_CROP.h * zs} style={{imageRendering: 'pixelated'}} />
                <Figure fig={herFig} x={ox + fx * zs} y={oy + fy * zs} h={(DOOR_SPOT.h + 2) * zs} uid="door2" shadowColor="#6A4A44" />
              </g>
              <Note x={zx + zw / 2} y={y0 + zh + 36} anchor="middle">
                2x
              </Note>
            </g>
          );
        })()}
        {(() => {
          const x0 = 1720;
          const y0 = D.y + 100;
          const rows: [string, string[]][] = [
            ['skin', [SKIN.s2.lit, SKIN.s2.shade, SKIN.s3.lit, SKIN.s3.shade, SKIN.s5.lit, SKIN.s5.shade]],
            ['hair', [HAIR.copper.lit, HAIR.copper.sheen, HAIR.blackBrown.lit, HAIR.black.lit, HAIR.honey.lit]],
            ['her', [HEX.teal, T.coat.lit, T.coat.shade, HEX.cream, HEX.cloud, HEX.denim]],
            ['cast', [HEX.cognac, HEX.indigo, HEX.burgundy, HEX.butter, '#EDE5D8']],
          ];
          return (
            <g>
              <Title x={x0} y={y0} size={26}>
                Palette (as worn: lit, then shade)
              </Title>
              {rows.map(([name, cs], r) => (
                <g key={name}>
                  <Note x={x0} y={y0 + 70 + r * 70} size={20}>
                    {name}
                  </Note>
                  {cs.map((c, k) => (
                    <Swatch key={k} x={x0 + 80 + k * 54} y={y0 + 40 + r * 70} c={c} />
                  ))}
                </g>
              ))}
              <Note x={x0} y={y0 + 360} size={20}>
                tonal base + ONE accent per person;
              </Note>
              <Note x={x0} y={y0 + 388} size={20}>
                the teal only on her; skin shade turns
              </Note>
              <Note x={x0} y={y0 + 416} size={20}>
                toward red, never grey; a rim of light
              </Note>
              <Note x={x0} y={y0 + 444} size={20}>
                on her key-side edges only (the subject)
              </Note>
            </g>
          );
        })()}
      </svg>
    </AbsoluteFill>
  );
};
