import { create } from "zustand";
import type { TryOnState, JewelleryProduct, ProcessedImage, JewelleryAsset, FaceLandmarks, HandLandmarks, PoseLandmarks, ImageSegmentation, JewelleryControls } from "@/types";

interface TryOnStore extends TryOnState {
  setProduct: (product: JewelleryProduct | null) => void;
  setImage: (image: ProcessedImage | null) => void;
  setJewelleryAsset: (asset: JewelleryAsset | null) => void;
  setFaceLandmarks: (landmarks: FaceLandmarks | null) => void;
  setHandLandmarks: (landmarks: HandLandmarks[] | null) => void;
  setPoseLandmarks: (landmarks: PoseLandmarks | null) => void;
  setSegmentation: (segmentation: ImageSegmentation | null) => void;
  setControls: (controls: Partial<JewelleryControls>) => void;
  resetControls: () => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const defaultControls: JewelleryControls = {
  scale: 1,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
  zoom: 1,
  pan: { x: 0, y: 0 },
  showBefore: false,
  fullscreen: false,
  mirror: false,
};

const defaultState: TryOnState = {
  product: null,
  image: null,
  jewelleryAsset: null,
  faceLandmarks: null,
  handLandmarks: null,
  poseLandmarks: null,
  segmentation: null,
  controls: defaultControls,
  isProcessing: false,
  error: null,
};

export const useTryOnStore = create<TryOnStore>((set) => ({
  ...defaultState,

  setProduct: (product) => set({ product }),
  setImage: (image) => set({ image }),
  setJewelleryAsset: (jewelleryAsset) => set({ jewelleryAsset }),
  setFaceLandmarks: (faceLandmarks) => set({ faceLandmarks }),
  setHandLandmarks: (handLandmarks) => set({ handLandmarks }),
  setPoseLandmarks: (poseLandmarks) => set({ poseLandmarks }),
  setSegmentation: (segmentation) => set({ segmentation }),

  setControls: (controls) =>
    set((state) => ({
      controls: { ...state.controls, ...controls },
    })),

  resetControls: () => set({ controls: { ...defaultControls } }),

  setProcessing: (isProcessing) => set({ isProcessing }),
  setError: (error) => set({ error }),

  reset: () => set(defaultState),
}));
