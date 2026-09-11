import React from 'react';
import { cn } from '@/lib/utils';

interface EyebrowLabelProps {
  children: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
  dark?: boolean;
}

export const EyebrowLabel: React.FC<EyebrowLabelProps> = ({ children, icon: Icon, className, dark = false }) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-sm text-[11px] font-mono uppercase tracking-widest font-semibold transition-colors",
        dark
          ? "bg-white/10 border border-white/15 text-[#A3B899]"
          : "bg-[#EBE7DF] border border-[#DCD6C9] text-[#173D32]",
        className
      )}
    >
      {Icon && <Icon className="size-3 text-current" />}
      <span>{children}</span>
    </div>
  );
};

