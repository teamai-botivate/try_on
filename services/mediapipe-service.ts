'use client';

import type { FaceLandmarks, HandLandmarks, PoseLandmarks, ImageSegmentation } from "@/types";

// Lazy-loaded instances - only on client side
let faceLandmarker: any = null;
let handLandmarker: any = null;
let poseLandmarker: any = null;
let imageSegmenter: any = null;

let initPromise: Promise<void> | null = null;

const isClient = typeof window !== 'undefined';

async function initializeFaceLandmarker() {
  if (faceLandmarker) return;

  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

  const filesetResolver = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    numFaces: 1,
  });
}

async function initializeHandLandmarker() {
  if (handLandmarker) return;

  const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

  const filesetResolver = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
  );

  handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    numHands: 2,
  });
}

async function initializePoseLandmarker() {
  if (poseLandmarker) return;

  const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

  const filesetResolver = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
  });
}

async function initializeImageSegmenter() {
  if (imageSegmenter) return;

  const { ImageSegmenter, FilesetResolver } = await import('@mediapipe/tasks-vision');

  const filesetResolver = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
  );

  imageSegmenter = await ImageSegmenter.createFromOptions(filesetResolver, {
    baseOptions: {
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    outputCategoryMask: true,
    outputConfidenceMasks: false,
  });
}

export async function initializeMediaPipe(): Promise<void> {
  if (!isClient) return;

  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Initialize all detectors in parallel
      await Promise.all([
        initializeFaceLandmarker(),
        initializeHandLandmarker(),
        initializePoseLandmarker(),
        initializeImageSegmenter(),
      ]);
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
      // Reset promise so next call can retry
      initPromise = null;
      throw new Error(`MediaPipe initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  })();

  return initPromise;
}

export function detectFace(canvas: HTMLCanvasElement): FaceLandmarks | null {
  try {
    if (!faceLandmarker || !isClient) {
      return null;
    }

    const results = faceLandmarker.detect(canvas);

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

export function detectHands(canvas: HTMLCanvasElement): HandLandmarks[] | null {
  try {
    if (!handLandmarker || !isClient) {
      return null;
    }

    const results = handLandmarker.detect(canvas);

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

export function detectPose(canvas: HTMLCanvasElement): PoseLandmarks | null {
  try {
    if (!poseLandmarker || !isClient) {
      return null;
    }

    const results = poseLandmarker.detect(canvas);

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

export function segmentImage(canvas: HTMLCanvasElement): ImageSegmentation | null {
  try {
    if (!imageSegmenter || !isClient) {
      return null;
    }

    const results = imageSegmenter.segment(canvas);

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
      // Index 0 is background, 1 is person
      // Further refinement would need more specific segmentation
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
  // Use specific landmarks for rotation calculation
  const noseTip = landmarks[1]; // Nose tip
  const rightEye = landmarks[33]; // Right eye outer corner
  const leftEye = landmarks[263]; // Left eye outer corner
  const rightMouth = landmarks[61]; // Right mouth corner
  const leftMouth = landmarks[291]; // Left mouth corner

  // Calculate angles
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

export function cleanup() {
  if (isClient) {
    faceLandmarker = null;
    handLandmarker = null;
    poseLandmarker = null;
    imageSegmenter = null;
    initPromise = null;
  }
}
