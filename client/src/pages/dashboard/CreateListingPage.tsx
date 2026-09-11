import React from 'react';
import { Link } from 'react-router-dom';
import { ListingForm } from '@/features/listings/components/ListingForm/ListingForm';
import { ArrowLeft } from 'lucide-react';

export const CreateListingPage: React.FC = () => {
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
            Declare Industrial CO₂ Supply Stream
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Complete the industrial declaration form to list captured carbon for commercial utilization.
          </p>
        </div>
      </div>

      <ListingForm mode="create" />
    </div>
  );
};

export default CreateListingPage;
