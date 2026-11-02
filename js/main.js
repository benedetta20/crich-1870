/* Crich 1870 — interazioni, scene 3D (colazione, linea Gran Merenda, studio prodotti), globo, contatti */
(()=>{
'use strict';
const root=document.documentElement;
root.classList.remove('no-js');root.classList.add('js');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer: fine)').matches;
if(!reduce) root.classList.add('motion');
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, seg=(v,a,b)=>clamp((v-a)/(b-a));
const eOut=t=>1-Math.pow(1-t,3), eIn=t=>t*t*t, eIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const back=t=>{const c1=1.5,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
let vw=innerWidth, vh=innerHeight, mobile=vw<760;

/* WebGL availability */
let gl=false;
try{const c=document.createElement('canvas');gl=!!window.THREE&&!!(c.getContext('webgl')||c.getContext('experimental-webgl'));}catch(e){gl=false}
if(gl) root.classList.add('gl');

/* Toast */
const toastEl=$('#toast');let toastT;
function toast(m){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove('on'),3400)}
$$('[data-toast]').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.toast)));

/* Curtain + intro */
let first=true;try{first=!sessionStorage.getItem('crich-intro');sessionStorage.setItem('crich-intro','1')}catch(e){}
const curtain=$('#curtain');let introAt=performance.now()+200;
if(!first||reduce){curtain.remove();requestAnimationFrame(()=>document.body.classList.add('ready'))}
else{introAt=performance.now()+1250;setTimeout(()=>{curtain.classList.add('up');document.body.classList.add('ready')},1250);setTimeout(()=>curtain.remove(),2400)}
$('#hintTxt').textContent='Scorri: dalla colazione alla linea di produzione';

/* Menu */
const menu=$('#menu'),menuBtn=$('#menuBtn');menu.inert=true;
function setMenu(o){menu.classList.toggle('open',o);menuBtn.setAttribute('aria-expanded',o);menu.inert=!o;document.body.classList.toggle('lock',o);if(o)$('#menuClose').focus();else menuBtn.focus()}
menuBtn.addEventListener('click',()=>setMenu(true));
$('#menuClose').addEventListener('click',()=>setMenu(false));
$$('#menu a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menu.inert=true;menuBtn.setAttribute('aria-expanded',false);document.body.classList.remove('lock')}));
addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open'))setMenu(false)});

/* Statement words */
const st=$('#statement');let words=[];
(()=>{const t=st.textContent.trim();st.innerHTML='<span class="sr">'+t+'</span>'+t.split(/\s+/).map(w=>'<span class="sw" aria-hidden="true">'+w+'</span>').join(' ');words=$$('.sw',st)})();

/* Counters */
const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;io.unobserve(en.target);const el=en.target,to=+el.dataset.count;if(reduce||el.dataset.plain){el.textContent=to;return}const from=0,t0=performance.now(),d=1400;(function f(n){const k=eOut(clamp((n-t0)/d));el.textContent=Math.round(lerp(from,to,k));if(k<1)requestAnimationFrame(f)})(t0)}),{threshold:.6});
$$('[data-count]').forEach(el=>io.observe(el));
const ring=$('#ring');
new IntersectionObserver((es,o)=>es.forEach(en=>{if(!en.isIntersecting)return;o.disconnect();if(reduce){ring.style.setProperty('--p',34);return}const t0=performance.now();(function f(n){const k=eOut(clamp((n-t0)/1600));ring.style.setProperty('--p',(34*k).toFixed(1));if(k<1)requestAnimationFrame(f)})(t0)}),{threshold:.5}).observe(ring);
const wm=$('#wordmark');$$('span',wm).forEach((s,i)=>s.style.transitionDelay=(i*.07)+'s');
new IntersectionObserver((es,o)=>es.forEach(en=>{if(en.isIntersecting){wm.classList.add('in');o.disconnect()}}),{threshold:.3}).observe(wm);

/* Layout measures */
const T={};
const proc=$('#processo'),hz=$('#prodotti'),track=$('.hz-track'),story=$('#storia');
let hzOn=false;
function measure(){
  vw=innerWidth;vh=innerHeight;mobile=vw<760;
  hzOn=!reduce&&!mobile;
  if(hzOn){hz.style.height=(track.scrollWidth-vw+vh)+'px'}else{hz.style.height='';track.style.transform=''}
  const top=el=>el.getBoundingClientRect().top+scrollY;
  T.proc=top(proc);T.procH=proc.offsetHeight;T.hz=top(hz);T.hzH=hz.offsetHeight;T.story=top(story);T.storyH=story.offsetHeight;
  T.sections=$$('main section[id]').map(s=>({id:s.id,top:top(s),h:s.offsetHeight}));
}

/* Header + nav state */
const header=$('#top'),progress=$('#progress'),navLinks=$$('.nav a');const wheat=$('#wheat');let lastY=scrollY;
function headerUpd(y){
  header.classList.toggle('solid',y>vh*.5);
  if(y>lastY+4&&y>vh*.6&&!menu.classList.contains('open'))header.classList.add('hide');
  else if(y<lastY-4)header.classList.remove('hide');
  const max=document.documentElement.scrollHeight-vh;progress.style.transform='scaleX('+clamp(y/max)+')';
  let cur='';for(const s of T.sections){if(y+vh*.4>=s.top&&y+vh*.4<s.top+s.h)cur=s.id}
  navLinks.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+cur));
}

/* Statement */
function statementUpd(){
  if(reduce)return;const r=st.getBoundingClientRect();const p=clamp((vh*.88-r.top)/(r.height+vh*.35));const n=words.length;
  for(let i=0;i<n;i++){words[i].style.opacity=(.16+.84*clamp(p*n*1.15-i)).toFixed(2)}
}

/* Horizontal products */
const hzBar=$('.hz-bar i');
function hzUpd(y){if(!hzOn)return;const p=clamp((y-T.hz)/(T.hzH-vh));track.style.transform='translate3d('+(-p*(track.scrollWidth-vw)).toFixed(1)+'px,0,0)';hzBar.style.transform='scaleX('+p+')'}

/* Story */
const stops=$$('.tl li'),yearEl=$('#year'),dial=$('.dial'),tlNav=$('.tl-nav');let sIdx=0;
stops.forEach((li,i)=>{const b=document.createElement('button');b.type='button';b.textContent=li.dataset.year;b.setAttribute('aria-label','Vai al '+li.dataset.year);b.addEventListener('click',()=>{const target=T.story+(T.storyH-vh)*((i+.5)/stops.length);scrollTo({top:target,behavior:reduce?'auto':'smooth'})});tlNav.appendChild(b)});
const tlBtns=$$('button',tlNav);
function setStop(i){sIdx=i;stops.forEach((l,j)=>l.classList.toggle('on',j===i));tlBtns.forEach((b,j)=>b.setAttribute('aria-current',j===i));yearEl.textContent=stops[i].dataset.year}
setStop(0);
function storyUpd(y){if(reduce)return;const p=clamp((y-T.story)/(T.storyH-vh));const i=Math.min(stops.length-1,Math.floor(p*stops.length));if(i!==sIdx)setStop(i);dial.style.transform='rotate('+(p*300-20).toFixed(1)+'deg)';dial.style.filter='sepia('+((1-p)*.9).toFixed(2)+') saturate('+(.75+p*.35).toFixed(2)+') contrast('+(1.05-.05*p).toFixed(2)+')'}
if(reduce){dial.style.filter='none'}

/* ---------- Contact ---------- */
const PROFILES={
  consumatore:{l:'Consumatore',s:'Domande su un prodotto',office:'Servizio consumatori',b2b:false,needs:['Informazioni su un prodotto','Ingredienti e allergeni','Dove trovarlo','Altro']},
  gdo:{l:'Buyer GDO',s:'Supermercati e catene',office:'Ufficio commerciale Italia',b2b:true,needs:['Listino e referenze Crich','Nuovo inserimento','Promozioni e attività in negozio']},
  pl:{l:'Private label',s:'Il tuo marchio, la nostra ricetta',office:'Ufficio private label',b2b:true,needs:['Sviluppo di una nuova ricetta','Produzione su ricetta esistente','Formati, packaging e volumi']},
  horeca:{l:'Ho.Re.Ca.',s:'Hotel, bar, ristoranti',office:'Ufficio Ho.Re.Ca.',b2b:true,needs:['Catalogo Ho.Re.Ca.','Formati e confezioni','Campionatura']},
  export:{l:'Distributore estero',s:'Importatori e grossisti',office:'Export office',b2b:true,needs:['Diventare distributore','Catalogo in inglese','Incontro in fiera']},
  stampa:{l:'Stampa',s:'Giornalisti e media',office:'Comunicazione',b2b:false,needs:['Materiali stampa','Intervista','Storia e archivio']}
};
const CATS={generale:'Generale',horeca:'Ho.Re.Ca.',sg:'Senza glutine',bio:'Biologico'};
const form=$('#cform'),steps=$$('fieldset',form),optP=$('#optProfile'),optN=$('#optNeed'),catBox=$('#catChecks');
let S={profile:null,need:null,step:1};
function goStep(n,focus=true){S.step=n;steps.forEach(f=>f.hidden=+f.dataset.step!==n);$('#done').hidden=true;$('#stepLbl').textContent='Passo '+n+' di 3';$('#sbar').style.width=(n/3*100)+'%';if(focus){const lg=steps[n-1].querySelector('legend');lg.setAttribute('tabindex','-1');lg.focus({preventScroll:true})}}
Object.entries(PROFILES).forEach(([k,p])=>{const b=document.createElement('button');b.type='button';b.className='opt';b.dataset.k=k;b.setAttribute('aria-pressed','false');b.innerHTML=p.l+'<small>'+p.s+'</small>';b.addEventListener('click',()=>{selectProfile(k);goStep(2)});optP.appendChild(b)});
function selectProfile(k){S.profile=k;S.need=null;$$('.opt',optP).forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k));const p=PROFILES[k];optN.innerHTML='';p.needs.forEach(n=>{const b=document.createElement('button');b.type='button';b.className='opt';b.textContent=n;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{S.need=n;$$('.opt',optN).forEach(x=>x.setAttribute('aria-pressed',x===b));$('#needErr').textContent=''});optN.appendChild(b)});catBox.hidden=!p.b2b;$('#fCompany').style.display=p.b2b?'':'none';$('#fc').required=p.b2b}
$('#toStep3').addEventListener('click',()=>{if(!S.need){$('#needErr').textContent='Scegli un’opzione per continuare.';return}goStep(3)});
$$('[data-back]',form).forEach(b=>b.addEventListener('click',()=>goStep(S.step-1)));
function setErr(id,msg){const el=$('#'+id),e=$('#'+id+'-e');e.textContent=msg||'';el.setAttribute('aria-invalid',msg?'true':'false');return !msg}
form.addEventListener('submit',e=>{e.preventDefault();const p=PROFILES[S.profile];let ok=true;
  ok=setErr('fn',$('#fn').value.trim().length<2?'Scrivi nome e cognome.':'')&&ok;
  if(p.b2b) ok=setErr('fc',$('#fc').value.trim()?'':'Indica l’azienda: serve per smistare la richiesta.')&&ok;
  ok=setErr('fe',/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('#fe').value.trim())?'':'Controlla l’email: manca qualcosa.')&&ok;
  ok=setErr('fpr',$('#fpr').checked?'':'Serve il consenso per poterti ricontattare.')&&ok;
  if(!ok){const bad=form.querySelector('[aria-invalid="true"]');bad&&bad.focus();return}
  const cats=$$('input:checked',catBox).map(i=>CATS[i.value]);
  $('#summary').innerHTML='<li><b>Arriva a:</b> '+p.office+'</li><li><b>Profilo:</b> '+p.l+'</li><li><b>Richiesta:</b> '+S.need+'</li>'+(cats.length?'<li><b>Cataloghi:</b> '+cats.join(', ')+'</li>':'');
  steps.forEach(f=>f.hidden=true);$('#done').hidden=false;$('#stepLbl').textContent='Fatto';$('#sbar').style.width='100%';$('#done').focus();
});
$('#again').addEventListener('click',()=>{form.reset();$('#fp').value='Italia';S={profile:null,need:null,step:1};$$('.opt',optP).forEach(b=>b.setAttribute('aria-pressed','false'));goStep(1)});
function preselect(k,cat){selectProfile(k);if(cat){const i=catBox.querySelector('input[value="'+cat+'"]');if(i)i.checked=true}goStep(2,false);$('#contatti').scrollIntoView({behavior:reduce?'auto':'smooth'});setTimeout(()=>{const f=optN.querySelector('.opt');f&&f.focus({preventScroll:true})},reduce?50:900)}
$$('[data-profile]').forEach(b=>b.addEventListener('click',()=>preselect(b.dataset.profile)));
$$('[data-cat]').forEach(b=>b.addEventListener('click',()=>preselect(b.dataset.cat==='horeca'?'horeca':'gdo',b.dataset.cat)));

/* ---------- Globe (2D canvas, 3D projection) ---------- */
const gcv=$('#globe'),gx=gcv.getContext('2d'),gwrap=$('#globeWrap');
const GP=[];const NG=1300;for(let i=0;i<NG;i++){const y=1-(i/(NG-1))*2,r=Math.sqrt(1-y*y),th=i*2.399963;GP.push([Math.cos(th)*r,y,Math.sin(th)*r])}
const ll=(la,lo)=>{la*=Math.PI/180;lo*=Math.PI/180;return[Math.cos(la)*Math.sin(lo),Math.sin(la),Math.cos(la)*Math.cos(lo)]};
const MK=[{n:'Zenson di Piave',p:ll(45.68,12.5),home:1,lx:-12,ly:20,al:'right'},{n:'Bucarest',p:ll(44.43,26.1),lx:10,ly:16,al:'left'},{n:'Amsterdam',p:ll(52.37,4.9),lx:-10,ly:-8,al:'right'},{n:'Dubai',p:ll(25.2,55.27),lx:10,ly:4,al:'left'}];
let grot=-0.38,gvel=0,gvis=false,gdrag=false,gx0=0,gsize=0;const tilt=.62;
let COL={};
function readCols(){const cs=getComputedStyle(root);COL={ink:cs.getPropertyValue('--ink').trim(),accent:cs.getPropertyValue('--accent').trim(),gold:cs.getPropertyValue('--gold').trim(),bg:cs.getPropertyValue('--bg').trim(),oven:cs.getPropertyValue('--oven').trim()}}
readCols();matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{readCols()});
function gsizeUpd(){const r=gwrap.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);gsize=r.width;gcv.width=r.width*d;gcv.height=r.width*d;gx.setTransform(d,0,0,d,0,0)}
function proj(v){const c=Math.cos(grot),s=Math.sin(grot);const x=v[0]*c-v[2]*s,z1=v[0]*s+v[2]*c;const ct=Math.cos(tilt),stt=Math.sin(tilt);const y=v[1]*ct-z1*stt,z=v[1]*stt+z1*ct;return[x,y,z]}
function hexA(h,a){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function globeDraw(t){
  if(!gsize)return;const R=gsize*.46,cx=gsize/2,cy=gsize/2;gx.clearRect(0,0,gsize,gsize);
  gx.beginPath();gx.arc(cx,cy,R,0,6.283);gx.fillStyle=hexA(COL.ink,.035);gx.fill();
  for(const v of GP){const p=proj(v);if(p[2]<0)continue;gx.fillStyle=hexA(COL.ink,(.12+p[2]*.5).toFixed(3));const s=.8+p[2]*1.3;gx.fillRect(cx+p[0]*R-s/2,cy-p[1]*R-s/2,s,s)}
  const home=MK[0].p;
  MK.slice(1).forEach((m,mi)=>{gx.beginPath();let started=false;for(let i=0;i<=40;i++){const s=i/40;let v=[lerp(home[0],m.p[0],s),lerp(home[1],m.p[1],s),lerp(home[2],m.p[2],s)];const L=Math.hypot(v[0],v[1],v[2]);const h=1+Math.sin(s*Math.PI)*.14;v=v.map(c=>c/L*h);const p=proj(v);if(p[2]<-.05){started=false;continue}const X=cx+p[0]*R,Y=cy-p[1]*R;if(!started){gx.moveTo(X,Y);started=true}else gx.lineTo(X,Y)}gx.strokeStyle=hexA(COL.gold,.9);gx.lineWidth=1.6;gx.stroke();
    const k=((t/1600)+mi*.33)%1;let v=[lerp(home[0],m.p[0],k),lerp(home[1],m.p[1],k),lerp(home[2],m.p[2],k)];const L=Math.hypot(...v),h=1+Math.sin(k*Math.PI)*.14;v=v.map(c=>c/L*h);const p=proj(v);if(p[2]>0&&!reduce){gx.beginPath();gx.arc(cx+p[0]*R,cy-p[1]*R,3,0,6.283);gx.fillStyle=COL.gold;gx.fill()}});
  gx.font='600 13px "Hanken Grotesk",system-ui,sans-serif';
  MK.forEach(m=>{const p=proj(m.p);if(p[2]<.05)return;const X=cx+p[0]*R,Y=cy-p[1]*R;if(m.home){const pr=reduce?0:(t/1400)%1;gx.beginPath();gx.arc(X,Y,6+pr*16,0,6.283);gx.strokeStyle=hexA(COL.accent,(1-pr)*.7);gx.lineWidth=2;gx.stroke()}gx.beginPath();gx.arc(X,Y,m.home?6:4.5,0,6.283);gx.fillStyle=m.home?COL.accent:COL.gold;gx.fill();gx.fillStyle=hexA(COL.ink,.9);gx.textAlign=m.al;gx.fillText(m.n,X+m.lx,Y+m.ly);gx.textAlign='left'});
}
new IntersectionObserver(es=>es.forEach(en=>{gvis=en.isIntersecting;if(gvis){gsizeUpd()}}),{rootMargin:'100px'}).observe(gwrap);
gwrap.addEventListener('pointerdown',e=>{gdrag=true;gx0=e.clientX;gwrap.setPointerCapture(e.pointerId)});
gwrap.addEventListener('pointermove',e=>{if(!gdrag)return;const dx=e.clientX-gx0;gx0=e.clientX;grot-=dx*.008;gvel=-dx*.008});
['pointerup','pointercancel'].forEach(t=>gwrap.addEventListener(t,()=>gdrag=false));

/* =====================================================================
   3D REALISTICO: materiali procedurali, scena colazione, linea, studio
   ===================================================================== */
const SANS='"Hanken Grotesk", system-ui, sans-serif',SERIF='Newsreader, Georgia, serif';
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
const rnd=(a,b)=>a+Math.random()*(b-a);
function tex(c,srgb=true){const t=new THREE.CanvasTexture(c);if(srgb)t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t}
function repTex(c,rx,ry,srgb=true){const t=tex(c,srgb);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
function packFront(){const w=1024,h=683,c=cv(w,h),x=c.getContext('2d');
  x.fillStyle='#FFF6DC';x.fillRect(0,0,w,h);
  x.fillStyle='#542C13';x.fillRect(0,0,w,150);
  x.fillStyle='#FFEF5A';x.fillRect(0,150,w,14);for(let i=0;i<w;i+=26){x.beginPath();x.arc(i+13,162,12,0,Math.PI);x.fill()}
  if(IMG.logo){const lw=420,lh=lw*IMG.logo.height/IMG.logo.width;x.drawImage(IMG.logo,(w-lw)/2,38,lw,lh)}
  x.fillStyle='#542C13';x.textAlign='center';x.font='italic 400 88px Newsreader, Georgia, serif';x.fillText('Buongiorno Bontà',w/2,330);
  x.font='600 34px '+SANS;x.fillStyle='#8A5A2B';x.fillText('Biscotti, dal 1870',w/2,385);
  [[.22,.8,.15],[.5,.84,.17],[.78,.8,.15]].forEach(([px,py,r])=>{const X=px*w,Y=py*h,R=r*h;const g=x.createRadialGradient(X-R*.3,Y-R*.3,R*.1,X,Y,R);g.addColorStop(0,'#F3C985');g.addColorStop(.75,'#D1913F');g.addColorStop(1,'#A9682B');x.fillStyle=g;x.beginPath();x.arc(X,Y,R,0,6.283);x.fill();if(IMG.letters){const lw=R*1.2,lh=lw*IMG.letters.height/IMG.letters.width;x.drawImage(tint(IMG.letters,lw,lh,'rgba(120,60,15,.45)'),X-lw/2,Y-lh/2)}});
  x.textAlign='left';x.font='500 22px '+SANS;x.fillStyle='rgba(84,44,19,.6)';x.fillText('Confezione illustrativa',30,h-22);return c}
function packSide(){const c=cv(256,256),x=c.getContext('2d');x.fillStyle='#542C13';x.fillRect(0,0,256,256);x.fillStyle='#FFEF5A';x.fillRect(0,56,256,14);x.fillStyle='#FFF6DC';x.fillRect(0,70,256,186);return c}
function dotTex(){const c=cv(64,64),x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return tex(c,false)}


const IMG={};const SRC=window.CRICH_IMG||{letters:'assets/img/lettere-crich.png',logo:'assets/img/logo-crich.png',crk:'assets/img/pack-crackers.jpg',bcr:'assets/img/pack-bio-cracker.jpg',bwf:'assets/img/pack-bio-wafer.jpg',wood:'assets/img/legno-colore.jpg',woodB:'assets/img/legno-rilievo.jpg',woodR:'assets/img/legno-ruvidezza.jpg',wpk:'assets/img/pack-wafers-nocciola.webp',gmp:'assets/img/pack-gran-merenda-monoporzione.webp'};
const imgsReady=Promise.all(Object.entries(SRC).map(([k,u])=>new Promise(r=>{const i=new Image();i.onload=()=>{IMG[k]=i;r()};i.onerror=()=>r();i.src=u})));
function tint(img,w,h,color){const c=cv(w,h),x=c.getContext('2d');x.drawImage(img,0,0,w,h);x.globalCompositeOperation='source-in';x.fillStyle=color;x.fillRect(0,0,w,h);return c}
function imgTex(img){const t=new THREE.Texture(img);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.needsUpdate=true;return t}
function edgeTex(img,left){const h=img.height,c=cv(96,h),x=c.getContext('2d');x.drawImage(img,left?1:img.width-5,0,4,h,0,0,96,h);x.fillStyle='rgba(0,0,0,.07)';x.fillRect(0,0,96,h);return tex(c)}
function makeCarton(){const g=new THREE.Group();const f=TX.crk?new THREE.MeshStandardMaterial({map:TX.crk,roughness:.5}):new THREE.MeshStandardMaterial({color:0xF4EEE2});if(TX.crk&&!TX.crkL){TX.crkL=edgeTex(IMG.crk,true);TX.crkR=edgeTex(IMG.crk,false)}const sl=TX.crkL?new THREE.MeshStandardMaterial({map:TX.crkL,roughness:.5}):f,sr=TX.crkR?new THREE.MeshStandardMaterial({map:TX.crkR,roughness:.5}):f;const red=new THREE.MeshStandardMaterial({color:0xC8202A,roughness:.5});const wh=new THREE.MeshStandardMaterial({color:0xF2ECE0,roughness:.6});g.add(new THREE.Mesh(new THREE.BoxGeometry(1.1,1.74,.6),[sr,sl,red,wh,f,f]));return g}
function makeFlow(t,end,w,h,d){const g=new THREE.Group();const f=t?new THREE.MeshStandardMaterial({map:t,roughness:.32,metalness:.04}):new THREE.MeshStandardMaterial({color:0xF2E8D2});const cr=new THREE.MeshStandardMaterial({color:0xF1E6CF,roughness:.4});const e=new THREE.MeshStandardMaterial({color:end,roughness:.3,metalness:.05});g.add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[e,e,cr,cr,f,f]));[-1,1].forEach(sg=>{const c=new THREE.Mesh(new THREE.BoxGeometry(w*.09,h*1.04,d*.25),e);c.position.x=sg*(w/2+w*.04);g.add(c)});return g}
function makePack(){const f=new THREE.MeshStandardMaterial({map:TX.pf,roughness:.42,metalness:.05});const s=new THREE.MeshStandardMaterial({map:TX.ps,roughness:.5});const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.BoxGeometry(2.4,1.6,.55),[s,s,s,s,f,s]));return g}

const TX={};
/* --- rumore --- */
function makeNoise(seed){let s=seed||1;const rand=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646};const P=new Uint8Array(512);const p=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(rand()*(i+1));[p[i],p[j]]=[p[j],p[i]]}for(let i=0;i<512;i++)P[i]=p[i&255];const G=[];for(let i=0;i<256;i++){const a=rand()*6.2832;G.push([Math.cos(a),Math.sin(a)])}
  const f=t=>t*t*t*(t*(t*6-15)+10);
  function n(x,y){const X=Math.floor(x),Y=Math.floor(y),xf=x-X,yf=y-Y;const g=(i,j)=>G[P[(P[(X+i)&255]+Y+j)&255]];const d=(gr,dx,dy)=>gr[0]*dx+gr[1]*dy;const u=f(xf),v=f(yf);const a=d(g(0,0),xf,yf),b=d(g(1,0),xf-1,yf),c=d(g(0,1),xf,yf-1),e=d(g(1,1),xf-1,yf-1);return (a+(b-a)*u)+((c+(e-c)*u)-(a+(b-a)*u))*v}
  return (x,y,o=4)=>{let s2=0,a=.5,fr=1;for(let i=0;i<o;i++){s2+=n(x*fr,y*fr)*a;a*=.5;fr*=2.03}return s2}}
function heightToNormal(h,S,strength){const c=cv(S,S),x=c.getContext('2d'),d=x.createImageData(S,S),D=d.data;
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const l=h[j*S+Math.max(0,i-1)],r=h[j*S+Math.min(S-1,i+1)],u=h[Math.max(0,j-1)*S+i],dn=h[Math.min(S-1,j+1)*S+i];let nx=(l-r)*strength,ny=(dn-u)*strength,nz=1;const L=Math.hypot(nx,ny,nz);nx/=L;ny/=L;nz/=L;const k=(j*S+i)*4;D[k]=(nx*.5+.5)*255;D[k+1]=(ny*.5+.5)*255;D[k+2]=(nz*.5+.5)*255;D[k+3]=255}
  x.putImageData(d,0,0);return c}
function grayCanvas(v,S){const c=cv(S,S),x=c.getContext('2d'),d=x.createImageData(S,S),D=d.data;for(let i=0;i<S*S;i++){const g=Math.max(0,Math.min(255,v[i]*255));D[i*4]=D[i*4+1]=D[i*4+2]=g;D[i*4+3]=255}x.putImageData(d,0,0);return c}
function maskData(S,draw){const c=cv(S,S),x=c.getContext('2d');draw(x);const d=x.getImageData(0,0,S,S).data;const m=new Float32Array(S*S);for(let i=0;i<S*S;i++)m[i]=d[i*4+3]/255;return m}
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
/* biscotto frollino con marchio in rilievo */
function buildBiscuitMaps(){
  const S=mobile?512:768,N=makeNoise(11),h=new Float32Array(S*S),alb=new Float32Array(S*S);
  const L=IMG.letters?maskData(S,x=>{const lw=S*.56,lh=lw*IMG.letters.height/IMG.letters.width;x.filter='blur('+(S/600)+'px)';x.drawImage(IMG.letters,(S-lw)/2,(S-lh)/2+S*.012,lw,lh)}):new Float32Array(S*S);
  const D=maskData(S,x=>{x.filter='blur('+(S/700)+'px)';x.fillStyle='#000';for(let i=0;i<30;i++){const a=i/30*6.2832;x.beginPath();x.arc(S/2+Math.cos(a)*S*.415,S/2+Math.sin(a)*S*.415,S*.0105,0,6.2832);x.fill()}x.lineWidth=S*.007;x.strokeStyle='#000';x.beginPath();x.ellipse(S/2,S/2+S*.006,S*.35,S*.19,0,0,6.2832);x.stroke()});
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const u=(i/S-.5)*2,v=(j/S-.5)*2,r=Math.hypot(u,v),k=j*S+i;
    const n1=N(u*5,v*5,4),n2=N(u*24+9,v*24+3,3),n3=N(u*70,v*70,2);
    const dome=(1-r*r)*.22;const edge=-smooth(.82,1.0,r)*.4;
    h[k]=.5+dome+edge+n1*.14+n2*.05+n3*.02+L[k]*.42-D[k]*.55;
    let a=.96-Math.pow(r,5)*.32-n1*.12-n2*.06+L[k]*.02-D[k]*.22+Math.max(0,n3)*.05;
    if(Math.random()<.0025)a-=.25;
    alb[k]=a}
  const nrm=heightToNormal(h,S,S/90);const ac=grayCanvas(alb,S);
  TX.bAlb=tex(ac);TX.bNrm=tex(nrm,false);
  // fianco
  const s2=256,sh=new Float32Array(s2*s2),sa=new Float32Array(s2*s2);for(let j=0;j<s2;j++)for(let i=0;i<s2;i++){const k=j*s2+i;const n=N(i/14,j/9,4);sh[k]=.5+n*.5;sa[k]=.82+n*.15}
  TX.sAlb=repTex(grayCanvas(sa,s2),3,1);TX.sNrm=repTex(heightToNormal(sh,s2,4),3,1,false);
}
function irregular(geo,amp,seed){const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);const r=Math.hypot(x,z);if(r<1e-5)continue;const a=Math.atan2(z,x);const f=1+amp*(Math.sin(a*5+seed)*.55+Math.sin(a*11+seed*2)*.3+Math.sin(a*23+seed*.7)*.15);p.setX(i,x*f);p.setZ(i,z*f)}geo.computeVertexNormals();return geo}
const BGEO={};
function biscuitGeos(){
  if(BGEO.top)return BGEO;
  BGEO.top=irregular(new THREE.CircleGeometry(.965,128).rotateX(-Math.PI/2).translate(0,.105,0),.012,1.3);
  const prof=[[.0,-.105],[.9,-.105],[.96,-.098],[1.0,-.08],[1.025,-.045],[1.032,0],[1.024,.045],[1.0,.08],[.982,.098],[.965,.106]].map(p=>new THREE.Vector2(p[0],p[1]));
  BGEO.rim=irregular(new THREE.LatheGeometry(prof,128),.012,1.3);
  return BGEO;
}
const BAKED=new (window.THREE?THREE.Color:Object)(0xBF7E3A),RAW=new (window.THREE?THREE.Color:Object)(0xF0DCB4),RICE=new (window.THREE?THREE.Color:Object)(0xD8B57A);
function makeBiscuit(color=BAKED){const G=biscuitGeos();const g=new THREE.Group();
  const top=new THREE.MeshStandardMaterial({map:TX.bAlb,normalMap:TX.bNrm,normalScale:new THREE.Vector2(1,1),color:color.clone(),roughness:1});
  const side=new THREE.MeshStandardMaterial({map:TX.sAlb,normalMap:TX.sNrm,color:color.clone().multiplyScalar(.86),roughness:1});
  top.userData.env=.1;side.userData.env=.1;const a=new THREE.Mesh(G.top,top),b=new THREE.Mesh(G.rim,side);a.castShadow=b.castShadow=true;a.receiveShadow=b.receiveShadow=true;g.add(a,b);g.userData={top,side};return g}
/* cracker */
function buildCrackerMaps(){const S=512,N=makeNoise(5),h=new Float32Array(S*S),a=new Float32Array(S*S);
  const H=maskData(S,x=>{x.filter='blur(1.5px)';x.fillStyle='#000';for(let i=0;i<5;i++)for(let j=0;j<5;j++){x.beginPath();x.arc(S*(.14+i*.18),S*(.14+j*.18),S*.013,0,6.2832);x.fill()}});
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const u=i/S,v=j/S,k=j*S+i;const b=N(u*7,v*7,3),bl=Math.max(0,N(u*11+3,v*11+7,2));const e=Math.min(u,v,1-u,1-v);h[k]=.5+b*.12+bl*.35-H[k]*.6-(1-smooth(0,.06,e))*.2;a[k]=.95-bl*.55-b*.08-H[k]*.25-(1-smooth(0,.08,e))*.15+(Math.random()<.004?.06:0)}
  TX.cAlb=tex(grayCanvas(a,S));TX.cNrm=tex(heightToNormal(h,S,S/70),false)}
function makeCracker(){const w=.62,r=.04,sh=new THREE.Shape();sh.moveTo(-w/2+r,-w/2);sh.lineTo(w/2-r,-w/2);sh.quadraticCurveTo(w/2,-w/2,w/2,-w/2+r);sh.lineTo(w/2,w/2-r);sh.quadraticCurveTo(w/2,w/2,w/2-r,w/2);sh.lineTo(-w/2+r,w/2);sh.quadraticCurveTo(-w/2,w/2,-w/2,w/2-r);sh.lineTo(-w/2,-w/2+r);sh.quadraticCurveTo(-w/2,-w/2,-w/2+r,-w/2);
  const g=new THREE.ExtrudeGeometry(sh,{depth:.03,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:3,curveSegments:6});g.rotateX(-Math.PI/2);g.translate(0,.012,0);
  const map=TX.cAlb.clone(),nm=TX.cNrm.clone();[map,nm].forEach(t=>{t.repeat.set(1/w,1/w);t.offset.set(.5,.5);t.needsUpdate=true});
  const cmat=new THREE.MeshStandardMaterial({map,normalMap:nm,color:0xC8954F,roughness:1});cmat.userData.env=.1;const m=new THREE.Mesh(g,cmat);m.castShadow=m.receiveShadow=true;const G=new THREE.Group();G.add(m);return G}
/* wafer */
function buildWaferMaps(){const W=512,Hh=256,h=new Float32Array(W*W),N=makeNoise(3);const S=W;for(let j=0;j<S;j++)for(let i=0;i<S;i++){const k=j*S+i;const gx=Math.abs(((i/S)*18)%1-.5),gy=Math.abs(((j/S)*18)%1-.5);const cell=smooth(.32,.42,Math.max(gx,gy));h[k]=.5+cell*.4+N(i/40,j/40,2)*.05}
  TX.wNrm=repTex(heightToNormal(h,S,6),1,1,false);const a=new Float32Array(S*S);for(let i=0;i<S*S;i++)a[i]=.9+(h[i]-.5)*.18;TX.wAlb=repTex(grayCanvas(a,S),1,1)}
function makeWafer(){const g=new THREE.Group();const wm=new THREE.MeshStandardMaterial({map:TX.wAlb,normalMap:TX.wNrm,color:0xD29E58,roughness:.72});wm.userData.env=.15;const cm=new THREE.MeshStandardMaterial({color:0x7B4A2C,roughness:.5});let y=0;
  for(let i=0;i<7;i++){const cr=i%2===1,th=cr?.05:.075;const m=new THREE.Mesh(new THREE.BoxGeometry(cr?1.58:1.6,th,cr?.48:.5),cr?cm:wm);m.position.y=y+th/2;y+=th;m.castShadow=m.receiveShadow=true;g.add(m)}return g}
/* Gran Merenda: biscotto ovale con trama a nido d'ape */
const GM={L:.46,W:.27};
function buildGMMaps(){const S=512,N=makeNoise(31),h=new Float32Array(S*S),al=new Float32Array(S*S);const L=GM.L,W=GM.W,R=W/2,hx=(L-W)/2,a=.052;
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const k=j*S+i;const x=(i/S-.5)*L,y=(.5-j/S)*W;
    const dx=Math.max(Math.abs(x)-hx,0);const ed=R-Math.hypot(dx,y);
    const rh=a*.866;const jr=Math.round(y/rh);let best=9;for(let dj=-1;dj<=1;dj++){const jj=jr+dj,off=(jj&1)?a/2:0,ii=Math.round((x-off)/a);for(let di=-1;di<=1;di++){const cx=(ii+di)*a+off,cy=jj*rh;const d=Math.hypot(x-cx,y-cy);if(d<best)best=d}}
    const inner=smooth(.028,.045,ed);const cell=(1-smooth(.36*a,.44*a,best))*inner;
    const n=N(x*40,y*40,3);
    h[k]=.5+n*.06-cell*.55+smooth(0,.03,ed)*.15;
    al[k]=.95-cell*.0+(1-cell)*inner*-.07-(1-smooth(0,.05,ed))*.2+cell*.04-n*.06}
  TX.gmA=tex(grayCanvas(al,S));TX.gmN=tex(heightToNormal(h,S,S/55),false);
  [TX.gmA,TX.gmN].forEach(t=>{t.repeat.set(1/L,1/W);t.offset.set(.5,.5)})}
function gmGeo(){const L=GM.L,W=GM.W,R=W/2,hx=(L-W)/2;const s=new THREE.Shape();s.moveTo(-hx,-R);s.lineTo(hx,-R);s.absarc(hx,0,R,-Math.PI/2,Math.PI/2,false);s.lineTo(-hx,R);s.absarc(-hx,0,R,Math.PI/2,Math.PI*1.5,false);
  const g=new THREE.ExtrudeGeometry(s,{depth:.022,bevelEnabled:true,bevelThickness:.01,bevelSize:.012,bevelSegments:3,curveSegments:24});g.rotateX(-Math.PI/2);g.translate(0,.01,0);return g}
/* confezione flowpack reale (wafer) con volume "a cuscino" */
function makePillow(t,w,d,hgt){const g=new THREE.Group();const geo=new THREE.PlaneGeometry(w,d,56,18);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);const ux=Math.abs(x)/(w/2),uz=Math.abs(z)/(d/2);const ends=smooth(.84,.97,ux);p.setY(i,.004+(1-Math.pow(uz,2.6))*(1-ends)*hgt*(1-.15*Math.pow(ux,2)))}
  geo.computeVertexNormals();
  const m=new THREE.MeshStandardMaterial({map:t,alphaTest:.5,roughness:.32,side:THREE.DoubleSide});m.userData.env=.55;
  const top=new THREE.Mesh(geo,m);top.castShadow=top.receiveShadow=true;top.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:t,alphaTest:.5});
  const base=new THREE.Mesh(new THREE.PlaneGeometry(w*.9,d*.96).rotateX(Math.PI/2),new THREE.MeshStandardMaterial({color:0xF2F0EC,roughness:.4}));base.position.y=.003;base.receiveShadow=true;
  g.add(top,base);return g}
/* ceramica, tovagliolo, tavolo */
function lathe(pts,seg=96){return new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg)}
function ceramic(c=0xDCD8D0){return new THREE.MeshPhysicalMaterial({color:c,roughness:.16,clearcoat:1,clearcoatRoughness:.08})}
function makeCup(){const g=new THREE.Group();const m=ceramic();m.side=THREE.DoubleSide;
  const cup=new THREE.Mesh(lathe([[0,0],[.26,0],[.3,.02],[.33,.1],[.42,.38],[.47,.62],[.49,.8],[.495,.83],[.47,.83],[.455,.78],[.43,.6],[.38,.36],[.29,.1],[.0,.08]]),m);cup.castShadow=cup.receiveShadow=true;g.add(cup);
  const milk=new THREE.Mesh(new THREE.CircleGeometry(.448,64).rotateX(-Math.PI/2),new THREE.MeshPhysicalMaterial({color:0xF7F3EA,roughness:.22,clearcoat:.4}));milk.position.y=.72;g.add(milk);
  const handle=new THREE.Mesh(new THREE.TorusGeometry(.17,.035,16,48,Math.PI*1.25),m);handle.rotation.z=-Math.PI*.62;handle.position.set(.5,.46,0);handle.castShadow=true;g.add(handle);
  const saucer=new THREE.Mesh(lathe([[0,.0],[.3,0],[.33,.02],[.5,.03],[.72,.07],[.76,.09],[.74,.095],[.5,.06],[.34,.045],[0,.045]]),ceramic());saucer.castShadow=saucer.receiveShadow=true;g.add(saucer);cup.position.y=.045;milk.position.y+=.045;handle.position.y+=.045;
  return g}
function makePlate(){const m=new THREE.Mesh(lathe([[0,0],[.7,0],[.74,.02],[.8,.04],[1.05,.08],[1.28,.15],[1.32,.16],[1.3,.165],[1.04,.105],[.8,.07],[0,.07]],128),ceramic(0xF7F5F0));m.castShadow=m.receiveShadow=true;return m}
function linenCanvas(){const S=512,c=cv(S,S),x=c.getContext('2d');x.fillStyle='#ece5d8';x.fillRect(0,0,S,S);for(let i=0;i<S;i+=2){x.fillStyle='rgba(120,100,80,'+(.03+Math.random()*.05)+')';x.fillRect(0,i,S,1);x.fillStyle='rgba(120,100,80,'+(.02+Math.random()*.05)+')';x.fillRect(i,0,1,S)}for(let i=0;i<300;i++){x.fillStyle='rgba(90,70,50,.08)';x.fillRect(Math.random()*S,Math.random()*S,Math.random()*30,1)}return c}
function makeNapkin(){const geo=new THREE.PlaneGeometry(3.4,3.0,90,80);geo.rotateX(-Math.PI/2);const N=makeNoise(21);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);let y=.012+Math.max(0,N(x*.9,z*.9,3))*.06+Math.max(0,Math.sin(x*2.2+z*.6))*.012;const e=Math.min(1.7-Math.abs(x),1.5-Math.abs(z));y*=smooth(0,.25,e);p.setY(i,y)}geo.computeVertexNormals();
  const t=repTex(linenCanvas(),3,3);const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:t,color:0xC9BEAA,roughness:.95}));m.receiveShadow=m.castShadow=true;return m}
function wallCanvas(){const W=1024,H=512,c=cv(W,H),x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#d8cfc1');g.addColorStop(1,'#cfc4b3');x.fillStyle=g;x.fillRect(0,0,W,H);
  const r=x.createRadialGradient(W*.22,H*.35,10,W*.22,H*.35,W*.38);r.addColorStop(0,'rgba(255,246,228,.95)');r.addColorStop(.5,'rgba(255,240,215,.45)');r.addColorStop(1,'rgba(255,240,215,0)');x.fillStyle=r;x.fillRect(0,0,W,H);
  x.save();x.filter='blur(18px)';x.fillStyle='rgba(255,250,236,.55)';[[.1,.1],[.24,.1],[.1,.42],[.24,.42]].forEach(([a,b])=>x.fillRect(W*a,H*b,W*.12,H*.28));x.restore();
  for(let i=0;i<9000;i++){x.fillStyle='rgba(80,60,40,'+(Math.random()*.035)+')';x.fillRect(Math.random()*W,Math.random()*H,2,2)}return c}

/* ---------- Renderer principale e profondità di campo ---------- */
let R3,stageEl=$('#stage'),veil=$('#veil'),post=null;
let heroScene,heroCam,facScene,facCam,HERO={},FAC=null,envHero,envFac;
let mx=0,my=0,smx=0,smy=0,needStatic=true;
function envScale(root,k,kc){root.traverse(o=>{if(!o.material)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m.userData.lin){m.userData.lin=1;if(m.color&&!m.isShadowMaterial)m.color.convertSRGBToLinear();if(m.emissive)m.emissive.convertSRGBToLinear()}if('envMapIntensity' in m)m.envMapIntensity=m.userData.env!=null?m.userData.env:(m.isMeshPhysicalMaterial?kc:k)})})}
function roomEnv(r,int){const pm=new THREE.PMREMGenerator(r);const e=pm.fromScene(new THREE.RoomEnvironment(),.04).texture;pm.dispose();return e}
function initPost(){
  const s=new THREE.Vector2();R3.getDrawingBufferSize(s);
  const dt=new THREE.DepthTexture(s.x,s.y);dt.type=THREE.UnsignedIntType;
  const rt=new THREE.WebGLRenderTarget(s.x,s.y,{depthTexture:dt,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});rt.texture.encoding=THREE.sRGBEncoding;
  const mat=new THREE.ShaderMaterial({uniforms:{tColor:{value:rt.texture},tDepth:{value:dt},cameraNear:{value:.1},cameraFar:{value:100},focus:{value:5},aperture:{value:12},maxBlur:{value:9},res:{value:s.clone()},time:{value:0},vig:{value:.28}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`#include <packing>
uniform sampler2D tColor;uniform sampler2D tDepth;uniform float cameraNear,cameraFar,focus,aperture,maxBlur,time,vig;uniform vec2 res;varying vec2 vUv;
float vz(vec2 uv){return -perspectiveDepthToViewZ(texture2D(tDepth,uv).x,cameraNear,cameraFar);}
float coc(float z){return min(abs(z-focus)/max(z,.001)*aperture,maxBlur);}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){float z=vz(vUv);float c=coc(z);vec3 acc=texture2D(tColor,vUv).rgb;float ws=1.;
 if(c>.5){for(int i=1;i<28;i++){float fi=float(i);float r=sqrt(fi/28.);float a=fi*2.39996;vec2 uv=vUv+vec2(cos(a),sin(a))*r*c/res;float zs=vz(uv);float cs=coc(zs);float w=(zs<z-.05&&cs<c)?cs/c:1.;acc+=texture2D(tColor,uv).rgb*w;ws+=w;}}
 vec3 col=acc/ws;vec2 q=vUv-.5;col*=1.-dot(q,q)*vig*1.6;col+=(hash(vUv*res+time)-.5)*.028;gl_FragColor=vec4(col,1.);}`,depthWrite:false,depthTest:false});
  const sc=new THREE.Scene();const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);q.frustumCulled=false;sc.add(q);
  post={rt,mat,sc,cam:new THREE.OrthographicCamera(-1,1,1,-1,0,1),size:s};
}
function sizePost(){if(!post)return;const s=new THREE.Vector2();R3.getDrawingBufferSize(s);post.rt.setSize(s.x,s.y);post.rt.depthTexture.image.width=s.x;post.rt.depthTexture.image.height=s.y;post.mat.uniforms.res.value.copy(s)}
function render(scene,camera,focus,aperture,t){
  if(!post){R3.setRenderTarget(null);R3.render(scene,camera);return}
  R3.setRenderTarget(post.rt);R3.render(scene,camera);R3.setRenderTarget(null);
  const u=post.mat.uniforms;u.cameraNear.value=camera.near;u.cameraFar.value=camera.far;u.focus.value=focus;u.aperture.value=aperture;u.time.value=(t*60)%1000;
  R3.render(post.sc,post.cam);
}

/* ---------- Scena 1: colazione ---------- */
function buildHero(){
  const S=heroScene=new THREE.Scene();S.background=new THREE.Color(0xd9d0c2);envHero=roomEnv(R3);S.environment=envHero;
  heroCam=new THREE.PerspectiveCamera(24,vw/vh,.1,60);
  const woodT=IMG.wood?imgTex(IMG.wood):null;const bumpT=IMG.woodB?new THREE.Texture(IMG.woodB):null;if(bumpT)bumpT.needsUpdate=true;const rT=IMG.woodR?new THREE.Texture(IMG.woodR):null;if(rT)rT.needsUpdate=true;
  [woodT,bumpT,rT].forEach(t=>{if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2.6,2.6);t.anisotropy=8}});
  const table=new THREE.Mesh(new THREE.PlaneGeometry(26,26),new THREE.MeshStandardMaterial({map:woodT,bumpMap:bumpT,bumpScale:.012,roughnessMap:rT,roughness:.7,color:woodT?0xffffff:0x8a5a35}));table.rotation.x=-Math.PI/2;table.position.set(0,0,-4);table.receiveShadow=true;S.add(table);
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(40,14),new THREE.MeshStandardMaterial({map:tex(wallCanvas()),roughness:.95}));wall.position.set(0,6,-11);S.add(wall);
  const sun=new THREE.DirectionalLight(0xffd6a8,2.1);sun.position.set(-6,7.5,-4.5);sun.target.position.set(.6,0,.4);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);const c=sun.shadow.camera;c.left=-5;c.right=5;c.top=5;c.bottom=-5;c.near=2;c.far=22;sun.shadow.radius=mobile?4:9;sun.shadow.bias=-.0006;S.add(sun,sun.target);
  const fill=new THREE.DirectionalLight(0xdfe8ff,.18);fill.position.set(3,4,8);S.add(fill);
  S.add(new THREE.HemisphereLight(0xfff4e6,0x5a3b24,.12));
  const napkin=makeNapkin();napkin.position.set(-.1,0,.55);napkin.rotation.y=.22;S.add(napkin);
  const plate=makePlate();plate.material.color.set(0xE2DED6);plate.position.set(-.05,.04,.55);S.add(plate);
  const bis=[];const B=(x,y,z,rx,ry,rz,s=.33,c=BAKED)=>{const b=makeBiscuit(c);b.position.set(x,y,z);b.rotation.set(rx,ry,rz);b.scale.setScalar(s);S.add(b);bis.push(b);return b};
  const py=.04+.075;
  B(-.12,py+.035,.5,0,.3,0);B(-.08,py+.105,.53,.03,1.4,-.02);B(-.14,py+.175,.49,-.02,2.6,.03);
  B(.42,py+.12,.7,.5,.2,-.16);
  B(1.05,.035,1.55,0,2.2,0,.33);B(.55,.035,2.05,0,.9,0,.33);B(-1.45,.035,1.35,0,.4,0,.33);
  const crk=makeCracker();crk.position.set(-1.15,.02,2.05);crk.rotation.y=.5;crk.scale.setScalar(1.05);S.add(crk);
  const cup=makeCup();cup.position.set(2.0,0,-.6);cup.rotation.y=-.5;S.add(cup);
  // briciole
  const cg=new THREE.DodecahedronGeometry(.02,0);const cm=new THREE.MeshStandardMaterial({color:0xC98E4E,roughness:.85});const NC=90;const crumbs=new THREE.InstancedMesh(cg,cm,NC);const dm=new THREE.Object3D();
  for(let i=0;i<NC;i++){const a=Math.random()*6.28,r=Math.random()<.6?rnd(1.35,1.9):rnd(.3,1.2);dm.position.set(-.05+Math.cos(a)*r,.008,.55+Math.sin(a)*r*.8);if(dm.position.z>2.6)dm.position.z=2.6;dm.rotation.set(rnd(0,6),rnd(0,6),rnd(0,6));const s=rnd(.4,1.6);dm.scale.set(s,s*rnd(.5,1),s);dm.updateMatrix();crumbs.setMatrixAt(i,dm.matrix)}crumbs.castShadow=true;crumbs.receiveShadow=true;S.add(crumbs);
  // confezioni sullo sfondo
  if(IMG.crk){const k=makeCarton();k.scale.setScalar(1.25);k.position.set(3.4,1.09,-4.6);k.rotation.y=-.42;k.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true}});S.add(k)}
  if(IMG.bcr){const f=makeFlow(TX.bcr,0x2E8FD8,2.3,1.27,.4);f.scale.setScalar(.95);f.position.set(1.0,.6,-5.6);f.rotation.y=.18;f.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true}});S.add(f)}
  envScale(S,.32,.75);
  HERO={bis,plate,focusPt:new THREE.Vector3(-.1,.25,.55)};
}
const HC={p:new (window.THREE?THREE.Vector3:Object)(),l:new (window.THREE?THREE.Vector3:Object)()};
function heroPose(heroP,t,out){
  const k=eIO(clamp(heroP/.7));
  const base=mobile?{p:[.5,5.2,13.5],l:[.45,.1,.2]}:{p:[1.1,2.15,7.8],l:[.55,.3,.3]};
  const close=mobile?{p:[.1,2.6,6.6],l:[-.1,.2,.55]}:{p:[.35,1.3,4.0],l:[-.05,.25,.55]};
  out.px=lerp(base.p[0],close.p[0],k)+Math.sin(t*.13)*.06+smx*.12;out.py=lerp(base.p[1],close.p[1],k)+Math.sin(t*.17)*.025-smy*.05;out.pz=lerp(base.p[2],close.p[2],k)+Math.sin(t*.09)*.08;
  out.lx=lerp(base.l[0],close.l[0],k);out.ly=lerp(base.l[1],close.l[1],k);out.lz=lerp(base.l[2],close.l[2],k)}

/* ---------- Scena 2: linea di produzione ---------- */
/* ---------- Linea di produzione (ricostruzione 3D) ---------- */
const BT=.93,SPEED=.3,FY=0;
let envR3=null;
function makeEnv(r){const c=cv(1024,512),x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,'#fbf7ef');g.addColorStop(.42,'#d9d3c8');g.addColorStop(.52,'#7a7268');g.addColorStop(1,'#26211c');x.fillStyle=g;x.fillRect(0,0,1024,512);
  x.fillStyle='#ffffff';for(let i=0;i<10;i++){x.fillRect(i*102+20,60,60,14);x.fillRect(i*102+20,140,60,10)}
  x.fillStyle='rgba(255,160,80,.5)';x.fillRect(420,250,200,30);
  const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.encoding=THREE.sRGBEncoding;
  const pm=new THREE.PMREMGenerator(r);const e=pm.fromEquirectangular(t).texture;pm.dispose();t.dispose();return e}
function noiseCanvas(w,h,base,specks,alpha,fn){const c=cv(w,h),x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<specks;i++){x.fillStyle=fn?fn():'rgba(0,0,0,'+alpha+')';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2)}return c}
function repTex(c,rx,ry,srgb=true){const t=tex(c,srgb);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
function brushedCanvas(){const c=cv(512,128),x=c.getContext('2d');x.fillStyle='#e9ebee';x.fillRect(0,0,512,128);for(let i=0;i<900;i++){const y=Math.random()*128,l=40+Math.random()*300,v=200+Math.random()*55|0;x.fillStyle='rgba('+v+','+v+','+(v+4)+','+(.15+Math.random()*.25)+')';x.fillRect(Math.random()*512,y,l,1)}return c}
function beltCanvas(){const c=cv(256,256),x=c.getContext('2d');x.fillStyle='#ece8df';x.fillRect(0,0,256,256);x.strokeStyle='rgba(120,110,95,.13)';x.lineWidth=1;for(let i=-256;i<512;i+=6){x.beginPath();x.moveTo(i,0);x.lineTo(i+256,256);x.stroke();x.beginPath();x.moveTo(i,256);x.lineTo(i+256,0);x.stroke()}for(let i=0;i<1500;i++){x.fillStyle='rgba(90,80,70,'+(Math.random()*.06)+')';x.fillRect(Math.random()*256,Math.random()*256,2,2)}return c}
function doughCanvas(bump){const w=512,h=256,c=cv(w,h),x=c.getContext('2d');x.fillStyle=bump?'#808080':'#fffaf0';x.fillRect(0,0,w,h);
  for(let i=0;i<5000;i++){const v=bump?(Math.random()<.5?60:200):0;x.fillStyle=bump?'rgba('+v+','+v+','+v+',.18)':'rgba(170,120,60,'+(Math.random()*.07)+')';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2)}
  for(let i=0;i<160;i++){const px=Math.random()*w,py=Math.random()*h,r=1+Math.random()*3;x.beginPath();x.arc(px,py,r,0,6.283);x.fillStyle=bump?'#3a3a3a':'rgba(160,110,60,.18)';x.fill()}
  if(!bump){for(let i=0;i<900;i++){x.fillStyle='rgba(255,255,255,'+(.4+Math.random()*.5)+')';x.fillRect(Math.random()*w,Math.random()*h,1.5,1.5)}}return c}
function drumCanvas(){const w=1024,h=256,c=cv(w,h),x=c.getContext('2d');x.fillStyle='#b9bec4';x.fillRect(0,0,w,h);for(let i=0;i<600;i++){x.fillStyle='rgba(255,255,255,'+Math.random()*.2+')';x.fillRect(Math.random()*w,Math.random()*h,1,Math.random()*30)}
  const cols=5,rows=5;for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const cx=(i+.5)*w/cols,cy=(j+.5)*h/rows,r=h/rows*.34;const g=x.createRadialGradient(cx-r*.2,cy-r*.2,r*.1,cx,cy,r);g.addColorStop(0,'#55595f');g.addColorStop(.85,'#7b8087');g.addColorStop(1,'#e8ebee');x.fillStyle=g;x.beginPath();x.ellipse(cx,cy,r*2.4,r,0,0,6.283);x.fill();x.fillStyle='rgba(40,42,46,.35)';for(let q=-3;q<=3;q++)for(let e=-1;e<=1;e++){x.beginPath();x.arc(cx+q*r*.62+(e&1)*r*.31,cy+e*r*.52,r*.17,0,6.283);x.fill()}}return c}
function floorCanvas(){const c=noiseCanvas(512,512,'#6e6f69',6000,0,()=>'rgba('+(Math.random()<.5?0:255)+','+(Math.random()<.5?0:255)+','+(Math.random()<.5?0:255)+',.035)');const x=c.getContext('2d');x.strokeStyle='rgba(30,25,20,.35)';x.lineWidth=3;x.strokeRect(0,0,512,512);return c}
class Helix extends THREE.Curve{constructor(r,h,turns){super();this.r=r;this.h=h;this.n=turns}getPoint(t,o=new THREE.Vector3()){const a=t*Math.PI*2*this.n;return o.set(Math.cos(a)*this.r*(1-t*.35),-t*this.h,Math.sin(a)*this.r*(1-t*.35))}}

function buildFactory(){
  envFac=roomEnv(R3);const env=envFac;
  facScene=new THREE.Scene();facScene.background=new THREE.Color(0x24201c);facScene.fog=new THREE.Fog(0x24201c,16,42);facScene.environment=env;
  facCam=new THREE.PerspectiveCamera(32,vw/vh,.1,80);
  const G=new THREE.Group();facScene.add(G);
  const brushed=repTex(brushedCanvas(),3,1);
  const steel=new THREE.MeshStandardMaterial({color:0xd3d7dc,map:brushed,metalness:.82,roughness:.32,envMap:env,envMapIntensity:1});
  const steelD=new THREE.MeshStandardMaterial({color:0x8f959c,metalness:.78,roughness:.42,envMap:env});
  const panel=new THREE.MeshStandardMaterial({color:0xC9CBC8,metalness:.15,roughness:.42,envMap:env,envMapIntensity:.5});
  const rubber=new THREE.MeshStandardMaterial({color:0x2a2a2c,roughness:.7});
  const sh=!mobile;
  const add=(geo,mat,x,y,z,parent=G)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=sh;m.receiveShadow=sh;parent.add(m);return m};
  // pavimento
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(90,40),new THREE.MeshStandardMaterial({map:repTex(floorCanvas(),45,20),roughness:.34,metalness:.05,envMap:env,envMapIntensity:.5}));floor.rotation.x=-Math.PI/2;floor.position.x=4;floor.receiveShadow=sh;G.add(floor);
  const lineM=new THREE.MeshStandardMaterial({color:0xD9B21C,roughness:.5});[-2.4,2.4].forEach(z=>{const l=new THREE.Mesh(new THREE.PlaneGeometry(36,.09),lineM);l.rotation.x=-Math.PI/2;l.position.set(3,.003,z);l.receiveShadow=sh;G.add(l)});
  const wallC=cv(1024,256),wx=wallC.getContext('2d');wx.fillStyle='#c9cbc8';wx.fillRect(0,0,1024,256);for(let i=0;i<1024;i+=16){wx.fillStyle='rgba(0,0,0,.08)';wx.fillRect(i,0,2,256);wx.fillStyle='rgba(255,255,255,.12)';wx.fillRect(i+3,0,1,256)}
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(60,10),new THREE.MeshStandardMaterial({map:repTex(wallC,6,1),roughness:.6,metalness:.2}));wall.position.set(3,5,-8);G.add(wall);
  const winM=new THREE.MeshBasicMaterial({color:0xf3f6f8});for(let i=0;i<9;i++){const w=new THREE.Mesh(new THREE.PlaneGeometry(4.2,1.2),winM);w.position.set(-16+i*5,8.2,-7.95);G.add(w)}
  const lampM=new THREE.MeshBasicMaterial({color:0xfdfbf4});for(let i=0;i<8;i++)for(const z of[-1.5,2]){const l=new THREE.Mesh(new THREE.BoxGeometry(2.4,.06,.22),lampM);l.position.set(-12+i*4.4,6.6,z);G.add(l)}
  // nastro principale
  const X0=-8.9,X1=10.9,BL=X1-X0,BW=2;
  const beltT=repTex(beltCanvas(),BL,BW);const beltM=new THREE.MeshStandardMaterial({map:beltT,roughness:.78});
  add(new THREE.BoxGeometry(BL,.06,BW),[steelD,steelD,beltM,steelD,steelD,steelD],(X0+X1)/2,BT-.03,0);
  [-1,1].forEach(sg=>add(new THREE.BoxGeometry(BL,.16,.06),steel,(X0+X1)/2,BT-.01,sg*(BW/2+.03)));
  for(let x=X0+.4;x<X1;x+=2.4)[-1,1].forEach(sg=>{add(new THREE.BoxGeometry(.08,BT-.06,.08),steel,x,(BT-.06)/2,sg*.92);add(new THREE.CylinderGeometry(.07,.07,.03,16),rubber,x,.015,sg*.92)});
  [X0,X1].forEach(x=>{const r=add(new THREE.CylinderGeometry(.06,.06,BW+.1,24),steel,x,BT-.04,0);r.rotation.x=Math.PI/2});
  // impastatrice
  const MX=-11.2;const mixer=new THREE.Group();mixer.position.set(MX,0,-.3);G.add(mixer);
  add(new THREE.BoxGeometry(1.9,.5,1.9),panel,0,.25,0,mixer);
  const bowlPts=[];for(let i=0;i<=12;i++){const a=i/12*Math.PI/2;bowlPts.push(new THREE.Vector2(.25+Math.sin(a)*.75,.55+(1-Math.cos(a))*.25))}bowlPts.push(new THREE.Vector2(1.0,1.55));bowlPts.push(new THREE.Vector2(1.06,1.6));
  const bowlM=steel.clone();bowlM.side=THREE.DoubleSide;const bowl=add(new THREE.LatheGeometry(bowlPts,64),bowlM,0,0,0,mixer);
  add(new THREE.CylinderGeometry(.3,.3,.08,32),steel,0,.55,0,mixer);
  const dg=new THREE.IcosahedronGeometry(1,4);const pa=dg.attributes.position;for(let i=0;i<pa.count;i++){const v=new THREE.Vector3().fromBufferAttribute(pa,i);const n=1+.08*Math.sin(v.x*5+v.z*3)+.06*Math.sin(v.y*7+v.x*4)+.04*Math.sin(v.z*11);v.multiplyScalar(n);pa.setXYZ(i,v.x,v.y,v.z)}dg.computeVertexNormals();
  const doughM=new THREE.MeshStandardMaterial({map:tex(doughCanvas(false)),bumpMap:tex(doughCanvas(true),false),bumpScale:.03,color:0xE2C089,roughness:.74});
  const doughBall=add(dg,doughM,0,1.05,0,mixer);doughBall.scale.set(.78,.32,.78);
  const col=add(new THREE.BoxGeometry(.55,2.9,.7),panel,0,1.45,-1.25,mixer);
  add(new THREE.BoxGeometry(.7,.5,1.6),panel,0,2.65,-.6,mixer);
  const hook=new THREE.Mesh(new THREE.TubeGeometry(new Helix(.32,.95,1.6),160,.045,12),steel);hook.position.set(0,2.35,0);hook.castShadow=sh;mixer.add(hook);
  const shaft=add(new THREE.CylinderGeometry(.05,.05,.25,16),steel,0,2.45,0,mixer);
  // tubo della farina e flusso
  const pipe=add(new THREE.CylinderGeometry(.12,.12,2.4,24),steel,.55,4.1,.25,mixer);add(new THREE.CylinderGeometry(.12,.06,.25,24),steel,.55,2.8,.25,mixer);
  const NFL=mobile?260:520,flg=new THREE.BufferGeometry(),flp=new Float32Array(NFL*3),fld=[];for(let i=0;i<NFL;i++)fld.push([Math.random(),Math.random()*6.28,Math.random()]);flg.setAttribute('position',new THREE.BufferAttribute(flp,3));
  const flour=new THREE.Points(flg,new THREE.PointsMaterial({color:0xfbf6ec,size:.028,map:TX.dot,transparent:true,depthWrite:false,opacity:.85}));flour.position.set(.55,0,.25);mixer.add(flour);
  // impasto sul nastro e laminatoio
  const sheets=[];
  function sheet(xa,xb,th){const L=xb-xa;const m=doughM.clone();m.map=doughM.map.clone();m.map.wrapS=m.map.wrapT=THREE.RepeatWrapping;m.map.repeat.set(L/1.4,1);m.map.needsUpdate=true;m.bumpMap=doughM.bumpMap.clone();m.bumpMap.wrapS=m.bumpMap.wrapT=THREE.RepeatWrapping;m.bumpMap.repeat.set(L/1.4,1);m.bumpMap.needsUpdate=true;const s=add(new THREE.BoxGeometry(L,th,1.7),m,(xa+xb)/2,BT+th/2,0);sheets.push(m);return s}
  sheet(X0+.2,-6.2,.17);sheet(-6.2,-3.7,.075);sheet(-3.7,-1.05,.045);
  const rollers=[];
  function frameAt(x,w,h,ry){add(new THREE.BoxGeometry(w,h,.1),panel,x,h/2,-1.2);[-1,1].forEach(sx=>add(new THREE.BoxGeometry(.09,ry+.2,.09),steel,x+sx*w*.38,(ry+.2)/2,1.2));add(new THREE.BoxGeometry(.24,.24,.12),rubber,x,ry,1.2);add(new THREE.BoxGeometry(.1,.1,2.5),steel,x+w*.38,h-.05,0)}
  function gauge(x,r,th,h){frameAt(x,1.1,h,BT+th+r);
    const tr=new THREE.Mesh(new THREE.CylinderGeometry(r,r,2.2,48).rotateX(Math.PI/2),steel);tr.position.set(x,BT+th+r,0);tr.castShadow=sh;G.add(tr);rollers.push([tr,r]);
    [-1,1].forEach(sg=>add(new THREE.CylinderGeometry(r*.55,r*.55,.08,24).rotateX(Math.PI/2),steelD,x,BT+th+r,sg*1.25))}
  gauge(-6.2,.24,.075,1.75);gauge(-3.7,.18,.045,1.6);
  // rullo stampatore
  const drumT=tex(drumCanvas());const drumM=new THREE.MeshStandardMaterial({map:drumT,metalness:.75,roughness:.35,envMap:env});
  const drum=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,2.1,64,1,false).rotateX(Math.PI/2),[drumM,steel,steel]);drum.position.set(-.95,BT+.045+.42,0);drum.castShadow=sh;G.add(drum);
  frameAt(-.95,1.2,2.0,BT+.045+.42);
  // biscotti (istanze)
  const gG=gmGeo();
  const topM=new THREE.MeshStandardMaterial({map:TX.gmA,normalMap:TX.gmN,roughness:1});const sideM=new THREE.MeshStandardMaterial({map:TX.sAlb,roughness:1});
  const ROWS=20,LANES=[-.72,-.36,0,.36,.72],SP=.58,BX0=-.62;const NB=ROWS*LANES.length;
  const bBody=new THREE.InstancedMesh(gG,[topM,sideM],NB),bTop=bBody;bBody.castShadow=sh;bBody.receiveShadow=sh;
  const tints=[];for(let i=0;i<NB;i++){tints.push(rnd(-.04,.04));bBody.setColorAt(i,cRaw)}
  G.add(bBody);
  // forno a tunnel
  const OX0=1.5,OX1=7.4,OL=OX1-OX0,OC=(OX0+OX1)/2;
  const ovenM=new THREE.MeshStandardMaterial({color:0xdadde1,map:repTex(brushedCanvas(),4,1),metalness:.8,roughness:.3,envMap:env});
  add(new THREE.BoxGeometry(OL,1.0,2.7),ovenM,OC,BT+.3+.5,0);
  [-1,1].forEach(sg=>add(new THREE.BoxGeometry(OL,.34,.08),ovenM,OC,BT+.13,sg*1.32));
  add(new THREE.BoxGeometry(OL,.05,2.8),steelD,OC,BT+1.32,0);
  const glow=new THREE.MeshStandardMaterial({color:0x110500,emissive:0xff7a2e,emissiveIntensity:1.6});
  const inner=new THREE.Mesh(new THREE.PlaneGeometry(OL,2.5),glow);inner.rotation.x=Math.PI/2;inner.position.set(OC,BT+.295,0);G.add(inner);
  [OX0,OX1].forEach(x=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(2.5,.29),new THREE.MeshBasicMaterial({color:0xff9a4d,transparent:true,opacity:.35,depthWrite:false}));m.rotation.y=Math.PI/2;m.position.set(x+(x===OX0?.02:-.02),BT+.15,0);G.add(m)});
  for(let i=0;i<5;i++){const wx=OX0+.6+i*(OL-1.2)/4;add(new THREE.BoxGeometry(.62,.32,.04),steelD,wx,BT+.82,1.36);const w=new THREE.Mesh(new THREE.PlaneGeometry(.52,.22),new THREE.MeshStandardMaterial({color:0x1a0a02,emissive:0xff8a3a,emissiveIntensity:.9,metalness:.2,roughness:.15}));w.position.set(wx,BT+.82,1.385);G.add(w)}
  [OX0+1,OX1-1].forEach(x=>{add(new THREE.CylinderGeometry(.14,.14,1.2,24),steel,x,BT+1.9,-.6);add(new THREE.CylinderGeometry(.2,.14,.12,24),steel,x,BT+2.5,-.6)});
  for(let x=OX0+.3;x<OX1;x+=1.4)[-1,1].forEach(sg=>add(new THREE.BoxGeometry(.1,BT+.3,.1),steelD,x,(BT+.3)/2,sg*1.3));
  if(IMG.logo){const lt=imgTex(IMG.logo);const lw=.9,lh=lw*IMG.logo.height/IMG.logo.width;const plate=new THREE.Mesh(new THREE.PlaneGeometry(lw,lh),new THREE.MeshStandardMaterial({map:lt,transparent:true,roughness:.4}));plate.position.set(OC,BT+1.12,1.355);G.add(plate)}
  const cab=add(new THREE.BoxGeometry(.7,1.5,.5),panel,OX1+.6,.75,1.7);const scr=new THREE.Mesh(new THREE.PlaneGeometry(.42,.28),new THREE.MeshStandardMaterial({color:0x0b1a24,emissive:0x2d7fb0,emissiveIntensity:.6}));scr.position.set(OX1+.6,1.15,1.951);G.add(scr);
  const ol1=new THREE.PointLight(0xff8236,1.3,3.4,2);ol1.position.set(OX0-.15,BT+.18,0);G.add(ol1);const ol2=new THREE.PointLight(0xff8236,1.6,3.6,2);ol2.position.set(OX1+.2,BT+.2,0);G.add(ol2);
  // confezionatrice e nastro di uscita
  const PX=10.95;add(new THREE.BoxGeometry(1.9,1.6,2.6),panel,PX+.3,.8+.35,0);add(new THREE.BoxGeometry(1.9,.35,2.4),steelD,PX+.3,.17,0);
  const win=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.6),new THREE.MeshStandardMaterial({color:0x111418,metalness:.6,roughness:.08,envMap:env,envMapIntensity:1.4,transparent:true,opacity:.85}));win.position.set(PX+.3,1.35,1.305);G.add(win);
  const led=new THREE.Mesh(new THREE.SphereGeometry(.05,16,8),new THREE.MeshStandardMaterial({color:0x063,emissive:0x2bd46a,emissiveIntensity:1.6}));led.position.set(PX+1,1.75,1.31);G.add(led);
  const QX0=PX+1.25,QX1=QX0+6.4;const q=add(new THREE.BoxGeometry(QX1-QX0,.06,1.1),[steelD,steelD,new THREE.MeshStandardMaterial({map:(()=>{const t=repTex(beltCanvas(),QX1-QX0,1.1);return t})(),roughness:.78}),steelD,steelD,steelD],(QX0+QX1)/2,.62,0);
  const qBelt=q.material[2].map;
  for(let x=QX0+.4;x<QX1;x+=2)[-1,1].forEach(sg=>add(new THREE.BoxGeometry(.07,.6,.07),steel,x,.3,sg*.5));
  const PK=TX.gmp||TX.wpk;const PW=TX.gmp?1.0:1.3,PD=TX.gmp?.44:.455;const packs=[];for(let i=0;i<5;i++){const p=PK?makePillow(PK,PW,PD,.06):makePack();if(!PK)p.scale.setScalar(.34);p.traverse(o=>{if(o.isMesh){o.castShadow=sh;o.receiveShadow=sh}});G.add(p);packs.push(p)}
  // luce principale con ombre
  const key=new THREE.DirectionalLight(0xf6f4ef,2.0);key.position.set(4,10,7);key.castShadow=sh;key.shadow.mapSize.set(2048,2048);const sc=key.shadow.camera;sc.left=-7;sc.right=7;sc.top=6;sc.bottom=-6;sc.near=1;sc.far=30;key.shadow.bias=-.0005;key.shadow.radius=6;G.add(key);G.add(key.target);
  const fill=new THREE.HemisphereLight(0xeef3f7,0x3a342e,.55);G.add(fill);
  G.traverse(o=>{if(o.isMesh&&o.material===glow){o.castShadow=false}});
  envScale(facScene,.45,.8);
  FAC={G,beltT,qBelt,sheets,rollers,drum,drumR:.42,bBody,bTop,tints,LANES,SP,BX0,ROWS,doughBall,hook,flour,fld,OX0,OX1,packs,QX0,QX1,key,inner,glow};
}
const dummy=new (window.THREE?THREE.Object3D:Object)();const cRaw=new (window.THREE?THREE.Color:Object)(0xF0DCB4),cBake=new (window.THREE?THREE.Color:Object)(0xC98E4A),cTmp2=new (window.THREE?THREE.Color:Object)();if(window.THREE){cRaw.convertSRGBToLinear();cBake.convertSRGBToLinear()}
function updateFactory(t,camX){
  const F=FAC,d=t*SPEED;
  F.beltT.offset.x=-d;F.qBelt.offset.x=-d;
  F.sheets.forEach(m=>{const o=-d/1.4;m.map.offset.x=o;m.bumpMap.offset.x=o});
  F.rollers.forEach(([m,r])=>m.rotation.z=d/r);F.drum.rotation.z=d/F.drumR;
  F.doughBall.rotation.y=t*.5;F.hook.rotation.y=-t*2.6;
  const fp=F.flour.geometry.attributes.position;for(let i=0;i<F.fld.length;i++){const f=F.fld[i];const k=(t*.9+f[0])%1;const spread=k*k*.18;fp.setXYZ(i,Math.cos(f[1])*spread*f[2],2.68-k*1.45,Math.sin(f[1])*spread*f[2])}fp.needsUpdate=true;
  const off=d%F.SP;let n=0;
  for(let r=0;r<F.ROWS;r++){const x=F.BX0+r*F.SP+off;const hide=x<-.5||x>10.55;
    const kb=eIO(seg(x,F.OX0+.3,F.OX1-.4));
    for(let l=0;l<F.LANES.length;l++){dummy.position.set(x,BT,F.LANES[l]);dummy.rotation.y=0;dummy.rotation.set(0,0,0);dummy.scale.setScalar(hide?.0001:1);dummy.updateMatrix();F.bBody.setMatrixAt(n,dummy.matrix);
      cTmp2.copy(cRaw).lerp(cBake,kb);const tt=F.tints[n]*kb;cTmp2.offsetHSL(0,0,tt);F.bBody.setColorAt(n,cTmp2);n++}}
  F.bBody.instanceMatrix.needsUpdate=true;F.bBody.instanceColor.needsUpdate=true;
  F.glow.emissiveIntensity=1.5+Math.sin(t*3.1)*.08+Math.sin(t*7.3)*.05;
  const L=F.QX1-F.QX0-.6;F.packs.forEach((p,i)=>{const x=F.QX0+.3+((d+i*L/F.packs.length)%L);p.position.set(x,(TX.gmp||TX.wpk)?.652:.92,((i%2)?.22:-.22));p.rotation.set(0,(TX.gmp||TX.wpk)?.03*Math.sin(i*2.1):0,0);p.visible=x<F.QX1-.35});
  F.key.position.set(camX+4,10,7);F.key.target.position.set(camX,0,0);
}
const ST=[{x:-10.4,c:[1.8,4.6,10.5],l:[0,1.7,0]},{x:-4.9,c:[1.0,3.6,7.6],l:[0,1.0,0]},{x:-.8,c:[.8,3.0,6.2],l:[.2,.95,0]},{x:4.5,c:[.5,4.2,10.2],l:[0,1.2,0]},{x:16.1,c:[-1.1,3.7,4.9],l:[.1,.62,0]}];
function stationPose(p,out){const f=clamp(p)*5;const i=Math.min(4,Math.floor(f));const l=f-i;const k=i<4?eIO(seg(l,.55,1)):0;const A=ST[i],B=ST[Math.min(4,i+1)];const m=mobile?1.9:1;
  out.px=lerp(A.x+A.c[0],B.x+B.c[0],k);out.py=lerp(A.c[1],B.c[1],k)+(mobile?1.4:0)+FY;out.pz=lerp(A.c[2],B.c[2],k)*m;
  out.lx=lerp(A.x+A.l[0],B.x+B.l[0],k);out.ly=lerp(A.l[1],B.l[1],k)+FY;out.lz=0}



/* ---------- Studio per i prodotti ---------- */
const spins=$$('.spin').map(el=>{const c=document.createElement('canvas');c.className='spin-cv';const im=$('img',el);if(im)im.replaceWith(c);else el.prepend(c);return{el,cv:c,ctx:c.getContext('2d'),model:el.dataset.model,a:rnd(-.5,.5),v:0,drag:false,vis:false,x:0,holder:null,dirty:true}});
const sio=new IntersectionObserver(es=>es.forEach(en=>{const s=spins.find(o=>o.el===en.target);if(s){s.vis=en.isIntersecting;s.dirty=true}}),{rootMargin:'120px'});
spins.forEach(s=>{sio.observe(s.el);
  s.el.addEventListener('pointerdown',e=>{s.drag=true;s.x=e.clientX;s.v=0;s.el.setPointerCapture(e.pointerId)});
  s.el.addEventListener('pointermove',e=>{if(!s.drag)return;const d=(e.clientX-s.x)*.01;s.a+=d;s.v=lerp(s.v,d,.5);s.x=e.clientX;s.dirty=true});
  ['pointerup','pointercancel','lostpointercapture'].forEach(t=>s.el.addEventListener(t,()=>s.drag=false));
  s.el.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){s.v-=.05;e.preventDefault()}if(e.key==='ArrowRight'){s.v+=.05;e.preventDefault()}s.dirty=true});
});
let T2=null,sc2,c2;
function stack(n,color){const g=new THREE.Group();for(let i=0;i<n;i++){const b=makeBiscuit(color);b.scale.setScalar(.95);b.position.y=.1+i*.205;b.rotation.y=rnd(0,6.28);b.rotation.z=rnd(-.02,.02);g.add(b)}const lean=makeBiscuit(color);lean.scale.setScalar(.95);lean.position.set(.95,.62,.5);lean.rotation.set(-.15,0,1.15);g.add(lean);return g}
function initSpins(){
  try{T2=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true})}catch(e){T2=null;return}
  T2.outputEncoding=THREE.sRGBEncoding;T2.toneMapping=THREE.ACESFilmicToneMapping;T2.toneMappingExposure=.8;T2.shadowMap.enabled=true;T2.shadowMap.type=THREE.VSMShadowMap;T2.setPixelRatio(1);T2.setSize(720,720);
  sc2=new THREE.Scene();sc2.environment=roomEnv(T2);
  const key=new THREE.DirectionalLight(0xfff1e2,2.2);key.position.set(-3,6,3);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.radius=10;const kc=key.shadow.camera;kc.left=-7;kc.right=7;kc.top=7;kc.bottom=-7;kc.near=1;kc.far=16;sc2.add(key);
  sc2.add(new THREE.HemisphereLight(0xffffff,0x6b5a48,.35));
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.22}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;sc2.add(ground);
  c2=new THREE.PerspectiveCamera(24,1,.1,50);c2.position.set(0,2.3,7.4);c2.lookAt(0,.75,0);
  const MAKE={
    biscotto:()=>stack(3,BAKED),
    bio:()=>{if(!TX.wpk)return stack(3,RICE);const g=new THREE.Group();const p=makePillow(TX.wpk,2.9,1.02,.16);p.rotation.x=Math.PI/2-.12;p.position.y=.55;g.add(p);return g},
    wafer:()=>{const g=new THREE.Group();const a=makeWafer();a.scale.setScalar(1.3);a.rotation.y=.3;g.add(a);const b=makeWafer();b.scale.setScalar(1.3);b.position.set(.15,.56,-.05);b.rotation.y=-.35;g.add(b);return g},
    crackers:()=>{const g=new THREE.Group();const k=makeCarton();k.scale.setScalar(1.15);k.position.y=1.0;k.traverse(o=>{if(o.isMesh)o.castShadow=true});g.add(k);return g},
    biocracker:()=>{const g=new THREE.Group();const f=makeFlow(TX.bcr,0x2E8FD8,2.3,1.27,.4);f.position.y=.66;f.rotation.x=-.12;f.traverse(o=>{if(o.isMesh)o.castShadow=true});g.add(f);return g}
  };
  spins.forEach(s=>{const f=MAKE[s.model];if(!f)return;s.holder=new THREE.Group();s.holder.add(f());s.holder.visible=false;sc2.add(s.holder)});envScale(sc2,.4,.8);
  sizeSpins();
  // quadrante della storia: biscotto dall'alto, luce radente
  T2.setSize(720,720);const c3=new THREE.PerspectiveCamera(24,1,.1,50);c3.position.set(0,6.2,0);c3.up.set(0,0,-1);c3.lookAt(0,0,0);ground.visible=false;
  const b=makeBiscuit(BAKED);b.scale.setScalar(1.18);envScale(b,.1,.8);sc2.add(b);T2.render(sc2,c3);$('#dialImg').src=T2.domElement.toDataURL('image/png');sc2.remove(b);ground.visible=true;
}
function sizeSpins(){const d=Math.min(2,devicePixelRatio||1);spins.forEach(s=>{const w=s.el.clientWidth||300,h=s.el.clientHeight||w;s.cv.width=Math.round(w*d);s.cv.height=Math.round(h*d);s.dirty=true})}
function renderSpins(dt){
  if(!T2)return;
  for(const s of spins){
    if(!s.vis||!s.holder)continue;
    if(!s.drag){s.a+=s.v;s.v*=Math.pow(.05,dt);if(!reduce)s.a+=dt*.28}
    if(reduce&&!s.dirty&&Math.abs(s.v)<1e-4)continue;
    s.dirty=false;spins.forEach(o=>{if(o.holder)o.holder.visible=o===s});
    s.holder.rotation.y=s.a;c2.aspect=s.cv.width/s.cv.height;c2.updateProjectionMatrix();T2.setSize(Math.min(900,s.cv.width),Math.min(900,s.cv.height),false);
    T2.render(sc2,c2);s.ctx.clearRect(0,0,s.cv.width,s.cv.height);s.ctx.drawImage(T2.domElement,0,0,s.cv.width,s.cv.height)}
}

/* ---------- Inizializzazione e ciclo ---------- */
function initThree(){
  R3=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  R3.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.5:1.6));R3.setSize(vw,vh);R3.outputEncoding=THREE.sRGBEncoding;R3.toneMapping=THREE.ACESFilmicToneMapping;R3.toneMappingExposure=1.0;
  R3.shadowMap.enabled=true;R3.shadowMap.type=mobile?THREE.PCFSoftShadowMap:THREE.VSMShadowMap;
  stageEl.appendChild(R3.domElement);
  if(IMG.crk)TX.crk=imgTex(IMG.crk);if(IMG.bcr)TX.bcr=imgTex(IMG.bcr);if(IMG.bwf)TX.bwf=imgTex(IMG.bwf);
  TX.pf=tex(packFront());TX.ps=tex(packSide());TX.dot=dotTex();if(IMG.wpk)TX.wpk=imgTex(IMG.wpk);
  buildBiscuitMaps();buildCrackerMaps();buildWaferMaps();buildGMMaps();if(IMG.gmp)TX.gmp=imgTex(IMG.gmp);
  buildHero();
  if(!reduce)buildFactory();
  if(!mobile&&!reduce)initPost();
  layout();
  if(fine)addEventListener('pointermove',e=>{mx=e.clientX/vw*2-1;my=e.clientY/vh*2-1},{passive:true});
  setTimeout(initSpins,reduce?50:500);
}
function layout(){
  if(!R3)return;R3.setSize(vw,vh);[heroCam,facCam].forEach(c=>{if(c){c.aspect=vw/vh;c.updateProjectionMatrix()}});sizePost();if(T2)sizeSpins();
}
function viewShift(c,k){if(k>.001){if(mobile)c.setViewOffset(vw,vh,0,vh*.12*k,vw,vh);else c.setViewOffset(vw,vh,-vw*.16*k,0,vw,vh)}else if(c.view&&c.view.enabled)c.clearViewOffset()}
const POSE={},CP=new (window.THREE?THREE.Vector3:Object)(),CL=new (window.THREE?THREE.Vector3:Object)();let camInit=false,lastScene=null;
function threeFrame(now,y,dt){
  if(!R3)return;
  const motion=!reduce;const t=now/1000;
  const heroP=motion?clamp(y/vh):0;
  const procP=motion?clamp((y-T.proc)/(T.procH-vh)):0;
  const end=T.proc+T.procH-vh;
  const fade=motion?1-seg(y,end+vh*.05,end+vh*.55):1;
  stageEl.style.opacity=fade;stageEl.style.visibility=fade<=.001?'hidden':'visible';
  if(fade<=.001)return;
  if(!motion&&!needStatic)return;
  const sm=1-Math.exp(-dt*3);smx+=(mx-smx)*sm;smy+=(my-smy)*sm;
  const useFac=motion&&FAC&&heroP>=.78;
  const vv=motion?clamp(1-Math.abs(heroP-.78)/.16):0;veil.style.opacity=(vv*vv*(3-2*vv)).toFixed(3);
  if(!useFac){
    heroPose(heroP,motion?t:0,POSE);
    if(lastScene!=='hero'||!camInit){CP.set(POSE.px,POSE.py,POSE.pz);CL.set(POSE.lx,POSE.ly,POSE.lz);camInit=true}
    else{const k=1-Math.exp(-dt*5);CP.x+=(POSE.px-CP.x)*k;CP.y+=(POSE.py-CP.y)*k;CP.z+=(POSE.pz-CP.z)*k;CL.x+=(POSE.lx-CL.x)*k;CL.y+=(POSE.ly-CL.y)*k;CL.z+=(POSE.lz-CL.z)*k}
    heroCam.position.copy(CP);heroCam.lookAt(CL);viewShift(heroCam,1);lastScene='hero';
    const f=heroCam.position.distanceTo(HERO.focusPt);
    render(heroScene,heroCam,f,mobile?8:16+heroP*14,t);
  }else{
    stationPose(procP,POSE);
    if(lastScene!=='fac'){CP.set(POSE.px,POSE.py,POSE.pz);CL.set(POSE.lx,POSE.ly,POSE.lz)}
    else{const k=1-Math.exp(-dt*3.2);CP.x+=(POSE.px-CP.x)*k;CP.y+=(POSE.py-CP.y)*k;CP.z+=(POSE.pz-CP.z)*k;CL.x+=(POSE.lx-CL.x)*k;CL.y+=(POSE.ly-CL.y)*k;CL.z+=(POSE.lz-CL.z)*k}
    facCam.position.copy(CP);facCam.position.x+=Math.sin(t*.21)*.06;facCam.position.y+=Math.sin(t*.29)*.03;facCam.lookAt(CL);viewShift(facCam,1);lastScene='fac';
    updateFactory(t,CL.x);
    render(facScene,facCam,facCam.position.distanceTo(CL),9,t);
  }
  needStatic=false;
}

/* ---------- Ciclo principale ---------- */
const procSteps=$$('.proc-steps li'),procBar=$('.proc-bar i');let pIdx=0;
function procUpd(y){if(reduce||!gl)return;const p=clamp((y-T.proc)/(T.procH-vh));const i=Math.min(4,Math.floor(p*5));if(i!==pIdx){pIdx=i;procSteps.forEach((l,j)=>l.classList.toggle('on',j===i))}procBar.style.transform='scaleX('+p.toFixed(4)+')'}
if(reduce||!gl)procSteps.forEach(l=>l.classList.add('on'));
let prevY=-1,prevS=-1,sy=scrollY,lastT=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;const y=scrollY;
  if(reduce)sy=y;else{sy+=(y-sy)*(1-Math.exp(-dt*9));if(Math.abs(y-sy)<.2)sy=y}
  if(y!==prevY){headerUpd(y);lastY=y;statementUpd();prevY=y}
  if(sy!==prevS){hzUpd(sy);storyUpd(sy);procUpd(sy);prevS=sy}
  if(gl){threeFrame(now,sy,dt);renderSpins(dt)}
  if(gvis){if(!gdrag&&!reduce){grot+=dt*.1+gvel;gvel*=Math.pow(.02,dt)}globeDraw(now)}
  requestAnimationFrame(frame);
}
function start(){
  measure();
  if(gl){try{initThree()}catch(e){console.warn(e);gl=false;root.classList.remove('gl')}}
  headerUpd(scrollY);statementUpd();hzUpd(scrollY);storyUpd(scrollY);gsizeUpd();
  requestAnimationFrame(frame);
}
let rT;addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(()=>{measure();layout();needStatic=true;gsizeUpd();prevY=-1;prevS=-1},120)});
addEventListener('load',()=>{measure();prevY=-1;prevS=-1});
const fontsReady=document.fonts&&document.fonts.load?Promise.race([Promise.all([document.fonts.load('500 80px Newsreader'),document.fonts.load('600 20px "Hanken Grotesk"')]),new Promise(r=>setTimeout(r,1500))]):Promise.resolve();
Promise.all([fontsReady,imgsReady]).then(start,start);
})();

