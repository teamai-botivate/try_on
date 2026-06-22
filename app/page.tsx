"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Category } from "@/types";
import { loadCategories } from "@/lib/image-loader";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await loadCategories();
      setCategories(data);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return (
    <main className="min-h-dvh w-full bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header - Mobile First */}
      <header className="border-b border-gray-200 w-full flex-shrink-0">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">
              Virtual Jewellery Try-On
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Test jewellery quality before integration
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content - Flex grow to fill space */}
      <div className="w-full flex-1 px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-10 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8 sm:mb-10 md:mb-12 w-full"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-2 sm:mb-3">
            What would you like to try?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            Select a category to begin
          </p>
        </motion.div>

        {/* Categories Grid - Responsive columns */}
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16 md:py-20 w-full min-h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-max">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                }}
                className="w-full h-full"
              >
                <Link href={`/category/${category.slug}`} className="block w-full h-full">
                  <div className="card p-3 sm:p-4 md:p-6 text-center active:shadow-lg transition-all duration-200 h-full flex flex-col items-center justify-center gap-2 sm:gap-3 hover:shadow-md hover:scale-105">
                    <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">
                      {category.icon}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words line-clamp-2">
                        {category.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Safe area aware */}
      <footer className="border-t border-gray-200 w-full flex-shrink-0 mt-auto safe-area-bottom">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 text-center text-sm sm:text-base text-gray-600">
          <p>Virtual Jewellery Try-On Test Application</p>
        </div>
      </footer>
    </main>
  );
}
