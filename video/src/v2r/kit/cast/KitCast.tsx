// K4 cast sheet: every piece of the cast kit at every size the shot list uses, on one labelled sheet (2160 x 5760:
// two columns of 1080 x 1920 screens, 60 fps), plus two full test frames for the 216 px check beside reference 1:
//   KitCast     the sheet (her, the ghosts, the public, seated + near, staff windows + her window, crowds)
//   CastS1      S1's cast at its real sizes in a plain stand-in of the S1 layout (the cover moment, 5.30 s)
//   CastCrowd   a dense street of backs (reference 1's crowd grammar at our sizes)
//   CastWalk    a walk strip source (her rear 3/4, profile and back; the public) over 1 s
// Render: npx remotion still src/entry-v2r-cast.tsx KitCast out.png --frame=0 --scale=0.5 --gl=angle

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCaptionFont, captionFontStack} from '../../../lib/font';
import {TimeShift, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {ExitProvider, Look} from '../../../lib/exit';
import {CM, problems} from '../../palette';
import {s1RowAt, S2, W2_CUT, S1_HER_LOOK_BACK_AT} from '../../world/map';
import {traitProblems, HairKind, AccKind} from './traits';
import {Person, Seated, NearBack, WindowPerson} from './People';
import {Her, HerWindow, HER_SIZE} from './Her';
import {Ghost, BareOutline, GhostRow, S8Ghosts} from './Ghosts';
import {StaffWindow, Staffer, Reporter} from './Staff';
import {Stranger, CafeOwner} from './Extras';
import {FarCrowd, scatterCrowd} from './Crowd';
import {S1Seated} from './S1Seated';
import {Dog, DogCoat, DogPose, handAt} from './Dog';
import {stepsAt, strideFor} from './gait';

export const SHEET = {w: 2160, h: 5760};

const Label: React.FC<{x: number; y: number; size?: number; children: string; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, size = 26, children, anchor = 'start'}) => {
  const ok = useCaptionFont();
  if (!ok) return null;
  return (
    <text x={x} y={y} fontFamily={captionFontStack} fontSize={size} fill={CM.ink} textAnchor={anchor}>
      {children}
    </text>
  );
};

const Cell: React.FC<{x: number; y: number; w?: number; h?: number; title: string; bg?: string; children?: React.ReactNode}> = ({x, y, w = 1080, h = 1920, title, bg = CM.stucco, children}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={bg} />
    <XG m={mat.translate(x, y)}>
      {children}
      <Label x={24} y={44} size={34}>
        {title}
      </Label>
    </XG>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={CM.ink} strokeWidth={2} />
  </g>
);

/** A flat ground line under a row of figures. */
const Ground: React.FC<{y: number; x0?: number; x1?: number; color?: string}> = ({y, x0 = 0, x1 = 1080, color = CM.paving}) => (
  <>
    <Fill rect={[x0, y, x1 - x0, 46]} color={color} offset={false} />
    <Ink d={`M${x0 + 10} ${y}L${x1 - 10} ${y + 1}`} width={1.6} taper={false} />
  </>
);

// ---------------------------------------------------------------- screen A1: HER

const HerScreen: React.FC = () => {
  const strideS1 = strideFor(27, 170, 'rear34');
  const strideS4 = strideFor(34, 170, 'profile');
  const poses: {label: string; el: (x: number) => React.ReactNode}[] = [
    {label: 'walk r3/4', el: (x) => <Her x={x} y={330} step={0.0} stride={strideS1} plant />},
    {label: 'walk r3/4', el: (x) => <Her x={x} y={330} step={0.5} stride={strideS1} plant />},
    {label: 'walk prof', el: (x) => <Her x={x} y={330} view="profile" step={0.33} stride={strideS4} />},
    {label: 'walk back', el: (x) => <Her x={x} y={330} view="back" step={0.4} />},
    {label: 'stand', el: (x) => <Her x={x} y={330} pose="stand" />},
    {label: 'stopLook', el: (x) => <Her x={x} y={330} pose="stopLook" />},
    {label: 'lookBack', el: (x) => <Her x={x} y={330} pose="lookBack" plant />},
    {label: 'goIn', el: (x) => <Her x={x} y={330} h={150} pose="goIn" />},
  ];
  return (
    <>
      <Label x={24} y={84}>
        HER 170 px (S1 / S4): poses. No face, no features; teal coat is hers only.
      </Label>
      <Ground y={330} />
      {poses.map((p, i) => (
        <g key={i}>
          {p.el(80 + i * 128)}
          <Label x={80 + i * 128} y={400} size={20} anchor="middle">
            {p.label}
          </Label>
        </g>
      ))}
      <Label x={24} y={470}>
        sizes: 130 (floor) / 150 (S8) / 153 (S1 door) / 170 (S1, S4) / 200; profile 170 with tote
      </Label>
      <Ground y={720} />
      {[130, 150, 153, 170, 200].map((h, i) => (
        <g key={h}>
          <Her x={90 + i * 150} y={720} h={h} step={0.25} stride={strideS1} plant={h === 170 || h === 153} view={h === 150 ? 'back' : 'rear34'} />
          <Label x={90 + i * 150} y={785} size={20} anchor="middle">
            {`${h} px`}
          </Label>
        </g>
      ))}
      <Her x={880} y={720} view="profile" step={0.8} stride={strideS4} />
      <Her x={1000} y={720} view="profile" step={0} pose="stand" flip />
      <Label x={24} y={850}>
        walk strip, 12 drawings (2 steps, 6 drawings per step = 12/s at 2 steps/s): rear 3/4 with plant
      </Label>
      <Ground y={1050} />
      {Array.from({length: 12}, (_, i) => (
        <Her key={i} x={60 + i * 86} y={1050} step={i / 6} stride={strideS1} plant />
      ))}
      <Label x={24} y={1120}>
        profile (S4)
      </Label>
      <Ground y={1320} />
      {Array.from({length: 12}, (_, i) => (
        <Her key={i} x={60 + i * 86} y={1320} view="profile" step={i / 6} stride={strideS4} />
      ))}
      <Label x={24} y={1390}>
        back, 150 px (S8, walking home)
      </Label>
      <Ground y={1580} />
      {Array.from({length: 12}, (_, i) => (
        <Her key={i} x={60 + i * 86} y={1580} h={150} view="back" step={i / 6} />
      ))}
      <Label x={24} y={1650}>
        S1 coat-last (coatAt 0.30): t 0.2 paper coat / t 0.4 teal
      </Label>
      <Ground y={1880} />
      <TimeShift by={-0.2}>
        <Her x={200} y={1880} plant coatAt={0.3} step={0} stride={strideS1} />
      </TimeShift>
      <TimeShift by={-0.4}>
        <Her x={340} y={1880} plant coatAt={0.3} step={0} stride={strideS1} />
      </TimeShift>
      <Label x={480} y={1760} size={22}>
        {`look back at ${S1_HER_LOOK_BACK_AT}: turn 0 / 0.5 / 1`}
      </Label>
      {[0, 0.5, 1].map((k, i) => (
        <Her key={k} x={560 + i * 140} y={1880} pose="lookBack" look={k} plant />
      ))}
    </>
  );
};

// ---------------------------------------------------------------- screen B1: GHOSTS

const S1Backdrop: React.FC<{dy: number}> = ({dy}) => (
  <XG m={mat.translate(0, dy)}>
    <Fill rect={[0, 600, 1080, 200]} color={CM.bandGold} offset={false} />
    <Fill rect={[330, 640, 750, 442]} color={CM.limestone} offset={false} />
    <Fill rect={[0, 790, 330, 292]} color={CM.brickLight} offset={false} />
    <Fill rect={[540, 848, 180, 234]} color={CM.glass} offset={false} />
    <Fill rect={[785, 615, 150, 170]} color={CM.anchor} offset={false} />
    <Fill rect={[0, 1082, 1080, 28]} color={CM.paving} offset={false} />
    <Fill rect={[0, 1110, 1080, 110]} color={CM.water} offset={false} />
    <Ink d="M0 1095L1080 1095M0 1110L1080 1110" width={2.2} taper={false} />
  </XG>
);

const GhostScreen: React.FC = () => {
  const t = 5.3;
  const row = s1RowAt(t);
  const her = row[0];
  const stride = strideFor(27, 170, 'rear34');
  const step = stepsAt(t, [{from: 0.97, to: 4.54, rate: 1.48}, {from: 4.98, to: 5.25, rate: 3.7}]);
  return (
    <>
      <Label x={24} y={84}>
        S1 ghost row at the cover (5.30), map.ts s1RowAt, 1:1 (backdrop = plain stand-in)
      </Label>
      <S1Backdrop dy={-560} />
      <XG m={mat.translate(0, -560)}>
        <TimeShift by={-t}>
          <GhostRow step={step} stride={stride} />
          <Her x={her.x} y={her.feetY} h={her.h} step={step} stride={stride} plant />
        </TimeShift>
      </XG>
      <Label x={24} y={720}>
        G1-G6 at 170 px (age = whole-head value; G4+ scarf, softer back; G5-G6 shorter stride), O = bare outline
      </Label>
      <Ground y={940} />
      {[1, 2, 3, 4, 5, 6].map((a, i) => (
        <g key={a}>
          <Ghost x={90 + i * 140} y={940} h={170} age={a} step={0.5} stride={stride} />
          <Label x={90 + i * 140} y={1005} size={22} anchor="middle">
            {`G${a}`}
          </Label>
        </g>
      ))}
      <BareOutline x={940} y={940} h={130} step={0.5} stride={stride} />
      <Label x={940} y={1005} size={22} anchor="middle">
        O 130
      </Label>
      <Label x={24} y={1070}>
        the S1 sizes: G1 163 ... G6 135, outlines 130 / 126 / 121; back views (S8): 140 / 135 / 130
      </Label>
      <Ground y={1260} />
      {[
        [1, 163],
        [2, 157],
        [3, 151],
        [4, 145],
        [5, 140],
        [6, 135],
      ].map(([a, h], i) => (
        <Ghost key={a} x={70 + i * 95} y={1260} h={h} age={a} step={1.0} stride={stride} />
      ))}
      {[130, 126, 121].map((h, i) => (
        <BareOutline key={h} x={640 + i * 70} y={1260} h={h} step={1.0} stride={stride} seed={`o${i}`} />
      ))}
      <XG m={mat.translate(240, 240)}>
        <S8Ghosts at={-10} />
      </XG>
      <Label x={24} y={1400}>
        the pop: outline 0.10 s, paper fill 2 f later, 4-frame settle (G3 at +0, +2, +4, +6, +8, +14 f)
      </Label>
      <Ground y={1600} />
      {[0, 2, 4, 6, 8, 14].map((f, i) => (
        <TimeShift key={f} by={-(f / 60)}>
          <Ghost x={110 + i * 150} y={1600} h={160} age={3} at={0} seed={`pop${i}`} />
          <Label x={110 + i * 150} y={1660} size={22} anchor="middle">
            {`+${f} f`}
          </Label>
        </TimeShift>
      ))}
      <Label x={24} y={1740}>
        bare outline pop (O1, +0 / +3 / +6 f) and the knockout (no hidden strokes)
      </Label>
      <Ground y={1890} color={CM.water} />
      {[0, 3, 6, 12].map((f, i) => (
        <TimeShift key={f} by={-(f / 60)}>
          <BareOutline x={130 + i * 130} y={1890} h={130} at={0} seed={`opop${i}`} />
        </TimeShift>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- screen A2: THE PUBLIC

const HAIRS: HairKind[] = ['short', 'long', 'bun', 'lowBun', 'curls', 'crop', 'cap', 'beanie', 'hood', 'short', 'long', 'curls'];
const ACCS: AccKind[] = ['backpack', 'tote', 'strap', 'scarf', 'headphones', 'none', 'backpack', 'scarf', 'tote', 'headphones', 'strap', 'backpack'];

const PublicScreen: React.FC = () => {
  const t = useTime();
  return (
    <>
      <Label x={24} y={84}>
        the public: hair x coat x accessory, one each, no two neighbours alike, never teal (150 px backs)
      </Label>
      <Ground y={330} />
      {HAIRS.map((h, i) => (
        <Person key={i} x={50 + i * 89} y={330} h={150} seed={`pub/${i}`} traits={{hair: h, acc: ACCS[i]}} />
      ))}
      <Label x={24} y={400}>
        walkers (back, 12 drawings/s), rear 3/4, profile walk / jog / cycle / tiller (S4 boater), 120-130 px
      </Label>
      <Ground y={600} />
      <Person x={60} y={600} h={130} seed="w1" walk={{rate: 1.8}} />
      <Person x={160} y={600} h={128} seed="w2" walk={{rate: 1.9, phase: 0.5}} traits={{hair: 'long', acc: 'backpack'}} />
      <Person x={270} y={600} h={126} seed="w3" view="rear34" walk={{rate: 1.8}} />
      <Person x={380} y={600} h={130} seed="w4" view="rear34" walk={{rate: 1.8, phase: 0.6}} flip traits={{hair: 'beanie'}} />
      <Person x={490} y={600} h={128} seed="w5" view="profile" walk={{rate: 1.9}} traits={{acc: 'tote'}} />
      <Person x={600} y={600} h={124} seed="w6" view="profile" walk={{rate: 1.8, phase: 0.3}} flip traits={{acc: 'backpack'}} />
      <Person x={710} y={600} h={128} seed="j1" view="profile" pose="jog" walk={{rate: 2.8}} traits={{hair: 'cap', coat: CM.coatMustard}} />
      <Person x={850} y={600} h={124} seed="c1" view="profile" pose="cycle" traits={{hair: 'short', coat: CM.coatSlate}} />
      <Person x={1010} y={600} h={128} seed="b1" view="profile" pose="tiller" flip traits={{hair: 'beanie', coat: CM.brickDeep}} />
      <Label x={24} y={680}>
        level of detail: 300 / 220 / 160 / 120 (full) . 90 / 65 / 45 (simplified) . 32 / 22 (fill only)
      </Label>
      <Ground y={1040} />
      {[300, 220, 160, 120, 90, 65, 45, 32, 22].map((h, i, arr) => {
        const x = 70 + arr.slice(0, i).reduce((s, v) => s + Math.max(30, v * 0.42), 0) + i * 14;
        return (
          <g key={h}>
            <Person x={x + h * 0.21} y={1040} h={h} exact seed={`lod/${i}`} traits={{hair: i % 2 ? 'bun' : 'short', acc: i % 3 ? 'backpack' : 'scarf'}} />
            <Label x={x + h * 0.21} y={1090} size={20} anchor="middle">
              {`${h}`}
            </Label>
          </g>
        );
      })}
      <Label x={24} y={1160}>
        window people (12-60 px, never still): idle / water (tip animates) / read / phone; staff silhouette
      </Label>
      {[14, 22, 30, 40, 52].map((hb, i) => (
        <g key={hb}>
          <Fill rect={[40 + i * 150, 1190, 110, 150]} color={CM.lamp} offset={false} />
          <WindowPerson x={95 + i * 150} y={1340} hb={hb * 1.6} seed={`win/${i}`} act={(['idle', 'water', 'read', 'phone', 'water'] as const)[i]} tip={(Math.sin(t * 2) + 1) / 2} />
          <Ink d={`M${40 + i * 150} 1340L${150 + i * 150} 1340`} width={2.2} taper={false} />
          <Label x={95 + i * 150} y={1375} size={20} anchor="middle">
            {`${Math.round(hb * 1.6)} px`}
          </Label>
        </g>
      ))}
      <Label x={24} y={1450}>
        far walkers on a towpath (vx, wrap) and a far crowd, fill only, batched
      </Label>
      <Fill rect={[0, 1600, 1080, 30]} color={CM.paving} offset={false} />
      <FarCrowd
        spots={[
          {x: 100, y: 1600, h: 40, vx: 22, wrap: [-40, 1120], seed: 'f1'},
          {x: 300, y: 1600, h: 36, vx: -18, wrap: [-40, 1120], seed: 'f2'},
          {x: 520, y: 1600, h: 42, seed: 'f3'},
          {x: 700, y: 1600, h: 38, vx: 25, wrap: [-40, 1120], seed: 'f4'},
          {x: 860, y: 1600, h: 30, sit: true, seed: 'f5'},
        ]}
      />
      <Fill rect={[0, 1700, 1080, 220]} color={CM.sage} offset={false} />
      <FarCrowd spots={scatterCrowd({seed: 'sheet/lawn', n: 70, x0: 20, x1: 1060, yFar: 1730, yNear: 1900, hFar: 8, hNear: 30, walkers: 0.45})} />
    </>
  );
};

// ---------------------------------------------------------------- screen B2: SEATED + NEAR

const SeatedScreen: React.FC = () => {
  const t = useTime();
  return (
    <>
      <Label x={24} y={84}>
        S1 steps: the near row cut by the frame bottom (hv 250-330), middle (~110), low (~60)
      </Label>
      <Fill rect={[0, 120, 1080, 520]} color={CM.limestone} offset={false} />
      <g>
        <defs>
          <clipPath id="nearClip">
            <rect x={0} y={120} width={1080} height={520} />
          </clipPath>
        </defs>
        <g clipPath="url(#nearClip)">
          <XG m={mat.translate(0, -1280)}>
            <S1Seated only={['near']} />
          </XG>
        </g>
      </g>
      <Label x={24} y={690}>
        middle row 110 px: plain / cup 0.5 / cup 1 (at the mouth) / turn 0.6 / reading / phone up
      </Label>
      <Ground y={860} color={CM.limestone} />
      <Seated x={100} y={860} h={110} seed="m/a" />
      <Seated x={260} y={860} h={110} seed="m/b" cup={0.5} />
      <Seated x={420} y={860} h={110} seed="m/c" cup={1} />
      <Seated x={580} y={860} h={110} seed="m/d" turn={0.6} />
      <Seated x={760} y={860} h={110} seed="m/e" read />
      <Seated x={940} y={860} h={110} seed="m/f" phone />
      <Label x={24} y={920}>
        low row 60 px; tiny seated 40 / 30 px
      </Label>
      <Ground y={1010} color={CM.limestone} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Seated key={i} x={70 + i * 90} y={1010} h={60} seed={`low/${i}`} />
      ))}
      <Seated x={640} y={1010} h={40} seed="tiny/a" />
      <Seated x={720} y={1010} h={30} seed="tiny/b" />
      <Label x={24} y={1080}>
        S2 bench: reporter + staffer (190 px): 9.0 / 9.7 turn + notebook / 10.6 hood up / 13.0 shut
      </Label>
      {[9.0, 9.7, 10.6, 13.0].map((tt, i) => (
        <TimeShift key={tt} by={t - tt}>
          <Fill rect={[20 + i * 265, 1330, 245, 18]} color={CM.line} offset={false} />
          <Reporter x={75 + i * 265} y={1330} h={150} />
          <Staffer x={185 + i * 265} y={1330} h={190} />
          <Label x={140 + i * 265} y={1385} size={20} anchor="middle">
            {`${tt.toFixed(1)} s`}
          </Label>
        </TimeShift>
      ))}
      <Label x={24} y={1450}>
        S5 stranger (newspaper) 150 / 60 / 36 px; S8 cafe owner wiping (k 0 / 0.5 / 1), 170 px
      </Label>
      <Ground y={1660} color={CM.limestone} />
      <Stranger x={110} y={1660} h={150} />
      <Stranger x={260} y={1660} h={60} />
      <Stranger x={330} y={1660} h={36} />
      {[0, 0.5, 1].map((k, i) => (
        <TimeShift key={k} by={t - (1 + k * 0.45)}>
          <CafeOwner x={520 + i * 190} y={1880} h={170} wipeAt={1} />
        </TimeShift>
      ))}
      <Ground y={1880} color={CM.paving} />
    </>
  );
};

// ---------------------------------------------------------------- screen A3: STAFF WINDOWS + HER WINDOW

const WallPanel: React.FC<{x: number; y: number; tt: number; label: string}> = ({x, y, tt, label}) => {
  const t = useTime();
  // the region of S2 around the staff windows (x 120-560, y 690-1040) at 1:1
  return (
    <XG m={mat.translate(x - 120, y - 690)}>
      <Fill rect={[120, 690, 440, 350]} color={CM.brickLight} offset={false} />
      <Fill rect={[200 - 70, 795 - 85, 140, 170]} color={CM.anchor} offset={false} />
      <TimeShift by={t - tt}>
        {S2.staffWindows.map((s, i) => {
          const keys = [{t: S2.blindsAt + i * S2.blindsStagger, k: 0.5}];
          if (s.id === 'W2') keys.push({t: S2.w2BlindDownAt, k: 1});
          return <StaffWindow key={s.id} {...s} seed={s.id} lightAt={S2.staffOnAt + i * S2.staffOnStagger} backAt={S2.blindsAt + i * S2.blindsStagger} blind={keys} />;
        })}
      </TimeShift>
      {S2.staffWindows.map((s) => (
        <Ink key={s.id} d={`M${s.x - s.w / 2} ${s.y - s.h / 2}L${s.x + s.w / 2} ${s.y - s.h / 2}L${s.x + s.w / 2} ${s.y + s.h / 2}L${s.x - s.w / 2} ${s.y + s.h / 2}Z`} width={2.2} taper={false} />
      ))}
      <Label x={130} y={1030} size={22}>
        {label}
      </Label>
    </XG>
  );
};

const WindowsScreen: React.FC = () => {
  const t = useTime();
  return (
    <>
      <Label x={24} y={84}>
        S2 staff windows at map.ts spots (1:1): before / 8.96 lit + figure / 10.6 scared, half blinds, step back / 12.4 W2 down
      </Label>
      <WallPanel x={40} y={120} tt={8.9} label="8.90" />
      <WallPanel x={560} y={120} tt={9.2} label="9.20" />
      <WallPanel x={40} y={500} tt={10.7} label="10.70" />
      <WallPanel x={560} y={500} tt={12.5} label="12.50" />
      <Label x={24} y={930}>
        S3 her French window (W2_CUT 133 x 164), silhouette 137 px pacing, phone at her ear; 14.28 the free hand
      </Label>
      {[0, 0.6, 1.4, 2.2].map((ph, i) => {
        const x0 = 60 + i * 255;
        const wx = x0;
        const wy = 980;
        return (
          <g key={i}>
            <Fill rect={[wx - 20, wy - 20, W2_CUT.w + 40, W2_CUT.h + 60]} color={CM.brick} offset={false} />
            <Fill rect={[wx, wy, W2_CUT.w, W2_CUT.h]} color={CM.lamp} offset={false} />
            <TimeShift by={t - (i === 3 ? 14.43 : 13.2 + ph)}>
              <HerWindow x0={wx + 30} x1={wx + W2_CUT.w - 30} y={wy + W2_CUT.h - 2} h={137} gestureAt={14.28} phase={ph} />
            </TimeShift>
            <Ink d={`M${wx} ${wy}L${wx + W2_CUT.w} ${wy}L${wx + W2_CUT.w} ${wy + W2_CUT.h}L${wx} ${wy + W2_CUT.h}Z`} width={4} color={CM.hero} taper={false} />
            <Ink d={`M${wx} ${wy + W2_CUT.h - 40}L${wx + W2_CUT.w} ${wy + W2_CUT.h - 40}`} width={2.2} taper={false} />
          </g>
        );
      })}
      <Label x={24} y={1260}>
        sizes check: her 130 floor (red line) vs S3 silhouette 137 vs ghost G6 135 vs staffer seated 180 floor
      </Label>
      <Ground y={1500} />
      <Ink d="M20 1370L1060 1370" width={1.6} color={CM.pop} taper={false} />
      <Her x={100} y={1500} h={HER_SIZE.min} step={0.3} />
      <TimeShift by={t - 13.5}>
        <HerWindow x0={220} x1={221} y={1500} h={137} />
      </TimeShift>
      <Ghost x={340} y={1500} h={135} age={6} />
      <Staffer x={520} y={1500} h={180} />
      <Label x={24} y={1580}>
        engine states: Look paper (f0 bare line) / Look cascade / un-build e 0.25 / 0.5 / 0.75 (figures leave whole)
      </Label>
      <Ground y={1860} />
      <Look fills="paper">
        <Her x={80} y={1860} plant step={0.3} />
        <Ghost x={170} y={1860} h={160} age={3} />
        <Seated x={260} y={1860} h={110} seed="paperSeat" cup={0.3} />
      </Look>
      <Look cascade={{at: -0.05, origin: [380, 1700], speed: 900}}>
        <Person x={380} y={1860} h={160} seed="casc1" traits={{acc: 'backpack'}} />
        <Person x={460} y={1860} h={160} seed="casc2" traits={{hair: 'long'}} />
      </Look>
      {[0.25, 0.5, 0.75].map((e, i) => (
        <ExitProvider key={e} value={e}>
          <Her x={580 + i * 170} y={1860} plant step={0.3} />
          <Ghost x={650 + i * 170} y={1860} h={150} age={5} />
        </ExitProvider>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- screen B3: CROWDS + the S1 test frame (0.5)

const CrowdScreen: React.FC = () => (
  <>
    <Label x={24} y={84}>
      far crowds (batched, fill only) 6-45 px; the S1 test frame at 0.5 (CastS1 at 1:1 is the 216 px check)
    </Label>
    <Fill rect={[0, 110, 1080, 300]} color={CM.paving} offset={false} />
    <FarCrowd spots={scatterCrowd({seed: 'sheet/plaza', n: 120, x0: 10, x1: 1070, yFar: 140, yNear: 400, hFar: 6, hNear: 45, walkers: 0.5})} />
    <XG m={mat.compose(mat.translate(270, 440), mat.scale(0.5))}>
      <S1Test />
    </XG>
  </>
);

// ---------------------------------------------------------------- the S1 test frame (1080 x 1920)

/** S1's cast at the cover (5.30) in a plain stand-in of the S1 layout. Not the set: the lane builds that. */
export const S1Test: React.FC<{tt?: number}> = ({tt = 5.3}) => {
  const t = useTime();
  const row = s1RowAt(tt);
  const her = row[0];
  const stride = strideFor(27, 170, 'rear34');
  const step = stepsAt(tt, [{from: 0.97, to: 4.54, rate: 1.48}, {from: 4.98, to: 5.25, rate: 3.7}]);
  return (
    <TimeShift by={t - tt}>
      <Fill rect={[0, 0, 1080, 1920]} color={CM.sky} offset={false} />
      <Fill rect={[0, 600, 1080, 200]} color={CM.bandGold} offset={false} />
      <Fill rect={[0, 780, 330, 310]} color={CM.brickLight} offset={false} />
      <Fill rect={[40, 740, 120, 60]} color={CM.brick} offset={false} />
      <Fill rect={[180, 760, 110, 40]} color={CM.brickDeep} offset={false} />
      <Fill d="M200 610A80 80 0 1 0 200.1 610Z" color={CM.sun} offset={false} />
      <Fill rect={[330, 620, 750, 462]} color={CM.limestone} offset={false} />
      <Fill rect={[330, 600, 750, 30]} color={CM.sage} offset={false} />
      {[420, 560, 990].map((x, i) => (
        <Fill key={i} rect={[x - 60, 625, 120, 150]} color={i % 2 ? CM.lamp : CM.glass} offset={false} />
      ))}
      <Fill rect={[785, 615, 150, 170]} color={CM.anchor} offset={false} />
      <Fill rect={[520, 800, 220, 45]} color={CM.stucco} offset={false} />
      <Fill rect={[540, 848, 180, 234]} color={CM.glass} offset={false} />
      <Fill rect={[0, 1082, 1080, 28]} color={CM.paving} offset={false} />
      <Ink d="M330 620L330 1082M330 794L1080 794M540 848L720 848L720 1082M540 848L540 1082M630 848L630 1082" width={2.2} taper={false} />
      <Fill rect={[0, 1110, 1080, 110]} color={CM.water} offset={false} />
      <Ink d="M0 1095L1080 1095M0 1110L1080 1112" width={2.2} taper={false} />
      {/* our steps: five treads */}
      {[1215, 1330, 1450, 1600, 1760].map((y, i) => (
        <g key={y}>
          <Fill rect={[0, y, 1080, 1920 - y]} color={i % 2 ? CM.limestone : CM.paving} offset={false} />
          <Ink d={`M0 ${y}L1080 ${y + 1}`} width={i > 2 ? 4.8 : 3.4} taper={false} />
        </g>
      ))}
      {/* the far towpath: a cyclist and a jogger passing (the world passes through the row) */}
      <Person x={860} y={1095} h={165} seed="s1/cyc" view="profile" pose="cycle" flip traits={{coat: CM.coatSlate}} />
      <Person x={300} y={1078} h={150} seed="s1/jog" view="profile" pose="jog" walk={{rate: 2.8}} traits={{coat: CM.coatMustard, hair: 'cap'}} />
      <GhostRow t={tt} step={step} stride={stride} />
      <Her x={her.x} y={her.feetY} h={her.h} step={step} stride={stride} plant />
      <S1Seated />
    </TimeShift>
  );
};

/** A dense street of backs (ref 1's crowd grammar at our sizes): rows 40-200 px, near backs cut by the bottom. */
export const CrowdTest: React.FC = () => {
  const rows: {y: number; h: number; n: number}[] = [
    {y: 900, h: 46, n: 16},
    {y: 1000, h: 62, n: 13},
    {y: 1120, h: 84, n: 10},
    {y: 1270, h: 112, n: 8},
    {y: 1460, h: 150, n: 6},
  ];
  return (
    <>
      <Fill rect={[0, 0, 1080, 1920]} color={CM.sky} offset={false} />
      <Fill rect={[0, 600, 1080, 1320]} color={CM.paving} offset={false} />
      <Fill rect={[0, 560, 220, 600]} color={CM.brick} offset={false} />
      <Fill rect={[860, 560, 220, 600]} color={CM.brickLight} offset={false} />
      <FarCrowd spots={scatterCrowd({seed: 'ct/far', n: 90, x0: 200, x1: 880, yFar: 700, yNear: 860, hFar: 12, hNear: 40, walkers: 0.4})} />
      {rows.map((r, j) =>
        Array.from({length: r.n}, (_, i) => {
          const x = 60 + ((i + (j % 2) * 0.5) * 960) / r.n;
          return <Person key={`${j}/${i}`} x={x} y={r.y} h={r.h} seed={`ct/${j}/${i}`} walk={i % 3 === 0 ? {rate: 1.7, phase: i * 0.3} : undefined} />;
        }),
      )}
      {[120, 330, 540, 750, 960].map((x, i) => (
        <NearBack key={x} x={x} y={1920} hv={280 + (i % 3) * 22} seed={`ct/near/${i}`} />
      ))}
    </>
  );
};

/** The walk strip source: her (rear 3/4, profile, back) and two of the public, walking on the 12/s clock. */
export const WalkTest: React.FC = () => {
  const stride = strideFor(27, 170, 'rear34');
  return (
    <AbsoluteFill style={{background: CM.stucco}}>
      <svg width={1080} height={300} viewBox="0 0 1080 300">
        <Fill rect={[0, 240, 1080, 60]} color={CM.paving} offset={false} />
        <Her x={110} y={250} walk={{rate: 1.5}} stride={stride} plant />
        <Her x={300} y={250} view="profile" walk={{rate: 1.6}} stride={strideFor(34, 170, 'profile')} />
        <Her x={480} y={250} h={150} view="back" walk={{rate: 1.7}} />
        <Ghost x={640} y={250} h={160} age={5} step={undefined} />
        <Person x={800} y={250} h={150} seed="ws1" walk={{rate: 1.9}} traits={{hair: 'long', acc: 'backpack'}} />
        <Person x={960} y={250} h={140} seed="ws2" view="profile" pose="jog" walk={{rate: 2.8}} traits={{hair: 'cap'}} />
      </svg>
    </AbsoluteFill>
  );
};


/** Seated variants (the art director's must, 2026-10-27): the four arm states x three views, leans, a pair, a child. */
export const SeatTest: React.FC = () => {
  const ARMS = ['lap', 'knees', 'back', 'hug'] as const;
  const VIEWS = ['back', 'rear34', 'profile'] as const;
  return (
    <AbsoluteFill style={{background: CM.stucco}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {VIEWS.map((v, j) => (
          <g key={v}>
            <Fill rect={[0, 380 + j * 360, 1080, 40]} color={CM.limestone} offset={false} />
            {ARMS.map((a, i) => (
              <g key={a}>
                <Seated x={140 + i * 250} y={380 + j * 360} h={200} seed={`st/${v}/${a}`} arms={a} view={v} traits={{hair: (['short', 'bun', 'curls', 'beanie'] as const)[i], acc: (['backpack', 'scarf', 'tote', 'none'] as const)[i]}} />
                <Label x={140 + i * 250} y={420 + j * 360} size={22} anchor="middle">{`${v} ${a}`}</Label>
              </g>
            ))}
          </g>
        ))}
        <Fill rect={[0, 1460, 1080, 40]} color={CM.limestone} offset={false} />
        <Seated x={90} y={1460} h={150} seed="st/l1" lean={-6} arms="lap" />
        <Seated x={230} y={1460} h={150} seed="st/l2" lean={6} arms="knees" />
        <Seated x={400} y={1460} h={150} seed="st/p1" lean={7} arms="lap" traits={{hair: 'long'}} />
        <Seated x={490} y={1466} h={146} seed="st/p2" lean={-7} arms="lap" armAround={[-80, -100]} traits={{hair: 'short'}} />
        <Seated x={650} y={1460} h={150} seed="st/c1" arms="back" />
        <Seated x={760} y={1462} h={92} seed="st/kid" child arms="hug" traits={{hair: 'beanie'}} />
        <Seated x={900} y={1460} h={150} seed="st/cup" cup={1} side={1} view="rear34" flip />
        <Fill rect={[0, 1780, 1080, 40]} color={CM.limestone} offset={false} />
        {[100, 92, 76, 60, 44].map((h, i) => (
          <Seated key={h} x={80 + i * 120} y={1780} h={h} seed={`st/sz${i}`} arms={ARMS[i % 4]} view={i === 3 ? 'rear34' : 'back'} />
        ))}
        <Person x={760} y={1780} h={120} seed="st/kidS" child traits={{hair: 'curls'}} />
        <Person x={850} y={1780} h={190} seed="st/adultS" />
        <NearBack x={990} y={1920} hv={210} seed="st/nb" lean={5} />
      </svg>
    </AbsoluteFill>
  );
};


/** The dog (K4, 2026-10-27): poses x coats, sizes 30-90, the back view, a lead to a walker's hand, at 1:1. */
export const DogTest: React.FC = () => {
  const t = useTime();
  const POSES: DogPose[] = ['trot', 'walk', 'stand', 'sniff', 'sit', 'lie'];
  const COATS: DogCoat[] = ['gold', 'rust', 'brown'];
  const walker = {x: 760, y: 1700, h: 150};
  const reach: [number, number] = [-walker.h * 0.2, -walker.h * 0.45];
  const hand = handAt(walker.x, walker.y, reach);
  return (
    <AbsoluteFill style={{background: CM.stucco}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {COATS.map((c, j) => (
          <g key={c}>
            <Fill rect={[0, 300 + j * 300, 1080, 30]} color={CM.paving} offset={false} />
            {POSES.map((p, i) => (
              <g key={p}>
                <Dog x={110 + i * 170} y={300 + j * 300} h={90} pose={p} coat={c} seed={`dt/${c}/${p}`} walk={p === 'trot' ? {rate: 3.4} : p === 'walk' ? {rate: 2.2} : undefined} />
                <Label x={110 + i * 170} y={340 + j * 300} size={20} anchor="middle">{`${c} ${p}`}</Label>
              </g>
            ))}
          </g>
        ))}
        <Fill rect={[0, 1220, 1080, 30]} color={CM.paving} offset={false} />
        {[90, 70, 52, 40, 30].map((h, i) => (
          <Dog key={h} x={90 + i * 120} y={1220} h={h} pose="trot" view={i % 2 ? 'back' : 'side'} coat={COATS[i % 3]} seed={`dt/sz${i}`} walk={{rate: 3.2}} />
        ))}
        <Dog x={760} y={1220} h={60} pose="trot" view="back" coat="rust" seed="dt/back60" walk={{rate: 3.2}} />
        <Dog x={900} y={1220} h={48} pose="lie" coat="gold" seed="dt/lieDown" headDown />
        <Fill rect={[0, 1700, 1080, 40]} color={CM.paving} offset={false} />
        <Person x={walker.x} y={walker.y} h={walker.h} seed="dt/walker" pose="reach" view="profile" reach={reach} walk={{rate: 1.8}} traits={{acc: 'none'}} />
        <Dog x={560} y={1700} h={52} pose="sniff" coat="gold" seed="dt/lead" lead={hand} />
        <Dog x={260} y={1700} h={64} pose="trot" coat="brown" seed="dt/trot64" walk={{rate: 3.4, phase: 0.5}} flip />
        <Label x={24} y={60} size={28}>{`K4 DOG: poses x coats at 90 px; sizes 90-30 (side / back); lead; t ${t.toFixed(2)}`}</Label>
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the sheet

export const KitCast: React.FC = () => {
  const issues = [...problems(), ...traitProblems()];
  return (
    <AbsoluteFill style={{background: CM.paper}}>
      <svg width={SHEET.w} height={SHEET.h} viewBox={`0 0 ${SHEET.w} ${SHEET.h}`} style={{position: 'absolute', left: 0, top: 0}}>
        <Cell x={0} y={0} title="K4 CAST 1/6: HER">
          <HerScreen />
        </Cell>
        <Cell x={1080} y={0} title="2/6: THE GHOSTS" bg={CM.stucco}>
          <GhostScreen />
        </Cell>
        <Cell x={0} y={1920} title="3/6: THE PUBLIC">
          <PublicScreen />
        </Cell>
        <Cell x={1080} y={1920} title="4/6: SEATED, NEAR, THE BENCH, EXTRAS">
          <SeatedScreen />
        </Cell>
        <Cell x={0} y={3840} title="5/6: STAFF WINDOWS + HER WINDOW">
          <WindowsScreen />
        </Cell>
        <Cell x={1080} y={3840} title="6/6: CROWDS + S1 TEST">
          <CrowdScreen />
        </Cell>
        <XG m={mat.translate(0, 3840)}>
          <Label x={24} y={1912} size={22}>
            {issues.length ? `CHECKS: ${issues.slice(0, 3).join(' | ')}` : 'CHECKS: palette problems() and trait tables OK (nothing near teal)'}
          </Label>
        </XG>
      </svg>
    </AbsoluteFill>
  );
};

export const CastS1: React.FC = () => (
  <AbsoluteFill style={{background: CM.sky}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <S1Test />
    </svg>
  </AbsoluteFill>
);

export const CastCrowd: React.FC = () => (
  <AbsoluteFill style={{background: CM.sky}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <CrowdTest />
    </svg>
  </AbsoluteFill>
);
