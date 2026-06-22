'use client';

import type { FaceLandmarks as IFaceLandmarks } from '@/types';
import MediaPipeManager from './MediaPipeManager';

export async function detectFace(canvas: HTMLCanvasElement): Promise<IFaceLandmarks | null> {
  try {
    const manager = MediaPipeManager.getInstance();
    await manager.initialize();

    const landmarker = manager.getFaceLandmarker();
    if (!landmarker) {
      console.warn('FaceLandmarker not available');
      return null;
    }

    const results = landmarker.detectForVideo(canvas, performance.now());

    if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
      return null;
    }

    const face = results.faceLandmarks[0];

    // Convert landmarks to pixel coordinates
    const landmarks = face.map((lm: any) => ({
      x: lm.x * canvas.width,
      y: lm.y * canvas.height,
      z: lm.z || 0,
    }));

    // Extract face dimensions and rotation
    const faceBoundingBox = calculateBoundingBox(landmarks);
    const rotation = estimateHeadRotation(landmarks);

    return {
      landmarks,
      width: faceBoundingBox.width,
      height: faceBoundingBox.height,
      rotation,
      detected: true,
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
}

function calculateBoundingBox(
  landmarks: Array<{ x: number; y: number; z: number }>
): { width: number; height: number } {
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  landmarks.forEach((lm) => {
    minX = Math.min(minX, lm.x);
    maxX = Math.max(maxX, lm.x);
    minY = Math.min(minY, lm.y);
    maxY = Math.max(maxY, lm.y);
  });

  return {
    width: maxX - minX,
    height: maxY - minY,
  };
}

function estimateHeadRotation(landmarks: Array<{ x: number; y: number; z: number }>): { pitch: number; roll: number; yaw: number } {
  const noseTip = landmarks[1];
  const rightEye = landmarks[33];
  const leftEye = landmarks[263];
  const rightMouth = landmarks[61];
  const leftMouth = landmarks[291];

  const eyeDistance = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);

  const yaw = Math.atan2(noseTip.x - (leftEye.x + rightEye.x) / 2, eyeDistance);
  const pitch = Math.atan2(noseTip.y - (leftEye.y + rightEye.y) / 2, eyeDistance);

  const roll =
    Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) +
    Math.atan2(rightMouth.y - leftMouth.y, rightMouth.x - leftMouth.x);

  return {
    pitch: pitch * (180 / Math.PI),
    roll: roll * (180 / Math.PI),
    yaw: yaw * (180 / Math.PI),
  };
}
