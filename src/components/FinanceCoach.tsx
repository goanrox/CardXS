import { useState, useEffect } from 'react';
import { Card, Button, Textarea, Label } from './ui';
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_LINES = [
  "Reviewing your spending patterns...",
  "Optimizing your rewards strategy...",
  "Identifying small efficiency gains..."
];

function CoachPresenceOrb() {
  return (
    <motion.div
      animate={{ y: [-3, 3, -3] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative flex items-center justify-center w-24 h-24 mb-6"
    >
      {/* Halo ring */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-teal-200/50 blur-xl"
      />
      {/* Core gradient */}
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#E0F2F1] via-[#80CBC4] to-[#4DB6AC] shadow-[inset_0_-4px_8px_rgba(0,0,0,0.1),0_8px_24px_rgba(38,166,154,0.3)] flex items-center justify-center"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/90 to-white/20 blur-[2px]" />
      </motion.div>
    </motion.div>
  );
}

function MicroStatusLine() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % STATUS_LINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 mt-6 overflow-hidden relative w-full flex justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-[13px] font-medium text-teal-700/60 absolute tracking-wide"
        >
          {STATUS_LINES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function FinanceCoach() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Sorry, the AI coach is temporarily unavailable. Please try again.');
      }
      
      const data = await res.json();
      if (!data || typeof data !== 'object') {
        throw new Error('Sorry, the AI coach is temporarily unavailable. Please try again.');
      }
      
      setResult(data);
    } catch (err: any) {
      console.error('Finance Coach Error:', err);
      setError(err.message || 'Sorry, the AI coach is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100dvh-64px)] md:h-[calc(100vh-80px)] w-full overflow-hidden">
      {/* Soft ambient gradient background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] to-[#E8F4F8]" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-teal-100/40 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[70%] h-[70%] bg-[#F0FDF4]/50 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col h-full max-w-3xl mx-auto w-full px-4 sm:px-6"
      >
        {/* Page Header - Title & Description */}
        <div className="py-4 md:py-8 text-center md:text-left shrink-0">
          <h1 className="text-xl md:text-3xl font-semibold tracking-tight text-[#2D3748] mb-1 md:mb-2">Your Personal Guide</h1>
          <p className="text-[14px] md:text-[16px] text-[#4A5568] tracking-tight">Get unbiased answers to your financial questions.</p>
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-1 min-h-0">
          <AnimatePresence mode="wait">
            {!result && !loading ? (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center justify-center min-h-[350px] text-center space-y-2 mt-4"
              >
                <CoachPresenceOrb />
                
                <div>
                  <h2 className="text-[26px] font-semibold tracking-tight text-[#2D3748] mb-2">You're in good hands.</h2>
                  <p className="text-[16px] text-[#4A5568] max-w-sm mx-auto font-medium">
                    Let's make confident money decisions together.
                  </p>
                </div>
                
                <MicroStatusLine />
                
                <div className="flex flex-col gap-3 w-full max-w-md mt-8">
                  {[
                    "How much should I save for emergencies?",
                    "Should I buy or lease a car?",
                    "How do I start investing?",
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setText(prompt);
                      }}
                      className="px-6 py-4 rounded-[24px] bg-white/70 backdrop-blur-xl border border-white/80 text-[#4A5568] hover:bg-white/90 hover:text-[#2D3748] hover:border-teal-100/60 text-[15px] font-medium transition-all duration-300 text-left shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] active:scale-[0.98]"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-4 pb-8"
              >
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                    <p className="text-[15px] leading-relaxed">{text}</p>
                  </div>
                </div>

                {/* Coach Response */}
                <div className="flex justify-start">
                  <div className="bg-white/90 backdrop-blur-md border border-white/60 px-5 py-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    {loading ? (
                      <div className="flex items-center gap-3 text-teal-600 py-2">
                        <CoachPresenceOrb />
                        <span className="text-[15px] font-medium">Thinking...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-[15px] text-[#2D3748] leading-relaxed whitespace-pre-wrap">{result?.answer}</p>
                        
                        {result?.actionSteps && result.actionSteps.length > 0 && (
                          <div className="pt-4 border-t border-teal-100/50">
                            <h3 className="text-[11px] font-bold text-teal-700/70 mb-3 uppercase tracking-wider">Action Steps</h3>
                            <div className="space-y-3">
                              {result.actionSteps.map((step: string, i: number) => (
                                <div key={i} className="flex items-start gap-3">
                                  <div className="mt-0.5 w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="text-teal-500" size={14} />
                                  </div>
                                  <p className="text-[14px] text-[#4A5568] font-medium leading-snug pt-0.5">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="shrink-0 pt-4 pb-[calc(72px+2rem+env(safe-area-inset-bottom))] md:pb-10 relative z-10">
          <div className="max-w-2xl mx-auto">
            {error && <p className="text-[13px] text-red-500 font-medium mb-2 px-2">{error}</p>}
            <div className="relative flex items-end gap-2 bg-white/80 backdrop-blur-xl border border-white/80 rounded-[28px] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500/30 transition-all duration-300">
              <Textarea 
                placeholder="Ask a financial question..." 
                rows={1}
                value={text}
                onChange={(e: any) => {
                  setText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                disabled={loading}
                className="!bg-transparent !border-none !ring-0 !shadow-none !py-3 !px-4 min-h-[48px] max-h-[120px] text-[15px] placeholder:text-gray-400"
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
              />
              <Button 
                className="!w-11 !h-11 !p-0 !rounded-full shrink-0 mb-0.5 mr-0.5 bg-gradient-to-br from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-md border-none" 
                onClick={handleAsk} 
                disabled={!text.trim() || loading}
              >
                {loading ? <Loader2 size={20} className="animate-spin text-white" /> : <MessageSquare size={20} className="text-white ml-[-2px] mt-[2px]" />}
              </Button>
            </div>
            <p className="text-center text-[11px] text-[#718096] mt-3 font-medium">
              AI can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
