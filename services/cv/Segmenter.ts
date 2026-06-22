'use client';

import type { ImageSegmentation as IImageSegmentation } from '@/types';
import MediaPipeManager from './MediaPipeManager';

export async function segmentImage(canvas: HTMLCanvasElement): Promise<IImageSegmentation | null> {
  try {
    const manager = MediaPipeManager.getInstance();
    await manager.initialize();

    const segmenter = manager.getImageSegmenter();
    if (!segmenter) {
      console.warn('ImageSegmenter not available');
      return null;
    }

    const results = segmenter.segment(canvas);

    if (!results.categoryMask) {
      return null;
    }

    const mask = results.categoryMask.getAsUint8Array();

    // Create separate masks for different body parts based on index
    const hair = new Uint8Array(mask.length);
    const face = new Uint8Array(mask.length);
    const neck = new Uint8Array(mask.length);
    const body = new Uint8Array(mask.length);
    const hands = new Uint8Array(mask.length);

    for (let i = 0; i < mask.length; i++) {
      const value = mask[i];
      if (value === 1) {
        body[i] = 255;
      }
    }

    return {
      hair,
      face,
      neck,
      body,
      hands,
      detected: true,
    };
  } catch (error) {
    console.error('Image segmentation error:', error);
    return null;
  }
}
