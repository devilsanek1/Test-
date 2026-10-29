// Dev preview compositions. Each file is owned by one stream:
//   KitDemo     -> engine/toolkit stream
//   MascotSheet -> character stream
//   FontTest    -> style-bible stream
//   CineDemo    -> cinematic-kit stream
//   SharedKitSheet -> shared-world-kit stream
//   EdgeLab     -> screen-edge treatments (src/lib/edges, docs/EDGES.md)
// Owners may change their component's body and the durationSeconds below for their own entry only.
import {KitDemo} from './KitDemo';
import {MascotSheet} from './MascotSheet';
import {FontTest} from './FontTest';
import {CineDemo} from './CineDemo';
import {SharedKitSheet} from './SharedKitSheet';
import {EdgeLab} from './EdgeLab';
import {ProfilePic} from './ProfilePic';

export const devCompositions = [
  {id: 'KitDemo', component: KitDemo, durationSeconds: 12},
  {id: 'MascotSheet', component: MascotSheet, durationSeconds: 8},
  {id: 'FontTest', component: FontTest, durationSeconds: 2},
  {id: 'CineDemo', component: CineDemo, durationSeconds: 22},
  {id: 'SharedKitSheet', component: SharedKitSheet, durationSeconds: 10},
  {id: 'EdgeLab', component: EdgeLab, durationSeconds: 6},
  {id: 'ProfilePic', component: ProfilePic, durationSeconds: 1},
];
