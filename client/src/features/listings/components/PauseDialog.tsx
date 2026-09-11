import React, { useState } from 'react';
import type { ListingDTO } from '../types/listing';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PauseCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: ListingDTO | null;
  onConfirm: (reason?: string) => void;
  isSubmitting?: boolean;
}

export const PauseDialog: React.FC<Props> = ({ open, onOpenChange, listing, onConfirm, isSubmitting }) => {
  const [reason, setReason] = useState('Scheduled facility maintenance / temporary operational pause');

  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#FAF8F5] border-[#E2DDD5]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-900 mb-2">
            <PauseCircle className="w-5 h-5" />
          </div>
          <DialogTitle className="font-serif text-xl text-[#171A18]">
            Pause Supply Stream ({listing.listingCode})
          </DialogTitle>
          <DialogDescription className="text-stone-600 text-xs leading-relaxed">
            Pausing this listing hides it from active public marketplace discovery. Existing off-take agreements remain unaffected. You may resume publication at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 my-2">
          <label className="text-xs font-mono uppercase tracking-wider text-stone-500 block">
            Reason for Pausing (Recorded in Status Audit History)
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Temporarily unavailable due to cryogenic pump overhaul..."
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
            className="bg-purple-900 hover:bg-purple-950 text-white font-mono text-xs px-5"
          >
            {isSubmitting ? 'Pausing...' : 'Pause Listing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
