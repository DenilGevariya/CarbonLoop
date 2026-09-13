import bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { AUTH_CONSTANTS, AUTH_ERRORS } from './auth.constants';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
} from './auth.utils';
import { AuthenticatedUser, JWTPayload } from './auth.types';
import { query } from '../../config/database';

export class AuthService {
  private repo = new AuthRepository();

  async register(data: {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    phone?: string | null;
    roleType?: string;
    companyName?: string | null;
    gstNumber?: string | null;
    gstCertificateUrl?: string | null;
    registrationNumber?: string | null;
    otpCode?: string | null;
  }) {
    const existing = await this.repo.findUserByEmail(data.email);
    if (existing) {
      throw { status: 400, ...AUTH_ERRORS.EMAIL_ALREADY_EXISTS };
    }

    const passwordHash = await bcrypt.hash(data.password, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);

    const user = await this.repo.createUser({
      email: data.email,
      passwordHash,
      firstName: data.firstName || 'Member',
      lastName: data.lastName || 'User',
      phone: data.phone,
    });

    const roleName = data.roleType?.toLowerCase() || 'emitter';
    await this.repo.assignUserRole(user.id, roleName);

    const defaultOrgName = data.companyName || `${data.firstName || 'Member'} ${data.roleType || 'Enterprise'}`;
    await this.repo.createDefaultOrganizationForUser(user.id, {
      orgName: defaultOrgName,
      orgType: data.roleType || 'EMITTER',
      gstNumber: data.gstNumber,
      registrationNumber: data.registrationNumber,
    });

    return user;
  }

  async login(
    email: string,
    pass: string,
    userAgent?: string,
    ipAddress?: string
  ) {
    const user = await this.repo.findUserByEmail(email);
    if (!user || !user.is_active) {
      throw { status: 401, ...AUTH_ERRORS.INVALID_CREDENTIALS };
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw { status: 401, ...AUTH_ERRORS.INVALID_CREDENTIALS };
    }

    const roles = await this.repo.getUserRoles(user.id);
    const orgs = await this.repo.getUserOrganizations(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_DAYS);

    // Initial dummy session record to get ID
    const dummyHash = hashRefreshToken(Math.random().toString());
    const session = await this.repo.createAuthSession({
      userId: user.id,
      refreshTokenHash: dummyHash,
      userAgent,
      ipAddress,
      expiresAt,
    });

    // Create Refresh Token containing Session ID
    const refreshToken = generateRefreshToken({ userId: user.id, sessionId: session.id });
    const realHash = hashRefreshToken(refreshToken);

    // Update session record with real hash
    await this.repo.updateSessionLastUsed(session.id, realHash);

    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      sessionId: session.id,
      roles,
    };

    const accessToken = generateAccessToken(jwtPayload);

    const userProfile: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      isActive: user.is_active,
      isVerified: user.is_verified,
      onboardingCompletedAt: user.onboarding_completed_at,
      roles,
      organizations: orgs,
      activeOrganizationId: orgs.length > 0 ? orgs[0].organizationId : null,
    };

    return { accessToken, refreshToken, user: userProfile };
  }

  async refresh(refreshToken: string, userAgent?: string, ipAddress?: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const session = await this.repo.findAuthSessionById(decoded.sessionId);

      if (!session || session.revokedAt || new Date(session.expiresAt) < new Date()) {
        throw { status: 401, ...AUTH_ERRORS.SESSION_EXPIRED };
      }

      const inputHash = hashRefreshToken(refreshToken);
      if (session.refreshTokenHash !== inputHash) {
        // Reuse detection / compromised token -> revoke all user sessions
        await this.repo.revokeAllUserSessions(session.userId);
        throw { status: 401, ...AUTH_ERRORS.SESSION_REVOKED };
      }

      const user = await this.repo.findUserById(session.userId);
      if (!user || !user.is_active) {
        throw { status: 401, ...AUTH_ERRORS.UNAUTHORIZED };
      }

      const roles = await this.repo.getUserRoles(user.id);

      // Rotate Refresh Token
      const newRefreshToken = generateRefreshToken({ userId: user.id, sessionId: session.id });
      const newHash = hashRefreshToken(newRefreshToken);

      await this.repo.updateSessionLastUsed(session.id, newHash);

      const jwtPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        sessionId: session.id,
        roles,
      };

      const accessToken = generateAccessToken(jwtPayload);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (err: any) {
      if (err.status) throw err;
      throw { status: 401, ...AUTH_ERRORS.SESSION_EXPIRED };
    }
  }

  async logout(sessionId?: string) {
    if (sessionId) {
      await this.repo.revokeAuthSession(sessionId);
    }
  }

  async getCurrentUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw { status: 404, ...AUTH_ERRORS.USER_NOT_FOUND };
    }

    const roles = await this.repo.getUserRoles(user.id);
    const orgs = await this.repo.getUserOrganizations(user.id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      isActive: user.is_active,
      isVerified: user.is_verified,
      onboardingCompletedAt: user.onboarding_completed_at,
      roles,
      organizations: orgs,
      activeOrganizationId: orgs.length > 0 ? orgs[0].organizationId : null,
    };
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw { status: 404, ...AUTH_ERRORS.USER_NOT_FOUND };
    }

    const isMatch = await bcrypt.compare(currentPass, user.password_hash);
    if (!isMatch) {
      throw { status: 400, ...AUTH_ERRORS.INVALID_CREDENTIALS };
    }

    const newHash = await bcrypt.hash(newPass, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);
    await this.repo.updateUserPassword(userId, newHash);
    await this.repo.revokeAllUserSessions(userId);
  }

  async getUserSessions(userId: string) {
    return this.repo.getUserSessions(userId);
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.repo.findAuthSessionById(sessionId);
    if (!session || session.userId !== userId) {
      throw { status: 404, message: 'Session not found or forbidden.' };
    }
    await this.repo.revokeAuthSession(sessionId);
  }

  async completeOnboarding(userId: string, data: any) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw { status: 404, ...AUTH_ERRORS.USER_NOT_FOUND };
    }

    const slug = data.orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);
    const normalizedOrgType = (data.orgType || 'EMITTER').toUpperCase();
    const mappedRole = normalizedOrgType === 'BUYER' ? 'utilizer' : normalizedOrgType === 'LOGISTICS_PROVIDER' ? 'logistics_provider' : normalizedOrgType === 'REGULATOR' ? 'regulator' : 'emitter';

    const client = await query(
      `INSERT INTO organizations (name, legal_name, slug, org_type, industry, registration_number, website, phone, tax_identifier, state, city, postal_code, address_line1, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PENDING')
       RETURNING id, name, slug, org_type`,
      [
        data.orgName,
        data.legalName || data.orgName,
        slug,
        normalizedOrgType,
        data.industry || 'Industrial Manufacturing',
        data.registrationNumber || null,
        data.website || null,
        data.phone || null,
        data.taxIdentifier || null,
        data.state,
        data.city,
        data.postalCode,
        data.addressLine1,
      ]
    );

    const org = client.rows[0];

    // Create primary organization membership
    await query(
      `INSERT INTO organization_members (organization_id, user_id, role, job_title, is_primary_contact)
       VALUES ($1, $2, 'OWNER', $3, TRUE)
       ON CONFLICT (organization_id, user_id) DO NOTHING`,
      [org.id, userId, data.userRoleTitle || 'Organization Administrator']
    );

    // Assign role to user
    await this.repo.assignUserRole(userId, mappedRole);

    // Mark onboarding completed
    await this.repo.markOnboardingCompleted(userId);

    return this.getCurrentUser(userId);
  }
}
