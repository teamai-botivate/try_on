"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTryOnStore } from "@/lib/store";

export default function ActionButtons() {
  const [downloading, setDownloading] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const image = useTryOnStore((state) => state.image);
  const product = useTryOnStore((state) => state.product);

  const handleDownload = async (format: "png" | "jpg") => {
    if (!image) return;

    try {
      setDownloading(true);

      // Create a high-quality canvas for export
      const exportCanvas = document.createElement("canvas");
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) throw new Error("Cannot create canvas context");

      // Use original image dimensions for quality
      exportCanvas.width = image.width;
      exportCanvas.height = image.height;

      ctx.drawImage(image.canvas, 0, 0);

      // Convert to blob
      exportCanvas.toBlob(
        (blob) => {
          if (!blob) throw new Error("Failed to create blob");

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `try-on-${product?.id || "result"}-${Date.now()}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setShowFormatMenu(false);
        },
        `image/${format === "jpg" ? "jpeg" : "png"}`,
        format === "jpg" ? 0.95 : 1
      );
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full space-y-2 sm:space-y-3">
      {/* Download Button - Mobile First */}
      <div className="relative w-full">
        <motion.button
          onClick={() => setShowFormatMenu(!showFormatMenu)}
          disabled={downloading || !image}
          className="w-full btn-primary text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed relative"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {downloading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Exporting...
            </span>
          ) : (
            "📥 Download"
          )}
        </motion.button>

        {/* Format Menu - Mobile optimized */}
        {showFormatMenu && !downloading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-max"
          >
            <button
              onClick={() => {
                handleDownload("png");
                setShowFormatMenu(false);
              }}
              className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-100 active:bg-gray-200 text-xs sm:text-sm text-gray-900 border-b border-gray-200 transition-colors min-h-11"
            >
              PNG (Lossless)
            </button>
            <button
              onClick={() => {
                handleDownload("jpg");
                setShowFormatMenu(false);
              }}
              className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-100 active:bg-gray-200 text-xs sm:text-sm text-gray-900 transition-colors min-h-11"
            >
              JPG (Smaller file)
            </button>
          </motion.div>
        )}
      </div>

      {/* Back to Home */}
      <Link href="/" className="block w-full">
        <motion.button
          className="w-full btn-secondary text-xs sm:text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🏠 Home
        </motion.button>
      </Link>

      {/* Fullscreen Toggle */}
      <motion.button
        onClick={() => {
          const container = document.querySelector('[role="main"]');
          if (container) {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              container.requestFullscreen().catch((err) => {
                console.error("Fullscreen request failed:", err);
              });
            }
          }
        }}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 text-gray-900 font-medium text-xs sm:text-sm transition-colors min-h-11"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        ⛶ Fullscreen
      </motion.button>
    </div>
  );
}
