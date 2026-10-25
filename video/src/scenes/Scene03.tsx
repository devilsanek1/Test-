// S03 "Built from one blueprint" (storyboard v3, docs/storyboard_v3.md S03; cut(password) -> cut(it), 8.393-14.17 s).
// VO: "It's in PHP, the language everyone loves, and about seven out of ten websites run on it."
//
// Blueprint Street (shared BlueprintStreet, wide): a HARD CUT onto the bare plan (ten flat sand footprints with inked
// edges and door swings: the figure; the sheet framed in S02's teal band, a sparse grid on the plain running to the
// horizon: the ground; the sun already in its wide slot); the near grid draws on far -> near (lead into 'It's'), Pip drops in and lands ('in'), the solid tealDark elephant stamp slams under him ('PHP')
// and he settles on its rump, L3 pops on the title-block card, and in the ellipsis the whole street springs out of the
// plan in one gesture (press house, then L1 R1 L2 R2 L3 R3 L4 R4 L5). The bait ('the language everyone loves') plays on
// a calm frame: one screen lights, the street fills ('everyone'), Pip puffs up proudly ('loves'), the pen-nib sign
// swings with Bit on it. The count (polish round 1: ONE street encoding, the screens): ten spokes on the sun ('about');
// 'seven': the press plaque pings, then the six side PHP screens (L1 R1 L2 R2 L4 R3) light near -> far with an elephant
// page and an orange ping; the card flips to the W3Techs footnote L4; 'ten': the three non-PHP screens (L3 R4 L5) blink
// and go dark + three cream sun slices (the 7/10 pie); 'websites': the seven PHP pages re-pulse. 'it.': the pie pops back to solid and the sun
// takes off on its low glide-hop to S04 (mid-air at screen (810, 680) on the cut); Pip crouches to hop to the stoop.
//
// Camera: this scene's own keys (screen = (world - cam) x zoom + (540, 960)): a 4 % in-out-sine breath from rest
// (540, 950, 1.00) -> (545, 945, 1.04) until 'everyone', then locked. The sun is SCREEN space (its slot does not breathe).
// Notes: docs/scenes/S03.md.

import React from 'react';
import {World, useScene, useTime, skies, clamp} from '../lib';
import {Sun} from '../lib/Sun';
import {mat, XG} from '../lib/xf';
import {BlueprintStreet, BLUEPRINT, PopUp, popUpK, SideId, BlueprintId, LayerWrap} from './shared/sets';
import {Sticker, SunPie} from './shared/props';
import {beats, Beats, local, S03_START, W} from './scene03/beats';
import {camAt, camMat} from './scene03/camera';
import {AtticVent, BirdWire, EdgeTree, FarPlain, Footprints, PressElevation, PRESS_SCREEN, PressScreen, QuestionScribble, RoofSign, S03_BLANK, SheetFrame, SideElevations, SideOverlays, SideRows, RoofClutter, TickRing, VENT_HIDE, VentPatch, VentPuffs, VentS03} from './scene03/plan';
import {CardKnock, GroundS03} from './scene03/ground';
import {TitleCard} from './scene03/card';
import {StampS03} from './scene03/stamp';
import {BitOnSign, FarCrowd, NearWalkers, PipS03, PipShadow, StreetLife} from './scene03/cast';

// ---------------------------------------------------------------- labels (final_script section 6)

const L3 = ['PHP · the code most', 'websites are built with'];
const L4 = ['of sites whose server', 'language is known · W3Techs'];

// ---------------------------------------------------------------- timing tables (scene-local, from the beats)

const SIDE_ORDER: SideId[] = ['L1', 'R1', 'L2', 'R2', 'L3', 'R3', 'L4', 'R4', 'L5'];
/** The seven PHP sites in count order. A1 (finding: the first two side ticks landed on the extreme frame edges, L1 cut
 *  by the frame and R1 under the UI rail, so the count did not register): CENTRE-OUT, P, then R3, L4, R2, L2, R1, L1,
 *  so the wave travels outward from the press house, where the eye already is (was the storyboard's near -> far P, L1,
 *  R1, L2, R2, L4, R3). The three non-PHP sites are the storyboard's mid-depth L3, R4, L5 (plan.tsx S03_BLANK). */
const COUNT: BlueprintId[] = ['P', 'R3', 'L4', 'R2', 'L2', 'R1', 'L1'];
/** Each site's slot in the wave. A1 fix round 1 (finding: the wave's last two ticks, R1 under the right UI rail and L1 at
 *  the left frame edge, finished the count where a phone hides it): the wave ends on R2 / L2 (fully on screen) and R1 +
 *  L1 fire TOGETHER as one final pair, one gap after L2: six beats, seven screens. */
const COUNT_SLOT = [0, 1, 2, 3, 4, 5, 5];
/** Gap between count ticks (A1: 0.08 -> 0.06 s, so the wave is done by 12.255, before the card's flip at 12.30). */
const COUNT_GAP = 0.06;
const BLANK: SideId[] = S03_BLANK; // L3, R4, L5: the screens go dark on 'ten' (near -> far)

/** The sun's rest slot relative to S02's / S04's (690, 700) (A1 fix round 1), and S02's drift speed on the cut (px/s). */
const SUN_SLOT_OFF: [number, number] = [22, -10];
const SUN_DRIFT_IN = 6;
const smoothstep = (u: number) => u * u * (3 - 2 * u);

function tables(b: Beats) {
  const pressAt = b.popUp;
  const popAt = {} as Record<SideId, number>;
  // the nine side buildings: near -> far, alternating sides, 0.035 s apart, the first right after the press house
  SIDE_ORDER.forEach((id, i) => (popAt[id] = +(b.popUp + 0.04 + i * 0.035).toFixed(4)));
  // the count (polish round 1: the screens ARE the street's count): 'seven', centre-out, 0.06 s apart: P (its screen
  // glows and switches to the elephant page), then the six side PHP screens light with the elephant page + an orange
  // ping (R1 + L1 together, the final pair); 'ten': the three non-PHP screens blink and go dark (0.05 s apart);
  // 'websites': the seven PHP pages re-pulse in a wave (0.02 s)
  const countAt = {} as Record<BlueprintId, number>;
  COUNT.forEach((id, i) => (countAt[id] = +(b.count + COUNT_SLOT[i] * COUNT_GAP).toFixed(4)));
  const onAt: Partial<Record<SideId, number>> = {};
  const pulseAt: Partial<Record<SideId, number>> = {};
  COUNT.forEach((id, i) => {
    if (id === 'P') return;
    onAt[id as SideId] = countAt[id];
    pulseAt[id as SideId] = +(b.websites + i * 0.02).toFixed(4);
  });
  BLANK.forEach((id, i) => (onAt[id] = +(b.ten + i * 0.05).toFixed(4)));
  // each footprint ticks (heavy outline, 2 frames) as its building pops up on it (lot order = the pop order)
  const lotTick = [pressAt, ...SIDE_ORDER.map((id) => popAt[id])];
  return {pressAt, popAt, countAt, onAt, pulseAt, lotTick};
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
  // Polish round 1: drawn BEHIND the side rows (ref-2 baseline: the sun sits behind the far layer; the far R row's roof
  // corner overlaps its lower right) until its take-off squash (sunHop - 0.1), then IN FRONT for the hop (the squash
  // hides the layer swap; on the hop it passes in front of the R-row roofs, so the match object is whole at the cut).
  const sunHopAir = local(W.this, start) - b.sunHop; // end(it) -> 'This': 0.45 s, its midpoint is the cut
  // the pie: the three cream slices are three single-slice SunPies (each pops on its own, 0.03 s apart from ten-0.05:
  // whole by ~12.70), the ten spokes draw on 'about'; at b.solid (13.81) the whole pie pops back to solid in ONE frame
  // (f162 full pie, f163 (13.826) a clean solid disc: no half-state), on 'it.' (13.855, f164: within 0.03 s) and one
  // frame before the take-off squash (13.845)
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
  // A1 fix round 1 (finding: the disc at rest nearly touched the press-house roof and R4's roof corner, ~18-20 px each:
  // near-misses that flatten depth): the sun SETTLES into a slot 22 px right and 10 px up, SUN_SLOT_OFF from S02's
  // (690, 700). It arrives on the cut at (690, 700) still drifting right at S02's 6 px/s and eases into the slot by the
  // camera's lock ('everyone', a cubic Hermite: velocity-continuous at both ends, peak ~16 px/s); with R4 one storey
  // lower the disc clears the press roof by ~38 px and R3's roof corner by ~36. The hop is S04's own curve (from (690,
  // 700), the same `hops`) plus the slot offset blended out by the cut (smoothstep over the hop's first half: zero
  // velocity change at take-off and at the cut), so the sun is mid-air at (810, 680) on the cut, exactly where S04
  // picks it up, with S04's velocity.
  const settle = local(W.everyone, start);
  const sunOff = (() => {
    if (t < settle) {
      // Hermite from 0 (velocity S02's drift, (6, 0) px/s) to SUN_SLOT_OFF (velocity 0) over [0, settle]
      const u = clamp(t / settle);
      const h10 = u * u * u - 2 * u * u + u;
      const h01 = -2 * u * u * u + 3 * u * u;
      return [SUN_DRIFT_IN * settle * h10 + SUN_SLOT_OFF[0] * h01, SUN_SLOT_OFF[1] * h01];
    }
    const s = 1 - smoothstep(clamp((t - b.sunHop) / (sunHopAir / 2)));
    return [SUN_SLOT_OFF[0] * s, SUN_SLOT_OFF[1] * s];
  })();
  const sun = (
    <XG m={mat.compose(mat.inv(M), mat.translate(sunOff[0], sunOff[1]))}>
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
    // the far layer: S03's paper plain only (polish round 1: the set's sage far peeks are dropped: before the pop-up they
    // floated on the bare horizon, after it the only one in view peeked up between R4's roof and the sun disc, a 7 px
    // tangent with its lower right edge; without it the disc clears every roofline by >= 17 px)
    if (name === 'far') return <FarPlain />;
    if (name === 'ground') return (
      // S03 draws the plan itself (scene03/ground.tsx: far rows + furniture inked from the cut, far -> near grid, no
      // stray `tb` box); the set's ground node is not used
      <XG m={mat.translate(0, jolt)}>
        <GroundS03 gridAt={b.grid} streetAt={T.pressAt} knockAt={b.L3} />
        <CardKnock at={b.L3}>
          <SheetFrame />
        </CardKnock>
        <Footprints tickAt={T.lotTick} />
        <PipShadow b={b} />
        <StampS03 slamAt={b.stamp} />
      </XG>
    );
    if (name === 'press') return (
      <>
        {/* the set's roof vent (its cap poked into the sun's lower-left edge) is clipped out; S03's vent sits on the
            left slope (VentS03) and VentPatch redraws the roof band where the old one was */}
        {/* fix round 3: the gable's hairline construction elevation, drawn up from its footprint from the cut; the house
            pops up over it at 1.07 s */}
        <PressElevation pressAt={T.pressAt} />
        <g clipPath="url(#s03pressClip)">{node}</g>
        <defs>
          <clipPath id="s03pressClip" clipPathUnits="userSpaceOnUse">
            <path d={`M-3000 -3000H4000V6000H-3000Z${VENT_HIDE}`} clipRule="evenodd" transform={pressK === 1 ? undefined : `translate(0 ${BLUEPRINT.press.base * (1 - pressK)}) scale(1 ${pressK})`} />
          </clipPath>
        </defs>
        <PopUp at={T.pressAt} x={560} y={BLUEPRINT.press.base}>
          <VentPatch />
          <AtticVent />
          <VentS03 />
          {/* A1: the press house's count tick is its SCREEN (a stepped glow inside its browser window + the inked ring,
              as on the side screens, and its page switches to the elephant page): no plaque ping */}
          <PressScreen lightAt={b.pressScreen} pulseAt={[T.countAt.P, b.websites]} pageAt={T.countAt.P + 0.067} />
          <Sticker x={648} y={1040} w={124} question={false} seed="s03/sticker" />
          <QuestionScribble x={727} y={1013} />
          <TickRing x={PRESS_SCREEN.x + PRESS_SCREEN.w / 2} y={PRESS_SCREEN.y + PRESS_SCREEN.h / 2} r={PRESS_SCREEN.w * 0.36} at={T.countAt.P} />
          <RoofSign swingAt={b.swing} />
          <BitOnSign swingAt={b.swing} twitchAt={b.doorway} />
        </PopUp>
        <VentPuffs puffs={[{at: b.pipSettle, n: 3}, {at: b.swing, n: 2, fly: 0.45}]} />
      </>
    );
    if (name === 'sides') {
      // S03 draws the set's two side rows itself (same layout, seeds, pop-ups and ink; re-coloured, no tiny plaques,
      // no PHP lock on the 3 non-PHP doors), plus the per-building overlays (screens = the count, pages, awnings, window
      // boxes), the tree, the bird wire and the sun (behind the rows until its take-off squash, then in front)
      const rows = <SideRows popAt={T.popAt} />;
      const allUp = T.popAt.L5 + 0.15;
      const sunFront = t >= b.sunHop - 0.1;
      return (
        <>
          {sunFront ? null : sun}
          {/* A1 fix round 1: L2's water tank and R3's aerial, behind their facades (the cornice hides their bases) */}
          <RoofClutter popAt={T.popAt} />
          {/* fix round 3: the first two bays of each row as hairline construction elevations from the cut */}
          <SideElevations popAt={T.popAt} />
          {/* the bleed slivers (beyond the frame edges) stand from frame 0: keep their ink overshoot out of the frame
              until the near buildings pop up over them */}
          {t < T.popAt.L1 ? <g clipPath="url(#s03sidesClip)">{rows}</g> : rows}
          <defs>
            <clipPath id="s03sidesClip" clipPathUnits="userSpaceOnUse">
              <rect x={8} y={-2000} width={1064} height={6000} />
            </clipPath>
          </defs>
          <SideOverlays popAt={T.popAt} onAt={T.onAt} pulseAt={T.pulseAt} />
          <EdgeTree at={T.popAt.L1} />
          {t >= allUp ? <BirdWire drawAt={allUp} turnAt={b.heads} hopAt={b.birdHop} /> : null}
          {sunFront ? sun : null}
        </>
      );
    }
    if (name === 'people') return (
      <>
        <FarCrowd b={b} />
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
          titleBlock={() => <TitleCard text={L3} fontSize={38 / 1.04} at={b.L3} flipTo={{at: b.flip, text: L4, fontSize: 36 / 1.04}} />}
          wrap={wrap}
          seed="bp"
        />
      </XG>
    </World>
  );
};

export default Scene03;
