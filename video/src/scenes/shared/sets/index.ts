// Shared SETS barrel (sets lane). Scene code:  import {GovernmentPlaza, PLAZA, StoopStreet, ...} from '../shared/sets';
// API + anchors: docs/SHARED_SETS.md. Every set: world coords = canvas px at its scene's camera rest; every event time is
// a prop in scene seconds; `wrap` splits a set into multiplane layers; `x / y / scale` only offset the whole set.
export * from './common';
export * from './SiteFacade';
export * from './rows';
export * from './GovernmentPlaza';
export * from './StoopStreet';
export * from './BlueprintStreet';
export * from './BlueprintWall';
export * from './MakersLane';
export * from './NoticeboardCorner';
export * from './DomeCity';
export * from './TerraceHill';
export * from './OldQuarter';
export {SET_CATALOG} from './catalog';
export type {SetEntry} from './catalog';
