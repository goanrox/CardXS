import { useState } from 'react';
import { Card, Button, Textarea, Label } from './ui';
import { FileText, Loader2, AlertCircle, Info, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Charge {
  description: string;
  amount: string;
}

interface BillResult {
  summary: string;
  keyCharges: Charge[];
  feesOrInterest: Charge[];
  explanation: string;
  insight: string;
}

export function ExplainMyBill() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<BillResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const res = await fetch('/api/explain-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze bill');
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto w-full p-5 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#E3F2FD] flex items-center justify-center text-[#1976D2] shrink-0">
          <FileText size={24} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-app-text">Explain My Bill</h2>
          <p className="text-[14px] text-app-text-secondary mt-1">Paste any statement or bill to understand it instantly.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            key="inputs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="space-y-5"
          >
            <div>
              <Label>Paste Bill Text</Label>
              <Textarea 
                placeholder="Paste raw text from your credit card statement, phone bill, pay stub, etc." 
                rows={6}
                value={text}
                onChange={(e: any) => setText(e.target.value)}
                disabled={loading}
                className="text-[14px] mt-1"
              />
            </div>
            
            {error && <p className="text-[14px] text-red-500 font-medium">{error}</p>}
            
            <Button className="w-full h-12 text-[15px]" onClick={handleAnalyze} disabled={!text.trim() || loading}>
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : 'Analyze Bill'}
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-5">
              
              {/* Summary */}
              <div className="p-4 rounded-[16px] bg-[#F5F5F7] border border-app-border/50">
                <p className="text-[15px] text-app-text font-medium leading-relaxed">{result.summary}</p>
              </div>

              {/* Explanation */}
              <div className="p-4 rounded-[16px] bg-white border border-app-border/60 shadow-sm flex gap-3 items-start">
                <Info className="text-[#1976D2] shrink-0 mt-0.5" size={18} />
                <div>
                  <h3 className="text-[12px] font-semibold text-app-text-secondary mb-1 uppercase tracking-wider">Simple Explanation</h3>
                  <p className="text-[14px] text-app-text leading-relaxed">{result.explanation}</p>
                </div>
              </div>

              {/* Key Charges */}
              {result.keyCharges && result.keyCharges.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-semibold text-app-text-secondary mb-2 uppercase tracking-wider">Key Charges</h3>
                  <div className="space-y-2">
                    {result.keyCharges.map((charge, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-[12px] bg-[#F5F5F7]">
                        <span className="text-[14px] text-app-text font-medium">{charge.description}</span>
                        <span className="text-[14px] text-app-text font-semibold">{charge.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fees or Interest */}
              {result.feesOrInterest && result.feesOrInterest.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-semibold text-app-text-secondary mb-2 uppercase tracking-wider">Fees & Interest</h3>
                  <div className="space-y-2">
                    {result.feesOrInterest.map((fee, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-[12px] bg-[#FFF0F0] border border-[#FFE0E0]">
                        <div className="flex items-center gap-2 text-[#D32F2F]">
                          <AlertCircle size={14} />
                          <span className="text-[14px] font-medium">{fee.description}</span>
                        </div>
                        <span className="text-[14px] text-[#D32F2F] font-semibold">{fee.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insight */}
              <div className="p-4 rounded-[16px] bg-gradient-to-br from-[#F3E5F5] to-[#E1BEE7] border border-[#CE93D8]/30 shadow-sm flex gap-3 items-start">
                <Lightbulb className="text-[#8E24AA] shrink-0 mt-0.5" size={18} />
                <div>
                  <h3 className="text-[12px] font-semibold text-[#6A1B9A] mb-1 uppercase tracking-wider">Insight</h3>
                  <p className="text-[14px] text-[#4A148C] font-medium leading-relaxed">{result.insight}</p>
                </div>
              </div>

              <Button variant="outline" className="w-full h-12 text-[15px]" onClick={() => setResult(null)}>
                Analyze Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
