// The look test's ONE clip for the owner's phone (STUDY.md §10 item 11; notes test/REPORT.md): v2's own S1 as shipped
// (6.1 s, its locked voice and pop captions), then pass 2 (every decided change, 7.0 s: S1 0-6.1 s and the 0.9 s
// locked hold), each after a short labelled card ("Before: the Google video" / "After: the poster lessons"), big and
// readable at phone size, its words kept outside the caption block (LAYOUT y 290-600) and silent. 1080 x 1920, 60 fps.
//   0.0-1.2 s    card "Before: the Google video"
//   1.2-7.3 s    v2's S1 (PosterS1 preset v2: every switch off, pixel-identical to Film2R-V2S1, SCENE.md §4)
//   7.3-8.5 s    card "After: the poster lessons"
//   8.5-15.5 s   pass 2 (PosterS1 preset pass2)
// Only one part renders on any frame (each in its own Sequence), so the scene's per-frame module state (the palette,
// the pen, the float table: set by PosterS1's root) is always the part's own.
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {captionFontStack, measureCaption, useCaptionFont} from '../../lib/font';
import {PosterS1, POSTER_S1_END, POSTER_S1_FPS, POSTER_S1_FRAMES} from './PosterS1';

export const LOOK_TEST_FPS = POSTER_S1_FPS;
/** Each card: 1.2 s (four words read at a glance, then the part starts). */
export const LOOK_TEST_CARD = Math.round(1.2 * LOOK_TEST_FPS);
/** v2's S1 to its cut (6.1 s). */
export const LOOK_TEST_BEFORE = Math.round(POSTER_S1_END * LOOK_TEST_FPS);
export const LOOK_TEST_FRAMES = LOOK_TEST_CARD + LOOK_TEST_BEFORE + LOOK_TEST_CARD + POSTER_S1_FRAMES;

/** The card: the film's paper (S1 opens on paper: the cut into its frame 0 is calm), the label in the caption hand,
 *  two lines centred at y ~880-1080, far below the caption block. */
const CARD = {bg: '#F7F2EA', ink: '#2A2230', kicker: 92, title: 128, maxW: 900, y: 900} as const;

const TitleCard: React.FC<{kicker: string; title: string}> = ({kicker, title}) => {
  useCaptionFont();
  const size = Math.min(CARD.title, (CARD.title * CARD.maxW) / Math.max(1, measureCaption(title, CARD.title)));
  return (
    <AbsoluteFill style={{background: CARD.bg}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <text x={540} y={CARD.y} textAnchor="middle" fontFamily={captionFontStack} fontSize={CARD.kicker} fill={CARD.ink}>
          {kicker}
        </text>
        <text x={540} y={CARD.y + CARD.kicker * 0.45 + size * 1.05} textAnchor="middle" fontFamily={captionFontStack} fontSize={size} fill={CARD.ink}>
          {title}
        </text>
      </svg>
    </AbsoluteFill>
  );
};

export const PosterLookTest: React.FC = () => (
  <AbsoluteFill style={{background: CARD.bg}}>
    <Sequence from={0} durationInFrames={LOOK_TEST_CARD} layout="none">
      <TitleCard kicker="Before:" title="the Google video" />
    </Sequence>
    <Sequence from={LOOK_TEST_CARD} durationInFrames={LOOK_TEST_BEFORE} layout="none">
      <PosterS1 preset="v2" audio="voice" captions />
    </Sequence>
    <Sequence from={LOOK_TEST_CARD + LOOK_TEST_BEFORE} durationInFrames={LOOK_TEST_CARD} layout="none">
      <TitleCard kicker="After:" title="the poster lessons" />
    </Sequence>
    <Sequence from={2 * LOOK_TEST_CARD + LOOK_TEST_BEFORE} durationInFrames={POSTER_S1_FRAMES} layout="none">
      <PosterS1 preset="pass2" audio="voice" captions />
    </Sequence>
  </AbsoluteFill>
);
