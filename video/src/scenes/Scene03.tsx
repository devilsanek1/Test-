// S03 "Built from one blueprint" (storyboard v3, docs/storyboard_v3.md S03; cut(password) -> cut(it), 8.393-14.17 s).
// VO: "It's in PHP, the language everyone loves, and about seven out of ten websites run on it."
//
// Blueprint Street (shared BlueprintStreet, wide): a HARD CUT onto the bare plan (ten inked footprints with door swings,
// the sheet framed in S02's teal band, the plain running to a hazy horizon, the sun already in its wide slot); the grid
// draws on (lead into 'It's'), Pip drops in and lands ('in'), the solid tealDark elephant stamp slams under him ('PHP')
// and he settles on its rump, L3 pops on the title-block card, and in the ellipsis the whole street springs out of the
// plan in one gesture (press house, then L1 R1 L2 R2 L3 R3 L4 R4 L5). The bait ('the language everyone loves') plays on
// a calm frame: one screen lights, the street fills ('everyone'), Pip puffs up proudly ('loves'), the pen-nib sign
// swings with Bit on it. The count: ten spokes on the sun ('about'), seven count badges tick over the doors ('seven'),
// the card flips to the W3Techs footnote L4, three blank plates + three cream slices ('ten': the 7/10 pie), the seven
// PHP screens light with an elephant on their page ('websites'). 'it.': the pie pops back to solid and the sun takes off
// on its low glide-hop to S04 (mid-air at screen (810, 680) on the cut); Pip crouches to hop to the stoop.
//
// Camera: this scene's own keys (screen = (world - cam) x zoom + (540, 960)): a 4 % in-out-sine breath from rest
// (540, 950, 1.00) -> (545, 945, 1.04) until 'everyone', then locked. The sun is SCREEN space (its slot does not breathe).
// Notes: docs/scenes/S03.md.

import React from 'react';
import {World, useScene, useTime, skies} from '../lib';
import {Sun} from '../lib/Sun';
import {mat, XG} from '../lib/xf';
import {palette} from '../lib/theme';
import {BlueprintStreet, BLUEPRINT, blueprintAnchors, PopUp, popUpK, SideId, BlueprintId, LayerWrap} from './shared/sets';
import {LabelTag, Sticker, SunPie} from './shared/props';
import {beats, Beats, local, S03_START, W} from './scene03/beats';
import {camAt, camMat} from './scene03/camera';
import {BirdWire, CountPing, CountSigns, EdgeTree, FarPlain, Footprints, PressScreen, QuestionScribble, RoofSign, S03_BLANK, SheetFrame, SideOverlays, SideRows, VENT_HIDE, VentPatch, VentPuffs, VentS03} from './scene03/plan';
import {GroundS03} from './scene03/ground';
import {StampS03} from './scene03/stamp';
import {BitOnSign, NearWalkers, PipS03, PipShadow, StreetLife} from './scene03/cast';

// ---------------------------------------------------------------- labels (final_script section 6)

const L3 = ['PHP · the code most', 'websites are built with'];
const L4 = ['of sites whose server', 'language is known · W3Techs'];
/** Plaque / door anchors of every building (static). */
const anchors = blueprintAnchors();

// ---------------------------------------------------------------- timing tables (scene-local, from the beats)

const SIDE_ORDER: SideId[] = ['L1', 'R1', 'L2', 'R2', 'L3', 'R3', 'L4', 'R4', 'L5'];
/** The seven PHP sites in count order (near -> far, alternating; fix round 2: R1 -> R4 swap, see plan.tsx S03_BLANK). */
const COUNT: BlueprintId[] = ['P', 'L1', 'R2', 'L2', 'R3', 'L4', 'R4'];
const BLANK: SideId[] = S03_BLANK; // L3, L5, R1: blank plates on 'ten', screens dark to the cut

function tables(b: Beats) {
  const pressAt = b.popUp;
  const popAt = {} as Record<SideId, number>;
  // the nine side buildings: near -> far, alternating sides, 0.035 s apart, the first right after the press house
  SIDE_ORDER.forEach((id, i) => (popAt[id] = +(b.popUp + 0.04 + i * 0.035).toFixed(4)));
  // the count: P re-pulses (ping), the 6 side PHP signs' plates pop on 'seven' 0.08 s apart; the 3 blank plates on 'ten'
  const countAt = {} as Record<BlueprintId, number>;
  COUNT.forEach((id, i) => (countAt[id] = +(b.count + i * 0.08).toFixed(4)));
  const signAt: Partial<Record<SideId, number>> = {};
  COUNT.forEach((id) => {
    if (id !== 'P') signAt[id as SideId] = countAt[id];
  });
  BLANK.forEach((id, i) => (signAt[id] = +(b.ten + i * 0.05).toFixed(4)));
  // screens: the 7 PHP sites light in a wave on 'websites' (0.02 s; the press house first lit on 'the' re-pulses);
  // the 3 non-PHP sites stay unlit sage glass to the cut (7 lit, 3 dark = the pie)
  const lightAt: Partial<Record<SideId, number>> = {};
  COUNT.forEach((id, i) => {
    if (id !== 'P') lightAt[id as SideId] = +(b.websites + i * 0.02).toFixed(4);
  });
  return {pressAt, popAt, countAt, signAt, lightAt};
}

// ---------------------------------------------------------------- the scene

const Scene03: React.FC = () => {
  const t = useTime();
  const scene = useScene();
  const start = scene?.start ?? S03_START;
  const b = beats(start);
  const T = tables(b);
  const cam = camAt(t, local(W.everyone, start));
  const M = camMat(cam);

  // the sun: SCREEN space (690, 700) r110, pinned (no idle drift: it is S04's match object), the 7/10 pie, then the
  // low glide-hop: take-off at end(it), mid-air at (810, 680) on the cut, touch-down on 'This' at (930, 690).
  // Fix round 2: drawn ABOVE the side rows (nothing overlaps its slot; on the hop it passes in front of the R-row
  // roofs instead of slipping behind them, so the match object is whole at the cut).
  const sunHopAir = local(W.this, start) - b.sunHop; // end(it) -> 'This': 0.45 s, its midpoint is the cut
  // the pie: the three cream slices are three single-slice SunPies (each pops on its own, 0.03 s apart from ten-0.05:
  // whole by ~12.70), the ten spokes draw on 'about'; at b.solid (13.78) the whole pie pops back to solid in ONE frame
  // (f161 full pie, f162 a clean solid disc: no half-state), one frame before 'it.' and before the take-off squash
  const SLICES = [7, 8, 9];
  const pie = (r: number) =>
    t < b.solid ? (
      <>
        {SLICES.map((i, j) => (
          <SunPie key={i} r={r} n={10} cream={[i]} spokesAt={1e6} slicesAt={b.ten - 0.05 + j * 0.03} seed={`s03/pie${i}`} />
        ))}
        <SunPie r={r} n={10} cream={0} spokesAt={b.spokes} seed="s03/pie" />
      </>
    ) : null;
  const sun = (
    <XG m={mat.inv(M)}>
      <Sun cx={690} cy={700} r={110} drift={[0, 0]} hops={[{t: b.sunHop, to: [930, 690], h: 15, air: sunHopAir}]}>
        {pie}
      </Sun>
    </XG>
  );

  // the press house's pop-up scale (the vent-hiding clip follows it)
  const pressK = popUpK(t, T.pressAt);
  // the plan's 2 px jolt on the stamp's impact (two frames from contact)
  const jolt = t >= b.contact && t < b.contact + 0.067 ? 2 : 0;

  // layers injected into the set (each at its own depth)
  const wrap: LayerWrap = (name, _n, node) => {
    if (name === 'far') return (
      <>
        <FarPlain />
        {/* the set's far peeks only once the street is up (they would float above the bare plan's horizon) */}
        {t >= T.popAt.L5 + 0.12 ? node : null}
      </>
    );
    if (name === 'ground') return (
      // S03 draws the plan itself (scene03/ground.tsx: far rows + furniture inked from the cut, far -> near grid, no
      // stray `tb` box); the set's ground node is not used
      <XG m={mat.translate(0, jolt)}>
        <GroundS03 gridAt={b.grid} />
        <SheetFrame />
        <Footprints />
        <PipShadow b={b} />
        <StampS03 slamAt={b.stamp} />
      </XG>
    );
    if (name === 'press') return (
      <>
        {/* the set's roof vent (its cap poked into the sun's lower-left edge) is clipped out; S03's vent sits on the
            left slope (VentS03) and VentPatch redraws the roof band where the old one was */}
        <g clipPath="url(#s03pressClip)">{node}</g>
        <defs>
          <clipPath id="s03pressClip" clipPathUnits="userSpaceOnUse">
            <path d={`M-3000 -3000H4000V6000H-3000Z${VENT_HIDE}`} clipRule="evenodd" transform={pressK === 1 ? undefined : `translate(0 ${BLUEPRINT.press.base * (1 - pressK)}) scale(1 ${pressK})`} />
          </clipPath>
        </defs>
        <PopUp at={T.pressAt} x={560} y={BLUEPRINT.press.base}>
          <VentPatch />
          <VentS03 />
          <PressScreen lightAt={b.pressScreen} pulseAt={b.websites} />
          <Sticker x={648} y={1040} w={124} question={false} seed="s03/sticker" />
          <QuestionScribble x={727} y={1013} />
          <CountPing x={anchors.P.plaque.x} y={anchors.P.plaque.y} r={42} at={T.countAt.P} color={palette.sun} />
          <RoofSign swingAt={b.swing} />
          <BitOnSign swingAt={b.swing} twitchAt={b.doorway} />
        </PopUp>
        <VentPuffs times={[b.pipSettle, b.swing]} />
      </>
    );
    if (name === 'sides') {
      // S03 draws the set's two side rows itself (same layout, seeds, pop-ups and ink; re-coloured, no tiny plaques,
      // no PHP lock on the 3 non-PHP doors), plus the per-building overlays (screens, pages, awnings, window boxes), the
      // count signs, the tree, the bird wire and the sun
      const rows = <SideRows popAt={T.popAt} />;
      const allUp = T.popAt.L5 + 0.15;
      return (
        <>
          {/* the bleed slivers (beyond the frame edges) stand from frame 0: keep their ink overshoot out of the frame
              until the near buildings pop up over them */}
          {t < T.popAt.L1 ? <g clipPath="url(#s03sidesClip)">{rows}</g> : rows}
          <defs>
            <clipPath id="s03sidesClip" clipPathUnits="userSpaceOnUse">
              <rect x={2} y={-2000} width={1076} height={6000} />
            </clipPath>
          </defs>
          <SideOverlays popAt={T.popAt} lightAt={T.lightAt} />
          <CountSigns popAt={T.popAt} signAt={T.signAt} />
          <EdgeTree at={T.popAt.L1} />
          {t >= allUp ? <BirdWire drawAt={allUp} turnAt={b.heads} /> : null}
          {sun}
        </>
      );
    }
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
          gridAt={b.grid}
          stampAt={false}
          sign={false}
          people={false}
          titleBlock={(box) => <LabelTag kind="card" box={box} text={L3} fontSize={38 / 1.04} at={b.L3} flipTo={{at: b.flip, text: L4, fontSize: 36 / 1.04}} seed="s03/card" />}
          wrap={wrap}
          seed="bp"
        />
      </XG>
    </World>
  );
};

export default Scene03;
