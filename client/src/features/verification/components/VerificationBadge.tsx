import React, { useState } from 'react';
import { ShieldCheck, Clock, AlertTriangle, FileText, Info } from 'lucide-react';
import type { VerificationStatus } from '../api/verificationApi';

interface VerificationBadgeProps {
  status: VerificationStatus | string;
  verifiedAt?: string | null;
  expiresAt?: string | null;
  latestVerifiedPurity?: number | null;
  declaredPurity?: number | null;
  evidenceDocumentName?: string | null;
  entityName?: string;
  showPopoverOnClick?: boolean;
  size?: 'sm' | 'md';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  verifiedAt,
  expiresAt,
  latestVerifiedPurity,
  declaredPurity,
  evidenceDocumentName,
  entityName = 'Entity',
  showPopoverOnClick = true,
  size = 'md',
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const normStatus = (status || 'UNVERIFIED').toUpperCase();

  const getBadgeStyle = () => {
    switch (normStatus) {
      case 'VERIFIED':
      case 'APPROVED':
        return {
          bg: 'bg-[#13DEB9]/15',
          border: 'border-[#13DEB9]/30',
          text: 'text-[#0EAB8B]',
          label: 'VERIFIED',
          icon: ShieldCheck,
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-[#5D87FF]/15',
          border: 'border-[#5D87FF]/30',
          text: 'text-[#5D87FF]',
          label: 'UNDER REVIEW',
          icon: Clock,
        };
      case 'CHANGES_REQUESTED':
        return {
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/30',
          text: 'text-amber-700',
          label: 'CHANGES REQUESTED',
          icon: AlertTriangle,
        };
      case 'EXPIRED':
        return {
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          text: 'text-[#5A6A85]',
          label: 'EXPIRED',
          icon: Clock,
        };
      case 'REJECTED':
        return {
          bg: 'bg-[#FA896B]/15',
          border: 'border-[#FA896B]/30',
          text: 'text-[#FA896B]',
          label: 'REJECTED',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          text: 'text-[#5A6A85]',
          label: 'UNVERIFIED',
          icon: Info,
        };
    }
  };

  const config = getBadgeStyle();
  const IconComponent = config.icon;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1 font-semibold uppercase tracking-wider'
      : 'px-2.5 py-1 text-xs gap-1.5 font-semibold uppercase tracking-wider';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => showPopoverOnClick && setPopoverOpen(!popoverOpen)}
        className={`inline-flex items-center rounded-full border transition-all hover:bg-opacity-80 ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}
      >
        <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{config.label}</span>
      </button>

      {popoverOpen && (
        <div className="absolute z-50 left-0 mt-2 w-80 rounded-xl bg-white border border-[#E5EAEF] p-4 shadow-xl text-[#2A3547] space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-2">
            <span className="text-xs font-bold uppercase text-[#5D87FF]">Trust & Evidence Record</span>
            <button
              onClick={() => setPopoverOpen(false)}
              className="text-xs text-[#5A6A85] hover:text-[#2A3547] font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#5A6A85]">Target Entity:</span>
              <span className="font-bold text-[#2A3547]">{entityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6A85]">Status:</span>
              <span className={`font-bold ${config.text}`}>{config.label}</span>
            </div>

            {verifiedAt && (
              <div className="flex justify-between">
                <span className="text-[#5A6A85]">Verified Date:</span>
                <span className="font-semibold text-[#2A3547]">
                  {new Date(verifiedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}

            {expiresAt && (
              <div className="flex justify-between">
                <span className="text-[#5A6A85]">Expiry Date:</span>
                <span className="font-semibold text-[#2A3547]">
                  {new Date(expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}

            {declaredPurity !== undefined && declaredPurity !== null && (
              <div className="flex justify-between border-t border-dashed border-[#E5EAEF] pt-1.5 mt-1.5">
                <span className="text-[#5A6A85]">Declared Purity:</span>
                <span className="font-bold text-[#2A3547]">{declaredPurity}%</span>
              </div>
            )}

            {latestVerifiedPurity !== undefined && latestVerifiedPurity !== null && (
              <div className="flex justify-between">
                <span className="text-[#5A6A85]">Verified Assay Purity:</span>
                <span className="font-bold text-[#5D87FF]">{latestVerifiedPurity}%</span>
              </div>
            )}

            {evidenceDocumentName && (
              <div className="border-t border-[#E5EAEF] pt-2 mt-2">
                <span className="text-[10px] uppercase font-semibold text-[#5A6A85] block mb-1">Evidence Document</span>
                <div className="flex items-center gap-1.5 text-xs text-[#5D87FF] bg-[#ECF2FF] p-2 rounded-lg border border-[#5D87FF]/20 truncate">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate font-semibold">{evidenceDocumentName}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#E5EAEF] pt-2 text-[10px] text-[#5A6A85] leading-relaxed">
            <p>
              CarbonLoop verification confirms evidence document review by network verifiers. It does not represent government certification or regulatory carbon credit issuance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
