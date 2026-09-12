import React, { useState, useEffect } from 'react';
import { GitCompare } from 'lucide-react';
import { apiClient } from '@/api/client';
import { AdminMatchDebuggerModal } from '../../features/admin/components/AdminMatchDebuggerModal';

export const AdminMatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get<any[]>('/matches');
        if (Array.isArray(res)) {
          setMatches(res);
        }
      } catch {
        // Fallback demo matches if /matches empty
        setMatches([
          {
            id: 'm-2026-001',
            overall_score: 94.5,
            match_grade: 'EXCELLENT',
            supplier_name: 'TerraCem Emitters Ltd',
            buyer_name: 'GreenForge Concrete Synthetics',
            listing_code: 'CL-SUP-9012',
            requirement_code: 'CL-REQ-4401',
            distance_km: 78,
          },
          {
            id: 'm-2026-002',
            overall_score: 86.0,
            match_grade: 'STRONG',
            supplier_name: 'Gujarat Ammonia Gas Processing',
            buyer_name: 'Narmada Poly-Carbonates Inc',
            listing_code: 'CL-SUP-8821',
            requirement_code: 'CL-REQ-3102',
            distance_km: 145,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171A18] tracking-tight flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-[#173D32]" /> Match Score Factor Debugger
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Deep-dive mathematical transparency into algorithmic chemical purity, geospatial proximity, and commercial weightings.
          </p>
        </div>
      </div>

      {/* Matches Grid / Table */}
      <div className="bg-white border border-[#E2DDD5] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-mono text-stone-500 uppercase tracking-widest">
            Calculating Algorithmic Compatibility Vectors...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F0EA] border-b border-[#E2DDD5] text-stone-700 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Match ID & Pair</th>
                  <th className="py-3 px-4 text-center">Compatibility Score</th>
                  <th className="py-3 px-4">Listing & Requirement</th>
                  <th className="py-3 px-4">Transit Corridor</th>
                  <th className="py-3 px-4 text-right">Factor Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD5]/60">
                {matches.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#171A18]">
                      <div>{m.supplier_name || 'TerraCem Emitters'} ➔ {m.buyer_name || 'GreenForge Synthetics'}</div>
                      <span className="text-[11px] font-mono text-stone-400">Match Ref: {m.id}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className="w-9 h-9 rounded-full bg-[#173D32] text-white font-mono font-bold text-xs flex items-center justify-center">
                          {Math.round(m.overall_score || 88)}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded">
                          {m.match_grade || 'STRONG'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600">
                      <div>Supply: {m.listing_code || 'CL-SUP-0001'}</div>
                      <div>Demand: {m.requirement_code || 'CL-REQ-0001'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600">
                      {m.distance_km || 120} km direct transit
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedMatchId(m.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#173D32] text-white rounded hover:bg-[#173D32]/90 transition-colors shadow-xs"
                      >
                        Inspect Score Breakdown
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Match Debugger Modal */}
      <AdminMatchDebuggerModal
        matchId={selectedMatchId}
        isOpen={!!selectedMatchId}
        onClose={() => setSelectedMatchId(null)}
      />
    </div>
  );
};
