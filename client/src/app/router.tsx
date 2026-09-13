import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Route Guards
import { ProtectedRoute, PublicOnlyRoute, RoleRoute } from '@/components/routes/ProtectedRoutes';

// Public Pages
import LandingPage from '@/pages/public/LandingPage';
import { MarketplacePage } from '@/pages/public/MarketplacePage';
import { ListingDetailPage } from '@/pages/public/ListingDetailPage';
import { DemandMarketplacePage } from '@/pages/public/DemandMarketplacePage';
import { RequirementDetailPage } from '@/pages/public/RequirementDetailPage';
import { HowItWorksPage } from '@/pages/public/HowItWorksPage';
import { PublicImpactPage } from '@/pages/public/PublicImpactPage';
import { PublicOrganizationPage } from '@/pages/public/PublicOrganizationPage';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from '@/pages/admin/AdminUserDetailPage';
import AdminListingsPage from '@/pages/admin/AdminListingsPage';
import AdminVerificationPage from '@/pages/admin/AdminVerificationPage';
import AdminVerificationDetailPage from '@/pages/admin/AdminVerificationDetailPage';
import AdminTransactionsPage from '@/pages/admin/AdminTransactionsPage';
import AdminShipmentsPage from '@/pages/admin/AdminShipmentsPage';
import { AdminDisputesPage } from '@/pages/admin/AdminDisputesPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';

// Trust Network & Verification Pages
import OrganizationVerificationPage from '@/pages/dashboard/OrganizationVerificationPage';

// Auth & Onboarding Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { OnboardingPage } from '@/pages/auth/OnboardingPage';

// Dashboard & Role Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ListingsPage from '@/pages/dashboard/ListingsPage';
import CreateListingPage from '@/pages/dashboard/CreateListingPage';
import EditListingPage from '@/pages/dashboard/EditListingPage';
import RequirementsPage from '@/pages/dashboard/RequirementsPage';
import CreateRequirementPage from '@/pages/dashboard/CreateRequirementPage';
import { EditRequirementPage } from '@/pages/dashboard/EditRequirementPage';
import MatchesPage from '@/pages/dashboard/MatchesPage';
import InquiriesPage from '@/pages/dashboard/InquiriesPage';
import InquiryDetailPage from '@/pages/dashboard/InquiryDetailPage';
import OffersPage from '@/pages/dashboard/OffersPage';
import OfferDetailPage from '@/pages/dashboard/OfferDetailPage';
import OrdersPage from '@/pages/dashboard/OrdersPage';
import OrderDetailPage from '@/pages/dashboard/OrderDetailPage';
import NotificationsPage from '@/pages/dashboard/NotificationsPage';
import { ShipmentsPage } from '@/pages/dashboard/ShipmentsPage';
import { ShipmentDetailPage } from '@/pages/dashboard/ShipmentDetailPage';
import { LogisticsDashboardPage } from '@/pages/dashboard/LogisticsDashboardPage';
import TransportationRequestsPage from '@/pages/dashboard/TransportationRequestsPage';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';
import ImpactReportPage from '@/pages/dashboard/ImpactReportPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import { OrganizationPage } from '@/pages/dashboard/OrganizationPage';
import { ProfilePage } from '@/pages/dashboard/settings/ProfilePage';
import { SecurityPage } from '@/pages/dashboard/settings/SecurityPage';

// Not Found
import NotFoundPage from '@/pages/not-found/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'marketplace/:listingCode', element: <ListingDetailPage /> },
      { path: 'requirements', element: <DemandMarketplacePage /> },
      { path: 'requirements/:requirementCode', element: <RequirementDetailPage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'impact', element: <PublicImpactPage /> },
      { path: 'organizations/:slug', element: <PublicOrganizationPage /> },
    ],
  },

  // Single Protected Admin Console (Single Sidebar)
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <RoleRoute allowedRoles={['platform_admin']}><AdminDashboardPage /></RoleRoute> },
          { path: 'users', element: <RoleRoute allowedRoles={['platform_admin']}><AdminUsersPage /></RoleRoute> },
          { path: 'users/:id', element: <RoleRoute allowedRoles={['platform_admin']}><AdminUserDetailPage /></RoleRoute> },
          { path: 'listings', element: <RoleRoute allowedRoles={['platform_admin']}><AdminListingsPage /></RoleRoute> },
          { path: 'verification', element: <RoleRoute allowedRoles={['platform_admin', 'regulator']}><AdminVerificationPage /></RoleRoute> },
          { path: 'verification/:id', element: <RoleRoute allowedRoles={['platform_admin', 'regulator']}><AdminVerificationDetailPage /></RoleRoute> },
          { path: 'transactions', element: <RoleRoute allowedRoles={['platform_admin', 'regulator']}><AdminTransactionsPage /></RoleRoute> },
          { path: 'shipments', element: <RoleRoute allowedRoles={['platform_admin']}><AdminShipmentsPage /></RoleRoute> },
          { path: 'disputes', element: <RoleRoute allowedRoles={['platform_admin']}><AdminDisputesPage /></RoleRoute> },
          { path: 'analytics', element: <RoleRoute allowedRoles={['platform_admin']}><AdminAnalyticsPage /></RoleRoute> },
        ],
      },
    ],
  },

  // Logistics Provider Console
  {
    path: '/logistics',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <RoleRoute allowedRoles={['logistics_provider']}><LogisticsDashboardPage /></RoleRoute> },
          { path: 'requests', element: <RoleRoute allowedRoles={['logistics_provider']}><TransportationRequestsPage /></RoleRoute> },
          { path: 'shipments', element: <RoleRoute allowedRoles={['logistics_provider']}><ShipmentsPage /></RoleRoute> },
          { path: 'shipments/:shipmentNumber', element: <RoleRoute allowedRoles={['logistics_provider']}><ShipmentDetailPage /></RoleRoute> },
        ],
      },
    ],
  },

  // Public-only Auth routes
  {
    path: '/',
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },

  // Protected Onboarding
  {
    path: '/onboarding',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <OnboardingPage /> },
    ],
  },

  // Protected Dashboard Application Shell (Emitter / Buyer / Regulator)
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <RoleRoute allowedRoles={['emitter', 'utilizer', 'logistics_provider', 'regulator']}><DashboardPage /></RoleRoute> },
          { path: 'marketplace', element: <RoleRoute allowedRoles={['emitter', 'utilizer', 'regulator']}><MarketplacePage /></RoleRoute> },
          { path: 'marketplace/:listingCode', element: <RoleRoute allowedRoles={['emitter', 'utilizer', 'regulator']}><ListingDetailPage /></RoleRoute> },
          { path: 'requirements/marketplace', element: <RoleRoute allowedRoles={['emitter', 'utilizer', 'regulator']}><DemandMarketplacePage /></RoleRoute> },
          { path: 'listings', element: <RoleRoute allowedRoles={['emitter']}><ListingsPage /></RoleRoute> },
          { path: 'listings/new', element: <RoleRoute allowedRoles={['emitter']}><CreateListingPage /></RoleRoute> },
          { path: 'listings/:id/edit', element: <RoleRoute allowedRoles={['emitter']}><EditListingPage /></RoleRoute> },
          { path: 'requirements', element: <RoleRoute allowedRoles={['utilizer']}><RequirementsPage /></RoleRoute> },
          { path: 'requirements/new', element: <RoleRoute allowedRoles={['utilizer']}><CreateRequirementPage /></RoleRoute> },
          { path: 'requirements/:id/edit', element: <RoleRoute allowedRoles={['utilizer']}><EditRequirementPage /></RoleRoute> },
          { path: 'matches', element: <RoleRoute allowedRoles={['utilizer']}><MatchesPage /></RoleRoute> },
          { path: 'inquiries', element: <RoleRoute allowedRoles={['emitter', 'utilizer']}><InquiriesPage /></RoleRoute> },
          { path: 'inquiries/:id', element: <RoleRoute allowedRoles={['emitter', 'utilizer']}><InquiryDetailPage /></RoleRoute> },
          { path: 'offers', element: <RoleRoute allowedRoles={['emitter', 'utilizer']}><OffersPage /></RoleRoute> },
          { path: 'offers/:id', element: <RoleRoute allowedRoles={['emitter', 'utilizer']}><OfferDetailPage /></RoleRoute> },
          { path: 'orders', element: <RoleRoute allowedRoles={['emitter', 'utilizer']}><OrdersPage /></RoleRoute> },
          { path: 'orders/:id', element: <RoleRoute allowedRoles={['emitter', 'utilizer']}><OrderDetailPage /></RoleRoute> },
          { path: 'notifications', element: <RoleRoute allowedRoles={['emitter', 'utilizer', 'logistics_provider', 'regulator']}><NotificationsPage /></RoleRoute> },
          { path: 'logistics', element: <RoleRoute allowedRoles={['emitter']}><LogisticsDashboardPage /></RoleRoute> },
          { path: 'shipments', element: <RoleRoute allowedRoles={['emitter', 'utilizer']}><ShipmentsPage /></RoleRoute> },
          { path: 'shipments/:shipmentNumber', element: <RoleRoute allowedRoles={['emitter', 'utilizer']}><ShipmentDetailPage /></RoleRoute> },
          { path: 'analytics', element: <RoleRoute allowedRoles={['emitter', 'logistics_provider']}><AnalyticsPage /></RoleRoute> },
          { path: 'impact', element: <RoleRoute allowedRoles={['utilizer', 'regulator']}><ImpactReportPage /></RoleRoute> },
          { path: 'organization', element: <RoleRoute allowedRoles={['emitter', 'utilizer', 'logistics_provider', 'regulator']}><OrganizationPage /></RoleRoute> },
          { path: 'organization/verification', element: <RoleRoute allowedRoles={['emitter', 'utilizer', 'logistics_provider', 'regulator']}><OrganizationVerificationPage /></RoleRoute> },
          { path: 'profile', element: <RoleRoute allowedRoles={['emitter', 'utilizer', 'logistics_provider', 'regulator']}><ProfilePage /></RoleRoute> },
          { path: 'settings', element: <RoleRoute allowedRoles={['emitter', 'utilizer', 'logistics_provider', 'regulator']}><SettingsPage /></RoleRoute> },
          { path: 'settings/profile', element: <RoleRoute allowedRoles={['emitter', 'utilizer', 'logistics_provider', 'regulator']}><ProfilePage /></RoleRoute> },
          { path: 'settings/security', element: <RoleRoute allowedRoles={['emitter', 'utilizer', 'logistics_provider', 'regulator']}><SecurityPage /></RoleRoute> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
