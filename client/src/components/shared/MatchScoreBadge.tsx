import React from 'react';
import { cn } from '@/lib/utils';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({ score, size = 'md', className }) => {
  const getScoreColor = (val: number) => {
    if (val >= 90) return 'bg-[#173D32] text-white border-[#173D32]';
    if (val >= 75) return 'bg-[#3C6E5C] text-white border-[#3C6E5C]';
    return 'bg-[#8C6D38] text-white border-[#8C6D38]';
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-bold',
    lg: 'text-sm px-3 py-1.5 font-bold'
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5 rounded-none border font-mono tracking-wider uppercase', getScoreColor(score), sizes[size], className)}>
      <span className="size-1.5 bg-white inline-block" />
      <span>{score}% Match</span>
    </div>
  );
};

