// P3 (lane L3-people): MEDIUM 2-shot in a real interview room, 8.36-13.24 ("But Google's staff told the BBC they're
// scared to speak out, because of their contracts.").
// ONE idea: other staff, worried, told the BBC they're scared, because of their contracts. Two staffers (kit Staffer:
// badges on navy lanyards, never her) sit at an interview table in a cool periwinkle studio (kit InterviewRoom: the glass
// wall onto the dusk city, the softbox, the frosted partition with the open-plan office and a colleague walking past,
// the clock, archive shelving, acoustic panels), turned to a plain mic. A (the one who spoke, the subject) has his
// NAME WITHHELD tent in front of him; the CONTRACT page lies on the table. A answers on "told the BBC" (his mouth moves
// once, then he goes quiet and worried); B, worried, rests his chin on his hand. An ordinary underline draws on under
// CONTRACT on "contracts" (12.20, the pencil sound). The table's dressing is local (P3_life: the kit's mic cable
// crossed the page); notes stuck on the frosted glass; a second colleague carries archive boxes past behind the glass
// and a flock crosses the dusk in the glass wall, in the kit walker's gap (so the room never stands still).
// No cat here (it lives in her home only). Camera: HOLD, breathing in 1.5 % toward A and the page; the room lives.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {CC, INTERVIEW, InterviewRoom, InterviewTable, Mic, NameTent, P3_STAFF, Staffer, TablePage} from '../kit';
import {P3GlassNotes, P3Passers, P3TableTop, P3Underline} from './P3_life';

const START = 8.36;
const DUR = 13.24 - START;
/** The pencil on "contracts" (12.20): the underline starts a hair before the sound and lands on it. */
const LINE_AT = 12.2 - START - 0.04;

const P3: React.FC = () => {
  const t = useTime();
  const A = P3_STAFF.A;
  const B = P3_STAFF.B;
  // A answers the BBC: his mouth moves from "told" through "BBC" (a beat early: lead the voice), then he is quiet
  const aTalk: [number, number][] = [[9.2 - START, 10.1 - START]];
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  return (
    <World sky={CC.studio}>
      <XG m={mat.about(mat.scale(z), 520, 1300)}>
        <InterviewRoom seed="p3room" />
        <P3Passers />
        <P3GlassNotes />
        <Staffer {...B} variant="B" part="body" seed="p3B" />
        <Staffer {...A} variant="A" part="body" talking={aTalk} seed="p3A" />
        <InterviewTable seed="p3table" />
        <TablePage {...INTERVIEW.page} seed="p3page" />
        <P3Underline at={LINE_AT} />
        <P3TableTop seed="p3top" />
        <Staffer {...B} variant="B" part="arms" seed="p3B" />
        <Staffer {...A} variant="A" part="arms" seed="p3A" />
        <NameTent x={INTERVIEW.tent.x} y={INTERVIEW.tent.y + 6} w={330} h={82} seed="p3tent" />
        <Mic x={INTERVIEW.mic.x} y={INTERVIEW.mic.y} w={INTERVIEW.mic.w} tilt={10} seed="p3mic" />
      </XG>
    </World>
  );
};
export default P3;

/** Ink captions: the band is the studio's plain light periwinkle wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
