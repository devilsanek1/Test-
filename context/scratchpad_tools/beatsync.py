import json,re
ROOT='/home/user/Test-/video'
SB=json.load(open(f'{ROOT}/docs/storyboard.json')); TM=json.load(open(f'{ROOT}/assets/timing.json'))
W=TM['words']
def norm(t): return re.sub(r"[^a-z0-9'\-]","",t.lower().replace('’',"'")).strip("'-")
wn=[norm(w['w']) for w in W]
for s in SB['scenes']:
  for b in s['beats']:
    q=re.findall(r"'([^']+?)'(?=[\s:,.;)]|$)", b['action'].replace("can't","can’t").replace("don't","don’t").replace("it's","it’s").replace("That's","That’s").replace("You'd","You’d"))
    for qq in q:
      toks=[norm(x) for x in qq.split() if norm(x)]
      if not toks: continue
      # strip leading '-' fragments like '-selves'
      best=None
      for i in range(len(W)-len(toks)+1):
        if wn[i:i+len(toks)]==toks or (len(toks)==1 and toks[0] and (wn[i].startswith(toks[0]) or toks[0] in wn[i])):
          d=b['t']-W[i]['s']
          if best is None or abs(d)<abs(best[0]): best=(d,i)
      if best is None: 
        print(f"{s['id']} t={b['t']:.2f} quote '{qq}' -> NOT A VO WORD"); continue
      d,i=best
      flag=''
      if d>0.15: flag='LATE'
      elif d<-0.30: flag='EARLY'
      if abs(d)>2: flag='FAR?'
      print(f"{s['id']} t={b['t']:.2f} '{qq}' word#{i} {W[i]['w']} s={W[i]['s']:.3f} off={d:+.3f} {flag}")
