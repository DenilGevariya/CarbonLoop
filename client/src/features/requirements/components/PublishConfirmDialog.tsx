import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { BuyerRequirement } from '../types/requirement';
import { Radio } from 'lucide-react';

interface PublishConfirmDialogProps {
  requirement: BuyerRequirement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPublishing?: boolean;
}

export const PublishConfirmDialog: React.FC<PublishConfirmDialogProps> = ({
  requirement,
  open,
  onOpenChange,
  onConfirm,
  isPublishing = false,
}) => {
  if (!requirement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-[#E2DDD5] rounded-none p-6 shadow-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#173D32] mb-2 font-mono text-xs uppercase font-bold tracking-wider">
            <Radio className="w-4 h-4" /> Demand Publication
          </div>
          <DialogTitle className="font-sans font-bold text-lg text-[#171A18]">
            Publish to Demand Network?
          </DialogTitle>
          <DialogDescription className="font-sans text-xs text-stone-600 leading-relaxed pt-2">
            Publishing this requirement makes it discoverable across the CarbonLoop network.
            Compatible industrial CO₂ suppliers will be able to inspect your off-take parameters.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-[#FAF8F5] border border-[#E2DDD5] p-3 my-4 space-y-1.5 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-stone-500">Requirement:</span>
            <span className="font-bold text-[#171A18]">{requirement.requirement_code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Volume:</span>
            <span className="font-bold text-[#171A18]">
              {requirement.required_quantity} {requirement.quantity_unit}s
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Purity:</span>
            <span className="font-bold text-[#173D32]">≥{requirement.minimum_purity}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Max Budget:</span>
            <span className="font-bold text-[#171A18]">
              {requirement.maximum_price_per_unit
                ? `₹${requirement.maximum_price_per_unit}/${requirement.quantity_unit}`
                : 'Open'}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
            className="border-[#E2DDD5] rounded-none text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPublishing}
            className="bg-[#173D32] hover:bg-[#133027] text-white rounded-none text-xs font-semibold px-4 cursor-pointer"
          >
            {isPublishing ? 'Publishing...' : 'Publish Requirement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
