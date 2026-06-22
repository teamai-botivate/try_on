"use client";

import { motion } from "framer-motion";

interface QualityWarningsProps {
  issues: string[];
}

export default function QualityWarnings({ issues }: QualityWarningsProps) {
  if (issues.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
    >
      <p className="font-semibold text-yellow-900 text-xs sm:text-sm mb-2 sm:mb-3">⚠️ Quality Notes</p>
      <ul className="space-y-1">
        {issues.map((issue, index) => (
          <li key={index} className="text-xs sm:text-sm text-yellow-800">
            • {issue}
          </li>
        ))}
      </ul>
      <p className="text-xs text-yellow-700 mt-2 sm:mt-3">
        The try-on will still work, but accuracy and quality may be affected.
      </p>
    </motion.div>
  );
}
