// BrowserWindow — "a website": window frame, title-bar dots, URL bar, content blocks; can switch OFF
// (content collapses to a line, then a dot, the screen goes dark and a power icon appears).
//
//   <BrowserWindow x={140} y={300} w={520} h={420} at={1} url="gov.example" content="gov" offAt={5.2} />
//   <BrowserWindow ... content="blank">{({w, h}) => <MyContent w={w} h={h} />}</BrowserWindow>  // custom content
//
// x,y = top-left of the window. Custom children are drawn in CONTENT-LOCAL coords (0,0 = content top-left).

import React from 'react';
import {palette, stroke} from '../theme';
import {ease as E, prog, useTime} from '../time';
import {rng, Seed} from '../rng';
import {Ink} from '../Ink';
import {Fill} from '../Fill';
import {Pop} from '../motion';
import {ExitFade} from '../exit';
import {arc, circle, hline, line, poly, rect, rectPath, roundRect, textLines} from '../sketch';
import {captionFontStack} from '../font';
import {At, b} from './common';
import {mat, XG} from '../xf';

export type BrowserContent = 'gov' | 'blog' | 'shop' | 'code' | 'blank';

export type BrowserWindowProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  at?: At;
  seed?: Seed;
  url?: string;
  content?: BrowserContent;
  accent?: string;
  /** Switch-off time. */
  offAt?: number;
  /** Show a power icon on the dark screen. Default true. */
  offIcon?: boolean;
  children?: React.ReactNode | ((area: {w: number; h: number}) => React.ReactNode);
  width?: number;
};

const TB = 46;

function Content({kind, w, h, at, seed, accent, width}: {kind: BrowserContent; w: number; h: number; at: At; seed: string; accent: string; width: number}) {
  const r = rng(`bw/${seed}`);
  const W = width;
  const out: React.ReactNode[] = [];
  const pad = 18;
  if (kind === 'gov') {
    const hh = Math.min(70, h * 0.2);
    out.push(<Fill key="hdr" rect={[0, 0, w, hh]} color={palette.teal} at={b(at, 0.1)} mode="wipe" dir="right" offset={false} seed={`${seed}/h`} />);
    // crest: shield + columns
    const cx = pad + hh * 0.38;
    const cy = hh / 2;
    out.push(<Fill key="crest" d={`M${cx - 15} ${cy - 17}H${cx + 15}V${cy + 2}Q${cx + 15} ${cy + 15} ${cx} ${cy + 20}Q${cx - 15} ${cy + 15} ${cx - 15} ${cy + 2}Z`} color={palette.card} at={b(at, 0.35)} mode="pop" offset={false} seed={`${seed}/c`} />);
    out.push(<Ink key="crestI" d={`M${cx - 8} ${cy - 8}L${cx - 8} ${cy + 8}M${cx} ${cy - 8}L${cx} ${cy + 10}M${cx + 8} ${cy - 8}L${cx + 8} ${cy + 8}M${cx - 11} ${cy - 10}L${cx + 11} ${cy - 10}`} at={b(at, 0.45)} dur={0.2} width={W * 0.7} color={palette.teal} />);
    out.push(<Ink key="title" d={textLines(cx + 30, cy - 7, w * 0.5, {n: 2, gap: 14, heading: false, seed: `${seed}/t`})} at={b(at, 0.4)} dur={0.3} width={W * 1.3} color={palette.card} />);
    const hy = hh + pad;
    const hw = w * 0.52;
    const hH = (h - hy) * 0.42;
    out.push(<Fill key="hero" rect={[pad, hy, hw, hH]} color={palette.peach} at={b(at, 0.5)} mode="wipe" dir="down" offset={false} seed={`${seed}/hero`} />);
    out.push(<Ink key="heroI" d={rect(pad, hy, hw, hH, {over: 3, seed: `${seed}/hi`}) + poly([[pad + hw * 0.1, hy + hH * 0.85], [pad + hw * 0.38, hy + hH * 0.42], [pad + hw * 0.58, hy + hH * 0.7], [pad + hw * 0.72, hy + hH * 0.55], [pad + hw * 0.92, hy + hH * 0.85]], {joined: true, seed: `${seed}/mt`})} at={b(at, 0.45)} dur={0.45} width={W * 0.85} />);
    out.push(<Fill key="heroSun" d={`M${pad + hw * 0.78} ${hy + hH * 0.28}m-11 0a11 11 0 1 0 22 0a11 11 0 1 0 -22 0`} color={palette.sun} at={b(at, 0.8)} mode="pop" offset={false} seed={`${seed}/hs`} />);
    out.push(<Ink key="side" d={textLines(pad * 2 + hw, hy + 6, w - hw - pad * 3, {n: 5, gap: 20, seed: `${seed}/s`})} at={b(at, 0.6)} dur={0.4} width={W * 0.9} />);
    const by = hy + hH + pad * 1.2;
    out.push(<Ink key="body" d={textLines(pad, by, w - pad * 2, {n: Math.max(2, Math.floor((h - by - 50) / 22)), gap: 20, heading: true, seed: `${seed}/b`})} at={b(at, 0.75)} dur={0.5} width={W * 0.9} />);
    out.push(<Fill key="btn" d={roundRect(pad, h - 44, 110, 28, 14)} color={accent} at={b(at, 1.0)} mode="pop" offset={false} seed={`${seed}/btn`} />);
  } else if (kind === 'blog') {
    out.push(<Ink key="t" d={hline(pad, pad + w * 0.45, pad + 6, {over: 0, seed: `${seed}/bt`})} at={b(at, 0.1)} dur={0.25} width={W * 2} />);
    const iy = pad + 26;
    const ih = h * 0.42;
    out.push(<Fill key="img" rect={[pad, iy, w - pad * 2, ih]} color={palette.mintPale} at={b(at, 0.3)} mode="wipe" dir="down" offset={false} seed={`${seed}/img`} />);
    out.push(<Ink key="imgI" d={rect(pad, iy, w - pad * 2, ih, {over: 3, seed: `${seed}/ii`}) + poly([[pad + 20, iy + ih - 10], [pad + w * 0.3, iy + ih * 0.4], [pad + w * 0.5, iy + ih * 0.75], [pad + w * 0.65, iy + ih * 0.5], [w - pad - 20, iy + ih - 10]], {joined: true, seed: `${seed}/m`})} at={b(at, 0.25)} dur={0.5} width={W * 0.85} />);
    out.push(<Fill key="sun" d={`M${w * 0.72} ${iy + ih * 0.3}m-13 0a13 13 0 1 0 26 0a13 13 0 1 0 -26 0`} color={accent} at={b(at, 0.7)} mode="pop" offset={false} seed={`${seed}/s`} />);
    out.push(<Ink key="txt" d={textLines(pad, iy + ih + 28, w - pad * 2, {n: Math.max(2, Math.floor((h - iy - ih - 40) / 22)), gap: 20, heading: false, seed: `${seed}/tx`})} at={b(at, 0.6)} dur={0.5} width={W * 0.9} />);
  } else if (kind === 'shop') {
    const cols = 2;
    const gw = (w - pad * 3) / cols;
    const gh = (h - pad * 3) / 2;
    for (let i = 0; i < 4; i++) {
      const gx = pad + (i % cols) * (gw + pad);
      const gy = pad + Math.floor(i / cols) * (gh + pad);
      const col = r.pick([palette.peach, palette.sage, palette.peach, palette.cream]);
      out.push(<Fill key={`g${i}`} rect={[gx, gy, gw, gh * 0.62]} color={col} at={b(at, 0.2 + i * 0.1)} mode="pop" offset={false} seed={`${seed}/g${i}`} />);
      out.push(<Ink key={`gi${i}`} d={rect(gx, gy, gw, gh * 0.62, {over: 2, seed: `${seed}/gi${i}`}) + hline(gx, gx + gw * 0.7, gy + gh * 0.76, {over: 0, seed: `${seed}/p${i}`}) + hline(gx, gx + gw * 0.35, gy + gh * 0.9, {over: 0, seed: `${seed}/q${i}`})} at={b(at, 0.15 + i * 0.1)} dur={0.35} width={W * 0.85} />);
    }
  } else if (kind === 'code') {
    const n = Math.floor((h - pad) / 26);
    const cols = [palette.teal, palette.peach, palette.ink, palette.sage, palette.brown];
    for (let i = 0; i < n; i++) {
      const ind = i === 0 ? 0 : r.pick([0, 1, 1, 2, 2, 3]) * 26;
      let cx = pad + ind;
      const segs = r.int(1, 3);
      for (let k = 0; k < segs; k++) {
        const lw = r.range(30, 110);
        if (cx + lw > w - pad) break;
        out.push(<Ink key={`c${i}-${k}`} d={`M${cx} ${pad + i * 26 + 8}L${cx + lw} ${pad + i * 26 + 8}`} at={b(at, 0.15 + i * 0.07 + k * 0.03)} dur={0.15} width={W * 2.2} color={i === 0 ? palette.sun : r.pick(cols)} />);
        cx += lw + 12;
      }
    }
  }
  return <>{out}</>;
}

export const BrowserWindow: React.FC<BrowserWindowProps> = ({x, y, w, h, at, seed = 'browser', url, content = 'gov', accent = palette.sun, offAt, offIcon = true, children, width = stroke.ink}) => {
  const t = useTime();
  const cw = w;
  const ch = h - TB;
  // switch-off (old CRT): the content squashes to a line (0.2 s, ease-in), the line shrinks to a dot (0.15 s), the
  // screen pops dark and the power icon pops in. No fades.
  const q1 = offAt !== undefined ? prog(t, offAt, 0.2, E.inCubic) : 0;
  const q2 = offAt !== undefined ? prog(t, offAt + 0.2, 0.15, E.inCubic) : 0;
  const dark = offAt !== undefined && t >= offAt + 0.36;
  const sy = 1 - q1 * 0.985;
  const sx = 1 - q2;
  const ccx = x + cw / 2;
  const ccy = y + TB + ch / 2;
  const area = {w: cw, h: ch};
  const showContent = q2 < 1 && !dark;
  return (
    <>
      <Fill rect={[x, y, w, h]} color={palette.card} at={b(at, 0.12)} mode="snap" seed={`${seed}/bg`} />
      <Fill rect={[x, y, w, TB]} color={palette.sand} at={b(at, 0.16)} mode="wipe" dir="right" offset={false} seed={`${seed}/tb`} />
      {showContent ? (
        <XG m={q1 > 0 ? mat.about(mat.scale(Math.max(0.001, sx), sy), ccx, ccy) : mat.I}>
          <XG m={mat.translate(x, y + TB)}>
            {q1 > 0.5 ? <rect x={0} y={0} width={cw} height={ch} fill={palette.card} /> : null}
            <Content kind={content} w={cw} h={ch} at={b(at, 0.3)} seed={String(seed)} accent={accent} width={width} />
            {typeof children === 'function' ? children(area) : children}
          </XG>
        </XG>
      ) : null}
      {dark ? <Fill rect={[x, y + TB, cw, ch]} color={palette.tealDark} at={offAt! + 0.36} mode="wipe" dir="down" dur={0.1} offset={false} seed={`${seed}/off`} /> : null}
      {q2 > 0 && q2 < 1 ? <circle cx={ccx} cy={ccy} r={6 * (1 - q2) + 2} fill={palette.card} /> : null}
      {offAt !== undefined && offIcon ? (
        <Pop at={offAt + 0.5} x={ccx} y={ccy}>
          <Ink d={arc(ccx, ccy + 2, 26, 26, -55, 235, {seed: `${seed}/pw`})} at={offAt + 0.52} width={stroke.inkBold} color={palette.sand} />
          <Ink d={line(ccx, ccy - 34, ccx, ccy - 6, {over: 0, seed: `${seed}/pw2`})} at={offAt + 0.6} width={stroke.inkBold} color={palette.sand} />
        </Pop>
      ) : null}
      <Ink d={rect(x, y, w, h, {seed: `${seed}/frame`})} at={at} dur={0.5} width={width} />
      <Ink d={hline(x, x + w, y + TB, {seed: `${seed}/tbl`, over: [2, 8]})} at={b(at, 0.3)} dur={0.25} width={width} />
      {[palette.peach, palette.sun, palette.sage].map((c, i) => (
        <Pop key={i} at={b(at, 0.45 + i * 0.07) ?? -10} x={x + 24 + i * 22} y={y + TB / 2}>
          <ExitFade>
            <circle cx={x + 24 + i * 22} cy={y + TB / 2} r={7} fill={c} />
          </ExitFade>
          <Ink d={circle(x + 24 + i * 22, y + TB / 2, 7, {seed: `${seed}/d${i}`})} width={width * 0.6} />
        </Pop>
      ))}
      {url !== undefined ? (
        <>
          <Fill d={roundRect(x + 100, y + 11, w - 126, 24, 12)} color={palette.card} at={b(at, 0.5)} mode="wipe" dir="right" offset={false} seed={`${seed}/url`} />
          <Ink d={roundRect(x + 100, y + 11, w - 126, 24, 12, {closed: false, seed: `${seed}/urli`})} at={b(at, 0.45)} dur={0.3} width={width * 0.6} />
          <UrlText x={x + 116} y={y + 29} text={url} at={b(at, 0.7)} />
        </>
      ) : null}
    </>
  );
};

const UrlText: React.FC<{x: number; y: number; text: string; at: At}> = ({x, y, text, at}) => {
  const t = useTime();
  const n = at === undefined ? text.length : Math.floor(text.length * prog(t, at, Math.min(0.8, text.length * 0.04)));
  if (n <= 0) return null;
  return (
    <ExitFade>
      <text x={x} y={y} fontFamily={captionFontStack} fontSize={20} fill={palette.brown}>
        {text.slice(0, n)}
      </text>
    </ExitFade>
  );
};

