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
  SidebarTrigger,
  useSidebar
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
  MessageSquare,
} from 'lucide-react';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { cn } from '@/lib/utils';

const DashboardInner: React.FC = () => {
  const { user, activeOrg, logout, switchOrganization } = useAuth();
  const { unreadCount } = useNotifications();
  const { setOpenMobile, isMobile } = useSidebar();
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
        { label: 'Commercial Inquiries', icon: MessageSquare, path: '/dashboard/inquiries' },
        { label: 'Offers & Proposals', icon: Handshake, path: '/dashboard/offers' },
        { label: 'Off-Take Orders', icon: ShoppingBag, path: '/dashboard/orders' },
        { label: 'Logistics Network', icon: Truck, path: '/dashboard/logistics' },
        { label: 'Shipment Tracking', icon: Truck, path: '/dashboard/shipments' },
      ],
    },
    {
      group: 'INSIGHTS',
      items: [
        { label: 'Impact Analytics', icon: BarChart3, path: '/dashboard/analytics' },
        { label: 'Impact Intelligence', icon: ShieldCheck, path: '/dashboard/impact' },
        { label: 'Trust & Verification', icon: ShieldCheck, path: '/dashboard/organization/verification' },
        { label: 'Reviewer Queue', icon: ShieldCheck, path: '/admin/verification', show: isAdmin },
      ].filter((item) => item.show !== false),
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

  const handleNavClick = (path: string) => {
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen flex w-full bg-[#F6F9FC] text-[#2A3547] font-sans">
      {/* Modernize Sidebar Navigation */}
      <Sidebar className="border-r border-[#E5EAEF] bg-white">
        <SidebarHeader className="p-4 sm:p-5 border-b border-[#E5EAEF] bg-white">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="CarbonLoop Logo"
              className="size-9 rounded-lg object-contain bg-[#0E110F] p-1 border border-[#E5EAEF] shadow-xs shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#2A3547]">
                CARBON<span className="text-[#5D87FF]">LOOP</span>
              </span>
              <span className="text-[10px] text-[#5A6A85] font-medium tracking-wide">
                INDUSTRIAL NETWORK
              </span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="p-3 sm:p-4 space-y-4">
          {navSections.map((sec) => (
            <SidebarGroup key={sec.group}>
              <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-[#5A6A85] px-3 py-1.5 mb-1">
                {sec.group}
              </SidebarGroupLabel>
              <SidebarMenu className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 h-10 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer',
                          isActive
                            ? 'bg-[#ECF2FF] text-[#5D87FF] font-bold shadow-xs'
                            : 'text-[#2A3547] hover:text-[#5D87FF] hover:bg-[#F6F9FC]'
                        )}
                        onClick={() => handleNavClick(item.path)}
                      >
                        <Icon className={cn("size-4 shrink-0", isActive ? "text-[#5D87FF]" : "text-[#5A6A85]")} />
                        <span className="truncate">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* User Account Footer */}
        <SidebarFooter className="p-4 border-t border-[#E5EAEF] flex flex-col gap-3 bg-white">
          <div className="flex items-center gap-3 p-2.5 bg-[#F6F9FC] border border-[#E5EAEF] rounded-lg">
            <Avatar className="size-9 rounded-full border border-[#5D87FF]">
              <AvatarFallback className="bg-[#5D87FF] text-white font-bold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-[#2A3547] truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[11px] text-[#5A6A85] truncate">
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
            className="w-full bg-white hover:bg-[#FDEDE8] text-[#FA896B] border-[#FA896B]/30 hover:border-[#FA896B] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="size-3.5 mr-2" /> End Session
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#E5EAEF] bg-white px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-4">
            <SidebarTrigger className="text-[#5A6A85] hover:text-[#5D87FF] hover:bg-[#ECF2FF] rounded-lg" />

            {/* Organization Selector */}
            {user && user.organizations && user.organizations.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="hidden sm:inline text-xs text-[#5A6A85] font-semibold">ORG:</span>
                <Select
                  value={activeOrg?.organizationId || ''}
                  onValueChange={(val) => { if (val) switchOrganization(val); }}
                >
                  <SelectTrigger className="h-8 sm:h-9 max-w-[140px] sm:max-w-[220px] bg-[#F6F9FC] border-[#E5EAEF] text-xs font-bold text-[#2A3547] rounded-lg px-2.5 sm:px-3 hover:border-[#5D87FF] truncate">
                    <SelectValue placeholder="Select Org" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5EAEF] text-xs">
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
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-48 md:w-64 hidden lg:block">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
              <Input
                placeholder="Search exchange..."
                className="pl-9 h-9 bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] placeholder:text-[#5A6A85] rounded-lg focus-visible:ring-[#5D87FF]"
              />
            </div>

            <Badge variant="outline" className="border-[#5D87FF]/30 text-[#5D87FF] bg-[#ECF2FF] text-[10px] sm:text-xs font-bold rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 truncate">
              <ShieldCheck className="size-3 sm:size-3.5 mr-1 text-[#5D87FF] shrink-0" />
              {activeOrg ? activeOrg.orgType : 'VERIFIED'}
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/notifications')}
              className="relative text-[#5A6A85] hover:text-[#5D87FF] hover:bg-[#ECF2FF] rounded-lg size-8 sm:size-9 cursor-pointer shrink-0"
              title="Notifications"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 size-2 bg-[#FA896B] rounded-full ring-2 ring-white animate-pulse" />
              )}
            </Button>
          </div>
        </header>

        {/* Main Page Area */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto bg-[#F6F9FC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const DashboardLayout: React.FC = () => {
  return (
    <SidebarProvider defaultOpen>
      <DashboardInner />
    </SidebarProvider>
  );
};

export default DashboardLayout;
