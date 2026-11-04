// V2S1 helper (lane L1): PIP on its mooring bollard (THROUGHLINE §1.6, §3; conform_L1 §1, §2, §7; map S1_BOLLARD).
//   the bollard  a cast-iron mooring bollard on the landing, its top at (700, 1235), ~48 px wide, ~50 px tall, slate
//                (never the plum anchor), tier C; drawn at EVERY t (frame 0 and the loop underlay: a pale shape).
//   Pip          ABSENT at t < 0 (S8's Pip owns the loop seam: drawing ours too would show two). From t 0 its tinted line
//                draws on (0.30 s) and its fills are paper until the flood reaches its seat (~0.15 s), then its colour
//                (`paint="look"`): never a full-colour Pip at f0. Size 100, facing back (we look over its shoulder at
//                her), tier B (kit default `support` with its lines). Head follows her from 1.25; its ONE reaction is
//                EARS-COVER on "life" 4.98, strengthened here so it reads from behind at phone size as a whole-
//                silhouette change (hunched lower, ears swung down over the face, the trunk tucked); sits 5.55. NO hop:
//                it stays on its bollard and the push-through sweeps it out (5.95-6.25).
// Light (RIG_CANAL): the bollard's contact strip and cast shadow on the landing (right, a little toward us), its form
// shade on the right; Pip's contact strip on the bollard's top.
import React from 'react';
import {Fill} from '../../lib/Fill';
import {CastShadow, ContactShadow, FormShade, ShadowLayer} from '../../lib/light';
import {Tier} from '../../lib/tier';
import {useTime} from '../../lib/time';
import {CM} from '../../v2r/palette';
import {PipTrack} from '../../v2r/kit/pip';
import {POSES} from '../../v2r/kit/pip/poses';
import {C, S1_PIP, floodAt} from './V2S1_clock';
import {useSwitches} from './switches';
import {Look} from '../../lib/exit';
import {dark} from './darks';

/** The bollard (screen px): top centre = Pip's seat. */
export const S1_PIP_BOLLARD = {x: S1_PIP.seat[0], top: S1_PIP.seat[1], w: 48, h: 50} as const;

const B = S1_PIP_BOLLARD;
const BASE = B.top + B.h;
/** The bollard's silhouette: a squat cast-iron post (waisted), its rounded cap lip a touch wider than the body. */
const bollardBody = (): string => {
  const {x, top, w} = B;
  const bw = w * 0.4; // half the body at the base
  const nw = w * 0.33; // half at the waist
  return `M${x - bw} ${BASE}L${x - nw} ${top + 16}Q${x - nw} ${top + 11} ${x - w * 0.42} ${top + 9}L${x + w * 0.42} ${top + 9}Q${x + nw} ${top + 11} ${x + nw} ${top + 16}L${x + bw} ${BASE}Z`;
};
const bollardCap = (): string => {
  const {x, top, w} = B;
  const hw = w / 2;
  return `M${x - hw} ${top + 9}Q${x - hw} ${top} ${x} ${top}Q${x + hw} ${top} ${x + hw} ${top + 9}Z`;
};
const BODY = bollardBody();
const CAP = bollardCap();
/** Its shadows land with the flood at its spot (frame 0: pale shapes only). */
const LIGHT_AT = floodAt(B.x, BASE);

/** EARS-COVER, strengthened for a back view at phone size (the kit's pose reads small from behind). */
const EARS_COVER = {...POSES.earsCover, hunch: 0.72, headDrop: 8.5, earDroopA: 72, earDroopB: 72, earSwingA: 150, earSwingB: 150, earFoldA: 0.5, earFoldB: 0.5, trunkCurl: 1.55, scarfLift: 0.4};

/** The bollard's contact strip and cast shadow on the landing. (the look test) They fall on the seated slot's group
 *  (the landing), so S1World draws them in the pip group's `under` (outside its mottle: a mottled group is isolated);
 *  the same place in the drawing order as v2's (first in the pip group). */
export const S1PipShadows: React.FC = () => (
  <ShadowLayer>
    <ContactShadow x={B.x} y={BASE} w={B.w * 0.84} at={LIGHT_AT} />
    <CastShadow x={B.x} y={BASE} w={B.w * 0.8} h={B.h} at={LIGHT_AT} />
  </ShadowLayer>
);

const Bollard: React.FC = () => {
  // (the look test's darks) the cast-iron bollard dark iron
  const {darks} = useSwitches();
  const iron = darks ? dark('iron') : CM.coatSlate;
  return (
    <>
      <Tier tier="environment">
        <Fill d={BODY} color={iron} seed="s1pipBollardBody" />
        <Fill d={CAP} color={iron} seed="s1pipBollardCap" />
      </Tier>
      <FormShade d={BODY} kind="band" at={LIGHT_AT} />
    </>
  );
};

/** Pip and its bollard. The `pip` slot (drawn after the steps). */
export const S1Pip: React.FC = () => {
  const t = useTime();
  const sw = useSwitches();
  return (
    <>
      <Bollard />
      {t >= S1_PIP.from && !sw.pipHidden ? (
        <>
          <ShadowLayer>
            <ContactShadow x={B.x} y={B.top + 1} w={B.w * 0.9} h={6} at={LIGHT_AT} />
          </ShadowLayer>
          {/* (the look test's no-outline switch: Pip draws no line, B's same-hue line retired) */}
          <Look ink={!sw.lineOff}>
            <PipTrack
              x={B.x}
              y={B.top}
              size={S1_PIP.size}
              facing="back"
              seed="pipS1"
              paint="look"
              tier="support"
              keys={[
                {t: S1_PIP.from, draw: S1_PIP.drawDur},
                // no head-follow: the target key turned Pip's whole body (critic G4); Pip watches the water, steady
                {t: C.life, pose: EARS_COVER, dur: 0.1},
                {t: 5.55, pose: 'sit', dur: 0.25},
              ]}
            />
          </Look>
        </>
      ) : null}
    </>
  );
};

/** (the look test: a quiet "find Pip", owner 2026-10-29: decision 5 (b); DIRECTION rule 2; LAYOUT §8.2 "Pip's spot")
 *  Pip hidden IN the bay tree on our bank (the near frame, plane -2: it rides the tree's float), sitting on a branch
 *  between the crown's back and front lobes, its head and ears found among the leaves on a second look, its body behind
 *  the front lobe; >= 250 px from her and off her eye path (the row goes west along the far towpath, her look back goes
 *  right to W); nearer than the waterline bollard, so its size per metre is at least as big (100 px, mostly covered).
 *  Facing back: it watches her across the water. The same beats as on the bollard (drawn with the flood, ears-cover on
 *  "life", sits at 5.55). Drawn by V2S1_fore's planter between the lobes. */
export const S1_PIP_TREE = {seat: [184, 1446] as [number, number], size: 100} as const;
export const S1PipInTree: React.FC<{seat?: [number, number]}> = ({seat = S1_PIP_TREE.seat}) => {
  const t = useTime();
  const sw = useSwitches();
  if (t < S1_PIP.from) return null;
  const [x, y] = seat;
  return (
    <Look ink={!sw.lineOff}>
      <PipTrack
        x={x}
        y={y}
        size={S1_PIP_TREE.size}
        facing="back"
        seed="pipS1tree"
        paint="look"
        tier="support"
        keys={[
          {t: S1_PIP.from, draw: S1_PIP.drawDur},
          {t: C.life, pose: EARS_COVER, dur: 0.1},
          {t: 5.55, pose: 'sit', dur: 0.25},
        ]}
      />
    </Look>
  );
};
