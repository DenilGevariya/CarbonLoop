import React, { useState } from 'react';
import type { ListingDTO } from '../types/listing';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Archive } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: ListingDTO | null;
  onConfirm: (reason?: string) => void;
  isSubmitting?: boolean;
}

export const ArchiveDialog: React.FC<Props> = ({ open, onOpenChange, listing, onConfirm, isSubmitting }) => {
  const [reason, setReason] = useState('Supply stream decommissioned or permanently allocated');

  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#FAF8F5] border-[#E2DDD5]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-700 mb-2">
            <Archive className="w-5 h-5" />
          </div>
          <DialogTitle className="font-serif text-xl text-[#171A18]">
            Archive CO₂ Supply ({listing.listingCode})
          </DialogTitle>
          <DialogDescription className="text-stone-600 text-xs leading-relaxed">
            Archived listings are permanently removed from active marketplace discovery but remain available in your organization's compliance records and audit history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 my-2">
          <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block">
            Reason for Archiving
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Flue stream permanently contracted under long-term off-take..."
            rows={3}
            className="bg-white border-[#E2DDD5] text-xs font-sans"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="border-[#E2DDD5] text-xs">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={isSubmitting}
            className="bg-stone-800 hover:bg-stone-900 text-white font-mono text-xs px-5"
          >
            {isSubmitting ? 'Archiving...' : 'Archive Listing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
