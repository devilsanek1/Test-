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
import * as MAP from '../../v2r/world/map';
import {CM, INK_PX} from '../../v2r/palette';
import {Tier} from '../../lib/tier';
import {FormShade, Rim, fromLch, lch, multiply, step, tierFormFor} from '../../lib/light';
import {S1LobbyContact} from './V2S1_light';
import {HER} from '../../v2r/kit/cast/Her';
import {drawn} from '../../v2r/kit/cast/gait';
import {C, s1Step, s1HerXAt, HER_COAT_AT, S1_DRAW, s1Bold} from './V2S1_clock';
import {Figure, type FigureLight, type FigurePose} from '../../lib/figure';
import {useV6} from './v6';
import {InkScale} from '../../lib/inkComp';
import {FigSpec, FigValues, FigPart, RowFigure, figParts, FIG_H, HEAD_PARTS, TOTE_PARTS} from './V2S1_row_fig';
import {XG, mat} from '../../lib/xf';
import {Look} from '../../lib/exit';
import {useSwitches} from './switches';
import {s1DoorDarkD} from './V2S1_set_wing';
import {LINE_UNTIL, lineOn, paletteKey, subjectStrength} from './engine';

// ---------------------------------------------------------------- the looks (one model sheet)

/** Her (the kit's HER model sheet colours): plum head + low bun, the teal coat (hers only), plum trousers, cream tote,
 *  the potted desk plant under her left arm. */
export const herSpec = (coat: string, o: {leaf?: string; values?: FigValues} = {}): FigSpec => ({
  kind: 'her',
  coat,
  head: HER.hairColor,
  legs: HER.trousers,
  shoes: HER.shoes,
  skin: HER.skin,
  tote: HER.tote,
  plant: {pot: CM.brick, leaf: o.leaf ?? CM.sage},
  ...(o.values ? {values: o.values} : {}),
});

// ---------------------------------------------------------------- (the look test) the drawing as value shapes

/** The coat's width / h (the shoulders, 0.225 H: V2S1_row_fig) and the share of it in the body's shade band: 40 %
 *  (CRAFT §d.4's 25-40 %; REVIEW MUST 1: v1's band covered ~20 %, a 4-6 px sliver). */
const COAT_W = 0.225;
const SHADE_FRAC = 0.4;
/** The band's terminator in the figure's local px, right of the hips' centre (where the collar's lit half ends). */
const SPLIT = FIG_H * COAT_W * (0.5 - SHADE_FRAC);
/** dL* (CRAFT §d.3, tier A): the belt and the bow in the coat's deep shade, the collar's shade half before the band. */
const D_DEEP = {oat: -20, teal: -13};
const D_COLLAR = {oat: -9, teal: -7};
/** The copies' body band: -25 L* (tier A's deepest, CRAFT §d.3): below every field behind them but the dark door (the
 *  bridge's soffit L* 76, the rose spandrels 68-72), so the shade edge parts from them; her teal keeps lane E's -22. */
const D_COPY_BAND = -25;
/** The copies' lit edge on the key side (CRAFT §d.8, as hers: the rig's rim, 3.5 px at 170 px), the coat's whole
 *  key-facing side (no `cover` trim: a tall box's left side and its shoulders): the lit edge (L* ~93) parts from the
 *  bridge's soffit (76) and the spandrels (68-72) by 17 and more where the khaki coat (79) alone would not (a lit edge,
 *  never a line: inside the silhouette). */
const COPY_RIM = {px170: 3.5, cover: undefined};
const L_COLLAR_LIT = {oat: 5, teal: 7};
/** The heads: a crescent away from the key at -24 L* (tier A's -20 to -25; the cool family: white hair stays tinted,
 *  C* >= 8) over 34 % of the head, a lit cap 2.2 px on the key side (the hair's own colour +8 L*). */
const HEAD_SHADE = {dL: -24, frac: 0.34};
const HEAD_CAP = {dL: 8, px: 2.2, cover: 0.3};

/** The copies' coat under the value drawing: the oat -7 L*, its chroma +1, the hue kept. */
const OAT_STEP = -7;
const darkerOat = (oat: string) => {
  const q = lch(oat);
  return fromLch(q.L + OAT_STEP, q.C + 1, q.h);
};
const shadeOf = (surface: string, base: string, dL: number) => multiply(surface, step(base, tierFormFor(surface, base, dL)));
const lighter = (hex: string, dL: number) => {
  const q = lch(hex);
  return fromLch(Math.min(97, q.L + dL), q.C * (q.L + dL > 90 ? 0.8 : 1), q.h);
};

type RowTones = {copyCoat: string; copy: FigValues; her: FigValues; herLeaf: string; tote: {strength: number; base: string}; heads: Map<string, NonNullable<React.ComponentProps<typeof RowFigure>['head']>>};
const TONES = new Map<string, RowTones>();
/** The value tones for the live palette (memo per palette: CM moves with the 10b switch). */
function rowTones(): RowTones {
  const key = paletteKey();
  let v = TONES.get(key);
  if (v) return v;
  // the copies' oat one step darker (REVIEW MUST 1.5, the cold viewer's lever: the row's step was still under 15 with
  // the band and the rim alone): a khaki trench, its lit half still 11-12 L* clear of the rose piers
  const oat = darkerOat(CM.coatOat);
  const teal = CM.hero;
  const tote = HER.tote ?? CM.coatOat;
  const sage = lch(CM.sage);
  const heads = new Map<string, NonNullable<React.ComponentProps<typeof RowFigure>['head']>>();
  for (const hc of [...CM.ghostHead, HER.hairColor ?? CM.anchor]) {
    heads.set(hc, {
      shade: {strength: tierFormFor(hc, CM.shadeCool, HEAD_SHADE.dL), base: CM.shadeCool, frac: HEAD_SHADE.frac},
      cap: {color: lighter(hc, HEAD_CAP.dL), px: HEAD_CAP.px, cover: HEAD_CAP.cover},
    });
  }
  v = {
    copyCoat: oat,
    copy: {deep: shadeOf(oat, CM.shadeWarm, D_DEEP.oat), lit: lighter(oat, L_COLLAR_LIT.oat), shade: shadeOf(oat, CM.shadeWarm, D_COLLAR.oat), split: SPLIT},
    her: {
      deep: shadeOf(teal, CM.shadeCool, D_DEEP.teal),
      lit: lighter(teal, L_COLLAR_LIT.teal),
      shade: shadeOf(teal, CM.shadeCool, D_COLLAR.teal),
      split: SPLIT,
      // the strap: one 2.0 px line in the bag's deep shade (warm)
      strap: shadeOf(tote, CM.shadeWarm, -30),
    },
    // the plant she carries: a mid sage >= 10 L* off the lobby plant behind her (CM.sage, shown ~3 L* lighter)
    herLeaf: fromLch(sage.L - 9, sage.C * 1.1, sage.h),
    tote: {strength: tierFormFor(tote, CM.shadeWarm, -20), base: CM.shadeWarm},
    heads,
  };
  TONES.set(key, v);
  return v;
}
const notTote = (p: FigPart) => !TOTE_PARTS.includes(p.k);
const onlyTote = (p: FigPart) => TOTE_PARTS.includes(p.k);

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

// ---------------------------------------------------------------- (paint v6) the refined her

/** Painter v6's her (iteration, 2026-10-30): src/lib/figure's refined "you" in her place at the door, with the people
 *  recipe's next steps (people.md "Still short of ref 04"): slimmer (0.88), a shorter coat that shows her legs (the hem
 *  just above the knee), a thin tapered scarf end (the one flowing element), the low sun as a WARM FRONT light (she
 *  walks west, into it: its rim on her face and coat front) and the lit door behind her as a warm lit edge on her back,
 *  so she never melts into the wall or the door's dark frame. In profile, walking west (the film's stroll). */
export const V6_HER_POSE: Omit<FigurePose, 'step' | 'wind'> = {
  view: 'profile',
  stride: 0.9,
  tune: {slim: 0.88, hem: -335, scarf: {length: 300, w0: 13, w1: 3.5}},
};
export const V6_HER_LIGHT: FigureLight = {
  key: [-0.94, -0.34],
  local: {color: '#FFC07A', dL: 18, dir: [1, -0.1], width: 36},
};
const S1HerV6: React.FC<{x: number; y: number; h: number; step: number; t: number}> = ({x, y, h, step, t}) => (
  <Figure
    x={x}
    y={y}
    h={h}
    pose={{...V6_HER_POSE, step, wind: {t, strength: 0.8}}}
    light={V6_HER_LIGHT}
    look={{scarf: '#D9785F', scarfTip: '#A24A42'}}
    shadow="#B79C95"
  />
);

// ---------------------------------------------------------------- the slots

/** Her on the far towpath (from the step-out, 0.97) and the ghost row (from 2.00). The `towpath` slot. */
export const S1Row: React.FC = () => {
  const t = useTime();
  const {legs} = useContext(RowDevCtx);
  const sw = useSwitches();
  const v6 = useV6();
  if (t < C.steppingOut || sw.rowHidden) return null;
  const poses = MAP.s1RowAt(t);
  const step = s1Step(t);
  const members = MAP.S1_ROW.map((m, i) => ({m, p: poses[i]})).filter(({m, p}) => m.kind !== 'her' && p.visible);
  // far members first (the bend's far end is screen-left): they sit behind
  members.sort((a, b) => a.p.x - b.p.x);
  const her = poses[0];
  const hx = s1HerXAt(t);
  // (the look test, no outlines) the drawing as value shapes (REVIEW MUST 1): belt, bow, collar and sleeve on every
  // member, the heads' crescent and lit cap, her tote an object of its own (cream, a warm shade, its strap a line)
  const vals = sw.lineOff ? rowTones() : null;
  const herSp = vals ? herSpec(CM.hero, {leaf: vals.herLeaf, values: vals.her}) : herSpec(CM.hero);
  const herStep = step;
  const herTurn = lookBack(t);
  const herFig = <RowFigure seed="s1row/her" spec={herSp} x={hx} y={her.feetY} h={her.h} step={herStep} turn={herTurn} inkPx={HER_INK} partsFilter={vals ? notTote : undefined} head={vals ? {shade: vals.heads.get(HER.hairColor ?? CM.anchor)?.shade} : undefined} />;
  const herMask = vals ? <RowFigure seed="s1row/her" spec={herSp} x={hx} y={her.feetY} h={her.h} step={herStep} turn={herTurn} inkPx={HER_INK} partsFilter={notTote} holes={HEAD_PARTS} /> : herFig;
  const toteFig = vals ? <RowFigure seed="s1row/her" spec={herSp} x={hx} y={her.feetY} h={her.h} step={herStep} turn={herTurn} inkPx={HER_INK} partsFilter={onlyTote} /> : null;
  const herC: [number, number] = [hx, her.feetY - her.h / 2];
  const herSize: [number, number] = vals ? [her.h * COAT_W, her.h] : [her.h * 0.36, her.h];
  const sc0 = her.h / FIG_H;
  const herHeadD = vals
    ? figParts(herSp, {step: Math.round(herStep * 100) / 100, stride: 1, turn: Math.round(herTurn * 50) / 50})
        .filter((q) => q.d && (q.k === 'head' || q.k === 'bun'))
        .map((q) => q.d)
        .join('')
    : '';
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
  // (the look test) no outlines: the copies part from the wall by a lit and a shade face, as she does (CRAFT §c: B
  // without its shade faces goes flat); the shade per tier: the subject's faces at -22 L* (lane E's tierFormFor), her
  // teal coat in the cool family, the oat copies in the warm one
  const shadeCopies = sw.lineOff || sw.shadeTier;
  const herShade = sw.shadeTier ? {strength: subjectStrength(CM.hero, CM.shadeCool), base: CM.shadeCool} : {};
  const copyShade = sw.shadeTier ? {strength: subjectStrength(vals ? vals.copyCoat : CM.coatOat, CM.shadeWarm, vals ? D_COPY_BAND : -22), base: CM.shadeWarm} : {};
  const band = vals ? {frac: SHADE_FRAC} : {};
  return (
    <Tier tier="subject">
      <Look ink={!sw.lineOff}>
        {members.map(({m, p}) => {
          const age = m.kind === 'ghost' ? Number(m.id.slice(1)) : 0;
          const base = m.kind === 'ghost' ? ghostSpec(age, legs) : ghostSpec(6, legs);
          const spec: FigSpec = vals ? {...base, coat: vals.copyCoat, values: vals.copy} : base;
          const common = {seed: `s1row/${m.id}`, spec, x: p.x, y: p.feetY, h: p.h, step, stride: ghostStride(m.kind === 'ghost' ? age : 6), inkPx: GHOST_INK, at: m.popT ?? undefined, knockout: false, misregX: 0.3};
          const fig = <RowFigure key={m.id} {...common} head={vals ? vals.heads.get(base.head!) : undefined} rim={vals ? {px: (COPY_RIM.px170 * p.h) / FIG_H, cover: COPY_RIM.cover} : undefined} />;
          if (!shadeCopies || (m.popT !== null && m.popT !== undefined && t < m.popT)) return fig;
          const mask = vals ? <RowFigure {...common} holes={HEAD_PARTS} /> : fig;
          return (
            <React.Fragment key={m.id}>
              {fig}
              <FormShade of={mask} c={[p.x, p.feetY - p.h / 2]} size={vals ? [p.h * COAT_W, p.h] : [p.h * 0.36, p.h]} {...band} {...copyShade} />
            </React.Fragment>
          );
        })}
        {v6 ? null : herFig}
        {v6 ? null : <FormShade of={herMask} c={herC} size={herSize} {...band} {...herShade} />}
        {v6 ? null : toteFig}
        {!v6 && toteFig && vals ? <FormShade of={toteFig} c={[hx + 21.5 * sc0, her.feetY - 82.5 * sc0]} size={[20.8 * sc0, 24 * sc0]} frac={0.35} strength={vals.tote.strength} base={vals.tote.base} /> : null}
      </Look>
      {v6 ? <S1HerV6 x={hx} y={her.feetY} h={her.h} step={herStep} t={t} /> : <Rim of={coatEl} c={[hx, her.feetY - her.h * 0.45]} size={[her.h * 0.34, her.h * 0.6]} width={3.5} cover={0.35} />}
      {!v6 && vals ? (
        // her hair's rim on the key side, only where it crosses the door's dark members (REVIEW MUST 1; CRAFT §d.8)
        <>
          <defs>
            <clipPath id="s1herHairRim" clipPathUnits="userSpaceOnUse">
              <path d={s1DoorDarkD(t)} />
            </clipPath>
          </defs>
          <g clipPath="url(#s1herHairRim)">
            <XG m={mat.compose(mat.translate(hx, her.feetY), mat.scale(sc0, sc0))}>
              <Rim d={herHeadD} width={3 / sc0} cover={0.35} />
            </XG>
          </g>
        </>
      ) : null}
    </Tier>
  );
};

/** While her coat is paper (frame 0's draw-on, to HER_COAT_AT), its line is the teal's own deep shade: full contrast.
 *  (Read at render: the look test's palette switch moves CM.white.) */
const herPaperLine = (): Record<string, string> => ({[CM.white]: CM.hero});

/** Her behind the glass doors (t < 0.97; frame 0 and the loop underlay included): mid-step at 153 px, her coat paper
 *  until the flood's last frame (HER_COAT_AT). The `behindDoor` slot. */
export const S1HerBehindDoor: React.FC = () => {
  const t = useTime();
  const sw = useSwitches();
  if (t >= C.steppingOut) return null;
  const x = s1HerXAt(t);
  const y = MAP.S1_HER_STEP_OUT.feetFrom;
  const h = MAP.S1_SHEET.herHAtFacade;
  // (the look test, no outlines: REVIEW MUST 1) from the flood on her coat she is the same drawing as on the towpath
  // (belt, bow, collar, sleeve, the tote's strap, the mid sage plant); the sun's shade and rim come on as she steps out
  const vals = sw.lineOff && t >= HER_COAT_AT ? rowTones() : null;
  const spec = vals ? herSpec(CM.hero, {leaf: vals.herLeaf, values: vals.her}) : herSpec(t < HER_COAT_AT ? CM.white : CM.hero);
  return (
    <Tier tier="subject">
      <S1LobbyContact x={x} y={y} h={h} />
      <InkScale value={s1Bold(t)}>
        {/* (the no-outline switch: her construction line goes under her coat's colour, the last to land) */}
        <Look ink={lineOn(sw, t, LINE_UNTIL.her)}>
          <RowFigure seed="s1row/her" spec={spec} x={x} y={y} h={h} step={s1Step(t)} inkPx={HER_INK} draw={S1_DRAW.her} lineTone={t < HER_COAT_AT ? herPaperLine() : undefined} />
        </Look>
      </InkScale>
    </Tier>
  );
};
