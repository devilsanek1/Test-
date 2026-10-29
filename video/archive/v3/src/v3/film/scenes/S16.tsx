// S16 (lane L1-opening; G5b dense pass by lane S16): CLOSE-UP cut-in on the tag, 38.84-41.15 ("... on your next
// laptop's price tag").
// Locked (storyboard_g3, camera_plan_g3): the tag (the subject, w 460, centred on S15's x axis) hangs by its string from
// the corner of THE laptop (the listing's laptop, cut by the left edge, below the caption band); the lamp (its shade cut
// by the left edge) pours its golden pool on the desk under the tag. At 39.70 (t 0.86) the tag turns over and shows the
// data center drawn on its back (the like-pop at 39.88 lands as the back appears). The engine un-builds the panel over
// its last 0.3 s into O1's bare-line frame 0 (the loop): every piece is kit Ink / Fill (raw SVG in ExitFade /
// ExitShrink), and the tag shrinks as one group.
// G5b (owner: "way too empty"; the approved pilot's bar): the same desk world as O1 / S15 dressed round the locked frame
// (S16_wall.tsx: the attic slope with the paper star, string lights, photos on a cord, a hanging pothos, a sea print;
// below the band O1'S WINDOW at the cut-in's 1.275x on S15's axis: the frosted glass, the lit town, the dark data center
// with its lit sign right behind the tag; S16_desk.tsx: the pen cup, the mug, the charger, clementines, glasses, sticky
// notes, the headphones and the biscuits at the left (S15's sides), the spiral notebook, letters, a dusk-blue
// paperback, the planner; the screen's desktop), the lamp's pull chain swinging (the loop), and Pip ON THE SILL right of
// the tag (S15's spot through the cut-in: O1's Pip at 1.275x), watching it: it leans in place as the tag turns (39.70),
// holds still through the flip, shrugs at us on "tag" (40.3); it shrinks with the un-build. The tag's flip moves the
// room's air a beat later (the lights, the pothos, a sticky note settle through 40.1-40.8: no stillness before the
// un-build). Fixer pass (G5b review): the back wall was a second room (a shelf, a pinboard, a clock), the props flipped
// sides, and the un-build left flat rects; now the window, S15's sides, and the loop below.
// The loop un-build (fixer pass): the window, the desk slab and what lies flat on it leave under ONE falling erase edge
// (desk_window.tsx EraseDown: fills with their lines, never a flat rect shrinking to its centre); the standing things
// un-build as the house recipe; the tag travels and turns back to its front onto O1's frame-0 tag (O1_set TAG through
// O1's frame-0 front plane), string and all, then dissolves over O1's "$999" outline, so the tag carries across the seam.
// Camera (cozy v2 §3, OVERRIDES g5b: docs/v3/cozy_v2_application.md): the FLOAT replaces the invisible 1.5 % breathe:
// translation only, 8-12 px/s legs that turn back (eased) within +-12 / +-10 px of home; it starts at home (the cut-in
// on S15's axis) and passes back through home on the last frame; the captions and the UI stay fixed. Every set reaches
// >= 60 px past each frame edge.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ExitFade, ExitProvider, ExitShrink, NoExit, useExit} from '../../../lib/exit';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, floatCam, Lamp, Laptop, laptopGeo, Pip3, PriceTag, PullChain, ScreenDesktop, type LookKey, type PipPoseKey, type Pt} from '../kit';
import {S16Desk, S16DeskBack, S16DeskFront, S16DeskMid, S16Grain} from './S16_desk';
import {S16_SILL_Y, S16_TURN, S16_WINDOW, S16WallLow, S16WallTop} from './S16_wall';
import {EraseDown} from './desk_window';
import {o1FrontMat, o1TagStringFrom, TAG as O1_TAG} from './O1_set';

const DUR = 41.15 - 38.84;
const TURN_AT = S16_TURN;
/** The like-pop (39.88): the tag's back lands. */
const POP_AT = 39.88 - 38.84;
/** "tag" (~40.3): Pip shrugs at us. */
const SHRUG_AT = 40.3 - 38.84 - 0.06;
/** THE laptop: hinge centre, lid width (cut by the left edge). */
const LAP = {x: 30, y: 1330, w: 520};
/** The tag: S15's tag at 1.275x, centred on x 540. */
const TAG = {x: 310, y: 1010, w: 460, rot: -8};

// ---------------------------------------------------------------- Pip

/** Pip on the window's sill right of the tag: O1's Pip (866, 1060, 1x) through the cut-in (S16_WINDOW: 1.275x). */
const PIP = {x: S16_WINDOW.m[0] * 866 + S16_WINDOW.m[4], y: S16_SILL_Y, scale: 1.275};
/** Pip watches the tag (head turned left), glances up its string (0.3), leans in as it turns (a small tilt in place, no
 *  hop), holds still through the flip (eyes on the tag), then shrugs at us on "tag" and settles: one reaction, never on
 *  the subject's beat (LIFE_AND_DENSITY §5). */
const PIP_LOOK: LookKey[] = [
  {t: -9, v: -0.62},
  {t: 0.3, v: -0.82},
  {t: TURN_AT - 0.12, v: -0.95},
  {t: SHRUG_AT, v: 0},
  {t: SHRUG_AT + 0.5, v: -0.55},
];
const PIP_KEYS: PipPoseKey[] = [
  {t: -9, pose: 'sit-back'},
  {t: SHRUG_AT, pose: 'shrug'},
  {t: SHRUG_AT + 0.44, pose: 'sit-back'},
];

/** The lean toward the tag: ~2 deg about the feet (~6 px at the head), eased over 0.3 s into the turn. */
const LEAN_AT = TURN_AT - 0.3;
const LEAN_DEG = -2;

const S16Pip: React.FC = () => {
  const t = useTime();
  const u = Math.min(1, Math.max(0, (t - LEAN_AT) / 0.3));
  const lean = LEAN_DEG * (u * u * (3 - 2 * u));
  return (
    <ExitShrink x={PIP.x} y={PIP.y}>
      <XG m={mat.about(mat.rotate(lean), PIP.x, PIP.y)}>
        <Pip3 x={PIP.x} y={PIP.y} scale={PIP.scale} lineWeight={1.25} seed={16} keys={PIP_KEYS} look={PIP_LOOK} lookDur={0.18} />
      </XG>
    </ExitShrink>
  );
};

// ---------------------------------------------------------------- the loop: erase edge + the tag onto O1's tag

/** The falling erase edge (exit 0.06 -> 0.72 of the 0.3 s un-build, ~12 frames): from the window head to the frame bottom. */
const ERASE = {y0: 600, y1: 2000, e0: 0.06, e1: 0.72};
/** O1's frame-0 tag (t < 0: the front plane at 1.07) and its string's tie point, in screen px. */
const O1F = o1FrontMat(-1);
const ap = (m: number[], p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const O1_TAG_XY = ap(O1F, [O1_TAG.x, O1_TAG.y]);
const O1_TAG_W = O1_TAG.w * O1F[0];
const O1_TAG_FROM = ap(O1F, o1TagStringFrom());
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** The tag: hangs from THE laptop's corner and turns over at 39.70 (its back: the data center). In the un-build it
 *  travels (exit 0 -> 0.6) onto O1's frame-0 tag and turns back to its front on the way (0.04 -> 0.44), its string's
 *  far end sliding to the listing laptop's corner, whole (no un-build of its own while it moves); then it dissolves
 *  (0.55 -> 1) over O1's "$999" outline, which is already drawn there. */
const S16Tag: React.FC<{corner: Pt; dx: number; dy: number}> = ({corner, dx, dy}) => {
  const t = useTime();
  const e = useExit();
  const u = ease.inOutCubic(prog(e, 0, 0.6));
  const x = lerp(TAG.x, O1_TAG_XY[0] - dx, u);
  const y = lerp(TAG.y, O1_TAG_XY[1] - dy, u);
  const w = lerp(TAG.w, O1_TAG_W, u);
  const rot = lerp(TAG.rot, O1_TAG.rot, u);
  const from: Pt = [lerp(corner[0], O1_TAG_FROM[0] - dx, u), lerp(corner[1], O1_TAG_FROM[1] - dy, u)];
  const turn = e > 0 ? 1 - ease.inOutSine(prog(e, 0.04, 0.4)) : t >= TURN_AT ? prog(t, TURN_AT, 0.36, ease.inOutSine) : 0;
  const c: Pt = [x + w * 0.55, y + w * 0.25];
  return (
    <NoExit>
      <ExitProvider value={prog(e, 0.55, 0.45)}>
        <ExitShrink x={c[0]} y={c[1]}>
          <PriceTag x={x} y={y} w={w} value="$1,099" old="$999" stringFrom={from} rot={rot} sway={1.2} turn={turn} seed="s16/tag" />
        </ExitShrink>
      </ExitProvider>
    </NoExit>
  );
};

const S16: React.FC = () => {
  const t = useTime();
  // the loop seam (assembler fix): during the un-build O1's bare-line underlay waits beneath. S16's wall is the same
  // peach cream, so its sky slab is dropped while it un-builds: O1's lines draw on in place as S16's pieces leave,
  // instead of the slab hiding them and wiping them in over the last two frames (a near-empty page before).
  const unbuilding = useExit() > 0;
  const [dx, dy] = floatCam(t, {dur: DUR, seed: 's16/float'});
  const g = laptopGeo(LAP.x, LAP.y, LAP.w);
  // the string ties on at the lid's top-right corner
  const corner: Pt = [g.lid[1][0] - 6, g.lid[1][1] + 10];
  return (
    <World sky={unbuilding ? 'transparent' : EMBER.wall}>
      <XG m={mat.translate(dx, dy)}>
        <S16WallTop />
        <EraseDown {...ERASE}>
          <S16WallLow />
        </EraseDown>
        {/* Pip on the sill (the wall plane: behind the desk's back row, the mug and its steam) */}
        <S16Pip />
        <EraseDown {...ERASE}>
          <S16Desk />
          <S16Grain />
        </EraseDown>
        <Lamp pose={{base: [-170, 1250], elbow: [-60, 650], head: [92, 790], rot: 32, scale: 1.25}} seed="s16/lamp" />
        <ExitFade x={96} y={940}>
          <PullChain x={96} y={938} len={44} amp={8} jolt={[TURN_AT + 0.14]} />
        </ExitFade>
        <S16DeskBack />
        <Laptop x={LAP.x} y={LAP.y} w={LAP.w} variant="new" seed="s16/lap">
          <ScreenDesktop scr={g.scr} />
        </Laptop>
        <S16DeskMid />
        <EraseDown {...ERASE}>
          <S16DeskFront />
        </EraseDown>
        <S16Tag corner={corner} dx={dx} dy={dy} />
      </XG>
    </World>
  );
};
export default S16;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
