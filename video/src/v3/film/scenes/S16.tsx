// S16 (lane L1-opening; G5b dense pass by lane S16): CLOSE-UP cut-in on the tag, 38.84-41.15 ("... on your next
// laptop's price tag").
// Locked (storyboard_g3, camera_plan_g3): the tag (the subject, w 460, centred on S15's x axis) hangs by its string from
// the corner of THE laptop (the listing's laptop, cut by the left edge, below the caption band); the lamp (its shade cut
// by the left edge) pours its golden pool on the desk under the tag. At 39.70 (t 0.86) the tag turns over and shows the
// data center drawn on its back (the like-pop at 39.88 lands as the back appears). The engine un-builds the panel over
// its last 0.3 s into O1's bare-line frame 0 (the loop): every piece is kit Ink / Fill (raw SVG in ExitFade /
// ExitShrink), and the tag shrinks as one group.
// G5b (owner: "way too empty"; the approved pilot's bar): the same desk world as O1 / S7 dressed round the locked frame
// (S16_wall.tsx: the attic slope with the paper star, string lights, photos on a cord, a hanging pothos, a sea print, the
// wall shelf over the tag, a leaf print, the calendar, the ticking clock, the pinboard, sticky notes; S16_desk.tsx: the
// pen cup, the mug, the charger, clementines, glasses, sticky notes, headphones, the spiral notebook, letters, your
// phone face down, the planner), the lamp's pull chain swinging (the loop), and Pip on the desk right of the tag at
// 1.8x, watching it: it leans in as the tag turns (39.70), a small trunk-up on the like-pop (39.88), a shrug at us
// (40.3); it shrinks with the un-build. The tag's flip moves the room's air a beat later (pinboard notes, a sticky
// note, the lights, the pothos settle through 40.1-40.8: no stillness before the un-build).
// Camera (cozy v2 §3, OVERRIDES g5b: docs/v3/cozy_v2_application.md): the FLOAT replaces the invisible 1.5 % breathe:
// translation only, 8-12 px/s legs that turn back (eased) within +-12 / +-10 px of home; it starts at home (the cut-in
// on S15's axis) and passes back through home on the last frame; the captions and the UI stay fixed. Every set reaches
// >= 60 px past each frame edge.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ExitFade, ExitShrink, useExit} from '../../../lib/exit';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, floatCam, Lamp, Laptop, laptopGeo, Pip3, PriceTag, PullChain, type LookKey, type PipPoseKey, type Pt} from '../kit';
import {S16Desk, S16DeskBack, S16DeskFront, S16DeskMid, S16Grain} from './S16_desk';
import {S16_TURN, S16WallLow, S16WallTop} from './S16_wall';

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

const PIP = {x: 884, y: 1328, scale: 1.8};
/** Pip watches the tag (head turned left), glances up its string (0.3), leans in as it turns (a small hop toward it),
 *  and keeps on it to the shrug. */
const PIP_LOOK: LookKey[] = [
  {t: -9, v: -0.62},
  {t: 0.3, v: -0.82},
  {t: TURN_AT - 0.12, v: -0.95},
  {t: SHRUG_AT, v: 0},
  {t: SHRUG_AT + 0.5, v: -0.55},
];
const PIP_KEYS: PipPoseKey[] = [
  {t: -9, pose: 'sit-back'},
  {t: POP_AT - 0.02, pose: 'trunk-up'},
  {t: SHRUG_AT, pose: 'shrug'},
  {t: SHRUG_AT + 0.44, pose: 'sit-back'},
];

const S16Pip: React.FC = () => (
  <ExitShrink x={PIP.x - 18} y={PIP.y}>
    <Pip3 x={PIP.x} y={PIP.y} scale={PIP.scale} lineWeight={1.25} seed={16} keys={PIP_KEYS} look={PIP_LOOK} lookDur={0.18} hops={[{t: TURN_AT - 0.1, to: [PIP.x - 18, PIP.y], dur: 0.26, height: 10}]} />
  </ExitShrink>
);

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
  const tagC: Pt = [TAG.x + TAG.w * 0.55, TAG.y + TAG.w * 0.25];
  return (
    <World sky={unbuilding ? 'transparent' : EMBER.wall}>
      <XG m={mat.translate(dx, dy)}>
        <S16WallTop />
        <S16WallLow />
        <S16Desk />
        <S16Grain />
        <Lamp pose={{base: [-170, 1250], elbow: [-60, 650], head: [92, 790], rot: 32, scale: 1.25}} seed="s16/lamp" />
        <ExitFade x={96} y={940}>
          <PullChain x={96} y={938} len={44} amp={8} jolt={[TURN_AT + 0.14]} />
        </ExitFade>
        <S16DeskBack />
        <Laptop x={LAP.x} y={LAP.y} w={LAP.w} variant="new" seed="s16/lap" />
        <S16DeskMid />
        <S16Pip />
        <S16DeskFront />
        <ExitShrink x={tagC[0]} y={tagC[1]}>
          <PriceTag x={TAG.x} y={TAG.y} w={TAG.w} value="$1,099" old="$999" stringFrom={corner} rot={TAG.rot} sway={1.2} turnAt={TURN_AT} seed="s16/tag" />
        </ExitShrink>
      </XG>
    </World>
  );
};
export default S16;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
