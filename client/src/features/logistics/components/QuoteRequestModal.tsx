import React, { useState } from 'react';
import type { TransportMode, CreateQuoteInput } from '../api/logisticsApi';
import { X, Truck, Calculator } from 'lucide-react';

interface Props {
  isOpen: boolean;
  orderId?: string;
  orderNumber?: string;
  onClose: () => void;
  onSubmit: (data: CreateQuoteInput) => Promise<void>;
}

const MODES: { value: TransportMode; label: string }[] = [
  { value: 'ISO_TANK_TRUCK', label: 'ISO Tank Truck (Road Liquefied)' },
  { value: 'CYLINDER_CASCADE', label: 'Cylinder Cascade Trailer (High Pressure)' },
  { value: 'ROAD', label: 'Standard Road Freight Tanker' },
  { value: 'RAIL_TANKER', label: 'Rail Tanker Car' },
  { value: 'RAIL', label: 'Bulk Freight Rail' },
  { value: 'PIPELINE', label: 'CO₂ Dedicated Pipeline' },
  { value: 'SHIP', label: 'Marine CO₂ Carrier Vessel' },
  { value: 'OTHER', label: 'Other Specialist Transport' },
];

export const QuoteRequestModal: React.FC<Props> = ({
  isOpen,
  orderId = '',
  orderNumber = '',
  onClose,
  onSubmit,
}) => {
  const [transportMode, setTransportMode] = useState<TransportMode>('ISO_TANK_TRUCK');
  const [baseCost, setBaseCost] = useState<number>(35000);
  const [fuelSurcharge, setFuelSurcharge] = useState<number>(5000);
  const [handlingCost, setHandlingCost] = useState<number>(2000);
  const [otherCost, setOtherCost] = useState<number>(1000);
  const [validDays, setValidDays] = useState<number>(7);
  const [notes, setNotes] = useState<string>('Includes temperature regulation and safety monitoring.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalCost = baseCost + fuelSurcharge + handlingCost + otherCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      setError('Please select an active order for this transport quote.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const validUntil = new Date(Date.now() + validDays * 86400000).toISOString();
      await onSubmit({
        order_id: orderId,
        transport_mode: transportMode,
        base_cost: Number(baseCost),
        fuel_surcharge: Number(fuelSurcharge),
        handling_cost: Number(handlingCost),
        other_cost: Number(otherCost),
        currency: 'INR',
        valid_until: validUntil,
        notes,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit transport quote');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#E2DDD5] w-full max-w-xl rounded-lg shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-[#F7F5EF] border-b border-[#E2DDD5]">
          <div className="flex items-center gap-2 font-mono font-bold text-sm text-[#171A18]">
            <Truck className="w-5 h-5 text-[#173D32]" />
            <span>SUBMIT LOGISTICS TRANSPORT QUOTE</span>
          </div>
          <button onClick={onClose} className="text-[#55524D] hover:text-[#171A18]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono text-xs">
          {error && (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded">
              {error}
            </div>
          )}

          {orderNumber && (
            <div className="p-3 bg-[#E2DDD5]/30 rounded border border-[#E2DDD5] text-[#171A18] font-semibold">
              TARGET ORDER: #{orderNumber}
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#171A18] mb-1 uppercase tracking-wide">
              Transport Mode *
            </label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value as TransportMode)}
              className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-2.5 text-[#171A18] focus:outline-none focus:border-[#173D32]"
            >
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171A18] mb-1 uppercase">Base Transport Fee (₹) *</label>
              <input
                type="number"
                min="0"
                value={baseCost}
                onChange={(e) => setBaseCost(Number(e.target.value))}
                className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-2.5 text-[#171A18] focus:outline-none focus:border-[#173D32]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#171A18] mb-1 uppercase">Fuel Surcharge (₹)</label>
              <input
                type="number"
                min="0"
                value={fuelSurcharge}
                onChange={(e) => setFuelSurcharge(Number(e.target.value))}
                className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-2.5 text-[#171A18] focus:outline-none focus:border-[#173D32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#171A18] mb-1 uppercase">Handling & Loading Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={handlingCost}
                onChange={(e) => setHandlingCost(Number(e.target.value))}
                className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-2.5 text-[#171A18] focus:outline-none focus:border-[#173D32]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#171A18] mb-1 uppercase">Other / Tolls Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={otherCost}
                onChange={(e) => setOtherCost(Number(e.target.value))}
                className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-2.5 text-[#171A18] focus:outline-none focus:border-[#173D32]"
              />
            </div>
          </div>

          {/* Computed Total Cost Card */}
          <div className="p-4 bg-[#171A18] text-[#F7F5EF] rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#A3E635]" />
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Computed Total Commercial Quote</p>
                <p className="text-xl font-bold text-white">₹{totalCost.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#A3E635] font-semibold">Server-Side Verified</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#171A18] mb-1 uppercase">Quote Validity Period</label>
            <select
              value={validDays}
              onChange={(e) => setValidDays(Number(e.target.value))}
              className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-2.5 text-[#171A18] focus:outline-none focus:border-[#173D32]"
            >
              <option value={3}>3 Days</option>
              <option value={7}>7 Days (Standard)</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#171A18] mb-1 uppercase">Operational Notes / SLA</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-2.5 text-[#171A18] focus:outline-none focus:border-[#173D32]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2DDD5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#E2DDD5]/50 text-[#55524D] font-medium rounded hover:bg-[#E2DDD5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#173D32] text-white font-semibold rounded hover:bg-[#173D32]/90 disabled:opacity-50"
            >
              {submitting ? 'Submitting Quote...' : 'Submit Commercial Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
