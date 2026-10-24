// S10 "Half on versions too old" (storyboard v3: cut(server @0.8) -> cut(anymore), 39.634-45.618 on the take).
// VO: "Plus something like half of PHP sites run versions so old they're not officially supported anymore."
// The Old Quarter at day from door height: S09's tram wipes the hillside away, the three sites pop up on 'something',
// the far row on 'like', the sun becomes a 1/2 pie on 'HALF', the elephant plaques swing out on 'PHP' (L13 on the
// A-frame), siteM's plaque turns old (flip, cobweb with Bit caught in it, cane, droop), five far plates flip old, the
// makers' cart hands out stamped support tags and SKIPS the old site (the lob arcs over it), Pip goes 'hey!', and
// siteM's update stalls on 'anymore'. Camera: hold through the wipe, one 5 % sine push (anchored so the A-frame lands
// on screen 104-440 x 1256-1466), locked from 'of'. Docs: docs/scenes/S10.md.

import React from 'react';
import {World, ScreenSpace, Sun, useScene, useTime, useTransition} from '../lib';
import {wipeEdgeX} from '../lib/cine/wipers';
import {LabelTag, OLD_QUARTER, OldQuarter, SunPie, Tram, tramRoof} from './scene10/kit';
import {localBeats, SCENE, W} from './scene10/beats';
import {SecondRow} from './scene10/secondRow';
import {PLAQUE_SIZE, Sites, TAG_HANG} from './scene10/sites';
import {plaqueFacePoint} from './scene10/plaques';
import {Cart, CartTimes, Tosses} from './scene10/cart';
import {Pip, PipRiding} from './scene10/pip';
import type {Pt} from '../lib/sketch';

/** S09's tram Wiper as Film will run it (ENGINE 5: a 1300 px tram, half 660): its centre x at scene time t. */
export const TRAM = {w: 1300, half: 660, y: 1150, dur: 0.5};
const tramX = (t: number) => wipeEdgeX((t + TRAM.dur / 2) / TRAM.dur, 'right', TRAM.half);
/** Pip rides near the tram's tail; he leaps off it at ABS.pipHop. */
const tailX = (t: number) => tramX(t) - TRAM.w / 2 + 52;

const L13 = ['Rough estimate from', 'W3Techs data · only sites', 'that show their version ·', 'some hosts patch old', 'versions themselves'];
const TAG = 46; // support tag body height (world px)

const Scene10: React.FC = () => {
  const t = useTime();
  const scene = useScene();
  const tr = useTransition();
  const start = scene.id === 'none' ? SCENE.start : scene.start;
  const b = localBeats(start);
  const end = (scene.id === 'none' ? SCENE.end : scene.end) - start;
  const sg = OLD_QUARTER.sites;

  // the support tags land on siteL's / siteR's plaques (body centre = hang point + string + half the tag)
  const hangL = plaqueFacePoint({x: sg.L.sign.x, y: sg.L.sign.y, size: PLAQUE_SIZE.L}, TAG_HANG.L);
  const hangR = plaqueFacePoint({x: sg.R.sign.x, y: sg.R.sign.y, size: PLAQUE_SIZE.R}, TAG_HANG.R);
  const body = (h: Pt): Pt => [h[0], h[1] + TAG * 0.22 + TAG / 2];
  const cartT: CartTimes = {inAt: b.cartIn, pull1: b.pullTag1, toss1: b.toss1, land1: b.tick1, pull2: b.pullTag2, toss2: b.toss2, land2: b.tick2, end};

  // standalone preview only (no Film transition running): S09's tram, with Pip on its tail, as the wipe would show it
  const standIn = tr === null && t < TRAM.dur / 2 + 0.02;

  return (
    <World sky={[{t: 0, tod: 'day'}]} push={{to: 1.05, at: 0.25, dur: W.of - start - 0.25, anchor: [540, 1380]}}>
      <OldQuarter
        sun={
          <ScreenSpace>
            <Sun cx={700} cy={720} r={150} drift={[6, 0]} hops={[{t: b.sunHop, to: [497, 690], h: 40, air: b.sunLand - b.sunHop}]} moves={[{at: b.sunHop, dur: b.sunLand - b.sunHop, r: 110}]}>
              {(r) => <SunPie r={r} n={2} cream={1} spokesAt={b.pieSpoke} slicesAt={b.pieCream} solidAt={b.pieSolid} width={2.6} seed="s10/pie" />}
            </Sun>
          </ScreenSpace>
        }
        people={{walkers: [{...OLD_QUARTER.walkers[0], pace: 0.22}], riseAt: b.walkerRise, walk: b.walker}}
        furniture={[OLD_QUARTER.furniture[1]]}
        wrap={(name, _n, node) => {
          if (name === 'second') return <SecondRow popAt={b.second} flipAt={b.flip2} windowAt={b.pieSolid} tagsAt={b.wave} />;
          if (name === 'sites')
            return (
              <Sites
                popAt={[b.siteL, b.siteL + 0.1, b.siteL + 0.2]}
                plaqueAt={[b.plaques, b.plaques + 0.06, b.plaques + 0.12]}
                old={{flipOldAt: b.flipM, cobwebAt: b.cobweb, dustAt: b.dust, caneAt: b.cane, droopAt: b.droop, wobbleAt: b.wobble, bit: {at: b.bitIn, size: 15.3}}}
                tagL={{at: b.tick1, tickAt: b.tick1 + 0.03}}
                tagR={{at: b.tick2, tickAt: b.tick2 + 0.03}}
                updateAt={b.update}
              />
            );
          if (name === 'people')
            return (
              <>
                {node}
                <Cart T={cartT} />
                <LabelTag kind="sign" box={[125, 1262, 445, 1462]} fontSize={30 / 1.05} legH={30} text={L13} at={b.label} seed="s10/L13" />
                <Tosses T={cartT} land1={body(hangL)} land2={body(hangR)} tagSize={TAG} />
              </>
            );
          if (name === 'near')
            return (
              <>
                {node}
                <Pip T={{leap: b.pipHop, leapFrom: [tailX(b.pipHop), tramRoof(TRAM.y)], perk: b.pipPerk, lookPlaque: b.walker, hey: b.hey, heyEnd: b.heyEnd, out: b.pipOut}} />
              </>
            );
          return node;
        }}
      />
      {standIn ? (
        <ScreenSpace>
          <Tram x={tramX(t)} y={TRAM.y} w={TRAM.w} seed="s10/tram" />
          {t < b.pipHop ? <PipRiding x={tailX(t)} y={tramRoof(TRAM.y)} /> : null}
        </ScreenSpace>
      ) : null}
    </World>
  );
};

export default Scene10;
