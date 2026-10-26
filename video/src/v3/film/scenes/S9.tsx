// S9 (19.40-21.32, "And so do AI data centers."): SCALE 2/3, the film's ONE big move, the S1 rise-over reveal
// (docs/look/CINEMATIC_GUIDE.md S1; docs/v3/camera_plan_g3.md row S9; board public/v3/animatic.json "S9").
//
// START: behind OUR ROOF (warm brick parapet, snow lip, one vent, cut by both side edges; lip at screen y 880) that
// hides the lower half of the AI data center; only its roof units (top y 660, under the caption band), parapet and
// sign show. RISE with real multiplane parallax (one camera, four planes): the ledge (depth -3.11) drops 510 px and
// out to a thin lip at the bottom, the town band at the hall's foot (depth -0.35) sinks a little faster than the
// hall (depth 0, 125 px), the sky (World) stays. LAND on "centers" (~20.8): the hall cut by both side edges (1290 px
// on screen), snowy houses at its foot (~1:7), our roof's lip and vent at the bottom (y ~1390), plain dusk sky above.
// Memory sticks arc in from the side edges from 19.75 (the lead of "AI") and dive into its roof.
//
// Camera = the board's: y 1080 -> 960, zoom 1.00 -> 1.04 (board camera, same world coordinates), as ONE eased move:
// cruise from the cut, a soft sine landing at 1.46 (20.86, 97 %), then a 3 % drift into the cut on "By". The ledge's
// extra travel comes from its depth (real parallax), not from its own move. Peak on screen 7.4 px per 60 fps frame
// (14.9 per 30 fps frame, the board's 14.8; STORYBOARD_STYLE section 7: at most 15).
import React from 'react';
import {World, ShotCam, Fill, clamp, type ToneKey} from '../../../lib';
import {Layer, trapezoid, type CamKey} from '../../../lib/cine/camera';
import {EMBER, FILM_TOD, DataCenter, RoofLedge, TownBand, Snowfall, StickFlight} from '../kit';

// ---- timing (scene seconds; VO "And" 0.00, "AI" 0.56, "data" 0.96, "centers" 1.20, cut on "By" 1.92)
const DUR = 1.92;
const LAND = 1.46; // 20.86: visibly landed on "centers"
const STICK0 = 0.35; // 19.75: the first stick launches (lead of "AI")

// ---- the camera: one move for every plane
const main = trapezoid(0, 0.35);
/** 97 % lands at LAND (cruise from the cut, sine landing), 3 % drifts on to the cut. */
const riseEase = (u: number) => 0.97 * main(clamp((u * DUR) / LAND, 0, 1)) + 0.03 * u;
export const S9_CAM: CamKey[] = [
  {t: 0, y: 1080, zoom: 1},
  {t: DUR, y: 960, zoom: 1.04, ease: riseEase},
];

// ---- planes (world px at the reference plane = the hall; the board's coordinates)
const DEPTH_TOWN = -0.35;
const DEPTH_SNOW = -0.6;
/** The ledge's parallax factor: its lip goes 880 -> 1390 on screen while the hall sinks 120 px (f = 4.11). */
const LEDGE_F = 4.11;
const DEPTH_LEDGE = 1 - LEDGE_F;
const LEDGE_Y = 1373.5; // the lip at rest: screen 880 at the start, 1390 at the end

// the hall: base centre (540, 1240), 1240 wide (1290 on screen at zoom 1.04), roof at 835, units from ~780
const DC = {x: 540, y: 1240, w: 1240, h: 405};
const ROOF = DC.y - DC.h;

// seven sticks, alternating sides, each diving into the roof between / beside the units
const STICKS: {side: -1 | 1; to: number}[] = [
  {side: -1, to: 400},
  {side: 1, to: 690},
  {side: -1, to: 470},
  {side: 1, to: 615},
  {side: -1, to: 350},
  {side: 1, to: 760},
  {side: -1, to: 545},
];
const STICK_GAP = 0.15;
const STICK_FLY = 0.6;

const S9: React.FC = () => (
  <World stage="context" sky={[{t: 0, tod: FILM_TOD, color: EMBER.sky}]}>
    <ShotCam keys={S9_CAM}>
      {/* the hall (reference plane): the snowy ground at its foot (frost: one step under our roof's snow lip), the
          building, the sticks diving into its roof */}
      <Layer depth={0}>
        <Fill rect={[-200, DC.y - 4, 1480, 900]} color={EMBER.frost} offset={false} />
        {/* the sign lit (ink letters on cold light): the board's white sign, the named building of O1's end */}
        <DataCenter x={DC.x} y={DC.y} w={DC.w} h={DC.h} variant="hall" signLitAt={0} seed="s9dc" />
        {STICKS.map((s, i) => {
          const t0 = STICK0 + i * STICK_GAP;
          const from: [number, number] = [s.side < 0 ? -110 : 1190, 762];
          return (
            <StickFlight
              key={i}
              seed={`s9st${i}`}
              from={from}
              to={[s.to, ROOF - 6]}
              t0={t0}
              t1={t0 + STICK_FLY}
              arc={64}
              w0={150}
              w1={104}
              rot0={-16 * s.side}
              rot1={38 * -s.side}
              end="shrink"
            />
          );
        })}
      </Layer>
      {/* the town band at the hall's foot: snow-capped houses, warm windows (~1:7 to the hall) */}
      <Layer depth={DEPTH_TOWN}>
        <TownBand y={1300} n={10} x0={-34} x1={1114} houseW={86} far={false} seed="s9town" />
      </Layer>
      {/* falling snow between us and the hall (its rect keeps every flake under the caption band) */}
      <Layer depth={DEPTH_SNOW}>
        <Snowfall x={-20} y={812} w={1120} h={1180} n={22} size={1.05} seed="s9snow" />
      </Layer>
      {/* OUR ROOF: the nearest plane, fastest, dropping to a thin lip at the bottom */}
      <Layer depth={DEPTH_LEDGE}>
        <RoofLedge y={LEDGE_Y} x0={-80} x1={1160} ventX={220} seed="s9ledge" />
      </Layer>
    </ShotCam>
  </World>
);
export default S9;

/** White captions on the dusk-blue sky (5.3:1). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
