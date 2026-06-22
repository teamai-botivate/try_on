"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { JewelleryProduct } from "@/types";
import { useTryOnStore } from "@/lib/store";
import PreviewCanvas from "./PreviewCanvas";
import ControlPanel from "./ControlPanel";
import QualityWarnings from "./QualityWarnings";

interface TryOnWorkspaceProps {
  product: JewelleryProduct;
}

export default function TryOnWorkspace({ product }: TryOnWorkspaceProps) {
  const [expandedControls, setExpandedControls] = useState(false);

  const asset = useTryOnStore((state) => state.jewelleryAsset);

  if (!asset) {
    return (
      <div className="text-center py-12 sm:py-16 md:py-20 w-full">
        <p className="text-gray-600 text-base sm:text-lg">No jewellery asset uploaded</p>
      </div>
    );
  }

  const showQualityWarnings = asset.quality.issues.length > 0;

  return (
    <div className="w-full space-y-3 sm:space-y-4 md:space-y-6">
      {showQualityWarnings && <QualityWarnings issues={asset.quality.issues} />}

      <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-max lg:auto-rows-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block lg:col-span-1 w-full"
        >
          <div className="card p-4 sm:p-5 md:p-6 sticky top-4 space-y-3">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2">
              {product.name}
            </h3>
            <div className="w-full rounded aspect-square bg-grid-soft border border-gray-200 flex items-center justify-center overflow-hidden">
              <img src={asset.canvas.toDataURL("image/png")} alt="Uploaded jewellery asset" className="w-full h-full object-contain p-3" />
            </div>
            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
              <p>
                Type: <span className="font-semibold text-gray-900 break-words">{product.placementArea}</span>
              </p>
              <p>
                Asset: <span className="font-semibold text-gray-900 break-words">{asset.sourceFileName}</span>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-1 md:col-span-2 lg:col-span-2 w-full"
        >
          <div className="card overflow-hidden w-full">
            <PreviewCanvas product={product} asset={asset} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block lg:col-span-1 w-full"
        >
          <ControlPanel />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:hidden w-full">
        <div className="card p-4 sm:p-5 space-y-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Type: <span className="font-semibold text-gray-900">{product.placementArea}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <img src={asset.canvas.toDataURL("image/png")} alt="Uploaded jewellery asset" className="h-16 w-16 rounded border border-gray-200 object-contain bg-gray-50 p-1" />
            <p className="text-xs text-gray-600 break-words min-w-0">{asset.sourceFileName}</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:hidden w-full">
        <button
          onClick={() => setExpandedControls(!expandedControls)}
          className="w-full card p-4 sm:p-5 flex items-center justify-between active:shadow-lg transition-all min-h-11"
        >
          <span className="font-semibold text-gray-900 text-sm sm:text-base">Adjustments</span>
          <span className={`text-lg transition-transform ${expandedControls ? "rotate-180" : ""}`}>v</span>
        </button>

        {expandedControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-3 sm:mt-4 w-full"
          >
            <ControlPanel />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
