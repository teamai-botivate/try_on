'use client';

import type { FaceLandmarker, HandLandmarker, PoseLandmarker, ImageSegmenter } from '@mediapipe/tasks-vision';
import { getFilesetResolver, resetFilesetResolver } from './FilesetResolver';

const MODEL_ASSET_PATHS = {
  faceLandmarker:
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  handLandmarker:
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  poseLandmarker:
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
  imageSegmenter:
    'https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite',
} as const;

interface InitializationState {
  faceLandmarker: FaceLandmarker | null;
  handLandmarker: HandLandmarker | null;
  poseLandmarker: PoseLandmarker | null;
  imageSegmenter: ImageSegmenter | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
}

class MediaPipeManager {
  private static instance: MediaPipeManager | null = null;
  private state: InitializationState = {
    faceLandmarker: null,
    handLandmarker: null,
    poseLandmarker: null,
    imageSegmenter: null,
    isInitialized: false,
    isInitializing: false,
    error: null,
  };
  private initPromise: Promise<void> | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private isClient = typeof window !== 'undefined';

  static getInstance(): MediaPipeManager {
    if (!MediaPipeManager.instance) {
      MediaPipeManager.instance = new MediaPipeManager();
    }
    return MediaPipeManager.instance;
  }

  async initialize(): Promise<void> {
    if (!this.isClient) {
      throw new Error('MediaPipe can only be initialized on the client side');
    }

    if (this.state.isInitialized) {
      return;
    }

    if (this.state.isInitializing) {
      if (this.initPromise) {
        return this.initPromise;
      }
      throw new Error('Initialization is in progress');
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      this.state.isInitializing = true;
      this.state.error = null;

      const filesetResolver = await getFilesetResolver();

      // Initialize all detectors in parallel
      const [faceLandmarker, handLandmarker, poseLandmarker, imageSegmenter] = await Promise.all([
        this.initializeFaceLandmarker(filesetResolver),
        this.initializeHandLandmarker(filesetResolver),
        this.initializePoseLandmarker(filesetResolver),
        this.initializeImageSegmenter(filesetResolver),
      ]);

      this.state.faceLandmarker = faceLandmarker;
      this.state.handLandmarker = handLandmarker;
      this.state.poseLandmarker = poseLandmarker;
      this.state.imageSegmenter = imageSegmenter;
      this.state.isInitialized = true;
      this.retryCount = 0;
      console.log('✅ MediaPipe initialized successfully');
    } catch (error) {
      this.state.error = error instanceof Error ? error : new Error(String(error));

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.warn(`MediaPipe initialization failed, retrying (${this.retryCount}/${this.maxRetries}):`, error);
        this.state.isInitializing = false;
        this.initPromise = null;

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, this.retryCount) * 1000));
        return this.performInitialization();
      }

      console.error('MediaPipe initialization failed after retries:', error);
      this.state.isInitializing = false;
      throw error;
    } finally {
      if (this.state.isInitialized) {
        this.state.isInitializing = false;
      }
    }
  }

  private async initializeFaceLandmarker(filesetResolver: any): Promise<FaceLandmarker> {
    const { FaceLandmarker } = await import('@mediapipe/tasks-vision');

    return FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: MODEL_ASSET_PATHS.faceLandmarker,
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numFaces: 1,
    });
  }

  private async initializeHandLandmarker(filesetResolver: any): Promise<HandLandmarker> {
    const { HandLandmarker } = await import('@mediapipe/tasks-vision');

    return HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: MODEL_ASSET_PATHS.handLandmarker,
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numHands: 2,
    });
  }

  private async initializePoseLandmarker(filesetResolver: any): Promise<PoseLandmarker> {
    const { PoseLandmarker } = await import('@mediapipe/tasks-vision');

    return PoseLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: MODEL_ASSET_PATHS.poseLandmarker,
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
    });
  }

  private async initializeImageSegmenter(filesetResolver: any): Promise<ImageSegmenter> {
    const { ImageSegmenter } = await import('@mediapipe/tasks-vision');

    return ImageSegmenter.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: MODEL_ASSET_PATHS.imageSegmenter,
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    });
  }

  getFaceLandmarker(): FaceLandmarker | null {
    if (!this.state.isInitialized) {
      return null;
    }
    return this.state.faceLandmarker;
  }

  getHandLandmarker(): HandLandmarker | null {
    if (!this.state.isInitialized) {
      return null;
    }
    return this.state.handLandmarker;
  }

  getPoseLandmarker(): PoseLandmarker | null {
    if (!this.state.isInitialized) {
      return null;
    }
    return this.state.poseLandmarker;
  }

  getImageSegmenter(): ImageSegmenter | null {
    if (!this.state.isInitialized) {
      return null;
    }
    return this.state.imageSegmenter;
  }

  isReady(): boolean {
    return this.state.isInitialized;
  }

  getState(): InitializationState {
    return { ...this.state };
  }

  cleanup(): void {
    this.state.faceLandmarker = null;
    this.state.handLandmarker = null;
    this.state.poseLandmarker = null;
    this.state.imageSegmenter = null;
    this.state.isInitialized = false;
    this.state.isInitializing = false;
    this.state.error = null;
    this.initPromise = null;
    this.retryCount = 0;
    resetFilesetResolver();
  }

  reset(): void {
    MediaPipeManager.instance = null;
    this.cleanup();
  }
}

export default MediaPipeManager;
