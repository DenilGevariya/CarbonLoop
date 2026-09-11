import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { BuyerRequirement } from '../types/requirement';
import { CheckCircle2 } from 'lucide-react';

interface FulfillDialogProps {
  requirement: BuyerRequirement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  isFulfilling?: boolean;
}

export const FulfillDialog: React.FC<FulfillDialogProps> = ({
  requirement,
  open,
  onOpenChange,
  onConfirm,
  isFulfilling = false,
}) => {
  const [reason, setReason] = useState('');

  if (!requirement) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason || undefined);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-[#E2DDD5] rounded-none p-6 shadow-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-blue-700 mb-2 font-mono text-xs uppercase font-bold tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Mark Fulfilled
            </div>
            <DialogTitle className="font-sans font-bold text-lg text-[#171A18]">
              Mark Requirement as Fulfilled?
            </DialogTitle>
            <DialogDescription className="font-sans text-xs text-stone-600 leading-relaxed pt-2">
              This confirms that off-take volume for {requirement.requirement_code} ({requirement.required_quantity} {requirement.quantity_unit}s) has been fully satisfied.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <label className="font-mono text-[10px] uppercase font-bold text-stone-600 block mb-1">
              Fulfillment Notes (Optional)
            </label>
            <Textarea
              placeholder="e.g. Contract completed, off-take agreement executed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border-[#E2DDD5] rounded-none text-xs h-20"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isFulfilling}
              className="border-[#E2DDD5] rounded-none text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isFulfilling}
              className="bg-blue-700 hover:bg-blue-800 text-white rounded-none text-xs font-semibold px-4 cursor-pointer"
            >
              {isFulfilling ? 'Updating...' : 'Mark as Fulfilled'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
