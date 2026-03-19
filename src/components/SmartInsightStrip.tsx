import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type InsightType = 'success' | 'warning' | 'neutral';

interface Insight {
  text: string;
  type: InsightType;
}

const INSIGHTS: Insight[] = [
  { text: "Dining rewards are higher today.", type: 'success' },
  { text: "You saved $1.82 yesterday using Freedom Unlimited.", type: 'success' },
  { text: "Your wallet has unused reward potential.", type: 'warning' },
  { text: "Gas category optimized this week.", type: 'neutral' }
];

const getBgClasses = (type: InsightType) => {
  switch (type) {
    case 'success':
      return 'from-[#ECFDF5]/90 to-[#F0FDF4]/90 border-emerald-100/50';
    case 'warning':
      return 'from-[#FFFBEB]/90 to-[#FEF3C7]/90 border-amber-100/50';
    case 'neutral':
    default:
      return 'from-[#F7F4ED]/90 to-[#EFEBE0]/90 border-white/60';
  }
};

export function SmartInsightStrip({ onScrollToResult }: { onScrollToResult?: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % INSIGHTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentInsight = INSIGHTS[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto mb-6 px-4 sm:px-0"
    >
      <button
        onClick={onScrollToResult}
        className={`w-full flex items-start gap-3.5 px-5 py-3 rounded-2xl bg-gradient-to-b ${getBgClasses(currentInsight.type)} backdrop-blur-xl shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.02)] border text-left transition-all duration-500 active:scale-[0.98]`}
      >
        <div className="relative flex items-center justify-center w-2 h-2 shrink-0 mt-[14px]">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full bg-emerald-500"
          />
          <motion.div
            animate={{ scale: [1, 2.5, 1], opacity: [0, 0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 6, ease: "easeInOut" }}
            className="absolute w-2 h-2 rounded-full bg-emerald-500"
          />
        </div>
        
        <div className="flex-1 overflow-hidden relative h-10 flex flex-col justify-center">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-app-text-secondary/70 mb-0.5">
            Smart Insight
          </span>
          <div className="relative w-full h-5">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-[14px] font-semibold text-[#4A443A] truncate absolute inset-0 flex items-center"
              >
                {currentInsight.text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </button>
    </motion.div>
  );
}
