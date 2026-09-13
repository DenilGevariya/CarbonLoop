import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useRequirements,
  useRequirementStats,
  useUtilizationTypes,
} from '@/features/requirements/hooks/useRequirements';
import { RequirementHeader } from '@/features/requirements/components/RequirementHeader';
import { RequirementFilterBar } from '@/features/requirements/components/RequirementFilterBar';
import { RequirementTable } from '@/features/requirements/components/RequirementTable';
import type { RequirementFilterParams } from '@/features/requirements/types/requirement';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PieChart } from 'lucide-react';

export const DemandMarketplacePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [filters, setFilters] = useState<RequirementFilterParams>({
    page: 1,
    limit: 12,
    sort: 'newest',
    search: initialSearch,
  });

  const { data: reqData, isLoading: reqLoading } = useRequirements(filters);
  const { data: statsData, isLoading: statsLoading } = useRequirementStats();
  const { data: utilizationTypes = [] } = useUtilizationTypes();

  const handleFilterChange = (newFilters: Partial<RequirementFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort: 'newest',
    });
  };

  const items = reqData?.items || [];
  const pagination = reqData?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      {/* Header with Aggregate Analytics */}
      <RequirementHeader stats={statsData} isLoading={statsLoading} />

      {/* Filter Bar Controls */}
      <RequirementFilterBar
        filters={filters}
        utilizationTypes={utilizationTypes}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Primary Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Utilization Pathway Breakdown Bar */}
        {statsData?.utilizationBreakdown && statsData.utilizationBreakdown.length > 0 && (
          <div className="bg-white border border-[#E5EAEF] p-5 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-xs text-[#5D87FF] font-bold uppercase tracking-wider">
              <PieChart className="w-4 h-4 text-[#5D87FF]" /> Network Utilization Breakdown
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
              {statsData.utilizationBreakdown.map((item: { code: string; name: string; percentage: number }) => (
                <button
                  type="button"
                  key={item.code}
                  onClick={() => handleFilterChange({ utilization_code: item.code, page: 1 })}
                  className={`p-3 border rounded-lg text-left transition-colors cursor-pointer ${
                    filters.utilization_code === item.code
                      ? 'bg-[#5D87FF] text-white border-[#5D87FF]'
                      : 'bg-[#F6F9FC] text-[#5A6A85] border-[#E5EAEF] hover:border-[#5D87FF] hover:text-[#5D87FF]'
                  }`}
                >
                  <span className="block font-bold text-xs truncate">{item.name}</span>
                  <span className="block opacity-80 text-[10px]">{item.percentage}% of demand</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        <RequirementTable
          requirements={items}
          isLoading={reqLoading}
          isOwnerView={false}
          onResetFilters={handleResetFilters}
        />

        {/* Pagination Bar */}
        {!reqLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 border border-[#E5EAEF] rounded-xl shadow-xs text-xs">
            <span className="text-[#5A6A85]">
              Page <span className="font-bold text-[#2A3547]">{pagination.page}</span> of{' '}
              <span className="font-bold text-[#2A3547]">{pagination.totalPages}</span> ({pagination.total} total requirements)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="border-[#E5EAEF] text-xs h-8 rounded-lg"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                className="border-[#E5EAEF] text-xs h-8 rounded-lg"
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemandMarketplacePage;
