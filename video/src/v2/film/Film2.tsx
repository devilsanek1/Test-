// Film2 (engine lane): video 2's G5 film. The house sequencer <Film> (src/lib/Film.tsx) with v2 data, plus a
// screen-space overlay of its own for the credits and the frame-0 extras (no change to Film.tsx: v1 / v3 untouched):
//   scenes.json    the 13 locked board panels (O1, P2 ... P13), every transitionIn a cut, P13's house loop un-build into
//                  O1's t < 0 bare-line state; captionTone per panel (a panel module's exported `captionTone` wins);
//                  `credit` per panel (the board's credit slot) and `creditStyle: "name"` on P5 (the name super).
//                  Re-running scripts/g5_scaffold.py drops credit / creditStyle: copy them back from the board
//                  (public/v2/animatic.json shots[].credit).
//   captions.json  pop captions from public/v2/voice_words.json (captions_pages.txt has the exact command)
//   scenes/        one file per panel (lanes replace the board placeholders; scenes/index.ts registers them)
//   voice          public/v2/voice.wav (39.08 s incl. the 0.12 s lead); sound cues = the locked board's (animatic "sfx")
//   frame 0        the core line in words until 6.12 s (and from the loop roll on), with its credit line under it and
//                  FOR LIFE on the pop; the spoken captions sit lowered and smaller under both (one-line pages only)
//   credits        one small ink-on-cream tab in a fixed safe spot (screen y ~195-287: under the platform UI, above the
//                  caption band, clear of the key action), keyed by the panel on screen; P5 = a larger name super
//                  (name over role); hidden while the frame-0 words show (O1, the loop roll), so the seam = frame 0
//   draft          G5: no edges / paper / texture; a burned-in "G5 · <panel> · <timecode>" label
// Compositions: src/entry-v2-film.tsx (Film2, Film2Shot {id}, Film2-<ID>, Film2Bare). How-to: docs/G5_BLOCKING.md.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Film, filmDuration, filmLoop, toneAt, type FilmScene, type FilmSfx, type Frame0Text} from '../../lib/Film';
import {capcheckMode, type CaptionBeat} from '../../lib/Captions';
import {captionTones, skyCaption, skyHighlightBox, world} from '../../lib/theme';
import {captionFontStack, measureCaption, useCaptionFont} from '../../lib/font';
import animatic from '../../../public/v2/animatic.json';
import scenesJson from './scenes.json';
import captionsJson from './captions.json';
import {sceneComponents, sceneTones, sceneWipers} from './scenes';

export const FILM2_FPS = 60;
export const FILM2_VOICE = 'v2/voice.wav';
/** The gate label burned into every pre-final cut. */
export const FILM2_GATE = 'G5';

/** A v2 panel: the house scene plus its credit (the board's small-print slot). */
export type Film2Scene = FilmScene & {credit?: string; creditStyle?: 'name'};

const BOARD = animatic as unknown as {sfx: FilmSfx[]; frame0Until: number; frame0Credit?: string};

/** The panels, with each lane's own captionTone (exported by its panel module) over the scenes.json default. */
export const film2Scenes: Film2Scene[] = (scenesJson as unknown as Film2Scene[]).map((s) => (sceneTones[s.id] ? {...s, captionTone: sceneTones[s.id]} : s));
export const film2Captions = captionsJson as CaptionBeat[];
export const film2Sfx = BOARD.sfx;
/** Film seconds (the voice: 39.08 s). */
export const film2Seconds = filmDuration(film2Scenes);
/** Frames at 60 fps: ceil(seconds * fps), the same rounding as Film's loop seam. */
export const film2Frames = (from = 0, to = film2Seconds) => Math.max(1, Math.ceil((to - from) * FILM2_FPS - 1e-6));

// ---------------------------------------------------------------- the look of the overlay (LOOK.md, DeskPal A roles)

/** Cream & Cobalt roles the overlay draws with (src/v2/StyleDesk.tsx COBALT: ink, paper, muted credit, the pop). */
export const OVERLAY_COLORS = {ink: '#2B1B0A', cream: '#FFF8EE', muted: '#7A5038', pop: '#EC6B2E'} as const;

/** Frame 0 states the payoff in words (owner playbook; board frame0 "SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE."),
 *  the fairness rule's SHE SAYS on screen for all of O1. Layout (screen px, all inside the caption band 290-600):
 *  words 70 px on 340 / 424 (glyph top 293), the credit 34 px on 472, the spoken one-line pages lowered to 556 at 0.68
 *  (box top 496, glyph bottom ~576). */
export const FILM2_FRAME0: Frame0Text = {
  lines: ['SHE SAYS: NO CRITICIZING', 'GOOGLE. FOR LIFE.'],
  highlight: 'FOR LIFE.',
  until: BOARD.frame0Until,
  size: 70,
  baselines: [340, 424],
  captionBaseline: 556,
  captionScale: 0.68,
};
/** The frame-0 credit (board frame0Credit), a small muted line under the words, as in the style frame desk_A.png. */
export const FILM2_FRAME0_CREDIT = {text: BOARD.frame0Credit ?? 'Her account to BBC News, 21 Oct 2026', size: 34, baseline: 472};
/** The frame-0 highlight box on the pop (LOOK.md: the one pop goes on the highlighted clause and FOR LIFE). */
export const FILM2_FRAME0_HIGHLIGHT = OVERLAY_COLORS.pop;

/** The credit slot: a fixed safe spot under the platform's top UI (y < 180) and above the caption band (y 290+),
 *  centred on the caption centre. The LAST line's baseline is fixed; a second line grows upward. */
export const CREDIT_SLOT = {cx: skyCaption.cx, baseline: 271, size: 38, pitch: 44, padX: 16, padY: 9, maxWidth: 820, nameSize: 46, rx: 8} as const;

// ---------------------------------------------------------------- the overlay

type Line = {text: string; size: number; weight: number};

/** Credit lines for one panel: one line, split at " · " when wider than the slot; a name super = name over role. */
function creditLines(s: Film2Scene): Line[] {
  const c = CREDIT_SLOT;
  if (!s.credit) return [];
  if (s.creditStyle === 'name') {
    const [name, ...role] = s.credit.split(' · ');
    return [{text: name, size: c.nameSize, weight: 1.6}, ...(role.length ? [{text: role.join(' · '), size: c.size, weight: 0}] : [])];
  }
  if (measureCaption(s.credit, c.size) <= c.maxWidth) return [{text: s.credit, size: c.size, weight: 0}];
  return s.credit.split(' · ').map((text) => ({text, size: c.size, weight: 0}));
}

/** The credit tab: ink on cream (reads on the cream walls, the wood and a dusk sky alike), flat, no outline. */
const CreditTab: React.FC<{lines: Line[]}> = ({lines}) => {
  const c = CREDIT_SLOT;
  if (!lines.length) return null;
  const sizes = lines.map((l) => (measureCaption(l.text, l.size) > c.maxWidth ? Math.floor((l.size * c.maxWidth) / measureCaption(l.text, l.size)) : l.size));
  const widths = lines.map((l, i) => measureCaption(l.text, sizes[i]));
  // baselines from the bottom up: the last line sits on the slot baseline; a line above it keeps a pitch scaled by size
  const bl: number[] = [];
  let y = c.baseline;
  for (let i = lines.length - 1; i >= 0; i--) {
    bl[i] = y;
    y -= i > 0 ? Math.max(c.pitch, sizes[i - 1] * 1.04) : 0;
  }
  const w = Math.max(...widths);
  const top = bl[0] - sizes[0] * 0.68 - c.padY;
  const bottom = bl[lines.length - 1] + sizes[lines.length - 1] * 0.22 + c.padY;
  return (
    <g>
      <rect x={c.cx - w / 2 - c.padX} y={top} width={w + 2 * c.padX} height={bottom - top} rx={c.rx} fill={OVERLAY_COLORS.cream} />
      {lines.map((l, i) => (
        <text
          key={i}
          x={c.cx}
          y={bl[i]}
          textAnchor="middle"
          fontFamily={captionFontStack}
          fontSize={sizes[i]}
          fill={OVERLAY_COLORS.ink}
          stroke={l.weight ? OVERLAY_COLORS.ink : undefined}
          strokeWidth={l.weight || undefined}
          strokeLinejoin="round"
        >
          {l.text}
        </text>
      ))}
    </g>
  );
};

/** FOR LIFE on the pop: the frame-0 highlight box redrawn in the pop (the same geometry as Film's Frame0Words, so it
 *  covers Film's own box exactly), the highlighted words on top of it. */
const Frame0Pop: React.FC<{f0: Frame0Text; color: string; textColor: string}> = ({f0, color, textColor}) => {
  if (!f0.highlight) return null;
  const size0 = f0.size ?? 72;
  const widest = Math.max(1, ...f0.lines.map((l) => measureCaption(l, size0)));
  const size = widest > skyCaption.maxWidth ? Math.floor((size0 * skyCaption.maxWidth) / widest) : size0;
  const last = f0.lines.length - 1;
  const ln = f0.lines[last];
  const idx = ln.indexOf(f0.highlight);
  const bl = f0.baselines ?? [342, 432];
  if (idx < 0) return null;
  const x0 = skyCaption.cx - measureCaption(ln, size) / 2 + measureCaption(ln.slice(0, idx), size);
  const pad = skyHighlightBox.padEm * size;
  const y = bl[Math.min(last, bl.length - 1)];
  return (
    <g>
      <rect x={x0 - pad} y={y - skyHighlightBox.topEm * size} width={measureCaption(f0.highlight, size) + 2 * pad} height={(skyHighlightBox.topEm + skyHighlightBox.bottomEm) * size} rx={skyHighlightBox.radiusEm * size} fill={color} />
      <text x={x0} y={y} textAnchor="start" fontFamily={captionFontStack} fontSize={size} fill={textColor}>
        {f0.highlight}
      </text>
    </g>
  );
};

/** Film2's screen-space overlay: the frame-0 credit + the pop box while the frame-0 words show (the same timing as
 *  Film: before `until`, and from the loop roll to the seam), else the credit of the panel on screen. */
const Film2Overlay: React.FC<{scenes: Film2Scene[]; offset: number; only?: string; frame0: Frame0Text; captions: CaptionBeat[]}> = ({scenes, offset, only, frame0, captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ok = useCaptionFont();
  if (capcheckMode()) return null; // caption checks see Film's captions only
  const T = frame / fps + offset;
  const end = filmDuration(scenes);
  const loop = filmLoop(scenes[scenes.length - 1]);
  // Film's loop roll (captions.json has no explicit loop page): captionAt, default end - 0.22; never in a preview
  const loopAt = only || !loop || captions.length < 2 ? undefined : loop.captionAt ?? end - 0.22;
  const f0 = T < frame0.until || (loopAt !== undefined && T >= loopAt);
  const s = only ? scenes.find((x) => x.id === only) : scenes.reduce<Film2Scene | undefined>((acc, x) => (T >= x.start - 1e-6 ? x : acc), scenes[0]);
  const tone = toneAt(scenes, T);
  const fc = FILM2_FRAME0_CREDIT;
  return (
    <svg width={world.w} height={world.h} viewBox={`0 0 ${world.w} ${world.h}`} style={{position: 'absolute', left: 0, top: 0, visibility: ok ? undefined : 'hidden'}}>
      {f0 ? (
        <>
          <Frame0Pop f0={frame0} color={FILM2_FRAME0_HIGHLIGHT} textColor={captionTones[tone].highlightText} />
          <text x={skyCaption.cx} y={fc.baseline} textAnchor="middle" fontFamily={captionFontStack} fontSize={fc.size} fill={tone === 'light' ? OVERLAY_COLORS.cream : OVERLAY_COLORS.muted}>
            {fc.text}
          </text>
        </>
      ) : s ? (
        <CreditTab lines={creditLines(s)} />
      ) : null}
    </svg>
  );
};

// ---------------------------------------------------------------- compositions

const common = {
  components: sceneComponents,
  wipers: sceneWipers,
  captions: film2Captions,
  audioSrc: FILM2_VOICE,
  sfx: film2Sfx,
  captionMotion: 'pop' as const,
  frame0: FILM2_FRAME0,
  draftLabel: FILM2_GATE,
  edges: false,
};

/** The whole film, end to end (loops to the bare-line frame 0), with captions, frame-0 words, credits and the label. */
export const Film2: React.FC = () => (
  <AbsoluteFill>
    <Film scenes={film2Scenes} {...common} />
    <Film2Overlay scenes={film2Scenes} offset={0} frame0={FILM2_FRAME0} captions={film2Captions} />
  </AbsoluteFill>
);

/** One panel alone: its captions, its slice of the voice and sound cues, its credit, its own un-build (P13).
 *  Composition time = panel-local time; the label shows film time. */
export const Film2Shot: React.FC<{id: string}> = ({id}) => {
  const s = film2Scenes.find((x) => x.id === id);
  if (!s) return null;
  return (
    <AbsoluteFill>
      <Film scenes={film2Scenes} {...common} only={id} offset={s.start} />
      <Film2Overlay scenes={film2Scenes} offset={s.start} only={id} frame0={FILM2_FRAME0} captions={film2Captions} />
    </AbsoluteFill>
  );
};

/** The picture alone, for sound-off cold reads: the whole film with no captions, no frame-0 words, no credits and
 *  no draft label (the voice and cues stay in the file; mute it for the read). */
export const Film2Bare: React.FC = () => (
  <Film scenes={film2Scenes} components={sceneComponents} wipers={sceneWipers} captions={film2Captions} showCaptions={false} audioSrc={FILM2_VOICE} sfx={film2Sfx} edges={false} />
);
