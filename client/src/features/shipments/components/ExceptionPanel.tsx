import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, notes?: string) => Promise<void>;
}

const REASONS = [
  'Vehicle Mechanical Delay',
  'Facility Loading Unavailable',
  'Damaged Shipment Seal',
  'Severe Weather / Road Blockage',
  'Route Diversion Delay',
  'Customs / Checkpoint Hold',
  'Other Operational Issue',
];

export const ExceptionPanel: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(reason, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit operational exception');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#E2DDD5] w-full max-w-lg rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-rose-50 border-b border-rose-200">
          <div className="flex items-center gap-2 text-rose-900 font-mono font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>REPORT OPERATIONAL EXCEPTION</span>
          </div>
          <button onClick={onClose} className="text-rose-700 hover:text-rose-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 text-xs rounded font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-semibold text-[#171A18] mb-1 uppercase tracking-wide">
              Exception Category / Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-2.5 text-xs font-mono text-[#171A18] focus:outline-none focus:border-[#173D32]"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[#171A18] mb-1 uppercase tracking-wide">
              Detailed Notes & Operational Impact
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe location, delay duration estimate, safety status..."
              className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded p-2.5 text-xs font-mono text-[#171A18] focus:outline-none focus:border-[#173D32]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2DDD5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#E2DDD5]/50 text-[#55524D] text-xs font-mono font-medium rounded hover:bg-[#E2DDD5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-rose-700 text-white text-xs font-mono font-semibold rounded hover:bg-rose-800 disabled:opacity-50"
            >
              {submitting ? 'Submitting Flag...' : 'Log Exception Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
