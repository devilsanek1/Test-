// Dev preview compositions. Each file is owned by one stream:
//   KitDemo     -> engine/toolkit stream
//   MascotSheet -> character stream
//   FontTest    -> style-bible stream
//   CineDemo    -> cinematic-kit stream
// Owners may change their component's body and the durationSeconds below for their own entry only.
import {KitDemo} from './KitDemo';
import {MascotSheet} from './MascotSheet';
import {FontTest} from './FontTest';
import {CineDemo} from './CineDemo';

export const devCompositions = [
  {id: 'KitDemo', component: KitDemo, durationSeconds: 12},
  {id: 'MascotSheet', component: MascotSheet, durationSeconds: 8},
  {id: 'FontTest', component: FontTest, durationSeconds: 2},
  {id: 'CineDemo', component: CineDemo, durationSeconds: 18},
];
