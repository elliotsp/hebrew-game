const {chromium}=require('playwright-core');const http=require('http');
const id=process.argv[2];const until=+process.argv[3];
const html=`<!doctype html><body style="margin:0"><div id=p></div><script src="https://www.youtube.com/iframe_api"></script><script>
function onYouTubeIframeAPIReady(){window.P=new YT.Player('p',{width:1280,height:720,videoId:'${id}',playerVars:{autoplay:1,mute:1,controls:0,playsinline:1,cc_load_policy:0},events:{onReady:e=>{e.target.mute();e.target.playVideo();window.RDY=1}}})}</script></body>`;
const srv=http.createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html'});r.end(html)}).listen(0,async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--autoplay-policy=no-user-gesture-required']});
 const pg=await b.newPage({viewport:{width:1280,height:720}});
 await pg.goto('http://localhost:'+srv.address().port+'/');
 await pg.waitForFunction(()=>window.RDY,null,{timeout:30000});
 await pg.waitForFunction(()=>P.getPlayerState()==1,null,{timeout:30000});
 await pg.evaluate(()=>{P.seekTo(0,true);try{P.unloadModule('captions')}catch(e){}});
 let n=0;
 while(true){const t=await pg.evaluate(()=>P.getCurrentTime());if(t>until)break;
  await pg.screenshot({path:`L_${id}_${String(n).padStart(3,'0')}_${t.toFixed(2)}.png`,clip:{x:0,y:540,width:1280,height:180}});n++;await pg.waitForTimeout(400);}
 await b.close();srv.close();});
