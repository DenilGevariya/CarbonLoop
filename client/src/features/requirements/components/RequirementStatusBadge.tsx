import React from 'react';
import type { RequirementStatus } from '../types/requirement';

interface RequirementStatusBadgeProps {
  status: RequirementStatus | string;
  className?: string;
}

export const RequirementStatusBadge: React.FC<RequirementStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const normStatus = (status || 'DRAFT').toUpperCase();

  switch (normStatus) {
    case 'PUBLISHED':
    case 'ACTIVE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none font-mono text-[10px] font-bold uppercase tracking-wider bg-[#173D32]/10 text-[#173D32] border border-[#173D32]/30 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-[#173D32] animate-pulse" />
          Published
        </span>
      );

    case 'DRAFT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none font-mono text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/30 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-amber-500" />
          Draft
        </span>
      );

    case 'PAUSED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none font-mono text-[10px] font-bold uppercase tracking-wider bg-stone-500/10 text-stone-700 border border-stone-400 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-stone-500" />
          Paused
        </span>
      );

    case 'FULFILLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none font-mono text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-800 border border-blue-400 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-blue-600" />
          Fulfilled
        </span>
      );

    case 'EXPIRED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none font-mono text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-800 border border-rose-400 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-rose-600" />
          Expired
        </span>
      );

    case 'ARCHIVED':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none font-mono text-[10px] font-bold uppercase tracking-wider bg-stone-200 text-stone-600 border border-stone-300 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-stone-400" />
          Archived
        </span>
      );
  }
};
