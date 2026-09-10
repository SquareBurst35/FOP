import { paintAgentRegions, variantPath, visibleAgentStates } from './agent-variants.js?v=23';
import { statesForPlacements } from './equipment-variants.js?v=23';
// The same compositor is used by the page and the offline rendering checks.
// Coordinates are in the character's original 420 × 600 sprite space.
export const DOLL_SIZE = Object.freeze({ width: 420, height: 600 });
export const BODY_ATLAS = "assets/agent-paperdoll-sprite.png";
export const FEMALE_BODY = "assets/agent-female-base.png";
export const characterBodyPath=appearance=>appearance==='feminino'?FEMALE_BODY:BODY_ATLAS;
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

// Resolve complete agent variants before painting. Item icon rendering below
// remains independent and continues to use the original 165 catalog images.
export function paperdollImagePaths(placements, {backpack=false,appearance='masculino'}={}) {
  const states=statesForPlacements(placements);
  return [...new Set([characterBodyPath(appearance),...states.filter(s=>!['inventory','adjustment'].includes(s.region)).map(s=>variantPath(s.key)),...(backpack?[variantPath('backpack')]:[])])];
}
export function paintPaperdoll(ctx,images,placements,options={}) {
  return paintAgentRegions(ctx,images,statesForPlacements(placements),{...options,base:images.get(characterBodyPath(options.appearance))});
}
export function paperdollVisibleStates(placements) {return visibleAgentStates(statesForPlacements(placements));}

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
    const paths = paperdollImagePaths(placements, options);
    const results = await Promise.allSettled(paths.map(loadImage));
    if (current !== revision || !canvas.isConnected) return;
    const images = new Map(results.flatMap((result, index) => result.status === "fulfilled" ? [[paths[index], result.value]] : []));
    paintPaperdoll(canvas.getContext("2d"), images, placements, options);
    canvas.dataset.loadError = results.some(result => result.status === "rejected") ? "true" : "false";
  };
}
