// scripts/render/parallel.mjs: render-media.mjs --parallel=K, the review-cut and lane-clip path (see render-media.mjs's
// header). K muted chunks on the film's scene boundaries, each in its own process and browser, a stream-copy join, and
// the audio once, encoded exactly as renderMedia() encodes it (scripts/render/audio.mjs).
import {spawn, execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {renderFrames} from '@remotion/renderer';
import {root, rel} from './lib.mjs';
import {aacFromPcm, aacPrimingArgs, ffmpeg, ffprobe, premixPcm} from './audio.mjs';

const filmOf = (entryPoint) => path.basename(entryPoint).match(/^entry-(.+)-film\.[jt]sx?$/)?.[1] ?? null;
const sec = (ms) => (ms / 1000).toFixed(1);

/** Candidate cut frames from scripts/film_chunks.py (scene starts + its --max 360 splits), if the comp IS the film. */
function filmCuts({opt, entryPoint, fps, durationInFrames}) {
  if (opt.scenes === 'none') return {cuts: null, why: '--scenes=none'};
  const film = filmOf(entryPoint);
  const file = opt.scenes ? path.resolve(opt.scenes) : film ? path.join(root, 'src', film, 'film', 'scenes.json') : null;
  if (!file || !fs.existsSync(file)) {
    if (opt.scenes) throw new Error(`--scenes: ${opt.scenes} not found`);
    return {cuts: null, why: 'no scenes.json for this entry'};
  }
  const chunks = (extra) =>
    execFileSync('python3', ['-I', path.join(root, 'scripts/film_chunks.py'), file, '--fps', String(fps), ...extra], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']})
      .trim()
      .split('\n')
      .map((l) => l.trim().split(/\s+/))
      .map(([, id, lo, hi]) => ({id, lo: Number(lo), hi: Number(hi)}));
  const scenes = chunks([]);
  const total = scenes[scenes.length - 1].hi + 1;
  if (total !== durationInFrames) return {cuts: null, why: `${rel(file)} spans ${total} frames, the composition ${durationInFrames} (not the film's timeline)`};
  const sceneStarts = new Set(scenes.map((s) => s.lo));
  const cuts = chunks(['--max', '360']).filter((c) => c.lo > 0).map((c) => ({at: c.lo, scene: sceneStarts.has(c.lo)}));
  return {cuts, file};
}

/** K contiguous parts of [a, b]: K-1 of the candidate cuts with the smallest largest part (ties: more scene starts). */
function partition(a, b, K, cuts) {
  const cand = (cuts ?? []).filter((c) => c.at > a && c.at <= b);
  if (cand.length >= K - 1) {
    let best = null;
    const pick = (from, chosen) => {
      if (chosen.length === K - 1) {
        const edges = [a, ...chosen.map((c) => c.at), b + 1];
        const longest = Math.max(...edges.slice(1).map((e, i) => e - edges[i]));
        const scenes = chosen.filter((c) => c.scene).length;
        if (!best || longest < best.longest || (longest === best.longest && scenes > best.scenes)) best = {longest, scenes, edges};
        return;
      }
      for (let i = from; i <= cand.length - (K - 1 - chosen.length); i++) pick(i + 1, [...chosen, cand[i]]);
    };
    pick(0, []);
    return {parts: best.edges.slice(1).map((e, i) => [best.edges[i], e - 1]), how: `film_chunks.py boundaries (${best.scenes}/${K - 1} cuts on scene starts)`};
  }
  const n = b - a + 1;
  return {parts: Array.from({length: K}, (_, i) => [a + Math.floor((n * i) / K), a + Math.floor((n * (i + 1)) / K) - 1]), how: 'equal parts'};
}

/** premix when the cues say so AND Remotion's asset list at the range's ends shows exactly that one file playing. */
async function audioPlan({opt, entryPoint, serveUrl, composition, browser, inputProps, a, b}) {
  if (opt.muted === 'true' || opt.audio === 'none') return {mode: 'none', why: opt.muted === 'true' ? '--muted' : '--audio=none'};
  if (opt.audio === 'render') return {mode: 'render', why: '--audio=render'};
  const film = filmOf(entryPoint);
  const cuesFile = opt.cues === 'none' ? null : opt.cues ? path.resolve(opt.cues) : film ? path.join(root, 'public', film, 'cues.json') : null;
  if (!cuesFile || !fs.existsSync(cuesFile)) return {mode: 'render', why: 'no cues.json'};
  const cues = JSON.parse(fs.readFileSync(cuesFile, 'utf8'));
  if (Array.isArray(cues) || typeof cues.audio !== 'string' || (Array.isArray(cues.sfx) && cues.sfx.length)) {
    return {mode: 'render', why: `${rel(cuesFile)} is not one premixed "audio" with no "sfx"`};
  }
  const {assetsInfo} = await renderFrames({
    composition, serveUrl, inputProps, frames: [...new Set([a, b])], imageFormat: 'none', outputDir: null, concurrency: 1,
    puppeteerInstance: browser, browserExecutable: null, logLevel: 'error', onStart: () => undefined, onFrameUpdate: () => undefined,
  });
  const at = assetsInfo.assets.map((f) => ({frame: f.frame, av: f.audioAndVideoAssets ?? [], inline: f.inlineAudioAssets ?? []}));
  const one = at.every((f) => f.av.length === 1 && f.inline.length === 0 && f.av[0].type === 'audio');
  const first = one ? at.find((f) => f.frame === a).av[0] : null;
  const last = one ? at.find((f) => f.frame === b).av[0] : null;
  const srcPath = first ? decodeURIComponent(new URL(first.src).pathname) : null;
  const ok =
    one &&
    first.id === last.id &&
    srcPath === `/public/${cues.audio}` &&
    [first, last].every((x) => x.volume === 1 && x.playbackRate === 1 && (x.toneFrequency ?? 1) === 1 && !x.audioStreamIndex) &&
    last.mediaFrame - first.mediaFrame === b - a;
  if (!ok) return {mode: 'render', why: `the composition does not play only ${cues.audio} at volume 1 (Remotion's asset list at f${a} and f${b})`};
  return {mode: 'premix', why: `${rel(cuesFile)}: {"audio": "${cues.audio}", "sfx": []}, confirmed at f${a} and f${b}`, src: path.join(serveUrl, 'public', cues.audio), trimLeftFrames: first.mediaFrame, audioStartFrame: first.audioStartFrame, file: cues.audio};
}

/** One child render-media.mjs (a chunk, or the audio pass); resolves with its wall time, rejects with its stderr. */
function child({label, args, onLine}) {
  const t = Date.now();
  const p = spawn(process.execPath, [path.join(root, 'scripts/render-media.mjs'), ...args], {cwd: root, stdio: ['ignore', 'ignore', 'pipe'], env: process.env});
  let err = '';
  let buf = '';
  p.stderr.on('data', (d) => {
    err = (err + d).slice(-20000);
    buf += d;
    const lines = buf.split('\n');
    buf = lines.pop();
    lines.forEach((l) => onLine(l));
  });
  const done = new Promise((resolve, reject) => {
    p.on('close', (c, sig) => (c === 0 ? resolve(Date.now() - t) : reject(new Error(`${label} failed (exit ${c ?? sig}):\n${err.split('\n').slice(-25).join('\n')}`))));
  });
  return {p, done};
}

export async function renderParallel({compId, out, opt, entryPoint, serveUrl, composition, browser, inputProps, scale, concurrency, frameRange, parallel: K, master, masterNote, t0}) {
  const fps = composition.fps;
  const [a, b] = frameRange ?? [0, composition.durationInFrames - 1];
  const n = b - a + 1;
  if (n < 2 * K) throw new Error(`--parallel=${K}: only ${n} frames`);
  const tP = Date.now();
  const {cuts, why: cutsWhy, file: scenesFile} = filmCuts({opt, entryPoint, fps, durationInFrames: composition.durationInFrames});
  const {parts, how} = partition(a, b, K, cuts);
  const plan = await audioPlan({opt, entryPoint, serveUrl, composition, browser, inputProps, a, b});
  const work = opt.work ? path.resolve(opt.work) : fs.mkdtempSync(path.join(os.tmpdir(), 'render-parallel-'));
  fs.mkdirSync(work, {recursive: true});
  console.error(`[render-media] ${compId}: --parallel=${K}: ${parts.map(([lo, hi]) => `f${lo}-${hi}`).join(', ')} (${how}${scenesFile ? `, ${rel(scenesFile)}` : cutsWhy ? `; ${cutsWhy}` : ''}); audio: ${plan.mode} (${plan.why}); concurrency ${concurrency} each`);
  // the workers: the same flags as this call, muted, one frame range each, on this call's bundle
  const same = ['--entry=' + entryPoint, `--serve=${serveUrl}`, `--concurrency=${concurrency}`, ...['master', 'crf', 'scale', 'props', 'timeout', 'codec'].filter((k) => opt[k] !== undefined).map((k) => (opt[k] === 'true' ? `--${k}` : `--${k}=${opt[k]}`))];
  const kids = [];
  const tR = Date.now();
  const chunkFiles = parts.map((_, i) => path.join(work, `chunk_${String(i).padStart(2, '0')}.mp4`));
  parts.forEach(([lo, hi], i) => {
    kids.push({
      label: `chunk ${i + 1}/${K} (f${lo}-${hi})`,
      ...child({
        label: `chunk ${i + 1}/${K} (f${lo}-${hi})`,
        args: [compId, chunkFiles[i], `--frames=${lo}-${hi}`, '--muted', ...same],
        onLine: (l) => { if (/\d+\/\d+ frames/.test(l)) console.error(`[render-media]   chunk ${i + 1}/${K}: ${l.replace(/^\[render-media\]\s*/, '')}`); },
      }),
    });
  });
  const wav = path.join(work, 'audio.wav');
  if (plan.mode === 'render') {
    // ONE audio-only pass over the whole range (seeks every frame, no screenshots), beside the chunks
    kids.push({label: 'audio pass', ...child({label: 'audio pass', args: [compId, wav, `--frames=${a}-${b}`, '--codec=wav', ...same.filter((x) => !/^--(master|crf|codec)/.test(x))], onLine: () => undefined})});
  }
  const times = [];
  try {
    for (const k of kids) times.push(await k.done);
  } catch (e) {
    kids.forEach((k) => k.p.exitCode === null && k.p.kill('SIGTERM'));
    if (!opt.work) fs.rmSync(work, {recursive: true, force: true});
    throw e;
  }
  const tA = Date.now();
  // the audio, encoded as renderMedia encodes it
  const aac = path.join(work, 'audio.aac');
  if (plan.mode === 'premix') {
    await premixPcm({src: plan.src, frames: n, fps, trimLeftFrames: plan.trimLeftFrames, audioStartFrame: plan.audioStartFrame, workDir: work, out: wav});
  }
  if (plan.mode !== 'none') await aacFromPcm({pcm: wav, out: aac});
  const tJ = Date.now();
  // the join: concat demuxer, stream copy, each chunk's exact duration; then the audio, shifted by the AAC priming
  const list = path.join(work, 'chunks.txt');
  fs.writeFileSync(list, parts.map(([lo, hi], i) => `file '${chunkFiles[i]}'\nduration ${(hi - lo + 1) / fps}\n`).join(''));
  const tmpOut = path.join(path.dirname(out), `.${path.basename(out)}.${process.pid}.part.mp4`);
  const color = master ? ['-colorspace:v', 'bt709', '-color_primaries:v', 'bt709', '-color_trc:v', 'bt709', '-color_range', 'tv'] : [];
  await ffmpeg([
    '-hide_banner', '-f', 'concat', '-safe', '0', '-i', list,
    ...(plan.mode !== 'none' ? [...aacPrimingArgs(), '-i', aac] : []),
    '-map', '0:v:0', ...(plan.mode !== 'none' ? ['-map', '1:a:0', '-c:a', 'copy'] : []),
    '-c:v', 'copy', ...color, '-video_track_timescale', '90000', '-map_metadata', '-1', '-metadata', `comment=Made with Remotion ${JSON.parse(fs.readFileSync(path.join(root, 'node_modules/remotion/package.json'), 'utf8')).version}`,
    '-f', 'mp4', '-movflags', 'faststart', '-y', tmpOut,
  ]);
  // check: every frame once, 1/fps apart
  const pk = (await ffprobe(['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'packet=pts,flags', '-of', 'csv=p=0', tmpOut])).stdout.trim().split('\n').map((l) => l.split(','));
  const pts = pk.map(([p]) => Number(p)).sort((x, y) => x - y);
  const step = 90000 / fps;
  const bad = pts.length !== n || pts.some((p, i) => Math.abs(p - pts[0] - i * step) > 0.5);
  if (bad) {
    fs.rmSync(tmpOut, {force: true});
    throw new Error(`the joined file has ${pts.length} frames (want ${n}) or uneven timestamps; chunks kept in ${work}`);
  }
  fs.renameSync(tmpOut, out);
  const tE = Date.now();
  if (!opt.work) fs.rmSync(work, {recursive: true, force: true});
  console.error(`[render-media]   chunks ${parts.map((p, i) => `${p[1] - p[0] + 1} f ${sec(times[i])} s`).join(', ')}${plan.mode === 'render' ? `; audio pass ${sec(times[parts.length])} s` : ''}`);
  console.error(`[render-media] ${compId} (${rel(entryPoint)}): PARALLEL ${K} chunks, ${n} frames in ${sec(tE - tP)} s (render ${sec(tA - tR)} s, audio ${sec(tJ - tA)} s, join + check ${sec(tE - tJ)} s; bundle ${sec(tP - t0)} s; scale ${scale}, concurrency ${concurrency} x ${K}, GL ${process.env.GL ?? 'default'}${masterNote}; audio ${plan.mode === 'premix' ? `premixed ${plan.file}` : plan.mode === 'render' ? 'one audio pass' : 'none'}; ${n} frames, pts n/${fps} checked) -> ${out}`);
}
