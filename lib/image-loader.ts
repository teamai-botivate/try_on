import type { Category, JewelleryProduct } from "@/types";

export async function loadCategories(): Promise<Category[]> {
  try {
    const response = await fetch("/data/categories.json");
    if (!response.ok) throw new Error("Failed to load categories");
    return await response.json();
  } catch (error) {
    console.error("Error loading categories:", error);
    return [];
  }
}

export async function loadProducts(): Promise<JewelleryProduct[]> {
  try {
    const response = await fetch("/data/products.json");
    if (!response.ok) throw new Error("Failed to load products");
    return await response.json();
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
}

export async function loadProductsByCategory(categorySlug: string): Promise<JewelleryProduct[]> {
  const products = await loadProducts();
  return products.filter((p) => p.category === categorySlug);
}

export async function loadProductById(productId: string): Promise<JewelleryProduct | null> {
  const products = await loadProducts();
  return products.find((p) => p.id === productId) || null;
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function dataURLToImage(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataURL;
  });
}

export function createCanvasFromImage(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  ctx.drawImage(image, 0, 0);
  return canvas;
}

export const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return { valid: false, error: "Unsupported image format. Please use JPEG, PNG, or WebP." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "Image size exceeds 20MB limit." };
  }

  return { valid: true };
}
