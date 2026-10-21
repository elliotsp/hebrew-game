/* Headless iPhone-viewport test. Usage: node tools/e2e.js [lessonId]   (run from /tmp/ytt with NODE_PATH=/tmp/ytt/node_modules)
   Smoke-tests every lesson/speech page, taps through one lesson end-to-end like a user, then the review and rewatch pages.
   Screenshots → $OUT (default /tmp/ytt/e2e). Prints "ERRORS: none" when clean. */
const {chromium,devices}=require('playwright-core');const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');const OUT=process.env.OUT||'/tmp/ytt/e2e';fs.mkdirSync(OUT,{recursive:true});
const ids=fs.readdirSync(path.join(ROOT,'data')).map(f=>(f.match(/^lesson-(\d+)\.js$/)||[])[1]).filter(Boolean).map(Number).sort((a,b)=>a-b);
const sp=fs.readdirSync(path.join(ROOT,'data')).map(f=>(f.match(/^speech-(\d+)\.js$/)||[])[1]).filter(Boolean).map(n=>100+ +n);
const LID=+(process.argv[2]||ids[ids.length-1]);
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const srv=http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);
 if(!fs.existsSync(f)){s.statusCode=404;return s.end('nf')}s.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');s.end(fs.readFileSync(f))}).listen(0,'127.0.0.1');
const page=id=>id>100?'speech-'+(id-100)+'.html':'lesson-'+id+'.html';
(async()=>{await new Promise(r=>srv.listening?r():srv.on('listening',r));const base='http://localhost:'+srv.address().port+'/';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:844},permissions:['microphone']});ctx.setDefaultTimeout(8000);
const errs=[];const np=async u=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(u+' PAGEERROR '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/youtube|doubleclick|googlevideo|ytimg|Failed to load resource|ERR_|CORS|Permissions policy/i.test(m.text()))errs.push(u+' CONSOLE '+m.text())});await p.goto(base+u);await p.waitForTimeout(1200);return p};
const shot=async(p,n)=>{await p.waitForTimeout(400);await p.screenshot({path:OUT+'/'+n+'.png'})};
const pri=p=>p.locator('.actions .ab.pri');const priTxt=async p=>((await pri(p).textContent())||'').trim();
const tap=async(p,sel)=>{await p.locator(sel).first().tap();await p.waitForTimeout(300)};
const log=(...a)=>console.log(...a);
/* layout checks: player ≥200px tall and not overlapped, stage between player and action bar, tap targets ≥40px */
const layout=p=>p.evaluate(()=>{const r=s=>{const e=document.querySelector(s);return e?e.getBoundingClientRect():null};const pl=r('.player .box'),st=r('.stage'),ac=r('.actions');
  const small=[...document.querySelectorAll('.actions button:not([hidden]), .stage button, .stage a')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&b.height&&b.height<40&&!e.classList.contains('link')}).map(e=>e.textContent.trim().slice(0,20));
  return{player:pl&&Math.round(pl.height),stageTop:st&&Math.round(st.top),playerBottom:pl&&Math.round(pl.bottom),actionsTop:ac&&Math.round(ac.top),vh:innerHeight,small}});
// home
let p=await np('index.html');await shot(p,'home');log('HOME today:',await p.$eval('.hero .ht',e=>e.textContent).catch(()=>'none'),'| rows:',await p.$$eval('.lrow',e=>e.length),'| speeches:',await p.$$eval('a.lrow[href^="speech-"]',e=>e.length));await p.close();
// smoke: every lesson + speech
for(const id of [...ids,...sp]){p=await np(page(id));
  const ok=await p.waitForFunction(()=>IVX._player&&IVX._player.ready,null,{timeout:25000}).then(()=>true).catch(()=>false);
  const n=await p.evaluate(()=>IVX._flow.screens.length);const bad=[];
  for(let s=0;s<7;s++){await p.evaluate(s=>IVX._go(s),s);await p.waitForTimeout(150);const r=await p.evaluate(()=>({t:document.querySelector('.actions .ab.pri').textContent,h:document.querySelector('.stage').innerText.length}));if(!r.t||r.h<20)bad.push(s)}
  log((id>100?'S':'L')+id,'player',ok?'ready':'NOT READY','| screens',n,'| empty sections',bad.length?bad:'none','| layout',JSON.stringify(await layout(p)));
  if(id===ids[0]){const r=await p.evaluate(()=>new Promise(res=>{const P=IVX._player,L=IVX._LESSONS[Object.keys(IVX._LESSONS)[0]],ln=L.lines[1];const t0=Date.now();
    P.seg(L.video,ln.start,ln.end,{rate:.75,loops:2,onEnd:()=>res({end:ln.end,stoppedAt:P.time(),ms:Date.now()-t0,rate:P.rate()})})}));log('  SEG x2 @0.75',JSON.stringify(r))}
  await p.close()}
// full walkthrough of lesson LID
p=await np(page(LID));await p.evaluate(()=>{const s=JSON.parse(localStorage.ivx1||'{}');if(s.pos)s.pos={};if(s.done)s.done={};localStorage.ivx1=JSON.stringify(s)});await p.reload();
await p.waitForFunction(()=>IVX._player&&IVX._player.ready,null,{timeout:25000}).catch(()=>log('player not ready'));
let n=0,audio=null;const steps=[];const S=x=>String(x).padStart(2,'0');
for(let guard=0;guard<60;guard++){const label=await p.$eval('.plabel',e=>e.textContent);let t=await priTxt(p);steps.push(label+' | '+t);
 await shot(p,`lesson-${S(++n)}`);
 if(/Finish lesson|Finish again/.test(t)){await pri(p).tap();await shot(p,`lesson-${S(++n)}-done`);steps.push('DONE → '+await priTxt(p));break}
 if(/Play the scene/.test(t)){await pri(p).tap();await p.waitForTimeout(1200);t=await priTxt(p)}
 if(/Pick an answer/.test(t)){await tap(p,'.opt');await shot(p,`lesson-${S(n)}b-answered`);t=await priTxt(p)}
 if(/Listen/.test(t)){await pri(p).tap();await p.waitForTimeout(1000);await pri(p).tap();t=await priTxt(p);if(/Show the line/.test(t)){await pri(p).tap();await shot(p,`lesson-${S(n)}b-revealed`)}t=await priTxt(p)}
 if(/^Check/.test(t)&&await p.$('textarea')){const he=await p.evaluate(()=>{const F=IVX._flow;return null});await p.fill('textarea','לך הביתה');await pri(p).tap();await shot(p,`lesson-${S(n)}b-checked`);t=await priTxt(p)}
 if(/Hear the/.test(t)){await pri(p).tap();await p.waitForTimeout(300);t=await priTxt(p)}
 if(/Record yourself/.test(t)){await pri(p).tap();await p.waitForTimeout(1200);await shot(p,`lesson-${S(n)}b-recording`);await pri(p).tap();await p.waitForTimeout(600);if(audio==null)audio=await p.evaluate(async()=>{const a=[...document.querySelectorAll('.stage audio')].find(a=>a.src);return a?(await (await fetch(a.src)).blob()).size:null});t=await priTxt(p)}
 if(/Compare/.test(t)){await pri(p).tap();await p.waitForTimeout(700);t=await priTxt(p);if(/then you/.test(t)){await pri(p).tap();t=await priTxt(p)}}
 if(/Record your answer/.test(t)){await pri(p).tap();await p.waitForTimeout(1000);await pri(p).tap();await p.waitForTimeout(500);await shot(p,`lesson-${S(n)}b-answer`);t=await priTxt(p)}
 if(/Pick how much/.test(t)){await tap(p,'.rate >> nth=3');t=await priTxt(p)}
 if(/I watched|^Next|^Finish$|I said it/.test(t)){await pri(p).tap();await p.waitForTimeout(350);continue}
 steps.push('  ?? stuck on: '+t);await p.locator('.actions .ab.skip').tap().catch(()=>{});await p.waitForTimeout(300)}
log('WALK L'+LID+':\n  '+steps.join('\n  '));
log('STATE',JSON.stringify(await p.evaluate(()=>{const s=IVX._state();return{xp:s.xp,streak:s.streak,done:s.done,srs:Object.keys(s.srs).length,comp:s.comp}})));
await p.close();
p=await np('index.html');await shot(p,'home-after');await p.close();
// review (Scene recall): make everything due, give one item a rep so a "Use it" prompt shows
p=await np('review.html');await p.evaluate(()=>{const s=JSON.parse(localStorage.ivx1);const ks=Object.keys(s.srs);ks.forEach(k=>s.srs[k].due='2026-01-01');if(ks[1])s.srs[ks[1]].reps=1;localStorage.ivx1=JSON.stringify(s)});await p.reload();await p.waitForTimeout(2500);
await shot(p,'review-01');const rl=[];let graded=0;
for(let g=0;g<30;g++){const gr=await p.$('.grades:not([hidden])');
 if(gr){const miss=graded++===0;rl.push('  grade '+(miss?'Missed (should come back at the end)':'Got it'));await shot(p,'review-'+S(g+2)+'-checked');await tap(p,miss?'.grades .g-miss':'.grades .g-ok');continue}
 const t=await priTxt(p);rl.push((await p.$eval('.plabel',e=>e.textContent))+' | '+t);
 if(/^Done/.test(t)){await shot(p,'review-results');break}
 if(/Play the moment/.test(t)){await pri(p).tap();await shot(p,'review-'+S(g+2)+'-catch');continue}
 if(/^Start|^Check/.test(t)){if(/Check/.test(t))await shot(p,'review-'+S(g+2)+'-prompt');await pri(p).tap();await p.waitForTimeout(300);continue}
 rl.push('stuck');break}
log('REVIEW:\n  '+rl.join('\n  '));
log('graded',await p.evaluate(()=>Object.values(IVX._state().srs).filter(v=>v.reps||v.lapses).length));await p.close();
p=await np('rewatch.html?week=1');await shot(p,'rewatch-01');await pri(p).tap();await p.waitForTimeout(300);await shot(p,'rewatch-02');await pri(p).tap();await p.waitForTimeout(400);await tap(p,'.rate >> nth=2');await shot(p,'rewatch-03');
log('REWATCH after rating:',await priTxt(p),'| screens',await p.evaluate(()=>IVX._flow.screens.length));await p.close();
p=await np('index.html');log('diff tests',JSON.stringify(await p.evaluate(()=>[IVX.wordDiff('הכול בסדר','הכל בסדר').score,IVX.wordDiff('מה קורה, בן אדם?','מה קורה בנאדם').score,IVX.wordDiff('לֵךְ הביתה ותָנוּחַ','לך הביתה ותנוח').score,IVX.wordDiff('תוריד את האקדח','').score])));await p.close();
log('recording blob bytes:',audio);
log('ERRORS:',errs.length?'\n'+errs.join('\n'):'none');await b.close();srv.close()})().catch(e=>{console.error('FAIL',e);process.exit(1)});
