// S01 local stand-ins (docs/scenes/S01.md). Each one draws through the set's `wrap` layers in the set's own world
// coords, so it can be dropped the moment the kit does the same thing:
//   LanternOff   a switched-off lantern = ink-dark glass + a one-frame squash pop (the kit steps cream -> sand,
//                ~1.15:1): govB's dome lantern on 'PURPOSE', govA's door lanterns on 'their'.
//   S01Shutter   govA / govB / govC's shutter hardware drawn by the scene (fix round 3; was GovCShutter for govC only):
//                props RollerShutter (govC with the partial-drop jolt `stopAt`: the kit's ShutterRig drops h x stop
//                with a full-closure bounce), the lettered tag, and the scene's BIG CREAM padlock (`S01Padlock`, the
//                kit's ShutterPadlock is a sand body with no colour prop: tan on tan, ~12 px on a phone). Each lock
//                click jolts the curtain 3 px (one frame). Fix round 4: TagString runs the lettered tag's string down
//                through its eyelet. Ink is compensated in the dive by the enclosing <InkScale> (plaza.tsx wrap).
// Fix round 3: S01FarCivic is gone (the kit's v3b far city ends on a horizon line over the plaza's far steps, three
// depth tiers, lit window dots that step off with the fill), and so is the lamp's LanternOff (cropped by the frame
// edge it read as a glitch; the set's cream -> sand step stays, the 'their' light event moved to govA's door).
import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, springAt, springs, useTime} from '../../lib/time';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {rectPath, roundRect} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {GovEvents, PLAZA, SI} from '../shared/sets';
import {BackSoonTag, DEPTH_INK, pendulum, RollerShutter} from '../shared/props';
import {measureCaption} from '../../lib/font';
import {line} from '../../lib/sketch';

// ---------------------------------------------------------------- a lantern switching off

/** Ink-dark glass over a lantern's glass rect (inset inside its ink frame) from `at`, popping on with a one-frame
 *  squash (1.2 x 0.84 -> 1 in 0.1 s), plus one cream glint stroke like the dead screens. */
export const LanternOff: React.FC<{r: [number, number, number, number]; at: number; seed: string}> = ({r, at, seed}) => {
  const t = useTime();
  if (t < at) return null;
  const [x, y, w, h] = r;
  const u = clamp((t - at) / 0.1);
  const k = u < 1 ? 1 - E.outCubic(u) : 0;
  const sx = 1 + 0.2 * k;
  const sy = 1 - 0.16 * k;
  const g = Math.max(2.5, w * 0.16);
  const glint = `M${x + w * 0.2} ${y + h * 0.62}L${x + w * 0.42} ${y + h * 0.16}L${x + w * 0.42 + g} ${y + h * 0.16}L${x + w * 0.2 + g} ${y + h * 0.62}Z`;
  return (
    <XG m={mat.about(mat.scale(sx, sy), x + w / 2, y + h / 2)}>
      <Fill d={rectPath(x, y, w, h)} color={palette.ink} offset={false} mode="none" seed={`${seed}/g`} />
      <Fill d={glint} color={palette.cream} offset={false} mode="none" seed={`${seed}/gl`} />
    </XG>
  );
};
/** govB's dome lantern glass (set: rect [508, 612, 20, 40] under the cap to (518, 600)), inset 3 px. */
export const DOME_GLASS: [number, number, number, number] = [511, 615, 14, 34];

// ---------------------------------------------------------------- the big cream padlock

/** A padlock that reads at phone size (fix round 3, review: the kit's 36 px sand lock hung on the clay wall under the
 *  rail = tan on tan, ~12 px specks): `size` = total height (shackle + body), a CREAM body with 3.4 px ink and an ink
 *  keyhole, hung over the shutter's bottom rail and last slats (tealDark behind: the strongest contrast in the facade).
 *  (x, y) = the body's centre. Pops 0.3 -> 1.3 -> 1 (0.13 s); the shackle snaps down 5 units at `lockAt`; on each
 *  `glintAt` two cream rays pop off the body's upper-left corner onto the dark slats (0.25 s). `ink` = stroke factor
 *  (an extra stroke factor; the dive compensation itself comes from the enclosing <InkScale>). */
export const S01Padlock: React.FC<{x: number; y: number; size: number; at?: number; lockAt?: number; glintAt?: number; ink?: number; seed: string}> = ({x, y, size, at, lockAt, glintAt, ink = 1, seed}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  // local frame: body 40 x 30 centred on (0, 0), shackle 26 wide rising 20 above the body: total 50 units
  const s = size / 50;
  let pop = 1;
  if (at !== undefined) {
    const u = t - at;
    pop = u < 0.05 ? 0.3 + 1.0 * E.outCubic(u / 0.05) : u < 0.13 ? 1.3 - 0.3 * E.inOutSine((u - 0.05) / 0.08) : 1;
  }
  const la = lockAt ?? (at !== undefined ? at + 0.05 : undefined);
  const sh = la !== undefined && t < la ? -5 : 0;
  const W = (SI.mid * ink) / s;
  const glint = glintAt !== undefined && t >= glintAt && t < glintAt + 0.25;
  const gk = glint ? 0.3 + 0.7 * E.outBack(1.8)(clamp((t - (glintAt as number)) / 0.05)) : 0;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(s * pop))}>
      <XG m={mat.translate(0, sh)}>
        <Ink d="M-10 -14V-24A10 10 0 0 1 10 -24V-14" width={W * 1.25} taper={false} seed={`${seed}/sh`} />
      </XG>
      <Fill d={roundRect(-20, -15, 40, 30, 5)} color={palette.cream} offset={false} mode="none" seed={`${seed}/b`} />
      <Ink d={roundRect(-20, -15, 40, 30, 5, {seed: `${seed}/bi`})} width={W} taper={false} seed={`${seed}/bi`} />
      <Fill d="M-3.4 -3a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0ZM-1.8 -1L-2.6 8H2.6L1.8 -1Z" color={palette.ink} offset={false} mode="none" seed={`${seed}/k`} />
      {glint ? (
        <XG m={mat.about(mat.scale(gk), -20, -15)}>
          <Ink d="M-24 -19L-36 -31M-26 -9L-42 -11" width={W * 1.15} color={palette.cream} taper={false} seed={`${seed}/gl`} />
        </XG>
      ) : null}
    </XG>
  );
};

// ---------------------------------------------------------------- the shutter hardware, drawn by the scene

/** The lettered tag's string run down THROUGH the eyelet, on top of the tag (props BackSoonTag draws the string before
 *  the tag's white fill, so it stops at the tag's top edge; fix round 4 review). Mirrors BackSoonTagBase's lettered
 *  layout (one line 'back soon', width `size`) and its swing (pendulum -16 deg, 0.5 s, 0.8; spring pop), so it rides
 *  the tag exactly. Drop when the kit draws its string after the fill. */
const TagString: React.FC<{x: number; y: number; size: number; at: number; tapAt?: number | number[]; width: number; seed: string}> = ({x, y, size: W, at, tapAt, width, seed}) => {
  const t = useTime();
  if (t < at) return null;
  let a = pendulum(t, at, -16, 0.5, 0.8);
  for (const tp of tapAt === undefined ? [] : Array.isArray(tapAt) ? tapAt : [tapAt]) a += pendulum(t, tp, 14, 0.5, 0.9);
  const pop = Math.min(1, 0.3 + springAt(t, at, springs.pop) * 0.7);
  const m1 = measureCaption('back soon', 100) / 100;
  const fs = Math.min((W * 0.84) / m1, W * 0.34);
  const n = Math.min(W * 0.14, fs * 0.6);
  const str = Math.max(6, fs * 0.36);
  const ey = str + n * 0.62;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(a), mat.scale(pop))}>
      <Ink d={line(0, str - 2, 0, ey + 1, {over: [0, 0], seed: `${seed}/str2`})} width={width * 0.6} taper={false} seed={`${seed}/str2`} />
    </XG>
  );
};

/** Padlock size (total height) per building: govB (the dive target) 58, govA / govC 52. */
export const S01_PADLOCK_SIZE: Record<'govA' | 'govB' | 'govC', number> = {govA: 52, govB: 58, govC: 52};
/** The lock click (shackle snap + curtain jolt) after each padlock's pop starts. */
export const LOCK_CLICK = 0.05;

/** One-frame curtain jolt (px, down) at a lock click: +3, then +1, then rest. */
const jolt = (t: number, at?: number) => {
  if (at === undefined || t < at) return 0;
  const f = (t - at) * 30;
  return f < 1 ? 3 : f < 2 ? 1 : 0;
};

/** The set's WindowRig hardware for one building, drawn by the scene on top of the set (which then gets the building's
 *  events WITHOUT shutterAt / padlockAt / tagAt / glintAt and still draws the rolled-up shutter box, redrawn identically
 *  here): props RollerShutter over the FULL window with `stopAt` (govC: gravity fall 0.16 x sqrt(stop) s, then the
 *  1-frame jolt +5 / -2 px), the lettered tag hanging from the rail (same props / seeds as the set's BackSoonSlot), and
 *  `S01Padlock` over the rail. The padlock's click jolts the curtain 3 px (the rail, tag and lock ride it). Strokes
 *  are compensated in the dive by the enclosing <InkScale>. */
export const S01Shutter: React.FC<{id: 'govA' | 'govB' | 'govC'; ev: GovEvents; seed?: string}> = ({id, ev, seed = 'plaza'}) => {
  const t = useTime();
  const g = PLAZA.gov[id];
  const [x, y, w, h] = g.window;
  const stop = clamp(ev.shutterStop ?? ev.stopAt ?? 1, 0.05, 1);
  const click = ev.padlockAt !== undefined ? ev.padlockAt + LOCK_CLICK : undefined;
  const j = jolt(t, click);
  const dy = (stop - 1) * h + j;
  const rail = y + stop * h + j; // the bottom rail's bottom edge once the curtain is down
  const px = ev.padlockProps?.x ?? g.padlock[0];
  return (
    <>
      {stop < 1 ? (
        <RollerShutter x={x} y={y} w={w} h={h + j / stop} box={18} slamAt={ev.shutterAt} stopAt={stop} width={SI.mid} seed={`${seed}/${id}/sh`} />
      ) : (
        <RollerShutter x={x} y={y} w={w} h={h + j} box={18} slamAt={ev.shutterAt} width={SI.mid} seed={`${seed}/${id}/sh`} />
      )}
      {ev.tagAt !== undefined ? (
        <>
          <BackSoonTag at={ev.tagAt} tapAt={ev.tagTapAt} width={DEPTH_INK.far} seed={`${seed}/${id}/tag`} {...ev.tagProps} x={ev.tagProps?.x ?? g.tag[0]} y={ev.tagProps?.y !== undefined ? ev.tagProps.y + j : g.tag[1] + dy} />
          {ev.tagProps?.lettered ? <TagString at={ev.tagAt} tapAt={ev.tagTapAt} size={ev.tagProps?.size ?? 100} width={DEPTH_INK.far} x={ev.tagProps?.x ?? g.tag[0]} y={ev.tagProps?.y !== undefined ? ev.tagProps.y + j : g.tag[1] + dy} seed={`${seed}/${id}/tag`} /> : null}
        </>
      ) : null}
      {ev.padlockAt !== undefined ? <S01Padlock x={px} y={rail - 20} size={S01_PADLOCK_SIZE[id]} at={ev.padlockAt} lockAt={click} glintAt={ev.glintAt} seed={`s01/${id}/pl`} /> : null}
    </>
  );
};
