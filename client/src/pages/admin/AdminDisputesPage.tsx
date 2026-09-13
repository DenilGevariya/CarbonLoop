import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const AdminDisputesPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [disputes, setDisputes] = useState([
    {
      id: 'DISP-9901',
      parties: 'TerraCem Industries vs. CryoTrans Haulage',
      category: 'Purity Deviation',
      description: 'Recipient lab chromatography reported 97.2% purity vs 99.5% declared in listing.',
      status: 'OPEN',
      date: '2026-09-11',
      priority: 'HIGH',
    },
    {
      id: 'DISP-9902',
      parties: 'GreenForge Materials vs. Express Cryo Logistics',
      category: 'Delivery Delay',
      description: 'Shipment arrived 14 hours past agreed delivery window leading to idle losses.',
      status: 'UNDER_REVIEW',
      date: '2026-09-10',
      priority: 'MEDIUM',
    },
    {
      id: 'DISP-9903',
      parties: 'BioGas Refining vs. Gujarat Concrete Systems',
      category: 'Billing Discrepancy',
      description: 'Discrepancy in delivered volumetric tonnage (480 tonnes vs 500 tonnes invoiced).',
      status: 'RESOLVED',
      date: '2026-09-08',
      priority: 'LOW',
    },
  ]);

  const handleResolve = (id: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'RESOLVED' } : d))
    );
  };

  const filteredDisputes = disputes.filter((d) => {
    if (filterStatus !== 'all' && d.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    if (searchQuery && !d.parties.toLowerCase().includes(searchQuery.toLowerCase()) && !d.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans text-[#2A3547]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5EAEF] pb-5 gap-4">
        <div>
          <span className="text-xs font-bold text-[#FA896B] bg-[#FDEDE8] border border-[#FA896B]/20 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            ADMIN COMPLAINTS & DISPUTES COMMAND
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2A3547] tracking-tight">
            Complaints & Dispute Resolution
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Review, investigate, and resolve commercial disputes between emitters, utilizers, and logistics providers.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E5EAEF] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5A6A85] uppercase">Open Disputes</span>
            <AlertTriangle className="w-5 h-5 text-[#FA896B]" />
          </div>
          <p className="text-3xl font-bold text-[#2A3547] mt-2">
            {disputes.filter((d) => d.status === 'OPEN').length}
          </p>
        </div>

        <div className="bg-white border border-[#E5EAEF] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5A6A85] uppercase">Under Review</span>
            <ShieldAlert className="w-5 h-5 text-[#FFAE1F]" />
          </div>
          <p className="text-3xl font-bold text-[#2A3547] mt-2">
            {disputes.filter((d) => d.status === 'UNDER_REVIEW').length}
          </p>
        </div>

        <div className="bg-white border border-[#E5EAEF] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5A6A85] uppercase">Resolved</span>
            <CheckCircle2 className="w-5 h-5 text-[#13DEB9]" />
          </div>
          <p className="text-3xl font-bold text-[#2A3547] mt-2">
            {disputes.filter((d) => d.status === 'RESOLVED').length}
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5EAEF] p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dispute ref or party names..."
            className="pl-9 h-10 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5A6A85]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 bg-[#F6F9FC] border border-[#E5EAEF] text-xs font-bold text-[#2A3547] rounded-xl focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">OPEN</option>
            <option value="under_review">UNDER REVIEW</option>
            <option value="resolved">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.map((d) => (
          <div key={d.id} className="bg-white border border-[#E5EAEF] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="font-bold text-base text-[#2A3547]">{d.id}</span>
                <Badge variant="outline" className="border-[#FA896B]/30 text-[#FA896B] bg-[#FDEDE8] text-xs font-bold">
                  {d.category}
                </Badge>
                <Badge variant="outline" className={d.status === 'RESOLVED' ? 'border-[#13DEB9]/30 text-[#13DEB9] bg-[#E6FFFA] text-xs font-bold' : 'border-[#FFAE1F]/30 text-[#FFAE1F] bg-[#FEF5E5] text-xs font-bold'}>
                  {d.status}
                </Badge>
              </div>
              <p className="text-xs font-bold text-[#5D87FF]">{d.parties}</p>
              <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">{d.description}</p>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              {d.status !== 'RESOLVED' && (
                <Button
                  onClick={() => handleResolve(d.id)}
                  className="bg-[#13DEB9] hover:bg-[#0eb899] text-white font-semibold text-xs rounded-xl px-4 py-2"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Resolve Dispute
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDisputesPage;
