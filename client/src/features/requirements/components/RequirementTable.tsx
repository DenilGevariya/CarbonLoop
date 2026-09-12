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
      <div className="bg-white border border-[#E5EAEF] rounded-xl divide-y divide-[#E5EAEF] shadow-xs">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (requirements.length === 0) {
    return (
      <div className="bg-white border border-[#E5EAEF] rounded-xl p-12 text-center my-6 space-y-4 shadow-xs">
        <div className="size-12 rounded-full bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-[#2A3547]">
            {isOwnerView
              ? "You haven't published a CO₂ requirement yet"
              : "No active CO₂ requirements match these filters"}
          </h3>
          <p className="text-xs text-[#5A6A85] max-w-md mx-auto mt-1 leading-relaxed">
            {isOwnerView
              ? "Define the carbon your facility needs and make your off-take parameters discoverable across the CarbonLoop network."
              : "Try widening the purity range, location bounds, or utilization filter to discover active industrial demand streams."}
          </p>
        </div>
        <div>
          {isOwnerView ? (
            <Button
              onClick={() => navigate('/dashboard/requirements/new')}
              className="bg-[#5D87FF] hover:bg-[#4570EA] text-white rounded-lg text-xs font-semibold px-6 py-2.5 cursor-pointer"
            >
              + Create Requirement
            </Button>
          ) : (
            onResetFilters && (
              <Button
                variant="outline"
                onClick={onResetFilters}
                className="border-[#E5EAEF] rounded-lg text-xs text-[#5A6A85] px-6 py-2"
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
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FDEDE8] text-[#FA896B]">
            Urgent Priority
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF5E5] text-[#FFAE1F]">
            High Priority
          </span>
        );
      case 'normal':
      default:
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F6F9FC] text-[#5A6A85] border border-[#E5EAEF]">
            Normal Priority
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E5EAEF] rounded-xl divide-y divide-[#E5EAEF] shadow-xs">
      {requirements.map((req) => (
        <div
          key={req.id}
          className="p-5 sm:p-6 hover:bg-[#F6F9FC]/70 transition-colors group flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          {/* Main Info Block */}
          <div className="space-y-2 flex-1 min-w-0">
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-[#5D87FF] uppercase tracking-wider bg-[#ECF2FF] border border-[#5D87FF]/20 px-2 py-0.5 rounded-full">
                {req.requirement_code}
              </span>

              <RequirementStatusBadge status={req.status} />

              {req.utilization && (
                <span className="text-[10px] font-medium text-[#5A6A85] uppercase tracking-wider bg-[#F6F9FC] border border-[#E5EAEF] px-2 py-0.5 rounded-full">
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
                className="font-bold text-base sm:text-lg text-[#2A3547] group-hover:text-[#5D87FF] transition-colors cursor-pointer leading-tight"
              >
                {req.title}
              </h3>
              <p className="text-xs text-[#5A6A85] line-clamp-1 mt-0.5">
                {req.description}
              </p>
            </div>

            {/* Specification Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-[#5A6A85]">
              <div className="flex items-center gap-1.5">
                <span>Volume:</span>
                <strong className="text-[#2A3547] font-bold">
                  {req.required_quantity.toLocaleString()} {req.quantity_unit}s
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#13DEB9]" />
                <span>Purity:</span>
                <strong className="text-[#13DEB9] font-bold">≥{req.minimum_purity}%</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#5A6A85]" />
                <span>Dest:</span>
                <strong className="text-[#2A3547] font-bold truncate">
                  {req.destination_facility
                    ? req.destination_facility.city
                    : req.location_city || 'Gujarat'}
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                <span>Ceiling:</span>
                <strong className="text-[#2A3547] font-bold">
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
                  className="border-[#E5EAEF] text-xs h-9 rounded-lg flex items-center gap-1.5 text-[#2A3547] hover:bg-[#F6F9FC]"
                >
                  <Edit className="w-3.5 h-3.5 text-[#5A6A85]" /> Edit
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#E5EAEF] text-xs h-9 w-9 p-0 rounded-lg cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 text-[#5A6A85]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-lg border-[#E5EAEF] bg-white">
                    {req.status === 'DRAFT' && onPublish && (
                      <DropdownMenuItem
                        onClick={() => onPublish(req)}
                        className="text-xs cursor-pointer text-[#5D87FF]"
                      >
                        <Radio className="w-3.5 h-3.5 mr-2 text-[#5D87FF]" /> Publish Requirement
                      </DropdownMenuItem>
                    )}

                    {(req.status === 'PUBLISHED' || req.status === 'ACTIVE') && onPause && (
                      <DropdownMenuItem
                        onClick={() => onPause(req)}
                        className="text-xs cursor-pointer text-[#FFAE1F]"
                      >
                        <PauseCircle className="w-3.5 h-3.5 mr-2 text-[#FFAE1F]" /> Pause Requirement
                      </DropdownMenuItem>
                    )}

                    {req.status === 'PAUSED' && onResume && (
                      <DropdownMenuItem
                        onClick={() => onResume(req)}
                        className="text-xs cursor-pointer text-[#13DEB9]"
                      >
                        <PlayCircle className="w-3.5 h-3.5 mr-2 text-[#13DEB9]" /> Resume Publication
                      </DropdownMenuItem>
                    )}

                    {(req.status === 'PUBLISHED' || req.status === 'ACTIVE') && onFulfill && (
                      <DropdownMenuItem
                        onClick={() => onFulfill(req)}
                        className="text-xs cursor-pointer text-[#49BEFF]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-[#49BEFF]" /> Mark as Fulfilled
                      </DropdownMenuItem>
                    )}

                    {req.status !== 'ARCHIVED' && onArchive && (
                      <DropdownMenuItem
                        onClick={() => onArchive(req)}
                        className="text-xs cursor-pointer text-[#FA896B]"
                      >
                        <Archive className="w-3.5 h-3.5 mr-2 text-[#FA896B]" /> Archive
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={() => navigate(`/requirements/${req.requirement_code}`)}
                className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
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
