// Video 2 G5 kit: the shared look, cast and LIVING sets every lane uses (kit/README.md: API, sizes, the time of day, the
// cold set, the interview room, colour jobs, how to keep a panel alive, the consistency contract). The palette import
// comes first so the house tokens are Cream & Cobalt before any lib module loads.
import '../palette';

export {CC, DUSK, COLD, COLD_SETS, COLD_PICK, FILM_TOD, PALETTE_NAME, ccProblems} from '../palette';
export type {CCRole, DuskRole, ColdRoles, ColdSetName} from '../palette';
// helpers: build timing, the opening's build wave, pops, hand lettering, ink by depth
export {b, fillAt, FILL_LAG, W, inkForHead, lerp, lerpPt, add, dirDeg, applyM, quadPt, BuildWave, BuildWaveCtx, radialWave, Ink, Fill, useWaveColour, Show, Pop, Rot, Placed, textW, Letter, Txt} from './util';
export type {At, Pt, BuildWaveV, LetterProps} from './util';
// ambient life (every panel lives the same way)
export {loopT, stepT, swayAt, onOff, Live, Clouds, cloudPath, Bird, birdPath, birdShape, Flock, Steam, DustMotes, WallClock, Sway, CandleFlame, leafD} from './Ambient';
export type {CloudsProps, FlockProps, SteamProps, DustMotesProps, WallClockProps} from './Ambient';
// the town outside her window
export {DuskTown} from './Town';
export type {DuskTownProps} from './Town';
// her home: the nook (P2 / P4 / P13 layouts, P5 close, P6 angle) and its pieces
export {NookRoom, NookDeskClose, NookAngle, NOOK_ANGLE, NOOK, NOOK_LAYOUTS, nookMat, nookPt, nookWorld, HighShelf, PotPlant, FramedPicture, Corkboard, CoatOnHook, TableLamp, NookMug, NookMug as Mug, BookPile, PaperStack, FloorPlant} from './Nook';
export type {NookLayoutName, NookRoomProps} from './Nook';
// her desk (O1 / P12 / LOOP): the approved style frame, alive
export {DESK, O1_WAVE, o1Wave, o1Cam, DeskBack, DeskFront, Books, Bookcase, BookStack, TopShelf, DeskWindow, DeskFloor, DeskTop, Basket, Pen, DeskMug, LampHead, leafPath} from './Desk';
// the cast: her, her cat, the staffers
export {HER, HerStanding, HerSeated, HerBack, HerArm, herMouth, HerHeadParts, hairSway, fidget, tube, elbow} from './Her';
export type {HerFace, Facing, Talking, HerBase, HerStandingProps, HerSeatedProps, HerBackProps, HerArmProps, HeadSpec} from './Her';
export {Cat, catHead} from './Cat';
export type {CatPose, CatProps} from './Cat';
export {Staffer, STAFF, P3_STAFF, InterviewTable, TablePage} from './Staffer';
export type {StafferProps} from './Staffer';
// her contract and the run-on
export {ContractPage, FloorRun, CONTRACT_PAGE, O1_PAGE, CL_X, CLAUSE, RUN_YEARS, RUN_STEP, pageMat, pagePoint, clauseWidths, clauseRow, clauseTip, sweepBands, runOnLength, PAPER_HANG} from './Contract';
export type {PageGeo, ContractPageProps, FloorRunProps} from './Contract';
// props: badge, box, mic, laptop, bubble, stamps
export {Badge, Lanyard, Box, BOX, BADGE_REST, Mic, micFromBoard, Laptop, Bubble, Stamp} from './Props';
export type {BadgeProps, BadgeState, BoxProps, MicProps, LaptopProps, BubbleProps, StampProps} from './Props';
// the cold set (P7, P9, P10, P11) and P3's interview room
export {ColdSet, InsertPage, ColdGround, INSERT_PAGES, COLD_CENTRE} from './ColdSet';
export type {ColdSetProps, InsertPageProps} from './ColdSet';
export {InterviewRoom, InterviewTableTop, INTERVIEW, NameTent} from './Interview';
