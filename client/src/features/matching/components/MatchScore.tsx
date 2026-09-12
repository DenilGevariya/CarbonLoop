import React from 'react';
import { cn } from '@/lib/utils';
import type { MatchGrade } from '../types/matching.types';

interface MatchScoreProps {
  score: number;
  grade: MatchGrade;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  score,
  grade,
  size = 'md',
  className,
}) => {
  const getGradeStyle = (g: MatchGrade) => {
    switch (g) {
      case 'EXCELLENT':
        return 'bg-[#173D32]/10 text-[#173D32] border-[#173D32]/30';
      case 'STRONG':
        return 'bg-[#3C6E5C]/10 text-[#3C6E5C] border-[#3C6E5C]/30';
      case 'GOOD':
        return 'bg-amber-600/10 text-amber-800 border-amber-600/30';
      case 'POSSIBLE':
        return 'bg-orange-600/10 text-orange-800 border-orange-600/30';
      case 'WEAK':
      default:
        return 'bg-rose-600/10 text-rose-800 border-rose-600/30';
    }
  };

  const textSizes = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3.5 py-1.5',
    lg: 'text-base px-5 py-2',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border font-mono tracking-tight font-bold shadow-2xs',
        getGradeStyle(grade),
        textSizes[size],
        className
      )}
    >
      <span className="size-2 rounded-full bg-current" />
      <span>{score.toFixed(1)} / 100</span>
      <span className="text-[10px] opacity-80 font-mono font-semibold uppercase tracking-wider ml-1 border-l border-current/30 pl-2">
        {grade}
      </span>
    </div>
  );
};
