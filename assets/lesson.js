/* Ivrit — shared engine v5 (mobile-first stepper).
   One step per screen · video pinned at the top · one primary action in a bottom bar · nothing important off-screen.
   No browser TTS anywhere: every Hebrew voice is the real speaker, via the official YouTube embed. */
(function(){
'use strict';
const TZ='America/New_York', START='2026-10-15', KEY='ivx1';
const fmtD=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'});
const today=()=>fmtD.format(new Date());
const addDays=(d,n)=>{const[Y,M,D]=d.split('-').map(Number);return new Date(Date.UTC(Y,M-1,D+n)).toISOString().slice(0,10)};
const dayIndex=()=>Math.round((Date.parse(today()+'T00:00:00Z')-Date.parse(START+'T00:00:00Z'))/864e5)+1;
const mmss=t=>{t=Math.max(0,t);const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+(Math.round(s*10)/10).toFixed(1)};
const hourNY=()=>+new Intl.DateTimeFormat('en-US',{timeZone:TZ,hour:'numeric',hour12:false}).format(new Date())%24;
const niceDate=d=>{const[Y,M,D]=d.split('-').map(Number);return new Date(Date.UTC(Y,M-1,D)).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'})};

/* ---------- state (one store for every lesson) ---------- */
function blank(){return{v:1,xp:0,streak:0,lastDay:'',done:{},steps:{},comp:{},srs:{},nudge:{},tr:false,awarded:{},pos:{}}}
function migrate(s){try{let xp=0;for(let i=1;i<=30;i++)xp+=+localStorage.getItem('fxp'+i)||0;s.xp=xp;
  const d=JSON.parse(localStorage.getItem('fxLessons')||'{}');Object.keys(d).forEach(k=>s.done['l'+k]=1);
  s.streak=+localStorage.getItem('fxStreak')||0;s.lastDay=localStorage.getItem('fxLastDay')||''}catch(e){}return s}
function load(){let s=null;try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(!s){s=migrate(blank());try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  return Object.assign(blank(),s)}
let S=load();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
function streakNow(){const t=today();return(S.lastDay===t||S.lastDay===addDays(t,-1))?S.streak:0}
function markActive(){const t=today();if(S.lastDay!==t){S.streak=(S.lastDay===addDays(t,-1))?S.streak+1:1;S.lastDay=t;save()}}
function award(k,n){if(S.awarded[k])return 0;S.awarded[k]=1;S.xp+=n;save();return n}

/* ---------- tiny DOM helpers ---------- */
function h(tag,a,...kids){const e=document.createElement(tag);if(a)for(const k in a){const v=a[k];if(v==null||v===false)continue;
  if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?'':v)}
  kids.flat().forEach(c=>{if(c==null||c===false)return;e.appendChild(typeof c==='string'?document.createTextNode(c):c)});return e}
const he=(t,cls)=>h('span',{class:'he'+(cls?' '+cls:''),dir:'rtl',lang:'he'},t);
/* wrap Hebrew runs inside mixed English/Hebrew HTML in <bdi> so punctuation and word order render correctly */
const HEB_RUN=/[\u05D0-\u05EA][\u0591-\u05F4\s,.?!:…'"׳״־\-–]*[\u05D0-\u05EA\u0591-\u05C7][.?!…]?/g;
function bidi(html){if(!html)return '';return String(html).split(/(<[^>]+>)/).map(p=>p.startsWith('<')?p:p.replace(HEB_RUN,m=>'<bdi class="he" lang="he">'+m+'</bdi>')).join('')}
const rich=(html,cls)=>h('div',{class:cls||'',html:bidi(html)});
let toastEl=null;
function toast(msg,ms){if(toastEl)toastEl.remove();const t=toastEl=h('div',{class:'toast',role:'status'},msg);document.body.appendChild(t);setTimeout(()=>t.classList.add('out'),(ms||3200)-300);setTimeout(()=>t.remove(),ms||3200)}
const chip=(label,fn,cls)=>h('button',{class:'chip'+(cls?' '+cls:''),type:'button',onclick:fn},label);
const vibe=n=>{try{navigator.vibrate&&navigator.vibrate(n||12)}catch(e){}};
/* scroll an element inside its scroll container just enough to be fully visible */
function ensureVisible(el){requestAnimationFrame(()=>{const sc=el.closest('.stage');if(!sc)return el.scrollIntoView({behavior:'smooth',block:'nearest'});
  const r=el.getBoundingClientRect(),c=sc.getBoundingClientRect();
  if(r.bottom>c.bottom-8||r.top<c.top){sc.scrollTo({top:sc.scrollTop+(r.height>c.height-24?r.top-c.top-12:r.bottom-c.bottom+16),behavior:'smooth'})}})}

/* ---------- Hebrew comparison (lenient: niqqud, punctuation, final letters, ו/י spelling) ---------- */
const FIN={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};
function normW(w){return w.replace(/[\u0591-\u05C7]/g,'').replace(/[ךםןףץ]/g,c=>FIN[c]).replace(/[^\u05D0-\u05EAa-z0-9]/gi,'').toLowerCase()}
const loose=w=>w.replace(/[וי]/g,'');
function tok(s){return String(s).replace(/[־–—\-\/]/g,' ').split(/\s+/).map(w=>({raw:w,n:normW(w)})).filter(w=>w.n)}
function lev(a,b){if(Math.abs(a.length-b.length)>1)return 9;const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
function wEq(a,b){if(a===b||loose(a)===loose(b))return 2;if(a.length>=3&&lev(a,b)<=1)return 1;return 0}
function wordDiff(target,input){const T=tok(target);let U=tok(input);
  U=U.flatMap(u=>{for(let i=0;i+1<T.length;i++){const c=T[i].n+T[i+1].n;if(u.n===c||loose(u.n)===loose(c))return[{raw:T[i].raw,n:T[i].n},{raw:T[i+1].raw,n:T[i+1].n}]}return[u]});
  const n=T.length,m=U.length;
  const dp=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--){const e=wEq(T[i].n,U[j].n);dp[i][j]=Math.max(dp[i+1][j],dp[i][j+1],e?dp[i+1][j+1]+e:0)}
  const out=[];let i=0,j=0;
  while(i<n||j<m){if(i<n&&j<m){const e=wEq(T[i].n,U[j].n);if(e&&dp[i][j]===dp[i+1][j+1]+e){out.push({w:T[i].raw,t:e===2?'ok':'close',you:U[j].raw});i++;j++;continue}}
    if(j<m&&(i>=n||dp[i][j+1]>=dp[i+1][j])){out.push({w:U[j].raw,t:'extra'});j++}else{out.push({w:T[i].raw,t:'miss'});i++}}
  const ok=out.filter(o=>o.t==='ok').length,close=out.filter(o=>o.t==='close').length;
  return{parts:out,score:n?Math.round((ok+close*.5)/n*100):0,ok,close,total:n}}
function renderDiff(d){const verdict=d.score>=90?['🎯','Nailed it']:d.score>=60?['👌','Close']:['👂','Listen once more'];
  return h('div',{class:'diffbox'},h('div',{class:'verdict'},h('span',{},verdict[0]),h('b',{},verdict[1]),h('span',{class:'score'},d.score+'%')),
    h('div',{class:'diff',dir:'rtl',lang:'he'},d.parts.map(p=>h('span',{class:'w-'+p.t},p.w))),
    h('div',{class:'legend'},h('i',{class:'w-ok'}),'right ',h('i',{class:'w-close'}),'almost ',h('i',{class:'w-miss'}),'missed ',h('i',{class:'w-extra'}),'extra'))}

/* ---------- YouTube IFrame API wrapper (official player, never covered or hidden) ---------- */
const ytQ=[];let ytLoaded=false;
window.onYouTubeIframeAPIReady=function(){ytLoaded=true;ytQ.splice(0).forEach(f=>f())};
function whenYT(f){if(window.YT&&window.YT.Player&&ytLoaded)f();else ytQ.push(f);
  if(!document.getElementById('yt-api')){const s=h('script',{id:'yt-api',src:'https://www.youtube.com/iframe_api'});document.head.appendChild(s)}}
function Player(el,videoId){
  const P={ready:false,q:[],cur:videoId,timer:null,yt:null,tok:0};
  whenYT(()=>{P.yt=new YT.Player(el,{videoId,playerVars:{rel:0,playsinline:1,modestbranding:1},
    events:{onReady:()=>{P.ready=true;P.q.splice(0).forEach(f=>f())},onError:e=>{P.err=e.data;toast('Video error '+e.data+' — try “Open on YouTube”.')}}})});
  P.do=f=>{if(P.ready)f();else P.q.push(f)};
  P.clear=()=>{P.tok++;if(P.timer){clearInterval(P.timer);P.timer=null}};
  P.stop=()=>{P.clear();P.do(()=>{try{P.yt.pauseVideo()}catch(e){}})};
  /* play [start,end] at rate, `loops` times, then pause and call onEnd */
  P.seg=(vid,start,end,o)=>{o=o||{};P.clear();const my=P.tok;P.do(()=>{if(my!==P.tok)return;const y=P.yt,rate=o.rate||1;let loops=o.loops||1,entered=false,t0=Date.now();
    if(vid!==P.cur){P.cur=vid;y.loadVideoById({videoId:vid,startSeconds:start})}else{y.seekTo(start,true);y.playVideo()}
    try{y.setPlaybackRate(rate)}catch(e){}
    const maxMs=((end-start)/rate+10)*1000;
    P.timer=setInterval(()=>{let t;try{t=y.getCurrentTime()}catch(e){return}
      if(!entered){if(t>=start-1.5&&t<end){entered=true}else if(Date.now()-t0<4000)return}
      if(t>=end||Date.now()-t0>maxMs){
        if(--loops>0){entered=false;t0=Date.now();y.seekTo(start,true);try{y.setPlaybackRate(rate)}catch(e){}return}
        if(P.timer){clearInterval(P.timer);P.timer=null}try{y.pauseVideo()}catch(e){}if(o.onEnd&&my===P.tok)o.onEnd()}},50)})};
  /* 1× then 0.75× — the default "listen" move */
  P.twice=(vid,start,end,onEnd)=>{P.seg(vid,start,end,{rate:1,onEnd:()=>{const my=P.tok;setTimeout(()=>{if(my===P.tok)P.seg(vid,start,end,{rate:.75,onEnd})},550)}})};
  P.full=vid=>P.do(()=>{P.clear();const y=P.yt;vid=vid||videoId;if(vid!==P.cur){P.cur=vid;y.loadVideoById({videoId:vid,startSeconds:0})}else{try{y.setPlaybackRate(1)}catch(e){}y.seekTo(0,true);y.playVideo()}});
  P.rate=()=>{try{return P.yt.getPlaybackRate()}catch(e){return null}};
  P.time=()=>{try{return P.yt.getCurrentTime()}catch(e){return null}};
  return P}

/* ---------- recording (MediaRecorder; stays on the device, never uploaded) ---------- */
const canRec=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
let recActive=null;
async function recStart(maxMs){const st=await navigator.mediaDevices.getUserMedia({audio:true});
  const mt=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t));
  const mr=new MediaRecorder(st,mt?{mimeType:mt}:undefined),chunks=[];
  mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  const done=new Promise(res=>{mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());res(new Blob(chunks,{type:mr.mimeType||mt||'audio/mp4'}))}});
  mr.start();const timer=setTimeout(()=>{if(mr.state==='recording')mr.stop()},maxMs||12000);
  return{stop:()=>{clearTimeout(timer);if(mr.state==='recording')mr.stop();return done},done}}
function stopRec(){if(recActive){try{recActive.stop()}catch(e){}recActive=null}}
function unlock(a){try{a.muted=true;const p=a.play();if(p&&p.then)p.then(()=>{a.pause();a.currentTime=0;a.muted=false}).catch(()=>{a.muted=false});else{a.pause();a.muted=false}}catch(e){a.muted=false}}
/* recorder state machine bound to the primary button: idle → recording → has take */
function Recorder(){const R={url:null,audio:h('audio',{preload:'auto',playsinline:true}),r:null};
  R.start=async(onAuto)=>{if(recActive)stopRec();R.r=await recStart(12000);recActive=R.r;R.r.done.then(b=>{if(R.r){R.r=null;recActive=null;R.set(b);onAuto&&onAuto()}})};
  R.stop=async()=>{if(!R.r)return;const r=R.r;R.r=null;recActive=null;R.set(await r.stop())};
  R.set=b=>{if(R.url)URL.revokeObjectURL(R.url);R.url=URL.createObjectURL(b);R.audio.src=R.url};
  R.play=()=>{if(!R.url)return;R.audio.currentTime=0;R.audio.play().catch(()=>toast('Tap “▶ Me” to hear yourself.'))};
  return R}

/* ---------- lessons registry (Fauda ids 1…, speech ids 101…) ---------- */
const LESSONS={};
const SPEECH0=100;const isSpeech=L=>!!L&&(L.track==='speech'||L.id>SPEECH0);
const lname=L=>isSpeech(L)?'Speech '+(L.id-SPEECH0):'Lesson '+L.id;
const who=L=>isSpeech(L)?'Speaker':'Actor';
const dataFile=id=>id>SPEECH0?'data/speech-'+(id-SPEECH0)+'.js':'data/lesson-'+id+'.js';
function register(d){LESSONS[d.id]=d}
function loadLesson(id){return new Promise(res=>{if(LESSONS[id])return res(LESSONS[id]);const s=h('script',{src:dataFile(id)});s.onload=()=>res(LESSONS[id]||null);s.onerror=()=>res(null);document.head.appendChild(s)})}
function seg(L,i){const ln=L.lines[i],k='l'+L.id+':'+i,n=S.nudge[k]||{s:0,e:0};return{start:Math.max(0,ln.start+n.s),end:ln.end+n.e,key:k}}
const thumb=v=>v?'https://i.ytimg.com/vi/'+v+'/hqdefault.jpg':'';

/* ---------- spaced review scheduling (unchanged intervals: 1 → 2 → 5 → 13 days…) ---------- */
function addToDeck(L){const t=today();let added=0;L.lines.forEach((_,i)=>{const k='l'+L.id+':'+i;if(!S.srs[k]){S.srs[k]={due:addDays(t,1),ivl:0,reps:0,lapses:0};added++}});save();return added}
function dueItems(exclude){const t=today();return Object.entries(S.srs).filter(([k,v])=>v.due<=t&&(!exclude||!k.startsWith('l'+exclude+':'))).sort((a,b)=>a[1].due<b[1].due?-1:1).map(([k])=>k)}
function grade(k,g){const it=S.srs[k],t=today();if(!it)return;
  if(g==='again'){it.ivl=1;it.lapses++;it.reps=0}
  else if(g==='good'){it.ivl=it.ivl<1?2:Math.max(it.ivl+1,Math.round(it.ivl*2.5));it.reps++}
  else{it.ivl=it.ivl<1?4:Math.max(it.ivl+2,Math.round(it.ivl*3.5));it.reps++}
  it.due=addDays(t,it.ivl);S.xp+=g==='again'?1:2;save()}
const parseKey=k=>{const c=k.lastIndexOf(':');return{id:+k.slice(1,c),i:+k.slice(c+1)}};

/* ---------- app shell: top bar · pinned video · stage · bottom action bar ---------- */
const ICON={x:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  back:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'};
function headTags(){const m=(n,c)=>{if(!document.querySelector('meta[name="'+n+'"]'))document.head.appendChild(h('meta',{name:n,content:c}))};
  m('apple-mobile-web-app-capable','yes');m('mobile-web-app-capable','yes');m('apple-mobile-web-app-status-bar-style','black-translucent');m('apple-mobile-web-app-title','Ivrit');
  const t=document.querySelector('meta[name="theme-color"]');if(t)t.content='#0a0c10'}
function shell(o){o=o||{};headTags();document.body.className='app'+(S.tr?'':' hide-tr');
  const prog=h('div',{class:'prog',role:'progressbar'}),label=h('div',{class:'plabel'});
  const right=h('div',{class:'tright'});
  const top=h('header',{class:'apptop'},h('a',{class:'x',href:'index.html','aria-label':'Close and go home',html:ICON.x}),h('div',{class:'pwrap'},prog,label),right);
  const pv=h('div',{});const player=h('div',{class:'player'},h('div',{class:'box'},pv));
  const stage=h('main',{class:'stage'});
  const back=h('button',{class:'ab back',type:'button','aria-label':'Back',html:ICON.back});
  const pri=h('button',{class:'ab pri',type:'button'});
  const skip=h('button',{class:'ab skip',type:'button'},'Skip');
  const grades=h('div',{class:'grades',hidden:true});
  const actions=h('footer',{class:'actions'},back,pri,grades,skip);
  document.body.append(top,player,stage,actions);
  /* iOS keyboard: keep the action bar above it */
  if(window.visualViewport){const vv=visualViewport;const f=()=>{const kb=Math.max(0,innerHeight-vv.height-vv.offsetTop);document.body.style.setProperty('--kb',kb+'px');document.body.classList.toggle('kb',kb>80)};vv.addEventListener('resize',f);vv.addEventListener('scroll',f)}
  const A={top,prog,label,right,pv,player,stage,back,pri,skip,grades,actions};
  A.setPri=(lab,fn,op)=>{op=op||{};grades.hidden=true;pri.hidden=false;pri.textContent=lab;pri.onclick=fn?()=>{vibe();fn()}:null;pri.disabled=!!op.disabled;
    pri.className='ab pri'+(op.cls?' '+op.cls:'');skip.hidden=!op.skip;skip.textContent=op.skipLabel||'Skip';skip.onclick=op.skip||null};
  A.setGrades=(items)=>{pri.hidden=true;skip.hidden=true;grades.hidden=false;grades.innerHTML='';items.forEach(([lab,cls,fn])=>grades.appendChild(h('button',{class:'ab '+cls,type:'button',onclick:()=>{vibe(18);fn()}},lab)))};
  A.segments=(n)=>{prog.innerHTML='';for(let i=0;i<n;i++)prog.appendChild(h('i',{},h('b',{})))};
  A.fill=(fr)=>{[...prog.children].forEach((s,i)=>{s.firstChild.style.width=Math.max(0,Math.min(1,fr[i]||0))*100+'%'})};
  return A}
/* Flow: an ordered list of screens with Back/Next, transitions and resume */
function Flow(A,screens,o){o=o||{};let cur=-1;
  const secs=o.sections||[];
  const go=(i,dir)=>{if(i<0||i>=screens.length)return;o.P&&o.P.stop();stopRec();
    const prev=cur;cur=i;const sc=screens[i];
    A.stage.innerHTML='';const el=h('div',{class:'screen'+(dir<0?' back':'')});A.stage.appendChild(el);A.stage.scrollTop=0;
    const nx=screens[i+1];const nextLabel=!nx?'Finish':(nx.sec===sc.sec?(sc.nextWord||'Next'):'Next: '+secs[nx.sec]);
    const ctx={el,i,A,P:o.P,nextLabel,
      next:()=>{if(sc.onDone)sc.onDone();if(o.onComplete)o.onComplete(i);go(i+1,1)},
      done:()=>{if(o.onComplete)o.onComplete(i)},
      show:node=>ensureVisible(node),
      pri:(l,f,op)=>A.setPri(l,f,op),
      cont:(lab)=>A.setPri(lab||nextLabel,()=>ctx.next())};
    A.back.onclick=()=>{vibe();if(cur>0)go(cur-1,-1);else location.href='index.html'};
    if(secs.length){A.segments(secs.length);const fr=secs.map((_,s)=>{const idx=screens.map((x,j)=>x.sec===s?j:-1).filter(j=>j>=0);if(!idx.length)return 0;const pos=idx.indexOf(i);return i>idx[idx.length-1]?1:pos<0?0:(pos+.5)/idx.length});A.fill(fr);
      const inSec=screens.filter(x=>x.sec===sc.sec),k=inSec.indexOf(sc);A.label.textContent=secs[sc.sec]+(inSec.length>1?' · '+(k+1)+' of '+inSec.length:'')}
    else{A.segments(screens.length);A.fill(screens.map((_,j)=>j<i?1:j===i?.5:0));A.label.textContent=sc.label||''}
    sc.render(ctx);
    if(o.onGo)o.onGo(i,prev)};
  return{go,get cur(){return cur},screens}}

function legalFoot(){return h('div',{class:'legal'},'Videos © their owners (yes / Fauda; official channels), embedded with the official YouTube player (YouTube API Services: ',h('a',{href:'https://www.youtube.com/t/terms',target:'_blank',rel:'noopener'},'YouTube Terms'),', ',h('a',{href:'https://policies.google.com/privacy',target:'_blank',rel:'noopener'},'Google Privacy Policy'),'). By using this site you agree to YouTube’s Terms. Progress is stored only in this browser; recordings stay on your device and are never uploaded. Not affiliated with yes, Netflix, YouTube or the Israeli government. Speech clips are here for the language only — no political position is taken.')}

/* ---------- shared building blocks ---------- */
const kick=t=>h('div',{class:'kick'},t);
function trToggle(){const b=h('button',{class:'link',type:'button'});const paint=()=>b.textContent=S.tr?'Hide pronunciation':'Show pronunciation';paint();
  b.onclick=()=>{S.tr=!S.tr;save();document.body.classList.toggle('hide-tr',!S.tr);document.querySelectorAll('.link.trt').forEach(x=>x.textContent=S.tr?'Hide pronunciation':'Show pronunciation')};b.classList.add('trt');return b}
function lineBlock(L,i,o){o=o||{};const ln=L.lines[i];
  return h('div',{class:'line'},h('div',{class:'he big',dir:'rtl',lang:'he'},ln.he),ln.tr?h('div',{class:'tr'},ln.tr):null,h('div',{class:'en'},ln.en),
    o.lean?null:[ln.note?rich(ln.note,'lnote'):null,ln.reg?h('div',{class:'reg',html:'<b>Register</b>'+bidi(ln.reg)}):null],
    ln.tr&&!o.noTr?h('div',{class:'lfoot'},trToggle()):null)}
function timingFix(L,P,i){const k='l'+L.id+':'+i;const win=h('b',{});const paint=()=>{const s=seg(L,i);win.textContent=mmss(s.start)+' – '+mmss(s.end)};paint();
  const nud=(f,d)=>{const n=S.nudge[k]||{s:0,e:0};n[f]=Math.round((n[f]+d)*10)/10;S.nudge[k]=n;save();paint()};
  const test=()=>{const s=seg(L,i);P.seg(L.video,s.start,s.end)};
  const panel=h('div',{class:'nudge',hidden:true},h('div',{class:'nrow'},'Clip ',win,chip('▶ Test',test,'sm')),
    h('div',{class:'nrow'},h('span',{},'Starts'),chip('earlier',()=>nud('s',-.5),'sm'),chip('later',()=>nud('s',.5),'sm')),
    h('div',{class:'nrow'},h('span',{},'Ends'),chip('earlier',()=>nud('e',-.5),'sm'),chip('later',()=>nud('e',.5),'sm')),
    h('div',{class:'small'},'Saved on this phone. Each tap moves it half a second.'));
  const b=h('button',{class:'link dim',type:'button',onclick:()=>{panel.hidden=!panel.hidden;if(!panel.hidden)ensureVisible(panel)}},'Line cut off? Fix timing');
  return h('div',{class:'fix'},b,panel)}
const note=(html,cls)=>h('div',{class:'note'+(cls?' '+cls:''),html:bidi(html)});

/* ---------- lesson page: one screen per step ---------- */
const SECS=['Watch','Key lines','Dictation','Shadow','Say it','Rewatch','Use it'];
function lessonPage(id){const L=LESSONS[id];const lid='l'+L.id;S.steps[lid]=S.steps[lid]||{};
  const A=shell();const P=Player(A.pv,L.video);IVX._player=P;
  const screens=[];
  screens.push({sec:0,render:c=>scIntro(L,P,c)});
  screens.push({sec:0,render:c=>scGist(L,P,c)});
  L.lines.forEach((_,i)=>screens.push({sec:1,nextWord:'Next line',render:c=>scLine(L,P,i,c)}));
  L.dictation.forEach((li,k)=>screens.push({sec:2,render:c=>scDict(L,P,li,k,c)}));
  L.shadow.forEach((li,k)=>screens.push({sec:3,render:c=>scShadow(L,P,li,k,c)}));
  L.say.forEach((s,k)=>screens.push({sec:4,render:c=>scSay(L,P,s,k,c)}));
  screens.push({sec:5,render:c=>scRewatch(L,P,c)});
  screens.push({sec:6,render:c=>scFinish(L,P,c)});
  const F=Flow(A,screens,{P,sections:SECS,
    onComplete:i=>{const sc=screens[i],nx=screens[i+1];if(!nx||nx.sec!==sc.sec){if(!S.steps[lid][sc.sec]){S.steps[lid][sc.sec]=1;save()}award(lid+':s'+sc.sec,10)}},
    onGo:i=>{S.pos[lid]=i;save()}});
  IVX._go=sec=>F.go(screens.findIndex(s=>s.sec===sec),1);IVX._flow=F;
  const start=S.done[lid]?0:Math.min(S.pos[lid]||0,screens.length-1);F.go(start,1)}

function scIntro(L,P,c){const lid='l'+L.id;
  c.el.append(kick(isSpeech(L)?`${lname(L)} · Formal Hebrew`:`Lesson ${L.id} · Day ${L.day}`),h('h1',{},L.title),
    h('div',{class:'src'},he(L.heTitle),h('span',{},' · '+L.duration+' · '+(L.credit||'yes tv')+' · '),h('a',{href:'https://www.youtube.com/watch?v='+L.video,target:'_blank',rel:'noopener'},'YouTube')),
    rich(L.blurb,'sub'));
  (L.warnings||[]).forEach(w=>c.el.appendChild(note(w,'warn')));
  c.el.append(h('div',{class:'howto'},h('div',{class:'hstep'},h('b',{},'1'),h('span',{},'Watch the whole scene. No text — just follow the story.')),h('div',{class:'hstep'},h('b',{},'2'),h('span',{},'Then we take it apart line by line: ears first, then your mouth.'))));
  if(S.done[lid])c.el.appendChild(note('You finished this one already — run it again any time.'));
  let played=false;
  c.pri('▶  Play the scene',()=>{played=true;P.full();c.pri('I watched it  →',()=>c.next())},{skip:()=>c.next(),skipLabel:'Skip'})}

function scGist(L,P,c){const g=L.gist;
  c.el.append(kick('Gist check'),h('h2',{},g.q),h('p',{class:'sub'},'From what you just heard — no pressure, it’s one question.'));
  const box=h('div',{class:'opts'});const fb=h('div',{class:'fb',hidden:true});
  const ord=g.o.map((_,i)=>i).sort(()=>Math.random()-.5);let answered=false;
  ord.forEach(j=>{const b=h('button',{class:'opt',type:'button'},g.o[j]);b.onclick=()=>{if(answered)return;answered=true;vibe();b.classList.add(j===g.a?'ok':'bad');
    box.querySelectorAll('.opt')[ord.indexOf(g.a)].classList.add('ok');box.classList.add('answered');
    fb.hidden=false;fb.innerHTML='';fb.append(h('b',{},j===g.a?'✅ Right. ':'Not quite. '),rich(g.f,'fbt'));c.show(fb);c.cont()};box.appendChild(b)});
  c.el.append(box,fb);
  c.pri('Pick an answer',null,{disabled:true,skip:()=>c.next()})}

function scLine(L,P,i,c){const ln=L.lines[i],sg=()=>seg(L,i);
  c.el.append(kick(`Line ${i+1} of ${L.lines.length}`),h('h2',{},'Listen. Say it back out loud.'),h('p',{class:'sub'},'Plays at full speed, then slower. Try to catch it before you look.'));
  if(i===0&&L.burnedIn)c.el.appendChild(note('This clip has Hebrew subtitles burned in. For a real listening rep, look away from the video while it plays.'));
  let revealed=false,loopOn=false;
  const slot=h('div',{});
  const veil=h('button',{class:'veil',type:'button'},h('span',{class:'veil-ic'},'👂'),h('span',{},'Tap to show the line'));
  const shown=h('div',{},lineBlock(L,i),timingFix(L,P,i));
  const reveal=()=>{if(revealed)return;revealed=true;veil.replaceWith(shown);c.show(shown);c.cont()};
  veil.onclick=()=>{vibe();reveal()};slot.appendChild(veil);
  const loopB=chip('↻ Loop',()=>{loopOn=!loopOn;loopB.classList.toggle('on',loopOn);if(loopOn){const s=sg();P.seg(L.video,s.start,s.end,{loops:6,rate:.75,onEnd:()=>{loopOn=false;loopB.classList.remove('on')}});if(!revealed)c.pri('Show the line',reveal)}else P.stop()});
  c.el.append(h('div',{class:'chips'},chip('▶ 1×',()=>{const s=sg();P.seg(L.video,s.start,s.end)}),chip('🐢 Slow',()=>{const s=sg();P.seg(L.video,s.start,s.end,{rate:.75})}),loopB),slot);
  const listen=()=>{const s=sg();c.pri('Playing…  tap to stop',()=>{P.stop();after()},{cls:'busy'});P.twice(L.video,s.start,s.end,after)};
  const after=()=>{if(!revealed)c.pri('Show the line',reveal,{skip:()=>c.next()});else c.cont()};
  c.pri('▶  Listen',listen,{skip:()=>c.next()})}

function scDict(L,P,li,k,c){const ln=L.lines[li],sg=()=>seg(L,li);
  c.el.append(kick(`Dictation ${k+1} of ${L.dictation.length}`),h('h2',{},'Type exactly what you hear'),h('p',{class:'sub'},'Switch to the Hebrew keyboard (🌐). Vowel spelling, final letters and punctuation don’t count.'));
  if(L.burnedIn&&k===0)c.el.appendChild(note('Subtitles are burned into this clip — don’t look at the video while it plays.'));
  const ta=h('textarea',{class:'in',dir:'rtl',lang:'he',rows:2,autocomplete:'off',autocorrect:'off',autocapitalize:'off',spellcheck:'false',enterkeyhint:'done',placeholder:'כתוב כאן…','aria-label':'Your dictation'});
  const out=h('div',{});
  c.el.append(h('div',{class:'chips'},chip('▶ Play',()=>{const s=sg();P.seg(L.video,s.start,s.end)}),chip('🐢 Slow',()=>{const s=sg();P.seg(L.video,s.start,s.end,{rate:.75})})),ta,out,timingFix(L,P,li));
  let checked=false;
  const check=()=>{if(!ta.value.trim())return;ta.blur();out.innerHTML='';const d=wordDiff(ln.he,ta.value);
    out.append(renderDiff(d),h('div',{class:'en center'},ln.en));award('l'+L.id+':dict'+li,Math.round(d.score/10));checked=true;c.show(out);
    c.pri(c.nextLabel,()=>c.next(),{skip:()=>{ta.value='';out.innerHTML='';ta.focus();paint()},skipLabel:'Retry'})};
  const paint=()=>{if(checked&&out.firstChild)return;c.pri('Check',check,{disabled:!ta.value.trim(),skip:()=>c.next()})};
  ta.addEventListener('input',()=>{if(checked){checked=false;out.innerHTML=''}paint()});
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();check()}});
  paint();
  {const s=sg();P.seg(L.video,s.start,s.end)}}

function scShadow(L,P,li,k,c){const sg=()=>seg(L,li),R=Recorder();const W=who(L);
  c.el.append(kick(`Shadow ${k+1} of ${L.shadow.length}`),h('h2',{},isSpeech(L)?'Copy the speaker':'Copy the actor'),
    h('p',{class:'sub'},isSpeech(L)?'Match the pace, pauses and emphasis — speeches are slow on purpose.':'Match the rhythm and attitude, not just the words.'));
  if(k===0)c.el.appendChild(note('🎧 Headphones help — otherwise the mic picks up the clip.'));
  const me=chip('▶ Me',()=>{P.stop();R.play()});me.disabled=true;
  c.el.append(lineBlock(L,li,{lean:true}),h('div',{class:'chips'},chip('▶ '+W,()=>{const s=sg();P.seg(L.video,s.start,s.end)}),chip('🐢 Slow',()=>{const s=sg();P.seg(L.video,s.start,s.end,{rate:.75})}),me),R.audio,timingFix(L,P,li));
  const after=()=>c.pri(c.nextLabel,()=>c.next(),{skip:rec,skipLabel:'Redo'});
  const compare=()=>{unlock(R.audio);const s=sg();c.pri(W+', then you…  ■',()=>{P.stop();R.audio.pause();after()},{cls:'busy'});
    P.seg(L.video,s.start,s.end,{onEnd:()=>setTimeout(()=>{R.play();setTimeout(after,600)},350)})};
  const rec=async()=>{P.stop();try{await R.start(got);c.pri('■  Stop recording',async()=>{await R.stop();got()},{cls:'rec recording'})}catch(e){toast('Mic blocked ('+(e.name||e)+'). Allow the microphone for this site in Settings → Safari.',6000);noMic()}};
  const got=()=>{me.disabled=false;c.done();c.pri('⇄  Compare: '+W.toLowerCase()+' → you',compare,{skip:rec,skipLabel:'Redo'})};
  const noMic=()=>c.pri('I said it out loud ✓',()=>c.next(),{skip:()=>c.next()});
  const hear=()=>{const s=sg();P.seg(L.video,s.start,s.end);
    canRec?c.pri('●  Record yourself',rec,{cls:'rec',skip:()=>c.next()}):noMic()};
  c.pri('▶  Hear the '+W.toLowerCase(),hear,{skip:()=>c.next()})}

function scSay(L,P,s,k,c){const R=Recorder(),ln=L.lines[s.line];const W=who(L);
  c.el.append(kick(`Say it ${k+1} of ${L.say.length}`),h('div',{class:'sit'},s.sit),h('p',{class:'sub'},'Answer out loud in Hebrew first. Then see what a native would say.'));
  const ans=h('div',{class:'answer',hidden:true});
  const me=chip('▶ Me',()=>{P.stop();R.play()});me.disabled=true;
  const actor=chip('▶ '+W+'’s line',()=>{const g=seg(L,s.line);P.seg(L.video,g.start,g.end)});
  ans.append(h('div',{class:'line'},h('div',{class:'he big',dir:'rtl',lang:'he'},s.he),h('div',{class:'en'},s.en),
    s.street?h('div',{class:'reg',html:'<b>With friends</b>'+bidi('<span class="he">'+s.street+'</span>')}):null,
    h('div',{class:'lnote small'},'From the clip: ',he(ln.he))),h('div',{class:'chips'},actor,me),R.audio);
  c.el.append(ans);
  let shown=false;
  const show=()=>{if(shown)return;shown=true;ans.hidden=false;c.show(ans);c.done();c.cont()};
  const rec=async()=>{P.stop();try{await R.start(()=>{me.disabled=false;show()});c.pri('■  Stop — show me',async()=>{await R.stop();me.disabled=false;show()},{cls:'rec recording'})}catch(e){toast('Mic blocked — just say it out loud.',4000);c.pri('I said it — show me',show)}};
  if(canRec)c.pri('●  Record your answer',rec,{cls:'rec',skip:show,skipLabel:'Just show me'});
  else c.pri('I said it — show me',show,{skip:()=>c.next()})}

const RATES=[[10,'Barely'],[30,'Some'],[50,'Half'],[75,'Most'],[95,'Nearly all']];
function rateRow(cur,onPick){const row=h('div',{class:'rates'});RATES.forEach(([v,lab])=>{const b=h('button',{class:'rate'+(cur===v?' on':''),type:'button'},h('b',{},v+'%'),h('span',{},lab));
  b.onclick=()=>{vibe();row.querySelectorAll('.rate').forEach(x=>x.classList.remove('on'));b.classList.add('on');onPick(v)};row.appendChild(b)});return row}
function scRewatch(L,P,c){const lid='l'+L.id,prev=S.comp[lid];
  c.el.append(kick('Rewatch'),h('h2',{},'Watch it again — no help'),h('p',{class:'sub'},'Full speed, no text. Notice how much more you catch now.'));
  const q=h('div',{class:'q',hidden:true},h('h3',{},'How much did you understand by ear?'),rateRow(prev&&prev.post,v=>{S.comp[lid]={post:v,day:today()};save();c.cont()}),
    prev?h('div',{class:'small center'},'Last time: '+prev.post+'%'):null);
  c.el.append(q);
  const ask=()=>{q.hidden=false;c.show(q);c.pri('Pick how much you caught',null,{disabled:true,skip:()=>c.next()})};
  c.pri('▶  Play the scene',()=>{P.full();ask()},{skip:ask,skipLabel:'Already did'})}

function scFinish(L,P,c){const lid='l'+L.id;
  c.el.append(kick('Last step · use it for real'),h('h2',{},'Reply in our chat — in Hebrew'),rich(L.chat,'chatq'),
    h('p',{class:'sub'},'Use at least two of these. You’ll get back a corrected, more natural version.'),
    h('div',{class:'linelist'},L.lines.map(l=>h('div',{class:'li'},h('div',{class:'he',dir:'rtl',lang:'he'},l.he),h('div',{class:'small'},l.en)))));
  const fin=()=>{const added=addToDeck(L);const wasDone=S.done[lid];S.done[lid]=1;S.pos[lid]=0;save();if(c.done)c.done();const xp=award(lid+':done',30);markActive();
    c.el.innerHTML='';c.el.append(h('div',{class:'celebrate'},h('div',{class:'boom'},'🎬'),h('h1',{},wasDone?'Done again':'Lesson done'),
      h('p',{class:'sub center'},(xp?`+${xp} XP · `:'')+`🔥 ${streakNow()}-day streak`),
      h('p',{class:'sub center'},added?`These ${added} lines come back in tomorrow’s 3-minute review — as real scenes, not flashcards.`:'Your review keeps bringing these lines back as scenes.')));
    c.pri('Back to home',()=>location.href='index.html',{skip:()=>location.href='review.html',skipLabel:'Review'})};
  c.pri(S.done[lid]?'Finish again ✓':'Finish lesson ✓',fin)}

/* ---------- review: “Scene recall” — real clip moments, answered out loud ---------- */
const MODES={catch:{ic:'🎧',name:'Catch it'},use:{ic:'💬',name:'Use it'}};
function pickMode(L,i,it){const s=(L.say||[]).find(x=>x.line===i);if(!s)return['catch'];return((it.reps+it.lapses)%2===1)?['use',s]:['catch']}
async function reviewPage(){const A=shell();A.right.appendChild(h('div',{class:'combo',id:'combo'}));
  let keys=dueItems().slice(0,6),bonus=false;
  const ids=[...new Set(Object.keys(S.srs).map(k=>parseKey(k).id))];
  await Promise.all(ids.map(loadLesson));
  const valid=k=>{const{id,i}=parseKey(k);return LESSONS[id]&&LESSONS[id].lines[i]};
  keys=keys.filter(valid);
  const stage=A.stage;
  if(!keys.length){const all=Object.keys(S.srs).filter(valid);const nxt=Object.values(S.srs).map(v=>v.due).sort()[0];
    A.segments(1);A.label.textContent='Daily review';A.player.hidden=true;
    stage.append(h('div',{class:'screen'},h('div',{class:'celebrate'},h('div',{class:'boom'},all.length?'✅':'🎬'),h('h1',{},all.length?'All caught up':'Nothing to review yet'),
      h('p',{class:'sub center'},all.length?`Next scenes come back ${niceDate(nxt)}.`:'Finish a lesson and its lines show up here the next day, as short scenes to catch and answer.'))));
    if(all.length>=3)A.setPri('Bonus round · 5 random scenes',()=>{bonus=true;A.player.hidden=false;run(all.sort(()=>Math.random()-.5).slice(0,5))},{skip:()=>location.href='index.html',skipLabel:'Home'});
    else A.setPri('Back to home',()=>location.href='index.html');
    return}
  run(keys);
  function run(keys){const first=LESSONS[parseKey(keys[0]).id];const P=Player(A.pv,first.video);IVX._player=P;
    const results=[];let combo=0,best=0,requeued={};const queue=keys.slice();
    const combo$=document.getElementById('combo');const paintCombo=()=>{combo$.textContent=combo>=2?'🔥 '+combo+' in a row':'';combo$.classList.toggle('hot',combo>=2)};
    const screens=[{label:bonus?'Bonus round':'Daily review',render:c=>{
      c.el.append(kick(bonus?'Bonus round · doesn’t change your schedule':'Daily review · ~3 min'),h('h1',{},'Scene recall'),
        h('p',{class:'sub'},`${queue.length} moments from scenes you’ve studied. For each one, answer out loud — then check yourself.`),
        h('div',{class:'howto'},h('div',{class:'hstep'},h('b',{},MODES.catch.ic),h('span',{},h('strong',{},'Catch it: '),'a moment plays. Say what they said and what it means.')),
          h('div',{class:'hstep'},h('b',{},MODES.use.ic),h('span',{},h('strong',{},'Use it: '),'a new situation. Answer it with a line you learned.'))));
      c.pri('Start',()=>c.next())}}];
    queue.forEach((k,n)=>screens.push(itemScreen(k)));
    screens.push({label:'Results',render:c=>results$(c)});
    function itemScreen(k,retry){return{label:'',render:c=>{const{id,i}=parseKey(k),L=LESSONS[id],ln=L.lines[i],it=S.srs[k];const[mode,sit]=pickMode(L,i,it);
      const sg=seg(L,i);const play=o=>P.seg(L.video,sg.start,sg.end,o);const total=screens.length-2,pos=c.i;
      A.label.textContent=`${MODES[mode].name} · ${pos} of ${total}`;
      c.el.append(h('div',{class:'mode '+mode},h('span',{},MODES[mode].ic),MODES[mode].name+(retry?' · second try':'')),h('div',{class:'from'},'From '+lname(L)+' · '+L.title));
      const ans=h('div',{class:'answer',hidden:true});
      if(mode==='catch'){c.el.append(h('h2',{},'What did they say — and what does it mean?'),h('p',{class:'sub'},'Say both out loud. Replay as much as you like.'),
          h('div',{class:'chips'},chip('▶ Again',()=>play()),chip('🐢 Slow',()=>play({rate:.75}))));
        ans.append(lineBlock(L,i,{lean:true}))}
      else{c.el.append(h('div',{class:'sit'},sit.sit),h('p',{class:'sub'},'Answer out loud in Hebrew, using a line you learned.'),
          h('div',{class:'chips'},chip('💡 Hint: hear the scene',()=>play())));
        ans.append(h('div',{class:'line'},h('div',{class:'he big',dir:'rtl',lang:'he'},sit.he),h('div',{class:'en'},sit.en),h('div',{class:'lnote small'},'From the clip: ',he(ln.he))),
          h('div',{class:'chips'},chip('▶ '+who(L)+'’s line',()=>play())))}
      c.el.append(ans,timingFix(L,P,i));
      const gradeIt=(g)=>{if(!bonus&&!retry)grade(k,g);else if(g!=='again'){S.xp+=1;save()}
        if(g==='again'){combo=0}else{combo++;best=Math.max(best,combo)}paintCombo();
        results.push({k,g,L,ln});
        if(g==='again'&&!requeued[k]&&!bonus){requeued[k]=1;screens.splice(screens.length-1,0,itemScreen(k,true));toast('↺ That one comes back at the end.',1800)}
        c.next()};
      const check=()=>{ans.hidden=false;c.show(ans);
        A.setGrades([['Missed it','g-miss',()=>gradeIt('again')],['Got it','g-ok',()=>gradeIt('good')],['Instantly','g-easy',()=>gradeIt('easy')]])};
      if(mode==='catch'){c.pri('▶  Play the moment',()=>{play();c.pri('Check',check)})}
      else c.pri('Check',check)}}}
    function results$(c){P.stop();if(!bonus)markActive();A.player.hidden=true;
      const ok=results.filter(r=>r.g!=='again').length,firsts=new Set();
      const rows=results.filter(r=>{if(firsts.has(r.k))return false;firsts.add(r.k);return true});
      c.el.append(h('div',{class:'celebrate'},h('div',{class:'boom'},ok>=results.length*.8?'🏆':'💪'),h('h1',{},`${ok} of ${results.length} caught`),
        h('p',{class:'sub center'},(best>=2?`Best run: ${best} in a row · `:'')+(bonus?'Bonus round — schedule unchanged.':`🔥 ${streakNow()}-day streak`))),
        h('div',{class:'linelist'},rows.map(r=>{const it=S.srs[r.k];const last=results.filter(x=>x.k===r.k).pop();
          return h('div',{class:'li '+(last.g==='again'?'miss':'hit')},h('div',{class:'he',dir:'rtl',lang:'he'},r.ln.he),h('div',{class:'small'},r.ln.en+(bonus||!it?'':' · back '+niceDate(it.due))))})));
      c.pri('Done',()=>location.href='index.html')}
    const F=Flow(A,screens,{P,onGo:()=>{A.back.hidden=true}});IVX._flow=F;F.go(0,1)}}

/* ---------- rewatch week: each clip straight through, rate by ear ---------- */
async function rewatchPage(){const A=shell();const q=new URLSearchParams(location.search),week=+(q.get('week')||1);
  const E=(window.IVX_CATALOG||[]).find(e=>e.type==='rewatch'&&e.week===week);
  if(!E){A.stage.append(h('h1',{},'Rewatch week not found'));A.setPri('Home',()=>location.href='index.html');return}
  const Ls=(await Promise.all(E.lessons.map(loadLesson))).filter(Boolean);
  const key='rw'+week;S.comp[key]=S.comp[key]||{};
  const P=Player(A.pv,Ls[0].video);IVX._player=P;
  const screens=[{label:'Rewatch week '+week,render:c=>{
    c.el.append(kick(`Day ${E.day} · Rewatch week ${week}`),h('h1',{},'No help today'),h('p',{class:'sub'},`${Ls.length} scenes from this week, straight through: no text, no cards, no slow-down. After each one, rate how much you got by ear.`),
      h('div',{class:'linelist'},Ls.map(L=>h('div',{class:'li'+(S.comp[key][L.id]!=null?' hit':'')},h('div',{},L.title),h('div',{class:'small'},lname(L)+' · '+L.duration)))));
    c.pri('Start',()=>c.next())}}];
  Ls.forEach((L,n)=>screens.push({label:`Scene ${n+1} of ${Ls.length}`,render:c=>{const prev=S.comp['l'+L.id];
    c.el.append(kick(`Scene ${n+1} of ${Ls.length} · ${lname(L)}`),h('h2',{},L.title),h('div',{class:'src'},he(L.heTitle),h('span',{},' · '+L.duration)));
    const qd=h('div',{class:'q',hidden:true},h('h3',{},'How much did you understand by ear?'),rateRow(S.comp[key][L.id],v=>{S.comp[key][L.id]=v;save();c.cont(n+1<Ls.length?'Next scene':'See results')}),
      prev?h('div',{class:'small center'},`On Day ${L.day} you said ${prev.post}%`):null);
    c.el.append(qd);
    const ask=()=>{qd.hidden=false;c.show(qd);c.pri('Pick how much you caught',null,{disabled:true,skip:()=>c.next()})};
    c.pri('▶  Watch',()=>{P.full(L.video);ask()},{skip:ask,skipLabel:'Rate'})}}));
  screens.push({label:'Results',render:c=>{P.stop();const rated=Ls.filter(L=>S.comp[key][L.id]!=null);
    if(rated.length===Ls.length&&!S.done[key]){S.done[key]=1;save();award(key,30);markActive()}
    A.player.hidden=true;
    c.el.append(h('div',{class:'celebrate'},h('div',{class:'boom'},'📈'),h('h1',{},'Week '+week+' by ear')),
      h('div',{class:'linelist'},Ls.map(L=>{const now=S.comp[key][L.id],then=S.comp['l'+L.id];return h('div',{class:'li'},h('div',{class:'cmp'},h('span',{},L.title),h('b',{},now!=null?now+'%':'—')),
        h('div',{class:'small'},then?`Day ${L.day}: ${then.post}%`+(now!=null?(now>then.post?` → up ${now-then.post}`:now<then.post?` → down ${then.post-now}`:' → same'):''):'')) })));
    c.pri('Back to home',()=>location.href='index.html')}});
  const F=Flow(A,screens,{P,onGo:i=>{A.player.hidden=(i===0||i===screens.length-1)}});IVX._flow=F;IVX._go=i=>F.go(i,1);F.go(0,1)}

/* ---------- home ---------- */
function greet(){const hr=hourNY();return hr<5?'לילה טוב':hr<12?'בוקר טוב':hr<17?'צהריים טובים':hr<22?'ערב טוב':'לילה טוב'}
function entryKey(e){return e.type==='rewatch'?'rw'+e.week:'l'+e.id}
function home(){headTags();document.body.className='home'+(S.tr?'':' hide-tr');
  const C=window.IVX_CATALOG||[],SP=window.IVX_SPEECHES||[];const di=dayIndex();
  const past=C.filter(e=>e.day<=di);const todayE=C.find(e=>e.day===di)||past[past.length-1]||C[0];
  const stats=h('div',{class:'stats'},h('div',{class:'stat'},h('b',{},'🔥 '+streakNow()),h('span',{},'day streak')),h('div',{class:'stat'},h('b',{},S.xp+''),h('span',{},'XP')),h('div',{class:'stat'},h('b',{},Object.keys(S.srs).length+''),h('span',{},'lines learned')));
  const top=h('header',{class:'htop'},h('div',{class:'brand'},'Ivrit',h('i',{},'·'),h('span',{class:'he'},'עברית')),h('div',{class:'hgreet'},h('span',{class:'he',dir:'rtl'},greet()+', אליוט')));
  const main=h('main',{class:'hwrap'});document.body.append(top,main);
  main.appendChild(stats);
  /* week strip */
  const wk=Math.ceil(di/7),days=[];for(let d=(wk-1)*7+1;d<=wk*7;d++)days.push(d);
  main.appendChild(h('div',{class:'week'},days.map(d=>{const e=C.find(x=>x.day===d);const done=e&&S.done[entryKey(e)];return h('div',{class:'wd'+(done?' done':'')+(d===di?' now':'')+(d>di?' fut':'')},h('i',{},done?'✓':d===di?'•':''),h('span',{},'D'+d))})));
  /* hero: today */
  if(todayE){const k=entryKey(todayE),isRw=todayE.type==='rewatch',done=!!S.done[k];
    const secDone=isRw?0:Object.keys(S.steps[k]||{}).length;const started=!done&&(secDone>0||(S.pos[k]||0)>0);
    const vid=todayE.video||(isRw?(C.find(x=>x.id===todayE.lessons[0])||{}).video:null);
    const btn=done?'Do it again':started?`Continue · step ${Math.min(7,secDone+1)} of 7`:isRw?'Start rewatch':'Start today’s lesson';
    main.appendChild(h('a',{class:'hero',href:todayE.href},
      h('div',{class:'hthumb',style:vid?`background-image:linear-gradient(180deg,rgba(10,12,16,0) 35%,rgba(10,12,16,.95)),url(${thumb(vid)})`:''},
        h('span',{class:'pill'+(done?' ok':'')},done?'✓ Done today':'Today · Day '+todayE.day),
        h('div',{class:'htxt'},h('div',{class:'ht'},todayE.title),h('div',{class:'hs'},isRw?`${todayE.lessons.length} scenes · no text, no help`:h('span',{},he(todayE.clip),' · ~15 min')))),
      !isRw&&started?h('div',{class:'hprog'},h('i',{style:'width:'+(secDone/7*100)+'%'})):null,
      h('div',{class:'hbtn'+(done?' ghost':'')},btn,h('span',{},'→'))))}
  /* review */
  const due=dueItems().length,deck=Object.keys(S.srs).length;const nxt=Object.values(S.srs).map(v=>v.due).sort()[0];
  main.appendChild(h('a',{class:'tile'+(due?' hot':''),href:'review.html'},h('div',{class:'tic'},'🎧'),
    h('div',{class:'tbody'},h('div',{class:'tt'},'Daily review · Scene recall'),h('div',{class:'ts'},due?`${Math.min(due,6)} scenes ready · ~3 min`:deck?`All caught up · next ${niceDate(nxt)}`:'Unlocks after your first lesson')),
    h('div',{class:'tgo'},due?'Play':'›')));
  /* library */
  const row=(e,label,sub,k,vid,open)=>h(open?'a':'div',{class:'lrow'+(open?'':' fut'),href:open?e.href:null},
    h('div',{class:'lth',style:vid?`background-image:url(${thumb(vid)})`:''},S.done[k]?h('span',{class:'ck'},'✓'):null),
    h('div',{class:'lbody'},h('div',{class:'lmeta'},label),h('div',{class:'ltit'},e.title),sub?h('div',{class:'lsub'},sub):null),
    h('div',{class:'lend'},open?(S.done[k]?'':'›'):'Soon'));
  if(SP.length){main.appendChild(h('div',{class:'sect'},h('h2',{},'🎙 Speeches'),h('span',{},'formal Hebrew · any time')));
    SP.forEach(e=>main.appendChild(row(e,'Speech '+(e.id-SPEECH0)+' · '+e.mins,h('span',{},he(e.clip)),'l'+e.id,e.video,true)))}
  main.appendChild(h('div',{class:'sect'},h('h2',{},'🎬 Fauda scenes'),h('span',{},'one a day')));
  C.slice().reverse().forEach(e=>{const open=e.day<=di,isRw=e.type==='rewatch';const vid=e.video||(isRw?(C.find(x=>x.id===(e.lessons||[])[0])||{}).video:null);
    main.appendChild(row(e,`Day ${e.day} · `+(isRw?'Rewatch week':`Lesson ${e.id} · ${e.mins}`),isRw?'Every scene of the week, no help':h('span',{},he(e.clip)),entryKey(e),vid,open))});
  /* settings + footer */
  const trB=h('button',{class:'set',type:'button'});const paint=()=>{trB.innerHTML='';trB.append(h('span',{},'Pronunciation (transliteration)'),h('b',{class:S.tr?'on':''},S.tr?'On':'Off'))};paint();
  trB.onclick=()=>{S.tr=!S.tr;save();paint()};
  main.append(h('div',{class:'sect'},h('h2',{},'Settings')),trB,
    h('a',{class:'set',href:'v2/'},h('span',{},'Old version (v2 story game)'),h('b',{},'›')),legalFoot())}

window.IVX={register,lessonPage,home,reviewPage,rewatchPage,wordDiff,normW,_lname:lname,_state:()=>S,_grade:grade,_due:dueItems,_addToDeck:addToDeck,_today:today,_dayIndex:dayIndex,_LESSONS:LESSONS,_bidi:bidi};
})();
