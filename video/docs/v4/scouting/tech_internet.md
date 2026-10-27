# V4 scouting: tech, internet, security and privacy

Scout run: 2026-10-27. Window searched: 2026-10-17 to 2026-10-27, with one older story kept because it is exceptional and still developing.
Hard exclusions checked: Anthropic and its products are not a key entity in any candidate, and none is about Google military AI or AI memory-chip prices. Three of the four are not AI stories; the WhatsApp one involves an AI chatbot, but it is a story about platform behaviour and privacy rights, which is a different kind of story from v2/v3.

Ranked by how well each fits the owner's taste (an everyday consequence, one real person, a concrete payoff on frame 0).

---

## 1. Hackers turned supermarket freezers into ovens

- **News:** On the night of **11 Oct 2026**, attackers took remote control of Danfoss refrigeration controllers in French supermarkets. They switched fridges and freezers to defrost and heated some units to **up to 50 °C** (the Les Mousquetaires figure). France's finance minister Roland Lescure told Parliament that **about 700 of France's ~10,000 supermarkets** were hit. Retailers reported their own counts: Intermarché/Netto 300 (AFP; Reuters says ~150), Coopérative U 80 of 2,000, Carrefour 80, Monoprix ~30. CERT-FR issued an alert on 12 Oct. The Paris prosecutor's cybercrime section (OFAC) and ANSSI are investigating. Sekoia says systems in Spain, Portugal, Poland, Germany and Belgium were also reportedly affected.
- **Twist:** Most of the hacked units were **models no longer supported by Danfoss**: the AK-SM 800 has been end-of-life since **May 2021** and the AK-SC 355 was phased out in **2016**. The fridge kept cooling for years after it stopped getting security fixes, because nobody replaces a fridge that still works. Claroty had warned in **August 2026** that "thousands" of these management panels could be reached from the internet. One caution: how the attackers got in is **not confirmed**.
- **So what:** Food was thrown away, and there were reports of fires. Intermarché's chief Thierry Cotillard expects losses of "tens of millions of euros" (paraphrased in reporting). Two stores in Haguenau alone lost €270,000 of stock. The everyday point: things you never think of as computers, like the fridge at the shop or the boiler at home, are online and can go years without updates.
- **Big question:** Is anything in my life *not* hackable now?
- **Thesis:** Everyone is talking about hackers stealing data, but this attack reveals that the most vulnerable computers are the boring old boxes nobody updates, which matters because a 10-year-old fridge controller can throw away a supermarket's food overnight.
- **Frame 0 text:** "Hackers turned 700 supermarket fridges into ovens"
- **Hooks:**
  1. "Someone hacked the freezers at 700 supermarkets. And heated them to fifty degrees."
  2. "The most dangerous computer in the supermarket isn't the till. It's the fridge."
  3. "This fridge stopped getting security updates in 2016. Last week, it got hacked."
- **Real person:** ministers and retail chiefs are quoted, but **only in paraphrase**. The only verbatim quotes are from Danfoss statements: "aware of incidents in France affecting a limited number of refrigeration management systems" (to Reuters). Before scripting, find a direct quote from Cotillard, Schelcher or Lescure in French press (AFP or Le Parisien).
- **Share reason:** it is absurd and easy to picture ("they made the freezers hot"), and it leaves people asking "is my smart thermostat like that?"
- **Key image:** a dense, lively French supermarket at night. A wide shot runs down the aisles of glowing freezer cases, and every temperature display ticks up from −18 to +50. Frost melts and ice cream slumps. Zoom out to a map of France as 700 little shop roofs light up red one by one.
- **Evidence:** strong on what happened (French government, CERT-FR, AFP, Reuters, retailer counts). Disputed: store counts (400+ vs ~700), the total losses (not tallied) and the entry route (unknown). No group has claimed the attack.
- **Risks:** freshness. The attack is about **16 days old**, past the 72 h ideal, though the investigation is ongoing. Do not claim default passwords or name a culprit. Danfoss must not become the villain: the units were past end-of-life. Spoken temperatures must be in °C, or given both ways.
- **Sources:**
  - CNN, 2026-10-12: https://www.cnn.com/2026/10/12/europe/france-supermarket-cyberattack-fridges-intl
  - AP (via KSAT), 2026-10-13: https://www.ksat.com/business/2026/10/13/cyberattack-targeting-refrigeration-systems-hits-700-supermarkets-french-government-says/
  - ITV, 2026-10-13: https://www.itv.com/news/2026-10-13/cyberattack-hits-700-supermarkets-in-france-sparking-investigation
  - NBC News: https://www.nbcnews.com/world/europe/hackers-heat-french-supermarket-fridges-sparking-fires-spoiling-food-rcna603151
  - The Hacker News, 2026-10-13: https://thehackernews.com/2026/10/attackers-heat-french-supermarket.html

---

## 2. WhatsApp's help pages told its AI helper not to tell you your rights

- **News:** The privacy firm **Redact** (founder and CEO **Dan Saltman**) examined all **545 pages** linked from WhatsApp's help centre. On **8 Oct 2026** it found **102 hidden instruction blocks on 80 pages**. The text sat in the page code, invisible to readers, and was meant for WhatsApp's AI support chatbot. The block on the account-deletion page told the bot **not to recommend a data protection authority or regulator** and not to suggest WhatsApp could delete an account manually. The block on the reporting page applied when users mentioned lawyers or courts: it barred the bot from citing GDPR, LGPD or CCPA, even when the user raised them. Archived copies show the deletion instruction was live by **4 Sep**. All 102 blocks were gone by **18 Oct**. WIRED and others reported the story on **20-21 Oct**.
- **Twist:** WhatsApp's own EU privacy policy tells users they *can* complain to Ireland's Data Protection Commission. So the published policy and the chatbot were working from opposite instructions. WhatsApp says a **bug** exposed instructions meant only for its bot, and that support bots "should provide relevant help about the service and avoid offering legal advice."
- **So what:** More and more of the time, the "help" you get from an app is an AI. That AI follows instructions you can't see, and those instructions decide what it will and won't tell you, including that you have a right to complain. Under GDPR Article 77, anyone in the EU can complain to a data protection authority for free.
- **Big question:** When I ask an app's chatbot for help, whose side is it on?
- **Thesis:** Everyone is talking about AI chatbots giving wrong answers, but these hidden WhatsApp instructions reveal that a support bot can be told *not* to give certain right answers, which matters because the bot may leave out the one option that actually solves your problem: your right to complain.
- **Frame 0 text:** "WhatsApp's help bot was told: don't mention regulators"
- **Hooks:**
  1. "WhatsApp's help pages had secret notes. Not for you. For the AI that answers you."
  2. "Ask WhatsApp's AI how to delete your data, and it had one rule: don't mention who you can complain to."
  3. "Your right to complain was written in the policy. And erased from the chatbot."
- **Real person:** Dan Saltman, Redact. He is named in every report, but no verified verbatim quote turned up in the sources fetched; one secondary source has "instructions to our chatbot, not directly to users" and attributes it to Saltman. Check WIRED's original before using it.
- **Share reason:** it feels like being let in on a secret, and the practical tip ("you can complain for free, here's how") is worth saving.
- **Key image:** a cosy help desk inside a giant phone. A small friendly robot clerk sits behind the counter while a visitor asks a question. Behind the robot hangs a huge, dense wall of invisible sticky notes. A UV torch sweeps across, and the notes glow: "don't mention regulator", "don't cite GDPR".
- **Evidence:** solid that the blocks existed: Redact's analysis, WhatsApp's confirmation to WIRED, archive copies. **No regulator action** has been reported. Meta's explanation (a bug exposed internal instructions) is plausible and must be stated fairly.
- **Risks:** the core discovery dates from 8 Oct and the reporting from 20-21 Oct, about a week ago, so freshness is acceptable rather than great. This story invites a manufactured-villain framing; keep it to "here's what it said, here's what Meta says". It brushes AI, but it is a platform-trust story, not like v2/v3. It does not involve Anthropic.
- **Sources:**
  - CyberInsider, 2026-10-20: https://cyberinsider.com/whatsapp-told-its-ai-chatbot-not-to-mention-privacy-regulators/
  - GIGAZINE, 2026-10-21: https://gigazine.net/gsc_news/en/20261021-whatsapp-hidden-ai-instructions/
  - eSecurity Planet: https://www.esecurityplanet.com/news/news-whatsapp-hidden-ai-instructions-privacy-complaints/
  - Notebookcheck: https://www.notebookcheck.net/WhatsApp-help-pages-told-its-AI-not-to-mention-privacy-regulators.1428920.0.html
  - Original reporting cited by others: WIRED (find the URL before scripting)

---

## 3. The padlock in your browser was protected by the number 4

- **News:** On **17 Oct 2026**, researchers reported that **eight intermediate certificate-authority keys** belonging to eMudhra, an Indian company that vouches for websites, were trivially weak. The private keys were tiny numbers. Researcher **Scott Helme** wrote: **"One of eMudhra's certificate authority private keys is the number 4"**; others were 56 and 115. He recovered all eight from public certificates in under a second. The keys had been exposed since about **April 2025**. Mozilla and Google confirmed the problem on **20 Oct**. Chrome, Firefox, Apple and Microsoft **blocked the certificates as an emergency measure**, and Go, Node.js, Python certifi and Rust webpki-roots shipped fixes. Tracked as **CVE-2026-111943**. eMudhra blames a flaw in its key-generation ceremony, which produced a second, weak set of keys.
- **Twist:** The padlock does not mean "this website is safe". It means "a company you've never heard of vouches for this website". There are dozens of those companies, and any one of them can vouch for *any* site. A forger holding these keys could have made a convincing fake of almost any site. Helme's tests showed curl, Python, Node, Go and Java accepted a forged certificate for Stripe's API.
- **So what:** There is **no evidence of exploitation**, and updated browsers are now protected. The everyday lesson is simple: update your browser and apps. A padlock is only as strong as the weakest of the companies that hand them out.
- **Big question:** What does the padlock in my browser actually mean?
- **Thesis:** Everyone trusts the little padlock, but this eMudhra failure reveals that the padlock rests on a few dozen companies' secret numbers (one of which was "4"), which matters because one careless company could have let anyone fake your bank's website, and updating is what protects you.
- **Frame 0 text:** "The lock on your bank's website was '4'"
- **Hooks:**
  1. "The secret behind that little padlock is meant to be a number with hundreds of digits. One of them was four."
  2. "For 18 months, anyone could have faked a 'secure' website. The key was the number 4."
  3. "You check for the padlock. Here's who's actually holding the key."
- **Real person:** Scott Helme, security researcher. The quote "One of eMudhra's certificate authority private keys is the number 4" is verbatim as reported by CoinDesk.
- **Share reason:** "the password was 4" is an irresistible fact to repeat, and the video teaches a genuinely useful mental model of the padlock.
- **Key image:** a huge city of websites, each house with a padlock on its door. The camera pulls back to reveal that every padlock hangs from strings running up to a few dozen key-keepers in towers above the city. One tower's giant vault door is held shut by a tiny "4" on a sticky note.
- **Evidence:** strong. Mozilla and Chrome root programs, a Cloudflare blog post, BleepingComputer, CoinDesk and The Hacker News all report it. The weak points: researcher attribution is mixed ("Wayne" reported it, Helme recovered the keys independently), and eMudhra says none of the eight intermediates issued end-entity certificates.
- **Risks:** it is abstract, so the payoff has to be made physical. There is a danger of overstating: **no one was harmed**, and the honest arc is "a near miss, fixed in days". The "18 months" exposure window comes from Helme's analysis, so attribute it. The consumer action (update) is a bit generic.
- **Sources:**
  - CoinDesk, 2026-10-21: https://www.coindesk.com/tech/2026/10/21/a-company-that-vouches-for-websites-had-secret-keys-so-weak-that-8-of-them-were-cracked
  - Cloudflare blog: https://blog.cloudflare.com/emudhra-certificate-compromise/
  - BleepingComputer: https://www.bleepingcomputer.com/news/security/mozilla-google-apple-block-compromised-emudhra-ca-certificates/
  - The Hacker News, 2026-10: https://thehackernews.com/2026/10/eight-emudhra-ca-keys-compromised.html

---

## 4. A crypto-wallet maker has to destroy 18,835 brand-new devices because of one stolen key

- **News:** Hardware-wallet maker **Keystone** detected an intrusion on its website on **20 Oct 2026**, confirmed it on **23 Oct**, and disclosed the full scope on X on **26 Oct**. The attacker got in through a flaw in a third-party monitoring tool and stole the **"WebAuth" key**, the secret that lets a device prove it is a genuine Keystone. The key is **written into each device at the factory and cannot be erased or rewritten**, so Keystone will **destroy 18,835 unsold devices** that carry it. The attacker also took buyer data: **25,964 records** with names, addresses and orders, plus **12,873** abandoned-checkout records. Keystone says seed phrases, private keys and payment data were not exposed. Website orders have moved to pre-order.
- **Twist:** Nothing is wrong with the 18,835 devices themselves; they are untouched in a warehouse. They are worthless because the *secret that proves they are real* has leaked, so anyone holding it could build a fake that passes the "genuine" check. What a "genuine" device really proves is that someone else's secret was kept.
- **So what:** Anyone buying security hardware now faces a second danger: a convincing fake, plus phishing aimed at the leaked buyer addresses. Keystone's own advice is to ignore any "asset migration" or "wallet verification" message, and it says it will never ask you to send a device back.
- **Big question:** How do I know the thing I bought is real?
- **Thesis:** Everyone thinks a hack means stolen data, but Keystone's breach reveals that stealing one secret can turn 18,835 perfectly good new devices into scrap, which matters because "genuine" is only as trustworthy as the company's ability to keep a single key.
- **Frame 0 text:** "18,835 brand-new wallets, about to be destroyed"
- **Hooks:**
  1. "These 18,835 devices have never been used. And they're all getting destroyed."
  2. "Hackers didn't touch a single wallet. They stole the thing that proves a wallet is real."
  3. "One stolen secret, and a warehouse full of brand-new tech becomes scrap."
- **Real person:** none named. Keystone's statement opens with "We owe you an apology" (a company voice, not a person).
- **Share reason:** the waste is striking, and crypto holders will forward the scam warning.
- **Key image:** a vast, dense warehouse of identical little boxes stacked to the ceiling, with forklifts and workers moving between them. Every box glows with a tiny "genuine" seal, and the seals flicker out shelf by shelf. In the cosy version, a buyer at a kitchen table can't tell whether the device in their hands is real.
- **Evidence:** the freshest candidate (disclosed 26 Oct, reported 27 Oct), consistent across Cointelegraph, crypto.news, Bitcoin.com, Blockhead and FinanceFeeds. Primary source: Keystone's statement on X. Mostly crypto-trade press, though The Hacker News also covered it.
- **Risks:** a crypto niche, which narrows relevance and is far from the everyday wallet. There is no named person. Don't imply anyone lost funds; none is reported.
- **Sources:**
  - Blockhead, 2026-10-27: https://www.blockhead.co/2026/10/27/keystone-to-destroy-18-835-hardware-wallets-after-attacker-steals-device-authentication-key/
  - Cointelegraph: https://cointelegraph.com/news/keystone-breach-deepens-hackers-stole-key-used-to-verify-wallets-as-genuine
  - crypto.news: https://crypto.news/keystone-to-destroy-18835-hardware-wallets-after-authentication-key-breach/
  - Bitcoin.com News: https://news.bitcoin.com/security/keystone-breach-deepens-18835-crypto-hardware-wallets-face-destruction/

---

## Considered and dropped
- **PHP2Shell / "Black October":** v1 territory, so not repeated.
- **"Researchers breach Anthropic's systems in 12 h":** excluded, because Anthropic is the key entity.
- **University of Copenhagen breach (525,000 people, from a test environment, 27 Oct):** real, but a routine breach with local relevance.
- **South Korean man arrested for an AI-assisted breach of 90 organisations and 8.2 M records (27 Oct):** one source only so far, and an AI story.
- **Instagram testing 90-minute horizontal "Features" (26 Oct):** a product test with no real "so what".
- **"Australia takes over the Amadey backend, 180,000 PCs":** a The Hacker News headline that searches could not corroborate (the earlier June Europol action counted 140,000 machines). Unverified, so dropped.
