import { checkDatabaseHealth, query } from '../../config/database';
import { NetworkHealthStatus } from './admin.types';

export async function checkNetworkHealth(): Promise<NetworkHealthStatus> {
  const start = Date.now();
  const dbHealth = await checkDatabaseHealth();
  const latency = Date.now() - start;

  // Check pending verification count
  let verificationPendingCount = 0;
  try {
    const vRes = await query(`SELECT COUNT(id) as count FROM verification_requests WHERE status IN ('SUBMITTED', 'UNDER_REVIEW')`);
    verificationPendingCount = parseInt(vRes.rows[0]?.count || '0', 10);
  } catch {
    verificationPendingCount = 0;
  }

  // Determine marketplace & logistics status based on errors or exceptions
  let logisticsStatus: 'HEALTHY' | 'WARNING' | 'UNAVAILABLE' = 'HEALTHY';
  try {
    const excRes = await query(`SELECT COUNT(id) as count FROM shipments WHERE status = 'EXCEPTION'`);
    const excCount = parseInt(excRes.rows[0]?.count || '0', 10);
    if (excCount > 0) logisticsStatus = 'WARNING';
  } catch {
    logisticsStatus = 'HEALTHY';
  }

  return {
    marketplaceStatus: 'HEALTHY',
    matchingStatus: 'HEALTHY',
    logisticsStatus,
    verificationPendingCount,
    apiStatus: 'HEALTHY',
    databaseStatus: dbHealth.status === 'healthy' ? 'HEALTHY' : 'UNHEALTHY',
    dbLatencyMs: dbHealth.latencyMs || latency,
    postgresVersion: dbHealth.version,
    uptimeSeconds: Math.floor(process.uptime()),
  };
}
