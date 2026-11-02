import glob,sys
from PIL import Image,ImageDraw
d=sys.argv[1];step=float(sys.argv[2]) if len(sys.argv)>2 else 1.4
fs=sorted(glob.glob(d+'/L_*.png'),key=lambda f:int(f.split('_')[-2]))
pick=[];nxt=0
for f in fs:
    t=float(f.rsplit('_',1)[1][:-4])
    if t>=nxt: pick.append((t,f)); nxt=t+step
per=16;cols=2
for i in range(0,len(pick),per):
    ch=pick[i:i+per];rows=(len(ch)+1)//2;sheet=Image.new('RGB',(1300,110*rows),'gray')
    for j,(t,f) in enumerate(ch):
        x=(j%2)*650;y=(j//2)*110
        sheet.paste(Image.open(f).crop((240,0,1040,125)).resize((640,100)),(x,y+10));ImageDraw.Draw(sheet).text((x+3,y),f"{t:.2f}",fill='yellow')
    sheet.save(f'{d}/s{i//per}.png')
print(d,len(pick))
