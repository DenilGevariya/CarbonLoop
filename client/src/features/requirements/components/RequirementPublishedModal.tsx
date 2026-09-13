import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, MapPin, Calendar, ArrowRight, Eye, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BuyerRequirement } from '../types/requirement';

interface RequirementPublishedModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: BuyerRequirement | null;
}

export const RequirementPublishedModal: React.FC<RequirementPublishedModalProps> = ({
  isOpen,
  onClose,
  requirement,
}) => {
  const navigate = useNavigate();

  if (!requirement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white border border-[#E5EAEF] rounded-2xl shadow-2xl">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#173D32] to-[#13DEB9] p-6 text-white text-center relative overflow-hidden">
          <div className="size-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto mb-3 text-white animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full border border-white/20">
            {requirement.requirement_code || 'REQ-PUBLISHED'}
          </span>
          <h2 className="text-2xl font-bold font-sans mt-2 tracking-tight">
            Requirement Published Successfully!
          </h2>
          <p className="text-xs text-white/80 font-medium mt-1">
            Your CO₂ feedstock specification is live and visible across the CarbonLoop Exchange.
          </p>
        </div>

        {/* Specification Summary Cards */}
        <div className="p-6 space-y-4">
          <div className="bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl p-4 space-y-3 font-sans text-xs">
            <div className="flex justify-between items-start border-b border-[#E5EAEF] pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-[#2A3547]">{requirement.title}</h3>
                <p className="text-[11px] text-[#5A6A85] mt-0.5 line-clamp-1">
                  {requirement.description || 'No additional description provided.'}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5D87FF] bg-[#ECF2FF] border border-[#5D87FF]/20 px-2.5 py-0.5 rounded-full">
                {requirement.priority} Priority
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <span className="text-[10px] uppercase text-[#5A6A85] font-semibold block">Volume</span>
                <span className="font-bold text-sm text-[#2A3547]">
                  {requirement.required_quantity?.toLocaleString()} {requirement.quantity_unit}s
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-[#5A6A85] font-semibold block">Min Purity</span>
                <span className="font-bold text-sm text-[#13DEB9]">
                  ≥{requirement.minimum_purity}%
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-[#5A6A85] font-semibold block">Physical Form</span>
                <span className="font-bold text-xs text-[#2A3547] uppercase">
                  {requirement.acceptable_physical_form}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-[#5A6A85] font-semibold block">Max Price</span>
                <span className="font-bold text-sm text-[#2A3547]">
                  {requirement.maximum_price_per_unit
                    ? `₹${requirement.maximum_price_per_unit.toLocaleString()}/t`
                    : 'Open Price'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#E5EAEF] text-[11px] text-[#5A6A85]">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#5D87FF]" />
                <span>Destination: <strong>{requirement.location_city || 'Vadodara'}, {requirement.location_state || 'Gujarat'}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#5D87FF]" />
                <span>Date Range: <strong>{requirement.required_from ? requirement.required_from.split('T')[0] : 'Immediate'}</strong></span>
              </div>
            </div>
          </div>

          {/* Dynamic Matchmaking Indicator */}
          <div className="bg-[#ECF2FF] border border-[#5D87FF]/30 p-3.5 rounded-xl flex items-center gap-3 text-xs">
            <div className="p-2 bg-[#5D87FF] text-white rounded-lg animate-spin">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#5D87FF] block">Finding compatible CO₂ suppliers...</span>
              <span className="text-[11px] text-[#5A6A85]">
                CarbonLoop Match Engine v1.0 is scoring active emitter streams against your parameters.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-[#F6F9FC] border-t border-[#E5EAEF] flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              navigate('/dashboard');
            }}
            className="w-full sm:w-auto border-[#E5EAEF] text-[#5A6A85] text-xs font-semibold h-10 px-4 rounded-xl cursor-pointer"
          >
            Back to Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              onClose();
              navigate(`/requirements/${requirement.requirement_code || requirement.id}`);
            }}
            className="w-full sm:w-auto border-[#5D87FF]/30 text-[#5D87FF] hover:bg-[#ECF2FF] text-xs font-semibold h-10 px-4 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> View Requirement
          </Button>

          <Button
            onClick={() => {
              onClose();
              navigate(`/dashboard/matches?requirementId=${requirement.id}`);
            }}
            className="w-full sm:w-auto bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold h-10 px-5 rounded-xl cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4" /> View Matches <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
