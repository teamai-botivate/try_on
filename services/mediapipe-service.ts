import type { FaceLandmarks, HandLandmarks, PoseLandmarks, ImageSegmentation } from "@/types";

let faceDetectorReady = false;
let handDetectorReady = false;
let poseDetectorReady = false;
let segmenterReady = false;

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
};

export async function initializeMediaPipe(): Promise<void> {
  try {
    // Load MediaPipe - use the correct UMD bundle
    await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js");

    // Face Landmarker
    if (!faceDetectorReady) {
      const { FaceLandmarker, FilesetResolver } = (window as any).Mediapipe;

      const facesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      (window as any).faceLandmarker = await FaceLandmarker.createFromOptions(facesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_classifier/mobilenet_v3_small/float32/1_metadata.tflite",
        },
        runningMode: "IMAGE",
        numFaces: 1,
      });

      faceDetectorReady = true;
    }

    // Hand Landmarker
    if (!handDetectorReady) {
      const { HandLandmarker, FilesetResolver } = (window as any).Mediapipe;

      const handsetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      (window as any).handLandmarker = await HandLandmarker.createFromOptions(handsetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16.tflite",
        },
        runningMode: "IMAGE",
        numHands: 2,
      });

      handDetectorReady = true;
    }

    // Pose Landmarker
    if (!poseDetectorReady) {
      const { PoseLandmarker, FilesetResolver } = (window as any).Mediapipe;

      const posesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      (window as any).poseLandmarker = await PoseLandmarker.createFromOptions(posesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16.tflite",
        },
        runningMode: "IMAGE",
      });

      poseDetectorReady = true;
    }

    // Image Segmenter
    if (!segmenterReady) {
      const { ImageSegmenter, FilesetResolver } = (window as any).Mediapipe;

      const segmentsetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      (window as any).imageSegmenter = await ImageSegmenter.createFromOptions(segmentsetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16.tflite",
        },
        runningMode: "IMAGE",
        outputCategoryMask: true,
      });

      segmenterReady = true;
    }
  } catch (error) {
    console.error("Failed to initialize MediaPipe:", error);
    throw new Error("MediaPipe initialization failed");
  }
}

export function detectFace(canvas: HTMLCanvasElement): FaceLandmarks | null {
  try {
    if (!faceDetectorReady || !(window as any).faceLandmarker) {
      return null;
    }

    const results = (window as any).faceLandmarker.detectForVideo(canvas, performance.now());

    if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
      return null;
    }

    const face = results.faceLandmarks[0];

    // Convert landmarks to normalized coordinates
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
    console.error("Face detection error:", error);
    return null;
  }
}

export function detectHands(canvas: HTMLCanvasElement): HandLandmarks[] | null {
  try {
    if (!handDetectorReady || !(window as any).handLandmarker) {
      return null;
    }

    const results = (window as any).handLandmarker.detectForVideo(canvas, performance.now());

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
        hand: results.handedness[index][0].categoryName === "Left" ? "left" : "right",
        detected: true,
        handedness: results.handedness[index][0].score,
      };
    });
  } catch (error) {
    console.error("Hand detection error:", error);
    return null;
  }
}

export function detectPose(canvas: HTMLCanvasElement): PoseLandmarks | null {
  try {
    if (!poseDetectorReady || !(window as any).poseLandmarker) {
      return null;
    }

    const results = (window as any).poseLandmarker.detectForVideo(canvas, performance.now());

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
    console.error("Pose detection error:", error);
    return null;
  }
}

export function segmentImage(canvas: HTMLCanvasElement): ImageSegmentation | null {
  try {
    if (!segmenterReady || !(window as any).imageSegmenter) {
      return null;
    }

    const results = (window as any).imageSegmenter.segmentForVideo(canvas, performance.now());

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
    console.error("Image segmentation error:", error);
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
  // Simplified head rotation estimation using landmark positions
  // This is a basic implementation; production code would use more sophisticated methods

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
