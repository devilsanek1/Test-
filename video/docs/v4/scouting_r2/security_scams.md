# V4 scouting, round 2: security, privacy and scams (scout: security_scams)

Searched 2026-10-27. Scope: hacks, breaches, outages, deepfake scams, surveillance, data leaks, with a hidden mechanism behind each.
Exclusions checked: none of these has Anthropic as a key entity. None is about military AI or chip prices. None duplicates the round-1 pool (freezers, WhatsApp AI, padlock "4", crypto wallets, Türkiye age tokens, Meta New Mexico, London power cut, Microsoft buyouts). None involves PHP (v1).
Ranking, by owner taste (everyday object, one real person, plain lines): **1. the router that will never be fixed**, **2. the app you forgot that still calls home**, **3. the TV that may borrow your soundbar's microphone** (fresh but unverified), 4. Meta glasses recording without "Hey Meta" (backup).

---

## 1. The box in your hallway has a 16-year-old hole, and nobody will fix it

- **News:** Researcher **Quentin Kaiser** presented "WPSplinter" at Hexacon (Paris) on **16 Oct 2026**. It is a bug in Broadcom's Wi-Fi Protected Setup (WPS) code, the "press the button to pair" feature. Someone within Wi-Fi range can corrupt the router's memory and take control of it **with no Wi-Fi password**. He demonstrated it on real ISP boxes: on an Orange Belgium Askey TCG3000 he read out the Wi-Fi key and joined the network, and on a Proximus Sagemcom BBOX3V+ he opened a remote shell. The code dates to at least **2010**. Broadcom shipped an incomplete fix in **2018** and **refused to assign a CVE**, calling the code obsolete and outside its support window. On the older eCos chips (BCM3380/3383/33834) Kaiser calls it a **"forever day"**: it will never be patched. Belgian estimates from BIPT data: about **850,000** Proximus, **500,000** VOO and **210,000** Orange gateways, roughly **1.56 M** in total. As of 15 Oct, none had been updated. He reports no attacks in the wild.
- **Big question:** Is my home Wi-Fi actually safe?
- **Twist:** The bug is known. The maker has known since 2018. It still won't be fixed, because the chip is "too old" for the company, yet it's still in your hallway. And because no CVE number exists, the usual alarm system (scanners, ISP patch lists) doesn't even see it. Your router's security has an expiry date that nobody printed on the box.
- **So what:** Your internet provider gave you the box, and you never chose the chip inside → the chip maker stopped supporting the code years ago → the box keeps running it → someone parked across the street could get onto your home network without the password → the only fixes are turning WPS off (which may not fully help) or getting your provider to swap the box.
- **Thesis:** Everyone thinks a strong Wi-Fi password keeps their home network safe. This new research shows millions of routers can be opened without it, and the chip maker won't fix them because the code is "out of support". That matters because the box your ISP gave you can be years past its security expiry date with no warning.
- **Frame 0:** "Your router can be hacked without the password"
- **Hooks:** "Strong Wi-Fi password? Doesn't matter for this one." / "This bug is 16 years old. The company says it won't fix it." / "The box in your hallway has an expiry date nobody told you about."
- **Real person:** Quentin Kaiser (security researcher): "This means that from across the street, you can gain a root shell on a significant portion of the routers" (Techzine, 19 Oct 2026).
- **Share reason:** It's practical. "Go into your router settings and turn off WPS, and ask your ISP if your box is on the list." People send that to family.
- **Key image:** A cozy dense apartment block at night, every window glowing with a little router. Across the street, a tiny figure on a bench with a laptop. Pull back to scale: a giant warehouse shelf labelled "2010" with the same chip in millions of boxes, a "SUPPORT ENDED" sign hanging off it.
- **Evidence:** Solid. Multiple outlets agree on the dates, the demo devices, Broadcom's refusal of a CVE and the Belgian estimates: The Hacker News, Techzine, Security Affairs, Dutch IT Channel, plus Kaiser's own blog and talk. The worldwide device count ("millions") is his estimate, and some entries on his wider vendor list are only "likely vulnerable" from automated checks. No real attacks yet.
- **Risks:** The confirmed devices are Belgian ISP boxes, so keep claims about other countries to "the same chip family is sold worldwide". Broadcom's position comes via Kaiser's account and press paraphrase, with no on-record statement, so ask for one. About 11 days old. Don't say "hackers are breaking in": it's a demonstrated possibility.
- **Sources:**
  - The Hacker News, 2026-10-19: https://thehackernews.com/2026/10/unpatched-broadcom-wi-fi-flaw-lets.html
  - Techzine, 2026-10-19: https://www.techzine.eu/news/security/145085/broadcom-wpsplinter-vulnerability-leaves-millions-of-belgian-routers-vulnerable/
  - Security Affairs: https://securityaffairs.com/?p=201268
  - Dutch IT Channel, 2026-10-20: https://www.dutchitchannel.nl/news/763056/ernstig-lek-in-broadcom-chips-treft-miljoenen-routers
  - Cybernews: https://cybernews.com/security/broadcom-wifi-flaw-millions-routers-no-password/

---

## 2. The app you forgot about still calls home, and anyone could buy "home"

- **News:** Reported by BleepingComputer on **23 Oct 2026** and The Hacker News, around Eye Security's Hack.lu 2026 talk. Time4Popcorn, an abandoned fork of the Popcorn Time streaming app, has an updater that kept asking an **expired web address** (popcorntimeupd.xyz) for updates. It did this over plain HTTP and ran whatever it got **without checking a signature**, with full SYSTEM/root rights. Eye Security registered the lapsed domain (plus 14 related ones) and saw up to **3 M Windows and 350,000 Mac** clients calling in, from home ISPs but also from corporate, government and military networks. **None of the users appeared to be actively using the app.** From Nov 2025 to Mar 2026, Eye used the hole to push a harmless update that switched the updater off: **2 M+ downloads**, and requests had fallen 98 % by 1 Mar 2026. Antivirus flagged their "fix" as malware, so they had to rework it. The domains now belong to the nonprofit Shadowserver Foundation. Android copies can't be fixed remotely. CVE-2026-30612 (CVSS 9.8) was published on 11 Jun 2026.
- **Big question:** Is old software on my computer dangerous even if I never open it?
- **Twist:** Nobody hacked anything. The app's makers simply let a web address expire, and a web address can be bought by anyone. Whoever owned it could have run their own program on ~3 million computers at once. The "attackers" who got there first were good guys, and to save people they had to use exactly the trick a criminal would have used.
- **So what:** You installed something years ago and forgot it → it still quietly asks the same internet address "any updates?" → the company behind it vanished and stopped paying for that address → anyone can register it → whatever they send runs on your machine with full control → a forgotten app works like a door key left under the mat for whoever buys the mat.
- **Thesis:** Everyone thinks hacking means breaking in. This case shows that millions of computers were one domain purchase away from being taken over, because a forgotten app kept trusting an address its makers abandoned. That matters because the software you stopped using is the software nobody is guarding.
- **Frame 0:** "3 million computers were one purchase from takeover"
- **Hooks:** "You forgot this app. It didn't forget its home address." / "Nobody hacked these computers. Someone just bought a web address." / "The good guys had to hack 2 million computers to save them."
- **Real person:** Eye Security (company statement, via BleepingComputer): "If we were able to send an update, we could potentially get code execution on millions of systems." The blog author is Niels Teusink (Eye Security). Find a named quote from the Hack.lu speaker if we pick this.
- **Share reason:** "Go uninstall the stuff you don't use" is an easy, satisfying action to send to a friend. The "good-guy hackers" twist is a fun story to retell.
- **Key image:** A cozy cluttered desktop at night. In a dusty corner folder, a tiny forgotten app character still sends paper planes out of the window to an empty, boarded-up house with a "FOR SALE: $3" sign. Pull back to scale: 3 million windows across a city, each with its own paper plane heading to the same house.
- **Evidence:** Solid. Eye Security's own technical write-up (primary source), BleepingComputer (23 Oct) and The Hacker News agree on the numbers. Eye's own estimate of unique machines is slightly lower (2.5-3.0 M Windows, 250-350 k Mac) because the hardware IDs were unreliable. The domain price is not in the sources, so don't invent "$3" as a fact (only as an illustrative sign, or check the registrar).
- **Risks:** The users were running a piracy-adjacent app, so keep the lesson general ("abandoned apps"), not "pirates got what they deserved". The fix happened months ago. The fresh peg is the 23 Oct disclosure, so frame it as "just revealed". Eye says this doesn't apply to the newer, legal Popcorn Time project.
- **Sources:**
  - BleepingComputer, 2026-10-23: https://www.bleepingcomputer.com/news/security/abandoned-popcorn-time-app-exposed-millions-of-device-to-rce-attacks/
  - The Hacker News, Oct 2026: https://thehackernews.com/2026/10/researchers-push-over-2-million-updates.html
  - Eye Security advisory (primary), 2026-06-11: https://labs.eye.security/cve-2026-30612-a-vulnerability-in-time4popcorn-popcorntime/
  - Hack.lu 2026 talk: https://pretalx.com/hack-lu-2026/talk/FAGXJE/

---

## 3. Your TV has no microphone, so a researcher says it borrows your soundbar's (UNVERIFIED, handle with care)

- **News:** From **21 Oct 2026**, a security researcher posting as **@log4j** on X says he got root access to a 2025 Samsung smart TV. He describes extensive tracking: automatic content recognition (ACR), screenshot handling, geolocation, a packet logger, a profile-building ad service and 400+ partner entities. He also claims the TV counts sound events (dog barks, a baby crying) in telemetry sent to Samsung, and that a TV without its own mic looks for one on connected devices like a soundbar or Bluetooth speaker. A second researcher saw a mic switch on for ~5 s, but on a non-standard setup. **Samsung had not commented** as of 26 Oct. TechRadar's take: "this doesn't look like a privacy scandal on the face of it", because Samsung's documented Pet Care / Family Care features detect barking and crying for alerts.
- **Big question:** Is my TV watching me back?
- **Twist:** The proven part is arguably the bigger story. ACR, the TV recognising what's on screen and reporting it for ads, is a documented, opt-out feature on most smart TVs. The cheap TV is cheap partly because your viewing is the product. Reports say switching it off may not fully stop the telemetry (Northeastern University findings cited by All About Cookies).
- **So what:** Your TV recognises everything on screen, including what you watch through other devices → that becomes an ad profile → it's on by default unless you dig into "Viewing Information Services" → the soundbar claim, if it holds up, would extend that to sounds in your living room.
- **Thesis:** Everyone worries about the phone listening. This new teardown suggests the TV is the bigger data collector, recognising what you watch by default. That matters because it's on unless you switch it off, and the switch may not do everything it says.
- **Frame 0:** "Your TV knows what you're watching"
- **Hooks:** "Your TV doesn't have a microphone. A hacker says it found one anyway." / "Why is a smart TV so cheap? Because you're paying another way." / "One researcher cracked open his TV. Here's what it was sending home."
- **Real person:** @log4j (pseudonymous, so a weak fit for the owner's "real named person" taste). Samsung's statement is pending.
- **Share reason:** "Turn off Viewing Information Services" is a clear, sendable tip, and nearly everyone owns a smart TV.
- **Key image:** A cozy living room, family on the sofa, dog asleep. The TV screen quietly sends tiny postcards (film stills) up a chimney-pipe to a huge sorting office full of ad clerks. A dotted line runs from the soundbar with a question mark.
- **Evidence:** Weak to medium. ACR itself is well documented (Samsung support pages, past FTC cases against other makers). The soundbar-microphone and always-on claims are **unverified allegations from one pseudonymous researcher**. Code paths and event counters don't prove that audio left the TV.
- **Risks:** High. We could exaggerate or manufacture a villain. If picked, build it on documented ACR, present the mic claim strictly as an unconfirmed allegation, and get Samsung's response. It could fall apart within days.
- **Sources:**
  - TechRadar: https://www.techradar.com/televisions/a-hacker-claims-samsungs-smart-tv-software-is-doing-secret-reporting-and-looks-for-mics-on-connected-devices-but-this-doesnt-look-like-a-privacy-scandal-on-the-face-of-it
  - All About Cookies, 2026-10-26: https://allaboutcookies.org/samsung-tv-privacy-tracking-risks
  - Cybersecurity News: https://cybersecuritynews.com/researcher-root-samsung-smart-tv
  - SOFX: https://www.sofx.com/researcher-says-samsung-smart-tvs-may-use-connected-devices-to-collect-audio/

---

## 4. (Backup) Meta's glasses recorded conversations nobody asked them to

- **News:** Owners on Reddit reported Ray-Ban Meta glasses (2nd and 3rd gen) saving audio recordings and transcripts of ordinary conversations to the Meta AI app **without the "Hey Meta" wake phrase**, even with "Respond without Hey Meta" disabled, possibly after a firmware update. Meta told Android Authority (**13 Oct 2026**): "This issue has been resolved. People can manage, review and delete voice logs of their interactions with Meta AI via settings at any time." Meta didn't explain the cause or how many users were affected. Malwarebytes followed up on 20 Oct.
- **Twist:** A wake word isn't a switch on the microphone. The mic is always listening for the word, and one software update can change what counts as "heard it". The people recorded weren't the owners. They were the bystanders who never agreed to anything.
- **Frame 0:** "These glasses recorded without being asked"
- **Real person:** None named (an anonymous Reddit owner). Meta's statement is on record.
- **Evidence and risks:** Meta confirmed the problem and the fix. Its scale is unknown and probably small. About 14 days old. Weaker on freshness and consequence than 1-3.
- **Sources:** Android Authority, 2026-10-13: https://www.androidauthority.com/ray-ban-meta-glasses-listening-3722586/ · Malwarebytes, 2026-10-20: https://www.malwarebytes.com/blog/news/2026/10/meta-says-it-fixed-smart-glasses-unprompted-eavesdropping · TechSpot: https://www.techspot.com/news/114214-meta-smart-glasses-secretly-recording-conversations-without-wake.html

---

## Considered and dropped
- **Capcom ID breach** (disclosed 22 Oct, 11,774,247 records, mostly emails and login metadata; 196 accounts had their passwords changed): it's fresh and solid, but it's a standard breach with no surprising mechanism.
- **Ahold Delhaize / Albert Heijn / Giant cyberattack** (from 11 Oct): shops stayed open but apps and delivery were down for about a week, and experts estimate €120-150 M in lost revenue. It's too old and overlaps the round-1 "London power cut" story about a single point of failure.
- **PlayStation accounts hijacked "without password or 2FA"** (reports 26 Oct): unverified, and Sony is silent. An earlier May case was social engineering of support staff. Recheck in a few days.
- **Interpol AI-deepfake awareness campaign** (18 Oct) and voice-clone family scams: real, but evergreen with no new mechanism. The newest named victims date from early October or June.
- **Microsoft 365 token replay (Huntress, 79 orgs)**: too corporate.
- **University of Copenhagen "525,000 people" breach**: only one aggregator reports it and I couldn't confirm it.
