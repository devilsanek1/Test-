import {tramPipAt, TRAM_PIP_UNTIL} from '../../../../../home/user/Test-/video/src/scenes/scene09/TramWiper';
for (let T = 39.6; T <= 39.81; T += 1/30) { const p = tramPipAt(T); console.log(T.toFixed(3), p.x.toFixed(1), p.y.toFixed(1)); }
console.log('until', TRAM_PIP_UNTIL, tramPipAt(39.805));
