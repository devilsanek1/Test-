// V2S2_Light (lane L2): the light layers of S2 under RIG_CANAL (conform_L2 §6; CRAFT §d; THROUGHLINE §5; lib/LIGHT.md).
// The key is the low western sun, OFF-SCREEN LEFT in S2: shadows fall right and a little toward us (sunLight toward
// 15, el 36, casts capped at 0.8 h, the ground flattened 0.28). Every shape is a flat multiply step of the film's ONE
// tint family (rigs.ts TINT_CANAL); nothing draws outside V2S2.tsx's <Lit rig={RIG_CANAL}>, and `{"lightOff": true}`
// turns it all off (the A side of check_light.py). Screen px at the pose, FILM seconds; each layer rides the plane
// group of the things it belongs to (the set draws it right after the ground it falls on, before the things).
//   S2BankLight      plane 0: contact + cast under the kiosk, the newsagent, the bench's iron ends, the reporter and the
//                    staffer, the kiosk's foot (crate, bundles), the dog, and Pip on the coping (contact only: its raw
//                    SVG gives no silhouette); the A-board's own shadow is K3's (it slides with the board)
//   S2TowpathLight   plane -1: the planter (contact, cast, its right end in form shade), the bike's wheels (contact)
import React from 'react';
import {CastShadow, ContactShadow, FormShade, ShadowLayer} from '../../lib/light';
import {S2_BENCH} from './V2S2_Layout';
import {NEAR} from './V2S2_Near';
import * as MAP from '../world/map';

/** The kiosk (kit Newsstand box) and the newsagent's spot (V2S2_Board AGENT_X / AGENT_Y / AGENT_H). */
const KIOSK = {x0: -70, x1: 104, ground: 1292, h: 374};
const AGENT = {x: 112, y: 1296, h: 250};
/** The bench pair (V2S2_Bench BENCH_PAIR): seated, feet on the bench line. */
const PAIR = [
  {x: 640, h: 170},
  {x: 718, h: 186},
];

export const S2BankLight: React.FC = () => {
  const {x0, x1, y1} = S2_BENCH;
  const bw = x1 - x0;
  const cx = (x0 + x1) / 2;
  return (
    <ShadowLayer>
      {/* the kiosk: its foot and its long shadow to the right */}
      <ContactShadow x={(KIOSK.x0 + KIOSK.x1) / 2} y={KIOSK.ground} w={KIOSK.x1 - KIOSK.x0} h={10} k={1.05} />
      <CastShadow x={(KIOSK.x0 + KIOSK.x1) / 2} y={KIOSK.ground} w={KIOSK.x1 - KIOSK.x0} h={KIOSK.h * 0.55} />
      {/* the newsagent */}
      <ContactShadow x={AGENT.x} y={AGENT.y} w={AGENT.h * 0.24} k={1.2} />
      <CastShadow x={AGENT.x} y={AGENT.y} w={AGENT.h * 0.2} h={AGENT.h} />
      {/* the bench's iron ends and the pair on it */}
      {[-0.42, 0.42].map((k) => (
        <ContactShadow key={k} x={cx + k * bw} y={y1} w={bw * 0.1} h={7} />
      ))}
      <CastShadow x={cx} y={y1} w={bw} h={bw * 0.42} />
      {PAIR.map((p, i) => (
        <CastShadow key={i} x={p.x} y={y1} w={p.h * 0.36} h={p.h} />
      ))}
      {/* the kiosk's foot: the crate, the bundles; the dog lying at rest */}
      <ContactShadow x={NEAR.crate.x + NEAR.crate.w / 2} y={NEAR.crate.y} w={NEAR.crate.w} h={8} />
      {NEAR.bundles.map((b, i) => (
        <ContactShadow key={i} x={b.x + b.w / 2} y={b.y} w={b.w} h={7} />
      ))}
      <ContactShadow x={NEAR.dog.x + NEAR.dog.len * 0.3} y={NEAR.dog.y} w={NEAR.dog.len * 1.1} h={10} />
      <CastShadow x={NEAR.dog.x + NEAR.dog.len * 0.3} y={NEAR.dog.y} w={NEAR.dog.len} h={NEAR.dog.len * 0.36} />
      {/* Pip on the coping: contact only */}
      <ContactShadow x={MAP.S2.pipSeat.x} y={MAP.S2.pipSeat.y} w={62} h={6} />
    </ShadowLayer>
  );
};

export const S2TowpathLight: React.FC = () => {
  const {x0, x1, rim, base} = NEAR.planter;
  return (
    <>
      <ShadowLayer>
        <ContactShadow x={(x0 + x1) / 2} y={base} w={x1 - x0} h={12} k={1.05} />
        <CastShadow x={(x0 + x1) / 2} y={base} w={x1 - x0} h={(base - rim) * 1.6} />
        <ContactShadow x={NEAR.bike.x - NEAR.bike.r * 1.2} y={NEAR.bike.y + NEAR.bike.r} w={NEAR.bike.r * 0.5} h={8} />
        <ContactShadow x={NEAR.bike.x + NEAR.bike.r * 1.25} y={NEAR.bike.y + NEAR.bike.r} w={NEAR.bike.r * 0.5} h={8} />
      </ShadowLayer>
    </>
  );
};

/** The planter's right end in form shade (the side away from the low western sun): drawn AFTER the planter. */
export const S2PlanterForm: React.FC = () => {
  const {x0, x1, rim, base} = NEAR.planter;
  return <FormShade d={`M${x0} ${rim}L${x1} ${rim}L${x1} ${base}L${x0} ${base}Z`} frac={0.12} />;
};
