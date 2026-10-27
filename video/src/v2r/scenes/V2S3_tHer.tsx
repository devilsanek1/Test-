// V2S3_tHer.tsx (lane L3, V2S3 FAR helper): HER French window at MAP.W2_CUT (the window match with S2's W2: same spot,
// same size on the cut frame), WORLD px at the 12.98 match. The story point of the shot: S2's blinds came down, hers
// goes UP. Inside: the lamp-lit room (a standard lamp, a shelf, a picture, a rug) and HER full-figure silhouette (plum,
// phone at her ear) pacing between the two French leaves, which stand OPEN inward (her window is open); the Juliet
// rail in front; her long window box below (Pip's seat at its right end, the plants flinch when it lands at 13.10).
//   12.98  the blind is 35 % down and rolling up; fully up by ~13.08 (a small spring, settled by ~13.16)
//   13.12-14.56  she walks LEFT across the room (feet honest: steps = distance / step length), then stands at the left
//          end x 292 through 14.86, so Pip's exit leap (14.70, up-left) passes her for as few frames as possible
//   14.28  her free hand moves (talking)
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {ExitSync} from '../../lib/exit';
import {Paint} from '../kit/canal/core';
import {HER, Person, strideFor, drawn} from '../kit/cast';
import * as MAP from '../world/map';
import {S3_BEATS, S3_HER, S3_PIP} from './V2S3_rig';
import {Batch, TK, boxInto, line, rectInk, ovalPath, domePath, lobes, leafPath, rng, P, r1} from './V2S3_tParts';

const F = MAP.W2_CUT;
const X0 = F.x - F.w / 2; // 268.75
const X1 = F.x + F.w / 2; // 401.25
const Y0 = F.y - F.h / 2; // 702.85
const Y1 = F.y + F.h / 2; // 867.15
/** The open leaves' free edges (an inward-open leaf seen from outside: a narrow strip at each jamb). */
const LEAF_L = X0 + 22;
const LEAF_R = X1 - 22;
const FRAME = 7;

// ---------------------------------------------------------------- her pacing (film seconds)

const WALK = {t0: 13.12, t1: 14.56, from: 378, to: 292} as const;
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
        ink={0}
        exactFill
        noSync
      />
    </ExitSync>
  );
};

// ---------------------------------------------------------------- the room behind her (static)

function roomBatch(): Batch {
  const b = new Batch();
  const w = X1 - X0;
  // the lamp-lit walls: warm, the brightest field in the frame round the standard lamp
  b.rect(CM.lamp, X0, Y0, w, Y1 - Y0);
  b.layer();
  b.fill(CM.lampCore, ovalPath(352, 772, 70, 62));
  b.rect(CM.lampCore, X0, Y0, w, 44);
  b.layer();
  // a dado rail, the floor and a rug
  b.rect(CM.box, X0, 840, w, 3);
  b.rect(CM.lamp, X0, 843, w, Y1 - 843);
  b.rect(CM.box, 300, 852, 78, 9);
  b.rect(CM.blossom, 306, 854, 66, 3);
  // a picture high on the back wall (above her head) and a small mirror
  b.rect(CM.line, 300, 707, 30, 12);
  b.rect(CM.sage, 302.5, 709.5, 25, 7);
  b.rect(CM.line, 344, 709, 14, 10);
  b.rect(CM.paper, 346, 711, 10, 6);
  // the standard lamp at the right (she passes in front of it)
  b.rect(CM.line, 368, 760, 2.2, 96);
  b.fill(CM.line, ovalPath(369, 857, 9, 2.6));
  b.poly(CM.box, [[357, 760], [381, 760], [376, 742], [362, 742]]);
  b.rect(CM.lampCore, 362, 760, 14, 3);
  // a low shelf with books at the left, a trailing plant on it
  b.rect(CM.line, X0 + 2, 790, 40, 3);
  let bx = X0 + 4;
  const r = rng('herBooks');
  while (bx < X0 + 40) {
    const bw = r.range(3, 5.5);
    const bh = r.range(9, 15);
    b.rect(r.pick([CM.brick, CM.coatMustard, CM.sage, CM.paneUnlit, CM.blossom, CM.coatPlum]), bx, 790 - bh, bw, bh);
    bx += bw + r.range(0.5, 1.6);
  }
  for (let k = 0; k < 6; k++) b.fill(CM.sage, leafPath(X0 + 30 + k * 1.5, 796 + k * 6, 7, 3, 80 + k * 6));
  return b;
}

// ---------------------------------------------------------------- the frame, the open leaves, the Juliet rail (static)

function frameBatch(): Batch {
  const b = new Batch();
  const hero = CM.hero;
  // the open leaves: a narrow trapezoid at each jamb (the far edge a little shorter: it recedes into the room)
  const leaf = (xh: number, xf: number, seed: string) => {
    const dy = 6;
    b.poly(hero, [[xh, Y0], [xf, Y0 + dy], [xf, Y1 - dy], [xh, Y1]]);
    const inset = (k: number) => [xh + (xf - xh) * k, Y0 + dy * k] as [number, number];
    // three glass panes per leaf: the glass catches the sky (mint) and a pale streak
    const panes = [[0.06, 0.3], [0.36, 0.62], [0.68, 0.94]];
    for (const [a, c] of panes) {
      const ya = Y0 + (Y1 - Y0) * a;
      const yc = Y0 + (Y1 - Y0) * c;
      const k0 = 0.2;
      const k1 = 0.82;
      const p0 = inset(k0)[0];
      const p1 = inset(k1)[0];
      const sl = (x: number) => ((x - xh) / (xf - xh)) * dy;
      b.poly(CM.glass, [[p0, ya + sl(p0)], [p1, ya + sl(p1)], [p1, yc - sl(p1)], [p0, yc - sl(p0)]]);
      b.poly(CM.sky, [[p0, ya + sl(p0) + 4], [p1, ya + sl(p1) + 14], [p1, ya + sl(p1) + 20], [p0, ya + sl(p0) + 10]]);
    }
    void seed;
  };
  leaf(X0, LEAF_L, 'L');
  leaf(X1, LEAF_R, 'R');
  // the outer frame (teal: hers), its threshold
  b.rect(hero, X0 - FRAME, Y0 - FRAME, F.w + FRAME * 2, FRAME);
  b.rect(hero, X0 - FRAME, Y0 - FRAME, FRAME, F.h + FRAME);
  b.rect(hero, X1, Y0 - FRAME, FRAME, F.h + FRAME);
  b.rect(hero, X0 - FRAME, Y1 - 3, F.w + FRAME * 2, 5);
  b.layer();
  // the Juliet rail (plum iron): top rail, bottom rail, balusters, a band of rings
  const top = 806;
  const bot = Y1 + 1;
  b.rect(CM.anchor, X0 - 12, top - 2, F.w + 24, 4);
  b.rect(CM.anchor, X0 - 10, bot - 3, F.w + 20, 3);
  b.rect(CM.anchor, X0 - 10, top + 14, F.w + 20, 2);
  for (let x = X0 - 8; x <= X1 + 8; x += 10.6) b.rect(CM.anchor, x - 0.8, top, 1.6, bot - top);
  b.fill(CM.anchor, ovalPath(X0 - 12, top - 1, 3.6, 3.6));
  b.fill(CM.anchor, ovalPath(X1 + 12, top - 1, 3.6, 3.6));
  let rings = '';
  for (let x = X0 - 3; x < X1 + 4; x += 10.6) rings += `M${P(x + 5.3, top + 3)}A${r1(4.2)} ${r1(4.6)} 0 1 0 ${P(x + 5.31, top + 3)}`;
  b.ink(rings, 1.1, CM.anchor);
  b.layer();
  // ink: the frame (her line is the strongest on the terrace), the leaves' edges, the rail
  b.ink(rectInk(X0 - FRAME, Y0 - FRAME, F.w + FRAME * 2, F.h + FRAME, {seed: 'herFrame', over: 'small', open: 0.15}), TK.her);
  b.ink(line(LEAF_L, Y0 + 6, LEAF_L, Y1 - 6, {seed: 'leafL', over: 'none'}) + line(LEAF_R, Y0 + 6, LEAF_R, Y1 - 6, {seed: 'leafR', over: 'none'}), TK.detail);
  b.ink(line(X0 - 14, top - 1, X1 + 14, top - 1, {seed: 'jrail', over: 'small'}), TK.detail);
  return b;
}

// ---------------------------------------------------------------- the blind (rolling UP) and the box

/** The blind's bottom edge at film t: 35 % down at the match, up by ~13.08 with a small spring. */
export const blindBottom = (t: number): number => {
  const up = Y0 + 9;
  const start = Y0 + F.h * 0.35;
  const t0 = 12.94;
  if (t <= t0) return start;
  const k = (t - t0) / 0.14;
  if (k < 1) return start + (up - 4 - start) * (1 - Math.pow(1 - k, 2.2));
  // overshoot 4 px past the roller, then settle (a damped spring)
  const d = t - (t0 + 0.14);
  return up - 4 * Math.exp(-d * 18) * Math.cos(d * 32);
};

function blindInto(b: Batch, t: number) {
  const yb = blindBottom(t);
  // the roller box over the head of the opening, then the fabric and its bottom bar with a pull ring
  if (yb > Y0 + 6) {
    b.rect(CM.coatOat, X0, Y0, F.w, yb - Y0);
    b.rect(CM.stoneShade, X0, yb - 3, F.w, 3);
    b.rect(CM.line, X0 + 2, yb, F.w - 4, 3.4);
    b.rect(CM.line, F.x - 0.7, yb + 3, 1.4, 9);
    b.fill(CM.line, ovalPath(F.x, yb + 13.5, 2.6, 2.6));
  }
  b.rect(CM.coatOat, X0 - 2, Y0 - 1, F.w + 4, 9);
  b.rect(CM.stoneShade, X0 - 2, Y0 + 6, F.w + 4, 2);
}

function herBoxInto(b: Batch, t: number) {
  const box = MAP.S3.windowBox;
  // the plants flinch when Pip lands on the box's right end (13.10): a damped shake, strongest near the seat
  const d = t - S3_BEATS.pipLand;
  const fl = d > 0 && d < 0.7 ? 5 * Math.sin(d * 34) * Math.exp(-d * 7) : 0;
  boxInto(b, box.x0, box.x1, box.y0, box.y1 - box.y0 - 2, 'herBox', {trough: CM.line, low: [MAP.S3.pipSeat.x - 42, MAP.S3.pipSeat.x + 48], flinch: fl});
  // two brackets under the trough and its plank lines
  b.layer();
  b.rect(CM.anchor, box.x0 + 16, box.y1 - 2, 5, 12);
  b.rect(CM.anchor, box.x1 - 22, box.y1 - 2, 5, 12);
  b.ink(line(box.x0, box.y0 + 1, box.x1, box.y0 + 1.5, {seed: 'boxTop', over: 'small'}) + line(box.x0 + 2, box.y0 + 14, box.x1 - 2, box.y0 + 14, {seed: 'boxMid', over: 'none'}), TK.detail);
  void S3_PIP;
}

// ---------------------------------------------------------------- the component

export const S3Her: React.FC = () => {
  const t = useTime();
  const room = useMemo(roomBatch, []);
  const frame = useMemo(frameBatch, []);
  const blind = new Batch();
  blindInto(blind, t);
  const box = new Batch();
  herBoxInto(box, t);
  return (
    <>
      <Paint b={room} seed="s3her/room" misreg={false} />
      <HerSilhouette />
      <Paint b={blind} seed="s3her/blind" misreg={false} />
      <Paint b={frame} seed="s3her/frame" />
      <Paint b={box} seed="s3her/box" />
    </>
  );
};

export {X0 as HER_X0, X1 as HER_X1, Y0 as HER_Y0, Y1 as HER_Y1, domePath, lobes};
