import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface WalletEfficiencyScoreProps {
  score?: number;
  subtext?: string;
}

export function WalletEfficiencyScore({ 
  score = 72, 
  subtext = "2 cards under-utilized" 
}: WalletEfficiencyScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const duration = 700;
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      // easeOutQuart for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setDisplayScore(Math.floor(easeOut * score));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayScore(score); // Ensure it ends exactly on the target score
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
      className="w-full relative group h-full"
    >
      <button
        className="w-full h-full flex flex-col gap-3.5 px-5 py-4 rounded-2xl bg-gradient-to-b from-[#F7F4ED]/90 to-[#EFEBE0]/90 backdrop-blur-xl shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.02)] border border-white/60 text-left transition-all duration-500 active:scale-[0.98]"
      >
        <div className="flex justify-between items-end w-full">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-app-text-secondary/70 mb-0.5">
              Wallet Efficiency
            </span>
            <span className="text-[14px] font-semibold text-[#4A443A]">
              {subtext}
            </span>
          </div>
          <div className="text-2xl font-semibold text-[#4A443A] leading-none tracking-tight">
            {displayScore}%
          </div>
        </div>
        
        <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full bg-emerald-500 rounded-full"
          />
        </div>
      </button>
    </motion.div>
  );
}
