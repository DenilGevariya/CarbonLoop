import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMyRequirements,
  usePublishRequirement,
  usePauseRequirement,
  useResumeRequirement,
  useArchiveRequirement,
  useFulfillRequirement,
} from '@/features/requirements/hooks/useRequirements';
import { RequirementTable } from '@/features/requirements/components/RequirementTable';
import { PublishConfirmDialog } from '@/features/requirements/components/PublishConfirmDialog';
import { PauseDialog } from '@/features/requirements/components/PauseDialog';
import { ArchiveDialog } from '@/features/requirements/components/ArchiveDialog';
import { FulfillDialog } from '@/features/requirements/components/FulfillDialog';
import type { BuyerRequirement, RequirementFilterParams } from '@/features/requirements/types/requirement';
import { Button } from '@/components/ui/button';
import { Plus, Factory, Layers, CheckCircle2, Clock } from 'lucide-react';

export const RequirementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<RequirementFilterParams>({
    page: 1,
    limit: 12,
    sort: 'newest',
    status: 'all',
  });

  const { data, isLoading } = useMyRequirements(filters);

  // Dialog states
  const [publishTarget, setPublishTarget] = useState<BuyerRequirement | null>(null);
  const [pauseTarget, setPauseTarget] = useState<BuyerRequirement | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<BuyerRequirement | null>(null);
  const [fulfillTarget, setFulfillTarget] = useState<BuyerRequirement | null>(null);

  // Mutations
  const publishMutation = usePublishRequirement();
  const pauseMutation = usePauseRequirement();
  const resumeMutation = useResumeRequirement();
  const archiveMutation = useArchiveRequirement();
  const fulfillMutation = useFulfillRequirement();

  const items = data?.items || [];
  const totalCount = data?.pagination?.total || 0;

  // Calculate metrics
  const activeCount = items.filter((r) => r.status === 'PUBLISHED' || r.status === 'ACTIVE').length;
  const draftCount = items.filter((r) => r.status === 'DRAFT').length;
  const totalVolume = items.reduce((sum, r) => sum + (r.required_quantity || 0), 0);
  const fulfilledCount = items.filter((r) => r.status === 'FULFILLED').length;

  const handlePublishConfirm = async () => {
    if (!publishTarget) return;
    await publishMutation.mutateAsync(publishTarget.id);
    setPublishTarget(null);
  };

  const handlePauseConfirm = async (reason?: string) => {
    if (!pauseTarget) return;
    await pauseMutation.mutateAsync({ id: pauseTarget.id, reason });
    setPauseTarget(null);
  };

  const handleResume = async (req: BuyerRequirement) => {
    await resumeMutation.mutateAsync(req.id);
  };

  const handleArchiveConfirm = async (reason?: string) => {
    if (!archiveTarget) return;
    await archiveMutation.mutateAsync({ id: archiveTarget.id, reason });
    setArchiveTarget(null);
  };

  const handleFulfillConfirm = async (reason?: string) => {
    if (!fulfillTarget) return;
    await fulfillMutation.mutateAsync({ id: fulfillTarget.id, reason });
    setFulfillTarget(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-6">
        <div>
          <span className="font-mono text-[10px] font-bold text-[#173D32] uppercase tracking-wider bg-[#173D32]/10 border border-[#173D32]/20 px-2 py-0.5 inline-block mb-1">
            Utilizer Demand Hub
          </span>
          <h1 className="font-sans font-bold text-2xl md:text-3xl text-[#171A18]">
            YOUR CO₂ DEMAND
          </h1>
          <p className="font-sans text-xs text-stone-600 mt-1 max-w-xl">
            Define the carbon your manufacturing facilities need. Published requirements become discoverable across the network for supply matching.
          </p>
        </div>

        <Button
          onClick={() => navigate('/dashboard/requirements/new')}
          className="bg-[#173D32] hover:bg-[#133027] text-white font-sans font-medium text-xs tracking-wide px-5 py-2.5 rounded-none flex items-center gap-2 self-start md:self-auto cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Requirement</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-white border border-[#E2DDD5] p-4 flex flex-col justify-between shadow-2xs">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
            Published Demand
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <Factory className="w-4 h-4 text-[#173D32]" />
            <span className="text-2xl font-bold font-sans text-[#171A18]">{activeCount}</span>
            <span className="text-[10px] text-stone-500">active</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2DDD5] p-4 flex flex-col justify-between shadow-2xs">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Drafts</span>
          <div className="flex items-baseline gap-2 mt-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-2xl font-bold font-sans text-amber-700">{draftCount}</span>
            <span className="text-[10px] text-stone-500">pending</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2DDD5] p-4 flex flex-col justify-between shadow-2xs">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
            Total Requested Volume
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <Layers className="w-4 h-4 text-[#173D32]" />
            <span className="text-2xl font-bold font-sans text-[#173D32]">
              {totalVolume.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-500">tonnes</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2DDD5] p-4 flex flex-col justify-between shadow-2xs">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
            Fulfilled Off-Takes
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="text-2xl font-bold font-sans text-blue-800">{fulfilledCount}</span>
            <span className="text-[10px] text-stone-500">completed</span>
          </div>
        </div>
      </div>

      {/* Main Requirements Data Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-stone-600">
          <span>
            Showing <strong className="text-[#171A18]">{totalCount}</strong> total requirements
          </span>

          <div className="flex items-center gap-2">
            {['all', 'published', 'draft', 'paused', 'fulfilled'].map((st) => (
              <button
                key={st}
                onClick={() => setFilters((prev) => ({ ...prev, status: st, page: 1 }))}
                className={`px-3 py-1 text-[10px] uppercase font-bold border cursor-pointer ${
                  filters.status === st
                    ? 'bg-[#173D32] text-white border-[#173D32]'
                    : 'bg-white text-stone-600 border-[#E2DDD5] hover:bg-[#FAF8F5]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <RequirementTable
          requirements={items}
          isLoading={isLoading}
          isOwnerView={true}
          onPublish={(req) => setPublishTarget(req)}
          onPause={(req) => setPauseTarget(req)}
          onResume={handleResume}
          onArchive={(req) => setArchiveTarget(req)}
          onFulfill={(req) => setFulfillTarget(req)}
        />
      </div>

      {/* Lifecycle Action Dialogs */}
      <PublishConfirmDialog
        requirement={publishTarget}
        open={!!publishTarget}
        onOpenChange={(open) => !open && setPublishTarget(null)}
        onConfirm={handlePublishConfirm}
        isPublishing={publishMutation.isPending}
      />

      <PauseDialog
        requirement={pauseTarget}
        open={!!pauseTarget}
        onOpenChange={(open) => !open && setPauseTarget(null)}
        onConfirm={handlePauseConfirm}
        isPausing={pauseMutation.isPending}
      />

      <ArchiveDialog
        requirement={archiveTarget}
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        onConfirm={handleArchiveConfirm}
        isArchiving={archiveMutation.isPending}
      />

      <FulfillDialog
        requirement={fulfillTarget}
        open={!!fulfillTarget}
        onOpenChange={(open) => !open && setFulfillTarget(null)}
        onConfirm={handleFulfillConfirm}
        isFulfilling={fulfillMutation.isPending}
      />
    </div>
  );
};

export default RequirementsPage;
