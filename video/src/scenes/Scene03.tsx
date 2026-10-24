// S03 "Built from one blueprint" (storyboard v3, docs/storyboard_v3.md S03; cut(password) -> cut(it), 8.393-14.17 s).
// VO: "It's in PHP, the language everyone loves, and about seven out of ten websites run on it."
//
// Blueprint Street (shared BlueprintStreet, wide): a HARD CUT onto the bare plan (ten dashed footprints, the plain
// running to a hazy horizon, the sun already in its wide slot); the grid draws on ('It's'), Pip drops in from S02 and
// lands ('in'), the elephant stamp slams under him ('PHP'), L3 pops on the title-block card, and in the ellipsis the
// whole street springs out of the plan in one gesture (press house, then L1 R1 L2 R2 L3 R3 L4 R4 L5). The bait ('the
// language everyone loves') plays on a calm frame: one screen lights, the street fills ('everyone'), Pip puffs up proudly
// ('loves'), the pen-nib sign swings with Bit on it. The count: ten spokes on the sun ('about'), seven plaques tick
// ('seven'), the card flips to the W3Techs footnote L4, three blank plates + three cream slices ('ten': the 7/10 pie),
// the seven PHP screens light ('websites'). 'it.': the pie goes solid and the sun takes off on its low glide-hop to S04
// (mid-air at screen (810, 680) on the cut); Pip crouches to hop to the stoop.
//
// Camera: this scene's own keys (screen = (world - cam) x zoom + (540, 960)): a 4 % in-out-sine breath from rest
// (540, 950, 1.00) -> (545, 945, 1.04) until 'everyone', then locked. The sun is SCREEN space (its slot does not breathe).

import React from 'react';
import {World, useScene, useTime, skies, palette} from '../lib';
import {Sun} from '../lib/Sun';
import {mat, XG} from '../lib/xf';
import {BlueprintStreet, BLUEPRINT, blueprintAnchors, PopUp, SideId, BlueprintId, LayerWrap} from './shared/sets';
import {LabelTag, SunPie} from './shared/props';
import {beats, Beats, S03_START} from './scene03/beats';
import {camAt, camMat} from './scene03/camera';
import {CountPing, FarPlain, Footprints, PressScreen, SideScreens, VentPuffs} from './scene03/plan';
import {BitOnSign, NearWalkers, PipS03, StreetLife} from './scene03/cast';
import {Sticker, TitleBlock} from './scene03/shims';

// ---------------------------------------------------------------- labels (final_script section 6)

const L3 = ['PHP · the code most', 'websites are built with'];
const L4 = ['of sites whose server', 'language is known · W3Techs'];
/** The plan's title-block card slot (world, storyboard S03 composition). */
const CARD: [number, number, number, number] = [490, 1320, 910, 1440];

// ---------------------------------------------------------------- timing tables (scene-local, from the beats)

const SIDE_ORDER: SideId[] = ['L1', 'R1', 'L2', 'R2', 'L3', 'R3', 'L4', 'R4', 'L5'];
const COUNT: BlueprintId[] = ['P', 'L1', 'R1', 'L2', 'R2', 'L4', 'R3'];
const BLANK: SideId[] = ['L3', 'L5', 'R4'];

function tables(b: Beats) {
  const pressAt = b.popUp;
  const popAt = {} as Record<SideId, number>;
  // the nine side buildings: near -> far, alternating sides, 0.035 s apart, the first right after the press house
  SIDE_ORDER.forEach((id, i) => (popAt[id] = +(b.popUp + 0.04 + i * 0.035).toFixed(4)));
  const plaqueAt: Partial<Record<BlueprintId, number>> = {};
  const countAt = {} as Record<BlueprintId, number>;
  COUNT.forEach((id, i) => (countAt[id] = +(b.count + i * 0.08).toFixed(4)));
  COUNT.forEach((id) => {
    if (id !== 'P') plaqueAt[id] = countAt[id]; // P is already on the press house: it re-pulses (a ping) instead
  });
  BLANK.forEach((id, i) => (plaqueAt[id] = +(b.ten + i * 0.05).toFixed(4)));
  // screens: dark until their beat; the 3 non-PHP sites light with their blank plates ('ten'), the 7 PHP sites in a
  // wave on 'websites' (0.02 s), the press house first on 'the' (it re-pulses in the wave)
  const lightAt = {} as Record<SideId, number>;
  BLANK.forEach((id) => (lightAt[id] = plaqueAt[id] as number));
  COUNT.forEach((id, i) => {
    if (id !== 'P') lightAt[id as SideId] = +(b.websites + i * 0.02).toFixed(4);
  });
  return {pressAt, popAt, plaqueAt, countAt, lightAt};
}

// ---------------------------------------------------------------- the scene

const Scene03: React.FC = () => {
  const t = useTime();
  const scene = useScene();
  const b = beats(scene?.start ?? S03_START);
  const T = tables(b);
  const cam = camAt(t, b.everyone);
  const M = camMat(cam);
  const anchors = blueprintAnchors();

  // the sun: SCREEN space (690, 700) r110, pinned (no idle drift: it is S04's match object), the 7/10 pie, then the
  // low glide-hop: take-off at end(it), mid-air at (810, 680) on the cut, touch-down on 'This' at (930, 690)
  const sunHopAir = 14.395 - 13.945;
  const sun = (
    <XG m={mat.inv(M)}>
      <Sun cx={690} cy={700} r={110} drift={[0, 0]} hops={[{t: b.sunHop, to: [930, 690], h: 15, air: sunHopAir}]}>
        {(r: number) => <SunPie r={r} n={10} cream={3} spokesAt={b.spokes} slicesAt={b.ten} sliceStagger={0.05} solidAt={b.solid} seed="s03/pie" />}
      </Sun>
    </XG>
  );

  // layers injected into the set (each at its own depth)
  const wrap: LayerWrap = (name, _n, node) => {
    if (name === 'far') return (
      <>
        <FarPlain />
        {t >= T.pressAt ? node : null}
      </>
    );
    if (name === 'ground') return (
      <>
        {node}
        <Footprints />
        <TitleBlock box={CARD} at={b.grid + 0.3} seed="s03/tb" />
        <LabelTag kind="card" box={CARD} text={L3} fontSize={38 / 1.04} at={b.L3} flipTo={{at: b.flip, text: L4, fontSize: 36 / 1.04}} seed="s03/card" />
      </>
    );
    if (name === 'press') return (
      <>
        {node}
        <PopUp at={T.pressAt} x={560} y={BLUEPRINT.press.base}>
          <PressScreen lightAt={b.pressScreen} pulseAt={b.websites} />
          <Sticker x={640} y={1062} seed="s03/sticker" />
          <CountPing x={anchors.P.plaque.x} y={anchors.P.plaque.y} r={34} at={T.countAt.P} />
          <BitOnSign swingAt={b.swing} twitchAt={b.doorway} />
          <VentPuffs times={[b.pipSettle, b.swing, b.run]} />
        </PopUp>
      </>
    );
    if (name === 'sides') return (
      <>
        {node}
        <SideScreens popAt={T.popAt} lightAt={T.lightAt} />
        {(['L1', 'R1', 'L2', 'R2', 'L4', 'R3'] as SideId[]).map((id) => (
          <CountPing key={id} x={anchors[id].plaque.x} y={anchors[id].plaque.y} r={Math.max(14, anchors[id].plaque.size * 1.4)} at={T.countAt[id]} width={2.6} />
        ))}
      </>
    );
    if (name === 'people') return (
      <>
        <StreetLife b={b} />
        <PipS03 b={b} />
        <NearWalkers b={b} />
      </>
    );
    return node;
  };

  return (
    <World sky={[{t: 0, tod: 'day', color: skies.day}]}>
      <XG m={M}>
        <BlueprintStreet
          pressAt={T.pressAt}
          popAt={T.popAt}
          plaqueAt={T.plaqueAt}
          gridAt={b.grid}
          stampAt={b.stamp}
          signSwingAt={b.swing}
          people={false}
          sun={sun}
          wrap={wrap}
          seed="bp"
        />
      </XG>
    </World>
  );
};

export default Scene03;
