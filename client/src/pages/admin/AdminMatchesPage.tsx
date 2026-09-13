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
        setMatches(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error('Failed to load database matches:', error);
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAEF] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-[#5D87FF]" /> Match Score Factor Debugger
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1 font-medium">
            Deep-dive mathematical transparency into algorithmic chemical purity, geospatial proximity, and commercial weightings.
          </p>
        </div>
      </div>

      {/* Matches Grid / Table */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-semibold text-[#5A6A85] uppercase tracking-wider">
            Calculating Algorithmic Compatibility Vectors...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-[#5A6A85] font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Match ID & Pair</th>
                  <th className="py-3 px-4 text-center">Compatibility Score</th>
                  <th className="py-3 px-4">Listing & Requirement</th>
                  <th className="py-3 px-4">Transit Corridor</th>
                  <th className="py-3 px-4 text-right">Factor Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAEF]">
                {matches.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F6F9FC] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#2A3547]">
                      <div>{m.supplier_name || 'TerraCem Emitters'} ➔ {m.buyer_name || 'GreenForge Synthetics'}</div>
                      <span className="text-[11px] text-[#5A6A85]">Match Ref: {m.id}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className="w-9 h-9 rounded-full bg-[#5D87FF] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {Math.round(m.overall_score || 88)}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/20 rounded-md">
                          {m.match_grade || 'STRONG'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#5A6A85]">
                      <div>Supply: {m.listing_code || 'CL-SUP-0001'}</div>
                      <div>Demand: {m.requirement_code || 'CL-REQ-0001'}</div>
                    </td>
                    <td className="py-3 px-4 text-[#5A6A85]">
                      {m.distance_km || 120} km direct transit
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedMatchId(m.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-[#5D87FF] text-white rounded-lg hover:bg-[#4570EA] transition-colors shadow-xs"
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
