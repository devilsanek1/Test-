// Video 3 G5 kit: the shared sets and props in the Autumn Ember house style (kit/README.md: API, sizes, colour jobs,
// the consistency contract). The palette import comes first so the house tokens are Ember before any lib module loads.
import '../palette';
import '../look'; // the clean pen + attention tiers (lib/pen.ts; kit/README.md "Clean pen and tiers")

export {EMBER, FILM_TOD, PALETTE_NAME, emberProblems} from '../palette';
export {b, fillAt, FILL_LAG, W, Show, Pop, Txt, textW, Rot, Scale, quadPt} from './util';
export type {At, Pt} from './util';
export {Nook, NookOutside, NookWindow, NOOK_LAYOUT, Lamp, Mug, Notebook} from './Nook';
export type {NookProps, NookLayout, NookOutsideProps, LampPose, Pool, Rect} from './Nook';
export {NightSky, Snowfall, TownBand, DataCenter, dataCenterGeo, signFaceShift, RoofLedge, RoofVent} from './Outside';
export type {HouseSpec, DataCenterProps, DataCenterVariant, RoofLedgeProps, RoofVentProps} from './Outside';
export {BrickStack, ChimneyPot, MidTown, streetAt, RoofDeck} from './Rooftop';
export type {BrickStackProps, StreetSpec, MidTownProps, RoofDeckProps} from './Rooftop';
export {S5_EASE, cubicBezier, s5Ease, planeScale, planeMat, boxMat, startMat, applyMat, matScale, PullLayer, planeSpeed} from './Pullback';
export type {PullPlane, PullBox} from './Pullback';
export {Laptop, laptopGeo, ScreenDesktop} from './Laptop';
export type {LaptopProps} from './Laptop';
export {Phone, Hand, phoneSlots, phonePoint} from './Phone';
export type {PhoneProps, HandProps} from './Phone';
export {PriceTag, tagShape, tagHole, tagHoleAt} from './PriceTag';
export type {PriceTagProps, TickerStep} from './PriceTag';
export {MemoryStick, StickFlight, flightPose, Pile, pileCount, STICK_RATIO} from './Memory';
export type {MemoryStickProps, StickFlightOpts, PileProps} from './Memory';
export {YouFront, YouSeated, YouBack, YouTiny, YOU} from './You';
export type {Face, YouFrontProps, YouSeatedProps, YouBackProps, YouTinyProps} from './You';
export {ChartCard, LineChart, BarChart, PRICE_LINE, PRICE_HOOK} from './Charts';
export type {LineChartProps, BarChartProps, Bar} from './Charts';
export {ChipFactory, chipFactoryGeo, ChipMaker, Van, WaitingDots, SpeechBubble, ThoughtBubble, WallClock, Calendar} from './Props';
export type {ChipFactoryProps, VanProps, BubbleProps} from './Props';
// ---- G5b: the dressing and life kit (kit/README.md "Life and density kit"; docs/v3/density_plan_g5b.md §2)
export {TAU, sway, sway2, bob, ring, rings, hopY, stepped, ease01, events, twinkle, windowLit, loopPos, crossing, shuttle, puffs, sweep, floatCam} from './idle';
export type {WindowForce, PuffOpts, Puff, FloatOpts} from './idle';
export {Pip3, PipTiny, PIP_EMBER, pipPlace, shrugK} from './Pip3';
export type {Pip3Props, PipPoseKey, LookKey, PipHop, PipShrug, PipTinyProps} from './Pip3';
export {WINTER, personGeo, WinterPerson, winterPersonMat, winterPhoneAt, BackRow, backRowLayout, backRowPhones, Walker, Dog, TinyWalkers, Tiny, WindowSilhouette, WindowLife, Worker, MiniCrate, Guard} from './People3';
export type {Wear, CoatDetail, PersonMove, WinterPersonProps, BackRowPerson, BackRowProps, WalkerProps, TinyKind, TinyWalkersProps, SilWho, WindowSilhouetteProps, LifeWindow, WorkerProps} from './People3';
export {BAND, SnowLayers, SnowSill, SnowCap, Frost, PuffTrain, Smoke, Steam, CoolingPlume, Exhaust, NearFronts, SkyClouds, LowClouds, BirdV, Icicles} from './Weather';
export type {SnowLayer, SnowLayersProps, PuffTrainProps, NearFrontsProps, SkyCloudsProps} from './Weather';
export {LEAF2, ShelfFill, Book, WallShelf, Plant, Leaf, StringLights3, Pinboard, PinnedThing, FramedPrint, Poster, PenCup, Headphones, BookStack, StickyNotes, Cable, Glasses, Speaker, DeskGrain, WallMarks, PullChain, Radiator, Rug, CoatHook, ToteBag, Slippers, CupSteam, HaloStep, useJolt} from './Room';
export type {Plank, ShelfFillProps, PlantKind, PlantProps, StringLights3Props, PinItem, PinboardProps} from './Room';
export {LampPost3, WallLamp, SnowTree, Car3, HeadlightSweep, roadPt, roadScale, RoadDress, Footprints, Pavement, BusStop, Fence, barrierAngle, GateBooth, PostSign, Floodlight, Pallet, StickCrate, Forklift, UtilityPole3, Wire3, Bike3, PassingCar, lifeBeats, useHop} from './Street';
export type {LampPost3Props, Car3Props, RoadQuad, RoadDressProps, GateBoothProps, ForkliftProps, Wire3Props} from './Street';
export {CardBoard, Clipboard, Cornice, Fascia, Drainpipe, DisplayWindow, LaptopBox, ShopDoor, ShopShelving, ShopWindowView, CardReader, ReceiptPrinter, PaperBag, UsbJar, CounterBell, StripLight, CableTray, DockWindow, CoffeeMachine, NoSmoking, Bench, BootMat, personHeight} from './Shop';
export type {CornerItem, CardBoardProps, ShopShelvingProps} from './Shop';
export {TownHouse, TownRow, RoofNeighbour, Pennant, FoldingChair, SideTable, LaundryLine, Shovel, RoofAerials} from './Town';
export type {HouseKind, TownHouseProps} from './Town';
