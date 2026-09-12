import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MatchFiltersProps {
  activeFilter: string;
  onFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const MatchFilters: React.FC<MatchFiltersProps> = ({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E2DDD5] pb-4">
      <Tabs value={activeFilter} onValueChange={onFilterChange} className="w-full sm:w-auto">
        <TabsList className="bg-[#EFECE4] border border-[#E2DDD5] p-1 rounded-xl">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[#173D32] data-[state=active]:text-white text-xs font-mono font-bold rounded-lg px-4 py-1.5 transition-colors"
          >
            All Matches
          </TabsTrigger>
          <TabsTrigger
            value="excellent"
            className="data-[state=active]:bg-[#173D32] data-[state=active]:text-white text-xs font-mono font-bold rounded-lg px-4 py-1.5 transition-colors"
          >
            Excellent (≥90%)
          </TabsTrigger>
          <TabsTrigger
            value="strong"
            className="data-[state=active]:bg-[#3C6E5C] data-[state=active]:text-white text-xs font-mono font-bold rounded-lg px-4 py-1.5 transition-colors"
          >
            Strong (≥80%)
          </TabsTrigger>
          <TabsTrigger
            value="near"
            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-xs font-mono font-bold rounded-lg px-4 py-1.5 transition-colors"
          >
            Near Matches
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
