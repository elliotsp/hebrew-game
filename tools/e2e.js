const {chromium}=require('playwright-core');const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=require('path').resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const srv=http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);
 if(!fs.existsSync(f)){s.statusCode=404;return s.end('nf')}s.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');s.end(fs.readFileSync(f))}).listen(0,'127.0.0.1');
const res=[];const log=(...a)=>{console.log(...a)};
(async()=>{await new Promise(r=>srv.listening?r():srv.on('listening',r));const base='http://localhost:'+srv.address().port+'/';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const ctx=await b.newContext({permissions:['microphone'],viewport:{width:390,height:844}});
const errs=[];ctx.on('page',p=>{});
const newPage=async(u)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(u+' PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(u+' CONSOLE '+m.text())});await p.goto(base+u);return p};
// home
let p=await newPage('index.html');await p.waitForTimeout(1500);log('HOME cards:',await p.$$eval('.card',e=>e.length),'| today:',await p.$eval('.card.hl .lt',e=>e.textContent).catch(()=>null));
await p.screenshot({path:'/tmp/ytt/home.png',fullPage:true});await p.close();
for(const n of [1,2,3,4,5]){p=await newPage('lesson-'+n+'.html');
 await p.waitForFunction(()=>IVX._player&&IVX._player.ready,null,{timeout:25000}).catch(()=>log('L'+n,'player not ready'));
 const steps=[];for(let i=0;i<7;i++){await p.evaluate(i=>IVX._go(i),i);await p.waitForTimeout(250);steps.push(await p.evaluate(()=>{const v=document.querySelector('section');return v.querySelectorAll('.card').length+'c/'+v.querySelectorAll('button').length+'b'}))}
 log('L'+n,'steps',steps.join(' '));
 if(n===5){
  // segment loop + rate test on step 2
  await p.evaluate(()=>IVX._go(1));
  const r=await p.evaluate(()=>new Promise(res=>{const P=IVX._player,L=IVX._LESSONS[5],ln=L.lines[4];const t0=Date.now();let maxT=0;const iv=setInterval(()=>{maxT=Math.max(maxT,P.time()||0)},50);
    P.seg(L.video,ln.start,ln.end,{rate:.75,loops:2,onEnd:()=>{clearInterval(iv);res({start:ln.start,end:ln.end,rate:P.rate(),stoppedAt:P.time(),maxT,ms:Date.now()-t0,state:P.yt.getPlayerState()})}})}));
  log('SEG loop x2 @0.75:',JSON.stringify(r),'expected ms ≈',Math.round(2*(r.end-r.start)/.75*1000));
  // 1x->0.75 button
  await p.click('section .card button.btn.pri');await p.waitForTimeout(1500);log('after 1x button rate',await p.evaluate(()=>IVX._player.rate()));await p.waitForTimeout(9000);log('after chain rate',await p.evaluate(()=>IVX._player.rate()));
  // nudge
  await p.evaluate(()=>{document.querySelector('.nudge .btn').click()});log('nudge window',await p.$eval('.nudge span',e=>e.textContent));
  // dictation
  await p.evaluate(()=>IVX._go(2));await p.fill('section textarea >> nth=0','מה קורא בנאדם');await p.click('section .card button.pri >> nth=0');
  log('DICT diff:',await p.$eval('section .diff',e=>e.innerHTML.replace(/<span class="w-(\w+)"[^>]*>([^<]*)<\/span>/g,'[$1:$2]')));
  // record shadow
  await p.evaluate(()=>IVX._go(3));const rb=p.locator('section .btn.rec').first();await rb.click();await p.waitForTimeout(1600);await rb.click();await p.waitForTimeout(800);
  log('REC audio src:',await p.$eval('section audio',a=>a.src.slice(0,30)),'mine enabled:',await p.$eval('section .card button:has-text("Mine")',b=>!b.disabled));
  log('REC blob size:',await p.evaluate(async()=>{const a=document.querySelector('section audio');const r=await fetch(a.src);return (await r.blob()).size}));
  await p.click('section .card button:has-text("Compare") >> nth=0');await p.waitForTimeout(6500);log('compare: audio played?',await p.evaluate(()=>{const a=document.querySelector('section audio');return {t:a.currentTime,paused:a.paused,ended:a.ended}}));
  // SR fallback
  await p.click('section button:has-text("Bonus") >> nth=0');await p.waitForTimeout(6000);log('SR msg:',(await p.$eval('section .card',c=>c.innerText)).split('\n').slice(-3).join(' | '));
  // say it
  await p.evaluate(()=>IVX._go(4));await p.click('section button:has-text("Skip recording") >> nth=0');log('SAY revealed:',await p.$eval('section .card .heb',e=>e.textContent));
  // rewatch save, finish
  await p.evaluate(()=>IVX._go(5));await p.click('section button:has-text("Save")');
  await p.evaluate(()=>IVX._go(6));await p.waitForTimeout(800);await p.click('section button:has-text("Finish lesson")');await p.waitForTimeout(300);
  log('STATE',JSON.stringify(await p.evaluate(()=>{const s=IVX._state();return{xp:s.xp,streak:s.streak,done:s.done,srs:Object.keys(s.srs).length,comp:s.comp}})));
  await p.screenshot({path:'/tmp/ytt/l5.png'});
 }
 await p.close()}
// review: make items due
p=await newPage('review.html');await p.evaluate(()=>{const s=JSON.parse(localStorage.ivx1);for(const k in s.srs)s.srs[k].due='2026-01-01';localStorage.ivx1=JSON.stringify(s)});await p.reload();await p.waitForTimeout(4000);
log('REVIEW first card:',(await p.$eval('.card.hl',e=>e.innerText)).replace(/\n/g,' | ').slice(0,160));
await p.click('.card.hl button:has-text("Play line"), .card.hl h2');await p.click('button:has-text("Reveal")');await p.click('button:has-text("Got it")');await p.waitForTimeout(300);
log('REVIEW next:',(await p.$eval('.card.hl',e=>e.innerText)).replace(/\n/g,' | ').slice(0,120));
log('graded',JSON.stringify(await p.evaluate(()=>Object.entries(IVX._state().srs).filter(([k,v])=>v.reps||v.lapses))));
await p.close();
p=await newPage('rewatch.html?week=1');await p.waitForTimeout(3000);log('REWATCH cards:',await p.$$eval('.card',e=>e.length));await p.close();
// grading unit test
p=await newPage('index.html');log('diff tests',JSON.stringify(await p.evaluate(()=>[IVX.wordDiff('הכול בסדר','הכל בסדר').score,IVX.wordDiff('מה קורה, בן אדם?','מה קורה בן אדם').score,IVX.wordDiff('שמעתי עליך כבר','שָׁמַעְתִּי עליכ').score,IVX.wordDiff('תוריד את האקדח','').score])));
await p.close();
log('ERRORS:',errs.length?errs.join('\n'):'none');await b.close();srv.close()})().catch(e=>{console.error('FAIL',e);process.exit(1)});
