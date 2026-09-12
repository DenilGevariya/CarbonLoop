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
    <div className="space-y-4 text-xs font-sans">
      <div className="relative border-l-2 border-[#E5EAEF] ml-3 pl-6 space-y-6">
        {history.map((item, idx) => (
          <div key={item.id || idx} className="relative">
            {/* Timeline node icon */}
            <div className="absolute -left-[31px] top-0.5 bg-white p-1 rounded-full border border-[#E5EAEF]">
              {getStatusIcon(item.toStatus)}
            </div>

            <div className="bg-white border border-[#E5EAEF] p-3.5 rounded-xl space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#2A3547]">
                  {item.fromStatus ? `${item.fromStatus} → ` : ''}
                  <span className="text-[#5D87FF]">{item.toStatus}</span>
                </span>
                <span className="text-[10px] text-[#5A6A85]">
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
                <span className="text-[10px] text-[#5A6A85] block">
                  Action logged by: <strong className="text-[#2A3547]">{item.changedByName}</strong>
                </span>
              )}

              {item.notes && (
                <p className="text-xs text-[#2A3547] mt-1 bg-[#F6F9FC] p-2.5 rounded-lg border border-[#E5EAEF]">
                  "{item.notes}"
                </p>
              )}

              {item.reason && (
                <p className="text-xs text-[#FA896B] bg-[#FA896B]/10 p-2.5 rounded-lg border border-[#FA896B]/30 mt-1 font-semibold">
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
