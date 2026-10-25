exec(open('lob2.py').read().split("b=(900")[0])
b=(900,1115.4)
bit=(489,1068,516,1100)
for hx in (432,437):
  for rise,fall,dc1,dc2 in [(400,220,-20,-51),(420,230,-30,-51),(440,240,-35,-60),(420,220,-40,-51)]:
    run2((hx,1228),b,rise,fall,dc1,dc2,bit,dur=0.55)
