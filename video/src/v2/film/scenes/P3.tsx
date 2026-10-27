// P3 (lane L3-people): MEDIUM 2-shot in a real interview room, 8.36-13.24 ("But Google's staff told the BBC they're
// scared to speak out, because of their contracts.").
// ONE idea: other staff, worried, told the BBC they're scared, because of their contracts. Two staffers (kit Staffer:
// badges on navy lanyards, never her) sit at an interview table in a cool periwinkle studio (P3_room: the kit's room and
// table with the values stepped by depth and the softbox turned to them: the glass wall onto the dusk city, the frosted
// partition with the open-plan office and a colleague walking past, the clock, archive shelving, acoustic panels; real
// chairs on our side, a coat over one, a bag at the table), turned to a plain mic. A (the one who spoke, the subject)
// has his NAME WITHHELD tent in front of him; the CONTRACT lies front and centre-left in its own space, under his near
// hand (his far forearm lies across his body: one forearm over the other, no table showing between them). A answers on
// "told the BBC" (his mouth moves once, then he goes quiet and worried); B, worried, rests his chin on his hand. An
// ordinary underline draws on under CONTRACT on "contracts" (12.20, the pencil sound). Notes on the frosted glass; a
// second colleague carries archive boxes past behind it and a flock crosses the dusk in the glass wall.
// No cat here (it lives in her home only). Camera: HOLD, locked (never a zoom in a hold); the room lives.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {CC, INTERVIEW, InterviewRoom, InterviewTable, InterviewTableTop, Mic, NameTent, P3_STAFF, Staffer, type Pt} from '../kit';
import {P3Contract, P3GlassNotes, P3Underline} from './P3_life';

const START = 8.36;
/** The pencil on "contracts" (12.20): the underline starts a hair before the sound and lands on it. */
const LINE_AT = 12.2 - START - 0.06;

/** A's arms (screen px; [far arm, near arm]): the far forearm lies across his body at the table's back edge (no table
 *  shows between it and his chest), its hand resting by his near elbow; the near forearm comes forward and its hand
 *  rests on the CONTRACT's right edge, under the title. Now and then the near hand taps the page (his fidget), never
 *  around the underline. */
const aArms = (t: number): {hands: [Pt, Pt]; elbows: [Pt, Pt]} => {
  const per = 1.7;
  const u = (((t + 0.4) % per) + per) % per;
  const quiet = t > LINE_AT - 0.5 && t < LINE_AT + 0.6;
  const tap = !quiet && u < 0.25 ? 10 : 0;
  return {hands: [[588, 1398], [462, 1488 - tap]], elbows: [[756, 1386], [506, 1394]]};
};

const P3: React.FC = () => {
  const t = useTime();
  const A = P3_STAFF.A;
  const B = P3_STAFF.B;
  // A answers the BBC: his mouth moves from "told" through "BBC" (a beat early: lead the voice), then he is quiet
  const aTalk: [number, number][] = [[9.2 - START, 10.1 - START]];
  const arms = aArms(t);
  const z = 1; // HOLD: the camera locked (the board's; COZY_AND_SCALE 3b.5: never a zoom in a hold)
  return (
    <World sky={CC.studio}>
      <XG m={mat.about(mat.scale(z), 520, 1300)}>
        <InterviewRoom seed="p3room" passer={1.15} flockAt={1.3} />
        <P3GlassNotes />
        <Staffer {...B} variant="B" part="body" seed="p3B" />
        <Staffer {...A} variant="A" part="body" talking={aTalk} seed="p3A" />
        <InterviewTable seed="p3table" />
        <P3Contract />
        <P3Underline at={LINE_AT} />
        <InterviewTableTop seed="p3top" />
        <Staffer {...B} variant="B" part="arms" seed="p3B" />
        <Staffer {...A} variant="A" part="arms" hands={arms.hands} elbows={arms.elbows} seed="p3A" />
        <NameTent {...INTERVIEW.tent} seed="p3tent" />
        <Mic x={INTERVIEW.mic.x} y={INTERVIEW.mic.y} w={INTERVIEW.mic.w} tilt={10} seed="p3mic" />
      </XG>
    </World>
  );
};
export default P3;

/** Ink captions: the band is the studio's plain light periwinkle wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
