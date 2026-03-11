import React from 'react';
import { motion } from 'motion/react';

interface IconProps {
  isActive: boolean;
}

export function AnimatedHome({ isActive }: IconProps) {
  return (
    <motion.svg 
      width="24" height="24" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} 
      strokeLinecap="round" strokeLinejoin="round"
      animate={isActive ? { scale: [1, 0.9, 1] } : { scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <motion.path 
        d="M9 22V12h6v10" 
        style={{ originX: "9px" }}
        animate={isActive ? { scaleX: 0.3, skewY: 12 } : { scaleX: 1, skewY: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </motion.svg>
  );
}

export function AnimatedWallet({ isActive }: IconProps) {
  return (
    <motion.svg 
      width="24" height="24" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} 
      strokeLinecap="round" strokeLinejoin="round"
      animate={isActive ? { scale: [1, 0.9, 1] } : { scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.path 
        d="M7 7V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3"
        initial={{ y: 2, opacity: 0 }}
        animate={isActive ? { y: -2, opacity: 1 } : { y: 2, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </motion.svg>
  );
}

export function AnimatedTools({ isActive }: IconProps) {
  return (
    <motion.svg 
      width="24" height="24" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} 
      strokeLinecap="round" strokeLinejoin="round"
      animate={isActive ? { scale: [1, 0.9, 1] } : { scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.path 
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" 
        style={{ originX: "12px", originY: "12px" }}
        animate={isActive ? { rotate: [0, -20, 10, 0] } : { rotate: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

export function AnimatedCoach({ isActive }: IconProps) {
  return (
    <motion.svg 
      width="24" height="24" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} 
      strokeLinecap="round" strokeLinejoin="round"
      animate={isActive ? { scale: [1, 0.9, 1] } : { scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.path 
        d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" 
        style={{ originX: "12px", originY: "12px" }}
        animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.circle cx="8" cy="12" r="1.5" fill="currentColor" stroke="none"
        animate={isActive ? { scale: [0, 1.5, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }} 
        transition={{ delay: 0.0, duration: 0.2 }} />
      <motion.circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"
        animate={isActive ? { scale: [0, 1.5, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }} 
        transition={{ delay: 0.1, duration: 0.2 }} />
      <motion.circle cx="16" cy="12" r="1.5" fill="currentColor" stroke="none"
        animate={isActive ? { scale: [0, 1.5, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }} 
        transition={{ delay: 0.2, duration: 0.2 }} />
    </motion.svg>
  );
}
