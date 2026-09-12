import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { VerificationBadge } from '@/features/verification/components/VerificationBadge';
import { ShieldCheck, Factory, Layers, MapPin, ArrowRight, Building2 } from 'lucide-react';

export const PublicOrganizationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Mock organization details formatted as paper industrial supplier profile
  const orgName = slug ? slug.replace(/-/g, ' ').toUpperCase() : 'TERRACEM INDUSTRIES';

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] font-mono flex flex-col justify-between">
      <Navbar />

      <main className="pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 flex-1 w-full">
        {/* Supplier Header Banner */}
        <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-8 space-y-4 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#173D32]/10 text-[#173D32] text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>VERIFIED INDUSTRIAL CO₂ SUPPLIER</span>
              </div>
              <h1 className="text-3xl font-extrabold text-[#171A18] tracking-tight">{orgName}</h1>
              <p className="text-xs text-[#55524D] flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#173D32]" />
                <span>AHMEDABAD · GUJARAT · INDUSTRIAL CORRIDOR</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <VerificationBadge
                status="VERIFIED"
                entityName={orgName}
                verifiedAt="2026-09-01T00:00:00Z"
                expiresAt="2027-09-01T00:00:00Z"
                size="md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs">
            <div className="bg-[#F7F5EF] p-4 rounded border border-[#E2DDD5] space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Operational Facilities</span>
              <p className="text-xl font-bold text-[#171A18]">3 Verified Plants</p>
              <span className="text-[10px] text-[#173D32]">Ahmedabad & Vadodara Capture Sites</span>
            </div>

            <div className="bg-[#F7F5EF] p-4 rounded border border-[#E2DDD5] space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Active Marketplace Supply</span>
              <p className="text-xl font-bold text-[#173D32]">25,800 Tonnes CO₂</p>
              <span className="text-[10px] text-neutral-500">Available across 8 listings</span>
            </div>

            <div className="bg-[#F7F5EF] p-4 rounded border border-[#E2DDD5] space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Quality Standard</span>
              <p className="text-xl font-bold text-[#171A18]">99.47% Verified Purity</p>
              <span className="text-[10px] text-neutral-500">Certified Gas Assay Report</span>
            </div>
          </div>
        </div>

        {/* Verified Facilities & Public Supply */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Facilities */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-[#173D32]" />
                <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">
                  Verified Capture Facilities
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#F7F5EF] border border-[#E2DDD5] p-4 rounded space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#171A18]">Ahmedabad Cement Plant Capture Unit 1</h4>
                    <span className="text-[10px] text-neutral-500">Flue Gas Post-Combustion Chemical Absorption</span>
                  </div>
                  <VerificationBadge status="VERIFIED" size="sm" showPopoverOnClick={false} />
                </div>
                <p className="text-[10px] text-[#173D32] font-semibold">
                  Capacity: 1,500 tonnes / month | Operating License: FL-GUJ-2026-99
                </p>
              </div>

              <div className="bg-[#F7F5EF] border border-[#E2DDD5] p-4 rounded space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#171A18]">Vadodara Synthesis Plant Unit 2</h4>
                    <span className="text-[10px] text-neutral-500">High Purity Fermentation Stream</span>
                  </div>
                  <VerificationBadge status="VERIFIED" size="sm" showPopoverOnClick={false} />
                </div>
                <p className="text-[10px] text-[#173D32] font-semibold">
                  Capacity: 800 tonnes / month | Operating License: FL-GUJ-2026-104
                </p>
              </div>
            </div>
          </div>

          {/* Active Public Supply Listings */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#173D32]" />
                <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">
                  Active Public Supply Streams
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#F7F5EF] border border-[#E2DDD5] p-4 rounded space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#171A18]">Industrial Liquid CO₂ Stream (CL-LST-0001)</h4>
                    <span className="text-[10px] text-neutral-500">Liquefied Gas | ISO Tanker Delivery</span>
                  </div>
                  <button
                    onClick={() => navigate('/marketplace/CL-LST-0001')}
                    className="px-2.5 py-1 bg-[#173D32] text-white font-bold text-[10px] rounded hover:bg-[#123027] transition flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-700 pt-1 border-t border-[#E2DDD5]/60">
                  <span>Available: <strong>25,000 Tonnes</strong></span>
                  <span>Verified Assay: <strong className="text-[#173D32]">99.47%</strong></span>
                  <span>Price: <strong>$85.00 / Ton</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Non-Greenwashing Disclosure Banner */}
        <div className="bg-[#171A18] text-[#F7F5EF] rounded-lg p-6 border border-neutral-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-[#A3E635]">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="font-bold uppercase tracking-wider text-xs">CarbonLoop Verification Guarantee</h4>
          </div>
          <p className="text-neutral-300 leading-relaxed text-[11px]">
            The verified badge displayed on this industrial supplier profile confirms that technical documents, certified laboratory purity reports, and operating licenses have been inspected and approved by network verifiers. CarbonLoop does not issue government regulatory offset certificates.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicOrganizationPage;
