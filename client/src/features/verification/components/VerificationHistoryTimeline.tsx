import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HistoryItem {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedByName?: string;
  reason?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface VerificationHistoryTimelineProps {
  history: HistoryItem[];
}

export const VerificationHistoryTimeline: React.FC<VerificationHistoryTimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-xs text-neutral-500 font-mono italic">
        No verification history recorded yet.
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'VERIFIED':
      case 'APPROVED':
        return <ShieldCheck className="w-4 h-4 text-[#173D32]" />;
      case 'UNDER_REVIEW':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'CHANGES_REQUESTED':
      case 'REJECTED':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-neutral-500" />;
    }
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="relative border-l-2 border-[#E2DDD5] ml-3 pl-6 space-y-6">
        {history.map((item, idx) => (
          <div key={item.id || idx} className="relative">
            {/* Timeline node icon */}
            <div className="absolute -left-[31px] top-0.5 bg-[#FAF8F5] p-1 rounded-full border border-[#E2DDD5]">
              {getStatusIcon(item.toStatus)}
            </div>

            <div className="bg-[#FAF8F5] border border-[#E2DDD5] p-3.5 rounded-lg space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#171A18]">
                  {item.fromStatus ? `${item.fromStatus} → ` : ''}
                  <span className="text-[#173D32]">{item.toStatus}</span>
                </span>
                <span className="text-[10px] text-neutral-500">
                  {new Date(item.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {item.changedByName && (
                <span className="text-[10px] text-neutral-500 block">
                  Action logged by: <strong className="text-neutral-800">{item.changedByName}</strong>
                </span>
              )}

              {item.notes && (
                <p className="text-xs text-neutral-700 mt-1 bg-[#F7F5EF] p-2 rounded border border-[#E2DDD5]/60">
                  "{item.notes}"
                </p>
              )}

              {item.reason && (
                <p className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200 mt-1">
                  Reason: {item.reason}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
