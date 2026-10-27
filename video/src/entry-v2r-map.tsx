// Video 2 (restart) K2: the MAP CONTRACT drawn as labelled boxes, lines and points over the palette's sky / ground
// (no art), so builders and critics can overlay it on their renders. Every number comes from src/v2r/world/map.ts.
// The palette module is imported FIRST (it rewrites the house tokens in place).
// Compositions (1080 x 1920):
//   MapContract      8 frames at 1 fps: frame i = shot V2S(i+1) at its pose (POSE_T)
//   MapContractShot  props {id, t}: one shot's contract at any film time t (overlay it on a lane render)
//   MapOverview      the map: the canal east-west, the places in order, every lens and where it looks
// Sheet: node scripts/render-frames.mjs MapContract <dir> 0,1,2,3,4,5,6,7 --entry=src/entry-v2r-map.tsx --scale=0.25
// One shot at a time: ... MapContractShot <dir> 0 --entry=src/entry-v2r-map.tsx --props='{"id":"V2S6","t":26.5}'
import './v2r/palette';
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {CM, LIGHT, SHOT_LIGHT} from './v2r/palette';
import * as M from './v2r/world/map';

const FW = M.FRAME_W;
const FH = M.FRAME_H;
const FONT = "'DejaVu Sans', 'Liberation Sans', Arial, sans-serif";

/** Overlay colours (a contract sheet, not the film: chosen to read against the mint and the page). */
const C = {
  zoneBand: '#D8432E',
  keyRead: '#1F7A3A',
  rail: '#4A4A58',
  line: '#7A4A2A',
  key: '#2B1B0A',
  text: '#1E4FA8',
  her: CM.hero,
  ghost: '#6E6880',
  pip: '#4B4FB8',
  sun: CM.pop,
  figure: '#5A3E6E',
  mass: '#8C6E5A',
  match: '#C2185B',
};
const roleColour: Record<M.ShapeRole, string> = {
  key: C.key, text: C.text, her: C.her, ghost: C.ghost, pip: C.pip, sun: C.sun, figure: C.figure, mass: C.mass, line: C.line, match: C.match,
};

/** A label that always stays inside the frame (it flips its anchor at the right edge). */
const Label: React.FC<{x: number; y: number; text: string; color: string; size?: number; anchor?: 'start' | 'end' | 'middle'; bold?: boolean}> = ({x, y, text, color, size = 20, anchor = 'start', bold}) => {
  const w = text.length * size * (bold ? 0.6 : 0.55);
  let ax = x;
  let an = anchor;
  if (an === 'middle') ax = Math.max(w / 2 + 6, Math.min(FW - 6 - w / 2, x));
  else if (an === 'start' && x + w > FW - 6) {
    an = 'end';
    ax = FW - 6;
  } else if (an === 'end' && x - w < 6) {
    an = 'start';
    ax = 6;
  }
  return (
    <text x={ax} y={y} fill={color} fontSize={size} fontFamily={FONT} fontWeight={bold ? 700 : 500} textAnchor={an}
      stroke={CM.paper} strokeWidth={size / 5} paintOrder="stroke" strokeLinejoin="round">
      {text}
    </text>
  );
};

const clampX = (x: number) => Math.max(6, Math.min(FW - 6, x));

const ShapeView: React.FC<{s: M.Shape; i: number}> = ({s, i}) => {
  const col = roleColour[s.role];
  const dash = s.role === 'mass' ? '10 8' : undefined;
  const sw = s.role === 'mass' ? 2.5 : s.role === 'line' ? 3 : 4;
  if (s.kind === 'rect') {
    const r = s.r;
    const fill = s.role === 'mass' ? 'none' : s.role === 'text' ? 'rgba(30,79,168,0.10)' : 'rgba(43,27,10,0.06)';
    return (
      <g>
        <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill={fill} stroke={col} strokeWidth={sw} strokeDasharray={dash} />
        <Label x={clampX(r.x0 + 6)} y={r.y0 + 22} text={s.label} color={col} size={s.role === 'mass' ? 17 : 20} />
      </g>
    );
  }
  if (s.kind === 'disc') {
    const d = s.d;
    return (
      <g>
        <circle cx={d.x} cy={d.y} r={d.r} fill="rgba(238,106,46,0.35)" stroke={col} strokeWidth={4} />
        <line x1={d.x - 12} y1={d.y} x2={d.x + 12} y2={d.y} stroke={col} strokeWidth={3} />
        <line x1={d.x} y1={d.y - 12} x2={d.x} y2={d.y + 12} stroke={col} strokeWidth={3} />
        <Label x={clampX(d.x + d.r + 8)} y={d.y + 6} text={s.label} color={col} size={20} />
      </g>
    );
  }
  if (s.kind === 'fig') {
    const r = M.figRect(s.f, s.aspect ?? M.FIGURE_ASPECT_OVERLAY);
    const headR = Math.min((r.x1 - r.x0) * 0.45, s.f.h * 0.09);
    return (
      <g>
        <rect x={r.x0} y={r.y0 + headR * 2} width={r.x1 - r.x0} height={r.y1 - r.y0 - headR * 2} fill={s.outline ? 'none' : 'rgba(251,246,238,0.7)'}
          stroke={col} strokeWidth={3} strokeDasharray={s.outline ? '6 5' : undefined} />
        <circle cx={s.f.x} cy={r.y0 + headR} r={headR} fill={s.outline ? 'none' : col} stroke={col} strokeWidth={2.5} />
        <line x1={r.x0 - 6} y1={s.f.feetY} x2={r.x1 + 6} y2={s.f.feetY} stroke={col} strokeWidth={3} />
        <Label x={s.f.x} y={r.y0 - 8 - (i % 3) * 18} text={s.label} color={col} size={16} anchor="middle" />
      </g>
    );
  }
  if (s.kind === 'pip') {
    const r = M.pipBox(s.s, s.h);
    return (
      <g>
        <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} rx={(r.x1 - r.x0) * 0.35} fill="rgba(148,151,216,0.45)" stroke={col} strokeWidth={4} />
        <circle cx={s.s.x} cy={s.s.y} r={7} fill={col} />
        <Label x={clampX(r.x1 + 6)} y={r.y0 + 22} text={s.label} color={col} size={19} anchor={r.x1 + 260 > FW ? 'end' : 'start'} />
      </g>
    );
  }
  const d = s.pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const p0 = s.pts[s.pts.length - 1];
  return (
    <g>
      <path d={d} fill="none" stroke={col} strokeWidth={sw} strokeDasharray="14 8" />
      <Label x={clampX(p0.x + 6)} y={p0.y - 8} text={s.label} color={col} size={16} />
    </g>
  );
};

const MatchView: React.FC<{m: M.MatchPoint; side: 'in' | 'out'}> = ({m, side}) => (
  <g>
    {m.shapes.filter((sh) => sh.side === 'both' || sh.side === side).map((sh, i) => {
      const lab = `MATCH ${side === 'out' ? 'OUT' : 'IN'} ${m.t.toFixed(2)}: ${sh.label}`;
      if (sh.spot) {
        const r = M.spotRect(sh.spot);
        return (
          <g key={i}>
            <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill="none" stroke={C.match} strokeWidth={5} strokeDasharray="4 6" />
            <Label x={clampX(r.x0)} y={r.y1 + 24} text={lab} color={C.match} size={18} bold />
          </g>
        );
      }
      if (sh.disc) {
        return (
          <g key={i}>
            <circle cx={sh.disc.x} cy={sh.disc.y} r={sh.disc.r} fill="none" stroke={C.match} strokeWidth={5} strokeDasharray="4 6" />
            <Label x={clampX(sh.disc.x - sh.disc.r)} y={sh.disc.y + sh.disc.r + 26} text={lab} color={C.match} size={18} bold />
          </g>
        );
      }
      if (sh.rect) {
        const r = sh.rect;
        return (
          <g key={i}>
            <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill="none" stroke={C.match} strokeWidth={4} strokeDasharray="4 6" />
            <Label x={clampX(Math.max(r.x0, 0) + 4)} y={r.y1 - 8} text={lab} color={C.match} size={17} bold />
          </g>
        );
      }
      if (sh.seat) {
        return (
          <g key={i}>
            <circle cx={sh.seat.x} cy={sh.seat.y} r={14} fill="none" stroke={C.match} strokeWidth={5} />
            <line x1={sh.seat.x - 22} y1={sh.seat.y} x2={sh.seat.x + 22} y2={sh.seat.y} stroke={C.match} strokeWidth={4} />
            <Label x={clampX(sh.seat.x + 20)} y={sh.seat.y + 30} text={lab} color={C.match} size={17} bold />
          </g>
        );
      }
      return null;
    })}
  </g>
);

const Zones: React.FC = () => {
  const b = M.UI.captionBand;
  const k = M.UI.keyRead;
  const r = M.UI.rightRail;
  return (
    <g>
      <defs>
        <pattern id="hatchBand" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="18" stroke={C.zoneBand} strokeWidth="3" />
        </pattern>
        <pattern id="hatchRail" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="22" stroke={C.rail} strokeWidth="2.5" />
        </pattern>
      </defs>
      <rect x={b.x0} y={b.y0} width={b.x1 - b.x0} height={b.y1 - b.y0} fill="url(#hatchBand)" opacity={0.55} />
      <line x1={0} y1={b.y0} x2={FW} y2={b.y0} stroke={C.zoneBand} strokeWidth={3} />
      <line x1={0} y1={b.y1} x2={FW} y2={b.y1} stroke={C.zoneBand} strokeWidth={3} />
      <Label x={FW / 2} y={(b.y0 + b.y1) / 2 + 10} text="CAPTION BAND y 317-556: nothing drawn" color={C.zoneBand} size={30} anchor="middle" bold />
      <rect x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} fill="url(#hatchRail)" opacity={0.35} />
      <Label x={FW - 10} y={r.y0 + 30} text="RIGHT RAIL x > 780: masses only" color={C.rail} size={18} anchor="end" bold />
      <rect x={k.x0} y={k.y0} width={k.x1 - k.x0} height={k.y1 - k.y0} fill="none" stroke={C.keyRead} strokeWidth={4} strokeDasharray="22 10" />
      <Label x={k.x0 + 6} y={k.y1 - 10} text="KEY READS x 120-880, y 290-1250" color={C.keyRead} size={18} bold />
      <line x1={0} y1={M.UI.skylineMinY} x2={FW} y2={M.UI.skylineMinY} stroke={C.line} strokeWidth={2} strokeDasharray="4 8" />
      <Label x={FW - 10} y={M.UI.skylineMinY - 8} text="skyline y 600 (nothing built above)" color={C.line} size={16} anchor="end" />
      <line x1={0} y1={M.UI.bottomThird.y0} x2={FW} y2={M.UI.bottomThird.y0} stroke={C.rail} strokeWidth={3} strokeDasharray="2 6" />
      <Label x={FW - 10} y={M.UI.bottomThird.y0 + 24} text="BOTTOM THIRD y 1250+: masses under the UI, never quiet" color={C.rail} size={17} anchor="end" />
    </g>
  );
};

const Ground: React.FC<{id: M.ShotId}> = ({id}) => {
  const st = LIGHT[SHOT_LIGHT[id]];
  const bandH = 44;
  return (
    <svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{position: 'absolute', inset: 0}}>
      <rect x={0} y={0} width={FW} height={600} fill={st.sky} />
      {st.bands.map((c, i) => (
        <rect key={i} x={0} y={600 + i * bandH} width={FW} height={bandH} fill={c} />
      ))}
      <rect x={0} y={600 + st.bands.length * bandH} width={FW} height={FH} fill={CM.paving} />
    </svg>
  );
};

const wrapWords = (text: string, n: number): string[] => {
  const out: string[] = [];
  let cur = '';
  text.split(' ').forEach((w) => {
    if ((cur + ' ' + w).trim().length > n) {
      out.push(cur.trim());
      cur = w;
    } else cur += ' ' + w;
  });
  if (cur.trim()) out.push(cur.trim());
  return out;
};

const ShotContract: React.FC<{id: M.ShotId; t?: number}> = ({id, t}) => {
  const sp = M.shotById(id);
  const at = t ?? M.POSE_T[id];
  const shapes = M.shotShapes(id, at);
  const order: M.ShapeRole[] = ['mass', 'line', 'sun', 'key', 'text', 'figure', 'ghost', 'her', 'pip', 'match'];
  const sorted = [...shapes].sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role));
  const ins = M.MATCHES.filter((m) => m.in === id && id !== 'V2S1');
  const outs = M.MATCHES.filter((m) => m.out === id);
  const loopIn = id === 'V2S1' ? M.MATCHES.filter((m) => m.out === 'V2S8' && m.in === 'V2S1') : [];
  const pip = M.pipShot(id);
  const head = `${id} ${sp.name}`;
  const info = [
    `${sp.start.toFixed(2)}-${sp.end.toFixed(2)} s (f${sp.startF}-${sp.endF}) · light ${sp.light} · ${sp.mood} · lane ${sp.lane} · set ${sp.set}`,
    ...wrapWords(`drawn at t = ${at.toFixed(2)} s · pose: ${sp.pose}`, 84),
    ...wrapWords(`"${sp.words}"`, 78),
    ...wrapWords(`explains: ${sp.explains}`, 82),
  ];
  const foot = [
    `Pip (${pip.reaction}): ` + pip.beats.map((b) => `${b.t.toFixed(2)} ${b.what}`).join(' · '),
    ...outs.map((m) => `OUT ${m.cut} @ ${m.t.toFixed(2)}: ${m.rule}`),
    ...ins.map((m) => `IN ${m.cut} @ ${m.t.toFixed(2)}: ${m.rule}`),
    ...loopIn.map((m) => `LOOP ${m.cut}: ${m.rule}`),
    `bottom third: ${M.BOTTOM_THIRD[id]}`,
  ];
  const footLines = foot.reduce<string[]>((acc, l) => acc.concat(wrapWords(l, 92)), []);
  return (
    <AbsoluteFill style={{backgroundColor: CM.paving}}>
      <Ground id={id} />
      <svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{position: 'absolute', inset: 0}}>
        <Zones />
        {sorted.map((s, i) => (
          <ShapeView key={i} s={s} i={i} />
        ))}
        {outs.map((m, i) => (
          <MatchView key={`o${i}`} m={m} side="out" />
        ))}
        {ins.map((m, i) => (
          <MatchView key={`i${i}`} m={m} side="in" />
        ))}
        {loopIn.map((m, i) => (
          <MatchView key={`l${i}`} m={m} side="in" />
        ))}
        <Label x={24} y={52} text={head} color={C.key} size={34} bold />
        {info.map((l, i) => (
          <Label key={i} x={24} y={86 + i * 26} text={l} color={C.key} size={19} />
        ))}
        <rect x={0} y={FH - 24 - footLines.length * 25} width={FW} height={footLines.length * 25 + 24} fill="rgba(251,243,230,0.88)" />
        {footLines.map((l, i) => (
          <Label key={i} x={18} y={FH - 14 - (footLines.length - 1 - i) * 25} text={l} color={C.key} size={18} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** MapContract: frame i = shot i at its pose. */
const MapContract: React.FC = () => {
  const f = useCurrentFrame();
  const id = M.SHOT_IDS[Math.min(M.SHOT_IDS.length - 1, Math.max(0, f))];
  return <ShotContract id={id} />;
};

const MapContractShot: React.FC<{id: M.ShotId; t?: number}> = ({id, t}) => <ShotContract id={id} t={t} />;

/** MapOverview: the canal east-west (east = right, north = up), the places in order, every lens. */
const MapOverview: React.FC = () => {
  const x0 = 980;
  const k = 0.95; // px per metre of schematic chainage (west = left)
  const cx = (m: number) => x0 - m * k;
  const canalY = 760;
  const north = M.MAP_PLACES.filter((p) => p.side === 'north' || p.side === 'water');
  const south = M.MAP_PLACES.filter((p) => p.side === 'south');
  const lensAt: Record<M.ShotId, {x: number; y: number; dir: number}> = {
    V2S1: {x: cx(10), y: canalY + 120, dir: -90},
    V2S2: {x: cx(30), y: canalY + 80, dir: -90},
    V2S3: {x: cx(520), y: canalY + 100, dir: -90},
    V2S4: {x: cx(380), y: canalY + 20, dir: -90},
    V2S7: {x: cx(90), y: canalY - 120, dir: -90},
    V2S8: {x: cx(470), y: canalY - 70, dir: 180},
    V2S5: {x: 420, y: 1640, dir: -45},
    V2S6: {x: 690, y: 1320, dir: 90},
  };
  return (
    <AbsoluteFill style={{backgroundColor: CM.paper}}>
      <svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`}>
        <Label x={24} y={64} text="K2 MAP: one London canal, EAST-WEST (north up, east right)" color={C.key} size={26} bold />
        <Label x={24} y={100} text="North bank east -> west: Google's wing -> towpath walk -> ONE fingerpost -> her terrace (+ cafe boat) -> gasholders" color={C.key} size={19} />
        <Label x={24} y={126} text="Her way home is WEST: S4 and S8 are one walk home. North-looking lenses: west = screen LEFT." color={C.key} size={19} />
        <rect x={40} y={canalY - 30} width={FW - 80} height={60} fill={CM.water} stroke={C.line} strokeWidth={3} />
        <Label x={FW / 2} y={canalY + 8} text="THE CANAL" color={C.key} size={22} anchor="middle" bold />
        <line x1={300} y1={canalY + 60} x2={120} y2={canalY + 60} stroke={C.her} strokeWidth={6} markerEnd="url(#arr)" />
        <Label x={310} y={canalY + 68} text="her way home: WEST" color={C.her} size={20} bold />
        <defs>
          <marker id="arr" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={C.her} />
          </marker>
          <marker id="arrK" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={C.match} />
          </marker>
        </defs>
        {north.map((p, i) => {
          const x = cx(p.chainM);
          const y = canalY - 60 - (i % 3) * 110;
          return (
            <g key={p.id}>
              <line x1={x} y1={canalY - 30} x2={x} y2={y} stroke={C.line} strokeWidth={2} />
              <circle cx={x} cy={y} r={9} fill={p.side === 'water' ? CM.waterDeep : CM.brick} stroke={C.key} strokeWidth={2} />
              <Label x={x} y={y - 16} text={`${p.id} (${p.shots.join(' ')})`} color={C.key} size={17} anchor="middle" />
            </g>
          );
        })}
        {south.map((p) => {
          const x = cx(p.chainM);
          return (
            <g key={p.id}>
              <circle cx={x} cy={canalY + 50} r={9} fill={CM.limestone} stroke={C.key} strokeWidth={2} />
              <Label x={x - 14} y={canalY + 56} text={`${p.id}`} color={C.key} size={17} anchor="end" />
            </g>
          );
        })}
        {(Object.keys(lensAt) as M.ShotId[]).map((id) => {
          const l = lensAt[id];
          const a = (l.dir * Math.PI) / 180;
          return (
            <g key={id}>
              <line x1={l.x} y1={l.y} x2={l.x + Math.cos(a) * 70} y2={l.y + Math.sin(a) * 70} stroke={C.match} strokeWidth={4} markerEnd="url(#arrK)" />
              <circle cx={l.x} cy={l.y} r={8} fill={C.match} />
              <Label x={l.x + 12} y={l.y + 28} text={`${id} looks ${M.LENSES[id].looks}`} color={C.match} size={17} bold />
            </g>
          );
        })}
        <rect x={40} y={1200} width={FW - 80} height={560} fill="none" stroke={C.line} strokeWidth={3} strokeDasharray="12 8" />
        <Label x={60} y={1240} text="ARLINGTON, VIRGINIA (an April morning; she is never here)" color={C.key} size={22} bold />
        <Label x={60} y={1272} text="S5: viewpoint terrace SW of the Pentagon looking NE (lawns, parkway, Pentagon, Potomac, city, obelisk)" color={C.key} size={17} />
        <Label x={60} y={1298} text="S6: perimeter footpath looking SOUTH (facade band, fence + tall corner post, service door, blossom)" color={C.key} size={17} />
        <rect x={560} y={1420} width={260} height={180} fill={CM.limestone} stroke={C.key} strokeWidth={3} />
        <Label x={690} y={1516} text="the Pentagon" color={C.key} size={20} anchor="middle" />
        <Label x={60} y={1820} text={M.SHOTS.map((s) => `${s.id} ${s.start.toFixed(2)}-${s.end.toFixed(2)}`).join('  ')} color={C.key} size={15} />
        <Label x={60} y={1850} text={M.SHOTS.map((s) => `${s.id} ${s.light}`).join('  ')} color={C.key} size={15} />
      </svg>
    </AbsoluteFill>
  );
};

const V2RMapRoot: React.FC = () => (
  <>
    <Composition id="MapContract" component={MapContract} durationInFrames={M.SHOT_IDS.length} fps={1} width={FW} height={FH} />
    <Composition id="MapContractShot" component={MapContractShot} defaultProps={{id: 'V2S1' as M.ShotId, t: M.POSE_T.V2S1}} durationInFrames={1} fps={M.FPS} width={FW} height={FH} />
    <Composition id="MapOverview" component={MapOverview} durationInFrames={1} fps={1} width={FW} height={FH} />
  </>
);

registerRoot(V2RMapRoot);
