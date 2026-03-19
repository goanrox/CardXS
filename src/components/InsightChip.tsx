import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const INSIGHTS = [
  "Wallet efficiency",
  "Rewards up",
  "2 better picks",
  "Optimizing spend"
];

export function InsightChip() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % INSIGHTS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={{ y: [0, -1, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-1.5 overflow-hidden max-w-[120px] sm:max-w-none"
    >
      <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      <div className="relative h-3.5 flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-[10px] font-bold text-white/90 whitespace-nowrap absolute inset-0 flex items-center truncate"
          >
            {INSIGHTS[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
