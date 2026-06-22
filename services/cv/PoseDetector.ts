'use client';

import type { PoseLandmarks as IPoseLandmarks } from '@/types';
import MediaPipeManager from './MediaPipeManager';

export async function detectPose(canvas: HTMLCanvasElement): Promise<IPoseLandmarks | null> {
  try {
    const manager = MediaPipeManager.getInstance();
    await manager.initialize();

    const landmarker = manager.getPoseLandmarker();
    if (!landmarker) {
      console.warn('PoseLandmarker not available');
      return null;
    }

    const results = landmarker.detect(canvas);

    if (!results.landmarks || results.landmarks.length === 0) {
      return null;
    }

    const landmarks = results.landmarks[0].map((lm: any) => ({
      x: lm.x * canvas.width,
      y: lm.y * canvas.height,
      z: lm.z || 0,
    }));

    return {
      landmarks,
      detected: true,
    };
  } catch (error) {
    console.error('Pose detection error:', error);
    return null;
  }
}
