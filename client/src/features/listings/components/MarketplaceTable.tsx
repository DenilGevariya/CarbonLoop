import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ListingDTO } from '../types/listing';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Factory, MapPin, ChevronRight } from 'lucide-react';

interface Props {
  listings: ListingDTO[];
  isLoading: boolean;
  onResetFilters?: () => void;
}

export const MarketplaceTable: React.FC<Props> = ({ listings, isLoading, onResetFilters }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5EAEF] overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#F6F9FC]">
            <TableRow className="border-[#E5EAEF]">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase">Supply Stream</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase">Supplier</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase text-right">Volume</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase text-right">Purity</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase">Location</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase text-right">Unit Price</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase">Availability</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="border-[#E5EAEF]">
                <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48 mb-1" /><Skeleton className="h-3 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-7 w-20 ml-auto rounded-lg" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E5EAEF] p-12 text-center max-w-2xl mx-auto my-8 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#ECF2FF] border border-[#5D87FF]/20 flex items-center justify-center mx-auto mb-4 text-[#5D87FF]">
          <Factory className="w-6 h-6" />
        </div>
        <h3 className="text-xl text-[#2A3547] font-bold">No captured CO₂ matches these filters</h3>
        <p className="mt-2 text-[#5A6A85] text-sm leading-relaxed max-w-md mx-auto">
          Try widening the purity range, location, or availability window to discover active industrial supply streams.
        </p>
        {onResetFilters && (
          <Button
            onClick={onResetFilters}
            className="mt-6 bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs px-5 rounded-lg"
          >
            Reset Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5EAEF] overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-[#F6F9FC] border-b border-[#E5EAEF]">
          <TableRow className="border-[#E5EAEF] hover:bg-transparent">
            <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 pl-4 sm:pl-6">Code</TableHead>
            <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5">Supply Specification</TableHead>
            <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5">Supplier / Facility</TableHead>
            <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 text-right">Volume</TableHead>
            <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 text-right">Purity</TableHead>
            <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5">Location</TableHead>
            <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 text-right">Unit Price</TableHead>
            <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5">Availability</TableHead>
            <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 pr-4 sm:pr-6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-[#E5EAEF]">
          {listings.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => navigate(`/marketplace/${item.listingCode}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/marketplace/${item.listingCode}`);
                }
              }}
              tabIndex={0}
              role="button"
              className="group border-[#E5EAEF] hover:bg-[#F6F9FC] cursor-pointer transition-colors duration-150 py-3"
            >
              {/* Listing Code */}
              <TableCell className="pl-4 sm:pl-6 text-xs text-[#5A6A85] font-semibold">
                {item.listingCode}
              </TableCell>

              {/* Title & Form Badge */}
              <TableCell>
                <div className="font-bold text-[#2A3547] text-sm group-hover:text-[#5D87FF] transition-colors">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-medium text-[#5A6A85] capitalize">
                    {item.physicalForm.toLowerCase().replace('_', ' ')}
                  </span>
                  {item.captureMethod && (
                    <span className="text-[10px] text-[#5A6A85]/70 font-medium">
                      • {item.captureMethod}
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Organization & Facility */}
              <TableCell>
                <div className="text-xs font-semibold text-[#2A3547]">{item.organization.name}</div>
                <div className="text-[11px] text-[#5A6A85] flex items-center gap-1 mt-0.5">
                  <Factory className="w-3 h-3 text-[#5A6A85]" />
                  {item.facility.name}
                </div>
              </TableCell>

              {/* Volume (Numeric Alignment) */}
              <TableCell className="text-right text-xs tabular-nums">
                <div className="font-bold text-[#2A3547]">
                  {item.quantity.available.toLocaleString()} {item.quantity.unit}s
                </div>
                <div className="text-[10px] text-[#5A6A85]">
                  MOQ: {item.quantity.minimumOrder} t
                </div>
              </TableCell>

              {/* Purity % */}
              <TableCell className="text-right text-xs tabular-nums">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E6FFFA] text-[#13DEB9] font-bold text-xs">
                  {item.purityPercentage.toFixed(1)}%
                </span>
              </TableCell>

              {/* Location */}
              <TableCell>
                <div className="text-xs font-medium text-[#2A3547] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#5A6A85] shrink-0" />
                  {item.facility.city}, {item.facility.state}
                </div>
              </TableCell>

              {/* Unit Price */}
              <TableCell className="text-right text-xs tabular-nums">
                <div className="font-bold text-[#2A3547]">
                  ₹{item.price.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#5A6A85]">per {item.quantity.unit}</div>
              </TableCell>

              {/* Availability Window */}
              <TableCell className="text-[11px] text-[#5A6A85] font-medium">
                {new Date(item.availability.from).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                {item.availability.until ? (
                  ` – ${new Date(item.availability.until).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`
                ) : ' (Continuous)'}
              </TableCell>

              {/* Action Column */}
              <TableCell className="pr-4 sm:pr-6 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-xs text-[#5A6A85] group-hover:text-[#5D87FF] group-hover:bg-[#ECF2FF] rounded-lg transition-colors"
                >
                  Inspect
                  <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
