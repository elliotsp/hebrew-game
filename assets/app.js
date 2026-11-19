/* Ivrit — engine v7 (Nov 19 2026 redesign). Three tracks · 2–3 minute sessions · speak-first.
   Session = Intro → 3 × (Hear it: comprehension quiz → Say it: speech recognition) → Real life (say it in a situation) → Done.
   No browser TTS anywhere: every Hebrew voice is the real speaker/singer, via the official YouTube embed (never covered). */
(function(){
'use strict';
const TZ='America/New_York',START='2026-10-15',KEY='ivx1';
const fmtD=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'});
const today=()=>fmtD.format(new Date());
const addDays=(d,n)=>{const[Y,M,D]=d.split('-').map(Number);return new Date(Date.UTC(Y,M-1,D+n)).toISOString().slice(0,10)};
const dayIndex=()=>Math.round((Date.parse(today()+'T00:00:00Z')-Date.parse(START+'T00:00:00Z'))/864e5)+1;
const dateOfDay=n=>addDays(START,n-1);
const hourNY=()=>+new Intl.DateTimeFormat('en-US',{timeZone:TZ,hour:'numeric',hour12:false}).format(new Date())%24;
const mmss=t=>{t=Math.max(0,t);const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(1)};

/* ---------- state (same localStorage key as v5, so streak / XP / progress carry over) ---------- */
function blank(){return{v:1,xp:0,streak:0,lastDay:'',done:{},steps:{},comp:{},srs:{},nudge:{},tr:true,awarded:{},pos:{},days:{},runs:{},best:{}}}
function load(){let s=null;try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}s=Object.assign(blank(),s||{});
  if(s.lastDay&&!s.days[s.lastDay])s.days[s.lastDay]=1;return s}
let S=load();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
function streakNow(){const t=today();return(S.lastDay===t||S.lastDay===addDays(t,-1))?S.streak:0}
function markActive(){const t=today();S.days[t]=1;if(S.lastDay!==t){S.streak=(S.lastDay===addDays(t,-1))?S.streak+1:1;S.lastDay=t}save()}
function award(k,n){if(S.awarded[k])return 0;S.awarded[k]=1;S.xp+=n;save();return n}

/* ---------- DOM helpers ---------- */
function h(tag,a,...kids){const e=document.createElement(tag);if(a)for(const k in a){const v=a[k];if(v==null||v===false)continue;
  if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else if(k==='style'&&typeof v==='object')Object.assign(e.style,v);else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?'':v)}
  kids.flat().forEach(c=>{if(c==null||c===false)return;e.appendChild(typeof c==='string'?document.createTextNode(c):c)});return e}
const heb=(t,cls)=>h('span',{class:'he'+(cls?' '+cls:''),dir:'rtl',lang:'he'},t);
const HEB_RUN=/[\u05D0-\u05EA][\u0591-\u05F4\s,.?!:…'"׳״־\-–0-9]*[\u05D0-\u05EA\u0591-\u05C7]/g;
function bidi(html){if(!html)return '';return String(html).split(/(<[^>]+>)/).map(p=>p.startsWith('<')?p:p.replace(HEB_RUN,m=>'<bdi class="he" lang="he">'+m+'</bdi>')).join('')}
const rich=(html,cls)=>h('div',{class:cls||'',html:bidi(html)});
const isHeb=s=>/[\u05D0-\u05EA]/.test(s)&&!/[a-z]{3}/i.test(s.replace(/<[^>]+>/g,''));
let toastEl=null;
function toast(msg,ms){if(toastEl)toastEl.remove();const t=toastEl=h('div',{class:'toast',role:'status'},msg);document.body.appendChild(t);setTimeout(()=>t.classList.add('out'),(ms||3000)-300);setTimeout(()=>t.remove(),ms||3000)}
const vibe=n=>{try{navigator.vibrate&&navigator.vibrate(n||12)}catch(e){}};
function ensureVisible(el){requestAnimationFrame(()=>{const sc=el.closest('.stage');if(!sc)return;const r=el.getBoundingClientRect(),c=sc.getBoundingClientRect();
  if(r.bottom>c.bottom-8||r.top<c.top)sc.scrollTo({top:sc.scrollTop+(r.height>c.height-24?r.top-c.top-12:r.bottom-c.bottom+16),behavior:'smooth'})})}
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const ICON={
  x:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  back:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  play:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
  mic:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  slow:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="13" r="7"/><path d="M12 13V9.5M10 3h4"/></svg>',
  chev:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>'};

/* ---------- Hebrew comparison: ignores nikud, punctuation, final-letter forms, ו/י plene spelling; tolerates one-letter slips ---------- */
const FIN={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};
function normW(w){return w.replace(/[\u0591-\u05C7]/g,'').replace(/[ךםןףץ]/g,c=>FIN[c]).replace(/[^\u05D0-\u05EAa-z0-9]/gi,'').toLowerCase()}
const loose=w=>w.replace(/[וי]/g,'').replace(/^ה(?=..)/,'');
function tok(s){return String(s).replace(/<[^>]+>/g,' ').replace(/[־–—\-\/]/g,' ').split(/\s+/).map(w=>({raw:w,n:normW(w)})).filter(w=>w.n)}
function lev(a,b){if(Math.abs(a.length-b.length)>1)return 9;const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
function wEq(a,b){if(a===b||loose(a)===loose(b))return 2;if(a.length>=3&&lev(a,b)<=1)return 1;return 0}
function wordDiff(target,input){const T=tok(target);let U=tok(input);
  /* recognizers sometimes glue or split words: "בסדר" vs "ב סדר" */
  U=U.flatMap(u=>{for(let i=0;i+1<T.length;i++){const c=T[i].n+T[i+1].n;if(u.n===c||loose(u.n)===loose(c))return[{raw:T[i].raw,n:T[i].n},{raw:T[i+1].raw,n:T[i+1].n}]}return[u]});
  const n=T.length,m=U.length,dp=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--){const e=wEq(T[i].n,U[j].n);dp[i][j]=Math.max(dp[i+1][j],dp[i][j+1],e?dp[i+1][j+1]+e:0)}
  const out=[];let i=0,j=0;
  while(i<n||j<m){if(i<n&&j<m){const e=wEq(T[i].n,U[j].n);if(e&&dp[i][j]===dp[i+1][j+1]+e){out.push({w:T[i].raw,t:e===2?'ok':'close'});i++;j++;continue}}
    if(j<m&&(i>=n||dp[i][j+1]>=dp[i+1][j])){out.push({w:U[j].raw,t:'extra'});j++}else{out.push({w:T[i].raw,t:'miss'});i++}}
  const ok=out.filter(o=>o.t==='ok').length,close=out.filter(o=>o.t==='close').length,extra=out.filter(o=>o.t==='extra').length;
  const score=n?Math.max(0,Math.round(((ok+close*.6)/n-Math.max(0,extra-1)*.04)*100)):0;
  return{parts:out,score:Math.min(100,score),total:n}}
/* best match over several acceptable targets and several recognizer alternatives */
function bestMatch(targets,heard){let best=null;targets.filter(Boolean).forEach((t,ti)=>heard.filter(Boolean).forEach(u=>{const d=wordDiff(t,u);d.target=t;d.ti=ti;d.heard=u;if(!best||d.score>best.score)best=d}));return best}

/* ---------- YouTube IFrame API wrapper (official player, never covered or hidden while playing) ---------- */
const ytQ=[];let ytLoaded=false;
window.onYouTubeIframeAPIReady=function(){ytLoaded=true;ytQ.splice(0).forEach(f=>f())};
function whenYT(f){if(window.YT&&window.YT.Player&&ytLoaded)f();else ytQ.push(f);
  if(!document.getElementById('yt-api'))document.head.appendChild(h('script',{id:'yt-api',src:'https://www.youtube.com/iframe_api'}))}
function Player(el,videoId){
  const P={ready:false,q:[],cur:videoId,timer:null,yt:null,tok:0,playing:false};
  whenYT(()=>{P.yt=new YT.Player(el,{videoId,playerVars:{rel:0,playsinline:1,modestbranding:1},
    events:{onReady:()=>{P.ready=true;P.q.splice(0).forEach(f=>f())},onStateChange:e=>{P.playing=e.data===1;document.body.classList.toggle('vplay',P.playing)},
      onError:e=>{P.err=e.data;toast('This video won’t play here (error '+e.data+'). Open it on YouTube.')}}})});
  P.do=f=>{if(P.ready)f();else P.q.push(f)};
  P.clear=()=>{P.tok++;if(P.timer){clearInterval(P.timer);P.timer=null}};
  P.stop=()=>{P.clear();P.do(()=>{try{P.yt.pauseVideo()}catch(e){}})};
  P.seg=(vid,start,end,o)=>{o=o||{};P.clear();const my=P.tok;P.do(()=>{if(my!==P.tok)return;const y=P.yt,rate=o.rate||1;let entered=false,t0=Date.now();
    if(vid!==P.cur){P.cur=vid;y.loadVideoById({videoId:vid,startSeconds:start})}else{y.seekTo(start,true);y.playVideo()}
    try{y.setPlaybackRate(rate)}catch(e){}
    const maxMs=((end-start)/rate+10)*1000;
    P.timer=setInterval(()=>{let t;try{t=y.getCurrentTime()}catch(e){return}
      if(!entered){if(t>=start-1.5&&t<end)entered=true;else if(Date.now()-t0<4000)return}
      if(t>=end||Date.now()-t0>maxMs){if(P.timer){clearInterval(P.timer);P.timer=null}try{y.pauseVideo();y.setPlaybackRate(1)}catch(e){}if(o.onEnd&&my===P.tok)o.onEnd()}},50)})};
  P.full=vid=>P.do(()=>{P.clear();const y=P.yt;vid=vid||videoId;if(vid!==P.cur){P.cur=vid;y.loadVideoById({videoId:vid,startSeconds:0})}else{try{y.setPlaybackRate(1)}catch(e){}y.seekTo(0,true);y.playVideo()}});
  P.time=()=>{try{return P.yt.getCurrentTime()}catch(e){return null}};
  return P}

/* ---------- speech recognition (he-IL) with graceful fallback to record-and-compare ---------- */
const SRC=window.SpeechRecognition||window.webkitSpeechRecognition;
let srBroken=false,earActive=null;
const canSR=()=>!!SRC&&!srBroken;
const canRec=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
function earStop(){if(earActive){try{earActive.abort()}catch(e){}earActive=null}}
/* listen once; calls onPartial(text) while he talks and onDone({alts:[…], error}) once */
function listenOnce(onPartial,onDone){earStop();let r;try{r=new SRC()}catch(e){srBroken=true;return onDone({error:'unsupported'})}
  r.lang='he-IL';r.interimResults=true;r.maxAlternatives=5;r.continuous=false;
  let finals=[],interim='',ended=false,err=null;
  const fin=()=>{if(ended)return;ended=true;clearTimeout(cap);earActive=null;
    const tops=finals.map(f=>f[0]).join(' ').trim()||interim.trim();
    const alts=[tops];finals.forEach((f,i)=>f.slice(1).forEach(a=>{alts.push(finals.map((g,j)=>j===i?a:g[0]).join(' '))}));
    onDone({alts:[...new Set(alts.filter(Boolean))],error:err})};
  r.onresult=e=>{interim='';for(let i=e.resultIndex;i<e.results.length;i++){const res=e.results[i];
      if(res.isFinal)finals[i]=Array.from(res).map(a=>a.transcript);else interim+=res[0].transcript}
    onPartial((finals.map(f=>f&&f[0]).filter(Boolean).join(' ')+' '+interim).trim())};
  r.onerror=e=>{err=e.error||'error';if(/not-allowed|service-not-allowed|audio-capture|language-not-supported/.test(err))srBroken=true};
  r.onend=fin;
  const cap=setTimeout(()=>{try{r.stop()}catch(e){}},9000);
  try{r.start()}catch(e){err='start';srBroken=true;return fin()}
  earActive={abort:()=>{ended=true;clearTimeout(cap);try{r.abort()}catch(e){}},stop:()=>{try{r.stop()}catch(e){}}};return earActive}

let recActive=null;
async function recStart(maxMs){const st=await navigator.mediaDevices.getUserMedia({audio:true});
  const mt=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t));
  const mr=new MediaRecorder(st,mt?{mimeType:mt}:undefined),chunks=[];
  mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  const done=new Promise(res=>{mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());res(new Blob(chunks,{type:mr.mimeType||mt||'audio/mp4'}))}});
  mr.start();const timer=setTimeout(()=>{if(mr.state==='recording')mr.stop()},maxMs||10000);
  return{stop:()=>{clearTimeout(timer);if(mr.state==='recording')mr.stop();return done},done}}
function stopRec(){if(recActive){try{recActive.stop()}catch(e){}recActive=null}}
function stopAll(){earStop();stopRec()}

/* ---------- content registry ---------- */
const LESSONS={};const SPEECH0=100,SONG0=200;
const kindOf=L=>L.track==='song'||L.id>SONG0?'song':L.track==='speech'||L.id>SPEECH0?'speech':'fauda';
const TRACKS={
  fauda:{key:'fauda',name:'Fauda',icon:'🎬',tag:'Street Hebrew from the show',long:'Real scenes from the official yes clips. How Israelis actually talk: fast, blunt, full of attitude.',unit:'Lesson'},
  speech:{key:'speech',name:'Netanyahu',icon:'🎙',tag:'Formal Hebrew · what’s happening',long:'Key statements from the Prime Minister’s official channels. Learn the news register, and how you’d say each line to a friend.',unit:'Speech'},
  song:{key:'song',name:'Omer Adam',icon:'🎵',tag:'How young Israelis talk',long:'Short excerpts from official music videos. The slang and phrases you’ll hear at a bar in Tel Aviv.',unit:'Song'}};
const numOf=L=>kindOf(L)==='song'?L.id-SONG0:kindOf(L)==='speech'?L.id-SPEECH0:L.id;
const lname=L=>TRACKS[kindOf(L)].unit+' '+numOf(L);
const dataFile=id=>id>SONG0?'data/song-'+(id-SONG0)+'.js':id>SPEECH0?'data/speech-'+(id-SPEECH0)+'.js':'data/lesson-'+id+'.js';
const pageOf=id=>id>SONG0?'song-'+(id-SONG0)+'.html':id>SPEECH0?'speech-'+(id-SPEECH0)+'.html':'lesson-'+id+'.html';
function register(d){LESSONS[d.id]=d}
function loadLesson(id){return new Promise(res=>{if(LESSONS[id])return res(LESSONS[id]);const s=h('script',{src:dataFile(id)});s.onload=()=>res(LESSONS[id]||null);s.onerror=()=>res(null);document.head.appendChild(s)})}
function seg(L,i){const ln=L.lines[i],k='l'+L.id+':'+i,n=S.nudge[k]||{s:0,e:0};return{start:Math.max(0,ln.start+n.s),end:ln.end+n.e,key:k}}
const thumb=(v,q)=>v?'https://i.ytimg.com/vi/'+v+'/'+(q||'mqdefault')+'.jpg':'';
const clean=s=>String(s||'').replace(/\s*\([^)]*\)/g,'').replace(/\s+([.,?!])/g,'$1').trim();
function focusOf(L){if(L.focus)return L.focus.slice(0,3);const f=(L.shadow&&L.shadow.length>=3?L.shadow:L.lines.map((_,i)=>i)).slice(0,3);return f.slice().sort((a,b)=>a-b)}
function realOf(L){const say=L.say||[];if(!say.length)return null;const fo=focusOf(L);const pool=say.filter(s=>fo.includes(s.line));const list=pool.length?pool:say;return list[(S.runs['l'+L.id]||0)%list.length]}
/* comprehension question for line i: authored (L.quiz) or generated from the lesson's other lines */
function quizOf(L,i){const q=(L.quiz||[]).find(x=>x.line===i);if(q)return q;
  const ln=L.lines[i];const others=shuffle(L.lines.map((x,j)=>j).filter(j=>j!==i)).slice(0,2).map(j=>clean(L.lines[j].en));
  return{type:'meaning',q:kindOf(L)==='song'?'What are they singing?':'What did you just hear?',o:[clean(ln.en),...others],a:0,f:ln.note||''}}
const QTYPE={meaning:'Listen · Meaning',reply:'Listen · Best reply',vibe:'Listen · Read the vibe',casual:'Listen · Say it casually',when:'Listen · When to use it',implies:'Listen · What they mean'};

/* ---------- catalog (data/catalog.js: one list for every track) ---------- */
function entries(){return(window.IVX_CATALOG||[]).map(e=>Object.assign({},e,{track:e.track||(e.type==='speech'?'speech':e.type==='song'?'song':'fauda')}))}
const entryKey=e=>e.type==='rewatch'?'rw'+e.week:'l'+e.id;
const isOpen=e=>!e.day||e.day<=dayIndex();
function todayPick(){const E=entries(),di=dayIndex();const t=E.find(e=>e.day===di);
  const open=E.filter(isOpen);const undone=open.filter(e=>!S.done[entryKey(e)]);
  if(t&&!S.done[entryKey(t)])return{e:t,label:'Today'};
  if(t&&!undone.length)return{e:t,label:'Today ✓'};
  const recent=undone.filter(e=>e.day).sort((a,b)=>b.day-a.day)[0];if(recent)return{e:recent,label:'Up next'};
  if(undone.length)return{e:undone[undone.length-1],label:'Up next'};
  return{e:open.filter(e=>e.day).sort((a,b)=>b.day-a.day)[0]||open[0],label:'Again?'}}

/* ---------- shells ---------- */
function headTags(){const m=(n,c)=>{if(!document.querySelector('meta[name="'+n+'"]'))document.head.appendChild(h('meta',{name:n,content:c}))};
  m('apple-mobile-web-app-capable','yes');m('mobile-web-app-capable','yes');m('apple-mobile-web-app-status-bar-style','black-translucent');m('apple-mobile-web-app-title','Ivrit')}
function shell(track){headTags();document.body.className='app t-'+track;
  const bar=h('i',{}),count=h('div',{class:'count'});
  const top=h('header',{class:'apptop'},h('a',{class:'x',href:'index.html','aria-label':'Close',html:ICON.x}),h('div',{class:'prog'},bar),count);
  const pv=h('div',{});const player=h('div',{class:'player'},h('div',{class:'box'},pv));
  const stage=h('main',{class:'stage'});
  const back=h('button',{class:'ab back',type:'button','aria-label':'Back',html:ICON.back});
  const pri=h('button',{class:'ab pri',type:'button'});
  const alt=h('button',{class:'ab alt',type:'button'});
  const actions=h('footer',{class:'actions'},back,pri,alt);
  document.body.append(top,player,stage,actions);
  const A={top,bar,count,pv,player,stage,back,pri,alt,actions};
  A.setPri=(lab,fn,op)=>{op=op||{};pri.hidden=false;pri.innerHTML='';if(op.icon)pri.appendChild(h('span',{class:'ic',html:ICON[op.icon]}));pri.appendChild(h('span',{},lab));
    pri.onclick=fn?()=>{vibe();fn()}:null;pri.disabled=!!op.disabled;pri.className='ab pri'+(op.cls?' '+op.cls:'');
    alt.hidden=!op.alt;alt.textContent=op.altLabel||'Skip';alt.onclick=op.alt?()=>{vibe();op.alt()}:null};
  return A}
function Flow(A,screens,o){o=o||{};let cur=-1;
  const go=(i,dir)=>{if(i<0||i>=screens.length)return;o.P&&o.P.stop();stopAll();cur=i;
    const el=h('section',{class:'scr'+(dir<0?' rev':'')});A.stage.innerHTML='';A.stage.appendChild(el);A.stage.scrollTop=0;
    A.back.hidden=i===0||!!screens[i].noBack;A.back.onclick=()=>go(cur-1,-1);
    A.bar.style.width=(screens.length>1?(i/(screens.length-1))*100:100)+'%';A.count.textContent=screens[i].count||'';
    const c={el,i,dir,next:()=>{o.onDone&&o.onDone(cur);go(cur+1,1)},pri:A.setPri,show:ensureVisible,P:o.P};
    screens[i].render(c);o.onGo&&o.onGo(i)};
  return{go,get cur(){return cur},screens}}
function legalFoot(){return h('div',{class:'legal'},'Clips © their owners (yes, the Prime Minister’s Office, Omer Adam’s official channel), embedded with the official YouTube player under the ',h('a',{href:'https://www.youtube.com/t/terms',target:'_blank',rel:'noopener'},'YouTube Terms'),' and ',h('a',{href:'https://policies.google.com/privacy',target:'_blank',rel:'noopener'},'Google Privacy Policy'),'. Progress stays in this browser. Speech recognition is done by your browser (Safari/Chrome may send audio to Apple/Google to transcribe it); recordings in fallback mode never leave your phone. Not affiliated with yes, Netflix, YouTube, Omer Adam or the Israeli government. Speeches are here for the language, not the politics.')}

/* ---------- building blocks ---------- */
const kick=(t,cls)=>h('div',{class:'kick'+(cls?' '+cls:'')},t);
const note=(html,cls)=>h('div',{class:'note'+(cls?' '+cls:''),html:bidi(html)});
function chips(...b){return h('div',{class:'chips'},b)}
function chip(label,fn,icon,cls){return h('button',{class:'chip'+(cls?' '+cls:''),type:'button',onclick:e=>{vibe();fn(e)}},icon?h('span',{class:'ic',html:ICON[icon]}):null,label)}
function lineCard(L,i,o){o=o||{};const ln=L.lines[i];
  return h('div',{class:'lcard'},h('div',{class:'he big',dir:'rtl',lang:'he'},ln.he),ln.tr?h('div',{class:'tr'},ln.tr):null,h('div',{class:'en'},ln.en),
    o.lean?null:[ln.casual?h('div',{class:'casual'},h('span',{class:'tagc'},'To a friend'),h('div',{class:'he',dir:'rtl',lang:'he'},ln.casual),ln.casualTr?h('div',{class:'tr'},ln.casualTr):null):null,
      ln.note?rich(ln.note,'lnote'):null,ln.reg&&!ln.casual?h('div',{class:'lnote',html:bidi(ln.reg)}):null])}
function playChips(L,P,i){const s=()=>seg(L,i);return chips(chip('Replay',()=>{const g=s();P.seg(L.video,g.start,g.end)},'play'),chip('Slow',()=>{const g=s();P.seg(L.video,g.start,g.end,{rate:.75})},'slow'),fixLink(L,P,i))}
function fixLink(L,P,i){const wrap=h('span',{class:'fixw'});const k='l'+L.id+':'+i;
  const b=h('button',{class:'link',type:'button'},'Cut off?');
  b.onclick=()=>{b.remove();const win=h('b',{});const paint=()=>{const g=seg(L,i);win.textContent=mmss(g.start)+'–'+mmss(g.end)};paint();
    const nud=(f,d)=>{const n=S.nudge[k]||{s:0,e:0};n[f]=Math.round((n[f]+d)*10)/10;S.nudge[k]=n;save();paint();const g=seg(L,i);P.seg(L.video,g.start,g.end)};
    wrap.append(h('div',{class:'fix'},h('span',{},'Start'),h('button',{type:'button',onclick:()=>nud('s',-.5)},'−'),h('button',{type:'button',onclick:()=>nud('s',.5)},'+'),win,
      h('span',{},'End'),h('button',{type:'button',onclick:()=>nud('e',-.5)},'−'),h('button',{type:'button',onclick:()=>nud('e',.5)},'+')))};
  wrap.appendChild(b);return wrap}
function diffView(d){const v=d.score>=85?['ok','Nailed it']:d.score>=60?['mid','Close']:['bad','Not yet'];
  return h('div',{class:'diffbox '+v[0]},h('div',{class:'verdict'},h('b',{},v[1]),h('span',{class:'score'},d.score+'%')),
    h('div',{class:'diff',dir:'rtl',lang:'he'},d.parts.filter(p=>p.t!=='extra').map(p=>h('span',{class:'w-'+p.t},p.w))),
    h('div',{class:'heard'},h('span',{},'Heard: '),heb(d.heard||'—')))}

/* Speak: drives the bottom button for a "say it" screen.
   targets: acceptable Hebrew answers (first = model). Calls onResult(score) after each attempt. */
function Speak(c,A,o){const box=h('div',{class:'speak'});const live=h('div',{class:'live',dir:'rtl',lang:'he',hidden:true});box.appendChild(live);
  let tries=0,best=0;const P=o.P;
  const idle=()=>{if(!tries)c.pri(o.label||'Tap and say it',go,{icon:'mic',alt:o.skip||finish,altLabel:'Skip'});
    else if(best>=60)c.pri('Next',finish,{alt:go,altLabel:'Again'});
    else c.pri('Try again',go,{icon:'mic',alt:finish,altLabel:'Skip'})};
  const finish=()=>{stopAll();o.onDone&&o.onDone(best,tries)};
  const show=el=>{[...box.querySelectorAll('.diffbox,.recbox,.hint')].forEach(x=>x.remove());box.appendChild(el);c.show(el)};
  function go(){P&&P.stop();if(canSR())return sr();if(canRec)return rec();show(note('This browser can’t use the microphone. Say it out loud, then tap Next.','hint'));tries++;best=60;idle()}
  function sr(){live.hidden=false;live.textContent='…';live.classList.add('on');c.pri('Listening… tap when done',()=>{earActive&&earActive.stop()},{cls:'rec',icon:'mic'});
    listenOnce(t=>{live.textContent=t||'…'},r=>{live.classList.remove('on');
      if(!r.alts.length){live.hidden=true;
        if(srBroken){show(note('Speech recognition isn’t available here'+(r.error?' ('+r.error+')':'')+', so you’ll record yourself and compare with the clip instead.','hint'));return canRec?rec():idle()}
        show(note(r.error==='no-speech'||!r.error?'Didn’t catch that. Tap and say it a bit louder.':'Something went wrong ('+r.error+'). Try again.','hint'));idle();return}
      live.hidden=true;tries++;const d=bestMatch(o.targets,r.alts);best=Math.max(best,d.score);
      if(d.score>=85)vibe([10,40,10]);show(diffView(d));o.onResult&&o.onResult(d);idle()})}
  async function rec(){let r;try{r=await recStart(10000)}catch(e){show(note('Microphone blocked. Say it out loud, then tap Next.','hint'));tries++;best=60;return idle()}
    recActive=r;c.pri('Recording… tap to stop',()=>{r.stop()},{cls:'rec',icon:'mic'});
    const blob=await r.done;recActive=null;tries++;best=Math.max(best,60);const url=URL.createObjectURL(blob);const au=h('audio',{src:url,preload:'auto',playsinline:true});
    const g=o.seg&&o.seg();
    show(h('div',{class:'recbox'},h('div',{class:'small'},'Compare: you, then the original. Same rhythm? Same stress?'),
      chips(chip('You',()=>{P&&P.stop();au.currentTime=0;au.play().catch(()=>{})},'play'),g?chip('Original',()=>{au.pause();P.seg(o.video,g.start,g.end)},'play'):null),au));
    au.play().catch(()=>{});o.onResult&&o.onResult({score:60,rec:true});idle()}
  idle();return box}

/* ---------- session (lesson / speech / song) ---------- */
function lessonPage(id){const L=LESSONS[id];if(!L){document.body.textContent='Not found';return}
  const lid='l'+L.id,kind=kindOf(L),T=TRACKS[kind];
  const A=shell(kind);const P=Player(A.pv,L.video);IVX._player=P;
  const fo=focusOf(L),real=realOf(L);const n=fo.length;
  const screens=[{count:'',render:c=>scIntro(L,P,c,fo)}];
  fo.forEach((li,k)=>{screens.push({count:`${k+1}/${n}`,render:c=>scHear(L,P,li,k,n,c)});screens.push({count:`${k+1}/${n}`,render:c=>scSay(L,P,A,li,k,n,c)})});
  if(real)screens.push({count:'Real life',render:c=>scReal(L,P,A,real,c)});
  screens.push({count:'',noBack:true,render:c=>scDone(L,P,A,c,fo)});
  const F=Flow(A,screens,{P,onGo:i=>{A.player.hidden=i===screens.length-1;S.pos[lid]=i;save()}});IVX._flow=F;
  const start=S.done[lid]?0:Math.min(S.pos[lid]||0,screens.length-2);F.go(start,1)}

function scIntro(L,P,c,fo){const kind=kindOf(L),T=TRACKS[kind],lid='l'+L.id;
  c.el.append(h('div',{class:'pill'},T.icon+' '+T.name+' · '+lname(L)),h('h1',{},L.title),
    h('div',{class:'src'},heb(L.heTitle),h('span',{},' · '+(L.credit||'yes tv'))),rich(L.blurb,'blurb'),
    h('div',{class:'plan'},h('div',{},h('b',{},String(fo.length)),h('span',{},'lines')),h('div',{},h('b',{},'~2'),h('span',{},'minutes')),h('div',{},h('b',{html:ICON.mic}),h('span',{},'you speak'))));
  (L.warnings||[]).forEach(w=>c.el.appendChild(note(w,'warn')));
  if(L.burnedIn)c.el.appendChild(note('Hebrew subtitles are burned into this video. For a real listening rep, glance away while a line plays.','soft'));
  c.el.appendChild(chips(chip('Watch the whole clip first · '+L.duration,()=>P.full(),'play')));
  if(S.done[lid])c.el.appendChild(note('Done before ✓ — every run picks a different real-life prompt.','soft'));
  c.pri('Start',()=>c.next())}

function scHear(L,P,i,k,n,c){const q=quizOf(L,i),ln=L.lines[i];const play=()=>{const g=seg(L,i);P.seg(L.video,g.start,g.end)};
  c.el.append(kick(QTYPE[q.type]||'Listen'),h('h2',{},q.q),playChips(L,P,i));
  const opts=h('div',{class:'opts'}),fb=h('div',{class:'fb',hidden:true});
  const ord=shuffle(q.o.map((_,j)=>j));let answered=false;
  ord.forEach(j=>{const t=q.o[j];const b=h('button',{class:'opt'+(isHeb(t)?' heo':''),type:'button',dir:isHeb(t)?'rtl':null,lang:isHeb(t)?'he':null,html:isHeb(t)?t:bidi(t)});
    b.onclick=()=>{if(answered)return;answered=true;const ok=j===q.a;vibe(ok?[10,30,10]:30);b.classList.add(ok?'ok':'bad');opts.children[ord.indexOf(q.a)].classList.add('ok');opts.classList.add('answered');
      S.best[L.id+':q'+i]=ok?1:0;save();
      fb.hidden=false;fb.append(h('div',{class:'vd '+(ok?'ok':'bad')},ok?'Right':'Not quite'),q.f?rich(q.f,'why'):null,lineCard(L,i,{lean:true}));c.show(fb);
      c.pri('Say it',()=>c.next(),{icon:'mic'})};opts.appendChild(b)});
  c.el.append(opts,fb);
  c.pri('Pick an answer',null,{disabled:true,alt:()=>{if(!answered){answered=true;opts.classList.add('answered');opts.children[ord.indexOf(q.a)].classList.add('ok');fb.hidden=false;fb.append(q.f?rich(q.f,'why'):null,lineCard(L,i,{lean:true}));c.show(fb);c.pri('Say it',()=>c.next(),{icon:'mic'})}},altLabel:'Show me'});
  if(c.dir>0)play()}

function scSay(L,P,A,i,k,n,c){const ln=L.lines[i];
  c.el.append(kick('Say it · line '+(k+1)+' of '+n),h('h2',{},kindOf(L)==='song'?'Say it like you mean it':'Say it out loud'),lineCard(L,i),playChips(L,P,i));
  const targets=[ln.he].concat(ln.alt||[]);
  c.el.appendChild(Speak(c,A,{P,targets,video:L.video,seg:()=>seg(L,i),onDone:best=>{S.best['l'+L.id+':'+i]=Math.max(S.best['l'+L.id+':'+i]||0,best);save();c.next()}}))}

function scReal(L,P,A,s,c){const ln=L.lines[s.line],kind=kindOf(L);
  const targets=[s.he].concat(s.alt||[],s.street?[s.street]:[],ln?[ln.he]:[]);
  c.el.append(kick('Real life'),h('h2',{},'How would you say it?'),h('div',{class:'sit'},rich(s.sit,'')));
  const hint=h('button',{class:'link',type:'button'},'Need a hint?');hint.onclick=()=>{hint.replaceWith(h('div',{class:'hintline'},h('span',{},'From the clip: '),heb(ln?ln.he:'')))};
  const reveal=h('div',{class:'model',hidden:true},h('div',{class:'small'},'A natural way to say it'),h('div',{class:'he big',dir:'rtl',lang:'he'},s.he),h('div',{class:'en'},s.en),
    s.street?h('div',{class:'casual'},h('span',{class:'tagc'},kind==='speech'?'To a friend':'Even more casual'),h('div',{class:'he',dir:'rtl',lang:'he'},s.street)):null,
    ln?chips(chip('Original line',()=>{const g=seg(L,s.line);P.seg(L.video,g.start,g.end)},'play')):null);
  c.el.append(hint);
  const sp=Speak(c,A,{P,targets,label:'Tap and answer',video:L.video,seg:ln?()=>seg(L,s.line):null,onResult:()=>{reveal.hidden=false},onDone:()=>c.next(),
    skip:()=>{stopAll();reveal.hidden=false;c.show(reveal);c.pri('Next',()=>c.next())}});
  c.el.append(sp,reveal)}

function scDone(L,P,A,c,fo){const lid='l'+L.id,first=!S.done[lid];P.stop();
  S.done[lid]=1;S.runs[lid]=(S.runs[lid]||0)+1;S.pos[lid]=0;addToDeck(L,fo);const xp=award(lid+':v7',30);markActive();
  const T=TRACKS[kindOf(L)];
  c.el.append(h('div',{class:'done'},h('div',{class:'ring'},h('span',{},'✓')),h('h1',{},first?'Session done':'Done again'),
    h('div',{class:'stats'},h('div',{},h('b',{},'🔥 '+streakNow()),h('span',{},'day streak')),h('div',{},h('b',{},(xp?'+'+xp:'+0')),h('span',{},'XP')),h('div',{},h('b',{},String(fo.length)),h('span',{},'new lines')))));
  c.el.append(h('div',{class:'recap'},fo.map(i=>h('div',{class:'rl'},h('div',{class:'he',dir:'rtl',lang:'he'},L.lines[i].he),h('div',{class:'en'},clean(L.lines[i].en))))));
  if(L.chat)c.el.append(h('div',{class:'chat'},h('div',{class:'kick'},'Want real feedback?'),rich(L.chat,'ctext'),h('div',{class:'small'},'Reply to me in our chat in Hebrew and I’ll correct it.')));
  c.el.append(chips(chip('Watch the whole clip',()=>{A.player.hidden=false;P.full()},'play')),
    h('details',{class:'about'},h('summary',{},'About the Hebrew in this session'),rich(L.source,'small')));
  c.pri('Done',()=>location.href='index.html',{alt:()=>location.href='track.html?t='+kindOf(L),altLabel:T.name})}

/* ---------- spaced review: "Quick replay" (hear the real moment, say it, auto-graded) ---------- */
function addToDeck(L,fo){const t=today();(fo||L.lines.map((_,i)=>i)).forEach(i=>{const k='l'+L.id+':'+i;if(!S.srs[k])S.srs[k]={due:addDays(t,1),ivl:0,reps:0,lapses:0}});save()}
function dueItems(){const t=today();return Object.entries(S.srs).filter(([k,v])=>v.due<=t).sort((a,b)=>a[1].due<b[1].due?-1:1).map(([k])=>k)}
function grade(k,g){const it=S.srs[k],t=today();if(!it)return;
  if(g==='again'){it.ivl=1;it.lapses++;it.reps=0}else if(g==='good'){it.ivl=it.ivl<1?2:Math.max(it.ivl+1,Math.round(it.ivl*2.5));it.reps++}
  else{it.ivl=it.ivl<1?4:Math.max(it.ivl+2,Math.round(it.ivl*3.5));it.reps++}it.due=addDays(t,it.ivl);S.xp+=g==='again'?1:2;save()}
const parseKey=k=>{const c=k.lastIndexOf(':');return{id:+k.slice(1,c),i:+k.slice(c+1)}};
const REVIEW_MAX=5;
async function reviewPage(){const A=shell('review');
  const keys=dueItems();const ids=[...new Set(keys.map(k=>parseKey(k).id))];await Promise.all(ids.map(loadLesson));
  const items=keys.filter(k=>{const{id,i}=parseKey(k);return LESSONS[id]&&LESSONS[id].lines[i]}).slice(0,REVIEW_MAX);
  if(!items.length){A.player.hidden=true;const F=Flow(A,[{render:c=>{c.el.append(h('div',{class:'done'},h('div',{class:'ring'},h('span',{},'✓')),h('h1',{},'Nothing to replay'),h('p',{class:'sub center'},'Lines come back here a day after you finish a session, then less and less often.')));c.pri('Home',()=>location.href='index.html')}}],{});F.go(0,1);return}
  const first=LESSONS[parseKey(items[0]).id];const P=Player(A.pv,first.video);IVX._player=P;
  const res={},graded={};const screens=items.map((k,n)=>({count:`${n+1}/${items.length}`,render:c=>{const{id,i}=parseKey(k),L=LESSONS[id],ln=L.lines[i];const g=()=>seg(L,i);
    c.el.append(kick(TRACKS[kindOf(L)].icon+' '+lname(L)+' · Quick replay'),h('h2',{},'What did they say? Say it back.'),
      chips(chip('Replay',()=>{const s=g();P.seg(L.video,s.start,s.end)},'play'),chip('Slow',()=>{const s=g();P.seg(L.video,s.start,s.end,{rate:.75})},'slow')));
    const card=h('div',{hidden:true},lineCard(L,i,{lean:true}));
    const sp=Speak(c,A,{P,targets:[ln.he],label:'Tap and say it',video:L.video,seg:g,onResult:d=>{card.hidden=false;res[k]=Math.max(res[k]||0,d.score)},
      skip:()=>{card.hidden=false;c.show(card);res[k]=res[k]||0;c.pri('Next',done)},onDone:()=>done()});
    function done(){const sc=res[k]||0;if(!graded[k]){graded[k]=1;grade(k,sc>=85?'easy':sc>=60?'good':'again')}c.next()}
    c.el.append(sp,card);if(c.dir>0){const s=g();P.seg(L.video,s.start,s.end)}}}));
  screens.push({count:'',noBack:true,render:c=>{P.stop();A.player.hidden=true;markActive();const got=items.filter(k=>(res[k]||0)>=60).length;
    c.el.append(h('div',{class:'done'},h('div',{class:'ring'},h('span',{},'✓')),h('h1',{},'Replay done'),h('p',{class:'sub center'},`${got} of ${items.length} came out right. Misses come back tomorrow.`)));
    c.pri('Home',()=>location.href='index.html')}});
  const F=Flow(A,screens,{P});IVX._flow=F;F.go(0,1)}

/* ---------- rewatch week: every scene of the week, no help, one tap to rate ---------- */
async function rewatchPage(){const A=shell('fauda');const week=+(new URLSearchParams(location.search).get('week')||1);
  const E=entries().find(e=>e.type==='rewatch'&&e.week===week);
  if(!E){A.player.hidden=true;Flow(A,[{render:c=>{c.el.append(h('h1',{},'Rewatch week not found'));c.pri('Home',()=>location.href='index.html')}}],{}).go(0,1);return}
  const Ls=(await Promise.all(E.lessons.map(loadLesson))).filter(Boolean);const key='rw'+week;S.comp[key]=S.comp[key]||{};
  const P=Player(A.pv,Ls[0].video);IVX._player=P;
  const RATE=[[90,'Most of it'],[60,'Some'],[25,'Not much']];
  const screens=[{render:c=>{c.el.append(h('div',{class:'pill'},'🎬 Fauda · Rewatch week '+week),h('h1',{},'No subtitles in your head'),
      h('p',{class:'blurb'},`${Ls.length} scenes you already studied, straight through. After each one, one tap: how much did you get by ear?`),
      h('div',{class:'recap'},Ls.map(L=>h('div',{class:'rl'},h('div',{},L.title),h('div',{class:'en'},'Lesson '+L.id+' · '+L.duration+(S.comp[key][L.id]!=null?' · '+S.comp[key][L.id]+'%':''))))));
    c.pri('Start',()=>c.next())}}];
  Ls.forEach((L,n)=>screens.push({count:`${n+1}/${Ls.length}`,render:c=>{
    c.el.append(kick('Scene '+(n+1)+' of '+Ls.length+' · Lesson '+L.id),h('h2',{},L.title),h('div',{class:'src'},heb(L.heTitle),h('span',{},' · '+L.duration)));
    const listen=L.lines[focusOf(L)[0]];if(listen)c.el.append(h('div',{class:'hintline'},h('span',{},'Listen for: '),heb(listen.he)));
    const rates=h('div',{class:'rates'},RATE.map(([v,lab])=>h('button',{class:'opt'+(S.comp[key][L.id]===v?' ok':''),type:'button',onclick:()=>{vibe();S.comp[key][L.id]=v;save();c.next()}},lab)));
    c.el.append(h('h3',{class:'q3'},'How much did you get by ear?'),rates);
    c.pri('Watch the scene',()=>{P.full(L.video);c.pri('Rate it above ↑',null,{disabled:true,alt:()=>c.next(),altLabel:'Skip'})},{icon:'play',alt:()=>c.next(),altLabel:'Skip'})}}));
  screens.push({noBack:true,render:c=>{P.stop();A.player.hidden=true;const rated=Ls.filter(L=>S.comp[key][L.id]!=null);
    if(rated.length===Ls.length){S.done[key]=1;save();award(key,30)}markActive();
    c.el.append(h('div',{class:'done'},h('div',{class:'ring'},h('span',{},'✓')),h('h1',{},'Week '+week+' by ear')),
      h('div',{class:'recap'},Ls.map(L=>h('div',{class:'rl row'},h('div',{},L.title),h('b',{},S.comp[key][L.id]!=null?S.comp[key][L.id]+'%':'—')))));
    c.pri('Home',()=>location.href='index.html')}});
  const F=Flow(A,screens,{P});IVX._flow=F;F.go(0,1)}

/* ---------- home ---------- */
function greet(){const hr=hourNY();return hr<5?'לילה טוב':hr<12?'בוקר טוב':hr<17?'צהריים טובים':hr<22?'ערב טוב':'לילה טוב'}
function entryThumb(e){if(e.video)return e.video;if(e.type==='rewatch'){const f=entries().find(x=>x.id===(e.lessons||[])[0]&&x.type==='lesson');return f&&f.video}return null}
function entryLabel(e){const T=TRACKS[e.track];if(e.type==='rewatch')return 'Rewatch week '+e.week;return T.unit+' '+(e.track==='song'?e.id-SONG0:e.track==='speech'?e.id-SPEECH0:e.id)}
function home(){headTags();document.body.className='home';
  const E=entries(),pick=todayPick(),main=h('main',{class:'hm'});document.body.appendChild(main);
  const st=streakNow();
  main.appendChild(h('header',{class:'htop'},h('div',{},h('div',{class:'brand'},'Ivrit'),h('div',{class:'greet',dir:'rtl',lang:'he'},greet())),
    h('div',{class:'streak'+(st?' on':'')},h('span',{},'🔥'),h('b',{},String(st)))));
  /* Today */
  if(pick&&pick.e){const e=pick.e,T=TRACKS[e.track],k=entryKey(e),done=!!S.done[k];
    main.appendChild(h('a',{class:'today t-'+e.track,href:e.href},
      h('div',{class:'timg',style:{backgroundImage:`url(${thumb(entryThumb(e),'hqdefault')})`}}),
      h('div',{class:'tshade'}),
      h('div',{class:'tbody'},h('div',{class:'tpill'},h('span',{},pick.label),h('span',{},T.icon+' '+T.name)),
        h('div',{class:'ttitle'},e.title),e.clip?h('div',{class:'tclip',dir:'rtl',lang:'he'},e.clip):null,
        h('div',{class:'tgo'},h('span',{class:'tbtn'},h('span',{class:'ic',html:ICON.play}),done?'Do it again':(S.pos[k]?'Continue':'Start')),h('span',{class:'tmeta'},e.type==='rewatch'?'6 scenes':'~2 min')))));}
  /* week strip */
  const t=today(),wk=h('div',{class:'week'});for(let i=6;i>=0;i--){const d=addDays(t,-i);const dt=new Date(d+'T12:00:00Z');
    wk.appendChild(h('div',{class:'wd'+(S.days[d]?' on':'')+(i===0?' now':'')},h('span',{},dt.toLocaleDateString('en-US',{weekday:'narrow',timeZone:'UTC'})),h('i',{})))}
  main.appendChild(h('div',{class:'weekrow'},wk,h('div',{class:'xp'},h('b',{},String(S.xp)),' XP')));
  /* review */
  const due=dueItems().length;
  if(due)main.appendChild(h('a',{class:'replay',href:'review.html'},h('div',{class:'ric'},'↻'),h('div',{class:'rbody'},h('b',{},'Quick replay'),h('span',{},Math.min(due,REVIEW_MAX)+' lines from earlier · 1 min')),h('span',{class:'chev',html:ICON.chev})));
  /* tracks */
  main.appendChild(h('div',{class:'sect'},'Tracks'));
  ['fauda','speech','song'].forEach(tk=>{const T=TRACKS[tk],list=E.filter(e=>e.track===tk&&e.type!=='rewatch'&&isOpen(e)),dn=list.filter(e=>S.done[entryKey(e)]).length;
    const latest=list.slice().sort((a,b)=>(b.day||0)-(a.day||0)||b.id-a.id)[0];
    main.appendChild(h('a',{class:'trk t-'+tk,href:'track.html?t='+tk},h('div',{class:'tic'},T.icon),
      h('div',{class:'tbd'},h('b',{},T.name),h('span',{},T.tag),h('div',{class:'bar'},h('i',{style:{width:(list.length?dn/list.length*100:0)+'%'}}))),
      h('div',{class:'tct'},h('b',{},dn+'/'+list.length),h('span',{class:'chev',html:ICON.chev}))))});
  main.appendChild(legalFoot())}

/* ---------- track page ---------- */
function trackPage(){headTags();const tk=new URLSearchParams(location.search).get('t')||'fauda',T=TRACKS[tk]||TRACKS.fauda;document.body.className='home t-'+T.key;
  const E=entries().filter(e=>e.track===T.key&&isOpen(e)).sort((a,b)=>(b.day||0)-(a.day||0)||(b.id||0)-(a.id||0));
  const main=h('main',{class:'hm'});document.body.appendChild(main);
  main.append(h('header',{class:'ttop'},h('a',{class:'x',href:'index.html','aria-label':'Home',html:ICON.back}),h('div',{class:'brand sm'},T.icon+' '+T.name)),
    h('div',{class:'thero'},h('h1',{},T.tag),h('p',{},T.long)));
  const list=h('div',{class:'list'});
  E.forEach(e=>{const k=entryKey(e),done=!!S.done[k],vid=entryThumb(e);
    list.appendChild(h('a',{class:'row'+(done?' dn':''),href:e.href},h('div',{class:'rth',style:vid?{backgroundImage:`url(${thumb(vid)})`}:null},done?h('span',{class:'ck'},'✓'):null),
      h('div',{class:'rbd'},h('div',{class:'rmeta'},entryLabel(e)+(e.mins?' · '+e.mins:'')),h('div',{class:'rtit'},e.title),
        e.type==='rewatch'?h('div',{class:'rsub'},'Lessons '+e.lessons[0]+'–'+e.lessons[e.lessons.length-1]+', no help'):e.clip?h('div',{class:'rsub he',dir:'rtl',lang:'he'},e.clip):null),
      h('span',{class:'chev',html:ICON.chev})))});
  if(!E.length)list.appendChild(h('p',{class:'sub'},'Coming soon.'));
  main.append(list,legalFoot())}

window.IVX={register,lessonPage,home,trackPage,reviewPage,rewatchPage,wordDiff,bestMatch,normW,
  _state:()=>S,_LESSONS:LESSONS,_today:today,_dayIndex:dayIndex,_focus:focusOf,_quiz:quizOf,_entries:entries,_todayPick:todayPick,_pageOf:pageOf,_kind:kindOf};
})();
