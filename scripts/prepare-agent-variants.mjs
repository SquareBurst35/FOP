// Import full-character ImageGen edits into the game's common sprite frame.
// This build utility never reads or changes the catalog item illustrations.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
let canvas;
try { canvas=require('@napi-rs/canvas'); }
catch { canvas=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules','@napi-rs/canvas')); }
const {createCanvas,loadImage}=canvas;
const inputs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const directory=process.argv[3] || 'assets/agent-variants';
fs.mkdirSync(directory,{recursive:true});
const results=[];
for(const [name,settings] of Object.entries(inputs)) {
  const picture=await loadImage(settings.path);
  const crop=settings.crop || [0,0,picture.width,picture.height];
  const width=Math.round(crop[2]),height=Math.round(crop[3]);
  const source=createCanvas(width,height),s=source.getContext('2d');
  s.drawImage(picture,...crop,0,0,width,height);
  const pixels=s.getImageData(0,0,width,height);
  // The generated source either contains alpha or a solid game chroma background.
  for(let i=0;i<pixels.data.length;i+=4) {
    const [r,g,b]=pixels.data.subarray(i,i+3);
    if(g<100&&r>g+25&&b>g+25) pixels.data[i+3]=0;
  }
  s.putImageData(pixels,0,0);
  const normalized=createCanvas(84,120),n=normalized.getContext('2d');
  n.imageSmoothingEnabled=false;
  let foot=height*0.84;
  for(let y=height-1;y>height*.6;y--) {
    let visible=0;
    for(let x=Math.floor(width*.3);x<width*.75;x++)if(pixels.data[(y*width+x)*4+3]>128)visible++;
    if(visible>width*.03){foot=y;break;}
  }
  const vertical=504/(foot-170),horizontal=260/580;
  let transform=[horizontal,vertical,64-190*horizontal,36-170*vertical];
  if(settings.crop) {
    let top=height*.09;
    for(let y=0;y<height*.3;y++) {
      let count=0;
      for(let x=Math.floor(width*.38);x<width*.72;x++)if(pixels.data[(y*width+x)*4+3]>128)count++;
      if(count>width*.08){top=y;break;}
    }
    const sx=420/(width*.995),sy=500/(foot-top);
    transform=[sx,sy,209-width*.535*sx,40-top*sy];
    if(settings.alignHead) {
      let left=width,right=0;
      for(let y=Math.ceil(top);y<top+height*.065;y++)for(let x=0;x<width;x++) {
        if(pixels.data[(y*width+x)*4+3]>128){left=Math.min(left,x);right=Math.max(right,x);}
      }
      transform[2]=206-(left+right)/2*sx;
    }
  }
  const [sx,sy,tx,ty]=settings.transform || transform;
  n.drawImage(source,tx/5,ty/5,width*sx/5,height*sy/5);
  const out=createCanvas(420,600),g=out.getContext('2d');g.imageSmoothingEnabled=false;
  g.drawImage(normalized,0,0,420,600);
  const file=path.join(directory,name+'.png');fs.writeFileSync(file,out.toBuffer('image/png'));
  results.push({name,file,bytes:fs.statSync(file).size});
}
console.log(JSON.stringify(results));
