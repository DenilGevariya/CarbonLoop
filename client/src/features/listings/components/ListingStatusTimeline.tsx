import React from 'react';
import type { ListingStatusHistoryDTO } from '../types/listing';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { ListingStatusBadge } from './ListingStatusBadge';

interface Props {
  history?: ListingStatusHistoryDTO[];
}

export const ListingStatusTimeline: React.FC<Props> = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2DDD5] p-6 shadow-2xs">
      <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-6 pb-2 border-b border-[#E2DDD5] flex items-center gap-2">
        <Clock className="w-4 h-4 text-stone-400" />
        Listing Lifecycle Status History Audit Log
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2DDD5]">
        {history.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="relative font-mono text-xs"
          >
            {/* Timeline Node Dot */}
            <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[#173D32] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#173D32]" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-stone-500 text-[11px]">Transitioned to:</span>
                <ListingStatusBadge status={item.toStatus} />
              </div>
              <span className="text-stone-400 text-[10px]">
                {new Date(item.createdAt).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {item.reason && (
              <p className="mt-1 text-stone-600 font-sans text-xs bg-[#FAF8F5] p-2.5 rounded border border-[#E2DDD5]">
                <span className="font-mono text-[10px] uppercase text-stone-400 block mb-0.5">Reason Note</span>
                "{item.reason}"
              </p>
            )}

            {item.changedBy && (
              <p className="mt-1 text-[10px] text-stone-400">
                Action executed by: <span className="text-stone-700 font-medium">{item.changedBy.name}</span>
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
