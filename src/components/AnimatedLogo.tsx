import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { useLocation } from 'react-router-dom';

export function AnimatedLogo() {
  const location = useLocation();
  const badgeControls = useAnimation();
  const glowControls = useAnimation();
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delayRef = useRef(1 + Math.random()); // Random delay between 1s and 2s

  // Determine glow color based on route context
  let glowColor = 'bg-blue-400'; // Home: soft optimistic blue
  if (location.pathname === '/best-card') glowColor = 'bg-[#8B5A2B]'; // Wallet: warm cognac leather tint
  else if (location.pathname === '/coach') glowColor = 'bg-sky-400'; // Coach: calm sky guidance blue
  else if (location.pathname !== '/') glowColor = 'bg-slate-500'; // Tools: cool graphite blue-gray

  // Handle scroll and interaction pauses to ensure user attention safety
  useEffect(() => {
    const handleInteraction = () => {
      setIsPaused(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsPaused(false);
      }, 2500); // Resume after interaction idle timeout (2.5s)
    };

    window.addEventListener('scroll', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsPaused(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    };
    
    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsPaused(false);
        }, 2500);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPaused) {
      // Breathing Scale Animation
      badgeControls.start({
        scale: [1, 1.04, 1],
        boxShadow: [
          '0 6px 16px rgba(0,0,0,0.12)',
          '0 10px 22px rgba(0,0,0,0.18)',
          '0 6px 16px rgba(0,0,0,0.12)'
        ],
        transition: {
          duration: 4.2,
          ease: [0.4, 0, 0.2, 1], // cubic-bezier(0.4, 0, 0.2, 1)
          repeat: Infinity,
          delay: delayRef.current
        }
      });
      
      // Ambient Glow Intelligence Effect
      glowControls.start({
        scale: [1, 1.2, 1], 
        opacity: [0.08, 0.18, 0.08],
        transition: {
          duration: 9, // 8-10 seconds pulse
          ease: "easeInOut",
          repeat: Infinity,
          delay: delayRef.current
        }
      });
    } else {
      // Pause smoothly
      badgeControls.stop();
      glowControls.stop();
      
      badgeControls.start({
        scale: 1,
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        transition: { duration: 0.8, ease: 'easeOut' }
      });
      
      glowControls.start({
        scale: 1,
        opacity: 0.1,
        transition: { duration: 0.8, ease: 'easeOut' }
      });
    }
  }, [isPaused, badgeControls, glowControls]);

  return (
    <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10">
      {/* Ambient Glow Aura */}
      <motion.div
        animate={glowControls}
        initial={{ scale: 1, opacity: 0.1 }}
        className={`absolute inset-[-2px] rounded-[12px] md:rounded-[14px] blur-[8px] ${glowColor} pointer-events-none`}
        style={{ willChange: 'transform, opacity' }}
      />
      
      {/* Main Logo Badge */}
      <motion.div
        animate={badgeControls}
        initial={{ scale: 1, boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
        className="relative w-full h-full bg-app-text rounded-[10px] md:rounded-[12px] flex items-center justify-center z-10"
        style={{ willChange: 'transform, box-shadow' }}
      >
        <span className="text-white font-bold text-lg md:text-xl leading-none">C</span>
      </motion.div>
    </div>
  );
}
