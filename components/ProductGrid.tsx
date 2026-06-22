"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { JewelleryProduct } from "@/types";

interface ProductGridProps {
  products: JewelleryProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-max">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.05,
          }}
          className="w-full h-full"
        >
          <Link href={`/try-on/${product.id}`} className="block w-full h-full">
            <div className="card overflow-hidden active:shadow-lg h-full flex flex-col hover:shadow-md transition-all duration-300 hover:scale-105">
              {/* Product Image - Aspect Square */}
              <div className="relative w-full aspect-square bg-gray-100 overflow-hidden flex-shrink-0">
                <img
                  src={product.preview || product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='%236b7280'%3EImage not available%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Product Info - Mobile First */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col gap-2 sm:gap-3">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 break-words">
                  {product.name}
                </h3>

                {/* Try On Button */}
                <motion.button
                  className="btn-primary mt-auto w-full text-sm sm:text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try On
                </motion.button>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
