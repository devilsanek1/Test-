// render.mjs — the type iteration's still renderer: HTML (or a JSON spec) -> a 1080 x 1920 PNG, with optional
// phone-size preview and a platform-UI overlay. Every font in .fonts/index.json (fetch_fonts.py) is declared for you:
// use the family names from `python3 scripts/type/fetch_fonts.py --list` in your CSS.
//
//   node scripts/type/render.mjs page.html out.png [--phone] [--ui] [--zones]
//   node scripts/type/render.mjs spec.json [--phone] [--ui] [--zones]       // many stills at once (format below)
//
//   --phone  also writes <out>_phone.jpg, 360 px wide (how the frame reads on a phone held at arm's length)
//   --ui     also writes <out>_ui.jpg: the frame with a generic short-form app UI drawn over it (top tabs, the right
//            action rail, the bottom caption and nav) at our documented zones (LAYOUT.md: top y < 180, bottom
//            y > 1520, right rail x > 950 at y 900-1500), phone-sized
//   --zones  the UI preview also tints the unsafe zones red
//
// An HTML page is laid out on a 1080 x 1920 stage at 1x (body margin 0). Relative URLs resolve from the page's folder;
// `{{BG_DUSK}}`, `{{BG_NIGHT}}` and `{{REPO}}` in the page are replaced with file:// URLs.
//
// JSON spec: {"stills": [{"out": "docs/look/type/stills/01_x.png", "bg": "bg_dusk" | "bg_night" | "<path>" | "#hex",
//   "css": "<extra css>", "layers": [ {"text": "...", "font": "Caveat", "weight": 400, "size": 120, "x": 540, "y": 460,
//   "anchor": "start|middle|end" (x is where the text starts / centres / ends), (y is the BASELINE), "tracking": 0.05
//   (em), "color": "#fff", "rotate": 0 (deg), "opacity": 1, "shadow": "<css text-shadow>", "style": "<extra css>"},
//   {"html": "<div style=...>...</div>"} (raw HTML on the stage: position it yourself) ]}], "phone": true, "ui": true}
// Paths in a spec are relative to the repo's video/ folder.
import fs from 'fs';
import path from 'path';
import {fileURLToPath, pathToFileURL} from 'url';
import {createRequire} from 'module';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(require.resolve('playwright', {paths: ['/usr/lib/node_modules', '/usr/local/lib/node_modules', process.cwd()]})); }

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VIDEO = path.resolve(HERE, '..', '..');
const FONTS = path.join(HERE, '.fonts');
const BG = {bg_dusk: path.join(HERE, 'bg', 'bg_dusk.png'), bg_night: path.join(HERE, 'bg', 'bg_night.png')};
const W = 1080, H = 1920;

function fontFaceCss() {
  const idxPath = path.join(FONTS, 'index.json');
  if (!fs.existsSync(idxPath)) return '';
  const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
  let css = '';
  for (const [family, v] of Object.entries(idx)) {
    for (const f of v.faces) {
      const url = pathToFileURL(path.join(FONTS, f.file)).href;
      css += `@font-face{font-family:'${family}';src:url('${url}') format('woff2');font-weight:${f.weight};font-style:${f.style};font-display:block}\n`;
    }
  }
  return css;
}

const UI_SVG = (zones) => `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;left:0;top:0;pointer-events:none" xmlns="http://www.w3.org/2000/svg">
  ${zones ? `<g fill="rgba(255,40,40,0.22)"><rect x="0" y="0" width="${W}" height="180"/><rect x="0" y="1520" width="${W}" height="${H - 1520}"/><rect x="950" y="900" width="${W - 950}" height="600"/></g>` : ''}
  <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></linearGradient>
  <linearGradient id="fadeTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
  <rect x="0" y="0" width="${W}" height="230" fill="url(#fadeTop)"/>
  <rect x="0" y="1380" width="${W}" height="${H - 1380}" fill="url(#fade)"/>
  <g fill="#fff" font-family="Helvetica, Arial, sans-serif">
    <text x="30" y="58" font-size="34" font-weight="600">9:41</text>
    <text x="540" y="135" font-size="38" font-weight="700" text-anchor="middle">Following   <tspan font-weight="800">For You</tspan></text>
    <rect x="610" y="150" width="90" height="5" rx="2"/>
    <g opacity="0.95">
      <circle cx="1005" cy="960" r="44" fill="#ddd"/>
      <g transform="translate(1005 1100)"><path d="M0 26 C-40 -4 -26 -34 0 -16 C26 -34 40 -4 0 26Z"/></g><text x="1005" y="1160" font-size="26" text-anchor="middle">12.4K</text>
      <g transform="translate(1005 1240)"><ellipse rx="34" ry="28"/></g><text x="1005" y="1300" font-size="26" text-anchor="middle">318</text>
      <g transform="translate(1005 1370)"><path d="M-30 -10 L30 -30 L18 30Z"/></g><text x="1005" y="1430" font-size="26" text-anchor="middle">Share</text>
      <circle cx="1005" cy="1520" r="38" fill="#333" stroke="#fff" stroke-width="6"/>
    </g>
    <text x="40" y="1600" font-size="36" font-weight="700">@whatsallthefuss</text>
    <text x="40" y="1650" font-size="32">Helsinki wants AI to heat 70,000 homes. Here's how</text>
    <text x="40" y="1695" font-size="32">it would work... more</text>
    <text x="40" y="1748" font-size="30">♫ original sound</text>
    <rect x="0" y="1790" width="${W}" height="130" fill="#000" opacity="0.88"/>
    <g fill="#fff" opacity="0.9"><rect x="80" y="1830" width="44" height="40" rx="6"/><rect x="290" y="1830" width="44" height="40" rx="22"/><rect x="490" y="1822" width="100" height="56" rx="14"/><rect x="740" y="1830" width="44" height="40" rx="6"/><circle cx="975" cy="1850" r="22"/></g>
  </g>
</svg>`;

function pageFromSpec(st) {
  let bgCss = '#888';
  if (st.bg) {
    if (st.bg.startsWith('#') || st.bg.startsWith('rgb') || st.bg.includes('gradient(')) bgCss = st.bg;
    else {
      const p = BG[st.bg] || path.resolve(VIDEO, st.bg);
      bgCss = `url('${pathToFileURL(p).href}') center/cover no-repeat`;
    }
  }
  const layers = (st.layers || []).map((L) => {
    if (L.html) return L.html;
    const anchor = L.anchor || 'middle';
    const tx = anchor === 'middle' ? '-50%' : anchor === 'end' ? '-100%' : '0';
    const size = L.size || 98;
    // place the baseline at y: a zero-height inline-block box sits on the baseline
    return `<div style="position:absolute;left:${L.x ?? 540}px;top:${L.y ?? 448}px;transform:translate(${tx},-100%) rotate(${L.rotate || 0}deg);transform-origin:${anchor === 'middle' ? '50%' : anchor === 'end' ? '100%' : '0'} 100%;white-space:pre;line-height:1;font-family:'${L.font || 'Patrick Hand'}';font-weight:${L.weight || 400};font-size:${size}px;letter-spacing:${L.tracking || 0}em;color:${L.color || '#2b2420'};opacity:${L.opacity ?? 1};${L.shadow ? `text-shadow:${L.shadow};` : ''}${L.style || ''}"><span style="display:inline-block;vertical-align:baseline">${L.text}</span><span style="display:inline-block;height:0;vertical-align:baseline"></span></div>`;
  }).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0}#stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${bgCss}}${st.css || ''}</style></head><body><div id="stage">${layers}</div></body></html>`;
}

async function shoot(browser, html, baseDir, out, opts) {
  const css = fontFaceCss();
  html = html.replaceAll('{{BG_DUSK}}', pathToFileURL(BG.bg_dusk).href).replaceAll('{{BG_NIGHT}}', pathToFileURL(BG.bg_night).href).replaceAll('{{REPO}}', pathToFileURL(VIDEO).href);
  html = html.includes('</head>') ? html.replace('</head>', `<style>${css}</style></head>`) : `<style>${css}</style>` + html;
  const tmp = path.join(baseDir, `.render_${process.pid}_${Math.random().toString(36).slice(2)}.html`);
  fs.writeFileSync(tmp, html);
  const page = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 1});
  try {
    await page.goto(pathToFileURL(tmp).href, {waitUntil: 'load'});
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(150);
    fs.mkdirSync(path.dirname(out), {recursive: true});
    await page.screenshot({path: out, clip: {x: 0, y: 0, width: W, height: H}});
    const stem = out.replace(/\.png$/i, '');
    if (opts.ui) {
      await page.evaluate((svg) => { const d = document.createElement('div'); d.innerHTML = svg; d.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:99999'; document.body.appendChild(d); }, UI_SVG(opts.zones));
      await page.screenshot({path: stem + '_ui_full.png', clip: {x: 0, y: 0, width: W, height: H}});
    }
  } finally {
    await page.close();
    fs.unlinkSync(tmp);
  }
  const stem = out.replace(/\.png$/i, '');
  const {execFileSync} = await import('child_process');
  const toPhone = (src, dst) => execFileSync('python3', ['-c', `from PIL import Image; im=Image.open(${JSON.stringify(src)}).convert('RGB'); im=im.resize((360,640), Image.LANCZOS); im.save(${JSON.stringify(dst)}, quality=88)`]);
  if (opts.phone) toPhone(out, stem + '_phone.jpg');
  if (opts.ui) { toPhone(stem + '_ui_full.png', stem + '_ui.jpg'); fs.unlinkSync(stem + '_ui_full.png'); }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const pos = args.filter((a) => !a.startsWith('--'));
  if (!pos.length) { console.error('usage: node render.mjs page.html out.png | spec.json [--phone] [--ui] [--zones]'); process.exit(2); }
  const opts = {phone: flags.has('--phone'), ui: flags.has('--ui'), zones: flags.has('--zones')};
  const browser = await playwright.chromium.launch();
  try {
    if (pos[0].endsWith('.json')) {
      const spec = JSON.parse(fs.readFileSync(pos[0], 'utf8'));
      const o = {phone: opts.phone || !!spec.phone, ui: opts.ui || !!spec.ui, zones: opts.zones || !!spec.zones};
      for (const st of spec.stills) {
        const out = path.resolve(VIDEO, st.out);
        await shoot(browser, pageFromSpec(st), path.dirname(path.resolve(pos[0])), out, o);
        console.log('wrote', path.relative(VIDEO, out));
      }
    } else {
      const html = fs.readFileSync(pos[0], 'utf8');
      const out = path.resolve(pos[1] || pos[0].replace(/\.html?$/i, '.png'));
      await shoot(browser, html, path.dirname(path.resolve(pos[0])), out, opts);
      console.log('wrote', out);
    }
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
