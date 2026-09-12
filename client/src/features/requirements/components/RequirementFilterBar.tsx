import React, { useState } from 'react';
import type { RequirementFilterParams, UtilizationType } from '../types/requirement';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface RequirementFilterBarProps {
  filters: RequirementFilterParams;
  utilizationTypes?: UtilizationType[];
  onFilterChange: (newFilters: Partial<RequirementFilterParams>) => void;
  onReset: () => void;
  className?: string;
}

export const RequirementFilterBar: React.FC<RequirementFilterBarProps> = ({
  filters,
  utilizationTypes = [],
  onFilterChange,
  onReset,
  className = '',
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput, page: 1 });
  };

  return (
    <div className={`bg-white border-b border-[#E5EAEF] py-3.5 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative flex items-center">
          <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search requirement, facility, use case..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-3 h-9 text-xs bg-[#F6F9FC] border-[#E5EAEF] rounded-lg focus:bg-white text-[#2A3547]"
          />
        </form>

        {/* Desktop Filter Controls */}
        <div className="hidden md:flex items-center gap-2 text-xs overflow-x-auto w-full md:w-auto font-medium">
          {/* Utilization Category */}
          <Select
            value={filters.utilization_code || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({ utilization_code: val && val !== 'ALL' ? val : undefined, page: 1 })
            }
          >
            <SelectTrigger className="h-9 text-xs bg-[#F6F9FC] border-[#E5EAEF] rounded-lg w-44 text-[#2A3547]">
              <SelectValue placeholder="All Use Cases" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-[#E5EAEF]">
              <SelectItem value="ALL">All Utilization Pathways</SelectItem>
              {utilizationTypes.map((type) => (
                <SelectItem key={type.id} value={type.code}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Physical Form */}
          <Select
            value={filters.physical_form || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({ physical_form: val && val !== 'ALL' ? val : undefined, page: 1 })
            }
          >
            <SelectTrigger className="h-9 text-xs bg-[#F6F9FC] border-[#E5EAEF] rounded-lg w-36 text-[#2A3547]">
              <SelectValue placeholder="Physical Form" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-[#E5EAEF]">
              <SelectItem value="ALL">All Physical Forms</SelectItem>
              <SelectItem value="liquid">Liquid</SelectItem>
              <SelectItem value="gaseous">Gaseous</SelectItem>
              <SelectItem value="supercritical">Supercritical</SelectItem>
              <SelectItem value="solid_dry_ice">Solid Dry Ice</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority */}
          <Select
            value={filters.priority || 'ALL'}
            onValueChange={(val) =>
              onFilterChange({ priority: val && val !== 'ALL' ? val : undefined, page: 1 })
            }
          >
            <SelectTrigger className="h-9 text-xs bg-[#F6F9FC] border-[#E5EAEF] rounded-lg w-32 text-[#2A3547]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-[#E5EAEF]">
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="normal">Normal Priority</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={filters.sort || 'newest'}
            onValueChange={(val) => onFilterChange({ sort: val || 'newest', page: 1 })}
          >
            <SelectTrigger className="h-9 text-xs bg-[#F6F9FC] border-[#E5EAEF] rounded-lg w-40 text-[#2A3547]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-[#E5EAEF]">
              <SelectItem value="newest">Sort: Newest First</SelectItem>
              <SelectItem value="quantity_high">Sort: Volume (High to Low)</SelectItem>
              <SelectItem value="purity_high">Sort: Minimum Purity</SelectItem>
              <SelectItem value="price_high">Sort: Budget Ceiling</SelectItem>
              <SelectItem value="priority">Sort: Highest Priority</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchInput('');
              onReset();
            }}
            className="h-9 border-[#E5EAEF] text-[#5A6A85] rounded-lg hover:bg-[#ECF2FF] hover:text-[#5D87FF] px-3"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Mobile Sheet Trigger */}
        <div className="md:hidden w-full flex items-center justify-between gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 border-[#E5EAEF] rounded-lg text-xs flex items-center justify-center gap-2 text-[#2A3547]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#5D87FF]" /> Filter Requirements
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#F6F9FC] border-l border-[#E5EAEF] p-6">
              <SheetHeader>
                <SheetTitle className="font-bold text-base text-[#2A3547]">
                  Filter Requirements
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4 my-6 text-[#2A3547] text-xs">
                <div>
                  <label className="block text-[#5A6A85] mb-1 font-semibold">Utilization Pathway</label>
                  <Select
                    value={filters.utilization_code || 'ALL'}
                    onValueChange={(val) =>
                      onFilterChange({ utilization_code: val && val !== 'ALL' ? val : undefined, page: 1 })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs bg-white border-[#E5EAEF] rounded-lg w-full">
                      <SelectValue placeholder="All Use Cases" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-[#E5EAEF]">
                      <SelectItem value="ALL">All Utilization Pathways</SelectItem>
                      {utilizationTypes.map((type) => (
                        <SelectItem key={type.id} value={type.code}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-[#5A6A85] mb-1 font-semibold">Physical Form</label>
                  <Select
                    value={filters.physical_form || 'ALL'}
                    onValueChange={(val) =>
                      onFilterChange({ physical_form: val && val !== 'ALL' ? val : undefined, page: 1 })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs bg-white border-[#E5EAEF] rounded-lg w-full">
                      <SelectValue placeholder="Physical Form" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-[#E5EAEF]">
                      <SelectItem value="ALL">All Physical Forms</SelectItem>
                      <SelectItem value="liquid">Liquid</SelectItem>
                      <SelectItem value="gaseous">Gaseous</SelectItem>
                      <SelectItem value="supercritical">Supercritical</SelectItem>
                      <SelectItem value="solid_dry_ice">Solid Dry Ice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-[#5A6A85] mb-1 font-semibold">Priority Level</label>
                  <Select
                    value={filters.priority || 'ALL'}
                    onValueChange={(val) =>
                      onFilterChange({ priority: val && val !== 'ALL' ? val : undefined, page: 1 })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs bg-white border-[#E5EAEF] rounded-lg w-full">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-[#E5EAEF]">
                      <SelectItem value="ALL">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="normal">Normal Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t border-[#E5EAEF] flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearchInput('');
                      onReset();
                      setSheetOpen(false);
                    }}
                    className="w-full border-[#E5EAEF] rounded-lg text-xs"
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setSheetOpen(false)}
                    className="w-full bg-[#5D87FF] hover:bg-[#4570EA] text-white rounded-lg text-xs font-semibold"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};
