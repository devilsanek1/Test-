// S16 (lane L1-opening): CLOSE-UP cut-in on the tag, 38.84-41.15 ("... on your next laptop's price tag").
// The tag (the subject, w 460, centred on S15's x axis) hangs by its string from the corner of THE laptop (the listing's
// laptop, cut by the left edge, below the caption band); the lamp (its shade cut by the left edge) pours its golden pool
// on the desk under the tag. At 39.70 (t 0.86) the tag turns over and shows the data center drawn on its back (the
// like-pop at 39.88 lands as the back appears). Camera: HOLD, breathing in 1.5 % on the tag. The engine un-builds the
// panel over its last 0.3 s into O1's bare-line frame 0 (the loop): every piece is kit Ink / Fill, and the tag (raw
// price text, the back's drawing) shrinks as one group.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {ExitShrink} from '../../../lib/exit';
import {blob, hline, line} from '../../../lib/sketch';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, Lamp, Laptop, laptopGeo, Mug, PriceTag, type Pt} from '../kit';

const DUR = 41.15 - 38.84;
const TURN_AT = 39.7 - 38.84;
/** The desk's back edge (the wall above it). */
const DESK_Y = 1250;
/** THE laptop: hinge centre, lid width (cut by the left edge). */
const LAP = {x: 30, y: 1330, w: 520};
/** The tag: S15's tag at 1.275x, centred on x 540. */
const TAG = {x: 310, y: 1010, w: 460, rot: -8};
const POOL = {cx: 500, cy: 1356, rx: 440, ry: 92};

const Desk: React.FC = () => (
  <>
    <Fill rect={[-60, DESK_Y, 1200, 800]} color={EMBER.desk} offset={false} />
    <Fill d={blob(POOL.cx, POOL.cy, POOL.rx, POOL.ry, {seed: 's16/pool1', wobble: 0.02})} color={EMBER.ring} offset={false} />
    <Fill d={blob(POOL.cx - 8, POOL.cy - 4, POOL.rx * 0.6, POOL.ry * 0.6, {seed: 's16/pool2', wobble: 0.025})} color={EMBER.core} offset={false} />
    <Ink d={hline(-60, 1140, DESK_Y, {seed: 's16/deskE', over: 'structural'})} width={3.4} />
    <Ink d={line(640, DESK_Y + 300, 980, DESK_Y + 306, {seed: 's16/gr1', over: [0, 0]}) + line(80, DESK_Y + 520, 420, DESK_Y + 527, {seed: 's16/gr2', over: [0, 0]})} width={2.2} />
  </>
);

const S16: React.FC = () => {
  const t = useTime();
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  const g = laptopGeo(LAP.x, LAP.y, LAP.w);
  // the string ties on at the lid's top-right corner
  const corner: Pt = [g.lid[1][0] - 6, g.lid[1][1] + 10];
  const tagC: Pt = [TAG.x + TAG.w * 0.55, TAG.y + TAG.w * 0.25];
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), tagC[0], tagC[1])}>
        <Desk />
        <Lamp pose={{base: [-170, 1250], elbow: [-60, 650], head: [92, 790], rot: 32, scale: 1.25}} seed="s16/lamp" />
        <Mug x={808} top={1300} w={104} seed="s16/mug" />
        <Laptop x={LAP.x} y={LAP.y} w={LAP.w} variant="new" seed="s16/lap" />
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
