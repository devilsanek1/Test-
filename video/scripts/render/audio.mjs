// scripts/render/audio.mjs: the audio of a chunked render (render-media.mjs --parallel), made ONCE for the whole range
// and encoded exactly as renderMedia() encodes a one-step render's audio (Remotion 4.0.538: create-audio.js,
// preprocess-audio-track.js, stringify-ffmpeg-filter.js, merge-audio-track.js, compress-audio.js, aac-priming.js), with
// Remotion's own ffmpeg (libfdk_aac). So the muxed audio stream equals a one-step render's, bit for bit (tested on v2r's
// G7 master: phase1_render.md, item 3).
//   premixPcm()   the film plays ONE premixed file (cues {"audio": f, "sfx": []}, confirmed by Remotion's own asset list
//                 at the range's first and last frame): Remotion's preprocess + merge of that one track, from the file
//   aacFromPcm()  Remotion's AAC encode of a merged track (libfdk_aac 320k, cutoff 18000, ADTS)
//   muxArgs()     the input args that shift the AAC by libfdk's 2048-sample priming, as Remotion's stitcher does
import fs from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';

const SAMPLE_RATE = 48000;
const call = (bin, args) => RenderInternals.callFf({bin, args, indent: false, logLevel: 'error', binariesDirectory: null, cancelSignal: undefined});

/** Remotion's stringifyTrim(): seconds -> "<microseconds>us" with its float clean-up. */
const stringifyTrim = (trim) => {
  let value = trim * 1000000;
  if (value % 1 < 0.0000001) value = Math.floor(value);
  else if (value % 1 > 0.9999999) value = Math.ceil(value);
  const s = `${value}us`;
  return s.includes('e-') ? '0us' : s;
};

/** Remotion's audio probe (get-audio-channels.js): channels, duration, start time. */
async function probe(src) {
  const t = await call('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=channels:stream=start_time:format=duration:format=format_name', '-of', 'default=nw=1', src]);
  const m = (re) => t.stdout.match(re);
  const container = m(/format_name=([a-zA-Z0-9.]+)/);
  const isMP3 = container ? container[1] === 'mp3' : false;
  return {
    channels: m(/channels=([0-9]+)/) ? parseInt(m(/channels=([0-9]+)/)[1], 10) : 0,
    duration: m(/duration=([0-9.]+)/) ? parseFloat(m(/duration=([0-9.]+)/)[1]) : null,
    startTime: m(/start_time=([0-9.]+)/) ? (isMP3 ? 0 : parseFloat(m(/start_time=([0-9.]+)/)[1])) : null,
  };
}

/**
 * The merged PCM (pcm_s16le, 48 kHz, stereo) of ONE audio asset that plays on every frame of an n-frame range at
 * volume 1 and rate 1: trimLeft / audioStartFrame are its Remotion asset fields (mediaFrame at the range's first frame).
 */
export async function premixPcm({src, frames, fps, trimLeftFrames, audioStartFrame, workDir, out}) {
  const {channels, duration: assetDuration, startTime} = await probe(src);
  if (channels === 0) throw new Error(`no audio stream in ${src}`);
  const chunkLengthInSeconds = frames / fps;
  // getActualTrimLeft(seamless: false), then trimAndSetTempo's own call (seamless: true), as stringifyFfmpegFilter
  const sinceStart = trimLeftFrames - audioStartFrame;
  const first = audioStartFrame / fps + (sinceStart / fps) * 1 + 0;
  if (assetDuration && first >= assetDuration) throw new Error(`the range starts after the end of ${src}`);
  const trimLeft = audioStartFrame / fps / 1 + sinceStart / fps + 0;
  const maxTrim = assetDuration ? assetDuration / 1 : null;
  const trimRight = trimLeft + frames / fps - 0 + 0;
  let trimRightOrAssetDuration = maxTrim ? Math.min(trimRight, maxTrim) : trimRight;
  if (trimRightOrAssetDuration < trimLeft) trimRightOrAssetDuration = trimLeft;
  const audibleDuration = trimRightOrAssetDuration - trimLeft;
  const filter = `[0:a]aformat=sample_fmts=s16:sample_rates=${SAMPLE_RATE},atrim=${stringifyTrim(trimLeft)}:${stringifyTrim(trimRightOrAssetDuration)}[a0]`;
  const padAtEnd = chunkLengthInSeconds - audibleDuration - 0;
  const padEnd = padAtEnd > 0.0000001 ? `apad=pad_len=${Math.round(padAtEnd * SAMPLE_RATE)}` : null;
  const padStartS = 0 + (trimLeftFrames === 0 ? (startTime ?? 0) : 0);
  const padStart = padStartS === 0 ? null : `adelay=${new Array(channels + 1).fill((padStartS * 1000).toFixed(0)).join('|')}`;
  fs.mkdirSync(workDir, {recursive: true});
  const filterFile = path.join(workDir, 'preprocess.filter');
  fs.writeFileSync(filterFile, filter);
  const pre = path.join(workDir, '0.wav');
  await call('ffmpeg', ['-hide_banner', '-i', src, '-ac', '2', '-filter_script:a', filterFile, '-c:a', 'pcm_s16le', '-ar', String(SAMPLE_RATE), '-y', pre]);
  const mergeFile = path.join(workDir, 'merge.filter');
  fs.writeFileSync(mergeFile, [`[0:a]${[padStart, padEnd, 'acopy'].filter(Boolean).join(',')}[padded0]`, '[padded0]amix=inputs=1:dropout_transition=0:normalize=0[outputaudio]'].join(';'));
  await call('ffmpeg', ['-hide_banner', '-i', pre, '-filter_complex_script', mergeFile, '-c:a', 'pcm_s16le', '-map', '[outputaudio]', '-y', out]);
  fs.rmSync(pre, {force: true});
  return {filter, padEnd, padStart};
}

/** Remotion's compressAudio() for AAC: libfdk_aac, ADTS, 320k, cutoff 18000. */
export async function aacFromPcm({pcm, out}) {
  await call('ffmpeg', ['-hide_banner', '-i', pcm, '-c:a', 'libfdk_aac', '-f', 'adts', '-b:a', '320k', '-cutoff', '18000', '-y', out]);
}

/** The ADTS input's priming shift for an mp4 (getAacPrimingInputArgs): -itsoffset -42667us at 48 kHz. */
export const aacPrimingArgs = () => ['-itsoffset', `-${Math.round((2048 / SAMPLE_RATE) * 1000000)}us`];

export const ffmpeg = (args) => call('ffmpeg', args);
export const ffprobe = (args) => call('ffprobe', args);
