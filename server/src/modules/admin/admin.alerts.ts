import { query } from '../../config/database';
import { SystemAlertRecord } from './admin.types';

export class AdminAlertsService {
  public async getAlerts(isResolved: boolean = false): Promise<SystemAlertRecord[]> {
    // 1. Generate real-time deterministic operational alerts
    await this.generateDeterministicAlerts();

    const sql = `
      SELECT 
        sa.id,
        sa.title,
        sa.severity,
        sa.category,
        sa.entity_type as "entityType",
        sa.entity_id as "entityId",
        sa.entity_identifier as "entityIdentifier",
        sa.message,
        sa.is_resolved as "isResolved",
        sa.resolved_by as "resolvedBy",
        CONCAT(u.first_name, ' ', u.last_name) as "resolvedByName",
        sa.resolved_at as "resolvedAt",
        sa.resolution_notes as "resolutionNotes",
        sa.created_at as "createdAt"
      FROM system_alerts sa
      LEFT JOIN users u ON sa.resolved_by = u.id
      WHERE sa.is_resolved = $1
      ORDER BY 
        CASE sa.severity
          WHEN 'CRITICAL' THEN 1
          WHEN 'WARNING' THEN 2
          ELSE 3
        END,
        sa.created_at DESC
      LIMIT 50
    `;

    const res = await query(sql, [isResolved]);
    return res.rows;
  }

  public async resolveAlert(alertId: string, adminUserId: string, notes?: string): Promise<SystemAlertRecord> {
    const res = await query(
      `UPDATE system_alerts 
       SET is_resolved = TRUE, resolved_by = $2, resolved_at = NOW(), resolution_notes = $3
       WHERE id = $1
       RETURNING *`,
      [alertId, adminUserId, notes || 'Alert marked resolved by admin.']
    );

    if (res.rows.length === 0) {
      throw new Error(`System alert with ID ${alertId} not found.`);
    }

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, actor_user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $1, 'ADMIN_ALERT_RESOLVED', 'SYSTEM_ALERT', $2, $3)`,
      [adminUserId, alertId, JSON.stringify({ notes })]
    );

    return res.rows[0];
  }

  private async generateDeterministicAlerts(): Promise<void> {
    try {
      // Check 1: Shipment Exceptions
      const shpRes = await query(
        `SELECT id, shipment_number FROM shipments WHERE status = 'EXCEPTION' LIMIT 5`
      );
      for (const shp of shpRes.rows) {
        await query(
          `INSERT INTO system_alerts (title, severity, category, entity_type, entity_id, entity_identifier, message)
           VALUES ($1, 'CRITICAL', 'LOGISTICS', 'SHIPMENT', $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [
            `Shipment Exception Reported (${shp.shipment_number})`,
            shp.id,
            shp.shipment_number,
            `Shipment ${shp.shipment_number} reported a delay or exception event. Immediate reviewer attention requested.`,
          ]
        );
      }

      // Check 2: Verifications Expiring within 30 days
      const verifRes = await query(
        `SELECT id, organization_id, verification_type FROM verification_requests 
         WHERE status = 'VERIFIED' AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '30 days' LIMIT 5`
      );
      for (const v of verifRes.rows) {
        await query(
          `INSERT INTO system_alerts (title, severity, category, entity_type, entity_id, message)
           VALUES ($1, 'WARNING', 'VERIFICATION', 'VERIFICATION_REQUEST', $2, $3)
           ON CONFLICT DO NOTHING`,
          [
            `Verification Expiring Soon (${v.verification_type})`,
            v.id,
            `Verification request ${v.id.substring(0, 8)} is expiring within 30 days. Re-verification review advised.`,
          ]
        );
      }
    } catch {
      // Ignore background generation errors
    }
  }
}
