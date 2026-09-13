import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Route Guards
import { ProtectedRoute, PublicOnlyRoute } from '@/components/routes/ProtectedRoutes';

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
          { index: true, element: <AdminDashboardPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'users/:id', element: <AdminUserDetailPage /> },
          { path: 'listings', element: <AdminListingsPage /> },
          { path: 'verification', element: <AdminVerificationPage /> },
          { path: 'verification/:id', element: <AdminVerificationDetailPage /> },
          { path: 'transactions', element: <AdminTransactionsPage /> },
          { path: 'shipments', element: <AdminShipmentsPage /> },
          { path: 'disputes', element: <AdminDisputesPage /> },
          { path: 'analytics', element: <AdminAnalyticsPage /> },
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
          { index: true, element: <LogisticsDashboardPage /> },
          { path: 'requests', element: <TransportationRequestsPage /> },
          { path: 'shipments', element: <ShipmentsPage /> },
          { path: 'shipments/:shipmentNumber', element: <ShipmentDetailPage /> },
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
          { index: true, element: <DashboardPage /> },
          { path: 'marketplace', element: <MarketplacePage /> },
          { path: 'marketplace/:listingCode', element: <ListingDetailPage /> },
          { path: 'listings', element: <ListingsPage /> },
          { path: 'listings/new', element: <CreateListingPage /> },
          { path: 'listings/:id/edit', element: <EditListingPage /> },
          { path: 'requirements', element: <RequirementsPage /> },
          { path: 'requirements/new', element: <CreateRequirementPage /> },
          { path: 'requirements/:id/edit', element: <EditRequirementPage /> },
          { path: 'matches', element: <MatchesPage /> },
          { path: 'inquiries', element: <InquiriesPage /> },
          { path: 'inquiries/:id', element: <InquiryDetailPage /> },
          { path: 'offers', element: <OffersPage /> },
          { path: 'offers/:id', element: <OfferDetailPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'logistics', element: <LogisticsDashboardPage /> },
          { path: 'shipments', element: <ShipmentsPage /> },
          { path: 'shipments/:shipmentNumber', element: <ShipmentDetailPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'impact', element: <ImpactReportPage /> },
          { path: 'organization', element: <OrganizationPage /> },
          { path: 'organization/verification', element: <OrganizationVerificationPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'settings/profile', element: <ProfilePage /> },
          { path: 'settings/security', element: <SecurityPage /> },
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
