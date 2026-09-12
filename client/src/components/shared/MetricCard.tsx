import React from 'react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/animations';

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  subtext?: string;
  icon?: React.ElementType;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  suffix = '',
  prefix = '',
  subtext,
  icon: Icon,
  className
}) => {
  return (
    <div className={cn('bg-white p-6 border border-[#E5EAEF] rounded-xl flex flex-col gap-3 relative group hover:border-[#5D87FF] transition-all shadow-xs hover:shadow-md', className)}>
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-semibold text-[#5A6A85] uppercase tracking-wide">{label}</span>
        {Icon && (
          <div className="size-10 bg-[#ECF2FF] text-[#5D87FF] rounded-full flex items-center justify-center group-hover:bg-[#5D87FF] group-hover:text-white transition-colors">
            <Icon className="size-5" />
          </div>
        )}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-[#2A3547] font-mono-tnum tracking-tight flex items-baseline gap-1">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      {subtext && <p className="text-xs text-[#5A6A85] font-medium">{subtext}</p>}
    </div>
  );
};

