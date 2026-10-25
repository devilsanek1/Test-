import {MOTION} from '../../../../../home/user/Test-/video/src/lib/spec';
import {CAM} from '../../../../../home/user/Test-/video/src/lib/cine/camera';
const r = MOTION.camera.reveal;
console.log('reveal(0.25)', r(0.25).toFixed(3), 'CAM', CAM.reveal(0.25).toFixed(3));
for (const u of [0.1, 0.5, 0.9]) console.log('ease', u, MOTION.camera.ease(u).toFixed(4), CAM.ease(u).toFixed(4), 'slow', MOTION.camera.slow(u).toFixed(4), CAM.slow(u).toFixed(4));
// ShotCam example: 1260 -> 60 over 5 s
let peak = 0;
for (let f = 0; f < 150; f++) { const a = r(f / 150), b = r((f + 1) / 150); peak = Math.max(peak, Math.abs(b - a) * 1200); }
console.log('example avg', (1200 / 150).toFixed(1), 'px/frame, peak', peak.toFixed(1));
