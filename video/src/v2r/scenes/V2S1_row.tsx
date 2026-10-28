// V2S1 helper (lane L1): HER and THE GHOST ROW (TREATMENT sections 3-4; map s1RowAt / S1_ROW / GHOST_POP; the shot
// clock V2S1_clock). She walks out of the glass doors at 0.97 and strolls west; on each clause an outline copy of her,
// greyer each time, pops one step ahead; on "life" the whole row takes ONE step and three more white-haired copies pop
// down the bend (bare see-through outlines read as ghosts: the G4 cold viewer).
// Every member is the SAME drawing (V2S1_row_fig: her long belted coat, collar, low bun, sleeves, a walking scissor), so
// the copies read as her, never as gowns: G1 = her now (dark plum head) -> G6 white-silver with a scarf; the coats
// paper; legs and shoes walk below a mid-calf hem in lockstep (s1Step). TIER A (CRAFT §b): her, the ghosts and the
// three bare outlines are the shot's subject (<Tier tier="subject">): the only full outline in the frame, one closed
// 3.0 px line in a deep warm shade (authored at INK_PX.mid, the clean pen sets it). Behind the glass (frame 0 and the
// loop underlay) her outline DRAWS ON as one stroke from S1_DRAW.at, her fills pale until the flood. Light: her form
// shade (the right, away from the sun) and her rim (her coat's left edge, the key side) here; the ground shadows
// V2S1_light.
import React, {createContext, useContext} from 'react';
import {useTime, clamp} from '../../lib/time';
import * as MAP from '../world/map';
import {CM, INK_PX} from '../palette';
import {Tier} from '../../lib/tier';
import {FormShade, Rim} from '../../lib/light';
import {S1LobbyContact} from './V2S1_light';
import {HER} from '../kit/cast/Her';
import {drawn} from '../kit/cast/gait';
import {C, s1Step, s1HerXAt, HER_COAT_AT, S1_DRAW, s1Bold} from './V2S1_clock';
import {InkScale} from '../../lib/inkComp';
import {FigSpec, RowFigure, figParts, FIG_H} from './V2S1_row_fig';
import {XG, mat} from '../../lib/xf';

// ---------------------------------------------------------------- the looks (one model sheet)

/** Her (the kit's HER model sheet colours): plum head + low bun, the teal coat (hers only), plum trousers, cream tote,
 *  the potted desk plant under her left arm. */
export const herSpec = (coat: string): FigSpec => ({
  kind: 'her',
  coat,
  head: HER.hairColor,
  legs: HER.trousers,
  shoes: HER.shoes,
  skin: HER.skin,
  tote: HER.tote,
  plant: {pot: CM.brick, leaf: CM.sage},
});

/** How the ghosts' legs and shoes are valued (the 216 px read test, scratch b_row/r4/legs_cmp.png): 'clamp' (chosen) = the head value
 *  down to G3's grey-silver and no paler (G1 dark like her trousers, G2 mid, G3-G6 #A9A5B5), shoes one step darker;
 *  'head' = the head value all the way (G5-G6 near-white legs); 'mid' = one fixed mid grey for every ghost. */
export type LegVariant = 'clamp' | 'head' | 'mid';
export const RowDevCtx = createContext<{legs: LegVariant}>({legs: 'clamp'});

const GH = CM.ghostHead;
function legValues(age: number, v: LegVariant): {legs: string; shoes: string} {
  if (v === 'head') return {legs: GH[age - 1], shoes: GH[Math.max(0, age - 2)]};
  if (v === 'mid') return {legs: GH[1], shoes: GH[0]};
  const i = Math.min(age - 1, 2);
  return {legs: GH[i], shoes: GH[Math.max(0, i - 1)]};
}

/** G1-G6: paper coat, the whole-head value, G4+ a grey-silver scarf and a softer back. */
export const ghostSpec = (age: number, v: LegVariant = 'clamp'): FigSpec => {
  const a = Math.max(1, Math.min(6, Math.round(age)));
  return {
    kind: 'ghost',
    // an oat coat, never paper-white: white coats read as lab coats or gowns tied at the back (cold viewer, G4)
    coat: CM.coatOat,
    head: GH[a - 1],
    ...legValues(a, v),
    // the scarf one fixed grey-silver (G3's head value): one step under G4's silver, and it still reads at 216 px on G5-G6's white
    scarf: a >= 4 ? GH[2] : undefined,
    soft: a >= 4 ? (a - 3) / 3 : 0,
  };
};
/** G4 a slightly shorter stride, G5-G6 shorter (same cadence: lockstep). */
export const ghostStride = (age: number) => (age >= 5 ? 0.78 : age >= 4 ? 0.9 : 1);
/** O1-O3 (kept for other readers): ink only, no fill, no age cue. NOT drawn in S1 since the G4 cold read: the bare
 *  see-through outlines read as "ghosts: until she dies"; on "life" three more white-haired copies (G6) pop instead. */
export const OUTLINE_SPEC: FigSpec = {kind: 'outline'};

/** Ink as authored (the clean pen's subject tier makes it 3.0 px on screen): ONE weight for the whole row (line weight
 *  by depth is retired: DIRECTION "Retired"). */
const HER_INK = INK_PX.mid;
const GHOST_INK = INK_PX.mid;

/** Her look back at W over her right shoulder (5.59, 0.22 s). */
const lookBack = (t: number) => {
  const u = clamp((drawn(t, 12) - MAP.S1_HER_LOOK_BACK_AT) / 0.22);
  return u * u * (3 - 2 * u);
};

// ---------------------------------------------------------------- the slots

/** Her on the far towpath (from the step-out, 0.97) and the ghost row (from 2.00). The `towpath` slot. */
export const S1Row: React.FC = () => {
  const t = useTime();
  const {legs} = useContext(RowDevCtx);
  if (t < C.steppingOut) return null;
  const poses = MAP.s1RowAt(t);
  const step = s1Step(t);
  const members = MAP.S1_ROW.map((m, i) => ({m, p: poses[i]})).filter(({m, p}) => m.kind !== 'her' && p.visible);
  // far members first (the bend's far end is screen-left): they sit behind
  members.sort((a, b) => a.p.x - b.p.x);
  const her = poses[0];
  const hx = s1HerXAt(t);
  const herFig = <RowFigure seed="s1row/her" spec={herSpec(CM.hero)} x={hx} y={her.feetY} h={her.h} step={step} turn={lookBack(t)} inkPx={HER_INK} />;
  const herC: [number, number] = [hx, her.feetY - her.h / 2];
  const herSize: [number, number] = [her.h * 0.36, her.h];
  // the rim on her COAT's left edge only (CRAFT §d.8: the subject's key side; conform_L1 §7): the coat part alone
  const coatD = figParts(herSpec(CM.hero), {step: Math.round(step * 100) / 100, stride: 1, turn: Math.round(lookBack(t) * 50) / 50})
    .filter((q) => q.d && ['coat', 'armN', 'collar'].includes(q.k))
    .map((q) => q.d)
    .join('');
  const sc = her.h / FIG_H;
  const coatEl = coatD ? (
    <XG m={mat.compose(mat.translate(hx, her.feetY), mat.scale(sc, sc))}>
      <path d={coatD} fill="#FFFFFF" />
    </XG>
  ) : (
    herFig
  );
  return (
    <Tier tier="subject">
      {members.map(({m, p}) => {
        const age = m.kind === 'ghost' ? Number(m.id.slice(1)) : 0;
        return (
          <RowFigure
            key={m.id}
            seed={`s1row/${m.id}`}
            spec={m.kind === 'ghost' ? ghostSpec(age, legs) : ghostSpec(6, legs)}
            x={p.x}
            y={p.feetY}
            h={p.h}
            step={step}
            stride={ghostStride(m.kind === 'ghost' ? age : 6)}
            inkPx={GHOST_INK}
            at={m.popT ?? undefined}
            knockout={false}
            misregX={0.3}
          />
        );
      })}
      {herFig}
      <FormShade of={herFig} c={herC} size={herSize} />
      <Rim of={coatEl} c={[hx, her.feetY - her.h * 0.45]} size={[her.h * 0.34, her.h * 0.6]} width={3.5} cover={0.35} />
    </Tier>
  );
};

/** While her coat is paper (frame 0's draw-on, to HER_COAT_AT), its line is the teal's own deep shade: full contrast. */
const HER_PAPER_LINE: Record<string, string> = {[CM.white]: CM.hero};

/** Her behind the glass doors (t < 0.97; frame 0 and the loop underlay included): mid-step at 153 px, her coat paper
 *  until the flood's last frame (HER_COAT_AT). The `behindDoor` slot. */
export const S1HerBehindDoor: React.FC = () => {
  const t = useTime();
  if (t >= C.steppingOut) return null;
  const x = s1HerXAt(t);
  const y = MAP.S1_HER_STEP_OUT.feetFrom;
  const h = MAP.S1_SHEET.herHAtFacade;
  return (
    <Tier tier="subject">
      <S1LobbyContact x={x} y={y} h={h} />
      <InkScale value={s1Bold(t)}>
        <RowFigure seed="s1row/her" spec={herSpec(t < HER_COAT_AT ? CM.white : CM.hero)} x={x} y={y} h={h} step={s1Step(t)} inkPx={HER_INK} draw={S1_DRAW.her} lineTone={t < HER_COAT_AT ? HER_PAPER_LINE : undefined} />
      </InkScale>
    </Tier>
  );
};
