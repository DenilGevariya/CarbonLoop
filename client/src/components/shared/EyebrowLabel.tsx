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
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide transition-colors",
        dark
          ? "bg-white/10 border border-white/15 text-blue-300"
          : "bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF]",
        className
      )}
    >
      {Icon && <Icon className="size-3 text-current" />}
      <span>{children}</span>
    </div>
  );
};

