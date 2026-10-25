beats = """Governments across Europe just switched off their own websites. On purpose.
Blame a flaw that lets a stranger take over a website. No password needed.
It's in PHP. The language everyone loves. It runs about seven in ten websites.
AI helped researchers find it, and they told PHP in secret, so the fix would be ready before attackers knew.
Except word leaked early. Attackers were trying it before the fix was even out.
Once it went public, Cloudflare saw tens of thousands of attempts in forty-five minutes. Within a day, millions.
But PHP can't push the fix out like a phone update. Whoever runs each server has to install it.
A day later, one scan found ninety-nine in a hundred still hadn't.
And about half of PHP sites run versions so old, PHP doesn't even support them anymore.
So the FBI's advice was blunt: can't update yet? Take it offline.
Which is why, for a lot of websites this week, the safest setting is off.""".split("\n")
tot=0
rate=174/60
for b in beats:
    n=len(b.split()); s=tot/rate; tot+=n; e=tot/rate
    print(f"{n:3d}w {s:5.1f}-{e:5.1f}s {b}")
print("total",tot, "secs@174", round(tot/rate,1), "secs@165", round(tot/(165/60),1))
