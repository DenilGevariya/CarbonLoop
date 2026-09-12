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
          bg: 'bg-[#173D32]/10',
          border: 'border-[#173D32]/30',
          text: 'text-[#173D32]',
          label: 'VERIFIED',
          icon: ShieldCheck,
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-700',
          label: 'UNDER REVIEW',
          icon: Clock,
        };
      case 'CHANGES_REQUESTED':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-800',
          label: 'CHANGES REQUESTED',
          icon: AlertTriangle,
        };
      case 'EXPIRED':
        return {
          bg: 'bg-neutral-200',
          border: 'border-neutral-300',
          text: 'text-neutral-600',
          label: 'EXPIRED',
          icon: Clock,
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-700',
          label: 'REJECTED',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-neutral-100',
          border: 'border-neutral-200',
          text: 'text-neutral-600',
          label: 'UNVERIFIED',
          icon: Info,
        };
    }
  };

  const config = getBadgeStyle();
  const IconComponent = config.icon;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1 font-bold uppercase tracking-wider'
      : 'px-2.5 py-1 text-xs gap-1.5 font-bold uppercase tracking-wider';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => showPopoverOnClick && setPopoverOpen(!popoverOpen)}
        className={`inline-flex items-center rounded border font-mono transition-all hover:bg-opacity-80 ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}
      >
        <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{config.label}</span>
      </button>

      {popoverOpen && (
        <div className="absolute z-50 left-0 mt-2 w-80 rounded-lg bg-[#FAF8F5] border border-[#E2DDD5] p-4 shadow-xl text-[#171A18] font-mono space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-2">
            <span className="text-xs font-bold uppercase text-[#173D32]">Trust & Evidence Record</span>
            <button
              onClick={() => setPopoverOpen(false)}
              className="text-xs text-neutral-400 hover:text-neutral-700 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500">Target Entity:</span>
              <span className="font-bold text-[#171A18]">{entityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Status:</span>
              <span className={`font-bold ${config.text}`}>{config.label}</span>
            </div>

            {verifiedAt && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Verified Date:</span>
                <span className="font-semibold text-neutral-800">
                  {new Date(verifiedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}

            {expiresAt && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Expiry Date:</span>
                <span className="font-semibold text-neutral-800">
                  {new Date(expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}

            {declaredPurity !== undefined && declaredPurity !== null && (
              <div className="flex justify-between border-t border-dashed border-[#E2DDD5] pt-1.5 mt-1.5">
                <span className="text-neutral-500">Declared Purity:</span>
                <span className="font-bold text-neutral-900">{declaredPurity}%</span>
              </div>
            )}

            {latestVerifiedPurity !== undefined && latestVerifiedPurity !== null && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Verified Assay Purity:</span>
                <span className="font-bold text-[#173D32]">{latestVerifiedPurity}%</span>
              </div>
            )}

            {evidenceDocumentName && (
              <div className="border-t border-[#E2DDD5] pt-2 mt-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Evidence Document</span>
                <div className="flex items-center gap-1.5 text-xs text-[#173D32] bg-[#173D32]/5 p-2 rounded border border-[#173D32]/10 truncate">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate font-semibold">{evidenceDocumentName}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#E2DDD5] pt-2 text-[10px] text-neutral-500 leading-relaxed">
            <p>
              CarbonLoop verification confirms evidence document review by network verifiers. It does not represent government certification or regulatory carbon credit issuance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
