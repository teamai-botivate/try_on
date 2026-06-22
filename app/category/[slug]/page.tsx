"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Category, JewelleryProduct } from "@/types";
import { loadCategories, loadProductsByCategory } from "@/lib/image-loader";
import ProductGrid from "@/components/ProductGrid";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<JewelleryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const categories = await loadCategories();
      const cat = categories.find((c) => c.slug === slug);
      setCategory(cat || null);

      const prods = await loadProductsByCategory(slug);
      setProducts(prods);
      setLoading(false);
    };

    fetchData();
  }, [slug]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-dvh w-full bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header - Mobile First */}
      <header className="border-b border-gray-200 w-full flex-shrink-0">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center text-amber-600 hover:text-amber-700 active:text-amber-800 mb-3 sm:mb-4 text-xs sm:text-sm font-medium transition-colors"
          >
            ← Back
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 w-full min-w-0">
              <span className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">
                {category?.icon}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 break-words min-w-0">
                {category?.name}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 break-words">
              {category?.description}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content - Flex grow */}
      <div className="w-full flex-1 px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 flex flex-col">
        {/* Search - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 sm:mb-8 w-full flex-shrink-0"
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors min-h-11"
          />
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16 md:py-20 w-full flex-1 min-h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16 md:py-20 flex-1 flex items-center justify-center"
          >
            <p className="text-gray-600 text-base sm:text-lg">No products found</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
