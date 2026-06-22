'use client';

// This file now delegates to the modern CV module
// All legacy MediaPipe code has been removed and replaced with:
// /services/cv/MediaPipeManager.ts - Singleton manager with retry logic
// /services/cv/FaceDetector.ts - Face detection
// /services/cv/HandDetector.ts - Hand detection
// /services/cv/PoseDetector.ts - Pose detection
// /services/cv/Segmenter.ts - Image segmentation
// /services/cv/FilesetResolver.ts - Shared FilesetResolver instance

export { MediaPipeManager, getFilesetResolver, resetFilesetResolver, detectFace, detectHands, detectPose, segmentImage } from './cv/index';

// For backward compatibility, also provide the individual functions
import { detectFace as detect_Face, detectHands as detect_Hands, detectPose as detect_Pose, segmentImage as segment_Image, MediaPipeManager } from './cv/index';

export async function initializeMediaPipe(): Promise<void> {
  const manager = MediaPipeManager.getInstance();
  await manager.initialize();
}

export function detectFace(canvas: HTMLCanvasElement) {
  return detect_Face(canvas);
}

export function detectHands(canvas: HTMLCanvasElement) {
  return detect_Hands(canvas);
}

export function detectPose(canvas: HTMLCanvasElement) {
  return detect_Pose(canvas);
}

export function segmentImage(canvas: HTMLCanvasElement) {
  return segment_Image(canvas);
}

export function cleanup() {
  const manager = MediaPipeManager.getInstance();
  manager.cleanup();
}
