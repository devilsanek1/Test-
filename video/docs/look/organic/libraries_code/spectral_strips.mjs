// Spectral.js (MIT, Kubelka-Munk mixing) against our OKLab mix: 11-step blends between pairs of our scene-1 swatches.
import fs from 'fs';
const spectral = await import('/tmp/organic/libraries/npm/node_modules/spectral.js/spectral.js');
const pairs = [['#ffd5ae', '#ab9fc2', 'cloud lit / shade'], ['#f2bdb6', '#9985ad', 'half / deep'],
  ['#d3c8dd', '#ffd5ae', 'sky field / lit'], ['#b7b46c', '#294e56', 'leaf lit / deep'], ['#c7c6e6', '#ffdfbe', 'zenith / glow']];
const out = [];
for (const [a, b, label] of pairs) {
  const ca = new spectral.Color(a), cb = new spectral.Color(b);
  const row = [];
  for (let i = 0; i <= 10; i++) { const t = i / 10; row.push(spectral.mix([ca, 1 - t], [cb, t]).toString()); }
  out.push({ a, b, label, km: row });
}
fs.writeFileSync('/tmp/organic/libraries/out/spectral/km.json', JSON.stringify(out, null, 1));
console.log(out.map(o => o.label + ': ' + o.km[5]).join('\n'));
