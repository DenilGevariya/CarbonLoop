import React from 'react';
import type { BuyerRequirement } from '../types/requirement';
import { ShieldCheck, Truck, MapPin, Tag } from 'lucide-react';

interface RequirementSpecificationsProps {
  requirement: BuyerRequirement;
  className?: string;
}

export const RequirementSpecifications: React.FC<RequirementSpecificationsProps> = ({
  requirement,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-[#E2DDD5] p-6 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-4 mb-6">
        <div>
          <span className="font-mono text-[10px] font-bold text-[#5C625E] uppercase tracking-wider block mb-0.5">
            Technical Specification Matrix
          </span>
          <h3 className="font-sans font-bold text-lg text-[#171A18]">
            CO₂ Feedstock Requirements
          </h3>
        </div>
        <div className="font-mono text-xs text-[#173D32] bg-[#173D32]/10 border border-[#173D32]/20 px-3 py-1 font-bold">
          {requirement.requirement_code}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
        {/* Required Volume */}
        <div className="bg-[#FAF8F5] p-4 border border-[#E2DDD5]/70 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
            Requested Volume
          </span>
          <div className="text-xl font-bold text-[#171A18] font-sans">
            {requirement.required_quantity.toLocaleString()}{' '}
            <span className="text-xs font-mono font-normal text-stone-600">
              {requirement.quantity_unit}s
            </span>
          </div>
          <span className="text-[10px] text-stone-500 block">Total off-take allocation</span>
        </div>

        {/* Purity Window */}
        <div className="bg-[#FAF8F5] p-4 border border-[#E2DDD5]/70 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
            Minimum Purity
          </span>
          <div className="text-xl font-bold text-[#173D32] font-sans flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#173D32]" />
            ≥{requirement.minimum_purity}%
          </div>
          <span className="text-[10px] text-stone-500 block">
            {requirement.maximum_purity
              ? `Max cap: ${requirement.maximum_purity}%`
              : 'Strict lower purity threshold'}
          </span>
        </div>

        {/* Physical Form */}
        <div className="bg-[#FAF8F5] p-4 border border-[#E2DDD5]/70 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
            Acceptable Form
          </span>
          <div className="text-sm font-bold text-[#171A18] uppercase tracking-wide flex items-center gap-1.5 pt-1">
            <Tag className="w-3.5 h-3.5 text-stone-600" />
            {requirement.acceptable_physical_form
              ? requirement.acceptable_physical_form.replace(/_/g, ' ')
              : 'Any Form'}
          </div>
          <span className="text-[10px] text-stone-500 block">State specification</span>
        </div>

        {/* Commercial Budget */}
        <div className="bg-[#FAF8F5] p-4 border border-[#E2DDD5]/70 space-y-1">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
            Max Unit Price (Ceiling)
          </span>
          <div className="text-xl font-bold text-[#171A18] font-sans">
            {requirement.maximum_price_per_unit
              ? `₹${requirement.maximum_price_per_unit.toLocaleString()}`
              : 'Open Price'}
            {requirement.maximum_price_per_unit && (
              <span className="text-xs font-mono font-normal text-stone-600">
                /{requirement.quantity_unit}
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-500 block">Maximum acceptable price</span>
        </div>
      </div>

      {/* Logistics & Capture Parameters */}
      <div className="mt-6 pt-6 border-t border-[#E2DDD5] grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-stone-700">
          <Truck className="w-4 h-4 text-[#173D32]" />
          <span>
            Delivery Mode:{' '}
            <strong className="text-[#171A18]">
              {requirement.delivery_required ? 'Delivery Required to Site' : 'Buyer Pickup Available'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-stone-700">
          <MapPin className="w-4 h-4 text-[#173D32]" />
          <span>
            Destination:{' '}
            <strong className="text-[#171A18]">
              {requirement.destination_facility
                ? `${requirement.destination_facility.name} (${requirement.destination_facility.city})`
                : `${requirement.location_city || 'Regional'}, ${requirement.location_state || 'Gujarat'}`}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-stone-700">
          <ShieldCheck className="w-4 h-4 text-[#173D32]" />
          <span>
            Capture Method Preference:{' '}
            <strong className="text-[#171A18]">
              {requirement.preferred_capture_method || 'No Specific Constraint'}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
