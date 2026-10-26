// KitSheetLife: the G5b dressing and life kit on labelled screens (1080 x 1920 each), every piece at the sizes the panels
// use (docs/v3/density_plan_g5b.md §2), plus Pip's measured ΔE76 against every ground it sits on. KitSheet3 appends
// these screens under its own; the KitSheetLife composition renders them alone (faster to iterate):
//   npx remotion still src/entry-v3-kit.tsx KitSheetLife out.png --frame=150 --scale=0.5
import '../palette';
import React from 'react';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {Txt} from './util';
import {Pip3, PipTiny, PIP_EMBER} from './Pip3';
import {BackRow, Guard, TinyWalkers, Walker, WindowLife, WindowSilhouette, WinterPerson, Worker} from './People3';
import {BirdV, CloudBank, CoolingPlume, Frost, Icicles, NearRoofs, SkyClouds, Smoke, SnowLayers, SnowSill, Steam} from './Weather';
import {BookStack, Cable, CoatHook, DeskGrain, FramedPrint, Glasses, Headphones, PenCup, Pinboard, Plant, Poster, PullChain, Radiator, Rug, ShelfFill, Slippers, Speaker, StickyNotes, StringLights3, ToteBag, WallMarks, WallShelf} from './Room';
import {YouTiny} from './You';

export const LIFE_SCREENS = 2;

const Label: React.FC<{x: number; y: number; children: string; light?: boolean; size?: number}> = ({x, y, children, light, size = 28}) => (
  <Txt x={x} y={y} size={size} anchor="start" fill={light ? EMBER.white : EMBER.ink}>
    {children}
  </Txt>
);

// ---------------------------------------------------------------- ΔE76 (sRGB -> Lab D65)

const lab = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const X = (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047;
  const Y = c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
  const Z = (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883;
  const f = (v: number) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
};
export const deltaE = (a: string, b: string) => {
  const A = lab(a);
  const B = lab(b);
  return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
};

const GROUNDS: [string, string][] = [
  ['wall', EMBER.wall],
  ['desk', EMBER.desk],
  ['shelf', EMBER.shelf],
  ['sky', EMBER.sky],
  ['skyLow', EMBER.skyLow],
  ['dc', EMBER.dc],
  ['snow', EMBER.snow],
  ['road', EMBER.road],
  ['brick', EMBER.brick],
  ['pop', EMBER.pop],
  ['hero', EMBER.hero],
];

// ---------------------------------------------------------------- screen L1: Pip + people

const ScreenPipPeople: React.FC<{y0: number}> = ({y0}) => {
  const poses: {pose: 'sit-back' | 'sit-front' | 'trunk-up' | 'ears-cover' | 'shrug' | 'sleep' | 'peek' | 'hold'; look?: number; expression?: 'worried' | 'happy' | 'wide'}[] = [
    {pose: 'sit-back', look: -0.5},
    {pose: 'sit-front', expression: 'happy'},
    {pose: 'trunk-up', expression: 'wide'},
    {pose: 'ears-cover', expression: 'worried'},
    {pose: 'shrug'},
    {pose: 'sleep'},
    {pose: 'peek'},
    {pose: 'sit-back', look: 0.6},
  ];
  const grounds = [EMBER.wall, EMBER.desk, EMBER.sky, EMBER.snow];
  return (
    <g>
      <rect x={0} y={y0} width={1080} height={1920} fill={EMBER.wall} />
      <Label x={20} y={y0 + 40}>Pip3 in Autumn Ember (PIP_EMBER #A983C9): poses at scale 1 (~96 px) on wall / desk / sky / snow</Label>
      {grounds.map((g, gi) => (
        <rect key={gi} x={gi * 270} y={y0 + 60} width={270} height={330} fill={g} />
      ))}
      {poses.map((p, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const outdoor = col >= 2;
        return <Pip3 key={i} x={135 + col * 270} y={y0 + 210 + row * 160} pose={p.pose} look={p.look} expression={p.expression} outdoor={outdoor} snowCap={col === 3 ? 0.8 : 0} seed={i + 2} />;
      })}
      {/* close-ups + PipTiny scale */}
      <rect x={0} y={y0 + 390} width={540} height={360} fill={EMBER.desk} />
      <rect x={540} y={y0 + 390} width={540} height={360} fill={EMBER.sky} />
      <rect x={540} y={y0 + 650} width={540} height={100} fill={EMBER.frost} />
      <Pip3 x={170} y={y0 + 700} scale={1.8} pose="sit-back" look={0.4} lineWeight={1.25} seed={9} />
      <Pip3 x={400} y={y0 + 700} scale={1.6} pose="trunk-up" expression="wide" lineWeight={1.25} seed={10} />
      <Pip3 x={680} y={y0 + 650} scale={1} pose="sit-back" look={-0.3} outdoor snowCap={1} seed={11} />
      <rect x={780} y={y0 + 650} width={300} height={16} fill={EMBER.snow} />
      <PipTiny x={880} y={y0 + 650} h={56} />
      <YouTiny x={940} y={y0 + 650} h={184 * 0.5} />
      <Label x={20} y={y0 + 425} light>close-ups 1.8x / 1.6x (lineWeight 1.25)</Label>
      <Label x={560} y={y0 + 425} light>outdoor rim + snowCap, PipTiny 56 px</Label>
      {/* ΔE table */}
      <Label x={20} y={y0 + 790}>{"ΔE76 Pip body vs grounds (target >= 20):"}</Label>
      {GROUNDS.map(([k, v], i) => {
        const de = deltaE(PIP_EMBER.body, v);
        return (
          <g key={k}>
            <rect x={20 + (i % 6) * 175} y={y0 + 806 + Math.floor(i / 6) * 50} width={40} height={36} fill={v} stroke={EMBER.ink} strokeWidth={1} />
            <Txt x={68 + (i % 6) * 175} y={y0 + 834 + Math.floor(i / 6) * 50} size={24} anchor="start" fill={de < 20 ? EMBER.hero : EMBER.ink}>
              {`${k} ${de.toFixed(0)}`}
            </Txt>
          </g>
        );
      })}
      {/* people */}
      <rect x={0} y={y0 + 920} width={1080} height={500} fill={EMBER.wall} />
      <Label x={20} y={y0 + 955}>WinterPerson: earmuffs / umbrella+bag / coffee / clipboard / hi-vis+hardhat / badge cap / snow</Label>
      {(
        [
          {wear: ['earmuffs', 'snow'], hair: 'long'},
          {wear: ['umbrella', 'bag', 'snow'], hair: 'short'},
          {wear: ['coffee'], hair: 'beanie'},
          {wear: ['clipboard'], hair: 'curly'},
          {wear: ['hivis', 'hardhat'], hair: 'short'},
          {wear: ['badge'], hair: 'cap'},
          {wear: ['snow'], hair: 'beanie', acc: ['hood']},
        ] as const
      ).map((p, i) => (
        <WinterPerson key={i} x={80 + i * 152} y={y0 + 1300} s={1.25} seed={`sheet/wp${i}`} hair={p.hair} wear={[...p.wear]} acc={'acc' in p ? [...p.acc] : undefined} legs legH={70} />
      ))}
      {/* a tier-A row of backs, snow, one phone up, one pointing */}
      <rect x={0} y={y0 + 1420} width={1080} height={500} fill={EMBER.snow} />
      <Label x={20} y={y0 + 1455}>BackRow: heads 128 px, snow, a raised phone, a pointing arm, staggered breathing</Label>
      <BackRow x0={-20} x1={1100} top={y0 + 1560} head={128} n={5} seed="sheet/row" snow lookX={540} people={[{wear: ['earmuffs']}, {acc: ['phone']}, {hair: 'long', acc: ['scarf']}, {wear: ['point'], pointAt: 0}, {hair: 'beanie'}]} />
    </g>
  );
};

// ---------------------------------------------------------------- screen L2: window life, weather, walkers

const ScreenOutside: React.FC<{y0: number}> = ({y0}) => (
  <g>
    <rect x={0} y={y0} width={1080} height={1920} fill={EMBER.sky} />
    <SkyClouds x0={-100} x1={1180} y0={y0 + 70} y1={y0 + 260} n={4} seed="sheet/cl" />
    <Label x={20} y={y0 + 40} light>Weather: SkyClouds, NearRoofs (windows switching, silhouettes, smoke), SnowLayers, Frost, SnowSill</Label>
    {/* a window: near roofs behind glass */}
    <rect x={150} y={y0 + 320} width={780} height={460} fill={EMBER.beam} />
    <g>
      <defs>
        <clipPath id="sheetGlass">
          <rect x={180} y={y0 + 350} width={720} height={400} />
        </clipPath>
      </defs>
      <g clipPath="url(#sheetGlass)">
        <rect x={180} y={y0 + 350} width={720} height={400} fill={EMBER.sky} />
        <CloudBank y={y0 + 650} h={50} x0={180} x1={900} />
        <CoolingPlume x={480} y={y0 + 560} seed="sheet/pl1" ceil={y0 + 350} />
        <rect x={420} y={y0 + 560} width={200} height={140} fill={EMBER.dc} />
        <NearRoofs x0={180} x1={900} y={y0 + 752} h={[70, 110]} n={3} seed="sheet/nr" />
        <SnowLayers x={180} y={y0 + 350} w={720} h={400} band={null} seed="sheet/sn" density={1.4} />
        <Frost x={180} y={y0 + 350} w={720} h={400} corners={['bl', 'br', 'tl']} />
      </g>
    </g>
    <SnowSill x0={150} x1={930} y={y0 + 780} h={18} seed="sheet/sill" drips={3} />
    <Icicles x0={160} x1={920} y={y0 + 784} n={6} seed="sheet/ice" />
    {/* street: lamp-lit snow, mid walkers, tiny walkers */}
    <rect x={0} y={y0 + 880} width={1080} height={420} fill={EMBER.snow} />
    <rect x={0} y={y0 + 1060} width={1080} height={120} fill={EMBER.road} />
    <Label x={20} y={y0 + 920}>Walker (C) with a dog, TinyWalkers (D: sledge, dog, umbrella, pair), BirdV, Smoke, Steam</Label>
    <TinyWalkers from={[60, y0 + 1060]} to={[1020, y0 + 1030]} n={12} h={[42, 24]} seed="sheet/tw" />
    <Walker from={[-60, y0 + 1250]} to={[1140, y0 + 1250]} h={220} speed={90} seed="sheet/wk" dog phase={0.35} />
    <Walker from={[1140, y0 + 1190]} to={[-60, y0 + 1190]} h={150} speed={70} seed="sheet/wk2" wear={['umbrella', 'snow']} phase={0.6} />
    <BirdV at={0} from={[100, y0 + 700]} to={[600, y0 + 640]} dur={3} />
    <Smoke x={980} y={y0 + 860} seed="sheet/smk" />
    <rect x={960} y={y0 + 860} width={40} height={30} fill={EMBER.roofs} />
    {/* windows */}
    <rect x={0} y={y0 + 1300} width={1080} height={620} fill={EMBER.dc} />
    <Label x={20} y={y0 + 1340} light>WindowSilhouette (cross / read / wave / cook) + WindowLife (switching), Worker, Guard</Label>
    {(['cross', 'read', 'wave', 'cook'] as const).map((w, i) => (
      <WindowSilhouette key={w} x={40 + i * 130} y={y0 + 1380} w={100} h={120} who={w} far={false} curtains={i % 2 === 0} plant={i === 1} seed={`sheet/ws${i}`} />
    ))}
    <WindowLife seed="sheet/life" windows={Array.from({length: 8}, (_, i) => ({x: 590 + (i % 4) * 115, y: y0 + 1380 + Math.floor(i / 4) * 90, w: 70, h: 60, who: i === 2 ? ('cross' as const) : i === 5 ? ('read' as const) : undefined}))} />
    <rect x={0} y={y0 + 1640} width={1080} height={280} fill={EMBER.road} />
    <Worker x={200} y={y0 + 1860} h={110} carry seed="sheet/wk1" walk={{a: 140, b: 360, dur: 2}} />
    <Worker x={420} y={y0 + 1860} h={90} seed="sheet/wk3" />
    <Guard x={640} y={y0 + 1860} h={110} waveAt={0.5} />
    <WinterPerson x={860} y={y0 + 1760} s={0.9} legs seed="sheet/wpc" wear={['coffee', 'snow']} hair="beanie" />
  </g>
);

// ---------------------------------------------------------------- screen L3: room dressing

const ScreenRoom: React.FC<{y0: number}> = ({y0}) => (
  <g>
    <rect x={0} y={y0} width={1080} height={1920} fill={EMBER.wall} />
    <Label x={20} y={y0 + 40}>Room: ShelfFill, Plant (pothos / succulent / snake / floor / cactus), StringLights3, Pinboard, prints</Label>
    <StringLights3 from={[-20, y0 + 70]} to={[1100, y0 + 110]} sag={50} n={12} r={9} seed="sheet/sl" />
    {/* a shelf unit */}
    <rect x={20} y={y0 + 200} width={300} height={660} fill={EMBER.shelf} />
    {[380, 560, 740, 850].map((py, i) => (
      <rect key={i} x={10} y={y0 + py} width={320} height={16} fill={EMBER.beam} />
    ))}
    <ShelfFill planks={[{x0: 26, x1: 314, y: y0 + 380, room: 170}, {x0: 26, x1: 314, y: y0 + 560, room: 170}, {x0: 26, x1: 314, y: y0 + 740, room: 170}]} seed="sheet/shelf" />
    <Plant x={420} y={y0 + 420} kind="succulent" size={70} seed="sheet/su" />
    <Plant x={540} y={y0 + 420} kind="cactus" size={110} seed="sheet/ca" />
    <Plant x={660} y={y0 + 420} kind="snake" size={200} seed="sheet/sn" />
    <Plant x={420} y={y0 + 640} kind="pothos" size={90} trail={200} seed="sheet/po" />
    <Plant x={960} y={y0 + 860} kind="floor" size={420} seed="sheet/fl" />
    <Pinboard x={490} y={y0 + 480} w={300} h={220} seed="sheet/pin" />
    <FramedPrint x={830} y={y0 + 200} w={150} h={190} picture="mountain" seed="sheet/fp1" />
    <FramedPrint x={830} y={y0 + 420} w={120} h={100} picture="sea" seed="sheet/fp2" />
    <Poster x={520} y={y0 + 740} w={120} h={160} kind="flyer" seed="sheet/fly" rot={-3} />
    <Poster x={670} y={y0 + 740} w={120} h={160} kind="concert" seed="sheet/con" rot={4} />
    <WallShelf x={360} y={y0 + 1000} w={260} seed="sheet/wsh" />
    <WallMarks x={650} y={y0 + 900} w={400} h={200} seed="sheet/wm" />
    <PullChain x={1000} y={y0 + 900} />
    {/* desk */}
    <rect x={0} y={y0 + 1100} width={1080} height={420} fill={EMBER.desk} />
    <Label x={20} y={y0 + 1140}>Desk: PenCup, Headphones, BookStack, StickyNotes, Cable, Glasses, Speaker, DeskGrain</Label>
    <DeskGrain x={0} y={y0 + 1160} w={1080} h={360} n={8} seed="sheet/gr" />
    <PenCup x={90} y={y0 + 1300} seed="sheet/pc" />
    <Headphones x={250} y={y0 + 1300} seed="sheet/hp" />
    <BookStack x={360} y={y0 + 1300} w={130} n={3} seed="sheet/bs" />
    <Speaker x={560} y={y0 + 1300} seed="sheet/spk" />
    <StickyNotes x={640} y={y0 + 1220} n={3} size={64} seed="sheet/st" />
    <Glasses x={880} y={y0 + 1270} seed="sheet/gl" />
    <Cable points={[[120, y0 + 1420], [300, y0 + 1470], [520, y0 + 1400], [760, y0 + 1480], [1100, y0 + 1440]]} plug />
    {/* S13 floor */}
    <rect x={0} y={y0 + 1520} width={1080} height={400} fill={EMBER.books[6]} />
    <Label x={20} y={y0 + 1560}>S13: Radiator + sock, Rug, CoatHook, ToteBag, Slippers</Label>
    <Rug quad={[[120, y0 + 1640], [760, y0 + 1640], [880, y0 + 1880], [40, y0 + 1880]]} seed="sheet/rug" />
    <ToteBag x={900} y={y0 + 1700} seed="sheet/tote" />
    <Slippers x={540} y={y0 + 1800} seed="sheet/slip" />
    <XG m={mat.translate(0, 0)}>
      <Radiator x={640} y={y0 + 1320} w={400} h={160} seed="sheet/rad" />
      <CoatHook x={960} y={y0 + 1000} h={300} seed="sheet/coat" />
    </XG>
    <Steam x={200} y={y0 + 1180} seed="sheet/steam" />
  </g>
);

export const KitSheetLifeScreens: React.FC<{y0?: number}> = ({y0 = 0}) => (
  <>
    <ScreenPipPeople y0={y0} />
    <ScreenOutside y0={y0 + 1920} />
    <ScreenRoom y0={y0 + 3840} />
  </>
);

export const LIFE_SHEET = {w: 1080, h: 1920 * 3};

export const KitSheetLife: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: EMBER.wall}}>
    <svg width={LIFE_SHEET.w} height={LIFE_SHEET.h} viewBox={`0 0 ${LIFE_SHEET.w} ${LIFE_SHEET.h}`} style={{position: 'absolute', left: 0, top: 0}}>
      <KitSheetLifeScreens />
    </svg>
  </div>
);
