import { AdminRepository } from './admin.repository';
import { AdminAlertsService } from './admin.alerts';
import { checkNetworkHealth } from './admin.health';
import { searchGlobalAdmin } from './admin.search';

export class AdminService {
  private repo = new AdminRepository();
  private alertsService = new AdminAlertsService();

  public async getOverviewKPIs() {
    return this.repo.getOverviewKPIs();
  }

  public async getNetworkHealth() {
    return checkNetworkHealth();
  }

  public async searchGlobal(searchQuery: string) {
    return searchGlobalAdmin(searchQuery);
  }

  public async listAlerts(isResolved?: boolean) {
    return this.alertsService.getAlerts(isResolved);
  }

  public async resolveAlert(alertId: string, adminUserId: string, notes?: string) {
    return this.alertsService.resolveAlert(alertId, adminUserId, notes);
  }

  public async listOrganizations(params: {
    type?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.repo.listOrganizations(params);
  }

  public async getOrganizationDetail(id: string) {
    return this.repo.getOrganizationDetail(id);
  }

  public async setOrganizationStatus(id: string, status: string, adminUserId: string, reason?: string) {
    return this.repo.setOrganizationStatus(id, status, adminUserId, reason);
  }

  public async listUsers(params: {
    role?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.repo.listUsers(params);
  }

  public async getUserDetail(id: string) {
    return this.repo.getUserDetail(id);
  }

  public async toggleUserActive(userId: string, isActive: boolean, adminUserId: string) {
    return this.repo.toggleUserActive(userId, isActive, adminUserId);
  }

  public async listUserSessions(userId: string) {
    return this.repo.listUserSessions(userId);
  }

  public async revokeUserSession(sessionId: string, adminUserId: string) {
    return this.repo.revokeUserSession(sessionId, adminUserId);
  }

  public async getMatchDebugDetail(matchId: string) {
    return this.repo.getMatchDebugDetail(matchId);
  }

  public async listAuditLogs(params: {
    actorId?: string;
    organizationId?: string;
    entityType?: string;
    action?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.repo.listAuditLogs(params);
  }
}
