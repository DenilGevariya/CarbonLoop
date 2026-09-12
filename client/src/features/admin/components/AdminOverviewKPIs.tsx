import React from 'react';
import { Building2, Factory, Package, FileText, Repeat, ShoppingCart, Truck, ShieldAlert } from 'lucide-react';
import type { AdminOverviewKPIs as KPIProps } from '../api/adminApi';

interface AdminOverviewKPIsProps {
  kpis: KPIProps;
  isLoading?: boolean;
}

export const AdminOverviewKPIsComponent: React.FC<AdminOverviewKPIsProps> = ({ kpis, isLoading }) => {
  const cards = [
    {
      title: 'Active Organizations',
      value: kpis.activeOrganizationsCount.toLocaleString(),
      subtitle: 'Verified Emitters, Buyers & Logistics',
      icon: <Building2 className="w-5 h-5 text-[#173D32]" />,
      bg: 'bg-emerald-50/50 border-emerald-100',
    },
    {
      title: 'Monitored Facilities',
      value: kpis.activeFacilitiesCount.toLocaleString(),
      subtitle: 'Industrial capture & utilization sites',
      icon: <Factory className="w-5 h-5 text-amber-700" />,
      bg: 'bg-amber-50/50 border-amber-100',
    },
    {
      title: 'Available CO₂ Supply',
      value: `${kpis.availableSupplyTonnes.toLocaleString()} t`,
      subtitle: 'Active market liquid & gaseous listings',
      icon: <Package className="w-5 h-5 text-[#173D32]" />,
      bg: 'bg-teal-50/50 border-teal-100',
    },
    {
      title: 'Requested Demand',
      value: `${kpis.requestedDemandTonnes.toLocaleString()} t`,
      subtitle: 'Active buyer volume requirements',
      icon: <FileText className="w-5 h-5 text-blue-700" />,
      bg: 'bg-blue-50/50 border-blue-100',
    },
    {
      title: 'Matched Volume',
      value: `${kpis.matchedVolumeTonnes.toLocaleString()} t`,
      subtitle: 'Algorithmic compatibility matched',
      icon: <Repeat className="w-5 h-5 text-indigo-700" />,
      bg: 'bg-indigo-50/50 border-indigo-100',
    },
    {
      title: 'Active Commercial Orders',
      value: kpis.activeOrdersCount.toLocaleString(),
      subtitle: 'Contracted CO₂ supply deals',
      icon: <ShoppingCart className="w-5 h-5 text-purple-700" />,
      bg: 'bg-purple-50/50 border-purple-100',
    },
    {
      title: 'In-Transit Shipments',
      value: kpis.activeShipmentsCount.toLocaleString(),
      subtitle: 'Active ISO tanker transport legs',
      icon: <Truck className="w-5 h-5 text-stone-800" />,
      bg: 'bg-stone-100/70 border-stone-200',
    },
    {
      title: 'Pending Verifications',
      value: kpis.pendingVerificationCount.toLocaleString(),
      subtitle: 'Certificates awaiting audit approval',
      icon: <ShieldAlert className="w-5 h-5 text-rose-700" />,
      bg: 'bg-rose-50/50 border-rose-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 bg-[#E2DDD5]/40 rounded-xl animate-pulse border border-[#E2DDD5]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-xl border ${card.bg} bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider font-mono">
              {card.title}
            </span>
            <div className="p-2 bg-white rounded-lg border border-[#E2DDD5]/60 shadow-xs">{card.icon}</div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#171A18] font-mono tracking-tight">{card.value}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">{card.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
