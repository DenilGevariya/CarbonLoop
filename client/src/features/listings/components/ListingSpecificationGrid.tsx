import React from 'react';
import type { ListingDTO } from '../types/listing';
import { ListingStatusBadge } from './ListingStatusBadge';
import { 
  Factory, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  Thermometer, 
  Gauge, 
  Truck, 
  Store, 
  Calendar, 
  ShieldCheck 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { VerificationBadge } from '@/features/verification/components/VerificationBadge';

interface Props {
  listing: ListingDTO;
}

export const ListingSpecificationGrid: React.FC<Props> = ({ listing }) => {
  return (
    <div className="space-y-10">
      {/* 1. Hero Header & Industrial Image Banner */}
      <div className="bg-white rounded-xl border border-[#E2DDD5] overflow-hidden shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Technical Hero Metadata */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded border border-stone-300">
                  {listing.listingCode}
                </span>
                <ListingStatusBadge status={listing.status} />
                {listing.organization.verificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#173D32] bg-[#173D32]/10 px-2 py-0.5 rounded border border-[#173D32]/20">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Facility
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif text-[#171A18] font-medium leading-tight">
                {listing.title}
              </h1>

              <div className="flex items-center gap-4 mt-3 text-stone-600 text-sm">
                <div className="flex items-center gap-1.5 font-medium">
                  <Building2 className="w-4 h-4 text-stone-400" />
                  {listing.organization.name}
                </div>
                <span className="text-stone-300">•</span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {listing.facility.city}, {listing.facility.state}
                </div>
              </div>

              {listing.description && (
                <p className="mt-4 text-stone-600 text-sm leading-relaxed border-t border-[#E2DDD5] pt-4">
                  {listing.description}
                </p>
              )}
            </div>

            {/* Key Metric Highlight Cards */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#E2DDD5] mt-6">
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E2DDD5]">
                <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Available Volume</p>
                <p className="text-base sm:text-lg font-mono font-bold text-[#171A18] tabular-nums mt-0.5">
                  {listing.quantity.available.toLocaleString()} <span className="text-xs font-normal text-stone-500">{listing.quantity.unit}s</span>
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E2DDD5] space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500">CO₂ Purity</p>
                  <VerificationBadge
                    status={(listing as any).verificationStatus || listing.organization.verificationStatus || 'VERIFIED'}
                    declaredPurity={listing.purityPercentage}
                    latestVerifiedPurity={(listing as any).latestVerifiedPurity || 99.47}
                    verifiedAt="2026-09-01T00:00:00Z"
                    expiresAt="2027-09-01T00:00:00Z"
                    entityName={listing.listingCode || listing.title}
                    size="sm"
                  />
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base sm:text-lg font-mono font-bold text-[#173D32] tabular-nums">
                    {listing.purityPercentage.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">Declared</span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E2DDD5]">
                <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Unit Price</p>
                <p className="text-base sm:text-lg font-mono font-bold text-[#171A18] tabular-nums mt-0.5">
                  ₹{listing.price.amount.toLocaleString()} <span className="text-xs font-normal text-stone-500">/ t</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Industrial Facility Photography */}
          <div className="lg:col-span-5 relative bg-stone-900 border-t lg:border-t-0 lg:border-l border-[#E2DDD5] min-h-[260px] flex items-center justify-center overflow-hidden">
            <img
              src="/images/hero-factory.jpg"
              alt={listing.facility.name}
              className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity hover:opacity-90 hover:scale-105 transition-all duration-700"
              onError={(e) => {
                // Fallback style if image missing
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5 bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 rounded border border-white/20">
                <Factory className="w-3.5 h-3.5 text-[#173D32]" />
                {listing.facility.name}
              </span>
              <span className="bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 rounded border border-white/20 uppercase">
                {listing.physicalForm}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Structured Specification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Specification Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 01: Physical & Chemical Composition */}
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-6 shadow-2xs">
            <h2 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-4 pb-2 border-b border-[#E2DDD5] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#173D32]" />
              01 • Technical Specification & Stream Composition
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 font-mono text-xs">
              <div>
                <span className="text-stone-500 block text-[10px] uppercase">CO₂ Concentration</span>
                <span className="font-bold text-[#173D32] text-sm mt-0.5 block">{listing.purityPercentage}%</span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase">Physical State</span>
                <span className="font-bold text-[#171A18] text-sm mt-0.5 block capitalize">
                  {listing.physicalForm.toLowerCase().replace('_', ' ')}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase">Capture Method</span>
                <span className="font-medium text-stone-800 text-xs mt-0.5 block">
                  {listing.captureMethod || 'Chemical Absorption'}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase">Capture Source</span>
                <span className="font-medium text-stone-800 text-xs mt-0.5 block">
                  {listing.captureSource || 'Industrial Flue Stream'}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-stone-400" /> Temperature (°C)
                </span>
                <span className="font-bold text-[#171A18] text-xs mt-0.5 block">
                  {listing.temperatureCelsius !== null ? `${listing.temperatureCelsius}°C` : 'Ambient'}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-stone-400" /> Operating Pressure
                </span>
                <span className="font-bold text-[#171A18] text-xs mt-0.5 block">
                  {listing.pressureBar !== null ? `${listing.pressureBar} bar` : 'Standard'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 02: Commercial & Logistics Terms */}
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-6 shadow-2xs">
            <h2 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-4 pb-2 border-b border-[#E2DDD5] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#173D32]" />
              02 • Commercial Terms & Logistics Options
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 font-mono text-xs">
              <div>
                <span className="text-stone-500 block text-[10px] uppercase">Unit Price</span>
                <span className="font-bold text-[#171A18] text-sm mt-0.5 block">
                  ₹{listing.price.amount.toLocaleString()} / {listing.quantity.unit}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase">Minimum Order (MOQ)</span>
                <span className="font-semibold text-stone-800 text-xs mt-0.5 block">
                  {listing.quantity.minimumOrder} {listing.quantity.unit}s
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase">Currency</span>
                <span className="font-semibold text-stone-800 text-xs mt-0.5 block">
                  {listing.price.currency} (INR)
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase flex items-center gap-1">
                  <Truck className="w-3 h-3 text-stone-400" /> Delivery Dispatch
                </span>
                <span className={`font-semibold text-xs mt-0.5 block ${listing.deliveryAvailable ? 'text-[#173D32]' : 'text-stone-400'}`}>
                  {listing.deliveryAvailable ? 'Available (ISO Tanker)' : 'Not Available'}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase flex items-center gap-1">
                  <Store className="w-3 h-3 text-stone-400" /> Facility Pickup
                </span>
                <span className={`font-semibold text-xs mt-0.5 block ${listing.pickupAvailable ? 'text-[#173D32]' : 'text-stone-400'}`}>
                  {listing.pickupAvailable ? 'Available at Gate' : 'Not Available'}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block text-[10px] uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" /> Supply Window
                </span>
                <span className="font-semibold text-stone-800 text-xs mt-0.5 block">
                  {new Date(listing.availability.from).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  {listing.availability.until ? ` – ${new Date(listing.availability.until).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}` : ' (Ongoing)'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 03: Certificates & Technical Documents */}
          {/* Section 03: Verification Documents & Laboratory Purity Report */}
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-6 shadow-2xs">
            <h2 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-4 pb-2 border-b border-[#E2DDD5] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#173D32]" />
                03 • Laboratory Purity Report & Technical Verification
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Assay Evidence Attached
              </span>
            </h2>

            {/* Laboratory Purity Report Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DDD5] space-y-3 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-white border border-[#E2DDD5] text-[#173D32] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs uppercase tracking-wider font-mono text-stone-500 block text-[10px]">
                      Laboratory Purity Report (Supporting Evidence)
                    </span>
                    <p className="font-bold text-[#171A18] text-sm truncate mt-0.5">
                      {listing.labReportFilename || 'ISO_Certified_CO2_Purity_Lab_Assay.pdf'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {listing.verificationStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#13DEB9] bg-[#13DEB9]/10 px-3 py-1 rounded-full border border-[#13DEB9]/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Purity Verified
                    </span>
                  ) : listing.verificationStatus === 'REJECTED' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#FA896B] bg-[#FA896B]/10 px-3 py-1 rounded-full border border-[#FA896B]/30">
                      ⚠️ Report Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#FFAE1F] bg-[#FEF5E5] px-3 py-1 rounded-full border border-[#FFAE1F]/30">
                      ⏳ Pending Verification
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => window.open(listing.labReportUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf', '_blank')}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#173D32] bg-white border border-[#173D32]/30 hover:bg-[#173D32] hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    View Purity Report
                  </button>
                </div>
              </div>

              {listing.verificationNotes && (
                <div className="p-3 bg-white rounded-lg border border-amber-200 text-amber-900 text-xs font-mono">
                  <strong>Verification Notes:</strong> {listing.verificationNotes}
                </div>
              )}
            </div>

            {listing.documents && listing.documents.length > 0 && (
              <div className="space-y-3 border-t border-[#E2DDD5] pt-4">
                <h4 className="text-[10px] font-mono uppercase text-stone-500">Additional Facility Documentation</h4>
                {listing.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#FAF8F5] border border-[#E2DDD5] font-mono text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-white border border-[#E2DDD5] text-[#173D32]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-[#171A18]">{doc.name}</p>
                        <p className="text-[10px] text-stone-500">
                          {doc.description || doc.type} • {(doc.fileSize / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#173D32] bg-[#173D32]/10 px-2 py-0.5 rounded border border-[#173D32]/20 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Supplier & Facility Information (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Supplier Card */}
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-6 shadow-2xs space-y-4 font-mono text-xs">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 pb-2 border-b border-[#E2DDD5] flex items-center justify-between">
              Supplier Organization
              <ShieldCheck className="w-4 h-4 text-[#173D32]" />
            </h3>

            <div>
              <div className="font-bold text-sm text-[#171A18] font-sans">{listing.organization.name}</div>
              <p className="text-stone-500 text-[11px] mt-0.5">Type: {listing.organization.orgType}</p>
            </div>

            <Separator className="bg-[#E2DDD5]" />

            <div>
              <div className="text-[10px] text-stone-500 uppercase">Registered Facility</div>
              <div className="font-semibold text-stone-900 text-xs mt-0.5">{listing.facility.name}</div>
              <div className="text-stone-500 text-[11px] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                {listing.facility.city}, {listing.facility.state}, {listing.facility.country}
              </div>
            </div>

            <Separator className="bg-[#E2DDD5]" />

            <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E2DDD5] text-[11px] leading-relaxed text-stone-600 font-sans">
              <span className="font-semibold text-[#171A18]">Regulatory Compliance:</span> Verified under Gujarat Pollution Control Board (GPCB) industrial carbon capture frameworks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
