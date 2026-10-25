// ---------------------------------------------------------------- the searchlight sweep (degrees BELOW the horizontal,
// pointing left across the dome from the tower inside its right flank)

/** 'hacking': the beam swings down onto the pile at the dome's foot (its centre line ends at the foot ~x 158). */
const CATCH_DEG = 39;
const SWEEP: [number, number][] = [
  [T.that, 4],
  [T.once, -6],
  [T.tens + 0.3, -42], // crosses the dome's crown
  [T.hacking, CATCH_DEG], // sweeps back down and CATCHES a group of the pile, on the word
  [T.fortyFive, 8],
];
const sweepAngle = (t: number) => {
  if (t <= SWEEP[0][0]) return SWEEP[0][1];
  for (let i = 1; i < SWEEP.length; i++) {
    if (t <= SWEEP[i][0]) return lerp(SWEEP[i - 1][1], SWEEP[i][1], E.inOutSine(prog(t, SWEEP[i - 1][0], SWEEP[i][0] - SWEEP[i - 1][0])));
  }
  return 8 + 12 * Math.sin((t - T.fortyFive) * 1.5);
};

// ---------------------------------------------------------------- the near rattlers (row 3: NOT counted)

const door3 = (i: number) => DOORS3[i];
const R3 = (i: number, h: number) => ({x: door3(i).x, y: door3(i).y, dh: door3(i).h, h});
const RATTLERS3: RattlerSpec[] = [
  // 'ALREADY': three pop (the two nearest at 86-92 px), a fourth on the second beat; on 'attempts' A gives up and hops
  // to the edge door, and D takes A's door (a chain of two hops)
  {...R3(0, 86), at: T.already, rattles: [T.already + 0.04, T.rattleA, T.itWas + 0.06, T.thousands + 0.1, T.millions, T.wave2 + 0.2], hop: {at: T.attempts, to: door3(4).x, toY: door3(4).y}, seed: 'r3a'},
  {...R3(2, 92), at: T.already + 0.05, rattles: [T.already + 0.09, T.itWas, T.thousands + 0.15, T.attempts + 0.42, T.comma, T.millions + 0.05], seed: 'r3b'},
  {...R3(3, 62), at: T.already + 0.1, rattles: [T.already + 0.14, T.trying + 0.2], seed: 'r3c'},
  {...R3(1, 90), at: T.already2, rattles: [T.already2 + 0.04, T.rattleA + 0.05, T.they + 0.2, T.hacking, T.comma + 0.05, T.wave2], hop: {at: T.attempts + 0.12, to: door3(0).x, toY: door3(0).y}, seed: 'r3d'},
];
// row 2 (doors across the whole width, 32-40 px) on 'trying'; one extra rattle at 2.25 s (the crane's settle: a fresh
// onset in the gap before the end of 'it')
const RATTLERS2: RattlerSpec[] = R2.map((q, i) => ({
  x: q.x,
  y: q.y,
  h: q.h,
  dh: q.h * 1.18,
  at: T.trying + (i % 3) * 0.1 + Math.floor(i / 3) * 0.05,
  rattles: [T.trying + 0.04 + (i % 3) * 0.1, ...(i === 1 ? [2.25] : []), T.rattleA + i * 0.06, T.itWas + 0.3 + i * 0.05, T.tens + (i % 3) * 0.1, T.attempts + 0.2 + i * 0.04, T.millions + i * 0.03],
  seed: `r2_${i}`,
}));

// ---------------------------------------------------------------- the COUNTED pile at the dome's foot (x >= 120)

/** Distance from point p to the beam's centre ray at angle deg (lamp -> its end at the glass / foot). */
const beamDist = (px: number, py: number, deg: number) => {
  const o: [number, number] = [330, 941];
  const e = beamEnd(deg);
  const vx = e[0] - o[0];
  const vy = e[1] - o[1];
  const u = Math.max(0, Math.min(1, ((px - o[0]) * vx + (py - o[1]) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - (o[0] + vx * u), py - (o[1] + vy * u));
};

const PILE: PileFig[] = (() => {
  // ranks along the foot (x 132-360, back ranks higher and smaller) + a short climb up the outside of the left flank
  const slots = pileSlots({seed: 's8/pile', front: {x0: 132, x1: 360, y: 1074, h: [24, 30], ranks: 4}, flank: {y0: 1012, y1: 905, n: 7, h: [20, 25]}});
  const early = slots.filter((s) => !s.flank && s.rank < 3).sort((a, b) => a.rank - b.rank || a.x - b.x);
  const late = slots.filter((s) => s.flank || s.rank >= 3);
  const out: PileFig[] = [];
  const n = early.length;
  early.forEach((s, i) => {
    // 6 on 'they', +10 on 'tens', the rest on 'thousands' (a ripple left to right)
    const at = i < 6 ? T.they + i * 0.03 : i < 16 ? T.tens + (i - 6) * 0.02 : T.thousands + ((i - 16) / Math.max(1, n - 17)) * 0.25;
    const hit = beamDist(s.x, s.y - s.h * 0.5, CATCH_DEG) < 16 && s.x < 260;
    const arm = rand('s8/pa', `${i}`) < 0.36 ? ((rand('s8/pas', `${i}`) < 0.5 ? -1 : 1) as -1 | 1) : undefined;
    out.push({
      x: s.x,
      y: s.y,
      h: s.h,
      at,
      hood: rand('s8/ph', `${i}`) < 0.65,
      fill: (i % 2) as 0 | 1,
      arm,
      taps: [at + 0.02, ...(i < 16 ? [T.thousands + (i % 4) * 0.05] : []), ...(hit ? [T.hacking] : []), T.in + (i % 5) * 0.04, T.stamp1Ring + ((i * 3) % 7) * 0.03, T.millions + (i % 5) * 0.05, T.within + (i % 4) * 0.08],
      flash: hit ? T.hacking : undefined,
    });
  });
  late.forEach((s, i) => {
    const at = T.millions + (i % 3) * 0.033;
    out.push({x: s.x, y: s.y, h: s.h, at, hood: rand('s8/ph', `l${i}`) < 0.65, fill: (i % 2) as 0 | 1, arm: s.flank ? 1 : i % 3 === 0 ? -1 : undefined, taps: [at + 0.03, T.wave2 + (i % 4) * 0.05, T.within + (i % 3) * 0.1]});
  });
  // back to front: higher figures first
  return out.sort((a, b) => a.y - b.y);
})();

// ---------------------------------------------------------------- the flood ('millions'): crowds OUTSIDE the dome

const FLOOD = (() => {
  // 'use it': four small clusters of heads in the far streets (right of the dome, 16-19 px: head dots 6-8 px)
  const useIt = [
    [462, 530],
    [606, 676],
    [770, 846],
    [944, 1030],
  ].flatMap(([a, b], k) => crowdBand(`s8/u${k}`, a, b, 1106, 16, 19, 2, T.useIt + k * 0.06, 0.1, {rank0: 4, arms: k % 2, skip: outsideDome}));
  // 'millions': ONE burst (2 frames, rippling out from the dome) over the far streets and the mid rooftops, then a second
  // wave over the far skyline left to right; fewer, bigger ranks (far 16-21 px, mid 30-38 px)
  const farBurst = crowdBand('s8/bf', -40, 1120, 1098, 17, 21, 2, T.millions, 0.067, {order: {from: DOME8.cx}, rank0: 2, arms: 3, skip: outsideDome});
  const farWave = crowdBand('s8/wf', -40, 1120, 1032, 15, 18, 2, T.wave2, 0.25, {order: 'ltr', rank0: 0, arms: 2, skip: outsideDome});
  const midBurst = crowdBand('s8/bm', -40, 1120, 1224, 30, 38, 2, T.millions, 0.067, {order: {from: DOME8.cx}, rank0: 1, arms: 2});
  const midWave = crowdBand('s8/wm', -40, 1120, 1184, 26, 32, 1, T.wave2 + 0.06, 0.2, {order: 'ltr', rank0: 0, arms: 2});
  return {far: [...farWave, ...farBurst, ...useIt] as CrowdFig[], mid: [...midWave, ...midBurst] as CrowdFig[]};
})();

// 'millions': big busts crowd our coping (the flood's foreground; their lower part hidden by the coping)
const NEAR: NearFig[] = [
  {x: 62, h: 104, at: T.millions, fill: 0, hood: true, arm: 1, seed: 'n0'},
  {x: 168, h: 114, at: T.millions + 0.033, fill: 1, hood: true, seed: 'n1'},
  {x: 252, h: 100, at: T.millions + 0.067, fill: 0, hood: false, arm: -1, seed: 'n2'},
  {x: 924, h: 110, at: T.millions + 0.05, fill: 1, hood: true, arm: -1, seed: 'n3'},
  {x: 1018, h: 118, at: T.millions + 0.083, fill: 0, hood: true, seed: 'n4'},
  {x: 1086, h: 100, at: T.wave2 + 0.1, fill: 1, hood: false, seed: 'n5'},
].map((f) => ({...f, y: copingY(f.x) + 30})) as NearFig[];

// the leaked copies landing in the far streets (paper specks)
const PAPER = [
  {x: 40, y: 1250, at: T.were + 0.3, s: 9},
  {x: 30, y: 1110, at: T.were + 0.38, s: 6},
  {x: 210, y: 1262, at: T.were + 0.45, s: 9},
  {x: 60, y: 1118, at: T.were + 0.5, s: 6},
  {x: 300, y: 1250, at: T.were + 0.56, s: 8},
  {x: 160, y: 1240, at: T.were + 0.62, s: 9},
];

// ---------------------------------------------------------------- the copies on the wires (S07 match) + Bit

// x0 / v0 = where and how fast S07 hands each copy over on the cut (scene07 CUT_COPIES / toCut: 387, 280, 124, 216 px/s
// on screen = 298, 215, 95, 166 world px/s here at zoom 1.3); then they ease off along the wire
const COPIES: CopySpec[] = [
  {wire: 0, x0: 128, v0: 298, tau: 0.5, vr: 20, unpegAt: T.were - 0.18, seed: 's8/cp0'},
  {wire: 2, x0: 262, v0: 215, tau: 0.5, vr: 20, unpegAt: T.were, seed: 's8/cp1'},
  // fix round 2: lets go at 2.22 s (end of 'it'), a fresh onset in the crane's settle
  {wire: 1, x0: 392, v0: 95, tau: 0.8, vr: 12, unpegAt: 2.22, seed: 's8/cp2'},
];
const BIT_COPY: CopySpec = {wire: 1, x0: 478, v0: 166, tau: 0.45, vr: 6, unpegAt: T.says + 0.35, seed: 's8/cp3'};

// ---------------------------------------------------------------- Pip (scale 0.75: the peak's tininess), LEFT of the board

const PIP_KEYS = [
  {t: 0, pose: 'sit-back' as const, look: -0.35},
  // 'it was': fix round 2: a back view with the head turned hard RIGHT at the (still empty) board for 0.4 s (the
  // sit-front glance looked at the viewer), then it settles
  {t: T.itWas, pose: 'sit-back' as const, look: 1},
  {t: T.itWas + 0.4, pose: 'sit-back' as const, look: 0.55},
  {t: T.tens + 0.15, pose: 'sit-back' as const, look: -0.8},
  {t: T.thousands + 0.2, pose: 'sit-back' as const, look: 0.6},
  {t: T.attempts + 0.1, pose: 'sit-back' as const, look: -0.9},
  {t: T.earsCover, pose: 'ears-cover' as const},
  {t: T.duskIdle, pose: 'sit-front' as const, expression: 'worried' as const},
];

// ---------------------------------------------------------------- the board (clipped above our coping: it stands behind it)

const BOARD_BOX: [number, number, number, number] = [BOARD.x0, BOARD.y0, BOARD.x1, BOARD.y1];
/** Footer height (world px): two 28 px lines with >= 6 px under the divider and >= 8 px above the frame. */
const FOOTER_H = 70;
const ZONES = counterBoardZones(BOARD_BOX, {footerH: FOOTER_H});
/** L9a's block: the note zone + the gutter up to the first gate (holds 28 px); fix round 2: 11 px right of the flag's
 *  pennant (it touched the 'c' of 'counted'). */
const NOTE_ZONE: [number, number, number, number] = [ZONES.note[0] + 9, ZONES.note[1], ZONES.gates[0] - 4, ZONES.note[3]];

const AboveCoping: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const id = 'cp8' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const y = (x: number) => copingY(x) + 1;
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={`M-200 -2000H1300V${y(1300).toFixed(1)}L-200 ${y(-200).toFixed(1)}Z`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
};

/** Fix round 2: an empty stamp slot is ONE ruled writing line in a light ink step (tan), its ends overshooting a little
 *  (the dashed boxes read as form fields); the stamp prints over it. */
const SlotRule: React.FC<{box: [number, number, number, number]; at: number}> = ({box, at}) => {
  const t = useTimeLocal();
  if (t < at) return null;
  const [x0, , x1, y1] = box;
  return <Ink d={line(x0 + 4, y1 - 7, x1 - 14, y1 - 6, {seed: `s8/rule${Math.round(x1)}`, over: [3, 5]})} width={1.2} color={palette.tan} taper={false} seed={`s8/rule${Math.round(x1)}`} />;
};

// ---------------------------------------------------------------- dome glass interior (for the overlays' clips)

const DOME_INTERIOR = (() => {
  const a = DOME8;
  let d = '';
  for (let i = 0; i <= 48; i++) {
    const th = (Math.PI * i) / 48;
    d += `${i ? 'L' : 'M'}${(a.cx + Math.cos(th) * a.rx).toFixed(1)} ${(a.by - Math.sin(th) * a.ry).toFixed(1)}`;
  }
  return d + 'Z';
})();

// ---------------------------------------------------------------- dusk

/** The set's peach horizon band, stepped toward sage with the dusk (storyboard layer 1: 'peach band (stepped to sage at
 *  dusk)'): it holds peach through the first steps (the last light), then snaps to a light sage band (two of the
 *  storyboard's dusk steps above the final sky) as the sun goes on 'day'. Drawn over the set's band (the sky layer)
 *  and, one more step lighter, inside the dome's glass. */
const DuskBand: React.FC<{glass?: boolean}> = ({glass}) => {
  const t = useTimeLocal();
  if (t < T.day) return null;
  const c = glass ? DUSK_STEPS[0] : DUSK_STEPS[2];
  const [y0, y1] = DOME.band;
  const node = <path d={`M-300 ${y0}H1400V${y1 + 2}H-300Z`} fill={c} />;
  return glass ? <g clipPath="url(#s8domeclip)">{node}</g> : node;
};

/** On 'day' the far rows relight to DUSK HAZE: every fill of rows 0-1 snaps to one flat haze step above the sky (row 0
 *  #84A895, row 1 #7A9B8A; their glass copies inside the dome one step lighter); the lit (peach) windows stay the only
 *  warm accents. A flat colour override of the set's fills (CSS on the layer group: no filter, no fade). */
const HAZE: Record<string, [string, string]> = {row0: ['#84A895', '#90B3A1'], row1: ['#7A9B8A', '#86A796']};
const LIT = [palette.peach, '#F5CCAF', palette.sun].map((c) => `:not([fill="${c}"]):not([fill="${c.toLowerCase()}"])`).join('');
const DuskRelight: React.FC<{name: string; children?: React.ReactNode}> = ({name, children}) => {
  const t = useTimeLocal();
  if (t < T.day || !HAZE[name]) return <>{children}</>;
  const [c, g] = HAZE[name];
  const cls = `s8dk-${name}`;
  return (
    <g className={cls}>
      <style>{`.${cls} path[fill]${LIT}:not([fill="none"]){fill:${c}}.${cls} g[clip-path] path[fill]${LIT}:not([fill="none"]){fill:${g}}`}</style>
      {children}
    </g>
  );
};

/** Fix round 2: the near half of the dusk relight lands EARLY, on the sky's third snap (`within` + 0.3): row 2, row 3
 *  and the neighbours flip to dusk there; the deck, the parapet and the board flip with the sky's `tod` key on 'day'.
 *  Two snaps instead of one 214k px^2 pop 0.4 s before the cut. */
const DUSK_EARLY = T.within + 0.3;
const DuskStep: React.FC<{on: boolean; children?: React.ReactNode}> = ({on, children}) => {
  const t = useTimeLocal();
  return on && t >= DUSK_EARLY ? <Tod value="dusk">{children}</Tod> : <>{children}</>;
};

// ---------------------------------------------------------------- the layers

/** Overlays injected into the DomeCity v3 layers (by its layer names). */
const EXTRAS: Record<string, React.ReactNode> = {
  sky: <DuskBand />,
  domeGlass: (
    <>
      <defs>
        <clipPath id="s8domeclip" clipPathUnits="userSpaceOnUse">
          <path d={DOME_INTERIOR} />
        </clipPath>
      </defs>
      <DuskBand glass />
    </>
  ),
  row1: (
    <>
      <WindowWink x={760} y={1040} cols={4} rows={3} at={T.once + 0.05} size={5} />
      <g clipPath="url(#s8domeclip)">
        <DistrictTowers at={T.cloudflare + 0.42} />
      </g>
      <Flood figs={FLOOD.far} flickerAt={T.duskIdle} seed="s8/ff" />
    </>
  ),
  dome: (
    <>
      <GlintSweep at={T.once} interior={DOME_INTERIOR} x0={126} x1={420} y={1060} L={190} />
      <Watchtower8 at={T.says} />
      <g clipPath="url(#s8domeclip)">
        <Searchlight8 at={T.that} angle={sweepAngle} duskAt={T.day} />
      </g>
      <Pile figs={PILE} />
    </>
  ),
  row2: (
    <>
      <PaperSpecks spots={PAPER} />
      <LightDoors row={2} />
      {RATTLERS2.map((r) => (
        <Rattler key={r.seed} {...r} />
      ))}
      <Flood figs={FLOOD.mid} flickerAt={T.duskIdle} seed="s8/fm" />
    </>
  ),
  near: (
    <>
      <LightDoors row={3} />
      {RATTLERS3.map((r) => (
        <Rattler key={r.seed} {...r} />
      ))}
      <NearCrowd figs={NEAR} />
    </>
  ),
  fg: (
    <>
      <DeckClutter />
      <Pigeons flyAt={T.trying} />
      <TelephoneWires spec={WIRES.S08} seed="s8/wires" />
      <WireSpans />
      <AboveCoping>
        {COPIES.map((c) => (
          <WireCopy key={c.seed} {...c} />
        ))}
        <WireCopy {...BIT_COPY} />
      </AboveCoping>
      <AboveCoping>
        <CounterBoard
          box={BOARD_BOX}
          riseAt={T.board}
          header={['Cloudflare · sits in front', 'of about 1 in 5 websites']}
          headerSize={38}
          flagAt={T.announced}
          gatesAt={GATES_AT}
          footer={['Matthew Prince, Cloudflare CEO, on X', "Cloudflare's own count"]}
          footerAt={T.footer}
          footerH={FOOTER_H}
          seed="s8/board"
        />
        <BoardNote zone={NOTE_ZONE} text={['counted from the', 'public announcement', 'attempts, not break-ins']} fontSize={28} at={T.announced + 0.08} seed="s8/note" />
        <SlotRule box={ZONES.stamps[0]} at={T.board + 0.4} />
        <SlotRule box={ZONES.stamps[1]} at={T.board + 0.4} />
      </AboveCoping>
      <InkStamp box={ZONES.stamps[0]} text="first 45 min: tens of thousands" fontSize={34} at={T.stamp1At} land={T.stamp1Land} s0={1.5} rot={-4} seed="s8/st1" />
      <InkStamp box={ZONES.stamps[1]} text="millions · within a day" fontSize={34} at={T.stamp2At} land={T.stamp2Land} s0={2.0} rot={-3} seed="s8/st2" />
      <StampHit box={ZONES.stamps[0]} text="first 45 min: tens of thousands" fontSize={34} rot={-4} at={T.stamp1Land} dur={0.3} />
      <StampHit box={ZONES.stamps[1]} text="millions · within a day" fontSize={34} rot={-3} at={T.stamp2Land} dur={0.3} />
      <BitRide plan={{copy: BIT_COPY, hopAt: T.bitHop, land: [BOARD.x0 + 32, BOARD.y0], crawlAt: T.bitHop + 0.55, crawlTo: [ZONES.top[0] - 14, BOARD.y0], alertAt: T.millionsWord, zoomAt: camZoom, cheers: [T.tens + 0.06, T.thousands + 0.06, T.attempts + 0.1], size: 20}} />
      <Pip plan={{hopAt: T.settle - 0.48, hopFrom: [-90, copingY(-90)], hopDur: 0.48, spot: PIP, keys: PIP_KEYS, scale: 0.75}} />
    </>
  ),
};

const EARLY = new Set(['row2', 'near']);
const wrap = (name: string, _nearness: number, node: React.ReactNode) =>
  // the sun is screen space (it only swells and sets: no parallax, no lens)
  name === 'sun' ? (
    node
  ) : (
    <>
      <Layer depth={depthOf(name)}>
        <DuskStep on={EARLY.has(name)}>
          <DuskRelight name={name}>{node}</DuskRelight>
          {EXTRAS[name]}
        </DuskStep>
      </Layer>
      {name === 'fg' ? (
        // the rooftop neighbours: nearer than our parapet (they drop away faster during the crane)
        <Layer depth={1 - NEIGHBOUR_F}>
          <DuskStep on>
            <Neighbours phoneAt={T.millions + 0.32} />
          </DuskStep>
        </Layer>
      ) : null}
    </>
  );

const Scene08: React.FC = () => (
  <World stage="context" sky={SKY}>
    <Cam8>
      <DomeCity
        dome={DOME8}
        wrap={wrap}
        sun={<SunInSky />}
        dotsAt={0.12}
        domeAt={T.cloudflare}
        domeDur={0.38}
        towerAt={1e6}
        footprintAt={false}
        duskAt={T.within}
        observer={false}
        doors={false}
      />
    </Cam8>
  </World>
);

export default Scene08;
