"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { useTryOnStore } from "@/lib/store";
import { validateImageFile } from "@/lib/image-loader";
import { processImage } from "@/lib/image-processing";

export default function ImageUpload() {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const setImage = useTryOnStore((state) => state.setImage);
  const setProcessing = useTryOnStore((state) => state.setProcessing);
  const setStoreError = useTryOnStore((state) => state.setError);

  const onDrop = async (acceptedFiles: File[]) => {
    setError(null);

    if (acceptedFiles.length === 0) {
      setError("No valid files selected");
      return;
    }

    const file = acceptedFiles[0];

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    try {
      setUploading(true);
      setProcessing(true);

      const processedImage = await processImage(file);
      setImage(processedImage);
      setStoreError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process image";
      setError(message);
      setStoreError(message);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Dropzone - Mobile First */}
      <motion.div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-10 text-center cursor-pointer transition-colors w-full min-h-48 sm:min-h-56 flex items-center justify-center ${
          isDragActive
            ? "border-amber-500 bg-amber-50"
            : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        whileHover={{ scale: 1.01 }}
      >
        <input {...getInputProps()} />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {uploading ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-amber-500 mx-auto"></div>
              <p className="text-sm sm:text-base text-gray-600">Processing image...</p>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>

              {isDragActive ? (
                <>
                  <p className="text-base sm:text-lg font-semibold text-amber-600">
                    Drop your image here
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Release to upload</p>
                </>
              ) : (
                <>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    Drag and drop your image here
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-2 sm:mt-3">
                    Supported: JPEG, PNG, WebP (up to 20MB)
                  </p>
                </>
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700 w-full"
        >
          <p className="font-semibold mb-1">⚠️ Error</p>
          <p>{error}</p>
        </motion.div>
      )}

      {/* Alternative Upload Divider */}
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Paste Button - Touch friendly */}
      <motion.button
        onClick={() => {
          navigator.clipboard.read().then((items) => {
            items.forEach((item) => {
              if (item.types.includes("image/png")) {
                item.getType("image/png").then((blob) => {
                  onDrop([new File([blob], "pasted.png", { type: "image/png" })]);
                });
              }
            });
          });
        }}
        disabled={uploading}
        className="w-full btn-secondary text-sm sm:text-base"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        📋 Paste from Clipboard
      </motion.button>
    </div>
  );
}
