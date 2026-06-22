'use client';

// This file delegates to the modern CV module
// All legacy MediaPipe code has been removed and replaced with:
// /services/cv/MediaPipeManager.ts - Singleton manager with retry logic
// /services/cv/FaceDetector.ts - Face detection
// /services/cv/HandDetector.ts - Hand detection
// /services/cv/PoseDetector.ts - Pose detection
// /services/cv/Segmenter.ts - Image segmentation
// /services/cv/FilesetResolver.ts - Shared FilesetResolver instance

import { MediaPipeManager, getFilesetResolver, resetFilesetResolver } from './cv/index';
import { detectFace as detect_Face } from './cv/FaceDetector';
import { detectHands as detect_Hands } from './cv/HandDetector';
import { detectPose as detect_Pose } from './cv/PoseDetector';
import { segmentImage as segment_Image } from './cv/Segmenter';

export async function initializeMediaPipe(): Promise<void> {
  const manager = MediaPipeManager.getInstance();
  await manager.initialize();
}

export async function detectFace(canvas: HTMLCanvasElement) {
  return detect_Face(canvas);
}

export async function detectHands(canvas: HTMLCanvasElement) {
  return detect_Hands(canvas);
}

export async function detectPose(canvas: HTMLCanvasElement) {
  return detect_Pose(canvas);
}

export async function segmentImage(canvas: HTMLCanvasElement) {
  return segment_Image(canvas);
}

export function cleanup() {
  const manager = MediaPipeManager.getInstance();
  manager.cleanup();
}

export { MediaPipeManager, getFilesetResolver, resetFilesetResolver };
