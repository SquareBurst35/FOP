export function atlasRect(art) {
  if (art.sourceRect) {
    const [x, y, width, height] = art.sourceRect;
    return { x, y, width, height };
  }
  const width = art.imageWidth / art.cols;
  const height = art.imageHeight / art.rows;
  return { x: (art.cell % art.cols) * width, y: Math.floor(art.cell / art.cols) * height, width, height };
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
