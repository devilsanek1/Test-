import fs from 'node:fs';
const timing = JSON.parse(fs.readFileSync('assets/timing.json'));
const scenes = JSON.parse(fs.readFileSync('src/data/scenes.json'));
const S = scenes.find(s=>s.id==='S08');
const W = timing.words;
for (let i=80;i<113;i++) console.log(i, W[i].w ?? W[i].word ?? W[i].text, (W[i].s - S.start).toFixed(3), (W[i].e - S.start).toFixed(3));
console.log('start', S.start, 'end', S.end, 'dur', S.end-S.start);
