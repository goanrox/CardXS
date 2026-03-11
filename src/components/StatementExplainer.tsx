import { useState } from 'react';
import { Card, Button, Input, Label, Textarea } from './ui';
import { AlertCircle, ShieldAlert, Info, Clock, TrendingUp, CreditCard, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InsightCard } from './InsightCard';

type InputMode = 'form' | 'paste';

export function StatementExplainer({ onResult }: { onResult?: (utilization: number, risk: string) => void }) {
  const [inputMode, setInputMode] = useState<InputMode>('form');

  // Form state
  const [balance, setBalance] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [apr, setApr] = useState('');
  const [interestCharged, setInterestCharged] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  
  const [paymentBehavior, setPaymentBehavior] = useState<'minimum' | 'custom' | 'full'>('minimum');
  const [customPayment, setCustomPayment] = useState('');

  // Paste state
  const [text, setText] = useState('');

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (val: number) => {
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculatePayoff = (bal: number, rate: number, payment: number) => {
    if (payment >= bal) {
      return { months: 1, totalInterest: 0, isInfinite: false };
    }
    const monthlyRate = rate / 100 / 12;
    if (payment <= bal * monthlyRate) {
      return { months: 0, totalInterest: 0, isInfinite: true };
    }
    const months = -Math.log(1 - (bal * monthlyRate) / payment) / Math.log(1 + monthlyRate);
    const totalInterest = (payment * months) - bal;
    return { months, totalInterest, isInfinite: false };
  };

  const formatTime = (months: number, isInfinite: boolean) => {
    if (isInfinite) return 'Never (Payment too low)';
    const m = Math.ceil(months);
    if (m <= 1) return '1 month';
    if (m < 12) return `${m} months`;
    const y = Math.floor(m / 12);
    const rem = m % 12;
    return `${y} year${y > 1 ? 's' : ''}${rem > 0 ? ` ${rem} mo` : ''}`;
  };

  const handleAnalyze = async () => {
    setError('');
    setResult(null);

    let bal = parseFloat(balance) || 0;
    let minPay = parseFloat(minPayment) || 0;
    let rate = parseFloat(apr) || 0;
    let interest = parseFloat(interestCharged) || 0;
    let limit = parseFloat(creditLimit) || 0;
    let summaryText = '';

    if (inputMode === 'paste' && text.trim()) {
      setLoading(true);
      try {
        const res = await fetch('/api/explain-statement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to analyze statement');
        
        // Prioritize form fields if they exist, otherwise use parsed data
        bal = parseFloat(balance) || parseFloat(data.balance) || 0;
        minPay = parseFloat(minPayment) || parseFloat(data.minPayment) || 0;
        rate = parseFloat(apr) || parseFloat(data.apr) || 0;
        interest = parseFloat(interestCharged) || parseFloat(data.interestCharged) || 0;
        limit = parseFloat(creditLimit) || parseFloat(data.creditLimit) || 0;
        summaryText = data.summary || '';
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    if (bal <= 0) {
      setError('Please enter a valid Statement Balance.');
      return;
    }

    let payment = 0;
    if (paymentBehavior === 'full') payment = bal;
    else if (paymentBehavior === 'minimum') payment = minPay;
    else if (paymentBehavior === 'custom') payment = parseFloat(customPayment) || 0;

    // Credit Utilization
    let utilization = 0;
    if (limit > 0) {
      utilization = (bal / limit) * 100;
    }

    // Current Plan Payoff
    const currentPlan = calculatePayoff(bal, rate, payment);
    
    // Minimum Payment Projection
    const minPlan = calculatePayoff(bal, rate, minPay);

    // Interest Risk
    let risk = 'LOW';
    if (currentPlan.isInfinite) risk = 'CRITICAL 🚨';
    else if (paymentBehavior === 'minimum' || currentPlan.months > 60) risk = 'HIGH ⚠️';
    else if (currentPlan.months > 12) risk = 'MEDIUM 🟡';
    else if (currentPlan.months > 1) risk = 'LOW 🟢';
    else risk = 'NONE 🌟';

    // Explanation
    let explanation = summaryText;
    if (!explanation) {
      if (currentPlan.isInfinite) {
        explanation = "You are currently carrying a balance that is accruing interest faster than you are paying it off.";
      } else if (paymentBehavior === 'minimum') {
        explanation = "You are carrying a balance and paying only the minimum, which maximizes your interest costs.";
      } else if (paymentBehavior === 'full' || payment >= bal) {
        explanation = "You are paying your balance in full, avoiding all interest charges. Great job!";
      } else {
        explanation = "You are currently carrying a balance that is accruing interest, but paying more than the minimum will help you pay it off faster.";
      }
    }

    setResult({
      balance: bal,
      minPayment: minPay,
      apr: rate,
      interestCharged: interest,
      creditLimit: limit,
      utilization,
      risk,
      currentPlan: {
        timeString: formatTime(currentPlan.months, currentPlan.isInfinite),
        totalInterest: currentPlan.isInfinite ? null : currentPlan.totalInterest,
        isInfinite: currentPlan.isInfinite
      },
      minPlan: {
        timeString: formatTime(minPlan.months, minPlan.isInfinite),
        totalInterest: minPlan.isInfinite ? null : minPlan.totalInterest,
        totalCost: minPlan.isInfinite ? null : bal + minPlan.totalInterest,
        isInfinite: minPlan.isInfinite
      },
      explanation,
      paymentBehavior
    });

    if (onResult) {
      onResult(utilization, risk);
    }
  };

  const generateInsight = () => {
    if (!result) return null;
    
    if (result.currentPlan.isInfinite) {
      return "Your current payment plan will never pay off the balance. You must increase your payment to avoid spiraling debt.";
    }
    
    if (result.utilization > 30) {
      return `Your credit utilization is above the recommended 30% (currently ${result.utilization.toFixed(0)}%). Try to pay down the balance to improve your credit score.`;
    }
    
    if (result.paymentBehavior === 'minimum' && result.minPlan.totalInterest > 0) {
      return `Paying $50 or $100 more per month instead of the minimum would significantly reduce your $${formatCurrency(result.minPlan.totalInterest)} in projected interest costs.`;
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
            className="space-y-6"
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
                Paste Statement
              </button>
            </div>

            {inputMode === 'form' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <Label>Statement Balance</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="pl-8 h-11 text-[15px]"
                      value={balance}
                      onChange={(e: any) => setBalance(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Label>Minimum Payment</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="pl-8 h-11 text-[15px]"
                      value={minPayment}
                      onChange={(e: any) => setMinPayment(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>APR</Label>
                  <div className="relative mt-1">
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="pr-8 h-11 text-[15px]"
                      value={apr}
                      onChange={(e: any) => setApr(e.target.value)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">%</span>
                  </div>
                </div>

                <div>
                  <Label>Interest Charged</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="pl-8 h-11 text-[15px]"
                      value={interestCharged}
                      onChange={(e: any) => setInterestCharged(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <Label>Credit Limit</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="pl-8 h-11 text-[15px]"
                      value={creditLimit}
                      onChange={(e: any) => setCreditLimit(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Label>Paste Statement</Label>
                <p className="text-[13px] text-app-text-secondary mb-2 leading-relaxed">Paste the text from your credit card statement. We'll extract the numbers for you.</p>
                <Textarea 
                  placeholder="Paste statement text here..." 
                  rows={6}
                  value={text}
                  onChange={(e: any) => setText(e.target.value)}
                  disabled={loading}
                  className="text-[14px]"
                />
              </div>
            )}

            <div className="pt-4 border-t border-app-border/50">
              <Label className="mb-2 block">Payment Plan</Label>
              <select 
                className="w-full bg-[#F5F5F7] border border-transparent rounded-xl px-3 h-11 text-app-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary/30 transition-all text-[15px] mb-3"
                value={paymentBehavior}
                onChange={(e: any) => setPaymentBehavior(e.target.value)}
              >
                <option value="minimum">Minimum payment</option>
                <option value="custom">Custom payment</option>
                <option value="full">Full balance</option>
              </select>

              <AnimatePresence>
                {paymentBehavior === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Label>Monthly Payment</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-8 h-11 text-[15px]"
                        value={customPayment}
                        onChange={(e: any) => setCustomPayment(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {error && <p className="text-[14px] text-red-500 font-medium">{error}</p>}

            <Button 
              className="w-full h-12 text-[15px]" 
              onClick={handleAnalyze} 
              disabled={loading || (inputMode === 'paste' && !text.trim()) || (inputMode === 'form' && !balance)}
            >
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : 'Explain My Statement'}
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
              
              {/* 1. Card Health Summary */}
              <div className="p-5 md:p-6 rounded-[24px] bg-[#1D1D1F] text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-[15px] font-semibold mb-5 flex items-center gap-2 relative z-10">
                  <CreditCard className="text-white/60" size={18} /> Card Health Summary
                </h3>
                
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div>
                    <p className="text-[11px] font-semibold text-white/60 mb-0.5 uppercase tracking-wider">Interest Risk</p>
                    <p className="text-[16px] font-semibold">{result.risk}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white/60 mb-0.5 uppercase tracking-wider">Credit Utilization</p>
                    <p className="text-[16px] font-semibold">{result.utilization > 0 ? `${result.utilization.toFixed(0)}%` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white/60 mb-0.5 uppercase tracking-wider">Est. Payoff Time</p>
                    <p className="text-[16px] font-semibold">{result.currentPlan.timeString}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white/60 mb-0.5 uppercase tracking-wider">Interest Charged</p>
                    <p className="text-[16px] font-semibold">{result.interestCharged > 0 ? `$${formatCurrency(result.interestCharged)}` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* 2. Minimum Payment Projection */}
              {result.minPayment > 0 && result.apr > 0 && (
                <div className="p-5 rounded-[20px] bg-[#FFF3E0]">
                  <h3 className="text-[14px] font-semibold text-[#E65100] mb-3 flex items-center gap-2">
                    <ShieldAlert size={16} /> Minimum Payment Projection
                  </h3>
                  <p className="text-[13px] text-[#E65100]/90 mb-3 font-medium">
                    If you only pay the minimum of ${formatCurrency(result.minPayment)} each month:
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl">
                      <span className="text-[13px] text-[#E65100]/80 font-medium">Estimated Payoff Time</span>
                      <span className="text-[14px] text-[#E65100] font-semibold">{result.minPlan.timeString}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl">
                      <span className="text-[13px] text-[#E65100]/80 font-medium">Total Interest Paid</span>
                      <span className="text-[14px] text-[#E65100] font-semibold">
                        {result.minPlan.isInfinite ? 'Infinite' : `$${formatCurrency(result.minPlan.totalInterest)}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl">
                      <span className="text-[13px] text-[#E65100]/80 font-medium">Total Cost of Balance</span>
                      <span className="text-[14px] text-[#E65100] font-semibold">
                        {result.minPlan.isInfinite ? 'Infinite' : `$${formatCurrency(result.minPlan.totalCost)}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Plain-English Explanation */}
              <div className="p-5 rounded-[20px] bg-[#F5F5F7]">
                <p className="text-[14px] font-semibold text-app-text mb-2 flex items-center gap-2">
                  <Info size={16} className="text-app-text-secondary" /> What this means
                </p>
                <p className="text-[14px] text-app-text-secondary leading-relaxed">{result.explanation}</p>
              </div>

              {/* 4. Insight Card */}
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
