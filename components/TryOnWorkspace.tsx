"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { JewelleryProduct } from "@/types";
import { useTryOnStore } from "@/lib/store";
import { initializeMediaPipe, detectFace, detectHands, detectPose } from "@/services/mediapipe-service";
import PreviewCanvas from "./PreviewCanvas";
import ControlPanel from "./ControlPanel";
import QualityWarnings from "./QualityWarnings";

interface TryOnWorkspaceProps {
  product: JewelleryProduct;
}

export default function TryOnWorkspace({ product }: TryOnWorkspaceProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedControls, setExpandedControls] = useState(false);

  const image = useTryOnStore((state) => state.image);
  const setFaceLandmarks = useTryOnStore((state) => state.setFaceLandmarks);
  const setHandLandmarks = useTryOnStore((state) => state.setHandLandmarks);
  const setPoseLandmarks = useTryOnStore((state) => state.setPoseLandmarks);
  const faceLandmarks = useTryOnStore((state) => state.faceLandmarks);
  const handLandmarks = useTryOnStore((state) => state.handLandmarks);
  const poseLandmarks = useTryOnStore((state) => state.poseLandmarks);

  // Initialize MediaPipe and detect landmarks
  useEffect(() => {
    const processImage = async () => {
      if (!image) return;

      try {
        setIsProcessing(true);
        setError(null);

        // Initialize MediaPipe
        await initializeMediaPipe();

        // Detect landmarks
        const face = detectFace(image.canvas);
        const hands = detectHands(image.canvas);
        const pose = detectPose(image.canvas);

        setFaceLandmarks(face);
        setHandLandmarks(hands);
        setPoseLandmarks(pose);

        // Validate detection
        const placementArea = product.placementArea;
        let detectError: string | null = null;

        if (["earrings", "necklace", "chain", "pendant", "nose_ring", "mangalsutra"].includes(placementArea) && !face) {
          detectError = "Face detection failed. Please use a clear photo with a visible face.";
        }

        if (["ring", "bracelet", "bangle", "watch"].includes(placementArea) && !hands) {
          detectError = "Hand detection failed. Please ensure your hands are visible in the photo.";
        }

        if (detectError) {
          setError(detectError);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Detection failed";
        setError(message);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [image, product.placementArea, setFaceLandmarks, setHandLandmarks, setPoseLandmarks]);

  if (!image) {
    return (
      <div className="text-center py-12 sm:py-16 md:py-20 w-full">
        <p className="text-gray-600 text-base sm:text-lg">No image uploaded</p>
      </div>
    );
  }

  const showQualityWarnings = image.quality.issues.length > 0 && image.quality.isValid;

  return (
    <div className="w-full space-y-3 sm:space-y-4 md:space-y-6">
      {/* Quality Warnings */}
      {showQualityWarnings && <QualityWarnings issues={image.quality.issues} />}

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg w-full"
        >
          <p className="text-red-700 font-semibold text-sm sm:text-base mb-1">⚠️ Detection Issue</p>
          <p className="text-red-600 text-xs sm:text-sm mb-2">{error}</p>
          <p className="text-red-600 text-xs">
            The jewellery may still render, but accuracy might be affected.
          </p>
        </motion.div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 w-full"
        >
          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-500 flex-shrink-0"></div>
          <p className="text-blue-700 text-xs sm:text-sm font-medium">
            Analyzing image and positioning jewellery...
          </p>
        </motion.div>
      )}

      {/* Responsive Layout - Mobile First */}
      {/* Desktop: 3-column layout (Product Info | Preview | Controls) */}
      {/* Tablet: Stacked (Preview | Controls | Info) */}
      {/* Mobile: Stacked (Preview | Collapsible Controls & Info) */}

      <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-max md:auto-rows-max lg:auto-rows-start">
        {/* Desktop Only: Product Info (Left Column) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block lg:col-span-1 w-full"
        >
          <div className="card p-4 sm:p-5 md:p-6 sticky top-4 space-y-3">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2">
              {product.name}
            </h3>
            <img
              src={product.preview || product.thumbnail}
              alt={product.name}
              className="w-full rounded aspect-square object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3C/svg%3E";
              }}
            />
            <p className="text-xs sm:text-sm text-gray-600">
              Category: <span className="font-semibold text-gray-900 break-words">{product.placementArea}</span>
            </p>
          </div>
        </motion.div>

        {/* Center/Top: Preview Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-1 md:col-span-2 lg:col-span-2 w-full"
        >
          <div className="card overflow-hidden w-full">
            <PreviewCanvas
              image={image}
              product={product}
              faceLandmarks={faceLandmarks}
              handLandmarks={handLandmarks}
              poseLandmarks={poseLandmarks}
              isProcessing={isProcessing}
            />
          </div>
        </motion.div>

        {/* Desktop: Controls (Right Column) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block lg:col-span-1 w-full"
        >
          <ControlPanel product={product} />
        </motion.div>
      </div>

      {/* Mobile/Tablet: Product Info Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="lg:hidden w-full"
      >
        <div className="card p-4 sm:p-5 space-y-2">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Category: <span className="font-semibold text-gray-900">{product.placementArea}</span>
          </p>
        </div>
      </motion.div>

      {/* Mobile: Collapsible Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="lg:hidden w-full"
      >
        <button
          onClick={() => setExpandedControls(!expandedControls)}
          className="w-full card p-4 sm:p-5 flex items-center justify-between active:shadow-lg transition-all"
        >
          <span className="font-semibold text-gray-900 text-sm sm:text-base">
            ⚙️ Adjustments
          </span>
          <span className={`text-lg transition-transform ${expandedControls ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>

        {expandedControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-3 sm:mt-4 w-full"
          >
            <ControlPanel product={product} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
