import { Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

export function InsightCard({ insight }: { insight: string | null }) {
  if (!insight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 p-4 rounded-[16px] bg-[#F5F5F7] border border-app-border/50 flex gap-3 items-start"
    >
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#F5A623] shrink-0 shadow-sm">
        <Lightbulb size={16} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-app-text-secondary mb-0.5 uppercase tracking-wider">Spending Insight</p>
        <p className="text-[14px] text-app-text leading-relaxed font-medium">{insight}</p>
      </div>
    </motion.div>
  );
}
