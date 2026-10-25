// ---------------------------------------------------------------- row 0 near LOD (+ the 'to' build's plaque blinks)

/** Row 0's houses (not #4) with real detail: a browser window with chrome, a glazed door, the elephant plaque, the OLD
 *  lock. The houses right of #4 are revealed on GHOST.right, the left ones on GHOST.left: each plaque blinks (one +35 %
 *  frame, then a 2-frame settle) as its house appears. */
export const NearLodRow0: React.FC = () => {
  const t = useTime();
  const c = camAt(t);
  const zoom = c.zoom;
  const R = ROWS[0];
  const x0 = c.x - 540 / zoom - R.w;
  const x1 = c.x + 540 / zoom + R.w;
  const W = Math.max(0.85, 1.9 / zoom);
  const WS = Math.max(0.85, 3.4 / zoom);
  const out: React.ReactNode[] = [];
  for (const h of CELLS[0]) {
    if (h.j === 0 || h.x + R.w < x0 || h.x > x1) continue;
    const col = COLORS[h.ci];
    const top = R.top;
    const sd = `s9n0/${h.j}`;
    const shown = h.j > 0 ? GHOST.right : GHOST.left;
    const blinkK = t < shown + 0.034 ? 1.35 : t < shown + 0.1 ? 1.1 : 1;
    const px = h.x + 18;
    const py = top + 110;
    out.push(
      <React.Fragment key={h.j}>
        <Fill rect={[h.x, top, R.w + 0.3, R.h]} color={col} offset={[misreg.dx / zoom, misreg.dy / zoom]} mode="snap" seed={`${sd}/f`} />
        {col !== palette.tan ? <Fill rect={[h.x, top, R.w * 0.18, R.h]} color={palette.sand} offset={false} mode="snap" seed={`${sd}/s`} /> : null}
        <Ink d={line(h.x, R.base, h.x, top, {seed: `${sd}/w`, over: [0, 3]}) + line(h.x + 3, top + 8, h.x + R.w - 3, top + 8, {seed: `${sd}/c`, over: [1, 3]})} width={WS} taper={false} vary={0} seed={`${sd}/wi`} />
        <ChromeSlot x={h.x + 17.5} y={top + 30} w={55} h={35} width={W} seed={`${sd}/bw`} />
        <FacadeDoor r={[h.x + 32.5, top + 97.5, 30, 50]} width={W} seed={`${sd}/d`} />
        <XG m={mat.about(mat.scale(blinkK), px, py)}>
          <PlaqueSlot x={px} y={py} size={8} width={Math.max(0.4, 1 / zoom)} seed={`${sd}/p`} />
        </XG>
        <Lock x={h.x + 57.5} y={top + 122.5} size={10.5} ink={Math.max(0.6, 1.2 / zoom)} seed={`${sd}/l`} />
      </React.Fragment>,
    );
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- the fixed door's light at the doorstep

/** The set's cream path (TerraceHill FIXED_PATH) covered with the street (in the street's own relit tone: draw it inside
 *  the same Tod map), the kerb strip and lines re-drawn with the set's seeds on top, then a stepped peach pool on the kerb
 *  under door #4. Draw in TerraceHill's 'street' wrap, after the street, from `fixedAt`. */
export const FixedPool: React.FC = () => {
  const t = useTime();
  if (t < B.single) return null;
  const zoom = camAt(t).zoom;
  const base = ROWS[0].base;
  return (
    <>
      <Fill d={`M512 ${base}L548 ${base}L618 2090L442 2090Z`} color={palette.mintPale} offset={false} mode="snap" seed="s9pool/cover" />
      <Fill rect={[430, base, 200, 10]} color={palette.sand} offset={false} mode="snap" seed="s9pool/kerb" />
      <Ink d={line(-700, base + 10, 1780, base + 10, {seed: `${SEED}/k1`, over: 0}) + line(-40, base + 34, 1120, base + 35, {seed: `${SEED}/k2`, over: 0})} width={Math.max(0.85, 3.4 / zoom)} taper={false} vary={0} seed={`${SEED}/kerb`} />
      <Fill d="M494 1506a36 7 0 1 0 72 0a36 7 0 1 0 -72 0Z" color={palette.peach} offset={false} mode="snap" seed="s9pool/p" />
      <Fill d="M514 1505.5a16 3.2 0 1 0 32 0a16 3.2 0 1 0 -32 0Z" color={palette.cream} offset={false} mode="snap" seed="s9pool/c" />
    </>
  );
};
