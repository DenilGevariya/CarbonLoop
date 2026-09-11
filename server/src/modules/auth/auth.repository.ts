import { query } from '../../config/database';
import { AuthenticatedUser, AuthSession, UserOrgPayload } from './auth.types';

export class AuthRepository {
  async findUserByEmail(email: string) {
    const res = await query(
      `SELECT id, email, password_hash, first_name, last_name, phone, avatar_url, is_active, is_verified, onboarding_completed_at
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return res.rows[0] || null;
  }

  async findUserById(userId: string) {
    const res = await query(
      `SELECT id, email, password_hash, first_name, last_name, phone, avatar_url, is_active, is_verified, onboarding_completed_at
       FROM users WHERE id = $1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  }) {
    const res = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active, is_verified)
       VALUES ($1, $2, $3, $4, $5, TRUE, FALSE)
       RETURNING id, email, first_name, last_name, phone, is_active, is_verified, created_at`,
      [data.email.toLowerCase(), data.passwordHash, data.firstName, data.lastName, data.phone || null]
    );
    return res.rows[0];
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const res = await query(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );
    return res.rows.map((row) => row.name);
  }

  async assignUserRole(userId: string, roleName: string) {
    const roleRes = await query(`SELECT id FROM roles WHERE LOWER(name) = LOWER($1)`, [roleName]);
    let roleId = roleRes.rows[0]?.id;

    if (!roleId) {
      const newRoleRes = await query(
        `INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id`,
        [roleName.toLowerCase(), `Role ${roleName}`]
      );
      roleId = newRoleRes.rows[0].id;
    }

    await query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, roleId]
    );
  }

  async getUserOrganizations(userId: string): Promise<UserOrgPayload[]> {
    const res = await query(
      `SELECT 
        o.id as "organizationId",
        o.name as "organizationName",
        o.org_type as "orgType",
        om.role as "memberRole",
        om.is_primary_contact as "isPrimaryContact"
       FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1`,
      [userId]
    );
    return res.rows;
  }

  async createAuthSession(data: {
    userId: string;
    refreshTokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<AuthSession> {
    const res = await query(
      `INSERT INTO auth_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id as "userId", refresh_token_hash as "refreshTokenHash", user_agent as "userAgent", ip_address as "ipAddress", expires_at as "expiresAt", revoked_at as "revokedAt", created_at as "createdAt", last_used_at as "lastUsedAt"`,
      [data.userId, data.refreshTokenHash, data.userAgent || null, data.ipAddress || null, data.expiresAt]
    );
    return res.rows[0];
  }

  async findAuthSessionById(sessionId: string): Promise<AuthSession | null> {
    const res = await query(
      `SELECT id, user_id as "userId", refresh_token_hash as "refreshTokenHash", user_agent as "userAgent", ip_address as "ipAddress", expires_at as "expiresAt", revoked_at as "revokedAt", created_at as "createdAt", last_used_at as "lastUsedAt"
       FROM auth_sessions WHERE id = $1`,
      [sessionId]
    );
    return res.rows[0] || null;
  }

  async findAuthSessionByHash(tokenHash: string): Promise<AuthSession | null> {
    const res = await query(
      `SELECT id, user_id as "userId", refresh_token_hash as "refreshTokenHash", user_agent as "userAgent", ip_address as "ipAddress", expires_at as "expiresAt", revoked_at as "revokedAt", created_at as "createdAt", last_used_at as "lastUsedAt"
       FROM auth_sessions WHERE refresh_token_hash = $1`,
      [tokenHash]
    );
    return res.rows[0] || null;
  }

  async updateSessionLastUsed(sessionId: string, newHash?: string) {
    if (newHash) {
      await query(
        `UPDATE auth_sessions SET last_used_at = NOW(), refresh_token_hash = $2 WHERE id = $1`,
        [sessionId, newHash]
      );
    } else {
      await query(`UPDATE auth_sessions SET last_used_at = NOW() WHERE id = $1`, [sessionId]);
    }
  }

  async revokeAuthSession(sessionId: string) {
    await query(`UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1`, [sessionId]);
  }

  async revokeAllUserSessions(userId: string) {
    await query(`UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, [userId]);
  }

  async getUserSessions(userId: string): Promise<AuthSession[]> {
    const res = await query(
      `SELECT id, user_id as "userId", refresh_token_hash as "refreshTokenHash", user_agent as "userAgent", ip_address as "ipAddress", expires_at as "expiresAt", revoked_at as "revokedAt", created_at as "createdAt", last_used_at as "lastUsedAt"
       FROM auth_sessions 
       WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
       ORDER BY last_used_at DESC`,
      [userId]
    );
    return res.rows;
  }

  async markOnboardingCompleted(userId: string) {
    await query(`UPDATE users SET onboarding_completed_at = NOW() WHERE id = $1`, [userId]);
  }

  async updateUserPassword(userId: string, newPasswordHash: string) {
    await query(`UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`, [userId, newPasswordHash]);
  }

  async updateUserProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string | null; avatarUrl?: string | null }) {
    const res = await query(
      `UPDATE users 
       SET first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           phone = COALESCE($4, phone),
           avatar_url = COALESCE($5, avatar_url),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, first_name as "firstName", last_name as "lastName", phone, avatar_url as "avatarUrl"`,
      [userId, data.firstName || null, data.lastName || null, data.phone || null, data.avatarUrl || null]
    );
    return res.rows[0];
  }
}
