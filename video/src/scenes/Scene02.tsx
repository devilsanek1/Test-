// PLACEHOLDER (engine stream) — proves flip-in + un-build; the scene agent for S02 replaces this file.
// "They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites."
import React from 'react';
import {Panel, Sun, Building, Ground, Tree, BrowserWindow, Bug, Window, useTime, palette, Fill} from '../lib';

const MiniSites: React.FC<{at: number; fillAt: number}> = ({at, fillAt}) => {
  const t = useTime();
  return (
    <>
      {Array.from({length: 10}, (_, i) => {
        const x = 130 + (i % 5) * 140;
        const y = 760 + Math.floor(i / 5) * 140;
        const hot = i < 7;
        return (
          <React.Fragment key={i}>
            <Window x={x} y={y} w={110} h={100} at={at + i * 0.06} seed={`ms${i}`} glass={palette.card} glint={false} />
            {hot && t > fillAt ? <Fill rect={[x, y, 110, 100]} color={palette.sun} at={fillAt + i * 0.08} mode="wipe" dir="up" seed={`mf${i}`} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

const Scene02: React.FC = () => (
  <>
    <Panel />
    <Sun />
    <Ground y={700} />
    <Building x={70} y={700} w={260} floors={4} floorH={105} seed="s2b1" balconies={[2]} roof="cornice" />
    <Tree x={800} y={700} size={62} seed="s2t" at={0.4} />
    <BrowserWindow x={360} y={260} w={420} h={400} at={0.2} url="php.net" content="code" seed="s2code" accent={palette.sun} />
    <Bug x={640} y={520} size={70} at={1.0} crawl seed="s2bug" />
    <MiniSites at={3.2} fillAt={4.25} />
  </>
);
export default Scene02;
