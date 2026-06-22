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
