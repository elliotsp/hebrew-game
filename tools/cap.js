const {chromium}=require('playwright-core');const http=require('http');const fs=require('fs');
const id=process.argv[2];
const html=`<!doctype html><body><div id=p></div><script src="https://www.youtube.com/iframe_api"></script><script>
function onYouTubeIframeAPIReady(){window.P=new YT.Player('p',{width:640,height:360,videoId:'${id}',playerVars:{autoplay:1,mute:1,cc_load_policy:1,cc_lang_pref:'iw',hl:'iw',playsinline:1},events:{onReady:e=>{e.target.mute();e.target.playVideo();window.RDY=1},onError:e=>{window.ERR=e.data}}})}</script></body>`;
const srv=http.createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html'});r.end(html)}).listen(0,async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--autoplay-policy=no-user-gesture-required']});
 const pg=await b.newPage();let got=[];
 pg.context().on('response',async res=>{const u=res.url();if(u.includes('/api/timedtext')){try{const t=await res.text();got.push({u,t});}catch(e){}}});
 await pg.goto('http://localhost:'+srv.address().port+'/');
 for(let i=0;i<30&&!got.length;i++){await pg.waitForTimeout(1000);}
 const info=await pg.evaluate(()=>({err:window.ERR,rdy:window.RDY,dur:window.P&&P.getDuration&&P.getDuration(),tl:window.P&&P.getOption&&JSON.stringify(P.getOption('captions','tracklist'))}));
 console.log(JSON.stringify(info));
 got.forEach((g,i)=>{fs.writeFileSync(`${id}.${i}.json`,g.t);console.log(g.u.slice(0,300))});
 await b.close();srv.close();});
