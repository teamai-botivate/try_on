import type { ImageQuality, JewelleryAsset } from "@/types";

const TARGET_SIZE = 512;
const PADDING_RATIO = 0.12;

export async function processJewelleryAsset(file: File): Promise<JewelleryAsset> {
  const dataURL = await readFileAsDataURL(file);
  const original = await loadImage(dataURL);

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = original.naturalWidth || original.width;
  sourceCanvas.height = original.naturalHeight || original.height;

  const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceCtx) throw new Error("Cannot process jewellery image");

  sourceCtx.drawImage(original, 0, 0, sourceCanvas.width, sourceCanvas.height);

  const transparentCanvas = removeBackground(sourceCanvas);
  const bounds = findOpaqueBounds(transparentCanvas);
  const normalizedCanvas = normalizeAsset(transparentCanvas, bounds);
  const quality = validateJewelleryAsset(normalizedCanvas, bounds);

  return {
    original,
    canvas: normalizedCanvas,
    width: normalizedCanvas.width,
    height: normalizedCanvas.height,
    originalWidth: sourceCanvas.width,
    originalHeight: sourceCanvas.height,
    bounds,
    center: {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    },
    quality,
    sourceFileName: file.name,
  };
}

function removeBackground(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const output = document.createElement("canvas");
  output.width = canvas.width;
  output.height = canvas.height;

  const inputCtx = canvas.getContext("2d", { willReadFrequently: true });
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  if (!inputCtx || !outputCtx) return canvas;

  const imageData = inputCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const bg = estimateBackgroundColor(data, canvas.width, canvas.height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const distance = colorDistance(r, g, b, bg.r, bg.g, bg.b);
    const brightness = (r + g + b) / 3;
    const isLikelyBackground = distance < 46 || (brightness > 238 && distance < 86);

    if (a < 245 || isLikelyBackground) {
      data[i + 3] = Math.min(a, isLikelyBackground ? 0 : a);
    } else {
      data[i + 3] = Math.min(255, Math.round(a * 1.08));
      data[i] = Math.min(255, Math.round(r * 1.03));
      data[i + 1] = Math.min(255, Math.round(g * 1.03));
      data[i + 2] = Math.min(255, Math.round(b * 1.03));
    }
  }

  outputCtx.putImageData(imageData, 0, 0);
  return output;
}

function estimateBackgroundColor(data: Uint8ClampedArray, width: number, height: number) {
  const samples: Array<{ r: number; g: number; b: number }> = [];
  const sampleSize = Math.max(8, Math.floor(Math.min(width, height) * 0.06));
  const corners = [
    [0, 0],
    [width - sampleSize, 0],
    [0, height - sampleSize],
    [width - sampleSize, height - sampleSize],
  ];

  corners.forEach(([startX, startY]) => {
    for (let y = startY; y < startY + sampleSize; y += 4) {
      for (let x = startX; x < startX + sampleSize; x += 4) {
        const index = (y * width + x) * 4;
        samples.push({ r: data[index], g: data[index + 1], b: data[index + 2] });
      }
    }
  });

  const total = samples.reduce(
    (sum, color) => ({
      r: sum.r + color.r,
      g: sum.g + color.g,
      b: sum.b + color.b,
    }),
    { r: 0, g: 0, b: 0 }
  );

  return {
    r: total.r / samples.length,
    g: total.g / samples.length,
    b: total.b / samples.length,
  };
}

function findOpaqueBounds(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { x: 0, y: 0, width: canvas.width, height: canvas.height };

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 24) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    return { x: 0, y: 0, width: canvas.width, height: canvas.height };
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX + 1),
    height: Math.max(1, maxY - minY + 1),
  };
}

function normalizeAsset(canvas: HTMLCanvasElement, bounds: JewelleryAsset["bounds"]): HTMLCanvasElement {
  const normalized = document.createElement("canvas");
  normalized.width = TARGET_SIZE;
  normalized.height = TARGET_SIZE;

  const ctx = normalized.getContext("2d");
  if (!ctx) return canvas;

  const maxAssetSize = TARGET_SIZE * (1 - PADDING_RATIO * 2);
  const scale = Math.min(maxAssetSize / bounds.width, maxAssetSize / bounds.height);
  const drawWidth = bounds.width * scale;
  const drawHeight = bounds.height * scale;
  const drawX = (TARGET_SIZE - drawWidth) / 2;
  const drawY = (TARGET_SIZE - drawHeight) / 2;

  ctx.clearRect(0, 0, TARGET_SIZE, TARGET_SIZE);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, bounds.x, bounds.y, bounds.width, bounds.height, drawX, drawY, drawWidth, drawHeight);

  return normalized;
}

function validateJewelleryAsset(canvas: HTMLCanvasElement, bounds: JewelleryAsset["bounds"]): ImageQuality {
  const issues: string[] = [];
  const coverage = (bounds.width * bounds.height) / (canvas.width * canvas.height);

  if (bounds.width < 48 || bounds.height < 48) {
    issues.push("Jewellery asset is very small; use a higher-resolution jewellery image for sharper AR.");
  }

  if (coverage < 0.02) {
    issues.push("Jewellery occupies very little of the image; automatic normalization added extra padding.");
  }

  return {
    isValid: issues.length === 0,
    isBlurry: false,
    brightness: 0,
    contrast: 0,
    issues,
  };
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read jewellery image"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load jewellery image"));
    image.src = src;
  });
}
