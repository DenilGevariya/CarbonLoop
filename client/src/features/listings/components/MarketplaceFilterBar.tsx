import React from 'react';
import type { ListingFilterParams } from '../types/listing';
import { Search, RotateCcw, MapPin, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface Props {
  filters: ListingFilterParams;
  onFilterChange: (newFilters: Partial<ListingFilterParams>) => void;
  onReset: () => void;
}

export const MarketplaceFilterBar: React.FC<Props> = ({ filters, onFilterChange, onReset }) => {
  const activeFilterCount = [
    filters.search,
    filters.location,
    filters.minPurity,
    filters.physicalForm,
    filters.minQuantity,
    filters.maxPrice,
    filters.deliveryAvailable,
    filters.pickupAvailable,
  ].filter(Boolean).length;

  return (
    <div className="bg-white border-y border-[#E2DDD5] shadow-2xs py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Location Primary Inputs */}
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              type="text"
              placeholder="Search CO₂ stream, facility, org..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
              className="pl-9 bg-[#FAF8F5] border-[#E2DDD5] text-sm focus:border-[#173D32]"
            />
          </div>

          <div className="relative w-full sm:w-56">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              type="text"
              placeholder="City or state..."
              value={filters.location || ''}
              onChange={(e) => onFilterChange({ location: e.target.value, page: 1 })}
              className="pl-9 bg-[#FAF8F5] border-[#E2DDD5] text-sm focus:border-[#173D32]"
            />
          </div>

          {/* Desktop Inline Selectors */}
          <div className="hidden lg:flex items-center gap-3">
            <NativeSelect
              value={filters.minPurity ? filters.minPurity.toString() : ''}
              onChange={(e) => onFilterChange({ minPurity: e.target.value ? parseFloat(e.target.value) : undefined, page: 1 })}
              className="w-40 bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono"
            >
              <option value="">Any Purity</option>
              <option value="95">≥ 95.0% Purity</option>
              <option value="98">≥ 98.0% Purity</option>
              <option value="99">≥ 99.0% High Purity</option>
              <option value="99.9">≥ 99.9% Ultra Pure</option>
            </NativeSelect>

            <NativeSelect
              value={filters.physicalForm || ''}
              onChange={(e) => onFilterChange({ physicalForm: e.target.value || undefined, page: 1 })}
              className="w-40 bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono"
            >
              <option value="">All Physical Forms</option>
              <option value="liquid">Liquid</option>
              <option value="gaseous">Gaseous</option>
              <option value="supercritical">Supercritical</option>
              <option value="solid_dry_ice">Solid / Dry Ice</option>
            </NativeSelect>

            <NativeSelect
              value={filters.sort || 'newest'}
              onChange={(e) => onFilterChange({ sort: e.target.value, page: 1 })}
              className="w-44 bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono"
            >
              <option value="newest">Sort: Newest Listed</option>
              <option value="purity_desc">Purity: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="quantity_desc">Volume: High to Low</option>
            </NativeSelect>
          </div>
        </div>

        {/* Action Controls & Mobile Sheet Filter Trigger */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {/* Mobile Sort & Filters Drawer Trigger */}
          <Sheet>
            <SheetTrigger>
              <Button variant="outline" size="sm" className="lg:hidden gap-2 border-[#E2DDD5] text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-[#173D32] text-white text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96 bg-[#FAF8F5]">
              <SheetHeader>
                <SheetTitle className="font-serif text-xl text-[#171A18] flex items-center justify-between">
                  Filter Supply
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-stone-500 hover:text-red-700">
                      Reset All
                    </Button>
                  )}
                </SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block mb-2">Search Query</label>
                  <Input
                    placeholder="Search listing, facility, city..."
                    value={filters.search || ''}
                    onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block mb-2">Location</label>
                  <Input
                    placeholder="Gujarat, Ahmedabad, Surat..."
                    value={filters.location || ''}
                    onChange={(e) => onFilterChange({ location: e.target.value, page: 1 })}
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block mb-2">Minimum Purity %</label>
                  <NativeSelect
                    value={filters.minPurity ? filters.minPurity.toString() : ''}
                    onChange={(e) => onFilterChange({ minPurity: e.target.value ? parseFloat(e.target.value) : undefined, page: 1 })}
                  >
                    <option value="">Any Purity</option>
                    <option value="95">≥ 95.0%</option>
                    <option value="98">≥ 98.0%</option>
                    <option value="99">≥ 99.0%</option>
                    <option value="99.9">≥ 99.9% Ultra Pure</option>
                  </NativeSelect>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block mb-2">Physical State</label>
                  <NativeSelect
                    value={filters.physicalForm || ''}
                    onChange={(e) => onFilterChange({ physicalForm: e.target.value || undefined, page: 1 })}
                  >
                    <option value="">All Physical Forms</option>
                    <option value="liquid">Liquid</option>
                    <option value="gaseous">Gaseous</option>
                    <option value="supercritical">Supercritical</option>
                    <option value="solid_dry_ice">Solid / Dry Ice</option>
                  </NativeSelect>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block mb-2">Sort By</label>
                  <NativeSelect
                    value={filters.sort || 'newest'}
                    onChange={(e) => onFilterChange({ sort: e.target.value, page: 1 })}
                  >
                    <option value="newest">Newest Listed</option>
                    <option value="purity_desc">Highest Purity</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="quantity_desc">Volume: High to Low</option>
                  </NativeSelect>
                </div>
              </div>
              <SheetFooter className="mt-4">
                <SheetClose>
                  <Button className="w-full bg-[#173D32] hover:bg-[#123027] text-white font-mono text-xs">
                    Apply & View Results
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-stone-500 hover:text-stone-900 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
