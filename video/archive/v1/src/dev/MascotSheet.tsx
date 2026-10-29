import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {card, palette, sun, type as typeTok} from '../lib/theme';
import {
  COLORWAYS,
  ColorwayKey,
  MASCOT_COLORWAY,
  Elephant,
  ElephantTimeline,
  POSES,
  PoseName,
  drawIn,
  drawOut,
  hop,
  unbuild,
  popIn,
  walkSpeed,
} from '../lib/mascot';
import {brush, spline, Pt} from '../lib/mascot/ink';

// Dev sheet for the mascot (character stream). Modes via --props='{"mode":"..."}':
//   sheet (default) | colorways | scene | motion | walk | build (frame strips; add "alpha":true for a transparent canvas)
type Mode = 'sheet' | 'colorways' | 'scene' | 'motion' | 'walk' | 'build';

const useCaptionFont = () => {
  const [handle] = useState(() => delayRender('caption font'));
  useEffect(() => {
    const f = new FontFace(typeTok.family, `url(${staticFile('fonts/CaptionHand.woff2')})`);
    f.load()
      .then((ff) => {
        (document.fonts as unknown as {add: (x: FontFace) => void}).add(ff);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

const Label: React.FC<{x: number; y: number; size?: number; children: React.ReactNode; anchor?: 'middle' | 'start'}> = ({x, y, size = 34, children, anchor = 'middle'}) => (
  <text x={x} y={y} fontFamily={`${typeTok.family}, sans-serif`} fontSize={size} fill={palette.ink} textAnchor={anchor}>
    {children}
  </text>
);

/** quick hand-drawn line for the test scenes */
const Ink: React.FC<{pts: Pt[]; w?: number; seed?: number; color?: string}> = ({pts, w = 3, seed = 1, color = palette.ink}) => (
  <path d={brush(spline(pts, false, 4), {w, seed, over: 6 + (seed % 5) * 3, tipIn: 0.5, tipOut: 0.3, wobble: 0.6})} fill={color} />
);

const Flashlight: React.FC = () => (
  <g>
    <path d="M-4 -2 L-4 -26 L4 -26 L4 -2 Z" fill={palette.grey} transform="translate(1.6 1)" />
    <path d="M-7 -26 L-8 -36 L8 -36 L7 -26 Z" fill={palette.tan} transform="translate(1.6 1)" />
    <path d="M-4 -2 L-4 -26 M4 -26 L4 -2 M-7 -26 L-8 -36 L8 -36 L7 -26 Z M-4 -26 L4 -26" stroke={palette.ink} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    <path d="M-10 -40 L-17 -50 M0 -41 L0 -53 M10 -40 L17 -50" stroke={palette.ink} strokeWidth={1.4} strokeLinecap="round" />
  </g>
);

const Wrench: React.FC = () => (
  <g>
    <path d="M-3 4 L-3 -26 L3 -26 L3 4 Z" fill={palette.grey} transform="translate(1.6 1)" />
    <path d="M-3 4 L-3 -26 M3 -26 L3 4 M-3 -26 C-12 -28 -12 -40 -6 -44 L-4 -36 L4 -36 L6 -44 C12 -40 12 -28 3 -26" stroke={palette.ink} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

// ---------------- sheet ----------------
const LABELS: Record<PoseName, string> = {
  'sit-back': 'sit-back',
  'sit-front': 'sit-front',
  'stand-side': 'stand-side',
  'walk-side': 'walk-side',
  peek: 'peek',
  'trunk-up': 'trunk-up',
  hold: 'hold',
  'ears-cover': 'ears-cover',
  shrug: 'shrug',
  sleep: 'sleep',
};

const Sheet: React.FC<{t: number}> = ({t}) => {
  const cellW = 500;
  const cellH = 292;
  const S = 2;
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill={palette.bg} />
      <rect x={20} y={20} width={1040} height={1880} fill={palette.card} />
      <Label x={540} y={78} size={46}>
        elephant mascot: pose sheet
      </Label>
      {POSES.map((p, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = 40 + col * (cellW + 20) + cellW / 2;
        const top = 104 + row * (cellH + 6);
        const baseY = top + cellH - 56;
        const isPeek = p === 'peek';
        const isBack = p === 'sit-back';
        return (
          <g key={p}>
            <rect x={cx - cellW / 2} y={top} width={cellW} height={cellH} fill={i % 2 === 0 ? palette.cream : palette.mintPale} />
            {isBack ? (
              <g>
                <rect x={cx - 150} y={baseY} width={260} height={30} fill={palette.teal} />
                <Ink pts={[[cx - 160, baseY], [cx + 120, baseY]]} seed={3} />
              </g>
            ) : isPeek ? (
              <g>
                <rect x={cx - 230} y={top + 20} width={190} height={cellH - 40} fill={palette.teal} />
                <Ink pts={[[cx - 40, top + 14], [cx - 40, top + cellH - 30]]} seed={4} />
              </g>
            ) : (
              <Ink pts={[[cx - 200, baseY], [cx + 200, baseY]]} seed={i + 7} w={2.4} />
            )}
            <Elephant
              x={isPeek ? cx - 40 : cx + (p.includes('side') || p === 'sleep' ? -14 : 0)}
              y={isPeek ? baseY - 40 : baseY}
              scale={S}
              pose={p}
              t={t + i * 0.37}
              seed={3}
              prop={p === 'hold' ? <Flashlight /> : undefined}
              look={isBack ? 0 : undefined}
            />
            <Label x={cx + cellW / 2 - 16} y={top + 40} size={30} anchor="start">
              <tspan textAnchor="end">{LABELS[p]}</tspan>
            </Label>
          </g>
        );
      })}
      {/* true-size row (scale 0.95 = wide-shot size) with variants */}
      <rect x={40} y={1600} width={1000} height={280} fill={palette.bg} />
      <Label x={60} y={1640} size={28} anchor="start">
        true size (scale 0.95): look, trunk dangle, happy, wrench, ink-only, fills-only
      </Label>
      <rect x={40} y={1810} width={1000} height={70} fill={palette.mintPale} />
      <rect x={300} y={1760} width={120} height={120} fill={palette.teal} />
      <Ink pts={[[290, 1760], [430, 1760]]} seed={31} />
      <Ink pts={[[40, 1810], [290, 1810]]} seed={32} w={2.4} />
      <Ink pts={[[430, 1810], [1040, 1810]]} seed={33} w={2.4} />
      {(
        [
          {pose: 'sit-back', look: 0.9, x: 100},
          {pose: 'stand-side', look: 0, x: 220},
          {pose: 'sit-front', amount: 1, x: 360, y: 1760},
          {pose: 'trunk-up', expression: 'happy', x: 490},
          {pose: 'hold', x: 610, prop: true},
          {pose: 'shrug', x: 730},
          {pose: 'sit-front', x: 850, fill: 0},
          {pose: 'sit-back', x: 970, ink: 0},
        ] as {pose: PoseName; look?: number; amount?: number; expression?: 'happy'; x: number; y?: number; prop?: boolean; fill?: number; ink?: number}[]
      ).map((v, i) => (
        <Elephant
          key={i}
          x={v.x}
          y={v.y ?? 1812}
          scale={0.95}
          pose={v.pose}
          look={v.look}
          amount={v.amount}
          expression={v.expression}
          t={t + i * 0.5}
          seed={5}
          prop={v.prop ? <Wrench /> : undefined}
          fill={v.fill}
          ink={v.ink}
        />
      ))}
    </svg>
  );
};

// ---------------- colorways ----------------
const BGS: {name: string; color: string; dark?: boolean}[] = [
  {name: 'mint sky', color: palette.bg},
  {name: 'cream wall', color: palette.cream},
  {name: 'teal door', color: palette.teal},
  {name: 'peach highlight', color: palette.highlight},
];

const Colorways: React.FC<{t: number}> = ({t}) => {
  const keys: ColorwayKey[] = ['periwinkle', 'peach', 'orange'];
  const colW = 340;
  const rowH = 420;
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill={palette.card} />
      <Label x={540} y={70} size={44}>
        colorway exploration
      </Label>
      {keys.map((k, ci) => (
        <Label key={k} x={30 + ci * (colW + 10) + colW / 2} y={130} size={36}>
          {`(${'abc'[ci]}) ${COLORWAYS[k].name}${k === MASCOT_COLORWAY ? ' (chosen)' : ''}`}
        </Label>
      ))}
      {BGS.map((bg, ri) => (
        <g key={bg.name}>
          {keys.map((k, ci) => {
            const x0 = 30 + ci * (colW + 10);
            const y0 = 160 + ri * (rowH + 12);
            return (
              <g key={k}>
                <rect x={x0} y={y0} width={colW} height={rowH} fill={bg.color} />
                {/* the sun, for distinctness */}
                <clipPath id={`cw-${ri}-${ci}`}>
                  <rect x={x0} y={y0} width={colW} height={rowH} />
                </clipPath>
                <circle cx={x0 + colW - 70} cy={y0 + 40} r={sun.r * 0.8} fill={palette.sun} clipPath={`url(#cw-${ri}-${ci})`} />
                <rect x={x0 + 30} y={y0 + 300} width={150} height={22} fill={palette.tealDark} />
                <Ink pts={[[x0 + 20, y0 + 300], [x0 + 190, y0 + 300]]} seed={ri * 3 + ci} />
                <Elephant x={x0 + 105} y={y0 + 300} scale={1.25} pose="sit-back" t={t} seed={2} colorway={k} />
                <Ink pts={[[x0 + 10, y0 + 380], [x0 + colW - 10, y0 + 380]]} seed={ri * 5 + ci + 1} w={2.4} />
                <Elephant x={x0 + 260} y={y0 + 380} scale={1.25} pose="sit-front" t={t} seed={2} colorway={k} />
                {/* true size */}
                <Elephant x={x0 + 250} y={y0 + 196} scale={0.8} pose="stand-side" t={t} seed={4} colorway={k} />
                <text x={x0 + 12} y={y0 + rowH - 12} fontFamily={`${typeTok.family}, sans-serif`} fontSize={22} fill={bg.color === palette.teal ? palette.card : palette.ink}>
                  {bg.name}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

// ---------------- scene (true size, reference-like) ----------------
const Scene: React.FC<{t: number; pose?: PoseName}> = ({t, pose = 'sit-back'}) => {
  const P = {x: 96, y: 95, w: 768, h: 870};
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill={palette.bg} />
      <g transform={`translate(${card.x} ${card.y})`}>
        <rect width={card.w} height={card.h} fill={palette.card} />
        <rect x={P.x} y={P.y} width={P.w} height={90} fill={palette.bg} />
        <rect x={P.x} y={P.y + 90} width={P.w} height={P.h - 90} fill={palette.cream} />
        <rect x={P.x} y={P.y + 90} width={P.w} height={18} fill={palette.peach} />
        <circle cx={sun.cx} cy={sun.cy} r={sun.r} fill={palette.sun} />
        <rect x={P.x} y={P.y + 760} width={P.w} height={110} fill={palette.mintPale} />
        <Ink pts={[[P.x - 60, P.y + 90], [P.x + P.w + 60, P.y + 88]]} seed={1} />
        <Ink pts={[[P.x - 40, P.y + 110], [P.x + P.w + 40, P.y + 109]]} seed={2} w={2.2} />
        <Ink pts={[[P.x - 60, P.y + 760], [P.x + P.w + 60, P.y + 761]]} seed={3} />
        {/* bulletin board */}
        <rect x={P.x + 80} y={P.y + 300} width={340} height={230} fill={palette.teal} transform="translate(3 2)" />
        <rect x={P.x + 96} y={P.y + 314} width={150} height={202} fill={palette.mintPale} />
        <rect x={P.x + 256} y={P.y + 314} width={150} height={202} fill={palette.mintPale} />
        <Ink pts={[[P.x + 70, P.y + 300], [P.x + 430, P.y + 299]]} seed={5} />
        <Ink pts={[[P.x + 80, P.y + 296], [P.x + 80, P.y + 532]]} seed={6} />
        <Ink pts={[[P.x + 420, P.y + 296], [P.x + 421, P.y + 532]]} seed={7} />
        <Ink pts={[[P.x + 74, P.y + 530], [P.x + 428, P.y + 531]]} seed={8} />
        <Ink pts={[[P.x + 110, P.y + 530], [P.x + 110, P.y + 760]]} seed={9} />
        <Ink pts={[[P.x + 390, P.y + 530], [P.x + 390, P.y + 760]]} seed={10} />
        <rect x={P.x + 140} y={P.y + 330} width={110} height={150} fill={palette.card} />
        <Ink pts={[[P.x + 140, P.y + 330], [P.x + 250, P.y + 330]]} seed={11} w={2} />
        <Ink pts={[[P.x + 250, P.y + 328], [P.x + 250, P.y + 480]]} seed={15} w={2} />
        <Ink pts={[[P.x + 252, P.y + 480], [P.x + 140, P.y + 480]]} seed={16} w={2} />
        <Ink pts={[[P.x + 140, P.y + 482], [P.x + 140, P.y + 330]]} seed={17} w={2} />
        <Ink pts={[[P.x + 160, P.y + 370], [P.x + 220, P.y + 370]]} seed={18} w={2.4} />
        <Ink pts={[[P.x + 160, P.y + 400], [P.x + 230, P.y + 400]]} seed={19} w={1.6} />
        {/* door */}
        <rect x={P.x + 560} y={P.y + 250} width={208} height={510} fill={palette.teal} />
        <Ink pts={[[P.x + 550, P.y + 250], [P.x + 790, P.y + 249]]} seed={12} />
        <Ink pts={[[P.x + 560, P.y + 245], [P.x + 560, P.y + 762]]} seed={13} />
        <Ink pts={[[P.x + 664, P.y + 255], [P.x + 664, P.y + 760]]} seed={14} w={2.2} />
        {/* mascot at true size: on the board (main), plus flip/clip and side checks */}
        <Elephant x={P.x + 340} y={P.y + 300} pose={pose} t={t} seed={7} look={pose === 'sit-back' ? 0.35 : 0} />
        <Elephant x={P.x + 560} y={P.y + 600} pose="peek" t={t} seed={8} flip scale={0.9} />
        <Elephant x={P.x + 230} y={P.y + 790} pose="walk-side" t={t} seed={9} scale={0.85} />
        <text x={480} y={1180} textAnchor="middle" fontFamily={`${typeTok.family}, sans-serif`} fontSize={typeTok.size} fill={palette.ink}>
          They were fixing a
        </text>
        <text x={480} y={1180 + typeTok.size * typeTok.lineHeight} textAnchor="middle" fontFamily={`${typeTok.family}, sans-serif`} fontSize={typeTok.size} fill={palette.ink}>
          security bug in PHP,
        </text>
      </g>
    </svg>
  );
};

// ---------------- motion demo ----------------
const Motion: React.FC<{t: number}> = ({t}) => {
  // 1) draw-on entrance, 2) hop onto a ledge, 3) timeline of poses with pops, 4) walk across
  const ledge = {x: 700, y: 520};
  const h = hop({t, t0: 2.0, dur: 0.46, from: {x: 380, y: 760}, to: ledge, height: 70});
  const p = popIn(t, 0.2, 0.5);
  const speed = walkSpeed(1.25) * 1.3;
  const wx = 120 + ((t * speed) % 1100) - 80;
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill={palette.bg} />
      <rect x={40} y={40} width={1000} height={1840} fill={palette.card} />
      <rect x={80} y={160} width={920} height={600} fill={palette.cream} />
      <rect x={560} y={ledge.y} width={260} height={240} fill={palette.teal} />
      <Ink pts={[[540, ledge.y], [840, ledge.y]]} seed={2} />
      <Ink pts={[[60, 760], [1020, 760]]} seed={3} />
      <Label x={540} y={110} size={40}>
        draw-on, pop-in, hop, pose pops, walk
      </Label>
      <Elephant x={200} y={760} scale={1.3} pose="sit-front" t={t} seed={3} draw={drawIn(t, 0.1, 1.2)} />
      {p.visible ? <Elephant x={950} y={460} scale={1.0 * p.scale} pose="sit-front" t={t} seed={4} squash={p.squash} /> : null}
      <Elephant x={h.x} y={h.y} scale={1.3} pose={h.k < 1 ? 'stand-side' : 'sit-back'} amount={h.spread} t={t} seed={6} squash={h.squash} rotate={h.rotate} look={h.k < 1 ? 0 : 0.5} />
      <rect x={80} y={860} width={920} height={500} fill={palette.mintPale} />
      <Ink pts={[[60, 1300], [1020, 1300]]} seed={5} />
      <ElephantTimeline
        x={540}
        y={1300}
        scale={2}
        t={t}
        seed={8}
        keys={[
          {t: 0, pose: 'sit-front'},
          {t: 1.5, pose: 'trunk-up', expression: 'happy'},
          {t: 3.0, pose: 'shrug'},
          {t: 4.5, pose: 'ears-cover'},
          {t: 6.0, pose: 'hold'},
        ]}
        prop={<Flashlight />}
      />
      <rect x={40} y={1460} width={1000} height={300} fill={palette.cream} />
      <Ink pts={[[40, 1700], [1040, 1700]]} seed={9} />
      <Elephant x={wx} y={1700} scale={1.3} pose="walk-side" t={t} seed={10} />
    </svg>
  );
};

const Walk: React.FC<{t: number}> = ({t}) => {
  // 8 phases of the walk cycle as a film strip + a big looping one
  const rate = 1.25;
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill={palette.card} />
      <Label x={540} y={80} size={40}>
        walk cycle (8 phases) + idle
      </Label>
      {Array.from({length: 8}).map((_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 140 + col * 260;
        const y = 380 + row * 320;
        return (
          <g key={i}>
            <Ink pts={[[x - 110, y], [x + 120, y]]} seed={i} w={2} />
            <Elephant x={x} y={y} scale={2} pose="walk-side" t={i / 8 / rate} walkRate={rate} idle={0} seed={3} />
          </g>
        );
      })}
      <rect x={40} y={1100} width={1000} height={760} fill={palette.mintPale} />
      <Ink pts={[[60, 1700], [1020, 1700]]} seed={21} />
      <Elephant x={330} y={1700} scale={3.2} pose="walk-side" t={t} walkRate={rate} seed={3} />
      <Elephant x={820} y={1700} scale={2.6} pose="sit-front" t={t} seed={3} />
    </svg>
  );
};

// ---------------- build / un-build frame strips (no-fade evidence) ----------------
const Build: React.FC<{alpha: boolean; control?: boolean}> = ({alpha, control}) => {
  if (control) {
    // NEGATIVE CONTROL for the alpha check: what an opacity fade would look like (never used in the film)
    return (
      <svg width={1080} height={1920}>
        <g opacity={0.5}>
          <Elephant x={540} y={900} scale={3} pose="sit-front" t={1.3} idle={0} />
        </g>
      </svg>
    );
  }
  const fps = 30;
  const cols = 7;
  const colW = 1080 / cols;
  const rowH = 158;
  const rows: {title: string; items: {label: string; el: (x: number, y: number) => React.ReactNode}[]}[] = [];
  const frames = (n: number, step: number) => Array.from({length: n}, (_, i) => Math.round(i * step) + 1);
  rows.push({
    title: 'draw-in: draw={drawIn(t, 0)} (0.9 s), every 2nd frame',
    items: frames(14, 2).map((f) => ({label: `f${f}`, el: (x, y) => <Elephant x={x} y={y} pose="sit-front" t={1.3} idle={0} seed={3} draw={drawIn(f / fps, 0)} />})),
  });
  rows.push({
    title: 'un-build: exit={unbuild(t, 0)} (0.5 s), every frame',
    items: frames(14, 1).map((f) => ({label: `f${f}`, el: (x, y) => <Elephant x={x} y={y} pose="sit-back" t={1.3} idle={0} seed={3} exit={unbuild(f / fps, 0)} />})),
  });
  rows.push({
    title: 'legacy draw={drawOut(t, 0)} (0.7 s, reverse build), every 1.5 frames',
    items: frames(14, 1.5).map((f) => ({label: `f${f}`, el: (x, y) => <Elephant x={x} y={y} pose="stand-side" t={1.3} idle={0} seed={3} draw={drawOut(f / fps, 0)} />})),
  });
  rows.push({
    title: 'states: fill=0, ink=0, fill=.5, ink=.5, opacity=.3 (deprecated: hidden), timeline mode="fade" mid-switch x2',
    items: [
      {label: 'fill 0', el: (x, y) => <Elephant x={x} y={y} pose="sit-front" t={1.3} idle={0} fill={0} />},
      {label: 'ink 0', el: (x, y) => <Elephant x={x} y={y} pose="sit-front" t={1.3} idle={0} ink={0} />},
      {label: 'fill .5', el: (x, y) => <Elephant x={x} y={y} pose="sit-front" t={1.3} idle={0} fill={0.5} />},
      {label: 'ink .5', el: (x, y) => <Elephant x={x} y={y} pose="sit-front" t={1.3} idle={0} ink={0.5} />},
      {label: 'opac .3', el: (x, y) => <Elephant x={x} y={y} pose="sit-front" t={1.3} idle={0} opacity={0.3} />},
      ...[0.98, 1.06].map((tt) => ({
        label: `fade@${tt}`,
        el: (x: number, y: number) => (
          <ElephantTimeline x={x} y={y} t={tt} idle={0} mode="fade" keys={[{t: 0, pose: 'sit-front'}, {t: 1.0, pose: 'trunk-up'}]} />
        ),
      })),
    ],
  });
  rows.push({
    title: 'sleep z\'s (scale pop, no opacity) + hold prop build',
    items: [
      ...[0.1, 0.5, 0.9, 1.4, 2.2].map((tt) => ({label: `t${tt}`, el: (x: number, y: number) => <Elephant x={x} y={y} pose="sleep" t={tt} seed={3} />})),
      ...[0.62, 0.8].map((d) => ({label: `d${d}`, el: (x: number, y: number) => <Elephant x={x} y={y} pose="hold" t={1} idle={0} draw={d} prop={<Wrench />} />})),
    ],
  });
  let y = 30;
  const out: React.ReactNode[] = [];
  rows.forEach((r, ri) => {
    if (!alpha) out.push(<Label key={`t${ri}`} x={20} y={y + 26} size={26} anchor="start">{r.title}</Label>);
    y += 40;
    r.items.forEach((it, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = colW * col + colW / 2 - 4;
      const by = y + row * rowH + 118;
      if (!alpha) {
        out.push(<rect key={`g${ri}-${i}`} x={colW * col + 4} y={y + row * rowH} width={colW - 8} height={rowH - 8} fill={ri % 2 ? palette.mintPale : palette.cream} />);
        out.push(<Label key={`l${ri}-${i}`} x={colW * col + 12} y={y + row * rowH + 24} size={20} anchor="start">{it.label}</Label>);
      }
      out.push(<g key={`e${ri}-${i}`}>{it.el(cx, by)}</g>);
    });
    y += Math.ceil(r.items.length / cols) * rowH + 8;
  });
  return (
    <svg width={1080} height={1920}>
      {alpha ? null : <rect width={1080} height={1920} fill={palette.card} />}
      {out}
    </svg>
  );
};

export const MascotSheet: React.FC<{mode?: Mode; pose?: PoseName; alpha?: boolean; control?: boolean}> = ({mode = 'sheet', pose, alpha = false, control}) => {
  useCaptionFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{background: mode === 'build' && alpha ? 'transparent' : palette.bg}}>
      {mode === 'colorways' ? (
        <Colorways t={t} />
      ) : mode === 'scene' ? (
        <Scene t={t} pose={pose} />
      ) : mode === 'motion' ? (
        <Motion t={t} />
      ) : mode === 'walk' ? (
        <Walk t={t} />
      ) : mode === 'build' ? (
        <Build alpha={alpha} control={control} />
      ) : (
        <Sheet t={t} />
      )}
    </AbsoluteFill>
  );
};
