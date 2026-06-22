"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { FaceLandmarks, HandLandmarks, JewelleryAsset, JewelleryProduct, PoseLandmarks } from "@/types";
import { useTryOnStore } from "@/lib/store";
import MediaPipeManager from "@/services/cv/MediaPipeManager";

interface PreviewCanvasProps {
  product: JewelleryProduct;
  asset: JewelleryAsset;
}

interface Placement {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export default function PreviewCanvas({ product, asset }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastFrameTimeRef = useRef(0);

  const [cameraState, setCameraState] = useState<"idle" | "starting" | "live" | "error">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState("Camera not started");

  const controls = useTryOnStore((state) => state.controls);
  const setFaceLandmarks = useTryOnStore((state) => state.setFaceLandmarks);
  const setHandLandmarks = useTryOnStore((state) => state.setHandLandmarks);
  const setPoseLandmarks = useTryOnStore((state) => state.setPoseLandmarks);

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraState("starting");
      setCameraError(null);
      setDetectionStatus("Requesting camera permission...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setDetectionStatus("Loading realtime landmark models...");
      await MediaPipeManager.getInstance().initialize();
      setCameraState("live");
    } catch (error) {
      stopCamera();
      setCameraState("error");
      setCameraError(error instanceof Error ? error.message : "Camera permission failed");
    }
  }, [stopCamera]);

  useEffect(() => {
    if (cameraState !== "live") return;

    const renderFrame = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas?.getContext("2d");

      if (!canvas || !video || !ctx || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(video, 0, 0, width, height);

      let face: FaceLandmarks | null = null;
      let hands: HandLandmarks[] | null = null;
      let pose: PoseLandmarks | null = null;

      const now = performance.now();
      if (now - lastFrameTimeRef.current > 90) {
        lastFrameTimeRef.current = now;
        const manager = MediaPipeManager.getInstance();

        face = readFaceLandmarks(manager.getFaceLandmarker(), video, now, width, height);
        hands = readHandLandmarks(manager.getHandLandmarker(), video, now, width, height);
        pose = readPoseLandmarks(manager.getPoseLandmarker(), video, now, width, height);

        setFaceLandmarks(face);
        setHandLandmarks(hands);
        setPoseLandmarks(pose);
      }

      const placements = calculatePlacements(product, asset, controls, width, height, face, hands, pose);

      if (!controls.showBefore) {
        placements.forEach((placement) => drawAsset(ctx, asset, placement, controls.mirror));
      }

      setDetectionStatus(getDetectionStatus(product.placementArea, face, hands, pose));
      animationRef.current = requestAnimationFrame(renderFrame);
    };

    animationRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [asset, cameraState, controls, product, setFaceLandmarks, setHandLandmarks, setPoseLandmarks]);

  useEffect(() => stopCamera, [stopCamera]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="relative bg-gray-100 rounded-lg overflow-hidden w-full">
      <video ref={videoRef} playsInline muted className="hidden" />

      <div className="relative w-full bg-gray-950 flex items-center justify-center" style={{ aspectRatio: "16 / 9", minHeight: "320px" }}>
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {cameraState !== "live" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 text-white p-4">
            <div className="text-center max-w-sm space-y-3">
              <p className="text-base sm:text-lg font-semibold">Realtime camera try-on</p>
              <p className="text-xs sm:text-sm text-gray-300">
                Camera permission is required to detect your face, hands, neck, and pose for AR placement.
              </p>
              {cameraError && <p className="text-xs sm:text-sm text-red-300">{cameraError}</p>}
              <button onClick={startCamera} disabled={cameraState === "starting"} className="btn-primary w-full">
                {cameraState === "starting" ? "Starting Camera..." : "Allow Camera"}
              </button>
            </div>
          </div>
        )}

        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white text-xs sm:text-sm bg-black/50 px-2 sm:px-3 py-1 sm:py-2 rounded z-20">
          {controls.showBefore ? "Before" : detectionStatus}
        </div>
      </div>
    </motion.div>
  );
}

function readFaceLandmarks(landmarker: any, video: HTMLVideoElement, timestamp: number, width: number, height: number): FaceLandmarks | null {
  try {
    const results = landmarker?.detectForVideo(video, timestamp);
    if (!results?.faceLandmarks?.length) return null;

    const landmarks = results.faceLandmarks[0].map((point: any) => ({
      x: point.x * width,
      y: point.y * height,
      z: point.z || 0,
    }));

    return { landmarks, width, height, rotation: { pitch: 0, roll: 0, yaw: 0 }, detected: true };
  } catch {
    return null;
  }
}

function readHandLandmarks(landmarker: any, video: HTMLVideoElement, timestamp: number, width: number, height: number): HandLandmarks[] | null {
  try {
    const results = landmarker?.detectForVideo(video, timestamp);
    if (!results?.landmarks?.length) return null;

    return results.landmarks.map((hand: any, index: number) => ({
      landmarks: hand.map((point: any) => ({
        x: point.x * width,
        y: point.y * height,
        z: point.z || 0,
      })),
      hand: results.handedness?.[index]?.[0]?.categoryName === "Left" ? "left" : "right",
      detected: true,
      handedness: results.handedness?.[index]?.[0]?.score || 0,
    }));
  } catch {
    return null;
  }
}

function readPoseLandmarks(landmarker: any, video: HTMLVideoElement, timestamp: number, width: number, height: number): PoseLandmarks | null {
  try {
    const results = landmarker?.detectForVideo(video, timestamp);
    if (!results?.landmarks?.length) return null;

    return {
      landmarks: results.landmarks[0].map((point: any) => ({
        x: point.x * width,
        y: point.y * height,
        z: point.z || 0,
      })),
      detected: true,
    };
  } catch {
    return null;
  }
}

function calculatePlacements(
  product: JewelleryProduct,
  asset: JewelleryAsset,
  controls: ReturnType<typeof useTryOnStore.getState>["controls"],
  width: number,
  height: number,
  face: FaceLandmarks | null,
  hands: HandLandmarks[] | null,
  pose: PoseLandmarks | null
): Placement[] {
  const aspect = asset.width / asset.height;
  const base = createFallbackPlacement(width, height, aspect, controls);

  switch (product.placementArea) {
    case "ring":
      return [placeOnHand(hands, base, aspect, controls, 0.22)];
    case "bracelet":
    case "bangle":
    case "watch":
      return [placeOnHand(hands, base, aspect, controls, 0.42)];
    case "earrings":
      return placeEarrings(face, base, aspect, controls);
    case "nose_ring":
      return [placeNoseRing(face, base, aspect, controls)];
    case "necklace":
    case "chain":
    case "pendant":
    case "mangalsutra":
      return [placeOnNeck(product.placementArea, pose, face, base, aspect, controls)];
    default:
      return [base];
  }
}

function createFallbackPlacement(width: number, height: number, aspect: number, controls: ReturnType<typeof useTryOnStore.getState>["controls"]): Placement {
  const assetWidth = Math.min(width, height) * 0.28 * controls.scale;
  return {
    x: width / 2 + controls.offsetX,
    y: height / 2 + controls.offsetY,
    width: assetWidth,
    height: assetWidth / aspect,
    rotation: controls.rotationZ,
  };
}

function placeOnNeck(
  area: JewelleryProduct["placementArea"],
  pose: PoseLandmarks | null,
  face: FaceLandmarks | null,
  fallback: Placement,
  aspect: number,
  controls: ReturnType<typeof useTryOnStore.getState>["controls"]
): Placement {
  const leftShoulder = pose?.landmarks[11];
  const rightShoulder = pose?.landmarks[12];

  if (leftShoulder && rightShoulder) {
    const shoulderWidth = distance(leftShoulder, rightShoulder);
    const centerX = (leftShoulder.x + rightShoulder.x) / 2;
    const centerY = (leftShoulder.y + rightShoulder.y) / 2;
    const assetWidth = shoulderWidth * (area === "pendant" ? 0.34 : 0.72) * controls.scale;
    const rotation = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);

    return {
      x: centerX + controls.offsetX,
      y: centerY + shoulderWidth * (area === "pendant" ? 0.18 : 0.04) + controls.offsetY,
      width: assetWidth,
      height: assetWidth / aspect,
      rotation: rotation + controls.rotationZ,
    };
  }

  if (face?.landmarks.length) {
    const bounds = boundsForPoints(face.landmarks);
    const assetWidth = bounds.width * (area === "pendant" ? 0.42 : 0.95) * controls.scale;
    return {
      x: bounds.x + bounds.width / 2 + controls.offsetX,
      y: bounds.y + bounds.height * 1.16 + controls.offsetY,
      width: assetWidth,
      height: assetWidth / aspect,
      rotation: controls.rotationZ,
    };
  }

  return fallback;
}

function placeOnHand(
  hands: HandLandmarks[] | null,
  fallback: Placement,
  aspect: number,
  controls: ReturnType<typeof useTryOnStore.getState>["controls"],
  multiplier: number
): Placement {
  const hand = hands?.[0];
  const wrist = hand?.landmarks[0];
  const middleBase = hand?.landmarks[9];
  const ringBase = hand?.landmarks[13] || middleBase;
  const anchor = multiplier < 0.3 ? ringBase : wrist;

  if (!hand || !wrist || !middleBase || !anchor) return fallback;

  const handSize = distance(wrist, middleBase);
  const assetWidth = handSize * multiplier * 4 * controls.scale;

  return {
    x: anchor.x + controls.offsetX,
    y: anchor.y + controls.offsetY,
    width: assetWidth,
    height: assetWidth / aspect,
    rotation: Math.atan2(middleBase.y - wrist.y, middleBase.x - wrist.x) + Math.PI / 2 + controls.rotationZ,
  };
}

function placeEarrings(
  face: FaceLandmarks | null,
  fallback: Placement,
  aspect: number,
  controls: ReturnType<typeof useTryOnStore.getState>["controls"]
): Placement[] {
  if (!face?.landmarks.length) return [fallback];

  const bounds = boundsForPoints(face.landmarks);
  const assetWidth = bounds.width * 0.13 * controls.scale;
  const y = bounds.y + bounds.height * 0.47 + controls.offsetY;

  return [
    { x: bounds.x + bounds.width * 0.07 + controls.offsetX, y, width: assetWidth, height: assetWidth / aspect, rotation: controls.rotationZ },
    { x: bounds.x + bounds.width * 0.93 + controls.offsetX, y, width: assetWidth, height: assetWidth / aspect, rotation: controls.rotationZ },
  ];
}

function placeNoseRing(
  face: FaceLandmarks | null,
  fallback: Placement,
  aspect: number,
  controls: ReturnType<typeof useTryOnStore.getState>["controls"]
): Placement {
  if (!face?.landmarks.length) return fallback;

  const bounds = boundsForPoints(face.landmarks);
  const assetWidth = bounds.width * 0.08 * controls.scale;

  return {
    x: bounds.x + bounds.width * 0.58 + controls.offsetX,
    y: bounds.y + bounds.height * 0.54 + controls.offsetY,
    width: assetWidth,
    height: assetWidth / aspect,
    rotation: controls.rotationZ,
  };
}

function drawAsset(ctx: CanvasRenderingContext2D, asset: JewelleryAsset, placement: Placement, mirror?: boolean) {
  ctx.save();
  ctx.translate(placement.x, placement.y);
  ctx.rotate(placement.rotation);

  if (mirror) {
    ctx.scale(-1, 1);
    ctx.drawImage(asset.canvas, -placement.width / 2 * -1, -placement.height / 2, placement.width, placement.height);
  } else {
    ctx.drawImage(asset.canvas, -placement.width / 2, -placement.height / 2, placement.width, placement.height);
  }

  ctx.restore();
}

function getDetectionStatus(area: JewelleryProduct["placementArea"], face: FaceLandmarks | null, hands: HandLandmarks[] | null, pose: PoseLandmarks | null) {
  if (["ring", "bracelet", "bangle", "watch"].includes(area)) {
    return hands?.length ? "Hand tracking live" : "Show your hand or wrist";
  }

  if (["necklace", "chain", "pendant", "mangalsutra"].includes(area)) {
    return pose?.detected || face?.detected ? "Neck and pose tracking live" : "Show face, neck, and shoulders";
  }

  return face?.detected ? "Face tracking live" : "Show your face";
}

function boundsForPoints(points: Array<{ x: number; y: number }>) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
