import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useListingDetail } from '@/features/listings/hooks/useListings';
import { ListingForm } from '@/features/listings/components/ListingForm/ListingForm';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: listing, isLoading, isError } = useListingDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-[#E2DDD5]">
        <p className="font-serif text-lg text-stone-800">Unable to load listing declaration for editing.</p>
        <Link to="/dashboard/listings" className="text-xs font-mono text-[#173D32] underline mt-2 block">
          Return to supply management
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-4">
        <div>
          <Link
            to="/dashboard/listings"
            className="inline-flex items-center text-xs font-mono text-stone-500 hover:text-[#173D32] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to CO₂ Supply Management
          </Link>
          <h1 className="text-2xl font-serif text-[#171A18] font-medium">
            Edit CO₂ Supply Declaration ({listing.listingCode})
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Update composition, volume, or commercial pricing parameters for this supply stream.
          </p>
        </div>
      </div>

      <ListingForm initialListing={listing} mode="edit" />
    </div>
  );
};

export default EditListingPage;
