// ---------------------------------------------------------------- one row (houses + its terrace)

const RowNode: React.FC<{k: number; zoom: number; extended: boolean}> = ({k, zoom, extended}) => {
  const parts = extended ? [GEO[k].core, GEO[k].edge] : [GEO[k].core];
  const iw = rowInk(k, zoom);
  const depth = Math.min(1, k / (HAZE + 1));
  const wall = atmos(mix(palette.tan, palette.brown, 0.45), depth, 'day', {clear: 0.1});
  const sliver = atmos(mix(palette.tan, palette.tealDark, 0.6), depth, 'day', {clear: 0.1});
  const coping = tint(HALF.sand, k);
  const off: [number, number] | false = k <= 3 ? [misreg.dx / zoom, misreg.dy / zoom] : false;
  const near = k <= 3;
  const cols = near ? COLORS.map((c) => tint(c, k)) : [tint(mix(palette.cream, palette.sand, 0.25), k), tint(palette.sand, k), tint(palette.tan, k)];
  const door = k <= 4 ? palette.teal : tint(palette.teal, k);
  const dw = k <= 2 && iw > 0 ? Math.max(1.5 / zoom, iw * 0.66) : 0;
  return (
    <>
      {parts.map((g, i) => (
        <React.Fragment key={i}>
          {g.wall ? <Fill d={g.wall} color={wall} offset={false} mode="snap" seed={`s9h/w${k}/${i}`} /> : null}
          {iw > 0 && g.joints ? <Ink d={g.joints} width={iw * 0.55} taper={false} vary={0} seed={`s9h/j${k}/${i}`} /> : null}
          {g.fac.map((d, ci) => (d ? <Fill key={ci} d={d} color={cols[ci]} offset={off} mode="snap" seed={`s9h/f${k}/${i}/${ci}`} /> : null))}
          {g.shade ? <Fill d={g.shade} color={tint(palette.sand, k)} offset={false} mode="snap" seed={`s9h/sh${k}/${i}`} /> : null}
          {g.roofs ? <Fill d={g.roofs} color={tint(mix(palette.tan, palette.tealDark, 0.25), k)} offset={false} mode="snap" seed={`s9h/rf${k}/${i}`} /> : null}
          {g.screens ? <Fill d={g.screens} color={palette.cream} offset={false} mode="snap" seed={`s9h/s${k}/${i}`} /> : null}
          {g.bars ? <Fill d={g.bars} color={palette.tealDark} offset={false} mode="snap" seed={`s9h/b${k}/${i}`} /> : null}
          {g.barDots ? <Fill d={g.barDots} color={palette.cream} offset={false} mode="snap" seed={`s9h/bd${k}/${i}`} /> : null}
          {g.doors ? <Fill d={g.doors} color={door} offset={false} mode="snap" seed={`s9h/d${k}/${i}`} /> : null}
          {g.plaques ? <Fill d={g.plaques} color={palette.sand} offset={false} mode="snap" seed={`s9h/p${k}/${i}`} /> : null}
          {g.locks ? <Fill d={g.locks} color={palette.sand} offset={false} mode="snap" seed={`s9h/l${k}/${i}`} /> : null}
          {iw > 0 && g.ink ? <Ink d={g.ink} width={iw} taper={false} vary={0.05} seed={`s9h/i${k}/${i}`} /> : null}
          {dw > 0 && g.detail ? <Ink d={g.detail} width={dw} taper={false} vary={0.05} seed={`s9h/di${k}/${i}`} /> : null}
          {g.sliver ? <Fill d={g.sliver} color={sliver} offset={false} mode="snap" seed={`s9h/sv${k}/${i}`} /> : null}
          {g.coping ? <Fill d={g.coping} color={coping} offset={off} mode="snap" seed={`s9h/cp${k}/${i}`} /> : null}
          {iw > 0 && g.lip ? <Ink d={g.lip} at={DRAW_AT + k * 0.03} order="all" width={iw} taper={false} vary={0.05} seed={`s9h/lp${k}/${i}`} /> : null}
          {iw > 0 && g.rail ? <Ink d={g.rail} at={DRAW_AT + 0.03 + k * 0.03} order="all" width={Math.max(iw * 0.62, 1.1 / zoom)} taper={false} vary={0} seed={`s9h/rl${k}/${i}`} /> : null}
          {g.flight ? <Fill d={g.flight} color={tint(palette.cream, k)} offset={false} mode="snap" seed={`s9h/fl${k}/${i}`} /> : null}
          {g.flightInk && iw > 0 ? <Ink d={g.flightInk} at={DRAW_AT + 0.02 + k * 0.05} order="all" width={Math.max(iw * 0.8, 1.3 / zoom)} taper={false} vary={0} seed={`s9h/fi${k}/${i}`} /> : null}
          {g.shrubs ? <Fill d={g.shrubs} color={k <= 2 ? palette.teal : tint(palette.sage, k)} offset={false} mode="snap" seed={`s9h/sb${k}/${i}`} /> : null}
          {iw > 0 && g.shrubInk ? <Ink d={g.shrubInk} width={iw * 0.8} taper={false} vary={0} seed={`s9h/sbi${k}/${i}`} /> : null}
        </React.Fragment>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- the hill

/** Draw in TerraceHill's 'hill' wrap INSTEAD of the set's node. From the 'to' build on (under the ghost before it). */
export const Hill: React.FC = () => {
  const t = useTime();
  if (t < GHOST.right - 0.001) return null;
  const zoom = camAt(t).zoom;
  const out: React.ReactNode[] = [];
  // the ridge silhouettes + rims, then the haze bands (far -> near)
  const rr = revealOf(t, RIDGE.top, HAZE + 2);
  if (rr > 0) {
    out.push(
      <React.Fragment key="ridge">
        {revealXf(
          rr,
          RIDGE_Y(700),
          <>
            <Fill d={RIDGE.fill} color={TERRACE_HAZE[2]} offset={false} mode="snap" seed="s9h/ridge" />
            {t >= B.server ? <Fill d={RIDGE.rim} color={palette.peach} offset={false} mode="snap" seed="s9h/ridgeRim" /> : null}
          </>,
        )}
      </React.Fragment>,
    );
  }
  for (let i = BANDS.length - 1; i >= 0; i--) {
    const b = BANDS[i];
    const rv = revealOf(t, b.top, HAZE + i);
    if (rv <= 0) continue;
    const ext = extendedAt(t, b.from);
    const sets = ext ? [b.core, b.edge] : [b.core];
    out.push(
      <React.Fragment key={`b${i}`}>
        {revealXf(
          rv,
          b.bottom,
          <>
            {sets.map((c, ci) => (
              <React.Fragment key={ci}>
                {c.fill ? <Fill d={c.fill} color={b.color} offset={false} mode="snap" seed={`s9h/hz${i}/${ci}`} /> : null}
                {c.dots ? <Fill d={c.dots} color={b.dot} offset={false} mode="snap" seed={`s9h/hzd${i}/${ci}`} /> : null}
              </React.Fragment>
            ))}
          </>,
        )}
      </React.Fragment>,
    );
  }
  // rows far -> near (each with its terrace), then the tags
  const reveal = ROWS.slice(0, HAZE).map((R, k) => (k === 0 ? 1 : revealOf(t, R.top - (3 + GAP) * R.s, k)));
  const ext = ROWS.slice(0, HAZE).map((_, k) => extendedAt(t, k));
  for (let k = HAZE - 1; k >= 1; k--) {
    if (reveal[k] <= 0) continue;
    out.push(<React.Fragment key={`r${k}`}>{revealXf(reveal[k], ROWS[k].base, <RowNode k={k} zoom={zoom} extended={ext[k]} />)}</React.Fragment>);
  }
  out.push(<React.Fragment key="r0">{<RowNode k={0} zoom={zoom} extended />}</React.Fragment>);
  out.push(<NearLodRow0 key="n0" />);
  for (let k = HAZE - 1; k >= 0; k--) {
    if (reveal[k] <= 0) continue;
    out.push(<React.Fragment key={`tg${k}`}>{revealXf(reveal[k], ROWS[k].base, <RowTags k={k} zoom={zoom} extended={ext[k]} />)}</React.Fragment>);
  }
  return <>{out}</>;
};

