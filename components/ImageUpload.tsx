"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTryOnStore } from "@/lib/store";
import { validateImageFile } from "@/lib/image-loader";
import { processJewelleryAsset } from "@/lib/jewellery-processing";

export default function ImageUpload() {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const setJewelleryAsset = useTryOnStore((state) => state.setJewelleryAsset);
  const setProcessing = useTryOnStore((state) => state.setProcessing);
  const setStoreError = useTryOnStore((state) => state.setError);

  const onDrop = async (acceptedFiles: File[]) => {
    setError(null);

    if (acceptedFiles.length === 0) {
      setError("No valid jewellery image selected");
      return;
    }

    const file = acceptedFiles[0];
    const validation = validateImageFile(file);

    if (!validation.valid) {
      setError(validation.error || "Invalid jewellery image");
      return;
    }

    try {
      setUploading(true);
      setProcessing(true);

      const processedAsset = await processJewelleryAsset(file);
      setJewelleryAsset(processedAsset);
      setStoreError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to preprocess jewellery image";
      setError(message);
      setStoreError(message);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      const imageItem = items.find((item) => item.types.some((type) => type.startsWith("image/")));
      const imageType = imageItem?.types.find((type) => type.startsWith("image/"));

      if (!imageItem || !imageType) {
        setError("Clipboard does not contain a jewellery image");
        return;
      }

      const blob = await imageItem.getType(imageType);
      await onDrop([new File([blob], "pasted-jewellery.png", { type: imageType })]);
    } catch {
      setError("Clipboard image access was blocked by the browser");
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
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-10 text-center cursor-pointer transition-colors w-full min-h-48 sm:min-h-56 flex items-center justify-center ${
          isDragActive ? "border-amber-500 bg-amber-50" : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />

        <div className="w-full">
          {uploading ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-amber-500 mx-auto"></div>
              <p className="text-sm sm:text-base text-gray-600">Preprocessing jewellery asset...</p>
            </div>
          ) : (
            <>
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>

              {isDragActive ? (
                <>
                  <p className="text-base sm:text-lg font-semibold text-amber-600">Drop your jewellery image here</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Release to preprocess the asset</p>
                </>
              ) : (
                <>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">Upload jewellery image</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Drag, drop, paste, or click to browse</p>
                  <p className="text-xs text-gray-500 mt-2 sm:mt-3">
                    PNG, JPEG, WebP, transparent PNGs, catalogue shots, screenshots, studio photos
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700 w-full">
          <p className="font-semibold mb-1">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      <button onClick={pasteFromClipboard} disabled={uploading} className="w-full btn-secondary text-sm sm:text-base">
        Paste Jewellery from Clipboard
      </button>
    </div>
  );
}
