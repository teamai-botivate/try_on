/**
 * Validation utilities
 */

export function isValidNumber(value: any): value is number {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}

export function isValidArray(value: any): value is any[] {
  return Array.isArray(value) && value.length > 0;
}

export function isValidObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateDimensions(
  width: number,
  height: number,
  minWidth = 640,
  minHeight = 480
): { valid: boolean; error?: string } {
  if (!isValidNumber(width) || !isValidNumber(height)) {
    return { valid: false, error: "Invalid dimensions" };
  }

  if (width < minWidth || height < minHeight) {
    return { valid: false, error: `Image must be at least ${minWidth}x${minHeight}` };
  }

  return { valid: true };
}

export function validateFileSize(
  size: number,
  maxSize = 20 * 1024 * 1024
): { valid: boolean; error?: string } {
  if (!isValidNumber(size)) {
    return { valid: false, error: "Invalid file size" };
  }

  if (size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` };
  }

  return { valid: true };
}
