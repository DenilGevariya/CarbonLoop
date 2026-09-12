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
    if (factorName.includes('Quantity')) return <Scale className="w-4 h-4 text-[#13DEB9]" />;
    if (factorName.includes('Purity') || factorName.includes('Assay')) return <Award className="w-4 h-4 text-[#5D87FF]" />;
    if (factorName.includes('Geospatial') || factorName.includes('Proximity')) return <MapPin className="w-4 h-4 text-[#FFAE1F]" />;
    if (factorName.includes('Price')) return <DollarSign className="w-4 h-4 text-[#5D87FF]" />;
    if (factorName.includes('Verification') || factorName.includes('Bonus')) return <ShieldCheck className="w-4 h-4 text-purple-600" />;
    return <Layers className="w-4 h-4 text-[#5A6A85]" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A3547]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#F6F9FC] border border-[#E5EAEF] shadow-xl rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAEF] bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#ECF2FF] text-[#5D87FF] rounded uppercase">
                Match Factor Inspector
              </span>
              <span className="text-xs font-medium text-[#5A6A85]">ID: {matchId}</span>
            </div>
            <h2 className="text-lg font-bold text-[#2A3547] mt-0.5">
              {detail ? `${detail.supplierName} ➔ ${detail.buyerName}` : 'Match Factor Debugger'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F6F9FC] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading && (
            <div className="py-12 text-center text-xs font-semibold text-[#5A6A85] uppercase tracking-wider">
              Calculating Aggregated Match Vector Weights...
            </div>
          )}

          {error && (
            <div className="p-4 bg-[#FBF2EF] border border-[#FA896B]/30 text-[#FA896B] rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {detail && !isLoading && (
            <>
              {/* Score Headline Banner */}
              <div className="bg-white border border-[#E5EAEF] rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#5D87FF] text-white text-2xl font-bold flex items-center justify-center shadow-xs">
                    {Math.round(detail.overallScore)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#2A3547] uppercase tracking-wide">
                        Overall Compatibility Rating
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/20 rounded-md">
                        {detail.matchGrade}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A6A85] mt-0.5">
                      Pairing: <strong className="text-[#2A3547]">{detail.listingCode}</strong> (Listing) with <strong className="text-[#2A3547]">{detail.requirementCode}</strong> (Demand Requirement)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-right text-xs border-l border-[#E5EAEF] pl-4">
                  <div>
                    <span className="text-[#5A6A85] text-[10px] block uppercase font-medium">Purity Assay</span>
                    <span className="font-bold text-[#2A3547]">{detail.purityPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-[#5A6A85] text-[10px] block uppercase font-medium">Transit Dist</span>
                    <span className="font-bold text-[#2A3547]">{detail.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-[#5A6A85] text-[10px] block uppercase font-medium">Unit Price</span>
                    <span className="font-bold text-[#2A3547]">₹{detail.pricePerTon}/t</span>
                  </div>
                  <div>
                    <span className="text-[#5A6A85] text-[10px] block uppercase font-medium">Verification</span>
                    <span className="font-bold text-[#13DEB9]">{detail.verificationStatus}</span>
                  </div>
                </div>
              </div>

              {/* Eligibility Warnings if any */}
              {detail.eligibilityWarnings.length > 0 && (
                <div className="p-4 bg-[#FEF5E5] border border-[#FFAE1F]/30 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-[#FFAE1F] flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-[#FFAE1F]" /> Operational Warnings:
                  </span>
                  {detail.eligibilityWarnings.map((w, idx) => (
                    <p key={idx} className="text-[#2A3547] text-[11px] pl-5">• {w}</p>
                  ))}
                </div>
              )}

              {/* Factor Decomposition Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6A85] mb-3">
                  Match Score Weight Decomposition Matrix
                </h3>
                <div className="border border-[#E5EAEF] rounded-xl overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-[#5A6A85] font-semibold text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Evaluation Factor</th>
                        <th className="py-2.5 px-3 text-center">Score (0-100)</th>
                        <th className="py-2.5 px-3 text-center">Weight (%)</th>
                        <th className="py-2.5 px-3 text-center">Weighted Score</th>
                        <th className="py-2.5 px-3">Engine Assessment Explanation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EAEF]">
                      {detail.factors.map((f, idx) => (
                        <tr key={idx} className="hover:bg-[#F6F9FC] transition-colors">
                          <td className="py-3 px-3 font-semibold text-[#2A3547] flex items-center gap-2">
                            {getFactorIcon(f.factor)}
                            {f.factor}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-[#2A3547]">
                            {f.score}
                          </td>
                          <td className="py-3 px-3 text-center text-[#5A6A85]">
                            {f.weightPercent}%
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-[#5D87FF]">
                            {f.weightedScore.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-[#5A6A85] text-[11px]">
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
        <div className="px-6 py-3 border-t border-[#E5EAEF] bg-[#F6F9FC] flex items-center justify-between text-xs">
          <span className="text-[#5A6A85]">Deterministic SQL Mathematical Scoring Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#5D87FF] text-white font-semibold rounded-lg hover:bg-[#4570EA] transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
