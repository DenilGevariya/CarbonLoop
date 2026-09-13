import React from 'react';
import type { ShipmentStatus } from '../api/shipmentApi';
import { Truck, Clock, AlertTriangle, PackageCheck, Navigation, ShieldCheck } from 'lucide-react';

interface Props {
  status: ShipmentStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const ShipmentStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const upper = (status || 'PLANNED').toUpperCase() as ShipmentStatus;

  let bg = 'bg-[#173D32]/10 text-[#173D32] border-[#173D32]/20';
  let icon = <Clock className="w-3.5 h-3.5" />;
  let label: string = upper;

  switch (upper) {
    case 'TRANSPORTER_ASSIGNED':
      bg = 'bg-blue-50 text-[#5D87FF] border-blue-200';
      icon = <Truck className="w-3.5 h-3.5 text-[#5D87FF]" />;
      label = 'TRANSPORTER ASSIGNED';
      break;
    case 'PLANNED':
      bg = 'bg-[#E5EAEF] text-[#5A6A85] border-[#E5EAEF]';
      icon = <Clock className="w-3.5 h-3.5" />;
      label = 'PLANNED';
      break;
    case 'SCHEDULED':
      bg = 'bg-blue-50 text-blue-800 border-blue-200';
      icon = <Clock className="w-3.5 h-3.5 text-blue-600" />;
      label = 'SCHEDULED';
      break;
    case 'PICKED_UP':
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
      icon = <Truck className="w-3.5 h-3.5 text-amber-600" />;
      label = 'PICKED UP';
      break;
    case 'IN_TRANSIT':
      bg = 'bg-[#5D87FF] text-white border-[#5D87FF]';
      icon = <Navigation className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />;
      label = 'IN TRANSIT';
      break;
    case 'ARRIVING':
      bg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      icon = <Truck className="w-3.5 h-3.5 text-emerald-700" />;
      label = 'ARRIVING';
      break;
    case 'DELIVERED':
      bg = 'bg-teal-50 text-[#13DEB9] border-teal-200';
      icon = <PackageCheck className="w-3.5 h-3.5 text-[#13DEB9]" />;
      label = 'DELIVERED';
      break;
    case 'BUYER_CONFIRMED_RECEIPT':
    case 'COMPLETED':
      bg = 'bg-[#2A3547] text-white border-[#2A3547]';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-[#13DEB9]" />;
      label = upper === 'BUYER_CONFIRMED_RECEIPT' ? 'BUYER CONFIRMED RECEIPT' : 'COMPLETED';
      break;
    case 'OVERDUE':
      bg = 'bg-[#FA896B] text-white border-[#FA896B]';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />;
      label = 'OVERDUE';
      break;
    case 'EXCEPTION':
      bg = 'bg-rose-50 text-rose-800 border-rose-200';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      label = 'EXCEPTION';
      break;
    case 'CANCELLED':
      bg = 'bg-neutral-100 text-neutral-500 border-neutral-300';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-neutral-400" />;
      label = 'CANCELLED';
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5 font-medium tracking-wide',
    lg: 'text-xs px-3 py-1.5 space-x-2 font-semibold tracking-wider',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-md border font-mono uppercase ${bg} ${sizeClasses}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};
