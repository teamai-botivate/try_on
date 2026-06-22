"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ProcessedImage, FaceLandmarks, HandLandmarks, PoseLandmarks } from "@/types";
import { useTryOnStore } from "@/lib/store";

interface PreviewCanvasProps {
  image: ProcessedImage;
  faceLandmarks: FaceLandmarks | null;
  handLandmarks: HandLandmarks[] | null;
  poseLandmarks: PoseLandmarks | null;
  isProcessing: boolean;
}

export default function PreviewCanvas({
  image,
  faceLandmarks,
  handLandmarks,
  poseLandmarks,
  isProcessing,
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const controls = useTryOnStore((state) => state.controls);
  const showBefore = controls.showBefore;

  // Calculate responsive canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const aspectRatio = image.width / image.height;
      const maxHeight = 600;

      let width = containerWidth - 32; // Account for padding
      let height = width / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [image.width, image.height]);

  // Draw preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Draw image
    ctx.drawImage(image.canvas, 0, 0, dimensions.width, dimensions.height);

    // Draw landmarks if debugging
    if (!showBefore && faceLandmarks?.detected) {
      drawFaceLandmarks(ctx, faceLandmarks, image.width, image.height, dimensions.width, dimensions.height);
    }

    if (!showBefore && handLandmarks) {
      drawHandLandmarks(ctx, handLandmarks, image.width, image.height, dimensions.width, dimensions.height);
    }
  }, [image, dimensions, faceLandmarks, handLandmarks, showBefore]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative bg-gray-100 rounded-lg overflow-hidden w-full"
    >
      <div
        className="relative w-full bg-gray-100 flex items-center justify-center"
        style={{ aspectRatio: `${image.width} / ${image.height}`, minHeight: "300px", maxHeight: "600px" }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-white text-xs sm:text-sm font-medium">Processing...</p>
            </div>
          </div>
        )}

        {/* Toggle Info - Safe positioning */}
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white text-xs sm:text-sm bg-black/40 px-2 sm:px-3 py-1 sm:py-2 rounded z-20">
          {showBefore ? "Before" : "After"}
        </div>
      </div>
    </motion.div>
  );
}

function drawFaceLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarks,
  imageW: number,
  imageH: number,
  canvasW: number,
  canvasH: number
) {
  const scaleX = canvasW / imageW;
  const scaleY = canvasH / imageH;

  // Draw face outline
  ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
  ctx.lineWidth = 1;

  landmarks.landmarks.slice(0, 10).forEach((point, i) => {
    const x = point.x * scaleX;
    const y = point.y * scaleY;

    if (i === 0) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}

function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  hands: HandLandmarks[],
  imageW: number,
  imageH: number,
  canvasW: number,
  canvasH: number
) {
  const scaleX = canvasW / imageW;
  const scaleY = canvasH / imageH;

  hands.forEach((hand) => {
    ctx.strokeStyle = hand.hand === "left" ? "rgba(100, 200, 255, 0.5)" : "rgba(255, 100, 200, 0.5)";
    ctx.lineWidth = 1;

    // Draw palm
    hand.landmarks.slice(0, 5).forEach((point, i) => {
      const x = point.x * scaleX;
      const y = point.y * scaleY;

      if (i === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  });
}
