// S11_people (S11 lane, G5b): who watches the price board in the drivers' room (density_plan_g5b S11). A row of four
// drivers' backs (tier A, heads ~128 px, cut by the frame bottom): a dock hand in hi-vis and a hard hat who raises a
// phone to snap the board after "five"; the laptop van's driver (cap with the small laptop badge) who puts a hand to
// the back of his head on "five"; a driver in a beanie with a coffee (two sips); a driver in a hood holding a clipboard
// up beside him (its sheet lifts on "five"). On "costs" the row leans in after the tall bar (staggered 2 frames); in
// the settle two of them turn to each other. Pip sits on a stack of crates of gold sticks at the right, reading the
// bars from behind: the head follows the tall bar up, ears-cover on "5x".
//
// The arms the kit's back-view figure does not have (the sip, the hand to the head, the held clipboard) are drawn here
// in each figure's own local space (kit winterPersonMat + BackRow's lean), right after that figure, so the row's
// overlaps stay true (each back covers the one to its left).
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, line, rect as rectInk, roundRect, torso} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, Pip3, StickCrate, Txt, W, WinterPerson, backRowLayout, ease01, personGeo, puffs, rings, sway, winterPersonMat} from '../kit';
import type {BackRowPerson, BackRowProps, Pip3Props, Pt} from '../kit';

// ---------------------------------------------------------------- the beats a panel passes

export type CrowdLife = {
  /** The row (row order, left to right) and whole-row moves. */
  row: BackRowPerson[];
  rowMoves?: BackRowProps['moves'];
  /** The coffee driver's sips: [t0, t1] (the cup up at the mouth). */
  sips?: [number, number][];
  /** The van driver's hand to the back of his head: [t0, t1]. */
  headScratch?: [number, number];
  /** The clipboard's sheet lifts. */
  clipFlutter?: number[];
  pip?: Omit<Pip3Props, 'x' | 'y'>;
};

/** Which back does what (row order). */
export const ROLE = {phone: 0, van: 1, coffee: 2, clip: 3} as const;

export const ROW_BASE: Omit<BackRowProps, 'people' | 'moves'> = {x0: -40, x1: 800, top: 1452, head: 128, n: 4, seed: 's11/row', lookX: 640};

// ---------------------------------------------------------------- the arms (figure-local px: hip line y 0, s 1)

type Arm = {sh: Pt; el: Pt; ha: Pt};
const lerpPt = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const lerpArm = (a: Arm, b: Arm, k: number): Arm => ({sh: lerpPt(a.sh, b.sh, k), el: lerpPt(a.el, b.el, k), ha: lerpPt(a.ha, b.ha, k)});
/** 0..1: how far an arm is raised for a set of windows (0.2 s up, 0.24 s down, eased). */
const raised = (t: number, wins: [number, number][]) => wins.reduce((m, [a, b]) => Math.max(m, Math.min(ease01(t, a, 0.2), 1 - ease01(t, b - 0.24, 0.24))), 0);

/** A sleeve from the shoulder through the elbow to the hand (ink under the coat colour), the hand a skin blob. */
const Sleeve: React.FC<{arm: Arm; w: number; coat: string; ink: number; seed: string; hand?: boolean}> = ({arm, w, coat, ink, seed, hand = true}) => {
  const d = `M${arm.sh[0].toFixed(2)} ${arm.sh[1].toFixed(2)}L${arm.el[0].toFixed(2)} ${arm.el[1].toFixed(2)}L${arm.ha[0].toFixed(2)} ${arm.ha[1].toFixed(2)}`;
  return (
    <>
      <path d={d} stroke={EMBER.ink} strokeWidth={w * 0.19 + ink * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={d} stroke={coat} strokeWidth={w * 0.19} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {hand ? <path d={blob(arm.ha[0], arm.ha[1], w * 0.075, w * 0.09, {seed: `${seed}/h`})} fill={EMBER.skin} stroke={EMBER.ink} strokeWidth={ink * 0.6} /> : null}
    </>
  );
};

/** The coffee driver's left arm: the cup held low at the side, raised to the mouth in each sip (steam always). */
const CoffeeArm: React.FC<{g: ReturnType<typeof personGeo>; coat: string; ink: number; sips: [number, number][]; seed: string}> = ({g, coat, ink, sips, seed}) => {
  const t = useTime();
  const hw = g.w / 2;
  const rest: Arm = {sh: [-hw * 0.74, -g.h + g.w * 0.3], el: [-hw * 1.04, -g.h + g.w * 0.7], ha: [-hw * 1.08, -g.h + g.w * 1.18]};
  const up: Arm = {sh: [-hw * 0.74, -g.h + g.w * 0.3], el: [-hw * 1.32, -g.h + g.w * 0.12], ha: [-g.hr * 1.22, g.hy + g.hr * 0.55]};
  const k = raised(t, sips);
  const arm = lerpArm(rest, up, k);
  const cw = g.w * 0.15;
  const cx = arm.ha[0] - cw * 0.1;
  const cy = arm.ha[1] - cw * 1.25;
  const tilt = -28 * k;
  const steam = puffs(t, {n: 3, life: 1.5, rise: g.w * 0.7, drift: -5, r0: 1.4, r1: 4.2, seed: `${seed}/st`});
  return (
    <>
      <Sleeve arm={arm} w={g.w} coat={coat} ink={ink} seed={seed} hand={false} />
      <g transform={`rotate(${tilt.toFixed(2)} ${arm.ha[0].toFixed(2)} ${arm.ha[1].toFixed(2)})`}>
        {steam.map((p, i) => (
          <circle key={i} cx={cx + p.x} cy={cy - cw * 0.2 + p.y} r={p.r} fill={EMBER.snow} />
        ))}
        <path d={`M${cx - cw / 2} ${cy}L${cx - cw * 0.4} ${cy + cw * 1.3}L${cx + cw * 0.4} ${cy + cw * 1.3}L${cx + cw / 2} ${cy}Z`} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={ink * 0.7} strokeLinejoin="round" />
        <path d={`M${cx - cw * 0.58} ${cy - cw * 0.16}h${cw * 1.16}v${cw * 0.3}h${-cw * 1.16}Z`} fill={EMBER.beam} />
        <path d={`M${cx - cw * 0.46} ${cy + cw * 0.5}h${cw * 0.92}v${cw * 0.36}h${-cw * 0.92}Z`} fill={EMBER.desk} />
      </g>
      <path d={blob(arm.ha[0], arm.ha[1], g.w * 0.075, g.w * 0.09, {seed: `${seed}/h`})} fill={EMBER.skin} stroke={EMBER.ink} strokeWidth={ink * 0.6} />
    </>
  );
};

/** The van driver's right hand to the back of his cap (a small rub while it is there). */
const HeadArm: React.FC<{g: ReturnType<typeof personGeo>; coat: string; ink: number; win: [number, number]; seed: string}> = ({g, coat, ink, win, seed}) => {
  const t = useTime();
  const k = raised(t, [win]);
  if (k <= 0.001) return null;
  const hw = g.w / 2;
  const rub = k > 0.95 ? Math.sin((t - win[0]) * 15) * g.hr * 0.14 : 0;
  const low: Arm = {sh: [hw * 0.74, -g.h + g.w * 0.3], el: [hw * 1.1, -g.h + g.w * 0.7], ha: [hw * 1.05, -g.h + g.w * 1.1]};
  const up: Arm = {sh: [hw * 0.74, -g.h + g.w * 0.3], el: [hw * 1.22, g.hy - g.hr * 0.35], ha: [g.hr * 0.4 + rub, g.hy - g.hr * 0.8]};
  return <Sleeve arm={lerpArm(low, up, k)} w={g.w} coat={coat} ink={ink} seed={seed} />;
};

/** The hooded driver's left hand holding a clipboard up beside him (the sheet lifts on a cue). */
const ClipArm: React.FC<{g: ReturnType<typeof personGeo>; coat: string; ink: number; flutter?: number[]; seed: string}> = ({g, coat, ink, flutter, seed}) => {
  const t = useTime();
  const hw = g.w / 2;
  const bob = sway(t, g.w * 0.012, 2.6, 0.8);
  const arm: Arm = {sh: [-hw * 0.74, -g.h + g.w * 0.3], el: [-hw * 1.3, -g.h + g.w * 0.22], ha: [-hw * 1.18, -g.h - g.w * 0.08 + bob]};
  const bw = g.w * 0.4;
  const bh = g.w * 0.52;
  const bx = arm.ha[0] - bw * 0.5;
  const by = arm.ha[1] - bh * 0.86;
  const lift = rings(t, flutter, 1, 3, 3.4);
  let rows = '';
  for (let i = 0; i < 4; i++) rows += `M${(bx + bw * 0.2).toFixed(2)} ${(by + bh * (0.32 + i * 0.14)).toFixed(2)}h${(bw * (0.5 + (i % 2) * 0.12)).toFixed(2)}`;
  return (
    <>
      <Sleeve arm={arm} w={g.w} coat={coat} ink={ink} seed={seed} hand={false} />
      <g transform={`rotate(${(-9 + sway(t, 1.2, 3.1, 0.3)).toFixed(2)} ${arm.ha[0].toFixed(2)} ${arm.ha[1].toFixed(2)})`}>
        <path d={roundRect(bx, by, bw, bh, bw * 0.06)} fill={EMBER.beam} stroke={EMBER.ink} strokeWidth={ink * 0.8} />
        <g transform={`translate(${bx + bw / 2} ${by + bh * 0.1}) skewY(${(lift * -12).toFixed(2)}) scale(1 ${(1 - Math.abs(lift) * 0.12).toFixed(3)}) translate(${-(bx + bw / 2)} ${-(by + bh * 0.1)})`}>
          <path d={`M${bx + bw * 0.1} ${by + bh * 0.1}h${bw * 0.8}v${bh * 0.84}h${-bw * 0.8}Z`} fill={EMBER.card} />
          <path d={rows} stroke={EMBER.ink} strokeWidth={ink * 0.4} fill="none" />
        </g>
        <path d={roundRect(bx + bw * 0.32, by - bh * 0.03, bw * 0.36, bh * 0.1, bw * 0.03)} fill={EMBER.frost} stroke={EMBER.ink} strokeWidth={ink * 0.5} />
      </g>
      <path d={blob(arm.ha[0], arm.ha[1], g.w * 0.08, g.w * 0.095, {seed: `${seed}/h`})} fill={EMBER.skin} stroke={EMBER.ink} strokeWidth={ink * 0.6} />
    </>
  );
};

/** The dock hand's hi-vis: the kit's vest bands sit low on a long back (past the frame), so two reflective bands across
 *  the shoulders, clipped to the same vest outline (kit WinterPerson 'hivis'). */
const VestBands: React.FC<{g: ReturnType<typeof personGeo>; ink: number; seed: string}> = ({g, ink, seed}) => {
  const vest = torso(0, 0, g.w * 0.8, g.h * 0.9, 0.3, 0.06);
  const id = `vb-${seed.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={vest} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={-g.w} y={-g.h * 0.8} width={g.w * 2} height={g.w * 0.085} fill={EMBER.snow} />
        <rect x={-g.w} y={-g.h * 0.64} width={g.w * 2} height={g.w * 0.085} fill={EMBER.snow} />
        <path d={`M${-g.w} ${-g.h * 0.8}H${g.w}M${-g.w} ${-g.h * 0.64 + g.w * 0.085}H${g.w}`} stroke={EMBER.ink} strokeWidth={ink * 0.3} />
        <path d={`M0 ${-g.h * 0.9}V0`} stroke={EMBER.ink} strokeWidth={ink * 0.35} strokeDasharray={`${g.w * 0.03} ${g.w * 0.02}`} />
      </g>
    </>
  );
};

// ---------------------------------------------------------------- the crates and Pip

/** A plain slatted crate (base centre x, y), a stencilled FRAGILE and an up-arrow. */
const Crate: React.FC<{x: number; y: number; w: number; h: number; seed: string; label?: boolean}> = ({x, y, w, h, seed, label}) => {
  const x0 = x - w / 2;
  let slats = '';
  for (let i = 1; i < 4; i++) slats += line(x0, y - (h * i) / 4, x0 + w, y - (h * i) / 4, {over: [0, 0], seed: `${seed}/s${i}`});
  return (
    <>
      <Fill rect={[x0, y - h, w, h]} color={EMBER.books[6]} seed={`${seed}/b`} />
      <Fill rect={[x0, y - h, w, 10]} color={EMBER.shelf} offset={false} />
      <Ink d={slats} width={W.hair} />
      {label ? (
        <>
          <Txt x={x - 10} y={y - h * 0.42} size={24} fill={EMBER.beam} fit={w * 0.6}>
            FRAGILE
          </Txt>
          <path d={`M${x0 + w * 0.86} ${y - h * 0.3}v-34m-10 12l10 -12l10 12`} fill="none" stroke={EMBER.beam} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : null}
      <Ink d={rectInk(x0, y - h, w, h, {seed: `${seed}/i`, over: [1, 3]}) + line(x0 + w * 0.07, y - h, x0 + w * 0.07, y, {over: [0, 0], seed: `${seed}/v1`}) + line(x0 + w * 0.93, y - h, x0 + w * 0.93, y, {over: [0, 0], seed: `${seed}/v2`})} width={W.mid} />
    </>
  );
};

/** Pip's perch: the top crate's rim. */
export const PIP_AT: Pt = [884, 1556];

const CratesAndPip: React.FC<{pip?: Omit<Pip3Props, 'x' | 'y'>}> = ({pip = {}}) => (
  <>
    <Crate x={904} y={1990} w={210} h={180} seed="s11/crate3" />
    <Crate x={872} y={1814} w={196} h={150} seed="s11/crate2" label />
    <StickCrate x={874} y={1664} w={178} h={104} sticks={4} seed="s11/crate1" />
    <Pip3 x={PIP_AT[0]} y={PIP_AT[1]} scale={1.15} pose="sit-back" seed={11} {...pip} />
  </>
);

// ---------------------------------------------------------------- the row

/** The drivers' row with their arms, then Pip on the crates at the right (drawn first: the last back overlaps the
 *  crates' left side, never Pip). */
export const S11Crowd: React.FC<{life: CrowdLife}> = ({life}) => {
  const t = useTime();
  const row: BackRowProps = {...ROW_BASE, people: life.row, moves: life.rowMoves};
  const layout = backRowLayout(row, t);
  return (
    <>
      <CratesAndPip pip={life.pip} />
      {layout.map(({i, person, lean, cx, hipY}) => {
        const g = personGeo(person.seed ?? '', {torsoH: person.torsoH});
        const s = person.s ?? 1;
        const ink = 4.8 / s;
        const coat = person.coat ?? EMBER.dc;
        const seed = `s11/arm${i}`;
        let arm: React.ReactNode = null;
        if (i === ROLE.phone) arm = <VestBands g={g} ink={ink} seed={seed} />;
        else if (i === ROLE.coffee) arm = <CoffeeArm g={g} coat={coat} ink={ink} sips={life.sips ?? []} seed={seed} />;
        else if (i === ROLE.van && life.headScratch) arm = <HeadArm g={g} coat={coat} ink={ink} win={life.headScratch} seed={seed} />;
        else if (i === ROLE.clip) arm = <ClipArm g={g} coat={coat} ink={ink} flutter={life.clipFlutter} seed={seed} />;
        return (
          <XG key={i} m={mat.about(mat.rotate(lean), cx, hipY)}>
            <WinterPerson {...person} />
            {arm ? <XG m={winterPersonMat(person, t)}>{arm}</XG> : null}
          </XG>
        );
      })}
    </>
  );
};
