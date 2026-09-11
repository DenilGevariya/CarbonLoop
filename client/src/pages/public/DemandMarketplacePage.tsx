import React, { useState } from 'react';
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
  const [filters, setFilters] = useState<RequirementFilterParams>({
    page: 1,
    limit: 12,
    sort: 'newest',
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
    <div className="min-h-screen bg-[#FAF8F5]">
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
          <div className="bg-white border border-[#E2DDD5] p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3 font-mono text-xs text-[#173D32] font-bold uppercase tracking-wider">
              <PieChart className="w-4 h-4 text-[#173D32]" /> Network Utilization Breakdown
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-[11px]">
              {statsData.utilizationBreakdown.map((item) => (
                <button
                  type="button"
                  key={item.code}
                  onClick={() => handleFilterChange({ utilization_code: item.code, page: 1 })}
                  className={`p-2.5 border text-left transition-colors cursor-pointer ${
                    filters.utilization_code === item.code
                      ? 'bg-[#173D32] text-white border-[#173D32]'
                      : 'bg-[#FAF8F5] text-stone-700 border-[#E2DDD5] hover:border-[#173D32]'
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
          <div className="flex items-center justify-between bg-white px-6 py-4 border border-[#E2DDD5] shadow-2xs font-mono text-xs">
            <span className="text-stone-500">
              Page <span className="font-bold text-[#171A18]">{pagination.page}</span> of{' '}
              <span className="font-bold text-[#171A18]">{pagination.totalPages}</span> ({pagination.total} total requirements)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="border-[#E2DDD5] text-xs h-8 rounded-none"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                className="border-[#E2DDD5] text-xs h-8 rounded-none"
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
