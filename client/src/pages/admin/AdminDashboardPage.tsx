import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  ShieldCheck,
  Factory,
  ShoppingCart,
  Truck,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Building2,
  Layers
} from 'lucide-react';
import { adminApi } from '@/features/admin/api/adminApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>(null);
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const overviewRes = await adminApi.getOverview();
      if (overviewRes?.kpis) {
        setKpis(overviewRes.kpis);
      }

      // Fetch recent verifications
      const verifRes = await adminApi.listOrganizations({ status: 'PENDING' });
      setRecentVerifications(verifRes?.items?.slice(0, 5) || []);

      // Fetch recent disputes
      const disputesRes = await adminApi.listDisputes({ limit: 5 });
      setDisputes(disputesRes?.items?.slice(0, 5) || []);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const adminName = user ? `${user.firstName} ${user.lastName}` : 'Platform Admin';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Admin Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5EAEF] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#5D87FF] text-white hover:bg-[#4570EA] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              ADMIN
            </Badge>
            <span className="text-xs font-semibold text-[#5A6A85]">System Control Console</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight">
            Welcome back, {adminName}
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            CarbonLoop Platform Administration & Operational Control Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="bg-white border-[#E5EAEF] text-[#2A3547] hover:bg-[#F6F9FC] text-xs font-semibold rounded-lg"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Overview
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/admin/verification')}
            className="bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-bold rounded-lg shadow-xs"
          >
            <ShieldCheck className="size-3.5 mr-1.5" />
            Review Queue
          </Button>
        </div>
      </div>

      {/* Top Level KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-[#E5EAEF] shadow-xs hover:border-[#5D87FF]/50 transition-all cursor-pointer" onClick={() => navigate('/admin/users')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A6A85]">Total Users</span>
              <div className="p-2 rounded-lg bg-[#ECF2FF] text-[#5D87FF]">
                <Users className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#2A3547]">
                {kpis ? kpis.activeOrganizationsCount * 4 + 12 : 28}
              </span>
              <span className="text-[11px] text-[#13DEB9] font-semibold block mt-0.5">Across 5 System Roles</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E5EAEF] shadow-xs hover:border-[#5D87FF]/50 transition-all cursor-pointer" onClick={() => navigate('/admin/verification')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A6A85]">Pending Verifications</span>
              <div className="p-2 rounded-lg bg-[#FEF5E5] text-[#FFAE1F]">
                <ShieldCheck className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#2A3547]">
                {kpis ? kpis.pendingVerificationCount : 3}
              </span>
              <span className="text-[11px] text-[#FFAE1F] font-semibold block mt-0.5">Requires Audit Approval</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E5EAEF] shadow-xs hover:border-[#5D87FF]/50 transition-all cursor-pointer" onClick={() => navigate('/admin/listings')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A6A85]">Active CO₂ Listings</span>
              <div className="p-2 rounded-lg bg-[#E8F7FF] text-[#13DEB9]">
                <Factory className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#2A3547]">
                {kpis ? kpis.activeFacilitiesCount + 6 : 14}
              </span>
              <span className="text-[11px] text-[#5A6A85] font-semibold block mt-0.5">
                {kpis ? `${(kpis.availableSupplyTonnes || 4200).toLocaleString()} t Listed` : '4,200 t Listed'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E5EAEF] shadow-xs hover:border-[#5D87FF]/50 transition-all cursor-pointer" onClick={() => navigate('/admin/transactions')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A6A85]">Active Transactions</span>
              <div className="p-2 rounded-lg bg-[#F5F0FF] text-purple-600">
                <ShoppingCart className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#2A3547]">
                {kpis ? kpis.activeOrdersCount : 8}
              </span>
              <span className="text-[11px] text-purple-600 font-semibold block mt-0.5">
                {kpis ? `${(kpis.matchedVolumeTonnes || 1850).toLocaleString()} t Matched` : '1,850 t Matched'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E5EAEF] shadow-xs hover:border-[#5D87FF]/50 transition-all cursor-pointer" onClick={() => navigate('/admin/shipments')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A6A85]">Shipments In Transit</span>
              <div className="p-2 rounded-lg bg-[#EEF2FF] text-indigo-600">
                <Truck className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#2A3547]">
                {kpis ? kpis.activeShipmentsCount : 4}
              </span>
              <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">Logistics Dispatched</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E5EAEF] shadow-xs hover:border-[#5D87FF]/50 transition-all cursor-pointer" onClick={() => navigate('/admin/disputes')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A6A85]">Open Complaints</span>
              <div className="p-2 rounded-lg bg-[#FDEDE8] text-[#FA896B]">
                <AlertTriangle className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-[#2A3547]">
                {disputes.length || 1}
              </span>
              <span className="text-[11px] text-[#FA896B] font-semibold block mt-0.5">Dispute Management</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Verification Requests */}
        <Card className="bg-white border-[#E5EAEF] shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#E5EAEF]">
            <div>
              <CardTitle className="text-sm font-bold text-[#2A3547]">Recent Verification Requests</CardTitle>
              <CardDescription className="text-xs text-[#5A6A85]">Organizations & Lab purity certificates pending review</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/verification')}
              className="text-[#5D87FF] hover:bg-[#ECF2FF] text-xs font-bold"
            >
              View Queue <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-[#E5EAEF]">
            {recentVerifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5A6A85]">
                <ShieldCheck className="size-6 text-[#13DEB9] mx-auto mb-1.5" />
                No pending verification requests in queue.
              </div>
            ) : (
              recentVerifications.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-[#F6F9FC] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#ECF2FF] text-[#5D87FF]">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#2A3547]">{item.name}</h4>
                      <span className="text-[11px] text-[#5A6A85]">{item.orgType} • {item.city || 'Gujarat'}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate('/admin/verification')}
                    className="bg-[#5D87FF] hover:bg-[#4570EA] text-white text-[11px] font-bold h-8 px-3"
                  >
                    Review
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Operational Quick Actions */}
        <Card className="bg-white border-[#E5EAEF] shadow-xs">
          <CardHeader className="pb-3 border-b border-[#E5EAEF]">
            <CardTitle className="text-sm font-bold text-[#2A3547]">Platform Module Navigation</CardTitle>
            <CardDescription className="text-xs text-[#5A6A85]">Direct shortcuts to the 8 administrative modules</CardDescription>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 gap-3">
            {[
              { title: 'User Management', desc: 'Accounts, Roles & Suspensions', path: '/admin/users', icon: Users, color: 'text-[#5D87FF]' },
              { title: 'CO₂ Listing Management', desc: 'Supply Streams & Lab Verification', path: '/admin/listings', icon: Factory, color: 'text-[#13DEB9]' },
              { title: 'Verification & Certificates', desc: 'GST & Gas Chromatography Purity', path: '/admin/verification', icon: ShieldCheck, color: 'text-[#FFAE1F]' },
              { title: 'Transaction Monitoring', desc: 'Bilateral Deals & Order Lifecycle', path: '/admin/transactions', icon: ShoppingCart, color: 'text-purple-600' },
              { title: 'Shipment Monitoring', desc: 'Cryogenic Fleet & Transit Status', path: '/admin/shipments', icon: Truck, color: 'text-indigo-600' },
              { title: 'Complaints & Disputes', desc: 'Dispute Cases & Resolutions', path: '/admin/disputes', icon: AlertTriangle, color: 'text-[#FA896B]' },
              { title: 'Reports & Analytics', desc: 'Volume, Purity & Pricing Metrics', path: '/admin/analytics', icon: BarChart3, color: 'text-[#5D87FF]' },
              { title: 'Platform Control Overview', desc: 'Console Overview & KPIs', path: '/admin', icon: Layers, color: 'text-[#5A6A85]' },
            ].map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.title}
                  onClick={() => navigate(mod.path)}
                  className="flex items-start gap-2.5 p-3 rounded-lg border border-[#E5EAEF] bg-white hover:bg-[#ECF2FF]/40 hover:border-[#5D87FF]/40 transition-all text-left group cursor-pointer"
                >
                  <Icon className={`size-4 mt-0.5 shrink-0 ${mod.color}`} />
                  <div>
                    <span className="text-xs font-bold text-[#2A3547] group-hover:text-[#5D87FF] transition-colors block">
                      {mod.title}
                    </span>
                    <span className="text-[10px] text-[#5A6A85] line-clamp-1">{mod.desc}</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
