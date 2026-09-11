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
import { Archive } from 'lucide-react';

interface ArchiveDialogProps {
  requirement: BuyerRequirement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  isArchiving?: boolean;
}

export const ArchiveDialog: React.FC<ArchiveDialogProps> = ({
  requirement,
  open,
  onOpenChange,
  onConfirm,
  isArchiving = false,
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
            <div className="flex items-center gap-2 text-rose-700 mb-2 font-mono text-xs uppercase font-bold tracking-wider">
              <Archive className="w-4 h-4 text-rose-600" /> Archive Requirement
            </div>
            <DialogTitle className="font-sans font-bold text-lg text-[#171A18]">
              Archive Demand Requirement?
            </DialogTitle>
            <DialogDescription className="font-sans text-xs text-stone-600 leading-relaxed pt-2">
              Archiving removes {requirement.requirement_code} from active management while preserving all historical records.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <label className="font-mono text-[10px] uppercase font-bold text-stone-600 block mb-1">
              Archive Reason (Optional)
            </label>
            <Textarea
              placeholder="e.g. Requirement cancelled, project scope changed..."
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
              disabled={isArchiving}
              className="border-[#E2DDD5] rounded-none text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isArchiving}
              className="bg-rose-700 hover:bg-rose-800 text-white rounded-none text-xs font-semibold px-4 cursor-pointer"
            >
              {isArchiving ? 'Archiving...' : 'Archive Requirement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
