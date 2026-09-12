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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white border border-[#E5EAEF] rounded-2xl shadow-xs p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 max-w-full overflow-hidden">
        
        {/* Search & Location Primary Inputs */}
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-0">
          <div className="relative w-full sm:w-64 md:w-72 flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A85]" />
            <Input
              type="text"
              placeholder="Search CO₂ stream, facility, org..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
              className="pl-10 bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] placeholder:text-[#5A6A85] rounded-xl focus-visible:ring-[#5D87FF] h-10 w-full"
            />
          </div>

          <div className="relative w-full sm:w-48 md:w-52 min-w-[160px]">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A85]" />
            <Input
              type="text"
              placeholder="City or state..."
              value={filters.location || ''}
              onChange={(e) => onFilterChange({ location: e.target.value, page: 1 })}
              className="pl-10 bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] placeholder:text-[#5A6A85] rounded-xl focus-visible:ring-[#5D87FF] h-10 w-full"
            />
          </div>

          {/* Desktop Inline Selectors */}
          <div className="hidden xl:flex flex-wrap items-center gap-2.5">
            <NativeSelect
              value={filters.minPurity ? filters.minPurity.toString() : ''}
              onChange={(e) => onFilterChange({ minPurity: e.target.value ? parseFloat(e.target.value) : undefined, page: 1 })}
              className="w-36 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-xl h-10"
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
              className="w-36 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-xl h-10"
            >
              <option value="">All Forms</option>
              <option value="liquid">Liquid</option>
              <option value="gaseous">Gaseous</option>
              <option value="supercritical">Supercritical</option>
              <option value="solid_dry_ice">Solid / Dry Ice</option>
            </NativeSelect>

            <NativeSelect
              value={filters.sort || 'newest'}
              onChange={(e) => onFilterChange({ sort: e.target.value, page: 1 })}
              className="w-40 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-xl h-10"
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
              <Button variant="outline" size="sm" className="xl:hidden gap-2 border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-xl h-10">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-[#5D87FF] text-white text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96 bg-white">
              <SheetHeader>
                <SheetTitle className="text-xl text-[#2A3547] font-bold flex items-center justify-between">
                  Filter Supply
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-[#FA896B] hover:text-[#FA896B]">
                      Reset All
                    </Button>
                  )}
                </SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-2">Search Query</label>
                  <Input
                    placeholder="Search listing, facility, city..."
                    value={filters.search || ''}
                    onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-2">Location</label>
                  <Input
                    placeholder="Gujarat, Ahmedabad, Surat..."
                    value={filters.location || ''}
                    onChange={(e) => onFilterChange({ location: e.target.value, page: 1 })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-2">Minimum Purity %</label>
                  <NativeSelect
                    value={filters.minPurity ? filters.minPurity.toString() : ''}
                    onChange={(e) => onFilterChange({ minPurity: e.target.value ? parseFloat(e.target.value) : undefined, page: 1 })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs rounded-xl"
                  >
                    <option value="">Any Purity</option>
                    <option value="95">≥ 95.0%</option>
                    <option value="98">≥ 98.0%</option>
                    <option value="99">≥ 99.0%</option>
                    <option value="99.9">≥ 99.9% Ultra Pure</option>
                  </NativeSelect>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-2">Physical State</label>
                  <NativeSelect
                    value={filters.physicalForm || ''}
                    onChange={(e) => onFilterChange({ physicalForm: e.target.value || undefined, page: 1 })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs rounded-xl"
                  >
                    <option value="">All Physical Forms</option>
                    <option value="liquid">Liquid</option>
                    <option value="gaseous">Gaseous</option>
                    <option value="supercritical">Supercritical</option>
                    <option value="solid_dry_ice">Solid / Dry Ice</option>
                  </NativeSelect>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5A6A85] block mb-2">Sort By</label>
                  <NativeSelect
                    value={filters.sort || 'newest'}
                    onChange={(e) => onFilterChange({ sort: e.target.value, page: 1 })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs rounded-xl"
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
                  <Button className="w-full bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs rounded-xl">
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
              className="text-xs text-[#5A6A85] hover:text-[#2A3547] gap-1.5 rounded-xl h-10"
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
