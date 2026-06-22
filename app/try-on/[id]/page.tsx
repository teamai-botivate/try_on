"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { JewelleryProduct } from "@/types";
import { loadProductById } from "@/lib/image-loader";
import { useTryOnStore } from "@/lib/store";
import ImageUpload from "@/components/ImageUpload";
import TryOnWorkspace from "@/components/TryOnWorkspace";

export default function TryOnPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<JewelleryProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [assetUploaded, setAssetUploaded] = useState(false);

  const setStoreProduct = useTryOnStore((state) => state.setProduct);
  const storeProduct = useTryOnStore((state) => state.product);
  const jewelleryAsset = useTryOnStore((state) => state.jewelleryAsset);
  const resetStore = useTryOnStore((state) => state.reset);

  useEffect(() => {
    const fetchProduct = async () => {
      const prod = await loadProductById(productId);
      setProduct(prod);
      setLoading(false);
    };

    resetStore();
    fetchProduct();
  }, [productId, resetStore]);

  useEffect(() => {
    if (product && !storeProduct) {
      setStoreProduct(product);
    }
  }, [product, storeProduct, setStoreProduct]);

  useEffect(() => {
    if (jewelleryAsset) {
      setAssetUploaded(true);
    }
  }, [jewelleryAsset]);

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
      <header className="border-b border-gray-200 bg-white w-full flex-shrink-0">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 md:py-6">
          <div className="flex flex-col gap-2 sm:gap-3 w-full">
            <Link
              href="/"
              className="inline-flex items-center text-amber-600 hover:text-amber-700 active:text-amber-800 text-xs sm:text-sm font-medium transition-colors w-fit"
            >
              Back to Home
            </Link>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
              Realtime Try-On: {product.name}
            </h1>
          </div>
        </div>
      </header>

      <div className="w-full flex-1 px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10">
        {assetUploaded ? (
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
                  Upload Jewellery Image
                </h2>
                <p className="text-xs sm:text-base md:text-lg text-gray-600">
                  Upload the jewellery asset for this try-on. The camera provides the person in realtime after preprocessing.
                </p>
              </div>

              <ImageUpload />

              <div className="p-3 sm:p-4 md:p-6 bg-blue-50 rounded-lg border border-blue-200 space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-blue-900 text-xs sm:text-sm md:text-base">
                  Jewellery asset pipeline
                </h3>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1.5 sm:space-y-2">
                  <li>Background removal and jewellery segmentation</li>
                  <li>Shadow reduction, bounding box detection, cropping, padding, and transparent asset generation</li>
                  <li>Works with transparent PNGs, catalogue images, studio photos, mobile photos, and screenshots</li>
                  <li>After upload, camera permission starts realtime AR try-on</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
