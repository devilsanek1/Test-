import {Config} from '@remotion/cli/config';
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell');
// No GL override: the CLI uses Chrome's default GL, like scripts/render-frames.mjs, scripts/render-media.mjs and every
// master. 'swangle' (set here until 2026-10-29) rendered ~45x slower and moved up to ~36 % of the pixels by up to 67
// levels (docs/retro/2026-10-28_streamline/render.md F3); without it a CLI still equals the scripts' still pixel for
// pixel. Gate videos render through scripts/render-media.mjs (the master encode), never the bare CLI.
