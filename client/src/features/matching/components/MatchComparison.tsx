import React from 'react';
import type { MatchRecord } from '../types/matching.types';
import { Check, AlertCircle, X } from 'lucide-react';

interface MatchComparisonProps {
  match: MatchRecord;
}

export const MatchComparison: React.FC<MatchComparisonProps> = ({ match }) => {
  const listing = match.listing;
  const requirement = match.requirement;

  if (!listing || !requirement) {
    return null;
  }

  const reqQty = requirement.required_quantity_tons;
  const supQty = listing.remaining_quantity ?? listing.available_quantity_tons;
  const qtyPass = supQty >= reqQty;

  const reqPurity = requirement.required_purity_percentage;
  const supPurity = listing.purity_percentage;
  const purityPass = supPurity >= reqPurity;

  const reqForm = (requirement.preferred_state_form || 'ANY').toUpperCase();
  const supForm = listing.state_form.toUpperCase();
  const formPass = reqForm === 'ANY' || reqForm === supForm;

  const reqPrice = requirement.target_price_per_ton;
  const supPrice = listing.price_per_ton;
  const pricePass = !reqPrice || supPrice <= reqPrice;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-mono text-stone-500 uppercase tracking-wider font-bold">
        Side-by-Side Specification Matrix
      </h4>

      <div className="overflow-x-auto rounded-xl border border-[#E2DDD5] bg-white shadow-2xs">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#F7F5EF] text-stone-500 uppercase border-b border-[#E2DDD5]">
            <tr>
              <th className="p-3.5 font-bold">Specification</th>
              <th className="p-3.5 font-bold">Buyer Requirement</th>
              <th className="p-3.5 font-bold">CO₂ Supply Stream</th>
              <th className="p-3.5 text-center font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2DDD5] bg-white">
            {/* Quantity */}
            <tr>
              <td className="p-3.5 font-bold text-[#171A18] font-sans">Required Volume</td>
              <td className="p-3.5 text-stone-600">{reqQty.toLocaleString()} tonnes</td>
              <td className="p-3.5 text-[#171A18] font-bold">{supQty.toLocaleString()} tonnes available</td>
              <td className="p-3.5 text-center">
                {qtyPass ? (
                  <Check className="size-4 text-[#173D32] mx-auto stroke-[2.5]" />
                ) : (
                  <AlertCircle className="size-4 text-amber-600 mx-auto" />
                )}
              </td>
            </tr>

            {/* Purity */}
            <tr>
              <td className="p-3.5 font-bold text-[#171A18] font-sans">Minimum Purity</td>
              <td className="p-3.5 text-stone-600">≥ {reqPurity}%</td>
              <td className="p-3.5 text-[#171A18] font-bold">{supPurity}%</td>
              <td className="p-3.5 text-center">
                {purityPass ? (
                  <Check className="size-4 text-[#173D32] mx-auto stroke-[2.5]" />
                ) : (
                  <X className="size-4 text-rose-600 mx-auto" />
                )}
              </td>
            </tr>

            {/* Physical Form */}
            <tr>
              <td className="p-3.5 font-bold text-[#171A18] font-sans">Physical Form</td>
              <td className="p-3.5 text-stone-600">{reqForm}</td>
              <td className="p-3.5 text-[#171A18] font-bold uppercase">{supForm}</td>
              <td className="p-3.5 text-center">
                {formPass ? (
                  <Check className="size-4 text-[#173D32] mx-auto stroke-[2.5]" />
                ) : (
                  <AlertCircle className="size-4 text-amber-600 mx-auto" />
                )}
              </td>
            </tr>

            {/* Price */}
            <tr>
              <td className="p-3.5 font-bold text-[#171A18] font-sans">Unit Price</td>
              <td className="p-3.5 text-stone-600">
                {reqPrice ? `≤ ₹${reqPrice.toLocaleString()}/t` : 'Market Target'}
              </td>
              <td className="p-3.5 text-[#171A18] font-bold">₹{supPrice.toLocaleString()}/t</td>
              <td className="p-3.5 text-center">
                {pricePass ? (
                  <Check className="size-4 text-[#173D32] mx-auto stroke-[2.5]" />
                ) : (
                  <AlertCircle className="size-4 text-amber-600 mx-auto" />
                )}
              </td>
            </tr>

            {/* Location */}
            <tr>
              <td className="p-3.5 font-bold text-[#171A18] font-sans">Location Hub</td>
              <td className="p-3.5 text-stone-600">{requirement.location_city}, {requirement.location_state}</td>
              <td className="p-3.5 text-[#171A18] font-bold">{listing.city}, {listing.state}</td>
              <td className="p-3.5 text-center">
                <Check className="size-4 text-[#173D32] mx-auto stroke-[2.5]" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
