import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GlobalCommandSearch } from '@/features/admin/components/GlobalCommandSearch';
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
  Handshake,
  ShoppingBag,
  Truck,
  BarChart3,
  Bell,
  Search,
  LogOut,
  ShieldCheck,
  User,
  MessageSquare,
  PlusCircle,
} from 'lucide-react';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { cn } from '@/lib/utils';

const DashboardInner: React.FC = () => {
  const { user, activeOrg, logout, switchOrganization } = useAuth();
  const { unreadCount } = useNotifications();
  const { setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(true);
  };

  const orgType = activeOrg?.orgType?.toUpperCase() || 'EMITTER';
  const isUtilizer = orgType === 'BUYER' || orgType === 'UTILIZER';
  const isLogistics = orgType === 'LOGISTICS_PROVIDER';
  const isRegulator = orgType === 'REGULATOR';
  const isAdmin = (user?.roles || []).some(
    (r) => r.toLowerCase() === 'platform_admin' || r.toLowerCase() === 'admin'
  );

  let navSections: {
    group: string;
    items: { label: string; icon: React.ElementType; path: string }[];
  }[] = [];

  if (isAdmin) {
    navSections = [
      {
        group: 'ADMIN PANEL',
        items: [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
          { label: 'User Management', icon: User, path: '/admin/users' },
          { label: 'CO₂ Listing Management', icon: Factory, path: '/admin/listings' },
          { label: 'Verification & Certificates', icon: ShieldCheck, path: '/admin/verification' },
          { label: 'Transaction Monitoring', icon: ShoppingBag, path: '/admin/transactions' },
          { label: 'Shipment Monitoring', icon: Truck, path: '/admin/shipments' },
          { label: 'Complaints & Disputes', icon: MessageSquare, path: '/admin/disputes' },
          { label: 'Reports & Analytics', icon: BarChart3, path: '/admin/analytics' },
        ],
      },
    ];
  } else if (isRegulator) {
    navSections = [
      {
        group: 'POLICY REGULATORS',
        items: [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Verification & Oversight', icon: ShieldCheck, path: '/admin/verification' },
        ],
      },
    ];
  } else if (isLogistics) {
    navSections = [
      {
        group: 'LOGISTICS PROVIDERS',
        items: [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/logistics' },
          { label: 'Transportation Request', icon: Truck, path: '/logistics/requests' },
          { label: 'Shipment Management', icon: Truck, path: '/logistics/shipments' },
        ],
      },
    ];
  } else if (isUtilizer) {
    navSections = [
      {
        group: 'CARBON-UTILIZATION STARTUPS',
        items: [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Buy CO₂', icon: PlusCircle, path: '/dashboard/requirements/new' },
          { label: 'Inquiries & Offers', icon: Handshake, path: '/dashboard/offers' },
          { label: 'Shipment Tracking', icon: Truck, path: '/dashboard/shipments' },
        ],
      },
    ];
  } else {
    // Default: Industrial Carbon Emitters
    navSections = [
      {
        group: 'INDUSTRIAL CARBON EMITTERS',
        items: [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { label: 'Sell CO₂', icon: PlusCircle, path: '/dashboard/listings/new' },
          { label: 'Inquiries & Offers', icon: Handshake, path: '/dashboard/offers' },
          { label: 'Transporters', icon: Truck, path: '/dashboard/logistics' },
          { label: 'Shipment Tracking', icon: Truck, path: '/dashboard/shipments' },
        ],
      },
    ];
  }

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
          <div
            onClick={() => handleNavClick('/dashboard/settings/profile')}
            className="flex items-center gap-3 p-2.5 bg-[#F6F9FC] hover:bg-[#ECF2FF] border border-[#E5EAEF] hover:border-[#5D87FF]/40 rounded-lg cursor-pointer transition-all group"
            title="Manage Profile Settings"
          >
            <Avatar className="size-9 rounded-full border border-[#5D87FF] group-hover:scale-105 transition-transform shrink-0">
              <AvatarFallback className="bg-[#5D87FF] text-white font-bold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-[#2A3547] group-hover:text-[#5D87FF] truncate transition-colors">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[11px] text-[#5A6A85] truncate">
                {user?.email}
              </span>
            </div>
            <User className="size-4 text-[#5A6A85] group-hover:text-[#5D87FF] shrink-0" />
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
            {/* Desktop / Tablet Search Input */}
            <form onSubmit={handleHeaderSearchSubmit} className="relative w-40 sm:w-60 md:w-72 hidden sm:flex items-center">
              <Search
                className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A85] cursor-pointer hover:text-[#5D87FF] transition-colors"
                onClick={() => setIsSearchOpen(true)}
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search exchange... (Ctrl+K)"
                className="pl-9 pr-12 h-9 bg-[#F6F9FC] border-[#E5EAEF] text-xs text-[#2A3547] placeholder:text-[#5A6A85] rounded-lg focus-visible:ring-[#5D87FF] cursor-text"
              />
              <kbd className="hidden lg:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 pointer-events-none px-1.5 py-0.5 text-[10px] font-semibold text-[#5A6A85] bg-white border border-[#E5EAEF] rounded shadow-2xs">
                ⌘K
              </kbd>
            </form>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden text-[#5A6A85] hover:text-[#5D87FF] hover:bg-[#ECF2FF] rounded-lg size-8 cursor-pointer shrink-0"
              title="Search Exchange"
            >
              <Search className="size-4" />
            </Button>

            <Badge variant="outline" className="border-[#5D87FF]/30 text-[#5D87FF] bg-[#ECF2FF] text-[10px] sm:text-xs font-bold rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 truncate">
              <ShieldCheck className="size-3 sm:size-3.5 mr-1 text-[#5D87FF] shrink-0" />
              {isAdmin ? 'ADMIN' : isLogistics ? 'LOGISTICS PROVIDER' : activeOrg ? activeOrg.orgType : 'VERIFIED'}
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

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/settings/profile')}
              className="text-[#5A6A85] hover:text-[#5D87FF] hover:bg-[#ECF2FF] rounded-lg size-8 sm:size-9 cursor-pointer shrink-0"
              title="My Profile"
            >
              <User className="size-4" />
            </Button>
          </div>
        </header>

        {/* Main Page Area */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto bg-[#F6F9FC]">
          <Outlet />
        </main>
      </div>

      {/* Global Command Search Overlay */}
      <GlobalCommandSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchQuery}
      />
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
