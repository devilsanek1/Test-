// canal/samples.tsx: the kit's sample frames (CanalSample-S1/S2/S4/S8) and the KitCanal sheet. Sets at the map's
// positions; her, the ghosts and the public as kit placeholders (the film's people come from K4 via <CanalCast>).

import React from 'react';
import {CM, INK_PX} from '../../palette';
import {World} from '../../../lib/World';
import {useTime} from '../../../lib/time';
import {torso} from '../../../lib/sketch';
import {Batch, Paint, ovalPath, P} from './core';
import {S1Set, S2Set, S4Set, S8Set, SunDisc} from './sets';
import {XG, mat} from '../../../lib/xf';
import {captionFontStack, useCaptionFont} from '../../../lib/font';
import {WingS1, WingS7} from './wing';
import {WingS2} from './wall';
import {TerraceRow, terraceBacksInto} from './terrace';
import {Narrowboat, CafeDeck, BoatWiper} from './boat';
import {gasholderInto, roofRowInto, viaductInto, ViaductTrain, roadBridgeInto, BridgeBus, warehouseInto} from './far';
import {Lamp, Planter, benchInto, bollardInto, binInto, bikeInto, drainInto, railingInto} from './towpath';
import {Newsstand} from './newsstand';
import {Cloud, Branch, Birds, Pigeons, Ducks, Heron, Puffs, StringLights, FallingLeaves, Movers} from './life';
import {Steps} from './steps';
import {Water} from './water';
import * as MAP from '../../world/map';

const GOLDEN = [CM.sky, CM.bandGold];

/** A placeholder of HER (teal coat, plum bun, cream tote; back / walking profile) and the ghost row, at film time t. */
export const RowPlaceholders: React.FC<{t?: number}> = ({t: tIn}) => {
  const tt = useTime();
  const t = tIn ?? tt;
  const b = new Batch();
  const row = MAP.s1RowAt(t);
  // far members first
  for (let i = row.length - 1; i >= 0; i--) {
    const m = row[i];
    if (!m.visible) continue;
    const spec = MAP.S1_ROW[i];
    const H = m.h;
    const x = m.x;
    const y = m.feetY;
    const headH = H * 0.15;
    const torsoH = H * 0.5;
    const tw = H * 0.26;
    const legY = y - H * 0.3;
    const coat = m.kind === 'her' ? CM.hero : m.kind === 'ghost' ? CM.ghostPaper : 'none';
    const head = spec.headHex ?? 'none';
    b.layer();
    const body = torso(x, legY + 8, tw, torsoH, 0.4, 0.1) + 'Z';
    if (coat !== 'none') {
      b.rect(m.kind === 'her' ? CM.anchor : CM.ghostPaper, x - tw * 0.3, legY, tw * 0.22, H * 0.3);
      b.rect(m.kind === 'her' ? CM.anchor : CM.ghostPaper, x + tw * 0.08, legY, tw * 0.22, H * 0.3);
      b.fill(coat, body);
      if (head !== 'none') b.fill(head, ovalPath(x, legY - torsoH - headH * 0.35, headH * 0.42, headH * 0.5));
      b.fill(head !== 'none' ? head : CM.ghostPaper, ovalPath(x + 2, legY - torsoH - headH * 0.85, headH * 0.2, headH * 0.17));
      if (m.kind === 'her') b.rect(CM.coatOat, x + tw * 0.4, legY - torsoH * 0.5, tw * 0.3, torsoH * 0.35);
    }
    const ink = m.kind === 'her' ? 0 : INK_PX.far;
    if (ink > 0) {
      b.ink(body + `M${P(x - tw * 0.3, legY)}L${P(x - tw * 0.3, y)}L${P(x - tw * 0.08, y)}L${P(x - tw * 0.08, legY)}M${P(x + tw * 0.08, legY)}L${P(x + tw * 0.08, y)}L${P(x + tw * 0.3, y)}L${P(x + tw * 0.3, legY)}`, ink);
      b.ink(`M${P(x - headH * 0.42, legY - torsoH - headH * 0.35)}A${(headH * 0.42).toFixed(1)} ${(headH * 0.5).toFixed(1)} 0 1 1 ${P(x + headH * 0.42, legY - torsoH - headH * 0.35)}A${(headH * 0.42).toFixed(1)} ${(headH * 0.5).toFixed(1)} 0 1 1 ${P(x - headH * 0.42, legY - torsoH - headH * 0.35)}`, ink);
    }
  }
  return <Paint b={b} seed="rowph" misreg={false} />;
};

// ---------------------------------------------------------------- the samples

export const CanalSampleS1: React.FC = () => (
  <World sky={GOLDEN} horizon={1000}>
    <S1Set towpath={<RowPlaceholders />} />
  </World>
);

export const CanalSampleS2: React.FC = () => (
  <World sky={GOLDEN} horizon={1000}>
    <S2Set staffCoolAt={2.9} aBoard={<BoardPlaceholder r={MAP.S2.aBoard} />} />
  </World>
);

/** A stand-in for K3's StatementBoard / Fingerpost in the kit samples only (paper face, plum frame, text lines). */
export const BoardPlaceholder: React.FC<{r: MAP.Rect; legs?: number}> = ({r, legs}) => {
  const b = new Batch();
  const w = r.x1 - r.x0;
  const h = r.y1 - r.y0;
  const ly = legs ?? r.y1 + 30;
  b.rect(CM.anchor, r.x0 + w * 0.08, r.y1 - 4, 10, ly - r.y1 + 4);
  b.rect(CM.anchor, r.x1 - w * 0.08 - 10, r.y1 - 4, 10, ly - r.y1 + 4);
  b.rect(CM.anchor, r.x0 - 8, r.y0 - 8, w + 16, h + 16);
  b.rect(CM.paper, r.x0, r.y0, w, h);
  b.rect(CM.anchor, r.x0 + w * 0.08, r.y0 + h * 0.08, w * 0.6, h * 0.1);
  let d = '';
  for (let k = 0; k < 4; k++) d += `M${P(r.x0 + w * 0.08, r.y0 + h * (0.34 + k * 0.13))}L${P(r.x0 + w * (0.86 - (k % 2) * 0.2), r.y0 + h * (0.34 + k * 0.13))}`;
  b.ink(d, INK_PX.mid);
  return <Paint b={b} seed="boardph" misreg={false} />;
};
export const CanalSampleS4: React.FC = () => (
  <World sky={GOLDEN} horizon={1000}>
    <S4Set
      towpath={
        <>
          <FingerpostPlaceholder />
          <HerWalkPlaceholder x={MAP.S4.her.x} feetY={MAP.S4.her.feetY} h={MAP.S4.her.h} />
        </>
      }
    />
  </World>
);
export const CanalSampleS8: React.FC = () => (
  <World sky={[CM.sky, CM.bandSunset]} horizon={1000}>
    <S8Set wAt={0.5} board={<BoardPlaceholder r={MAP.B} legs={MAP.B_LEGS_Y1} />} lane={<RowS8Placeholders />} />
  </World>
);

/** Her walking LEFT in profile (placeholder): teal coat, plum bun, cream tote. */
export const HerWalkPlaceholder: React.FC<{x: number; feetY: number; h: number}> = ({x, feetY, h}) => {
  const t = useTime();
  const b = new Batch();
  const st = Math.sin(t * 6.5) * h * 0.06;
  b.rect(CM.anchor, x - h * 0.05 + st, feetY - h * 0.3, h * 0.07, h * 0.3);
  b.rect(CM.anchor, x + h * 0.01 - st, feetY - h * 0.3, h * 0.07, h * 0.3);
  b.fill(CM.hero, `M${P(x - h * 0.12, feetY - h * 0.26)}L${P(x - h * 0.08, feetY - h * 0.78)}Q${P(x, feetY - h * 0.83)} ${P(x + h * 0.08, feetY - h * 0.78)}L${P(x + h * 0.13, feetY - h * 0.26)}Z`);
  b.fill(CM.anchor, ovalPath(x, feetY - h * 0.88, h * 0.075, h * 0.085));
  b.fill(CM.anchor, ovalPath(x + h * 0.06, feetY - h * 0.92, h * 0.04, h * 0.04));
  b.rect(CM.coatOat, x + h * 0.06, feetY - h * 0.6, h * 0.1, h * 0.14);
  return <Paint b={b} seed="herwalk" misreg={false} />;
};
// ---------------------------------------------------------------- the kit sheet

/** One sheet cell: draws `children` (authored in their shot's screen px) through a source window into a cell. */
const Cell: React.FC<{i: number; src: [number, number, number, number]; label: string; bg?: string; children?: React.ReactNode}> = ({i, src, label, bg = CM.sky, children}) => {
  const cw = 360;
  const ch = 384;
  const cx = (i % 3) * cw;
  const cy = Math.floor(i / 3) * ch;
  const [sx, sy, sw, sh] = src;
  const k = Math.min((cw - 12) / sw, (ch - 40) / sh);
  const ox = cx + (cw - sw * k) / 2;
  const oy = cy + 34 + (ch - 40 - sh * k) / 2;
  const id = `kc${i}`;
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect x={ox} y={oy} width={sw * k} height={sh * k} />
        </clipPath>
      </defs>
      <rect x={cx + 2} y={cy + 2} width={cw - 4} height={ch - 4} fill={CM.paper} />
      <g clipPath={`url(#${id})`}>
        <rect x={ox} y={oy} width={sw * k} height={sh * k} fill={bg} />
        <XG m={mat.compose(mat.translate(ox, oy), mat.scale(k), mat.translate(-sx, -sy))}>{children}</XG>
      </g>
      <text x={cx + 12} y={cy + 26} fontFamily={captionFontStack} fontSize={22} fill={CM.ink}>
        {label}
      </text>
    </>
  );
};

export const KitCanal: React.FC = () => {
  useCaptionFont();
  return (
    <World sky={CM.paper} horizon={1000}>
      <Cell i={0} src={[300, 560, 780, 560]} label="CanalWing S1 (W dark, letters)" bg={CM.bandGold}>
        <WingS1 />
      </Cell>
      <Cell i={1} src={[0, 590, 1080, 480]} label="CanalWing S2: wall + tiers">
        <WingS2 />
      </Cell>
      <Cell i={2} src={[300, 590, 780, 440]} label="CanalWing S7 forecourt" bg={CM.bandSunset}>
        <WingS7 />
      </Cell>
      <Cell i={3} src={[0, 590, 1080, 560]} label="Terrace S3: her French window" bg={CM.bandSunset}>
        <TerraceRow x0={-120} levels={{ground: 1100, first: 878, cornice: 664, mansardTop: 602}} houses={[{w: 300, first: 'two'}, {w: 360, first: 'french'}, {w: 330, first: 'french', lights: true, neighbour: 'first'}, {w: 330, first: 'two', stucco: true}]} her={{index: 1, french: MAP.W2_CUT}} seed="kitS3" litFrac={0.6} lightsOn />
      </Cell>
      <Cell i={4} src={[0, 600, 1080, 300]} label="Terrace backs, warehouse (S4)">
        <BacksDemo />
      </Cell>
      <Cell i={5} src={[0, 980, 1080, 760]} label="Narrowboats: far, mid, near">
        <Narrowboat x={40} water={1120} len={460} h={80} dir={1} seed="kb1" topView={8} roofItems />
        <Narrowboat x={560} water={1170} len={480} h={110} dir={-1} seed="kb2" cabin={CM.coatOat} topView={12} roofItems panel />
        <Narrowboat x={-200} water={1700} len={1500} h={300} dir={1} seed="kb3" topView={40} hullK={0.12} roofItems panel cafe />
      </Cell>
      <Cell i={6} src={[0, 600, 1080, 760]} label="Far roofs, gasholders, viaduct" bg={CM.bandGold}>
        <FarDemo />
      </Cell>
      <Cell i={7} src={[0, 860, 560, 260]} label="Road bridge + bus" bg={CM.bandGold}>
        <BridgeDemo />
      </Cell>
      <Cell i={8} src={[0, 600, 1080, 760]} label="Lamps (off / lit / near), furniture">
        <FurnitureDemo />
      </Cell>
      <Cell i={9} src={[-80, 880, 520, 440]} label="Newsstand (urn steam)">
        <Newsstand x0={-70} x1={200} top={918} ground={1292} seed="kitnews" />
      </Cell>
      <Cell i={10} src={[0, 600, 1080, 760]} label="Life: birds, ducks, heron, smoke...">
        <LifeDemo />
      </Cell>
      <Cell i={11} src={[0, 1200, 1080, 720]} label="Steps (S1): seated slots, bollard">
        <Steps />
      </Cell>
      <Cell i={12} src={[0, 1080, 1080, 240]} label="Water: reflections, glints, ducks">
        <Water y0={1080} y1={1320} seed="kitwater" reflections={[{x0: 100, x1: 600, color: CM.brickLight}, {x0: 660, x1: 820, color: CM.lamp}]} />
        <Ducks ducks={[{x: 400, y: 1250, size: 30, drake: true}, {x: 470, y: 1270, size: 28}]} seed="kitducks" />
      </Cell>
      <Cell i={13} src={[-40, 1500, 620, 440]} label="Cafe boat deck (S8)">
        <CafeDeck x0={-30} x1={560} y0={1540} y1={1940} seed="kitdeck" />
      </Cell>
      <Cell i={14} src={[0, 0, 1080, 1920]} label="S7 -> S8 BoatWiper" bg={CM.sky}>
        <BoatWiper x={540} p={0.5} dir="left" />
      </Cell>
    </World>
  );
};

const BacksDemo: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  terraceBacksInto(b, 300, 1100, 900, 640, 'kitbacks', t, 0.3);
  warehouseInto(b, 20, 900, 260, 260, 'kitware', {ink: INK_PX.hair, lit: 0.3, t});
  return <Paint b={b} seed="kitbacks" />;
};
const FarDemo: React.FC = () => {
  const b = new Batch();
  gasholderInto(b, 300, 1000, 160, 260, 'kitgas', {drum: 1, ink: 1.8});
  gasholderInto(b, 640, 1000, 120, 200, 'kitgas2', {ink: 1.6});
  b.layer();
  roofRowInto(b, {x0: -40, x1: 1120, base: 1240, top: 980, spread: 30, seed: 'kitroofs', walls: [CM.brick, CM.brickLight, CM.stucco, CM.brickDeep], roof: CM.brickDeep, wRange: [80, 180], ink: INK_PX.hair, win: 10, lit: 0.3}); 
  b.layer();
  viaductInto(b, -40, 1120, 1060, 1200, 140, 'kitvia', INK_PX.hair);
  return (
    <>
      <SunDisc x={300} y={900} r={80} />
      <Paint b={b} seed="kitfar" />
      <ViaductTrain x0={-40} x1={1120} deck={1056} h={30} seed="kittrain" speed={1} every={100} phase={0.01} />
    </>
  );
};
const BridgeDemo: React.FC = () => {
  const b = new Batch();
  roadBridgeInto(b, -40, 600, 960, 1080, 160, 260, 'kitbridge', INK_PX.far);
  return (
    <>
      <Paint b={b} seed="kitbridge" />
      <BridgeBus deck={944} h={52} at={-10} from={100} to={2000} speed={22} seed="kitbus" />
    </>
  );
};
const FurnitureDemo: React.FC = () => {
  const b = new Batch();
  benchInto(b, 560, 1250, 240, 'back', 'kitbench');
  benchInto(b, 800, 1250, 220, 'side', 'kitbench2');
  bollardInto(b, 340, 1250, 70, 'kitbol');
  binInto(b, 420, 1250, 90, 'kitbin');
  bikeInto(b, 640, 1340, 70, 'kitbike', CM.coatMustard, 1);
  drainInto(b, 300, 1300, 120, 'kitdrain');
  railingInto(b, 40, 1060, 1300, 120, 'kitrail');
  return (
    <>
      <Lamp x={100} y={1250} h={560} seed="kl1" />
      <Lamp x={220} y={1250} h={560} seed="kl2" on pool={70} />
      <Paint b={b} seed="kitfurn" />
      <Planter x0={860} x1={1060} y={1340} h={140} seed="kitplanter" />
      <Lamp x={1000} y={1400} h={760} w={26} variant="near" seed="kl3" />
    </>
  );
};
const LifeDemo: React.FC = () => (
  <>
    <Cloud x={560} y={640} w={420} h={110} seed="kitcloud" speed={0} top={CM.paper} />
    <Branch side={-1} y={620} reach={300} drop={200} seed="kitbranch" />
    <Birds from={[420, 860]} to={[700, 860]} n={6} size={16} seed="kitbirds" />
    <Birds from={[720, 900]} to={[1000, 900]} n={5} size={16} seed="kitbirds2" liftAt={[-0.6]} />
    <Pigeons ledge={[100, 400, 960]} n={4} size={26} seed="kitpig" />
    <Heron x={900} y={1220} h={130} seed="kitheron" />
    <Ducks ducks={[{x: 600, y: 1260, size: 34, drake: true}, {x: 690, y: 1280, size: 32}]} seed="kitducks2" />
    <Puffs x={120} y={1200} seed="kitsmoke" kind="smoke" scale={1.4} ceil={700} />
    <Puffs x={300} y={1220} seed="kitsteam" kind="steam" scale={1.1} ceil={700} />
    <StringLights from={[60, 1020]} to={[520, 1010]} sag={30} n={12} seed="kitsl1" r={7} />
    <StringLights from={[540, 1020]} to={[1020, 1010]} sag={30} n={12} seed="kitsl2" r={7} on />
    <FallingLeaves box={[400, 900, 900, 1340]} n={8} size={18} seed="kitleaves" />
    <Movers movers={[{pose: 'walk', from: [100, 1340], to: [1000, 1340], h: 200, speed: 0.01, phase: 0.4, seed: 'kmw'}, {pose: 'jog', from: [100, 1340], to: [1000, 1340], h: 200, speed: 0.01, phase: 0.7, seed: 'kmj'}, {pose: 'cycle', from: [100, 1340], to: [1000, 1340], h: 200, speed: 0.01, phase: 0.95, seed: 'kmc'}, {pose: 'dog', from: [100, 1340], to: [1000, 1340], h: 60, speed: 0.01, phase: 0.15, seed: 'kmd'}]} />
  </>
);

/** K3's fingerpost stand-in (samples only): one post, two plates pointing west. */
export const FingerpostPlaceholder: React.FC = () => {
  const b = new Batch();
  const p = MAP.S4.post;
  b.rect(CM.anchor, p.x - 7, p.topY, 14, p.footY - p.topY);
  for (const r of [MAP.S4.plateDec2025, MAP.S4.plateApr2026]) {
    b.poly(CM.paper, [[r.x0 + 30, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0 + 30, r.y1], [r.x0, (r.y0 + r.y1) / 2]]);
    b.rect(CM.anchor, r.x0 + 60, r.y0 + 22, (r.x1 - r.x0) * 0.4, 18);
    b.ink(`M${P(r.x0 + 60, r.y0 + 66)}L${P(r.x1 - 40, r.y0 + 66)}`, INK_PX.mid);
  }
  return <Paint b={b} seed="postph" misreg={false} />;
};

/** S8 sample: her (back, walking home) and the three callback ghosts at the map's spots (placeholders). */
export const RowS8Placeholders: React.FC = () => {
  const b = new Batch();
  const ghosts = (MAP.S8 as unknown as {ghosts?: {x: number; feetY: number; h: number}[]}).ghosts ?? [];
  ghosts.forEach((g, i) => {
    const x = g.x;
    const y = g.feetY;
    const H = g.h;
    b.layer();
    b.rect(CM.ghostPaper, x - H * 0.1, y - H * 0.3, H * 0.07, H * 0.3);
    b.rect(CM.ghostPaper, x + H * 0.03, y - H * 0.3, H * 0.07, H * 0.3);
    const body = torso(x, y - H * 0.28, H * 0.26, H * 0.52, 0.4, 0.1) + 'Z';
    b.fill(CM.ghostPaper, body);
    b.fill(CM.ghostHead[3 + Math.min(2, i)], ovalPath(x, y - H * 0.86, H * 0.065, H * 0.075));
    b.ink(body, INK_PX.far);
  });
  return <Paint b={b} seed="s8ghostsph" misreg={false} />;
};