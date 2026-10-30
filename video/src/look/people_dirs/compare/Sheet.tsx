// People design: the three directions side by side (docs/look/people_design/directions_compare.png; the decision and
// the draft design system: docs/look/PEOPLE_DESIGN.md). Stills only. One frame, 2400 px wide:
//   A  her in the autumn city evening look at 640 px, front 3/4 and from behind, per direction, with our current her
//      (src/lib/figure as the painted still v6 draws her) for reference; every column on the same light panel tone
//   F  the faces of those 640 px figures, magnified (vector, so nothing is upscaled): a 3/4 face and a profile
//   B  the cast at film size (200 px tall, 1:1 in our 1080 x 1920 frame) on ONE mid-tone ground for all four
//   C  her in the painted still v6's doorway at the old her's spot and size, shown 2x (the same plate for all)
//   D  a verdict per column and the recommendation (a draft until the owner picks)
// Each direction is drawn by its own components (src/look/people_dirs/{editorial,painterly,graphic}), with the poses
// and outfits of its own sheet; nothing in those folders is changed here.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Figure as NowFigure, buildFigure, type FigurePose, type FigureLook} from '../../../lib/figure';
import {EdPerson} from '../editorial/Person';
import {HER_EVENING as ED_EVENING, HER_WEEKEND as ED_WEEKEND, MAN_SUEDE as ED_MAN, WOMAN_SHIRT as ED_WOMAN} from '../editorial/cast';
import {POSES as ED_POSES} from '../editorial/poses';
import {buildPerson as edBuild, type Person as EdPersonT} from '../editorial/figure';
import type {Pose as EdPose} from '../editorial/body';
import {PainterlyFigure, KEY_LEFT, camFor, headCentre, type View as PtView} from '../painterly/PtFigure';
import {CAST as PT_CAST, CAST_POSES as PT_POSES, type Views as PtViews} from '../painterly/cast';
import {Figure as GrFigure} from '../graphic/Figure';
import {build as grBuild, type Who as GrWho, type View as GrView} from '../graphic/cast';
import {DOOR_AFTER, DOOR_BEFORE, DOOR_CROP} from '../graphic/doorway';

export const CMP_W = 2400;
export const CMP_H = 2940;

const FONT = 'Inter, DejaVu Sans, sans-serif';
const PAGE = '#F2EBE4';
const PANEL = '#E8DFD7';
const PANEL_REC = '#E3E6DE';
const MID = '#A9918E';
const INK = '#352829';
const SOFT = '#7C6A69';
const MINUS = '#8A4A44';
const LIGHT_INK = '#FBF4EF';
const TEAL = '#0B8577';

const CW = 600; // a column's width
const HA = 640; // row A's figure height (the faces row magnifies these same 640 px figures)
const HB = 200; // row B's figure height

const T: React.FC<{x: number; y: number; s?: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; children: React.ReactNode}> = ({
  x,
  y,
  s = 22,
  c = INK,
  w = 400,
  a = 'start',
  children,
}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={s} fill={c} fontWeight={w} textAnchor={a}>
    {children}
  </text>
);

// ---------------------------------------------------------------- our current her (src/lib/figure, still v6)

/** As the painted still v6 draws her (src/look/paint_s1/V2S1_row.tsx V6_HER_POSE, copied here so this sheet imports
 *  no film code): slimmer, the coat's hem just above the knee, the thin tapered scarf end. */
const NOW_TUNE: FigurePose['tune'] = {slim: 0.88, hem: -335, scarf: {length: 300, w0: 13, w1: 3.5}};
const NOW_LOOK: Partial<FigureLook> = {scarf: '#D9785F', scarfTip: '#A24A42'};
const NOW_KEY: [number, number] = [-0.94, -0.34];
const nowPose = (p: Omit<FigurePose, 'tune' | 'wind'>, strength = 0.8): FigurePose => ({...p, tune: NOW_TUNE, wind: {t: 0.2, strength}});
const NOW_REAR = nowPose({view: 'rear34', turn: 0.35});
const NOW_WALK = nowPose({view: 'profile', step: 0.15, stride: 0.9});
const NOW_BACK = nowPose({view: 'back', step: 0.5}, 0.55);
const Now: React.FC<{x: number; y: number; h: number; pose: FigurePose; shadow?: string | null}> = ({x, y, h, pose, shadow = '#CDB6AD'}) => (
  <NowFigure x={x} y={y} h={h} pose={pose} look={NOW_LOOK} light={{key: NOW_KEY}} shadow={shadow} />
);

// ---------------------------------------------------------------- the three directions, as their sheets draw them

const Ed: React.FC<{x: number; y: number; h: number; p: EdPersonT; pose: EdPose; flip?: boolean; shadow?: string}> = ({x, y, h, p, pose, flip, shadow}) => (
  <EdPerson x={x} y={y} h={h} person={p} pose={pose} flip={flip} shadow={shadow} />
);
const Pt: React.FC<{x: number; y: number; h: number; who: string; view: PtView; pose: keyof PtViews; uid: string}> = ({x, y, h, who, view, pose, uid}) => (
  <PainterlyFigure person={PT_CAST[who]} pose={PT_POSES[who][pose]} view={view} h={h} x={x} y={y} uid={uid} />
);
const Gr: React.FC<{x: number; y: number; h: number; who: GrWho; view: GrView; uid: string; shadowColor?: string}> = ({x, y, h, who, view, uid, shadowColor}) => (
  <GrFigure fig={grBuild(who, view)} x={x} y={y} h={h} uid={uid} shadowColor={shadowColor} />
);

/** The editorial sheet's own 3/4 face (its face row): both lashes closed, the nose's shade, the head bowed a little. */
const ED_SERENE: EdPersonT = {...ED_EVENING, face: {lash: 'closed', planes: true}};
const ED_SERENE_POSE: EdPose = {...ED_POSES.herEveningFront, head: {turn: -8, nod: 14, roll: 3}};

// ---------------------------------------------------------------- where the head is (a 640 px figure, feet at 0, 0)

type XY = [number, number];
const centreOf = (pts: number[][]): XY => {
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const p of pts) {
    x0 = Math.min(x0, p[0]);
    x1 = Math.max(x1, p[0]);
    y0 = Math.min(y0, p[1]);
    y1 = Math.max(y1, p[1]);
  }
  return [(x0 + x1) / 2, (y0 + y1) / 2];
};
const nowHead = (pose: FigurePose): XY => {
  const pts = buildFigure(pose).parts.filter((q) => q.k === 'hair').flatMap((q) => q.pts);
  const c = centreOf(pts);
  return [c[0] * (HA / 1000), c[1] * (HA / 1000)];
};
const edHead = (p: EdPersonT, pose: EdPose, flip = false): XY => {
  const pts = edBuild(p, pose, flip, HA)
    .parts.filter((q) => q.k === 'head' || q.k === 'hairCap')
    .flatMap((q) => q.pts.map((v) => [v[0], v[1]]));
  const c = centreOf(pts);
  return [(flip ? -c[0] : c[0]) * (HA / 1000), c[1] * (HA / 1000)];
};
const ptHead = (who: string, view: PtView, pose: keyof PtViews): XY => headCentre(PT_CAST[who], PT_POSES[who][pose], camFor({view, h: HA, x: 0, y: 0}));
const grHead = (who: GrWho, view: GrView): XY => {
  const b = grBuild(who, view);
  return [b.head[0] * (HA / 1000), -HA + b.head[1] * (HA / 1000)];
};

// ---------------------------------------------------------------- the columns

type ColKey = 'now' | 'ed' | 'pt' | 'gr';
type Col = {
  key: ColKey;
  name: string;
  rec?: boolean;
  lines: [string, string, string];
  labels: [string, string, string, string];
  faces: [string, string];
  door: string;
  verdict: string[];
};

const COLS: Col[] = [
  {
    key: 'now',
    name: 'NOW: our current her',
    lines: ['src/lib/figure as the painted still v6 draws her', '6.75 heads, three flat planes per part', 'belted teal A-line coat, tights, boots, scarf, bun'],
    labels: ['rear 3/4', 'the engine has no front 3/4', 'profile, walking', 'as the still v6 draws her'],
    faces: ['rear 3/4: a cheek sliver', 'profile: one closed-eye line'],
    door: 'now: v6 as painted',
    verdict: ['− reads 2015: A-line coat, tights, boots, bun', '− helmet hair; a teal column; stiff from behind', '+ an adult body to start from: neck, waist'],
  },
  {
    key: 'ed',
    name: 'A · CLEAN EDITORIAL',
    rec: true,
    lines: ['8.1 heads; crisp shapes, one soft gradient each', 'face: the profile line, one lash, sunglasses', 'chocolate coat, cream knit, teal satin skirt'],
    labels: ['front 3/4', 'head turned to a profile', 'from behind', 'a lost profile'],
    faces: ['3/4: lashes lowered, nose shade', 'profile: the line + one lash'],
    door: 'A: stepping out, in profile',
    verdict: ['+ the most beautiful and current of the three', '+ reads at 200 px; one 3D model, every view', '− model-tall at 8.1 heads; may look pasted in'],
  },
  {
    key: 'pt',
    name: 'B · SOFT PAINTERLY',
    lines: ['7.8 heads; a soft 3D form painted in 2-3 planes', 'soft inside, crisp outside; lids, a lip tone', 'cropped leather jacket, teal satin skirt'],
    labels: ['front 3/4', 'standing, lids lowered', 'from behind', 'turning'],
    faces: ['3/4: lids, brows, a lip tone', 'profile: the skin edge'],
    door: 'B: walking, in profile',
    verdict: ['+ sits softest in the painted world', '− soft 3D at 640 px: inflated cloth, mittens', '− blur inside bends "people crisp"; slowest'],
  },
  {
    key: 'gr',
    name: 'C · MODERN GRAPHIC',
    lines: ['7.8 heads; rounded polygons in two flat tones', 'crisp terminator; ONE brow-into-nose mark', 'long open near-black coat, cream column, teal bag'],
    labels: ['front 3/4', 'standing, the face mark', 'from behind', 'turning'],
    faces: ['3/4: the one mark', 'profile: the edge + the wing'],
    door: 'C: walking, in profile',
    verdict: ['+ the house rule exactly: two flat tones', '+ crispest at film size; cheapest to render', '− stiff tubes; a mannequin face; hair per view'],
  },
];

// ---------------------------------------------------------------- the rows

const Y_A = 190;
const H_A = 880;
const FEET_A = Y_A + 168 + HA; // 998
const Y_F = Y_A + H_A + 20; // 1090
const FACE_W = 270;
const FACE_H = 360;
const ZOOM = 2.4;
const H_F = 60 + FACE_H + 50;
const Y_B = Y_F + H_F + 20;
const H_B = 350;
const FEET_B = Y_B + 300;
const Y_C = Y_B + H_B + 20;
const DOOR_BOX = 560; // the 2x panel (280 x 280 frame px)
const DOOR_VIEW = {x: 545, y: 830, w: 280, h: 280}; // frame px of the 1080 x 1920 still, round the doorway
const Y_D = Y_C + 60 + DOOR_BOX + 60;

/** Row A: her, autumn city evening, 640 px, 3/4 and behind. */
const RowA: React.FC<{c: Col; i: number}> = ({c, i}) => {
  const x0 = i * CW;
  const xa = x0 + 155;
  const xb = x0 + 445;
  let figs: React.ReactNode;
  if (c.key === 'now') {
    figs = (
      <>
        <Now x={xa} y={FEET_A} h={HA} pose={NOW_REAR} />
        <Now x={xb + 10} y={FEET_A} h={HA} pose={NOW_WALK} />
      </>
    );
  } else if (c.key === 'ed') {
    figs = (
      <>
        <Ed x={xa} y={FEET_A} h={HA} p={ED_EVENING} pose={ED_POSES.herEveningFront} />
        <Ed x={xb} y={FEET_A} h={HA} p={ED_EVENING} pose={ED_POSES.herEveningBack} />
      </>
    );
  } else if (c.key === 'pt') {
    figs = (
      <>
        <Pt x={xa} y={FEET_A} h={HA} who="herEvening" view="front34" pose="front34" uid="cA1" />
        <Pt x={xb} y={FEET_A} h={HA} who="herEvening" view="back" pose="back" uid="cA2" />
      </>
    );
  } else {
    figs = (
      <>
        <Gr x={xa} y={FEET_A} h={HA} who="herEvening" view="q" uid="cA3" />
        <Gr x={xb} y={FEET_A} h={HA} who="herEvening" view="b" uid="cA4" />
      </>
    );
  }
  return (
    <g>
      <rect x={x0 + 10} y={Y_A} width={CW - 20} height={H_A} rx={14} fill={c.rec ? PANEL_REC : PANEL} />
      {c.rec ? <rect x={x0 + 10} y={Y_A} width={CW - 20} height={8} rx={4} fill={TEAL} /> : null}
      <T x={x0 + 34} y={Y_A + 52} s={33} w={700}>
        {c.name}
      </T>
      {c.rec ? (
        <g>
          <rect x={x0 + CW - 196} y={Y_A + 26} width={164} height={34} rx={17} fill={TEAL} />
          <T x={x0 + CW - 114} y={Y_A + 50} s={17} w={700} c={LIGHT_INK} a="middle">
            RECOMMENDED
          </T>
        </g>
      ) : null}
      <T x={x0 + 34} y={Y_A + 90} s={20}>
        {c.lines[0]}
      </T>
      <T x={x0 + 34} y={Y_A + 118} s={20}>
        {c.lines[1]}
      </T>
      <T x={x0 + 34} y={Y_A + 146} s={20} c={SOFT}>
        {c.lines[2]}
      </T>
      {figs}
      <T x={xa} y={FEET_A + 44} s={23} w={700} a="middle">
        {c.labels[0]}
      </T>
      <T x={xa} y={FEET_A + 70} s={18} c={SOFT} a="middle">
        {c.labels[1]}
      </T>
      <T x={xb} y={FEET_A + 44} s={23} w={700} a="middle">
        {c.labels[2]}
      </T>
      <T x={xb} y={FEET_A + 70} s={18} c={SOFT} a="middle">
        {c.labels[3]}
      </T>
    </g>
  );
};

/** One magnified head: the 640 px figure (its own face budget), drawn with its feet at (0, 0) inside a window round its
 *  head. Vector, so the zoom adds no blur of its own. */
const HeadCrop: React.FC<{x: number; y: number; head: XY; label: string; children: React.ReactNode}> = ({x, y, head, label, children}) => {
  const vw = FACE_W / ZOOM;
  const vh = FACE_H / ZOOM;
  return (
    <g>
      <rect x={x} y={y} width={FACE_W} height={FACE_H} rx={10} fill={PANEL} />
      <svg x={x} y={y} width={FACE_W} height={FACE_H} viewBox={`${head[0] - vw / 2} ${head[1] - vh * 0.36} ${vw} ${vh}`}>
        {children}
      </svg>
      <T x={x + FACE_W / 2} y={y + FACE_H + 30} s={19} c={SOFT} a="middle">
        {label}
      </T>
    </g>
  );
};

/** Row F: the faces of the 640 px figures, magnified 2.4x: a 3/4 face and a profile per column. */
const RowF: React.FC<{c: Col; i: number}> = ({c, i}) => {
  const xa = i * CW + 22;
  const xb = i * CW + 22 + FACE_W + 16;
  const y = Y_F + 60;
  if (c.key === 'now')
    return (
      <g>
        <HeadCrop x={xa} y={y} head={nowHead(NOW_REAR)} label={c.faces[0]}>
          <Now x={0} y={0} h={HA} pose={NOW_REAR} shadow={null} />
        </HeadCrop>
        <HeadCrop x={xb} y={y} head={nowHead(NOW_WALK)} label={c.faces[1]}>
          <Now x={0} y={0} h={HA} pose={NOW_WALK} shadow={null} />
        </HeadCrop>
      </g>
    );
  if (c.key === 'ed')
    return (
      <g>
        <HeadCrop x={xa} y={y} head={edHead(ED_SERENE, ED_SERENE_POSE)} label={c.faces[0]}>
          <EdPerson x={0} y={0} h={HA} person={ED_SERENE} pose={ED_SERENE_POSE} shadow={null} />
        </HeadCrop>
        <HeadCrop x={xb} y={y} head={edHead(ED_EVENING, ED_POSES.herEveningProfile)} label={c.faces[1]}>
          <EdPerson x={0} y={0} h={HA} person={ED_EVENING} pose={ED_POSES.herEveningProfile} shadow={null} />
        </HeadCrop>
      </g>
    );
  if (c.key === 'pt')
    return (
      <g>
        <HeadCrop x={xa} y={y} head={ptHead('herEvening', 'front34', 'front34')} label={c.faces[0]}>
          <Pt x={0} y={0} h={HA} who="herEvening" view="front34" pose="front34" uid="cF1" />
        </HeadCrop>
        <HeadCrop x={xb} y={y} head={ptHead('herEvening', 'profileL', 'profile')} label={c.faces[1]}>
          <Pt x={0} y={0} h={HA} who="herEvening" view="profileL" pose="profile" uid="cF2" />
        </HeadCrop>
      </g>
    );
  return (
    <g>
      <HeadCrop x={xa} y={y} head={grHead('herEvening', 'q')} label={c.faces[0]}>
        <Gr x={0} y={0} h={HA} who="herEvening" view="q" uid="cF3" />
      </HeadCrop>
      <HeadCrop x={xb} y={y} head={grHead('herEvening', 'p')} label={c.faces[1]}>
        <Gr x={0} y={0} h={HA} who="herEvening" view="p" uid="cF4" />
      </HeadCrop>
    </g>
  );
};

/** Row B: the cast at film size, 200 px, on one mid-tone ground. */
const RowB: React.FC<{c: Col; i: number}> = ({c, i}) => {
  const x0 = i * CW;
  const xs = [80, 190, 300, 410, 520].map((d) => x0 + d);
  const y = FEET_B;
  let figs: React.ReactNode;
  let note = 'her evening (3/4, back), her weekend, a man, a woman';
  if (c.key === 'now') {
    note = 'her: rear 3/4, walking in profile, from behind';
    figs = (
      <>
        <Now x={x0 + 140} y={y} h={HB} pose={NOW_REAR} shadow="#B09A95" />
        <Now x={x0 + 300} y={y} h={HB} pose={NOW_WALK} shadow="#B09A95" />
        <Now x={x0 + 460} y={y} h={HB} pose={NOW_BACK} shadow="#B09A95" />
      </>
    );
  } else if (c.key === 'ed') {
    const sh = '#9A7464';
    figs = (
      <>
        <Ed x={xs[0]} y={y} h={HB} p={ED_EVENING} pose={ED_POSES.herEveningFront} shadow={sh} />
        <Ed x={xs[1]} y={y} h={HB} p={ED_EVENING} pose={ED_POSES.herEveningBack} shadow={sh} />
        <Ed x={xs[2]} y={y} h={HB} p={ED_WEEKEND} pose={ED_POSES.herWeekendFront} shadow={sh} />
        <Ed x={xs[3]} y={y} h={HB} p={ED_MAN} pose={ED_POSES.manFront} shadow={sh} />
        <Ed x={xs[4]} y={y} h={HB} p={ED_WOMAN} pose={ED_POSES.womanFront} flip shadow={sh} />
      </>
    );
  } else if (c.key === 'pt') {
    figs = (
      <>
        <Pt x={xs[0]} y={y} h={HB} who="herEvening" view="front34" pose="front34" uid="cB1" />
        <Pt x={xs[1]} y={y} h={HB} who="herEvening" view="back" pose="back" uid="cB2" />
        <Pt x={xs[2]} y={y} h={HB} who="herWeekend" view="front34" pose="front34" uid="cB3" />
        <Pt x={xs[3]} y={y} h={HB} who="man" view="front34" pose="front34" uid="cB4" />
        <Pt x={xs[4]} y={y} h={HB} who="woman" view="front34" pose="front34" uid="cB5" />
      </>
    );
  } else {
    figs = (
      <>
        <Gr x={xs[0]} y={y} h={HB} who="herEvening" view="q" uid="cB6" />
        <Gr x={xs[1]} y={y} h={HB} who="herEvening" view="b" uid="cB7" />
        <Gr x={xs[2]} y={y} h={HB} who="herWeekend" view="q" uid="cB8" />
        <Gr x={xs[3]} y={y} h={HB} who="man" view="q" uid="cB9" />
        <Gr x={xs[4]} y={y} h={HB} who="woman" view="q" uid="cB10" />
      </>
    );
  }
  return (
    <g>
      {i > 0 ? <line x1={x0} y1={Y_B + 70} x2={x0} y2={Y_B + H_B - 20} stroke="#BBA6A2" strokeWidth={2} /> : null}
      {figs}
      <T x={x0 + CW / 2} y={Y_B + H_B - 18} s={18} c={LIGHT_INK} a="middle">
        {note}
      </T>
    </g>
  );
};

/** Row C: her in the painted still v6's doorway, the same plate for all, 2x. */
const RowC: React.FC<{c: Col; i: number}> = ({c, i}) => {
  const x = i * CW + (CW - DOOR_BOX) / 2;
  const y = Y_C + 60;
  const plate = c.key === 'now' ? DOOR_BEFORE : DOOR_AFTER;
  let fig: React.ReactNode = null;
  // each direction's own doorway figure, as its sheet places it (frame px of the still)
  if (c.key === 'ed') fig = <Ed x={686} y={1078.5} h={156} p={ED_EVENING} pose={ED_POSES.herDoor} flip shadow="#B49582" />;
  else if (c.key === 'pt') fig = <PainterlyFigure person={PT_CAST.herEvening} pose={PT_POSES.herEvening.profile} view="profileL" h={158} x={684} y={1083} uid="cC1" light={KEY_LEFT} />;
  else if (c.key === 'gr') fig = <Gr x={684} y={1083} h={156} who="herEvening" view="p" uid="cC2" shadowColor="#6A4A44" />;
  return (
    <g>
      <svg x={x} y={y} width={DOOR_BOX} height={DOOR_BOX} viewBox={`${DOOR_VIEW.x} ${DOOR_VIEW.y} ${DOOR_VIEW.w} ${DOOR_VIEW.h}`}>
        <image href={plate} x={DOOR_CROP.x} y={DOOR_CROP.y} width={DOOR_CROP.w} height={DOOR_CROP.h} />
        {fig}
      </svg>
      <rect x={x} y={y} width={DOOR_BOX} height={DOOR_BOX} fill="none" stroke={c.rec ? TEAL : '#D6C9C0'} strokeWidth={c.rec ? 4 : 2} rx={4} />
      <T x={x + DOOR_BOX / 2} y={y + DOOR_BOX + 34} s={21} c={SOFT} a="middle">
        {c.door}
      </T>
    </g>
  );
};

export const CompareSheet: React.FC = () => (
  <AbsoluteFill style={{background: PAGE}}>
    <svg width={CMP_W} height={CMP_H} viewBox={`0 0 ${CMP_W} ${CMP_H}`}>
      <rect x={0} y={0} width={CMP_W} height={CMP_H} fill={PAGE} />
      {/* header */}
      <T x={40} y={76} s={54} w={700}>
        People: three directions, side by side
      </T>
      <T x={40} y={122} s={24} c={SOFT}>
        Her in the autumn city evening look at 640 px (front 3/4 and from behind) and her face magnified, the cast at film size, her in the painted still v6, with our
      </T>
      <T x={40} y={154} s={24} c={SOFT}>
        current her for reference. Same panel, ground and plate for every column; each direction drawn by its own code. 2026-10-30. Rules: docs/look/PEOPLE_DESIGN.md.
      </T>

      {COLS.map((c, i) => (
        <RowA key={c.key} c={c} i={i} />
      ))}

      {/* F: the faces */}
      <T x={40} y={Y_F + 40} s={28} w={700}>
        The face: the same 640 px figures, magnified 2.4x (a face never looks at the camera; no eyes, mouths or dots)
      </T>
      {COLS.map((c, i) => (
        <RowF key={c.key} c={c} i={i} />
      ))}

      {/* B: the cast at film size on one mid-tone ground */}
      <rect x={0} y={Y_B} width={CMP_W} height={H_B} fill={MID} />
      <T x={40} y={Y_B + 44} s={27} w={700} c={LIGHT_INK}>
        At film size, 1:1: 200 px tall in the 1080 x 1920 frame (the "you" near the camera), all on one mid-tone ground
      </T>
      {COLS.map((c, i) => (
        <RowB key={c.key} c={c} i={i} />
      ))}

      {/* C: in the scene */}
      <T x={40} y={Y_C + 40} s={28} w={700}>
        In the scene: the painted still v6's doorway, her at the old her's spot and size (~156 px tall), shown 2x
      </T>
      {COLS.map((c, i) => (
        <RowC key={c.key} c={c} i={i} />
      ))}

      {/* D: verdicts and the recommendation */}
      {COLS.map((c, i) => (
        <g key={c.key}>
          {c.verdict.map((v, j) => (
            <T key={j} x={i * CW + 34} y={Y_D + 30 + j * 32} s={21} c={v.startsWith('+') ? INK : MINUS}>
              {v}
            </T>
          ))}
        </g>
      ))}
      <rect x={10} y={Y_D + 136} width={CMP_W - 20} height={150} rx={14} fill="#DCE7E2" />
      <rect x={10} y={Y_D + 136} width={10} height={150} rx={4} fill={TEAL} />
      <T x={44} y={Y_D + 182} s={29} w={700}>
        Recommended, a DRAFT until the owner picks: A, CLEAN EDITORIAL, drawn at 7.8-8.0 heads.
      </T>
      <T x={44} y={Y_D + 222} s={22}>
        Grafted from C: two flat tones under ~130 px, the shape budget by size, the black-silhouette test, the rim on the subject only. From B: the scene's own
      </T>
      <T x={44} y={Y_D + 254} s={22}>
        light rig (a warm key, the sky's cool edge), warm skin at the terminator in close shots, hair that hangs, far crowds as soft dabs. The system: PEOPLE_DESIGN.md.
      </T>
    </svg>
  </AbsoluteFill>
);
