// V2S1_row_entry.tsx (lane L1, the row builder): a DEV entry, not part of the film (the film is src/entry-v2r-film.tsx).
// Palette first. Compositions (1080 x 1920, 60 fps):
//   RowSheet   the row figure's model sheet: her, G1, G6 and a bare outline through one walk cycle (steps 0.5-2.25),
//              her look-back, and the cover (8.5) and freeze (7.5) line-ups at the map's x / h (s1RowAt)
//   RowShot    props {legs}: the V2S1 shot on its own clock, 0-6.5 s (no captions / voice): many frames per bundle
//   RowOnly    the row alone on a flat ground (world px, zoom 1.00), for measuring the gaps between neighbours
//   RowAt      props {t, legs}: the whole V2S1 shot at film time t with a ghost-leg variant ('clamp' | 'head' | 'mid')
// GL=angle node scripts/render-frames.mjs RowSheet <dir> 0 --entry=src/v2r/scenes/V2S1_row_entry.tsx --scale=1
// GL=angle node scripts/render-frames.mjs RowAt <dir> 0 --entry=src/v2r/scenes/V2S1_row_entry.tsx --props='{"t":5.3,"legs":"head"}'
import '../palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {World} from '../../lib/World';
import {Fill} from '../../lib/Fill';
import {TimeProvider} from '../../lib/time';
import {CM} from '../palette';
import * as MAP from '../world/map';
import V2S1 from './V2S1';
import {RowFigure} from './V2S1_row_fig';
import {ghostSpec, ghostStride, herSpec, OUTLINE_SPEC, RowDevCtx, S1Row, type LegVariant} from './V2S1_row';

const STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25];

const Band: React.FC<{y0: number; y1: number; color: string}> = ({y0, y1, color}) => <Fill d={`M0 ${y0}H1080V${y1}H0Z`} color={color} offset={false} />;

const lineup = (t: number, step: number, y0: number, legs: LegVariant) => {
  const poses = MAP.s1RowAt(t);
  return MAP.S1_ROW.map((m, i) => {
    const p = poses[i];
    const y = y0 + (p.feetY - 1095);
    const x = m.kind === 'her' ? MAP.s1HerX(t) : p.x;
    if (m.kind === 'her') return <RowFigure key={m.id} seed={`sheet/${m.id}`} spec={herSpec(CM.hero)} x={x} y={y} h={p.h} step={step} inkPx={3.4} />;
    if (m.kind === 'outline') return <RowFigure key={m.id} seed={`sheet/${m.id}`} spec={OUTLINE_SPEC} x={x} y={y} h={p.h} step={step} inkPx={2.2} knockout />;
    const age = Number(m.id.slice(1));
    return <RowFigure key={m.id} seed={`sheet/${m.id}`} spec={ghostSpec(age, legs)} x={x} y={y} h={p.h} step={step} stride={ghostStride(age)} inkPx={2.2} />;
  });
};

const Sheet: React.FC<{legs?: LegVariant}> = ({legs = 'clamp'}) => (
  <TimeProvider global={6}>
    <World sky={CM.paving}>
      {/* a wing-like band behind the upper half of each row (light brick / glass), so the ghosts' paper reads as in the shot */}
      {[0, 1, 2, 3].map((r) => (
        <React.Fragment key={r}>
          <Band y0={150 + r * 270} y1={255 + r * 270} color={r % 2 ? CM.glass : CM.brickLight} />
          <Band y0={255 + r * 270} y1={330 + r * 270} color={CM.stucco} />
        </React.Fragment>
      ))}
      <Band y0={1240} y1={1395} color={CM.brickLight} />
      <Band y0={1395} y1={1450} color={CM.paving} />
      <Band y0={1550} y1={1705} color={CM.glass} />
      <Band y0={1705} y1={1760} color={CM.paving} />
      {STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <RowFigure seed="sheet/her" spec={herSpec(CM.hero)} x={70 + i * 128} y={330} h={170} step={s} inkPx={3.4} />
          <RowFigure seed="sheet/g1" spec={ghostSpec(1, legs)} x={70 + i * 128} y={600} h={170} step={s} inkPx={2.2} />
          <RowFigure seed="sheet/g6" spec={ghostSpec(6, legs)} x={70 + i * 128} y={870} h={170} step={s} stride={ghostStride(6)} inkPx={2.2} />
          <RowFigure seed="sheet/o1" spec={OUTLINE_SPEC} x={70 + i * 128} y={1140} h={170} step={s} inkPx={2.2} knockout />
        </React.Fragment>
      ))}
      <RowFigure seed="sheet/herLook" spec={herSpec(CM.hero)} x={1040} y={330} h={170} step={8.5} turn={1} inkPx={3.4} />
      <RowFigure seed="sheet/g4" spec={ghostSpec(4, legs)} x={1040} y={600} h={170} step={8.5} stride={ghostStride(4)} inkPx={2.2} />
      {lineup(5.3, 8.5, 1450, legs)}
      {lineup(4.6, 7.5, 1760, legs)}
    </World>
  </TimeProvider>
);

type AtProps = {t: number; legs?: LegVariant};
const At: React.FC<AtProps> = ({t, legs = 'clamp'}) => (
  <TimeProvider global={t}>
    <RowDevCtx.Provider value={{legs}}>
      <V2S1 />
    </RowDevCtx.Provider>
  </TimeProvider>
);

/** The shot on its own clock (no captions, no voice): one bundle renders any frames, with a leg variant. */
const Shot: React.FC<{legs?: LegVariant}> = ({legs = 'clamp'}) => (
  <RowDevCtx.Provider value={{legs}}>
    <V2S1 />
  </RowDevCtx.Provider>
);

/** The row alone on a flat ground in world px (zoom 1.00): the gap measurement (tools/rowgaps.py). */
const RowOnly: React.FC<{legs?: LegVariant}> = ({legs = 'clamp'}) => (
  <RowDevCtx.Provider value={{legs}}>
    <World sky={CM.paving}>
      <S1Row />
    </World>
  </RowDevCtx.Provider>
);

const Root: React.FC = () => (
  <>
    <Composition id="RowOnly" component={RowOnly} defaultProps={{legs: 'clamp' as LegVariant}} durationInFrames={390} fps={60} width={1080} height={1920} />
    <Composition id="RowShot" component={Shot} defaultProps={{legs: 'clamp' as LegVariant}} durationInFrames={390} fps={60} width={1080} height={1920} />
    <Composition id="RowSheet" component={Sheet} defaultProps={{legs: 'clamp' as LegVariant}} durationInFrames={1} fps={60} width={1080} height={1920} />
    <Composition id="RowAt" component={At} defaultProps={{t: 5.3, legs: 'clamp'} as AtProps} durationInFrames={1} fps={60} width={1080} height={1920} />
  </>
);

registerRoot(Root);
