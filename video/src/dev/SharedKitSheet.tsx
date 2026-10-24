// SharedKitSheet — dev sheet of the SHARED WORLD KIT (props lane owns this file): every prop of
// src/scenes/shared/props with its states and animations (each cell loops on its own 5 s clock, so any frame shows
// mid-animation states), plus a thumbnail of every set in src/scenes/shared/sets (SET_CATALOG thumb()).
// 10 s. Preview: scripts/still.sh SharedKitSheet 2.5 out.png   (try 0.9, 1.6, 2.5, 3.4: the cells loop every 5 s)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {palette, skies} from '../lib/theme';
import {TimeProvider, useTime} from '../lib/time';
import {captionFontStack, useCaptionFont} from '../lib/font';
import {mat, XG} from '../lib/xf';
import {Look, UnBuild} from '../lib/exit';
import {Sun} from '../lib/Sun';
import {Ink} from '../lib/Ink';
import {hline} from '../lib/sketch';
import {Door} from '../lib/kit';
import {
  AttemptStipple,
  Attempter,
  BackSoonTag,
  Bit,
  BitSwarm,
  Bollard,
  BrowserChrome,
  Calendar,
  Caretaker,
  CheckFlag,
  CheckMark,
  Citizen,
  Cobweb,
  EdgeOnlooker,
  ElephantEmblem,
  ElephantPlaque,
  ElephantStamp,
  Envelope,
  Ghost,
  HeatTicks,
  HoursClock,
  Investigator,
  Keeper,
  LeakClones,
  LeakSheet,
  LoadingRing,
  Lock,
  LockCrate,
  Magnifier,
  MailSlot,
  Maker,
  MakersCart,
  MarkRing,
  Messenger,
  MinuteWedge,
  NewLockIcon,
  PowerGlyph,
  QuestionMark,
  RailBoard,
  RollerShutter,
  ScanBeam,
  ShutterPadlock,
  Snail,
  SparkleTablet,
  SunGlowSteps,
  SunPie,
  SunPress,
  TargetRing,
  Tram,
  WaxSeal,
  WrenchGlyph,
  WrenchTag,
  yearPages,
} from '../scenes/shared/props';
import {SET_CATALOG} from '../scenes/shared/sets/catalog';

const CW = 216;
const RH = 196;
const Y0 = 84;
const ROWS = 8;

/** A labelled cell with its own looping clock (children see t mod period); children in cell-local px. */
const Cell: React.FC<{c: number; r: number; span?: number; label: string; bg?: string; period?: number; children?: React.ReactNode}> = ({c, r, span = 1, label, bg = palette.cream, period = 5, children}) => {
  const t = useTime();
  const x = c * CW;
  const y = Y0 + r * RH;
  const w = CW * span;
  const id = `cell${c}_${r}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={x + 3} y={y + 3} width={w - 6} height={RH - 6} />
        </clipPath>
      </defs>
      <rect x={x + 3} y={y + 3} width={w - 6} height={RH - 6} fill={bg} />
      <g clipPath={`url(#${id})`}>
        <TimeProvider global={t % period} offset={0}>
          <XG m={mat.translate(x, y)}>{children}</XG>
        </TimeProvider>
      </g>
      <rect x={x + 3} y={y + RH - 33} width={w - 6} height={30} fill={palette.white} />
      <text x={x + w / 2} y={y + RH - 11} fontFamily={captionFontStack} fontSize={20} fill={palette.ink} textAnchor="middle">
        {label}
      </text>
    </g>
  );
};

const STEPS = [
  {t: 0.8, v: 0.04},
  {t: 1.4, v: 0.08},
  {t: 2.0, v: 0.11},
  {t: 3.2, v: 0.15},
];

/** A thumbnail label that never leaves the sheet: shrinks to the cell width (Patrick Hand ~0.46 em per char) and is
 *  inset from both sheet edges. */
const ThumbLabel: React.FC<{x: number; y: number; w: number; label: string}> = ({x, y, w, label}) => {
  const fs = Math.min(20, (w - 6) / (label.length * 0.46));
  const half = (label.length * 0.46 * fs) / 2;
  const cx = Math.min(1080 - 8 - half, Math.max(8 + half, x));
  return (
    <text x={cx} y={y} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
      {label}
    </text>
  );
};

/** Set thumbnails (from the sets lane's catalog), scaled into the bottom band. */
const SetThumbs: React.FC = () => {
  const y0 = Y0 + ROWS * RH + 6;
  const hAvail = 1920 - y0 - 34;
  const n = Math.max(1, SET_CATALOG.length);
  const cw = Math.min(1080 / n, (hAvail * 1080) / 1920 + 12);
  const sc = Math.min((cw - 10) / 1080, hAvail / 1920);
  const x0 = (1080 - n * cw) / 2;
  return (
    <g>
      {SET_CATALOG.map((e, i) => {
        const cx = x0 + i * cw + (cw - 1080 * sc) / 2;
        const id = `thumb${i}`;
        return (
          <g key={e.id}>
            <defs>
              <clipPath id={id}>
                <rect x={cx} y={y0} width={1080 * sc} height={1920 * sc} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${id})`}>
              <rect x={cx} y={y0} width={1080 * sc} height={1920 * sc} fill={e.sky} />
              <XG m={mat.compose(mat.translate(cx, y0), mat.scale(sc))}>{e.thumb()}</XG>
            </g>
            <rect x={cx} y={y0} width={1080 * sc} height={1920 * sc} fill="none" stroke={palette.ink} strokeWidth={1.6} />
            <ThumbLabel x={cx + (1080 * sc) / 2} y={y0 + 1920 * sc + 24} w={cw} label={e.label} />
          </g>
        );
      })}
    </g>
  );
};

/** QA modes (input props): look 'paper' = the ink-on-white line-art state (frame 0 / loop), 'fills' = fills only;
 *  unbuildAt = run the un-build (exit recipe) on every prop cell from that sheet time (0.5 s). */
export type SharedKitSheetProps = {look?: 'paper' | 'fills'; unbuildAt?: number; /** 'context' = props at FILM SIZE on plain walls (1:1 check). */ mode?: 'sheet' | 'context'; /** false = skip the set thumbnails (props-only cost check). */ thumbs?: boolean};

const Modes: React.FC<SharedKitSheetProps & {children?: React.ReactNode}> = ({look, unbuildAt, children}) => {
  let el = <>{children}</>;
  if (unbuildAt !== undefined) el = <UnBuild at={unbuildAt}>{el}</UnBuild>;
  if (look === 'paper') el = <Look fills="paper">{el}</Look>;
  if (look === 'fills') el = <Look ink={false}>{el}</Look>;
  return el;
};

/** Props at their storyboard sizes on plain walls, to judge line weight / size against the references 1:1. */
const ContextMode: React.FC = () => {
  const t = useTime() % 5;
  return (
    <TimeProvider global={t} offset={0}>
      <rect width={1080} height={1920} fill={skies.day} />
      <SunGlowSteps cx={640} cy={560} r={110} at={3.2} />
      <SunPress at={1.8} cx={640} cy={560} r={110}>
        <Sun cx={640} cy={560} r={110}>{(r) => <PowerGlyph r={r} glintAt={1.2} />}</Sun>
      </SunPress>
      {/* govB-like facade strip at S01 scale: window 210 x 150, door 80 x 120, lock box 16 x 20, plaque 20, Bit 16 */}
      <rect x={-20} y={690} width={620} height={560} fill={palette.cream} />
      <rect x={-20} y={690} width={150} height={560} fill={palette.sand} />
      <Ink d={hline(-40, 620, 690, {seed: 'cx1'}) + hline(-40, 620, 712, {seed: 'cx2'})} width={3.4} />
      <rect x={-20} y={694} width={640} height={16} fill={palette.tan} />
      <Bit x={200} y={690} size={16} seed="ctxbit" />
      <BrowserChrome x={270} y={760} w={210} h={150} chromeAt={0.3} screenOnAt={0.7} offAt={2.5} seed="ctxw" />
      <RollerShutter x={270} y={760} w={210} h={150} slamAt={2.4} seed="ctxs" />
      <ShutterPadlock x={375} y={922} at={3.0} glintAt={3.8} seed="ctxp" />
      <BackSoonTag x={405} y={914} at={3.1} seed="ctxt" />
      <Door x={340} y={1080} w={80} h={120} seed="ctxd" />
      <Lock x={400} y={1135} size={20} depth="far" seed="ctxl" glintAt={4} />
      <ElephantPlaque x={310} y={1120} size={20} depth="far" seed="ctxpl" />
      <rect x={-20} y={1200} width={1120} height={720} fill={palette.mintPale} />
      <Ink d={hline(-40, 1120, 1200, {seed: 'cx3'})} width={4.8} />
      <Citizen x={520} y={1280} h={50} seed="cc1" />
      <Citizen x={560} y={1290} h={46} seed="cc2" walk={{hz: 1.6}} />
      <Citizen x={600} y={1270} h={42} silhouette seed="cc3" />
      {/* Stoop Street door #4 scale: door 120 x 200, lock4 34 x 42, plaque4 50, calendar 70 x 80 */}
      <rect x={640} y={940} width={460} height={400} fill={palette.sand} />
      <Door x={760} y={1030} w={120} h={200} seed="ctxd4" />
      <Lock x={860} y={1130} size={42} seed="ctxl4" cobwebAt={2.5} rider={<Bit x={0} y={-50} size={16 / 0.42} seed="ctxb4" />} />
      <ElephantPlaque x={700} y={1080} size={50} seed="ctxp4" pulseAt={1.4} />
      <Calendar x={915} y={1040} pages={[...yearPages(6)]} tearAt={[1.0, 1.1, 1.2, 1.3, 1.4]} seed="ctxcal" />
      <Snail x={720} y={1338} size={14} crawl={{at: 0, speed: 6}} seed="ctxsn" />
      <Bollard x={760} y={1530} seed="ctxbo" />
      <WrenchTag x={820} y={1000} size={56} at={0.6} seed="ctxwt" />
      {/* S10 keeper (h 300) and S13 caretaker (h 225) at film size */}
      <Keeper x={430} y={1600} h={300} reachAt={1.0} holding={<NewLockIcon size={42} grip="bottom" seed="ctxkh" />} installAt={1.6} seed="ctxkp" />
      <Caretaker x={640} y={1560} h={225} raiseKeysAt={1.2} jingleAt={2.0} seed="ctxct" />
      <EdgeOnlooker x={70} y={1330} head={110} seed="ctxo1" />
      <EdgeOnlooker x={1010} y={1300} head={104} seed="ctxo2" hair="long" />
    </TimeProvider>
  );
};

export const SharedKitSheet: React.FC<SharedKitSheetProps> = ({look, unbuildAt, mode, thumbs = true}) => {
  useCaptionFont();
  if (mode === 'context') {
    return (
      <AbsoluteFill style={{background: skies.day}}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <Modes look={look} unbuildAt={unbuildAt}>
            <ContextMode />
          </Modes>
        </svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: palette.white}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={palette.white} />
        <text x={540} y={58} fontFamily={captionFontStack} fontSize={42} fill={palette.ink} textAnchor="middle">
          Shared world kit: props and sets
        </text>

        <Modes look={look} unbuildAt={unbuildAt}>
        {/* ---- row 0: the PHP lock (P1) */}
        <Cell c={0} r={0} label="Lock closed / fixed">
          <Lock x={64} y={90} size={110} seed="l1" />
          <Lock x={154} y={90} size={110} state="fixed" seed="l2" at={0.4} checkAt={1.0} tagSwingAt={1.4} />
        </Cell>
        <Cell c={1} r={0} label="screws, cover, short bolt">
          <Lock x={108} y={88} size={140} screwsOutAt={0.5} coverOpenAt={0.8} boltTestAt={1.3} gapMarkAt={1.65} bit={{seed: 'b1'}} lensGlintAt={3.2} glintAt={4.2} seed="l3" />
        </Cell>
        <Cell c={2} r={0} label="blueprint / sketch" bg={palette.white}>
          <Lock x={62} y={88} size={110} state="blueprint" at={0.3} seed="l4" />
          <Lock x={160} y={88} size={110} state="sketch" at={0.6} seed="l5" />
        </Cell>
        <Cell c={3} r={0} label="ghost / 20 px / 8 px">
          <Lock x={56} y={88} size={110} state="ghost" seed="l6" popOnAt={0.3} />
          <Lock x={140} y={88} size={20} depth="far" seed="l7" cobwebAt={1} />
          <Lock x={184} y={88} size={8} seed="l8" />
        </Cell>
        <Cell c={4} r={0} label="drop + crate + icon">
          <Lock x={50} y={50} size={56} dropAt={1} dropDist={70} seed="l9" rider={<Bit x={8} y={-50} size={22} seed="b2" />} />
          <LockCrate x={140} y={160} size={84} n={3} at={0.6} seed="c1" />
          <XG m={mat.translate(190, 70)}>
            <NewLockIcon size={36} grip="bottom" at={0.9} seed="nl" />
          </XG>
        </Cell>

        {/* ---- row 1: elephant family (P2) */}
        <Cell c={0} r={1} label="emblem / old + cane">
          <ElephantEmblem x={58} y={80} size={100} at={0.2} />
          <ElephantEmblem x={160} y={80} size={90} style="old" cane lean={12} caneAt={1.2} bg={palette.tan} />
        </Cell>
        <Cell c={1} r={1} label="plates 70 / 22 / blank / dot">
          <ElephantPlaque x={58} y={80} size={70} at={0.3} pulseAt={1.4} />
          <ElephantPlaque x={122} y={80} size={22} tickOnAt={0.8} />
          <ElephantPlaque x={166} y={80} size={34} variant="blank" tickOnAt={1.1} />
          <ElephantPlaque x={200} y={80} size={5} variant="dot" blinkAt={1.6} />
        </Cell>
        <Cell c={2} r={1} label="round sign, swing">
          <ElephantPlaque x={30} y={30} size={104} variant="round" swingAt={0.6} />
        </Cell>
        <Cell c={3} r={1} label="hanging sign flips old">
          <ElephantPlaque x={22} y={24} size={110} variant="hanging" swingAt={0.4} flipOldAt={1.4} cobwebAt={1.8} dustAt={2.1} caneAt={2.4} />
        </Cell>
        <Cell c={4} r={1} label="stamp slam / r40">
          <ElephantStamp x={108} y={58} rx={90} ry={34} slamAt={0.6} />
          <ElephantStamp x={108} y={128} r={30} at={0.2} />
        </Cell>

        {/* ---- row 2: Bit (P3), browser chrome (P4), progress + rings (P6) */}
        <Cell c={0} r={2} label="Bit idle / hop / ! / doodle">
          <Bit x={46} y={88} size={40} seed="b3" />
          <Bit x={116} y={88} size={40} hopAt={1} seed="b4" />
          <Bit x={178} y={88} size={24} alertAt={1.5} alertDur={2} seed="b5" />
          <Bit x={50} y={140} size={16} seed="b6" />
          <Bit x={96} y={140} size={6} seed="b7" />
          <Bit x={160} y={140} size={30} state="doodle" at={0.5} seed="b8" />
        </Cell>
        <Cell c={1} r={2} label="crawl / peek / swarm">
          <Bit crawl={{at: 0.4, path: [[20, 60], [170, 60], [190, 20]], speed: 70}} size={22} seed="b9" />
          <rect x={90} y={86} width={14} height={60} fill={palette.tan} />
          <Bit x={104} y={130} size={30} peekAt={1} hideAt={2.6} seed="b10" />
          <BitSwarm spots={Array.from({length: 12}, (_, i) => ({x: 130 + (i % 6) * 13, y: 120 + Math.floor(i / 6) * 18, size: 9, at: 0.5 + i * 0.08}))} />
        </Cell>
        <Cell c={2} r={2} span={2} label="BrowserChrome: chrome, screen on, off, blink, LOD" bg={palette.sand}>
          <BrowserChrome x={16} y={18} w={210} h={130} chromeAt={0.5} screenOnAt={1} offAt={3.2} seed="bw1" />
          <BrowserChrome x={246} y={22} w={150} h={100} blinkAt={[1.2, 1.6]} seed="bw2" />
          <BrowserChrome x={246} y={128} w={40} h={28} seed="bw3" />
          <BrowserChrome x={300} y={132} w={14} h={10} seed="bw4" />
        </Cell>
        <Cell c={4} r={2} label="rail / progress / rings">
          <BrowserChrome x={10} y={14} w={196} h={28} mode="addressRail" railLightAt={0.8} seed="bw5" />
          <BrowserChrome x={10} y={54} w={196} h={86} progress={{at: 0.5, steps: STEPS}} ring={{at: 0.3}} seed="bw6" />
          <TargetRing x={186} y={150} r={11} at={0.2} pulseAt={1.5} seed="tr" />
          <LoadingRing x={156} y={150} r={7} spin seed="lr" />
        </Cell>

        {/* ---- row 3: shutters (P5) + sun morphs (P7) */}
        <Cell c={0} r={3} span={2} label="shutter slam, padlock, back-soon tag, peephole">
          <BrowserChrome x={30} y={40} w={150} h={96} seed="sw1" />
          <RollerShutter x={30} y={40} w={150} h={96} slamAt={0.8} seed="sh1" />
          <ShutterPadlock x={96} y={140} at={1.2} glintAt={2.2} seed="pl1" />
          <BackSoonTag x={190} y={110} at={1.3} tapAt={3} seed="tg1" />
          <BrowserChrome x={240} y={40} w={150} h={96} progress={{steps: [{t: 0.5, v: 0.11}, {t: 2, v: 0.2}]}} seed="sw2" />
          <RollerShutter x={240} y={40} w={150} h={96} state="down" peephole={{x: 300, y: 50, r: 13}} seed="sh2" />
        </Cell>
        <Cell c={2} r={3} label="power glyph + press" bg={skies.day}>
          <SunPress at={1.2} cx={108} cy={84} r={62}>
            <Sun cx={108} cy={84} r={62}>{(r) => <PowerGlyph r={r} glintAt={0.6} />}</Sun>
          </SunPress>
        </Cell>
        <Cell c={3} r={3} label="pie 7/10 -> solid, 1/3" bg={skies.day}>
          <rect x={108} y={0} width={108} height={170} fill={skies.golden} />
          <Sun cx={56} cy={84} r={46}>{(r) => <SunPie r={r} n={10} cream={3} spokesAt={0.4} slicesAt={1.2} pulseAt={2} solidAt={3.6} />}</Sun>
          <Sun cx={162} cy={84} r={46}>{(r) => <SunPie r={r} n={3} cream={1} spokesAt={0.5} slicesAt={1.3} />}</Sun>
        </Cell>
        <Cell c={4} r={3} label="hours clock" bg={skies.golden}>
          <Sun cx={108} cy={84} r={62}>{(r) => <HoursClock r={r} at={0.4} spinAt={0.8} outAt={3.4} />}</Sun>
        </Cell>

        {/* ---- row 4 */}
        <Cell c={0} r={4} label="45 min: golden / dusk" bg={skies.golden}>
          <rect x={108} y={0} width={108} height={170} fill={skies.dusk} />
          <Sun cx={56} cy={84} r={46}>{(r) => <MinuteWedge r={r} at={0.6} />}</Sun>
          <Sun cx={162} cy={84} r={46}>{(r) => <MinuteWedge r={r} at={0.7} />}</Sun>
        </Cell>
        <Cell c={1} r={4} label="wax seal + envelope" bg={skies.golden}>
          <Sun cx={56} cy={56} r={40} />
          <Envelope x={150} y={130} size={60} seed="env0" />
          <WaxSeal from={[76, 80]} to={[150, 131]} at={0.6} arc={40} />
        </Cell>
        <Cell c={2} r={4} label="glow steps, heat ticks" bg={skies.golden}>
          <SunGlowSteps cx={108} cy={104} r={44} at={0.8} rings={[{k: 1.25, color: palette.peach}, {k: 1.5, color: palette.sand}]} />
          <Sun cx={108} cy={104} r={44}>{(r) => <HeatTicks r={r} at={1.6} />}</Sun>
        </Cell>
        <Cell c={3} r={4} label="check, ring, web, riser glyphs">
          <CheckMark x={40} y={50} size={46} at={0.4} />
          <MarkRing x={108} y={52} r={30} at={0.7} pingAt={1.4} />
          <Cobweb x={150} y={14} r={50} corner="tl" at={1} />
          <Magnifier x={40} y={122} r={20} at={1.2} />
          <WrenchGlyph x={124} y={128} w={60} at={1.4} />
        </Cell>
        <Cell c={4} r={4} label="wrench tags, flag, ?">
          <WrenchTag x={44} y={50} size={56} at={0.5} />
          <WrenchTag x={92} y={50} size={30} at={0.7} />
          <WrenchTag x={120} y={50} size={14} at={0.8} />
          <CheckFlag x={156} y={160} size={46} raiseAt={0.9} />
          <QuestionMark x={56} y={124} size={56} at={1.3} />
        </Cell>

        {/* ---- row 5: board + leak (P8), envelope + slot (P9), snail (P10) */}
        <Cell c={0} r={5} span={2} label="RailBoard: rise, rail lights, leak, clones, pane dark" bg={palette.sand}>
          <XG m={mat.compose(mat.translate(52, 34), mat.scale(0.5))}>
            <RailBoard x={0} y={40} w={600} h={280} legs={60} riseAt={0.2} railLightAt={0.9} paneDarkAt={3.4} darkPane={1}
              pane1={(r) => <LeakSheet x={r.x + r.w / 2} y={r.y + r.h / 2} w={150} h={200} at={1.2} ringAt={2} seed="lk1" />}
              pane2={(r) => <LeakClones spots={[0, 1, 2, 3].map((i) => ({x: r.x + 70 + (i % 2) * 130, y: r.y + 66 + Math.floor(i / 2) * 120, at: 2.2 + i * 0.12}))} w={100} h={110} />} />
          </XG>
        </Cell>
        <Cell c={2} r={5} label="leak sheet flutter" bg={palette.cream}>
          <LeakSheet x={108} y={86} w={110} h={140} flutter={{at: 0.4, from: [-60, 40], dur: 0.8}} rot={-4} seed="lk2" />
        </Cell>
        <Cell c={3} r={5} label="envelope into mail slot" bg={palette.teal}>
          <MailSlot x={108} y={120} clickAt={1.4} />
          <Envelope x={70} y={60} size={56} at={0.2} slot={{at: 1.0, x: 108, y: 120, w: 50}} seed="env1" />
        </Cell>
        <Cell c={4} r={5} label="snail 40 / 24 / 12 px">
          <Snail x={50} y={80} size={40} popAt={0.3} crawl={{at: 0.5, speed: 12}} />
          <Snail x={40} y={130} size={24} crawl={{at: 0, speed: 6}} hideAt={3} />
          <Snail x={150} y={130} size={12} flip crawl={{at: 0, speed: 6}} />
        </Cell>

        {/* ---- row 6: back-view figures (P11) */}
        <Cell c={0} r={6} label="onlooker + citizens">
          <Citizen x={150} y={150} h={52} riseAt={0.4} seed="ci1" />
          <Citizen x={180} y={150} h={46} seed="ci2" walk={{hz: 1.6}} />
          <Citizen x={198} y={150} h={42} silhouette riseAt={0.8} seed="ci3" />
          <EdgeOnlooker x={58} y={96} head={58} riseAt={0.3} raisePhoneAt={1.6} seed="on1" />
        </Cell>
        <Cell c={1} r={6} label="investigator, messenger">
          <Investigator x={62} y={160} h={130} riseAt={0.2} raiseAt={0.9} seed="inv1" />
          <Messenger x={150} y={160} h={130} pullAt={1.5} seed="msg1" />
        </Cell>
        <Cell c={2} r={6} label="makers (bench / cart)">
          <rect x={10} y={110} width={110} height={10} fill={palette.brown} />
          <Maker x={40} y={110} h={56} bust work={1.8} seed="mk1" />
          <Maker x={90} y={110} h={52} bust work={2.2} seed="mk2" />
          <Maker x={160} y={160} h={140} walk={{hz: 1.8}} seed="mk3" />
        </Cell>
        <Cell c={3} r={6} label="keeper, caretaker">
          <Keeper x={60} y={160} h={140} reachAt={0.8} installAt={1.6} holding={<NewLockIcon size={28} grip="bottom" seed="kh" />} seed="kp1" />
          <Caretaker x={150} y={160} h={140} raiseKeysAt={0.9} jingleAt={1.8} glintAt={2.4} seed="ct1" />
        </Cell>
        <Cell c={4} r={6} label="attempters, stipple, ghost" bg={palette.mintPale}>
          <Attempter x={34} y={100} h={60} mode="tap" tapAt={[0.8, 1.4, 2.0]} seed="a1" />
          <Attempter x={80} y={100} h={70} mode="rattle" rattleAt={1} seed="a2" />
          <Attempter x={106} y={100} h={24} mode="tap" tapAt={[1.1]} seed="a3" />
          <AttemptStipple spots={Array.from({length: 40}, (_, i) => ({x: 14 + (i % 20) * 9, y: 140 + Math.floor(i / 20) * 12 + (i % 3), h: 6 + (i % 3), at: 0.5 + i * 0.03}))} />
          <Ghost x={170} y={160} h={110} at={0.4} seed="gh1" walk={{hz: 1.4}} />
        </Cell>

        {/* ---- row 7: calendar (P14), tablet + beam (P12), cart (P13), bollard (P17), tram (P16) */}
        <Cell c={0} r={7} label="calendar tears">
          <Calendar x={30} y={40} pages={[{kind: 'season', i: 0}, {kind: 'season', i: 1}, {kind: 'season', i: 2}, {kind: 'season', i: 3}]} tearAt={[1, 1.6, 2.2]} seed="cal1" />
          <Calendar x={120} y={40} pages={[...yearPages(14), {kind: 'summer'}]} tearAt={Array.from({length: 14}, (_, i) => 1 + i * 0.105)} seed="cal2" />
        </Cell>
        <Cell c={1} r={7} label="sparkle tablet + scan beam" bg={palette.white}>
          <ScanBeam from={[60, 96]} to={[176, 50]} at={1.0} sweep={{amp: 8}} convergeAt={2.4} />
          <SparkleTablet x={60} y={120} size={40} raiseAt={0.4} seed="tb1" />
        </Cell>
        <Cell c={2} r={7} span={2} label="makers' cart: roll, crate drop, skip, pusher">
          <MakersCart x={150} y={156} size={84} crates={2} roll={{at: 0.4, to: [360, 156], dur: 2.4}} dropCrateAt={[1.2, 2.4]} skipAt={1.8} pusher seed="cart1" />
        </Cell>
        <Cell c={4} r={7} label="bollard, tram" bg={skies.day}>
          <Bollard x={40} y={150} />
          <XG m={mat.compose(mat.translate(126, 40), mat.scale(0.11))}>
            <Tram x={0} y={0} />
          </XG>
        </Cell>

        </Modes>
        {/* the QA modes (paper / fills / un-build) reach the set thumbnails too */}
        {thumbs ? (
          <Modes look={look} unbuildAt={unbuildAt}>
            <SetThumbs />
          </Modes>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
