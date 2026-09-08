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

export function paintPaperdoll(ctx, images, placements, { backpack = false, armor = false } = {}) {
  ctx.clearRect(0, 0, DOLL_SIZE.width, DOLL_SIZE.height);
  ctx.imageSmoothingEnabled = false;
  const body = images.get(BODY_ATLAS);
  if (!body) return;
  const ordered = [...placements].sort((a, b) => a.z - b.z);
  for (const p of ordered.filter(p => p.z < 10)) paintItem(ctx, images, p);
  const fullBody = placements.find(p => p.art.fullBody);
  const replacesHead = placements.some(p => p.art.replaceHead);
  const wearsBoots = placements.some(p => p.art.attachment === "feet");
  if (!fullBody) {
    const cut = replacesHead ? 200 : 0;
    const bottom = wearsBoots ? 460 : 600;
    ctx.drawImage(body, backpack ? 712 : 180, cut, 420, bottom - cut, 0, cut, 420, bottom - cut);
  }
  // Keep the fitted vest that players already use. The helmet remains independent.
  if (armor) ctx.drawImage(body, 180, 771, 420, 396, 0, 204, 420, 396);
  for (const p of ordered.filter(p => p.z >= 10 && p.z < 100)) {
    if (p.art.fullBody && wearsBoots) {
      ctx.save();ctx.beginPath();ctx.rect(0,0,420,460);ctx.clip();paintItem(ctx, images, p);ctx.restore();
    } else paintItem(ctx, images, p);
  }
  // Foreground fingers close around the item instead of leaving it floating nearby.
  for (const slot of ["weapon", "secondary"]) {
    if (!placements.some(p => p.slot === slot && p.art.attachment === "hand")) continue;
    if (fullBody) {
      const held = placements.find(p => p.slot === slot);
      ctx.save();
      ctx.beginPath();ctx.rect(held.target[0] - 17, held.target[1] - 16, 34, 34);ctx.clip();
      paintItem(ctx, images, fullBody);ctx.restore();
    } else {
      const glove = slot === "weapon" ? [445, 335, 43, 57] : [250, 337, 63, 57];
      ctx.drawImage(body, ...glove, glove[0] - 180, glove[1], glove[2], glove[3]);
    }
  }
  for (const p of ordered.filter(p => p.z >= 100)) paintItem(ctx, images, p);
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
