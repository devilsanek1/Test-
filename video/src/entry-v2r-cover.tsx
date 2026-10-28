// Video 2 (restart, "One Small Window") cover (G8; docs/v2/POSTING_KIT.md "Cover"): one frame of the film itself,
// S1's "for life." beat (the row of her ageing copies walking out of the Google building's lit door, Pip covering its
// ears), with no captions, no label, no audio and no paper edge, and the core line drawn over the mint sky in the
// film's caption type (CaptionHand, the caption ink, the peach highlight box on FOR LIFE.). "SHE SAYS" stays at full
// size (CORE_LINE.md §1); no source line in the picture (playbook: sources go in the caption and the pinned comment).
// The title sits in the clean sky above the roofline (y ~310-578), inside the 4:5 profile-grid crop (1080x1350, y 285-1635).
// Render (the palette module is imported FIRST, as in entry-v2r-film.tsx):
//   npx remotion still src/entry-v2r-cover.tsx Cover2R ../video/deliverables/v2/v2r_cover.png --frame=312 --gl=angle
import './v2r/palette';
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {Film} from './lib/Film';
import {captionFontStack, measureCaption, useCaptionFont} from './lib/font';
import {skyHighlightBox} from './lib/theme';
import {CAPTION_COLORS} from './v2r/palette';
import {sceneComponents, sceneWipers} from './v2r/scenes';
import {FILM2R_FPS, film2rCaptions, film2rFrames, film2rScenes} from './v2r/film/Film2R';

/** The core line, ALL CAPS, no quote marks (CORE_LINE.md §1; POSTING_KIT.md "Cover"). */
const LINES = ['SHE SAYS:', 'NO CRITICIZING GOOGLE.', 'FOR LIFE.'];
const HIGHLIGHT_LINE = 2;
const HIGHLIGHT = 'FOR LIFE.';
const CX = 540;
/** The widest line fits this width (x 70-1010). */
const MAX_W = 940;
/** The size cap: three lines (box included) fit the clean sky between the crop's top (285) and S1's roofline (the
 *  first non-sky row is y 590 at 5.20 s): cap top 310, box bottom ~578. */
const SIZE = 92;
/** Line 1's cap top, CaptionHand's cap height and the line pitch (em; >= 1.0 keeps the box clear of line 2). */
const CAP_TOP = 310;
const CAP_EM = 0.68;
const PITCH_EM = 1.02;

const Title: React.FC = () => {
  const ok = useCaptionFont();
  const col = CAPTION_COLORS;
  const widest = Math.max(...LINES.map((l) => measureCaption(l, SIZE)));
  const size = widest > MAX_W ? Math.floor((SIZE * MAX_W) / widest) : SIZE;
  const baselines = LINES.map((_, i) => Math.round(CAP_TOP + CAP_EM * size + i * PITCH_EM * size));
  const ln = LINES[HIGHLIGHT_LINE];
  const lw = measureCaption(ln, size);
  const idx = ln.indexOf(HIGHLIGHT);
  const x0 = CX - lw / 2 + measureCaption(ln.slice(0, idx), size);
  const pad = skyHighlightBox.padEm * size;
  const box = {
    x: x0 - pad,
    y: baselines[HIGHLIGHT_LINE] - skyHighlightBox.topEm * size,
    w: measureCaption(HIGHLIGHT, size) + 2 * pad,
    h: (skyHighlightBox.topEm + skyHighlightBox.bottomEm) * size,
  };
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, visibility: ok ? undefined : 'hidden'}}>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={skyHighlightBox.radiusEm * size} fill={col.highlight} />
      {LINES.map((l, i) => (
        <text key={i} x={CX} y={baselines[i]} textAnchor="middle" fontFamily={captionFontStack} fontSize={size} fill={i === HIGHLIGHT_LINE ? col.highlightText : col.text}>
          {l}
        </text>
      ))}
    </svg>
  );
};

/** A film frame (no captions, label, audio or paper edge) with the core line as the title. */
const Cover2R: React.FC = () => (
  <AbsoluteFill>
    <Film scenes={film2rScenes} components={sceneComponents} wipers={sceneWipers} captions={film2rCaptions} audio={false} showCaptions={false} edges={false} />
    <Title />
  </AbsoluteFill>
);

const V2RCoverRoot: React.FC = () => (
  <Composition id="Cover2R" component={Cover2R} durationInFrames={film2rFrames()} fps={FILM2R_FPS} width={1080} height={1920} />
);

registerRoot(V2RCoverRoot);
