import { REGIONS } from './paperdoll-rig.js?v=21';
// The same compositor is used by the page and the offline rendering checks.
// Coordinates are in the character's original 420 × 600 sprite space.
export const DOLL_SIZE = Object.freeze({ width: 420, height: 600 });
export const BODY_ATLAS = "assets/agent-paperdoll-sprite.png";
export const BODY_POINTS = Object.freeze({
  hand: [287, 368], leftHand: [104, 368],
  head: [206, 134], eyes: [218, 159], mask: [223, 183],
  torso: [200, 275], belt: [167, 343], relic: [251, 341],
  back: [124, 239], feet: [202, 538], neck: [211, 240],
  wrist: [101, 322], arms: [193, 357], outfit: [210, 540],
  companion: [345, 538], vehicle: [65, 526], ammo: [145, 348],
});

export function atlasRect(art) {
  if (art.sourceRect) {
    const [x, y, width, height] = art.sourceRect;
    return { x, y, width, height };
  }
  const width = art.imageWidth / art.cols;
  const height = art.imageHeight / art.rows;
  return { x: (art.cell % art.cols) * width, y: Math.floor(art.cell / art.cols) * height, width, height };
}

export function placementFor(art, slot, options = {}) {
  const anchor = art.anchor ?? [0.5, 0.5];
  let pointName = art.attachment;
  if (pointName === "hand") pointName = slot === "secondary" ? "leftHand" : "hand";
  if (pointName === "belt" && slot === "paranormal") pointName = "relic";
  const target = art.target ?? options.target ?? BODY_POINTS[pointName] ?? BODY_POINTS.belt;
  let width = art.widthOnDoll ?? 72;
  const rect = atlasRect(art);
  const aspect = art.heightOnDoll ? art.heightOnDoll / art.widthOnDoll : rect.height / rect.width;
  const scaleX = art.flip ? -1 : 1;
  // Keep the visible pixels in frame while leaving the grip fixed at the hand.
  // Transparent cell margins do not make a long, narrow staff shrink unnecessarily.
  if (art.bounds) {
    const radians = (art.angle ?? 0) * Math.PI / 180;
    const [x0, y0, x1, y1] = art.bounds;
    for (const [x, y] of [[x0,y0],[x1,y0],[x0,y1],[x1,y1]]) {
      const dx = (x - anchor[0]) * scaleX;
      const dy = (y - anchor[1]) * aspect;
      const rx = dx * Math.cos(radians) - dy * Math.sin(radians);
      const ry = dx * Math.sin(radians) + dy * Math.cos(radians);
      if (rx > 0) width = Math.min(width, (DOLL_SIZE.width - 8 - target[0]) / rx);
      if (rx < 0) width = Math.min(width, (target[0] - 8) / -rx);
      if (ry > 0) width = Math.min(width, (DOLL_SIZE.height - 8 - target[1]) / ry);
      if (ry < 0) width = Math.min(width, (target[1] - 8) / -ry);
    }
  }
  const height = width * aspect;
  return { art, rect, target, anchor, width, height, angle: art.angle ?? 0, scaleX, slot,
    z: art.z ?? ({ back: 0, outfit: 20, torso: 30, neck: 40, head: 50, eyes: 51, mask: 52, hand: 70, wrist: 90, arms: 90 }[art.attachment] ?? 60) };
}

export function anchorOnDoll(placement) {
  // Draw at the target, then rotate/mirror around that exact grip or clasp.
  const { target, width, height, anchor } = placement;
  return { x: target[0], y: target[1], offsetX: -width * anchor[0], offsetY: -height * anchor[1] };
}

function paintItem(ctx, images, placement) {
  const picture = images.get(placement.art.atlas);
  if (!picture) return;
  const { rect, width, height, angle, scaleX } = placement;
  const grip = anchorOnDoll(placement);
  ctx.save();
  ctx.translate(grip.x, grip.y);
  ctx.rotate(angle * Math.PI / 180);
  ctx.scale(scaleX, 1);
  ctx.drawImage(picture, rect.x, rect.y, rect.width, rect.height, grip.offsetX, grip.offsetY, width, height);
  ctx.restore();
}

// Triangulated texture patches let shoulders, sleeves and torso bend independently.
function path(ctx, points) {
  ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath();
}
function clipped(ctx, points, draw) { ctx.save(); path(ctx,points); ctx.clip(); draw(); ctx.restore(); }
function surface(ctx) {
  const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(420,600)
    : typeof document !== 'undefined' ? Object.assign(document.createElement('canvas'), {width:420,height:600})
    : new ctx.canvas.constructor(420,600);
  c.getContext('2d').imageSmoothingEnabled=false;
  return c;
}
function triangle(ctx, picture, src, dst) {
  const [s0,s1,s2]=src, [d0,d1,d2]=dst;
  const u=s1[0]-s0[0], v=s1[1]-s0[1], w=s2[0]-s0[0], z=s2[1]-s0[1], det=u*z-v*w;
  if (Math.abs(det)<.0001) return;
  const a=((d1[0]-d0[0])*z-(d2[0]-d0[0])*v)/det;
  const c=((d2[0]-d0[0])*u-(d1[0]-d0[0])*w)/det;
  const b=((d1[1]-d0[1])*z-(d2[1]-d0[1])*v)/det;
  const d=((d2[1]-d0[1])*u-(d1[1]-d0[1])*w)/det;
  clipped(ctx,dst,()=>{ctx.transform(a,b,c,d,d0[0]-a*s0[0]-c*s0[1],d0[1]-b*s0[0]-d*s0[1]);ctx.drawImage(picture,0,0);});
}
function patch(ctx, images, p, uv, corners, sourceMask = null) {
  let picture=images.get(p.art.atlas); if(!picture)return;
  let r=p.rect;
  if(sourceMask) {
    const mask=surface(ctx),g=mask.getContext('2d');
    clipped(g,sourceMask.map(([x,y])=>[x*r.width,y*r.height]),()=>g.drawImage(picture,r.x,r.y,r.width,r.height,0,0,r.width,r.height));
    picture=mask;r={...r,x:0,y:0};
  }
  const [x0,y0,x1,y1]=uv;
  const src=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y])=>[r.x+x*r.width,r.y+y*r.height]);
  for(const ids of [[0,1,2],[0,2,3]])triangle(ctx,picture,ids.map(i=>src[i]),ids.map(i=>corners[i]));
}
function copyRegion(ctx, source, points) { clipped(ctx,points,()=>ctx.drawImage(source,0,0)); }
function eraseRegion(ctx, points) { ctx.save();ctx.globalCompositeOperation='destination-out';path(ctx,points);ctx.fill();ctx.restore(); }
function baseRegion(ctx, body, points) { clipped(ctx,points,()=>ctx.drawImage(body,180,0,420,600,0,0,420,600)); }
function rigFor(placements) {
  const suit=placements.find(p=>p.art.fullBody);
  if(!suit)return {regions:REGIONS, map:p=>p, suit:null};
  const anchors=suit.art.bodyAnchors;
  const point=key=>[suit.target[0]+(anchors[key][0]-suit.anchor[0])*suit.width,suit.target[1]+(anchors[key][1]-suit.anchor[1])*suit.height];
  // Local part transforms keep a suit's own hand/head/foot positions, including its proportions.
  const hand=point('hand'),left=point('leftHand'),torso=point('torso'),head=point('head');
  function around(p,from,to,sx,sy=sx){return [to[0]+(p[0]-from[0])*sx,to[1]+(p[1]-from[1])*sy];}
  const map=p=>around(p,[200,275],torso,1.16,.94);
  const regions=Object.fromEntries(Object.entries(REGIONS).map(([key,points])=>{
    let transform=map;
    if(/leftHand|leftFingers/.test(key))transform=p=>around(p,BODY_POINTS.leftHand,left,.82);
    if(/rightHand|rightFingers/.test(key))transform=p=>around(p,BODY_POINTS.hand,hand,.82);
    if(/head|hair|cap/.test(key))transform=p=>around(p,BODY_POINTS.head,head,1.08,1.2);
    return [key,points.map(transform)];
  }));
  return {regions,map,suit,point};
}

function fittedClothing(ctx,images,p,rig) {
  const kind=p.art.composition;
  const m=points=>points.map(rig.map);
  if(kind==='garment') {
    const layer=surface(ctx),g=layer.getContext('2d');
    clipped(g,rig.regions.coat,()=>{
      // Opaque material replaces the old jacket, including its lapels and pockets.
      g.fillStyle='#4b5033';g.fillRect(0,0,420,600);
      patch(g,images,p,[.22,.04,.80,.98],m([[144,198],[252,216],[272,367],[122,367]]));
      patch(g,images,p,[.02,.20,.29,.90],m([[124,212],[155,228],[124,322],[76,322]]));
      patch(g,images,p,[.76,.20,.98,.9],m([[251,221],[271,238],[292,318],[264,323]]));
    });
    g.globalCompositeOperation='destination-in';g.drawImage(ctx.canvas,0,0);g.globalCompositeOperation='source-over';
    eraseRegion(ctx,rig.regions.coat);ctx.drawImage(layer,0,0);
  } else if(kind==='vest'||kind==='heavyVest') {
    // Torso and shoulder plates have different perspective and depth.
    const uv=kind==='heavyVest'?[.16,.03,.85,.97]:[.04,.02,.97,.98];
    clipped(ctx,rig.regions.torso,()=>patch(ctx,images,p,uv,m([[143,211],[253,218],[270,357],[131,365]])));
    if(kind==='heavyVest') {
      patch(ctx,images,p,[.0,.04,.28,.32],m([[126,207],[154,215],[153,248],[114,245]]));
      patch(ctx,images,p,[.78,.03,1,.34],m([[250,218],[271,229],[280,257],[257,250]]));
    }
  } else if(kind==='harness') {
    clipped(ctx,rig.regions.torso,()=>patch(ctx,images,p,[0,0,1,1],m([[142,214],[254,222],[269,354],[131,356]])));
  } else if(kind==='sling') {
    patch(ctx,images,p,[0,0,1,1],m([[133,208],[264,215],[268,351],[129,354]]));
  } else if(kind==='cape') {
    // The mantle overlaps the shoulder seam; the long panels stay behind the actor.
    patch(ctx,images,p,[.14,.40,.42,.64],m([[127,203],[157,215],[152,253],[111,247]]));
    patch(ctx,images,p,[.59,.40,.87,.64],m([[245,214],[269,226],[280,256],[252,251]]));
  } else if(kind==='collar') {
    patch(ctx,images,p,[0,0,1,1],m([[151,204],[252,217],[265,276],[147,275]]));
  }
}

function drawBoots(ctx,images,p,rig) {
  const suit=rig.suit;
  let left=[[86,450],[181,450],[181,545],[86,545]],right=[[206,450],[311,450],[311,543],[206,543]];
  if(suit) {
    const x=suit.target[0]-suit.anchor[0]*suit.width,y=suit.target[1]-suit.anchor[1]*suit.height;
    const fy=y+suit.height*.79, bootTop=fy-21;
    left=[[x+suit.width*.25,bootTop],[x+suit.width*.43,bootTop],[x+suit.width*.44,540],[x+suit.width*.19,540]];
    right=[[x+suit.width*.58,bootTop],[x+suit.width*.76,bootTop],[x+suit.width*.83,540],[x+suit.width*.56,540]];
    eraseRegion(ctx,[[0,fy],[420,fy],[420,600],[0,600]]);
  } else { eraseRegion(ctx,REGIONS.feet);eraseRegion(ctx,REGIONS.rightFoot); }
  const bootOutline=[[0,0],[.40,0],[.40,.42],[.43,.56],[.53,.63],[.60,.69],[.64,.78],[.64,.94],[.52,1],[.18,1],[0,.9]];
  // Isolate a complete boot (including its toe) from the overlapping pair in the catalog.
  patch(ctx,images,p,[0,0,.64,1],left,bootOutline);patch(ctx,images,p,[0,0,.64,1],right,bootOutline);
  if(!suit) {
    const body=images.get(BODY_ATLAS);
    baseRegion(ctx,body,[[107,448],[166,448],[161,465],[107,465]]);
    baseRegion(ctx,body,[[216,448],[268,448],[269,465],[218,465]]);
  }
}

function drawWrist(ctx,images,p,rig) {
  const side=p.art.side==='screenRight'?'right':'left';
  const region=rig.regions[side+'Hand'];
  if(p.art.composition==='gauntlets') {
    eraseRegion(ctx,region); paintItem(ctx,images,p);
  } else {
    const center=rig.suit ? rig.point('wrist') : [102,330];
    const [x,y]=center;
    // Bracelet texture wraps a tapered forearm instead of a freestanding bracelet icon.
    patch(ctx,images,p,[.16,.09,.86,.9],[[x-22,y-23],[x+19,y-19],[x+17,y+23],[x-22,y+22]]);
  }
}

function tether(ctx,body,p,rig,pocket=false) {
  const [x,y]=p.target;
  if(pocket) {
    // An opaque pocket front covers the lower item; its opening holds the visible top.
    const r=p.rect,h=p.width*r.height/r.width;
    const top=y+Math.min(20,h*.37),bottom=Math.min(y+h*.88+4,431);
    ctx.drawImage(body,289,395,43,44,x-27,top,54,Math.max(28,bottom-top));
    ctx.drawImage(body,377,330,38,10,x-27,top-3,54,6);
  } else {
    // Small loop crosses the item's clasp, not the full object.
    ctx.drawImage(body,377,330,38,10,x-10,y-3,20,7);
    ctx.drawImage(body,380,337,8,9,x-4,y-7,7,16);
  }
}

export function paintPaperdoll(ctx, images, placements, { backpack = false } = {}) {
  ctx.clearRect(0,0,420,600);ctx.imageSmoothingEnabled=false;
  const body=images.get(BODY_ATLAS);if(!body)return;
  // Failed textures must never erase the corresponding body part.
  const visible=placements.filter(p=>images.has(p.art.atlas));
  const rig=rigFor(visible),kind=p=>p.art.composition;
  const actor=surface(ctx),a=actor.getContext('2d');
  if(rig.suit)paintItem(a,images,rig.suit);
  else a.drawImage(body,180,0,420,600,0,0,420,600);

  // 1. Back layer: bags, cloak and arrows are hidden by the body silhouette.
  for(const p of visible.filter(p=>['backpack','cape','quiver'].includes(kind(p))))paintItem(ctx,images,p);
  if(backpack&&!visible.some(p=>kind(p)==='backpack')) {
    // Existing custom backpack entries reuse only the pack region from the supplied base atlas.
    ctx.drawImage(body,755,173,132,169,43,173,132,169);
  }
  // 2. Replace cloth regions; 3. integrate fitted material with the body's contours.
  for(const k of ['garment','vest','heavyVest','cape','harness','sling','collar'])
    for(const p of visible.filter(p=>kind(p)===k))fittedClothing(a,images,p,rig);
  for(const p of visible.filter(p=>kind(p)==='boots'))drawBoots(a,images,p,rig);
  for(const p of visible.filter(p=>['wrist','gauntlets'].includes(kind(p))))drawWrist(a,images,p,rig);
  const helmet=visible.find(p=>kind(p)==='helmet');
  if(helmet) {eraseRegion(a,rig.regions.head);paintItem(a,images,helmet);}
  for(const p of visible.filter(p=>kind(p)==='headband')) {
    eraseRegion(a,rig.regions.cap);paintItem(a,images,p);
    if(!rig.suit)baseRegion(a,body,REGIONS.hair);
  }
  for(const p of visible.filter(p=>kind(p)==='necklace')) {
    // Items without a drawn chain receive a narrow clasp/chain cut from the original belt texture.
    const [x,y]=p.target;
    a.save();a.strokeStyle='#5c4931';a.lineWidth=3;a.beginPath();a.moveTo(x-25,y-18);a.lineTo(x-12,y+6);a.lineTo(x,y+12);a.lineTo(x+14,y+3);a.lineTo(x+25,y-18);a.stroke();a.restore();
    paintItem(a,images,p);
  }
  // 4. The neck/scarf conceals collar backs and the upper part of chains.
  if(!rig.suit&&!helmet)baseRegion(a,body,REGIONS.scarf);
  for(const p of visible.filter(p=>['glasses','mask'].includes(kind(p)))) {
    if(rig.suit||helmet) {
      // A sealed helmet keeps face accessories inside its visor, never on its outer shell.
      const center=helmet?[helmet.target[0],helmet.target[1]+2]:rig.point('eyes');
      const inner=placementFor({...p.art,target:center,widthOnDoll:helmet?70:96},p.slot);
      clipped(a,[[center[0]-38,center[1]-12],[center[0]+40,center[1]-12],[center[0]+38,center[1]+47],[center[0]-38,center[1]+47]],()=>paintItem(a,images,inner));
      if(helmet) {
        // Restore the central cage bar in front of the eyewear.
        clipped(a,[[center[0]-5,center[1]-29],[center[0]+3,center[1]-29],[center[0]+3,center[1]+25],[center[0]-5,center[1]+25]],()=>paintItem(a,images,helmet));
      }
    } else {
      clipped(a,[[157,141],[268,141],[268,204],[173,204]],()=>paintItem(a,images,p));
      baseRegion(a,body,REGIONS.hair);
    }
  }
  // Backpack's front shoulder straps use the supplied worn variant, preserving fit.
  if(backpack||visible.some(p=>kind(p)==='backpack')) {
    const straps=[[[151,204],[167,214],[150,282],[139,289],[132,277]],[[249,215],[259,225],[266,286],[255,285]]];
    for(const pts of straps)clipped(a,pts.map(rig.map),()=>a.drawImage(body,712,0,420,600,0,0,420,600));
  }
  for(const p of visible.filter(p=>['belt','pocket'].includes(kind(p)))) {paintItem(a,images,p);tether(a,body,p,rig,kind(p)==='pocket');}
  ctx.drawImage(actor,0,0);
  // Palm is behind the handle. Only articulated finger masks come back in front.
  for(const p of visible.filter(p=>['held','knuckles'].includes(kind(p)))) {
    paintItem(ctx,images,p);
    const side=p.slot==='secondary'?'left':'right';
    const gauntlet=visible.find(g=>kind(g)==='gauntlets'&&(g.art.side==='screenRight'?'right':'left')===side);
    if(gauntlet) {
      const [x,y]=p.target;
      copyRegion(ctx,actor,[[x-13,y-5],[x+10,y-5],[x+14,y+5],[x+6,y+13],[x-13,y+10]]);
    } else if(kind(p)!=='knuckles')copyRegion(ctx,actor,rig.regions[side+'Fingers']);
  }
  // 5. External details are drawn last and must have a real parent or ground contact.
  for(const p of visible.filter(p=>['adjustment','companion'].includes(kind(p))))paintItem(ctx,images,p);
}

const imageCache = new Map();
function loadImage(path) {
  if (!imageCache.has(path)) imageCache.set(path, new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { imageCache.delete(path); reject(new Error(`Não foi possível carregar ${path}`)); };
    img.src = path;
  }));
  return imageCache.get(path);
}

export async function drawItemIcon(canvas, art) {
  try {
    const image = await loadImage(art.atlas);
    if (!canvas.isConnected) return;
    const rect = atlasRect(art);
    const scale = Math.min(canvas.width / rect.width, canvas.height / rect.height);
    const width = rect.width * scale;
    const height = rect.height * scale;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height,
      (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  } catch { canvas.dataset.loadError = "true"; }
}

export function createPaperdoll(canvas) {
  canvas.width = DOLL_SIZE.width;
  canvas.height = DOLL_SIZE.height;
  let revision = 0;
  return async (placements, options) => {
    const current = ++revision;
    const paths = [...new Set([BODY_ATLAS, ...placements.map(p => p.art.atlas)])];
    const results = await Promise.allSettled(paths.map(loadImage));
    if (current !== revision || !canvas.isConnected) return;
    const images = new Map(results.flatMap((result, index) => result.status === "fulfilled" ? [[paths[index], result.value]] : []));
    paintPaperdoll(canvas.getContext("2d"), images, placements, options);
    canvas.dataset.loadError = results.some(result => result.status === "rejected") ? "true" : "false";
  };
}
