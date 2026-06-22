// Category and Product types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface JewelleryProduct {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  preview: string;
  modelPath?: string;
  scale: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  placementArea: "ring" | "bracelet" | "bangle" | "necklace" | "pendant" | "earrings" | "watch" | "chain" | "nose_ring" | "mangalsutra";
}

// Landmark detection types
export interface FaceLandmarks {
  landmarks: Array<{ x: number; y: number; z: number }>;
  width: number;
  height: number;
  rotation: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  detected: boolean;
}

export interface HandLandmarks {
  landmarks: Array<{ x: number; y: number; z: number }>;
  hand: "left" | "right";
  detected: boolean;
  handedness: number;
}

export interface PoseLandmarks {
  landmarks: Array<{ x: number; y: number; z: number }>;
  detected: boolean;
}

export interface ImageSegmentation {
  hair: Uint8Array;
  face: Uint8Array;
  neck: Uint8Array;
  body: Uint8Array;
  hands: Uint8Array;
  detected: boolean;
}

// Processed image data
export interface ProcessedImage {
  original: HTMLImageElement;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  quality: ImageQuality;
}

export interface JewelleryAsset {
  original: HTMLImageElement;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  center: {
    x: number;
    y: number;
  };
  quality: ImageQuality;
  sourceFileName: string;
}

export interface ImageQuality {
  isValid: boolean;
  isBlurry: boolean;
  brightness: number;
  contrast: number;
  issues: string[];
}

// Try-on state
export interface TryOnState {
  product: JewelleryProduct | null;
  image: ProcessedImage | null;
  jewelleryAsset: JewelleryAsset | null;
  faceLandmarks: FaceLandmarks | null;
  handLandmarks: HandLandmarks[] | null;
  poseLandmarks: PoseLandmarks | null;
  segmentation: ImageSegmentation | null;
  controls: JewelleryControls;
  isProcessing: boolean;
  error: string | null;
}

export interface JewelleryControls {
  scale: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  zoom: number;
  pan: { x: number; y: number };
  showBefore: boolean;
  fullscreen: boolean;
  mirror?: boolean;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
