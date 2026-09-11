import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setMemoryToken } from '@/lib/api';

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
    } else {
      setActiveOrg(null);
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
    setUser(null);
    setActiveOrg(null);
    setIsAuthenticated(false);
    setOnboardingRequired(false);
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
        <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 bg-[#173D32] border border-[#3C6E5C] text-white flex items-center justify-center font-mono font-bold text-sm animate-pulse">
              C⟳
            </div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#173D32]">
              AUTHENTICATING CONSOLE SESSION...
            </span>
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
