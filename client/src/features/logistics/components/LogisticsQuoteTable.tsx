import React from 'react';
import type { LogisticsQuote } from '../api/logisticsApi';
import { Truck, Clock, Leaf } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  quotes: LogisticsQuote[];
  userOrgId?: string;
  onAccept?: (quote: LogisticsQuote) => void;
  onReject?: (quote: LogisticsQuote) => void;
  onWithdraw?: (quote: LogisticsQuote) => void;
  acceptingId?: string | null;
}

export const LogisticsQuoteTable: React.FC<Props> = ({
  quotes,
  onAccept,
  onReject,
  acceptingId,
}) => {
  if (quotes.length === 0) {
    return (
      <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-10 text-center">
        <Truck className="w-10 h-10 text-[#55524D] mx-auto mb-3 opacity-40" />
        <h4 className="text-sm font-mono font-bold text-[#171A18] uppercase">No Logistics Quotes Found</h4>
        <p className="text-xs font-mono text-[#55524D] max-w-md mx-auto mt-1">
          No commercial transport proposals match your query. Qualified logistics providers can submit proposals for open orders.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-[#F7F5EF] border-b border-[#E2DDD5] text-[#55524D] uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 font-semibold">Logistics Provider</th>
              <th className="py-3.5 px-4 font-semibold">Transport Mode</th>
              <th className="py-3.5 px-4 font-semibold">Dist / Duration</th>
              <th className="py-3.5 px-4 font-semibold">Cost Breakdown</th>
              <th className="py-3.5 px-4 font-semibold">Est. CO₂e</th>
              <th className="py-3.5 px-4 font-semibold">Validity</th>
              <th className="py-3.5 px-4 font-semibold text-center">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2DDD5]/60">
            {quotes.map((q) => {
              const isAccepted = q.status === 'ACCEPTED';
              const isSubmitted = q.status === 'SUBMITTED' || q.status === 'PENDING';
              const formattedExpiry = q.valid_until
                ? format(new Date(q.valid_until), 'dd MMM yyyy')
                : 'N/A';

              return (
                <tr key={q.id} className="hover:bg-[#F7F5EF]/60 transition-colors">
                  {/* Provider Name */}
                  <td className="py-4 px-4 font-medium text-[#171A18]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-[#173D32]/10 flex items-center justify-center text-[#173D32]">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#171A18]">{q.provider_name || 'CarbonRoute Freight'}</p>
                        <p className="text-[10px] text-[#55524D]">ORDER #{q.order_number || q.order_id?.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Mode */}
                  <td className="py-4 px-4 text-[#171A18] uppercase">
                    <span className="px-2 py-0.5 rounded bg-[#E2DDD5]/40 text-[11px] font-semibold border border-[#E2DDD5]">
                      {q.transport_mode?.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Distance & Duration */}
                  <td className="py-4 px-4 text-[#55524D]">
                    <p className="font-bold text-[#171A18]">{q.distance_km || 120} km</p>
                    <p className="text-[10px]">{Math.round((q.estimated_duration_minutes || 240) / 60)} hrs indicative</p>
                  </td>

                  {/* Total Cost */}
                  <td className="py-4 px-4">
                    <p className="font-bold text-sm text-[#171A18]">
                      ₹{parseFloat(q.total_cost.toString()).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-[#55524D]">
                      Base: ₹{parseFloat(q.base_cost.toString()).toLocaleString('en-IN')} | Fuel: ₹{parseFloat((q.fuel_surcharge || 0).toString()).toLocaleString('en-IN')}
                    </p>
                  </td>

                  {/* Est Emissions */}
                  <td className="py-4 px-4 text-[#55524D]">
                    <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{Math.round(q.estimated_co2e_kg || 2700)} kg</span>
                    </div>
                    <p className="text-[10px] text-[#55524D]">Est. Transport CO₂e</p>
                  </td>

                  {/* Validity */}
                  <td className="py-4 px-4 text-[#55524D] text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#55524D]" />
                      <span>{formattedExpiry}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                        isAccepted
                          ? 'bg-[#173D32] text-white'
                          : isSubmitted
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isSubmitted && onAccept && (
                        <button
                          onClick={() => onAccept(q)}
                          disabled={acceptingId === q.id}
                          className="px-3 py-1.5 bg-[#173D32] text-white text-xs font-semibold rounded hover:bg-[#173D32]/90 disabled:opacity-50 transition"
                        >
                          {acceptingId === q.id ? 'Accepting...' : 'Accept Quote'}
                        </button>
                      )}
                      {isSubmitted && onReject && (
                        <button
                          onClick={() => onReject(q)}
                          className="px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium rounded hover:bg-rose-100"
                        >
                          Reject
                        </button>
                      )}
                      {q.notes && (
                        <span className="text-[10px] text-[#55524D] italic max-w-[120px] truncate" title={q.notes}>
                          "{q.notes}"
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
