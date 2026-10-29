// StyleDeskOpen: video 2's OPENING MOTION TEST (G4), the first 4 s of O1 (docs/v2/storyboard_g3.md) at 60 fps in the
// StyleDesk look (src/v2/StyleDesk.tsx: same pieces, same palettes; `palette` prop, default "3 Cream & Cobalt").
// The playbook's opening rule (OWNER_PLAYBOOK "Hook and pacing", CINEMATIC_GUIDE "The opening"):
//   0.00-0.40  frame 0 is the scene being drawn: bare ink lines on cream paper draw on from the contract outward
//              (the ink wave, already ~half done at frame 0); the hand lettering writes on with it
//   0.10-0.40  the signature draws on (the "signed!" chime at 0.08)
//   0.16-0.67  colour floods out of the lamp pool, shape by shape (each fill flips whole: ENGINE <Look> cascade)
//   0.64-1.00  the GOOGLE badge is tossed in from the left and lands in the box on "Google." (box squash, the photo
//              frame knocks and settles, the lanyard drapes over the rim)
//   1.28-2.02  her sleeve brings the highlighter in from the bottom-left; 2.02-2.52 it aims down over the clause
//   2.60-3.06  on "CONTRACT" it runs across "no criticizing", then "Google" (the pop band follows the tip)
//   3.08-      on "bans" the page steps out past its bottom edge (2030), then runs on faster and faster, over the
//              desk's front edge by ~3.8 s, toward "for life"
//   throughout the one opening move: PULL OUT 1.05 -> 1.00, ease-in over O1's 6.12 s; steam; cloud drift
// The frame-0 words ("SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE.") sit in the captions band from frame 0 (screen space).
// Audio: public/v2/voice.wav (its first 4 s) + v2_signed_chime.wav at 0.08 s.
// Render: npx remotion render src/entry-v2.tsx StyleDeskOpen review/look/v2_g4/opening_test.mp4 --crf 18

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Pt} from '../lib/sketch';
import {ease as E, prog, useTime} from '../lib/time';
import {useCaptionFont} from '../lib/font';
import {mat, Mat, XG} from '../lib/xf';
import {
  Arm,
  BADGE_REST,
  BadgeState,
  Basket,
  Bookcase,
  BookStack,
  Box,
  CL_X,
  Claim,
  clauseLayout,
  Contract,
  Desk,
  DeskBuild,
  DeskBuildV,
  deskPalette,
  Floor,
  Lamp,
  Mug,
  PAGE_M,
  Pen,
  TopShelf,
  WindowView,
} from './StyleDesk';

// ---------------------------------------------------------------- the beats (s; voice: public/v2/voice_words.json)

export const OPEN = {
  inkO: [544, 954] as Pt, // the ink wave starts at the contract (the subject reads first)
  inkT0: -0.26,
  inkSpeed: 3000,
  colO: [575, 965] as Pt, // the colour floods out of the lamp pool
  colT0: 0.16,
  colSpeed: 2200,
  sig: {at: 0.1, dur: 0.3},
  chime: 0.08,
  toss: [0.64, 1.0], // badge flight; lands on "Google." (0.92-1.88)
  armIn: [1.28, 2.02], // one long glide (ease-out) right after the landing, then a slow aim
  touch: [2.52, 2.6],
  row1: [2.6, 2.84], // "contract" 2.60
  hop: [2.84, 2.92],
  row2: [2.92, 3.06],
  step: [3.08, 3.5], // "bans" 3.08: the page steps out past its edge (2030)
  pour: 3.55, // then runs on, faster and faster
  shot: 6.12, // O1's length (the pull-out spans the whole shot)
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpPt = (a: Pt, b: Pt, k: number): Pt => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const apply = (m: Mat, x: number, y: number): Pt => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const V_ARM: Pt = [Math.cos((121 * Math.PI) / 180), Math.sin((121 * Math.PI) / 180)]; // the forearm, toward her

/** The badge: tossed in from the left on a low arc (it stays below the captions band), lands, hops, settles. */
function badgeAt(t: number): BadgeState | null {
  const [t0, t1] = OPEN.toss;
  if (t < t0) return null;
  if (t < t1) {
    const p = (t - t0) / (t1 - t0);
    const x = lerp(-150, 170, E.outSine(p));
    const y = lerp(700, 872, p) - 90 * 4 * p * (1 - p);
    const rot = lerp(40, -11, E.outQuad(p));
    return {m: mat.compose(mat.translate(x, y), mat.rotate(rot)), drape: 0};
  }
  const s = t - t1;
  const hop = s < 0.16 ? -12 * Math.sin((Math.PI * s) / 0.16) : 0;
  const wob = 5 * Math.exp(-s * 9) * Math.sin(s * 30);
  const m = mat.compose(mat.translate(0, hop), BADGE_REST, mat.rotate(wob));
  return {m, drape: prog(t, t1, 0.22, E.outCubic)};
}

/** The highlighter tip (world), and how far the band has run on each clause row. */
function strokeAt(t: number, rows: Pt[][]): {tip: Pt; bands: [number, number]} {
  const w = (p: Pt) => apply(PAGE_M, p[0], p[1]);
  const [a1, b1] = rows[0];
  const [a2, b2] = rows[1];
  const hover: Pt = [a1[0] - 12, a1[1] - 18];
  if (t < OPEN.touch[0]) {
    const aim = prog(t, OPEN.armIn[1], OPEN.touch[0] - OPEN.armIn[1], E.inOutSine);
    const hv: Pt = [hover[0] - 22 * (1 - aim), hover[1] - 26 * (1 - aim)];
    const p = prog(t, OPEN.armIn[0], OPEN.armIn[1] - OPEN.armIn[0], E.outCubic);
    const drift: Pt = [3 * Math.sin(t * 5.1), 2.5 * Math.sin(t * 3.7 + 1)];
    const h = w(hv);
    return {tip: [h[0] + V_ARM[0] * 760 * (1 - p) + drift[0] * p, h[1] + V_ARM[1] * 760 * (1 - p) + drift[1] * p], bands: [0, 0]};
  }
  if (t < OPEN.row1[0]) return {tip: w(lerpPt(hover, a1, prog(t, OPEN.touch[0], OPEN.touch[1] - OPEN.touch[0], E.inOutSine))), bands: [0, 0]};
  if (t < OPEN.row1[1]) {
    const p = prog(t, OPEN.row1[0], OPEN.row1[1] - OPEN.row1[0], E.inOutSine);
    return {tip: w(lerpPt(a1, b1, p)), bands: [p, 0]};
  }
  if (t < OPEN.row2[0]) {
    const p = prog(t, OPEN.hop[0], OPEN.hop[1] - OPEN.hop[0], E.inOutSine);
    const q = lerpPt(b1, a2, p);
    return {tip: w([q[0], q[1] - 14 * Math.sin(Math.PI * p)]), bands: [1, 0]};
  }
  const p = prog(t, OPEN.row2[0], OPEN.row2[1] - OPEN.row2[0], E.inOutSine);
  return {tip: w(lerpPt(a2, b2, p)), bands: [1, p]};
}

/** How far (px) the page has run on past its bottom edge. */
function runOnAt(t: number): number {
  if (t < OPEN.step[0]) return 0;
  const step = 120 * prog(t, OPEN.step[0], OPEN.step[1] - OPEN.step[0], E.outCubic);
  const s = Math.max(0, t - OPEN.pour);
  return step + 900 * s * s;
}

export type StyleDeskOpenProps = {
  /** "3 Cream & Cobalt" (default) | "9 Autumn Ember" | "5 Sage Study" (or "A" / "B" / "C"). */
  palette?: string;
  /** The frame-0 words in the captions band (default true). */
  caption?: boolean;
  /** Voice + chime (default true). */
  audio?: boolean;
};

export const StyleDeskOpen: React.FC<StyleDeskOpenProps> = ({palette: name = '3 Cream & Cobalt', caption = true, audio = true}) => {
  const P = deskPalette(name);
  const t = useTime();
  const {fps} = useVideoConfig();
  const ok = useCaptionFont();
  const cl = clauseLayout(ok);
  // the clause rows' highlighter paths (page-local): start under the first letter, end where the band ends
  const rows: Pt[][] = cl.rows.map((r) => [
    [CL_X - 2, r.base - cl.size * 0.22],
    [CL_X + r.w + 10, r.base - cl.size * 0.22],
  ]);
  const {tip, bands} = strokeAt(t, rows);
  const badge = badgeAt(t);
  const land = t - OPEN.toss[1];
  const jolt = land > 0 && land < 0.14 ? Math.sin((Math.PI * land) / 0.14) : 0;
  const knock = land > 0.02 ? 6 * Math.exp(-(land - 0.02) * 6) * Math.sin((land - 0.02) * 22) : 0;
  // the one opening move: pull out 1.05 -> 1.00, ease-in over the shot
  const p = Math.min(1, t / OPEN.shot);
  const z = 1.05 - 0.05 * p * p;
  const cam = mat.about(mat.scale(z), 540, 960);
  const build: DeskBuildV = {
    inkAt: (c) => OPEN.inkT0 + dist(c, OPEN.inkO) / OPEN.inkSpeed,
    colourAt: (c) => OPEN.colT0 + dist(c, OPEN.colO) / OPEN.colSpeed,
    paper: P.wall,
    uncam: mat.inv(cam),
    sig: OPEN.sig,
  };
  return (
    <AbsoluteFill style={{background: P.wall, overflow: 'hidden'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <DeskBuild.Provider value={build}>
          <XG m={cam}>
            <rect x={-200} y={-200} width={1480} height={2320} fill={P.wall} />
            <Bookcase P={P} />
            <TopShelf P={P} />
            <WindowView P={P} t={t} />
            <Floor P={P} />
            <Basket P={P} />
            <Desk P={P} />
            <BookStack P={P} />
            <Box P={P} ok={ok} badge={badge} jolt={jolt} tip={knock} />
            <Contract P={P} ok={ok} cl={cl} bands={bands} runOn={runOnAt(t)} />
            <Pen P={P} />
            <Mug P={P} t={t} />
            <Lamp P={P} />
            {t >= OPEN.armIn[0] ? <Arm P={P} tip={tip} reach={1040} /> : null}
          </XG>
        </DeskBuild.Provider>
        {caption ? <Claim P={P} ok={ok} /> : null}
      </svg>
      {audio ? (
        <>
          <Audio src={staticFile('v2/voice.wav')} />
          <Sequence from={Math.round(OPEN.chime * fps)} layout="none">
            <Audio src={staticFile('v2/v2_signed_chime.wav')} volume={0.6} />
          </Sequence>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
