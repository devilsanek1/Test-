// ---------------------------------------------------------------- the check-box tags (the empty wave + door #4's tick)

const TAG_STEP = 0.075;
const TAG_K = [1.58, 1.5, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4];
const tagSize = (k: number, zoom: number) => Math.max(TAG_K[k] * 19 * ROWS[k].s, (TERRACE.checkBox.minScreen[k] ?? 0) / zoom, 4);
const rot = (hx: number, hy: number, a: number) => {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  return (dx: number, dy: number) => `${f2(hx + dx * c - dy * sn)} ${f2(hy + dx * sn + dy * c)}`;
};
const tagQuad = (hx: number, hy: number, s: number, a = 0) => {
  const P = rot(hx, hy, a);
  return `M${P(-s * 0.46, s * 0.22)}L${P(s * 0.5, s * 0.12)}L${P(s * 0.47, s * 0.98)}L${P(-s * 0.5, s * 1.02)}Z`;
};
const tagBox = (hx: number, hy: number, s: number, a = 0) => {
  const P = rot(hx, hy, a);
  const b = s * 0.25;
  const by = s * 0.58;
  return `M${P(-b, by - b)}L${P(b, by - b)}L${P(b, by + b)}L${P(-b, by + b)}Z`;
};
const tagLoop = (hx: number, hy: number, s: number, a = 0) => {
  const P = rot(hx, hy, a);
  return `M${P(-s * 0.2, s * 0.18)}L${P(0, -s * 0.06)}L${P(s * 0.2, s * 0.14)}`;
};
const swingOf = (k: number, j: number) => (rand('s9tag', `${k}/${j}`) - 0.5) * 0.24;

const RowTags: React.FC<{k: number; zoom: number; extended: boolean}> = ({k, zoom, extended}) => {
  const t = useTime();
  const at = B.tags + k * TAG_STEP;
  if (t < at) return null;
  const pop = springAt(t, at, springs.pop);
  if (pop <= 0.02) return null;
  const s = tagSize(k, zoom) * pop;
  const inked = k <= 3;
  const R = ROWS[k];
  let body = '';
  let box = '';
  let loop = '';
  for (const c of CELLS[k]) {
    if (c.stair || (k === 0 && c.j === 0)) continue;
    if (!extended && !c.core) continue;
    if (c.cx < -60 || c.cx > 1140) continue;
    const hx = c.x + TERRACE.checkBox.hang[0] * R.s;
    const hy = R.top + c.d + TERRACE.checkBox.hang[1] * R.s;
    const a = swingOf(k, c.j);
    body += tagQuad(hx, hy, s, a);
    box += tagBox(hx, hy, s, a);
    if (inked) loop += tagLoop(hx, hy, s, a);
  }
  const sc = (px: number) => px / zoom;
  return (
    <>
      <Fill d={body} color={palette.white} offset={false} mode="snap" seed={`s9tg${k}/b`} />
      {inked ? null : <Fill d={box} color={tint(palette.sand, k)} offset={false} mode="snap" seed={`s9tg${k}/x`} />}
      {inked ? (
        <>
          <Ink d={loop} width={sc(1.6)} color={palette.tealDark} taper={false} vary={0} seed={`s9tg${k}/lp`} />
          <Ink d={body} width={sc(k <= 1 ? 1.8 : 1.4)} taper={false} vary={0} seed={`s9tg${k}/o`} />
          <Ink d={box} width={sc(k === 0 ? 2.6 : k === 1 ? 2.2 : 1.6)} taper={false} vary={0} seed={`s9tg${k}/xi`} />
        </>
      ) : null}
    </>
  );
};

/** Door #4's tag: the same white tag + empty box, popping on 'single' - 0.06, and the ONE tick (ink, drawn on, over-
 *  shooting the box) that completes ON 'single'; the empty wave follows from single + 0.10. */
export const House4Tag: React.FC = () => {
  const t = useTime();
  const at = B.single - 0.06;
  if (t < at) return null;
  const zoom = camAt(t).zoom;
  const pop = springAt(t, at, springs.pop);
  const s = tagSize(0, zoom) * pop;
  const H = TERRACE.house4.facade;
  const [hx, hy] = [H[0] + TERRACE.checkBox.hang[0], H[1] + TERRACE.checkBox.hang[1]];
  const b = s * 0.25;
  const by = hy + s * 0.58;
  const tick = `M${f2(hx - b * 0.85)} ${f2(by - b * 0.05)}L${f2(hx - b * 0.2)} ${f2(by + b * 0.7)}L${f2(hx + b * 1.25)} ${f2(by - b * 1.25)}`;
  return (
    <>
      <Fill d={tagQuad(hx, hy, s)} color={palette.white} offset={false} mode="snap" seed="s9h4tag/b" />
      <Ink d={tagLoop(hx, hy, s)} width={1.6 / zoom} color={palette.tealDark} taper={false} vary={0} seed="s9h4tag/lp" />
      <Ink d={tagQuad(hx, hy, s)} width={1.8 / zoom} taper={false} vary={0} seed="s9h4tag/o" />
      <Ink d={tagBox(hx, hy, s)} width={2.6 / zoom} taper={false} vary={0} seed="s9h4tag/xi" />
      <Ink d={tick} at={B.single - 0.12} dur={0.12} width={3 / zoom} taper={false} seed="s9h4tag/tick" />
    </>
  );
};

