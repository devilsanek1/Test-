// scripts/render/lib.mjs: the plumbing render-frames.mjs and render-media.mjs share (streamlining Phase 1, 2026-10-29;
// docs/retro/2026-10-28_streamline/phase1_render.md). Nothing here changes a pixel: a cached bundle is the same bundle,
// and the one browser is launched exactly as renderFrames() / renderMedia() launch their own.
//   parseOpts(args)          --k=v and --k (= 'true') flags, the last one wins (as the scripts always parsed them)
//   resolveEntry(comp, opt)  --entry=<path> | full (src/index.ts) | auto (the default): the ONE src/entry-*.ts(x) that
//                            registers the composition (a literal id="X", else a template id={`X-${...}`}); none or
//                            several: exit 2 and name the candidates. (v1's dev registry / entry-film fallback is gone.)
//   getBundle({entryPoint})  the webpack bundle, CACHED in $TMPDIR/render-bundles/<key> by a hash of src/ (contents),
//                            public/ and assets/ (names, sizes, mtimes: the bundle copies public/ and lists those),
//                            the entry, package-lock.json, tsconfig.json and the bundler version; any change = a fresh
//                            bundle. The 3 most recent bundles are kept (one in use is never deleted). --no-cache (or
//                            RENDER_BUNDLE_CACHE=0) bundles fresh and deletes it after, as before.
//   openRenderBrowser(...)   ONE Chrome for selectComposition and the render (renderFrames / renderMedia launch theirs
//                            with --force-device-scale-factor = the render scale: so does this).
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser} from '@remotion/renderer';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const BROWSER_EXECUTABLE = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
/** GL: Chrome's default (no flag) unless GL=swangle|angle|egl|swiftshader|... (as before). */
export const chromiumOptionsFromEnv = () => (process.env.GL && process.env.GL !== 'default' ? {gl: process.env.GL} : {});

export function parseOpts(args) {
  return Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => {
    const k = a.slice(2);
    const i = k.indexOf('=');
    return i < 0 ? [k, 'true'] : [k.slice(0, i), k.slice(i + 1)];
  }));
}

export const rel = (p) => (path.isAbsolute(p) && p.startsWith(root + path.sep) ? path.relative(root, p) : p);

// ---- the entry ------------------------------------------------------------------------------------------------
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1');

/** Entries under src/ that register `compId`: [{file, exact}] (exact = a literal id, else a template-id prefix). */
export function entriesFor(compId) {
  const dir = path.join(root, 'src');
  const out = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/^entry-.+\.(tsx?|jsx?|mjs)$/.test(f)) continue;
    const text = stripComments(fs.readFileSync(path.join(dir, f), 'utf8'));
    let exact = false;
    let prefix = false;
    for (const m of text.matchAll(/\bid\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\s*(?:"([^"]+)"|'([^']+)')\s*\})/g)) {
      if ((m[1] ?? m[2] ?? m[3] ?? m[4]) === compId) exact = true;
    }
    for (const m of text.matchAll(/\bid\s*=\s*\{\s*`([^`$]+)\$\{/g)) {
      if (compId.startsWith(m[1]) && compId.length > m[1].length) prefix = true;
    }
    if (exact || prefix) out.push({file: path.join(dir, f), exact});
  }
  return out;
}

/** --entry=<path> | full | auto (default). Exits 2 when auto finds none or several. */
export function resolveEntry(compId, entryOpt, tag) {
  const e = entryOpt ?? 'auto';
  if (e === 'full') {
    const p = path.join(root, 'src/index.ts');
    if (!fs.existsSync(p)) {
      console.error(`[${tag}] --entry=full: src/index.ts is gone (v1 is archived); pass --entry=src/entry-<film>.tsx`);
      process.exit(2);
    }
    return p;
  }
  if (e !== 'auto') return path.resolve(e);
  const all = entriesFor(compId);
  const exact = all.filter((c) => c.exact);
  const pick = exact.length ? exact : all;
  if (pick.length === 1) {
    console.error(`[${tag}] --entry=auto -> ${rel(pick[0].file)}`);
    return pick[0].file;
  }
  console.error(`[${tag}] --entry=auto: ${pick.length ? `several entries register "${compId}" (${pick.map((c) => rel(c.file)).join(', ')})` : `no src/entry-*.tsx registers "${compId}"`}; pass --entry=src/entry-<film>.tsx`);
  process.exit(2);
}

// ---- the bundle cache -----------------------------------------------------------------------------------------
const CACHE_LAYOUT = 1;
const KEEP = 3;
const cacheRoot = () => path.join(os.tmpdir(), 'render-bundles');

function hashTree(h, dir, mode) {
  if (!fs.existsSync(dir)) {
    h.update(`missing ${dir}\n`);
    return;
  }
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, {withFileTypes: true}).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const p = path.join(d, ent.name);
      const r = path.relative(root, p);
      if (ent.isDirectory()) walk(p);
      else if (ent.isSymbolicLink()) h.update(`L ${r} ${fs.readlinkSync(p)}\n`);
      else if (ent.isFile()) {
        if (mode === 'content') h.update(`F ${r} ${crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex')}\n`);
        else {
          const st = fs.statSync(p, {bigint: true});
          h.update(`F ${r} ${st.size} ${st.mtimeNs}\n`);
        }
      }
    }
  };
  walk(dir);
}

const fileHash = (p) => (fs.existsSync(p) ? crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex') : 'none');

/** The cache key, or null when the entry lives outside src/ (its imports could be anywhere: no cache). */
export function bundleKey(entryPoint) {
  const src = path.join(root, 'src');
  if (!entryPoint.startsWith(src + path.sep)) return null;
  const h = crypto.createHash('sha256');
  h.update(`layout ${CACHE_LAYOUT}\nentry ${path.relative(root, entryPoint)}\n`);
  h.update(`bundler ${JSON.parse(fs.readFileSync(path.join(root, 'node_modules/@remotion/bundler/package.json'), 'utf8')).version}\n`);
  h.update(`lock ${fileHash(path.join(root, 'package-lock.json'))}\ntsconfig ${fileHash(path.join(root, 'tsconfig.json'))}\n`);
  hashTree(h, src, 'content');
  hashTree(h, path.join(root, 'public'), 'stat');
  hashTree(h, path.join(root, 'assets'), 'stat');
  return h.digest('hex').slice(0, 24);
}

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
};
const usersDir = (dir) => path.join(dir, '.render-cache', 'users');
const touchUse = (dir) => {
  fs.mkdirSync(usersDir(dir), {recursive: true});
  fs.writeFileSync(path.join(usersDir(dir), String(process.pid)), '');
  const lu = path.join(dir, '.render-cache', 'last-used');
  fs.writeFileSync(lu, String(Date.now()));
};
const inUse = (dir) => {
  const u = usersDir(dir);
  if (!fs.existsSync(u)) return false;
  return fs.readdirSync(u).some((p) => Number(p) !== process.pid && alive(Number(p)));
};
const lastUsed = (dir) => {
  try {
    return fs.statSync(path.join(dir, '.render-cache', 'last-used')).mtimeMs;
  } catch {
    return 0;
  }
};

function evict(keepDir) {
  const cr = cacheRoot();
  let names;
  try {
    names = fs.readdirSync(cr);
  } catch {
    return;
  }
  const now = Date.now();
  // half-built bundles of dead processes
  for (const n of names.filter((x) => x.startsWith('.build-'))) {
    const pid = Number(n.split('-')[1]);
    const p = path.join(cr, n);
    try {
      if (!alive(pid) && now - fs.statSync(p).mtimeMs > 10 * 60e3) fs.rmSync(p, {recursive: true, force: true});
    } catch {
      // gone already
    }
  }
  const dirs = names.filter((x) => /^[0-9a-f]{24}$/.test(x)).map((x) => path.join(cr, x)).sort((a, b) => lastUsed(b) - lastUsed(a));
  dirs.slice(KEEP).forEach((d) => {
    if (d === keepDir || inUse(d) || now - lastUsed(d) < 10 * 60e3) return;
    fs.rmSync(d, {recursive: true, force: true});
  });
}

const doBundle = (entryPoint, outDir) =>
  bundle({entryPoint, rootDir: root, publicDir: path.join(root, 'public'), enableCaching: true, onProgress: () => undefined, ...(outDir ? {outDir} : {})});

/**
 * The bundle for `entryPoint`: {serveUrl, cached, seconds, release()}. `serve` = a bundle directory to reuse as is
 * (the --parallel workers); `noCache` = bundle fresh and delete it on release (the old behaviour).
 */
export async function getBundle({entryPoint, serve = null, noCache = false}) {
  const t0 = Date.now();
  if (serve) return {serveUrl: path.resolve(serve), cached: true, seconds: 0, key: null, release: () => undefined};
  const key = noCache || process.env.RENDER_BUNDLE_CACHE === '0' ? null : bundleKey(entryPoint);
  if (!key) {
    const serveUrl = await doBundle(entryPoint, null);
    return {serveUrl, cached: false, seconds: (Date.now() - t0) / 1000, key: null, release: () => fs.rmSync(serveUrl, {recursive: true, force: true})};
  }
  const cr = cacheRoot();
  const dir = path.join(cr, key);
  fs.mkdirSync(cr, {recursive: true});
  let cached = fs.existsSync(path.join(dir, 'index.html')) && fs.existsSync(path.join(dir, '.render-cache'));
  if (cached) {
    touchUse(dir);
  } else {
    const build = path.join(cr, `.build-${process.pid}-${crypto.randomBytes(4).toString('hex')}`);
    try {
      await doBundle(entryPoint, build);
      fs.mkdirSync(path.join(build, '.render-cache'), {recursive: true});
      fs.writeFileSync(path.join(build, '.render-cache', 'entry'), `${path.relative(root, entryPoint)}\n`);
      touchUse(build);
      try {
        fs.renameSync(build, dir);
      } catch {
        // another process cached the same key first: use theirs (the same bundle)
        fs.rmSync(build, {recursive: true, force: true});
        touchUse(dir);
        cached = true;
      }
    } catch (e) {
      fs.rmSync(build, {recursive: true, force: true});
      throw e;
    }
  }
  const marker = path.join(usersDir(dir), String(process.pid));
  const release = () => fs.rmSync(marker, {force: true});
  process.once('exit', release);
  try {
    evict(dir);
  } catch {
    // eviction is best effort
  }
  return {serveUrl: dir, cached, seconds: (Date.now() - t0) / 1000, key, release};
}

// ---- the browser ----------------------------------------------------------------------------------------------
/** One Chrome for selectComposition and every render of this call, launched as renderFrames()/renderMedia() would. */
export const openRenderBrowser = ({scale, chromiumOptions}) =>
  openBrowser('chrome', {browserExecutable: BROWSER_EXECUTABLE, chromiumOptions, forceDeviceScaleFactor: scale, logLevel: 'error'});
