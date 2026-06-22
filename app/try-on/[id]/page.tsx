"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { JewelleryProduct, ProcessedImage } from "@/types";
import { loadProductById } from "@/lib/image-loader";
import { useTryOnStore } from "@/lib/store";
import ImageUpload from "@/components/ImageUpload";
import TryOnWorkspace from "@/components/TryOnWorkspace";

export default function TryOnPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<JewelleryProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUploaded, setImageUploaded] = useState(false);

  const setProduct: any = useTryOnStore((state) => state.setProduct);
  const setImage: any = useTryOnStore((state) => state.setImage);
  const storeProduct = useTryOnStore((state) => state.product);
  const storeImage = useTryOnStore((state) => state.image);

  useEffect(() => {
    const fetchProduct = async () => {
      const prod = await loadProductById(productId);
      setProduct(prod);
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (product && !storeProduct) {
      setProduct(product);
    }
  }, [product, storeProduct, setProduct]);

  useEffect(() => {
    if (storeImage) {
      setImageUploaded(true);
    }
  }, [storeImage]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Product not found</p>
          <Link href="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh w-full bg-gray-50 flex flex-col">
      {/* Header - Mobile First */}
      <header className="border-b border-gray-200 bg-white w-full flex-shrink-0">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 md:py-6">
          <div className="flex flex-col gap-2 sm:gap-3 w-full">
            <Link
              href="/"
              className="inline-flex items-center text-amber-600 hover:text-amber-700 active:text-amber-800 text-xs sm:text-sm font-medium transition-colors w-fit"
            >
              ← Back to Home
            </Link>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
              Try On: {product.name}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content - Flex grow */}
      <div className="w-full flex-1 px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10">
        {imageUploaded ? (
          <TryOnWorkspace product={product} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="card p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 w-full">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Upload Your Photo
                </h2>
                <p className="text-xs sm:text-base md:text-lg text-gray-600">
                  Choose an image to start trying on this jewellery. Make sure you
                  have good lighting and the relevant body part is visible.
                </p>
              </div>

              <ImageUpload />

              <div className="p-3 sm:p-4 md:p-6 bg-blue-50 rounded-lg border border-blue-200 space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-blue-900 text-xs sm:text-sm md:text-base">
                  📸 Tips for best results
                </h3>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1.5 sm:space-y-2">
                  <li>✓ Ensure good lighting and avoid shadows</li>
                  <li>✓ Face the camera directly for accessories</li>
                  <li>✓ Ensure the relevant body part is visible and clear</li>
                  <li>✓ Use high-resolution images (640x480 or larger)</li>
                  <li>✓ Avoid blurry or heavily filtered images</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
