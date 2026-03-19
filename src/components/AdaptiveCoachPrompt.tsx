import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const MESSAGES = [
  "Want help optimizing dining rewards today?",
  "You added a new card. Let's explore its best use.",
  "Gas category spending increased. Need a quick tip?",
  "We can improve your wallet efficiency score together."
];

export function AdaptiveCoachPrompt() {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Randomly select a message on mount
    setMessageIndex(Math.floor(Math.random() * MESSAGES.length));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto mb-6 px-4 sm:px-0"
    >
      <motion.button
        onClick={() => navigate('/coach')}
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/60 text-left transition-colors hover:bg-white/90 active:scale-[0.98]"
      >
        <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shrink-0 shadow-sm border border-white/50">
          <Sparkles size={16} className="text-indigo-600" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <p className="text-[14px] font-medium text-[#4A443A] truncate">
            {MESSAGES[messageIndex]}
          </p>
        </div>
      </motion.button>
    </motion.div>
  );
}
