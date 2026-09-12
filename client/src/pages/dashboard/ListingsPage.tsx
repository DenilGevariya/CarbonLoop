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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAEF] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] text-xs font-semibold uppercase tracking-wider mb-2">
            <Factory className="w-3.5 h-3.5" /> Emitter Supply Console
          </div>
          <h1 className="text-2xl sm:text-3xl text-[#2A3547] font-bold tracking-tight">
            YOUR CO₂ SUPPLY
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Manage the captured carbon streams your facilities make available to the network.
          </p>
        </div>

        <Button
          onClick={() => navigate('/dashboard/listings/new')}
          className="bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold gap-2 px-5 h-10 rounded-lg shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Declare CO₂ Supply
        </Button>
      </div>

      {/* Aggregate Supply Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E5EAEF] shadow-xs">
          <p className="text-xs font-semibold uppercase text-[#5A6A85]">Active Published</p>
          <p className="text-2xl font-bold text-[#5D87FF] tabular-nums mt-1">
            {isLoading ? '...' : stats.activeListings}
            <span className="text-xs font-medium text-[#5A6A85] ml-1">streams</span>
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAEF] shadow-xs">
          <p className="text-xs font-semibold uppercase text-[#5A6A85]">Draft Declarations</p>
          <p className="text-2xl font-bold text-[#FFAE1F] tabular-nums mt-1">
            {isLoading ? '...' : stats.draftListings}
            <span className="text-xs font-medium text-[#5A6A85] ml-1">drafts</span>
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAEF] shadow-xs">
          <p className="text-xs font-semibold uppercase text-[#5A6A85]">Total Volume Listed</p>
          <p className="text-2xl font-bold text-[#2A3547] tabular-nums mt-1">
            {isLoading ? '...' : stats.totalListedTonnes.toLocaleString()}
            <span className="text-xs font-medium text-[#5A6A85] ml-1">tonnes</span>
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E5EAEF] shadow-xs">
          <p className="text-xs font-semibold uppercase text-[#5A6A85]">Remaining Volume</p>
          <p className="text-2xl font-bold text-[#13DEB9] tabular-nums mt-1">
            {isLoading ? '...' : stats.totalRemainingTonnes.toLocaleString()}
            <span className="text-xs font-medium text-[#5A6A85] ml-1">tonnes</span>
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#E5EAEF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A85]" />
          <Input
            placeholder="Filter title or code..."
            value={filters.search || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="pl-9 bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] rounded-lg"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[#5A6A85] uppercase text-[11px] font-semibold shrink-0">Filter Status:</span>
          <NativeSelect
            value={filters.status || 'ALL'}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className="w-48 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg"
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
      <div className="bg-white rounded-xl border border-[#E5EAEF] overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#F6F9FC] border-b border-[#E5EAEF]">
            <TableRow className="border-[#E5EAEF]">
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 pl-6">Code</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5">Listing Title</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5">Facility</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 text-right">Available</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 text-right">Remaining</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 text-right">Purity</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 text-right">Price</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5">Status</TableHead>
              <TableHead className="text-xs font-semibold text-[#5A6A85] uppercase py-3.5 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#E5EAEF] text-xs">
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
                <TableCell colSpan={9} className="py-12 text-center text-[#5A6A85]">
                  No supply stream listings found matching your current filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item: ListingDTO) => (
                <TableRow key={item.id} className="hover:bg-[#F6F9FC] border-[#E5EAEF] transition-colors">
                  <TableCell className="pl-6 font-bold text-[#5A6A85]">{item.listingCode}</TableCell>
                  <TableCell className="font-bold text-[#2A3547]">
                    <Link to={`/marketplace/${item.listingCode}`} className="hover:text-[#5D87FF]">
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[#5A6A85]">{item.facility.name}</TableCell>
                  <TableCell className="text-right tabular-nums text-[#2A3547] font-bold">
                    {item.quantity.available.toLocaleString()} {item.quantity.unit}s
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#5A6A85]">
                    {item.quantity.remaining.toLocaleString()} {item.quantity.unit}s
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#13DEB9]">
                    {item.purityPercentage.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-bold text-[#2A3547]">
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
                        className="h-7 px-2 text-[11px] text-[#5A6A85] hover:text-[#5D87FF] hover:bg-[#ECF2FF] rounded-lg"
                      >
                        Inspect
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/listings/${item.id}/edit`)}
                        className="h-7 px-2 text-[11px] border-[#E5EAEF] text-[#2A3547] hover:bg-[#F6F9FC] rounded-lg"
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
                          className="h-7 px-2 text-[11px] bg-[#5D87FF] hover:bg-[#4570EA] text-white font-bold rounded-lg"
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
                          className="h-7 px-2 text-[11px] border-[#FFAE1F]/30 text-[#FFAE1F] hover:bg-[#FEF5E5] rounded-lg"
                        >
                          Pause
                        </Button>
                      )}

                      {item.status === 'PAUSED' && (
                        <Button
                          size="sm"
                          onClick={() => handleResume(item)}
                          className="h-7 px-2 text-[11px] bg-[#13DEB9] hover:bg-[#0FB799] text-white rounded-lg"
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
