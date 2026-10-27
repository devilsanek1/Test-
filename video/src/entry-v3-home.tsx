// Video 3 rework: a PROBE of the shared home pieces at any film time (scenes/home_set.tsx + homeCam, and the thread
// plane), for the lanes that draw them (SQA pilot, the HOME lane's SQB / SQC). Not part of the film.
//   HomeProbe  props {t0}: composition time 0 = film time t0; draws <World sky=wall> + HomeSet + ThreadPlane only
//              (no captions, no voice), so a lane sees the set its own sequence will draw over, at film time.
// Stills: node scripts/render-frames.mjs HomeProbe <dir> 0,1.5,3 --entry=src/entry-v3-home.tsx --props='{"t0":6.5}'
import './v3/film/palette';
import './v3/film/look';
import React from 'react';
import {Composition, registerRoot, useCurrentFrame, useVideoConfig} from 'remotion';
import {World} from './lib/World';
import {EMBER} from './v3/film/kit';
import {HomeSet} from './v3/film/scenes/home_set';
import {ThreadPlane} from './v3/film/scenes/thread_plane';

const HomeProbe: React.FC<{t0: number}> = ({t0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = t0 + frame / fps;
  return (
    <World sky={EMBER.wall}>
      <HomeSet T={T} />
      <ThreadPlane T={T} />
    </World>
  );
};

const Root: React.FC = () => <Composition id="HomeProbe" component={HomeProbe} defaultProps={{t0: 0}} durationInFrames={60 * 20} fps={60} width={1080} height={1920} />;

registerRoot(Root);
