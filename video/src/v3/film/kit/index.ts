// Video 3 G5 kit: the shared sets and props in the Autumn Ember house style (kit/README.md: API, sizes, colour jobs,
// the consistency contract). The palette import comes first so the house tokens are Ember before any lib module loads.
import '../palette';

export {EMBER, FILM_TOD, PALETTE_NAME, emberProblems} from '../palette';
export {b, fillAt, FILL_LAG, W, Show, Pop, Txt, textW, Rot, Scale, quadPt} from './util';
export type {At, Pt} from './util';
export {Nook, NookOutside, NOOK_LAYOUT, Lamp, Mug, Notebook} from './Nook';
export type {NookProps, NookLayout, NookOutsideProps, LampPose, Pool, Rect} from './Nook';
export {NightSky, Snowfall, TownBand, DataCenter, dataCenterGeo, RoofLedge} from './Outside';
export type {HouseSpec, DataCenterProps, DataCenterVariant, RoofLedgeProps} from './Outside';
export {Laptop, laptopGeo} from './Laptop';
export type {LaptopProps} from './Laptop';
export {Phone, Hand, phoneSlots, phonePoint} from './Phone';
export type {PhoneProps, HandProps} from './Phone';
export {PriceTag, tagShape, tagHole, tagHoleAt} from './PriceTag';
export type {PriceTagProps, TickerStep} from './PriceTag';
export {MemoryStick, StickFlight, flightPose, Pile, pileCount, STICK_RATIO} from './Memory';
export type {MemoryStickProps, StickFlightOpts, PileProps} from './Memory';
export {YouFront, YouSeated, YouTiny, YOU} from './You';
export type {Face, YouFrontProps, YouSeatedProps, YouTinyProps} from './You';
export {ChartCard, LineChart, BarChart, PRICE_LINE, PRICE_HOOK} from './Charts';
export type {LineChartProps, BarChartProps, Bar} from './Charts';
export {ChipFactory, chipFactoryGeo, ChipMaker, Van, WaitingDots, SpeechBubble, ThoughtBubble, WallClock, Calendar} from './Props';
export type {ChipFactoryProps, VanProps, BubbleProps} from './Props';
