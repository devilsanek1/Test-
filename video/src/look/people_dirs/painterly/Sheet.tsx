// people_dirs/painterly: the direction's sheet (docs/look/people_design/dir_painterly.png; dir_painterly.md). One frame,
// 2400 px wide: her in two outfits x three views at 640 px; the two supporting people (3/4, 640 px); the face treatment
// (heads drawn at 1700 px, the face as a soft suggestion); the whole cast at film size (200 and 140 px) on a mid-tone
// ground; her in the painted still v6's doorway (before / after, 1:1 and 2x).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PainterlyFigure, type View, KEY_LEFT, camFor, headCentre} from './PtFigure';
import {CAST, CAST_POSES, type Views} from './cast';
import {DOOR_AFTER, DOOR_BEFORE, DOOR_CROP, DOOR_SPOT} from './doorway';
import {poseKey} from './Test';

export const SHEET_W = 2400;
const Y_HER = 150;
const H_HER = 820;
const Y_SUP = Y_HER + H_HER;
const H_SUP = 820;
const Y_FILM = Y_SUP + H_SUP;
const H_FILM = 600;
const Y_DOOR = Y_FILM + H_FILM;
const H_DOOR = 720;
export const SHEET_H = Y_DOOR + H_DOOR;

const INK = '#3A2A2C';
const SOFT = '#7A6468';
const FONT = 'DejaVu Sans, Helvetica, Arial, sans-serif';

const Label: React.FC<{x: number; y: number; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number; children: React.ReactNode}> = ({
  x,
  y,
  size = 24,
  color = SOFT,
  anchor = 'middle',
  weight = 400,
  children,
}) => (
  <text x={x} y={y} fontSize={size} fill={color} textAnchor={anchor} fontFamily={FONT} fontWeight={weight}>
    {children}
  </text>
);

const fig = (who: string, view: View, h: number, x: number, y: number, uid: string, pose?: keyof Views) => {
  const p = CAST[who];
  const ps = CAST_POSES[who][pose ?? poseKey(view)];
  return <PainterlyFigure key={uid} person={p} pose={ps} view={view} h={h} x={x} y={y} uid={uid} />;
};

/** The direction's palette as worn (the rig derives each material's lit, shade, highlight and rim planes from these). */
const PALETTE: {name: string; c: string[]}[] = [
  {name: 'skin', c: ['#E0B196', '#C79671', '#8B5A42']},
  {name: 'hair', c: ['#8C4C33', '#3A2B27', '#2B2324']},
  {name: 'her', c: ['#0B8577', '#2E2426', '#EFE5D8', '#6E2E33', '#476E8E']},
  {name: 'cast', c: ['#B58058', '#254161', '#F0EAE1', '#664334', '#2E2426']},
  {name: 'rig', c: ['#F2C98A', '#9C8FC0']},
];

const VIEW_NAME: Record<string, string> = {front34: 'front 3/4, standing', profileL: 'profile, walking', back: 'from behind, turning'};

/** A head crop: the figure drawn at 640 px (the face budget of a 640 px figure), shown `zoom` x, centred on the head. */
const HeadCrop: React.FC<{who: string; view: View; x: number; y: number; w: number; h: number; uid: string; label: string; zoom?: number}> = ({who, view, x, y, w, h, uid, label, zoom = 2.6}) => {
  const H = 640;
  const p = CAST[who];
  const ps = CAST_POSES[who][poseKey(view)];
  const cam = camFor({view, h: H, x: 0, y: 0});
  const [hx, hy] = headCentre(p, ps, cam);
  const vw = w / zoom;
  const vh = h / zoom;
  const vx = hx - vw / 2;
  const vy = hy - vh * 0.36;
  return (
    <g>
      <svg x={x} y={y} width={w} height={h} viewBox={`${vx} ${vy} ${vw} ${vh}`}>
        <rect x={vx} y={vy} width={vw} height={vh} fill="#D8CACA" />
        <PainterlyFigure person={p} pose={ps} view={view} h={H} x={0} y={0} uid={uid} />
      </svg>
      <Label x={x + w / 2} y={y + h + 34} size={21}>
        {label}
      </Label>
    </g>
  );
};

export const PtSheet: React.FC = () => {
  const slot = 400;
  // the her row: evening (left half), weekend (right half)
  const herViews: View[] = ['front34', 'profileL', 'back'];
  const filmCast: [string, View][] = [
    ['herEvening', 'front34'],
    ['herEvening', 'profileL'],
    ['herEvening', 'back'],
    ['herWeekend', 'front34'],
    ['herWeekend', 'profileL'],
    ['herWeekend', 'back'],
    ['man', 'front34'],
    ['man', 'profileL'],
    ['woman', 'front34'],
    ['woman', 'back'],
  ];
  const dc = DOOR_CROP;
  return (
    <AbsoluteFill style={{background: '#EFE7E3'}}>
      <svg width={SHEET_W} height={SHEET_H} viewBox={`0 0 ${SHEET_W} ${SHEET_H}`}>
        {/* header */}
        <Label x={60} y={78} size={52} color={INK} anchor="start" weight={700}>
          People: SOFT PAINTERLY
        </Label>
        <Label x={60} y={124} size={26} anchor="start">
          Natural proportions (7.8 heads), 2-3 painted value planes per form, a warm key and a cool sky rim, soft inside and crisp at the silhouette; the face a soft suggestion.
        </Label>

        {/* HER: two outfits x three views, 640 px */}
        <rect x={0} y={Y_HER} width={SHEET_W} height={H_HER} fill="#E2D6D3" />
        <Label x={60} y={Y_HER + 50} size={30} color={INK} anchor="start" weight={700}>
          HER (27), the lead. Autumn city evening
        </Label>
        <Label x={1260} y={Y_HER + 50} size={30} color={INK} anchor="start" weight={700}>
          Casual weekend
        </Label>
        <line x1={1200} y1={Y_HER + 20} x2={1200} y2={Y_HER + H_HER - 20} stroke="#CDBFBC" strokeWidth={2} />
        {herViews.map((v, i) => fig('herEvening', v, 640, slot * i + slot / 2, Y_HER + 120 + 640, `he${i}`))}
        {herViews.map((v, i) => fig('herWeekend', v, 640, 1200 + slot * i + slot / 2, Y_HER + 120 + 640, `hw${i}`))}
        {herViews.map((v, i) => (
          <React.Fragment key={`hl${i}`}>
            <Label x={slot * i + slot / 2} y={Y_HER + H_HER - 22} size={22}>
              {VIEW_NAME[v as string]}
            </Label>
            <Label x={1200 + slot * i + slot / 2} y={Y_HER + H_HER - 22} size={22}>
              {VIEW_NAME[v as string]}
            </Label>
          </React.Fragment>
        ))}

        {/* the two supporting people (3/4, 640 px) and the face treatment */}
        <Label x={60} y={Y_SUP + 50} size={30} color={INK} anchor="start" weight={700}>
          Two supporting people, 3/4
        </Label>
        {fig('man', 'front34', 640, 210, Y_SUP + 120 + 640, 'sm')}
        {fig('woman', 'front34', 640, 600, Y_SUP + 120 + 640, 'sw')}
        <Label x={210} y={Y_SUP + H_SUP - 22} size={22}>
          suede chore jacket, white socks
        </Label>
        <Label x={600} y={Y_SUP + H_SUP - 22} size={22}>
          long open coat, dark column
        </Label>
        <Label x={860} y={Y_SUP + 50} size={30} color={INK} anchor="start" weight={700}>
          The face, a soft suggestion: as drawn at 640 px, shown 2.6x
        </Label>
        {(
          [
            ['herEvening', 'front34', 'lids lowered, lip tone'],
            ['herEvening', 'profileL', 'profile: skin edge'],
            ['herWeekend', 'back34', 'lost profile'],
            ['herWeekend', 'front34', 'the brim hides the eyes'],
            ['man', 'front34', 'deep skin, a sheen'],
            ['woman', 'front34', 'big sunglasses'],
          ] as [string, View, string][]
        ).map(([who, v, l], i) => (
          <HeadCrop key={`fc${i}`} who={who} view={v} x={860 + i * 252} y={Y_SUP + 90} w={240} h={620} uid={`fc${i}`} label={l} />
        ))}

        {/* the cast at film size on a mid-tone ground */}
        <rect x={0} y={Y_FILM} width={SHEET_W} height={H_FILM} fill="#A69092" />
        <Label x={60} y={Y_FILM + 50} size={30} color="#F6EEEA" anchor="start" weight={700}>
          At film size, 1:1: 200 px and 140 px tall
        </Label>
        {filmCast.map(([who, v], i) => fig(who, v, 200, 150 + i * 225, Y_FILM + 80 + 200, `f2${i}`))}
        {filmCast.map(([who, v], i) => fig(who, v, 140, 150 + i * 225, Y_FILM + 330 + 140 + 60, `f1${i}`))}

        {/* her in the painted still v6's doorway */}
        <Label x={60} y={Y_DOOR + 50} size={30} color={INK} anchor="start" weight={700}>
          In the scene: the painted still v6's doorway
        </Label>
        {/* before, 1:1 */}
        <svg x={60} y={Y_DOOR + 90} width={dc.w} height={dc.h} viewBox={`${dc.x} ${dc.y} ${dc.w} ${dc.h}`}>
          <image href={DOOR_BEFORE} x={dc.x} y={dc.y} width={dc.w} height={dc.h} />
        </svg>
        <Label x={60 + dc.w / 2} y={Y_DOOR + 90 + dc.h + 36} size={22}>
          before: v6 as painted (1:1)
        </Label>
        {/* after, 1:1 */}
        <svg x={60 + dc.w + 40} y={Y_DOOR + 90} width={dc.w} height={dc.h} viewBox={`${dc.x} ${dc.y} ${dc.w} ${dc.h}`}>
          <image href={DOOR_AFTER} x={dc.x} y={dc.y} width={dc.w} height={dc.h} />
          <PainterlyFigure person={CAST.herEvening} pose={CAST_POSES.herEvening.profile} view="profileL" h={DOOR_SPOT.h + 4} x={DOOR_SPOT.x} y={DOOR_SPOT.y} uid="dr1" light={KEY_LEFT} />
        </svg>
        <Label x={60 + dc.w * 1.5 + 40} y={Y_DOOR + 90 + dc.h + 36} size={22}>
          after: her, same spot and size (1:1)
        </Label>
        {/* after, 2x zoom on the doorway */}
        <svg x={60 + dc.w * 2 + 80} y={Y_DOOR + 70} width={560} height={600} viewBox="580 800 280 300">
          <image href={DOOR_AFTER} x={dc.x} y={dc.y} width={dc.w} height={dc.h} />
          <PainterlyFigure person={CAST.herEvening} pose={CAST_POSES.herEvening.profile} view="profileL" h={DOOR_SPOT.h + 4} x={DOOR_SPOT.x} y={DOOR_SPOT.y} uid="dr2" light={KEY_LEFT} />
        </svg>
        <Label x={60 + dc.w * 2 + 80 + 280} y={Y_DOOR + 70 + 600 + 36} size={22}>
          2x
        </Label>

        {/* the black-fill test at 140 px and the palette */}
        <Label x={1800} y={Y_DOOR + 50} size={26} color={INK} anchor="start" weight={700}>
          Filled black, 140 px
        </Label>
        {(
          [
            ['herEvening', 'front34'],
            ['herWeekend', 'profileL'],
            ['man', 'front34'],
            ['woman', 'front34'],
          ] as [string, View][]
        ).map(([who, v], i) => {
          const pr = CAST[who];
          const ps = CAST_POSES[who][poseKey(v)];
          return <PainterlyFigure key={`bk${i}`} person={pr} pose={ps} view={v} h={140} x={1850 + i * 140} y={Y_DOOR + 80 + 150} uid={`bk${i}`} silhouette="#2A2022" />;
        })}
        <Label x={1800} y={Y_DOOR + 300} size={26} color={INK} anchor="start" weight={700}>
          Palette (as worn, before the light)
        </Label>
        {PALETTE.map((row, r) => (
          <g key={`pr${r}`}>
            <Label x={1800} y={Y_DOOR + 352 + r * 78} size={18} anchor="start">
              {row.name}
            </Label>
            {row.c.map((c, i) => (
              <rect key={c + i} x={1920 + i * 62} y={Y_DOOR + 326 + r * 78} width={54} height={40} rx={4} fill={c} />
            ))}
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
