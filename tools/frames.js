const {chromium}=require('playwright-core');const http=require('http');
const id=process.argv[2];const ts=process.argv.slice(3).map(Number);
const html=`<!doctype html><body style="margin:0"><div id=p></div><script src="https://www.youtube.com/iframe_api"></script><script>
function onYouTubeIframeAPIReady(){window.P=new YT.Player('p',{width:854,height:480,videoId:'${id}',playerVars:{autoplay:1,mute:1,controls:0,playsinline:1,cc_load_policy:0},events:{onReady:e=>{e.target.mute();e.target.playVideo();window.RDY=1}}})}</script></body>`;
const srv=http.createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html'});r.end(html)}).listen(0,async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--autoplay-policy=no-user-gesture-required']});
 const pg=await b.newPage({viewport:{width:854,height:480}});
 await pg.goto('http://localhost:'+srv.address().port+'/');
 await pg.waitForFunction(()=>window.RDY,null,{timeout:30000});await pg.waitForTimeout(3000);
 for(const t of ts){await pg.evaluate(t=>{P.seekTo(t,true);P.pauseVideo()},t);await pg.waitForTimeout(2500);await pg.screenshot({path:`f_${id}_${t}.png`});}
 await b.close();srv.close();});
