import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ListingDTO } from '../types/listing';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Factory, MapPin, ShieldCheck, FileText, Handshake, ExternalLink, Truck } from 'lucide-react';
import { InquiryComposerModal } from '@/features/inquiries/components/InquiryComposerModal';

interface Props {
  listings: ListingDTO[];
  isLoading: boolean;
  onResetFilters?: () => void;
}

export const MarketplaceTable: React.FC<Props> = ({ listings, isLoading, onResetFilters }) => {
  const navigate = useNavigate();
  const [inquiryListing, setInquiryListing] = useState<ListingDTO | null>(null);

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
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase">Location & Status</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase">Lab Report</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase text-right">Unit Price</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 pr-4 sm:pr-6 text-right">Action</TableHead>
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
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-7 w-28 ml-auto rounded-lg" /></TableCell>
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
        <h3 className="text-xl text-[#2A3547] font-bold">No CO₂ supply listings match your filters</h3>
        <p className="mt-2 text-[#5A6A85] text-sm leading-relaxed max-w-md mx-auto">
          Try widening the purity range, location, or maximum price parameters to discover active industrial CO₂ streams.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          {onResetFilters && (
            <Button
              onClick={onResetFilters}
              variant="outline"
              className="border-[#E5EAEF] text-[#2A3547] font-semibold text-xs px-5 rounded-lg"
            >
              Clear Filters
            </Button>
          )}
          <Button
            onClick={() => navigate('/requirements')}
            className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs px-5 rounded-lg"
          >
            View CO₂ Demand Requirements
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-[#E5EAEF] overflow-x-auto shadow-xs">
        <Table>
          <TableHeader className="bg-[#F6F9FC] border-b border-[#E5EAEF]">
            <TableRow className="border-[#E5EAEF] hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 pl-4 sm:pl-6">Code</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5">Supply Stream</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5">Supplier / Facility</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 text-right">Volume</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 text-right">Purity</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5">Location & Status</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5">Lab Report</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 text-right">Unit Price</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 pr-4 sm:pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#E5EAEF]">
            {listings.map((item) => {
              const isVerified = item.verificationStatus === 'VERIFIED' || item.organization.verificationStatus === 'VERIFIED';
              const isPending = item.verificationStatus === 'PENDING_VERIFICATION' || (!isVerified && item.verificationStatus !== 'REJECTED');
              const hasLabReport = !!(item.labReportUrl || item.labReportFilename);

              return (
                <TableRow
                  key={item.id}
                  className="group border-[#E5EAEF] hover:bg-[#F6F9FC]/80 transition-colors duration-150 py-3"
                >
                  {/* Listing Code */}
                  <TableCell className="pl-4 sm:pl-6 text-xs text-[#5A6A85] font-bold">
                    {item.listingCode}
                  </TableCell>

                  {/* Title & Form Badge */}
                  <TableCell>
                    <div
                      onClick={() => navigate(`/marketplace/${item.listingCode}`)}
                      className="font-bold text-[#2A3547] text-sm hover:text-[#5D87FF] transition-colors cursor-pointer"
                    >
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-[#5D87FF] uppercase bg-[#ECF2FF] px-2 py-0.5 rounded-full border border-[#5D87FF]/20">
                        {item.physicalForm.toLowerCase().replace('_', ' ')}
                      </span>
                      {item.deliveryAvailable && (
                        <span className="text-[10px] text-[#13DEB9] font-semibold flex items-center gap-1">
                          <Truck className="w-3 h-3" /> Delivery Available
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Organization & Facility */}
                  <TableCell>
                    <div className="text-xs font-bold text-[#2A3547]">{item.organization.name}</div>
                    <div className="text-[11px] text-[#5A6A85] flex items-center gap-1 mt-0.5 font-medium">
                      <Factory className="w-3 h-3 text-[#5A6A85]" />
                      {item.facility.name}
                    </div>
                  </TableCell>

                  {/* Volume */}
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
                      {item.purityPercentage.toFixed(1)}% Purity
                    </span>
                  </TableCell>

                  {/* Location & Verification Badge */}
                  <TableCell>
                    <div className="text-xs font-medium text-[#2A3547] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#5A6A85] shrink-0" />
                      {item.facility.city}, {item.facility.state}
                    </div>
                    <div className="mt-1">
                      {isVerified ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-[#13DEB9] bg-[#E8F9F5] border border-[#13DEB9]/30 px-2 py-0.5 rounded-full uppercase">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-[#FFAE1F] bg-[#FEF5E5] border border-[#FFAE1F]/30 px-2 py-0.5 rounded-full uppercase">
                          Pending Verification
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-[#FA896B] bg-[#FDEDE8] border border-[#FA896B]/30 px-2 py-0.5 rounded-full uppercase">
                          Unverified
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Laboratory Purity Report Column */}
                  <TableCell>
                    {hasLabReport ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] text-[#5A6A85] font-semibold flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[#5D87FF]" /> Lab Report
                        </span>
                        <a
                          href={item.labReportUrl || `/uploads/${item.labReportFilename}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5D87FF] hover:underline"
                        >
                          View Report <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#5A6A85]/70 font-medium italic">
                        No lab report available
                      </span>
                    )}
                  </TableCell>

                  {/* Unit Price */}
                  <TableCell className="text-right text-xs tabular-nums">
                    <div className="font-bold text-[#2A3547] text-sm">
                      ₹{item.price.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#5A6A85]">per {item.quantity.unit}</div>
                  </TableCell>

                  {/* Action Column */}
                  <TableCell className="pr-4 sm:pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/marketplace/${item.listingCode}`)}
                        className="h-8 px-2.5 text-xs font-semibold text-[#5A6A85] hover:text-[#5D87FF] hover:bg-[#ECF2FF] rounded-lg transition-colors cursor-pointer"
                      >
                        View Details
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => setInquiryListing(item)}
                        className="h-8 px-3 text-xs font-semibold bg-[#5D87FF] hover:bg-[#4570EA] text-white rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Handshake className="w-3.5 h-3.5" /> Make Offer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Inquiry / Offer Modal */}
      {inquiryListing && (
        <InquiryComposerModal
          isOpen={!!inquiryListing}
          onClose={() => setInquiryListing(null)}
          listing={{
            id: inquiryListing.id,
            title: inquiryListing.title,
            remaining_quantity: inquiryListing.quantity.available,
            price_per_ton: inquiryListing.price.amount,
            purity_percentage: inquiryListing.purityPercentage,
            organization_name: inquiryListing.organization.name,
          }}
        />
      )}
    </>
  );
};
