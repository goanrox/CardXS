import { useState } from 'react';
import { Card, Button, Textarea, Label } from './ui';
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    <div className="max-w-2xl mx-auto w-full flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-220px)]">
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 px-1">
        <AnimatePresence mode="wait">
          {!result && !loading ? (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-6 mt-12"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-app-primary to-blue-400 rounded-full flex items-center justify-center shadow-lg shadow-app-primary/20 mb-2">
                <MessageSquare size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-app-text mb-2">Hi, I'm your Finance Coach.</h2>
                <p className="text-[15px] text-app-text-secondary max-w-sm mx-auto">
                  Ask me anything about budgeting, investing, or managing debt.
                </p>
              </div>
              
              <div className="flex flex-col gap-2 w-full max-w-md mt-4">
                {[
                  "How much should I save for emergencies?",
                  "Should I buy or lease a car?",
                  "How do I start investing?",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setText(prompt);
                      // handleAsk(); // Optional: auto-submit
                    }}
                    className="px-4 py-3 rounded-2xl bg-white border border-app-border/60 text-app-text-secondary hover:bg-[#F5F5F7] hover:text-app-text hover:border-app-border text-[14px] font-medium transition-all text-left shadow-sm"
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
              className="space-y-6 pt-4"
            >
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-app-primary text-white px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                  <p className="text-[15px] leading-relaxed">{text}</p>
                </div>
              </div>

              {/* Coach Response */}
              <div className="flex justify-start">
                <div className="bg-white border border-app-border/60 px-5 py-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm">
                  {loading ? (
                    <div className="flex items-center gap-2 text-app-text-secondary py-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-[14px] font-medium">Thinking...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[15px] text-app-text leading-relaxed whitespace-pre-wrap">{result?.answer}</p>
                      
                      {result?.actionSteps && result.actionSteps.length > 0 && (
                        <div className="pt-3 border-t border-app-border/50">
                          <h3 className="text-[11px] font-semibold text-app-text-secondary mb-2.5 uppercase tracking-wider">Action Steps</h3>
                          <div className="space-y-2">
                            {result.actionSteps.map((step: string, i: number) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <CheckCircle2 className="text-app-success shrink-0 mt-0.5" size={16} />
                                <p className="text-[14px] text-app-text font-medium leading-snug">{step}</p>
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
      <div className="pt-4 pb-2 bg-app-bg">
        {error && <p className="text-[13px] text-red-500 font-medium mb-2 px-2">{error}</p>}
        <div className="relative flex items-end gap-2 bg-white border border-app-border/60 rounded-[24px] p-2 shadow-sm focus-within:ring-2 focus-within:ring-app-primary/20 focus-within:border-app-primary/30 transition-all">
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
            className="!bg-transparent !border-none !ring-0 !shadow-none !py-2.5 !px-3 min-h-[44px] max-h-[120px]"
            onKeyDown={(e: any) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
          />
          <Button 
            className="!w-10 !h-10 !p-0 !rounded-full shrink-0 mb-0.5 mr-0.5" 
            onClick={handleAsk} 
            disabled={!text.trim() || loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} className="ml-[-2px] mt-[2px]" />}
          </Button>
        </div>
        <p className="text-center text-[11px] text-app-text-secondary mt-3 font-medium">
          AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
