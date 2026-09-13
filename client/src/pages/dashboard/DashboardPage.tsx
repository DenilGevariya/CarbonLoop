import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MetricCard } from '@/components/shared/MetricCard';
import { MatchScoreBadge } from '@/components/shared/MatchScoreBadge';
import { Button } from '@/components/ui/button';
import { Factory, RotateCcw, Cpu, Truck, ArrowUpRight, PlusCircle, ShieldCheck, Layers, Building2, Eye, Scale, Search } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/animations';
import { useNavigate } from 'react-router-dom';
import { matchingApi } from '@/features/matching/api/matching.api';
import { useMyRequirements } from '@/features/requirements/hooks/useRequirements';
import { useMarketplaceListings } from '@/features/listings/hooks/useListings';
import type { MatchRecord } from '@/features/matching/types/matching.types';
import { PriceAnalyticsCharts } from '@/features/analytics/components/PriceAnalyticsCharts';

export const DashboardPage: React.FC = () => {
  const { user, activeOrg } = useAuth();
  const navigate = useNavigate();
  const [topMatches, setTopMatches] = useState<MatchRecord[]>([]);

  // Search Bar Form State
  const [searchSeller, setSearchSeller] = useState('');
  const [searchQty, setSearchQty] = useState('');
  const [searchPurity, setSearchPurity] = useState('');
  const [searchPrice, setSearchPrice] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Fetch real buyer data
  const { data: reqData } = useMyRequirements({ limit: 50 });
  const { data: listingsData } = useMarketplaceListings({ limit: 50 });

  const buyerReqs = reqData?.items || [];
  const activeReqs = buyerReqs.filter((r) => r.status === 'PUBLISHED' || r.status === 'ACTIVE');
  const monthlyDemand = activeReqs.reduce((sum, r) => sum + (r.required_quantity || 0), 0);
  const totalMarketListings = listingsData?.items?.length || listingsData?.data?.length || 0;
  
  // Strike Price
  const pricesWithTarget = activeReqs.map((r) => r.maximum_price_per_unit).filter((p): p is number => typeof p === 'number' && p > 0);
  const avgTargetPrice = pricesWithTarget.length > 0
    ? Math.round(pricesWithTarget.reduce((a, b) => a + b, 0) / pricesWithTarget.length)
    : 4800;

  useEffect(() => {
    async function loadMatches() {
      try {
        const targetReqId = buyerReqs.length > 0 ? buyerReqs[0].id : '70000000-0000-4000-a000-000000000001';
        const matches = await matchingApi.getRequirementMatches(targetReqId, 0);
        setTopMatches(matches.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard matches:', err);
      }
    }
    loadMatches();
  }, [buyerReqs]);

  const userRoles = (user?.roles || []).map((r) => r.toLowerCase().replace('-', '_'));
  const activeOrgType = (activeOrg?.orgType || '').toLowerCase().replace('-', '_');

  const isAdmin = userRoles.some((r) => r === 'platform_admin' || r === 'admin' || r === 'platform_administrator');
  const isRegulator = !isAdmin && (
    userRoles.some((r) => r === 'regulator' || r === 'policy_regulator' || r === 'gpcb') ||
    activeOrgType === 'regulator' || activeOrgType === 'policy_regulator'
  );
  const isLogistics = !isAdmin && !isRegulator && (
    userRoles.some((r) => r === 'logistics_provider' || r === 'logistics' || r === 'transporter') ||
    activeOrgType === 'logistics_provider' || activeOrgType === 'logistics'
  );
  const isUtilizer = !isAdmin && !isRegulator && !isLogistics && (
    userRoles.some((r) => r === 'utilizer' || r === 'buyer' || r === 'carbon_utilizer') ||
    activeOrgType === 'buyer' || activeOrgType === 'utilizer'
  );
  const isEmitter = !isAdmin && !isRegulator && !isLogistics && !isUtilizer;

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    } else if (isLogistics) {
      navigate('/logistics', { replace: true });
    }
  }, [isAdmin, isLogistics, navigate]);

  const handleDashboardSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchSeller) queryParams.set('search', searchSeller);
    if (searchQty) queryParams.set('minQuantity', searchQty);
    if (searchPurity) queryParams.set('minPurity', searchPurity.replace(/[^0-9.]/g, ''));
    if (searchPrice) queryParams.set('maxPrice', searchPrice);
    if (searchLocation) queryParams.set('location', searchLocation);

    const targetPath = isEmitter ? '/requirements' : '/dashboard/marketplace';
    const qs = queryParams.toString();
    navigate(`${targetPath}${qs ? `?${qs}` : ''}`);
  };

  return (
    <div className="space-y-6 bg-[#F6F9FC] text-[#2A3547] font-sans">
      
      {/* 1. TOP WELCOME BANNER */}
      <FadeUp className="bg-white border border-[#E5EAEF] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5D87FF] bg-[#ECF2FF] px-3 py-1 rounded-full border border-[#5D87FF]/20 uppercase tracking-wider">
              {activeOrg?.organizationName || 'Industrial Node'} ({isAdmin ? 'ADMIN' : isRegulator ? 'REGULATOR' : isLogistics ? 'LOGISTICS' : isUtilizer ? 'BUYER / UTILIZER' : (activeOrg?.orgType || 'EMITTER')})
            </span>
            {isRegulator && (
              <span className="text-xs font-bold text-[#13DEB9] bg-[#E8F9F5] px-3 py-1 rounded-full border border-[#13DEB9]/20 uppercase tracking-wider">
                Regulatory Oversight Node
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-[#2A3547] tracking-tight mt-3">
            Welcome back, <span className="text-[#5D87FF]">{user?.firstName} {user?.lastName}</span>
          </h2>
          <p className="text-xs text-[#5A6A85] font-medium mt-1">
            Operational Console • Account: {user?.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isEmitter && (
            <Button
              onClick={() => navigate('/dashboard/listings/new')}
              className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs rounded-xl px-4 py-2.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Add CO₂ Stream
            </Button>
          )}

          {isUtilizer && (
            <Button
              onClick={() => navigate('/dashboard/requirements/new')}
              className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs rounded-xl px-4 py-2.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Post Requirement
            </Button>
          )}

          {isLogistics && (
            <Button
              onClick={() => navigate('/dashboard/logistics')}
              className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs rounded-xl px-4 py-2.5 shadow-sm cursor-pointer"
            >
              <Truck className="w-4 h-4 mr-2" /> Dispatch Tanker Fleet
            </Button>
          )}

          {isRegulator && (
            <Button
              onClick={() => navigate('/admin/verification')}
              className="bg-[#13DEB9] hover:bg-[#0eb899] text-white font-semibold text-xs rounded-xl px-4 py-2.5 shadow-sm cursor-pointer"
            >
              <Eye className="w-4 h-4 mr-2" /> Audit Certificates & Reports
            </Button>
          )}

          {isAdmin && (
            <Button
              onClick={() => navigate('/admin')}
              className="bg-[#2A3547] hover:bg-[#1E2735] text-white font-semibold text-xs rounded-xl px-4 py-2.5 shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 mr-2" /> Platform Admin Command
            </Button>
          )}
        </div>
      </FadeUp>

      {/* 1.5. ROLE-SPECIFIC SEARCH BAR */}
      <form onSubmit={handleDashboardSearchSubmit}>
        <FadeUp delay={0.15} className="bg-white border border-[#E5EAEF] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2A3547] uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-[#5D87FF]" />
              {isEmitter ? 'Search Buyers' : isUtilizer ? 'Search Sellers & CO₂ Marketplace' : isRegulator ? 'Regulator Network Search' : 'Network Exchange Search'}
            </span>
            <Button type="submit" size="sm" className="bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold h-8 px-4 rounded-lg cursor-pointer">
              Execute Search
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#5A6A85] uppercase tracking-wider block mb-1">
                {isEmitter ? 'Buyer Name' : isUtilizer ? 'Seller Name' : 'Party / Company'}
              </label>
              <input
                type="text"
                value={searchSeller}
                onChange={(e) => setSearchSeller(e.target.value)}
                placeholder={isEmitter ? 'e.g. GreenForge' : isUtilizer ? 'e.g. TerraCem' : 'Company Name'}
                className="w-full h-9 px-3 bg-[#F6F9FC] border border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-lg focus:outline-none focus:border-[#5D87FF]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#5A6A85] uppercase tracking-wider block mb-1">
                {isEmitter ? 'Req Quantity (t)' : 'Offered Quantity (t)'}
              </label>
              <input
                type="number"
                value={searchQty}
                onChange={(e) => setSearchQty(e.target.value)}
                placeholder="e.g. 500"
                className="w-full h-9 px-3 bg-[#F6F9FC] border border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-lg focus:outline-none focus:border-[#5D87FF]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#5A6A85] uppercase tracking-wider block mb-1">Purity (%)</label>
              <input
                type="text"
                value={searchPurity}
                onChange={(e) => setSearchPurity(e.target.value)}
                placeholder="e.g. ≥ 99.0%"
                className="w-full h-9 px-3 bg-[#F6F9FC] border border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-lg focus:outline-none focus:border-[#5D87FF]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#5A6A85] uppercase tracking-wider block mb-1">Price (₹/t)</label>
              <input
                type="number"
                value={searchPrice}
                onChange={(e) => setSearchPrice(e.target.value)}
                placeholder="e.g. 4800"
                className="w-full h-9 px-3 bg-[#F6F9FC] border border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-lg focus:outline-none focus:border-[#5D87FF]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#5A6A85] uppercase tracking-wider block mb-1">Location</label>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="e.g. Gujarat"
                className="w-full h-9 px-3 bg-[#F6F9FC] border border-[#E5EAEF] text-xs font-medium text-[#2A3547] rounded-lg focus:outline-none focus:border-[#5D87FF]"
              />
            </div>
          </div>
        </FadeUp>
      </form>

      {/* 2. ROLE-SPECIFIC METRIC CARDS */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
              <MetricCard
                label="Monthly CO₂ Demand"
                value={monthlyDemand || (activeReqs.length > 0 ? monthlyDemand : 0)}
                suffix=" t/mo"
                subtext={activeReqs.length > 0 ? `${activeReqs.length} active requirement${activeReqs.length > 1 ? 's' : ''}` : 'No active requirements'}
                icon={Layers}
              />
            </StaggerItem>
            <StaggerItem>
              <MetricCard
                label="Compatible Streams"
                value={topMatches.length || totalMarketListings}
                subtext={topMatches.length > 0 ? `Highest match: ${Math.round(topMatches[0].overall_score || 94)}% match` : 'Scanned active network streams'}
                icon={Cpu}
              />
            </StaggerItem>
            <StaggerItem>
              <MetricCard
                label="Executed Off-Takes"
                value={1}
                suffix=" order"
                subtext="TerraCem Supply #CL-SUP-000001"
                icon={RotateCcw}
              />
            </StaggerItem>
            <StaggerItem>
              <MetricCard
                label="Target Strike Price"
                value={avgTargetPrice}
                prefix="₹"
                suffix="/t"
                subtext="Average target budget ceiling"
                icon={ShieldCheck}
              />
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

        {isRegulator && (
          <>
            <StaggerItem>
              <MetricCard label="Total Listed Supply" value={16050} suffix=" tonnes" subtext="Across regional industrial stack feeds" icon={Factory} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Total Traded Volume" value={1840} suffix=" tonnes" subtext="Verified ISO 14064 custody handoffs" icon={Scale} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Active Transactions" value={14} suffix=" deals" subtext="Commercial off-take agreements" icon={RotateCcw} />
            </StaggerItem>
            <StaggerItem>
              <MetricCard label="Pending Verifications" value={2} suffix=" certs" subtext="Purity chromatography evidence" icon={ShieldCheck} />
            </StaggerItem>
          </>
        )}

        {isAdmin && !isEmitter && !isUtilizer && !isLogistics && !isRegulator && (
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

      {/* 3. REAL DATABASE PRICE ANALYTICS CHARTS */}
      <FadeUp delay={0.2}>
        <PriceAnalyticsCharts />
      </FadeUp>

      {/* 4. ALGORITHMIC MATCH MATRIX TABLE */}
      <FadeUp delay={0.3}>
        <div className="bg-white border border-[#E5EAEF] rounded-2xl shadow-xs overflow-hidden">
          <div className="flex flex-row items-center justify-between p-6 border-b border-[#E5EAEF] bg-white">
            <div>
              <h3 className="text-lg font-bold text-[#2A3547] tracking-tight">
                Active Algorithmic Compatibility Matrix
              </h3>
              <p className="text-xs text-[#5A6A85] font-medium mt-1">
                Highest compatibility pairs calculated by CarbonLoop multi-vector engine
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/matches')}
              className="bg-[#F6F9FC] hover:bg-[#ECF2FF] text-[#5D87FF] border-[#5D87FF]/30 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              View Match Matrix <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="divide-y divide-[#E5EAEF]">
            {topMatches.map((m) => (
              <div key={m.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#F6F9FC] transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#2A3547]">
                      {m.listing?.organization_name || 'TerraCem Industries'} → {m.requirement?.organization_name || 'GreenForge Materials'}
                    </span>
                    <span className="text-xs font-semibold text-[#5D87FF] bg-[#ECF2FF] px-2.5 py-0.5 rounded-full border border-[#5D87FF]/20">
                      MATCH-{m.id.substring(0, 6)}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6A85] font-medium">
                    Purity: <span className="text-[#2A3547] font-bold">{m.listing?.purity_percentage || 99.5}%</span> • Distance: <span className="text-[#5D87FF] font-bold">{m.estimated_distance_km} km</span> • Delivered: <span className="text-[#13DEB9] font-bold">₹{m.estimated_delivered_cost.toLocaleString()}/t</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <MatchScoreBadge score={m.overall_score} size="md" />
                  <Button
                    size="sm"
                    onClick={() => navigate('/dashboard/matches')}
                    className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs rounded-xl px-4 shadow-xs cursor-pointer"
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
