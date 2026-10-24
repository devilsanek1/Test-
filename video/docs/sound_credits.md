# Sound credits and licences

Owner: sound stream. Every audio source used in `audio/**` is listed here. Only CC0, public-domain
or permissive material is used. Nothing needs on-screen credit. The credit line at the end is a courtesy.

## Original material (made for this project)

| What | Notes |
|---|---|
| All music beds (`audio/music_*.wav`, `.mid`: cinematic, marimba, near_silent) | Original compositions: harmony, motifs, ostinati and arrangement. Generated in code (`audio/tools/bed_*.py`). No third-party melodies or loops. |
| Synthesised SFX | pencil scratches, pops, bubble pop, card flip, paper flip, whoosh, foreground wipe, light click, switch/toggle, typing tick and burst, counter ticker, handle rattle, lock click, coin chink, the `air_bed` and `city_bed` ambiences, and the synthetic layers of `sub_impact`, `low_swell` and `light_shimmer`. The synthesis code is in `audio/tools/make_sfx.py`. |
| `crowd_murmur.wav`, the murmur inside `city_bed.wav` | Made from the project's own VO (`assets/vo.mp3`): snippets reversed, pitch-shifted and muffled so no words can be understood. |
| `vo_clean.wav` | Processed from `assets/vo.mp3` (project asset). |

## Third-party sample sources

| Source | Version | Licence | Used for |
|---|---|---|---|
| **VSCO 2 Community Edition** (Versilian Studios Chamber Orchestra 2 CE). Recorded by Sam Gossner and Simon Dalzell, sample cutting by Elan Hickler / Soundemote. https://github.com/sgossner/VSCO-2-CE | git `440300901dfe9275fd84e0b7763af1f8443ae62e` | **CC0 1.0** (repo `LICENSE`) | Beds: Upright Piano (felt piano in `cinematic` and `near_silent`; "sampled by Simon Dalzell of Ivy Audio … Bearer is granted right to redistribute this sample set by Versilian Studios LLC. Credit to both original author and Versilian Studios is encouraged."). Also used: Solo Contrabass SusNV (the low floor), Cello Section susvib, Violin Section susVib (air), Cello and Viola Section spic (pulse), and Cello Section susvib in `marimba`. SFX: `Percussion/susCymb1-bow-1.wav` (the bowed cymbal in `low_swell`) and `Percussion/susCymb1-cresc-Median_v1.wav` (`riser_leak`). The retired `pizzicato` bed used the Violin, Viola, Cello and Contrabass pizzicato sets. |
| **VCSL**, the Versilian Community Sample Library (Versilian Studios LLC). https://github.com/sgossner/VCSL | git `c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e` | **CC0 1.0** (repo `LICENSE`, README: "Essentially it's Public Domain") | `marimba` bed: Marimba, Kalimba (Tanzania mbira), Glockenspiel, Shaker (Small), Bass Drum 1, Vibraphone (Bowed), Wine Glasses (Slow sustains). `cinematic` bed: Vibraphone (Bowed). SFX: Cajon (`door_knock`), Hand Chimes (`alert_ping`), Glockenspiel and Triangle (`ding`), Bass Drum 1 (`power_off_thunk`), Bass Drum 2 pp hit (`sub_impact`), and Bowed Vibraphone with Wine Glass (`light_shimmer`). |
| **GeneralUser GS** SoundFont by S. Christian Collins. https://github.com/mrbumpy409/GeneralUser-GS | v2.0.3, git `684543d5e5efaef08d02be50dcda8d552478fa60` | GeneralUser GS License v2.0, which is permissive: "You may use GeneralUser GS without restriction for your own music creation, private or commercial." The samples "allow full use in music production, including the ability to make profit." | Only the **Celeste** preset (prog 8), for the few celesta glints in the `cinematic` bed. Rendered with TinySoundFont. The retired `lofi` bed used the EP, nylon guitar, bass and jazz kit. Caveat: the author notes he cannot be 100 % sure where every sample came from, though none came from commercial libraries. If that matters, drop the celesta track (`bed_cinematic.py`, `CEL_DB`). `marimba` and `near_silent` are pure CC0. |

The sample libraries and the SoundFont are **not** committed. They are downloaded into the scratchpad
(`SOUND_SAMPLES` env var, see `audio/tools/common.py`) with sparse `git clone`. Only the rendered audio is in the repo.

Checked or downloaded but **not used**: the Kenney starter-kit sounds (MIT), which are game-styled, and the VSCO/VCSL timpani, gongs, mark trees and tubular bells, which are too "trailer" for the balance note.

## Software used to render (tools only, no licence passes to the audio)

numpy / scipy (BSD), librosa (ISC), soundfile (BSD), python-soxr (LGPL-2.1), pyloudnorm (MIT),
pretty_midi and mido (MIT), tinysoundfont (MIT, wraps TinySoundFont, MIT), pedalboard (GPL-3.0, used locally as a
processing tool; it is not distributed), ffmpeg (LGPL/GPL, decode and measurement only).

## Optional courtesy credit (video description)

> Music & sound design: original. Instrument samples: VSCO 2 CE and VCSL by Versilian Studios (CC0),
> upright piano by Simon Dalzell / Ivy Audio, celesta from GeneralUser GS by S. Christian Collins.
