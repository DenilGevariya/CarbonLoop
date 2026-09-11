import React from 'react';
import type { ListingStatus } from '../types/listing';

interface Props {
  status: ListingStatus | string;
  className?: string;
}

export const ListingStatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const normalized = (status || '').toUpperCase();

  let colorStyles = 'bg-stone-100 text-stone-700 border-stone-300';
  let label = normalized;

  switch (normalized) {
    case 'PUBLISHED':
    case 'ACTIVE':
      colorStyles = 'bg-[#173D32]/10 text-[#173D32] border-[#173D32]/30';
      label = 'PUBLISHED';
      break;
    case 'DRAFT':
      colorStyles = 'bg-amber-100 text-amber-900 border-amber-300';
      label = 'DRAFT';
      break;
    case 'PAUSED':
      colorStyles = 'bg-purple-100 text-purple-900 border-purple-300';
      label = 'PAUSED';
      break;
    case 'EXHAUSTED':
    case 'SOLD_OUT':
      colorStyles = 'bg-blue-100 text-blue-900 border-blue-300';
      label = 'EXHAUSTED';
      break;
    case 'EXPIRED':
      colorStyles = 'bg-orange-100 text-orange-900 border-orange-300';
      label = 'EXPIRED';
      break;
    case 'ARCHIVED':
    case 'CANCELLED':
      colorStyles = 'bg-stone-200 text-stone-600 border-stone-400';
      label = 'ARCHIVED';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${colorStyles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {label}
    </span>
  );
};
