import { Card } from './ui';
import { motion } from 'motion/react';
import { Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface HealthScoreData {
  utilization: number | null;
  interestRisk: 'NONE 🌟' | 'LOW 🟢' | 'MEDIUM 🟡' | 'HIGH ⚠️' | 'CRITICAL 🚨' | null;
  usingBestCard: boolean | null;
  takeHomePercentage: number | null;
}

export function calculateHealthScore(data: HealthScoreData) {
  let score = 100;
  let deductions = 0;
  let explanation = '';
  let tip = '';

  // 1. Credit Card Health (Max 40 points impact)
  if (data.utilization !== null) {
    if (data.utilization > 80) {
      deductions += 30;
      explanation = 'Very high credit utilization is hurting your score.';
      tip = 'Try to pay down your balance to below 30% of your limit.';
    } else if (data.utilization > 30) {
      deductions += 15;
      explanation = 'High credit utilization is lowering your score.';
      tip = 'Keeping your balance below 30% of your limit will improve your score.';
    }
  }

  if (data.interestRisk !== null) {
    if (data.interestRisk === 'CRITICAL 🚨') {
      deductions += 40;
      explanation = 'Critical interest risk is severely impacting your score.';
      tip = 'You must increase your credit card payments to cover more than just the interest.';
    } else if (data.interestRisk === 'HIGH ⚠️') {
      deductions += 25;
      explanation = 'High interest risk is lowering your score.';
      tip = 'Paying more than the minimum will save you money and improve your score.';
    } else if (data.interestRisk === 'MEDIUM 🟡') {
      deductions += 10;
    }
  }

  // 2. Rewards Optimization (Max 20 points impact)
  if (data.usingBestCard === false) {
    deductions += 15;
    if (!explanation) explanation = 'You are missing out on potential credit card rewards.';
    if (!tip) tip = 'Check the Best Card tool before making large purchases.';
  }

  // 3. Paycheck Health (Max 20 points impact)
  if (data.takeHomePercentage !== null) {
    if (data.takeHomePercentage < 50) {
      deductions += 20;
      if (!explanation) explanation = 'A very high percentage of your income is going to deductions.';
      if (!tip) tip = 'Review your paycheck deductions to ensure they are accurate.';
    } else if (data.takeHomePercentage < 65) {
      deductions += 10;
    }
  }

  score = Math.max(0, score - deductions);

  // Determine Tier
  let tier = '';
  let colorClass = '';
  let Icon = CheckCircle2;

  if (score >= 90) {
    tier = 'Excellent';
    colorClass = 'text-[#00C805]';
    Icon = CheckCircle2;
    if (!explanation) explanation = 'Your financial health indicators are looking great!';
    if (!tip) tip = 'Keep up the good habits.';
  } else if (score >= 75) {
    tier = 'Good';
    colorClass = 'text-[#00C805]';
    Icon = TrendingUp;
    if (!explanation) explanation = 'You are in good financial shape, but there is room for optimization.';
  } else if (score >= 60) {
    tier = 'Needs Attention';
    colorClass = 'text-[#F57C00]';
    Icon = Target;
  } else {
    tier = 'Risky';
    colorClass = 'text-[#E65100]';
    Icon = AlertCircle;
  }

  return { score, tier, explanation, tip, colorClass, Icon };
}

export function MoneyHealthScore({ data }: { data: HealthScoreData }) {
  // Only show if we have at least some data
  const hasData = data.utilization !== null || data.interestRisk !== null || data.usingBestCard !== null || data.takeHomePercentage !== null;

  if (!hasData) {
    return (
      <Card className="max-w-4xl mx-auto w-full p-5 md:p-8 bg-gradient-to-br from-[#1D1D1F] to-[#434353] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg md:text-2xl font-semibold tracking-tight mb-1">Money Health Score</h2>
            <p className="text-white/70 text-[13px] leading-snug">
              Use the tools below to analyze your finances. Your score will appear here once we have enough data.
            </p>
          </div>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] border-white/10 flex items-center justify-center shrink-0">
            <span className="text-xl md:text-2xl font-bold text-white/20">--</span>
          </div>
        </div>
      </Card>
    );
  }

  const { score, tier, explanation, tip, colorClass, Icon } = calculateHealthScore(data);

  // Calculate SVG circle properties
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="max-w-4xl mx-auto w-full p-4 md:p-6 bg-gradient-to-br from-[#1D1D1F] to-[#434353] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex items-center gap-4">
          
          {/* Circular Progress */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={28}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
                fill="none"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="32"
                cy="32"
                r={28}
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                className={colorClass}
                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 28 - (score / 100) * (2 * Math.PI * 28) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ strokeDasharray: 2 * Math.PI * 28 }}
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-xl font-bold tracking-tighter">{score}</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold tracking-tight">Health Score</h2>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                <Icon size={10} className={colorClass} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/90">{tier}</span>
              </div>
            </div>
            <p className="text-[12px] text-white/80 leading-snug line-clamp-1">
              {explanation}
            </p>
          </div>
        </div>

        {tip && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2">
            <Target size={14} className="text-[#00C805] shrink-0 mt-0.5" />
            <p className="text-[12px] text-white/90 font-medium leading-snug">{tip}</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
