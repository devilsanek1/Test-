const {random} = require('/home/user/Test-/video/node_modules/remotion');
class R{constructor(s){this.s=s;this.i=0}next(){return random(`${this.s}#${this.i++}`)}range(a,b){return a+(b-a)*this.next()}pick(a){return a[Math.floor(this.next()*a.length)%a.length]}weighted(items){const tot=items.reduce((s,[,w])=>s+w,0);let x=this.next()*tot;for(const [v,w] of items){if((x-=w)<=0)return v}return items[items.length-1][0]}}
const P={ink:'#2B1B0A',tan:'#BA977E',brown:'#88652F',teal:'#547977',tealDark:'#3E605F',sage:'#6D988B',sand:'#D9BBA1',cream:'#F3E0CB',peach:'#F6B892',white:'#FFFFFF'};
const N=Object.fromEntries(Object.entries(P).map(([k,v])=>[v,k]));
const BODIES=[P.sand,P.tan,P.cream,P.sage,P.teal,P.brown,P.peach,P.sand,P.teal];
const HAIR=[P.tan,P.tan,P.brown,P.brown,P.sand,P.ink,P.ink,P.tealDark];
const KH=[['short',5],['long',2.2],['bun',1],['cap',1],['beanie',0.9],['curly',1.2]];
function kp(seed,hair,body){const r=new R(`person/${seed}`);r.next();r.next();r.next();const style=hair??r.weighted(KH);const coat=body??r.pick(BODIES);let hc=r.pick(HAIR);if(hc===coat)hc=hc===P.ink?P.tan:P.ink;return {style,coat:N[coat],hc:N[hc]}}
const mode=process.argv[2];
if(mode==='msg'){for (const s of ['s5msg','msg','msg1']) console.log(s, kp(s,'short',P.teal));}
if(mode==='cit'){const out=[];for(let i=0;i<60;i++){const s='fc'+i;const k=kp(s);out.push(s+':'+k.style+'/'+k.hc+'/'+k.coat)};console.log(out.join(' '))}
if(mode==='mk'){for(let i=0;i<30;i++){const s='fm'+i;const hair=new R(`mk/${s}`).pick(['short','bun','curly','short']);const k=kp(s,hair,P.teal);console.log(s,hair,k.hc)}}
if(mode==='onl'){for(let i=0;i<30;i++){const s='fo'+i;const hair=new R(`onl/${s}`).pick(['short','short','long','bun','curly','beanie']);const coat=null;console.log(s,hair)}}
if(mode==='seed'){const [_,__,___,s,hair,body]=process.argv;console.log(kp(s,hair==='-'?undefined:hair,body?P[body]:undefined))}
if(mode==='list'){const items=JSON.parse(process.argv[3]);for(const [s,hair,body] of items){const k=kp(s,hair,P[body]);console.log(s,hair,body,'->',k.hc)}}
