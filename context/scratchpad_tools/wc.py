import re
s = """Government websites in four countries just switched themselves off.|Nobody hacked them.|They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites.|Fixing a bug like that takes two steps.|First, you find it.|Then, you fix it everywhere.|You'd think finding it is the hard part, right?|And for 14 years, nobody did.|Then, in August, two security teams using AI tools found it and quietly told the people who make PHP so a fix could be ready before anyone else knew.|Except, the details of the bug leaked online hours before the fix came out.|Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45 minutes, and millions by evening.|Nobody knows yet how many got in.|So now comes step two, the slow one.|Someone has to install that fix on every site, and there are about 22 million copies of PHP out there that could be hit.|If a site can't update fast enough, the safest thing is to switch it off until it can.|That's what those government sites did.|And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore.|For those, it's switch off or hope the hosting company sorts it out."""
# spoken words: numbers spelled out as in annotated
spoken = {"7":"seven","10":"ten","14":"fourteen","45":"forty-five","22":"twenty-two"}
tot=0
sents=s.split("|")
allw=sum(len(x.split()) for x in sents)
print("total words", allw)
rate=allw/78.0
for i,x in enumerate(sents,1):
    n=len(x.split())
    start=tot/rate; tot+=n; end=tot/rate
    print(f"S{i:02d} {n:3d}w  {start:5.1f}-{end:5.1f}s  {x}")
