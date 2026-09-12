import React, { useState, useEffect } from 'react';
import { matchingApi } from '@/features/matching/api/matching.api';
import type { MatchRecord } from '@/features/matching/types/matching.types';
import { MatchCard } from '@/features/matching/components/MatchCard';
import { MatchFilters } from '@/features/matching/components/MatchFilters';
import { MatchScore } from '@/features/matching/components/MatchScore';
import { MatchComparison } from '@/features/matching/components/MatchComparison';
import { MatchBreakdown } from '@/features/matching/components/MatchBreakdown';
import { DeliveryCostBreakdown } from '@/features/matching/components/DeliveryCostBreakdown';
import { MatchReasons, MatchWarnings } from '@/features/matching/components/MatchReasons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Cpu, RefreshCw, Handshake, AlertCircle, ArrowLeft } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/animations';

const SEEDED_REQUIREMENTS = [
  { id: '70000000-0000-4000-a000-000000000001', code: 'REQ-01', title: 'GreenForge Concrete Mineralization Curing (Vadodara)' },
  { id: '70000000-0000-4000-a000-000000000002', code: 'REQ-02', title: 'CarbonArc E-Methanol Catalytic Synthesis (Dahej)' },
  { id: '70000000-0000-4000-a000-000000000003', code: 'REQ-03', title: 'AlgaeNova Raceways Photo-Biorefinery (Surat)' },
  { id: '70000000-0000-4000-a000-000000000010', code: 'REQ-10', title: 'Heavy Concrete Infrastructure Precast Block (Vadodara)' },
];

export const MatchesPage: React.FC = () => {
  const [selectedReqId, setSelectedReqId] = useState(SEEDED_REQUIREMENTS[0].id);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score_desc');
  const [inspectMatch, setInspectMatch] = useState<MatchRecord | null>(null);

  const fetchMatches = async (reqId: string) => {
    setLoading(true);
    try {
      const res = await matchingApi.getRequirementMatches(reqId, 0);
      setMatches(res || []);
    } catch (err) {
      console.error('Failed to fetch requirement matches:', err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(selectedReqId);
  }, [selectedReqId]);

  const handleGenerateMatches = async () => {
    setGenerating(true);
    try {
      const res = await matchingApi.generateMatches({ requirementId: selectedReqId });
      setMatches(res.generatedMatches || []);
    } catch (err) {
      console.error('Failed to generate matches:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Pure numerical filtering & sorting on immutable copy
  const filteredMatches = matches.filter((m) => {
    const score = Number(m.overall_score) || 0;
    if (activeFilter === 'excellent') return score >= 90;
    if (activeFilter === 'strong') return score >= 80 && score < 90;
    if (activeFilter === 'near') return m.status === 'INELIGIBLE' || score < 70;
    return true; // 'all' filter returns 100% of matches
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    const costA = Number(a.estimated_delivered_cost) || 0;
    const costB = Number(b.estimated_delivered_cost) || 0;
    const distA = Number(a.estimated_distance_km) || 0;
    const distB = Number(b.estimated_distance_km) || 0;
    const scoreA = Number(a.overall_score) || 0;
    const scoreB = Number(b.overall_score) || 0;

    if (sortBy === 'price_asc') return costA - costB;
    if (sortBy === 'distance_asc') return distA - distB;
    return scoreB - scoreA;
  });

  const selectedReqObj = SEEDED_REQUIREMENTS.find((r) => r.id === selectedReqId);

  return (
    <div className="space-y-8 bg-[#FAF8F5] min-h-screen text-[#171A18]">
      {/* Top Header Banner */}
      <FadeUp className="bg-white border border-[#E2DDD5] p-6 sm:p-8 rounded-2xl shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173D32]/10 border border-[#173D32]/20 text-[#173D32] text-xs font-mono uppercase tracking-wider font-semibold mb-2">
            <Cpu className="size-3.5" />
            <span>CarbonLoop Match Engine v1.0</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#171A18] font-bold tracking-tight">
            Algorithmic Off-Take Matchmaking
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-sans mt-1 max-w-2xl leading-relaxed">
            Evaluating multi-vector compatibility across stream purity, distance, volume capacity, and delivered cost.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Select value={selectedReqId} onValueChange={(val) => val && setSelectedReqId(val)}>
            <SelectTrigger className="w-full sm:w-80 bg-[#F7F5EF] border-[#E2DDD5] text-[#171A18] text-xs font-mono rounded-lg shadow-2xs">
              <SelectValue placeholder="Select Requirement" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E2DDD5] text-[#171A18] text-xs font-mono">
              {SEEDED_REQUIREMENTS.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            disabled={generating}
            onClick={handleGenerateMatches}
            className="w-full sm:w-auto bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className={`size-3.5 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Calculating Matrix...' : 'Run Engine Matching'}
          </Button>
        </div>
      </FadeUp>

      {/* Filter Tabs & Sort Controls */}
      <MatchFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Content Area */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-12 text-center text-stone-500">
          <RefreshCw className="size-8 text-[#173D32] animate-spin mb-3" />
          <p className="text-xs font-mono">Evaluating candidate supply streams against requirement constraints...</p>
        </div>
      ) : sortedMatches.length === 0 ? (
        <FadeUp className="bg-white p-12 rounded-2xl border border-[#E2DDD5] shadow-2xs text-center flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-800 border border-amber-500/20">
            <AlertCircle className="size-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-xl font-serif font-bold text-[#171A18]">No Supply Streams Found For Active Filter</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              No supply listings match filter category <span className="font-mono font-bold uppercase text-[#173D32]">"{activeFilter}"</span> for {selectedReqObj?.title}.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setActiveFilter('all')}
            className="border-[#E2DDD5] text-[#171A18] text-xs font-mono hover:bg-[#F7F5EF] cursor-pointer"
          >
            View All Matches & Candidates
          </Button>
        </FadeUp>
      ) : (
        <StaggerContainer key={`${activeFilter}-${sortBy}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMatches.map((m) => (
            <StaggerItem key={m.id}>
              <MatchCard match={m} onSelect={setInspectMatch} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Inspection Side-by-Side Match Detail Modal */}
      <Dialog open={!!inspectMatch} onOpenChange={(open) => !open && setInspectMatch(null)}>
        <DialogContent className="bg-[#FAF8F5] border-[#E2DDD5] text-[#171A18] sm:max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 rounded-2xl shadow-2xl">
          {inspectMatch && (
            <>
              <DialogHeader className="space-y-3 border-b border-[#E2DDD5] pb-5 pr-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge variant="outline" className="border-[#173D32]/20 text-[#173D32] bg-[#173D32]/10 text-xs font-mono">
                    Match Report #{inspectMatch.id.substring(0, 8)}
                  </Badge>
                  <MatchScore score={inspectMatch.overall_score} grade={inspectMatch.grade} size="md" />
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-[#171A18] leading-tight">
                  {inspectMatch.listing?.organization_name} → {inspectMatch.requirement?.organization_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-stone-600 font-sans leading-relaxed">
                  {inspectMatch.matching_reason}
                </DialogDescription>
              </DialogHeader>

              {/* Side-by-Side Comparison */}
              <MatchComparison match={inspectMatch} />

              {/* Delivered Cost Breakdown */}
              <DeliveryCostBreakdown match={inspectMatch} />

              {/* Factor Score Breakdown */}
              <MatchBreakdown match={inspectMatch} />

              {/* Reasons & Warnings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MatchReasons
                  reasons={
                    inspectMatch.explanations
                      ? inspectMatch.explanations.filter((e) => e.score >= 85).map((e) => e.explanation)
                      : ['High specification alignment']
                  }
                />
                <MatchWarnings warnings={inspectMatch.warnings || []} />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E2DDD5] flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setInspectMatch(null)}
                  className="border-[#E2DDD5] text-[#171A18] hover:bg-[#F7F5EF] text-xs font-mono cursor-pointer"
                >
                  <ArrowLeft className="size-3.5 mr-1.5" /> Back to Matches
                </Button>
                <Button className="w-full sm:w-auto bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-2xs cursor-pointer">
                  <Handshake className="size-4 mr-2" /> Initiate Commercial Off-Take Offer
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MatchesPage;
