'use client';

import type { HandLandmarks as IHandLandmarks } from '@/types';
import MediaPipeManager from './MediaPipeManager';

export async function detectHands(canvas: HTMLCanvasElement): Promise<IHandLandmarks[] | null> {
  try {
    const manager = MediaPipeManager.getInstance();
    await manager.initialize();

    const landmarker = manager.getHandLandmarker();
    if (!landmarker) {
      console.warn('HandLandmarker not available');
      return null;
    }

    const results = landmarker.detectForVideo(canvas, performance.now());

    if (!results.landmarks || results.landmarks.length === 0) {
      return null;
    }

    return results.landmarks.map((hand: any, index: number) => {
      const landmarks = hand.map((lm: any) => ({
        x: lm.x * canvas.width,
        y: lm.y * canvas.height,
        z: lm.z || 0,
      }));

      return {
        landmarks,
        hand: results.handedness[index][0].categoryName === 'Left' ? 'left' : 'right',
        detected: true,
        handedness: results.handedness[index][0].score,
      };
    });
  } catch (error) {
    console.error('Hand detection error:', error);
    return null;
  }
}
