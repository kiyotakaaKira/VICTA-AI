'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { CountUpNumber } from '@/components/ui/CountUpNumber';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  subtext?: string;
  prefix?: string;
  suffix?: string;
  color?: string;
  index?: number;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  prefix = '',
  suffix = '',
  color = '#06b6d4',
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <GlassCard className="p-5 flex items-start gap-4 cursor-default">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-white leading-none">
            <CountUpNumber target={value} prefix={prefix} suffix={suffix} />
          </p>
          {subtext && (
            <p className="text-xs text-slate-500 mt-1">{subtext}</p>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
