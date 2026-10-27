// Video 3 cover (G8): a frame of the film with no captions, no label and no audio, and the core line drawn as the
// frame-0 title (same caption font, ink and highlight box). Render: npx remotion still src/entry-v3-film.tsx Cover3
// out.png --frame=<f>. The title sits in the caption band (y ~300-560), inside the 3:4 profile-grid crop (y 240-1680).
import React from 'react';
import {Film} from '../../lib/Film';
import {captionFontStack, measureCaption, useCaptionFont} from '../../lib/font';
import {captionTones, skyCaption, skyHighlightBox} from '../../lib/theme';
import {sceneComponents, sceneWipers} from './scenes';
import {film3Captions, film3Scenes} from './Film3';

const LINES = ['AI is making your', 'next laptop pricier.'];
const HIGHLIGHT = 'pricier.';
const BASELINES = [400, 522];
const SIZE = 104;

const Title: React.FC = () => {
  const ok = useCaptionFont();
  const col = captionTones.dark;
  const cx = skyCaption.cx;
  const widest = Math.max(...LINES.map((l) => measureCaption(l, SIZE)));
  const size = widest > 960 ? Math.floor((SIZE * 960) / widest) : SIZE;
  const ln = LINES[1];
  const lw = measureCaption(ln, size);
  const idx = ln.indexOf(HIGHLIGHT);
  const x0 = cx - lw / 2 + measureCaption(ln.slice(0, idx), size);
  const pad = skyHighlightBox.padEm * size;
  const box = {x: x0 - pad, y: BASELINES[1] - skyHighlightBox.topEm * size, w: measureCaption(HIGHLIGHT, size) + 2 * pad,
    h: (skyHighlightBox.topEm + skyHighlightBox.bottomEm) * size};
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, visibility: ok ? undefined : 'hidden'}}>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={skyHighlightBox.radiusEm * size} fill={col.highlight} />
      {LINES.map((l, i) => (
        <text key={i} x={cx} y={BASELINES[i]} textAnchor="middle" fontFamily={captionFontStack} fontSize={size} fill={col.text}>{l}</text>
      ))}
    </svg>
  );
};

export const Cover3: React.FC = () => (
  <>
    <Film scenes={film3Scenes} components={sceneComponents} wipers={sceneWipers} captions={film3Captions} audio={false} showCaptions={false} edges={false} />
    <Title />
  </>
);
