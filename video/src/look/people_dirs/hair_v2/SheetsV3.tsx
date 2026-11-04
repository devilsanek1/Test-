// HAIR v3: the stills after the owner's note (RECIPE.md "v3 (after the owner's note)"; docs .../hair_v2/V3.md). The v2
// sheets (Sheets.tsx, HvS1-HvS7) stay as they were; these draw the same layouts with ver 3 (the clean cuts of
// cuts3.ts, the head stacked on an upright neck), plus the two comparison sheets:
//   HvS1v3  her: before (direction C as drawn now) and after (v3), three views; v2 small for reference
//   HvS2v3  the hair library, v3
//   HvS3v3  the wind states, v3 (the whole shape leans, the accents lift)
//   HvS4v3  the cast at film size in our evening scene, v3
//   HvS8    the owner's references beside our nearest v2 cuts, measured the same way
//   HvS9    the references beside our v3 cuts
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {PLATE_V6, PLATE_W, PLATE_H} from './plate';
import {REFS} from './refs';
import {Figure} from '../graphic/Figure';
import {BG} from '../graphic/palette';
import {build as buildOld} from '../graphic_faces/cast';
import {herV2, personV2, lookOf, LOOKS, herSkel, cutOf, type View, type Ver} from './people';
import {STATES, BREEZE, type StateName} from './states';
import {cva} from './stance';
import {Tx, Crop, INK} from './Sheets';

// ================================================================ S1 v3: her, before and after
export const S1V3_W = 2400;
export const S1V3_H = 1640;
const VIEWS1: {view: View; label: string}[] = [
  {view: 'q', label: 'front 3/4'},
  {view: 'p', label: 'walking, profile'},
  {view: 'b', label: 'from behind'},
];
export const HvS1v3: React.FC = () => {
  const panel = (x: number, after: boolean) => {
    const w = 1140;
    const col = w / 3;
    return (
      <g>
        <rect x={x} y={150} width={w} height={760} rx={16} fill={BG.panel} />
        <Tx x={x + 24} y={194} s={30} w={800} c={INK}>
          {after ? 'AFTER (v3): a clean cut, the neck upright' : 'BEFORE: her as drawn now (direction C, LASH)'}
        </Tx>
        {VIEWS1.map((v, i) => {
          const fig = after ? herV2({view: v.view, px: 640, ver: 3}) : buildOld('herEvening', v.view, 'lash');
          return (
            <g key={i}>
              <Figure fig={fig} x={x + col * (i + 0.5)} y={890} h={640} uid={`t1${after ? 'a' : 'b'}${i}`} />
              <Tx x={x + col * (i + 0.5)} y={234} s={19} a="middle">
                {v.label}
              </Tx>
            </g>
          );
        })}
        <rect x={x} y={930} width={w} height={300} rx={16} fill={BG.mid} />
        {VIEWS1.map((v, i) => {
          const fig = after ? herV2({view: v.view, px: 200, ver: 3}) : buildOld('herEvening', v.view, 'lash');
          return <Figure key={i} fig={fig} x={x + 160 + i * 150} y={1190} h={200} uid={`t1f${after ? 'a' : 'b'}${i}`} />;
        })}
        {VIEWS1.map((v, i) => {
          const fig = after ? herV2({view: v.view, px: 156, ver: 3}) : buildOld('herEvening', v.view, 'lash');
          return <Figure key={`m${i}`} fig={fig} x={x + 660 + i * 130} y={1190} h={156} uid={`t1m${after ? 'a' : 'b'}${i}`} />;
        })}
        <Tx x={x + 24} y={966} s={19} c="#F4EDE6">
          film size, 1:1: 200 px and 156 px tall
        </Tx>
      </g>
    );
  };
  const a3 = Math.round(cva(herSkel('p', 3)));
  const a2 = Math.round(cva(herSkel('p', 2)));
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={S1V3_W} height={S1V3_H} viewBox={`0 0 ${S1V3_W} ${S1V3_H}`}>
        <Tx x={40} y={70} s={44} w={800} c={INK}>
          S1 v3  Her, before and after: a proper cut, an upright neck
        </Tx>
        <Tx x={42} y={112} s={22}>
          {`Same evening look, same LASH face. After: long layers with curtain bangs as a CUT: one long fall, three panels and the two outer lengths in one flow, a soft V of alike tips, two grooves, one broad wave,`}
        </Tx>
        <Tx x={42} y={140} s={22}>
          {`one flyaway. The head stacked over the shoulders on an upright neck (craniovertebral angle ~${a3} degrees; v2 pushed it forward to ~${a2}); the relaxed shoulders, the hip shift and the arm off the body kept.`}
        </Tx>
        {panel(40, false)}
        {panel(1220, true)}
        {/* v2 and v3 small, side by side, for reference */}
        <rect x={40} y={1250} width={2320} height={330} rx={16} fill={BG.panel} />
        <Tx x={64} y={1288} s={22} w={700} c={INK}>
          for reference, small: v2 (the stills you saw)
        </Tx>
        <Tx x={1244} y={1288} s={22} w={700} c={INK}>
          v3 (this iteration)
        </Tx>
        {VIEWS1.map((v, i) => (
          <Figure key={i} fig={herV2({view: v.view, px: 250})} x={300 + i * 260} y={1566} h={250} uid={`t1v2${i}`} />
        ))}
        {VIEWS1.map((v, i) => (
          <Figure key={`n${i}`} fig={herV2({view: v.view, px: 250, ver: 3})} x={1480 + i * 260} y={1566} h={250} uid={`t1v3${i}`} />
        ))}
        <Tx x={42} y={1620} s={22} c={INK}>
          Look at: is it a proper, stylish, clean haircut with only a touch of looseness? Is the neck upright and elegant, the head over the shoulders? Is she still the same person?
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ S2 v3: the hair library
export const S2V3_W = 2400;
export const S2V3_H = 1500;
export const HvS2v3: React.FC = () => {
  const cellW = 386;
  const x0 = 34;
  const rowY = [190, 840];
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={S2V3_W} height={S2V3_H} viewBox={`0 0 ${S2V3_W} ${S2V3_H}`}>
        <Tx x={40} y={70} s={44} w={800} c={INK}>
          S2 v3  The hair library: twelve cuts, each a proper cut
        </Tx>
        <Tx x={42} y={112} s={22}>
          Each cut on its own person: from behind and in 3/4 magnified 3.7x (the film-size detail), then at film size 1:1 (200 px) in colour, filled black, and in 3/4. Every head: the cut's silhouette first, 2-5 big
        </Tx>
        <Tx x={42} y={140} s={22}>
          shapes in one flow from the parting and the crown, alike tips and a clean hem, one shadow shape, the crown's sheen, 1-2 grooves, 0-1 loose bit. Calm air. Redesigned: M1 (swept back), M5 (short coils).
        </Tx>
        {LOOKS.map((lk, i) => {
          const r = i < 6 ? 0 : 1;
          const k = i % 6;
          const x = x0 + k * (cellW + 8);
          const y = rowY[r];
          const back = personV2(lk, {view: 'b', px: 200, ver: 3});
          const q = personV2(lk, {view: 'q', px: 200, ver: 3});
          return (
            <g key={lk.id}>
              <Tx x={x + 4} y={y + 2} s={22} w={800} c={INK}>
                {`${lk.id}  ${cutOf(lk, 3).name}`}
              </Tx>
              <Crop fig={back} x={x} y={y + 16} w={cellW / 2 - 4} h={340} H={740} id={`d2b${i}`} at={0.29} />
              <Crop fig={q} x={x + cellW / 2 + 4} y={y + 16} w={cellW / 2 - 4} h={340} H={740} id={`d2q${i}`} at={0.29} dx={-10} />
              <rect x={x} y={y + 366} width={cellW} height={250} rx={10} fill={BG.mid} />
              <Figure fig={back} x={x + 70} y={y + 596} h={200} uid={`d2s${i}`} />
              <Figure fig={back} x={x + 190} y={y + 596} h={200} uid={`d2k${i}`} mono="#2A2124" />
              <Figure fig={q} x={x + 310} y={y + 596} h={200} uid={`d2t${i}`} />
            </g>
          );
        })}
        <Tx x={42} y={1484} s={22} c={INK}>
          Look at: would a regular viewer call every head a good-looking, current haircut? Clean and stylish, with only a touch of looseness? Does each read from behind at phone size?
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ S3 v3: the wind states
export const S3V3_W = 2400;
export const S3V3_H = 1330;
const STATE_COLS: {st: StateName; label: string}[] = [
  {st: 'calm', label: 'calm (standing, no wind)'},
  {st: 'breeze', label: 'a breeze from the left'},
  {st: 'walk', label: 'walking (the contact pose)'},
  {st: 'turn', label: 'a turn of the head (looking back)'},
];
const STATE_ROWS: {id: string; label: string}[] = [
  {id: 'W3', label: 'W3 long layers (C3)'},
  {id: 'W2', label: 'W2 the lob (C2)'},
  {id: 'M4', label: 'M4 the curly top (C4)'},
];
export const HvS3v3: React.FC = () => {
  const x0 = 250;
  const cw = 524;
  const ch = 352;
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={S3V3_W} height={S3V3_H} viewBox={`0 0 ${S3V3_W} ${S3V3_H}`}>
        <Tx x={40} y={70} s={44} w={800} c={INK}>
          S3 v3  Hair in the air: the whole cut leans, the accents lift
        </Tx>
        <Tx x={42} y={112} s={22}>
          The cut keeps its shape in every state: the big shapes ride the mass and lean with it (the root pinned, the bend growing to the hem); only the accents lift on top (the outer lengths, a flip, 1-2 wisps).
        </Tx>
        <Tx x={42} y={140} s={22}>
          Never scattering into strands. From behind for calm, the breeze and the turn; in profile for the walk (the hair trails). Magnified 3.9x, the film-size detail.
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
              const fig = r.id === 'W3' ? herV2({view, state: st, px: 200, headYaw, ver: 3}) : personV2(lookOf(r.id), {view, state: st, px: 200, headYaw, ver: 3});
              return <Crop key={c.st} fig={fig} x={x0 + j * cw} y={204 + i * (ch + 14)} w={cw - 12} h={ch} H={780} id={`d3${i}${j}`} at={0.27} />;
            })}
          </g>
        ))}
        <Tx x={42} y={1314} s={22} c={INK}>
          Look at: does each state read as wind, a walk and a turn while the haircut stays a haircut? Same wind on every head.
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ S4 v3: the cast in our evening scene
export const S4V3_W = 2240;
export const S4V3_H = 2060;
type Cast = {who: string; view: View; x: number; y: number; h: number; cm?: number};
const CAST: Cast[] = [
  {who: 'W1', view: 'q', x: 222, y: 1074, h: 149, cm: 160},
  {who: 'M2', view: 'b', x: 432, y: 1080, h: 169, cm: 182},
  {who: 'W6', view: 'q', x: 372, y: 1388, h: 198, cm: 165},
  {who: 'W2', view: 'b', x: 548, y: 1402, h: 212, cm: 172},
  {who: 'M4', view: 'p', x: 856, y: 1400, h: 218, cm: 178},
  {who: 'her', view: 'p', x: 684, y: 1083, h: 156},
];
const Scene: React.FC<{k: string; ver: Ver}> = ({k, ver}) => (
  <g>
    <image href={PLATE_V6} x={0} y={0} width={PLATE_W} height={PLATE_H} />
    {CAST.slice()
      .sort((a, b) => a.y - b.y)
      .map((c, i) => {
        const fig = c.who === 'her' ? herV2({view: c.view, state: BREEZE, px: c.h, ver}) : personV2(lookOf(c.who), {view: c.view, state: BREEZE, px: c.h, cm: c.cm, ver});
        return <Figure key={i} fig={fig} x={c.x} y={c.y} h={c.h} uid={`u4${k}${i}`} shadowColor="#5E4038" />;
      })}
  </g>
);
export const HvS4v3: React.FC = () => {
  const crops = [
    {x: 160, y: 890, w: 560, h: 220, label: 'the quay and the lit doorway, 2x: her (156 px) and two strangers'},
    {x: 320, y: 1150, w: 560, h: 280, label: 'the promenade, 2x: three strangers, 198-218 px'},
  ];
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <Img src={PLATE_V6} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
      <svg width={S4V3_W} height={S4V3_H} viewBox={`0 0 ${S4V3_W} ${S4V3_H}`}>
        <Tx x={30} y={60} s={40} w={800} c={INK}>
          S4 v3  The cast at film size in our evening scene
        </Tx>
        <Tx x={32} y={98} s={21}>
          The painted still v6 at dusk. Her (W3, the rim) and five strangers (W1, M2, W6, W2, M4) in the v3 cuts, the heads upright, one breeze from the left. Left: the frame 1:1.
        </Tx>
        <svg x={30} y={130} width={PLATE_W} height={PLATE_H} viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}>
          <Scene k="f" ver={3} />
        </svg>
        {crops.map((c, i) => {
          const y = i === 0 ? 130 : 130 + 2 * crops[0].h + 60;
          return (
            <g key={i}>
              <svg x={1150} y={y} width={c.w * 2 * (1060 / 1120)} height={c.h * 2 * (1060 / 1120)} viewBox={`${c.x} ${c.y} ${c.w} ${c.h}`}>
                <Scene k={`c${i}`} ver={3} />
              </svg>
              <Tx x={1150} y={y + c.h * 2 * (1060 / 1120) + 26} s={20}>
                {c.label}
              </Tx>
            </g>
          );
        })}
        <svg x={1150} y={1200} width={360} height={640} viewBox={`0 0 ${PLATE_W} ${PLATE_H}`}>
          <Scene k="p" ver={3} />
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
        {['Look at: at phone size, does each', 'head read as a clean, current cut', 'rather than noise? Upright, elegant', 'necks? The same wind on every head?'].map((t, i) => (
          <Tx key={i} x={1530} y={1350 + i * 26} s={20} c={INK}>
            {t}
          </Tx>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ================================================================ S8 / S9: the references beside our cuts
type Pair = {ref: string; refLabel: string; who: string; view: View; ours: string; refM: string[]; v2M: string[]; v3M: string[]};
const PAIRS: Pair[] = [
  {
    ref: 'bob',
    refLabel: 'ref 03: her bob',
    who: 'W1',
    view: 'q',
    ours: 'W1',
    refM: ['3 big shapes; the hem is 5 flips,', 'all turning out; flat + a rim;', '2 thin placed arcs; one broad S;', 'the neck upright'],
    v2M: ['6 locks (B1 M3 S2); 6 pieces,', 'one hooked the other way;', '~8 marks inside;', 'the neck forward (~58)'],
    v3M: ['the crown, 2 side flips, the back;', 'the ends flip out alike (mirrored);', '1 groove; one broad S;', 'the neck upright (~74)'],
  },
  {
    ref: 'swept',
    refLabel: 'ref 03: his swept crop',
    who: 'M3',
    view: 'q',
    ours: 'M3',
    refM: ['3 big shapes: the top swept back,', 'the back to the nape, a front curl;', 'the top edge 4-5 scallops trailing', 'back; 1 shadow shape'],
    v2M: ['crown tufts + 4 nape locks;', 'the tufts point up and out (horns);', '145 deg flow spread; mess 3', ''],
    v3M: ['the top swept back in 2 shapes,', 'the back one shape to the collar;', 'the tips trail back / taper down;', '1 groove, no tufts'],
  },
  {
    ref: 'curls',
    refLabel: 'ref 03: the sheet\'s curls',
    who: 'M4',
    view: 'q',
    ours: 'M4',
    refM: ['4-5 clumps radial from ONE centre;', '10-12 tips, each side curling', 'the same way; 3 flat shadow', 'shapes; 1 long hair arc'],
    v2M: ['10 clumps, hooks 4 one way', 'and 6 the other; inner clumps', 'hooking back in; ~7 marks', ''],
    v3M: ['6 clumps radial from the crown,', 'only on the silhouette; hooks', 'mirrored side to side; 1 groove,', '1 small loose curl'],
  },
  {
    ref: 'blue',
    refLabel: 'ref 04: the blue crop',
    who: 'M1',
    view: 'q',
    ours: 'M1',
    refM: ['7-8 leaf locks ARE the hair;', 'one fan sweeping back, neighbours', 'within 10-15 deg; 1 light edge', '+ 1 dark side each'],
    v2M: ['a dome + 6 small tufts pointing', 'every way (195 deg): dark flames', 'on a helmet', ''],
    v3M: ['4 leaf locks from the hairline,', 'one fan arcing back over the dome', '(40 deg spread); the tips trail', 'back alike; 1 groove'],
  },
  {
    ref: 'fall',
    refLabel: 'ref 05: the long fall (profile)',
    who: 'her',
    view: 'p',
    ours: 'W3',
    refM: ['1-2 shapes: the cap and the fall;', 'an almost straight hem;', '1 sheen at the crown; no waves', ''],
    v2M: ['cap + fall + 4 locks; the tips', 'spread 0.78 u; 1.9 waves a lock;', 'the head pushed forward on a', 'leaning neck (~58)'],
    v3M: ['the cap, the fall, its back edge,', 'the layer by the ear; 2 alike tips;', '1 groove; 0.8 wave;', 'the neck upright (~74)'],
  },
  {
    ref: 'rear',
    refLabel: 'ref 02: long hair from behind',
    who: 'her',
    view: 'b',
    ours: 'W3',
    refM: ['3 big shapes; a V of 3 tips, all', 'pointing down; 3-4 thin PARALLEL', 'lines from the crown; 1 rim;', 'no waves'],
    v2M: ['7 locks + a crossing lock; 7 tips', 'spread 0.82 u, curling different', 'ways; ~14 marks; 1.7 waves a', 'lock, out of phase'],
    v3M: ['3 panels + 2 outer lengths, one', 'flow (7 deg); a soft V of 5 alike', 'tips; 2 grooves, the crown sheen;', '0.7 wave, in phase'],
  },
];
export const S8_W = 2400;
export const S8_H = 1560;
const PairSheet: React.FC<{ver: Ver}> = ({ver}) => {
  const cw = 778;
  const x0 = 36;
  const rowY = [180, 846];
  const box = 356;
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={S8_W} height={S8_H} viewBox={`0 0 ${S8_W} ${S8_H}`}>
        <Tx x={40} y={70} s={44} w={800} c={INK}>
          {ver === 2 ? 'S8  The references beside our v2: why ours read "like a person woke up"' : 'S9  The references beside our v3 cuts'}
        </Tx>
        <Tx x={42} y={112} s={22}>
          {ver === 2
            ? 'Each reference head (left, enlarged from the screenshot) beside our nearest v2 cut (right, the film-size detail magnified), measured the same way: big shapes, locks, flow, tips and hem, inner marks,'
            : 'Each reference head (left) beside our v3 cut (right, the film-size detail magnified), measured the same way. v3: the cut first, 2-5 big shapes in one flow, alike tips and a clean hem, one shadow shape,'}
        </Tx>
        <Tx x={42} y={140} s={22}>
          {ver === 2
            ? 'loose bits, waves, the neck. Theirs: a recognisable cut, one flow, few alike tips, one shadow and one light per shape, 0-2 placed loose bits. Ours: ribbons hung on a dome, each doing its own thing.'
            : 'the crown sheen and 1-2 grooves, 0-1 placed loose bit, broad waves in phase, the head stacked on an upright neck. (Our heads are drawn in our flat graphic style; the references are other styles.)'}
        </Tx>
        {PAIRS.map((p, i) => {
          const r = Math.floor(i / 3);
          const k = i % 3;
          const x = x0 + k * cw;
          const y = rowY[r];
          const ref = REFS[p.ref];
          const s = Math.min(box / ref.w, box / ref.h);
          const rw = ref.w * s;
          const rh = ref.h * s;
          const lk = p.who === 'her' ? null : lookOf(p.who);
          const fig = p.who === 'her' ? herV2({view: p.view, px: 200, ver}) : personV2(lk!, {view: p.view, px: 200, ver, face: 'lash'});
          const H = p.view === 'p' || p.ref === 'rear' ? 820 : 1000;
          const at = p.ref === 'rear' ? 0.26 : p.ref === 'fall' ? 0.3 : 0.4;
          const M = ver === 2 ? p.v2M : p.v3M;
          return (
            <g key={p.ref}>
              <rect x={x} y={y} width={box} height={box} rx={10} fill="#E3D9D0" />
              <image href={ref.src} x={x + (box - rw) / 2} y={y + (box - rh) / 2} width={rw} height={rh} />
              <Crop fig={fig} x={x + box + 12} y={y} w={box} h={box} H={H} id={`p${ver}${i}`} at={at} dx={p.view === 'q' ? -12 : 0} />
              <Tx x={x + 4} y={y + box + 30} s={20} w={800} c={INK}>
                {p.refLabel}
              </Tx>
              <Tx x={x + box + 16} y={y + box + 30} s={20} w={800} c={INK}>
                {`our ${ver === 2 ? 'v2' : 'v3'} ${p.ours}${p.ours !== p.who ? '' : ''}`}
              </Tx>
              {p.refM.map((t, j) => (
                <Tx key={`r${j}`} x={x + 4} y={y + box + 58 + j * 24} s={17}>
                  {t}
                </Tx>
              ))}
              {M.map((t, j) => (
                <Tx key={`m${j}`} x={x + box + 16} y={y + box + 58 + j * 24} s={17}>
                  {t}
                </Tx>
              ))}
            </g>
          );
        })}
        <Tx x={42} y={1536} s={22} c={INK}>
          {ver === 2
            ? 'Why: no cut (ribbons make the outline), a broken flow (locks wave on their own, one crosses), a frayed hem, too many marks inside, many random loose bits, crimped waves, a forward head.'
            : 'Look at: is each of ours as clean and stylish as the reference beside it, in our own flat style? Same cut family, same calm flow, a touch of life?'}
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};
export const HvS8: React.FC = () => <PairSheet ver={2} />;
export const HvS9: React.FC = () => <PairSheet ver={3} />;
