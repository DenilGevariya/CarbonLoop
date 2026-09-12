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
      <h2 className={cn("text-3xl md:text-5xl font-bold tracking-tight leading-[1.15]", dark ? "text-white" : "text-[#2A3547]")}>
        {title}{' '}
        {highlightTitle && (
          <span className={dark ? "text-[#5D87FF] font-bold" : "text-[#5D87FF] font-bold"}>
            {highlightTitle}
          </span>
        )}
      </h2>
      {description && (
        <p className={cn("text-base md:text-lg font-normal leading-relaxed max-w-2xl", dark ? "text-[#98A6AD]" : "text-[#5A6A85]")}>
          {description}
        </p>
      )}
    </div>
  );
};

