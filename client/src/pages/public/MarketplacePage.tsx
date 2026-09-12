import React, { useState } from 'react';
import { useMarketplaceListings, useMarketplaceStats } from '@/features/listings/hooks/useListings';
import { MarketplaceHeader } from '@/features/listings/components/MarketplaceHeader';
import { MarketplaceFilterBar } from '@/features/listings/components/MarketplaceFilterBar';
import { MarketplaceTable } from '@/features/listings/components/MarketplaceTable';
import type { ListingFilterParams } from '@/features/listings/types/listing';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const [filters, setFilters] = useState<ListingFilterParams>({
    page: 1,
    limit: 12,
    sort: 'newest',
  });

  const { data: listingsData, isLoading: listingsLoading } = useMarketplaceListings(filters);
  const { data: statsData, isLoading: statsLoading } = useMarketplaceStats();

  const handleFilterChange = (newFilters: Partial<ListingFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort: 'newest',
    });
  };

  const items = listingsData?.items || listingsData?.data || [];
  const pagination = listingsData?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };

  return (
    <div className="min-h-screen bg-[#F6F9FC] font-sans">
      {/* Header with Aggregate Analytics */}
      <MarketplaceHeader stats={statsData} isLoading={statsLoading} />

      {/* Filter Bar Controls */}
      <MarketplaceFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Primary Data Table Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <MarketplaceTable
          listings={items}
          isLoading={listingsLoading}
          onResetFilters={handleResetFilters}
        />

        {/* Pagination Bar */}
        {!listingsLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-[#E5EAEF] shadow-xs text-xs font-medium text-[#5A6A85]">
            <span>
              Showing page <span className="font-bold text-[#2A3547]">{pagination.page}</span> of{' '}
              <span className="font-bold text-[#2A3547]">{pagination.totalPages}</span> ({pagination.total} total streams)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="border-[#E5EAEF] text-xs h-8 text-[#2A3547] hover:border-[#5D87FF] rounded-lg"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                className="border-[#E5EAEF] text-xs h-8 text-[#2A3547] hover:border-[#5D87FF] rounded-lg"
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

export default MarketplacePage;
