// S10 "Half on versions too old" (storyboard v3: cut(server @0.8) -> cut(anymore), 39.634-45.618 on the take).
// VO: "Plus something like half of PHP sites run versions so old they're not officially supported anymore."
// The Old Quarter at day from door height: S09's tram wipes the hillside away, the three sites pop up on 'something',
// the far row on 'like', the sun becomes a 1/2 pie on 'HALF', the elephant plaques swing out on 'PHP' (L13 on the
// sandwich board), siteM's plaque turns old (flip, cobweb with Bit caught in it, cane, droop), three far plates flip old
// and sag, the maker + cart step out from behind the A-frame and hand out support tags, SKIPPING the old site (the lob
// arcs over it), Pip goes 'hey!' at it, and siteM's update stalls at 10 % on 'anymore'. Depth on the cart line: walker <
// cart < stoops < hanging plaques < A-frame < flying tags < Pip. Camera: hold through the wipe, one 5 % sine push
// (anchored so the A-frame's paper lands on screen 91-413 x 1262-1472), locked from 'of'. Docs: docs/scenes/S10.md.

import React from 'react';
import {World, ScreenSpace, Sun, TimeShift, ease as E, useScene, useTime, useTransition} from '../lib';
import {wipeEdgeX} from '../lib/cine/wipers';
import scenesJson from '../data/scenes.json';
import {LabelTag, OldQuarter, PopUp, SunPie} from './scene10/kit';
import {localBeats, SCENE, W} from './scene10/beats';
import {SecondRow} from './scene10/secondRow';
import {Plaques, plaqueRest, Sites, Stoops, TAG_HANG} from './scene10/sites';
import {plaqueFacePoint, TAG_W, tagBodyOffset} from './scene10/plaques';
import {Cart, CartTimes, Tosses} from './scene10/cart';
import {Pip} from './scene10/pip';
import {GAP_WALKER, GapWalker} from './scene10/walker';
import {BottomCrowd, FarStreet, SandwichBoard, StreetGround} from './scene10/street';
// S09's tram (its exported Wiper): read-only, to hand Pip over from its roof and to preview the wipe standalone
import {TRAM as S09_TRAM, TramWiper, tramPipAt} from './scene09/TramWiper';
import type {Pt} from '../lib/sketch';

/** The S09 -> S10 foreground wipe as Film runs it: 0.5 s centred on the cut, the edge = the tram's centre. */
const WIPE = {dur: 0.5, half: TramWiper.half ?? S09_TRAM.L / 2 + 8};
const wipeP = (t: number) => (t + WIPE.dur / 2) / WIPE.dur;
const tramX = (t: number) => wipeEdgeX(wipeP(t), 'right', WIPE.half);

/** The sun's hand-off hop height (fix round 2: 60 -> 14) and its shrink r 150 -> 110 now out-cubic (was in-out sine), so
 *  the disc top stays at the caption floor (measured: 554 on the cut, 564 at +0.067 s, >= 568 from +0.1 s; was 514-520 for 0.4 s; the take-off
 *  stretch alone lifts it to 552 on the cut). S09's own hop (h 60) is only on screen until the wipe edge passes the disc,
 *  ~0.06 s after the cut, when both suns are still at their take-off stretch: the two sides of the wipe still match. */
const SUN_HOP_H = 14;

const L13 = ['Rough estimate from', 'W3Techs data · only sites', 'that show their version ·', 'some hosts patch old', 'versions themselves'];

const Scene10: React.FC = () => {
  const t = useTime();
  const scene = useScene();
  const tr = useTransition();
  const start = scene.id === 'none' ? SCENE.start : scene.start;
  const b = localBeats(start);
  const end = (scene.id === 'none' ? SCENE.end : scene.end) - start;
  // the support tags land on siteL's / siteR's plaques (body centre = hang point + string + half the tag)
  const hangL = plaqueFacePoint(plaqueRest('L'), TAG_HANG.L);
  const hangR = plaqueFacePoint(plaqueRest('R'), TAG_HANG.R);
  const body = (h: Pt): Pt => [h[0], h[1] + tagBodyOffset(TAG_W)];
  const cartT: CartTimes = {parkAt: b.cartPark, toss1: b.toss1, land1: b.tick1, toss2: b.toss2, land2: b.tick2, rollAt: b.rollOut, end};

  // standalone preview only (no Film transition running): S09's own tram Wiper (Pip on its roof) as the wipe shows it
  const standIn = tr === null && t < WIPE.dur / 2;
  const s09 = (scenesJson as {id: string; start: number}[]).find((x) => x.id === 'S09');
  // the S09 sun's hop (PartB: takes off ON the cut from (700, 720) r150, lands at (500, 690) r110 after 0.56 s, h 60):
  // the same sun on both sides of the wipe; then it idles with a slow drift
  const sunAir = b.sunLand - b.cut;
  // Pip leaves S09's tram roof exactly where S09's Wiper last drew him (its tramPipAt, film time), with its velocity
  // (backward difference inside S09's roof window)
  const hand = tramPipAt(start + b.pipHop);
  const handV = (hand.x - tramPipAt(start + b.pipHop - 1 / 30).x) * 30;
  // the A-frame: 6 px lower than the set's slot box (a >= 20 px band of wall under siteL's raised plaque) and, fix round
  // 2b, 12 px further left and 24 px narrower (L13 still at full size), so its back leg clears the maker parked on the
  // open pavement by >= 7 px
  const signBox = (box: [number, number, number, number]): [number, number, number, number] => [box[0] - 12, box[1] + 6, box[2] - 36, box[3] + 6];
  // the street-gap wedge and its walker pop up with siteR (not floating in the empty street from the cut)
  const sitePops: [number, number, number] = [b.siteL, b.siteL + 0.1, b.siteL + 0.2];
  const wedgeAt = sitePops[2];

  return (
    <World sky={[{t: 0, tod: 'day'}]} push={{to: 1.05, at: 0.25, dur: W.of - start - 0.25, anchor: [540, 1380]}}>
      <OldQuarter
        sun={
          <ScreenSpace>
            <Sun cx={700} cy={720} r={150} drift={[5, 0]} hops={[{t: b.cut, to: [500, 690], h: SUN_HOP_H, air: sunAir}]} moves={[{at: b.cut, dur: sunAir, r: 110, ease: E.outCubic}]}>
              {(r) => <SunPie r={r} n={2} cream={1} spokesAt={b.pieSpoke} slicesAt={b.pieCream} solidAt={b.pieSolid} width={2.6} seed="s10/pie" />}
            </Sun>
          </ScreenSpace>
        }
        people={false}
        furniture="bike"
        noticeSign={(slot) => {
          const box = signBox(slot);
          return (
            <SandwichBoard box={box} ground={box[3] + 30} at={b.label}>
              <LabelTag kind="sign" box={box} fontSize={30 / 1.05} legH={30} frame={false} text={L13} seed="s10/L13" />
            </SandwichBoard>
          );
        }}
        wrap={(name, _n, node) => {
          // the empty street has a horizon from the cut: pavement to the eye line + a thin fill-only skyline
          if (name === 'far') return <FarStreet />;
          if (name === 'ground') return <StreetGround wedgeAt={wedgeAt} />;
          if (name === 'second') return <SecondRow popAt={b.second} flipAt={b.flip2} dropAt={b.dust + 0.1} windowAt={b.pieSolid} tagsAt={b.wave} />;
          if (name === 'sites')
            return (
              <>
                {/* the gap walker is FARTHER than the near row: drawn before it, so siteR's wall covers his exit (he
                    walks off up the gap and right, gone by 'old'); he pops up with the gap wedge (siteR) */}
                <PopUp at={wedgeAt} x={GAP_WALKER.x} y={GAP_WALKER.y}>
                  <GapWalker walkAt={b.walker} outAt={b.walkerOut} />
                </PopUp>
                <Sites popAt={sitePops} updateAt={b.update} wobbleAt={b.wobble} />
              </>
            );
          if (name === 'sign')
            return (
              <>
                {/* fix round 2b: the cart line is the OPEN PAVEMENT (y 1395): nearer than the stoops and the hanging
                    plaques, farther than the A-frame (it walks out from behind the board) and Pip's bollard */}
                <Stoops popAt={sitePops} />
                <Plaques
                  plaqueAt={[b.plaques, b.plaques + 0.06, b.plaques + 0.12]}
                  old={{flipOldAt: b.flipM, cobwebAt: b.cobweb, dustAt: b.dust, caneAt: b.cane, droopAt: b.droop, wobbleAt: b.wobble, nudgeAt: [b.skipNudge, b.hey + 0.04], bit: {at: b.bitIn, size: 20, bursts: [0, b.cane, b.not, b.update].map((x) => x - (b.bitIn + 0.4))}}}
                  tagL={{at: b.tick1, tickAt: b.tick1 + 0.03}}
                  tagR={{at: b.tick2, tickAt: b.tick2 + 0.03, ringAt: b.tick2 + 0.03}}
                />
                <Cart T={cartT} />
                {node}
                <Tosses T={cartT} land1={body(hangL)} land2={body(hangR)} tagSize={TAG_W} />
              </>
            );
          if (name === 'near')
            return (
              <>
                {node}
                <Pip T={{leap: b.pipHop, leapFrom: [hand.x, hand.y], leapScale: hand.scale, leapV: handV, perk: b.pipPerk, lookPlaque: b.walker, lookFar: b.flip2 + 0.04, lookWeb: b.cobweb + 0.1, lookCart: b.lookCart, lookLob: b.toss2 + 0.12, hey: b.hey, sparkEnd: b.hey + 0.46, heyEnd: b.heyEnd, out: b.pipOut}} />
              </>
            );
          if (name === 'foreground')
            return (
              <>
                {node}
                <BottomCrowd />
              </>
            );
          return node;
        }}
      />
      {standIn && s09 ? (
        <ScreenSpace>
          <TimeShift by={s09.start - start}>
            <TramWiper x={tramX(t)} p={wipeP(t)} dir="right" />
          </TimeShift>
        </ScreenSpace>
      ) : null}
    </World>
  );
};

export default Scene10;
