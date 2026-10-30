// Editorial people: the cast (dir_editorial.md §5-§7). HER, the film's lead (~27): light-medium warm skin, glossy
// espresso hair, the film's teal (#0B8577, v2's hero) as her accent in both outfits, never on her biggest mass as a
// column (diagnose cause 4). Two supporting people, other looks and ethnicities: a Black man in caramel suede over
// navy, and an East Asian woman in an oversized white shirt and wide blue jeans. Tonal neutrals from the house palette
// (no beige, olive or grey), one accent each, skins warm with their shade turned toward red.
import {fromLch, lch} from './color';
import {MAN, WOMAN} from './body';
import type {Person} from './figure';

/** The lip tone: L* -8, a little redder and richer than the lit skin (design_research §11.7; a tone, never a line). */
const lipOf = (skin: string) => {
  const q = lch(skin);
  return fromLch(q.L - 8, q.C + 9, q.h - 9);
};
/** The taper's tone: the hair's colour mixed toward the skin (the skin showing through a low fade). */
const taperOf = (hair: string, skin: string) => {
  const a = lch(hair);
  const b = lch(skin);
  return fromLch(a.L * 0.55 + b.L * 0.45, a.C * 0.5 + b.C * 0.5, b.h);
};

export const HER_SKIN = '#DCAA8A';
export const HER_HAIR = '#3A2B27';
export const TEAL = '#0B8577';

const herBase = {
  build: WOMAN,
  mats: {
    skin: {c: HER_SKIN, kind: 'skin' as const},
    lip: {c: lipOf(HER_SKIN), kind: 'skin' as const},
    hair: {c: HER_HAIR, kind: 'hair' as const},
    lens: {c: '#2A2124', kind: 'lens' as const},
  },
};

/** Her, autumn city evening: a chocolate knee-length coat worn open, a cloud-cream mock-neck knit, the teal satin
 *  bias midi skirt (the accent and the flowing element), black pointed flats; long hair down, centre part. */
export const HER_EVENING: Person = {
  name: 'her-evening',
  ...herBase,
  hair: 'long',
  outfit: 'herEvening',
  mats: {
    ...herBase.mats,
    coat: {c: '#5E3E31', kind: 'cloth'},
    knit: {c: '#EEE6DB', kind: 'light'},
    skirt: {c: TEAL, kind: 'hero'},
    shoe: {c: '#2B2325', kind: 'leather'},
  },
  face: {lash: 'open'},
};

/** Her, casual weekend: the teal cropped cardigan over a white tee, straight dark-indigo jeans, white slim sneakers
 *  with a cream sole band, a canvas tote on the shoulder, oversized sunglasses, a high ponytail (the flowing element). */
export const HER_WEEKEND: Person = {
  name: 'her-weekend',
  ...herBase,
  hair: 'pony',
  outfit: 'herWeekend',
  mats: {
    ...herBase.mats,
    cardigan: {c: TEAL, kind: 'hero'},
    tee: {c: '#F2ECE4', kind: 'light'},
    jeans: {c: '#33476A', kind: 'denim'},
    sneaker: {c: '#ECE6DD', kind: 'light'},
    sole: {c: '#D8C6AD', kind: 'light'},
    stripe: {c: '#2B3A5C', kind: 'cloth'},
    tote: {c: '#E4D5C0', kind: 'light'},
  },
  face: {glasses: true, planes: true},
};

/** The man (a supporting stranger, ~28, Black, deep brown skin): twists on a low taper; a caramel suede chore jacket
 *  open over a white tee, relaxed navy trousers, the white-sock flash, dark loafers; looking down at his phone. */
const MAN_SKIN = '#8B5A42';
const MAN_HAIR = '#2B2324';
export const MAN_SUEDE: Person = {
  name: 'man-suede',
  build: MAN,
  hair: 'twists',
  outfit: 'manSuede',
  mats: {
    skin: {c: MAN_SKIN, kind: 'skin'},
    lip: {c: lipOf(MAN_SKIN), kind: 'skin'},
    hair: {c: MAN_HAIR, kind: 'hair'},
    taper: {c: taperOf(MAN_HAIR, MAN_SKIN), kind: 'hair'},
    jacket: {c: '#AD7752', kind: 'cloth'},
    tee: {c: '#F0EAE2', kind: 'light'},
    trousers: {c: '#283651', kind: 'cloth'},
    sock: {c: '#F2EEE8', kind: 'light'},
    shoe: {c: '#3E2A22', kind: 'leather'},
    soleDark: {c: '#2A1E1A', kind: 'leather'},
    phone: {c: '#26222A', kind: 'lens'},
    lens: {c: '#2A2124', kind: 'lens'},
  },
  face: {lash: 'closed'},
};

/** The woman (a supporting stranger, ~24, East Asian, light skin): a textured black bob with a side part; an oversized
 *  cloud-white shirt half-tucked into wide mid-blue jeans; burgundy ballet flats (her one accent). */
const W2_SKIN = '#EBC8B0';
export const WOMAN_SHIRT: Person = {
  name: 'woman-shirt',
  build: {...WOMAN, skull: 124},
  hair: 'bob',
  outfit: 'womanShirt',
  mats: {
    skin: {c: W2_SKIN, kind: 'skin'},
    lip: {c: lipOf(W2_SKIN), kind: 'skin'},
    hair: {c: '#2B2324', kind: 'hair'},
    shirt: {c: '#F1EBE3', kind: 'light'},
    jeans: {c: '#5F86A6', kind: 'denim'},
    flat: {c: '#7A3238', kind: 'leather'},
    lens: {c: '#2A2124', kind: 'lens'},
  },
  face: {lash: 'open'},
};
