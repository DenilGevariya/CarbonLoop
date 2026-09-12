import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldCheck, Scale, MapPin, DollarSign, Award, Layers } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { MatchDebugDetail } from '../api/adminApi';

interface AdminMatchDebuggerModalProps {
  matchId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMatchDebuggerModal: React.FC<AdminMatchDebuggerModalProps> = ({ matchId, isOpen, onClose }) => {
  const [detail, setDetail] = useState<MatchDebugDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !matchId) {
      setDetail(null);
      return;
    }

    const fetchDebug = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await adminApi.getMatchDebug(matchId);
        if (res) {
          setDetail(res);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load match factor debug detail.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebug();
  }, [matchId, isOpen]);

  if (!isOpen) return null;

  const getFactorIcon = (factorName: string) => {
    if (factorName.includes('Quantity')) return <Scale className="w-4 h-4 text-emerald-700" />;
    if (factorName.includes('Purity') || factorName.includes('Assay')) return <Award className="w-4 h-4 text-[#173D32]" />;
    if (factorName.includes('Geospatial') || factorName.includes('Proximity')) return <MapPin className="w-4 h-4 text-amber-700" />;
    if (factorName.includes('Price')) return <DollarSign className="w-4 h-4 text-blue-700" />;
    if (factorName.includes('Verification') || factorName.includes('Bonus')) return <ShieldCheck className="w-4 h-4 text-purple-700" />;
    return <Layers className="w-4 h-4 text-stone-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171A18]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#E2DDD5] shadow-2xl rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DDD5] bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#173D32] text-white rounded uppercase">
                Match Factor Inspector
              </span>
              <span className="text-xs font-mono text-stone-500">ID: {matchId}</span>
            </div>
            <h2 className="text-lg font-bold text-[#171A18] mt-0.5">
              {detail ? `${detail.supplierName} ➔ ${detail.buyerName}` : 'Match Factor Debugger'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-stone-400 hover:text-stone-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading && (
            <div className="py-12 text-center text-xs font-mono text-stone-500 uppercase tracking-widest">
              Calculating Aggregated Match Vector Weights...
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {detail && !isLoading && (
            <>
              {/* Score Headline Banner */}
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#173D32] text-white font-mono text-2xl font-bold flex items-center justify-center shadow-inner">
                    {Math.round(detail.overallScore)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#171A18] uppercase tracking-wide">
                        Overall Compatibility Rating
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded">
                        {detail.matchGrade}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Pairing: <strong className="text-stone-700">{detail.listingCode}</strong> (Listing) with <strong className="text-stone-700">{detail.requirementCode}</strong> (Demand Requirement)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-right font-mono text-xs border-l border-[#E2DDD5] pl-4">
                  <div>
                    <span className="text-stone-400 text-[10px] block uppercase">Purity Assay</span>
                    <span className="font-bold text-stone-800">{detail.purityPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block uppercase">Transit Dist</span>
                    <span className="font-bold text-stone-800">{detail.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block uppercase">Unit Price</span>
                    <span className="font-bold text-stone-800">₹{detail.pricePerTon}/t</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block uppercase">Verification</span>
                    <span className="font-bold text-emerald-700">{detail.verificationStatus}</span>
                  </div>
                </div>
              </div>

              {/* Eligibility Warnings if any */}
              {detail.eligibilityWarnings.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-700" /> Operational Warnings:
                  </span>
                  {detail.eligibilityWarnings.map((w, idx) => (
                    <p key={idx} className="text-amber-800 font-mono text-[11px] pl-5">• {w}</p>
                  ))}
                </div>
              )}

              {/* Factor Decomposition Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 font-mono mb-3">
                  Match Score Weight Decomposition Matrix
                </h3>
                <div className="border border-[#E2DDD5] rounded-lg overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F0EA] border-b border-[#E2DDD5] text-stone-700 font-mono text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Evaluation Factor</th>
                        <th className="py-2.5 px-3 text-center">Score (0-100)</th>
                        <th className="py-2.5 px-3 text-center">Weight (%)</th>
                        <th className="py-2.5 px-3 text-center">Weighted Score</th>
                        <th className="py-2.5 px-3">Engine Assessment Explanation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DDD5]/60">
                      {detail.factors.map((f, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-3 px-3 font-semibold text-stone-800 flex items-center gap-2">
                            {getFactorIcon(f.factor)}
                            {f.factor}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-stone-800">
                            {f.score}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-stone-500">
                            {f.weightPercent}%
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-[#173D32]">
                            {f.weightedScore.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-stone-600 text-[11px]">
                            {f.explanation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2DDD5] bg-[#F4F0EA] flex items-center justify-between text-xs font-mono">
          <span className="text-stone-500">Deterministic SQL Mathematical Scoring Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#173D32] text-white font-semibold rounded hover:bg-[#173D32]/90 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
