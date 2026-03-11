import React from 'react';
import { motion } from 'motion/react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-app-card rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-app-border p-5 md:p-8 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', disabled, ...props }: any) {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-app-primary disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<string, string> = {
    primary: "bg-app-primary text-white hover:bg-[#0062C3] px-6 py-3.5 text-[15px] shadow-sm hover:shadow-md",
    secondary: "bg-[#F5F5F7] text-app-text hover:bg-[#E8E8ED] px-6 py-3.5 text-[15px]",
    outline: "border border-app-border text-app-text hover:bg-[#F5F5F7] px-6 py-3.5 text-[15px]",
    ghost: "text-app-text-secondary hover:text-app-text hover:bg-[#F5F5F7] px-4 py-2 text-[14px]",
  };
  
  return (
    <motion.button 
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Input({ className = '', ...props }: any) {
  return (
    <input 
      className={`w-full bg-[#F5F5F7] border border-transparent rounded-xl px-4 py-3.5 text-app-text placeholder:text-app-text-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary/30 transition-all text-[15px] ${className}`} 
      {...props} 
    />
  );
}

export function Textarea({ className = '', ...props }: any) {
  return (
    <textarea 
      className={`w-full bg-[#F5F5F7] border border-transparent rounded-xl px-4 py-3.5 text-app-text placeholder:text-app-text-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary/30 transition-all resize-none text-[15px] ${className}`} 
      {...props} 
    />
  );
}

export function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-[12px] font-semibold text-app-text-secondary mb-2 uppercase tracking-wider ${className}`}>
      {children}
    </label>
  );
}
