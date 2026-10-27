// Video 2 (restart) KIT CONTRACT entry (TREATMENT.md section 9: "every piece at every size used, on ONE contract sheet
// beside v1 and ref 1 at 216 px, judged, frozen before lanes"). The palette import MUST stay first.
import './v2r/palette';
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {CM} from './v2r/palette';
import {Her, HerWindow, Ghost, BareOutline, Person, Seated, NearBack, Staffer, Reporter, Stranger, CafeOwner} from './v2r/kit/cast';
import type {HairKind} from './v2r/kit/cast';
import {Pip} from './v2r/kit/pip';

// ---------------------------------------------------------------- measurement pass (one figure per frame)

type MItem = {id: string; node: React.ReactNode};
const MX = 540;
const MY = 1500;
const NEAR_HAIR: HairKind[] = ['hood', 'beanie', 'lowBun', 'curls', 'cap'];
const MEASURE: MItem[] = [
  ...[120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 330].flatMap((hv) =>
    NEAR_HAIR.map((hair) => ({id: `near_${hair}_${hv}`, node: <NearBack x={MX} y={MY} hv={hv} seed={`m/near/${hair}`} traits={{hair}} />})),
  ),
  ...[60, 110, 165, 180].map((h) => ({id: `seated_${h}`, node: <Seated x={MX} y={MY} h={h} seed="m/seat" />})),
  {id: 'staffer_180', node: <Staffer x={MX} y={MY} h={180} />},
  {id: 'reporter_165', node: <Reporter x={MX} y={MY} h={165} />},
  {id: 'stranger_100', node: <Stranger x={MX} y={MY} h={100} />},
  ...[130, 150, 153, 170].map((h) => ({id: `her_${h}`, node: <Her x={MX} y={MY} h={h} step={0.25} plant={h !== 150} />})),
  {id: 'her_profile_170', node: <Her x={MX} y={MY} h={170} view="profile" step={0.33} />},
  {id: 'herwindow_137', node: <HerWindow x0={MX} x1={MX} y={MY} h={137} />},
  ...[170, 160, 150, 140, 135].map((h, i) => ({id: `ghost_g${i + 1}_${h}`, node: <Ghost x={MX} y={MY} h={h} age={i + 1} step={0.25} />})),
  {id: 'outline_130', node: <BareOutline x={MX} y={MY} h={130} step={0.25} />},
  ...[150, 170, 240, 300].map((h) => ({id: `person_${h}`, node: <Person x={MX} y={MY} h={h} seed="m/pub" pose="walk" view="profile" step={0.3} />})),
  ...[170, 240, 300].map((h) => ({id: `cafeowner_${h}`, node: <CafeOwner x={MX} y={MY} h={h} />})),
  ...[44, 86, 104, 120].map((s) => ({id: `pip_${s}`, node: <Pip x={MX} y={MY} size={s} facing="back" idle={0} seed="m/pip" />})),
];

const Measure: React.FC = () => {
  const f = useCurrentFrame();
  const it = MEASURE[Math.min(MEASURE.length - 1, f)];
  return (
    <AbsoluteFill style={{background: '#FFFFFF'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {it.node}
      </svg>
    </AbsoluteFill>
  );
};

const ContractRoot: React.FC = () => (
  <>
    <Composition id="KitContractMeasure" component={Measure} fps={60} width={1080} height={1920} durationInFrames={MEASURE.length} />
  </>
);

registerRoot(ContractRoot);
export {MEASURE};
void CM;
