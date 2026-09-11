import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useListingDetail, useListingStatusAction } from '@/features/listings/hooks/useListings';
import { ListingSpecificationGrid } from '@/features/listings/components/ListingSpecificationGrid';
import { ListingStatusTimeline } from '@/features/listings/components/ListingStatusTimeline';
import { PublishDialog } from '@/features/listings/components/PublishDialog';
import { PauseDialog } from '@/features/listings/components/PauseDialog';
import { ArchiveDialog } from '@/features/listings/components/ArchiveDialog';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Edit3, Send, PauseCircle, PlayCircle, Archive, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const ListingDetailPage: React.FC = () => {
  const { listingCode } = useParams<{ listingCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: listing, isLoading, isError, error } = useListingDetail(listingCode);
  const statusMutation = useListingStatusAction();

  const [publishOpen, setPublishOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Check if logged-in user belongs to owner organization
  const isOwner = user && listing && user.organizations?.some((o) => o.organizationId === listing.organization.id);

  const handlePublishConfirm = async () => {
    if (!listing) return;
    await statusMutation.mutateAsync({ id: listing.id, action: 'publish' });
    setPublishOpen(false);
  };

  const handlePauseConfirm = async (reason?: string) => {
    if (!listing) return;
    await statusMutation.mutateAsync({ id: listing.id, action: 'pause', reason });
    setPauseOpen(false);
  };

  const handleArchiveConfirm = async (reason?: string) => {
    if (!listing) return;
    await statusMutation.mutateAsync({ id: listing.id, action: 'archive', reason });
    setArchiveOpen(false);
  };

  const handleResume = async () => {
    if (!listing) return;
    await statusMutation.mutateAsync({ id: listing.id, action: 'resume' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-8 w-36 rounded" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl border border-[#E2DDD5] text-center max-w-md space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto border border-red-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl text-[#171A18]">Listing Specification Not Found</h2>
          <p className="text-xs text-stone-600 font-sans">
            {(error as any)?.message || 'The specified carbon supply stream does not exist or access is restricted.'}
          </p>
          <Button onClick={() => navigate('/marketplace')} className="bg-[#173D32] hover:bg-[#123027] text-white font-mono text-xs">
            Return to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      {/* Top Breadcrumb & Action Control Bar */}
      <div className="bg-white border-b border-[#E2DDD5] py-4 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/marketplace"
            className="inline-flex items-center text-xs font-mono text-stone-500 hover:text-[#173D32] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to CO₂ Marketplace
          </Link>

          {/* Owner Operational Controls (Emitter Management Bar) */}
          {isOwner && (
            <div className="flex items-center gap-2 font-mono text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dashboard/listings/${listing.id}/edit`)}
                className="border-[#E2DDD5] text-xs h-8 gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Declaration
              </Button>

              {listing.status === 'DRAFT' && (
                <Button
                  size="sm"
                  onClick={() => setPublishOpen(true)}
                  className="bg-[#173D32] hover:bg-[#123027] text-white text-xs h-8 gap-1.5 font-bold"
                >
                  <Send className="w-3.5 h-3.5" /> Publish Supply
                </Button>
              )}

              {listing.status === 'PUBLISHED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPauseOpen(true)}
                  className="border-purple-300 text-purple-900 hover:bg-purple-50 text-xs h-8 gap-1.5"
                >
                  <PauseCircle className="w-3.5 h-3.5" /> Pause Supply
                </Button>
              )}

              {listing.status === 'PAUSED' && (
                <Button
                  size="sm"
                  onClick={handleResume}
                  className="bg-[#173D32] hover:bg-[#123027] text-white text-xs h-8 gap-1.5 font-bold"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Resume Publication
                </Button>
              )}

              {listing.status !== 'ARCHIVED' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setArchiveOpen(true)}
                  className="text-stone-500 hover:text-stone-900 text-xs h-8 gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" /> Archive
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Specification Sheet Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <ListingSpecificationGrid listing={listing} />
        
        {/* Status History Timeline Audit Trail */}
        {listing.statusHistory && listing.statusHistory.length > 0 && (
          <ListingStatusTimeline history={listing.statusHistory} />
        )}
      </div>

      {/* Confirmation Modals */}
      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        listing={listing}
        onConfirm={handlePublishConfirm}
        isSubmitting={statusMutation.isPending}
      />

      <PauseDialog
        open={pauseOpen}
        onOpenChange={setPauseOpen}
        listing={listing}
        onConfirm={handlePauseConfirm}
        isSubmitting={statusMutation.isPending}
      />

      <ArchiveDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        listing={listing}
        onConfirm={handleArchiveConfirm}
        isSubmitting={statusMutation.isPending}
      />
    </div>
  );
};

export default ListingDetailPage;
