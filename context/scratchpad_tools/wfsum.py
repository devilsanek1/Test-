import json,sys
lab={}; done=set()
for line in open(sys.argv[1]):
    try: e=json.loads(line)
    except: continue
    if e.get('type')=='started': lab[e['key']]=e.get('label'); continue
    if e.get('type')=='result':
        done.add(e['key'])
        l=lab.get(e['key'],'?'); r=e.get('result')
        if isinstance(r,dict) and 'score' in r:
            fs=r.get('findings',[])
            extra=f" pass={r['pass']}" if 'pass' in r else f" gate={r.get('gate_pass')}"
            print(f"{l}: {r['score']}{extra} maj={sum(1 for f in fs if f['severity']!='minor')} min={sum(1 for f in fs if f['severity']=='minor')}")
            for f in fs:
                if f['severity']!='minor': print('    ',f['severity'],f['at'][:50],'|',f['problem'][:220])
        else: print(f"{l}: done ({str(r)[:160]})")
    elif e.get('type') not in ('launched',): print(e.get('type'), str(e)[:300])
for k,l in lab.items():
    if k not in done: print('RUNNING', l)
