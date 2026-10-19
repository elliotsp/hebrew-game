/* Ivrit × Fauda — shared lesson engine. No browser TTS anywhere: all Hebrew audio is the actors, via the official YouTube embed. */
(function(){
'use strict';
const TZ='America/New_York', START='2026-10-15', KEY='ivx1';
const fmtD=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'});
const today=()=>fmtD.format(new Date());
const addDays=(d,n)=>{const[Y,M,D]=d.split('-').map(Number);return new Date(Date.UTC(Y,M-1,D+n)).toISOString().slice(0,10)};
const dayIndex=()=>Math.round((Date.parse(today()+'T00:00:00Z')-Date.parse(START+'T00:00:00Z'))/864e5)+1;
const mmss=t=>{t=Math.max(0,t);const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+(Math.round(s*10)/10).toFixed(1)};

/* ---------- state (one store for every lesson) ---------- */
function blank(){return{v:1,xp:0,streak:0,lastDay:'',done:{},steps:{},comp:{},srs:{},nudge:{},tr:false,awarded:{}}}
function migrate(s){try{let xp=0;for(let i=1;i<=30;i++)xp+=+localStorage.getItem('fxp'+i)||0;s.xp=xp;
  const d=JSON.parse(localStorage.getItem('fxLessons')||'{}');Object.keys(d).forEach(k=>s.done['l'+k]=1);
  s.streak=+localStorage.getItem('fxStreak')||0;s.lastDay=localStorage.getItem('fxLastDay')||''}catch(e){}return s}
function load(){let s=null;try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(!s){s=migrate(blank());try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  return Object.assign(blank(),s)}
let S=load();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
function streakNow(){const t=today();return(S.lastDay===t||S.lastDay===addDays(t,-1))?S.streak:0}
function markActive(){const t=today();if(S.lastDay!==t){S.streak=(S.lastDay===addDays(t,-1))?S.streak+1:1;S.lastDay=t;save()}hdr()}
function award(k,n){if(S.awarded[k])return;S.awarded[k]=1;S.xp+=n;save();hdr()}
function hdr(){const x=document.getElementById('ivx-xp'),s=document.getElementById('ivx-streak');if(x)x.textContent=S.xp+' XP';if(s)s.textContent='🔥 '+streakNow()}

/* ---------- tiny DOM helper ---------- */
function h(tag,a,...kids){const e=document.createElement(tag);if(a)for(const k in a){const v=a[k];if(v==null||v===false)continue;
  if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?'':v)}
  kids.flat().forEach(c=>{if(c==null||c===false)return;e.appendChild(typeof c==='string'?document.createTextNode(c):c)});return e}
const heSpan=t=>h('span',{class:'he'},t);
function toast(msg,ms){const t=h('div',{class:'toast'},msg);document.body.appendChild(t);setTimeout(()=>t.remove(),ms||3500)}

/* ---------- Hebrew comparison (lenient: niqqud, punctuation, final letters, ו/י spelling) ---------- */
const FIN={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};
function normW(w){return w.replace(/[\u0591-\u05C7]/g,'').replace(/[ךםןףץ]/g,c=>FIN[c]).replace(/[^\u05D0-\u05EAa-z0-9]/gi,'').toLowerCase()}
const loose=w=>w.replace(/[וי]/g,'');
function tok(s){return String(s).replace(/[־–—\-\/]/g,' ').split(/\s+/).map(w=>({raw:w,n:normW(w)})).filter(w=>w.n)}
function lev(a,b){if(Math.abs(a.length-b.length)>1)return 9;const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
function wEq(a,b){if(a===b||loose(a)===loose(b))return 2;if(a.length>=3&&lev(a,b)<=1)return 1;return 0}
function wordDiff(target,input){const T=tok(target);let U=tok(input);
  /* spoken contractions typed as one word (בנאדם = בן אדם): split them to match the target */
  U=U.flatMap(u=>{for(let i=0;i+1<T.length;i++){const c=T[i].n+T[i+1].n;if(u.n===c||loose(u.n)===loose(c))return[{raw:T[i].raw,n:T[i].n},{raw:T[i+1].raw,n:T[i+1].n}]}return[u]});
  const n=T.length,m=U.length;
  const dp=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--){const e=wEq(T[i].n,U[j].n);dp[i][j]=Math.max(dp[i+1][j],dp[i][j+1],e?dp[i+1][j+1]+e:0)}
  const out=[];let i=0,j=0;
  while(i<n||j<m){if(i<n&&j<m){const e=wEq(T[i].n,U[j].n);if(e&&dp[i][j]===dp[i+1][j+1]+e){out.push({w:T[i].raw,t:e===2?'ok':'close',you:U[j].raw});i++;j++;continue}}
    if(j<m&&(i>=n||dp[i][j+1]>=dp[i+1][j])){out.push({w:U[j].raw,t:'extra'});j++}else{out.push({w:T[i].raw,t:'miss'});i++}}
  const ok=out.filter(o=>o.t==='ok').length,close=out.filter(o=>o.t==='close').length;
  return{parts:out,score:n?Math.round((ok+close*.5)/n*100):0,ok,close,total:n}}
function renderDiff(d){return h('div',{},h('div',{class:'diff'},d.parts.map(p=>h('span',{class:'w-'+p.t,title:p.t==='close'?'you: '+p.you:p.t},p.w))),
  h('div',{class:'small'},`${d.ok}/${d.total} exact`+(d.close?`, ${d.close} close (yellow)`:'')+' · red = missed, struck = extra')) }

/* ---------- YouTube IFrame API wrapper (official player, never covered or hidden) ---------- */
const ytQ=[];let ytLoaded=false;
window.onYouTubeIframeAPIReady=function(){ytLoaded=true;ytQ.splice(0).forEach(f=>f())};
function whenYT(f){if(window.YT&&window.YT.Player&&ytLoaded)f();else ytQ.push(f);
  if(!document.getElementById('yt-api')){const s=h('script',{id:'yt-api',src:'https://www.youtube.com/iframe_api'});document.head.appendChild(s)}}
function Player(el,videoId){
  const P={ready:false,q:[],cur:videoId,timer:null,yt:null};
  whenYT(()=>{P.yt=new YT.Player(el,{videoId,playerVars:{rel:0,playsinline:1,modestbranding:1},
    events:{onReady:()=>{P.ready=true;P.q.splice(0).forEach(f=>f())},onError:e=>{P.err=e.data;toast('Video error '+e.data+' — try “Open on YouTube”.')}}})});
  P.do=f=>{if(P.ready)f();else P.q.push(f)};
  P.clear=()=>{if(P.timer){clearInterval(P.timer);P.timer=null}};
  P.stop=()=>{P.clear();P.do(()=>{try{P.yt.pauseVideo()}catch(e){}})};
  /* play [start,end] at rate, `loops` times, then pause and call onEnd */
  P.seg=(vid,start,end,o)=>{o=o||{};P.do(()=>{P.clear();const y=P.yt,rate=o.rate||1;let loops=o.loops||1,entered=false,t0=Date.now();
    if(vid!==P.cur){P.cur=vid;y.loadVideoById({videoId:vid,startSeconds:start})}else{y.seekTo(start,true);y.playVideo()}
    try{y.setPlaybackRate(rate)}catch(e){}
    const maxMs=((end-start)/rate+10)*1000;
    P.timer=setInterval(()=>{let t;try{t=y.getCurrentTime()}catch(e){return}
      if(!entered){if(t>=start-1.5&&t<end){entered=true}else if(Date.now()-t0<4000)return}
      if(t>=end||Date.now()-t0>maxMs){
        if(--loops>0){entered=false;t0=Date.now();y.seekTo(start,true);try{y.setPlaybackRate(rate)}catch(e){}return}
        P.clear();try{y.pauseVideo()}catch(e){}if(o.onEnd)o.onEnd()}},50)})};
  P.full=vid=>P.do(()=>{P.clear();const y=P.yt;vid=vid||videoId;if(vid!==P.cur){P.cur=vid;y.loadVideoById({videoId:vid,startSeconds:0})}else{try{y.setPlaybackRate(1)}catch(e){}y.seekTo(0,true);y.playVideo()}});
  P.rate=()=>{try{return P.yt.getPlaybackRate()}catch(e){return null}};
  P.time=()=>{try{return P.yt.getCurrentTime()}catch(e){return null}};
  return P}

/* ---------- recording (MediaRecorder; stays on the device, never uploaded) ---------- */
const canRec=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
const REC={};// key -> objectURL (memory only)
let recActive=null;
async function recStart(maxMs){const st=await navigator.mediaDevices.getUserMedia({audio:true});
  const mt=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t));
  const mr=new MediaRecorder(st,mt?{mimeType:mt}:undefined),chunks=[];
  mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  const done=new Promise(res=>{mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());res(new Blob(chunks,{type:mr.mimeType||mt||'audio/mp4'}))}});
  mr.start();const timer=setTimeout(()=>{if(mr.state==='recording')mr.stop()},maxMs||12000);
  return{stop:()=>{clearTimeout(timer);if(mr.state==='recording')mr.stop();return done},done}}
function audioEl(){const a=h('audio',{preload:'auto',playsinline:true});return a}
function unlock(a){try{a.muted=true;const p=a.play();if(p&&p.then)p.then(()=>{a.pause();a.currentTime=0;a.muted=false}).catch(()=>{a.muted=false});else{a.pause();a.muted=false}}catch(e){a.muted=false}}
/* a record button; onDone(url) */
function recButton(key,onDone,label){
  if(!canRec)return h('span',{class:'small'},'Recording isn’t available in this browser — just say it out loud.');
  const b=h('button',{class:'btn rec'},label||'● Record');let r=null;
  b.onclick=async()=>{if(r){b.disabled=true;const blob=await r.stop();r=null;recActive=null;b.disabled=false;b.classList.remove('on');b.textContent='● Re-record';
      if(REC[key])URL.revokeObjectURL(REC[key]);REC[key]=URL.createObjectURL(blob);onDone&&onDone(REC[key]);return}
    if(recActive){toast('Stop the other recording first.');return}
    try{r=await recStart(12000);recActive=r;b.classList.add('on');b.textContent='■ Stop';
      r.done.then(async blob=>{if(!r)return;r=null;recActive=null;b.classList.remove('on');b.textContent='● Re-record';if(REC[key])URL.revokeObjectURL(REC[key]);REC[key]=URL.createObjectURL(blob);onDone&&onDone(REC[key])})}
    catch(e){r=null;recActive=null;toast('Mic blocked ('+(e.name||e)+'). Allow microphone for this site in Safari settings.',6000)}};
  return b}

/* ---------- optional speech-recognition bonus check (he-IL) ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const standalone=!!(window.navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
function srBlock(target){
  const out=h('div',{});
  if(!SR)return h('div',{class:'small'},'Bonus check (speech recognition) isn’t available in this browser. On iPhone it works in a Safari tab with Dictation on.');
  const b=h('button',{class:'btn sm'},'🎙 Bonus: check with speech recognition');
  b.onclick=()=>{let alts=null,err=null;const r=new SR();r.lang='he-IL';r.interimResults=false;r.maxAlternatives=3;r.continuous=false;
    b.disabled=true;b.textContent='Listening… say it now';out.innerHTML='';
    r.onresult=e=>{alts=Array.from(e.results[0]).map(a=>a.transcript)};
    r.onerror=e=>{err=e.error||'error'};
    r.onend=()=>{b.disabled=false;b.textContent='🎙 Try again';
      if(alts&&alts.length){const best=alts.map(a=>({a,d:wordDiff(target,a)})).sort((x,y)=>y.d.score-x.d.score)[0];
        out.appendChild(h('div',{class:'small',style:'margin-top:8px'},'Recognizer heard: ',heSpan(best.a)));out.appendChild(renderDiff(best.d));
        out.appendChild(h('div',{class:'small'},'This checks whether a machine understood you, not your accent. Slang and Arabic loanwords often get “corrected” — don’t chase 100%.'))}
      else{const m={'not-allowed':'Mic or speech recognition was blocked.','service-not-allowed':'Speech recognition is off or not allowed here.','no-speech':'Didn’t hear anything — try again, a bit closer.','language-not-supported':'Hebrew recognition isn’t supported on this device.','network':'Needs an internet connection.','audio-capture':'No microphone found.'};
        out.appendChild(h('div',{class:'small',style:'margin-top:8px;color:var(--mid)'},(m[err]||('Recognition failed ('+(err||'no result')+').'))+(standalone?' Note: it doesn’t work from a Home Screen icon — open the link in a Safari tab.':' On iPhone: Settings → General → Keyboard → Enable Dictation, and add Hebrew as a dictation language.')))}};
    try{r.start();setTimeout(()=>{try{r.stop()}catch(e){}},9000)}catch(e){b.disabled=false;b.textContent='🎙 Bonus: check with speech recognition';out.appendChild(h('div',{class:'small'},'Couldn’t start recognition: '+e.message))}};
  return h('div',{style:'margin-top:10px'},b,out)}

/* ---------- spaced review (one deck across all lessons) ---------- */
const LESSONS={};
function register(d){LESSONS[d.id]=d}
function loadLesson(id){return new Promise(res=>{if(LESSONS[id])return res(LESSONS[id]);const s=h('script',{src:'data/lesson-'+id+'.js'});s.onload=()=>res(LESSONS[id]||null);s.onerror=()=>res(null);document.head.appendChild(s)})}
function seg(L,i){const ln=L.lines[i],k='l'+L.id+':'+i,n=S.nudge[k]||{s:0,e:0};return{start:Math.max(0,ln.start+n.s),end:ln.end+n.e,key:k}}
function addToDeck(L){const t=today();let added=0;L.lines.forEach((_,i)=>{const k='l'+L.id+':'+i;if(!S.srs[k]){S.srs[k]={due:addDays(t,1),ivl:0,reps:0,lapses:0};added++}});save();return added}
function dueItems(exclude){const t=today();return Object.entries(S.srs).filter(([k,v])=>v.due<=t&&(!exclude||!k.startsWith('l'+exclude+':'))).sort((a,b)=>a[1].due<b[1].due?-1:1).map(([k])=>k)}
function grade(k,g){const it=S.srs[k],t=today();if(!it)return;
  if(g==='again'){it.ivl=1;it.lapses++;it.reps=0}
  else if(g==='good'){it.ivl=it.ivl<1?2:Math.max(it.ivl+1,Math.round(it.ivl*2.5));it.reps++}
  else{it.ivl=it.ivl<1?4:Math.max(it.ivl+2,Math.round(it.ivl*3.5));it.reps++}
  it.due=addDays(t,it.ivl);save();S.xp+=2;save();hdr()}
async function reviewSession(box,opts){opts=opts||{};box.innerHTML='';
  let keys=dueItems(opts.exclude).slice(0,opts.max||10);
  if(!keys.length){const nxt=Object.values(S.srs).map(v=>v.due).sort()[0];
    box.appendChild(h('div',{class:'card'},h('h2',{},'Nothing due today'),h('div',{class:'sub'},Object.keys(S.srs).length?('Next review: '+nxt+'. Lines from each lesson join the deck the day after you finish it.'):'Finish a lesson and its lines join this deck tomorrow.')));
    if(opts.onDone)opts.onDone(0);return}
  const ids=[...new Set(keys.map(k=>+k.split(':')[0].slice(1)))];await Promise.all(ids.map(loadLesson));
  keys=keys.filter(k=>{const[l,i]=k.split(':');const L=LESSONS[+l.slice(1)];return L&&L.lines[+i]});
  if(!keys.length){box.appendChild(h('div',{class:'small'},'Couldn’t load review items.'));return}
  const first=LESSONS[+keys[0].split(':')[0].slice(1)];
  const pv=h('div',{});const vbox=h('div',{class:'video',style:'position:relative;top:auto'},h('div',{class:'box'},pv));box.appendChild(vbox);
  const P=Player(pv,first.video);const area=h('div',{});box.appendChild(area);
  const queue=keys.slice();let doneN=0,requeued={};
  const next=()=>{area.innerHTML='';const k=queue.shift();
    if(!k){P.stop();markActive();area.appendChild(h('div',{class:'card'},h('div',{class:'big'},'✅'),h('h2',{style:'text-align:center'},`Review done · ${doneN} lines`),h('div',{class:'sub',style:'text-align:center'},'Each line comes back later — sooner if you missed it.')));if(opts.onDone)opts.onDone(doneN);return}
    const[l,i]=k.split(':'),L=LESSONS[+l.slice(1)],ln=L.lines[+i],sg=seg(L,+i),it=S.srs[k];
    const mode=(it.reps+it.lapses)%2===0?'listen':'say';
    const reveal=h('div',{class:'hidden'},h('div',{class:'heb he'},ln.he),h('div',{class:'tr'},ln.tr||''),h('div',{class:'en'},ln.en),
      h('div',{class:'row'},h('button',{class:'btn sm',onclick:()=>P.seg(L.video,sg.start,sg.end)},'▶ Actor')),
      h('div',{class:'row'},...[['again','Missed it'],['good','Got it'],['easy','Easy']].map(([g,lab])=>h('button',{class:'btn'+(g==='good'?' pri':''),onclick:()=>{grade(k,g);doneN++;if(g==='again'&&!requeued[k]){requeued[k]=1;queue.push(k)}next()}},lab))));
    const head=mode==='listen'?h('div',{},h('div',{class:'meta'},`Listen · ${queue.length+1} left · from Lesson ${L.id}`),h('h2',{},'What did they say? Say it back, then reveal.'),
        h('div',{class:'row'},h('button',{class:'btn pri',onclick:()=>P.seg(L.video,sg.start,sg.end)},'▶ Play line'),h('button',{class:'btn',onclick:()=>P.seg(L.video,sg.start,sg.end,{rate:.75})},'🐢 0.75×')))
      :h('div',{},h('div',{class:'meta'},`Say it · ${queue.length+1} left · from Lesson ${L.id}`),h('h2',{},'Say this in Hebrew, out loud:'),h('div',{class:'en',style:'font-size:18px'},'“'+ln.en+'”'));
    area.appendChild(h('div',{class:'card hl'},head,h('div',{class:'row'},h('button',{class:'btn',onclick:e=>{reveal.classList.remove('hidden');e.target.remove()}},'Reveal')),reveal))};
  next()}

/* ---------- page chrome ---------- */
function chrome(opts){document.body.classList.toggle('hide-tr',!S.tr);
  const head=h('header',{class:'top'},h('div',{class:'wrap'},h('a',{class:'logo',href:'index.html'},'Ivrit ',h('b',{},'×'),' Fauda'),
    opts&&opts.bar?h('div',{class:'bar'},h('i',{id:'ivx-bar'})):h('div',{style:'flex:1'}),h('span',{class:'chip',id:'ivx-streak'}),h('span',{class:'chip',id:'ivx-xp'})));
  document.body.prepend(head);hdr()}
function legalFoot(){return h('div',{class:'foot'},'Videos © yes / Fauda, embedded with the official YouTube player (YouTube API Services: ',h('a',{href:'https://www.youtube.com/t/terms',target:'_blank',rel:'noopener'},'YouTube Terms'),', ',h('a',{href:'https://policies.google.com/privacy',target:'_blank',rel:'noopener'},'Google Privacy Policy'),'). By using this site you agree to YouTube’s Terms. Progress is stored only in this browser; recordings stay on your device and are never uploaded. Speech-recognition checks, if you use them, are processed by your browser’s speech service. Not affiliated with yes, Netflix or YouTube.')}

/* ---------- lesson page: the 7-step flow ---------- */
const STEP_NAMES=['Watch','Lines','Dictation','Shadow','Say it','Rewatch','Review'];
function lessonPage(id){const L=LESSONS[id];chrome({bar:true});const lid='l'+L.id;S.steps[lid]=S.steps[lid]||{};
  const main=h('main',{class:'wrap'});document.body.appendChild(main);
  main.appendChild(h('div',{class:'tag'},`Lesson ${L.id} · Day ${L.day} · ~15 min`));
  main.appendChild(h('h1',{},L.title));
  main.appendChild(h('div',{class:'sub'},h('span',{html:L.blurb})));
  (L.warnings||[]).forEach(w=>main.appendChild(h('div',{class:'note warn',html:w})));
  const pv=h('div',{});main.appendChild(h('div',{class:'video'},h('div',{class:'box'},pv),
    h('div',{class:'cap'},'Official yes tv clip · ',heSpan(L.heTitle),' · '+L.duration+' · ',h('a',{href:'https://www.youtube.com/watch?v='+L.video,target:'_blank',rel:'noopener'},'Open on YouTube'))));
  const P=Player(pv,L.video);IVX._player=P;
  const nav=h('div',{class:'steps'});main.appendChild(nav);
  const view=h('section',{});main.appendChild(view);
  const ctl=h('div',{class:'nav'});main.appendChild(ctl);
  main.appendChild(h('label',{class:'toggle'},h('input',{type:'checkbox',id:'ivx-tr',checked:S.tr?true:null,onchange:e=>{S.tr=e.target.checked;save();document.body.classList.toggle('hide-tr',!S.tr)}}),'Show transliteration'));
  main.appendChild(h('details',{class:'foot'},h('summary',{},'About the Hebrew in this lesson'),h('div',{html:L.source}),h('div',{style:'margin-top:6px'},'Segment start/end times are approximate. If a line is cut off or starts late, use the ± buttons — your adjustments are saved on this device.')));
  main.appendChild(h('div',{class:'foot'},h('a',{href:'index.html'},'All lessons'),' · ',h('a',{href:'review.html'},'Review deck'),' · ',h('a',{href:'v2/'},'v2 story game')));
  main.appendChild(legalFoot());
  let cur=0;
  const doneStep=i=>{if(!S.steps[lid][i]){S.steps[lid][i]=1;save()}award(lid+':s'+i,10);paintNav()};
  const paintNav=()=>{nav.innerHTML='';STEP_NAMES.forEach((n,i)=>nav.appendChild(h('button',{class:(i===cur?'on ':'')+(S.steps[lid][i]?'ok':''),title:n,onclick:()=>go(i)},(i+1)+'')));
    const b=document.getElementById('ivx-bar');if(b)b.style.width=(Object.keys(S.steps[lid]).length/7*100)+'%'};
  const go=i=>{P.stop();cur=i;paintNav();view.innerHTML='';view.appendChild(STEPS[i](L,P,()=>doneStep(i)));
    ctl.innerHTML='';if(i>0)ctl.appendChild(h('button',{class:'btn',onclick:()=>go(i-1)},'← Back'));else ctl.appendChild(h('span'));
    if(i<6)ctl.appendChild(h('button',{class:'btn pri',onclick:()=>go(i+1)},'Next: '+STEP_NAMES[i+1]+' →'));
    if(i)window.scrollTo({top:Math.max(0,main.querySelector('.steps').offsetTop-330),behavior:'smooth'})};
  IVX._go=go;
  const firstOpen=STEP_NAMES.findIndex((_,i)=>!S.steps[lid][i]);go(firstOpen<0?0:firstOpen)}

function stepHead(n,title,sub){return h('div',{},h('div',{class:'meta'},`Step ${n} of 7`),h('h2',{},title),sub?h('div',{class:'sub'},sub):null)}
function lineCard(L,P,i,opts){const ln=L.lines[i],k='l'+L.id+':'+i;opts=opts||{};
  const win=h('span',{});const paintWin=()=>{const s=seg(L,i);win.textContent=mmss(s.start)+'–'+mmss(s.end)};paintWin();
  const nud=(f,d)=>{const n=S.nudge[k]||{s:0,e:0};n[f]=Math.round((n[f]+d)*10)/10;S.nudge[k]=n;save();paintWin()};
  const play=(o)=>{const s=seg(L,i);P.seg(L.video,s.start,s.end,o)};
  const nudge=h('div',{class:'nudge'},'Segment ',win,' · start',h('button',{class:'btn',onclick:()=>nud('s',-.5)},'−'),h('button',{class:'btn',onclick:()=>nud('s',.5)},'+'),' end',h('button',{class:'btn',onclick:()=>nud('e',-.5)},'−'),h('button',{class:'btn',onclick:()=>nud('e',.5)},'+'));
  return{play,nudge,ln}}

const STEPS=[
/* 1 cold watch + gist */
(L,P,done)=>{const g=L.gist,fb=h('div',{class:'sub',style:'margin-top:8px'});const box=h('div',{class:'card hl'},stepHead(1,'Watch it cold','No text, no help. Tap play on the video (or the button) and just follow what’s happening.'),
    h('div',{class:'row'},h('button',{class:'btn pri',onclick:()=>P.full()},'▶ Play whole clip')));
  const q=h('div',{class:'card'},h('div',{class:'meta'},'Gist'),h('h2',{},g.q));
  const ord=g.o.map((_,i)=>i).sort(()=>Math.random()-.5);let answered=false;
  ord.forEach(j=>{const b=h('button',{class:'opt'},g.o[j]);b.onclick=()=>{if(answered)return;answered=true;b.classList.add(j===g.a?'ok':'bad');q.querySelectorAll('.opt')[ord.indexOf(g.a)].classList.add('ok');fb.innerHTML='';fb.appendChild(h('span',{html:(j===g.a?'✅ ':'Not quite. ')+g.f}));done()};q.appendChild(b)});
  q.appendChild(fb);return h('div',{},box,q)},
/* 2 key lines: audio first */
(L,P,done)=>{const w=h('div',{},stepHead(2,'Key lines — ears first','Each line plays at normal speed, then at 0.75×. Try to catch it and say it back before you reveal the text.'));
  if(L.burnedIn)w.appendChild(h('div',{class:'note'},'This clip has Hebrew subtitles burned into the video. For a real listening rep, look away from the screen while each line plays.'));
  let seen=0;L.lines.forEach((_,i)=>{const c=lineCard(L,P,i);const rv=h('div',{class:'hidden'},h('div',{class:'heb he'},c.ln.he),h('div',{class:'tr'},c.ln.tr||''),h('div',{class:'en'},c.ln.en),c.ln.note?h('div',{class:'small',style:'margin-top:6px',html:c.ln.note}):null);
    let loopOn=false;const loopB=h('button',{class:'btn'},'↻ Loop');
    loopB.onclick=()=>{loopOn=!loopOn;loopB.classList.toggle('pri',loopOn);if(loopOn)c.play({loops:6,onEnd:()=>{loopOn=false;loopB.classList.remove('pri')}});else P.stop()};
    const revB=h('button',{class:'btn'},'Reveal');revB.onclick=()=>{rv.classList.remove('hidden');revB.remove();if(++seen>=L.lines.length)done()};
    w.appendChild(h('div',{class:'card'},h('div',{class:'meta'},'Line '+(i+1)+' of '+L.lines.length),
      h('div',{class:'row'},h('button',{class:'btn pri',onclick:()=>c.play({rate:1,onEnd:()=>setTimeout(()=>c.play({rate:.75}),700)})},'▶ 1× → 0.75×'),h('button',{class:'btn',onclick:()=>c.play({rate:.75})},'🐢 0.75×'),loopB,revB),rv,c.nudge))});
  return w},
/* 3 dictation */
(L,P,done)=>{const w=h('div',{},stepHead(3,'Dictation','Play the line as often as you like, then type exactly what you hear (Hebrew keyboard: tap 🌐). Niqqud, punctuation and final-letter forms don’t matter.'));
  if(L.burnedIn)w.appendChild(h('div',{class:'note'},'Subtitles are burned into this clip — don’t look at the video while it plays.'));
  let n=0;L.dictation.forEach(i=>{const c=lineCard(L,P,i);const ta=h('textarea',{class:'in',dir:'rtl',lang:'he',autocomplete:'off',autocorrect:'off',autocapitalize:'off',spellcheck:'false',placeholder:'…'});const out=h('div',{});
    const chk=h('button',{class:'btn pri'},'Check');chk.onclick=()=>{out.innerHTML='';const d=wordDiff(c.ln.he,ta.value);out.appendChild(renderDiff(d));out.appendChild(h('div',{class:'en'},c.ln.en));award('l'+L.id+':dict'+i,Math.round(d.score/10));if(!chk.dataset.c){chk.dataset.c=1;if(++n>=L.dictation.length)done()}};
    w.appendChild(h('div',{class:'card'},h('div',{class:'row'},h('button',{class:'btn',onclick:()=>c.play()},'▶ Play'),h('button',{class:'btn',onclick:()=>c.play({rate:.75})},'🐢 0.75×')),h('div',{style:'margin-top:10px'},ta),h('div',{class:'row'},chk),out,c.nudge))});
  return w},
/* 4 shadow & record */
(L,P,done)=>{const w=h('div',{},stepHead(4,'Shadow & record','Copy the actor’s rhythm and attitude, not just the words. Record yourself, then Compare plays the actor and you back-to-back.'),
    h('div',{class:'note'},'🎧 Headphones help: if the clip plays out loud while you record, the mic picks it up.'));
  let n=0;L.shadow.forEach(i=>{const c=lineCard(L,P,i),key='l'+L.id+':sh'+i;const a=audioEl();const cmp=h('button',{class:'btn',disabled:true},'⇄ Compare');const mine=h('button',{class:'btn',disabled:true},'▶ Mine');
    const onRec=url=>{a.src=url;cmp.disabled=false;mine.disabled=false;if(!w.dataset['r'+i]){w.dataset['r'+i]=1;if(++n>=L.shadow.length)done()}};
    mine.onclick=()=>{P.stop();a.currentTime=0;a.play().catch(()=>{})};
    cmp.onclick=()=>{unlock(a);c.play({onEnd:()=>setTimeout(()=>{a.currentTime=0;a.play().catch(()=>{toast('Tap ▶ Mine to hear yourself.');mine.classList.add('pri')})},350)})};
    w.appendChild(h('div',{class:'card'},h('div',{class:'heb he'},c.ln.he),h('div',{class:'tr'},c.ln.tr||''),h('div',{class:'small'},c.ln.en),
      h('div',{class:'row'},h('button',{class:'btn pri',onclick:()=>c.play()},'▶ Actor'),h('button',{class:'btn',onclick:()=>c.play({rate:.75})},'🐢 0.75×'),recButton(key,onRec),mine,cmp),
      canRec?null:h('div',{class:'row'},h('button',{class:'btn',onclick:()=>{if(!w.dataset['r'+i]){w.dataset['r'+i]=1;if(++n>=L.shadow.length)done()}}},'I shadowed it ✓')),
      srBlock(c.ln.he),a,c.nudge))});
  return w},
/* 5 say it */
(L,P,done)=>{const w=h('div',{},stepHead(5,'Say it','Read the situation, say your answer out loud first (record it if you can), then reveal what a native would say.'));
  let n=0;L.say.forEach((s,k)=>{const key='l'+L.id+':say'+k,a=audioEl();const ln=L.lines[s.line];const rv=h('div',{class:'hidden'});
    const show=()=>{if(!rv.classList.contains('hidden'))return;rv.classList.remove('hidden');if(++n>=L.say.length)done()};
    rv.appendChild(h('div',{class:'heb he',style:'margin-top:10px'},s.he));rv.appendChild(h('div',{class:'en'},s.en));
    const mine=h('button',{class:'btn',disabled:true,onclick:()=>{P.stop();a.currentTime=0;a.play().catch(()=>{})}},'▶ Mine');
    rv.appendChild(h('div',{class:'row'},h('button',{class:'btn',onclick:()=>{const sg=seg(L,s.line);P.seg(L.video,sg.start,sg.end)}},'▶ Actor: “'+ln.he+'”'),mine));
    rv.appendChild(srBlock(s.he));
    const rb=recButton(key,url=>{a.src=url;mine.disabled=false;show()},'● Record my answer');
    w.appendChild(h('div',{class:'card'},h('div',{class:'meta'},'Situation '+(k+1)),h('div',{style:'font-size:16px;font-weight:600;line-height:1.45'},s.sit),
      h('div',{class:'row'},rb,h('button',{class:'btn',onclick:e=>{show();e.target.remove()}},canRec?'Skip recording — reveal':'I said it — reveal')),rv,a))});
  return w},
/* 6 rewatch + comprehension */
(L,P,done)=>{const lid='l'+L.id,c=S.comp[lid]||{};const val=h('b',{},(c.post!=null?c.post:50)+'%');
  const sl=h('input',{type:'range',min:0,max:100,step:5,value:c.post!=null?c.post:50,oninput:e=>val.textContent=e.target.value+'%'});
  const hist=Object.entries(S.comp).filter(([k])=>k!==lid).map(([k,v])=>'L'+k.slice(1)+': '+v.post+'%').join(' · ');
  return h('div',{},h('div',{class:'card hl'},stepHead(6,'Rewatch','Whole clip, no text. Notice how much more you catch now.'),h('div',{class:'row'},h('button',{class:'btn pri',onclick:()=>P.full()},'▶ Play whole clip'))),
    h('div',{class:'card'},h('h2',{},'How much did you understand by ear?'),h('div',{class:'row'},sl),h('div',{class:'sub'},'About ',val,' of what was said.'),
      hist?h('div',{class:'small',style:'margin-top:6px'},'Earlier lessons: '+hist):null,
      h('div',{class:'row'},h('button',{class:'btn pri',onclick:e=>{S.comp[lid]={post:+sl.value,day:today()};save();done();e.target.textContent='Saved ✓'}},'Save'))))},
/* 7 review + chat challenge + finish */
(L,P,done)=>{const lid='l'+L.id;const w=h('div',{},stepHead(7,'Review & chat challenge','A few lines from earlier lessons, then one real Hebrew conversation.'));
  const rbox=h('div',{});w.appendChild(rbox);P.stop();reviewSession(rbox,{exclude:L.id,max:6});
  w.appendChild(h('div',{class:'card hl'},h('div',{class:'meta'},'Chat challenge'),h('h2',{},'Reply to Hebrew in chat — in Hebrew'),h('div',{class:'sub',style:'color:var(--tx)'},L.chat),
    h('div',{class:'small',style:'margin-top:8px'},'Use at least 2 of today’s lines:'),h('div',{class:'he',style:'font-size:17px;margin-top:6px;line-height:1.7'},L.lines.map(l=>l.he).join(' · ')),
    h('div',{class:'small',style:'margin-top:8px'},'Hebrew will answer and send back a corrected, more natural version.')));
  const fin=h('button',{class:'btn pri'},S.done[lid]?'Lesson complete ✓':'Finish lesson');
  fin.onclick=()=>{const added=addToDeck(L);S.done[lid]=1;save();done();award(lid+':done',30);markActive();fin.textContent='Lesson complete ✓';
    toast(added?`🎬 Done! ${added} lines join your review deck tomorrow.`:'🎬 Done!')};
  w.appendChild(h('div',{class:'row'},fin,h('a',{class:'btn',href:'index.html'},'← All lessons')));return w}
];

/* ---------- home page ---------- */
function home(){chrome();const C=window.IVX_CATALOG||[];const di=dayIndex();
  const main=h('main',{class:'wrap'});document.body.appendChild(main);
  main.appendChild(h('div',{class:'tag'},'Daily lessons · Intermediate'));main.appendChild(h('h1',{},'Street Hebrew from Fauda'));
  main.appendChild(h('div',{class:'sub'},'One official yes tv clip a day, ~15 minutes: listen, catch the lines by ear, shadow the actors, say it yourself, review.'));
  const past=C.filter(e=>e.day<=di);const todayE=C.find(e=>e.day===di)||past[past.length-1]||C[0];
  const due=dueItems().length;
  main.appendChild(h('a',{class:'card'+(due?' hl':''),href:'review.html'},h('div',{style:'display:flex;justify-content:space-between'},h('div',{class:'lt'},'Review deck'),h('span',{class:'badge'+(due?'':' soon')},due?due+' due':'0 due')),
    h('div',{class:'meta'},Object.keys(S.srs).length+' lines in your deck · spaced: 2 → 5 → 13 days…')));
  C.slice().reverse().forEach(e=>{const isToday=todayE&&e===todayE,open=e.day<=di,key=e.type==='rewatch'?'rw'+e.week:'l'+e.id,isDone=!!S.done[key];
    const badge=isToday?'Today':isDone?'Done':open?'Open':'Soon',bc=isToday?'':isDone?'done':open?'':'soon';
    const a=h(open?'a':'div',{class:'card'+(isToday?' hl':''),href:open?e.href:null},
      h('div',{style:'display:flex;justify-content:space-between;gap:10px'},h('div',{class:'meta'},`Day ${e.day} · `+(e.type==='rewatch'?'Rewatch week · no aids':`Lesson ${e.id} · ${e.mins}`)),h('span',{class:'badge '+bc},badge)),
      h('div',{class:'lt'},e.title),h('div',{class:'meta'},e.type==='rewatch'?'Rewatch the week’s clips with zero help and rate how much you get.':h('span',{},'Official yes tv clip · ',heSpan(e.clip))));
    main.appendChild(a)});
  main.appendChild(h('div',{class:'foot'},h('a',{href:'v2/'},'Previous version (v2 story game)')));main.appendChild(legalFoot())}

/* ---------- review page ---------- */
function reviewPage(){chrome();const main=h('main',{class:'wrap'});document.body.appendChild(main);
  main.appendChild(h('div',{class:'tag'},'Spaced review'));main.appendChild(h('h1',{},'Review deck'));
  main.appendChild(h('div',{class:'sub'},'Lines from every lesson you finished. Some you hear and say back; some you get in English and say in Hebrew. Miss one and it comes back tomorrow; get it and the gap grows.'));
  const box=h('div',{});main.appendChild(box);reviewSession(box,{max:15});main.appendChild(h('div',{class:'foot'},h('a',{href:'index.html'},'← All lessons')));main.appendChild(legalFoot())}

/* ---------- rewatch-week page (no aids) ---------- */
async function rewatchPage(){chrome();const q=new URLSearchParams(location.search),week=+(q.get('week')||1);
  const E=(window.IVX_CATALOG||[]).find(e=>e.type==='rewatch'&&e.week===week);const main=h('main',{class:'wrap'});document.body.appendChild(main);
  if(!E){main.appendChild(h('h1',{},'Rewatch week not found'));return}
  main.appendChild(h('div',{class:'tag'},`Day ${E.day} · Rewatch week ${week}`));main.appendChild(h('h1',{},E.title));
  main.appendChild(h('div',{class:'sub'},'No text, no phrase cards, no slow-down. Watch each clip from this week straight through and rate how much you understood by ear. Compare with the day you learned it.'));
  const Ls=(await Promise.all(E.lessons.map(loadLesson))).filter(Boolean);
  if(!Ls.length){main.appendChild(h('div',{class:'note'},'No lessons available yet.'));return}
  const pv=h('div',{});main.appendChild(h('div',{class:'video'},h('div',{class:'box'},pv)));const P=Player(pv,Ls[0].video);
  const key='rw'+week;S.comp[key]=S.comp[key]||{};let rated=0;
  Ls.forEach(L=>{const prev=S.comp['l'+L.id];const val=h('b',{},'50%');const sl=h('input',{type:'range',min:0,max:100,step:5,value:50,oninput:e=>val.textContent=e.target.value+'%'});
    main.appendChild(h('div',{class:'card'},h('div',{class:'meta'},`Lesson ${L.id} · ${L.duration}`),h('div',{class:'lt'},L.title),
      h('div',{class:'row'},h('button',{class:'btn pri',onclick:()=>P.full(L.video)},'▶ Watch')),h('div',{class:'row'},sl),
      h('div',{class:'sub'},'Now: ',val,prev?` · on Day ${L.day} you said ${prev.post}%`:''),
      h('div',{class:'row'},h('button',{class:'btn',onclick:e=>{S.comp[key][L.id]=+sl.value;save();e.target.textContent='Saved ✓';if(++rated===Ls.length){S.done[key]=1;save();award(key,30);markActive();toast('Rewatch week done 🔥')}}},'Save'))))});
  main.appendChild(h('div',{class:'foot'},h('a',{href:'index.html'},'← All lessons')));main.appendChild(legalFoot())}

window.IVX={register,lessonPage,home,reviewPage,rewatchPage,wordDiff,normW,_state:()=>S,_grade:grade,_due:dueItems,_addToDeck:addToDeck,_today:today,_dayIndex:dayIndex,_LESSONS:LESSONS};
})();
