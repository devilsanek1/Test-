// FontTest (style-bible stream): verifies the caption font + caption/highlight spec on the PROPOSED
// 9:16 geometry (docs/theme_proposal.json, docs/style_bible.md section 8). Values below mirror that
// proposal so this preview is correct before theme.ts adopts it. Self-contained on purpose.
//
//   npx remotion still src/index.ts FontTest docs/style_evidence/fonttest.png            (two-line caption)
//   npx remotion still src/index.ts FontTest docs/style_evidence/fonttest_punch.png --frame=45  (punch line)

import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// ---- proposal values (canvas px at 1080 x 1920; card-local where noted) ----
const C = {
  bg: '#A6CABB',
  card: '#FFFFFF',
  sky: '#A6CABB',
  mintPale: '#EBF6E5',
  ink: '#2B1B0A',
  sun: '#EC6B2E',
  highlight: '#F6B892',
};
const CARD = {x: 60, y: 120, w: 960, h: 1400};
const PANEL = {x: 96, y: 96, w: 768, h: 944}; // card-local
const SUN = {cx: 480, cy: 132, r: 72}; // card-local
const CAP = {
  family: 'CaptionHand',
  size: 82, // px; Patrick Hand 400
  lineGap: 96, // baseline-to-baseline (line-height 1.17)
  line1: 1208, // card-local baseline, two-line layout
  line2: 1304,
  punchSize: 95, // single-line "punch" caption (x1.16)
  punchBaseline: 1265,
  maxWidth: 780,
};
// highlight box, in em of the caption size, relative to the word's advance box and the baseline
const HL = {padL: 0.02, padR: 0.11, top: 0.671, bottom: 0.305, radius: 0.035};
const SAFE = {x0: 90, x1: 930, y0: 160, y1: 1480};

// ---- font loading ----
let fontPromise: Promise<void> | null = null;
const loadCaptionFont = () => {
  if (!fontPromise) {
    const face = new FontFace(CAP.family, `url(${staticFile('fonts/CaptionHand.woff2')}) format('woff2')`, {weight: '400', style: 'normal'});
    fontPromise = face.load().then((f) => {
      // FontFaceSet.add is missing from the project's TS lib (es2015 + dom); it exists in Chromium.
      (document.fonts as unknown as {add: (font: FontFace) => void}).add(f);
    });
  }
  return fontPromise;
};

const useCaptionFont = () => {
  const [handle] = useState(() => delayRender('Loading CaptionHand'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadCaptionFont()
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch((e) => {
        console.error('CaptionHand failed to load', e);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};

let measureCtx: CanvasRenderingContext2D | null = null;
/** Advance width in px of `text` at `size` (same shaping as SVG text: kerning + the "ll" ligature). */
const measure = (text: string, size: number) => {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx!.font = `${size}px ${CAP.family}`;
  return measureCtx!.measureText(text).width;
};

const textStyle: React.CSSProperties = {
  fontFamily: CAP.family,
  fontKerning: 'normal',
  fontVariantLigatures: 'common-ligatures contextual',
  letterSpacing: 0,
};

/** One centred caption line with optional highlighted phrases (box behind text, punctuation excluded). */
const CaptionLine: React.FC<{text: string; hl?: string[]; baseline: number; size: number; cx: number}> = ({text, hl = [], baseline, size, cx}) => {
  const W = measure(text, size);
  const x0 = cx - W / 2;
  const boxes = hl.map((phrase) => {
    const k = text.indexOf(phrase);
    const core = phrase.replace(/[.,;:!?]+$/, '');
    const ws = x0 + measure(text.slice(0, k), size);
    const we = ws + measure(core, size);
    return {x: ws - HL.padL * size, y: baseline - HL.top * size, w: we - ws + (HL.padL + HL.padR) * size, h: (HL.top + HL.bottom) * size};
  });
  return (
    <g>
      {boxes.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={HL.radius * size} fill={C.highlight} />
      ))}
      <text x={x0} y={baseline} fontSize={size} fill={C.ink} style={textStyle}>
        {text}
      </text>
    </g>
  );
};

export const FontTest: React.FC = () => {
  const ready = useCaptionFont();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const punch = frame / fps >= 1;
  const cx = CARD.w / 2;
  const P = PANEL;
  const groundY = P.y + P.h * 0.74;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${CARD.x} ${CARD.y})`}>
          <rect x={0} y={0} width={CARD.w} height={CARD.h} fill={C.card} />
          {/* panel: sky block + pale ground, fills clipped to the panel; ink overshoots it */}
          <rect x={P.x} y={P.y} width={P.w} height={P.h} fill={C.sky} />
          <rect x={P.x} y={groundY} width={P.w} height={P.y + P.h - groundY} fill={C.mintPale} />
          <path d={`M ${P.x - 58} ${groundY + 1} L ${P.x + P.w + 61} ${groundY - 3}`} stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <path d={`M ${P.x - 30} ${groundY + 18} L ${P.x + 300} ${groundY + 17} M ${P.x + 316} ${groundY + 17} L ${P.x + P.w + 34} ${groundY + 14}`} stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <circle cx={SUN.cx} cy={SUN.cy} r={SUN.r} fill={C.sun} />
          {ready ? (
            punch ? (
              <CaptionLine text="Half a million came." hl={['Half a million']} baseline={CAP.punchBaseline} size={CAP.punchSize} cx={cx} />
            ) : (
              <>
                <CaptionLine text="And they didn't all want" baseline={CAP.line1} size={CAP.size} cx={cx} />
                <CaptionLine text="the same thing." hl={['same']} baseline={CAP.line2} size={CAP.size} cx={cx} />
              </>
            )
          ) : null}
          {/* caption zone guide (card-local x 90..870, y 1136..1356) */}
          <rect x={90} y={1136} width={CAP.maxWidth} height={220} fill="none" stroke="#1E88E5" strokeWidth={1.5} strokeDasharray="4 6" opacity={0.7} />
        </g>
        {/* platform safe zone guide (canvas coords) */}
        <rect x={SAFE.x0} y={SAFE.y0} width={SAFE.x1 - SAFE.x0} height={SAFE.y1 - SAFE.y0} fill="none" stroke="#D81B60" strokeWidth={2} strokeDasharray="10 8" opacity={0.75} />
        {/* digits legibility specimen at caption size, in the UI-covered strip (dev only) */}
        {ready ? (
          <g>
            <CaptionLine text="200,000 · 45 minutes ·" hl={['45 minutes']} baseline={1640} size={CAP.size} cx={540} />
            <CaptionLine text="22 million · 7 out of 10" baseline={1736} size={CAP.size} cx={540} />
            <text x={540} y={1840} fontSize={26} fill={C.ink} textAnchor="middle" style={{fontFamily: 'sans-serif'}} opacity={0.7}>
              CaptionHand = Patrick Hand 400 · 82 px · baseline gap 96 · ink #2B1B0A · box #F6B892 r3
            </text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
