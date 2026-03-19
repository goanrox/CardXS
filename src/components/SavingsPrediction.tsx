import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface SavingsPredictionProps {
  value?: number;
  subtext?: string;
}

export function SavingsPrediction({ 
  value = 3.40, 
  subtext = "Dining category optimization" 
}: SavingsPredictionProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const duration = 850;
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      // easeOutQuart for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(easeOut * value);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value); // Ensure it ends exactly on the target value
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="w-full relative group h-full"
    >
      {/* Soft glow pulse after settle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 3, delay: 1.2, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
        className="absolute -inset-0.5 bg-emerald-400/20 rounded-[18px] blur-md pointer-events-none"
      />
      
      <button
        className="relative w-full h-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-b from-[#F7F4ED]/90 to-[#EFEBE0]/90 backdrop-blur-xl shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.02)] border border-white/60 text-left transition-all duration-500 active:scale-[0.98] overflow-hidden"
      >
        {/* Subtle emerald gradient accent edge */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-500 opacity-80" />
        
        <div className="flex flex-col pl-1.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-app-text-secondary/70 mb-0.5">
            Potential Rewards Gain
          </span>
          <span className="text-[14px] font-semibold text-[#4A443A]">
            {subtext}
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-2xl font-semibold text-emerald-600 leading-none tracking-tight">
            +${displayValue.toFixed(2)}
          </div>
          <span className="text-[11px] font-medium text-app-text-secondary mt-1">
            today
          </span>
        </div>
      </button>
    </motion.div>
  );
}
