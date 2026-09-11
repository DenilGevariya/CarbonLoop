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
    <div className={cn('bg-[#FAF8F5] p-6 border border-[#E2DDD5] flex flex-col gap-3 relative group hover:border-[#173D32] transition-colors', className)}>
      <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
        <span className="text-[11px] font-mono text-[#5C6560] uppercase tracking-widest font-semibold">{label}</span>
        {Icon && <Icon className="size-4 text-[#173D32]" />}
      </div>
      <div className="text-3xl md:text-4xl font-black text-[#171A18] font-mono tracking-tight flex items-baseline gap-1">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      {subtext && <p className="text-xs font-serif text-[#5C6560] mt-1">{subtext}</p>}
    </div>
  );
};

