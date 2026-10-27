// O1_life (lane L1-opening, G5b pilot): more of the HOOK's dressing and idle life, shared by O1 and S15 through
// O1_dress / O1_set. Fills the holes the WIP checkpoint left (owner: "way too empty"; LIFE_AND_DENSITY §0: a field made
// of things, no hole bigger than the caption band, stacked surfaces):
//   room plane   a line of instant photos pegged on a cord (top-left wall, above the band, each sways on its peg), a
//                paper star lantern hung from the attic slope (lit, turning slowly), a wall calendar right of the window,
//                mittens and a stack of letters on the left of the desk, a radio at the right edge, an open planner cut
//                by the bottom-right corner (under the hand).
//   far plane    a snow ridge on the outside sill, icicles under the window's lintel (dripping), a neighbour shovelling
//                the pavement (a 4-drawing loop with a snow puff on each throw).
// Build: every `at` sits in -0.14 .. -0.02 so the ink is mid-draw on frame 0 and no fill lands before t = 0 (FILL_LAG),
// so t < 0 stays the bare-line state the loop reveals. Dressing stays in the room's warm family (never the hero orange or
// the blue pop) and out of the caption band (y 290-600).
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, circle, line, polyPath, roundRect, textLines, wire, wirePoint} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {b, EMBER, fillAt, Icicles, Pop, RoofNeighbour, Show, SnowSill, sway, W, type At, type Pt} from '../kit';

// ---------------------------------------------------------------- the wall

/** Instant photos pegged on a sagging cord (top-left wall, above the caption band); each sways about its peg. */
export const PhotoLine: React.FC<{x0: number; y0: number; x1: number; y1: number; sag?: number; at?: At}> = ({x0, y0, x1, y1, sag = 16, at}) => {
  const t = useTime();
  const cord = wire(x0, y0, x1, y1, sag, {seed: 'o1/photocord'});
  const pics: {u: number; w: number; pic: 'sea' | 'hill' | 'sun' | 'pip'; rot: number}[] = [
    {u: 0.16, w: 40, pic: 'sea', rot: -5},
    {u: 0.42, w: 44, pic: 'pip', rot: 3},
    {u: 0.68, w: 40, pic: 'hill', rot: -2},
    {u: 0.9, w: 38, pic: 'sun', rot: 6},
  ];
  return (
    <>
      <Ink d={cord} at={at} width={W.hair} />
      {[[x0, y0], [x1, y1]].map(([x, y], i) => (
        <Fill key={`n${i}`} d={circle(x, y, 4)} color={EMBER.beam} at={fillAt(at)} offset={false} />
      ))}
      {pics.map((p, i) => {
        const [px, py] = wirePoint(x0, y0, x1, y1, sag, p.u);
        const h = p.w * 1.2;
        const a = p.rot + sway(t, 2.2, 3.1 + i * 0.37, i * 1.3);
        const x = px - p.w / 2;
        const y = py + 5;
        const m = p.w * 0.1;
        const iw = p.w - 2 * m;
        const ih = h * 0.68;
        let pic: React.ReactNode;
        const pa = fillAt(at, 0.06 + i * 0.02);
        if (p.pic === 'sea') {
          pic = (
            <>
              <Fill rect={[x + m, y + m, iw, ih]} color={EMBER.skyLow} at={pa} offset={false} />
              <Fill rect={[x + m, y + m + ih * 0.6, iw, ih * 0.4]} color={EMBER.sky} at={pa} offset={false} />
            </>
          );
        } else if (p.pic === 'hill') {
          pic = (
            <>
              <Fill rect={[x + m, y + m, iw, ih]} color={EMBER.ring} at={pa} offset={false} />
              <Fill d={`M${x + m} ${y + m + ih}L${x + m} ${y + m + ih * 0.6}Q${x + m + iw * 0.4} ${y + m + ih * 0.2} ${x + m + iw} ${y + m + ih * 0.55}L${x + m + iw} ${y + m + ih}Z`} color={EMBER.leaf} at={pa} offset={false} />
            </>
          );
        } else if (p.pic === 'sun') {
          pic = (
            <>
              <Fill rect={[x + m, y + m, iw, ih]} color={EMBER.books[1]} at={pa} offset={false} />
              <Fill d={circle(x + m + iw * 0.5, y + m + ih * 0.45, iw * 0.24)} color={EMBER.core} at={pa} offset={false} />
            </>
          );
        } else {
          // a friend's photo: a lilac blob with two ears (Pip, a nod to the mascot)
          pic = (
            <>
              <Fill rect={[x + m, y + m, iw, ih]} color={EMBER.reveal} at={pa} offset={false} />
              <Fill d={blob(x + m + iw * 0.5, y + m + ih * 0.66, iw * 0.24, ih * 0.26, {seed: 'o1/ppb'}) + blob(x + m + iw * 0.26, y + m + ih * 0.46, iw * 0.15, ih * 0.17, {seed: 'o1/ppe1'}) + blob(x + m + iw * 0.74, y + m + ih * 0.46, iw * 0.15, ih * 0.17, {seed: 'o1/ppe2'})} color="#A983C9" at={pa} offset={false} />
            </>
          );
        }
        return (
          <XG key={i} m={mat.about(mat.rotate(a), px, py)}>
            <Fill rect={[x, y, p.w, h]} color={EMBER.card} at={fillAt(at, 0.03 + i * 0.02)} seed={`o1/pol${i}`} />
            {pic}
            <Ink d={`M${x} ${y}h${p.w}v${h}h${-p.w}Z`} at={b(at, 0.02 + i * 0.02)} width={W.hair} />
            {/* the peg */}
            <Fill rect={[px - 3, py - 7, 6, 15]} color={EMBER.books[0]} at={fillAt(at, 0.08)} offset={false} />
          </XG>
        );
      })}
    </>
  );
};

/** A paper star lantern hung from the attic slope on a cord: lit (a warm core and a flat halo step on the slope),
 *  swaying slowly about the hook and turning (its points narrow and widen on drawn poses, 12 / s). */
export const StarLantern: React.FC<{x: number; hookY: number; cy: number; r?: number; at?: At; litAt?: number}> = ({x, hookY, cy, r = 34, at, litAt = 0.4}) => {
  const t = useTime();
  const a = sway(t, 2.4, 3.8, 0.4);
  const turn = Math.floor(t * 12) / 12;
  const sq = 0.78 + 0.22 * Math.cos(turn * 1.3); // the star's turn: x-squash
  const pts: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.48 : r;
    pts.push([x + rr * Math.cos(ang) * sq, cy + rr * Math.sin(ang)]);
  }
  const star = polyPath(pts);
  const inner: Pt[] = pts.map(([px, py], i) => (i % 2 ? [px, py] : [x + (px - x) * 0.5, cy + (py - cy) * 0.5]));
  const lit = t >= litAt;
  return (
    <XG m={mat.about(mat.rotate(a), x, hookY)}>
      <Ink d={line(x, hookY, x, cy - r, {over: [0, 0], seed: 'o1/starcord'})} at={at} width={W.hair} />
      {lit ? (
        <Pop at={litAt} x={x} y={cy} dur={0.14} from={0.3}>
          <path d={blob(x, cy, r * 1.7, r * 1.6, {seed: 'o1/starhalo'})} fill={EMBER.ring} />
        </Pop>
      ) : null}
      <Fill d={star} color={lit ? EMBER.core : EMBER.books[0]} at={fillAt(at)} offset={false} />
      <Fill d={polyPath(inner)} color={lit ? EMBER.ring : EMBER.books[1]} at={fillAt(at, 0.04)} offset={false} />
      <Ink d={star} at={b(at, 0.02)} width={W.far} />
      {/* the tassel */}
      <Ink d={line(x, cy + r * 0.48, x, cy + r + 18, {over: [0, 0], seed: 'o1/startas'})} at={b(at, 0.06)} width={W.hair} />
      <Fill d={blob(x, cy + r + 22, 4, 7, {seed: 'o1/startas2'})} color={EMBER.beam} at={fillAt(at, 0.08)} offset={false} />
    </XG>
  );
};

// ---------------------------------------------------------------- the desk

/** A pair of knitted mittens (a cuff rib, a band, a snowflake dot), cut by the left edge. */
export const Mittens: React.FC<{x: number; y: number; at?: At}> = ({x, y, at}) => {
  const one = (cx: number, cy: number, rot: number, k: number, col: string) => {
    const body = `M${cx - 30} ${cy + 34}L${cx - 32} ${cy - 10}Q${cx - 30} ${cy - 46} ${cx} ${cy - 48}Q${cx + 30} ${cy - 46} ${cx + 30} ${cy - 10}L${cx + 30} ${cy + 34}Z`;
    const thumb = `M${cx + 28} ${cy + 4}Q${cx + 52} ${cy - 2} ${cx + 48} ${cy - 26}Q${cx + 44} ${cy - 36} ${cx + 28} ${cy - 22}Z`;
    const cuff = `M${cx - 32} ${cy + 30}h64v26h-64Z`;
    const ribs = [0, 1, 2, 3, 4, 5].map((i) => line(cx - 24 + i * 10, cy + 34, cx - 24 + i * 10, cy + 52, {over: [0, 0], seed: `o1/rib${k}${i}`})).join('');
    return (
      <XG m={mat.about(mat.rotate(rot), cx, cy)}>
        <Fill d={thumb} color={col} at={fillAt(at, 0.02)} seed={`o1/mt${k}`} />
        <Fill d={body} color={col} at={fillAt(at)} seed={`o1/mb${k}`} />
        <Fill rect={[cx - 31, cy - 4, 61, 12]} color={EMBER.card} at={fillAt(at, 0.05)} offset={false} />
        <Fill d={cuff} color={EMBER.beam} at={fillAt(at, 0.04)} seed={`o1/mc${k}`} />
        <Fill d={circle(cx, cy - 24, 5)} color={EMBER.card} at={fillAt(at, 0.07)} offset={false} />
        <Ink d={body + thumb + cuff} at={b(at, k * 0.02)} width={W.far} />
        <Ink d={ribs} at={b(at, 0.06)} width={W.hair} />
      </XG>
    );
  };
  return (
    <>
      {one(x, y, -74, 0, EMBER.books[4])}
      {one(x + 54, y + 22, -98, 1, EMBER.books[6])}
    </>
  );
};

/** Two letters and a postcard, fanned (stamps, address lines). */
export const Letters: React.FC<{x: number; y: number; at?: At}> = ({x, y, at}) => {
  const env = (cx: number, cy: number, w: number, h: number, rot: number, k: number, col: string) => (
    <XG key={k} m={mat.about(mat.rotate(rot), cx, cy)}>
      <Fill rect={[cx - w / 2, cy - h / 2, w, h]} color={col} at={fillAt(at, k * 0.03)} seed={`o1/env${k}`} />
      <Fill rect={[cx + w / 2 - 24, cy - h / 2 + 7, 16, 19]} color={k === 1 ? EMBER.skyLow : EMBER.books[4]} at={fillAt(at, 0.06 + k * 0.02)} offset={false} />
      <Ink d={`M${cx - w / 2} ${cy - h / 2}h${w}v${h}h${-w}Z`} at={b(at, k * 0.03)} width={W.hair} />
      <Ink d={textLines(cx - w * 0.3, cy + h * 0.02, w * 0.46, {n: 2, gap: 11, seed: `o1/addr${k}`, heading: false})} at={b(at, 0.08 + k * 0.02)} width={1.4} />
      {k === 0 ? <Ink d={`M${cx - w / 2} ${cy - h / 2}L${cx} ${cy + 2}L${cx + w / 2} ${cy - h / 2}`} at={b(at, 0.05)} width={W.hair} /> : null}
    </XG>
  );
  return (
    <>
      {env(x, y, 118, 70, -9, 0, EMBER.card)}
      {env(x + 12, y + 26, 112, 66, 6, 1, EMBER.paper)}
      {env(x - 8, y + 52, 104, 62, -3, 2, EMBER.ring)}
    </>
  );
};

/** A little radio at the right edge: a speaker grille, a dial with a needle, an antenna. */
export const Radio: React.FC<{x: number; y: number; w?: number; at?: At}> = ({x, y, w = 128, at}) => {
  const h = w * 0.66;
  const body = roundRect(x, y - h, w, h, 12);
  const grille = [0, 1, 2, 3, 4].map((i) => line(x + 14, y - h + 22 + i * 10, x + w * 0.5, y - h + 22 + i * 10, {over: [0, 0], seed: `o1/gr${i}`})).join('');
  return (
    <>
      <Ink d={line(x + w * 0.78, y - h, x + w * 0.98, y - h - 96, {over: [0, 0], seed: 'o1/ant'})} at={b(at, 0.06)} width={W.far} />
      <Fill d={body} color={EMBER.books[2]} at={fillAt(at)} seed="o1/radio" />
      <Fill d={roundRect(x + 8, y - h + 12, w * 0.5, h - 26, 6)} color={EMBER.books[3]} at={fillAt(at, 0.03)} offset={false} />
      <Fill d={circle(x + w * 0.76, y - h * 0.52, w * 0.13)} color={EMBER.card} at={fillAt(at, 0.05)} offset={false} />
      <Fill rect={[x + 10, y - 6, w - 20, 8]} color={EMBER.beam} at={fillAt(at, 0.06)} offset={false} />
      <Ink d={body + circle(x + w * 0.76, y - h * 0.52, w * 0.13)} at={at} width={W.far} />
      <Ink d={grille} at={b(at, 0.04)} width={1.4} color={EMBER.books[2]} />
      <Ink d={line(x + w * 0.76, y - h * 0.52, x + w * 0.83, y - h * 0.62, {over: [0, 0], seed: 'o1/needle'})} at={b(at, 0.08)} width={W.hair} />
    </>
  );
};

/** An open planner cut by the bottom-right corner: two pages of lines, a ribbon, a pen across it. */
export const Planner: React.FC<{x: number; y: number; at?: At}> = ({x, y, at}) => {
  const cover = polyPath([[x - 14, y - 12], [x + 420, y - 40], [x + 452, y + 330], [x - 4, y + 356]]);
  const L = polyPath([[x, y], [x + 200, y - 14], [x + 214, y + 318], [x + 10, y + 334]]);
  const R = polyPath([[x + 200, y - 14], [x + 406, y - 28], [x + 432, y + 302], [x + 214, y + 318]]);
  const lines = [0, 1, 2, 3, 4, 5].map((i) => line(x + 24, y + 44 + i * 34 - i * 0.6, x + 176, y + 34 + i * 34, {over: [0, 0], seed: `o1/pl${i}`}) + line(x + 230, y + 24 + i * 34, x + 380, y + 14 + i * 34, {over: [0, 0], seed: `o1/pr${i}`})).join('');
  return (
    <>
      <Fill d={cover} color={EMBER.books[3]} at={fillAt(at)} seed="o1/plc" />
      <Fill d={L} color={EMBER.card} at={fillAt(at, 0.02)} seed="o1/pll" />
      <Fill d={R} color={EMBER.card} at={fillAt(at, 0.03)} seed="o1/plr" />
      <Fill rect={[x + 236, y + 70, 70, 24]} color={EMBER.ring} at={fillAt(at, 0.06)} offset={false} />
      <Ink d={L + R} at={at} width={W.mid} />
      <Ink d={lines} at={b(at, 0.06)} width={1.4} />
      {/* the ribbon over the gutter */}
      <Fill d={polyPath([[x + 204, y - 14], [x + 216, y - 15], [x + 232, y + 200], [x + 220, y + 204]])} color={EMBER.books[4]} at={fillAt(at, 0.08)} offset={false} />
    </>
  );
};

// ---------------------------------------------------------------- the far plane (behind glass, fill only)

/** A clump of snow slides off the eaves above the window at `t0` and drops past the glass (gravity, a slow tumble,
 *  two bits breaking away), then bursts into a few flakes on the outside sill that shrink to nothing. Fill only.
 *  White and straight down, so it never reads as a memory stick (gold, flying arcs). */
export const SnowSlide: React.FC<{x: number; t0: number; y0?: number; y1?: number; w?: number; seed: string}> = ({x, t0, y0 = 600, y1 = 1052, w = 46, seed}) => {
  const t = useTime();
  const g = 2600;
  const tf = Math.sqrt((2 * (y1 - y0)) / g); // fall time
  const u = t - t0;
  if (u < 0 || u > tf + 0.34) return null;
  const parts: React.ReactNode[] = [];
  if (u <= tf) {
    const y = y0 + 0.5 * g * u * u;
    const rot = 70 * u;
    const main = blob(x, y, w / 2, w * 0.32, {seed: `${seed}/m`});
    const shade = blob(x + 3, y + w * 0.12, w * 0.4, w * 0.16, {seed: `${seed}/s`});
    parts.push(
      <XG key="m" m={mat.about(mat.rotate(rot), x, y)}>
        <path d={main} fill={EMBER.snow} />
        <path d={shade} fill={EMBER.frost} />
      </XG>,
    );
    // two bits break away after 40 % of the fall and drift sideways
    if (u > tf * 0.4) {
      const v = u - tf * 0.4;
      [[-1, 0.34], [1, 0.26]].forEach(([dir, k], i) => {
        const bx = x + dir * 60 * v;
        const by = y - 18 + 0.5 * g * 0.1 * v * v;
        parts.push(<path key={`b${i}`} d={blob(bx, by, w * k * 0.5, w * k * 0.42, {seed: `${seed}/b${i}`})} fill={EMBER.snow} />);
      });
    }
  } else {
    // the burst on the sill: 6 flakes fly up and out, shrinking to nothing
    const v = u - tf;
    const k = Math.max(0, 1 - v / 0.34);
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI * (0.15 + 0.7 * (i / 5));
      const sp = 150 + (i % 3) * 50;
      const fx = x + Math.cos(a) * sp * v;
      const fy = y1 + Math.sin(a) * sp * v + 0.5 * 1400 * v * v;
      const r = (5 + (i % 2) * 3) * k;
      if (r > 0.6) parts.push(<path key={`f${i}`} d={circle(fx, fy, r)} fill={EMBER.snow} />);
    }
    const mound = 8 * Math.min(1, v / 0.08);
    parts.push(<path key="mound" d={blob(x, y1 - mound * 0.4, w * 0.6, mound * 0.6 + 0.5, {seed: `${seed}/mound`})} fill={EMBER.snow} />);
  }
  return <>{parts}</>;
};

/** Outside life at the glass edges: a snow ridge on the outside sill, icicles under the lintel, a shoveller. */
export const O1GlassLife: React.FC = () => (
  <>
    <Show at={0.1}>
      <Icicles x0={200} x1={812} y={632} n={8} len={[14, 40]} seed="o1/ice" ink={0} />
      <RoofNeighbour x={258} y={1046} h={30} kind="shovel" seed="o1/shovel" coat={EMBER.books[4]} />
    </Show>
    <SnowSill x0={176} x1={904} y={1060} h={13} seed="o1/osill" ink={0} at={0.04} drips={0} />
    {/* snow sliding off the eaves: during the question (O1 1.18, left of the building), after the sign (5.36, right
        of the mullion, behind Pip) and in S15's hold (O1 6.92 = VO 37.48) */}
    <SnowSlide x={286} t0={1.18} seed="o1/slide1" />
    <SnowSlide x={872} t0={5.36} w={40} y1={1050} seed="o1/slide2" />
    <SnowSlide x={262} t0={6.92} w={42} seed="o1/slide3" />
  </>
);
