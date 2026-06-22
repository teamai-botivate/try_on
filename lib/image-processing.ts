import type { ImageQuality, ProcessedImage } from "@/types";

export async function analyzeImageQuality(canvas: HTMLCanvasElement): Promise<ImageQuality> {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return {
      isValid: false,
      isBlurry: false,
      brightness: 0,
      contrast: 0,
      issues: ["Cannot access canvas context"],
    };
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Calculate brightness
  let brightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    brightness += (r + g + b) / 3;
  }
  brightness = brightness / (data.length / 4);

  // Calculate contrast
  const meanBrightness = brightness;
  let variance = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const pixelBrightness = (r + g + b) / 3;
    variance += Math.pow(pixelBrightness - meanBrightness, 2);
  }
  const contrast = Math.sqrt(variance / (data.length / 4));

  // Check blur using Laplacian
  const isBlurry = detectBlur(canvas);

  const issues: string[] = [];
  let isValid = true;

  if (canvas.width < 640 || canvas.height < 480) {
    issues.push("Image resolution is low. For best results, use at least 640x480.");
  }

  if (isBlurry) {
    issues.push("Image appears to be blurred. Results may be less accurate.");
  }

  if (brightness < 50) {
    issues.push("Image is too dark. Consider using a brighter photo.");
  } else if (brightness > 200) {
    issues.push("Image is too bright. Consider reducing overexposure.");
  }

  if (contrast < 20) {
    issues.push("Image has low contrast. Consider improving lighting conditions.");
  }

  return {
    isValid: isValid && !isBlurry,
    isBlurry,
    brightness: Math.round(brightness),
    contrast: Math.round(contrast),
    issues,
  };
}

function detectBlur(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  // Sample a region from the center of the image
  const sampleSize = 64;
  const startX = Math.max(0, (canvas.width - sampleSize) / 2);
  const startY = Math.max(0, (canvas.height - sampleSize) / 2);

  const imageData = ctx.getImageData(startX, startY, sampleSize, sampleSize);
  const data = imageData.data;

  // Simple Laplacian edge detection for blur detection
  let edgeCount = 0;
  const threshold = 30;

  for (let i = 1; i < data.length - 5; i += 4) {
    const current = (data[i - 4] + data[i] + data[i + 4]) / 3;
    const next = (data[i] + data[i + 4] + data[i + 8]) / 3;
    const laplacian = Math.abs(current - next);

    if (laplacian > threshold) {
      edgeCount++;
    }
  }

  const edgeRatio = edgeCount / (data.length / 4);
  return edgeRatio < 0.05;
}

export function correctImageOrientation(canvas: HTMLCanvasElement, orientation: number): HTMLCanvasElement {
  const { width, height } = canvas;
  const newCanvas = document.createElement("canvas");
  const ctx = newCanvas.getContext("2d");
  if (!ctx) return canvas;

  switch (orientation) {
    case 2: // Flip horizontal
      newCanvas.width = width;
      newCanvas.height = height;
      ctx.scale(-1, 1);
      ctx.drawImage(canvas, -width, 0);
      break;

    case 3: // Rotate 180
      newCanvas.width = width;
      newCanvas.height = height;
      ctx.rotate(Math.PI);
      ctx.drawImage(canvas, -width, -height);
      break;

    case 4: // Flip vertical
      newCanvas.width = width;
      newCanvas.height = height;
      ctx.scale(1, -1);
      ctx.drawImage(canvas, 0, -height);
      break;

    case 5: // Rotate 90 CW + Flip
      newCanvas.width = height;
      newCanvas.height = width;
      ctx.rotate((Math.PI / 2) * 1);
      ctx.scale(-1, 1);
      ctx.drawImage(canvas, -height, 0);
      break;

    case 6: // Rotate 90 CW
      newCanvas.width = height;
      newCanvas.height = width;
      ctx.rotate((Math.PI / 2) * 1);
      ctx.drawImage(canvas, 0, -width);
      break;

    case 7: // Rotate 90 CCW + Flip
      newCanvas.width = height;
      newCanvas.height = width;
      ctx.rotate((Math.PI / 2) * -1);
      ctx.scale(-1, 1);
      ctx.drawImage(canvas, 0, -height);
      break;

    case 8: // Rotate 90 CCW
      newCanvas.width = height;
      newCanvas.height = width;
      ctx.rotate((Math.PI / 2) * -1);
      ctx.drawImage(canvas, -width, 0);
      break;

    default:
      return canvas;
  }

  return newCanvas;
}

export function enhanceImageQuality(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Simple contrast enhancement and brightness adjustment
  const brightnessAdjust = 10;
  const contrastFactor = 1.1;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Contrast
    r = Math.min(255, Math.max(0, (r - 128) * contrastFactor + 128 + brightnessAdjust));
    g = Math.min(255, Math.max(0, (g - 128) * contrastFactor + 128 + brightnessAdjust));
    b = Math.min(255, Math.max(0, (b - 128) * contrastFactor + 128 + brightnessAdjust));

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export async function processImage(file: File): Promise<ProcessedImage> {
  // Read file
  const dataURL = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  // Create image
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = dataURL;
  });

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  ctx.drawImage(img, 0, 0);

  // Analyze quality
  const quality = await analyzeImageQuality(canvas);

  // Enhance if valid
  let processedCanvas = canvas;
  if (quality.isValid) {
    processedCanvas = enhanceImageQuality(canvas);
  }

  return {
    original: img,
    canvas: processedCanvas,
    width: canvas.width,
    height: canvas.height,
    quality,
  };
}
