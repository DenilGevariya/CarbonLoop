import React from 'react';
import type { ShipmentStatus } from '../api/shipmentApi';
import { Check, AlertCircle } from 'lucide-react';

interface Props {
  status: ShipmentStatus;
  statusHistory?: any[];
}

const STAGES = [
  { key: 'TRANSPORTER_ASSIGNED', label: 'TRANSPORTER ASSIGNED' },
  { key: 'PICKED_UP', label: 'PICKED UP' },
  { key: 'IN_TRANSIT', label: 'IN TRANSIT' },
  { key: 'DELIVERED', label: 'DELIVERED' },
  { key: 'BUYER_CONFIRMED_RECEIPT', label: 'BUYER CONFIRMED' },
];

const STAGE_ORDER: Record<string, number> = {
  PLANNED: 0,
  TRANSPORTER_ASSIGNED: 1,
  SCHEDULED: 1,
  PICKED_UP: 2,
  IN_TRANSIT: 3,
  ARRIVING: 3.5,
  DELIVERED: 4,
  BUYER_CONFIRMED_RECEIPT: 5,
  COMPLETED: 5,
  EXCEPTION: 3.2,
  CANCELLED: -1,
};

export const ShipmentTimeline: React.FC<Props> = ({ status }) => {
  const currentLevel = STAGE_ORDER[status] ?? 1;
  const isException = status === 'EXCEPTION';
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 mb-6">
      <h3 className="text-xs font-mono uppercase tracking-wider text-[#55524D] mb-6 flex items-center justify-between">
        <span>Shipment Progress Timeline</span>
        <span className="text-[11px] font-mono text-[#55524D] bg-[#E2DDD5]/40 px-2 py-0.5 rounded">
          Real-time Event Stream
        </span>
      </h3>

      {/* Stepper container */}
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-[#E2DDD5] -z-0" />

        {STAGES.map((stage, idx) => {
          const stageLevel = STAGE_ORDER[stage.key];
          const isDone = currentLevel > stageLevel || status === 'COMPLETED';
          const isCurrent = currentLevel === stageLevel && !isException && !isCancelled;

          let icon = <span className="text-xs font-mono">{idx + 1}</span>;
          let circleBg = 'bg-[#FAF8F5] border-2 border-[#E2DDD5] text-[#55524D]';

          if (isDone) {
            circleBg = 'bg-[#173D32] border-2 border-[#173D32] text-white';
            icon = <Check className="w-3.5 h-3.5" />;
          } else if (isCurrent) {
            circleBg = 'bg-[#173D32] border-2 border-[#A3E635] text-white ring-4 ring-[#173D32]/10';
            icon = <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping" />;
          }

          if (isException && stage.key === 'IN_TRANSIT') {
            circleBg = 'bg-rose-600 border-2 border-rose-600 text-white';
            icon = <AlertCircle className="w-4 h-4" />;
          }

          return (
            <div key={stage.key} className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center w-full md:w-auto">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono transition-all duration-200 ${circleBg}`}>
                {icon}
              </div>

              <div>
                <p className={`text-xs font-mono font-semibold uppercase tracking-wider ${isDone || isCurrent ? 'text-[#171A18]' : 'text-[#55524D]'}`}>
                  {stage.label}
                </p>
                <p className="text-[10px] font-mono text-[#55524D]">
                  {isDone ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
