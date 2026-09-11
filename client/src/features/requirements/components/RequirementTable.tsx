import React from 'react';
import type { BuyerRequirement } from '../types/requirement';
import { RequirementStatusBadge } from './RequirementStatusBadge';
import { RequirementTimeline } from './RequirementTimeline';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowRight,
  MoreVertical,
  Radio,
  PauseCircle,
  PlayCircle,
  Archive,
  CheckCircle2,
  Edit,
  MapPin,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RequirementTableProps {
  requirements: BuyerRequirement[];
  isLoading?: boolean;
  isOwnerView?: boolean;
  onResetFilters?: () => void;
  onPublish?: (req: BuyerRequirement) => void;
  onPause?: (req: BuyerRequirement) => void;
  onResume?: (req: BuyerRequirement) => void;
  onArchive?: (req: BuyerRequirement) => void;
  onFulfill?: (req: BuyerRequirement) => void;
}

export const RequirementTable: React.FC<RequirementTableProps> = ({
  requirements,
  isLoading = false,
  isOwnerView = false,
  onResetFilters,
  onPublish,
  onPause,
  onResume,
  onArchive,
  onFulfill,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E2DDD5] divide-y divide-[#E2DDD5]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4 bg-stone-200" />
              <Skeleton className="h-6 w-3/4 bg-stone-200" />
              <Skeleton className="h-4 w-1/2 bg-stone-200" />
            </div>
            <Skeleton className="h-10 w-28 bg-stone-200" />
          </div>
        ))}
      </div>
    );
  }

  if (requirements.length === 0) {
    return (
      <div className="bg-white border border-[#E2DDD5] p-12 text-center my-6 space-y-4">
        <div className="size-12 rounded-full bg-[#FAF8F5] border border-[#E2DDD5] text-stone-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-[#173D32]" />
        </div>
        <div>
          <h3 className="font-sans font-bold text-lg text-[#171A18]">
            {isOwnerView
              ? "You haven't published a CO₂ requirement yet"
              : "No active CO₂ requirements match these filters"}
          </h3>
          <p className="font-sans text-xs text-stone-500 max-w-md mx-auto mt-1 leading-relaxed">
            {isOwnerView
              ? "Define the carbon your facility needs and make your off-take parameters discoverable across the CarbonLoop network."
              : "Try widening the purity range, location bounds, or utilization filter to discover active industrial demand streams."}
          </p>
        </div>
        <div>
          {isOwnerView ? (
            <Button
              onClick={() => navigate('/dashboard/requirements/new')}
              className="bg-[#173D32] hover:bg-[#133027] text-white rounded-none text-xs font-semibold px-6 py-2.5 cursor-pointer"
            >
              + Create Requirement
            </Button>
          ) : (
            onResetFilters && (
              <Button
                variant="outline"
                onClick={onResetFilters}
                className="border-[#E2DDD5] rounded-none text-xs text-stone-700 px-6 py-2"
              >
                Reset Filters
              </Button>
            )
          )}
        </div>
      </div>
    );
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return (
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-500/10 text-rose-800 border border-rose-300">
            Urgent Priority
          </span>
        );
      case 'high':
        return (
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-800 border border-amber-300">
            High Priority
          </span>
        );
      case 'normal':
      default:
        return (
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-stone-100 text-stone-600 border border-stone-300">
            Normal Priority
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E2DDD5] divide-y divide-[#E2DDD5] shadow-2xs">
      {requirements.map((req) => (
        <div
          key={req.id}
          className="p-5 sm:p-6 hover:bg-[#FAF8F5]/60 transition-colors group flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          {/* Main Info Block */}
          <div className="space-y-2 flex-1 min-w-0">
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-[#173D32] uppercase tracking-wider bg-[#173D32]/10 border border-[#173D32]/20 px-2 py-0.5">
                {req.requirement_code}
              </span>

              <RequirementStatusBadge status={req.status} />

              {req.utilization && (
                <span className="font-mono text-[10px] font-medium text-stone-600 uppercase tracking-wider bg-stone-100 border border-stone-200 px-2 py-0.5">
                  {req.utilization.name}
                </span>
              )}

              {getPriorityBadge(req.priority)}
            </div>

            {/* Title & Organization */}
            <div>
              <h3
                onClick={() =>
                  isOwnerView
                    ? navigate(`/dashboard/requirements/${req.id}/edit`)
                    : navigate(`/requirements/${req.requirement_code}`)
                }
                className="font-sans font-bold text-base sm:text-lg text-[#171A18] group-hover:text-[#173D32] transition-colors cursor-pointer leading-tight"
              >
                {req.title}
              </h3>
              <p className="font-sans text-xs text-stone-600 line-clamp-1 mt-0.5">
                {req.description}
              </p>
            </div>

            {/* Specification Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs text-stone-700">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400">Volume:</span>
                <strong className="text-[#171A18] font-bold">
                  {req.required_quantity.toLocaleString()} {req.quantity_unit}s
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#173D32]" />
                <span className="text-stone-400">Purity:</span>
                <strong className="text-[#173D32] font-bold">≥{req.minimum_purity}%</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-stone-400">Dest:</span>
                <strong className="text-[#171A18] font-bold truncate">
                  {req.destination_facility
                    ? req.destination_facility.city
                    : req.location_city || 'Gujarat'}
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-stone-400">Ceiling:</span>
                <strong className="text-[#171A18] font-bold">
                  {req.maximum_price_per_unit
                    ? `₹${req.maximum_price_per_unit.toLocaleString()}`
                    : 'Open'}
                </strong>
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-1">
              <RequirementTimeline
                requiredFrom={req.required_from}
                requiredUntil={req.required_until}
              />
            </div>
          </div>

          {/* Action Column */}
          <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
            {isOwnerView ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/dashboard/requirements/${req.id}/edit`)}
                  className="border-[#E2DDD5] text-xs h-9 rounded-none flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-stone-600" /> Edit
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#E2DDD5] text-xs h-9 w-9 p-0 rounded-none cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 text-stone-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-none border-[#E2DDD5]">
                    {req.status === 'DRAFT' && onPublish && (
                      <DropdownMenuItem
                        onClick={() => onPublish(req)}
                        className="text-xs font-mono cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5 mr-2 text-[#173D32]" /> Publish Requirement
                      </DropdownMenuItem>
                    )}

                    {(req.status === 'PUBLISHED' || req.status === 'ACTIVE') && onPause && (
                      <DropdownMenuItem
                        onClick={() => onPause(req)}
                        className="text-xs font-mono cursor-pointer"
                      >
                        <PauseCircle className="w-3.5 h-3.5 mr-2 text-stone-600" /> Pause Requirement
                      </DropdownMenuItem>
                    )}

                    {req.status === 'PAUSED' && onResume && (
                      <DropdownMenuItem
                        onClick={() => onResume(req)}
                        className="text-xs font-mono cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5 mr-2 text-[#173D32]" /> Resume Publication
                      </DropdownMenuItem>
                    )}

                    {(req.status === 'PUBLISHED' || req.status === 'ACTIVE') && onFulfill && (
                      <DropdownMenuItem
                        onClick={() => onFulfill(req)}
                        className="text-xs font-mono cursor-pointer text-blue-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-blue-600" /> Mark as Fulfilled
                      </DropdownMenuItem>
                    )}

                    {req.status !== 'ARCHIVED' && onArchive && (
                      <DropdownMenuItem
                        onClick={() => onArchive(req)}
                        className="text-xs font-mono cursor-pointer text-rose-700"
                      >
                        <Archive className="w-3.5 h-3.5 mr-2 text-rose-600" /> Archive
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={() => navigate(`/requirements/${req.requirement_code}`)}
                className="bg-[#173D32] hover:bg-[#133027] text-white font-sans font-medium text-xs tracking-wide px-4 py-2.5 rounded-none flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Inspect Demand</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
