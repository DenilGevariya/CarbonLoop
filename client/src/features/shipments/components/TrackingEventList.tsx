import React from 'react';
import type { TrackingEvent } from '../api/shipmentApi';
import { MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  events?: TrackingEvent[];
  onAddEvent?: () => void;
  canAddEvent?: boolean;
}

export const TrackingEventList: React.FC<Props> = ({ events = [], onAddEvent, canAddEvent = false }) => {
  if (events.length === 0) {
    return (
      <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 text-center">
        <Clock className="w-8 h-8 text-[#55524D] mx-auto mb-2 opacity-50" />
        <p className="text-sm font-mono text-[#55524D]">No tracking events logged yet.</p>
        {canAddEvent && onAddEvent && (
          <button
            onClick={onAddEvent}
            className="mt-3 px-3 py-1.5 bg-[#173D32] text-white text-xs font-mono rounded hover:bg-[#173D32]/90"
          >
            + Log Checkpoint Event
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E2DDD5]/60">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#171A18] font-bold">
            Historical Tracking Log
          </h3>
          <p className="text-[11px] font-mono text-[#55524D]">
            Immutable chain of recorded transport events
          </p>
        </div>

        {canAddEvent && onAddEvent && (
          <button
            onClick={onAddEvent}
            className="px-3 py-1.5 bg-[#173D32] text-white text-xs font-mono font-medium rounded hover:bg-[#173D32]/90 transition"
          >
            + Log Checkpoint
          </button>
        )}
      </div>

      <div className="relative pl-6 border-l-2 border-[#E2DDD5] space-y-6">
        {events.map((evt, idx) => {
          const formattedTime = evt.occurred_at
            ? format(new Date(evt.occurred_at), 'dd MMM yyyy · HH:mm')
            : 'N/A';

          const isException = evt.event_type.includes('EXCEPTION') || evt.event_type.includes('DELAY');

          return (
            <div key={evt.id || idx} className="relative group">
              {/* Event Marker Dot */}
              <div
                className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                  isException
                    ? 'bg-rose-600 ring-2 ring-rose-200'
                    : idx === 0
                    ? 'bg-[#173D32] ring-2 ring-[#173D32]/20'
                    : 'bg-[#55524D]'
                }`}
              />

              <div className="bg-[#F7F5EF] border border-[#E2DDD5]/80 rounded p-3.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-[#171A18] uppercase tracking-wide">
                    {evt.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-[#55524D]">
                    {formattedTime}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-[#55524D] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#173D32]" />
                  <span>{evt.location_name || 'Location Not Specified'}</span>
                </div>

                {evt.notes && (
                  <p className="text-xs text-[#55524D] mt-2 bg-[#FAF8F5] p-2 rounded border border-[#E2DDD5]/60 font-mono italic">
                    "{evt.notes}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
