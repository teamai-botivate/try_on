import { useState, useCallback } from "react";
import { processImage, validateImageFile } from "@/lib/image-processing";
import type { ProcessedImage } from "@/types";

interface UseImageProcessingOptions {
  onSuccess?: (image: ProcessedImage) => void;
  onError?: (error: string) => void;
}

export function useImageProcessing(options?: UseImageProcessingOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<ProcessedImage | null>(null);

  const processImageFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);

      try {
        // Validate
        const validation = validateImageFile(file);
        if (!validation.valid) {
          throw new Error(validation.error || "Invalid image");
        }

        // Process
        const processedImage = await processImage(file);
        setImage(processedImage);

        options?.onSuccess?.(processedImage);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to process image";
        setError(message);
        options?.onError?.(message);
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setImage(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    image,
    loading,
    error,
    processImageFile,
    reset,
  };
}
