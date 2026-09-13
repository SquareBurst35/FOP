// Region replacement from complete, equipped agent sprites. Catalog item art is
// never sampled by this compositor. The original head, body and outfits share a frame.
import { REGIONS } from './paperdoll-rig.js?v=24';
import { AGENT_POSES } from './agent-poses.js?v=24';
export const VARIANT_ROOT='assets/agent-variants/';
export const variantPath=key=>`${VARIANT_ROOT}${key}.png`;
const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
export const VARIANT_REGIONS=Object.freeze({
  body:rect(0,0,420,600),garment:rect(55,195,280,205),
  torso:[[137,205],[159,210],[189,235],[235,216],[258,215],[270,357],[240,373],[128,373],[126,285]],
  armor:rect(55,195,280,205),head:rect(95,20,245,192),brow:rect(110,111,179,35),
  eyes:rect(173,122,123,49),face:rect(158,153,112,54),
  neck:[[178,224],[188,226],[211,247],[236,224],[242,228],[229,248],[236,252],[237,291],[193,291],[190,249],[200,247]],
  feet:rect(70,465,255,95),leftArm:rect(55,276,97,123),rightArm:rect(255,300,86,100),
  belt:rect(128,311,86,145),
  sling:[[124,203],[151,198],[284,341],[279,362],[248,351],[135,242]],
  harness:[[144,207],[170,217],[157,268],[227,264],[236,217],[257,217],[268,347],[140,350],[129,278]],
  backpack:[[40,168],[139,168],[166,217],[162,308],[113,348],[40,348]],
  quiver:[[28,95],[153,95],[160,248],[108,276],[45,237]],
  cape:rect(15,180,328,366),
  capeShoulders:[[101,203],[145,187],[182,222],[215,225],[258,196],[277,226],[290,256],[246,252],[215,247],[177,250],[116,248]],
  strapLeft:[[147,205],[165,215],[143,300],[127,286]],strapRight:[[247,214],[261,221],[280,294],[263,295]],
  quiverStrap:[[126,184],[151,185],[279,301],[280,331],[256,325],[145,221]],
  companion:[[276,308],[332,300],[355,308],[355,345],[392,362],[393,394],[376,413],[376,541],[208,541],[180,513],[195,485],[219,449],[245,423]],
  helmetOpening:[[176,136],[270,136],[273,166],[200,174],[174,159]],
});
function path(ctx,points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
export function clipRegion(ctx,points,draw){ctx.save();path(ctx,points);ctx.clip();draw();ctx.restore();}
function clipParts(ctx,parts,draw){ctx.save();ctx.beginPath();for(const points of parts){points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}ctx.clip();draw();ctx.restore();}
export function replaceVariantRegion(ctx,picture,points){clipRegion(ctx,points,()=>{ctx.clearRect(0,0,420,600);ctx.drawImage(picture,0,0,420,600);});}
function surface(ctx){const c=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(420,600):typeof document!=='undefined'?Object.assign(document.createElement('canvas'),{width:420,height:600}):new ctx.canvas.constructor(420,600);c.getContext('2d').imageSmoothingEnabled=false;return c;}
function drawBase(ctx,base){ctx.drawImage(base,base.width===420?0:180,0,420,600,0,0,420,600);}
function baseRegion(ctx,base,points){clipRegion(ctx,points,()=>drawBase(ctx,base));}
const posedCache=new WeakMap();
function equippedPose(ctx,picture,pose,states,flipped){
  const suit=states.find(s=>s.region==='body'),armor=states.find(s=>s.key==='heavy-armor'),garment=states.find(s=>s.region==='garment');
  const gloves=states.some(s=>s.key==='colossus-gloves'),bracer=states.find(s=>['bracer','wrist-device','link-bracer','knuckles'].includes(s.key));
  if(!suit&&!armor&&!garment&&!gloves&&!bracer)return picture;
  const token=[suit?.key,armor?.key,garment?.key,gloves,bracer?.key,flipped].join(':');
  let cache=posedCache.get(picture);if(!cache){cache=new Map();posedCache.set(picture,cache);}if(cache.has(token))return cache.get(token);
  const out=surface(ctx),g=out.getContext('2d');g.drawImage(picture,0,0,420,600);
  const pixels=g.getImageData(0,0,420,600);
  // Palette changes on the posed arms preserve the generated fingers and grip.
  // They are restricted to sleeves/gloves; held-object pixels are not recolored.
  if(pixels?.data){
    const data=pixels.data,palette=suit?(suit.key==='space-suit'?[207,202,175]:suit.key==='hazmat-suit'?[217,166,34]:[34,44,47]):armor?[70,74,63]:garment?[51,69,82]:null;
    const inside=(x,y,[cx,cy,w,h])=>x>=cx-w/2&&x<cx+w/2&&y>=cy-h/2&&y<cy+h/2;
    for(let y=250;y<391;y++)for(let x=50;x<340;x++){
      const i=(y*420+x)*4;if(!data[i+3])continue;
      const r=data[i],v=data[i+1],b=data[i+2],light=(r+v+b)/3;
      const hand=pose.hands.find(h=>inside(x,y,h));
      const wrist=pose.hands.find(([cx,cy,w,h])=>inside(x,y,pose.posed?[cx+(cx<200?-1:1)*w*.65,cy-h*.25,w*.7,h*.85]:[cx,cy-h*.7,w,h*.8]));
      const sleeve=(x<145||x>260)&&y<332&&!hand;
      const olive=v>=r*.88&&v>b*1.18&&r<170&&v>35;
      const skin=r>140&&v>65&&r>v*1.1&&b<v*.8;
      let target=null;
      if(palette&&sleeve&&(olive||(suit&&skin)))target=palette;
      if((hand||gloves&&wrist&&skin)&&(gloves||suit)&&(Math.max(r,v,b)-Math.min(r,v,b)<25&&light>20&&light<115||(suit||gloves&&wrist)&&skin))target=gloves?[111,111,100]:palette;
      if(bracer&&wrist&&(skin||olive||light>35&&Math.max(r,v,b)-Math.min(r,v,b)<25)) {
        const physicalSide=(flipped?390-wrist[0]:wrist[0])<200?'leftArm':'rightArm';
        if(bracer.region===physicalSide)target=bracer.key==='link-bracer'?[75,145,155]:bracer.key==='knuckles'?[180,151,53]:[138,145,136];
      }
      if(target){const shade=Math.max(.5,Math.min(1.35,light/(skin?145:85)));for(let c=0;c<3;c++)data[i+c]=Math.round(Math.min(255,target[c]*shade));}
    }
    g.putImageData(pixels,0,0);
    if(gloves)for(const [x,y,w,h] of pose.hands){
      // Three tiny knuckle plates follow this pose, leaving fingertips in front.
      g.fillStyle='#bebdac';for(let j=0;j<3;j++)g.fillRect(Math.round((x-w*.26+j*w*.18)/5)*5,Math.round((y-h*.18)/5)*5,5,5);
    }
  }
  cache.set(token,out);return out;
}
function poseMirrored(state,pose){return pose.side!=='both'&&pose.side!==(state.slot==='secondary'?'left':'right')||pose.side==='both'&&state.slot==='secondary';}
const mirror=points=>points.map(([x,y])=>[390-x,y]);
function paintPose(ctx,picture,state,pose,states){
  const flipped=poseMirrored(state,pose),map=points=>flipped?mirror(points):points;
  // Remove the old arm outside the trunk/legs. This mask is in body space and
  // must not mirror with a held object: the body remains facing the same way.
  const body=[[136,205],[248,212],[262,281],[269,352],[273,383],[272,445],[289,511],[316,516],[316,545],[201,545],[202,468],[188,389],[170,444],[164,500],[176,512],[176,545],[81,545],[88,497],[105,463],[116,416],[128,381],[127,337],[130,273]];
  for(const points of pose.clear)clipRegion(ctx,map(points),()=>{
    ctx.save();ctx.beginPath();ctx.rect(0,0,420,600);body.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip('evenodd');ctx.clearRect(0,0,420,600);ctx.restore();
  });
  const source=equippedPose(ctx,picture,pose,states,flipped);
  clipParts(ctx,pose.parts.map(map),()=>{ctx.save();if(flipped){ctx.translate(390,0);ctx.scale(-1,1);}ctx.drawImage(source,0,0,420,600);ctx.restore();});
}
function adjustmentOwner(adjustment,state){return state.region!=='adjustment'&&(adjustment.name==='Carregador rápido'?/^(pistol|revolver|rifle|crossbow|shotgun|sniper)$/.test(state.key):/^(flashlight|phone|camera|radio|laptop|night-goggles|sunglasses)$/.test(state.key));}
export function visibleAgentStates(states){
  const poses=states.filter(s=>s.region==='pose');
  const primary=poses.find(s=>s.slot==='weapon')??poses[0];
  const two=primary&&AGENT_POSES[primary.key]?.twoHands?primary:poses.find(s=>AGENT_POSES[s.key]?.twoHands);
  const active=two?states.filter(s=>s.region!=='pose'||s===two):states;
  return active.filter(s=>s.region!=='adjustment'||active.some(owner=>adjustmentOwner(s,owner)));
}
export function paintAgentRegions(ctx,images,states,{base,backpack=false,appearance='masculino'}={}){
  ctx.clearRect(0,0,420,600);ctx.imageSmoothingEnabled=false;if(!base)return;
  // Replacement clears affect only the body. Backpacks/cloaks must survive a
  // foreground silhouette becoming smaller (for example a fitted wrist guard).
  const destination=ctx,foreground=surface(ctx);ctx=foreground.getContext('2d');
  const available=states.filter(s=>s.region==='adjustment'||images.has(variantPath(s.key)));
  const valid=visibleAgentStates(available).sort((a,b)=>a.order-b.order||a.key.localeCompare(b.key)||String(a.slot).localeCompare(String(b.slot)));
  const source=key=>images.get(variantPath(key));
  const suit=valid.find(s=>s.region==='body'),pack=valid.find(s=>s.region==='backpack'),cape=valid.find(s=>s.region==='cape'),quiver=valid.find(s=>s.region==='quiver');
  for(const state of [cape,pack,quiver].filter(Boolean))clipRegion(destination,VARIANT_REGIONS[state.region],()=>destination.drawImage(source(state.key),0,0,420,600));
  if(backpack&&!pack&&source('backpack'))clipRegion(destination,VARIANT_REGIONS.backpack,()=>destination.drawImage(source('backpack'),0,0,420,600));
  if(suit)ctx.drawImage(source(suit.key),0,0,420,600);else drawBase(ctx,base);
  const poseStates=valid.filter(s=>s.region==='pose'),occupied=new Set();
  for(const s of poseStates){const p=AGENT_POSES[s.key];if(p?.twoHands){occupied.add('left');occupied.add('right');}else occupied.add(s.slot==='secondary'?'left':'right');}
  const helmet=valid.find(s=>s.region==='head');
  const female=appearance==='feminino';
  if(female&&suit)baseRegion(ctx,base,VARIANT_REGIONS.helmetOpening);
  for(const state of valid.filter(s=>!['body','backpack','cape','quiver','pose','adjustment','companion'].includes(s.region))){
    const picture=source(state.key);
    if(state.region==='arms'){
      if(!occupied.has('left'))replaceVariantRegion(ctx,picture,VARIANT_REGIONS.leftArm);
      if(!occupied.has('right'))replaceVariantRegion(ctx,picture,VARIANT_REGIONS.rightArm);
    }else if(state.region==='leftArm'||state.region==='rightArm'){
      const side=state.region==='leftArm'?'left':'right';
      if(!occupied.has(side))replaceVariantRegion(ctx,picture,VARIANT_REGIONS[state.region]);
    }else if(state.region==='belt'){
      // Replace only the belt attachment and its suspended portion, keeping pants.
      let points=state.key==='belt-cuffs'?rect(117,337,65,115):state.key==='belt-keys'?rect(155,340,43,86):rect(124,312,68,85);
      const shift=state.slot==='ammo'?-20:state.slot==='paranormal'?55:0;
      ctx.save();ctx.translate(shift,0);replaceVariantRegion(ctx,picture,points);ctx.restore();
    }else if(state.region==='head'){
      replaceVariantRegion(ctx,picture,VARIANT_REGIONS.head);
      if(female)baseRegion(ctx,base,VARIANT_REGIONS.helmetOpening);
    }else if(state.region==='eyes'||state.region==='face'){
      const draw=()=>replaceVariantRegion(ctx,picture,state.key==='gas-mask'?rect(155,147,132,69):VARIANT_REGIONS[state.region]);
      if(helmet)clipRegion(ctx,VARIANT_REGIONS.helmetOpening,draw);else draw();
    }else if(state.region==='neck'&&state.key==='neck-collar')replaceVariantRegion(ctx,picture,[[168,181],[253,181],[253,210],[227,210],[230,279],[195,279],[195,211],[168,211]]);
    else replaceVariantRegion(ctx,picture,VARIANT_REGIONS[state.region]);
    if(!suit&&['garment','torso','armor','neck'].includes(state.region)){
      if(female&&!helmet)baseRegion(ctx,base,[[110,155],[175,155],[175,220],[110,240]]);
      baseRegion(ctx,base,REGIONS.scarf);
    }
  }
  // Shoulder seams and straps belong to equipped-character variants too.
  if(cape)replaceVariantRegion(ctx,source(cape.key),VARIANT_REGIONS.capeShoulders);
  if(pack||backpack){const p=source(pack?.key||'backpack');if(p)for(const side of ['strapLeft','strapRight'])replaceVariantRegion(ctx,p,VARIANT_REGIONS[side]);}
  if(quiver)replaceVariantRegion(ctx,source(quiver.key),VARIANT_REGIONS.quiverStrap);
  if(!suit&&!helmet&&valid.some(s=>['eyes','face','brow'].includes(s.region))){
    for(const p of female?[rect(130,126,40,52),rect(176,138,10,24),rect(242,124,12,42)]:[rect(145,132,28,28),rect(183,134,8,23),rect(210,134,8,19)])baseRegion(ctx,base,p);
  }
  for(const state of poseStates){const pose=AGENT_POSES[state.key];if(pose)paintPose(ctx,source(state.key),state,pose,valid);}
  for(const state of valid.filter(s=>s.region==='adjustment')){
    const owner=valid.find(s=>adjustmentOwner(state,s));
    if(!owner)continue;const p=AGENT_POSES[owner.key],hand=p?.hands.at(-1)??[275,142];let [x,y]=hand;if(p&&poseMirrored(owner,p))x=390-x;
    ctx.fillStyle=state.name==='Bateria potente'?'#9acacc':'#71786a';ctx.fillRect(Math.round(x/5)*5,Math.round((y+15)/5)*5,10,5);
  }
  for(const state of valid.filter(s=>s.region==='companion'))clipRegion(ctx,VARIANT_REGIONS.companion,()=>ctx.drawImage(source(state.key),0,0,420,600));
  destination.drawImage(foreground,0,0);
  return valid;
}
