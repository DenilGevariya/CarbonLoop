import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MatchScore } from './MatchScore';
import type { MatchRecord } from '../types/matching.types';
import { Factory, MapPin, ArrowRight } from 'lucide-react';

interface MatchCardProps {
  match: MatchRecord;
  onSelect: (match: MatchRecord) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelect }) => {
  const listing = match.listing;
  const requirement = match.requirement;

  return (
    <Card className="bg-white border border-[#E5EAEF] hover:border-[#5D87FF]/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group rounded-xl overflow-hidden">
      <CardHeader className="p-5 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <MatchScore score={match.overall_score} grade={match.grade} size="sm" />
          <span className="text-[11px] font-semibold text-[#5A6A85] bg-[#ECF2FF] px-2.5 py-0.5 rounded-full border border-[#5D87FF]/20">
            {match.estimated_distance_km} km
          </span>
        </div>

        <div>
          <h4 className="text-base font-bold text-[#2A3547] group-hover:text-[#5D87FF] transition-colors leading-tight">
            {listing?.title || listing?.organization_name || 'Industrial Emitter Stream'}
          </h4>
          <p className="text-xs text-[#5A6A85] flex items-center gap-1.5 mt-1 font-sans">
            <Factory className="size-3.5 text-[#5D87FF]" />
            <span className="font-semibold text-[#2A3547]">{listing?.organization_name}</span> • {listing?.facility_name || 'Capture Facility'}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-2.5 text-xs p-3.5 rounded-xl bg-[#F6F9FC] border border-[#E5EAEF]">
          <div>
            <span className="text-[#5A6A85] block text-[10px] uppercase font-semibold">STREAM PURITY</span>
            <span className="text-[#2A3547] font-bold text-sm">{listing?.purity_percentage || 99.5}%</span>
          </div>
          <div>
            <span className="text-[#5A6A85] block text-[10px] uppercase font-semibold">PHYSICAL FORM</span>
            <span className="text-[#5D87FF] font-bold text-sm uppercase">{listing?.state_form || 'LIQUID'}</span>
          </div>
          <div>
            <span className="text-[#5A6A85] block text-[10px] uppercase font-semibold">AVAILABLE BATCH</span>
            <span className="text-[#2A3547] font-bold">{listing?.available_quantity_tons?.toLocaleString() || 1250} tonnes</span>
          </div>
          <div>
            <span className="text-[#5A6A85] block text-[10px] uppercase font-semibold">DELIVERED COST</span>
            <span className="text-[#13DEB9] font-bold">₹{match.estimated_delivered_cost?.toLocaleString() || 5320}/t</span>
          </div>
        </div>

        <div className="text-xs text-[#5A6A85] flex items-center gap-1.5 truncate bg-[#F6F9FC] p-2 rounded-lg border border-[#E5EAEF]">
          <MapPin className="size-3.5 text-[#5D87FF] shrink-0" />
          <span className="truncate">{listing?.city || 'Ahmedabad'} → {requirement?.location_city || 'Vadodara'}</span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          onClick={() => onSelect(match)}
          className="w-full bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold uppercase tracking-wider py-2.5 rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
        >
          Inspect Match Specification <ArrowRight className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};
