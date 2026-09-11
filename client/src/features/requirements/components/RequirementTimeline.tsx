import React from 'react';
import { Calendar } from 'lucide-react';

interface RequirementTimelineProps {
  requiredFrom?: string | null;
  requiredUntil?: string | null;
  className?: string;
}

export const RequirementTimeline: React.FC<RequirementTimelineProps> = ({
  requiredFrom,
  requiredUntil,
  className = '',
}) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Flexible';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const fromFormatted = formatDate(requiredFrom);
  const untilFormatted = formatDate(requiredUntil);

  return (
    <div className={`flex items-center gap-2 font-mono text-xs text-stone-600 ${className}`}>
      <Calendar className="w-3.5 h-3.5 text-[#173D32]" />
      <span>
        Window:{' '}
        <strong className="text-[#171A18] font-bold">
          {fromFormatted} — {untilFormatted}
        </strong>
      </span>
    </div>
  );
};
