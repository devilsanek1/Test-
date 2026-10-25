const hidden=36.915-34.483, land=38.555-34.483;
function cruise(acc,dec){ // trapezoid velocity
  return (x)=>{const v=1/(1-acc/2-dec/2); if(x<acc) return v*x*x/(2*acc); if(x<1-dec) return v*(acc/2 + (x-acc)); const y=1-x; return 1 - v*y*y/(2*dec);};
}
const rev=cruise(0.25,0.35);
for (let t=2.40;t<=4.1;t+=1/30){const q=Math.min(1,Math.max(0,(t-hidden)/(land-hidden)));const u=rev(q);const zoom=Math.exp(Math.log(6)*(1-u));const ay=1305+(1464.5-1305)*u;const cy=1464.5-(ay-960)/zoom;
const row1top=1213.2; const s1=(row1top-cy)*zoom+960;
console.log(t.toFixed(3),(t*30).toFixed(0),zoom.toFixed(3),cy.toFixed(1),'row1top screen',s1.toFixed(0));}
