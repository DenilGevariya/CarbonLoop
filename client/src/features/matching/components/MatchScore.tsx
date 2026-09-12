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
        return 'bg-[#13DEB9]/15 text-[#0EAB8B] border-[#13DEB9]/30';
      case 'STRONG':
        return 'bg-[#5D87FF]/15 text-[#5D87FF] border-[#5D87FF]/30';
      case 'GOOD':
        return 'bg-amber-500/15 text-amber-700 border-amber-500/30';
      case 'POSSIBLE':
        return 'bg-orange-500/15 text-orange-700 border-orange-500/30';
      case 'WEAK':
      default:
        return 'bg-rose-500/15 text-rose-700 border-rose-500/30';
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
        'inline-flex items-center gap-2 rounded-full border tracking-tight font-bold shadow-xs',
        getGradeStyle(grade),
        textSizes[size],
        className
      )}
    >
      <span className="size-2 rounded-full bg-current" />
      <span>{score.toFixed(1)} / 100</span>
      <span className="text-[10px] opacity-80 font-semibold uppercase tracking-wider ml-1 border-l border-current/30 pl-2">
        {grade}
      </span>
    </div>
  );
};
