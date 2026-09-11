import React from 'react';
import type { ListingDTO } from '../types/listing';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: ListingDTO | null;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const PublishDialog: React.FC<Props> = ({ open, onOpenChange, listing, onConfirm, isSubmitting }) => {
  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#FAF8F5] border-[#E2DDD5]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-[#173D32]/10 border border-[#173D32]/20 flex items-center justify-center text-[#173D32] mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <DialogTitle className="font-serif text-xl text-[#171A18]">
            Publish CO₂ Supply Listing
          </DialogTitle>
          <DialogDescription className="text-stone-600 text-xs leading-relaxed">
            You are about to publish this industrial carbon supply to the public CarbonLoop marketplace exchange. Authorized network participants will be able to inspect technical specifications and submit off-take inquiries.
          </DialogDescription>
        </DialogHeader>

        {/* Declaration Summary Box */}
        <div className="bg-white p-4 rounded-lg border border-[#E2DDD5] space-y-3 font-mono text-xs my-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2DDD5]">
            <span className="text-stone-500 uppercase text-[10px]">Supply Code</span>
            <span className="font-bold text-[#171A18]">{listing.listingCode}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-stone-700">
            <div>
              <span className="text-stone-400 block text-[10px]">Available Volume</span>
              <span className="font-bold text-[#171A18]">{listing.quantity.available} {listing.quantity.unit}s</span>
            </div>

            <div>
              <span className="text-stone-400 block text-[10px]">Purity Level</span>
              <span className="font-bold text-[#173D32]">{listing.purityPercentage}%</span>
            </div>

            <div>
              <span className="text-stone-400 block text-[10px]">Commercial Rate</span>
              <span className="font-bold text-[#171A18]">₹{listing.price.amount} / t</span>
            </div>

            <div>
              <span className="text-stone-400 block text-[10px]">Facility Gate</span>
              <span className="font-medium text-stone-800 truncate block">{listing.facility.name}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="border-[#E2DDD5] text-xs">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-[#173D32] hover:bg-[#123027] text-white font-mono text-xs px-5"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Listing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
