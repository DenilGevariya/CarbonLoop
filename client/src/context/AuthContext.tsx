import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest, setActiveOrganizationId, setMemoryToken } from '@/lib/api';

export interface UserOrg {
  organizationId: string;
  organizationName: string;
  orgType: string;
  memberRole: string;
  isPrimaryContact: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  isVerified: boolean;
  onboardingCompletedAt?: string | null;
  roles: string[];
  organizations: UserOrg[];
  activeOrganizationId?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  activeOrg: UserOrg | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingRequired: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  completeOnboarding: (data: any) => Promise<{ success: boolean; error?: string }>;
  switchOrganization: (orgId: string) => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeOrg, setActiveOrg] = useState<UserOrg | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [onboardingRequired, setOnboardingRequired] = useState<boolean>(false);

  const applyUserPayload = (userData: UserProfile) => {
    setUser(userData);
    setIsAuthenticated(true);
    const isOnboarded = !!userData.onboardingCompletedAt || (userData.organizations && userData.organizations.length > 0);
    setOnboardingRequired(!isOnboarded);

    if (userData.organizations && userData.organizations.length > 0) {
      const active = userData.organizations.find((o) => o.organizationId === userData.activeOrganizationId) || userData.organizations[0];
      setActiveOrg(active);
      setActiveOrganizationId(active.organizationId);
    } else {
      setActiveOrg(null);
      setActiveOrganizationId(null);
    }
  };

  const bootstrapSession = async () => {
    setIsLoading(true);
    try {
      // First try refreshing session via HttpOnly cookie
      const refreshRes = await apiRequest('/auth/refresh', { method: 'POST' });
      if (refreshRes.success && refreshRes.data?.accessToken) {
        setMemoryToken(refreshRes.data.accessToken);

        // Fetch user profile
        const meRes = await apiRequest<UserProfile>('/auth/me');
        if (meRes.success && meRes.data) {
          applyUserPayload(meRes.data);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrapSession();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    if (res.success && res.data) {
      setMemoryToken(res.data.accessToken);
      applyUserPayload(res.data.user);
      return { success: true };
    }

    return {
      success: false,
      error: res.error?.message || 'Login failed. Invalid email or password.',
    };
  };

  const register = async (data: any) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      return { success: true, message: res.data.message };
    }

    return {
      success: false,
      error: res.error?.message || 'Registration failed.',
    };
  };

  const logout = async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    setMemoryToken(null);
    setActiveOrganizationId(null);
    setUser(null);
    setActiveOrg(null);
    setIsAuthenticated(false);
    setOnboardingRequired(false);
    queryClient.clear();
  };

  const completeOnboarding = async (orgData: any) => {
    const res = await apiRequest('/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify(orgData),
    });

    if (res.success && res.data?.user) {
      applyUserPayload(res.data.user);
      return { success: true };
    }

    return {
      success: false,
      error: res.error?.message || 'Failed to complete onboarding.',
    };
  };

  const switchOrganization = (orgId: string) => {
    if (user && user.organizations) {
      const found = user.organizations.find((o) => o.organizationId === orgId);
      if (found) {
        setActiveOrg(found);
        setActiveOrganizationId(found.organizationId);
        void queryClient.invalidateQueries({ refetchType: 'all' });
      }
    }
  };

  const refetchUser = async () => {
    const meRes = await apiRequest<UserProfile>('/auth/me');
    if (meRes.success && meRes.data) {
      applyUserPayload(meRes.data);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrg,
        isAuthenticated,
        isLoading,
        onboardingRequired,
        login,
        register,
        logout,
        completeOnboarding,
        switchOrganization,
        refetchUser,
      }}
    >
      {isLoading ? (
        <div className="min-h-screen bg-[#F6F9FC] text-[#2A3547] flex flex-col items-center justify-center p-6 font-sans">
          <div className="bg-white border border-[#E5EAEF] p-8 rounded-2xl shadow-xl flex flex-col items-center gap-5 max-w-sm w-full animate-in fade-in zoom-in duration-300">
            <img
              src="/images/logo.png"
              alt="CarbonLoop Logo"
              className="size-14 object-contain bg-[#0E110F] p-2 rounded-2xl border border-[#5D87FF] shadow-lg animate-bounce"
            />
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-[#2A3547] tracking-tight">
                Authenticating Console Session
              </h3>
              <p className="text-xs font-medium text-[#5A6A85]">
                Verifying cryptographic security token & permissions...
              </p>
            </div>
            <div className="w-full bg-[#ECF2FF] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#5D87FF] h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
