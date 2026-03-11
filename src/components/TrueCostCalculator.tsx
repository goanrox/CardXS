import { useState, useRef } from 'react';
import { Card, Button, Input, Label } from './ui';
import { Calculator, Share, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InsightCard } from './InsightCard';

export function TrueCostCalculator() {
  const [price, setPrice] = useState('');
  const [apr, setApr] = useState('');
  const [payment, setPayment] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const p = parseFloat(price);
    const r = parseFloat(apr) / 100 / 12;
    const m = parseFloat(payment);

    if (!p || !r || !m) return;

    if (m <= p * r) {
      setResult({
        error: "Your monthly payment is too low to cover the interest. You will never pay off this purchase."
      });
      return;
    }

    // n = -ln(1 - P*r/M) / ln(1+r)
    const months = -Math.log(1 - (p * r) / m) / Math.log(1 + r);
    const totalMonths = Math.ceil(months);
    const totalPaid = totalMonths * m;
    const totalInterest = totalPaid - p;

    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    let timeString = '';
    if (years > 0) timeString += `${years} year${years > 1 ? 's' : ''} `;
    if (remainingMonths > 0 || years === 0) timeString += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;

    setResult({
      price: p,
      totalCost: totalPaid,
      totalInterest: totalInterest,
      time: timeString.trim(),
      message: `At this rate, your $${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} purchase will actually cost you $${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`
    });
  };

  const generateInsight = () => {
    if (!result || result.error) return null;
    
    if (result.totalInterest > result.price * 0.5) {
      return `You are paying over 50% of the original price in interest! Consider saving up for this purchase instead of financing it.`;
    }
    
    if (result.totalInterest > 0) {
      return `This purchase will cost you an extra $${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in interest. Paying it off sooner will save you money.`;
    }
    
    return null;
  };

  const handleShare = async () => {
    if (navigator.share && result && !result.error) {
      try {
        await navigator.share({
          title: 'CardXS True Cost',
          text: `I just checked the true cost of a $${result.price.toLocaleString()} purchase. It will actually cost $${result.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} after interest! Calculate yours on CardXS.`,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      alert("Take a screenshot of the card below to share!");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto w-full p-5 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#FCE4EC] flex items-center justify-center text-[#D81B60] shrink-0">
          <Calculator size={24} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-app-text">True Cost Calculator</h2>
          <p className="text-[14px] text-app-text-secondary mt-1">See the real price of your purchase after interest.</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Label>Purchase Price</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-8 h-11 text-[15px]"
                    value={price}
                    onChange={(e: any) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>APR</Label>
                <div className="relative mt-1">
                  <Input 
                    type="number" 
                    placeholder="24.99" 
                    className="pr-8 h-11 text-[15px]"
                    value={apr}
                    onChange={(e: any) => setApr(e.target.value)}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">%</span>
                </div>
              </div>
              <div>
                <Label>Monthly Payment</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-8 h-11 text-[15px]"
                    value={payment}
                    onChange={(e: any) => setPayment(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <Button className="w-full h-12 text-[15px]" onClick={handleCalculate} disabled={!price || !apr || !payment}>
              Calculate True Cost
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
            {result.error ? (
              <div className="space-y-5">
                <div className="p-5 rounded-[20px] bg-[#FFF3E0] flex gap-3">
                  <AlertTriangle className="text-[#F57C00] shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-[12px] font-semibold text-[#E65100] mb-1.5 uppercase tracking-wider">Payment Too Low</p>
                    <p className="text-[14px] text-[#E65100]/90 leading-relaxed font-medium">{result.error}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full h-12 text-[15px]" onClick={() => setResult(null)}>
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Shareable Card Area */}
                <div className="p-5 md:p-6 rounded-[24px] bg-gradient-to-br from-[#1D1D1F] to-[#434353] text-white shadow-lg relative overflow-hidden">
                  {/* Decorative background element */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                  
                  <p className="text-[13px] text-white/80 font-medium mb-6 relative z-10 leading-relaxed max-w-[90%]">
                    {result.message}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div>
                      <p className="text-[11px] font-semibold text-white/60 mb-1 uppercase tracking-wider">Total Cost</p>
                      <p className="text-3xl sm:text-4xl font-semibold tracking-tighter">
                        ${result.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-white/60 mb-1 uppercase tracking-wider">Interest Paid</p>
                      <p className="text-3xl sm:text-4xl font-semibold tracking-tighter text-[#FF5252]">
                        ${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-[11px] font-semibold text-white/60 mb-0.5 uppercase tracking-wider">Payoff Time</p>
                      <p className="text-[15px] font-medium">{result.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold tracking-tight">CardXS</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="secondary" className="w-full h-12 text-[15px] flex items-center justify-center gap-2" onClick={handleShare}>
                    <Share size={16} /> Share
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-[15px]" onClick={() => setResult(null)}>
                    Calculate Another
                  </Button>
                </div>

                <InsightCard insight={generateInsight()} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
