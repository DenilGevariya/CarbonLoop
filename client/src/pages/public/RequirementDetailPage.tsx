import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRequirement } from '@/features/requirements/hooks/useRequirements';
import { RequirementSpecifications } from '@/features/requirements/components/RequirementSpecifications';
import { RequirementStatusBadge } from '@/features/requirements/components/RequirementStatusBadge';
import { RequirementTimeline } from '@/features/requirements/components/RequirementTimeline';
import { ArrowLeft, MapPin, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const RequirementDetailPage: React.FC = () => {
  const { requirementCode } = useParams<{ requirementCode: string }>();
  const navigate = useNavigate();

  const { data: requirement, isLoading, isError } = useRequirement(requirementCode);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-8 w-36 bg-stone-200" />
          <Skeleton className="h-64 w-full bg-stone-200" />
          <Skeleton className="h-96 w-full bg-stone-200" />
        </div>
      </div>
    );
  }

  if (isError || !requirement) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white p-8 border border-[#E2DDD5] text-center max-w-md space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-sans font-bold text-xl text-[#171A18]">Requirement Not Found</h2>
          <p className="text-xs text-stone-600 font-sans">
            The requested CO₂ demand specification could not be located or has been archived.
          </p>
          <Button
            onClick={() => navigate('/requirements')}
            className="bg-[#173D32] text-white text-xs font-semibold px-6 py-2 rounded-none"
          >
            Back to Demand Network
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          to="/requirements"
          className="inline-flex items-center text-xs font-mono text-stone-600 hover:text-[#173D32] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to CO₂ Demand Network
        </Link>

        {/* Hero Banner */}
        <div className="bg-[#171A18] text-white p-8 md:p-10 border border-[#171A18] relative overflow-hidden shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#FAF8F5] bg-[#173D32] px-3 py-1 border border-[#3C6E5C]">
                {requirement.requirement_code}
              </span>
              <RequirementStatusBadge status={requirement.status} />
              {requirement.priority && (
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/10 text-stone-300 border border-white/20">
                  {requirement.priority} Priority
                </span>
              )}
            </div>

            <span className="font-mono text-xs text-stone-400">
              Logged {new Date(requirement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 className="font-sans font-extrabold text-2xl md:text-4xl text-white tracking-tight leading-tight max-w-4xl">
            {requirement.title}
          </h1>

          {/* Key Stat Cards in Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15 font-mono text-xs">
            <div>
              <span className="text-stone-400 text-[10px] uppercase block">Requested Tonnes</span>
              <div className="text-2xl font-bold font-sans text-white mt-1">
                {requirement.required_quantity.toLocaleString()}{' '}
                <span className="text-xs font-mono font-normal text-stone-400">
                  {requirement.quantity_unit}s
                </span>
              </div>
            </div>

            <div>
              <span className="text-stone-400 text-[10px] uppercase block">Purity Threshold</span>
              <div className="text-2xl font-bold font-sans text-[#3C6E5C] mt-1 flex items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-[#3C6E5C]" />
                ≥{requirement.minimum_purity}%
              </div>
            </div>

            <div>
              <span className="text-stone-400 text-[10px] uppercase block">Destination City</span>
              <div className="text-lg font-bold font-sans text-white mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-stone-400" />
                {requirement.destination_facility
                  ? requirement.destination_facility.city
                  : requirement.location_city || 'Gujarat'}
              </div>
            </div>

            <div>
              <span className="text-stone-400 text-[10px] uppercase block">Target Budget Ceiling</span>
              <div className="text-xl font-bold font-sans text-white mt-1">
                {requirement.maximum_price_per_unit
                  ? `₹${requirement.maximum_price_per_unit.toLocaleString()}/${requirement.quantity_unit}`
                  : 'Open Price'}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specification Matrix */}
        <RequirementSpecifications requirement={requirement} />

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info Columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Utilization Pathway Section */}
            <div className="bg-white border border-[#E2DDD5] p-6 space-y-4 shadow-2xs">
              <span className="font-mono text-[10px] font-bold text-[#173D32] uppercase tracking-wider block">
                Utilization Pathway
              </span>
              <h3 className="font-sans font-bold text-lg text-[#171A18]">
                {requirement.utilization ? requirement.utilization.name : 'Industrial Off-Take Application'}
              </h3>
              <p className="font-sans text-xs text-stone-700 leading-relaxed">
                {requirement.description || 'No additional technical description provided.'}
              </p>

              {requirement.intended_use && (
                <div className="p-3 bg-[#FAF8F5] border border-[#E2DDD5] font-mono text-xs">
                  <span className="text-stone-500 block text-[10px] uppercase">Specific Process Note</span>
                  <span className="font-semibold text-[#171A18]">{requirement.intended_use}</span>
                </div>
              )}
            </div>

            {/* Timing Window */}
            <div className="bg-white border border-[#E2DDD5] p-6 space-y-4 shadow-2xs">
              <span className="font-mono text-[10px] font-bold text-[#173D32] uppercase tracking-wider block">
                Required Off-Take Schedule
              </span>
              <RequirementTimeline
                requiredFrom={requirement.required_from}
                requiredUntil={requirement.required_until}
                className="text-sm font-sans"
              />
            </div>

            {/* Matching CO₂ Supply Section */}
            <div className="bg-white border border-[#E2DDD5] p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
                <h3 className="font-sans font-bold text-base text-[#171A18] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#173D32]" />
                  Matching CO₂ Supply Listings
                </h3>
                <span className="font-mono text-xs text-[#173D32] bg-[#173D32]/10 px-2.5 py-0.5 rounded font-semibold">
                  Intelligent Match Engine
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-[#171A18] text-sm font-sans block">TerraCem Industrial Capture Stack</span>
                    <div className="flex flex-wrap items-center gap-3 text-stone-600 text-[11px]">
                      <span>Volume: <strong>500 tonnes</strong></span>
                      <span>•</span>
                      <span>Purity: <strong className="text-[#173D32]">99.5%</strong></span>
                      <span>•</span>
                      <span>Price: <strong>₹4,800/tonne</strong></span>
                      <span>•</span>
                      <span>State: <strong>Liquid</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to="/marketplace/CL-SUP-000101"
                      className="px-3 py-1.5 bg-white border border-[#E2DDD5] text-stone-700 hover:text-[#173D32] rounded text-xs font-semibold"
                    >
                      View Listing
                    </Link>
                    <Link
                      to="/dashboard/offers"
                      className="px-3 py-1.5 bg-[#173D32] hover:bg-[#123027] text-white rounded text-xs font-semibold"
                    >
                      Make Offer
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Matching Engine Callout */}
            <div className="bg-[#173D32]/5 border border-[#173D32]/30 p-6 flex items-start gap-4 shadow-2xs">
              <div className="p-2 bg-[#173D32] text-white shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-bold text-sm text-[#171A18]">
                  Matching Engine Evaluation
                </h4>
                <p className="font-sans text-xs text-stone-600 leading-relaxed">
                  Eligible CO₂ supply streams across the network are automatically evaluated by CarbonLoop's intelligent matching engine for purity compatibility, geographic proximity, and logistics cost alignment.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Organization Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E2DDD5] p-6 space-y-4 shadow-2xs">
              <span className="font-mono text-[10px] font-bold text-[#173D32] uppercase tracking-wider block">
                Buyer Organization
              </span>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#173D32] text-white font-mono font-bold flex items-center justify-center text-sm">
                  {requirement.organization?.name ? requirement.organization.name[0] : 'C'}
                </div>
                <div>
                  <h4 className="font-sans font-bold text-base text-[#171A18]">
                    {requirement.organization?.name || 'Verified Buyer'}
                  </h4>
                  <span className="font-mono text-[10px] text-stone-500 uppercase">
                    {requirement.organization?.organization_type || 'Industrial Utilizer'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2DDD5] space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Verification:</span>
                  <span className="font-bold text-[#173D32]">
                    {requirement.organization?.verification_status || 'VERIFIED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Location:</span>
                  <span className="font-bold text-[#171A18]">
                    {requirement.destination_facility
                      ? `${requirement.destination_facility.city}, ${requirement.destination_facility.state}`
                      : `${requirement.location_city || 'Vadodara'}, ${requirement.location_state || 'Gujarat'}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementDetailPage;
