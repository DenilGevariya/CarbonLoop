import React from 'react';
import { cn } from '@/lib/utils';
import { EyebrowLabel } from './EyebrowLabel';

interface SectionHeadingProps {
  eyebrow?: string;
  eyebrowIcon?: React.ElementType;
  title: string;
  highlightTitle?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  dark?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  eyebrowIcon,
  title,
  highlightTitle,
  description,
  align = 'center',
  className,
  dark = false
}) => {
  return (
    <div className={cn('flex flex-col gap-3 max-w-3xl', align === 'center' && 'text-center items-center mx-auto', align === 'left' && 'text-left items-start', align === 'right' && 'text-right items-end', className)}>
      {eyebrow && <EyebrowLabel icon={eyebrowIcon} dark={dark}>{eyebrow}</EyebrowLabel>}
      <h2 className={cn("text-3xl md:text-5xl font-black tracking-tight leading-[1.15]", dark ? "text-white" : "text-[#171A18]")}>
        {title}{' '}
        {highlightTitle && (
          <span className={dark ? "text-[#A3B899] font-normal italic" : "text-[#173D32] font-normal italic"}>
            {highlightTitle}
          </span>
        )}
      </h2>
      {description && (
        <p className={cn("text-base md:text-lg font-serif leading-relaxed max-w-2xl", dark ? "text-[#B0BAC3]" : "text-[#5C6560]")}>
          {description}
        </p>
      )}
    </div>
  );
};

