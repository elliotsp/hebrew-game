/* Headless iPhone test for engine v7. Usage (from /tmp/ytt, NODE_PATH=/tmp/ytt/node_modules): node /workspace/hebrew-game/tools/e2e.js [id ...]
   - smoke: home, the 3 track pages, every lesson/speech/song page (every screen renders, a primary button, no JS errors), review, rewatch weeks, old URLs
   - taps through the given sessions end-to-end (default: the newest Fauda lesson, the newest speech, the newest song) with a fake he-IL recognizer
   - runs one session with speech recognition removed (record-and-compare fallback, fake mic)
   Screenshots → $OUT (default /tmp/ytt/e2e). Prints "ERRORS: none" when clean. */
const {chromium,devices}=require('playwright-core');const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');const OUT=process.env.OUT||'/tmp/ytt/e2e';fs.mkdirSync(OUT,{recursive:true});
const D=path.join(ROOT,'data'),num=re=>fs.readdirSync(D).map(f=>(f.match(re)||[])[1]).filter(Boolean).map(Number).sort((a,b)=>a-b);
const lessons=num(/^lesson-(\d+)\.js$/),speeches=num(/^speech-(\d+)\.js$/).map(n=>100+n),songs=num(/^song-(\d+)\.js$/).map(n=>200+n);
const page=id=>id>200?'song-'+(id-200)+'.html':id>100?'speech-'+(id-100)+'.html':'lesson-'+id+'.html';
const RUN=process.argv.slice(2).map(Number);if(!RUN.length)RUN.push(lessons[lessons.length-1],speeches[speeches.length-1],songs[0]);
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'};
const srv=http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);
  if(!fs.existsSync(f)){s.statusCode=404;return s.end('nf')}s.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');s.end(fs.readFileSync(f))}).listen(0,'127.0.0.1');
/* fake recognizer: "hears" window.__srText, or the line on screen minus its last word (so the diff shows one miss) */
const FAKE_SR=`(()=>{class FakeSR{constructor(){this.lang='';}start(){setTimeout(()=>{let t=window.__srText;if(t==null){const b=document.querySelector('.scr .lcard .big');t=b?b.textContent.split(/\\s+/).slice(0,-1).join(' '):'שלום'}
  const res=[{transcript:t,confidence:.9}];res.isFinal=true;this.onresult&&this.onresult({resultIndex:0,results:[res]});setTimeout(()=>this.onend&&this.onend(),150)},700)}stop(){}abort(){}}
  window.webkitSpeechRecognition=FakeSR;window.SpeechRecognition=FakeSR})();`;
(async()=>{await new Promise(r=>srv.listening?r():srv.on('listening',r));const base='http://localhost:'+srv.address().port+'/';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const mk=async(sr)=>{const c=await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:844},permissions:['microphone']});c.setDefaultTimeout(9000);
  if(process.env.NOW)await c.addInitScript(`(()=>{const R=Date,off=new R(${JSON.stringify(process.env.NOW)}).getTime()-R.now();class F extends R{constructor(...a){super(...(a.length?a:[R.now()+off]))}static now(){return R.now()+off}}window.Date=F})();`);
  await c.addInitScript(sr?FAKE_SR:'delete window.webkitSpeechRecognition;delete window.SpeechRecognition;');return c};
let ctx=await mk(true);
const errs=[];const log=(...a)=>console.log(...a);
const np=async(u,c)=>{const p=await (c||ctx).newPage();p.on('pageerror',e=>errs.push(u+' PAGEERROR '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/youtube|doubleclick|googlevideo|ytimg|Failed to load resource|ERR_|CORS|Permissions policy|fonts/i.test(m.text()))errs.push(u+' CONSOLE '+m.text())});
  await p.goto(base+u);await p.waitForTimeout(900);return p};
const shot=async(p,n,ms)=>{await p.waitForTimeout(ms||500);await p.screenshot({path:OUT+'/'+n+'.png'})};
const pri=p=>p.locator('.actions .ab.pri');const priTxt=async p=>((await pri(p).textContent())||'').trim();
const layout=p=>p.evaluate(()=>{const r=s=>{const e=document.querySelector(s);return e?e.getBoundingClientRect():null};const pl=r('.player .box'),st=r('.stage'),ac=r('.actions');
  const small=[...document.querySelectorAll('.actions button:not([hidden]), .stage button, .stage a')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&b.height&&b.height<40}).map(e=>e.textContent.trim().slice(0,20));
  const hidden=document.querySelector('.player')&&document.querySelector('.player').offsetParent===null;
  return{player:pl&&!hidden?Math.round(pl.height):null,overlap:pl&&st&&!hidden?pl.bottom>st.top+1:false,stageBottom:st&&Math.round(st.bottom),actionsTop:ac&&Math.round(ac.top),small}});
const chk=async(p,tag)=>{const l=await layout(p);if(l.player!=null&&l.player<200)errs.push(tag+' player '+l.player+'px');if(l.overlap)errs.push(tag+' stage overlaps player');
  if(l.stageBottom>l.actionsTop+1)errs.push(tag+' stage under action bar');if(l.small.length)errs.push(tag+' small targets: '+l.small.join(', '))};

/* home + tracks */
let p=await np('index.html');await shot(p,'01-home',1500);
log('HOME today:',await p.$eval('.today .ttitle',e=>e.textContent).catch(()=>'none'),'| label:',await p.$eval('.tpill span',e=>e.textContent).catch(()=>''),'| tracks:',await p.$$eval('.trk',e=>e.map(x=>x.querySelector('b').textContent+' '+x.querySelector('.tct b').textContent).join(', ')));
await chk(p,'home');await p.close();
for(const t of ['fauda','speech','song']){p=await np('track.html?t='+t);log('TRACK',t,await p.$$eval('.row',e=>e.length),'rows');await chk(p,'track '+t);await shot(p,'02-track-'+t,1200);await p.close()}

/* smoke every session page: render every screen */
for(const id of [...lessons,...speeches,...songs]){p=await np(page(id));
  const n=await p.evaluate(()=>IVX._flow.screens.length);const bad=[];
  for(let i=0;i<n;i++){await p.evaluate(i=>IVX._flow.go(i,0),i);await p.waitForTimeout(60);const t=await priTxt(p);const h=await p.$eval('.scr',e=>e.innerText.length).catch(()=>0);if(!t||h<10)bad.push(i)}
  if(bad.length)errs.push(page(id)+' empty screens '+bad.join(','));
  await p.evaluate(()=>{localStorage.removeItem('ivx1')});await p.close()}
log('SMOKE',lessons.length+speeches.length+songs.length,'session pages');

/* tap through a session like a user */
async function run(id,tag,c){const u=page(id);const p=await np(u,c);
  const ready=await p.waitForFunction(()=>IVX._player&&IVX._player.ready,null,{timeout:25000}).then(()=>true).catch(()=>false);if(!ready)log('  (player not ready in 25 s on',u+')');
  await p.waitForTimeout(800);await chk(p,u+' intro');await shot(p,tag+'-1-intro');
  const n=await p.evaluate(()=>IVX._flow.screens.length);let guard=0,saidShot=false,quizShot=false;
  await pri(p).tap();
  while(guard++<40){await p.waitForTimeout(500);const cur=await p.evaluate(()=>IVX._flow.cur);const kind=await p.evaluate(()=>{const s=document.querySelector('.scr');return s.querySelector('.opts')?'hear':s.querySelector('.sit')?'real':s.querySelector('.speak')?'say':s.querySelector('.done')?'done':'other'});
    if(kind==='hear'){await p.waitForTimeout(2500);if(!quizShot)await shot(p,tag+'-2-quiz',100);await p.locator('.scr .opt').first().tap();await p.waitForTimeout(400);if(!quizShot){await chk(p,u+' quiz');await shot(p,tag+'-3-quiz-answered');quizShot=true}await pri(p).tap();continue}
    if(kind==='say'||kind==='real'){await p.evaluate(k=>{window.__srText=k==='real'?document.querySelector('.scr .model .big').textContent:undefined},kind);
      await pri(p).tap();await p.waitForTimeout(c?2200:1600);
      if(c){/* fallback: recording → stop */const t=await priTxt(p);if(/Recording/.test(t)){await pri(p).tap();await p.waitForTimeout(900)}}
      const has=await p.$('.scr .diffbox, .scr .recbox');if(!has)errs.push(u+' '+kind+' screen: no result after speaking ('+(await priTxt(p))+')');
      if(kind==='say'&&!saidShot){await chk(p,u+' say');await shot(p,tag+'-4-say',200);saidShot=true}
      if(kind==='real'){await shot(p,tag+'-5-real',200)}
      /* move on: primary says Next when good, else use the alt button */
      const t=await priTxt(p);if(/^Next/.test(t))await pri(p).tap();else await p.locator('.actions .ab.alt').tap();continue}
    if(kind==='done'){await shot(p,tag+'-6-done',700);await chk(p,u+' done');break}
    await pri(p).tap()}
  const st=await p.evaluate(id=>{const s=JSON.parse(localStorage.getItem('ivx1'));return{done:!!s.done['l'+id],streak:s.streak,deck:Object.keys(s.srs).length}},id);
  log('RUN',u,'screens',n,JSON.stringify(st));if(!st.done)errs.push(u+' not marked done');await p.close()}
for(const id of RUN)await run(id,'s'+id);

/* review: make the deck due today */
p=await np('index.html');await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('ivx1'));const t=IVX._today();Object.values(s.srs).forEach(v=>v.due=t);localStorage.setItem('ivx1',JSON.stringify(s))});
await p.reload();await p.waitForTimeout(1200);await shot(p,'07-home-after',800);await p.close();
p=await np('review.html');await p.waitForFunction(()=>IVX._player&&IVX._player.ready,null,{timeout:20000}).catch(()=>{});await p.waitForTimeout(600);
let rv=0;for(let g=0;g<12;g++){const done=await p.$('.scr .done');if(done)break;await pri(p).tap();await p.waitForTimeout(1500);if(g===0)await shot(p,'08-review',100);const t=await priTxt(p);if(/^Next/.test(t))await pri(p).tap();else if(await p.locator('.actions .ab.alt').isVisible())await p.locator('.actions .ab.alt').tap();rv++;await p.waitForTimeout(400)}
log('REVIEW items',rv,'done:',!!(await p.$('.scr .done')));await p.close();

/* rewatch weeks + old URLs */
for(const w of [1,4,5]){p=await np('rewatch.html?week='+w);await pri(p).tap();await p.waitForTimeout(500);await chk(p,'rewatch '+w);if(w===4)await shot(p,'09-rewatch');
  for(let g=0;g<6;g++){await p.locator('.rates .opt').first().tap();await p.waitForTimeout(250)}log('REWATCH',w,'done:',!!(await p.$('.scr .done')));await p.close()}
for(const u of ['lesson-1.html','speech-1.html','rewatch.html?week=2','review.html','index.html']){p=await np(u);const ok=await p.evaluate(()=>!!document.querySelector('.scr, .hm'));if(!ok)errs.push('old URL '+u+' blank');await p.close()}

/* fallback: no speech recognition → record and compare */
const c2=await mk(false);await run(songs[songs.length-1],'fb'+songs[songs.length-1],c2);
await b.close();srv.close();
console.log('ERRORS:',errs.length?'\n'+errs.join('\n'):'none')})();
