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
import { PauseCircle } from 'lucide-react';

interface PauseDialogProps {
  requirement: BuyerRequirement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  isPausing?: boolean;
}

export const PauseDialog: React.FC<PauseDialogProps> = ({
  requirement,
  open,
  onOpenChange,
  onConfirm,
  isPausing = false,
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
            <div className="flex items-center gap-2 text-stone-700 mb-2 font-mono text-xs uppercase font-bold tracking-wider">
              <PauseCircle className="w-4 h-4 text-stone-600" /> Pause Requirement
            </div>
            <DialogTitle className="font-sans font-bold text-lg text-[#171A18]">
              Pause Demand Requirement?
            </DialogTitle>
            <DialogDescription className="font-sans text-xs text-stone-600 leading-relaxed pt-2">
              Pausing will temporarily hide {requirement.requirement_code} from active network discovery.
              You can resume publication at any time.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <label className="font-mono text-[10px] uppercase font-bold text-stone-600 block mb-1">
              Pause Reason (Optional)
            </label>
            <Textarea
              placeholder="e.g. Scheduled line maintenance, production delay, budget review..."
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
              disabled={isPausing}
              className="border-[#E2DDD5] rounded-none text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPausing}
              className="bg-stone-800 hover:bg-stone-900 text-white rounded-none text-xs font-semibold px-4 cursor-pointer"
            >
              {isPausing ? 'Pausing...' : 'Pause Requirement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
