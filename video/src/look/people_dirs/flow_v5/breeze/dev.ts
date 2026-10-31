// FLOW v5, BREEZE: the fast look loop (not part of the film): writes a page of figures as HTML for a headless browser
// screenshot. Bundle and run (from video/):
//   node_modules/.bin/esbuild src/look/people_dirs/flow_v5/breeze/dev.ts --bundle --platform=node --format=esm \
//     --outfile=/tmp/claude-0/breeze/dev.mjs && node /tmp/claude-0/breeze/dev.mjs <page> <out.html>
import fs from 'node:fs';
import {place} from './render';
import {breeze, type Pose} from './figure';
import {HER, CAST, STATURE} from './cast';
import type {Air} from './air';
import type {View} from './head';
import {lc} from './paint';
import {sheetHer, sheetCast, sheetMotion, sheetScene, clipFrame} from './sheets';

const [page = 'her', outPath = '/tmp/claude-0/breeze/dev.html', arg = '0'] = process.argv.slice(2);
const T = Number(arg);

const air: Air = {dir: 1, base: 0.5};
let uid = 0;
const U = () => `d${uid++}`;

function sky(w: number, h: number, id: string): string {
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lc(64, 24, 340)}"/><stop offset="0.55" stop-color="${lc(76, 22, 25)}"/><stop offset="1" stop-color="${lc(85, 16, 55)}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`;
}

function herPage(): string {
  const W = 2000;
  const H = 1500;
  const views: [View, Pose][] = [
    ['q', {kind: 'stand'}],
    ['p', {kind: 'walk', phase: 0.12}],
    ['b', {kind: 'stand'}],
  ];
  let s = sky(W, H, 'sk');
  views.forEach(([v, pose], i) => {
    const x = 330 + i * 620;
    s += place(breeze(HER, {view: v, pose, t: T, air, px: 640}), U(), x, 760, 640);
  });
  // film size
  views.forEach(([v, pose], i) => {
    const x = 200 + i * 120;
    s += place(breeze(HER, {view: v, pose, t: T, air, px: 180}), U(), x, 1040, 180);
  });
  views.forEach(([v, pose], i) => {
    const x = 640 + i * 110;
    s += place(breeze(HER, {view: v, pose, t: T, air, px: 150}), U(), x, 1040, 150);
  });
  // black at film size
  s += `<rect x="0" y="1080" width="${W}" height="420" fill="#EDE6E0"/>`;
  views.forEach(([v, pose], i) => {
    const x = 200 + i * 120;
    s += place(breeze(HER, {view: v, pose, t: T, air, px: 180}), U(), x, 1300, 180, {mono: '#111'});
  });
  views.forEach(([v, pose], i) => {
    const x = 640 + i * 110;
    s += place(breeze(HER, {view: v, pose, t: T, air, px: 150}), U(), x, 1300, 150, {mono: '#111'});
  });
  return wrap(W, H, s);
}

function wrap(W: number, H: number, inner: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#2B2C41}</style></head><body><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg></body></html>`;
}

function cmpPage(): string {
  const W = 1500;
  const H = 470;
  const views: [View, Pose][] = [
    ['q', {kind: 'stand'}],
    ['p', {kind: 'walk', phase: 0.12}],
    ['b', {kind: 'stand'}],
  ];
  let s = sky(W, H, 'sk');
  views.forEach(([v, pose], i) => {
    s += place(breeze(HER, {view: v, pose, t: T, air, px: 420}), U(), 160 + i * 480, 445, 420);
  });
  return wrap(W, H, s);
}

function motionPage(): string {
  const W = 2400;
  const H = 1000;
  let s = sky(W, H, 'sk');
  const walkAir: Air = {dir: 1, base: 0.5, head: 0.16};
  for (let i = 0; i < 8; i++) {
    const t = 3 + (i / 8) * 1.1;
    s += place(breeze(HER, {view: 'p', pose: {kind: 'walk', phase: t / 1.1}, t, air: walkAir, px: 400}), U(), 140 + i * 290, 460, 400);
  }
  const gustAir: Air = {dir: 1, base: 0.5, gusts: [{t: 0.5, dur: 2.4, amp: 0.5}]};
  const ts = [0.2, 0.55, 0.85, 1.15, 1.5, 1.9, 2.35, 2.9];
  ts.forEach((t, i) => {
    s += place(breeze(HER, {view: 'b', pose: {kind: 'stand'}, t, air: gustAir, px: 400}), U(), 140 + i * 290, 960, 400);
  });
  return wrap(W, H, s);
}

function castPage(): string {
  const W = 2400;
  const H = 1200;
  let s = sky(W, H, 'sk');
  CAST.forEach((L, i) => {
    const h = 620 * (STATURE[L.id] / 186);
    s += place(breeze(L, {view: L.view ?? 'q', pose: L.pose ?? {kind: 'stand'}, t: T, air, px: h}), U(), 200 + i * 390, 700, h);
  });
  CAST.forEach((L, i) => {
    const h = 200 * (STATURE[L.id] / 186);
    s += place(breeze(L, {view: L.view ?? 'q', pose: L.pose ?? {kind: 'stand'}, t: T, air, px: h}), U(), 300 + i * 120, 1000, h);
  });
  CAST.forEach((L, i) => {
    const h = 200 * (STATURE[L.id] / 186);
    s += place(breeze(L, {view: L.view ?? 'q', pose: L.pose ?? {kind: 'stand'}, t: T, air, px: h}), U(), 1300 + i * 120, 1000, h, {mono: '#111'});
  });
  return wrap(W, H, s);
}

const page2 = (svgs: string) => `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#2B2C41}</style></head><body>${svgs}</body></html>`;
const pages: Record<string, () => string> = {
  her: herPage,
  cmp: cmpPage,
  motion: motionPage,
  cast: castPage,
  s1: () => page2(sheetHer()),
  s2: () => page2(sheetCast()),
  s3: () => page2(sheetMotion()),
  s4: () => page2(sheetScene()),
  clip: () => page2(clipFrame(T)),
};
fs.writeFileSync(outPath, (pages[page] ?? herPage)());
console.log(outPath);
