// V2S3_tHer.tsx (lane L3, V2S3 STORY part): HER French window at MAP.W2_CUT = M (the B match with S2's dark office
// window: same spot, same size), WORLD px at the 12.98 match: the thread, TIER A with her silhouette.
// The window is S8's design (L6's S8Window in V2S8_house.tsx, roomInto / wFrontInto, scaled to M's 132.5 x 164.3; conform
// §4): the teal frame band, the closed leaves meeting on a teal stile, the transom at 62 %, the lamp-lit room (a
// LitWindow pane, the lamp's wash on the back wall, the blind rolled UP from the first frame: "lit, blind up", nothing
// moves at the cut), the standard lamp's gold shade, two shelves of books, a plant, the Juliet rail. ONE deliberate
// change: in S8 the meeting stile runs the full height and would cross her head at the push-through point (330, 742),
// so here it runs from the transom to the bottom only and the glazing above the transom is one undivided fanlight,
// where her head sits (the lane asks L6 to make S8's window the same).
// Her silhouette (plum, phone at her ear, 140 px, feet on the room's floor y 862) stands between the room and the
// front (the transom, the stile and the Juliet rail in front of her body), clipped to the pane:
//   13.12-14.56  she walks LEFT across the room (feet honest: steps = distance / step length on the 12/s clock), then
//                stands still at x 331.5 (her head centred on x 330: the push-through's point (330, 742) is inside it)
//   14.28        her free hand moves (talking)
// Tier A: the frame and her silhouette carry the shot's only full outline (INK_PX.mid, in their own deep shade: the
// clean pen draws it 3.0 px); the brightest 5 % of the frame is her pane; her plum silhouette is the darkest, clearest
// shape. Light: her room's light spills out over the Juliet rail, the window box and the wall below (+4 L*, warm:
// a flat screen lift that keeps what it lands on, two steps for its soft edge).
import React, {useId, useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {ExitSync} from '../../lib/exit';
import {Tier} from '../../lib/tier';
import {LitWindow, PoolLift, mixHex} from '../../lib/light';
import {Paint} from '../kit/canal/core';
import {HER, Person, strideFor, drawn} from '../kit/cast';
import * as MAP from '../world/map';
import {S3_BEATS, S3_HER} from './V2S3_rig';
import {Batch, line, ovalPath, domePath, lobes, leafPath, rng, P} from './V2S3_tParts';

const F = MAP.W2_CUT;
const X0 = F.x - F.w / 2; // 268.75
const X1 = F.x + F.w / 2; // 401.25
const Y0 = F.y - F.h / 2; // 702.85
const Y1 = F.y + F.h / 2; // 867.15
/** S8's frame band (TerraceRow's 7 % of the width). */
const WFR = F.w * 0.07;
/** The transom, 62 % down (S8): above it the undivided fanlight, below it the closed leaves on their meeting stile. */
const TRANSOM = Y0 + F.h * 0.62;
/** The pane as a rect [x, y, w, h] (the LitWindow; check_light's --subject box adds the frame band). */
export const HER_PANE: [number, number, number, number] = [X0, Y0, F.w, F.h];
/** Her lit pane: a lamp gold half way to the lamp's core (L* ~89, inside LitWindow's 85-92): the brightest field in
 *  the frame (the neighbours' lit panes are the plain lamp gold, L* 85), the lamp's wash (the core, L* 92) on it. */
const PANE_LIT = mixHex(CM.lamp, CM.lampCore, 0.5);
/** Her window box under the sill (map S3.windowBox). */
const BOX = MAP.S3.windowBox;

// ---------------------------------------------------------------- her pacing (film seconds)

const WALK = {t0: 13.12, t1: 14.56, from: 362, to: S3_HER.stillX} as const;
const STEP_PX = 30;
const STRIDE = strideFor(STEP_PX, S3_HER.h, 'profile');
const smooth = (k: number) => {
  const c = Math.max(0, Math.min(1, k));
  return c * c * (3 - 2 * c);
};
/** Her feet x at film t (smooth start and stop). */
export const herX = (t: number): number => WALK.from + (WALK.to - WALK.from) * smooth((t - WALK.t0) / (WALK.t1 - WALK.t0));
const herMoving = (t: number) => t > WALK.t0 && t < WALK.t1;

/** The free-hand gesture at 14.28: out and back over 0.45 s. */
const gestureAt = (t: number) => {
  const a = S3_BEATS.hand;
  return t < a || t > a + 0.45 ? 0 : Math.sin(((t - a) / 0.45) * Math.PI);
};

const HerSilhouette: React.FC = () => {
  const t = useTime();
  // the step count follows the distance walked (sampled on the 12 drawings/s clock): the feet never slide
  const tq = drawn(t, 12);
  const step = Math.abs(herX(tq) - WALK.from) / STEP_PX;
  const moving = herMoving(t);
  const x = herX(t);
  return (
    <ExitSync seed="fig/s3her">
      <Tier tier="subject" tone={CM.anchor}>
        <Person
          x={x}
          y={S3_HER.y}
          h={S3_HER.h}
          exact
          seed="s3herWin"
          traits={HER}
          model={{...HER, coat: CM.anchor, mono: CM.anchor, tote: undefined, vent: false}}
          pose="phoneEar"
          gesture={gestureAt(t)}
          view="profile"
          step={moving ? step : undefined}
          stride={STRIDE}
          ink={INK_PX.mid}
          exactFill
          noSync
        />
      </Tier>
    </ExitSync>
  );
};

// ---------------------------------------------------------------- the room behind her (S8's roomInto, lit, at M)

function roomBatch(): Batch {
  const b = new Batch();
  const fx = X0;
  const fy = Y0;
  // the lamp's wash on the back wall (the pane itself is the LitWindow under this batch)
  b.rect(CM.lampCore, fx + F.w * 0.18, fy + F.h * 0.12, F.w * 0.64, F.h * 0.46);
  // the blind rolled UP at the head of the opening
  b.rect(CM.coatOat, fx, fy, F.w, F.h * 0.06);
  // two shelves of books (right), the standard lamp's gold shade on its stand (left), a plant on the floor (left)
  for (let s2 = 0; s2 < 2; s2++) {
    const sy = fy + F.h * (0.3 + s2 * 0.18);
    b.rect(CM.line, fx + F.w * 0.55, sy, F.w * 0.4, F.h * 0.02);
    for (let bk = 0; bk < 5; bk++) b.rect([CM.brick, CM.coatMustard, CM.sage, CM.paneUnlit, CM.box][(bk + s2) % 5], fx + F.w * (0.57 + bk * 0.075), sy - F.h * 0.08, F.w * 0.055, F.h * 0.08);
  }
  b.fill(CM.coatMustard, domePath(fx + F.w * 0.2, fy + F.h * 0.32, F.w * 0.09, F.h * 0.06));
  b.rect(CM.anchor, fx + F.w * 0.195, fy + F.h * 0.32, Math.max(1.5, F.w * 0.015), F.h * 0.6);
  b.fill(CM.sage, lobes(fx + F.w * 0.02, fx + F.w * 0.3, fy + F.h, F.h * 0.3, 's8w/herplant', 3));
  return b;
}

/** The frame band round the opening (S8's, TerraceRow's teal), behind the room's glass. */
function frameBandBatch(): Batch {
  const b = new Batch();
  b.rect(CM.hero, X0 - WFR, Y0 - WFR, F.w + 2 * WFR, F.h + WFR);
  return b;
}

/** The front (S8's wFrontInto at M): the transom, the meeting stile FROM THE TRANSOM DOWN (the fanlight above is one
 *  undivided pane: the dive into her head never lands on a bar), the bottom rail, the Juliet rail over her; the frame's
 *  outline at INK_PX.mid (tier A: one closed line in the frame's own deep shade). */
function frontBatch(): Batch {
  const b = new Batch();
  const fx = X0;
  const fy = Y0;
  b.rect(CM.hero, fx + F.w * 0.48, TRANSOM, F.w * 0.04, fy + F.h - TRANSOM);
  b.rect(CM.hero, fx, TRANSOM, F.w, F.w * 0.035);
  b.rect(CM.hero, fx - WFR, fy + F.h - F.w * 0.02, F.w + 2 * WFR, F.w * 0.07);
  const ry = fy + F.h * 0.6;
  b.rect(CM.anchor, fx - F.w * 0.1, ry, F.w * 1.2, Math.max(2, F.w * 0.025));
  for (let bx = fx - F.w * 0.08; bx <= fx + F.w * 1.08; bx += F.w * 0.09) b.rect(CM.anchor, bx, ry, Math.max(1.2, F.w * 0.012), fy + F.h - ry);
  const x0 = fx - WFR;
  const x1 = fx + F.w + WFR;
  const y0 = fy - WFR;
  const y1 = fy + F.h + F.w * 0.05;
  b.ink(`M${P(x0, y0)}L${P(x1, y0)}L${P(x1, y1)}L${P(x0, y1)}Z`, INK_PX.mid);
  void line;
  return b;
}

// ---------------------------------------------------------------- her window box (the terrace's, under the sill)

/** The window box under her window: a painted trough with two calm masses of planting and a few flower clusters (no
 *  stems, dots or specks next to the subject: CRAFT §c), trailing ivy as a few hanging leaves. */
function herBoxBatch(): Batch {
  const b = new Batch();
  const top = BOX.y0 + 1;
  const r = rng('herBoxPlants');
  b.fill(CM.sage, lobes(BOX.x0 + 6, BOX.x0 + 110, top + 1, 26, 'herBoxW', 4));
  b.fill(CM.sage, lobes(BOX.x0 + 100, BOX.x1 - 6, top + 1, 16, 'herBoxE', 6));
  b.layer();
  for (const [x, y, c] of [[BOX.x0 + 22, top - 18, CM.leafRust], [BOX.x0 + 52, top - 22, CM.blossom], [BOX.x0 + 84, top - 16, CM.leafRust], [BOX.x0 + 150, top - 10, CM.blossom], [BOX.x0 + 214, top - 9, CM.box]] as [number, number, string][]) {
    b.fill(c, ovalPath(x, y, 7, 6));
  }
  b.layer();
  const hh = BOX.y1 - BOX.y0 - 2;
  b.rect(CM.line, BOX.x0, BOX.y0, BOX.x1 - BOX.x0, hh);
  b.rect(CM.anchor, BOX.x0 + 16, BOX.y1 - 2, 5, 12);
  b.rect(CM.anchor, BOX.x1 - 22, BOX.y1 - 2, 5, 12);
  for (let i = 0; i < 5; i++) {
    const tx = BOX.x0 + 24 + i * 52 + r.jitter(6);
    b.fill(CM.sage, leafPath(tx, BOX.y0 + 14 + r.range(4, 10), r.range(14, 22), 5, 90 + r.jitter(20)));
  }
  return b;
}

// ---------------------------------------------------------------- the spill (her room's light, outside)

/** Her room's light spilling out from the sill onto the Juliet rail's foot and the window box's planting under it
 *  (CRAFT §d.7: a trapezoid widening ~1.25x, +4 L*, warm): a flat SCREEN lift (it keeps the plants and the trough it
 *  lands on; an opaque spill would paint them out). It stops at the box's front: the wall below is vertical and the
 *  room's light does not fall on it. Never over the lit pane or her (lit panes stay unlit: CRAFT §d.9). */
const SPILL = {top: Y1 - 1, bottom: Y1 + 19, w0: F.w + 2 * WFR, widen: 1.25} as const;
const spillD = () => {
  const cx = F.x;
  const w1 = SPILL.w0 * SPILL.widen;
  return `M${P(cx - SPILL.w0 / 2, SPILL.top)}L${P(cx + SPILL.w0 / 2, SPILL.top)}L${P(cx + w1 / 2, SPILL.bottom)}L${P(cx - w1 / 2, SPILL.bottom)}Z`;
};
/** The screen colour of the step (~+4 L* on the box's sage and trough, warm). */
const SPILL_LIFT = '#33200C';

const HerSpill: React.FC = () => <PoolLift d={spillD()} pool={false} color={SPILL_LIFT} c={[F.x, Y1 + 12]} />;

// ---------------------------------------------------------------- the component

export const S3Her: React.FC = () => {
  const room = useMemo(roomBatch, []);
  const band = useMemo(frameBandBatch, []);
  const front = useMemo(frontBatch, []);
  const box = useMemo(herBoxBatch, []);
  const clip = 's3pane' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <Tier tier="subject" tone={CM.hero}>
        <Paint b={band} seed="s3her/band" misreg={false} />
        <LitWindow rect={HER_PANE} color={PANE_LIT} offColor={PANE_LIT} />
        <Paint b={room} seed="s3her/room" misreg={false} />
      </Tier>
      <defs>
        <clipPath id={clip} clipPathUnits="userSpaceOnUse">
          <rect x={X0} y={Y0} width={F.w} height={F.h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <HerSilhouette />
      </g>
      <Tier tier="subject" tone={CM.hero}>
        <Paint b={front} seed="s3her/front" misreg={false} />
      </Tier>
      <Tier tier="environment">
        <Paint b={box} seed="s3her/box" misreg={false} />
      </Tier>
      <HerSpill />
    </>
  );
};

export {X0 as HER_X0, X1 as HER_X1, Y0 as HER_Y0, Y1 as HER_Y1, TRANSOM as HER_TRANSOM};
