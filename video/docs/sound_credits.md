# Sound credits and licences

Owner: sound stream. Every audio source used in `audio/**` is listed here. Only CC0, public-domain
or permissive material is used. Nothing needs on-screen credit. The credit line at the end is a courtesy.

## Original material (made for this project)

| What | Notes |
|---|---|
| All three music beds (`audio/music_*.wav`, `.mid`) | Original compositions: harmony, motifs, ostinati and arrangement. Generated in code (`audio/tools/bed_*.py`). No third-party melodies or loops. |
| Synthesised SFX | pencil scratches, pops, bubble pop, card flip, paper flip, whoosh, light click, switch/toggle, typing tick and burst, counter ticker, handle rattle, lock click, coin chink. The synthesis code is in `audio/tools/make_sfx.py`. |
| `crowd_murmur.wav` | Made from the project's own VO (`assets/vo.mp3`): 14 snippets, reversed, pitch-shifted and muffled so no words can be understood. |
| `vo_clean.wav` | Processed from `assets/vo.mp3` (project asset). |

## Third-party sample sources

| Source | Version | Licence | Used for |
|---|---|---|---|
| **VSCO 2 Community Edition** (Versilian Studios Chamber Orchestra 2 CE). Recorded by Sam Gossner and Simon Dalzell, sample cutting by Elan Hickler / Soundemote. https://github.com/sgossner/VSCO-2-CE | git `440300901dfe9275fd84e0b7763af1f8443ae62e` | **CC0 1.0** (repo `LICENSE`) | Violin Section Pizz, Viola Section pizz, Cello Section pizzT, Solo Contrabass Pizz, Cello Section susvib, Viola Section trem (bed "pizzicato"; the cello also appears in "marimba"). Upright Piano: "sampled by Simon Dalzell of Ivy Audio … Bearer is granted right to redistribute this sample set by Versilian Studios LLC. Credit to both original author and Versilian Studios is encouraged." Used as the felt piano. `Percussion/susCymb1-cresc-Median_v1.wav` is the base of `riser_leak`. |
| **VCSL**, the Versilian Community Sample Library (Versilian Studios LLC). https://github.com/sgossner/VCSL | git `c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e` | **CC0 1.0** (repo `LICENSE`, README: "Essentially it's Public Domain") | Marimba, Kalimba (Tanzania mbira), Glockenspiel, Shaker (Small), Bass Drum 1 (beds); Cajon (`door_knock`), Hand Chimes (`alert_ping`), Glockenspiel + Triangle (`ding`), Bass Drum 1 (body of `power_off_thunk`). |
| **GeneralUser GS** SoundFont by S. Christian Collins. https://github.com/mrbumpy409/GeneralUser-GS | v2.0.3, git `684543d5e5efaef08d02be50dcda8d552478fa60` | GeneralUser GS License v2.0, which is permissive: "You may use GeneralUser GS without restriction for your own music creation, private or commercial." The samples "allow full use in music production, including the ability to make profit." | Bed "lofi" only: Tine Electric Piano (prog 4), Nylon Guitar (24), Acoustic Bass (32), Jazz drum kit (bank 128, prog 32: kick, side stick, hats). Rendered with TinySoundFont. Caveat: the author notes he cannot be 100 % sure where every sample came from, though none came from commercial libraries. If that matters for the client, use "marimba" or "pizzicato". Both are pure CC0. |

The sample libraries and the SoundFont are **not** committed. They are downloaded into the scratchpad
(`SOUND_SAMPLES` env var, see `audio/tools/common.py`) with sparse `git clone`. Only the rendered audio is in the repo.

Checked but **not used**: the Kenney starter-kit sounds (MIT). They are game-styled and did not fit the hand-drawn tone.

## Software used to render (tools only, no licence passes to the audio)

numpy / scipy (BSD), librosa (ISC), soundfile (BSD), python-soxr (LGPL-2.1), pyloudnorm (MIT),
pretty_midi and mido (MIT), tinysoundfont (MIT, wraps TinySoundFont, MIT), pedalboard (GPL-3.0, used locally as a
processing tool; it is not distributed), ffmpeg (LGPL/GPL, decode and measurement only).

## Optional courtesy credit (video description)

> Music & sound design: original. Instrument samples: VSCO 2 CE and VCSL by Versilian Studios (CC0),
> upright piano by Simon Dalzell / Ivy Audio, GeneralUser GS by S. Christian Collins.
