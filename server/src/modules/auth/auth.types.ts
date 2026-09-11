import { Request } from 'express';

export interface UserRolePayload {
  roleId: string;
  roleName: string;
}

export interface UserOrgPayload {
  organizationId: string;
  organizationName: string;
  orgType: string;
  memberRole: string;
  isPrimaryContact: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  sessionId: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  isVerified: boolean;
  onboardingCompletedAt?: Date | string | null;
  roles: string[];
  organizations: UserOrgPayload[];
  activeOrganizationId?: string | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  lastUsedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  sessionId?: string;
  token?: string;
}
