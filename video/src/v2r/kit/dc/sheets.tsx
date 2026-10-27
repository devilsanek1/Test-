// dc/sheets.tsx: the Arlington kit's review compositions (src/entry-v2r-dc.tsx):
//   KitDC      the contact sheet: every K7 piece at the size the film uses, the plane steps, the crane's speeds.
//   CraneEnd   S5's end frame (1080 x 1920), alive: the hold 23.40-24.00 looped from scene 2.85.
//   CraneMove  S5 whole (20.55-24.00): the hold, the ONE crane on the re-fit ease, the landing hold.
//   GateDC     S6's set on its lateral truck (24.00-28.06).
// The cast (K4 Seated / Person / NearBack) and Pip (K5) are the film's own kits, used here only to judge the frames;
// the news box, the deal board and the plaque are K3's (L5): plain stand-ins below, marked STAND-IN.

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CM} from '../../palette';
import {useTime, TimeShift} from '../../../lib/time';
import {S5, S6} from '../../world/map';
import {Seated, Person, NearBack} from '../cast';
import {Pip} from '../pip/Pip';
import {CraneSet} from './Crane';
import {CRANE_T, craneP, craneSpeeds, sunAtStart, swapAt, DECK, planeMat, applyMat} from './crane';
import {FarPlane, RiverPlane, VISTA, HighBars} from './vista';
import {Pentagon} from './pentagon';
import {MidGround, NearMid} from './valley';
import {Terrace, StrangerBench, TerraceTree, LampPost, TERRACE, deckPt, deckPxPerM} from './terrace';
import {GateSet, GateFacade, GateFence, GateNear, GateLawnTrees, GATE, S6_T0} from './gate';
import {PENT_BOX} from './lens';
import {WIPE} from './crane';

const FONT = "CaptionHand, 'Patrick Hand', cursive";

// ---------------------------------------------------------------- the figures used to judge S5 (K4 + K5)

/** The stranger + Pip in START coords (the contract: stranger (300, 1225) h 150 reading a paper; Pip (415, 1120)). */
const FiguresStart: React.FC = () => {
  const t = useTime();
  const s = S5.start.stranger;
  // Pip looks up at the calendar sun on "April" (20.76), then back to the paper's side
  const look = t > CRANE_T.april - 0.05 && t < CRANE_T.flip[1] + 0.2 ? 1 : 0;
  return (
    <>
      <Seated x={s.x} y={s.feetY - 50} h={s.h - 50} seed="s5/stranger" read traits={{coat: CM.coatSlate}} />
      <Pip x={S5.start.pipSeat.x} y={S5.start.pipSeat.y} size={104} pose="sit" target={[250, 650]} targetWeight={look} seed="s5pip" />
    </>
  );
};

/** The same two, tiny, in END coords (the deck plane maps the start seats here exactly). */
const FiguresEnd: React.FC = () => {
  const e = S5.end.stranger;
  const m = planeMat(DECK, 0);
  const inv = (q: [number, number]): [number, number] => {
    // end coords of a start-coords point: q_end = o + (q - o - off) / k
    void m;
    return [DECK.o[0] + (q[0] - DECK.o[0] - (DECK.off ?? [0, 0])[0]) / DECK.k, DECK.o[1] + (q[1] - DECK.o[1] - (DECK.off ?? [0, 0])[1]) / DECK.k];
  };
  const pip = inv([S5.start.pipSeat.x, S5.start.pipSeat.y]);
  return (
    <>
      <Seated x={e.x} y={e.feetY - 50 / DECK.k} h={(150 - 50) / DECK.k} seed="s5/stranger" read traits={{coat: CM.coatSlate}} />
      <Pip x={pip[0]} y={pip[1]} size={104 / DECK.k} pose="sit" seed="s5pip" />
    </>
  );
};

/** STAND-IN for K3's NewsBox (start coords: face x 470-780, y 880-1230; no masthead; headline 40 px x 3 + credit). */
const NewsBoxStandIn: React.FC = () => {
  const b = S5.start.newsBox;
  const w = b.x1 - b.x0;
  return (
    <g>
      <rect x={b.x0 + 30} y={b.y1 - 70} width={w - 60} height={70} fill={CM.anchor} />
      <rect x={b.x0} y={b.y0} width={w} height={b.y1 - b.y0 - 60} rx={8} fill={CM.coatSlate} stroke={CM.ink} strokeWidth={4.8} />
      <rect x={b.x0 + 22} y={b.y0 + 24} width={w - 44} height={200} fill={CM.paper} stroke={CM.ink} strokeWidth={3.4} />
      {['Google–Pentagon', 'deal for', 'classified work'].map((l, i) => (
        <text key={i} x={b.x0 + w / 2} y={b.y0 + 72 + i * 44} textAnchor="middle" fontFamily={FONT} fontSize={40} fill={CM.ink}>
          {l}
        </text>
      ))}
      <text x={b.x0 + w / 2} y={b.y0 + 212} textAnchor="middle" fontFamily={FONT} fontSize={17} fill={CM.ink}>
        Reported Apr 2026 · The Information via Japan Times; 9to5Google
      </text>
      <rect x={b.x0 + 40} y={b.y0 + 246} width={w - 80} height={12} rx={4} fill={CM.anchor} />
    </g>
  );
};

/** The terrace public at the end (K4 backs: a parent at the stroller, two at the balustrade, one on the far bench). */
const TerracePeople: React.FC = () => {
  const t = useTime();
  const st = deckPt(-1.4, 12.4);
  const rail = (x: number) => deckPt(x, 21.0);
  return (
    <>
      <Person x={rail(2.6)[0]} y={rail(2.6)[1]} h={1.72 * deckPxPerM(rail(2.6)[1])} seed="s5/rail1" traits={{coat: CM.coatMustard}} />
      <Person x={rail(3.3)[0]} y={rail(3.3)[1]} h={1.6 * deckPxPerM(rail(3.3)[1])} seed="s5/rail2" traits={{coat: CM.coatOat}} />
      <Person x={rail(7.4)[0]} y={rail(7.4)[1]} h={1.75 * deckPxPerM(rail(7.4)[1])} seed="s5/rail3" />
      <Person x={st[0] + 0.85 * deckPxPerM(st[1])} y={st[1] + 4} h={1.7 * deckPxPerM(st[1])} seed="s5/parent" traits={{coat: CM.coatPlum}} />
      <Person x={deckPt(-6 + ((t * 2.6) % 16), 16)[0]} y={deckPt(0, 16)[1]} h={1.7 * deckPxPerM(deckPt(0, 16)[1])} seed="s5/jog" pose="jog" view="profile" flip walk={{rate: 2.8}} />
      <Seated x={deckPt(1.9, 14.6)[0]} y={deckPt(1.9, 14.6, 0.45)[1]} h={0.85 * deckPxPerM(deckPt(0, 14.6)[1])} seed="s5/bench2" phone />
    </>
  );
};

/** S5 on the crane: CraneSet + the judging figures + the stand-in news box. */
export const CraneShot: React.FC<{p?: number}> = ({p}) => (
  <AbsoluteFill style={{backgroundColor: CM.sky}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <CraneSet p={p} figuresStart={<FiguresStart />} figuresEnd={<FiguresEnd />} deckStart={<NewsBoxStandIn />} deckEnd={<TerracePeople />} />
    </svg>
  </AbsoluteFill>
);

/** S5 whole: scene time = frame / 60 (0 = 20.55). */
export const CraneMove: React.FC = () => <CraneShot />;

/** S5's end frame, alive: the landing hold (scene 2.85..3.45) looped. */
export const CraneEnd: React.FC = () => (
  <TimeShift by={-CRANE_T.t1 - 0.02}>
    <CraneShot />
  </TimeShift>
);

// ---------------------------------------------------------------- S6 (the gate) with stand-ins for the board

/** STAND-IN for K3's deal board (560 x 560): frame, tag, the clause block's extent (L5 owns the real one). */
const BoardStandIn: React.FC = () => {
  const b = S6.board0;
  return (
    <g>
      <rect x={b.x0 + 60} y={b.y1 - 20} width={22} height={40} fill={CM.anchor} />
      <rect x={b.x1 - 82} y={b.y1 - 20} width={22} height={40} fill={CM.anchor} />
      <rect x={b.x0} y={b.y0} width={b.x1 - b.x0} height={b.y1 - b.y0 - 18} rx={6} fill={CM.paper} stroke={CM.anchor} strokeWidth={10} />
      <text x={b.x0 + 40} y={b.y0 + 70} fontFamily={FONT} fontSize={34} fill={CM.ink}>
        APRIL 2026 DEAL
      </text>
      <text x={b.x0 + 40} y={b.y0 + 150} fontFamily={FONT} fontSize={56} fill={CM.ink}>
        "any lawful
      </text>
      <text x={b.x0 + 40} y={b.y0 + 212} fontFamily={FONT} fontSize={56} fill={CM.ink}>
        government purpose"
      </text>
      <rect x={b.x0 + 40} y={S6.clauseTopMinY} width={b.x1 - b.x0 - 80} height={190} fill={CM.stucco} />
      <text x={b.x0 + 52} y={S6.clauseTopMinY + 40} fontFamily={FONT} fontSize={26} fill={CM.ink}>
        STAND-IN: the F11 clause block (K3 / L5)
      </text>
    </g>
  );
};

const GatePeople: React.FC<{which: 'mid' | 'near' | 'door'}> = ({which}) => {
  const t = useTime();
  if (which === 'near') {
    return (
      <>
        <NearBack x={150} y={1920} hv={270} seed="s6/r0" />
        <NearBack x={420} y={1920} hv={300} seed="s6/r1" traits={{coat: CM.coatMustard}} />
        <NearBack x={660} y={1920} hv={248} seed="s6/r2" traits={{coat: CM.coatPlum}} />
      </>
    );
  }
  if (which === 'mid') {
    // a jogger crossing the footpath right -> left (in the board's plane, behind the board's legs)
    const x = 1240 - ((t * 190) % 1700);
    return <Person x={x} y={GATE.kerbY - 2} h={300} seed="s6/jog" pose="jog" view="profile" walk={{rate: 2.9}} />;
  }
  // staff backs at the service door (far plane): one walks in before 25.0, one comes out ~26.3 and goes in again
  const D = GATE.door;
  const inX = D.x0 + 40 - Math.max(0, Math.min(1, (0.95 - t) / 0.95)) * 70;
  const show1 = t < 1.0;
  const out = t > 2.35 && t < 3.4;
  const x2 = D.x0 + 60 - Math.min(1, Math.max(0, (t - 2.4) / 0.6)) * 60 + Math.min(1, Math.max(0, (t - 2.9) / 0.45)) * 60;
  return (
    <>
      {show1 ? <Person x={inX} y={D.y1} h={74} seed="s6/staff1" walk={{rate: 1.8}} traits={{coat: CM.coatSlate}} /> : null}
      {out ? <Person x={x2} y={D.y1} h={72} seed="s6/staff2" walk={{rate: 1.8}} traits={{coat: CM.coatOat}} /> : null}
    </>
  );
};

/** S6 whole (scene time = frame / 60, 0 = 24.00). */
export const GateDC: React.FC = () => {
  const t = useTime();
  // Pip on the corner post's cap (the cap rides the board's plane), one ear flick on "veto" (K5's idle carries it)
  return (
    <AbsoluteFill style={{backgroundColor: CM.sky}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <GateSet
          bars={<HighBars seed="s6bars" drift={5} />}
          doorPeople={<GatePeople which="door" />}
          mid={<GatePeople which="mid" />}
          board={<BoardStandIn />}
          pip={<Pip x={GATE.post.x} y={GATE.post.cap} size={98} pose="sit" seed="s6pip" target={[960, 790]} targetWeight={1} />}
          near={<GatePeople which="near" />}
        />
      </svg>
      {t < 0 ? null : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the KitDC contact sheet

export const SHEET_DC = {w: 2160, h: 3000};

const Tile: React.FC<{x: number; y: number; w: number; h: number; vb: [number, number, number, number]; label: string; children?: React.ReactNode}> = ({x, y, w, h, vb, label, children}) => (
  <g>
    <svg x={x} y={y} width={w} height={h} viewBox={vb.join(' ')} preserveAspectRatio="xMidYMid slice">
      <rect x={vb[0] - 10} y={vb[1] - 10} width={vb[2] + 20} height={vb[3] + 20} fill={CM.sky} />
      {children}
    </svg>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={CM.ink} strokeWidth={3} />
    <rect x={x} y={y + h} width={w} height={44} fill={CM.paper} />
    <text x={x + 12} y={y + h + 32} fontFamily={FONT} fontSize={28} fill={CM.ink}>
      {label}
    </text>
  </g>
);

export const KitDC: React.FC = () => {
  const speeds = craneSpeeds();
  const sun = sunAtStart();
  const pb = PENT_BOX;
  return (
    <AbsoluteFill style={{backgroundColor: CM.paper}}>
      <svg width={SHEET_DC.w} height={SHEET_DC.h} viewBox={`0 0 ${SHEET_DC.w} ${SHEET_DC.h}`}>
        <text x={30} y={56} fontFamily={FONT} fontSize={44} fill={CM.ink}>
          K7 Arlington kit (src/v2r/kit/dc) - every piece at the film's size, 10 Canal Mint
        </text>
        {/* row 1: the Pentagon on its mid plane (crop at 2x) + the far band with the obelisk and the bank */}
        <Tile x={30} y={90} w={1300} h={640} vb={[pb.x0 - 40, pb.y0 - 120, (pb.x1 - pb.x0 + 80) * 0.85, (pb.y1 - pb.y0 + 160) * 1.25]} label="THE PENTAGON (true plan: 5 rings, 4 wells, 10 corridors, courtyard; mid plane 22 %, 3/4 backlight)">
          <MidGround />
          <TimeShift by={-3}>
            <Pentagon warmAt={2.5} />
          </TimeShift>
        </Tile>
        <Tile x={1360} y={90} w={770} h={640} vb={[160, 560, 640, 532]} label="FAR (65 %): bank, city, the obelisk; RIVER (40 %)">
          <FarPlane />
          <RiverPlane />
        </Tile>
        {/* row 2: the near-mid before / after the burst (start coords), the terrace tree, the lampposts */}
        <Tile x={30} y={800} w={680} h={720} vb={[0, 560, 1080, 1144]} label="NEAR-MID at 20.70 (buds)">
          <TimeShift by={-0.15}>
            <NearMid burstAt={0.21} />
          </TimeShift>
        </Tile>
        <Tile x={740} y={800} w={680} h={720} vb={[0, 560, 1080, 1144]} label="NEAR-MID at 20.85 (4-frame burst done)">
          <TimeShift by={-0.3}>
            <NearMid burstAt={0.21} />
          </TimeShift>
        </Tile>
        <Tile x={1450} y={800} w={680} h={720} vb={[-200, 600, 1300, 1390]} label="terrace tree, end + wipe lampposts">
          <TerraceTree />
          <g transform="translate(760 1980)">
            <LampPost h={640} />
          </g>
          <g transform="translate(480 1640)">
            <LampPost h={WIPE.h} basket seed="wipe" />
          </g>
        </Tile>
        {/* row 3: the terrace deck (end coords) and the S6 gate pieces */}
        <Tile x={30} y={1590} w={1050} h={700} vb={[0, 1080, 1080, 720]} label="THE TERRACE (deck camera 9.2 m up: balustrade, paving, benches, bin, stroller, tulips, fountain)">
          <Terrace />
          <StrangerBench />
          <rect x={TERRACE.newsBox.x0} y={TERRACE.newsBox.y0} width={TERRACE.newsBox.x1 - TERRACE.newsBox.x0} height={TERRACE.newsBox.y1 - TERRACE.newsBox.y0} fill="none" stroke={CM.box} strokeWidth={3} strokeDasharray="8 6" />
          <rect x={TERRACE.plaqueMount.x0} y={TERRACE.plaqueMount.y0} width={TERRACE.plaqueMount.x1 - TERRACE.plaqueMount.x0} height={TERRACE.plaqueMount.y1 - TERRACE.plaqueMount.y0} fill="none" stroke={CM.box} strokeWidth={3} strokeDasharray="8 6" />
        </Tile>
        <Tile x={1110} y={1590} w={1020} h={700} vb={[0, 600, 1080, 741]} label="S6 GATE: facade band, sliding door + plate, fence, tall corner post, tulips">
          <GateFacade />
          <GateLawnTrees />
          <GateFence />
          <GateNear />
        </Tile>
        {/* row 4: numbers */}
        <g transform="translate(40 2400)">
          <text x={0} y={0} fontFamily={FONT} fontSize={34} fill={CM.ink}>
            CRANE (ONE ease cubicBezier(0.35, 0.03, 0.45, 1.0), 21.30-23.40) - peak speed per layer, px per 60 fps frame:
          </text>
          {speeds.map((s, i) => (
            <text key={s.layer} x={20 + (i % 2) * 1040} y={52 + Math.floor(i / 2) * 44} fontFamily={FONT} fontSize={30} fill={s.max > 15 && !s.layer.includes('wipe') ? CM.pop : CM.ink}>
              {`${s.layer}: ${s.max} px/f at ${s.at.toFixed(2)} s`}
            </text>
          ))}
          <text x={0} y={52 + 4 * 44 + 30} fontFamily={FONT} fontSize={30} fill={CM.ink}>
            {`sun at the start: (${sun.x.toFixed(1)}, ${sun.y.toFixed(1)}) r ${sun.r.toFixed(1)} = SUN1 (250, 650) r 65 | swap behind the wipe at ${(swapAt + 20.55).toFixed(2)} s | the Pentagon at the end: x ${pb.x0.toFixed(0)}-${pb.x1.toFixed(0)}, y ${pb.y0.toFixed(0)}-${pb.y1.toFixed(0)}`}
          </text>
          <text x={0} y={52 + 4 * 44 + 76} fontFamily={FONT} fontSize={30} fill={CM.ink}>
            {`flat steps toward the sky: deck 0 / near-mid 12 / mid 22 / river 40 / far 65 %; ink full, full, hairline, none, none | obelisk top ${VISTA.obelisk.top}, bank top >= ${VISTA.bank.topMin}`}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

void craneP;
void applyMat;
void S6_T0;
