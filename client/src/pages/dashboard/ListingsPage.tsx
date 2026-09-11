import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMySupplyListings, useListingStatusAction } from '@/features/listings/hooks/useListings';
import { ListingStatusBadge } from '@/features/listings/components/ListingStatusBadge';
import { PublishDialog } from '@/features/listings/components/PublishDialog';
import { PauseDialog } from '@/features/listings/components/PauseDialog';
import { ArchiveDialog } from '@/features/listings/components/ArchiveDialog';
import type { ListingDTO, ListingFilterParams } from '@/features/listings/types/listing';
import { Factory, Plus, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Skeleton } from '@/components/ui/skeleton';

export const ListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ListingFilterParams>({
    status: 'ALL',
    search: '',
    page: 1,
    limit: 12,
  });

  const { data: supplyData, isLoading } = useMySupplyListings(filters);
  const statusMutation = useListingStatusAction();

  const [selectedListing, setSelectedListing] = useState<ListingDTO | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const items = supplyData?.data || [];
  const stats = supplyData?.stats || { activeListings: 0, draftListings: 0, pausedListings: 0, totalListedTonnes: 0, totalRemainingTonnes: 0 };

  const handlePublishConfirm = async () => {
    if (!selectedListing) return;
    await statusMutation.mutateAsync({ id: selectedListing.id, action: 'publish' });
    setPublishOpen(false);
    setSelectedListing(null);
  };

  const handlePauseConfirm = async (reason?: string) => {
    if (!selectedListing) return;
    await statusMutation.mutateAsync({ id: selectedListing.id, action: 'pause', reason });
    setPauseOpen(false);
    setSelectedListing(null);
  };

  const handleArchiveConfirm = async (reason?: string) => {
    if (!selectedListing) return;
    await statusMutation.mutateAsync({ id: selectedListing.id, action: 'archive', reason });
    setArchiveOpen(false);
    setSelectedListing(null);
  };

  const handleResume = async (listing: ListingDTO) => {
    await statusMutation.mutateAsync({ id: listing.id, action: 'resume' });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173D32]/10 border border-[#173D32]/20 text-[#173D32] text-xs font-mono uppercase tracking-wider font-semibold mb-2">
            <Factory className="w-3.5 h-3.5" /> Emitter Supply Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#171A18] font-medium tracking-tight">
            YOUR CO₂ SUPPLY
          </h1>
          <p className="text-xs text-stone-600 font-sans mt-1">
            Manage the captured carbon streams your facilities make available to the network.
          </p>
        </div>

        <Button
          onClick={() => navigate('/dashboard/listings/new')}
          className="bg-[#173D32] hover:bg-[#123027] text-white font-mono text-xs font-bold gap-2 px-5 h-10 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Declare CO₂ Supply
        </Button>
      </div>

      {/* Aggregate Supply Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#E2DDD5]">
        <div className="p-3 bg-white rounded-lg border border-[#E2DDD5]">
          <p className="text-[10px] font-mono uppercase text-stone-500">Active Published</p>
          <p className="text-xl font-mono font-bold text-[#173D32] tabular-nums mt-0.5">
            {isLoading ? '...' : stats.activeListings}
            <span className="text-xs font-normal text-stone-500 ml-1">streams</span>
          </p>
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#E2DDD5]">
          <p className="text-[10px] font-mono uppercase text-stone-500">Draft Declarations</p>
          <p className="text-xl font-mono font-bold text-amber-900 tabular-nums mt-0.5">
            {isLoading ? '...' : stats.draftListings}
            <span className="text-xs font-normal text-stone-500 ml-1">drafts</span>
          </p>
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#E2DDD5]">
          <p className="text-[10px] font-mono uppercase text-stone-500">Total Volume Listed</p>
          <p className="text-xl font-mono font-bold text-[#171A18] tabular-nums mt-0.5">
            {isLoading ? '...' : stats.totalListedTonnes.toLocaleString()}
            <span className="text-xs font-normal text-stone-500 ml-1">tonnes</span>
          </p>
        </div>

        <div className="p-3 bg-white rounded-lg border border-[#E2DDD5]">
          <p className="text-[10px] font-mono uppercase text-stone-500">Remaining Volume</p>
          <p className="text-xl font-mono font-bold text-[#171A18] tabular-nums mt-0.5">
            {isLoading ? '...' : stats.totalRemainingTonnes.toLocaleString()}
            <span className="text-xs font-normal text-stone-500 ml-1">tonnes</span>
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#E2DDD5] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Filter title or code..."
            value={filters.search || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="pl-9 bg-[#FAF8F5] border-[#E2DDD5] text-xs font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-stone-500 uppercase text-[11px] shrink-0">Filter Status:</span>
          <NativeSelect
            value={filters.status || 'ALL'}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className="w-48 bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Drafts Only</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="PAUSED">Paused Only</option>
            <option value="EXHAUSTED">Exhausted Only</option>
            <option value="EXPIRED">Expired Only</option>
            <option value="ARCHIVED">Archived Only</option>
          </NativeSelect>
        </div>
      </div>

      {/* Supply Management Table */}
      <div className="bg-white rounded-xl border border-[#E2DDD5] overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-[#FAF8F5] border-b border-[#E2DDD5]">
            <TableRow className="border-[#E2DDD5]">
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5 pl-6">Code</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5">Listing Title</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5">Facility</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5 text-right">Available</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5 text-right">Remaining</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5 text-right">Purity</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5 text-right">Price</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5">Status</TableHead>
              <TableHead className="font-mono text-[11px] text-stone-500 uppercase py-3.5 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#E2DDD5]/60 font-mono text-xs">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-7 w-28 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-stone-500 font-sans">
                  No supply stream listings found matching your current filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item: ListingDTO) => (
                <TableRow key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <TableCell className="pl-6 font-bold text-stone-700">{item.listingCode}</TableCell>
                  <TableCell className="font-sans font-medium text-[#171A18]">
                    <Link to={`/marketplace/${item.listingCode}`} className="hover:text-[#173D32] hover:underline">
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-stone-600">{item.facility.name}</TableCell>
                  <TableCell className="text-right tabular-nums text-stone-800 font-semibold">
                    {item.quantity.available.toLocaleString()} {item.quantity.unit}s
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-stone-800">
                    {item.quantity.remaining.toLocaleString()} {item.quantity.unit}s
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#173D32]">
                    {item.purityPercentage.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-[#171A18]">
                    ₹{item.price.amount.toLocaleString()} / t
                  </TableCell>
                  <TableCell>
                    <ListingStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/marketplace/${item.listingCode}`)}
                        className="h-7 px-2 text-[11px] text-stone-600"
                      >
                        Inspect
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/listings/${item.id}/edit`)}
                        className="h-7 px-2 text-[11px] border-[#E2DDD5]"
                      >
                        Edit
                      </Button>

                      {item.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedListing(item);
                            setPublishOpen(true);
                          }}
                          className="h-7 px-2 text-[11px] bg-[#173D32] hover:bg-[#123027] text-white font-bold"
                        >
                          Publish
                        </Button>
                      )}

                      {item.status === 'PUBLISHED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedListing(item);
                            setPauseOpen(true);
                          }}
                          className="h-7 px-2 text-[11px] border-purple-300 text-purple-900"
                        >
                          Pause
                        </Button>
                      )}

                      {item.status === 'PAUSED' && (
                        <Button
                          size="sm"
                          onClick={() => handleResume(item)}
                          className="h-7 px-2 text-[11px] bg-[#173D32] text-white"
                        >
                          Resume
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialogs */}
      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        listing={selectedListing}
        onConfirm={handlePublishConfirm}
        isSubmitting={statusMutation.isPending}
      />

      <PauseDialog
        open={pauseOpen}
        onOpenChange={setPauseOpen}
        listing={selectedListing}
        onConfirm={handlePauseConfirm}
        isSubmitting={statusMutation.isPending}
      />

      <ArchiveDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        listing={selectedListing}
        onConfirm={handleArchiveConfirm}
        isSubmitting={statusMutation.isPending}
      />
    </div>
  );
};

export default ListingsPage;
