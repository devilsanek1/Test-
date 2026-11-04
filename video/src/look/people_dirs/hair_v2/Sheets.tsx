// HAIR v2: the stills (RECIPE.md (e)), one composition each. Text is kept to labels: the owner looks at the drawings.
//   HvS1  her, before and after, three views (640 px) + the same at film size (200 px, 1:1)
//   HvS2  the hair library: 12 cuts on 12 people, each from behind and in 3/4 at 3x film size, then at film size 1:1
//   HvS3  the wind states: W3, W2, M4 in calm, a breeze, walking and a turn of the head (3x film size)
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {PLATE_V6, PLATE_W, PLATE_H} from './plate';
import {Figure} from '../graphic/Figure';
import {BG} from '../graphic/palette';
import type {Built} from '../graphic/part';
import {build as buildOld} from '../graphic_faces/cast';
import {herV2, personV2, lookOf, LOOKS, herSkel, herLedge, groundPair, railLean, type View} from './people';
import {STATES, BREEZE, type StateName} from './states';
import {cva, LINEUP, heightNumbers} from './stance';

export const INK = '#3B2C2E';
export const SUB = '#7A6668';
export const FONT = 'Inter, DejaVu Sans, sans-serif';

export const Tx: React.FC<{x: number; y: number; s?: number; w?: number; c?: string; a?: 'start' | 'middle' | 'end'; children: React.ReactNode}> = ({x, y, s = 21, w = 400, c = SUB, a = 'start', children}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={s} fontWeight={w} fill={c} textAnchor={a}>
    {children}
  </text>
);

/** A figure's head and shoulders, magnified: the figure drawn `H` px tall with its head at (cx, cy) of the box. */
export const Crop: React.FC<{fig: Built; x: number; y: number; w: number; h: number; H: number; id: string; at?: number; dx?: number; bg?: string; mono?: string}> = ({fig, x, y, w, h, H, id, at = 0.32, dx = 0, bg, mono}) => {
  const s = H / 1000;
  const cx = x + w / 2 + dx - fig.head[0] * s;
  const cy = y + h * at - fig.head[1] * s;
  return (
    <g>
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} rx={10} />
      </clipPath>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={bg ?? BG.panel} />
      <g clipPath={`url(#${id})`}>
        <Figure fig={fig} x={cx} y={cy + H} h={H} uid={`${id}f`} mono={mono} shadow={false} />
      </g>
    </g>
  );
};

// ================================================================ S1: her, before and after
export const S1_W = 2400;
export const S1_H = 1330;
const VIEWS1: {view: View; label: string}[] = [
  {view: 'q', label: 'front 3/4'},
  {view: 'p', label: 'walking, profile'},
  {view: 'b', label: 'from behind'},
];
export const HvS1: React.FC = () => {
  const panel = (x: number, after: boolean) => {
    const w = 1140;
    const col = w / 3;
    return (
      <g>
        <rect x={x} y={150} width={w} height={760} rx={16} fill={BG.panel} />
        <Tx x={x + 24} y={194} s={30} w={800} c={INK}>
          {after ? 'AFTER: the new hair, proportions and stance' : 'BEFORE: her as drawn now (direction C, LASH)'}
        </Tx>
        {VIEWS1.map((v, i) => {
          const fig = after ? herV2({view: v.view, px: 640}) : buildOld('herEvening', v.view, 'lash');
          return (
            <g key={i}>
              <Figure fig={fig} x={x + col * (i + 0.5)} y={890} h={640} uid={`s1${after ? 'a' : 'b'}${i}`} />
              <Tx x={x + col * (i + 0.5)} y={234} s={19} a="middle">
                {v.label}
              </Tx>
            </g>
          );
        })}
        {/* film size, 1:1, on the mid tone */}
        <rect x={x} y={930} width={w} height={300} rx={16} fill={BG.mid} />
        {VIEWS1.map((v, i) => {
          const fig = after ? herV2({view: v.view, px: 200}) : buildOld('herEvening', v.view, 'lash');
          return <Figure key={i} fig={fig} x={x + 160 + i * 150} y={1190} h={200} uid={`s1f${after ? 'a' : 'b'}${i}`} />;
        })}
        {VIEWS1.map((v, i) => {
          const fig = after ? herV2({view: v.view, px: 156}) : buildOld('herEvening', v.view, 'lash');
          return <Figure key={`m${i}`} fig={fig} x={x + 660 + i * 130} y={1190} h={156} uid={`s1m${after ? 'a' : 'b'}${i}`} />;
        })}
        <Tx x={x + 24} y={966} s={19} c="#F4EDE6">
          film size, 1:1: 200 px and 156 px tall
        </Tx>
      </g>
    );
  };
  const a = Math.round(cva(herSkel('p')));
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={S1_W} height={S1_H} viewBox={`0 0 ${S1_W} ${S1_H}`}>
        <Tx x={40} y={70} s={44} w={800} c={INK}>
          S1  Her, before and after: hair, proportions, stature
        </Tx>
        <Tx x={42} y={112} s={22}>
          {`Same evening look, same LASH face. After: hair W3 (long shattered layers, curtain bangs, a lazy 2B wave) as a mass plus tapered locks, a gap, a flyaway; the neck leans forward (craniovertebral angle ~${a} degrees, was ~72);`}
        </Tx>
        <Tx x={42} y={140} s={22}>
          the back has its S, the hip shift shows through the coat, one arm hangs off the body (the bag in hand), the other hand in the pocket with the elbow out. Figures 640 px; below, film size.
        </Tx>
        {panel(40, false)}
        {panel(1220, true)}
        <Tx x={42} y={1290} s={22} c={INK}>
          Look at: is the hair alive and never one firm shape, yet clean and premium? Does she stand relaxed and confident, neither stiff nor slumped? Is she still the same person?
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ S2: the hair library
export const S2_W = 2400;
export const S2_H = 1500;
const NAMES: Record<string, string> = {
  W1: 'W1  the soft swing bob',
  W2: 'W2  the lazy wavy lob',
  W3: 'W3  long layers, curtain bangs',
  W4: 'W4  the butterfly cut',
  W5: 'W5  the shag',
  W6: 'W6  curls and coils, the cloud',
  W7: 'W7  the bixie',
  M1: 'M1  the textured crop',
  M2: 'M2  the middle-part flow',
  M3: 'M3  the modern mullet',
  M4: 'M4  the curly mop',
  M5: 'M5  twists on a taper',
};
export const HvS2: React.FC = () => {
  const cellW = 386;
  const x0 = 34;
  const rowY = [190, 840];
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={S2_W} height={S2_H} viewBox={`0 0 ${S2_W} ${S2_H}`}>
        <Tx x={40} y={70} s={44} w={800} c={INK}>
          S2  The hair library: twelve cuts, as worn in New York and Los Angeles now
        </Tx>
        <Tx x={42} y={112} s={22}>
          Each cut on its own person (skins S1-S6, the library's hair colours): from behind and in 3/4 magnified 3.7x (drawn with the film-size detail), then at film size 1:1 (200 px) in colour and
        </Tx>
        <Tx x={42} y={140} s={22}>
          filled black (the silhouette test). Every head: a base mass plus tapered locks, 1-2 gaps, a flyaway or none at rest, two flat tones and a sheen across the locks. Calm air.
        </Tx>
        {LOOKS.map((lk, i) => {
          const r = i < 6 ? 0 : 1;
          const k = i % 6;
          const x = x0 + k * (cellW + 8);
          const y = rowY[r];
          const back = personV2(lk, {view: 'b', px: 200});
          const q = personV2(lk, {view: 'q', px: 200});
          const backS = personV2(lk, {view: 'b', px: 200});
          const qS = personV2(lk, {view: 'q', px: 200});
          return (
            <g key={lk.id}>
              <Tx x={x + 4} y={y + 2} s={22} w={800} c={INK}>
                {NAMES[lk.id]}
              </Tx>
              <Crop fig={back} x={x} y={y + 16} w={cellW / 2 - 4} h={340} H={740} id={`c2b${i}`} at={0.29} />
              <Crop fig={q} x={x + cellW / 2 + 4} y={y + 16} w={cellW / 2 - 4} h={340} H={740} id={`c2q${i}`} at={0.29} dx={-10} />
              <rect x={x} y={y + 366} width={cellW} height={250} rx={10} fill={BG.mid} />
              <Figure fig={backS} x={x + 70} y={y + 596} h={200} uid={`c2s${i}`} />
              <Figure fig={backS} x={x + 190} y={y + 596} h={200} uid={`c2k${i}`} mono="#2A2124" />
              <Figure fig={qS} x={x + 310} y={y + 596} h={200} uid={`c2t${i}`} />
            </g>
          );
        })}
        <Tx x={42} y={1484} s={22} c={INK}>
          Look at: which cuts read modern and pleasant? Does each read from behind at phone size (the black row)? Is the mess the right amount, neither wild nor tidy?
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ S3: the wind states
export const S3_W = 2400;
export const S3_H = 1330;
const STATE_COLS: {st: StateName; label: string}[] = [
  {st: 'calm', label: 'calm (standing, no wind)'},
  {st: 'breeze', label: 'a breeze from the left'},
  {st: 'walk', label: 'walking (the contact pose)'},
  {st: 'turn', label: 'a turn of the head (looking back)'},
];
const STATE_ROWS: {id: string; label: string}[] = [
  {id: 'W3', label: 'W3 long layers (C3)'},
  {id: 'W2', label: 'W2 the lazy lob (C2)'},
  {id: 'M4', label: 'M4 the curly mop (C4)'},
];
export const HvS3: React.FC = () => {
  const x0 = 250;
  const cw = 524;
  const ch = 352;
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={S3_W} height={S3_H} viewBox={`0 0 ${S3_W} ${S3_H}`}>
        <Tx x={40} y={70} s={44} w={800} c={INK}>
          S3  Hair in the air: calm, a breeze, a walk, a turn
        </Tx>
        <Tx x={42} y={112} s={22}>
          One bend rule for every state: each lock turns from nothing at the root to its full angle at the tip (d = d_tip x s^1.7). Long hair swings most, the lob less, curls keep their curl (they tilt and
        </Tx>
        <Tx x={42} y={140} s={22}>
          stretch, never straighten). From behind for calm, the breeze and the turn; in profile for the walk (the hair trails behind). Magnified 3.9x, the film-size detail.
        </Tx>
        {STATE_COLS.map((c, j) => (
          <Tx key={c.st} x={x0 + j * cw + cw / 2} y={186} s={23} w={700} c={INK} a="middle">
            {c.label}
          </Tx>
        ))}
        {STATE_ROWS.map((r, i) => (
          <g key={r.id}>
            <Tx x={40} y={210 + i * (ch + 14) + ch / 2} s={23} w={700} c={INK}>
              {r.label.split(' (')[0]}
            </Tx>
            <Tx x={40} y={240 + i * (ch + 14) + ch / 2} s={19}>
              {'(' + r.label.split(' (')[1]}
            </Tx>
            {STATE_COLS.map((c, j) => {
              const view: View = c.st === 'walk' ? 'p' : 'b';
              const st = STATES[c.st];
              const headYaw = c.st === 'turn' ? 52 : undefined;
              const face = undefined;
              const fig = r.id === 'W3' ? herV2({view, state: st, px: 200, headYaw, face}) : personV2(lookOf(r.id), {view, state: st, px: 200, headYaw, face});
              return <Crop key={c.st} fig={fig} x={x0 + j * cw} y={204 + i * (ch + 14)} w={cw - 12} h={ch} H={780} id={`c3${i}${j}`} at={0.27} />;
            })}
          </g>
        ))}
        <Tx x={42} y={1314} s={22} c={INK}>
          Look at: do the states read as wind, a walk and a turn? Is the root pinned and the tip moving most? Do the curls keep their curl? Same wind on every head.
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ S4: the cast at film size in our evening scene

export const S4_W = 2240;
export const S4_H = 2060;
type Cast = {who: string; view: View; x: number; y: number; h: number; cm?: number};
/** Her in the doorway (where the old her stood, ~156 px), two strangers on the quay (~150-170 px), three on the
 *  promenade (~195-215 px: the deck's perspective from Pip's bollard to the café table). One breeze from the left. */
const CAST: Cast[] = [
  {who: 'W1', view: 'q', x: 222, y: 1074, h: 149, cm: 160},
  {who: 'M2', view: 'b', x: 432, y: 1080, h: 169, cm: 182},
  {who: 'W6', view: 'q', x: 372, y: 1388, h: 198, cm: 165},
  {who: 'W2', view: 'b', x: 548, y: 1402, h: 212, cm: 172},
  {who: 'M4', view: 'p', x: 856, y: 1400, h: 218, cm: 178},
  {who: 'her', view: 'p', x: 684, y: 1083, h: 156},
];
const Scene: React.FC<{k: string}> = ({k}) => (
  <g>
    <image href={PLATE_V6} x={0} y={0} width={PLATE_W} height={PLATE_H} />
    {CAST.slice()
      .sort((a, b) => a.y - b.y)
      .map((c, i) => {
        const fig = c.who === 'her' ? herV2({view: c.view, state: BREEZE, px: c.h}) : personV2(lookOf(c.who), {view: c.view, state: BREEZE, px: c.h, cm: c.cm});
        return <Figure key={i} fig={fig} x={c.x} y={c.y} h={c.h} uid={`s4${k}${i}`} shadowColor="#5E4038" />;
      })}
  </g>
);
export const HvS4: React.FC = () => {
  const crops = [
    {x: 160, y: 890, w: 560, h: 220, label: 'the quay and the lit doorway, 2x: her (156 px) and two strangers'},
    {x: 320, y: 1150, w: 560, h: 280, label: 'the promenade, 2x: three strangers, 198-218 px'},
  ];
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <Img src={PLATE_V6} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
      <svg width={S4_W} height={S4_H} viewBox={`0 0 ${S4_W} ${S4_H}`}>
        <Tx x={30} y={60} s={40} w={800} c={INK}>
          S4  The cast at film size in our evening scene
        </Tx>
        <Tx x={32} y={98} s={21}>
          The painted still v6 at dusk (the old her painted out). Her (W3, the rim) and five strangers (W1, M2, W6, W2, M4: different cuts, builds and heights) in one breeze from the left. Left: the frame 1:1.
        </Tx>
        <svg x={30} y={130} width={PLATE_W} height={PLATE_H} viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}>
          <Scene k="f" />
        </svg>
        {crops.map((c, i) => {
          const y = i === 0 ? 130 : 130 + 2 * crops[0].h + 60;
          return (
            <g key={i}>
              <svg x={1150} y={y} width={c.w * 2 * (1060 / 1120)} height={c.h * 2 * (1060 / 1120)} viewBox={`${c.x} ${c.y} ${c.w} ${c.h}`}>
                <Scene k={`c${i}`} />
              </svg>
              <Tx x={1150} y={y + c.h * 2 * (1060 / 1120) + 26} s={20}>
                {c.label}
              </Tx>
            </g>
          );
        })}
        {/* the whole frame at phone size: 1080 wide shown 360 wide */}
        <svg x={1150} y={1200} width={360} height={640} viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}>
          <Scene k="p" />
        </svg>
        <Tx x={1530} y={1230} s={22} w={700} c={INK}>
          At phone size
        </Tx>
        <Tx x={1530} y={1262} s={19}>
          the frame 1080 px wide shown 360 px
        </Tx>
        <Tx x={1530} y={1288} s={19}>
          wide (a phone held at arm's length)
        </Tx>
        <Tx x={1530} y={1350} s={20} c={INK}>
          Look at: at phone size, does the
        </Tx>
        <Tx x={1530} y={1376} s={20} c={INK}>
          hair read alive and designed rather
        </Tx>
        <Tx x={1530} y={1402} s={20} c={INK}>
          than noisy? Do they read as cool
        </Tx>
        <Tx x={1530} y={1428} s={20} c={INK}>
          20-30-year-olds? The same wind on
        </Tx>
        <Tx x={1530} y={1454} s={20} c={INK}>
          every head?
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ S5: the height-and-build lineup
export const S5_W = 2400;
export const S5_H = 1340;
const LINE_CUT: Record<string, string> = {w152: 'W5', w160: 'W7', her: 'W3', w175: 'W4', m167: 'M4', m177: 'M2', m182: 'M1', m188: 'M3'};
export const HvS5: React.FC = () => {
  const ground = 1180;
  const x0 = 330;
  const dx = 262;
  const mark = (cm: number) => ground - (1000 * cm) / 190;
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={S5_W} height={S5_H} viewBox={`0 0 ${S5_W} ${S5_H}`}>
        <Tx x={40} y={62} s={40} w={800} c={INK}>
          S5  Heights and builds on one ground
        </Tx>
        <Tx x={42} y={100} s={21}>
          The eight figures of the height sheet (RECIPE d.4): the head and torso keep nearly the same size, the legs carry the height (heads tall = 7.8 x (H/168 cm)^0.7); one scale, the tallest ~990 px.
        </Tx>
        {[150, 170, 190].map((cm) => (
          <g key={cm}>
            <line x1={110} x2={S5_W - 40} y1={mark(cm)} y2={mark(cm)} stroke="#D9CBC1" strokeWidth={2} strokeDasharray="10 8" />
            <Tx x={40} y={mark(cm) + 7} s={22} w={700} c={INK}>
              {`${cm}`}
            </Tx>
          </g>
        ))}
        <line x1={110} x2={S5_W - 40} y1={ground} y2={ground} stroke="#CDBDB2" strokeWidth={3} />
        {LINEUP.map((hgt, i) => {
          const lk = lookOf(LINE_CUT[hgt.who]);
          const fig = personV2(lk, {view: 'q', px: 900, cm: hgt.cm, build: hgt.build, bodyYaw: -40, headYaw: 4});
          const hn = heightNumbers(hgt);
          const x = x0 + i * dx;
          return (
            <g key={hgt.who}>
              <Figure fig={fig} x={x} y={ground} h={(1000 * hgt.cm) / 190} uid={`s5${i}`} />
              <Tx x={x} y={ground + 46} s={22} w={700} c={INK} a="middle">
                {`${hgt.cm} cm, ${hn.heads.toFixed(1)} heads`}
              </Tx>
              <Tx x={x} y={ground + 74} s={19} a="middle">
                {`${hgt.sex === 'f' ? 'woman' : 'man'}, ${hgt.build}, ${lk.cut.id}`}
              </Tx>
            </g>
          );
        })}
        <Tx x={42} y={1318} s={21} c={INK}>
          Look at: adult and pleasant at every height? Legs long but never stretched? Heads small but not tiny with their hair? Real variety of builds?
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ S7: close and far
export const S7_W = 2400;
export const S7_H = 1480;
export const HvS7: React.FC = () => {
  const ids = ['W1', 'W2', 'W6', 'M1'];
  const rowH = 300;
  const y0 = 200;
  const groups = [
    {label: 'close detail (a figure >= 300 px tall), magnified', px: 640, x: 260},
    {label: 'film-size detail (200 px), the same magnification', px: 200, x: 1000},
    {label: 'film size, 1:1', px: 200, x: 1760},
  ];
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={S7_W} height={S7_H} viewBox={`0 0 ${S7_W} ${S7_H}`}>
        <Tx x={40} y={62} s={40} w={800} c={INK}>
          S7  Close and far: the level of detail
        </Tx>
        <Tx x={42} y={100} s={21}>
          The same four heads drawn with the close detail (4-7 locks, 1-4 wisps, the deep tone, slivers between locks, 2-4 sheen dashes) and with the film-size detail (3-5 locks, 0-2 wisps, no
        </Tx>
        <Tx x={42} y={128} s={21}>
          slivers, 1-2 dashes, every mark at least 2 px), magnified alike; right, the film size itself. Detail under a pixel is dropped, never drawn and lost.
        </Tx>
        {groups.map((g) => (
          <Tx key={g.label} x={g.x} y={184} s={22} w={700} c={INK}>
            {g.label}
          </Tx>
        ))}
        {ids.map((id, i) => {
          const y = y0 + i * (rowH + 12);
          const lk = lookOf(id);
          return (
            <g key={id}>
              <Tx x={40} y={y + rowH / 2} s={24} w={800} c={INK}>
                {id}
              </Tx>
              <Tx x={40} y={y + rowH / 2 + 30} s={19}>
                {NAMES[id].slice(4)}
              </Tx>
              {groups.slice(0, 2).map((g, j) =>
                (['q', 'b'] as const).map((v, k) => (
                  <Crop key={`${j}${k}`} fig={personV2(lk, {view: v, px: g.px, face: 'lash'})} x={g.x + k * 350} y={y} w={340} h={rowH} H={980} id={`c7${i}${j}${k}`} at={0.36} dx={v === 'q' ? -14 : 0} />
                )),
              )}
              <rect x={1760} y={y} width={600} height={rowH} rx={10} fill={BG.mid} />
              {(['q', 'b'] as const).map((v, k) => (
                <Figure key={k} fig={personV2(lk, {view: v, px: 200})} x={1880 + k * 180} y={y + 260} h={200} uid={`c7f${i}${k}`} />
              ))}
            </g>
          );
        })}
        <Tx x={42} y={1462} s={21} c={INK}>
          Look at: is the close detail earned, and does it drop out cleanly at film size (nothing that reads as a scratch or a crack)?
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ S6: seated and leaning
export const S6_W = 2400;
export const S6_H = 1300;
export const HvS6: React.FC = () => {
  const H = 760;
  const s = H / 1000;
  const panels = [
    {x: 40, label: 'her on a ledge, in profile (ref 05): the head bowed'},
    {x: 820, label: 'two on the ground from behind (ref 01), shoulders touching, in a breeze'},
    {x: 1600, label: 'leaning on a rail from behind, the weight on one leg, in a breeze'},
  ];
  const ledge = herLedge({px: 640});
  const pair = groundPair({px: 640, state: BREEZE});
  const rail = railLean({px: 640, state: BREEZE});
  const ledgeS = herLedge({px: 200});
  const pairS = groundPair({px: 200, state: BREEZE});
  const railS = railLean({px: 200, state: BREEZE});
  const pw = 760;
  const ph = 880;
  const top = 170;
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={S6_W} height={S6_H} viewBox={`0 0 ${S6_W} ${S6_H}`}>
        <Tx x={40} y={62} s={40} w={800} c={INK}>
          S6  Seated and leaning: a relaxed stature
        </Tx>
        <Tx x={42} y={100} s={21}>
          The same bodies and hair in the poses of the references: the back a soft curve, the legs hanging or folded naturally, the hair falling with gravity when the head bows and streaming in the
        </Tx>
        <Tx x={42} y={128} s={21}>
          breeze. Drawn as a 760 px standing figure would be; below each, the same at film size (a 200 px standing figure), 1:1.
        </Tx>
        {panels.map((p, i) => (
          <g key={i}>
            <clipPath id={`p6${i}`}>
              <rect x={p.x} y={top} width={pw} height={ph} rx={14} />
            </clipPath>
            <rect x={p.x} y={top} width={pw} height={ph} rx={14} fill={BG.panel} />
            <Tx x={p.x + 20} y={top + 36} s={20} w={700} c={INK}>
              {p.label}
            </Tx>
          </g>
        ))}
        {/* 1: the ledge */}
        <g clipPath="url(#p60)">
          <Figure fig={ledge} x={40 + 470} y={top + 90 + H} h={H} uid="s6l" shadow={false} />
        </g>
        {/* 2: the pair, on a low rise */}
        <g clipPath="url(#p61)">
          <ellipse cx={820 + pw / 2} cy={top + 120 + 530 * s + 330} rx={560} ry={340} fill="#BBAFA6" />
          <Figure fig={pair.her} x={820 + pw / 2 - (pair.gap * s) / 2} y={top + 120 + H} h={H} uid="s6h" shadow={false} />
          <Figure fig={pair.him} x={820 + pw / 2 + (pair.gap * s) / 2} y={top + 120 + H} h={H} uid="s6m" shadow={false} />
        </g>
        {/* 3: the rail */}
        <g clipPath="url(#p62)">
          <Figure fig={rail} x={1600 + pw / 2} y={top + 70 + H} h={H} uid="s6r" />
        </g>
        {/* film size, 1:1 */}
        {panels.map((p, i) => (
          <g key={i}>
            <clipPath id={`f6${i}`}>
              <rect x={p.x} y={top + ph + 14} width={pw} height={200} rx={12} />
            </clipPath>
            <rect x={p.x} y={top + ph + 14} width={pw} height={200} rx={12} fill={BG.mid} />
          </g>
        ))}
        <g clipPath="url(#f60)">
          <Figure fig={ledgeS} x={40 + 380} y={top + ph + 14 + 30 + 200} h={200} uid="s6ls" shadow={false} />
        </g>
        <g clipPath="url(#f61)">
          <ellipse cx={820 + pw / 2} cy={top + ph + 14 + 30 + 530 * 0.2 + 90} rx={150} ry={92} fill="#9E918C" />
          <Figure fig={pairS.her} x={820 + pw / 2 - (pairS.gap * 0.2) / 2} y={top + ph + 14 + 30 + 200} h={200} uid="s6hs" shadow={false} />
          <Figure fig={pairS.him} x={820 + pw / 2 + (pairS.gap * 0.2) / 2} y={top + ph + 14 + 30 + 200} h={200} uid="s6ms" shadow={false} />
        </g>
        <g clipPath="url(#f62)">
          <Figure fig={railS} x={1600 + pw / 2} y={top + ph + 14 + 10 + 200} h={200} uid="s6rs" />
        </g>
        <Tx x={42} y={1290} s={21} c={INK}>
          Look at: a relaxed stature? The back's soft curve, the legs' natural hang, the hair's fall with a bowed head, the breeze reaching both heads alike?
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};
