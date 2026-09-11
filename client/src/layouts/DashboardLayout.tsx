import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LayoutDashboard,
  Factory,
  Layers,
  Cpu,
  Handshake,
  ShoppingBag,
  Truck,
  BarChart3,
  Bell,
  Search,
  LogOut,
  ShieldCheck,
  Building2,
  User,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const DashboardLayout: React.FC = () => {
  const { user, activeOrg, logout, switchOrganization } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isEmitter = activeOrg?.orgType === 'EMITTER' || user?.roles.includes('emitter');
  const isAdmin = user?.roles.includes('platform_admin') || user?.roles.includes('admin');

  const navSections = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Overview Console', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Supply Marketplace', icon: Factory, path: '/dashboard/marketplace' },
        { label: 'Demand Network', icon: Layers, path: '/requirements' },
        { label: 'CO₂ Stream Listings', icon: Factory, path: '/dashboard/listings', show: isEmitter || isAdmin },
        { label: 'Demand Requirements', icon: Layers, path: '/dashboard/requirements' },
        { label: 'Match Engine', icon: Cpu, path: '/dashboard/matches' },
      ].filter((item) => item.show !== false),
    },
    {
      group: 'OPERATIONS',
      items: [
        { label: 'Offers & Negotiations', icon: Handshake, path: '/dashboard/offers' },
        { label: 'Off-Take Orders', icon: ShoppingBag, path: '/dashboard/orders' },
        { label: 'Logistics Telematics', icon: Truck, path: '/dashboard/shipments' },
      ],
    },
    {
      group: 'INSIGHTS',
      items: [
        { label: 'Impact Analytics', icon: BarChart3, path: '/dashboard/analytics' },
      ],
    },
    {
      group: 'ACCOUNT & SYSTEM',
      items: [
        { label: 'Organization Profile', icon: Building2, path: '/dashboard/organization' },
        { label: 'User Profile', icon: User, path: '/dashboard/settings/profile' },
        { label: 'Security & Sessions', icon: Lock, path: '/dashboard/settings/security' },
      ],
    },
  ];

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'CL';

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-[#F7F5EF] text-[#171A18]">

        {/* Sidebar Navigation */}
        <Sidebar className="border-r border-[#E2DDD5] bg-[#FAF8F5]">
          <SidebarHeader className="p-4 border-b border-[#E2DDD5] bg-[#171A18] text-white">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="size-7 bg-[#173D32] border border-[#3C6E5C] text-white flex items-center justify-center font-mono font-bold text-xs">
                C⟳
              </div>
              <span className="text-base font-black tracking-tight uppercase font-mono text-white">
                CARBON<span className="text-[#A3B899] font-light">LOOP</span>
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-2 space-y-4">
            {navSections.map((sec) => (
              <SidebarGroup key={sec.group}>
                <SidebarGroupLabel className="text-[10px] font-mono uppercase text-[#5C6560] px-2 py-1 font-bold">
                  {sec.group}
                </SidebarGroupLabel>
                <SidebarMenu>
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-none text-xs font-mono font-semibold uppercase tracking-wider transition-colors',
                            isActive
                              ? 'bg-[#173D32] text-white border border-[#173D32]'
                              : 'text-[#5C6560] hover:text-[#171A18] hover:bg-[#EBE7DF]'
                          )}
                          onClick={() => navigate(item.path)}
                        >
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            ))}
          </SidebarContent>

          {/* User Account Footer */}
          <SidebarFooter className="p-4 border-t border-[#E2DDD5] flex flex-col gap-3 bg-[#FAF8F5]">
            <div className="flex items-center gap-3 p-2 bg-[#EBE7DF] border border-[#DCD6C9]">
              <Avatar className="size-8 rounded-none border border-[#173D32]">
                <AvatarFallback className="bg-[#173D32] text-white font-mono font-bold text-xs rounded-none">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-[#171A18] truncate font-mono">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] font-mono text-[#5C6560] truncate">
                  {user?.email}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="w-full bg-[#EBE7DF] hover:bg-[#E2DDD5] text-[#171A18] border-[#DCD6C9] font-mono text-xs font-bold uppercase rounded-none"
            >
              <LogOut className="size-3.5 mr-2" /> End Session
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Topbar */}
          <header className="h-16 border-b border-[#E2DDD5] bg-[#FAF8F5] px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger />

              {/* Organization Selector */}
              {user && user.organizations && user.organizations.length > 0 && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#5C6560] uppercase">ORG:</span>
                  <Select
                    value={activeOrg?.organizationId || ''}
                    onValueChange={(val) => { if (val) switchOrganization(val); }}
                  >
                    <SelectTrigger className="h-8 bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono font-bold text-[#171A18] rounded-none px-3">
                      <SelectValue placeholder="Select Organization" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#FAF8F5] border-[#E2DDD5] text-xs font-mono">
                      {user.organizations.map((org) => (
                        <SelectItem key={org.organizationId} value={org.organizationId}>
                          {org.organizationName} ({org.orgType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-3">
              <div className="relative w-48 md:w-64 hidden md:block">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6560]" />
                <Input
                  placeholder="Search exchange..."
                  className="pl-9 h-8 bg-[#EBE7DF] border-[#DCD6C9] text-xs text-[#171A18] placeholder:text-[#5C6560] font-mono rounded-none focus-visible:ring-[#173D32]"
                />
              </div>

              <Badge variant="outline" className="border-[#173D32] text-[#173D32] bg-[#EBE7DF] font-mono text-[10px] uppercase font-bold rounded-none">
                <ShieldCheck className="size-3 mr-1 text-[#173D32]" />
                {activeOrg ? activeOrg.orgType : 'VERIFIED'}
              </Badge>

              <Button variant="ghost" size="icon" className="relative text-[#171A18] hover:bg-[#EBE7DF] rounded-none size-8">
                <Bell className="size-4 text-[#5C6560]" />
                <span className="size-1.5 bg-[#173D32] absolute top-2 right-2" />
              </Button>
            </div>
          </header>

          {/* Main Page Area */}
          <main className="flex-1 p-6 overflow-y-auto bg-[#F7F5EF]">
            <Outlet />
          </main>
        </div>

      </div>
    </SidebarProvider>
  );
};
