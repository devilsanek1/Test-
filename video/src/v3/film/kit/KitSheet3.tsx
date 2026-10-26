// KitSheet3: every v3 kit prop and variant on one tall labelled sheet (1080 x 5760, 60 fps), plus the theme check:
// the house tokens and the colours some house modules capture at import time must read Autumn Ember inside the v3
// entries (palette.ts). Render: npx remotion still src/entry-v3-kit.tsx KitSheet3 out.png --frame=90 --scale=0.5
import '../palette';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {mat, XG} from '../../../lib/xf';
import {palette, relightProblems} from '../../../lib/theme';
import {Person, PERSON_BODIES} from '../../../lib/kit/Person';
import {Window} from '../../../lib/kit/Window';
import {Tree} from '../../../lib/kit/Nature';
import {TOD} from '../../../lib/cine/atmosphere';
import {EMBER, emberProblems} from '../palette';
import {Txt} from './util';
import {Nook, NookOutside} from './Nook';
import {DataCenter, NightSky, RoofLedge, Snowfall, TownBand} from './Outside';
import {Laptop} from './Laptop';
import {Phone, Hand, phonePoint, phoneSlots} from './Phone';
import {PriceTag} from './PriceTag';
import {MemoryStick, Pile, StickFlight} from './Memory';
import {YouFront, YouSeated, YouTiny} from './You';
import {BarChart, ChartCard, LineChart, PRICE_HOOK} from './Charts';
import {Calendar, ChipFactory, ChipMaker, SpeechBubble, ThoughtBubble, Van, WaitingDots, WallClock} from './Props';

export const SHEET = {w: 1080, h: 5760};

const Label: React.FC<{x: number; y: number; children: string; light?: boolean}> = ({x, y, children, light}) => (
  <Txt x={x} y={y} size={30} anchor="start" fill={light ? EMBER.white : EMBER.ink}>
    {children}
  </Txt>
);

/** A cell holding a full 1080 x 1920 frame shrunk by `s` at (x, y), clipped to it. */
const Frame: React.FC<{x: number; y: number; s: number; id: string; children: React.ReactNode}> = ({x, y, s, id, children}) => (
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

const O1Frame: React.FC = () => {
  const ph = {x: 340, y: 1020, w: 400, rot: -3, buttonY: 520};
  const S = phoneSlots(400, 372, 520);
  const lap = phonePoint(ph, S.laptop.x, S.laptop.y - 40);
  return (
    <>
      <Nook variant="pov">
        <NookOutside variant="pov" dc={{signAt: 0.25}} />
      </Nook>
      <Phone {...ph} price="$999" priceY={372} />
      <StickFlight from={lap} to={[540, 660]} t0={1.2} t1={1.9} w0={130} w1={40} end="shrink" seed="k/fly" />
      <PriceTag x={330} y={1250} w={360} ticker={[{t: 0, v: '$999'}, {t: 1.0, v: '$1,019'}, {t: 1.4, v: '$1,039'}]} stringFrom={phonePoint(ph, 30, 330)} rot={-4} seed="k/tag" />
      <Hand phone={ph} />
    </>
  );
};

const S13Frame: React.FC = () => (
  <>
    <Nook variant="objective" />
    <WallClock cx={240} cy={700} r={46} />
    <YouSeated x={420} y={1250} head={92} floorY={1400} />
    <ThoughtBubble cx={330} cy={800} rx={150} ry={100} to={[440, 935]}>
      <Laptop x={330} y={840} w={150} variant="new" seed="k/think" ink={2.6} />
    </ThoughtBubble>
  </>
);

const S9Frame: React.FC = () => (
  <>
    <NightSky bandY={1080} horizon={1210} />
    <Snowfall x={0} y={600} w={1080} h={700} n={30} seed="k/s9" />
    <Fill2 />
    <DataCenter x={540} y={1214} w={1290} variant="hall" seed="k/hall" />
    <TownBand y={1214} n={6} x0={-20} x1={1100} houseW={110} far={false} seed="k/s9t" />
    <RoofLedge y={1380} ventX={210} />
  </>
);
const Fill2: React.FC = () => <rect x={-200} y={1210} width={1480} height={800} fill={EMBER.snow} />;

const S9bFrame: React.FC = () => (
  <>
    <NightSky bandY={1380} horizon={1500} />
    <rect x={-200} y={1500} width={1480} height={600} fill={EMBER.snow} />
    <Pile x={540} y={1500} w={1480} h={880} seed="k/pile" />
    <DataCenter x={720} y={1500} w={240} variant="normal" sign={null} seed="k/dcS9b" />
    <YouTiny x={250} y={1590} h={86} />
  </>
);

export const KitSheet3: React.FC = () => {
  const captured: [string, string, string][] = [
    ['lib/kit Person PERSON_BODIES[0] (import-time)', PERSON_BODIES[0], palette.sand],
    ['lib/cine TOD.night.skyBands[0] (import-time)', TOD.night.skyBands[0], EMBER.sky],
    ['lib/cine TOD.night.text (import-time)', TOD.night.text, EMBER.white],
  ];
  const problems = [...emberProblems(captured), ...relightProblems()];
  const swatches = Object.entries(EMBER).filter(([, v]) => typeof v === 'string' && v.startsWith('#')) as [string, string][];
  return (
    <AbsoluteFill style={{background: EMBER.wall}}>
      <svg width={SHEET.w} height={SHEET.h} viewBox={`0 0 ${SHEET.w} ${SHEET.h}`} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={0} y={0} width={SHEET.w} height={SHEET.h} fill={EMBER.wall} />
        {/* ---- screen 1: the sets, as frames at 50 % */}
        <Frame x={0} y={0} s={0.5} id="f1">
          <O1Frame />
        </Frame>
        <Frame x={540} y={0} s={0.5} id="f2">
          <S13Frame />
        </Frame>
        <Frame x={0} y={960} s={0.5} id="f3">
          <S9Frame />
        </Frame>
        <Frame x={540} y={960} s={0.5} id="f4">
          <S9bFrame />
        </Frame>
        <Label x={12} y={34}>Nook pov + Phone + Hand + PriceTag + StickFlight (O1)</Label>
        <Label x={552} y={34}>Nook objective + YouSeated + clock + bubble (S13)</Label>
        <Label x={12} y={994} light>DataCenter hall + TownBand + RoofLedge (S9 landing)</Label>
        <Label x={552} y={994} light>Pile + small DataCenter + YouTiny (S9b)</Label>

        {/* ---- screen 2: props at full size */}
        <g>
          <rect x={0} y={1920} width={1080} height={1920} fill={EMBER.wall} />
          <Label x={20} y={1966}>Laptop old (taped) / new + label "BETTER"</Label>
          <Laptop x={250} y={2200} w={300} taped seed="k/old" />
          <Laptop x={760} y={2200} w={340} variant="new" label="BETTER" seed="k/new" />

          <Label x={20} y={2400}>PriceTag: ticker / old struck / turned over (back) / pop tone</Label>
          <PriceTag x={30} y={2440} w={360} value="$1,099" seed="k/t1" />
          <PriceTag x={420} y={2440} w={300} value="$1,099" old="$999" seed="k/t2" />
          <PriceTag x={760} y={2440} w={280} value="$1,099" turnAt={0.2} seed="k/t3" />
          <PriceTag x={760} y={2600} w={190} value="$999" tone="pop" seed="k/t4" />

          <Label x={20} y={2700}>MemoryStick 60 / 130 / 300 / 700 (S8)</Label>
          <MemoryStick x={70} y={2760} w={60} seed="k/m1" />
          <MemoryStick x={210} y={2760} w={130} rot={-10} seed="k/m2" />
          <MemoryStick x={500} y={2770} w={300} seed="k/m3" />
          <MemoryStick x={540} y={2960} w={700} seed="k/m4" />

          <Label x={20} y={3120}>DataCenter normal (sign) / dark + sign lit / far / mini</Label>
          <rect x={0} y={3140} width={1080} height={420} fill={EMBER.sky} />
          <DataCenter x={170} y={3480} w={300} seed="k/d1" />
          <DataCenter x={520} y={3480} w={300} variant="dark" signLitAt={0} seed="k/d2" />
          <DataCenter x={850} y={3480} w={260} variant="far" seed="k/d3" />
          <rect x={0} y={3480} width={1080} height={80} fill={EMBER.snow} />
          <TownBand y={3482} houses={[{x: 330, w: 60}, {x: 990, w: 70, chimney: true}]} far={false} seed="k/tb" />

          <Label x={20} y={3600}>Build check at t = 1.5 s: at = 1.40 (lines first, then colour)</Label>
          <Laptop x={200} y={3770} w={220} at={1.4} seed="k/b1" />
          <PriceTag x={380} y={3640} w={260} value="$999" at={1.4} seed="k/b2" />
          <MemoryStick x={820} y={3700} w={200} at={1.38} seed="k/b3" />
          <MemoryStick x={820} y={3790} w={200} at={1.32} seed="k/b4" />
        </g>

        {/* ---- screen 3: You, charts, the S10 / S14 cast, theme check */}
        <g>
          <rect x={0} y={3840} width={1080} height={1920} fill={EMBER.wall} />
          <Label x={20} y={3886}>YouFront happy / worried (S5)</Label>
          <XG m={mat.compose(mat.translate(0, 0))}>
            <YouFront x={250} y={3920} head={170} face="happy" look={0.6}>
              <Laptop x={250} y={4410} w={240} seed="k/yl" />
            </YouFront>
            <YouFront x={760} y={3920} head={170} face="worried" look={1} seed="k/you2" />
          </XG>
          <rect x={0} y={4500} width={1080} height={10} fill={EMBER.desk} />

          <Label x={20} y={4560}>LineChart (+ hook, label) / BarChart 5x</Label>
          <ChartCard x={20} y={4580} w={500} h={460} />
          <LineChart x={80} y={4680} w={400} h={250} hook={PRICE_HOOK} label="+9.7%" />
          <ChartCard x={560} y={4580} w={500} h={460} />
          <BarChart x={620} y={4960} w={400} h={250} />

          <rect x={0} y={5080} width={1080} height={520} fill={EMBER.sky} />
          <rect x={0} y={5470} width={1080} height={130} fill={EMBER.road} />
          <Label x={20} y={5116} light>ChipFactory + ChipMaker / Van + WaitingDots / SpeechBubble + Calendar / YouTiny</Label>
          <ChipFactory x={840} y={5470} w={300} />
          <ChipMaker x={720} y={5470} h={112} />
          <Van x={250} y={5560} w={380} />
          <WaitingDots x={400} y={5380} />
          <SpeechBubble cx={560} cy={5240} rx={130} ry={90} to={[700, 5360]}>
            <Calendar x={490} y={5180} w={140} flipAt={0.5} />
          </SpeechBubble>
          <YouTiny x={1000} y={5590} h={86} />

          {/* theme check: swatches + house kit pieces with DEFAULT colours (must land in Ember) + the problem list */}
          <Label x={20} y={5640}>{problems.length ? `THEME PROBLEMS: ${problems.length}` : 'Theme check: house tokens are Autumn Ember (0 problems)'}</Label>
          {problems.slice(0, 3).map((p, i) => (
            <Txt key={i} x={20} y={5672 + i * 26} size={22} anchor="start" fill={EMBER.hero}>
              {p.slice(0, 90)}
            </Txt>
          ))}
          {swatches.map(([k, v], i) => (
            <rect key={k} x={20 + (i % 26) * 40} y={5690 + Math.floor(i / 26) * 30} width={36} height={26} fill={v} stroke={EMBER.ink} strokeWidth={1} />
          ))}
          <XG m={mat.translate(0, 0)}>
            <Window x={880} y={5640} w={80} h={60} />
            <Tree x={1010} y={5700} size={44} />
            <Person x={960} y={5750} s={0.35} seed="k/p" />
          </XG>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
