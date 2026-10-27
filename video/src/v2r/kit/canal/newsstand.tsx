// canal/newsstand.tsx: S2's newsstand on our towpath (TREATMENT §5 S2): a small London news kiosk cut by the left
// edge, a striped awning, a counter stacked with folded papers (no legible print: squiggle lines only), a rack of
// magazines in many colours, a hot-water urn with its steam (life), a clock. The A-board TOLD THE BBC is K3's
// (StatementBoard, L5): the kiosk leaves it its spot (map S2.aBoard) and a newsagent slot beside the counter.

import React, {useMemo} from 'react';
import {CM, INK_PX} from '../../palette';
import {line, rect as rectInk, textLines} from '../../../lib/sketch';
import {Batch, Paint, P, rng, ovalPath, domePath} from './core';
import {Puffs} from './life';
import {CastSlot, PersonSlot} from './slots';

export type NewsstandProps = {
  /** Kiosk box: x0..x1 (x0 usually off the left edge), roof y and ground y. */
  x0: number;
  x1: number;
  top: number;
  ground: number;
  seed?: string;
  /** The newsagent (a slot; K4 renders). Omit = nobody at the counter. */
  agent?: PersonSlot;
};

export const Newsstand: React.FC<NewsstandProps> = ({x0, x1, top, ground, seed = 'news', agent}) => {
  const W = x1 - x0;
  const H = ground - top;
  const b = useMemo(() => {
    const b = new Batch();
    const r = rng(seed);
    // the kiosk body (painted sage), a darker plinth, the service opening on the right side
    b.rect(CM.sage, x0, top + H * 0.12, W, H * 0.88);
    b.rect(CM.anchor, x0, ground - H * 0.08, W, H * 0.08);
    const ox0 = x0 + W * 0.18;
    const ox1 = x1 - W * 0.08;
    const oy0 = top + H * 0.22;
    const oy1 = top + H * 0.58;
    b.rect(CM.lamp, ox0, oy0, ox1 - ox0, oy1 - oy0);
    b.rect(CM.lampCore, ox0 + 6, oy0 + 6, (ox1 - ox0) * 0.6, (oy1 - oy0) * 0.45);
    // magazines on the back wall (a colourful rack)
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < Math.floor((ox1 - ox0) / 22); k++) {
        const c = r.pick([CM.box, CM.coatMustard, CM.sage, CM.blossom, CM.paper, CM.brick, CM.coatSlate, CM.leafGold]);
        b.rect(c, ox0 + 6 + k * 22, oy0 + 10 + row * ((oy1 - oy0 - 20) / 3), 17, (oy1 - oy0 - 30) / 3);
      }
    }
    // the counter with stacks of folded papers (squiggle lines, never legible)
    const cy = oy1;
    b.rect(CM.line, x0, cy, W + 12, H * 0.05);
    b.layer();
    let lines = '';
    for (let k = 0; k < 3; k++) {
      const px = x0 + W * 0.22 + k * W * 0.24;
      const pw = W * 0.2;
      b.rect(CM.paper, px, cy - 26, pw, 26);
      b.rect(CM.stucco, px, cy - 8, pw, 8);
      lines += textLines(px + 4, cy - 20, pw - 8, {seed: `${seed}/tl${k}`, n: 2, gap: 7});
    }
    b.ink(lines, INK_PX.hair, CM.paneUnlit);
    // papers hanging on clips down the front (a column of folded front pages)
    for (let k = 0; k < 3; k++) {
      const py = cy + H * 0.08 + k * H * 0.12;
      b.rect(CM.paper, x1 - W * 0.42, py, W * 0.34, H * 0.1);
      b.rect(r.pick([CM.box, CM.coatMustard, CM.brick]), x1 - W * 0.42, py, W * 0.34, H * 0.022);
    }
    // the striped awning
    b.layer();
    const aw0 = x0 - 10;
    const aw1 = x1 + 26;
    const ay = top + H * 0.12;
    const n = Math.max(4, Math.round((aw1 - aw0) / 26));
    for (let k = 0; k < n; k++) {
      const a = aw0 + ((aw1 - aw0) * k) / n;
      const c = aw0 + ((aw1 - aw0) * (k + 1)) / n;
      b.poly(k % 2 ? CM.paper : CM.box, [[a, top], [c, top], [c + 4, ay], [a + 4, ay]]);
      b.fill(k % 2 ? CM.paper : CM.box, domePath((a + c) / 2 + 4, ay, (c - a) / 2, -8));
    }
    b.rect(CM.anchor, aw0, top - 8, aw1 - aw0, 8);
    // the urn on the counter's end and a clock on the side
    const ux = x1 - 26;
    b.rect(CM.stoneShade, ux - 16, cy - 46, 32, 46);
    b.fill(CM.stoneShade, domePath(ux, cy - 46, 16, 10));
    b.rect(CM.anchor, ux + 14, cy - 18, 8, 4);
    b.fill(CM.paper, ovalPath(x0 + W * 0.5, top + H * 0.17, 12, 12));
    b.ink(`M${P(x0 + W * 0.5, top + H * 0.17)}l0 -8M${P(x0 + W * 0.5, top + H * 0.17)}l6 2`, INK_PX.hair);
    b.ink(rectInk(x0, top + H * 0.12, W, H * 0.88, {seed: `${seed}/k`, over: 'small', open: 0.3}) + line(ox0, oy0, ox1, oy0, {seed: `${seed}/o`, over: 'small'}), INK_PX.mid);
    return b;
  }, [x0, x1, top, ground, seed]);
  return (
    <>
      <Paint b={b} seed={`news/${seed}`} />
      <Puffs x={x1 - 26} y={top + H * 0.58 - 58} seed={`${seed}/urn`} kind="steam" scale={0.55} drift={-18} ceil={600} />
      {agent ? <CastSlot s={agent} /> : null}
    </>
  );
};
