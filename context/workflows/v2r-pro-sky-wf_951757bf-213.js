export const meta = {
  name: 'v2r-pro-sky',
  description: 'The owner wants a beautiful gentle sky gradient done the pro way: research pro techniques/tools (OKLab eased gradients, sun warmth, blue-noise dither, encoder banding), build lib/sky.tsx + a banding check + encode settings, adversarially verify on the encoded mp4',
  phases: [
    { title: 'Sky', detail: 'research + build + measure' },
    { title: 'Verify', detail: 'banding on the real encode, caption contrast, determinism' },
  ],
}

const SCR = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/sky'
const CTX = `
PROJECT: short-form vertical explainer videos (Remotion 4 = React SVG rendered by headless Chrome, 1080x1920, 60 fps, h264 masters, posted to
Instagram/TikTok/Shorts which re-encode), repo /home/user/Test- (PUBLIC: never commit emails, keys, third-party frames), branch video-production,
project in video/. The owner's rules: video/docs/OWNER_PLAYBOOK.md (they win), then video/docs/look/DIRECTION.md, video/docs/look/CRAFT.md,
video/docs/PIPELINE_V2.md. Video 2's code: video/src/v2r (palette.ts "10 Canal Mint", world/map.ts, world/rigs.ts, scenes), its S1 opening:
video/src/v2r/scenes/V2S1* (a helper session L1 owns those files: do NOT edit them; L1 will wire your module in).
THE OWNER, tonight, on the S1 look clip (a flat mint caption sky above, then abruptly a peach band holding a big orange sun): "why is it blue sky and
then suddenly abruptly orange, weird" -> "maybe when it comes to sky we can find a beautiful way to do a gentle gradient" -> "I think it might make the
sky much nicer" -> "again find the pro way and tools to do it the best way you can". Rules already updated (read them): playbook "ONE CONTINUOUS
SKY, a gentle gradient" and "Find the PRO way and the pro tools"; DIRECTION rules 5 and 6 (the sky is the ONE place a gradient is welcome; nearly flat
inside the caption band y 317-556 so captions keep their contrast; warmest at the sun and the horizon; dithered so it never bands; the far haze takes
the sky's lowest colour). Everything else in the look stays flat colour with the clean pen and gentle light (lib/pen.ts, lib/tier.tsx, lib/light.tsx).
Another local job is building lib/depth.ts + lib/particles.tsx + scripts/qa/check_depth.py and CRAFT §f right now: do not edit those; put your
CRAFT text in a new short section "g. Sky" and keep it consistent with §f's atmosphere (the far haze colour = your sky's horizon colour; export a
function for it). Deterministic rendering: a pure function of the frame (no Math.random, no wall clock). Keep v1/v3 renders byte-identical
(opt-in only). MAX effort; finish what the job needs.
GIT: commit only your files; messages end with the two trailer lines below; push with: for i in 1 2 3 4; do git fetch -q origin video-production &&
git merge -q --no-edit origin/video-production && git push -q origin HEAD:video-production && break; sleep $((2**i)); done.
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ
Scratch: ${SCR} (mkdir -p).`

const ENGINEER = CTX + `
YOUR JOB (sky engineer): research, then build, the professional way to make a beautiful, gentle, natural sky gradient that survives video.
RESEARCH (web + GitHub; cite sources in the doc): (1) perceptual interpolation: OKLab / OKLCH (Bjorn Ottosson), why sRGB-linear midpoints go muddy or
grey, libraries (culori, colorjs.io, chroma-js) vs a few lines of our own (lib/pen.ts already has Lab code); (2) EASED gradients (many stops placed on
an easing curve so the transition has no visible start/end lines; the "easing gradients" technique), and how illustrators paint evening skies:
zenith to horizon ramps, warmth around a low sun, the lightest band near the horizon, a slight hue turn, value control so text on top stays
readable; (3) BANDING: why 8-bit gradients band, how Chrome/Skia renders SVG gradients (does it dither?), the standard fixes: blue-noise or ordered
dither of +-1-2 code values before quantisation, film-grain-like noise, higher bitrate / lower CRF, x264 options (aq-mode, deblock, tune), 10-bit
masters vs the platforms' 8-bit re-encode; free blue-noise textures (licence: e.g. Christoph Peters' CC0 blue noise) or generating our own
(void-and-cluster) at build time; (4) how a sun sits in such a sky in flat illustration (a soft radial warmth that is part of the sky, the disc itself
flat, low over the horizon). Write video/docs/look/research/2026-10-27_sky_gradients.md (findings, sources, the chosen method and why).
BUILD: (a) video/src/lib/sky.tsx: a <Sky> component + helpers: key colours in OKLCH (zenith, caption-band, horizon, sun-warmth), an eased multi-stop
vertical gradient interpolated in OKLab (enough stops that it is smooth), a guard that keeps the caption band nearly flat (max dL* across y 317-556
configurable, default <= 1.5), an optional soft radial sun warmth that blends into the sky (part of the sky, no hard disc halo), a static blue-noise
dither layer of +-1..2 code values over the sky only (a small tiling texture embedded or generated deterministically), and skyColorAt(y) / horizonColor()
for the far haze; film-agnostic, typed, opt-in. (b) scripts/qa/check_banding.py: measures banding in a rendered frame or an mp4 (vertical L* profile
of a sky region: plateau widths, step sizes vs the JND, visible contour count; and the caption band's flatness); PASS / WARN / FAIL with numbers.
(c) Encoding: test the master encode (the repo's render scripts / BUILD docs: find how masters are encoded) on the sky with your dither: report banding
after encode at the current settings vs alternatives (CRF, preset, aq-mode, tune, -pix_fmt), also after a simulated platform re-encode (e.g. ffmpeg
h264 at ~3-5 Mbps), and pick settings; put them where masters are rendered (one place) and in PIPELINE_V2's QA list. (d) A demo composition (e.g.
src/entry-v2r-sky.tsx): S1-like evening sky (palette.ts tokens: the mint caption field on top, a peach horizon, the sun low near (196, 772) r 52 per
map.ts SUN0) with a simple far skyline; render it, encode it, view full frames and 4x crops of the sky, before (a plain 2-stop SVG gradient) vs after.
(e) Docs: video/src/lib/SKY.md (API, numbers, how to use with the depth atmosphere), CRAFT.md new short section "g. Sky" (numbers, code, check), a
one-line link in DIRECTION rule 6 to §g if missing. Typecheck (cd video && npx tsc --noEmit -p .), commit + push. Return <= 20 lines: the method,
the numbers (banding before/after, after re-encode), the encode settings, the API.`

const CRITIC = CTX + `
YOUR JOB (adversarial critic + fixer): the sky engineer just built lib/sky.tsx, scripts/qa/check_banding.py, encode settings, a demo, SKY.md and
CRAFT §g (summary below). Try to BREAK it on the REAL output: render the demo, encode with the chosen master settings AND a simulated platform
re-encode, then look at 1:1 and 4x crops of the sky on a phone-like brightness; banding, blotches from the dither, colour muddiness, the caption band
not flat enough for captions (measure contrast with the caption ink), the sun warmth reading as a glow disc, determinism (same frame twice in two
processes = identical), render cost, v1/v3 untouched; does check_banding really catch banding (feed it a deliberately banded gradient) and pass the
good one? Is it beautiful (would an illustrator sign it)? FIX what you find, commit + push. Return <= 15 lines: verdict, numbers, fixes.`

phase('Sky')
const eng = await agent(ENGINEER, { label: 'sky engineer: research + lib/sky + check_banding + encode', phase: 'Sky', effort: 'max' })
phase('Verify')
const crit = await agent(CRITIC + '\n\nENGINEER SUMMARY:\n' + (eng || '(missing)'), { label: 'critic: banding on the real encode', phase: 'Verify', effort: 'max' })
return { eng, crit }