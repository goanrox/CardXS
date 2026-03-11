import { useState } from 'react';
import { Card, Button, Textarea, Label, Input } from './ui';
import { FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InsightCard } from './InsightCard';

type InputMode = 'form' | 'paste';

export function PaycheckExplainer({ onResult }: { onResult?: (takeHomePercentage: number) => void }) {
  const [inputMode, setInputMode] = useState<InputMode>('form');
  
  // Form state
  const [grossPay, setGrossPay] = useState('');
  const [netPay, setNetPay] = useState('');
  const [fedTax, setFedTax] = useState('');
  const [stateTax, setStateTax] = useState('');
  const [socialSecurity, setSocialSecurity] = useState('');
  const [medicare, setMedicare] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [frequency, setFrequency] = useState('Biweekly');

  // Paste state
  const [text, setText] = useState('');
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (val: number) => {
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleAnalyze = async () => {
    setError('');
    setResult(null);
    
    if (inputMode === 'form') {
      const g = parseFloat(grossPay) || 0;
      const n = parseFloat(netPay) || 0;
      const f = parseFloat(fedTax) || 0;
      const s = parseFloat(stateTax) || 0;
      const ss = parseFloat(socialSecurity) || 0;
      const m = parseFloat(medicare) || 0;
      const o = parseFloat(otherDeductions) || 0;

      if (g <= 0) {
        setError('Please enter a valid Gross Pay.');
        return;
      }

      const totalTaxes = f + s + ss + m;
      const deductionRate = g > 0 ? ((g - n) / g) * 100 : 0;

      const takeHomePercentage = g > 0 ? (n / g) * 100 : 0;
      setResult({
        gross: g,
        net: n,
        totalTaxes,
        otherDeductions: o,
        deductionRate,
        lineItems: [
          { label: 'Federal Tax', meaning: 'Goes to the US government to fund national services.', amount: f },
          { label: 'State Tax', meaning: 'Goes to your state government to fund local services.', amount: s },
          { label: 'Social Security', meaning: 'Funds retirement and disability benefits.', amount: ss },
          { label: 'Medicare', meaning: 'Funds healthcare for seniors.', amount: m },
          { label: 'Other Deductions', meaning: 'May include health insurance, 401(k), or other benefits.', amount: o }
        ].filter(item => item.amount > 0),
        takeaway: `You kept ${takeHomePercentage.toFixed(0)}% of your gross pay after deductions.`
      });
      if (onResult) onResult(takeHomePercentage);
    } else {
      if (!text.trim()) return;
      setLoading(true);
      
      try {
        const res = await fetch('/api/explain-paycheck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to analyze paycheck');
        
        const g = parseFloat(data.gross?.replace(/[^0-9.]/g, '')) || 0;
        const n = parseFloat(data.net?.replace(/[^0-9.]/g, '')) || 0;
        const deductionRate = g > 0 ? ((g - n) / g) * 100 : 0;
        
        let totalTaxes = 0;
        let otherDeds = 0;
        
        data.lineItems?.forEach((item: any) => {
          const amt = parseFloat(item.amount?.replace(/[^0-9.]/g, '')) || 0;
          const label = item.label.toLowerCase();
          if (label.includes('tax') || label.includes('fed') || label.includes('state') || label.includes('medicare') || label.includes('social') || label.includes('fica') || label.includes('oasdi')) {
            totalTaxes += amt;
          } else {
            otherDeds += amt;
          }
        });

        if (totalTaxes === 0 && otherDeds === 0 && g > 0 && n > 0) {
          totalTaxes = g - n;
        }

        const takeHomePercentage = g > 0 ? (n / g) * 100 : 0;
        setResult({
          gross: g,
          net: n,
          totalTaxes,
          otherDeductions: otherDeds,
          deductionRate,
          lineItems: data.lineItems,
          takeaway: data.takeaway || `You kept ${takeHomePercentage.toFixed(0)}% of your gross pay after deductions.`
        });
        if (onResult) onResult(takeHomePercentage);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const generateInsight = () => {
    if (!result || !result.gross || !result.net) return null;
    
    const gross = result.gross;
    const net = result.net;
    
    if (gross > 0 && net > 0) {
      const taxRate = ((gross - net) / gross) * 100;
      if (taxRate > 30) {
        return `Your deductions are about ${taxRate.toFixed(0)}% of gross pay. Consider reviewing your tax withholdings or pre-tax contributions.`;
      } else if (taxRate < 15) {
        return `Your deductions are relatively low at ${taxRate.toFixed(0)}%. Make sure you are withholding enough to avoid a surprise tax bill.`;
      } else {
        return `Your take-home pay is strong relative to your total deductions. You keep ${((net / gross) * 100).toFixed(0)}% of your earnings.`;
      }
    }
    
    return null;
  };

  return (
    <Card className="max-w-2xl mx-auto w-full p-5 md:p-8">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            key="inputs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="space-y-5"
          >
            <div className="flex bg-[#F5F5F7] p-1 rounded-xl mb-6">
              <button
                className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${inputMode === 'form' ? 'bg-white shadow-sm text-app-text' : 'text-app-text-secondary hover:text-app-text'}`}
                onClick={() => setInputMode('form')}
              >
                Easy Form
              </button>
              <button
                className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${inputMode === 'paste' ? 'bg-white shadow-sm text-app-text' : 'text-app-text-secondary hover:text-app-text'}`}
                onClick={() => setInputMode('paste')}
              >
                Paste Pay Stub
              </button>
            </div>

            {inputMode === 'form' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Gross Pay</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                      <Input type="number" placeholder="0.00" className="pl-8 h-11 text-[15px]" value={grossPay} onChange={(e: any) => setGrossPay(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Net Pay</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                      <Input type="number" placeholder="0.00" className="pl-8 h-11 text-[15px]" value={netPay} onChange={(e: any) => setNetPay(e.target.value)} />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Federal Tax</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                      <Input type="number" placeholder="0.00" className="pl-8 h-11 text-[15px]" value={fedTax} onChange={(e: any) => setFedTax(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>State Tax</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                      <Input type="number" placeholder="0.00" className="pl-8 h-11 text-[15px]" value={stateTax} onChange={(e: any) => setStateTax(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Social Security</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                      <Input type="number" placeholder="0.00" className="pl-8 h-11 text-[15px]" value={socialSecurity} onChange={(e: any) => setSocialSecurity(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Medicare</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                      <Input type="number" placeholder="0.00" className="pl-8 h-11 text-[15px]" value={medicare} onChange={(e: any) => setMedicare(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Other Deductions</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                      <Input type="number" placeholder="0.00" className="pl-8 h-11 text-[15px]" value={otherDeductions} onChange={(e: any) => setOtherDeductions(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Pay Frequency</Label>
                    <select 
                      className="w-full bg-[#F5F5F7] border border-transparent rounded-xl px-3 h-11 mt-1 text-app-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary/30 transition-all text-[15px]"
                      value={frequency}
                      onChange={(e: any) => setFrequency(e.target.value)}
                    >
                      <option>Weekly</option>
                      <option>Biweekly</option>
                      <option>Semi-monthly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Label>Paste Pay Stub</Label>
                <p className="text-[13px] text-app-text-secondary mb-2 leading-relaxed">Paste your pay stub or enter a few numbers to see where your money goes.</p>
                <Textarea 
                  placeholder="Paste the text from your pay stub here..." 
                  rows={6}
                  value={text}
                  onChange={(e: any) => setText(e.target.value)}
                  disabled={loading}
                  className="text-[14px]"
                />
              </div>
            )}
            
            {error && <p className="text-[14px] text-red-500 font-medium">{error}</p>}
            
            <Button 
              className="w-full h-12 text-[15px]" 
              onClick={handleAnalyze} 
              disabled={loading || (inputMode === 'paste' && !text.trim())}
            >
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : 'Explain My Paycheck'}
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
            <div className="space-y-6">
              
              {/* 1. Paycheck Snapshot card */}
              <div className="p-5 md:p-6 rounded-[24px] bg-gradient-to-br from-[#1D1D1F] to-[#434353] text-white shadow-lg relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                
                <p className="text-[11px] font-semibold text-white/60 mb-4 uppercase tracking-wider relative z-10">Paycheck Snapshot</p>
                
                <div className="grid grid-cols-2 gap-6 relative z-10 mb-6">
                  <div>
                    <p className="text-[12px] text-white/70 mb-1">Gross Pay</p>
                    <p className="text-2xl sm:text-3xl font-semibold tracking-tight">${formatCurrency(result.gross)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-white/70 mb-1">Net Pay</p>
                    <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#E8F5E9]">${formatCurrency(result.net)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 relative z-10 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[10px] text-white/60 mb-0.5 uppercase tracking-wider">Total Taxes</p>
                    <p className="text-[15px] font-medium">${formatCurrency(result.totalTaxes)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/60 mb-0.5 uppercase tracking-wider">Other Deds</p>
                    <p className="text-[15px] font-medium">${formatCurrency(result.otherDeductions)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/60 mb-0.5 uppercase tracking-wider">Effective Rate</p>
                    <p className="text-[15px] font-medium">{result.deductionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* 2. Deduction Breakdown */}
              {result.lineItems && result.lineItems.length > 0 && (
                <div className="border border-app-border/60 rounded-[20px] overflow-hidden">
                  <details className="group">
                    <summary className="flex items-center justify-between p-4 bg-[#F9FAFB] cursor-pointer list-none font-semibold text-[14px] text-app-text">
                      <span className="flex items-center gap-2">
                        <FileText size={16} className="text-app-text-secondary" />
                        Deduction Breakdown
                      </span>
                      <span className="transition group-open:rotate-180">
                        <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                      </span>
                    </summary>
                    <div className="p-4 pt-0 bg-[#F9FAFB] space-y-2">
                      {result.lineItems.map((item: any, i: number) => (
                        <div key={i} className="p-3 rounded-[14px] bg-white border border-app-border/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-app-text text-[14px]">{item.label}</p>
                            <p className="text-[12px] text-app-text-secondary mt-0.5 leading-snug">{item.meaning}</p>
                          </div>
                          <div className="font-semibold text-app-text text-[14px] sm:text-right whitespace-nowrap">
                            {typeof item.amount === 'number' ? `$${formatCurrency(item.amount)}` : item.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* 3. Simple Takeaway */}
              {result.takeaway && (
                <div className="p-5 rounded-[16px] bg-[#F0F5FF]">
                  <p className="text-[11px] font-semibold text-app-primary mb-1.5 uppercase tracking-wider">Simple Takeaway</p>
                  <p className="text-[14px] text-app-text leading-relaxed font-medium">{result.takeaway}</p>
                </div>
              )}

              {/* 4. Paycheck Insight card */}
              <InsightCard insight={generateInsight()} />

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
