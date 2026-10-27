// V2S1 helper (lane L1): the shot's LIGHT LAYERS under RIG_CANAL (conform_L1 §7; CRAFT §d; THROUGHLINE §5; lib/LIGHT.md).
// The key is SUN0, low at screen left: shadows fall right and a little toward us (sunLight toward 15, el 36, casts
// capped at 0.8 h, the towpath flattened 0.28). Every shape is a flat multiply step of the film's ONE tint family
// (rigs.ts TINT_CANAL); nothing here draws outside V2S1.tsx's <Lit rig={RIG_CANAL}>, and `{"lightOff": true}` turns it
// all off (the A side of check_light.py).
//   S1WingShades       the fins' short shades right on the facade (Shadow) + the canopy soffit one Shade step
//   S1TowpathShadows   contact + cast under her and every ghost and outline (parallel), the lamp posts, the bollards
//   S1BoatStrips       a cast-strength strip at each moored boat's waterline (never a contact strip on water)
// Her form shade and rim (her left edge, the key side) are in V2S1_row (they need her drawing).
import React from 'react';
import {CastShadow, ContactShadow, Shade, Shadow, ShadowLayer} from '../../lib/light';
import {useTime} from '../../lib/time';
import * as MAP from '../world/map';
import {boatGeom} from '../kit/canal/boat';
import {C, s1HerXAt} from './V2S1_clock';
import {POP} from './V2S1_row_fig';
import {s1WingShadows} from './V2S1_set_wing';
import {BOAT_A, BOAT_B, S1_BOLLARDS, S1_FAR_LAMPS, S1_PATH, s1Bend} from './V2S1_set_life';

const S = MAP.S1_SHEET;
const WING = s1WingShadows();

/** The wing's facade: each fin casts a short shade to its right; the canopy's underside is one step down. */
export const S1WingShades: React.FC = () => (
  <>
    <ShadowLayer>
      {WING.fins.map((d, i) => (
        <Shadow key={i} d={d} tint="form" />
      ))}
    </ShadowLayer>
    <Shade d={WING.soffit} />
  </>
);

/** When a row member's shadows land: with its fill (the pop: outline 0.10 s, fill 2 frames later). */
const landsAt = (popT: number | null) => (popT === null ? -Infinity : popT + POP.outlineS + POP.fillDelayS);

/** The far towpath's ground shadows (one multiply layer after the paving, before what stands on it). */
export const S1TowpathShadows: React.FC = () => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  // the lamp posts and the bollards along the bend (sized as V2S1_set_life draws them)
  for (const L of S1_FAR_LAMPS) {
    const k = MAP.s1FigureHAt(L.x) / S.herH;
    const h = L.h || 350 * k;
    const y = S1_PATH.top + 6 + s1Bend(L.x);
    out.push(<ContactShadow key={`lc${L.x}`} x={L.x} y={y} w={Math.max(10, 30 * k)} />);
    out.push(<CastShadow key={`ls${L.x}`} x={L.x} y={y} w={Math.max(6, 14 * k)} h={h} />);
  }
  for (const x of S1_BOLLARDS) {
    const k = MAP.s1FigureHAt(x) / S.herH;
    const y = S1_PATH.edge - S1_PATH.coping * 0.5 + s1Bend(x) - 2;
    out.push(<ContactShadow key={`bc${x}`} x={x} y={y} w={22 * k * 0.9} h={6} />);
    out.push(<CastShadow key={`bs${x}`} x={x} y={y} w={20 * k * 0.8} h={22 * k} />);
  }
  // her (from the step-out) and the row: contact at the feet, casts parallel along the light
  if (t >= C.steppingOut) {
    const poses = MAP.s1RowAt(t);
    MAP.S1_ROW.forEach((m, i) => {
      const p = poses[i];
      if (m.kind !== 'her' && (!p.visible || t < landsAt(m.popT))) return;
      const x = m.kind === 'her' ? s1HerXAt(t) : p.x;
      out.push(<ContactShadow key={`rc${m.id}`} x={x} y={p.feetY} w={p.h * 0.26} k={1.2} />);
      out.push(<CastShadow key={`rs${m.id}`} x={x} y={p.feetY} w={p.h * 0.22} h={p.h} />);
    });
  }
  return <ShadowLayer>{out}</ShadowLayer>;
};

/** Her contact shadow on the lobby floor while she is behind the glass (no sun reaches inside: contact only). */
export const S1LobbyContact: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => (
  <ShadowLayer>
    <ContactShadow x={x} y={y} w={h * 0.26} k={1.2} />
  </ShadowLayer>
);

/** The moored boats: a cast-strength strip along each waterline (the hull's shade on the water; never a contact strip). */
export const S1BoatStrips: React.FC<{which: 'A' | 'B'}> = ({which}) => {
  const o = which === 'A' ? BOAT_A : BOAT_B;
  const g = boatGeom(o);
  const xa = Math.max(-20, Math.min(g.X(0), g.X(1)));
  const xb = Math.min(1100, Math.max(g.X(0), g.X(1)));
  const y = o.water;
  const d = `M${xa} ${y - 1}L${xb} ${y - 1}L${xb} ${y + 6}L${xa + 6} ${y + 6}Z`;
  return (
    <ShadowLayer>
      <Shadow d={d} tint="cast" />
    </ShadowLayer>
  );
};
