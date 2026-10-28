// V2S3_tLife.tsx (lane L3, V2S3 FAR helper): her bank's things and life, WORLD px at the 12.98 match, film seconds.
// The life budget (conform_L3 §1, the brief): at most 3 noticeable movers at once in the whole shot, the watering
// neighbour, ONE far walker and the boat's smoke; nothing else starts. The cyclist, the other walkers and the dog, the
// birds, the pigeons, the roof smoke and the leaf drift are cut; what stays is still and calm.
//   S3Path      her towpath in front of the terrace (flat paving, a stone coping), a bench under the tree, three
//               mooring bollards, a bin, the lit heritage lamp, and the one far walker heading west (K4, 128 px: one eye
//               ratio with her silhouette, 140 px, within 15 %; feet honest on the 12 drawings/s clock); their
//               contact and cast shadows (RIG_CANAL: right and a little toward us)
//   S3Inside    behind the glazing bars: the kettle neighbour at the counter (still)
//   S3Outside   out of the windows: the watering neighbour leaning out of the raised sash, the can tipping 13.30-14.36
//               (tier B, her one action), and one small train of kettle steam out of the lowered top sash
//   S3RoofLife  the balcony's string lights: lit bulbs (flat CM.lamp), ONE twinkle at a time, none in the 0.4 s round a
//               join (12.98, 14.86) or while the push-through starts (from 14.66)
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {wire as wirePath, wirePoint} from '../../lib/sketch';
import {CastShadow, ContactShadow, FormShade, ShadowLayer} from '../../lib/light';
import {Paint} from '../kit/canal/core';
import {Puffs} from '../kit/canal/life';
import {Person, strideFor, drawn, TraitOverrides} from '../kit/cast';
import {S3_START} from './V2S3_rig';
import {Batch, binInto, ovalPath, domePath, P, S3_IRON} from './V2S3_tParts';

/** Her towpath's bench wood, a mid oak (tier C: never a dark line). */
const WOOD = '#C09474';
import {TERRACE_FEET} from './V2S3_tHouses';

/** Her towpath: its back edge (the terrace's foot) and the coping's front edge at the water. */
export const PATH = {top: 1100, edge: 1130, coping: 9} as const;

// ---------------------------------------------------------------- the one far walker (feet honest)

type WalkerSpec = {seed: string; x: number; v: number; y: number; h: number; stepPx: number; traits?: TraitOverrides; phase?: number};

/** Where the walker is at film t (x moves every frame; the pose steps on the 12 drawings/s clock). */
const walkerX = (w: WalkerSpec, t: number) => w.x + w.v * (t - S3_START);

/** The far walker: a man with a backpack strolling WEST (screen left) along her towpath, right of her window and of Pip
 *  all shot (x 902 -> 778), 128 px (one eye ratio with her 140 px silhouette within 15 %; CRAFT §f.5). */
export const WALKER: WalkerSpec = {seed: 's3w/back', x: 902, v: -66, y: 1117, h: 128, stepPx: 47, traits: {acc: 'backpack', coat: CM.coatSlate, hair: 'short', coatLen: 'jacket'}, phase: 0.3};

const Walker: React.FC<{w: WalkerSpec}> = ({w}) => {
  const t = useTime();
  const tq = drawn(t, 12);
  const step = (w.phase ?? 0) + (Math.abs(w.v) * (tq - S3_START)) / w.stepPx;
  return (
    <Tier tier="environment">
      <Person x={walkerX(w, t)} y={w.y} h={w.h} ink={0} exact seed={w.seed} traits={w.traits} pose="walk" view="profile" flip={w.v > 0} step={step} stride={strideFor(w.stepPx, w.h, 'profile')} />
    </Tier>
  );
};

/** The walker's contact and cast shadow on her towpath (a person: 1.1-1.3x the stance; the cast along the light). */
const WalkerShadow: React.FC<{w: WalkerSpec}> = ({w}) => {
  const t = useTime();
  const x = walkerX(w, t);
  return (
    <ShadowLayer>
      <ContactShadow x={x} y={w.y} w={w.h * 0.24} k={1.2} h={6} />
      <CastShadow x={x} y={w.y} w={w.h * 0.2} h={w.h} depth={4} />
    </ShadowLayer>
  );
};

// ---------------------------------------------------------------- the towpath and its furniture

/** A London towpath bench seen from the canal (cast-iron ends, a slatted back behind the seat): x centre, y feet. */
function benchInto(b: Batch, x: number, y: number, w: number) {
  const seatY = y - 22;
  for (let k = 0; k < 3; k++) b.rect(WOOD, x - w / 2 + 6, seatY - 30 + k * 8, w - 12, 5.4);
  b.rect(WOOD, x - w / 2 + 2, seatY, w - 4, 6.5);
  for (const s of [-1, 1]) {
    const ex = x + s * (w / 2 - 6);
    b.poly(S3_IRON, [[ex - 3, seatY - 32], [ex + 3, seatY - 32], [ex + 3 + s * 2, y], [ex - 3 + s * 2, y]]);
    b.rect(S3_IRON, ex - s * 2 - 6, seatY - 14, 12, 3.2);
  }
}

/** A cast-iron mooring bollard on the coping: x centre, y foot, h tall (its side away from the sun: FormShade). */
const bollardD = (x: number, y: number, h: number) => {
  const w = h * 0.9;
  return `M${P(x - w * 0.42, y)}L${P(x - w * 0.3, y - h * 0.55)}L${P(x - w * 0.42, y - h * 0.78)}L${P(x + w * 0.42, y - h * 0.78)}L${P(x + w * 0.3, y - h * 0.55)}L${P(x + w * 0.42, y)}Z`;
};

// (exported for the canal's reflections: V2S3_water S3's lib/water spec)
export const BENCH = {x: 112, y: PATH.edge - 8, w: 104} as const;
export const BOLLARDS = [262, 652, 1118] as const;
export const BOLLARD_H = 17;
export const BIN = {x: 948, y: PATH.edge - 9, h: 32} as const;
export const LAMP = {x: 986, y: PATH.edge - 6, h: 252} as const;

function pathBatch(): Batch {
  const b = new Batch();
  const {top, edge, coping} = PATH;
  // the paving (flat) with the terrace's foot one soft step deeper along the back, then the stone coping and its lip
  b.rect(CM.paving, -80, top, 1260, edge - top + 1);
  b.rect(CM.stucco, -80, top, 1260, 4);
  b.rect(CM.limestone, -80, edge - coping, 1260, coping);
  return b;
}

function furnitureBatch(): Batch {
  const b = new Batch();
  benchInto(b, BENCH.x, BENCH.y, BENCH.w);
  for (const x of BOLLARDS) {
    b.fill(S3_IRON, bollardD(x, PATH.edge - 4, BOLLARD_H));
    b.fill(S3_IRON, domePath(x, PATH.edge - 4 - BOLLARD_H * 0.76, BOLLARD_H * 0.9 * 0.46, BOLLARD_H * 0.26));
  }
  binInto(b, BIN.x, BIN.y, BIN.h, S3_IRON);
  return b;
}

/** Her towpath's heritage lamp, lit (flat: a mid-iron post, a plinth, the ladder bar, the lit lantern in lamp gold
 *  under its cap; no line). */
function lampBatch(): Batch {
  const b = new Batch();
  const {x, y, h} = LAMP;
  const cw = h * 0.034;
  b.poly(S3_IRON, [[x - cw * 1.6, y], [x - cw * 1.2, y - h * 0.08], [x + cw * 1.2, y - h * 0.08], [x + cw * 1.6, y]]);
  b.poly(S3_IRON, [[x - cw * 0.7, y - h * 0.08], [x - cw * 0.45, y - h * 0.8], [x + cw * 0.45, y - h * 0.8], [x + cw * 0.7, y - h * 0.08]]);
  b.rect(S3_IRON, x - cw * 2.6, y - h * 0.79, cw * 5.2, Math.max(1.5, h * 0.012));
  const lb = y - h * 0.82;
  const lt = y - h * 0.94;
  b.poly(CM.lamp, [[x - cw * 1.5, lb], [x - cw * 2.4, lt], [x + cw * 2.4, lt], [x + cw * 1.5, lb]]);
  b.poly(S3_IRON, [[x - cw * 2.8, lt], [x, lt - h * 0.045], [x + cw * 2.8, lt]]);
  return b;
}

export const S3Path: React.FC = () => {
  const ground = useMemo(pathBatch, []);
  const furn = useMemo(furnitureBatch, []);
  return (
    <>
      <Paint b={ground} seed="s3path/ground" misreg={false} />
      {/* contact and cast shadows of everything standing on her towpath (CRAFT §d.5-§d.6) */}
      <ShadowLayer>
        <ContactShadow x={BENCH.x} y={BENCH.y} w={BENCH.w} h={6} />
        <CastShadow x={BENCH.x} y={BENCH.y} w={BENCH.w} depth={5} h={52} />
        {BOLLARDS.map((x) => (
          <React.Fragment key={x}>
            <ContactShadow x={x} y={PATH.edge - 4} w={BOLLARD_H * 0.8} h={5} />
            <CastShadow x={x} y={PATH.edge - 4} w={BOLLARD_H * 0.7} depth={3} h={BOLLARD_H} />
          </React.Fragment>
        ))}
        <ContactShadow x={BIN.x} y={BIN.y} w={BIN.h * 0.62} h={5} />
        <CastShadow x={BIN.x} y={BIN.y} w={BIN.h * 0.55} depth={4} h={BIN.h} />
        <ContactShadow x={LAMP.x} y={LAMP.y} w={14} h={5} />
        <CastShadow x={LAMP.x} y={LAMP.y} w={6} depth={2} h={LAMP.h} />
        {TERRACE_FEET.map((f, i) => (
          <ContactShadow key={i} x={f.x} y={f.y + 1} w={f.w} h={5} />
        ))}
      </ShadowLayer>
      <Paint b={furn} seed="s3path/furn" misreg={false} />
      {BOLLARDS.map((x) => (
        <FormShade key={x} d={bollardD(x, PATH.edge - 4, BOLLARD_H)} kind="crescent" />
      ))}
      <Paint b={lampBatch()} seed="s3lamp" misreg={false} />
      <WalkerShadow w={WALKER} />
      <Walker w={WALKER} />
    </>
  );
};

// ---------------------------------------------------------------- the neighbours (tier B: support)

/** The watering neighbour (stock-brick house, first floor, window h2a: x 566-632, y 708-844, lower sash up 50). */
const WATER = {x: 606, sill: 844, t0: 13.3, t1: 14.36} as const;
/** The kettle neighbour (painted house, first floor, window h4a: x 1036-1098, y 710-844). */
const KETTLE = {x: 1072, sill: 844} as const;

/** The watering can's tip 0..1: tips over 0.25 s, pours, rights itself (eased, no wobble). */
const tipAt = (t: number) => {
  if (t < WATER.t0 || t > WATER.t1) return 0;
  const k = Math.min(1, (t - WATER.t0) / 0.25, (WATER.t1 - t) / 0.25);
  return k * k * (3 - 2 * k);
};

/** Behind the glazing (between the panes and the sashes): the kettle neighbour at the counter, still. */
export const S3Inside: React.FC = () => {
  const b = useMemo(() => {
    const b = new Batch();
    const hx = KETTLE.x;
    const hy = 784;
    b.poly(CM.coatMustard, [[hx - 20, KETTLE.sill], [hx - 17, hy + 18], [hx - 5, hy + 12], [hx + 7, hy + 12], [hx + 17, hy + 18], [hx + 20, KETTLE.sill]]);
    b.fill(CM.hair[4], ovalPath(hx, hy, 9, 10));
    b.fill(CM.hair[4], ovalPath(hx + 5, hy - 8, 4.4, 4));
    b.fill(CM.paper, ovalPath(hx - 17, KETTLE.sill - 8, 6.5, 5.5));
    return b;
  }, []);
  return (
    <Tier tier="support">
      <Paint b={b} seed="s3inside" misreg={false} />
    </Tier>
  );
};

/** Out of the windows (in front): the watering neighbour leaning out with a can that tips over the box; the kettle's
 *  steam out of the lowered top sash (one small train). */
export const S3Outside: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  const tip = tipAt(t);
  {
    const lean = tip * 3;
    const hx = WATER.x + 8 - lean;
    const hy = 806 + lean * 0.5;
    b.poly(CM.sage, [[hx - 22, WATER.sill + 1], [hx - 18, hy + 14], [hx - 6, hy + 9], [hx + 8, hy + 9], [hx + 19, hy + 14], [hx + 22, WATER.sill + 1]]);
    b.fill(CM.hair[2], ovalPath(hx, hy, 9, 9.6));
    b.fill(CM.hair[2], ovalPath(hx + 5, hy - 7, 4, 3.8));
    // the arm out to the can over the box's west half (a flat sleeve shape), the hand, the can (slate) and its rose
    const sh: [number, number] = [hx - 12, hy + 17];
    const hand: [number, number] = [hx - 16 - tip * 2, hy + 16 - tip * 2];
    b.poly(CM.sage, [[sh[0] - 3, sh[1] - 3], [sh[0] + 3, sh[1] + 3], [hand[0] + 2, hand[1] + 3], [hand[0] - 2, hand[1] - 3]]);
    b.fill(CM.brickLight, ovalPath(hand[0], hand[1], 3, 2.8));
    const a = (-6 - 40 * tip) * (Math.PI / 180);
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const rot = (x: number, y: number): [number, number] => [hand[0] + x * ca - y * sa, hand[1] + x * sa + y * ca];
    b.poly(CM.coatSlate, [rot(2, -2), rot(-18, -2), rot(-18, 12), rot(2, 12)]);
    b.poly(CM.coatSlate, [rot(-17, 1.5), rot(-31, -7.5), rot(-33, -4.5), rot(-17, 4.5)]);
    b.fill(CM.coatSlate, ovalPath(rot(-32, -6)[0], rot(-32, -6)[1], 2.6, 2.2));
  }
  // the kettle window's lowered top sash: the gap the steam comes out of
  b.rect(CM.line, 1037, 712, 60, 5);
  return (
    <Tier tier="support">
      <Paint b={b} seed="s3outside" misreg={false} />
      <Puffs x={1060} y={714} seed="s3kettle" kind="steam" scale={0.5} ceil={612} drift={-20} />
    </Tier>
  );
};

// ---------------------------------------------------------------- roofs: the balcony's string lights

/** The balcony's two festoons (under the rail, over the French door). */
const FESTOONS: {from: [number, number]; to: [number, number]; sag: number; n: number}[] = [
  {from: [830, 827], to: [954, 825], sag: 9, n: 12},
  {from: [842, 708], to: [936, 708], sag: 7, n: 9},
];
/** ONE twinkle at a time across both festoons (a bulb dims to the lamp's lower step for 0.14 s), never in the 0.4 s
 *  round the joins (12.78-13.18, 14.66-15.06): [time, festoon, bulb]. */
const TWINKLES: [number, number, number][] = [
  [13.42, 0, 4],
  [13.96, 1, 6],
  [14.38, 0, 9],
];

export const S3RoofLife: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  let wires = '';
  FESTOONS.forEach((f, fi) => {
    wires += wirePath(f.from[0], f.from[1], f.to[0], f.to[1], f.sag, {seed: `s3fest${fi}`});
    for (let i = 0; i < f.n; i++) {
      const [x, y] = wirePoint(f.from[0], f.from[1], f.to[0], f.to[1], f.sag, (i + 0.5) / f.n);
      const dim = TWINKLES.some(([tt, ff, bb]) => ff === fi && bb === i && t >= tt && t < tt + 0.14);
      b.fill(dim ? CM.coatMustard : CM.lamp, ovalPath(x, y + 2.9, 2.6, 3.2));
    }
  });
  b.ink(wires, 1.2, S3_IRON, 0, {thing: true});
  return <Paint b={b} seed="s3festoons" misreg={false} />;
};
