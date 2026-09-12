import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MetricCard } from '@/components/shared/MetricCard';
import { MatchScoreBadge } from '@/components/shared/MatchScoreBadge';
import { Button } from '@/components/ui/button';
import { Factory, RotateCcw, Cpu, Truck, ArrowUpRight, PlusCircle, ShieldCheck, Layers, Building2 } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/animations';
import { useNavigate } from 'react-router-dom';
import { matchingApi } from '@/features/matching/api/matching.api';
import type { MatchRecord } from '@/features/matching/types/matching.types';

export const DashboardPage: React.FC = () => {
  const { user, activeOrg } = useAuth();
  const navigate = useNavigate();
  const [topMatches, setTopMatches] = useState<MatchRecord[]>([]);

  useEffect(() => {
    async function loadMatches() {
      try {
        const matches = await matchingApi.getRequirementMatches('70000000-0000-4000-a000-000000000001', 0);
        setTopMatches(matches.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard matches:', err);
      }
    }
    loadMatches();
  }, []);

  const orgType = activeOrg?.orgType?.toUpperCase() || 'EMITTER';
  const isEmitter = orgType === 'EMITTER';
  const isUtilizer = orgType === 'BUYER' || orgType === 'UTILIZER';
  const isLogistics = orgType === 'LOGISTICS_PROVIDER';
  const isAdmin = user?.roles.includes('platform_admin') || user?.roles.includes('admin');

  return (
    <div className="space-y-8 bg-[#F7F5EF] text-[#171A18]">
      {/* Top Banner */}
      <FadeUp className="bg-[#FAF8F5] border border-[#E2DDD5] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#173D32] bg-[#EBE7DF] px-2.5 py-1 border border-[#DCD6C9]">
              ACTIVE ORGANIZATION: {activeOrg?.organizationName || 'TerraCem Industries'} ({orgType})
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#171A18] tracking-tight mt-2">
            Welcome back, <span className="text-[#173D32]">{user?.firstName} {user?.lastName}</span>
          </h2>
          <p className="text-xs text-[#5C6560] font-mono mt-1">
            Operational Console • Connected as {user?.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEmitter && (
            <Button
              onClick={() => navigate('/dashboard/listings')}
              className="bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-none px-4 py-2.5"
            >
              <PlusCircle className="size-4 mr-2" /> Add CO₂ Stream
            </Button>
          )}

          {isUtilizer && (
            <Button
              onClick={() => navigate('/dashboard/requirements')}
              className="bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-none px-4 py-2.5"
            >
              <PlusCircle className="size-4 mr-2" /> Post Requirement
            </Button>
          )}

          {isLogistics && (
            <Button
              onClick={() => navigate('/dashboard/shipments')}
              className="bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-none px-4 py-2.5"
            >
              <Truck className="size-4 mr-2" /> Dispatch Tanker Fleet
            </Button>
          )}

          {isAdmin && (
            <Button
              onClick={() => navigate('/marketplace')}
              className="bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-none px-4 py-2.5"
            >
              <ShieldCheck className="size-4 mr-2" /> Platform Network
            </Button>
          )}
        </div>
      </FadeUp>

      {/* Role-Specific Metric Cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isEmitter && (
          <>
            <StaggerItem>
              <MetricCard label="Active Stream Supply" value={1250} suffix=" t/mo" subtext="Ahmedabad Calcination Unit" icon={Factory} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Algorithmic Matches" value={topMatches.length || 4} subtext="Compatibility score ≥ 85%" icon={Cpu} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Contracted Volume" value={500} suffix=" t" subtext="GreenForge Off-Take Contract" icon={RotateCcw} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Haulage In Transit" value={112} suffix=" km" subtext="ISO Tanker #SHP-9904 en route" icon={Truck} />
            </StaggerItem>
          </>
        )}

        {isUtilizer && (
          <>
            <StaggerItem>
              <MetricCard label="Monthly CO₂ Demand" value={500} suffix=" t/mo" subtext="Vadodara Mineralization Facility" icon={Layers} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Compatible Streams" value={topMatches.length || 6} subtext="Matched within 150km radius" icon={Cpu} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Executed Off-Takes" value={1} suffix=" order" subtext="TerraCem Supply #LST-1042" icon={RotateCcw} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Target Strike Price" value={4800} prefix="₹" suffix="/t" subtext="Delivered target budget" icon={ShieldCheck} />
            </StaggerItem>
          </>
        )}

        {isLogistics && (
          <>
            <StaggerItem>
              <MetricCard label="Active Dispatches" value={3} suffix=" fleets" subtext="Pressurized ISO Tankers" icon={Truck} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="In Transit Volume" value={850} suffix=" t" subtext="Corridor: Ahmedabad -> Vadodara" icon={RotateCcw} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Fleet Availability" value={8} suffix=" units" subtext="Hazmat Certified Tankers" icon={Factory} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Avg Transit Time" value={2.6} suffix=" hrs" subtext="112.5 km average haulage" icon={Cpu} />
            </StaggerItem>
          </>
        )}

        {isAdmin && (
          <>
            <StaggerItem>
              <MetricCard label="Network Supply Capacity" value={24820} suffix=" t/mo" subtext="Verified stack flow capacity" icon={Factory} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Network Off-Take Demand" value={18420} suffix=" t/mo" subtext="Utilizer requirements logged" icon={Layers} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Active Organizations" value={184} suffix=" orgs" subtext="Emitters, Buyers & Carriers" icon={Building2} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Sequestration Volume" value={12840} suffix=" t" subtext="Permanent mineralization" icon={ShieldCheck} />
            </StaggerItem>
          </>
        )}
      </StaggerContainer>

      {/* Algorithmic Match Table */}
      <FadeUp delay={0.3}>
        <div className="bg-[#FAF8F5] border border-[#E2DDD5]">
          <div className="flex flex-row items-center justify-between p-6 border-b border-[#E2DDD5]">
            <div>
              <h3 className="text-lg font-bold text-[#171A18] tracking-tight">
                Active Algorithmic Compatibility Matrix
              </h3>
              <p className="text-xs font-mono text-[#5C6560] mt-1">
                Highest compatibility pairs calculated by CarbonLoop multi-vector engine
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/matches')}
              className="bg-[#EBE7DF] hover:bg-[#E2DDD5] text-[#171A18] border-[#DCD6C9] font-mono text-xs font-bold uppercase rounded-none"
            >
              View Match Matrix <ArrowUpRight className="size-3.5 ml-1" />
            </Button>
          </div>

          <div className="divide-y divide-[#E2DDD5]">
            {topMatches.map((m) => (
              <div key={m.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#EBE7DF]/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#171A18]">
                      {m.listing?.organization_name || 'TerraCem Industries'} → {m.requirement?.organization_name || 'GreenForge Materials'}
                    </span>
                    <span className="text-xs font-mono text-[#5C6560] bg-[#EBE7DF] px-2 py-0.5 border border-[#DCD6C9]">
                      MATCH-{m.id.substring(0, 6)}
                    </span>
                  </div>
                  <p className="text-xs font-serif text-[#5C6560]">
                    Purity: <span className="text-[#171A18] font-bold">{m.listing?.purity_percentage || 99.5}%</span> • Distance: <span className="text-[#173D32] font-mono font-bold">{m.estimated_distance_km} km</span> • Delivered: <span className="text-[#173D32] font-mono font-bold">₹{m.estimated_delivered_cost.toLocaleString()}/t</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <MatchScoreBadge score={m.overall_score} size="md" />
                  <Button
                    size="sm"
                    onClick={() => navigate('/dashboard/matches')}
                    className="bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase rounded-none px-4"
                  >
                    Inspect Compatibility
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeUp>
    </div>
  );
};

export default DashboardPage;
