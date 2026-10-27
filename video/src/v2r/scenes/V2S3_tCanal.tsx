// V2S3_tCanal.tsx (lane L3, V2S3 FAR helper): the canal between her towpath and our moored boat, WORLD px at the 12.98
// match. A flat water band that is never bare: the coping's shade, warm reflections of the lit windows and the lamp
// broken in the ripples (stacked short dashes that wobble), the terrace's brick in broken strips, ripple lenses drifting
// west with the current, glints switching, floating leaves, a heron on a mooring post (one slow head turn) and two
// ducks paddling. No ink on the water (only the post and the birds). Our boat (the NEAR part) covers it from y ~1260.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Paint, frac} from '../kit/canal/core';
import {Ducks, FloatingLeaves} from '../kit/canal/life';
import {Batch, TK, line, ovalPath, rng, P, leafPath} from './V2S3_tParts';

export const CANAL = {top: 1130, bottom: 1420, x0: -80, x1: 1180} as const;

type Src = {x0: number; x1: number; color: string; depth: number; dens: number; y?: number};

/** What the water mirrors (x-ranges on the far bank): lit windows warm and dense, walls sparse, the lamp a column. */
const SOURCES: Src[] = [
  // the tree and the garden wall at the west end
  {x0: -70, x1: 150, color: CM.sage, depth: 64, dens: 0.42},
  {x0: -40, x1: 90, color: CM.leafGold, depth: 40, dens: 0.3, y: 18},
  // the terrace walls (broken brick strips)
  {x0: 170, x1: 520, color: CM.brick, depth: 80, dens: 0.34},
  {x0: 530, x1: 770, color: CM.stucco, depth: 70, dens: 0.4},
  {x0: 780, x1: 1005, color: CM.brickDeep, depth: 78, dens: 0.34},
  {x0: 1012, x1: 1180, color: CM.sage, depth: 70, dens: 0.38},
  // her lit window above the box: the brightest column (warm), and the lit ground-floor rooms
  {x0: 288, x1: 384, color: CM.lampCore, depth: 118, dens: 0.72},
  {x0: 300, x1: 372, color: CM.lamp, depth: 96, dens: 0.5, y: 8},
  {x0: 566, x1: 646, color: CM.lamp, depth: 88, dens: 0.62},
  {x0: 886, x1: 982, color: CM.lamp, depth: 92, dens: 0.6},
  {x0: 1066, x1: 1142, color: CM.lamp, depth: 86, dens: 0.6},
  // the lit lamp post: a narrow long column
  {x0: 974, x1: 998, color: CM.lampCore, depth: 128, dens: 0.8},
];

function staticBatch(): Batch {
  const b = new Batch();
  b.rect(CM.water, CANAL.x0, CANAL.top, CANAL.x1 - CANAL.x0, CANAL.bottom - CANAL.top);
  b.layer();
  // the far coping's shade on the water, broken at its lower edge
  b.rect(CM.waterDeep, CANAL.x0, CANAL.top, CANAL.x1 - CANAL.x0, 9);
  const r = rng('s3canalShade');
  for (let x = CANAL.x0; x < CANAL.x1; x += r.range(30, 70)) b.rect(CM.waterDeep, x, CANAL.top + 9, r.range(14, 40), 3);
  return b;
}

export const S3Water: React.FC = () => {
  const t = useTime();
  const base = useMemo(staticBatch, []);
  const b = new Batch();
  const r = rng('s3refl');
  // reflections: rows of short broken dashes under each source, sparser and shorter with depth, wobbling sideways
  SOURCES.forEach((s, i) => {
    const top = CANAL.top + 12 + (s.y ?? 0);
    const rows = Math.max(3, Math.round(s.depth / 7));
    for (let k = 0; k < rows; k++) {
      const yy = top + k * 7 + r.range(-1, 1);
      const keep = 1 - k / rows;
      const hh = 2.4 + k * 0.12;
      let x = s.x0 + r.range(0, 10);
      while (x < s.x1) {
        const len = Math.min(s.x1 - x, r.range(8, 30) * (0.45 + keep * 0.7));
        if (r.chance(s.dens * (0.45 + 0.55 * keep))) {
          const xx = x + Math.sin(t * 1.3 + k * 0.8 + i * 1.7 + x * 0.013) * (1.5 + k * 0.35);
          b.fill(s.color, `M${P(xx, yy)}L${P(xx + len, yy)}L${P(xx + len - 1.5, yy + hh)}L${P(xx + 1.5, yy + hh)}Z`);
        }
        x += len + r.range(5, 18) * (1.3 - keep * 0.6);
      }
    }
  });
  b.layer();
  // ripple lenses drifting west with the current
  const span = CANAL.x1 - CANAL.x0;
  for (let i = 0; i < 34; i++) {
    const v = r.next();
    const yy = CANAL.top + 16 + v * 140;
    const w = r.range(20, 58) * (0.8 + v * 0.6);
    const x = CANAL.x0 + frac((r.range(0, span) - 9 * (0.7 + v * 0.6) * t) / span) * span;
    const hh = 1.8 + v * 1.2;
    b.fill(CM.waterDeep, `M${P(x - w / 2, yy)}Q${P(x, yy - hh)} ${P(x + w / 2, yy)}Q${P(x, yy + hh)} ${P(x - w / 2, yy)}Z`);
  }
  // glints: short paper dashes switching on and off on their own clocks
  for (let i = 0; i < 18; i++) {
    const v = r.next();
    const yy = CANAL.top + 14 + v * 130;
    const per = r.range(1.1, 2.4);
    const on = frac(t / per + r.next()) < 0.45;
    const x = r.range(CANAL.x0 + 30, CANAL.x1 - 30) + Math.sin(t * 0.9 + i) * 5;
    const s = 0.8 + v * 0.6;
    if (on) b.fill(i % 3 ? CM.paper : CM.lampCore, `M${P(x - 8 * s, yy)}L${P(x + 8 * s, yy - 1)}L${P(x + 6 * s, yy + 2 * s)}L${P(x - 6 * s, yy + 2 * s)}Z`);
  }
  return (
    <>
      <Paint b={base} seed="s3c/base" misreg={false} />
      <Paint b={b} seed="s3c/life" misreg={false} />
    </>
  );
};

/** The heron's mooring post: a timber post standing in the water off the far coping. */
const POST = {x: 834, top: 1150, bottom: 1236, w: 12} as const;

const PostAndRings: React.FC = () => {
  const b = useMemo(() => {
    const b = new Batch();
    b.rect(CM.line, POST.x - POST.w / 2, POST.top, POST.w, POST.bottom - POST.top);
    b.rect(CM.shadeWarm, POST.x + POST.w / 2 - 4, POST.top + 3, 4, POST.bottom - POST.top - 3);
    b.fill(CM.line, ovalPath(POST.x, POST.top, POST.w / 2 + 1, 3));
    b.rect(CM.waterDeep, POST.x - POST.w, POST.bottom - 4, POST.w * 2, 4);
    // its broken reflection
    for (let k = 0; k < 4; k++) b.rect(CM.line, POST.x - 5 + (k % 2) * 3, POST.bottom + 3 + k * 7, 8 - k, 2.4);
    b.ink(line(POST.x - POST.w / 2, POST.top + 2, POST.x - POST.w / 2, POST.bottom - 4, {seed: 'post', over: 'small'}) + line(POST.x + POST.w / 2, POST.top + 2, POST.x + POST.w / 2, POST.bottom - 6, {seed: 'post2', over: 'small'}), TK.struct);
    return b;
  }, []);
  return <Paint b={b} seed="s3c/post" />;
};


/** A grey heron standing on the post, in profile facing west (left): long legs, a hunched body with folded wings, the
 *  S-neck tucked, a black crest stripe and a dagger bill. One slow head turn (it looks back east, then west again). */
const HeronS3: React.FC<{x: number; y: number; h: number; turnAt: number}> = ({x, y, h, turnAt}) => {
  const t = useTime();
  const b = new Batch();
  // the head turn: 0 = looking west (left), 1 = looking back east (right); out and back over 1.1 s
  const u = t < turnAt ? 0 : t < turnAt + 0.3 ? (t - turnAt) / 0.3 : t < turnAt + 0.8 ? 1 : t < turnAt + 1.1 ? 1 - (t - turnAt - 0.8) / 0.3 : 0;
  const look = u * u * (3 - 2 * u);
  const dir = look > 0.5 ? 1 : -1;
  const legH = h * 0.34;
  const k = h / 84;
  // legs (thin, a knee bend) and toes on the post top
  b.ink(`M${P(x - 3 * k, y)}L${P(x - 2 * k, y - legH * 0.5)}L${P(x - 4 * k, y - legH)}M${P(x + 4 * k, y)}L${P(x + 3 * k, y - legH * 0.55)}L${P(x + 1 * k, y - legH)}`, 1.8, CM.shadeCool);
  b.ink(`M${P(x - 9 * k, y)}L${P(x + 8 * k, y)}`, 1.4, CM.shadeCool);
  // the body: a hunched teardrop, back in stone grey, wing in cool shade, a pale breast
  const by = y - legH;
  const body = `M${P(x - 16 * k, by - 18 * k)}Q${P(x - 4 * k, by - 30 * k)} ${P(x + 14 * k, by - 22 * k)}Q${P(x + 30 * k, by - 12 * k)} ${P(x + 34 * k, by + 2 * k)}Q${P(x + 14 * k, by + 4 * k)} ${P(x - 2 * k, by + 2 * k)}Q${P(x - 16 * k, by - 4 * k)} ${P(x - 16 * k, by - 18 * k)}Z`;
  b.fill(CM.stoneShade, body);
  b.fill(CM.shadeCool, `M${P(x - 6 * k, by - 20 * k)}Q${P(x + 14 * k, by - 22 * k)} ${P(x + 34 * k, by + 1 * k)}Q${P(x + 12 * k, by - 4 * k)} ${P(x - 4 * k, by - 8 * k)}Z`);
  b.fill(CM.paper, `M${P(x - 16 * k, by - 18 * k)}Q${P(x - 18 * k, by - 6 * k)} ${P(x - 6 * k, by + 1 * k)}Q${P(x - 10 * k, by - 10 * k)} ${P(x - 10 * k, by - 20 * k)}Z`);
  // the neck: an S tucked into the shoulders, pale with a plum streak; the head with its crest
  const nx = x - 12 * k;
  const ny = by - 20 * k;
  const hx = nx - 6 * k + look * 10 * k;
  const hy = ny - 22 * k;
  b.ink(`M${P(nx, ny)}C${P(nx - 10 * k, ny - 8 * k)} ${P(hx + 8 * k, hy + 10 * k)} ${P(hx, hy)}`, 7 * k, CM.paper);
  b.ink(`M${P(nx - 2 * k, ny - 4 * k)}C${P(nx - 9 * k, ny - 10 * k)} ${P(hx + 5 * k, hy + 10 * k)} ${P(hx - 1 * k, hy + 3 * k)}`, 1.2, CM.anchor);
  b.fill(CM.paper, ovalPath(hx, hy, 5.4 * k, 4.6 * k));
  b.fill(CM.anchor, `M${P(hx - dir * 1 * k, hy - 3.4 * k)}L${P(hx - dir * 14 * k, hy - 2 * k)}L${P(hx - dir * 2 * k, hy - 1 * k)}Z`);
  b.fill(CM.coatMustard, `M${P(hx + dir * 3 * k, hy - 1.6 * k)}L${P(hx + dir * 19 * k, hy + 0.6 * k)}L${P(hx + dir * 3 * k, hy + 1.8 * k)}Z`);
  b.fill(CM.anchor, ovalPath(hx + dir * 1.6 * k, hy - 0.8 * k, 1, 1));
  b.ink(body, 1.4, CM.ink, 0.35);
  // tail feathers and a few shoulder plumes
  for (let i = 0; i < 3; i++) b.fill(CM.shadeCool, leafPath(x + (30 + i * 2) * k, by + (2 - i * 2) * k, 10 * k, 2.2 * k, 12 + i * 8));
  return <Paint b={b} seed="s3heronP" misreg={false} />;
};

export const S3CanalLife: React.FC = () => (
  <>
    <FloatingLeaves y0={1150} y1={1290} n={9} size={11} seed="s3fl" current={-9} />
    <PostAndRings />
    <HeronS3 x={POST.x} y={POST.top + 1} h={84} turnAt={13.78} />
    <Ducks ducks={[{x: 528, y: 1214, size: 26, drake: true}, {x: 578, y: 1222, size: 24}]} seed="s3ducks" />
  </>
);
