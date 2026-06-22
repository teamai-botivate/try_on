import { useState, useCallback } from "react";
import { initializeMediaPipe, detectFace, detectHands, detectPose } from "@/services/mediapipe-service";
import type { FaceLandmarks, HandLandmarks, PoseLandmarks } from "@/types";

interface UseLandmarkDetectionOptions {
  detectFace?: boolean;
  detectHands?: boolean;
  detectPose?: boolean;
  onComplete?: () => void;
}

export function useLandmarkDetection(
  canvas: HTMLCanvasElement | null,
  options?: UseLandmarkDetectionOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null);
  const [handLandmarks, setHandLandmarks] = useState<HandLandmarks[] | null>(null);
  const [poseLandmarks, setPoseLandmarks] = useState<PoseLandmarks | null>(null);

  const {
    detectFace: shouldDetectFace = true,
    detectHands: shouldDetectHands = true,
    detectPose: shouldDetectPose = true,
    onComplete,
  } = options || {};

  const detect = useCallback(async () => {
    if (!canvas) return;

    try {
      setLoading(true);
      setError(null);

      await initializeMediaPipe();

      if (shouldDetectFace) {
        const face = detectFace(canvas);
        setFaceLandmarks(face);
      }

      if (shouldDetectHands) {
        const hands = detectHands(canvas);
        setHandLandmarks(hands);
      }

      if (shouldDetectPose) {
        const pose = detectPose(canvas);
        setPoseLandmarks(pose);
      }

      onComplete?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Detection failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [canvas, shouldDetectFace, shouldDetectHands, shouldDetectPose, onComplete]);

  const reset = useCallback(() => {
    setFaceLandmarks(null);
    setHandLandmarks(null);
    setPoseLandmarks(null);
    setError(null);
  }, []);

  return {
    faceLandmarks,
    handLandmarks,
    poseLandmarks,
    loading,
    error,
    detect,
    reset,
  };
}
