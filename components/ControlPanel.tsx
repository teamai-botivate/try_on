"use client";

import { motion } from "framer-motion";
import { useTryOnStore } from "@/lib/store";
import SliderControl from "./SliderControl";
import ActionButtons from "./ActionButtons";

export default function ControlPanel() {
  const controls = useTryOnStore((state) => state.controls);
  const setControls = useTryOnStore((state) => state.setControls);
  const resetControls = useTryOnStore((state) => state.resetControls);

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full lg:sticky lg:top-4 space-y-3 sm:space-y-4"
    >
      {/* Scale */}
      <motion.div variants={itemVariants} className="card p-3 sm:p-4 md:p-5">
        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-2 sm:mb-3">Scale</h4>
        <SliderControl
          value={controls.scale}
          onChange={(scale) => setControls({ scale })}
          min={0.5}
          max={2}
          step={0.1}
        />
        <p className="text-xs text-gray-600 mt-2">{(controls.scale * 100).toFixed(0)}%</p>
      </motion.div>

      {/* Rotation Controls */}
      <motion.div variants={itemVariants} className="card p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Rotation</h4>

        <div>
          <label className="text-xs text-gray-600 mb-1 sm:mb-2 block">X</label>
          <SliderControl
            value={controls.rotationX}
            onChange={(rotationX) => setControls({ rotationX })}
            min={-Math.PI}
            max={Math.PI}
            step={0.1}
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 sm:mb-2 block">Y</label>
          <SliderControl
            value={controls.rotationY}
            onChange={(rotationY) => setControls({ rotationY })}
            min={-Math.PI}
            max={Math.PI}
            step={0.1}
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 sm:mb-2 block">Z</label>
          <SliderControl
            value={controls.rotationZ}
            onChange={(rotationZ) => setControls({ rotationZ })}
            min={-Math.PI}
            max={Math.PI}
            step={0.1}
          />
        </div>
      </motion.div>

      {/* Position Controls */}
      <motion.div variants={itemVariants} className="card p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Position</h4>

        <div>
          <label className="text-xs text-gray-600 mb-1 sm:mb-2 block">Horizontal</label>
          <SliderControl
            value={controls.offsetX}
            onChange={(offsetX) => setControls({ offsetX })}
            min={-100}
            max={100}
            step={5}
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 sm:mb-2 block">Vertical</label>
          <SliderControl
            value={controls.offsetY}
            onChange={(offsetY) => setControls({ offsetY })}
            min={-100}
            max={100}
            step={5}
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 sm:mb-2 block">Depth</label>
          <SliderControl
            value={controls.offsetZ}
            onChange={(offsetZ) => setControls({ offsetZ })}
            min={-50}
            max={50}
            step={5}
          />
        </div>
      </motion.div>

      {/* Zoom and View */}
      <motion.div variants={itemVariants} className="card p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">View</h4>

        <div>
          <label className="text-xs text-gray-600 mb-1 sm:mb-2 block">Zoom</label>
          <SliderControl
            value={controls.zoom}
            onChange={(zoom) => setControls({ zoom })}
            min={0.5}
            max={3}
            step={0.1}
          />
        </div>

        <motion.button
          onClick={() => setControls({ showBefore: !controls.showBefore })}
          className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded text-xs sm:text-sm font-medium transition-colors min-h-11 ${
            controls.showBefore
              ? "bg-gray-200 text-gray-900 active:bg-gray-300"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {controls.showBefore ? "👁️ Show After" : "👁️ Show Before"}
        </motion.button>
      </motion.div>

      {/* Reset Button */}
      <motion.button
        onClick={resetControls}
        className="w-full btn-secondary text-xs sm:text-sm"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        ↺ Reset
      </motion.button>

      {/* Action Buttons */}
      <ActionButtons />
    </motion.div>
  );
}
