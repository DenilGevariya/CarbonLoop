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
      <div className="bg-white rounded-xl border border-[#E2DDD5] overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-[#FAF8F5]">
            <TableRow className="border-[#E2DDD5]">
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase">Supply Stream</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase">Supplier</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase text-right">Volume</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase text-right">Purity</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase">Location</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase text-right">Unit Price</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase">Availability</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="border-[#E2DDD5]/60">
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
      <div className="bg-white rounded-xl border border-[#E2DDD5] p-12 text-center max-w-2xl mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E2DDD5] flex items-center justify-center mx-auto mb-4 text-[#173D32]">
          <Factory className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl text-[#171A18] font-medium">No captured CO₂ matches these filters</h3>
        <p className="mt-2 text-stone-600 text-sm leading-relaxed max-w-md mx-auto">
          Try widening the purity range, location, or availability window to discover active industrial supply streams.
        </p>
        {onResetFilters && (
          <Button
            onClick={onResetFilters}
            className="mt-6 bg-[#173D32] hover:bg-[#123027] text-white font-mono text-xs px-5"
          >
            Reset Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2DDD5] overflow-hidden shadow-2xs">
      <Table>
        <TableHeader className="bg-[#FAF8F5] border-b border-[#E2DDD5]">
          <TableRow className="border-[#E2DDD5] hover:bg-transparent">
            <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5 pl-4 sm:pl-6">Code</TableHead>
            <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5">Supply Specification</TableHead>
            <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5">Supplier / Facility</TableHead>
            <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5 text-right">Volume</TableHead>
            <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5 text-right">Purity</TableHead>
            <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5">Location</TableHead>
            <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5 text-right">Unit Price</TableHead>
            <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5">Availability</TableHead>
            <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5 pr-4 sm:pr-6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-[#E2DDD5]/60">
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
              className="group border-[#E2DDD5]/60 hover:bg-[#FAF8F5] cursor-pointer transition-colors duration-150 py-3"
            >
              {/* Listing Code */}
              <TableCell className="pl-4 sm:pl-6 font-mono text-xs text-stone-500 font-semibold">
                {item.listingCode}
              </TableCell>

              {/* Title & Form Badge */}
              <TableCell>
                <div className="font-medium text-[#171A18] text-sm group-hover:text-[#173D32] transition-colors">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-mono text-stone-500 capitalize">
                    {item.physicalForm.toLowerCase().replace('_', ' ')}
                  </span>
                  {item.captureMethod && (
                    <span className="text-[10px] text-stone-400 font-mono">
                      • {item.captureMethod}
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Organization & Facility */}
              <TableCell>
                <div className="text-xs font-medium text-stone-800">{item.organization.name}</div>
                <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1 mt-0.5">
                  <Factory className="w-3 h-3 text-stone-400" />
                  {item.facility.name}
                </div>
              </TableCell>

              {/* Volume (Numeric Alignment) */}
              <TableCell className="text-right font-mono text-xs tabular-nums">
                <div className="font-semibold text-[#171A18]">
                  {item.quantity.available.toLocaleString()} {item.quantity.unit}s
                </div>
                <div className="text-[10px] text-stone-500">
                  MOQ: {item.quantity.minimumOrder} t
                </div>
              </TableCell>

              {/* Purity % */}
              <TableCell className="text-right font-mono text-xs tabular-nums">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#173D32]/10 text-[#173D32] font-bold text-xs">
                  {item.purityPercentage.toFixed(1)}%
                </span>
              </TableCell>

              {/* Location */}
              <TableCell>
                <div className="text-xs font-medium text-stone-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                  {item.facility.city}, {item.facility.state}
                </div>
              </TableCell>

              {/* Unit Price */}
              <TableCell className="text-right font-mono text-xs tabular-nums">
                <div className="font-bold text-[#171A18]">
                  ₹{item.price.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-stone-500">per {item.quantity.unit}</div>
              </TableCell>

              {/* Availability Window */}
              <TableCell className="font-mono text-[11px] text-stone-600">
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
                  className="h-8 px-2.5 text-xs text-stone-600 group-hover:text-[#173D32] group-hover:bg-white border border-transparent group-hover:border-[#E2DDD5]"
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
