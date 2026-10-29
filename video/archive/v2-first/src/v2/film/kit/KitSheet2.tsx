// KitSheet2: every v2 kit prop and variant, LABELLED, AT EVERY SIZE THE G3 BOARD USES IT (1080 x 6000, 60 fps), plus
// the palette check (house tokens = Cream & Cobalt, "0 problems"). Section A holds full 1080 x 1920 frames drawn at
// half size: rendered at --scale=0.5 they are exactly phone size (0.25), so what reads there reads in the film. Section
// B is at 1:1 (half size when rendered at 0.5): cat poses, bubbles, stamps, ambient life, lettering, swatches.
// Render: npx remotion still src/entry-v2-kit.tsx KitSheet2 out.png --frame=90 --scale=0.5
import '../palette';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {mat, XG} from '../../../lib/xf';
import {palette, relightProblems} from '../../../lib/theme';
import {PERSON_BODIES} from '../../../lib/kit/Person';
import {TOD} from '../../../lib/cine/atmosphere';
import {CC, COLD, COLD_PICK, DUSK, ccProblems} from '../palette';
import {Letter, Txt} from './util';
import {Cat} from './Cat';
import {HerArm, HerBack, HerSeated, HerStanding} from './Her';
import {Staffer, P3_STAFF, InterviewTable, TablePage} from './Staffer';
import {INTERVIEW, NameTent} from './Interview';
import {ContractPage, FloorRun, O1_PAGE, clauseTip} from './Contract';
import {Badge, Box, Bubble, Laptop, Mic, micFromBoard, Stamp} from './Props';
import {Clouds, CandleFlame, DustMotes, Flock, Steam, WallClock} from './Ambient';
import {DuskTown} from './Town';
import {NookMug, PotPlant, FramedPicture, Corkboard, CoatOnHook, TableLamp} from './Nook';
import {DESK} from './Desk';

export const SHEET2 = {w: 1080, h: 6320};

const Label: React.FC<{x: number; y: number; children: string; light?: boolean; size?: number}> = ({x, y, children, light, size = 28}) => (
  <Txt x={x} y={y} size={size} anchor="start" fill={light ? CC.white : CC.ink}>
    {children}
  </Txt>
);

/** A cell holding a full 1080 x 1920 frame shrunk by `s` at (x, y), clipped to it, on a background colour. */
const Frame: React.FC<{x: number; y: number; s: number; id: string; bg?: string; children: React.ReactNode}> = ({x, y, s, id, bg = CC.wall, children}) => (
  <g>
    <defs>
      <clipPath id={id}>
        <rect x={x} y={y} width={1080 * s} height={1920 * s} />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id})`}>
      <rect x={x} y={y} width={1080 * s} height={1920 * s} fill={bg} />
      <XG m={mat.compose(mat.translate(x, y), mat.scale(s))}>{children}</XG>
    </g>
    <rect x={x} y={y} width={1080 * s} height={1920 * s} fill="none" stroke={CC.ink} strokeWidth={2} />
  </g>
);

/** A plain room line (floor / table) so a figure stands somewhere. */
const Floor: React.FC<{y: number; color?: string}> = ({y, color = CC.floor}) => <rect x={-100} y={y} width={1300} height={2200 - y} fill={color} />;

// ---------------------------------------------------------------- section A: the cast at board size

const A_P2: React.FC = () => (
  <>
    <rect x={250} y={1090} width={725} height={26} fill={CC.sill} />
    <Floor y={1540} />
    <Cat x={862} y={1090} size={116} pose="sit" facing="l" look={[700, 1700]} seed="sh/p2cat" />
    <Cat x={250} y={1700} size={150} pose="sleep" facing="r" seed="sh/p2sleep" />
    <HerStanding x={540} y={1600} h={640} facing="r" hands={[[648, 1176], [752, 1180]]} seed="sh/her2">
      <ContractPage x={640} y={1170} w={120} runOn={300} seed="sh/p2page" />
    </HerStanding>
    <FloorRun from={{x0: 640, x1: 760, y: 1612}} to={{x0: 560, x1: 940, y: 1880}} p={1} firstYear={2080} decades={3} seed="sh/p2run" />
  </>
);

const A_P3: React.FC = () => {
  const A = P3_STAFF.A;
  const B = P3_STAFF.B;
  return (
    <>
      <Staffer {...B} variant="B" part="body" seed="sh/sB" />
      <Staffer {...A} variant="A" part="body" talking={[[0, 9]]} seed="sh/sA" />
      <InterviewTable />
      <TablePage {...INTERVIEW.page} />
      <Staffer {...B} variant="B" part="arms" seed="sh/sB" />
      <Staffer {...A} variant="A" part="arms" seed="sh/sA" />
      <NameTent {...INTERVIEW.tent} />
      <Mic {...micFromBoard(110, 1100, 150)} tilt={10} seed="sh/p3mic" />
    </>
  );
};

const A_P4: React.FC = () => (
  <>
    <rect x={248} y={1378} width={1000} height={50} fill={CC.desk} />
    <Floor y={1700} />
    <Mic {...micFromBoard(654.4, 1196.2, 105)} seed="sh/p4mic" />
    <HerSeated x={486.4} y={1784.2} h={840} facing="r" view="side" talking={[[0, 9]]} seed="sh/p4her" />
    <Cat x={930} y={1378} size={168} pose="loaf" facing="l" seed="sh/p4cat" />
    <Bubble x={250} y={650} w={400} h={264} tail={[490, 1078]} seed="sh/b4" />
  </>
);

const A_P13: React.FC = () => (
  <>
    <rect x={267} y={1380} width={1000} height={42} fill={CC.desk} />
    <Floor y={1656} />
    <Mic {...micFromBoard(615.2, 1224.6, 90)} seed="sh/p13mic" />
    <HerSeated x={471.2} y={1728.6} h={720} facing="r" view="side" talking={[[0, 9]]} clutch={[[0, 9]]} seed="sh/p13her" />
    <Cat x={860} y={1380} size={140} pose="sitFront" look={[470, 760]} seed="sh/p13cat" />
    <Bubble x={270} y={640} w={400} h={264} tail={[482, 1102]} text="FACTS" seed="sh/b13" />
  </>
);

const A_P5: React.FC = () => (
  <>
    <rect x={-100} y={980} width={1300} height={1000} fill={CC.desk} />
    <Laptop x={530} y={953} w={460} screen="ai" seed="sh/p5lap" />
    <Cat x={1010} y={1330} size={300} pose="loaf" facing="l" seed="sh/p5cat" />
    <HerBack x={120} y={1600} h={1100} facing="r" seed="sh/p5her" />
  </>
);

const A_P6: React.FC = () => (
  <>
    <HerSeated x={640} y={1960} h={1100} facing="l" view="front34" face="worried" talking={[[0, 9]]} part="body" seed="sh/p6her" />
    <rect x={-100} y={1440} width={1300} height={200} fill={CC.desk} />
    <rect x={-100} y={1640} width={1300} height={48} fill={CC.deskFront} />
    <Mic x={260} y={1452} w={120} tilt={8} seed="sh/p6mic" />
    <HerSeated x={640} y={1960} h={1100} facing="l" view="front34" face="worried" talking={[[0, 9]]} part="arms" seed="sh/p6her" />
    <Bubble x={120} y={650} w={400} h={264} tail={[500, 1104]} seed="sh/b6" />
  </>
);

const A_O1: React.FC = () => {
  const tip = clauseTip(O1_PAGE, [1, 1]);
  return (
    <>
      <rect x={-100} y={DESK.back} width={1300} height={DESK.front - DESK.back} fill={CC.desk} />
      <rect x={-100} y={DESK.front} width={1300} height={80} fill={CC.deskFront} />
      <Box />
      <ContractPage {...O1_PAGE} runOn={760} edgeY={DESK.front} seed="sh/o1page" />
      <HerArm tip={tip} seed="sh/arm" />
      <Cat x={890} y={DESK.front} size={360} pose="peek" look={[560, 1700]} seed="sh/peek" />
    </>
  );
};

const A_Small: React.FC = () => (
  <>
    <Label x={40} y={112} size={36}>Badge 168 / 90 / worn 62: staffer (navy) / hers (cobalt)</Label>
    <Badge x={150} y={240} w={168} seed="sh/bd1" />
    <Badge x={360} y={240} w={90} seed="sh/bd2" />
    <Badge x={520} y={250} w={62} strap={[[500, 150], [540, 150]]} lanyard={CC.lanyardA} seed="sh/bd3" />
    <Badge x={680} y={250} w={62} strap={[[660, 150], [700, 150]]} lanyard={CC.hero} seed="sh/bd4" />
    <Label x={40} y={420} size={40}>Mic 150 / 120 / 105 / 90 / 75</Label>
    {[150, 120, 105, 90, 75].map((w, i) => (
      <Mic key={w} x={110 + i * 200} y={740} w={w} seed={`sh/mic${w}`} />
    ))}
    <Label x={40} y={830} size={40}>Contract w 120 (P2) / 240 + run-on</Label>
    <ContractPage x={60} y={870} w={120} runOn={200} seed="sh/c120" />
    <ContractPage x={260} y={870} w={240} sweepAt={-1} runOn={280} seed="sh/c240" />
    <Label x={560} y={830} size={40}>Cat 90 / 116 / 150 / 210</Label>
    <rect x={540} y={1160} width={540} height={8} fill={CC.trim} />
    <Cat x={600} y={1160} size={90} pose="sit" seed="sh/cs1" />
    <Cat x={720} y={1160} size={116} pose="sit" seed="sh/cs2" />
    <Cat x={860} y={1160} size={150} pose="loaf" facing="l" seed="sh/cs3" />
    <Cat x={800} y={1480} size={210} pose="sleep" seed="sh/cs4" />
    <Label x={40} y={1560} size={40}>Stamps 240 / 330 (anchor ink)</Label>
    <Stamp x={240} y={1700} w={240} text="APRIL 2026" />
    <Stamp x={700} y={1720} w={330} text="NO VETO" rot={-8} />
  </>
);

// ---------------------------------------------------------------- the sheet

export const KitSheet2: React.FC = () => {
  const captured: [string, string, string][] = [
    ['lib/kit Person PERSON_BODIES[0] (import-time)', PERSON_BODIES[0], palette.sand],
    ['lib/cine TOD.night.skyBands[0] (import-time)', TOD.night.skyBands[0], CC.sky],
  ];
  const problems = [...ccProblems(captured), ...relightProblems()];
  const swatch = (o: Record<string, unknown>) => Object.entries(o).filter(([, v]) => typeof v === 'string' && (v as string).startsWith('#')) as [string, string][];
  const A = [
    {c: <A_P2 />, l: 'P2: her standing h 640 + contract w 120 + floor run; cat 116 sill, 150 sleep'},
    {c: <A_P3 />, l: 'P3: staffers h 900 / 820, mic 150, CONTRACT x 220, NAME WITHHELD tent'},
    {c: <A_P4 />, l: 'P4: her seated h 840, mic 105, bubble 400, cat loaf 168'},
    {c: <A_P13 />, l: 'P13: seated h 720 (the clutch beat), mic 90, FACTS 400, cat 140'},
    {c: <A_P5 />, l: 'P5: back view h 1100 (hair), laptop 460 AI, cat loaf 300'},
    {c: <A_P6 />, l: 'P6: 3/4 h 1100 body behind the desk, arms on it, mic 120'},
    {c: <A_O1 />, l: 'O1: arm + highlighter, box + badge, page 420 + run-on, cat peek 360'},
    {c: <A_Small />, l: 'small extremes at phone size'},
  ];
  const bgOf = (i: number) => (i === 1 ? CC.studio : CC.wall);
  return (
    <AbsoluteFill style={{background: CC.wall}}>
      <svg width={SHEET2.w} height={SHEET2.h} viewBox={`0 0 ${SHEET2.w} ${SHEET2.h}`} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={0} y={0} width={SHEET2.w} height={SHEET2.h} fill={CC.wall} />
        {/* ---- A: frames at half size (phone size when the sheet renders at 0.5) */}
        {A.map((a, i) => (
          <React.Fragment key={i}>
            <Frame x={(i % 2) * 540} y={Math.floor(i / 2) * 960} s={0.5} id={`kf${i}`} bg={bgOf(i)}>
              {a.c}
            </Frame>
            <rect x={(i % 2) * 540 + 4} y={Math.floor(i / 2) * 960 + 4} width={532} height={36} fill={CC.paper} />
            <Label x={(i % 2) * 540 + 10} y={Math.floor(i / 2) * 960 + 30} size={20}>
              {a.l}
            </Label>
          </React.Fragment>
        ))}

        {/* ---- B1: the cat's poses at 300 (desk close), with look targets (dots) */}
        <g>
          <rect x={0} y={3840} width={1080} height={860} fill={CC.wall} />
          <Label x={20} y={3880}>Cat (one model) at 300: sit + look / sitFront / loaf / sleep / walk / peek</Label>
          {(
            [
              ['sit', 180, 4250, [330, 3960]],
              ['sitFront', 540, 4250, [540, 4300]],
              ['loaf', 900, 4250, [700, 4100]],
              ['sleep', 180, 4640, undefined],
              ['walk', 540, 4640, undefined],
              ['peek', 900, 4640, [900, 4300]],
            ] as [string, number, number, [number, number] | undefined][]
          ).map(([pose, x, y, look]) => (
            <React.Fragment key={pose}>
              <rect x={x - 170} y={y} width={340} height={6} fill={CC.trim} />
              <Cat x={x} y={y} size={pose === 'peek' ? 240 : 220} pose={pose as 'sit'} facing={pose === 'loaf' ? 'l' : 'r'} look={look} seed={`sh/pose${pose}`} />
              {look ? <circle cx={look[0]} cy={look[1]} r={7} fill={CC.pop} /> : null}
              <Txt x={x} y={y + 40} size={24} anchor="middle">
                {pose}
              </Txt>
            </React.Fragment>
          ))}
        </g>

        {/* ---- B2: bubbles, stamps, laptop, set pieces at 1:1 */}
        <g>
          <rect x={0} y={4700} width={1080} height={560} fill={CC.wall} />
          <Label x={20} y={4740}>Bubble 400 FACTS / 300 lines; Laptop 300 AI; Mug, lamp, plant, frame, corkboard, coat</Label>
          <Bubble x={20} y={4770} w={400} h={264} tail={[180, 5110]} text="FACTS" seed="sh/bF" />
          <Bubble x={450} y={4790} w={300} h={198} tail={[700, 5060]} seed="sh/bL" />
          <Laptop x={930} y={4930} w={300} screen="ai" seed="sh/lap300" />
          <rect x={0} y={5230} width={1080} height={30} fill={CC.desk} />
          <NookMug x={40} top={5150} w={70} seed="sh/mug" />
          <TableLamp x={230} y={5230} h={150} glow={false} pool={110} seed="sh/lamp" />
          <PotPlant x={360} y={5150} w={80} h={80} kind="leafy" seed="sh/plant" />
          <PotPlant x={470} y={5170} w={60} h={60} kind="succulent" seed="sh/succ" />
          <FramedPicture x={560} y={5090} w={120} h={140} kind="hills" seed="sh/pic" />
          <Corkboard x={700} y={5060} w={200} h={170} lean={6} seed="sh/cork" />
          <CoatOnHook x={990} y={4980} len={250} seed="sh/coat" />
        </g>

        {/* ---- B3: ambient life on a dusk strip and on the wall */}
        <g>
          <rect x={0} y={5260} width={1080} height={360} fill={CC.sky} />
          <Label x={20} y={5298} light>Ambient: DuskTown + Clouds + Flock + stars / moon; Steam, DustMotes, WallClock, CandleFlame</Label>
          <DuskTown x={0} y={5310} w={640} h={310} horizon={5500} k={0.8} seed="sh/town" />
          <Clouds x={660} y={5330} w={420} h={120} n={2} seed="sh/cl" />
          <Flock x={660} y={5440} w={420} h={100} n={7} size={10} period={3} dur={2.6} offset={-1} seed="sh/fl" />
          <rect x={640} y={5540} width={440} height={80} fill={CC.desk} />
          <DustMotes cx={780} cy={5580} rx={120} ry={34} n={10} seed="sh/mo" />
          <Steam x={940} y={5610} h={80} seed="sh/st" />
          <WallClock cx={1030} cy={5580} r={34} seed="sh/clk" />
          <CandleFlame x={690} y={5612} h={24} seed="sh/fl2" />
        </g>

        {/* ---- B4: lettering + the palette check */}
        <g>
          <rect x={0} y={5620} width={1080} height={380} fill={CC.wall} />
          <Letter x={20} y={5672} size={46}>
            JOB CONTRACT
          </Letter>
          <Letter x={360} y={5672} size={56}>
            NAME WITHHELD
          </Letter>
          <Letter x={790} y={5672} size={40}>
            GOOGLE SAYS
          </Letter>
          <Label x={20} y={5720} size={26}>
            {problems.length ? `PALETTE CHECK: ${problems.length} problems` : `Palette check: house tokens = Cream & Cobalt, COLD = ${COLD_PICK}, DUSK roles: 0 problems`}
          </Label>
          {problems.slice(0, 3).map((p, i) => (
            <Txt key={i} x={20} y={5748 + i * 24} size={20} anchor="start" fill={CC.pop}>
              {p.slice(0, 96)}
            </Txt>
          ))}
          {[
            ['CC', swatch(CC).slice(0, 52)],
            ['CC', swatch(CC).slice(52, 104)],
            ['CC', swatch(CC).slice(104)],
            ['COLD', swatch(COLD)],
            ['DUSK', swatch(DUSK)],
          ].map(([name, sw], j) => (
            <g key={j}>
              <Txt x={20} y={5786 + j * 42} size={22} anchor="start">
                {name as string}
              </Txt>
              {(sw as [string, string][]).slice(0, 52).map(([k, v], i) => (
                <rect key={k} x={90 + (i % 52) * 18.5} y={5764 + j * 42} width={16} height={32} fill={v} stroke={CC.ink} strokeWidth={0.6} />
              ))}
            </g>
          ))}
        </g>
        {/* ---- B5: the build grammar at t = 1.5 s (the sheet's frame 90): ink draws on first, fills land 0.18 s later */}
        <g>
          <rect x={0} y={6000} width={1080} height={320} fill={CC.wall} />
          <Label x={20} y={6036}>Build check at t = 1.50 s: at = 1.30 / 1.36 / 1.40 / 1.44 (lines first, then colour)</Label>
          <ContractPage x={20} y={6060} w={180} at={1.3} seed="sh/bc1" />
          <Badge x={330} y={6140} w={168} at={1.36} seed="sh/bc2" />
          <Cat x={560} y={6290} size={150} pose="sit" at={1.4} seed="sh/bc3" />
          <Mic x={700} y={6290} w={105} at={1.44} seed="sh/bc4" />
          <NookMug x={790} top={6200} w={70} at={1.3} seed="sh/bc5" />
          <FramedPicture x={900} y={6080} w={150} h={180} kind="hills" at={1.4} seed="sh/bc6" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
