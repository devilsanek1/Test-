import {random} from 'remotion';
const seed='person/s5msg';
let i=0; const nx=()=>random(`${seed}#${i++}`);
const w=86+14*nx(); const hr=w*(0.23+0.03*nx()); nx(); // round
nx(); // hairColor
const legs=nx(); const shoes=nx(); nx(); nx(); nx(); // pack hat sign
const phase=6.28*nx();
console.log({w,hr,phase,sin:Math.sin(phase), legsIdx:Math.floor(legs*5), shoesIdx:Math.floor(shoes*4)});
