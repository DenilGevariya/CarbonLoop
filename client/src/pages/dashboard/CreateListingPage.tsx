import React from 'react';
import { Link } from 'react-router-dom';
import { ListingForm } from '@/features/listings/components/ListingForm/ListingForm';
import { ArrowLeft } from 'lucide-react';

export const CreateListingPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-4">
        <div>
          <Link
            to="/dashboard/listings"
            className="inline-flex items-center text-xs font-semibold text-[#5A6A85] hover:text-[#5D87FF] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to CO₂ Supply Management
          </Link>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight">
            Declare Industrial CO₂ Supply Stream
          </h1>
          <p className="text-xs text-[#5A6A85] font-medium mt-0.5">
            Complete the industrial declaration form to list captured carbon for commercial utilization.
          </p>
        </div>
      </div>

      <ListingForm mode="create" />
    </div>
  );
};

export default CreateListingPage;
