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
import {BirdV, LowClouds, CoolingPlume, Frost, Icicles, NearFronts, SkyClouds, Smoke, SnowLayers, SnowSill, Steam} from './Weather';
import {BookStack, Cable, CoatHook, DeskGrain, FramedPrint, Glasses, Headphones, PenCup, Pinboard, Plant, Poster, PullChain, Radiator, Rug, ShelfFill, Slippers, Speaker, StickyNotes, StringLights3, ToteBag, WallMarks, WallShelf} from './Room';
import {YouTiny} from './You';
import {Bike3, BusStop, Car3, Fence, Floodlight, Forklift, GateBooth, HeadlightSweep, LampPost3, Pallet, Pavement, PostSign, RoadDress, SnowTree, StickCrate, UtilityPole3, WallLamp, Wire3} from './Street';
import {Bench, BootMat, CableTray, CardBoard, CardReader, Clipboard, CoffeeMachine, CounterBell, Cornice, DisplayWindow, DockWindow, Drainpipe, Fascia, LaptopBox, NoSmoking, PaperBag, ReceiptPrinter, ShopDoor, ShopShelving, ShopWindowView, StripLight, UsbJar} from './Shop';
import {FoldingChair, LaundryLine, Pennant, RoofAerials, RoofNeighbour, Shovel, SideTable, TownHouse, TownRow} from './Town';
import {Nook, NookOutside} from './Nook';
import {Phone, Hand, phonePoint, phoneSlots} from './Phone';
import {PriceTag} from './PriceTag';
import {ChartCard, LineChart} from './Charts';

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
    <Label x={20} y={y0 + 40} light>Weather: SkyClouds, NearFronts (windows switching, silhouettes, smoke), SnowLayers, Frost, SnowSill</Label>
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
        <LowClouds y={y0 + 650} h={50} x0={180} x1={900} />
        <CoolingPlume x={480} y={y0 + 560} seed="sheet/pl1" ceil={y0 + 350} />
        <rect x={420} y={y0 + 560} width={200} height={140} fill={EMBER.dc} />
        <NearFronts x0={180} x1={900} y={y0 + 752} h={[70, 110]} n={3} seed="sheet/nr" />
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

// ---------------------------------------------------------------- screen L4: street and industrial

const ScreenStreet: React.FC<{y0: number}> = ({y0}) => {
  const road = {yB: y0 + 1500, yT: y0 + 1010, xBL: 40, xBR: 640, xTL: 600, xTR: 700};
  return (
    <g>
      <rect x={0} y={y0} width={1080} height={1920} fill={EMBER.sky} />
      <Label x={20} y={y0 + 40} light>Street: LampPost3, SnowTree, Car3 (side / back / front), BusStop, Fence, GateBooth (barrier lifts)</Label>
      <rect x={0} y={y0 + 560} width={1080} height={1360} fill={EMBER.snow} />
      <LampPost3 x={90} y={y0 + 560} h={300} seed="sh/lp1" />
      <LampPost3 x={230} y={y0 + 560} h={160} arm="right" seed="sh/lp2" />
      <LampPost3 x={330} y={y0 + 560} h={70} seed="sh/lp3" />
      <SnowTree x={430} y={y0 + 560} h={220} seed="sh/t1" />
      <SnowTree x={530} y={y0 + 560} h={200} kind="bare" seed="sh/t2" />
      <SnowTree x={600} y={y0 + 560} h={90} seed="sh/t3" />
      <BusStop x={820} y={y0 + 560} h={200} seed="sh/bus" />
      <Car3 x={170} y={y0 + 760} w={220} view="side" seed="sh/c1" exhaust />
      <Car3 x={470} y={y0 + 760} w={150} view="back" color={EMBER.beam} seed="sh/c2" exhaust />
      <Car3 x={680} y={y0 + 760} w={150} view="front" color={EMBER.reveal} seed="sh/c3" />
      <Car3 x={900} y={y0 + 760} w={140} view="side" dir={-1} color={EMBER.card} lights={false} seed="sh/c4" />
      <Label x={20} y={y0 + 830}>RoadDress (kerbs, banks, tracks, dashes, manhole steam, footprints), Fence, GateBooth, PostSign, Forklift</Label>
      <RoadDress road={road} seed="sh/road" />
      <Fence a={[700, y0 + 1290]} b={[900, y0 + 1060]} h0={80} h1={30} posts={9} seed="sh/fence" />
      <GateBooth x={930} y={y0 + 1060} w={130} liftAt={[1.2]} armSide="left" arm={180} seed="sh/booth" />
      <PostSign x={860} y={y0 + 1400} w={200} text="DELIVERIES" seed="sh/sign" />
      <Pallet x={760} y={y0 + 1480} w={120} seed="sh/pal" />
      <StickCrate x={760} y={y0 + 1458} w={100} seed="sh/crate" />
      <rect x={0} y={y0 + 1540} width={1080} height={380} fill={EMBER.brick} />
      <Floodlight x={120} y={y0 + 1600} seed="sh/fl" />
      <Forklift y={y0 + 1880} w={170} loop={{a: 300, b: 520, dur: 1.6, hold: 0.8}} seed="sh/fork" />
      <UtilityPole3 x={980} y={y0 + 1900} h={360} seed="sh/pole" />
      <Wire3 a={[600, y0 + 1600]} b={[976, y0 + 1574]} sag={30} n={2} birds={{n: 5, us: [0.1, 0.2, 0.3, 0.45, 0.6], liftAt: 2.2}} seed="sh/wire" />
      <Bike3 x={700} y={y0 + 1900} w={180} seed="sh/bike" />
      <Label x={20} y={y0 + 1580} light>Floodlight, Forklift loop, UtilityPole3, Wire3 + birds (lift at 2.2), Bike3</Label>
    </g>
  );
};

// ---------------------------------------------------------------- screen L5: shop + dock pieces

const ScreenShop: React.FC<{y0: number}> = ({y0}) => (
  <g>
    <rect x={0} y={y0} width={1080} height={1920} fill={EMBER.wall} />
    <Label x={20} y={y0 + 40}>Shop: StripLight, ShopShelving (BETTER slot open), ShopWindowView (walkers), counter props</Label>
    <StripLight x={300} y={y0 + 90} w={600} flickerAt={[5]} seed="sp/strip" />
    <ShopWindowView x={30} y={y0 + 240} w={300} h={600} walkers={[{t0: 0.5, t1: 4, dir: 1}, {t0: 1.8, t1: 5, dir: -1, h: 180, wear: ['umbrella', 'snow']}]} seed="sp/win" />
    <ShopShelving x={420} y={y0 + 220} w={620} h={680} slot={{shelf: 0, x: 700, w: 200}} seed="sp/shelv" />
    <rect x={0} y={y0 + 1060} width={1080} height={260} fill={EMBER.desk} />
    <CardReader x={120} y={y0 + 1100} seed="sp/reader" />
    <ReceiptPrinter x={300} y={y0 + 1100} feedAt={1} feedDur={0.6} seed="sp/printer" />
    <PaperBag x={480} y={y0 + 1100} seed="sp/bag" />
    <UsbJar x={640} y={y0 + 1100} seed="sp/usb" />
    <CounterBell x={760} y={y0 + 1100} seed="sp/bell" />
    <LaptopBox x={850} y={y0 + 1030} w={180} h={70} seed="sp/lbox" />
    <Label x={20} y={y0 + 1360}>Dock room: CableTray, DockWindow (truck, forklift), CoffeeMachine, NoSmoking, Bench, BootMat, Clipboard</Label>
    <CableTray x0={-20} x1={1100} y={y0 + 1390} seed="sp/tray" />
    <DockWindow x={20} y={y0 + 1440} w={300} h={300} forklift={[[0.8, 3.2]]} seed="sp/dock" />
    <CoffeeMachine x={880} y={y0 + 1860} w={200} h={380} seed="sp/coffee" />
    <NoSmoking x={780} y={y0 + 1500} seed="sp/ns" />
    <Clipboard x={400} y={y0 + 1450} w={150} h={200} seed="sp/clip" />
    <Bench x={340} y={y0 + 1860} w={420} seed="sp/bench" />
    <BootMat x={360} y={y0 + 1790} w={300} h={90} seed="sp/mat" />
  </g>
);

// ---------------------------------------------------------------- screen L6: town variety + deck clutter

const ScreenTown: React.FC<{y0: number}> = ({y0}) => (
  <g>
    <rect x={0} y={y0} width={1080} height={1920} fill={EMBER.sky} />
    <Label x={20} y={y0 + 40} light>TownHouse: cottage / terrace (dormers) / block (balconies, dish) / mansard / shop (lit sign)</Label>
    <rect x={0} y={y0 + 520} width={1080} height={200} fill={EMBER.snow} />
    {(['cottage', 'terrace', 'block', 'mansard', 'shop'] as const).map((k, i) => (
      <TownHouse key={k} x={30 + i * 210} y={y0 + 520} w={170} kind={k} seed={`tw/${k}`} />
    ))}
    <Label x={20} y={y0 + 770} light>TownRow at 70 / 34 px, RoofNeighbour (shovel loop, light-hanger), Pennant, RoofAerials</Label>
    <TownRow x0={-40} x1={1120} y={y0 + 960} w={70} seed="tw/row1" />
    <TownRow x0={-40} x1={1120} y={y0 + 880} w={34} seed="tw/row2" far color="#424C71" />
    <rect x={0} y={y0 + 960} width={1080} height={120} fill={EMBER.frost} />
    <RoofNeighbour x={160} y={y0 + 1060} h={44} kind="shovel" seed="tw/nb1" />
    <RoofNeighbour x={300} y={y0 + 1060} h={44} kind="lights" seed="tw/nb2" />
    <RoofNeighbour x={420} y={y0 + 1060} h={60} kind="shovel" flip seed="tw/nb3" />
    <Pennant x={620} y={y0 + 1060} />
    <RoofAerials x={760} y={y0 + 1060} />
    <Label x={20} y={y0 + 1140} light>Deck: FoldingChair (snow cushion), SideTable + mug, LaundryLine, Shovel, snowy pots, parapet lights</Label>
    <rect x={0} y={y0 + 1420} width={1080} height={500} fill={EMBER.desk} />
    <StringLights3 from={[-20, y0 + 1400]} to={[1100, y0 + 1410]} sag={18} n={18} r={7} halo={[EMBER.skyLow, EMBER.ring]} seed="tw/sl" />
    <LaundryLine a={[60, y0 + 1220]} b={[620, y0 + 1250]} seed="tw/laundry" />
    <FoldingChair x={700} y={y0 + 1700} w={120} seed="tw/chair" />
    <SideTable x={860} y={y0 + 1720} w={100} seed="tw/table" />
    <Shovel x={120} y={y0 + 1760} h={180} seed="tw/shovel" />
    <Plant x={280} y={y0 + 1780} kind="snake" size={160} snow seed="tw/pot1" />
    <Plant x={420} y={y0 + 1790} kind="succulent" size={90} snow seed="tw/pot2" />
  </g>
);

// ---------------------------------------------------------------- screen L7: two dressed sample frames (density check)

/** O1 dressed with the kit at the plan's places (a density test, not the lane's set). */
export const O1Dressed: React.FC = () => {
  const ph = {x: 340, y: 1020, w: 400, rot: -3, buttonY: 520};
  const S = phoneSlots(400, 372, 520);
  void S;
  return (
    <>
      <Nook variant="pov">
        <NookOutside variant="pov" dc={{signAt: 0}} snow={false} />
        <NearFronts x0={180} x1={900} y={1064} h={[64, 96]} n={3} seed="o1d/nf" />
        <SnowLayers x={180} y={630} w={720} h={430} band={null} seed="o1d/sn" />
        <Frost x={180} y={630} w={720} h={430} corners={['bl', 'br']} size={70} />
      </Nook>
      <StringLights3 points={[[560, 40], [800, 130], [1100, 270]]} sag={26} n={10} r={8} seed="o1d/sl" />
      <ShelfFill planks={[{x0: 64, x1: 148, y: 856, room: 230}]} seed="o1d/shelf" photo={false} jar={false} plant={false} trailing={false} />
      <Plant x={110} y={584} kind="pothos" size={56} trail={260} seed="o1d/po" />
      <FramedPrint x={930} y={660} w={124} h={170} picture="mountain" seed="o1d/print" />
      <SnowSill x0={180} x1={900} y={1060} h={12} seed="o1d/sill" />
      <Plant x={250} y={1060} kind="succulent" size={44} seed="o1d/su" />
      <Headphones x={130} y={1150} w={150} seed="o1d/hp" />
      <BookStack x={900} y={1160} w={130} n={2} seed="o1d/bs" />
      <PenCup x={1040} y={1150} w={56} seed="o1d/pc" />
      <DeskGrain x={0} y={1200} w={1080} h={700} n={6} seed="o1d/gr" />
      <StickyNotes x={760} y={1640} n={2} size={80} seed="o1d/st" />
      <Glasses x={860} y={1800} w={130} seed="o1d/gl" />
      <Cable points={[[560, 1880], [640, 1760], [760, 1900], [800, 2000]]} />
      <Pip3 x={862} y={1060} pose="sit-back" look={-0.5} seed={4} />
      <Phone {...ph} price="$999" priceY={372} />
      <PriceTag x={330} y={1250} w={360} value="$1,039" old="$999" stringFrom={phonePoint(ph, 30, 330)} rot={-4} seed="o1d/tag" />
      <Hand phone={ph} />
    </>
  );
};

/** S4 dressed: the board on the computer shop's street wall at blue hour (a density test, not the lane's set). */
export const S4Dressed: React.FC = () => (
  <>
    <rect x={-100} y={-100} width={1280} height={2200} fill={EMBER.wall} />
    <WallMarks x={140} y={10} w={800} h={40} n={4} seed="s4d/wm" />
    <Cornice y={56} h={44} icicles={0} seed="s4d/cor" />
    <Fascia x={180} y={124} w={720} h={124} text="COMPUTERS" seed="s4d/fas" />
    <Icicles x0={220} x1={860} y={248} n={4} len={[16, 36]} seed="s4d/ice" />
    <DisplayWindow x={-170} y={600} w={248} h={760} seed="s4d/disp" />
    <Drainpipe x={86} y0={0} y1={1370} w={20} seed="s4d/pipe" />
    <ShopDoor x={968} y={560} w={300} h={830} signX={0.2} seed="s4d/door" />
    <WallLamp x={1012} y={520} r={30} seed="s4d/lamp" />
    <HeadlightSweep rect={[0, 290, 1080, 1100]} at={[1.2]} dur={0.8} width={110} id="s4dhl" />
    <CardBoard card={{x: 140, y: 615, w: 800, h: 735}} kind="notice" corners={[{corner: 'tl', kind: 'flyer', w: 150, h: 210}, {corner: 'tr', kind: 'concert', w: 140, h: 190}, {corner: 'br', kind: 'card', w: 120, h: 70, out: 0.55}, {corner: 'bl', kind: 'note', w: 80, h: 80}]} seed="s4d/board" />
    <ChartCard x={140} y={615} w={800} h={735} seed="s4d/card" />
    <LineChart x={220} y={760} w={640} h={460} />
    <Pavement y0={1390} seed="s4d/pave" />
    <Bike3 x={60} y={1600} w={220} seed="s4d/bike" />
    <Pip3 x={870} y={1384} pose="sit-back" look={-0.6} outdoor seed={6} />
    <BackRow x0={-30} x1={1110} top={1470} head={130} n={5} seed="s4d/row" snow lookX={540} people={[{wear: ['earmuffs']}, {hair: 'long', acc: ['scarf']}, {acc: ['phone'], hair: 'cap'}, {hair: 'beanie'}, {acc: ['hood']}]} />
    <SnowLayers band={[290, 600]} seed="s4d/snow" layers={['far', 'mid', 'near']} density={0.8} />
  </>
);

/** A full 1080 x 1920 frame shrunk by s at (x, y), clipped. */
const FrameCell: React.FC<{x: number; y: number; s: number; id: string; children: React.ReactNode}> = ({x, y, s, id, children}) => (
  <g>
    <defs>
      <clipPath id={id}>
        <rect x={x} y={y} width={1080 * s} height={1920 * s} />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id})`}>
      <XG m={mat.compose(mat.translate(x, y), mat.scale(s))}>{children}</XG>
    </g>
    <rect x={x} y={y} width={1080 * s} height={1920 * s} fill="none" stroke={EMBER.ink} strokeWidth={2} />
  </g>
);

const ScreenDressed: React.FC<{y0: number}> = ({y0}) => (
  <g>
    <rect x={0} y={y0} width={1080} height={1920} fill={EMBER.wall} />
    <FrameCell x={0} y={y0} s={0.5} id="life-o1">
      <O1Dressed />
    </FrameCell>
    <FrameCell x={540} y={y0} s={0.5} id="life-s4">
      <S4Dressed />
    </FrameCell>
    <Label x={14} y={y0 + 1000}>Density test frames (kit pieces at the plan's places; the lanes own the real sets):</Label>
    <Label x={14} y={y0 + 1040}>left O1 dressed (shelf, pothos, string lights, print, near fronts, plume, frost, sill, desk clutter, Pip)</Label>
    <Label x={14} y={y0 + 1080}>right S4 dressed (cornice, fascia, display window, drainpipe, door + OPEN, lamp, board, pavement, row, Pip)</Label>
    <Label x={14} y={y0 + 1160}>the same two at 0.33 (on this 0.5 sheet: about phone size):</Label>
    <FrameCell x={160} y={y0 + 1200} s={0.33} id="life-o1b">
      <O1Dressed />
    </FrameCell>
    <FrameCell x={560} y={y0 + 1200} s={0.33} id="life-s4b">
      <S4Dressed />
    </FrameCell>
  </g>
);

const SCREENS: React.FC<{y0: number}>[] = [ScreenDressed, ScreenPipPeople, ScreenOutside, ScreenRoom, ScreenStreet, ScreenShop, ScreenTown];

/** The life kit's 7 screens, stacked from y0, or placed at `at[i]` = [x, y] (KitSheet3 lays them out in two columns:
 *  Chrome tiles a page taller than 16384 px wrongly, so no sheet may exceed that height). */
export const KitSheetLifeScreens: React.FC<{y0?: number; at?: [number, number][]}> = ({y0 = 0, at}) => (
  <>
    {SCREENS.map((S, i) => {
      const [x, y] = at?.[i] ?? [0, y0 + 1920 * i];
      return (
        <XG key={i} m={mat.translate(x, 0)}>
          <S y0={y} />
        </XG>
      );
    })}
  </>
);

export const LIFE_SCREENS = 7;
export const LIFE_SHEET = {w: 1080, h: 1920 * LIFE_SCREENS};

/** One dressed sample frame at full size (compositions KitLifeO1 / KitLifeS4). */
export const KitLifeFrame: React.FC<{which: 'o1' | 's4'}> = ({which}) => (
  <div style={{position: 'absolute', inset: 0, background: EMBER.wall}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      {which === 'o1' ? <O1Dressed /> : <S4Dressed />}
    </svg>
  </div>
);

export const KitSheetLife: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: EMBER.wall}}>
    <svg width={LIFE_SHEET.w} height={LIFE_SHEET.h} viewBox={`0 0 ${LIFE_SHEET.w} ${LIFE_SHEET.h}`} style={{position: 'absolute', left: 0, top: 0}}>
      <KitSheetLifeScreens />
    </svg>
  </div>
);
