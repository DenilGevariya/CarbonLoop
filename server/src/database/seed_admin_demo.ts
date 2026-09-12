import { query } from '../config/database';

export async function seedAdminDemo() {
  console.log('🌱 Seeding CarbonLoop Admin Command Center Demo Data...');

  // Get admin user
  const adminUserRes = await query(`SELECT u.id, om.organization_id FROM users u LEFT JOIN organization_members om ON u.id = om.user_id WHERE u.email LIKE '%admin%' LIMIT 1`);
  const adminUserId = adminUserRes.rows[0]?.id || (await query(`SELECT id FROM users LIMIT 1`)).rows[0]?.id;
  const adminOrgId = adminUserRes.rows[0]?.organization_id || (await query(`SELECT id FROM organizations LIMIT 1`)).rows[0]?.id;

  if (!adminUserId) {
    console.log('⚠️ No users found to associate admin alerts and audit logs.');
    return;
  }

  // Seed sample System Alerts
  const alerts = [
    {
      title: 'Hazmat Pressure Excursion Warning',
      severity: 'CRITICAL',
      category: 'LOGISTICS',
      entity_type: 'SHIPMENT',
      entity_identifier: 'SHP-2026-004',
      message: 'Telematics alert: Tank pressure in SHP-2026-004 reached 22.4 bar, approaching high pressure threshold (25 bar). Route rerouting or chill-station check advised.',
    },
    {
      title: 'Facility Environmental License Expiring',
      severity: 'WARNING',
      category: 'VERIFICATION',
      entity_type: 'FACILITY',
      entity_identifier: 'FAC-DAHEJ-01',
      message: 'Facility industrial discharge permit #GJ-ENV-8842 expires in 22 days. Renewal document pending upload.',
    },
    {
      title: 'High Supply-Demand Deficit (Dahej Industrial Node)',
      severity: 'INFO',
      category: 'MARKETPLACE',
      entity_type: 'FACILITY',
      entity_identifier: 'NODE-DAHEJ-HUB',
      message: 'Dahej chemical cluster demand exceeds active spot supply by 1,450 tonnes/month. Supplier onboard recommended.',
    },
    {
      title: 'Discrepancy in Gas Assay Purity Report',
      severity: 'WARNING',
      category: 'VERIFICATION',
      entity_type: 'VERIFICATION_REQUEST',
      entity_identifier: 'VR-2026-092',
      message: 'Purity report VR-2026-092 lists 99.4% purity, but online sensor reads 98.9%. Secondary sampling recommended.',
    },
  ];

  for (const a of alerts) {
    await query(
      `INSERT INTO system_alerts (title, severity, category, entity_type, entity_identifier, message, is_resolved, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW() - (RANDOM() * INTERVAL '3 days'))
       ON CONFLICT DO NOTHING`,
      [a.title, a.severity, a.category, a.entity_type, a.entity_identifier, a.message]
    );
  }

  // Seed Audit Log entries
  const auditEntries = [
    {
      action: 'ADMIN_ORGANIZATION_VERIFIED',
      entity_type: 'ORGANIZATION',
      payload: { verification_level: 'ENTERPRISE_GOLD', status: 'VERIFIED' },
    },
    {
      action: 'ADMIN_USER_ROLE_ASSIGNED',
      entity_type: 'USER',
      payload: { role: 'VERIFIER', assignedBy: adminUserId },
    },
    {
      action: 'ADMIN_SHIPMENT_OVERRIDE',
      entity_type: 'SHIPMENT',
      payload: { shipmentNumber: 'SHP-2026-002', overrideReason: 'Driver rest period exemption approved by port authority.' },
    },
    {
      action: 'ADMIN_SECURITY_SESSION_REVOKED',
      entity_type: 'AUTH_SESSION',
      payload: { reason: 'Stale inactive session terminated during maintenance.' },
    },
  ];

  for (const entry of auditEntries) {
    await query(
      `INSERT INTO audit_logs (organization_id, user_id, actor_user_id, action, entity_type, new_values, ip_address, created_at)
       VALUES ($1, $2, $2, $3, $4, $5, '192.168.1.104', NOW() - (RANDOM() * INTERVAL '5 days'))`,
      [adminOrgId, adminUserId, entry.action, entry.entity_type, JSON.stringify(entry.payload)]
    );
  }

  console.log('✅ Admin Command Center Demo Data Seeded Successfully!');
}

if (require.main === module) {
  seedAdminDemo()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error seeding admin demo data:', err);
      process.exit(1);
    });
}
