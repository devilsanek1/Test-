// KitSets2: each v2 set layout FULLY DRESSED with its ambient life running (1080 x 1920, 60 fps, 8 s), with the cast at
// the board's sizes so a lane sees the set as its panel will look. Props {set}: one of KIT_SETS. Render:
//   node scripts/render-frames.mjs KitSets2 <dir> 1,2 --entry=src/entry-v2-kit.tsx --props='{"set":"nookWide"}' --scale=0.25
import '../palette';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CC} from '../palette';
import {NOOK, NOOK_ANGLE, NookAngle, NookDeskClose, NookRoom} from './Nook';
import {Cat} from './Cat';
import {HerArm, HerBack, HerSeated, HerStanding} from './Her';
import {ContractPage, FloorRun, O1_PAGE, clauseTip} from './Contract';
import {Bubble, Laptop, Mic, Box} from './Props';
import {DeskBack, DeskFront, DESK} from './Desk';
import {DuskTown} from './Town';
import {ColdSet, InsertPage, INSERT_PAGES} from './ColdSet';
import {InterviewRoom, InterviewTableTop, INTERVIEW, NameTent} from './Interview';
import {InterviewTable, Staffer, P3_STAFF, TablePage} from './Staffer';

export const KIT_SETS = ['nookWide', 'nook12', 'nook14', 'desk', 'p5', 'p6', 'town', 'cold', 'coldDusk', 'interview'] as const;
export type KitSetName = (typeof KIT_SETS)[number];
export const KIT_SET_LABELS: Record<KitSetName, string> = {
  nookWide: 'P2 nook WIDE',
  nook12: 'P13 nook 1.2x',
  nook14: 'P4 nook 1.4x',
  desk: 'O1 / P12 desk',
  p5: 'P5 over the shoulder',
  p6: 'P6 new angle',
  town: 'the town (window view)',
  cold: 'cold set night (rejected)',
  coldDusk: 'COLD SET dusk (the pick)',
  interview: 'P3 interview room',
};

const NookWide: React.FC = () => {
  const S = NOOK.herStand;
  return (
    <NookRoom layout="wide" cat={{pose: 'sit', facing: 'l', size: 120, look: [700, 1760]}}>
      <HerStanding x={S.x} y={S.y} h={S.h} facing="r" face="calm" hands={[[648, 1176], [752, 1180]]} seed="ks/her2">
        <ContractPage x={640} y={1170} w={120} runOn={300} seed="ks/p2page" />
      </HerStanding>
      <FloorRun from={{x0: 640, x1: 760, y: 1612}} to={{x0: 560, x1: 940, y: 1880}} p={1} firstYear={2080} decades={3} seed="ks/p2run" />
    </NookRoom>
  );
};

const NookSeated: React.FC<{layout: 'm12' | 'm14'}> = ({layout}) => {
  const H = NOOK.herSeat;
  return (
    <>
      <NookRoom layout={layout} cat={layout === 'm14' ? {pose: 'loaf', facing: 'l', size: 120, x: 680} : {pose: 'sit', facing: 'l', size: 120, x: 690, look: [470, 760]}}>
        <HerSeated x={H.x} y={H.y} h={H.h} facing="r" view="side" face="calm" talking={[[0, 8]]} seed="ks/herS" />
      </NookRoom>
      {layout === 'm14' ? <Bubble x={250} y={650} w={400} h={264} tail={[490, 1078]} seed="ks/b4" /> : <Bubble x={270} y={640} w={400} h={264} tail={[482, 1102]} text="FACTS" seed="ks/b13" />}
    </>
  );
};

const Desk: React.FC = () => {
  const tip = clauseTip(O1_PAGE, [1, 1]);
  return (
    <>
      <DeskBack />
      <Box />
      <ContractPage {...O1_PAGE} runOn={520} edgeY={DESK.front} seed="ks/o1page" />
      <DeskFront />
      <Cat x={900} y={DESK.front} size={340} pose="peek" look={[560, 1600]} seed="ks/deskcat" />
      <HerArm tip={tip} seed="ks/arm" />
    </>
  );
};

const P5: React.FC = () => (
  <NookDeskClose>
    <Laptop x={530} y={953} w={460} screen="ai" seed="ks/p5lap" />
    <Cat x={1010} y={1330} size={300} pose="loaf" facing="l" seed="ks/p5cat" />
    <HerBack x={120} y={1600} h={1100} facing="r" seed="ks/p5her" />
  </NookDeskClose>
);

const P6: React.FC = () => {
  const H = NOOK_ANGLE.her;
  return (
    <>
      <NookAngle behind={<HerSeated x={H.x} y={H.y} h={H.h} facing="l" view="front34" face="worried" talking={[[0, 8]]} part="body" seed="ks/p6her" />}>
        <Cat x={990} y={NOOK_ANGLE.sill} size={120} pose="sit" facing="l" look={[620, 1130]} seed="ks/p6cat" />
        <Mic x={NOOK_ANGLE.mic.x} y={NOOK_ANGLE.mic.y} w={NOOK_ANGLE.mic.w} tilt={8} seed="ks/p6mic" />
        <HerSeated x={H.x} y={H.y} h={H.h} facing="l" view="front34" face="worried" talking={[[0, 8]]} part="arms" seed="ks/p6her" />
      </NookAngle>
      <Bubble x={120} y={650} w={400} h={264} tail={[500, 1104]} seed="ks/b6" />
    </>
  );
};

const Town: React.FC = () => (
  <>
    <rect x={0} y={0} width={1080} height={1920} fill={CC.wall} />
    <DuskTown x={60} y={380} w={960} h={1160} horizon={1000} k={1.6} moon={[860, 520]} seed="ks/town" />
  </>
);

const Cold: React.FC<{variant: 'night' | 'dusk'}> = ({variant}) => {
  const P = INSERT_PAGES.P9;
  return (
    <>
      <ColdSet variant={variant} />
      <InsertPage {...P} seed="ks/cpage" />
    </>
  );
};

const Interview: React.FC = () => {
  const A = P3_STAFF.A;
  const B = P3_STAFF.B;
  return (
    <>
      <InterviewRoom />
      <Staffer {...B} variant="B" part="body" />
      <Staffer {...A} variant="A" part="body" talking={[[0, 8]]} />
      <InterviewTable />
      <TablePage {...INTERVIEW.page} />
      <InterviewTableTop />
      <Staffer {...B} variant="B" part="arms" />
      <Staffer {...A} variant="A" part="arms" />
      <NameTent {...INTERVIEW.tent} />
      <Mic x={INTERVIEW.mic.x} y={INTERVIEW.mic.y} w={INTERVIEW.mic.w} tilt={10} />
    </>
  );
};

export const KitSet: React.FC<{set: KitSetName}> = ({set}) => {
  switch (set) {
    case 'nookWide':
      return <NookWide />;
    case 'nook12':
      return <NookSeated layout="m12" />;
    case 'nook14':
      return <NookSeated layout="m14" />;
    case 'desk':
      return <Desk />;
    case 'p5':
      return <P5 />;
    case 'p6':
      return <P6 />;
    case 'town':
      return <Town />;
    case 'cold':
      return <Cold variant="night" />;
    case 'coldDusk':
      return <Cold variant="dusk" />;
    case 'interview':
      return <Interview />;
  }
};

export const KitSets2: React.FC<{set: string}> = ({set}) => (
  <AbsoluteFill style={{background: CC.wall}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <KitSet set={(KIT_SETS as readonly string[]).includes(set) ? (set as KitSetName) : 'nookWide'} />
    </svg>
  </AbsoluteFill>
);
