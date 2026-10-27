// K4 cast: the public (TREATMENT section 3: 10-40 per shot, round heads, tombstone torsos, one accessory each, no two
// neighbours alike, never teal, half at rest). Every piece: canvas position (x, y) = its FEET (standing) or its SEAT
// line (seated) or the FRAME BOTTOM cut (near backs) / the SILL (window figures); a size in px; an optional build
// time `at` (ink draws on, then the fills pop); a seed.
//
//   <Person x={420} y={1095} h={150} seed="s1/jog" pose="jog" view="profile" walk={{rate: 3}} flip />
//   <Person x={300} y={980} h={90} seed="s2/w3" pose="walk" view="back" step={stepsAt(t, plan)} />
//   <Seated x={360} y={1510} h={110} seed="s1/mid/2" cup={k} />
//   <NearBack x={200} y={1920} hv={300} seed="s1/near/0" traits={{hair: 'hood'}} />
//   <WindowPerson x={610} y={540} hb={34} seed="s3/n1" act="water" />
// Sizes: standing h 16-400 px (LOD: >= 105 full detail, 42-105 simplified, 16-42 fill only, < 16 use FarCrowd);
// seated h 30-260; near backs hv 200-360; window figures hb 12-60.

import React from 'react';
import {useTime} from '../../../lib/time';
import {castRow, TraitOverrides, Traits, traitsFor} from './traits';
import {bustParts, BustOpts, Model, nearParts, seatParts, SeatOpts, StandPose, standParts, View} from './body';
import {drawn, gaitOf, selfSteps, STILL} from './gait';
import {cached, FigureG, inkFor, Lod, lodFor, misregFor, Parts, q100, q2} from './parts';

export type BuildProps = {
  /** Build start (scene s): ink draws on, then the fills pop 0.15 s later. Omit = already there. */
  at?: number;
  /** Fill lag after `at` (s). */
  fillLag?: number;
};

export type PersonProps = BuildProps & {
  /** Feet (canvas px). */
  x: number;
  y: number;
  /** Standing height (px). The traits' height factor (0.93-1.05) applies on top unless `exact`. */
  h: number;
  seed: string;
  /** Trait overrides (hair kind, coat colour, accessory...). */
  traits?: TraitOverrides;
  pose?: StandPose;
  view?: View;
  /** Face right (the geometry faces left). Back views ignore it except for which shoulder the bag is on. */
  flip?: boolean;
  /** Steps taken (gait.ts stepsAt: 12 drawings/s). Or `walk` to clock itself. */
  step?: number;
  /** Self-clocked walk: `rate` steps/s from t0, phase in steps. Drawn at 12/s. */
  walk?: {rate: number; t0?: number; phase?: number};
  /** Stride amplitude factor (1 normal). */
  stride?: number;
  turn?: number;
  tilt?: number;
  /** Ink px override (default by size: 4.8 / 3.4 / 2.2 / 1.6). */
  ink?: number;
  /** Level of detail override. */
  lod?: Lod;
  /** Use h as given (no per-person height factor). */
  exact?: boolean;
  /** pose 'reach': hand target relative to the feet (px, in the drawn left-facing frame). */
  reach?: [number, number];
  /** pose 'phoneEar': free-hand gesture 0..1. */
  gesture?: number;
  /** pose 'cycle': pedal turns per second (default 1.1). */
  pedal?: number;
  /** Ghost / silhouette / named-cast extras (internal: Her, Ghost, the staff use these). */
  model?: Partial<Model>;
  /** The pop's 4-frame scale settle (ghosts). */
  settle?: boolean;
  inkOrder?: 'seq' | 'all';
  inkDur?: number;
  fillMode?: 'pop' | 'snap';
  inkColor?: string;
  /** No misregistration (silhouettes). */
  exactFill?: boolean;
  /** Ink only with hidden lines knocked out (the bare outlines). */
  knockout?: boolean;
  /** Inside a parent's ExitSync (a group that leaves as one). */
  noSync?: boolean;
};

/** A standing / walking / jogging / cycling member of the public, or (via `model`) any named standing figure. */
export const Person: React.FC<PersonProps> = (p) => {
  const t = useTime();
  const tr = traitsFor(p.seed, p.traits);
  const m: Model = {...tr, ...(p.model ?? {})};
  const H = q2(p.exact ? p.h : p.h * tr.tall);
  const pose: StandPose = p.pose ?? (p.step !== undefined || p.walk ? 'walk' : 'stand');
  const view: View = p.view ?? 'back';
  const lod: Lod = p.lod ?? lodFor(H);
  let step = p.step ?? 0;
  if (p.walk) step = selfSteps(t, p.walk.rate, p.walk.t0 ?? 0, p.walk.phase ?? 0);
  const moving = pose === 'walk' || pose === 'jog' || ((pose === 'phoneEar' || pose === 'reach') && (p.step !== undefined || !!p.walk));
  const st = moving ? q100(step) : 0;
  const crank = pose === 'cycle' ? Math.round(drawn(t, 12) * (p.pedal ?? 1.1) * 12) * ((Math.PI * 2) / 12) : 0;
  const key = JSON.stringify([p.seed, p.traits ?? 0, p.model ?? 0, H, pose, view, lod, moving, st, p.stride ?? 1, q100(p.turn ?? 0), p.tilt ?? 0, p.reach ?? 0, q100(p.gesture ?? 0), q100(crank)]);
  const parts = cached(key, () =>
    standParts(m, {view, pose, H, moving, gait: moving ? gaitOf(st) : STILL, stride: p.stride, turn: p.turn, tilt: p.tilt, lod, seed: p.seed, reach: p.reach, gesture: p.gesture, crank}),
  );
  const inkPx = p.ink ?? (lod >= 2 ? 0 : inkFor(H));
  return (
    <FigureG x={p.x} y={p.y} flip={p.flip} seed={p.seed} settle={p.settle && p.at !== undefined ? {at: p.at} : undefined} noSync={p.noSync}>
      <Parts parts={parts} at={p.at} fillLag={p.fillLag} inkPx={inkPx} offset={p.exactFill || lod >= 2 ? false : misregFor(H, p.seed)} inkOrder={p.inkOrder} inkDur={p.inkDur} fillMode={p.fillMode} inkColor={p.inkColor} knockout={p.knockout} seed={p.seed} />
    </FigureG>
  );
};

export type SeatedProps = BuildProps & {
  /** The seat line (canvas px): where the torso meets the step / bench. */
  x: number;
  y: number;
  /** Visible seated height: head top to the seat (px). */
  h: number;
  seed: string;
  traits?: TraitOverrides;
  /** Takeaway cup: 0 (in the lap) .. 1 (at the mouth). Animate it (the S1 "a cup lifts"). */
  cup?: number;
  read?: boolean;
  phone?: boolean;
  notebook?: number;
  side?: 1 | -1;
  /** Head turn -1..1 (a head turns: S1 life, the S2 staffer turning to the reporter). */
  turn?: number;
  ink?: number;
  lod?: Lod;
  model?: Partial<Model>;
  noSync?: boolean;
};

/** A seated back (steps, benches, café chairs). */
export const Seated: React.FC<SeatedProps> = (p) => {
  const tr = traitsFor(p.seed, p.traits);
  const m: Model = {...tr, ...(p.model ?? {})};
  const h = q2(p.h * (0.96 + (tr.tall - 0.93) * 0.6));
  const Heq = h / 0.56;
  const lod: Lod = p.lod ?? lodFor(Heq);
  const o: SeatOpts = {h, lod, seed: p.seed, turn: p.turn === undefined ? undefined : q100(p.turn), cup: p.cup === undefined ? undefined : q100(p.cup), read: p.read, phone: p.phone, notebook: p.notebook === undefined ? undefined : q100(p.notebook), side: p.side};
  const key = JSON.stringify(['seat', p.seed, p.traits ?? 0, p.model ?? 0, o]);
  const parts = cached(key, () => seatParts(m, o));
  const inkPx = p.ink ?? (lod >= 2 ? 0 : inkFor(Heq));
  return (
    <FigureG x={p.x} y={p.y} seed={p.seed} noSync={p.noSync}>
      <Parts parts={parts} at={p.at} fillLag={p.fillLag} inkPx={inkPx} offset={lod >= 2 ? false : misregFor(Heq, p.seed)} seed={p.seed} />
    </FigureG>
  );
};

export type NearBackProps = BuildProps & {
  /** Centre of the shoulders at the CUT line (canvas px; usually y = 1920). */
  x: number;
  y: number;
  /** Visible height: head top to the cut (250-330 px on S1's steps). */
  hv: number;
  seed: string;
  traits?: TraitOverrides;
  turn?: number;
  /** Ink px (default 4.8: the front of the depth ladder). */
  ink?: number;
  model?: Partial<Model>;
};

/** A head-and-shoulders back cut by the frame bottom (the near row: S1's steps, S2 / S6 passers-by, S7's tables). */
export const NearBack: React.FC<NearBackProps> = (p) => {
  const tr = traitsFor(p.seed, p.traits);
  const m: Model = {...tr, ...(p.model ?? {})};
  const hv = q2(p.hv);
  const key = JSON.stringify(['near', p.seed, p.traits ?? 0, p.model ?? 0, hv, q100(p.turn ?? 0)]);
  const parts = cached(key, () => nearParts(m, {hv, seed: p.seed, turn: p.turn === undefined ? undefined : q100(p.turn)}));
  return (
    <FigureG x={p.x} y={p.y} seed={p.seed}>
      <Parts parts={parts} at={p.at} fillLag={p.fillLag} inkPx={p.ink ?? 4.8} offset={misregFor(hv * 1.6, p.seed)} seed={p.seed} />
    </FigureG>
  );
};

export type WindowPersonProps = BuildProps & {
  /** Centre of the shoulders at the SILL (canvas px). */
  x: number;
  y: number;
  /** Visible height: head top to the sill (12-60 px). */
  hb: number;
  seed: string;
  traits?: TraitOverrides;
  act?: BustOpts['act'];
  /** Watering can tip 0..1 (animate it). */
  tip?: number;
  turn?: number;
  view?: 'back' | 'profile';
  /** A one-colour silhouette (e.g. against a lit pane). */
  mono?: string;
  /** Idle sway (px, default 1.5): window people are never still. */
  sway?: number;
  flip?: boolean;
};

/** A neighbour in a window (12-60 px): a head and shoulders behind the sill, moving (sway, watering, reading). */
export const WindowPerson: React.FC<WindowPersonProps> = (p) => {
  const t = useTime();
  const tr = traitsFor(p.seed, p.traits);
  const m: Model = {...tr, mono: p.mono};
  const hb = q2(p.hb);
  const lod: Lod = hb >= 34 ? 1 : 2;
  const o: BustOpts = {hb, lod, seed: p.seed, act: p.act, tip: p.tip === undefined ? undefined : q100(p.tip), turn: p.turn === undefined ? undefined : q100(p.turn), view: p.view};
  const key = JSON.stringify(['bust', p.seed, p.traits ?? 0, p.mono ?? 0, o]);
  const parts = cached(key, () => bustParts(m, o));
  const sw = (p.sway ?? 1.5) * Math.sin((t / 2.6) * Math.PI * 2 + (p.seed.length % 7));
  return (
    <FigureG x={p.x + sw} y={p.y} flip={p.flip} seed={p.seed}>
      <Parts parts={parts} at={p.at} fillLag={p.fillLag} inkPx={lod <= 1 ? 1.6 : 0} offset={false} seed={p.seed} />
    </FigureG>
  );
};

// ---------------------------------------------------------------- rows

export type SeatedRowSpot = {x: number; y: number; h: number; turn?: number; cup?: number; read?: boolean; phone?: boolean; side?: 1 | -1; traits?: TraitOverrides};

/** A row of seated backs with no two neighbours alike (castRow). `spots` left to right. */
export const SeatedRow: React.FC<BuildProps & {seed: string; spots: SeatedRowSpot[]; stagger?: number; ink?: number}> = ({seed, spots, at, stagger = 0.05, ink}) => {
  const row = castRow(seed, spots.length, {over: spots.map((s) => s.traits ?? {})});
  return (
    <>
      {spots.map((s, i) => (
        <Seated key={i} x={s.x} y={s.y} h={s.h} seed={`${seed}/${i}`} traits={pin(row[i])} turn={s.turn} cup={s.cup} read={s.read} phone={s.phone} side={s.side} at={at === undefined ? undefined : at + i * stagger} ink={ink} />
      ))}
    </>
  );
};

/** Freeze a castRow pick as overrides (so a figure's traits do not depend on its own seed's draws). */
export const pin = (t: Traits): TraitOverrides => ({...t});

/** Never-teal guard for lanes that pass their own coat colours (dE76 >= 20 from the hero). */
export {NO_TEAL as PUBLIC_COAT_OK} from './traits';
