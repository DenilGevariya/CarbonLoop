import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MatchFiltersProps {
  activeFilter: string;
  onFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Matches' },
  { id: 'excellent', label: 'Excellent (≥90%)' },
  { id: 'strong', label: 'Strong (80–89%)' },
  { id: 'near', label: 'Near Matches' },
];

export const MatchFilters: React.FC<MatchFiltersProps> = ({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E2DDD5] pb-4">
      <div className="flex items-center gap-1 bg-[#EFECE4] border border-[#E2DDD5] p-1 rounded-xl w-full sm:w-auto">
        {FILTER_OPTIONS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={cn(
                "text-xs font-mono font-bold rounded-lg px-4 py-1.5 transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-[#173D32] text-white shadow-2xs"
                  : "text-stone-600 hover:text-[#171A18] hover:bg-stone-200/60"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs font-mono text-[#5C6560] w-full sm:w-auto justify-end">
        <span>Sort By:</span>
        <Select value={sortBy} onValueChange={(val) => val && onSortChange(val)}>
          <SelectTrigger className="w-48 bg-white border-[#E2DDD5] text-[#171A18] text-xs font-mono rounded-lg shadow-2xs">
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E2DDD5] text-[#171A18] text-xs font-mono">
            <SelectItem value="score_desc">Highest Score</SelectItem>
            <SelectItem value="price_asc">Lowest Delivered Cost</SelectItem>
            <SelectItem value="distance_asc">Shortest Distance</SelectItem>
            <SelectItem value="volume_desc">Highest Volume Available</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
