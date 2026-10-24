// SharedKitSheet — dev sheet of the shared world kit (props lane owns this file): every prop of
// src/scenes/shared/props with its states and animations (each cell loops on its own clock), plus a thumbnail of
// every set of src/scenes/shared/sets. 10 s. Preview: scripts/still.sh SharedKitSheet 4.5 out.png
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {palette, skies} from '../lib/theme';
import {TimeProvider, useTime} from '../lib/time';
import {captionFontStack, useCaptionFont} from '../lib/font';
import {mat, XG} from '../lib/xf';
import {Sun} from '../lib/Sun';
import {
  BackSoonTag,
  Bit,
  BrowserChrome,
  CheckFlag,
  CheckMark,
  Cobweb,
  ElephantEmblem,
  ElephantPlaque,
  ElephantStamp,
  HoursClock,
  LoadingRing,
  Lock,
  LockCrate,
  Magnifier,
  MarkRing,
  MinuteWedge,
  PowerGlyph,
  QuestionMark,
  RollerShutter,
  ShutterPadlock,
  SunGlowSteps,
  SunPie,
  SunPress,
  WaxSeal,
  WrenchGlyph,
  WrenchTag,
  HeatTicks,
} from '../scenes/shared/props';

const CW = 216;
const CH = 232;

/** A labelled cell with its own looping clock (children see t mod period - offset). */
const Cell: React.FC<{c: number; r: number; span?: number; label: string; bg?: string; period?: number; children?: React.ReactNode; rowH?: number; y0?: number}> = ({c, r, span = 1, label, bg = palette.cream, period = 5, children, rowH = CH, y0 = 96}) => {
  const t = useTime();
  const x = c * CW;
  const y = y0 + r * rowH;
  const w = CW * span;
  return (
    <g>
      <rect x={x + 4} y={y + 4} width={w - 8} height={rowH - 8} fill={bg} />
      <TimeProvider global={t % period} offset={0}>
        <XG m={mat.translate(x, y)}>{children}</XG>
      </TimeProvider>
      <text x={x + w / 2} y={y + rowH - 14} fontFamily={captionFontStack} fontSize={21} fill={palette.ink} textAnchor="middle">
        {label}
      </text>
    </g>
  );
};

export const SharedKitSheet: React.FC = () => {
  useCaptionFont();
  return (
    <AbsoluteFill style={{background: palette.white}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={palette.white} />
        <text x={540} y={62} fontFamily={captionFontStack} fontSize={44} fill={palette.ink} textAnchor="middle">
          Shared world kit: props
        </text>
        {/* ---- row 0: the PHP lock */}
        <Cell c={0} r={0} label="Lock closed / fixed">
          <Lock x={70} y={100} size={110} seed="l1" />
          <Lock x={160} y={100} size={110} state="fixed" seed="l2" at={0.4} checkAt={1.0} tagSwingAt={1.4} />
        </Cell>
        <Cell c={1} r={0} label="screws, cover, short bolt">
          <Lock x={108} y={105} size={150} screwsOutAt={0.5} coverOpenAt={0.8} boltTestAt={1.3} gapMarkAt={1.7} lensGlintAt={3.2} seed="l3" rider={<Bit x={8} y={4} size={18} peekAt={2.2} seed="b1" />} />
        </Cell>
        <Cell c={2} r={0} label="blueprint / sketch" bg={palette.white}>
          <Lock x={62} y={100} size={110} state="blueprint" at={0.3} seed="l4" />
          <Lock x={160} y={100} size={110} state="sketch" at={0.6} seed="l5" />
        </Cell>
        <Cell c={3} r={0} label="ghost / LOD 20 / 8 px">
          <Lock x={56} y={100} size={110} state="ghost" seed="l6" />
          <Lock x={140} y={100} size={20} depth="far" seed="l7" cobwebAt={1} />
          <Lock x={180} y={100} size={8} seed="l8" />
        </Cell>
        <Cell c={4} r={0} label="drop + crate">
          <Lock x={60} y={60} size={60} dropAt={1} dropDist={70} seed="l9" rider={<Bit x={8} y={-50} size={22} seed="b2" />} />
          <LockCrate x={150} y={170} size={90} n={3} at={0.6} seed="c1" />
        </Cell>
        {/* ---- row 1: elephant family */}
        <Cell c={0} r={1} label="emblem / old + cane">
          <ElephantEmblem x={58} y={90} size={100} at={0.2} />
          <ElephantEmblem x={160} y={90} size={90} style="old" cane lean={12} caneAt={1.2} bg={palette.tan} />
        </Cell>
        <Cell c={1} r={1} label="plates: 50 / 20 / blank / dot">
          <ElephantPlaque x={60} y={90} size={70} at={0.3} pulseAt={1.4} />
          <ElephantPlaque x={125} y={90} size={22} tickOnAt={0.8} />
          <ElephantPlaque x={170} y={90} size={34} variant="blank" tickOnAt={1.1} />
          <ElephantPlaque x={200} y={90} size={5} variant="dot" blinkAt={1.6} />
        </Cell>
        <Cell c={2} r={1} label="round sign, swing">
          <ElephantPlaque x={30} y={36} size={110} variant="round" swingAt={0.6} />
        </Cell>
        <Cell c={3} r={1} label="hanging, flips old">
          <ElephantPlaque x={20} y={30} size={120} variant="hanging" swingAt={0.4} flipOldAt={1.4} cobwebAt={1.8} dustAt={2.1} caneAt={2.4} />
        </Cell>
        <Cell c={4} r={1} label="stamp slam" bg={palette.cream}>
          <ElephantStamp x={108} y={80} rx={90} ry={34} slamAt={0.6} />
          <ElephantStamp x={108} y={160} r={34} at={0.2} />
        </Cell>
        {/* ---- row 2: Bit + browser chrome */}
        <Cell c={0} r={2} label="Bit idle / hop / alert">
          <Bit x={50} y={110} size={40} seed="b3" />
          <Bit x={120} y={110} size={40} hopAt={1} seed="b4" />
          <Bit x={180} y={110} size={24} alertAt={1.5} seed="b5" />
          <Bit x={60} y={170} size={16} seed="b6" />
          <Bit x={110} y={170} size={8} seed="b7" />
          <Bit x={160} y={170} size={30} state="doodle" at={0.5} seed="b8" />
        </Cell>
        <Cell c={1} r={2} label="Bit crawl / peek">
          <Bit crawl={{at: 0.4, path: [[20, 80], [180, 80], [190, 30]], speed: 70}} size={24} seed="b9" />
          <rect x={100} y={110} width={14} height={70} fill={palette.tan} />
          <Bit x={114} y={150} size={34} peekAt={1} hideAt={2.6} seed="b10" />
        </Cell>
        <Cell c={2} r={2} span={2} label="BrowserChrome: chrome, screen on, off, blink" bg={palette.sand}>
          <BrowserChrome x={20} y={30} w={210} h={150} chromeAt={0.5} screenOnAt={1} offAt={3.2} seed="bw1" />
          <BrowserChrome x={250} y={40} w={150} h={110} blinkAt={[1.2, 1.6]} seed="bw2" />
          <BrowserChrome x={250} y={160} w={40} h={30} seed="bw3" />
          <BrowserChrome x={300} y={160} w={14} h={10} seed="bw4" />
        </Cell>
        <Cell c={4} r={2} label="rail, progress, ring" bg={palette.cream}>
          <BrowserChrome x={10} y={30} w={196} h={30} mode="addressRail" railLightAt={0.8} seed="bw5" />
          <BrowserChrome x={10} y={80} w={196} h={100} progress={{at: 0.5, steps: [{t: 0.8, v: 0.04}, {t: 1.4, v: 0.08}, {t: 2.0, v: 0.11}, {t: 3.2, v: 0.14}]}} ring={{at: 0.3}} seed="bw6" />
          <LoadingRing x={180} y={200} r={10} at={0.2} pulseAt={1.5} seed="lr" />
        </Cell>
        {/* ---- row 3: shutters + sun morphs */}
        <Cell c={0} r={3} span={2} label="shutter slam, padlock, back-soon tag, peephole" bg={palette.cream}>
          <BrowserChrome x={30} y={50} w={150} h={110} seed="sw1" />
          <RollerShutter x={30} y={50} w={150} h={110} slamAt={0.8} seed="sh1" />
          <ShutterPadlock x={105} y={170} at={1.2} glintAt={2.2} seed="pl1" />
          <BackSoonTag x={135} y={162} at={1.3} tapAt={3} seed="tg1" />
          <BrowserChrome x={240} y={50} w={150} h={110} progress={{steps: [{t: 0.5, v: 0.11}, {t: 2, v: 0.2}]}} seed="sw2" />
          <RollerShutter x={240} y={50} w={150} h={110} state="down" peephole={{x: 300, y: 95, r: 14}} seed="sh2" />
        </Cell>
        <Cell c={2} r={3} label="power glyph + press" bg={skies.day}>
          <SunPress at={1.2} cx={108} cy={100} r={70}>
            <Sun cx={108} cy={100} r={70}>{(r) => <PowerGlyph r={r} glintAt={0.6} />}</Sun>
          </SunPress>
        </Cell>
        <Cell c={3} r={3} label="pie 7/10 -> solid" bg={skies.day}>
          <Sun cx={108} cy={100} r={70}>{(r) => <SunPie r={r} n={10} cream={3} spokesAt={0.4} slicesAt={1.2} pulseAt={2} solidAt={3.6} />}</Sun>
        </Cell>
        <Cell c={4} r={3} label="hours clock" bg={skies.golden}>
          <Sun cx={108} cy={100} r={70}>{(r) => <HoursClock r={r} at={0.4} spinAt={0.8} outAt={3.4} />}</Sun>
        </Cell>
        <Cell c={0} r={4} label="45-minute wedge" bg={skies.golden}>
          <Sun cx={108} cy={100} r={70}>{(r) => <MinuteWedge r={r} at={0.6} />}</Sun>
        </Cell>
        <Cell c={1} r={4} label="wax seal" bg={skies.golden}>
          <Sun cx={60} cy={60} r={44} />
          <rect x={120} y={150} width={60} height={40} fill={palette.white} stroke={palette.ink} strokeWidth={2} />
          <WaxSeal from={[80, 90]} to={[150, 166]} at={0.6} arc={40} />
        </Cell>
        <Cell c={2} r={4} label="glow steps, heat ticks" bg={skies.golden}>
          <SunGlowSteps cx={108} cy={120} r={50} at={0.8} />
          <Sun cx={108} cy={120} r={50}>{(r) => <HeatTicks r={r} at={1.6} />}</Sun>
        </Cell>
        <Cell c={3} r={4} label="glyphs" bg={palette.cream}>
          <CheckMark x={40} y={60} size={50} at={0.4} />
          <MarkRing x={110} y={60} r={34} at={0.7} pingAt={1.4} />
          <Cobweb x={150} y={20} r={50} corner="tl" at={1} />
          <Magnifier x={40} y={140} r={22} at={1.2} />
          <WrenchGlyph x={120} y={140} w={56} at={1.4} />
        </Cell>
        <Cell c={4} r={4} label="tag, flag, ?" bg={palette.cream}>
          <WrenchTag x={50} y={60} size={60} at={0.5} />
          <WrenchTag x={100} y={60} size={30} at={0.7} />
          <CheckFlag x={150} y={190} size={50} raiseAt={0.9} />
          <QuestionMark x={60} y={150} size={60} at={1.3} />
        </Cell>
      </svg>
    </AbsoluteFill>
  );
};

